"""20 Latin American Countries Battle Royale -> src/hw/latam.json"""
import wlib2 as W
from wlib2 import *

PARTS = 'MX GT HN SV NI CR PA CU DO HT CO VE EC PE BO BR PY UY AR CL'.split()
PK = [K[c] for c in PARTS]
POWER = dict(BR=2700, MX=1500, CO=800, VE=1300, AR=900, CL=900, PE=800, CU=600, EC=420, BO=300, DO=320, GT=280, HN=200, SV=180, NI=190, PY=210, UY=230, PA=150, HT=60, CR=40)
PWR = {K[c]: POWER[c] for c in PARTS}; PWR0 = dict(PWR)
NM = lambda k: NAMES[k].upper().replace('DOMINICAN REPUBLIC', 'DOMINICAN REP.')
for k in PK: W.EMP[k] = {k}
BOARD = []; ELIM = []; ALIVE = [[0, 20]]; TIER = []; RAINS = []
def owner_of(k):
    for a, e in W.EMP.items():
        if k in e: return a
    return k
def absorb(A, B, t0, per=0.35):
    """el imperio B (ya sin capital) se entrega a A"""
    ks = sorted([c for c in W.EMP.get(B, set()) if c != B], key=lambda c: (cen[c][0] - cen[A][0]) ** 2 + (cen[c][1] - cen[A][1]) ** 2)
    for i, c in enumerate(ks):
        t = t0 + per * i
        flip(c, t, near_cell(c, CAP[c][:2]), 0.7, show=False, new=A); stamps.append([round(t + 0.1, 2), c, 'small']); SV(t, 'stamp', 0.4)
    PWR[A] += PWR.get(B, 0) // 2
    return t0 + per * len(ks)
def elim(t, k, A, big=False):
    n = ALIVE[-1][1] - 1; ALIVE.append([round(t, 2), n])
    ELIM.append([round(t, 2), k, A, n, 1 if big else 0])
    S(t, 'glitch', 0.5); S(t + 0.05, 'stamp_3', 0.8)
