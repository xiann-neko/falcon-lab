import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.2 — CrowdStrike APIs & Automation
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.2.1: Falcon API Fundamentals (OAuth2, Scopes) ──────────────────

const apiFundamentalsConcepts: ConceptSection[] = [
  {
    title: 'Falcon API Authentication: OAuth2 Client Credentials Flow',
    body: 'The Falcon platform API uses the OAuth2 client credentials flow for authentication. This is a machine-to-machine flow designed for automated scripts and integrations — it does not involve user login prompts.\n\n**Setup process (one-time):**\n1. In the Falcon console, navigate to **Support & Resources → API Clients & Keys**\n2. Click **Add new API client**\n3. Name the client (e.g., "SIEM-integration-readonly")\n4. Assign the minimum required scopes (e.g., Detections:Read)\n5. Save — you receive a **Client ID** and **Client Secret** (the secret is shown only once)\n\n**Token acquisition (every 30 minutes):**\n```\nPOST https://api.crowdstrike.com/oauth2/token\nContent-Type: application/x-www-form-urlencoded\n\nclient_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET\n```\n\nThe response includes an `access_token` (Bearer token) valid for 30 minutes.\n\n**Using the token:**\n```\nGET https://api.crowdstrike.com/detects/queries/detects/v1\nAuthorization: Bearer YOUR_ACCESS_TOKEN\n```\n\n**Security best practices:**\n- Store client credentials in a secrets manager (AWS Secrets Manager, HashiCorp Vault), never in code or config files\n- Use one API client per integration — do not share credentials between systems\n- Apply principle of least privilege — grant only the scopes the integration actually requires\n- Rotate client secrets periodically',
    codeExample: '# Acquire Falcon API bearer token\ncurl -s -X POST https://api.crowdstrike.com/oauth2/token \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "client_id=${FALCON_CLIENT_ID}&client_secret=${FALCON_CLIENT_SECRET}" \\\n  | jq -r \'.access_token\'',
    codeLanguage: 'bash',
  },
  {
    title: 'API Scopes: Least Privilege for SIEM/SOAR Integrations',
    body: 'Falcon API scopes control what each API client is permitted to read or write. Scopes are assigned per-verb (Read/Write) — an integration that only needs to read detections should have `Detections:Read` but NOT `Detections:Write`.\n\n**Key scopes for SIEM/SOAR engineers:**\n\n| Scope | Use case |\n|---|---|\n| `Detections:Read` | Query and retrieve detection alerts |\n| `Incidents:Read` | Query and retrieve incidents |\n| `Event Streams:Read` | Subscribe to the Falcon real-time event stream |\n| `Hosts:Read` | Query host/device inventory |\n| `Custom IOA Rules:Read/Write` | Manage custom detection rules |\n| `IOC Management:Read/Write` | Manage indicators of compromise |\n| `Workflows:Read/Write` | Interact with Fusion SOAR workflows |\n| `Falcon Intelligence:Read` | Access threat intelligence data |\n\n**Scope selection principle:** Before creating an API client, list every API endpoint the integration will call, identify the scope required for each, and grant only those scopes. A read-only SIEM integration should never have `:Write` scopes — if the credentials are compromised, the attacker cannot modify platform configuration.\n\n**Audit trail:** Every API call made with a client is logged in Falcon\'s audit log under the client\'s name. Using a descriptive client name (not "api-client-1") makes audit log review meaningful.',
  },
]

const apiFundamentalsQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q1',
    text: 'Which authentication flow does the Falcon API use for machine-to-machine integrations?',
    options: [
      'OAuth2 client credentials flow — the integration presents a Client ID and Client Secret to obtain a short-lived Bearer token (30-minute TTL) used in subsequent API requests',
      'API key authentication — a static API key is passed in the X-API-Key header on every request without a separate token acquisition step',
      'SAML 2.0 federated authentication — the integration authenticates via the organisation\'s identity provider (IdP) to obtain a Falcon API session token',
      'Basic authentication — the integration passes a Base64-encoded username:password in the Authorization header on every API request',
    ],
    correctIndex: 0,
    explanation: 'The Falcon API uses OAuth2 client credentials flow. The integration POST-s a Client ID and Client Secret to the token endpoint (`/oauth2/token`) and receives a short-lived Bearer token (30-minute TTL). This token is then passed as `Authorization: Bearer <token>` on all subsequent API calls. Static API keys, SAML federation, and Basic auth are not used by the Falcon platform API.',
    docTitle: 'Falcon API Authentication',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q2',
    text: 'What is the correct endpoint and method to obtain a Falcon API Bearer token?',
    options: [
      'GET https://api.crowdstrike.com/auth/token — include Client ID and Secret as query parameters',
      'POST https://api.crowdstrike.com/oauth2/token — include Client ID and Secret as form-encoded body parameters (application/x-www-form-urlencoded)',
      'POST https://api.crowdstrike.com/api/v1/authenticate — include Client ID and Secret as a JSON body',
      'GET https://auth.crowdstrike.com/oauth2/authorize — redirect the client to the Falcon login page to complete the OAuth2 authorization code flow',
    ],
    correctIndex: 1,
    explanation: 'The correct token endpoint is `POST https://api.crowdstrike.com/oauth2/token` with the body as `application/x-www-form-urlencoded` containing `client_id` and `client_secret`. GET requests do not work for token acquisition. The JSON body format is incorrect — the Falcon token endpoint requires form-encoded parameters. The authorization code flow (redirect to login page) is for user-facing OAuth2, not machine-to-machine client credentials.',
    docTitle: 'Falcon API Token Endpoint',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q3',
    text: 'A SIEM integration needs to query Falcon detections but should never be able to modify detection status or create custom IOA rules. Which scope assignment follows the principle of least privilege?',
    options: [
      'Grant Detections:Read, Detections:Write, Custom IOA Rules:Read, Custom IOA Rules:Write — broader scopes simplify future integration changes',
      'Grant Detections:Read, Incidents:Read, Hosts:Read — read-only scopes for the specific data the integration queries, with no write scopes',
      'Grant Detections:Read only — the minimum scope needed; add additional scopes only when a specific requirement is confirmed',
      'Grant Administrator scope — a single high-privilege scope is easier to manage than multiple specific scopes',
    ],
    correctIndex: 2,
    explanation: 'Principle of least privilege means granting the minimum scopes actually required — and nothing more. If the integration only queries detections, grant only `Detections:Read`. Adding `Incidents:Read` and `Hosts:Read` preemptively violates least privilege. Granting write scopes the integration does not need creates an attack surface: if the credentials are compromised, the attacker gains write capabilities. Administrator scope for a read-only integration is the worst possible choice.',
    docTitle: 'Falcon API Scope Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q4',
    text: 'A Falcon API Bearer token is acquired at 09:00. At what time does it expire?',
    options: [
      'At 17:00 (8 hours later) — Falcon tokens are valid for one business day',
      'At 09:24 (24 minutes later) — the token TTL matches the Falcon console session timeout',
      'At 10:00 (60 minutes later) — Falcon tokens are valid for one hour by default',
      'At 09:30 (30 minutes later) — Falcon API Bearer tokens have a fixed 30-minute TTL and must be refreshed by re-calling the token endpoint with the client credentials',
    ],
    correctIndex: 3,
    explanation: 'Falcon API Bearer tokens have a fixed 30-minute TTL. At 09:00, the token expires at 09:30. Integrations must implement token refresh logic — typically by catching a 401 Unauthorized response and re-acquiring a new token. There is no refresh token flow in the client credentials grant; the integration simply re-POSTs its client credentials to get a new token.',
    docTitle: 'Falcon API Token TTL',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q5',
    text: 'Where should Falcon API client credentials (Client ID and Client Secret) be stored in a production automation system?',
    options: [
      'In a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault) — credentials are retrieved at runtime and never stored in code, config files, or environment variable declarations in source control',
      'In the automation script as hardcoded variables — this is the most reliable way to ensure the integration always has access to its credentials',
      'In a plaintext config file in the deployment directory — config files are not tracked by git and are therefore safe from exposure',
      'In the CI/CD pipeline\'s environment variables file checked into the repository — this ensures all pipeline runs use the same credentials',
    ],
    correctIndex: 0,
    explanation: 'Client credentials must be stored in a dedicated secrets manager — never hardcoded, never in plaintext config files, and never in source control (including CI/CD environment variable files committed to git). Secrets managers provide: encrypted at-rest storage, access audit logging, rotation management, and just-in-time credential retrieval. Hardcoded credentials in scripts or config files are the most common cause of credential exposure via accidental git commits.',
    docTitle: 'Falcon API Credential Security',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
]

export const apiFundamentalsModule: ContentModule = {
  id: 'platform-api-fundamentals',
  title: 'Falcon API Fundamentals (OAuth2, Scopes)',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: apiFundamentalsConcepts,
  quiz: apiFundamentalsQuestions,
}

// ── Module 5.2.2: Key API Endpoints for SIEM/SOAR Engineers ─────────────────

