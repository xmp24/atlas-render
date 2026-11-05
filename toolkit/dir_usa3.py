"""USA vs The World -> src/hw/usa.json"""
import sys, json, math, random
import numpy as np
from warlib import *

VER = 'u'
V2 = True
BOMBS = []; CAPHP = []; JETX = []
rng = random.Random(21)
ID = K['US']
UP = lambda k: NAMES[k].upper()
# ---------------- poder ----------------
MAN = dict(VE=1300, CU=600, CL=900, PE=800, IE=300, IS=60, TL=40, PG=150, BN=70, SG=380, PH=1500, MY=2400, AU=3900, NZ=500, FJ=60, TH=2000, VN=2200, KH=300, LA=200, MM=900, BD=900, BT=30, NP=250, IN=4800, LK=300, PK=2700,
           AF=500, IR=2600, IQ=900, SA=1900, TR=3100, EG=2000, IL=1600, GR=900, RO=900, PL=1600, IT=2600, FR=4300, DE=3900, GB=4100, ES=2100, PT=650, NL=900, BE=600, BR=2700,
           MX=1500, AR=900, CO=800, JP=3200, KR=2900, KP=1900, TW=1700, CN=33500, RU=18000, MN=300, CA=2600, US=64000, KZ=700, UA=1800, SE=900, NO=800, DK=500, FI=700, CH=700, AT=600)
def power(k):
    c = codes[k]
    if c in MAN: return MAN[c]
    p = POP.get(c, 1e5) / 1e6; a = AREA.get(c, 1000)
    return int(round(30 + 22 * math.sqrt(p) + 0.6 * math.sqrt(a / 1000) * 10))
PW = [power(k) for k in range(NK)]
def nbases(k):
    if codes[k] in ('CN', 'RU'): return 3
    p = PW[k]; return 0 if p < 800 else 1 if p < 2000 else 2 if p < 3500 else 3 if p < 10000 else 4

# ---------------- salida ----------------
cev = []; owned = {ID}; feed = []
occ = []; SQ = []; DF = []; FX = []; CIT = []; markers = []
cam = []; chapters = []; chips = []; cards = []; battles = []; grade = []; shakes = []; flashes = []; arrows = []; music = []; sfx = []; subs = []
stamps = []; bubbles = []; streak = []; indo = [[0, 600]]; dayk = []; lit = []
def C(t, x, y, s, d=1.3): cam.append([round(t, 2), round(x, 1), round(y, 1), round(s, 3), round(d, 2)])
def CB(t, bb, d=1.0, fill=0.6, smax=3.2, smin=0.3): x, y, s = fit(bb, fill=fill, smax=smax, smin=smin); C(t, x, y, s, d); return s
def chip(t, text, k=-1, d=2.4): chips.append([round(t, 2), text, k, d])
def P(t, v): indo.append([round(t, 2), int(v)])
# --- sonido con variedad (nunca el mismo dos veces seguidas) ---
BANK = {'boom': [f'boom_{i}' for i in range(1, 13)], 'hit': [f'hit_{i}' for i in range(1, 10)], 'gun': [f'gun_{i}' for i in range(1, 15)],
        'far': [f'far_{i}' for i in range(1, 9)], 'whoosh': [f'whoosh_{i}' for i in range(1, 8)], 'stamp': ['stamp_1', 'stamp_2', 'stamp_3']}
_last = {}
def SV(t, kind, g=1.0, pan=0.0):
    opts = [n for n in BANK[kind] if n != _last.get(kind)]; n = rng.choice(opts); _last[kind] = n
    sfx.append([round(t, 3), n, round(g, 2), round(pan, 2)])
def S(t, n, g=1.0, p=0.0): sfx.append([round(t, 3), n, g, p])
def BED(t0, t1, level=1.0):
    """ambiente de combate: disparos y explosiones lejanas, sin patrones repetidos"""
    t = t0
    while t < t1:
        r = rng.random()
        if r < 0.55: SV(t, 'gun', 0.22 * level, rng.uniform(-0.7, 0.7))
        elif r < 0.85: SV(t, 'far', 0.28 * level, rng.uniform(-0.8, 0.8))
        else: SV(t, 'hit', 0.16 * level, rng.uniform(-0.5, 0.5))
        t += rng.uniform(0.35, 0.9) / max(0.4, level)

# ---------------- marcadores ----------------
MK = {}
def setup_markers(k, nb=None, names=None):
    if k in MK: return MK[k]
    nb = nbases(k) if nb is None else nb
    bs = pick_bases(k, nb)
    if names:
        bs = []
        for nm in names:
            c_ = [c for c in CITY.get(k, []) if nm in c['name']][0]; bs.append((c_['name'].replace('  ', ' '), float(c_['x']), float(c_['y'])))
    cap = CAP[k]
    m = {'cap': ['cap', k, round(cap[0]), round(cap[1]), None], 'bases': []}
    markers.append(m['cap'])
    for (n, x, y) in bs:
        mm = ['base', k, round(x), round(y), None]; markers.append(mm); m['bases'].append((n, x, y, mm))
    MK[k] = m; return m

def owned_mask_cells():
    return np.where(np.isin(O0, list(owned)))[0]

def squad(a, occk, pts, pk_frac, n=5, r=40, t1=None, fw=None, tgt=None):
    cl = cumlen(pts); L = cl[-1]
    pk = [[round(t, 2), round(f * L, 1)] for t, f in pk_frac]
    q = dict(a=a, p=[round(v, 1) for xy in pts for v in xy], cl=[round(v, 1) for v in cl], pk=pk, r=round(r, 1), n=n, t0=round(pk_frac[0][0], 2), t1=round(t1 if t1 else pk_frac[-1][0] + 1, 2))
    if fw: q['fw'] = [[round(x, 2) for x in w] for w in fw]
    if tgt: q['tx'], q['ty'] = round(tgt[0], 1), round(tgt[1], 1)
    SQ.append(q); return len(SQ) - 1, pts, cl

def route(src, dst, allowed, strict=False):
    p = land_path(src, dst, allowed)
    if p is None or len(p) < 2:
        if strict: return None
        p = [tuple(src), tuple(dst)]
    return p

def route_or_land(e, dst, k, allowed, ts):
    """ruta por tierra; si no hay, desembarco: barcos hasta la costa de k más cercana al objetivo y de ahí a pie"""
    p = route(e, dst, allowed, strict=True)
    if p is not None: return p
    ce = cells[k]
    # costa del mismo bloque de tierra que el objetivo: celda de k más cercana a e entre las conectadas con dst
    land = None
    for cand in sorted(ce, key=lambda i: (X[i] - e[0]) ** 2 + (Y[i] - e[1]) ** 2)[:400:8]:
        q = route((float(X[cand]), float(Y[cand])), dst, {k}, strict=True)
        if q is not None: land = (float(X[cand]), float(Y[cand])); p = q; break
    if land is None: return [tuple(e), tuple(dst)]
    landing(e, land, ts)
    return p

def landing(src, land, t_arr, dur=2.0, kind='fire', shots=True, who=None):
    who = ID if who is None else who
    """barcos que llegan a la costa: al acercarse disparan y dañan la costa; al tocarla salen las tropas"""
    arrows.append([round(t_arr - dur, 2), round(t_arr, 2), round(src[0]), round(src[1]), round(land[0]), round(land[1]), who, kind])
    if shots:
        for j, dt in enumerate([0.85, 0.55, 0.25]):
            ox, oy = rng.uniform(-18, 18), rng.uniform(-18, 18)
            FX.append([round(t_arr - dt + 0.35, 2), round(land[0] + ox), round(land[1] + oy), 34, 1])
            SV(t_arr - dt, 'boom' if j == 1 else 'far', 0.45, 0)
        S(t_arr - 0.95, 'cannon', 0.6)

def head(i, t):
    q = SQ[i]; pts = list(zip(q['p'][::2], q['p'][1::2])); return point_at(pts, q['cl'], kfv(q['pk'], t))

def flip(k, t, origin, dur=1.0, show=True, new=ID):
    cev.append([round(t, 3), round(t, 3), k, new, k, round(origin[0]), round(origin[1]), round(dur, 2), {'sq': 0}])
    if new == ID: owned.add(k)
    if show and new == ID: feed.append([round(t, 2), k])

def bg(lst, t0, t1, dur=0.8):
    lst = [K[c] for c in lst.split() if c in K and K[c] not in owned]
    for i, k in enumerate(lst):
        t = t0 + (t1 - t0) * i / max(1, len(lst))
        o = near_cell(k, cen[ID])
        best = None; bd = 1e18
        for oo in owned:
            d = (cen[oo][0] - cen[k][0]) ** 2 + (cen[oo][1] - cen[k][1]) ** 2
            if d < bd: bd, best = d, oo
        o = near_cell(k, cen[best])
        flip(k, t, o, dur, show=False)

def entry_for(k, prefer=None):
    """celda propia (de Indonesia) más cercana al país k (o al punto preferido)"""
    oc = owned_mask_cells()
    ref = prefer if prefer else cen[k]
    return near_cell(None, ref, among=oc)

def autocam(t0, t1, ids, k, step=2.3, fill=0.5, minsz=None, smax=5.5, extra=None):
    minsz = minsz or max(90.0, diag(k) * 0.25)
    t = t0
    while t < t1 - 0.4:
        tt = min(t1, t + step * 0.75)
        act = [i for i in ids if SQ[i]['t0'] <= tt + 0.5 and SQ[i]['t1'] >= tt]
        # pelotón protagonista: el que llega antes a su objetivo
        def arr(i):
            q = SQ[i]; L = q['cl'][-1]
            for a_, d_ in q['pk']:
                if a_ >= tt and d_ >= L * 0.98: return a_
            return 1e9
        fut = sorted([i for i in act if arr(i) < tt + 7], key=arr)
        sel = fut[:1] if fut else act
        pts = [head(i, tt) for i in sel]
        for i in sel:
            if 'tx' in SQ[i] and arr(i) < tt + 7: pts.append((SQ[i]['tx'], SQ[i]['ty']))
        if extra: pts += [p for (a, b, p) in extra if a <= tt <= b]
        if pts:
            xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
            cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
            w = max(max(xs) - min(xs), minsz); h = max(max(ys) - min(ys), minsz * 0.56)
            CB(t, (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), d=step * 0.95, fill=fill, smax=smax)
        t += step

def base_name(n): return n.upper().replace('ST.  ', 'ST. ')

# ---------------- pintado por frente de avance (sin círculos) ----------------
from scipy.spatial import cKDTree as _KD
import heapq
SPC = 15.6
_PTS = {}
def pts_of(k):
    if k in _PTS: return _PTS[k]
    ce = cells[k]; P = np.c_[X[ce], Y[ce]].astype(float)
    if len(ce) < 2600:
        offs = [(0.0, 0.0)] + [(SPC * 0.45 * math.cos(a), SPC * 0.45 * math.sin(a)) for a in np.arange(6) * math.pi / 3 + math.pi / 6]
        P = np.vstack([P + np.array(o) for o in offs]); rr = 7.6; link = SPC * 0.52
    else: rr = 14.5; link = SPC * 1.05
    tr = _KD(P); pairs = tr.query_pairs(link, output_type='ndarray')
    adj = [[] for _ in range(len(P))]
    ph = [rng.uniform(0, 6.28) for _ in range(6)]
    def nz(x, y): return 0.5 + 0.17 * (math.sin(x * 0.008 + ph[0]) + math.sin(y * 0.010 + ph[1]) + 0.7 * math.sin((x + y) * 0.021 + ph[2]) + 0.5 * math.sin((x - y) * 0.037 + ph[3]))
    for i, j in pairs:
        d = math.hypot(P[i, 0] - P[j, 0], P[i, 1] - P[j, 1])
        w = d * (0.35 + 1.3 * max(0.0, nz((P[i, 0] + P[j, 0]) / 2, (P[i, 1] + P[j, 1]) / 2)))
        adj[i].append((int(j), w)); adj[j].append((int(i), w))
    _PTS[k] = (P, rr, tr, adj); return _PTS[k]
def _dij(adj, T, seeds, v):
    h = []
    for j, t in seeds:
        if t < T[j]: T[j] = t; h.append((t, j))
    heapq.heapify(h)
    while h:
        t, i = heapq.heappop(h)
        if t > T[i]: continue
        for j, w in adj[i]:
            nt = t + w / v
            if nt < T[j]: T[j] = nt; heapq.heappush(h, (nt, j))
    return T
