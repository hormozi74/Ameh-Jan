/* ============================================================
   عمه‌جان — ۶۰ سؤال، هر کدام با یک قاعده‌ی برچسب → احتمال
   t یک Set از برچسب‌های شخصیت است. خروجی: احتمال پاسخ «بله».
   ============================================================ */

// کمک‌تابع: اگر هر کدام از برچسب‌ها موجود بود hi، وگرنه lo
const has = (t, ...tags) => tags.some(x => t.has(x));
const pick = (cond, hi, lo) => cond ? hi : lo;
/* چند رسانه‌ی متفاوت دارد؟ (سینما، سریال، تلویزیون، کارتون/انیمه، بازی، کتاب)
   برای آدمِ واقعی tv+cinema+series یک «جهان» است و تفکیک نمی‌خواهد؛ برای
   شخصیتِ خیالی هر رسانه یک درِ ورودیِ جداست. */
const MEDIA_GROUPS = [['cinema'], ['series'], ['tv'], ['cartoon', 'anime'], ['game'], ['book', 'novelchar']];
const mediaCount = t => MEDIA_GROUPS.filter(g => g.some(x => t.has(x))).length;
const mediaP = (t, hi) => { const n = t.has('fic') ? mediaCount(t) : 1; return n >= 3 ? .68 : n === 2 ? .80 : hi; };
/* چند «تجسم» دارد؟ هادس هم اسطوره است هم شرورِ دیزنی هم بازیِ روگ‌لایک؛ بازیکنی
   که به بازی فکر می‌کند به «اسمش رو همه شنیدن؟» و «مالِ صدها سال پیشه؟» نه
   می‌گوید، بازیکنِ اسطوره آره. رده یکی است ولی جواب‌ها دو دسته‌اند، پس
   احتمالِ این سؤال‌ها باید به میانه نزدیک شود نه قاطع. */
const incarnations = t => t.has('fic') ? mediaCount(t) + (t.has('mythic') ? 1 : 0) : 1;
const multiP = (t, p) => { const n = incarnations(t); return n >= 3 ? p * 0.55 + 0.5 * 0.45 : n === 2 ? p * 0.75 + 0.5 * 0.25 : p; };
/* سه «قلمرو» برای سؤال‌های چندرسانه‌ای: پرده (سینما/سریال/تلویزیون/کارتون/انیمه)، بازی، کتاب‌وافسانه.
   برچسبِ `game` یعنی «از بازی می‌شناسنش»، نه «بازی‌ای ازش هست» — مردِ عنکبوتی `game` ندارد
   ولی ده‌ها بازی دارد. پس سؤالِ «بازی هم ازش هست؟» برای شخصیتِ معروفِ تک‌قلمرو باید
   نزدیکِ میانه بماند (بازیکن احتمالاً می‌داند بازی دارد) و فقط برای شخصیتِ گمنامِ
   تک‌قلمرو قاطعانه «نه» باشد. رده (t.__tier) همین را می‌گوید. */
const SCREEN = t => has(t,'cinema','series','tv','cartoon','anime');
const BOOKISH = t => has(t,'book','novelchar','mythic');
const domains = t => (SCREEN(t) ? 1 : 0) + (t.has('game') ? 1 : 0) + (BOOKISH(t) ? 1 : 0);
const byTier = (t, t4, t3, lo) => t.__tier === 4 ? t4 : t.__tier === 3 ? t3 : lo;

