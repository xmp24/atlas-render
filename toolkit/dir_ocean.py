"""Vídeo 2: What If the Oceans Rose 1 Meter Every Week — el mar se come el mapa según la altitud real."""
from wsim import *
V = Vid('ocean', seed=22)
WK = []; LV = []; POP = []
def wk(t, w): WK.append([round(t, 2), w])
def lv(t, L): pass   # el nivel se deriva de la semana al exportar
def popk(t, p): POP.append([round(t, 2), p])
SEA = '#2f78c8'
FLOOD = lambda: dict(mode='flood', col=SEA, a=0.95, lvl=LV)   # LV se completa al final (misma lista)
def map_(d, id, **kw):
    kw.setdefault('cells', [FLOOD()]); return V.sc('map', d, id=id, **kw)
CITIES = {'NEW YORK': P(-74, 40.7), 'MIAMI': P(-80.2, 25.8), 'LONDON': P(-0.1, 51.5), 'AMSTERDAM': P(4.9, 52.4), 'VENICE': P(12.3, 45.4), 'SHANGHAI': P(121.5, 31.2), 'TOKYO': P(139.7, 35.7),
          'MUMBAI': P(72.9, 19.1), 'DHAKA': P(90.4, 23.8), 'RIO': P(-43.2, -22.9), 'ALEXANDRIA': P(29.9, 31.2), 'JAKARTA': P(106.8, -6.2), 'BANGKOK': P(100.5, 13.75), 'LAGOS': P(3.4, 6.5)}
HIGH = {'TIBET': P(88, 32), 'ANDES': P(-68, -17), 'ETHIOPIA': P(39, 9), 'ROCKIES': P(-106, 39), 'ALPS': P(9, 46.5), 'HIMALAYA': P(84, 28.5), 'IRAN': P(52, 33), 'MEXICO HIGHLANDS': P(-101, 21)}

# ======================= TRÁILER =======================
t = V.sc('title', 8.0, id='O_A', hard=True, cam=[[0, 3840, 2100, 0.28], [8, 3840, 2050, 0.31]], Tmap=99999, cells=[dict(mode='flood', col=SEA, a=0.97, lvl=[[0, 520]])],
         texts=[[0.6, 3.8, 'THIS IS EARTH.', 140, 470], [4.0, 7.8, 'EIGHT YEARS FROM NOW.', 90, 480, '#7ad0ff', 'rgba(90,180,255,0.8)']], flash=[0.4], parts=['dust', 30])
V.S(t + 0.35, 'braam', 0.9); V.S(t + 4.0, 'thit', 0.7); V.M(t + 0.3, t + 8, 'horror', 30, 0.5, 0.4, 0.4)
cuts = []; names = list(CITIES)
for i, n in enumerate(names[:12]):
    x, y = CITIES[n]; cuts.append(dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[x, y, 2.2], T=0, cells=[dict(mode='flood', col=SEA, a=0.97, lvl=[[0, 10], [0.55, 70]])],
                                       pins=[[0, x, y, n, '#ff3b30']], grade='rgba(40,120,255,0.25)'))
t = V.sc('cuts', 0.4 + 12 * 0.55 + 0.4, id='O_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'ONE METER.', 150], [3.6, 7.4, 'EVERY WEEK.', 150, 540, '#7ad0ff', 'rgba(90,180,255,0.8)']])
V.M(t, t + 7.4, 'frantic', 30, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8)
for i in range(12): V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3); V.S(t + 0.45 + i * 0.55, 'far_%d' % (1 + i % 8), 0.2)
V.S(t + 3.6, 'thit', 0.8)
t = V.sc('title', 8.5, id='O_C', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=99999, blur=2, cells=[dict(mode='flood', col=SEA, a=0.95, lvl=[[0, 160]])],
         grad='radial-gradient(ellipse at 50% 85%, rgba(90,180,255,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF THE OCEANS ROSE', 250, 120], [0.5, '1 METER EVERY WEEK?', 400, 130, '#7ad0ff']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2)
