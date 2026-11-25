# "Countries that once controlled X": India, Indonesia, USA
import sys, math
import geo, sb
from geo import C, P, H

def controlled(name, target, tname, intro_cam, items, bpm=90, card_after=1, flag_target=None):
    """huecos exactos de 'Countries that Once Controlled India' (14.28 s)"""
    V = sb.Video(name, bpm, b0=0.1)
    SL = [(1.00, 3.03), (3.72, 6.43), (6.43, 9.15), (9.15, 11.80), (11.80, 14.280)]
    assert len(items) == 5, name
    sc = V.scene(0, 1.0, [(0, *intro_cam[:2], intro_cam[2] * 1.12), (1.0, *intro_cam)], wo=[0, -1])
    sc.layer(target, flag_target, 0, a='pop', ad=0.2)
    from shapely.ops import nearest_points
    for i, (title, fl, home, part, ch, ct) in enumerate(items):
        t, t1 = SL[i]; d = t1 - t; last = i == 4
        keys = [(t, *ch[:2], ch[2] * 1.06), (t + 0.42 * d, *ch), (t + 0.68 * d, *ct), (t1, ct[0], ct[1], ct[2] * (0.95 if not last else 0.9))]
        sc = V.scene(t, t1, keys, wo=None if last else [1 if i % 2 == 0 else -1, 0])
        sc.outline(target, t, stroke='#ffffff', sw=3.2, op=0.95)
        sc.layer(home, fl, t + 0.02, a='pop', ad=0.2, sh=1)
        near = home.distance(part) < 0.5
        o = sb.centroid(home) if near else (lambda p: (p.x, p.y))(nearest_points(part, home)[0])
        tr = t + 0.42 * d
        if near: sc.layer(home.union(part), fl, tr, a='reveal', o=o, ad=0.42 * d)
        else: sc.layer(part, fl, t + 0.45 * d, a='reveal', o=o, ad=0.35 * d)
        pc = sb.pct(part, target)
        tp = t + (1.35 if i == 0 else 1.5)
        V.text(title, t + 0.03, t1 - 0.02, y=230, size=150)
        V.text(f'{pc:.2f}% of {tname}', tp, t1 - 0.02, y=395, size=76, col='#9ad6f2', k='pct', cnt=[0, pc, tp, 0.6], suf=f'% of {tname}')
        print(f'  {title}: {pc:.2f}%')
        if i == 0:
            t, tc = 3.03, 3.72
            sc2 = V.scene(t, tc, [(t, ct[0], ct[1], ct[2] * 0.95), (tc, ct[0], ct[1], ct[2] * 0.85)], wo=[0, 1])
            sc2.outline(target, t, stroke='#ffffff', sw=3.2, op=0.6)
            V.dark.append([t, tc])
            V.text(f'COUNTRIES THAT ONCE\nCONTROLLED {tname.upper()}', t, tc, y=800, size=118, k='card')
    V.dur = 14.280
    V.music = 'sh/music/ref_india.wav'
    V.save()
    return V

