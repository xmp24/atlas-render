# Corta cada toma de ElevenLabs en frases (las N-1 pausas más largas) -> mcd/voice/<id>.wav + mcd/voice.json (duración + boca)
import json, subprocess, os, sys
import numpy as np
R = '/home/claude/atlas-render/'; EL = os.path.expanduser('~/elN/')
P = json.load(open(R + 'mcd/plan.json'))
byid = {s['id']: s for s in P['segs']}
SR = 48000; HOP = 480  # 10 ms
os.makedirs(R + 'mcd/voice', exist_ok=True)

def load(fn):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', fn, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def save(fn, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', fn], input=x.astype(np.float32).tobytes())

def rms(x):
    n = len(x) // HOP
    return np.sqrt((x[:n * HOP].reshape(n, HOP) ** 2).mean(1) + 1e-12)

def trim(x, db=-40):
    e = rms(x); thr = e.max() * 10 ** (db / 20)
    on = e > thr
    # regiones con voz
    regs = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            regs.append([i, j]); i = j
        else: i += 1
    if not regs: return x
    # quita pegotes cortos (<150 ms) en los bordes separados por un hueco >= 60 ms
    while len(regs) > 1 and regs[0][1] - regs[0][0] < 15 and regs[1][0] - regs[0][1] >= 6: regs.pop(0)
    while len(regs) > 1 and regs[-1][1] - regs[-1][0] < 15 and regs[-1][0] - regs[-2][1] >= 6: regs.pop()
    a = max(0, regs[0][0] * HOP - 480); b = min(len(x), regs[-1][1] * HOP + 2400)
    y = x[a:b].copy()
    fi = int(0.008 * SR); fo = int(0.03 * SR)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    return y

