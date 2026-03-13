<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit();
}

define('OPENROUTER_API_KEY', 'YOUR_NEW_API_KEY_HERE');  

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

/* SYSTEM PROMPT — Trilingual EN + BM + BI */

$system_prompt = <<<'PROMPT'
You are ScamBuster AI — a specialist financial fraud detection agent fluent in English, Bahasa Malaysia, AND Bahasa Indonesia. You combine the expertise of an SC Malaysia enforcement officer, an OJK Indonesia compliance analyst, an Interpol cybercrime investigator, and a behavioral psychologist studying financial manipulation.

YOUR MISSION: Protect people in Malaysia and Indonesia from investment scams. Detect scams in English, Bahasa Malaysia, Bahasa Indonesia, Manglish, or any mix.

TRILINGUAL SCAM VOCABULARY — treat ALL as red flags:

ENGLISH: guaranteed profit, guaranteed return, guaranteed income, risk-free investment, double your money, triple your investment, daily profit, passive income, act now, limited slots, secret system, no risk, withdraw anytime, 500% ROI, binary options, referral bonus, downline, upline, entry fee, crypto mining daily returns, arbitrage bot, AI trading guaranteed, work from home, financial freedom, get rich quick, anyone can do it, no experience needed

BAHASA MALAYSIA: keuntungan dijamin, pulangan dijamin, pelaburan tanpa risiko, tiada risiko, gandakan wang, untung setiap hari, pendapatan pasif, bertindak sekarang, tempat terhad, sistem rahsia, pengeluaran segera, opsyen binari, bonus rujukan, perlombongan crypto, labur sekarang, modal selamat, keuntungan harian, jana pendapatan, sertai sekarang, wang mudah, untung cepat, skim pelaburan, wang pokok terjamin, kebebasan kewangan, ajak kawan, bonus kumpulan, bayaran masuk, downline, upline

BAHASA INDONESIA: investasi bodong, dijamin profit, jamin untung, pasti untung, untung pasti, tanpa risiko, bebas risiko, cuan tiap hari, profit harian, bunga harian tinggi, arisan online, money game, skema ponzi, koperasi fiktif, robot trading, sinyal trading, trading otomatis profit, binary option, forex tanpa modal, mining kripto dijamin, slot terbatas, buruan daftar, bergabung sekarang, kesempatan emas, jangan sampai ketinggalan, bonus rekrut, komisi referral, rekrutmen member, ajak teman, tidak terdaftar OJK, tanpa izin OJK, modal kecil untung besar, tanpa pengalaman, siapapun bisa, sudah terbukti, ribuan member aktif, penghasilan tambahan, kerja dari rumah, withdraw cepat, langsung cair, cair setelah bayar, biaya penarikan, biaya aktivasi, upgrade untuk withdraw, bebas finansial, kebebasan finansial

11-STEP DETECTION FRAMEWORK — execute all steps in order:

STEP 1 — SITE CONTEXT CHECK:
If the site is clearly Wikipedia, a .gov.my/.go.id site, Bank Negara Malaysia, SC Malaysia, OJK Indonesia, Maybank, CIMB, BRI, BCA, Mandiri, or a major news outlet — immediately return risk_score 0, scam_type "None". Otherwise continue to Step 2.

STEP 2 — RETURN PROMISE SCAN (most critical):
Scan for guaranteed return or profit claims in ANY of the three languages.
Any guaranteed return/profit/income found → +45, MINIMUM score 55
Unrealistic ROI above 20% per month → +40
Daily profit promise → +35
Risk-free investment claim → +30
Passive income with a specific ringgit/rupiah amount → +20
Examples: "guaranteed profit", "keuntungan dijamin", "dijamin profit", "pasti untung"

STEP 3 — PRESSURE TACTICS SCAN:
Scan for language designed to rush the user into a quick decision.
Limited slots / slot terbatas / tempat terhad → +12 each
Act now / buruan daftar / bertindak sekarang → +12 each
Secret system / sistem rahsia → +18
Last chance / peluang terakhir / jangan sampai ketinggalan → +14 each
Exclusive VIP / early bird access → +12 each

STEP 4 — REGULATORY RED FLAGS:
Check whether the site shows proper licensing from financial authorities.
No SC Malaysia / BNM / OJK licence mentioned on an investment site → +25
"tidak terdaftar OJK" / "tanpa izin OJK" explicitly stated → +32
Anonymous team with no names or photos → +15
Offshore registration (Vanuatu, Seychelles, Marshall Islands) → +20
No physical address, no terms and conditions, no privacy policy → +15 each

