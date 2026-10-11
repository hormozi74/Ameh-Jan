/* ترکیب همه‌ی دسته‌ها + حذف ردیف‌های ناقص */
const files = [
  './chars-01-cinema.js',
  './chars-02-music.js',
  './chars-03-sport.js',
  './chars-04-culture.js',
  './chars-05-world-cinema.js',
  './chars-06-world-music-sport.js',
  './chars-07-world-science.js',
  './chars-08-fiction.js',
  './chars-09-extra.js',
  './chars-09-family.js',
  './chars-10-game-west.js',
  './chars-11-game-east.js',
  './chars-12-series-world.js',
  './chars-13-movie-world.js',
  './chars-14-screen-ir.js',
  './chars-15-comic-toon.js',
  './chars-16-film-ir.js',
  './chars-17-film-world.js',
  './chars-18-animation.js',
  './chars-19-people-ir.js',
  './chars-20-people-world.js',
  './chars-21-fiction-more.js',
  // ۱۱ اکتبر ۲۰۲۶ — چهار دسته‌ی هزارتایی
  './chars-22-people-ir.js',
  './chars-23-fiction.js',
  './chars-24-people-world.js',
  './chars-25-toon-film-game.js',
];

/* برچسب‌های تکمیلی — از روی گزارش «جفت‌های تفکیک‌ناپذیر» نوشته شده‌اند.
   هر خط یعنی: این دو نفر واقعاً فرق دارند و بازی باید بتواند بپرسدش.

   چند بلوک پشت سر هم می‌آیند و **یک نام در چند بلوک تکرار می‌شود**. با یک
   شیء واحد، بلوکِ بعدی بی‌صدا قبلی را پاک می‌کرد (سیندرلا برچسب `blond`
   را از دست داد و با سفیدبرفی یکی شد). پس هر بلوک جداست و merge می‌شوند. */
