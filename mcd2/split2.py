# Corta cada toma por sus [pause] (N-1 silencios más largos) -> mcd2/voice/<key>/<id>.wav + voice_<key>.json
import json, subprocess, os, sys
import numpy as np
R = '/home/claude/atlas-render/mcd2/'; EL = os.path.expanduser('~/el2/')
SR = 48000; HOP = 480

def load(fn):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', fn, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def save(fn, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', fn], input=x.astype(np.float32).tobytes())
def rms(x):
    n = len(x) // HOP; return np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)

def trim(x, db=-40):
    e = rms(x); on = e > e.max() * 10 ** (db / 20)
    idx = np.where(on)[0]
    if not len(idx): return x
    # quita pegotes de <150 ms en los bordes
    regs = []; i = idx[0]; s = i
    for k in idx[1:]:
        if k != i + 1: regs.append([s, i + 1]); s = k
        i = k
    regs.append([s, i + 1])
    while len(regs) > 1 and regs[0][1] - regs[0][0] < 15 and regs[1][0] - regs[0][1] >= 6: regs.pop(0)
    while len(regs) > 1 and regs[-1][1] - regs[-1][0] < 15 and regs[-1][0] - regs[-2][1] >= 6: regs.pop()
    a = max(0, regs[0][0] * HOP - 480); b = min(len(x), regs[-1][1] * HOP + 2400)
    y = x[a:b].copy(); fi = int(0.008 * SR); fo = int(0.03 * SR)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    return y

