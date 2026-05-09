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

### Canvas apps

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.isQuarantined` | boolean | Whether the app is quarantined |

### Model-driven apps

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.isQuarantined` | boolean | Whether the app is quarantined |
| `properties.appModuleId` | string | Dataverse app module ID |
| `properties.logicalName` | string | Dataverse logical name |

### Code apps

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.isQuarantined` | boolean | Whether the app is quarantined |
| `properties.subType` | string | Code app subtype: `byocApp` or `vibeApp` |

### App Builder apps

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.isQuarantined` | boolean | Whether the app is quarantined |
| `properties.subType` | string | App subtype (currently `appBuilderApp`) |

### Cloud flows

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.workflowEntityId` | string | Dataverse workflow entity ID |

### Agent flows

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.workflowEntityId` | string | Dataverse workflow entity ID |

### Workflow agent flows (M365 agent flows)

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastModifiedAt` | datetime | Last modified timestamp |
| `properties.lastModifiedBy` | string | Last modifier object ID |
| `properties.workflowEntityId` | string | Dataverse workflow entity ID |

### Copilot Studio agents

#### Core properties

| Field | Type | Description |
|---|---|---|
| `properties.ownerId` | string | Owner object ID |
| `properties.environmentId` | string | Environment identifier |
| `properties.lastPublishedAt` | datetime | Last published timestamp (empty if still in draft) |
| `properties.createdIn` | string | Authoring tool: `Copilot Studio` or `Microsoft 365 Copilot Agent Builder` |
| `properties.schemaName` | string | Dataverse schema name |
| `properties.isQuarantined` | boolean | Whether the agent is quarantined (Preview) |
| `properties.quarantinedAt` | datetime | When the agent was last quarantined (Preview) |
| `properties.isManaged` | boolean | Part of a managed solution (Preview) |

#### Identity properties

| Field | Type | Description | Available for |
|---|---|---|---|
| `properties.botId` | string | CDS bot ID in the environment | Copilot Studio agents, M365 Agent Builder agents |
| `properties.entraAppId` | string | Entra App Registration ID (legacy) | Copilot Studio agents only |
| `properties.entraAgentId` | string | Entra Agent Identity ID | Copilot Studio agents only |
| `properties.entraAgentBlueprintId` | string | Entra Agent Blueprint ID | Copilot Studio agents only |

> **Note:** `entraAppId` is a legacy identifier. Newer agents use `entraAgentId` and `entraAgentBlueprintId` instead. None of these identity properties apply to M365 Copilot Agent Builder agents.

#### Configuration properties (Preview)

| Field | Type | Description |
|---|---|---|
| `properties.orchestration` | string | Orchestration mode: `Classic` (topic-based dialog trees) or `Generative` (AI dynamically selects topics/actions) |
| `properties.model` | string | AI model used by the agent (e.g. `gpt-4o`) |
| `properties.authentication` | string | Auth mode: `None`, `Microsoft Entra`, or `Generic OAuth 2.0` |
| `properties.channels` | array | Display names of published channels (e.g. `["Teams","SharePoint"]`) |

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
        "'microsoft.powerapps/codeapps'",
        "'microsoft.powerapps/apps'",
        "'microsoft.powerautomate/cloudflows'",
        "'microsoft.powerautomate/agentflows'",
        "'microsoft.powerautomate/m365agentflows'",
        "'microsoft.copilotstudio/agents'"
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

### Step 9 — Collect storage capacity data

Retrieve tenant-level and per-environment storage capacity using the Power Platform Admin API:

```
GET https://api.powerplatform.microsoft.com/api/v1.0/tenant-capacity-details
```

**Authentication**: Use a Bearer token with Power Platform admin privileges.

**Response structure**:

```json
{
  "value": [
    {
      "tenantId": "string",
      "capacityType": "Database",
      "totalCapacity": 30.0,
      "usedCapacity": 12.4,
      "availableCapacity": 17.6,
      "environmentCapacities": [
        {
          "environmentId": "string",
          "environmentName": "string",
          "capacityType": "Database",
          "totalCapacity": 5.0,
          "usedCapacity": 3.24,
          "availableCapacity": 1.76
        }
      ]
    }
  ]
}
```

The response contains entries for each capacity type: **Database**, **File**, and **Log**. Each entry includes tenant-level totals and a breakdown per environment.

**To get the Bearer token via Azure CLI**:

```bash
az account get-access-token --resource "https://api.powerplatform.microsoft.com" --query accessToken -o tsv
```

Then call the API:

```bash
TOKEN=$(az account get-access-token --resource "https://api.powerplatform.microsoft.com" --query accessToken -o tsv)
curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/json" \
  "https://api.powerplatform.microsoft.com/api/v1.0/tenant-capacity-details"
