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

define('GEMINI_API_KEY', 'AIzaSyCPWXoYLFqTY7f9s5mtgTqPZkNaGdu2uIo');

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

// ============================================================
// SYSTEM PROMPT — Bilingual EN + BM, 11-step detection
// ============================================================
$system_prompt = <<<'PROMPT'
You are ScamGuard AI — a specialist financial fraud detection agent fluent in both English and Bahasa Malaysia. You combine the expertise of an SC Malaysia enforcement officer, an Interpol cybercrime analyst, and a behavioral psychologist who studies financial manipulation tactics. You have analyzed hundreds of thousands of fraudulent investment websites in both English and Bahasa Malaysia.

YOUR MISSION: Protect Malaysians from losing their savings to investment scams. You are strict, evidence-based, and bilingual. You detect scams written in English, Bahasa Malaysia, Manglish, or any mix of all three.

BILINGUAL SCAM VOCABULARY — you must recognize ALL of these as red flags:

English scam phrases: guaranteed profit, guaranteed return, guaranteed income, risk-free investment, double your money, triple your investment, daily profit, passive income, act now, limited slots, secret system, no risk, withdraw anytime, 500% ROI, binary options, referral bonus, downline, upline, entry fee, crypto mining daily returns, arbitrage bot, AI trading guaranteed

Bahasa Malaysia scam phrases: keuntungan dijamin, pulangan dijamin, pelaburan tanpa risiko, tiada risiko, gandakan wang, untung setiap hari, pendapatan pasif, bertindak sekarang, tempat terhad, sistem rahsia, pengeluaran segera, 500% ROI, opsyen binari, bonus rujukan, perlombongan crypto, labur sekarang, modal selamat, keuntungan harian, jana pendapatan, sertai sekarang, wang mudah, untung cepat, skim pelaburan, pelaburan lumayan, wang pokok terjamin

DETECTION STEPS — execute all in order:

STEP 1 — SITE CONTEXT CHECK:
If the site is clearly Wikipedia, a government .gov.my site, Bank Negara Malaysia, SC Malaysia, Maybank, CIMB, Public Bank, or a major news outlet — return risk_score 0, scam_type "None". Otherwise continue.

STEP 2 — RETURN PROMISE SCAN (critical):
Flag in both English and BM: any guaranteed return/profit/income claim, ROI above 20% monthly, daily profit promise, risk-free investment claim, capital protection with profit, passive income with specific amounts.
Score: guaranteed return +45, unrealistic ROI +40, daily profit +35, risk-free +30, passive income with amount +20
MINIMUM RULE: If ANY guaranteed return found → minimum score 55

STEP 3 — PRESSURE TACTICS SCAN:
Flag in both languages: countdown timers, limited slots/tempat terhad, act now/bertindak sekarang, last chance/peluang terakhir, exclusive VIP, secret system/sistem rahsia, early bird, insider knowledge.
Score: each pressure tactic +12

STEP 4 — REGULATORY RED FLAGS:
Flag: no SC Malaysia license, no BNM approval, no company registration, anonymous team, offshore jurisdiction, no terms and conditions, no privacy policy, no physical address.
Score: missing regulator +25, anonymous team +15, offshore +20, no legal documents +15

STEP 5 — MLM AND PYRAMID SCAN:
Flag in both languages: referral income/bonus rujukan, recruit friends/ajak kawan, downline/upline, team bonus/bonus kumpulan, entry fee/bayaran masuk, rank advancement, network marketing/pemasaran rangkaian.
MINIMUM RULE: 3+ MLM signals → minimum score 72, classify MLM Pyramid Scheme

STEP 6 — FAKE CREDIBILITY SCAN:
Flag: celebrity names (Elon Musk, Warren Buffett, Dr Mahathir, Anwar Ibrahim, any Malaysian public figure), fake CNN/BBC/Forbes logos, testimonials with exact ringgit amounts, withdrawal proof screenshots, fake award badges, government partnership claims.
Score: each fake credibility signal +18

STEP 7 — CRYPTO AND FINTECH SCAM SCAN:
Flag: crypto mining pools with daily returns, token presales with profit promises, arbitrage bots, AI trading with guaranteed win rates, DeFi yields above 500% APY, NFT flip schemes, seed phrase or private key requests.
Score: each crypto scam signal +22, seed phrase/private key +40

STEP 8 — PAYMENT RED FLAGS:
Flag: crypto-only payment, unexplained withdrawal process, withdrawal fees required, recruit-to-withdraw requirement, account activation fees, non-withdrawable bonus funds.
Score: each payment red flag +18