def fight(A, k, T0, D, *, title=None, entries=None, chip_fall=True, card=True, bub=None, **kw):
    W.use(A); D = D * 1.08
    if entries is None: entries = [entry_for(k, prefer=CAP[k][:2])]
    pb0 = PWR.get(owner_of(k), 200)
    info = invade(k, T0, D, entries, **kw)
    home = owner_of(k) == k and k in PK
    if card:
        B = battle_card(k, title or NM(k), T0, info['tcap'] + 1.6, PWR[A], pb0, info['tb'], info['tcap'], PWR[A] + PWR.get(k, 100) // 2)
        B['a'] = A; B['an'] = NM(A); fill_inv(B, info['fl'])
    if chip_fall: chip(info['tcap'] + 0.2, f"{CAP[k][2].upper().split(',')[0]} HAS FALLEN", k, 2.0)
    if bub: bubble(T0 + 3.2, k, bub)
    PWR[A] += PWR.get(k, 100) // 2
    return info
def vs_t(info): return info['tcap']

# ===================== INTRO NUEVA (0 -> 23.5 s) =====================
W.use(K['BR'])
LAT_BB = (proj(-118, 33)[0], proj(-118, 33)[1], proj(-34, -56)[0], proj(-34, -56)[1])
C(0, 3840, 2050, 0.27, 0.01)
INTRO = dict(t0=0, grid=[0.15, 2.6], xs=[2.7, 5.0], map=[5.0, 8.6], tier=[8.6, 19.6], count=[19.8, 23.4], parts=PK,
             tiers=[['S', [K['BR'], K['MX']]], ['A', [K['AR'], K['CO'], K['CL'], K['VE']]], ['B', [K['PE'], K['CU'], K['EC'], K['BO']]], ['C', [K['GT'], K['DO'], K['PY'], K['UY']]], ['D', [K['HN'], K['SV'], K['NI'], K['CR'], K['PA'], K['HT']]]])
for i in range(20): S(0.15 + i * 0.115, 'impact_hit' if i % 5 == 4 else 'tick', 0.45 if i % 5 == 4 else 0.35)
for i in range(19): S(2.75 + i * 0.11, 'gun_' + str(1 + i % 14), 0.25)
S(2.6, 'sub_drop', 0.9); SV(2.6, 'boom', 0.9); shakes.append([2.6, 16]); flashes.append(2.6)
S(4.9, 'riser_2s', 0.6); SV(5.0, 'whoosh', 0.8); flashes.append(5.0)
x0, y0, x1, y1 = LAT_BB
CB(5.0, (x0 - 60, y0 + 60, x1 - 40, y1 - 40), d=2.6, fill=1.0, smax=1.2)
for i, (tn, ks) in enumerate(INTRO['tiers']):
    tt = 8.8 + i * 2.1
    S(tt, 'whip', 0.6)
    for j in range(len(ks)): S(tt + 0.35 + j * 0.22, 'stamp_' + str(1 + j % 3), 0.5)
for i, tt in enumerate([19.9, 21.0, 22.1]): S(tt, 'beep_hi', 0.8); SV(tt, 'hit', 0.6)
S(23.1, 'siren', 0.5); SV(23.2, 'boom', 1.0); S(23.25, 'impact_hit', 0.9); shakes.append([23.2, 22]); flashes.append(23.2)
WAR = 23.5
T = WAR

# ===================== RONDA 1: PRIMERA SANGRE =====================
chapters.append([T, 'FIRST BLOOD']); grade.append([T, 'day'])
do, ht = K['DO'], K['HT']
qcard(T + 0.2, 'THE FIRST WAR STARTS ON ONE ISLAND')
C(T, CAP[ht][0] + 40, CAP[ht][1], 3.2, 0.9)
i1 = fight(do, ht, T + 0.4, 10.0, n_main=6, minsz=120, smax=5.0, bub='Not again!!')
chip(T + 1.0, 'DOMINICAN REP. ATTACKS HAITI', do, 2.2)
elim(i1['tcap'] + 0.4, ht, do)
T = i1['tcap'] + 2.0
# Centroamérica: Guatemala -> El Salvador
gt, sv = K['GT'], K['SV']
i2 = fight(gt, sv, T, 7.0, n_main=5, minsz=140, smax=5.0, bub='Tiny but mad!')
elim(i2['tcap'] + 0.4, sv, gt)
T = i2['tcap'] + 1.8
# Nicaragua -> Costa Rica (sin ejército)
ni, cr = K['NI'], K['CR']
C(T - 0.2, CAP[cr][0], CAP[cr][1] - 40, 3.0, 0.8)
qcard(T + 0.4, 'FUN FACT: COSTA RICA HAS NO ARMY')
i3 = fight(ni, cr, T + 0.3, 6.0, n_main=5, minsz=140, smax=5.0, siege=False, bub='We have no army!!')
elim(i3['tcap'] + 0.4, cr, ni)
T = i3['tcap'] + 1.8
# Venezuela ataca a Colombia... y Colombia gana
ve, co = K['VE'], K['CO']
gy = K['GY']
W.use(ve)
C(T - 0.2, cen[gy][0] - 20, cen[gy][1], 2.6, 0.8)
qcard(T + 0.2, 'VENEZUELA HAS WANTED THIS FOR YEARS...')
iG = invade(gy, T + 0.5, 8.0, [near_cell(None, cen[gy], among=cells[ve])], n_main=5, minsz=200, smax=4.4, nb=0)
chip(T + 1.4, 'VENEZUELA TAKES ESSEQUIBO', ve, 2.2); bubble(T + 3.5, gy, 'This is OUR land!')
PWR[ve] += 100
T = iG['tcap'] + 1.8
W.use(ve)
CB(T - 0.3, (BBOX[co][0] - 40, BBOX[ve][1] - 40, BBOX[ve][2] + 40, BBOX[co][3] - 150), d=1.0, fill=0.8)
chip(T + 0.2, 'VENEZUELA INVADES COLOMBIA!', ve, 2.4); bubble(T + 1.6, ve, 'Colombia is MINE!')
pV = enemy_push(ve, [co], [(near_cell(ve, CAP[co][:2]), (CAP[co][0] + 40, CAP[co][1] - 10)), (near_cell(ve, (cen[co][0] + 60, cen[co][1] + 40)), (cen[co][0] + 30, cen[co][1] + 60))], T, T + 6.0, T + 9.5, tank_idx=(0,))
qcard(T + 3.0, 'VENEZUELA IS ALMOST IN BOGOTÁ'); grade.append([T + 3, 'red'])
BED(T + 0.5, T + 9.5, 1.1)
W.use(co)
tp = near_cell(ve, CAP[ve][:2]); target(T + 6.6, tp[0], tp[1], 'COUNTERATTACK')
wipe_out(pV, T + 7.4); chip(T + 7.6, 'COLOMBIA STRIKES BACK!', co, 2.2); grade.append([T + 7.6, 'day'])
T0 = T + 9.6
i4 = fight(co, ve, T0, 15.0, entries=[near_cell(None, cen[ve], among=cells[co]), near_cell(None, CAP[ve][:2], among=cells[co])], n_main=6, tanks=True, minsz=360, smax=3.4, air=True, bub='How?!')
B = battles[-1]; B['t0'] = round(T - 0.3, 2)
elim(i4['tcap'] + 0.4, ve, co, big=True)
absorb(co, ve, i4['tcap'] + 0.9)
qcard(i4['tcap'] + 2.6, 'THE UNDERDOG WINS ROUND 1')
T = i4['tcap'] + 4.6

# ===================== RONDA 2: EL SUR =====================
chapters.append([T, 'THE SOUTH']); grade.append([T, 'dusk'])
cl, bo, ar, uy, py, pe, ec, br = K['CL'], K['BO'], K['AR'], K['UY'], K['PY'], K['PE'], K['EC'], K['BR']
T = globe_zoom(T + 0.1, -75, 5, -63, -25, 2.6, hl=[cl, bo, ar, uy, py, pe, ec])
W.use(bo)
C(T - 0.2, (CAP[bo][0] + CAP[py][0]) / 2, (CAP[bo][1] + CAP[py][1]) / 2 + 20, 1.7, 0.8)
qcard(T + 0.2, 'THE CHACO WAR... ROUND TWO')
pQ = enemy_push(bo, [py], [(near_cell(bo, cen[py]), (cen[py][0] - 20, cen[py][1] - 30))], T + 0.5, T + 5.0, T + 8.0)
bubble(T + 1.8, py, 'Again?! Seriously?!'); chip(T + 0.8, 'BOLIVIA INVADES PARAGUAY', bo, 2.2)
W.use(py); hx, hy = head(pQ[0], T + 5.4); target(T + 4.8, hx, hy, 'TARGET'); wipe_out(pQ, T + 5.8); chip(T + 6.0, 'PARAGUAY HOLDS THE CHACO', py, 2.0)
BED(T + 0.6, T + 8, 0.9)
T += 9.0
i5 = fight(cl, bo, T, 12.0, entries=[near_cell(None, CAP[bo][:2], among=cells[cl]), near_cell(None, cen[bo], among=cells[cl])], n_main=6, minsz=300, smax=3.6, tanks=True, bub='Give back our sea!')
qcard(T + 5.5, 'BOLIVIA WANTED ITS SEA BACK...')
elim(i5['tcap'] + 0.4, bo, cl)
T = i5['tcap'] + 1.8
W.use(ar)
C(T - 0.2, (CAP[uy][0] + CAP[py][0]) / 2, (CAP[uy][1] + CAP[py][1]) / 2, 1.5, 0.8)
chip(T + 0.2, 'ARGENTINA MOVES NORTH', ar, 2.2)
t = quick(['UY'], T + 0.6, per=0.5, dur=1.4, framefill=0.5)
elim(t - 0.2, uy, ar)
i6 = fight(ar, py, t + 0.4, 9.0, n_main=5, minsz=260, smax=4.0, air=True, bub='¡Che, no!')
elim(i6['tcap'] + 0.4, py, ar)
T = i6['tcap'] + 1.8
i7 = fight(pe, ec, T, 10.0, entries=[near_cell(None, CAP[ec][:2], among=cells[pe]), near_cell(None, cen[ec], among=cells[pe])], n_main=6, minsz=260, smax=4.0, bub='The ceviche is OURS!')
chip(T + 0.8, 'PERU VS ECUADOR: AN OLD RIVALRY', pe, 2.4)
elim(i7['tcap'] + 0.4, ec, pe)
T = i7['tcap'] + 1.8
# Brasil despierta
W.use(br)
C(T, cen[br][0], cen[br][1] - 40, 0.62, 1.2)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 2.8, 2), kind='bigtext', text='THE GIANT WAKES UP', sub='BRAZIL HAS NOT FOUGHT... YET'))
S(T + 0.2, 'heartbeat', 0.7); SV(T + 2.6, 'boom', 0.9)
bg('SR', T + 2.8, T + 3.4, 0.6); chip(T + 3.0, 'BRAZIL SWALLOWS SURINAME', br, 2.4)
PWR[br] += 200
T = T + 5.4

