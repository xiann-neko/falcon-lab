import type {
  ContentModule,
  ContentTrack,
  QuizQuestion,
  ConceptSection,
  Scenario,
} from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// Track 5.4 — Threat Intelligence Integration
// ═══════════════════════════════════════════════════════════════════════════════

// ── Module 5.4.1: Falcon Intelligence Feeds in LogScale ─────────────────────

const tiFeedsConcepts: ConceptSection[] = [
  {
    title: 'Falcon Intelligence: What It Provides and How It Feeds LogScale',
    body: 'Falcon Intelligence is CrowdStrike\'s threat intelligence platform, providing:\n\n**Indicator feeds (IOCs):**\n- **Malware hashes:** SHA256/MD5 hashes of known malicious files, updated continuously\n- **Malicious domains:** Domains associated with C2 infrastructure, phishing, and malware distribution\n- **Malicious IPs:** IP addresses hosting C2 servers, scanning platforms, and attacker infrastructure\n- **Malicious URLs:** Specific URLs used in phishing campaigns and exploit kit landing pages\n\n**Contextual intelligence:**\n- **Threat actor profiles:** TTPs, targeted industries, geographic focus, and weaponry for known adversary groups\n- **Malware families:** Technical descriptions of malware families, behavioural patterns, and detection guidance\n- **Vulnerability intelligence:** CVE context including exploitability, active exploitation status, and affected software\n\n**Integration with LogScale:**\nFalcon Intelligence IOCs can be ingested into LogScale as lookup tables. A lookup table is a key-value reference dataset that CQL queries can join against using the `lookup()` function. This enables real-time IOC matching against ingested telemetry:\n\n```cql\n// Match DNS requests against known malicious domains\n#type=DnsRequest\n| lookup(field=DomainName, file="malicious-domains.csv", include=[threat_category, confidence])\n| confidence > 70\n```\n\nLookup tables can be updated automatically when new IOC feeds are received, keeping detection rules current without modifying the CQL queries themselves.',
    codeExample: '// LogScale lookup() for IOC matching — match observed IPs against threat intel feed\n#type=NetworkConnectIP4\n| start=now()-1h\n| lookup(field=RemoteAddressIP4, file="malicious-ips.csv", include=[threat_actor, confidence, category])\n| confidence > 50\n| groupBy([RemoteAddressIP4, threat_actor, category], function=count())\n| sort(count, order=desc)',
    codeLanguage: 'cql',
  },
  {
    title: 'Indicator Confidence Levels and Feed Management',
    body: 'Not all threat intelligence indicators carry equal confidence. IOC feeds typically assign confidence levels (0–100) that reflect the reliability of the attribution and the recency of observation:\n\n**Confidence tiers:**\n- **High (80–100):** Recently observed, verified attribution, multiple corroborating sources\n- **Medium (50–79):** Observed but less recently, single source, or partial attribution\n- **Low (1–49):** Historical, unverified, or low-confidence attribution\n\n**Operational use of confidence levels:**\n- **High-confidence IOCs:** Generate alerts immediately on match; block at network/endpoint controls\n- **Medium-confidence IOCs:** Generate alerts for analyst review; do not auto-block without investigation\n- **Low-confidence IOCs:** Use for hunting context only; do not generate operational alerts\n\n**Feed staleness problem:** IOC feeds degrade over time. An IP or domain that was a C2 server 18 months ago may now be used by a legitimate business (infrastructure is recycled). IOCs older than 90–180 days should be reviewed for continued relevance before inclusion in active alert rules.\n\n**Feed update management:**\n- Schedule automatic download and import of updated Falcon Intelligence IOC feeds (via API or FDR)\n- Set expiry timestamps on IOCs in lookup tables to automatically age out stale indicators\n- Track hit rates on IOCs — an IOC that never matches in 6 months may not be relevant to your environment and can be removed to reduce false-positive risk',
  },
]

