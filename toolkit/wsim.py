"""Librería de directores para los vídeos 'A World With' (motor src/World). Tiempos en segundos."""
import json, math, random, os
import numpy as np
from warlib import K, CAP, CITY, cells, X, Y, codes, NAMES
from wlib2 import proj

class Vid:
    def __init__(self, vid, seed=1):
        self.v = vid; self.SC = []; self.T = 0.0; self.SFX = []; self.MUS = []; self.extra = {}
        self.rng = np.random.default_rng(seed); random.seed(seed); self._last = {}
    # ---------- escenas ----------
    def sc(self, kind, d, id=None, **p):
        p['kind'] = kind; t0 = self.T
        self.SC.append([id or kind.upper(), round(t0, 2), round(t0 + d, 2), p]); self.T += d; return t0
    # ---------- audio ----------
    def S(self, t, name, g=0.6, pan=0.0): self.SFX.append([round(t, 3), name, round(g, 3), pan])
    def SV(self, t, kind, g=0.6, pan=0.0):
        n = {'boom': 12, 'hit': 9, 'gun': 14, 'far': 8, 'whoosh': 7, 'stamp': 3}[kind]; i = random.randint(1, n)
        while i == self._last.get(kind): i = random.randint(1, n)
        self._last[kind] = i; self.S(t, f'{kind}_{i}', g, pan)
    def M(self, t0, t1, track, off=0, g=0.75, fi=0.6, fo=1.0): self.MUS.append(dict(t0=round(t0, 2), t1=round(t1, 2), track=track, offset=off, gain=g, fade_in=fi, fade_out=fo))
    def talk(self, t, bubs):
        for (tt, k, *_r) in bubs: self.S(t + tt, ['ball_talk', 'ball_talk2', 'ball_talk3'][k % 3], 0.5)
    def chap_snd(self, t): self.S(t + 0.05, 'whoosh_5', 0.45); self.S(t + 0.3, 'thit', 0.45)
    # ---------- export ----------
    def export(self, **extra):
        out = dict(total=round(self.T, 2), scenes=self.SC); out.update(self.extra); out.update(extra)
        os.makedirs('src/World/data', exist_ok=True)
        json.dump(out, open(f'src/World/data/{self.v}.json', 'w'), separators=(',', ':'))
        os.makedirs('src/World/audio', exist_ok=True)
        json.dump(dict(dur=round(self.T, 2), music=self.MUS, sfx=sorted(self.SFX)), open(f'src/World/audio/{self.v}.json', 'w'))
        print(self.v, 'DUR', round(self.T, 1), 'scenes', len(self.SC), 'sfx', len(self.SFX))
        return out

def P(lon, lat): return list(proj(lon, lat))
def cap(c): k = K[c]; return [round(CAP[k][0]), round(CAP[k][1])]
def ks(*cs): return [K[c] for c in cs if c in K]
def city(c, name):
    cs = [x for x in CITY[K[c]] if name in x['name']]; return [round(cs[0]['x']), round(cs[0]['y'])]
WORLD = [3840, 2200, 0.262]
def cam_on(c, s=1.2, dx=0, dy=0): x, y = cap(c); return [x + dx, y + dy, s]
def tint(ks_, col, akf, stag=0.0, crack=False, stroke=None):
    d = dict(ks=ks_, col=col, a=akf, stag=stag)
    if crack: d['crack'] = True
    if stroke: d['stroke'] = stroke
    return d
def sample_in(rng, c, n, city_bias=0.6):
    k = K[c]; ce = cells[k]; out = []; cs = CITY.get(k, [])[:10]
    if len(ce) == 0: return out
    for i in range(n):
        if cs and rng.random() < city_bias:
            cc = cs[min(int(rng.exponential(2.0)), len(cs) - 1)]
            j = ce[np.argmin((X[ce] - cc['x']) ** 2 + (Y[ce] - cc['y']) ** 2 + rng.random(len(ce)) * 900 * 30)]
        else: j = rng.choice(ce)
        out.append([round(float(X[j] + rng.uniform(-8, 8))), round(float(Y[j] + rng.uniform(-8, 8)))])
    return out
def all_ks(): return [k for k in range(len(codes)) if k in CAP]
def lat_of(k):
    ce = cells[k]
    if len(ce) == 0: return 0.0
    from warlib import cen
    return 0.0
_Z = np.load('data/hexworld.npz'); _LAT = _Z['lat']; _O = _Z['O']
LAT = {k: float(_LAT[_O == k].mean()) if (_O == k).any() else 0.0 for k in range(len(codes))}
POPM = json.load(open('data/pop.json'))   # población por código
def pop_of(k): return POPM.get(codes[k], 1e5)
