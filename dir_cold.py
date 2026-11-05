"""Vídeo 1: What If Earth Got 1°C Colder Every Month — todo en el mapa; clímax en el cero absoluto."""
from wsim import *
V = Vid('cold', seed=11)
MK = []   # (t_abs, mes)
def mk(t, m): MK.append([round(t, 2), m])
TEMP0 = 15.0
def tempkf(): return [[t, round(max(-273.15, TEMP0 - m), 2)] for t, m in MK]
ICE_T0 = None
NB = ks('US', 'CA', 'RU', 'UA', 'CN', 'FR', 'DE', 'PL', 'KZ', 'AR', 'AU', 'IN', 'BR')
GEO = {'ICELAND': P(-19, 64.5), 'YELLOWSTONE': P(-110.6, 44.5), 'JAPAN': P(138.7, 36.0), 'KAMCHATKA': P(158.5, 55.0), 'NEW ZEALAND': P(176.0, -38.6), 'ETHIOPIA': P(40.5, 9.0), 'INDONESIA': P(110.4, -7.5)}
NUKE = [P(2.3, 47.5), P(-80, 40), P(140, 37), P(127.5, 36.5), P(116, 33), P(37.6, 55), P(-120, 38), P(10, 51), P(77, 22), P(-46, -22)]

# ======================= TRÁILER =======================
t = V.sc('title', 8.0, id='COLD_A', hard=True, cam=[[0, 3840, 2100, 0.30], [8, 3840, 2050, 0.34]], Tmap=9999, night=[[0, 0.55]], filter='grayscale(0.6) brightness(0.8)',
         cells=[dict(mode='lat', t0=-100, dur=1, col='#eaf4ff', a=0.9)], polar=[[0, 0.9]], stars=[[0, 0.8]],
         rings=[[1.0, *GEO['ICELAND'], '#ffb030', 3], [1.3, *GEO['JAPAN'], '#ffb030', 3], [1.6, *GEO['YELLOWSTONE'], '#ffb030', 3]],
         texts=[[0.6, 3.6, '-273°C', 220, 470, '#cfeaff', 'rgba(140,210,255,0.9)', 30], [3.8, 7.7, 'THE COLDEST ANYTHING CAN EVER BE', 54, 540, '#ffffff', 'rgba(140,210,255,0.8)', 10]],
         flash=[0.4], parts=['snow', 90])
V.S(t + 0.35, 'braam', 0.9); V.S(t + 0.4, 'wind', 0.5); V.S(t + 3.8, 'thit', 0.6)
V.M(t + 0.3, t + 8, 'horror', 0, 0.5, 0.4, 0.4)
# cortes: el hielo se come ciudades
CC = [('CA', 1.6), ('RU', 1.0), ('NO', 1.8), ('US', 1.4), ('GB', 2.0), ('CN', 1.2), ('FR', 1.8), ('JP', 1.8), ('DE', 2.0), ('MX', 1.4), ('BR', 1.0), ('IN', 1.2), ('EG', 1.6)]
cuts = []
for i, (c, s) in enumerate(CC):
    x, y = cap(c); cuts.append(dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[x, y, s], T=40 + i * 6, cells=[dict(mode='lat', t0=0, dur=110, col='#eaf4ff', a=0.9, noise=0.25)], parts=['snow', 60], filter='saturate(0.8)', grade='rgba(80,160,255,0.25)'))
t = V.sc('cuts', 0.4 + len(CC) * 0.55 + 0.4, id='COLD_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'IT STARTED WITH', 110], [3.6, 7.9, 'ONE DEGREE.', 170, 540, '#9fdcff', 'rgba(120,200,255,0.8)']])
V.M(t, t + 7.6, 'frantic', 30, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8)
for i in range(len(CC)): V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.35); V.S(t + 0.45 + i * 0.55, 'wind', 0.12)
V.S(t + 3.6, 'thit', 0.8)
t = V.sc('title', 6.0, id='COLD_C', hard=True, bg='black', texts=[[0.2, 2.2, 'EVERY MONTH.', 130], [2.2, 4.0, '-1°C', 240, 520, '#9fdcff', 'rgba(120,200,255,0.9)', 20], [4.0, 6.0, 'UNTIL THERE IS NOTHING LEFT', 64, 540, '#ffffff', 'rgba(255,255,255,0.5)', 10]], flash=[2.2])
V.S(t + 0.2, 'braam2', 0.8); V.S(t + 2.2, 'thit', 0.9); V.S(t + 2.2, 'sub_drop', 0.6); V.S(t + 4.0, 'heartbeat', 0.7); V.S(t + 4.9, 'heartbeat', 0.7)
V.M(t, t + 6, 'tension', 50, 0.55, 0.2, 0.3)
t = V.sc('title', 8.5, id='COLD_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=9999, blur=2, filter='grayscale(0.4) brightness(0.75)',
         cells=[dict(mode='lat', t0=-100, dur=1, col='#eaf4ff', a=0.8)], polar=[[0, 0.6]], parts=['snow', 110], grad='radial-gradient(ellipse at 50% 80%, rgba(140,210,255,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF EARTH GOT', 250, 130], [0.5, '1°C COLDER EVERY MONTH?', 410, 120, '#9fe0ff']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.S(t + 0.35, 'boom_1', 0.5); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2)
