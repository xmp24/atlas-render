# Guerras ganadas/perdidas (COW Inter-State War v4.0, 1816-2007) y rival con más MIDs (MIDB 5.0, 1816-2014) por ISO2
import csv, io, json, collections, sys
import country_converter as coco
sys.path.insert(0, '/home/claude/atlas-render/mcd'); from data import ORDER
cc = coco.CountryConverter()
FIX = {255: 'DE', 260: 'DE', 245: 'DE', 267: 'DE', 269: 'DE', 271: 'DE', 273: 'DE', 275: 'DE', 280: 'DE',
       300: 'AT', 345: 'RS', 347: 'XK', 315: 'CZ', 365: 'RU', 640: 'TR', 678: 'YE', 680: 'YE', 816: 'VN',
       325: 'IT', 327: 'VA', 329: 'IT', 332: 'IT', 335: 'IT', 337: 'IT', 713: 'TW', 730: 'KR', 240: 'DE', 679: 'YE', 316: 'CZ', 732: 'KR', 731: 'KP', 710: 'CN'}
SKIP = {265, 817, 390.5}
memo = {}
def iso(c):
    c = int(c)
    if c in FIX: return FIX[c]
    if c in SKIP: return None
    if c not in memo:
        r = cc.convert(c, src='GWcode', to='ISO2', not_found=None)
        memo[c] = r if isinstance(r, str) and len(r) == 2 else None
    return memo[c]
txt = open('/root/warsrc/isw.csv', encoding='latin-1').read().replace('\r\n', '\n').replace('\r', '\n')
rows = list(csv.DictReader(io.StringIO(txt)))
fought = collections.defaultdict(set); won = collections.defaultdict(set); lost = collections.defaultdict(set); names = {}; deaths = collections.Counter()
for r in rows:
    k = iso(r['ccode']);
    if not k: continue
    names[r['WarNum']] = r['WarName']
    try: deaths[r['WarNum']] += max(0, int(r['BatDeath']))
    except: pass
    fought[k].add(r['WarNum'])
    if r['Outcome'] == '1': won[k].add(r['WarNum'])
    if r['Outcome'] == '2': lost[k].add(r['WarNum'])
# después de 2007 (añadidos a mano, guerras entre estados con resultado claro)
won['RU'].add('X2008'); fought['RU'].add('X2008'); fought['GE'].add('X2008'); fought['AZ'].add('X2020'); fought['AM'].add('X2020'); fought['UA'].add('X2022'); fought['RU'].add('X2022'); lost['GE'].add('X2008'); names['X2008'] = 'Russo-Georgian War (2008)'
won['AZ'].add('X2020'); lost['AM'].add('X2020'); names['X2020'] = 'Second Nagorno-Karabakh War (2020)'
for k in won: lost[k] -= won[k]   # si cambió de bando, no cuenta doble
# MIDs: rival
M = list(csv.DictReader(open('/root/warsrc/midb.csv')))
disp = collections.defaultdict(list)
for r in M:
    k = iso(r['ccode'])
    if k: disp[r['dispnum']].append((k, r['sidea']))
pair = collections.defaultdict(collections.Counter)
for d, ps in disp.items():
    seen = set()
    for a, sa in ps:
        for b, sb in ps:
            if sa != sb and a != b and (a, b) not in seen:
                seen.add((a, b)); pair[a][b] += 1
out = {}
for c in ORDER:
    top = pair[c].most_common(3)
    big = max(lost[c], key=lambda w: deaths[w]) if lost[c] else None
    out[c] = dict(fought=len(fought[c]), big=names[big] if big else None, won=len(won[c]), lost=len(lost[c]), lost_names=sorted(names[w] for w in lost[c])[:6],
                  rival=top[0][0] if top else None, rival_n=top[0][1] if top else 0, top3=top, mids=sum(pair[c].values()))
json.dump(out, open('cow.json', 'w'), indent=0)
L = sorted(out.items(), key=lambda x: -x[1]['lost'])
print('más perdidas', [(k, v['lost'], v['won']) for k, v in L[:15]])
print('cero perdidas', sum(1 for v in out.values() if v['lost'] == 0), '· nunca en guerra', sum(1 for v in out.values() if v['lost'] + v['won'] == 0))
print('sin rival', [k for k, v in out.items() if not v['rival']])
for k in ['US', 'GB', 'FR', 'RU', 'CN', 'IN', 'PK', 'GR', 'TR', 'AR', 'CL', 'PE', 'MX', 'ES', 'VA', 'IL', 'EG', 'IR', 'IQ']: print(k, out[k]['won'], out[k]['lost'], out[k]['rival'], out[k]['rival_n'], out[k]['lost_names'][:3])