# ===================== RONDA 3: EL NORTE =====================
BOARD.append([round(T, 2), round(T + 4.4, 2)]); S(T, 'whoosh_2', 0.6); S(T + 0.4, 'ding', 0.4); T += 4.6
chapters.append([T, 'THE NORTH']); grade.append([T, 'day'])
mx, hn, cu, pa = K['MX'], K['HN'], K['CU'], K['PA']
T = globe_zoom(T + 0.1, -60, -10, -90, 18, 2.6, hl=[mx, gt, hn, ni, cu, do, pa])
W.use(mx); bg('BZ', T - 0.4, T - 0.2, 0.5)
i8 = fight(mx, gt, T, 13.0, entries=[near_cell(None, CAP[gt][:2], among=cells[mx]), near_cell(None, cen[gt], among=cells[mx])], n_main=6, tanks=True, minsz=220, smax=4.2, air=True, title='GUATEMALA', bub='Mexico?! Already?!')
chip(T + 0.6, 'MEXICO ENTERS THE WAR', mx, 2.2)
elim(i8['tcap'] + 0.4, gt, mx, big=True)
t = absorb(mx, gt, i8['tcap'] + 0.8)
T = max(t, i8['tcap'] + 1.8)
i9 = fight(ni, hn, T, 9.0, entries=[near_cell(None, CAP[hn][:2], among=cells[ni])], n_main=5, minsz=200, smax=4.4, bub='Not my bananas!')
elim(i9['tcap'] + 0.4, hn, ni)
T = i9['tcap'] + 1.8
# Cuba desembarca en La Española
W.use(cu)
lD = near_cell(do, proj(-70.0, 18.45)); src = proj(-72.5, 20.6)
C(T - 0.2, (lD[0] + src[0]) / 2, (lD[1] + src[1]) / 2, 2.2, 0.9)
chip(T + 0.2, 'CUBA INVADES BY SEA', cu, 2.2)
landing(src, lD, T + 2.0, dur=2.0)
i10 = fight(cu, do, T + 2.0, 10.0, entries=[lD], n_main=6, minsz=180, smax=4.4, nb=1, bub='From the SEA?!')
elim(i10['tcap'] + 0.4, do, cu)
t = absorb(cu, do, i10['tcap'] + 0.8)
T = max(t, i10['tcap'] + 1.8)
i11 = fight(co, pa, T, 8.0, entries=[near_cell(None, CAP[pa][:2], among=cells[co])], n_main=5, minsz=200, smax=4.4, bub='My canal!!')
chip(T + 0.5, 'COLOMBIA WANTS THE CANAL', co, 2.2)
elim(i11['tcap'] + 0.4, pa, co)
T = i11['tcap'] + 2.0
cards.append(dict(t0=round(T, 2), t1=round(T + 2.6, 2), kind='bigtext', text='8 COUNTRIES LEFT', sub='THE REAL WAR STARTS NOW'))
S(T, 'sub_drop', 0.9); subs.append(round(T + 2.7, 2))
T += 5.6
POLL = dict(t0=round(T, 2), t1=round(T + 4.6, 2), ks=[K['BR'], K['MX'], K['CO'], K['CU'], K['NI'], K['AR'], K['PE'], K['CL']], text='WHO WINS? COMMENT NOW 👇')
for j in range(8): S(T + 0.3 + j * 0.18, 'tick', 0.4)
S(T + 0.1, 'whoosh_3', 0.6)
T += 5.0

