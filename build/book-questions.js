/* ============================================================
   کتاب — جوابِ بازی می‌تواند خودِ یک کتاب باشد («شاهنامه»، «کیمیاگر»،
   «صد سال تنهایی»)، نه نویسنده‌اش و نه یکی از شخصیت‌هایش.

   ردیفِ کتاب برچسبِ `bookw` دارد (و `fic` یا `m`/`f` ندارد) — همان الگوی
   ردیفِ فیلم در film-questions.js:

   ۱) سؤال‌های کتاب (BOOK_QUESTIONS): برای هر چیزی که کتاب نیست ثابت‌اند،
      پس تا جرمِ احتمال روی کتاب‌ها جمع نشده پرسیده نمی‌شوند (دروازه‌ی
      bookMass در موتور). تنها استثنا `is_book` است که خودش جداکننده است.
      سؤال‌های f_* فیلم (غم‌انگیز، جنایی، شخصیتِ اصلیِ زن، …) برای کتاب هم
      پرسیده می‌شوند — film-questions.js کتاب را هم «اثر» می‌داند.

   ۲) اورراید (BOOK_OVERRIDE): سؤال‌های آدم‌محور برای کتاب بی‌معنا یا
      دوپهلو هستند. جایی که بازیکن قابل‌پیش‌بینی نیست، نزدیکِ ۰.۵؛ جایی
      که روشن است («آدمِ واقعیه؟» ← نه) قاطع.

   هم‌نام‌ها: «هری پاتر» هم شخصیت است هم کتاب هم فیلم؛ «شازده کوچولو» هم
   شخصیت هم کتاب هم انیمیشن. بازیکنی که به «هری پاتر» فکر می‌کند معمولاً
   خودش هم نمی‌داند کدام‌یک — و هر کدام را که عمه حدس بزند قبول می‌کند.
   پس generate.js برای کتابی که شخصیتِ هم‌نام دارد، سؤال‌های آدم‌محور را
   به سمتِ همان شخصیت می‌بَرد (مَرده؟ عینک داره؟ جادو داره؟)، و شخصیتِ
   هم‌نام برچسبِ `eponym` می‌گیرد تا «خودِ کتابه؟» برایش قاطعانه «نه» نباشد.
   ============================================================ */

const has = (t, ...tags) => tags.some(x => t.has(x));
const B = t => t.has('bookw');
const SCREENED = t => has(t, 'cinema', 'series', 'cartoon', 'anime');

/* [id, برچسب, متن] — برای غیرکتاب ثابتِ ۰.۰۳ */
const BOOK_DEF = [
  ['b_poetry',   'poetry',       'کتابِ شعره؟ مثلِ دیوان یا منظومه؟'],
  ['b_novel',    'novel',        'رمانه؟ یعنی یه داستانِ بلند؟'],
  ['b_stories',  'shortstories', 'مجموعه‌ی داستانِ کوتاه یا حکایته؟'],
  ['b_play',     'play',         'نمایشنامه‌ست؟'],
  ['b_kids',     'kidsbook',     'کتابِ بچه‌ها یا نوجوون‌هاست؟'],
  ['b_series',   'bookseries',   'چند جلدیه؟ یعنی یه مجموعه‌ی چندکتابیه؟'],
  ['b_nonfic',   'nonfic',       'داستان نیست؟ مثلاً روانشناسی، تاریخ، فلسفه یا علمی؟'],
  ['b_selfhelp', 'selfhelp',     'کتابِ موفقیت و خودیاریه؟ مثلِ «عادت‌های اتمی» یا «بیشعوری»؟'],
  ['b_classic',  'classic',      'کلاسیکه؟ یعنی بیشتر از صد سال ازش گذشته؟'],
  ['b_school',   'schoolread',   'تو کتاب‌های درسیِ مدرسه چیزی ازش خوندیم؟'],
  ['b_femauthor','femauthor',    'نویسنده یا شاعرش زنه؟'],
  ['b_comic',    'comicbook',    'کتابِ مصوّره؟ کمیک یا مانگا؟'],
];

const BOOK_QUESTIONS = [
  {id:'is_book', cluster:'book', text:'جوابت خودِ یه کتابه؟ نه نویسنده‌ش یا یکی از شخصیت‌هاش؟',
   /* فیلمِ اقتباسی و شخصیتِ هم‌نامِ کتاب: بازیکنی که به «هری پاتر» فکر می‌کند گاهی «آره» می‌گوید */
   rule:t => B(t) ? .95 : (t.has('film') && t.has('book')) ? .18 : t.has('eponym') ? .18 : .03},
  {id:'b_filmed', cluster:'book', text:'ازش فیلم، سریال یا انیمیشن ساختن؟',
   /* بازیکنِ ایرانی اقتباسِ روسی یا قدیمی را اغلب نمی‌شناسد؛ «نه»اش نباید کتابِ درست را بکُشد */
   rule:t => !B(t) ? .03 : SCREENED(t) ? .82 : t.__tier >= 3 ? .25 : .08},
  ...BOOK_DEF.map(([id, tag, text]) => ({
    id, cluster:'book', text,
    rule:t => !B(t) ? .03 : t.has(tag) ? .91 : .06,
  })),
];

