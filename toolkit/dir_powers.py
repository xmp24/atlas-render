"""Vídeo 13: What If Every Country Had a Superpower — cada país, un poder; diez años de inventos, invasiones y sorpresas."""
from wsim import *
V = Vid('powers', seed=1313)
YR = []
def yr(t, y): YR.append([round(t, 2), y])
ALLK = sorted(set(K.values()))
GOLD = '#ffd23f'; RED = '#ff3b30'
CEV = []
def conquer(c, new, t, dur=3.0):
    if c not in K or new not in K: return
    x, y = cap(c); CEV.append([round(t, 2), 0, K[c], K[new], K[c], x, y, dur])
def map_(d, id, **kw): return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
def boom_at(t, c, n=5, spread=60, snd=True):
    if c not in K: return
    x0, y0 = cap(c)
    for j in range(n):
        tt = t + j * 0.45; x, y = x0 + random.randint(-spread, spread), y0 + random.randint(-spread, spread)
        WAR['fx'].append([round(tt, 2), x, y, 55, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 8, 2), x, y])
        if snd: V.SV(tt, 'boom', 0.25)
# poderes (ficción): país -> (poder, categoría)
PW = {'US': ('FLIGHT', 'body'), 'CN': ('CLONING', 'mind'), 'IN': ('PERFECT MEMORY', 'mind'), 'RU': ('IMMUNE TO COLD', 'body'), 'BR': ('SUPER SPEED', 'body'), 'JP': ('STOP TIME · 1 SEC', 'mind'),
      'NG': ('SUPER STRENGTH', 'body'), 'EG': ('CONTROL SAND', 'elem'), 'SA': ('FIND WATER', 'elem'), 'NL': ('BREATHE UNDERWATER', 'nature'), 'CH': ('INVISIBILITY', 'mind'), 'IS': ('CONTROL FIRE', 'elem'),
      'AU': ('TALK TO ANIMALS', 'nature'), 'CA': ('HEALING', 'nature'), 'MX': ('SUPER LUCK', 'mind'), 'FR': ('PERFECT TASTE', 'joke'), 'BE': ('GLOW IN THE DARK', 'joke'), 'GB': ('MIND READING', 'mind'),
      'DE': ('BUILD ANYTHING', 'mind'), 'KR': ('NEVER TIRED', 'body'), 'ID': ('CONTROL WAVES', 'elem'), 'AR': ('CONTROL WEATHER', 'elem'), 'KE': ('SUPER VISION', 'body'), 'NO': ('CONTROL ICE', 'elem'),
      'IT': ('CHARM ANYONE', 'mind'), 'TR': ('SHIELDS', 'body'), 'PK': ('SUPER HEARING', 'body'), 'ET': ('ENDLESS STAMINA', 'body'), 'CO': ('GROW PLANTS FAST', 'nature'), 'PE': ('MOUNTAIN WALKING', 'body'),
      'ZA': ('X-RAY VISION', 'body'), 'PL': ('UNBREAKABLE BONES', 'body'), 'UA': ('SUPER HARVEST', 'nature'), 'IR': ('SPEAK ALL LANGUAGES', 'mind'), 'TH': ('TALK TO PLANTS', 'nature'), 'MN': ('RIDE ANY ANIMAL', 'nature'),
      'CL': ('FEEL EARTHQUAKES', 'elem'), 'GR': ('NEVER SICK', 'body'), 'SE': ('INVISIBLE TO RADAR', 'mind'), 'FI': ('SUPER SILENCE', 'joke'), 'DZ': ('DESERT SPEED', 'body'), 'VN': ('HIDE IN JUNGLE', 'nature')}
CATC = {'body': '#ff5a3a', 'mind': '#b98aff', 'elem': '#39b6ff', 'nature': '#3bd16f', 'joke': '#ffd23f'}
CATN = {'body': 'BODY', 'mind': 'MIND', 'elem': 'ELEMENTS', 'nature': 'NATURE', 'joke': '...USELESS'}
def cat_tints(a=0.5, t0=0.5, stag=0.03):
    return [tint(ks(*[c for c, v in PW.items() if v[1] == cg]), col, [[t0 + i * 0.6, 0], [t0 + i * 0.6 + 1, a]], stag, stroke='#ffffff') for i, (cg, col) in enumerate(CATC.items())]
