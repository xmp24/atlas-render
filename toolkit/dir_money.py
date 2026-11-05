"""Vídeo 8: What If Money Disappeared Tomorrow — el dinero se esfuma; trueque, comida como poder, nuevo orden."""
from wsim import *
V = Vid('money', seed=88)
DY = []; EC = []
def dy(t, d): DY.append([round(t, 2), d])
def eck(t, p): EC.append([round(t, 2), p])
ALLK = sorted(set(K.values()))
GOLD = '#ffd23f'; GRN = '#3bd16f'
FOOD = ks('US', 'BR', 'AR', 'RU', 'UA', 'CA', 'AU', 'FR', 'KZ', 'IN', 'TH', 'VN', 'NZ', 'UY', 'PY')        # graneros del mundo
FIN = ks('CH', 'SG', 'LU', 'GB', 'HK', 'AE', 'QA', 'BH', 'MT', 'CY', 'IE', 'NL', 'JP', 'KR')            # dependen del dinero / importan comida
def map_(d, id, **kw):
    kw.setdefault('useBar', True); return V.sc('map', d, id=id, **kw)
WAR = dict(fx=[], ext=dict(missiles=[], crater=[], smoke=[]))
CITIES = [P(-74, 40.7), P(-0.1, 51.5), P(139.7, 35.7), P(2.35, 48.85), P(-46.6, -23.5), P(72.9, 19.1), P(121.5, 31.2), P(37.6, 55.75), P(-99.1, 19.4), P(28.97, 41), P(31.2, 30), P(3.4, 6.5), P(151.2, -33.9), P(-118.2, 34)]

# ======================= TRÁILER =======================
t = V.sc('bignum', 6.5, id='M_A', hard=True, kf=[[0, 48210], [0.8, 48210], [4.2, 0]], fmt='int', top='YOUR BANK ACCOUNT ($)', label=[4.3, 'GONE. FOR EVERYONE.', '#ff3b30'], col='#ffffff', glow='rgba(255,210,60,0.8)', bgc='radial-gradient(ellipse, #2a2206, #000 70%)')
[V.S(t + 0.8 + i * 0.12, 'tick', 0.35) for i in range(28)]; V.S(t + 4.3, 'thit', 0.9); V.S(t + 4.3, 'braam', 0.8); V.M(t + 4.3, t + 6.5, 'horror', 0, 0.45, 0.2, 0.3)
CT = [('NEW YORK', P(-74, 40.7)), ('LONDON', P(-0.1, 51.5)), ('ZURICH', P(8.5, 47.4)), ('TOKYO', P(139.7, 35.7)), ('DUBAI', P(55.3, 25.2)), ('SHANGHAI', P(121.5, 31.2)), ('MUMBAI', P(72.9, 19.1)),
      ('LAGOS', P(3.4, 6.5)), ('SÃO PAULO', P(-46.6, -23.5)), ('SINGAPORE', P(103.8, 1.35)), ('FRANKFURT', P(8.7, 50.1)), ('HONG KONG', P(114.2, 22.3))]
cuts = [dict(t0=0.4 + i * 0.55, t1=0.4 + (i + 1) * 0.55, cam=[*xy, 2.2], T=0, pins=[[0, *xy, n + ' · ATM ERROR', '#ff6a5a']], grade='rgba(255,200,40,0.15)', filter='saturate(0.6)') for i, (n, xy) in enumerate(CT)]
t = V.sc('cuts', 0.4 + len(CT) * 0.55 + 0.4, id='M_B', hard=True, cuts=cuts, texts=[[0.05, 3.6, 'NO CASH. NO CARDS.', 120], [3.6, 7.4, 'NO MONEY. ANYWHERE.', 120, 540, GOLD, 'rgba(255,210,60,0.7)']])
V.M(t, t + 7.4, 'frantic', 90, 0.7, 0.05, 0.3); V.S(t + 0.05, 'thit', 0.8); [V.S(t + 0.4 + i * 0.55, 'beep_lo', 0.35) for i in range(len(CT))]; V.S(t + 3.6, 'braam2', 0.8)
t = V.sc('title', 6.0, id='M_C', hard=True, bg='black', texts=[[0.2, 2.0, '$400 TRILLION', 150, 520, GOLD, 'rgba(255,210,60,0.8)', 6], [2.0, 4.0, 'ERASED', 220, 540, '#ff3b30', 'rgba(255,40,40,0.8)', 20], [4.0, 6.0, 'IN ONE SECOND', 90, 540]], flash=[2.0])
V.S(t + 0.2, 'whoosh_6', 0.6); V.S(t + 2.0, 'thit', 0.9); V.S(t + 2.0, 'glitch', 0.6); V.S(t + 4.0, 'heartbeat', 0.7)
t = V.sc('title', 8.5, id='M_D', hard=True, cam=[[0, 3840, 2150, 0.29], [8.5, 3840, 2150, 0.31]], Tmap=0, blur=2, filter='saturate(0.7) sepia(0.3)', grad='radial-gradient(ellipse at 50% 85%, rgba(255,210,60,0.35), rgba(0,0,0,0) 60%)',
         big=[[0.3, 'WHAT IF MONEY', 250, 150], [0.5, 'DISAPPEARED TOMORROW?', 410, 116, GOLD]], sub=[1.4, 'A HYPOTHETICAL SIMULATION'], flash=[0.25], dur=8.5)
