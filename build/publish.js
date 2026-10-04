// ameh-jan.html (منبعِ کار) را برای GitHub Pages به index.html کپی می‌کند.
// بعد از هر generate/inject اجرا کن:  node build/publish.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
fs.copyFileSync(path.join(root, 'ameh-jan.html'), path.join(root, 'index.html'));
console.log('index.html به‌روز شد');
