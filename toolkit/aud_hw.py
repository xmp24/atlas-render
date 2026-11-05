import json, sys
sys.path.insert(0, 'audio')
from mix import mix
src, out = sys.argv[1], sys.argv[2]
D = json.load(open(src))
mix(D['dur'], D['music'], sorted(tuple(s) for s in D['sfx']), out)
print('audio ok', D['dur'], len(D['sfx']))
