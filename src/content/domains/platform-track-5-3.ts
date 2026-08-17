import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.3 — Reporting & Governance
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.3.1: Scheduled Reports & Executive Dashboards ──────────────────

const reportingConcepts: ConceptSection[] = [
  {
    title: 'LogScale Scheduled Searches: Automating Recurring Reports',
    body: 'LogScale saved searches can be scheduled to run automatically and deliver results to stakeholders who do not have direct LogScale access. Scheduled searches are the primary mechanism for recurring operational reports.\n\n**Creating a scheduled search:**\n1. Write and validate a CQL query in LogScale\n2. Save it as a saved search with a descriptive name\n3. Configure a schedule: frequency (hourly, daily, weekly), time, and time zone\n4. Set an alert threshold: trigger delivery only if the query returns results, or always deliver\n5. Configure delivery: email (CSV attachment or inline summary), webhook, or Slack\n\n**Key scheduled report use cases for SIEM/SOAR engineers:**\n\n| Report | Query pattern | Audience |\n|---|---|---|\n| Daily detection summary | Count detections by severity, last 24h | SOC lead |\n| Weekly MTTD report | Average time from event to detection, last 7 days | Security manager |\n| Monthly threat summary | Top detection types, affected hosts, remediation rate | CISO |\n| Compliance report | Specific event types required by framework (e.g., all admin logins, last 30 days) | Audit team |\n\n**Delivery format considerations:**\n- **CSV email attachment:** Suitable for data-heavy reports consumed by analysts in Excel/Sheets\n- **Inline summary email:** Suitable for executive-level reports needing a simple narrative view\n- **Webhook/Slack:** Suitable for operational alerts to a SOC channel on a schedule',
  },
  {
    title: 'Executive Dashboards in LogScale: Metrics That Matter',
    body: 'LogScale dashboards aggregate multiple saved searches into a visual view. Dashboards can be shared via a read-only link — allowing executives and stakeholders to view real-time metrics without a LogScale account.\n\n**Key SIEM metrics for executive dashboards:**\n\n**Operational metrics:**\n- Alert volume by severity (Critical / High / Medium / Low) — trend over time\n- Mean Time to Detect (MTTD): average time between event occurrence and Falcon detection\n- Mean Time to Respond (MTTR): average time between detection and analyst acknowledgement\n- Detection-to-containment time: MTTD + analyst response + containment execution\n\n**Coverage metrics:**\n- Endpoint coverage: % of known endpoints with active Falcon sensors\n- FDR telemetry coverage: % of expected event types present in the last 24 hours\n- LogScale ingest health: events/second compared to expected baseline\n\n**Trend metrics:**\n- Week-over-week alert volume change\n- Top recurring detection types (recurring detections may indicate a detection tuning gap)\n- Repeat offender endpoints (same host generating detections repeatedly)\n\n**Dashboard sharing options:**\n- **Public link:** Anyone with the link can view (no auth required) — use only for internal non-sensitive dashboards\n- **Logged-in users:** Only users with LogScale accounts can view — appropriate for SIEM team dashboards\n- **Scheduled email screenshot:** A dashboard rendered as an image on a schedule — appropriate for executives who prefer email delivery',
  },
]

