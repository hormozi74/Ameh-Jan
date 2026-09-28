/* ============================================================
   جاروب آستانه‌ی حدس — با خودِ موتورِ داخل بازی، نه بازنویسی موازی.
   sweep-full و sweep2-run هرکدام یک موتور عددی جدا داشتند که argmax قطعی
   می‌زد؛ بازیِ واقعی بین سؤال‌های هم‌تراز قرعه می‌اندازد، پس عددهای آن‌ها
   کمی خوش‌بینانه بود. این یکی همان ENB منتشرشده را اجرا می‌کند.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, 'data-block.js');
const HTML = path.join(__dirname, '..', 'ameh-jan.html');

const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(DATA, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const src = fs.readFileSync(HTML, 'utf8');
// موتور تا پیش از بلوک یادگیری — LEARN به localStorage وابسته است و در Node نیست
const s = src.indexOf('const ENG = (() =>');
const e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const ENG = eval(src.slice(s, e) + '\n;ENG');

function play(truth, noise, cfg) {
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = [], guesses = [];
  let n = 0;
  for (;;) {
    const probs = ENG.toProbs(log);
    const top = CHARACTERS.map((c, i) => ({ c, p: probs[i] }))
      .filter(x => !rejected.includes(x.c.id)).sort((a, b) => b.p - a.p);
    const conf = Math.max(cfg.confFloor, (cfg.confStart ?? 0.92) - cfg.decay * Math.max(0, n - cfg.minq));
    const ready = (n >= cfg.minq && top[0].p > conf &&
                   top[0].p / Math.max(top[1]?.p ?? 1e-9, 1e-9) > cfg.ratio) || n >= cfg.maxq;
    const q = ready ? null : ENG.pickQuestion(probs, asked, cc);
    if (ready || !q) {
      if (!top.length) return { guesses, n };
      guesses.push(top[0].c.id);
      if (top[0].c.id === truth.id || guesses.length >= 3) return { guesses, n };
      rejected.push(top[0].c.id);
      log[CHARACTERS.findIndex(c => c.id === top[0].c.id)] -= 8;
      continue;
    }
    const p = truth.a[q.id];
    let w;
    if (Math.random() < noise) w = [1, .75, null, .25, 0][Math.floor(Math.random() * 5)];
    else w = Math.random() < p ? (Math.random() < .15 ? .75 : 1) : (Math.random() < .15 ? .25 : 0);
    log = ENG.update(log, q, w);
    asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
}

const W = CHARACTERS.map(c => c.prior), TOT = W.reduce((a, b) => a + b, 0);
function sample() { let r = Math.random() * TOT; for (let i = 0; i < CHARACTERS.length; i++) { r -= W[i]; if (r <= 0) return CHARACTERS[i]; } return CHARACTERS.at(-1); }

function run(cfg, noise, N) {
  let t1 = 0, t3 = 0, sq = 0;
  for (let i = 0; i < N; i++) {
    const t = sample(), r = play(t, noise, cfg);
    sq += r.n;
    if (r.guesses[0] === t.id) t1++;
    if (r.guesses.includes(t.id)) t3++;
  }
  return [t1 / N * 100, t3 / N * 100, sq / N];
}

const N = +(process.argv[2] || 400);
console.log(`پایگاه: ${CHARACTERS.length} شخصیت، ${QUESTIONS.length} سؤال   (${N} بازی در هر ردیف)\n`);
console.log('کف  شیب   نسبت کمینه سقف | حدس‌اول  سه‌حدس  سؤال | نویز۱۰٪: اول  سه‌حدس');
const GRID = [
  { confFloor: .80, decay: .000, confStart: .80, ratio: 6, minq: 8, maxq: 28 },  // ثابت
  { confFloor: .60, decay: .020, confStart: .95, ratio: 6, minq: 8, maxq: 28 },
  { confFloor: .50, decay: .030, confStart: .97, ratio: 6, minq: 8, maxq: 28 },
  { confFloor: .70, decay: .015, confStart: .95, ratio: 6, minq: 8, maxq: 28 },
  { confFloor: .80, decay: .010, confStart: .95, ratio: 6, minq: 8, maxq: 28 },
  { confFloor: .60, decay: .020, confStart: .95, ratio: 4, minq: 8, maxq: 28 },
];
for (const cfg of GRID) {
  const a = run(cfg, 0, N), b = run(cfg, .1, N);
  console.log(
    `${cfg.confFloor.toFixed(2)} ${cfg.decay.toFixed(3)}  ${String(cfg.ratio).padStart(3)}   ` +
    `${String(cfg.minq).padStart(2)}   ${String(cfg.maxq).padStart(2)} | ` +
    `${a[0].toFixed(1).padStart(5)}%  ${a[1].toFixed(1).padStart(5)}%  ${a[2].toFixed(1).padStart(4)} | ` +
    `${b[0].toFixed(1).padStart(8)}%  ${b[1].toFixed(1).padStart(5)}%`);
}