/* اورراید برای ردیف‌های کتاب — کلید id سؤال است. */
const BOOK_OVERRIDE = {
  /* bio: کتاب جنسیت و سن ندارد؛ بعضی درباره‌ی قهرمانش جواب می‌دهند */
  male: t => t.has('femlead') ? .18 : .35, alive:.04, old_person:.08, married_fam:.08,
  child_star:.03, died_young:.03,
  teen: t => t.has('kidlead') ? .40 : .05,

  /* era: «مالِ صدها سال پیشه؟» برای شاهنامه روشن است */
  ancient: t => t.has('ancient') ? .88 : t.has('classic') ? .45 : .04,
  active: t => t.has('newgen') ? .35 : .12,

  /* prof: کتاب شغل ندارد — ولی «نویسنده‌ست؟» و «شاعره؟» را بعضی برای کتاب هم آره می‌گویند */
  artist:.18, actor:.03, director:.03, singer:.03, musician:.03, athlete:.03,
  footballer:.02, wrestler:.02, dancer:.02, tvhost:.02, techie:.03, doctor:.03, inventor:.03,
  writer:.25, poet: t => t.has('poetry') ? .35 : .03,
  scientist: t => t.has('nonfic') ? .15 : .03,
  ruler: t => t.has('royal') ? .25 : .03,
  /* «شخصیتِ مذهبیه؟» برای کتابِ دینی (قرآن، مفاتیح) آره است؛ برای رمانی با مضمونِ ایمان دوپهلو */
  religious: t => !t.has('religious') ? .03 : t.has('nonfic') || t.has('poetry') ? .75 : .35,
  businessman: t => t.has('selfhelp') ? .10 : .03,
  cop: t => t.has('crime') ? .25 : .04, criminal: t => t.has('crime') ? .30 : .04,
  soldier: t => t.has('warfilm') ? .30 : .04, teacher:.04,

  /* media */
  tv: t => t.has('series') ? .30 : .06, cinema: t => t.has('cinema') ? .35 : .04,
  series: t => t.has('series') ? .35 : .04, cartoon_media: t => has(t,'cartoon','anime') ? .45 : .03,
  book_media:.97, stadium:.02, theater: t => t.has('play') ? .70 : .04,
  internet: t => t.has('newgen') ? .35 : .06,
  kids: t => has(t,'kidsbook','kids') ? .88 : .10,
  game: t => t.has('game') ? .40 : .03,
  /* سه سؤالِ «واقعیتِ اثر» برای کتاب روشن‌اند */
  multi_media: t => SCREENED(t) && t.has('game') ? .85 : .06,
  from_book: t => SCREENED(t) || t.has('game') ? .85 : .10,
  single_media: t => SCREENED(t) || t.has('game') ? .10 : .70,

  /* style */
  epic: t => has(t,'epic','warfilm') ? .70 : .05,
  pop:.05, traditional: t => has(t,'traditional','classical') ? .70 : .06, rich:.05,
  beloved: t => t.has('beloved') ? .85 : .60,

  /* look: کتاب ریش و عینک ندارد */
  glasses:.05, beard:.05, mustache:.05, blond:.05, chubby:.05, bald:.04,

  /* fict */
  real: t => t.has('nonfic') ? .25 : t.has('truestory') ? .15 : .06,
  cartoon_char: t => t.has('comicbook') ? .40 : .03, puppet:.02,
  animal: t => t.has('animals') ? .45 : .03,
  superpower: t => has(t,'super','fantasy') ? .35 : t.has('mythic') ? .30 : .04,
  villain:.05, lead:.08,
  robot: t => t.has('robot') ? .50 : .03, monster: t => t.has('monster') ? .50 : .04,

  /* gear */
  masked: t => t.has('masked') ? .35 : .04, costume:.05,
  gun: t => has(t,'crime','warfilm','action') ? .25 : .04,
  sword: t => t.has('sword') ? .40 : .04, weirdhair:.02,

  /* work: این‌ها مالِ بازی و سریال‌اند */
  playable:.02, mobile_game:.02, online_game:.02, fighting:.02, shooter:.02,
  openworld:.02, retro:.02, sitcom:.02,
  longrun: t => t.has('bookseries') ? .30 : .03,
  stream: t => t.has('stream') ? .40 : .04,

  /* «جوابت خودِ فیلمه؟» برای کتابِ اقتباس‌شده دوپهلوست */
  is_film: t => SCREENED(t) ? .15 : .04,

  fam_close:.04,
};

/* سؤال‌هایی که برای کتابِ هم‌نام با یک شخصیت، به سمتِ همان شخصیت کشیده می‌شوند.
   بازیکنِ «هری پاتر» به «مَرده؟ عینک داره؟ جادو داره؟» درباره‌ی پسرک جواب می‌دهد. */
const EPONYM_CLUSTERS = new Set(['bio', 'look', 'fict', 'gear', 'prof', 'world']);
const EPONYM_W = 0.6;   // سهمِ شخصیت

module.exports = { BOOK_QUESTIONS, BOOK_OVERRIDE, EPONYM_CLUSTERS, EPONYM_W };
