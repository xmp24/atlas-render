"""Vídeo 11: What If Gravity Turned Off for 5 Seconds — segundo a segundo, y lo que pasa cuando vuelve."""
from wsim import *
V = Vid('gravity', seed=1111)
DY = []
def dy(t, d): DY.append([round(t, 2), d])
ALLK = sorted(set(K.values()))
VIO = '#b98aff'; RED = '#ff3b30'
def map_(d, id, **kw): return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
CITIES = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(2.35, 48.85), P(-46.6, -23.5), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(-99.1, 19.4), P(28.97, 41), P(31.2, 30), P(3.4, 6.5), P(151.2, -33.9), P(-118.2, 34)]
QUAKE = [P(141, 38), P(139, 35), P(121, 24), P(122, 13), P(100, -1), P(110, -7.5), P(172, -42), P(-72, -33), P(-77, -12), P(-79, -1), P(-99, 17), P(-122, 37.5), P(-150, 61), P(29, 40.7), P(44, 38),
         P(51, 35.7), P(85.3, 27.7), P(14.3, 40.8), P(23, 38), P(-90, 14), P(-70.6, 18.5)]
VOLC = [('ETNA', P(15, 37.75)), ('FUJI', P(138.7, 35.36)), ('POPOCATÉPETL', P(-98.6, 19)), ('KRAKATOA', P(105.4, -6.1)), ('MOUNT RAINIER', P(-121.8, 46.85)), ('KILAUEA', P(-155.3, 19.4)), ('VESUVIUS', P(14.4, 40.8)), ('COTOPAXI', P(-78.4, -0.7))]
SEC = lambda n, sub: V.sc('title', 3.2, id=f'GS{n}', hard=True, bg='black', texts=[[0.1, 3.2, f'SECOND {n}', 170, 500, VIO, 'rgba(185,138,255,0.9)', 14], [0.6, 3.2, sub, 54, 640, '#ffffff']], flash=[0.1])

# ======================= TRÁILER =======================
t = V.sc('balls', 7.0, id='G_A', hard=True, bg='street', bscale=1.1,
         balls=[[K[c], 260 + i * 280, 700, 170, 'scared', 'none', None, None, {'float': [0.8, 5.6, 260 + (i % 3) * 80, 35]}] for i, c in enumerate(['US', 'BR', 'FR', 'JP', 'IN', 'NG', 'MX'])],
         props=[['commercial-airplane', 300, 300, 110, '#ffffff', [0.9, 5.6, 120]], ['house', 1650, 520, 120, '#cfd8e8', [1.1, 5.6, 60]]])
