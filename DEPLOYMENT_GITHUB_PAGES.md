# GITHUB PAGES DEPLOYMENT REQUIREMENTS (PLAN ONLY)

User confirmed `github.io` works at school; user reports **Vercel, Cloudflare and Surge are blocked**. Use **GitHub Pages** and make direct URL canonical. v.gd is optional and might be blocked.

1. After authorization, create/reuse GitHub repo with user-selected owner and name. GitHub Pages static app must not require a server.
2. For Vite project URL `https://OWNER.github.io/REPO/`, `base` must be `/REPO/`; if repo is user site `OWNER.github.io`, base is `/`. See official Vite instructions.
3. Add GitHub Actions build and Pages deployment **after authorization**; set repository Settings > Pages > Build and deployment > Source: GitHub Actions.
4. Ensure `npm ci`/build (or correct selected package manager) succeeds; published path `dist/`; use GitHub Pages recommended Actions with least necessary permissions.
5. Test canonical URL on clean Chrome and **actual school Chromebook** on school Wi-Fi; verify assets paths, fonts, loading, music mute and all scene transitions.
6. Only once deployed, optionally generate user-approved short v.gd URL and QR code; do not invent either.
7. Avoid private secrets in front-end build; all shipped assets visible to anyone loading public site. Do not publish original ebook.
8. Browser offline backup is a separate project decision: managed Chromebook restrictions mean `file://` fallback cannot be assumed. A second static provider is not authorized and may be blocked.

Official sources:
- Vite GitHub Pages static deployment: https://vite.dev/guide/static-deploy.html#github-pages
- Phaser templates: https://docs.phaser.io/phaser/getting-started/project-templates
- GitHub Pages documentation: https://docs.github.com/en/pages
