# Power Platform Inventory Report

This repository contains [Agent Skills](https://agentskills.io), prompt files, and a custom agent for generating Power Platform inventory reports and governance analysis. Use these with GitHub Copilot to query your Power Platform estate, analyze settings for risks, and produce polished reports — all from within VS Code or the GitHub Copilot CLI.

## Sample report

Reports include headline stats, health scores, critical findings with risk explanations, and prioritized recommendations with exact `pac` CLI commands to fix each issue. Dark mode is the default, with a toggle for light mode.

| Dark mode (default) | Light mode |
| --- | --- |
| ![Sample report in dark mode](docs/images/report-dark.png) | ![Sample report in light mode](docs/images/report-light.png) |

## What's included

### Skills (`.agents/skills/`)

Skills are portable, auto-discovered capabilities that follow the [Agent Skills open standard](https://agentskills.io).

| Skill | Description |
| --- | --- |
| [inventory-report](.agents/skills/inventory-report/SKILL.md) | Generate a self-contained HTML report. Collects data from the inventory API and Power Platform CLI, analyzes governance gaps, and uses the frontend-design skill to produce a polished visual document saved under `reports/YYYYMMDD/HHmm/`. |
| [inventory-analysis](.agents/skills/inventory-analysis/SKILL.md) | Output findings as structured markdown directly in GitHub Copilot CLI or Chat. Same data collection and analysis — no file output. |
| [frontend-design](.agents/skills/frontend-design/SKILL.md) | Generate distinctive, production-grade HTML interfaces. Used by the inventory-report skill to render the final report. |

Both inventory skills share a common data reference: [`inventory-data.md`](.agents/skills/inventory-report/inventory-data.md) — the complete API reference, schema, data collection strategy, CLI commands, and analysis framework.

### Custom agent (`.github/agents/`)

| Agent | Description |
| --- | --- |
| [`@Power Platform Admin`](.github/agents/power-platform-admin.agent.md) | A Power Platform administration expert that collects data via `pac` CLI commands, analyzes governance posture, and can hand off to generate HTML reports. |

Invoke with `@Power Platform Admin` in Copilot Chat. The agent runs `pac` commands directly in the terminal — it does not use MCP server tools.

### Prompt files (`.github/prompts/`)

Reusable slash commands available in VS Code Copilot Chat:

| Command | Description |
| --- | --- |
| `/generate-report` | Generate a full HTML inventory report under `reports/YYYYMMDD/HHmm/` and open it in the VS Code integrated browser |
| `/quick-analysis` | Run a quick governance analysis and show results as markdown in chat |
| `/check-dlp` | Focused DLP policy coverage check — flags uncovered environments, permissive groupings, and missing blocks |
| `/check-environments` | Audit environment settings for gaps — flags disabled auditing, missing timeouts, and non-compliant configurations |

All prompt files route through the `@Power Platform Admin` custom agent.

### Custom instructions (`.github/copilot-instructions.md`)

[Project-wide instructions](.github/copilot-instructions.md) automatically included in every Copilot conversation in this repo. Ensures Copilot always:

- Knows about the inventory API, `pac` CLI, and available skills
- Runs `pac` commands directly in the terminal (not via MCP)
- Analyzes data for gaps and risks — never dumps raw output
- Explains WHY each issue matters and HOW to fix it
- Produces self-contained `.html` reports with no external dependencies

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

The Power Platform CLI (`pac`) is used to retrieve tenant settings, DLP policies, environment settings, and more.

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

## Getting started

1. Install and authenticate with the prerequisites above
2. Open this repository in VS Code
3. Use any of the approaches below:
   - **Slash commands**: Type `/generate-report`, `/quick-analysis`, `/check-dlp`, or `/check-environments` in Copilot Chat
   - **Custom agent**: Type `@Power Platform Admin` followed by your question in Copilot Chat
   - **Direct**: Ask Copilot to generate an inventory report — the skills are auto-discovered from `.agents/skills/`
4. Reports are saved under `reports/YYYYMMDD/HHmm/` and automatically opened in the VS Code integrated browser

## Report output

Generated reports are saved in timestamped directories:

```
reports/
  20260413/
    1540/
      inventory-report.html
  20260414/
    0930/
      inventory-report.html
```

Report directories are git-ignored. The `reports/README.md` placeholder is tracked.

## Resources

- [Power Platform inventory API](https://learn.microsoft.com/power-platform/admin/inventory-api)
- [Power Platform inventory schema reference](https://learn.microsoft.com/power-platform/admin/inventory-schema)
- [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- [Install Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- [Agent Skills specification](https://agentskills.io)
- [VS Code Copilot customizations](https://code.visualstudio.com/docs/copilot/customization/overview)