wk(t + 8.5, 0); lv(t + 8.5, 0); popk(0, 100)

# ======================= CAP 1: LOS PRIMEROS METROS =======================
t = map_(12, 'O1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE FIRST METERS'], cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.33]],
         caps=[[3.0, 7.0, 'Week 1. The sea rises one meter.', 'one meter'], [7.4, 11.8, 'Beaches vanish overnight.', 'vanish']])
V.chap_snd(t); V.M(t, t + 40, 'voyage', 0, 0.6, 1.0, 0.8); wk(t + 12, 1); lv(t + 12, 2)
ISL = [('MV', P(73.5, 3.2)), ('TV', P(179.2, -8.5)), ('KI', P(173, 1.4)), ('MH', P(171, 7.1))]
t = map_(12, 'O2', cam=[[0, *P(110, 5), 0.55], [12, *P(130, 3), 0.5]], tints=[tint([K[c] for c, _ in ISL if c in K], SEA, [[2.0, 0], [5.0, 1]], 0.6)],
         pins=[[1.0 + i * 0.7, *xy, NAMES[K[c]].upper() if c in K else c, '#ff3b30'] for i, (c, xy) in enumerate(ISL)], stamps=[[6.0, 'ISLAND NATIONS: GONE', 960, 480, '#ff3b30', 100]],
         caps=[[0.6, 5.4, 'Week 3. The first countries disappear.', 'disappear'], [7.4, 11.6, 'Maldives. Tuvalu. Kiribati.', '']])
