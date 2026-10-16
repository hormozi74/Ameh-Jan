/* بازیکنِ انسانیِ شبیه‌سازی‌شده: جواب‌ها از دانشِ عمومیِ من، نه از برچسب‌ها. node human-test.js [ENG_SRC via env] */
const fs = require('fs'), nodePath = require('path');
/* قرعه‌ی pickQuestion را قطعی می‌کنیم تا دو اجرا مقایسه‌پذیر باشند (SEED محیطی؛ پیش‌فرض ۱) */
let seed = (+process.env.SEED || 1) >>> 0; Math.random = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
const BUILD = process.env.BUILD || '/Users/behtis/Documents/Personal Project/Ameh-Jan/build';
const src = fs.readFileSync(nodePath.join(BUILD, '..', 'ameh-jan.html'), 'utf8');
const s = src.indexOf('const ENG'), e = src.indexOf('/* ==========================================================\n   یادگیری از بازی‌ها');
globalThis.ENGF = JSON.parse(process.env.ENGF || '{}');
const { QUESTIONS, CHARACTERS } = eval(fs.readFileSync(process.env.DATA || nodePath.join(BUILD, 'data-block.js'), 'utf8') + '\n;({QUESTIONS,CHARACTERS})');
const ENG = eval((process.env.ENG_SRC ? fs.readFileSync(process.env.ENG_SRC, 'utf8') : src.slice(s, e)) + '\n;ENG');
/* سیاستِ حدس از خودِ ENG (همان بازی)؛ CONSTS محیطی اورراید می‌کند */
const CO = JSON.parse(process.env.CONSTS || '{}'); if (CO.EXT !== undefined && !CO.EXTS) CO.EXTS = [CO.EXT];
const C = Object.assign({}, ENG.GUESS, CO);
const W = {Y: 1, y: .75, '?': null, n: .25, N: 0};
const { first } = require(nodePath.join(BUILD, 'letter-questions.js'));
const LETTERS = ['ا','ب','پ','ت','ج','چ','ح','خ','د','ر','ز','ژ','س','ش','ص','ط','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی','ث','ذ','ض','ظ'];

/* name, letter-name, answers (everything else = N) */
const PROFILES = (process.env.PROFILES || nodePath.join(__dirname, 'profiles.json')).split(',').flatMap(f => { const d = JSON.parse(fs.readFileSync(f.trim(), 'utf8')); return Array.isArray(d) ? d : Object.values(d); });

const idx = new Map(CHARACTERS.map((c, i) => [c.id, i]));
let wins = 0, wins3 = 0, tot = 0, nSum = 0;
for (const [truthName, letterName, A] of PROFILES) {
  /* «نام#book» = بازیکن به خودِ کتاب فکر می‌کند، «نام#film» به فیلم (۱۵ اکتبر ۲۰۲۶) */
  const [tn0, th] = truthName.split('|');
  const [tn, kind] = tn0.split('#');
  const ti = CHARACTERS.findIndex(c => c.name === tn && (kind === 'book' ? c.b : kind === 'film' ? c.f : !c.f && !c.b) && (!th || c.hint.includes(th)));
  if (ti < 0) { console.log('!! نیست:', truthName); continue; }
  const truth = CHARACTERS[ti];
  const ans = q => {
    if (q.cluster === 'letter') { const L = LETTERS[+q.id.slice(3)]; return first(letterName) === L ? 1 : 0; }
    return W[A[q.id] ?? (process.env.DEF || '?')];
  };
  let log = CHARACTERS.map(c => Math.log(c.prior));
  const asked = [], cc = {}, rejected = new Set(), unk = new Set(), hist = []; let n = 0, lastRejAt = 0, nHard = 0, nSoft = 0; const guesses = [], lines = []; let correctIdx = -1;
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
      let r = 1; for (let i = 0; i < probs.length; i++) if (!rejected.has(i) && probs[i] > probs[ti]) r++;
      guesses.push(`${CHARACTERS[bi].name}(${(probs[bi]*100).toFixed(0)}%,${st.reason}${st.soft ? '/نرم' : ''},رتبه‌ی حقیقت ${r})`);
      const hit = bi === ti || (kind === 'book' && CHARACTERS[bi].name === truth.name);
      if (hit) { correctIdx = guesses.length; break; }
      if (st.soft) nSoft++; else nHard++;
      if (nHard >= C.MAX_GUESSES) break;
      rejected.add(bi); log[bi] -= 8; lastRejAt = n; continue;
    }
    const w = ans(q);
    lines.push(`${q.id}=${w === null ? '?' : w}/${(truth.a[q.id] ?? .5).toFixed(2)}${w !== null && ((w >= .5) !== ((truth.a[q.id] ?? .5) >= .5)) ? '✗' : ''}`);
    if (w === null) unk.add(q.id);
    log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
  /* کتابِ هم‌نام با شخصیت («هری پاتر»): بازیکن هر کدام را عمه بگوید قبول می‌کند */
  const won = correctIdx > 0;
  tot++; if (won) wins++; if (won && correctIdx <= 3) wins3++; nSum += n;
  if (process.env.QUIET) {} else console.log(`\n### ${truthName} — ${won ? 'بُرد' : 'باخت'} با ${n} سؤال\n  حدس‌ها: ${guesses.join(' → ')}\n  مسیر: ${lines.join(' ')}`);
}
/* «بُرد» = تا MAX_GUESSES حدس (بازیِ واقعی)؛ «تا سه حدس» برای مقایسه با خطِ مبنای قدیم */
console.log(`\nبُرد ${wins}/${tot}   تا سه حدس ${wins3}/${tot}   میانگینِ سؤال ${(nSum / (tot || 1)).toFixed(1)}`);
