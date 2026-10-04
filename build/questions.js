/* ============================================================
   عمه‌جان — ۶۰ سؤال، هر کدام با یک قاعده‌ی برچسب → احتمال
   t یک Set از برچسب‌های شخصیت است. خروجی: احتمال پاسخ «بله».
   ============================================================ */

// کمک‌تابع: اگر هر کدام از برچسب‌ها موجود بود hi، وگرنه lo
const has = (t, ...tags) => tags.some(x => t.has(x));
const pick = (cond, hi, lo) => cond ? hi : lo;

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

  {id:'old_person', cluster:'bio', text:'پیره؟ بالای شصت سال داره؟',
   rule:t => t.has('fic') ? .18 : has(t,'elder') ? .90 : has(t,'young') ? .06 : .35},

  {id:'married_fam', cluster:'bio', text:'متأهله؟ ازدواج کرده؟',
   rule:t => t.has('fic') ? .30 : has(t,'celibate') ? .10 : .72},

  {id:'child_star', cluster:'bio', text:'از بچگی معروف شد؟',
   rule:t => has(t,'childstar') ? .92 : .08},

  {id:'died_young', cluster:'bio', text:'جوون از دنیا رفت؟',
   rule:t => has(t,'diedyoung') ? .93 : t.has('dead') ? .12 : .03},

  /* ---------------- nat: ملیت ---------------- */
  {id:'iranian', cluster:'nat', text:'ایرانیه؟',
   rule:t => t.has('ir') ? .97 : .03},

  {id:'american', cluster:'nat', text:'آمریکاییه؟',
   rule:t => t.has('us') ? .94 : t.has('ir') ? .02 : .10},

  {id:'european', cluster:'nat', text:'اروپاییه؟',
   rule:t => t.has('eu') ? .93 : t.has('ir') ? .02 : .12},

  {id:'eastern', cluster:'nat', text:'اهلِ شرقِ آسیاست؟ مثل ژاپن، چین، کره',
   rule:t => has(t,'asia') ? .92 : .04},

  /* ---------------- era: دوره ---------------- */
  {id:'ancient', cluster:'era', text:'مالِ صدها سال پیشه؟',
   rule:t => has(t,'ancient') ? .95 : has(t,'old') ? .62 : .03},

  {id:'prerev', cluster:'era', text:'قبل از انقلاب معروف بود؟',
   rule:t => has(t,'prerev') ? .90 : has(t,'ancient','old') ? .30 : .05},

  {id:'dahe60', cluster:'era', text:'اوجِ معروفیتش دهه‌ی شصت و هفتاد بود؟',
   rule:t => has(t,'d60') ? .90 : has(t,'modern') ? .35 : .06},

  {id:'active', cluster:'era', text:'هنوز فعاله و کارِ جدید می‌ده؟',
   rule:t => t.has('fic') ? (has(t,'active') ? .60 : .20)
           : has(t,'active') ? .88 : t.has('alive') ? .35 : .04},

  {id:'newgen', cluster:'era', text:'همین چند سالِ اخیر معروف شده؟',
   rule:t => has(t,'newgen') ? .88 : .07},

  {id:'legend', cluster:'era', text:'از اسطوره‌های رشته‌ی خودشه؟',
   rule:t => has(t,'legend') ? .88 : has(t,'ancient') ? .55 : .12},

  /* ---------------- prof: شغل ---------------- */
  {id:'artist', cluster:'prof', text:'هنرمنده؟ مثل بازیگر، خواننده، نویسنده',
   rule:t => has(t,'actor','singer','musician','poet','writer','painter','director','dancer','comedian') ? .93 : .06},

  {id:'actor', cluster:'prof', text:'بازیگره؟',
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

  {id:'ruler', cluster:'prof', text:'پادشاه یا فرمانروا بوده؟',
   rule:t => has(t,'king','general') ? .90 : .02},

  {id:'religious', cluster:'prof', text:'شخصیتِ مذهبیه؟',
   rule:t => has(t,'religious','mystic') ? .90 : .02},

  {id:'tvhost', cluster:'prof', text:'مجریِ تلویزیونه؟',
   rule:t => has(t,'tvhost') ? .93 : has(t,'comedian') ? .25 : .03},

  {id:'businessman', cluster:'prof', text:'تاجر یا کارآفرینه؟ صاحبِ شرکته؟',
   rule:t => has(t,'business','techie') ? .90 : .02},

  {id:'techie', cluster:'prof', text:'کارش با کامپیوتر و تکنولوژیه؟',
   rule:t => has(t,'techie') ? .93 : .02},

  /* ---------------- media: کجا دیدیش ---------------- */
  {id:'tv', cluster:'media', text:'تو تلویزیون دیدیش؟',
   rule:t => has(t,'tv') ? .92 : has(t,'cinema','athlete','singer') ? .55 : .12},

  {id:'cinema', cluster:'media', text:'تو فیلمِ سینمایی دیدیش؟',
   rule:t => has(t,'cinema') ? .93 : has(t,'tv') ? .30 : .05},

  {id:'series', cluster:'media', text:'تو سریال دیدیش؟',
   rule:t => has(t,'series') ? .91 : has(t,'actor') ? .35 : .04},

  {id:'cartoon_media', cluster:'media', text:'تو کارتون یا انیمیشن دیدیش؟',
   rule:t => has(t,'cartoon','anime') ? .94 : .03},

  {id:'book_media', cluster:'media', text:'بیشتر از تو کتاب‌ها می‌شناسیش؟',
   rule:t => has(t,'book','novelchar','poet','writer') ? .86 : .05},

  {id:'stadium', cluster:'media', text:'تو مسابقه‌های ورزشی دیده می‌شه؟',
   rule:t => has(t,'athlete','footballer','wrestler') ? .90 : .02},

  {id:'internet', cluster:'media', text:'تو اینترنت و شبکه‌های اجتماعی معروفه؟',
   rule:t => has(t,'internet') ? .90 : has(t,'newgen','active') ? .45 : .10},

  {id:'kids', cluster:'media', text:'بچه‌ها هم می‌شناسنش؟',
   rule:t => has(t,'kids') ? .93 : has(t,'cartoon','puppet') ? .80 : has(t,'worldfame') ? .35 : .12},

  /* ---------------- style: حال‌وهوا ---------------- */
  {id:'comedy', cluster:'style', text:'کارش طنز و کمدیه؟',
   rule:t => has(t,'comedy') ? .93 : .05},

  {id:'serious', cluster:'style', text:'شخصیتِ جدی و سنگینی داره؟',
   rule:t => has(t,'comedy') ? .10 : has(t,'serious') ? .90 : .50},

  {id:'love', cluster:'style', text:'کارش عاشقانه‌ست؟',
   rule:t => has(t,'love') ? .90 : .06},

  {id:'epic', cluster:'style', text:'جنگجوئه؟ اهلِ نبرد و پهلوانیه؟',
   rule:t => has(t,'epic','war','hero','general') ? .88 : .04},

  {id:'pop', cluster:'style', text:'سبکش پاپ و امروزیه؟',
   rule:t => has(t,'pop') ? .90 : has(t,'traditional','classical') ? .05 : .12},

  {id:'traditional', cluster:'style', text:'سبکش سنتی و کلاسیکه؟',
   rule:t => has(t,'traditional','classical') ? .90 : .07},

  {id:'controversial', cluster:'style', text:'حاشیه و جنجال زیاد داره؟',
   rule:t => has(t,'controversial') ? .85 : .12},

  {id:'beloved', cluster:'style', text:'بینِ مردم محبوبه؟',
   rule:t => has(t,'villain') ? .08 : has(t,'beloved') ? .90 : .55},

  /* ---------------- look: ظاهر ---------------- */
  {id:'glasses', cluster:'look', text:'عینک می‌زنه؟',
   rule:t => has(t,'glasses') ? .88 : .15},

  {id:'beard', cluster:'look', text:'ریش داره؟',
   rule:t => t.has('f') ? .02 : has(t,'beard') ? .88 : .22},

  {id:'mustache', cluster:'look', text:'سبیل داره؟',
   rule:t => t.has('f') ? .02 : has(t,'mustache') ? .88 : .20},

  {id:'blond', cluster:'look', text:'موهاش بوره؟',
   rule:t => has(t,'blond') ? .85 : t.has('ir') ? .07 : .25},

  {id:'chubby', cluster:'look', text:'تپل و چاقه؟',
   rule:t => has(t,'chubby') ? .85 : .13},

  /* ---------------- fict: واقعی یا خیالی ---------------- */
  {id:'real', cluster:'fict', text:'آدمِ واقعیه؟ یعنی شخصیتِ داستانی نیست؟',
   rule:t => t.has('fic') ? .05 : has(t,'mythic') ? .25 : .95},

  {id:'cartoon_char', cluster:'fict', text:'شخصیتِ کارتونیه؟',
   rule:t => has(t,'cartoon','anime') ? .93 : .02},

  {id:'puppet', cluster:'fict', text:'عروسکه؟',
   rule:t => has(t,'puppet') ? .94 : .02},

  {id:'superpower', cluster:'fict', text:'قدرتِ جادویی یا فوق‌بشری داره؟',
   rule:t => has(t,'super','mythic') ? .90 : .02},

  /* ---------------- fame: شهرت ---------------- */
  {id:'world', cluster:'fame', text:'تو کلِ دنیا معروفه؟',
   rule:t => has(t,'worldfame') ? .93 : t.has('ir') ? .07 : .45},

  {id:'award', cluster:'fame', text:'جایزه‌ی مهمِ جهانی گرفته؟',
   rule:t => has(t,'award') ? .90 : .05},

  {id:'everyone', cluster:'fame', text:'خیلی معروفه؟ اسمش رو تقریباً همه شنیدن؟',
   rule:t => ({4:.93, 3:.72, 2:.38, 1:.12})[t.__tier] ?? .45},

  /* ---- سؤال‌های تفکیک‌کننده که با تحلیل جفت‌های نزدیک اضافه شدند ---- */
  {id:'animal', cluster:'fict', text:'حیوونه؟',
   rule:t => has(t,'animal') ? .94 : .02},

  {id:'doctor', cluster:'prof', text:'پزشکه؟',
   rule:t => t.has('doctor') ? .93 : has(t,'scientist') ? .12 : .02},

  {id:'rich', cluster:'fame', text:'خیلی پولداره؟',
   rule:t => has(t,'rich','business') ? .90 : has(t,'worldfame') ? .45 : .18},

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

  {id:'game', cluster:'media', text:'شخصیتِ بازیِ کامپیوتریه؟',
   rule:t => t.has('game') ? .93 : has(t,'cartoon','anime') ? .15 : .02}
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

/* سؤال‌های داغ — دنیا و گروهِ کوچک؛ عمه فقط وقتی بو برده می‌پرسدشان. ← hot-questions.js */
const { HOT_QUESTIONS } = require('./hot-questions.js');
QUESTIONS.push(...HOT_QUESTIONS);

/* حرفِ اولِ اسم — فقط وقتی عمه داغ است (دروازه در موتور). ← letter-questions.js */
const { LETTER_QUESTIONS } = require('./letter-questions.js');
QUESTIONS.push(...LETTER_QUESTIONS);

module.exports = { QUESTIONS, KIN_OVERRIDE, KIN_CLUSTER_DEFAULT, FILM_OVERRIDE };
