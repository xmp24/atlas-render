"""What If Earth Burned in 24 Hours? (v2) — director: escenas, datos geográficos, guerra y audio -> src/Burn/tl.json + src/Burn/audio.json"""
import json, math, random, os
import numpy as np
import wlib2 as W
from warlib import K, CAP, CITY, cells, X, Y, codes, NAMES
from wlib2 import proj

rng = np.random.default_rng(2048); random.seed(2048)
def P(lon, lat): return list(proj(lon, lat))
def cap(c): k = K[c]; return [round(CAP[k][0]), round(CAP[k][1])]
def city(c, name): cs = [x for x in CITY[K[c]] if name in x['name']]; return [round(cs[0]['x']), round(cs[0]['y'])]

# ------------------------------------------------------------------ escenas
SC = []; T = [0.0]; SFX = []; MUS = []
def sc(id, d, **p):
    SC.append([id, round(T[0], 2), round(T[0] + d, 2), p]); T[0] += d; return SC[-1][1]
def S(t, name, g=0.6, pan=0.0): SFX.append([round(t, 3), name, round(g, 3), pan])
_last = {}
VAR = {'boom': 12, 'hit': 9, 'gun': 14, 'far': 8, 'whoosh': 7, 'stamp': 3}
def SV(t, kind, g=0.6, pan=0.0):
    n = VAR[kind]; i = random.randint(1, n)
    while i == _last.get(kind): i = random.randint(1, n)
    _last[kind] = i; S(t, f'{kind}_{i}', g, pan)
def M(t0, t1, track, off=0, g=0.8, fi=0.4, fo=0.8): MUS.append(dict(t0=round(t0, 2), t1=round(t1, 2), track=track, offset=off, gain=g, fade_in=fi, fade_out=fo))
def talk(t, bubs, names=('ball_talk', 'ball_talk2', 'ball_talk3')):
    for (tt, k, _x) in bubs: S(t + tt, names[k % 3], 0.55)

# ------------------------------------------------------------------ lugares
PL = {
    'DC': P(-77.04, 38.9), 'NY': P(-74.0, 40.7), 'MOS': P(37.6, 55.75), 'BEI': P(116.4, 39.9), 'LON': P(-0.12, 51.5), 'PAR': P(2.35, 48.85),
    'TPE': P(121.5, 25.0), 'CAI': P(31.2, 30.0), 'ADD': P(38.7, 9.0), 'DEL': P(77.2, 28.6), 'ISB': P(73.0, 33.7), 'BERN': P(7.45, 46.95),
    'HEL': P(24.94, 60.17), 'SEO': P(126.98, 37.56), 'OHIO': P(-82.99, 39.96), 'RIGA': P(24.1, 56.95), 'WAR': P(21.0, 52.2), 'KYIV': P(30.5, 50.45),
    'MTW': P(-77.89, 39.06), 'RAV': P(-77.42, 39.73), 'CHY': P(-104.85, 38.74), 'KOS': P(59.0, 59.5), 'YAM': P(58.1, 54.25), 'WHL': P(116.2, 39.98),
    'PYO': P(125.75, 39.03), 'TEH': P(51.4, 35.7), 'TLV': P(34.8, 32.08), 'SYD': P(151.2, -33.87), 'BUE': P(-58.4, -34.6), 'JNB': P(28.05, -26.2),
    'PER': P(115.86, -31.95), 'MEL': P(144.96, -37.8), 'CPT': P(18.42, -33.92), 'COR': P(-64.18, -31.42), 'ROS': P(-60.64, -32.95), 'DUR': P(31.02, -29.86),
}
RIOT = [P(*a) for a in [(2.35, 48.85), (-0.12, 51.5), (13.4, 52.5), (-3.7, 40.4), (12.5, 41.9), (4.35, 50.85), (4.9, 52.37), (9.19, 45.46), (4.83, 45.76), (5.37, 43.3), (2.17, 41.39), (11.58, 48.14), (-2.24, 53.48), (8.68, 50.11)]]
SILO = {'US': [P(-111.2, 47.5), P(-101.3, 48.4), P(-104.8, 41.1), P(-100.5, 47.0), P(-106, 44)],
        'RU': [P(35.8, 54.0), P(45.6, 51.7), P(89.6, 55.3), P(59.8, 50.8), P(83.3, 53.3), P(40.0, 57.6)],
        'CN': [P(97.0, 40.3), P(93.6, 42.6), P(108.0, 39.5), P(104.0, 37.0)]}
SUBS = {'W': [P(-35, 42), P(-150, 30), P(-20, 60), P(150, 35)], 'E': [P(-40, 55), P(170, 45), P(-160, 50), P(10, 72)]}

# ------------------------------------------------------------------ búnkeres
def sample_in(c, n, city_bias=0.7):
    k = K[c]; ce = cells[k]; out = []; cs = CITY.get(k, [])[:12]
    for i in range(n):
        if cs and rng.random() < city_bias:
            cc = cs[min(int(rng.exponential(2.5)), len(cs) - 1)]
            j = ce[np.argmin((X[ce] - cc['x']) ** 2 + (Y[ce] - cc['y']) ** 2 + rng.random(len(ce)) * 900 * 40)]
        else: j = rng.choice(ce)
        out.append([round(float(X[j] + rng.uniform(-9, 9))), round(float(Y[j] + rng.uniform(-9, 9)))])
    return out
SOUTH = ['AU', 'AR', 'ZA']
PUB = [('CH', 120, 0.55), ('FI', 90, 0.5), ('SE', 90, 0.45), ('NO', 50, 0.45), ('IL', 45, 0.15), ('KR', 70, 0.12), ('SG', 6, 0.3), ('RU', 200, 0.08), ('CN', 260, 0.08),
       ('US', 170, 0.07), ('JP', 40, 0.1), ('DE', 45, 0.1), ('GB', 30, 0.1), ('FR', 30, 0.1), ('UA', 40, 0.06), ('KP', 30, 0.05), ('IN', 50, 0.04), ('CA', 30, 0.1),
       ('AU', 70, 0.75), ('PL', 22, 0.08), ('IR', 18, 0.05), ('TR', 18, 0.06), ('AT', 16, 0.3), ('DK', 10, 0.3), ('EE', 8, 0.3), ('BR', 26, 0.15), ('AR', 45, 0.75),
       ('ZA', 40, 0.7), ('NZ', 14, 0.7), ('IT', 16, 0.1), ('ES', 14, 0.12), ('SA', 10, 0.06), ('BY', 10, 0.05), ('MX', 14, 0.1), ('EG', 8, 0.04), ('PK', 10, 0.04),
       ('CL', 12, 0.5), ('UY', 5, 0.5), ('NG', 10, 0.08), ('KE', 6, 0.15), ('CO', 8, 0.12), ('PE', 6, 0.2), ('ID', 14, 0.15)]
