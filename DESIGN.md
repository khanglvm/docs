# Design

Direction A, "Quiet", chosen by Khang on 2026-11-21 from a moodboard of Astro Docs, GitBook, a React component library concept (Eduard Reshetnikov, Dribbble 27780104) and Docwise (Dribbble 27861782). Board and DNA: `~/.local/share/design-refs/boards/20261121-0910-oss-docs-hub-light-minimal-soft/`. Built directly (design-discovery route), not through a Cook loop.

## Feel

A near-white workspace with near-black ink and buttons, hairline borders, white cards, and one faint mint and lavender wash at the top of the hub. Decoration stays at the edges and never sits behind text. Light theme only.

## Tokens (app/global.css)

| Role | Value |
| --- | --- |
| Page background | #FBFBFC |
| Card, popover | #FFFFFF |
| Ink, primary button | #121214 |
| Muted text | #696973 |
| Muted surface | #F3F3F6 |
| Border | #ECECF0 |
| Hub wash | radial #E4F3EF (top right), #ECEBFA (top left) |

- Type: Inter for text, Geist Mono for code, versions and install commands. Hub headline 56 px / 600 / -0.035em (36 px on phones).
- Radius: 8 px controls, 10 px icon tiles, 16 px cards, full pill for buttons and search.
- Icons: lucide-react only, 1.5 to 2 px stroke.
- Spacing: 4 px base; cards 20 px padding, 16 px grid gap.

## Components

- Hub card: icon tile, name, version (mono), one-sentence blurb, install command with copy button. The whole card links to the library.
- Docs page: Fumadocs DocsLayout. A sidebar root per library gives the library switcher. Under the title: "Synced from vX" badge (links to the source commit), Copy Markdown, and the Open menu (Markdown, GitHub source, open in an AI chat).

## Motion

Card shadow eases in on hover (Tailwind default 150 ms). No other motion.
