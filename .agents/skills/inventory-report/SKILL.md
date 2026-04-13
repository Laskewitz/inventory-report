---
name: inventory-report
description: Generate a Power Platform inventory report as a self-contained HTML or PDF document. Queries the inventory API and Power Platform CLI for resources, tenant settings, DLP policies, and environment settings, then uses the frontend-design skill to produce a polished visual report file. Use when the user asks for an inventory report document, HTML dashboard, or PDF export.
---

# Power Platform Inventory Report (Document Output)

This skill collects Power Platform inventory data and produces a **self-contained HTML or PDF report file**. It uses the frontend-design skill to render a visually polished document.

For inline markdown output in GitHub Copilot CLI or Chat (no file output), use the **inventory-analysis** skill instead.

## When to use this skill

- The user asks for an inventory **report**, **document**, **HTML**, or **PDF**
- The user wants a **dashboard file** or **export** of their Power Platform estate
- The user wants a visual report to share with stakeholders

## Workflow

1. **Collect tenant governance data** using Power Platform CLI (`pac admin list-tenant-settings`, `pac admin dlp-policy list/show`)
2. **Query inventory data** using the Power Platform inventory API via Azure CLI or direct REST calls
3. **Collect environment settings** using Power Platform CLI (`pac env list-settings`)
4. **Analyze all output** — flag gaps, risks, and deviations from best practices
5. **Invoke the frontend-design skill** to create a visually striking, self-contained HTML report from the data

Follow the data collection, analysis, and report structure documented in [inventory-data.md](./inventory-data.md).

## Building the report

After collecting and analyzing all data:

1. Summarize key metrics: total resources by type, resources per environment, recently created/modified items
2. Invoke the **frontend-design** skill to generate a self-contained HTML report with:
   - A hero section with headline stats (total apps, flows, agents, environments)
   - A **health score** or risk summary (critical / warning / healthy counts)
   - A breakdown by resource type (charts or styled tables)
   - An environment-by-environment breakdown showing each environment's name, type, region, managed status, and its resource counts
   - A timeline of recently created or modified resources
   - Filters or tabs for drilling into each resource type and each environment
   - A tenant governance section showing key tenant settings with **flagged issues and why they matter**
   - A DLP policy overview showing all policies, their environment scopes, connector classifications, and **coverage gaps**
   - An environment settings section highlighting key configuration per environment with **flags for non-compliant settings**
   - A **Recommendations** section with prioritized next steps, each including:
     - What to fix
     - Why it needs to be fixed (the business/security/compliance risk)
     - How to fix it (specific pac CLI commands or admin center actions)
     - Priority level (Critical / High / Medium / Low)
3. The report should be a single `.html` file that works offline with no external dependencies
