# Lotes de generación de voz: cada lote = un texto por voz con párrafos separados (luego se corta por silencios)
import json, re, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd')
from script import VOICES, INTRO, LINES, OUTRO
from data import NAMES

NAME2C = {v.lower(): k for k, v in NAMES.items()}
NAME2C.update({'papúa': 'PG', 'salomón': 'SB', 'república dominicana': 'DO', 'los dos congos': 'CD', 'surinam': 'SR'})

def pieces_of(text):
    # corta listas "A, B, C... resto" en piezas; cada pieza es un párrafo
    out = []
    for chunk in re.split(r'(?<=[,.!?…])\s+', text):
        out.append(chunk.strip())
    # vuelve a unir piezas cortas que no son nombres de país al anterior (para no partir frases)
    merged = []
    for p in out:
        key = re.sub(r'[,.!?¡¿…]+', '', p).strip().lower()
        isname = key in NAME2C
        if merged and not isname and (len(p) < 30 or not merged[-1][1]):
            merged[-1] = (merged[-1][0] + ' ' + p, False)
        else:
            merged.append((p, isname))
    res = []
    for p, isn in merged:
        low = re.sub(r'^[¡¿y ]+', '', p.lower()) if p.lower().startswith(('¡','¿')) else p.lower()
        hit = None
        for nm in sorted(NAME2C, key=len, reverse=True):
            if low.startswith(nm) and (len(low) == len(nm) or not low[len(nm)].isalpha()): hit = NAME2C[nm]; break
        res.append((p, hit))
    return res

def build():
    segs = []  # orden temporal: {id, voice, text, cue, type, name}
    for i, (v, t) in enumerate(INTRO): segs.append({'id': f'intro{i}', 'voice': v, 'text': t, 'cue': None, 'type': 'intro'})
    for i, (c, v, t, ty) in enumerate(LINES):
        if ty == 'over' and v == 'NARR':
            for j, (p, nc) in enumerate(pieces_of(t)):
                segs.append({'id': f'L{i}_{j}', 'voice': v, 'text': p, 'cue': c, 'type': 'over', 'name': nc})
        else:
            segs.append({'id': f'L{i}', 'voice': v, 'text': t, 'cue': c, 'type': ty})
    for i, (v, t) in enumerate(OUTRO): segs.append({'id': f'outro{i}', 'voice': v, 'text': t, 'cue': None, 'type': 'outro'})
    # lotes por voz (narrador partido en 3)
    batches = {}
    for s in segs:
        if s['id'] == 'intro0': continue  # ya generado en la prueba
        batches.setdefault(s['voice'], []).append(s['id'])
    nar = batches.pop('NARR'); n = len(nar); out = []
    for b in range(3):
        out.append({'key': f'NARR{b}', 'voice': VOICES['NARR'], 'ids': nar[b * n // 3:(b + 1) * n // 3]})
    for v, ids in batches.items(): out.append({'key': v, 'voice': VOICES[v], 'ids': ids})
    byid = {s['id']: s for s in segs}
    for b in out:
        b['text'] = '\n\n'.join(byid[i]['text'] for i in b['ids'])
        if b['key'].startswith('NARR'): b['text'] = '[excited] ' + b['text']
    return segs, out

if __name__ == '__main__':
    segs, batches = build()
    json.dump({'segs': segs, 'batches': batches}, open('/home/claude/atlas-render/mcd/plan.json', 'w'), ensure_ascii=False, indent=1)
    for b in batches: print(b['key'], len(b['ids']), len(b['text']))
    print('segs', len(segs))
