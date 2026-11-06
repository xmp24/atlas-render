"""Vídeo 10: What If Everyone Lost Their Memory at Midnight — la medianoche barre el mapa y borra memorias; un mundo hecho de notas."""
from wsim import *
V = Vid('memory', seed=1010)
DY = []
def dy(t, d): DY.append([round(t, 2), d])
ALLK = sorted(set(K.values()))
NOTE = '#ffe680'; WIPE = '#9fd4ff'
TZL = []; SPAN = []
S0 = 178.0
def sweep(t0, t1, l0, l1):
    TZL.extend([[round(t0, 2), l0], [round(t1, 2), l1]]); SPAN.extend([[round(t0, 2), min(360, S0 - l0)], [round(t1, 2), min(360, S0 - l1)]])
MID = lambda: dict(mode='tz', t0=0, col='#c8d8ff', col2='#ffffff', a=0.35, band=8, lvl=TZL, span=SPAN)
def map_(d, id, **kw): return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
CITIES = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(2.35, 48.85), P(-46.6, -23.5), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(-99.1, 19.4), P(28.97, 41), P(31.2, 30), P(3.4, 6.5), P(151.2, -33.9), P(-118.2, 34)]

# ======================= TRÁILER =======================
t = V.sc('title', 7.0, id='Y_A', hard=True, bg='black', texts=[[0.3, 2.4, '11:59 PM', 190, 520, '#ffffff', 'rgba(160,200,255,0.7)', 8], [2.4, 4.4, '12:00 AM', 190, 520, WIPE, 'rgba(160,200,255,0.9)', 8], [4.4, 7.0, 'EVERYTHING IS GONE.', 110, 540, '#ffffff', 'rgba(160,200,255,0.6)']], flash=[2.4])
V.S(t + 0.3, 'tick', 0.5); V.S(t + 1.3, 'tick', 0.5); V.S(t + 2.4, 'clock_chime', 0.8); V.S(t + 2.4, 'glitch', 0.6); V.S(t + 4.4, 'braam', 0.9); V.M(t + 4.4, t + 7, 'horror', 60, 0.45, 0.2, 0.3)
CT = [('AUCKLAND', P(174.8, -36.8)), ('SYDNEY', P(151.2, -33.9)), ('TOKYO', P(139.7, 35.7)), ('BEIJING', P(116.4, 39.9)), ('BANGKOK', P(100.5, 13.7)), ('DELHI', P(77.2, 28.6)), ('DUBAI', P(55.3, 25.2)),
      ('MOSCOW', P(37.6, 55.75)), ('PARIS', P(2.35, 48.85)), ('LONDON', P(-0.1, 51.5)), ('NEW YORK', P(-74, 40.7)), ('LOS ANGELES', P(-118.2, 34))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · 00:00', WIPE]], grade='rgba(120,160,255,0.2)', filter='brightness(0.55) saturate(0.5)') for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='Y_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'CITY BY CITY.', 130], [3.6, 7.4, 'MIDNIGHT ERASES EVERYONE.', 100, 540, WIPE, 'rgba(160,200,255,0.7)']])
