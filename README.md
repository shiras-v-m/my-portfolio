# Shiras VM — Cloudflare Pages static portfolio

This project preserves the existing single-page portfolio UI and exports it as static HTML, CSS, and JavaScript. It is configured for **Cloudflare Pages static hosting**, not Cloudflare Workers/OpenNext.

## Requirements

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

## Build and check

```bash
npm install
npm run typecheck
npm run build
```

With `output: 'export'`, Next.js writes the static website to `out/`.

## Cloudflare Pages settings

Connect the repository to Cloudflare Pages and use:

- **Framework preset:** Next.js (Static HTML Export) or None
- **Build command:** `npm run build`
- **Build output directory:** `out`
- **Root directory:** the directory containing this `package.json` (leave blank if it is the repository root)
- **Environment variable:** `NODE_VERSION` = `22`

Do not use `npx wrangler deploy`, `bun deploy`, `.next`, or the OpenNext adapter for this static Pages deployment. If the GitHub repository was previously migrated to OpenNext, remove the old `open-next.config.ts`, `wrangler.jsonc` / `wrangler.toml`, `.dev.vars`, `.open-next/`, and any stale `bun.lock` / `bun.lockb` from that repository before committing this static-export version. Commit the package files from this project and use npm consistently.

## Security notes

- `public/_headers` adds baseline browser security headers and long-lived caching for hashed Next.js assets.
- External links opened in new tabs use `rel="noopener noreferrer"` where applicable.
- This site has no API routes, server actions, database credentials, or server-side secrets.
- Contact links use `mailto:` and do not send form data to a server.
- Never put private tokens or credentials in client-side code or `NEXT_PUBLIC_*` variables.
- Static export does not support request-time rendering, Next.js API routes, middleware, or server actions. Reassess hosting if those features are added later.

## Before publishing

- Replace placeholder GitHub/social links with your actual profile URLs.
- Verify project demo URLs.
- The downloadable CV is included at `public/Shiras-VM-CV.pdf`; replace it whenever your resume changes.
- The portfolio favicon is defined in `app/icon.svg`.
- Review the Content Security Policy if you add third-party scripts, analytics, external fonts, or embedded media.

## SEO and search discoverability

- The document title, meta description, canonical URL, Open Graph metadata, and large social-sharing image are configured in `app/layout.tsx` and `public/og-image.png`.
- The existing `app/icon.svg` provides the portfolio favicon.
- `app/sitemap.ts` generates `/sitemap.xml`; `app/robots.ts` generates `/robots.txt` and points crawlers to the sitemap.
- Person structured data identifies the portfolio owner and links the public GitHub and LinkedIn profiles.

### Publish and request indexing

1. Deploy the site to `https://shiras.dev` and confirm HTTPS works without certificate errors.
2. Open `https://shiras.dev/robots.txt`, `https://shiras.dev/sitemap.xml`, and `https://shiras.dev/og-image.png` to confirm they load.
3. Add and verify `shiras.dev` in [Google Search Console](https://search.google.com/search-console/).
4. In Search Console, submit `https://shiras.dev/sitemap.xml` in **Sitemaps**.
5. Use **URL Inspection** for `https://shiras.dev/`, run **Test Live URL**, then select **Request Indexing** if available.
6. In LinkedIn's Post Inspector, enter `https://shiras.dev/` to refresh the cached Open Graph preview after deployment.

Submitting a sitemap or requesting indexing does not guarantee indexing or a particular ranking. Search Console is required to check the actual Google index status; this project package alone cannot verify live indexing.


## Google AdSense setup

- `public/ads.txt` is configured for publisher `pub-6174663240539746`.
- The AdSense loader is added in `app/layout.tsx`.
- A responsive ad placement is included on the proposal-link creation screen only; personalized proposal pages do not show the ad component.
- Before deployment, replace `3028574231` in `app/propose/page.tsx` with the ad unit's numeric slot ID from AdSense. The ad will not serve properly until this is replaced and the site is approved/eligible.
- The Cloudflare Pages CSP in `public/_headers` allows the Google AdSense resources while retaining the other baseline security directives. Review browser console errors if Google introduces additional required resource hosts.
- After deployment, verify `https://shiras.dev/ads.txt` returns the publisher line, then follow the review/status steps in AdSense.


## Google AdSense

- Publisher ID: `ca-pub-6174663240539746`
- Responsive ad slot: `3028574231`
- Publisher authorization file: `public/ads.txt`
- Privacy policy: `/privacy-policy/`

After deployment, verify `https://shiras.dev/ads.txt` and `https://shiras.dev/privacy-policy/`. Ad serving depends on Google approving the site and the ad unit.
