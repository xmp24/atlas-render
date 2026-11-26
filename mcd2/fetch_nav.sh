#!/bin/bash
cd /home/claude/atlas-render
for k in nav; do
  RUN=$(cut -d' ' -f1 out/ghrun_args_$k.txt)
  while [ "$(gh run view $RUN --json status -q .status)" != "completed" ]; do sleep 30; done
  cp out/ghrun_args_$k.txt out/ghrun_args.txt
  ./ghfetch.sh > out/fetch_$k.log 2>&1
  OUT=$(cut -d' ' -f4 out/ghrun_args_$k.txt)
  ffmpeg -v error -y -i $OUT -c copy -movflags +faststart ${OUT%.mp4}-fs.mp4 && mv ${OUT%.mp4}-fs.mp4 $OUT
  echo "$k listo $(date)" >> out/fetch2.done
done
