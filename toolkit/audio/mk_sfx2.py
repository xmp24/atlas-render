import sys, numpy as np
sys.path.insert(0, 'audio')
import musiclib as M
from musiclib import SR
rng = np.random.default_rng(5)
def st(x): return np.c_[x, x]
t = np.arange(int(1.6 * SR)) / SR
f = 55 * np.exp(-t * 1.2) + 28
ph = 2 * np.pi * np.cumsum(f) / SR
sub = np.sin(ph) * np.exp(-t * 1.6) * np.minimum(1, t * 80)
M.write_wav('audio/sfx/sub_drop.wav', st(sub * 0.95))
t = np.arange(int(1.1 * SR)) / SR
f = 2600 * np.exp(-t * 1.3) + 500
ph = 2 * np.pi * np.cumsum(f) / SR
wh = np.sin(ph) * (0.25 + 0.75 * t / 1.1) * np.minimum(1, (1.1 - t) * 30) * 0.35
M.write_wav('audio/sfx/whistle.wav', st(wh))
t = np.arange(int(2.4 * SR)) / SR
n = rng.standard_normal(len(t))
env = np.exp(-((t - 1.0) / 0.55) ** 2)
lo = M.lp(n, 900); hi = M.bp(n, 1500, 5000)
jet = (lo * 0.8 + hi * 0.25) * env
pan = np.clip((t - 0.2) / 1.8, 0, 1)
M.write_wav('audio/sfx/jet.wav', np.c_[jet * (1 - pan * 0.7), jet * (0.3 + pan * 0.7)] / (np.abs(jet).max() + 1e-9) * 0.8)
print('ok')