if __name__ == '__main__':
    which = sys.argv[1:] or ['ctl_in', 'ctl_id', 'ctl_us']
    EUR = geo.BOX(-11, 35, 30, 60)
    if 'ctl_id' in which:
        ID = C('IDN')
        java = P('ID', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Jakarta Raya', 'Banten', 'Yogyakarta', 'Bengkulu')
        items = [
            ('SPAIN', 'spain_old', C('ESP').intersection(EUR), P('ID', 'Maluku Utara').intersection(geo.BOX(127.2, 0.55, 127.6, 0.95)), (-4, 40, 26), (118, -2, 46)),
            ('PORTUGAL', 'portugal_old', C('PRT').intersection(EUR), P('ID', 'Nusa Tenggara Timur').intersection(geo.BOX(121.6, -10.5, 125.2, -8.0)), (-8, 39.5, 24), (118, -2, 46)),
            ('GREAT BRITAIN', 'gb', C('GBR').intersection(EUR), java, (-3, 54, 26), (115, -3, 44)),
            ('JAPAN', 'japan_rs', C('JPN'), ID.difference(P('ID', 'Papua').intersection(geo.BOX(137.5, -9.5, 141.2, -3.8))), (137, 37, 26), (118, -2, 46)),
            ('NETHERLANDS', 'voc', C('NLD').intersection(EUR), ID, (5, 52, 24), (118, -2, 46)),
        ]
        controlled('ctl_id', ID, 'Indonesia', (118, -2, 46), items, bpm=90, flag_target='id')
    if 'ctl_us' in which:
        US = C('USA')
        st = lambda *n: P('US', *n)
        louisiana = st('Louisiana', 'Arkansas', 'Missouri', 'Iowa', 'Oklahoma', 'Kansas', 'Nebraska', 'South Dakota', 'North Dakota').union(st('Montana').intersection(geo.BOX(-112, 40, -100, 50))).union(st('Wyoming').intersection(geo.BOX(-110, 40, -100, 46))).union(st('Colorado').intersection(geo.BOX(-106, 36, -100, 42))).union(st('Minnesota').intersection(geo.BOX(-98, 43, -93.3, 50)))
        east = [n for p, g in geo.a1() if p['iso_a2'] == 'US' for n in [p['name']]]
        eastg = geo.unary_union([g for p, g in geo.a1() if p['iso_a2'] == 'US' and g.representative_point().x > -91.5 and p['name'] not in ('Louisiana',)]).union(st('Minnesota').difference(geo.BOX(-98, 43, -93.3, 50)))
        mex = st('California', 'Nevada', 'Utah', 'Arizona', 'New Mexico', 'Texas').union(st('Colorado').intersection(geo.BOX(-110, 36, -106, 42))).union(st('Wyoming').intersection(geo.BOX(-112, 41, -106.5, 42.5)))
        france = louisiana.union(st('Illinois', 'Indiana', 'Michigan', 'Wisconsin', 'Ohio', 'Mississippi')).union(st('Minnesota'))
        spain = louisiana.union(mex).union(st('Florida')).union(st('Alabama', 'Mississippi').intersection(geo.BOX(-89.8, 30, -85, 31.2)))
        items = [
            ('SWEDEN', 'se', C('SWE'), st('Delaware').intersection(geo.BOX(-75.8, 39.3, -75.3, 39.85)).union(st('Pennsylvania').intersection(geo.BOX(-75.5, 39.82, -75.1, 40.05))), (16, 61, 22), (-96, 39, 58)),
            ('RUSSIA', 'rac', C('RUS').intersection(geo.BOX(27, 41, 180, 82)), st('Alaska'), (90, 62, 110), (-150, 58, 70)),
            ('MEXICO', 'mexico_old', C('MEX'), mex, (-102, 23, 30), (-102, 37, 52)),
            ('FRANCE', 'france_old', C('FRA').intersection(EUR), france, (2, 46.5, 22), (-96, 39, 58)),
            ('SPAIN', 'spain_old', C('ESP').intersection(EUR), spain, (-4, 40, 22), (-98, 37, 60)),
        ]
        controlled('ctl_us', US, 'USA', (-98, 40, 58), items, bpm=90, flag_target='us')
    if 'ctl_in' in which:
        IN = C('IND')
        ghurid_in = P('IN', 'Punjab', 'Haryana', 'Delhi', 'Chandigarh', 'Uttar Pradesh', 'Bihar', 'Uttarakhand', 'Himachal Pradesh', 'West Bengal').union(P('IN', 'Rajasthan').intersection(geo.BOX(70, 26, 80, 32)))
        items = [
            ('PORTUGAL', 'pt', C('PRT').intersection(geo.BOX(-10, 36.5, -6, 42.5)), P('IN', 'Goa', 'Dadra and Nagar Haveli and Daman and Diu'), (-8, 39.5, 9), (76, 21, 30)),
            ('AFGHANISTAN', 'durrani', C('AFG'), P('IN', 'Jammu and Kashmir', 'Punjab', 'Chandigarh').union(P('IN', 'Haryana').intersection(geo.BOX(74, 29.6, 78, 31))), (66, 34, 16), (76, 23, 30)),
            ('GHURIDS', 'ghurid', C('AFG').union(C('PAK')), ghurid_in, (66, 32, 22), (78, 24, 30)),
            ('MUGHALS', 'mughal', P('IN', 'Delhi', 'Haryana', 'Uttar Pradesh'), H('1700', 'Mughal Empire').intersection(IN), (78, 27, 18), (79, 22, 31)),
            ('GREAT BRITAIN', 'gb', P('IN', 'West Bengal'), IN.difference(P('IN', 'Goa', 'Dadra and Nagar Haveli and Daman and Diu', 'Puducherry')), (88, 23, 14), (79, 22, 31)),
        ]
        controlled('ctl_in', IN, 'India', (79, 22, 29), items, bpm=90, flag_target='in')