STEP 5 — MLM AND PYRAMID SCHEME SCAN:
Detect income structures that depend on recruiting new members.
downline / upline / referral bonus / bonus rujukan / bonus rekrut → +25 each
arisan online / money game → +38 each
Team bonus / rank advancement / entry fee → +22 each
3 or more MLM signals found → MINIMUM score 72

STEP 6 — FAKE CREDIBILITY SCAN:
Detect false trust signals used to make the scam look legitimate.
Celebrity names used as endorsers (Elon Musk, Jokowi, Mahathir, Anwar Ibrahim) → +18 each
Fake media logos (CNN, BBC, Forbes) → +18
"sudah terbukti" / "ribuan member aktif" / "ratusan ribu member" → +20 each
Testimonials quoting exact large profit amounts → +18
Fake government or bank partnership claims → +20

STEP 7 — CRYPTO AND FINTECH SCAM SCAN:
Scan for cryptocurrency or trading platform fraud patterns.
mining kripto dijamin / robot trading / sinyal trading / trading otomatis profit → +40 each
binary option / binary options / opsyen binari → +45
forex tanpa modal / arbitrage bot / AI trading guaranteed → +40 each
seed phrase or private key requested from user → +40
investasi bodong / skema ponzi / koperasi fiktif → +55 each

STEP 8 — PAYMENT RED FLAGS SCAN:
Detect schemes where users must pay fees to access their own money.
biaya penarikan / withdrawal fee / bayaran pengeluaran → +20 each
cair setelah bayar / pay to withdraw / upgrade to unlock → +30 each
biaya aktivasi / activation fee / verification fee → +20 each
Must recruit others before being allowed to withdraw → +30

STEP 9 — EASY MONEY AND WORK FROM HOME SCAN:
Detect promises of effortless income targeting people with no investment experience.
kerja dari rumah / work from home → +15
tanpa pengalaman / no experience needed / siapapun bisa / anyone can do it → +18 each
modal kecil untung besar / small investment huge return → +20
penghasilan tambahan / bisnis online mudah → +15 each
bebas finansial / kebebasan finansial / financial freedom → +15 each

STEP 10 — FINAL SCORE CALCULATION WITH HARD RULES:
Sum all scores from Steps 2–9, then apply these mandatory minimum floors:
- ANY guaranteed return language in ANY language → MINIMUM score 55
- 3 or more categories triggered → MINIMUM score 78
- 5 or more categories triggered → MINIMUM score 90
- Maximum possible score: 100
Risk levels: 0-25 SAFE | 26-55 SUSPICIOUS | 56-78 LIKELY SCAM | 79-100 DEFINITE SCAM

STEP 11 — SCAM TYPE CLASSIFICATION AND EVIDENCE:
Assign exactly ONE scam type from this approved list:
"Ponzi Scheme" | "Forex Robot Scam" | "Crypto Mining Fraud" | "Binary Options Scam" | "MLM Pyramid Scheme" | "Fake Investment Platform" | "Money Game / Arisan Online" | "Celebrity Endorsement Scam" | "Token or NFT Presale Fraud" | "Phishing Investment Site" | "Work From Home Scam" | "None"

