# Constructor de shorts: guion -> src/sh/data/<v>.json + public/sh/<v>/*.jpg
import json, math, os, hashlib
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
import geo

R = '/home/claude/atlas-render/'
OW, OH = 1080, 1920

class Scene:
    def __init__(s, v, t0, t1, keys, wo=None, maxw=6200):
        s.v, s.t0, s.t1, s.keys, s.wo = v, t0, t1, keys, wo
        s.L, s.O, s.E = [], [], []
        # caja que cubre todos los encuadres (lon, lat, ancho visible en grados)
        xs, ys, ppd = [], [], []
        for (t, lon, lat, wd) in keys:
            x, y = geo.merc(lon, lat); hd = wd * OH / OW
            xs += [x - wd / 2 * 1.8, x + wd / 2 * 1.8]; ys += [y - hd / 2 * 1.45, y + hd / 2 * 1.45]
            ppd.append(OW / wd)
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        Wpx = min(maxw, max(1200, (x1 - x0) * max(ppd) * 0.95))
        s.view = geo.View(x0, geo.imerc(y0), x1, geo.imerc(y1), Wpx)
    def cam(s):
        out = []
        for (t, lon, lat, wd) in s.keys:
            x, y = s.view.px(lon, lat); out.append([round(t, 3), round(x, 1), round(y, 1), round(OW / (wd * s.view.k), 5)])
        return out
    def bb(s, g):
        p = s.view
        polys = list(getattr(g, 'geoms', [g]))
        big = max(q.area for q in polys)
        core = unary_union([q for q in polys if q.area >= big * 0.04])
        x0, y0, x1, y1 = core.bounds
        a, b = p.px(x0, y1), p.px(x1, y0)
        return [round(a[0], 1), round(a[1], 1), round(b[0] - a[0], 1), round(b[1] - a[1], 1)]
    def layer(s, g, f, t0, a='pop', o=None, ad=0.35, t1=None, **kw):
        d = s.view.path(g)
        if not d: return None
        L = dict(d=d, f=f, bb=s.bb(g), t0=round(t0, 3), a=a, ad=ad, **kw)
        if t1 is not None: L['t1'] = round(t1, 3)
        if o is not None:
            ox, oy = s.view.px(*o); L['o'] = [round(ox, 1), round(oy, 1)]
            bx, by, bw, bh = L['bb']; L['R'] = round(max(math.hypot(ox - X, oy - Y) for X in (bx, bx + bw) for Y in (by, by + bh)), 1)
        s.L.append(L); return L
    def outline(s, g, t0, t1=None, **kw):
        L = dict(d=s.view.path(g), t0=round(t0, 3), **kw)
        if t1 is not None: L['t1'] = round(t1, 3)
        s.O.append(L)
    def emblem(s, k, lon, lat, size_deg, t0, t1, **kw):
        x, y = s.view.px(lon, lat)
        s.E.append(dict(k=k, x=round(x, 1), y=round(y, 1), s=round(size_deg * s.view.k, 1), t0=round(t0, 3), t1=round(t1, 3), **kw))

class Video:
    def __init__(s, name, bpm, b0=0.12, dur=None):
        s.name, s.bpm, s.b0 = name, bpm, b0
        s.scenes, s.T, s.dark = [], [], []
        s.dur = dur
        s.music = None
    def b(s, n): return s.b0 + n * 60 / s.bpm
    def scene(s, t0, t1, keys, wo=None, **kw):
        sc = Scene(s, t0, t1, keys, wo, **kw); s.scenes.append(sc); return sc
    def text(s, text, t0, t1, y=230, size=150, k='title', **kw):
        s.T.append(dict(text=text, t0=round(t0, 3), t1=round(t1, 3), y=y, size=size, k=k, **kw))
    def save(s):
        os.makedirs(R + f'public/sh/{s.name}', exist_ok=True)
        out = []
        for i, sc in enumerate(s.scenes):
            v = sc.view
            key = hashlib.md5(f'{v.x0:.4f}{v.x1:.4f}{v.y0:.4f}{v.y1:.4f}{v.W}'.encode()).hexdigest()[:8]
            fn = f'sh/{s.name}/bg_{key}.jpg'
            if not os.path.exists(R + 'public/' + fn): geo.render_bg(v, R + 'public/' + fn)
            d = dict(t0=round(sc.t0, 3), t1=round(sc.t1, 3), bg=fn, bw=v.W, bh=v.H, cam=sc.cam(), L=sc.L, O=sc.O, E=sc.E)
            if sc.wo: d['wo'] = sc.wo
            if i > 0 and s.scenes[i - 1].wo: d['wi'] = s.scenes[i - 1].wo
            out.append(d)
        dur = s.dur or s.scenes[-1].t1
        J = dict(dur=round(dur, 3), scenes=out, T=s.T, dark=s.dark, music=(s.music or f'sh/music/{s.name}.wav'), bpm=s.bpm, b0=s.b0)
        os.makedirs(R + 'src/sh/data', exist_ok=True)
        json.dump(J, open(R + f'src/sh/data/{s.name}.json', 'w'), separators=(',', ':'))
        kb = os.path.getsize(R + f'src/sh/data/{s.name}.json') // 1024
        print(s.name, 'dur', round(dur, 2), 's · escenas', len(out), '· json', kb, 'KB')

def pct(part, whole):
    return 100 * geo.area_km2(part.intersection(whole)) / geo.area_km2(whole)

def centroid(g):
    c = g.representative_point(); return (c.x, c.y)