const EXTRA_BLOCKS = [];
EXTRA_BLOCKS.push({
  // ابرقهرمان‌ها و شخصیت‌های داستانی
  'بتمن':'rich,serious', 'آیرون‌من':'rich,business,techie',
  'ثور':'mythic,epic', 'کاپیتان آمریکا':'war,serious',
  'سیندرلا':'blond', 'دراکولا':'ancient,old', 'دامبلدور':'glasses',
  'ولدمورت':'bald,serious', 'یودا':'animal,super',
  // حیوان‌ها — یکی از پرارزش‌ترین سؤال‌های تفکیک‌کننده
  'تام و جری':'animal', 'هاچ زنبور عسل':'animal', 'پسر شجاع':'animal',
  'شیپورچی':'animal', 'خرس مهربان':'animal', 'آقای گرگه':'animal,villain',
  'کونگ‌فو پاندا':'animal,chubby', 'سونیک':'animal', 'پیکاچو':'animal',
  'دورامون':'animal', 'نمو':'animal', 'شیرشاه':'animal,epic',
  'باگز بانی':'animal', 'دونالد داک':'animal', 'میکی موس':'animal',
  'گوفی':'animal', 'اسکوبی دو':'animal', 'خاله سوسکه':'animal',
  'شنگول و منگول':'animal', 'بزبز قندی':'animal', 'توتورو':'animal',
  'سیمرغ':'animal', 'بل و سباستین':'animal', 'دهکده‌ی حیوانات':'animal',
  'کپل':'animal', 'مدرسه موش‌ها':'animal', 'میتی کومان':'athlete',
  // بازیگران
  'برد پیت':'elder,rich', 'لئوناردو دی‌کاپریو':'rich,love',
  'تام کروز':'elder,rich', 'وین دیزل':'bald,chubby',
  'جوکین فینیکس':'serious,villain', 'رابرت داونی جونیور':'hero,rich',
  'آنجلینا جولی':'hero,controversial', 'رابرت دنیرو':'comedy,elder',
  'آل پاچینو':'serious', 'دواین جانسون':'bald,rich,chubby',
  'پژمان جمشیدی':'athlete,footballer', 'امین حیایی':'singer',
  'مهران غفوریان':'elder', 'بهرام افشاری':'newgen,beard',
  // شعر و ادب و علم
  'مولانا':'writer,religious,epic',
  'زکریای رازی':'doctor', 'ابن سینا':'doctor',
  'لویی پاستور':'doctor', 'الکساندر فلمینگ':'doctor',
  'مجید سمیعی':'doctor', 'زیگموند فروید':'doctor',
  'لئو تولستوی':'elder,religious', 'داستایوفسکی':'serious,war',
  'اسکندر مقدونی':'young,diedyoung', 'ژولیوس سزار':'writer,bald',
  'مهاتما گاندی':'bald,celibate', 'گالیله':'elder',
  // موسیقی و ورزش
  'داریوش اقبالی':'serious', 'ابی|خواننده':'beloved',
  'محسن یگانه':'beard,glasses', 'احسان خواجه‌امیری':'beloved',
  'مهدی طارمی':'beard,mustache', 'سردار آزمون':'internet',
  'سندباد':'young,epic', 'بچه‌های کوه آلپ':'blond,love',
  'جف بزوس':'bald,rich', 'ایلان ماسک':'rich', 'بیل گیتس':'rich,glasses',
  'استیو جابز':'rich', 'وارن بافت':'rich,elder', 'کیم کارداشیان':'rich',
  'کریستیانو رونالدو':'rich', 'لیونل مسی':'rich,beard',

  /* ---- دور دوم: جفت‌هایی که گزارش «مشهور ولی حذف‌شده» لو داد ---- */
  'زین‌الدین زیدان':'bald,serious',        // از دل‌پیرو و توتی جدا می‌شود
  'الساندرو دل‌پیرو':'beloved,award',
  'فرانچسکو توتی':'beloved,comedy',
  'تیری هانری':'tv,rich',                  // حالا کارشناس تلویزیون است
  'جانلوییجی بوفون':'elder,award',
  'بهمن قبادی':'beard,controversial',
  'اصغر فرهادی':'glasses,serious',
  'رضا بهرام':'serious,love',
  'امیرعباس گلاب':'beloved,traditional',
  'بهنام بانی':'beloved,blond',
  'علیرضا طلیسچی':'beard,beloved',
  'میثم ابراهیمی':'beloved,comedy',
  'سینا شعبانخانی':'love,serious',
  'شهره':'controversial,blond',
  'عهدیه':'traditional,beloved',
  'مایکل جردن':'bald,rich,legend',
  'کارل لوئیس':'serious,award',
  'مهناز افشار':'controversial,blond',
  'آناهیتا نعمتی':'beloved,serious',
  'لوفی':'comedy,chubby',
  'تانجیرو':'beloved,serious',
  'میلاد عبادی‌پور':'beloved,active',
  'جواد فروغی':'glasses,serious',
  'یوسف کرمی':'beard,epic',
  'شهرام محمودی':'beloved,blond',
  'غلامرضا محمدی':'elder,serious',
});

