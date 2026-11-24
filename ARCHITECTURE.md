# Architecture

## Pieces

| Piece | Job |
| --- | --- |
| `libraries.json` | Which repos to publish, with their install command, blurb, icon and logo. |
| `scripts/sync/` | Downloads each repo's `docs/` at its latest default-branch commit, keeps the pages `docs/meta.json` lists, converts them (H1 to title, first paragraph to description, repo links to GitHub URLs), and writes `content/docs/<slug>/` plus `content/sync-state.json`. |
| Fumadocs (Next.js 16, static export) | Renders `content/docs` with `fumadocs-mdx`. The hub is `app/(home)`; library pages are `app/(docs)/[...slug]`. Search uses a static Orama index. |
| `lib/llms.ts` + routes | `/llms.txt` index, `/llms-full/<slug>.txt` and `/llms.mdx/<page>.md`. `scripts/agent-files.mjs` moves them to `/<slug>/llms-full.txt` and `/<page>.md` after the build. |
| Cloudflare Worker `oss-docs` | Serves `out/` as static assets on docs.khangle.dev (`wrangler.jsonc`). |
| `.github/workflows/sync.yml` | Hourly: sync, test, build, deploy, commit content, open an issue on failure. |
| `ops/docs-review.mjs` | Weekly on the M6 (launchd): for each library whose branch moved, headless Claude Code (subscription) checks the code changes against docs/ and opens a PR when a page drifted; also re-enables the sync workflow. |
| `tools/docs-readme.mjs` | Vendored into each library repo: fills README blocks from docs pages and checks the contract in CI. |

## Data flow

```text
library repo docs/ ──(hourly sync: GitHub commit + npm version)──▶ content/docs/<slug>/
        │                                                              │
        └─ README blocks (docs-readme.mjs)                             ▼
                                                        next build → out/ → agent-files.mjs
                                                                           │
                                                              wrangler deploy → docs.khangle.dev
```

## Decisions

- **Docs live in each library repo.** Agents that change a tool update its docs in the same commit (each repo's AGENTS.md says so), and its CI checks the README blocks. The site only copies.
- **Sync from the default branch, show the npm version.** Docs fixes go live within an hour without waiting for a release. The badge shows the published version and the exact commit.
- **Allowlist pages through meta.json.** `docs/` folders also hold internal notes.
- **Last good copy.** A library whose sync fails keeps its committed pages; a build broken by new content falls back to the committed content and opens an issue.
- **Static only.** No server keeps hosting free and simple. Agent files are generated at build time instead of served through Fumadocs' proxy.
- **One workflow for sync, build and deploy**, because a push made with `GITHUB_TOKEN` does not start other workflows.

## Open questions

- Unknown: whether GitHub's 60-day pause of scheduled workflows on inactive repos will trigger. The M6 weekly docs review job re-enables the workflow when it finds it disabled.