const apiEndpointsConcepts: ConceptSection[] = [
  {
    title: 'Detection and Incident Endpoints',
    body: 'The detection and incident APIs are the most commonly used endpoints for SIEM/SOAR integrations. They follow a two-step query + entity-fetch pattern:\n\n**Step 1 — Query for IDs:**\n- `GET /detects/queries/detects/v1` — returns a list of detection IDs matching a filter\n- `GET /incidents/queries/incidents/v1` — returns a list of incident IDs\n- `GET /devices/queries/devices/v1` — returns a list of host AIDs\n\n**Step 2 — Fetch entity details by ID:**\n- `POST /detects/entities/summaries/GET/v1` — POST a body of `{ "ids": ["det:cid:id1", "det:cid:id2"] }` to get full detection details\n- `POST /incidents/entities/incidents/GET/v1` — POST incident IDs to get full incident details\n- `POST /devices/entities/devices/v2` — POST AIDs to get host details\n\n**FQL (Falcon Query Language) filters:** Both query endpoints accept an `filter` parameter using FQL syntax:\n- `filter=status:\'new\'` — detections in new/open state\n- `filter=severity_name:\'Critical\'+status:\'new\'` — critical unacknowledged detections\n- `filter=max_severity_displayname:\'High\'` — incidents with High max severity\n\n**Pagination:** Query endpoints return up to 500 IDs per call. Use `offset` and `limit` parameters for pagination:\n```\nGET /detects/queries/detects/v1?filter=status:\'new\'&limit=100&offset=100\n```',
    codeExample: '# Two-step pattern: query IDs then fetch details\n\n# Step 1: Get detection IDs (max 500 per call)\nIDS=$(curl -s -H "Authorization: Bearer $TOKEN" \\\n  "https://api.crowdstrike.com/detects/queries/detects/v1?filter=status:\'new\'&limit=100" \\\n  | jq -r \'.resources[]\')\n\n# Step 2: Fetch detection details\ncurl -s -X POST https://api.crowdstrike.com/detects/entities/summaries/GET/v1 \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d "{\"ids\": [\"$(echo $IDS | tr \' \' \'\",\"\')\"]}"',
    codeLanguage: 'bash',
  },
  {
    title: 'Event Streaming and Host Management Endpoints',
    body: 'Beyond detections and incidents, SIEM/SOAR engineers commonly use these endpoint groups:\n\n**Event Streaming (real-time):**\n- `GET /event-streams/entities/streams/v4` — list available streaming connections for the tenant\n- Subscribe to the partition URLs returned to receive real-time Falcon events (detections, audit events, auth events) as they occur\n- Unlike FDR (S3-based batch), the Event Streams API delivers events in real time with sub-second latency — use this for real-time alerting, not historical hunting\n\n**Host and Device Management:**\n- `GET /devices/queries/devices/v1?filter=platform_name:\'Windows\'+status:\'normal\'` — find all healthy Windows hosts\n- `POST /devices/entities/devices/v2` — get detailed host information (hostname, OS version, sensor version, last seen, containment status)\n- `POST /devices/action/v2` — trigger host actions: `contain` (network containment) or `lift_containment`\n\n**IOC Management:**\n- `POST /iocs/entities/indicators/v1` — create a custom IOC (block/monitor a file hash, IP, domain)\n- `GET /iocs/queries/indicators/v1` — list existing IOCs with filters\n- `DELETE /iocs/entities/indicators/v1` — delete an IOC\n\n**Rate Limits:** All Falcon API endpoints have rate limits (typically 100–6,000 requests per minute depending on the endpoint). Implement exponential backoff when receiving `429 Too Many Requests` responses.',
  },
]

const apiEndpointsQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q6',
    text: 'What is the correct two-step pattern for retrieving Falcon detection details via the API?',
    options: [
      'Step 1: POST /detects/entities/summaries/GET/v1 with an empty body to get all detections. Step 2: Filter the returned JSON client-side for the detections you need.',
      'Step 1: GET /detects/queries/detects/v1 with a filter to retrieve detection IDs. Step 2: POST /detects/entities/summaries/GET/v1 with those IDs to fetch full detection details.',
      'Step 1: GET /detects/entities/detects/v1 to fetch all detection details in a single paginated call. Step 2: Parse the response for the specific fields needed.',
      'Step 1: POST /detects/queries/detects/v1 with a filter payload. Step 2: GET /detects/entities/summaries/GET/v1 with the IDs as query parameters.',
    ],
    correctIndex: 1,
    explanation: 'The Falcon API uses a query-then-fetch pattern. Query endpoints (GET, returning IDs) and entity endpoints (POST with IDs, returning details) are separate. Step 1: `GET /detects/queries/detects/v1?filter=status:\'new\'` returns detection IDs. Step 2: `POST /detects/entities/summaries/GET/v1` with a body of `{"ids": [...]}` returns the full detection details. This two-step pattern is consistent across detections, incidents, and hosts.',
    docTitle: 'Falcon Detections API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
  },
  {
    id: 'platform-api-q7',
    text: 'A SOAR playbook needs to automatically place a compromised host in network containment via the Falcon API. Which endpoint and action name achieves this?',
    options: [
      'POST /network/containment/v1 with body {"device_id": "<aid>", "action": "isolate"}',
      'PATCH /devices/entities/devices/v2 with body {"aid": "<aid>", "contained": true}',
      'POST /devices/action/v2 with body {"action_name": "contain", "ids": ["<aid>"]} — the contain action triggers Falcon\'s network containment on the specified host, blocking all external network traffic while preserving the Falcon sensor connection',
      'POST /incidents/action/v1 with body {"action": "contain_host", "host_id": "<aid>"}',
    ],
    correctIndex: 2,
    explanation: '`POST /devices/action/v2` is the correct endpoint for host actions including network containment. The request body specifies `"action_name": "contain"` and the list of AIDs to contain. Containment blocks all network traffic except the Falcon sensor\'s connection to CrowdStrike, allowing remote investigation to continue. To lift containment, use the same endpoint with `"action_name": "lift_containment"`. The other endpoint paths do not exist in the Falcon API.',
    docTitle: 'Falcon Devices Action API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-devices',
  },
  {
    id: 'platform-api-q8',
    text: 'Your SIEM integration calls `GET /detects/queries/detects/v1` and receives 500 detection IDs in the response (the maximum per call). How do you retrieve additional detections beyond the first 500?',
    options: [
      'The Falcon API limits detection queries to 500 results per tenant per day — if you receive 500, you have seen all available detections',
      'Use the `next_page_token` from the response body in a subsequent GET request to retrieve the next page',
      'Increase the `limit` parameter beyond 500 — the 500 limit is a default, not a maximum',
      'Use the `offset` and `limit` parameters: increment `offset` by the `limit` value in each subsequent call (e.g., offset=0,limit=500 → offset=500,limit=500 → offset=1000) until the response resources array is empty or smaller than the limit',
    ],
    correctIndex: 3,
    explanation: 'The Falcon API query endpoints use `offset`-based pagination. The `limit` parameter is capped at 500 for most endpoints. To paginate beyond the first 500 results: call again with `offset=500&limit=500`, then `offset=1000&limit=500`, and so on. Stop when the response contains fewer IDs than the requested limit (indicating the last page) or when `resources` is empty. There is no `next_page_token` in the Falcon API — it uses explicit offset/limit parameters.',
    docTitle: 'Falcon API Pagination',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
  },
  {
    id: 'platform-api-q9',
    text: 'What is the key difference between the Falcon Event Streams API and FDR for real-time SIEM use cases?',
    options: [
      'The Event Streams API delivers real-time events with sub-second latency via a persistent connection — appropriate for real-time alerting and automated response; FDR is near-real-time (seconds to minutes via S3) — appropriate for detection, investigation, and hunting workloads',
      'FDR delivers real-time events and the Event Streams API delivers batch events — they are the reverse of what most documentation implies',
      'Both deliver the same events at the same latency; the difference is that FDR requires an S3 bucket while Event Streams uses a direct HTTP connection',
      'The Event Streams API and FDR are mutually exclusive — customers must choose one based on their SIEM architecture',
    ],
    correctIndex: 0,
    explanation: 'Event Streams API = real-time streaming (sub-second, persistent connection, appropriate for live detection and automated response). FDR = near-real-time batch to S3 (seconds to minutes, appropriate for hunting, investigation, and SIEM correlation). They are NOT mutually exclusive — many organisations use both: Event Streams for real-time response and FDR for historical analysis. The events delivered may overlap, but the latency and access patterns differ significantly.',
    docTitle: 'Falcon Event Streams API',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-streaming',
  },
  {
    id: 'platform-api-q10',
    text: 'A SOAR playbook calls the Falcon API and receives a 429 HTTP status code. What does this indicate and how should the playbook respond?',
    options: [
      'A 429 indicates the Bearer token has expired — the playbook should immediately re-authenticate and retry the request with a new token.',
      'A 429 indicates rate limiting — the API client has exceeded the allowed request rate for this endpoint. The playbook should implement exponential backoff: wait briefly, retry, and increase the wait interval on each successive 429 response.',
      'A 429 indicates the Falcon API is temporarily unavailable — the playbook should alert the SOC team and halt execution.',
      'A 429 indicates the API client does not have the required scope — the playbook should request additional permissions before retrying.',
    ],
    correctIndex: 1,
    explanation: '429 Too Many Requests is the standard HTTP rate limiting response. The Falcon API rate-limits clients per endpoint per minute. The correct response is exponential backoff: wait a short interval (e.g., 1 second), retry, and if another 429 is received, double the wait interval. Token expiry returns 401 Unauthorized; API unavailability returns 503 Service Unavailable; insufficient scope returns 403 Forbidden.',
    docTitle: 'Falcon API Rate Limiting',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-rate-limits',
  },
]

