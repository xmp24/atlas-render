"""Pueblo Brum - Episodio 1 (primer minuto): música, efectos y mezcla con la voz."""
import numpy as np, soundfile as sf, json, sys
from scipy.signal import butter, sosfilt, oaconvolve, resample_poly

SR = 48000
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 60.0
VO = '/home/claude/brumaudio'
N = int(SR * DUR)
rng = np.random.default_rng(7)
mus = np.zeros((2, N)); sfx = np.zeros((2, N)); vo = np.zeros((2, N))

def tt(d): return np.arange(int(SR * d)) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def filt(x, kind, f, o=2):
    ny = SR / 2
    if kind == 'band': return sosfilt(butter(o, [f[0] / ny, f[1] / ny], 'band', output='sos'), x)
    return sosfilt(butter(o, f / ny, kind, output='sos'), x)
def add(buf, t0, x, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(x) <= 0: return
    if i < 0: x = x[-i:]; i = 0
    x = x[: N - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(x)] += x * g * l * 1.414; buf[1, i:i + len(x)] += x * g * r * 1.414

# ---------------- instrumentos ----------------
def pluck(f, d=0.9, bright=1.0):  # ukelele: armónicos que decaen más rápido arriba
    t = tt(d); x = np.zeros_like(t)
    for h in range(1, 9):
        if f * h > 12000: break
        x += (1 / h ** 1.1) * np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (3.2 + h * 2.2 / bright))
    x *= np.minimum(1, t / 0.003)
    return x * 0.5
def mallet(f, d=1.2, soft=False):  # glockenspiel / caja de música
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * (2.6 if soft else 3.5))
    x += 0.35 * np.sin(2 * np.pi * f * 2.756 * t) * np.exp(-t * 9)
    x += 0.12 * np.sin(2 * np.pi * f * 5.404 * t) * np.exp(-t * 16)
    return x * np.minimum(1, t / 0.002) * 0.45
def bass(f, d=0.45):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)
    return x * np.exp(-t * 4.5) * np.minimum(1, t / 0.01) * 0.6
def pad(fs, d, att=1.0):
    t = tt(d); x = np.zeros_like(t)
    for f in fs:
        for det in (-0.6, 0.6):
            x += np.sin(2 * np.pi * (f + det) * t) + 0.25 * np.sin(4 * np.pi * (f + det) * t)
    env = np.minimum(1, t / att) * np.minimum(1, (d - t) / 0.8)
    return filt(x, 'low', 2500) * env * 0.06
def shaker(d=0.07):
    x = rng.standard_normal(int(SR * d)); x = filt(x, 'high', 6000)
    return x * np.exp(-np.arange(len(x)) / SR * 60) * 0.12
def wood(f=900, d=0.12):
    t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 45) * 0.5
def thump(f0=90, d=0.5, g=1.0):
    t = tt(d); f = f0 * np.exp(-t * 6) + 35
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 7)
    n = filt(rng.standard_normal(len(t)), 'low', 900) * np.exp(-t * 20) * 0.4
    return (x + n) * g

CH = {'C': [60, 64, 67], 'G': [59, 62, 67], 'Am': [57, 60, 64], 'F': [57, 60, 65], 'Dm': [57, 62, 65], 'E': [56, 59, 64]}
ROOT = {'C': 48, 'G': 43, 'Am': 45, 'F': 41, 'Dm': 50, 'E': 40}
BEAT = 0.5  # 120 bpm

def groove(t0, t1, prog=('C', 'G', 'Am', 'F'), energy=1.0, glock=None):
    bar = 0; t = t0
    while t < t1 - 0.01:
        ch = prog[bar % len(prog)]
        for e in range(8):  # corcheas
            tb = t + e * BEAT / 2
            if tb >= t1: break
            # rasgueo de ukelele: abajo en 0,3,5,6 (patrón isla)
            if e in (0, 3, 5, 6) or (energy > 1.1 and e in (2, 7)):
                for k, n in enumerate(CH[ch]):
                    add(mus, tb + k * 0.012 * (1 if e % 2 == 0 else -1), pluck(midi(n + 12), 0.7), 0.16 * energy * (1 if e == 0 else 0.75), pan=-0.25 + k * 0.1)
            if e % 2 == 0 and energy > 0.5:
                add(mus, tb, bass(midi(ROOT[ch] + (7 if e == 4 else 0))), 0.33 * min(1, energy))
            if energy > 0.7:
                add(mus, tb, shaker(), 0.5 * energy * (1.0 if e % 2 else 0.6), pan=0.4)
        if glock:
            for (b, n, d) in glock[bar % len(glock)]:
                if t + b * BEAT < t1: add(mus, t + b * BEAT, mallet(midi(n), d), 0.22, pan=0.2)
        bar += 1; t += 4 * BEAT

