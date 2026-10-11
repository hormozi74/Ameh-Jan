#!/bin/zsh
# usage: run.sh TAG N_PER_SHARD SHARDS noise [ENV=VAL ...]
SP=${BUILD:-/Users/behtis/Documents/Personal Project/Ameh-Jan/build}/lab
tag=$1; n=$2; shards=$3; noise=$4; shift 4
for s in $(seq 1 $shards); do
  (env "$@" TAG=$tag ENG_SRC=$SP/eng-var.js node $SP/diag.js $n $s $noise > $SP/r-$tag-$noise-$s.txt 2>&1 &)
done
