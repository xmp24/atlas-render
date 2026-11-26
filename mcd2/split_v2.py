import json, os, sys, subprocess
import numpy as np
sys.path.insert(0, '/home/claude/atlas-render/mcd2')
import split2 as S
R = S.R; EL = S.EL
B = json.load(open(R + 'batches.json'))
WD = json.load(open(os.path.expanduser('~/el2/words.json')))
outs = {k: json.load(open(R + f'voice_{k}.json')) for k in ['rbx', 'sbx', 'tbl']}
def put(k, sid, y, fast):
    fn = R + f'voice/{k}/{sid}.wav'; S.save(fn, y)
    if fast:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', fn, '-af', 'atempo=1.18', '-ac', '1', '-ar', str(S.SR), '-f', 'f32le', '-'], capture_output=True).stdout
        y = np.frombuffer(raw, np.float32).copy(); S.save(fn, y)
    outs[k][sid] = dict(dur=round(len(y) / S.SR, 3), env=S.env30(y)); print(k, sid, outs[k][sid]['dur'])
for b in B['v2'] + B['talk2']:
    texts = b['text'].split(' [pause] '); x = S.load(EL + b['id'] + '.mp3')
    parts, info = ([x], []) if len(texts) == 1 else S.split_guided(x, texts, WD[b['id'] + '.wav'])
    if info: print('AVISO', b['id'], info)
    for sid, p in zip(b['ids'], parts):
        y = S.tighten(S.trim(p))
        if ':' in sid: k, s = sid.split(':'); put(k, s, y, False)
        else: put(b['key'], sid, y, True)
for k, o in outs.items(): json.dump(o, open(R + f'voice_{k}.json', 'w'))