V.M(t, t + 7.4, 'frantic', 100, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.S(t + 0.4 + i * 0.55, 'clock_chime', 0.2) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='Y_C', hard=True, kf=[[0, 24], [4, 0]], fmt='int', unit=' H', top='HOW LONG YOUR MEMORY LASTS', label=[4.0, 'EVERY. SINGLE. DAY.', WIPE], col='#ffffff', glow='rgba(160,200,255,0.9)', bgc='radial-gradient(ellipse, #0a1a3a, #000 70%)')
[V.S(t + 0.1 + i * 0.16, 'tick', 0.35) for i in range(24)]; V.S(t + 4.0, 'thit', 0.9)
t = V.sc('title', 8.5, id='Y_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='brightness(0.55) saturate(0.5)', grad='radial-gradient(ellipse at 50% 85%, rgba(160,200,255,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF EVERYONE LOST', 250, 126], [0.5, 'THEIR MEMORY AT MIDNIGHT?', 410, 104, WIPE]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 120, 0.8, 0.05, 1.2); dy(t + 8.5, 0)

# ======================= CAP 1: LA PRIMERA MEDIANOCHE =======================
t = map_(13, 'Y1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE FIRST MIDNIGHT'], cam=[[0, *P(165, -30), 0.75], [13, *P(150, -25), 0.8]], night=[[0, 0.5], [13, 0.5]], cells=[MID()],
         pins=[[4.0, *P(174.8, -36.8), 'AUCKLAND · 00:00', WIPE], [8.0, *P(151.2, -33.9), 'SYDNEY · 00:00', WIPE]], caps=[[3.0, 7.6, 'New Zealand hits midnight first.', 'midnight'], [8.0, 12.6, 'Every mind in the country goes blank.', 'blank']])
sweep(t + 2.6, t + 13, 178, 148)
V.chap_snd(t); V.S(t + 4, 'clock_chime', 0.6); V.S(t + 4, 'glitch', 0.5); V.M(t, t + 70, 'nocturne', 0, 0.6, 1.0, 0.8); dy(t + 13, 1)
t = V.sc('balls', 9.0, id='YB1', bg='night', balls=[[K['NZ'], 640, 640, 230, 'scared'], [K['NZ'], 1280, 640, 230, 'scared']],
         bubs=[[0.6, 0, 'Who are you?'], [3.0, 1, 'Who are YOU? Why are you in my bed?'], [6.2, 0, '...Is this my house?']])
sweep(t, t + 9, 148, 132); V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 1)
t = map_(13, 'Y2', cam=[[0, *P(120, 30), 0.65], [13, *P(105, 30), 0.7]], night=[[0, 0.5], [13, 0.5]], cells=[MID()], pins=[[2.0, *P(139.7, 35.7), 'TOKYO · ERASED', WIPE], [6.0, *P(116.4, 39.9), 'BEIJING · ERASED', WIPE], [10.0, *P(100.5, 13.7), 'BANGKOK · ERASED', WIPE]],
         counters=[[1.0, 'MINDS ERASED', [[1, 5.0e6], [12, 2.3e9]], 'big', WIPE]], caps=[[0.6, 5.6, 'Japan. Korea. China. One time zone after another.', 'time zone'], [6.6, 12.6, 'Night-shift workers forget what their machines do.', 'machines']])
sweep(t, t + 13, 132, 95); [V.S(t + x, 'clock_chime', 0.3) for x in [2, 6, 10]]; dy(t + 13, 1)
t = map_(12, 'Y3', cam=[[0, *P(50, 35), 0.6], [12, *P(25, 42), 0.65]], night=[[0, 0.5], [12, 0.5]], cells=[MID()], pins=[[2.0, *P(77.2, 28.6), 'DELHI · ERASED', WIPE], [6.0, *P(37.6, 55.75), 'MOSCOW · ERASED', WIPE], [9.0, *P(28.97, 41), 'ISTANBUL · ERASED', WIPE]],
         caps=[[0.6, 5.6, 'India and the Middle East. Then Russia.', 'Russia'], [6.6, 11.6, 'Pilots in the air forget how to land.', 'how to land']])
sweep(t, t + 12, 95, 30); [V.S(t + x, 'clock_chime', 0.3) for x in [2, 6, 9]]; V.S(t + 6.6, 'jet', 0.4); dy(t + 12, 1)
t = map_(13, 'Y4', cam=[[0, *P(10, 40), 0.65], [13, *P(-10, 40), 0.65]], night=[[0, 0.5], [13, 0.5]], cells=[MID()], pins=[[2.0, *P(2.35, 48.85), 'PARIS · ERASED', WIPE], [5.0, *P(-0.1, 51.5), 'LONDON · ERASED', WIPE], [8.0, *P(3.4, 6.5), 'LAGOS · ERASED', WIPE]],
         counters=[[1.0, 'MINDS ERASED', [[1, 4.6e9], [12, 6.1e9]], 'big', WIPE]], caps=[[0.6, 5.6, 'Europe and Africa go blank at the same time.', 'blank'], [6.6, 12.6, 'In America, it\'s still evening. People watch in horror.', 'horror']])
sweep(t, t + 13, 30, -25); [V.S(t + x, 'clock_chime', 0.3) for x in [2, 5, 8]]; dy(t + 13, 1)
t = V.sc('balls', 9.0, id='YB2', bg='night', balls=[[K['US'], 640, 640, 230, 'scared', 'none', None, '11:40 PM', {'sweat': True}], [K['US'], 1280, 640, 230, 'scared', 'none', None, 'WIFE']],
         bubs=[[0.6, 0, 'We have 20 minutes. Write everything down.'], [4.0, 1, 'Our names. The kids. The pin codes!'], [7.0, 0, 'Write: "I love you." Twice.']])
sweep(t, t + 9, -25, -60); V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'typing', 0.5); dy(t + 9, 1)
t = map_(13, 'Y5', cam=[[0, *P(-85, 30), 0.6], [13, *P(-95, 20), 0.62]], night=[[0, 0.5], [13, 0.5]], cells=[MID()], pins=[[2.0, *P(-74, 40.7), 'NEW YORK · ERASED', WIPE], [5.0, *P(-46.6, -23.5), 'SÃO PAULO · ERASED', WIPE], [9.0, *P(-118.2, 34), 'LOS ANGELES · ERASED', WIPE]],
         caps=[[0.6, 5.6, 'The Americas fall last.', 'last'], [6.6, 12.6, '24 hours later, not one human remembers yesterday.', 'not one']])