def flood_of(A, k, T0, t_fill, tcap, cap, ids, entries=(), tw=None, v=None, rc=None, border=True, t_end=None, step=0.2):
    """orden de llegada de cada punto del país k: desde fronteras con A, desembarcos y por donde pasan las tropas"""
    P, rr, tr, adj = pts_of(k)
    if tw and tw[-1][0] < tcap + 2 and tcap < 1e5: tw = tw + [[tcap + 3, tcap + 3]]
    vt = (lambda t: kfv(tw, t)) if tw else (lambda t: t)
    seeds = []
    for i in ids:
        q = SQ[i]; t = q['t0']
        while t <= q['t1']:
            hx, hy = head(i, t); d, j = tr.query((hx, hy))
            if d < SPC * 1.6: seeds.append((int(j), vt(t)))
            t += 0.2
    for e in entries:
        d, j = tr.query(tuple(e))
        if d < SPC * 3: seeds.append((int(j), vt(T0 + 0.4)))
    if border:
        km = O0 == k; am = np.isin(O0, list(owned)) if A == ID else (O0 == A)
        bc = np.unique(np.r_[EI[km[EI] & am[EJ]], EJ[km[EJ] & am[EI]]])
        for c in bc:
            d, j = tr.query((X[c], Y[c]))
            seeds.append((int(j), vt(T0 + 0.5 + rng.uniform(0, 1.2))))
    if not seeds:
        d, j = tr.query(tuple(entries[0]) if entries else cap[:2]); seeds.append((int(j), T0 + 0.4))
    dc = np.hypot(P[:, 0] - cap[0], P[:, 1] - cap[1])
    rc = rc if rc is not None else 0
    an = np.arctan2(P[:, 1] - cap[1], P[:, 0] - cap[0]); p1_, p2_, p3_ = rng.uniform(0, 6.28), rng.uniform(0, 6.28), rng.uniform(0, 6.28)
    mrc = 1 + 0.26 * np.sin(3 * an + p1_) + 0.14 * np.sin(5 * an + p2_) + 0.08 * np.sin(8 * an + p3_)
    dc = dc / mrc
    noncap = dc > rc
    def run(vv):
        T = np.full(len(P), 1e9); _dij(adj, T, seeds, vv)
        # islas sin conexión: se siembran desde el punto alcanzado más cercano
        for _ in range(40):
            un = T > 1e8
            if not un.any(): break
            rch = np.where(~un)[0]; ui = np.where(un)[0]
            t2 = _KD(P[rch]); dd, jj = t2.query(P[ui]); b = int(dd.argmin())
            _dij(adj, T, [(int(ui[b]), float(T[rch[jj[b]]]) + 0.6 + dd[b] / max(vv, 1) * 0.3)], vv)
        return T
    if v is None:
        lo, hi = 2.0, 6000.0
        for _ in range(16):
            mid = math.sqrt(lo * hi); T = run(mid)
            q = np.percentile(T[noncap], 97) if noncap.any() else T0
            if q > t_fill: lo = mid
            else: hi = mid
        T = run(hi)
        T[noncap] = np.minimum(T[noncap], t_fill - rng.uniform(0, 0.3))
    else:
        T = run(v)
    if rc:
        cz = ~noncap; T[cz] = tcap - 0.45 + 0.4 * (1 - dc[cz] / rc)
    o = np.argsort(T, kind='stable'); Ts = T[o]
    t_end = t_end if t_end is not None else tcap + 0.2
    fk = []; t = T0 - 0.2; last = -1
    while t <= t_end + 1e-6:
        f = float(np.searchsorted(Ts, vt(t), 'right')) / len(Ts)
        if abs(f - last) > 1e-4 or t + step > t_end: fk.append([round(t, 2), round(f, 4)]); last = f
        t += step
    return dict(fl=[int(round(v_)) for xy in P[o] for v_ in xy], fk=fk, r=rr)
def frac_at(fl, t): return kfv(fl['fk'], t)
def stopf(pts, dist):
    L = cumlen(pts)[-1]
    return max(0.25, 1 - dist / L) if L > 1 else 0.5
FIRSTJET = []; FLAGS = []; MISS = []; PARA = []; FLAK = []; STRUCK = set(); CRAT = []; SMK = []
def tank_snd(qi):
    q = SQ[qi]; t = q['t0'] + 0.1
    while t < q['t1'] - 1.0:
        if abs(kfv(q['pk'], t + 0.5) - kfv(q['pk'], t)) > 0.5: S(t, 'tank_roll', 0.32, rng.uniform(-0.4, 0.4))
        t += 2.7
    for a, b in q.get('fw', []):
        tt = a + 0.2
        while tt < b: S(tt, 'tank_shot', 0.33, rng.uniform(-0.5, 0.5)); tt += rng.uniform(0.6, 0.9)
def tanks_sq(a, pts, pk, n=4, t1=None, fw=None, tgt=None):
    qi, _, _ = squad(a, None, pts, pk, n=n, r=50, t1=t1, fw=fw, tgt=tgt); SQ[qi]['kind'] = 'tank'; tank_snd(qi); return qi
def missile(t, src, dst, dur=None, g=0.5, boom=True, big=False):
    d = math.hypot(dst[0] - src[0], dst[1] - src[1]); dur = dur or max(1.3, min(2.8, d / 450))
    MISS.append([round(t, 2), round(t + dur, 2), round(src[0]), round(src[1]), round(dst[0]), round(dst[1])])
    S(t, rng.choice(['missile_1', 'missile_2']), g, rng.uniform(-0.3, 0.3)); S(t + dur - 1.15, 'missile_in', 0.28)
    th = t + dur
    if boom:
        FX.append([round(th, 2), round(dst[0]), round(dst[1]), 95 if big else 75, 0]); FX.append([round(th + 0.1, 2), round(dst[0]), round(dst[1]), 45, 2])
        SV(th, 'boom', 1.0 if big else 0.85); shakes.append([round(th, 2), 18 if big else 12]); flashes.append(round(th, 2))
        CRAT.append([round(th, 2), round(dst[0]), round(dst[1]), 1 if big else 0]); SMK.append([round(th, 2), round(th + 6, 2), round(dst[0]), round(dst[1])])
    return th
def para(A, t, x, y, n=8):
    PARA.append([round(t, 2), round(x), round(y), n, COLS0.get(codes[A], '#556b2f')]); S(t - 0.1, 'para', 0.5)
    jet_over(A, t - 0.15, x, y - 30, 0, n=2, pre=2.4, post=1.6, g=0.35)
def jets(A, t0, t1, xa, ya, xb, yb, n=3, g=0.5):
    JETX.append([round(t0, 2), round(t1, 2), round(xa), round(ya), round(xb), round(yb), A, n]); S(t0 + 0.15, 'jet', g)
def bomb(t, x, y, g=0.55, size=44):
    BOMBS.append([round(t, 2), round(x), round(y)]); FX.append([round(t + 0.55, 2), round(x), round(y), size, 1]); SV(t + 0.55, 'boom', g)
JS = 200.0   # velocidad de los cazas (unidades de mapa/s): lentos, para que se vea el bombardeo
SPOT = []
def jet_over(A, tc, x, y, ang=15, n=2, pre=2.8, post=2.0, g=0.45):
    a = math.radians(ang); dx, dy = math.cos(a), math.sin(a)
    JETX.append([round(tc - pre, 2), round(tc + post, 2), round(x - dx * JS * pre), round(y - dy * JS * pre), round(x + dx * JS * post), round(y + dy * JS * post), A, n]); S(tc - pre + 0.4, 'jet', g)
    return len(JETX) - 1
def bomb_run(A, tc, x, y, ang=15, n=2, nb=3, gap=0.26, g=0.5, size=44, jg=0.45):
    ji = jet_over(A, tc, x, y, ang, n, g=jg); a = math.radians(ang); dx, dy = math.cos(a), math.sin(a); pts = []
    for i in range(nb):
        dt = (i - (nb - 1) / 2) * gap; bx, by = x + dx * JS * dt, y + dy * JS * dt
        BOMBS.append([round(tc + dt, 2), round(bx), round(by)]); FX.append([round(tc + dt + 0.55, 2), round(bx), round(by), size, 1]); SV(tc + dt + 0.55, 'boom' if i % 2 == 0 else 'far', g)
        pts.append((bx, by))
    return ji
def jet_pos(ji, t):
    a, b, xa, ya, xb, yb = JETX[ji][:6]; u = max(0, min(1, (t - a) / (b - a))); return (xa + (xb - xa) * u, ya + (yb - ya) * u)
def spot(t0, t1, fn, label, r=170):
    pts = []; t = t0
    while t <= t1 + 1e-6: x, y = fn(t); pts.append([round(t, 2), round(x), round(y)]); t += 0.15
    SPOT.append(dict(t0=round(t0, 2), t1=round(t1, 2), pts=pts, label=label, r=r))
    S(t0, 'whoosh_2', 0.5); S(t0 + 0.05, 'sub_drop', 0.6)
def offset_toward(p, q, d):
    dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy) or 1
    return (p[0] + dx / n * d, p[1] + dy / n * d)
def head_end(i):
    q = SQ[i]; pts = list(zip(q['p'][::2], q['p'][1::2])); return point_at(pts, q['cl'], q['pk'][-1][1])

COLS0 = {'US': '#2a4fb8', 'CN': '#ffcc1a', 'RU': '#7fb2ff', 'IN': '#ff9933'}
def invade(k, T0, D, entries, *, n_main=6, r=None, push=None, title=None, nb=None, extra_allowed=(), main_entries=None, cam_on=True, start_tag=True, bed=1.0, chips_on=True, minsz=None, smax=5.5, fill=0.5, siege=True, air=False, s_siege=2.6,
           tw=None, tanks=False, flak=True, base_fx=None, tstrike=None, border=True, bighp=None):
    """Invasión de k: bases (se paran a distancia y disparan), asedio de la capital a distancia, pintado por frente desde fronteras/desembarcos; al caer la capital, k pasa a ser de EE. UU."""
    m = setup_markers(k, nb)
    r = r or max(10.0, min(55.0, diag(k) * 0.05))
    allowed = set(owned) | {k} | set(extra_allowed)
    cap = CAP[k]; ids = []
    size = math.sqrt(len(cells[k])) * SPC
    sd = max(36.0, min(65.0, size * 0.15)); ds = max(40.0, min(90.0, size * 0.22))
    bases = sorted(m['bases'], key=lambda b: min(math.hypot(e[0] - b[1], e[1] - b[2]) for e in entries))
    def nearest_entry(p): return min(entries, key=lambda e: math.hypot(e[0] - p[0], e[1] - p[1]))
    nbz = len(bases); tarr_b = []
    for i, (bn, bx, by, mm) in enumerate(bases):
        e = nearest_entry((bx, by))
        tarr = T0 + D * (0.36 + 0.36 * (i / max(1, nbz - 1) if nbz > 1 else 0.5))
        ts = T0 + 0.15 + 0.3 * i
        struck = bool(tstrike and i in tstrike); th = tstrike[i] if struck else tarr
        if struck: tarr = max(tarr, th + 3.2 + 1.0 * i)
        pts = route_or_land(e, (bx, by), k, allowed, ts)
        f = stopf(pts, sd)
        if struck:
            pk = [[ts, 0], [tarr, 1.0]]
            if push and ('b', i) in push: pk = [p for p in push[('b', i)](ts, tarr) if p[0] < tarr - 0.3] + [[tarr, 1.0]]
            qi, _, _ = squad(ID, k, pts, pk, n=5, r=r, t1=T0 + D + 1.1); STRUCK.add((round(bx), round(by)))
        else:
            fe = f + (1 - f) * 0.55
            pk = [[ts, 0], [tarr - 1.9, f - 0.01], [tarr + 0.5, f], [tarr + 3.5, fe]]
            if push and ('b', i) in push: pk = [p for p in push[('b', i)](ts, tarr) if p[0] < tarr - 1.95] + [[tarr - 1.9, f - 0.01], [tarr + 0.5, f], [tarr + 3.5, fe]]
            qi, _, _ = squad(ID, k, pts, pk, n=5, r=r, t1=T0 + D + 1.1, fw=[[tarr - 1.9, tarr - 0.4]], tgt=(bx, by))
        ids.append(qi)
        sx, sy = point_at(pts, cumlen(pts), f * cumlen(pts)[-1]); dx_, dy_ = offset_toward((bx, by), (sx, sy), sd * 0.22)
        if base_fx and i in base_fx: base_fx[i](th, bx, by)
        elif air: bomb_run(ID, th - 1.3, bx, by, ang=rng.choice([12, -12, 168, 192]), n=2, nb=3, size=40)
        DF.append([k, round(dx_), round(dy_), 4, round(T0 - 1.0, 2), round(th - 0.45 if not struck else th, 2), None, 1.3 if not struck else 0.3])
        mm[4] = round(th, 2)
        FX.append([round(th, 2), round(bx), round(by), 70, 0]); FX.append([round(th + 0.12, 2), round(bx), round(by), 30, 2])
        SV(th, 'boom', 0.95); SV(th + 0.04, 'hit', 0.6); shakes.append([round(th, 2), 12]); flashes.append(round(th, 2))
        if chips_on: chip(th + 0.15, f'{base_name(bn)} BASE DESTROYED' if 'base' not in bn else 'MILITARY BASE DESTROYED', k, 2.0)
        tarr_b.append(th)
    mains = main_entries or [min(entries, key=lambda e: math.hypot(e[0] - cap[0], e[1] - cap[1]))]
    tcap = T0 + D; stops = []
    for j, e in enumerate(mains):
        ts = T0 + 0.05 + 0.25 * j
        pts = route_or_land(e, cap[:2], k, allowed, ts)
        f = stopf(pts, ds * (1.0 + 0.12 * j))
        pk = [[ts, 0], [T0 + D * 0.55, 0.55 * f], [tcap - 1.2, f], [tcap, f]]
        if push and ('m', j) in push: pk = [p for p in push[('m', j)](ts, tcap) if p[0] < tcap - 1.25] + [[tcap - 1.2, f], [tcap, f]]
        fwm = [[tcap - 1.2, tcap]]
        if siege: pk = [p for p in pk if p[0] < tcap - 4.6] + [[tcap - 4.5, f - 0.015], [tcap, f]]; fwm = [[tcap - 4.5, tcap]]
        qi, _, _ = squad(ID, k, pts, pk, n=n_main if j == 0 else 4, r=r * 1.1, t1=tcap + 1.1, fw=fwm, tgt=cap[:2]); ids.append(qi)
        if (tanks is True and j == 0) or (isinstance(tanks, (set, list, tuple)) and j in tanks): SQ[qi]['kind'] = 'tank'; SQ[qi]['n'] = 3; tank_snd(qi)
        stops.append(point_at(pts, cumlen(pts), f * cumlen(pts)[-1]))
    dxy = offset_toward(cap[:2], stops[0], ds * 0.25)
    DF.append([k, round(dxy[0]), round(dxy[1]), 6, round(T0 - 1.0, 2), round(tcap - 0.2, 2), None, 4.0 if siege else 1.0])
    m['cap'][4] = round(tcap, 2)
    if siege:
        CAPHP.append([k, round(cap[0]), round(cap[1]), round(tcap - 4.5, 2), round(tcap, 2)] + ([bighp] if bighp else []))
        bomb_run(ID, tcap - 3.0, cap[0] - 8, cap[1] + 6, ang=rng.choice([8, -8]), n=2, nb=3, size=42)
        bomb_run(ID, tcap - 1.3, cap[0] + 6, cap[1] - 6, ang=rng.choice([172, 188]), n=1, nb=2, size=42, jg=0.3)
        if flak: FLAK.append([round(tcap - 4.3, 2), round(tcap - 0.6, 2), round(cap[0] - 12), round(cap[1] + 6)]); S(tcap - 4.0, 'flak', 0.3)
        BED(tcap - 4.5, tcap, 1.5)
        if cam_on: C(tcap - 4.9, (cap[0] + stops[0][0]) / 2, (cap[1] + stops[0][1]) / 2 + 8, min(smax, s_siege), 1.2)
        if chips_on: chip(tcap - 4.4, f'SIEGE OF {cap[2].upper().split(",")[0]}', k, 2.3)
    FX.append([round(tcap, 2), round(cap[0]), round(cap[1]), 95, 0]); FX.append([round(tcap + 0.15, 2), round(cap[0]), round(cap[1]), 60, 2])
    SV(tcap, 'boom', 1.1); S(tcap + 0.05, 'impact_hit', 0.8); shakes.append([round(tcap, 2), 22]); flashes.append(round(tcap, 2))
    fl_ = flood_of(ID, k, T0, tcap - (4.5 if siege else 0.8), tcap, cap, ids, entries, tw=tw, rc=ds * 1.05, border=border)
    flip(k, tcap + 0.15, cap[:2], dur=1.1)
    stamps.append([round(tcap + 0.3, 2), k, 'big'])
    occ.append([k, ID, round(T0, 2), round(tcap + 1.3, 2), [], None, fl_])
    CIT.extend([[n, x, y, c, round(T0 - 1.5, 2), round(tcap + 2.0, 2)] for (n, x, y, c) in top_cities(k, 6)])
    if cam_on: autocam(T0, tcap - (5.0 if siege else 1.8), ids, k, minsz=minsz, smax=smax, fill=fill)
    if bed: BED(T0 + 0.5, tcap - (4.5 if siege else 0), bed)
    return dict(ids=ids, tb=tarr_b, tcap=tcap, cap=cap, fl=fl_, stops=stops)

