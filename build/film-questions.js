/* ============================================================
   فیلم و انیمیشن — جوابِ بازی می‌تواند خودِ یک فیلم باشد، نه یک آدم.

   ردیفِ فیلم برچسبِ `film` دارد (و `fic` یا `m`/`f` ندارد). دو چیز لازم است:

   ۱) سؤال‌های فیلم (FILM_QUESTIONS): برای هر چیزی که فیلم نیست مقدارشان
      ثابت است، پس تا جرمِ احتمال روی فیلم‌ها جمع نشده پرسیده نمی‌شوند.
      تنها استثنا `is_film` است که خودش جداکننده است — مثل «آدمِ واقعیه؟».

   ۲) اورراید (FILM_OVERRIDE): سؤال‌های آدم‌محور («ریش داره؟»، «بازیگره؟»)
      برای فیلم بی‌معنا یا دوپهلو هستند. بدون اورراید، `rule` برای فیلم
      جوابِ «آدمِ معمولی» می‌ساخت و بازیکنی که «نه، فیلمه» می‌گفت فیلمِ
      درست را می‌کشت. جایی که جوابِ بازیکن قابل‌پیش‌بینی نیست، مقدار نزدیک
      ۰.۵ است (بی‌اثر)؛ جایی که روشن است («آدمِ واقعیه؟» ← نه) قاطع.
   ============================================================ */

const has = (t, ...tags) => tags.some(x => t.has(x));
const F = t => t.has('film');

/* [id, برچسب, متن] — برای غیرفیلم ثابتِ ۰.۰۳ */
const FILM_DEF = [
  ['f_action',   'action',     'پر از اکشن و تعقیب و گریز و انفجاره؟'],
  ['f_scifi',    'scifi',      'علمی‌تخیلیه؟ آینده و تکنولوژی و آدم‌فضایی؟'],
  ['f_true',     'truestory',  'از روی یه ماجرای واقعی ساختنش؟'],
  ['f_sequel',   'sequel',     'قسمت دوم و سوم هم داره؟'],
  ['f_sad',      'sadend',     'آخرش گریه‌ت می‌گیره؟'],
  ['f_crime',    'crime',      'درباره‌ی دزدی و جنایت و مافیاست؟'],
  ['f_war',      'warfilm',    'درباره‌ی جنگه؟'],
  ['f_music',    'musical',    'آهنگ‌هاش معروفه؟ توش آواز می‌خونن؟'],
  ['f_animals',  'animals',    'شخصیت‌های اصلیش حیوون‌ان؟'],
  ['f_femlead',  'femlead',    'قهرمانِ اصلیش یه زن یا دختره؟'],
  ['f_kidlead',  'kidlead',    'قهرمانش یه بچه یا نوجوونه؟'],
  ['f_superhero','superhero',  'فیلمِ ابرقهرمانیه؟'],
  ['f_pre2000',  'pre2000',    'قبل از سال ۲۰۰۰ ساخته شده؟ فیلمِ قدیمیه؟'],
  ['f_twist',    'twist',      'آخرش یه غافلگیریِ بزرگ داره که شاخ درمیاری؟'],
  ['f_sea',      'sea',        'تو دریا یا زیر آب یا روی کشتی می‌گذره؟'],
  ['f_school',   'school',     'تو مدرسه یا دانشگاه می‌گذره؟'],
  ['f_royal',    'royal',      'توش شاه و ملکه و شاهزاده و قصر داره؟'],
  ['f_sport',    'sport',      'درباره‌ی ورزش و مسابقه‌ست؟'],
  ['f_prison',   'prison',     'تو زندان می‌گذره یا درباره‌ی فراره؟'],
  ['f_mind',     'mindbend',   'درباره‌ی خواب و ذهن یا سفر در زمانه؟ مغزت سوت می‌کشه؟'],
  ['f_family',   'family',     'درباره‌ی دعوا و گرفتاری‌های یه خانواده‌ست؟'],
  ['f_village',  'village',    'تو روستا یا شهرستان می‌گذره؟'],
  ['f_road',     'road',       'قصه‌ش سفر و جاده‌ست؟'],
];

