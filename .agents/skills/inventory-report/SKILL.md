---
name: inventory-report
description: Generate Power Platform inventory reports by querying the inventory API for resources like canvas apps, model-driven apps, cloud flows, Copilot Studio agents, and environments. Use this skill when the user asks for a Power Platform inventory report, resource overview, environment summary, or wants to visualize their Power Platform estate. Pair with the frontend-design skill to produce beautiful HTML reports.
---

# Power Platform Inventory Report

This skill helps you query the Power Platform inventory API and produce structured data for visual reports. Use it to retrieve information about Power Platform resources across environments and present that data as a polished, self-contained HTML report.

## When to use this skill

- The user asks for a Power Platform inventory report or overview
- The user wants to see what resources exist across their environments
- The user wants a dashboard or summary of their Power Platform estate
- The user asks about canvas apps, cloud flows, agents, model-driven apps, or environments in their tenant

## Workflow

1. **Collect tenant governance data** using Power Platform CLI (`pac admin list-tenant-settings`, `pac admin dlp-policy list/show`)
2. **Query inventory data** using the Power Platform inventory API via Azure CLI or direct REST calls
3. **Shape the results** into a structured dataset (JSON)
4. **Invoke the frontend-design skill** to create a visually striking, self-contained HTML report from the data

## Power Platform Inventory API

The inventory API queries the `PowerPlatformResources` table in Azure Resource Graph.

### Endpoint

```
POST {PowerPlatformAPI url}/resourcequery/resources/query?api-version=2024-10-01
```

### Request body structure

```json
{
  "TableName": "PowerPlatformResources",
  "Clauses": [ /* array of clause objects */ ],
  "Options": {
    "Top": 1000,
    "Skip": 0,
    "SkipToken": ""
  }
}
```

### Supported clause types

| Clause | `$type` | Purpose | KQL equivalent |
|--------|---------|---------|----------------|
| Where | `where` | Filter rows | `where` |
| Project | `project` | Select columns | `project` |
| Take | `take` | Limit row count | `take` |
| Order By | `orderby` | Sort results | `sort by` |
| Distinct | `distinct` | Unique values | `distinct` |
| Count | `count` | Row count | `count` |
| Summarize | `summarize` | Aggregate (count, argmax) | `summarize` |
| Extend | `extend` | Computed columns | `extend` |
| Join | `join` | Join tables/subqueries | `join` |

### Clause examples

**Where** — filter by resource type:
```json
{
  "$type": "where",
  "FieldName": "type",
  "Operator": "in~",
  "Values": ["'microsoft.powerapps/canvasapps'", "'microsoft.copilotstudio/agents'"]
}
```

**Project** — select specific fields:
```json
{
  "$type": "project",
  "FieldList": [
    "name",
    "properties.displayName",
    "environmentId = tostring(properties.environmentId)",
    "createdDate = properties.createdAt"
  ]
}
```

**Summarize** — count by type:
```json
{
  "$type": "summarize",
  "SummarizeClauseExpression": {
    "OperatorName": "count",
    "OperatorFieldName": "resourceCount",
    "FieldList": ["type", "location"]
  }
}
```

**Extend** — add a computed column:
```json
{
  "$type": "extend",
  "FieldName": "environmentId",
  "Expression": "tostring(properties.environmentId)"
}
```

**Order By** — sort results:
```json
{
  "$type": "orderby",
  "FieldNamesAscDesc": {
    "tostring(properties.createdAt)": "desc"
  }
}
```

**Join** — enrich with environment info:
```json
{
  "$type": "join",
  "JoinKind": "leftouter",
  "RightTable": {
    "TableName": "PowerPlatformResources",
    "Clauses": [
      {
        "$type": "where",
        "FieldName": "type",
        "Operator": "==",
        "Values": ["'microsoft.powerplatform/environments'"]
      },
      {
        "$type": "project",
        "FieldList": [
          "joinKey = tolower(name)",
          "environmentName = properties.displayName",
          "environmentRegion = location",
          "environmentType = properties.environmentType",
          "isManagedEnvironment = properties.isManaged"
        ]
      }
    ]
  },
  "LeftColumnName": "joinKey",
  "RightColumnName": "joinKey"
}
```

## Resource types

| Display name | `type` value |
|---|---|
| Canvas apps | `microsoft.powerapps/canvasapps` |
| Model-driven apps | `microsoft.powerapps/modeldrivenapps` |
| Code apps | `microsoft.powerapps/codeapps` |
| App Builder apps | `microsoft.powerapps/apps` |
| Cloud flows | `microsoft.powerautomate/cloudflows` |
| Agent flows | `microsoft.powerautomate/agentflows` |
| Workflow agent flows | `microsoft.powerautomate/m365agentflows` |
| Copilot Studio agents | `microsoft.copilotstudio/agents` |
| Environments | `microsoft.powerplatform/environments` |
| Environment groups | `microsoft.powerplatform/environmentgroups` |

## Schema reference

### Common fields (all resource types)

