<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

// Load environment variables
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            if (!array_key_exists($key, $_SERVER) && !array_key_exists($key, $_ENV)) {
                putenv(sprintf('%s=%s', $key, $value));
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
    }
}

// Load .env file from the same directory
loadEnv(__DIR__ . '/.env');

define('GEMINI_API_KEY', $_ENV['GEMINI_API_KEY'] ?? '');

if (empty(GEMINI_API_KEY)) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gemini API key not configured"]);
    exit();
}

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit();
}

$url      = $data['url']      ?? '';
$domain   = $data['domain']   ?? '';
$title    = $data['title']    ?? '';
$text     = isset($data['text']) ? substr($data['text'], 0, 4000) : '';
$headings = $data['headings'] ?? '';

if (empty($domain) && !empty($url)) {
    $parsed = parse_url($url);
    $domain = $parsed['host'] ?? 'unknown.com';
}
if (empty($domain)) $domain = 'unknown.com';

$headings_text = is_array($headings) ? implode(" ", $headings) : $headings;


// SYSTEM PROMPT — Trilingual: English + Bahasa Malaysia + Bahasa Indonesia

$system_prompt = <<<'PROMPT'
You are ScamBuster AI — a specialist financial fraud detection agent fluent in English, Bahasa Malaysia, AND Bahasa Indonesia. You combine the expertise of an SC Malaysia enforcement officer, an OJK Indonesia compliance analyst, an Interpol cybercrime investigator, and a behavioral psychologist who studies financial manipulation tactics. You have analyzed hundreds of thousands of fraudulent investment websites across Southeast Asia.

YOUR MISSION: Protect people in Malaysia and Indonesia from losing their savings to investment scams. You detect scams written in English, Bahasa Malaysia, Bahasa Indonesia, Manglish, or any mix of all three.

TRILINGUAL SCAM VOCABULARY — recognize ALL of these as red flags:

ENGLISH scam phrases:
guaranteed profit, guaranteed return, guaranteed income, risk-free investment, double your money, triple your investment, daily profit, passive income, act now, limited slots, secret system, no risk, withdraw anytime, 500% ROI, binary options, referral bonus, downline, upline, entry fee, crypto mining daily returns, arbitrage bot, AI trading guaranteed, work from home, financial freedom, get rich quick, anyone can do it, no experience needed

BAHASA MALAYSIA scam phrases:
keuntungan dijamin, pulangan dijamin, pelaburan tanpa risiko, tiada risiko, gandakan wang, untung setiap hari, pendapatan pasif, bertindak sekarang, tempat terhad, sistem rahsia, pengeluaran segera, opsyen binari, bonus rujukan, perlombongan crypto, labur sekarang, modal selamat, keuntungan harian, jana pendapatan, sertai sekarang, wang mudah, untung cepat, skim pelaburan, wang pokok terjamin, tiada pengalaman diperlukan, kebebasan kewangan, ajak kawan, bonus kumpulan, bayaran masuk, downline, upline

BAHASA INDONESIA scam phrases:
investasi bodong, dijamin profit, jamin untung, pasti untung, untung pasti, tanpa risiko, bebas risiko, cuan tiap hari, profit harian, bunga harian tinggi, arisan online, money game, skema ponzi, koperasi fiktif, robot trading, sinyal trading, trading otomatis profit, binary option, forex tanpa modal, mining kripto dijamin, slot terbatas, buruan daftar, bergabung sekarang, kesempatan emas, jangan sampai ketinggalan, bonus rekrut, komisi referral, rekrutmen member, ajak teman, tidak terdaftar OJK, tanpa izin OJK, modal kecil untung besar, tanpa pengalaman, siapapun bisa, sudah terbukti, ribuan member aktif, penghasilan tambahan, kerja dari rumah, withdraw cepat, langsung cair, cair setelah bayar, biaya penarikan, biaya aktivasi, upgrade untuk withdraw, bebas finansial, kebebasan finansial

DETECTION STEPS — execute all in order:

STEP 1 — SITE CONTEXT CHECK:
If the site is clearly Wikipedia, a government .gov.my/.go.id site, Bank Negara Malaysia, SC Malaysia, OJK Indonesia, Maybank, CIMB, BRI, BCA, Mandiri, or a major news outlet — return risk_score 0, scam_type "None". Otherwise continue.

STEP 2 — RETURN PROMISE SCAN (critical):
Flag in ALL THREE languages: any guaranteed return/profit/income claim, ROI above 20% monthly, daily profit promise, risk-free investment claim, capital protection with profit, passive income with specific amounts.
Score: guaranteed return +45, unrealistic ROI +40, daily profit +35, risk-free +30
MINIMUM RULE: If ANY guaranteed return found → minimum score 55

STEP 3 — PRESSURE TACTICS SCAN:
Flag in all languages: countdown timers, limited slots/tempat terhad/slot terbatas, act now/bertindak sekarang/buruan daftar, last chance/peluang terakhir/jangan sampai ketinggalan, exclusive VIP, secret system/sistem rahsia, early bird, insider knowledge.
Score: each pressure tactic +12

STEP 4 — REGULATORY RED FLAGS:
Malaysia: no SC Malaysia license, no BNM approval, no company registration
Indonesia: tidak terdaftar OJK, tanpa izin OJK, bukan perusahaan resmi
Both: anonymous team, offshore jurisdiction, no physical address, no legal documents
Score: missing regulator +25, anonymous team +15, offshore +20

STEP 5 — MLM AND PYRAMID SCAN:
Flag in all languages:
EN: referral bonus, recruit, downline, upline, team bonus, entry fee
BM: bonus rujukan, ajak kawan, downline, upline, bonus kumpulan, bayaran masuk
BI: bonus rekrut, komisi referral, rekrutmen member, ajak teman, arisan online, money game
MINIMUM RULE: 3+ MLM signals → minimum score 72, classify MLM Pyramid Scheme

STEP 6 — FAKE CREDIBILITY SCAN:
Flag: celebrity names (Elon Musk, Warren Buffett, Dr Mahathir, Anwar Ibrahim, Jokowi, any public figure), fake media logos, testimonials with exact amounts, withdrawal proof screenshots, fake awards, government partnership claims, "sudah terbukti", "ribuan member aktif"
Score: each fake credibility signal +18

STEP 7 — CRYPTO AND FINTECH SCAM SCAN:
Flag:
EN: crypto mining daily returns, arbitrage bot, AI trading guaranteed, token presale, seed phrase, private key
BM: perlombongan crypto, bot dagangan, opsyen binari
BI: mining kripto dijamin, robot trading, sinyal trading, binary option, trading otomatis profit, investasi bodong, skema ponzi, koperasi fiktif
Score: each signal +22, seed phrase/private key +40

STEP 8 — PAYMENT RED FLAGS:
Flag:
EN: withdrawal fee, unlock withdrawal, recruit-to-withdraw, activation fee
BM: bayaran pengeluaran, yuran aktivasi, naik taraf untuk keluarkan
BI: biaya penarikan, biaya aktivasi, upgrade untuk withdraw, cair setelah bayar, bayar untuk tarik dana
Score: each payment red flag +18

STEP 9 — WORK FROM HOME / EASY MONEY (Indonesian pattern):
Flag: kerja dari rumah, penghasilan tambahan, tanpa pengalaman, siapapun bisa, modal kecil untung besar, bisnis online mudah, anyone can do it, no experience needed
Score: each +15

STEP 10 — FINAL SCORE + HARD RULES:
Sum Steps 2–9. Apply:
- ANY guaranteed return language → minimum 55
- 3+ categories triggered → minimum 78
- 5+ categories triggered → minimum 90
- Cap at 100
Thresholds: 0-25 SAFE | 26-55 SUSPICIOUS | 56-78 LIKELY SCAM | 79-100 DEFINITE SCAM

