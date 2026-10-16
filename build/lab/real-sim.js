/* شبیه‌سازِ «بازیکنِ واقعی» — نه برنولیِ i.i.d.
   node real-sim.js N seed [html] [data]
   محیط: ENG_SRC (موتورِ جایگزین)، ENGF (پرچم‌ها؛ ENGF='{"guess":{"MAXQ":24}}' سیاستِ حدس)، CONSTS ('{"MAXQ":32,...}' اوررایدِ ENG.GUESS)،
         PRIOR ('{"3":6,"1.4":2.2,"0.6":0.6,"0.25":0.12}' بازنگاشتِ prior بر حسبِ مقدارِ فعلی)،
         FAME ('{"4":.5,"3":.35,"2":.12,"1":.03}' سهمِ هر رده در انتخابِ حقیقت)،
         SLOPPY (نسبتِ بازیکنانِ شلخته، پیش‌فرض .3)، VERBOSE=1 (چاپِ باخت‌ها)

   مدلِ بازیکن (برای هر سؤال، بر حسبِ جنسِ سؤال):
     crisp  (جنسیت، واقعی/خیالی، ملیت، حیوان، داغ، حرفِ اول…): قابلِ اعتماد ۰.۹۵، «نمی‌دونم» ۰.۰۳
     medium (رسانه، شغل، ظاهر، سرشت، دنیا، دوره…):               ۰.۸۵، ۰.۱۲
     soft   (جدی، محبوب، همه می‌شناسن، پولدار، جایزه، ازدواج…):  ۰.۷۰، ۰.۳۰
   «غیرقابلِ اعتماد» یعنی بازیکن برداشتِ دیگری دارد و سمتِ مخالفِ داده جواب می‌دهد.
   ۳۰٪ بازیکن‌ها «شلخته»اند: قابلیتِ اعتماد ۰.۱۵ کمتر. */
