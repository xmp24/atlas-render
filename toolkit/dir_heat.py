"""Vídeo 4: What If the Earth Got 1°C Hotter Every Month — desiertos que avanzan, huida a los polos, océanos hirviendo."""
from wsim import *
V = Vid('heat', seed=44)
MK = []; POP = []
def mk(t, m): MK.append([round(t, 2), m])
def popk(t, p): POP.append([round(t, 2), p])
TEMP0 = 15.0
SAND = '#e8b060'; BURN = '#7a3a1a'
D_T0 = None; D_D = 260.0
DES = lambda: dict(mode='lat', invert=True, t0=D_T0, dur=D_D, col=SAND, col2='#c98a4a', a=0.85, pw=1.25, elevw=-0.1, noise=0.12)
def map_(d, id, **kw):
    kw.setdefault('useThermo', True); kw.setdefault('cells', [DES()]); return V.sc('map', d, id=id, **kw)
POLES = {'ANTARCTICA': P(0, -78), 'GREENLAND': P(-42, 72), 'SIBERIA': P(100, 68), 'NORTHERN CANADA': P(-100, 66), 'SVALBARD': P(16, 78), 'ALASKA': P(-150, 66)}

# ======================= TRÁILER =======================
t = V.sc('title', 8.0, id='H_A', hard=True, cam=[[0, 3840, 2100, 0.3], [8, 3840, 2050, 0.34]], Tmap=0, filter='saturate(1.4) sepia(0.4)',
         cells=[dict(mode='lat', invert=True, t0=-100, dur=1, col='#c96a2a', a=0.9)], parts=['ember', 90], tint2='rgba(255,90,20,0.35)',
         texts=[[0.6, 3.6, '+100°C', 230, 470, '#ffb060', 'rgba(255,120,30,0.9)', 30], [3.8, 7.7, 'THE DAY THE OCEANS BOILED', 66, 540, '#ffffff', 'rgba(255,120,30,0.8)', 10]], flash=[0.4])
V.S(t + 0.35, 'braam', 0.9); V.S(t + 0.4, 'wind', 0.4); V.S(t + 3.8, 'thit', 0.6); V.M(t + 0.3, t + 8, 'horror', 20, 0.5, 0.4, 0.4)
CC = [('IN', 1.4), ('EG', 1.6), ('MX', 1.4), ('BR', 1.0), ('ES', 2.0), ('SA', 1.4), ('US', 1.0), ('AU', 1.0), ('IT', 2.0), ('NG', 1.6), ('CN', 1.0), ('TR', 1.8), ('FR', 1.8)]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*cap(c), s], T=60 + i * 5, cells=[dict(mode='lat', invert=True, t0=0, dur=110, col=SAND, a=0.9, noise=0.25)], parts=['ember', 60], grade='rgba(255,120,30,0.25)') for i, (c, s) in enumerate(CC)]
t = V.sc('cuts', 0.4 + len(CC) * 0.55 + 0.4, id='H_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'IT STARTED WITH', 110], [3.6, 7.9, 'ONE DEGREE.', 170, 540, '#ffb060', 'rgba(255,120,30,0.8)']])
V.M(t, t + 7.6, 'frantic', 50, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.35) for i in range(len(CC))]; V.S(t + 3.6, 'thit', 0.8)
t = V.sc('title', 6.0, id='H_C', hard=True, bg='black', texts=[[0.2, 2.2, 'EVERY MONTH.', 130], [2.2, 4.0, '+1°C', 240, 520, '#ffb060', 'rgba(255,120,30,0.9)', 20], [4.0, 6.0, 'UNTIL THE PLANET BURNS', 70, 540, '#ffffff', 'rgba(255,120,30,0.5)', 10]], flash=[2.2])
V.S(t + 0.2, 'braam2', 0.8); V.S(t + 2.2, 'thit', 0.9); V.S(t + 4.0, 'heartbeat', 0.7); V.S(t + 4.9, 'heartbeat', 0.7); V.M(t, t + 6, 'tension', 50, 0.55, 0.2, 0.3)
t = V.sc('title', 8.5, id='H_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='saturate(1.3) sepia(0.3)', cells=[dict(mode='lat', invert=True, t0=-100, dur=1, col=SAND, a=0.8)],
         parts=['ember', 110], grad='radial-gradient(ellipse at 50% 80%, rgba(255,120,30,0.4), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF EARTH GOT', 250, 130], [0.5, '1°C HOTTER EVERY MONTH?', 410, 120, '#ffb060']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2); mk(t + 8.5, 0); popk(0, 100)

