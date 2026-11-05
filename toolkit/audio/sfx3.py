"""Banco ampliado: más variantes de explosión, disparo, lejanas, impactos y silbidos"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR, t_, lp, hp, bp, noise
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
M.set_seed(777); r = np.random.default_rng(31)
def save(name, x):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    f = int(0.003 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]; f2 = int(0.04 * SR); x[-f2:] *= np.linspace(1, 0, f2)[:, None]
    M.write_wav(os.path.join(D, name + '.wav'), M.normalize(x, -1.0))
def rev(x, amt=0.3, dur=1.6):
    from scipy.signal import oaconvolve
    ir = M.make_ir(dur, 3.5)
    return np.stack([x + oaconvolve(x, ir[0])[: len(x)] * amt, x + oaconvolve(x, ir[1])[: len(x)] * amt], 1)
for i in range(7, 13):   # explosiones
    d = r.uniform(2.2, 3.6); tt = t_(d); f0 = r.uniform(28, 45); dec = r.uniform(1.1, 2.2)
    body = np.sin(2 * np.pi * np.cumsum(f0 + r.uniform(40, 90) * np.exp(-tt * r.uniform(18, 35))) / SR) * np.exp(-tt * dec * 1.6)
    crash = bp(noise(d), r.uniform(300, 700), r.uniform(2500, 5000)) * np.exp(-tt * r.uniform(5, 9)) * r.uniform(0.5, 0.9)
    rumble = lp(noise(d), r.uniform(150, 300)) * np.exp(-tt * dec) * 1.2
    deb = np.zeros(len(tt))
    for k in range(r.integers(10, 30)):
        p = int(r.uniform(0.15, d * 0.7) * SR); s = hp(noise(0.03), 2500) * np.exp(-t_(0.03) * 80) * r.uniform(0.05, 0.25); deb[p:p + len(s)] += s[: len(deb) - p]
    save(f'boom_{i}', rev(body + crash + rumble + deb, r.uniform(0.25, 0.45), 2.2))
for i in range(9, 15):   # ráfagas de fusil
    d = 1.3; x = np.zeros(int(d * SR)); n = r.integers(3, 9); gap = r.uniform(0.07, 0.13)
    for k in range(n):
        s = bp(noise(0.08), r.uniform(500, 900), r.uniform(3500, 6000)) * np.exp(-t_(0.08) * r.uniform(50, 75)) + lp(noise(0.08), 280) * np.exp(-t_(0.08) * 40) * 0.6
        p = int((k * gap + r.uniform(0, 0.015)) * SR); x[p:p + len(s)] += s[: len(x) - p] * r.uniform(0.6, 1)
    save(f'gun_{i}', rev(x, r.uniform(0.2, 0.4)))
for i in range(5, 9):    # explosiones lejanas
    d = 2.6; tt = t_(d); x = lp(noise(d), r.uniform(200, 450)) * np.exp(-tt * r.uniform(1.6, 2.6)) * np.clip(tt / 0.02, 0, 1)
    x += np.sin(2 * np.pi * np.cumsum(r.uniform(35, 50) + 30 * np.exp(-tt * 20)) / SR) * np.exp(-tt * 2.5) * 0.6
    save(f'far_{i}', rev(x, 0.5, 2.4))
for i in range(6, 10):   # impactos secos
    d = 0.9; tt = t_(d); x = np.sin(2 * np.pi * np.cumsum(r.uniform(60, 110) + 200 * np.exp(-tt * 50)) / SR) * np.exp(-tt * r.uniform(7, 11)) + bp(noise(d), 800, 4000) * np.exp(-tt * 30) * 0.7
    save(f'hit_{i}', rev(x, 0.3))
for i in range(5, 8):    # silbidos de paso
    d = r.uniform(0.7, 1.1); tt = t_(d); fc = 600 + 2600 * np.sin(np.pi * tt / d) ** 2
    x = bp(noise(d), 300, 6000) * np.sin(np.pi * tt / d) ** 2
    save(f'whoosh_{i}', rev(x, 0.2))
# glitch / apagón
d = 2.2; tt = t_(d); x = np.zeros(len(tt))
for k in range(26):
    p = int(r.uniform(0, d - 0.12) * SR); L = int(r.uniform(0.02, 0.1) * SR); f = r.uniform(200, 3000)
    w = np.sign(np.sin(2 * np.pi * f * np.arange(L) / SR)); x[p:p + L] += w[:len(x[p:p + L])] * r.uniform(0.2, 0.6)
x += lp(noise(d), 120) * 0.3; x[int(1.7 * SR):] *= np.linspace(1, 0, len(x) - int(1.7 * SR))
save('blackout', rev(x, 0.2))
# fanfarria de cumbre (tres golpes graves)
d = 2.0; x = np.zeros(int(d * SR))
for k, (o, f) in enumerate([(0, 98), (0.32, 98), (0.64, 147)]):
    tt = t_(0.9); s = sum(np.sin(2 * np.pi * f * h * tt) / h for h in (1, 2, 3, 4)) * np.exp(-tt * 3.5)
    p = int(o * SR); x[p:p + len(s)] += s[: len(x) - p]
save('summit', rev(x, 0.45, 2.0))
# pitido de fijar objetivo
d = 0.7; x = np.zeros(int(d * SR))
for k in range(3):
    tt = t_(0.08); s = np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt * 20); p = int(k * 0.12 * SR); x[p:p + len(s)] += s
tt = t_(0.3); s = np.sin(2 * np.pi * 2350 * tt) * np.exp(-tt * 6); p = int(0.38 * SR); x[p:p + len(s)] += s[: len(x) - p]
save('lock', x * 0.8)
print('ok')