def fill_inv(B, fl):
    out = []; t = B['t0']
    while t <= B['t1']:
        v = 100 * frac_at(fl, t) if fl else 0
        if t >= B['ko']: v = 100
        out.append([round(t, 2), round(v, 1)]); t += 0.25
    B['inv'] = out
def battle_card(k, title, T0, T1, pa0, pb0, tb, tcap, ko_pw, push_dips=()):
    """tarjeta lateral: poder de ambos y % de invasión (calculado de los pelotones)"""
    pk = [[T0, pa0, pb0]]
    pb = pb0; pa = pa0
    evs = sorted([(t, 'b') for t in tb] + [(tcap, 'c')] + [(t, 'd', v) for t, v in push_dips])
    for e in evs:
        t = e[0]
        if e[1] == 'b': pk.append([t - 0.05, pa, pb]); pb = int(pb * 0.78); pa = int(pa * 1.03); pk.append([t + 0.05, pa, pb])
        elif e[1] == 'd': pk.append([t - 0.05, pa, pb]); pa = int(pa * e[2]); pk.append([t + 0.6, pa, pb])
        else: pk.append([t - 0.05, pa, pb]); pb = int(pb * 0.5); pk.append([t + 0.05, pa, pb])
    pk.append([tcap + 1.0, ko_pw, 0])
    battles.append(dict(t0=round(T0, 2), t1=round(T1, 2), b=k, title=title, pk=[[round(a, 2), int(b), int(c)] for a, b, c in pk], ko=round(tcap + 0.15, 2), inv=[]))
    return battles[-1]

def quick(group, T, per=0.5, dur=1.0, framefill=0.6, smax=5.0, naval=()):
    """caen varios a la vez: zoom que los encuadra a todos, un pelotón rápido por país, sello con nombre y bandera"""
    ks = [K[c] for c in group if c in K and K[c] not in owned]
    if not ks: return T
    xs0 = min(BBOX[k][0] for k in ks); ys0 = min(BBOX[k][1] for k in ks); xs1 = max(BBOX[k][2] for k in ks); ys1 = max(BBOX[k][3] for k in ks)
    pad = 40
    CB(T - 0.35, (xs0 - pad, ys0 - pad, xs1 + pad, ys1 + pad), d=0.5, fill=framefill, smax=smax)
    for i, k in enumerate(ks):
        t = T + i * per
        cap = CAP[k]
        e = entry_for(k, prefer=cap[:2])
        r = max(12.0, min(90.0, diag(k) * 0.12))
        if codes[k] in naval or math.hypot(e[0] - cap[0], e[1] - cap[1]) > diag(k) * 2.5 + 200:
            land = near_cell(k, e)
            arrows.append([round(t - 0.5, 2), round(t + 0.1, 2), round(e[0]), round(e[1]), round(land[0]), round(land[1]), ID, 'naval'])
            e = land
        pts = route(e, cap[:2], set(owned) | {k})
        qi, _, _ = squad(ID, k, pts, [[t, 0], [t + dur, 1.0]], n=4, r=r, t1=t + dur + 0.4)
        occ.append([k, ID, round(t, 2), round(t + dur + 0.6, 2), [qi]])
        flip(k, t + dur, cap[:2], dur=0.5)
        stamps.append([round(t + dur, 2), k, 'small'])
        SV(t + dur, 'stamp', 0.55, (cen[k][0] - (xs0 + xs1) / 2) / 2000)
        if i % 2 == 0: SV(t + dur * 0.5, 'gun', 0.3)
    return T + (len(ks) - 1) * per + dur + 0.25

def bubble(t, k, text, d=1.8): bubbles.append([round(t, 2), k, text, d])
qcards = []
def qcard(t, text, d=2.2): qcards.append([round(t, 2), text, d]); S(t, 'beep_lo', 0.35)

# ======================================================================
PR = json.load(open('src/world.json'))['pr']
def proj(lon, lat):
    l = math.radians(lon); p_ = math.radians(lat); p2 = p_ * p_; p4 = p2 * p2
    x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)))
    y = p_ * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))
    return round(4 * (PR['translate'][0] + PR['scale'] * x)), round(4 * (PR['translate'][1] - PR['scale'] * y))
def city(k, name):
    cs = [c for c in CITY.get(k, []) if name in c['name']]
    return (cs[0]['x'], cs[0]['y']) if cs else None
def cam_cut(a, b): cam[:] = [c for c in cam if not (a <= c[0] < b)]
def own_near(pt): return near_cell(None, pt, among=owned_mask_cells())
COLD = [(0.0, 'THE STRONGEST ARMY ON EARTH'), (3.0, 'AGAINST THE WHOLE WORLD'), (6.0, 'CAN IT WIN?')]
GLOBE = (9.0, 16.5)
IDC = cen[ID]
C(GLOBE[1], IDC[0], IDC[1], 0.62, 0.01); C(GLOBE[1] + 0.05, IDC[0], IDC[1], 0.7, 2.6)
cards.append(dict(t0=16.8, t1=19.6, kind='intro', k=ID))
RT = 19.6; RD = 2.5
roul = [dict(title='LAND ARMY', items=['500K', '800K', '1.4M', '2M', '3M', '600K', '1M', '2.5M'], pick=2, result='🪖 1.4 MILLION SOLDIERS'),
        dict(title='AIR FORCE', items=['3,000', '6,000', '9,000', '13,000', '15,000', '4,000', '11,000', '7,000'], pick=3, result='✈️ 13,000 AIRCRAFT'),
        dict(title='NAVY', items=['4', '6', '8', '11', '14', '5', '9', '12'], pick=3, result='🚢 11 AIRCRAFT CARRIERS'),
        dict(title='TROOP POWER', items=['x0.5', 'x1', 'x1.5', 'x2', 'x3', 'x0.8', 'x1.2', 'x2.5'], pick=3, result='⚡ x2 ELITE TROOPS'),
        dict(title='SPECIAL POWER', items=['???'] * 8, pick=5, result='🔒 LOCKED · REVEALED WHEN IT MATTERS')]
for i, r in enumerate(roul):
    r['kind'] = 'text'; r['t0'] = round(RT + i * RD, 2); r['t1'] = round(RT + (i + 1) * RD - 0.05, 2)
    SV(r['t0'], 'whoosh', 0.5); S(r['t0'] + RD * 0.62, 'roulette_stop', 0.9); S(r['t0'] + RD * 0.62 + 0.05, 'ding' if i < 4 else 'glitch', 0.55)
indo[:] = [[0, 30000]]
for i, v in enumerate([42000, 52000, 60000, 64000]): P(RT + (i + 1) * RD, v)
ARMY = [['🪖', '1.4M SOLDIERS'], ['✈️', '13,000 AIRCRAFT'], ['🚢', '11 CARRIERS'], ['⚡', 'x2 ELITE'], ['🔒', 'SPECIAL: ???']]
T = RT + 5 * RD + 0.2
RANKS = []
C(T, IDC[0], IDC[1] - 50, 0.5, 1.4)
DECL_T = T + 0.6
cards.append(dict(t0=round(DECL_T, 2), t1=round(DECL_T + 2.7, 2), kind='declare', k=ID))
S(DECL_T, 'siren', 0.45); SV(DECL_T, 'boom', 1.0); S(DECL_T + 0.05, 'impact_hit', 0.9); flashes.append(round(DECL_T, 2)); shakes.append([round(DECL_T, 2), 18])
T = DECL_T + 2.9
WAR = T
pw = 64000

# ================= piezas cinematográficas nuevas =================
GLOBES = []; SUMMITS = []; TARGETS = []; GLITCH = []; SPLIT = []; CAM2 = []
def C2(t, x, y, s, d=1.3): CAM2.append([round(t, 2), round(x, 1), round(y, 1), round(s, 3), round(d, 2)])
def globe_zoom(t, lon0, lat0, lon1, lat1, d=3.0, hl=()):
    """zoom desde el espacio: el globo gira hasta la región y se funde limpio con el mapa"""
    GLOBES.append(dict(t0=round(t, 2), t1=round(t + d, 2), lon0=lon0, lat0=lat0, lon1=lon1, lat1=lat1, hl=[codes[k] for k in hl]))
    SV(t, 'whoosh', 0.5); S(t + d - 0.9, 'riser_2s', 0.35)
    return t + d
def summit(t, ks, lines, result, d=None):
    """escena de negociación: bolas alrededor de una mesa, frases rápidas y alianza sellada"""
    d = d or (1.2 + 1.15 * len(lines) + 1.6)
    SUMMITS.append(dict(t0=round(t, 2), t1=round(t + d, 2), ks=ks, lines=[[round(t + 1.0 + 1.15 * i, 2), ks.index(k), txt] for i, (k, txt) in enumerate(lines)], result=result, tr=round(t + d - 1.6, 2)))
    S(t, 'summit', 0.6); SV(t, 'whoosh', 0.5)
    for i in range(len(lines)): S(t + 1.0 + 1.15 * i, 'beep_hi', 0.3)
    S(t + d - 1.6, 'stamp_2', 0.8); SV(t + d - 1.6, 'boom', 0.6)
    return t + d
def target(t, x, y, label='TARGET LOCKED', d=1.3):
    TARGETS.append([round(t, 2), round(t + d, 2), round(x), round(y), label]); S(t, 'lock', 0.5)
