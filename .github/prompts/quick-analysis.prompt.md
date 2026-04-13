---
name: quick-analysis
description: Run a quick Power Platform governance analysis and show results in chat
agent: 'Power Platform Admin'
argument-hint: '[optional: specific area like "tenant settings" or "environment X"]'
---

Run a quick Power Platform governance analysis and present results directly in chat as markdown.

Use the **inventory-analysis** skill to:

1. Collect tenant settings, DLP policies, environments, environment settings, and resources
2. Analyze for gaps and risks
3. Present findings inline with the executive summary, categorized findings (🔴/🟡/🟢), and prioritized recommendations

Keep the output concise and actionable. If the user specified a focus area, narrow the analysis to that area.
