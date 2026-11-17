"""Pueblo Brum ep1 V2 (1 min): música Kevin MacLeod por secciones + efectos + voces elegidas.
Uso: python3 ep2_audio.py  (lee src/vo.json y audio/vo_sel.json)"""
import numpy as np, soundfile as sf, json, subprocess, os
from scipy.signal import butter, sosfilt, oaconvolve, resample_poly

SR = 48000; DUR = 60.0; N = int(SR * DUR)
MUS = '/home/claude/music'
rng = np.random.default_rng(3)
mus = np.zeros((2, N)); sfx = np.zeros((2, N)); vo = np.zeros((2, N))
def tt(d): return np.arange(int(SR * d)) / SR
def filt(x, kind, f, o=2):
    ny = SR / 2
    if kind == 'band': return sosfilt(butter(o, [f[0] / ny, f[1] / ny], 'band', output='sos'), x)
    return sosfilt(butter(o, f / ny, kind, output='sos'), x)
def add(buf, t0, x, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if x.ndim == 2:
        L = min(x.shape[1], N - i)
        if L > 0: buf[:, i:i + L] += x[:, :L] * g
        return
    L = min(len(x), N - i)
    if L <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.414, np.sin((pan + 1) * np.pi / 4) * 1.414
    buf[0, i:i + L] += x[:L] * g * l; buf[1, i:i + L] += x[:L] * g * r

_cache = {}
def track(name):
    if name not in _cache:
        tmp = f'/tmp/{abs(hash(name))}.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{MUS}/{name}.mp3', '-ar', str(SR), '-ac', '2', tmp], check=True)
        a, _ = sf.read(tmp); _cache[name] = a.T
    return _cache[name]