V.S(t + 0.8, 'riser_4s', 0.6); V.S(t + 5.6, 'boom_big', 0.9); V.S(t + 5.6, 'thit', 0.8); V.M(t + 0.3, t + 7, 'scifi', 0, 0.55, 0.2, 0.3)
t = V.sc('title', 6.0, id='G_B', hard=True, bg='black', texts=[[0.2, 2.4, 'NO GRAVITY.', 150], [2.4, 6.0, 'FOR 5 SECONDS.', 150, 540, VIO, 'rgba(185,138,255,0.9)', 10]], flash=[2.4])
V.S(t + 0.2, 'whoosh_6', 0.6); V.S(t + 2.4, 'braam', 0.9); V.M(t + 2.4, t + 6, 'horror', 70, 0.45, 0.2, 0.3)
t = V.sc('bignum', 6.0, id='G_C', hard=True, kf=[[0, 5], [4.6, 0]], fmt='int', top='SECONDS WITHOUT GRAVITY', label=[4.7, '...AND THEN IT COMES BACK', RED], col='#ffffff', glow='rgba(185,138,255,0.9)', bgc='radial-gradient(ellipse, #1a0a3a, #000 70%)')
[V.S(t + 0.1 + i * 0.92, 'heartbeat', 0.6) for i in range(5)]; V.S(t + 4.7, 'boom_big', 0.9); V.S(t + 4.7, 'thit', 0.9)
t = V.sc('title', 8.5, id='G_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='brightness(0.55) hue-rotate(20deg)', grad='radial-gradient(ellipse at 50% 85%, rgba(185,138,255,0.4), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF GRAVITY', 250, 150], [0.5, 'TURNED OFF FOR 5 SECONDS?', 410, 106, VIO]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 150, 0.8, 0.05, 1.2); dy(t + 8.5, 0)

# ======================= CAP 1: UN MARTES CUALQUIERA =======================
t = map_(13, 'G1', chap=[0.0, 2.6, 'CHAPTER 1', 'AN ORDINARY TUESDAY'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]],
         counters=[[3.0, 'PEOPLE ON EARTH', [[3, 8.1e9], [4, 8.1e9]], 'big', '#ffffff'], [6.0, 'PLANES IN THE AIR', [[6, 0], [11, 9800]], 'int', '#7ad0ff', 'br']],
         caps=[[3.0, 7.6, 'A Tuesday. 14:00 UTC. Nothing special.', 'Nothing special'], [8.0, 12.6, 'Almost 10,000 planes are flying right now.', '10,000 planes']])
V.chap_snd(t); V.M(t, t + 36, 'chip', 0, 0.55, 1.0, 0.8); dy(t + 13, 0)
PL = [P(-40, 45), P(-30, 30), P(-150, 30), P(-100, 38), P(170, 40), P(60, 25), P(80, 10), P(-20, 10), P(10, 45), P(100, 30), P(-70, -15), P(20, 55), P(135, 0), P(40, 45)]
t = map_(11, 'G1B', cam=[[0, 3840, 2000, 0.3], [11, 3840, 2000, 0.32]], icons=[[0.4 + i * 0.25, *xy, 'commercial-airplane', '#ffffff', 44] for i, xy in enumerate(PL)], tints=[tint(ALLK, '#3bd16f', [[0, 0.08]])],
         caps=[[0.6, 5.0, 'Kids on trampolines. Cranes lifting steel.', 'trampolines'], [5.6, 10.6, 'Divers mid-jump. Elevators going up.', 'mid-jump']])
V.S(t + 0.4, 'jet', 0.4); dy(t + 11, 0)
t = V.sc('balls', 9.0, id='GB1', bg='sky', balls=[[K['AU'], 640, 640, 230, 'smug', 'none', None, 'AGE 10'], [K['AU'], 1280, 640, 230, 'normal', 'none', None, 'DAD']],
         bubs=[[0.6, 0, 'Dad, watch my highest jump EVER!'], [3.8, 1, 'Go for it!'], [6.4, 0, '3... 2... 1...']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 0)
t = V.sc('balls', 9.0, id='GB1B', bg='street', balls=[[K['CN'], 640, 640, 230, 'normal', 'none', None, 'CRANE DRIVER'], [K['BR'], 1280, 640, 230, 'smug', 'none', None, 'CLIFF DIVER']], props=[['tank', 640, 360, 100, '#ffd23f']],
         bubs=[[0.6, 0, 'Lifting 20 tons of steel. Easy.'], [3.6, 1, 'Jumping off a 30 m cliff. Easy.'], [6.4, 0, 'Just another Tuesday.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 0)
CK = [('TOKYO', P(139.7, 35.7)), ('MUMBAI', P(72.9, 19.1)), ('LAGOS', P(3.4, 6.5)), ('LONDON', P(-0.1, 51.5)), ('SÃO PAULO', P(-46.6, -23.5)), ('NEW YORK', P(-74, 40.7)), ('SYDNEY', P(151.2, -33.9)), ('DUBAI', P(55.3, 25.2))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · 13:59:59', '#ffffff']], grade='rgba(185,138,255,0.12)') for i, (n, xy) in enumerate(CK)]
t = V.sc('cuts', 0.3 + len(CK) * 0.9 + 0.3, id='G1D', cuts=cuts, texts=[[0.05, 7.8, 'ONE SECOND LEFT', 120, 540, VIO, 'rgba(185,138,255,0.7)']])
[V.S(t + 0.3 + i * 0.9, 'tick', 0.4) for i in range(len(CK))]; dy(t + 7.8, 0)

# ======================= CAP 2: SEGUNDO A SEGUNDO =======================
t = V.sc('title', 5.0, id='G2', hard=True, bg='black', chap=[0.0, 2.6, 'CHAPTER 2', 'FIVE SECONDS'], texts=[[2.8, 5.0, '14:00:00 UTC', 120, 540, VIO, 'rgba(185,138,255,0.9)']])
V.chap_snd(t); V.S(t + 2.8, 'sub_drop', 0.9); V.M(t + 2.8, t + 80, 'scifi', 30, 0.65, 0.4, 1.0)
t = SEC(1, 'EVERYTHING GETS LIGHTER THAN A FEATHER')
V.S(t + 0.1, 'thit', 0.8); V.S(t + 0.1, 'whoosh_6', 0.6)
t = V.sc('balls', 9.0, id='GB2', bg='sky', balls=[[K['AU'], 640, 640, 230, 'scared', 'none', None, 'AGE 10', {'float': [0.2, 9.5, 420, 40]}], [K['AU'], 1280, 640, 230, 'scared', 'none', None, 'DAD', {'float': [0.6, 9.5, 60, 15]}]],
         props=[['fluffy-cloud', 960, 300, 120, '#ffffff']], bubs=[[1.0, 0, 'DAD! I\'M NOT COMING DOWN!'], [4.6, 1, 'Grab the tree!'], [7.2, 0, 'I CAN\'T REACH IT!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'riser_4s', 0.4)
t = V.sc('balls', 8.0, id='GB2B', bg='office', balls=[[K['GB'], 960, 640, 240, 'scared', 'tie', None, 'OFFICE WORKER', {'float': [0, 7.8, 160, 30]}]],
         props=[['laptop', 640, 520, 90, '#cfd8e8', [0.2, 7.8, 240]], ['phone', 1300, 540, 70, '#cfd8e8', [0.4, 7.8, 300]], ['newspaper', 1500, 600, 80, '#ffe680', [0.1, 7.8, 200]]],
         bubs=[[0.6, 0, 'My coffee is floating.'], [3.4, 0, 'I\'M floating.'], [5.8, 0, 'Is this a Monday thing?']])
V.talk(t, V.SC[-1][3]['bubs'])
t = map_(10, 'G3', cam=[[0, *P(-30, 0), 0.55], [10, *P(-30, 0), 0.6]], cells=[dict(mode='flood', col='#2f78c8', a=0.9, lvl=[[0, 0], [99999, 0]])], tint2='rgba(185,138,255,0.12)', parts=['dust', 60],
         caps=[[0.4, 5.0, 'Earth keeps spinning at 1,670 km/h... but nothing holds you down.', '1,670 km/h'], [5.4, 9.6, 'Everything drifts slowly away from the ground.', 'drifts']])
V.S(t + 0.4, 'wind', 0.5)
t = SEC(2, 'PLANES SHOOT UPWARD')
V.S(t + 0.1, 'thit', 0.8)
t = map_(10, 'G4', cam=[[0, 3840, 2000, 0.3], [10, 3840, 2000, 0.32]], icons=[[0, *xy, 'commercial-airplane', '#ff9a5a', 44] for xy in PL], arrows=[[0.3 + i * 0.15, 2.0 + i * 0.15, *xy, xy[0], xy[1] - 140, '#ff9a5a', 16] for i, xy in enumerate(PL)],
         counters=[[0.6, 'PLANES CLIMBING OUT OF CONTROL', [[0.6, 0], [5, 9800]], 'int', '#ff9a5a']], caps=[[0.4, 5.0, 'Wings still push up. Nothing pulls down.', 'Nothing pulls'], [5.4, 9.6, 'Passengers hit the ceiling.', 'ceiling']])
V.S(t + 0.3, 'jet', 0.6); V.S(t + 5.4, 'hit_3', 0.6)
t = V.sc('balls', 8.0, id='GB3', bg='sky', balls=[[K['DE'], 960, 640, 250, 'scared', 'none', None, 'PILOT', {'sweat': True, 'float': [0.2, 7.8, 120, 30]}]], props=[['commercial-airplane', 960, 320, 160, '#cfd8e8', [0.2, 7.8, 200]]],
         bubs=[[0.6, 0, 'We\'re climbing 300 meters a second!'], [4.4, 0, 'Full nose down! NOW!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'eas', 0.4)
t = SEC(3, 'THE GROUND MOVES')
V.S(t + 0.1, 'thit', 0.8)
t = map_(11, 'G5', cam=[[0, 3840, 2000, 0.3], [11, 3840, 2000, 0.32]], shake=[[0, 4], [11, 8]], rings=[[0.4 + i * 0.25, *xy, '#ffd23f', 3] for i, xy in enumerate(QUAKE)],
         caps=[[0.4, 5.4, 'Rock deep underground is squeezed by its own weight.', 'own weight'], [5.8, 10.6, 'Without gravity, the whole crust "breathes" out.', 'breathes']])
V.S(t + 0.4, 'sub_drop', 0.7); V.S(t + 1, 'hum', 0.5)
t = V.sc('balls', 8.0, id='GB4', bg='lab', balls=[[K['JP'], 960, 640, 250, 'scared', 'none', None, 'SEISMOLOGIST', {'float': [0, 7.8, 90, 20]}]], props=[['radar-sweep', 960, 330, 120, '#ffd23f', [0, 7.8, 60]]],
         bubs=[[0.6, 0, 'Every fault line on Earth is lighting up.'], [4.4, 0, 'When gravity comes back...']])
V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + 0.3 + i * 0.4, 'beep_hi', 0.2) for i in range(12)]
t = SEC(4, 'THE OCEANS AND THE AIR RISE')
V.S(t + 0.1, 'thit', 0.8)
t = map_(11, 'G6', cam=[[0, *P(-160, 10), 0.5], [11, *P(-150, 10), 0.55]], tint2='rgba(140,200,255,0.18)', parts=['dust', 140], stars=[[0, 0], [11, 0.5]],
         caps=[[0.4, 5.4, 'Seawater lifts off the ocean floor like a giant blanket.', 'blanket'], [5.8, 10.6, 'The Moon drifts 5 km out of its orbit.', 'Moon']])
V.S(t + 0.4, 'wind', 0.6)
t = SEC(5, 'EVERYONE IS FLOATING')
V.S(t + 0.1, 'thit', 0.8)
t = V.sc('balls', 9.0, id='GB5', bg='street', bscale=1.05, balls=[[K[c], 220 + i * 300, 680, 180, 'scared', 'none', None, None, {'float': [0, 6.2, 150 + (i % 3) * 120, 40]}] for i, c in enumerate(['GB', 'IN', 'BR', 'CN', 'US', 'EG'])],
         props=[['house', 1700, 560, 110, '#cfd8e8', [0, 6.2, 40]]], bubs=[[0.6, 1, 'Is it over?'], [3.2, 4, 'How do we get DOWN?'], [6.2, 2, 'AAAAH!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 6.2, 'boom_big', 1.0); V.S(t + 6.2, 'bone-crack', 0.6); [V.SV(t + 6.25 + i * 0.07, 'hit', 0.4) for i in range(6)]
t = map_(13, 'G7', cam=[[0, 3840, 2050, 0.36], [0.4, 3840, 2050, 0.3], [13, 3840, 2050, 0.31]], shake=[[0, 26], [3, 8], [6, 0]], flash=[0], rings=[[0.1 + i * 0.08, *xy, RED, 3] for i, xy in enumerate(CITIES)],
         stamps=[[0.3, 'GRAVITY IS BACK', 960, 460, '#ffffff', 130, 0]], caps=[[3.6, 8.0, '14:00:05. Gravity returns at full strength.', 'full strength'], [8.4, 12.6, 'Everything that floated comes crashing down.', 'crashing']])
V.S(t, 'boom_big', 1.0); V.S(t + 0.3, 'stamp_2', 0.8); V.S(t + 0.4, 'tinnitus', 0.4); V.M(t + 0.4, t + 50, 'horror', 0, 0.7, 0.8, 0.8); dy(t + 13, 0.01)

# ======================= CAP 3: EL IMPACTO =======================
t = map_(14, 'G8', chap=[0.0, 2.6, 'CHAPTER 3', 'THE CRASH'], cam=[[0, 3840, 2000, 0.3], [14, 3840, 2000, 0.32]], war=True, shake=[[2.6, 10], [8, 4], [14, 2]],
         rings=[[2.8 + i * 0.25, *xy, '#ffd23f', 4] for i, xy in enumerate(QUAKE)], counters=[[3.0, 'EARTHQUAKES ABOVE MAGNITUDE 7', [[3, 0], [12, 44]], 'int', '#ffd23f']],
         caps=[[3.0, 7.6, 'The crust snaps back. The Ring of Fire shakes all at once.', 'Ring of Fire'], [8.0, 13.6, 'Tokyo, Istanbul, Lima, San Francisco, Jakarta.', 'Tokyo']])
for i, xy in enumerate(QUAKE):
    tt = t + 2.8 + i * 0.25; WAR['fx'].append([round(tt, 2), xy[0], xy[1], 50, 0]); WAR['ext']['crater'].append([round(tt, 2), xy[0], xy[1], 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 30, 2), xy[0], xy[1]])
V.chap_snd(t); [V.SV(t + 2.8 + i * 0.25, 'boom', 0.25) for i in range(len(QUAKE))]; dy(t + 14, 0.05)
t = map_(12, 'G9', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0, *xy, 'commercial-airplane', '#ffffff', 44] for xy in PL],
         rings=[[1.0 + i * 0.6, *xy, RED, 2] for i, xy in enumerate(PL[::2])], counters=[[0.8, 'PLANES THAT RECOVERED', [[0.8, 0], [7, 8600]], 'int', '#3bd16f'], [5.0, 'PLANES LOST', [[5, 0], [11, 1200]], 'int', RED, 'br']],
         caps=[[0.6, 5.6, 'Most pilots regain control. Some stall and fall.', 'stall'], [6.6, 11.6, 'Around 1,200 planes don\'t make it.', '1,200']])
[V.SV(t + 1 + i * 0.6, 'boom', 0.3) for i in range(7)]; dy(t + 12, 0.1)
t = map_(12, 'G9B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'castle-ruins', '#ffd23f', 44] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'CRANES AND ELEVATORS FALLEN', [[0.8, 0], [9, 2.1e5]], 'big', '#ffd23f']], caps=[[0.6, 5.6, 'Cranes dropped their loads. Elevator cables snapped back.', 'snapped'], [6.6, 11.6, 'Five seconds of floating. Years of repairs.', 'Years']])
[V.SV(t + 0.6 + i * 0.3, 'hit', 0.15) for i in range(len(CITIES))]; dy(t + 12, 0.12)
t = V.sc('news', 14.0, id='GN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 1]],
         bubs=[[1.0, 0, 'For five seconds, gravity... stopped.'], [4.6, 0, 'There is no explanation.'], [8.0, 0, 'Earthquakes are reported on every continent.']],
         papers=[[5.6, 'THE GLOBE DAILY', '5 SECONDS'], [9.8, 'WORLD EVENING POST', 'GRAVITY STOPPED']], ticker='BREAKING: GRAVITY VANISHED FOR 5 SECONDS  •  44 MAJOR EARTHQUAKES  •  1,200 PLANES LOST  •  STAY AWAY FROM COASTS  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.6, 9.8]]; dy(t + 14, 0.15)
TSU = [[0, 0]]
t = map_(13, 'G10', cam=[[0, *P(120, 10), 0.55], [13, *P(115, 15), 0.6]], cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=TSU)],
         counters=[[1.0, 'COASTAL PEOPLE HIT BY WAVES', [[1, 0], [11, 3.9e7]], 'big', '#7ad0ff']], caps=[[0.6, 5.6, 'The lifted oceans slam back down.', 'slam'], [6.6, 12.6, 'Waves race across every sea and hit the coasts.', 'every sea']])
TSU += [[round(t + 1, 2), 0], [round(t + 6, 2), 14], [round(t + 13, 2), 18], [round(t + 40, 2), 3], [99999, 3]]
V.S(t + 0.6, 'wind', 0.6); V.S(t + 5, 'boom_6', 0.5); dy(t + 13, 0.3)
CO = [('TOKYO BAY', P(139.8, 35.5)), ('MANILA', P(121, 14.6)), ('LIMA', P(-77, -12)), ('LISBON', P(-9.1, 38.7)), ('MIAMI', P(-80.2, 25.8)), ('MUMBAI', P(72.9, 19.1)), ('JAKARTA', P(106.8, -6.2)), ('SYDNEY', P(151.2, -33.9))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=[[0, 16]])], pins=[[0, *xy, n, '#7ad0ff']], grade='rgba(0,60,140,0.25)') for i, (n, xy) in enumerate(CO)]
t = V.sc('cuts', 0.3 + len(CO) * 0.9 + 0.3, id='G10B', cuts=cuts, texts=[[0.05, 7.8, 'THE WAVES ARRIVE', 110, 540, '#7ad0ff', 'rgba(80,160,255,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'boom', 0.25) for i in range(len(CO))]; dy(t + 7.8, 0.5)
t = map_(12, 'G11', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], parts=['ember', 80], pins=[[0.8 + i * 0.6, *xy, n, '#ff6a1a'] for i, (n, xy) in enumerate(VOLC)],
         rings=[[0.8 + i * 0.6, *xy, '#ff6a1a', 3] for i, (n, xy) in enumerate(VOLC)], caps=[[0.6, 5.6, 'The shock wakes up sleeping volcanoes.', 'volcanoes'], [6.6, 11.6, 'Eight of them erupt in a single week.', 'Eight']])
[V.S(t + 0.8 + i * 0.6, 'boom_6', 0.3) for i in range(len(VOLC))]; dy(t + 12, 7)
t = map_(12, 'G11B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], night=[[0, 0], [8, 0.4]], tint2='rgba(90,80,70,0.3)', parts=['dust', 140],
         caps=[[0.6, 5.6, 'Ash from eight volcanoes spreads around the planet.', 'Ash'], [6.6, 11.6, 'The summer is two degrees colder than normal.', 'colder']])
V.S(t + 0.4, 'wind', 0.5); dy(t + 12, 7)
t = V.sc('bignum', 6.0, id='GBN1', kf=[[0, 0], [4, 6.2e8]], fmt='big', top='PEOPLE INJURED IN 5 SECONDS', label=[4.0, 'MOSTLY FROM FALLING... ONE METER', VIO])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 7)
t = V.sc('balls', 10.0, id='GB6', bg='lab', balls=[[K['IT'], 640, 640, 230, 'scared', 'none', None, 'DOCTOR', {'sweat': True}], [K['IT'], 1280, 650, 210, 'normal', 'none', None, 'PATIENT', {'tears': True}]],
         bubs=[[0.6, 1, 'I was on a ladder.'], [3.2, 0, 'Everyone was on something.'], [6.0, 0, 'Ladders, stairs, roofs. 600 million of you.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 8)
t = V.sc('balls', 9.0, id='GB6B', bg='night', balls=[[K['US'], 640, 640, 220, 'smug', 'none', None, 'ISS CREW'], [K['RU'], 1280, 640, 220, 'smug', 'none', None, 'ISS CREW']], props=[['satellite-communication', 960, 360, 120, '#9fd4ff']],
         bubs=[[0.6, 0, 'Houston, what happened down there?'], [4.0, 1, 'We felt nothing.'], [6.6, 0, 'We\'re always floating.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'static', 0.4); dy(t + 9, 8.5)
HIT = [('JP', 92), ('ID', 88), ('CL', 81), ('PE', 77), ('TR', 74), ('PH', 71), ('IR', 66), ('NP', 61)]
t = V.sc('rank', 10.0, id='GRK1', title='COUNTRIES HIT HARDEST (DAMAGE INDEX)', rows=[[K[c], [[0, 0], [7, v]]] for c, v in HIT if c in K], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ffd23f, #ff9a5a)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 10)
t = V.sc('call', 13.0, id='GC1', ks=ks('US', 'CN', 'JP', 'EU' if 'EU' in K else 'DE'), banner='EMERGENCY SUMMIT', eyes=['scared', 'angry', 'scared', 'scared'],
         bubs=[[1.0, 0, 'What turned off gravity?'], [3.6, 1, 'Was it a weapon? Who has it?'], [6.6, 2, 'Nobody has it. Nobody COULD.'], [9.6, 3, 'Then... can it happen again?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); dy(t + 13, 12)

# ======================= CAP 4: DESPUÉS =======================
t = map_(13, 'G12', chap=[0.0, 2.6, 'CHAPTER 4', 'AFTER'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], stars=[[0, 0.6]], icons=[[3.0 + i * 0.4, *xy, 'beam-satellite', '#9fd4ff', 40] for i, xy in enumerate([P(-150, 50), P(-60, 60), P(30, 65), P(120, 60), P(170, -40), P(-100, -45), P(60, -50)])],
         counters=[[3.0, 'SATELLITES KNOCKED OUT OF ORBIT', [[3, 0], [11, 1900]], 'int', '#9fd4ff']], caps=[[3.0, 7.6, 'Low satellites drift and burn up. GPS flickers.', 'GPS'], [8.0, 12.6, 'The Moon\'s orbit changed. Tides are 3% stronger now.', '3% stronger']])
V.chap_snd(t); V.M(t, t + 70, 'saga', 0, 0.65, 1.0, 0.8); [V.S(t + 3 + i * 0.4, 'static', 0.1) for i in range(7)]; dy(t + 13, 20)
t = map_(12, 'G13', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'anchor', VIO, 42] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'ANCHOR BELTS SOLD', [[0.8, 0], [10, 1.4e9]], 'big', VIO]], caps=[[0.6, 5.6, 'A new fear: what if it happens again?', 'again'], [6.6, 11.6, 'People sleep strapped to their beds.', 'strapped']])
[V.S(t + 0.6 + i * 0.3, 'lock', 0.12) for i in range(len(CITIES))]; dy(t + 12, 40)
t = map_(12, 'G13B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.4, *xy, 'laptop', '#ff6a5a', 44] for i, xy in enumerate([P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(8.7, 50.1), P(114.2, 22.3), P(72.9, 19.1)])],
         counters=[[0.8, 'DAMAGE ($)', [[0.8, 0], [9, 1.8e13]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'Total damage: 18 trillion dollars.', '18 trillion'], [6.6, 11.6, 'More than any war in history. In five seconds.', 'five seconds']])
V.S(t + 1, 'downlifter', 0.5); dy(t + 12, 45)
SAFE = [('MN', 97), ('KZ', 95), ('PL', 93), ('BR', 90), ('FI', 88), ('CA', 86), ('ZA', 84), ('AU', 82)]
t = V.sc('rank', 10.0, id='GRK2', title='SAFEST PLACES IF IT HAPPENS AGAIN', rows=[[K[c], [[0, 0], [7, v]]] for c, v in SAFE if c in K], fmt='int', unit=' / 100', col='linear-gradient(90deg, #3bd16f, #c8ffd8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 48)
t = V.sc('balls', 10.0, id='GB7', bg='night', balls=[[K['US'], 960, 640, 250, 'scared', 'none', None, None, {'sweat': True}]], props=[['anchor', 960, 360, 120, VIO]],
         bubs=[[0.6, 0, 'Seatbelt on the bed. Seatbelt on the toilet.'], [4.4, 0, 'My wife says I\'m crazy.'], [7.2, 0, 'My wife wasn\'t on a ladder.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 50)
t = map_(12, 'G14', cam=[[0, *P(139.7, 35.7), 1.4], [6, *P(139.7, 35.7), 1.6], [6.3, *P(-77, -12), 1.4], [12, *P(-77, -12), 1.6]], pins=[[1.0, *P(139.7, 35.7), 'TOKYO: REBUILDING', '#3bd16f'], [7.0, *P(-77, -12), 'LIMA: REBUILDING', '#3bd16f']],
         caps=[[0.6, 5.6, 'Month 6. Cities on the Ring of Fire rebuild.', 'rebuild'], [6.6, 11.6, 'New rule: everything must survive "a gravity drop".', 'gravity drop']])
V.S(t + 6.3, 'whoosh_6', 0.5); dy(t + 12, 180)
t = map_(13, 'G15', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], icons=[[0.6 + i * 0.5, *xy, 'radar-dish', '#7ad0ff', 46] for i, xy in enumerate([P(-155.5, 19.8), P(-70.4, -24.6), P(18.5, -32.4), P(-110.9, 31.9), P(149.1, -31.3), P(6.9, 46.2)])],
         stamps=[[7.4, 'GRAVITY WATCH', 960, 470, '#7ad0ff', 120]], caps=[[0.6, 5.6, 'Scientists build a global network to measure gravity every millisecond.', 'every millisecond'], [8.4, 12.6, 'So next time, we get a warning.', 'warning']])
[V.S(t + 0.6 + i * 0.5, 'scan', 0.2) for i in range(6)]; V.S(t + 7.4, 'stamp_2', 0.7); dy(t + 13, 240)
t = V.sc('balls', 10.0, id='GB8', bg='sky', balls=[[K['AU'], 640, 640, 230, 'smug', 'none', None, 'AGE 11'], [K['AU'], 1280, 640, 230, 'normal', 'none', None, 'DAD']],
         bubs=[[0.6, 0, 'I still hold the world record.'], [3.6, 1, 'For what?'], [5.6, 0, 'Highest jump EVER. 400 meters!']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 300)
t = V.sc('balls', 9.0, id='GB8B', bg='office', balls=[[K['JP'], 960, 620, 240, 'normal', 'tie', None, 'TEACHER'], [K['JP'], 520, 700, 150, 'scared'], [K['JP'], 1400, 700, 150, 'smug']],
         bubs=[[0.6, 0, 'Gravity drill! Grab the anchor bar!'], [3.6, 2, 'Can we float again? It was fun.'], [6.4, 0, 'NO.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.6, 'ding', 0.5); dy(t + 9, 320)
t = V.sc('news', 14.0, id='GN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0], [10, 1]],
         bubs=[[1.0, 0, 'One year since the five seconds.'], [4.4, 0, 'Breaking: Gravity Watch detects a tiny drop.'], [8.6, 0, 'It lasted... 0.2 seconds.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'IT\'S BACK?'], [9.8, 'WORLD EVENING POST', '0.2 SECONDS']], ticker='GRAVITY WATCH ALERT  •  0.2 SECOND DROP DETECTED  •  SCIENTISTS: "STAY CALM"  •  FASTEN YOUR BELTS  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; V.S(t + 8.6, 'braam2', 0.7); dy(t + 14, 365)
t = V.sc('bignum', 6.0, id='GBN2', kf=[[0, 0], [4, 10]], fmt='int', unit=' SEC', top='NEXT TIME...', label=[4.0, 'WHAT IF IT LASTS 10?', RED], col='#ffffff', glow='rgba(185,138,255,0.9)', bgc='radial-gradient(ellipse, #1a0a3a, #000 70%)')
V.S(t + 0.1, 'riser_4s', 0.6); V.S(t + 4.0, 'thit', 0.9); dy(t + 6, 365)
t = map_(12, 'G16', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.27]], tints=[tint(ALLK, VIO, [[1, 0], [6, 0.18]], 0)], stars=[[0, 0.3]],
         stamps=[[5.0, 'A WORLD THAT HOLDS ON', 960, 460, VIO, 100, 0]], caps=[[0.6, 4.6, 'Humanity learned one thing in five seconds:', 'one thing'], [7.0, 11.6, 'Nothing is guaranteed. Not even the ground.', 'Not even the ground']])
V.S(t + 5.0, 'stamp_2', 0.7); V.S(t + 5.0, 'braam3', 0.4); dy(t + 12, 365)
t = V.sc('end', 12.0, id='GEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5) hue-rotate(20deg)', lines=[[0.8, 'WHAT WOULD YOU GRAB?', 300, 110, 99, VIO]], ask=[2.6, 'Where would you be when gravity stops? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='DAY', kf=DY, fmt='int'))
V.export()
