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
  'ثور':'ancient,mythic,epic', 'کاپیتان آمریکا':'war,serious',
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
  'مولانا':'writer,religious,epic', 'حافظ':'glasses',
  'زکریای رازی':'doctor', 'ابن سینا':'doctor',
  'لویی پاستور':'doctor', 'الکساندر فلمینگ':'doctor',
  'مجید سمیعی':'doctor', 'زیگموند فروید':'doctor',
  'لئو تولستوی':'elder,religious', 'داستایوفسکی':'serious,war',
  'اسکندر مقدونی':'young,diedyoung', 'ژولیوس سزار':'writer,bald',
  'مهاتما گاندی':'bald,celibate', 'گالیله':'elder',
  // موسیقی و ورزش
  'داریوش اقبالی':'serious', 'ابی':'beloved',
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
for (const f of ['./extra-hot-people.js', './extra-hot-fiction.js', './extra-pairs.js']) {
  try { EXTRA_BLOCKS.push(require(f)); }
  catch (e) { if (!/Cannot find module/.test(e.message)) throw e; }
}

const EXTRA = {};
for (const block of EXTRA_BLOCKS)
  for (const [name, tags] of Object.entries(block))
    EXTRA[name] = EXTRA[name] ? EXTRA[name] + ',' + tags : tags;

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
  const add = EXTRA[p[0].trim()];
  if (!add) return line;
  // ردیف ناقص را دست‌نخورده رد می‌کنیم؛ generate.js خودش گزارشش می‌دهد
  if (p.length !== 4) { console.log(`  (رد شد، ستون کم دارد) ${p[0].trim()}`); return line; }
  // EXTRA مالِ شخصیت‌هاست؛ فیلمِ هم‌نام («شرک») نباید lead و monster بگیرد
  if (p[3].split(',').map(s => s.trim()).includes('film')) return line;
  unused.delete(p[0].trim());
  patched++;
  const have = new Set(p[3].split(',').map(s => s.trim()));
  add.split(',').forEach(t => have.add(t.trim()));
  p[3] = [...have].join(',');
  return p.join('|');
});
console.log(`(${patched} شخصیت برچسب تکمیلی گرفت)`);
if (unused.size) console.log('  نام‌های پیدانشده در EXTRA:', [...unused].join('، '));

module.exports = { CHARS };

