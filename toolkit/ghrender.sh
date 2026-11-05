#!/bin/bash
# Uso: ghrender.sh COMP TOTAL_FRAMES AUDIO.wav SALIDA.mp4 [JOBS]
# Sube el código, lanza el render en GitHub Actions, descarga, descifra, une con el audio y pasa el control de calidad.
set -e
COMP=$1; TOTAL=$2; AUDIO=$3; OUT=$4; JOBS=${5:-18}
REPO=xmp24/atlas-render; R=/home/claude/atlas-render; M=/home/claude/miniguerra
TAG=${COMP}-$(date +%m%d-%H%M)
# 1) sincroniza el motor y los datos
rm -rf $R/src $R/public; cp -r $M/src $M/package.json $M/package-lock.json $R/; cp -r $M/public $R/public; find $R/public -name '*.wav' -delete
cd $R; git add -A; git -c user.name=atlas -c user.email=atlas@users.noreply.github.com commit -qm "render $TAG" || true; git push -q origin HEAD:main
# 2) lanza
gh workflow run render.yml -R $REPO --ref main -f comp=$COMP -f frames=$TOTAL -f jobs=$JOBS -f tag=$TAG
sleep 8; RUN=$(gh run list -R $REPO -w render.yml -L 1 --json databaseId -q '.[0].databaseId'); echo "RUN $RUN"; echo $RUN > $M/out/ghrun.txt
echo "$RUN $TOTAL $AUDIO $OUT $JOBS $TAG" > $M/out/ghrun_args.txt