GOV = [('MTW', 'MOUNT WEATHER', 'US'), ('RAV', 'RAVEN ROCK', 'US'), ('CHY', 'CHEYENNE MTN', 'US'), ('KOS', 'KOSVINSKY', 'RU'), ('YAM', 'YAMANTAU', 'RU'), ('WHL', 'WESTERN HILLS', 'CN'),
       ('PYO', 'PYONGYANG', 'KP'), ('LON', 'PINDAR', 'GB'), ('PAR', 'TAVERNY', 'FR'), ('BERN', 'K20', 'CH'), ('DEL', 'NEW DELHI', 'IN'), ('TLV', 'NMC', 'IL')]
FEAT = [dict(id='CH', name='SHELTER 17', place='BERN, SWITZERLAND', at=PL['BERN'], pop=2400), dict(id='FI', name='SHELTER 204', place='HELSINKI, FINLAND', at=PL['HEL'], pop=6000),
        dict(id='US', name='BUNKER 9', place='OHIO, USA', at=PL['OHIO'], pop=900), dict(id='KR', name='STATION 31', place='SEOUL, KOREA', at=PL['SEO'], pop=3500)]

WAR = {'fx': [], 'ext': {'missiles': [], 'crater': [], 'smoke': []}}
def missile(t0, A, B, dur=1.0, big=False, snd=True):
    WAR['ext']['missiles'].append([round(t0, 2), round(t0 + dur, 2), A[0], A[1], B[0], B[1]])
    WAR['fx'].append([round(t0 + dur, 2), B[0], B[1], 90 if big else 70, 0]); WAR['fx'].append([round(t0 + dur + 0.1, 2), B[0], B[1], 40, 2])
    WAR['ext']['crater'].append([round(t0 + dur, 2), B[0], B[1], 1 if big else 0]); WAR['ext']['smoke'].append([round(t0 + dur, 2), round(t0 + dur + 9, 2), B[0], B[1]])
    if snd: S(t0, 'missile_1', 0.25); SV(t0 + dur, 'boom', 0.5)
CEV = []
def flip(tt, c, new, dur=1.2):
    k = K[c]; x, y = cap(c); CEV.append([round(tt, 2), 0, k, K[new], k, x, y, dur])

# ================================================================== TRÁILER
t = sc('COLD1', 7.0, lb=1); S(t + 0.35, 'braam', 0.95); S(t + 1.6, 'thit', 0.7); S(t + 0.6, 'wind', 0.35); S(t + 6.3, 'sub_drop', 0.8)
M(0.4, 6.4, 'horror', 0, 0.45, 0.6, 0.3)
CUTS = [('IN', 'PK'), ('CN', 'TW'), ('RU', 'PL'), ('IR', 'IL'), ('KP', 'KR'), ('EG', 'ET'), ('US', 'VE'), ('TR', 'GR'), ('RU', 'FI'), ('CN', 'JP'), ('SA', 'IR'), ('RS', 'HR'), ('DZ', 'MA'), ('US', 'CN')]
cut_list = []
for i, (a, b) in enumerate(CUTS):
    A, B = cap(a), cap(b); mx, my = (A[0] + B[0]) / 2, (A[1] + B[1]) / 2; dd = math.hypot(B[0] - A[0], B[1] - A[1])
    s = max(0.55, min(2.4, 1200 / (dd + 300)))
    cut_list.append(dict(a=K[a], b=K[b], A=A, B=B, cam=[round(mx), round(my), round(s, 2)], g=['red', 'cold', 'warm', 'night'][i % 4]))
t = sc('COLD2', 0.5 + 0.5 * len(CUTS) + 0.6, lb=1, cuts=cut_list)
M(t, t + 8.2, 'frantic', 20, 0.75, 0.05, 0.3)
S(t + 0.05, 'thit', 0.8)
for i in range(len(CUTS)):
    tc = t + 0.5 + 0.5 * i; SV(tc, 'whoosh', 0.35); S(tc + 0.05, 'missile_1' if i % 2 else 'missile_2', 0.3); SV(tc + 0.25, 'boom', 0.55, (i % 3 - 1) * 0.4)
S(t + 0.5 + 3.0, 'thit', 0.8); S(t + 0.5 + 0.5 * len(CUTS), 'braam2', 0.9)
t = sc('COLD3', 8.4, lb=1)
for i in range(3): S(t + 0.1 + 1.15 * i, 'braam3' if i == 2 else 'braam', 0.7)
S(t + 3.7, 'sub_drop', 0.7); S(t + 4.0, 'siren', 0.55); S(t + 4.0, 'thit', 0.8)
for i in range(10): S(t + 4.1 + 0.24 * i, 'tick', 0.45)
S(t + 6.5, 'steel_door', 0.9); S(t + 7.3, 'thit', 0.85)
M(t, t + 8.4, 'tension', 40, 0.6, 0.2, 0.3)
# teaser: un único golpe nuclear, sin saturar el mapa
TEASER = dict(arcs=[[0.4, 2.6, *SILO['RU'][0], *P(-74.0, 40.7), 1]], blasts=[[2.6, *P(-74.0, 40.7), 2.6]])
t = sc('COLD4', 9.0, lb=1)
M(t, t + 3.6, 'tension', 70, 0.7, 0.1, 0.4)
S(t + 0.4, 'launch', 0.6); S(t + 0.5, 'siren', 0.4); S(t + 2.6, 'nuke', 1.0); S(t + 3.0, 'tinnitus', 0.35)
S(t + 3.7, 'heartbeat', 0.8); S(t + 4.6, 'heartbeat', 0.8)
S(t + 5.6, 'braam2', 1.0); S(t + 5.65, 'thit', 0.9); S(t + 5.7, 'boom_1', 0.7)
M(t + 5.55, t + 9.2, 'epic', 60, 0.8, 0.05, 1.2)

