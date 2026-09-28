<?php
/* خروجیِ خامِ رویدادها برای تحلیلِ محلی:  curl "https://SITE/api/stats.php?key=...&m=2026-10" > events.jsonl
   بدونِ m، ماهِ جاری. با m=all همه‌ی ماه‌ها. */
require_once __DIR__ . '/log.php.key';   // فایلی با یک خط: <?php const STATS_KEY = '...';
header('Content-Type: application/x-ndjson; charset=utf-8');
if (!isset($_GET['key']) || !hash_equals(STATS_KEY, $_GET['key'])) { http_response_code(403); exit; }
$dir = __DIR__ . '/data';
$m = $_GET['m'] ?? gmdate('Y-m');
$files = $m === 'all' ? glob("$dir/events-*.jsonl") : ["$dir/events-$m.jsonl"];
foreach ($files as $f) if (is_file($f)) readfile($f);