# ======================= CAP 1: UN VERANO MUY LARGO =======================
t = map_(12, 'H1', chap=[0.0, 2.6, 'CHAPTER 1', 'A VERY LONG SUMMER'], cam=[[0, 3840, 2050, 0.3], [12, 3900, 2000, 0.34]], cells=[],
         caps=[[3.0, 6.8, 'Month 1. Earth is 1°C hotter.', '1°C'], [7.2, 11.8, 'Everyone just thinks it\'s a hot summer.', 'hot summer']])
V.chap_snd(t); V.M(t, t + 36, 'voyage', 0, 0.6, 1.0, 0.8); mk(t + 12, 1)
t = V.sc('balls', 9.5, id='HB1', bg='desert', balls=[[K['ES'], 440, 640, 230, 'shades'], [K['GB'], 960, 660, 220, 'normal', 'none', None, None, {'sweat': True}], [K['RU'], 1480, 640, 230, 'smug']],
         bubs=[[0.6, 0, 'Another heatwave? Normal.'], [3.6, 1, 'It\'s 40°C in London...'], [6.6, 2, 'Finally, warm Siberia!']])
V.talk(t, V.SC[-1][3]['bubs']); mk(t + 9.5, 2)
t = V.sc('balls', 10.0, id='HB1B', bg='street', balls=[[K['US'], 560, 650, 230, 'angry', 'none', None, None, {'sweat': True}], [K['IT'], 1360, 650, 220, 'scared', 'none', None, 'SHOP OWNER', {'sweat': True}]],
         props=[['closed-doors', 960, 430, 170, '#cfd8e8']], bubs=[[0.6, 0, 'One air conditioner, please.'], [3.4, 1, 'Sold out. Everywhere.'], [6.6, 1, 'Fans too. Even ice.']])
V.talk(t, V.SC[-1][3]['bubs']); mk(t + 10, 2.6)
t = V.sc('news', 15.0, id='HN1', anchor=K['GB'], tvp=dict(cells=[dict(mode='lat', invert=True, t0=-5, dur=300, col=SAND, a=0.85)]), cam=WORLD,
         bubs=[[1.2, 0, 'Breaking news.'], [3.4, 0, 'Earth is 3°C hotter than 3 months ago.'], [7.4, 0, 'And it\'s still rising.'], [11.2, 0, 'Stay indoors. Drink water.']], fear=[[0, 0], [10, 1]],
         papers=[[5.4, 'THE GLOBE DAILY', 'PLANET ON FIRE?'], [9.4, 'WORLD EVENING POST', '+3°C IN 90 DAYS']], ticker='BREAKING: GLOBAL TEMPERATURE +3°C IN 3 MONTHS  •  RECORD HEAT ON EVERY CONTINENT  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 15, 'newsroom', 0, 0.6, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.4, 9.4]]; mk(t + 15, 3)
D_T0 = t + 15.0
t = map_(13, 'H2', cam=[[0, *P(78, 22), 1.0], [6.5, *P(78, 22), 1.1], [7, *P(45, 25), 1.0], [13, *P(45, 24), 1.1]], parts=['ember', 30],
         pins=[[1.2, *P(77.2, 28.6), 'DELHI 52°C', '#ff6a1a'], [2.6, *P(67, 24.9), 'KARACHI 54°C', '#ff6a1a'], [8.0, *P(47, 29.4), 'KUWAIT 61°C', '#ff6a1a'], [9.2, *P(46.7, 24.7), 'RIYADH 60°C', '#ff6a1a']],
         caps=[[0.6, 5.6, 'Month 4. India hits 52°C.', '52°C'], [7.2, 12.6, 'In the Gulf, going outside can kill you.', 'kill you']])
[V.S(t + x, 'ding', 0.25) for x in [1.2, 2.6, 8.0, 9.2]]; mk(t + 13, 5); V.M(t, t + 13, 'tension', 0, 0.55, 1.0, 0.8)
t = map_(12, 'H2B', cam=[[0, *P(8, 46), 1.15], [12, *P(10, 45), 1.3]], parts=['ember', 30],
         pins=[[1.0, *P(2.35, 48.85), 'PARIS 46°C', '#ff6a1a'], [2.2, *P(-3.7, 40.4), 'MADRID 50°C', '#ff6a1a'], [3.4, *P(12.5, 41.9), 'ROME 48°C', '#ff6a1a'], [4.6, *P(23.7, 37.98), 'ATHENS 51°C', '#ff6a1a']],
         counters=[[5.6, 'HEAT DEATHS IN EUROPE', [[5.6, 0], [11.5, 410000]], 'int', '#ff9a5a']], caps=[[0.6, 5.0, 'Month 6. Europe was never built for this.', 'never built'], [6.6, 11.6, 'Old buildings turn into ovens.', 'ovens']])
[V.S(t + x, 'ding', 0.25) for x in [1.0, 2.2, 3.4, 4.6]]; V.S(t + 5.6, 'heartbeat', 0.6); mk(t + 12, 6)

# ======================= CAP 2: FUEGO =======================
FIRE = ks('US', 'CA', 'AU', 'BR', 'RU', 'GR', 'TR', 'ES', 'PT', 'FR', 'IT')
t = map_(13, 'H3', chap=[0.0, 2.6, 'CHAPTER 2', 'FIRE'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 1950, 0.33]], tints=[tint(FIRE, '#ff5a1a', [[2.6, 0], [5, 0.5]], 0.2)], parts=['ember', 80],
         counters=[[3.0, 'FORESTS BURNED', [[3, 0], [12, 3.1e6]], 'big', '#ff9a5a']], caps=[[3.0, 7.6, 'Month 7. The forests catch fire.', 'catch fire'], [8.0, 12.6, 'Canada, Amazon, Siberia, Australia: all burning.', 'all burning']])