def tighten(x, maxgap=0.3, db=-42):
    e = rms(x); sil = e < e.max() * 10 ** (db / 20)
    cuts = []; i = 0; lim = int(maxgap * 100)
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if j - i > lim and i > 0 and j < len(sil): cuts.append(((i + lim // 2) * HOP, (j - lim // 2) * HOP))
            i = j
        else: i += 1
    if not cuts: return x
    xf = int(0.02 * SR)
    def join(a, b):
        if len(a) < xf or len(b) < xf: return np.concatenate([a, b])
        r = np.linspace(0, 1, xf); return np.concatenate([a[:-xf], a[-xf:] * (1 - r) + b[:xf] * r, b[xf:]])
    out = x[:cuts[0][0]].copy(); prev = cuts[0][1]
    for k in range(1, len(cuts)): out = join(out, x[prev:cuts[k][0]]); prev = cuts[k][1]
    return join(out, x[prev:])

def env30(x):
    hop = SR // 30; n = len(x) // hop
    e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)); e = e / (np.percentile(e, 95) + 1e-9)
    return ''.join(str(int(min(9, max(0, v * 7)))) for v in e)

def split(x, n):
    if n == 1: return [x], [], 0
    e = rms(x); thr = max(e.max() * 10 ** (-38 / 20), 1e-4); sil = e < thr
    gaps = []; i = 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if i > 5 and j < len(sil) - 5: gaps.append((j - i, i, j))
            i = j
        else: i += 1
    gaps.sort(reverse=True)
    if len(gaps) < n - 1: raise SystemExit(f'pocas pausas: {len(gaps)} < {n-1}')
    cuts = sorted(gaps[:n - 1], key=lambda g: g[1])
    pts = [0] + [((a + b) // 2) * HOP for _, a, b in cuts] + [len(x)]
    return [x[pts[k]:pts[k + 1]] for k in range(n)], [g[0] * 10 for g in cuts], (gaps[n - 1][0] * 10 if len(gaps) >= n else 0)

if __name__ == '__main__':
    key = sys.argv[1]
    B = json.load(open(R + 'batches.json'))[key]
    S = json.load(open(R + f'{key}_script.json'))
    txt = {('N_' + c['c']): c['say'] for c in S['C']}
    out = {}; os.makedirs(R + f'voice/{key}', exist_ok=True)
    for b in B:
        x = load(EL + b['id'] + '.mp3')
        parts, chosen, nxt = split(x, len(b['ids']))
        if chosen:
            print(f"{b['id']:10s} n={len(b['ids']):2d} pausa mín elegida {min(chosen)} ms · siguiente {nxt} ms {'OK' if min(chosen) > nxt * 1.25 else '<<< DUDOSO'}")
        for sid, p in zip(b['ids'], parts):
            y = tighten(trim(p)); save(R + f'voice/{key}/{sid}.wav', y)
            out[sid] = dict(dur=round(len(y) / SR, 3), env=env30(y))
    # comprobación: duración por carácter (detecta cortes desplazados)
    bad = []
    for sid, v in out.items():
        if sid in txt:
            cps = len(txt[sid]) / max(v['dur'], 0.1)
            if cps > 24 or cps < 8: bad.append((sid, round(v['dur'], 2), round(cps, 1)))
    print('sospechosos', bad)
    json.dump(out, open(R + f'voice_{key}.json', 'w'))
    print('total voz', round(sum(v['dur'] for v in out.values()) / 60, 2), 'min')

# ---------------- modo guiado por Whisper ----------------
import difflib, unicodedata, re
def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(ch for ch in w if unicodedata.category(ch) != 'Mn')
    w = re.sub(r'[^a-z0-9]', '', w)
    return ALIAS.get(w, w)
ALIAS = {'belize': 'belice', 'iraq': 'irak', 'comoros': 'comoras', 'visau': 'bisau', 'qatar': 'catar', 'bahrein': 'barein', 'rwanda': 'ruanda', 'malawi': 'malaui', 'zimbabwe': 'zimbabue', 'tajikistan': 'tayikistan', 'fiji': 'fiyi', 'djibouti': 'yibuti', 'bangladesh': 'banglades', 'guineabissau': 'guineabisau', 'botswana': 'botsuana', 'eswatini': 'esuatini', 'butan': 'butan', 'bhutan': 'butan', 'emiratos': 'emiratos', 'gambia': 'gambia', 'lesotho': 'lesoto', 'kirguizistan': 'kirguistan', 'kazajstan': 'kazajistan', 'zambia': 'zambia', 'uganda': 'uganda'}
def gaps_of(x, min_ms=60):
    e = rms(x); thr = max(e.max() * 10 ** (-38 / 20), 1e-4); sil = e < thr
    out = []; i = 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if j - i >= min_ms // 10 and i > 3: out.append((i * HOP / SR, j * HOP / SR))
            i = j
        else: i += 1
    return out
def split_guided(x, texts, words):
    # tokens del guion con índice de pieza
    toks = []; owner = []
    for k, t in enumerate(texts):
        for w in t.replace('-', ' ').split():
            n = norm(w)
            if n: toks.append(n); owner.append(k)
    ww = [norm(w[2]) for w in words]
    sm = difflib.SequenceMatcher(None, toks, ww, autojunk=False)
    t2w = {}
    for a, b, size in sm.get_matching_blocks():
        for q in range(size): t2w[a + q] = b + q
    first = {}
    for ti, k in enumerate(owner):
        if k not in first: first[k] = ti
    G = gaps_of(x); cuts = []; info = []
    for k in range(1, len(texts)):
        ti = first[k]
        # primera palabra emparejada de la pieza k (o la siguiente que lo esté)
        wi = None
        for q in range(ti, min(ti + 4, len(toks))):
            if q in t2w and owner[q] == k: wi = t2w[q]; break
        if wi is None: info.append((k, 'sin ancla')); est = None
        else: est = words[wi][0]
        prev_end = words[wi - 1][1] if wi else 0
        if est is None:
            cuts.append(None); continue
        cand = [g for g in G if g[1] >= prev_end - 0.25 and g[0] <= est + 0.8 and (not cuts or cuts[-1] is None or g[0] > cuts[-1])]
        if cand:
            g = max(cand, key=lambda g: (g[1] - g[0]) - 0.6 * abs((g[0] + g[1]) / 2 - (est - 0.05)))
            cuts.append((g[0] + g[1]) / 2)
        else:
            cuts.append(est - 0.03); info.append((k, 'sin silencio'))
    # rellena anclas perdidas repartiendo por caracteres
    for k, c in enumerate(cuts):
        if c is None:
            a = cuts[k - 1] if k else 0
            nxt = [j for j in range(k + 1, len(cuts)) if cuts[j] is not None]
            b = cuts[nxt[0]] if nxt else len(x) / SR
            nmiss = (nxt[0] if nxt else len(cuts)) - k   # cortes perdidos seguidos
            inside = sorted([g for g in G if g[0] > a + 0.3 and g[1] < b - 0.3], key=lambda g: g[0] - g[1])[:nmiss]
            inside = sorted(inside)
            cuts[k] = (inside[0][0] + inside[0][1]) / 2 if inside else (a + b) / 2
    pts = [0] + [int(c * SR) for c in cuts] + [len(x)]
    return [x[pts[k]:pts[k + 1]] for k in range(len(texts))], info

def run_guided(key, ids_only=None):
    B = json.load(open(R + 'batches.json'))[key]
    WD = json.load(open(os.path.expanduser('~/el2/words.json')))
    out = json.load(open(R + f'voice_{key}.json'))
    for b in B:
        if b['id'] + '.wav' not in WD or (ids_only and b['id'] not in ids_only): continue
        texts = b['text'].split(' [pause] ')
        x = load(EL + b['id'] + '.mp3')
        parts, info = split_guided(x, texts, WD[b['id'] + '.wav'])
        if info: print(b['id'], info)
        for sid, p in zip(b['ids'], parts):
            y = tighten(trim(p)); save(R + f'voice/{key}/{sid}.wav', y)
            out[sid] = dict(dur=round(len(y) / SR, 3), env=env30(y))
    json.dump(out, open(R + f'voice_{key}.json', 'w'))
    S = json.load(open(R + f'{key}_script.json')); txt = {('N_' + c['c']): c['say'] for c in S['C']}
    bad = [(s, out[s]['dur'], round(len(txt[s]) / out[s]['dur'], 1)) for s in txt if not 9 < len(txt[s]) / out[s]['dur'] < 22]
    print(key, 'sospechosos', bad, 'total', round(sum(v['dur'] for v in out.values()) / 60, 2), 'min')

def speedup(key, f):
    out = json.load(open(R + f'voice_{key}.json'))
    for sid in out:
        if sid.startswith('S_'): continue
        fn = R + f'voice/{key}/{sid}.wav'
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', fn, '-af', f'atempo={f}', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
        y = np.frombuffer(raw, np.float32).copy(); save(fn, y)
        out[sid] = dict(dur=round(len(y) / SR, 3), env=env30(y))
    json.dump(out, open(R + f'voice_{key}.json', 'w'))