STEP 11 — SCAM TYPE:
Pick exactly ONE: "Ponzi Scheme" | "Forex Robot Scam" | "Crypto Mining Fraud" | "Binary Options Scam" | "MLM Pyramid Scheme" | "Fake Investment Platform" | "Money Game / Arisan Online" | "Celebrity Endorsement Scam" | "Token or NFT Presale Fraud" | "Phishing Investment Site" | "Work From Home Scam" | "None"

STEP 12 — EVIDENCE REASONS:
Write 3–5 reasons. Each must:
- Quote actual text from the page in its original language (EN, BM, or BI)
- Start with category: [Return Promise], [Pressure Tactic], [MLM Pattern], [Crypto Scam], [Payment Red Flag], [Regulatory], [Indonesia Scam], [Fake Credibility]
- Be specific — cite page evidence, not generic descriptions
- Write in the same language as the scam content detected

ABSOLUTE RULES:
1. Raw JSON only — no markdown, no code fences, nothing outside the JSON
2. Always produce a score — never refuse
3. Guaranteed return in ANY language → minimum score 55
4. 3+ categories → minimum score 78
5. Detect scams in English, BM, AND BI equally
6. Quote actual language used on the page in reasons

OUTPUT FORMAT — return EXACTLY this JSON structure, nothing else:
{"risk_score": <0-100>, "scam_type": "<approved value>", "reasons": ["<evidence>", "<evidence>", "<evidence>"]}
PROMPT;

$user_prompt = "Analyze this webpage for investment scams. The content may be in English, Bahasa Malaysia, Bahasa Indonesia, or a mix.\n\nURL: {$url}\nDOMAIN: {$domain}\nTITLE: {$title}\nHEADINGS: {$headings_text}\n\nFULL PAGE CONTENT:\n{$text}";


// GEMINI API CALL

$gemini_payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $system_prompt . "\n\n" . $user_prompt]
            ]
        ]
    ],
    "generationConfig" => [
        "maxOutputTokens"  => 700,
        "temperature"      => 0.1,
        "responseMimeType" => "application/json"
    ]
];

$ai_ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . GEMINI_API_KEY);
curl_setopt_array($ai_ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($gemini_payload),
    CURLOPT_TIMEOUT        => 25,
    CURLOPT_HTTPHEADER     => ["Content-Type: application/json"]
]);

$mh = curl_multi_init();
curl_multi_add_handle($mh, $ai_ch);
$active = null;
do {
    $status = curl_multi_exec($mh, $active);
    if ($active) curl_multi_select($mh);
} while ($active && $status == CURLM_OK);
$ai_raw = curl_multi_getcontent($ai_ch);
curl_multi_remove_handle($mh, $ai_ch);
curl_multi_close($mh);


// DOMAIN INTEL — 3 methods tried in order, first success wins

