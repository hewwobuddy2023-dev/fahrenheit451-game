# TOOL / PLUGIN AUDIT — FROM PRIOR CONVERSATIONS, NOT LIVE DEVICE SCAN

**Important:** prior-chat mentions are not proof of today's installed, authenticated or functioning state. The package did not inspect the user's PC or Claude plugin catalog. Agents should inspect tool status read-only before installing or removing anything.

| Tool or integration | Historical evidence/status | Value for this Phaser project | Recommendation |
|---|---|---|---|
| Claude Code | Main intended coding agent, PC-first | Very high | Primary local engineer |
| OpenAI Codex | Requested as local alternate + cloud fallback | Very high | Secondary local engineer, cloud fallback |
| Git / GitHub | Used in user's Roblox workflows with checkpoints | Essential | Versioned single source of truth |
| Claude Code cloud / Codex cloud | Requested for iPhone when PC not allowed on | High, conditional on provisioning | Verify cloud repo access early |
| Claude-Mem | Reported previously installed | Medium: long-term dev context | Optional, not substitute for PROGRESS.md |
| Graphify 0.9.92 | Previously reported installed | Low–medium for architecture visualization | Optional; no need at launch |
| Ponytail Full 5.3.2 | Previously reported installed | Unclear, Roblox workflow context | Don't integrate without measurable benefit |
| Headroom | Reported installed but inactive in Claude Desktop | Low | Avoid setup now |
| Obsidian | Mentioned previously | Low | Not needed; Markdown in repo is enough |
| ForgeGUI/ForgeMCP | Previously configured/referenced with verification uncertainty | Low; Roblox/GUI-centric | Avoid unless demonstrated browser-game benefit |
| Blender MCP | Previously connected, port 9876 | Low for 2D lightweight style | Avoid 3D pipeline |
| Roblox Studio MCP | Previously verified | None for browser game | Do not use |
| Rojo 7.7.1 | Previously verified Roblox sync | None | Do not use |
| Omega Lite agent orchestrator | Previous Roblox project | Negative for tight schedule | Avoid orchestration overhead |
| Lune / Stylua / Selene | Used or considered for Luau in Roblox project; current setup not audited | None | Not appropriate for TypeScript browser game |
| GitHub connector in ChatGPT | Available in this conversation's tool environment, account-specific access not audited | Useful for repo/PR review once authorized | Optional |
| Figma | Connector available in this conversation; live authorization not checked | Optional for design mocks | Avoid extra dependency unless needed |
| Vercel | Connector available but school blocks Vercel-hosted site | Not suitable for deployment | Do not use for hosting |
| Google Drive | Connected in ChatGPT context | Optional non-code document storage | Git repo files are project source of truth |

## Tool research, official references

- Phaser templates / TypeScript + Vite: https://docs.phaser.io/phaser/getting-started/project-templates
- Official Vite Pages deploy: https://vite.dev/guide/static-deploy.html#github-pages
- GitHub Pages: https://docs.github.com/en/pages
- Claude Code docs (verify cloud-mobile capabilities/current access): https://code.claude.com/docs
- Codex: https://developers.openai.com/codex

## Tests to request during preflight

Ask Claude to inspect its MCP list and active skills/plugins, then summarize **what's relevant**. Ask Codex to inspect its available tools and skill list. Do **not** blindly reinstall past tools, add marketplaces, use paid APIs, or run arbitrary installer scripts. Use official Playwright/browser automation if already available or easy to add after authorization, and a simple image-check workflow for screenshots. Keep dependencies minimal.