# ================================================================== CAP 1: LA CAÍDA (B/N)
T_FALL = T[0]
t = sc('FALL1', 12.0, bw=1, chap=[0.3, 3.2, 'CHAPTER 1', 'THE FALL'], year=[[0, 2026], [12, 2030]],
       caps=[[3.6, 7.2, 'It didn\'t happen overnight.', ''], [7.6, 11.8, 'For 20 years, the world slowly fell apart.', '20 years']])
S(t + 0.3, 'whoosh_5', 0.4)
for i in range(40):
    c = random.choice(['UA', 'SD', 'ET', 'SY', 'YE', 'MM', 'CD', 'SO', 'ML', 'LY', 'AF', 'IQ', 'VE', 'HT', 'NG', 'PK', 'IN', 'IL', 'IR', 'RS'])
    x, y = cap(c); WAR['fx'].append([round(t + 2.5 + i * 0.23, 2), x + random.randint(-60, 60), y + random.randint(-60, 60), 40, 1])
    if i % 3 == 0: S(t + 2.5 + i * 0.23, 'far_%d' % random.randint(1, 8), 0.18)
def vign(id, d, year, title, a, b, lines, cam, flips=(), stamp=None, nm=6):
    t = sc(id, d, bw=1, year=[[0, year], [d, year + 1]], chip=[0.3, d - 0.3, title], cam=cam, a=K[a], b=K[b], bubs=lines, stamp=stamp)
    S(t + 0.2, 'whoosh_6', 0.4); S(t + 0.4, 'stamp_2', 0.5)
    A, B = cap(a), cap(b)
    for j in range(nm):
        src = [A[0] + random.randint(-50, 50), A[1] + random.randint(-50, 50)] if j % 2 == 0 else [B[0] + random.randint(-50, 50), B[1] + random.randint(-50, 50)]
        dst = [B[0] + random.randint(-90, 90), B[1] + random.randint(-90, 90)] if j % 2 == 0 else [A[0] + random.randint(-90, 90), A[1] + random.randint(-90, 90)]
        missile(t + 0.8 + j * 0.9, src, dst, 1.1)
    for (tt, c, new) in flips: flip(t + tt, c, new); S(t + tt + 0.6, 'stamp_1', 0.7)
    talk(t, lines)
    return t
def mid(a, b, s): A, B = cap(a), cap(b); return [round((A[0] + B[0]) / 2), round((A[1] + B[1]) / 2), s]
vign('FALL2', 9.0, 2031, 'THE WATER WARS', 'EG', 'ET', [[1.2, 0, 'That river is OURS.'], [4.0, 1, 'Not anymore.']], mid('EG', 'ET', 1.25))
vign('FALL3', 9.0, 2036, 'THE PACIFIC CRISIS', 'CN', 'TW', [[1.2, 0, 'You were always ours.'], [4.2, 1, 'Help... anyone?']], mid('CN', 'TW', 2.0), flips=[(5.6, 'TW', 'CN')], stamp=[6.2, 'ABSORBED'])
vign('FALL4', 9.0, 2041, 'THE EASTERN FRONT', 'RU', 'LV', [[1.2, 0, 'The Baltics are next.'], [4.2, 1, 'NATO, where are you?!']], [cap('LV')[0] + 60, cap('LV')[1] + 60, 1.7], flips=[(5.2, 'EE', 'RU'), (5.6, 'LV', 'RU'), (6.0, 'LT', 'RU')], stamp=[6.6, 'GONE'])
GONE = [g for g in ['TW', 'EE', 'LV', 'LT', 'MD', 'SS', 'HT', 'LB', 'XK', 'SO', 'LY', 'YE'] if g in K]
t = sc('FALL5', 9.5, bw=1, year=[[0, 2045], [9.5, 2046]], gone=[K[g] for g in GONE], caps=[[6.6, 9.3, 'Some countries simply stopped existing.', 'stopped existing']])
S(t + 0.2, 'whoosh_7', 0.5)
for i in range(len(GONE)): S(t + 1.0 + 0.42 * i, 'stamp_%d' % (1 + i % 3), 0.55); S(t + 1.0 + 0.42 * i, 'hit_%d' % (1 + i % 9), 0.25)
WEST = [c for c in ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'PL', 'NO', 'SE', 'FI', 'DK', 'IE', 'AT', 'CH', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'JP', 'KR', 'AU', 'NZ', 'IL', 'UA', 'IS', 'PH'] if c in K]
EAST = [c for c in ['RU', 'CN', 'KP', 'IR', 'BY', 'KZ', 'MN', 'SY', 'VE', 'CU', 'MM', 'LA', 'KG', 'TJ', 'TM', 'UZ', 'TW', 'EE', 'LV', 'LT', 'AF'] if c in K]
t = sc('FALL6', 10.0, bw=0, year=[[0, 2047], [10, 2048]], west=WEST, east=EAST, caps=[[5.8, 9.8, 'By 2048, the world had split in two.', 'split in two']])
S(t + 0.8, 'braam3', 0.65); S(t + 1.0, 'riser_2s', 0.4); S(t + 3.0, 'stamp_3', 0.6); S(t + 3.6, 'stamp_2', 0.6)
for i in range(16): S(t + 3.0 + 0.12 * i, 'tick', 0.25)
# música continua en todo el capítulo 1
M(T_FALL, t + 3.0, 'nocturne', 0, 0.7, 1.4, 1.6); M(t + 1.5, t + 10.5, 'tension', 0, 0.7, 1.4, 0.8)

# ================================================================== CAP 2: LA ÚLTIMA GUERRA (motor de guerra)
D_WAR = 34.0
t = sc('WAR', D_WAR, chap=[0.0, 2.6, 'CHAPTER 2', 'THE LAST WAR'], year=[[0, 2048], [D_WAR, 2048]],
       caps=[[3.0, 7.6, 'The East strikes first.', 'East'], [11.0, 16.0, 'NATO hits back. Hard.', 'NATO'], [19.0, 24.6, 'In the Pacific, China is surrounded.', 'surrounded'], [28.6, 33.6, 'The East is losing.', 'losing']])
