#!/bin/bash
# como fetchq.sh pero espera a que no haya otras colas y solo borra su propia carpeta
cd /home/claude/atlas-render
while pgrep -f "^/bin/bash ./fetchq.sh" >/dev/null || pgrep -f "^bash -c while" >/dev/null || [ -n "$(pgrep -f '^/bin/bash ./fetchq2.sh' | grep -v $$)" -a "$(pgrep -f '^/bin/bash ./fetchq2.sh' | sort -n | head -1)" != "$$" ]; do sleep 20; done
for v in "$@"; do
  A=out/ghrun_${v}.txt; R=$(cut -d' ' -f1 $A)
  while [ "$(gh run view $R -R xmp24/atlas-render --json status -q .status)" != "completed" ]; do sleep 30; done
  cp $A out/ghrun_args.txt; bash ghfetch.sh > out/fetch_${v}.log 2>&1; echo "$v $(tail -1 out/fetch_${v}.log)" >> out/fetchq.log
  rm -rf out/gh_$R
done