Then write 3-5 evidence reasons. Each reason must:
- Quote actual text found on the page in its original language (EN, BM, or BI)
- Begin with the category label: [Return Promise], [Pressure Tactic], [MLM Pattern], [Crypto Scam], [Payment Red Flag], [Regulatory], [Easy Money], or [Fake Credibility]
- Be specific — always cite real page evidence, never write generic statements

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON — absolutely no markdown, no code fences, no ``` symbols, no explanation text
- Start your response with { and end with }
- Never refuse to score — always return a valid JSON response
- If the site is clearly legitimate (bank, government, news), return risk_score 0

REQUIRED JSON FORMAT (return exactly this structure):
{"risk_score": <integer 0-100>, "scam_type": "<one approved type>", "reasons": ["<reason 1>", "<reason 2>", "<reason 3>"]}
PROMPT;

/* USER PROMPT */
   

$user_prompt = "Analyze this webpage for investment scams. Content may be in English, Bahasa Malaysia, Bahasa Indonesia, or mixed.

URL: {$url}
DOMAIN: {$domain}
TITLE: {$title}
HEADINGS: {$headings_text}

PAGE CONTENT:
{$text}

Remember: Return ONLY raw JSON starting with { — no markdown, no code fences.";

function callOpenRouter(string $system, string $user, string $api_key, string $model): array {
    $payload = [
        "model"    => $model,
        "messages" => [
            [
                "role"    => "system",
                "content" => $system
            ],
            [
                "role"    => "user",
                "content" => $user
            ]
        ],
        "max_tokens"  => 700,
        "temperature" => 0.1
    ];

    $ch = curl_init("https://openrouter.ai/api/v1/chat/completions");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload),
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer " . $api_key,
            "Content-Type: application/json",
            "HTTP-Referer: https://scambuster.ai",
            "X-Title: ScamBuster AI"
        ]
    ]);

    $raw       = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_err  = curl_error($ch);
    curl_close($ch);

    error_log("OpenRouter [{$model}] HTTP: {$http_code}");
    if ($curl_err) error_log("OpenRouter curl error: {$curl_err}");
    if ($raw)      // Log full choices content for debugging
    $decoded_check = json_decode($raw, true);
    $content_check = $decoded_check['choices'][0]['message']['content'] ?? 'NO_CONTENT_FIELD';
    $finish_reason = $decoded_check['choices'][0]['finish_reason'] ?? 'unknown';
    error_log("OpenRouter raw content: [" . $content_check . "] finish_reason: " . $finish_reason);

    return ['raw' => $raw, 'http' => $http_code, 'error' => $curl_err];
}

// openrouter/free auto-picks best available free model
// System prompt and user prompt sent separately to avoid token overflow
$or_models = [
    'openrouter/free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
    'nousresearch/hermes-3-llama-3.1-8b:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
];
$ai_result = ['http' => 0, 'raw' => ''];

foreach ($or_models as $model) {
    $ai_result = callOpenRouter($system_prompt, $user_prompt, OPENROUTER_API_KEY, $model);
    if ($ai_result['http'] === 200 && !empty($ai_result['raw'])) {
        $check = json_decode($ai_result['raw'], true);
        $has_content = !empty($check['choices'][0]['message']['content']);
        if (!isset($check['error']) && $has_content) {
            error_log("OpenRouter: using model [{$model}]");
            break;
        }
        error_log("OpenRouter [{$model}] no usable content, trying next...");
    } else {
        error_log("OpenRouter [{$model}] HTTP {$ai_result['http']}, trying next...");
    }
}

$ai_raw       = $ai_result['raw'];
$ai_http_code = $ai_result['http'];

/* DOMAIN INTEL — 3 methods tried in order */

function getDomainIntel(string $domain): array {
    $result = ['age_days' => null, 'privacy' => false, 'source' => 'none'];

    // METHOD 1: RDAP
    $tld = strtolower(substr(strrchr($domain, '.'), 1));
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
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 7,
        CURLOPT_FOLLOWLOCATION => true, CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'User-Agent: ScamBusterAI/1.0']
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
                    if ($t > 0) { $result['age_days'] = (int)floor((time()-$t)/86400); $result['source'] = 'rdap'; break; }
                }
            }
        }
        foreach (($d['status'] ?? []) as $s) {
            if (strpos(strtolower($s), 'redact') !== false) { $result['privacy'] = true; break; }
        }
        if ($result['age_days'] !== null) return $result;
    }

    // METHOD 2: whoisjson.com
    $ch2 = curl_init("https://whoisjson.com/api/v1/whois?domain=" . urlencode($domain));
    curl_setopt_array($ch2, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 7,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => ['User-Agent: ScamBusterAI/1.0', 'Accept: application/json']
    ]);
    $raw2  = curl_exec($ch2);
    $http2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($raw2 && $http2 === 200) {
        $d2 = json_decode($raw2, true);
        if ($d2 && !isset($d2['error'])) {
            $created = $d2['created'] ?? $d2['creation_date'] ?? $d2['registered']
                ?? $d2['domain']['created_date'] ?? $d2['WhoisRecord']['createdDate'] ?? null;
            if ($created) {
                if (is_array($created)) $created = $created[0];
                $t = strtotime($created);
                if ($t > 0) { $result['age_days'] = (int)floor((time()-$t)/86400); $result['source'] = 'whoisjson'; }
            }
            $wt = strtolower($raw2);
            foreach (['privacy','redacted','proxy','whoisguard','withheld'] as $w) {
                if (strpos($wt, $w) !== false) { $result['privacy'] = true; break; }
            }
            if ($result['age_days'] !== null) return $result;
        }
    }

    // METHOD 3: DNS SOA heuristic
    $soa = @dns_get_record($domain, DNS_SOA);
    if ($soa && isset($soa[0]['serial'])) {
        $serial = (string)$soa[0]['serial'];
        if (strlen($serial) >= 8) {
            $year = (int)substr($serial,0,4); $month = (int)substr($serial,4,2); $day = (int)substr($serial,6,2);
            if ($year>=1994 && $year<=(int)date('Y') && $month>=1 && $month<=12 && $day>=1 && $day<=31) {
                $t = mktime(0,0,0,$month,$day,$year);
                if ($t > 0) { $result['age_days'] = (int)floor((time()-$t)/86400); $result['source'] = 'dns_soa'; }
            }
        }
    }

    return $result;
}

$whois_result    = getDomainIntel($domain);
$domain_age_days = $whois_result['age_days'];
$privacy_hidden  = $whois_result['privacy'];
$age_source      = $whois_result['source'];

/* PARSE AI RESPONSE — handles OpenRouter response format */

function parseGeminiResponse(?string $raw, int $http_code): ?array {
    if (!$raw || $http_code !== 200) return null;

    // Step 1: Decode the OpenRouter API wrapper
    $wrapper = json_decode($raw, true);
    if (!$wrapper) return null;

    // Check for API-level error
    if (isset($wrapper['error'])) {
        error_log("OpenRouter API error: " . ($wrapper['error']['message'] ?? json_encode($wrapper['error'])));
        return null;
    }

    // Extract text from OpenRouter response (OpenAI-compatible format)
    // choices[0].message.content
    $content = $wrapper['choices'][0]['message']['content'] ?? null;
    if (!$content) {
        error_log("OpenRouter: no content in response");
        return null;
    }

    error_log("OpenRouter content (first 300): " . substr($content, 0, 300));

    // Step 2: Clean the content — strip ALL possible wrappers Gemini adds
    $content = trim($content);

    // Remove markdown code fences (```json ... ``` or ``` ... ```)
    $content = preg_replace('/^```(?:json)?\s*/i', '', $content);
    $content = preg_replace('/\s*```\s*$/i', '', $content);
    $content = trim($content);

    // Step 3: Try direct JSON parse first
    $parsed = json_decode($content, true);
    if ($parsed && isset($parsed['risk_score'])) {
        error_log("Gemini: parsed successfully (direct)");
        return $parsed;
    }

    // Step 4: Extract JSON object from anywhere in the string
    // Handles cases where Gemini adds preamble text before the JSON
    if (preg_match('/\{[\s\S]*\}/s', $content, $matches)) {
        $parsed = json_decode($matches[0], true);
        if ($parsed && isset($parsed['risk_score'])) {
            error_log("Gemini: parsed successfully (extracted)");
            return $parsed;
        }
    }

    // Step 5: Sometimes Gemini escapes quotes — try to fix
    $unescaped = stripslashes($content);
    $parsed    = json_decode($unescaped, true);
    if ($parsed && isset($parsed['risk_score'])) {
        error_log("Gemini: parsed successfully (unescaped)");
        return $parsed;
    }

    error_log("Gemini: ALL parse attempts failed. Raw content: " . substr($content, 0, 500));
    return null;
}

