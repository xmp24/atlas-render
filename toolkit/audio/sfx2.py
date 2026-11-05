"""Efectos nuevos: misiles, tanques, paracaídas, antiaéreo"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR, t_, lp, hp, bp, noise, env
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
M.set_seed(123); r = np.random.default_rng(5)
def save(name, x):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    f = int(0.004 * SR); x[:f] *= np.linspace(0, 1, f)[:, None]; f2 = int(0.05 * SR); x[-f2:] *= np.linspace(1, 0, f2)[:, None]
    M.write_wav(os.path.join(D, name + '.wav'), M.normalize(x, -1.0))
def rev(x, amt=0.3, dur=1.6):
    from scipy.signal import oaconvolve
    ir = M.make_ir(dur, 3.5)
    return np.stack([x + oaconvolve(x, ir[0])[: len(x)] * amt, x + oaconvolve(x, ir[1])[: len(x)] * amt], 1)
# lanzamiento de misil: golpe de ignición + rugido que se aleja (dos variantes)
for v, (fc, d) in enumerate([(900, 2.4), (1200, 2.1)]):
    tt = t_(d)
    ign = lp(noise(d), 500) * np.exp(-tt * 9) * 1.2 + np.sin(2 * np.pi * np.cumsum(55 + 60 * np.exp(-tt * 25)) / SR) * np.exp(-tt * 6)
    roar = bp(noise(d), fc * 0.4, fc * (1 + 0.6 * 0)) * np.clip(tt / 0.08, 0, 1) * np.exp(-tt * 1.3)
    hiss = hp(noise(d), 3000) * np.clip(tt / 0.15, 0, 1) * np.exp(-tt * 2.0) * 0.35
    save(f'missile_{v + 1}', rev(ign + roar * 0.9 + hiss, 0.35))
# misil que llega: silbido descendente corto
d = 1.2; tt = t_(d); f = 2600 - 1700 * (tt / d) ** 1.4
x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35 + bp(noise(d), 1500, 4000) * 0.4
save('missile_in', rev(x * np.clip(tt / 0.6, 0, 1) ** 2, 0.25))
# tanques: motor diésel grave + orugas
d = 3.0; tt = t_(d)
eng = sum(np.sin(2 * np.pi * np.cumsum(np.full(len(tt), 32.0 * k) * (1 + 0.03 * np.sin(2 * np.pi * 1.3 * tt))) / SR) / k for k in (1, 2, 3, 4))
eng = lp(eng * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 16 * tt))), 400)
trk = np.zeros(len(tt))
for k in range(int(d * 11)):
    i = int((k / 11 + r.uniform(0, 0.01)) * SR); s = bp(noise(0.04), 1500, 4500) * np.exp(-t_(0.04) * 90)
    trk[i:i + len(s)] += s[: len(trk) - i] * r.uniform(0.4, 0.8)
save('tank_roll', rev((eng * 0.9 + trk * 0.5) * env(0.5, 0.2, 1, 0.8, d), 0.2))
# disparo de cañón de tanque (seco)
d = 1.4; tt = t_(d)
x = np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-tt * 40)) / SR) * np.exp(-tt * 5) + bp(noise(d), 600, 3500) * np.exp(-tt * 22) * 0.9
save('tank_shot', rev(x, 0.35))
# paracaídas: aleteo de tela
d = 1.6; tt = t_(d)
x = bp(noise(d), 300, 1600) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 7 * tt))) * env(0.1, 0.2, 0.8, 0.5, d)
x[:int(0.12 * SR)] += hp(noise(0.12), 2000) * np.exp(-t_(0.12) * 30) * 1.5
save('para', rev(x, 0.2))
# antiaéreo: ráfagas secas
d = 2.0; x = np.zeros(int(d * SR))
for k in range(16):
    s = bp(noise(0.06), 400, 2500) * np.exp(-t_(0.06) * 50) + lp(noise(0.06), 250) * np.exp(-t_(0.06) * 30)
    i = int((k * 0.12 + r.uniform(0, 0.02)) * SR); x[i:i + len(s)] += s[: len(x) - i] * r.uniform(0.5, 1)
save('flak', rev(x, 0.4))
print('ok')
