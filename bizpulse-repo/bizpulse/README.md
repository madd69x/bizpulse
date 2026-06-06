# BizPulse — AI Business Health Monitor

> **FlowZint AI Hackathon 2026 submission** · Open Innovation category

BizPulse is an AI-powered business co-pilot that lets any business owner describe their situation in plain language and instantly receive:

- 📊 **Health Score** (0–100) with diagnosis
- ⚠️ **Risk Signals** prioritized by severity
- 📈 **KPI Snapshot** extracted from your description
- 🗓️ **7-Day Battle Plan** with concrete, specific actions
- 📤 **Export** your report as Markdown

No sign-up. No forms. Just describe your situation and get answers.

---

## Live Demo

👉 **[bizpulse.example.com](https://YOUR_USERNAME.github.io/bizpulse)**

---

## Screenshots

| Input | Results |
|-------|---------|
| Describe situation in plain language | Health score, KPIs, risks, and action plan |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| AI Engine | Anthropic Claude (claude-sonnet-4-20250514) |
| Icons | Tabler Icons |
| Fonts | DM Sans + DM Mono (Google Fonts) |
| Hosting | GitHub Pages (static, no server needed) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/bizpulse.git
cd bizpulse
```

### 2. Add your Anthropic API key

Open `src/app.js` and find the `callClaude` function. Add your key:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'sk-ant-YOUR_KEY_HERE',  // ← add this line
},
```

> ⚠️ **Security note:** Never commit your API key to a public repo. For production, proxy the API call through a backend. See [Deployment](#deployment) below.

### 3. Open in browser

```bash
# No build step needed — just open the file
open index.html
# or
npx serve .
```

---

## Deployment

### GitHub Pages (static, recommended for demo)

1. Push to GitHub
2. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
3. Your site is live at `https://YOUR_USERNAME.github.io/bizpulse`

> For production, move the API call to a serverless function (Vercel Edge, Cloudflare Workers, etc.) so your API key stays server-side.

### Vercel (one-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bizpulse)

---

## Project Structure

```
bizpulse/
├── index.html          # Main HTML shell
├── src/
│   ├── style.css       # All styles (dark mode included)
│   ├── app.js          # Core logic — API calls, rendering, export
│   └── samples.js      # Quick-pick example scenarios
├── docs/
│   └── architecture.md # Technical deep-dive
└── README.md
```

---

## How It Works

1. **User describes their business** in a free-text textarea
2. **Claude AI** receives the description + a structured system prompt that enforces a strict JSON schema
3. **BizPulse parses** the JSON response into health score, KPIs, risks, and plan
4. **Results render** with animations, expandable plan cards, and export

The system prompt instructs Claude to:
- Extract quantitative metrics from unstructured text
- Score business health on a calibrated 0–100 scale
- Order risks by urgency
- Generate day-by-day specific actions (not generic advice)

---

## Why BizPulse Wins

Most hackathon AI projects are chatbots. BizPulse is a **structured diagnostic engine**:

| Feature | Generic Chatbot | BizPulse |
|---------|----------------|---------|
| Output format | Free-form text | Structured JSON → visual report |
| Health score | ❌ | ✅ Quantified 0–100 |
| Risk prioritization | ❌ | ✅ High / Medium / Low |
| Action plan | Vague tips | Day-by-day specific tasks |
| Export | ❌ | ✅ Markdown report |
| Dark mode | ❌ | ✅ |
| Works offline | N/A | Static HTML — deploy anywhere |

---

## Hackathon Category

**Open Innovation** — solving the real-world problem of business owners lacking access to affordable, expert-level business diagnostics.

**Submission portal:** [https://flowzint.in/2026/ai/hackothon](https://flowzint.in/2026/ai/hackothon)

---

## License

MIT — free to use, fork, and build on.

---

## Author

Built with ❤️ for FlowZint AI Hackathon 2026.
