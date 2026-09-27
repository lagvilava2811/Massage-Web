# Nino Abazadze — Massage & Rehabilitation, Kutaisi

Production site: https://ninoabazadze.ge

## Production and deployment

Cloudflare Pages deploys the `main` branch of this repository. Cloudflare configuration lives in `_headers` and `_redirects`; there is no active Vercel deployment.

Run the release checks before publishing:

```powershell
python scripts/check-site.py
node --check script.js
```

On this computer, publish through `outputs/Push-GitHub.ps1` from the parent Codex workspace.

## URL convention

Public URLs never use `.html`:

- `/` — Georgian home page
- `/en`, `/ru` — language versions
- `/articles` and article slugs — advice pages
- `/certificate`, `/certificate-en`, `/certificate-ru` — certificate pages

The corresponding `.html` files are source files only. Cloudflare redirects their public `.html` addresses to the clean URL.

## Business information

- Address: Balakhvani, 2 Lomonosov Street, Kutaisi
- Phone / WhatsApp: +995 571 088 021
- Hours: every day, 10:00–19:00
