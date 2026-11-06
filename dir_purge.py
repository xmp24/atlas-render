"""Vídeo 6: What If The Purge Was Real — una noche al año todo crimen es legal; la noche barre el mapa huso a huso."""
from wsim import *
V = Vid('purge', seed=66)
YR = []
def yr(t, y): YR.append([round(t, 2), y])
RED = '#c3100a'
ALLK = sorted(set(K.values()))
OPT = ks('JP', 'NZ', 'IS', 'NO', 'CH', 'CA', 'FI', 'DK', 'SG', 'IE', 'AT', 'PT', 'UY', 'CR', 'BT')   # países que se niegan (ficción)
SAFE = lambda a=0.45: tint(OPT, '#2a7ad8', [[-100, a], [0, a]], 0, stroke='#ffffff')
TZL = []; SPAN = []
S0 = 178.0
def sweep(t0, t1, l0, l1):
    TZL.extend([[round(t0, 2), l0], [round(t1, 2), l1]]); SPAN.extend([[round(t0, 2), min(180, S0 - l0)], [round(t1, 2), min(180, S0 - l1)]])
NIGHT = lambda: dict(mode='tz', t0=0, col=RED, col2='#ff6a4a', a=0.5, band=9, lvl=TZL, span=SPAN)
def map_(d, id, **kw):
    kw.setdefault('tints', [SAFE()]); return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))