def tighten(x, maxgap=0.32, db=-42):
    # acorta pausas largas con fundidos cruzados (sin cortes secos que suenen a 'trabado')
    e = rms(x); thr = e.max() * 10 ** (db / 20); sil = e < thr
    cuts = []; i = 0; lim = int(maxgap * 100)
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if j - i > lim and i > 0 and j < len(sil): cuts.append(((i + lim // 2) * HOP, (j - lim // 2) * HOP))
            i = j
        else: i += 1
    if not cuts: return x
    xf = int(0.02 * SR); out = x[:cuts[0][0]].copy(); prev = cuts[0][1]
    def join(a, b):
        if len(a) < xf or len(b) < xf: return np.concatenate([a, b])
        r = np.linspace(0, 1, xf); mid = a[-xf:] * (1 - r) + b[:xf] * r
        return np.concatenate([a[:-xf], mid, b[xf:]])
    for k in range(1, len(cuts)):
        out = join(out, x[prev:cuts[k][0]]); prev = cuts[k][1]
    return join(out, x[prev:])

def env30(x):
    # amplitud por fotograma (30 fps) en dígitos 0-9 para la boca
    hop = SR // 30; n = len(x) // hop
    e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
    e = e / (np.percentile(e, 95) + 1e-9)
    return ''.join(str(int(min(9, max(0, v * 7)))) for v in e)

def split(x, n):
    if n == 1: return [x]
    e = rms(x); thr = max(e.max() * 10 ** (-38 / 20), 1e-4)
    sil = e < thr
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
    return [x[pts[k]:pts[k + 1]] for k in range(n)], [g[0] * 10 for g in cuts], gaps[n - 1][0] * 10 if len(gaps) >= n else 0

import difflib, unicodedata, re
WORDS = json.load(open(EL + 'words.json'))
if os.path.exists(EL + 'words_f.json'): WORDS.update(json.load(open(EL + 'words_f.json')))
if os.path.exists(EL + 'words_n.json'): WORDS.update(json.load(open(EL + 'words_n.json')))
NBT = json.load(open(R + 'mcd/namebatch.json'))['texts'] if os.path.exists(R + 'mcd/namebatch.json') else {}
for _k, _v in NBT.items(): byid[_k] = {'id': _k, 'text': _v}
def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(ch for ch in w if unicodedata.category(ch) != 'Mn')
    w = re.sub(r'[^a-z0-9]', '', w)
    return {'malaui': 'malawi', 'zimbabue': 'zimbabwe', 'tayikistan': 'tajikistan', 'fiyi': 'fiji', 'catar': 'qatar', 'barein': 'bahrein', 'banglades': 'bangladesh', 'yibuti': 'djibouti', 'guineabisau': 'guinea', 'namibia': 'namidia', 'liechtenstein': 'lichtenstein'}.get(w, w)
NUM = {'1940': 'mil novecientos cuarenta'}
def toks(text):
    text = re.sub(r'\[[a-z ]+\]', '', text)
    return [norm(w) for w in text.split() if norm(w)]
def align(key, ids, x):
    wl = WORDS[key + '.wav']
    wt = [norm(w[2]) for w in wl]
    seq = []; owner = []
    for k, sid in enumerate(ids):
        for tkn in toks(byid[sid]['text']): seq.append(tkn); owner.append(k)
    sm = difflib.SequenceMatcher(None, seq, wt, autojunk=False)
    m = {}
    for a, b, n in sm.get_matching_blocks():
        for j in range(n): m[a + j] = b + j
    starts = []
    for k in range(len(ids)):
        idx = [i for i, o in enumerate(owner) if o == k]
        hit = next((m[i] for i in idx if i in m), None)
        off = idx.index(next(i for i in idx if i in m)) if hit is not None else 0
        starts.append((hit, off))
    e = rms(x); cut = []
    for k in range(len(ids)):
        h, off = starts[k]
        if h is None: cut.append(None); continue
        t0 = wl[max(0, h - off)][0] if off == 0 else wl[h][0] - 0.25 * off
        cut.append(t0)
    # rellena huecos por interpolación
    for k in range(len(cut)):
        if cut[k] is None:
            a = max([j for j in range(k) if cut[j] is not None], default=None); b = min([j for j in range(k + 1, len(cut)) if cut[j] is not None], default=None)
            print('   SIN ALINEAR', ids[k], byid[ids[k]]['text'][:40])
            cut[k] = (cut[a] + cut[b]) / 2 if a is not None and b is not None else (cut[a] + 1 if a is not None else 0)
    # corta solo donde hay un silencio real (>= 0.12 s) entre la última palabra de una frase y la primera de la siguiente;
    # si no lo hay, las frases van juntas en un mismo clip y se guarda el desfase de cada una (para sincronizar el país)
    thr = e.max() * 10 ** (-34 / 20)
    groups = [[0]]; cutpts = [0]
    for k in range(1, len(ids)):
        t1 = cut[k]
        prev_end = max([w[1] for w in wl if w[1] <= t1 + 0.02], default=t1 - 0.3)
        a = int(max(0, min(prev_end, t1) - 0.1) * 100); b = int((t1 + 0.12) * 100)
        sil = e[a:b] < thr; best = (0, 0); i = 0
        while i < len(sil):
            if sil[i]:
                j = i
                while j < len(sil) and sil[j]: j += 1
                if j - i > best[1] - best[0]: best = (i, j)
                i = j
            else: i += 1
        if best[1] - best[0] >= 12:
            cutpts.append((a + (best[0] + best[1]) // 2) * HOP); groups.append([k]); continue
        # sin silencio claro: busca una caída real de energía entre las dos palabras
        a2 = int((t1 - 0.28) * 100); b2 = int((t1 + 0.08) * 100); w2 = e[a2:b2]
        voiced = e[e > thr]; med = np.median(voiced) if len(voiced) else 1
        if len(w2) and w2.min() < 0.12 * med:
            i0 = int(np.argmin(w2)); cutpts.append((a2 + i0) * HOP); groups.append([k])
        else:
            groups[-1].append(k)
    cutpts.append(len(x))
    res = []
    for gi, g in enumerate(groups):
        a, b = cutpts[gi], cutpts[gi + 1]
        subs = [(ids[k], max(0.0, cut[k] - a / SR)) for k in g]
        res.append((x[a:b], subs))
    return res

out = {}
jobs = [dict(key='INTRO0', file='intro0.mp3', ids=['intro0'])] + [dict(key=b['key'], file=b['key'] + '.mp3', ids=b['ids']) for b in P['batches']]
FX = R + 'mcd/fixbatch.json'
if os.path.exists(EL + 'NARRF.mp3') and os.path.exists(EL + 'words_f.json'):
    jobs.append(dict(key='NARRF', file='NARRF.mp3', ids=json.load(open(FX))['ids']))  # sustituye a las enumeraciones antiguas
if os.path.exists(EL + 'NARRN.mp3') and os.path.exists(EL + 'words_n.json'):
    jobs.append(dict(key='NARRN', file='NARRN.mp3', ids=json.load(open(R + 'mcd/namebatch.json'))['ids']))  # un nombre por país
for jb in jobs:
    x = load(EL + jb['file']); n = len(jb['ids'])
    if n == 1: parts = [(x, [(jb['ids'][0], 0.0)])]; info = ''
    else:
        parts = align(jb['key'], jb['ids'], x); info = f'alineado con Whisper: {n} frases -> {len(parts)} clips'
    print(jb['key'], n, info)
    for p, subs in parts:
        sid = subs[0][0]
        # recorte suave: solo al principio y al final (dentro de los clips agrupados no se toca nada)
        e0 = rms(p); thr0 = e0.max() * 10 ** (-40 / 20); on = np.where(e0 > thr0)[0]
        lead = max(0, on[0] * HOP - 480) if len(on) else 0
        y = trim(p) if len(subs) > 1 else tighten(trim(p)); d = len(y) / SR
        sub_off = [[s_, round(max(0.0, o - lead / SR), 3)] for s_, o in subs]
        for s_, o in subs[1:]: out[s_] = dict(merged=sid)
        save(R + f'mcd/voice/{sid}.wav', y)
        txt = byid[sid]['text']; cps = len(txt) / d
        flag = '  <-- REVISAR' if cps < 7 or cps > 24 else ''
        if flag or n > 1 and jb['key'].startswith('NARR') and False: pass
        if flag: print(f'   {sid} {d:.2f}s {cps:.1f} c/s {txt[:50]}{flag}')
        out[sid] = dict(dur=round(d, 3), env=env30(y), subs=sub_off)
json.dump(out, open(R + 'mcd/voice.json', 'w'))
print('frases', len(out))

# toma corregida de L22/L33 (cortes fijos en sus pausas)
if os.path.exists(EL + 'NARRF2.mp3'):
    x = load(EL + 'NARRF2.mp3'); V2 = json.load(open(R + 'mcd/voice.json'))
    gaps = [(0.93, 0.31), (2.04, 0.31), (5.94, 0.65), (7.37, 0.44), (8.78, 0.33), (9.99, 0.41), (11.22, 0.32), (12.52, 0.28)]
    pts = [0] + [int((a + d / 2) * SR) for a, d in gaps] + [len(x)]
    for k, sid in enumerate(['L22_0', 'L22_1', 'L22_2', 'L33_0', 'L33_1', 'L33_2', 'L33_3', 'L33_4', 'L33_5']):
        y = tighten(trim(x[pts[k]:pts[k + 1]])); save(R + f'mcd/voice/{sid}.wav', y)
        V2[sid] = dict(dur=round(len(y) / SR, 3), env=env30(y), subs=[[sid, 0.0]])
    json.dump(V2, open(R + 'mcd/voice.json', 'w'))

# presentaciones del narrador para los países que hablan (cortes fijos en sus pausas)
TI = ['US', 'CA', 'SM', 'IS', 'RU', 'BO', 'CU', 'BB', 'AM', 'IR', 'IN', 'LK', 'KP', 'NG', 'VA']
TIT = ['Empezamos: ¡Estados Unidos!', 'Canadá...', 'San Marino...', 'Islandia...', 'Rusia...', 'Bolivia...', 'Cuba...', 'Barbados...', 'Armenia...', 'Irán...', 'India...', 'Sri Lanka...', 'Corea del Norte...', 'Nigeria...', '¡El Vaticano!']
if os.path.exists(EL + 'NARRT.mp3'):
    x = load(EL + 'NARRT.mp3'); V3 = json.load(open(R + 'mcd/voice.json'))
    gaps = [(2.47, 0.41), (3.45, 0.48), (4.8, 0.5), (6.11, 0.53), (7.32, 0.57), (8.59, 0.53), (9.56, 0.46), (10.89, 0.42), (12.03, 0.55), (13.16, 0.52), (14.24, 0.47), (15.48, 0.48), (17.0, 0.47), (18.16, 0.43)]
    pts = [0] + [int((a + d / 2) * SR) for a, d in gaps] + [len(x)]
    for k, c in enumerate(TI):
        y = trim(x[pts[k]:pts[k + 1]]); save(R + f'mcd/voice/T_{c}.wav', y)
        V3['T_' + c] = dict(dur=round(len(y) / SR, 3), env=env30(y), subs=[['T_' + c, 0.0]])
        print('T_' + c, round(len(y) / SR, 2))
    json.dump(V3, open(R + 'mcd/voice.json', 'w'))
    nb = json.load(open(R + 'mcd/namebatch.json')); nb['talk_intro'] = {'T_' + c: t for c, t in zip(TI, TIT)}
    json.dump(nb, open(R + 'mcd/namebatch.json', 'w'), ensure_ascii=False, indent=0)