# ---------------- MÚSICA ----------------
# A) amanecer 0-9.6: pad + arpegio suave de glockenspiel
add(mus, 0.0, pad([midi(60), midi(64), midi(67), midi(72)], 4.0, 2.0), 1.0)
add(mus, 4.0, pad([midi(57), midi(60), midi(65), midi(69)], 3.2, 0.6), 1.0)
for i, n in enumerate([72, 76, 79, 84, 79, 76, 72, 76, 77, 81, 84, 81]):
    add(mus, 0.6 + i * 0.5, mallet(midi(n), 1.6, True), 0.11 + i * 0.006, pan=np.sin(i) * 0.4)
# parada en el aterrizaje y sintonía 9.6-17.6
JING = [
    [(0, 67, .5), (0.5, 69, .5), (1, 67, .5), (1.5, 64, .5), (2, 72, 1), (3, 67, 1)],
    [(0, 71, .5), (0.5, 74, .5), (1, 71, .5), (1.5, 67, .5), (2, 74, 1.5)],
    [(0, 72, .5), (0.5, 76, .5), (1, 72, .5), (1.5, 69, .5), (2, 76, .5), (2.5, 74, .5), (3, 72, 1)],
    [(0, 69, .5), (0.5, 72, .5), (1, 74, .5), (1.5, 76, .5), (2, 79, 2)],
]
groove(9.6, 17.6, ('C', 'G', 'Am', 'F'), energy=1.2, glock=JING)
add(mus, 17.6, pluck(midi(72), 1.5), 0.25); add(mus, 17.6, bass(midi(36), 1.0), 0.4)
# B) groove suave 17.6-20.2
groove(17.6, 20.2, ('C', 'G'), energy=0.6)
# suspense: pizzicato ascendente 20.2-23.8
for i in range(8):
    add(mus, 20.2 + i * 0.45, pluck(midi(48 + [0, 2, 4, 5, 7, 9, 11, 12][i]), 0.4, 0.6), 0.32)
# glissando mágico al abrirse la tapa
for i, n in enumerate(range(72, 97, 2)):
    add(mus, 23.8 + i * 0.035, mallet(midi(n), 1.0), 0.12, pan=-0.5 + i * 0.08)
# C) nana de caja de música 25-37.2 (despacio, tierna)
LULL = [72, 76, 79, 76, 77, 81, 79, None, 76, 79, 84, 79, 74, 77, 76, None]
for k in range(3):
    for i, n in enumerate(LULL):
        tb = 25.4 + k * 4.0 + i * 0.25 * 1.0
        if n and tb < 33.8: add(mus, tb, mallet(midi(n + 12), 1.8, True), 0.09, pan=0.3 * np.sin(i))
add(mus, 25.2, pad([midi(60), midi(64), midi(67)], 8.6, 2.0), 0.8)
# cuenta 1-2-3 con campanas que suben
for tb, n in zip([34.0, 35.2, 36.4], [72, 76, 79]):
    add(mus, tb, mallet(midi(n), 1.5), 0.28); add(mus, tb, mallet(midi(n + 12), 1.0), 0.1)
# D) ¡despierta! leitmotiv de Bruno (ukelele brillante) + groove
for i, n in enumerate([67, 72, 76, 79, 84]):
    add(mus, 37.2 + i * 0.09, pluck(midi(n), 1.2, 1.6), 0.3)