V.chap_snd(t); V.M(t, t + 50, 'tension', 20, 0.75, 0.6, 0.8); V.S(t + 3, 'boom_6', 0.3); mk(t + 13, 7)
t = map_(12, 'H3B', cam=[[0, *P(-60, -6), 1.0], [12, *P(-58, -8), 1.2]], parts=['ember', 140], tints=[tint(ks('BR', 'PE', 'BO', 'CO', 'VE'), '#ff3a0a', [[0.5, 0], [6, 0.6]], 0.4, crack=True)],
         stamps=[[7.0, 'THE AMAZON IS GONE', 960, 500, '#ff3b30', 100]], caps=[[0.6, 5.8, 'The Amazon, the lungs of the planet, catches fire.', 'Amazon'], [8.2, 11.8, 'It burns for 40 days straight.', '40 days']])
V.S(t + 0.5, 'wind', 0.4); V.S(t + 2, 'boom_6', 0.3); V.S(t + 7.0, 'stamp_3', 0.8); mk(t + 12, 7.5)
t = V.sc('balls', 10.0, id='HB2', bg='dark', balls=[[K['US'], 400, 620, 220, 'angry'], [K['CN'], 960, 640, 230, 'angry'], [K['IN'], 1520, 620, 220, 'scared']], props=[['tv', 960, 300, 140, '#ffb060']],
         bubs=[[0.5, 0, 'China did this!'], [3.4, 1, 'You burned the oil for 100 years!'], [6.4, 2, 'And WE pay for it!']])
V.talk(t, V.SC[-1][3]['bubs']); mk(t + 10, 8)
t = V.sc('call', 13.0, id='HC1', ks=ks('US', 'CN', 'RU', 'SA'), banner='EMERGENCY SUMMIT', eyes=['scared', 'angry', 'smug', 'scared'],
         bubs=[[1.0, 0, 'We must cool the planet.'], [3.4, 1, 'Spray chemicals in the sky!'], [6.0, 2, 'Russia is fine. It\'s warm now.'], [8.8, 3, 'Our people are dying in the heat.']])
V.talk(t, V.SC[-1][3]['bubs']); mk(t + 13, 9)
t = map_(11, 'HPLAN', cam=[[0, 3840, 1900, 0.3], [11, 3840, 1900, 0.32]], icons=[[1.0 + i * 0.4, *xy, 'airplane', '#ffffff', 50] for i, xy in enumerate([P(-100, 40), P(10, 48), P(100, 35), P(140, 37), P(-50, -10), P(30, 5)])],
         banners=[[0.4, 3.6, 'PLAN A: BLOCK THE SUN', '#2a5ad8']], stamps=[[5.6, 'NOT ENOUGH', 960, 480, '#ff3b30', 140]], caps=[[6.6, 10.6, 'Every month erases a year of effort.', 'erases']])