def ball(c, x, eyes='smug', y=640, s=210, acc='none', extra=None): return [K[c], x, y, s, eyes, acc, None, PW[c][0], extra or {}]

# ======================= TRÁILER =======================
t = V.sc('balls', 7.0, id='S_A', hard=True, bg='sky', bscale=1.0, balls=[[K[c], 230 + i * 245, 640, 170, 'smug', 'none', 0.2 + i * 0.35, PW[c][0]] for i, c in enumerate(['US', 'JP', 'BR', 'EG', 'CN', 'NG', 'CH', 'BE'])])
[V.S(t + 0.2 + i * 0.35, 'whip', 0.35) for i in range(8)]; V.S(t + 3.2, 'riser_2s', 0.5); V.M(t, t + 7, 'heroic', 0, 0.6, 0.2, 0.3)
CT = [('USA', 'US'), ('JAPAN', 'JP'), ('BRAZIL', 'BR'), ('EGYPT', 'EG'), ('CHINA', 'CN'), ('NIGERIA', 'NG'), ('SWITZERLAND', 'CH'), ('ICELAND', 'IS'), ('NETHERLANDS', 'NL'), ('RUSSIA', 'RU'), ('INDIA', 'IN'), ('BELGIUM', 'BE')]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*cap(c), 1.6 if c not in ('RU', 'US', 'CN', 'BR') else 0.7], T=0, pins=[[0, *cap(c), PW[c][0], CATC[PW[c][1]]]], grade='rgba(255,210,60,0.12)') for i, (n, c) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='S_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'EVERY COUNTRY...', 130], [3.6, 7.4, 'ONE SUPERPOWER.', 150, 540, GOLD, 'rgba(255,210,60,0.8)']])
V.M(t, t + 7.4, 'frantic', 120, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('title', 6.0, id='S_C', hard=True, cam=[[0, 3840, 2050, 0.3], [6, 3840, 2050, 0.32]], Tmap=0, tints=cat_tints(0.55, -10, 0), filter='brightness(0.6)',
         texts=[[0.2, 3.0, 'WHO INVADES WHO?', 130, 540, '#ffffff', 'rgba(255,60,60,0.6)'], [3.0, 6.0, 'WHO RULES THE WORLD?', 130, 540, GOLD, 'rgba(255,210,60,0.7)']], flash=[3.0])
V.S(t + 0.2, 'braam', 0.9); V.S(t + 3.0, 'thit', 0.9)
t = V.sc('title', 8.5, id='S_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, tints=cat_tints(0.4, -10, 0), filter='brightness(0.55)', grad='radial-gradient(ellipse at 50% 85%, rgba(255,210,60,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF EVERY COUNTRY', 250, 128], [0.5, 'HAD A SUPERPOWER?', 410, 140, GOLD]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 200, 0.8, 0.05, 1.2); yr(t + 8.5, 2030)

# ======================= CAP 1: EL DESPERTAR =======================
t = map_(14, 'P1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE AWAKENING'], cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.32]], tints=cat_tints(0.65, 3.0),
         pins=[[3.0 + i * 0.6, 900 + i * 1400, 4000, CATN[cg], col] for i, (cg, col) in enumerate(CATC.items())] if False else [],
         caps=[[3.0, 8.0, 'January 1st, 2030. Everyone wakes up... different.', 'different'], [8.4, 13.6, 'Each country\'s people share one power: body, mind, elements, nature... or something useless.', 'useless']])
V.chap_snd(t); V.M(t, t + 50, 'voyage', 0, 0.65, 1.0, 0.8); [V.S(t + 3 + i * 0.6, 'ding', 0.3) for i in range(5)]; yr(t + 14, 2030)
t = V.sc('balls', 10.0, id='SB1', bg='sky', balls=[ball('US', 600, extra={'float': [0.8, 9.8, 260, 15]}), ball('JP', 1320, 'normal')],
         bubs=[[0.6, 0, 'Americans can FLY!'], [3.6, 1, 'Japan can stop time for one second.'], [6.8, 0, 'One second? That\'s it?'], [8.4, 1, 'Enough to win any fight.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.8, 'whoosh_6', 0.5); yr(t + 10, 2030)
t = V.sc('balls', 10.0, id='SB2', bg='desert', balls=[ball('EG', 600), ball('SA', 1320, 'normal')], props=[['fluffy-cloud', 600, 360, 120, '#e8b060'], ['anchor', 1320, 380, 90, '#7ad0ff']],
         bubs=[[0.6, 0, 'Egyptians control the sand.'], [3.4, 1, 'Saudis can feel water underground.'], [6.6, 0, 'Together... we turn the desert green!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.6, 'wind', 0.4); yr(t + 10, 2030.05)
t = V.sc('balls', 10.0, id='SB3', bg='street', balls=[ball('CN', 520), ball('CN', 820), ball('CN', 1120), ball('BR', 1480, 'smug', extra={'walk': 30})],
         bubs=[[0.6, 0, 'Chinese can clone themselves. For one hour.'], [4.0, 3, 'Brazilians run at 300 km/h!'], [7.0, 1, 'We are three. You are one.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.6, 'whip', 0.5); yr(t + 10, 2030.1)
t = V.sc('balls', 10.0, id='SB4', bg='office', balls=[ball('BE', 640, 'scared', extra={'tears': True}), ball('FR', 1280, 'smug')],
         bubs=[[0.6, 0, 'Belgium got... glowing in the dark.'], [3.8, 1, 'France got perfect taste.'], [6.8, 0, 'You already HAD that!']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2030.15)
t = V.sc('balls', 10.0, id='SB4B', bg='ice', balls=[ball('IS', 640, 'smug'), ball('KR', 1280, 'normal', acc='tie')], props=[['torch', 640, 360, 90, '#ff6a1a']],
         bubs=[[0.6, 0, 'Icelanders control fire. Free heating!'], [4.0, 1, 'Koreans never get tired.'], [6.8, 1, 'I\'ve been working for 3 days. I feel great.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2030.17)
TOP = [('JP', 97), ('US', 95), ('CN', 94), ('CH', 91), ('NG', 88), ('GB', 86), ('AR', 84), ('BR', 82)]
t = V.sc('rank', 10.0, id='SRK1', title='MOST DANGEROUS POWERS (EXPERT RANKING)', rows=[[K[c], [[0, 0], [7, v]], PW[c][0]] for c, v in TOP], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ff5a3a, #ffb0a0)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2030.2)
LOW = [('BE', 4), ('FI', 7), ('FR', 9), ('MN', 18), ('TH', 21), ('PE', 26), ('IR', 31), ('GR', 35)]
t = V.sc('rank', 9.0, id='SRK2', title='MOST USELESS POWERS', rows=[[K[c], [[0, 0], [6, v]], PW[c][0]] for c, v in LOW], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ffd23f, #fff0b0)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 9, 2030.25)
t = V.sc('news', 14.0, id='SN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.3], [10, 0.8]],
         bubs=[[1.0, 0, 'I can read your mind right now. Sorry.'], [4.4, 0, 'Every nation now has a superpower.'], [8.4, 0, 'Governments are already making plans.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'A WORLD OF POWERS'], [9.8, 'WORLD EVENING POST', 'WHO WINS?']], ticker='BREAKING: EVERY COUNTRY HAS A SUPERPOWER  •  JAPAN CAN STOP TIME  •  BELGIUM GLOWS  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.6, 9.8]]; yr(t + 14, 2030.3)

# ======================= CAP 2: LOS AÑOS DORADOS =======================
t = map_(13, 'P2', chap=[0.0, 2.6, 'CHAPTER 2', 'THE GOLDEN YEARS'], cam=[[0, *P(35, 25), 0.9], [13, *P(38, 24), 1.0]], tints=[tint(ks('EG', 'SA', 'LY', 'SD'), '#3bd16f', [[3, 0], [9, 0.55]], 0.4)],
         counters=[[3.0, 'DESERT TURNED GREEN (KM²)', [[3, 0], [12, 1.4e6]], 'big', '#3bd16f']], caps=[[3.0, 7.6, 'Year 2. Egypt and Saudi Arabia team up.', 'team up'], [8.0, 12.6, 'Sand moves. Water rises. The Sahara blooms.', 'blooms']])
V.chap_snd(t); V.M(t, t + 70, 'triumph', 0, 0.65, 1.0, 0.8); V.S(t + 3, 'riser_4s', 0.4); yr(t + 13, 2032)
t = map_(12, 'P3', cam=[[0, *P(5, 52), 1.6], [12, *P(4, 53), 1.8]], tints=[tint(ks('NL'), '#39b6ff', [[0.8, 0], [3, 0.5]])], pins=[[1.0, *P(4.5, 53.5), 'UNDERWATER CITY', '#39b6ff'], [4.0, *P(3.5, 54.5), 'SEA FARMS', '#39b6ff']],
         caps=[[0.6, 5.6, 'The Dutch build cities under the North Sea.', 'under the North Sea'], [6.6, 11.6, 'For once, rising seas are good news.', 'good news']])
V.S(t + 1, 'ding', 0.3); yr(t + 12, 2033)
t = V.sc('balls', 10.0, id='SB5', bg='lab', balls=[ball('IN', 640, 'normal'), ball('DE', 1280, 'smug')],
         bubs=[[0.6, 0, 'Indians remember everything they ever read.'], [4.0, 1, 'Germans can build anything they imagine.'], [7.0, 0, 'Let\'s build a rocket. By Friday.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2033.5)
t = map_(12, 'P4', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[tint(ks('IN', 'DE'), '#b98aff', [[0, 0.45]])], icons=[[1.0, *P(80.2, 13.7), 'incoming-rocket', '#ffffff', 60], [3.0, *P(8, 50), 'incoming-rocket', '#ffffff', 60]],
         stamps=[[6.0, 'MARS · YEAR 4', 960, 460, GOLD, 120]], caps=[[0.6, 5.6, 'India + Germany reach Mars in just 18 months.', 'Mars'], [7.6, 11.6, 'The space race has new champions.', 'champions']])
V.S(t + 1, 'launch', 0.5); V.S(t + 3, 'launch', 0.5); V.S(t + 6, 'stamp_2', 0.7); yr(t + 12, 2034)
t = map_(12, 'P5', cam=[[0, *P(134, -25), 0.95], [12, *P(134, -25), 1.05]], icons=[[0.8 + i * 0.4, *xy, 'footprint', '#3bd16f', 50] for i, xy in enumerate([P(120, -22), P(135, -20), P(145, -30), P(150, -25), P(130, -30), P(118, -30)])],
         caps=[[0.6, 5.6, 'Australians talk to animals.', 'talk to animals'], [6.6, 11.6, 'Sharks agree to stay away from beaches. Mostly.', 'Mostly']])
V.S(t + 0.8, 'birds', 0.4); yr(t + 12, 2034.3)
t = V.sc('balls', 10.0, id='SB6', bg='bunker', balls=[ball('CH', 960, 'shades', extra={'out': 3.6})], props=[['padlock', 960, 360, 110, GOLD]],
         bubs=[[0.6, 0, 'Invisible Swiss can enter any vault on Earth.'], [5.0, 0, '(you can\'t see me, but I\'m still here)']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 3.6, 'whoosh_6', 0.5); yr(t + 10, 2034.6)
t = map_(12, 'P6', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], tints=[tint(ks('CH'), '#b98aff', [[0, 0.55]])], arrows=[[0.8 + i * 0.4, 3.6 + i * 0.4, *cap(c), *cap('CH'), GOLD, 16] for i, c in enumerate(['US', 'GB', 'JP', 'CN', 'SA', 'RU', 'DE'])],
         counters=[[0.8, 'GOLD MISSING WORLDWIDE (TONS)', [[0.8, 0], [10, 9200]], 'int', GOLD]], caps=[[0.6, 5.6, 'Central banks report missing gold. Lots of it.', 'missing gold'], [6.6, 11.6, 'Nobody can prove a thing.', 'prove']])
[V.SV(t + 0.8 + i * 0.4, 'whoosh', 0.2) for i in range(7)]; yr(t + 12, 2035)
t = V.sc('balls', 10.0, id='SB6B', bg='office', balls=[ball('GB', 640, 'smug', acc='tie'), ball('IT', 1280, 'smug')],
         bubs=[[0.6, 0, 'The British read minds. Poker is over.'], [4.0, 1, 'Italians can charm anyone.'], [6.8, 0, 'I know what you\'re planning... and I like it.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2035.1)

# ======================= CAP 3: LAS GUERRAS DE PODER =======================
t = map_(13, 'P7', chap=[0.0, 2.6, 'CHAPTER 3', 'POWER WARS'], war=True, cam=[[0, *P(0, 12), 0.9], [13, *P(2, 12), 1.0]], banners=[[3.0, 6.4, 'NIGERIA: SUPER STRENGTH', '#1f8a3a']],
         caps=[[3.0, 7.6, 'Year 5. Nigeria\'s super-strong soldiers march.', 'march'], [8.0, 12.6, 'Benin, Niger and Chad fall in weeks.', 'fall']])
for i, c in enumerate(['BJ', 'NE', 'TD']): conquer(c, 'NG', t + 6.0 + i * 1.6, 2.6); boom_at(t + 5.4 + i * 1.6, c, 4)
V.chap_snd(t); V.S(t + 3, 'braam2', 0.6); V.M(t, t + 60, 'frantic', 0, 0.75, 1.0, 0.8); yr(t + 13, 2035.3)
t = map_(12, 'P8', war=True, cam=[[0, *P(-56, -28), 1.1], [12, *P(-56, -28), 1.2]], banners=[[0.4, 3.4, 'BRAZIL: SUPER SPEED', '#1f8a3a']],
         caps=[[0.6, 5.6, 'Brazil\'s army runs at 300 km/h.', '300 km/h'], [6.6, 11.6, 'Uruguay and Paraguay fall in a single afternoon.', 'single afternoon']])
conquer('UY', 'BR', t + 4.0, 1.4); conquer('PY', 'BR', t + 5.6, 1.4); boom_at(t + 3.6, 'UY', 3); boom_at(t + 5.2, 'PY', 3)
V.S(t + 0.4, 'whip', 0.6); yr(t + 12, 2035.5)
t = V.sc('balls', 10.0, id='SB7', bg='desert', balls=[ball('BR', 640, 'smug', extra={'walk': 40}), ball('AR', 1300, 'angry')], props=[['lightning-storm', 1300, 340, 120, '#39b6ff']],
         bubs=[[0.6, 0, 'Argentina next!'], [3.4, 1, 'Run all you want...'], [6.4, 1, '...into a HURRICANE.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 6.4, 'wind', 0.7); V.S(t + 6.6, 'boom_6', 0.5); yr(t + 10, 2035.6)
t = map_(12, 'P9', war=True, cam=[[0, *P(-62, -32), 1.0], [12, *P(-60, -30), 1.1]], tints=[tint(ks('AR'), '#39b6ff', [[1, 0], [3, 0.45]])], parts=['dust', 120], shake=[[2, 6], [8, 0]],
         stamps=[[6.0, 'ARGENTINA HOLDS', 960, 460, '#39b6ff', 110]], caps=[[0.6, 5.6, 'Argentina controls the weather: storms stop the Brazilian army.', 'storms'], [7.4, 11.6, 'Speed is useless in a hurricane.', 'useless']])
V.S(t + 1, 'wind', 0.7); V.S(t + 6, 'stamp_2', 0.7); yr(t + 12, 2035.8)
t = map_(13, 'P10', war=True, cam=[[0, *P(105, 45), 0.8], [13, *P(105, 45), 0.85]], banners=[[0.4, 3.4, 'CHINA: CLONE ARMY', '#b01010']],
         counters=[[1.0, 'CLONED SOLDIERS', [[1, 0], [9, 4.0e7]], 'big', RED]], caps=[[0.6, 5.6, 'China clones its army: 40 million soldiers for one hour.', '40 million'], [7.0, 12.6, 'Mongolia falls before the clones disappear.', 'Mongolia']])
conquer('MN', 'CN', t + 7.0, 2.6); boom_at(t + 6.4, 'MN', 5, 120)
V.S(t + 0.4, 'braam2', 0.6); yr(t + 13, 2036)
t = V.sc('call', 13.0, id='SC1', ks=ks('US', 'CN', 'JP', 'GB'), banner='THE POWER SUMMIT', eyes=['angry', 'smug', 'normal', 'smug'],
         bubs=[[1.0, 0, 'Stop the invasions. NOW.'], [3.6, 1, 'Or what? Your flying army?'], [6.6, 2, '(stops time for one second and steals your pen)'], [9.6, 3, 'I read all your minds. Nobody is bluffing.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 13, 2036.2)
t = map_(13, 'P11', war=True, cam=[[0, *P(20, 30), 0.85], [13, *P(22, 28), 0.9]], banners=[[0.4, 3.4, 'EGYPT: SANDSTORM ARMY', '#c98a2a']], parts=['dust', 120],
         caps=[[0.6, 5.6, 'Egypt turns the desert into a weapon.', 'weapon'], [7.0, 12.6, 'Giant sandstorms swallow Libya and Sudan.', 'Libya and Sudan']])
conquer('LY', 'EG', t + 6.0, 2.4); conquer('SD', 'EG', t + 7.6, 2.4); boom_at(t + 5.6, 'LY', 4, 120); boom_at(t + 7.2, 'SD', 4, 120)
V.S(t + 1, 'wind', 0.6); yr(t + 13, 2036.5)
t = V.sc('balls', 10.0, id='SB8', bg='ice', balls=[ball('RU', 640, 'smug'), ball('NO', 1280, 'angry')],
         bubs=[[0.6, 0, 'Russians feel no cold. Winter war is our game.'], [4.0, 1, 'Norway controls ice.'], [6.8, 1, 'Enjoy the frozen sea under your tanks.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 7, 'bone-crack', 0.5); yr(t + 10, 2036.7)
t = map_(12, 'P12', war=True, cam=[[0, *P(25, 65), 1.0], [12, *P(25, 65), 1.1]], tints=[tint(ks('NO', 'FI', 'SE'), '#bfe8ff', [[1, 0], [4, 0.5]])], stamps=[[6.4, 'THE ICE WALL', 960, 460, '#bfe8ff', 120]],
         caps=[[0.6, 5.6, 'The Nordics raise a wall of ice 200 meters high.', 'wall of ice'], [7.4, 11.6, 'Finland adds its power: total silence. Nobody hears them coming.', 'silence']])
V.S(t + 1, 'wind', 0.6); V.S(t + 6.4, 'stamp_2', 0.7); yr(t + 12, 2037)
t = map_(13, 'P13', war=True, cam=[[0, *P(-140, 30), 0.45], [13, *P(-150, 30), 0.5]], arrows=[[1.0 + i * 0.5, 4.0 + i * 0.5, *a, *b, '#ffffff', 22] for i, (a, b) in enumerate([[P(-120, 35), P(140, 30)], [P(-100, 40), P(130, 38)], [P(-80, 38), P(125, 33)]])],
         banners=[[0.4, 3.4, 'USA vs CHINA', '#c3100a']], caps=[[4.0, 8.6, 'Year 7. A flying American army crosses the Pacific.', 'flying'], [9.0, 12.6, 'Millions of clones wait on the beaches.', 'clones']])
[V.S(t + 1 + i * 0.5, 'jet', 0.4) for i in range(3)]; V.S(t + 0.4, 'braam2', 0.6); yr(t + 13, 2037.4)
t = map_(12, 'P14', war=True, cam=[[0, *P(122, 32), 1.0], [12, *P(120, 32), 1.1]], shake=[[1, 10], [6, 3], [12, 0]], stamps=[[7.0, 'STALEMATE', 960, 460, '#ffffff', 140]],
         caps=[[0.6, 5.6, 'The battle of Shanghai: flyers against clones.', 'Shanghai'], [8.0, 11.6, 'Neither side can win. Both lose a lot.', 'Neither']])
boom_at(t + 1.0, 'CN', 10, 160); V.S(t + 7, 'stamp_3', 0.8); yr(t + 12, 2037.6)
t = map_(12, 'P14B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], tints=[tint(ks('CA'), '#3bd16f', [[0, 0.5]])], arrows=[[0.8 + i * 0.5, 4.0 + i * 0.5, *cap('CA'), *cap(c), '#3bd16f', 18] for i, c in enumerate(['CN', 'US', 'BR', 'NG', 'EG', 'RU'])],
         caps=[[0.6, 5.6, 'Canada\'s healers fly to every battlefield.', 'healers'], [6.6, 11.6, 'They heal both sides. Every time.', 'both sides']])
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.2) for i in range(6)]; yr(t + 12, 2037.7)
t = V.sc('bignum', 6.0, id='SBN1', kf=[[0, 0], [4, 3.1e6]], fmt='big', top='KILLED IN THE POWER WARS', label=[4.0, 'SUPERPOWERS DON\'T MAKE PEACE', RED])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); yr(t + 6, 2037.8)

# ======================= CAP 4: EL GIRO =======================
t = map_(13, 'P15', chap=[0.0, 2.6, 'CHAPTER 4', 'THE TWIST'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], night=[[3, 0], [6, 0.82]],
         caps=[[3.0, 7.6, 'Year 8. A giant solar storm knocks out every power grid on Earth.', 'solar storm'], [8.0, 12.6, 'Total darkness. For weeks.', 'darkness']])
V.chap_snd(t); V.S(t + 4, 'blackout', 1.0); V.S(t + 4, 'sub_drop', 0.8); V.M(t, t + 40, 'nocturne', 0, 0.6, 1.0, 0.8); yr(t + 13, 2038)
t = map_(12, 'P16', cam=[[0, *P(4.5, 50.6), 1.8], [12, *P(4.5, 50.6), 2.0]], night=[[0, 0.82]], tints=[tint(ks('BE'), '#ffe680', [[1, 0], [3, 0.95]], 0, stroke='#ffffff')], rings=[[3.0, *P(4.5, 50.6), '#ffe680', 6]],
         stamps=[[5.6, 'BELGIUM GLOWS', 960, 460, '#ffe680', 130]], caps=[[0.6, 5.0, 'In the dark, one country shines.', 'shines'], [7.4, 11.6, '11 million glowing Belgians become the world\'s lightbulbs.', 'lightbulbs']])
V.S(t + 3, 'riser_2s', 0.5); V.S(t + 5.6, 'stamp_2', 0.8); V.S(t + 5.6, 'crowd_cheer', 0.5); yr(t + 12, 2038.1)
t = V.sc('balls', 10.0, id='SB9', bg='night', balls=[ball('BE', 960, 'shades', s=260), ball('US', 520, 'scared', s=180), ball('FR', 1400, 'scared', s=180)],
         bubs=[[0.6, 1, 'Belgium, could you come stand in our hospital?'], [4.0, 2, 'And our trains? Please?'], [7.0, 0, 'Who\'s useless NOW?']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2038.2)
HELP = [[P(4.5, 50.6), P(-74, 40.7)], [P(4.5, 50.6), P(116.4, 39.9)], [P(4.5, 50.6), P(77.2, 28.6)], [P(4.5, 50.6), P(-46.6, -23.5)], [P(4.5, 50.6), P(31.2, 30)], [P(4.5, 50.6), P(139.7, 35.7)]]
t = map_(12, 'P17', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.82], [12, 0.5]], tints=[tint(ks('BE'), '#ffe680', [[0, 0.95]])],
         arrows=[[0.8 + i * 0.4, 4.0 + i * 0.4, *a, *b, '#ffe680', 18] for i, (a, b) in enumerate(HELP)], caps=[[0.6, 5.6, 'Belgians fly out to light up hospitals and cities.', 'light up'], [6.6, 11.6, 'Even Canada\'s healers need them to see.', 'healers']])
[V.SV(t + 0.8 + i * 0.4, 'whoosh', 0.2) for i in range(len(HELP))]; yr(t + 12, 2038.3)
t = V.sc('news', 14.0, id='SN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.6], [10, 0.1]],
         bubs=[[1.0, 0, 'The grids are back. And something changed.'], [4.6, 0, 'In the dark, every nation needed every other one.'], [8.6, 0, 'Today, 190 countries signed the Powers Treaty.']],
         papers=[[5.8, 'THE GLOBE DAILY', 'THE POWERS TREATY'], [10.0, 'WORLD EVENING POST', 'BELGIUM HERO']], ticker='POWERS TREATY SIGNED  •  CONQUERED LANDS TO VOTE ON INDEPENDENCE  •  BELGIUM WINS PEACE PRIZE  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.8, 10.0]]; yr(t + 14, 2039)
t = map_(13, 'P18', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], tints=cat_tints(0.35, -10, 0),
         caps=[[0.6, 5.6, 'Conquered lands vote. Some stay, some leave.', 'vote'], [6.6, 12.6, 'Uruguay chooses freedom. Mongolia chooses freedom.', 'freedom']])
conquer('UY', 'UY', t + 6.6, 1.4); conquer('MN', 'MN', t + 8.6, 2.0); conquer('NE', 'NE', t + 10.0, 2.0)
V.S(t + 6.6, 'ding', 0.4); V.S(t + 8.6, 'ding', 0.4); V.S(t + 10, 'ding', 0.4); yr(t + 13, 2039.5)
FIN = [('JP', 99), ('BE', 96), ('IN', 94), ('US', 92), ('NG', 90), ('CN', 89), ('EG', 86), ('DE', 85)]
t = V.sc('rank', 10.0, id='SRK3', title='MOST INFLUENTIAL COUNTRIES · YEAR 10', rows=[[K[c], [[0, 0], [7, v]], PW[c][0]] for c, v in FIN], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ffd23f, #fff0b0)')
V.S(t + 0.2, 'whoosh_6', 0.5); V.M(t, t + 40, 'heroic', 0, 0.65, 1.0, 1.0); yr(t + 10, 2040)
t = V.sc('balls', 10.0, id='SB10', bg='sky', balls=[[K['NL'], 640, 680, 170, 'smug', 'none', None, 'AGE 8 · NL + JP'], [K['JP'], 1280, 640, 230, 'normal', 'none', None, 'DAD']],
         bubs=[[0.6, 0, 'Dad, I can breathe underwater AND stop time!'], [4.4, 1, 'Mixed kids get two powers.'], [7.2, 1, 'The world is about to get crazy.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2040.2)
t = map_(13, 'P19', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.27]], tints=cat_tints(0.4, -10, 0), stamps=[[6.0, 'A WORLD OF HEROES?', 960, 460, GOLD, 110, 0]],
         caps=[[0.6, 5.6, 'Year 10. A generation with two powers is growing up.', 'two powers'], [8.0, 12.6, 'Part 2 is coming...', 'Part 2']])
V.S(t + 6.0, 'stamp_2', 0.7); V.S(t + 6.0, 'braam3', 0.4); yr(t + 13, 2040.5)
t = V.sc('end', 12.0, id='SEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], tints=cat_tints(0.3, -10, 0), filter='brightness(0.5)', lines=[[0.8, 'WHAT POWER WOULD YOUR COUNTRY GET?', 300, 86, 99, GOLD]], ask=[2.6, 'Tell us in the comments 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['war'] = WAR; V.extra['cev'] = CEV
V.extra['hud'] = dict(top=dict(label='YEAR', kf=YR, fmt='yr'))
V.export()