# ===================== RONDA 4: CHOQUE DE GIGANTES =====================
BOARD.append([round(T, 2), round(T + 4.4, 2)]); S(T, 'whoosh_2', 0.6); S(T + 0.4, 'ding', 0.4); T += 4.6
chapters.append([T, 'CLASH OF GIANTS']); grade.append([T, 'tense'])
C(T, (CAP[br][0] + CAP[ar][0]) / 2, (CAP[br][1] + CAP[ar][1]) / 2, 0.75, 1.0)
bubble(T + 0.8, ar, 'Brazil... we never liked you.', 2.0); bubble(T + 2.6, br, 'The feeling is mutual.', 2.0)
G0 = T + 4.2
W.use(ar)
pA = enemy_push(ar, [br], [(near_cell(ar, (cen[br][0] - 100, BBOX[br][3])), (cen[br][0] - 40, BBOX[br][3] - 260)), (near_cell(None, (cen[br][0], BBOX[br][3]), among=cells[uy]), (cen[br][0] + 120, BBOX[br][3] - 200))], G0, G0 + 5.5, G0 + 9.0, tank_idx=(1,))
CB(G0 - 0.2, (cen[br][0] - 500, BBOX[br][3] - 500, cen[br][0] + 500, CAP[ar][1] + 120), d=1.0, fill=0.8)
chip(G0 + 0.2, 'ARGENTINA ATTACKS FIRST!', ar, 2.2); qcard(G0 + 3.0, 'IS THIS THE END OF BRAZIL?'); grade.append([G0 + 3, 'red'])
BED(G0 + 0.5, G0 + 9, 1.2)
W.use(br)
for j in range(3):
    hx, hy = head(pA[j % 2], G0 + 6.0)
    bomb_run(br, G0 + 6.0 + j * 0.5, hx, hy, ang=rng.choice([15, 195]), n=3, nb=3, size=44)
wipe_out(pA, G0 + 7.2); chip(G0 + 6.4, 'THE BRAZILIAN AIR FORCE', br, 2.0); grade.append([G0 + 7.4, 'day'])
T0 = G0 + 9.2
TS = T0 + 19.0 - 6.0
i12 = fight(br, ar, T0, 19.0, entries=[near_cell(None, CAP[ar][:2], among=cells[uy]), near_cell(None, cen[ar], among=cells[py]), near_cell(None, cen[ar], among=cells[br])], n_main=7, tanks={0}, minsz=520, smax=3.2, fill=0.55, air=True, bub='No, no, NO!')
hpa = [[TS, 1.0], [TS + 1.0, 1.0], [TS + 1.15, 0.72], [TS + 2.4, 0.72], [TS + 2.55, 0.5], [TS + 3.8, 0.5], [TS + 3.95, 0.24], [TS + 5.0, 0.24], [TS + 5.15, 0.08], [i12['tcap'], 0.0]]
CAPHP[-1] = [ar, round(CAP[ar][0]), round(CAP[ar][1]), round(TS, 2), round(i12['tcap'], 2), hpa]
BIGHP = [dict(t0=round(TS - 0.4, 2), t1=round(i12['tcap'] + 0.4, 2), k=ar, name='BUENOS AIRES', sub='CAPITAL HP', hp=hpa)]
battles[-1]['t0'] = round(G0 - 0.4, 2); battles[-1]['title'] = 'ARGENTINA'
elim(i12['tcap'] + 0.4, ar, br, big=True)
t = absorb(br, ar, i12['tcap'] + 0.8)
T = max(t, i12['tcap'] + 2.0)
i13 = fight(mx, ni, T, 10.0, entries=[near_cell(None, CAP[ni][:2], among=cells[hn]), near_cell(None, cen[ni], among=cells[sv])], n_main=6, tanks=True, minsz=260, smax=4.0, air=True, bub='Help! Anyone?!')
elim(i13['tcap'] + 0.4, ni, mx)
t = absorb(mx, ni, i13['tcap'] + 0.8)
T = max(t, i13['tcap'] + 1.8)
W.use(cu)
cn_ = near_cell(mx, proj(-86.85, 21.16)); mr_ = near_cell(mx, proj(-89.6, 20.97))
C(T - 0.2, (CAP[cu][0] + cn_[0]) / 2, (CAP[cu][1] + cn_[1]) / 2, 2.0, 0.8)
cards.append(dict(t0=round(T, 2), t1=round(T + 2.2, 2), kind='bigtext', text='MISSILE CRISIS 2.0', sub='CUBA FIRES FIRST'))
S(T, 'siren', 0.5)
for j, p_ in enumerate([cn_, mr_, cn_]): target(T + 2.2 + j * 0.3, p_[0], p_[1], 'INCOMING'); missile(T + 2.5 + j * 0.35, CAP[cu][:2], p_, dur=1.8, big=(j == 0))
chip(T + 4.6, 'CANCÚN IS HIT', mx, 2.0); bubble(T + 5.2, mx, 'You hit CANCÚN?!', 1.8)
T += 7.4
W.use(mx)
lC = near_cell(cu, proj(-82.4, 23.1)); srcm = proj(-86.6, 21.2)
C(T - 0.2, (lC[0] + srcm[0]) / 2, (lC[1] + srcm[1]) / 2, 2.0, 0.9)
chip(T + 0.2, 'THE MEXICAN NAVY SAILS TO CUBA', mx, 2.2)
fleet(T + 0.2, [proj(-86, 22.5), proj(-85.5, 21.2)], [near_cell(cu, proj(-83.5, 22.6)), near_cell(cu, proj(-82.0, 23.0))], dur=2.2)
landing(srcm, lC, T + 2.2, dur=2.2)
i14 = fight(mx, cu, T + 2.2, 10.0, entries=[lC], n_main=6, minsz=260, smax=4.0, bub='¡Patria o muerte!')
elim(i14['tcap'] + 0.4, cu, mx)
t = absorb(mx, cu, i14['tcap'] + 0.8)
T = max(t, i14['tcap'] + 2.0)
C(T, 2900, 2700, 0.5, 1.4)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 2.8, 2), kind='bigtext', text='5 LEFT', sub='MEXICO · BRAZIL · COLOMBIA · PERU · CHILE'))
S(T + 0.2, 'sub_drop', 0.9)
T += 3.2

