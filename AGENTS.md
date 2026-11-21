# Working on docs.khangle.dev

This repo is the docs site for Khang Le's open-source tools: a Fumadocs (Next.js) static export served by a Cloudflare Worker at https://docs.khangle.dev. The site owns no tool documentation. Each library keeps its pages in its own repo's `docs/` folder, and this repo syncs them in.

Read [docs/CONTRACT.md](docs/CONTRACT.md) first. It defines what a library repo provides, what the sync does, and how to add a library.

## Layout

- `libraries.json`: the published libraries. Add one here.
- `scripts/sync/`: pulls each library's `docs/` (`index.mjs` orchestrates, `manifest.mjs` picks pages, `transform.mjs` converts them, `sources.mjs` talks to GitHub and npm).
- `content/docs/<slug>/` and `content/sync-state.json`: synced output. Never edit by hand; fix the page in the library repo and let the sync bring it in.
- `app/(home)`: the hub. `app/(docs)`: library pages. `app/llms.txt`, `app/llms-full`, `app/llms.mdx`: agent files, moved into place by `scripts/agent-files.mjs` after the build.
- `tools/docs-readme.mjs`: master copy of the script each library vendors as `scripts/docs-readme.mjs`.
- `.github/workflows/sync.yml`: hourly sync, build, deploy and commit.

## Commands

```sh
project-deps install                 # pnpm, through Khang's dependency workflow
pnpm test                            # sync unit tests
pnpm sync                            # sync every library that changed (--force for all)
node scripts/sync/index.mjs --local react=../react-docs-wt   # preview a checkout without pushing
pnpm build && pnpm start             # static export in out/, served on :3000
pnpm deploy                          # wrangler deploy (needs a Cloudflare login or API token)
```

## Rules

- When the contract changes, update docs/CONTRACT.md, `tools/docs-readme.mjs` and the vendored copies in every library repo in one pass.
- The site is light-only and follows DESIGN.md (direction A, "Quiet"). No eyebrows, glyph icons or decorative status dots; icons come from lucide-react.
- Keep the build static: no server routes, no proxy. Agent files are plain files in `out/`.

## Fumadocs reference

This site is built with [Fumadocs](https://fumadocs.dev) on Next.js. The APIs and conventions of Fumadocs may differ from your training data, so check its docs for the task at hand:

- Writing pages: https://fumadocs.dev/docs/next/markdown.md
- Organizing pages and folders: https://fumadocs.dev/docs/next/page-conventions.md
- Customizing the UI: https://fumadocs.dev/docs/next/guides/customize-ui.md
- Changing the theme and colors: https://fumadocs.dev/docs/ui/theme.md
- Upgrading Fumadocs: https://fumadocs.dev/docs/next/upgrade.md
- Other tasks: https://fumadocs.dev/llms.txt lists every docs page.
