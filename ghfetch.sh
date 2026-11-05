#!/bin/bash
# Descarga, descifra, une y verifica el render de GitHub (lee out/ghrun_args.txt)
set -e
M=/home/claude/atlas-render; REPO=xmp24/atlas-render
read RUN TOTAL AUDIO OUT JOBS TAG < $M/out/ghrun_args.txt
D=$M/out/gh_$RUN; rm -rf $D; mkdir -p $D; cd $D
# las partes cifradas llegan como ramas out-TAG (relay) o out-TAG-i (render)
git init -q g; cd g
git fetch -q --depth 1 https://github.com/$REPO "+refs/heads/out-$TAG*:refs/remotes/o/out-$TAG*"
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/o/); do
  git archive $b | tar -x -C .. ; done
cd ..; rm -rf g
for d in $(ls -d seg-* | sort -t- -k2 -n); do
  openssl pkeyutl -decrypt -inkey ~/.atlas/render_priv.pem -in $d/k.enc -out k.txt
  openssl enc -d -aes-256-cbc -pbkdf2 -pass file:k.txt -in $d/seg.bin -out $d.mp4; rm k.txt
  echo "file '$d.mp4'" >> list.txt
done
tot=0; for f in seg-*.mp4; do n=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 $f); tot=$((tot+n)); done
[ $tot = $TOTAL ] || { echo "QA FALLO: $tot fotogramas de $TOTAL"; exit 1; }
DUR=$(python3 -c "print($TOTAL/30)")
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i $M/$AUDIO -map 0:v -map 1:a -c:v libx264 -preset veryfast -crf 21 -maxrate 6M -bufsize 12M -c:a aac -b:a 256k -t $DUR $M/$OUT
n=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 $M/$OUT)
[ $n = $TOTAL ] || { echo "QA FALLO: final con $n fotogramas"; exit 1; }
ffmpeg -v error -i $M/$OUT -an -vf "fps=2,scale=64:36,format=gray" -f framemd5 - | grep -v "^#" | awk -F, '{print $6}' > h.txt
python3 - <<'P'
h=[l.strip() for l in open('h.txt')]; idx={}; r=[]
for i in range(len(h)-4):
    k=tuple(h[i:i+4])
    if k in idx and i-idx[k]>4 and len(set(k))>1: r.append((idx[k]/2,i/2))
    idx.setdefault(k,i)
print('QA repeticiones:', r if r else 'ninguna')
if r: raise SystemExit(1)
P
echo "QA OK $OUT ($n fotogramas)"