const QUESTIONS = [

  /* ---------------- bio: پایه‌ای‌ترین‌ها ---------------- */
  {id:'male', cluster:'bio', text:'مَرد یا پسره؟',
   rule:t => t.has('m') ? .97 : t.has('f') ? .03 : .5},

  /* قبلاً «الان زنده‌ست؟» بود و برای شخصیت خیالی دوپهلو — بازیکن درباره‌ی
     داستان جواب می‌داد (دین وینچستر زنده‌ست!) و داده درباره‌ی دنیای واقعی.
     صریح‌کردنِ «آدمِ واقعی» جواب را قطعی می‌کند و سؤال را به یکی از
     قوی‌ترین تفکیک‌کننده‌ها تبدیل می‌کند. */
  {id:'alive', cluster:'bio', text:'آدمِ واقعیه و الان زنده‌ست؟',
   rule:t => t.has('fic') ? .04 : t.has('alive') ? .96 : .04},

  {id:'old_person', cluster:'bio', text:'پیره؟ یعنی بالای شصت سالشه، یا وقتی فوت کرد بالای شصت بود؟',
   rule:t => t.has('fic') ? .18 : has(t,'elder') ? .90 : has(t,'young') ? .06 : .35},

  {id:'married_fam', cluster:'bio', text:'متأهله؟ ازدواج کرده؟',
   rule:t => t.has('fic') ? .30 : has(t,'celibate') ? .10 : .72},

  {id:'child_star', cluster:'bio', text:'از بچگی معروف شد؟',
   rule:t => has(t,'childstar') ? .92 : .08},

  {id:'died_young', cluster:'bio', text:'جوون از دنیا رفت؟',
   rule:t => has(t,'diedyoung') ? .93 : t.has('dead') ? .12 : .03},

  /* ---------------- nat: ملیت ---------------- */
  {id:'iranian', cluster:'nat', text:'ایرانیه؟ یعنی خودش یا داستانش مالِ ایرانه؟',
   rule:t => t.has('ir') ? .97 : .03},

  /* شخصیتِ دیزنی/هالیوود را بازیکن «آمریکایی» می‌داند حتی اگر قصه‌ی اصلی اروپایی باشد
     (سیندرلا، سفیدبرفی، پینوکیو). خواننده‌ی لاتین/کانادایی هم برای بازیکنِ ایرانی «آمریکایی» است. */
  {id:'american', cluster:'nat', text:'آمریکاییه؟ یا داستانش ساختِ آمریکاست؟',
   rule:t => t.has('us') ? .94 : t.has('ir') ? .02 : has(t,'fr_disney','fr_dreamworks','fr_marvel','fr_dc','fr_looney','fr_simpsons','fr_toystory','fr_shrek','fr_frozen','fr_lionking','fr_minions','fr_starwars','fr_pirates','fr_matrix','fr_jurassic','fr_fast','fr_transformers','fr_turtles') ? .60 : .10},

  {id:'european', cluster:'nat', text:'اروپاییه؟ یا داستانش ساختِ اروپاست؟',
   rule:t => t.has('eu') ? (t.has('fic') && has(t,'fr_disney','fr_dreamworks','fr_looney') ? .55 : .93) : t.has('ir') ? .02 : .12},

  {id:'eastern', cluster:'nat', text:'اهلِ شرقِ آسیاست؟ مثل ژاپن، چین، کره',
   rule:t => has(t,'asia') ? .92 : .04},

  /* ---------------- era: دوره ---------------- */
  {id:'ancient', cluster:'era', text:'مالِ صدها سال پیشه؟ یعنی تاریخی یا افسانه‌ی قدیمیه؟',
   rule:t => multiP(t, has(t,'ancient') ? .95 : has(t,'old') ? .62 : .03)},

  {id:'prerev', cluster:'era', text:'اوجِ شهرتش قبل از انقلاب بود؟ یعنی دهه‌ی چهل و پنجاه؟',
   rule:t => has(t,'prerev') ? .90 : has(t,'ancient','old') ? .30 : .05},

  {id:'dahe60', cluster:'era', text:'اوجِ معروفیتش دهه‌ی شصت و هفتادِ شمسی بود؟',
   rule:t => has(t,'d60') ? .90 : has(t,'modern') ? .35 : .06},

  /* بیشترِ ردیف‌های آدمِ زنده برچسبِ `active` ندارند ولی واقعاً فعال‌اند؛ برای زنده‌ی
     غیرِ پیر «نمی‌دانیم» (۰.۵۵) درست‌تر از ۰.۳۵ است، وگرنه «آره»ی بازیکن شخصیتِ درست را می‌کُشد. */
  {id:'active', cluster:'era', text:'هنوز فعاله؟ یعنی این چند سال کارِ جدید (فیلم، آهنگ، بازی…) ازش اومده؟',
   rule:t => t.has('fic') ? (has(t,'active') ? .60 : .20)
           : has(t,'active') ? .88 : t.has('alive') ? (has(t,'elder','prerev') ? .30 : has(t,'newgen','modern') ? .75 : .55) : .04},

  {id:'newgen', cluster:'era', text:'همین چند سالِ اخیر معروف شده؟',
   rule:t => has(t,'newgen') ? .88 : .07},

  /* بازیکن رده‌۴ را «بزرگِ رشته» می‌داند حتی اگر برچسبِ legend نداشته باشد */
  {id:'legend', cluster:'era', text:'جزوِ بزرگانِ تاریخِ رشته‌ی خودش حساب می‌شه؟',
   rule:t => multiP(t, has(t,'legend') ? .88 : has(t,'ancient') ? .55 : t.__tier === 4 ? .60 : t.__tier === 3 ? .30 : .10)},

  /* ---------------- prof: شغل ---------------- */
  {id:'artist', cluster:'prof', text:'هنرمنده؟ مثل بازیگر، خواننده، نویسنده',
   rule:t => has(t,'actor','singer','musician','poet','writer','painter','director','dancer','comedian') ? .93 : .06},

  {id:'actor', cluster:'prof', text:'بازیگره؟ یعنی شغلِ خودِ این آدم بازیگریه؟',
   rule:t => t.has('actor') ? .96 : has(t,'director','comedian') ? .45 : .03},

  {id:'director', cluster:'prof', text:'کارگردانه؟ فیلم یا سریال می‌سازه؟',
   rule:t => t.has('director') ? .94 : has(t,'actor') ? .12 : .03},

  {id:'singer', cluster:'prof', text:'خواننده‌ست؟',
   rule:t => t.has('singer') ? .96 : t.has('musician') ? .35 : .03},

  {id:'musician', cluster:'prof', text:'نوازنده یا آهنگسازه؟',
   rule:t => has(t,'musician','composer') ? .92 : t.has('singer') ? .40 : .03},

  {id:'athlete', cluster:'prof', text:'ورزشکاره؟',
   rule:t => has(t,'athlete','footballer','wrestler','champion') ? .96 : .03},

  {id:'footballer', cluster:'prof', text:'فوتبالیسته؟',
   rule:t => t.has('footballer') ? .95 : has(t,'athlete') ? .10 : .02},

  {id:'writer', cluster:'prof', text:'نویسنده‌ست؟ کتاب نوشته؟',
   rule:t => has(t,'writer') ? .94 : has(t,'poet') ? .45 : has(t,'scientist','philosopher') ? .40 : .05},

  {id:'poet', cluster:'prof', text:'شاعره؟',
   rule:t => t.has('poet') ? .96 : .03},

  {id:'scientist', cluster:'prof', text:'اهلِ علمه؟ دانشمند، فیلسوف یا پزشک؟',
   rule:t => has(t,'scientist','mathematician','physicist','doctor','philosopher') ? .94 : .03},

  {id:'inventor', cluster:'prof', text:'چیزی اختراع یا کشف کرده؟',
   rule:t => has(t,'inventor') ? .93 : has(t,'scientist') ? .45 : .03},

  {id:'ruler', cluster:'prof', text:'پادشاه، فرمانروا یا سردارِ بزرگ بوده؟',
   rule:t => has(t,'king','general') ? .90 : .02},

  {id:'religious', cluster:'prof', text:'شخصیتِ مذهبیه؟ مثل پیامبر، امام، عارف یا عالمِ دینی',
   rule:t => has(t,'religious','mystic') ? .90 : .02},

  {id:'tvhost', cluster:'prof', text:'مجریِ تلویزیونه؟',
   rule:t => has(t,'tvhost') ? .93 : has(t,'comedian') ? .25 : .03},

  {id:'businessman', cluster:'prof', text:'تاجر یا کارآفرینه؟ صاحبِ شرکته؟',
   rule:t => has(t,'business','techie') ? .90 : .02},

  {id:'techie', cluster:'prof', text:'کارش با کامپیوتر و تکنولوژیه؟',
   rule:t => has(t,'techie') ? .93 : .02},

  /* ---------------- media: کجا دیدیش ---------------- */
  /* «کجا دیدیش؟» درباره‌ی *بازیکن* است، نه فهرستِ آثارِ شخصیت. جوکر هم سینما
     دارد هم کارتون، ولی هر بازیکن معمولاً از یکی می‌شناسدش و به دیگری «نه»
     می‌گوید. اگر هر دو ۰.۹۳ باشند، آن «نه» شخصیتِ درست را شش برابر پایین
     می‌کشد. پس هر رسانه‌ی اضافی، احتمالِ هر یک را پایین می‌آورد. */
  {id:'tv', cluster:'media', text:'بیشتر از تلویزیون می‌شناسیش؟ یعنی سریال یا برنامه‌ی تلویزیونی داشته؟',
   rule:t => has(t,'tv') ? mediaP(t, .92) : has(t,'cinema','athlete','singer') ? .55 : .12},

  {id:'cinema', cluster:'media', text:'تو فیلمِ سینمایی دیدیش؟ نه فقط تلویزیون یا سریال',
   /* بازیگری که ردیفش فقط `series/tv` دارد معمولاً فیلم هم بازی کرده (داده ناقص است) → ۰.۵۵ نه ۰.۳۰ */
   rule:t => has(t,'cinema') ? mediaP(t, .93) : has(t,'actor') ? .55 : has(t,'tv') ? .30 : .05},

  {id:'series', cluster:'media', text:'تو سریال بازی کرده یا شخصیتِ یه سریاله؟',
   /* شخصیتِ خیالیِ تلویزیونی (هومر، باب اسفنجی) برای بازیکن «سریال» است حتی اگر
      ردیفش فقط `tv` داشته باشد */
   rule:t => has(t,'series') ? mediaP(t, .91) : (t.has('fic') && t.has('tv')) ? .70 : has(t,'actor') ? .50 : .04},

  {id:'cartoon_media', cluster:'media', text:'کارتون یا انیمیشن هم ازش هست؟ یعنی به شکلِ کارتونی هم دیده شده؟',
   rule:t => has(t,'cartoon','anime') ? mediaP(t, .94) : .03},

  {id:'book_media', cluster:'media', text:'کتابی‌یه؟ یعنی شاعر و نویسنده‌ست، یا شخصیتی که از کتاب اومده؟',
   rule:t => has(t,'book','novelchar') ? mediaP(t, .86) : has(t,'poet','writer') ? .86 : .05},

  {id:'stadium', cluster:'media', text:'تو ورزشگاه و مسابقه‌های ورزشی می‌بینیش؟',
   rule:t => has(t,'stadium','athlete','footballer','wrestler') ? .90 : .02},

  /* سلبریتیِ زنده‌ی معروف تقریباً همیشه در اینستاگرام پرطرفدار است */
  {id:'internet', cluster:'media', text:'تو اینستاگرام و شبکه‌های اجتماعی خیلی پرطرفداره؟',
   rule:t => has(t,'internet') ? .90 : t.has('fic') ? .08 : t.has('alive') ? (has(t,'newgen') ? .70 : t.__tier >= 3 ? .60 : has(t,'active') ? .45 : .25) : .05},

  {id:'kids', cluster:'media', text:'بچه‌های کوچیک هم می‌شناسنش؟ مثلاً یه بچه‌ی هفت‌ساله اسمش رو بلده؟',
   rule:t => multiP(t, has(t,'kids') ? .93 : has(t,'cartoon','puppet') ? .80 : has(t,'worldfame') ? .35 : .12)},

  /* ---------------- style: حال‌وهوا ---------------- */
  {id:'comedy', cluster:'style', text:'طنز و کمدیه؟ یعنی کارش یا داستانش خنده‌داره؟',
   rule:t => multiP(t, has(t,'comedy') ? .93 : .05)},

  {id:'serious', cluster:'style', text:'جدیه؟ یعنی اهلِ شوخی و خنده نیست؟',
   rule:t => multiP(t, has(t,'comedy') ? .10 : has(t,'serious') ? .90 : .50)},

  {id:'love', cluster:'style', text:'کارش یا داستانش عاشقانه‌ست؟',
   rule:t => has(t,'love') ? .90 : .06},

  {id:'epic', cluster:'style', text:'جنگجو یا پهلوانه؟ یعنی تو داستان یا تاریخ می‌جنگه؟',
   rule:t => has(t,'epic','war','hero','general') ? .88 : .04},

  {id:'pop', cluster:'style', text:'خواننده‌ی پاپه؟ یعنی سبکش پاپ و امروزیه؟',
   rule:t => has(t,'pop') ? .90 : has(t,'traditional','classical') ? .05 : .12},

  {id:'traditional', cluster:'style', text:'سبکش سنتی یا کلاسیکه؟ مثل موسیقیِ اصیل یا شعرِ کلاسیک',
   rule:t => has(t,'traditional','classical') ? .90 : .07},

  {id:'controversial', cluster:'style', text:'حاشیه و جنجال زیاد داره؟',
   rule:t => has(t,'controversial') ? .85 : .12},

  {id:'beloved', cluster:'style', text:'محبوبه؟ یعنی بیشترِ مردم دوستش دارن، نه اینکه ازش بدشون بیاد؟',
   rule:t => has(t,'villain') ? .08 : has(t,'beloved') ? .90 : .55},

  /* ---------------- look: ظاهر ---------------- */
  {id:'glasses', cluster:'look', text:'همیشه عینک می‌زنه؟ یعنی با عینک می‌شناسنش؟',
   rule:t => has(t,'glasses') ? .88 : .15},

  {id:'beard', cluster:'look', text:'ریش داره؟ یعنی معمولاً با ریش دیده می‌شه؟',
   rule:t => t.has('f') ? .02 : has(t,'beard') ? .88 : .22},

  {id:'mustache', cluster:'look', text:'سبیل داره؟ یعنی معمولاً با سبیل دیده می‌شه؟',
   rule:t => t.has('f') ? .02 : has(t,'mustache') ? .88 : .20},

  {id:'blond', cluster:'look', text:'موهاش بور یا چشماش رنگیه؟',
   rule:t => has(t,'blond') ? .85 : t.has('ir') ? .07 : .25},

  {id:'chubby', cluster:'look', text:'تپل و چاقه؟',
   rule:t => has(t,'chubby') ? .85 : .13},

  /* ---------------- fict: واقعی یا خیالی ---------------- */
  {id:'real', cluster:'fict', text:'آدمِ واقعیه؟ یعنی شخصیتِ داستانی نیست؟',
   rule:t => t.has('fic') ? .05 : has(t,'mythic') ? .25 : .95},

  /* ابرقهرمانِ مارول/دی‌سی که فیلمِ سینمایی دارد (بتمن، جوکر) برای بازیکن «شخصیتِ فیلم» است
     نه کارتونی، هرچند کارتونش هم هست؛ ولی اولاف و دوری با `cinema` همان کارتونی‌اند. */
  {id:'cartoon_char', cluster:'fict', text:'اصلش یه شخصیتِ کارتونی یا انیمه‌ایه؟',
   rule:t => has(t,'cartoon','anime') ? (has(t,'fr_marvel','fr_dc') && t.has('cinema') ? .55 : mediaP(t, .93)) : .02},

  {id:'puppet', cluster:'fict', text:'عروسکه؟',
   rule:t => has(t,'puppet') ? .94 : .02},

  {id:'superpower', cluster:'fict', text:'قدرتِ جادویی یا فوق‌بشری داره؟',
   rule:t => has(t,'super','mythic') ? .90 : .02},

  /* ---------------- fame: شهرت ---------------- */
  {id:'world', cluster:'fame', text:'تو کلِ دنیا معروفه؟ یعنی خارج از کشورِ خودش هم می‌شناسنش؟',
   rule:t => multiP(t, has(t,'worldfame') ? .93 : t.has('ir') ? .07 : .45)},

  {id:'award', cluster:'fame', text:'جایزه‌ی مهمِ جهانی گرفته؟ مثل اسکار، نوبل، توپِ طلا',
   rule:t => has(t,'award') ? .90 : .05},

  {id:'everyone', cluster:'fame', text:'اسمش رو تقریباً همه شنیدن؟ حتی کسی که اهلِ این چیزا نیست؟',
   rule:t => multiP(t, ({4:.93, 3:.72, 2:.38, 1:.12})[t.__tier] ?? .45)},

  /* ---- سؤال‌های تفکیک‌کننده که با تحلیل جفت‌های نزدیک اضافه شدند ---- */
  {id:'animal', cluster:'fict', text:'حیوونه؟ حیوونِ سخنگو هم حسابه',
   rule:t => has(t,'animal') ? .94 : .02},

  {id:'doctor', cluster:'prof', text:'پزشکه؟',
   rule:t => t.has('doctor') ? .93 : has(t,'scientist') ? .12 : .02},

  {id:'rich', cluster:'fame', text:'خیلی پولداره؟ یعنی به ثروتش معروفه؟',
   rule:t => has(t,'rich','business') ? .90 : has(t,'worldfame') ? (t.has('fic') ? .25 : .55) : (!t.has('fic') && t.__tier === 4) ? .45 : .18},

  {id:'bald', cluster:'look', text:'کچله؟',
   rule:t => has(t,'bald') ? .90 : .10},

  /* ---- برچسب‌هایی که در داده بودند ولی هیچ سؤالی سراغشان نمی‌رفت ----
     اطلاعاتشان عملاً دور ریخته می‌شد و باعث می‌شد کشتی‌گیرها از والیبالیست‌ها،
     رقصنده‌ها از خواننده‌ها و بازیگرهای تئاتر از بازیگرهای سینما جدا نشوند. */
  {id:'wrestler', cluster:'prof', text:'کشتی‌گیره؟',
   rule:t => t.has('wrestler') ? .94 : has(t,'athlete') ? .08 : .02},

  {id:'dancer', cluster:'prof', text:'رقصنده‌ست؟',
   rule:t => t.has('dancer') ? .92 : has(t,'singer') ? .20 : .03},

  {id:'theater', cluster:'media', text:'تو تئاتر هم کار کرده؟',
   rule:t => t.has('theater') ? .90 : has(t,'actor') ? .25 : .04},

  {id:'game', cluster:'media', text:'از بازیِ کامپیوتری می‌شناسنش؟ یعنی شخصیتِ یه بازیه؟',
   rule:t => t.has('game') ? mediaP(t, .93) : has(t,'cartoon','anime') ? .15 : .02},

  /* ---- شخصیت‌های چندرسانه‌ای (۱۱ اکتبر) ----
     «کجا دیدیش؟» درباره‌ی بازیکن است و برای پیکاچو/ماریو/جوکر که هم بازی‌اند هم
     کارتون هم فیلم، هر «نه» شخصیتِ درست را می‌کُشد (mediaP فقط ضربه را کم می‌کند).
     این سه سؤال واقعیتِ *خودِ شخصیت* را می‌پرسند، نه تجربه‌ی بازیکن — جوابشان
     بین دو بازیکن فرق نمی‌کند. برای غیرخیالی ثابت‌اند تا دیر و به‌جا پرسیده شوند. */
  {id:'multi_media', cluster:'media', text:'هم تو فیلم، سریال یا کارتون هست هم بازیِ کامپیوتری ازش ساختن؟',
   rule:t => !t.has('fic') ? .03
           : SCREEN(t) && t.has('game') ? .90
           : SCREEN(t) || t.has('game') ? byTier(t, .40, .20, .03)
           : .03},

  {id:'from_book', cluster:'media', text:'اول تو کتاب، رمان یا افسانه‌ها بود و بعد ازش فیلم، سریال یا بازی ساختن؟',
   rule:t => !t.has('fic') ? .03
           : BOOKISH(t) && (SCREEN(t) || t.has('game')) ? .88
           : BOOKISH(t) ? .30
           : byTier(t, .12, .06, .03)},

  {id:'single_media', cluster:'media', text:'فقط تو یه رسانه هست؟ یعنی فقط بازی، فقط کارتون، یا فقط فیلم و سریال؟',
   rule:t => !t.has('fic') ? .03
           : domains(t) >= 2 ? .10
           : byTier(t, .45, .65, .85)}
];