add(mus, 37.2, pad([midi(60), midi(64), midi(67), midi(72)], 2.0, 0.05), 1.4)
BRUNO = [[(0, 79, .5), (0.5, 84, .5), (1, 79, .5), (2, 76, .5), (2.5, 79, 1)], [(0, 77, .5), (0.5, 76, .5), (1, 74, .5), (2, 72, 1.5)]]
groove(37.6, 43.0, ('C', 'F', 'G', 'C'), energy=0.9, glock=BRUNO)
# tic-tac de espera 43.0-45.0
for i in range(4):
    add(mus, 43.0 + i * 0.5, wood(1100 if i % 2 == 0 else 800), 0.35)
# ¡naranja!: acorde de golpe + groove
add(mus, 45.0, pad([midi(60), midi(64), midi(67), midi(72)], 1.6, 0.02), 1.6)
for k, n in enumerate([72, 76, 79, 84]): add(mus, 45.0 + k * 0.05, mallet(midi(n), 1.4), 0.2)
groove(45.4, 52.0, ('F', 'G', 'C', 'Am'), energy=0.9, glock=BRUNO)
# conducir: más energía
DRIVE = [[(0, 72, .5), (1, 74, .5), (2, 76, .5), (3, 79, .5)], [(0, 81, .5), (1, 79, .5), (2, 76, .5), (3, 74, .5)]]
groove(52.0, 56.5, ('C', 'G', 'Am', 'F'), energy=1.25, glock=DRIVE)
groove(56.5, DUR, ('C', 'F'), energy=0.7)
add(mus, 58.6, pad([midi(60), midi(64), midi(67), midi(72)], 1.4, 0.02), 1.2)

# ---------------- EFECTOS ----------------
w = filt(rng.standard_normal(int(SR * 7.5)), 'band', (300, 1200)); w *= np.sin(np.linspace(0, np.pi, len(w))) * 0.06
add(sfx, 0, w, 1.0)
for i in range(11):  # letras del logo
    t = tt(0.18); f = 900 + i * 60
    add(sfx, 10.0 + i * 0.09 + 0.25, np.sin(2 * np.pi * np.cumsum(f * np.exp(-t * 6)) / SR) * np.exp(-t * 18) * 0.25, 0.8, pan=-0.6 + i * 0.12)
add(sfx, T_LAND := 7.0, thump(80, 0.7, 1.0), 0.9)
for k, tp in enumerate([21.4, 22.2, 23.0]):
    add(sfx, tp, thump(110, 0.45, 1.0), 0.6 + k * 0.2); add(sfx, tp + 0.01, wood(320, 0.15), 0.4 + k * 0.1)
# tapa: boing
t = tt(0.7); f = 260 + 380 * np.exp(-t * 4) + 25 * np.sin(2 * np.pi * 14 * t)
add(sfx, 23.8, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * 0.5, 0.9)
for tp in (24.35, 24.75, 25.02):
    add(sfx, tp, thump(140, 0.3, 0.6), 0.5)
# ronquido suave (respiración cada 2.6 s)
for k in range(5):
    tb = 25.6 + k * 2.6
    if tb > 36.6: break
    n = filt(rng.standard_normal(int(SR * 1.3)), 'band', (250, 900)); n *= np.sin(np.linspace(0, np.pi, len(n))) ** 2 * 0.07
    add(sfx, tb, n, 1.0)
# despertar: pop + bocina pi-pip + confeti
add(sfx, 37.2, thump(200, 0.25, 0.6), 0.6)
pop = filt(rng.standard_normal(int(SR * 0.25)), 'high', 1500) * np.exp(-tt(0.25) * 25) * 0.6
add(sfx, 37.3, pop, 0.8)
for k, tp in enumerate([37.95, 38.15]):
    t = tt(0.16); x = np.sign(np.sin(2 * np.pi * 523 * t)) * 0.5 + np.sin(2 * np.pi * 784 * t) * 0.4
    add(sfx, tp, filt(x, 'low', 3000) * np.minimum(1, t / 0.01) * np.minimum(1, (0.16 - t) / 0.03) * 0.25, 0.9)
add(sfx, 37.95, thump(90, 0.4, 0.8), 0.7)
# ding de naranja y del garaje
for tp, f in ((45.0, 1568), (58.6, 1318)):
    t = tt(1.6); add(sfx, tp, (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 3) * 0.3, 0.9)
