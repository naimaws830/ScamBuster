<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

define('OPENROUTER_API_KEY', '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');  // ← your real key

// Simulate exactly what scan.php sends
$test_prompt = 'Analyze this webpage for investment scams. Page URL: https://test-scam.com | Page Title: Get Rich Quick | Page Text: guaranteed profit 500% ROI daily returns join now limited slots act now guaranteed income | Return ONLY raw JSON: {"risk_score": <0-100>, "scam_type": "<type>", "reasons": ["<reason>"]}';

$payload = [
    "model"       => "openrouter/free",
    "messages"    => [
        [
            "role"    => "system",
            "content" => "You are a JSON-only responder. You MUST output valid JSON and nothing else. No markdown, no code fences, no explanation. Start your response with { and end with }."
        ],
        [
            "role"    => "user",
            "content" => $test_prompt
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
        "Authorization: Bearer " . OPENROUTER_API_KEY,
        "Content-Type: application/json",
        "HTTP-Referer: https://scambuster.ai",
        "X-Title: ScamBuster AI"
    ]
]);
$raw  = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$decoded = json_decode($raw, true);
$text    = $decoded['choices'][0]['message']['content'] ?? null;

// Try parsing
$parsed = null;
if ($text) {
    $clean = preg_replace('/^```(?:json)?\s*/i', '', trim($text));
    $clean = preg_replace('/\s*```$/i', '', $clean);
    $parsed = json_decode(trim($clean), true);
    if (!$parsed) {
        preg_match('/\{.*\}/s', $clean, $m);
        if ($m) $parsed = json_decode($m[0], true);
    }
}

echo json_encode([
    "1_http_code"    => $http,
    "2_model_used"   => $decoded['model'] ?? null,
    "3_raw_content"  => $text ?? 'NO CONTENT',
    "4_parsed"       => $parsed,
    "5_parse_ok"     => $parsed !== null ? "✅ AI working" : "❌ Parse failed — will use keyword fallback",
    "6_api_error"    => $decoded['error'] ?? null,
], JSON_PRETTY_PRINT);