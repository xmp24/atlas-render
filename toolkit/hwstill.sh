#!/bin/bash
# uso: ./hwstill.sh BUILD COMP outprefix scale t1 t2 ...
cd /home/claude/miniguerra
export NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt NODE_NO_WARNINGS=1
B=/home/claude/rtest/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell
BUILD=$1; COMP=$2; OUT=$3; SC=$4; shift 4
mkdir -p out/hwtest
for t in "$@"; do
  fr=$(python3 -c "print(int(round($t*30)))")
  npx remotion still $BUILD $COMP out/hwtest/$OUT-$t.png --frame=$fr --scale=$SC --browser-executable=$B --timeout=120000 2>&1 | grep -i -E "error|Error" | head -3
done
