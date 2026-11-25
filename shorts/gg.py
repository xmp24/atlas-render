# "<Imperio> GG EZ": conquistas al ritmo, como el vídeo del Imperio otomano
import sys, math
import geo, sb
from geo import C, P, H, BOX
from shapely.ops import nearest_points
from shapely.geometry import Point

def ggez(name, emp_flag, emb, emb_col, core, core_year, steps, final=None, bpm=129, minw=18, maxw=60, emb_c2=None, badge='#1f6b35'):
    V = sb.Video(name, bpm, b0=0.05)
    B = 60 / bpm
    keys = []
    t = 0.0
    emp = core
    prev_layer = None
    prev_year = core_year
    # huecos exactos del vídeo de referencia (Ottoman Empire GG EZ, 17.14 s)
    SL = [(0.0, 1.92), (1.92, 3.80), (3.80, 5.70), (5.70, 7.45), (7.45, 8.52), (8.52, 9.45), (9.45, 10.40), (10.40, 11.35), (11.35, 12.28), (12.28, 13.22), (13.22, 15.05)]
    assert len(steps) == len(SL), (name, len(steps))
    plan = [(a0, a1) for a0, a1 in SL]
    ts_end, tend = 15.05, 17.136
    def camfor(g, ctx=None, k=0.12, fill=2.8, mn=None):
        x0, y0, x1, y1 = g.bounds
        mx0, my0 = geo.merc(x0, y0); mx1, my1 = geo.merc(x1, y1)
        w = max((mx1 - mx0) * fill, (my1 - my0) * fill * 1080 / 1920 * 1.15, mn if mn else minw)
        w = min(w, maxw)
        cx, cy = (x0 + x1) / 2, geo.imerc((my0 + my1) / 2)
        if ctx is not None: cx, cy = cx * (1 - k) + ctx[0] * k, cy * (1 - k) + ctx[1] * k
        return (cx, cy, w)
    for i, st in enumerate(steps):
        ts, te = plan[i]
        g = st['g']; nb = 4 if te - ts > 1.5 else 2
        ec = emp.representative_point()
        cx, cy, w = camfor(g, (ec.x, ec.y))
        dx, dy = (1 if i % 2 == 0 else -1), 0
        if i + 1 < len(steps):
            nx = steps[i + 1]['g'].representative_point(); c0 = g.representative_point()
            ddx, ddy = nx.x - c0.x, nx.y - c0.y; n = math.hypot(ddx, ddy) or 1
            dx, dy = round(-ddx / n, 2), round(ddy / n, 2)
        sc = V.scene(ts, te, [(ts, cx, cy, w * 1.04), (te, cx, cy, w * 0.94)], wo=[dx, dy] if i + 1 < len(steps) else [0, 1])
        # imperio actual, ya visible
        sc.layer(emp, emp_flag, ts - 5, a='pop', ad=0.05, t1=(ts + 5 if st.get('fail') else None))
        opp = sc.layer(g, st['f'], ts, a='pop', ad=0.14)
        if i >= 4:
            ep = emp.representative_point()
            sc.emblem(emb, ep.x, ep.y, w * 0.16, ts, te + 0.05, c=emb_col, c2=emb_c2, bg=badge, grow=[1, 1])
        V.text(st['name'], ts, te - 0.03, y=210, size=140)
        V.text(str(st['year']), ts, te - 0.03, y=355, size=140, yr=[prev_year, st['year'], 0.4])
        prev_year = st['year']
        if i == 3:  # el hueco de los Mamelucos: dos frases
            V.text("HEY, DON'T SAY THAT!!", ts + 0.05, ts + 0.85, y=1080, size=110, k='bubble')
            V.text('REALLY??', ts + 0.85, te - 0.03, y=1000, size=120, k='bubble')
        if st.get('fail'):
            c = g.representative_point(); ec2 = nearest_points(emp, c)[0]
            sc.emblem('arrows', (c.x + ec2.x) / 2, (c.y + ec2.y) / 2, w * 0.35, ts + 0.9, te + 0.05, c='#ffffff', grow=[0.8, 1.0])
            continue
        tf = ts + (te - ts) * 0.5
        new = emp.union(g)
        o = nearest_points(emp, g.representative_point())[0]
        sc.layer(new, emp_flag, tf, a='reveal', o=(o.x, o.y), ad=min(0.45, (te - tf) * 0.8))
        opp['t1'] = round(tf + 0.5, 3)
        emp = new
        c = g.representative_point()
        sc.emblem(emb, c.x, c.y, w * 0.24, tf - 0.08, te + 0.05, c=emb_col, c2=emb_c2, grow=[2.0, 1.0], r0=-25, r1=0)
    # final: zoom out del imperio completo + emblema grande
    allg = emp.union(final) if final is not None else emp
    cx, cy, w = camfor(allg, fill=1.2, mn=1)
    ec = emp.representative_point()
    sc = V.scene(ts_end, tend, [(ts_end, ec.x, ec.y, w * 0.55), (ts_end + 0.6, cx, cy, w), (tend, cx, cy, w * 0.93)])
    sc.layer(emp, emp_flag, ts_end - 5, a='pop', ad=0.05)
    if final is not None:
        sc.layer(allg, emp_flag, ts_end + 0.25, a='reveal', o=(ec.x, ec.y), ad=B * 1.3)
    c = allg.representative_point()
    sc.emblem(emb, c.x, c.y, w * 0.34, ts_end + 0.3, tend, c=emb_col, c2=emb_c2, bg=badge, grow=[0.85, 1.0], r0=0, r1=0)
    V.dur = tend
    V.music = 'sh/music/ref_ottoman.wav'
    V.save()

