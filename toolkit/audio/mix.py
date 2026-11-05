"""Atlas of War - mezclador final de música + efectos (+ voz opcional).

mix(duration, music, sfx, out_path, voice=None, duck_db=7.0, voice_duck_db=10.0, music_gain=0.75, sfx_gain=0.9, target_rms_db=-16.0)
  music: lista de dicts {t0, t1, track, offset=0, gain=1, fade_in=0.4, fade_out=1.0}
         track = nombre de la paleta ('epic', 'tension', ...) o ruta a un .wav. Se repite en bucle si hace falta.
  sfx:   lista de tuplas (t, name, gain, pan)  (gain y pan opcionales). name = nombre en audio/sfx o ruta .wav
  voice: lista de tuplas (t, ruta_wav, gain) o None. La música se agacha bajo la voz.
Uso CLI de prueba: python3 audio/mix.py --demo  -> audio/demo.wav
"""
import os, sys, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import musiclib as M
from musiclib import SR

HERE = os.path.dirname(os.path.abspath(__file__))
_cache = {}


def _load(path):
    if path not in _cache: _cache[path] = M.read_wav(path)
    return _cache[path]


def track_path(name):
    if name.endswith('.wav') or os.sep in name: return name
    return os.path.join(HERE, 'tracks', name + '.wav')


def sfx_path(name):
    if name.endswith('.wav') or os.sep in name: return name
    return os.path.join(HERE, 'sfx', name + '.wav')


def _smooth_env(x, att=0.01, rel=0.35):
    blk = 512; nb = int(np.ceil(len(x) / blk))
    pk = np.array([x[i * blk:(i + 1) * blk].max() if i * blk < len(x) else 0 for i in range(nb)])
    a_ = np.exp(-blk / (SR * att)); r_ = np.exp(-blk / (SR * rel))
    e = np.zeros(nb); cur = 0.0
    for i in range(nb):
        v = pk[i]; cur = a_ * cur + (1 - a_) * v if v > cur else r_ * cur + (1 - r_) * v; e[i] = cur
    return np.interp(np.arange(len(x)), np.arange(nb) * blk + blk / 2, e)


def mix(duration, music, sfx, out_path, voice=None, duck_db=7.0, voice_duck_db=10.0, music_gain=0.75, sfx_gain=0.9, target_rms_db=-16.0):
    N = int(round(duration * SR))
    mus = np.zeros((N, 2)); fx = np.zeros((N, 2)); vo = np.zeros((N, 2))
    for m in music:
        a = _load(track_path(m['track']))
        t0, t1 = float(m['t0']), float(m['t1'])
        i0, i1 = max(0, int(t0 * SR)), min(N, int(t1 * SR))
        if i1 <= i0: continue
        n = i1 - i0
        off = int(m.get('offset', 0.0) * SR) % len(a)
        idx = (off + np.arange(n)) % len(a)
        seg = a[idx] * m.get('gain', 1.0)
        fi = int(m.get('fade_in', 0.4) * SR); fo = int(m.get('fade_out', 1.0) * SR)
        if fi > 0: seg[:min(fi, n)] *= np.linspace(0, 1, min(fi, n))[:, None] ** 1.5
        if fo > 0: seg[-min(fo, n):] *= np.linspace(1, 0, min(fo, n))[:, None] ** 1.5
        mus[i0:i1] += seg
    for e in sfx:
        t, name = e[0], e[1]
        g = e[2] if len(e) > 2 else 1.0
        pan = e[3] if len(e) > 3 else 0.0
        a = _load(sfx_path(name))
        i0 = int(t * SR)
        if i0 >= N: continue
        s = a
        if i0 < 0: s = s[-i0:]; i0 = 0
        j = min(N, i0 + len(s))
        gl, gr = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
        fx[i0:j, 0] += s[: j - i0, 0] * g * gl; fx[i0:j, 1] += s[: j - i0, 1] * g * gr
    if voice:
        for t, path, g in voice:
            a = _load(path); i0 = int(t * SR)
            if i0 >= N: continue
            j = min(N, i0 + len(a)); vo[i0:j] += a[: j - i0] * g
    mus *= music_gain; fx *= sfx_gain
    # ducking: la música baja cuando suenan efectos fuertes o la voz
    fe = _smooth_env(np.abs(fx).max(1), 0.005, 0.45)
    red = np.clip(fe / 0.5, 0, 1) * duck_db
    if voice:
        ve = _smooth_env(np.abs(vo).max(1), 0.02, 0.5)
        red = np.maximum(red, np.clip(ve / 0.15, 0, 1) * voice_duck_db)
    mus *= (10 ** (-red / 20))[:, None]
    out = mus + fx + vo
    out = M.compress(out, thr_db=-12, ratio=2.5, att=0.004, rel=0.18)
    # ganancia de compensación: RMS global objetivo (ignora silencios)
    lv = np.abs(out).max(1); act = lv > 1e-3
    if act.any() and target_rms_db is not None:
        rms = np.sqrt((out[act] ** 2).mean())
        out = out * min(8.0, 10 ** (target_rms_db / 20) / max(rms, 1e-9))
    # limitador suave a -1 dBFS
    lim = 10 ** (-1.05 / 20)
    pk = np.abs(out).max()
    if pk > 0: out = out * min(1.0, 1.25 * lim / pk) if pk > 1.25 * lim else out
    a = np.abs(out)
    out = np.where(a > 0.75 * lim, np.sign(out) * (0.75 * lim + 0.25 * lim * np.tanh((a - 0.75 * lim) / (0.25 * lim))), out)
    M.write_wav(out_path, out)
    return out_path


if __name__ == '__main__':
    if '--demo' in sys.argv:
        music = [
            dict(t0=0, t1=11, track='tension', offset=0, gain=1.0, fade_in=0.5, fade_out=1.0),
            dict(t0=10, t1=21, track='epic', offset=40.0, gain=1.0, fade_in=1.0, fade_out=1.0),
            dict(t0=20, t1=30, track='triumph', offset=0, gain=1.0, fade_in=1.0, fade_out=2.0),
        ]
        sfx = [(0.2, 'whoosh', 1.0), (2.0, 'beep_lo', 0.6), (3.0, 'beep_lo', 0.6), (4.0, 'beep_hi', 0.8), (4.2, 'boom_big', 1.0),
               (7.0, 'riser_2s', 0.6), (9.0, 'vine-boom', 1.0, 0.0), (12.0, 'gunfire_burst', 0.6, -0.5), (13.5, 'cannon', 0.8, 0.4),
               (15.0, 'explosion_far', 0.7), (16.0, 'glitch', 0.6), (17.0, 'roulette_tick', 0.7)] + \
              [(17.0 + 0.08 * k ** 1.25, 'roulette_tick', 0.6) for k in range(1, 18)] + \
              [(19.6, 'roulette_stop', 0.9), (20.0, 'stinger_win', 1.0), (20.3, 'crowd_cheer', 0.7), (24.0, 'ding', 0.6), (25.0, 'yippee', 0.6)]
        p = mix(30.0, music, sfx, os.path.join(HERE, 'demo.wav'))
        a = M.read_wav(p)
        print('demo', p, round(len(a) / SR, 2), 's peak', round(20 * np.log10(np.abs(a).max()), 2), 'dBFS')
