# Corte guiado por Whisper (inglés) de las tomas de guerra -> mcd2/voice/<key>/<id>.wav + mcd2/voice_<key>.json
import json, os, sys, glob, re
sys.path.insert(0, '/home/claude/atlas-render/mcd2')
import split2 as SP
R = '/home/claude/atlas-render/'
EL = os.path.expanduser('~/el3/')
SP.ALIAS = {'st': 'saint', 'kits': 'kitts', 'ivory': 'ivory', 'sao': 'sao', 'tome': 'tome', 'principe': 'principe', 'okay': 'ok'}

def words():
    WD = {}
    for f in glob.glob(EL + 'words_*.json'): WD.update(json.load(open(f)))
    return WD

def main(keys):
    B = json.load(open(R + 'war/batches.json'))
    WD = words()
    outs = {k: {} for k in keys}
    for k in keys: os.makedirs(R + f'mcd2/voice/{k}', exist_ok=True)
    for b in B:
        texts = b['text'].split('\n')
        ids = b['ids']
        assert len(texts) == len(ids), (b['id'], len(texts), len(ids))
        if b['key'] != 'multi' and b['key'] not in keys: continue
        if b['key'] == 'multi' and not any(i.split(':')[0] in keys for i in ids): continue
        x = SP.load(EL + b['id'] + '.mp3')
        if len(texts) == 1: parts, info = [x], []
        else: parts, info = SP.split_guided(x, texts, WD[b['id'] + '.wav'])
        if info: print(b['id'], info)
        for sid, p, tx in zip(ids, parts, texts):
            k, s = (sid.split(':') if ':' in sid else (b['key'], sid))
            if k not in keys: continue
            y = SP.tighten(SP.trim(p)); SP.save(R + f'mcd2/voice/{k}/{s}.wav', y)
            outs[k][s] = dict(dur=round(len(y) / SP.SR, 3), env=SP.env30(y), cps=round(len(tx) / max(len(y) / SP.SR, 0.1), 1))
    for k in keys:
        o = outs[k]
        bad = [(s, v['dur'], v['cps']) for s, v in o.items() if not 8 < v['cps'] < 24]
        tot = sum(v['dur'] for v in o.values())
        cps = sum(v['cps'] * v['dur'] for v in o.values() if v) / max(tot, 1)
        print(k, len(o), 'piezas · voz', round(tot / 60, 2), 'min · cps medio', round(cps, 1), '· sospechosos', bad)
        json.dump(o, open(R + f'mcd2/voice_{k}.json', 'w'))

if __name__ == '__main__':
    main(sys.argv[1:] or ['sol', 'los', 'mil', 'last', 'riv', 'ally'])
