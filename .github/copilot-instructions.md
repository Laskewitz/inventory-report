# Project Instructions

This repository contains Agent Skills for generating Power Platform inventory reports and governance analysis.

## Context

- The Power Platform inventory API queries the `PowerPlatformResources` table in Azure Resource Graph
- The Power Platform CLI (`pac`) is used for tenant settings, DLP policies, and environment settings
- Reports can be generated as HTML/PDF documents or as inline markdown in chat

## Tools

- **Azure CLI** (`az`) — authenticates against Azure Resource Graph for the inventory API
- **Power Platform CLI** (`pac`) — retrieves tenant settings, DLP policies, environment settings, and environment lists
- Key `pac` commands used in this repo:
  - `pac admin list-tenant-settings` — tenant-wide governance settings
  - `pac admin dlp-policy list` / `pac admin dlp-policy show --policy-name "<guid>"` — DLP policies
  - `pac env list-settings --environment "<id>"` — per-environment Dataverse settings
  - `pac admin list` — list all environments

## Skills

- **inventory-report** — generates an HTML/PDF document using the frontend-design skill
- **inventory-analysis** — outputs structured markdown directly in chat
- **frontend-design** — renders polished HTML interfaces (used by inventory-report)

## Guidelines

- Always analyze collected data for gaps and risks — never just dump raw output
- Every finding must include: what the issue is, WHY it matters, and HOW to fix it
- Paginate all API and CLI queries fully — do not stop at the first page of results
- When generating reports, produce a single self-contained `.html` file with no external dependencies