def fleet(t, srcs, coast, dur=2.4, n=1):
    """flota de buques que se acerca disparando a la costa"""
    for j, (s_, c_) in enumerate(zip(srcs, coast)):
        arrows.append([round(t + 0.2 * j, 2), round(t + dur + 0.2 * j, 2), round(s_[0]), round(s_[1]), round(c_[0]), round(c_[1]), ID, 'fire'])
        for q in range(4):
            tt = t + dur * 0.55 + 0.2 * j + q * 0.32
            FX.append([round(tt + 0.35, 2), round(c_[0] + rng.uniform(-24, 24)), round(c_[1] + rng.uniform(-24, 24)), 40, 1]); SV(tt, 'far' if q % 2 else 'boom', 0.4)
        S(t + 0.2 * j + dur * 0.5, 'cannon', 0.5)
def enemy_push(A, k_list, src_pts, t0, t_peak, t_back, n=5, col=None, tank_idx=()):
    """contraataque enemigo sobre tierra ya conquistada (el frente avanza y luego retrocede)"""
    ids = []
    for j, (s_, tgt) in enumerate(src_pts):
        pts = route(s_, tgt, set(owned) | {A} | set(k_list))
        if j in tank_idx: q = tanks_sq(A, pts, [[t0 + 0.3 * j, 0], [t_peak, 0.85], [t_back, 0.88]], n=3, t1=t_back + 0.1, fw=[[t_peak - 1.5, t_back]])
        else: q, _, _ = squad(A, None, pts, [[t0 + 0.3 * j, 0], [t_peak, 0.85], [t_back, 0.88]], n=n, r=50, t1=t_back + 0.1, fw=[[t_peak - 1.5, t_back]])
        ids.append(q)
    fls = []
    for kk in k_list:
        f_ = flood_of(A, kk, t0, 0, 1e6, CAP[kk], ids, [], v=32.0, border=False, tw=[[t0, t0], [t_back, t_back], [t_back + 3.6, t0]], t_end=t_back + 3.8)
        occ.append([kk, A, round(t0, 2), round(t_back + 4.0, 2), [], col, f_]); fls.append(f_)
    return ids
def wipe_out(ids, t, ang=None, col=None):
    """bombardeo que aniquila a los pelotones enemigos donde están"""
    for j, q in enumerate(ids):
        hx, hy = head(q, t + 0.1 * j)
        SQ[q]['t1'] = round(t + 0.2 + 0.1 * j, 2)
        bomb_run(ID, t + 0.1 * j, hx, hy, ang=ang if ang is not None else rng.choice([15, 195, -20, 160]), n=2 + (j % 2), nb=3, gap=0.2, g=0.45, size=46, jg=0.35 if j else 0.6)
        DF.append([SQ[q]['a'], round(hx), round(hy), 4 + (j % 2), round(t + 0.25 + 0.1 * j, 2), round(t + 1.3 + 0.1 * j, 2), col or COLS0.get(codes[SQ[q]['a']]), 0.9])
# ================= CAP 1: EL NORTE =================
chapters.append([T, 'THE NORTH']); grade.append([T - 0.1, 'cold'])
FIRST = (T, T + 3.6)
ca = K['CA']; setup_markers(ca, 2, names=['Toronto', 'Vancouver'])
T0 = T + 0.3
cb = [own_near((city(ca, 'Toronto')[0], city(ca, 'Toronto')[1] + 40)), own_near((city(ca, 'Vancouver')[0] + 10, city(ca, 'Vancouver')[1] + 40)), own_near(CAP[ca][:2])]
info = invade(ca, T0, 15.0, cb, main_entries=[cb[2]], n_main=6, tanks=True, minsz=700, smax=3.0, fill=0.55, cam_on=False)
qt = info['ids'][-1]
CB(T0 - 0.3, (CAP[ca][0] - 260, CAP[ca][1] - 120, CAP[ca][0] + 260, CAP[ca][1] + 200), d=0.8, fill=0.6)
spot(T0 + 2.6, T0 + 4.6, lambda t, q=qt: head(q, t), 'M1 ABRAMS TANKS', 140)
autocam(T0 + 4.8, info['tcap'] - 5.0, info['ids'], ca, minsz=700, smax=3.0, fill=0.55)
B = battle_card(ca, 'CANADA', T0, info['tcap'] + 1.6, pw, 2600, info['tb'], info['tcap'], pw + 2600)
fill_inv(B, info['fl'])
chip(T + 0.2, 'DAY 1 · THE FIRST STRIKE', ca, 2.6)
qcard(T0 + 1.6, 'THE NICEST NEIGHBOR GOES FIRST'); bubble(T0 + 5.0, ca, 'Sorry... but NO!')
chip(info['tcap'] + 0.2, 'OTTAWA HAS FALLEN', ca, 2.2)
pw += 2600; P(info['tcap'] + 1, pw)
CB(info['tcap'] - 0.3, BBOX[ca], d=1.0, fill=0.7)
t = info['tcap'] + 2.0
T = t + 0.2
# ================= CAP 2: EL SUR =================
chapters.append([T, 'THE SOUTH']); grade.append([T, 'day'])
mx = K['MX']; setup_markers(mx, 2)
T0 = T + 0.4; D = 14.0
e1 = near_cell(None, (cen[mx][0] - 250, cen[mx][1] - 300), among=cells[ID]); e2 = near_cell(None, (cen[mx][0] + 150, cen[mx][1] - 300), among=cells[ID])
info = invade(mx, T0, D, [e1, e2], main_entries=[e2, e1], n_main=6, minsz=320, air=True)
B = battle_card(mx, 'MEXICO', T0, info['tcap'] + 1.6, pw, 1500, info['tb'], info['tcap'], pw + 900)
fill_inv(B, info['fl']); qcard(T0 + 1.6, 'THE SOUTHERN BORDER'); bubble(T0 + 4.4, mx, '¡No pasarán!')
mbb = [m_ for m_ in markers if m_[1] == mx and m_[0] == 'base']
if mbb: ji = [j for j in JETX if abs(j[0] - (mbb[0][4] - 1.3 - 2.8)) < 0.05]
chip(info['tcap'] + 0.2, 'MEXICO CITY HAS FALLEN', mx, 2.2)
pw += 900; P(info['tcap'] + 1, pw)
t = info['tcap'] + 1.8
t = quick(['GT', 'BZ', 'SV'], t, per=0.5, dur=0.9, framefill=0.62)
t = quick(['HN', 'NI', 'CR', 'PA'], t, per=0.45, dur=0.9, framefill=0.62)
cu = K['CU']; hav = CAP[cu]; lc = near_cell(cu, (hav[0], hav[1] + 10)); src_c = own_near((lc[0] - 30, lc[1] - 120))
C(t, (lc[0] + src_c[0]) / 2, (lc[1] + src_c[1]) / 2, 2.0, 0.9)
landing(src_c, lc, t + 2.0, dur=2.0)
qi, _, _ = squad(ID, cu, route(lc, (hav[0] + 60, hav[1] + 15), {cu}), [[t + 2.0, 0], [t + 3.4, 1.0]], n=5, r=20, t1=t + 3.9)
occ.append([cu, ID, round(t + 2.0, 2), round(t + 4.0, 2), [qi]])
flip(cu, t + 3.4, hav[:2], 0.8); stamps.append([round(t + 3.5, 2), cu, 'big']); chip(t + 0.2, 'CUBA · INVASION BY SEA', cu, 2.4)
t += 4.2
bg('JM HT DO BS TT BB GD VC LC DM AG KN', t - 3.6, t - 0.2, 0.5)
streak.append([T + 0.3, t, 14]); pw += 1500; P(t, pw)
T = t + 0.4
# ================= CAP 3: LATINOAMÉRICA SE UNE =================
chapters.append([T, 'LATIN AMERICA UNITES']); grade.append([T, 'tense'])
br, ar, co, ve, cl, pe = K['BR'], K['AR'], K['CO'], K['VE'], K['CL'], K['PE']
LAT = [br, ar, co, ve, cl, pe]
T = globe_zoom(T + 0.1, -95, 25, -60, -12, 3.0, hl=LAT)
C(T - 0.05, cen[br][0] - 300, cen[br][1] - 200, 0.42, 0.01)
T = summit(T, LAT, [(br, 'They took Mexico...'), (ar, 'We are next.'), (co, 'Alone, we fall.'), (ve, 'Together, we fight!')], 'THE LATAM ALLIANCE')
LP0 = sum(PW[k] for k in LAT) + 9000
# 1) la alianza empuja hacia el norte: Centroamérica en peligro
G0 = T + 0.3
CB(G0 - 0.2, (BBOX[K['GT']][0] - 80, BBOX[K['GT']][1] - 60, BBOX[K['CO']][2] + 60, BBOX[K['CO']][3] - 200), d=1.2, fill=0.8)
pa_, cr_, ni_, hn_ = K['PA'], K['CR'], K['NI'], K['HN']
pushL = enemy_push(co, [pa_, cr_, ni_, hn_], [(near_cell(co, CAP[pa_]), CAP[ni_][:2]), (near_cell(co, (cen[co][0] - 40, cen[co][1] - 200)), CAP[cr_][:2]), (near_cell(co, CAP[pa_]), CAP[hn_][:2])], G0, G0 + 6.0, G0 + 10.0, tank_idx=(1,))
for q, kk in zip(pushL, [br, co, ve]): SQ[q]['a'] = kk
chip(G0 + 0.3, 'THE ALLIANCE MARCHES NORTH', br, 2.2); bubble(G0 + 2.0, br, 'Get out of our continent!')
qcard(G0 + 4.2, 'CAN 6 COUNTRIES STOP THE USA?'); grade.append([G0 + 4, 'red'])
P(G0 + 6, pw - 6000)
BED(G0 + 0.5, G0 + 10, 1.0)
# 2) respuesta: portaaviones, objetivos fijados y paracaidistas
G1 = G0 + 7.0
car = proj(-80, 10.5)
C(G1 - 0.2, (car[0] + cen[co][0]) / 2, (car[1] + cen[co][1]) / 2, 1.0, 1.0)
chip(G1, 'THE CARRIER GROUP ARRIVES', ID, 2.0)
for j, kk in enumerate([co, ve]):
    tp = near_cell(kk, CAP[kk][:2]); target(G1 + 0.4 + j * 0.5, tp[0], tp[1], 'TARGET LOCKED')
    missile(G1 + 1.4 + j * 0.5, car, tp, dur=2.0, big=True)
wipe_out(pushL, G1 + 2.6)
fleet(G1 + 0.3, [proj(-82, 14), proj(-74, 14.5)], [near_cell(co, proj(-75.5, 10.4)), near_cell(ve, proj(-67, 10.6))], dur=2.6)
grade.append([G1 + 2.6, 'day'])
T0 = G1 + 3.4
lco = near_cell(co, proj(-75.5, 10.4)); lve = near_cell(ve, proj(-67, 10.6))
iC = invade(co, T0, 9.0, [lco, near_cell(None, cen[co], among=cells[pa_])], main_entries=[lco], n_main=5, minsz=300, cam_on=False, chips_on=False, siege=False, nb=0)
iV = invade(ve, T0 + 0.6, 9.0, [lve], n_main=5, minsz=300, cam_on=False, chips_on=False, siege=False, nb=0)
para(ID, T0 + 1.2, CAP[co][0] + 60, CAP[co][1] - 40, n=10)
CB(T0, (BBOX[co][0] - 40, BBOX[ve][1] - 60, BBOX[ve][2] + 40, BBOX[co][3] - 100), d=4, fill=0.8)
chip(T0 + 0.6, 'PARATROOPERS OVER BOGOTÁ', ID, 2.0); chip(iC['tcap'] + 0.2, 'COLOMBIA & VENEZUELA FALL', co, 2.2)
pw += 1800; P(iV['tcap'], pw)
# 3) la gran batalla: Brasil
setup_markers(br, 2)
T0 = iV['tcap'] + 1.6; D = 18.0
lb2 = near_cell(br, city(br, 'Rio') or (cen[br][0] + 250, BBOX[br][3] - 300))
ve_e = near_cell(None, cen[br], among=cells[ve]); co_e = near_cell(None, cen[br], among=cells[co])
landing(proj(-30, -18), lb2, T0 + 2.6, dur=2.6)
def _bfx(i):
    def f(th, bx, by):
        ji = bomb_run(ID, th - 0.9, bx, by, ang=rng.choice([20, 200]), n=3, nb=3, jg=0.6)
        if not FIRSTJET: FIRSTJET.append(1); spot(th - 3.0, th - 0.9, lambda t, ji=ji: jet_pos(ji, t), 'F-35 SQUADRON', 150)
    return f
