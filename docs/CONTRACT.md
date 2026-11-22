# Docs contract

This file defines what a library repo provides so docs.khangle.dev can publish it, and what each side does when something changes. The site lives in [khanglvm/docs](https://github.com/khanglvm/docs). Every library repo keeps its own docs in its own `docs/` folder, and those files are the source of truth.

## What a library repo provides

1. **`docs/meta.json`** lists the published pages in sidebar order, in Fumadocs format:

   ```json
   { "pages": ["index", "install", "---Guides---", "plugins", "guides", "---For agents---", "agents"] }
   ```

   - An entry is a page name (`install` means `docs/install.md`) or a folder that has its own `meta.json`.
   - `---Label---` adds a sidebar heading.
   - List every page by name. `...` is rejected, so internal notes in `docs/` (design notes, development guides) stay off the site unless they are listed.
   - `index` is required. It is the library's overview page.

2. **Pages are plain Markdown** (`.md`) that also read well on GitHub:
   - Start with an H1. The site uses it as the page title.
   - The first paragraph after the H1 becomes the page description, so it should be one or two full sentences that say what the page covers. Optional frontmatter (`title:`, `description:`) overrides both.
   - Link to other pages with relative paths (`install.md`, `guides/plugins.md`). Links to anything else in the repo (`../README.md`, `../src/`) are rewritten to GitHub on the site.
   - Images go in `docs/assets/` and are linked relatively.
   - Leave out raw HTML, JSX and hand-written "Contents" lists. The site builds its own table of contents.

3. **Recommended pages:**
   - `index`: what the tool is and who it is for.
   - `install`: how to install it.
   - A quickstart.
   - Guides by task.
   - A reference for commands, flags, config files or exported APIs.
   - `agents`: how a coding agent should use the tool, including the skill or MCP setup, the exact commands, the output formats, and the limits.

   The site's surface text is for people. The `agents` page and the reference are what agents read most, so be exhaustive there.

4. **README blocks.** The README keeps its own voice, but sections that repeat a docs page are generated from that page so the two cannot drift:

   ```md
   ## Install

   <!-- docs:begin install.md -->
   <!-- docs:end -->
   ```

   `node scripts/docs-readme.mjs` fills each block from the page body and leaves out the H1. It shifts headings down one level and rebases links to the repo root.

5. **`scripts/docs-readme.mjs`** is a copy of [tools/docs-readme.mjs](../tools/docs-readme.mjs). Copy it again when the master copy changes.

6. **`.github/workflows/docs.yml`** runs `node scripts/docs-readme.mjs --check` on pushes and pull requests that touch `docs/`, `README.md` or the script. It runs with read-only permissions and no secrets, and it is separate from the publish workflow, so a docs problem never blocks a release.

7. **`AGENTS.md`** carries the "Docs" section below, so every coding agent working in the repo keeps the docs current in the same change.

8. **A `docs` job in the publish workflow** starts the site's sync as soon as the publish job finishes, so a new release reaches the site within minutes instead of at the next scheduled sync. It reads the repo secret `DOCS_SYNC_TOKEN`, a fine-grained token for khanglvm/docs with only Actions read and write, and runs `gh workflow run sync.yml --repo khanglvm/docs --ref main`. Without the secret it logs a notice and passes, so a missing token never fails a release. The job in `khanglvm/hookmux/.github/workflows/release.yml` is the reference copy.

## The AGENTS.md section for library repos

```md
## Docs

`docs/` is the source of truth for this tool's documentation. docs.khangle.dev publishes the pages `docs/meta.json` lists, and llms.txt is built from the same pages for coding agents. The contract is in https://github.com/khanglvm/docs/blob/main/docs/CONTRACT.md.

- When a change adds, removes or changes a command, flag, option, config key, output format, exported API or default, update the docs page that covers it in the same commit. Add a page and list it in `docs/meta.json` when none covers it.
- Keep `docs/agents.md` exact: commands, flags, output shapes and limits, written for a coding agent.
- README sections between `<!-- docs:begin PAGE -->` and `<!-- docs:end -->` are generated. Edit the page in `docs/`, then run `node scripts/docs-readme.mjs`.
- Run `node scripts/docs-readme.mjs --check` before committing. CI runs the same check.
- Do not move or rename a published page without updating `docs/meta.json` and links to it.
```

## What the docs site does

- **Right after each npm publish** (item 8), on a schedule GitHub runs every few hours, and on demand, the `sync` workflow in khanglvm/docs:
  1. Reads each library's latest commit on its default branch and its latest npm version.
  2. When either changed, pulls that commit's `docs/` and converts the listed pages.
  3. Rebuilds the site and deploys it to docs.khangle.dev.
- **One broken repo doesn't break the site.** A library that fails to sync keeps its last good pages, and the workflow opens an issue that names the error.
- **Each page shows a "Synced from" badge** with the npm version and links to the commit it came from.
- **Agent files:** `/llms.txt` indexes every page, `/<library>/llms-full.txt` holds one library's pages in one file, and `/<page>.md` serves any single page as Markdown.
- **Weekly**, a review job on the M6 compares each library's recent code changes with its docs and opens a pull request when a page no longer matches the code.

## Adding a library

1. Give the repo the files above, and set its `DOCS_SYNC_TOKEN` secret.
2. Add an entry to `libraries.json`, with `slug`, `repo`, `branch`, `package` (or `null`), `install`, `title`, `blurb` and `icon` (a Lucide icon name that `components/library-icon.tsx` maps).
3. Preview the pages with `node scripts/sync/index.mjs --local <slug>=<path to the repo checkout>`, then `pnpm build` and `pnpm start`.
4. Push. The next sync publishes the library.