```

For each capacity type (Database, File, Log), collect:
- **Tenant level**: total capacity, used capacity, available capacity, utilization percentage
- **Per environment**: environment name, used capacity per type, percentage of tenant total

Include in the report:
- Tenant-wide storage summary (total/used/available by type)
- Per-environment storage breakdown table sorted by total usage descending
- Utilization percentage for each environment
- Flags for environments consuming disproportionate storage

### Step 10 — Collect licensing data

Retrieve tenant licensing and capacity add-on information. There is no single `pac` CLI command for this, so use the Power Platform Admin API and Microsoft Graph:

#### 10a — Tenant capacity add-ons

```
GET https://api.powerplatform.microsoft.com/api/v1.0/capacity/add-ons
```

This returns purchased and consumed capacity for add-ons like:
- Power Apps per-user / per-app plans
- Power Automate per-user / per-flow plans
- Copilot Studio sessions
- AI Builder credits
- Dataverse storage (Database, File, Log) add-ons
- Power Pages capacity

#### 10b — Microsoft 365 license assignments (via Microsoft Graph)

To get license assignment data for users in the tenant:

```bash
az rest --method GET --url "https://graph.microsoft.com/v1.0/subscribedSkus" --headers "Content-Type=application/json"
```

This returns all subscribed SKUs (license plans) with:
- `skuPartNumber` — license plan name
- `prepaidUnits.enabled` — total purchased
- `consumedUnits` — total assigned

Filter for Power Platform-relevant SKUs:
- `POWERAPPS_PER_USER` — Power Apps per User
- `FLOW_PER_USER` — Power Automate per User
- `POWERAPPS_PER_APP` — Power Apps per App
- `POWER_AUTOMATE_FLOW` — Power Automate per Flow
- `COPILOT_STUDIO` — Copilot Studio
- `POWERAPPS_VIRAL` — Power Apps Developer
- Other SKUs containing `POWER` or `FLOW`

Include in the report:
- License plan summary table (plan name, purchased, assigned, available, utilization %)
- Capacity-based add-ons summary (AI Builder credits, storage, Power Pages capacity)
- Top license consumers (users holding the most Power Platform licenses)
- Flags for plans near capacity (>85% utilization) or with unassigned licenses

## Analyzing the data

After collecting all data, analyze EVERY piece of output from the PAC commands and the inventory API. Do not just present raw data — interpret it, flag issues, explain WHY each issue matters, and provide actionable next steps.

**For every setting that deviates from best practice, you MUST explain:**

1. **What** the current value is
2. **Why** this is a problem — the specific business, security, or compliance risk it creates
3. **What could happen** if it is not fixed — concrete scenarios (e.g., "an attacker could…", "if an employee leaves…", "during an audit, this would…")
4. **How** to fix it — the exact `pac` CLI command, admin center action, or policy change needed
5. **Priority** — Critical / High / Medium / Low based on likelihood and impact

### Tenant settings analysis

Review every tenant setting and flag deviations from best practices. For each flagged setting, explain the current value, why it is risky with a concrete example of what could go wrong, and how to fix it:

| Setting area | What to check | Why it matters | Recommended action |
|---|---|---|---|
| Environment creation | Who can create production/sandbox environments | Unrestricted creation leads to environment sprawl, increases licensing costs, and creates ungoverned shadow IT | Restrict to admins only |
| Trial environments | Whether trials are enabled for everyone | Trials can contain business data that expires and gets deleted, causing data loss | Limit trial creation or set expiration policies |
| Sharing controls | Canvas app and flow sharing limits | Oversharing exposes sensitive business logic and data connections to unintended users | Set maximum share limits per environment |
| AI features | Copilot and AI Builder settings | Uncontrolled AI feature rollout may process data in ways that violate compliance policies | Review and explicitly enable/disable per compliance requirements |
| Guest access | Whether guest users can access Power Platform | External users accessing internal automations and data creates security and compliance risks | Restrict or audit guest access |

### DLP policy analysis

For each DLP policy, analyze the configuration and explain what risk each gap introduces — not just that it exists, but what a malicious or careless user could do because of it:

| What to check | Why it matters | Recommended action |
|---|---|---|
| Environments without any DLP policy coverage | Unprotected environments allow makers to combine any connectors, risking data exfiltration (e.g., SharePoint → personal email) | Create at least a baseline DLP policy covering all environments |
| Policies with overly permissive Business connector groups | Sensitive connectors (e.g., SQL, Dataverse, SharePoint) in the same group as social/external connectors allow data to flow between them | Separate sensitive data connectors from external-facing connectors |
| Blocked connectors | Whether high-risk connectors (HTTP, custom connectors) are blocked where appropriate | Block HTTP and custom connectors in environments that don't need them to prevent arbitrary external API calls |
| Overlapping policies on the same environment | Multiple policies on one environment create confusion about which rules apply (most restrictive wins) | Consolidate overlapping policies for clarity |
| Default environment policy | Whether the default environment (where all users have Maker access) has strict DLP | The default environment is the highest risk because every licensed user can build in it | Apply the most restrictive DLP policy to the default environment |

### Environment settings analysis

For each environment, analyze these key settings and flag issues. Do not just say a setting is wrong — explain the real-world consequence of leaving it as-is:

| Setting | Why it matters | What to flag |
|---|---|---|
| Auditing (`isauditenabled`) | Auditing tracks who did what and when — required for compliance (SOC2, ISO 27001, GDPR) and incident investigation | Flag any environment where auditing is **disabled** |
| Session timeout (`sessiontimeoutenabled` / `sessiontimeoutinsecs`) | Inactive sessions left open are a session hijacking risk, especially on shared devices | Flag environments without session timeout or with timeouts longer than 60 minutes |
| File upload size (`maxuploadfilesize`) | Large upload limits increase storage costs and can be abused to exfiltrate data via attachments | Flag environments with limits above 32 MB |
| Blocked attachments (`blockedattachments`) | Executable file types uploaded to Dataverse can be used for social engineering or malware distribution | Flag environments that do not block `.exe`, `.bat`, `.cmd`, `.js`, `.vbs` |
| Plugin trace logs (`plugintracelogsetting`) | Trace logs in production consume storage and may expose sensitive data in log entries | Flag production environments with trace logging set to **All** |
| Email settings | Misconfigured email integration can cause data leaks or delivery failures | Flag environments with server-side sync errors or unmonitored mailboxes |

### Inventory analysis

Analyze the resource data from the inventory API. For every finding, describe the governance risk and what happens if the issue is left unaddressed:

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

### Storage capacity analysis

After collecting storage capacity data (Step 9), analyze utilization and flag risks:

| What to check | Why it matters | What to flag |
|---|---|---|
| Tenant-level utilization above 80% | Running out of storage blocks new record creation and can cause flow failures and app errors across all environments | Plan capacity add-on purchase or archive old data |
| Single environment consuming >30% of tenant capacity | One environment dominating storage limits headroom for others and increases blast radius of data issues | Investigate large tables, archive historical data, or split workloads |
| Log storage growing disproportionately | Excessive audit logs or plugin trace logs consume capacity without clear business value | Review plugin trace log settings, archive old audit logs, reduce async operation retention |
| Environments with near-zero storage | Empty environments still consume a baseline allocation — combined with no resources, they waste capacity | Delete or repurpose unused environments |
| File storage significantly larger than database | May indicate large attachments, images, or documents stored in Dataverse rather than SharePoint/Blob storage | Review attachment policies, consider moving files to SharePoint integration |

### Licensing analysis

After collecting licensing data (Step 10), analyze allocation and flag risks:

| What to check | Why it matters | What to flag |
|---|---|---|
| License utilization above 85% | Running out of licenses blocks new user onboarding and can prevent existing users from accessing apps | Plan license procurement or reclaim unused licenses |
| Licenses assigned to inactive users | Departed or inactive users holding licenses wastes budget and may indicate stale access | Reclaim licenses from users inactive for 90+ days |
| Users with multiple overlapping licenses | Per-user and per-app licenses on the same user is redundant spending | Consolidate to the most cost-effective license type |
| Capacity-based add-ons near limits | AI Builder credits, Power Pages capacity, or Dataverse storage add-ons running low can cause service disruptions | Monitor consumption trends and plan procurement |
| Environments without sufficient license coverage | Users accessing apps in environments without proper licensing creates compliance risk | Ensure all active environments have appropriate license coverage |
