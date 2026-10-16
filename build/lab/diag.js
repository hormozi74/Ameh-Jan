/* diagnostic harness: node diag.js N seed noise [html] [data] */
const fs = require('fs'), nodePath = require('path');
const BUILD = process.env.BUILD || '/Users/behtis/Documents/Personal Project/Ameh-Jan/build';
const N = +(process.argv[2] || 200), seed0 = +(process.argv[3] || 1), noise = +(process.argv[4] || 0);
const htmlPath = process.argv[5] || nodePath.join(BUILD, '..', 'ameh-jan.html');
const dataPath = process.argv[6] || nodePath.join(BUILD, 'data-block.js');
let seed = seed0 >>> 0 || 1;
Math.random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const src = fs.readFileSync(htmlPath, 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
globalThis.ENGF = JSON.parse(process.env.ENGF || '{}');
const engSrc = process.env.ENG_SRC ? fs.readFileSync(process.env.ENG_SRC, 'utf8') : src.slice(s, e);
const ENG = eval(engSrc + '\n;ENG');
/* سیاستِ حدس از ENG (ENG.GUESS)؛ CONSTS محیطی اورراید می‌کند (T4/STAG آزمایش‌های قدیمیِ خودِ diag‌اند) */
const CO = JSON.parse(process.env.CONSTS || '{}'); if (CO.EXT !== undefined && !CO.EXTS) CO.EXTS = [CO.EXT];
const C = Object.assign({}, ENG.GUESS, CO);
const MAX_GUESSES = C.MAX_GUESSES;
const idx = new Map(CHARACTERS.map((c, i) => [c.id, i]));

function hash32(str){ let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function rng(seedv){ let x = seedv >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
let gameNo = 0;
function play(truth) {
  const gseed = hash32(seed0 + ':' + gameNo + ':' + truth.id); gameNo++;
  const ansFor = qid => { const r = rng(hash32(gseed + '|' + qid)); return [r(), r(), r()]; };
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = new Set(), unk = new Set(), hist = [];
  let n = 0, lastRejAt = 0, nHard = 0, nSoft = 0; const guesses = [], reasons = [], ranks = [];
  const hHist = []; let stagUsed = 0;   // آنتروپی در هر گام — برای توقفِ درجازدن (CONSTS.STAG)
  const ti = idx.get(truth.id);
  for (;;) {
    const probs = ENG.toProbs(log);
    hHist[n] = ENG.entropy(probs);
    let bi = -1, b2 = -1;
    for (let i = 0; i < probs.length; i++) { if (rejected.has(i)) continue;
      if (bi < 0 || probs[i] > probs[bi]) { b2 = bi; bi = i; } else if (b2 < 0 || probs[i] > probs[b2]) b2 = i; }
    hist.push(bi);
    let st = null;
    /* حدسِ زودهنگام برای نامزدِ رده‌۴ (prior ≥ 3): CONSTS.T4 = {MINQ, CONF, RATIO} */
    if (C.T4 && CHARACTERS[bi].prior >= 3 && n >= C.T4.MINQ && probs[bi] > C.T4.CONF && probs[bi] / Math.max(probs[b2] ?? 1e-9, 1e-9) > C.T4.RATIO) st = { reason: 'conf4', soft: false };
    /* درجازدن: اگر در K سؤالِ آخر آنتروپی کمتر از DH بیت پایین آمده حدس بزن. CONSTS.STAG = {N0, K, DH} */
    else if (C.STAG && n >= C.STAG.N0 && n - C.STAG.K >= 0 && hHist[n - C.STAG.K] - hHist[n] < C.STAG.DH && !(stagUsed > 0 && n < stagUsed + C.STAG.K)) { st = { reason: 'stag', soft: false }; stagUsed = n; }
    let pool = null; const getPool = () => pool || (pool = ENG.rankQuestions(probs, asked, cc, unk));
    if (!st) st = ENG.guessReady({ probs, bi, b2, n, nHard, nSoft, lastRejAt, hist, pool: getPool }, C);
    let q = null;
    if (!st) { q = ENG.chooseQuestion(probs, asked, cc, unk, n, rejected, pool, C).q; if (!q) st = { reason: 'noq', soft: false }; }
    if (st) {
      let r = 1; for (let i = 0; i < probs.length; i++) if (!rejected.has(i) && probs[i] > probs[ti]) r++;
      ranks.push(r); reasons.push(st.reason + (st.soft ? '/نرم' : ''));
      guesses.push(bi);
      if (bi === ti) return { guesses, n, reasons, ranks, asked, pTruth: probs[ti], pTop: probs[bi] };
      if (st.soft) nSoft++; else nHard++;
      if (nHard >= MAX_GUESSES) return { guesses, n, reasons, ranks, asked, pTruth: probs[ti], pTop: probs[bi] };
      rejected.add(bi); log[bi] -= 8; lastRejAt = n;
      continue;
    }
    const p = truth.a[q.id];
    let w; const [r1, r2, r3] = ansFor(q.id);
    if (noise < 0) w = p >= .65 ? 1 : p <= .35 ? 0 : null;
    else if (r1 < noise) w = [1, .75, null, .25, 0][Math.floor(r2 * 5)];
    else w = r2 < p ? (r3 < .15 ? .75 : 1) : (r3 < .15 ? .25 : 0);
    if (w === null) unk.add(q.id);
    log = ENG.update(log, q, w);
    const qs = QSTAT[q.id] || (QSTAT[q.id] = { n: 0, ig: 0, pos: 0 }); qs.n++; qs.pos += n;
    const pe = getPool().find(x => x.q.id === q.id); if (pe) qs.ig += pe.ig;
    asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
}
const QSTAT = {};   // چند بار هر سؤال پرسیده شد، با چه بهره‌ای و کجای بازی
/* SAMPLE_FROM=<data-block>: حقیقت با priorِ آن فایل نمونه‌گیری می‌شود (برای مقایسه‌ی عادلانه‌ی TIER_PRIORهای متفاوت روی یک ترکیبِ ثابت) */
const sampleW = (() => { if (!process.env.SAMPLE_FROM) return null; const { CHARACTERS: SC } = eval(fs.readFileSync(process.env.SAMPLE_FROM, 'utf8') + '\n;({QUESTIONS,CHARACTERS})'); const m = new Map(SC.map(c => [c.id, c.prior])); return CHARACTERS.map(c => m.get(c.id) ?? c.prior); })();
const weights = sampleW || CHARACTERS.map(c => c.prior), total = weights.reduce((a, b) => a + b, 0);
const truthRng = rng(hash32('truth:' + seed0));
function sample() { if (process.env.UNIFORM) return CHARACTERS[Math.floor(truthRng() * CHARACTERS.length)];   // انتخابِ یکنواخت (بدترین حالت)
  let r = truthRng() * total; for (let i = 0; i < CHARACTERS.length; i++) { r -= weights[i]; if (r <= 0) return CHARACTERS[i]; } return CHARACTERS.at(-1); }

let t1 = 0, t3 = 0, sq = 0, reasonCnt = {}, rankHist = {}, nHist = {}, sep = [], fails = [];
for (let g = 0; g < N; g++) {
  const truth = sample();
  const r = play(truth);
  sq += r.n; nHist[r.n] = (nHist[r.n] || 0) + 1;
  const ti = idx.get(truth.id);
  if (r.guesses[0] === ti) t1++;
  if (r.guesses.includes(ti)) t3++;
  reasonCnt[r.reasons[0]] = (reasonCnt[r.reasons[0]] || 0) + 1;
  const rk = r.ranks[0] > 10 ? '>10' : r.ranks[0]; rankHist[rk] = (rankHist[rk] || 0) + 1;
  if (r.guesses[0] !== ti) {
    const gch = CHARACTERS[r.guesses[0]];
    let dif = [], askedDif = 0;
    for (const q of QUESTIONS) { const d = Math.abs(truth.a[q.id] - gch.a[q.id]); if (d > 0.5) { dif.push(q.id); if (r.asked.includes(q.id)) askedDif++; } }
    sep.push(dif.length);
    fails.push(`${truth.name} → حدس: ${gch.name}  n=${r.n} رتبه=${r.ranks[0]} pT=${r.pTruth.toFixed(2)} pG=${r.pTop.toFixed(2)} [${r.reasons[0]}] جداکننده‌ها=${dif.length} (پرسیده‌شده ${askedDif}): ${dif.slice(0,6).join(',')}`);
  }
}
const pct = x => (x / N * 100).toFixed(1) + '%';
console.log(`N=${N} seed=${seed0} noise=${noise} ${process.env.TAG||''} ${process.env.CONSTS||''} ${process.env.ENGF||''}  حدس اول ${pct(t1)}  سه حدس ${pct(t3)}  میانگین سؤال ${(sq / N).toFixed(1)}`);
console.log('دلیل توقف:', JSON.stringify(reasonCnt), ' رتبه‌ی حقیقت:', JSON.stringify(rankHist));
console.log('توزیع n:', Object.entries(nHist).sort((a,b)=>a[0]-b[0]).map(([k,v])=>`${k}:${v}`).join(' '));
const sh = {}; for (const x of sep) { const k = x === 0 ? '0' : x <= 2 ? '1-2' : x <= 5 ? '3-5' : '6+'; sh[k] = (sh[k] || 0) + 1; }
console.log('شکست‌ها بر حسب تعداد سؤال‌های جداکننده (Δp>0.5):', JSON.stringify(sh));
console.log(fails.slice(0, 40).join('\n'));
/* آمارِ سؤال‌ها: QSTAT=all همه را می‌دهد؛ QSTAT=id1,id2 فقط آن‌ها را */
if (process.env.QSTAT) {
  const want = process.env.QSTAT === 'all' ? Object.keys(QSTAT) : process.env.QSTAT.split(',');
  const rows = want.map(id => [id, QSTAT[id] || { n: 0, ig: 0, pos: 0 }]).sort((a, b) => b[1].n - a[1].n);
  console.log('سؤال: پرسیده‌شده در ٪بازی‌ها / میانگینِ IG / میانگینِ جایگاه');
  for (const [id, st] of rows) console.log(`  ${id.padEnd(16)} ${(st.n / N * 100).toFixed(0).padStart(3)}%  ig ${st.n ? (st.ig / st.n).toFixed(2) : '-'}  pos ${st.n ? (st.pos / st.n + 1).toFixed(1) : '-'}`);
}
