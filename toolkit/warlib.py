"""Utilidades para guiones de guerra con pelotones por tierra (mapa 7680x4320)."""
import json, math
import numpy as np
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra

Z = np.load('data/hexworld.npz'); X, Y, O0 = Z['X'], Z['Y'], Z['O']
codes = json.load(open('data/hexnb.json'))['codes']; NK = len(codes)
K = {c: i for i, c in enumerate(codes)}
ST = json.load(open('src/hw/static.json')); NAMES = [c['n'] for c in ST['countries']]
SRC = json.load(open('data/hexsrc.json'))
POP = json.load(open('data/pop.json')); AREA = json.load(open('data/area_km2.json'))
cells = [np.where(O0 == k)[0] for k in range(NK)]
cen = {k: (float(X[cells[k]].mean()), float(Y[cells[k]].mean())) if len(cells[k]) else (0.0, 0.0) for k in range(NK)}
P2 = np.c_[X, Y]
TREE = cKDTree(P2)
pairs = TREE.query_pairs(19.0, output_type='ndarray')
_w = np.hypot(*(P2[pairs[:, 0]] - P2[pairs[:, 1]]).T)
EI, EJ, EW = pairs[:, 0], pairs[:, 1], _w
CITY = {}
for c in SRC['cities']:
    if c['iso'] in K: CITY.setdefault(K[c['iso']], []).append(c)
for k in CITY: CITY[k].sort(key=lambda c: -c['pop'])
CAP = {}
for k, lst in CITY.items():
    for c in lst:
        if c['cap']: CAP[k] = (c['x'], c['y'], c['name']); break
for k in range(NK):
    if k not in CAP: CAP[k] = (*cen[k], NAMES[k])
BBOX = {}
for k in range(NK):
    ce = cells[k]
    BBOX[k] = (float(X[ce].min()), float(Y[ce].min()), float(X[ce].max()), float(Y[ce].max())) if len(ce) else (cen[k][0] - 20, cen[k][1] - 20, cen[k][0] + 20, cen[k][1] + 20)
def diag(k): b = BBOX[k]; return math.hypot(b[2] - b[0], b[3] - b[1])

def near_cell(k, ref, among=None):
    ce = cells[k] if among is None else among
    d = (X[ce] - ref[0]) ** 2 + (Y[ce] - ref[1]) ** 2
    i = ce[int(d.argmin())]; return float(X[i]), float(Y[i])

def land_path(src, dst, allowed):
    """Ruta por tierra (celdas de los países 'allowed') de src a dst; None si no hay."""
    mask = np.isin(O0, list(allowed))
    m = mask[EI] & mask[EJ]
    n = len(X)
    G = coo_matrix((EW[m], (EI[m], EJ[m])), shape=(n, n)).tocsr()
    idx = np.where(mask)[0]
    si = idx[int(((X[idx] - src[0]) ** 2 + (Y[idx] - src[1]) ** 2).argmin())]
    di = idx[int(((X[idx] - dst[0]) ** 2 + (Y[idx] - dst[1]) ** 2).argmin())]
    dist, pred = dijkstra(G, directed=False, indices=si, return_predecessors=True)
    if not np.isfinite(dist[di]): return None
    path = [di]
    while path[-1] != si: path.append(pred[path[-1]])
    path = path[::-1]
    pts = [(float(X[i]), float(Y[i])) for i in path]
    pts = [pts[0]] + pts[1:-1:2] + [pts[-1]] if len(pts) > 3 else pts
    for _ in range(2):  # Chaikin
        if len(pts) < 3: break
        q = [pts[0]]
        for a, b in zip(pts[:-1], pts[1:]):
            q += [(0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]), (0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1])]
        q.append(pts[-1]); pts = q
    pts[-1] = (float(dst[0]), float(dst[1])) if math.hypot(dst[0] - pts[-1][0], dst[1] - pts[-1][1]) < 40 else pts[-1]
    return pts

def cumlen(pts):
    cl = [0.0]
    for a, b in zip(pts[:-1], pts[1:]): cl.append(cl[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    return cl

def ease(u):
    e = 2 * u * u if u < 0.5 else 1 - (-2 * u + 2) ** 2 / 2
    return 0.35 * u + 0.65 * e

def kfv(pk, t):
    if t <= pk[0][0]: return pk[0][1]
    for i in range(1, len(pk)):
        if t <= pk[i][0]:
            u = (t - pk[i - 1][0]) / (pk[i][0] - pk[i - 1][0]); return pk[i - 1][1] + (pk[i][1] - pk[i - 1][1]) * ease(u)
    return pk[-1][1]

def point_at(pts, cl, d):
    d = max(0, min(cl[-1], d))
    for i in range(1, len(cl)):
        if cl[i] >= d:
            u = (d - cl[i - 1]) / max(1e-6, cl[i] - cl[i - 1])
            return pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u
    return pts[-1]

def pick_bases(k, nb):
    """Bases en ciudades grandes (no capital), repartidas."""
    cap = CAP[k]
    cand = [c for c in CITY.get(k, []) if not c['cap']]
    out = []
    for c in cand:
        if len(out) >= nb: break
        if math.hypot(c['x'] - cap[0], c['y'] - cap[1]) < diag(k) * 0.12: continue
        if any(math.hypot(c['x'] - o[1], c['y'] - o[2]) < diag(k) * 0.2 for o in out): continue
        x, y = near_cell(k, (c['x'], c['y']))
        if math.hypot(x - c['x'], y - c['y']) > 60: continue
        if land_path(cap[:2], (x, y), {k}) is None: continue
        out.append((c['name'], float(c['x']), float(c['y'])))
    # si faltan, puntos del interior del mismo bloque de tierra que la capital
    if len(out) < nb:
        mask = O0 == k; m = mask[EI] & mask[EJ]; n = len(X)
        G = coo_matrix((EW[m], (EI[m], EJ[m])), shape=(n, n)).tocsr()
        ce = cells[k]; ci = ce[int(((X[ce] - cap[0]) ** 2 + (Y[ce] - cap[1]) ** 2).argmin())]
        dist = dijkstra(G, directed=False, indices=ci)
        reach = ce[np.isfinite(dist[ce])]
        pts = np.c_[X[reach], Y[reach]]
        while len(out) < nb:
            d = np.hypot(pts[:, 0] - cap[0], pts[:, 1] - cap[1])
            for o in out: d = np.minimum(d, np.hypot(pts[:, 0] - o[1], pts[:, 1] - o[2]))
            i = int(d.argmax()); px, py = float(pts[i, 0]), float(pts[i, 1])
            cs = [c for c in CITY.get(k, []) if math.hypot(c['x'] - px, c['y'] - py) < diag(k) * 0.15]
            nm = min(cs, key=lambda c: math.hypot(c['x'] - px, c['y'] - py))['name'] if cs else NAMES[k] + ' base'
            out.append((nm, px, py))
    return out

def top_cities(k, n=5):
    out = []
    for c in CITY.get(k, []):
        if len(out) >= n: break
        if any(math.hypot(c['x'] - o[1], c['y'] - o[2]) < diag(k) * 0.1 for o in out): continue
        out.append((c['name'].replace('  ', ' '), c['x'], c['y'], 1 if c['cap'] else 0))
    return out

def fit(bb, W=1920, H=1080, fill=0.62, smin=0.3, smax=3.2):
    x0, y0, x1, y1 = bb
    w, h = max(1, x1 - x0), max(1, y1 - y0)
    s = min(W * fill / w, H * fill / h)
    return (x0 + x1) / 2, (y0 + y1) / 2, max(smin, min(smax, s))