EXTRA_BLOCKS.push({
  /* ---- دور سوم: برچسب‌های تازه‌ی دنیای خیالی (lead/villain/sword/…) ----
     شخصیت‌های chars-08 پیش از این سؤال‌ها نوشته شده بودند و بدون این پَچ،
     صدها شخصیتِ تازه‌ی بازی و سریال روی آن‌ها می‌افتادند: «شمشیر داره؟»
     برای گندالف و کریتوس هر دو باید «آره» بدهد، وگرنه سؤال بی‌اثر است. */
  'کلاه‌قرمزی':'lead', 'پهلوان پنبه':'lead', 'حسن کچل':'lead,bald',
  'امیرارسلان نامدار':'lead,sword', 'سمک عیار':'lead,sword',
  'خاله سوسکه':'animal,lead', 'مجید':'lead,teen', 'دیو سفید':'monster',
  'کاپیتان سوباسا':'lead', 'هاچ زنبور عسل':'lead', 'سندباد':'lead,sword',
  'هایدی':'lead', 'پسر شجاع':'lead,hero', 'آقای گرگه':'villain',
  'میتی کومان':'lead', 'آنشرلی':'lead', 'پینوکیو':'lead',
  'دورامون':'robot,lead', 'ناروتو':'lead,teen,sword',
  'گوکو':'lead,fighting', 'لوفی':'lead,teen,fighting', 'پیکاچو':'lead,playable',
  'کونان':'lead,teen,cop', 'شین‌چان':'lead', 'سایلر مون':'lead,costume',
  'باب اسفنجی':'lead', 'هومر سیمپسون':'lead,bald',
  'شرک':'lead,monster,fantasy', 'سفیدبرفی':'lead', 'سیندرلا':'lead',
  'زیبای خفته':'lead', 'السا':'lead', 'شیرشاه':'lead',
  'علاءالدین':'lead,fantasy', 'غول چراغ جادو':'monster,fantasy',
  'رابین هود':'lead,sword', 'زورو':'lead,masked,sword,costume',
  'تارزان':'lead', 'شرلوک هلمز':'lead,cop', 'هرکول پوآرو':'lead,cop',
  'دون کیشوت':'lead,sword', 'رابینسون کروزوئه':'lead', 'گالیور':'lead',
  'آلیس':'lead,fantasy', 'پیتر پن':'lead,fantasy',
  'هری پاتر':'lead,teen,fantasy', 'دامبلدور':'fantasy',
  'ولدمورت':'villain,fantasy', 'گندالف':'fantasy,sword', 'فرودو':'lead,fantasy',
  'سوپرمن':'lead,costume', 'بتمن':'lead,costume,masked',
  'مرد عنکبوتی':'lead,costume,masked,teen', 'آیرون‌من':'lead,costume',
  'هالک':'lead,monster', 'کاپیتان آمریکا':'costume,soldier,war',
  'ثور':'costume,fantasy', 'واندروومن':'lead,costume,sword',
  'جوکر':'criminal,weirdhair', 'ثانوس':'space,monster',
  'دارث ویدر':'villain,masked,costume,space,sword',
  'یودا':'space,sword,fantasy', 'ای‌تی':'space,lead',
  'گودزیلا':'monster,horror', 'کینگ کونگ':'monster',
  'فرانکنشتاین':'monster,horror', 'دراکولا':'monster,horror',
  'ماریو':'lead,playable,retro,costume', 'سونیک':'lead,playable,retro',
  'لارا کرافت':'lead,playable,gun,openworld', 'بابانوئل':'costume',
  'وودی':'lead,costume', 'نمو':'lead', 'کونگ‌فو پاندا':'lead,fighting',
  'شازده کوچولو':'lead,space', 'شنل قرمزی':'lead',
  'ددپول':'lead,masked,costume,gun,sword', 'وولورین':'lead,costume,sword',
  'فلش':'lead,costume,masked', 'آکوامن':'lead,costume',
  'بلک پنتر':'lead,masked,costume', 'لوکی':'fantasy,space',
  'هارلی کویین':'criminal,weirdhair,costume', 'ال':'cop',
  'ارن یگر':'lead,teen,apoc,sword,monster', 'وجیتا':'fighting,costume',
  'تانجیرو':'lead,teen,sword', 'موآنا':'lead', 'راپونزل':'lead',
  'پری دریایی':'lead', 'مولان':'lead,sword,soldier',
  'استیچ':'space,monster,lead', 'باز لایتیر':'space,costume',
  'کریتوس':'lead,playable,sword,openworld',
  'لینک':'lead,playable,sword,fantasy', 'پک‌من':'lead,playable,retro',
  'انگری بردز':'mobile', 'کراش باندیکوت':'lead,playable',
  'مدرسه موش‌ها':'lead', 'بزبز قندی':'lead', 'شنگول و منگول':'lead',
  'جناب خان':'lead', 'شخصیت مینیون‌ها':'lead',
  // جفتِ تفکیک‌ناپذیرِ گزارش‌شده توسط generate — هر دو ریش‌دارِ جدیِ حماسیِ سریالی بودند
  'ند استارک':'lead,elder', 'خال دروگو':'king,love',
});

