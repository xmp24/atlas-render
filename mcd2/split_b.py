# Corta las tomas de los 4 vídeos (narrador por clave + voces de países agrupadas)
import json, os, sys
sys.path.insert(0, '/home/claude/atlas-render/mcd2')
import split2 as S
R = S.R; EL = S.EL
B = json.load(open(R + 'batches.json'))
WD = json.load(open(os.path.expanduser('~/el2/words.json')))
for k in ['nav', 'rbx', 'sbx', 'tbl']: S.run_guided(k)
# toma de arreglo sin Whisper: corte por silencios
o = json.load(open(R + 'voice_nav.json')); fx = [b for b in B['nav'] if b['id'] == 'nav_fix'][0]
parts = S.split(S.load(EL + 'nav_fix.mp3'), 3)[0]
for sid, p in zip(fx['ids'], parts):
    y = S.tighten(S.trim(p)); S.save(R + f'voice/nav/{sid}.wav', y); o[sid] = dict(dur=round(len(y) / S.SR, 3), env=S.env30(y)); print('fix', sid, o[sid]['dur'])
json.dump(o, open(R + 'voice_nav.json', 'w'))
outs = {k: json.load(open(R + f'voice_{k}.json')) for k in ['nav', 'rbx', 'sbx', 'tbl']}
for b in B['talk']:
    texts = b['text'].split(' [pause] '); x = S.load(EL + b['id'] + '.mp3')
    if len(texts) == 1: parts, info = [x], []
    else: parts, info = S.split_guided(x, texts, WD[b['id'] + '.wav'])
    if info: print(b['id'], info)
    for sid, p in zip(b['ids'], parts):
        k, s = sid.split(':'); y = S.tighten(S.trim(p)); S.save(R + f'voice/{k}/{s}.wav', y)
        outs[k][s] = dict(dur=round(len(y) / S.SR, 3), env=S.env30(y)); print(sid, outs[k][s]['dur'])
for k, o in outs.items(): json.dump(o, open(R + f'voice_{k}.json', 'w'))
for k in ['nav', 'rbx', 'sbx', 'tbl']: S.speedup(k, 1.18)
print('ok')