const FILM_QUESTIONS = [
  {id:'is_film', cluster:'film', text:'اسمِ یه فیلم یا انیمیشنه؟ یعنی خودِ فیلم، نه یه آدم؟',
   rule:t => F(t) ? .96 : .03},
  ...FILM_DEF.map(([id, tag, text]) => ({
    id, cluster:'film', text,
    rule:t => !F(t) ? .03 : t.has(tag) ? .91 : .06,
  })),
];

/* اورراید برای ردیف‌های فیلم — کلید id سؤال است. */
const FILM_OVERRIDE = {
  /* bio: یک فیلم جنسیت و سن ندارد. «مَرده؟» را بعضی درباره‌ی قهرمان جواب
     می‌دهند و بعضی «نه، فیلمه» — پس نزدیکِ خنثی ولی کمی رو به «نه». */
  male:.30, alive:.04, old_person:.08, married_fam:.08, child_star:.04, died_young:.03,
  teen: t => t.has('kidlead') ? .45 : .05,

  /* era: «خیلی قدیمیه؟» برای فیلمِ تاریخی (گلادیاتور) دوپهلوست */
  ancient: t => has(t,'ancient') ? .55 : .04,
  active:.25,

  /* prof: فیلم شغل ندارد */
  artist:.20, actor:.04, director:.05, singer: t => t.has('musical') ? .30 : .03,
  musician: t => t.has('musical') ? .30 : .03, athlete: t => t.has('sport') ? .30 : .03,
  footballer: t => t.has('sport') ? .15 : .02, writer:.06, poet:.03, scientist:.04,
  inventor:.04, ruler: t => t.has('royal') ? .35 : .03, religious: t => t.has('religious') ? .70 : .03,
  tvhost:.02, businessman:.03, techie:.03, doctor:.03, wrestler:.02, dancer: t => t.has('musical') ? .25 : .03,
  cop: t => t.has('cop') ? .45 : t.has('crime') ? .25 : .04,
  criminal: t => t.has('crime') ? .45 : .04,
  soldier: t => t.has('warfilm') ? .45 : .04,
  teacher: t => t.has('school') ? .20 : .03,

  /* media */
  tv:.40, cinema:.93, series:.05, stadium:.02, internet:.08, theater:.03,
  book_media: t => t.has('book') ? .60 : .08,
  game: t => t.has('game') ? .40 : .03,

  /* style */
  epic: t => has(t,'warfilm','epic') ? .55 : .06,
  pop:.10, traditional:.08, rich:.08,
  beloved: t => has(t,'beloved') ? .85 : .60,

  /* look: یک فیلم ریش و عینک ندارد */
  glasses:.06, beard:.06, mustache:.06, blond:.06, chubby:.06, bald:.05,

  /* fict */
  real: t => t.has('truestory') ? .18 : .06,
  cartoon_char: t => has(t,'cartoon','anime') ? .65 : .03,
  animal: t => t.has('animals') ? .50 : .03,
  superpower: t => has(t,'superhero','super') ? .60 : t.has('fantasy') ? .30 : .04,
  villain:.08, lead:.08,
  robot: t => t.has('robot') ? .60 : .03,
  monster: t => t.has('monster') ? .60 : .04,

  /* gear */
  masked: t => t.has('masked') ? .45 : .04, costume:.08,
  gun: t => has(t,'action','warfilm','crime') ? .35 : .05,
  sword: t => t.has('sword') ? .45 : .04, weirdhair:.03,

  /* work: این‌ها مالِ بازی و سریال‌اند */
  playable:.02, mobile_game:.02, online_game:.02, fighting:.03, shooter:.02,
  openworld:.02, retro:.03, longrun:.03, sitcom:.03,
  stream: t => t.has('stream') ? .85 : .05,

  /* fam — rule برای غیرفامیل ثابت است؛ فقط «از نزدیک دیدیش؟» */
  fam_close:.04,
};

module.exports = { FILM_QUESTIONS, FILM_OVERRIDE };