/* دنیای خیالی — بازی، سریال، فیلم، کارتون. ← fic-questions.js */
const { FIC_QUESTIONS, FIC_KIN_OVERRIDE } = require('./fic-questions.js');
QUESTIONS.push(...FIC_QUESTIONS);

/* نسبت‌های فامیلی — در همان استخر شخصیت‌ها. عمه‌جان هرگز نمی‌پرسد
   «معروف یا فامیل؟»؛ سؤال‌های موجود (everyone/tv/world) خودشان
   جرمِ احتمال را جدا می‌کنند. ← kin-questions.js */
const { KIN_QUESTIONS, KIN_OVERRIDE, KIN_CLUSTER_DEFAULT } = require('./kin-questions.js');
QUESTIONS.push(...KIN_QUESTIONS);

Object.assign(KIN_OVERRIDE, FIC_KIN_OVERRIDE);

/* فیلم و انیمیشن — جواب می‌تواند خودِ فیلم باشد. ← film-questions.js */
const { FILM_QUESTIONS, FILM_OVERRIDE } = require('./film-questions.js');
QUESTIONS.push(...FILM_QUESTIONS);

/* کتاب — جواب می‌تواند خودِ کتاب باشد (۱۵ اکتبر ۲۰۲۶). ← book-questions.js */
const { BOOK_QUESTIONS, BOOK_OVERRIDE, EPONYM_CLUSTERS, EPONYM_W } = require('./book-questions.js');
QUESTIONS.push(...BOOK_QUESTIONS);

/* سؤال‌های داغ — دنیا و گروهِ کوچک؛ عمه فقط وقتی بو برده می‌پرسدشان. ← hot-questions.js */
const { HOT_QUESTIONS } = require('./hot-questions.js');
QUESTIONS.push(...HOT_QUESTIONS);

/* حرفِ اولِ اسم — فقط وقتی عمه داغ است (دروازه در موتور). ← letter-questions.js */
const { LETTER_QUESTIONS } = require('./letter-questions.js');
QUESTIONS.push(...LETTER_QUESTIONS);

module.exports = { QUESTIONS, KIN_OVERRIDE, KIN_CLUSTER_DEFAULT, FILM_OVERRIDE, BOOK_OVERRIDE, EPONYM_CLUSTERS, EPONYM_W };