const reportingQuestions: QuizQuestion[] = [
  {
    id: 'platform-gov-q1',
    text: 'An audit team needs a monthly report of all successful logins to domain administrator accounts for the past 30 days. They do not have LogScale access. Which approach delivers this most effectively?',
    options: [
      'Create a LogScale scheduled search that runs monthly, queries all successful domain admin logins for the past 30 days, and emails the results as a CSV attachment to the audit team\'s distribution list',
      'Share read-only LogScale dashboard access with the audit team for self-service reporting',
      'Export the LogScale data monthly to a CSV file manually and email it to the audit team',
      'Create a Falcon API script that the audit team runs manually when they need the report',
    ],
    correctIndex: 0,
    explanation: 'A scheduled search with email delivery is the correct approach for recipients without LogScale access who need a recurring report on a fixed schedule. The audit team receives the CSV automatically each month without needing to log into LogScale, run queries, or rely on a manual process. Giving the audit team LogScale access goes beyond their need (they only need the specific report). Manual export and API scripts introduce human dependencies.',
    docTitle: 'LogScale Scheduled Searches',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-alerts-scheduled-searches.html',
  },
  {
    id: 'platform-gov-q2',
    text: 'Your CISO wants a real-time dashboard showing current alert volume, MTTD, and MTTR. Stakeholders including non-technical executives should be able to view it without logging into LogScale. Which sharing approach is appropriate?',
    options: [
      'Create individual LogScale accounts for all executive stakeholders — they need access to the full LogScale interface to understand the metrics in context',
      'Share a read-only dashboard link with executives — LogScale dashboards can be shared via a URL that does not require authentication, allowing stakeholders to view the live dashboard without a LogScale account',
      'Schedule a daily email with a screenshot of the dashboard at a fixed time — real-time access requires LogScale accounts',
      'Export the dashboard data to a Google Sheets document and share the Sheet link — LogScale cannot provide real-time access to non-authenticated users',
    ],
    correctIndex: 1,
    explanation: 'LogScale dashboards can be shared via a read-only link that does not require LogScale authentication. The link displays the live dashboard with real-time data as the queries refresh. This is appropriate for executive stakeholders who need visibility into security metrics without needing full LogScale access. Creating individual accounts for executives gives excessive platform access; scheduled screenshots lose real-time currency.',
    docTitle: 'LogScale Dashboard Sharing',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-dashboards.html',
  },
  {
    id: 'platform-gov-q3',
    text: 'Which SIEM metric most directly measures the effectiveness of your threat detection capability?',
    options: [
      'Total alert volume — more alerts indicate more comprehensive threat coverage',
      'Endpoint coverage percentage — the proportion of endpoints with active Falcon sensors',
      'Mean Time to Detect (MTTD) — the average time between a threat event occurring and it being detected by the SIEM; lower MTTD means threats are identified earlier in the attack lifecycle',
      'Total events ingested per day — higher ingest volume indicates better telemetry coverage',
    ],
    correctIndex: 2,
    explanation: 'MTTD (Mean Time to Detect) directly measures detection effectiveness: how quickly your SIEM identifies threat activity after it occurs. Low MTTD means early detection = limited attacker dwell time = reduced blast radius. Total alert volume is a volume metric, not an effectiveness metric — high alert volume can indicate poor tuning (noise). Endpoint coverage measures deployment completeness. Events/day measures data volume, not detection quality.',
    docTitle: 'SIEM KPIs and Metrics',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-siem-reporting',
  },
  {
    id: 'platform-gov-q4',
    text: 'A scheduled LogScale search for a compliance report shows the same endpoint appearing in the "admin logins from unusual locations" report every week for 3 months. What does this pattern suggest and what should happen?',
    options: [
      'The compliance report query is working correctly — recurring appearances indicate comprehensive monitoring coverage',
      'The endpoint owner is a frequent business traveller — no action needed, recurring alerts for travel are expected and compliant',
      'The LogScale scheduled search has a bug — it is repeatedly reporting historical data rather than new events each week',
      'A recurring detection pattern for the same endpoint over 3 months indicates either a persistent threat on that endpoint, a legitimate activity pattern that needs a suppression rule, or a detection logic gap — it warrants investigation and either remediation or intentional tuning',
    ],
    correctIndex: 3,
    explanation: 'Recurring detections for the same endpoint over 3 months warrant investigation, not acceptance. Three outcomes are possible: (1) genuine ongoing threat — investigate and remediate; (2) known legitimate activity — document it and create a tuning exclusion with a documented rationale; (3) detection logic gap producing false positives — refine the CQL query. Ignoring recurring patterns is a common detection quality gap. Compliance reports should drive action, not just produce data.',
    docTitle: 'Detection Tuning and Governance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-siem-reporting',
  },
  {
    id: 'platform-gov-q5',
    text: 'Which delivery format is most appropriate for a weekly detection summary report sent to the SOC lead who needs to analyse trends across detection types and affected hosts?',
    options: [
      'CSV email attachment — SOC leads can open the CSV in Excel or Sheets to filter, sort, pivot, and analyse data across detection types and hosts',
      'Inline text email — a summary paragraph in the email body is the most consumable format for SOC leads',
      'LogScale dashboard link — the SOC lead should use the live dashboard for all reporting needs',
      'PDF report — a rendered PDF locks in the snapshot and is the best format for archiving and forwarding',
    ],
    correctIndex: 0,
    explanation: 'CSV is the correct format for a SOC lead who needs to analyse trends: they can open it in Excel or Google Sheets, sort by detection type, filter by host, create pivot tables, and chart trends — none of which are possible with inline text. Dashboard links require real-time LogScale access and do not provide the historical snapshot the weekly report represents. PDF is good for archiving but poor for interactive analysis.',
    docTitle: 'LogScale Report Delivery Formats',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-alerts-scheduled-searches.html',
  },
]

