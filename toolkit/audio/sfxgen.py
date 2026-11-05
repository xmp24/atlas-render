"""Banco de efectos: normaliza los descargados y sintetiza el resto -> audio/sfx/*.wav (44.1k estéreo 16-bit, pico -1 dBFS)"""
import os, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly
from math import gcd
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR, t_, lp, hp, bp, noise, env, note, sweep_noise

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
M.set_seed(99)


def load_any(path):
    sr, a = wavfile.read(path)
    if a.dtype == np.int16: a = a / 32768.0
    elif a.dtype == np.int32: a = a / 2147483648.0
    elif a.dtype == np.uint8: a = (a - 128) / 128.0
    else: a = a.astype(np.float64)
    if a.ndim == 1: a = np.stack([a, a], 1)
    a = a[:, :2]
    if sr != SR:
        g = gcd(SR, sr); a = resample_poly(a, SR // g, sr // g, axis=0)
    return a


def save(name, x, stereo_w=0.0):
    x = np.asarray(x, float)
    if x.ndim == 1:
        if stereo_w > 0:
            d = int(0.011 * SR)
            r = np.r_[np.zeros(d), x[:-d]]
            x = np.stack([x, x * (1 - stereo_w) + r * stereo_w], 1)
        else:
            x = np.stack([x, x], 1)
    # fundidos anti-clic
    f = min(len(x) // 4, int(0.003 * SR)); x[:f] *= np.linspace(0, 1, f)[:, None]
    f2 = min(len(x) // 4, int(0.02 * SR)); x[-f2:] *= np.linspace(1, 0, f2)[:, None]
    x = M.normalize(x, -1.0)
    M.write_wav(os.path.join(D, name + '.wav'), x)


def rev(x, amt=0.3, dur=1.8):
    ir = M.make_ir(dur, 3.5)
    from scipy.signal import oaconvolve
    L = x + oaconvolve(x, ir[0])[: len(x)] * amt
    R = x + oaconvolve(x, ir[1])[: len(x)] * amt
    return np.stack([L, R], 1)


def pad_to(x, d):
    n = int(d * SR)
    return np.r_[x, np.zeros(max(0, n - len(x)))][:n]


# ---------- descargados ----------
for n in ['whoosh', 'whip', 'vine-boom', 'ding', 'switch', 'mouse-click', 'shutter-modern', 'anime-wow', 'yippee', 'bone-crack']:
    p = os.path.join(D, n + '.wav')
    if os.path.exists(p):
        a = load_any(p)
        # recorta silencio final
        lv = np.abs(a).max(1); idx = np.where(lv > 1e-3)[0]
        if len(idx): a = a[: idx[-1] + int(0.05 * SR)]
        save(n, a)

# ---------- sintetizados ----------
def boom(d=3.5, f0=34, f1=60, crash_c=1800, crash_g=0.35, decay=1.5):
    t = t_(d)
    sub = np.sin(2 * np.pi * np.cumsum(f0 + f1 * np.exp(-t * 5)) / SR) * np.exp(-t * decay)
    cr = lp(noise(d), crash_c) * np.exp(-t * 2.4) * crash_g
    deb = bp(noise(d), 2000, 6000) * np.exp(-t * 6) * 0.08
    return (sub + cr + deb) * np.clip(t / 0.004, 0, 1)

save('boom_big', rev(pad_to(boom(4.0, 30, 70, 1600, 0.45, 1.1), 4.5), 0.35, 2.5))
save('boom_small', rev(boom(1.6, 50, 80, 2400, 0.4, 3.5), 0.25))
t = t_(3.0)
far = lp(noise(3.0), 500) * np.exp(-t * 1.6) * np.clip(t / 0.08, 0, 1) + np.sin(2 * np.pi * 32 * t) * np.exp(-t * 1.4) * 0.6 * np.clip(t / 0.1, 0, 1)
save('explosion_far', rev(far, 0.5, 2.5))
t = t_(1.2)
imp = np.sin(2 * np.pi * np.cumsum(40 + 120 * np.exp(-t * 25)) / SR) * np.exp(-t * 4) + lp(noise(1.2), 4000) * np.exp(-t * 25) * 0.6
save('impact_hit', rev(imp, 0.3))
for nm, d in (('riser_2s', 2.0), ('riser_4s', 4.0)):
    tt = t_(d)
    s = sweep_noise(d, 300, 7000, parts=40) * (tt / d) ** 2
    s += np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2.5 * tt / d)) / SR) * 0.25 * (tt / d) ** 2
    s *= np.clip((d - tt) / 0.01, 0, 1)
    save(nm, rev(s, 0.3))
