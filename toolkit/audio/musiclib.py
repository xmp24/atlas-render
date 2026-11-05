"""Atlas of War - librería de síntesis musical.
Todas las funciones de instrumento reciben un Track (buffers estéreo con buses y envío de reverb).
"""
import numpy as np
from scipy.signal import butter, sosfilt, oaconvolve

SR = 44100
_rng = np.random.default_rng(1234)


def set_seed(s):
    global _rng
    _rng = np.random.default_rng(s)


def rng():
    return _rng


# ---------------------------------------------------------------- utilidades
def t_(d):
    return np.arange(max(1, int(SR * d))) / SR


def _sos(kind, f, o=2):
    ny = SR / 2
    if kind == 'band':
        lo, hi = f
        lo = max(10.0, lo); hi = min(hi, ny * 0.95)
        if hi <= lo * 1.05: hi = lo * 1.05
        return butter(o, [lo / ny, hi / ny], 'band', output='sos')
    return butter(o, min(max(f, 10.0), ny * 0.95) / ny, kind, output='sos')


def lp(x, f, o=2): return sosfilt(_sos('low', f, o), x)
def hp(x, f, o=2): return sosfilt(_sos('high', f, o), x)
def bp(x, lo, hi, o=2): return sosfilt(_sos('band', (lo, hi), o), x)
def note(n): return 440.0 * 2 ** ((n - 69) / 12)


def env(a, d_, s, r, total):
    t = t_(total); e = np.ones_like(t) * s
    if a > 0: e[t < a] = t[t < a] / a
    m = (t >= a) & (t < a + d_); e[m] = 1 - (1 - s) * (t[m] - a) / max(d_, 1e-6)
    rel = t > total - r; e[rel] *= np.clip((total - t[rel]) / max(r, 1e-6), 0, 1)
    return e


def phase(f, d, vib=0.0, vrate=5.0, ph0=None):
    t = t_(d)
    fr = f * (1 + vib * np.sin(2 * np.pi * vrate * t + _rng.random() * 6))
    p = np.cumsum(fr) / SR
    return p + (_rng.random() if ph0 is None else ph0)


def saw_p(p): return 2 * (p % 1) - 1
def sq_p(p, pw=0.5): return np.where((p % 1) < pw, 1.0, -1.0)
def tri_p(p): return 2 * np.abs(2 * (p % 1) - 1) - 1
def saw(f, d): return saw_p(phase(f, d, ph0=0.0))
def sq(f, d, pw=0.5): return sq_p(phase(f, d, ph0=0.0), pw)
def sine(f, d): return np.sin(2 * np.pi * f * t_(d))
def noise(d): return _rng.standard_normal(len(t_(d)))


def sweep_noise(d, f0, f1, parts=24, q=0.45, curve=2.0):
    """ruido filtrado con un pasabanda que barre de f0 a f1"""
    n = noise(d); out = np.zeros_like(n)
    idx = np.array_split(np.arange(len(n)), parts)
    for i, ix in enumerate(idx):
        k = (i / max(1, parts - 1)) ** curve
        fc = f0 * (f1 / f0) ** k
        out[ix] = bp(n, fc * (1 - q), fc * (1 + q))[ix]
    return out


def make_ir(dur=2.4, decay=3.2, seed=7, damp=5500):
    r = np.random.default_rng(seed)
    t = t_(dur)
    e = np.exp(-t * decay)
    L = lp(r.standard_normal(len(t)), damp) * e
    R = lp(r.standard_normal(len(t)), damp) * e
    pre = int(0.018 * SR)
    L = np.r_[np.zeros(pre), L][: len(t)]; R = np.r_[np.zeros(pre + 37), R][: len(t)]
    L[:int(0.004 * SR)] = 0
    return L / np.sqrt((L ** 2).sum()), R / np.sqrt((R ** 2).sum())


IR_HALL = None


