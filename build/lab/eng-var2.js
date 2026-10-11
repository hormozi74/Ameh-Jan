const ENG = (() => {
  const F = Object.assign({qwExtra:{}, consec:0.85, hotPy:0.30, hotW:1.25, soft:0.10, letterLate:999, letterMax:2, letterGate:0.22, letterH:3.0, lo:0.04}, globalThis.ENGF || {});
  const clamp = p => Math.max(0.03, Math.min(0.97, p));
  // NC ثابت نیست: «یادش بده» می‌تواند وسط جلسه شخصیت تازه به CHARACTERS اضافه کند
  let NC = CHARACTERS.length;
  const NQ = QUESTIONS.length;

  // پنج گزینه‌ی پاسخ. w=null یعنی «نمی‌دونم» و اثری ندارد.
  const ANSWERS = [
    {k:'yes',  label:'آره',           w:1},
    {k:'pyes', label:'فکر کنم آره',   w:0.75},
    {k:'unk',  label:'نمی‌دونم والا',  w:null},
    {k:'pno',  label:'فکر نکنم',      w:0.25},
    {k:'no',   label:'نه',            w:0}
  ];

  /* ---------- جدول‌های خلوت (sparse) ----------
     ۸۹٪ خانه‌های ماتریس دقیقاً مقدارِ پیش‌فرضِ همان سؤال‌اند (QDEF) — چون قاعده‌ها
     «برچسب را داری یا نداری» هستند. نسخه‌ی قبلی سه ماتریسِ پُرِ ۷۵۰۰×۲۷۷ می‌ساخت
     (۴۶ مگابایت) و در هر رتبه‌بندی روی همه‌ی خانه‌ها می‌چرخید. حالا برای هر سؤال
     فقط ردیف‌هایی نگه می‌داریم که با پیش‌فرض فرق دارند؛ سهمِ ردیف‌های پیش‌فرض از
     روی جمع‌های سراسریِ نامزدهای زنده (Σp، Σp·log p) به‌صورتِ بسته حساب می‌شود.
     ریاضی دقیقاً همان است — فقط ترتیبِ جمع‌زدن فرق دارد. */
  let DEF_P, DEF_LP, DEF_LN;             // پیش‌فرضِ هر سؤال: p، log2(p)، log2(1-p)
  let SP_START;                          // Int32Array(NQ+1): بازه‌ی هر سؤال در آرایه‌های خلوت
  let SP_ROW, SP_P, SP_LP, SP_LN;        // ردیفِ متفاوت: شماره‌ی شخصیت، p، log2(p)، log2(1-p)
  let liveP, liveLog;                    // p_i و log2(p_i) برای نامزدهای زنده؛ صفر برای هرس‌شده‌ها
  // بعد از اعمالِ یادگیری (LEARN) یا اضافه‌شدن شخصیتِ تازه دوباره صدا می‌شود
  function rebuild(){
    NC = CHARACTERS.length;
    const QIDX = new Map(QUESTIONS.map((q, i) => [q.id, i]));
    // پیش‌فرض همان پروتوتایپِ a (QDEF) است؛ هر مقداری که آن‌جا نباشد ۰.۵ حساب می‌شود
    const proto = (CHARACTERS.length && Object.getPrototypeOf(CHARACTERS[0].a)) || Object.prototype;
    DEF_P = new Float64Array(NQ); DEF_LP = new Float64Array(NQ); DEF_LN = new Float64Array(NQ);
    for(let q = 0; q < NQ; q++){
      const d = clamp(proto[QUESTIONS[q].id] ?? 0.5);
      DEF_P[q] = d; DEF_LP[q] = Math.log2(d); DEF_LN[q] = Math.log2(1 - d);
    }
    const rows = Array.from({length: NQ}, () => []), vals = Array.from({length: NQ}, () => []);
    for(let c = 0; c < NC; c++){
      const a = CHARACTERS[c].a;
      // فقط خانه‌های خودِ شخصیت (نه پروتوتایپ) می‌توانند با پیش‌فرض فرق داشته باشند
      const keys = Object.getPrototypeOf(a) === proto ? Object.keys(a) : QUESTIONS.map(x => x.id);
      for(const id of keys){
        const q = QIDX.get(id);
        if(q === undefined) continue;
        const p = clamp(a[id] ?? 0.5);
        if(p !== DEF_P[q]){ rows[q].push(c); vals[q].push(p); }
      }
    }
    SP_START = new Int32Array(NQ + 1);
    for(let q = 0; q < NQ; q++) SP_START[q + 1] = SP_START[q] + rows[q].length;
    const n = SP_START[NQ];
    SP_ROW = new Int32Array(n); SP_P = new Float64Array(n); SP_LP = new Float64Array(n); SP_LN = new Float64Array(n);
    for(let q = 0, k = 0; q < NQ; q++)
      for(let j = 0; j < rows[q].length; j++, k++){
        const p = vals[q][j];
        SP_ROW[k] = rows[q][j]; SP_P[k] = p; SP_LP[k] = Math.log2(p); SP_LN[k] = Math.log2(1 - p);
      }
    if(!liveP || liveP.length !== NC){ liveP = new Float64Array(NC); liveLog = new Float64Array(NC); }
  }
  rebuild();
  const QCLUSTER = QUESTIONS.map(q => q.cluster);

  /* جنسِ سؤال — نه فقط بهره‌ی اطلاعاتی‌اش.
     سؤال‌های سلیقه‌ای («آدمِ جدی‌ایه؟»، «همه دوستش دارن؟») جوابِ روشن ندارند
     و بازیکن حس می‌کند عمه دارد وقت تلف می‌کند؛ هم‌ارزش‌که باشند، سؤالِ
     سرراست‌تر برنده است. سؤالِ داغ («تو دنیای هری پاتره؟») برعکس: همان لحظه‌ی
     «عه! داره می‌رسه» است، پس در تساوی جلو می‌افتد. */
  const QW_BY_ID = {serious:.65, beloved:.65, controversial:.7, legend:.75, rich:.75,
                    pop:.8, epic:.8, married_fam:.8, active:.8, costume:.85, love:.9};
  const QW = QUESTIONS.map(q => q.cluster === 'hot' ? F.hotW : (F.qwExtra[q.id] ?? QW_BY_ID[q.id] ?? 1));
  /* جریمه‌ی تکرار فقط برای دو سؤالِ پشت‌سرهم از یک خوشه است، نه تجمعی.
     جریمه‌ی تجمعیِ قبلی (۰.۶ به توانِ تعدادِ دفعات) بعد از دو سؤالِ «رسانه»
     بهترین سؤال‌ها را به یک‌سوم می‌کشید و عمه به‌جای «تو تلویزیون دیدیش؟»
     می‌پرسید «تو فضاست؟» — در شبیه‌سازی ۵ درصد دقت و یک سؤال هزینه داشت. */
  const CONSEC = F.consec;
  /* سؤالِ داغ فقط وقتی جلو می‌افتد که عمه واقعاً بو برده باشد (pYes ≥ HOT_PY)؛
     «لونی‌تونزه؟» با ۱۴٪ احتمالِ بله فقط یک «نه»ی کم‌ارزش است. */
  const HOT_PY = F.hotPy;

  /* «اسمش با «م» شروع می‌شه؟» فقط وقتی عمه واقعاً بو برده، و یک بار در هر دست.
     آزاد که باشد از سؤالِ سوم الفبا می‌پرسد و هم جادو می‌میرد هم بازی
     «بیست سؤالیِ حروف» می‌شود. آستانه با build/heat-sim.js جاروب شده. */
  const LETTER_GATE = 0.22;
  /* …یا وقتی چند نفرِ هم‌برچسب باقی مانده‌اند (هفت بازیگرِ جوانِ زن با برچسب‌های
     یکسان): نامزدِ اول هیچ‌وقت به ۰.۲۲ نمی‌رسد ولی حرفِ اول دقیقاً همان سؤالی
     است که جدایشان می‌کند. آنتروپیِ ۳ بیت ≈ هشت نامزدِ هم‌وزن. */
  const LETTER_H = 3.0;

  let liveN = 0, liveTail = 0, liveH = 0, liveMax = 0, liveS1 = 0, liveSL = 0;

  // درست‌نمایی: تلفیق خطی p و 1-p با وزن پاسخ
  const likelihood = (p, w) => w === null ? 1 : (w * clamp(p) + (1 - w) * (1 - clamp(p)));

  // log-sum-exp پایدار
  function lse(arr){
    let m = -Infinity;
    for(let i = 0; i < arr.length; i++) if(arr[i] > m) m = arr[i];
    if(!isFinite(m)) return m;
    let s = 0;
    for(let i = 0; i < arr.length; i++) s += Math.exp(arr[i] - m);
    return m + Math.log(s);
  }
  // تبدیل امتیازهای لگاریتمی به توزیع احتمال
  function toProbs(logScores){
    const z = lse(logScores);
    const out = new Array(logScores.length);
    for(let i = 0; i < logScores.length; i++) out[i] = Math.exp(logScores[i] - z);
    return out;
  }
  function entropy(probs){
    let h = 0;
    for(const p of probs) if(p > 1e-12) h -= p * Math.log2(p);
    return h;
  }

  /* نامزدهای «زنده» — آن‌هایی که وزن محسوسی دارند.
     وقتی توزیع تیز می‌شود صدها شخصیت عملاً صفرند؛ نگه‌داشتنشان در حلقه فقط
     هزینه است. جرمِ کنارگذاشته جداگانه به pYes برمی‌گردد تا سوگیری نسازد.
     Σp و Σp·log2p ی زنده‌ها هم همین‌جا جمع می‌شوند — سهمِ ردیف‌های پیش‌فرض در igAt از این‌ها درمی‌آید. */
  const LIVE_EPS = 1e-7;
  function refreshLive(probs){
    liveN = 0; liveTail = 0; liveH = 0; liveMax = 0; liveS1 = 0; liveSL = 0;
    for(let i = 0; i < NC; i++){
      const p = probs[i];
      if(p > LIVE_EPS){
        const lg = Math.log2(p);
        liveP[i] = p; liveLog[i] = lg;
        liveS1 += p; liveSL += p * lg;
        if(p > liveMax) liveMax = p;
        liveN++;
      } else { liveP[i] = 0; liveLog[i] = 0; liveTail += p; }
    }
    liveH = -liveSL;
  }

  /* بهره‌ی اطلاعاتی یک سؤال، در یک گذر و بدون تخصیص حافظه.
     با بسطِ H(بله) و H(نه) نیازی به ساختن دو توزیع شرطی نیست:
       pY·H(بله) = pY·log2(pY) − Σ w·log2(w)      که w = p_i · p(بله|i)
     و چون log2(w) = log2(p_i) + log2(p(بله|i))، هر دو لگاریتم از پیش آماده‌اند.
     حلقه فقط روی ردیف‌های متفاوت‌با‌پیش‌فرضِ این سؤال می‌چرخد؛ ردیف‌های پیش‌فرض
     همگی p(بله|i)=d دارند، پس سهمشان = d·Σp_i و d·Σp_i·log2p_i + d·log2d·Σp_i
     که از جمع‌های سراسری منهای جمعِ ردیف‌های متفاوت به‌دست می‌آید. */
  function igAt(q, out){
    const d = DEF_P[q], ld = DEF_LP[q], ln = DEF_LN[q];
    let s1n = 0, sln = 0, pYn = 0, swn = 0, svn = 0;
    for(let k = SP_START[q], end = SP_START[q + 1]; k < end; k++){
      const i = SP_ROW[k], pi = liveP[i];
      if(pi === 0) continue;                 // هرس‌شده
      const lpi = liveLog[i], pq = SP_P[k];
      const w = pi * pq, v = pi - w;
      s1n += pi; sln += pi * lpi;
      pYn += w;
      swn += w * (lpi + SP_LP[k]);
      svn += v * (lpi + SP_LN[k]);
    }
    const s1d = liveS1 - s1n, sld = liveSL - sln;
    const pY = liveTail * 0.5 + pYn + d * s1d;
    const sw = swn + d * sld + d * ld * s1d;
    const sv = svn + (1 - d) * sld + (1 - d) * ln * s1d;
    out.pYes = pY;
    if(pY < 1e-6 || pY > 1 - 1e-6){ out.ig = 0; return out; }
    out.ig = liveH - (pY * Math.log2(pY) - sw) - ((1-pY) * Math.log2(1-pY) - sv);
    return out;
  }

  /* رتبه‌بندی سؤال‌های باقی‌مانده. هم انتخاب‌کننده از آن استفاده می‌کند هم پشت‌صحنه،
     تا این حلقه در هر سؤال دوبار اجرا نشود. */
  function rankQuestions(probs, asked, clusterCount){
    refreshLive(probs);
    const done = new Set(asked);
    const pool = [];
    const scratch = {ig:0, pYes:0};
    const nL = clusterCount.letter || 0;
    // حرفِ دوم فقط وقتی نامزدِ اول واقعاً جلو افتاده — تأییدِ نهایی، نه بازیِ الفبا
    const letterOpen = (liveMax >= F.letterGate || liveH <= F.letterH || asked.length >= F.letterLate) && (nL === 0 || (nL < F.letterMax && liveMax >= 0.40));
    const lastQ = asked.length ? QUESTIONS.find(x => x.id === asked[asked.length - 1]) : null;
    const lastCl = lastQ ? lastQ.cluster : null;
    for(let q = 0; q < NQ; q++){
      if(done.has(QUESTIONS[q].id)) continue;
      if(QCLUSTER[q] === 'letter' && !letterOpen) continue;
      igAt(q, scratch);
      if(scratch.ig <= 0.01) continue;
      pool.push({
        q: QUESTIONS[q], ig: scratch.ig, pYes: scratch.pYes,
        score: scratch.ig * (QCLUSTER[q] === 'hot' && scratch.pYes < HOT_PY ? 1 : QW[q])
               * (QCLUSTER[q] === lastCl && QCLUSTER[q] !== 'hot' && QCLUSTER[q] !== 'letter' ? CONSEC : 1)
      });
    }
    pool.sort((a,b) => b.score - a.score);
    return pool;
  }

  // انتخاب سؤال بعدی
  function pickQuestion(probs, asked, clusterCount, pool){
    pool = pool || rankQuestions(probs, asked, clusterCount);
    if(!pool.length) return null;

    // سؤالی که جوابش از قبل تقریباً معلوم است نپرس — حس «که خودت گفتی!» می‌دهد.
    // ولی در پایانِ بازی (نامزدِ اول جلو افتاده) همین فیلتر دقیقاً سؤالِ جداکننده را
    // حذف می‌کرد: عادل فردوسی‌پور در برابرِ علی ضیا با «تو ورزشگاه دیده می‌شه؟» جدا
    // می‌شود که pYes آن ۰.۰۷ است، و عمه به‌جایش «محبوبه؟» می‌پرسید. آن‌جا آستانه بازتر.
    const lo = liveMax >= 0.30 ? F.lo : 0.10;
    const informative = pool.filter(x => x.pYes > lo && x.pYes < 1 - lo);
    // اوایل بازی حتی سؤال کم‌ارزش هم بهتر از حدس زودرس است؛ بعدش نه
    if(informative.length) pool = informative;
    else if(asked.length >= 6) return null;

    /* تصادف فقط بین گزینه‌های هم‌تراز — و هرچه به حدس نزدیک‌تر می‌شویم تنگ‌تر.
       سؤال‌های اول تأثیر کمی بر نتیجه دارند و تنوعشان بازی را تکراری نمی‌کند؛
       سؤال‌های آخر تعیین‌کننده‌اند و آن‌جا دیگر قرعه نمی‌اندازیم. */
    const slack = asked.length < 4 ? 0.80 : asked.length < 8 ? 0.93 : 1.0;
    const cut = pool[0].score * slack;
    const top = pool.filter(x => x.score >= cut).slice(0, 4);
    return top[Math.floor(Math.random()*top.length)].q;
  }

  /* یک قدم به‌روزرسانی در فضای لگاریتمی.

     SOFT: کاربر گاهی اشتباه جواب می‌دهد یا برداشتش با برچسبِ ما فرق دارد
     («والتر وایت معلمه؟» — بستگی دارد کِی از قصه). با درست‌نماییِ خام، یک
     جوابِ مخالف شخصیتِ درست را عملاً حذف می‌کرد و دیگر برنمی‌گشت. مخلوط
     کردنِ p با ۰.۵ سقفِ ضربه‌ی هر جواب را می‌بندد: حدود ۲.۵ بیت به‌جای ۵.
     جواب‌های درستِ بعدی همان مسیر را جبران می‌کنند، پس بازی فقط کمی
     طولانی‌تر ولی بسیار مقاوم‌تر می‌شود. با tune-soft.js جاروب شده.
     ردیف‌های پیش‌فرض همه یک جمله‌ی یکسان می‌گیرند؛ فقط ردیف‌های متفاوت جداگانه. */
  let SOFT = F.soft;
  function update(logScores, q, w){
    if(w === null) return logScores.slice();
    const qi = QUESTIONS.indexOf(q);
    const out = new Array(NC);
    const pd = SOFT * 0.5 + (1 - SOFT) * DEF_P[qi];
    const ld = Math.log(w * pd + (1 - w) * (1 - pd));
    for(let i = 0; i < NC; i++) out[i] = logScores[i] + ld;
    for(let k = SP_START[qi], end = SP_START[qi + 1]; k < end; k++){
      const i = SP_ROW[k];
      const p = SOFT * 0.5 + (1 - SOFT) * SP_P[k];
      out[i] = logScores[i] + Math.log(w * p + (1 - w) * (1 - p));
    }
    return out;
  }

  return {clamp, ANSWERS, likelihood, lse, toProbs, entropy,
          rankQuestions, pickQuestion, update, rebuild, NQ,
          get NC(){ return NC; },              // پویا — با «یادش بده» زیاد می‌شود
          setSoft(v){ SOFT = v; },
          get liveCount(){ return liveN; }};   // برای پشت‌صحنه
})();