sweep(t, t + 13, -60, -182); [V.S(t + x, 'clock_chime', 0.3) for x in [2, 5, 9]]; dy(t + 13, 1)
t = V.sc('bignum', 6.0, id='YBN1', kf=[[0, 0], [4, 8.1e9]], fmt='big', top='PEOPLE WITH NO MEMORY', label=[4.0, 'NOT A NAME. NOT A FACE. NOTHING.', WIPE], col='#ffffff', glow='rgba(160,200,255,0.9)', bgc='radial-gradient(ellipse, #0a1a3a, #000 70%)')
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 1)
MO = [('TOKYO', P(139.7, 35.7)), ('MUMBAI', P(72.9, 19.1)), ('CAIRO', P(31.2, 30)), ('ROME', P(12.5, 41.9)), ('LAGOS', P(3.4, 6.5)), ('BOGOTÁ', P(-74.1, 4.7)), ('CHICAGO', P(-87.6, 41.9)), ('JAKARTA', P(106.8, -6.2))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · "WHO AM I?"', WIPE]], grade='rgba(255,220,160,0.15)') for i, (n, xy) in enumerate(MO)]
t = V.sc('cuts', 0.3 + len(MO) * 0.9 + 0.3, id='Y5B', cuts=cuts, texts=[[0.05, 7.8, 'THE NEXT MORNING', 110, 540, '#ffffff', 'rgba(160,200,255,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'whoosh', 0.25) for i in range(len(MO))]; V.S(t, 'birds', 0.3); dy(t + 7.8, 1.2)

# ======================= CAP 2: EL DÍA EN BLANCO =======================
t = map_(13, 'Y6', chap=[0.0, 2.6, 'CHAPTER 2', 'THE BLANK DAY'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], rings=[[3.0 + i * 0.3, *xy, '#ff6a5a', 3] for i, xy in enumerate(CITIES)],
         counters=[[3.0, 'ACCIDENTS IN 24 HOURS', [[3, 0], [12, 4.8e6]], 'big', '#ff6a5a']], caps=[[3.0, 7.6, 'Day 1. Nobody knows how to drive. Or cook. Or work.', 'drive'], [8.0, 12.6, 'But skills like walking and talking survive.', 'survive']])
V.chap_snd(t); V.M(t, t + 50, 'tension', 0, 0.65, 1.0, 0.8); [V.SV(t + 3 + i * 0.4, 'hit', 0.2) for i in range(10)]; dy(t + 13, 1.4)
t = V.sc('balls', 10.0, id='YB3', bg='street', balls=[[K['FR'], 640, 640, 230, 'scared'], [K['FR'], 1280, 640, 230, 'normal', 'none', None, 'NOTE ON THE FRIDGE']], props=[['newspaper', 1280, 380, 120, NOTE]],
         bubs=[[0.6, 0, 'There\'s a note on the fridge.'], [3.4, 0, '"Your name is Pierre. You\'re a dentist."'], [6.8, 0, 'I\'m... a dentist?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 1.5)
t = V.sc('balls', 10.0, id='YB3B', bg='street', balls=[[K['MX'], 640, 680, 170, 'scared', 'none', None, 'AGE 7'], [K['MX'], 1280, 640, 230, 'scared', 'none', None, None]],
         bubs=[[0.6, 0, 'Are you my mom?'], [3.4, 1, 'I... don\'t know.'], [6.4, 1, 'Let\'s find out together.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 1.55)
t = map_(12, 'Y7', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'newspaper', NOTE, 42] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'PEOPLE WHO LEFT THEMSELVES A NOTE', [[0.8, 0], [8, 0.21]], 'pct', NOTE]], caps=[[0.6, 5.6, 'Only 1 in 5 people left a note before midnight.', '1 in 5'], [6.6, 11.6, 'Those notes become the most precious objects on Earth.', 'precious']])
[V.S(t + 0.6 + i * 0.3, 'ding', 0.12) for i in range(len(CITIES))]; dy(t + 12, 1.6)
t = V.sc('news', 14.0, id='YN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.6], [10, 0.9]],
         bubs=[[1.0, 0, 'I found this script on my desk.'], [4.4, 0, '"You are a news anchor. Read this."'], [8.0, 0, 'Everyone forgets everything at midnight. Write notes. NOW.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'WRITE IT DOWN'], [9.8, 'WORLD EVENING POST', 'MIDNIGHT ERASES ALL']], ticker='WRITE DOWN YOUR NAME  •  WRITE DOWN YOUR FAMILY  •  WRITE DOWN YOUR JOB  •  READ THIS AGAIN TOMORROW  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.6, 9.8]]; dy(t + 14, 1.7)
t = map_(12, 'Y8', cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.32]], night=[[0, 0.1], [7, 0.55]], icons=[[0.6 + i * 0.4, *xy, 'lightning-storm', '#ffd23f', 44] for i, xy in enumerate([P(30.1, 51.4), P(-77, 39), P(2.3, 47), P(139.7, 35.7), P(116.4, 39.9), P(77.2, 28.6), P(-46.6, -23.5)])],
         stamps=[[6.6, 'BLACKOUT', 960, 470, '#ffd23f', 150]], caps=[[0.6, 5.6, 'Engineers wake up next to machines they don\'t understand.', 'don\'t understand'], [7.6, 11.6, 'Power stations shut down to stay safe.', 'shut down']])
V.S(t + 6.6, 'blackout', 0.8); dy(t + 12, 2)
t = V.sc('balls', 10.0, id='YB4', bg='office', balls=[[K['US'], 960, 640, 250, 'scared', 'tie', None, 'PRESIDENT?']], props=[['crown', 960, 380, 90, '#ffd23f']],
         bubs=[[0.6, 0, '"You are the President." Me?'], [3.8, 0, 'There\'s a briefcase here.'], [6.8, 0, 'Nobody touch the red button.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 2.2)
t = map_(13, 'Y9', cam=[[0, 3840, 1950, 0.3], [13, 3840, 1950, 0.32]], night=[[0, 0.4], [13, 0.4]], icons=[[0.8 + i * 0.4, *xy, 'handcuffs', '#ff6a5a', 44] for i, xy in enumerate(CITIES[:10])],
         counters=[[0.8, 'PRISONERS WHO WALKED OUT', [[0.8, 0], [10, 6.7e6]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'Guards don\'t remember who\'s guilty. Prisoners don\'t either.', 'guilty'], [7.0, 12.6, 'Cell doors open. Nobody knows who should stay.', 'should stay']])
V.S(t + 1, 'steel_door', 0.5); dy(t + 13, 2.5)
HOSP = [P(-74, 40.7), P(-0.1, 51.5), P(2.35, 48.85), P(139.7, 35.7), P(77.2, 28.6), P(-46.6, -23.5), P(31.2, 30), P(116.4, 39.9)]
t = map_(12, 'Y9B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.4, *xy, 'magnifying-glass', '#ff9a9a', 44] for i, xy in enumerate(HOSP)],
         counters=[[0.8, 'SURGERIES CANCELLED', [[0.8, 0], [9, 3.1e5]], 'big', '#ff9a9a']], caps=[[0.6, 5.6, 'Surgeons wake up and read a medical manual for the first time.', 'manual'], [6.6, 11.6, 'Hospitals only do what fits in one day of learning.', 'one day']])
V.S(t + 0.6, 'beep_hi', 0.4); dy(t + 12, 2.6)
t = V.sc('call', 13.0, id='YC1', ks=ks('US', 'CN', 'IN', 'BR'), banner='EMERGENCY SUMMIT · 6 PM', eyes=['scared', 'scared', 'normal', 'scared'],
         bubs=[[1.0, 0, 'We have six hours before we forget this call.'], [4.4, 1, 'Then we decide everything now.'], [7.4, 2, 'And we write it all down.'], [10.0, 3, 'On paper. Lots of paper.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); dy(t + 13, 2.75)

# ======================= CAP 3: EL MUNDO DE LAS NOTAS =======================
t = map_(13, 'Y10', chap=[0.0, 2.6, 'CHAPTER 3', 'A WORLD OF NOTES'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], tints=[tint(ALLK, NOTE, [[3, 0], [8, 0.3]], 0)],
         counters=[[3.0, 'PAPER NOTES WRITTEN TODAY', [[3, 0], [12, 4.4e10]], 'big', NOTE]], caps=[[3.0, 7.6, 'Week 1. Every evening becomes "Writing Hour".', 'Writing Hour'], [8.0, 12.6, 'Every morning: "Reading Hour".', 'Reading Hour']])
V.chap_snd(t); V.M(t, t + 60, 'voyage', 0, 0.65, 1.0, 0.8); [V.S(t + 3 + i * 0.5, 'typing', 0.15) for i in range(10)]; dy(t + 13, 7)
t = V.sc('balls', 10.0, id='YB5', bg='lab', balls=[[K['JP'], 640, 640, 230, 'normal', 'none', None, 'TATTOO ARTIST'], [K['JP'], 1280, 640, 230, 'smug', 'none', None, 'CUSTOMER']],
         bubs=[[0.6, 1, 'Tattoo my name, my address and my wife\'s face.'], [4.6, 0, 'On your arm?'], [6.8, 1, 'On my forehead. So I see it in the mirror.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 8)
t = map_(12, 'Y10B', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.35, *xy, 'padlock', '#ff6a5a', 42] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'PASSWORDS FORGOTTEN', [[0.8, 0], [9, 3.4e10]], 'big', '#ff6a5a']], stamps=[[7.4, 'LOCKED OUT', 960, 470, '#ff3b30', 140]],
         caps=[[0.6, 5.6, 'Phones, emails, bank accounts: all locked.', 'locked'], [8.4, 11.6, 'Fingerprint and face unlock save the day.', 'save the day']])
[V.S(t + 0.6 + i * 0.35, 'lock', 0.12) for i in range(len(CITIES))]; V.S(t + 7.4, 'stamp_3', 0.7); dy(t + 12, 9)
RADIO = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(77.2, 28.6), P(-46.6, -23.5), P(31.2, 30), P(116.4, 39.9), P(151.2, -33.9), P(3.4, 6.5), P(37.6, 55.75)]
t = map_(13, 'Y11', cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.35, *xy, 'tv', WIPE, 44] for i, xy in enumerate(RADIO)],
         counters=[[0.8, 'PEOPLE WATCHING THE MORNING BRIEFING', [[0.8, 0], [10, 6.9e9]], 'big', WIPE]], caps=[[0.6, 5.6, 'Every morning at 7 AM, a recorded video plays on every screen.', '7 AM'], [6.6, 12.6, '"Good morning. You lost your memory. Here is the world."', 'Good morning']])
[V.S(t + 0.6 + i * 0.35, 'static', 0.12) for i in range(len(RADIO))]; dy(t + 13, 10)
t = V.sc('balls', 10.0, id='YB6', bg='sky', balls=[[K['ES'], 640, 640, 230, 'normal', 'none', None, None], [K['ES'], 1280, 640, 230, 'normal', 'none', None, None]],
         bubs=[[0.6, 0, 'The note says we\'ve been married 20 years.'], [4.2, 1, 'Then let\'s fall in love again.'], [7.2, 0, 'Like every day.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 14)
SCAM = [P(-74, 40.7), P(-0.1, 51.5), P(2.35, 48.85), P(121.5, 31.2), P(72.9, 19.1), P(-99.1, 19.4), P(28.97, 41), P(-58.4, -34.6)]
t = map_(12, 'Y12', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], night=[[0, 0.35], [12, 0.35]], icons=[[0.6 + i * 0.4, *xy, 'spy', '#ff6a5a', 44] for i, xy in enumerate(SCAM)],
         stamps=[[6.4, 'FAKE NOTES', 960, 470, '#ff3b30', 140]], caps=[[0.6, 5.6, 'Criminals find a new trick: swap people\'s notes at night.', 'swap'], [7.6, 11.6, '"You owe me your house. Signed: you."', 'Signed']])
V.S(t + 6.4, 'stamp_3', 0.8); dy(t + 12, 20)
t = V.sc('news', 14.0, id='YN2', anchor=K['US'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.3], [10, 0.5]],
         bubs=[[1.0, 0, 'Day 30. Notes are now legal documents.'], [4.4, 0, 'Fingerprint stamps protect them from forgery.'], [8.4, 0, 'Please check your note is really yours.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'NOTE FRAUD WAVE'], [9.8, 'WORLD EVENING POST', 'THE NOTE LAW']], ticker='DAY 30  •  NOTE FRAUD UP 4000%  •  FINGERPRINT STAMPS MANDATORY  •  READ YOUR NOTE TWICE  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; dy(t + 14, 30)
WARA = [[P(37, 51), P(31, 50)], [P(75, 33), P(71, 31)], [P(127, 39), P(127, 36)], [P(44, 33), P(51, 33)]]
t = map_(14, 'Y13', cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], war=True,
         arrows=[[2.0 + i * 0.7, 5.4 + i * 0.7, *a, *b, '#ff3b30', 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'THE ONE-DAY WARS', '#c3100a']], stamps=[[10.0, 'FORGOTTEN BY MIDNIGHT', 960, 480, WIPE, 90]],
         caps=[[3.6, 8.6, 'Old hatreds are forgotten... but so are peace treaties.', 'peace treaties'], [9.0, 13.6, 'Some wars start in the morning and are forgotten at night.', 'forgotten']])
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.7 + j * 0.6; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 60, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.SV(tt, 'boom', 0.3)
V.S(t + 0.4, 'braam2', 0.6); V.S(t + 10, 'clock_chime', 0.6); V.M(t, t + 14.4, 'frantic', 40, 0.8, 0.4, 0.6); dy(t + 14, 40)
t = V.sc('bignum', 6.0, id='YBN2', kf=[[0, 0], [4, 1.2e10]], fmt='big', top='NOTEBOOKS PRINTED IN ONE MONTH', label=[4.0, 'PAPER IS THE NEW OIL', NOTE], col='#ffffff', glow='rgba(255,230,128,0.8)', bgc='radial-gradient(ellipse, #2a2406, #000 70%)')
V.S(t + 0.1, 'whoosh_6', 0.5); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 45)
PAP = [('CA', 98), ('SE', 91), ('FI', 88), ('BR', 84), ('US', 80), ('CN', 77), ('RU', 70), ('ID', 61)]
t = V.sc('rank', 10.0, id='YRK1', title='NEW SUPERPOWERS: PAPER PRODUCERS', rows=[[K[c], [[0, 0], [7, v]]] for c, v in PAP if c in K], fmt='int', unit=' / 100', col='linear-gradient(90deg, #ffe680, #fff6c8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 50)
t = V.sc('balls', 10.0, id='YB9', bg='desert', balls=[[K['IN'], 640, 640, 230, 'scared', 'delta', None, 'SOLDIER'], [K['PK'], 1280, 640, 230, 'scared', 'delta', None, 'SOLDIER']],
         bubs=[[0.6, 0, 'My note says you\'re my enemy.'], [3.8, 1, 'My note says the same about you.'], [6.8, 0, '...Want some tea?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 55)

# ======================= CAP 4: LA MEMORIA EXTERNA =======================
t = map_(13, 'Y14', chap=[0.0, 2.6, 'CHAPTER 4', 'OUTSIDE MEMORY'], cam=[[0, *P(127, 37), 1.6], [13, *P(127, 37), 1.8]], rings=[[3.0, *P(127, 37.5), '#3bd16f', 5]], pins=[[3.0, *P(126.98, 37.56), 'SEOUL LAB', '#3bd16f']],
         stamps=[[8.0, 'THE MEMORY BAND', 960, 470, '#3bd16f', 120]], caps=[[3.0, 7.6, 'Month 3. Engineers in Seoul build a small wristband.', 'wristband'], [8.6, 12.6, 'At 7 AM, it plays your own life story into your ears.', 'life story']])
V.chap_snd(t); V.S(t + 3, 'scan', 0.5); V.S(t + 8, 'stamp_2', 0.8); V.M(t + 2.6, t + 80, 'heroic', 0, 0.7, 1.0, 0.8); dy(t + 13, 90)
t = V.sc('balls', 10.0, id='YB7', bg='lab', balls=[[K['KR'], 640, 640, 230, 'normal', 'none', None, 'ENGINEER'], [K['KR'], 1280, 640, 230, 'smug', 'none', None, 'TESTER']],
         bubs=[[0.6, 1, 'It says I\'m an engineer. And I built this.'], [4.4, 0, 'You did. Yesterday. And the day before.'], [7.6, 1, 'Then I\'m a genius every morning.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 95)
SHIP = [[P(127, 37), P(-95, 40)], [P(127, 37), P(77, 22)], [P(127, 37), P(10, 50)], [P(127, 37), P(-55, -12)], [P(127, 37), P(25, 0)], [P(127, 37), P(140, -28)], [P(127, 37), P(37, 55)]]
t = map_(14, 'Y15', cam=[[0, 3840, 2000, 0.3], [14, 3840, 2000, 0.32]], tints=[tint(ks('KR', 'JP', 'CN', 'US', 'DE', 'FR', 'GB', 'IN', 'BR', 'MX', 'CA', 'AU', 'ES', 'IT', 'TR', 'ID', 'ZA', 'NG', 'EG', 'AR'), '#3bd16f', [[3, 0], [11, 0.45]], 0.2)],
         arrows=[[1.0 + i * 0.5, 4.4 + i * 0.5, *a, *b, '#3bd16f', 22] for i, (a, b) in enumerate(SHIP)], counters=[[1.0, 'MEMORY BANDS WORN', [[1, 0], [13, 5.2e9]], 'big', '#3bd16f']],
         caps=[[0.6, 5.6, 'Factories built and run by note-readers ship billions.', 'billions'], [7.0, 13.6, 'Each morning now begins with your own voice.', 'own voice']])
[V.SV(t + 1 + i * 0.5, 'whoosh', 0.25) for i in range(len(SHIP))]; dy(t + 14, 150)
BAND = [('KR', 99), ('JP', 97), ('DE', 95), ('US', 91), ('CN', 88), ('BR', 74), ('IN', 63), ('NG', 41)]
t = V.sc('rank', 10.0, id='Y15B', title='PEOPLE WITH A MEMORY BAND · MONTH 6', rows=[[K[c], [[0, 0], [7, v]]] for c, v in BAND if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #3bd16f, #c8ffd8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 180)
t = map_(12, 'Y16', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.5], [12, 0.5]], cells=[dict(mode='tz', t0=0, col=None, col2='#ffffff', a=0.35, band=8, lvl=[[0, 0], [99999, 0]])],
         rings=[[1.0 + i * 0.4, *xy, '#3bd16f', 2] for i, xy in enumerate(CITIES)], caps=[[0.6, 5.6, 'Midnight still wipes every mind on Earth.', 'still'], [6.6, 11.6, 'But at 7 AM, 5 billion bands say: "Welcome back."', 'Welcome back']])
[V.S(t + 1 + i * 0.4, 'ding', 0.12) for i in range(len(CITIES))]; dy(t + 12, 200)
t = V.sc('news', 14.0, id='YN3', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.3], [10, 0]],
         bubs=[[1.0, 0, 'Year 1. Nobody remembers it. But we lived it.'], [5.0, 0, 'Planes fly. Hospitals work. Children learn.'], [9.0, 0, 'Every day... from the start.']],
         papers=[[6.0, 'THE GLOBE DAILY', 'ONE YEAR. ZERO MEMORIES.'], [10.2, 'WORLD EVENING POST', 'WE ADAPTED']], ticker='ONE YEAR OF MIDNIGHTS  •  5.2 BILLION MEMORY BANDS  •  SCHOOLS REOPEN: ONE LESSON A DAY  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [6.0, 10.2]]; dy(t + 14, 365)
t = V.sc('balls', 10.0, id='YB8', bg='night', balls=[[K['IN'], 960, 640, 250, 'normal', 'none', None, 'GRANDPA', {'tears': True}]], props=[['newspaper', 960, 360, 120, NOTE]],
         bubs=[[0.6, 0, 'My band says I have a granddaughter.'], [4.4, 0, 'Born yesterday. I don\'t remember it.'], [7.6, 0, 'So I\'ll meet her for the first time. Again.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 366)
t = V.sc('bignum', 6.0, id='YBN3', kf=[[0, 365], [4, 0]], fmt='int', top='DAYS ANYONE ON EARTH CAN REMEMBER', label=[4.0, 'BUT THE NOTES REMEMBER ALL OF THEM', NOTE], col='#ffffff', glow='rgba(255,230,128,0.8)', bgc='radial-gradient(ellipse, #2a2406, #000 70%)')
V.S(t + 0.1, 'downlifter', 0.5); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 366)
t = map_(13, 'Y17', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.27]], tints=[tint(ALLK, '#3bd16f', [[0, 0.2]]), tint(ALLK, NOTE, [[1, 0], [6, 0.2]], 0)],
         stamps=[[6.0, 'A WORLD WITHOUT YESTERDAY', 960, 460, WIPE, 96, 0]], caps=[[0.6, 5.6, 'No grudges. No old wars. No memories of the good days either.', 'No grudges'], [8.0, 12.6, 'Only today. Every day.', 'Only today']])
V.S(t + 6.0, 'stamp_2', 0.7); V.S(t + 6.0, 'braam3', 0.4); V.M(t, t + 25, 'triumph', 0, 0.6, 1.0, 1.0); dy(t + 13, 400)
t = V.sc('end', 12.0, id='YEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5) saturate(0.6)', lines=[[0.8, 'WHAT WOULD YOUR NOTE SAY?', 300, 100, 99, WIPE]], ask=[2.6, 'Write it in the comments 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='DAY', kf=DY, fmt='int'))
V.export()
