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
    on = np.where(e > thr)[0]
    if not len(on): return x
    a = max(0, on[0] * HOP - 480); b = min(len(x), (on[-1] + 1) * HOP + 2400)
    y = x[a:b].copy()
    fi = int(0.008 * SR); fo = int(0.024 * SR)
    y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
    return y

def tighten(x, maxgap=0.28, db=-36):
    e = rms(x); thr = e.max() * 10 ** (db / 20); sil = e < thr
    keep = np.ones(len(x), bool); i = 0; lim = int(maxgap * 100)
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if j - i > lim and i > 0 and j < len(sil):
                a = (i + lim // 2) * HOP; b = (j - lim // 2) * HOP; keep[a:b] = False
            i = j
        else: i += 1
    return x[keep]

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
def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(ch for ch in w if unicodedata.category(ch) != 'Mn')
    w = re.sub(r'[^a-z0-9]', '', w)
    return {'malaui': 'malawi', 'zimbabue': 'zimbabwe', 'tayikistan': 'tajikistan', 'fiyi': 'fiji'}.get(w, w)
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
    pts = [0]
    for k in range(1, len(ids)):
        # mínimo de energía en los 0,6 s antes del inicio de la frase k (pero después del final de la palabra anterior)
        t1 = cut[k]; prev_end = max([w[1] for w in wl if w[1] <= t1 + 0.02], default=t1 - 0.3)
        a = int(max(prev_end, t1 - 0.6) * 100); b = max(a + 1, int(t1 * 100))
        seg = e[a:b]
        pts.append((a + int(np.argmin(seg))) * HOP if len(seg) else int(t1 * SR))
    pts.append(len(x))
    return [x[pts[k]:pts[k + 1]] for k in range(len(ids))]

out = {}
jobs = [dict(key='INTRO0', file='intro0.mp3', ids=['intro0'])] + [dict(key=b['key'], file=b['key'] + '.mp3', ids=b['ids']) for b in P['batches']]
for jb in jobs:
    x = load(EL + jb['file']); n = len(jb['ids'])
    if n == 1: parts = [x]; info = ''
    else:
        parts = align(jb['key'], jb['ids'], x); info = 'alineado con Whisper'
    print(jb['key'], n, info)
    for sid, p in zip(jb['ids'], parts):
        y = tighten(trim(p)); d = len(y) / SR
        save(R + f'mcd/voice/{sid}.wav', y)
        txt = byid[sid]['text']; cps = len(txt) / d
        flag = '  <-- REVISAR' if cps < 7 or cps > 24 else ''
        if flag or n > 1 and jb['key'].startswith('NARR') and False: pass
        if flag: print(f'   {sid} {d:.2f}s {cps:.1f} c/s {txt[:50]}{flag}')
        out[sid] = dict(dur=round(d, 3), env=env30(y))
json.dump(out, open(R + 'mcd/voice.json', 'w'))
print('frases', len(out))
