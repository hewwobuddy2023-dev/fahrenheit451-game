# Isolated preview — current blocker and exact continuation

No Phoenix public preview or v.gd link has been created. The cloud UI showed GitHub's sign-in screen; the connected GitHub tools support existing-repository changes but do not expose repository creation or Pages administration. Do not deploy to the existing game's Pages site as a workaround. Production remains unchanged.

## Fast local test now

Extract the complete review ZIP. Double-click its Windows launcher (Node 24 required) and open the printed local URL. The phone uses the printed LAN URL on the same trusted Wi-Fi. Keep the server window open. No npm install is needed for the supplied build. The baseline build is included separately, with its own launcher, so compare both. Each origin has its own browser save; local saves do not transfer automatically from Pages.

## Owner/Claude separate GitHub Pages setup

Use a clean, reviewed Phoenix checkout and an authenticated GitHub account with permission to create a repository and configure Pages. Do not paste tokens into chat, scripts or the repository.

1. Review PR #3 and tests; run `npm ci` and all commands in the handoff.
2. Build explicitly as preview:

```sh
F451_ENV=preview npm run build
```

PowerShell equivalent:

```powershell
$env:F451_ENV = 'preview'
npm run build
Remove-Item Env:F451_ENV
```

3. Create a **new public repository** named `fahrenheit451-preview` under the owner's account. If it already exists, inspect it and its Pages deployment; do not overwrite it blindly. Do not rename or change `fahrenheit451-game`.
4. Copy **only the contents of `dist/`** into that preview repository root. Add an empty `.nojekyll` file. Do not copy source ebooks, screenshots, test logs, `.git`, node_modules, internal handoffs or personal documents. Commit as an ordinary new preview revision, preserving any existing preview history. Build metadata identifies the exact source commit/date/environment in `?diagnostics`.
5. In the **preview repository only**, Settings → Pages → Source: Deploy from a branch → choose its published branch and `/(root)` → Save. This publishes that separate repository, without touching production.
6. Wait for that repository's Pages build to succeed. Copy the URL GitHub actually displays; do not assume a guessed URL is live. Open it in Chrome and Safari, inspect build ID, console/asset requests and mobile inputs; confirm the production URL still shows its prior version.
7. Record the verified preview URL, source SHA, preview repository commit and previous preview commit in the handoff. Keep the reviewed static ZIP as a versioned recovery copy. A later preview update is an ordinary fast-forward commit of tested build files, not a force push.

Official references checked Nov 10, 2026:
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/rest/pages/pages

Pages configuration requires repository administration/Pages permissions. A source branch must already exist before it can be selected. These instructions are prepared, **not an executed deployment**.

## v.gd — Kali command after the preview really works

Only shorten the independently verified preview URL. This command deliberately rejects the production destination and other hosts. It creates a preview alias, not the official school release link. Run it in your own Kali terminal; Work has not executed it remotely.

```bash
read -r -p 'Paste the verified separate Pages preview URL: ' f451_preview_url
case "$f451_preview_url" in
  https://hewwobuddy2023-dev.github.io/fahrenheit451-preview/*) ;;
  *) echo 'Stopped: this is not the separate preview path.'; exit 1 ;;
esac
curl --fail --silent --show-error --location "$f451_preview_url" -o /tmp/f451-preview-check.html || exit 1
curl --fail --silent --show-error --get 'https://v.gd/create.php' \
  --data-urlencode 'format=simple' \
  --data-urlencode "url=$f451_preview_url" \
  --data-urlencode 'shorturl=F451_PhoenixPreview'
```

If the alias is taken, change only `F451_PhoenixPreview` to another clearly labeled preview name and retry once. Do not fabricate a result or keep hammering a rate limit. Open the **returned** link and confirm its destination. A service interstitial does not prove the game itself loaded. Keep the direct verified Pages URL for class.

API documentation: https://v.gd/apishorteningreference.php. The API accepts URL-encoded `url`, `format=simple`, and an optional 5–30-character alphanumeric/underscore alias. No usage-statistics option is enabled. Final official release destination/link still needs owner approval.
