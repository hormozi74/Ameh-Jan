/* ============================================================
   سؤال‌های دنیای خیالی — بازی، فیلم، سریال، کارتون، کامیک.

   چرا این فایل هست: با اضافه‌شدن ~۹۰۰ شخصیتِ خیالی، پرسش‌های قدیمی
   («بازیگره؟»، «می‌خونه؟») دیگر چیزی را جدا نمی‌کردند و همه‌ی این جمعیت
   زیرِ یک برچسبِ `fic` روی هم می‌افتاد. هر سؤالِ این‌جا یک محورِ واقعیِ
   تفکیک است: شرور/قهرمان، شمشیر/تفنگ، ربات/هیولا، سریال/بازی/فیلم.

   قاعده‌ی طراحی — همان قاعده‌ی kin-questions:
   برای کسی که برچسب را ندارد، مقدار باید *ثابت* باشد. ثابت یعنی
   information-gain صفر، یعنی تا وقتی جرمِ احتمال روی آدم‌های واقعی است
   عمه‌جان هرگز نمی‌پرسد «شمشیر داره؟».
   ============================================================ */

const has = (t, ...tags) => tags.some(x => t.has(x));

const FIC_QUESTIONS = [

  /* ---------------- fict: سرشتِ شخصیت ---------------- */

  /* `villain` در داده بود ولی هیچ سؤالی سراغش نمی‌رفت — فقط غیرمستقیم از
     «همه دوستش دارن؟» دیده می‌شد. برای صدها شروری که اضافه شدند این
     پرارزش‌ترین سؤالِ یک‌بیتی است. */
  {id:'villain', cluster:'fict', text:'آدم‌بَدِ قصه‌ست؟ شرورِ داستانه؟',
   rule:t => has(t,'villain') ? .92 : .05},

  {id:'lead', cluster:'fict', text:'خودش قهرمانِ اصلیِ ماجراست؟ همه‌چی دورِ خودش می‌چرخه؟',
   rule:t => !t.has('fic') ? .10 : has(t,'lead') ? .90 : .12},

  {id:'robot', cluster:'fict', text:'رباته؟ آدم‌آهنی و ماشینه؟',
   rule:t => has(t,'robot') ? .93 : .02},

  {id:'monster', cluster:'fict', text:'هیولاست؟ جن و غول و زامبی و خون‌آشام؟',
   rule:t => has(t,'monster') ? .92 : has(t,'villain') ? .12 : .02},

  /* ---------------- world: دنیایی که توش می‌گذره ---------------- */

  {id:'space', cluster:'world', text:'داستانش تو فضاست؟ سفینه و سیاره‌های دیگه؟',
   rule:t => has(t,'space') ? .91 : .03},

  {id:'fantasy', cluster:'world', text:'تو دنیای شمشیر و جادو و اژدها و قلعه‌ست؟',
   rule:t => has(t,'fantasy') ? .90 : has(t,'mythic') ? .45 : .04},

  {id:'horror', cluster:'world', text:'ترسناکه؟ آدم ازش می‌ترسه؟',
   rule:t => has(t,'horror') ? .91 : has(t,'monster','villain') ? .25 : .03},

  {id:'apoc', cluster:'world', text:'داستانش آخرالزمانیه؟ دنیا نابود شده، زامبی و ویرونه؟',
   rule:t => has(t,'apoc') ? .90 : .03},

  /* ---------------- gear: ظاهر و ابزار ---------------- */

  {id:'masked', cluster:'gear', text:'صورتش رو می‌پوشونه؟ ماسک یا نقاب داره؟',
   rule:t => has(t,'masked') ? .91 : .04},

  {id:'costume', cluster:'gear', text:'یه لباسِ مخصوص داره که همیشه تنشه؟',
   rule:t => has(t,'costume') ? .88 : has(t,'super') ? .40 : .10},

  {id:'gun', cluster:'gear', text:'همیشه تفنگ و اسلحه‌ی گرم دستشه؟',
   rule:t => has(t,'gun') ? .90 : has(t,'soldier','cop') ? .45 : .04},

  {id:'sword', cluster:'gear', text:'شمشیر یا سلاحِ سرد داره؟',
   rule:t => has(t,'sword') ? .90 : has(t,'epic','general') ? .30 : .03},

  {id:'weirdhair', cluster:'gear', text:'موهاش رنگِ عجیبه؟ آبی و صورتی و سبز؟',
   rule:t => has(t,'weirdhair') ? .88 : .02},

  /* ---------------- prof: نقش‌هایی که در داده بودند ولی سؤال نداشتند ---------------- */

  {id:'cop', cluster:'prof', text:'پلیسه؟ کارآگاهه؟',
   rule:t => has(t,'cop') ? .92 : .03},

  {id:'criminal', cluster:'prof', text:'خلافکاره؟ دزد و گانگستر و قاچاقچی؟',
   rule:t => has(t,'criminal') ? .90 : has(t,'villain') ? .20 : .03},

  {id:'soldier', cluster:'prof', text:'سربازه؟ نظامیه؟',
   rule:t => has(t,'soldier') ? .90 : has(t,'war','general') ? .30 : .03},

  {id:'teacher', cluster:'prof', text:'معلمه؟ درس می‌ده؟',
   rule:t => has(t,'teacher') ? .91 : has(t,'scientist','philosopher') ? .25 : .03},

  /* ---------------- work: خودِ اثر، نه شخصیت ----------------
     این‌ها چیزی را می‌پرسند که بازیکن بی‌درنگ بلد است جواب بدهد
     («بازیش رو با گوشی بازی می‌کنی؟») و یک‌تنه صدها نامزد را کنار می‌گذارند. */

  {id:'playable', cluster:'work', text:'تو بازی، خودت کنترلش می‌کنی؟ باهاش بازی می‌کنی؟',
   rule:t => !t.has('game') ? .03 : has(t,'playable') ? .90 : .15},

  {id:'mobile_game', cluster:'work', text:'بازیش رو با گوشی بازی می‌کنی؟',
   rule:t => has(t,'mobile') ? .90 : t.has('game') ? .15 : .02},

  {id:'online_game', cluster:'work', text:'بازیش آنلاینه؟ با بقیه بازی می‌کنی؟',
   rule:t => has(t,'online') ? .89 : t.has('game') ? .18 : .02},

  {id:'fighting', cluster:'work', text:'بازیش مبارزه‌ی تن‌به‌تنه؟ مثل مورتال کمبت و تکن؟',
   rule:t => has(t,'fighting') ? .90 : t.has('game') ? .12 : .02},

  {id:'shooter', cluster:'work', text:'بازیش تیراندازیه؟ مثل کالاف دیوتی و کانتر؟',
   rule:t => has(t,'shooter') ? .90 : t.has('game') ? .12 : .02},

  {id:'openworld', cluster:'work', text:'بازیش جهان‌بازه؟ مثل جی‌تی‌ای که آزاد می‌چرخی؟',
   rule:t => has(t,'openworld') ? .89 : t.has('game') ? .15 : .02},

  {id:'retro', cluster:'work', text:'مال نسل قدیمِ بازی‌هاست؟ آتاری، سگا، میکرو؟',
   rule:t => has(t,'retro') ? .88 : has(t,'d60') ? .30 : .04},

  {id:'longrun', cluster:'work', text:'سریالش سال‌ها ادامه داشت؟ کلی فصل داشت؟',
   rule:t => has(t,'longrun') ? .89 : t.has('series') ? .25 : .04},

  {id:'stream', cluster:'work', text:'سریالش مال نتفلیکس و شبکه‌ی خانگیه، نه تلویزیون؟',
   rule:t => has(t,'stream') ? .89 : t.has('series') ? .18 : .03},

  {id:'sitcom', cluster:'work', text:'سریالش سیت‌کامه؟ مثل فرندز که هر قسمت می‌خندی؟',
   rule:t => has(t,'sitcom') ? .90 : has(t,'comedy') ? .18 : .03},

  /* ---------------- bio ---------------- */

  {id:'teen', cluster:'bio', text:'نوجوونه؟ هنوز مدرسه می‌ره؟',
   rule:t => has(t,'teen') ? .90 : has(t,'young') ? .28 : .04},
];

/* اورراید برای نسبت‌های فامیلی — هیچ‌کدام از این‌ها درباره‌ی خاله و عمو
   معنا ندارد. کلاسترهای world/gear/work در KIN_CLUSTER_DEFAULT هم
   هستند، ولی صریح نوشتن‌شان از فراموشیِ بعدی جلوگیری می‌کند. */
const FIC_KIN_OVERRIDE = {
  villain:.04, lead:.06, robot:.02, monster:.02,
  space:.02, fantasy:.02, horror:.04, apoc:.02,
  masked:.03, costume:.06, gun:.03, sword:.02, weirdhair:.03,
  cop:.05, criminal:.04, soldier:.08, teacher:.10,
  playable:.02, mobile_game:.02, online_game:.02, fighting:.02,
  shooter:.02, openworld:.02, retro:.03, longrun:.03, stream:.03, sitcom:.03,
  teen: t => t.has('g1dn') || t.has('g2dn') ? .40 : .05,
};

module.exports = { FIC_QUESTIONS, FIC_KIN_OVERRIDE };
