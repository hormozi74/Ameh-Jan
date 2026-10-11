#!/bin/zsh
SP=${BUILD:-/Users/behtis/Documents/Personal Project/Ameh-Jan/build}/lab
setopt +o nomatch
for tag in "$@"; do
  for noise in 0 0.1; do
    files=($SP/r-$tag-$noise-*.txt(N)); (( ${#files} )) || continue
    awk -v tag=$tag -v noise=$noise '
      /حدس اول/ { for(i=1;i<=NF;i++){ if($i=="اول") t1+=$(i+1); if($i=="حدس" && $(i-1)=="سه") t3+=$(i+1); if($i=="سؤال") q+=$(i+1);} k++ }
      /دلیل توقف/ { if (match($0,/"maxq":[0-9]+/)) { mx+=substr($0,RSTART+7,RLENGTH-7) } ; if (match($0,/N=/)){} }
      END { if(k) printf "%-14s noise=%-4s shards=%d  top1 %.1f%%  top3 %.1f%%  avgQ %.1f\n", tag, noise, k, t1/k, t3/k, q/k }' $files
  done
done
