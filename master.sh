#!/bin/bash
# V3: masteriza el audio a -14 LUFS (YouTube), TP -1.5 dB, sin tocar el vídeo. uso: master.sh in.mp4 out.mp4
IN=$1; OUT=$2
J=$(ffmpeg -hide_banner -i "$IN" -vn -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import sys,json; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -map 0:v -map 0:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a aac -b:a 256k -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -vn -af loudnorm=print_format=summary -f null - 2>&1 | grep -E "Input Integrated|Input True Peak"
