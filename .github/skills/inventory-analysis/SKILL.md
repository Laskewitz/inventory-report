---
name: inventory-analysis
description: Analyze Power Platform inventory and output results as markdown directly in GitHub Copilot CLI or Chat. Queries the inventory API and Power Platform CLI for resources, tenant settings, DLP policies, and environment settings, then presents findings, gaps, and recommendations inline. Use when the user asks to analyze their Power Platform estate, check governance posture, or get recommendations without generating a file.
---

# Power Platform Inventory Analysis (Chat Output)

This skill collects Power Platform inventory data and presents the analysis **directly as markdown in the conversation** — no file output. Ideal for quick checks, governance reviews, and interactive Q&A in GitHub Copilot CLI or GitHub Copilot Chat.

For a polished HTML or PDF document to share with stakeholders, use the **inventory-report** skill instead.

## When to use this skill

- The user asks to **analyze**, **check**, or **review** their Power Platform estate
- The user wants **recommendations** or **governance posture** feedback
- The user asks questions like "what needs to be improved?" or "are there any gaps?"
- The user does NOT ask for a file, document, HTML, or PDF

## Workflow

> **⚠️ IMPORTANT: Always collect fresh data.** Every run of this skill **must** re-execute all data collection steps below — never reuse data from a previous run, from conversation history, or from earlier in the same session. Stale data leads to inaccurate analysis.

1. **Collect tenant governance data** using Power Platform CLI (`pac admin list-tenant-settings`, `pac admin dlp-policy list/show`)
2. **Query inventory data** using the Power Platform inventory API via Azure CLI or direct REST calls
3. **Collect environment settings** using Power Platform CLI (`pac env list-settings`)
4. **Analyze all output** — flag gaps, risks, and deviations from best practices
5. **Present findings as structured markdown** directly in the conversation

Follow the data collection, analysis, and report structure documented in [inventory-data.md](../inventory-report/inventory-data.md).

## Output format

Present the analysis as structured markdown in the conversation. Use the following structure:

### 1. Executive summary

Start with a brief overview:

```markdown
## Power Platform Inventory Summary

- **Environments**: X (Y production, Z sandbox, ...)
- **Canvas apps**: X
- **Model-driven apps**: X
- **Cloud flows**: X
- **Copilot Studio agents**: X
- **DLP policies**: X

**Overall health**: 🔴 X critical | 🟡 X warnings | 🟢 X healthy
```

### 2. Findings by category

Group findings into sections with clear headers:

```markdown
## 🔴 Critical findings

### Auditing disabled in 3 production environments
**Environments**: Contoso Production, Finance Prod, HR Prod
**Why this matters**: Auditing tracks who did what and when — it is required for SOC2, ISO 27001, and GDPR compliance. Without it, you cannot investigate security incidents or demonstrate compliance.
**How to fix**: Enable auditing via Power Platform admin center or `pac env update-settings --name isauditenabled --value true --environment <id>`

---

## 🟡 Warnings

### Default environment has 47 canvas apps
**Why this matters**: The default environment has the weakest governance — every licensed user has Maker access. Production workloads here are at risk of accidental modification or data exposure.
**How to fix**: Identify business-critical apps and migrate them to dedicated managed environments.

---

## 🟢 Healthy

- All environments have DLP policy coverage ✅
- Session timeouts configured on all production environments ✅
- No quarantined resources found ✅
```

### 3. Prioritized recommendations

End with a numbered action list:

```markdown
## Recommendations

| # | Priority | Action | Why |
|---|---|---|---|
| 1 | 🔴 Critical | Enable auditing in Contoso Production, Finance Prod, HR Prod | Required for compliance — no audit trail means no incident investigation capability |
| 2 | 🔴 Critical | Create DLP policy for 2 uncovered environments | Unprotected environments allow unrestricted connector combinations, risking data exfiltration |
| 3 | 🟡 High | Move 47 apps out of the default environment | Default environment lacks governance controls — every user can access and modify resources |
| 4 | 🟡 High | Reassign 12 orphaned flows | Flows owned by inactive users will fail silently with no one receiving error notifications |
| 5 | 🟡 Medium | Block HTTP connector in non-development environments | HTTP connector allows arbitrary external API calls, bypassing DLP intent |
```

### Guidelines

- Be **specific**: name the environments, resources, and settings affected
- Always explain **WHY** each finding matters (the business, security, or compliance risk)
- Always provide **HOW to fix** with concrete actions (pac CLI commands, admin center steps)
- Use emoji indicators consistently: 🔴 Critical, 🟡 Warning/High, 🟢 Healthy, ℹ️ Info
- Keep output scannable — use tables, headers, and bullet points
- If the dataset is large, summarize counts and highlight the top issues rather than listing every resource
