/* ============================================================
   کوکِ «چند سؤال تا حدس».

   sweep3 فقط آستانه‌ی حدس را جابه‌جا می‌کرد. ولی طولِ بازی را سه چیز
   می‌سازد و دوتایش داخلِ انتخابِ سؤال است، نه آستانه:
     • جریمه‌ی تکرارِ کلاستر (0.6^n) — تنوع می‌آورد ولی سؤالِ بهتر را رد می‌کند
     • قرعه بین سؤال‌های هم‌تراز (slack) — بازی را متنوع می‌کند، طولش را زیاد
     • آستانه‌ی اطمینان
   این‌جا هر سه با هم جاروب می‌شوند تا معلوم شود کدام ترکیب بدون افتِ دقت
   بازی را کوتاه می‌کند.

   اجرا:  node tune.js [تعداد بازی در هر ردیف]
   ============================================================ */
const fs = require('fs');
const path = require('path');

const { QUESTIONS, CHARACTERS } = eval(
  fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');

const NC = CHARACTERS.length, NQ = QUESTIONS.length;
const qids = QUESTIONS.map(q => q.id);
const CL = QUESTIONS.map(q => q.cluster);
const CLS = [...new Set(CL)], CI = CL.map(c => CLS.indexOf(c));
const clamp = p => Math.max(0.03, Math.min(0.97, p));

const P = new Float64Array(NC * NQ), LP = new Float64Array(NC * NQ), LN = new Float64Array(NC * NQ);
for (let c = 0; c < NC; c++) for (let q = 0; q < NQ; q++) {
  const p = clamp(CHARACTERS[c].a[qids[q]] ?? .5);
  P[c * NQ + q] = p; LP[c * NQ + q] = Math.log2(p); LN[c * NQ + q] = Math.log2(1 - p);
}
const PRIOR = CHARACTERS.map(c => Math.log(c.prior));

function play(truth, noise, cfg) {
  const log = Float64Array.from(PRIOR);
  const probs = new Float64Array(NC);
  const asked = new Uint8Array(NQ), cc = new Int32Array(CLS.length);
  const rejected = new Set();
  const guesses = [];
  let n = 0;

  for (;;) {
    let m = -Infinity;
    for (let i = 0; i < NC; i++) if (log[i] > m) m = log[i];
    let z = 0;
    for (let i = 0; i < NC; i++) { probs[i] = Math.exp(log[i] - m); z += probs[i]; }
    let H = 0;
    for (let i = 0; i < NC; i++) { probs[i] /= z; if (probs[i] > 1e-12) H -= probs[i] * Math.log2(probs[i]); }

    let b1 = -1, b2 = -1, p1 = -1, p2 = -1;
    for (let i = 0; i < NC; i++) {
      if (rejected.has(i)) continue;
      if (probs[i] > p1) { p2 = p1; b2 = b1; p1 = probs[i]; b1 = i; }
      else if (probs[i] > p2) { p2 = probs[i]; b2 = i; }
    }
    const ready = (n >= cfg.minq && p1 > cfg.conf && p1 / Math.max(p2, 1e-12) > cfg.ratio) || n >= cfg.maxq;

    let best = -1;
    if (!ready) {
      const pool = [];
      for (let q = 0; q < NQ; q++) {
        if (asked[q]) continue;
        let pY = 0, sw = 0, sv = 0;
        for (let i = 0; i < NC; i++) {
          const pi = probs[i]; if (pi <= 1e-9) continue;
          const row = i * NQ + q, lpi = Math.log2(pi);
          const w = pi * P[row], v = pi - w;
          pY += w;
          if (w > 1e-12) sw += w * (lpi + LP[row]);
          if (v > 1e-12) sv += v * (lpi + LN[row]);
        }
        if (pY < 1e-6 || pY > 1 - 1e-6) continue;
        const ig = H - (pY * Math.log2(pY) - sw) - ((1 - pY) * Math.log2(1 - pY) - sv);
        if (ig <= 0.01) continue;
        if (pY <= 0.10 || pY >= 0.90) continue;
        pool.push({ q, score: ig * Math.pow(cfg.pen, cc[CI[q]]) });
      }
      if (pool.length) {
        pool.sort((a, b) => b.score - a.score);
        const slack = n < 4 ? cfg.slack : n < 8 ? (1 + cfg.slack) / 2 : 1;
        const cut = pool[0].score * slack;
        const top = pool.filter(x => x.score >= cut).slice(0, 4);
        best = top[Math.floor(Math.random() * top.length)].q;
      }
    }

    if (ready || best < 0) {
      guesses.push(b1);
      if (b1 === truth || guesses.length >= 3 || n >= cfg.maxq) return { guesses, n };
      rejected.add(b1); log[b1] -= 8;
      continue;
    }

    const p = P[truth * NQ + best];
    let w;
    if (Math.random() < noise) w = [1, .75, .5, .25, 0][Math.floor(Math.random() * 5)];
    else w = Math.random() < p ? (Math.random() < .15 ? .75 : 1) : (Math.random() < .15 ? .25 : 0);
    for (let i = 0; i < NC; i++) {
      const pi = P[i * NQ + best];
      log[i] += Math.log(Math.max(w * pi + (1 - w) * (1 - pi), 1e-9));
    }
    asked[best] = 1; cc[CI[best]]++; n++;
  }
}

const W = CHARACTERS.map(c => c.prior), TOT = W.reduce((a, b) => a + b, 0);
function sample() { let r = Math.random() * TOT; for (let i = 0; i < NC; i++) { r -= W[i]; if (r <= 0) return i; } return NC - 1; }

function run(cfg, noise, N) {
  let t1 = 0, t3 = 0, sq = 0;
  for (let i = 0; i < N; i++) {
    const t = sample(), r = play(t, noise, cfg);
    sq += r.n;
    if (r.guesses[0] === t) t1++;
    if (r.guesses.includes(t)) t3++;
  }
  return [t1 / N * 100, t3 / N * 100, sq / N];
}

const N = +(process.argv[2] || 300);
console.log(`پایگاه: ${NC} شخصیت، ${NQ} سؤال   (${N} بازی در هر ردیف)\n`);
console.log('جریمه قرعه اطمینان نسبت کمینه سقف | حدس‌اول سه‌حدس سؤال | نویز۱۰٪: اول سه‌حدس');

const GRID = [];
for (const pen of [0.6, 0.85, 0.95, 1.0])
  for (const slack of [0.93, 1.0])
    for (const [conf, ratio, minq, maxq] of [[.80, 6, 8, 26], [.75, 5, 7, 22]])
      GRID.push({ pen, slack, conf, ratio, minq, maxq });

for (const cfg of GRID) {
  const a = run(cfg, 0, N), b = run(cfg, .1, N);
  console.log(
    `  ${cfg.pen.toFixed(1)}  ${cfg.slack.toFixed(2)}  ${cfg.conf.toFixed(2)}  ${String(cfg.ratio).padStart(2)}   ` +
    `${String(cfg.minq).padStart(2)}  ${String(cfg.maxq).padStart(2)} | ` +
    `${a[0].toFixed(1).padStart(5)}% ${a[1].toFixed(1).padStart(5)}% ${a[2].toFixed(1).padStart(5)} | ` +
    `${b[0].toFixed(1).padStart(8)}% ${b[1].toFixed(1).padStart(5)}%`);
}