const tiFeedsQuestions: QuizQuestion[] = [
  {
    id: 'platform-ti-q1',
    text: 'How does Falcon Intelligence IOC data integrate with LogScale CQL queries for real-time detection?',
    options: [
      'IOC data is imported into LogScale as lookup tables; the CQL `lookup()` function joins ingested events against the lookup table at query time — enabling real-time IOC matching without modifying detection queries when the threat intelligence is updated',
      'IOC data is embedded directly in CQL detection queries as hardcoded filter values; when new IOCs are added, each detection query must be manually updated',
      'Falcon Intelligence connects directly to LogScale and adds IOC tags to events during ingest, before any CQL query runs',
      'IOC matching in LogScale requires the Falcon Threat Graph module — standard LogScale saved searches cannot perform IOC lookups',
    ],
    correctIndex: 0,
    explanation: 'Falcon Intelligence IOCs are stored in LogScale lookup tables (CSV files referenced by name). CQL queries use the `lookup()` function to join event data against the lookup table at query time. When the threat intelligence feed is updated (new IOCs added, confidence scores changed), only the lookup table changes — the CQL queries remain unchanged. This separation allows detection logic to stay current with evolving threat intelligence without manual query updates.',
    docTitle: 'LogScale Lookup Tables and Threat Intelligence',
    docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
  },
  {
    id: 'platform-ti-q2',
    text: 'A LogScale IOC matching rule fires on a DNS request to a domain with a Falcon Intelligence confidence score of 35 (Low). What action is most appropriate?',
    options: [
      'Immediately block the domain at the DNS resolver and notify the security team — any IOC match warrants an immediate response',
      'Use the match as hunting context only — review the endpoint\'s recent activity to determine if further investigation is warranted, but do not generate an operational alert or block based on a low-confidence IOC alone',
      'Escalate directly to the CISO — low-confidence IOC matches are indicators of advanced persistent threats that evade high-confidence detection',
      'Delete the low-confidence IOC from the lookup table — IOCs below 50 confidence should not be in production detection tables',
    ],
    correctIndex: 1,
    explanation: 'Low-confidence IOCs (1–49) should be used for hunting context, not operational alerting or automated blocking. A confidence score of 35 means the attribution is uncertain — the domain may be legitimately used by non-malicious infrastructure. Use the match to initiate a focused investigation of the endpoint\'s recent behaviour, but do not auto-block or generate a high-priority alert. Operational alerts and blocks should be reserved for medium and high confidence IOC matches.',
    docTitle: 'Threat Intelligence Confidence Levels',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q3',
    text: 'An IOC for a specific IP address was added to your LogScale lookup table 18 months ago. It has not matched any events in the last 12 months. What should happen to this IOC?',
    options: [
      'Retain it indefinitely — a low match rate indicates the IOC is suppressing attacks proactively',
      'Increase its confidence score — the lack of matches suggests the IP is actively avoiding your environment, which implies high threat actor sophistication',
      'Review it for current relevance: check if the IP is still associated with malicious infrastructure in current Falcon Intelligence data; if the association is no longer current, remove or expire it to prevent false positives when IP infrastructure is recycled to legitimate uses',
      'Move it to a separate "historical" lookup table for archiving — retain it but remove it from active detection rules',
    ],
    correctIndex: 2,
    explanation: 'IOC staleness is a real operational problem: IP and domain infrastructure is recycled constantly. An IP used for C2 18 months ago may now host a legitimate CDN or business service. An 18-month-old IOC with no matches in 12 months warrants review: check current Falcon Intelligence data for the IP\'s current classification. If it is no longer confirmed malicious, remove or expire it. Retaining stale IOCs creates false positive risk when infrastructure is recycled.',
    docTitle: 'IOC Lifecycle Management',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q4',
    text: 'A threat actor profile in Falcon Intelligence shows they typically target the financial services sector using spear-phishing emails followed by PowerShell-based execution. How should this intelligence inform your LogScale detection rules?',
    options: [
      'It does not — threat actor profiles are strategic intelligence for the CISO; detection engineers should only use IOC feeds for operational rules',
      'Create a dedicated LogScale repository for financial-sector threat data — threat actor targeting implies different data should be stored separately',
      'Immediately block all PowerShell execution on endpoints — if a known threat actor uses PowerShell, it should be disabled organisation-wide',
      'Use it to validate that existing detection rules cover the specific attack patterns the actor uses — check that saved searches detect PowerShell execution patterns and email-delivered payload types; prioritise rule coverage for TTPs the actor is known to use',
    ],
    correctIndex: 3,
    explanation: 'Threat actor profiles directly inform detection rule coverage validation. If Falcon Intelligence shows an actor uses PowerShell post-exploitation following spear-phishing, verify LogScale detection rules cover PowerShell process spawned by common email client processes (Outlook → PowerShell chain), encoded PowerShell commands, and PowerShell making network connections. TTP-based detection coverage is the operational value of threat actor intelligence.',
    docTitle: 'Threat Actor Intelligence in Detection Engineering',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-actors',
  },
  {
    id: 'platform-ti-q5',
    text: 'Which Falcon Intelligence data type is most useful for identifying whether a newly discovered file hash on an endpoint is associated with a known threat actor or malware family?',
    options: [
      'Malware hash indicators — SHA256 or MD5 hashes of known malicious files, cross-referenced against malware family and threat actor attribution data in the Falcon Intelligence feed',
      'Domain indicators — querying the file hash against domain-related threat intelligence to identify any C2 domains the malware family uses',
      'IP address indicators — looking up whether the file\'s author IP address is on a malicious IP list',
      'Vulnerability intelligence — checking whether the file exploits a known CVE associated with the suspected threat actor',
    ],
    correctIndex: 0,
    explanation: 'Malware hash indicators (SHA256/MD5) are the most direct intelligence source for a newly discovered file. A hash match in the Falcon Intelligence feed immediately provides: malware family classification, threat actor attribution, behavioural characteristics, and historical campaign context. Domain indicators relate to C2 infrastructure, not file identification. IP indicators and vulnerability intelligence do not identify files — they contextualise network and exploitation activity.',
    docTitle: 'Falcon Intelligence Malware Hash Indicators',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
]

export const tiFeedsModule: ContentModule = {
  id: 'platform-ti-feeds',
  title: 'Falcon Intelligence Feeds in LogScale',
  trackId: 'platform-threat-intel',
  domainId: 'platform',
  order: 1,
  lastReviewed: '2026-08-17',
  concepts: tiFeedsConcepts,
  quiz: tiFeedsQuestions,
}

// ── Module 5.4.2: IOC Management & Enrichment in Playbooks ──────────────────

const iocPlaybookConcepts: ConceptSection[] = [
  {
    title: 'Falcon Fusion SOAR: IOC Enrichment Actions',
    body: 'Falcon Fusion SOAR playbooks can automatically enrich detection findings with Falcon Intelligence data at detection time, providing analysts with threat context before manual investigation begins.\n\n**IOC enrichment in Fusion workflows:**\n- **IP reputation lookup:** Fusion action that queries Falcon Intelligence for the reputation and threat classification of a source or destination IP from a detection\n- **Domain reputation lookup:** Check observed DNS destinations against Falcon Intelligence domain threat feeds\n- **File hash lookup:** Determine if a file SHA256 observed in a detection is a known malicious hash and retrieve the associated malware family and threat actor attribution\n\n**Typical enrichment playbook pattern:**\n1. Trigger: New Falcon detection with severity ≥ High\n2. Action: Extract observables (IPs, domains, hashes) from the detection telemetry\n3. Action: Look up each observable against Falcon Intelligence via the Intel API\n4. Condition: If any observable matches with confidence ≥ 70, escalate severity\n5. Action: Add enrichment context to the detection comment/ticket\n6. Action: Notify analyst with enriched context\n\n**Value of automated enrichment:**\nAn analyst receiving a detection with pre-populated threat intelligence context (this IP is a Cobalt Strike C2 used by [actor], confidence 95) can make a triage decision in 30 seconds rather than spending 5 minutes querying intelligence sources manually.',
  },
  {
    title: 'Custom IOC Management: Extending Falcon Detection',
    body: 'Beyond consuming Falcon Intelligence feeds, SIEM/SOAR engineers can create custom IOCs in the Falcon platform to extend detection coverage for organisation-specific threats:\n\n**Custom IOC types:**\n- **File hashes (SHA256, MD5):** Block execution or generate a detection when a specific file is observed\n- **IP addresses:** Generate alerts or block connections to/from specific IP addresses\n- **Domains:** Monitor or block DNS requests to specific domains\n- **Mutex/Registry patterns:** Advanced custom detection for specific malware behavioural indicators\n\n**IOC action types:**\n- **Detect:** Generate a Falcon detection when the IOC is observed — analyst review required before response\n- **Block:** Prevent the activity (block file execution, block network connection) — appropriate only for high-confidence IOCs from confirmed investigations\n\n**SOAR-driven IOC creation:**\nAfter an analyst confirms a malicious finding in an investigation, a Fusion playbook can automatically promote the observable to a custom IOC:\n1. Analyst confirms malicious file hash in investigation\n2. Fusion playbook creates a custom IOC for the hash with action = Detect\n3. The IOC is automatically applied to all endpoints with Falcon sensors\n4. Future executions of the same hash generate a Falcon detection immediately\n\n**IOC governance:**\n- Document the source investigation ID for every custom IOC created (audit trail)\n- Set expiry dates on IOCs — file hashes may be relevant indefinitely, but IP/domain IOCs should be reviewed and expired regularly\n- Review custom IOC hit rates quarterly — a hash IOC with zero hits in 12 months on your endpoint fleet may not be relevant to your environment',
  },
]

const iocPlaybookQuestions: QuizQuestion[] = [
  {
    id: 'platform-ti-q6',
    text: 'A Fusion SOAR playbook is designed to enrich detections by looking up observed IPs against Falcon Intelligence. Which sequence best describes this enrichment workflow?',
    options: [
      'The playbook manually adds IP reputation data to each detection by querying a public WHOIS service; Falcon Intelligence is not accessible from Fusion',
      'The playbook extracts the source or destination IP from the detection, calls the Falcon Intelligence API (Intel:Read scope) to retrieve reputation data, and adds the enrichment result (threat classification, confidence, actor attribution) to the detection as a comment or ticket field for analyst review',
      'The playbook blocks the IP automatically based on its presence in any Falcon Intelligence feed regardless of confidence score',
      'The playbook queries Falcon Intelligence but only after the analyst manually triggers the enrichment — automated IOC enrichment is not supported in Fusion SOAR',
    ],
    correctIndex: 1,
    explanation: 'Fusion playbooks can call the Falcon Intelligence API (with Intel:Read scope) automatically on detection trigger. The workflow: extract observables (IPs) from the detection → query Intel API for reputation/attribution → add enrichment context to the detection record. The Intel API returns threat classification, confidence score, and actor attribution — all of which are added to the ticket before analyst review, compressing manual enrichment time from minutes to seconds.',
    docTitle: 'Fusion SOAR Intel Enrichment',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-fusion-soar',
  },
  {
    id: 'platform-ti-q7',
    text: 'After confirming a malicious file hash during an investigation, which IOC action type should be used when the analyst wants to be notified if the same hash appears on any other endpoint, without automatically blocking execution?',
    options: [
      'Block — prevents execution and notifies the analyst simultaneously',
      'Monitor — tracks observed activity without generating a Falcon detection',
      'Detect — generates a Falcon detection (alert) when the hash is observed on any endpoint, enabling analyst review before any response action is taken',
      'Quarantine — automatically isolates any file matching the hash to a sandbox environment for further analysis',
    ],
    correctIndex: 2,
    explanation: '"Detect" generates a Falcon detection when the IOC is observed without automatically blocking it — the analyst receives an alert and can investigate before deciding on response. "Block" would prevent execution (appropriate only when confidence is highest and blocking is operationally safe). "Monitor" does not generate detections. "Quarantine" is not a standard Falcon custom IOC action type.',
    docTitle: 'Falcon Custom IOC Action Types',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q8',
    text: 'A SOAR playbook automatically creates custom IOCs from every investigation finding. After 12 months, the custom IOC list has grown to 8,000 entries. A third of them have never generated a hit. What is the correct governance approach?',
    options: [
      'Keep all 8,000 IOCs — the absence of hits proves they are effectively blocking threats proactively',
      'Delete all IOCs with zero hits — IOCs that have never matched have no demonstrated value',
      'Disable the SOAR playbook that creates IOCs automatically — automated IOC creation always leads to list bloat',
      'Review zero-hit IOCs quarterly: assess whether they are relevant to your environment (file hashes for malware families not targeting your industry, expired infrastructure), set expiry dates for IP/domain IOCs, and remove those with no current relevance — a bloated IOC list creates false-positive risk and degrades detection signal quality',
    ],
    correctIndex: 3,
    explanation: 'IOC list hygiene is an ongoing governance responsibility. Zero-hit IOCs may be irrelevant (malware targeting a different industry) or stale (infrastructure recycled to legitimate use). However, not all zero-hit IOCs should be deleted — a file hash for a known malware family in your threat landscape has protective value even without hits. Quarterly review with contextual assessment (current relevance, expiry for infrastructure IOCs) is the correct approach. Disabling automated IOC creation removes a valuable SOAR capability.',
    docTitle: 'IOC Governance and List Hygiene',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
  {
    id: 'platform-ti-q9',
    text: 'Which Falcon API scope is required for a SOAR playbook to call the Falcon Intelligence API for IOC enrichment lookups?',
    options: [
      'Falcon Intelligence:Read — grants read access to threat intelligence data including IOC reputation, actor profiles, and malware intelligence',
      'Detections:Read — grants access to all Falcon data including threat intelligence context',
      'Custom IOA Rules:Read — grants access to intelligence data used by the detection rule engine',
      'Hosts:Read — includes threat intelligence enrichment data for host-based lookups',
    ],
    correctIndex: 0,
    explanation: '`Falcon Intelligence:Read` is the specific scope required to query the Falcon Intelligence API for IOC lookups, actor profiles, and malware intelligence. `Detections:Read` grants access to detection data, not intelligence API endpoints. `Custom IOA Rules:Read` governs custom detection rule management. `Hosts:Read` provides host/device data. Each scope is specific to its API service — Intelligence access requires the Intelligence scope.',
    docTitle: 'Falcon Intelligence API Scopes',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-api-oauth2',
  },
  {
    id: 'platform-ti-q10',
    text: 'What is the primary risk of automatically blocking all IOC matches in a Fusion SOAR playbook without analyst review?',
    options: [
      'Excessive Falcon API calls from the blocking actions may exceed rate limits and cause the playbook to fail',
      'Automated blocking of low and medium-confidence IOCs will generate false positives — legitimate business traffic, partner IPs, or SaaS platforms that share infrastructure with previously malicious actors can be incorrectly blocked, causing business disruption',
      'Falcon prevents automated blocking from SOAR playbooks — all block actions require manual analyst approval in the Falcon console',
      'Blocking actions permanently delete the IOC from the intelligence database, removing it from future detection coverage',
    ],
    correctIndex: 1,
    explanation: 'Automated blocking without confidence filtering causes false positives: IP and domain infrastructure is shared and recycled. A C2 IP used by an attacker 6 months ago may now serve legitimate CDN content. Blocking it automatically interrupts business traffic. Low and medium-confidence IOCs require analyst review before blocking. Only high-confidence, recently confirmed IOCs (typically from active investigations) should feed automated blocking playbooks. API rate limits, analyst approval requirements, and database deletion are not the primary risk.',
    docTitle: 'Automated IOC Blocking Risk',
    docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
  },
]

export const iocPlaybookModule: ContentModule = {
  id: 'platform-ti-ioc',
  title: 'IOC Management & Enrichment in Playbooks',
  trackId: 'platform-threat-intel',
  domainId: 'platform',
  order: 2,
  lastReviewed: '2026-08-17',
  concepts: iocPlaybookConcepts,
  quiz: iocPlaybookQuestions,
}

// ── Track 5.4 Scenario ─────────────────────────────────────────────────────

const threatIntelScenario: Scenario = {
  id: 'platform-threat-intel-scenario',
  title: 'Threat Intelligence Integration: From IOC Feed to Detection',
  context: 'Falcon Intelligence has published a new advisory: threat actor LIGHTNING-BEAR is actively targeting financial services firms with spear-phishing delivering a custom backdoor. The advisory includes 15 C2 IP addresses (confidence 90), 8 malware file hashes (confidence 95), and 3 C2 domains (confidence 85). You need to operationalise this intelligence in your Falcon + LogScale environment.',
  isCumulative: false,
  steps: [
    {
      id: 'pf-ti-s1',
      narrative: 'You receive the LIGHTNING-BEAR advisory with IOCs. All three IOC types (IPs, hashes, domains) have confidence ≥ 85. What is the correct first step to operationalise them in LogScale?',
      choices: [
        { text: 'Import the IOCs into LogScale lookup tables: create or update three lookup tables (malicious-ips, malicious-hashes, malicious-domains) with the LIGHTNING-BEAR IOCs including their confidence scores and threat actor attribution, enabling existing CQL detection rules that use lookup() to immediately match against the new intelligence' },
        { text: 'Manually search LogScale for each IP, hash, and domain individually to check if they have already appeared in your environment before importing them' },
        { text: 'Contact CrowdStrike support to have the IOCs automatically added to Falcon\'s built-in detection engine — custom IOC management is handled through support tickets' },
        { text: 'Wait for Falcon to automatically ingest the advisory IOCs — Falcon Intelligence advisories are automatically applied to all tenants within 24 hours' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Manual IOC-by-IOC searching is slow and does not operationalise the intelligence for ongoing detection. Support tickets are not how IOCs are managed — the Falcon console and API provide self-service IOC management. Automatic advisory-to-tenant IOC propagation without configuration is not how Falcon Intelligence works — IOCs require explicit import into lookup tables or custom IOC management.',
      reasoning: 'Lookup table import is the fastest way to operationalise multiple IOCs in LogScale. Once the tables are updated, any existing CQL saved search using `lookup()` against those tables will immediately start matching against the new LIGHTNING-BEAR IOCs. For high-confidence IOCs (≥85), immediate import for detection is appropriate — no need to manually pre-check each one before importing.',
      docTitle: 'LogScale Lookup Table Import',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
    },
    {
      id: 'pf-ti-s2',
      narrative: 'After importing the IOCs into LogScale lookup tables, you run a retroactive query for the past 30 days to check if LIGHTNING-BEAR has already been active in your environment. The query returns 3 matches: one DNS request to a LIGHTNING-BEAR C2 domain from 18 days ago on endpoint FIN-WS-009. What is the significance of this finding?',
      choices: [
        { text: 'Low significance — DNS requests to malicious domains are automatically blocked by Falcon; the fact that the request was made without a detection means Falcon already handled it' },
        { text: 'High significance — the DNS request 18 days ago suggests LIGHTNING-BEAR may have already compromised FIN-WS-009 or at least made contact; retrospective IOC matching revealed pre-existing activity that was not detected when it occurred; the endpoint requires immediate investigation for indicators of full compromise' },
        { text: 'Medium significance — DNS requests do not confirm compromise; monitor FIN-WS-009 for 7 days to see if additional activity occurs before initiating an investigation' },
        { text: 'No significance — the advisory IOC confidence is 85%; a 15% false positive rate means one match in a 30-day retroactive query is statistically likely to be a false positive' },
      ],
      correctChoiceIndex: 1,
      wrongConsequence: 'DNS requests to C2 domains are not automatically blocked — they generate a detection only if the domain was already in a detection rule. The 15% confidence uncertainty does not make a single match a probable false positive — 85% confidence is high. A 7-day monitoring wait delays investigation of what may be an active 18-day-old compromise. Retrospective IOC matches indicating pre-existing undetected activity are high-priority findings.',
      reasoning: 'A retrospective match 18 days ago means LIGHTNING-BEAR\'s C2 infrastructure contacted FIN-WS-009 (or FIN-WS-009 contacted the C2) before the advisory was published. This is the core value of retrospective IOC hunting: discovering historical activity that occurred before the intelligence was available. The endpoint needs immediate forensic investigation: full timeline reconstruction, check for lateral movement, and determination of whether the C2 contact resulted in a successful backdoor installation.',
      docTitle: 'Retrospective IOC Matching',
      docUrl: 'https://library.humio.com/falcon-logscale/docs-lookup-files.html',
    },
    {
      id: 'pf-ti-s3',
      narrative: 'You confirm FIN-WS-009 has the LIGHTNING-BEAR backdoor installed. During the investigation, you identify a previously unknown file hash of a variant not in the Falcon Intelligence feed. You want every other Falcon-protected endpoint to generate a detection if this new hash is observed. What do you do?',
      choices: [
        { text: 'Add the hash to the LogScale malicious-hashes lookup table — this is sufficient to detect the hash across all endpoints' },
        { text: 'Email the hash to CrowdStrike Falcon Intelligence for them to add it to the shared feed — customer-discovered hashes cannot be added as custom IOCs' },
        { text: 'Create a custom IOC in the Falcon platform for the file SHA256 with action = Detect — this immediately applies the detection rule to all endpoints with Falcon sensors in the tenant, generating a Falcon detection if the hash is observed' },
        { text: 'Add the hash to FDR\'s filter list — FDR can be configured to flag specific hashes in the event stream before LogScale ingestion' },
      ],
      correctChoiceIndex: 2,
      wrongConsequence: 'Adding the hash to LogScale lookup tables only detects it in historical FDR telemetry queries — it does not create a real-time Falcon sensor detection. Email submission does not create immediate protection — custom IOC management is self-service. FDR does not have a filter list for hashes — it is a raw telemetry export, not a detection engine.',
      reasoning: 'Custom IOC creation in the Falcon platform (`action=Detect`) is the correct mechanism for real-time endpoint detection of a newly discovered file hash. The custom IOC is immediately pushed to all Falcon sensors in the tenant — if any endpoint executes a file with this SHA256 in the future, Falcon generates a detection. This is the SOAR-to-detection promotion pattern: investigation finding → custom IOC → platform-wide coverage.',
      docTitle: 'Falcon Custom IOC Management',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-ti-s4',
      narrative: 'Your Fusion SOAR playbook has been automatically blocking all LIGHTNING-BEAR IOC matches without analyst review. Three days later, a business-critical partner application server stops receiving connections. Investigation reveals a LIGHTNING-BEAR C2 IP was recently recycled by a CDN and is now used by the partner application. What governance failure caused this?',
      choices: [
        { text: 'The partner did not notify your team before changing their CDN provider — the failure is on the partner\'s side' },
        { text: 'Falcon Intelligence should have detected the IP repurposing and automatically updated the IOC confidence to zero before it caused a block — the failure is in the intelligence feed update cadence' },
        { text: 'The LogScale lookup table update process removed the IP from the detection feed but the SOAR blocking rule was not updated simultaneously' },
        { text: 'The SOAR playbook was configured to auto-block without confidence filtering or analyst review — automated blocking of IOC matches without review causes false positives when infrastructure is recycled to legitimate use; high-confidence IOCs should still require analyst review before blocking business-critical traffic paths' },
      ],
      correctChoiceIndex: 3,
      wrongConsequence: 'Partner notification is a business process concern, not the governance failure that caused the block. Falcon Intelligence does update confidence scores when infrastructure is repurposed, but the 3-day window for repurposing detection can miss rapid recycling. The LogScale and SOAR rule discrepancy is not the described failure — the playbook was blocking all matches without confidence filtering. The root cause is the automation design: no analyst review gate before blocking production traffic.',
      reasoning: 'The governance failure is auto-blocking all IOC matches without: (1) confidence score filtering (high-confidence only for automated blocking), (2) exception management for known business traffic patterns, and (3) analyst review for blocking actions that affect production paths. The fix: update the SOAR playbook to require analyst approval before blocking, add an exception list for known partner IP ranges, and implement confidence thresholds (≥90 for auto-block, lower confidence requires review).',
      docTitle: 'Automated IOC Blocking Governance',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
    {
      id: 'pf-ti-s5',
      narrative: '90 days after the LIGHTNING-BEAR incident, you are reviewing the 8 LIGHTNING-BEAR malware hash IOCs added during the response. None of them have generated a detection in 90 days. Should you remove them from the custom IOC list?',
      choices: [
        // Distribution s5=0: correct answer must be at index 0
        { text: 'No — retain file hash IOCs from confirmed malware families indefinitely; a hash that has not been seen in 90 days may still be deployed in a future campaign; unlike IP/domain IOCs, file hashes do not get recycled to legitimate use, making them safe to retain with no false-positive risk' },
        { text: 'Yes — remove them immediately; IOCs with zero hits in 90 days provide no value and create list bloat' },
        { text: 'Convert them to LogScale-only lookup entries and remove them from the Falcon custom IOC list — file hashes are more efficiently matched in LogScale queries than in the Falcon detection engine' },
        { text: 'Escalate to CrowdStrike to add them to the shared Falcon Intelligence feed — customer-confirmed malware hashes should be contributed back to the community feed' },
      ],
      correctChoiceIndex: 0,
      wrongConsequence: 'Removing hash IOCs based solely on zero hits is premature — the absence of hits means the malware has not been deployed in your environment in 90 days, not that the threat has passed. Unlike IP/domain IOCs (which are recycled infrastructure), file hashes are deterministic: a SHA256 that belongs to LIGHTNING-BEAR\'s backdoor will always belong to that backdoor. There is no false-positive risk from retaining it. LogScale-only matching loses real-time sensor detection capability. Hash contribution to the shared feed is a separate intelligence sharing decision, not a replacement for maintaining the custom IOC.',
      reasoning: 'File hash IOCs from confirmed malware families should be retained indefinitely: they are deterministic (a SHA256 never changes meaning), they carry no recycling risk (unlike IPs/domains), and their zero-hit rate is evidence the threat has not re-appeared — not evidence they are unnecessary. The governance review for file hash IOCs focuses on: are these hashes still associated with active malware families? (Yes, for LIGHTNING-BEAR.) If so, retain them.',
      docTitle: 'IOC Retention Policies',
      docUrl: 'https://falcon.crowdstrike.com/documentation/page/falcon-intelligence-ioc',
    },
  ],
}

// ── Track 5.4 Export ────────────────────────────────────────────────────────

export const threatIntelTrack: ContentTrack = {
  id: 'platform-threat-intel',
  title: 'Threat Intelligence Integration',
  domainId: 'platform',
  order: 4,
  modules: [tiFeedsModule, iocPlaybookModule],
  scenario: threatIntelScenario,
}
