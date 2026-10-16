/* تست دقت روی داده‌ی تولیدشده — با همان سیاستِ حدسِ بازی (ENG.GUESS: چهار حدس، حدسِ نرم، تمرکز) */
const fs = require('fs');
const nodePath = require('path');
const dataPath = process.argv[2] || nodePath.join(__dirname, 'data-block.js');
const htmlPath = process.argv[3] || nodePath.join(__dirname, '..', 'ameh-jan.html');
const src = fs.readFileSync(htmlPath, 'utf8');
// موتور تا پیش از بلوک یادگیری — LEARN به localStorage وابسته است و در Node نیست
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval(src.slice(s, e) + '\n;ENG');

/* سیاستِ حدس (سقف، آستانه‌ها، حدسِ نرم، تمرکز) از خودِ ENG می‌آید — همان چیزی که بازی اجرا می‌کند */
const CO = JSON.parse(process.env.CONSTS || '{}'); if (CO.EXT !== undefined && !CO.EXTS) CO.EXTS = [CO.EXT];
const G = Object.assign({}, ENG.GUESS, CO), MAX_GUESSES = G.MAX_GUESSES;   // CONSTS محیطی: اوررایدِ سیاست (مثلاً سیاستِ قدیم)

function play(truth, noise) {
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = new Set(), unk = new Set(), hist = [];
  let n = 0, lastRejAt = 0, nHard = 0, nSoft = 0; const guesses = [];
  const ti = CHARACTERS.indexOf(truth);
  for (;;) {
    const probs = ENG.toProbs(log);
    let bi = -1, b2 = -1;
    for (let i = 0; i < probs.length; i++) { if (rejected.has(i)) continue; if (bi < 0 || probs[i] > probs[bi]) { b2 = bi; bi = i; } else if (b2 < 0 || probs[i] > probs[b2]) b2 = i; }
    if (bi < 0) return { guesses, n };
    hist.push(bi);
    let pool = null; const getPool = () => pool || (pool = ENG.rankQuestions(probs, asked, cc, unk));
    let st = ENG.guessReady({ probs, bi, b2, n, nHard, nSoft, lastRejAt, hist, pool: getPool }, G);
    let q = null;
    if (!st) { q = ENG.chooseQuestion(probs, asked, cc, unk, n, rejected, pool, G).q; if (!q) st = { reason: 'noq', soft: false }; }
    if (st) {
      guesses.push(CHARACTERS[bi].id);
      if (bi === ti) return { guesses, n };
      if (st.soft) nSoft++; else nHard++;
      if (nHard >= MAX_GUESSES) return { guesses, n };
      rejected.add(bi); log[bi] -= 8; lastRejAt = n;
      continue;
    }
    const p = truth.a[q.id];
    let w;
    if (Math.random() < noise) w = [1, .75, null, .25, 0][Math.floor(Math.random() * 5)];
    else w = Math.random() < p ? (Math.random() < .15 ? .75 : 1) : (Math.random() < .15 ? .25 : 0);
    if (w === null) unk.add(q.id);
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
  console.log(`نویز ${(noise*100).toFixed(0)}%  →  حدس اول: ${(t1/N*100).toFixed(1)}%   تا ${MAX_GUESSES} حدس: ${(t3/N*100).toFixed(1)}%   میانگین سؤال: ${(sq/N).toFixed(1)}`);
}

// همان تست ولی با انتخاب یکنواخت (شامل شخصیت‌های گمنام) — بدترین حالت
let u1 = 0, u3 = 0, N = 400;
for (let i = 0; i < N; i++) {
  const truth = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const r = play(truth, 0);
  if (r.guesses[0] === truth.id) u1++;
  if (r.guesses.includes(truth.id)) u3++;
}
console.log(`انتخاب یکنواخت (بدترین حالت) → حدس اول: ${(u1/N*100).toFixed(1)}%   تا ${MAX_GUESSES} حدس: ${(u3/N*100).toFixed(1)}%`);
console.log(`شخصیت‌ها: ${CHARACTERS.length}   سؤال‌ها: ${QUESTIONS.length}`);