V.S(t + 1.0, 'jet', 0.5); V.S(t + 5.6, 'stamp_3', 0.8); mk(t + 11, 10)
t = V.sc('news', 14.0, id='HN2', anchor=K['US'], tvp=dict(cells=[dict(mode='lat', invert=True, t0=-5, dur=200, col=SAND, a=0.85)]), cam=WORLD, fear=[[0, 0.6], [10, 1]],
         bubs=[[1.0, 0, 'Plan A has failed.'], [3.6, 0, 'Air conditioners now use half the world\'s power.'], [8.0, 0, 'Blackouts on every continent.']],
         papers=[[5.0, 'THE GLOBE DAILY', 'PLAN A FAILS'], [9.2, 'WORLD EVENING POST', 'GRID COLLAPSE']], ticker='POWER GRIDS FAIL IN 60 COUNTRIES  •  WATER RATIONING EVERYWHERE  •  STAY INDOORS  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.0, 9.2]]; mk(t + 14, 11)
t = map_(14, 'H4', cam=[[0, 3840, 2150, 0.3], [14, 3840, 2150, 0.32]], parts=['ember', 50], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=[[0, 0], [9999, 0]])],
         counters=[[1.0, 'CROPS LOST', [[1, 20], [12, 65]], 'int', '#ffb060']], stamps=[[8.4, 'GLOBAL FAMINE', 960, 480, '#ff3b30', 110]],
         caps=[[0.6, 5.4, 'Month 12. Harvests die in the heat.', 'Harvests die'], [9.6, 13.6, 'Food runs out first in the tropics.', 'tropics']])
V.S(t + 8.4, 'stamp_3', 0.8); mk(t + 14, 12); popk(t + 14, 98)
t = V.sc('bignum', 5.5, id='HBN1', kf=[[0, 15], [3.5, 27]], fmt='temp', top='ONE YEAR LATER', label=[2.5, 'THE WHOLE PLANET IS A DESERT SUMMER', '#ffb060'], col='#fff0d0', glow='rgba(255,140,40,0.9)', bgc='radial-gradient(ellipse, #4a1a06, #000 70%)')
V.S(t + 0.1, 'thit', 0.8); [V.S(t + 0.2 + i * 0.3, 'tick', 0.4) for i in range(12)]; mk(t + 5.5, 12)

# ======================= CAP 3: HUIDA A LOS POLOS =======================
MIG = [[P(-90, 20), P(-100, 55)], [P(-60, -10), P(-68, -45)], [P(10, 10), P(15, 50)], [P(40, 25), P(40, 58)], [P(78, 22), P(90, 55)], [P(110, 25), P(110, 55)], [P(135, -25), P(145, -42)]]
t = map_(15, 'H5', chap=[0.0, 2.6, 'CHAPTER 3', 'RUN TO THE POLES'], cam=[[0, 3840, 2050, 0.27], [15, 3840, 2050, 0.29]],
         arrows=[[3.0 + i * 0.5, 5.6 + i * 0.5, *a, *b, '#ffd23f', 22] for i, (a, b) in enumerate(MIG)], counters=[[3.0, 'CLIMATE REFUGEES', [[3, 0], [13, 2.2e9]], 'big', '#ffd23f']],
         caps=[[3.0, 8.0, 'Year 2. The tropics are unlivable.', 'unlivable'], [8.4, 14.6, 'Billions head north... and south.', 'Billions']])
V.chap_snd(t); V.M(t, t + 54, 'drive', 0, 0.75, 0.6, 0.8); [V.SV(t + 3 + i * 0.5, 'whoosh', 0.3) for i in range(len(MIG))]; mk(t + 15, 16)
NORTH = ks('CA', 'RU', 'NO', 'SE', 'FI', 'IS', 'GL') + ks('NZ')
t = map_(12, 'H6', cam=[[0, 3840, 1600, 0.32], [12, 3840, 1600, 0.35]], tints=[tint(NORTH, '#3bd16f', [[0.8, 0], [1.6, 0.45]], 0.15, stroke='#ffffff')],
         stamps=[[5.0, 'THE NEW PARADISE', 960, 520, '#3bd16f', 110]], caps=[[0.6, 4.6, 'Canada, Russia, Scandinavia: the last cool lands.', 'last cool lands'], [7.0, 11.6, 'Everyone wants in.', 'Everyone']])