mk(t + 8.5, 0)
TOP = dict(label='MONTH', kf=None, fmt='int')

# ======================= CAP 1: NADIE LO NOTA =======================
ICE = lambda: dict(mode='lat', t0=ICE_T0, dur=ICE_D, col='#eaf4ff', col2='#ffffff', a=0.88, pw=1.15, noise=0.12)
def map_(d, id, **kw):
    kw.setdefault('useThermo', True); return V.sc('map', d, id=id, **kw)
t = map_(12, 'M1', chap=[0.0, 2.6, 'CHAPTER 1', 'NOBODY NOTICES'], cam=[[0, 3840, 2050, 0.30], [12, 3900, 2000, 0.34]],
         caps=[[3.0, 6.8, 'Month 1. Earth is 1°C colder.', '1°C'], [7.2, 11.8, 'Nobody notices.', 'Nobody']])
V.chap_snd(t); V.M(t, t + 36, 'voyage', 0, 0.6, 1.0, 0.8); mk(t + 12, 1)
t = V.sc('balls', 9.5, id='B1', bg='sky', balls=[[K['US'], 440, 640, 240, 'shades'], [K['BR'], 960, 660, 220, 'normal'], [K['ES'], 1480, 640, 230, 'normal']],
         bubs=[[0.6, 0, 'Finally! No more heatwaves!'], [3.6, 1, 'Weird... it\'s cold in summer.'], [6.6, 2, 'Who cares? Beach day!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.5, 'birds', 0.3); mk(t + 9.5, 2)
t = V.sc('news', 15.0, id='N1', anchor=K['GB'], channel='WORLD NEWS 24', tvp=dict(cells=[dict(mode='lat', t0=-5, dur=400, col='#eaf4ff', a=0.85)]), cam=WORLD,
         bubs=[[1.2, 0, 'Breaking news.'], [3.4, 0, 'Earth lost 3°C in 3 months.'], [7.4, 0, 'Scientists have no explanation.'], [11.2, 0, 'And it is still dropping.']], fear=[[0, 0], [11, 1]],
         papers=[[5.4, 'THE GLOBE DAILY', 'IS THE SUN DIMMING?'], [9.4, 'WORLD EVENING POST', '-3°C AND FALLING']],
         ticker='BREAKING: GLOBAL TEMPERATURE DROPS 3°C IN 3 MONTHS  •  SCIENTISTS BAFFLED  •  SNOW REPORTED IN JULY  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs'])
for tt in [5.4, 9.4]: V.SV(t + tt, 'whoosh', 0.5); V.S(t + tt + 0.55, 'stamp_1', 0.6)
V.M(t, t + 15, 'newsroom', 0, 0.6, 0.3, 0.6); mk(t + 15, 3)
ICE_T0 = t + 15.0; ICE_D = 300.0   # el hielo avanza desde aquí hasta cubrirlo todo
t = map_(13, 'M2', cam=[[0, *P(-95, 55), 0.8], [6, *P(-95, 55), 0.9], [7, *P(60, 60), 0.75], [13, *P(60, 58), 0.8]], cells=[ICE()], parts=['snow', 40],
         pins=[[1.5, *P(-79.4, 43.7), 'SNOW IN JULY', '#5ab8ff'], [3.0, *P(-114, 51), '-8°C IN SUMMER', '#5ab8ff'], [8.0, *P(37.6, 55.7), 'FROZEN HARVEST', '#5ab8ff'], [9.6, *P(82.9, 55), 'RIVERS FREEZE', '#5ab8ff']],
         caps=[[0.6, 5.6, 'Month 4. It snows in Canada. In July.', 'July'], [7.2, 12.6, 'Siberia freezes for good.', 'freezes']])
V.S(t + 0.3, 'wind', 0.45); [V.S(t + x, 'ding', 0.25) for x in [1.5, 3.0, 8.0, 9.6]]; mk(t + 13, 5)
t = map_(11, 'M2B', cam=[[0, *P(-84, 45), 1.6], [11, *P(-84, 45), 1.9]], cells=[ICE()], parts=['snow', 70],
         pins=[[1.2, *P(-87.6, 41.9), 'CHICAGO -20°C', '#5ab8ff'], [2.6, *P(-79.4, 43.7), 'TORONTO -24°C', '#5ab8ff'], [4.0, *P(-73.6, 45.5), 'MONTREAL -27°C', '#5ab8ff']],
         stamps=[[6.4, 'THE GREAT LAKES FREEZE SOLID', 960, 480, '#5ab8ff', 72, -6]], caps=[[7.6, 10.8, 'Ships are trapped in the ice.', 'trapped']])
[V.S(t + x, 'ding', 0.25) for x in [1.2, 2.6, 4.0]]; V.S(t + 6.4, 'stamp_2', 0.7); V.S(t, 'wind', 0.4); mk(t + 11, 6)
V.M(t, t + 13, 'tension', 0, 0.55, 1.0, 0.8)

# ======================= CAP 2: PÁNICO =======================
t = map_(13, 'M3', chap=[0.0, 2.6, 'CHAPTER 2', 'PANIC'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 1950, 0.33]], cells=[ICE()],
         tints=[tint(NB, '#8a6a3a', [[2.6, 0], [6, 0.6]], 0.15)], counters=[[3.0, 'FOOD PRICES', [[3, 0], [12, 340]], 'int', '#ffb060']],
         caps=[[3.0, 7.6, 'Harvests fail everywhere.', 'Harvests fail'], [8.0, 12.6, 'Food prices explode.', 'explode']])
V.chap_snd(t); V.M(t, t + 50, 'tension', 20, 0.75, 0.6, 0.8); mk(t + 13, 7)
for i in range(10): V.S(t + 3.2 + i * 0.85, 'tick', 0.25)
t = V.sc('balls', 10.0, id='B2', bg='dark', balls=[[K['RU'], 400, 620, 220, 'angry'], [K['US'], 960, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['BR'], 1520, 620, 220, 'scared']],
         props=[['tv', 960, 300, 140, '#9fd4ff']], bubs=[[0.5, 0, 'It\'s a secret weapon!'], [3.4, 1, 'It\'s a HOAX!'], [6.4, 2, 'The sun is DYING!!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'glitch', 0.4); mk(t + 10, 8)
t = V.sc('call', 13.0, id='C1', ks=ks('US', 'CN', 'RU', 'IN'), banner='EMERGENCY SUMMIT', acc=['tie', 'tie', 'general', 'tie'], eyes=['scared', 'angry', 'angry', 'scared'],
         bubs=[[1.0, 0, 'We need a plan.'], [3.4, 1, 'Giant mirrors in space!'], [6.0, 2, 'Burn everything for heat!'], [8.8, 3, 'There is no plan...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'glitch', 0.4); mk(t + 13, 9)
t = map_(11, 'PLANA', cam=[[0, 3840, 1900, 0.3], [11, 3840, 1900, 0.32]], cells=[ICE()],
         icons=[[1.0, *P(-80.6, 28.5), 'missile', '#ffffff', 60], [1.4, *P(63.3, 45.9), 'missile', '#ffffff', 60], [1.8, *P(100.3, 41), 'missile', '#ffffff', 60]],
         banners=[[0.4, 3.6, 'PLAN A: GIANT MIRRORS IN SPACE', '#2a5ad8']], stamps=[[5.2, 'FAILED', 960, 480, '#ff3b30', 140]], caps=[[6.4, 10.6, 'The mirrors can\'t catch enough sunlight.', 'can\'t']])
V.S(t + 1.0, 'launch', 0.5); V.S(t + 5.2, 'stamp_3', 0.8); V.S(t + 5.2, 'sub_drop', 0.5); mk(t + 11, 10)
t = map_(11, 'PLANB', cam=[[0, *P(-60, -5), 0.7], [11, *P(20, 0), 0.6]], cells=[ICE()], tints=[tint(ks('BR', 'CD', 'CO', 'PE', 'CG', 'CM', 'GA', 'VE', 'BO'), '#ff6a1a', [[1.0, 0], [3.0, 0.6]], 0.2)],
         parts=['ember', 60], banners=[[0.4, 3.6, 'PLAN B: BURN THE RAINFORESTS FOR HEAT', '#c3100a']], stamps=[[6.0, 'IT BARELY HELPS', 960, 480, '#ff3b30', 100]],
         caps=[[7.0, 10.6, 'The smoke only blocks more sunlight.', 'blocks more sunlight']])
V.S(t + 1.0, 'braam3', 0.4); V.S(t + 6.0, 'stamp_3', 0.8); mk(t + 11, 11)
RIOTS = [city('US', 'New York'), city('FR', 'Paris'), city('GB', 'London'), city('DE', 'Berlin'), city('RU', 'Moscow'), city('CN', 'Beijing'), city('JP', 'Tokyo'), city('CA', 'Toronto'), city('PL', 'Warsaw'), city('KR', 'Seoul')]
t = map_(14, 'M4', cam=[[0, 3840, 1700, 0.34], [14, 3840, 1750, 0.38]], cells=[ICE()], parts=['snow', 50],
         pins=[[1.0 + i * 0.6, *RIOTS[i], None, '#ff3b30'] for i in range(len(RIOTS))], rings=[[1.0 + i * 0.6, *RIOTS[i], '#ff3b30', 2] for i in range(len(RIOTS))],
         stamps=[[8.4, 'STATE OF EMERGENCY', 960, 480, '#ff3b30', 90]], counters=[[1.0, 'CITIES IN RIOT', [[1, 0], [8, 1840]], 'int', '#ff9a8a']],
         caps=[[0.6, 5.4, 'Month 12. Riots in every major city.', 'Riots'], [9.6, 13.6, 'Governments lose control.', 'lose control']])
for i in range(10): V.SV(t + 1.0 + i * 0.6, 'hit', 0.3, random.uniform(-0.6, 0.6))
V.S(t + 8.4, 'stamp_3', 0.8); V.S(t + 1.0, 'crowd', 0.4); V.S(t + 6.0, 'crowd', 0.35); mk(t + 14, 12)
t = V.sc('bignum', 5.5, id='BN1', hard=False, kf=[[0, 15], [3.5, 3]], fmt='temp', top='ONE YEAR LATER', label=[2.5, 'A NORMAL WINTER DAY. IN SUMMER.', '#9fdcff'], col='#cfeaff', glow='rgba(120,200,255,0.9)', bgc='radial-gradient(ellipse, #0a2a4a, #000 70%)')
V.S(t + 0.1, 'thit', 0.8); [V.S(t + 0.2 + i * 0.3, 'tick', 0.4) for i in range(12)]; mk(t + 5.5, 12)

# ======================= CAP 3: LA GRAN MIGRACIÓN =======================
MIG = [[P(-100, 45), P(-100, 20)], [P(-80, 42), P(-60, -10)], [P(10, 50), P(15, 10)], [P(-3, 52), P(-5, 15)], [P(40, 56), P(70, 25)], [P(90, 55), P(80, 22)], [P(120, 42), P(110, 5)], [P(30, 60), P(35, 15)]]
t = map_(15, 'M5', chap=[0.0, 2.6, 'CHAPTER 3', 'THE GREAT MIGRATION'], cam=[[0, 3840, 2050, 0.27], [15, 3840, 2050, 0.29]], cells=[ICE()], polar=[[0, 0.1], [9999, 0.1]],
         arrows=[[3.0 + i * 0.5, 5.6 + i * 0.5, *a, *b, '#ffd23f', 22] for i, (a, b) in enumerate(MIG)], counters=[[3.0, 'CLIMATE REFUGEES', [[3, 0], [13, 1.4e9]], 'big', '#ffd23f']],
         caps=[[3.0, 8.0, 'Year 2. The north is uninhabitable.', 'uninhabitable'], [8.4, 14.6, 'Billions flee to the equator.', 'Billions']])
V.chap_snd(t); V.M(t, t + 54, 'drive', 0, 0.75, 0.6, 0.8); mk(t + 15, 16)
RK = [('ID', 22), ('BR', 21), ('CO', 20), ('NG', 19), ('KE', 18), ('IN', 17), ('TH', 18), ('MY', 21), ('VE', 19), ('CD', 20)]
t = V.sc('rank', 10.0, id='RK1', title='WARMEST COUNTRIES LEFT · YEAR 2', rows=[[K[c], [[0, v + 6], [10, v - 4]]] for c, v in RK], fmt='temp', n=8, col='linear-gradient(90deg, #ff9a2a, #ffd23f)')
V.S(t + 0.2, 'whoosh_6', 0.5); [V.S(t + 0.3 + i * 0.1, 'tick', 0.3) for i in range(8)]; mk(t + 10, 17)
for i in range(len(MIG)): V.SV(t + 3.0 + i * 0.5, 'whoosh', 0.3); V.S(t + 3.0, 'crowd', 0.35)
SOUTH = ks('MX', 'BR', 'CO', 'NG', 'CD', 'KE', 'ET', 'IN', 'ID', 'TH', 'VN', 'EG', 'SA', 'MY', 'PE', 'VE')
t = map_(12, 'M6', cam=[[0, 3840, 2300, 0.3], [12, 3840, 2300, 0.33]], cells=[ICE()], tints=[tint(SOUTH, '#ff3b30', [[0.8, 0], [1.4, 0.4]], 0.18, stroke='#ffffff')],
         pins=[[1.0 + i * 0.35, *cap(codes[k]), 'CLOSED', '#ff3b30'] for i, k in enumerate(SOUTH[:9])], stamps=[[6.0, 'BORDERS CLOSED', 960, 520, '#ff3b30', 110]],
         caps=[[0.6, 5.6, 'The warm countries close their borders.', 'close their borders'], [7.0, 11.6, 'There is not enough room for everyone.', 'not enough room']])
for i in range(9): V.S(t + 1.0 + i * 0.35, 'stamp_%d' % (1 + i % 3), 0.35)
V.S(t + 6.0, 'stamp_3', 0.8); mk(t + 12, 18)
t = V.sc('balls', 10.0, id='B3', bg='desert', balls=[[K['FR'], 480, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['NG'], 1440, 640, 240, 'angry']],
         props=[['military-fort', 960, 560, 200, '#cfb48a']], bubs=[[0.5, 0, 'Please, let us in!'], [3.4, 1, 'We have no room!'], [6.4, 0, 'Then we\'ll come anyway.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 6.4, 'braam', 0.5); mk(t + 10, 19)
t = V.sc('call', 12.0, id='C2', ks=ks('BR', 'NG', 'IN', 'ID'), banner='THE EQUATOR SUMMIT', bcol='#b86a10', bg=['gold', 'gold', 'gold', 'gold'], eyes=['scared', 'angry', 'scared', 'angry'],
         bubs=[[0.8, 0, 'Two billion people want in.'], [3.6, 1, 'We can\'t feed them all.'], [6.4, 2, 'Then who gets in?'], [9.0, 3, 'Whoever can pay.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'glitch', 0.4); mk(t + 12, 20)
# guerra por el calor
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
WARA = [[P(10, 48), P(5, 33)], [P(-100, 40), P(-100, 22)], [P(40, 55), P(68, 38)], [P(115, 40), P(105, 18)], [P(30, 50), P(38, 20)]]
t = map_(16, 'M7', cam=[[0, 3840, 1900, 0.3], [8, 3500, 1750, 0.4], [16, 3840, 1900, 0.32]], cells=[ICE()], war=True,
         arrows=[[2.6 + i * 0.7, 6.0 + i * 0.7, *a, *b, '#ff3b30', 28] for i, (a, b) in enumerate(WARA)], banners=[[0.6, 3.6, 'THE WAR FOR WARMTH', '#c3100a']],
         stamps=[[11.0, 'THE SOUTH IS INVADED', 960, 520, '#ff3b30', 96]], caps=[[4.0, 9.6, 'The frozen north invades the south.', 'invades'], [11.6, 15.6, 'Millions die for a little warmth.', 'Millions']])
for i, (a, b) in enumerate(WARA):
    for j in range(6):
        tt = t + 4.0 + i * 0.7 + j * 0.7; x, y = b[0] + random.randint(-90, 90), b[1] + random.randint(-70, 70)
        WAR['fx'].append([round(tt, 2), x, y, 70, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 8, 2), x, y])
        V.SV(tt, 'boom', 0.35, random.uniform(-0.6, 0.6))
V.S(t + 0.6, 'braam2', 0.6); V.S(t + 11.0, 'stamp_3', 0.8); mk(t + 16, 24)
V.M(t, t + 16.4, 'frantic', 10, 0.8, 0.4, 0.6)
POP = []   # % humanidad
def popk(tt, pct): POP.append([round(tt, 2), pct])
popk(0, 100); popk(t, 99)
t = map_(13, 'M8', cam=[[0, 3840, 2100, 0.27], [13, 3840, 2100, 0.28]], cells=[ICE()], polar=[[0, 0.15], [9999, 0.15]], useBar=True, barIn=0.4,
         caps=[[0.6, 5.6, 'Year 2.5. The oceans start to freeze.', 'oceans'], [6.6, 12.6, '1 billion people are already gone.', '1 billion']])
popk(t + 13, 87); V.S(t + 0.4, 'sub_drop', 0.6); V.S(t + 1.0, 'wind', 0.5); mk(t + 13, 30)

# ======================= CAP 4: BAJO TIERRA =======================
SH = []
rng = V.rng
WEIGHT = [('US', 90), ('CN', 110), ('RU', 70), ('IN', 70), ('DE', 25), ('FR', 25), ('GB', 22), ('JP', 40), ('BR', 40), ('CA', 25), ('KR', 22), ('IT', 18), ('ES', 15), ('MX', 25), ('ID', 30), ('TR', 15), ('IR', 15), ('PL', 12), ('UA', 12),
          ('AU', 16), ('AR', 10), ('ZA', 10), ('EG', 12), ('NG', 14), ('SE', 10), ('NO', 8), ('FI', 10), ('CH', 12), ('IS', 8), ('NZ', 8), ('KZ', 10), ('SA', 10), ('PK', 14), ('TH', 12), ('VN', 12), ('CL', 8), ('ET', 8), ('KE', 6)]
t_sh = None
t = map_(14, 'M9', chap=[0.0, 2.6, 'CHAPTER 4', 'UNDERGROUND'], cam=[[0, 3840, 2050, 0.27], [14, 3840, 2050, 0.3]], cells=[ICE()], polar=[[0, 0.22], [9999, 0.22]], useBar=True, shelters=dict(col='#ffb030'),
         caps=[[3.0, 8.0, 'Year 3. Everyone starts digging.', 'digging'], [8.4, 13.6, 'Mines, metros, basements, bunkers.', 'bunkers']])
t_sh = t
V.chap_snd(t); V.M(t, t + 52, 'nocturne', 0, 0.7, 1.0, 0.8); mk(t + 14, 38); popk(t + 14, 72)
for i in range(40): V.S(t + 2.6 + i * 0.25, 'tick', 0.15)
t = map_(13, 'M10', cam=[[0, 3840, 2000, 0.28], [13, 3840, 2000, 0.3]], cells=[ICE()], polar=[[0, 0.3], [9999, 0.3]], useBar=True, shelters=dict(col='#ffb030'),
         rings=[[0.8 + i * 0.6, *xy, '#ff8a1a', 3] for i, (n, xy) in enumerate(GEO.items())], pins=[[0.8 + i * 0.6, *xy, n, '#ff8a1a'] for i, (n, xy) in enumerate(GEO.items())],
         caps=[[0.6, 5.6, 'Volcanoes become the new cities.', 'Volcanoes'], [6.6, 12.6, 'Heat from below is the only heat left.', 'from below']])
for i in range(len(GEO)): V.S(t + 0.8 + i * 0.6, 'ding', 0.25)
mk(t + 13, 46); popk(t + 13, 55)
t = map_(12, 'SAHARA', cam=[[0, *P(10, 22), 0.9], [12, *P(15, 20), 1.0]], cells=[ICE()], parts=['snow', 90],
         pins=[[1.2, *P(31.2, 30.0), 'CAIRO -35°C', '#5ab8ff'], [2.4, *P(-7.6, 33.6), 'CASABLANCA -32°C', '#5ab8ff'], [3.6, *P(3.4, 6.5), 'LAGOS -18°C', '#5ab8ff']],
         stamps=[[5.4, 'THE SAHARA IS WHITE', 960, 480, '#9fdcff', 90]], caps=[[6.6, 11.6, 'Year 5. Snow covers the desert.', 'desert']])
[V.S(t + x, 'ding', 0.25) for x in [1.2, 2.4, 3.6]]; V.S(t + 5.4, 'stamp_2', 0.7); mk(t + 12, 50); popk(t + 12, 50)
t = V.sc('news', 14.0, id='N2', anchor=K['GB'], channel='WORLD NEWS 24 · LAST BROADCAST', tvp=dict(cells=[dict(mode='lat', t0=-100, dur=1, col='#eaf4ff', a=0.9)], filter='brightness(0.7)'), cam=WORLD,
         bubs=[[1.0, 0, 'This is our final broadcast.'], [4.4, 0, 'The power grid is gone.'], [7.8, 0, 'Stay underground.'], [10.6, 0, 'Good luck... to all of us.']], fear=[[0, 1]],
         ticker='FINAL BROADCAST  •  -60°C  •  STAY UNDERGROUND  •  CONSERVE HEAT  •  ')
V.S(t, 'news_sting', 0.5); V.talk(t, V.SC[-1][3]['bubs']); mk(t + 14, 54); popk(t + 14, 45)
t = map_(12, 'M11', cam=[[0, 3840, 1850, 0.3], [12, 3840, 1850, 0.33]], cells=[ICE()], polar=[[0, 0.38], [9999, 0.38]], useBar=True, shelters=dict(col='#ffb030'),
         icons=[[0.8 + i * 0.4, *xy, 'radar-sweep', '#7dff7a', 40] for i, xy in enumerate(NUKE)], caps=[[0.6, 5.6, 'Nuclear plants become giant heaters.', 'Nuclear plants'], [6.4, 11.6, 'Whoever has a reactor, lives.', 'reactor']])
for i in range(len(NUKE)): V.S(t + 0.8 + i * 0.4, 'beep_hi', 0.2)
mk(t + 12, 58); popk(t + 12, 38)
t = V.sc('balls', 10.0, id='B4', bg='bunker', balls=[[K['IS'], 640, 640, 230, 'scared'], [K['NO'], 1280, 640, 230, 'normal']], parts=['dust', 30],
         bubs=[[0.6, 0, 'How long can we last down here?'], [4.0, 1, 'Fifteen years...'], [6.8, 1, 'If the reactor holds.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'hum', 0.4); mk(t + 10, 66); popk(t + 10, 25)
t = map_(14, 'M12', cam=[[0, 3840, 2050, 0.28], [14, 3840, 2050, 0.3]], cells=[ICE()], polar=[[0, 0.5], [9999, 0.5]], useBar=True, shelters=dict(col='#ffb030'),
         parts=['snow', 120], tint2='rgba(160,120,255,0.18)', banners=[[2.6, 7.0, 'IT SNOWS DRY ICE', '#5a3ab8']],
         caps=[[0.6, 2.4, 'Year 8. -78°C.', '-78°C'], [7.6, 13.6, 'The air itself starts to freeze.', 'air itself']])
V.S(t + 2.6, 'stamp_2', 0.7); V.S(t + 2.6, 'braam3', 0.5); V.S(t + 0.4, 'wind', 0.6); mk(t + 14, 93); popk(t + 14, 6)
t = V.sc('bignum', 5.5, id='BN2', kf=[[0, 8.2e9], [3.5, 4.9e8]], fmt='big', top='PEOPLE STILL ALIVE', label=[2.8, '6% OF HUMANITY', '#ff3b30'])
V.S(t + 0.1, 'thit', 0.8); V.S(t + 0.2, 'heartbeat', 0.7); V.S(t + 1.4, 'heartbeat', 0.7); mk(t + 5.5, 96)

# ======================= CAP 5: CAEN LOS BÚNKERES =======================
t = map_(16, 'M13', chap=[0.0, 2.6, 'CHAPTER 5', 'THE BUNKERS FALL'], cam=[[0, 3840, 2050, 0.28], [16, 3840, 2050, 0.3]], cells=[ICE()], polar=[[0, 0.6], [9999, 0.6]], useBar=True, shelters=dict(col='#ffb030'),
         filter='brightness(0.85)', caps=[[3.0, 8.0, 'Year 9. Fuel runs out. Reactors fail.', 'Reactors fail'], [8.6, 15.6, 'One by one, the lights go out.', 'lights go out']])
t_die0 = t + 2.6
V.chap_snd(t); V.M(t, t + 58, 'horror', 0, 0.65, 1.0, 1.0); mk(t + 16, 120); popk(t + 16, 3.2)
t = map_(12, 'M14', cam=[[0, *P(15, 50), 1.2], [12, *P(15, 50), 1.35]], cells=[ICE()], polar=[[0, 0.62], [9999, 0.62]], useBar=True, shelters=dict(col='#ffb030', size=1.4), filter='brightness(0.85)',
         stamps=[[3.0, 'REACTOR FAILED', 700, 420, '#ff3b30', 70], [5.2, 'FROZEN', 1250, 560, '#9fdcff', 70], [7.4, 'NO FOOD', 900, 700, '#ff3b30', 70]],
         caps=[[0.6, 4.6, 'Europe goes dark.', 'dark'], [8.6, 11.6, 'Whole cities freeze in their bunkers.', 'freeze']])
for x in [3.0, 5.2, 7.4]: V.S(t + x, 'stamp_3', 0.6)
mk(t + 12, 150); popk(t + 12, 1.6)
t = map_(12, 'AMERICAS', cam=[[0, *P(-90, 35), 0.75], [12, *P(-75, 10), 0.6]], cells=[ICE()], polar=[[0, 0.65], [9999, 0.65]], useBar=True, shelters=dict(col='#ffb030', size=1.3), filter='brightness(0.8)',
         caps=[[0.6, 5.6, 'The Americas go dark.', 'dark'], [6.4, 11.6, 'Only Yellowstone still glows.', 'Yellowstone']], rings=[[6.4, *GEO['YELLOWSTONE'], '#ff8a1a', 3]])
mk(t + 12, 165); popk(t + 12, 1.1)
t = V.sc('balls', 10.0, id='B6', bg='bunker', balls=[[K['DE'], 560, 640, 220, 'angry'], [K['PL'], 1360, 640, 220, 'angry']], props=[['artillery-shell', 960, 760, 110, '#ffb030']],
         bubs=[[0.6, 0, 'That fuel is OURS!'], [3.4, 1, 'You\'ll freeze without it? GOOD.']], fx=[[6.0, 900, 520], [6.6, 1000, 540], [7.2, 950, 500]])
V.talk(t, V.SC[-1][3]['bubs']); [V.SV(t + x, 'hit', 0.5) for x in [6.0, 6.6, 7.2]]; mk(t + 10, 170)
t = map_(13, 'M15', cam=[[0, 3840, 2050, 0.28], [13, 3840, 2050, 0.29]], cells=[ICE()], polar=[[0, 0.75], [9999, 0.75]], useBar=True, shelters=dict(col='#ffb030'), filter='brightness(0.7) saturate(0.6)',
         parts=['snow', 140], tint2='rgba(80,140,255,0.3)', stars=[[0, 0.2], [9999, 0.2]], banners=[[2.4, 6.6, 'IT RAINS LIQUID OXYGEN', '#2a5ad8']],
         caps=[[0.6, 2.2, 'Year 16. -183°C.', '-183°C'], [7.4, 12.6, 'The sky begins to fall... as rain.', 'as rain']])
V.S(t + 2.4, 'stamp_2', 0.7); V.S(t + 2.4, 'braam2', 0.5); mk(t + 13, 198); popk(t + 13, 0.4)
t = V.sc('balls', 10.0, id='B5', bg='night', balls=[[K['IS'], 560, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['JP'], 1360, 640, 230, 'normal', 'none', 4.4]], props=[['walkie-talkie', 760, 520, 90, '#cfd8e8']],
         bubs=[[0.6, 0, 'Is anyone... still out there?'], [5.0, 1, '...We\'re here. We\'re alive.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'static', 0.5); V.S(t + 4.4, 'static', 0.4); mk(t + 10, 206); popk(t + 10, 0.3)
t = map_(14, 'M16', cam=[[0, 3840, 2050, 0.27], [14, 3840, 2050, 0.28]], cells=[ICE()], polar=[[0, 0.85], [9999, 0.85]], useBar=True, shelters=dict(col='#ffb030'), filter='brightness(0.55) saturate(0.4)',
         stars=[[0, 0.3], [14, 0.9]], night=[[0, 0.3], [14, 0.6]], banners=[[2.4, 6.6, 'THE SKY IS GONE', '#14141c']],
         caps=[[0.6, 2.2, 'Year 17. -196°C.', '-196°C'], [7.4, 13.6, 'The atmosphere collapses into lakes of liquid air.', 'liquid air']])
V.S(t + 2.4, 'sub_drop', 0.7); V.S(t + 0.5, 'wind', 0.4); mk(t + 14, 212); popk(t + 14, 0.2)

# ======================= CAP 6: CERO ABSOLUTO =======================
t = map_(16, 'M17', chap=[0.0, 2.6, 'CHAPTER 6', 'ABSOLUTE ZERO'], cam=[[0, 3840, 2050, 0.27], [16, 3840, 2050, 0.27]], cells=[ICE()], polar=[[0, 0.9], [9999, 0.9]], useBar=True, shelters=dict(col='#ffb030'),
         filter='brightness(0.45) saturate(0.3)', stars=[[0, 1]], night=[[0, 0.55]], rings=[[3.0 + i * 0.5, *xy, '#ffb030', 3] for i, xy in enumerate(GEO.values())],
         counters=[[3.0, 'SHELTERS STILL ALIVE', [[3, 140], [15, 23]], 'int', '#ffb030']], caps=[[3.0, 8.4, 'Year 22. Only the volcano bunkers remain.', 'volcano bunkers'], [9.0, 15.6, 'Heat from the Earth\'s core keeps them alive.', 'core']])
V.chap_snd(t); V.M(t, t + 46, 'ambient', 20, 0.65, 1.2, 1.5); mk(t + 16, 270); popk(t + 16, 0.12)
t = V.sc('rank', 10.0, id='RK2', title='LAST SHELTERS STANDING · YEAR 22', rows=[[K['IS'], [[0, 9], [10, 7]], 'ICELAND'], [K['US'], [[0, 6], [10, 4]], 'YELLOWSTONE'], [K['JP'], [[0, 6], [10, 5]], 'JAPAN'], [K['RU'], [[0, 3], [10, 2]], 'KAMCHATKA'], [K['NZ'], [[0, 3], [10, 3]], 'NEW ZEALAND'], [K['ET'], [[0, 2], [10, 1]], 'ETHIOPIA'], [K['ID'], [[0, 2], [10, 1]], 'INDONESIA']],
         fmt='int', unit=' shelters', col='linear-gradient(90deg, #ff8a1a, #ffd23f)')
V.S(t + 0.2, 'whoosh_6', 0.5); mk(t + 10, 274)
t = V.sc('bignum', 8.0, id='BN3', kf=[[0, -255], [6, -273.15]], fmt='temp', top='YEAR 24', label=[4.5, 'ABSOLUTE ZERO', '#9fdcff'], col='#e8f6ff', glow='rgba(140,210,255,1)', bgc='radial-gradient(ellipse, #0a1830, #000 70%)')
V.S(t + 0.1, 'braam', 0.8); [V.S(t + 0.3 + i * 0.35, 'tick', 0.5) for i in range(16)]; V.S(t + 6.0, 'thit', 0.9); V.S(t + 6.1, 'tinnitus', 0.25); mk(t + 8, 288)
t = map_(14, 'M18', cam=[[0, 3840, 2050, 0.27], [14, 3840, 2000, 0.3]], cells=[ICE()], polar=[[0, 0.92], [9999, 0.92]], useBar=True, shelters=dict(col='#ffb030'), filter='brightness(0.4) saturate(0.2)',
         stars=[[0, 1]], night=[[0, 0.6]], rings=[[0.4 + i * 0.3, *xy, '#ffb030', 3] for i, xy in enumerate(GEO.values())],
         stamps=[[1.0, 'THE COLDEST ANYTHING CAN EVER BE', 960, 380, '#9fdcff', 64, 0], [5.0, '...AND THEY\'RE STILL ALIVE.', 960, 560, '#ffb030', 78, 0]])
V.S(t + 1.0, 'stamp_2', 0.6); V.S(t + 5.0, 'braam3', 0.6); mk(t + 14, 288)
t = V.sc('end', 12.0, id='END', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], cells=[ICE()], polar=[[0, 0.92], [9999, 0.92]], filter='brightness(0.5) saturate(0.3)', stars=[[0, 1]],
         lines=[[0.8, 'WOULD YOU SURVIVE?', 300, 120, 99, '#9fe0ff']], ask=[2.6, 'Tell us where you\'d hide 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4); V.S(t + 5.0, 'stinger_win', 0.2)

# ======================= datos globales =======================
# fija los cfg de hielo con el t0 real (las escenas anteriores a ICE_T0 no lo usan)
# refugios: aparecen en M9, mueren entre M13 y M17; sobreviven los cercanos a volcanes
geo = list(GEO.values())
for c, n in WEIGHT:
    if c not in K: continue
    for (x, y) in sample_in(rng, c, n):
        ta = t_sh + 2.6 + rng.uniform(0, 9.5)
        near = min(math.hypot(x - g[0], y - g[1]) for g in geo) < 260
        td = -1 if (near and rng.random() < 0.7) else round(t_die0 + rng.uniform(0, 1) ** 0.8 * 70, 2)
        if not near and rng.random() < 0.04: td = round(t_die0 + 60 + rng.uniform(0, 30), 2)
        SH.append([x, y, round(ta, 2), td])
V.extra['shelters'] = SH
V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='MONTH', kf=MK, fmt='int'), thermo=dict(kf=tempkf(), min=-273, max=30, label='GLOBAL AVERAGE'),
                      bar=dict(label='HUMANITY ALIVE', kf=POP, sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
