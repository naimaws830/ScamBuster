# ScamBuster
**ScamBuster** is a multi-part project that includes:
- A **React + Vite** landing page & dashboard UI (in `landing-page/`)
- A **PHP backend scan endpoint** (in `backend/scan.php`)
- A **browser extension prototype** (in `scambuster-extension/`)

---

## 🎥 Presentation Video
- [Click here to view the presentation video](https://drive.google.com/drive/folders/1UT0UV5NAbtXEpBo8cFnI0yhRIOfpE8r_?usp=drive_link)
- https://drive.google.com/drive/folders/1UT0UV5NAbtXEpBo8cFnI0yhRIOfpE8r_?usp=drive_link

---

## Project Structure
- `landing-page/` – Frontend app (Vite + React + TypeScript) for the marketing site and dashboard UI.
- `backend/scan.php` – Simple PHP endpoint for scanning/processing requests.
- `scambuster-extension/` – Browser extension assets (manifest, popup, background/content scripts).

---

## Getting Started

### 0) Configuration (Required before running)

**OpenRouter API Key (`backend/scan.php`)**
Open `backend/scan.php` and on **line 19**, replace the placeholder with your OpenRouter API key:
```php
'YOUR_NEW_API_KEY_HERE' → 'your_actual_openrouter_api_key'
```

**Gemini API Key (`.env`)**
In the root `.env` file, replace the placeholder with your Gemini API key:
```env
YOUR_API_KEY_HERE → your_actual_gemini_api_key
```

**Frontend `.env` Setup (`landing-page/`)**
Create a `.env` file inside the `landing-page/` folder and copy the contents from `.env.example` into it:
```sh
cp landing-page/.env.example landing-page/.env
```
Then fill in any required values in the newly created `landing-page/.env` file.

---

### 1) Run the frontend (landing page / dashboard)
```sh
cd landing-page
npm install
npm run dev
```
Then open the local URL printed in the terminal (typically `http://localhost:5173`).

### 2) Run the backend scan endpoint
This project expects a PHP-capable server for `backend/scan.php`.

Simple option (if you have PHP installed):
```sh
cd backend
php -S localhost:8000
```
Then access `http://localhost:8000/scan.php`.

### 3) Load the browser extension (for development)
1. Open your browser's extensions page (`chrome://extensions` or `edge://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select `scambuster-extension/`.

---

## Useful Commands

### Frontend
- `npm run dev` – start dev server
- `npm run build` – build production assets
- `npm run preview` – serve built assets locally

### Testing
- `npm test` or `npm run test` (depending on config)

---

## Notes
- The frontend is built with Vite + React + TypeScript + Tailwind.
- UI components live under `landing-page/src/components`.
- Dashboard pages are under `landing-page/src/pages`.
- The PHP backend is a minimal single-file endpoint.
- The extension is a basic proof-of-concept and includes `manifest.json`, `popup.html`, `background.js`, and `content.js`.


