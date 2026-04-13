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

Optionally save the output to a JSON file for processing:

```bash
pac admin list-tenant-settings --settings-file tenant-settings.json
```

**Parameters:**

| Parameter | Alias | Description |
|---|---|---|
| `--settings-file` | `-s` | Path to a `.json` file to output tenant settings |

This returns the full tenant settings JSON including security, governance, and feature flags. Include key settings in the report (e.g., who can create environments, sharing restrictions, AI features enabled).

### Step 7 — Collect DLP policies

First, list all DLP policies in the tenant:

```bash
pac admin dlp-policy list
```

This command takes no parameters and returns all DLP policies with their policy name (GUID) and display name.

Then, for each policy returned, get the full policy details including connector classifications:

```bash
pac admin dlp-policy show --policy-name "<policy-name-guid>"
```

**Parameters:**

| Parameter | Alias | Required | Description |
|---|---|---|---|
| `--policy-name` | `-pn` | Yes | The policy name (GUID identifier) |

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

**Parameters:**

| Parameter | Alias | Description |
|---|---|---|
| `--environment` | `-env` | Environment ID, URL, unique name, or partial name. Defaults to the active auth profile environment. |
| `--filter` | `-f` | Show only settings containing filter criteria |

This returns all columns from the Dataverse [Organization table](https://learn.microsoft.com/power-apps/developer/data-platform/reference/entities/organization) — a single-row table with environment-level configuration values.

You can also filter for specific settings:

```bash
pac env list-settings --environment "<environment-id-or-url>" --filter "audit"
```

Iterate through ALL environments and collect their settings. The command returns hundreds of settings — do NOT list them all in the report. Instead, analyze the output and only surface settings that represent a gap or risk. See the analysis section below for what to flag.

## Analyzing the data

After collecting all data, analyze EVERY piece of output from the PAC commands and the inventory API. Do not just present raw data — interpret it, flag issues, explain WHY each issue matters, and provide actionable next steps.

### Tenant settings analysis

Review every tenant setting and flag deviations from best practices:

| Setting area | What to check | Why it matters | Recommended action |
|---|---|---|---|
| Environment creation | Who can create production/sandbox environments | Unrestricted creation leads to environment sprawl, increases licensing costs, and creates ungoverned shadow IT | Restrict to admins only |
| Trial environments | Whether trials are enabled for everyone | Trials can contain business data that expires and gets deleted, causing data loss | Limit trial creation or set expiration policies |
| Sharing controls | Canvas app and flow sharing limits | Oversharing exposes sensitive business logic and data connections to unintended users | Set maximum share limits per environment |
| AI features | Copilot and AI Builder settings | Uncontrolled AI feature rollout may process data in ways that violate compliance policies | Review and explicitly enable/disable per compliance requirements |
| Guest access | Whether guest users can access Power Platform | External users accessing internal automations and data creates security and compliance risks | Restrict or audit guest access |

### DLP policy analysis

For each DLP policy, analyze:

| What to check | Why it matters | Recommended action |
|---|---|---|
| Environments without any DLP policy coverage | Unprotected environments allow makers to combine any connectors, risking data exfiltration (e.g., SharePoint → personal email) | Create at least a baseline DLP policy covering all environments |
| Policies with overly permissive Business connector groups | Sensitive connectors (e.g., SQL, Dataverse, SharePoint) in the same group as social/external connectors allow data to flow between them | Separate sensitive data connectors from external-facing connectors |
| Blocked connectors | Whether high-risk connectors (HTTP, custom connectors) are blocked where appropriate | Block HTTP and custom connectors in environments that don't need them to prevent arbitrary external API calls |
| Overlapping policies on the same environment | Multiple policies on one environment create confusion about which rules apply (most restrictive wins) | Consolidate overlapping policies for clarity |
| Default environment policy | Whether the default environment (where all users have Maker access) has strict DLP | The default environment is the highest risk because every licensed user can build in it | Apply the most restrictive DLP policy to the default environment |

### Environment settings analysis

For each environment, analyze these key settings and flag issues:

| Setting | Why it matters | What to flag |
|---|---|---|
| Auditing (`isauditenabled`) | Auditing tracks who did what and when — required for compliance (SOC2, ISO 27001, GDPR) and incident investigation | Flag any environment where auditing is **disabled** |
| Session timeout (`sessiontimeoutenabled` / `sessiontimeoutinsecs`) | Inactive sessions left open are a session hijacking risk, especially on shared devices | Flag environments without session timeout or with timeouts longer than 60 minutes |
| File upload size (`maxuploadfilesize`) | Large upload limits increase storage costs and can be abused to exfiltrate data via attachments | Flag environments with limits above 32 MB |
| Blocked attachments (`blockedattachments`) | Executable file types uploaded to Dataverse can be used for social engineering or malware distribution | Flag environments that do not block `.exe`, `.bat`, `.cmd`, `.js`, `.vbs` |
| Plugin trace logs (`plugintracelogsetting`) | Trace logs in production consume storage and may expose sensitive data in log entries | Flag production environments with trace logging set to **All** |
| Email settings | Misconfigured email integration can cause data leaks or delivery failures | Flag environments with server-side sync errors or unmonitored mailboxes |

### Inventory analysis

Analyze the resource data from the inventory API:

| What to check | Why it matters | Recommended action |
|---|---|---|
| Resources in the default environment | The default environment is not meant for production workloads — it has the weakest governance and every user has access | Move production apps/flows out of the default environment |
| Orphaned resources (owner no longer active) | Apps and flows owned by departed employees may stop working or become unmanageable, and no one receives error notifications | Reassign ownership or decommission |
| Quarantined apps/agents | Quarantined resources are blocked from running, indicating a policy violation or security concern | Investigate why each resource was quarantined and resolve or remove |
| Environments with no resources | Empty environments consume capacity and licensing entitlements for no business value | Delete or repurpose unused environments |
| Environments without Managed Environment enabled | Non-managed environments lack admin visibility, usage insights, and policy enforcement capabilities | Enable Managed Environments for all production and shared environments |
| Resources created outside Copilot Studio / standard tools | Resources with unexpected `createdIn` values may indicate shadow IT or unauthorized tooling | Review and bring under governance |
| Stale resources (not modified in 6+ months) | Unmaintained apps and flows accumulate technical debt, may reference deprecated connectors, and waste capacity | Review with business owners — archive or decommission |
| High resource count per environment | Too many resources in one environment makes governance harder and increases the blast radius of a security incident | Consider splitting into purpose-specific environments |