# ---------------------------------------------------------------- track
class Track:
    """Buffer estéreo con buses. dur = duración útil; tail = cola extra que se pliega al inicio (loop)."""

    def __init__(self, dur, tail=4.0):
        self.dur = dur; self.tail = tail
        self.N = int(SR * (dur + tail))
        self.buses = {}

    def bus(self, name):
        if name not in self.buses:
            z = lambda: np.zeros(self.N, np.float64)
            self.buses[name] = dict(L=z(), R=z(), WL=z(), WR=z())
        return self.buses[name]

    def add(self, sig, start, gain=1.0, pan=0.0, rev=0.25, bus='main'):
        if start >= self.dur + self.tail or gain == 0: return
        i = int(round(start * SR))
        if i < 0:
            sig = sig[-i:]; i = 0
        j = min(self.N, i + len(sig))
        if j <= i: return
        s = sig[: j - i] * gain
        pan = float(np.clip(pan, -1, 1))
        gl, gr = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
        b = self.bus(bus)
        b['L'][i:j] += s * gl; b['R'][i:j] += s * gr
        if rev:
            b['WL'][i:j] += s * gl * rev; b['WR'][i:j] += s * gr * rev

    def render(self, bus_env=None, ir=None, rev_gain=0.55, loop=True, master=1.0):
        global IR_HALL
        if ir is None:
            if IR_HALL is None: IR_HALL = make_ir()
            ir = IR_HALL
        L = np.zeros(self.N); R = np.zeros(self.N); WL = np.zeros(self.N); WR = np.zeros(self.N)
        for name, b in self.buses.items():
            e = 1.0 if not bus_env or name not in bus_env else bus_env[name]
            L += b['L'] * e; R += b['R'] * e; WL += b['WL'] * e; WR += b['WR'] * e
        rl = oaconvolve(WL, ir[0])[: self.N]; rr = oaconvolve(WR, ir[1])[: self.N]
        L += rl * rev_gain; R += rr * rev_gain
        # quitar subgraves y DC
        L = hp(L, 28); R = hp(R, 28)
        n = int(SR * self.dur)
        if loop:
            tl = self.N - n
            L[:tl] += L[n:]; R[:tl] += R[n:]
        L, R = L[:n], R[:n]
        return np.stack([L, R], 1) * master


def normalize(x, peak_db=-1.0):
    p = np.abs(x).max()
    if p <= 0 or not np.isfinite(p): return x
    return x * (10 ** (peak_db / 20) / p)


def soft_clip(x, drive=1.0):
    return np.tanh(x * drive) / np.tanh(drive)


def compress(x, thr_db=-14, ratio=3.0, att=0.005, rel=0.12):
    """compresor de envolvente sencillo (enlazado estéreo)"""
    lvl = np.abs(x).max(1) if x.ndim == 2 else np.abs(x)
    # envolvente con ataque/relajación (vectorizado por bloques)
    blk = 256
    nb = int(np.ceil(len(lvl) / blk))
    pk = np.array([lvl[i * blk:(i + 1) * blk].max() for i in range(nb)])
    a_ = np.exp(-blk / (SR * att)); r_ = np.exp(-blk / (SR * rel))
    e = np.zeros(nb); cur = 0.0
    for i in range(nb):
        v = pk[i]
        cur = a_ * cur + (1 - a_) * v if v > cur else r_ * cur + (1 - r_) * v
        e[i] = cur
    edb = 20 * np.log10(np.maximum(e, 1e-9))
    gdb = np.where(edb > thr_db, (thr_db - edb) * (1 - 1 / ratio), 0.0)
    g = 10 ** (gdb / 20)
    g = np.interp(np.arange(len(lvl)), np.arange(nb) * blk + blk / 2, g)
    return x * (g[:, None] if x.ndim == 2 else g)


def write_wav(path, x):
    import wave
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    d = (x * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())


