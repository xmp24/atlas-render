#!/bin/bash
# loudnorm a -14 LUFS en dos pasadas
k=$1; cd /home/claude/atlas-render
ffmpeg -hide_banner -nostats -y -i out/num/${k}_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2> /tmp/ln_$k.txt
python3 - $k <<'P'
import json,sys,subprocess
k=sys.argv[1]; t=open(f'/tmp/ln_{k}.txt').read(); j=json.loads(t[t.rindex('{'):t.rindex('}')+1])
f=f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
subprocess.run(['ffmpeg','-v','error','-y','-i',f'out/num/{k}_raw.wav','-af',f,'-ar','48000',f'out/num/{k}.wav'],check=True)
print(k,'loudnorm ok, entrada',j['input_i'])
P