info = invade(br, T0, D, [ve_e, co_e, lb2], main_entries=[ve_e, lb2], n_main=6, minsz=460, smax=3.2, fill=0.55, base_fx={0: _bfx(0), 1: _bfx(1)}, cam_on=False, tanks={1})
autocam(T0 + 0.2, info['tcap'] - 5.0, info['ids'], br, minsz=460, smax=3.2)
mbb = [m_ for m_ in markers if m_[1] == br and m_[0] == 'base']
for m_ in mbb: cam_cut(m_[4] - 3.4, m_[4] + 0.4); C(m_[4] - 3.3, m_[2], m_[3], 1.8, 0.7)
C(info['tcap'] - 4.9, (CAP[br][0] + info['stops'][0][0]) / 2, (CAP[br][1] + info['stops'][0][1]) / 2, 2.4, 1.2)
chip(T0 + 2.8, 'MARINES LAND IN RIO', ID, 2.0); bubble(T0 + 5.0, br, 'Not in my jungle!')
chip(info['tcap'] + 0.2, 'BRASÍLIA HAS FALLEN', br, 2.2)
LKO = info['tcap']
B = dict(t0=round(G0 - 0.4, 2), t1=round(LKO + 1.6, 2), b=br, title='LATAM ALLIANCE', ko=round(LKO + 0.15, 2), inv=[],
         pk=[[G0 - 0.4, pw - 1800, LP0], [G0 + 6, pw - 7800, LP0 + 1500], [G1 + 2.6, pw - 5000, int(LP0 * 0.7)], [iV['tcap'], pw, int(LP0 * 0.5)], [LKO - 0.05, pw, int(LP0 * 0.2)], [LKO + 1, pw + 2500, 0]])
battles.append(B); fill_inv(B, info['fl'])
pw += 2500; P(LKO + 1, pw)
t = LKO + 1.6
cards.append(dict(t0=round(t, 2), t1=round(t + 2.2, 2), kind='stamp', text='THE ALLIANCE COLLAPSES', k=ID)); S(t, 'stinger_win', 0.6)
C(t, 2350, 2500, 0.3, 1.2)
bg('AR CL PE BO PY UY EC GY SR FK', t + 0.2, t + 2.4, 0.6)
subs.append(round(t + 2.6, 2))
T = t + 2.8
# ================= CAP 4: EUROPA SE UNE =================
chapters.append([T, 'EUROPE UNITES']); grade.append([T, 'dusk'])
es, pt, fr, de, gb, it, pl, nl = K['ES'], K['PT'], K['FR'], K['DE'], K['GB'], K['IT'], K['PL'], K['NL']
T = globe_zoom(T + 0.1, -50, 20, 2, 44, 3.0, hl=[es, pt, fr, de, gb, it])
setup_markers(es, 1)
_esm = np.array([i for i in cells[es] if abs(X[i] - cen[es][0]) < 260 and abs(Y[i] - cen[es][1]) < 200])
l_es = near_cell(None, proj(-8.6, 42.6), among=_esm); l_pt = near_cell(pt, proj(-9.1, 38.8))
C(T - 0.1, (l_es[0] + l_pt[0]) / 2 - 150, (l_es[1] + l_pt[1]) / 2, 1.1, 0.01)
landing(proj(-20, 43), l_es, T + 2.2, dur=2.2); landing(proj(-20, 38), l_pt, T + 2.4, dur=2.2)
chip(T + 0.2, 'THE USA LANDS IN IBERIA', ID, 2.2)
iP = invade(pt, T + 2.4, 6.0, [l_pt], cam_on=False, chips_on=False, nb=0, siege=False)
iE = invade(es, T + 2.2, 11.0, [l_es, l_pt], main_entries=[l_es], minsz=380, cam_on=False, tanks=True)
CB(T + 1.6, (BBOX[pt][0] - 60, cen[es][1] - 250, cen[es][0] + 280, cen[es][1] + 230), d=3, fill=0.7)
C(iE['tcap'] - 4.9, (CAP[es][0] + iE['stops'][0][0]) / 2, (CAP[es][1] + iE['stops'][0][1]) / 2, 2.6, 1.2)
B = battle_card(es, 'SPAIN', T, iE['tcap'] + 1.6, pw, 2100, iE['tb'], iE['tcap'], pw + 1500)
fill_inv(B, iE['fl']); bubble(T + 5.0, es, '¡Ni de broma!')
chip(iE['tcap'] + 0.2, 'MADRID HAS FALLEN', es, 2.2)
pw += 1500; P(iE['tcap'] + 1, pw)
T = iE['tcap'] + 1.8
EU = [fr, de, gb, it, pl, nl]
C(T, cen[fr][0], cen[fr][1] - 50, 0.75, 1.2)
T = summit(T + 0.2, EU, [(fr, 'Spain has fallen.'), (de, 'Alone, we lose.'), (gb, 'Then we stand together.'), (it, 'For Europe!')], 'EUROPE UNITES')
EP0 = sum(PW[k] for k in EU) + 12000
# 1) Europa contraataca en España: la parte dura
G0 = T + 0.3
pushE = enemy_push(fr, [es, pt], [(near_cell(fr, (cen[es][0] - 60, cen[es][1] - 260)), (CAP[es][0] - 40, CAP[es][1] + 20)), (near_cell(fr, (cen[es][0] + 200, cen[es][1] - 240)), (cen[es][0] + 120, cen[es][1] + 80)), (near_cell(fr, (cen[es][0] + 100, cen[es][1] - 250)), (CAP[es][0] + 30, CAP[es][1] - 30))], G0, G0 + 7.0, G0 + 12.5, tank_idx=(2,))
for q, kk in zip(pushE, [fr, de, it]): SQ[q]['a'] = kk
CB(G0 - 0.2, (BBOX[pt][0] - 40, cen[fr][1] - 220, cen[es][0] + 360, cen[es][1] + 220), d=1.2, fill=0.8)
chip(G0 + 0.4, 'EUROPE STRIKES BACK!', fr, 2.2); bubble(G0 + 2.0, de, 'Raus aus Europa!')
chip(G0 + 5.0, 'THE USA IS LOSING SPAIN', ID, 2.2); qcard(G0 + 7.3, 'TOO STRONG FOR THE USA?')
grade.append([G0 + 4.5, 'red']); P(G0 + 7, pw - 9000)
BED(G0 + 0.5, G0 + 12, 1.2)
# 2) la flota: buques de guerra bombardeando las costas y misiles desde los portaaviones
G1 = G0 + 9.0
C(G1 - 0.3, CAP[fr][0] - 120, CAP[fr][1] + 260, 0.95, 1.0)
chip(G1, 'THE US NAVY: 40 WARSHIPS', ID, 2.4); S(G1 - 0.2, 'riser_2s', 0.6)
fleet(G1 + 0.2, [proj(-14, 46), proj(-12, 44), proj(-11, 48.5), proj(4, 39.5), proj(8, 41.5)], [near_cell(fr, proj(-1.3, 46.2)), near_cell(es, proj(-3.8, 43.4)), near_cell(fr, proj(-4.2, 48.2)), near_cell(es, proj(2.1, 41.4)), near_cell(fr, proj(5.3, 43.3))], dur=2.8)
car2 = proj(-12, 47)
setup_markers(fr, 2); setup_markers(de, 1)
for j, (kk, nm) in enumerate([(fr, 'PARIS'), (de, 'BERLIN'), (gb, 'LONDON')]):
    tp = near_cell(kk, (CAP[kk][0] + 18, CAP[kk][1] + 14)); target(G1 + 1.6 + j * 0.45, tp[0], tp[1], f'TARGET: {nm}')
    missile(G1 + 2.6 + j * 0.45, car2, tp, dur=2.4, big=True)
wipe_out(pushE, G1 + 3.0)
grade.append([G1 + 3.4, 'gold'])
chip(G1 + 3.6, 'THE COUNTERATTACK IS CRUSHED', ID, 2.2)
P(G1 + 5, pw)
# 3) caen las grandes: Francia, Alemania, Reino Unido, Italia
T0 = G1 + 5.4; D = 13.0
e_fr = [near_cell(None, (cen[fr][0], cen[fr][1] + 200), among=cells[es]), near_cell(fr, proj(-1.3, 46.2))]
info = invade(fr, T0, D, e_fr, main_entries=[e_fr[1]], n_main=6, tanks=True, minsz=300)
chip(info['tcap'] + 0.2, 'PARIS HAS FALLEN', fr, 2.2)
FRKO = info['tcap']
T0 = FRKO + 1.4
lgb = near_cell(gb, proj(-4.5, 50.6)); landing(proj(-12, 49.5), lgb, T0 + 1.8, dur=1.8)
iG = invade(gb, T0 + 1.8, 9.0, [lgb], minsz=240, smax=3.6, nb=0, cam_on=False)
iD = invade(de, T0, 11.0, [near_cell(None, cen[de], among=cells[fr])], minsz=260, smax=3.6, air=True, cam_on=False)
iI = invade(it, T0 + 0.8, 10.0, [near_cell(None, cen[it], among=cells[fr])], minsz=260, smax=3.6, nb=0, cam_on=False, siege=False)
CB(T0, (BBOX[gb][0] - 40, BBOX[gb][1] - 40, cen[pl][0], cen[it][1] + 160), d=3, fill=0.85)
C(iG['tcap'] - 4.6, CAP[gb][0] + 10, CAP[gb][1] + 10, 2.4, 1.2); C(iD['tcap'] - 4.6, CAP[de][0] + 10, CAP[de][1] + 10, 2.4, 1.2)
CB(iD['tcap'] + 0.4, (BBOX[gb][0] - 40, BBOX[gb][1] - 40, cen[pl][0], cen[it][1] + 160), d=1.2, fill=0.85)
chip(iG['tcap'] + 0.2, 'LONDON HAS FALLEN', gb, 2.0); chip(iD['tcap'] + 0.2, 'BERLIN HAS FALLEN', de, 2.0)
EKO = max(iG['tcap'], iD['tcap'], iI['tcap'])
B = dict(t0=round(G0 - 0.4, 2), t1=round(EKO + 1.6, 2), b=fr, title='EUROPEAN UNION', ko=round(EKO + 0.15, 2), inv=[],
         pk=[[G0 - 0.4, pw, EP0], [G0 + 7, pw - 9000, EP0 + 3000], [G1 + 3.0, pw - 3000, int(EP0 * 0.7)], [FRKO, pw, int(EP0 * 0.45)], [EKO - 0.05, pw + 2000, int(EP0 * 0.1)], [EKO + 1, pw + 6000, 0]])
battles.append(B); fill_inv(B, info['fl'])
pw += 6000; P(EKO + 1, pw)
t = EKO + 1.8
for g in [['BE', 'NL', 'LU'], ['CH', 'AT', 'DK'], ['NO', 'SE', 'FI'], ['PL', 'CZ', 'SK'], ['HU', 'RO', 'UA']]:
    t = quick(g, t, per=0.45, dur=0.85, framefill=0.62)
