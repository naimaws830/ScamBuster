// ScamBuster - Content Script
// Extracts ALL readable content from the page

function extractFullPageContent() {

  const title = document.title || '';
  const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
  const metaKeys = document.querySelector('meta[name="keywords"]')?.content || '';
  const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
  const ogDesc = document.querySelector('meta[property="og:description"]')?.content || '';

  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
    .map(el => el.innerText.trim())
    .filter(t => t.length > 0)
    .join(' | ');

  const heroSelectors = ['hero', 'banner', 'header', 'intro', 'welcome', 'landing', 'top-section', 'main-banner', 'jumbotron', 'splash'];
  let heroText = '';
  heroSelectors.forEach(sel => {
    document.querySelectorAll(`[class*="${sel}"],[id*="${sel}"]`)
      .forEach(el => { heroText += ' ' + (el.innerText || ''); });
  });

  const ctaText = Array.from(document.querySelectorAll('button,a,.btn,.cta,[class*="button"]'))
    .map(el => el.innerText.trim())
    .filter(t => t.length > 1 && t.length < 100)
    .join(' | ');

  const testimonialSelectors = ['testimonial', 'review', 'feedback', 'testi', 'client', 'customer', 'success', 'proof'];
  let testimonialText = '';
  testimonialSelectors.forEach(sel => {
    document.querySelectorAll(`[class*="${sel}"],[id*="${sel}"]`)
      .forEach(el => { testimonialText += ' ' + (el.innerText || ''); });
  });

  const featureSelectors = ['feature', 'benefit', 'advantage', 'why-us', 'profit', 'earn', 'income', 'return', 'investment', 'package', 'plan', 'pricing', 'offer', 'bonus'];
  let featureText = '';
  featureSelectors.forEach(sel => {
    document.querySelectorAll(`[class*="${sel}"],[id*="${sel}"]`)
      .forEach(el => { featureText += ' ' + (el.innerText || ''); });
  });

  const paragraphs = Array.from(document.querySelectorAll('p, li, span, td'))
    .map(el => el.innerText?.trim() || '')
    .filter(t => t.length > 10 && t.length < 500)
    .filter((t, i, self) => self.indexOf(t) === i)
    .join(' ');

  const footerText = Array.from(document.querySelectorAll('footer,[class*="footer"]'))
    .map(el => el.innerText.trim()).join(' ');

  const fullBodyText = document.body?.innerText || '';

  const combined = [
    title, ogTitle, ogDesc, metaDesc, metaKeys,
    headings, heroText, ctaText, testimonialText,
    featureText, paragraphs, footerText
  ].map(s => s.trim()).filter(s => s.length > 0).join('\n\n');

  const finalText = combined.length > 100 ? combined : fullBodyText;

  const cleaned = finalText
    .replace(/\s{3,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 4000);

  return {
    title: title.substring(0, 200),
    url: window.location.href,
    domain: window.location.hostname,
    text: cleaned,
    headings: headings.substring(0, 600)
  };
}

// ── TRIGGER KEYWORDS ─────────────────────────────────
// English + Bahasa Malaysia — must match to auto-scan
const TRIGGER_KEYWORDS = [
  // English
  'invest', 'profit', 'return', 'earn', 'income', 'crypto', 'forex', 'bitcoin',
  'trading', 'roi', 'fund', 'broker', 'wealth', 'dividend', 'yield', 'stake',
  'mining', 'arbitrage', 'binary', 'mlm', 'referral', 'passive', 'guaranteed',
  'daily profit', 'withdraw', 'deposit', 'portfolio', 'scheme', 'opportunity',

  // Bahasa Malaysia
  'pelaburan', 'keuntungan', 'untung', 'modal', 'dividen', 'dijamin',
  'emas', 'sertai', 'segera', 'pendapatan', 'wang', 'ringgit', 'labur',
  'pulangan', 'tiada risiko', 'tanpa risiko', 'gandakan', 'perlombongan',
  'opsyen', 'pengeluaran', 'kumpulan', 'tempat terhad', 'bertindak sekarang',

  // Percentages
  '100%', '200%', '300%', '500%', '1000%',

  // Timeframes
  '24 jam', '1 hari', 'setiap hari', 'daily', 'weekly', 'monthly', 'hourly'
];

function isInvestmentPage() {
  const pageText = (document.body?.innerText || '').toLowerCase();
  const pageTitle = document.title.toLowerCase();
  const combined = pageText + ' ' + pageTitle;
  return TRIGGER_KEYWORDS.some(kw => combined.includes(kw.toLowerCase()));
}

// ── MESSAGE LISTENER ─────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_PAGE_DATA') {
    try {
      const data = extractFullPageContent();
      console.log('ScamBuster extracted:', data.domain, '— chars:', data.text.length);
      sendResponse(data);
    } catch (err) {
      console.error('ScamBuster extraction error:', err);
      sendResponse({
        title: document.title || '',
        url: window.location.href,
        domain: window.location.hostname,
        text: (document.body?.innerText || '').substring(0, 4000),
        headings: ''
      });
    }
  }
  return true;
});

// ── AUTO SCAN ────────────────────────────────────────
function autoScan() {
  if (!isInvestmentPage()) return;
  const data = extractFullPageContent();
  console.log('ScamBuster auto-scan:', data.domain, '| chars:', data.text.length);
  chrome.runtime.sendMessage({ type: 'AUTO_SCAN', data });
}

if (document.readyState === 'complete') {
  setTimeout(autoScan, 2500);
} else {
  window.addEventListener('load', () => setTimeout(autoScan, 2500));
}