/* برچسب‌های داغ (fr_*) برای ردیف‌های قدیمی — ← hot-questions.js */
for (const f of ['./extra-hot-people.js', './extra-hot-fiction.js', './extra-pairs.js',
                 './extra-22-people-ir.js', './extra-23-fiction.js', './extra-24-people-world.js', './extra-25-toon-film-game.js']) {
  try { EXTRA_BLOCKS.push(require(f)); }
  catch (e) { if (!/Cannot find module/.test(e.message)) throw e; }
}


/* بازبینیِ ۵ اکتبر ۲۰۲۶ — رده‌۴‌ها از دیدِ بازیکنِ واقعی (build/lab/human-test.js):
   برچسبی که بازیکن قطعاً «آره» می‌گوید ولی در ردیف نبود. */
EXTRA_BLOCKS.push({
  'باب اسفنجی':'animal,series,longrun,costume',
  'کلاه‌قرمزی':'series,longrun,d60,legend',
  'محمدرضا شجریان':'prerev,d60,serious,controversial,beard',
  'مهران مدیری':'tvhost,rich,cinema',
  'مستر بین':'cinema',
  'گوگوش':'childstar,tv,cinema,active',
  'آرنولد شوارتزنگر':'elder,rich,business',
  'سیلوستر استالونه':'elder,rich',
  'جانی دپ':'elder,rich,musician',
  'بیل گیتس':'elder',
  'توماس ادیسون':'old,prerev',
  'والتر وایت':'longrun,serious',
  'علی دایی':'business,tvhost',
  'جیم کری':'tv',
  'هری پاتر':'costume,series',
  'پیکاچو':'series,tv',
  'شرک':'series',
  'جوکر':'gun',
  'هومر سیمپسون':'series,longrun,sitcom,bald,lead,kids',
  'تام هنکس':'elder,comedy,hero,tv',
});

/* پاسِ برچسب روی chars-05-world-cinema (۵ اکتبر ۲۰۲۶): خوشه‌ی بازیگرانِ هالیوود با
   برچسب‌های یکسان تفکیک‌ناپذیر بود — ظاهر، دوره، و دنیایِ معروفِ هر کدام (fr_*) اضافه شد. */