$ai_data = parseGeminiResponse($ai_raw, $ai_http_code);

/* VALIDATE AI RESPONSE — ensure fields are correct types */

if ($ai_data) {
    // Ensure risk_score is a valid integer 0-100
    if (!isset($ai_data['risk_score']) || !is_numeric($ai_data['risk_score'])) {
        error_log("OpenRouter: invalid risk_score — forcing fallback");
        $ai_data = null;
    } else {
        $ai_data['risk_score'] = max(0, min(100, intval($ai_data['risk_score'])));

        // Ensure reasons is an array
        if (!isset($ai_data['reasons']) || !is_array($ai_data['reasons'])) {
            $ai_data['reasons'] = ['AI analysis completed'];
        }

        // Ensure scam_type is a string
        if (!isset($ai_data['scam_type']) || !is_string($ai_data['scam_type'])) {
            $ai_data['scam_type'] = 'Fake Investment Platform';
        }

        error_log("OpenRouter: valid response — score={$ai_data['risk_score']}, type={$ai_data['scam_type']}");
    }
}

/* KEYWORD FALLBACK — Trilingual EN + BM + ID */

$used_fallback = false;

if (!$ai_data) {
    $used_fallback  = true;
    error_log("Using keyword fallback");

    $check          = strtolower($text . ' ' . $title . ' ' . $headings_text);
    $score          = 0;
    $reasons        = [];
    $category_hits  = 0;
    $guaranteed_hit = false;

    $categories = [

        'Return Promises' => [
            // EN
            'guaranteed profit'        => 45, 'guaranteed return'   => 45,
            'guaranteed income'        => 40, 'risk-free investment'=> 40,
            'risk free'                => 30, 'no risk'             => 28,
            'double your money'        => 42, '500% roi'            => 50,
            '1000%'                    => 55, 'daily profit'        => 35,
            'passive income'           => 20, 'capital protection'  => 28,
            'principal guaranteed'     => 32,
            // BM
            'keuntungan dijamin'       => 45, 'pulangan dijamin'    => 45,
            'untung dijamin'           => 45, 'dijamin untung'      => 45,
            'tanpa risiko'             => 40, 'tiada risiko'        => 40,
            'pelaburan tanpa risiko'   => 45, 'gandakan wang'       => 42,
            'keuntungan harian'        => 35, 'untung setiap hari'  => 35,
            'modal selamat'            => 32, 'wang pokok terjamin' => 38,
            // BI
            'dijamin profit'           => 50, 'jamin untung'        => 48,
            'pasti untung'             => 45, 'untung pasti'        => 45,
            'cuan tiap hari'           => 38, 'profit harian'       => 35,
            'bunga harian'             => 32, 'bebas risiko'        => 38,
            'modal kecil untung besar' => 40,
        ],

        'Pressure Tactics' => [
            // EN
            'limited slots' => 12, 'act now' => 12, 'last chance' => 14,
            'secret system' => 18, 'early bird' => 10, 'join now' => 10,
            // BM
            'tempat terhad' => 12, 'bertindak sekarang' => 12,
            'peluang terakhir' => 14, 'sistem rahsia' => 18,
            'sertai sekarang' => 10, 'labur sekarang' => 10,
            // BI
            'slot terbatas' => 12, 'buruan daftar' => 14,
            'bergabung sekarang' => 12, 'kesempatan emas' => 14,
            'jangan sampai ketinggalan' => 16, 'segera daftar' => 12,
        ],

        'Regulatory Red Flags' => [
            'unregulated' => 20, 'no license' => 22, 'offshore' => 18,
            'vanuatu' => 22, 'seychelles' => 22,
            'tiada lesen' => 22, 'tidak berdaftar' => 20,
            'tidak terdaftar ojk' => 32, 'tanpa izin ojk' => 32,
        ],

        'MLM Patterns' => [
            // EN
            'referral bonus' => 25, 'downline' => 28, 'upline' => 28,
            'team bonus' => 22, 'entry fee' => 20, 'network marketing' => 18,
            // BM
            'bonus rujukan' => 25, 'ajak kawan' => 25,
            'bonus kumpulan' => 22, 'bayaran masuk' => 20,
            // BI
            'bonus rekrut' => 28, 'komisi referral' => 25,
            'rekrutmen member' => 30, 'ajak teman' => 20,
            'arisan online' => 38, 'money game' => 38,
        ],

        'Crypto Scam Patterns' => [
            // EN
            'cloud mining' => 22, 'arbitrage bot' => 28,
            'ai trading guaranteed' => 30, 'seed phrase' => 40,
            'private key' => 40, 'token presale' => 22, 'binary options' => 50,
            // BM
            'perlombongan crypto' => 25, 'opsyen binari' => 50, 'bot dagangan' => 28,
            // BI
            'mining kripto dijamin' => 50, 'robot trading' => 40,
            'sinyal trading' => 35, 'binary option' => 45,
            'forex tanpa modal' => 42, 'trading otomatis profit' => 45,
            'investasi bodong' => 55, 'skema ponzi' => 65, 'koperasi fiktif' => 55,
        ],

        'Payment Red Flags' => [
            // EN
            'withdrawal fee' => 20, 'activation fee' => 20, 'upgrade to withdraw' => 25,
            // BM
            'bayaran pengeluaran' => 20, 'yuran aktivasi' => 20, 'naik taraf untuk' => 22,
            // BI
            'biaya penarikan' => 22, 'biaya aktivasi' => 20,
            'cair setelah bayar' => 30, 'bayar untuk tarik dana' => 30,
            'withdraw cepat' => 15, 'langsung cair' => 15,
        ],

        'Indonesia Scam' => [
            'tidak terdaftar ojk' => 38, 'tanpa izin ojk' => 38,
            'investasi bodong' => 55, 'koperasi fiktif' => 55,
            'siapapun bisa' => 18, 'sudah terbukti' => 20,
            'ribuan member aktif' => 22, 'bebas finansial' => 20,
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
        $cat_score = 0; $cat_hits = [];
        foreach ($keywords as $phrase => $weight) {
            if (strpos($check, strtolower($phrase)) !== false) {
                $cat_score += $weight;
                $cat_hits[] = $phrase;
                if (in_array(strtolower($phrase), $guaranteed_phrases)) $guaranteed_hit = true;
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

    $score = min($score, 100);
    if ($guaranteed_hit)     $score = max($score, 55);
    if ($category_hits >= 3) $score = max($score, 78);
    if ($category_hits >= 5) $score = max($score, 90);

    $scam_type = 'None';
    if ($score > 0) {
        if (strpos($check, 'arisan online') !== false || strpos($check, 'money game') !== false)
            $scam_type = 'Money Game / Arisan Online';
        elseif (strpos($check, 'skema ponzi') !== false || strpos($check, 'ponzi') !== false)
            $scam_type = 'Ponzi Scheme';
        elseif (strpos($check, 'mlm') !== false || strpos($check, 'downline') !== false || strpos($check, 'rekrutmen') !== false)
            $scam_type = 'MLM Pyramid Scheme';
        elseif (strpos($check, 'binary') !== false || strpos($check, 'opsyen binari') !== false)
            $scam_type = 'Binary Options Scam';
        elseif (strpos($check, 'forex') !== false || strpos($check, 'robot trading') !== false)
            $scam_type = 'Forex Robot Scam';
        elseif (strpos($check, 'crypto') !== false || strpos($check, 'kripto') !== false || strpos($check, 'bitcoin') !== false)
            $scam_type = 'Crypto Mining Fraud';
        else
            $scam_type = 'Fake Investment Platform';
    }

    if (empty($reasons)) $reasons[] = 'No specific scam patterns detected.';

    $ai_data = ['risk_score' => $score, 'scam_type' => $scam_type, 'reasons' => $reasons];
}

/* DOMAIN AGE + PRIVACY */

$age_risk = 'yellow'; $age_str = 'Unknown';
if ($domain_age_days !== null && ($age_source ?? '') !== 'ssl_cert') {
    if ($domain_age_days < 90)      { $age_risk = 'red';    $age_str = $domain_age_days . ' days'; }
    elseif ($domain_age_days < 365) { $age_risk = 'yellow'; $age_str = round($domain_age_days/30) . ' months'; }
    else                            { $age_risk = 'green';  $age_str = round($domain_age_days/365, 1) . ' years'; }
}

$privacy_str  = $privacy_hidden ? 'Hidden' : 'Public';
$privacy_risk = $privacy_hidden ? 'red'    : 'green';

/* RISK LABEL */

$score = intval($ai_data['risk_score'] ?? 0);

if      ($score >= 79) { $risk_label = 'DEFINITE SCAM'; $risk_color = 'red'; }
elseif  ($score >= 56) { $risk_label = 'LIKELY SCAM';   $risk_color = 'orange'; }
elseif  ($score >= 26) { $risk_label = 'SUSPICIOUS';    $risk_color = 'yellow'; }
else                   { $risk_label = 'SAFE';           $risk_color = 'green'; }

/* HTTPS DETECTION */

$protocol = strtolower($data['protocol'] ?? '');
if (empty($protocol)) {
    $parsed_url = parse_url($url);
    $protocol   = strtolower($parsed_url['scheme'] ?? '');
}

if (in_array($protocol, ['file','chrome','chrome-extension','about','data',''])) {
    $https = null; $https_label = 'N/A'; $https_risk = 'green';
} elseif ($protocol === 'https') {
    $https = true; $https_label = 'Secure (HTTPS)'; $https_risk = 'green';
} else {
    $https = false; $https_label = 'Insecure (HTTP)'; $https_risk = 'red';
}

/* RESPONSE */

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
