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
const PROFILES = [
 ['مهران مدیری', 'مهران', {male:'Y',alive:'Y',real:'Y',iranian:'Y',artist:'Y',actor:'Y',director:'Y',comedy:'Y',tv:'Y',series:'Y',active:'Y',beloved:'Y',everyone:'Y',beard:'Y',dahe60:'n',legend:'y',serious:'N',tvhost:'y',married_fam:'Y',old_person:'N',h_modiri:'Y',glasses:'n',rich:'Y',controversial:'y',world:'N',internet:'y',singer:'n',cinema:'y',h_ghahveh:'Y',h_barareh:'Y',theater:'?',kids:'y',pop:'?',newgen:'N'}],
 ['مسی', 'مسی', {male:'Y',alive:'Y',real:'Y',athlete:'Y',footballer:'Y',stadium:'Y',world:'Y',everyone:'Y',award:'Y',rich:'Y',beloved:'Y',legend:'Y',active:'Y',tv:'Y',h_barca:'Y',h_fifa:'Y',h_olympic:'Y',beard:'y',married_fam:'Y',american:'N',european:'n',internet:'Y',serious:'?',kids:'Y',h_realmadrid:'N',h_england:'N',h_teammelli:'N',old_person:'N',controversial:'N',newgen:'N'}],
 ['هری پاتر', 'هری', {multi_media:'y',from_book:'Y',single_media:'N',real:'N',alive:'N',male:'Y',book_media:'Y',cinema:'Y',kids:'Y',world:'Y',everyone:'Y',superpower:'Y',glasses:'Y',lead:'Y',teen:'Y',fantasy:'Y',h_hp:'Y',european:'Y',beloved:'Y',legend:'y',costume:'y',active:'?',american:'N',cartoon_char:'N',series:'n',school:'Y',f_school:'Y',teacher:'N',villain:'N',monster:'N',sword:'n',is_film:'N',hero:'Y',epic:'n',young:'Y'}],
 ['باب اسفنجی', 'باب', {multi_media:'y',from_book:'N',single_media:'n',real:'N',alive:'N',cartoon_char:'Y',cartoon_media:'Y',kids:'Y',animal:'y',male:'Y',comedy:'Y',lead:'Y',american:'Y',tv:'Y',everyone:'Y',world:'Y',f_sea:'Y',beloved:'Y',longrun:'Y',costume:'Y',series:'Y',is_film:'N',cinema:'y',monster:'N',superpower:'N',puppet:'N',h_disney:'N',h_looney:'N',weirdhair:'N',chubby:'N',teen:'N'}],
 ['محمدرضا شجریان', 'محمدرضا', {male:'Y',alive:'N',real:'Y',iranian:'Y',artist:'Y',singer:'Y',musician:'y',traditional:'Y',legend:'Y',everyone:'Y',beloved:'Y',old_person:'Y',prerev:'Y',dahe60:'Y',award:'y',world:'n',controversial:'y',serious:'Y',married_fam:'Y',glasses:'?',mustache:'n',beard:'y',poet:'N',died_young:'N',pop:'N',active:'N',tv:'n',h_la:'N',died_young:'N'}],
 ['جوکر', 'جوکر', {multi_media:'Y',from_book:'n',single_media:'N',real:'N',alive:'N',male:'Y',villain:'Y',h_dc:'Y',cinema:'Y',world:'Y',everyone:'Y',american:'Y',comedy:'y',masked:'n',costume:'Y',weirdhair:'Y',criminal:'Y',monster:'N',superpower:'N',lead:'y',serious:'n',beloved:'y',legend:'Y',horror:'n',gun:'y',cartoon_char:'n',book_media:'y',is_film:'N',f_superhero:'N',controversial:'Y',h_marvel:'N',series:'n',game:'y'}],
 ['خاله', 'زهرا', {fam_close:'Y',real:'Y',alive:'Y',iranian:'Y',male:'N',fam_blood:'Y',fam_mat:'Y',fam_pat:'N',fam_older:'Y',fam_punc:'Y',married_fam:'Y',old_person:'N',everyone:'N',tv:'N',world:'N',kids:'Y',fam_you_male:'Y',fam_via_male:'N',beloved:'Y',glasses:'N',fam_inlaw:'N',fam_gen0:'N',fam_g2up:'N',fam_own_parent:'N',fam_child:'N',fam_cousin:'N',fam_nibling:'N',fam_samehouse:'N',fam_step:'N',fam_spouse:'N',fam_married_in:'N',fam_sib:'N',fam_parentfig:'N',active:'?',serious:'n',comedy:'n',chubby:'n',artist:'N',rich:'n',internet:'N'}],
 ['والتر وایت', 'والتر', {multi_media:'N',from_book:'N',single_media:'Y',real:'N',alive:'N',male:'Y',series:'Y',stream:'y',h_bb:'Y',teacher:'Y',criminal:'Y',villain:'y',lead:'Y',bald:'Y',glasses:'Y',beard:'Y',american:'Y',serious:'Y',longrun:'y',world:'Y',everyone:'n',cop:'N',gun:'n',scientist:'y',old_person:'N',married_fam:'Y',is_film:'N',cinema:'n',beloved:'y',legend:'Y',controversial:'y',sitcom:'N',comedy:'N',rich:'y',businessman:'y'}],
 ['کریستیانو رونالدو', 'کریستیانو', {male:'Y',alive:'Y',real:'Y',athlete:'Y',footballer:'Y',stadium:'Y',world:'Y',everyone:'Y',award:'Y',rich:'Y',beloved:'y',legend:'Y',active:'Y',tv:'Y',h_realmadrid:'Y',h_england:'Y',h_fifa:'Y',european:'Y',married_fam:'y',internet:'Y',controversial:'y',serious:'y',kids:'Y',h_barca:'N',old_person:'N',beard:'N',newgen:'N',h_olympic:'N'}],
 ['ماریو', 'ماریو', {multi_media:'Y',from_book:'N',single_media:'N',real:'N',alive:'N',male:'Y',game:'Y',playable:'Y',h_mario:'Y',kids:'Y',world:'Y',everyone:'Y',mustache:'Y',costume:'Y',chubby:'y',retro:'Y',lead:'Y',cartoon_media:'y',cartoon_char:'y',cinema:'n',eastern:'y',american:'n',legend:'Y',beloved:'Y',comedy:'n',superpower:'n',fighting:'n',mobile_game:'y',online_game:'n',is_film:'N',hero:'Y'}],
 ['پیکاچو', 'پیکاچو', {multi_media:'Y',from_book:'N',single_media:'N',real:'N',alive:'N',male:'?',animal:'Y',cartoon_char:'Y',cartoon_media:'Y',game:'Y',h_pokemon:'Y',kids:'Y',world:'Y',everyone:'Y',superpower:'Y',eastern:'Y',american:'N',beloved:'Y',lead:'y',mobile_game:'Y',playable:'y',cinema:'y',series:'y',is_film:'N',comedy:'n',weirdhair:'N',legend:'y',retro:'n',teen:'N'}],
 ['شرک', 'شرک', {multi_media:'y',from_book:'n',single_media:'n',real:'N',alive:'N',male:'Y',cartoon_char:'Y',cartoon_media:'Y',cinema:'Y',is_film:'N',kids:'Y',world:'Y',everyone:'Y',comedy:'Y',monster:'y',animal:'N',h_dreamworks:'Y',h_shrek:'Y',lead:'Y',american:'Y',beloved:'Y',fantasy:'Y',chubby:'Y',married_fam:'Y',superpower:'N',villain:'N',legend:'y',f_sequel:'Y',green:'Y',tv:'n',series:'N',game:'n'}],
 ['آلبرت اینشتین', 'آلبرت', {male:'Y',alive:'N',real:'Y',scientist:'Y',inventor:'y',world:'Y',everyone:'Y',legend:'Y',award:'Y',h_nobel:'Y',european:'Y',american:'y',old_person:'Y',mustache:'Y',glasses:'n',writer:'y',ancient:'N',prerev:'y',died_young:'N',married_fam:'Y',beloved:'Y',serious:'y',comedy:'N',techie:'n',book_media:'y',kids:'Y',artist:'N',iranian:'N',religious:'N',teacher:'y'}],
 ['حافظ', 'حافظ', {male:'Y',alive:'N',real:'Y',iranian:'Y',poet:'Y',artist:'Y',writer:'y',book_media:'Y',ancient:'Y',legend:'Y',everyone:'Y',world:'y',h_classicpoet:'Y',love:'Y',religious:'y',traditional:'Y',beloved:'Y',serious:'y',prerev:'Y',old_person:'?',beard:'y',glasses:'N',ruler:'N',scientist:'n',kids:'y',died_young:'N',married_fam:'?',mystic:'Y'}],
 ['دونالد ترامپ', 'دونالد', {male:'Y',alive:'Y',real:'Y',american:'Y',ruler:'y',businessman:'Y',rich:'Y',world:'Y',everyone:'Y',controversial:'Y',old_person:'Y',blond:'Y',tv:'Y',internet:'Y',active:'Y',married_fam:'Y',beloved:'n',serious:'n',comedy:'n',tvhost:'y',politician:'Y',legend:'n',glasses:'N',beard:'N',chubby:'y',newgen:'N',iranian:'N',artist:'N'}],
 ['گوگوش', 'گوگوش', {male:'N',alive:'Y',real:'Y',iranian:'Y',artist:'Y',singer:'Y',actor:'y',pop:'Y',prerev:'Y',legend:'Y',everyone:'Y',beloved:'Y',h_la:'Y',old_person:'Y',world:'y',active:'Y',child_star:'Y',cinema:'y',tv:'y',love:'Y',married_fam:'Y',controversial:'n',dahe60:'n',traditional:'N',musician:'N',internet:'y',kids:'n',blond:'y',glasses:'N'}],
 ['عادل فردوسی‌پور', 'عادل', {male:'Y',alive:'Y',real:'Y',iranian:'Y',tvhost:'Y',tv:'Y',athlete:'N',footballer:'N',stadium:'y',everyone:'Y',beloved:'Y',controversial:'y',active:'Y',internet:'Y',serious:'y',comedy:'N',married_fam:'n',old_person:'N',dahe60:'n',glasses:'N',beard:'n',artist:'N',writer:'y',teacher:'y',world:'N',legend:'y',h_teammelli:'N',h_persepolis:'N',h_esteghlal:'N',rich:'n',newgen:'N'}],
 ['لیونل مسی', 'لیونل', {male:'Y',alive:'Y',real:'Y',athlete:'Y',footballer:'Y',stadium:'Y',world:'Y',everyone:'Y',award:'Y',rich:'Y',beloved:'Y',legend:'Y',active:'Y',tv:'Y',h_barca:'Y',h_fifa:'Y',h_olympic:'Y',beard:'y',married_fam:'Y',american:'N',european:'n',internet:'Y',serious:'?',kids:'Y',h_realmadrid:'N',h_england:'N',h_teammelli:'N',old_person:'N',controversial:'N',newgen:'N'}],
 ['کلاه‌قرمزی', 'کلاه', {multi_media:'N',from_book:'N',single_media:'Y',real:'N',alive:'N',puppet:'Y',male:'Y',iranian:'Y',tv:'Y',kids:'Y',everyone:'Y',comedy:'Y',beloved:'Y',h_kolah:'Y',h_kidtv:'y',lead:'Y',cartoon_char:'n',cinema:'y',series:'Y',dahe60:'Y',legend:'Y',active:'Y',costume:'Y',animal:'N',chubby:'n',teen:'n',world:'N',superpower:'N',longrun:'Y',h_modiri:'N',newgen:'N'}],
 ['ناصر حجازی', 'ناصر', {male:'Y',alive:'N',real:'Y',iranian:'Y',athlete:'Y',footballer:'Y',stadium:'Y',h_esteghlal:'Y',h_teammelli:'Y',legend:'Y',everyone:'y',beloved:'Y',prerev:'Y',dahe60:'Y',controversial:'y',old_person:'y',died_young:'N',serious:'Y',married_fam:'Y',tv:'y',h_persepolis:'N',world:'N',rich:'n',mustache:'n',glasses:'n',actor:'N',artist:'N',active:'N',coach:'Y'}],
 ['هومر سیمپسون', 'هومر', {multi_media:'y',from_book:'N',single_media:'n',real:'N',alive:'N',male:'Y',cartoon_char:'Y',cartoon_media:'Y',tv:'Y',series:'Y',american:'Y',comedy:'Y',chubby:'Y',bald:'Y',lead:'Y',married_fam:'Y',h_simpsons:'Y',world:'Y',everyone:'y',beloved:'Y',longrun:'Y',sitcom:'y',kids:'n',old_person:'N',animal:'N',superpower:'N',is_film:'N',cinema:'n',legend:'y',weirdhair:'N',costume:'n'}],
 ['گوکو', 'گوکو', {multi_media:'Y',from_book:'N',single_media:'N',real:'N',alive:'N',male:'Y',cartoon_char:'Y',cartoon_media:'Y',eastern:'Y',american:'N',superpower:'Y',h_dbz:'Y',lead:'Y',kids:'Y',world:'Y',fighting:'y',weirdhair:'n',costume:'Y',epic:'Y',game:'y',tv:'Y',series:'y',comedy:'n',hero:'Y',teen:'n',everyone:'y',legend:'Y',beloved:'Y',villain:'N',monster:'N',sword:'N',gun:'N',h_naruto:'N',h_onepiece:'N',h_pokemon:'N',is_film:'N'}],
 ['ناروتو', 'ناروتو', {multi_media:'Y',from_book:'N',single_media:'N',real:'N',alive:'N',male:'Y',cartoon_char:'Y',cartoon_media:'Y',eastern:'Y',american:'N',superpower:'Y',h_naruto:'Y',lead:'Y',kids:'y',world:'Y',teen:'Y',blond:'Y',weirdhair:'n',costume:'Y',epic:'y',tv:'y',series:'y',sword:'n',game:'y',everyone:'n',beloved:'Y',legend:'y',hero:'Y',h_dbz:'N',h_onepiece:'N',fighting:'y',is_film:'N'}],
 ['محسن چاوشی', 'محسن', {male:'Y',alive:'Y',real:'Y',iranian:'Y',artist:'Y',singer:'Y',pop:'Y',love:'Y',active:'Y',beloved:'Y',beard:'Y',everyone:'Y',serious:'y',controversial:'n',internet:'y',tv:'N',cinema:'N',musician:'y',traditional:'n',old_person:'N',newgen:'N',dahe60:'N',married_fam:'Y',h_la:'N',h_rap:'N',world:'N',legend:'y',glasses:'n',rich:'y'}],
 ['مهدی طارمی', 'مهدی', {male:'Y',alive:'Y',real:'Y',iranian:'Y',athlete:'Y',footballer:'Y',stadium:'Y',h_teammelli:'Y',h_persepolis:'Y',h_fifa:'y',active:'Y',newgen:'y',internet:'Y',beard:'Y',everyone:'Y',beloved:'y',world:'n',european:'n',controversial:'y',married_fam:'?',old_person:'N',tv:'Y',rich:'Y',h_esteghlal:'N',legend:'n',h_england:'N',h_realmadrid:'N',h_barca:'N'}],
 ['تام هنکس', 'تام', {male:'Y',alive:'Y',real:'Y',american:'Y',actor:'Y',artist:'Y',cinema:'Y',world:'Y',everyone:'Y',award:'Y',h_oscar:'Y',beloved:'Y',old_person:'Y',serious:'n',comedy:'y',h_toystory:'y',active:'Y',married_fam:'Y',legend:'Y',rich:'Y',director:'n',glasses:'n',beard:'n',iranian:'N',tv:'y',series:'n'}],
 ['آیرون‌من', 'آیرون', {multi_media:'y',from_book:'n',single_media:'n',real:'N',alive:'N',male:'Y',superpower:'y',h_marvel:'Y',cinema:'Y',american:'Y',rich:'Y',businessman:'Y',techie:'Y',costume:'Y',masked:'y',robot:'n',hero:'Y',lead:'Y',world:'Y',everyone:'Y',beard:'Y',comedy:'n',serious:'n',is_film:'N',cartoon_media:'n',cartoon_char:'N',book_media:'n',game:'y',h_dc:'N',villain:'N',legend:'Y',beloved:'Y',gun:'n',inventor:'Y',scientist:'y'}],
 ['دارث ویدر', 'دارث', {multi_media:'Y',from_book:'N',single_media:'N',real:'N',alive:'N',male:'Y',villain:'Y',h_starwars:'Y',cinema:'Y',space:'Y',masked:'Y',costume:'Y',sword:'Y',superpower:'Y',american:'Y',world:'Y',everyone:'Y',legend:'Y',robot:'n',monster:'n',lead:'y',is_film:'N',cartoon_char:'N',cartoon_media:'n',game:'y',gun:'N',soldier:'y',ruler:'y',serious:'Y',beloved:'y',h_marvel:'N',h_dc:'N',horror:'n',scifi:'Y',f_scifi:'Y'}],
 ['گندالف', 'گندالف', {multi_media:'y',from_book:'Y',single_media:'N',real:'N',alive:'N',male:'Y',superpower:'Y',fantasy:'Y',h_lotr:'Y',cinema:'Y',book_media:'y',old_person:'Y',beard:'Y',sword:'y',european:'Y',american:'n',world:'Y',everyone:'y',legend:'Y',hero:'Y',lead:'n',villain:'N',monster:'N',costume:'Y',is_film:'N',cartoon_char:'N',h_hp:'N',teacher:'n',religious:'n',mystic:'y',epic:'Y',serious:'y',beloved:'Y',glasses:'N',bald:'N',game:'n'}],
 ['نوید محمدزاده', 'نوید', {male:'Y',alive:'Y',real:'Y',iranian:'Y',artist:'Y',actor:'Y',cinema:'Y',series:'y',tv:'n',serious:'Y',award:'Y',active:'Y',newgen:'y',everyone:'Y',beloved:'y',controversial:'y',internet:'y',comedy:'n',beard:'y',married_fam:'Y',old_person:'N',world:'n',h_oscar:'N',theater:'y',director:'N',singer:'N',legend:'n',rich:'n',glasses:'N'}],
 ['همایون شجریان', 'همایون', {male:'Y',alive:'Y',real:'Y',iranian:'Y',artist:'Y',singer:'Y',musician:'y',traditional:'Y',pop:'n',active:'Y',beloved:'Y',everyone:'Y',serious:'y',beard:'Y',old_person:'N',married_fam:'Y',legend:'y',world:'n',tv:'n',internet:'y',love:'y',controversial:'n',h_la:'N',classical:'Y',h_classicpoet:'N',prerev:'N',dahe60:'N',newgen:'N',glasses:'N',rich:'y'}],
 ['هادس|اساطیر', 'هادس', {multi_media:'y',from_book:'Y',single_media:'N',real:'N',alive:'N',male:'Y',game:'Y',playable:'N',superpower:'Y',fantasy:'Y',ancient:'n',everyone:'N',world:'n',kids:'N',cartoon_media:'N',cartoon_char:'N',cinema:'N',villain:'y',lead:'y',monster:'n',weirdhair:'n',book_media:'n',american:'y',eastern:'N',european:'n',comedy:'N',serious:'Y',epic:'Y',sword:'y',beard:'Y',old_person:'n',ruler:'Y',religious:'n',legend:'n',online_game:'N',mobile_game:'N',fighting:'n',openworld:'N',retro:'N',is_film:'N',h_disney:'N',h_gow:'N',h_marvel:'N'}],
 ['ابی|لست', 'ابی', {multi_media:'y',from_book:'N',single_media:'n',real:'N',alive:'N',male:'N',game:'Y',playable:'Y',h_tlou:'Y',apoc:'Y',horror:'y',villain:'y',controversial:'Y',serious:'Y',gun:'Y',sword:'n',blond:'y',american:'Y',series:'y',stream:'y',everyone:'N',world:'n',kids:'N',cartoon_media:'N',is_film:'N',lead:'y',teen:'N',shooter:'y',online_game:'N',mobile_game:'N',monster:'N',superpower:'N',beloved:'N',legend:'n',h_re:'N',h_gta:'N'}],
];

