"""librería común de invasiones (multi-atacante)"""
import sys, json, math, random
import numpy as np
from warlib import *

VER = 'u'
V2 = True
BOMBS = []; CAPHP = []; JETX = []
rng = random.Random(int(__import__('os').environ.get('SEED', '21')))
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

def flip(k, t, origin, dur=1.0, show=True, new=None):
    new = ID if new is None else new
    for e_ in EMP.values(): e_.discard(k)
    EMP.setdefault(new, {new}).add(k)
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
EMP = {}
def use(A):
    """cambia el atacante activo: ID y su conjunto de territorios"""
    global ID, owned
    ID = A
    if A not in EMP: EMP[A] = {A}
    owned = EMP[A]
def transfer(k, A, t):
    """k pasa a A en los conjuntos (cuando k ya era de otro imperio)"""
    for e in EMP.values(): e.discard(k)
    EMP.setdefault(A, {A}).add(k)

LB = []; DESAT = []; TILT = []
SEAS = [('PACIFIC OCEAN', 160, 10), ('PACIFIC OCEAN', -140, 15), ('PACIFIC OCEAN', -95, -10), ('ATLANTIC OCEAN', -30, 10), ('ATLANTIC OCEAN', -40, 35), ('ATLANTIC OCEAN', -30, -25), ('INDIAN OCEAN', 80, -15), ('GULF OF MEXICO', -90, 25), ('CARIBBEAN SEA', -75, 15),
        ('MEDITERRANEAN SEA', 18, 35), ('BLACK SEA', 34, 43.5), ('PERSIAN GULF', 51, 27), ('GULF OF OMAN', 58.6, 24.4), ('ARABIAN SEA', 64, 15), ('RED SEA', 38, 20), ('CASPIAN SEA', 50.5, 41), ('BAY OF BENGAL', 89, 14)]
def export(path, dur, war_t, win_t, **fields):
    seas = [[n, *proj(lo, la)] for n, lo, la in SEAS]
    crater = []; smoke = []; flagsup = []; arty = []
    for m in markers:
        if m[4] is None: continue
        crater.append([m[4], m[2], m[3], 1 if m[0] == 'cap' else 0]); smoke.append([m[4], round(m[4] + 7, 2), m[2], m[3]])
    crater += CRAT; smoke += SMK
    for st_ in stamps:
        if st_[2] == 'big':
            c_ = CAP[st_[1]]
            flagsup.append([st_[0] + 0.2, round(c_[0]), round(c_[1])] + ([st_[3]] if len(st_) > 3 else [])); S(st_[0] - 0.15, 'sub_drop', 0.9); S(st_[0] - 1.6, 'riser_2s', 0.25)
    for i_, q_ in enumerate(SQ):
        if 'tx' not in q_: continue
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
    ext = dict(seas=seas, crater=crater, smoke=smoke, flags=flagsup, arty=arty, jets=list(JETX), bombs=BOMBS, caphp=CAPHP, missiles=MISS, para=PARA, flak=FLAK, letterbox=LB, desat=DESAT, tilt=TILT, slowmo=[0, 0])
    for c_ in chips: S(c_[0], 'beep_lo', 0.18)
    for c in chapters: SV(c[0], 'whoosh', 0.55)
    for b in battles: S(b['t0'], 'whip', 0.75)
    for b in bubbles: S(b[0], 'beep_hi', 0.25)
    for d_ in DF:
        if len(d_) == 6: d_.append(None)
    for o_ in occ:
        if len(o_) == 5: o_.append(None)
    cev.sort(key=lambda e: e[0]); indo.sort()
    day = 1.0; t = war_t; dk = [[round(war_t, 2), 1]]
    def rate(t):
        for b in battles:
            if b['t0'] <= t <= b['t1']: return 0.55
        return 2.2
    while t < win_t: day += rate(t) * 0.5; t += 0.5; dk.append([round(t, 2), int(day)])
    war = dict(occ=occ, sq=SQ, df=DF, fx=sorted(FX), cities=CIT, ext=ext, empire=ID)
    out = dict(ver='d', dur=round(dur, 2), war_t=round(war_t, 2), cev=cev, markers=markers, chapters=chapters, chips=sorted(chips), cards=cards, battles=battles, grade=sorted(grade), shakes=shakes,
               flashes=sorted(flashes), arrows=arrows, roulettes=[], army=[], indo=indo, feed=sorted(feed), subs=subs, reveal=None, laser=[], winT=round(win_t, 2), music=music, sfx=sorted(sfx), id=ID, total=NK - 1,
               war=war, qcards=qcards, stamps=sorted(stamps), bubbles=bubbles, streak=streak, days=dk, letterbox=LB, desat=DESAT, tilt=TILT, slowmo=[0, 0.001], ranks=[], spot=SPOT, bighp=None,
               net=None, globes=GLOBES, summits=SUMMITS, targets=TARGETS, glitch=GLITCH, split=SPLIT, cam2=CAM2, cold=[], tmap=[[0, 0, 1]], cam=cam)
    out.update(fields)
    json.dump(out, open(path, 'w'), separators=(',', ':'))
    return out
def M(t0, t1, tr, off=0.0, g=1.0, fi=0.6, fo=1.2): music.append(dict(t0=round(t0, 2), t1=round(t1, 2), track=tr, offset=off, gain=g, fade_in=fi, fade_out=fo))
