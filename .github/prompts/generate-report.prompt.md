---
name: generate-report
description: Generate a full Power Platform inventory report as an HTML document
agent: power-platform-admin
argument-hint: '[optional: specific focus area like "DLP only" or "environment X"]'
---
Generate a comprehensive Power Platform inventory report as a self-contained HTML file.

Use the **inventory-report** skill to:
1. Collect all tenant settings, DLP policies, environments, environment settings, and resources
2. Analyze everything for gaps, risks, and deviations from best practices
3. Use the **frontend-design** skill to render a polished HTML report

If the user specified a focus area, prioritize that section but still include the full report.

Save the report as `inventory-report.html` in the repository root.