# ===================== RONDA 5: LA ALIANZA DE LOS ANDES =====================
BOARD.append([round(T, 2), round(T + 4.4, 2)]); S(T, 'whoosh_2', 0.6); S(T + 0.4, 'ding', 0.4); T += 4.6
chapters.append([T, 'OLD RIVALS']); grade.append([T, 'dusk'])
C(T, (CAP[pe][0] + CAP[cl][0]) / 2, (CAP[pe][1] + CAP[cl][1]) / 2 - 80, 0.95, 1.0)
qcard(T + 0.2, 'CHILE AND PERU HAVE FOUGHT BEFORE...')
W.use(cl)
pX = enemy_push(cl, [pe], [(near_cell(cl, CAP[pe][:2]), (CAP[pe][0] + 60, CAP[pe][1] + 120)), (near_cell(None, cen[pe], among=cells[bo]), (cen[pe][0] + 40, cen[pe][1] + 60))], T + 0.6, T + 6.0, T + 10.0, tank_idx=(0,))
chip(T + 0.8, 'CHILE INVADES SOUTHERN PERU', cl, 2.2); bubble(T + 2.6, pe, 'Not this time!')
W.use(pe)
for j in range(2):
    hx, hy = head(pX[j], T + 6.2); target(T + 5.6 + j * 0.4, hx, hy, 'TARGET'); missile(T + 6.0 + j * 0.4, CAP[pe][:2], (hx, hy), dur=1.4, g=0.4)
wipe_out(pX, T + 7.4); chip(T + 7.6, 'PERU PUSHES THEM BACK', pe, 2.0)
BED(T + 0.8, T + 10, 1.0)
C(T + 9.4, cen[br][0] - 300, cen[br][1], 0.7, 1.0)
cards.append(dict(t0=round(T + 10.0, 2), t1=round(T + 12.4, 2), kind='bigtext', text='BUT THEN...', sub='BRAZIL LOOKS AT THEM'))
S(T + 10.0, 'heartbeat', 0.8)
T += 12.8
chapters.append([T, 'THE ANDES ALLIANCE']); grade.append([T, 'tense'])
T = summit(T, [co, pe, cl], [(pe, 'Brazil took Argentina...'), (cl, 'We are next.'), (co, 'Then we fight TOGETHER.')], 'THE ANDES ALLIANCE')
G0 = T + 0.3
W.use(pe)
pP = enemy_push(pe, [br], [(near_cell(pe, (cen[br][0] - 400, cen[br][1])), (cen[br][0] - 250, cen[br][1] - 40))], G0, G0 + 6, G0 + 10.0)
W.use(co)
pC = enemy_push(co, [br], [(near_cell(co, cen[br]), (cen[br][0] - 120, cen[br][1] - 260))], G0 + 0.4, G0 + 6, G0 + 10.0, tank_idx=(0,))
W.use(cl)
pL = enemy_push(cl, [br], [(near_cell(None, cen[br], among=cells[bo]), (cen[br][0] - 200, cen[br][1] + 120))], G0 + 0.8, G0 + 6, G0 + 10.0)
CB(G0 - 0.2, (BBOX[pe][0] - 40, BBOX[co][1] - 40, cen[br][0] + 300, cen[br][1] + 400), d=1.2, fill=0.8)
chip(G0 + 0.3, 'THE ALLIANCE INVADES BRAZIL', co, 2.4); qcard(G0 + 3.5, '3 VS 1: CAN BRAZIL SURVIVE?'); grade.append([G0 + 3.5, 'red'])
BED(G0 + 0.5, G0 + 10, 1.2)
W.use(br)
G1 = G0 + 6.8
C(G1 - 0.2, cen[br][0] - 200, cen[br][1] - 40, 0.9, 0.8)
chip(G1, 'BRAZIL: 300 FIGHTER JETS', br, 2.2)
wipe_out(pP + pC + pL, G1 + 0.8)
for j, kk in enumerate([pe, cl]):
    tp_ = near_cell(kk, CAP[kk][:2]); target(G1 + 1.0 + j * 0.5, tp_[0], tp_[1], 'TARGET LOCKED'); missile(G1 + 1.8 + j * 0.5, CAP[br][:2], tp_, dur=2.2, big=True)
grade.append([G1 + 2.6, 'day'])
T0 = G1 + 4.4
i15 = fight(br, pe, T0, 13.0, entries=[near_cell(None, CAP[pe][:2], among=cells[br]), near_cell(None, cen[pe], among=cells[bo])], n_main=6, tanks={0}, minsz=380, smax=3.4, air=True, bub='Not Machu Picchu!')
para(br, T0 + 4.0, CAP[pe][0] + 40, CAP[pe][1] - 30, n=10); chip(T0 + 4.2, 'PARATROOPERS OVER LIMA', br, 2.0)
battles[-1]['t0'] = round(G0 - 0.4, 2); battles[-1]['title'] = 'ANDES ALLIANCE'
elim(i15['tcap'] + 0.4, pe, br)
t = absorb(br, pe, i15['tcap'] + 0.8)
T = max(t, i15['tcap'] + 1.6)
i16 = fight(br, cl, T, 11.0, entries=[near_cell(None, CAP[cl][:2], among=cells[ar]), near_cell(None, CAP[cl][:2], among=cells[bo] if bo in W.EMP[br] else cells[ar])], n_main=6, minsz=360, smax=3.4, air=True, bub='Over the Andes?!')
elim(i16['tcap'] + 0.4, cl, br)
t = absorb(br, cl, i16['tcap'] + 0.8)
T = max(t, i16['tcap'] + 2.0)
C(T, 2900, 2700, 0.5, 1.4)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 3.0, 2), kind='bigtext', text='FINAL 3', sub='BRAZIL · MEXICO · COLOMBIA'))
S(T + 0.2, 'sub_drop', 0.9); SV(T + 0.3, 'boom', 0.8)
T += 3.4

