# Director: guion + duraciones de voz -> src/mcd/mc.json (línea de tiempo, cámara por fotograma, bocas) y mcd/audio.json (mezcla)
import json, math, os, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
from data import ORDER, NAMES, status, LEFT
from script import NOTES
R = '/home/claude/atlas-render/'
FPS = 30
QD = 1.58         # duración de un país rápido
QF = 2.6           # país amarillo rápido (para leer la tarjeta)
TALKERS = {'US', 'CA', 'SM', 'IS', 'RU', 'BO', 'CU', 'BB', 'AM', 'IR', 'IN', 'LK', 'KP', 'NG', 'VA'}  # solo estos países hablan
PLAN = json.load(open(R + 'mcd/plan.json'))
GEO = json.load(open(R + 'src/mcd/geo.json'))
VJ = R + 'mcd/voice.json'
VOICE = json.load(open(VJ)) if os.path.exists(VJ) else {}
PINS_XY = {'TV': (179.2, -8.52), 'NR': (166.93, -0.53)}

def ne1(lon, lat):
    l, p = math.radians(lon), math.radians(lat)
    p2 = p * p; p4 = p2 * p2
    x = l * (0.8707 - 0.131979 * p2 - 0.013791 * p4 + 0.003971 * p4 * p4 * p2 - 0.001529 * p4 * p4 * p4)
    y = p * (1.007226 + 0.015085 * p2 - 0.044475 * p4 * p2 + 0.028874 * p4 * p4 - 0.005916 * p4 * p4 * p2)
    return (x * 1000 + 2736, -y * 1000 + 1340)

def vdur(seg):
    v = VOICE.get(seg['id'])
    if v and v.get('merged'): return 0.0
    if v: return v['dur']
    return len(seg['text']) / 14.5 + 0.25

# ---------------- geometría por país ----------------
def geom(c):
    if c in GEO:
        g = GEO[c]; bb = g['bm']; cx, cy = g['c']; r = g['r']
    else:
        cx, cy = ne1(*PINS_XY[c]); bb = [cx - 1, cy - 1, cx + 1, cy + 1]; r = 0
    pin = r < 2.2
    if pin:
        s = 5.0; tx, ty = cx, cy
    else:
        bw, bh = bb[2] - bb[0], bb[3] - bb[1]
        s = min(1000 / bw, 560 / bh, 16.0); s = max(s, 0.42)
        tx, ty = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    # el país queda centrado en (900, 455) de la pantalla
    return dict(bb=bb, ax=cx, ay=cy, r=r, pin=pin, cam=[tx + 60 / s, ty + 85 / s, s])