function getDomainIntel(string $domain): array {
    $result = ['age_days' => null, 'privacy' => false, 'source' => 'none'];

    // ── METHOD 1: RDAP (ICANN free, no key needed) ────────────
    $tld = strtolower(ltrim(strrchr($domain, '.'), '.'));
    $rdap_servers = [
        'com'  => 'https://rdap.verisign.com/com/v1/domain/',
        'net'  => 'https://rdap.verisign.com/net/v1/domain/',
        'org'  => 'https://rdap.publicinterestregistry.org/rdap/domain/',
        'my'   => 'https://rdap.mynic.my/rdap/domain/',
        'id'   => 'https://rdap.pandi.or.id/rdap/domain/',
        'io'   => 'https://rdap.iana.org/domain/',
        'info' => 'https://rdap.afilias.info/rdap/info/domain/',
    ];
    $rdap_base = $rdap_servers[$tld] ?? 'https://rdap.org/domain/';

    $ch = curl_init($rdap_base . urlencode($domain));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 7,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => ['Accept: application/json', 'User-Agent: ScamBusterAI/1.0']
    ]);
    $raw  = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw && $http === 200) {
        $d = json_decode($raw, true);
        if ($d && isset($d['events'])) {
            foreach ($d['events'] as $ev) {
                $action = strtolower($ev['eventAction'] ?? '');
                if (in_array($action, ['registration','registered','creation','domain registration'])) {
                    $t = strtotime($ev['eventDate'] ?? '');
                    if ($t > 0) {
                        $result['age_days'] = (int)floor((time() - $t) / 86400);
                        $result['source']   = 'rdap';
                        break;
                    }
                }
            }
        }
        foreach (($d['status'] ?? []) as $s) {
            if (strpos(strtolower($s), 'redact') !== false) { $result['privacy'] = true; break; }
        }
        if ($result['age_days'] !== null) return $result;
    }

    // ── METHOD 2: whoisjson.com (free tier) ───────────────────
    $ch2 = curl_init("https://whoisjson.com/api/v1/whois?domain=" . urlencode($domain));
    curl_setopt_array($ch2, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 7,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => ['User-Agent: ScamBusterAI/1.0', 'Accept: application/json']
    ]);
    $raw2  = curl_exec($ch2);
    $http2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($raw2 && $http2 === 200) {
        $d2 = json_decode($raw2, true);
        if ($d2 && !isset($d2['error'])) {
            $created = $d2['created']
                ?? $d2['creation_date']
                ?? $d2['registered']
                ?? $d2['domain']['created_date']
                ?? $d2['WhoisRecord']['createdDate']
                ?? null;
            if ($created) {
                if (is_array($created)) $created = $created[0];
                $t = strtotime($created);
                if ($t > 0) {
                    $result['age_days'] = (int)floor((time() - $t) / 86400);
                    $result['source']   = 'whoisjson';
                }
            }
            $wt = strtolower($raw2);
            foreach (['privacy','redacted','proxy','whoisguard','withheld'] as $w) {
                if (strpos($wt, $w) !== false) { $result['privacy'] = true; break; }
            }
            if ($result['age_days'] !== null) return $result;
        }
    }

    // ── METHOD 3: DNS SOA serial heuristic ────────────────────
    $soa = @dns_get_record($domain, DNS_SOA);
    if ($soa && isset($soa[0]['serial'])) {
        $serial = (string)$soa[0]['serial'];
        if (strlen($serial) >= 8) {
            $year  = (int)substr($serial, 0, 4);
            $month = (int)substr($serial, 4, 2);
            $day   = (int)substr($serial, 6, 2);
            if ($year >= 1994 && $year <= (int)date('Y')
                && $month >= 1 && $month <= 12
                && $day   >= 1 && $day   <= 31) {
                $t = mktime(0, 0, 0, $month, $day, $year);
                if ($t > 0) {
                    $result['age_days'] = (int)floor((time() - $t) / 86400);
                    $result['source']   = 'dns_soa';
                }
            }
        }
    }

    return $result;
}

$whois_result    = getDomainIntel($domain);
$domain_age_days = $whois_result['age_days'];
$privacy_hidden  = $whois_result['privacy'];
$age_source      = $whois_result['source'];


// PARSE AI RESPONSE (Gemini format)

$ai_data = null;
if ($ai_raw) {
    $ai_res  = json_decode($ai_raw, true);
    $content = $ai_res['candidates'][0]['content']['parts'][0]['text'] ?? '';
    if ($content) {
        $content = preg_replace('/^```(?:json)?\s*/i', '', trim($content));
        $content = preg_replace('/\s*```$/i', '', $content);
        $ai_data = json_decode(trim($content), true);
    }
}


// KEYWORD FALLBACK — Trilingual EN + BM + INDO
// Activates only if Gemini fails or returns invalid JSON

$used_fallback = false;