V.S(t + 0.25, 'braam', 1.0); V.S(t + 0.3, 'thit', 0.9); V.M(t + 0.2, t + 8.6, 'epic', 30, 0.8, 0.05, 1.2); dy(t + 8.5, 0); eck(0, 100)

# ======================= CAP 1: EL DÍA CERO =======================
t = map_(13, 'M1', chap=[0.0, 2.6, 'CHAPTER 1', 'DAY ZERO'], cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.33]], night=[[0, 0.5], [13, 0.5]],
         counters=[[3.0, 'MONEY ON EARTH ($)', [[3, 4.0e14], [8.5, 4.0e14], [9, 0]], 'big', GOLD]], caps=[[3.0, 8.0, 'Midnight. Every dollar, euro and yen... vanishes.', 'vanishes'], [9.2, 12.6, 'Cash. Bank accounts. Even crypto.', 'Even crypto']])
V.chap_snd(t); V.S(t + 9, 'glitch', 0.8); V.S(t + 9, 'sub_drop', 0.8); V.M(t, t + 40, 'tension', 0, 0.6, 1.0, 0.8); dy(t + 13, 0); eck(t + 8.9, 100); eck(t + 9.3, 0)
t = V.sc('balls', 9.0, id='MB1', bg='street', balls=[[K['US'], 640, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['US'], 1280, 640, 220, 'angry', 'none', None, 'CASHIER']], props=[['laptop', 960, 420, 110, '#ff6a5a']],
         bubs=[[0.6, 0, 'My card says... zero?'], [3.4, 1, 'Everyone\'s card says zero.'], [6.2, 0, 'Then how do I buy milk?!']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.3, 'beep_lo', 0.5); dy(t + 9, 0.3)
Q = [('NEW YORK', P(-74, 40.7)), ('PARIS', P(2.35, 48.85)), ('MUMBAI', P(72.9, 19.1)), ('MEXICO CITY', P(-99.1, 19.4)), ('LAGOS', P(3.4, 6.5)), ('SEOUL', P(126.98, 37.56)), ('MADRID', P(-3.7, 40.4)), ('SYDNEY', P(151.2, -33.9))]
cuts = [dict(t0=0.3 + i * 0.9, t1=0.3 + (i + 1) * 0.9, cam=[*xy, 2.0], T=0, pins=[[0, *xy, n + ' · BANK QUEUE: 2 KM', '#ff6a5a']], grade='rgba(255,200,40,0.12)') for i, (n, xy) in enumerate(Q)]
t = V.sc('cuts', 0.3 + len(Q) * 0.9 + 0.3, id='M1B', cuts=cuts, texts=[[0.05, 7.8, 'DAY 1 · 8:00 AM', 110, 540, GOLD, 'rgba(255,210,60,0.6)']])
[V.SV(t + 0.3 + i * 0.9, 'whoosh', 0.25) for i in range(len(Q))]; V.S(t, 'crowd', 0.4); dy(t + 7.8, 0.35)
t = map_(12, 'M2', cam=[[0, 3840, 2000, 0.3], [12, 3840, 2000, 0.32]], rings=[[0.6 + i * 0.3, *xy, '#ff3b30', 3] for i, xy in enumerate(CITIES)],
         counters=[[0.8, 'SHOPS CLOSED', [[0.8, 0], [9, 0.94]], 'pct', '#ff6a5a']], stamps=[[7.4, 'CLOSED', 960, 470, '#ff3b30', 160]],
         caps=[[0.6, 5.6, 'Morning. Shops can\'t sell. Workers can\'t be paid.', 'can\'t'], [8.4, 11.6, 'So nobody goes to work.', 'nobody']])
[V.S(t + 0.6 + i * 0.3, 'steel_door', 0.15) for i in range(len(CITIES))]; V.S(t + 7.4, 'stamp_3', 0.8); dy(t + 12, 1)
t = V.sc('news', 14.0, id='MN1', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.4], [10, 1]],
         bubs=[[1.0, 0, 'Breaking news. Money... no longer exists.'], [5.0, 0, 'Banks, stock markets, wallets: all zero.'], [9.0, 0, 'Am I even being paid for this?']],
         papers=[[6.0, 'THE GLOBE DAILY', 'MONEY: GONE'], [10.2, 'WORLD EVENING POST', '$0.00']], ticker='BREAKING: ALL MONEY ON EARTH HAS VANISHED  •  STOCK MARKETS CLOSED  •  BANKS CLOSED  •  STAY CALM  •  ')
