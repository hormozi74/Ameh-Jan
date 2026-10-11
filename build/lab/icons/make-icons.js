/* ۱۰ طرحِ آیکونِ اپ در سبکِ کمیکِ جوهریِ عمه‌جان. خروجی: icon-01..10.svg/png و sheet.png کنارِ همین فایل.
   اجرا: node build/lab/icons/make-icons.js  (PNG با qlmanage در مک) */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.join(__dirname, '..', '..', '..'), out = __dirname;
const src = fs.readFileSync(path.join(root, 'ameh-jan.html'), 'utf8');
const fnSrc = src.slice(src.indexOf('function auntMarkup(){'));
const auntMarkup = new Function(fnSrc.slice(0, fnSrc.indexOf('\n}\n', fnSrc.indexOf('return `')) + 3) + '; return auntMarkup;')();
const INNER = auntMarkup().replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const FONT = `@font-face{font-family:'Lalezar';src:url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'fonts/Lalezar.woff2')).toString('base64')}) format('woff2')}`;
const K = '#1a0c12';

const MOODS = {
  idle: ['normal', 'open', 'smile'], win: ['up', 'star', 'grin'], smug: ['susp', 'squint', 'smirk'],
  angry: ['angry', 'mad', 'shout'], eureka: ['up', 'wide', 'o'], confused: ['up', 'spiral', 'wave'], suspect: ['susp', 'squint', 'flat'],
};
const AUNT_CSS = `svg{--k:${K};--skin:#f6c49b;--skin-sh:#de9270;--skin-hot:#ff8a72;--hair:#d4501c;--hair-lt:#ff8f4f;--iris:#6a3416;
--lip:#d81f3f;--lip-sh:#8f1028;--frame:#f5b51b;--scarf:#e0263f;--scarf-sh:#9a1232;--scarf-pat:#ffd166;
--dress:#6a2c86;--dress-sh:#3f1556;--flower:#ff8fb1;--flower2:#ffd166;--leaf:#5fd17a;
--cardi:#f0a92e;--cardi-sh:#c27a14;--cardi-lt:#ffd57a;--slipper:#2f8ae0;--slipper-sh:#1a5aa6;--tea:#c5401a;--gold:#ffc53a;--blue:#3a8de0;--yellow:#ffd23f}
.b,.e,.m,.tears,.fx>g,.fx-sfx,.slipper-hand,.hanky,.slip-bare,.glare{display:none}
[data-brow="normal"] .b-normal,[data-brow="up"] .b-up,[data-brow="angry"] .b-angry,[data-brow="sad"] .b-sad,[data-brow="susp"] .b-susp{display:block}
[data-eye="open"] .e-open,[data-eye="squint"] .e-open,[data-eye="wide"] .e-open,[data-eye="happy"] .e-happy,[data-eye="spiral"] .e-spiral,[data-eye="shut"] .e-shut,[data-eye="star"] .e-star,[data-eye="mad"] .e-mad{display:block}
[data-mouth="smile"] .m-smile,[data-mouth="flat"] .m-flat,[data-mouth="grin"] .m-grin,[data-mouth="smirk"] .m-smirk,[data-mouth="wave"] .m-wave,[data-mouth="shout"] .m-shout,[data-mouth="o"] .m-o,[data-mouth="sob"] .m-sob{display:block}
[data-eye="squint"] .e-open{transform:scaleY(.46);transform-origin:100px 63px}
[data-eye="wide"] .e-open{transform:scale(1.14);transform-origin:100px 63px}
[data-mood="win"] .fx-stars,[data-mood="win"] .fx-hearts{display:block}
[data-mood="smug"] .fx-glint,[data-mood="smug"] .glare{display:block}
[data-mood="angry"] .face{fill:var(--skin-hot)}[data-mood="angry"] .fx-steam,[data-mood="angry"] .fx-vein{display:block}
[data-mood="eureka"] .fx-bulb{display:block}
[data-mood="confused"] .fx-quest,[data-mood="confused"] .fx-sweat{display:block}
[data-mood="suspect"] .pupil{transform:translateX(-3.2px)}`;