tt = t_(2.0)
dl = sweep_noise(2.0, 6000, 150, parts=30, curve=0.7) * (1 - tt / 2.0) ** 1.5 + np.sin(2 * np.pi * np.cumsum(220 * 2 ** (-3 * tt / 2)) / SR) * 0.2 * (1 - tt / 2)
save('downlifter', rev(dl, 0.35))
tt = t_(0.06)
save('tick', (np.sin(2 * np.pi * 3000 * tt) * 0.5 + bp(noise(0.06), 2000, 7000)) * np.exp(-tt * 110))
tt = t_(0.18)
save('beep_hi', np.sin(2 * np.pi * 1320 * tt) * env(0.004, 0.05, 0.8, 0.05, 0.18) + 0.2 * np.sin(2 * np.pi * 2640 * tt) * env(0.004, 0.05, 0.8, 0.05, 0.18))
save('beep_lo', np.sin(2 * np.pi * 660 * tt) * env(0.004, 0.05, 0.8, 0.05, 0.18) + 0.2 * np.sin(2 * np.pi * 1320 * tt) * env(0.004, 0.05, 0.8, 0.05, 0.18))
tt = t_(0.05)
save('roulette_tick', (bp(noise(0.05), 1500, 5000) * 0.6 + np.sin(2 * np.pi * 1800 * tt) * 0.4) * np.exp(-tt * 140))
tt = t_(1.4)
rs = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * dc) for f, dc in ((880, 2), (1108.7, 2.2), (1318.5, 2.4), (1760, 3)))
rs += bp(noise(1.4), 2000, 8000) * np.exp(-tt * 30) * 0.5
save('roulette_stop', rev(rs * np.clip(tt / 0.002, 0, 1), 0.4))
# glitch: fragmentos cortados de ruido y tonos
r = M.rng(); g = np.zeros(int(0.5 * SR)); pos = 0
while pos < len(g) - 500:
    l = int(r.uniform(0.008, 0.04) * SR)
    seg = (np.sign(np.sin(2 * np.pi * r.uniform(200, 3000) * t_(l / SR))) * 0.6 if r.random() < 0.5 else bp(noise(l / SR), 500, 8000))
    g[pos:pos + l] = seg[: len(g[pos:pos + l])] * r.uniform(0.3, 1.0)
    pos += l + int(r.uniform(0, 0.01) * SR)
save('glitch', g, stereo_w=0.6)


def brass_hit(chord, d=1.6, cutoff=2400):
    tt = t_(d); out = np.zeros(len(tt))
    for n in chord:
        f = note(n)
        s = sum(M.saw_p(M.phase(f * dt, d, vib=0.003)) for dt in (0.995, 1.0, 1.006)) / 3
        out += lp(s, cutoff) * env(0.02, 0.25, 0.6, 0.6, d)
    return out


def choir_hit(chord, d=1.6):
    tt = t_(d); out = np.zeros(len(tt))
    for n in chord:
        src = sum(M.saw_p(M.phase(note(n) * dt, d, vib=0.006, vrate=4.6)) for dt in (0.995, 1.0, 1.006)) / 3
        out += (bp(src, 650, 950) + bp(src, 1050, 1300) * 0.6 + bp(src, 2600, 3100) * 0.25) * env(0.08, 0.3, 0.8, 0.6, d)
    return out