# ---------------- línea de tiempo ----------------
def build():
    segs = PLAN['segs']
    byc = {}
    pos = {c: i for i, c in enumerate(ORDER)}
    lastT = None
    keep = []
    for s in segs:
        if s['type'] == 'say' and s['cue'] not in TALKERS: continue
        keep.append(s)
        if s['type'] in ('intro', 'outro'): continue
        T = s.get('name') or s['cue']
        if not s.get('name') and lastT and pos[lastT] > pos[T]: T = lastT
        s['T'] = T; lastT = T
    segs = keep
    talks = []; sfx = []
    t = 0.35
    for s in [x for x in segs if x['type'] == 'intro']:
        d = vdur(s); talks.append(dict(id=s['id'], who='NARR', t0=t, t1=t + d, text=s['text'])); t += d + 0.2
    legend_t = talks[1]['t0'] if len(talks) > 1 else 2
    intro_end = legend_t + 7.0   # la cámara arranca hacia EE. UU. con "Y al final..."
    t = intro_end
    C = []
    nc = talks[-1]['t1'] + 0.1  # narrador libre a partir de...
    prev_end = intro_end
    queue = [x for x in segs if x['type'] not in ('intro', 'outro')]
    qi = 0
    byid = {x['id']: x for x in segs}
    forced = {}  # país -> instante en que el narrador lo nombra dentro de un clip agrupado
    def merged(sx): return bool(VOICE.get(sx['id'], {}).get('merged'))
    def addtalk(sx, who, st):
        d = vdur(sx); talks.append(dict(id=sx['id'], who=who, t0=st, t1=st + d, text=sx['text']))
        for sid, off in VOICE.get(sx['id'], {}).get('subs', [])[1:]:
            nm = byid[sid].get('name')
            if nm and nm not in forced: forced[nm] = st + off
        return d
    for i, c in enumerate(ORDER):
        g = geom(c)
        mine = []
        while qi < len(queue) and queue[qi]['T'] == c:
            mine.append(queue[qi]); qi += 1
        start = prev_end
        # piezas previas (sin ancla, antes de la pieza anclada o del 'say')
        k = 0
        pre = []
        while k < len(mine) and mine[k]['type'] in ('over', 'pre') and not mine[k].get('name') and any(m['type'] == 'say' or m.get('name') for m in mine[k + 1:]):
            pre.append(mine[k]); k += 1
        for s in pre:
            if merged(s): continue
            st = max(nc, prev_end); d = addtalk(s, 'NARR', st); nc = st + d + 0.1
        rest = mine[k:]
        story = any(m['type'] == 'say' for m in rest)
        anchored = [m for m in rest if m.get('name') == c and not merged(m)]
        if c in forced:
            start = max(C[-1]['t0'] + 0.6 if C else start, forced[c] - 0.08)
            if C: C[-1]['t1'] = round(start, 3)
        elif anchored or [p_ for p_ in pre if not merged(p_)]: start = max(start, nc - 0.05)
        # vuelo de cámara
        fly = 0.42
        if C:
            p = C[-1]['cam']; dist = math.hypot(g['cam'][0] - p[0], g['cam'][1] - p[1]) * min(p[2], g['cam'][2])
            fly = 0.42 if dist < 900 else 0.6 if dist < 2500 else 0.85
        if story: fly = max(fly, 0.6)
        pop = start + fly * 0.7
        cur = start + 0.05
        td = start + fly + 0.25
        first_say = True
        for s in rest:
            d = vdur(s)
            if merged(s): continue
            if s['type'] == 'say':
                st = max(nc, pop + 0.35)
                addtalk(s, c, st)
                if first_say: td = st + min(1.6, 0.4 * d); first_say = False
                nc = st + d + 0.15; cur = nc
            else:
                st = max(nc, start + 0.05)
                addtalk(s, 'NARR', st)
                nc = st + d + 0.08
                if story: cur = nc
        st_c = 'N' if c == 'CU' else status(c)
        end = start + (QF if st_c == 'F' else QD) if not story else max(start + 2.4, cur + 0.35)
        if c == 'VA': end = max(end, nc + 0.3)
        C.append(dict(c=c, n=NAMES[c], st=('N' if c == 'CU' else status(c)), t0=round(start, 3), fly=fly, pop=round(pop, 3), td=round(td, 3), t1=round(end, 3),
                      kind='s' if story else 'q', note=NOTES.get(c, ''), cam=g['cam'], pin=g['pin'], ax=g['ax'], ay=g['ay'], r=g['r'], bb=g['bb']))
        prev_end = end
    # outro
    t = max(prev_end, nc) + 0.2
    out0 = t
    for s in [x for x in segs if x['type'] == 'outro']:
        d = vdur(s); talks.append(dict(id=s['id'], who='NARR', t0=t, t1=t + d, text=s['text'])); t += d + 0.25
    dur = t + 0.6
    talks.sort(key=lambda x: x['t0'])
    return dict(dur=round(dur, 3), intro_end=round(intro_end, 3), legend_t=legend_t, out0=round(out0, 3), C=C, talks=talks)