if __name__ == '__main__':
    which = sys.argv[1:] or ['gg_id', 'gg_in', 'gg_as']
    if 'gg_id' in which:
        steps = [
            dict(name='BALI', year=1343, f='bali', g=P('ID', 'Bali')),
            dict(name='PASAI', year=1350, f='pasai', g=P('ID', 'Aceh')),
            dict(name='DOMPU', year=1357, f='dompu', g=P('ID', 'Nusa Tenggara Barat').intersection(BOX(117.7, -9.3, 119.3, -8.0))),
            dict(name='NAN SARUNAI', year=1358, f='luwu', g=P('ID', 'Kalimantan Selatan', 'Kalimantan Tengah')),
            dict(name='TANJUNGPURA', year=1365, f='tanjungpura', g=P('ID', 'Kalimantan Barat')),
            dict(name='MAKASSAR', year=1365, f='makassar', g=P('ID', 'Sulawesi Selatan', 'Sulawesi Barat')),
            dict(name='MALUKU', year=1365, f='ternate', g=P('ID', 'Maluku', 'Maluku Utara')),
            dict(name='BRUNEI', year=1369, f='brunei_old', g=C('BRN').union(P('MY', 'Sarawak').intersection(BOX(113, 2.5, 116, 5.2)))),
            dict(name='SRIVIJAYA', year=1377, f='srivijaya', g=P('ID', 'Sumatera Selatan', 'Jambi', 'Bangka-Belitung', 'Lampung')),
            dict(name='TEMASEK', year=1398, f='temasek', g=C('SGP').union(P('MY', 'Johor'))),
            dict(name='MALACCA', year=1409, f='malacca', g=P('MY', 'Melaka', 'Negeri Sembilan', 'Selangor', 'Pahang', 'Perak', 'Kuala Lumpur', 'Putrajaya'), fail=True),
        ]
        final = P('ID', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Bengkulu', 'Kalimantan Timur', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Sulawesi Tenggara').union(P('ID', 'Jawa Tengah', 'Yogyakarta'))
        core = P('ID', 'Jawa Timur')
        ggez('gg_id', 'majapahit', 'surya', '#f2c230', core, 1293, steps, final=final, minw=9, maxw=44, badge='#c8102e')
    if 'gg_in' in which:
        steps = [
            dict(name='LODI SULTANATE', year=1526, f='lodi', g=P('IN', 'Punjab', 'Haryana', 'Delhi', 'Chandigarh', 'Uttar Pradesh', 'Uttarakhand').union(P('PK', 'Punjab'))),
            dict(name='RAJPUTS', year=1527, f='rajput', g=P('IN', 'Rajasthan')),
            dict(name='GUJARAT', year=1573, f='gujarat', g=P('IN', 'Gujarat')),
            dict(name='BENGAL', year=1576, f='bengal', g=P('IN', 'West Bengal', 'Bihar', 'Jharkhand').union(C('BGD'))),
            dict(name='KASHMIR', year=1586, f='kashmir', g=P('IN', 'Jammu and Kashmir').union(P('PK', 'Azad Kashmir'))),
            dict(name='SINDH', year=1591, f='sindh', g=P('PK', 'Sind')),
            dict(name='KANDAHAR', year=1595, f='kandahar', g=P('AF', 'Kandahar', 'Hilmand', 'Zabul', 'Uruzgan')),
            dict(name='AHMADNAGAR', year=1600, f='ahmadnagar', g=P('IN', 'Maharashtra').intersection(BOX(72, 18, 80.5, 21.5))),
            dict(name='BIJAPUR', year=1686, f='bijapur', g=P('IN', 'Karnataka').intersection(BOX(73, 14.5, 78, 18.5)).union(P('IN', 'Maharashtra').intersection(BOX(72, 15.5, 80.5, 18)))),
            dict(name='GOLCONDA', year=1687, f='golconda', g=P('IN', 'Telangana', 'Andhra Pradesh')),
            dict(name='MARATHAS', year=1707, f='maratha', g=P('IN', 'Maharashtra').intersection(BOX(72, 15.5, 76.5, 20.5)).union(P('IN', 'Goa')), fail=True),
        ]
        core = P('AF', 'Kabul', 'Parwan', 'Kapisa', 'Logar', 'Wardak', 'Nangarhar', 'Laghman', 'Ghazni', 'Paktya', 'Khost', 'Kunar')
        final = geo.H('1700', 'Mughal Empire')
        ggez('gg_in', 'mughal_plain', 'lionSun', '#f2c230', core, 1504, steps, final=final, minw=22, maxw=44, badge='#2e8b45')
    if 'gg_as' in which:
        cn = lambda *n: P('CN', *n)
        steps = [
            dict(name='KARA KHITAI', year=1218, f='tibet', g=H('1200', 'Kara Khitai Khaganate')),
            dict(name='KHWAREZM', year=1221, f='khwarazm', g=H('1200', 'Khwarazmian dynasty')),
            dict(name='WESTERN XIA', year=1227, f='xia', g=H('1200', 'Xixia')),
            dict(name='JIN DYNASTY', year=1234, f='jin', g=cn('Heilongjiang', 'Jilin', 'Liaoning', 'Beijing', 'Tianjin', 'Hebei', 'Shanxi', 'Shandong', 'Henan').union(cn('Shaanxi', 'Jiangsu', 'Anhui').intersection(BOX(100, 33, 125, 42)))),
            dict(name='KIEVAN RUS', year=1240, f='rus', g=H('1200', 'Principality of Kyiv', 'Principality of Vladimir-Suzdal', 'Principality of Galicia-Volhynia', 'Other Rus Principalities')),
            dict(name='GEORGIA', year=1243, f='georgia', g=H('1200', 'Georgia')),
            dict(name='TIBET', year=1247, f='tibet', g=P('CN', 'Xizang', 'Qinghai')),
            dict(name='ABBASIDS', year=1258, f='abbasid', g=C('IRQ')),
            dict(name='GORYEO', year=1259, f='goryeo', g=H('1200', 'Goryeo')),
            dict(name='SONG DYNASTY', year=1279, f='song', g=H('1200', 'Song Empire')),
            dict(name='JAPAN', year=1281, f='jp', g=C('JPN').intersection(BOX(128, 30, 142.5, 41.6)), fail=True),
        ]
        core = C('MNG')
        final = H('1279', 'Great Khanate', 'Khanate of the Golden Horde', 'Ilkhanate', 'Chagatai Khanate')
        ggez('gg_as', 'mongol_plain', 'soyombo', '#ffffff', core, 1206, steps, final=final, minw=34, maxw=80, badge='#2f7fb8')