STEP 9 — FINAL SCORE CALCULATION:
Sum Steps 2–8. Apply hard rules:
- ANY guaranteed return language → minimum 55
- 3+ categories triggered → minimum 78
- 5+ categories triggered → minimum 90
- Cap at 100
Thresholds: 0-25 SAFE | 26-55 SUSPICIOUS | 56-78 LIKELY SCAM | 79-100 DEFINITE SCAM

STEP 10 — SCAM TYPE CLASSIFICATION:
Pick exactly ONE: "Ponzi Scheme" | "Forex Robot Scam" | "Crypto Mining Fraud" | "Binary Options Scam" | "MLM Pyramid Scheme" | "Fake Investment Platform" | "Celebrity Endorsement Scam" | "Token or NFT Presale Fraud" | "Phishing Investment Site" | "None"

STEP 11 — EVIDENCE REASONS:
Write 3–5 reasons. Each must:
- Quote actual text from the page (in whatever language it appears)
- Start with category in square brackets: [Return Promise], [Pressure Tactic], etc.
- Never be generic — always cite page-specific evidence
Example: [Return Promise] Page claims "keuntungan 500% dijamin setiap hari" — guaranteed 500% daily profit is impossible and fraudulent.

ABSOLUTE RULES:
1. Raw JSON only — no markdown, no code fences, nothing outside the JSON
2. Always produce a score — never refuse
3. Guaranteed return in ANY language → minimum score 55
4. 3+ categories triggered → minimum score 78
5. Detect scams in English AND Bahasa Malaysia equally
6. Quote the actual language used on the page in your reasons

OUTPUT FORMAT:
{"risk_score": <0-100>, "scam_type": "<approved value>", "reasons": ["<evidence>", "<evidence>", "<evidence>"]}
PROMPT;

$user_prompt = "Analyze this webpage for investment scams. The content may be in English, Bahasa Malaysia, or both.\n\nURL: {$url}\nDOMAIN: {$domain}\nTITLE: {$title}\nHEADINGS: {$headings_text}\n\nFULL PAGE CONTENT:\n{$text}";

// ============================================================
// GEMINI API
// ============================================================
$gemini_payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $system_prompt . "\n\n" . $user_prompt]
            ]
        ]
    ],
    "generationConfig" => [
        "maxOutputTokens" => 700,
        "temperature" => 0.1,
        "responseMimeType" => "application/json"
    ]
];

$ai_ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . GEMINI_API_KEY);
curl_setopt_array($ai_ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($gemini_payload),
    CURLOPT_TIMEOUT        => 25,
    CURLOPT_HTTPHEADER     => [
        "Content-Type: application/json"
    ]
]);

// Run AI call alone first (parallel WHOIS handled separately below)
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