TW0 = t
M(t, t + 2.6, 'tension', 30, 0.6, 0.3, 0.6); M(t + 2.4, t + D_WAR + 0.4, 'frantic', 40, 0.8, 0.3, 0.5)
S(t + 0.1, 'whoosh_5', 0.4); S(t + 2.6, 'thit', 0.7)
RU, BY, PLk, FI, US, CN, JP, KR, TWk, LT = [K[c] for c in ['RU', 'BY', 'PL', 'FI', 'US', 'CN', 'JP', 'KR', 'TW', 'LT']]
W.EMP.clear(); W.use(RU); W.owned |= {BY, K['EE'], K['LV'], LT}
minsk, brest = city('BY', 'Minsk'), city('BY', 'Brest'); warsaw, gdansk, krakow = city('PL', 'Warsaw'), city('PL', 'Gda'), city('PL', 'Krak')
hel, spb, mos = city('FI', 'Helsinki'), city('RU', 'Peters'), city('RU', 'Moscow'); kalin = P(20.5, 54.7); smol = P(32.05, 54.78)
# A) el Este ataca Polonia y Finlandia (avanza y luego se retira)
idsE = W.enemy_push(RU, [PLk, FI], [(brest, warsaw), (kalin, gdansk), (minsk, P(22.5, 53.2)), (spb, hel), (P(31, 62.5), P(27.5, 62.0))], t + 2.6, t + 9.0, t + 12.5, n=5, tank_idx=(0, 3))
for j in range(6): W.missile(t + 3.0 + j * 0.7, mos if j % 2 else minsk, [warsaw, gdansk, hel, krakow, P(25, 61), P(19, 51)][j], big=j == 0)
W.jets(RU, t + 4.0, t + 7.5, *spb, *P(22, 60.5), n=3)
# B) contraataque de la OTAN: Bielorrusia ocupada y una franja del oeste de Rusia
W.use(US); W.owned |= {PLk, K['DE'], LT, K['LV'], K['EE'], FI, K['UA']}
idsW = []
for j, (a_, b_) in enumerate([(warsaw, minsk), (P(22.5, 53.2), P(27.5, 53.9)), (brest, P(29.5, 52.4)), (minsk, smol), (P(26.5, 55.5), P(30.5, 55.2))]):
    pts = W.route(a_, b_, {PLk, BY, RU, LT, K['UA'], K['LV']})
    t0 = t + 10.6 + 0.25 * j + (2.4 if j >= 3 else 0)
    if j in (0, 3): q = W.tanks_sq(US, pts, [[t0, 0], [t0 + 5.5, 1.0]], n=4, t1=t + D_WAR + 0.5, fw=[[t0 + 1.5, t0 + 5.5]])
    else: q, _, _ = W.squad(US, None, pts, [[t0, 0], [t0 + 5.5, 1.0]], n=5, r=45, t1=t + D_WAR + 0.5, fw=[[t0 + 1.5, t0 + 5.5]])
    idsW.append(q)
fBY = W.flood_of(US, BY, t + 11.0, t + 17.0, t + 17.5, CAP[BY], idsW[:3], [warsaw, brest], border=False, t_end=t + D_WAR + 0.5)
W.occ.append([BY, US, round(t + 11.0, 2), round(t + D_WAR + 0.6, 2), [], None, fBY])
fRU = W.flood_of(US, RU, t + 13.5, 1e6, 1e6, CAP[RU], idsW[3:], [P(31.5, 55), P(32.5, 53.5)], v=36.0, border=False,
                 tw=[[t + 13.5, t + 13.5], [t + 20, t + 20], [t + D_WAR + 1, t + 20]], t_end=t + D_WAR + 0.5)
W.occ.append([RU, US, round(t + 13.5, 2), round(t + D_WAR + 0.6, 2), [], None, fRU])
for j in range(5): W.bomb_run(US, t + 11.5 + j * 0.8, *[minsk, P(28.5, 54.5), P(30.5, 53.5), smol, P(31.5, 55.3)][j], ang=15 if j % 2 else 195)
for j in range(5): W.missile(t + 12.0 + j * 0.5, [warsaw, gdansk, P(19, 54), P(24, 56), P(22, 50)][j], [mos, smol, P(36.2, 54.5), spb, P(39.7, 47.2)][j], big=j == 0)
W.BED(t + 3.0, t + 18.5, 0.8)
# C) Pacífico: flota occidental, misiles cruzados
fleet = [[P(140, 22), P(126.5, 28.5)], [P(150, 30), P(129.5, 31.5)], [P(135, 15), P(124, 23)], [P(155, 25), P(131, 34.5)]]
SHIPS = [[round(t + 18.4 + 0.3 * j, 2), round(t + 23.6 + 0.3 * j, 2), *a_, *b_] for j, (a_, b_) in enumerate(fleet)]
for j in range(8): W.missile(t + 19.5 + j * 0.45, [P(121.5, 31.2), P(120, 26), P(119.5, 32.5), P(122, 29)][j % 4], [P(127.5, 26.3), P(130.4, 33.6), P(126.9, 35.9), P(139.7, 35.7), P(126, 28.5), P(129, 31), P(124.5, 23), P(130, 30)][j])
for j in range(6): W.missile(t + 21.6 + j * 0.45, [P(129.5, 31.5), P(126.5, 28.5), P(131, 34.5)][j % 3], [P(121.5, 31.2), P(120.2, 30.3), P(118.1, 24.5), P(121.5, 25.0), P(122.1, 37.5), P(120.4, 36.1)][j], big=j < 2)
for j in range(4): S(t + 18.6 + j * 0.9, 'cannon', 0.45)
W.jets(US, t + 20.0, t + 24.5, *P(141, 38), *P(123, 31), n=3)
# D) plano general: el Este acorralado
STAMP_E = 30.0
S(t + STAMP_E, 'stamp_3', 0.9); S(t + STAMP_E, 'braam', 0.8)
# cámara de la escena (tiempo local)
WCAM = [[0, *P(26, 54), 1.15], [2.6, *P(25, 56), 1.25], [9.6, *P(26, 55), 1.3], [11.0, *P(28, 54.5), 1.35], [17.6, *P(30, 54.5), 1.4], [18.6, *P(128, 30), 1.25], [26.0, *P(126, 30), 1.3], [27.6, 4300, 1700, 0.42], [34, 4300, 1700, 0.45]]
SC[-1][3].update(cam=WCAM, ships=SHIPS)
# mezcla los datos de guerra y su sonido
SFX += [[round(s[0], 3), s[1], s[2], s[3]] for s in W.sfx]
WAR['sq'] = W.SQ; WAR['occ'] = W.occ; WAR['df'] = W.DF; WAR['fx'] += W.FX
WAR['ext']['missiles'] += W.MISS; WAR['ext']['crater'] += W.CRAT; WAR['ext']['smoke'] += W.SMK
WAR['ext'].update(jets=W.JETX, bombs=W.BOMBS, para=W.PARA, flak=W.FLAK, seas=[], flags=[], arty=[], caphp=[])

