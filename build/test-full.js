/* تست دقت روی داده‌ی تولیدشده — با در نظر گرفتن ۳ حدس مجاز بازی */
const fs = require('fs');
const nodePath = require('path');
const dataPath = process.argv[2] || nodePath.join(__dirname, 'data-block.js');
const htmlPath = process.argv[3] || nodePath.join(__dirname, '..', 'ameh-jan.html');
const src = fs.readFileSync(htmlPath, 'utf8');
// موتور تا پیش از بلوک یادگیری — LEARN به localStorage وابسته است و در Node نیست
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

/* همان ثابت‌هایی که در بازی هستند — اگر آن‌جا عوض شدند این‌جا هم باید عوض شوند،
   وگرنه این تست چیزی را می‌سنجد که منتشر نشده است. */
const MAXQ = 28, MINQ = 8, RATIO = 6, CONF = 0.80, IG_FLOOR = 0.15, MAX_GUESSES = 3;

function play(truth, noise) {
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = [];
  let n = 0, guesses = [];
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
      if (!top.length) return { guesses, n };
      guesses.push(top[0].c.id);
      if (top[0].c.id === truth.id || guesses.length >= MAX_GUESSES) return { guesses, n };
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

// نمونه‌گیری متناسب با prior — یعنی همان‌طور که آدم‌ها واقعاً شخصیت انتخاب می‌کنند
const weights = CHARACTERS.map(c => c.prior);
const total = weights.reduce((a, b) => a + b, 0);
function sample() {
  let r = Math.random() * total;
  for (let i = 0; i < CHARACTERS.length; i++) { r -= weights[i]; if (r <= 0) return CHARACTERS[i]; }
  return CHARACTERS[CHARACTERS.length - 1];
}

for (const noise of [0, 0.1]) {
  let t1 = 0, t3 = 0, sq = 0, N = 400;
  for (let i = 0; i < N; i++) {
    const truth = sample();
    const r = play(truth, noise);
    sq += r.n;
    if (r.guesses[0] === truth.id) t1++;
    if (r.guesses.includes(truth.id)) t3++;
  }
  console.log(`نویز ${(noise*100).toFixed(0)}%  →  حدس اول: ${(t1/N*100).toFixed(1)}%   تا سه حدس: ${(t3/N*100).toFixed(1)}%   میانگین سؤال: ${(sq/N).toFixed(1)}`);
}

// همان تست ولی با انتخاب یکنواخت (شامل شخصیت‌های گمنام) — بدترین حالت
let u1 = 0, u3 = 0, N = 400;
for (let i = 0; i < N; i++) {
  const truth = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const r = play(truth, 0);
  if (r.guesses[0] === truth.id) u1++;
  if (r.guesses.includes(truth.id)) u3++;
}
console.log(`انتخاب یکنواخت (بدترین حالت) → حدس اول: ${(u1/N*100).toFixed(1)}%   تا سه حدس: ${(u3/N*100).toFixed(1)}%`);
console.log(`شخصیت‌ها: ${CHARACTERS.length}   سؤال‌ها: ${QUESTIONS.length}`);
