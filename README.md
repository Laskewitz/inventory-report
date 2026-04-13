# Power Platform Inventory Report

This repository contains [Agent Skills](https://agentskills.io) for generating visual reports from the [Power Platform inventory API](https://learn.microsoft.com/power-platform/admin/inventory-api). Use these skills with GitHub Copilot to query your Power Platform estate and produce polished, self-contained HTML reports.

## Skills

| Skill | Description |
|---|---|
| [inventory-report](.agents/skills/inventory-report/SKILL.md) | Query the Power Platform inventory API for resources like canvas apps, cloud flows, Copilot Studio agents, and environments. Knows the full API schema and query patterns. |
| [frontend-design](.agents/skills/frontend-design/SKILL.md) | Generate distinctive, production-grade HTML interfaces. Used by the inventory-report skill to render the final report. |

## Getting started

1. Open this repository in VS Code or the GitHub Copilot CLI
2. Ask Copilot to generate an inventory report — the skills are auto-discovered from `.agents/skills/`
3. The inventory-report skill queries your data and hands off to the frontend-design skill to produce a single `.html` report

## Resources

- [Power Platform inventory API](https://learn.microsoft.com/power-platform/admin/inventory-api)
- [Power Platform inventory schema reference](https://learn.microsoft.com/power-platform/admin/inventory-schema)
- [Agent Skills specification](https://agentskills.io)