# ================================================================== CAP 3: EL ULTIMÁTUM
T_CALL = T[0]
t = sc('CALL2', 14.0, chap=[0.0, 2.4, 'CHAPTER 3', 'THE ULTIMATUM'],
       bubs=[[2.6, 0, 'NATO is at our door.'], [5.0, 1, 'And our fleet is trapped.'], [7.6, 0, 'Then we use THE BOMB.'], [10.4, 1, '24 hours. Then we launch.']])
M(t, t + 50, 'tension', 30, 0.75, 0.6, 0.6); S(t + 0.1, 'whoosh_6', 0.4); talk(t, SC[-1][3]['bubs'], ('ball_talk2', 'ball_talk3', 'ball_talk')); S(t + 7.6, 'braam', 0.6)
t = sc('CALL1', 14.0, bubs=[[0.8, 1, 'Sir. Moscow and Beijing sent a message.'], [4.0, 0, 'What does it say?'], [6.2, 1, 'Pull back in 24 hours... or they launch.'], [10.2, 0, 'If they launch, we launch EVERYTHING.']])
S(t + 0.1, 'whoosh_5', 0.4); S(t + 0.3, 'phone_ring', 0.6); talk(t, SC[-1][3]['bubs'], ('ball_talk', 'ball_talk3', 'ball_talk')); S(t + 10.2, 'heartbeat', 0.5)
t = sc('CALL3', 12.0, bubs=[[1.0, 1, '24 hours. Pull back.'], [3.6, 0, 'Never. Launch, and we answer.'], [6.6, 2, 'Then the clock is ticking.']])
S(t + 0.1, 'glitch', 0.5); S(t + 0.3, 'beep_hi', 0.4); talk(t, SC[-1][3]['bubs'])
S(t + 9.0, 'braam2', 0.9); S(t + 9.0, 'thit', 0.7); S(t + 9.2, 'siren', 0.4)
t = sc('CALL4', 8.0, cd=[[0, 86400], [8, 85200]], caps=[[3.6, 7.8, '3,900 warheads. Ready to fly.', '3,900']])
for i in range(3): S(t + 0.6 + i * 0.7, 'lock', 0.5); S(t + 0.6 + i * 0.7, 'beep_hi', 0.3)
S(t + 3.0, 'riser_4s', 0.4)
t = sc('NEWS', 22.0, cd=[[0, 85200], [22, 79200]], bubs=[[1.4, 0, 'Breaking news.'], [3.6, 0, 'Russia and China: nuclear strike in 24 hours.'], [7.6, 0, 'The West vows to answer.'], [11.6, 0, 'Find a shelter. NOW.']], alert=[15.0, 21.6])
M(t, t + 15.0, 'newsroom', 0, 0.7, 0.2, 0.6); M(t + 14.8, t + 22.3, 'tension', 70, 0.75, 0.2, 0.4)
S(t, 'news_sting', 0.8); talk(t, SC[-1][3]['bubs'], ('ball_talk',) * 3)
for tt in [5.6, 9.6, 13.0]: SV(t + tt, 'whoosh', 0.5); S(t + tt + 0.55, 'stamp_1', 0.6)
S(t + 15.0, 'eas', 0.75); S(t + 18.4, 'eas', 0.6); S(t + 15.0, 'siren', 0.3)

# ================================================================== CAP 4: LOS BÚNKERES
t = sc('VIP1', 14.0, chap=[0.0, 2.4, 'CHAPTER 4', 'THE BUNKERS'], cd=[[0, 75600], [14, 61200]],
       caps=[[2.8, 6.6, 'The powerful go first.', 'powerful'], [8.8, 13.6, 'Air Force One. Marine One. Mountain bunkers.', 'Mountain bunkers']])
M(t, t + 33.5, 'spy', 0, 0.75, 0.5, 0.6); S(t + 0.1, 'whoosh_7', 0.4)
for i in range(3): S(t + 3.0 + i * 1.6, 'rotor', 0.45); S(t + 4.2 + i * 1.6, 'stamp_2', 0.6)
S(t + 9.6, 'jet', 0.5)
t = sc('VIP2', 10.0, cd=[[0, 61200], [10, 54000]], caps=[[0.6, 4.8, 'Moscow empties into the mountains.', 'mountains'], [5.4, 9.6, 'Beijing goes underground.', 'underground']])
for i in range(4): S(t + 1.2 + i * 2.2, 'rotor', 0.4); S(t + 2.4 + i * 2.2, 'stamp_2', 0.55)
t = sc('DOOR', 9.5, cd=[[0, 54000], [9.5, 50400]], caps=[[0.8, 4.8, 'Presidents. Generals. Billionaires.', 'Billionaires']])
S(t + 0.3, 'tank_roll', 0.25); S(t + 5.6, 'steel_door', 0.9); S(t + 7.0, 'stamp_3', 0.8); S(t + 7.0, 'boom_4', 0.5)
pub = []
for (c, n, q) in PUB:
    if c not in K: continue
    for (x, y) in sample_in(c, n): pub.append(dict(c=c, x=x, y=y, q=q))
t = sc('BUNK', 17.0, cd=[[0, 50400], [17, 21600]],
       caps=[[0.4, 4.4, 'Everyone else needs a shelter too.', 'shelter'], [12.2, 16.8, 'Space for just 5% of humanity.', '5%']],
       labels=[[1.6, 'CH', 'SWITZERLAND: A SHELTER FOR EVERYONE'], [4.4, 'FI', 'FINLAND: 50,500 SHELTERS'], [6.6, 'KR', 'SEOUL: 3,000+ SUBWAY SHELTERS'], [8.8, 'RU', 'MOSCOW: METRO SHELTERS']])
M(t, t + 17.5, 'tension', 10, 0.75, 0.4, 0.6)
for i in range(40): S(t + 1.4 + i * 0.25, 'tick', 0.18 + 0.004 * i)
S(t + 12.0, 'stamp_3', 0.8); S(t + 12.0, 'braam', 0.6)
# ================================================================== CAP 5: PÁNICO
t = sc('RIOT1', 12.0, chap=[0.0, 2.4, 'CHAPTER 5', 'PANIC'], cd=[[0, 21600], [12, 10800]], cam=[cap('FR')[0] + 200, cap('FR')[1] - 100, 1.15],
       caps=[[2.8, 6.8, 'Supermarkets empty in 3 hours.', '3 hours'], [7.4, 11.6, 'People fight over the last food.', 'last food']])
