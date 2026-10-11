/* آیکونِ اپ: طرحِ ۸ از build/lab/icons (استکانِ کمرباریک با بخارِ «؟»، سبکِ کمیکِ جوهری).
   خروجی: icon.svg و icon-1024/512/192.png (گوشه‌ی شفاف)، icon-180.png (apple-touch، گوشه‌ی جوهری؛ iOS خودش گرد می‌کند)
   و icon-maskable-512.png (تمام‌قد، طرح در ۸۰٪ وسط برای ماسکِ اندروید). نیاز: qlmanage در مک و python3 با Pillow.
   اجرا: node build/make-icon.js   (نسخه‌ی قبلی با سرِ عمه: build/lab/icons/make-icon.before-tea.js) */
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const { ICONS, K } = require('./lab/icons/make-icons.js');
const svg = ICONS.find(([slug]) => slug === 'tea')[2];
const BG = '#0f6f86';
fs.writeFileSync(path.join(root, 'icon.svg'), svg);
const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="${BG}"/>
<svg x="51" y="51" width="410" height="410" viewBox="0 0 512 512">${inner}</svg></svg>`;
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'icon-'));
fs.writeFileSync(path.join(tmp, 'maskable.svg'), maskable);
const r = f => path.join(root, f);
try {
  execSync(`qlmanage -t -s 1024 -o "${tmp}" "${r('icon.svg')}" "${path.join(tmp, 'maskable.svg')}" >/dev/null 2>&1`);
  execSync(`python3 - "${tmp}" "${root}" "${K}" <<'PY'
import sys
from PIL import Image, ImageDraw
tmp, root, ink = sys.argv[1:4]
ink = tuple(int(ink[i:i+2], 16) for i in (1, 3, 5))
im = Image.open(tmp + '/icon.svg.png').convert('RGBA').resize((1024, 1024), Image.LANCZOS)
mask = Image.new('L', (1024, 1024), 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, 1023, 1023), radius=220, fill=255)
im.putalpha(mask)
for sz in (1024, 512, 192): im.resize((sz, sz), Image.LANCZOS).save(f'{root}/icon-{sz}.png')
flat = Image.new('RGBA', im.size, ink + (255,)); flat.alpha_composite(im)
flat.convert('RGB').resize((180, 180), Image.LANCZOS).save(f'{root}/icon-180.png')
Image.open(tmp + '/maskable.svg.png').convert('RGB').resize((512, 512), Image.LANCZOS).save(f'{root}/icon-maskable-512.png')
PY`);
  console.log('icon.svg، icon-1024/512/192/180.png، icon-maskable-512.png');
} catch (e) { console.log('SVG نوشته شد؛ تبدیل به PNG نشد:', e.message); }
fs.rmSync(tmp, { recursive: true, force: true });
