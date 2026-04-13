---
name: check-dlp
description: Check DLP policy coverage and flag gaps
agent: 'Power Platform Admin'
---

Check all DLP policies in the tenant and analyze them for gaps.

1. Run `pac admin dlp-policy list` to get all policies
2. For each policy, run `pac admin dlp-policy show --policy-name "<guid>"` to get full details
3. Run `pac admin list` to get all environments
4. Cross-reference to find:
   - Environments without any DLP policy coverage
   - Overly permissive connector groupings
   - Whether the default environment has strict DLP
   - High-risk connectors (HTTP, custom) that aren't blocked where they should be
   - Overlapping policies on the same environment

Present findings as markdown with 🔴 Critical / 🟡 Warning / 🟢 Healthy indicators.
Include WHY each gap matters and HOW to fix it.