V.S(t, 'news_sting', 0.7); V.talk(t, V.SC[-1][3]['bubs']); V.M(t, t + 14, 'newsroom', 0, 0.55, 0.3, 0.6); [V.S(t + x + 0.55, 'stamp_1', 0.6) for x in [6.0, 10.2]]; dy(t + 14, 1.5)
t = map_(12, 'M3', cam=[[0, *P(-75, 40.7), 2.0], [6, *P(-74, 40.7), 2.3], [6.3, *P(-0.1, 51.5), 2.0], [12, *P(-0.1, 51.5), 2.3]], rings=[[1, *P(-74, 40.7), '#ff3b30', 4], [7, *P(-0.1, 51.5), '#ff3b30', 4]],
         pins=[[1.0, *P(-74, 40.7), 'WALL STREET: SILENT', '#ff6a5a'], [7.0, *P(-0.1, 51.5), 'THE CITY: SILENT', '#ff6a5a']], caps=[[0.6, 5.6, 'The richest men on Earth now own... their houses.', 'houses'], [6.6, 11.6, 'And whatever is inside them.', 'inside']])
V.S(t + 6.3, 'whoosh_6', 0.5); dy(t + 12, 2)
t = map_(12, 'M3B', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[tint(ALLK, GRN, [[1, 0], [4, 0.25]], 0)],
         counters=[[0.8, 'DEBT ERASED ($)', [[0.8, 0], [7, 3.1e14]], 'big', GRN]], stamps=[[7.4, 'YOU OWE NOTHING', 960, 470, GRN, 120]],
         caps=[[0.6, 5.6, 'The good news: debts vanish too.', 'debts'], [8.4, 11.6, 'Mortgages. Student loans. Even national debts.', 'national']])
