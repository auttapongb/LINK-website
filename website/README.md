# LINK marketing website

Consumer-facing marketing site for **LINK** — a loyalty-point aggregation and family pooling service (academic/fictional Year-1 pilot).

## Stack

- Vite 6 (multi-page static site)
- Vanilla HTML / CSS / JS
- Hallmark-informed custom theme (“LINK Connection”) with Split Studio + Narrative Workflow patterns

## Pages

| Page | Path |
| --- | --- |
| Home | `/` |
| How it works | `/how-it-works.html` |
| For families | `/for-families.html` |
| Use cases | `/use-cases.html` |
| Partners | `/partners.html` |
| Privacy | `/privacy.html` |
| FAQ | `/faq.html` |
| Demo | `/demo.html` |
| Sitemap (HTML) | `/sitemap.html` |
| Sitemap (XML) | `/sitemap.xml` |

## Run locally

```bash
cd website
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

Output lands in `website/dist/`.