V.S(t + 5.0, 'stamp_2', 0.7); mk(t + 12, 18)
COOL = [('GL', 92), ('IS', 85), ('NO', 74), ('FI', 68), ('CA', 61), ('RU', 55), ('SE', 49), ('NZ', 41)]
t = V.sc('rank', 10.0, id='HRK', title='MOST LIVABLE LAND LEFT · YEAR 2', rows=[[K[c], [[0, 100], [6, v]]] for c, v in COOL if c in K], fmt='int', unit='% livable', col='linear-gradient(90deg, #39b6ff, #c8ecff)')
V.S(t + 0.2, 'whoosh_6', 0.5); mk(t + 10, 19)
t = V.sc('balls', 10.0, id='HB3', bg='ice', balls=[[K['CA'], 1300, 620, 260, 'angry'], [K['MX'], 520, 660, 230, 'scared', 'none', None, None, {'sweat': True}], [K['US'], 820, 660, 230, 'scared', 'none', None, None, {'sweat': True}]],
         bubs=[[0.6, 0, 'Border closed. Sorry, eh.'], [3.6, 2, 'We\'re your best friends!'], [6.6, 0, 'Not anymore.']], props=[['military-fort', 1000, 560, 160, '#cfd8e8']])
V.talk(t, V.SC[-1][3]['bubs']); mk(t + 10, 20)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
WARA = [[P(-98, 38), P(-100, 55)], [P(80, 35), P(90, 55)], [P(110, 32), P(115, 50)], [P(30, 40), P(35, 58)], [P(10, 45), P(18, 62)]]
t = map_(16, 'H7', cam=[[0, 3840, 1700, 0.3], [8, 3840, 1600, 0.36], [16, 3840, 1700, 0.32]], war=True,
         arrows=[[2.6 + i * 0.7, 6.0 + i * 0.7, *a, *b, '#ff3b30', 28] for i, (a, b) in enumerate(WARA)], banners=[[0.6, 3.6, 'THE WAR FOR THE NORTH', '#c3100a']],
         stamps=[[11.0, 'RUSSIA INVADED', 960, 520, '#ff3b30', 100]], caps=[[4.0, 9.6, 'The south marches on the cold lands.', 'marches'], [11.6, 15.6, 'The hottest war in history.', 'hottest']])
for i, (a, b) in enumerate(WARA):
    for j in range(6):
        tt = t + 4.0 + i * 0.7 + j * 0.7; x, y = b[0] + random.randint(-90, 90), b[1] + random.randint(-60, 60)
        WAR['fx'].append([round(tt, 2), x, y, 70, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 8, 2), x, y]); V.SV(tt, 'boom', 0.35)
