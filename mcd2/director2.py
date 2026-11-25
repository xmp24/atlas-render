# Director numérico: guion + voces cortadas -> src/num/<key>.json (línea de tiempo, cámara, bocas) y mcd2/audio_<key>.json
import json, math, os, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
import director as DR
R = '/home/claude/atlas-render/'
key = sys.argv[1]
S = json.load(open(R + f'mcd2/{key}_script.json'))
V = json.load(open(R + f'mcd2/voice_{key}.json'))
from data import NAMES

def build():
    talks = []
    t = 0.35
    nI = len(S['intro'])
    leg = []
    for i in range(nI):
        sid = f'I{i}'; d = V[sid]['dur']
        talks.append(dict(id=sid, who='NARR', t0=round(t, 3), t1=round(t + d, 3), text=S['intro'][i], e=V[sid]['env']))
        if i >= 1: leg.append(round(t, 3))
        t += d + (0.25 if i == 0 else 0.12)
    intro_end = t + 0.1
    C = []; prev_end = intro_end
    for row in S['C']:
        c = row['c']; g = DR.geom(c)
        start = prev_end
        fly = 0.42
        if C:
            p = C[-1]['cam']; dist = math.hypot(g['cam'][0] - p[0], g['cam'][1] - p[1]) * min(p[2], g['cam'][2])
            fly = 0.42 if dist < 900 else 0.6 if dist < 2500 else 0.85
        pop = start + fly * 0.7
        sid = 'N_' + c; d = V[sid]['dur']
        ns = start + 0.1
        talks.append(dict(id=sid, who='NARR', t0=round(ns, 3), t1=round(ns + d, 3), text=row['say'], e=V[sid]['env']))
        name = NAMES[c] if not row['say'].startswith('Rep') else row['say'].split(':')[0]
        head = row['say'].split(':')[0] + ': '
        frac = len(head) / max(len(row['say']), 1)
        # el valor suena justo después del nombre: la tarjeta sale ahí (nunca antes de que aterrice la cámara)
        td = max(pop + 0.15, ns + frac * d * (1.0 if len(row['say']) < 60 else 1.6) + 0.1)
        td = min(td, ns + d - 0.25)
        end = ns + d + 0.06
        kind = 'q'
        if c in S['T']:
            sv = 'S_' + c; d2 = V[sv]['dur']; st = end + 0.08
            talks.append(dict(id=sv, who=c, t0=round(st, 3), t1=round(st + d2, 3), text=S['T'][c][1], e=V[sv]['env']))
            end = st + d2 + 0.3; kind = 's'
        end = max(end, start + 1.25)
        C.append(dict(c=c, n=NAMES[c], st=row['st'], v=row['v'], vs=row['vs'], sub=row['sub'], t0=round(start, 3), fly=fly, pop=round(pop, 3), td=round(td, 3), t1=round(end, 3),
                      kind=kind, cam=g['cam'], pin=g['pin'], ax=g['ax'], ay=g['ay'], r=g['r'], bb=g['bb']))
        prev_end = end
    out0 = prev_end + 0.15
    t = out0 + 0.25
    for i, txt in enumerate(S['outro']):
        sid = f'O{i}'; d = V[sid]['dur']
        talks.append(dict(id=sid, who='NARR', t0=round(t, 3), t1=round(t + d, 3), text=txt, e=V[sid]['env'])); t += d + 0.2
    dur = t + 0.5
    talks.sort(key=lambda x: x['t0'])
    return dict(dur=round(dur, 3), intro_end=round(intro_end, 3), leg=leg, out0=round(out0, 3), C=C, talks=talks, cfg=S['cfg'])

def audio(T):
    sfx = []
    snd = {'X': 'thud', 'A': 'boop', 'B': 'boop', 'C': 'ding', 'D': 'ding', 'E': 'ding'}
    for c in T['C']:
        sfx.append([c['pop'], 'pop', 0.45])
        sfx.append([c['td'], snd[c['st']], 0.5 if c['kind'] == 'q' else 0.65])
        if c['fly'] >= 0.6: sfx.append([c['t0'], 'whoosh', 0.35])
    for t in T['leg']: sfx.append([t, 'pop', 0.5])
    sfx.append([T['out0'] + 0.25, 'reveal', 0.6])
    def tof(code): return next(c['t0'] for c in T['C'] if c['c'] == code)
    seq = ['chip', 'drive', 'chase', 'newsroom', 'drive', 'chase', 'chip'] if key == 'alt' else ['newsroom', 'drive', 'chip', 'chase', 'newsroom', 'drive', 'chip']
    cuts = [(0, seq[0]), (tof('PL') - 0.3, seq[1]), (tof('CO') - 0.3, seq[2]), (tof('GE') - 0.3, seq[3]), (tof('KR') - 0.3, seq[4]), (tof('MA') - 0.3, seq[5]), (T['out0'], seq[6])]
    music = [[round(t0, 2), round(cuts[k + 1][0] if k + 1 < len(cuts) else T['dur'], 2), name] for k, (t0, name) in enumerate(cuts)]
    voices = [[tk['t0'], f'{key}/{tk["id"]}'] for tk in T['talks']]
    return dict(dur=T['dur'], music=music, sfx=sfx, voices=voices)

if __name__ == '__main__':
    T = build(); T['cam'] = DR.camera(T)
    json.dump(T, open(R + f'src/num/{key}.json', 'w'), separators=(',', ':'), ensure_ascii=False)
    json.dump(audio(T), open(R + f'mcd2/audio_{key}.json', 'w'), indent=0)
    print(key, 'duración', round(T['dur'], 1), 's =', round(T['dur'] / 60, 2), 'min · intro', T['intro_end'], 'leg', T['leg'])
    for c in T['C'][:3]: print(c['c'], c['t0'], c['td'], c['t1'])
