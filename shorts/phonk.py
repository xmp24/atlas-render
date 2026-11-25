# Música phonk procedural (propia, sin licencias) + whooshes en los cortes, a -14 LUFS
import json, sys, math
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)

def env(n, a=0.002, d=0.2, sus=0.0, curve=4):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1) * (sus + (1 - sus) * np.exp(-t * curve / max(d, 1e-3)))
    return e

def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo / (SR / 2), hi / (SR / 2)], 'band', output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f / (SR / 2), 'high', output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f / (SR / 2), 'low', output='sos'), x)

def kick(dur=0.45):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env(n, 0.001, 0.32, 0, 3)
    click = hp(rng.normal(0, 1, n), 2500) * env(n, 0.0005, 0.006, 0, 6) * 0.25
    return np.tanh((x + click) * 1.4) * 0.9

def b808(note_hz, dur):
    n = int(SR * dur); t = np.arange(n) / SR
    f = note_hz * (1 + 0.5 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph)
    return np.tanh(x * 1.6) * env(n, 0.003, dur * 0.9, 0.25, 2.2) * 0.8

def clap():
    n = int(SR * 0.25); x = np.zeros(n)
    for k, o in enumerate([0, 0.008, 0.017, 0.026]):
        i = int(o * SR); m = n - i
        x[i:] += bp(rng.normal(0, 1, m), 900, 5000) * env(m, 0.0005, 0.03 if k < 3 else 0.14, 0, 5)
    return x * 0.5

def hat(op=False):
    n = int(SR * (0.18 if op else 0.05))
    return hp(rng.normal(0, 1, n), 7000, 4) * env(n, 0.0005, 0.12 if op else 0.025, 0, 5) * 0.28

def cowbell(hz, dur=0.16):
    n = int(SR * dur); t = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * hz * t)) * 0.5 + np.sign(np.sin(2 * np.pi * hz * 1.48 * t)) * 0.5
    x = bp(x, 500, 4200) * env(n, 0.001, dur * 0.7, 0, 3.2)
    return x * 0.34

def riser(dur):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.normal(0, 1, n); k = t / dur
    y = np.zeros(n)
    for i in range(0, n, 2048):
        seg = x[i:i + 2048]; fc = 400 + 7000 * (k[i] ** 2)
        y[i:i + len(seg)] = bp(seg, fc * 0.7, min(fc * 1.4, 18000), 1)
    return y * k ** 1.6 * 0.22

def whoosh(dur=0.32):
    n = int(SR * dur); t = np.arange(n) / SR
    x = rng.normal(0, 1, n); y = np.zeros(n)
    for i in range(0, n, 1024):
        k = i / n; fc = 600 + 3800 * math.sin(math.pi * k)
        seg = x[i:i + 1024]; y[i:i + len(seg)] = bp(seg, fc * 0.6, fc * 1.6, 1)
    e = np.sin(np.pi * np.minimum(t / dur, 1)) ** 2
    return y * e * 0.33

def impact():
    n = int(SR * 1.2); t = np.arange(n) / SR
    f = 38 + 60 * np.exp(-t * 10)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.9, 0, 2.5)
    nz = lp(rng.normal(0, 1, n), 1800) * env(n, 0.001, 0.25, 0, 4) * 0.4
    return (x + nz) * 0.8

