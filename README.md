# Power Platform Inventory Report

This repository contains [Agent Skills](https://agentskills.io) for generating visual reports from the [Power Platform inventory API](https://learn.microsoft.com/power-platform/admin/inventory-api). Use these skills with GitHub Copilot to query your Power Platform estate and produce polished, self-contained HTML reports.

## Skills

| Skill | Description |
|---|---|
| [inventory-report](.agents/skills/inventory-report/SKILL.md) | Generate a self-contained HTML or PDF report. Collects data from the inventory API and Power Platform CLI, analyzes gaps, and uses the frontend-design skill to produce a polished visual document. |
| [inventory-analysis](.agents/skills/inventory-analysis/SKILL.md) | Output findings as markdown directly in GitHub Copilot CLI or Chat. Same data collection and analysis, but presents results inline — no file output. |
| [frontend-design](.agents/skills/frontend-design/SKILL.md) | Generate distinctive, production-grade HTML interfaces. Used by the inventory-report skill to render the final report. |

## Prerequisites

### 1. GitHub Copilot

You need an active [GitHub Copilot](https://github.com/features/copilot) subscription and one of:

- **VS Code** with the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) — sign in to your GitHub account in VS Code
- **GitHub Copilot CLI** — authenticate with `gh auth login`

### 2. Azure CLI (for the Inventory API)

The Power Platform inventory API queries [Azure Resource Graph](https://learn.microsoft.com/azure/governance/resource-graph/overview). You authenticate via the Azure CLI.

**Install:**

```bash
# macOS
brew install azure-cli

# Windows
winget install Microsoft.AzureCLI

# Linux (Debian/Ubuntu)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**Authenticate:**

```bash
az login
```

Your account must have sufficient permissions to query Azure Resource Graph for Power Platform resources (typically Global Admin, Power Platform Admin, or a role with `Microsoft.ResourceGraph/resources/read`).

### 3. Power Platform CLI (for tenant settings & DLP policies)

The Power Platform CLI (`pac`) is used to retrieve tenant settings and DLP policies.

**Install:**

```bash
# Using .NET tool (cross-platform, recommended)
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Or via VS Code extension
# Install "Power Platform Tools" from the VS Code marketplace
```

See [Install Microsoft Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction#install-microsoft-power-platform-cli) for all options.

**Authenticate:**

```bash
pac auth create
```

This opens a browser for interactive sign-in. Your account needs Power Platform Admin or Global Admin permissions to retrieve tenant settings and DLP policies.

## Copilot customizations

This repo includes additional [Copilot customizations](https://code.visualstudio.com/docs/copilot/customization/overview) for a streamlined experience in VS Code.

### Custom instructions

[`.github/copilot-instructions.md`](.github/copilot-instructions.md) — project-wide context automatically included in every Copilot conversation in this repo. Ensures Copilot always knows about the inventory API, pac CLI, and report conventions.

### Prompt files (slash commands)

Reusable prompts available as slash commands in VS Code Copilot Chat:

| Command | Description |
|---|---|
| `/generate-report` | Generate a full HTML inventory report |
| `/quick-analysis` | Run a quick governance analysis in chat |
| `/check-dlp` | Focused DLP policy coverage check |
| `/check-environments` | Audit environment settings for gaps |

### Custom agent

[`@power-platform-admin`](.github/agents/power-platform-admin.agent.md) — a Power Platform administration expert agent that can collect data, analyze governance posture, and hand off to generate HTML reports. Invoke with `@power-platform-admin` in Copilot Chat.

## Getting started

1. Install and authenticate with the prerequisites above
2. Open this repository in VS Code or the GitHub Copilot CLI
3. Use any of the approaches below:
   - **Slash commands**: Type `/generate-report`, `/quick-analysis`, `/check-dlp`, or `/check-environments` in Copilot Chat
   - **Custom agent**: Type `@power-platform-admin` followed by your question
   - **Direct**: Ask Copilot to generate an inventory report — the skills are auto-discovered from `.agents/skills/`
4. The inventory-report skill collects data from the inventory API and Power Platform CLI, then hands off to the frontend-design skill to produce a single `.html` report

## Resources

- [Power Platform inventory API](https://learn.microsoft.com/power-platform/admin/inventory-api)
- [Power Platform inventory schema reference](https://learn.microsoft.com/power-platform/admin/inventory-schema)
- [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Install Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- [Agent Skills specification](https://agentskills.io)