export const reportingModule: ContentModule = {
  id: 'platform-gov-reporting',
  title: 'Scheduled Reports & Executive Dashboards',
  trackId: 'platform-governance',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: reportingConcepts,
  quiz: reportingQuestions,
}

// ── Module 5.3.2: Role-Based Access Control for SIEM/SOAR ───────────────────

const rbacConcepts: ConceptSection[] = [
  {
    title: 'Falcon Platform RBAC: Roles and Repository Access',
    body: 'The Falcon platform uses role-based access control (RBAC) to govern what users can see and do across platform modules. For SIEM/SOAR engineers, RBAC applies at two levels:\n\n**Level 1 — Falcon Platform Roles:**\n- **Falcon Administrator:** Full platform access including user management, policy configuration, and billing\n- **Security Analyst:** Access to detections, incidents, and the Falcon console; cannot modify policies or manage users\n- **Security Responder:** All Security Analyst permissions plus the ability to trigger response actions (containment, process kill)\n- **Security Operations Manager:** All Responder permissions plus user and role management (but not billing/configuration)\n\n**Level 2 — LogScale Repository Access:**\nLogScale uses repository-level access control separately from Falcon platform roles:\n- Users or groups are granted access to specific repositories (read, write, or admin)\n- A security analyst might have access to the `falcon-alerts` and `falcon-endpoint` repositories but NOT the `hr-audit` repository that contains employee data\n- Repository access is managed in LogScale\'s user/group settings\n\n**Principle of least privilege in practice:**\n- SOC analysts: Security Analyst role + read access to SIEM repositories they need\n- Automation service accounts: Only the API scopes required; no Falcon console role\n- SIEM administrators: LogScale repository admin; Falcon Security Operations Manager\n- Executives viewing dashboards: Dashboard link access only (no platform role required)',
  },
  {
    title: 'Service Accounts and API Client Governance',
    body: 'Automation and integrations in the Falcon platform use API clients (not user accounts). Governing these service accounts is a critical SIEM/SOAR operations discipline.\n\n**API client inventory best practices:**\n- Maintain a register of all API clients: name, purpose, owner, scopes granted, creation date, last secret rotation date\n- Use descriptive names: "SOAR-triage-automation" not "api-client-3"\n- One API client per integration or system — never share credentials between different tools\n\n**Lifecycle management:**\n- Rotate client secrets on a schedule (quarterly is common for production integrations)\n- Remove unused API clients immediately when an integration is decommissioned\n- Review API client audit logs quarterly to verify usage patterns match the stated purpose\n\n**Separation of concerns:**\n- Read-only integrations (SIEM data export, reporting) get `:Read` scopes only\n- Response integrations (containment, IOC creation) get `:Write` scopes on specific resources only\n- Never create a multi-purpose API client with broad scopes to "avoid future scope additions"\n\n**Audit log review:**\nEvery Falcon API call is logged under the API client name in the Falcon audit log. Quarterly reviews should verify: (1) the call pattern matches the integration\'s documented purpose, (2) no unexpected endpoints are being called, (3) the call volume is consistent with the integration\'s expected activity.',
  },
]