const idx = new Map(CHARACTERS.map((c, i) => [c.id, i]));
let wins = 0, tot = 0;
for (const [truthName, letterName, A] of PROFILES) {
  const [tn, th] = truthName.split('|');
  const ti = CHARACTERS.findIndex(c => c.name === tn && !c.f && (!th || c.hint.includes(th)));
  if (ti < 0) { console.log('!! نیست:', truthName); continue; }
  const truth = CHARACTERS[ti];
  const ans = q => {
    if (q.cluster === 'letter') { const L = LETTERS[+q.id.slice(3)]; return first(letterName) === L ? 1 : 0; }
    return W[A[q.id] ?? 'N'];
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
      if (bi === ti) { correctIdx = guesses.length; break; }
      if (st.soft) nSoft++; else nHard++;
      if (nHard >= C.MAX_GUESSES) break;
      rejected.add(bi); log[bi] -= 8; lastRejAt = n; continue;
    }
    const w = ans(q);
    lines.push(`${q.id}=${w === null ? '?' : w}`);
    if (w === null) unk.add(q.id);
    log = ENG.update(log, q, w); asked.push(q.id); cc[q.cluster] = (cc[q.cluster] || 0) + 1; n++;
  }
  const won = correctIdx > 0;
  tot++; if (won) wins++;
  console.log(`\n### ${truthName} — ${won ? 'بُرد' : 'باخت'} با ${n} سؤال\n  حدس‌ها: ${guesses.join(' → ')}\n  مسیر: ${lines.join(' ')}`);
}
console.log(`\nبُرد ${wins}/${tot}`);