# ===================== RONDA 6: COLOMBIA, ENTRE DOS FUEGOS =====================
chapters.append([T, 'WAR AT SEA']); grade.append([T, 'dusk'])
W.use(mx)
cs_ = proj(-72, 15)
C(T, cs_[0], cs_[1], 1.5, 1.0)
chip(T + 0.3, 'MEXICO VS BRAZIL: BATTLE OF THE CARIBBEAN', mx, 2.6)
fleet(T + 0.6, [proj(-82, 17), proj(-80, 19), proj(-84, 14.5)], [proj(-66, 15.5), proj(-64, 13), proj(-67, 12.5)], dur=2.6)
W.use(br)
fleet(T + 1.2, [proj(-58, 12), proj(-57, 15), proj(-60, 10.5)], [proj(-75, 15.5), proj(-77, 13.5), proj(-73, 17)], dur=2.6)
for j in range(4):
    a_ = proj(-80 + j, 16 - j * 0.8); b_ = proj(-62 - j, 13 + j * 0.6)
    missile(T + 3.0 + j * 0.5, a_, b_, dur=1.6, g=0.35, big=(j == 3)); missile(T + 3.2 + j * 0.5, b_, a_, dur=1.6, g=0.35)
target(T + 4.6, proj(-61, 13)[0], proj(-61, 13)[1], 'BRAZILIAN CARRIER'); missile(T + 5.2, proj(-81, 16), proj(-61, 13), dur=1.8, big=True)
chip(T + 7.2, 'BRAZIL LOSES ITS CARRIER', br, 2.2); bubble(T + 8.0, mx, '¡Así se hace!')
BED(T + 1.0, T + 9.0, 1.0)
qcard(T + 9.4, 'NOW EVERYONE WANTS COLOMBIA')
T += 11.8
chapters.append([T, 'BETWEEN TWO FIRES']); grade.append([T, 'night'])
qcard(T + 0.2, 'BRAZIL FROM THE SOUTH. MEXICO FROM THE NORTH.')
G0 = T + 0.4
W.use(br)
pB = enemy_push(br, [co], [(near_cell(br, cen[co]), (CAP[co][0] + 30, CAP[co][1] + 30)), (near_cell(None, CAP[co][:2], among=cells[pe]), (CAP[co][0] - 20, CAP[co][1] + 60)), (near_cell(br, (cen[co][0] + 150, cen[co][1])), (cen[co][0] + 60, cen[co][1] - 40))], G0, G0 + 7.0, G0 + 14.0, tank_idx=(0, 2))
W.use(mx)
pM = enemy_push(mx, [pa, co], [(near_cell(None, CAP[pa][:2], among=cells[K['CR']]), (CAP[co][0] - 40, CAP[co][1] - 80))], G0 + 1.0, G0 + 7.0, G0 + 14.0, tank_idx=(0,))
CB(G0 - 0.2, (BBOX[pa][0] - 60, BBOX[co][1] - 80, BBOX[co][2] + 120, BBOX[co][3] + 40), d=1.2, fill=0.8)
chip(G0 + 0.3, 'COLOMBIA IS SURROUNDED', co, 2.4); bubble(G0 + 2.5, br, 'Give up, Colombia!'); bubble(G0 + 4.4, mx, '¡Ríndete, compa!')
for j in range(3):
    tp_ = (CAP[co][0] + rng.uniform(-20, 20), CAP[co][1] + rng.uniform(-20, 20)); target(G0 + 5 + j * 0.6, tp_[0], tp_[1], 'INCOMING'); missile(G0 + 5.5 + j * 0.6, CAP[mx][:2] if j % 2 else CAP[br][:2], tp_, dur=1.8, big=(j == 2))
TSB = G0 + 7.5
hpb = [[TSB, 1.0], [TSB + 0.8, 1.0], [TSB + 0.95, 0.7], [TSB + 2.0, 0.7], [TSB + 2.15, 0.42], [TSB + 3.4, 0.42], [TSB + 3.55, 0.18], [TSB + 4.8, 0.18], [TSB + 4.95, 0.07], [TSB + 9.0, 0.07], [TSB + 9.6, 0.4], [TSB + 12.0, 0.9]]
BIGHP.append(dict(t0=round(TSB - 0.4, 2), t1=round(TSB + 12.0, 2), k=co, name='BOGOTÁ', sub='CAPITAL HP', hp=hpb))
C(TSB - 0.3, CAP[co][0], CAP[co][1] + 10, 2.4, 1.0)
grade.append([TSB, 'red']); S(TSB + 4.8, 'heartbeat', 0.9); qcard(TSB + 5.0, 'COLOMBIA HAS 7% LEFT...')
BED(G0 + 0.5, G0 + 13.5, 1.4)
# el giro: la selva
RV = TSB + 6.4
REVEAL = dict(t0=round(RV, 2), t1=round(RV + 3.6, 2), name='THE JUNGLE TRAP', icon='palm-tree', items=['DRONES', 'SPIES', 'JUNGLE', 'NAVY', 'HACKERS', 'AMBUSH', 'RAIN', 'ANDES'])
S(RV, 'heartbeat', 0.7); S(RV + 1.6, 'riser_2s', 0.7); SV(RV + 3.4, 'boom', 1.0)
W.use(co)
LB.append([round(RV - 0.3, 2), round(RV + 4.0, 2)]); DESAT.append([round(RV - 0.3, 2), round(RV + 3.6, 2), 0.7]); TILT.append([round(RV, 2), round(RV + 3.6, 2), -1.6])
R0 = RV + 3.8
C(R0 - 0.3, cen[co][0] + 40, cen[co][1] + 20, 1.3, 0.6)
wipe_out(pB, R0 + 0.2, col=None); chip(R0 + 0.4, 'THE BRAZILIAN ARMY IS LOST IN THE JUNGLE', co, 2.4)
C(R0 + 2.6, CAP[pa][0], CAP[pa][1], 2.0, 0.6)
wipe_out(pM, R0 + 2.9); chip(R0 + 3.0, 'MEXICO AMBUSHED IN PANAMA', co, 2.2)
grade.append([R0 + 3.4, 'gold']); bubble(R0 + 4.6, br, 'WHERE ARE MY SOLDIERS?!')
T = R0 + 6.0

