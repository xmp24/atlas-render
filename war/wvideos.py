# Six English war videos (country-by-country). Builds war/<key>_script.json
import json, math, sys, os
sys.path.insert(0, '/home/claude/atlas-render/mcd'); from data import ORDER
import country_converter as coco
cc = coco.CountryConverter()
R = '/home/claude/atlas-render/war/'

EN = {"US": "United States", "CA": "Canada", "MX": "Mexico", "GB": "United Kingdom", "IE": "Ireland", "FR": "France", "ES": "Spain", "PT": "Portugal", "AD": "Andorra", "IT": "Italy", "SM": "San Marino", "MT": "Malta", "MC": "Monaco", "CH": "Switzerland", "LI": "Liechtenstein", "AT": "Austria", "DE": "Germany", "LU": "Luxembourg", "BE": "Belgium", "NL": "Netherlands", "DK": "Denmark", "NO": "Norway", "SE": "Sweden", "FI": "Finland", "IS": "Iceland", "PL": "Poland", "CZ": "Czech Republic", "SK": "Slovakia", "HU": "Hungary", "SI": "Slovenia", "HR": "Croatia", "BA": "Bosnia", "RS": "Serbia", "ME": "Montenegro", "XK": "Kosovo", "AL": "Albania", "MK": "North Macedonia", "GR": "Greece", "BG": "Bulgaria", "RO": "Romania", "MD": "Moldova", "UA": "Ukraine", "BY": "Belarus", "LT": "Lithuania", "LV": "Latvia", "EE": "Estonia", "RU": "Russia", "CY": "Cyprus", "TR": "Turkey", "CO": "Colombia", "VE": "Venezuela", "EC": "Ecuador", "PE": "Peru", "BO": "Bolivia", "CL": "Chile", "AR": "Argentina", "UY": "Uruguay", "PY": "Paraguay", "BR": "Brazil", "GY": "Guyana", "SR": "Suriname", "PA": "Panama", "CR": "Costa Rica", "NI": "Nicaragua", "HN": "Honduras", "SV": "El Salvador", "GT": "Guatemala", "BZ": "Belize", "CU": "Cuba", "JM": "Jamaica", "HT": "Haiti", "DO": "Dominican Republic", "BS": "Bahamas", "BB": "Barbados", "TT": "Trinidad and Tobago", "GD": "Grenada", "VC": "Saint Vincent", "LC": "Saint Lucia", "DM": "Dominica", "AG": "Antigua and Barbuda", "KN": "Saint Kitts and Nevis", "GE": "Georgia", "AM": "Armenia", "AZ": "Azerbaijan", "KZ": "Kazakhstan", "UZ": "Uzbekistan", "TM": "Turkmenistan", "KG": "Kyrgyzstan", "TJ": "Tajikistan", "AF": "Afghanistan", "IR": "Iran", "IQ": "Iraq", "SY": "Syria", "LB": "Lebanon", "IL": "Israel", "PS": "Palestine", "JO": "Jordan", "SA": "Saudi Arabia", "YE": "Yemen", "OM": "Oman", "AE": "United Arab Emirates", "QA": "Qatar", "BH": "Bahrain", "KW": "Kuwait", "IN": "India", "PK": "Pakistan", "NP": "Nepal", "BT": "Bhutan", "BD": "Bangladesh", "LK": "Sri Lanka", "MV": "Maldives", "MM": "Myanmar", "TH": "Thailand", "LA": "Laos", "KH": "Cambodia", "VN": "Vietnam", "MY": "Malaysia", "SG": "Singapore", "ID": "Indonesia", "BN": "Brunei", "PH": "Philippines", "TL": "East Timor", "CN": "China", "MN": "Mongolia", "KP": "North Korea", "KR": "South Korea", "JP": "Japan", "TW": "Taiwan", "AU": "Australia", "NZ": "New Zealand", "PG": "Papua New Guinea", "SB": "Solomon Islands", "VU": "Vanuatu", "FJ": "Fiji", "WS": "Samoa", "TO": "Tonga", "KI": "Kiribati", "TV": "Tuvalu", "NR": "Nauru", "MH": "Marshall Islands", "FM": "Micronesia", "PW": "Palau", "MA": "Morocco", "DZ": "Algeria", "TN": "Tunisia", "LY": "Libya", "EG": "Egypt", "SD": "Sudan", "SS": "South Sudan", "ET": "Ethiopia", "ER": "Eritrea", "DJ": "Djibouti", "SO": "Somalia", "KE": "Kenya", "UG": "Uganda", "RW": "Rwanda", "BI": "Burundi", "TZ": "Tanzania", "MZ": "Mozambique", "MW": "Malawi", "ZM": "Zambia", "ZW": "Zimbabwe", "BW": "Botswana", "NA": "Namibia", "ZA": "South Africa", "LS": "Lesotho", "SZ": "Eswatini", "MG": "Madagascar", "MU": "Mauritius", "KM": "Comoros", "SC": "Seychelles", "AO": "Angola", "CD": "DR Congo", "CG": "Republic of the Congo", "GA": "Gabon", "GQ": "Equatorial Guinea", "CM": "Cameroon", "CF": "Central African Republic", "TD": "Chad", "NE": "Niger", "NG": "Nigeria", "BJ": "Benin", "TG": "Togo", "GH": "Ghana", "CI": "Ivory Coast", "BF": "Burkina Faso", "ML": "Mali", "MR": "Mauritania", "SN": "Senegal", "GM": "Gambia", "GW": "Guinea-Bissau", "GN": "Guinea", "SL": "Sierra Leone", "LR": "Liberia", "CV": "Cape Verde", "ST": "São Tomé", "VA": "Vatican City"}