def read_wav(path):
    import wave
    with wave.open(path, 'rb') as w:
        ch, sw, sr, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if sw == 2: a = np.frombuffer(raw, '<i2').astype(np.float64) / 32768
    elif sw == 1: a = (np.frombuffer(raw, np.uint8).astype(np.float64) - 128) / 128
    elif sw == 3:
        b = np.frombuffer(raw, np.uint8).reshape(-1, 3)
        v = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
        v = np.where(v & 0x800000, v - 0x1000000, v); a = v / 8388608.0
    elif sw == 4: a = np.frombuffer(raw, '<i4').astype(np.float64) / 2147483648
    else: raise ValueError(sw)
    a = a.reshape(-1, ch)
    if ch == 1: a = np.repeat(a, 2, 1)
    a = a[:, :2]
    if sr != SR:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(SR, sr); a = resample_poly(a, SR // g, sr // g, axis=0)
    return a


# ---------------------------------------------------------------- instrumentos tonales
def strings(tr, notes, start, d, g=0.04, cutoff=2600, att=0.5, rel=None, pan_spread=0.15, bus='main', rev=0.45):
    for n in notes:
        f = note(n)
        s = sum(saw_p(phase(f * dt, d, vib=0.004, vrate=5.2)) for dt in (0.993, 0.998, 1.0, 1.003, 1.008)) / 5
        r_ = min(0.8, d / 3) if rel is None else rel
        tr.add(lp(s, cutoff) * env(att, 0.3, 0.9, r_, d), start, g, pan=((n % 7) - 3) * pan_spread / 3 * 2, rev=rev, bus=bus)


def ostinato(tr, notes, start, step, g=0.035, cutoff=3000, bus='main', pan=0.3):
    """cuerdas staccato (spiccato) a ritmo constante"""
    for k, n in enumerate(notes):
        if n is None: continue
        d = step * 0.75
        f = note(n)
        s = sum(saw_p(phase(f * dt, d)) for dt in (0.996, 1.0, 1.004)) / 3
        s = lp(s, cutoff) * env(0.006, 0.06, 0.35, 0.04, d)
        tr.add(s, start + k * step, g, pan=pan * (1 if k % 2 else -1), rev=0.3, bus=bus)


def choir(tr, notes, start, d, g=0.035, vowel='a', bus='main'):
    F = {'a': ((650, 950, 1.0), (1050, 1300, 0.6), (2600, 3100, 0.25)),
         'o': ((400, 600, 1.0), (750, 1000, 0.55), (2300, 2700, 0.2)),
         'u': ((300, 450, 1.0), (650, 900, 0.4), (2200, 2500, 0.15))}[vowel]
    for n in notes:
        f = note(n)
        src = sum(saw_p(phase(f * dt, d, vib=0.006, vrate=4.6)) for dt in (0.995, 1.0, 1.006)) / 3
        s = sum(bp(src, lo, hi) * gg for lo, hi, gg in F)
        tr.add(s * env(0.9, 0.3, 0.9, min(1.0, d / 3), d), start, g * 2.2, pan=((n % 5) - 2) * 0.15, rev=0.6, bus=bus)


def piano(tr, n, start, g=0.06, pan=0.0, d=2.5, bus='main', bright=1.0):
    f = note(n); t = t_(d)
    s = sum((1 / k ** (1.3 / bright)) * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.2 + k * 0.8)) for k in range(1, 7))
    s += lp(noise(d), 3000) * np.exp(-t * 60) * 0.05
    s *= np.clip((d - t) / 0.05, 0, 1)
    tr.add(s, start, g, pan, rev=0.4, bus=bus)


def bell(tr, n, start, g=0.05, pan=0.0, d=3.0, bus='main'):
    f = note(n); t = t_(d)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dc) for r, a, dc in ((1, 1, 1.5), (2.76, 0.5, 2.5), (5.4, 0.25, 4), (8.93, 0.12, 6)))
    tr.add(s * np.clip(t / 0.002, 0, 1), start, g, pan, rev=0.5, bus=bus)


def brass(tr, chord, start, d, g=0.055, cutoff=1600, att=0.08, bus='main', pan_spread=0.3):
    for n in chord:
        f = note(n); t = t_(d)
        s = sum(saw_p(phase(f * dt, d, vib=0.003, vrate=5.5)) for dt in (0.995, 1.0, 1.006)) / 3
        # filtro que se abre (aproximado: mezcla de dos cortes)
        k = np.clip(t / 0.25, 0, 1)
        s = lp(s, cutoff * 0.5) * (1 - k) + lp(s, cutoff) * k
        s = s * env(att, 0.3, 0.75, min(0.5, d / 3), d)
        tr.add(s, start, g, pan=(n % 3 - 1) * pan_spread, rev=0.35, bus=bus)


def fanfare(tr, notes, start, step, g=0.05, cutoff=2400, bus='main'):
    """melodía de metales: notes = lista de (nota, duración_en_pasos)"""
    t0 = start
    for n, l in notes:
        d = l * step
        if n is not None:
            brass(tr, [n], t0, d * 0.95, g, cutoff, att=0.03, bus=bus, pan_spread=0)
            brass(tr, [n - 12], t0, d * 0.95, g * 0.5, cutoff * 0.7, att=0.03, bus=bus, pan_spread=0)
        t0 += d