M(t, t + 34, 'frantic', 0, 0.75, 0.4, 0.6); S(t + 2.4, 'crowd', 0.5); S(t + 7.0, 'crowd', 0.5)
for i in range(18): SV(t + 2.6 + i * 0.5, 'hit' if i % 3 else 'gun', 0.28, random.uniform(-0.6, 0.6))
t = sc('RIOT2', 10.0, cd=[[0, 10800], [10, 5400]], bubs=[[0.8, 0, "That's MINE!"], [2.6, 1, 'My kids are hungry!'], [7.4, 2, 'Let us in!!']])
S(t + 0.4, 'crowd', 0.45)
for i in range(8): SV(t + 0.9 + i * 0.45, 'hit', 0.5, random.uniform(-0.5, 0.5))
talk(t, SC[-1][3]['bubs']); S(t + 6.6, 'steel_door', 0.7); S(t + 7.0, 'stamp_1', 0.7)
t = sc('RUSH', 11.0, cd=[[0, 5400], [11, 12]], caps=[[0.6, 5.0, 'Public shelters fill up in minutes.', 'minutes'], [6.0, 10.6, 'The doors close.', '']])
S(t + 0.4, 'crowd', 0.4); S(t + 5.0, 'crowd', 0.35)
for i in range(30): S(t + 1.5 + i * 0.28, 'stamp_%d' % (1 + i % 3), 0.18)
S(t + 9.5, 'steel_door', 0.8)
t = sc('COUNT', 6.0, cd=[[0, 12], [0.5, 10], [5.5, 0], [6, 0]])
M(t - 0.2, t + 6.0, 'horror', 40, 0.4, 0.2, 0.2)
for i in range(11): S(t + 0.5 + i * 0.5, 'heartbeat' if i % 2 == 0 else 'tick', 0.7)

# ================================================================== CAP 6: IMPACTO — bombas nucleares en todos los continentes
T_LAUNCH = T[0]
def tg(c, n):
    k = K[c]; cs = CITY.get(k, [])[:n]; out = [[round(cc['x']), round(cc['y'])] for cc in cs]
    while len(out) < n: out += sample_in(c, 1, 0.3)
    return out
TG_E = []  # objetivos del Este (países del Oeste y aliados)
for c, n in [('US', 14), ('CA', 2), ('MX', 3), ('GB', 2), ('FR', 2), ('DE', 2), ('IT', 1), ('ES', 1), ('PL', 1), ('UA', 1), ('TR', 1), ('JP', 3), ('KR', 1), ('IL', 1),
             ('BR', 4), ('CO', 1), ('PE', 1), ('NG', 2), ('KE', 1), ('EG', 1), ('SA', 1), ('IN', 2)]:
    if c in K: TG_E += tg(c, n)
TG_W = []  # objetivos del Oeste
for c, n in [('RU', 12), ('CN', 12), ('KP', 1), ('IR', 2), ('BY', 1), ('KZ', 1), ('SY', 1), ('VE', 2), ('CU', 1), ('PK', 2), ('IN', 2), ('DZ', 1), ('ET', 1), ('CD', 1), ('EG', 1), ('MM', 1)]:
    if c in K: TG_W += tg(c, n)
NUKE_D = 28.0
arcs = []; blasts = []
def launch(targets, srcs, side, l0, spread):
    for i, p in enumerate(targets):
        s_ = srcs[int(rng.integers(len(srcs)))]; la = l0 + rng.uniform(0, spread); fl = rng.uniform(5.0, 6.6)
        arcs.append([round(T_LAUNCH + la, 2), round(T_LAUNCH + la + fl, 2), s_[0], s_[1], p[0], p[1], side])
        blasts.append([round(T_LAUNCH + la + fl, 2), p[0], p[1], round(float(rng.uniform(1.6, 2.5)), 2)])
launch(TG_E, SILO['RU'] + SILO['CN'] + SUBS['E'], 1, 3.2, 2.8)
launch(TG_W, SILO['US'] + SUBS['W'], 0, 7.0, 2.8)
blasts.sort()
NUKE = dict(arcs=arcs, blasts=blasts)
t = sc('NUKE', NUKE_D)
M(t, t + 2.8, 'horror', 70, 0.4, 0.3, 0.5); S(t + 0.2, 'siren', 0.6); S(t + 1.6, 'siren', 0.5)
M(t + 2.9, t + 21.0, 'epic', 0, 0.8, 0.3, 0.2)
for a in sorted(arcs)[::3]: S(a[0] - 0.05, 'launch', 0.3, random.uniform(-0.7, 0.7))
S(t + 3.1, 'thit', 0.8); S(t + 7.0, 'thit', 0.8); S(t + 7.0, 'braam2', 0.6)
lastb = -9
for b in blasts:
    if b[0] - lastb > 0.22: S(b[0], 'nuke_far' if random.random() < 0.55 else 'nuke', 0.36, random.uniform(-0.7, 0.7)); lastb = b[0]
S(t + 20.5, 'nuke', 1.0); S(t + 20.8, 'tinnitus', 0.45); S(t + 21.5, 'wind', 0.5)
t = sc('AFTER', 15.0, caps=[[0.6, 4.4, 'Cities became firestorms.', 'firestorms'], [4.8, 9.2, 'Smoke rose high into the sky...', ''], [9.6, 14.6, '...and blocked out the sun.', 'sun']])
M(t + 0.5, t + 16, 'horror', 0, 0.6, 1.5, 0.8); S(t + 9.6, 'sub_drop', 0.6); S(t + 11.5, 'wind', 0.4)
t = sc('WINTER', 10.0, caps=[[0.4, 4.6, 'Nuclear winter. Crops fail everywhere.', 'Nuclear winter'], [5.0, 9.6, 'The surface is no longer livable.', 'no longer livable']])
S(t + 0.3, 'wind', 0.55); S(t + 5.0, 'braam', 0.55)