bg('IE IS AD MC SM LI MT VA HR BA RS ME AL MK GR BG MD SI EE LV LT CY XK BY', t - 5, t + 0.5, 0.6)
streak.append([EKO + 1.8, t, 30])
cards.append(dict(t0=round(t + 0.1, 2), t1=round(t + 2.3, 2), kind='stamp', text='EUROPE HAS FALLEN', k=ID)); S(t + 0.1, 'stinger_win', 0.6)
C(t, 4100, 1500, 0.42, 1.4)
pw += 3000; P(t, pw)
T = t + 2.8
# ================= CAP 5: EL MUNDO CAE =================
chapters.append([T, 'THE WORLD FALLS']); grade.append([T, 'day'])
t = quick(['MA', 'DZ', 'TN'], T + 0.3, per=0.45, dur=0.85, framefill=0.62)
t = quick(['LY', 'EG', 'TR'], t, per=0.45, dur=0.95, framefill=0.62)
AFR = 'SD SS ER DJ ET SO KE UG RW BI TZ CD CF NG CM GQ GA CG AO ZM MW MZ ZW BW NA ZA LS SZ MG KM SC MU ST BJ TG GH BF CI LR SL GN GW GM SN CV ML MR NE TD EH'
bg(AFR, t - 1.0, t + 4.0, 0.6); chip(t, 'AFRICA FALLS', K['NG'], 2.0)
t = quick(['SY', 'IQ', 'SA'], t + 0.3, per=0.45, dur=0.85, framefill=0.62)
bg('GE AM AZ LB IL PS JO KW QA BH AE OM YE', t - 3, t, 0.6)
ir = K['IR']; setup_markers(ir, 1)
T0 = t + 0.4
gulf = proj(52.5, 26.5)
C(T0 - 0.2, (gulf[0] + CAP[ir][0]) / 2, (gulf[1] + CAP[ir][1]) / 2, 1.0, 1.0)
def _mfx(th, bx, by): target(th - 3.2, bx, by); missile(th - 2.3, gulf, (bx, by), dur=2.3, boom=False)
info = invade(ir, T0, 11.0, [near_cell(None, cen[ir], among=cells[K['IQ']])], minsz=420, smax=3.2, base_fx={0: _mfx}, tstrike={0: T0 + 3.6})
B = battle_card(ir, 'IRAN', T0, info['tcap'] + 1.6, pw, 2600, info['tb'], info['tcap'], pw + 1500)
fill_inv(B, info['fl']); chip(T0 + 0.6, 'CARRIERS FIRE FROM THE GULF', ID, 2.2)
chip(info['tcap'] + 0.2, 'TEHRAN HAS FALLEN', ir, 2.2)
pw += 1500; P(info['tcap'] + 1, pw)
t = quick(['AF', 'TM', 'UZ'], info['tcap'] + 1.6, per=0.45, dur=0.85, framefill=0.62)
bg('TJ KG', t - 1.2, t - 0.5, 0.6)
inn = K['IN']; setup_markers(inn, 1)
T0 = t + 0.4; D = 13.0
lin = near_cell(inn, proj(72.9, 19.4)); drop = near_cell(inn, (CAP[inn][0] - 40, CAP[inn][1] + 120))
landing(proj(65, 17), lin, T0 + 1.6, dur=1.6)
info = invade(inn, T0 + 1.6, D, [lin], main_entries=[lin, drop], n_main=6, minsz=420, smax=3.2, push={('m', 1): lambda ts, tc: [[T0 + 6.8, 0], [T0 + 9.5, 0.5]]})
para(ID, T0 + 5.0, drop[0], drop[1], n=12)
cam_cut(T0 + 4.0, T0 + 8.5); C(T0 + 4.1, drop[0] + 10, drop[1] + 20, 2.4, 0.9); C(T0 + 6.8, (drop[0] + CAP[inn][0]) / 2, (drop[1] + CAP[inn][1]) / 2, 2.0, 1.4)
B = battle_card(inn, 'INDIA', T0, info['tcap'] + 1.6, pw, 4800, info['tb'], info['tcap'], pw + 3000)
fill_inv(B, info['fl']); chip(T0 + 5.2, 'PARATROOPERS OVER DELHI!', ID, 2.2); bubble(T0 + 6.5, inn, 'From the sky?!')
chip(info['tcap'] + 0.2, 'NEW DELHI HAS FALLEN', inn, 2.2)
pw += 3000; P(info['tcap'] + 1, pw)
t = quick(['NP', 'BT', 'BD', 'LK'], info['tcap'] + 1.6, per=0.42, dur=0.85, framefill=0.62)
bg('MV', t - 1, t - 0.5, 0.5)
t = quick(['MM', 'TH', 'LA', 'KH'], t, per=0.42, dur=0.85, framefill=0.62)
t = quick(['VN', 'MY', 'ID'], t, per=0.45, dur=0.95, framefill=0.62, naval=('ID',))
bg('SG BN TL PH PG AU NZ FJ SB VU NC', t - 3, t + 0.5, 0.6)
t = quick(['JP', 'KR', 'TW'], t + 0.2, per=0.45, dur=0.95, framefill=0.62, naval=('JP', 'TW'))
bg('PW FM MH NR KI TV WS TO', t - 2, t, 0.5)
pw += 9000; P(t, pw)
streak.append([T + 0.3, t, 60])
T = t + 0.6
# ================= CAP 6: LA ÚLTIMA ALIANZA =================
chapters.append([T, 'THE LAST ALLIANCE']); grade.append([T, 'night'])
cn, ru, kp, pk_, kz, mn = K['CN'], K['RU'], K['KP'], K['PK'], K['KZ'], K['MN']
LAST = [cn, ru, kp, pk_, kz, mn]
T = globe_zoom(T + 0.1, 0, 30, 95, 45, 3.0, hl=LAST)
C(T - 0.05, 5600, 1500, 0.32, 0.01)
T = summit(T, LAST, [(cn, 'Only we remain.'), (ru, 'Then we strike first.'), (kp, 'All at once!'), (pk_, 'From every side!')], 'THE LAST ALLIANCE')
upw = pw; apw = int(pw * 1.08)
chip(T + 2.9, 'FOR THE FIRST TIME, THE USA IS WEAKER', cn, 2.4)
S(T + 0.1, 'riser_2s', 0.5)
G0 = T + 2.8
HOLD = G0 + 33.0          # los frentes enemigos aguantan hasta el apagón
PUSHES = []               # (ids, nombre del frente, centro de cámara)
def front(i): return G0 + i * 4.6
# A1 Rusia recupera Europa del Este
tA = front(0)
pR = enemy_push(ru, [pl, K['UA'], K['BY'], K['LT'], K['LV'], K['EE'], K['FI']], [(near_cell(ru, cen[pl]), cen[pl]), (near_cell(ru, cen[K['FI']]), cen[K['FI']]), (near_cell(ru, cen[K['UA']]), cen[K['UA']])], tA, tA + 4.0, HOLD, tank_idx=(2,))
C(tA - 0.2, cen[K['UA']][0] - 80, cen[K['UA']][1] - 160, 0.95, 0.6); chip(tA + 0.2, 'RUSSIA RETAKES EASTERN EUROPE', ru, 2.6)
PUSHES.append((pR, 'EUROPE', (cen[K['UA']][0] - 80, cen[K['UA']][1] - 160, 0.95)))
# A2 China recupera el sudeste asiático
tA = front(1)
pC = enemy_push(cn, [K['VN'], K['LA'], K['TH'], K['MM'], K['KH']], [(near_cell(cn, cen[K['VN']]), cen[K['VN']]), (near_cell(cn, cen[K['MM']]), cen[K['TH']])], tA, tA + 4.0, HOLD, tank_idx=(0,))
C(tA - 0.2, cen[K['TH']][0] + 60, cen[K['TH']][1] - 60, 1.1, 0.6); chip(tA + 0.2, 'CHINA RETAKES SOUTHEAST ASIA', cn, 2.6)
PUSHES.append((pC, 'ASIA', (cen[K['TH']][0] + 60, cen[K['TH']][1] - 60, 1.1)))
# A3 Corea del Norte golpea Seúl y Tokio
tA = front(2)
pK = enemy_push(kp, [K['KR']], [(near_cell(kp, CAP[K['KR']][:2]), CAP[K['KR']][:2])], tA, tA + 3.6, HOLD)
for j_, kk in enumerate([K['KR'], K['JP']]):
    tp = near_cell(kk, CAP[kk][:2]); target(tA + 0.3 + j_ * 0.4, tp[0], tp[1], 'INCOMING'); missile(tA + 0.8 + j_ * 0.4, CAP[kp][:2], tp, dur=1.8, big=True)
C(tA - 0.2, (CAP[kp][0] + CAP[K['JP']][0]) / 2, CAP[kp][1] + 40, 1.7, 0.6); chip(tA + 0.2, 'NORTH KOREA HITS SEOUL & TOKYO', kp, 2.6)
PUSHES.append((pK, 'KOREA', ((CAP[kp][0] + CAP[K['JP']][0]) / 2, CAP[kp][1] + 40, 1.7)))
# A4 Pakistán entra en la India
tA = front(3)
pP = enemy_push(pk_, [inn], [(near_cell(pk_, CAP[inn][:2]), CAP[inn][:2]), (near_cell(pk_, (cen[inn][0] - 100, cen[inn][1])), (cen[inn][0] - 60, cen[inn][1] + 40))], tA, tA + 4.0, HOLD)
C(tA - 0.2, CAP[inn][0] - 120, CAP[inn][1] + 40, 1.3, 0.6); chip(tA + 0.2, 'PAKISTAN INVADES INDIA', pk_, 2.6)
PUSHES.append((pP, 'INDIA', (CAP[inn][0] - 120, CAP[inn][1] + 40, 1.3)))
# A5 Rusia y China desembarcan en Sudamérica
tA = front(4)
lve2 = near_cell(ve, proj(-66.9, 10.6)); lbr2 = near_cell(br, proj(-38.5, -3.7))
landing(proj(-50, 20), lve2, tA + 1.6, dur=1.6, who=ru); landing(proj(-25, 0), lbr2, tA + 1.8, dur=1.6, who=cn)
qv, _, _ = squad(ru, None, route(lve2, CAP[ve][:2], {ve}), [[tA + 1.6, 0], [tA + 4.2, 0.85], [HOLD, 0.88]], n=5, r=40, t1=HOLD + 0.1, fw=[[tA + 3, HOLD]])
qb_ = tanks_sq(cn, route(lbr2, (lbr2[0] - 160, lbr2[1] + 60), {br}), [[tA + 1.8, 0], [tA + 4.4, 0.85], [HOLD, 0.88]], n=3, t1=HOLD + 0.1, fw=[[tA + 3, HOLD]])
for kk, q_, l_, A_ in [(ve, qv, lve2, ru), (br, qb_, lbr2, cn)]:
    f_ = flood_of(A_, kk, tA + 1.6, 0, 1e6, CAP[kk], [q_], [l_], v=36.0, border=False, tw=[[tA + 1.6, tA + 1.6], [HOLD, HOLD], [HOLD + 3.6, tA + 1.6]], t_end=HOLD + 3.8)
    occ.append([kk, A_, round(tA + 1.6, 2), round(HOLD + 4.0, 2), [], None, f_])
C(tA - 0.2, (lve2[0] + lbr2[0]) / 2, (lve2[1] + lbr2[1]) / 2, 0.75, 0.6); chip(tA + 0.2, 'RUSSIA & CHINA LAND IN SOUTH AMERICA', cn, 2.6)
PUSHES.append(([qv, qb_], 'S. AMERICA', ((lve2[0] + lbr2[0]) / 2, (lve2[1] + lbr2[1]) / 2, 0.75)))
# A6 y por último, contra EE. UU.
tA = front(5)
ak = near_cell(ID, proj(-150, 61.2)); la_ = city(ID, 'Los Angeles'); lla = near_cell(ID, (la_[0] + 6, la_[1] - 4)); sf = city(ID, 'San Francisco'); lsf = near_cell(ID, (sf[0] + 8, sf[1]))
landing(proj(-175, 63), ak, tA + 1.4, dur=1.4, who=ru); landing(proj(-135, 30), lla, tA + 1.6, dur=1.6, who=cn); landing(proj(-138, 38), lsf, tA + 1.8, dur=1.6, who=cn)
qak, _, _ = squad(ru, None, route(ak, (ak[0] + 120, ak[1] - 20), {ID}), [[tA + 1.4, 0], [tA + 5.0, 0.8], [HOLD, 0.85]], n=5, r=40, t1=HOLD + 0.1, fw=[[tA + 3, HOLD]])
qla = tanks_sq(cn, route(lla, (lla[0] + 170, lla[1] - 30), {ID}), [[tA + 1.6, 0], [tA + 5.4, 0.85], [HOLD, 0.9]], n=3, t1=HOLD + 0.1, fw=[[tA + 4, HOLD]])
qsf, _, _ = squad(cn, None, route(lsf, (lsf[0] + 150, lsf[1] - 40), {ID}), [[tA + 1.8, 0], [tA + 5.6, 0.85], [HOLD, 0.9]], n=6, r=50, t1=HOLD + 0.1, fw=[[tA + 4, HOLD]])
FL_US = flood_of(cn, ID, tA + 1.4, 0, 1e6, CAP[ID], [qak, qla, qsf], [ak, lla, lsf], v=30.0, border=False, tw=[[tA + 1.4, tA + 1.4], [HOLD, HOLD], [HOLD + 3.6, tA + 1.4]], t_end=HOLD + 3.8)
occ.append([ID, cn, round(tA + 1.4, 2), round(HOLD + 4.0, 2), [], '#ffcc1a', FL_US])
C(tA - 0.2, (ak[0] + la_[0]) / 2 - 150, (ak[1] + la_[1]) / 2, 0.6, 0.6); chip(tA + 0.2, 'THEN THEY HIT AMERICA ITSELF', ru, 2.4)
tgs = [near_cell(ID, city(ID, n_)) for n_ in ['Chicago', 'Houston', 'New York'] if city(ID, n_)]
C(tA + 3.0, cen[ID][0], cen[ID][1] + 30, 0.6, 0.8)
for j_, p_ in enumerate(tgs): target(tA + 3.0 + j_ * 0.3, p_[0], p_[1], 'INCOMING'); missile(tA + 3.4 + j_ * 0.35, proj(-150, 25), p_, dur=2.0, g=0.5, big=(j_ == 0))
S(tA + 3.0, 'siren', 0.5)
PUSHES.append(([qak, qla, qsf], 'USA', ((ak[0] + la_[0]) / 2 - 150, (ak[1] + la_[1]) / 2, 0.6)))
TALL = tA + 6.4
C(TALL, 4300, 1900, 0.27, 1.4)
qcard(TALL + 0.3, 'ATTACKED ON 6 FRONTS AT ONCE'); grade.append([tA, 'red'])
P(TALL, int(pw * 0.62)); BED(G0, TALL + 2, 1.3)
# --- el giro: OPERACIÓN APAGÓN (se corta la red de la alianza) ---
L0 = TALL + 2.6
reveal = dict(t0=round(L0 - 0.2, 2), t1=round(L0 + 4.0, 2), name='OPERATION BLACKOUT', icon='radar-dish')
S(L0 - 0.2, 'heartbeat', 0.7); S(L0 + 1.6, 'riser_2s', 0.7); SV(L0 + 3.8, 'boom', 1.0)
NT0 = L0 + 4.1
nodes = [[CAP[cn][0], CAP[cn][1], 'BEIJING', 'hq'], [CAP[ru][0], CAP[ru][1], 'MOSCOW', 'hq'], [CAP[kp][0], CAP[kp][1], 'PYONGYANG', 'n'], [CAP[pk_][0], CAP[pk_][1], 'ISLAMABAD', 'n'], [CAP[kz][0], CAP[kz][1], 'ASTANA', 'n'], [CAP[mn][0], CAP[mn][1], 'ULAANBAATAR', 'n']]
for ids_, nm, c_ in PUSHES:
    hx, hy = head(ids_[0], NT0 + 2); nodes.append([round(hx), round(hy), nm + ' ARMY', 'n'])
