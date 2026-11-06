"""Vídeo 5: What If Humans Only Lived to 30 — la noche en que muere todo adulto, jóvenes al mando, África hereda el mundo."""
from wsim import *
V = Vid('thirty', seed=55)
YR = []; POP = []
def yr(t, y): YR.append([round(t, 2), y])
def popk(t, p): POP.append([round(t, 2), p])
# % de la población con más de 30 años (aprox.) -> pérdida en la noche 0
OVER30 = {'JP': 68, 'IT': 66, 'DE': 64, 'GR': 64, 'PT': 64, 'ES': 63, 'KR': 62, 'FI': 60, 'AT': 61, 'BG': 63, 'FR': 58, 'GB': 57, 'CN': 58, 'RU': 57, 'CA': 57, 'UA': 58, 'PL': 58,
          'US': 55, 'AU': 54, 'SE': 56, 'NO': 55, 'NL': 57, 'CH': 59, 'BE': 57, 'CZ': 59, 'HU': 60, 'RO': 59, 'NZ': 53, 'AR': 46, 'CL': 50, 'BR': 47, 'MX': 44, 'TR': 45, 'IR': 50, 'TH': 56,
          'VN': 50, 'IN': 40, 'ID': 44, 'EG': 34, 'SA': 40, 'PK': 30, 'BD': 38, 'PH': 35, 'CO': 46, 'PE': 44, 'ZA': 38, 'KE': 25, 'ET': 24, 'NG': 22, 'CD': 20, 'NE': 17, 'ML': 19,
          'TD': 19, 'SO': 19, 'AO': 20, 'TZ': 23, 'UG': 19, 'MZ': 21, 'DZ': 42, 'MA': 44, 'SD': 25, 'IQ': 30, 'AF': 22, 'VE': 42, 'KZ': 46, 'MN': 40, 'MG': 24, 'CM': 23, 'GH': 27, 'ZM': 21}
HI = [k for c, v in OVER30.items() if v >= 55 for k in ks(c)]
MID = [k for c, v in OVER30.items() if 40 <= v < 55 for k in ks(c)]
LO = [k for c, v in OVER30.items() if v < 40 for k in ks(c)]
AFR = ks('NG', 'NE', 'CD', 'ET', 'ML', 'TD', 'SO', 'AO', 'TZ', 'UG', 'MZ', 'KE', 'SD', 'CM', 'GH', 'ZM', 'MG', 'EG', 'ZA', 'DZ', 'MA')
DEAD = '#2b2b2e'
def grief(t_on=-100):   # capas de "noche 0" ya asentadas
    return [tint(HI, DEAD, [[t_on, 0], [t_on + 0.01, 0.72]]), tint(MID, DEAD, [[t_on, 0], [t_on + 0.01, 0.5]]), tint(LO, DEAD, [[t_on, 0], [t_on + 0.01, 0.28]])]
def map_(d, id, **kw):
    kw.setdefault('tints', grief()); return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))

# ======================= TRÁILER =======================
t = V.sc('title', 7.0, id='L_A', hard=True, bg='black', texts=[[0.3, 2.6, 'EVERY HUMAN ON EARTH', 90], [2.6, 4.6, 'DIES AT', 120], [4.6, 7.0, '30', 330, 540, '#ff3b30', 'rgba(255,40,40,0.9)', 10]], flash=[4.6])
V.S(t + 0.3, 'monitor_beep', 0.6); V.S(t + 1.3, 'monitor_beep', 0.6); V.S(t + 2.3, 'monitor_beep', 0.6); V.S(t + 3.3, 'monitor_beep', 0.6); V.S(t + 4.6, 'flatline', 0.7); V.S(t + 4.6, 'braam', 0.9)
V.M(t + 4.6, t + 7, 'horror', 10, 0.45, 0.2, 0.3)
t = V.sc('bignum', 5.5, id='L_B', hard=True, kf=[[0, 0], [4.2, 30]], fmt='int', top='YOUR AGE', label=[4.3, 'TIME\'S UP', '#ff3b30'], col='#ffffff', glow='rgba(255,60,60,0.8)', bgc='radial-gradient(ellipse, #3a0606, #000 70%)')
[V.S(t + 0.1 + i * 0.14, 'tick', 0.35) for i in range(30)]; V.S(t + 4.3, 'thit', 0.9); V.S(t + 4.3, 'flatline', 0.5)
CT = [('TOKYO', P(139.7, 35.7), '-68%'), ('ROME', P(12.5, 41.9), '-66%'), ('BERLIN', P(13.4, 52.5), '-64%'), ('NEW YORK', P(-74, 40.7), '-55%'), ('MOSCOW', P(37.6, 55.75), '-57%'), ('BEIJING', P(116.4, 39.9), '-58%'),
      ('SÃO PAULO', P(-46.6, -23.5), '-47%'), ('MUMBAI', P(72.9, 19.1), '-40%'), ('CAIRO', P(31.2, 30), '-34%'), ('LAGOS', P(3.4, 6.5), '-22%'), ('KINSHASA', P(15.3, -4.3), '-20%'), ('NIAMEY', P(2.1, 13.5), '-17%')]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + '  ' + p, '#ff6a5a']], grade='rgba(255,40,40,0.18)', filter='saturate(0.5)') for i, (n, xy, p) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='L_C', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'ONE NIGHT.', 150], [3.6, 7.4, 'HALF OF HUMANITY. GONE.', 92, 540, '#ff6a5a', 'rgba(255,60,60,0.7)']])
