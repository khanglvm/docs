---
title: "figma-lens"
description: "figma-lens is a read-only CLI and MCP server that lets a coding agent find, view and measure Figma designs, then check the UI it builds against them. It uses Figma's REST API, so Figma Desktop is not needed."
---

An independent open-source tool by Khang Le. Not affiliated with Figma or the [Lens - Find & Select Text community plugin](https://www.figma.com/community/plugin/1587855920816168465/lens-find-select-text).

## What it does

figma-lens gives the agent a small, ordered view of a design instead of the whole file:

- It finds the right screen from a Figma link, a description such as "the screen where a recruiter filters candidates", or a reference screenshot.
- It returns a screenshot of the design first, then a short list of the screens or states in it, with the exact next command to run.
- It measures the parts that matter at their original size: spacing, colors, radii, fonts, and the exact text on screen.
- It exports the icons and illustrations from the design, so the agent can reuse them.
- After the agent builds the screen, it checks that the visible text in the code matches the design.

Every result is a compact JSON summary plus files saved under `.figma-lens/`. The agent does not load the whole file's layer tree, which keeps context use small.

## How you use it

You can run the commands yourself, but the tool is built for an agent to run. There are three ways to connect one:

- The agent skill teaches an agent which commands to run and in what order. It needs an agent that can run shell commands.
- The MCP server gives an MCP-capable agent the same workflow as native tools. See [MCP server](/figma-lens/mcp).
- The CLI is the base for both. See [CLI reference](/figma-lens/cli).

The workflow needs an agent that can view images and test the UI it builds. Without image viewing, the agent cannot check what it built against the design.

## Where to start

| You want to | Read |
| --- | --- |
| Install the tool and the agent skill | [Install](/figma-lens/install) |
| Connect a Figma token | [Authentication](/figma-lens/authentication) |
| Inspect your first design | [Quickstart](/figma-lens/quickstart) |
| Find a design when you have no link | [Find designs without a link](/figma-lens/find-designs) |
| Build a screen from a design and check it | [Design-to-code workflow](/figma-lens/design-to-code) |
| Look up a command, flag or setting | [CLI reference](/figma-lens/cli) |
| Connect an MCP client | [MCP server](/figma-lens/mcp) |
| Set up a coding agent | [Use with coding agents](/figma-lens/agents) |

## Limits

figma-lens only reads. It does not edit designs. It needs a file saved on Figma's servers that the token owner can already open, so it cannot read an unsaved local `.fig` file. Figma permissions and API rate limits apply.