if (!$ai_data || !isset($ai_data['risk_score'])) {
    $used_fallback  = true;
    $check          = strtolower($text . ' ' . $title . ' ' . $headings_text);
    $score          = 0;
    $reasons        = [];
    $category_hits  = 0;
    $guaranteed_hit = false;

    $categories = [

        'Return Promises' => [
            // EN
            'guaranteed profit'        => 45,
            'guaranteed return'        => 45,
            'guaranteed income'        => 40,
            'risk-free investment'     => 40,
            'risk free'                => 30,
            'no risk'                  => 28,
            'double your money'        => 42,
            'triple your investment'   => 48,
            '500% roi'                 => 50,
            '1000%'                    => 55,
            'daily profit'             => 35,
            'fixed daily return'       => 35,
            'passive income'           => 20,
            'capital protection'       => 28,
            'principal guaranteed'     => 32,
            // BM
            'keuntungan dijamin'       => 45,
            'pulangan dijamin'         => 45,
            'untung dijamin'           => 45,
            'dijamin untung'           => 45,
            'tanpa risiko'             => 40,
            'tiada risiko'             => 40,
            'pelaburan tanpa risiko'   => 45,
            'gandakan wang'            => 42,
            'keuntungan harian'        => 35,
            'untung setiap hari'       => 35,
            'untung harian'            => 35,
            'pendapatan pasif'         => 20,
            'modal selamat'            => 32,
            'wang pokok terjamin'      => 38,
            'pulangan tetap'           => 35,
            'keuntungan tetap'         => 35,
            // BI
            'dijamin profit'           => 50,
            'jamin untung'             => 48,
            'pasti untung'             => 45,
            'untung pasti'             => 45,
            'cuan tiap hari'           => 38,
            'profit harian'            => 35,
            'bunga harian'             => 32,
            'bebas risiko'             => 38,
            'modal kecil untung besar' => 40,
        ],

        'Pressure Tactics' => [
            // EN
            'limited slots'             => 12,
            'act now'                   => 12,
            'register today'            => 12,
            "don't miss out"            => 14,
            'dont miss out'             => 14,
            'last chance'               => 14,
            'exclusive access'          => 12,
            'secret system'             => 18,
            'insider knowledge'         => 18,
            'early bird'                => 10,
            'join now'                  => 10,
            // BM
            'tempat terhad'             => 12,
            'bertindak sekarang'        => 12,
            'daftar sekarang'           => 12,
            'jangan lepaskan'           => 14,
            'peluang terakhir'          => 14,
            'akses eksklusif'           => 12,
            'sistem rahsia'             => 18,
            'sertai sekarang'           => 10,
            'labur sekarang'            => 10,
            // BI
            'slot terbatas'             => 12,
            'buruan daftar'             => 14,
            'bergabung sekarang'        => 12,
            'kesempatan emas'           => 14,
            'jangan sampai ketinggalan' => 16,
            'segera daftar'             => 12,
            'daftar gratis'             => 10,
            'gabung sekarang'           => 12,
        ],

        'Regulatory Red Flags' => [
            // EN
            'unregulated'              => 20,
            'no license'               => 22,
            'offshore'                 => 18,
            'vanuatu'                  => 22,
            'seychelles'               => 22,
            'marshall islands'         => 22,
            // BM
            'tiada lesen'              => 22,
            'tidak berdaftar'          => 20,
            'tiada lesen sc'           => 28,
            // BI
            'tidak terdaftar ojk'      => 32,
            'tanpa izin ojk'           => 32,
            'bukan perusahaan resmi'   => 25,
            'tanpa izin'               => 18,
        ],

        'MLM Patterns' => [
            // EN
            'referral bonus'           => 25,
            'recruit and earn'         => 30,
            'downline'                 => 28,
            'upline'                   => 28,
            'binary matrix'            => 30,
            'team bonus'               => 22,
            'entry fee'                => 20,
            'network marketing'        => 18,
            // BM
            'bonus rujukan'            => 25,
            'ajak kawan'               => 25,
            'bonus kumpulan'           => 22,
            'bayaran masuk'            => 20,
            'pemasaran rangkaian'      => 18,
            'rekrut ahli'              => 28,
            'jana pendapatan'          => 20,
            // BI
            'bonus rekrut'             => 28,
            'komisi referral'          => 25,
            'rekrutmen member'         => 30,
            'ajak teman'               => 20,
            'bonus anggota baru'       => 25,
            'arisan online'            => 38,
            'money game'               => 38,
        ],

        'Crypto Scam Patterns' => [
            // EN
            'mining pool profit'       => 25,
            'cloud mining'             => 22,
            'arbitrage bot'            => 28,
            'ai trading guaranteed'    => 30,
            'nft flip'                 => 22,
            'seed phrase'              => 40,
            'private key'              => 40,
            'token presale'            => 22,
            'binary options'           => 50,
            // BM
            'perlombongan crypto'      => 25,
            'perlombongan awan'        => 22,
            'opsyen binari'            => 50,
            'bot dagangan'             => 28,
            'token pratjualan'         => 22,
            // BI
            'mining kripto dijamin'    => 50,
            'robot trading'            => 40,
            'sinyal trading'           => 35,
            'binary option'            => 45,
            'forex tanpa modal'        => 42,
            'trading otomatis profit'  => 45,
            'investasi bodong'         => 55,
            'skema ponzi'              => 65,
            'koperasi fiktif'          => 55,
        ],

        'Payment Red Flags' => [
            // EN
            'withdrawal fee'           => 20,
            'unlock withdrawal'        => 22,
            'recruit to withdraw'      => 28,
            'verification fee'         => 20,
            'activate account'         => 18,
            'upgrade to withdraw'      => 25,
            // BM
            'bayaran pengeluaran'      => 20,
            'buka pengeluaran'         => 22,
            'yuran pengesahan'         => 20,
            'yuran aktivasi'           => 20,
            'aktifkan akaun'           => 18,
            'naik taraf untuk'         => 22,
            'pengeluaran segera'       => 15,
            // BI
            'biaya penarikan'          => 22,
            'biaya aktivasi'           => 20,
            'upgrade untuk withdraw'   => 25,
            'cair setelah bayar'       => 30,
            'bayar untuk tarik dana'   => 30,
            'withdraw cepat'           => 15,
            'langsung cair'            => 15,
        ],

        'Indonesia Scam' => [
            'tidak terdaftar ojk'      => 38,
            'tanpa izin ojk'           => 38,
            'investasi bodong'         => 55,
            'koperasi fiktif'          => 55,
            'tanpa pengalaman'         => 18,
            'siapapun bisa'            => 18,
            'sudah terbukti'           => 20,
            'ribuan member aktif'      => 22,
            'kerja dari rumah'         => 15,
            'penghasilan tambahan'     => 15,
            'bebas finansial'          => 20,
            'kebebasan finansial'      => 20,
        ],
    ];

    $guaranteed_phrases = [
        'guaranteed profit','guaranteed return','guaranteed income',
        'risk-free investment','principal guaranteed',
        'keuntungan dijamin','pulangan dijamin','untung dijamin',
        'dijamin untung','pelaburan tanpa risiko','modal selamat','wang pokok terjamin',
        'dijamin profit','jamin untung','pasti untung','untung pasti','bebas risiko',
    ];

    foreach ($categories as $cat_name => $keywords) {
        $cat_score = 0;
        $cat_hits  = [];

        foreach ($keywords as $phrase => $weight) {
            if (strpos($check, strtolower($phrase)) !== false) {
                $cat_score += $weight;
                $cat_hits[] = $phrase;
                if (in_array(strtolower($phrase), $guaranteed_phrases)) {
                    $guaranteed_hit = true;
                }
            }
        }

        if ($cat_score > 0) {
            $category_hits++;
            $score += $cat_score;
            if (count($reasons) < 5) {
                $hits_str  = implode('", "', array_slice($cat_hits, 0, 3));
                $reasons[] = "[{$cat_name}] Detected: \"{$hits_str}\"";
            }
        }
    }

    // Hard scoring rules
    $score = min($score, 100);
    if ($guaranteed_hit)     $score = max($score, 55);
    if ($category_hits >= 3) $score = max($score, 78);
    if ($category_hits >= 5) $score = max($score, 90);

    // Scam type detection
    $scam_type = 'None';
    if ($score > 0) {
        if (strpos($check, 'arisan online') !== false || strpos($check, 'money game') !== false) {
            $scam_type = 'Money Game / Arisan Online';
        } elseif (strpos($check, 'skema ponzi') !== false || strpos($check, 'ponzi') !== false) {
            $scam_type = 'Ponzi Scheme';
        } elseif (strpos($check, 'mlm') !== false || strpos($check, 'downline') !== false || strpos($check, 'rekrutmen') !== false) {
            $scam_type = 'MLM Pyramid Scheme';
        } elseif (strpos($check, 'binary') !== false || strpos($check, 'opsyen binari') !== false) {
            $scam_type = 'Binary Options Scam';
        } elseif (strpos($check, 'forex') !== false || strpos($check, 'robot trading') !== false) {
            $scam_type = 'Forex Robot Scam';
        } elseif (strpos($check, 'crypto') !== false || strpos($check, 'kripto') !== false || strpos($check, 'bitcoin') !== false) {
            $scam_type = 'Crypto Mining Fraud';
        } else {
            $scam_type = 'Fake Investment Platform';
        }
    }

    if (empty($reasons)) $reasons[] = 'No specific scam patterns detected in keyword analysis.';

    $ai_data = [
        'risk_score' => $score,
        'scam_type'  => $scam_type,
        'reasons'    => $reasons
    ];
}