# ================================================================== CAP 7: BAJO TIERRA
YK = []
def yk(tt, y): YK.append([round(tt, 2), y])
t = sc('ALIVE', 11.0, chap=[0.0, 2.6, 'CHAPTER 6', 'UNDERGROUND'], caps=[[3.0, 6.6, 'Only those underground are alive.', 'underground'], [7.0, 10.8, '410 million people. 5% of humanity.', '5%']])
yk(t, 2048.05); yk(t + 11, 2048.2)
M(t, t + 25, 'ambient', 0, 0.7, 1.0, 0.8); S(t + 0.2, 'hum', 0.35); S(t + 3.0, 'stamp_2', 0.5); S(t + 7.0, 'heartbeat', 0.5)
t = sc('INSIDE', 14.0, caps=[[0.6, 4.8, 'Year 1. Every meal is counted.', 'Year 1'], [7.6, 13.6, 'Generators. Filtered air. Canned food.', '']], who='CH', food=[[0, 100], [14, 78]])
yk(t + 14, 2049.0); S(t, 'hum', 0.4); S(t + 6, 'hum', 0.4)
t = sc('FIGHT', 13.0, who='US', food=[[0, 22], [13, 0]], bubs=[[2.0, 0, "Where's the rest of the food?!"], [4.6, 1, "That's MY ration!"], [7.0, 2, 'Stop! STOP!']], lost=[9.6, 'BUNKER 9 · LOST'])
yk(t + 13, 2050.0)
M(t, t + 13.5, 'tension', 60, 0.7, 0.4, 0.6); talk(t, SC[-1][3]['bubs'])
for i in range(10): SV(t + 4.8 + i * 0.4, 'hit', 0.45)
S(t + 9.6, 'stamp_3', 0.8); S(t + 9.6, 'sub_drop', 0.6)
t = sc('YEARS', 14.0, caps=[[0.6, 5.4, 'Most public shelters never make it.', 'never make it'], [7.8, 13.6, 'Food runs out. Fights. Disease.', '']])
yk(t + 14, 2052.0)
M(t, t + 14.5, 'nocturne', 30, 0.7, 0.4, 0.6)
for i in range(22): S(t + 0.8 + i * 0.6, 'tick', 0.3)
S(t + 7.2, 'stamp_3', 0.7)
t = sc('SCOUT', 15.0, caps=[[0.6, 4.6, 'Year 4. The first scouts go outside.', 'first scouts'], [9.0, 14.6, 'The north is still deadly. But the south...', 'the south']])
yk(t + 15, 2052.5)
M(t, t + 15.5, 'scifi', 0, 0.65, 0.6, 0.6); S(t + 0.4, 'wind', 0.5); S(t + 7.0, 'wind', 0.45); S(t + 1.2, 'steel_door', 0.6)
for i in range(60): S(t + 2.5 + i * 0.12 + random.uniform(0, 0.08), 'tick', 0.22)
t = sc('FAMILY', 13.0, caps=[[0.6, 5.0, 'Life goes on underground.', 'Life goes on'], [6.4, 12.6, 'Children are born who have never seen the sky.', 'never seen the sky']])
yk(t + 13, 2053.0)
M(t, t + 13.5, 'saga', 0, 0.6, 1.0, 0.8); S(t + 3.0, 'ding', 0.3)

# ================================================================== CAP 8: EL SUR SALE PRIMERO
t = sc('RAD', 13.0, chap=[0.0, 2.6, 'CHAPTER 7', 'THE SOUTH'], caps=[[3.0, 7.6, 'Most bombs fell on the north.', 'north'], [8.2, 12.8, 'Three big countries got lucky.', 'lucky']],
       south=[K[c] for c in SOUTH])
yk(t + 13, 2053.2)
M(t, t + 29, 'voyage', 0, 0.6, 1.2, 0.8); S(t + 3.0, 'scan', 0.4)
for i in range(3): S(t + 8.4 + i * 0.9, 'stamp_2', 0.6); S(t + 8.4 + i * 0.9, 'ding', 0.3)
t = sc('FIRST', 16.0, bubs=[[6.6, 0, 'Mate... look at that.'], [9.6, 1, 'The sun!']], caps=[[11.6, 15.6, 'Australia walks out first.', 'Australia']])
yk(t + 16, 2053.6)
S(t + 1.0, 'steel_door', 0.6); S(t + 3.5, 'birds', 0.35); S(t + 2.0, 'wind', 0.25); talk(t, SC[-1][3]['bubs'])
t = sc('REBUILD', 16.0, caps=[[0.6, 5.2, 'They start again from nothing.', 'from nothing'], [9.0, 15.6, 'Farms. Homes. Power. A new beginning.', 'new beginning']])
yk(t + 16, 2056.0)
M(t - 0.4, t + 30, 'heroic', 0, 0.6, 1.2, 0.8)
for i in range(14): S(t + 1.5 + i * 0.95, 'hit_%d' % (1 + i % 9), 0.18); S(t + 1.7 + i * 0.95, 'ding', 0.08)
t = sc('RMAP', 14.0, caps=[[0.6, 5.0, 'Australia, Argentina and South Africa rebuild.', 'rebuild'], [6.0, 13.6, 'Ships connect them. Food flows again.', 'Food flows again']])
yk(t + 14, 2057.0)
for i in range(6): S(t + 5.0 + i * 1.2, 'whoosh_%d' % (1 + i % 7), 0.25)
t = sc('WAVE', 17.0, caps=[[0.6, 5.0, 'Then, shelter after shelter opens.', 'opens'], [9.0, 16.6, 'Every year, faster than the last.', 'faster']])
yk(t + 17, 2061.0)
for i in range(40): S(t + 1.0 + i * 0.38, 'ding', 0.09 + 0.004 * i)
t = sc('OUT', 14.0, caps=[[8.5, 13.6, 'Even Europe walks out.', 'Europe']])
yk(t + 14, 2061.5)
M(t, t + 27, 'triumph', 0, 0.55, 2.0, 2.5); S(t + 1.0, 'steel_door', 0.6); S(t + 3.5, 'birds', 0.45); S(t + 9.0, 'birds', 0.4); S(t + 2.0, 'wind', 0.25)
t = sc('END', 13.0)
S(t + 1.0, 'braam3', 0.4); S(t + 3.0, 'thit', 0.5); S(t + 5.0, 'stinger_win', 0.25)
DUR = round(T[0], 2)

# ================================================================== curvas
def scene_t(id): return [s for s in SC if s[0] == id][0][1]
T_HIT = T_LAUNCH + 8.4
HUM = [[0, 100.0], [round(T_HIT, 2), 100.0], [round(T_LAUNCH + 21, 2), 5.0], [round(scene_t('ALIVE') + 11, 2), 5.0],
       [round(scene_t('INSIDE') + 14, 2), 3.4], [round(scene_t('FIGHT') + 13, 2), 2.1], [round(scene_t('YEARS') + 14, 2), 0.62],
       [round(scene_t('SCOUT') + 15, 2), 0.42], [round(scene_t('FAMILY') + 13, 2), 0.34], [round(scene_t('RMAP') + 14, 2), 0.37], [round(scene_t('WAVE') + 17, 2), 0.46], [DUR, 0.47]]