// عمه به‌صورتِ svgِ تودرتو؛ شناسه‌ها یکتا می‌شوند تا clipPath به نسخه‌ی دیگری ارجاع نشود
const aunt = (id, mood, { x = 26, y = 30, w = 460, vb = '40 2 120 120', css = '' } = {}) => {
  const [b, e, m] = MOODS[mood];
  const inner = INNER.replace(/(id="|url\(#|href="#)a-/g, `$1a${id}-`);
  return `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="${vb}" data-mood="${mood}" data-brow="${b}" data-eye="${e}" data-mouth="${m}" overflow="hidden"><style>${AUNT_CSS}${css}</style>${inner}</svg>`;
};

// پرتوهای انفجارِ کمیک دورِ (cx,cy)
const rays = (cx, cy, n, fill, rot = 0) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 2 * Math.PI + rot, a1 = a0 + Math.PI / n, R = 1100;
    d += `M${cx} ${cy} L${(cx + R * Math.cos(a0)).toFixed(0)} ${(cy + R * Math.sin(a0)).toFixed(0)} L${(cx + R * Math.cos(a1)).toFixed(0)} ${(cy + R * Math.sin(a1)).toFixed(0)}Z`;
  }
  return `<path d="${d}" fill="${fill}"/>`;
};
const sparkle = (x, y, s, fill = '#fff') => `<path d="M${x} ${y - 7 * s} Q${x + 1.3 * s} ${y - 1.3 * s} ${x + 7 * s} ${y} Q${x + 1.3 * s} ${y + 1.3 * s} ${x} ${y + 7 * s} Q${x - 1.3 * s} ${y + 1.3 * s} ${x - 7 * s} ${y} Q${x - 1.3 * s} ${y - 1.3 * s} ${x} ${y - 7 * s}Z" fill="${fill}" stroke="${K}" stroke-width="${Math.max(3, s * .9).toFixed(1)}" stroke-linejoin="round"/>`;
// انفجارِ ستاره‌ایِ دندانه‌دار (بادکنکِ صدا)
const spiky = (cx, cy, R, r, n, rot = 0) => 'M' + Array.from({ length: n * 2 }, (_, i) => {
  const a = rot + (i * Math.PI) / n, rr = i % 2 ? r : R * (i % 4 ? 1 : .88);
  return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
}).join(' L') + 'Z';

