const ENG = (() => {
  const F = Object.assign({softIG:false, emp:0, empGate:0.12, forgive:0, relaxLate:false, soft:0.10, decay:0.6, slack0:0.80, slack1:0.93, twoPly:0, twoPlyM:8, twoPlyK:96, hotDecay:.85, hotW:1.25, letterMax:1, letterGate2:0.4, consec:0, hotPy:0, softCrisp:0, softFuzzy:0}, globalThis.ENGF || {});
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

  /* ---------- جدول‌های از پیش ساخته‌شده ----------
     حلقه‌ی انتخاب سؤال روی ۹۱۳×۶۸ خانه می‌چرخد و قبلاً برای هر سؤال چند آرایه‌ی
     تازه می‌ساخت و برای هر خانه دو بار Math.log2 صدا می‌زد. هر دو را از حلقه
     بیرون می‌کشیم: ماتریس تخت به‌جای آرایه‌ی اشیاء، و لگاریتم‌های از پیش حساب‌شده. */
  let SOFT = F.soft;
  /* سؤالِ قاطع («مَرده؟»، «ایرانیه؟») جوابِ یک‌جوری دارد و اشتباهش نادر است؛
     سؤالِ برداشتی («تو تلویزیون دیدیش؟»، «آدمِ جدی‌ایه؟») بین آدم‌ها فرق می‌کند.
     برای دومی باید نرم‌تر بود تا یک برداشتِ متفاوت، شخصیتِ درست را نکُشد. */
  const CRISP = new Set(['male','alive','real','iranian','american','european','eastern','is_film','cartoon_char','animal','robot','puppet',
    'footballer','actor','singer','athlete','poet','ruler','religious','died_young','child_star','teen','fantasy','space','playable',
    'mobile_game','online_game','fighting','shooter','wrestler','dancer','doctor','director','tvhost','techie','inventor','cop','teacher','soldier']);
  const softOf = q => F.softCrisp ? (CRISP.has(q.id) || q.cluster === 'fam' || q.cluster === 'hot' || q.cluster === 'letter' ? F.softCrisp : F.softFuzzy) : SOFT;
  const SQ = QUESTIONS.map(softOf);
  let P, LOG_P, LOG_N, PS, LOG_PS, LOG_NS;                       // احتمال «بله»، log2(p)، log2(1-p)
  let liveIdx, liveP, liveLog;               // بافرهای کاریِ نامزدهای زنده
  // بعد از اعمالِ یادگیری (LEARN) یا اضافه‌شدن شخصیتِ تازه دوباره صدا می‌شود
  function rebuild(){
    NC = CHARACTERS.length;
    if(!P || P.length !== NC * NQ){
      P = new Float64Array(NC * NQ); PS = new Float64Array(NC * NQ); LOG_PS = new Float64Array(NC * NQ); LOG_NS = new Float64Array(NC * NQ);
      LOG_P = new Float64Array(NC * NQ);
      LOG_N = new Float64Array(NC * NQ);
      liveIdx = new Int32Array(NC);
      liveP   = new Float64Array(NC);
      liveLog = new Float64Array(NC);
    }
    for(let c = 0; c < NC; c++){
      const a = CHARACTERS[c].a, base = c * NQ;
      for(let q = 0; q < NQ; q++){
        const p = clamp(a[QUESTIONS[q].id] ?? 0.5);
        P[base + q] = p;
        LOG_P[base + q] = Math.log2(p);
        LOG_N[base + q] = Math.log2(1 - p);
        const ps = SQ[q] * 0.5 + (1 - SQ[q]) * p; PS[base + q] = ps; LOG_PS[base + q] = Math.log2(ps); LOG_NS[base + q] = Math.log2(1 - ps);
      }
    }
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
  const QW = QUESTIONS.map(q => q.cluster === 'hot' ? F.hotW : (QW_BY_ID[q.id] ?? 1));
  /* جریمه‌ی تکرارِ یک خوشه برای تنوع است؛ ولی دو سؤالِ داغِ پشت‌سرهم («مارول؟ نه.
     دی‌سی؟») دقیقاً همان کشمکشی است که می‌خواهیم، پس ملایم‌تر. */
  const DECAY = {hot:F.hotDecay, film:.8};

  /* «اسمش با «م» شروع می‌شه؟» فقط وقتی عمه واقعاً بو برده، و یک بار در هر دست.
     آزاد که باشد از سؤالِ سوم الفبا می‌پرسد و هم جادو می‌میرد هم بازی
     «بیست سؤالیِ حروف» می‌شود. آستانه با build/heat-sim.js جاروب شده. */
  const LETTER_GATE = 0.22;
  /* …یا وقتی چند نفرِ هم‌برچسب باقی مانده‌اند (هفت بازیگرِ جوانِ زن با برچسب‌های
     یکسان): نامزدِ اول هیچ‌وقت به ۰.۲۲ نمی‌رسد ولی حرفِ اول دقیقاً همان سؤالی
     است که جدایشان می‌کند. آنتروپیِ ۳ بیت ≈ هشت نامزدِ هم‌وزن. */
  const LETTER_H = 3.0;

  let liveN = 0, liveTail = 0, liveH = 0, liveMax = 0;

  // درست‌نمایی: تلفیق خطی p و 1-p با وزن پاسخ
  const likelihood = (p, w) => w === null ? 1 : (w * clamp(p) + (1 - w) * (1 - clamp(p)));

  // log-sum-exp پایدار
  function lse(arr){
    const m = Math.max(...arr);
    if(!isFinite(m)) return m;
    return m + Math.log(arr.reduce((s,x)=>s+Math.exp(x-m),0));
  }
  // تبدیل امتیازهای لگاریتمی به توزیع احتمال
  function toProbs(logScores){
    let eff = logScores;
    if(logScores.length === 2 * NC){
      eff = new Array(NC);
      for(let i = 0; i < NC; i++) eff[i] = logScores[i] - F.forgive * logScores[NC + i];
    }
    const z = lse(eff);
    return eff.map(l => Math.exp(l - z));
  }
  function entropy(probs){
    let h = 0;
    for(const p of probs) if(p > 1e-12) h -= p * Math.log2(p);
    return h;
  }

  /* نامزدهای «زنده» — آن‌هایی که وزن محسوسی دارند.
     وقتی توزیع تیز می‌شود صدها شخصیت عملاً صفرند؛ نگه‌داشتنشان در حلقه فقط
     هزینه است. جرمِ کنارگذاشته جداگانه به pYes برمی‌گردد تا سوگیری نسازد. */
  const LIVE_EPS = 1e-7;
  function refreshLive(probs){
    liveN = 0; liveTail = 0; liveH = 0; liveMax = 0;
    for(let i = 0; i < NC; i++){
      const p = probs[i];
      if(p > LIVE_EPS){
        const lg = Math.log2(p);
        liveIdx[liveN] = i * NQ;   // آفست سطر، تا در حلقه‌ی داغ ضرب نشود
        liveP[liveN] = p;
        liveLog[liveN] = lg;
        liveH -= p * lg;
        if(p > liveMax) liveMax = p;
        liveN++;
      } else liveTail += p;
    }
  }

  /* بهره‌ی اطلاعاتی یک سؤال، در یک گذر و بدون تخصیص حافظه.
     با بسطِ H(بله) و H(نه) دیگر نیازی به ساختن دو توزیع شرطی نیست:
       pY·H(بله) = pY·log2(pY) − Σ w·log2(w)      که w = p_i · p(بله|i)
     و چون log2(w) = log2(p_i) + log2(p(بله|i))، هر دو لگاریتم از پیش آماده‌اند. */
  function igAt(q, out){
    let pY = liveTail * 0.5, sw = 0, sv = 0, mY = 0, mN = 0;
    const TP = F.softIG ? PS : P, TLP = F.softIG ? LOG_PS : LOG_P, TLN = F.softIG ? LOG_NS : LOG_N;
    for(let k = 0; k < liveN; k++){
      const row = liveIdx[k] + q, pi = liveP[k], lpi = liveLog[k];
      const pq = TP[row];
      const w = pi * pq, v = pi - w;
      pY += w;
      if(w > mY) mY = w;
      if(v > mN) mN = v;
      if(w > 1e-12) sw += w * (lpi + TLP[row]);
      if(v > 1e-12) sv += v * (lpi + TLN[row]);
    }
    out.pYes = pY;
    out.emp = mY + mN - liveMax;
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
    const lastQ = asked.length ? QUESTIONS.find(x => x.id === asked[asked.length - 1]) : null;
    const lastCl = lastQ ? lastQ.cluster : null;
    const nL = clusterCount.letter || 0;
    const letterOpen = (liveMax >= LETTER_GATE || liveH <= LETTER_H) && (nL === 0 || (nL < F.letterMax && liveMax >= F.letterGate2));
    for(let q = 0; q < NQ; q++){
      if(done.has(QUESTIONS[q].id)) continue;
      if(QCLUSTER[q] === 'letter' && !letterOpen) continue;
      igAt(q, scratch);
      if(scratch.ig <= 0.01) continue;
      pool.push({
        q: QUESTIONS[q], ig: scratch.ig, pYes: scratch.pYes,
        score: (scratch.ig + (F.emp && liveMax >= F.empGate ? F.emp * scratch.emp : 0))
               * (QCLUSTER[q] === 'hot' && scratch.pYes < F.hotPy ? 1 : QW[q])
               * (F.consec ? (QCLUSTER[q] === lastCl && QCLUSTER[q] !== 'hot' && QCLUSTER[q] !== 'letter' ? F.consec : 1)
                           : Math.pow(DECAY[QCLUSTER[q]] ?? F.decay, clusterCount[QCLUSTER[q]] || 0))
      });
    }
    pool.sort((a,b) => b.score - a.score);
    return pool;
  }

  // انتخاب سؤال بعدی
  function pickQuestion(probs, asked, clusterCount, pool){
    pool = pool || rankQuestions(probs, asked, clusterCount);
    if(!pool.length) return null;

    // سؤالی که جوابش از قبل تقریباً معلوم است نپرس — حس «که خودت گفتی!» می‌دهد
    const lo = (F.relaxLate && liveMax >= 0.3) ? 0.04 : 0.10;
    const informative = pool.filter(x => x.pYes > lo && x.pYes < 1 - lo);
    // اوایل بازی حتی سؤال کم‌ارزش هم بهتر از حدس زودرس است؛ بعدش نه
    if(informative.length) pool = informative;
    else if(asked.length >= 6) return null;

    /* تصادف فقط بین گزینه‌های هم‌تراز — و هرچه به حدس نزدیک‌تر می‌شویم تنگ‌تر.
       سؤال‌های اول تأثیر کمی بر نتیجه دارند و تنوعشان بازی را تکراری نمی‌کند؛
       سؤال‌های آخر تعیین‌کننده‌اند و آن‌جا دیگر قرعه نمی‌اندازیم. */
    if(F.twoPly && liveH <= F.twoPly && asked.length >= 4 && pool.length > 1){
      const done = new Set(asked);
      const cands = pool.slice(0, F.twoPlyM);
      // فقط K نامزدِ پرجرم — بقیه در این مرحله عملاً صفرند
      const order = Array.from({length: liveN}, (_, k) => k).sort((a, b) => liveP[b] - liveP[a]).slice(0, F.twoPlyK);
      const n = order.length, base = new Float64Array(n), rows = new Int32Array(n);
      let zz = 0; for(let k = 0; k < n; k++){ base[k] = liveP[order[k]]; rows[k] = liveIdx[order[k]]; zz += base[k]; }
      for(let k = 0; k < n; k++) base[k] /= zz;
      const post = new Float64Array(n), lg = new Float64Array(n);
      const hOf = (arr) => { let h = 0; for(let k = 0; k < n; k++){ const p = arr[k]; if(p > 1e-12) h -= p * Math.log2(p); } return h; };
      // بهترین بهره‌ی یک سؤال روی توزیعِ دلخواه
      const bestIG = (skipQ) => {
        let h = 0; for(let k = 0; k < n; k++){ const p = post[k]; if(p > 1e-12){ lg[k] = Math.log2(p); h -= p * lg[k]; } else lg[k] = -40; }
        let best = 0;
        for(let q = 0; q < NQ; q++){
          if(q === skipQ || done.has(QUESTIONS[q].id) || QCLUSTER[q] === 'letter') continue;
          let pY = 0, sw = 0, sv = 0;
          for(let k = 0; k < n; k++){
            const row = rows[k] + q, pi = post[k]; if(pi <= 1e-12) continue;
            const pq = PS[row], w = pi * pq, v = pi - w;
            pY += w;
            if(w > 1e-12) sw += w * (lg[k] + LOG_PS[row]);
            if(v > 1e-12) sv += v * (lg[k] + LOG_NS[row]);
          }
          if(pY < 1e-6 || pY > 1 - 1e-6) continue;
          const ig = h - (pY * Math.log2(pY) - sw) - ((1-pY) * Math.log2(1-pY) - sv);
          if(ig > best) best = ig;
        }
        return h - best;   // آنتروپیِ موردِ انتظار بعد از بهترین سؤالِ دوم
      };
      let bestH = Infinity, bestQ = null;
      for(const c of cands){
        const q1 = QUESTIONS.indexOf(c.q);
        let h2 = 0;
        for(const a of [1, 0]){
          let z = 0;
          for(let k = 0; k < n; k++){ const pq = PS[rows[k] + q1]; const l = a ? pq : 1 - pq; post[k] = base[k] * l; z += post[k]; }
          if(z < 1e-9) continue;
          for(let k = 0; k < n; k++) post[k] /= z;
          h2 += z * bestIG(q1);
        }
        // جریمه‌ی کلاستر و وزنِ جنسِ سؤال همان‌طور که در score بود
        const pen = QW[q1] * Math.pow(DECAY[QCLUSTER[q1]] ?? F.decay, clusterCount[QCLUSTER[q1]] || 0);
        const val = h2 - 0.0 * pen;
        if(val < bestH){ bestH = val; bestQ = c.q; }
      }
      if(bestQ) return bestQ;
    }
    const slack = asked.length < 4 ? F.slack0 : asked.length < 8 ? F.slack1 : 1.0;
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
     طولانی‌تر ولی بسیار مقاوم‌تر می‌شود. با tune-soft.js جاروب شده. */
  function update(logScores, q, w){
    if(w === null) return logScores.slice();
    const qi = QUESTIONS.indexOf(q);
    const two = F.forgive > 0, has2 = logScores.length === 2 * NC;
    const out = new Array(two ? 2 * NC : NC);
    for(let i = 0; i < NC; i++){
      const p = SQ[qi] * 0.5 + (1 - SQ[qi]) * P[i * NQ + qi];
      const ll = Math.log(w * p + (1 - w) * (1 - p));
      out[i] = logScores[i] + ll;
      if(two) out[NC + i] = Math.min(has2 ? logScores[NC + i] : 0, ll);
    }
    return out;
  }

  return {clamp, ANSWERS, likelihood, lse, toProbs, entropy,
          rankQuestions, pickQuestion, update, rebuild, NQ,
          get NC(){ return NC; },              // پویا — با «یادش بده» زیاد می‌شود
          setSoft(v){ SOFT = v; for(let q = 0; q < NQ; q++) SQ[q] = softOf(QUESTIONS[q]); rebuild(); },
          get liveCount(){ return liveN; }};   // برای پشت‌صحنه
})();

