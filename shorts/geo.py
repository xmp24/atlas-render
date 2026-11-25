# Geografía para los shorts: imagen satélite (NASA Blue Marble, dominio público) en Mercator + regiones
import json, math, os, pickle
import numpy as np
from shapely.geometry import shape, Polygon, MultiPolygon, Point, box
from shapely.ops import unary_union
from shapely import affinity

G = '/root/geo/'
SRC_W, SRC_H = 21600, 10800

def _bm():
    p = G + 'bm21k.npy'
    if not os.path.exists(p):
        from PIL import Image
        Image.MAX_IMAGE_PIXELS = None
        a = np.asarray(Image.open(G + 'bm21k.jpg').convert('RGB'))
        np.save(p, a)
    return np.load(p, mmap_mode='r')

def _load(name, key):
    pk = G + name + '.pkl'
    if os.path.exists(pk): return pickle.load(open(pk, 'rb'))
    d = json.load(open(G + name + '.geojson'))
    out = []
    for f in d['features']:
        try: g = shape(f['geometry']).buffer(0)
        except Exception: continue
        out.append((f['properties'], g))
    pickle.dump(out, open(pk, 'wb'))
    return out

A0 = None; A1 = None; HB = {}
def a0():
    global A0
    if A0 is None: A0 = _load('ne_10m_admin_0_countries', 'ADM0_A3')
    return A0
def a1():
    global A1
    if A1 is None: A1 = _load('ne_10m_admin_1_states_provinces', 'name')
    return A1

def C(*isos):
    """países actuales por ISO2 o ISO3"""
    gs = []
    for p, g in a0():
        if p.get('ISO_A2_EH') in isos or p.get('ISO_A2') in isos or p.get('ADM0_A3') in isos or p.get('ISO_A3') in isos: gs.append(g)
    assert gs, isos
    return unary_union(gs)

def P(iso2, *names):
    """provincias/estados actuales"""
    gs = [g for p, g in a1() if p['iso_a2'] == iso2 and (p['name'] in names or p.get('name_en') in names)]
    assert len(gs) >= len(names), (iso2, names, len(gs))
    return unary_union(gs)

def H(year, *names):
    """polígonos de historical-basemaps (aourednik)"""
    if year not in HB:
        d = json.load(open(G + f'hb/world_{year}.geojson'))
        HB[year] = [(f['properties'].get('NAME'), shape(f['geometry']).buffer(0)) for f in d['features'] if f['geometry']]
    gs = [g for n, g in HB[year] if n in names]
    assert gs, (year, names)
    return unary_union(gs)

def BOX(lon0, lat0, lon1, lat1): return box(lon0, lat0, lon1, lat1)
def LAND(): return C(*[p.get('ADM0_A3') for p, g in a0()])

# --- Mercator ---
def merc(lon, lat):
    lat = max(min(lat, 84), -84)
    return lon, math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))
def imerc(y): return math.degrees(2 * math.atan(math.exp(math.radians(y))) - math.pi / 2)

class View:
    """recorte del mundo en Mercator; coordenadas de píxel del fondo"""
    def __init__(self, lon0, lat0, lon1, lat1, W):
        self.x0, self.y1 = merc(lon0, lat1); self.x1, self.y0 = merc(lon1, lat0)
        self.W = int(W); self.H = int(round(W * (self.y1 - self.y0) / (self.x1 - self.x0)))
        self.k = self.W / (self.x1 - self.x0)
    def px(self, lon, lat):
        x, y = merc(lon, lat); return ((x - self.x0) * self.k, (self.y1 - y) * self.k)
    def path(self, geom, tol=1.2):
        if geom is None or geom.is_empty: return ''
        g = geom.intersection(box(self.x0 - 5 / 1, -84, self.x1 + 5, 84)) if False else geom
        polys = [g] if isinstance(g, Polygon) else [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]
        out = []
        for p in polys:
            q = Polygon([self.px(*c) for c in p.exterior.coords], [[self.px(*c) for c in r.coords] for r in p.interiors]).simplify(tol)
            if q.is_empty or q.area < 6: continue
            for ring in [q.exterior] + list(q.interiors):
                cs = list(ring.coords)
                out.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in cs[:-1]) + 'Z')
        return ''.join(out)
    def lines(self, geom, tol=1.2):
        """solo contornos (para bordes internos)"""
        return self.path(geom, tol)