EXTRA_BLOCKS.push({
  'جکی چان':'elder,active', 'سیلوستر استالونه':'serious', 'تام کروز':'rich,controversial',
  'مورگان فریمن':'beard,fr_dc', 'جانی دپ':'mustache', 'کیانو ریوز':'serious',
  'ویل اسمیت':'rich,tv,series', 'جیم کری':'elder', 'ادی مورفی':'fr_shrek,fr_dreamworks,elder',
  'کلینت ایستوود':'serious,fr_oscar', 'مارلون براندو':'fr_godfather,fr_oscar,chubby,controversial',
  'شون کانری':'fr_bond,bald,beard,fr_oscar', 'دنیل کریگ':'fr_bond', 'آنتونی هاپکینز':'fr_oscar,villain',
  'گری اولدمن':'fr_hp,fr_dc,fr_oscar,elder', 'هیث لجر':'fr_dc,fr_oscar', 'جوکین فینیکس':'fr_dc,fr_oscar',
  'کریستین بیل':'fr_dc,fr_oscar,serious', 'ریان گاسلینگ':'love', 'مت دیمون':'hero',
  'جورج کلونی':'fr_dc,fr_oscar,rich,beloved', 'مریل استریپ':'fr_oscar', 'جولیا رابرتز':'love,beloved',
  'آنجلینا جولی':'fr_disney,rich', 'اسکارلت جوهانسون':'rich', 'جنیفر لارنس':'fr_oscar',
  'اما واتسون':'fr_disney', 'نیکول کیدمن':'fr_oscar', 'کیت وینسلت':'love', 'شارلیز ترون':'fr_fast,fr_oscar',
  'ناتالی پورتمن':'fr_starwars,fr_marvel,fr_oscar', 'سندرا بولاک':'fr_oscar,comedy',
  'کریستوفر نولان':'fr_dc,rich', 'کوئنتین تارانتینو':'fr_oscar', 'مارتین اسکورسیزی':'fr_oscar,serious',
  'فرانسیس فورد کاپولا':'fr_godfather,fr_oscar', 'آلفرد هیچکاک':'horror,serious,bald',
  'استنلی کوبریک':'horror,fr_oscar', 'جیمز کامرون':'fr_oscar,rich,elder', 'پیتر جکسون':'fr_lotr,fr_oscar,chubby,glasses',
  'جورج لوکاس':'fr_starwars,rich,elder', 'ریدلی اسکات':'serious', 'هایائو میازاکی':'fr_ghibli',
  'شاهرخ خان':'love,rich,dancer', 'آمیتاب باچان':'beard,tvhost', 'هریسون فورد':'fr_starwars',
  'جت لی':'fr_fight', 'راسل کرو':'fr_oscar,epic,chubby', 'هیو جکمن':'singer', 'کریس همسورث':'fr_marvel',
  'کریس ایوانز':'fr_marvel', 'بندیکت کامبربچ':'fr_sherlock,fr_marvel', 'دنزل واشنگتن':'fr_oscar',
  'ساموئل ال جکسون':'fr_marvel,fr_starwars,bald', 'کوین اسپیسی':'fr_oscar',
  'رابین ویلیامز':'fr_oscar,fr_disney,fr_1001,elder', 'وین دیزل':'fr_fast,fr_marvel', 'جیسون استاتهام':'fr_fast,bald,beard',
  'کیت بلانشت':'fr_lotr,fr_marvel,fr_oscar', 'مونیکا بلوچی':'fr_matrix,fr_bond', 'تیموتی شالامه':'young',
  'زندیا':'fr_marvel', 'میلی بابی براون':'fr_stranger', 'تام هاردی':'fr_dc,fr_marvel,fr_peaky',
  'ایدریس البا':'fr_marvel', 'برایان کرنستون':'fr_bb', 'کیلین مرفی':'fr_peaky,fr_dc,fr_oscar',
  'پدرو پاسکال':'fr_got,fr_tlou,fr_starwars', 'رابرت پتینسون':'fr_hp,fr_dc', 'آن هاتاوی':'fr_dc,fr_oscar',
  'گل گدوت':'fr_dc,fr_fast', 'گییرمو دل تورو':'fr_oscar',
});

/* پاسِ برچسب روی chars-08-fiction (۵ اکتبر ۲۰۲۶): ردیف‌های قدیمیِ ۸ برچسبی —
   چیزهایی که بازیکن قطعاً درباره‌ی این شخصیت‌ها می‌داند. */