| Field | Type | Description |
|---|---|---|
| `name` | string | Unique resource identifier (GUID) |
| `type` | string | Resource type identifier |
| `location` | string | Geographic region |
| `tenantId` | string | Tenant identifier |
| `properties.displayName` | string | Display name |
| `properties.createdAt` | datetime | Creation timestamp |
| `properties.createdBy` | string | Creator object ID |

### Canvas apps / Model-driven apps / Code apps / App Builder apps

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.isQuarantined` | boolean | Whether the app is quarantined |

Model-driven apps also have:
- `properties.appModuleId` — Dataverse app module ID
- `properties.logicalName` — Dataverse logical name

Code apps also have:
- `properties.subType` — `byocApp` or `vibeApp`

### Cloud flows / Agent flows / Workflow agent flows

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.workflowEntityId` | string | Dataverse workflow entity ID |

### Copilot Studio agents

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastPublishedAt` | datetime | Last published timestamp |
| `properties.createdIn` | string | Authoring tool (Copilot Studio / M365 Copilot Agent Builder) |
| `properties.schemaName` | string | Dataverse schema name |
| `properties.isQuarantined` | boolean | Whether the agent is quarantined |
| `properties.isManaged` | boolean | Part of a managed solution |
| `properties.botId` | string | CDS bot ID |
| `properties.entraAppId` | string | Entra App Registration ID (legacy) |
| `properties.entraAgentId` | string | Entra Agent Identity ID |
| `properties.orchestration` | string | Classic or Generative |
| `properties.model` | string | AI model (e.g. gpt-4o) |
| `properties.authentication` | string | None, Microsoft Entra, Generic OAuth 2.0 |
| `properties.channels` | array | Published channels |

### Environments

| Field | Type | Description |
|---|---|---|
| `properties.environmentType` | string | Production, Default, Sandbox, Trial, Developer, Dataverse for Teams |
| `properties.isManaged` | boolean | Managed Environment |
| `properties.environmentGroup` | string | Environment group name |
| `properties.environmentGroupId` | string | Environment group ID |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |

### Environment groups

| Field | Type | Description |
|---|---|---|
| `properties.description` | string | Group description |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |

## Default query pattern (Power Platform admin center)

This is the default query used by Power Platform admin center to get all resources with environment info:

```json
{
  "Options": { "Top": 1000, "Skip": 0, "SkipToken": "" },
  "TableName": "PowerPlatformResources",
  "Clauses": [
    {
      "$type": "extend",
      "FieldName": "joinKey",
      "Expression": "tolower(tostring(properties.environmentId))"
    },
    {
      "$type": "join",
      "JoinKind": "leftouter",
      "RightTable": {
        "TableName": "PowerPlatformResources",
        "Clauses": [
          {
            "$type": "where",
            "FieldName": "type",
            "Operator": "==",
            "Values": ["'microsoft.powerplatform/environments'"]
          },
          {
            "$type": "project",
            "FieldList": [
              "joinKey = tolower(name)",
              "environmentName = properties.displayName",
              "environmentRegion = location",
              "environmentType = properties.environmentType",
              "isManagedEnvironment = properties.isManaged"
            ]
          }
        ]
      },
      "LeftColumnName": "joinKey",
      "RightColumnName": "joinKey"
    },
    {
      "$type": "where",
      "FieldName": "type",
      "Operator": "in~",
      "Values": [
        "'microsoft.powerapps/canvasapps'",
        "'microsoft.powerapps/modeldrivenapps'",
        "'microsoft.powerautomate/cloudflows'",
        "'microsoft.copilotstudio/agents'",
        "'microsoft.powerautomate/agentflows'",
        "'microsoft.powerapps/codeapps'"
      ]
    },
    {
      "$type": "orderby",
      "FieldNamesAscDesc": {
        "tostring(properties.createdAt)": "desc"
      }
    }
  ]
}
```

## Response format

The API returns a `ResourceQueryResult` object:

```json
{
  "totalRecords": 1250,
  "count": 50,
  "resultTruncated": 1,
  "skipToken": "string_for_next_page",
  "data": [ /* array of result objects */ ]
}
```

Use `skipToken` for pagination when `resultTruncated` is `1`.

## Data collection strategy

You MUST collect a complete picture of the tenant. Follow these steps in order:

### Step 1 — Enumerate all environments

Query for all environments first. This gives you the full list of environment IDs, names, types, and regions.

```json
{
  "TableName": "PowerPlatformResources",
  "Options": { "Top": 1000, "Skip": 0, "SkipToken": "" },
  "Clauses": [
    {
      "$type": "where",
      "FieldName": "type",
      "Operator": "==",
      "Values": ["'microsoft.powerplatform/environments'"]
    },
    {
      "$type": "project",
      "FieldList": [
        "name",
        "properties.displayName",
        "location",
        "properties.environmentType",
        "properties.isManaged",
        "properties.environmentGroup",
        "properties.environmentGroupId",
        "properties.lastModifiedAt"
      ]
    }
  ]
}
```

Handle pagination: if `resultTruncated` is `1`, re-query with the returned `skipToken` until all environments are collected.

### Step 2 — Enumerate all environment groups

```json
{
  "TableName": "PowerPlatformResources",
  "Options": { "Top": 1000, "Skip": 0, "SkipToken": "" },
  "Clauses": [
    {
      "$type": "where",
      "FieldName": "type",
      "Operator": "==",
      "Values": ["'microsoft.powerplatform/environmentgroups'"]
    }
  ]
}
```

### Step 3 — Iterate through ALL resource types

Query each resource type separately to ensure nothing is missed. The resource types to iterate are:

1. `microsoft.powerapps/canvasapps` — Canvas apps
2. `microsoft.powerapps/modeldrivenapps` — Model-driven apps
3. `microsoft.powerapps/codeapps` — Code apps
4. `microsoft.powerapps/apps` — App Builder apps
5. `microsoft.powerautomate/cloudflows` — Cloud flows
6. `microsoft.powerautomate/agentflows` — Agent flows
7. `microsoft.powerautomate/m365agentflows` — Workflow agent flows
8. `microsoft.copilotstudio/agents` — Copilot Studio agents

For each resource type, run a query like:

```json
{
  "TableName": "PowerPlatformResources",
  "Options": { "Top": 1000, "Skip": 0, "SkipToken": "" },
  "Clauses": [
    {
      "$type": "where",
      "FieldName": "type",
      "Operator": "==",
      "Values": ["'<resource_type>'"]
    },
    {
      "$type": "project",
      "FieldList": [
        "name",
        "type",
        "location",
        "properties.displayName",
        "properties.createdAt",
        "properties.createdBy",
        "properties.ownerId",
        "properties.environmentId",
        "properties.lastModifiedAt",
        "properties.lastModifiedBy"
      ]
    },
    {
      "$type": "orderby",
      "FieldNamesAscDesc": {
        "tostring(properties.createdAt)": "desc"
      }
    }
  ]
}
```

**Always paginate**: for each query, keep requesting with `skipToken` until `resultTruncated` is `0` or no more results are returned.

### Step 4 — Cross-reference environments

After collecting all resources and environments, join them client-side by matching each resource's `properties.environmentId` to the environment `name`. This gives you environment display name, type, region, and managed status for every resource.

Alternatively, use the default admin center join query (documented above) if a single combined query is preferred — but still paginate fully.

### Step 5 — Aggregate per environment

For each environment, compute:
- Total resource count
- Count by resource type (apps, flows, agents)
- Most recently created / modified resource
- Whether it is a managed environment

### Step 6 — Collect tenant settings

Use Power Platform CLI to retrieve tenant-wide governance settings:

```bash
pac admin list-tenant-settings
```

This returns the full tenant settings JSON including security, governance, and feature flags. Include key settings in the report (e.g., who can create environments, sharing restrictions, AI features enabled).

### Step 7 — Collect DLP policies

First, list all DLP policies in the tenant:

```bash
pac admin dlp-policy list
```

Then, for each policy returned, get the full policy details including connector classifications:

```bash
pac admin dlp-policy show --policy-name "<policy-name-guid>"
```

Iterate through ALL policies. Each policy contains:
- Policy display name and description
- Environment scope (all environments, specific environments, or exclude certain environments)
- Connector classifications (Business, Non-Business, Blocked)
- Custom connector patterns

Include in the report:
- Total number of DLP policies
- Which environments are covered by which policies
- A summary of blocked/restricted connectors per policy

### Step 8 — Collect environment settings

For each environment discovered in Step 1, retrieve its Dataverse organization settings:

```bash
pac env list-settings --environment "<environment-id-or-url>"
```

This returns all columns from the Dataverse [Organization table](https://learn.microsoft.com/power-apps/developer/data-platform/reference/entities/organization) — a single-row table with environment-level configuration values.

You can also filter for specific settings:

```bash
pac env list-settings --environment "<environment-id-or-url>" --filter "audit"
```

Iterate through ALL environments and collect their settings. Key settings to highlight in the report include:
- `isabortenabled` — whether auditing is enabled
- `maxuploadfilesize` — maximum file upload size
- `blockedattachments` — blocked file extensions
- `sessiontimeoutenabled` / `sessiontimeoutinsecs` — session timeout configuration
- `plugintracelogsetting` — plugin trace log level
- `isabortenabled` — whether SLA abort is enabled

## Building the report

After collecting all data:

1. Summarize key metrics: total resources by type, resources per environment, recently created/modified items
2. Invoke the **frontend-design** skill to generate a self-contained HTML report with:
   - A hero section with headline stats (total apps, flows, agents, environments)
   - A breakdown by resource type (charts or styled tables)
   - An environment-by-environment breakdown showing each environment's name, type, region, managed status, and its resource counts
   - A timeline of recently created or modified resources
   - Filters or tabs for drilling into each resource type and each environment
   - A tenant governance section showing key tenant settings
   - A DLP policy overview showing all policies, their environment scopes, and connector classifications
   - An environment settings section highlighting key configuration per environment (auditing, session timeouts, upload limits, etc.)
3. The report should be a single `.html` file that works offline with no external dependencies