# ===================== RONDA 7: LA CAÍDA DEL GIGANTE =====================
chapters.append([T, 'THE GIANT FALLS']); grade.append([T, 'day'])
C(T, cen[br][0], cen[br][1], 0.6, 1.0)
cards.append(dict(t0=round(T + 0.1, 2), t1=round(T + 2.4, 2), kind='bigtext', text='COLOMBIA STRIKES BACK', sub='TARGET: BRASÍLIA'))
T0 = T + 2.6; D = 21.0
setup_markers(br, 3, names=['Manaus', 'Rio', 'Salvador'])
lb_ = near_cell(br, proj(-38.5, -3.7)); landing(proj(-30, 6), lb_, T0 + 2.0, dur=2.0)
i17 = fight(co, br, T0, D, entries=[near_cell(None, cen[br], among=cells[co]), near_cell(None, cen[br], among=cells[pe]), lb_], main_entries=[near_cell(None, cen[br], among=cells[co]), lb_], n_main=7, tanks={0}, minsz=650, smax=3.0, fill=0.55, cam_on=True, air=True, bub='IMPOSSIBLE!')
TS2 = i17['tcap'] - 7.0
hpz = [[TS2, 1.0], [TS2 + 1.0, 1.0], [TS2 + 1.15, 0.8], [TS2 + 2.3, 0.8], [TS2 + 2.45, 0.56], [TS2 + 3.6, 0.56], [TS2 + 3.75, 0.32], [TS2 + 5.0, 0.32], [TS2 + 5.15, 0.1], [i17['tcap'], 0.0]]
CAPHP[-1] = [br, round(CAP[br][0]), round(CAP[br][1]), round(TS2, 2), round(i17['tcap'], 2), hpz]
BIGHP.append(dict(t0=round(TS2 - 0.4, 2), t1=round(i17['tcap'] + 0.4, 2), k=br, name='BRASÍLIA', sub='CAPITAL HP', hp=hpz))
para(co, T0 + 6.0, CAP[br][0] - 60, CAP[br][1] - 40, n=12); chip(T0 + 6.2, 'COLOMBIAN PARATROOPERS', co, 2.0)
chip(TS2 + 3.8, 'BRAZIL HOLDS ON!', br, 1.8)
LB.append([round(TS2 + 4.8, 2), round(i17['tcap'] + 2.0, 2)])
elim(i17['tcap'] + 0.4, br, co, big=True)
cards.append(dict(t0=round(i17['tcap'] + 3.0, 2), t1=round(i17['tcap'] + 5.0, 2), kind='stamp', text='THE GIANT HAS FALLEN', k=co)); S(i17['tcap'] + 3.0, 'stinger_win', 0.6)
C(i17['tcap'] + 1.5, 2800, 2900, 0.42, 1.2)
t = absorb(co, br, i17['tcap'] + 5.2, per=0.22)
T = t + 1.0

# ===================== LA FINAL: COLOMBIA VS MÉXICO =====================
chapters.append([T, 'THE FINAL']); grade.append([T, 'night'])
C(T, (CAP[co][0] + CAP[mx][0]) / 2, (CAP[co][1] + CAP[mx][1]) / 2, 0.55, 1.2)
cards.append(dict(t0=round(T + 0.2, 2), t1=round(T + 3.0, 2), kind='bigtext', text='THE FINAL', sub='COLOMBIA VS MEXICO'))
S(T + 0.2, 'sub_drop', 1.0); SV(T + 0.3, 'boom', 0.9)
bubble(T + 3.2, mx, 'You got lucky, Colombia.', 2.0); bubble(T + 5.0, co, 'Let\'s finish this.', 2.0)
W.use(mx)
pF = enemy_push(mx, [pa], [(near_cell(None, CAP[pa][:2], among=cells[K['CR']]), (CAP[pa][0] + 60, CAP[pa][1] + 20)), (near_cell(None, CAP[pa][:2], among=cells[K['NI']]), (CAP[pa][0] - 30, CAP[pa][1] + 10))], T + 6.2, T + 11.0, T + 14.0, tank_idx=(0,))
C(T + 6.0, CAP[pa][0] - 60, CAP[pa][1] - 40, 2.0, 0.8); chip(T + 6.4, 'MEXICO RETAKES PANAMA', mx, 2.0)
W.use(co); wipe_out(pF, T + 12.6); chip(T + 12.8, 'COLOMBIA HOLDS THE CANAL', co, 2.0)
BED(T + 6.4, T + 14, 1.0)
T += 9.0
T0 = T + 7.0; D = 23.0
W.use(mx)
for j in range(3):
    tp_ = near_cell(co, (CAP[co][0] + rng.uniform(-60, 60), CAP[co][1] + rng.uniform(-40, 40))); missile(T0 - 1.0 + j * 0.4, CAP[mx][:2], tp_, dur=2.6, g=0.4, big=(j == 0))