export const apiEndpointsModule: ContentModule = {
  id: 'platform-api-endpoints',
  title: 'Key API Endpoints for SIEM/SOAR Engineers',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: apiEndpointsConcepts,
  quiz: apiEndpointsQuestions,
}

// ── Module 5.2.3: Building Automation Scripts Against the API ────────────────

const apiAutomationConcepts: ConceptSection[] = [
  {
    title: 'FalconPy: The Official CrowdStrike Python SDK',
    body: 'FalconPy is CrowdStrike\'s officially supported Python SDK for the Falcon API. It handles OAuth2 token acquisition and refresh automatically, provides a class-based interface for each API service, and abstracts pagination helpers.\n\n**Installation:**\n```\npip install crowdstrike-falconpy\n```\n\n**Basic usage pattern:**\n```python\nfrom falconpy import Detections\n\nfalcon = Detections(\n    client_id=os.environ["FALCON_CLIENT_ID"],\n    client_secret=os.environ["FALCON_CLIENT_SECRET"]\n)\n\n# Query detection IDs\nids_response = falcon.query_detections(filter="status:\'new\'")\ndetection_ids = ids_response["body"]["resources"]\n\n# Fetch detection details\ndetails_response = falcon.get_detect_summaries(ids=detection_ids)\ndetections = details_response["body"]["resources"]\n```\n\nFalconPy automatically refreshes the Bearer token when it expires — no manual token management required. It also handles the two-step query/entity pattern transparently for most service classes.\n\n**Key service classes for SIEM/SOAR:**\n- `Detections` — manage detections\n- `Incidents` — manage incidents\n- `Hosts` — query and act on endpoints\n- `IOC` — manage indicators of compromise\n- `Intel` — access Falcon Intelligence data\n- `EventStreams` — subscribe to real-time event streams',
  },
  {
    title: 'Production Script Patterns: Error Handling and Reliability',
    body: 'A production-grade Falcon API automation script requires more than happy-path API calls. Key reliability patterns:\n\n**Token refresh handling (without FalconPy):**\n- Check token expiry before each API call (subtract 60 seconds from 30-minute TTL for safety margin)\n- Re-acquire token proactively rather than waiting for a 401 response mid-run\n\n**Rate limit handling:**\n- Implement exponential backoff with jitter on 429 responses\n- Use the `X-Ratelimit-Remaining` and `X-Ratelimit-RetryAfter` response headers to pace requests\n\n**Idempotent operations:**\n- SOAR automation scripts should be designed to run safely if triggered multiple times for the same event\n- Check if an action has already been taken (e.g., host already contained) before executing containment\n- Use the Falcon audit log to verify prior actions rather than assuming state\n\n**Logging and observability:**\n- Log every API call with: timestamp, endpoint, HTTP status, request ID from response headers\n- Log all state changes (detection status updated, host contained, IOC created) with the detection/incident ID as correlation key\n- Alert on repeated 401 or 403 errors — these indicate credential issues, not transient failures\n\n**Testing automation against Falcon:**\n- Use the Falcon API sandbox environment for development (separate CID with test data)\n- Test error paths explicitly: simulate 429, 401, and 503 responses\n- Validate that idempotent actions do not create duplicate results',
  },
]

