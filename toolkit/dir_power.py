"""Vídeo 12: What If Electricity Stopped Working Forever — el mapa nocturno se apaga; reactores sin refrigeración; vuelta al vapor y al caballo."""
from wsim import *
V = Vid('power', seed=1212)
DY = []; POP = []
def dy(t, d): DY.append([round(t, 2), d])
def popk(t, p): POP.append([round(t, 2), p])
ALLK = sorted(set(K.values()))
AMB = '#ffd96a'; RAD = '#a8ff3a'; RED = '#ff3b30'
T_OFF = None
def LIGHTS(t_off=None, dur=1.6): return dict(mode='rand', t0=(T_OFF if t_off is None else t_off), dur=dur, col=AMB, a=0.9, off=True, dens=0.13, r=5.2, fade=0.35)
def DARK(**kw):   # mapa nocturno ya apagado
    kw.setdefault('night', [[0, 0.62], [999, 0.62]]); return kw
def map_(d, id, **kw): return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
CITIES = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(2.35, 48.85), P(-46.6, -23.5), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(-99.1, 19.4), P(28.97, 41), P(31.2, 30), P(3.4, 6.5), P(151.2, -33.9), P(-118.2, 34)]
NUKES = [P(-77, 39), P(-88, 42), P(-81, 35), P(-95, 29), P(-120, 35), P(1.5, 47), P(4.5, 45), P(-0.5, 49.5), P(2.2, 50.9), P(9, 50), P(-3, 51.2), P(30.1, 51.4), P(34.5, 47.5), P(26.6, 50.3),
         P(141, 37.4), P(136, 35.5), P(129.3, 35.3), P(126.4, 35.4), P(119.4, 34.5), P(113, 22.6), P(121.2, 30.4), P(77, 13), P(72.6, 19.8), P(37, 55), P(33, 67), P(-46, -23), P(-99.5, 19.7), P(55, 24.9), P(18.4, -33.7), P(-79, 43.8)]
SEEDS = lambda t0: [[round(t0 + i * 0.15, 2), x, y] for i, (x, y) in enumerate(NUKES)]

# ======================= TRÁILER =======================
t0 = V.T if hasattr(V, 'T') else 0
t = V.sc('title', 8.0, id='W_A', hard=True, cam=[[0, 3840, 2050, 0.3], [8, 3840, 2050, 0.32]], Tmap=0, night=[[0, 0.72]], cells=[LIGHTS(4.0, 1.4)],
         texts=[[0.4, 3.8, 'EARTH AT NIGHT', 110, 160], [4.8, 8.0, 'OFF. FOREVER.', 150, 540, '#ffffff', 'rgba(255,217,106,0.6)', 10]])
V.S(t + 0.3, 'hum', 0.6); V.S(t + 4.0, 'blackout', 1.0); V.S(t + 4.0, 'sub_drop', 0.9); V.S(t + 4.8, 'braam', 0.9); V.M(t + 4.8, t + 8, 'horror', 80, 0.45, 0.2, 0.3)
CT = [('NEW YORK', P(-74, 40.7)), ('TOKYO', P(139.7, 35.7)), ('LONDON', P(-0.1, 51.5)), ('SHANGHAI', P(121.5, 31.2)), ('DUBAI', P(55.3, 25.2)), ('PARIS', P(2.35, 48.85)), ('MUMBAI', P(72.9, 19.1)),
      ('LAGOS', P(3.4, 6.5)), ('MOSCOW', P(37.6, 55.75)), ('SÃO PAULO', P(-46.6, -23.5)), ('SEOUL', P(126.98, 37.56)), ('LOS ANGELES', P(-118.2, 34))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · NO POWER', '#cfd8e8']], grade='rgba(0,0,20,0.5)', filter='brightness(0.35) saturate(0.4)') for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='W_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'NO LIGHTS. NO PHONES.', 112], [3.6, 7.4, 'NO ENGINES. NO WAY BACK.', 104, 540, AMB, 'rgba(255,217,106,0.6)']])
V.M(t, t + 7.4, 'frantic', 110, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.S(t + 0.4 + i * 0.55, 'blackout', 0.2) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='W_C', hard=True, kf=[[0, 3.0e10], [0.8, 3.0e10], [3.6, 0]], fmt='big', top='ELECTRIC DEVICES THAT WORK', label=[3.8, 'NOT ONE. NOT EVEN A BATTERY.', AMB], col='#ffffff', glow='rgba(255,217,106,0.8)', bgc='radial-gradient(ellipse, #2a2406, #000 70%)')
[V.S(t + 0.8 + i * 0.12, 'tick', 0.3) for i in range(24)]; V.S(t + 3.8, 'thit', 0.9)
t = V.sc('title', 8.5, id='W_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='brightness(0.4) saturate(0.6)', grad='radial-gradient(ellipse at 50% 85%, rgba(255,217,106,0.3), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF ELECTRICITY', 250, 140], [0.5, 'STOPPED WORKING FOREVER?', 410, 110, AMB]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 180, 0.8, 0.05, 1.2); dy(t + 8.5, 0); popk(0, 100)

# ======================= CAP 1: EL INTERRUPTOR =======================
t = map_(14, 'E1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE SWITCH'], cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.33]], night=[[0, 0.62]],
         counters=[[3.0, 'DEVICES RUNNING RIGHT NOW', [[3, 3.0e10], [8.4, 3.0e10], [9.2, 0]], 'big', AMB]], caps=[[3.0, 8.0, 'A Friday. 20:00 UTC. Earth glows with billions of lights.', 'glows'], [9.4, 13.6, 'Then every electric current on the planet... stops.', 'stops']])