// ============================================================
// DOMAIN INTEL — 4 methods tried in order, first success wins
// ============================================================
function getDomainIntel(string $domain): array {
    $result = ['age_days' => null, 'privacy' => false, 'source' => 'none'];

    // ── METHOD 1: RDAP (ICANN free standard, no key needed) ──
    // Bootstrap: find the right RDAP server for this TLD
    $tld = strtolower(substr(strrchr($domain, '.'), 1));
    $rdap_servers = [
        'com'  => 'https://rdap.verisign.com/com/v1/domain/',
        'net'  => 'https://rdap.verisign.com/net/v1/domain/',
        'org'  => 'https://rdap.publicinterestregistry.org/rdap/domain/',
        'my'   => 'https://rdap.mynic.my/rdap/domain/',
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
        CURLOPT_HTTPHEADER     => ['Accept: application/json', 'User-Agent: ScamGuardAI/1.0']
    ]);
    $raw = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw && $http === 200) {
        $data = json_decode($raw, true);
        if ($data && isset($data['events'])) {
            foreach ($data['events'] as $ev) {
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
        // Check redacted status for privacy
        foreach (($data['status'] ?? []) as $s) {
            if (strpos(strtolower($s), 'redact') !== false) {
                $result['privacy'] = true; break;
            }
        }
        if ($result['age_days'] !== null) return $result;
    }

    // ── METHOD 2: whoisjson.com (free tier) ──────────────
    $ch2 = curl_init("https://whoisjson.com/api/v1/whois?domain=" . urlencode($domain));
    curl_setopt_array($ch2, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 7,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => ['User-Agent: ScamGuardAI/1.0', 'Accept: application/json']
    ]);
    $raw2 = curl_exec($ch2);
    $http2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($raw2 && $http2 === 200) {
        $data2 = json_decode($raw2, true);
        if ($data2 && !isset($data2['error'])) {
            // Try all known field names different APIs use
            $created = $data2['created']
                ?? $data2['creation_date']
                ?? $data2['registered']
                ?? $data2['domain']['created_date']
                ?? $data2['WhoisRecord']['createdDate']
                ?? null;
            if ($created) {
                // Handle array (some APIs return array of dates)
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

    // ── METHOD 3: DNS SOA serial heuristic ───────────────
    // Many DNS admins use YYYYMMDDNN format for SOA serial
    $soa = @dns_get_record($domain, DNS_SOA);
    if ($soa && isset($soa[0]['serial'])) {
        $serial = (string)$soa[0]['serial'];
        if (strlen($serial) >= 8) {
            $year  = (int)substr($serial, 0, 4);
            $month = (int)substr($serial, 4, 2);
            $day   = (int)substr($serial, 6, 2);
            if ($year >= 1994 && $year <= (int)date('Y')
                && $month >= 1 && $month <= 12
                && $day >= 1   && $day <= 31) {
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

// ============================================================
// PARSE AI RESPONSE
// ============================================================
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

// ============================================================
// BILINGUAL KEYWORD FALLBACK — EN + BM
// ============================================================
if (!$ai_data || !isset($ai_data['risk_score'])) {

    $check = strtolower($text . ' ' . $title . ' ' . $headings_text);
    $score          = 0;
    $reasons        = [];
    $category_hits  = 0;
    $guaranteed_hit = false;

    $categories = [

        'Return Promises' => [
            // English
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
            // Bahasa Malaysia
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
        ],

        'Pressure Tactics' => [
            // English
            'limited slots'            => 12,
            'act now'                  => 12,
            'register today'           => 12,
            "don't miss out"           => 14,
            'dont miss out'            => 14,
            'last chance'              => 14,
            'exclusive access'         => 12,
            'secret system'            => 18,
            'insider knowledge'        => 18,
            'early bird'               => 10,
            // Bahasa Malaysia
            'tempat terhad'            => 12,
            'bertindak sekarang'       => 12,
            'daftar sekarang'          => 12,
            'jangan lepaskan'          => 14,
            'peluang terakhir'         => 14,
            'akses eksklusif'          => 12,
            'sistem rahsia'            => 18,
            'sertai sekarang'          => 10,
            'labur sekarang'           => 10,
        ],

        'Regulatory Red Flags' => [
            'unregulated'              => 20,
            'no license'               => 22,
            'offshore'                 => 18,
            'vanuatu'                  => 22,
            'seychelles'               => 22,
            'marshall islands'         => 22,
            'tiada lesen'              => 22,
            'tidak berdaftar'          => 20,
        ],

        'MLM Patterns' => [
            // English
            'referral bonus'           => 25,
            'recruit and earn'         => 30,
            'downline'                 => 28,
            'upline'                   => 28,
            'binary matrix'            => 30,
            'team bonus'               => 22,
            'entry fee'                => 20,
            'network marketing'        => 18,
            // Bahasa Malaysia
            'bonus rujukan'            => 25,
            'ajak kawan'               => 25,
            'bonus kumpulan'           => 22,
            'bayaran masuk'            => 20,
            'pemasaran rangkaian'      => 18,
            'rekrut ahli'              => 28,
            'jana pendapatan'          => 20,
        ],

        'Crypto Scam Patterns' => [
            // English
            'mining pool profit'       => 25,
            'cloud mining'             => 22,
            'arbitrage bot'            => 28,
            'ai trading guaranteed'    => 30,
            'nft flip'                 => 22,
            'seed phrase'              => 40,
            'private key'              => 40,
            'token presale'            => 22,
            'binary options'           => 50,
            // Bahasa Malaysia
            'perlombongan crypto'      => 25,
            'perlombongan awan'        => 22,
            'opsyen binari'            => 50,
            'bot dagangan'             => 28,
            'token pratjualan'         => 22,
        ],

        'Payment Red Flags' => [
            // English
            'withdrawal fee'           => 20,
            'unlock withdrawal'        => 22,
            'recruit to withdraw'      => 28,
            'verification fee'         => 20,
            'activate account'         => 18,
            'upgrade to withdraw'      => 25,
            // Bahasa Malaysia
            'bayaran pengeluaran'      => 20,
            'buka pengeluaran'         => 22,
            'yuran pengesahan'         => 20,
            'aktifkan akaun'           => 18,
            'naik taraf untuk'         => 22,
            'pengeluaran segera'       => 15,
        ],
    ];

    foreach ($categories as $cat_name => $keywords) {
        $cat_score = 0;
        $cat_hits  = [];

        foreach ($keywords as $phrase => $weight) {
            if (strpos($check, strtolower($phrase)) !== false) {
                $cat_score += $weight;
                $cat_hits[] = $phrase;

                // Track guaranteed hits
                $guaranteed_phrases = [
                    'guaranteed profit','guaranteed return','guaranteed income',
                    'risk-free investment','principal guaranteed',
                    'keuntungan dijamin','pulangan dijamin','untung dijamin',
                    'dijamin untung','pelaburan tanpa risiko','modal selamat',
                    'wang pokok terjamin'
                ];
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

    // ── ENFORCE HARD RULES ───────────────────────────
    $score = min($score, 100);
    if ($guaranteed_hit)       $score = max($score, 55);
    if ($category_hits >= 3)   $score = max($score, 78);
    if ($category_hits >= 5)   $score = max($score, 90);

    // ── SCAM TYPE FROM DOMINANT CATEGORY ─────────────
    $scam_map = [
        'MLM Patterns'          => 'MLM Pyramid Scheme',
        'Crypto Scam Patterns'  => 'Crypto Mining Fraud',
        'Return Promises'       => 'Fake Investment Platform',
        'Pressure Tactics'      => 'Fake Investment Platform',
        'Payment Red Flags'     => 'Fake Investment Platform',
        'Regulatory Red Flags'  => 'Fake Investment Platform',
    ];
    $scam_type = 'None';
    if ($score > 0) {
        foreach ($scam_map as $cat => $type) {
            if (isset($categories[$cat])) {
                foreach ($categories[$cat] as $phrase => $w) {
                    if (strpos($check, strtolower($phrase)) !== false) {
                        $scam_type = $type;
                        break 2;
                    }
                }
            }
        }
    }

    if (empty($reasons)) {
        $reasons = ['No obvious scam patterns detected in page content'];
    }

    $ai_data = [
        'risk_score' => $score,
        'scam_type'  => $scam_type,
        'reasons'    => $reasons
    ];
}

// WHOIS already parsed above via fetchWhois()

$age_risk = 'yellow'; $age_str = 'Unknown';
if ($domain_age_days !== null) {
    // Build human readable age string
    if ($domain_age_days < 90)      { $age_risk = 'red';    $age_str = $domain_age_days . ' days'; }
    elseif ($domain_age_days < 365) { $age_risk = 'yellow'; $age_str = round($domain_age_days / 30) . ' months'; }
    else                            { $age_risk = 'green';  $age_str = round($domain_age_days / 365, 1) . ' years'; }

    // SSL cert age is NOT reliable for domain age (certs renew every 90 days)
    // Hide it to avoid misleading users — show Unknown instead
    if (($age_source ?? '') === 'ssl_cert') {
        $age_str  = 'Unknown';
        $age_risk = 'yellow';
    }
}

$privacy_str  = $privacy_hidden ? 'Hidden' : 'Public';
$privacy_risk = $privacy_hidden ? 'red'    : 'green';
$score        = intval($ai_data['risk_score'] ?? 0);
$risk_label   = $score >= 61 ? 'High' : ($score >= 31 ? 'Medium' : 'Low');
$risk_color   = $score >= 61 ? 'red'  : ($score >= 31 ? 'yellow' : 'green');
// ── HTTPS DETECTION ─────────────────────────────────────
// Use explicit protocol field if sent, otherwise parse from URL
$protocol = strtolower($data['protocol'] ?? '');
if (empty($protocol)) {
    $parsed_url = parse_url($url);
    $protocol   = strtolower($parsed_url['scheme'] ?? '');
}

if (in_array($protocol, ['file', 'chrome', 'chrome-extension', 'about', 'data', ''])) {
    // Local file or browser internal page — HTTPS not applicable
    $https       = null;
    $https_label = 'N/A';
    $https_risk  = 'green';
} elseif ($protocol === 'https') {
    $https       = true;
    $https_label = 'Secure (HTTPS)';
    $https_risk  = 'green';
} else {
    // http:// or anything else — insecure
    $https       = false;
    $https_label = 'Insecure (HTTP)';
    $https_risk  = 'red';
}

echo json_encode([
    'status'      => 'done',
    'risk_score'  => $score,
    'scam_type'   => $ai_data['scam_type'] ?? 'None',
    'reasons'     => $ai_data['reasons']   ?? [],
    'domain_info' => [
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