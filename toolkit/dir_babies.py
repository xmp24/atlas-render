"""Vídeo 3: What If Humans Stopped Having Babies — el mundo envejece, se vacía y la naturaleza vuelve."""
from wsim import *
V = Vid('babies', seed=33)
YR = []; POP = []
def yr(t, y): YR.append([round(t, 2), y])
def popk(t, p): POP.append([round(t, 2), p])
# orden de "apagado" por envejecimiento (los más viejos primero)
OLD = ['JP', 'IT', 'DE', 'KR', 'ES', 'PT', 'GR', 'BG', 'FI', 'AT', 'FR', 'GB', 'RU', 'CN', 'US', 'CA', 'PL', 'UA', 'SE', 'NO', 'CH', 'NL', 'BE', 'CZ', 'HU', 'RO', 'AU', 'NZ', 'AR', 'CL', 'BR', 'MX', 'TR', 'IR', 'TH', 'VN', 'IN', 'ID', 'EG', 'SA', 'PK', 'BD', 'PH', 'CO', 'PE', 'ZA', 'KE', 'ET', 'NG', 'CD', 'NE', 'ML', 'TD', 'SO', 'AO', 'TZ', 'UG', 'MZ']
GREEN = '#3e9a3a'
def lights(): return dict(mode='rand', t0=0, dur=1, col='#000000', a=0)   # placeholder
EMPTY_EV = []   # [k, t, x, y] para la capa de abandono
EMPTY = lambda: dict(mode='country', ev=EMPTY_EV, col='#8a8f96', col2='#9a9ea4', a=0.75, spd=900)
NATURE_SEEDS = []
NAT_EV = []
NATURE = lambda: dict(mode='country', ev=NAT_EV, col=GREEN, col2='#2f8a2a', a=0.82, spd=300)
def map_(d, id, **kw):
    kw.setdefault('cells', [EMPTY(), NATURE()]); return V.sc('map', d, id=id, **kw)

# ======================= TRÁILER =======================
t = V.sc('title', 8.0, id='BA_A', hard=True, cam=[[0, *P(2.35, 48.85), 2.0], [8, *P(2.35, 48.85), 2.4]], Tmap=99999, cells=[dict(mode='rand', t0=-10, dur=1, col=GREEN, a=0.85)], filter='saturate(0.7)',
         texts=[[0.6, 3.8, 'PARIS. 2130.', 120, 470], [4.0, 7.8, 'NOT A SINGLE HUMAN LEFT.', 84, 480, '#b8ff9a', 'rgba(120,255,120,0.6)']], flash=[0.4], parts=['dust', 40])
V.S(t + 0.35, 'braam', 0.9); V.S(t + 0.4, 'birds', 0.4); V.S(t + 4.0, 'thit', 0.6); V.M(t + 0.3, t + 8, 'horror', 0, 0.45, 0.4, 0.4)
CT = [('NEW YORK', P(-74, 40.7)), ('TOKYO', P(139.7, 35.7)), ('LONDON', P(-0.1, 51.5)), ('MOSCOW', P(37.6, 55.75)), ('ROME', P(12.5, 41.9)), ('BEIJING', P(116.4, 39.9)), ('RIO', P(-43.2, -22.9)), ('CAIRO', P(31.2, 30)), ('MUMBAI', P(72.9, 19.1)), ('SYDNEY', P(151.2, -33.9)), ('LAGOS', P(3.4, 6.5)), ('MEXICO CITY', P(-99.1, 19.4))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.0], T=0, cells=[dict(mode='rand', t0=0, dur=0.5, col=GREEN, a=0.85)], pins=[[0, *xy, n + ' · EMPTY', '#3bd16f']], grade='rgba(60,200,90,0.18)') for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + 12 * 0.55 + 0.4, id='BA_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'NO MORE BABIES.', 140], [3.6, 7.4, 'EVER.', 220, 540, '#ff6a5a']])
V.M(t, t + 7.4, 'tension', 40, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(12)]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='BA_C', hard=True, kf=[[0, 8.2e9], [4.5, 1]], fmt='big', top='HUMANS ON EARTH', label=[3.6, 'THE LAST ONE DIES ALONE', '#ff6a5a'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 1.1, 'heartbeat', 0.8); V.S(t + 2.1, 'heartbeat', 0.7); V.S(t + 4.5, 'tinnitus', 0.2)
t = V.sc('title', 8.5, id='BA_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, grad='radial-gradient(ellipse at 50% 85%, rgba(255,180,200,0.3), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF HUMANS', 250, 140], [0.5, 'STOPPED HAVING BABIES?', 410, 120, '#ffb0c8']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2)
yr(t + 8.5, 2030); popk(0, 8.2)

# ======================= CAP 1: EL ÚLTIMO NACIMIENTO =======================
t = map_(12, 'BA1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE LAST BIRTH'], cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.33]], counters=[[3.0, 'BABIES BORN TODAY', [[3, 385000], [9, 0]], 'int', '#ffb0c8']],
         caps=[[3.0, 7.4, '2030. Every day, 385,000 babies are born.', '385,000'], [7.8, 11.8, 'Then one day... zero.', 'zero']])