EXTRA_BLOCKS.push({
  'سیمپسون‌ها':'series,longrun,sitcom,lead,kids,chubby', 'باگز بانی':'animal,fr_looney,lead,retro',
  'اسکوبی دو':'animal,lead,fr_looney,longrun,retro', 'دونالد داک':'animal,fr_disney,costume,retro',
  'میکی موس':'fr_disney,lead,retro,costume', 'تام و جری':'lead,fr_looney,retro,longrun',
  'دورامون':'lead,robot,longrun,comedy,kids', 'کونان':'cop,lead,teen,longrun,series,fr_kidtv',
  'سونیک':'game,playable,fr_sonic,animal,costume,lead', 'ماریو':'fr_mario',
  'آنا':'lead,fr_frozen,fr_disney,femlead,teen', 'السا':'fr_frozen,fr_disney',
  'دیو و دلبر':'fr_disney,lead,royal,musical', 'زیبای خفته':'fr_disney,lead,royal',
  'شیرشاه':'fr_lionking,fr_disney,lead,royal,animal', 'نمو':'fr_disney,lead,sea',
  'کونگ‌فو پاندا':'fr_kungfu,fr_dreamworks,lead,animal,fighting', 'استیچ':'fr_disney,space,lead',
  'باز لایتیر':'fr_toystory,fr_disney,lead,costume,robot,space', 'وودی':'lead,fr_toystory,fr_disney',
  'موآنا':'lead,fr_disney,sea,fantasy', 'راپونزل':'lead,fr_disney,royal,fantasy', 'پری دریایی':'lead,fr_disney,sea,royal',
  'مولان':'lead,fr_disney,sword,soldier', 'شخصیت مینیون‌ها':'fr_minions,lead',
  'هالک':'fr_marvel,costume,lead,chubby', 'کاپیتان آمریکا':'fr_marvel,costume,lead,soldier,gun',
  'ثور':'fr_marvel,sword,costume,lead', 'آیرون‌من':'fr_marvel,costume,masked,lead,robot',
  'واندروومن':'fr_dc,costume,lead,sword', 'ددپول':'fr_marvel,costume,masked,lead,sword,gun',
  'وولورین':'fr_marvel,costume,lead,sword', 'فلش':'fr_dc,costume,masked,lead', 'آکوامن':'fr_dc,costume,lead,sea',
  'بلک پنتر':'fr_marvel,costume,masked,lead,king', 'لوکی':'fr_marvel,costume,sword,villain',
  'هارلی کویین':'fr_dc,costume,weirdhair,criminal', 'دارث ویدر':'fr_starwars,masked,costume,sword,space,lead',
  'یودا':'fr_starwars,sword,space,teacher', 'ای‌تی':'space,lead,kidlead', 'گودزیلا':'monster,sea,horror,retro',
  'کینگ کونگ':'monster,animal,retro,horror,fr_jurassic', 'فرانکنشتاین':'monster,horror,retro,scientist',
  'دراکولا':'horror,costume,masked', 'ولدمورت':'fr_hp,sword,super,lead', 'دامبلدور':'fr_hp,teacher,lead',
  'گندالف':'fr_lotr,sword,teacher', 'ال':'fr_deathnote,glasses,cop,lead,fr_deathnote,teen',
  'ارن یگر':'fr_aot,monster,soldier,lead,teen', 'وجیتا':'fr_dbz,fighting,lead,blond,weirdhair,costume',
  'تانجیرو':'fr_demonslayer,sword,lead,teen,costume', 'لوفی':'fr_onepiece,sea,sword,lead,teen,costume,weirdhair',
  'گوکو':'fr_dbz,fighting,lead,weirdhair,costume,sword', 'ناروتو':'fr_naruto,fighting,lead,teen,costume,sword',
  'پیکاچو':'fr_pokemon,lead', 'کریتوس':'fr_gow,gun,lead,costume', 'لینک':'fr_zelda,sword,lead,costume,fantasy,playable',
  'پک‌من':'costume,retro,playable', 'انگری بردز':'fr_clash,mobile,lead,costume,animal',
  'کراش باندیکوت':'fr_crash,lead,animal,costume,retro,playable',
  'زورو':'masked,costume,sword,lead,criminal', 'رابین هود':'sword,criminal,costume,lead,epic',
  'تارزان':'lead,animal,costume,beard', 'هرکول پوآرو':'cop,lead,costume,glasses',
  'دون کیشوت':'sword,lead,costume,comedy', 'پیتر پن':'lead,costume,teen,kidlead,fantasy',
  'آلیس':'lead,costume,fantasy,teen,kidlead,fr_disney', 'شنل قرمزی':'lead,costume,kidlead,animal,fantasy',
  'مرد عنکبوتی':'fr_marvel,masked,costume,lead,teen',
});

