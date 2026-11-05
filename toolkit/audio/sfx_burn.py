"""SFX para 'What If Earth Burned in 24 Hours?': braam de tráiler, pitido de oído, alerta EAS, viento, pájaros, estática, multitud, zumbido de búnker, detonación nuclear."""
import os, sys
import numpy as np
from scipy.signal import fftconvolve
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR, lp, hp, bp, noise

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
M.set_seed(2048); r = np.random.default_rng(48)
def t_(d): return np.arange(int(d * SR)) / SR
def save(name, x, peak=0.9):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]; f2 = int(0.08 * SR); x[-f2:] *= np.linspace(1, 0, f2)[:, None]
    x = x / (np.abs(x).max() + 1e-9) * peak
    M.write_wav(os.path.join(D, name + '.wav'), x)
def rev(x, mix=0.35, d=2.6):
    ir = M.make_ir(d, 3.0); ir = ir[0] if isinstance(ir, tuple) else ir; ir = ir[:, 0] if ir.ndim > 1 else ir; y = fftconvolve(x, ir)[:len(x) + int(d * SR)]
    out = np.zeros(len(y)); out[:len(x)] += x; return out * (1 - mix) + y * mix / (np.abs(y).max() + 1e-9) * np.abs(x).max()
def saw(f, t): return 2 * ((f * t) % 1) - 1

# braam: cluster grave de metales saturados
for i, (f0, d) in enumerate([(43.65, 4.2), (38.9, 4.6), (49.0, 3.8)]):
    t = t_(d); e = np.minimum(1, t / 0.05) * np.exp(-t * 0.65)
    x = sum(saw(f0 * m * (1 + 0.003 * j), t) * g for j, (m, g) in enumerate([(1, 1), (1.5, 0.6), (2, 0.55), (3, 0.25), (0.5, 0.8)]))
    x = lp(np.tanh(x * 2.2), 900) * e
    x += np.sin(2 * np.pi * f0 / 2 * t) * e * 0.9
    save('braam' + ('' if i == 0 else str(i + 1)), rev(x, 0.4, 3.0))
# golpe de tráiler: bombo + metal
t = t_(2.6); e = np.exp(-t * 2.2)
x = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t * 18)) / SR) * e + bp(noise(2.6), 900, 5000) * np.exp(-t * 9) * 0.35
save('thit', rev(x, 0.35, 2.4))
# pitido de oído tras la explosión
t = t_(5.0); x = np.sin(2 * np.pi * 3950 * t) * np.minimum(1, t / 0.3) * np.exp(-t * 0.45) * 0.5
save('tinnitus', x, 0.5)
# alerta de emergencia EAS (853 + 960 Hz)
t = t_(3.2); x = (np.sin(2 * np.pi * 853 * t) + np.sin(2 * np.pi * 960 * t)) * 0.5 * (((t * 2) % 1) < 0.85)
save('eas', x, 0.7)
# viento de páramo
d = 12; x = lp(noise(d), 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.13 * t_(d))) + bp(noise(d), 1200, 2600) * 0.08 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.31 * t_(d)))
save('wind', x, 0.6)
# pájaros
d = 8; x = np.zeros(int(d * SR))
for k in range(26):
    st = r.uniform(0, d - 0.4); n = int(r.uniform(0.06, 0.16) * SR); tt = np.arange(n) / SR
    f = r.uniform(2600, 4600) + r.uniform(800, 1800) * np.sin(2 * np.pi * r.uniform(12, 30) * tt)
    seg = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / tt[-1]) * r.uniform(0.3, 1)
    i0 = int(st * SR); x[i0:i0 + n] += seg
save('birds', rev(x, 0.25, 1.4), 0.5)
# estática de radio
d = 3; x = bp(noise(d), 800, 6000) * (0.4 + 0.6 * (r.random(int(d * SR)) > 0.97).astype(float).cumsum() % 2)
save('static', x * 0.6, 0.5)
# multitud en pánico
d = 6; t = t_(d); x = sum(bp(noise(d), f, f * 1.6) * (0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(1.5, 4) * t + r.uniform(0, 6))) for f in [300, 450, 700, 1100])
save('crowd', x, 0.7)
# zumbido del búnker
d = 10; t = t_(d); x = (np.sin(2 * np.pi * 60 * t) + 0.5 * np.sin(2 * np.pi * 120 * t) + 0.2 * saw(180, t)) * 0.3 + lp(noise(d), 300) * 0.3
save('hum', x, 0.45)
# detonación nuclear: destello + rugido largo
d = 7; t = t_(d)
x = np.sin(2 * np.pi * np.cumsum(24 + 70 * np.exp(-t * 3)) / SR) * np.exp(-t * 0.5) * 1.1
x += lp(noise(d), 500) * np.minimum(1, t / 0.4) * np.exp(-t * 0.42) * 1.4 + bp(noise(d), 1500, 6000) * np.exp(-t * 4) * 0.4
save('nuke', rev(x, 0.35, 3.5))
save('nuke_far', lp(rev(x, 0.5, 3.5), 380), 0.8)
# lanzamiento de ICBM (rugido ascendente)
d = 3.5; t = t_(d); x = (lp(noise(d), 350) * (1 - np.minimum(1, t / 1.5)) + lp(noise(d), 1200) * np.minimum(1, t / 1.5)) * np.minimum(1, t / 0.3) * np.exp(-np.maximum(0, t - 2) * 2)
save('launch', x, 0.85)
print('burn sfx ok')