# ---------------- cámara por fotograma ----------------
WORLD = [2736, 1310, 0.36]
def ease(u): return u * u * (3 - 2 * u) if u < 1 else 1
def ease3(u): u = min(max(u, 0), 1); return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2
def flight(a, b, u):
    e = ease3(u)
    ls0, ls1 = math.log(a[2]), math.log(b[2])
    dist = math.hypot(b[0] - a[0], b[1] - a[1])
    smid = min(a[2], b[2], 1400 / max(dist, 1))
    dip = max(0.0, math.log(min(a[2], b[2])) - math.log(smid))
    ls = ls0 + (ls1 - ls0) * e - dip * 4 * u * (1 - u) * 0.9
    return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, math.exp(ls)]

def camera(T):
    n = int(T['dur'] * FPS) + 1
    cams = []
    C = T['C']
    keys = [(0, WORLD, 0)]  # (t_arrive_start, cam, fly)
    for c in C: keys.append((c['t0'], c['cam'], c['fly']))
    out_cam = WORLD
    for f in range(n):
        t = f / FPS
        if t < T['intro_end']:
            u = t / max(T['intro_end'], 1)
            cam = [WORLD[0], WORLD[1], WORLD[2] * (1 + 0.04 * u)]
        elif t >= T['out0']:
            last = C[-1]['cam']; u = min(1, (t - T['out0']) / 1.4)
            cam = flight(last, WORLD, u)
        else:
            j = max(i for i, k in enumerate(keys) if k[0] <= t)
            t0, cb, fly = keys[j]
            ca = keys[j - 1][1] if j > 0 else WORLD
            if j == 1: ca = [WORLD[0], WORLD[1], WORLD[2] * 1.04]
            u = (t - t0) / fly
            cam = flight(ca, cb, u) if u < 1 else list(cb)
            # deriva lenta (zoom suave) mientras está en el país
            if u >= 1:
                dz = 1 + 0.018 * min(4, t - t0 - fly)
                cam = [cam[0], cam[1], cam[2] * dz]
        cams.append([round(cam[0], 2), round(cam[1], 2), round(cam[2], 4)])
    return cams

# ---------------- bocas ----------------
def envs(T):
    for tk in T['talks']:
        v = VOICE.get(tk['id'])
        tk['e'] = v['env'] if v else ''.join('5' if (i // 4) % 2 else '2' for i in range(int((tk['t1'] - tk['t0']) * FPS)))

# ---------------- audio ----------------
def audio(T):
    sfx = []
    for i, c in enumerate(T['C']):
        sfx.append([c['pop'], 'pop', 0.5])
        sfx.append([c['td'], {'H': 'ding', 'F': 'boop', 'N': 'thud'}[c['st']], 0.55 if c['kind'] == 'q' else 0.7])
        if c['fly'] >= 0.6: sfx.append([c['t0'], 'whoosh', 0.35])
    sfx.append([T['out0'] + 1.2, 'reveal', 0.6])
    # música por secciones
    def tof(code): return next(c['t0'] for c in T['C'] if c['c'] == code)
    cuts = [(0, 'chip'), (tof('GB') - 0.3, 'drive'), (tof('CO') - 0.3, 'chip'), (tof('GE') - 0.3, 'newsroom'), (tof('MA') - 0.3, 'chase'), (T['out0'], 'chip')]
    music = []
    for k, (t0, name) in enumerate(cuts):
        t1 = cuts[k + 1][0] if k + 1 < len(cuts) else T['dur']
        music.append([round(t0, 2), round(t1, 2), name])
    voices = [[tk['t0'], tk['id']] for tk in T['talks']]
    return dict(dur=T['dur'], music=music, sfx=sfx, voices=voices)

if __name__ == '__main__':
    T = build(); T['cam'] = camera(T); envs(T)
    json.dump(T, open(R + 'src/mcd/mc.json', 'w'), separators=(',', ':'), ensure_ascii=False)
    json.dump(audio(T), open(R + 'mcd/audio.json', 'w'), indent=0)
    print('duración', round(T['dur'], 1), 's =', round(T['dur'] / 60, 2), 'min · voz real:', bool(VOICE))
    st = sum(1 for c in T['C'] if c['kind'] == 's'); print('escenas habladas', st, 'rápidos', len(T['C']) - st)
    for c in T['C'][:6]: print(c['c'], c['t0'], c['t1'], c['kind'])
