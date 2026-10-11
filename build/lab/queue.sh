#!/bin/zsh
SP=${BUILD:-/Users/behtis/Documents/Personal Project/Ameh-Jan/build}/lab
# each line: TAG noise ENV...
while IFS= read -r line; do
  [[ -z "$line" ]] && continue
  set -- ${(z)line}
  tag=$1; noise=$2; shift 2
  for s in 1 2 3 4; do
    env "$@" TAG=$tag ENG_SRC=$SP/eng-var.js node $SP/diag.js 100 $s $noise > $SP/r-$tag-$noise-$s.txt 2>&1 &
  done
  wait
  echo "done $tag" >> $SP/queue.log
done < $SP/queue.txt
echo ALLDONE >> $SP/queue.log