/* بازبینیِ ۱۱ اکتبر ۲۰۲۶ — باخت‌های تستِ انسانی بعد از افزودنِ ۴ هزار ردیف */
EXTRA_BLOCKS.push({
  'ابی|لست':'series,stream,lead',   // فصلِ دومِ سریالِ HBO؛ بازیکن «تو سریال دیدیش؟ آره» می‌گوید
});

const EXTRA = {}, EXTRA_KEYED = {};
for (const block of EXTRA_BLOCKS)
  for (const [key, tags] of Object.entries(block)) {
    const [name, hint] = key.split('|');
    if (hint) (EXTRA_KEYED[name] = EXTRA_KEYED[name] || []).push({ hint, tags });
    else EXTRA[name] = EXTRA[name] ? EXTRA[name] + ',' + tags : tags;
  }

let CHARS = [];
for (const f of files) {
  try { CHARS = CHARS.concat(require(f)); }
  catch (e) { if (!/Cannot find module/.test(e.message)) throw e; }
}

// ردیف‌هایی که توضیحشان «—» است یا نام‌شان جمله است، پر کننده‌اند و به بازی ضرر می‌زنند
const before = CHARS.length;
CHARS = CHARS.filter(line => {
  const [name, hint, , tags = ''] = line.split('|');
  if (!hint || hint.trim() === '—') return false;
  // نامِ جمله‌ای فقط وقتی پرکننده است که برچسبِ کافی هم ندارد — «ابد و یک روز»
  // و «سفیدبرفی و هفت کوتوله» اسمِ واقعیِ فیلم‌اند، نه ردیفِ خراب
  if (/ و /.test(name) && name.split(' ').length > 3 && tags.split(',').length < 7) return false;
  return true;
});
if (before !== CHARS.length) console.log(`(${before - CHARS.length} ردیف پرکننده حذف شد)`);

// اعمال برچسب‌های تکمیلی
let patched = 0;
const unused = new Set(Object.keys(EXTRA));
CHARS = CHARS.map(line => {
  const p = line.split('|');
  /* کلیدِ `نام|تکه‌ای از توضیح` فقط به ردیفی می‌خورد که توضیحش آن تکه را دارد —
     برای هم‌نام‌های واقعاً متفاوت: «ابی» هم خواننده‌ی پاپ است هم شخصیتِ لست آو آس،
     و با کلیدِ ساده هر دو `fr_la` و `fr_tlou` می‌گرفتند. */
  const name = p[0].trim(), hint = (p[1] || '').trim();
  let add = EXTRA[name];
  for (const k of EXTRA_KEYED[name] || []) if (hint.includes(k.hint)) add = add ? add + ',' + k.tags : k.tags;
  if (!add) return line;
  // ردیف ناقص را دست‌نخورده رد می‌کنیم؛ generate.js خودش گزارشش می‌دهد
  if (p.length !== 4) { console.log(`  (رد شد، ستون کم دارد) ${p[0].trim()}`); return line; }
  // EXTRA مالِ شخصیت‌هاست؛ فیلمِ هم‌نام («شرک») نباید lead و monster بگیرد
  if (p[3].split(',').map(s => s.trim()).includes('film')) return line;
  unused.delete(name);
  patched++;
  const have = new Set(p[3].split(',').map(s => s.trim()));
  add.split(',').forEach(t => have.add(t.trim()));
  p[3] = [...have].join(',');
  return p.join('|');
});
console.log(`(${patched} شخصیت برچسب تکمیلی گرفت)`);
if (unused.size) console.log('  نام‌های پیدانشده در EXTRA:', [...unused].join('، '));

module.exports = { CHARS };