def bass(tr, n, start, d, g=0.14, cutoff=700, bus='main', kind='saw'):
    f = note(n)
    if kind == 'saw': s = lp(saw(f, d) + 0.5 * sq(f / 2, d), cutoff)
    elif kind == 'sub': s = sine(f, d) + 0.25 * lp(saw(f, d), cutoff)
    elif kind == 'tri': s = tri_p(phase(f, d, ph0=0.0))
    elif kind == 'reese':
        s = lp(saw(f * 0.995, d) + saw(f * 1.005, d) + 0.6 * sine(f / 2, d), cutoff)
    else: s = lp(saw(f, d), cutoff)
    tr.add(s * env(0.005, 0.08, 0.6, 0.03, d), start, g, rev=0.05, bus=bus)


def pluck(tr, n, start, d, g=0.045, cutoff=2600, pan=0.35, bus='main', rev=0.3):
    s = lp((saw(note(n) * 1.004, d) + saw(note(n) * 0.996, d)) / 2, cutoff) * env(0.004, 0.05, 0.4, 0.04, d)
    tr.add(s, start, g, pan=pan, rev=rev, bus=bus)


def supersaw(tr, n, start, d, g=0.03, cutoff=5000, bus='main', rev=0.35):
    f = note(n)
    s = sum(saw_p(phase(f * dt, d)) for dt in (0.985, 0.993, 0.998, 1.0, 1.002, 1.007, 1.015)) / 5
    s = lp(s, cutoff) * env(0.01, 0.1, 0.8, 0.06, d)
    sl = s * 0.85; sr_ = s * 0.85
    tr.add(sl, start, g, pan=-0.5, rev=rev, bus=bus); tr.add(sr_, start + 0.007, g, pan=0.5, rev=rev, bus=bus)


def pad(tr, chord, start, d, g=0.03, cutoff=1400, att=1.2, bus='main', wide=True):
    for i, n in enumerate(chord):
        f = note(n)
        s = sum(saw_p(phase(f * dt, d, vib=0.002, vrate=0.3 + 0.1 * i)) for dt in (0.992, 1.0, 1.008)) / 3
        s = lp(s, cutoff) * env(att, 0.5, 0.85, min(1.5, d / 2), d)
        tr.add(s, start, g, pan=(-0.6 + 1.2 * i / max(1, len(chord) - 1)) if wide else 0, rev=0.6, bus=bus)


def chip_lead(tr, n, start, d, g=0.03, pw=0.25, vib=0.0, bus='main', pan=0.0, slide_from=None):
    f = note(n)
    if slide_from is not None:
        t = t_(d); f0 = note(slide_from)
        fr = f0 + (f - f0) * np.clip(t / 0.05, 0, 1)
        p = np.cumsum(fr * (1 + vib * np.sin(2 * np.pi * 6 * t))) / SR
    else:
        p = phase(f, d, vib=vib, vrate=6.0, ph0=0.0)
    s = sq_p(p, pw) * env(0.002, 0.05, 0.7, 0.02, d)
    tr.add(lp(s, 9000), start, g, pan=pan, rev=0.12, bus=bus)


def chip_tri(tr, n, start, d, g=0.09, bus='main'):
    s = tri_p(phase(note(n), d, ph0=0.0)) * env(0.002, 0.02, 0.9, 0.01, d)
    tr.add(s, start, g, rev=0.0, bus=bus)