# ------------------------------------------------ voices (one voice per country, all videos)
NARR = 'TdfSA3lJhYDuSNaJJ1GD'   # Nathaniel – thrilling British commentator
VO = {'US': 'BIDecpCwOWfm9O9hqJ2Q', 'GB': 'erjfZbWOeOlXoejyglLN', 'FR': 'K8nDX2f6wjv6bCh5UeZi', 'DE': 'COD96vfwrPlMeaUXwauW',
      'RU': 'IGRoDkfYV2Frq7Ly0PRu', 'UA': 'Hwba32EPA4zN8a7MTDdH', 'CN': 'Qc0X0JnOfc5XzetLVusF', 'KP': 'NIkIuJZ8oQMuKZqwKtnm',
      'KR': 'FVWKzBg4YHtWyzhv4jbA', 'JP': 'GEu8gO3mtnzo1WzOahBv', 'IN': 'pnoafjwb2T2zx4YYE60H', 'PK': 'TaTdNcvu1DfJrKqVfkx6',
      'IL': 'VdfrdMTmtG3CSdtCQFZM', 'EG': '8zix1abYKaEzO8roizqz', 'SA': '7UsSKSrq1KQIERpStCBd', 'AF': '8zix1abYKaEzO8roizqz',
      'VN': '8sC2PdsBbZciPZg8YtrD', 'AU': 'dSX8MUEljgxrFygPwhF5', 'SE': 'WdIPSrSt3hS2coCWJ8HG', 'FI': '6qtlupOXBYtv2nYY2VgL',
      'IS': 'WdIPSrSt3hS2coCWJ8HG', 'VA': 'fhNley3gMN1oXT2fQZjN', 'MX': 'qKiF0EEU7wtRm1G2mLMh', 'AR': 'D09EpJbk4um1HKSpeTSc',
      'CR': 'RNNRvoYqzwT1Ny5nS6E5', 'CL': 'S9xWbRwkWxZfSdk9ZG27', 'GR': 'mgZYFBDKPJGhiZEAcf4X', 'TR': 'u5UJ3o5MZq3cWrXIXi37',
      'PL': 'u5UJ3o5MZq3cWrXIXi37', 'CH': 'COD96vfwrPlMeaUXwauW', 'LU': 'K8nDX2f6wjv6bCh5UeZi', 'MC': 'K8nDX2f6wjv6bCh5UeZi',
      'AM': 'XaEUesE01wKIKaa0xI0h', 'TW': 'c3xntgIY160tGkH7rVz2'}

PAL = dict(X=('#8f86a8', '#5c5475'), R=('#ee4646', '#a51f1f'), O=('#ff8c2e', '#b35a0c'), Y=('#ffd23f', '#b38e00'),
           G=('#2fbf63', '#17803d'), P=('#9b5de5', '#5e2ca5'))
def cat(k, label, short, pal, mood): return dict(k=k, label=label, short=short, col=PAL[pal][0], cold=PAL[pal][1], mood=mood)

def iso3(code):
    if code in ('XKX',): return 'XK'
    if code == 'TWN': return 'TW'
    if code == 'VAT': return 'VA'
    r = cc.convert(code, src='ISO3', to='ISO2', not_found=None); return r if isinstance(r, str) else None
def fmt(n): return f'{int(round(n)):,}'

# ------------------------------------------------ raw data
IISS = {}
for it in open(R + 'iiss.txt').read().strip().split(';'):
    n, a, rv = it.split('|'); k = cc.convert(n, to='ISO2', not_found=None)
    if n == 'Kosovo': k = 'XK'
    if n == 'Taiwan': k = 'TW'
    IISS[k] = (int(a), int(rv))
MIL = {}
for it in open(R + 'wbmil.txt').read().split():
    p = it.split(':'); k = iso3(p[0])
    if not k: continue
    usd = int(p[1].split('@')[0]); yr = p[1].split('@')[1]; g = p[2].split('@')[0]
    MIL[k] = (usd, float(g) if g else None, yr)
POP = {}
for it in open(R + 'wbpop.txt').read().split():
    p = it.split(':'); k = iso3(p[0])
    if k: POP[k] = (float(p[1]), float(p[2]))
COW = json.load(open(R + 'cow.json'))
NUKES = {'US', 'RU', 'CN', 'GB', 'FR', 'IN', 'PK', 'KP', 'IL'}
NOARMY = {'CR', 'PA', 'IS', 'MU', 'AD', 'LI', 'GD', 'DM', 'LC', 'VC', 'SB', 'WS', 'KI', 'TV', 'NR', 'MH', 'FM', 'PW', 'VU', 'PS'}

def soldiers(c):
    if c == 'VA': return 135, 0
    if c in NOARMY: return 0, 0
    return IISS.get(c, (None, None))