t_die0, t_die1 = scene_t('INSIDE'), scene_t('FAMILY') + 13
bt0 = scene_t('BUNK'); cstart = {c: 1.4 + i * 0.22 for i, (c, n, q) in enumerate(PUB)}
# apertura: el sur en RMAP, el resto en ola durante WAVE (de sur a norte, cada vez más rápido)
t_rm, t_wv = scene_t('RMAP'), scene_t('WAVE')
for b in pub:
    b['t'] = round(bt0 + cstart[b['c']] + rng.uniform(0, 1.2), 2)
    b['d'] = -1 if rng.random() < b['q'] else round(t_die0 + (t_die1 - t_die0) * rng.random() ** 0.7, 2)
    if b['c'] in SOUTH + ['NZ', 'UY', 'CL']: b['o'] = round(scene_t('RAD') + 9.0 + rng.uniform(0, 1.5), 2) if b['c'] in SOUTH else round(t_rm + rng.uniform(1, 6), 2)
    else:
        lat_u = min(1.0, max(0.0, (b['y'] - 1200) / 1700.0))   # y mayor = más al sur
        u = (1 - lat_u) ** 1.6 * 0.85 + rng.uniform(0, 0.15)
        b['o'] = round(t_wv + 1.0 + 14.5 * u, 2)
# países que recuperan el color (gris -> color) en orden
REOPEN = []
for c in SOUTH: REOPEN.append([K[c], round(scene_t('RAD') + 9.0 + SOUTH.index(c) * 0.9, 2)])
done = set(SOUTH)
for c in ['NZ', 'UY', 'CL', 'PY', 'BO', 'NA', 'BW', 'MZ', 'MG', 'ZW', 'ZM', 'AO']:
    if c in K: REOPEN.append([K[c], round(t_rm + 2 + rng.uniform(0, 8), 2)]); done.add(c)
lat_of = {}
for k in range(len(codes)):
    if codes[k] in done or k not in CAP: continue
    REOPEN.append([k, round(t_wv + 1.5 + 14 * (1 - min(1, max(0, (CAP[k][1] - 1200) / 1700))) ** 1.5 * 0.9 + rng.uniform(0, 1.2), 2)])
FEAT[2]['die'] = round(scene_t('FIGHT') + 9.6, 2); FEAT[3]['die'] = round(scene_t('YEARS') + 9.0, 2)
FEAT[0]['food'] = [[scene_t('ALIVE'), 100], [scene_t('INSIDE') + 14, 78], [scene_t('YEARS') + 14, 31], [scene_t('FAMILY') + 13, 12], [DUR, 8]]
FEAT[1]['food'] = [[scene_t('ALIVE'), 100], [scene_t('INSIDE') + 14, 74], [scene_t('YEARS') + 14, 22], [scene_t('FAMILY') + 13, 9], [DUR, 6]]
FEAT[2]['food'] = [[scene_t('ALIVE'), 100], [scene_t('INSIDE') + 14, 41], [scene_t('FIGHT') + 9.6, 0]]
FEAT[3]['food'] = [[scene_t('ALIVE'), 100], [scene_t('INSIDE') + 14, 66], [scene_t('YEARS') + 9.0, 0]]
FEAT[0]['alive'] = [[scene_t('ALIVE'), 2400], [scene_t('YEARS') + 14, 2210], [scene_t('FAMILY') + 13, 2290], [DUR, 2300]]
FEAT[1]['alive'] = [[scene_t('ALIVE'), 6000], [scene_t('YEARS') + 14, 4900], [scene_t('FAMILY') + 13, 5100], [DUR, 5150]]
FEAT[2]['alive'] = [[scene_t('ALIVE'), 900], [scene_t('INSIDE') + 14, 860], [scene_t('FIGHT') + 9.6, 0]]
FEAT[3]['alive'] = [[scene_t('ALIVE'), 3500], [scene_t('INSIDE') + 14, 3300], [scene_t('YEARS') + 9.0, 0]]
GOVL = [dict(at=PL[a], name=n, c=c, t=0) for (a, n, c) in GOV]
# rutas de barcos entre los países del sur (RMAP)
ROUTES = [[PL['PER'], PL['CPT']], [PL['CPT'], PL['BUE']], [PL['SYD'], P(-75, -45)], [PL['BUE'], P(-30, -20)], [PL['DUR'], PL['PER']]]

out = dict(riot=RIOT, total=DUR, scenes=SC, pl=PL, silo=SILO, gov=GOVL, pub=[[b['x'], b['y'], b['t'], b['d'], K[b['c']], b['o']] for b in pub], feat=FEAT, nuke=NUKE, teaser=TEASER,
           war=WAR, cev=CEV, hum=HUM, years=YK, t_launch=round(T_LAUNCH, 2), t_hit=round(T_HIT, 2), west=[K[c] for c in WEST], east=[K[c] for c in EAST],
           reopen=REOPEN, south=[K[c] for c in SOUTH], routes=ROUTES,
           burned=[K[c] for c in ['US', 'CA', 'GB', 'FR', 'DE', 'IT', 'ES', 'PL', 'UA', 'JP', 'KR', 'KP', 'RU', 'CN', 'IR', 'IN', 'PK', 'IL', 'TR', 'SA', 'BY', 'KZ', 'NL', 'BE', 'SY', 'MX', 'BR', 'NG', 'EG', 'CO', 'VE', 'KE', 'ET', 'CD', 'DZ', 'PE', 'CU', 'MM', 'CZ', 'AT', 'HU', 'RO'] if c in K])
os.makedirs('src/Burn', exist_ok=True)
json.dump(out, open('src/Burn/tl.json', 'w'), separators=(',', ':'))
json.dump(dict(dur=DUR, music=MUS, sfx=sorted(SFX)), open('src/Burn/audio.json', 'w'))
print('DUR', DUR, 'scenes', len(SC), 'arcs', len(arcs), 'pub', len(pub), 'sfx', len(SFX), 'sq', len(W.SQ))
for s in SC: print(f'{s[0]:8s} {s[1]:7.1f} {s[2]-s[1]:5.1f}')
