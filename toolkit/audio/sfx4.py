"""SFX para el vídeo de la captura: rotor de helicóptero, teléfono, sintonía de noticias, teclado, puerta de acero."""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
rng = np.random.default_rng(7)


def save(name, x):
    x = np.asarray(x, float)
    if x.ndim == 1: x = np.stack([x, x], 1)
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    M.write_wav(os.path.join(OUT, name + '.wav'), x)


def env(n, a, r):
    e = np.ones(n); ia = int(a * SR); ir = int(r * SR)
    if ia: e[:ia] = np.linspace(0, 1, ia)
    if ir: e[-ir:] *= np.linspace(1, 0, ir)
    return e


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, 'same')


# rotor: golpes graves periódicos (~5.5 Hz) sobre ruido filtrado, 6 s (se encadena)
def rotor(dur=6.0, rate=5.6):
    n = int(dur * SR); t = np.arange(n) / SR
    noise = lowpass(rng.standard_normal(n), 60)
    ph = (t * rate) % 1.0
    thump = np.exp(-ph * 9) * np.sin(2 * np.pi * 55 * t)
    chop = np.exp(-ph * 14) * lowpass(rng.standard_normal(n), 8) * 0.6
    whine = 0.08 * np.sin(2 * np.pi * 880 * t + 3 * np.sin(2 * np.pi * 0.3 * t))
    return (thump * 1.0 + chop + noise * 0.25 + whine) * env(n, 0.3, 0.3)


# teléfono antiguo: dos ráfagas de timbre
def phone():
    out = []
    for _ in range(2):
        n = int(0.9 * SR); t = np.arange(n) / SR
        b = (np.sin(2 * np.pi * 420 * t) + 0.6 * np.sin(2 * np.pi * 840 * t)) * (np.sign(np.sin(2 * np.pi * 22 * t)) * 0.5 + 0.5)
        out += [b * env(n, 0.01, 0.05), np.zeros(int(0.35 * SR))]
    return np.concatenate(out)


# sintonía de noticias: acordes brillantes + golpe
def news():
    n = int(2.6 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for i, (t0, fr) in enumerate([(0, [523, 659, 784]), (0.28, [587, 740, 880]), (0.56, [659, 831, 988]), (0.95, [523, 659, 784, 1047])]):
        i0 = int(t0 * SR); m = n - i0; tt = np.arange(m) / SR
        tone = sum(np.sign(np.sin(2 * np.pi * f * tt)) * 0.3 + np.sin(2 * np.pi * f * tt) for f in fr)
        x[i0:] += tone * np.exp(-tt * (2.5 if i == 3 else 7)) * 0.4
    x[:int(0.3 * SR)] += lowpass(rng.standard_normal(int(0.3 * SR)), 3) * np.exp(-np.arange(int(0.3 * SR)) / SR * 20) * 0.6
    return x * env(n, 0.005, 0.4)


# teclado: clics irregulares
def typing(dur=2.0):
    n = int(dur * SR); x = np.zeros(n); t = 0.0
    while t < dur - 0.05:
        i0 = int(t * SR); m = int(0.03 * SR)
        x[i0:i0 + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 220) * (0.6 + rng.random() * 0.4)
        t += 0.06 + rng.random() * 0.09
    return lowpass(x, 3)


# puerta de acero: golpe metálico con resonancia
def steel_door():
    n = int(1.4 * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(140, 5), (310, 7), (523, 9), (1270, 14)])
    x += lowpass(rng.standard_normal(n), 4) * np.exp(-t * 30) * 2
    return x


# zumbido de pantalla / escaneo
def scan():
    n = int(1.2 * SR); t = np.arange(n) / SR
    f = 600 + 900 * t / 1.2
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 * env(n, 0.05, 0.2) + 0.15 * np.sin(2 * np.pi * 60 * t)


if __name__ == '__main__':
    save('rotor', rotor()); save('phone_ring', phone()); save('news_sting', news())
    save('typing', typing()); save('steel_door', steel_door()); save('scan', scan())
    print('ok')


# voz de countryball: blips tonales rápidos (estilo "Animal Crossing")
def ball_talk(dur=1.6, base=420, seed=3):
    r = np.random.default_rng(seed); n = int(dur * SR); x = np.zeros(n + int(0.2 * SR)); t = 0.0
    while t < dur - 0.08:
        d = 0.05 + r.random() * 0.06; i0 = int(t * SR); m = int(d * SR); tt = np.arange(m) / SR
        f = base * (0.8 + r.random() * 0.7)
        s = (np.sign(np.sin(2 * np.pi * f * tt)) * 0.35 + np.sin(2 * np.pi * f * tt)) * np.sin(np.pi * tt / d) ** 0.6
        x[i0:i0 + m] += s * (0.6 + r.random() * 0.4); t += d + 0.015 + r.random() * 0.03
    return lowpass(x, 4)


# cámara instantánea: obturador + motor que expulsa la foto
def instant_cam():
    n = int(2.2 * SR); t = np.arange(n) / SR; x = np.zeros(n)
    m = int(0.06 * SR); x[:m] += rng.standard_normal(m) * np.exp(-np.arange(m) / SR * 80)
    i0 = int(0.25 * SR); m2 = int(1.6 * SR); tt = np.arange(m2) / SR
    motor = np.sin(2 * np.pi * (180 + 20 * np.sin(2 * np.pi * 9 * tt)) * tt) * 0.35 + lowpass(rng.standard_normal(m2), 6) * 0.25
    x[i0:i0 + m2] += motor * np.minimum(1, tt / 0.05) * np.minimum(1, (1.6 - tt) / 0.1)
    return x


if __name__ == '__main__':
    save('ball_talk', ball_talk()); save('ball_talk2', ball_talk(1.4, 330, 9)); save('ball_talk3', ball_talk(1.2, 520, 5))
    save('instant_cam', instant_cam()); print('ok2')