T_OFF = t + 8.6
V.SC[-1][3]['cells'] = [LIGHTS()]
V.chap_snd(t); V.S(t, 'hum', 0.5); V.S(t + 8.6, 'blackout', 1.0); V.S(t + 8.6, 'sub_drop', 0.9); V.M(t + 9, t + 50, 'horror', 0, 0.65, 1.0, 0.8); dy(t + 14, 0)
t = V.sc('balls', 9.0, id='EB1', bg='dark', balls=[[K['US'], 640, 640, 230, 'scared', 'none', None, 'NURSE', {'sweat': True}], [K['US'], 1280, 660, 200, 'scared', 'none', None, 'PATIENT']],
         bubs=[[0.6, 0, 'The machines just died. All of them.'], [4.0, 1, 'The backup generator?'], [6.6, 0, 'Also dead. Pump by hand. NOW.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.4, 'flatline', 0.3); dy(t + 9, 0)
DK = [('TOKYO', P(139.7, 35.7)), ('MUMBAI', P(72.9, 19.1)), ('CAIRO', P(31.2, 30)), ('ROME', P(12.5, 41.9)), ('LAGOS', P(3.4, 6.5)), ('MEXICO CITY', P(-99.1, 19.4)), ('CHICAGO', P(-87.6, 41.9)), ('SYDNEY', P(151.2, -33.9))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · DARK', '#cfd8e8']], grade='rgba(0,0,20,0.55)', filter='brightness(0.3) saturate(0.4)') for i, (n, xy) in enumerate(DK)]
t = V.sc('cuts', 0.3 + len(DK) * 0.9 + 0.3, id='E1B', cuts=cuts, texts=[[0.05, 7.8, '20:00:01', 130, 540, AMB, 'rgba(255,217,106,0.6)']])
[V.S(t + 0.3 + i * 0.9, 'blackout', 0.2) for i in range(len(DK))]; dy(t + 7.8, 0)
t = V.sc('balls', 9.0, id='EB1B', bg='bunker', balls=[[K['JP'], 640, 640, 230, 'scared', 'tie', None, None, {'sweat': True}], [K['JP'], 1280, 640, 230, 'scared', 'none', None, None]],
         bubs=[[0.6, 0, 'The elevator stopped. Floor 41.'], [3.6, 1, 'Press the alarm!'], [6.2, 0, 'The alarm is electric too...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'steel_door', 0.4); dy(t + 9, 0)
PL = [P(-40, 45), P(-30, 30), P(-150, 30), P(-100, 38), P(170, 40), P(60, 25), P(80, 10), P(-20, 10), P(10, 45), P(100, 30), P(-70, -15), P(20, 55), P(135, 0), P(40, 45)]
t = map_(13, 'E2', **DARK(cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], icons=[[0, *xy, 'commercial-airplane', '#cfd8e8', 44] for xy in PL], rings=[[3.0 + i * 0.6, *xy, RED, 2] for i, xy in enumerate(PL[::2])],
         counters=[[0.8, 'PLANES WITH DEAD ENGINES', [[0.8, 0], [3, 9600]], 'int', '#cfd8e8'], [5.0, 'SAFE GLIDER LANDINGS', [[5, 0], [12, 410]], 'int', '#3bd16f', 'br']],
         caps=[[0.6, 5.6, 'Jet engines need electric sparks and computers. All quiet.', 'quiet'], [6.6, 12.6, '9,600 planes become gliders... in the dark.', 'gliders']]))
[V.SV(t + 3 + i * 0.6, 'boom', 0.25) for i in range(7)]; dy(t + 13, 0)
t = V.sc('balls', 9.0, id='EB2', bg='night', balls=[[K['FR'], 960, 640, 250, 'scared', 'none', None, 'PILOT', {'sweat': True}]], props=[['commercial-airplane', 960, 340, 150, '#cfd8e8']],
         bubs=[[0.6, 0, 'No engines. No screens. No radio.'], [4.0, 0, 'Just a compass... and the moon.'], [7.0, 0, 'Brace. Brace. Brace.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'wind', 0.5); dy(t + 9, 0)
t = V.sc('bignum', 6.0, id='EBN0', kf=[[0, 0], [4, 1.3e6]], fmt='big', top='PEOPLE IN THE AIR WHEN IT HAPPENED', label=[4.0, 'GLIDING IN TOTAL DARKNESS', AMB], col='#ffffff', glow='rgba(255,217,106,0.8)', bgc='radial-gradient(ellipse, #2a2406, #000 70%)')
V.S(t + 0.1, 'wind', 0.6); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 0)
t = map_(12, 'E3', **DARK(cam=[[0, *P(-74, 40.7), 1.8], [12, *P(-74, 40.7), 2.1]], rings=[[0.6 + i * 0.3, -1 + x, y, '#ff9a5a', 2] for i, (x, y) in enumerate([P(-74 + dx, 40.7 + dy_) for dx, dy_ in [(0, 0), (0.3, 0.2), (-0.4, 0.1), (0.2, -0.3), (-0.2, 0.4), (0.5, -0.1), (-0.6, -0.2), (0.1, 0.5)]])],
         counters=[[0.8, 'CARS STOPPED WORLDWIDE', [[0.8, 0], [8, 1.4e9]], 'big', '#ff9a5a']], caps=[[0.6, 5.6, 'Modern cars die mid-road. Electric ones too.', 'mid-road'], [6.6, 11.6, 'Highways become parking lots. Forever.', 'Forever']]))
[V.SV(t + 0.6 + i * 0.3, 'hit', 0.2) for i in range(8)]; dy(t + 12, 0.05)
t = map_(12, 'E3B', **DARK(cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'phone', '#8a8f96', 40] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'PHONES THAT WORK', [[0.8, 7.0e9], [1.4, 0]], 'big', '#8a8f96']], stamps=[[6.0, 'NO WAY TO CALL FOR HELP', 960, 470, RED, 90]],
         caps=[[0.6, 5.6, 'No calls. No messages. No internet. No GPS.', 'No calls'], [7.4, 11.6, 'Families on different continents lose each other.', 'lose each other']]))
V.S(t + 6, 'stamp_3', 0.7); dy(t + 12, 0.08)
t = map_(14, 'E4', **DARK(cam=[[0, 3840, 1950, 0.3], [14, 3840, 1950, 0.32]], icons=[[0.6 + i * 0.12, *xy, 'biohazard', RAD, 34] for i, xy in enumerate(NUKES)],
         stamps=[[7.0, 'NO COOLING', 960, 470, RED, 150]], caps=[[0.6, 6.4, 'Nuclear reactors need pumps to stay cool. The pumps are electric.', 'pumps'], [8.0, 13.6, 'Within hours, the cores begin to overheat.', 'overheat']]))
[V.S(t + 0.6 + i * 0.12, 'beep_hi', 0.1) for i in range(len(NUKES))]; V.S(t + 7, 'stamp_3', 0.9); V.S(t + 7, 'braam2', 0.6); dy(t + 14, 0.2)
t = V.sc('bignum', 6.0, id='EBN1', kf=[[0, 0], [4, 410]], fmt='int', top='NUCLEAR REACTORS WITH NO COOLING', label=[4.0, 'THE WORST NIGHT IN HUMAN HISTORY', RED], col='#ffffff', glow='rgba(168,255,58,0.7)', bgc='radial-gradient(ellipse, #142a06, #000 70%)')
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.9); dy(t + 6, 0.5)
t = V.sc('call', 13.0, id='EC1', ks=ks('US', 'FR', 'CN', 'JP'), banner='SUMMIT BY HORSE · DAY 12', bg='dark', eyes=['scared', 'angry', 'scared', 'scared'],
         bubs=[[1.0, 0, 'Took me 12 days to get here by ship.'], [4.0, 1, 'Paris is surrounded by radiation.'], [7.0, 2, 'We need coal. And steam engines. Fast.'], [10.0, 3, 'Who still knows how to build one?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 13, 0.5)
t = map_(14, 'E5', **DARK(cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.34], [14, 3840, 1950, 0.31]], cells=[dict(mode='dist', t0=0, seeds=None, spd=26, rmax=230, col=RAD, col2='#5a8a1a', a=0.55, fade=0.6)],
         counters=[[1.0, 'LAND MADE UNLIVABLE (KM²)', [[1, 0], [12, 1.1e6]], 'big', RAD]], caps=[[0.6, 6.4, 'Day 3. Meltdowns across America, Europe and East Asia.', 'Meltdowns'], [7.4, 13.6, 'Radiation zones grow around every plant.', 'Radiation zones']], useBar=True))
V.SC[-1][3]['cells'][0]['seeds'] = SEEDS(t + 1.0)
[V.SV(t + 1 + i * 0.15, 'far', 0.2) for i in range(0, len(NUKES), 2)]; V.S(t + 1, 'tinnitus', 0.25); dy(t + 14, 3); popk(t + 14, 99.2)
RADZ = lambda: dict(mode='dist', t0=0, seeds=SEEDS(-100), spd=26, rmax=230, col=RAD, col2='#5a8a1a', a=0.5)

# ======================= CAP 2: LA SEMANA OSCURA =======================
t = map_(13, 'E6', **DARK(chap=[0.0, 2.6, 'CHAPTER 2', 'THE DARK WEEK'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], cells=[RADZ()], icons=[[3.0 + i * 0.3, *xy, 'anchor', '#7ad0ff', 40] for i, xy in enumerate(CITIES)],
         counters=[[3.0, 'CITIES WITHOUT RUNNING WATER', [[3, 0], [11, 1.0]], 'pct', '#7ad0ff']], caps=[[3.0, 7.6, 'Water pumps stop. Taps go dry in every city.', 'Taps go dry'], [8.0, 12.6, 'Toilets don\'t flush. Sewage backs up.', 'Sewage']], useBar=True))
V.chap_snd(t); V.M(t, t + 54, 'tension', 0, 0.65, 1.0, 0.8); dy(t + 13, 4); popk(t + 13, 99)
t = V.sc('balls', 9.0, id='EB3', bg='street', balls=[[K['IN'], 640, 640, 230, 'normal', 'none', None, None], [K['IN'], 1280, 640, 230, 'scared', 'none', None, None, {'sweat': True}]], props=[['anchor', 960, 420, 90, '#7ad0ff']],
         bubs=[[0.6, 1, 'The river is 6 km away.'], [3.4, 0, 'Then we walk 6 km.'], [6.2, 0, 'Twice a day. Like Grandma did.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 5)
t = V.sc('balls', 9.0, id='EB3B', bg='night', balls=[[K['GB'], 640, 680, 170, 'scared', 'none', None, 'AGE 6'], [K['GB'], 1280, 640, 230, 'normal', 'none', None, 'DAD']], props=[['torch', 960, 420, 80, '#ffb060']],
         bubs=[[0.6, 0, 'When will the lights come back?'], [3.6, 1, 'They won\'t, sweetheart.'], [6.2, 1, 'But candles are cozy. See?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 5.5)
t = map_(12, 'E7', **DARK(cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], cells=[RADZ()], icons=[[0.6 + i * 0.3, *xy, 'skull-crossed-bones', '#ffd23f', 40] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'FOOD ROTTING (TONS)', [[0.8, 0], [9, 3.9e8]], 'big', '#ffd23f']], caps=[[0.6, 5.6, 'No fridges. No freezers. No supermarket deliveries.', 'No fridges'], [6.6, 11.6, 'A week\'s worth of food rots in three days.', 'rots']], useBar=True))
V.S(t + 0.4, 'wind', 0.4); dy(t + 12, 7); popk(t + 12, 98.5)
GULF = [[P(55.3, 25.2), P(58, 30)], [P(51.5, 25.3), P(48, 29)], [P(46.7, 24.7), P(42, 21)], [P(50.6, 26.2), P(49, 30)], [P(47.98, 29.4), P(45, 33)]]
t = map_(12, 'E8', **DARK(cam=[[0, *P(50, 26), 1.3], [12, *P(50, 27), 1.4]], arrows=[[0.8 + i * 0.5, 4.0 + i * 0.5, *a, *b, '#ff9a5a', 22] for i, (a, b) in enumerate(GULF)],
         stamps=[[6.6, 'NO WATER. 50°C.', 960, 470, RED, 110]], caps=[[0.6, 5.6, 'In the Gulf, drinking water came from electric desalination.', 'desalination'], [7.6, 11.6, 'Millions must leave the desert. On foot.', 'On foot']]))
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(len(GULF))]; V.S(t + 6.6, 'stamp_3', 0.7); dy(t + 12, 8)
t = V.sc('balls', 9.0, id='EB4', bg='desert', balls=[[K['QA'] if 'QA' in K else K['SA'], 640, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['OM'] if 'OM' in K else K['IR'], 1280, 640, 230, 'normal', 'none', None, 'CAMEL OWNER']],
         bubs=[[0.6, 0, 'I own 4 supercars.'], [3.2, 1, 'I own 4 camels.'], [5.8, 0, 'Trade you all of them for one.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 9)
EX = [[P(-74, 40.7), P(-77, 42)], [P(2.35, 48.85), P(0, 47)], [P(121.5, 31.2), P(117, 32)], [P(-46.6, -23.5), P(-50, -21)], [P(72.9, 19.1), P(76, 21)], [P(139.7, 35.7), P(138, 37)], [P(-99.1, 19.4), P(-101, 21)], [P(3.4, 6.5), P(6, 9)]]
t = map_(13, 'E9', **DARK(cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], cells=[RADZ()], arrows=[[0.8 + i * 0.4, 4.2 + i * 0.4, *a, *b, '#ffffff', 20] for i, (a, b) in enumerate(EX)],
         counters=[[0.8, 'PEOPLE LEAVING THE CITIES', [[0.8, 0], [11, 2.6e9]], 'big', '#ffffff']], caps=[[0.6, 5.6, 'Week 2. Cities can\'t feed or water anyone.', 'Cities'], [6.6, 12.6, 'The greatest exodus in history: back to the land.', 'back to the land']], useBar=True))
[V.SV(t + 0.8 + i * 0.4, 'whoosh', 0.25) for i in range(len(EX))]; dy(t + 13, 14); popk(t + 13, 96)
t = map_(12, 'E9B', **DARK(cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], cells=[RADZ()], tints=[tint(ks('IN', 'CN', 'BR', 'US', 'NG', 'ID', 'ET', 'FR', 'UA', 'AR', 'MX', 'VN', 'TH'), '#3bd16f', [[0.8, 0], [4, 0.4]], 0.1)],
         counters=[[0.8, 'FARM WORK DONE BY HAND', [[0.8, 0.05], [9, 0.97]], 'pct', '#3bd16f']], caps=[[0.6, 5.6, 'Tractors are dead metal. Fields are worked by hand again.', 'by hand'], [6.6, 11.6, 'Half of humanity becomes farmers within a year.', 'farmers']], useBar=True))
dy(t + 12, 14.5)
RUR = [('NE', 83), ('NP', 79), ('ET', 78), ('KE', 71), ('IN', 64), ('VN', 62), ('BD', 61), ('PK', 62)]
t = V.sc('rank', 10.0, id='ERK1', title='READY FOR LIFE WITHOUT POWER (% RURAL)', rows=[[K[c], [[0, 0], [7, v]]] for c, v in RUR if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #ffd96a, #fff3c8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 15)

# ======================= CAP 3: LOS VIEJOS CAMINOS =======================
t = map_(13, 'E10', **DARK(chap=[0.0, 2.6, 'CHAPTER 3', 'THE OLD WAYS'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], cells=[RADZ()], useBar=True,
         counters=[[3.0, 'HORSES ON EARTH', [[3, 5.8e7], [4, 5.8e7]], 'big', '#ffd96a'], [6.0, 'WORTH OF ONE HORSE (IN CARS)', [[6, 0], [11, 40]], 'int', '#ffd96a', 'br']],
         caps=[[3.0, 7.6, 'Month 2. Horses, oxen and bicycles rule the roads.', 'Horses'], [8.0, 12.6, 'A healthy horse is worth more than 40 cars.', '40 cars']]))
V.chap_snd(t); V.M(t, t + 60, 'saga', 0, 0.65, 1.0, 0.8); dy(t + 13, 60); popk(t + 13, 88)
t = V.sc('balls', 9.0, id='EB5', bg='street', balls=[[K['DE'], 640, 640, 230, 'smug', 'none', None, 'BLACKSMITH'], [K['DE'], 1280, 640, 220, 'scared', 'tie', None, 'EX-PROGRAMMER']],
         bubs=[[0.6, 1, 'Do you need an app?'], [3.2, 0, 'I need iron. And arms.'], [6.0, 1, 'I have... arms.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.4, 'cannon', 0.2); dy(t + 9, 70)
t = map_(14, 'E11', **DARK(cam=[[0, *P(20, 48), 0.85], [14, *P(25, 48), 0.85]], cells=[dict(mode='dist', t0=0, seeds=None, spd=60, col='#ffffff', a=0.35)],
         pins=[[0.8, *P(2.35, 48.85), 'PARIS: "THE KING IS DEAD"', '#ffffff'], [9.0, *P(37.6, 55.75), 'MOSCOW HEARS IT: DAY 9', '#ffffff']],
         caps=[[0.6, 6.0, 'News now travels at the speed of a horse.', 'speed of a horse'], [7.0, 13.6, 'A message from Paris takes 9 days to reach Moscow.', '9 days']]))
V.SC[-1][3]['cells'][0]['seeds'] = [[round(t + 0.8, 2), *P(2.35, 48.85)]]
V.S(t + 0.8, 'ding', 0.4); V.S(t + 9, 'ding', 0.4); dy(t + 14, 90)
SAIL = [[P(-40, -35), P(5, 40)], [P(-60, 25), P(-20, 45)], [P(-170, 30), P(150, 30)], [P(60, -10), P(80, 5)], [P(140, -40), P(110, -10)], [P(20, -40), P(60, -20)]]
t = map_(12, 'E12', **DARK(cam=[[0, 3840, 2050, 0.28], [12, 3840, 2050, 0.3]], cells=[RADZ()], arrows=[[0.8 + i * 0.5, 5.0 + i * 0.5, *a, *b, '#cfd8e8', 18] for i, (a, b) in enumerate(SAIL)],
         caps=[[0.6, 5.6, 'Sailing ships return to the oceans.', 'Sailing ships'], [6.6, 11.6, 'Crossing the Atlantic takes 6 weeks again.', '6 weeks']]))
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.2) for i in range(len(SAIL))]; V.S(t, 'wind', 0.4); dy(t + 12, 120)
t = V.sc('balls', 9.0, id='EB5B', bg='water', balls=[[K['PT'], 640, 640, 230, 'smug', 'none', None, 'CAPTAIN'], [K['BR'], 1280, 640, 220, 'scared', 'none', None, 'NEW SAILOR', {'sweat': True}]],
         bubs=[[0.6, 1, 'How do we know where we are?'], [3.4, 0, 'The stars, kid.'], [6.0, 0, 'My great-great-grandpa did this.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'wind', 0.4); dy(t + 9, 125)
COAL = ks('CN', 'IN', 'US', 'AU', 'RU', 'ID', 'ZA', 'DE', 'PL', 'KZ')
t = map_(13, 'E13', **DARK(cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], cells=[RADZ()], tints=[tint(COAL, '#ff9a5a', [[0.6, 0], [4, 0.45]], 0.15, stroke='#ffffff')], parts=['dust', 50],
         stamps=[[7.0, 'THE STEAM AGE 2.0', 960, 470, '#ff9a5a', 110]], caps=[[0.6, 5.6, 'Steam engines need no electricity. Just coal, water and iron.', 'Steam'], [8.0, 12.6, 'Coal countries become the new powers.', 'Coal']]))
V.S(t + 7, 'stamp_2', 0.8); V.S(t + 7, 'braam3', 0.5); dy(t + 13, 200)
t = map_(12, 'E13B', **DARK(cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], cells=[RADZ()], icons=[[0.6 + i * 0.4, *xy, 'biohazard', '#ff9a9a', 40] for i, xy in enumerate(CITIES[:10])],
         counters=[[0.8, 'VACCINES SPOILED', [[0.8, 0], [8, 1.0]], 'pct', '#ff9a9a']], caps=[[0.6, 5.6, 'No X-rays. No fridges for vaccines. No sterile machines.', 'vaccines'], [6.6, 11.6, 'Medicine falls back 150 years.', '150 years']], useBar=True))
V.S(t + 1, 'downlifter', 0.4); dy(t + 12, 205)
STM = [('CN', 96), ('IN', 88), ('US', 85), ('RU', 79), ('AU', 72), ('ID', 64), ('ZA', 58), ('PL', 51)]
t = V.sc('rank', 10.0, id='ERK2', title='NEW SUPERPOWERS: COAL & STEAM', rows=[[K[c], [[0, 0], [7, v]]] for c, v in STM if c in K], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ff9a5a, #ffd8c0)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 220)
WARA = [[P(37, 51), P(31, 50)], [P(75, 33), P(71, 31)], [P(44, 33), P(51, 33)], [P(30, 2), P(25, -2)], [P(-66, 7), P(-74, 4)]]
t = map_(14, 'E14', **DARK(cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], cells=[RADZ()], war=True,
         arrows=[[2.0 + i * 0.6, 5.4 + i * 0.6, *a, *b, RED, 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'THE CAVALRY WARS', '#c3100a']],
         caps=[[3.6, 8.6, 'No drones. No missiles. No radios.', 'No drones'], [9.0, 13.6, 'Armies march on foot and horseback, like in 1850.', '1850']]))
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 50, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.S(tt, 'cannon', 0.3)
V.S(t + 0.4, 'braam2', 0.6); V.M(t, t + 14.4, 'march', 0, 0.8, 0.4, 0.6); dy(t + 14, 300)
t = V.sc('balls', 9.0, id='EB6', bg='desert', balls=[[K['RU'], 640, 640, 230, 'angry', 'general', None, 'GENERAL'], [K['RU'], 1280, 640, 220, 'scared', 'delta', None, 'SOLDIER']],
         bubs=[[0.6, 0, 'Fire the missiles!'], [3.0, 1, 'Sir... they\'re electric.'], [5.6, 0, '...Fire the CANNON then!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 7, 'cannon', 0.6); dy(t + 9, 310)
t = V.sc('balls', 9.0, id='EB6B', bg='street', balls=[[K['NG'], 640, 640, 230, 'smug', 'none', None, 'FARMER'], [K['US'], 1280, 640, 220, 'scared', 'tie', None, 'EX-CEO']],
         bubs=[[0.6, 1, 'I ran a tech company with 90,000 people.'], [4.0, 0, 'Can you milk a goat?'], [6.4, 1, '...Teach me.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 320)

# ======================= CAP 4: EL NUEVO MUNDO =======================
t = map_(13, 'E15', **DARK(chap=[0.0, 2.6, 'CHAPTER 4', 'A DARKER WORLD'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], cells=[RADZ()], useBar=True,
         counters=[[3.0, 'POPULATION', [[3, 8.1e9], [11, 4.9e9]], 'big', '#ffffff']], caps=[[3.0, 7.6, 'Year 1. Hunger, cold and disease take their toll.', 'toll'], [8.0, 12.6, 'Earth can only feed what muscle and sun can grow.', 'muscle']]))
V.chap_snd(t); V.M(t, t + 50, 'nocturne', 0, 0.65, 1.0, 0.8); dy(t + 13, 365); popk(t + 13, 60)
t = V.sc('bignum', 6.0, id='EBN2', kf=[[0, 8.1e9], [4, 4.9e9]], fmt='big', top='PEOPLE ALIVE AFTER ONE YEAR', label=[4.0, 'BACK TO THE POPULATION OF 1985', AMB])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 365)
HEL = [[P(2.35, 48.85), P(-3.7, 40.4)], [P(-3.7, 40.4), P(-9.1, 38.7)], [P(2.35, 48.85), P(13.4, 52.5)], [P(13.4, 52.5), P(21, 52.2)], [P(21, 52.2), P(37.6, 55.75)], [P(12.5, 41.9), P(23.7, 37.98)]]
t = map_(12, 'E16', **DARK(cam=[[0, *P(15, 48), 0.9], [12, *P(15, 48), 1.0]], arrows=[[0.8 + i * 0.5, 3.4 + i * 0.5, *a, *b, '#ffffff', 10] for i, (a, b) in enumerate(HEL)],
         caps=[[0.6, 5.6, 'Year 3. A mirror network flashes messages from hill to hill.', 'mirror'], [6.6, 11.6, 'Paris to Moscow: now 1 day instead of 9.', '1 day']]))
[V.S(t + 0.8 + i * 0.5, 'ding', 0.2) for i in range(len(HEL))]; dy(t + 12, 1100)
t = map_(12, 'E16B', **DARK(cam=[[0, *P(30, 50), 1.0], [12, *P(30, 50), 1.1]], cells=[RADZ()], pins=[[1.0, *P(30.1, 51.4), 'RADIATION ZONE · 300 YEARS', RAD], [5.0, *P(1.5, 47), 'LOIRE VALLEY · CLOSED', RAD]],
         caps=[[0.6, 5.6, 'The radiation zones will stay deadly for centuries.', 'centuries'], [6.6, 11.6, 'The new map has holes no one will ever enter.', 'holes']]))
V.S(t + 1, 'tinnitus', 0.25); dy(t + 12, 1500)
BIGP = [('IN', 1050), ('CN', 690), ('NG', 190), ('ID', 160), ('PK', 150), ('ET', 110), ('BD', 105), ('BR', 100)]
t = V.sc('rank', 10.0, id='ERK3', title='LARGEST POPULATIONS · YEAR 5 (MILLIONS)', rows=[[K[c], [[0, 0], [7, v]]] for c, v in BIGP if c in K], fmt='int', unit='M', col='linear-gradient(90deg, #ffd96a, #fff3c8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 1825)
RAIL = [[P(-74, 40.7), P(-87.6, 41.9)], [P(-87.6, 41.9), P(-104.9, 39.7)], [P(116.4, 39.9), P(121.5, 31.2)], [P(77.2, 28.6), P(72.9, 19.1)], [P(37.6, 55.75), P(60.6, 56.8)], [P(2.35, 48.85), P(13.4, 52.5)]]
t = map_(12, 'E17', **DARK(cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], cells=[RADZ()], arrows=[[0.8 + i * 0.5, 4.0 + i * 0.5, *a, *b, '#ff9a5a', 18] for i, (a, b) in enumerate(RAIL)], useBar=True,
         caps=[[0.6, 5.6, 'Year 10. Steam trains link the big cities again.', 'Steam trains'], [6.6, 11.6, 'The world is slow... but it moves.', 'slow']]))
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(len(RAIL))]; dy(t + 12, 3650); popk(t + 12, 62)
t = V.sc('balls', 9.0, id='EB7', bg='night', balls=[[K['BR'], 640, 680, 170, 'normal', 'none', None, 'AGE 9'], [K['BR'], 1280, 640, 230, 'normal', 'none', None, 'GRANDMA']], props=[['torch', 960, 420, 90, '#ffb060']],
         bubs=[[0.6, 0, 'Grandma, what was the internet?'], [3.6, 1, 'A window to the whole world.'], [6.2, 1, 'In your pocket. Glowing.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 3700)
t = map_(13, 'E18', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.27]], night=[[0, 0.75]], cells=[dict(mode='rand', t0=99999, dur=1, col='#ff9a3a', a=0.9, off=True, dens=0.025, r=5.5)],
         stamps=[[6.0, 'EARTH AT NIGHT · YEAR 20', 960, 460, AMB, 96, 0]], caps=[[0.6, 5.6, 'From space, Earth at night is almost black.', 'black'], [8.0, 12.6, 'Only campfires... and candles.', 'candles']])
V.S(t + 6.0, 'stamp_2', 0.6); V.S(t + 6.0, 'braam3', 0.4); V.M(t, t + 25, 'ambient', 0, 0.6, 1.0, 1.0); dy(t + 13, 7300)
t = V.sc('end', 12.0, id='WEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.35)', lines=[[0.8, 'WOULD YOU SURVIVE THE DARK?', 300, 100, 99, AMB]], ask=[2.6, 'First thing you\'d do without power? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='DAY', kf=DY, fmt='int'), bar=dict(label='HUMANITY', kf=POP, sub=None))
V.export()
