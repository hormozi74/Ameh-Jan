/* compare two ENG implementations on random game states */
const fs = require('fs');
const [engA, engB] = process.argv.slice(2);
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync((process.env.BUILD || __dirname + '/..') + '/data-block.js', 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const A = eval(fs.readFileSync(engA, 'utf8') + '\n;ENG'), B = eval(fs.readFileSync(engB, 'utf8') + '\n;ENG');
let seed = 11; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
let maxIg = 0, maxPy = 0, maxUp = 0, maxPr = 0, states = 0;
for (let g = 0; g < 12; g++) {
  const truth = CHARACTERS[Math.floor(rnd() * CHARACTERS.length)];
  let log = CHARACTERS.map(c => Math.log(c.prior)); const asked = [], cc = {};
  for (let n = 0; n < 22; n++) {
    const pa = A.toProbs(log), pb = B.toProbs(log);
    for (let i = 0; i < pa.length; i++) maxPr = Math.max(maxPr, Math.abs(pa[i] - pb[i]));
    const ra = A.rankQuestions(pa, asked, cc), rb = B.rankQuestions(pa, asked, cc);
    const mb = new Map(rb.map(x => [x.q.id, x]));
    if (ra.length !== rb.length) console.log('pool size differs', n, ra.length, rb.length);
    for (const x of ra) { const y = mb.get(x.q.id); if (!y) { console.log('missing', x.q.id, x.ig); continue; } maxIg = Math.max(maxIg, Math.abs(x.ig - y.ig)); maxPy = Math.max(maxPy, Math.abs(x.pYes - y.pYes)); }
    states++;
    const q = ra[Math.floor(rnd() * Math.min(4, ra.length))]?.q; if (!q) break;
    const w = [1, .75, .25, 0][Math.floor(rnd() * 4)];
    const ua = A.update(log, q, w), ub = B.update(log, q, w);
    for (let i = 0; i < ua.length; i++) maxUp = Math.max(maxUp, Math.abs(ua[i] - ub[i]));
    log = ua; asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1;
    if (Math.max(...A.toProbs(log)) > 0.95) break;
  }
}
console.log(`states=${states}  max|Δig|=${maxIg.toExponential(2)}  max|ΔpYes|=${maxPy.toExponential(2)}  max|Δupdate|=${maxUp.toExponential(2)}  max|Δprobs|=${maxPr.toExponential(2)}`);