const apiAutomationQuestions: QuizQuestion[] = [
  {
    id: 'platform-api-q11',
    text: 'What is the primary advantage of using FalconPy (the official Python SDK) over making raw HTTP requests to the Falcon API?',
    options: [
      'FalconPy provides access to undocumented Falcon API endpoints not available via direct HTTP calls',
      'FalconPy delivers faster API responses than direct HTTP by maintaining a persistent connection pool to CrowdStrike servers',
      'FalconPy automatically handles OAuth2 token acquisition and refresh, eliminating manual token management from automation scripts',
      'FalconPy is required by CrowdStrike — third-party HTTP clients are blocked by the Falcon API gateway',
    ],
    correctIndex: 2,
    explanation: 'FalconPy\'s primary practical advantage is automatic OAuth2 token management — it acquires the initial token and refreshes it transparently when it expires, so automation scripts do not need to implement token lifecycle logic. It also provides a clean service-based interface that abstracts the two-step query/entity pattern. FalconPy does not have access to undocumented APIs, does not provide faster responses (it makes the same HTTP calls), and is not required — any HTTP client can call the Falcon API.',
    docTitle: 'FalconPy Python SDK',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-sdk',
  },
  {
    id: 'platform-api-q12',
    text: 'A SOAR playbook is triggered by a Falcon detection and should automatically contain the affected host. Before executing containment, what should the script check?',
    options: [
      'Whether the detection severity is Critical — containment should only be triggered for Critical detections, not High or Medium',
      'Whether the detection was created in the last 5 minutes — older detections may be stale and should not trigger automated containment',
      'Whether the host already exists in Falcon — if it does not exist, containment will fail silently',
      'Whether the host is already contained — triggering containment on an already-contained host is a redundant operation; checking first prevents duplicate audit log entries and allows the playbook to log that containment was already in place',
    ],
    correctIndex: 3,
    explanation: 'Checking the current host containment status before executing containment is the idempotent design pattern: if the host is already contained (by a prior run, a manual action, or another automation), the playbook logs this state and continues without re-triggering containment. This prevents duplicate actions, keeps the audit log clean, and ensures the playbook is safe to re-run on the same detection without side effects.',
    docTitle: 'Falcon API Automation Best Practices',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-sdk',
  },
  {
    id: 'platform-api-q13',
    text: 'Your Falcon API automation script logs a sustained series of 401 Unauthorized responses after running successfully for weeks. What is the most likely cause?',
    options: [
      'The Falcon API client credentials (Client ID or Client Secret) have been rotated or the client has been deleted — the automation is using stale credentials that are no longer valid',
      'The Bearer token TTL has changed from 30 minutes to a shorter interval — the script\'s token refresh interval is now too long',
      'The Falcon API rate limit for the token endpoint has been exceeded — 401 responses are returned instead of 429 when too many token requests are made',
      'The API client\'s scopes have been automatically reduced by CrowdStrike\'s quarterly permission review process',
    ],
    correctIndex: 0,
    explanation: 'A sustained series of 401 Unauthorized responses after a previously working integration almost always indicates a credential problem: the Client Secret was rotated (a new secret was generated, invalidating the old one), the API client was deleted, or the client was suspended. Bearer token refresh logic handles 401s from expired tokens with a single re-auth; sustained 401s across multiple re-auth attempts indicate the credentials themselves are no longer valid.',
    docTitle: 'Falcon API Credential Troubleshooting',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-api-q14',
    text: 'Which Falcon API response header tells an automation script how long to wait before retrying after receiving a 429 rate limit response?',
    options: [
      'X-CrowdStrike-Wait-Seconds — a CrowdStrike-specific header indicating the retry interval in seconds',
      'X-Ratelimit-RetryAfter — contains the Unix timestamp after which the next request will be accepted; the script should wait until this time before retrying',
      'Retry-After — the standard HTTP header (in seconds) that all Falcon API rate-limit responses include',
      'X-Ratelimit-Reset — contains the epoch time when the rate limit window resets for this endpoint',
    ],
    correctIndex: 1,
    explanation: 'The Falcon API uses `X-Ratelimit-RetryAfter`, which contains a Unix timestamp indicating when the rate limit resets for this endpoint. The script should calculate the wait duration by subtracting the current time from this timestamp and sleeping for that interval. The companion header `X-Ratelimit-Remaining` shows how many requests remain in the current window — useful for proactive rate limit management.',
    docTitle: 'Falcon API Rate Limit Headers',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-rate-limits',
  },
  {
    id: 'platform-api-q15',
    text: 'You are building a Falcon API integration for a new security tool. Which practice best ensures the integration remains maintainable as the Falcon API evolves?',
    options: [
      'Hardcode all API response field names directly in the application logic — this ensures the integration does not break when CrowdStrike changes its field documentation',
      'Pin to the specific API version in use today and never update — API version changes always break backward compatibility',
      'Use CrowdStrike-versioned API paths (e.g., `/v1`, `/v2`) and update the integration when CrowdStrike deprecates older API versions, checking the Falcon API changelog and deprecation notices regularly',
      'Build the integration against the Falcon API Swagger/OpenAPI specification and regenerate client code from the spec on a weekly schedule to stay current automatically',
    ],
    correctIndex: 2,
    explanation: 'Using versioned API paths and monitoring the Falcon API changelog for deprecation notices is the sustainable maintenance approach. CrowdStrike maintains backward compatibility within a version (e.g., `/v1`) and announces deprecations in advance when a new version (`/v2`) replaces an old one. Hardcoding field names in application logic breaks when fields are renamed or removed. Pinning to a version without updating eventually hits a forced migration when the version is sunset. Auto-regenerating from Swagger weekly introduces untested changes without validation.',
    docTitle: 'Falcon API Versioning',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-versioning',
  },
]

