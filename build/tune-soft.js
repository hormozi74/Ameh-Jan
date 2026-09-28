/* ============================================================
   جاروبِ SOFT — نرمیِ درست‌نمایی در ENG.update.

   سه نوع بازیکن شبیه‌سازی می‌شود:
   ۰٪   بی‌خطا (جواب همیشه از روی احتمال شخصیت)
   ۱۰٪  گاهی جوابِ کاملاً تصادفی
   ۲۰٪  خیلی حواس‌پرت — بدترین حالتِ واقع‌بینانه

   عددِ برنده باید در ۰٪ چیزی از دست ندهد و در ۱۰-۲۰٪ چشمگیر بخرد.
   اجرا:  node tune-soft.js [تعداد بازی]
   ============================================================ */
const fs = require('fs');
const path = require('path');

const HTML = path.join(__dirname, '..', 'ameh-jan.html');
const { QUESTIONS, CHARACTERS } = eval(
  fs.readFileSync(path.join(__dirname, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const src = fs.readFileSync(HTML, 'utf8');
const ENG = eval(src.slice(src.indexOf('const ENG = (() =>'),
  src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها')) + '\n;ENG');

const MAXQ = 28, MINQ = 8, RATIO = 6, CONF = 0.80, IG_FLOOR = 0.15;

function play(truth, noise) {
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = [], guesses = [];
  let n = 0;
  for (;;) {
    const probs = ENG.toProbs(log);
    const top = CHARACTERS.map((c, i) => ({ c, p: probs[i] }))
      .filter(x => !rejected.includes(x.c.id)).sort((a, b) => b.p - a.p);
    let ready = (n >= MINQ && top[0].p > CONF &&
                 top[0].p / Math.max(top[1]?.p ?? 1e-9, 1e-9) > RATIO) || n >= MAXQ;
    const pool = ready ? null : ENG.rankQuestions(probs, asked, cc);
    if (!ready && n >= MINQ && pool.reduce((m, x) => Math.max(m, x.ig), 0) < IG_FLOOR) ready = true;
    const q = ready ? null : ENG.pickQuestion(probs, asked, cc, pool);
    if (ready || !q) {
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

function run(noise, N) {
  let t1 = 0, t3 = 0, sq = 0;
  for (let i = 0; i < N; i++) {
    const t = sample(), r = play(t, noise);
    sq += r.n;
    if (r.guesses[0] === t.id) t1++;
    if (r.guesses.includes(t.id)) t3++;
  }
  return [t1 / N * 100, t3 / N * 100, sq / N];
}

const N = +(process.argv[2] || 300);
console.log(`پایگاه: ${CHARACTERS.length} شخصیت   (${N} بازی در هر خانه)\n`);
console.log('SOFT | بی‌خطا: اول سه‌حدس سؤال | ۱۰٪: اول سه‌حدس سؤال | ۲۰٪: اول سه‌حدس سؤال');
for (const soft of [0, 0.05, 0.10, 0.15, 0.22, 0.30]) {
  ENG.setSoft(soft);
  const a = run(0, N), b = run(.1, N), c = run(.2, N);
  const f = x => `${x[0].toFixed(1).padStart(5)}% ${x[1].toFixed(1).padStart(5)}% ${x[2].toFixed(1).padStart(4)}`;
  console.log(`${soft.toFixed(2)} | ${f(a)} | ${f(b)} | ${f(c)}`);
}
