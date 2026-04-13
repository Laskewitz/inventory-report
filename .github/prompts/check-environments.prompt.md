---
name: check-environments
description: Audit all environments for settings gaps and governance issues
agent: power-platform-admin
argument-hint: '[optional: environment name or ID to check a single environment]'
---

Audit Power Platform environments for settings gaps and governance issues.

1. Run `pac admin list` to get all environments
2. For each environment (or the specified one), run `pac env list-settings --environment "<id>"`
3. Analyze settings for gaps — only flag issues, do not list all settings
4. Check for:
   - Auditing disabled
   - Missing session timeouts
   - Excessive file upload limits
   - Missing blocked attachment types
   - Plugin trace logging enabled in production
   - Environments without Managed Environment enabled

Present findings per environment as markdown with 🔴 Critical / 🟡 Warning / 🟢 Healthy indicators.
Include WHY each gap matters and HOW to fix it with specific `pac` commands.