def render_bg(view, out, land=None):
    """recorte satélite en Mercator con el grado de color de las referencias"""
    from PIL import Image, ImageDraw, ImageFilter
    S = _bm(); W, H = view.W, view.H
    lons = view.x0 + (np.arange(W) + 0.5) / view.k
    lats = np.array([imerc(view.y1 - (j + 0.5) / view.k) for j in range(H)])
    sx = ((lons + 180) / 360 * SRC_W).astype(np.int64) % SRC_W
    sy = np.clip(((90 - lats) / 180 * SRC_H).astype(np.int64), 0, SRC_H - 1)
    # muestreo bilineal simple por bloques de filas
    img = np.empty((H, W, 3), np.float32)
    fx = ((lons + 180) / 360 * SRC_W) - 0.5; fy = ((90 - lats) / 180 * SRC_H) - 0.5
    x0 = np.floor(fx).astype(np.int64); ax = (fx - x0)[None, :, None]
    for j0 in range(0, H, 256):
        j1 = min(H, j0 + 256)
        y0 = np.floor(fy[j0:j1]).astype(np.int64); ay = (fy[j0:j1] - y0)[:, None, None]
        ya, yb = np.clip(y0, 0, SRC_H - 1), np.clip(y0 + 1, 0, SRC_H - 1)
        xa, xb = x0 % SRC_W, (x0 + 1) % SRC_W
        r0 = S[ya][:, xa].astype(np.float32) * (1 - ax) + S[ya][:, xb].astype(np.float32) * ax
        r1 = S[yb][:, xa].astype(np.float32) * (1 - ax) + S[yb][:, xb].astype(np.float32) * ax
        img[j0:j1] = r0 * (1 - ay) + r1 * ay
    img /= 255.0
    # máscara de tierra
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    land = land or LANDG()
    clip = box(*view_lonlat(view)).buffer(2)
    lg = land.intersection(clip)
    for p in ([lg] if isinstance(lg, Polygon) else getattr(lg, 'geoms', [])):
        if not isinstance(p, Polygon): continue
        d.polygon([view.px(*c) for c in p.exterior.coords], fill=255)
        for r in p.interiors: d.polygon([view.px(*c) for c in r.coords], fill=0)
    mk = np.asarray(m.filter(ImageFilter.GaussianBlur(1.2)), np.float32)[..., None] / 255
    # tierra: más contraste y algo de saturación (look de las referencias)
    lum = img.mean(2, keepdims=True)
    # tierra: como las referencias, más clara y apagada (verde grisáceo), con relieve suave
    landc = np.clip((img - lum) * 0.9 + lum, 0, 1)
    landc = np.clip(landc ** 0.86 * 1.04, 0, 1)
    haze = np.array([0.6, 0.63, 0.58], np.float32)
    landc = landc * 0.9 + haze * 0.1
    from PIL import ImageFilter as _F
    _b = np.asarray(Image.fromarray((landc * 255).astype(np.uint8)).filter(_F.GaussianBlur(6)), np.float32) / 255
    landc = np.clip(landc + (landc - _b) * 0.6, 0, 1)
    # mar: azul marino oscuro conservando la textura de la batimetría
    sea_l = img.mean(2, keepdims=True)
    deep = np.array([0.05, 0.14, 0.21], np.float32); shelf = np.array([0.17, 0.33, 0.38], np.float32)
    k = np.clip((sea_l - 0.1) / 0.3, 0, 1) ** 0.8
    sea = deep * (1 - k) + shelf * k
    out_img = landc * mk + sea * (1 - mk)
    Image.fromarray((np.clip(out_img, 0, 1) * 255).astype(np.uint8)).save(out, quality=90)

_LG = None
def LANDG():
    global _LG
    if _LG is None:
        pk = G + 'land.pkl'
        if os.path.exists(pk): _LG = pickle.load(open(pk, 'rb'))
        else:
            _LG = unary_union([g for p, g in a0()]).buffer(0); pickle.dump(_LG, open(pk, 'wb'))
    return _LG

def view_lonlat(v):
    return (v.x0, imerc(v.y0), v.x1, imerc(v.y1))

def area_km2(g):
    """área real (proyección equivalente local)"""
    from pyproj import Geod
    geod = Geod(ellps='WGS84'); a = 0
    for p in ([g] if isinstance(g, Polygon) else getattr(g, 'geoms', [])):
        if isinstance(p, Polygon): a += abs(geod.geometry_area_perimeter(p)[0])
    return a / 1e6