// DOMAIN AGE + PRIVACY LABELS

$age_risk = 'yellow';
$age_str  = 'Unknown';

if ($domain_age_days !== null && ($age_source ?? '') !== 'ssl_cert') {
    if ($domain_age_days < 90) {
        $age_risk = 'red';
        $age_str  = $domain_age_days . ' days';
    } elseif ($domain_age_days < 365) {
        $age_risk = 'yellow';
        $age_str  = round($domain_age_days / 30) . ' months';
    } else {
        $age_risk = 'green';
        $age_str  = round($domain_age_days / 365, 1) . ' years';
    }
}

$privacy_str  = $privacy_hidden ? 'Hidden' : 'Public';
$privacy_risk = $privacy_hidden ? 'red'    : 'green';


// RISK LABEL

$score = intval($ai_data['risk_score'] ?? 0);

if ($score >= 79)     { $risk_label = 'DEFINITE SCAM'; $risk_color = 'red'; }
elseif ($score >= 56) { $risk_label = 'LIKELY SCAM';   $risk_color = 'orange'; }
elseif ($score >= 26) { $risk_label = 'SUSPICIOUS';    $risk_color = 'yellow'; }
else                  { $risk_label = 'SAFE';           $risk_color = 'green'; }


// HTTPS DETECTION