# saltitos
for tp in (45.05, 46.45, 50.25, 59.0):
    t = tt(0.25); add(sfx, tp, np.sin(2 * np.pi * np.cumsum(500 + 500 * t / 0.25) / SR) * np.exp(-t * 10) * 0.2, 0.7)
# vuelta: whoosh
wh = filt(rng.standard_normal(int(SR * 2.0)), 'band', (400, 2500)) * np.sin(np.linspace(0, np.pi, int(SR * 2.0))) ** 2 * 0.12
add(sfx, 47.5, wh, 1.0)
# motor brum-brum
d = 4.9; t = tt(d)
fe = 48 + 22 * np.clip((t - 0.2) / 1.0, 0, 1) + 10 * np.sin(2 * np.pi * 0.4 * t)
ph = 2 * np.pi * np.cumsum(fe) / SR
eng = (np.sign(np.sin(ph)) * 0.3 + np.sin(ph * 2) * 0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
env = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.5)
rev = np.exp(-((t - 0.25) / 0.12) ** 2) + np.exp(-((t - 0.65) / 0.12) ** 2)  # brum brum
add(sfx, 51.8, filt(eng, 'low', 700) * env * (0.5 + 0.8 * rev) * 0.35, 1.0)
# frenada y puerta enrollable
t = tt(0.35); add(sfx, 56.3, filt(rng.standard_normal(len(t)), 'band', (2500, 4500)) * np.exp(-t * 6) * 0.08, 1.0)
t = tt(1.2); rat = filt(rng.standard_normal(len(t)), 'band', (600, 3000)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 26 * t))) * np.sin(np.pi * t / 1.2) * 0.1
add(sfx, 58.6, rat, 1.0)

# ---------------- VOZ ----------------
PL = {'n1': 3.4, 'n2': 12.8, 'n3': 20.2, 'n4': 26.0, 'n5': 29.0, 'n6': 32.2, 'c1': 34.0, 'c2': 35.2, 'c3': 36.4,
      'b1': 38.6, 'n7': 41.8, 'n8': 45.0, 'b2': 46.4, 'b3': 50.2, 'n9': 56.8, 'n10': 58.6}
duck = np.zeros(N)
for k, t0 in PL.items():
    if t0 >= DUR: continue
    a, sr = sf.read(f'{VO}/{k}.wav')
    a = resample_poly(a, 2, 1)
    # brillo suave en la voz
    a = a + 0.25 * filt(a, 'high', 3500)
    add(vo, t0, a, 0.95, pan=0.0 if k[0] != 'b' else 0.05)
    i0, i1 = int((t0 - 0.15) * SR), int((t0 + len(a) / SR + 0.25) * SR)
    duck[max(0, i0):min(N, i1)] = 1
# suavizar el ducking
k = np.ones(int(SR * 0.12)) / int(SR * 0.12); duck = np.convolve(duck, k, 'same')

# ---------------- REVERB Y MEZCLA ----------------
ir_t = tt(1.6)
ir = np.stack([rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2) for _ in range(2)]) * 0.04
ir[:, :int(SR * 0.012)] = 0
for c in range(2):
    mus[c] += oaconvolve(mus[c], ir[c])[:N] * 0.9
    sfx[c] += oaconvolve(sfx[c], ir[c])[:N] * 0.4
    vo[c] += oaconvolve(vo[c], ir[c])[:N] * 0.12
mg = 0.55 * (1 - 0.5 * duck)
mix = mus * mg + sfx * 0.85 + vo * 1.0
# master: normaliza a ~ -16 dB RMS y limita
rms = np.sqrt(np.mean(mix ** 2)); mix *= 10 ** (-16 / 20) / rms
mix = np.tanh(mix * 1.15) / 1.15
mix *= 0.97 / np.max(np.abs(mix))
fade = np.minimum(1, np.arange(N) / (SR * 0.02)) * np.minimum(1, (N - np.arange(N)) / (SR * 0.4))
mix *= fade
sf.write('audio/ep1_prev.wav', mix.T.astype(np.float32), SR)
print('ok', DUR, 'rms dB', 20 * np.log10(np.sqrt(np.mean(mix ** 2))), 'pico', np.max(np.abs(mix)))