const frame = ({ bg, ray, cx = 256, cy = 300, n = 12, rot = 0, dot = 'rgba(26,12,18,.16)', font = false }, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>${font ? `<style>${FONT}</style>` : ''}
  <pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2.3" fill="${dot}"/></pattern>
  <radialGradient id="m" cx="${cx / 512}" cy="${cy / 512}" r=".72"><stop offset=".42" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="mk"><rect width="512" height="512" fill="url(#m)"/></mask>
  <clipPath id="r"><rect width="512" height="512" rx="110"/></clipPath>
</defs>
<g clip-path="url(#r)">
  <rect width="512" height="512" fill="${bg}"/>
  ${rays(cx, cy, n, ray, rot)}
  <rect width="512" height="512" fill="url(#p)" mask="url(#mk)"/>
  ${body}
  <rect x="9" y="9" width="494" height="494" rx="102" fill="none" stroke="${K}" stroke-width="18"/>
</g>
</svg>`;

const ICONS = [
  // ۱. برد: چشمِ ستاره‌ای و قلب، روی انفجارِ نارنجی
  ['win', 'عمه برد', frame({ bg: '#ff8a2a', ray: '#ffc53a' }, aunt(1, 'win', { x: 6, y: 18, w: 500, vb: '30 0 140 140' }))],

  // ۲. برقِ عینک: از خودراضی، روی فیروزه‌ای
  ['smug', 'برقِ عینک', frame({ bg: '#0f8f8a', ray: '#22b5a8', rot: .2 }, aunt(2, 'smug', { x: 26, y: 30 }) +
    sparkle(410, 120, 7, '#fff') + sparkle(95, 400, 4.5, '#ffd23f'))],

  // ۳. کفری: صورتِ سرخ، دود از گوش، رگِ مانگا؛ پس‌زمینه‌ی لاکی
  ['angry', 'عمه کفری شد', frame({ bg: '#b5122e', ray: '#e8323f', n: 16 }, aunt(3, 'angry', { x: 0, y: 14, w: 512, vb: '24 -2 152 152' }))],

  // ۴. چراغِ عمه روشن شد: چشمِ گرد و دهانِ «اوه»، لامپ بالای سر
  ['eureka', 'چراغ روشن شد', frame({ bg: '#ffb703', ray: '#fff27a', n: 14, cy: 280 }, aunt(4, 'eureka', { x: 0, y: 26, w: 512, vb: '28 -6 150 150' }))],

  // ۵. قاطی کرد: چشمِ فنری، علامت‌سؤال و قطره‌ی عرق؛ بنفشِ پیراهنِ عمه
  ['confused', 'عمه قاطی کرد', frame({ bg: '#5a2378', ray: '#7d3aa3', font: true, dot: 'rgba(255,209,102,.18)' },
    aunt(5, 'confused', { x: 0, y: 22, w: 512, vb: '24 -4 152 152' }))],

  // ۶. نمای نزدیک: فقط عینکِ گربه‌ای و نگاهِ زیرچشمی — در اندازه‌ی کوچک هم خواناست
  ['suspect', 'زیرِ عینکی', frame({ bg: '#e0263f', ray: '#ff4a52' },
    aunt(6, 'suspect', { x: -40, y: -60, w: 592, vb: '58 22 84 84', css: '.pupil{transform:translateX(-3.2px)}' }))],

  // ۷. دمپاییِ ابری در حالِ پرواز با خط‌های سرعت و «تَق!»
  ['slipper', 'دمپاییِ پرنده', frame({ bg: '#2bb3a3', ray: '#5fd1c0', font: true, cx: 300, cy: 290, n: 14 }, `
    <g stroke="${K}" stroke-linecap="round" stroke-width="14"><path d="M70 420 L170 330 M40 340 L120 268 M120 470 L200 398"/></g>
    <g stroke="#fff" stroke-linecap="round" stroke-width="6"><path d="M70 420 L170 330 M40 340 L120 268 M120 470 L200 398"/></g>
    <g transform="translate(300 270) rotate(38)" stroke="${K}" stroke-width="13" stroke-linejoin="round">
      <path transform="translate(14 10)" d="M0 -165 C66 -165 82 -100 77 -33 C73 22 58 66 56 110 C58 154 28 176 0 176 C-28 176 -58 154 -56 110 C-58 66 -73 22 -77 -33 C-82 -100 -66 -165 0 -165Z" fill="${K}" stroke="none"/>
      <path d="M0 -165 C66 -165 82 -100 77 -33 C73 22 58 66 56 110 C58 154 28 176 0 176 C-28 176 -58 154 -56 110 C-58 66 -73 22 -77 -33 C-82 -100 -66 -165 0 -165Z" fill="#2f8ae0"/>
      <path d="M0 -140 C50 -140 60 -92 57 -36 C54 14 48 62 50 104 C52 140 26 152 0 152 C-26 152 -52 140 -50 104 C-48 62 -54 14 -57 -36 C-60 -92 -50 -140 0 -140Z" fill="#cfe7ff" stroke-width="7"/>
      <g fill="#8fc2f0" stroke="none"><circle cx="-22" cy="40" r="7"/><circle cx="12" cy="56" r="7"/><circle cx="-14" cy="84" r="7"/><circle cx="20" cy="100" r="7"/><circle cx="-6" cy="122" r="7"/><circle cx="24" cy="20" r="7"/></g>
      <path d="M-86 -82 Q0 -132 86 -82 L80 -12 Q0 -54 -80 -12Z" fill="#1a5aa6"/>
      <path d="M-62 -84 Q0 -112 62 -84" fill="none" stroke="#5fa8ff" stroke-width="8" stroke-linecap="round"/>
    </g>
    <path d="${spiky(140, 140, 92, 58, 11, .2)}" fill="#ffd23f" stroke="${K}" stroke-width="10" stroke-linejoin="round"/>
    <text direction="rtl" x="140" y="172" text-anchor="middle" font-family="Lalezar" font-size="92" fill="#e0263f" stroke="${K}" stroke-width="9" paint-order="stroke">تق!</text>`)],

  // ۸. استکانِ کمرباریکِ چای با بخاری که «؟» شده
  ['tea', 'چای و سؤال', frame({ bg: '#0f6f86', ray: '#1d8fa8', font: true, cy: 330 }, `
    <clipPath id="g8"><path d="M170 200 L342 200 C342 262 298 286 298 316 C298 346 336 368 328 404 L184 404 C176 368 214 346 214 316 C214 286 170 262 170 200Z"/></clipPath>
    <ellipse cx="270" cy="428" rx="178" ry="40" fill="${K}"/>
    <ellipse cx="256" cy="414" rx="178" ry="40" fill="#ffd166" stroke="${K}" stroke-width="12"/>
    <ellipse cx="256" cy="410" rx="128" ry="24" fill="#f0a92e" stroke="${K}" stroke-width="6"/>
    <path d="M170 200 L342 200 C342 262 298 286 298 316 C298 346 336 368 328 404 L184 404 C176 368 214 346 214 316 C214 286 170 262 170 200Z" fill="#e8f7ff" fill-opacity=".55"/>
    <g clip-path="url(#g8)">
      <rect x="150" y="236" width="220" height="190" fill="#c5401a"/>
      <rect x="290" y="236" width="80" height="190" fill="#8f2a0e"/>
      <ellipse cx="256" cy="238" rx="90" ry="12" fill="#ff8a3a" stroke="${K}" stroke-width="5"/>
      <path d="M196 260 Q206 330 196 396" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".8"/>
    </g>
    <path d="M170 200 L342 200 C342 262 298 286 298 316 C298 346 336 368 328 404 L184 404 C176 368 214 346 214 316 C214 286 170 262 170 200Z" fill="none" stroke="${K}" stroke-width="13" stroke-linejoin="round"/>
    <path d="M166 200 L346 200" stroke="#ffc53a" stroke-width="10" stroke-linecap="round"/>
    <path d="M166 200 L346 200" stroke="${K}" stroke-width="4" stroke-linecap="round" transform="translate(0 7)"/>
    <g fill="none" stroke-linecap="round"><path d="M228 182 C204 160 244 140 222 112 M290 182 C266 156 312 140 292 112" stroke="${K}" stroke-width="14"/><path d="M228 182 C204 160 244 140 222 112 M290 182 C266 156 312 140 292 112" stroke="#fff" stroke-width="7"/></g>
    <text direction="rtl" x="262" y="150" text-anchor="middle" font-family="Lalezar" font-size="150" fill="#ffd23f" stroke="${K}" stroke-width="12" paint-order="stroke" transform="rotate(-8 262 110)">؟</text>`)],

  // ۹. بادکنکِ «کیه؟» با لاله‌زار روی انفجارِ قرمز
  ['bubble', 'کیه؟', frame({ bg: '#e0263f', ray: '#ff5a3d', font: true, n: 16 }, `
    <path transform="translate(14 14)" d="M256 86 C380 86 456 150 456 236 C456 322 380 380 270 384 L196 452 L210 378 C120 362 56 306 56 236 C56 150 132 86 256 86Z" fill="${K}"/>
    <path d="M256 86 C380 86 456 150 456 236 C456 322 380 380 270 384 L196 452 L210 378 C120 362 56 306 56 236 C56 150 132 86 256 86Z" fill="#fff" stroke="${K}" stroke-width="14" stroke-linejoin="round"/>
    <path d="M110 190 Q130 140 190 122" fill="none" stroke="#cfe7ff" stroke-width="12" stroke-linecap="round"/>
    <text direction="rtl" x="256" y="300" text-anchor="middle" font-family="Lalezar" font-size="190" fill="${K}">کیه؟</text>
    ${sparkle(430, 80, 6, '#ffd23f')}${sparkle(80, 420, 4, '#ffd23f')}`)],

  // ۱۰. سرک‌کشیدن: عمه از پایینِ قاب بالا را نگاه می‌کند، «؟» بزرگ بالای سرش
  ['peek', 'عمه سرک می‌کشه', frame({ bg: '#3f1556', ray: '#5a2378', font: true, cy: 470, dot: 'rgba(255,209,102,.2)' },
    aunt(10, 'idle', { x: 6, y: 176, w: 500, vb: '40 2 120 120', css: '.pupil{transform:translateY(-3px)}' }) + `
    <text direction="rtl" x="256" y="200" text-anchor="middle" font-family="Lalezar" font-size="200" fill="#ffd23f" stroke="${K}" stroke-width="14" paint-order="stroke" transform="rotate(10 256 130)">؟</text>
    ${sparkle(110, 110, 5, '#fff')}${sparkle(410, 150, 4, '#ff8fb1')}`)],
];

module.exports = { ICONS, K };
if (require.main === module) {
  const pngs = [];
  ICONS.forEach(([slug, , svg], i) => {
    const n = String(i + 1).padStart(2, '0'), f = path.join(out, `icon-${n}-${slug}.svg`);
    fs.writeFileSync(f, svg);
    try {
      execSync(`qlmanage -t -s 512 -o "${out}" "${f}" >/dev/null 2>&1`);
      fs.renameSync(f + '.png', f.replace(/\.svg$/, '.png'));
      pngs.push(f.replace(/\.svg$/, '.png'));
    } catch (e) { console.log('PNG نشد:', slug, e.message); }
  });
  fs.writeFileSync(path.join(out, 'names.json'), JSON.stringify(ICONS.map(([s, fa]) => ({ slug: s, fa })), null, 1));
  console.log(pngs.length, 'icons →', out);
}