$protocol = strtolower($data['protocol'] ?? '');
if (empty($protocol)) {
    $parsed_url = parse_url($url);
    $protocol   = strtolower($parsed_url['scheme'] ?? '');
}

if (in_array($protocol, ['file', 'chrome', 'chrome-extension', 'about', 'data', ''])) {
    $https       = null;
    $https_label = 'N/A';
    $https_risk  = 'green';
} elseif ($protocol === 'https') {
    $https       = true;
    $https_label = 'Secure (HTTPS)';
    $https_risk  = 'green';
} else {
    $https       = false;
    $https_label = 'Insecure (HTTP)';
    $https_risk  = 'red';
}


// RESPONSE

echo json_encode([
    'status'           => 'done',
    'risk_score'       => $score,
    'scam_type'        => $ai_data['scam_type'] ?? 'None',
    'reasons'          => $ai_data['reasons']   ?? [],
    'detection_method' => $used_fallback ? 'keyword' : 'ai',
    'domain_info'      => [
        'age'          => $age_str,
        'age_risk'     => $age_risk,
        'privacy'      => $privacy_str,
        'privacy_risk' => $privacy_risk,
        'https'        => $https,
        'https_label'  => $https_label,
        'https_risk'   => $https_risk,
        'risk_label'   => $risk_label,
        'risk_color'   => $risk_color
    ]
]);