def arp(tr, chord, start, d, step, g=0.035, octave=12, pattern=(0, 1, 2, 1), inst='pluck', bus='main', cutoff=3200, pan=0.3):
    n = int(round(d / step))
    for k in range(n):
        idx = pattern[k % len(pattern)]
        nn = chord[idx % len(chord)] + octave * (idx // len(chord)) + octave
        tt = start + k * step
        if inst == 'pluck': pluck(tr, nn, tt, step * 0.9, g, cutoff, pan=pan * (1 if k % 2 else -1), bus=bus)
        elif inst == 'chip': chip_lead(tr, nn, tt, step * 0.85, g, pw=0.125, bus=bus, pan=pan * (1 if k % 2 else -1))
        elif inst == 'bell': bell(tr, nn, tt, g, pan=pan * (1 if k % 2 else -1), d=step * 4, bus=bus)
        elif inst == 'piano': piano(tr, nn, tt, g, pan=pan * (1 if k % 2 else -1), d=step * 4, bus=bus)


def drone(tr, n, start, d, g=0.09, cutoff=220, bus='main', beat=1.01):
    s = lp(saw(note(n), d) + saw(note(n) * beat, d), cutoff) * env(min(2.0, d / 3), 0.1, 1, min(2.0, d / 3), d)
    tr.add(s, start, g, rev=0.4, bus=bus)


def cluster(tr, notes, start, d, g=0.03, bus='main'):
    """acorde disonante con trémolo (terror)"""
    for i, n in enumerate(notes):
        t = t_(d)
        s = lp(saw_p(phase(note(n), d, vib=0.01, vrate=0.7 + i * 0.13)), 1800)
        trem = 0.7 + 0.3 * np.sin(2 * np.pi * (6 + i) * t)
        tr.add(s * trem * env(d * 0.4, 0.1, 1.0, d * 0.4, d), start, g, pan=(i - len(notes) / 2) * 0.25, rev=0.7, bus=bus)


# ---------------------------------------------------------------- percusión
def taiko(tr, t0, g=1.0, pan=0.0, bus='drums'):
    t = t_(1.0)
    body = np.sin(2 * np.pi * (52 + 95 * np.exp(-t * 24)) * t) * np.exp(-t * 4.5)
    slap = lp(noise(1.0), 1600) * np.exp(-t * 38) * 0.6
    tr.add(body + slap, t0, 0.5 * g, pan, rev=0.35, bus=bus)


def kick(tr, t0, g=1.0, bus='drums', punch=1.0, d=0.5):
    t = t_(d)
    s = np.sin(2 * np.pi * (45 + 110 * punch * np.exp(-t * 32)) * t) * np.exp(-t * 7)
    s += hp(noise(d), 3000) * np.exp(-t * 300) * 0.25 * punch
    tr.add(soft_clip(s * 1.4, 1.5), t0, 0.5 * g, rev=0.03, bus=bus)


def snare(tr, t0, g=1.0, bus='drums', tone=185, pan=0.1, rev=0.3):
    t = t_(0.35)
    s = hp(noise(0.35), 1400) * np.exp(-t * 17) * 0.7 + np.sin(2 * np.pi * tone * t) * np.exp(-t * 24) * 0.5
    tr.add(s, t0, 0.19 * g, pan, rev=rev, bus=bus)


def clap(tr, t0, g=1.0, bus='drums'):
    t = t_(0.3); n = bp(noise(0.3), 900, 2500)
    e = np.zeros_like(t)
    for o in (0, 0.009, 0.018): e += np.where(t >= o, np.exp(-(t - o) * 90), 0)
    e += np.exp(-t * 14) * 0.5
    tr.add(n * e, t0, 0.16 * g, 0.0, rev=0.35, bus=bus)


def hat(tr, t0, g=1.0, open_=False, bus='drums', pan=-0.3):
    d = 0.3 if open_ else 0.06
    t = t_(d); tr.add(hp(noise(d), 7500) * np.exp(-t * (12 if open_ else 60)), t0, 0.045 * g, pan, rev=0.1, bus=bus)


def shaker(tr, t0, g=1.0, bus='drums'):
    t = t_(0.08); tr.add(bp(noise(0.08), 5000, 11000) * np.sin(np.pi * t / 0.08), t0, 0.03 * g, 0.35, rev=0.1, bus=bus)


def crash(tr, t0, g=1.0, bus='drums'):
    d = 2.5; t = t_(d)
    s = hp(noise(d), 4000) * np.exp(-t * 1.8) + bp(noise(d), 2500, 6000) * np.exp(-t * 3) * 0.4
    tr.add(s, t0, 0.07 * g, 0.2, rev=0.4, bus=bus)


def tick(tr, t0, g=1.0, bus='drums', pan=0.4):
    t = t_(0.04); tr.add(bp(noise(0.04), 2500, 6000) * np.exp(-t * 90), t0, 0.07 * g, pan, rev=0.2, bus=bus)


def timpani(tr, t0, n=40, g=1.0, bus='drums', d=1.6):
    t = t_(d); f = note(n)
    s = (np.sin(2 * np.pi * f * t * (1 - 0.01 * t)) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 3)) * np.exp(-t * 2.8)
    s += lp(noise(d), 800) * np.exp(-t * 30) * 0.3
    tr.add(s, t0, 0.3 * g, 0.0, rev=0.45, bus=bus)