V.M(t, t + 7.4, 'frantic', 30, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.SV(t + 0.4 + i * 0.55, 'whoosh', 0.3) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('title', 8.5, id='L_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, tints=grief(), grad='radial-gradient(ellipse at 50% 85%, rgba(255,60,60,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF HUMANS', 250, 140], [0.5, 'ONLY LIVED TO 30?', 410, 130, '#ff6a5a']], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 60, 0.8, 0.05, 1.2)
yr(t + 8.5, 2030); popk(0, 8.2)

# ======================= CAP 1: LA NOCHE CERO =======================
t = V.sc('map', 13, id='L1', chap=[0.0, 2.6, 'CHAPTER 1', 'NIGHT ZERO'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]], tints=[],
         counters=[[3.0, 'HUMANS OVER 30', [[3, 0], [9, 4.3e9]], 'big', '#ff9a8a']], caps=[[3.0, 7.6, 'December 31st, 2029. 11:59 PM.', '11:59'], [8.0, 12.6, 'Nobody knows a new rule is about to begin.', 'new rule']])
V.chap_snd(t); V.M(t, t + 26, 'tension', 0, 0.55, 1.0, 0.5); [V.S(t + 8 + i, 'tick', 0.45) for i in range(5)]; yr(t + 13, 2030)
t = V.sc('map', 13, id='L2', cam=[[0, 3840, 2050, 0.33], [1.0, 3840, 2050, 0.3], [13, 3840, 2050, 0.31]], shake=[[0, 0], [0.6, 14], [2.4, 0]],
         tints=grief(0.6), counters=[[0.8, 'DEAD IN ONE SECOND', [[0.8, 0], [3.5, 4.3e9]], 'big', '#ff3b30']], stamps=[[4.6, '-53%', 960, 470, '#ff3b30', 220, -6]],
         caps=[[5.6, 9.4, 'At midnight, every person over 30 simply... stops.', 'stops'], [9.6, 12.8, 'Old countries turn gray. Young ones barely change.', 'gray']])
V.S(t + 0.6, 'flatline', 0.8); V.S(t + 0.6, 'sub_drop', 0.9); V.S(t + 0.6, 'nuke_far', 0.4); V.S(t + 4.6, 'stamp_3', 0.9); V.S(t + 4.6, 'braam2', 0.6); V.M(t + 4.6, t + 30, 'horror', 0, 0.6, 1.5, 0.8)
yr(t + 13, 2030.0); popk(t + 3.5, 3.9)
t = V.sc('bignum', 6.0, id='L3', kf=[[0, 8.2e9], [4, 3.9e9]], fmt='big', top='PEOPLE ALIVE · JANUARY 1st', label=[4.0, 'THE OLDEST HUMAN ON EARTH IS 29', '#ff6a5a'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 1.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8)
t = V.sc('balls', 10.0, id='LB1', bg='street', balls=[[K['US'], 640, 650, 200, 'scared', 'none', None, 'AGE 12', {'tears': True}], [K['US'], 1280, 640, 230, 'scared', 'none', None, 'AGE 17']],
         bubs=[[0.6, 0, 'Mom? MOM?!'], [3.2, 1, 'It\'s not just your mom.'], [6.2, 1, 'Every adult I know... is gone.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'wind', 0.3); yr(t + 10, 2030.0)
PLANES = [P(-40, 45), P(-30, 30), P(-150, 30), P(-160, 10), P(170, 40), P(60, 10), P(80, -10), P(-20, 0), P(10, 45), P(100, 30), P(-90, 38), P(20, 55)]
t = map_(12, 'L4', cam=[[0, 3840, 2000, 0.28], [12, 3840, 2000, 0.3]], icons=[[0.6 + i * 0.4, *xy, 'commercial-airplane', '#ff6a5a', 52] for i, xy in enumerate(PLANES)],
         rings=[[1.4 + i * 0.4, *xy, '#ff3b30', 2] for i, xy in enumerate(PLANES)], counters=[[0.8, 'PLANES WITH NO PILOT', [[0.8, 0], [7, 9700]], 'int', '#ff6a5a']],
         caps=[[0.6, 5.6, 'Most pilots were over 30.', 'pilots'], [6.6, 11.6, 'Nearly 10,000 planes fall out of the sky.', '10,000']])
[V.SV(t + 1.4 + i * 0.4, 'boom', 0.25) for i in range(len(PLANES))]; V.S(t + 0.6, 'jet', 0.4); yr(t + 12, 2030.0)
PLANTS = [P(-77, 39), P(2.3, 47), P(30.1, 51.4), P(141, 37.4), P(119.4, 34.5), P(77, 13), P(37, 55), P(-46, -23), P(-99, 19.4), P(8, 50)]
t = map_(12, 'L5', cam=[[0, 3840, 1900, 0.3], [12, 3840, 1900, 0.33]], night=[[0, 0], [5, 0.55]], icons=[[0.8 + i * 0.35, *xy, 'radar-dish', '#ffd23f', 44] for i, xy in enumerate(PLANTS)],
         stamps=[[5.2, 'BLACKOUT', 960, 470, '#ffd23f', 150]], caps=[[0.6, 4.8, 'Power plants, hospitals, water pumps: no one at the controls.', 'no one'], [7.0, 11.6, 'By morning, the lights are out.', 'lights']])
V.S(t + 5.2, 'blackout', 0.8); V.S(t + 5.2, 'stamp_3', 0.7); yr(t + 12, 2030.01)
PRIS = [P(-118, 34), P(-87.6, 41.9), P(-46.6, -23.5), P(-99.1, 19.4), P(28.97, 41), P(106.8, -6.2), P(121, 14.6), P(-74, 4.7), P(18.4, -33.9)]
t = map_(12, 'L5B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.55], [12, 0.55]], icons=[[0.8 + i * 0.4, *xy, 'open-gate', '#ff9a5a', 44] for i, xy in enumerate(PRIS)],
         counters=[[1.0, 'PRISONERS WALKING FREE', [[1, 0], [9, 2.9e6]], 'big', '#ff9a5a']], caps=[[0.6, 5.6, 'The guards are gone. The cell doors open.', 'doors open'], [6.6, 11.6, 'Millions of young prisoners walk out.', 'walk out']])
[V.S(t + 0.8 + i * 0.4, 'steel_door', 0.2) for i in range(len(PRIS))]; yr(t + 12, 2030.015)
t = V.sc('news', 14.0, id='LN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 1]],
         bubs=[[1.0, 0, 'I\'m 23. I\'m the oldest person left in this newsroom.'], [5.4, 0, '4.3 billion people died at midnight.'], [9.4, 0, 'If you\'re under 30... stay calm.']],
         papers=[[6.0, 'THE GLOBE DAILY', 'HALF OF US GONE'], [10.2, 'WORLD EVENING POST', 'NO ONE OVER 30']], ticker='BREAKING: EVERY PERSON OVER 30 DIED AT MIDNIGHT  •  CAUSE UNKNOWN  •  YOUNGEST GOVERNMENTS IN HISTORY  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [6.0, 10.2]]; yr(t + 14, 2030.02)
LOST = [(c, OVER30[c]) for c in ['JP', 'IT', 'DE', 'KR', 'ES', 'CN', 'RU', 'US']]
t = V.sc('rank', 10.0, id='LRK1', title='POPULATION LOST IN ONE NIGHT', rows=[[K[c], [[0, 0], [7, v]]] for c, v in LOST if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #ff3b30, #ff9a8a)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2030.02)
YNG = [(c, OVER30[c]) for c in ['NE', 'ML', 'UG', 'CD', 'AO', 'NG', 'ET', 'KE']]
t = V.sc('rank', 10.0, id='LRK2', title='COUNTRIES THAT LOST THE LEAST', rows=[[K[c], [[0, 0], [7, v]]] for c, v in YNG if c in K], fmt='int', unit='%', col='linear-gradient(90deg, #3bd16f, #b8ffcf)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2030.03)

# ======================= CAP 2: LOS NIÑOS AL MANDO =======================
LEAD = [('US', 26), ('CN', 28), ('IN', 24), ('RU', 29), ('GB', 22), ('FR', 27), ('JP', 19), ('BR', 25), ('NG', 29), ('DE', 21)]
t = map_(13, 'L6', chap=[0.0, 2.6, 'CHAPTER 2', 'KIDS IN CHARGE'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]],
         pins=[[3.0 + i * 0.5, *cap(c), f'NEW LEADER: {a}', '#ffd23f'] for i, (c, a) in enumerate(LEAD) if c in K],
         caps=[[3.0, 7.6, 'Every president, king and general is gone.', 'general'], [8.0, 12.6, 'The new leaders are in their twenties.', 'twenties']])
V.chap_snd(t); V.M(t, t + 50, 'drive', 0, 0.7, 0.8, 0.8); [V.S(t + 3 + i * 0.5, 'ding', 0.25) for i in range(len(LEAD))]; yr(t + 13, 2030.05)
t = V.sc('call', 13.0, id='LC1', ks=ks('US', 'CN', 'IN', 'NG'), banner='THE YOUNGEST SUMMIT EVER', eyes=['shades', 'scared', 'normal', 'smug'], labels=['AGE 26', 'AGE 28', 'AGE 24', 'AGE 29'],
         bubs=[[1.0, 0, 'I\'m 26 and I have the nuclear codes.'], [4.0, 1, 'Does anyone know how to run a country?'], [7.2, 2, 'We\'ll learn as we go.'], [9.8, 3, 'Africa has the most people now.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 13, 2030.1)
t = V.sc('balls', 10.0, id='LB2', bg='office', balls=[[K['FR'], 620, 650, 220, 'scared', 'judge', None, 'JUDGE, 19'], [K['FR'], 1300, 650, 210, 'smug', 'tie', None, 'CEO, 16']],
         bubs=[[0.6, 0, 'I\'m 19. Apparently I\'m a judge now.'], [4.0, 1, 'I run a bank.'], [6.8, 1, 'I don\'t know what a bank does.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2030.15)
LABS = [P(-71.1, 42.4), P(-122.2, 37.4), P(-0.1, 51.5), P(8.5, 47.4), P(139.7, 35.7), P(116.4, 39.9), P(77.6, 13), P(34.8, 32.1), P(-46.6, -23.5), P(37.6, 55.75)]
t = map_(12, 'L7B', cam=[[0, 3840, 1900, 0.3], [12, 3840, 1900, 0.32]], icons=[[0.8 + i * 0.35, *xy, 'magnifying-glass', '#9fd4ff', 44] for i, xy in enumerate(LABS)],
         counters=[[1.0, 'TOP SCIENTISTS LEFT', [[1, 100], [8, 4]], 'int', '#9fd4ff']], stamps=[[8.6, '4% REMAIN', 960, 480, '#ff3b30', 120]],
         caps=[[0.6, 5.6, 'The world wants answers: why 30?', 'why 30'], [6.6, 11.6, 'But almost every top scientist was over 30.', 'over 30']])
[V.S(t + 0.8 + i * 0.35, 'beep_hi', 0.15) for i in range(len(LABS))]; V.S(t + 8.6, 'stamp_3', 0.7); yr(t + 12, 2030.2)
RIOT = [P(-74, 40.7), P(-118, 34), P(2.35, 48.85), P(-0.1, 51.5), P(-46.6, -23.5), P(-99.1, 19.4), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(28.97, 41), P(-58.4, -34.6), P(31.2, 30)]
t = map_(12, 'L7', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], rings=[[0.6 + i * 0.4, *xy, '#ff3b30', 3] for i, xy in enumerate(RIOT)], parts=['ember', 50],
         counters=[[0.8, 'CITIES IN CHAOS', [[0.8, 0], [10, 3120]], 'int', '#ff6a5a']], stamps=[[6.0, 'LOOTING', 960, 480, '#ff3b30', 140]],
         caps=[[0.6, 5.4, 'With no police chiefs and no parents, cities explode.', 'explode'], [7.4, 11.6, 'Gangs of teenagers take the streets.', 'teenagers']])
V.S(t + 6.0, 'stamp_3', 0.8); V.S(t + 0.6, 'siren', 0.4); V.S(t + 2, 'crowd', 0.4); [V.SV(t + 2 + i * 0.7, 'gun', 0.2) for i in range(8)]; yr(t + 12, 2030.3); popk(t + 12, 3.7)
t = map_(12, 'L8', cam=[[0, *P(20, 10), 0.75], [12, *P(20, 8), 0.8]], useBar=True, counters=[[0.8, 'FARMS ABANDONED', [[0.8, 0], [10, 0.62]], 'pct', '#ffd23f']],
         icons=[[1.0 + i * 0.4, *xy, 'skull-crossed-bones', '#ffd23f', 40] for i, xy in enumerate([P(30, 50), P(-95, 40), P(110, 35), P(78, 22), P(-50, -15), P(10, 48)])],
         caps=[[0.6, 5.6, 'The farmers were old. The harvest rots in the fields.', 'rots'], [6.6, 11.6, 'The first winter brings famine.', 'famine']])
V.S(t + 0.4, 'wind', 0.4); V.S(t + 6.6, 'sub_drop', 0.6); yr(t + 12, 2030.9); popk(t + 12, 3.4)
t = V.sc('balls', 10.0, id='LB3', bg='lab', balls=[[K['IN'], 620, 650, 220, 'scared', 'none', None, 'SURGEON, 14', {'sweat': True}], [K['IN'], 1300, 660, 200, 'scared', 'none', None, 'PATIENT']],
         bubs=[[0.6, 1, 'Have you done this before?'], [3.4, 0, 'I watched a video.'], [6.6, 0, 'Twice.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'beep_hi', 0.4); yr(t + 10, 2031)
t = map_(13, 'L9', cam=[[0, *P(20, 5), 0.6], [13, *P(20, 3), 0.66]], useBar=True, tints=grief() + [tint(AFR, '#ffd23f', [[0.8, 0], [3, 0.5]], 0.08, stroke='#ffffff')],
         counters=[[1.0, 'SHARE OF HUMANITY IN AFRICA', [[1, 0.18], [9, 0.39]], 'pct', '#ffd23f']], stamps=[[7.0, 'THE NEW CENTER OF THE WORLD', 960, 470, '#ffd23f', 76]],
         caps=[[0.6, 6.4, 'Africa lost the fewest people.', 'fewest'], [8.4, 12.6, 'Overnight, it holds almost 40% of humanity.', '40%']])
V.S(t + 7.0, 'stamp_2', 0.7); V.S(t + 7.0, 'braam3', 0.5); yr(t + 13, 2031.5)
t = V.sc('balls', 10.0, id='LB3B', bg='office', balls=[[K['KE'], 960, 620, 240, 'normal', 'tie', None, 'TEACHER, 17'], [K['KE'], 500, 700, 160, 'normal', 'none', None, 'AGE 8'], [K['KE'], 1420, 700, 160, 'scared', 'none', None, 'AGE 9']],
         bubs=[[0.6, 0, 'Today: how to grow food.'], [3.6, 2, 'What about math?'], [6.6, 0, 'Math is next year. If we eat.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2031.7)
t = V.sc('balls', 10.0, id='LB4', bg='sky', balls=[[K['NG'], 640, 640, 250, 'smug', 'none', None, None], [K['JP'], 1300, 660, 200, 'scared', 'none', None, None]],
         bubs=[[0.6, 1, 'We have no one to run our factories.'], [4.0, 0, 'We have 200 million people.'], [7.0, 0, 'Need some help?']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2032)

# ======================= CAP 3: LA VIDA CON CUENTA ATRÁS =======================
t = V.sc('title', 12.0, id='L10', bg='black', chap=[0.0, 2.6, 'CHAPTER 3', 'LIFE ON A TIMER'],
         texts=[[2.8, 5.0, 'AGE 10 — FIRST JOB', 90, 540, '#ffffff'], [5.0, 7.0, 'AGE 16 — PARENT', 90, 540, '#ffd23f'], [7.0, 9.4, 'AGE 24 — GRANDPARENT', 90, 540, '#ffb060'], [9.4, 12.0, 'AGE 30 — GONE', 110, 540, '#ff3b30', 'rgba(255,40,40,0.7)']])
V.chap_snd(t); [V.S(t + x, 'thit', 0.6) for x in [2.8, 5.0, 7.0]]; V.S(t + 9.4, 'flatline', 0.5); V.M(t, t + 60, 'nocturne', 0, 0.65, 1.0, 0.8); yr(t + 12, 2033)
t = V.sc('bignum', 6.0, id='LBN1', kf=[[0, 18], [3.5, 12]], fmt='int', top='SCHOOL NOW ENDS AT AGE', label=[3.6, 'THERE IS NO TIME TO WASTE', '#ffd23f'], col='#ffffff', glow='rgba(255,210,60,0.7)', bgc='radial-gradient(ellipse, #3a2a06, #000 70%)')
V.S(t + 0.1, 'whoosh_6', 0.5); V.S(t + 3.6, 'thit', 0.8); yr(t + 6, 2034)
t = map_(13, 'L11', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], useBar=True, tints=grief() + [tint(ks('NG', 'IN', 'ID', 'BR', 'PK', 'ET', 'CD', 'MX', 'EG', 'PH'), '#3bd16f', [[1, 0], [6, 0.4]], 0.15)],
         counters=[[1.0, 'BABIES BORN PER DAY', [[1, 160000], [11, 610000]], 'int', '#3bd16f']], caps=[[0.6, 5.6, 'Couples marry at 15 and have kids at 16.', 'kids at 16'], [6.6, 12.6, 'The biggest baby boom in history.', 'baby boom']])
V.S(t + 1, 'riser_4s', 0.4); yr(t + 13, 2036); popk(t + 13, 3.9)
TECH = [P(-122.2, 37.4), P(-71.1, 42.4), P(-0.1, 51.5), P(2.35, 48.85), P(139.7, 35.7), P(116.4, 39.9), P(13.4, 52.5), P(126.98, 37.56)]
t = map_(13, 'L12', cam=[[0, 3840, 1900, 0.3], [13, 3840, 1900, 0.32]], useBar=True, icons=[[0.8 + i * 0.4, *xy, 'laptop', '#9fd4ff', 44] for i, xy in enumerate(TECH)],
         counters=[[1.0, 'EXPERT KNOWLEDGE LOST', [[1, 0], [9, 0.71]], 'pct', '#9fd4ff']], stamps=[[9.4, 'NO ONE KNOWS HOW', 960, 470, '#ff3b30', 100]],
         caps=[[0.6, 5.6, 'It takes 20 years to master a hard skill.', '20 years'], [6.0, 9.2, 'Now you only get 15 before you die.', '15']])
[V.S(t + 0.8 + i * 0.4, 'beep_lo', 0.2) for i in range(8)]; V.S(t + 9.4, 'stamp_3', 0.7); yr(t + 13, 2038)
AV = [('TOKYO', P(139.7, 35.7), 17), ('NEW YORK', P(-74, 40.7), 15), ('PARIS', P(2.35, 48.85), 16), ('MEXICO CITY', P(-99.1, 19.4), 14), ('CAIRO', P(31.2, 30), 13), ('MUMBAI', P(72.9, 19.1), 14), ('LAGOS', P(3.4, 6.5), 12), ('KINSHASA', P(15.3, -4.3), 11)]
cuts = [dict(t0=0.3 + i * 0.85, t1=0.3 + (i + 1) * 0.85, cam=[*xy, 2.2], T=0, tints=grief(), pins=[[0, *xy, f'{n} · AVG AGE {a}', '#ffd23f']], grade='rgba(255,210,60,0.12)') for i, (n, xy, a) in enumerate(AV)]
t = V.sc('cuts', 0.3 + len(AV) * 0.85 + 0.3, id='L11B', cuts=cuts, texts=[[0.05, 7.4, 'CITIES OF CHILDREN', 110, 540, '#ffd23f', 'rgba(255,210,60,0.6)']])
[V.SV(t + 0.3 + i * 0.85, 'whoosh', 0.3) for i in range(len(AV))]; yr(t + 7.4, 2038.5)
t = V.sc('balls', 10.0, id='LB5', bg='lab', balls=[[K['DE'], 620, 650, 220, 'normal', 'none', None, 'ENGINEER, 29'], [K['DE'], 1300, 670, 180, 'scared', 'none', None, 'APPRENTICE, 11']],
         bubs=[[0.6, 0, 'You have 4 months to learn everything I know.'], [4.4, 1, 'And then?'], [7.0, 0, 'Then you teach the next one.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2039)
WARA = [[P(37, 50), P(31, 49)], [P(77, 30), P(72, 33)], [P(117, 30), P(121, 24)], [P(44, 33), P(52, 32)], [P(29, 1), P(25, -3)], [P(-66, 7), P(-74, 4)]]
t = map_(14, 'L13', cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], war=True, useBar=True,
         arrows=[[2.0 + i * 0.6, 5.4 + i * 0.6, *a, *b, '#ff3b30', 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'WARS OF THE YOUNG', '#c3100a']],
         caps=[[3.6, 8.6, 'Young generals. No memory of past wars.', 'No memory'], [9.0, 13.6, 'Old borders get tested everywhere.', 'tested']])
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 60, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.SV(tt, 'boom', 0.3)
V.S(t + 0.4, 'braam2', 0.6); V.M(t, t + 14.4, 'frantic', 10, 0.8, 0.4, 0.6); yr(t + 14, 2041); popk(t + 14, 3.6)
t = V.sc('news', 14.0, id='LN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.4], [10, 0.8]],
         bubs=[[1.0, 0, 'Ten years since Night Zero.'], [4.4, 0, 'Not one human has lived past 30.'], [8.4, 0, 'Scientists say the rule is permanent.']],
         papers=[[5.4, 'THE GLOBE DAILY', '10 YEARS LATER'], [9.6, 'WORLD EVENING POST', 'NO CURE']], ticker='10 YEARS SINCE NIGHT ZERO  •  AVERAGE AGE ON EARTH: 14  •  LAGOS IS NOW THE LARGEST CITY ON EARTH  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.4, 9.6]]; yr(t + 14, 2041.2)
BIG = [('IN', 610), ('NG', 330), ('CN', 290), ('PK', 210), ('ID', 190), ('CD', 160), ('ET', 150), ('US', 120)]
t = V.sc('rank', 10.0, id='LRK3', title='LARGEST POPULATIONS · 2040 (MILLIONS)', rows=[[K[c], [[0, v * 0.4], [8, v]]] for c, v in BIG if c in K], fmt='int', unit='M', col='linear-gradient(90deg, #ffd23f, #fff0b0)')
V.S(t + 0.2, 'whoosh_6', 0.5); yr(t + 10, 2041.5)

# ======================= CAP 4: EL NUEVO MUNDO =======================
GRAYC = ks('JP', 'IT', 'DE', 'KR', 'GR', 'PT', 'BG', 'FI')
t = map_(13, 'L14', chap=[0.0, 2.6, 'CHAPTER 4', 'THE NEW WORLD'], cam=[[0, *P(60, 45), 0.6], [13, *P(60, 45), 0.65]], useBar=True, tints=grief() + [tint(GRAYC, '#8a8f96', [[3, 0], [6, 0.8]], 0.2)],
         pins=[[3.4, *P(139.7, 35.7), 'TOKYO: 12% LEFT', '#c9cdd3'], [4.2, *P(12.5, 41.9), 'ROME: 15% LEFT', '#c9cdd3'], [5.0, *P(13.4, 52.5), 'BERLIN: 18% LEFT', '#c9cdd3']],
         caps=[[3.0, 7.6, 'Old nations never recover.', 'never recover'], [8.0, 12.6, 'Japan and Italy are mostly empty cities.', 'empty']])
V.chap_snd(t); V.M(t, t + 60, 'saga', 0, 0.7, 1.0, 0.8); [V.S(t + x, 'ding', 0.25) for x in [3.4, 4.2, 5.0]]; yr(t + 13, 2045)
MIG = [[P(10, 50), P(8, 10)], [P(2, 46), P(3, 14)], [P(-3, 40), P(-5, 15)], [P(13, 42), P(20, 5)], [P(-100, 40), P(-80, 8)], [P(105, 30), P(80, 22)]]
t = map_(13, 'L13B', cam=[[0, *P(15, 30), 0.55], [13, *P(15, 28), 0.6]], useBar=True, arrows=[[1.0 + i * 0.5, 4.6 + i * 0.5, *a, *b, '#ffd23f', 24] for i, (a, b) in enumerate(MIG)],
         counters=[[1.0, 'MOVING SOUTH FOR WORK', [[1, 0], [11, 1.6e8]], 'big', '#ffd23f']], caps=[[0.6, 5.6, 'For the first time, Europeans migrate to Africa.', 'Africa'], [6.6, 12.6, 'That\'s where the jobs and the people are.', 'jobs']])
[V.SV(t + 1 + i * 0.5, 'whoosh', 0.3) for i in range(len(MIG))]; yr(t + 13, 2047)
MEGA = [('LAGOS', P(3.4, 6.5)), ('KINSHASA', P(15.3, -4.3)), ('DHAKA', P(90.4, 23.8)), ('KARACHI', P(67, 24.9)), ('ADDIS ABABA', P(38.7, 9)), ('MUMBAI', P(72.9, 19.1))]
t = map_(13, 'L15', cam=[[0, *P(40, 12), 0.7], [13, *P(42, 12), 0.75]], useBar=True, tints=grief() + [tint(AFR, '#ffd23f', [[-10, 0.35], [0, 0.35]])],
         pins=[[1.0 + i * 0.6, *xy, n, '#ffd23f'] for i, (n, xy) in enumerate(MEGA)], rings=[[1.0, *P(3.4, 6.5), '#ffd23f', 4]],
         caps=[[0.6, 5.6, 'The new megacities are young and huge.', 'young'], [6.6, 12.6, 'Lagos becomes the capital of the world economy.', 'Lagos']])
[V.S(t + 1 + i * 0.6, 'ding', 0.25) for i in range(len(MEGA))]; yr(t + 13, 2050); popk(t + 13, 4.6)
t = V.sc('balls', 11.0, id='LB6', bg='night', balls=[[K['BR'], 960, 640, 260, 'normal', 'none', None, 'TURNING 29', {'tears': True}], [K['BR'], 520, 680, 180, 'normal', 'none', None, 'SON, 13'], [K['BR'], 1400, 680, 170, 'normal', 'none', None, 'DAUGHTER, 11']],
         parts=['dust', 30], bubs=[[0.6, 1, 'Happy last birthday, Dad.'], [4.0, 0, 'One more year with you two.'], [7.6, 0, 'Let\'s not waste a single day.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t, 'crowd_cheer', 0.2); yr(t + 11, 2052)
t = V.sc('balls', 10.0, id='LB6B', bg='sky', balls=[[K['IN'], 700, 640, 230, 'smug', 'none', None, 'GRANDMA, 24'], [K['IN'], 1250, 700, 140, 'normal', 'none', None, 'GRANDSON']],
         bubs=[[0.6, 0, 'When I was your age...'], [3.4, 1, 'Grandma, that was 8 years ago.'], [6.6, 0, 'Exactly. Ancient times.']])
V.talk(t, V.SC[-1][3]['bubs']); yr(t + 10, 2052.5)
t = V.sc('bignum', 6.0, id='LBN2', kf=[[0, 31], [3.5, 14]], fmt='int', top='AVERAGE AGE ON EARTH', label=[3.6, 'A PLANET OF TEENAGERS', '#ffd23f'], col='#ffffff', glow='rgba(255,210,60,0.7)', bgc='radial-gradient(ellipse, #3a2a06, #000 70%)')
V.S(t + 0.1, 'whoosh_6', 0.5); V.S(t + 3.6, 'thit', 0.8); yr(t + 6, 2055)
ROCK = [P(-80.6, 28.5), P(100.3, 41.1), P(63.3, 45.9), P(8.4, 9.1), P(77.2, 13.7)]
t = map_(13, 'L16', cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], useBar=True, tints=grief(),
         icons=[[0.8 + i * 0.5, *xy, 'incoming-rocket', '#ffffff', 50] for i, xy in enumerate(ROCK)], counters=[[1.0, 'HUMANS', [[1, 4.6e9], [11, 6.1e9]], 'big', '#3bd16f']],
         caps=[[0.6, 5.6, '2060. Humanity is back to 6 billion people.', '6 billion'], [6.6, 12.6, 'Rockets fly again... built by teenagers.', 'teenagers']])
[V.S(t + 0.8 + i * 0.5, 'launch', 0.3) for i in range(len(ROCK))]; yr(t + 13, 2060); popk(t + 13, 6.1)
t = V.sc('call', 12.0, id='LC2', ks=ks('NG', 'IN', 'CN', 'US'), banner='WORLD COUNCIL · 2060', eyes=['smug', 'normal', 'normal', 'scared'], labels=['AGE 27', 'AGE 25', 'AGE 29', 'AGE 22'],
         bubs=[[1.0, 0, 'Nigeria now leads the council.'], [4.0, 1, 'India builds half the world\'s goods.'], [7.0, 3, 'We used to run things...']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); yr(t + 12, 2061)
t = map_(12, 'L16B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], night=[[0, 0.6], [12, 0.6]], parts=['ember', 70],
         rings=[[0.6 + i * 0.25, *cap(c), '#ffd23f', 2] for i, c in enumerate(['US', 'BR', 'NG', 'IN', 'CN', 'RU', 'FR', 'EG', 'ID', 'MX', 'JP', 'AU', 'ZA', 'AR', 'TR', 'PK']) if c in K],
         banners=[[0.4, 4.0, 'THE DAY OF FAREWELLS', '#b07a10']], caps=[[4.4, 8.0, 'Every year, the world says goodbye to those turning 30.', 'goodbye'], [8.4, 11.8, 'A global holiday of fireworks and tears.', 'fireworks']])
[V.S(t + 0.6 + i * 0.5, 'boom_small', 0.2) for i in range(16)]; V.S(t, 'crowd_cheer', 0.3); yr(t + 12, 2063)
t = map_(14, 'L17', cam=[[0, 3840, 2050, 0.3], [14, 3840, 2050, 0.27]], useBar=True, tints=grief() + [tint(AFR + ks('IN', 'PK', 'BD', 'ID'), '#ffd23f', [[0.5, 0], [4, 0.5]], 0.06)],
         stamps=[[6.0, 'A YOUNGER WORLD', 960, 460, '#ffd23f', 120, 0]], caps=[[0.6, 5.6, 'A world where nobody grows old.', 'grows old'], [8.0, 13.6, 'Faster. Younger. And always in a hurry.', 'hurry']])
V.S(t + 6.0, 'stamp_2', 0.7); V.S(t + 6.0, 'braam3', 0.4); yr(t + 14, 2065)
t = V.sc('end', 12.0, id='LEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], tints=grief(), filter='brightness(0.6)', lines=[[0.8, 'WHAT WOULD YOU DO BEFORE 30?', 300, 96, 99, '#ffd23f']], ask=[2.6, 'Tell us in the comments 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4); V.M(t, t + 12, 'triumph', 0, 0.6, 0.5, 2.0)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='YEAR', kf=YR, fmt='yr'), bar=dict(label='HUMANITY', kf=[[a, b / 8.2 * 100] for a, b in POP], sub='big', total=8.2e9, unit='PEOPLE'))
V.export()
