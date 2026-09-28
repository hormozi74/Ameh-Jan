/* ============================================================
   «وقتی هیچ سؤالی دیگر کمک نمی‌کند، بپرس که چه؟»

   تشخیص: بازی ۲۱ سؤال می‌پرسد ولی نیمه‌ی دوم‌شان تقریباً بی‌اثرند —
   وقتی دو نامزدِ باقی‌مانده واقعاً شبیه‌اند (دو شخصیتِ فرعی از یک سریال)،
   هیچ سؤالی جدایشان نمی‌کند و موتور فقط به‌خاطر شرطِ RATIO=6 به پرسیدن
   ادامه می‌دهد. بازیکن این را «۲۰ تا سؤال بی‌خود» حس می‌کند.

   راه‌حل: علاوه بر آستانه‌ی اطمینان، یک کفِ بهره‌ی اطلاعاتی. اگر بهترین
   سؤالِ باقی‌مانده کمتر از IG_FLOOR بیت می‌دهد، همان‌جا حدس بزن.

   این اسکریپت همان موتورِ داخل بازی را اجرا می‌کند و کف را جاروب می‌کند.
   اجرا:  node tune-igfloor.js [تعداد بازی]
   ============================================================ */
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, '..', 'ameh-jan.html');
const { QUESTIONS, CHARACTERS } = eval(
  fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const src = fs.readFileSync(HTML, 'utf8');
// موتور تا پیش از بلوک یادگیری — LEARN به localStorage وابسته است و در Node نیست
const ENG = eval(src.slice(src.indexOf('const ENG = (() =>'),
  src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها')) + '\n;ENG');

const MAXQ = 28, MINQ = 8, RATIO = 6, CONF = 0.80;

function play(truth, noise, igFloor) {
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = [], guesses = [];
  let n = 0, firstGuessAt = null;

  for (;;) {
    const probs = ENG.toProbs(log);
    const top = CHARACTERS.map((c, i) => ({ c, p: probs[i] }))
      .filter(x => !rejected.includes(x.c.id)).sort((a, b) => b.p - a.p);

    let ready = (n >= MINQ && top[0].p > CONF &&
                 top[0].p / Math.max(top[1]?.p ?? 1e-9, 1e-9) > RATIO) || n >= MAXQ;

    let q = null;
    if (!ready) {
      const pool = ENG.rankQuestions(probs, asked, cc);
      // بهترین بهره‌ی خامِ موجود — نه امتیازِ جریمه‌شده‌ی کلاستر
      const bestIG = pool.reduce((m, x) => Math.max(m, x.ig), 0);
      if (n >= MINQ && bestIG < igFloor) ready = true;
      else q = ENG.pickQuestion(probs, asked, cc, pool);
    }

    if (ready || !q) {
      if (firstGuessAt === null) firstGuessAt = n;
      guesses.push(top[0].c.id);
      if (top[0].c.id === truth.id || guesses.length >= 3) return { guesses, n, firstGuessAt };
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

function run(igFloor, noise, N) {
  let t1 = 0, t3 = 0, sf = 0, st = 0;
  for (let i = 0; i < N; i++) {
    const t = sample(), r = play(t, noise, igFloor);
    sf += r.firstGuessAt; st += r.n;
    if (r.guesses[0] === t.id) t1++;
    if (r.guesses.includes(t.id)) t3++;
  }
  return [t1 / N * 100, t3 / N * 100, sf / N, st / N];
}

const N = +(process.argv[2] || 400);
console.log(`پایگاه: ${CHARACTERS.length} شخصیت، ${QUESTIONS.length} سؤال   (${N} بازی در هر ردیف)\n`);
console.log('کفِ بهره | حدس‌اول سه‌حدس  سؤال‌تا‌حدس‌اول  کلِ‌بازی | نویز۱۰٪: اول سه‌حدس سؤال');
for (const f of [0, 0.02, 0.05, 0.08, 0.12, 0.18, 0.25]) {
  const a = run(f, 0, N), b = run(f, .1, N);
  console.log(`  ${f.toFixed(2)}   | ${a[0].toFixed(1).padStart(5)}% ${a[1].toFixed(1).padStart(5)}%` +
    `      ${a[2].toFixed(1).padStart(5)}       ${a[3].toFixed(1).padStart(5)} | ` +
    `${b[0].toFixed(1).padStart(8)}% ${b[1].toFixed(1).padStart(5)}% ${b[3].toFixed(1).padStart(5)}`);
}