def place(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0: return
    m = min(len(x), len(buf) - i)
    buf[i:i + m, 0] += x[:m] * g * (1 - max(pan, 0)); buf[i:i + m, 1] += x[:m] * g * (1 + min(pan, 0))

def track(bpm, dur, b0, cuts=(), style=0, drop=None):
    beat = 60 / bpm; s16 = beat / 4
    L = int((dur + 1.5) * SR); buf = np.zeros((L, 2))
    root = [55.0, 43.65, 49.0, 41.2][style % 4]  # A1 / F1 / G1 / E1
    prog = [1, 0.8909, 0.7937, 0.8409]  # i - VI - v - (bVII-ish)
    scale = [1, 1.1892, 1.3348, 1.4983, 1.7818, 2.0]  # menor
    # motivo de cencerro (16 semicorcheas, índices en escala; -1 silencio)
    motifs = [[0, -1, 2, -1, 3, -1, 2, 0, -1, 4, -1, 3, 2, -1, 0, -1],
              [5, -1, 4, 3, -1, 2, -1, 3, 4, -1, 2, -1, 0, 2, -1, -1],
              [0, 0, -1, 3, -1, 2, 3, -1, 5, -1, 4, -1, 3, -1, 2, -1]]
    mo = motifs[style % 3]
    cb_base = 523.0 * [1, 0.8909, 1.122, 0.943][style % 4]
    nb = int((dur - b0) / beat) + 2
    for bi in range(-1, nb):
        tb = b0 + bi * beat
        if tb < -0.01: continue
        bar = bi // 4; inbar = bi % 4
        ch = prog[(bar) % 4]
        # batería
        if inbar in (0, 2) or (inbar == 3 and bar % 2 == 1):
            place(buf, kick(), tb, 0.95)
        if inbar == 2 and bar % 2 == 0: place(buf, kick(), tb + 3 * s16, 0.6)
        if inbar in (1, 3): place(buf, clap(), tb, 0.8)
        for k in range(4):
            roll = (bar % 4 == 3 and inbar == 3)
            if roll:
                for r in range(2): place(buf, hat(), tb + k * s16 + r * s16 / 2, 0.55, 0.25)
            elif k % 2 == 0 or bi % 3 == 0: place(buf, hat(k == 2 and inbar == 3), tb + k * s16, 0.5 if k % 2 else 0.7, 0.25)
        # 808 en el 1 de cada compás y en el 3 a veces
        if inbar == 0: place(buf, b808(root * ch, beat * 2.2), tb, 0.75)
        if inbar == 2 and bar % 2 == 1: place(buf, b808(root * ch * 1.335, beat * 1.4), tb + s16 * 2, 0.6)
        # cencerro
        for k in range(4):
            idx = mo[(inbar * 4 + k) % 16]
            if idx >= 0: place(buf, cowbell(cb_base * ch * scale[idx], s16 * 1.6), tb + k * s16, 0.85, -0.15)
    # efectos en los cortes
    for c in cuts:
        place(buf, whoosh(0.34), c - 0.17, 0.75)
    if drop is not None:
        place(buf, riser(1.2), drop - 1.2, 0.8); place(buf, impact(), drop, 0.8)
    place(buf, impact(), b0, 0.55)
    buf = buf[:int(dur * SR)]
    # fade final corto
    fo = int(0.25 * SR); buf[-fo:] *= np.linspace(1, 0, fo)[:, None]
    return buf

def loud(x, target=-14.0):
    import pyloudnorm as pyln
    m = pyln.Meter(SR); l = m.integrated_loudness(x)
    y = x * 10 ** ((target - l) / 20)
    # limitador suave: transparente por debajo de 0.8, nunca pasa de 0.97
    a = np.abs(y); over = a > 0.8
    y[over] = np.sign(y[over]) * (0.8 + 0.17 * np.tanh((a[over] - 0.8) / 0.17))
    return y

if __name__ == '__main__':
    v = sys.argv[1]; style = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    J = json.load(open(f'/home/claude/atlas-render/src/sh/data/{v}.json'))
    cuts = [s['t0'] for s in J['scenes'][1:]]
    x = track(J['bpm'], J['dur'], J['b0'], cuts, style, J.get('drop'))
    x = loud(x)
    import os; os.makedirs('/home/claude/atlas-render/public/sh/music', exist_ok=True)
    wavfile.write(f'/home/claude/atlas-render/public/sh/music/{v}.wav', SR, (x * 32767).astype(np.int16))
    print(v, 'música', round(len(x) / SR, 2), 's', J['bpm'], 'BPM')