links = [[0, 1], [0, 2], [0, 3], [1, 4], [0, 5], [1, 6], [0, 7], [2, 8], [3, 9], [1, 10], [0, 10], [0, 11], [1, 11]]
links = [l for l in links if l[1] < len(nodes)]
satp = proj(-100, 75)
NTC = NT0 + 3.4
net = dict(t0=round(NT0, 2), tc=round(NTC, 2), t1=round(NTC + 3.6, 2), nodes=[[round(x), round(y), n_, k_] for x, y, n_, k_ in nodes], links=links, src=[round(satp[0]), round(satp[1])])
C(NT0, 4900, 1900, 0.24, 0.8)
chip(NT0 + 0.2, 'THE ALLIANCE NETWORK: EVERY ARMY IS CONNECTED', cn, 3.0)
S(NTC - 0.9, 'riser_2s', 0.6); S(NTC, 'blackout', 1.0); SV(NTC, 'boom', 0.9); flashes.append(round(NTC, 2))
GLITCH.append([round(NTC + 0.2, 2), round(NTC + 2.4, 2)])
chip(NTC + 2.5, 'ALL COMMUNICATIONS CUT', ID, 2.2)
grade.append([NTC + 3.6, 'gold'])
# la respuesta, frente a frente
R0 = NTC + 3.8
for i, (ids_, nm, (cx_, cy_, s_)) in enumerate(PUSHES):
    tr = R0 + i * 2.5
    C(tr - 0.25, cx_, cy_, s_, 0.5)
    wipe_out(ids_, tr + 0.3)
    chip(tr + 0.2, f'{nm}: RETAKEN', ID, 2.0)
bubble(R0 + 2.5 * 5 + 0.6, cn, 'Our armies... where are they?!')
HOLD2 = R0 + 2.5 * len(PUSHES)
t = HOLD2 + 0.6
t = quick(['KP', 'MN'], t, per=0.5, dur=1.0, framefill=0.55, naval=('KP',))
t = quick(['PK', 'KZ'], t, per=0.5, dur=1.0, framefill=0.55)
P(t, pw)
GEND = t
B = dict(t0=round(G0 - 2.8, 2), t1=round(GEND, 2), b=cn, title='THE LAST ALLIANCE', ko=round(GEND - 0.4, 2), inv=[],
         pk=[[G0 - 2.8, upw, apw], [TALL, int(upw * 0.62), apw + 6000], [NTC + 1, int(upw * 0.64), int(apw * 0.55)], [HOLD2, upw, int(apw * 0.45)], [GEND - 0.4, upw + 4000, int(apw * 0.4)]])
battles.append(B)
B['inv'] = [[round(G0 - 2.8 + i * 0.25, 2), 0] for i in range(int((GEND - G0 + 2.8) / 0.25))]
T = t + 0.4
# ================= CAP 7: LA TRAICIÓN (China contra Rusia) =================
chapters.append([T, 'THE BETRAYAL']); grade.append([T, 'tense'])
C(T, (CAP[cn][0] + CAP[ru][0]) / 2, (CAP[cn][1] + CAP[ru][1]) / 2 + 100, 0.4, 1.2)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 2.6, 2), kind='bigtext', text='BLIND AND ALONE...', sub='RUSSIA AND CHINA BLAME EACH OTHER'))
bubble(T + 2.8, ru, 'YOU sold us out!', 2.0); bubble(T + 4.0, cn, 'No, it was YOU!', 2.0)
BT0 = T + 5.2; BT1 = BT0 + 9.0
pRC = enemy_push(ru, [cn], [(near_cell(ru, (cen[cn][0] - 300, BBOX[cn][1])), (cen[cn][0] - 300, cen[cn][1] - 200)), (near_cell(ru, (CAP[cn][0] + 200, BBOX[cn][1])), (CAP[cn][0] + 100, CAP[cn][1] - 150))], BT0, BT0 + 5, BT1, tank_idx=(1,))
pCR = enemy_push(cn, [ru, mn], [(near_cell(cn, (cen[cn][0] + 500, BBOX[cn][1] + 40)), (cen[cn][0] + 600, BBOX[cn][1] - 250)), (near_cell(cn, (cen[cn][0] - 600, BBOX[cn][1] + 100)), (cen[cn][0] - 700, BBOX[cn][1] - 200))], BT0 + 0.4, BT0 + 5, BT1, tank_idx=(0,))
C(BT0 - 0.2, cen[cn][0], BBOX[cn][1] + 60, 0.6, 1.0); C(BT0 + 3.0, cen[cn][0] + 200, BBOX[cn][1] + 20, 0.75, 4.0)
chip(BT0 + 0.2, 'RUSSIA VS CHINA!', ru, 2.4); qcard(BT0 + 2.6, "THEY'RE FIGHTING EACH OTHER?!")
for j_ in range(3):
    a_ = near_cell(ru, (cen[cn][0] - 200 + j_ * 300, BBOX[cn][1] - 300)); b_ = near_cell(cn, (cen[cn][0] - 250 + j_ * 280, BBOX[cn][1] + 150))
    missile(BT0 + 1.5 + j_ * 0.6, a_, b_, dur=1.8, g=0.35); missile(BT0 + 1.8 + j_ * 0.6, b_, a_, dur=1.8, g=0.35)
BED(BT0, BT1, 1.2)
S(BT1 - 1.5, 'riser_2s', 0.6)
T = BT1 + 0.2
# ================= CAP 8: LA GUERRA FINAL (cinemática) =================
chapters.append([T, 'THE FINAL WAR']); grade.append([T, 'night'])
FW = T
C(FW, 4300, 1900, 0.27, 0.01); C(FW + 0.05, 5200, 1700, 0.34, 3.4)
cards.append(dict(t0=round(FW + 0.2, 2), t1=round(FW + 3.2, 2), kind='bigtext', text='THE FINAL WAR', sub='USA VS RUSSIA & CHINA'))
S(FW, 'sub_drop', 0.9); SV(FW + 0.2, 'boom', 0.9)
wipe_out(pRC + pCR, FW + 3.6)
# la flota del Pacífico: buques disparando a la costa china
F1 = FW + 3.4
C(F1, CAP[cn][0] + 420, CAP[cn][1] + 260, 0.85, 1.4)
chip(F1 + 0.2, 'THE 7TH FLEET ARRIVES', ID, 2.4)
fleet(F1 + 0.3, [proj(128, 26), proj(127, 31), proj(126, 36), proj(132, 33)], [near_cell(cn, proj(119.5, 26.0)), near_cell(cn, proj(121.5, 30.5)), near_cell(cn, proj(120.4, 36.1)), near_cell(cn, proj(121.6, 38.9))], dur=2.8)
setup_markers(cn, 3, names=['Shanghai', 'Chongqing', 'Guangzhou'])
carp = proj(130, 30)
T0 = F1 + 2.6; D = 22.0
e_cn = near_cell(cn, proj(121.0, 31.0)); e_cn2 = near_cell(cn, proj(117.9, 38.9))
landing(proj(127, 29), e_cn, T0 + 1.6, dur=1.6); landing(proj(124, 37), e_cn2, T0 + 1.8, dur=1.6)
def _cfx(i):
    def f(th, bx, by):
        target(th - 3.4, bx, by, 'TARGET LOCKED'); missile(th - 2.4, carp, (bx, by), dur=2.4, boom=False)
        if i == 2: bomb_run(ID, th - 0.8, bx, by, ang=200, n=3, nb=3)
    return f
TS_C = T0 + D - 7.0
hpb = [[TS_C, 1.0], [TS_C + 1.0, 1.0], [TS_C + 1.15, 0.8], [TS_C + 2.3, 0.8], [TS_C + 2.45, 0.6], [TS_C + 3.6, 0.6], [TS_C + 3.75, 0.38], [TS_C + 5.0, 0.38], [TS_C + 5.15, 0.15], [TS_C + 6.4, 0.15], [T0 + D, 0.0]]
info = invade(cn, T0 + 1.6, D - 1.6, [e_cn, e_cn2], main_entries=[e_cn2, e_cn], n_main=7, tanks={0}, minsz=650, smax=3.0, fill=0.55, cam_on=False, tstrike={0: T0 + 5.2, 1: T0 + 6.4, 2: T0 + 7.6}, base_fx={i: _cfx(i) for i in range(3)})
tcapC = info['tcap']
CAPHP[-1] = [cn, round(CAP[cn][0]), round(CAP[cn][1]), round(TS_C, 2), round(tcapC, 2), hpb]
para(ID, T0 + 9.0, CAP[cn][0] + 120, CAP[cn][1] + 60, n=12)
mbc = [m_ for m_ in markers if m_[1] == cn and m_[0] == 'base' and m_[4] is not None]
xs = [m_[2] for m_ in mbc] + [carp[0]]; ys = [m_[3] for m_ in mbc] + [carp[1]]
CB(T0 + 1.8, (min(xs) - 80, min(ys) - 160, max(xs) + 80, max(ys) + 80), d=1.2, fill=0.8)
C(T0 + 8.6, CAP[cn][0] + 100, CAP[cn][1] + 60, 1.8, 0.9)
autocam(T0 + 10.5, TS_C - 0.6, info['ids'], cn, minsz=650, smax=3.0, fill=0.55)
C(TS_C - 0.5, (CAP[cn][0] + info['stops'][0][0]) / 2, (CAP[cn][1] + info['stops'][0][1]) / 2, 2.2, 1.2); C(TS_C + 2.0, CAP[cn][0] + 10, CAP[cn][1] + 6, 2.7, 4.5)
chip(T0 + 9.2, 'PARATROOPERS OVER BEIJING', ID, 2.0); chip(TS_C + 3.8, 'CHINA HOLDS ON!', cn, 1.8); bubble(TS_C + 4.0, cn, 'Never!')
chip(tcapC + 0.2, 'BEIJING HAS FALLEN', cn, 2.4)
B = battle_card(cn, 'CHINA', FW + 3.3, tcapC + 1.6, pw, 33500, info['tb'], tcapC, pw + 15000)
fill_inv(B, info['fl'])
cards.append(dict(t0=round(tcapC + 1.6, 2), t1=round(tcapC + 3.6, 2), kind='stamp', text='THE DRAGON HAS FALLEN', k=ID)); S(tcapC + 1.6, 'stinger_win', 0.6)
pw += 15000; P(tcapC + 1, pw)
bigC = dict(t0=round(TS_C - 0.4, 2), t1=round(tcapC + 0.4, 2), k=cn, name='BEIJING', sub='CAPITAL HP', hp=hpb)
# Moscú: dos frentes y la barra final
setup_markers(ru, 2, names=['Petersburg', 'Novosibirsk'])
T0 = tcapC + 3.8; D = 20.0
er1 = near_cell(None, CAP[ru][:2], among=cells[K['BY']]); er2 = near_cell(None, cen[ru], among=cells[kz]); e_ru = near_cell(ru, proj(132.0, 43.2))
C(T0 - 0.3, cen[ru][0], cen[ru][1], 0.32, 1.2)
cards.append(dict(t0=round(T0 - 0.2, 2), t1=round(T0 + 2.2, 2), kind='bigtext', text='ONE LEFT.', sub='RUSSIA'))
info = invade(ru, T0, D, [er1, er2, e_ru], main_entries=[er1], n_main=7, tanks={0}, minsz=700, fill=0.55, smax=3.0, cam_on=False, s_siege=2.4, air=True)
tcap = info['tcap']; TS = tcap - 7.0; MOS = CAP[ru]
hpm = [[TS, 1.0], [TS + 1.0, 1.0], [TS + 1.15, 0.86], [TS + 2.2, 0.86], [TS + 2.35, 0.7], [TS + 3.4, 0.7], [TS + 3.55, 0.55], [TS + 4.2, 0.62], [TS + 5.0, 0.62], [TS + 5.15, 0.4], [TS + 5.8, 0.4], [TS + 5.95, 0.2], [TS + 6.5, 0.2], [TS + 6.65, 0.06], [tcap, 0.0]]
CAPHP[-1] = [ru, round(MOS[0]), round(MOS[1]), round(TS, 2), round(tcap, 2), hpm]
bighp = [bigC, dict(t0=round(TS - 0.4, 2), t1=round(tcap + 0.4, 2), k=ru, name='MOSCOW', sub='CAPITAL HP', hp=hpm)]
for tt_ in [TS + 1.0, TS + 2.2, TS + 3.4, TS + 5.0, TS + 5.8, TS + 6.5]:
    bx, by = MOS[0] + rng.uniform(-22, 22), MOS[1] + rng.uniform(-16, 16)
    FX.append([round(tt_ + 0.1, 2), round(bx), round(by), 46, 1]); SV(tt_ + 0.1, 'boom', 0.55); shakes.append([round(tt_ + 0.1, 2), 8])