export const apiAutomationModule: ContentModule = {
  id: 'platform-api-automation',
  title: 'Building Automation Scripts Against the Falcon API',
  trackId: 'platform-api',
  domainId: 'platform',
  order: 3,
  lastReviewed: '2026-08-17',
  concepts: apiAutomationConcepts,
  quiz: apiAutomationQuestions,
}

// ── Track 5.2 Scenario ─────────────────────────────────────────────────────

const apiScenario: Scenario = {
  id: 'platform-api-scenario',
  title: 'Building the Integration: Falcon API for Automated Triage',
  context: 'You are building a SOAR automation that automatically triages Falcon detections: new Critical detections should trigger host containment after analyst approval. The SOAR system uses the Falcon API. You are designing the authentication, query, and action logic.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-api-s1',
      narrative: 'You need to create a Falcon API client for the SOAR integration. The integration will: (1) query new Critical detections, (2) read host details, and (3) trigger network containment after analyst approval. Which scope set follows least privilege?',
      choices: [
        { text: 'Detections:Read, Hosts:Read, Devices:Write — the minimum scopes for querying detections, reading host details, and triggering containment actions' },
        { text: 'Detections:Read, Incidents:Read, Hosts:Read, Hosts:Write, Custom IOA Rules:Read, Workflows:Read, Falcon Intelligence:Read — broad read access prevents future scope additions' },
        { text: 'Administrator — a single high-privilege scope eliminates scope configuration complexity' },
        { text: 'Detections:Write, Hosts:Write, Devices:Write — write scopes include read access, so this reduces the number of scope assignments' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'The broad scope set violates least privilege — granting Intelligence, Workflows, and IOA Rules scopes to a triage-only integration creates unnecessary attack surface. Administrator scope is the most dangerous option. Write-only scopes do not include read access in the Falcon API — they are genuinely separate.',
      reasoning: 'The integration needs exactly three capabilities: read detections (Detections:Read), read host information (Hosts:Read), and trigger containment actions on devices (Devices:Write — the containment action endpoint requires this scope). No other scopes are needed for this use case. Grant exactly these three; add additional scopes only when a specific new requirement is confirmed.',
      docTitle: 'Falcon API Client Scope Configuration',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-api-s2',
      narrative: 'Your script acquires a Bearer token at integration startup. After 35 minutes, it calls `GET /detects/queries/detects/v1` and receives a 401 Unauthorized response. What should the script do?',
      choices: [
        { text: 'Log the 401 as a fatal error and halt execution — the integration credentials may have been revoked' },
        { text: 'Re-acquire a new Bearer token by re-calling POST /oauth2/token with the client credentials, then retry the failed request with the new token — a 401 after 30+ minutes is almost certainly a token expiry, not a credential problem' },
        { text: 'Retry the request with the same expired token — some API endpoints accept tokens beyond their 30-minute TTL' },
        { text: 'Sleep for 30 minutes and retry — the token will automatically renew after its TTL expires' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Halting on the first 401 is too aggressive — token expiry is expected after 30 minutes and is handled by re-authentication. Retrying with an expired token will produce another 401. Tokens do not auto-renew — the integration must explicitly re-call the token endpoint. Sleeping 30 minutes is a non-functional approach to token refresh.',
      reasoning: 'A 401 after 35 minutes of operation is almost certainly token expiry (TTL = 30 minutes). The correct response is immediate re-authentication: POST /oauth2/token with client credentials to get a new token, then retry the original request. Production scripts should track token acquisition time and proactively refresh the token 60 seconds before expiry rather than waiting for a 401.',
      docTitle: 'Falcon API Token Refresh',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-api-s3',
      narrative: 'You call `GET /detects/queries/detects/v1?filter=status:\'new\'+severity_name:\'Critical\'` and receive exactly 500 detection IDs. You need all new Critical detections, not just the first 500. What do you do?',
      choices: [
        { text: 'Accept the 500-ID response as complete — the Falcon API guarantees that Critical detections always fit within the 500-result limit' },
        { text: 'Use a tighter time-based filter (e.g., `created_timestamp:>\'2026-01-01\'`) to reduce the result set below 500 — this is the recommended approach for large result sets' },
        { text: 'Paginate using offset/limit: call again with offset=500,limit=500; continue incrementing offset by 500 until a response returns fewer than 500 IDs, indicating the last page has been reached' },
        { text: 'Switch to the POST /detects/queries/detects/v1 endpoint — the POST version supports unlimited results and does not have the 500-ID cap' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'A 500-ID response does not guarantee completeness — it guarantees there are AT LEAST 500 results; there may be thousands more. Time-based sub-filtering may miss detections outside the filtered window. There is no unlimited POST version of the query endpoint — both GET and POST-based query endpoints use the same 500-per-call limit with offset pagination.',
      reasoning: 'When the query returns exactly 500 IDs (the maximum), there may be more. Paginate by incrementing offset: offset=0 limit=500, then offset=500 limit=500, then offset=1000 limit=500, and so on until a response returns fewer than 500 IDs (or zero). Collect all IDs across all pages before fetching entity details in batches.',
      docTitle: 'Falcon API Pagination',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-detections',
    },
    {
      id: 'pf-api-s4',
      narrative: 'You are about to trigger network containment on the affected host via `POST /devices/action/v2`. Before executing, the script calls `POST /devices/entities/devices/v2` to check the host\'s current status. The response shows `"status": "containment_pending"`. What should the script do?',
      choices: [
        { text: 'Trigger containment anyway — the API is idempotent and will handle duplicate containment requests gracefully' },
        { text: 'Abort the entire playbook — if containment is pending, the playbook has been triggered in error' },
        { text: 'Escalate to a human analyst — automated scripts cannot handle containment_pending status and require manual intervention' },
        { text: 'Wait 60 seconds and re-check the status — containment_pending means the sensor is processing the command; proceed when status becomes "contained" or log that containment was already in progress if the timeout is reached' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Triggering containment on a host in "containment_pending" state sends a duplicate command that the sensor is already processing — potentially causing unexpected state transitions. Aborting the entire playbook loses the rest of the triage workflow. Automated scripts can absolutely handle containment_pending — it is a standard expected state during automated workflows.',
      reasoning: 'Wait and re-poll is the correct handling for "containment_pending": the Falcon sensor has received the containment command and is applying it. Retrying after 60 seconds allows the sensor to complete the pending containment and report "contained" status. If the timeout is reached without a state transition, log the anomaly and alert a human. This is a standard SOAR polling pattern for asynchronous Falcon operations.',
      docTitle: 'Falcon Host Containment Status',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-devices',
    },
    {
      id: 'pf-api-s5',
      narrative: 'Your SOAR integration has been running in production for 3 months. The Falcon API changelog announces that `/detects/queries/detects/v1` will be deprecated in 6 months in favour of `/detects/queries/detects/v2` with an improved filter syntax. What should you do?',
      choices: [
        { text: 'Update the integration to use `/v2` before the deprecation deadline, validate the new endpoint in a non-production environment first, and update the FQL filter syntax to match the v2 specification — planned migrations during deprecation windows are safer than emergency updates after sunset' },
        { text: 'Continue using `/v1` indefinitely — CrowdStrike rarely enforces API deprecation deadlines and the endpoint will likely remain functional after the announced sunset date' },
        { text: 'Replace the entire SOAR integration with a new one built on the Falcon console UI — API integrations are inherently fragile and UI-based workflows are more stable' },
        { text: 'Contact CrowdStrike support to request an exemption from the deprecation — long-running production integrations are typically granted permanent extensions' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Ignoring deprecation timelines and assuming CrowdStrike will not enforce them is the highest-risk approach — when the sunset happens, the integration breaks in production without warning. Replacing API integrations with UI-based workflows is not scalable for automated SOAR. Support exemptions exist for genuinely exceptional cases but should not be relied on as a maintenance strategy.',
      reasoning: 'The 6-month deprecation window is ample time for a planned migration. The correct approach: (1) read the v2 changelog to identify filter syntax changes, (2) implement v2 support in a development branch, (3) validate against the Falcon sandbox environment, (4) deploy to production well before the deadline. Planned migrations during deprecation windows are always safer, cheaper, and less disruptive than emergency remediations after a broken production integration.',
      docTitle: 'Falcon API Versioning and Deprecation',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-versioning',
    },
  ],
}

// ── Track 5.2 Export ────────────────────────────────────────────────────────

export const apiTrack: ContentTrack = {
  id: 'platform-api',
  title: 'CrowdStrike APIs & Automation',
  domainId: 'platform',
  order: 2,
  modules: [apiFundamentalsModule, apiEndpointsModule, apiAutomationModule],
  scenario: apiScenario,
}