V.S(t + 6.0, 'stamp_3', 0.8); [V.S(t + 1.0 + i * 0.7, 'ding', 0.3) for i in range(4)]; wk(t + 12, 3); lv(t + 12, 5)
t = V.sc('balls', 9.5, id='OB1', bg='water', balls=[[K['MV'] if 'MV' in K else K['ID'], 960, 600, 260, 'scared', 'none', None, None, {'tears': True}]],
         bubs=[[0.6, 0, 'My whole country...'], [3.6, 0, '...is under the sea.']], props=[['palm-tree', 1300, 560, 140, '#3ad16a']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'wind', 0.3); wk(t + 9.5, 4); lv(t + 9.5, 7)
t = V.sc('news', 15.0, id='ON1', anchor=K['GB'], tvp=dict(cells=[dict(mode='flood', col=SEA, a=0.95, lvl=[[0, 30]])]), cam=[*CITIES['MIAMI'], 1.6],
         bubs=[[1.2, 0, 'Breaking news.'], [3.2, 0, 'Seas are rising one meter every week.'], [7.4, 0, 'Nobody knows where the water comes from.'], [11.4, 0, 'Coastal cities: evacuate.']],
         papers=[[5.4, 'THE GLOBE DAILY', '+5 METERS'], [9.4, 'COAST HERALD', 'MIAMI IS SINKING']], fear=[[0, 0], [11, 1]],
         ticker='BREAKING: SEA LEVEL +5 METERS IN 5 WEEKS  •  MIAMI, VENICE AND AMSTERDAM FLOODED  •  EVACUATE COASTAL AREAS  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 15, 'newsroom', 0, 0.6, 0.3, 0.6)
for tt in [5.4, 9.4]: V.SV(t + tt, 'whoosh', 0.5); V.S(t + tt + 0.55, 'stamp_1', 0.6)
wk(t + 15, 5); lv(t + 15, 9)

# ======================= CAP 2: LAS CIUDADES SE HUNDEN =======================
t = map_(13, 'O3', chap=[0.0, 2.6, 'CHAPTER 2', 'CITIES DROWN'], cam=[[0, *P(5, 52), 2.0], [13, *P(5, 52), 2.3]],
         pins=[[3.0, *CITIES['AMSTERDAM'], 'AMSTERDAM', '#ff3b30'], [4.0, *P(4.5, 51.9), 'ROTTERDAM', '#ff3b30'], [5.0, *P(4.4, 51.2), 'ANTWERP', '#ff3b30']],
         stamps=[[8.0, 'THE NETHERLANDS: 60% UNDERWATER', 960, 480, '#ff3b30', 70]], caps=[[3.0, 7.6, 'Week 8. The Netherlands loses its fight with the sea.', 'Netherlands']])
V.chap_snd(t); V.M(t, t + 54, 'tension', 0, 0.75, 0.6, 0.8); V.S(t + 8.0, 'stamp_3', 0.8); wk(t + 13, 8); lv(t + 13, 14)
t = map_(12, 'O4', cam=[[0, *P(-81, 27), 1.4], [12, *P(-80, 28), 1.6]], pins=[[1.0, *CITIES['MIAMI'], 'MIAMI', '#ff3b30'], [2.0, *P(-82.5, 27.9), 'TAMPA', '#ff3b30'], [3.0, *P(-90.1, 30), 'NEW ORLEANS', '#ff3b30']],
         counters=[[1.0, 'AMERICANS DISPLACED', [[1, 0], [11, 2.1e7]], 'big', '#7ad0ff']], caps=[[0.6, 5.0, 'Week 12. Florida is half gone.', 'Florida'], [6.0, 11.6, '21 million Americans flee north.', '21 million']])
wk(t + 12, 12); lv(t + 12, 20)
t = map_(12, 'O5', cam=[[0, *P(90, 23), 1.4], [12, *P(90, 23.5), 1.6]], pins=[[1.0, *CITIES['DHAKA'], 'DHAKA', '#ff3b30'], [2.0, *P(88.4, 22.6), 'KOLKATA', '#ff3b30']],
         counters=[[1.0, 'PEOPLE DISPLACED', [[1, 0], [11, 1.7e8]], 'big', '#ff9a8a']], stamps=[[6.4, 'BANGLADESH IS DROWNING', 960, 480, '#ff3b30', 90]],
         caps=[[0.6, 5.6, 'Week 18. 170 million people lose their homes.', '170 million']])
V.S(t + 6.4, 'stamp_3', 0.8); V.S(t + 1, 'crowd', 0.4); wk(t + 12, 18); lv(t + 12, 30)
t = map_(12, 'O5B', cam=[[0, *P(121.5, 31.2), 2.0], [6, *P(121.5, 31.2), 2.2], [6.5, *P(12.3, 45.4), 2.6], [12, *P(12.3, 45.4), 2.9]],
         stamps=[[3.0, 'SHANGHAI: 24 MILLION FLEE', 960, 480, '#ff3b30', 70], [9.0, 'VENICE IS GONE', 960, 480, '#ff3b30', 90]], caps=[[0.6, 5.6, 'Week 20. Shanghai goes under.', 'Shanghai'], [7.0, 11.6, 'Venice disappears forever.', 'forever']])
V.S(t + 3.0, 'stamp_3', 0.7); V.S(t + 9.0, 'stamp_3', 0.7); V.S(t + 6.2, 'whoosh_3', 0.4); wk(t + 12, 21)
LOST = [('NETHERLANDS', 'NL', 3), ('BANGLADESH', 'BD', 4), ('VIETNAM', 'VN', 5), ('EGYPT', 'EG', 6), ('UK', 'GB', 8), ('DENMARK', 'DK', 7), ('JAPAN', 'JP', 9), ('USA', 'US', 9)]
t = V.sc('rank', 10.0, id='ORK1', title='LAND LOST BY WEEK 25', rows=[[K[c], [[0, 0], [9, 100 - v * 8]], n] for n, c, v in LOST], fmt='int', unit='%', col='linear-gradient(90deg, #2f78c8, #7ad0ff)')
V.S(t + 0.2, 'whoosh_6', 0.5); wk(t + 10, 25); lv(t + 10, 40)
t = map_(13, 'O6', cam=[[0, *P(-74, 40.7), 2.2], [6.5, *P(-74, 40.7), 2.4], [7.0, *P(-0.1, 51.5), 2.4], [13, *P(-0.1, 51.5), 2.6]],
         stamps=[[3.4, 'NEW YORK FLOODED', 960, 480, '#ff3b30', 90], [9.6, 'LONDON FLOODED', 960, 480, '#ff3b30', 90]], caps=[[0.6, 5.6, 'Week 30. Subways become rivers.', 'Subways'], [7.4, 12.6, 'The Thames swallows London.', 'London']])
V.S(t + 3.4, 'stamp_3', 0.7); V.S(t + 9.6, 'stamp_3', 0.7); V.S(t + 6.8, 'whoosh_4', 0.4); wk(t + 13, 30); lv(t + 13, 50); popk(t + 13, 99)
t = map_(12, 'O6B', cam=[[0, *P(31, 30.5), 1.6], [12, *P(31, 30), 1.8]], pins=[[1.0, *CITIES['ALEXANDRIA'], 'ALEXANDRIA', '#ff3b30'], [2.0, *P(31.2, 30.0), 'CAIRO', '#ff3b30']],
         stamps=[[5.0, 'THE NILE DELTA IS SEA', 960, 480, '#ff3b30', 80]], counters=[[1.0, 'EGYPTIANS DISPLACED', [[1, 0], [10, 4.5e7]], 'big', '#ff9a8a']], caps=[[6.4, 11.6, 'Egypt loses its farmland. Famine begins.', 'Famine']])
V.S(t + 5.0, 'stamp_3', 0.7); wk(t + 12, 33)
t = V.sc('news', 14.0, id='ON2', anchor=K['GB'], channel='WORLD NEWS 24', tvp=dict(cells=[dict(mode='flood', col=SEA, a=0.95, lvl=[[0, 50]])]), cam=[3840, 2050, 0.28],
         bubs=[[1.0, 0, 'Sea level: plus 35 meters.'], [4.2, 0, 'Most coastal cities are lost.'], [7.6, 0, 'And it is not slowing down.'], [10.6, 0, 'Head for the mountains.']], fear=[[0, 1]],
         papers=[[5.0, 'THE GLOBE DAILY', '+35 METERS'], [9.0, 'MOUNTAIN TIMES', 'GO UP. NOW.']], ticker='SEA LEVEL +35 M  •  NEW YORK, LONDON, SHANGHAI ABANDONED  •  MOUNTAIN TOWNS OVERWHELMED  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.0, 9.0]]; wk(t + 14, 36)

# ======================= CAP 3: EL ÉXODO =======================
MIG = [[P(-75, 40), P(-95, 40)], [P(-80, 30), P(-100, 36)], [P(0, 51), P(8, 47)], [P(5, 52), P(10, 48)], [P(90, 23), P(86, 28)], [P(121, 31), P(105, 34)], [P(31, 31), P(38, 10)], [P(-43, -23), P(-50, -16)], [P(107, -6), P(110, -7.6)]]
t = map_(15, 'O7', chap=[0.0, 2.6, 'CHAPTER 3', 'THE GREAT EXODUS'], cam=[[0, 3840, 2050, 0.27], [15, 3840, 2050, 0.29]],
         arrows=[[3.0 + i * 0.45, 5.6 + i * 0.45, *a, *b, '#ffd23f', 22] for i, (a, b) in enumerate(MIG)], counters=[[3.0, 'PEOPLE ON THE MOVE', [[3, 2e8], [13, 1.2e9]], 'big', '#ffd23f']],
         caps=[[3.0, 8.0, 'Week 40. A billion people run for higher ground.', 'higher ground'], [8.6, 14.6, 'Mountains become the most valuable land on Earth.', 'Mountains']])
V.chap_snd(t); V.M(t, t + 60, 'drive', 0, 0.75, 0.6, 0.8); [V.SV(t + 3 + i * 0.45, 'whoosh', 0.3) for i in range(len(MIG))]; V.S(t + 3, 'crowd', 0.35)
wk(t + 15, 40); lv(t + 15, 66); popk(t + 15, 97)
t = V.sc('call', 13.0, id='OC1', ks=ks('US', 'CN', 'IN', 'GB'), banner='EMERGENCY SUMMIT', eyes=['scared', 'angry', 'scared', 'scared'], acc=['tie', 'tie', 'tie', 'tie'],
         bubs=[[1.0, 0, 'Build sea walls!'], [3.4, 1, 'Walls won\'t stop this!'], [6.0, 2, 'Then move the capitals.'], [8.8, 3, 'London is already underwater...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'glitch', 0.4); wk(t + 13, 44); lv(t + 13, 72)
NEWCAP = [[P(-77, 38.9), P(-104.9, 39.7), 'DENVER'], [P(-0.1, 51.5), P(-3.2, 55.9), 'EDINBURGH'], [P(139.7, 35.7), P(138.2, 36.6), 'NAGANO'], [P(116.4, 39.9), P(103.8, 36.1), 'LANZHOU'], [P(-47.9, -15.8), P(-47.9, -15.8), 'BRASILIA'], [P(31.2, 30), P(32.5, 25.7), 'LUXOR']]
t = map_(13, 'O8', cam=[[0, 3840, 1950, 0.28], [13, 3840, 1950, 0.3]], arrows=[[1.0 + i * 0.6, 3.0 + i * 0.6, *a, *b, '#ffffff', 16] for i, (a, b, n) in enumerate(NEWCAP) if a != b],
         pins=[[2.6 + i * 0.6, *b, n, '#ffd23f'] for i, (a, b, n) in enumerate(NEWCAP)], banners=[[0.4, 3.0, 'NEW CAPITALS', '#2a5ad8']],
         caps=[[4.6, 12.6, 'Governments flee to the mountains.', 'mountains']])
[V.S(t + 2.6 + i * 0.6, 'ding', 0.25) for i in range(len(NEWCAP))]; wk(t + 13, 52); lv(t + 13, 88); popk(t + 13, 95)
t = V.sc('balls', 10.0, id='OB2', bg='sky', balls=[[K['NL'], 560, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['CH'], 1360, 600, 250, 'smug']],
         bubs=[[0.6, 0, 'Can we stay with you?'], [3.6, 1, 'Of course.'], [6.0, 1, 'That will be one billion euros.']])
V.talk(t, V.SC[-1][3]['bubs']); wk(t + 10, 56); lv(t + 10, 95)
t = map_(12, 'O9', cam=[[0, *P(10, 50), 0.75], [12, *P(10, 49), 0.8]], stamps=[[5.0, 'EUROPE IS SPLITTING APART', 960, 480, '#ff3b30', 80]],
         caps=[[0.6, 4.6, 'Week 70. Europe is breaking into islands.', 'islands'], [6.4, 11.6, 'Scandinavia is cut off from the rest.', 'cut off']])
V.S(t + 5.0, 'stamp_3', 0.8); wk(t + 12, 70); lv(t + 12, 120); popk(t + 12, 92)
t = map_(12, 'O9B', cam=[[0, *P(134, -25), 0.9], [12, *P(134, -25), 1.0]], caps=[[0.6, 5.6, 'Week 75. Australia shrinks to its center.', 'center'], [6.6, 11.6, 'Sydney, Melbourne, Perth: underwater.', 'underwater']],
         pins=[[1.0, *P(151.2, -33.9), 'SYDNEY', '#ff3b30'], [1.6, *P(145, -37.8), 'MELBOURNE', '#ff3b30'], [2.2, *P(115.9, -32), 'PERTH', '#ff3b30']])
wk(t + 12, 76)

# ======================= CAP 4: LAS GUERRAS POR LAS MONTAÑAS =======================
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
ATT = [[P(80, 22), HIGH['TIBET']], [P(-58, -30), HIGH['ANDES']], [P(32, 22), HIGH['ETHIOPIA']], [P(-95, 33), HIGH['ROCKIES']], [P(2, 47), HIGH['ALPS']], [P(46, 30), HIGH['IRAN']]]
t = map_(16, 'O10', chap=[0.0, 2.6, 'CHAPTER 4', 'THE MOUNTAIN WARS'], cam=[[0, 3840, 2050, 0.28], [16, 3840, 2000, 0.3]],
         arrows=[[3.0 + i * 0.6, 6.2 + i * 0.6, *a, *b, '#ff3b30', 26] for i, (a, b) in enumerate(ATT)], rings=[[3.0 + i * 0.6, *b, '#ffd23f', 3] for i, (a, b) in enumerate(ATT)],
         caps=[[3.0, 8.4, 'Week 90. High ground is life.', 'High ground'], [9.0, 15.6, 'Armies march on every mountain range.', 'every mountain']])
for i, (a, b) in enumerate(ATT):
    for j in range(5):
        tt = t + 6.0 + i * 0.6 + j * 0.6; x, y = b[0] + random.randint(-90, 90), b[1] + random.randint(-70, 70)
        WAR['fx'].append([round(tt, 2), x, y, 70, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 8, 2), x, y]); V.SV(tt, 'boom', 0.35)
V.chap_snd(t); V.M(t, t + 46, 'frantic', 10, 0.8, 0.5, 0.8); wk(t + 16, 90); lv(t + 16, 150); popk(t + 16, 85)
HR = [('NP', 'NEPAL', 92), ('BT', 'BHUTAN', 90), ('BO', 'BOLIVIA', 70), ('ET', 'ETHIOPIA', 64), ('LS', 'LESOTHO', 88), ('CH', 'SWITZERLAND', 60), ('AF', 'AFGHANISTAN', 55), ('PE', 'PERU', 45), ('TJ', 'TAJIKISTAN', 70), ('KG', 'KYRGYZSTAN', 72)]
t = V.sc('rank', 10.0, id='ORK2', title='THE NEW SUPERPOWERS: HIGH GROUND', rows=[[K[c], [[0, 100], [9, v]], n] for c, n, v in HR if c in K], fmt='int', unit='% land left', col='linear-gradient(90deg, #3bd16f, #b8ff6a)')
V.S(t + 0.2, 'whoosh_6', 0.5); wk(t + 10, 95); lv(t + 10, 158)
t = V.sc('balls', 10.0, id='OB3', bg='sky', balls=[[K['NP'] if 'NP' in K else K['IN'], 960, 520, 280, 'shades', 'none', None, None, {}], [K['US'], 420, 720, 170, 'scared'], [K['CN'], 1500, 720, 170, 'scared']],
         bubs=[[0.6, 0, 'Welcome to Nepal.'], [3.4, 0, 'The world\'s new richest country.'], [6.6, 1, 'Please... any room left?']])
V.talk(t, V.SC[-1][3]['bubs']); wk(t + 10, 100); lv(t + 10, 165); popk(t + 10, 80)
t = V.sc('call', 12.0, id='OC2', ks=ks('NP', 'BO', 'ET', 'CH'), banner='THE HIGHLAND ALLIANCE', bcol='#2a8a3a', bg=['green', 'green', 'green', 'green'], eyes=['smug', 'smug', 'angry', 'shades'],
         bubs=[[0.8, 0, 'We are in charge now.'], [3.4, 1, 'Everyone wants our land.'], [6.0, 2, 'Nobody gets in for free.'], [8.6, 3, 'As always.']])
V.talk(t, V.SC[-1][3]['bubs']); wk(t + 12, 104)
t = map_(14, 'O11', cam=[[0, 3840, 2050, 0.28], [14, 3840, 2050, 0.29]], war=True, cellCount=[[1.0, 'LAND LEFT', 0, 100, 'pct']],
         caps=[[0.6, 5.6, 'Week 120. The Amazon becomes an inland sea.', 'inland sea'], [6.6, 13.6, 'Half of all land is gone.', 'Half']])
wk(t + 14, 120); lv(t + 14, 200); popk(t + 14, 62)

# ======================= CAP 5: UN MUNDO DE ISLAS =======================
t = map_(15, 'O12', chap=[0.0, 2.6, 'CHAPTER 5', 'A WORLD OF ISLANDS'], cam=[[0, 3840, 2050, 0.27], [15, 3840, 2050, 0.29]], useBar=True, barIn=3,
         icons=[[4.0 + i * 0.5, *xy, 'battleship', '#ffffff', 46] for i, xy in enumerate([P(-40, 30), P(-20, 0), P(70, -10), P(160, 20), P(-140, 10), P(0, 45), P(140, -25)])],
         caps=[[3.0, 8.0, 'Year 3. People live on boats.', 'boats'], [8.6, 14.6, 'Floating cities drift between the peaks.', 'Floating cities']])
V.chap_snd(t); V.M(t, t + 60, 'nocturne', 0, 0.7, 1.0, 0.8); wk(t + 15, 160); lv(t + 15, 260); popk(t + 15, 45)
t = V.sc('balls', 10.0, id='OB4', bg='water', balls=[[K['JP'], 640, 560, 220, 'normal'], [K['PH'], 1280, 560, 220, 'scared']], props=[['battleship', 960, 760, 300, '#cfd8e8']],
         bubs=[[0.6, 0, 'Fish again for dinner?'], [3.4, 1, 'Fish. Every day. Forever.']])
V.talk(t, V.SC[-1][3]['bubs']); wk(t + 10, 170); lv(t + 10, 280)
t = map_(14, 'O12B', cam=[[0, 3840, 2050, 0.28], [14, 3840, 2050, 0.3]], useBar=True,
         icons=[[1.0 + i * 0.35, *xy, 'battleship', '#ff6a5a', 46] for i, xy in enumerate([P(-30, 20), P(-25, 25), P(60, 0), P(65, 5), P(150, 15), P(155, 10)])], parts=['dust', 20],
         banners=[[0.4, 3.4, 'PIRATE FLEETS', '#14141c']], caps=[[3.6, 8.6, 'Boat cities fight over fish and fuel.', 'fish and fuel'], [9.0, 13.6, 'The oceans are the new battlefield.', 'battlefield']])
for i in range(8): V.SV(t + 4 + i * 0.9, 'boom', 0.3); V.S(t + 4 + i * 0.9, 'cannon', 0.3)
wk(t + 14, 185)
t = V.sc('balls', 10.0, id='OB5', bg='water', balls=[[K['US'], 960, 560, 250, 'shades', 'tie']], props=[['carrier', 960, 820, 420, '#cfd8e8']],
         bubs=[[0.6, 0, 'Floating city for billionaires.'], [4.0, 0, 'Tickets: one hundred million dollars.']])
V.talk(t, V.SC[-1][3]['bubs']); wk(t + 10, 195)
t = map_(13, 'O13', cam=[[0, *P(15, 45), 0.7], [6.5, *P(15, 45), 0.8], [7, *P(-70, -10), 0.7], [13, *P(-70, -12), 0.75]], useBar=True,
         caps=[[0.6, 5.6, 'Year 4. Europe is just the Alps.', 'the Alps'], [7.4, 12.6, 'South America is a long chain of islands: the Andes.', 'the Andes']])
V.S(t + 6.8, 'whoosh_4', 0.4); wk(t + 13, 210); lv(t + 13, 360); popk(t + 13, 30)
t = V.sc('bignum', 6.0, id='OBN', kf=[[0, 8.2e9], [4, 1.3e9]], fmt='big', top='PEOPLE LEFT ON EARTH', label=[3.0, 'NOT ENOUGH LAND TO FEED THEM', '#ff3b30'], bgc='radial-gradient(ellipse, #06204a, #000 70%)', glow='rgba(90,180,255,0.9)')
V.S(t + 0.1, 'thit', 0.8); V.S(t + 0.3, 'heartbeat', 0.7); V.S(t + 1.5, 'heartbeat', 0.7); wk(t + 6, 230); lv(t + 6, 400); popk(t + 6, 16)
t = map_(14, 'O14', cam=[[0, *P(85, 30), 0.9], [14, *P(85, 31), 1.0]], useBar=True, rings=[[1.0, *HIGH['TIBET'], '#ffd23f', 3], [1.4, *HIGH['HIMALAYA'], '#ffd23f', 3]],
         caps=[[0.6, 5.6, 'Year 6. Tibet: the last great island.', 'last great island'], [6.6, 13.6, 'China, India and Nepal fight over every peak.', 'every peak']])
wk(t + 14, 300); lv(t + 14, 520); popk(t + 14, 9)
t = map_(12, 'O14B', cam=[[0, *P(-68, -16), 1.0], [12, *P(-70, -18), 1.1]], useBar=True, rings=[[1.0, *HIGH['ANDES'], '#ffd23f', 3]], pins=[[1.4, *P(-68.1, -16.5), 'LA PAZ: NEW WORLD CAPITAL', '#ffd23f']],
         caps=[[0.6, 5.6, 'Year 7. La Paz, at 3,600 m, is the busiest city on Earth.', 'La Paz'], [6.6, 11.6, '40 million people on one mountain.', '40 million']])
wk(t + 12, 340)

# ======================= CAP 6: LOS ÚLTIMOS PICOS =======================
t = map_(15, 'O15', chap=[0.0, 2.6, 'CHAPTER 6', 'THE LAST PEAKS'], cam=[[0, 3840, 2050, 0.27], [15, 3840, 2050, 0.28]], useBar=True,
         rings=[[3.0 + i * 0.4, *xy, '#ffd23f', 3] for i, xy in enumerate([HIGH['TIBET'], HIGH['ANDES'], HIGH['ETHIOPIA'], HIGH['ROCKIES'], HIGH['ALPS'], HIGH['IRAN']])], cellCount=[[3.0, 'LAND LEFT', 0, 100, 'pct']],
         caps=[[3.0, 8.4, 'Year 8. Only the mountain tops remain.', 'mountain tops'], [9.0, 14.6, 'Then, one morning... the water stops.', 'stops']])
V.chap_snd(t); V.M(t, t + 22, 'ambient', 20, 0.6, 1.0, 1.5); wk(t + 9, 400); lv(t + 9, 640); wk(t + 15, 420); lv(t + 15, 650); popk(t + 15, 3.2)
t = V.sc('podium', 10.0, id='OPOD', ks=[K['NP'] if 'NP' in K else K['CN'], K['BO'], K['ET']], title='THE NEW WORLD POWERS')
V.S(t + 0.2, 'thit', 0.6); V.S(t + 0.6, 'crowd_cheer', 0.3); V.M(t, t + 22, 'triumph', 0, 0.55, 0.8, 1.5); wk(t + 10, 420)
t = V.sc('end', 12.0, id='OEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], cells=[FLOOD()], lines=[[0.8, 'WHERE WOULD YOU GO?', 300, 120, 99, '#7ad0ff']], ask=[2.6, 'Tell us your escape plan 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)
for s in V.SC: s[3].setdefault('hud', None) if s[3]['kind'] != 'map' else None
def Lw(w): return w * 1.1 if w <= 100 else 110 + (w - 100) * 1.75
LV[:] = [[a, round(Lw(b), 1)] for a, b in WK]
V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='WEEK', kf=WK, fmt='int'), top2=dict(label='SEA LEVEL', kf=[[a, round(b * 1.0, 1)] for a, b in WK], fmt='m'),
                      bar=dict(label='HUMANITY ALIVE', kf=POP, sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