autocam(T0 + 2.2, TS - 0.6, info['ids'], ru, minsz=700, smax=3.0, fill=0.55)
C(TS - 0.5, (MOS[0] + info['stops'][0][0]) / 2, (MOS[1] + info['stops'][0][1]) / 2, 2.2, 1.2); C(TS + 2.0, MOS[0] + 10, MOS[1] + 6, 2.7, 4.5)
chip(TS + 3.6, 'RUSSIA HOLDS ON!', ru, 1.8); bubble(TS + 3.8, ru, 'Not Moscow!')
chip(TS + 5.9, 'MOSCOW IS FALLING', ru, 1.8)
S(TS + 5.2, 'heartbeat', 0.8); S(tcap - 1.6, 'riser_2s', 0.7)
B = battle_card(ru, 'RUSSIA', T0, tcap + 1.6, pw, 18000, info['tb'], tcap, pw + 12000)
fill_inv(B, info['fl'])
chip(tcap + 0.2, 'MOSCOW HAS FALLEN', ru, 2.4)
C(tcap + 0.5, cen[ru][0], cen[ru][1], 0.4, 1.3)
pw += 12000; P(tcap + 1, pw)
RUKO = tcap; CNKO = tcapC; B0 = NTC
WIN_T = tcap + 2.0
grade.append([WIN_T, 'gold'])
C(WIN_T - 0.3, 3840, 2260, 0.255, 2.0)
C(WIN_T + 1.8, 3300, 2150, 0.3, 9.0)
END = WIN_T + 11.0
P(END, pw)
# ================= EXTRAS =================
SEAS = [('PACIFIC OCEAN', 160, 10), ('PACIFIC OCEAN', -140, 15), ('ATLANTIC OCEAN', -30, 10), ('ATLANTIC OCEAN', -40, 35), ('INDIAN OCEAN', 80, -15), ('GULF OF MEXICO', -90, 25), ('CARIBBEAN SEA', -75, 15),
        ('HUDSON BAY', -85, 59), ('MEDITERRANEAN SEA', 18, 35), ('NORTH SEA', 3, 56), ('BALTIC SEA', 19, 57), ('BLACK SEA', 34, 43.5), ('PERSIAN GULF', 51, 27), ('ARABIAN SEA', 64, 15), ('BAY OF BENGAL', 89, 14),
        ('SOUTH CHINA SEA', 114, 12), ('EAST CHINA SEA', 126, 29), ('SEA OF JAPAN', 135, 40), ('BERING SEA', -178, 58), ('LABRADOR SEA', -55, 58), ('NORWEGIAN SEA', 2, 68)]
seas = [[n, *proj(lo, la)] for n, lo, la in SEAS]
crater = []; smoke = []; flagsup = []; arty = []; jets_ = list(JETX)
for m in markers:
    if m[4] is None: continue
    crater.append([m[4], m[2], m[3], 1 if m[0] == 'cap' else 0]); smoke.append([m[4], round(m[4] + 7, 2), m[2], m[3]])
crater += CRAT; smoke += SMK
for st_ in stamps:
    if st_[2] == 'big':
        c_ = CAP[st_[1]]
        flagsup.append([st_[0] + 0.2, round(c_[0]), round(c_[1])]); S(st_[0] - 0.15, 'sub_drop', 0.9); S(st_[0] - 1.6, 'riser_2s', 0.25)
for i_, q_ in enumerate(SQ):
    if 'tx' not in q_ or q_['a'] != ID: continue
    tdead = None
    for m in markers:
        if m[4] is not None and m[0] == 'base' and abs(m[2] - q_['tx']) < 2 and abs(m[3] - q_['ty']) < 2: tdead = m[4]
    if tdead is None or (round(q_['tx']), round(q_['ty'])) in STRUCK: continue
    for j_, dt in enumerate([1.9, 1.4, 0.9]):
        hx, hy = head(i_, tdead - dt - 0.6)
        arty.append([round(tdead - dt - 0.6, 2), round(hx), round(hy), round(q_['tx'] + rng.uniform(-12, 12)), round(q_['ty'] + rng.uniform(-12, 12))])
        if j_ == 0: S(tdead - dt - 0.6, rng.choice(['whistle', 'whistle_2', 'whistle_3']), 0.3, 0)
_fl = []
for f_ in sorted(flashes):
    if not _fl or f_ - _fl[-1] > 0.9: _fl.append(f_)
flashes[:] = _fl
ext = dict(seas=seas, crater=crater, smoke=smoke, flags=flagsup, arty=arty, jets=jets_, bombs=BOMBS, caphp=CAPHP, missiles=MISS, para=PARA, flak=FLAK)
ext['letterbox'] = [[round(FIRST[0] - 0.3, 2), round(FIRST[1], 2)], [round(L0 - 0.5, 2), round(B0 + 3.6, 2)], [round(FW - 0.2, 2), round(FW + 6.5, 2)], [round(CNKO - 3, 2), round(CNKO + 1.5, 2)], [round(TS + 4.8, 2), round(RUKO + 2.0, 2)]]
ext['desat'] = [[round(L0 - 3, 2), round(L0 + 3.6, 2), 0.7]]
ext['tilt'] = [[round(L0 - 2.5, 2), round(L0 + 3.6, 2), -1.6]]
ext['slowmo'] = [round(L0, 2), round(L0 + 0.01, 2)]
for c_ in chips: S(c_[0], 'beep_lo', 0.18)
for st_ in stamps:
    if st_[2] == 'big' and st_[1] in (K['FR'], K['DE'], K['CN'], K['RU'], K['BR'], K['IN'], K['GB']): S(st_[0] + 0.3, 'crowd_cheer', 0.25)
# ---------------- días ----------------
day = 1.0; t = WAR; dk = [[round(WAR, 2), 1]]
def rate(t):
    for b in battles:
        if b['t0'] <= t <= b['t1']: return 0.55
    return 2.2
while t < WIN_T:
    day += rate(t) * 0.5; t += 0.5; dk.append([round(t, 2), int(day)])
# ---------------- música ----------------
CHT = {c[1]: c[0] for c in chapters}
def M(t0, t1, tr, off=0.0, g=1.0, fi=0.6, fo=1.2): music.append(dict(t0=round(t0, 2), t1=round(t1, 2), track=tr, offset=off, gain=g, fade_in=fi, fade_out=fo))
BT = {b['title']: b for b in battles}
M(0, 9, 'frantic', 40, 0.95, 0.02, 0.3); M(9, 16.6, 'scifi', 45, 0.85, 0.2, 0.3); M(16.6, DECL_T - 0.1, 'tension', 34.3, 0.8, 0.2, 0.3)
M(DECL_T, BT['CANADA']['t1'], 'epic', 0, 1.05, 0.02, 1.0); M(BT['CANADA']['t1'], CHT['LATIN AMERICA UNITES'], 'drive', 34.28, 1.0, 0.8, 1.0)
M(CHT['LATIN AMERICA UNITES'], BT['LATAM ALLIANCE']['t0'] + 6, 'tension', 34.3, 1.0, 0.6, 0.8); M(BT['LATAM ALLIANCE']['t0'] + 6, CHT['EUROPE UNITES'], 'heroic', 40, 1.0, 0.6, 1.0)
M(CHT['EUROPE UNITES'], BT['EUROPEAN UNION']['t0'] + 8.6, 'saga', 24, 0.95, 0.8, 0.6); M(BT['EUROPEAN UNION']['t0'] + 8.6, CHT['THE WORLD FALLS'], 'march', 0, 1.0, 0.2, 1.0)
M(CHT['THE WORLD FALLS'], CHT['THE LAST ALLIANCE'], 'voyage', 60, 0.95, 0.8, 1.0)
M(CHT['THE LAST ALLIANCE'], L0 - 0.1, 'horror', 0, 0.95, 0.6, 0.4); M(NTC + 3.4, CHT['THE BETRAYAL'], 'epic', 66.667, 1.08, 0.02, 1.0)
M(CHT['THE BETRAYAL'], CHT['THE FINAL WAR'], 'tension', 51.4, 1.0, 0.6, 0.6); M(CHT['THE FINAL WAR'], TS - 0.5, 'frantic', 30, 1.0, 0.3, 0.8); M(TS - 0.5, WIN_T, 'heroic', 70, 1.05, 0.4, 0.5); M(WIN_T, END, 'triumph', 40, 1.0, 0.1, 2.0)
for c in chapters: SV(c[0], 'whoosh', 0.55)
for b in battles: S(b['t0'], 'whip', 0.75)
for s_ in subs: S(s_ + 1.45, 'mouse-click', 0.9); S(s_ + 1.5, 'ding', 0.5); S(s_ + 2.75, 'mouse-click', 0.9)
S(WIN_T, 'stinger_win', 1.0); S(WIN_T + 0.2, 'crowd_cheer', 0.7)
for tt in (0.0, 3.0, 6.0): SV(tt, 'hit', 0.9); SV(tt, 'whoosh', 0.6)
S(7.2, 'riser_2s', 0.6); SV(9.0, 'boom', 0.9); S(GLOBE[1] - 1.4, 'riser_2s', 0.5); SV(GLOBE[1], 'whoosh', 0.8)
for b in bubbles: S(b[0], 'beep_hi', 0.25)
for f_ in feed: S(f_[0] + 0.05, 'tick', 0.22)
cold = [[0.0, 3.0, COLD[0][1], None], [3.0, 6.0, COLD[1][1], None], [6.0, 9.0, COLD[2][1], None]]
tmap = [[0, WAR + 0.5, 0.0], [3.0, WAR + 1, 0.0], [6.0, WIN_T - 8, 1.0], [9.0, 9.0, 1.0]]
cam = [[0, IDC[0], IDC[1], 0.55, 0.01], [0.02, IDC[0], IDC[1], 0.75, 3.0], [3.0, 3840, 2100, 0.26, 0.01], [3.02, 3840, 2100, 0.31, 3.0], [6.0, cen[cn][0], cen[cn][1], 0.45, 0.01], [6.02, cen[cn][0], cen[cn][1], 0.6, 3.0]] + cam
flashes += [3.0, 6.0, 9.0]
cev.sort(key=lambda e: e[0]); indo.sort()
COLS = {K['US']: '#2a4fb8', K['CN']: '#ffcc1a', K['RU']: '#e8402a', K['IN']: '#ff9933', K['MX']: '#00843d', K['CA']: '#d52b1e', K['BR']: '#1f9a3a', K['GB']: '#c8102e', K['FR']: '#ffffff', K['DE']: '#ffce00', K['TR']: '#ffffff', K['IR']: '#239f40'}
for d_ in DF:
    if len(d_) == 6: d_.append(None)
    if d_[0] in COLS and d_[6] is None: d_[6] = COLS[d_[0]]
for q_ in SQ:
    if q_['a'] in COLS: q_['col'] = COLS[q_['a']]
for o_ in occ:
    if len(o_) == 5: o_.append(None)
    if o_[1] in COLS and o_[5] is None: o_[5] = COLS[o_[1]]
war = dict(occ=occ, sq=SQ, df=DF, fx=sorted(FX), cities=CIT, ext=ext, empire=ID)
laser = []
out = dict(ver='d', dur=round(END, 2), war_t=round(WAR, 2), globe=dict(t0=GLOBE[0], t1=GLOBE[1], lon0=60, lon1=-98.0, lat0=20, lat1=38), cold=cold, tmap=tmap, cam=cam, cev=cev, markers=markers,
           chapters=chapters, chips=sorted(chips), cards=cards, battles=battles, grade=sorted(grade), shakes=shakes, flashes=sorted(flashes), arrows=arrows, roulettes=roul, army=ARMY,
           indo=indo, feed=sorted(feed), subs=subs, reveal=reveal, laser=laser, winT=round(WIN_T, 2), music=music, sfx=sorted(sfx), id=ID, total=NK - 1,
           war=war, qcards=qcards, stamps=sorted(stamps), bubbles=bubbles, streak=streak, days=dk, letterbox=ext['letterbox'], desat=ext['desat'], tilt=ext['tilt'], slowmo=ext['slowmo'],
           ranks=[], spot=SPOT, bighp=bighp, hero='USA', heroLong='THE USA', heroAdj='AMERICAN', weapon='OPERATION BLACKOUT', title2=['CAN THE USA', 'CONQUER THE WORLD?'], empFlag=True, net=net, globes=GLOBES, summits=SUMMITS, targets=TARGETS, glitch=GLITCH, split=SPLIT, cam2=CAM2)
json.dump(out, open('src/hw/usa.json', 'w'), separators=(',', ':'))
print('dur', round(END, 1), 'squads', len(SQ), 'chapters', [(round(c[0]), c[1]) for c in chapters], 'WIN', round(WIN_T, 1))
print('battles', [(b['title'], round(b['t0']), round(b['t1'])) for b in battles])
print('not conquered', [codes[k] for k in range(NK) if k not in owned and k != ID])