def first_loud(a, thr=0.6):
    e = np.sqrt(np.convolve(a.mean(0) ** 2, np.ones(SR // 10) / (SR // 10), 'same'))
    ref = np.percentile(e, 80)
    idx = np.where(e > thr * ref)[0]
    return idx[0] / SR if len(idx) else 0.0
def section(name, t0, t1, off=None, g=1.0, fin=0.06, fout=0.18):
    a = track(name)
    if off is None: off = first_loud(a)
    seg = a[:, int(off * SR): int(off * SR) + int((t1 - t0 + fout) * SR)].copy()
    n = seg.shape[1]
    env = np.minimum(1, np.arange(n) / (SR * fin)) * np.minimum(1, (n - np.arange(n)) / (SR * fout))
    seg *= env
    rms = np.sqrt(np.mean(seg ** 2)) + 1e-9
    add(mus, t0, seg * (0.12 / rms) * g)

VOT = json.load(open('src/vo.json'))
S = lambda k: VOT[k]['t']
E = lambda k: VOT[k]['t'] + VOT[k]['d']
K = dict(land=4.0, pums=[11.8, 12.5, 13.2], lid=14.0, open=14.3, wake=25.6, hero=30.2, naranja=36.8, bonk=39.8,
         rev=43.2, go=43.8, m2=45.3, m3=46.8, m4=48.3, m5=49.6, stop=51.0, door=53.5, help=S('x1'))

# ---------------- MÚSICA (cambia en cada beat de la historia) ----------------
section('Hyperfun', 0.0, 11.2, g=1.0)
section('Sneaky Snitch', 11.2, K['wake'], g=0.8)
section('Monkeys Spinning Monkeys', K['wake'], S('b2') - 0.1, g=1.0)
section('Heroic Age', S('b2') - 0.1, S('n8'), g=1.0)
section('Happy Happy Game Show', S('n8'), S('b4'), g=0.9)
section('Fluffing a Duck', S('b4'), K['go'], g=1.0)
section('Pixel Peeker Polka - faster', K['go'], K['stop'], g=1.05)
section('Investigations', K['stop'], K['help'], g=0.85)
section('Run Amok', K['help'], DUR, g=1.0)

# ---------------- EFECTOS ----------------
def thump(f0=90, d=0.5, g=1.0):
    t = tt(d); f = f0 * np.exp(-t * 6) + 35
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    n = filt(rng.standard_normal(len(t)), 'low', 900) * np.exp(-t * 20) * 0.4
    return (x + n) * g
def whoosh(d=0.5, lo=400, hi=3000, g=0.25):
    n = filt(rng.standard_normal(int(SR * d)), 'band', (lo, hi)); return n * np.sin(np.linspace(0, np.pi, len(n))) ** 2 * g
def boing(d=0.6, f0=260, up=380, g=0.5):
    t = tt(d); f = f0 + up * np.exp(-t * 4) + 25 * np.sin(2 * np.pi * 14 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * g
def ding(f=1568, d=1.4, g=0.3):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 3) * g
def blip(f0=600, f1=1200, d=0.2, g=0.2):
    t = tt(d); return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.exp(-t * 10) * g
def honk(t0, n=2):
    for k in range(n):
        t = tt(0.15); x = np.sign(np.sin(2 * np.pi * 523 * t)) * 0.5 + np.sin(2 * np.pi * 784 * t) * 0.4
        add(sfx, t0 + k * 0.19, filt(x, 'low', 3000) * np.minimum(1, t / 0.01) * np.minimum(1, (0.15 - t) / 0.03) * 0.28)
def gliss(t0, up=True, g=0.12):
    for i in range(14):
        f = 523 * 2 ** ((i if up else 13 - i) / 7)
        t = tt(0.8); add(sfx, t0 + i * 0.03, np.sin(2 * np.pi * f * t) * np.exp(-t * 5) * g, pan=-0.5 + i * 0.07)

add(sfx, 0.0, whoosh(4.0, 300, 1500, 0.10))  # caída
add(sfx, K['land'], thump(70, 0.8, 1.2), 1.0)
add(sfx, K['land'], whoosh(0.4, 100, 800, 0.4))
for i in range(11): add(sfx, 5.3 + i * 0.05 + 0.15, blip(700 + i * 50, 1300 + i * 60, 0.15, 0.18), pan=-0.6 + i * 0.12)
add(sfx, 5.3, ding(2093, 1.2, 0.25))
for tt0 in (6.6, 8.1, 9.6): add(sfx, tt0, whoosh(0.5, 600, 4000, 0.18))
for k, p in enumerate(K['pums']): add(sfx, p, thump(120, 0.45, 1.0), 0.7 + 0.25 * k)
add(sfx, K['lid'], boing(), 1.0); gliss(K['lid'] + 0.05)
for p in (14.62, 14.95, 15.15): add(sfx, p, thump(150, 0.3, 0.6), 0.5)
for k in range(6):  # ronquiditos
    tb = 15.6 + k * 2.0
    if tb > S('c1') - 0.5: break
    n = filt(rng.standard_normal(int(SR * 1.0)), 'band', (250, 900)); n *= np.sin(np.linspace(0, np.pi, len(n))) ** 2 * 0.06
    add(sfx, tb, n)
for k, c in enumerate([S('c1'), S('c2'), S('c3')]): add(sfx, c, ding([1047, 1319, 1568][k], 1.0, 0.25)); add(sfx, c, whoosh(0.25, 800, 5000, 0.12))
add(sfx, K['wake'], thump(220, 0.25, 0.7)); add(sfx, K['wake'] + 0.02, filt(rng.standard_normal(int(SR * 0.3)), 'high', 1500) * np.exp(-tt(0.3) * 22) * 0.6)
gliss(K['wake'], True, 0.14); honk(K['wake'] + 0.25)
add(sfx, K['wake'] + 0.62, thump(90, 0.4, 0.9))
add(sfx, S('b1') + 0.1, boing(0.4, 500, 300, 0.2))
add(sfx, K['hero'], whoosh(1.0, 500, 5000, 0.25)); add(sfx, K['hero'] + 0.6, ding(2637, 1.5, 0.18))
for i in range(int((K['naranja'] - S('n9') - 0.2) / 0.25)): add(sfx, S('n9') + 0.2 + i * 0.25, blip(1200, 1200, 0.06, 0.15))
add(sfx, K['naranja'], ding(1568, 1.6, 0.35)); gliss(K['naranja'], True, 0.12); add(sfx, K['naranja'], boing(0.35, 500, 400, 0.25))
add(sfx, K['bonk'] - 0.6, whoosh(0.6, 1500, 6000, 0.12))
add(sfx, K['bonk'], thump(300, 0.25, 0.9)); add(sfx, K['bonk'], boing(0.8, 180, 600, 0.45))
for i in range(5): add(sfx, K['bonk'] + 0.15 + i * 0.16, ding(2600 + i * 200, 0.3, 0.06))
# motor: brum brum + salida
d = K['go'] - K['rev'] + 0.5; t = tt(d)
fe = 50 + 30 * (np.exp(-((t - 0.2) / 0.15) ** 2) + np.exp(-((t - 0.6) / 0.15) ** 2)) + 20 * t / d
ph = 2 * np.pi * np.cumsum(fe) / SR
eng = (np.sign(np.sin(ph)) * 0.3 + np.sin(2 * ph) * 0.3) * np.minimum(1, t / 0.05)
add(sfx, K['rev'], filt(eng, 'low', 900) * 0.45)
t = tt(0.5); add(sfx, K['go'], filt(rng.standard_normal(len(t)), 'band', (2000, 5000)) * np.exp(-t * 6) * 0.15)  # chirrido de ruedas
add(sfx, K['go'], whoosh(0.8, 300, 3000, 0.35))
d = K['stop'] - K['go']; t = tt(d)
fe = 70 + 35 * np.minimum(1, t / 1.0) + 8 * np.sin(2 * np.pi * 0.7 * t)
eng = np.sign(np.sin(2 * np.pi * np.cumsum(fe) / SR)) * 0.25 + np.sin(4 * np.pi * np.cumsum(fe) / SR) * 0.2
add(sfx, K['go'], filt(eng, 'low', 1100) * 0.3 * np.minimum(1, (d - t) / 0.4))
for tt0 in (K['m2'], K['m3'], K['m4'], K['m5']): add(sfx, tt0, whoosh(0.45, 700, 5000, 0.25))
add(sfx, K['m3'] + 0.5, boing(0.5, 300, 300, 0.2)); add(sfx, K['m3'] + 0.85, thump(90, 0.35, 0.7))
honk(K['m4'] + 0.55, 2)
t = tt(0.7); add(sfx, K['m5'] + 0.4, filt(rng.standard_normal(len(t)), 'band', (2500, 4500)) * np.exp(-t * 3) * 0.16)  # derrape
add(sfx, K['door'], ding(1318, 1.6, 0.3)); gliss(K['door'], True, 0.1)
t = tt(0.8); add(sfx, K['door'], filt(rng.standard_normal(len(t)), 'band', (600, 3000)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 30 * t))) * np.sin(np.pi * t / 0.8) * 0.12)
add(sfx, K['help'], filt(rng.standard_normal(int(SR * 0.25)), 'high', 1000) * np.exp(-tt(0.25) * 12) * 0.2)
add(sfx, K['help'] + 0.25, whoosh(0.5, 500, 4000, 0.3))
honk(S('b9') + 0.05, 1)

# ---------------- VOZ ----------------
sel = json.load(open('audio/vo_sel.json'))
duck = np.zeros(N)
for k, f in sel.items():
    a, sr = sf.read(f)
    if a.ndim > 1: a = a.mean(1)
    a = resample_poly(a, SR, sr) if sr != SR else a
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 200):nz[-1] + 800]
    a = a / (np.max(np.abs(a)) + 1e-9) * 0.9
    a = a + 0.2 * filt(a, 'high', 3500)
    t0 = S(k)
    add(vo, t0, a, 1.0)
    i0, i1 = int((t0 - 0.1) * SR), int((t0 + len(a) / SR + 0.15) * SR)
    duck[max(0, i0):min(N, i1)] = 1
duck = np.convolve(duck, np.ones(SR // 10) / (SR // 10), 'same')

ir_t = tt(1.2)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 4) for _ in range(2)]) * 0.035
ir[:, :int(SR * 0.01)] = 0
for c in range(2):
    sfx[c] += oaconvolve(sfx[c], ir[c])[:N] * 0.4
    vo[c] += oaconvolve(vo[c], ir[c])[:N] * 0.08
mix = mus * (0.7 * (1 - 0.55 * duck)) + sfx * 0.9 + vo * 1.15
rms = np.sqrt(np.mean(mix ** 2)); mix *= 10 ** (-14.5 / 20) / rms
mix = np.tanh(mix * 1.2) / 1.2
mix *= 0.97 / np.max(np.abs(mix))
mix *= np.minimum(1, np.arange(N) / (SR * 0.01)) * np.minimum(1, (N - np.arange(N)) / (SR * 0.3))
sf.write('audio/ep2_v2.wav', mix.T.astype(np.float32), SR)
print('ok rms', 20 * np.log10(np.sqrt(np.mean(mix ** 2))))