const rbacQuestions: QuizQuestion[] = [
  {
    id: 'platform-gov-q6',
    text: 'A new SOC analyst needs to investigate Falcon detections and read endpoint telemetry in LogScale but should not be able to trigger containment or modify platform policies. Which role and access combination is correct?',
    options: [
      'Falcon Administrator role + LogScale admin access to all repositories — maximum access ensures no capability gaps',
      'Security Analyst Falcon role + read access to the relevant LogScale repositories — analysts can view detections and query SIEM data without response or configuration capabilities',
      'Security Responder Falcon role + read access to LogScale repositories — Responder role is required to query LogScale data',
      'No Falcon role + LogScale admin access — LogScale query access is independent of Falcon platform roles',
    ],
    correctIndex: 1,
    explanation: 'Security Analyst Falcon role grants detection and incident visibility in the Falcon console without response or policy modification capabilities. LogScale repository read access grants query capability for the specific repositories the analyst needs. This combination satisfies the requirement: investigation capability without containment or configuration access. Security Responder adds unnecessary response capabilities; Falcon Administrator and LogScale admin grant excessive privileges.',
    docTitle: 'Falcon RBAC Roles',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
  },
  {
    id: 'platform-gov-q7',
    text: 'Your organisation has three separate data sources in LogScale: `falcon-endpoint` (Falcon sensor telemetry), `falcon-alerts` (Falcon detections), and `hr-audit` (HR system audit logs). The SOC team should access the first two but not the third. How should this be enforced?',
    options: [
      'Create a single "SOC" role in the Falcon platform that restricts the console view to security-relevant data',
      'Place all three repositories in separate LogScale organisations — cross-organisation repository access is not possible',
      'Grant the SOC team group access to the `falcon-endpoint` and `falcon-alerts` LogScale repositories with read permission; do not grant any access to the `hr-audit` repository — LogScale\'s repository-level access control enforces this boundary',
      'Encrypt the `hr-audit` repository with a separate encryption key that only HR admins possess — LogScale access control alone is insufficient to protect sensitive HR data',
    ],
    correctIndex: 2,
    explanation: 'LogScale uses repository-level access control: users and groups can be granted or denied access to specific repositories independently. Granting the SOC team group access to `falcon-endpoint` and `falcon-alerts` while not granting access to `hr-audit` enforces the data boundary. SOC analysts will see only their permitted repositories in the LogScale interface. Falcon platform roles do not control LogScale repository access — they are separate control planes.',
    docTitle: 'LogScale Repository Access Control',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-user-management.html',
  },
  {
    id: 'platform-gov-q8',
    text: 'An analyst leaves the SOC team and their position is eliminated. What access revocation steps are required?',
    options: [
      'Disable their Falcon console account only — LogScale access is tied to the Falcon account and is automatically revoked',
      'Disable their LogScale access only — Falcon console access requires a separate user account system',
      'Notify the SIEM vendor to audit for any data the analyst may have exported before leaving — access revocation alone is insufficient',
      'Disable or delete their Falcon platform account AND revoke their LogScale repository access — these are separate control planes; revoking Falcon access does not automatically remove LogScale access',
    ],
    correctIndex: 3,
    explanation: 'Falcon platform access and LogScale repository access are managed independently. Disabling the Falcon account removes console access but does NOT automatically revoke LogScale access if it was separately granted. Offboarding requires explicit action in both systems: (1) disable/delete the Falcon user account, and (2) remove the user from all LogScale repository and group memberships. Checklists for access revocation must cover both planes.',
    docTitle: 'Falcon and LogScale Offboarding',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
  },
  {
    id: 'platform-gov-q9',
    text: 'During a quarterly API client audit, you find an API client named "old-siem-integration" that has not made any API calls in 6 months. The original SIEM it served was decommissioned. What should you do?',
    options: [
      'Delete the API client immediately — unused API clients with valid credentials are an attack surface even if they appear inactive; the credentials may have been exfiltrated and could be used to access the Falcon platform at any time',
      'Keep the API client in place but rotate its secret — rotating the secret ensures existing credentials cannot be used',
      'Archive the API client by disabling it in the console — disabled clients retain their credentials for future reactivation',
      'Keep the API client for 12 more months before deletion — CrowdStrike recommends a 12-month grace period after integration decommissioning',
    ],
    correctIndex: 0,
    explanation: 'Unused API clients with valid credentials are an active attack surface regardless of their call history. If the credentials were exfiltrated at any point, they remain valid until the client is deleted. Best practice: delete API clients immediately when the integration they serve is decommissioned. There is no value in keeping credentials that serve no current purpose — the risk is asymmetric. Rotating the secret while keeping the client leaves an unnecessary attack surface if the new secret is also exfiltrated.',
    docTitle: 'Falcon API Client Lifecycle Management',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-gov-q10',
    text: 'Which RBAC configuration violates the principle of least privilege for a read-only automated reporting integration?',
    options: [
      'Detections:Read + Incidents:Read + Hosts:Read scopes — covers exactly the resources the integration queries',
      'Detections:Read + Incidents:Read + Hosts:Read + Custom IOA Rules:Write + Workflows:Write — write scopes on detection rules and SOAR workflows are not needed for a read-only reporting integration; they create unnecessary attack surface',
      'Security Analyst role assigned to the API client alongside the API scopes — API clients can be assigned platform roles for additional access',
      'Read-only access to the LogScale repositories the integration queries — scoped to the minimum required data sources',
    ],
    correctIndex: 1,
    explanation: 'Granting `Custom IOA Rules:Write` and `Workflows:Write` scopes to a read-only reporting integration is a clear least-privilege violation. If these credentials are compromised, an attacker could modify custom detection rules (effectively blinding the SIEM) or modify SOAR playbooks to disable automated responses. Write scopes must be granted only when explicitly required — read-only integrations must have read-only scopes.',
    docTitle: 'Falcon API Scope Governance',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
]

export const rbacModule: ContentModule = {
  id: 'platform-gov-rbac',
  title: 'Role-Based Access Control for SIEM/SOAR',
  trackId: 'platform-governance',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: rbacConcepts,
  quiz: rbacQuestions,
}

// ── Track 5.3 Scenario ─────────────────────────────────────────────────────

const governanceScenario: Scenario = {
  id: 'platform-governance-scenario',
  title: 'Building a Governance Framework for a Growing SOC',
  context: 'Your organisation\'s SOC has grown from 3 to 12 analysts over 6 months. You have been asked to formalise the SIEM/SOAR governance framework: RBAC design, reporting cadence, and API client management. Executive stakeholders expect monthly security metrics reports.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-gov-s1',
      narrative: 'You are designing role assignments for the 12-analyst team. Three analysts are Tier 1 (alert triage only), six are Tier 2 (investigation and response), and three are SIEM engineers (who build detection rules and manage integrations). What is the correct Falcon platform role for Tier 1 analysts?',
      choices: [
        { text: 'Security Analyst — read access to detections and incidents without response or policy modification capabilities; appropriate for alert triage without over-provisioning' },
        { text: 'Security Responder — Tier 1 analysts should be able to contain hosts they identify as compromised during triage' },
        { text: 'Security Operations Manager — provides the broadest access needed for any analyst function' },
        { text: 'Falcon Administrator — maximum access eliminates capability questions during triage escalations' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Security Responder adds containment capabilities that Tier 1 analysts should not have autonomously — containment should require Tier 2 or manager approval. Operations Manager and Administrator roles vastly over-provision for alert triage. Escalation questions are better handled via process (escalate to Tier 2) than by giving Tier 1 analysts admin access.',
      reasoning: 'Security Analyst is the correct role for Tier 1: it provides read access to detections, incidents, and host information needed for triage, without the containment and policy capabilities that should be gated to senior analysts. Least privilege for triage means read-only with structured escalation paths for response actions.',
      docTitle: 'Falcon RBAC Analyst Roles',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
    },
    {
      id: 'pf-gov-s2',
      narrative: 'The three SIEM engineers need to build detection rules, manage LogScale repository configurations, and maintain API clients. They should NOT have billing access or the ability to add/remove user accounts. Which role is appropriate?',
      choices: [
        { text: 'Security Analyst — add LogScale admin access on top of the base role to enable rule building' },
        { text: 'Security Operations Manager — includes user and role management but not billing; combined with LogScale repository admin access, this covers SIEM engineer requirements without granting billing privileges' },
        { text: 'Falcon Administrator — SIEM engineers need full admin access to manage all platform components effectively' },
        { text: 'Security Responder — provides all permissions needed for detection rule management' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'Security Analyst lacks the management capabilities SIEM engineers need for rule building and API client management. Falcon Administrator grants billing access which is explicitly out of scope. Security Responder provides response capabilities but not SIEM management permissions — it does not grant the rule building or integration management access SIEM engineers require.',
      reasoning: 'Security Operations Manager grants user and role management capabilities (but not billing) and provides sufficient platform access for API client management and configuration. Combined with LogScale repository admin access (granted separately in LogScale), this covers SIEM engineer requirements: detection rule management, repository administration, and API client governance, while explicitly excluding billing access.',
      docTitle: 'Falcon Security Operations Manager Role',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-rbac',
    },
    {
      id: 'pf-gov-s3',
      narrative: 'The CISO wants a live dashboard showing alert volume, MTTD, and endpoint coverage. They should be able to check it from their browser without a LogScale account. Simultaneously, the compliance team needs a monthly CSV report of all privileged account logins for the past 30 days. Which two configurations cover both requirements?',
      choices: [
        { text: 'Create individual LogScale accounts for the CISO and compliance team members with read access to the relevant repositories; they can run their own queries as needed' },
        { text: 'Export the dashboard as a PDF weekly and email it to the CISO; create a Falcon API script the compliance team runs manually each month' },
        { text: 'Create a public read-only LogScale dashboard link for the CISO; create a monthly scheduled search that emails a CSV of privileged account logins to the compliance team' },
        { text: 'Configure a Slack channel with the live dashboard embedded; create a monthly calendar reminder for the SIEM engineer to manually export and email the compliance report' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Creating LogScale accounts for the CISO and compliance team provides more access than required — the CISO needs a live read-only view, not query capability; the compliance team needs a monthly export, not query access. PDF weekly exports lose real-time currency for the CISO and miss the monthly schedule for compliance. Manual processes create human-dependency risk.',
      reasoning: 'Read-only dashboard link = no authentication required, real-time data, appropriate for CISO visibility needs. Scheduled CSV search = automatic monthly delivery to compliance team without requiring their LogScale access. These are the minimum-privilege, automated approaches for each use case.',
      docTitle: 'LogScale Dashboard and Scheduled Search',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-dashboards.html',
    },
    {
      id: 'pf-gov-s4',
      narrative: 'During your quarterly API client audit, you discover 7 active API clients. Only 4 have documentation (owner, purpose, scopes). The other 3 are named "api-client-1", "api-client-2", and "test-integration". None of the 3 have recent API call activity in the audit log. What is the correct governance response?',
      choices: [
        { text: 'Keep all 7 clients — removing unknown clients may break undiscovered integrations' },
        { text: 'Rotate the secrets on the 3 unknown clients as a precaution — this limits damage if credentials were exfiltrated without impacting any integration that may silently depend on them' },
        { text: 'Mark the 3 unknown clients as requiring documentation by the next quarterly review — immediate deletion may cause unintended service disruption' },
        { text: 'Immediately delete the 3 undocumented inactive clients — undocumented API clients with no current usage are an unmanaged attack surface; document and confirm all remaining active clients as part of the governance action' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Keeping undocumented inactive clients violates API governance — they are unmanaged attack surfaces. Rotating secrets on unknown clients reduces risk but does not eliminate the attack surface (new secrets can also be exfiltrated). Deferring deletion to the next quarterly review leaves the risk in place for another 3 months. An integration that silently depends on an undocumented unknown client is itself an undocumented integration that should be discovered and documented before the audit.',
      reasoning: 'Delete undocumented inactive API clients immediately. If any integration breaks after deletion, that integration is itself undocumented — which is a governance failure that needs immediate resolution. The correct sequence: (1) delete the 3 unknown clients, (2) monitor for integration failures, (3) if failures occur, document the broken integration, create a properly named and scoped API client, and update the client registry. Clean governance requires knowing every API client and its purpose.',
      docTitle: 'Falcon API Client Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
    },
    {
      id: 'pf-gov-s5',
      narrative: 'A Tier 1 analyst reports that they cannot access the `falcon-endpoint` LogScale repository to query FDR telemetry during an alert triage. They have a Security Analyst Falcon role but were not explicitly granted LogScale repository access. What is the correct fix?',
      choices: [
        { text: 'Grant the analyst read access to the `falcon-endpoint` LogScale repository explicitly in LogScale\'s user/group settings — Falcon platform roles and LogScale repository access are managed separately and the Falcon role does not automatically grant LogScale access' },
        { text: 'Grant the analyst a Security Responder Falcon role — this role includes LogScale repository access as part of its elevated permissions' },
        { text: 'Upgrade the analyst to Falcon Administrator temporarily while they complete the investigation, then downgrade after' },
        { text: 'Recreate the analyst\'s Falcon account — repository access permissions are sometimes lost during account updates and recreation restores them' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Security Responder does not include automatic LogScale access — they are separate control planes. Temporary Falcon Administrator access is wildly disproportionate for a LogScale access issue. Account recreation does not fix missing repository grants that were never made.',
      reasoning: 'Falcon platform roles and LogScale repository access are independent. The Security Analyst Falcon role grants Falcon console access — it does not automatically grant access to LogScale repositories. Repository access must be explicitly granted in LogScale\'s user management settings. Grant the analyst read access to `falcon-endpoint` in LogScale, leaving their Security Analyst Falcon role unchanged.',
      docTitle: 'LogScale Repository Access vs. Falcon Roles',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-user-management.html',
    },
  ],
}

// ── Track 5.3 Export ────────────────────────────────────────────────────────

export const governanceTrack: ContentTrack = {
  id: 'platform-governance',
  title: 'Reporting & Governance',
  domainId: 'platform',
  order: 3,
  modules: [reportingModule, rbacModule],
  scenario: governanceScenario,
}
