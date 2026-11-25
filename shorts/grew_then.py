# "Countries that grew the fastest" y "Countries then vs today"
import sys, math
import geo, sb
from geo import C, P, H, BOX
from shapely.geometry import Point

def frame(g, fill=1.35, mn=6, mx=120):
    x0, y0, x1, y1 = g.bounds
    mx0, my0 = geo.merc(x0, y0); mx1, my1 = geo.merc(x1, y1)
    w = max((mx1 - mx0) * fill, (my1 - my0) * fill * 1080 / 1920 * 1.1, mn)
    return ((x0 + x1) / 2, geo.imerc((my0 + my1) / 2), min(w, mx))

def grew():
    V = sb.Video('grew', 117, b0=0.1); B = 60 / 117
    alex = H('bc323', 'Empire of Alexander')
    mongol27 = C('MNG').union(H('1200', 'Kara Khitai Khaganate', 'Khwarazmian dynasty', 'Xixia', 'Mongol Empire')).union(P('CN', 'Inner Mongol', 'Beijing', 'Tianjin', 'Hebei', 'Shanxi', 'Liaoning'))
    ach = H('bc500', 'Achaemenid Empire')
    inca = H('1500', 'Inca Empire')
    tim = H('1400', 'Timurid Empire')
    E = [
        ('MACEDONIAN EMP.', '(11 Year Campaign)', 'macedon', alex, [C('GRC', 'MKD', 'BGR', 'ALB'), C('TUR'), C('SYR', 'LBN', 'ISR', 'PSE', 'JOR', 'EGY', 'LBY'), C('IRQ', 'IRN', 'KWT'), C('AFG', 'TKM', 'UZB', 'TJK', 'PAK', 'IND')]),
        ('MONGOL EMP.', '(21 Year Campaign)', 'mongol', mongol27, [C('MNG'), P('CN', 'Inner Mongol', 'Beijing', 'Tianjin', 'Hebei', 'Shanxi', 'Liaoning'), H('1200', 'Xixia', 'Kara Khitai Khaganate'), H('1200', 'Khwarazmian dynasty')]),
        ('ACHAEMENID EMP.', '(25 Year Campaign)', 'achaemenid', ach, [C('IRN'), C('TUR', 'ARM', 'AZE', 'GEO'), C('IRQ', 'SYR', 'LBN', 'ISR', 'PSE', 'JOR', 'KWT'), C('AFG', 'TKM', 'UZB', 'TJK', 'PAK'), C('EGY', 'LBY', 'SDN', 'GRC', 'BGR', 'MKD')]),
        ('INCA EMP.', '(55 Year Campaign)', 'inca', inca, [P('PE', 'Cusco', 'Apurímac'), C('PER'), C('BOL'), C('ECU', 'COL'), C('CHL', 'ARG')]),
        ('TIMURID EMP.', '(35 Year Campaign)', 'timurid', tim, [C('UZB', 'TJK', 'KGZ'), C('AFG', 'TKM'), C('IRN'), C('IRQ', 'AZE', 'ARM', 'GEO', 'SYR'), C('TUR', 'PAK', 'IND', 'KAZ')]),
    ]
    t = 0.0
    # gancho: imperio mongol ya completo + título en el centro
    hook = H('1279', 'Great Khanate', 'Khanate of the Golden Horde', 'Ilkhanate', 'Chagatai Khanate')
    cx, cy, w = frame(hook, 1.15)
    th = 3.10
    sc = V.scene(0, th, [(0, cx, cy, w * 0.8), (th, cx, cy, w * 0.72)], wo=[-1, 0])
    sc.layer(hook, 'mongol', 0, a='pop', ad=0.1, wt=2.0)
    V.text('MONGOL EMP.', 0, 2.07, y=220, size=140)
    V.text('COUNTRIES THAT\nGREW THE FASTEST', 2.07, th - 0.03, y=840, size=112, k='card')
    V.dark.append([2.07, th])
    t = th
    E = [e for e in E if e[0] != 'MONGOL EMP.']
    SLOTS = [(3.10, 7.20), (7.20, 11.25), (11.25, 15.50), (15.50, 20.457)]
    for i, (name, sub, fl, final, groups) in enumerate(E):
        t, t1 = SLOTS[i]; B = (t1 - t) / 8
        stages = []; acc = None
        for g in groups:
            acc = g if acc is None else acc.union(g)
            s = final.intersection(acc.buffer(0.05))
            if not s.is_empty and s.area > 0.05: stages.append(s)
        stages[-1] = final
        c0 = frame(stages[0], 2.0, mn=8); cf = frame(final, 1.12)
        last = i == len(E) - 1
        keys = [(t, c0[0], c0[1], c0[2] * 1.05), (t + 1.2 * B, c0[0], c0[1], c0[2]), (t + 6.0 * B, *cf), (t1, cf[0], cf[1], cf[2] * (0.92 if not last else 0.85))]
        sc = V.scene(t, t1, keys, wo=None if last else [(-1) ** i, 0])
        o = stages[0].representative_point()
        sc.layer(stages[0], fl, t, a='pop', ad=0.18, wt=t1 - 0.9 * B if not last else None)
        n = len(stages) - 1
        for k, s in enumerate(stages[1:]):
            ts = t + B * (1.0 + 4.8 * k / max(n, 1))
            sc.layer(s, fl, ts, a='reveal', o=(o.x, o.y), ad=B * 1.5, wt=t1 - 0.9 * B if not last else None)
        V.text(name, t, t1 - 0.03, y=220, size=140)
        V.text(sub, t + 2.1, t1 - 0.03, y=372, size=86, k='sub')
    V.dur = 20.457
    V.music = 'sh/music/ref_grew.wav'
    V.save()