# ======================= TRÁILER =======================
t = V.sc('title', 7.0, id='P_A', hard=True, bg='black', texts=[[0.3, 3.4, 'ONE NIGHT A YEAR', 110], [3.4, 7.0, 'ALL CRIME IS LEGAL', 120, 540, '#ff3b30', 'rgba(255,40,40,0.9)', 12]], flash=[3.4])
V.S(t + 0.2, 'siren', 0.7); V.S(t + 3.4, 'braam', 0.9); V.S(t + 3.4, 'thit', 0.8); V.M(t + 3.4, t + 7, 'horror', 30, 0.5, 0.2, 0.3)
CT = [('SYDNEY', P(151.2, -33.9)), ('TOKYO', P(139.7, 35.7)), ('SHANGHAI', P(121.5, 31.2)), ('MUMBAI', P(72.9, 19.1)), ('DUBAI', P(55.3, 25.2)), ('ISTANBUL', P(28.97, 41)), ('PARIS', P(2.35, 48.85)),
      ('LAGOS', P(3.4, 6.5)), ('LONDON', P(-0.1, 51.5)), ('SÃO PAULO', P(-46.6, -23.5)), ('NEW YORK', P(-74, 40.7)), ('LOS ANGELES', P(-118.2, 34))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · 7:00 PM', '#ff6a5a']], grade='rgba(200,0,0,0.3)', filter='brightness(0.55) saturate(0.6)', parts=['ember', 40]) for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='P_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, '12 HOURS.', 150], [3.6, 7.4, 'NO POLICE. NO RULES.', 110, 540, '#ff6a5a', 'rgba(255,60,60,0.7)']])
V.M(t, t + 7.4, 'frantic', 20, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='P_C', hard=True, kf=[[0, 10], [5, 0]], fmt='int', top='THE PURGE BEGINS IN', label=[5.0, 'NOW', '#ff3b30'], col='#ffffff', glow='rgba(255,40,40,0.9)', bgc='radial-gradient(ellipse, #3a0606, #000 70%)')
[V.S(t + 0.1 + i * 0.5, 'tick', 0.5) for i in range(10)]; V.S(t + 5.0, 'siren', 0.8); V.S(t + 5.0, 'thit', 0.9)
t = V.sc('title', 8.5, id='P_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='brightness(0.6)', tint2='rgba(160,0,0,0.3)', grad='radial-gradient(ellipse at 50% 85%, rgba(255,30,30,0.4), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF THE PURGE', 250, 140], [0.5, 'WAS REAL?', 410, 160, '#ff3b30']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2); yr(t + 8.5, 2031)

# ======================= CAP 1: LA LEY =======================
t = V.sc('map', 13, id='P1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE LAW'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]],
         caps=[[3.0, 7.6, '2031. A strange global treaty is signed.', 'treaty'], [8.0, 12.6, 'One night a year, for 12 hours, every crime is legal.', 'every crime']])
V.chap_snd(t); V.M(t, t + 50, 'spy', 0, 0.6, 1.0, 0.8); V.S(t + 8, 'stamp_2', 0.5); yr(t + 13, 2031.1)
t = V.sc('title', 12.0, id='P1B', bg='black', texts=[[0.3, 3.0, 'THE RULES', 120, 380, '#ff3b30'], [3.0, 5.8, '1. STARTS AT 7 PM, LOCAL TIME', 66, 560], [5.8, 8.6, '2. ENDS AT 7 AM', 66, 560], [8.6, 12.0, '3. NO HELP. NO POLICE. NO HOSPITALS.', 62, 560, '#ff6a5a']])
[V.S(t + x, 'thit', 0.6) for x in [0.3, 3.0, 5.8, 8.6]]; yr(t + 12, 2031.15)
t = V.sc('news', 14.0, id='PN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.3], [10, 0.9]],
         bubs=[[1.0, 0, 'Breaking news.'], [3.0, 0, 'The first Purge Night is in 30 days.'], [7.2, 0, 'Experts say crime will drop the rest of the year.'], [11.0, 0, 'Others say it\'s madness.']],
         papers=[[5.4, 'THE GLOBE DAILY', 'PURGE LAW PASSES'], [9.4, 'WORLD EVENING POST', '30 DAYS LEFT']], ticker='BREAKING: GLOBAL PURGE TREATY SIGNED  •  FIRST PURGE NIGHT IN 30 DAYS  •  15 COUNTRIES REFUSE TO TAKE PART  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.4, 9.4]]; yr(t + 14, 2031.2)
t = V.sc('call', 13.0, id='PC1', ks=ks('US', 'BR', 'JP', 'NG'), banner='THE PURGE SUMMIT', eyes=['smug', 'normal', 'angry', 'scared'],
         bubs=[[1.0, 0, 'Let people release their anger. One night.'], [4.0, 1, 'And the other 364 nights are peaceful?'], [7.0, 2, 'Japan says NO. We opt out.'], [10.0, 3, 'Can our people come to you?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 13, 2031.25)
t = V.sc('map', 12, id='P2', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[SAFE(0) | dict(a=[[1, 0], [4, 0.6]], stag=0.15)],
         stamps=[[5.6, '15 COUNTRIES SAY NO', 960, 470, '#2a7ad8', 100]], caps=[[0.6, 5.0, 'A few countries refuse to join.', 'refuse'], [7.0, 11.6, 'They become the safest places on Earth.', 'safest']])
V.S(t + 5.6, 'stamp_2', 0.7); [V.S(t + 1 + i * 0.15, 'ding', 0.15) for i in range(10)]; yr(t + 12, 2031.3)
t = V.sc('balls', 10.0, id='PB1', bg='street', balls=[[K['US'], 600, 650, 220, 'scared', 'none', None, 'SHOP OWNER', {'sweat': True}], [K['US'], 1320, 650, 220, 'angry', 'none', None, 'NEIGHBOR']],
         props=[['padlock', 960, 430, 130, '#ffd23f']], bubs=[[0.6, 0, 'Steel shutters. Three locks. Done.'], [3.8, 1, 'Nice shutters, Bob.'], [6.8, 1, 'See you on Purge Night.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.4, 'steel_door', 0.6); yr(t + 10, 2031.35)
FLY = [[P(-74, 40.7), P(-79, 44)], [P(2.35, 48.85), P(8, 47)], [P(121, 31), P(139, 36)], [P(-46, -23), P(-56, -34)], [P(77, 28), P(90, 27)], [P(151, -33), P(174, -41)], [P(-0.1, 51.5), P(-8, 53)]]
t = map_(12, 'P3', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], arrows=[[0.8 + i * 0.5, 3.6 + i * 0.5, *a, *b, '#7ad0ff', 20] for i, (a, b) in enumerate(FLY)],
         counters=[[0.8, 'FLIGHTS TO SAFE COUNTRIES', [[0.8, 0], [8, 61000]], 'int', '#7ad0ff'], [6.0, 'GUNS SOLD THIS MONTH', [[6, 0], [11.5, 4.2e7]], 'big', '#ff6a5a', 'br']],
         caps=[[0.6, 5.6, 'Millions buy plane tickets out.', 'tickets'], [6.6, 11.6, 'Everyone else buys locks... and guns.', 'guns']])
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(len(FLY))]; V.S(t + 6, 'gun_3', 0.3); yr(t + 12, 2031.4)
t = V.sc('balls', 10.0, id='PB2', bg='bunker', balls=[[K['AE'] if 'AE' in K else K['SA'], 700, 640, 240, 'shades', 'tie', None, 'BILLIONAIRE'], [K['GB'], 1300, 660, 200, 'normal', 'none', None, 'BUTLER']],
         bubs=[[0.6, 0, 'My bunker has a cinema and a pool.'], [4.0, 1, 'And 40 armed guards, sir.'], [7.0, 0, 'Purge Night is my favorite holiday.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'hum', 0.4); yr(t + 10, 2031.45)

# ======================= CAP 2: LA PRIMERA NOCHE =======================
t0n = t
t = map_(13, 'P4', chap=[0.0, 2.6, 'CHAPTER 2', 'THE FIRST NIGHT'], cam=[[0, *P(160, -30), 0.75], [13, *P(150, -28), 0.8]], cells=[NIGHT()],
         pins=[[3.0, *P(174.8, -36.8), 'AUCKLAND · SAFE', '#7ad0ff'], [6.0, *P(151.2, -33.9), 'SYDNEY · 7:00 PM', '#ff6a5a']],
         caps=[[3.0, 7.6, 'The Pacific goes first. 7 PM in Sydney.', 'Sydney'], [8.0, 12.6, 'Sirens. Then silence.', 'Sirens']])
sweep(t + 2.6, t + 13, 178, 148)
V.chap_snd(t); V.S(t + 6, 'siren', 0.7); V.M(t, t + 130, 'horror', 0, 0.65, 1.0, 1.0); yr(t + 13, 2031.5)
t = V.sc('balls', 9.0, id='PB3', bg='night', balls=[[K['AU'], 640, 640, 220, 'scared', 'none', None, None, {'sweat': True}], [K['AU'], 1280, 640, 220, 'angry']],
         bubs=[[0.6, 0, 'Did you hear that?'], [3.6, 1, 'Stay away from the window.'], [6.4, 0, 'It\'s only 7:05...']])
sweep(t, t + 9, 148, 136); V.talk(t, V.SC[-1][3]['bubs']); V.SV(t + 5, 'gun', 0.3); yr(t + 9, 2031.5)
t = map_(13, 'P4B', cam=[[0, *P(122, 33), 0.75], [13, *P(115, 32), 0.8]], cells=[NIGHT()], pins=[[1.0, *P(139.7, 35.7), 'TOKYO · OPTED OUT', '#7ad0ff'], [4.5, *P(121.5, 31.2), 'SHANGHAI · 7:00 PM', '#ff6a5a'], [7.0, *P(116.4, 39.9), 'BEIJING · 7:00 PM', '#ff6a5a']],
         counters=[[2.0, 'POLICE CALLS ANSWERED', [[2, 0], [12, 0]], 'int', '#ff6a5a']], caps=[[0.6, 5.6, 'Tokyo stays lit. Its people chose to stay out.', 'stay out'], [6.6, 12.6, 'Next door, the purge begins.', 'begins']])
sweep(t, t + 13, 136, 108); V.S(t + 4.5, 'siren', 0.6); [V.SV(t + 6 + i * 0.8, 'gun', 0.2) for i in range(7)]; yr(t + 13, 2031.5)
t = V.sc('bignum', 6.0, id='PBN0', kf=[[0, 1.2e6], [4, 0]], fmt='int', top='EMERGENCY CALLS ANSWERED', label=[4.0, 'NOBODY IS COMING', '#ff3b30'], col='#ffffff', glow='rgba(255,40,40,0.8)', bgc='radial-gradient(ellipse, #3a0606, #000 70%)')
sweep(t, t + 6, 108, 108); V.S(t + 0.2, 'phone_ring', 0.6); V.S(t + 4.0, 'thit', 0.8); yr(t + 6, 2031.5)
t = map_(12, 'P5', cam=[[0, *P(75, 25), 0.75], [12, *P(62, 27), 0.8]], cells=[NIGHT()], pins=[[2.0, *P(72.9, 19.1), 'MUMBAI · 7:00 PM', '#ff6a5a'], [7.4, *P(55.3, 25.2), 'DUBAI · 7:00 PM', '#ff6a5a']],
         rings=[[3 + i * 0.6, *xy, '#ff3b30', 2] for i, xy in enumerate([P(77.2, 28.6), P(88.4, 22.6), P(80.3, 13.1), P(67, 24.9), P(74.3, 31.5)])],
         caps=[[0.6, 5.6, 'India: 1.4 billion people locked inside.', 'locked inside'], [6.6, 11.6, 'In Dubai, the rich watch from their towers.', 'towers']])
sweep(t, t + 12, 108, 62); V.S(t + 2, 'siren', 0.5); [V.SV(t + 3 + i * 0.6, 'boom', 0.2) for i in range(5)]; yr(t + 12, 2031.5)
t = map_(13, 'P6', cam=[[0, *P(15, 30), 0.5], [13, *P(10, 32), 0.55]], cells=[NIGHT()], pins=[[2.0, *P(28.97, 41), 'ISTANBUL · 7:00 PM', '#ff6a5a'], [4.4, *P(2.35, 48.85), 'PARIS · 7:00 PM', '#ff6a5a'], [6.0, *P(3.4, 6.5), 'LAGOS · 7:00 PM', '#ff6a5a'], [8.0, *P(8.5, 47.4), 'ZURICH · SAFE', '#7ad0ff']],
         counters=[[1.0, 'PEOPLE IN PURGE NIGHT', [[1, 2.9e9], [12, 5.4e9]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'Europe and Africa. Half the planet is now inside the night.', 'Half the planet'], [8.6, 12.6, 'Switzerland closes its borders.', 'closes']])
sweep(t, t + 13, 62, 8); V.S(t + 2, 'siren', 0.6); [V.SV(t + 3 + i * 0.7, 'gun', 0.2) for i in range(10)]; yr(t + 13, 2031.5)
t = V.sc('balls', 9.0, id='PB4', bg='street', balls=[[K['FR'], 560, 640, 220, 'angry', 'none', None, None], [K['GB'], 1360, 640, 220, 'scared', 'none', None, None, {'sweat': True}]],
         bubs=[[0.6, 1, 'Mate, why are you at my door?'], [3.6, 0, 'You stole my parking spot in 2019.'], [6.6, 1, 'IT WAS ONE TIME!']])
sweep(t, t + 9, 8, -12); V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'whip', 0.5); yr(t + 9, 2031.5)
t = map_(12, 'P6B', cam=[[0, *P(10, 50), 1.1], [12, *P(4, 50), 1.2]], cells=[NIGHT()], rings=[[1 + i * 0.5, *xy, '#ff3b30', 3] for i, xy in enumerate([P(2.35, 48.85), P(-0.1, 51.5), P(13.4, 52.5), P(4.9, 52.4), P(-3.7, 40.4), P(12.5, 41.9)])],
         stamps=[[6.0, 'HOSPITALS: CLOSED', 960, 480, '#ff3b30', 100]], caps=[[0.6, 5.6, 'Old grudges. Robberies. Riots.', 'grudges'], [7.6, 11.6, 'And no ambulance will come.', 'ambulance']])
sweep(t, t + 12, -12, -38); [V.SV(t + 1 + i * 0.5, 'boom', 0.25) for i in range(6)]; V.S(t + 6, 'stamp_3', 0.7); yr(t + 12, 2031.5)
t = map_(14, 'P7', cam=[[0, *P(-80, 35), 0.65], [14, *P(-95, 37), 0.7]], cells=[NIGHT()], pins=[[2.0, *P(-74, 40.7), 'NEW YORK · 7:00 PM', '#ff6a5a'], [6.0, *P(-87.6, 41.9), 'CHICAGO · 7:00 PM', '#ff6a5a'], [10.0, *P(-118.2, 34), 'LOS ANGELES · 7:00 PM', '#ff6a5a'], [3.4, *P(-75.7, 45.4), 'CANADA · SAFE', '#7ad0ff']],
         counters=[[1.0, 'SHOTS FIRED (USA)', [[1, 0], [13, 3.8e7]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'America. The most guns on Earth.', 'most guns'], [7.0, 13.6, 'Cars flood the Canadian border before 7 PM.', 'Canadian border']])
sweep(t, t + 14, -42, -120); V.S(t + 2, 'siren', 0.7); [V.SV(t + 2 + i * 0.4, 'gun', 0.25) for i in range(25)]; yr(t + 14, 2031.5)
t = map_(12, 'P7B', cam=[[0, *P(-65, -10), 0.6], [12, *P(-70, -12), 0.65]], cells=[NIGHT()], pins=[[1.0, *P(-46.6, -23.5), 'SÃO PAULO', '#ff6a5a'], [2.4, *P(-58.4, -34.6), 'BUENOS AIRES', '#ff6a5a'], [3.8, *P(-99.1, 19.4), 'MEXICO CITY', '#ff6a5a'], [5.0, *P(-56.2, -34.9), 'URUGUAY · SAFE', '#7ad0ff']],
         caps=[[0.6, 5.6, 'Latin America joins the night.', 'joins'], [6.6, 11.6, 'For a few hours, the whole world is on fire.', 'on fire']], parts=['ember', 70])
sweep(t, t + 12, -120, -150); [V.SV(t + 1 + i * 0.6, 'boom', 0.2) for i in range(10)]; yr(t + 12, 2031.5)
t = V.sc('balls', 9.0, id='PB5', bg='night', balls=[[K['MX'], 640, 640, 220, 'scared', 'none', None, 'NURSE', {'sweat': True}], [K['MX'], 1280, 660, 200, 'scared', 'none', None, 'NEIGHBOR', {'tears': True}]],
         bubs=[[0.6, 1, 'Please! My son is hurt!'], [3.8, 0, 'Hospitals are closed. Bring him inside.'], [6.6, 0, 'I\'ll do what I can.']])
sweep(t, t + 9, -150, -172); V.talk(t, V.SC[-1][3]['bubs']); yr(t + 9, 2031.5)
t = map_(12, 'P8', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.5], [6, 0]], tints=[SAFE(), tint([k for k in ALLK if k not in OPT], '#8a1010', [[0, 0.35], [10, 0.15]])],
         counters=[[1.0, 'DEAD ON THE FIRST NIGHT', [[1, 0], [10, 2.1e6]], 'big', '#ff3b30']], stamps=[[6.0, '7:00 AM. IT\'S OVER.', 960, 470, '#ffffff', 100, 0]],
         caps=[[0.6, 5.6, 'The sun rises. The sirens sound again.', 'sirens'], [7.6, 11.6, 'Everyone counts the dead.', 'dead']])
V.S(t + 0.4, 'siren', 0.5); V.S(t + 6, 'stamp_2', 0.6); V.S(t + 1, 'birds', 0.3); V.M(t, t + 22, 'ambient', 0, 0.6, 0.8, 0.8); yr(t + 12, 2031.6)
t = V.sc('bignum', 6.0, id='PBN1', kf=[[0, 0], [4, 2.1e6]], fmt='big', top='DEAD IN ONE NIGHT', label=[4.0, 'MORE THAN A YEAR OF WAR', '#ff3b30'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 1.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); yr(t + 6, 2031.6)
AM = [('SYDNEY', P(151.2, -33.9)), ('MUMBAI', P(72.9, 19.1)), ('PARIS', P(2.35, 48.85)), ('LAGOS', P(3.4, 6.5)), ('NEW YORK', P(-74, 40.7)), ('MEXICO CITY', P(-99.1, 19.4)), ('SÃO PAULO', P(-46.6, -23.5)), ('SHANGHAI', P(121.5, 31.2))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · 7:01 AM', '#ffd23f']], grade='rgba(255,200,120,0.18)', parts=['dust', 30]) for i, (n, xy) in enumerate(AM)]
t = V.sc('cuts', 0.3 + len(AM) * 0.9 + 0.3, id='P8B', cuts=cuts, texts=[[0.05, 7.8, 'THE MORNING AFTER', 110, 540, '#ffd23f', 'rgba(255,200,80,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'whoosh', 0.25) for i in range(len(AM))]; V.S(t, 'birds', 0.3); yr(t + 7.8, 2031.6)
REF = [('CA', 4.1e6), ('CH', 1.9e6), ('JP', 1.7e6), ('NZ', 9e5), ('NO', 6e5), ('IE', 5e5), ('UY', 4e5), ('PT', 3.5e5)]
t = V.sc('rank', 10.0, id='PRK1', title='PURGE REFUGEES TAKEN IN', rows=[[K[c], [[0, 0], [7, v]]] for c, v in REF if c in K], fmt='big', col='linear-gradient(90deg, #2a7ad8, #9fd4ff)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2031.7)

# ======================= CAP 3: EL NEGOCIO DE LA PURGA =======================
SEC = [P(-74, 40.7), P(-118, 34), P(-0.1, 51.5), P(2.35, 48.85), P(-46.6, -23.5), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(-99.1, 19.4), P(28.97, 41)]
t = map_(13, 'P9', chap=[0.0, 2.6, 'CHAPTER 3', 'THE PURGE ECONOMY'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], icons=[[3.0 + i * 0.4, *xy, 'cctv-camera', '#ffd23f', 44] for i, xy in enumerate(SEC)],
         counters=[[3.0, 'SECURITY INDUSTRY ($)', [[3, 2e11], [12, 3.1e12]], 'big', '#ffd23f']], caps=[[3.0, 7.6, 'Year 2. Fear becomes the biggest business on Earth.', 'business'], [8.0, 12.6, 'Armored doors. Private guards. Safe rooms.', 'Safe rooms']])
V.chap_snd(t); V.M(t, t + 60, 'chip', 0, 0.6, 1.0, 0.8); [V.S(t + 3 + i * 0.4, 'lock', 0.2) for i in range(len(SEC))]; yr(t + 13, 2032.3)
t = V.sc('balls', 10.0, id='PB6', bg='office', balls=[[K['DE'], 700, 640, 240, 'smug', 'tie', None, 'SALESMAN'], [K['US'], 1300, 660, 210, 'scared', 'none', None, 'CUSTOMER', {'sweat': True}]],
         props=[['door', 960, 430, 140, '#cfd8e8']], bubs=[[0.6, 0, 'This door stops a tank.'], [3.6, 1, 'How much?'], [6.4, 0, 'Your house. And your car.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.5, 'steel_door', 0.5); yr(t + 10, 2032.4)
t = map_(12, 'P10', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[SAFE(), tint([k for k in ALLK if k not in OPT], '#3bd16f', [[1, 0], [5, 0.3]], 0)],
         counters=[[1.0, 'CRIME ON THE OTHER 364 DAYS', [[1, 1.0], [8, 0.42]], 'pct', '#3bd16f']], stamps=[[8.4, 'IT... WORKS?', 960, 470, '#3bd16f', 120]],
         caps=[[0.6, 5.6, 'Strange result: crime the rest of the year drops.', 'drops'], [6.6, 8.2, 'By more than half.', 'half']])
V.S(t + 8.4, 'stamp_2', 0.6); V.S(t + 1, 'riser_4s', 0.4); yr(t + 12, 2032.6)
TVS = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(77.2, 28.6), P(-46.6, -23.5), P(37.6, 55.75), P(31.2, 30), P(151.2, -33.9)]
t = map_(12, 'P10B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], night=[[0, 0.45], [12, 0.45]], icons=[[0.8 + i * 0.4, *xy, 'tv', '#ff6a5a', 46] for i, xy in enumerate(TVS)],
         counters=[[1.0, 'PEOPLE WATCHING LIVE', [[1, 0], [10, 3.3e9]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'Purge Night becomes the most watched TV event ever.', 'most watched'], [6.6, 11.6, 'Drones film the streets all night.', 'Drones']])
[V.S(t + 0.8 + i * 0.4, 'static', 0.15) for i in range(len(TVS))]; yr(t + 12, 2033.2)
t = V.sc('news', 14.0, id='PN2', anchor=K['US'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.2], [10, 0.6]],
         bubs=[[1.0, 0, 'Purge tourism is booming.'], [4.0, 0, 'Hotels in safe countries are full for a year.'], [8.2, 0, 'Canada now has a 3-day waiting line at the border.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'PURGE TOURISM BOOM'], [9.8, 'WORLD EVENING POST', 'BORDER CHAOS']], ticker='HOTELS IN SAFE COUNTRIES SOLD OUT  •  ARMORED CAR SALES UP 900%  •  PURGE NIGHT IN 41 DAYS  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; yr(t + 14, 2033.5)
t = V.sc('balls', 10.0, id='PB7', bg='street', balls=[[K['IT'], 620, 650, 220, 'smug', 'none', None, None], [K['IT'], 1300, 650, 220, 'angry', 'none', None, None]],
         bubs=[[0.6, 0, 'I\'ve waited all year for tonight.'], [3.8, 1, 'To get revenge?'], [6.6, 0, 'To finally fix your ugly fence.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2033.6)
SPY = [P(37.6, 55.75), P(116.4, 39.9), P(-77, 38.9), P(51.4, 35.7), P(31.2, 30), P(-66.9, 10.5), P(7.5, 9.1), P(100.5, 13.7)]
t = map_(12, 'P11', cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.33]], night=[[0, 0.35], [12, 0.45]], icons=[[0.8 + i * 0.45, *xy, 'spy', '#ffffff', 44] for i, xy in enumerate(SPY)],
         stamps=[[6.6, 'RIVALS: GONE', 960, 470, '#ff3b30', 110]], caps=[[0.6, 5.6, 'Year 4. Some governments find a dark use for the night.', 'dark use'], [7.6, 11.6, 'Opposition leaders disappear. Legally.', 'Legally']])
[V.S(t + 0.8 + i * 0.45, 'typing', 0.12) for i in range(len(SPY))]; V.S(t + 6.6, 'stamp_3', 0.7); V.S(t + 6.6, 'braam3', 0.5); yr(t + 12, 2034.5)
WARA = [[P(37, 51), P(31, 50)], [P(75, 33), P(71, 31)], [P(46, 32), P(51, 33)], [P(-69, 7), P(-73, 4)], [P(36, 9), P(41, 9)], [P(127, 39), P(127, 36)]]
t = map_(14, 'P12', cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], war=True, night=[[0, 0.5], [14, 0.5]],
         arrows=[[2.0 + i * 0.6, 5.4 + i * 0.6, *a, *b, '#ff3b30', 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'THE PURGE WARS', '#c3100a']],
         caps=[[3.6, 8.6, 'Is invading a neighbor legal on Purge Night?', 'legal'], [9.0, 13.6, 'Some armies decide that it is.', 'armies']])
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 60, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.SV(tt, 'boom', 0.3)
V.S(t + 0.4, 'braam2', 0.6); V.M(t, t + 14.4, 'frantic', 10, 0.8, 0.4, 0.6); yr(t + 14, 2035)
BANK = [P(-74, 40.7), P(-0.1, 51.5), P(8.7, 50.1), P(139.7, 35.7), P(114.2, 22.3), P(103.8, 1.35), P(55.3, 25.2), P(-46.6, -23.5)]
t = map_(12, 'P11B', cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.33]], night=[[0, 0.5], [12, 0.5]], icons=[[0.8 + i * 0.4, *xy, 'laptop', '#3bd16f', 44] for i, xy in enumerate(BANK)],
         counters=[[1.0, 'STOLEN FROM BANKS', [[1, 0], [10, 8.4e11]], 'big', '#3bd16f']], caps=[[0.6, 5.6, 'Not every purger carries a gun.', 'gun'], [6.6, 11.6, 'Hackers empty bank accounts. Legally, for 12 hours.', 'Hackers']])
[V.S(t + 0.8 + i * 0.4, 'glitch', 0.2) for i in range(len(BANK))]; yr(t + 12, 2035.1)
t = V.sc('call', 12.0, id='PC2', ks=ks('US', 'CN', 'FR', 'IN'), banner='UN EMERGENCY SESSION', eyes=['scared', 'angry', 'angry', 'scared'],
         bubs=[[1.0, 2, 'The purge is out of control!'], [4.0, 1, 'Whose army crossed whose border?'], [7.0, 3, 'It was night. Nobody saw anything.'], [9.4, 0, '...We need a vote.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 12, 2035.2)

# ======================= CAP 4: LA ÚLTIMA PURGA =======================
PROT = [P(-74, 40.7), P(-0.1, 51.5), P(2.35, 48.85), P(13.4, 52.5), P(-46.6, -23.5), P(77.2, 28.6), P(139.7, 35.7), P(31.2, 30), P(-99.1, 19.4), P(28.97, 41), P(-58.4, -34.6), P(3.4, 6.5), P(151.2, -33.9), P(121, 14.6)]
t = map_(13, 'P13', chap=[0.0, 2.6, 'CHAPTER 4', 'THE LAST PURGE'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], rings=[[3.0 + i * 0.3, *xy, '#ffffff', 3] for i, xy in enumerate(PROT)],
         counters=[[3.0, 'PEOPLE PROTESTING', [[3, 0], [12, 4.1e8]], 'big', '#ffffff']], banners=[[6.0, 10.0, 'END THE PURGE', '#1a1a1a']],
         caps=[[3.0, 5.8, 'Year 5. The biggest protest in history.', 'biggest'], [10.2, 12.8, '400 million people in the streets.', '400 million']])
V.chap_snd(t); V.S(t + 3, 'crowd', 0.6); V.M(t, t + 60, 'heroic', 0, 0.65, 1.0, 1.0); yr(t + 13, 2036)
t = V.sc('balls', 10.0, id='PB8', bg='night', balls=[[K['BR'], 660, 680, 170, 'normal', 'none', None, 'AGE 8'], [K['BR'], 1260, 640, 230, 'normal', 'none', None, 'DAD', {'tears': True}]],
         bubs=[[0.6, 0, 'Why do people turn bad for one night?'], [4.2, 1, 'Maybe they were never good.'], [7.2, 1, 'Or maybe the law made it easy.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2036.1)
PURGE_K = [k for k in ALLK if k not in OPT]
t = V.sc('map', 13, id='P14', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], tints=[SAFE(), tint(PURGE_K, '#c3100a', [[0, 0.5]], 0), tint(PURGE_K, '#2a7ad8', [[1.0, 0], [1.4, 0.55]], 0.03, stroke='#ffffff')],
         counters=[[1.0, 'COUNTRIES THAT LEAVE THE TREATY', [[1, 0], [9, 179]], 'int', '#7ad0ff']], stamps=[[9.4, 'THE PURGE IS ABOLISHED', 960, 470, '#2a7ad8', 96]],
         caps=[[0.6, 5.6, 'One by one, countries tear up the treaty.', 'tear up'], [6.6, 9.2, 'Then the treaty itself collapses.', 'collapses']])
[V.S(t + 1 + i * 0.25, 'ding', 0.15) for i in range(30)]; V.S(t + 9.4, 'stamp_2', 0.8); V.S(t + 9.4, 'crowd_cheer', 0.5); yr(t + 13, 2036.5)
t = map_(12, 'P15', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.6], [12, 0.6]], tints=[tint(ALLK, '#2a7ad8', [[0, 0.25]])], parts=['ember', 60],
         rings=[[0.6 + i * 0.3, *xy, '#ffd23f', 2] for i, xy in enumerate(PROT)], caps=[[0.6, 5.6, 'The night of the old purge comes again...', 'again'], [6.6, 11.6, 'This time: fireworks, not gunfire.', 'fireworks']])
[V.S(t + 0.6 + i * 0.3, 'boom_small', 0.2) for i in range(len(PROT))]; V.S(t + 6.6, 'crowd_cheer', 0.4); yr(t + 12, 2037)
t = V.sc('news', 14.0, id='PN3', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.2], [10, 0]],
         bubs=[[1.0, 0, 'Six purges. 9.8 million dead.'], [4.6, 0, 'Tonight, for the first time in years...'], [8.6, 0, '...the police will answer your call.']],
         papers=[[6.0, 'THE GLOBE DAILY', 'NEVER AGAIN'], [10.2, 'WORLD EVENING POST', 'LAW IS BACK']], ticker='THE PURGE TREATY IS DEAD  •  POLICE ON DUTY TONIGHT  •  9.8 MILLION VICTIMS REMEMBERED  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [6.0, 10.2]]; yr(t + 14, 2037.1)
t = V.sc('bignum', 6.0, id='PBN2', kf=[[0, 0], [4, 9.8e6]], fmt='big', top='TOTAL PURGE VICTIMS', label=[4.0, 'IN JUST 6 NIGHTS', '#ff3b30'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); yr(t + 6, 2037.1)
t = V.sc('end', 12.0, id='PEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5)', tint2='rgba(160,0,0,0.25)', lines=[[0.8, 'WHERE WOULD YOU HIDE?', 300, 110, 99, '#ff3b30']], ask=[2.6, 'Would you vote for the purge? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4); V.M(t, t + 12, 'tension', 0, 0.5, 0.5, 2.0)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='YEAR', kf=YR, fmt='yr'))
V.export()
