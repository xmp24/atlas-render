"""Vídeo 9: What If Everyone Knew Their Death Date — fechas en la muñeca; 2.100 M comparten el mismo día; asteroide en el Pacífico."""
from wsim import *
V = Vid('deathdate', seed=99)
YR = []; POP = []
def yr(t, y): YR.append([round(t, 2), y])
def popk(t, p): POP.append([round(t, 2), p])
ALLK = sorted(set(K.values()))
CY = '#7af0ff'; RED = '#ff3b30'
RIM = ks('JP', 'PH', 'ID', 'TW', 'KR', 'CN', 'VN', 'MY', 'TH', 'PG', 'NZ', 'CL', 'PE', 'EC', 'CO', 'MX', 'US', 'CA', 'KH', 'MM', 'BD', 'AU', 'FJ')
def map_(d, id, **kw): return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
DOOM = '14 AUG 2033'
IMP = P(150, 20)   # impacto en el Pacífico occidental

# ======================= TRÁILER =======================
t = V.sc('title', 7.0, id='D_A', hard=True, bg='black', texts=[[0.3, 3.4, 'YOU WAKE UP...', 110], [3.4, 7.0, 'WITH A DATE ON YOUR WRIST', 92, 540, CY, 'rgba(120,240,255,0.7)', 8]], flash=[3.4])
V.S(t + 0.3, 'heartbeat', 0.7); V.S(t + 1.3, 'heartbeat', 0.7); V.S(t + 3.4, 'braam', 0.9); V.S(t + 3.4, 'thit', 0.8); V.M(t + 3.4, t + 7, 'horror', 50, 0.45, 0.2, 0.3)
CT = [('TOKYO', P(139.7, 35.7)), ('MANILA', P(121, 14.6)), ('JAKARTA', P(106.8, -6.2)), ('SEOUL', P(126.98, 37.56)), ('SHANGHAI', P(121.5, 31.2)), ('TAIPEI', P(121.5, 25)), ('LOS ANGELES', P(-118.2, 34)),
      ('LIMA', P(-77, -12)), ('SANTIAGO', P(-70.7, -33.4)), ('HO CHI MINH', P(106.7, 10.8)), ('SYDNEY', P(151.2, -33.9)), ('AUCKLAND', P(174.8, -36.8))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · DIES ' + DOOM, '#ff6a5a']], grade='rgba(0,180,220,0.15)', filter='saturate(0.6) brightness(0.8)') for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='D_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'MILLIONS OF PEOPLE...', 110], [3.6, 7.4, 'THE SAME DATE.', 140, 540, '#ff6a5a', 'rgba(255,60,60,0.7)']])
V.M(t, t + 7.4, 'frantic', 40, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='D_C', hard=True, kf=[[0, 0], [4.2, 2.1e9]], fmt='big', top='PEOPLE WHO DIE ON ' + DOOM, label=[4.2, 'WHAT HAPPENS THAT DAY?', CY], col='#ffffff', glow='rgba(120,240,255,0.8)', bgc='radial-gradient(ellipse, #06283a, #000 70%)')
[V.S(t + 0.1 + i * 0.15, 'tick', 0.35) for i in range(27)]; V.S(t + 4.2, 'thit', 0.9)
t = V.sc('title', 8.5, id='D_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='saturate(0.6) brightness(0.7)', grad='radial-gradient(ellipse at 50% 85%, rgba(120,240,255,0.3), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF EVERYONE KNEW', 250, 130], [0.5, 'THEIR DEATH DATE?', 410, 140, CY]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 90, 0.8, 0.05, 1.2); yr(t + 8.5, 2031); popk(0, 100)

# ======================= CAP 1: LAS FECHAS =======================
t = map_(13, 'E1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE DATES'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]], cells=[dict(mode='rand', t0=-1, dur=1, col='#ffffff', a=0)] ,
         counters=[[3.0, 'PEOPLE WITH A DATE ON THEIR WRIST', [[3, 0], [9, 8.1e9]], 'big', CY]], caps=[[3.0, 7.6, 'March 2031. Every human wakes up with a date on their wrist.', 'date'], [8.0, 12.6, 'Day, month, year. Nothing else.', 'Nothing else']])
V.chap_snd(t); V.M(t, t + 46, 'spy', 0, 0.6, 1.0, 0.8); [V.S(t + 3 + i * 0.5, 'ding', 0.15) for i in range(12)]; yr(t + 13, 2031.2)
t = V.sc('balls', 9.0, id='EB1', bg='street', balls=[[K['US'], 640, 640, 230, 'smug', 'none', None, 'DIES 2089'], [K['US'], 1280, 640, 230, 'scared', 'none', None, 'DIES THURSDAY', {'sweat': True}]],
         bubs=[[0.6, 0, 'Mine says 2089! Ha!'], [3.4, 1, 'Mine says...'], [5.6, 1, '...this Thursday.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 5.6, 'sub_drop', 0.5); yr(t + 9, 2031.2)
t = V.sc('balls', 10.0, id='EB1B', bg='sky', balls=[[K['IT'], 640, 640, 230, 'normal', 'none', None, 'DIES 2071'], [K['IT'], 1280, 640, 230, 'scared', 'none', None, 'DIES 2034', {'tears': True}]],
         bubs=[[0.6, 1, 'We were going to grow old together.'], [4.2, 0, 'Then let\'s not waste a single day.'], [7.4, 1, 'Three years.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2031.2)
t = map_(12, 'E2', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], cells=[dict(mode='rand', t0=-1, dur=1, col=RED, a=0)], rings=[[0.8 + i * 0.3, *cap(c), RED, 2] for i, c in enumerate(['US', 'IN', 'CN', 'BR', 'NG', 'RU', 'DE', 'MX', 'ID', 'EG', 'FR', 'JP']) if c in K],
         counters=[[0.8, 'PEOPLE WHOSE DATE IS THIS YEAR', [[0.8, 0], [9, 6.1e7]], 'big', RED]], caps=[[0.6, 5.6, '61 million people learn they die this year.', 'this year'], [6.6, 11.6, 'Hospitals fill with people who feel perfectly fine.', 'perfectly fine']])
V.S(t + 0.8, 'heartbeat', 0.5); yr(t + 12, 2031.25)
t = map_(12, 'E2B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], rings=[[0.8 + i * 0.35, *cap(c), CY, 2] for i, c in enumerate(['IN', 'NG', 'PK', 'CD', 'ET', 'CN', 'ID', 'US', 'BR', 'BD']) if c in K],
         counters=[[0.8, 'BABIES BORN TODAY · WITH A DATE', [[0.8, 0], [9, 385000]], 'int', CY]], caps=[[0.6, 5.6, 'Even newborns arrive with a date on their wrist.', 'newborns'], [6.6, 11.6, 'Parents learn on day one how long they\'ll have their child.', 'day one']])
V.S(t + 0.8, 'ding', 0.3); yr(t + 12, 2031.27)
t = V.sc('news', 14.0, id='EN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.4], [10, 0.9]],
         bubs=[[1.0, 0, 'Every single person now has a date.'], [4.6, 0, 'Including me. I won\'t tell you mine.'], [8.6, 0, 'The question is: are the dates real?']],
         papers=[[5.6, 'THE GLOBE DAILY', 'THE WRIST DATES'], [9.8, 'WORLD EVENING POST', 'ARE THEY REAL?']], ticker='BREAKING: EVERY HUMAN HAS A DATE ON THEIR WRIST  •  SCIENTISTS CANNOT REMOVE THEM  •  TATTOO PARLORS OVERWHELMED  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.6, 9.8]]; yr(t + 14, 2031.3)
DARE = [P(-115, 36), P(8, 46.5), P(86.9, 27.9), P(-73.5, -40), P(170, -44), P(-150, 61), P(37, -3), P(-110, 37)]
t = map_(13, 'E3', cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], icons=[[0.8 + i * 0.4, *xy, 'para', '#ffd23f', 44] for i, xy in enumerate(DARE)] if False else [[0.8 + i * 0.4, *xy, 'helmet-head-shot', '#ffd23f', 44] for i, xy in enumerate(DARE)],
         stamps=[[8.0, 'THE DATES ARE REAL', 960, 470, CY, 110]], caps=[[0.6, 5.6, 'A man with a date in 2080 jumps from a plane. No parachute.', 'No parachute'], [6.0, 7.8, 'He lands in a tree. Alive.', 'Alive']])
V.S(t + 0.8, 'jet', 0.4); V.S(t + 4.5, 'whoosh_6', 0.6); V.S(t + 6, 'impact_hit', 0.6); V.S(t + 8, 'stamp_2', 0.9); V.S(t + 8, 'braam2', 0.6); yr(t + 13, 2031.4)
t = V.sc('call', 13.0, id='EC1', ks=ks('US', 'CN', 'IN', 'BR'), banner='EMERGENCY SUMMIT', eyes=['scared', 'angry', 'normal', 'scared'],
         bubs=[[1.0, 0, 'Insurance companies are collapsing.'], [4.0, 1, 'People with long dates stop obeying any rule.'], [7.2, 2, 'And people with short dates stop working.'], [10.0, 3, 'How do we run a world like this?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 13, 2031.45)
t = map_(12, 'E3B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.4, *xy, 'laptop', RED, 44] for i, xy in enumerate([P(-74, 40.7), P(-0.1, 51.5), P(8.7, 50.1), P(139.7, 35.7), P(114.2, 22.3), P(72.9, 19.1)])],
         counters=[[0.8, 'LIFE INSURANCE COMPANIES LEFT', [[0.8, 100], [8, 0]], 'int', RED]], stamps=[[8.4, 'BANKRUPT', 960, 470, RED, 150]],
         caps=[[0.6, 5.6, 'Nobody buys life insurance when they know the date.', 'insurance'], [6.6, 8.2, 'An entire industry dies in a week.', 'dies']])
V.S(t + 8.4, 'stamp_3', 0.8); V.S(t + 1, 'downlifter', 0.4); yr(t + 12, 2031.5)

# ======================= CAP 2: VIVIR CON FECHA =======================
t = map_(13, 'E5', chap=[0.0, 2.6, 'CHAPTER 2', 'LIVING ON A DEADLINE'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], tints=[tint(ALLK, '#ffd23f', [[3, 0], [7, 0.2]], 0)],
         counters=[[3.0, 'PEOPLE WHO QUIT THEIR JOBS', [[3, 0], [12, 3.4e8]], 'big', '#ffd23f']], caps=[[3.0, 7.6, 'Those with little time left quit everything.', 'quit'], [8.0, 12.6, 'Bucket lists replace careers.', 'Bucket lists']])
V.chap_snd(t); V.M(t, t + 60, 'voyage', 0, 0.65, 1.0, 0.8); yr(t + 13, 2031.7)
t = V.sc('balls', 10.0, id='EB3', bg='office', balls=[[K['GB'], 640, 640, 230, 'smug', 'tie', None, 'DIES IN 3 WEEKS'], [K['GB'], 1280, 640, 230, 'angry', 'tie', None, 'BOSS']],
         bubs=[[0.6, 0, 'I quit. I\'m going to Paris.'], [3.6, 1, 'You can\'t just—'], [6.2, 0, 'What are you going to do? Fire me?']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2031.75)
TRV = [[P(-74, 40.7), P(2.35, 48.85)], [P(116.4, 39.9), P(12.5, 41.9)], [P(77.2, 28.6), P(31.2, 30)], [P(-46.6, -23.5), P(-72.5, -13.2)], [P(139.7, 35.7), P(-157.8, 21.3)], [P(-0.1, 51.5), P(115.2, -8.4)], [P(37.6, 55.75), P(23.7, 37.98)]]
t = map_(12, 'E6', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], arrows=[[0.8 + i * 0.5, 4.2 + i * 0.5, *a, *b, '#ffd23f', 20] for i, (a, b) in enumerate(TRV)],
         counters=[[0.8, 'LAST-WISH TRIPS', [[0.8, 0], [10, 1.9e8]], 'big', '#ffd23f']], caps=[[0.6, 5.6, 'Airports have never been so full.', 'Airports'], [6.6, 11.6, 'Paris, Rome, the pyramids, the beach.', 'Paris']])
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(len(TRV))]; yr(t + 12, 2031.9)
t = V.sc('balls', 10.0, id='EB7', bg='lab', balls=[[K['PH'], 640, 680, 170, 'normal', 'none', None, 'AGE 9 · ' + DOOM], [K['PH'], 1280, 640, 230, 'scared', 'none', None, 'MOM · ' + DOOM, {'tears': True}]],
         bubs=[[0.6, 0, 'Mom, we have the same date.'], [3.8, 1, 'I know, sweetheart.'], [6.6, 0, 'Can we see the ocean before?']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2032)
WARA = [[P(37, 51), P(31, 50)], [P(75, 33), P(71, 31)], [P(44, 33), P(51, 33)], [P(30, 2), P(25, -2)], [P(36, 9), P(41, 9)]]
t = map_(14, 'E7', cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], war=True,
         arrows=[[2.0 + i * 0.6, 5.4 + i * 0.6, *a, *b, RED, 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'THE "IMMORTAL" ARMIES', '#c3100a']],
         caps=[[3.6, 8.6, 'Armies recruit only soldiers with dates after 2070.', 'after 2070'], [9.0, 13.6, 'They charge without fear. They can\'t die... yet.', 'yet']])
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 60, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.SV(tt, 'boom', 0.3)
V.S(t + 0.4, 'braam2', 0.6); V.M(t, t + 14.4, 'frantic', 30, 0.8, 0.4, 0.6); yr(t + 14, 2032.1)
t = V.sc('balls', 10.0, id='EB4', bg='desert', balls=[[K['RU'], 960, 640, 250, 'shades', 'delta', None, 'DIES 2091']], fx=[[3.0, 900, 560], [5.0, 1020, 600], [7.0, 960, 520]],
         bubs=[[0.6, 0, 'My date is 2091.'], [3.6, 0, 'Bullets? Not today.'], [7.4, 0, '...But that one hurt.']])
V.talk(t, V.SC[-1][3]['bubs']); [V.SV(t + x, 'gun', 0.4) for x in [3.0, 5.0, 7.0]]; yr(t + 10, 2032.15)
LEFT = [('JP', 47), ('CH', 46), ('KR', 46), ('ES', 45), ('AU', 45), ('FR', 44), ('US', 41), ('BR', 40), ('IN', 39), ('NG', 31)]
t = V.sc('rank', 10.0, id='ERK1', title='AVERAGE YEARS LEFT ON THE WRIST', rows=[[K[c], [[0, 0], [7, v]]] for c, v in LEFT if c in K], fmt='int', unit=' yrs', col='linear-gradient(90deg, #7af0ff, #d8fbff)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2032.2)
t = map_(12, 'E8', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], night=[[0, 0.45], [12, 0.45]], rings=[[0.6 + i * 0.3, *cap(c), '#ffd23f', 2] for i, c in enumerate(['US', 'MX', 'BR', 'GB', 'FR', 'IN', 'JP', 'NG', 'ZA', 'AU', 'ES', 'KR']) if c in K], parts=['ember', 40],
         caps=[[0.6, 5.6, 'A new tradition: the "Goodbye Party".', 'Goodbye Party'], [6.6, 11.6, 'People throw their own funeral... the night before.', 'night before']])
[V.S(t + 0.6 + i * 0.3, 'boom_small', 0.15) for i in range(12)]; V.S(t + 1, 'crowd_cheer', 0.3); yr(t + 12, 2032.3)
t = V.sc('balls', 10.0, id='EB9', bg='night', balls=[[K['BR'], 960, 640, 250, 'smug', 'sash', None, 'DIES TOMORROW'], [K['BR'], 520, 680, 170, 'normal'], [K['BR'], 1400, 680, 170, 'normal', 'none', None, None, {'tears': True}]],
         parts=['ember', 40], bubs=[[0.6, 0, 'Thanks for coming to my funeral!'], [4.0, 1, 'Great party, man.'], [7.0, 0, 'Best one I\'ll ever have.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'crowd_cheer', 0.3); yr(t + 10, 2032.35)
t = V.sc('news', 14.0, id='EN2', anchor=K['US'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.2], [10, 0.5]],
         bubs=[[1.0, 0, 'Strange news from statisticians.'], [4.4, 0, 'Too many people share one single date.'], [8.4, 0, 'August 14th, 2033.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'THE SAME DAY?'], [9.8, 'WORLD EVENING POST', '14 AUG 2033']], ticker='STATISTICIANS ALARMED  •  MILLIONS SHARE ONE DEATH DATE  •  GOVERNMENTS ASK FOR CALM  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; V.S(t + 8.4, 'braam3', 0.6); yr(t + 14, 2032.4)

# ======================= CAP 3: LA MISMA FECHA =======================
t = map_(13, 'E9', chap=[0.0, 2.6, 'CHAPTER 3', 'THE SAME DAY'], cam=[[0, *P(160, 15), 0.45], [13, *P(165, 12), 0.5]], tints=[tint(RIM, RED, [[3, 0], [9, 0.55]], 0.15, stroke='#ffffff')],
         counters=[[3.0, 'PEOPLE DYING ON ' + DOOM, [[3, 0], [12, 2.1e9]], 'big', RED]], caps=[[3.0, 7.6, 'Plot the date on a map... and a shape appears.', 'shape'], [8.0, 12.6, 'Almost all of them live around the Pacific Ocean.', 'Pacific']])
V.chap_snd(t); V.M(t, t + 60, 'tension', 0, 0.65, 1.0, 0.8); [V.S(t + 3 + i * 0.25, 'beep_lo', 0.15) for i in range(24)]; yr(t + 13, 2032.5)
t = V.sc('balls', 10.0, id='EB5', bg='lab', balls=[[K['JP'], 640, 640, 230, 'scared', 'none', None, 'SCIENTIST · ' + DOOM], [K['US'], 1280, 640, 230, 'scared', 'none', None, 'SCIENTIST · 2066']],
         bubs=[[0.6, 0, '2.1 billion people. One day. One ocean.'], [4.4, 1, 'Something is coming.'], [7.4, 0, 'And I\'m one of them.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'beep_hi', 0.4); yr(t + 10, 2032.55)
t = map_(12, 'E9B', cam=[[0, *P(-118, 34), 1.8], [6, *P(-118, 34), 2.0], [6.3, *P(139.7, 35.7), 1.8], [12, *P(139.7, 35.7), 2.0]], tints=[tint(RIM, RED, [[0, 0.5]])],
         pins=[[1.0, *P(-118.4, 34), 'BEACH HOUSE: $0', '#ff6a5a'], [7.0, *P(139.7, 35.6), 'TOKYO BAY TOWER: $0', '#ff6a5a']], caps=[[0.6, 5.6, 'Nobody buys a house on the Pacific coast anymore.', 'Nobody buys'], [6.6, 11.6, 'Whole cities are put up for sale.', 'for sale']])
V.S(t + 6.3, 'whoosh_6', 0.5); yr(t + 12, 2032.57)
TH = [('WAR?', P(125, 35)), ('VIRUS?', P(110, 15)), ('VOLCANO?', P(-70, -20)), ('EARTHQUAKE?', P(140, 38)), ('ALIENS?', P(-110, 40)), ('NUCLEAR?', P(170, 0))]
t = map_(12, 'E10', cam=[[0, *P(160, 15), 0.45], [12, *P(160, 15), 0.48]], tints=[tint(RIM, RED, [[0, 0.5]])], pins=[[0.8 + i * 0.7, *xy, n, '#ffd23f'] for i, (n, xy) in enumerate(TH)],
         caps=[[0.6, 5.6, 'Theories explode. War? A virus? A super-volcano?', 'Theories'], [6.6, 11.6, 'Every guess is tested. None fits.', 'None fits']])
[V.S(t + 0.8 + i * 0.7, 'thit', 0.3) for i in range(len(TH))]; yr(t + 12, 2032.6)
t = V.sc('call', 13.0, id='EC2', ks=ks('JP', 'US', 'CN', 'AU'), banner='PACIFIC SUMMIT', eyes=['scared', 'normal', 'angry', 'scared'],
         bubs=[[1.0, 0, 'Half of Japan has the same date.'], [4.0, 2, 'Is someone planning to attack us?'], [7.0, 1, 'We\'re checking everything. Even the sky.'], [10.0, 3, '...The sky?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 13, 2032.65)
TEL = [P(-155.5, 19.8), P(-70.4, -24.6), P(-17.9, 28.8), P(149.1, -31.3), P(-110.9, 31.9), P(18.5, -32.4)]
t = map_(13, 'E11', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], icons=[[0.6 + i * 0.4, *xy, 'radar-dish', CY, 46] for i, xy in enumerate(TEL)], stars=[[0, 0.6]],
         stamps=[[6.6, 'ASTEROID 2033 KX', 960, 450, RED, 120]], caps=[[0.6, 5.6, 'Telescopes find it: a dark asteroid, 4 km wide.', '4 km'], [8.6, 12.6, 'Impact date: August 14th, 2033. The Pacific.', 'Impact date']])
[V.S(t + 0.6 + i * 0.4, 'scan', 0.2) for i in range(len(TEL))]; V.S(t + 6.6, 'stamp_3', 0.9); V.S(t + 6.6, 'braam', 0.8); yr(t + 13, 2032.7)
t = V.sc('bignum', 6.0, id='EBN1', kf=[[0, 0], [4, 4]], fmt='int', unit=' KM', top='ASTEROID DIAMETER', label=[4.0, 'BIG ENOUGH TO CREATE A MEGA-TSUNAMI', RED])
V.S(t + 0.1, 'riser_4s', 0.6); V.S(t + 4.0, 'thit', 0.9); yr(t + 6, 2032.7)
EV = [[P(139.7, 35.7), P(138, 36.5)], [P(121, 14.6), P(122, 16.5)], [P(106.8, -6.2), P(108, -7.5)], [P(-118.2, 34), P(-112, 36)], [P(-77, -12), P(-74, -13)], [P(121.5, 31.2), P(116, 32)], [P(151.2, -33.9), P(147, -32)], [P(-99.1, 19.4), P(-101, 21)]]
t = map_(13, 'E12', cam=[[0, *P(165, 15), 0.45], [13, *P(165, 15), 0.48]], tints=[tint(RIM, RED, [[0, 0.5]])], arrows=[[0.8 + i * 0.4, 4.0 + i * 0.4, *a, *b, '#ffffff', 22] for i, (a, b) in enumerate(EV)],
         counters=[[0.8, 'PEOPLE EVACUATED INLAND', [[0.8, 0], [11, 9.0e8]], 'big', '#ffffff']], caps=[[0.6, 5.6, 'The biggest evacuation in history begins.', 'evacuation'], [6.6, 12.6, 'Coasts empty. Mountains fill.', 'Mountains']])
[V.SV(t + 0.8 + i * 0.4, 'whoosh', 0.25) for i in range(len(EV))]; yr(t + 13, 2033.2)
t = V.sc('balls', 10.0, id='EB6', bg='dark', balls=[[K['CL'], 960, 640, 260, 'scared', 'none', None, DOOM, {'sweat': True}]],
         bubs=[[0.6, 0, 'We moved 500 km inland.'], [3.6, 0, 'I checked my wrist this morning.'], [6.8, 0, 'The date didn\'t change.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 6.8, 'tinnitus', 0.3); yr(t + 10, 2033.3)
t = map_(12, 'E12B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[tint(RIM, RED, [[0, 0.5]])], icons=[[0.8 + i * 0.5, *xy, 'incoming-rocket', '#ffffff', 48] for i, xy in enumerate([P(-80.6, 28.5), P(100.3, 41.1), P(63.3, 45.9), P(130.9, 31.2)])],
         stamps=[[6.4, 'MISSION FAILED', 960, 470, RED, 120]], caps=[[0.6, 5.6, 'Rockets are launched to push the asteroid away.', 'push'], [7.4, 11.6, 'One explodes on the pad. One misses. One is too late.', 'too late']])
[V.S(t + 0.8 + i * 0.5, 'launch', 0.3) for i in range(4)]; V.S(t + 6.4, 'stamp_3', 0.8); yr(t + 12, 2033.5)

# ======================= CAP 4: 14 DE AGOSTO =======================
TSU = [[0, 0]]
t = V.sc('title', 7.0, id='E13', bg='black', chap=[0.0, 2.6, 'CHAPTER 4', 'AUGUST 14TH'], texts=[[2.8, 7.0, DOOM + ' · 06:12 AM', 96, 540, RED, 'rgba(255,40,40,0.7)']])
V.chap_snd(t); [V.S(t + 2.8 + i * 0.5, 'heartbeat', 0.5) for i in range(8)]; V.M(t, t + 7, 'horror', 0, 0.5, 0.5, 0.3); yr(t + 7, 2033.6)
t = map_(16, 'E14', cam=[[0, *P(150, 20), 0.6], [2.0, *P(150, 20), 0.5], [5.0, *P(135, 30), 0.75], [16, *P(132, 32), 0.95]], shake=[[0, 0], [2.0, 22], [5, 6], [8, 0]], tints=[tint(RIM, RED, [[0, 0.4]])],
         cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=TSU)], rings=[[2.0, *IMP, '#ffffff', 6], [2.2, *IMP, RED, 6]], stamps=[[2.2, 'IMPACT', 960, 450, '#ffffff', 180, 0]],
         caps=[[5.6, 10.0, 'A wall of water 100 meters high races across the ocean.', '100 meters'], [10.4, 15.6, 'It hits every coast exactly as the dates said.', 'exactly']])
TSU += [[round(t + 3.5, 2), 0], [round(t + 10, 2), 55], [round(t + 16.5, 2), 62], [round(t + 45, 2), 8], [99999, 8]]
V.S(t + 1.6, 'missile_in', 0.6); V.S(t + 2.0, 'nuke', 1.0); V.S(t + 2.0, 'boom_big', 0.9); V.S(t + 4, 'wind', 0.6); V.M(t + 2, t + 50, 'saga', 0, 0.7, 1.5, 1.0); yr(t + 16, 2033.62); popk(t + 16, 75)
CO = [('TOKYO', P(139.7, 35.7)), ('MANILA', P(121, 14.6)), ('SHANGHAI', P(121.5, 31.2)), ('JAKARTA', P(106.8, -6.2)), ('LIMA', P(-77, -12)), ('LOS ANGELES', P(-118.2, 34)), ('SYDNEY', P(151.2, -33.9)), ('TAIPEI', P(121.5, 25))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=[[0, 60]])], pins=[[0, *xy, n, '#ff6a5a']], grade='rgba(0,40,120,0.3)', filter='brightness(0.7)') for i, (n, xy) in enumerate(CO)]
t = V.sc('cuts', 0.3 + len(CO) * 0.9 + 0.3, id='E14B', cuts=cuts, texts=[[0.05, 7.8, 'THE PACIFIC RIM', 110, 540, '#ffffff', 'rgba(80,140,255,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'boom', 0.3) for i in range(len(CO))]; yr(t + 7.8, 2033.62)
t = map_(13, 'E15', cam=[[0, *P(150, 15), 0.45], [13, *P(150, 15), 0.48]], cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=TSU)], tints=[tint(RIM, '#2b2b2e', [[0, 0.3], [6, 0.65]], 0.1)], useBar=True,
         counters=[[0.8, 'DEAD', [[0.8, 0], [10, 2.1e9]], 'big', RED]], caps=[[0.6, 5.6, 'Tsunamis, earthquakes, fires, a sky full of dust.', 'dust'], [6.6, 12.6, 'Even people far inland die: in crashes, collapses, accidents.', 'far inland']])
V.S(t + 0.4, 'heartbeat', 0.6); yr(t + 13, 2033.65)
t = map_(12, 'E15B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.1], [8, 0.55]], tints=[tint(RIM, '#2b2b2e', [[0, 0.65]])], tint2='rgba(90,80,70,0.35)', parts=['dust', 120], useBar=True,
         caps=[[0.6, 5.6, 'Dust from the impact covers the sky for months.', 'Dust'], [6.6, 11.6, 'The rest of the world shivers through a dark summer.', 'dark summer']])
V.S(t + 0.4, 'wind', 0.5); yr(t + 12, 2033.65)
t = V.sc('bignum', 6.0, id='EBN2', kf=[[0, 0], [4, 2.1e9]], fmt='big', top='PEOPLE WHO DIED ON ' + DOOM, label=[4.0, 'EVERY SINGLE DATE WAS RIGHT', CY])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); yr(t + 6, 2033.65)
HIT = [('JP', 61), ('PH', 58), ('ID', 44), ('TW', 52), ('KR', 33), ('CL', 31), ('PE', 29), ('VN', 27)]
t = V.sc('rank', 10.0, id='ERK2', title='POPULATION LOST ON ' + DOOM, rows=[[K[c], [[0, 0], [7, v]]] for c, v in HIT if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #ff3b30, #ff9a8a)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2033.7)
t = V.sc('balls', 10.0, id='EB8', bg='sky', balls=[[K['MX'], 640, 640, 230, 'normal', 'none', None, 'DIES 2064', {'tears': True}], [K['MX'], 1280, 680, 170, 'normal', 'none', None, 'DIES 2101']],
         bubs=[[0.6, 1, 'Will there be another day like that?'], [4.0, 0, 'Look at all the dates left.'], [7.0, 0, 'None of them match. Not one.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'birds', 0.3); yr(t + 10, 2034)
t = V.sc('news', 14.0, id='EN3', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.6], [10, 0]],
         bubs=[[1.0, 0, 'One year after August 14th.'], [4.4, 0, 'The wrist dates are still here.'], [7.8, 0, 'And for the first time, no two big clusters match.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'NO MORE DOOM DAYS'], [9.8, 'WORLD EVENING POST', 'REBUILDING']], ticker='ONE YEAR AFTER  •  PACIFIC CITIES REBUILDING  •  STATISTICIANS: NO NEW SHARED DATES  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; yr(t + 14, 2034.6)
t = map_(13, 'E16', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.27]], useBar=True, cells=[dict(mode='flood', col='#2f78c8', a=0.95, lvl=TSU)], tints=[tint(RIM, '#3bd16f', [[1, 0], [6, 0.35]], 0.1)],
         stamps=[[6.0, 'A WORLD THAT KNOWS', 960, 460, CY, 110, 0]], caps=[[0.6, 5.6, 'Humanity rebuilds... knowing exactly how long it has.', 'knowing'], [8.0, 12.6, 'Nobody wastes time anymore.', 'wastes time']])
V.S(t + 6.0, 'stamp_2', 0.7); V.S(t + 6.0, 'braam3', 0.4); V.M(t, t + 25, 'triumph', 0, 0.6, 1.0, 1.0); yr(t + 13, 2036)
t = V.sc('end', 12.0, id='DEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5) saturate(0.6)', lines=[[0.8, 'WOULD YOU WANT TO KNOW?', 300, 110, 99, CY]], ask=[2.6, 'Yes or no? Tell us why 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='YEAR', kf=YR, fmt='yr'), bar=dict(label='HUMANITY', kf=POP, sub=None))
V.export()
