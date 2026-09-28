/* ⚠️ منسوخ — از build/sweep3.js استفاده کن.
   این اسکریپت موتور بیزی را برای سرعت از نو می‌نوشت و «آستانه‌ی نرم‌شونده» را
   مدل می‌کرد. بازی دیگر آستانه‌ی نرم‌شونده ندارد و موتورش هم بازنویسی شده،
   پس عددهای این‌جا دیگر با چیزی که منتشر می‌شود نمی‌خواند.
   sweep3.js همان ENG داخل بازی را اجرا می‌کند و حالا به‌قدر کافی سریع هست. */
/* جاروب سریع آستانه‌ی حدس روی پایگاه بزرگ — با ماتریس عددی برای سرعت */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, 'data-block.js');
const { QUESTIONS, CHARACTERS } =
  eval(fs.readFileSync(DATA, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');

const NC = CHARACTERS.length, NQ = QUESTIONS.length;
const P = new Float64Array(NC * NQ);          // P[c*NQ+q] = احتمال «بله»
for (let c = 0; c < NC; c++) for (let q = 0; q < NQ; q++)
  P[c * NQ + q] = Math.min(.97, Math.max(.03, CHARACTERS[c].a[QUESTIONS[q].id]));
const CLUSTER = QUESTIONS.map(q => q.cluster);
const CLUSTERS = [...new Set(CLUSTER)];
const CIDX = CLUSTER.map(c => CLUSTERS.indexOf(c));
const PRIOR = CHARACTERS.map(c => Math.log(c.prior));

function entropy(p, n) { let h = 0; for (let i = 0; i < n; i++) if (p[i] > 1e-12) h -= p[i] * Math.log2(p[i]); return h; }

function play(truth, noise, CONF, RATIO, MINQ, MAXQ) {
  const log = Float64Array.from(PRIOR);
  const asked = new Uint8Array(NQ), cc = new Int32Array(CLUSTERS.length);
  const probs = new Float64Array(NC), py = new Float64Array(NC), pn = new Float64Array(NC);
  const rejected = new Set();
  let n = 0; const guesses = [];

  for (;;) {
    // نرمال‌سازی
    let m = -Infinity; for (let i = 0; i < NC; i++) if (log[i] > m) m = log[i];
    let z = 0; for (let i = 0; i < NC; i++) { probs[i] = Math.exp(log[i] - m); z += probs[i]; }
    for (let i = 0; i < NC; i++) probs[i] /= z;

    let b1 = -1, b2 = -1, p1 = -1, p2 = -1;
    for (let i = 0; i < NC; i++) { if (rejected.has(i)) continue;
      if (probs[i] > p1) { p2 = p1; b2 = b1; p1 = probs[i]; b1 = i; } else if (probs[i] > p2) { p2 = probs[i]; b2 = i; } }

    const H = entropy(probs, NC);
    const ready = (n >= MINQ && p1 > CONF && p1 / Math.max(p2, 1e-12) > RATIO) || n >= MAXQ;

    // بهترین سؤال
    let best = -1, bestScore = 0;
    if (!ready) {
      for (let q = 0; q < NQ; q++) {
        if (asked[q]) continue;
        let pYes = 0; for (let i = 0; i < NC; i++) pYes += probs[i] * P[i * NQ + q];
        if (pYes < .10 || pYes > .90) continue;
        let hy = 0, hn = 0;
        for (let i = 0; i < NC; i++) {
          const a = probs[i] * P[i * NQ + q] / pYes, b = probs[i] * (1 - P[i * NQ + q]) / (1 - pYes);
          if (a > 1e-12) hy -= a * Math.log2(a);
          if (b > 1e-12) hn -= b * Math.log2(b);
        }
        const ig = H - (pYes * hy + (1 - pYes) * hn);
        const sc = ig * Math.pow(.6, cc[CIDX[q]]);
        if (sc > bestScore) { bestScore = sc; best = q; }
      }
    }

    if (ready || best < 0) {
      guesses.push(b1);
      if (b1 === truth || guesses.length >= 3 || n >= MAXQ) return { guesses, n };
      rejected.add(b1); log[b1] -= 8;
      continue;
    }

    const p = P[truth * NQ + best];
    let w;
    if (Math.random() < noise) w = [1, .75, .5, .25, 0][Math.floor(Math.random() * 5)];
    else w = Math.random() < p ? 1 : 0;
    for (let i = 0; i < NC; i++) {
      const pi = P[i * NQ + best];
      log[i] += Math.log(Math.max(w * pi + (1 - w) * (1 - pi), 1e-9));
    }
    asked[best] = 1; cc[CIDX[best]]++; n++;
  }
}

const W = CHARACTERS.map(c => c.prior), TOT = W.reduce((a, b) => a + b, 0);
function sample() { let r = Math.random() * TOT; for (let i = 0; i < NC; i++) { r -= W[i]; if (r <= 0) return i; } return NC - 1; }

function run(conf, ratio, minq, maxq, noise, N) {
  let t1 = 0, t3 = 0, sq = 0;
  for (let i = 0; i < N; i++) { const t = sample(); const r = play(t, noise, conf, ratio, minq, maxq);
    sq += r.n; if (r.guesses[0] === t) t1++; if (r.guesses.includes(t)) t3++; }
  return [t1 / N * 100, t3 / N * 100, sq / N];
}

console.log(`پایگاه: ${NC} شخصیت، ${NQ} سؤال\n`);
console.log('conf ratio min max | حدس‌اول  سه‌حدس  سؤال | نویز۱۰٪ اول  سه‌حدس');
for (const [conf, ratio, minq, maxq] of [
  [.90, 8, 6, 25], [.70, 5, 6, 22], [.55, 4, 6, 20], [.45, 3, 6, 20],
  [.35, 2.5, 6, 18], [.25, 2, 6, 18], [.20, 1.8, 6, 16],
]) {
  const a = run(conf, ratio, minq, maxq, 0, 700);
  const b = run(conf, ratio, minq, maxq, .1, 700);
  console.log(`${conf.toFixed(2)}  ${String(ratio).padStart(3)}  ${minq}  ${maxq} | ` +
    `${a[0].toFixed(1).padStart(5)}%  ${a[1].toFixed(1).padStart(5)}%  ${a[2].toFixed(1).padStart(4)} | ` +
    `${b[0].toFixed(1).padStart(5)}%  ${b[1].toFixed(1).padStart(5)}%`);
}
