"""Vídeo 7: What If Nobody Could Sleep Anymore — insomnio global; el mapa se deforma con las alucinaciones."""
from wsim import *
V = Vid('nosleep', seed=77)
DY = []; POP = []
def dy(t, d): DY.append([round(t, 2), d])
def popk(t, p): POP.append([round(t, 2), p])
ALLK = sorted(set(K.values()))
PURP = '#a04aff'
def F(lv):   # filtro de "fatiga": cuanto más alto, más alucinado
    return [None, 'saturate(1.15) contrast(1.05)', 'saturate(1.3) hue-rotate(12deg) contrast(1.1)', 'saturate(1.5) hue-rotate(28deg) contrast(1.2)', 'saturate(1.5) hue-rotate(38deg) contrast(1.25) brightness(0.92)', 'saturate(0.9) hue-rotate(70deg) contrast(1.2) brightness(0.75)'][lv]
def map_(d, id, lv=0, **kw):
    if lv: kw.setdefault('filter', F(lv))
    if lv >= 3: kw.setdefault('tint2', 'rgba(140,60,255,%.2f)' % (0.045 * lv))
    return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))

# ======================= TRÁILER =======================
t = V.sc('title', 7.0, id='S_A', hard=True, bg='black', texts=[[0.3, 3.4, '3:47 AM', 200, 520, '#9fd4ff', 'rgba(120,180,255,0.7)', 10], [3.4, 7.0, 'NOBODY ON EARTH IS ASLEEP', 86, 540, '#ffffff', 'rgba(160,80,255,0.7)']], flash=[3.4])
[V.S(t + 0.2 + i, 'tick', 0.5) for i in range(3)]; V.S(t + 3.4, 'braam', 0.9); V.S(t + 3.4, 'tinnitus', 0.25); V.M(t + 3.4, t + 7, 'horror', 40, 0.45, 0.2, 0.3)
CT = [('NEW YORK', P(-74, 40.7)), ('LONDON', P(-0.1, 51.5)), ('TOKYO', P(139.7, 35.7)), ('MUMBAI', P(72.9, 19.1)), ('LAGOS', P(3.4, 6.5)), ('SÃO PAULO', P(-46.6, -23.5)), ('MOSCOW', P(37.6, 55.75)),
      ('CAIRO', P(31.2, 30)), ('SYDNEY', P(151.2, -33.9)), ('MEXICO CITY', P(-99.1, 19.4)), ('BEIJING', P(116.4, 39.9)), ('PARIS', P(2.35, 48.85))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · 3 AM · AWAKE', '#c8a0ff']], grade='rgba(80,40,200,0.3)', filter='brightness(0.5) saturate(0.8) hue-rotate(%ddeg)' % (i * 8)) for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='S_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'NO ONE CAN SLEEP.', 130], [3.6, 7.4, 'NOT TONIGHT. NOT EVER.', 104, 540, '#c8a0ff', 'rgba(160,80,255,0.7)']])
V.M(t, t + 7.4, 'frantic', 70, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('bignum', 6.0, id='S_C', hard=True, kf=[[0, 0], [4.2, 264]], fmt='int', top='HOURS AWAKE', label=[4.2, 'THE HUMAN RECORD. NOW EVERYONE BREAKS IT.', '#c8a0ff'], col='#ffffff', glow='rgba(160,80,255,0.9)', bgc='radial-gradient(ellipse, #1a0a3a, #000 70%)')
[V.S(t + 0.1 + i * 0.16, 'tick', 0.35) for i in range(26)]; V.S(t + 4.2, 'thit', 0.9); V.S(t + 4.2, 'heartbeat', 0.7)
t = V.sc('title', 8.5, id='S_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='brightness(0.55) hue-rotate(30deg)', grad='radial-gradient(ellipse at 50% 85%, rgba(160,80,255,0.4), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF NOBODY', 250, 140], [0.5, 'COULD SLEEP ANYMORE?', 410, 120, '#c8a0ff']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2); dy(t + 8.5, 0); popk(0, 100)

# ======================= CAP 1: LA PRIMERA NOCHE =======================
t = map_(13, 'N1', chap=[0.0, 2.6, 'CHAPTER 1', 'THE FIRST NIGHT'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]], night=[[0, 0.55], [13, 0.55]],
         counters=[[3.0, 'PEOPLE ASLEEP RIGHT NOW', [[3, 3.1e9], [11, 0]], 'big', '#9fd4ff']], caps=[[3.0, 7.6, 'March 3rd. Billions of people go to bed.', 'go to bed'], [8.0, 12.6, 'And nobody falls asleep.', 'nobody']])
V.chap_snd(t); V.M(t, t + 40, 'nocturne', 0, 0.6, 1.0, 0.8); [V.S(t + 4 + i * 0.7, 'tick', 0.3) for i in range(10)]; dy(t + 13, 1)
t = V.sc('balls', 9.0, id='NB1', bg='night', balls=[[K['ES'], 640, 640, 220, 'normal'], [K['ES'], 1280, 640, 220, 'normal']],
         bubs=[[0.6, 0, 'Can\'t sleep?'], [3.2, 1, 'No. Weird. I\'m not even tired.'], [6.2, 0, 'It\'s 4 AM...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'tick', 0.3); dy(t + 9, 1)
AM = [('TOKYO', P(139.7, 35.7)), ('DELHI', P(77.2, 28.6)), ('BERLIN', P(13.4, 52.5)), ('LAGOS', P(3.4, 6.5)), ('NEW YORK', P(-74, 40.7)), ('LIMA', P(-77, -12)), ('SYDNEY', P(151.2, -33.9)), ('CAIRO', P(31.2, 30))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · 0 HOURS SLEPT', '#9fd4ff']], grade='rgba(60,40,160,0.25)', filter='brightness(0.6)') for i, (n, xy) in enumerate(AM)]
t = V.sc('cuts', 0.3 + len(AM) * 0.9 + 0.3, id='N1B', cuts=cuts, texts=[[0.05, 7.8, 'NIGHT 1', 120, 540, '#9fd4ff', 'rgba(120,160,255,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'whoosh', 0.25) for i in range(len(AM))]; dy(t + 7.8, 1.2)
PH = [P(-74, 40.7), P(-118, 34), P(-0.1, 51.5), P(2.35, 48.85), P(77.2, 28.6), P(139.7, 35.7), P(-46.6, -23.5), P(3.4, 6.5), P(151.2, -33.9), P(37.6, 55.75)]
t = map_(12, 'N2', lv=1, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.35, *xy, 'phone', '#c8a0ff', 40] for i, xy in enumerate(PH)],
         counters=[[0.8, 'POSTS: "CAN\'T SLEEP"', [[0.8, 0], [10, 2.8e9]], 'big', '#c8a0ff']], caps=[[0.6, 5.6, 'By morning, everyone is asking the same thing.', 'same thing'], [6.6, 11.6, 'Did ANYONE sleep last night?', 'ANYONE']])
[V.S(t + 0.6 + i * 0.35, 'ding', 0.15) for i in range(len(PH))]; dy(t + 12, 1.5)
t = V.sc('news', 14.0, id='NN1', anchor=K['US'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.3], [10, 0.8]],
         bubs=[[1.0, 0, 'Good morning. If you can call it that.'], [4.2, 0, 'Not a single person on Earth slept last night.'], [8.6, 0, 'Doctors have no explanation.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'THE WORLD STAYED UP'], [9.8, 'WORLD EVENING POST', 'NO ONE SLEPT']], ticker='BREAKING: NOBODY SLEPT LAST NIGHT  •  SLEEP CLINICS OVERWHELMED  •  STAY CALM AND REST YOUR EYES  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [5.6, 9.8]]; dy(t + 14, 2)
t = map_(12, 'N3', lv=1, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], counters=[[0.8, 'SLEEPING PILLS SOLD', [[0.8, 0], [6, 9.1e8]], 'big', '#ffd23f']],
         stamps=[[6.4, 'THEY DON\'T WORK', 960, 470, '#ff3b30', 130]], caps=[[0.6, 5.6, 'Pharmacies are emptied in hours.', 'emptied'], [7.6, 11.6, 'Even anesthesia only knocks people out for minutes.', 'minutes']])
V.S(t + 6.4, 'stamp_3', 0.8); dy(t + 12, 2.5)
t = V.sc('balls', 9.0, id='NB1B', bg='night', balls=[[K['BR'], 640, 670, 170, 'normal', 'none', None, 'AGE 7'], [K['BR'], 1280, 640, 230, 'scared', 'none', None, 'MOM']],
         bubs=[[0.6, 0, 'Mom, I\'m not tired. Can I play?'], [3.6, 1, 'It\'s 3 AM, sweetie...'], [6.2, 1, 'Sure. Why not.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 9, 2.7)
t = V.sc('balls', 10.0, id='NB2', bg='lab', balls=[[K['DE'], 640, 640, 230, 'scared', 'none', None, 'SLEEP DOCTOR'], [K['DE'], 1280, 660, 200, 'normal', 'none', None, 'PATIENT']], props=[['radar-sweep', 960, 330, 120, '#c8a0ff']],
         bubs=[[0.6, 0, 'Your brain won\'t switch off.'], [3.6, 1, 'Is that bad?'], [6.4, 0, 'The brain cleans itself while you sleep. Now it can\'t.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'beep_hi', 0.4); dy(t + 10, 3)
t = V.sc('call', 13.0, id='NC1', ks=ks('US', 'CN', 'IN', 'GB'), banner='EMERGENCY SUMMIT · DAY 3', eyes=['scared', 'angry', 'scared', 'scared'], sweat=[True, True, True, True],
         bubs=[[1.0, 0, 'Every lab on Earth works on this. Now.'], [4.0, 1, 'Is it a weapon?'], [6.8, 2, 'It hit everyone. Even us.'], [9.4, 3, 'How long can a human stay awake?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); dy(t + 13, 3)

# ======================= CAP 2: LA NIEBLA =======================
CR = [P(-87.6, 41.9), P(-118, 34), P(13.4, 52.5), P(-3.7, 40.4), P(77.2, 28.6), P(121.5, 31.2), P(-99.1, 19.4), P(28.97, 41), P(-58.4, -34.6), P(36.8, -1.3), P(100.5, 13.7), P(-79.4, 43.7)]
t = map_(12, 'N4', lv=2, chap=[0.0, 2.6, 'CHAPTER 2', 'THE FOG'], cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], rings=[[3.0 + i * 0.4, *xy, '#ff6a5a', 2] for i, xy in enumerate(CR)],
         counters=[[3.0, 'CAR CRASHES TODAY', [[3, 0], [11, 2.4e6]], 'big', '#ff6a5a']], caps=[[3.0, 7.4, 'Day 4. Reaction times collapse.', 'collapse'], [7.8, 11.6, 'Drivers fall into micro-sleeps... for one second.', 'one second']])
V.chap_snd(t); V.M(t, t + 54, 'tension', 0, 0.65, 1.0, 0.8); [V.SV(t + 3 + i * 0.4, 'hit', 0.25) for i in range(len(CR))]; dy(t + 12, 4); popk(t + 12, 99.9)
APT = [P(-84.4, 33.6), P(-87.9, 41.98), P(-0.45, 51.47), P(2.55, 49), P(55.4, 25.25), P(139.78, 35.55), P(113.9, 22.3), P(103.99, 1.36), P(-118.4, 33.94), P(8.57, 50.04)]
t = map_(12, 'N5', lv=2, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'airplane', '#8a8f96', 46] for i, xy in enumerate(APT)],
         stamps=[[5.0, 'ALL FLIGHTS GROUNDED', 960, 470, '#ff3b30', 100]], caps=[[0.6, 4.6, 'No pilot is safe to fly.', 'safe'], [7.0, 11.6, 'For the first time since 1914, the sky is empty.', 'empty']])
V.S(t + 5, 'stamp_3', 0.8); V.S(t + 0.4, 'jet', 0.3); dy(t + 12, 4.5)
t = V.sc('balls', 10.0, id='NB3B', bg='sky', balls=[[K['FR'], 700, 640, 230, 'scared', 'none', None, 'PILOT', {'sweat': True}], [K['FR'], 1300, 660, 200, 'angry', 'none', None, 'CO-PILOT']],
         bubs=[[0.6, 0, 'I see three runways.'], [3.4, 1, 'There\'s only one.'], [6.4, 1, 'We\'re NOT taking off.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 4.7)
OFF = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(2.35, 48.85), P(13.4, 52.5), P(-46.6, -23.5), P(121.5, 31.2), P(77.2, 28.6), P(31.2, 30), P(151.2, -33.9)]
t = map_(12, 'N5B', lv=2, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.3, *xy, 'closed-doors', '#cfd8e8', 42] for i, xy in enumerate(OFF)],
         counters=[[0.8, 'WORKERS SENT HOME', [[0.8, 0], [9, 2.1e9]], 'big', '#cfd8e8']], caps=[[0.6, 5.6, 'Schools close. Offices close.', 'close'], [6.6, 11.6, 'Nobody can think straight anymore.', 'think straight']])
[V.S(t + 0.6 + i * 0.3, 'steel_door', 0.15) for i in range(len(OFF))]; dy(t + 12, 5)
t = V.sc('balls', 10.0, id='NB3', bg='street', balls=[[K['MX'], 640, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['MX'], 1280, 640, 230, 'scared', 'none', None, None, {'sweat': True}]], parts=['dust', 40],
         bubs=[[0.6, 0, 'Why is the street melting?'], [3.4, 1, 'There\'s a giant spider on your head!'], [6.6, 0, '...Is any of this real?']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'glitch', 0.4); dy(t + 10, 5.5)
t = map_(13, 'N6', lv=3, cam=[[0, 3840, 2050, 0.3], [6, 3880, 2000, 0.34], [13, 3800, 2080, 0.31]], cells=[dict(mode='rand', t0=0, dur=1, col=PURP, col2='#ff4aa0', a=0.45, noise=0.4)], parts=['dust', 80],
         counters=[[1.0, 'PEOPLE HALLUCINATING', [[1, 1e9], [10, 4.6e9]], 'big', PURP]], caps=[[0.6, 5.6, 'Day 6. Half the planet is seeing things.', 'seeing things'], [6.6, 12.6, 'Shadows move. Voices whisper. Nobody can trust their eyes.', 'trust']])
V.S(t + 0.3, 'glitch', 0.6); V.S(t + 1, 'tinnitus', 0.25); dy(t + 13, 6)
t = V.sc('balls', 10.0, id='NB3C', bg='street', balls=[[K['IT'], 700, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['IT'], 1300, 700, 150, 'normal', 'none', None, 'THE DOG']],
         bubs=[[0.6, 0, 'The dog still sleeps 14 hours a day.'], [4.0, 0, 'Only humans got this.'], [7.0, 1, 'Zzz...']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 6.1)
t = V.sc('bignum', 6.0, id='NBN1', kf=[[0, 100], [4, 150]], fmt='int', top='HOURS AWAKE', label=[4.0, 'LONGER THAN MOST HUMANS EVER HAVE', '#c8a0ff'], col='#ffffff', glow='rgba(160,80,255,0.9)', bgc='radial-gradient(ellipse, #1a0a3a, #000 70%)')
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 6.3)
NUC = [P(30.1, 51.4), P(141, 37.4), P(2.3, 47), P(-77, 39), P(119.4, 34.5), P(77, 13), P(35, 47.5)]
t = map_(12, 'N7', lv=3, cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.32]], night=[[0, 0.2], [8, 0.6]], icons=[[0.6 + i * 0.5, *xy, 'radar-dish', '#ffd23f', 46] for i, xy in enumerate(NUC)],
         stamps=[[6.4, 'BLACKOUTS', 960, 470, '#ffd23f', 130]], caps=[[0.6, 5.6, 'Power plants run on exhausted engineers.', 'exhausted'], [7.6, 11.6, 'Mistakes pile up. Grids fail.', 'Grids fail']])
V.S(t + 6.4, 'blackout', 0.8); V.S(t + 6.4, 'stamp_3', 0.6); dy(t + 12, 7)
t = V.sc('news', 14.0, id='NN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 1]],
         bubs=[[1.0, 0, 'Day 7. Today\'s weather is... purple.'], [4.6, 0, 'Sorry. I haven\'t slept in a week.'], [8.6, 0, 'None of us have.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'DAY 7: NO SLEEP'], [9.8, 'WORLD EVENING POST', 'THE FOG']], ticker='DAY 7 WITHOUT SLEEP  •  DO NOT DRIVE  •  DO NOT OPERATE MACHINES  •  DO NOT TRUST WHAT YOU SEE  •  ')
V.S(t, 'news_sting', 0.6); V.S(t + 2, 'glitch', 0.4); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; dy(t + 14, 7)

# ======================= CAP 3: LA PARANOIA =======================
RIOT = [P(-74, 40.7), P(-118, 34), P(2.35, 48.85), P(-0.1, 51.5), P(-46.6, -23.5), P(-99.1, 19.4), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(28.97, 41), P(-58.4, -34.6), P(31.2, 30), P(3.4, 6.5), P(106.8, -6.2)]
t = map_(13, 'N8', lv=3, chap=[0.0, 2.6, 'CHAPTER 3', 'PARANOIA'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.33]], rings=[[3.0 + i * 0.3, *xy, '#ff3b30', 3] for i, xy in enumerate(RIOT)], parts=['ember', 50],
         counters=[[3.0, 'CITIES IN RIOT', [[3, 0], [12, 4100]], 'int', '#ff3b30']], caps=[[3.0, 7.6, 'Week 2. Exhaustion turns into rage.', 'rage'], [8.0, 12.6, 'Everyone thinks someone did this to them.', 'did this']])
V.chap_snd(t); V.M(t, t + 56, 'frantic', 0, 0.7, 1.0, 0.8); V.S(t + 3, 'crowd', 0.5); [V.SV(t + 4 + i * 0.6, 'gun', 0.2) for i in range(10)]; dy(t + 13, 9); popk(t + 13, 99.6)
t = map_(12, 'N8B', lv=3, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], icons=[[0.6 + i * 0.4, *xy, 'torch', '#ffb060', 44] for i, xy in enumerate(RIOT[:10])],
         counters=[[0.8, 'MEMBERS OF NEW SLEEP CULTS', [[0.8, 0], [10, 3.1e8]], 'big', '#ffb060']], caps=[[0.6, 5.6, 'New cults appear: "The Wakeful Ones."', 'cults'], [6.6, 11.6, 'They say sleep was a prison and we are finally free.', 'free']])
V.S(t + 0.6, 'crowd', 0.3); dy(t + 12, 10)
MIS = [[P(-100, 45), P(60, 55)], [P(60, 55), P(-100, 40)], [P(116, 40), P(-120, 38)], [P(77, 28), P(70, 31)]]
t = map_(14, 'N9', lv=4, cam=[[0, 3840, 1850, 0.3], [7, 3840, 1800, 0.34], [14, 3840, 1850, 0.3]], arrows=[[2.0 + i * 0.8, 5.4 + i * 0.8, *a, *b, '#ff3b30', 22] for i, (a, b) in enumerate(MIS)],
         banners=[[0.4, 3.4, 'MISSILE ALERT?', '#c3100a']], stamps=[[8.4, 'FALSE ALARM', 960, 470, '#ffd23f', 130]],
         caps=[[3.6, 8.0, 'Day 11. A radar officer sees missiles that aren\'t there.', 'aren\'t there'], [9.6, 13.6, 'The world comes within minutes of nuclear war.', 'minutes']])
V.S(t + 0.4, 'eas', 0.6); V.S(t + 0.4, 'siren', 0.5); [V.S(t + 2 + i * 0.8, 'missile_1', 0.3) for i in range(4)]; V.S(t + 8.4, 'stamp_3', 0.8); V.S(t + 8.4, 'braam2', 0.6); dy(t + 14, 11)
t = V.sc('call', 12.0, id='NC2', ks=ks('US', 'RU', 'CN', 'IN'), banner='HOTLINE · DAY 11', eyes=['scared', 'scared', 'angry', 'scared'], sweat=[True, True, True, True],
         bubs=[[1.0, 0, 'Did you launch?!'], [3.6, 1, 'I... don\'t remember.'], [6.4, 2, 'Nobody touches a button. NOBODY.'], [9.2, 3, 'Agreed.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'phone_ring', 0.5); dy(t + 12, 11.2)
t = V.sc('bignum', 6.0, id='NBN2', kf=[[0, 200], [4, 264]], fmt='int', top='HOURS AWAKE', label=[4.0, 'EVERY HUMAN JUST BROKE THE WORLD RECORD', '#c8a0ff'], col='#ffffff', glow='rgba(160,80,255,0.9)', bgc='radial-gradient(ellipse, #1a0a3a, #000 70%)')
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 11.5)
t = V.sc('balls', 10.0, id='NB4', bg='office', balls=[[K['JP'], 960, 640, 240, 'dead', 'tie', None, 'OFFICE WORKER']],
         bubs=[[0.6, 0, 'Day 12.'], [2.8, 0, 'I\'ve read this sentence 40 times.'], [6.4, 0, 'What... was I saying?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 12)
t = V.sc('balls', 10.0, id='NB4B', bg='desert', balls=[[K['IN'], 640, 640, 230, 'scared', 'delta', None, 'SOLDIER', {'sweat': True}], [K['PK'], 1280, 640, 230, 'scared', 'delta', None, 'SOLDIER', {'sweat': True}]],
         bubs=[[0.6, 0, 'Is that... a tank?'], [3.2, 1, 'It\'s a cow.'], [6.0, 0, 'Good. I\'m too tired to fight.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 12.5)
FARM = [P(-95, 40), P(-60, -15), P(30, 50), P(10, 48), P(78, 22), P(110, 35), P(-100, 50), P(145, -30), P(35, 0)]
t = map_(12, 'N10', lv=4, cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], useBar=True, icons=[[0.8 + i * 0.4, *xy, 'skull-crossed-bones', '#ffd23f', 40] for i, xy in enumerate(FARM)],
         counters=[[0.8, 'FOOD DELIVERED', [[0.8, 1.0], [9, 0.31]], 'pct', '#ffd23f']], caps=[[0.6, 5.6, 'Trucks stop. Ports stop. Farms stop.', 'stop'], [6.6, 11.6, 'Supermarket shelves go empty.', 'empty']])
V.S(t + 0.4, 'wind', 0.4); dy(t + 12, 14); popk(t + 12, 99.2)
BOURSE = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(114.2, 22.3), P(8.7, 50.1), P(72.9, 19.1)]
t = map_(12, 'N10B', lv=4, cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.32]], useBar=True, icons=[[0.6 + i * 0.4, *xy, 'laptop', '#ff3b30', 44] for i, xy in enumerate(BOURSE)],
         counters=[[0.8, 'GLOBAL STOCK MARKETS', [[0.8, 1.0], [8, 0.18]], 'pct', '#ff3b30']], stamps=[[8.4, 'MONEY MEANS NOTHING', 960, 470, '#ff3b30', 96]],
         caps=[[0.6, 5.6, 'Traders hallucinate. Markets crash 80%.', '80%'], [6.6, 8.2, 'Then they just close.', 'close']])
V.S(t + 8.4, 'stamp_3', 0.7); V.S(t + 1, 'downlifter', 0.5); dy(t + 12, 16)

# ======================= CAP 4: LA LARGA NOCHE =======================
GRAY = ['US', 'IN', 'CN', 'BR', 'RU', 'NG', 'DE', 'FR', 'GB', 'MX', 'ID', 'EG', 'IT', 'TR', 'IR', 'PK', 'ZA', 'AR', 'CO', 'TH', 'VN', 'PH', 'BD', 'ET', 'CD', 'KE', 'SA', 'ES', 'PL', 'UA', 'CA', 'AU']
t = map_(13, 'N11', lv=5, chap=[0.0, 2.6, 'CHAPTER 4', 'THE LONG NIGHT'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]], useBar=True,
         tints=[tint(ks(*GRAY), '#2b2b2e', [[3, 0], [10, 0.5]], 0.15)], counters=[[3.0, 'DEATHS FROM EXHAUSTION', [[3, 0], [12, 3.4e8]], 'big', '#ff3b30']],
         caps=[[3.0, 7.6, 'Week 4. Bodies begin to give up.', 'give up'], [8.0, 12.6, 'The old and the sick go first.', 'go first']])
V.chap_snd(t); V.M(t, t + 40, 'horror', 0, 0.65, 1.0, 1.0); V.S(t + 3, 'heartbeat', 0.6); V.S(t + 8, 'flatline', 0.4); dy(t + 13, 28); popk(t + 13, 95)
FUNC = [('IS', 71), ('CH', 64), ('JP', 61), ('KR', 58), ('NO', 55), ('SG', 52), ('FI', 49), ('NZ', 47)]
t = V.sc('rank', 10.0, id='NRK1', title='COUNTRIES STILL FUNCTIONING · DAY 30', rows=[[K[c], [[0, 100], [7, v]]] for c, v in FUNC if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #a04aff, #e0c8ff)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 30)
t = map_(13, 'N12', lv=4, cam=[[0, *P(8, 47), 1.6], [13, *P(8.2, 46.8), 1.9]], useBar=True, rings=[[1.0, *P(6.14, 46.2), '#3bd16f', 5]], pins=[[1.0, *P(6.14, 46.2), 'GENEVA LAB', '#3bd16f']],
         stamps=[[7.0, 'BREAKTHROUGH', 960, 470, '#3bd16f', 130]], caps=[[0.6, 5.6, 'Day 34. A lab in Geneva finds something.', 'Geneva'], [8.4, 12.6, 'A device that forces the brain into deep sleep.', 'deep sleep']])
V.S(t + 1, 'scan', 0.5); V.S(t + 7, 'stamp_2', 0.8); V.S(t + 7, 'riser_2s', 0.5); V.M(t + 7, t + 80, 'heroic', 0, 0.7, 1.0, 0.8); dy(t + 13, 34)
t = V.sc('balls', 10.0, id='NB5', bg='lab', balls=[[K['CH'], 640, 640, 230, 'normal', 'none', None, 'SCIENTIST'], [K['CH'], 1280, 640, 230, 'dead', 'none', None, 'VOLUNTEER']], props=[['helmet-head-shot', 960, 360, 120, '#3bd16f']],
         bubs=[[0.6, 0, 'Put the helmet on.'], [3.0, 0, '20 minutes of real sleep.'], [6.4, 1, '...Zzz... Zzz...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 7, 'crowd_cheer', 0.3); dy(t + 10, 35)
SHIP = [[P(8, 47), P(-95, 40)], [P(8, 47), P(77, 22)], [P(8, 47), P(105, 33)], [P(127, 37), P(110, 30)], [P(139, 36), P(150, -30)], [P(8, 47), P(25, 0)], [P(8, 47), P(-55, -12)], [P(127, 37), P(100, 15)]]
t = map_(14, 'N13', lv=3, cam=[[0, 3840, 2000, 0.3], [14, 3840, 2000, 0.32]], useBar=True, tints=[tint(ks(*GRAY), '#2b2b2e', [[0, 0.5]]), tint(ks('CH', 'KR', 'JP', 'DE', 'US', 'IN', 'CN', 'BR', 'FR', 'GB', 'MX', 'ID'), '#3bd16f', [[3, 0], [10, 0.45]], 0.3)],
         arrows=[[1.0 + i * 0.5, 4.4 + i * 0.5, *a, *b, '#3bd16f', 22] for i, (a, b) in enumerate(SHIP)], counters=[[1.0, 'SLEEP HELMETS BUILT', [[1, 0], [13, 1.2e9]], 'big', '#3bd16f']],
         caps=[[0.6, 5.6, 'Every factory left on Earth builds sleep helmets.', 'sleep helmets'], [7.0, 13.6, 'Switzerland, Korea and Japan ship them everywhere.', 'everywhere']])
[V.SV(t + 1 + i * 0.5, 'whoosh', 0.25) for i in range(len(SHIP))]; dy(t + 14, 42); popk(t + 14, 93)
HEL = [('CH', 100), ('KR', 96), ('JP', 94), ('DE', 90), ('US', 78), ('CN', 71), ('IN', 44), ('NG', 21)]
t = V.sc('rank', 10.0, id='NRK2', title='PEOPLE WITH A SLEEP HELMET · DAY 50', rows=[[K[c], [[0, 0], [7, v]]] for c, v in HEL if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #3bd16f, #c8ffd8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 50)
t = V.sc('news', 14.0, id='NN3', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.5], [10, 0]],
         bubs=[[1.0, 0, 'Day 50. I slept twenty minutes last night.'], [5.0, 0, 'I cried when I woke up.'], [8.6, 0, 'I think we\'re going to make it.']],
         papers=[[6.0, 'THE GLOBE DAILY', 'WE SLEPT'], [10.2, 'WORLD EVENING POST', 'HELMETS FOR ALL']], ticker='DAY 50  •  1.2 BILLION SLEEP HELMETS DELIVERED  •  HALLUCINATIONS FALLING  •  STILL NO CURE  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [6.0, 10.2]]; dy(t + 14, 51)
t = V.sc('balls', 10.0, id='NB6', bg='sky', balls=[[K['NG'], 640, 640, 230, 'normal', 'none', None, None, {'tears': True}], [K['NG'], 1280, 670, 180, 'normal', 'none', None, 'SON']],
         bubs=[[0.6, 1, 'Dad! The helmets finally reached Lagos!'], [4.0, 0, 'Fifty days...'], [6.8, 0, 'Tonight, we sleep.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.5, 'crowd_cheer', 0.3); dy(t + 10, 60)
t = map_(13, 'N14', lv=1, cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], useBar=True, tints=[tint(ks(*GRAY), '#2b2b2e', [[0, 0.5], [12, 0.25]]), tint(ALLK, '#3bd16f', [[0, 0.1], [8, 0.3]], 0)],
         counters=[[0.8, 'HUMANS LOST', [[0.8, 0], [8, 1.1e9]], 'big', '#ff6a5a']], caps=[[0.6, 5.6, 'Day 90. The fog lifts. Cities wake up again.', 'fog lifts'], [6.6, 12.6, 'But 1.1 billion people never saw the cure.', '1.1 billion']])
V.S(t + 0.4, 'birds', 0.4); dy(t + 13, 90); popk(t + 13, 86.6)
FS = [('TOKYO', P(139.7, 35.7)), ('MUMBAI', P(72.9, 19.1)), ('NAIROBI', P(36.8, -1.3)), ('ROME', P(12.5, 41.9)), ('RIO', P(-43.2, -22.9)), ('CHICAGO', P(-87.6, 41.9)), ('SEOUL', P(126.98, 37.56)), ('LIMA', P(-77, -12))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · ASLEEP', '#9fd4ff']], grade='rgba(40,60,160,0.25)', filter='brightness(0.55)') for i, (n, xy) in enumerate(FS)]
t = V.sc('cuts', 0.3 + len(FS) * 0.9 + 0.3, id='N14C', cuts=cuts, texts=[[0.05, 7.8, 'FINALLY... SILENCE', 110, 540, '#9fd4ff', 'rgba(120,160,255,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'whoosh', 0.2) for i in range(len(FS))]; dy(t + 7.8, 92)
t = map_(12, 'N14B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.27]], night=[[0, 0], [5, 0.65]], useBar=True, tints=[tint(ks(*GRAY), '#2b2b2e', [[0, 0.25]])],
         rings=[[5.4 + i * 0.25, *xy, '#9fd4ff', 2] for i, xy in enumerate(RIOT)], caps=[[0.6, 5.0, 'Year 1. At 11 PM, the whole world puts on a helmet.', 'helmet'], [6.6, 11.6, 'And for 20 minutes, Earth goes quiet.', 'quiet']])
V.S(t + 5, 'hum', 0.4); V.M(t, t + 25, 'ambient', 0, 0.6, 1.0, 1.0); dy(t + 12, 365)
t = V.sc('bignum', 6.0, id='NBN3', kf=[[0, 480], [4, 20]], fmt='int', top='MINUTES OF SLEEP PER NIGHT', label=[4.0, '20 MINUTES. FOREVER.', '#9fd4ff'], col='#ffffff', glow='rgba(120,180,255,0.9)', bgc='radial-gradient(ellipse, #0a1a3a, #000 70%)')
V.S(t + 0.1, 'downlifter', 0.5); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 365)
t = V.sc('end', 12.0, id='SEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5) hue-rotate(30deg)', lines=[[0.8, 'HOW LONG WOULD YOU LAST?', 300, 110, 99, '#c8a0ff']], ask=[2.6, 'Your record without sleep? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4)

V.extra['hud'] = dict(top=dict(label='DAY', kf=DY, fmt='int'), bar=dict(label='HUMANITY', kf=POP, sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