def timp_roll(tr, t0, d, n=40, g0=0.05, g1=0.3, bus='drums'):
    k_ = int(d * 14)
    for k in range(k_):
        tt = t0 + d * (k / k_) ** 0.85
        timpani(tr, tt, n, (g0 + (g1 - g0) * (k / k_) ** 2) / 0.3, bus=bus, d=0.4)


def snare_roll(tr, t0, d, g0=0.2, g1=1.0, rate=16, bus='drums'):
    k_ = int(d * rate)
    for k in range(k_):
        snare(tr, t0 + k / rate, g0 + (g1 - g0) * (k / k_) ** 1.5, bus=bus, rev=0.2)


def noise_drum(tr, t0, kind='snare', g=1.0, bus='drums'):
    """batería 8-bit"""
    if kind == 'kick':
        d = 0.12; t = t_(d)
        f = 140 * np.exp(-t * 30) + 40
        s = sq_p(np.cumsum(f) / SR) * np.exp(-t * 25)
    elif kind == 'hat':
        d = 0.04; t = t_(d)
        s = np.sign(noise(d)) * np.exp(-t * 80) * 0.5
        s = hp(s, 6000)
    else:
        d = 0.15; t = t_(d)
        s = np.sign(noise(d)) * np.exp(-t * 22)
        s = lp(s, 7000)
    tr.add(s, t0, 0.18 * g, 0.0, rev=0.08, bus=bus)


def metal_hit(tr, t0, g=1.0, bus='drums'):
    d = 3.0; t = t_(d)
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dc) for f, dc in ((231, 1.2), (557, 1.6), (893, 2.1), (1407, 2.8), (2213, 3.5), (3109, 4.5)))
    s += hp(noise(d), 3000) * np.exp(-t * 15) * 0.5
    tr.add(s / 3, t0, 0.12 * g, 0.0, rev=0.7, bus=bus)


def heartbeat(tr, t0, g=1.0, bus='drums'):
    kick(tr, t0, 0.6 * g, bus=bus, punch=0.4); kick(tr, t0 + 0.22, 0.4 * g, bus=bus, punch=0.3)


# ---------------------------------------------------------------- texturas
def riser(tr, t0, d, g=0.25, bus='fx', f0=300, f1=6000):
    s = sweep_noise(d, f0, f1, parts=30) * np.linspace(0, 1, len(t_(d))) ** 2
    tr.add(s, t0, g, rev=0.35, bus=bus)


def downlifter(tr, t0, d, g=0.2, bus='fx'):
    s = sweep_noise(d, 5000, 200, parts=24, curve=0.7) * np.linspace(1, 0, len(t_(d))) ** 1.5
    tr.add(s, t0, g, rev=0.4, bus=bus)


def impact(tr, t0, g=1.0, bus='fx'):
    d = 3.0; t = t_(d)
    sub = np.sin(2 * np.pi * (36 + 60 * np.exp(-t * 6)) * t) * np.exp(-t * 1.8)
    crash_ = lp(noise(d), 2400) * np.exp(-t * 3.0)
    tr.add((sub * 0.8 + crash_ * 0.35) * np.clip(t / 0.003, 0, 1), t0, 0.3 * g, rev=0.4, bus=bus)


def clock_tick(tr, t0, g=1.0, hi=True, bus='drums'):
    d = 0.05; t = t_(d)
    f = 3200 if hi else 2400
    s = (np.sin(2 * np.pi * f * t) * 0.5 + bp(noise(d), 2000, 7000)) * np.exp(-t * 120)
    tr.add(s, t0, 0.09 * g, 0.25 if hi else -0.25, rev=0.25, bus=bus)


def sidechain_env(dur, beat, depth=0.6, rel=0.22, offset=0.0, start=0.0, end=None, tail=4.0):
    """envolvente de 'pumping' (para buses de pads/bajos) en todo el buffer"""
    N = int(SR * (dur + tail)); t = np.arange(N) / SR
    ph = ((t - offset) % beat)
    e = 1 - depth * np.exp(-ph / (rel * beat / 0.5) * 3)
    if end is None: end = dur + tail
    m = (t < start) | (t >= end)
    e[m] = 1.0
    return e