W.use(co)
setup_markers(mx, 3, names=['Monterrey', 'Guadalajara', 'Veracruz'])
lv = near_cell(mx, proj(-96.1, 19.2)); landing(proj(-92, 23), lv, T0 + 2.0, dur=2.0)
fleet(T0 + 0.4, [proj(-93, 22), proj(-92, 20.5)], [near_cell(mx, proj(-97.3, 21.0)), near_cell(mx, proj(-95.5, 18.8))], dur=2.4)
i18 = fight(co, mx, T0, D, entries=[near_cell(None, CAP[mx][:2], among=cells[gt]), lv], main_entries=[lv, near_cell(None, CAP[mx][:2], among=cells[gt])], n_main=7, tanks={0, 1}, minsz=560, smax=3.0, fill=0.55, air=True, bub='¡No manches!')
TS3 = i18['tcap'] - 7.0
hpm = [[TS3, 1.0], [TS3 + 1.0, 1.0], [TS3 + 1.15, 0.86], [TS3 + 2.2, 0.86], [TS3 + 2.35, 0.64], [TS3 + 3.4, 0.64], [TS3 + 3.55, 0.5], [TS3 + 4.2, 0.58], [TS3 + 5.0, 0.58], [TS3 + 5.15, 0.3], [TS3 + 5.8, 0.3], [TS3 + 5.95, 0.1], [i18['tcap'], 0.0]]
CAPHP[-1] = [mx, round(CAP[mx][0]), round(CAP[mx][1]), round(TS3, 2), round(i18['tcap'], 2), hpm]
BIGHP.append(dict(t0=round(TS3 - 0.4, 2), t1=round(i18['tcap'] + 0.4, 2), k=mx, name='MEXICO CITY', sub='CAPITAL HP', hp=hpm))
chip(T0 + 2.4, 'COLOMBIA LANDS IN VERACRUZ', co, 2.2); chip(TS3 + 3.6, 'MEXICO HOLDS ON!', mx, 1.8); S(TS3 + 5.0, 'heartbeat', 0.8)
LB.append([round(TS3 + 4.6, 2), round(i18['tcap'] + 2.0, 2)])
battles[-1]['t0'] = round(T + 0.1, 2); battles[-1]['title'] = 'THE FINAL'
elim(i18['tcap'] + 0.4, mx, co, big=True)
t = absorb(co, mx, i18['tcap'] + 1.2, per=0.2)
WIN_T = max(t, i18['tcap'] + 2.4) + 0.4
grade.append([WIN_T, 'gold'])
C(WIN_T - 0.3, 2900, 2600, 0.3, 2.0); C(WIN_T + 2.0, 2900, 2500, 0.34, 9.0)
END = WIN_T + 11.0

# ===================== MÚSICA =====================
CH = {c[1]: c[0] for c in chapters}
M(0, 2.6, 'frantic', 40, 0.95, 0.02, 0.2); M(2.6, 8.6, 'epic', 0, 1.0, 0.05, 0.3); M(8.6, WAR - 0.1, 'drive', 34.28, 0.95, 0.2, 0.2)
M(WAR, CH['THE SOUTH'], 'frantic', 30, 1.0, 0.02, 1.0); M(CH['THE SOUTH'], CH['THE NORTH'], 'march', 0, 1.0, 0.6, 1.0)
M(CH['THE NORTH'], CH['CLASH OF GIANTS'], 'drive', 10, 1.0, 0.6, 1.0); M(CH['CLASH OF GIANTS'], CH['THE ANDES ALLIANCE'], 'heroic', 40, 1.0, 0.6, 1.0)
M(CH['THE ANDES ALLIANCE'], CH['BETWEEN TWO FIRES'], 'saga', 24, 1.0, 0.6, 0.8); M(CH['BETWEEN TWO FIRES'], RV - 0.1, 'horror', 0, 0.95, 0.4, 0.4)
M(RV + 3.4, CH['THE GIANT FALLS'], 'epic', 66.667, 1.08, 0.02, 1.0); M(CH['THE GIANT FALLS'], CH['THE FINAL'], 'chase', 0, 1.0, 0.4, 0.8)
M(CH['THE FINAL'], TS3 - 0.5, 'frantic', 60, 1.0, 0.3, 0.6); M(TS3 - 0.5, WIN_T, 'heroic', 70, 1.05, 0.4, 0.5); M(WIN_T, END, 'triumph', 40, 1.0, 0.1, 2.0)
for s_ in subs: S(s_ + 1.45, 'mouse-click', 0.9); S(s_ + 1.5, 'ding', 0.5); S(s_ + 2.75, 'mouse-click', 0.9)
S(WIN_T, 'stinger_win', 1.0); S(WIN_T + 0.2, 'crowd_cheer', 0.7)
for e in ELIM:
    if e[4]: S(e[0] + 0.1, 'crowd_cheer', 0.2)
W.use(co)
out = export('src/hw/latam.json', END, WAR, WIN_T, mode='br', pw0={str(k): PWR0[k] for k in PK}, intro=INTRO, poll=POLL, board=BOARD, elim=ELIM, alive=ALIVE, parts=PK, reveal=REVEAL, bighp=BIGHP, hero='COLOMBIA', heroLong='COLOMBIA', heroAdj='COLOMBIAN',
             weapon='THE JUNGLE TRAP', title2=['20 COUNTRIES', 'ONLY 1 SURVIVES'], empFlag=True, globe=dict(t0=-10, t1=-9, lon0=0, lon1=0, lat0=0, lat1=0),
             endTitle=['COLOMBIA', 'WINS THE BATTLE ROYALE'], endPills=[['🏆', '20 → 1'], ['⚔️', '19 ELIMINATED'], ['🌴', 'THE JUNGLE TRAP']], endAsk='DID YOU SEE THAT COMING? 👇')
print('dur', round(END, 1), 'win', round(WIN_T, 1), 'chapters', [(round(c[0]), c[1]) for c in chapters])
print('elims', [(round(e[0]), codes[e[1]], codes[e[2]], e[3]) for e in ELIM])