def then(name, items, bpm=112):
    """huecos exactos de 'Countries Then VS Today' (23.15 s)"""
    V = sb.Video(name, bpm, b0=0.1)
    TOD = [(0.0, 1.02), (1.02, 2.20), (2.20, 3.37), (3.37, 4.45)]
    THEN = [(6.50, 10.72), (10.72, 14.98), (14.98, 19.20), (19.20, 23.150)]
    for i, (nm, ft, gt, fth, gth) in enumerate(items):
        t, t1 = TOD[i]; d = t1 - t
        cx, cy, w = frame(gt, 1.6, mn=7)
        sc = V.scene(t, t1, [(t, cx, cy, w * 1.06), (t1, cx, cy, w * 0.96)], wo=[(-1) ** i, 0])
        sc.layer(gt, None, t, a='pop', ad=0.12, fill='#f2f2ef', sh=1)
        sc.layer(gt, ft, t + d * 0.45, a='wipe', ad=d * 0.3)
        V.text(nm, t, t1 - 0.02, y=220, size=140, k='scramble', sd=d * 0.42)
    t, tc = 4.45, 6.50
    sc = V.scene(t, tc, [(t, -5, 28, 165), (tc, -5, 28, 140)], wo=[0, 1])
    for (nm, ft, gt, fth, gth) in items: sc.layer(gt, ft, t, a='pop', ad=0.1)
    V.text('COUNTRIES THEN\nVS TODAY', t, tc - 0.03, y=860, size=150, k='card')
    V.text('Comment and Subscribe your Country\nand it may get featured next!', t + 0.55, tc - 0.03, y=1190, size=50, k='sub')
    for i, (nm, ft, gt, fth, gth) in enumerate(items):
        t, t1 = THEN[i]
        cx, cy, w = frame(gth, 1.0, mn=10)
        last = i == len(items) - 1
        sc = V.scene(t, t1, [(t, cx, cy, w * 1.0), (t1, cx, cy, w * 0.84)], wo=None if last else [(-1) ** i, 0.3])
        sc.layer(gth, fth, t, a='pop', ad=0.2)
    V.dur = 23.150
    V.music = 'sh/music/ref_thenvs.wav'
    V.save()

if __name__ == '__main__':
    which = sys.argv[1:] or ['grew', 'then_a', 'then_b']
    if 'grew' in which: grew()
    if 'then_a' in which:
        then('then_a', [
            ('ITALY', 'it', C('ITA'), 'roman', H('bc1', 'Roman Empire')),
            ('MONGOLIA', 'mn', C('MNG'), 'mongol', H('1279', 'Great Khanate', 'Khanate of the Golden Horde', 'Ilkhanate', 'Chagatai Khanate')),
            ('IRAN', 'ir', C('IRN'), 'achaemenid', H('bc500', 'Achaemenid Empire')),
            ('PERU', 'pe', C('PER'), 'inca', H('1500', 'Inca Empire')),
        ])
    if 'then_b' in which:
        serbia = C('SRB', 'KOS', 'MNE', 'MKD', 'ALB').union(P('GR', 'Ipeiros', 'Thessalia', 'Dytiki Makedonia', 'Kentriki Makedonia').intersection(BOX(19, 38.9, 23.9, 42)))
        then('then_b', [
            ('POLAND', 'pl', C('POL'), 'commonwealth', H('1650', 'Polish–Lithuanian Commonwealth')),
            ('DENMARK', 'dk', C('DNK').intersection(BOX(7, 54, 16, 58)), 'denmark_norway', H('1700', 'Denmark-Norway').intersection(BOX(4, 53, 33, 72))),
            ('AUSTRIA', 'at', C('AUT'), 'austria_hungary', H('1900', 'Austria Hungary')),
            ('SERBIA', 'rs', C('SRB'), 'serbian_emp', serbia),
        ])
