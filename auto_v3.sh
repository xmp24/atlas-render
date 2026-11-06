#!/bin/bash
# crea el V3 (audio masterizado) en cuanto cada V2 pasa la QA; nosleep usa su render v3raw
cd /home/claude/atlas-render
L="cold ocean babies heat thirty purge nosleep money deathdate memory gravity power powers"
while true; do
  left=0
  for v in $L; do
    [ -f out/${v}_v3.mp4 ] && continue; left=1
    src=out/${v}_v2.mp4; tag=${v}_v2; [ $v = nosleep ] && { src=out/nosleep_v3raw.mp4; tag=nosleep_v3raw; }
    grep -q "^$tag QA OK" out/fetchq.log || continue
    ./master.sh $src out/${v}_v3.tmp.mp4 > out/master_$v.log 2>&1 && mv out/${v}_v3.tmp.mp4 out/${v}_v3.mp4 && echo "$v V3 $(tail -2 out/master_$v.log | tr '\n' ' ')" >> out/v3.log
  done
  [ $left = 0 ] && break; sleep 60
done
echo ALL_V3_DONE >> out/v3.log
