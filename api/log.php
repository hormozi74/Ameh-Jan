<?php
/* ============================================================
   عمه‌جان — ثبتِ نتیجه‌ی بازی‌ها.
   بازی بعد از هر دست یک JSON کوچک (~۱ تا ۲ کیلوبایت) می‌فرستد؛ این‌جا
   فقط اعتبارِ ساده و الحاق به یک فایلِ JSONL ماهانه. نه پایگاه‌داده لازم
   است نه فریم‌ورک — هر هاستِ اشتراکیِ PHP کافی است.
   تحلیل روی همین فایل‌ها با build/analyze.js انجام می‌شود.

   نصب: پوشه‌ی api/ را کنار ameh-jan.html بگذار و مطمئن شو
   api/data/ قابل نوشتن است (chmod 775). LOG_KEY را عوض کن.
   ============================================================ */
const LOG_KEY = 'change-me-before-deploy';   // فقط برای stats.php؛ log.php باز است
const MAX_BODY = 8192;
const DATA_DIR = __DIR__ . '/data';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY + 1);
if ($raw === false || strlen($raw) > MAX_BODY) { http_response_code(413); echo '{"ok":false}'; exit; }
$ev = json_decode($raw, true);
if (!is_array($ev) || !isset($ev['v'], $ev['won'], $ev['n'])) { http_response_code(400); echo '{"ok":false}'; exit; }

/* فقط فیلدهای شناخته‌شده نگه داشته می‌شوند — هرچه کاربر بفرستد ذخیره نمی‌شود */
$keep = ['v','sid','gid','won','n','guesses','truth','taught','answers','heat','kin','film','ref','ua','lang','tz','dur'];
$row = [];
foreach ($keep as $k) if (array_key_exists($k, $ev)) $row[$k] = $ev[$k];
$row['ts'] = gmdate('c');
$row['ip'] = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . 'ameh-salt'), 0, 12);   // فقط برای شمارشِ یکتا، نه ردیابی

if (!is_dir(DATA_DIR)) @mkdir(DATA_DIR, 0775, true);
$file = DATA_DIR . '/events-' . gmdate('Y-m') . '.jsonl';
$line = json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
$fh = @fopen($file, 'a');
if (!$fh) { http_response_code(500); echo '{"ok":false}'; exit; }
if (flock($fh, LOCK_EX)) { fwrite($fh, $line); flock($fh, LOCK_UN); }
fclose($fh);
echo '{"ok":true}';
