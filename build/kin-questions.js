/* ============================================================
   بلوکی که به انتهای QUESTIONS در build/questions.js اضافه می‌شود،
   به‌علاوه‌ی KIN_OVERRIDE که در generate.js اعمال می‌گردد.

   قاعده‌ی طلایی: هر سؤال فامیلی برای غیرفامیل باید مقدارِ *ثابت*
   بدهد. ثابت یعنی information-gain صفر، یعنی وقتی جرم احتمال روی
   سلبریتی‌هاست عمه‌جان هیچ‌وقت این سؤال‌ها را نمی‌پرسد.
   ============================================================ */

const KIN_QUESTIONS = [

  /* --- تنها سؤالی که فامیل را از سلبریتی جدا می‌کند، و کاملاً طبیعی است --- */
  {id:'fam_close', cluster:'fam', text:'خودت از نزدیک دیدیش؟ باهاش حرف زدی؟',
   rule:t => t.has('kin') ? .96 : .06},

  {id:'fam_blood', cluster:'fam', text:'نسبتِ خونی باهات داره؟ نه اینکه با ازدواج فامیل شده باشه',
   rule:t => !t.has('kin') ? .04 : t.has('blood') ? .95 : .05},

  {id:'fam_pat', cluster:'fam', text:'از طرفِ بابات قربونت برم؟',
   rule:t => !t.has('kin') ? .04 : t.has('pat') ? .95 : t.has('nuc') ? .35 : .04},

  {id:'fam_mat', cluster:'fam', text:'از طرفِ مامانته؟',
   rule:t => !t.has('kin') ? .04 : t.has('mat') ? .95 : t.has('nuc') ? .35 : .04},

  {id:'fam_inlaw', cluster:'fam', text:'از فامیلِ همسرته؟',
   rule:t => !t.has('kin') ? .03 : t.has('inlaw') ? .95 : .03},

  {id:'fam_older', cluster:'fam', text:'ازت بزرگ‌تره؟',
   rule:t => !t.has('kin') ? .50 :
     t.has('g2up') ? .97 : t.has('g1up') ? .95 : t.has('g0') ? .45 : .03},

  {id:'fam_gen0', cluster:'fam', text:'هم‌سن‌وسالِ خودته؟ با هم بزرگ شدین؟',
   rule:t => !t.has('kin') ? .05 : t.has('g0') ? .90 : .05},

  {id:'fam_g2up', cluster:'fam', text:'نسلِ بابابزرگ مامان‌بزرگ‌هاست؟',
   rule:t => !t.has('kin') ? .03 : t.has('g2up') ? .95 : .03},

  /* پدر و مادر پرتکرارترین انتخاب‌اند ولی هیچ برچسب یکتایی نداشتند و با
     ناپدری/نامادری و پدربزرگ قاطی می‌شدند (۷۰٪). این سؤال جداشان می‌کند. */
  {id:'fam_own_parent', cluster:'fam', text:'بابا یا مامانِ خودته؟',
   rule:t => !t.has('kin') ? .03 : t.has('parent0') ? .96 : .03},

  {id:'fam_child', cluster:'fam', text:'بچه‌ی خودته مادرجان؟',
   rule:t => !t.has('kin') ? .02 : t.has('child') ? .96 : .02},

  {id:'fam_gchild', cluster:'fam', text:'نوه‌ته؟',
   rule:t => !t.has('kin') ? .02 : t.has('gchild') ? .95 : .02},

  {id:'fam_cousin', cluster:'fam', text:'بچه‌ی عمو عمه دایی خاله‌ته؟',
   rule:t => !t.has('kin') ? .03 : t.has('cousin') ? .95 : .03},

  {id:'fam_nibling', cluster:'fam', text:'بچه‌ی خواهر یا برادرته؟',
   rule:t => !t.has('kin') ? .03 : t.has('nibling') ? .95 : .03},

  {id:'fam_samehouse', cluster:'fam', text:'تو یه خونه با هم بزرگ شدین؟',
   rule:t => !t.has('kin') ? .05 :
     (t.has('nuc') && t.has('blood')) ? .92 : t.has('nuc') ? .40 : .05},

  {id:'fam_step', cluster:'fam', text:'ناتنیه؟ تنی که نیست؟',
   rule:t => !t.has('kin') ? .03 : t.has('step') ? .92 : .03},

  {id:'fam_spouse', cluster:'fam', text:'همسرته؟ باهاش ازدواج کردی؟',
   rule:t => !t.has('kin') ? .02 : t.has('spouse') ? .96 : .02},

  /* --- واسطه: پسرعمو را از پسرعمه، و برادرزاده را از خواهرزاده جدا می‌کند --- */
  {id:'fam_via_male', cluster:'fam', text:'واسطه‌تون یه مَرده؟ یعنی از طرف عمو، دایی، داداش یا پسرته؟',
   rule:t => !t.has('kin') ? .30 : t.has('via_m') ? .93 : t.has('via_f') ? .05 : .30},

  /* --- خودِ بازیکن: مادرشوهر را از مادرزن، و باجناق را از برادرزن جدا می‌کند --- */
  {id:'fam_you_male', cluster:'fam', text:'خودت مَردی قربونت برم؟',
   rule:t => !t.has('kin') ? .45 : t.has('you_m') ? .93 : t.has('you_f') ? .05 : .45},

  {id:'fam_married_in', cluster:'fam', text:'خودش با ازدواج اومده تو فامیل؟ عروسِ خونه‌ست یا دامادِ خونه؟',
   rule:t => !t.has('kin') ? .04 : t.has('married_in') ? .93 : .04},

  /* سه برچسبِ زیر در chars-09-family بودند ولی هیچ سؤالی سراغشان نمی‌رفت —
     یعنی اطلاعاتشان دور ریخته می‌شد. هر سه طبیعی‌ترین چیزی‌اند که یک عمه
     می‌پرسد، و هرکدام یک‌تنه چند نسبت را کنار می‌گذارند. */
  {id:'fam_punc', cluster:'fam', text:'عمو یا عمه یا دایی یا خاله‌ته؟',
   rule:t => !t.has('kin') ? .03 : t.has('punc') ? .95 : .03},

  {id:'fam_sib', cluster:'fam', text:'داداش یا آبجیه؟ (چه مالِ خودت، چه مالِ همسرت)',
   rule:t => !t.has('kin') ? .03 : t.has('sib') ? .94 : .03},

  {id:'fam_parentfig', cluster:'fam', text:'حکم پدر یا مادر رو داره ولی بابا مامانِ خودت نیست؟',
   rule:t => !t.has('kin') ? .03 : t.has('parent') ? .93 : .03},
];

