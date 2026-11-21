# docs.khangle.dev

The documentation site for Khang Le's open-source tools: [hookmux](https://github.com/khanglvm/hookmux), [jira-cli](https://github.com/khanglvm/jira-cli), [outline-cli](https://github.com/khanglvm/outline-cli), [figma-lens](https://github.com/khanglvm/figma-lens) and [@khanglvm/react](https://github.com/khanglvm/react).

Each tool keeps its docs in its own repo. This site pulls them in every hour, so a page changes here soon after it changes in the tool's repo. People read the pages; coding agents read the same content as plain text:

- https://docs.khangle.dev/llms.txt indexes every page.
- https://docs.khangle.dev/<tool>/llms-full.txt holds one tool's docs in one file.
- Any page URL with `.md` added returns that page as Markdown.

## Run it

```sh
project-deps install
pnpm sync
pnpm build && pnpm start
```

Adding a tool and the rules each tool repo follows are in [docs/CONTRACT.md](docs/CONTRACT.md).
