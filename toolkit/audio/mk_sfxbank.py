import sys, numpy as np
sys.path.insert(0, 'audio')
import musiclib as M
from musiclib import SR
from scipy.signal import resample
rng = np.random.default_rng(3)
def ld(n): return M.read_wav(f'audio/sfx/{n}.wav')
def pitch(x, f):
    n = int(len(x) / f); return resample(x, n, axis=0)
def out(n, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.9
    M.write_wav(f'audio/sfx/{n}.wav', x)
def layer(a, b, off, gb=0.6):
    n = max(len(a), off + len(b)); y = np.zeros((n, 2)); y[:len(a)] += a; y[off:off + len(b)] += b * gb; return y
bb, bs, ef, ca, ih, gu, wh, bc, wp = [ld(n) for n in ['boom_big', 'boom_small', 'explosion_far', 'cannon', 'impact_hit', 'gunfire_burst', 'whoosh', 'bone-crack', 'whip']]
out('boom_1', bb); out('boom_2', pitch(bb, 0.85)); out('boom_3', layer(pitch(ca, 0.9), ef, int(0.05 * SR), 0.7)); out('boom_4', pitch(bs, 0.8)); out('boom_5', layer(bb, pitch(ef, 1.2), int(0.12 * SR), 0.5)); out('boom_6', pitch(ca, 0.75))
out('hit_1', ih); out('hit_2', pitch(ih, 0.85)); out('hit_3', pitch(ih, 1.15)); out('hit_4', layer(pitch(ih, 0.9), bc, 0, 0.5)); out('hit_5', pitch(bs, 1.3))
for i, f in enumerate([1.0, 0.88, 1.12, 0.95, 1.2, 0.8, 1.05, 0.92]):
    x = pitch(gu, f)
    st = int(rng.uniform(0, 0.3) * len(x)); x = x[st:st + int(rng.uniform(0.45, 0.9) * (len(x) - st))]
    fade = np.linspace(1, 0, min(len(x), int(0.08 * SR)))[:, None]; x[-len(fade):] *= fade
    out(f'gun_{i + 1}', x)
for i, f in enumerate([1.0, 0.85, 1.18, 0.7]): out(f'far_{i + 1}', pitch(ef, f))
for i, f in enumerate([1.0, 0.85, 1.2, 0.95]): out(f'whoosh_{i + 1}', pitch(wh, f))
out('stamp_1', layer(pitch(ih, 1.25), pitch(wp, 1.1), 0, 0.4)); out('stamp_2', pitch(bs, 1.5)); out('stamp_3', layer(pitch(ih, 1.4), pitch(ca, 1.6), 0, 0.3))
print('ok')
