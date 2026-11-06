#!/bin/bash
# uso: fetchq.sh v1 v2 ... — espera cada run y lo descarga en orden
cd /home/claude/atlas-render
for v in "$@"; do
  A=out/ghrun_${v}.txt; R=$(cut -d' ' -f1 $A)
  while [ "$(gh run view $R -R xmp24/atlas-render --json status -q .status)" != "completed" ]; do sleep 30; done
  cp $A out/ghrun_args.txt; bash ghfetch.sh > out/fetch_${v}.log 2>&1; echo "$v $(tail -1 out/fetch_${v}.log)" >> out/fetchq.log
  rm -rf out/gh_* 2>/dev/null
done