V.chap_snd(t); V.M(t, t + 40, 'nocturne', 0, 0.6, 1.0, 0.8); [V.S(t + 3.2 + i * 0.6, 'tick', 0.3) for i in range(10)]; V.S(t + 9.0, 'sub_drop', 0.6); yr(t + 12, 2030)
t = V.sc('balls', 10.0, id='BB1', bg='lab', balls=[[K['US'], 600, 640, 230, 'scared', 'none', None, 'DOCTOR'], [K['IN'], 1320, 640, 230, 'scared', 'none', None, 'NURSE']], props=[['siren', 960, 300, 110, '#ff3b30']],
         bubs=[[0.6, 0, 'No births. Anywhere.'], [3.4, 1, 'In the whole world?'], [6.2, 0, 'Not a single one.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'beep_hi', 0.4); yr(t + 10, 2030.5)
LABS = [P(-71.1, 42.4), P(-122.2, 37.4), P(-0.1, 51.5), P(8.5, 47.4), P(2.35, 48.85), P(13.4, 52.5), P(139.7, 35.7), P(116.4, 39.9), P(126.98, 37.56), P(77.6, 13), P(34.8, 32.1), P(151.2, -33.9), P(-46.6, -23.5), P(37.6, 55.75)]
t = map_(12, 'BA1B', cam=[[0, 3840, 1900, 0.3], [12, 3840, 1900, 0.32]], icons=[[0.8 + i * 0.35, *xy, 'magnifying-glass', '#9fd4ff', 44] for i, xy in enumerate(LABS)],
         counters=[[1.0, 'SCIENTISTS ON THE CASE', [[1, 0], [10, 2.4e6]], 'big', '#9fd4ff']], caps=[[0.6, 5.6, 'Every lab on Earth searches for the cause.', 'Every lab'], [6.6, 11.6, 'They find nothing.', 'nothing']])
[V.S(t + 0.8 + i * 0.35, 'beep_hi', 0.15) for i in range(len(LABS))]; yr(t + 12, 2030.7)
REP = [('US', 0.5), ('CN', 0.8), ('IN', 1.1), ('BR', 1.4), ('NG', 1.7), ('RU', 2.0), ('JP', 2.3), ('DE', 2.6), ('MX', 2.9), ('ID', 3.2), ('EG', 3.5), ('FR', 3.8), ('AU', 4.1), ('ZA', 4.4), ('AR', 4.7), ('PK', 5.0)]
t = map_(12, 'BA0', cam=[[0, 3840, 2050, 0.28], [12, 3840, 2050, 0.3]], pins=[[x, *cap(c), '0 BIRTHS', '#ff6a5a'] for c, x in REP], tints=[tint([K[c] for c, x in REP], '#ff3b30', [[0.5, 0], [6, 0.35]], 0.3)],
         caps=[[0.6, 5.6, 'Every country reports the same thing.', 'same thing'], [6.6, 11.6, 'Zero. Zero. Zero.', 'Zero']])
[V.S(t + x, 'beep_lo', 0.3) for c, x in REP]; yr(t + 12, 2030.8)
t = V.sc('balls', 10.0, id='BB1B', bg='dark', balls=[[K['RU'], 400, 640, 220, 'angry'], [K['US'], 960, 640, 220, 'scared'], [K['BR'], 1520, 640, 220, 'scared']], props=[['tv', 960, 300, 140, '#9fd4ff']],
         bubs=[[0.5, 0, 'It\'s a bioweapon!'], [3.2, 1, 'It\'s the 5G!'], [6.0, 2, 'It\'s God\'s punishment!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'glitch', 0.4); yr(t + 10, 2030.9)
t = V.sc('news', 15.0, id='BN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0], [8, 1]],
         bubs=[[1.2, 0, 'Breaking news.'], [3.2, 0, 'No baby has been born in 9 months.'], [7.4, 0, 'Not one. Anywhere on Earth.'], [11.2, 0, 'Scientists have no answer.']],
         papers=[[5.4, 'THE GLOBE DAILY', 'THE LAST GENERATION?'], [9.4, 'WORLD EVENING POST', 'ZERO BIRTHS']], ticker='BREAKING: ZERO BIRTHS WORLDWIDE FOR 9 MONTHS  •  CAUSE UNKNOWN  •  YOUNGEST HUMAN IS NOW 9 MONTHS OLD  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 15, 'newsroom', 0, 0.6, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.4, 9.4]]; yr(t + 15, 2031)
t = V.sc('call', 13.0, id='BC1', ks=ks('US', 'CN', 'IN', 'JP'), banner='EMERGENCY SUMMIT', eyes=['scared', 'angry', 'scared', 'scared'],
         bubs=[[1.0, 0, 'Billions for research. Now.'], [3.6, 1, 'Whoever finds a cure... rules the world.'], [7.0, 2, 'What if there is no cure?'], [9.6, 3, 'Then we are the last.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'glitch', 0.4); yr(t + 13, 2032)

# ======================= CAP 2: UN MUNDO SIN NIÑOS =======================
SCH = [P(-74, 40.7), P(2.35, 48.85), P(139.7, 35.7), P(77.2, 28.6), P(-46.6, -23.5), P(116.4, 39.9), P(37.6, 55.75), P(-0.1, 51.5), P(3.4, 6.5), P(151.2, -33.9), P(-99.1, 19.4), P(31.2, 30)]
t = map_(14, 'BA2', chap=[0.0, 2.6, 'CHAPTER 2', 'A WORLD WITHOUT CHILDREN'], cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.32]],
         pins=[[3.0 + i * 0.4, *xy, None, '#ffb0c8'] for i, xy in enumerate(SCH)], counters=[[3.0, 'SCHOOLS CLOSED', [[3, 0], [13, 2.4e6]], 'big', '#ffb0c8']],
         caps=[[3.0, 8.4, '2036. Kindergartens close. Then schools.', 'schools'], [9.0, 13.6, 'Toy shops, maternity wards, playgrounds: empty.', 'empty']])
V.chap_snd(t); V.M(t, t + 48, 'tension', 10, 0.65, 0.8, 0.8); yr(t + 14, 2036)
t = V.sc('balls', 10.0, id='BB2', bg='sky', balls=[[K['FR'], 960, 640, 260, 'scared', 'none', None, None, {'tears': True}]], props=[['house', 1400, 560, 160, '#ffb0c8']],
         bubs=[[0.6, 0, 'The last school in Paris...'], [4.0, 0, '...closed today.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2040)
t = map_(12, 'BA2B', cam=[[0, *P(10, 48), 0.9], [12, *P(12, 47), 1.0]], counters=[[1.0, 'MATERNITY WARDS CLOSED', [[1, 0], [10, 1.2e5]], 'big', '#ffb0c8']],
         pins=[[1.0 + i * 0.4, *xy, None, '#ffb0c8'] for i, xy in enumerate([P(2.35, 48.85), P(13.4, 52.5), P(-3.7, 40.4), P(12.5, 41.9), P(-0.1, 51.5), P(21, 52.2), P(16.4, 48.2), P(4.9, 52.4)])],
         caps=[[0.6, 5.6, 'Hospitals close their maternity wards.', 'maternity'], [6.6, 11.6, 'Midwives become the first jobs to vanish.', 'vanish']])
yr(t + 12, 2040.5)
t = V.sc('balls', 10.0, id='BB2C', bg='street', balls=[[K['IT'], 640, 650, 200, 'normal', 'none', None, 'TEACHER'], [K['ES'], 1260, 650, 200, 'scared', 'none', None, 'TOY MAKER']],
         props=[['closed-doors', 960, 420, 200, '#c9cdd3']], bubs=[[0.6, 0, 'My school closes Friday.'], [3.8, 1, 'Nobody has bought a toy in years.'], [7.2, 0, 'What do we do now?']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2040.8)
t = V.sc('news', 14.0, id='BN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3],
         bubs=[[1.0, 0, 'Ten years without a single birth.'], [4.4, 0, 'The youngest humans are now celebrities.'], [8.4, 0, 'Everyone wants to see the last kids.']],
         papers=[[5.6, 'TEEN WEEKLY', 'THE LAST GENERATION'], [9.6, 'THE GLOBE DAILY', '10 YEARS. ZERO BABIES.']], ticker='10 YEARS WITHOUT BIRTHS  •  LAST GENERATION TURNS 10  •  TOY INDUSTRY COLLAPSES  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.6]]; yr(t + 14, 2041)
t = V.sc('balls', 10.0, id='BB2B', bg='sky', balls=[[K['GB'], 760, 640, 230, 'normal'], [K['GB'], 1200, 700, 140, 'normal', 'none', None, 'DOG']], props=[['footprint', 1500, 760, 80, '#cfb48a']],
         bubs=[[0.6, 0, 'He\'s not a dog.'], [3.4, 0, 'He\'s my son.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2043)
t = map_(13, 'BA3', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.31]], counters=[[1.0, 'YOUNGEST HUMAN ALIVE', [[1, 10], [12, 15]], 'int', '#ffb0c8']],
         caps=[[0.6, 5.6, '2045. The youngest person on Earth is 15.', 'is 15'], [6.6, 12.6, 'They become the most famous people in the world.', 'most famous']],
         mballs=[[3.0, 12.6, K['BR'], *P(-50, -12), 150, 'shades'], [3.4, 12.6, K['KR'], *P(128, 36), 130, 'shades'], [3.8, 12.6, K['NG'], *P(8, 9), 130, 'shades']])
yr(t + 13, 2045); popk(t + 13, 7.6)
RK = [('JP', 62), ('IT', 60), ('KR', 59), ('DE', 58), ('ES', 58), ('CN', 55), ('US', 51), ('BR', 49), ('IN', 45), ('NG', 38)]
t = V.sc('rank', 10.0, id='BRK1', title='AVERAGE AGE · 2045', rows=[[K[c], [[0, v - 10], [9, v]]] for c, v in RK], fmt='int', unit=' years', col='linear-gradient(90deg, #ff8ab0, #ffd0e0)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2046)

# ======================= CAP 3: LA ECONOMÍA SE ROMPE =======================
t = map_(14, 'BA4', chap=[0.0, 2.6, 'CHAPTER 3', 'THE COLLAPSE'], cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.32]], tints=[tint(ks(*OLD[:16]), '#ff3b30', [[3, 0], [6, 0.35]], 0.1)],
         counters=[[3.0, 'WORKERS LEFT', [[3, 3.1e9], [13, 1.6e9]], 'big', '#ff9a8a']], stamps=[[9.4, 'PENSIONS COLLAPSE', 960, 480, '#ff3b30', 90]],
         caps=[[3.0, 8.4, '2055. Not enough young people to work.', 'Not enough'], [10.6, 13.6, 'Who takes care of 6 billion elderly?', '6 billion']])
V.chap_snd(t); V.M(t, t + 46, 'drive', 0, 0.7, 0.6, 0.8); V.S(t + 9.4, 'stamp_3', 0.8); yr(t + 14, 2055); popk(t + 14, 6.6)
t = V.sc('balls', 10.0, id='BB3', bg='lab', balls=[[K['JP'], 640, 640, 240, 'normal'], [K['KR'], 1300, 640, 220, 'smug']], props=[['laptop', 960, 560, 120, '#9fd4ff']],
         bubs=[[0.6, 0, 'Robots will do the work now.'], [3.6, 1, 'Robots don\'t pay taxes.'], [6.6, 0, 'Robots don\'t complain either.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2058)
t = V.sc('news', 14.0, id='BN3', anchor=K['GB'], tvp=dict(cells=[dict(mode='rand', t0=-10, dur=1, col='#8a8f96', a=0.5)]), cam=[3840, 2050, 0.3], fear=[[0, 1]],
         bubs=[[1.0, 0, 'Governments suspend all pensions.'], [4.6, 0, 'There is nobody left to pay for them.'], [8.4, 0, 'Riots in 40 countries.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'PENSIONS: GONE'], [9.6, 'WORLD EVENING POST', 'WHO PAYS NOW?']], ticker='PENSIONS SUSPENDED WORLDWIDE  •  ELDERLY RIOTS IN 40 COUNTRIES  •  ROBOT CARE WORKERS IN DEMAND  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.6]]; yr(t + 14, 2059)
RB = [('KR', 9.1), ('JP', 8.4), ('CN', 6.2), ('DE', 5.9), ('SG', 5.5), ('US', 4.2), ('IT', 3.9), ('FR', 3.1)]
t = V.sc('rank', 10.0, id='BRK2', title='ROBOTS PER 10 HUMANS · 2060', rows=[[K[c], [[0, 0], [9, v]]] for c, v in RB if c in K], fmt='int', col='linear-gradient(90deg, #9fd4ff, #e8f6ff)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2060)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
t = map_(14, 'BA5', cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.31]], war=True, arrows=[[2.0, 5.0, *P(10, 50), *P(8, 10), '#ff3b30', 24], [2.6, 5.6, *P(100, 40), *P(105, 15), '#ff3b30', 24], [3.2, 6.2, *P(-95, 40), *P(-90, 15), '#ff3b30', 24]],
         banners=[[0.4, 3.0, 'THE WAR FOR THE YOUNG', '#c3100a']], caps=[[6.6, 13.6, 'Old nations try to grab the last young workers.', 'last young workers']])
for i, b in enumerate([P(8, 10), P(105, 15), P(-90, 15)]):
    for j in range(5):
        tt = t + 5.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-80, 80), b[1] + random.randint(-60, 60)
        WAR['fx'].append([round(tt, 2), x, y, 70, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); V.SV(tt, 'boom', 0.3)
yr(t + 14, 2062); popk(t + 14, 6.0)

# ======================= CAP 4: CIUDADES VACÍAS =======================
t0_empty = V.T
t = map_(16, 'BA6', chap=[0.0, 2.6, 'CHAPTER 4', 'EMPTY CITIES'], cam=[[0, 3840, 2050, 0.28], [16, 3840, 2050, 0.3]], useBar=True, barIn=3,
         caps=[[3.0, 8.4, '2070. Whole countries start to go silent.', 'go silent'], [9.0, 15.6, 'Japan, Italy, Korea... first.', 'first']])
V.chap_snd(t); V.M(t, t + 60, 'nocturne', 20, 0.7, 1.0, 0.8); yr(t + 16, 2072); popk(t + 16, 4.4)
t = map_(12, 'BA7', cam=[[0, *P(138, 36), 1.5], [12, *P(139, 36), 1.7]], useBar=True, pins=[[1.0, *P(139.7, 35.7), 'TOKYO', '#8a8f96'], [2.0, *P(135.5, 34.7), 'OSAKA', '#8a8f96']],
         stamps=[[5.0, 'JAPAN: LAST CITIZEN DIES', 960, 480, '#ff3b30', 80]], caps=[[6.4, 11.6, 'The first great nation to vanish.', 'vanish']])
V.S(t + 5.0, 'stamp_3', 0.7); yr(t + 12, 2078); popk(t + 12, 3.6)
t = map_(12, 'BA7B', cam=[[0, *P(-100, 40), 0.9], [12, *P(-100, 40), 1.0]], useBar=True, pins=[[1.0, *P(-115.1, 36.2), 'LAS VEGAS: DARK', '#8a8f96'], [2.2, *P(-118.2, 34), 'LOS ANGELES: 3% LEFT', '#8a8f96'], [3.4, *P(-87.6, 41.9), 'CHICAGO: FORESTS', '#3bd16f']],
         caps=[[0.6, 5.6, 'America\'s cities empty out.', 'empty out'], [6.6, 11.6, 'Suburbs disappear under trees.', 'trees']])
yr(t + 12, 2080)
t = map_(12, 'BA6B', cam=[[0, *P(100, 35), 0.8], [12, *P(100, 35), 0.85]], useBar=True, pins=[[1.0, *P(116.4, 39.9), 'BEIJING: SILENT', '#8a8f96'], [2.2, *P(121.5, 31.2), 'SHANGHAI: 4% LEFT', '#8a8f96'], [3.4, *P(37.6, 55.75), 'MOSCOW: EMPTY', '#8a8f96']],
         caps=[[0.6, 5.6, 'China and Russia empty out.', 'empty out'], [6.6, 11.6, 'Megacities with no one in them.', 'no one']])
yr(t + 12, 2082)
t = V.sc('call', 12.0, id='BC2', ks=ks('US', 'CN', 'IN', 'NG'), banner='THE LAST SUMMIT', eyes=['scared', 'normal', 'scared', 'normal'], bcol='#5a3a8a',
         bubs=[[1.0, 0, 'Who will remember us?'], [3.6, 1, 'Nobody. Unless we leave a message.'], [7.0, 2, 'For the stars?'], [9.4, 3, 'For whoever comes next.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 12, 2082)
t = map_(13, 'BA8', cam=[[0, *P(10, 48), 1.0], [13, *P(10, 47), 1.1]], useBar=True, pins=[[1.0, *P(2.35, 48.85), 'WOLVES IN PARIS', '#3bd16f'], [2.4, *P(12.5, 41.9), 'DEER IN ROME', '#3bd16f'], [3.8, *P(13.4, 52.5), 'FORESTS IN BERLIN', '#3bd16f']],
         caps=[[0.6, 5.6, '2085. Nature takes back the cities.', 'Nature'], [6.6, 12.6, 'Roads crack. Trees grow through roofs.', 'Trees']])
[V.S(t + x, 'birds', 0.25) for x in [1.0, 4.0]]; yr(t + 13, 2085); popk(t + 13, 2.4)
t = V.sc('bignum', 6.0, id='BBN1', kf=[[0, 8.2e9], [4, 1.1e9]], fmt='big', top='HUMANS LEFT IN 2090', label=[3.0, 'AVERAGE AGE: 78', '#ffb0c8'], bgc='radial-gradient(ellipse, #3a0a1a, #000 70%)', glow='rgba(255,140,180,0.8)')
V.S(t + 0.1, 'thit', 0.8); V.S(t + 0.4, 'heartbeat', 0.7); yr(t + 6, 2090); popk(t + 6, 1.1)
t = V.sc('balls', 10.0, id='BB4', bg='night', balls=[[K['IT'], 640, 640, 230, 'normal'], [K['ES'], 1300, 640, 230, 'scared']], parts=['dust', 20],
         bubs=[[0.6, 0, 'Remember when cities were loud?'], [3.8, 1, 'I remember children laughing.'], [7.0, 0, 'Nobody will remember us.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'wind', 0.3); yr(t + 10, 2094)
t = V.sc('balls', 10.0, id='BB6', bg='lab', balls=[[K['JP'], 700, 640, 230, 'normal', 'none', None, 'GRANDMA, 97'], [K['KR'], 1280, 640, 200, 'shades', 'none', None, 'CARE ROBOT']],
         bubs=[[0.6, 1, 'Time for your medicine.'], [3.6, 0, 'You\'re the only one who visits me.'], [7.0, 1, 'I know.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2095)
t = map_(12, 'BA8B', cam=[[0, *P(15.5, 78.2), 1.0], [12, *P(15, 75), 0.6]], useBar=True, rings=[[0.8, *P(15.5, 78.2), '#ffd23f', 3]], pins=[[1.0, *P(15.5, 78.2), 'SVALBARD: THE HUMAN ARCHIVE', '#ffd23f']],
         icons=[[6.0, *P(-80.6, 28.5), 'missile', '#ffffff', 60]], caps=[[1.4, 5.6, 'All human knowledge, sealed in the Arctic.', 'sealed'], [6.6, 11.6, 'A last message is launched into space.', 'into space']])
V.S(t + 1.0, 'stamp_2', 0.5); V.S(t + 6.0, 'launch', 0.6); yr(t + 12, 2097)

# ======================= CAP 5: LOS ÚLTIMOS HUMANOS =======================
t = map_(15, 'BA9', chap=[0.0, 2.6, 'CHAPTER 5', 'THE LAST HUMANS'], cam=[[0, 3840, 2050, 0.28], [15, 3840, 2050, 0.29]], useBar=True,
         counters=[[3.0, 'YOUNGEST HUMAN ALIVE', [[3, 68], [14, 80]], 'int', '#ffb0c8']], caps=[[3.0, 8.4, '2110. The youngest human is 80 years old.', '80 years old'], [9.0, 14.6, 'The whole world is a retirement home.', 'retirement home']])
V.chap_snd(t); V.M(t, t + 40, 'ambient', 0, 0.65, 1.0, 1.0); yr(t + 15, 2110); popk(t + 15, 0.05)
LAST = [('NG', P(8, 9)), ('ET', P(39, 9)), ('NE', P(9, 17)), ('CD', P(23, -2)), ('IN', P(80, 22)), ('BR', P(-50, -12))]
t = map_(13, 'BA10', cam=[[0, *P(20, 5), 0.6], [13, *P(25, 5), 0.65]], useBar=True, rings=[[1.0 + i * 0.5, *xy, '#ffb0c8', 3] for i, (c, xy) in enumerate(LAST)],
         caps=[[0.6, 5.6, 'The last humans live where the population was youngest.', 'youngest'], [6.6, 12.6, 'Africa holds the last of humanity.', 'Africa']])
yr(t + 13, 2120); popk(t + 13, 0.0005)
t = map_(12, 'BA10B', cam=[[0, *P(20, 0), 0.6], [12, *P(22, 0), 0.65]], useBar=True,
         icons=[[1.0 + i * 0.5, *xy, 'footprint', '#ffd23f', 80] for i, xy in enumerate([P(35, -2), P(25, -15), P(10, 5), P(40, 8), P(-60, -5), P(100, 25)])],
         caps=[[0.6, 5.6, 'Elephants walk through empty highways.', 'Elephants'], [6.6, 11.6, 'Wildlife numbers explode.', 'explode']])
V.S(t + 1, 'birds', 0.4); yr(t + 12, 2124)
RL = [('NG', 1800), ('NE', 900), ('CD', 700), ('ET', 650), ('TD', 400), ('IN', 300), ('BR', 120), ('ML', 100)]
t = V.sc('rank', 10.0, id='BRK3', title='LAST COUNTRIES WITH PEOPLE · 2125', rows=[[K[c], [[0, v * 3], [9, v]]] for c, v in RL if c in K], fmt='int', unit=' people', col='linear-gradient(90deg, #ff8ab0, #ffd0e0)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2125)
t = V.sc('bignum', 7.0, id='BBN2', kf=[[0, 1000], [5.5, 1]], fmt='int', top='HUMANS LEFT · 2129', label=[4.5, 'ONE.', '#ff6a5a'], bgc='radial-gradient(ellipse, #1a1a1a, #000 70%)', glow='rgba(255,255,255,0.6)')
V.S(t + 0.2, 'heartbeat', 0.6); V.S(t + 1.4, 'heartbeat', 0.5); V.S(t + 2.6, 'heartbeat', 0.4); V.S(t + 4.5, 'thit', 0.6); yr(t + 7, 2129)
t = V.sc('balls', 10.0, id='BB5', bg='sky', balls=[[K['NG'], 960, 640, 260, 'normal', 'none', None, 'THE LAST HUMAN']], parts=['dust', 20],
         bubs=[[1.0, 0, 'Hello?...'], [4.4, 0, 'Is anybody still there?']], props=[['palm-tree', 1400, 560, 150, '#3ad16a']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'birds', 0.4); V.S(t + 5, 'wind', 0.3); yr(t + 10, 2130); popk(t + 10, 0)
t = map_(13, 'BA11', cam=[[0, 3840, 2050, 0.27], [13, 3840, 2050, 0.3]], useBar=True, stamps=[[2.0, 'EARTH: 0 HUMANS', 960, 440, '#3bd16f', 100, 0]],
         caps=[[5.4, 12.6, 'For the first time in 300,000 years... silence.', 'silence']])
V.S(t + 2.0, 'stamp_2', 0.6); V.M(t, t + 26, 'saga', 0, 0.6, 1.0, 2.0); V.S(t + 1, 'birds', 0.4); yr(t + 13, 2131)
t = map_(12, 'BA12', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.29]], banners=[[0.4, 3.4, 'THE YEAR 2500', '#2a8a3a']], caps=[[3.6, 7.6, 'Cities are hills covered in forest.', 'forest'], [8.0, 11.6, 'As if we were never here.', 'never here']])
V.S(t + 0.4, 'whoosh_5', 0.5); V.S(t + 1.0, 'birds', 0.4); yr(t + 0.1, 2131); yr(t + 0.2, 2500); yr(t + 12, 2500)
t = V.sc('end', 12.0, id='BEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], cells=[EMPTY(), NATURE()], lines=[[0.8, 'WOULD YOU WANT', 230, 110, 99], [1.2, 'TO BE THE LAST ONE?', 370, 110, 99, '#ffb0c8']], ask=[2.6, 'Tell us in the comments 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

# ======================= datos globales =======================
for i, c in enumerate([c for c in OLD if c in K]):
    k = K[c]; x, y = cap(c); te = t0_empty + 3.0 + i * 0.55 if i < 30 else t0_empty + 3.0 + 30 * 0.55 + (i - 30) * 2.4
    EMPTY_EV.append([k, round(te, 2), x, y])
for k in range(len(codes)):   # el resto de países, al final
    if codes[k] in OLD or k not in CAP: continue
    x, y = cap(codes[k]); EMPTY_EV.append([k, round(t0_empty + 60 + random.uniform(0, 50), 2), x, y])
for e in EMPTY_EV: NAT_EV.append([e[0], round(e[1] + 22, 2), e[2], e[3]])
V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='YEAR', kf=YR, fmt='yr'), bar=dict(label='HUMANITY', kf=[[a, b / 8.2 * 100] for a, b in POP], sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