tt = t_(2.2)
win = pad_to(brass_hit([60, 64, 67, 72], 2.0) * 0.6 + choir_hit([72, 76, 79], 2.0) * 1.2, 2.2)
win += pad_to(np.sin(2 * np.pi * np.cumsum(55 + 40 * np.exp(-t_(2.0) * 10)) / SR) * np.exp(-t_(2.0) * 2.5) * 0.5, 2.2)
win += pad_to(hp(noise(2.0), 4000) * np.exp(-t_(2.0) * 1.8) * 0.15, 2.2)
save('stinger_win', rev(win, 0.45, 2.5))
lose = np.zeros(int(2.6 * SR))
for k, n in enumerate([62, 61, 60]):
    s = brass_hit([n, n - 12], 0.5 if k < 2 else 1.6, 1600)
    i = int(k * 0.45 * SR); lose[i:i + len(s)] += s[: len(lose) - i]
tt = t_(1.6); i = int(0.9 * SR)
bend = M.saw_p(np.cumsum(note(58) * (1 - 0.06 * tt)) / SR); lose[i:i + len(tt)] += lp(bend, 1400) * env(0.02, 0.2, 0.7, 0.8, 1.6) * 0.8
save('stinger_lose', rev(lose, 0.35))
# público: muchas "voces" de ruido filtrado + aplausos
d = 3.5; tt = t_(d); crowd = np.zeros(len(tt))
for k in range(28):
    fc = r.uniform(350, 1400)
    crowd += bp(noise(d), fc * 0.8, fc * 1.25) * (0.5 + 0.5 * np.sin(2 * np.pi * r.uniform(1.5, 4) * tt + r.random() * 6))
claps = np.zeros(len(tt))
for k in range(220):
    p = int(r.uniform(0, d - 0.1) * SR); l = int(0.03 * SR)
    claps[p:p + l] += bp(noise(0.03), 900, 3500) * np.exp(-t_(0.03) * 120) * r.uniform(0.3, 1)
ce = np.clip(tt / 0.25, 0, 1) * np.clip((d - tt) / 1.2, 0, 1)
save('crowd_cheer', rev((crowd * 0.25 + claps) * ce, 0.4), )
hb = np.zeros(int(1.2 * SR))
for o, gg in ((0, 1.0), (0.24, 0.7)):
    tt = t_(0.35); s = np.sin(2 * np.pi * np.cumsum(40 + 35 * np.exp(-tt * 20)) / SR) * np.exp(-tt * 9) * gg
    i = int(o * SR); hb[i:i + len(s)] += s
save('heartbeat', hb)
d = 1.8; tt = t_(d)
f0 = 75 + 25 * np.sin(2 * np.pi * 2.3 * tt) + 20 * r.standard_normal(len(tt)).cumsum() / np.sqrt(len(tt))
src = M.saw_p(np.cumsum(f0) / SR) + 0.6 * noise(d)
gr = (bp(src, 300, 700) * 1.0 + bp(src, 900, 1400) * 0.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 13 * tt)) * env(0.15, 0.3, 0.8, 0.6, d)
save('zombie_growl', rev(gr, 0.3), )
d = 3.0; tt = t_(d)
fs = 700 + 350 * np.sin(2 * np.pi * 0.5 * tt - np.pi / 2)
sir = sum(np.sin(2 * np.pi * np.cumsum(fs * k) / SR) / k for k in (1, 2, 3))
save('siren', rev(sir * env(0.2, 0.1, 1, 0.5, d), 0.4))
gun = np.zeros(int(1.4 * SR))
for k in range(12):
    tt = t_(0.09); s = bp(noise(0.09), 700, 5000) * np.exp(-tt * 60) + lp(noise(0.09), 300) * np.exp(-tt * 45) * 0.7
    i = int((k * 0.085 + r.uniform(0, 0.01)) * SR); gun[i:i + len(s)] += s[: len(gun) - i] * r.uniform(0.7, 1.0)
save('gunfire_burst', rev(gun, 0.3))
d = 2.5; tt = t_(d)
can = np.sin(2 * np.pi * np.cumsum(48 + 90 * np.exp(-tt * 35)) / SR) * np.exp(-tt * 3) + lp(noise(d), 3000) * np.exp(-tt * 18) * 0.8 + lp(noise(d), 600) * np.exp(-tt * 2.5) * 0.3
save('cannon', rev(can * np.clip(tt / 0.002, 0, 1), 0.4, 2.2))
print('sfx:', sorted(f for f in os.listdir(D) if f.endswith('.wav')))