const fs = require('fs'), nodePath = require('path');
const BUILD = process.env.BUILD || nodePath.join(__dirname, '..');   // lab/ → build/
const N = +(process.argv[2] || 300), seed0 = +(process.argv[3] || 1);
const htmlPath = process.argv[4] || nodePath.join(BUILD, '..', 'ameh-jan.html');
const dataPath = process.argv[5] || nodePath.join(BUILD, 'data-block.js');
let seed = seed0 >>> 0 || 1;
Math.random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const src = fs.readFileSync(htmlPath, 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(dataPath, 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
if (process.env.PRIOR) { const m = JSON.parse(process.env.PRIOR); for (const c of CHARACTERS) if (m[c.prior] !== undefined) c.prior = m[c.prior]; }
globalThis.ENGF = JSON.parse(process.env.ENGF || '{}');
const engSrc = process.env.ENG_SRC ? fs.readFileSync(process.env.ENG_SRC, 'utf8') : src.slice(s, e);
const ENG = eval(engSrc + '\n;ENG');
/* سیاستِ حدس از خودِ ENG (ENG.GUESS, guessReady, chooseQuestion) — همان چیزی که بازی اجرا می‌کند؛ CONSTS اورراید می‌کند */
const CO = JSON.parse(process.env.CONSTS || '{}'); if (CO.EXT !== undefined && !CO.EXTS) CO.EXTS = [CO.EXT];
const C = Object.assign({}, ENG.GUESS, CO);
const SLOPPY = process.env.SLOPPY !== undefined ? +process.env.SLOPPY : 0.3;

/* ---- جنسِ سؤال ---- */
const CRISP = new Set(['male','alive','real','iranian','american','european','eastern','animal','robot','puppet','cartoon_char','footballer','athlete','singer','actor','poet','wrestler','dancer','doctor','is_film','tvhost','scientist','teacher','cop','soldier','criminal']);
const SOFT = new Set(['serious','beloved','comedy','love','epic','pop','traditional','controversial','legend','everyone','world','kids','rich','award','married_fam','old_person','active','child_star','died_young','religious','ruler','businessman','techie','inventor','newgen','dahe60','prerev','ancient','internet','costume','lead','hero','single_media','multi_media','from_book']);
function kindOf(q){
  if (q.cluster === 'letter' || q.cluster === 'hot' || q.cluster === 'kin' || q.cluster === 'fam') return 'crisp';
  if (CRISP.has(q.id)) return 'crisp';
  if (SOFT.has(q.id) || q.id.startsWith('f_')) return 'soft';
  return 'medium';
}
const RB = +(process.env.REL_BONUS || 0);
const REL = { crisp: Math.min(.995, .97 + RB), medium: Math.min(.99, .90 + RB), soft: Math.min(.99, .75 + RB) }, UNK = { crisp: .03, medium: .12, soft: .30 };
const QKIND = QUESTIONS.map(kindOf);

function hash32(str){ let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function rng(seedv){ let x = seedv >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
const idx = new Map(CHARACTERS.map((c, i) => [c.id, i]));
const QI = new Map(QUESTIONS.map((q, i) => [q.id, i]));

let gameNo = 0; const REASONS = {};
function play(truth){
  const gseed = hash32(seed0 + ':' + gameNo + ':' + truth.id); gameNo++;
  const g = rng(gseed);
  const sloppy = g() < SLOPPY;
  // جوابِ ثابتِ این بازیکن برای هر سؤال (برداشتش عوض نمی‌شود)
  const answerCache = new Map();
  const ansFor = q => {
    if (answerCache.has(q.id)) return answerCache.get(q.id);
    const r = rng(hash32(gseed + '|' + q.id));
    const kind = QKIND[QI.get(q.id)];
    const p = truth.a[q.id] ?? 0.5;
    let w;
    const unk = UNK[kind] + (sloppy ? .05 : 0), rel = REL[kind] - (sloppy ? ({crisp:.01, medium:.06, soft:.12})[kind] : 0);
    if (q.cluster === 'letter') w = p >= .5 ? 1 : 0;           // حرفِ اول را آدم بلد است
    else if (r() < unk) w = null;
    else {
      const faithful = r() < rel;
      const side = faithful ? (r() < p) : !(r() < p);           // بله یا نه
      const hedge = r() < (kind === 'crisp' ? .1 : .3);
      w = side ? (hedge ? .75 : 1) : (hedge ? .25 : 0);
    }
    answerCache.set(q.id, w);
    return w;
  };
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = new Set(), unk = new Set(), hist = [];
  let n = 0, lastRejAt = 0, nHard = 0, nSoft = 0, correctIdx = -1; const guessAt = [], gReason = [], trace = [];
  const ti = idx.get(truth.id);
  for (;;) {
    const probs = ENG.toProbs(log);
    let bi = -1, b2 = -1;
    for (let i = 0; i < probs.length; i++) { if (rejected.has(i)) continue; if (bi < 0 || probs[i] > probs[bi]) { b2 = bi; bi = i; } else if (b2 < 0 || probs[i] > probs[b2]) b2 = i; }
    hist.push(bi);
    let pool = null; const getPool = () => pool || (pool = ENG.rankQuestions(probs, asked, cc, unk));
    let st = ENG.guessReady({ probs, bi, b2, n, nHard, nSoft, lastRejAt, hist, pool: getPool }, C);
    let q = null;
    if (!st) { q = ENG.chooseQuestion(probs, asked, cc, unk, n, rejected, pool, C).q; if (!q) st = { reason: 'noq', soft: false }; }
    if (st) {
      REASONS[st.reason] = (REASONS[st.reason] || 0) + 1;
      guessAt.push(n); gReason.push(st.reason);
      if (bi === ti) { correctIdx = guessAt.length; break; }
      if (st.soft) nSoft++; else nHard++;
      if (nHard >= C.MAX_GUESSES) break;
      rejected.add(bi); log[bi] -= 8; lastRejAt = n;
      continue;
    }
    const w = ansFor(q);
    if (process.env.VERBOSE === '2') trace.push(`${q.id}=${w === null ? '?' : w}/${(truth.a[q.id] ?? .5).toFixed(2)}${w !== null && ((w >= .5) !== ((truth.a[q.id] ?? .5) >= .5)) ? '✗' : ''}`);
    if (w === null) unk.add(q.id);
    log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
  const probs = ENG.toProbs(log);
  let r = 1; for (let i = 0; i < probs.length; i++) if (probs[i] > probs[ti]) r++;
  if (process.env.VERBOSE === '2' && correctIdx < 0 && gameNo <= 12) console.log(`\n✗ ${truth.name}${sloppy ? ' (شلخته)' : ''} رتبه=${r} حدس در ${guessAt.join(',')} (${gReason.join(',')})\n  ${trace.join(' ')}`);
  return { won: correctIdx > 0, correctIdx, first: correctIdx === 1, n, firstGuessAt: guessAt[0], firstReason: gReason[0], correctAt: correctIdx > 0 ? guessAt[correctIdx - 1] : -1, guesses: guessAt.length, rank: r, sloppy };
}

/* انتخابِ حقیقت: سهمِ هر رده (FAME)، داخلِ رده یکنواخت */
const tierOf = c => c.prior >= 3 ? 4 : c.prior >= 1.4 ? 3 : c.prior >= .6 ? 2 : 1;
const FAME = Object.assign({ 4: .5, 3: .35, 2: .12, 1: .03 }, JSON.parse(process.env.FAME || '{}'));
const byTier = { 1: [], 2: [], 3: [], 4: [] };
for (const c of CHARACTERS) if (!c.k) byTier[tierOf(c)].push(c);
const truthRng = rng(hash32('truth:' + seed0));
function sample(){ let r = truthRng(); for (const t of [4, 3, 2, 1]) { r -= FAME[t]; if (r <= 0) { const arr = byTier[t]; return arr[Math.floor(truthRng() * arr.length)]; } } return byTier[1][0]; }

const res = [];
const t0 = Date.now();
for (let i = 0; i < N; i++) { const truth = sample(); const r = play(truth); r.name = truth.name; r.tier = tierOf(truth); res.push(r); if (process.env.VERBOSE && !r.won) console.log(`  باخت: ${truth.name} (رده${r.tier}${r.sloppy ? '، شلخته' : ''}) n=${r.n} رتبه=${r.rank} حدس‌ها=${r.guesses}`); }
const pct = x => (100 * x / N).toFixed(1) + '%';
const wk = k => res.filter(r => r.won && r.correctIdx <= k).length;
const won = res.filter(r => r.won), first = res.filter(r => r.first);
const ns = res.map(r => r.n).sort((a, b) => a - b);
const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
/* «تا سه حدس» برای مقایسه با خطِ مبنای قدیم؛ «تا چهار حدس» = بُردِ واقعیِ بازی (MAX_GUESSES).
   «به سقف رسیده» = بازی‌هایی که از ۳۲ سؤال (سقفِ قدیم) گذشتند؛ «اولین حدس اجباری» = سقف حدس را تحمیل کرد، نه اطمینان. */
console.log(`بازی: ${N}   حدسِ اول: ${pct(first.length)}   تا سه حدس: ${pct(wk(3))}   تا چهار حدس: ${pct(wk(4))}   میانگینِ سؤال: ${mean(ns).toFixed(1)}   میانه: ${ns[Math.floor(N / 2)]}`);
console.log(`بُرد در ≤۲۰ سؤال: ${pct(res.filter(r => r.won && r.correctAt <= 20).length)}   بُرد در ≤۲۵: ${pct(res.filter(r => r.won && r.correctAt <= 25).length)}   میانگینِ سؤال تا حدسِ درست: ${mean(won.map(r => r.correctAt)).toFixed(1)}   اولین حدس به‌طورِ میانگین در سؤالِ ${mean(res.map(r => r.firstGuessAt)).toFixed(1)}   بازی‌های به سقف رسیده: ${pct(res.filter(r => r.n >= 32).length)}   اولین حدس اجباری: ${pct(res.filter(r => r.firstReason === 'maxq').length)}`);
console.log(`  حدس در هر بازی: ${mean(res.map(r => r.guesses)).toFixed(2)}   طولِ بُردها: ${mean(won.map(r => r.n)).toFixed(1)}   طولِ باخت‌ها: ${mean(res.filter(r => !r.won).map(r => r.n)).toFixed(1)}   دلیلِ حدس‌ها: ${JSON.stringify(REASONS)}`);
for (const t of [4, 3, 2, 1]) { const g = res.filter(r => r.tier === t); if (g.length) console.log(`  رده${t}: ${g.length} بازی، حدسِ اول ${(100 * g.filter(r => r.first).length / g.length).toFixed(0)}%، تا چهار حدس ${(100 * g.filter(r => r.won).length / g.length).toFixed(0)}%، میانگین ${mean(g.map(r => r.n)).toFixed(1)}`); }
const rk = { '1': 0, '2-3': 0, '4-10': 0, '11-50': 0, '51+': 0 };
for (const r of res) if (!r.won) { const x = r.rank; rk[x <= 1 ? '1' : x <= 3 ? '2-3' : x <= 10 ? '4-10' : x <= 50 ? '11-50' : '51+']++; }
console.log('  رتبه‌ی حقیقت در باخت‌ها:', JSON.stringify(rk));
const sl = res.filter(r => r.sloppy), ok = res.filter(r => !r.sloppy);
console.log(`  دقیق: تا چهار حدس ${(100 * ok.filter(r => r.won).length / (ok.length || 1)).toFixed(0)}%   شلخته: ${(100 * sl.filter(r => r.won).length / (sl.length || 1)).toFixed(0)}%   (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
