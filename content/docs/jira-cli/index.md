---
title: "jira-cli"
description: "jira-cli is a command line tool for self-hosted Jira Server. It lists your tickets, shows one, searches with JQL, adds comments and screenshots, and moves a ticket through its workflow, all from the terminal."
---

It targets Jira Server 7.x and REST API v2. Each command runs as a short process that calls Jira directly and prints JSON, so the same commands work for you, for scripts and for AI coding agents, with no MCP server to run. Changes are dry runs until you add `--perform-action`, so you can read the proposed action before anything is sent.

This is an independent project, not an official Atlassian tool.

## What you can do

- See your open issues with `mine`, or search by JQL and common filters with `search`.
- Read one issue with `show`, or a whole project release with `release`.
- Create issues, assign people, move tickets, edit labels, log work, and link, watch or vote.
- Comment with attached files or inline screenshots.
- Keep several Jira accounts as named profiles and switch between them.

## Where to go next

| You want to | Read |
| --- | --- |
| Install the tool and connect to Jira | [Install](/jira-cli/install) |
| Run your first commands | [Quickstart](/jira-cli/quickstart) |
| Find and read tickets | [Find and read tickets](/jira-cli/tickets) |
| Create, assign, move or label tickets | [Change tickets](/jira-cli/changes) |
| Comment, attach files or post screenshots | [Comments and attachments](/jira-cli/comments) |
| Get every issue in a project version | [Release boards](/jira-cli/releases) |
| Use more than one Jira account, or fix emoji errors | [Profiles and storage](/jira-cli/profiles) |
| Look up a command or option | [Command reference](/jira-cli/commands) |
| Call any Jira tool by name | [Tool reference](/jira-cli/tools) |
| Set it up for a coding agent | [Use with coding agents](/jira-cli/agents) |

The older `jira-agent` command is an alias for `jira-cli`.
