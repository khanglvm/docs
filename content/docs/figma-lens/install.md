---
title: "Install"
description: "Install figma-lens from npm with Node.js 20 or newer, then add the agent skill if you use a coding agent. You also need a Figma personal access token, which Authentication covers."
---

## Install the CLI

```sh
npm install --global figma-lens
figma-lens --version
```

To try it without a global install, run `npx figma-lens@latest --help`.

The repository also has two install scripts, [install.sh](https://github.com/khanglvm/figma-lens/blob/ee38eacfb811ac40f6d7b3467c552c03dd0074e7/install.sh) and [install.ps1](https://github.com/khanglvm/figma-lens/blob/ee38eacfb811ac40f6d7b3467c552c03dd0074e7/install.ps1), for machines where you prefer to run a script. Both check for Node.js 20 and npm, then run the same global `npm install`. Download and read a script before you run it, and never pipe a remote script straight into a shell.

```sh
sh install.sh
sh install.sh --version 0.3.2 --prefix "$HOME/.local"
```

```powershell
./install.ps1
./install.ps1 -Version 0.3.2 -Prefix "$HOME\.local"
```

`--version` (`-Version` on Windows) picks a package version and defaults to `latest`. `--prefix` (`-Prefix`) installs into a different npm prefix.

## Install the agent skill

The skill tells your agent which figma-lens commands to run and when to stop:

```sh
npx -y skills@latest add khanglvm/figma-lens --skill figma-lens --global --yes
```

Start a new agent session afterwards so the agent discovers the skill. The skill also ships inside the npm package under `skills/figma-lens/`.

Agents that support MCP can use the tools instead of the CLI. See [MCP server](/figma-lens/mcp).

## Check the install

```sh
figma-lens --version
figma-lens auth status
```

`auth status` exits with code 1 until a token is configured. Add one in the [next step](/figma-lens/authentication), then run `figma-lens doctor` to confirm that Figma accepts it.