V.S(t + 7.4, 'stamp_2', 0.8); V.S(t + 7.4, 'crowd_cheer', 0.3); dy(t + 12, 2.2)
t = V.sc('balls', 10.0, id='MB2', bg='office', balls=[[K['US'], 700, 640, 240, 'scared', 'tie', None, 'BILLIONAIRE', {'tears': True}], [K['MX'], 1300, 640, 220, 'smug', 'none', None, 'GARDENER']],
         bubs=[[0.6, 0, 'I was worth 90 billion yesterday!'], [4.0, 1, 'I have tomatoes.'], [6.8, 0, '...Can I have a tomato?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 2.5)
t = V.sc('call', 13.0, id='MC1', ks=ks('US', 'CN', 'DE', 'JP'), banner='EMERGENCY SUMMIT · DAY 3', eyes=['scared', 'angry', 'scared', 'scared'],
         bubs=[[1.0, 0, 'We print new money. Today.'], [3.8, 1, 'Based on what? Nobody trusts paper now.'], [7.0, 2, 'Who gets how much?'], [9.6, 3, '...Nobody can agree.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); dy(t + 13, 3)

# ======================= CAP 2: EL TRUEQUE =======================
TR = [('EGGS', P(-95, 40)), ('RICE', P(105, 25)), ('CIGARETTES', P(37, 55)), ('FUEL', P(46, 26)), ('MEDICINE', P(10, 50)), ('BATTERIES', P(139, 36)), ('WATER', P(30, 15)), ('BREAD', P(-60, -30))]
t = map_(13, 'M4', chap=[0.0, 2.6, 'CHAPTER 2', 'BARTER'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], pins=[[3.0 + i * 0.6, *xy, n, GOLD] for i, (n, xy) in enumerate(TR)],
         caps=[[3.0, 7.6, 'Week 1. People trade whatever they have.', 'trade'], [8.0, 12.6, 'Eggs. Rice. Cigarettes. Fuel.', 'Eggs']])
V.chap_snd(t); V.M(t, t + 52, 'chip', 0, 0.6, 1.0, 0.8); [V.S(t + 3 + i * 0.6, 'ding', 0.25) for i in range(len(TR))]; dy(t + 13, 7)
t = V.sc('balls', 10.0, id='MB3', bg='street', balls=[[K['FR'], 640, 640, 230, 'normal', 'none', None, 'BAKER'], [K['FR'], 1280, 640, 230, 'smug', 'none', None, 'PLUMBER']],
         bubs=[[0.6, 0, 'One baguette... for what?'], [3.4, 1, 'I fix your sink.'], [6.4, 0, 'Deal. Two baguettes if it\'s fast.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 8)
t = V.sc('balls', 10.0, id='MB3B', bg='lab', balls=[[K['NG'], 640, 640, 230, 'normal', 'none', None, 'DOCTOR'], [K['NG'], 1280, 650, 210, 'scared', 'none', None, 'PATIENT']],
         bubs=[[0.6, 1, 'I can pay you in chickens.'], [3.4, 0, 'How many chickens?'], [6.2, 1, 'Depends. Is it serious?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 8.5)
t = V.sc('rank', 10.0, id='MRK1', title='NEW "CURRENCIES" · WEEK 2', rows=[[K['CN'], [[0, 0], [7, 91]], 'RICE'], [K['RU'], [[0, 0], [7, 84]], 'CIGARETTES'], [K['SA'], [[0, 0], [7, 80]], 'FUEL'], [K['IN'], [[0, 0], [7, 74]], 'GOLD'],
         [K['US'], [[0, 0], [7, 66]], 'AMMO'], [K['DE'], [[0, 0], [7, 58]], 'MEDICINE'], [K['BR'], [[0, 0], [7, 51]], 'COFFEE']], fmt='int', unit=' pts', col='linear-gradient(90deg, #ffd23f, #fff0b0)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 10)
t = map_(13, 'M5', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], tints=[tint(FOOD, GRN, [[0.8, 0], [4, 0.5]], 0.1, stroke='#ffffff'), tint(FIN, '#ff3b30', [[6, 0], [9, 0.5]], 0.1)],
         caps=[[0.6, 5.6, 'Suddenly, only one thing matters: who grows food.', 'food'], [6.6, 12.6, 'Finance hubs that import their food are in trouble.', 'trouble']])
V.S(t + 0.8, 'riser_4s', 0.4); V.S(t + 6, 'downlifter', 0.5); dy(t + 13, 12)
t = map_(12, 'M6', cam=[[0, *P(30, 30), 0.65], [12, *P(30, 28), 0.7]], tints=[tint(FOOD, GRN, [[0, 0.5]])], arrows=[[0.8 + i * 0.5, 4.4 + i * 0.5, *a, *b, '#ffffff', 20] for i, (a, b) in enumerate([[P(3.4, 6.5), P(8, 11)], [P(31.2, 30), P(31, 26)], [P(77.2, 28.6), P(80, 25)], [P(-46.6, -23.5), P(-50, -20)], [P(121.5, 31.2), P(116, 33)], [P(-99.1, 19.4), P(-102, 22)]])],
         counters=[[0.8, 'CITY PEOPLE MOVING TO FARMS', [[0.8, 0], [10, 9.4e8]], 'big', GRN]], caps=[[0.6, 5.6, 'Cities empty. Millions walk to the countryside.', 'walk'], [6.6, 11.6, 'A farm job pays in the only thing that counts: dinner.', 'dinner']])
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(6)]; dy(t + 12, 14)
t = V.sc('balls', 10.0, id='MB4', bg='desert', balls=[[K['AE'] if 'AE' in K else K['SA'], 640, 640, 230, 'scared', 'none', None, None, {'sweat': True}], [K['AR'], 1280, 640, 230, 'smug', 'none', None, None]],
         bubs=[[0.6, 0, 'I have oil and skyscrapers.'], [3.6, 1, 'I have 50 million cows.'], [6.6, 0, '...Let\'s talk.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 15)
t = map_(12, 'M7', cam=[[0, *P(8.5, 47), 1.4], [6, *P(8.5, 47), 1.6], [6.3, *P(103.8, 1.35), 2.0], [12, *P(103.8, 1.35), 2.3]], tints=[tint(FIN, '#ff3b30', [[0, 0.5]])],
         pins=[[1.0, *P(8.5, 47.4), 'SWITZERLAND: VAULTS FULL OF NOTHING', '#ff6a5a'], [7.0, *P(103.8, 1.35), 'SINGAPORE: 90% OF FOOD IMPORTED', '#ff6a5a']], caps=[[0.6, 5.6, 'The richest places become the most fragile.', 'fragile'], [6.6, 11.6, 'Singapore has almost no farmland.', 'farmland']])
V.S(t + 6.3, 'whoosh_6', 0.5); dy(t + 12, 17)
t = V.sc('news', 14.0, id='MN2', anchor=K['GB'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.6], [10, 0.9]],
         bubs=[[1.0, 0, 'Day 18. A chicken now costs a television.'], [4.6, 0, 'A kilo of rice buys a car.'], [8.4, 0, 'A car buys... nothing. There\'s no fuel.']],
         papers=[[5.6, 'THE GLOBE DAILY', 'CHICKEN = TV'], [9.8, 'WORLD EVENING POST', 'FUEL RUNS OUT']], ticker='DAY 18  •  BARTER MARKETS IN EVERY CITY  •  FUEL STATIONS EMPTY  •  FARMERS ARE THE NEW RICH  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.6, 9.8]]; dy(t + 14, 18)

# ======================= CAP 3: EL CAOS =======================
t = map_(13, 'M8', chap=[0.0, 2.6, 'CHAPTER 3', 'CHAOS'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.33]], rings=[[3.0 + i * 0.3, *xy, '#ff3b30', 3] for i, xy in enumerate(CITIES)], parts=['ember', 50],
         counters=[[3.0, 'SUPERMARKETS LOOTED', [[3, 0], [12, 1.9e6]], 'big', '#ff3b30']], caps=[[3.0, 7.6, 'Month 1. Those with nothing to trade start taking.', 'taking'], [8.0, 12.6, 'Police and soldiers aren\'t paid. Many go home.', 'go home']])
V.chap_snd(t); V.M(t, t + 56, 'frantic', 0, 0.7, 1.0, 0.8); V.S(t + 3, 'crowd', 0.5); [V.SV(t + 4 + i * 0.6, 'gun', 0.2) for i in range(8)]; dy(t + 13, 30); eck(t + 13, 0)
PW = [P(30.1, 51.4), P(-77, 39), P(2.3, 47), P(139.7, 35.7), P(116.4, 39.9), P(77.2, 28.6), P(-46.6, -23.5), P(37.6, 55.75), P(31.2, 30), P(3.4, 6.5)]
t = map_(12, 'M9', cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.32]], night=[[0, 0.2], [7, 0.65]], icons=[[0.6 + i * 0.4, *xy, 'lightning-storm', GOLD, 44] for i, xy in enumerate(PW)],
         stamps=[[6.6, 'BLACKOUT', 960, 470, GOLD, 150]], caps=[[0.6, 5.6, 'Power plants need fuel, parts and paid engineers.', 'paid'], [7.6, 11.6, 'One by one, the grids go dark.', 'dark']])
V.S(t + 6.6, 'blackout', 0.8); V.S(t + 6.6, 'stamp_3', 0.6); dy(t + 12, 35)
DC = [P(-77.5, 39), P(-122, 37.4), P(-6.3, 53.3), P(8.7, 50.1), P(103.8, 1.35), P(139.7, 35.7), P(121.5, 31.2), P(-46.6, -23.5)]
t = map_(12, 'M9B', cam=[[0, 3840, 1950, 0.3], [12, 3840, 1950, 0.32]], night=[[0, 0.6], [12, 0.6]], icons=[[0.6 + i * 0.4, *xy, 'satellite-communication', '#9fd4ff', 44] for i, xy in enumerate(DC)],
         stamps=[[6.4, 'NO SIGNAL', 960, 470, '#9fd4ff', 150]], caps=[[0.6, 5.6, 'Data centers go unpaid. The internet flickers.', 'internet'], [7.6, 11.6, 'Phones become flashlights.', 'flashlights']])
V.S(t + 6.4, 'static', 0.6); V.S(t + 6.4, 'stamp_3', 0.6); dy(t + 12, 36)
t = V.sc('balls', 10.0, id='MB5', bg='office', balls=[[K['DE'], 640, 640, 230, 'angry', 'general', None, 'GENERAL'], [K['DE'], 1280, 640, 210, 'scared', 'delta', None, 'SOLDIER']],
         bubs=[[0.6, 0, 'Report for duty, soldier!'], [3.4, 1, 'With what pay?'], [6.4, 0, '...Three meals a day?'], [8.4, 1, 'Deal.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 37)
WARA = [[P(10, 45), P(25, 47)], [P(60, 25), P(70, 40)], [P(126, 35), P(127, 40)], [P(44, 33), P(36, 48)], [P(105, 15), P(100, 15)], [P(-70, -20), P(-60, -28)]]
t = map_(14, 'M10', cam=[[0, 3840, 1950, 0.3], [7, 3840, 1850, 0.36], [14, 3840, 1950, 0.32]], war=True, tints=[tint(FOOD, GRN, [[0, 0.4]])],
         arrows=[[2.0 + i * 0.6, 5.4 + i * 0.6, *a, *b, '#ff3b30', 26] for i, (a, b) in enumerate(WARA)], banners=[[0.4, 3.4, 'THE BREAD WARS', '#c3100a']],
         caps=[[3.6, 8.6, 'Hungry nations eye their neighbors\' fields.', 'fields'], [9.0, 13.6, 'Farmland is worth more than gold.', 'gold']])
for i, (a, b) in enumerate(WARA):
    for j in range(5):
        tt = t + 3.0 + i * 0.6 + j * 0.7; x, y = b[0] + random.randint(-60, 60), b[1] + random.randint(-40, 40)
        WAR['fx'].append([round(tt, 2), x, y, 60, 0]); WAR['ext']['crater'].append([round(tt, 2), x, y, 0]); WAR['ext']['smoke'].append([round(tt, 2), round(tt + 7, 2), x, y]); V.SV(tt, 'boom', 0.3)
V.S(t + 0.4, 'braam2', 0.6); dy(t + 14, 45)
t = V.sc('call', 12.0, id='MC2', ks=ks('CN', 'RU', 'BR', 'US'), banner='THE GRAIN SUMMIT', eyes=['angry', 'smug', 'smug', 'normal'],
         bubs=[[1.0, 0, 'We need wheat. A lot of it.'], [3.6, 1, 'And what will you give us?'], [6.2, 2, 'Brazil feeds the world now. We set the rules.'], [9.2, 3, 'So does America.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.2, 'summit', 0.5); dy(t + 12, 46)
t = V.sc('bignum', 6.0, id='MBN1', kf=[[0, 0], [4, 7.2e8]], fmt='big', top='PEOPLE GOING HUNGRY', label=[4.0, 'IN A WORLD FULL OF FOOD', '#ff3b30'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 48)
POW = [('US', 94), ('BR', 91), ('RU', 88), ('AR', 84), ('CA', 81), ('AU', 79), ('FR', 72), ('IN', 66)]
t = V.sc('rank', 10.0, id='MRK2', title='NEW SUPERPOWERS: FOOD POWER', rows=[[K[c], [[0, 0], [7, v]]] for c, v in POW if c in K], fmt='int', unit=' / 100', col='linear-gradient(90deg, #3bd16f, #c8ffd8)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 50)
t = V.sc('balls', 10.0, id='MB6', bg='bunker', balls=[[K['CH'], 960, 640, 260, 'dead', 'tie', None, 'SWISS BANKER']], props=[['padlock', 960, 330, 120, GOLD]],
         bubs=[[0.6, 0, 'The vault holds 500 billion...'], [3.6, 0, '...in numbers on a screen.'], [6.6, 0, 'I\'d trade it all for a potato.']])
V.talk(t, V.SC[-1][3]['bubs']); V.S(t + 0.5, 'steel_door', 0.5); dy(t + 10, 52)

# ======================= CAP 4: EL NUEVO DINERO =======================
NEWM = [('GRAIN NOTE', P(-95, 40)), ('ENERGY CREDIT', P(10, 50)), ('RICE TOKEN', P(105, 30)), ('GOLD COIN', P(77, 22)), ('LABOR HOUR', P(-55, -15)), ('NO MONEY: COMMUNES', P(25, 0))]
t = map_(13, 'M11', chap=[0.0, 2.6, 'CHAPTER 4', 'NEW MONEY'], cam=[[0, 3840, 2000, 0.3], [13, 3840, 2000, 0.32]], tints=[tint(FOOD, GRN, [[0, 0.3]])], pins=[[3.0 + i * 0.6, *xy, n, GOLD] for i, (n, xy) in enumerate(NEWM)],
         caps=[[3.0, 7.6, 'Month 3. Every region invents its own money.', 'invents'], [8.0, 12.6, 'Backed by something you can eat... or burn.', 'eat']])
V.chap_snd(t); V.M(t, t + 70, 'heroic', 0, 0.65, 1.0, 0.8); [V.S(t + 3 + i * 0.6, 'ding', 0.25) for i in range(len(NEWM))]; dy(t + 13, 90); eck(t + 13, 8)
t = V.sc('balls', 10.0, id='MB7', bg='street', balls=[[K['IN'], 640, 640, 230, 'normal', 'none', None, None], [K['IN'], 1280, 640, 230, 'smug', 'none', None, None]], props=[['trophy-cup', 960, 400, 100, GOLD]],
         bubs=[[0.6, 1, 'Grandma\'s gold necklace is now worth a house.'], [4.4, 0, 'She said we\'d need it one day.'], [7.4, 1, 'She was right.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 100)
t = map_(13, 'M12', cam=[[0, *P(20, 15), 0.6], [13, *P(20, 12), 0.65]], tints=[tint(ks('NG', 'KE', 'ET', 'TZ', 'UG', 'GH', 'CD', 'SN', 'ML', 'BF', 'NE', 'CM'), GRN, [[1, 0], [5, 0.45]], 0.1)],
         counters=[[1.0, 'PEOPLE LIVING IN MONEYLESS COMMUNES', [[1, 0], [10, 6.3e8]], 'big', GRN]], caps=[[0.6, 5.6, 'Villages that barely used money adapt fastest.', 'adapt fastest'], [6.6, 12.6, 'Sharing, not buying, keeps them alive.', 'Sharing']])
V.S(t + 1, 'birds', 0.3); dy(t + 13, 120); eck(t + 13, 15)
t = V.sc('balls', 10.0, id='MB7B', bg='sky', balls=[[K['KE'], 640, 680, 170, 'normal', 'none', None, 'AGE 6'], [K['KE'], 1280, 640, 230, 'smug', 'none', None, 'GRANDPA']],
         bubs=[[0.6, 0, 'Grandpa, what was money?'], [3.6, 1, 'Paper we all agreed was valuable.'], [6.8, 0, 'Why? You can\'t eat paper.']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 130)
t = V.sc('news', 14.0, id='MN3', anchor=K['US'], tvp=dict(), cam=[3840, 2050, 0.3], fear=[[0, 0.4], [10, 0.1]],
         bubs=[[1.0, 0, 'Month 6. Big news.'], [3.4, 0, '120 countries agree on one new currency.'], [7.6, 0, 'It\'s called the Grain Credit. One credit, one kilo of wheat.']],
         papers=[[5.4, 'THE GLOBE DAILY', 'THE GRAIN CREDIT'], [9.8, 'WORLD EVENING POST', 'MONEY IS BACK']], ticker='MONTH 6  •  GRAIN CREDIT ADOPTED BY 120 COUNTRIES  •  FIRST SALARIES PAID SINCE DAY ZERO  •  ')
V.S(t, 'news_sting', 0.6); V.talk(t, V.SC[-1][3]['bubs']); [V.S(t + x + 0.55, 'stamp_1', 0.5) for x in [5.4, 9.8]]; dy(t + 14, 180)
ADOPT = [k for k in ALLK if k not in FIN]
t = map_(13, 'M13', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.32]], tints=[tint(ADOPT, GOLD, [[0.8, 0], [1.2, 0.45]], 0.025, stroke='#ffffff')],
         counters=[[0.8, 'COUNTRIES USING THE GRAIN CREDIT', [[0.8, 0], [9, 128]], 'int', GOLD]], stamps=[[9.4, 'MONEY 2.0', 960, 470, GOLD, 150]],
         caps=[[0.6, 5.6, 'The new money spreads across the map.', 'spreads'], [6.6, 9.2, 'This time it\'s tied to real food.', 'real food']])
[V.S(t + 1 + i * 0.25, 'ding', 0.12) for i in range(30)]; V.S(t + 9.4, 'stamp_2', 0.8); V.S(t + 9.4, 'crowd_cheer', 0.4); dy(t + 13, 200); eck(t + 13, 42)
t = map_(12, 'M14', cam=[[0, 3840, 2050, 0.3], [12, 3840, 2050, 0.32]], tints=[tint(ADOPT, GOLD, [[0, 0.3]]), tint(FIN, '#8a8f96', [[0, 0], [4, 0.55]], 0.1)],
         caps=[[0.6, 5.6, 'Old banking havens are left behind.', 'left behind'], [6.6, 11.6, 'Their wealth was only numbers. And numbers are gone.', 'numbers']])
V.S(t + 1, 'downlifter', 0.4); dy(t + 12, 260); eck(t + 12, 55)
SEA = [[P(-40, -35), P(5, 40)], [P(-60, 25), P(-20, 45)], [P(-170, 30), P(150, 30)], [P(60, -10), P(80, 5)], [P(-120, 20), P(-150, 40)], [P(140, -40), P(110, -10)], [P(20, -40), P(60, -20)]]
t = map_(12, 'M14B', cam=[[0, 3840, 2050, 0.28], [12, 3840, 2050, 0.3]], tints=[tint(ADOPT, GOLD, [[0, 0.3]])], arrows=[[0.8 + i * 0.5, 5.0 + i * 0.5, *a, *b, '#7ad0ff', 20] for i, (a, b) in enumerate(SEA)],
         counters=[[0.8, 'CARGO SHIPS SAILING AGAIN', [[0.8, 0], [10, 21000]], 'int', '#7ad0ff']], caps=[[0.6, 5.6, 'Ships sail again. Trade restarts.', 'Trade restarts'], [6.6, 11.6, 'Grain flows out. Machines flow in.', 'Grain']])
[V.SV(t + 0.8 + i * 0.5, 'whoosh', 0.25) for i in range(len(SEA))]; dy(t + 12, 280)
NEWR = [('US', 100), ('BR', 86), ('RU', 81), ('IN', 77), ('CN', 74), ('AR', 61), ('CA', 58), ('FR', 52)]
t = V.sc('rank', 10.0, id='MRK3', title='RICHEST COUNTRIES · YEAR 1 (GRAIN CREDITS)', rows=[[K[c], [[0, 0], [7, v]]] for c, v in NEWR if c in K], fmt='int', unit='B', col='linear-gradient(90deg, #ffd23f, #fff0b0)')
V.S(t + 0.2, 'whoosh_6', 0.5); dy(t + 10, 300)
t = V.sc('balls', 10.0, id='MB8', bg='sky', balls=[[K['BR'], 640, 640, 250, 'shades', 'sash', None, 'FARMER'], [K['GB'], 1280, 650, 220, 'scared', 'tie', None, 'EX-BANKER']],
         bubs=[[0.6, 1, 'Any jobs on your farm?'], [3.4, 0, 'Can you drive a tractor?'], [6.4, 1, 'I can... make a spreadsheet?']])
V.talk(t, V.SC[-1][3]['bubs']); dy(t + 10, 330)
t = map_(13, 'M15', cam=[[0, 3840, 2050, 0.3], [13, 3840, 2050, 0.27]], tints=[tint(ADOPT, GOLD, [[0, 0.3]]), tint(FOOD, GRN, [[0, 0], [4, 0.45]], 0.05, stroke='#ffffff')],
         stamps=[[6.0, 'A NEW WORLD ORDER', 960, 460, GRN, 110, 0]], caps=[[0.6, 5.6, 'Year 1. The world economy is back... at half size.', 'half size'], [8.0, 12.6, 'And the farmers now rule the planet.', 'farmers']])
V.S(t + 6.0, 'stamp_2', 0.7); V.S(t + 6.0, 'braam3', 0.4); dy(t + 13, 365); eck(t + 13, 52)
t = V.sc('bignum', 6.0, id='MBN2', kf=[[0, 0], [4, 1.8e8]], fmt='big', top='PEOPLE WHO DIED IN YEAR ONE', label=[4.0, 'NOT FROM WAR. FROM AN EMPTY NUMBER.', '#ff3b30'])
V.S(t + 0.1, 'heartbeat', 0.8); V.S(t + 4.0, 'thit', 0.8); dy(t + 6, 365)
t = V.sc('end', 12.0, id='MEND', cam=[[0, 3840, 2050, 0.27], [12, 3840, 2050, 0.25]], filter='brightness(0.5) sepia(0.4)', lines=[[0.8, 'WHAT WOULD YOU TRADE?', 300, 110, 99, GOLD]], ask=[2.6, 'Your most valuable skill without money? 👇'], sub=5.0)
V.S(t + 1.0, 'braam3', 0.4); V.M(t, t + 12, 'triumph', 0, 0.6, 0.5, 2.0)

V.extra['war'] = WAR
V.extra['hud'] = dict(top=dict(label='DAY', kf=DY, fmt='int'), bar=dict(label='WORLD ECONOMY', kf=EC, sub=None))
V.export()