# ------------------------------------------------ 1 · SOLDIERS
def sol():
    cats = [cat('X', 'NO ARMY', 'NONE', 'X', 'happy'), cat('A', 'UNDER 10,000', '<10K', 'R', 'sad'), cat('B', '10K – 50K', '10K+', 'O', 'angry'),
            cat('C', '50K – 200K', '50K+', 'Y', 'happy'), cat('D', '200K – 1 MILLION', '200K+', 'G', 'happy'), cat('E', 'OVER 1 MILLION', '1M+', 'P', 'angry')]
    def say_n(v):
        if v >= 1_000_000: return f'{v/1e6:.2f}'.rstrip('0').rstrip('.') + ' million'
        if v >= 10000: return fmt(round(v, -3))
        if v >= 1000: return fmt(round(v, -2))
        return str(v)
    X = {'CN': 'The biggest army on the planet!', 'IN': 'Number two!', 'US': 'Number three.', 'KP': 'Number four!', 'RU': 'Number five.',
         'UA': 'Number six!', 'PK': 'Number seven.', 'IR': 'Number eight.', 'ER': 'Huge, for a country of under four million people!',
         'IL': 'Plus 465,000 reservists.', 'SG': 'Plus 250,000 reservists.', 'TW': 'Plus 1.6 million reservists!', 'CH': 'But almost 200,000 reservists.',
         'FI': 'Plus 233,000 reservists.', 'MC': "The Prince's own guard.", 'SM': 'A ceremonial army.', 'PA': 'No army since 1990.',
         'AD': 'Spain and France protect it.', 'HT': 'For eleven million people.', 'LU': 'One of the smallest in Europe.', 'GR': 'Plus 264,000 reservists.',
         'EG': 'The biggest army in Africa... after Ethiopia.', 'ET': 'The biggest army in Africa!', 'MX': '', 'BR': 'The biggest in Latin America.',
         'CO': 'Second in Latin America.', 'VN': ''}
    T = {'US': '1.3 million soldiers... and we are only number three?', 'CN': 'Two million soldiers. The biggest army on Earth.',
         'IN': 'One and a half million! Number two in the world.', 'KP': '1.28 million soldiers... out of just 26 million people!',
         'RU': '1.26 million. And one and a half million more in reserve.', 'UA': 'Almost seven hundred thousand. Because we have to.',
         'KR': 'Only 450,000... but three million reservists!', 'VN': '450,000 active... and five million in reserve.',
         'CR': 'No army since 1948. We spend it on schools.', 'IS': 'No army at all. Just the coast guard... and the weather.',
         'VA': 'Our army? 135 Swiss Guards. With halberds.'}
    C = []; flip = 0
    for c in ORDER:
        a, rv = soldiers(c); n = EN[c]
        if c == 'LY':
            st, say, v, vs, sub = 'X', 'Libya: nobody knows! Two rival armies.', 'NO DATA', '?', 'Army split between two governments'
        elif c == 'SY':
            st, say, v, vs, sub = 'X', 'Syria: starting from scratch! The old army collapsed in 2024.', 'REBUILDING', '?', 'Old army dissolved in December 2024'
        elif a == 0:
            flip += 1; st = 'X'; v, vs = 'NO ARMY', '0'
            say = f'{n}: {"no army at all!" if flip % 2 else "zero soldiers!"}'; sub = 'No armed forces'
        else:
            st = 'A' if a < 10000 else 'B' if a < 50000 else 'C' if a < 200000 else 'D' if a < 1_000_000 else 'E'
            say = f'{n}: {say_n(a)}.'; v = fmt(a); vs = (f'{a/1e6:.1f}M' if a >= 1e6 else f'{round(a/1000):,}K' if a >= 1000 else str(a))
            sub = f'Active soldiers · reserve {fmt(rv)}' if rv else 'Active soldiers'
            if c == 'VA': sub = 'Pontifical Swiss Guard'
        if X.get(c): say += ' ' + X[c]
        C.append(dict(c=c, st=st, v=v, vs=vs, sub=sub, say=say))
    cfg = dict(title='SOLDIERS IN EVERY COUNTRY', icon='soldier', t1='HOW MANY SOLDIERS', t2='EVERY COUNTRY HAS', badge='197 COUNTRIES · ACTIVE TROOPS',
               cats=cats, balls=['CN', 'IN', 'US', 'KP', 'RU', 'CR'], ballMoods=['angry', 'happy', 'angry', 'angry', 'angry', 'happy'],
               best=['CN', 'BIGGEST ARMY', '2.0 MILLION'], worst=['CR', 'NO ARMY', '0'], ask='HOW BIG IS YOUR ARMY? COMMENT!')
    intro = ['Which country has the biggest army on Earth? And which ones have no army at all? 197 countries, one by one. Active soldiers only.',
             'Grey: no army.', 'Red: under ten thousand.', 'Orange: up to fifty thousand.', 'Yellow: up to two hundred thousand.', 'Green: up to one million.',
             "And purple... over a million soldiers! Let's go!"]
    outro = ["How big is your country's army? Tell me in the comments!"]
    return dict(key='sol', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ------------------------------------------------ 2 · WARS LOST
def clean(w):
    w = w.split(',')[0].replace(' Phase 2', '').strip()
    fix = {'Mexican-American': 'Mexican-American War', 'Falkland Islands': 'Falklands War', 'Franco-Prussian': 'Franco-Prussian War',
           'Spanish-American': 'Spanish-American War', 'Vietnam War': 'Vietnam War', 'World War I': 'First World War', 'World War II': 'Second World War',
           'Crimean': 'Crimean War', 'Russo-Japanese': 'Russo-Japanese War', 'First Sino-Japanese': 'First Sino-Japanese War', 'Gulf War': 'Gulf War',
           'Six Day War': 'Six-Day War', 'Third Sino-Japanese': 'Second Sino-Japanese War', 'Austro-Sardinian': 'Austro-Sardinian War', 'Yom Kippur War': 'Yom Kippur War', 'Arab-Israeli': 'Arab-Israeli War', 'Korean': 'Korean War',
           'War of the Pacific': 'War of the Pacific', 'Football War': 'Football War', 'Chaco': 'Chaco War', 'Iran-Iraq': 'Iran-Iraq War'}
    fix.update({'War for Kosovo': 'Kosovo War', 'Lopez': 'Paraguayan War', 'Off-shore Islands': 'First Taiwan Strait Crisis', 'Conquest of Ethiopia': 'Italian invasion of 1935',
                'Ugandian-Tanzanian': 'Uganda-Tanzania War', 'War over the Aouzou Strip': 'Aouzou Strip War', 'Russo-Georgian War (2008)': 'Russo-Georgian War',
                'Second Nagorno-Karabakh War (2020)': 'Second Nagorno-Karabakh War', 'Turco-Cypriot': 'Turkish invasion of 1974', 'Bangladesh': 'Bangladesh Liberation War',
                'Second Kashmir': 'Second Kashmir War', 'Saudi-Yemeni': 'Saudi-Yemeni War', 'Azeri-Armenian': 'Nagorno-Karabakh War', 'Sino-Vietnamese Punitive': 'Sino-Vietnamese War'})
    if w in fix: return fix[w]
    return w if 'War' in w else w + ' War'
def los():
    cats = [cat('X', 'NEVER AT WAR', 'NEVER', 'X', 'happy'), cat('A', 'NEVER LOST', '0', 'G', 'happy'), cat('B', '1 WAR LOST', '1', 'Y', 'sad'),
            cat('C', '2 LOST', '2', 'O', 'sad'), cat('D', '3 – 4 LOST', '3-4', 'R', 'angry'), cat('E', '5 OR MORE', '5+', 'P', 'sad')]
    W = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']
    X = {'CN': 'The most wars lost of any country on Earth!', 'RU': 'But twelve won!', 'TR': 'Mostly as the Ottoman Empire.', 'GB': '',
         'IL': 'Four wars, four wins.', 'VA': '', 'UA': 'And fighting Russia right now.', 'KP': 'The Korean War? Officially... a draw.'}
    T = {'US': "Two losses... and we don't talk about Vietnam.", 'GB': 'Ten wars won, zero lost. Rule, Britannia!',
         'FR': 'Twelve wars won! So stop with the surrender jokes!', 'DE': 'Three losses... and two of them were rather big ones.',
         'RU': 'Twelve wins. The losses? Classified.', 'CN': "Seven losses... but we're still here, five thousand years later.",
         'MX': 'Just one war... and we lost half our territory.', 'AR': "Two losses. Please... don't mention the Falklands.",
         'EG': 'Five losses... but have you seen our pyramids?', 'VA': 'Yes. The Pope lost two wars.', 'JP': 'Six wins, three losses... then we chose peace.'}
    C = []; k0 = 0
    for c in ORDER:
        d = COW[c]; n = EN[c]; lw, wn = d['lost'], d['won']
        names = [clean(x) for x in d['lost_names']]
        big = clean(d['big']) if d.get('big') else (names[0] if names else '')
        if c == 'AR': big = 'Falklands War'
        if d['fought'] == 0:
            st = 'X'; k0 += 1; say = f'{n}: {["never been to war!", "never fought a single war!", "no wars at all!"][k0 % 3]}'
            v, vs, sub = 'NEVER AT WAR', '—', 'No wars between countries since 1816'
        elif lw == 0:
            st = 'A'; say = f'{n}: zero wars lost!' + (f' {W[wn-1].capitalize()} won.' if 0 < wn <= 12 else '')
            v, vs, sub = '0 LOST', '0', f'Won {wn} · Lost 0' + (f' · {d["fought"]} fought' if d['fought'] > wn else '')
        else:
            st = 'B' if lw == 1 else 'C' if lw == 2 else 'D' if lw <= 4 else 'E'
            say = f'{n}: {W[lw-1]} war{"s" if lw > 1 else ""} lost' + (f': the {big}.' if lw == 1 else f', including the {big}.')
            v, vs, sub = f'{lw} LOST', str(lw), f'Won {wn} · Lost {lw}'
        if c == 'VA': say = 'Vatican City: two wars lost... as the Papal States, back in the 1800s!'
        if c == 'UA': sub = 'At war with Russia since 2022'
        if X.get(c): say += ' ' + X[c]
        C.append(dict(c=c, st=st, v=v, vs=vs, sub=sub, say=say))
    cfg = dict(title='WARS LOST BY EVERY COUNTRY', icon='flag', t1='HOW MANY WARS', t2='HAS EVERY COUNTRY LOST?', badge='EVERY WAR SINCE 1816',
               cats=cats, balls=['CN', 'RU', 'US', 'GB', 'FR', 'MX'], ballMoods=['sad', 'angry', 'angry', 'happy', 'angry', 'sad'],
               best=['GB', 'NEVER LOST', '10 WON · 0 LOST'], worst=['CN', 'MOST LOSSES', '7 LOST'], ask='DID YOUR COUNTRY WIN? COMMENT!')
    intro = ['Which country has lost the most wars in history? And which ones have never lost a single one? Every war between countries since 1816. 197 countries, one by one.',
             'Grey: never fought a war.', 'Green: fought, but never lost.', 'Yellow: one war lost.', 'Orange: two.', 'Red: three or four.',
             "And purple... five or more! Let's go!"]
    outro = ['Did your country win, or lose? Tell me in the comments!']
    return dict(key='los', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ------------------------------------------------ 3 · MILITARY SPENDING
def mil():
    cats = [cat('X', 'NO ARMY / NO DATA', 'N/A', 'X', 'happy'), cat('A', 'UNDER $100M', '<100M', 'R', 'sad'), cat('B', '$100M – $1B', '100M+', 'O', 'sad'),
            cat('C', '$1B – $10B', '1B+', 'Y', 'happy'), cat('D', '$10B – $100B', '10B+', 'G', 'happy'), cat('E', 'OVER $100 BILLION', '100B+', 'P', 'angry')]
    def money(m):
        if m >= 1000: b = m / 1000; return '$' + (f'{b:.0f}' if b >= 10 else f'{b:.1f}'.rstrip('0').rstrip('.')) + ' billion'
        return f'${int(round(m, -1 if m >= 100 else 0))} million'
    def short(m): return (f'${m/1000:.0f}B' if m >= 10000 else f'${m/1000:.1f}B' if m >= 1000 else f'${int(m)}M')
    X = {'US': 'Number one, by far!', 'CN': 'Number two.', 'RU': 'Number three.', 'DE': 'Number four!', 'DZ': 'The highest share in Africa!',
         'OM': 'One of the highest shares on Earth.', 'IE': 'One of the lowest shares in Europe.', 'KP': 'Nobody knows!', 'HT': 'Almost nothing.',
         'ER': 'Last official number: 2003!', 'AE': 'Last official figure: 2014.', 'VE': 'Last official figure: 2017.', 'CU': 'Last official figure: 2018.', 'IS': '', 'GR': 'Almost three percent!', 'MM': 'Nearly seven percent!'}
    T = {'US': '954 billion dollars. More than the next six countries combined.', 'CN': '336 billion... officially.',
         'RU': '190 billion. Seven and a half percent of everything we make.', 'UA': 'Almost forty percent of our whole economy. We have no choice.',
         'DE': '114 billion euros... sorry, dollars. Germany is back.', 'IL': 'Nearly eight percent of our economy.',
         'PL': 'Four and a half percent. The most in NATO!', 'IN': '92 billion. Fifth in the world.',
         'SA': '83 billion dollars. For a country of 37 million.', 'CR': 'Zero. We abolished our army in 1948.', 'JP': '62 billion... and rising fast.'}
    C = []
    for c in ORDER:
        n = EN[c]; m = MIL.get(c)
        if c == 'TW': m = (20000, 2.5, '2025')
        if c in ('SY', 'TM', 'YE'): m = None
        if c in NOARMY or c == 'VA' or (m and m[0] == 0):
            st, v, vs, sub = 'X', 'NO ARMY', '$0', 'No armed forces'; say = f'{n}: zero. No army!'
        elif not m:
            st, v, vs, sub = 'X', 'NO DATA', '?', 'No reliable data'; say = f'{n}: no data!'
        else:
            usd, g, yr = m
            st = 'A' if usd < 100 else 'B' if usd < 1000 else 'C' if usd < 10000 else 'D' if usd < 100000 else 'E'
            gs = (f'{g:.1f}'.rstrip('0').rstrip('.') + '% of GDP') if g else ''
            say = f'{n}: {money(usd)}' + (f'. {gs}.' if g else '.')
            v = short(usd); vs = short(usd); sub = (f'{g:.1f}% of GDP' if g else 'Share of GDP unknown') + (f' · data {yr}' if yr < '2024' else '')
        if X.get(c): say += ' ' + X[c]
        C.append(dict(c=c, st=st, v=v, vs=vs, sub=sub, say=say))
    cfg = dict(title='MILITARY SPENDING', icon='money', t1='WHO SPENDS THE MOST', t2='ON WAR?', badge='197 COUNTRIES · SIPRI 2025',
               cats=cats, balls=['US', 'CN', 'RU', 'UA', 'IL', 'CR'], ballMoods=['angry', 'angry', 'angry', 'sad', 'angry', 'happy'],
               best=['US', 'SPENDS THE MOST', '$954 BILLION'], worst=['UA', 'BIGGEST SHARE', '40% OF GDP'], ask='MORE OR LESS? COMMENT!')
    intro = ['Who spends the most money on war? From nearly one trillion dollars... to absolutely nothing. 197 countries, one by one: the military budget, and how much of the economy it eats.',
             'Grey: no army, or no data.', 'Red: under 100 million dollars.', 'Orange: up to one billion.', 'Yellow: up to ten billion.', 'Green: up to one hundred billion.',
             "And purple... over one hundred billion dollars! Let's go!"]
    outro = ['Should your country spend more, or less? Comment below!']
    return dict(key='mil', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ------------------------------------------------ 4 · HOW LONG WOULD IT LAST (simulation)
def score(c):
    a, rv = soldiers(c); a = a or 0; rv = rv or 0
    m = MIL.get(c, (0, None, ''))[0] if c not in NOARMY else 0
    ar, pk = POP.get(c, (1000, 1000))
    return 0.45 * math.log(a + 0.35 * rv + 50) + 0.25 * math.log(m + 5) + 0.2 * math.log(ar + 1) + 0.15 * math.log(pk + 1)
def last():
    S = {c: score(c) for c in ORDER}
    s1, s2 = S['LU'], S['UA']; k = math.log(900 / 1.0) / (s2 - s1)
    days = {c: math.exp(k * (S[c] - s1)) for c in ORDER}
    cats = [cat('A', 'UNDER 1 DAY', '<1 DAY', 'R', 'sad'), cat('B', 'UNDER 1 WEEK', '<1 WEEK', 'O', 'sad'), cat('C', 'UNDER 1 MONTH', '<1 MONTH', 'Y', 'angry'),
            cat('D', 'UNDER 1 YEAR', '<1 YEAR', 'G', 'happy'), cat('E', 'OVER 1 YEAR / NEVER', '1 YEAR+', 'P', 'angry')]
    def human(d):
        def one(n, u): return (('an ' if u == 'hour' else 'a ') + u) if n == 1 else f'{n} {u}s'
        if d < 1 / 24: return 'under an hour', '<1 HOUR'
        if d < 1: h = max(1, round(d * 24)); return one(h, 'hour'), f'{h} HOUR' + ('S' if h > 1 else '')
        if d < 7: x = round(d); return (one(x, 'day') if x < 7 else 'a week'), (f'{x} DAY' + ('S' if x > 1 else '') if x < 7 else '1 WEEK')
        if d < 30:
            x = round(d / 7)
            if x >= 4: return 'almost a month', '4 WEEKS'
            return one(x, 'week'), f'{x} WEEK' + ('S' if x > 1 else '')
        if d < 365: x = min(11, max(1, round(d / 30.4))); return one(x, 'month'), f'{x} MONTH' + ('S' if x > 1 else '')
        x = int(d // 365); return ('over a year' if x == 1 else f'over {x} years'), f'{x}+ YEAR' + ('S' if x > 1 else '')
    X = {'US': 'Nobody can invade the United States.', 'UA': 'And in real life... it has lasted years.', 'AF': 'The graveyard of empires.',
         'CH': 'Mountains, bunkers, and 200,000 reservists.', 'FI': '', 'IL': '', 'VA': 'The smallest country on Earth.',
         'SG': 'Tiny, but armed to the teeth.', 'KP': ''}
    T = {'VA': 'Hours? We have 135 guards... and God.', 'LU': 'One day? We would still be stuck in traffic.',
         'CH': 'Bunkers for every single citizen. Good luck.', 'FI': 'We held off the Soviets in 1939. Ask them.',
         'UA': 'A simulation? We have been doing it for real since 2022.', 'AF': 'Empires come here to die. Ask the British, the Soviets... and the Americans.',
         'VN': 'Ask France and America how that went.', 'IL': 'Small country. Very, very big army.', 'KP': 'Invade us? Our nukes say hello.',
         'IS': 'No army at all... but NATO would show up.', 'US': 'Invade America? Good luck crossing the ocean.'}
    C = []
    for c in ORDER:
        n = EN[c]; d = days[c]
        if c in NUKES:
            st, v, vs = 'E', 'NEVER', 'NEVER'; say = f'{n}: never! Nuclear weapons.'; sub = 'Nuclear power · would never fall'
        else:
            hs, hv = human(d)
            st = 'A' if d < 1 else 'B' if d < 7 else 'C' if d < 30 else 'D' if d < 365 else 'E'
            say = f'{n}: {hs}.'; v = hv; vs = hv.replace(' HOURS', 'H').replace(' HOUR', 'H').replace(' DAYS', 'D').replace(' DAY', 'D').replace(' WEEKS', 'W').replace(' WEEK', 'W').replace(' MONTHS', 'M').replace(' MONTH', 'M').replace(' YEARS', 'Y').replace(' YEAR', 'Y')
            sub = 'Simulation · army, reserves, budget, size, population'
        if X.get(c): say += ' ' + X[c]
        if c == 'US': say = 'United States: never! Nuclear weapons... and nobody can invade the United States.'
        C.append(dict(c=c, st=st, v=v, vs=vs, sub=sub, say=say))
    cfg = dict(title='HOW LONG WOULD IT LAST?', icon='clock', t1='HOW LONG WOULD', t2='EVERY COUNTRY LAST?', badge='SIMULATION · 197 COUNTRIES',
               cats=cats, balls=['VA', 'LU', 'CH', 'UA', 'AF', 'US'], ballMoods=['sad', 'sad', 'happy', 'angry', 'angry', 'angry'],
               best=['UA', 'LASTS THE LONGEST', '2+ YEARS'], worst=['VA', 'FALLS FIRST', '<1 HOUR'], ask='HOW LONG WOULD YOU LAST? COMMENT!')
    intro = ["If the world's strongest army invaded tomorrow... how long would each country last? This is a simulation: we scored every country on soldiers, reserves, budget, size and population. Nuclear powers? They never fall.",
             'Red: less than a day.', 'Orange: less than a week.', 'Yellow: less than a month.', 'Green: less than a year.', "And purple... more than a year, or never! Let's go!"]
    outro = ['How long would your country last? Comment below!']
    return dict(key='last', C=C, T=T, cfg=cfg, intro=intro, outro=outro, days=days)

# ------------------------------------------------ 5 · BIGGEST RIVAL
def riv():
    cats = [cat('X', 'NO RIVAL', 'NONE', 'X', 'happy'), cat('A', '1 – 4 CLASHES', '1-4', 'G', 'curious'), cat('B', '5 – 9 CLASHES', '5-9', 'Y', 'angry'),
            cat('C', '10 – 19 CLASHES', '10+', 'O', 'angry'), cat('D', '20 – 39 CLASHES', '20+', 'R', 'angry'), cat('E', '40+ CLASHES', '40+', 'P', 'angry')]
    X = {'US': '', 'GR': '', 'IL': '', 'IN': '', 'KP': '', 'SY': 'Israel... forty-one times.'}
    T = {'US': 'Russia. Sixty standoffs, and counting.', 'RU': 'America, of course.', 'IN': 'Pakistan. Next question.', 'PK': 'India, obviously!',
         'GR': 'Turkey. Forty-nine times!', 'TR': "Greece... we're neighbors, it's complicated.", 'KR': 'Guess who. North Korea.',
         'IL': 'Syria. Forty-one times.', 'FR': 'Germany... but now we are best friends.', 'CL': 'Argentina. Of course, Argentina.',
         'CN': 'Russia. Yes, really. Look it up.'}
    C = []; k0 = 0
    for c in ORDER:
        d = COW[c]; n = EN[c]; r = d['rival']; x = d['rival_n']
        if not r:
            k0 += 1; st = 'X'; say = f'{n}: {["no rival at all!", "no enemies. Zero clashes!", "nobody! Totally peaceful."][k0 % 3]}'
            v, vs, sub, rv = 'NO RIVAL', '—', 'No military clashes on record', None
        else:
            st = 'A' if x < 5 else 'B' if x < 10 else 'C' if x < 20 else 'D' if x < 40 else 'E'
            say = f'{n}: {EN[r]}! ' + ('One clash.' if x == 1 else f'{x} clashes.')
            v = EN[r].upper(); vs = EN[r]; sub = f'{x} military clash' + ('es' if x != 1 else '') + ' since 1816'; rv = r
        C.append(dict(c=c, st=st, v=v, vs=vs, sub=sub, say=say, rv=rv))
    cfg = dict(title='EVERY COUNTRY\'S RIVAL', icon='swords', t1='EVERY COUNTRY\'S', t2='BIGGEST RIVAL', badge='EVERY MILITARY CLASH SINCE 1816',
               cats=cats, balls=['US', 'RU', 'IN', 'PK', 'GR', 'TR'], ballMoods=['angry'] * 6,
               best=['US', 'BIGGEST RIVALRY', 'VS RUSSIA · 60'], worst=['IN', 'FIERCEST NEIGHBORS', 'VS PAKISTAN · 40'], ask='WHO IS YOUR RIVAL? COMMENT!')
    intro = ["Every country has that one enemy it just can't stop clashing with. Using every military standoff since 1816, here is every country's biggest rival. 197 countries, one by one.",
             'Grey: no rival at all.', 'Green: up to four clashes.', 'Yellow: up to nine.', 'Orange: up to nineteen.', 'Red: up to thirty-nine.', "And purple... forty or more! Let's go!"]
    outro = ["Who is your country's real rival? Comment below!"]
    return dict(key='riv', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

# ------------------------------------------------ 6 · WHO WOULD DEFEND YOU
NATO = set('US CA GB FR DE IT ES PT NL BE LU DK NO IS PL CZ SK HU SI HR AL ME MK GR BG RO LT LV EE TR FI SE'.split())
USTREATY = {c: 'US treaty' for c in 'JP KR PH TH AU MH FM PW'.split()}
RIO = set('AR BS BR CL CO CR DO SV GT HT HN PA PY PE TT UY'.split())
RUCN = {'BY': 'CSTO + Union with Russia', 'KZ': 'CSTO (Russia)', 'KG': 'CSTO (Russia)', 'TJ': 'CSTO (Russia)', 'RU': 'CSTO + North Korea', 'CN': 'Treaty with North Korea', 'KP': 'Treaties with China and Russia'}
ARAB = set('EG SA AE QA BH KW OM JO IQ SY LB YE DZ MA TN LY SD SO DJ KM MR PS'.split())
ECOWAS = set('BJ CV CI GM GH GN GW LR NG SN SL TG'.split()); AES = set('ML BF NE'.split())
SADC = set('AO BW CD SZ LS MG MW MU MZ NA SC ZA TZ ZM ZW'.split())
EUCL = set('AT IE CY MT'.split())
BRO = {'MC': 'France', 'AD': 'France and Spain', 'BT': 'India', 'BN': 'United Kingdom', 'TV': 'Australia', 'NR': 'Australia', 'WS': 'New Zealand',
       'SB': 'Australia', 'PG': 'Australia', 'XK': 'NATO troops (KFOR)', 'SM': 'Italy', 'VA': 'Italy', 'NZ': 'Australia'}
def ally_of(c):
    if c in NATO: return 'N', 'NATO', '31 allies by treaty (Article 5)'
    if c in USTREATY: return 'U', 'USA', 'Defense treaty with the United States'
    if c in RIO: return 'U', 'RIO TREATY', 'Rio Treaty, with the United States'
    if c in RUCN: return 'K', {'CN': 'N. KOREA', 'KP': 'RUSSIA + CHINA', 'RU': 'CSTO'}.get(c, 'RUSSIA'), RUCN[c]
    if c in BRO: return 'B', BRO[c].upper() if len(BRO[c]) < 14 else BRO[c].split(' (')[0].upper(), f'Protected by {BRO[c]}'
    if c in EUCL: return 'G', 'EU CLAUSE', 'EU mutual defense clause'
    if c == 'AZ': return 'G', 'TURKEY', 'Shusha Declaration with Turkey'
    if c == 'PK': return 'G', 'SAUDI ARABIA', 'Mutual defense pact with Saudi Arabia (2025)'
    if c in ARAB: return 'G', 'ARAB LEAGUE', 'Arab League joint defense treaty'
    if c in ECOWAS: return 'G', 'ECOWAS', 'ECOWAS mutual defense protocol'
    if c in AES: return 'G', 'SAHEL ALLIANCE', 'Alliance of Sahel States'
    if c in SADC: return 'G', 'SADC', 'SADC mutual defense pact'
    if c in ('MY', 'SG'): return 'G', 'FIVE POWERS', 'Five Power Defence Arrangements'
    return 'A', 'ALONE', 'No mutual defense treaty'
def ally():
    cats = [dict(k='N', label='NATO', short='NATO', col='#5b5bf0', cold='#3030a8', mood='happy'),
            dict(k='U', label='USA TREATY', short='USA', col='#2ec4b6', cold='#178c82', mood='happy'),
            dict(k='K', label='RUSSIA / CHINA', short='RU/CN', col='#e63946', cold='#9a1d28', mood='angry'),
            dict(k='G', label='REGIONAL PACT', short='PACT', col='#ffd23f', cold='#b38e00', mood='happy'),
            dict(k='B', label='BIG NEIGHBOR', short='NEIGHBOR', col='#2fbf63', cold='#17803d', mood='happy'),
            dict(k='A', label='ALONE', short='ALONE', col='#8f86a8', cold='#5c5475', mood='sad')]
    SAY = {'N': ['NATO. Thirty-one allies would come!', 'NATO!', 'NATO. Article Five.'], 'U': ['the United States!', 'a treaty with America.'],
           'K': None, 'G': None, 'B': None, 'A': ['nobody. Completely alone!', 'alone!', 'no one!']}
    X = {'UA': 'Not in NATO... yet.', 'TW': 'Officially, nobody.', 'AM': 'It froze its Russian alliance.',
         'IE': 'Neutral... but in the EU.', 'CH': 'Neutral since 1815.', 'MX': 'It left the Rio Treaty in 2002.', 'IN': 'Never joins alliances.',
         'IR': 'Close to Russia... but no treaty.', 'RS': 'Officially neutral.', 'NZ': ''}
    T = {'US': 'NATO. An attack on one is an attack on all.', 'PL': 'NATO. And soon, the strongest army in Europe.',
         'CH': 'Neutral since 1815. We defend ourselves.', 'UA': 'No treaty. We defend ourselves.', 'TW': 'Officially? Nobody. Unofficially... we will see.',
         'JP': 'The United States. By treaty, since 1960.', 'KP': 'Russia AND China. Lucky me.', 'IL': 'No treaty. Just very good friends in Washington.',
         'IN': 'No alliances. We never needed them.', 'MC': 'France has our back. Always.', 'AM': "We were in Russia's alliance... we froze it."}
    C = []; cnt = {}
    for c in ORDER:
        n = EN[c]; st, v, sub = ally_of(c); cnt[st] = cnt.get(st, 0) + 1
        if st == 'K': say = f'{n}: ' + ('Russia!' if c not in ('CN', 'KP') else 'North Korea!' if c == 'CN' else 'Russia AND China!')
        elif st == 'G': say = f'{n}: the {v.title().replace("Ecowas", "ECOWAS").replace("Sadc", "SADC").replace("Eu ", "EU ")}!' if v not in ('TURKEY', 'SAUDI ARABIA') else f'{n}: {v.title()}!'
        elif st == 'B': say = f'{n}: {BRO[c]}!'
        else: opts = SAY[st]; say = f'{n}: {opts[cnt[st] % len(opts)]}'
        if c in RIO: say = f'{n}: the Rio Treaty, with America.'
        OV = {'RU': 'Russia: Belarus, its Central Asian allies... and North Korea!', 'XK': 'Kosovo: NATO peacekeepers!', 'IL': 'Israel: no treaty... but very good friends in Washington.'}
        if c in OV: say = OV[c]
        say = say.replace('the EU Clause!', 'the EU defense clause!').replace('the ECOWAS!', 'ECOWAS!').replace('the SADC!', 'the SADC pact!')
        if X.get(c): say += ' ' + X[c]
        C.append(dict(c=c, st=st, v=v, vs=v.title() if len(v) > 4 else v, sub=sub, say=say))
    cfg = dict(title='WHO WOULD DEFEND YOU?', icon='shield', t1='WHO WOULD', t2='DEFEND YOU?', badge='REAL TREATIES · 197 COUNTRIES',
               cats=cats, balls=['US', 'PL', 'UA', 'TW', 'KP', 'CH'], ballMoods=['happy', 'happy', 'sad', 'sad', 'angry', 'happy'],
               best=['PL', 'BEST PROTECTED', 'NATO · 31 ALLIES'], worst=['UA', 'ON ITS OWN', 'NO TREATY'], ask='WHO WOULD DEFEND YOU? COMMENT!')
    intro = ['If your country got attacked tomorrow... who would actually come to help? Real treaties only. 197 countries, one by one.',
             'Indigo: NATO.', 'Teal: a treaty with the United States.', 'Red: Russia or China.', 'Yellow: a regional pact.', 'Green: a bigger neighbor protects them.',
             "And grey... completely alone. Let's go!"]
    outro = ['Would anyone defend your country? Comment below!']
    return dict(key='ally', C=C, T=T, cfg=cfg, intro=intro, outro=outro)

VIDEOS = dict(sol=sol, los=los, mil=mil, last=last, riv=riv, ally=ally)
if __name__ == '__main__':
    from collections import Counter
    tot = 0
    for k, f in VIDEOS.items():
        V = f(); V['names'] = {c: EN[c] for c in ORDER}
        n = sum(len(c['say']) for c in V['C']) + sum(len(x) for x in V['intro'] + V['outro']) + sum(len(t) for t in V['T'].values())
        tot += n
        print(k, n, dict(Counter(c['st'] for c in V['C'])))
        V.pop('days', None)
        json.dump(V, open(R + f'{k}_script.json', 'w'), ensure_ascii=False, indent=0)
    print('TOTAL chars', tot)
