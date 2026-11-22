# Prepara la geometría del mapa: topojson -> paths proyectados (Natural Earth I) en coordenadas de mundo
import json, math, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
from data import ORDER, NAMES
R = '/home/claude/atlas-render/'
S = 1000.0  # escala: mundo ~5470 x 2635

def ne1(lon, lat):
    l, p = math.radians(lon), math.radians(lat)
    p2 = p * p; p4 = p2 * p2
    x = l * (0.8707 - 0.131979 * p2 - 0.013791 * p4 + 0.003971 * p4 * p4 * p2 - 0.001529 * p4 * p4 * p4)
    y = p * (1.007226 + 0.015085 * p2 - 0.044475 * p4 * p2 + 0.028874 * p4 * p4 - 0.005916 * p4 * p4 * p2)
    return (x * S + 2736, -y * S + 1340)

def decode(topo):
    tr = topo.get('transform'); arcs = []
    for a in topo['arcs']:
        pts = []; x = y = 0
        for q in a:
            if tr:
                x += q[0]; y += q[1]
                pts.append((x * tr['scale'][0] + tr['translate'][0], y * tr['scale'][1] + tr['translate'][1]))
            else: pts.append((q[0], q[1]))
        arcs.append(pts)
    def ring(ids):
        out = []
        for i in ids:
            a = arcs[i] if i >= 0 else arcs[~i][::-1]
            out.extend(a if not out else a[1:])
        return out
    def geom(g):
        if g['type'] == 'Polygon': return [[ring(r) for r in g['arcs']]]
        if g['type'] == 'MultiPolygon': return [[ring(r) for r in p] for p in g['arcs']]
        return []
    return geom

def unwrap(r):
    out = [list(r[0])]
    for lon, lat in r[1:]:
        pl = out[-1][0]
        while lon - pl > 180: lon -= 360
        while lon - pl < -180: lon += 360
        out.append([lon, lat])
    # deja el anillo mayormente dentro de [-180,180]
    m = sum(p[0] for p in out) / len(out)
    if m > 180: out = [[a - 360, b] for a, b in out]
    if m < -180: out = [[a + 360, b] for a, b in out]
    return out

def area(pts):
    return 0.5 * sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))

GREY = ['Greenland', 'W. Sahara', 'Puerto Rico', 'New Caledonia', 'Falkland Is.', 'Fr. Polynesia', 'Bermuda']
MERGE = {'Somaliland': 'SO', 'N. Cyprus': 'CY', 'Hong Kong': 'CN', 'Macao': 'CN'}
def build():
    t1 = json.load(open(R + 'src/worldtopo.json')); g1 = decode(t1)
    t2 = json.load(open(R + 'node_modules/world-atlas/countries-50m.json')); g2 = decode(t2)
    feats = {}
    for g in t1['objects']['countries']['geometries']:
        feats.setdefault(g['properties']['code'], []).extend(g1(g))
    extra = {'Kosovo': 'XK', 'Vatican': 'VA', 'Tuvalu': 'TV'}
    for g in t2['objects']['countries']['geometries']:
        n = g.get('properties', {}).get('name')
        if n in extra and extra[n] not in feats: feats[extra[n]] = g2(g)
        if n in GREY: feats['_' + n] = g2(g)
        if n in MERGE: feats.setdefault(MERGE[n], []).extend(g2(g))
        # territorios no soberanos (tierra gris): Groenlandia, Sáhara, Guayana Fr., Puerto Rico, Antártida...
    out = {}
    for code, polys in feats.items():
        d = []; best = None
        bb = [1e9, 1e9, -1e9, -1e9]
        for poly in polys:
            for ri, r in enumerate(poly):
                if len(r) < 3: continue
                pts = [ne1(*p) for p in unwrap(r)]
                d.append('M' + 'L'.join(f'{x:.2f},{y:.2f}' for x, y in pts) + 'Z')
                if ri == 0:
                    a = abs(area(pts))
                    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
                    pb = [min(xs), min(ys), max(xs), max(ys)]
                    # ignora islas lejanas para el encuadre (territorios de ultramar)
                    if best is None or a > best[0]: best = (a, pb, pts)
        if best is None: continue
        a, pb, pts = best
        # bbox de encuadre: pieza principal + piezas cercanas grandes
        r, cx, cy = polylabel(pts)
        out[code] = {'d': ''.join(d), 'bb': [round(v, 1) for v in pb], 'a': round(a, 2), 'c': [round(cx, 1), round(cy, 1)], 'r': round(float(r), 2)}
    return out

import numpy as np
def polylabel(pts, n=48):
    P = np.array(pts); x0, y0 = P.min(0); x1, y1 = P.max(0)
    A = P; B = np.roll(P, -1, 0); best = (-1, (x0 + x1) / 2, (y0 + y1) / 2)
    for it in range(2):
        xs = np.linspace(x0, x1, n); ys = np.linspace(y0, y1, n)
        gx, gy = np.meshgrid(xs, ys); Q = np.stack([gx.ravel(), gy.ravel()], 1)
        # point in polygon (ray casting)
        inside = np.zeros(len(Q), bool)
        for (ax, ay), (bx, by) in zip(A, B):
            c = ((ay > Q[:, 1]) != (by > Q[:, 1])) & (Q[:, 0] < (bx - ax) * (Q[:, 1] - ay) / (by - ay + 1e-12) + ax)
            inside ^= c
        if not inside.any(): break
        Qi = Q[inside]
        d = np.full(len(Qi), 1e18)
        AB = B - A; L2 = (AB ** 2).sum(1) + 1e-12
        for k in range(0, len(A), 400):
            a = A[k:k + 400]; ab = AB[k:k + 400]; l2 = L2[k:k + 400]
            t = np.clip(((Qi[:, None, :] - a[None]) * ab[None]).sum(2) / l2[None], 0, 1)
            pr = a[None] + t[..., None] * ab[None]
            d = np.minimum(d, np.sqrt(((Qi[:, None, :] - pr) ** 2).sum(2)).min(1))
        i = d.argmax()
        if d[i] > best[0]: best = (d[i], Qi[i, 0], Qi[i, 1])
        w = (x1 - x0) / n * 3; h = (y1 - y0) / n * 3
        x0, x1, y0, y1 = best[1] - w, best[1] + w, best[2] - h, best[2] + h
    return best

if __name__ == '__main__':
    out = build()
    miss = [c for c in ORDER if c not in out]
    print('países', len(out), 'faltan', miss)
    json.dump(out, open(R + 'src/mcd/geo.json', 'w'), separators=(',', ':'))
    import os; print(os.path.getsize(R + 'src/mcd/geo.json') // 1024, 'KB')
