# Mezcla: música por secciones + efectos limpios + voces con ducking -> out/mc/mc_raw.wav (loudnorm aparte)
import json, subprocess, sys, os
import numpy as np
R = '/home/claude/atlas-render/'
SR = 48000
A = json.load(open(R + 'mcd/audio.json'))
N = int(A['dur'] * SR) + SR
rng = np.random.default_rng(7)

def load(fn):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', fn, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()

# ---------------- efectos (sintetizados, suaves) ----------------
def env(n, a, d):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def tone(f0, f1, dur, d, a=0.004, kind='sine', L=1.5):
    n = int(L * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (np.minimum(t, dur) / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph)) * 0.3 + np.sin(ph) * 0.7
    return x * env(n, a, d)
SFX = {
    'pop': tone(520, 900, 0.12, 0.04) * 0.6 + tone(1200, 1500, 0.06, 0.015) * 0.2,
    'ding': (tone(1318, 1318, 0.6, 0.18) + 0.5 * tone(1976, 1976, 0.6, 0.12)) * 0.45,
    'boop': (tone(660, 440, 0.35, 0.12) + 0.4 * tone(990, 660, 0.35, 0.08)) * 0.5,
    'thud': tone(170, 70, 0.4, 0.11) * 0.9 + tone(330, 140, 0.2, 0.05) * 0.25,
    'reveal': sum(tone(f, f, 1.4, 0.5) * g for f, g in [(523, 0.3), (659, 0.25), (784, 0.25), (1046, 0.2)]),
}
n = int(0.5 * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n)
# whoosh: ruido filtrado con barrido
k = np.exp(-((t - 0.22) / 0.12) ** 2)
from scipy.signal import butter, sosfilt
wh = sosfilt(butter(2, [400, 3000], 'bandpass', fs=SR, output='sos'), noise) * k
SFX['whoosh'] = wh / np.abs(wh).max() * 0.35
for kk in SFX: SFX[kk] = SFX[kk] / max(1e-9, np.abs(SFX[kk]).max()) * {'pop': 0.35, 'ding': 0.4, 'boop': 0.38, 'thud': 0.5, 'whoosh': 0.3, 'reveal': 0.45}[kk]

# ---------------- pistas ----------------
mus = np.zeros(N, np.float32); sfx = np.zeros(N, np.float32); vo = np.zeros(N, np.float32)
TR = R + 'toolkit/audio/tracks/'
cache = {}
for t0, t1, name in A['music']:
    if name not in cache: cache[name] = load(TR + name + '.wav')
    tr = cache[name]; a = int(t0 * SR); b = min(N, int(t1 * SR)); L = b - a
    seg = np.resize(tr, L).astype(np.float32)
    fi = int(0.25 * SR); seg[:fi] *= np.linspace(0, 1, fi); seg[-fi:] *= np.linspace(1, 0, fi)
    mus[a:b] += seg
for t0, name, g in A['sfx']:
    x = SFX[name] * g; a = int(t0 * SR); b = min(N, a + len(x)); sfx[a:b] += x[:b - a]
hp = butter(2, 3500, 'highpass', fs=SR, output='sos')
for t0, sid in A['voices']:
    x = load(R + f'mcd/voice/{sid}.wav')
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    x = x + 0.2 * sosfilt(hp, x)
    a = int(t0 * SR); b = min(N, a + len(x)); vo[a:b] += x[:b - a]
# ducking
e = np.abs(vo); win = int(0.1 * SR)
duck = np.convolve((e > 0.02).astype(np.float32), np.ones(win) / win, 'same')
duck = np.clip(duck * 3, 0, 1)
out = mus * 0.32 * (1 - 0.5 * duck) + sfx * 0.8 + vo * 1.1
out = out[:int(A['dur'] * SR)]
pk = np.abs(out).max(); out = out / max(pk, 1e-9) * 0.95 if pk > 0.95 else out
os.makedirs(R + 'out/mc', exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '2', R + 'out/mc/mc_raw.wav'], input=out.astype(np.float32).tobytes())
print('mezcla ok', round(len(out) / SR, 2), 's')