V.S(t + 0.6, 'braam2', 0.6); V.S(t + 11.0, 'stamp_3', 0.8); mk(t + 16, 24); V.M(t, t + 16.4, 'frantic', 10, 0.8, 0.4, 0.6); popk(t + 16, 85)
LV = [[0, 0]]
t = map_(13, 'H8', cam=[[0, 3840, 2100, 0.27], [13, 3840, 2100, 0.28]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True, barIn=0.4,
         caps=[[0.6, 5.6, 'Year 3. The ice caps melt. Seas rise 60 m.', '60 m'], [6.6, 12.6, 'Two billion people already dead.', 'Two billion']])
LV += [[round(t, 2), 0], [round(t + 8, 2), 75], [99999, 75]]
popk(t + 13, 72); V.S(t + 0.4, 'sub_drop', 0.6); mk(t + 13, 36)
t = map_(12, 'H8B', cam=[[0, *P(90, 23), 1.4], [6, *P(90, 23), 1.6], [6.3, *P(-81, 27), 1.4], [12, *P(-81, 27), 1.6]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True,
         pins=[[1.0, *P(90.4, 23.8), 'DHAKA: UNDERWATER', '#7ad0ff'], [7.0, *P(-80.2, 25.8), 'MIAMI: UNDERWATER', '#7ad0ff']], caps=[[0.6, 5.6, 'Bangladesh disappears under the sea.', 'disappears'], [6.6, 11.6, 'Florida follows a few weeks later.', 'Florida']])
V.S(t + 0.4, 'wind', 0.4); V.S(t + 6.3, 'whoosh_6', 0.4); mk(t + 12, 40); popk(t + 12, 66)

# ======================= CAP 4: BAJO TIERRA =======================
t = map_(14, 'H9', chap=[0.0, 2.6, 'CHAPTER 4', 'COOL UNDERGROUND'], cam=[[0, 3840, 2050, 0.27], [14, 3840, 2050, 0.3]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True, shelters=dict(col='#39b6ff'),
         caps=[[3.0, 8.0, 'Year 4. People dig deep to escape the heat.', 'dig deep'], [8.4, 13.6, 'Underground, the rock stays cool.', 'cool']])
t_sh = t; V.chap_snd(t); V.M(t, t + 52, 'nocturne', 0, 0.7, 1.0, 0.8); mk(t + 14, 48); popk(t + 14, 55)
t = map_(13, 'H10', cam=[[0, 3840, 2300, 0.28], [13, 3840, 2300, 0.3]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True, shelters=dict(col='#39b6ff'),
         rings=[[0.8 + i * 0.6, *xy, '#7ad0ff', 3] for i, xy in enumerate(POLES.values())], pins=[[0.8 + i * 0.6, *xy, n, '#7ad0ff'] for i, (n, xy) in enumerate(POLES.items())],
         caps=[[0.6, 5.6, 'Antarctica becomes the most crowded place on Earth.', 'Antarctica'], [6.6, 12.6, 'Farms grow where the ice used to be.', 'Farms']])
[V.S(t + 0.8 + i * 0.6, 'ding', 0.25) for i in range(6)]; mk(t + 13, 60); popk(t + 13, 40)
t = V.sc('balls', 10.0, id='HB6', bg='desert', balls=[[K['EG'], 520, 650, 220, 'angry', 'none', None, None, {'sweat': True}], [K['ET'], 1400, 650, 220, 'angry', 'none', None, None, {'sweat': True}]],
         props=[['anchor', 960, 520, 120, '#39b6ff']], fx=[[5.0, 960, 560], [7.4, 900, 600]], bubs=[[0.6, 0, 'The Nile is OURS!'], [3.4, 1, 'Then come and take it!'], [8.0, 0, 'There\'s no water left anyway...']])
V.talk(t, V.SC[-1][3]['bubs']); V.SV(t + 5.0, 'boom', 0.5); V.SV(t + 7.4, 'boom', 0.5); mk(t + 10, 63)
t = V.sc('balls', 10.0, id='HB4', bg='bunker', balls=[[K['AR'], 640, 640, 230, 'scared'], [K['NO'], 1280, 640, 230, 'normal']], parts=['dust', 30],
         bubs=[[0.6, 0, 'How hot is it outside?'], [3.6, 1, '70 degrees.'], [6.4, 1, 'In Antarctica.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'hum', 0.4); mk(t + 10, 66); popk(t + 10, 30)
t = map_(14, 'H11', cam=[[0, 3840, 2050, 0.28], [14, 3840, 2050, 0.3]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True, shelters=dict(col='#39b6ff'),
         parts=['ember', 120], tint2='rgba(255,90,20,0.25)', banners=[[2.6, 7.0, 'THE AIR IS POISON', '#8a3a10']],
         caps=[[0.6, 2.4, 'Year 7. +97°C.', '+97°C'], [7.6, 13.6, 'Water vapor traps even more heat.', 'traps']])
V.S(t + 2.6, 'stamp_2', 0.7); V.S(t + 2.6, 'braam3', 0.5); mk(t + 14, 82); popk(t + 14, 8)
t = V.sc('bignum', 5.5, id='HBN2', kf=[[0, 8.2e9], [3.5, 3.9e8]], fmt='big', top='PEOPLE STILL ALIVE', label=[2.8, '5% OF HUMANITY', '#ff3b30'])
V.S(t + 0.1, 'thit', 0.8); V.S(t + 0.2, 'heartbeat', 0.7); mk(t + 5.5, 84); popk(t + 5.5, 4.8)

# ======================= CAP 5: LOS OCÉANOS HIERVEN =======================
t = map_(16, 'H12', chap=[0.0, 2.6, 'CHAPTER 5', 'THE OCEANS BOIL'], cam=[[0, 3840, 2050, 0.28], [16, 3840, 2050, 0.3]], cells=[DES(), dict(mode='flood', col='#2f78c8', a=0.9, lvl=LV)], useBar=True,
         shelters=dict(col='#39b6ff'), filter='saturate(0.7) brightness(0.9)', tint2='rgba(255,255,255,0.25)', parts=['dust', 120],
         stamps=[[8.0, '+100°C', 960, 480, '#ffffff', 160, 0]], caps=[[3.0, 7.6, 'Year 8. The oceans start to boil.', 'boil'], [10.0, 15.6, 'The sky turns white with steam.', 'steam']])
t_die0 = t + 2.6; V.chap_snd(t); V.M(t, t + 58, 'horror', 0, 0.65, 1.0, 1.0); V.S(t + 8.0, 'braam', 0.7); mk(t + 16, 100); popk(t + 16, 2.2)
t = map_(12, 'H13', cam=[[0, *P(15, 50), 1.2], [12, *P(15, 50), 1.35]], cells=[DES()], useBar=True, shelters=dict(col='#39b6ff', size=1.4), filter='brightness(0.85) sepia(0.5)',
         stamps=[[3.0, 'COOLING FAILED', 700, 420, '#ff3b30', 70], [5.2, 'NO WATER', 1250, 560, '#ff3b30', 70], [7.4, 'POWER OUT', 900, 700, '#ff3b30', 70]], caps=[[0.6, 4.6, 'Bunkers overheat, one after another.', 'overheat']])
[V.S(t + x, 'stamp_3', 0.6) for x in [3.0, 5.2, 7.4]]; mk(t + 12, 130); popk(t + 12, 1.0)
t = map_(12, 'H13B', cam=[[0, *P(-75, 10), 0.6], [12, *P(-75, 5), 0.65]], cells=[DES()], useBar=True, shelters=dict(col='#39b6ff'), filter='brightness(0.8) sepia(0.6)', night=[[0, 0], [6, 0.4]],
         stamps=[[4.0, 'NORTH AMERICA: SILENT', 960, 420, '#ff3b30', 70], [7.0, 'SOUTH AMERICA: SILENT', 960, 600, '#ff3b30', 70]], caps=[[0.6, 3.8, 'Year 11. The Americas go dark.', 'go dark'], [8.6, 11.8, 'Only the south of Chile still answers.', 'Chile']])
V.S(t + 4.0, 'stamp_3', 0.6); V.S(t + 7.0, 'stamp_3', 0.6); V.S(t + 0.4, 'static', 0.4); mk(t + 12, 140); popk(t + 12, 0.7)
t = V.sc('balls', 10.0, id='HB5', bg='night', balls=[[K['AQ'] if 'AQ' in K else K['NZ'], 560, 640, 230, 'scared', 'none', None, 'ANTARCTIC BASE'], [K['NO'], 1360, 640, 230, 'normal', 'none', 4.4]], props=[['walkie-talkie', 760, 520, 90, '#cfd8e8']],
         bubs=[[0.6, 0, 'Base 7 calling... anyone?'], [5.0, 1, 'Svalbard here. We\'re still alive.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'static', 0.5); mk(t + 10, 150); popk(t + 10, 0.5)
t = map_(14, 'H14', cam=[[0, 3840, 2050, 0.27], [14, 3840, 2050, 0.28]], cells=[DES()], useBar=True, shelters=dict(col='#39b6ff'), filter='brightness(0.7) sepia(0.8) saturate(1.4)',
         tint2='rgba(255,140,40,0.35)', banners=[[2.4, 6.6, 'THE OCEANS ARE GONE', '#8a3a10']], caps=[[0.6, 2.2, 'Year 15. +195°C.', '+195°C'], [7.4, 13.6, 'Earth\'s seas have boiled into the sky.', 'boiled']])
V.S(t + 2.4, 'sub_drop', 0.7); mk(t + 14, 180); popk(t + 14, 0.2)
t = V.sc('news', 14.0, id='HN3', anchor=K['NO'], tvp=dict(cells=[dict(mode='lat', invert=True, t0=-5, dur=1, col='#c96a2a', a=0.9)]), cam=WORLD, fear=[[0, 1]],
         bubs=[[1.0, 0, 'This is the last broadcast from the surface.'], [5.2, 0, 'Our antenna will melt in a few hours.'], [9.4, 0, 'Good luck down there.']],
         papers=[[6.0, 'SVALBARD RADIO', 'LAST SIGNAL']], ticker='FINAL SURFACE BROADCAST  •  ALL SURVIVORS: STAY UNDERGROUND  •  GOOD LUCK  •  ')
V.S(t, 'static', 0.5); V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 6.55, 'stamp_1', 0.5); V.S(t + 13.5, 'static', 0.7); mk(t + 14, 200); popk(t + 14, 0.15)

# ======================= CAP 6: EL NUEVO VENUS =======================
t = map_(16, 'H15', chap=[0.0, 2.6, 'CHAPTER 6', 'THE NEW VENUS'], cam=[[0, 3840, 2050, 0.27], [16, 3840, 2050, 0.27]], cells=[DES()], useBar=True, shelters=dict(col='#39b6ff'),
         filter='brightness(0.6) sepia(1) saturate(1.6)', tint2='rgba(255,170,60,0.4)', rings=[[3.0 + i * 0.5, *xy, '#7ad0ff', 3] for i, xy in enumerate([POLES['ANTARCTICA'], POLES['GREENLAND'], POLES['SVALBARD']])],
         counters=[[3.0, 'SHELTERS STILL ALIVE', [[3, 160], [15, 9]], 'int', '#7ad0ff']], caps=[[3.0, 8.4, 'Year 30. Only the deepest polar bunkers remain.', 'deepest'], [9.0, 15.6, 'Kilometers under the old ice.', 'Kilometers']])
V.chap_snd(t); V.M(t, t + 46, 'ambient', 20, 0.65, 1.2, 1.5); mk(t + 16, 360); popk(t + 16, 0.08)
LAST = [('NO', 900), ('CA', 700), ('RU', 650), ('CL', 300), ('NZ', 250), ('IS', 120), ('AR', 80)]
t = V.sc('rank', 10.0, id='HRK2', title='LAST SURVIVORS · YEAR 33', rows=[[K[c], [[0, v * 6], [9, v]]] for c, v in LAST if c in K], fmt='int', unit=' people', col='linear-gradient(90deg, #39b6ff, #c8ecff)')
V.S(t + 0.2, 'whoosh_6', 0.5); mk(t + 10, 400)
t = V.sc('bignum', 8.0, id='HBN3', kf=[[0, 415], [6, 462]], fmt='temp', top='YEAR 37', label=[4.5, 'HOTTER THAN VENUS', '#ffb060'], col='#fff0d0', glow='rgba(255,140,40,1)', bgc='radial-gradient(ellipse, #4a1a06, #000 70%)')
V.S(t + 0.1, 'braam', 0.8); [V.S(t + 0.3 + i * 0.35, 'tick', 0.5) for i in range(16)]; V.S(t + 6.0, 'thit', 0.9); mk(t + 8, 447)
t = map_(14, 'H16', cam=[[0, 3840, 2050, 0.27], [14, 3840, 2000, 0.3]], cells=[DES()], useBar=True, shelters=dict(col='#39b6ff'), filter='brightness(0.55) sepia(1) saturate(1.8)', tint2='rgba(255,170,60,0.45)',
         rings=[[0.4, *POLES['ANTARCTICA'], '#7ad0ff', 3]], stamps=[[1.0, 'EARTH: 460°C', 960, 380, '#ffb060', 80, 0], [5.0, '...AND 3,000 PEOPLE STILL ALIVE.', 960, 560, '#7ad0ff', 66, 0]])
V.S(t + 1.0, 'stamp_2', 0.6); V.S(t + 5.0, 'braam3', 0.6); mk(t + 14, 447)
t = V.sc('end', 12.0, id='HEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], cells=[DES()], filter='brightness(0.6) sepia(0.9)', lines=[[0.8, 'WOULD YOU SURVIVE?', 300, 120, 99, '#ffb060']], ask=[2.6, 'Hot or cold: which end is worse? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

SH = []; rng = V.rng
for c, n in [('US', 60), ('CN', 60), ('RU', 80), ('CA', 60), ('NO', 20), ('SE', 20), ('FI', 20), ('IS', 10), ('GB', 15), ('DE', 15), ('JP', 25), ('AR', 25), ('CL', 20), ('NZ', 15), ('AU', 15), ('KR', 10), ('KZ', 10), ('MN', 8), ('GL', 20)]:
    if c not in K: continue
    for (x, y) in sample_in(rng, c, n):
        near = y > 3600 or y < 900
        SH.append([x, y, round(t_sh + 2.6 + rng.uniform(0, 9), 2), -1 if (near and rng.random() < 0.3) else round(t_die0 + rng.uniform(0, 1) ** 0.8 * 70, 2)])
for (x, y) in [POLES['ANTARCTICA'], P(40, -75), P(-60, -75), P(120, -72), P(-40, 75), P(20, 78)]:
    for j in range(6): SH.append([x + random.randint(-80, 80), y + random.randint(-40, 40), round(t_sh + 4 + j * 0.3, 2), -1])
V.extra['shelters'] = SH; V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='MONTH', kf=MK, fmt='int'), thermo=dict(kf=[[a, TEMP0 + m] for a, m in MK], min=-20, max=470, label='GLOBAL AVERAGE'),
                      bar=dict(label='HUMANITY ALIVE', kf=POP, sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