/* ============================================================
   KIN_OVERRIDE — سؤال‌های دنیای سلبریتی برای فامیل بی‌معنا هستند.
   بدون این، «اسمش رو همه شنیدن؟» برای خواهرِ آدم ۰.۹۳ می‌شود
   (چون rule از __tier می‌خواند) و کل بازی خراب می‌شود.
   مقدار عدد یا تابعی از برچسب‌هاست.
   ============================================================ */

const G = t => t.has('g2up') ? 'g2up' : t.has('g1up') ? 'g1up'
            : t.has('g0') ? 'g0' : t.has('g1dn') ? 'g1dn' : 'g2dn';

const KIN_OVERRIDE = {
  // bio
  alive:       t => t.has('g2up') ? .55 : .95,
  old_person:  t => ({g2up:.95, g1up:.55, g0:.12, g1dn:.04, g2dn:.03})[G(t)],
  married_fam: t => ({g2up:.95, g1up:.92, g0:.60, g1dn:.15, g2dn:.03})[G(t)],
  child_star: .02,

  // ملیت
  iranian: .97,
  american: .02, european: .02, eastern: .02,

  // دوره
  ancient: .02, dahe60: .06, newgen: .05, legend: .06,
  prerev: t => t.has('g2up') ? .35 : .04,
  active: t => t.has('elder') ? .25 : t.has('young') ? .30 : .55,

  // شغل — هیچ‌کدام معرّفِ یک فامیل نیست
  artist:.03, actor:.03, director:.03, singer:.03, musician:.03, athlete:.03,
  footballer:.03, writer:.03, poet:.03, scientist:.03, inventor:.03, ruler:.02,
  religious:.08, tvhost:.03, businessman:.04, techie:.04, doctor:.04,
  wrestler:.03, dancer:.03,

  // رسانه
  tv:.04, cinema:.03, series:.03, cartoon_media:.02, book_media:.03,
  stadium:.04, internet:.06, theater:.03, game:.02,
  kids: .35,                    // «بچه‌ها هم می‌شناسنش؟» در فامیل بله، ولی گمراه‌کننده

  // واقعی/خیالی
  real: .97,

  // شهرت — مهم‌ترین اورراید
  world:.02, award:.03, everyone:.03, rich:.15,
};

// سؤال‌های ظاهری (عینک، ریش، سبیل، کچلی، تپلی) و سبکی (طنز، جدی، محبوب،
// حاشیه‌دار) عمداً اورراید نشده‌اند — همان قاعده‌ی اصلی برایشان درست کار
// می‌کند و «عینک می‌زنه؟» درباره‌ی بابابزرگ دقیقاً همان حالی را دارد که باید.

/* تورِ ایمنی: اگر بعداً سؤالِ تازه‌ای به دنیای سلبریتی اضافه شد و کسی
   یادش رفت اورراید بنویسد، به‌جای مقدارِ بی‌معنا این پیش‌فرضِ کلاستر
   می‌نشیند. کلاسترهای bio/look/style/fict عمداً این‌جا نیستند — قاعده‌ی
   اصلی‌شان برای فامیل هم درست کار می‌کند. */
const KIN_CLUSTER_DEFAULT = { nat: .03, era: .05, prof: .03, media: .04, fame: .04,
                              world: .03, gear: .04, work: .03 };

module.exports = { KIN_QUESTIONS, KIN_OVERRIDE, KIN_CLUSTER_DEFAULT };
