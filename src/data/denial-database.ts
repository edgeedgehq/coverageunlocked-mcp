// ============================================================================
// CoverageUnlocked MCP Server — Denial Database
// ============================================================================
// Tier 1 deep profiles (14 codes) + category-level fallback for any CPT code.
// Full 489-code database available in the CoverageUnlocked platform.
// ============================================================================

import type { DenialPattern } from '../types.js';

// ---- CATEGORY AVERAGES (for fallback on unmapped codes) ----
export const CATEGORY_AVERAGES: Record<string, { denialRate: number; overturnRate: number; procedureName: string }> = {
  evaluation_management: { denialRate: 0.18, overturnRate: 0.66, procedureName: 'Evaluation and Management Service' },
  imaging: { denialRate: 0.22, overturnRate: 0.60, procedureName: 'Diagnostic Imaging Procedure' },
  infusion_chemotherapy: { denialRate: 0.18, overturnRate: 0.62, procedureName: 'Infusion or Chemotherapy Procedure' },
  rehab_therapy: { denialRate: 0.19, overturnRate: 0.62, procedureName: 'Rehabilitation Therapy Service' },
  mental_health: { denialRate: 0.25, overturnRate: 0.65, procedureName: 'Mental Health Service' },
  diagnostic: { denialRate: 0.16, overturnRate: 0.64, procedureName: 'Diagnostic Procedure' },
  dme_home_health: { denialRate: 0.17, overturnRate: 0.63, procedureName: 'Durable Medical Equipment or Home Health Service' },
  lab_pathology: { denialRate: 0.13, overturnRate: 0.65, procedureName: 'Laboratory or Pathology Service' },
  surgical: { denialRate: 0.16, overturnRate: 0.62, procedureName: 'Surgical Procedure' },
};

// ---- CPT CODE → CATEGORY MAPPING (for fallback) ----
function inferCategory(cptCode: string): string {
  const code = parseInt(cptCode, 10);
  if (isNaN(code)) {
    // HCPCS codes
    if (cptCode.startsWith('E')) return 'dme_home_health';
    if (cptCode.startsWith('J')) return 'infusion_chemotherapy';
    if (cptCode.startsWith('L')) return 'dme_home_health';
    return 'diagnostic';
  }
  if (code >= 99201 && code <= 99499) return 'evaluation_management';
  if (code >= 70000 && code <= 79999) return 'imaging';
  if (code >= 96360 && code <= 96549) return 'infusion_chemotherapy';
  if (code >= 97010 && code <= 97799) return 'rehab_therapy';
  if (code >= 90785 && code <= 90899) return 'mental_health';
  if (code >= 80000 && code <= 89999) return 'lab_pathology';
  if (code >= 10000 && code <= 69999) return 'surgical';
  if (code >= 43200 && code <= 43289) return 'diagnostic';
  if (code >= 45300 && code <= 45399) return 'diagnostic';
  return 'diagnostic';
}

// ---- TIER 1 DEEP PROFILES (14 codes) ----
const TIER1_DATABASE: Record<string, DenialPattern> = {
  '99214': {
    cptCode: '99214',
    procedureName: 'Office or Other Outpatient Visit, Established Patient, Moderate Complexity',
    category: 'evaluation_management',
    specialty: 'family_medicine',
    tier: 1,
    avgBilledAmount: 15000,
    avgAllowedAmount: 9500,
    avgCostToAppeal: 2500,
    avgDaysToResolution: 28,
    nationalDenialRate: 0.24,
    nationalOverturnRate: 0.68,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Downcoding from 99214 to 99213 — claim exceeds 90th percentile for specialty', percentage: 0.45, appealSuccessRate: 0.62, category: 'downcoding' },
      { reason: 'Insufficient Medical Decision Making (MDM) documentation', percentage: 0.30, appealSuccessRate: 0.71, category: 'medical_necessity' },
      { reason: 'Time-based billing with insufficient time documentation', percentage: 0.15, appealSuccessRate: 0.55, category: 'medical_necessity' },
      { reason: 'Multiple visits same day — bundling dispute', percentage: 0.07, appealSuccessRate: 0.48, category: 'bundling' },
      { reason: 'Virtual visit coding when in-person required per payer policy', percentage: 0.03, appealSuccessRate: 0.52, category: 'coverage_exclusion' },
    ],
    payerDenialRates: { umr: 0.28, anthem: 0.25, aetna: 0.22, cigna: 0.26, humana: 0.31, bcbs_generic: 0.18 },
    criticalDocumentationGaps: [
      'MDM documentation missing specific number of diagnoses or treatment options considered',
      'Severity/complexity of patient problem not explicitly stated',
      'Time spent documented generically without detail on high-complexity elements',
      'Risk assessment for patient management not documented separately',
      'Templates that look identical across E&M levels',
    ],
    insiderTips: [
      'CMS OIG identified 99214 as #1 source of improper payments — 52% of sampled claims had insufficient documentation (OEI-12-19-00420)',
      'Peer comparison downcoding is algorithmic: if you are in 85th+ percentile for specialty, you get flagged automatically regardless of documentation quality',
      '3-of-3 MDM rule: payers require explicit documentation of (1) number of diagnoses, (2) amount/complexity of records reviewed, (3) risk of complications',
      'Time-based billing: document in 15-minute increments with timestamps. Generic "45 minutes of counseling" is the #1 time-based denial cause',
    ],
    seasonalPatterns: 'Year-end audits spike in October-November. Mid-year claims have slightly lower denial rates.',
    regulatoryLeverage: [
      'AMA CPT Guidelines for Evaluation and Management Services',
      'CMS MLN Connects Education Articles on MDM documentation (2023)',
      '42 CFR §422.101 requiring MA plans to cover at parity with traditional Medicare',
      'OIG Report OEI-12-19-00420: Improper Medicare FFS Payments for E&M',
    ],
    dataSources: [
      { source: 'public_cms', label: 'OIG Report OEI-12-19-00420', url: 'https://oig.hhs.gov/oei/reports/oei-12-19-00420.pdf', lastRefreshed: '2024-01-15' },
      { source: 'insider_knowledge', label: 'CoverageUnlocked: 20 years insurance industry analysis', lastRefreshed: '2026-03-25' },
    ],
  },

  '99285': {
    cptCode: '99285',
    procedureName: 'Emergency Department Visit, High Complexity',
    category: 'evaluation_management',
    specialty: 'emergency_medicine',
    tier: 1,
    avgBilledAmount: 25000,
    avgAllowedAmount: 14500,
    avgCostToAppeal: 4000,
    avgDaysToResolution: 32,
    nationalDenialRate: 0.21,
    nationalOverturnRate: 0.65,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Downcoding to 99284/99283 — payer says 3-of-3 MDM elements not present', percentage: 0.52, appealSuccessRate: 0.59, category: 'downcoding' },
      { reason: 'Observation vs. inpatient coding dispute', percentage: 0.20, appealSuccessRate: 0.62, category: 'medical_necessity' },
      { reason: 'Emergency stabilization deemed routine/non-complex', percentage: 0.15, appealSuccessRate: 0.68, category: 'medical_necessity' },
      { reason: 'H&P insufficient for claimed complexity', percentage: 0.08, appealSuccessRate: 0.55, category: 'downcoding' },
    ],
    payerDenialRates: { umr: 0.25, anthem: 0.22, aetna: 0.19, cigna: 0.23, humana: 0.28, bcbs_generic: 0.16 },
    criticalDocumentationGaps: [
      'Three-of-three MDM elements not explicitly documented',
      'Differential diagnosis list missing or generic',
      'Severity indicators not documented explicitly',
    ],
    insiderTips: [
      '99285 is the most denied high-level ED code. The 3-of-3 MDM rule must be explicit.',
      'ED documentation systems that auto-populate generic complexity statements are flagged as template overuse and automatically downcoded',
      'For life-threatening conditions (sepsis, MI, stroke): document "life-threatening" explicitly — this is your 99285 anchor',
    ],
    regulatoryLeverage: [
      'EMTALA (42 CFR §489.24) — emergency stabilization cannot be bundled/reduced',
      'Prudent Layperson Standard — applies to insurance coverage decisions for ED visits',
    ],
    dataSources: [
      { source: 'public_cms', label: 'CMS EMTALA Guidance', lastRefreshed: '2024-01-15' },
      { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' },
    ],
  },

  '99223': {
    cptCode: '99223',
    procedureName: 'Initial Hospital Care, High Complexity',
    category: 'evaluation_management',
    specialty: 'internal_medicine',
    tier: 1,
    avgBilledAmount: 30000,
    avgAllowedAmount: 18000,
    avgCostToAppeal: 5000,
    avgDaysToResolution: 35,
    nationalDenialRate: 0.19,
    nationalOverturnRate: 0.64,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Inpatient vs. observation status dispute (Two-Midnight Rule)', percentage: 0.40, appealSuccessRate: 0.66, category: 'medical_necessity' },
      { reason: 'Downcoding to 99222 based on MDM assessment', percentage: 0.30, appealSuccessRate: 0.58, category: 'downcoding' },
      { reason: 'Admission not meeting inpatient criteria per payer guidelines', percentage: 0.20, appealSuccessRate: 0.62, category: 'medical_necessity' },
    ],
    payerDenialRates: { umr: 0.22, anthem: 0.20, aetna: 0.17, cigna: 0.21, humana: 0.26, bcbs_generic: 0.15 },
    insiderTips: [
      'The Two-Midnight Rule is your strongest weapon: if physician expects patient to need 2+ midnights, inpatient is appropriate',
      'Medicare Advantage plans frequently apply stricter-than-Medicare criteria — cite 42 CFR §422.101(b)',
    ],
    regulatoryLeverage: ['CMS Two-Midnight Rule (42 CFR §412.3)', '42 CFR §422.101(b) MA plan parity requirement'],
    dataSources: [{ source: 'public_cms', label: 'CMS Two-Midnight Rule guidance', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '99291': {
    cptCode: '99291',
    procedureName: 'Critical Care, First 30-74 Minutes',
    category: 'evaluation_management',
    specialty: 'critical_care',
    tier: 1,
    avgBilledAmount: 45000,
    avgAllowedAmount: 28000,
    avgCostToAppeal: 6000,
    avgDaysToResolution: 30,
    nationalDenialRate: 0.16,
    nationalOverturnRate: 0.70,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Time documentation insufficient — must show 30+ minutes of direct critical care', percentage: 0.45, appealSuccessRate: 0.72, category: 'medical_necessity' },
      { reason: 'Patient condition not meeting critical illness/injury threshold', percentage: 0.30, appealSuccessRate: 0.65, category: 'medical_necessity' },
      { reason: 'Bundling with other same-day services', percentage: 0.25, appealSuccessRate: 0.58, category: 'bundling' },
    ],
    payerDenialRates: { umr: 0.18, anthem: 0.16, aetna: 0.14, cigna: 0.17, humana: 0.22, bcbs_generic: 0.12 },
    insiderTips: [
      '70% overturn rate — highest of any E&M code. Always appeal critical care denials.',
      'Document: (1) what made condition critical, (2) specific interventions, (3) time spent with timestamps',
    ],
    regulatoryLeverage: ['AMA CPT Guidelines for Critical Care Time Reporting', 'CMS MLN Critical Care Fact Sheet'],
    dataSources: [{ source: 'public_cms', label: 'CMS Critical Care guidelines', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '90837': {
    cptCode: '90837',
    procedureName: 'Psychotherapy, 60 Minutes',
    category: 'mental_health',
    specialty: 'psychiatry',
    tier: 1,
    avgBilledAmount: 18000,
    avgAllowedAmount: 11000,
    avgCostToAppeal: 3000,
    avgDaysToResolution: 35,
    nationalDenialRate: 0.28,
    nationalOverturnRate: 0.66,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Concurrent review lapse — authorization expired during ongoing treatment', percentage: 0.35, appealSuccessRate: 0.70, category: 'prior_authorization' },
      { reason: 'Medical necessity — payer disputes ongoing therapy need', percentage: 0.30, appealSuccessRate: 0.64, category: 'medical_necessity' },
      { reason: 'Downcoding to 90834 (45 min) — insufficient documentation of 60-min session', percentage: 0.20, appealSuccessRate: 0.58, category: 'downcoding' },
      { reason: 'Visit limit exceeded per plan benefit', percentage: 0.15, appealSuccessRate: 0.72, category: 'visit_limit' },
    ],
    payerDenialRates: { umr: 0.32, anthem: 0.29, aetna: 0.26, cigna: 0.30, humana: 0.35, bcbs_generic: 0.22 },
    insiderTips: [
      '28% denial rate — highest of Tier 1 codes. Mental health is the most denied category.',
      'Visit limit denials have 72% overturn rate because of Mental Health Parity Act — ALWAYS appeal these',
      'Concurrent review lapse is a payer strategy: they "forget" to reauthorize, then deny for lack of auth',
      'Cite the Mental Health Parity and Addiction Equity Act (MHPAEA) in every appeal — payers must cover MH at parity with medical',
    ],
    regulatoryLeverage: [
      'Mental Health Parity and Addiction Equity Act (MHPAEA) — 29 CFR §2590.712',
      'CMS Final Rule on MHPAEA Enforcement (2024)',
      'State mental health parity laws (many stronger than federal)',
    ],
    dataSources: [{ source: 'public_cms', label: 'MHPAEA enforcement data', lastRefreshed: '2024-06-01' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '70553': {
    cptCode: '70553',
    procedureName: 'Brain MRI With and Without Contrast',
    category: 'imaging',
    specialty: 'radiology',
    tier: 1,
    avgBilledAmount: 35000,
    avgAllowedAmount: 18000,
    avgCostToAppeal: 4500,
    avgDaysToResolution: 25,
    nationalDenialRate: 0.26,
    nationalOverturnRate: 0.58,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'RBM vendor criteria mismatch — EviCore/AIM clinical criteria not met', percentage: 0.40, appealSuccessRate: 0.55, category: 'prior_authorization' },
      { reason: 'Step therapy — CT or X-ray not performed first', percentage: 0.25, appealSuccessRate: 0.52, category: 'step_therapy' },
      { reason: 'Medical necessity — clinical indication insufficient for advanced imaging', percentage: 0.20, appealSuccessRate: 0.62, category: 'medical_necessity' },
      { reason: 'Duplicate imaging — prior MRI within payer-defined timeframe', percentage: 0.15, appealSuccessRate: 0.48, category: 'quantity_limit' },
    ],
    payerDenialRates: { umr: 0.30, anthem: 0.27, aetna: 0.24, cigna: 0.28, humana: 0.33, bcbs_generic: 0.20 },
    insiderTips: [
      'RBM vendors (EviCore, AIM) use algorithmic criteria that differ from medical standards — learn their specific criteria',
      'Step therapy requirement is often satisfied by documenting why CT was inappropriate (not just that MRI was needed)',
      'Peer-to-peer review with the radiologist is your best appeal strategy — 58% overturn when P2P is requested',
    ],
    regulatoryLeverage: ['CMS Clinical Decision Support Requirements (PAMA §218b)', 'State prior auth reform laws'],
    dataSources: [{ source: 'public_cms', label: 'PAMA imaging PA requirements', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '74177': {
    cptCode: '74177',
    procedureName: 'CT Abdomen and Pelvis with IV Contrast',
    category: 'imaging',
    specialty: 'radiology',
    tier: 1,
    avgBilledAmount: 28000,
    avgAllowedAmount: 14000,
    avgCostToAppeal: 3500,
    avgDaysToResolution: 22,
    nationalDenialRate: 0.24,
    nationalOverturnRate: 0.59,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'RBM recommends ultrasound first for abdominal complaints', percentage: 0.35, appealSuccessRate: 0.54, category: 'step_therapy' },
      { reason: 'Prior authorization not obtained', percentage: 0.30, appealSuccessRate: 0.50, category: 'prior_authorization' },
      { reason: 'Medical necessity — clinical indication does not meet imaging criteria', percentage: 0.25, appealSuccessRate: 0.65, category: 'medical_necessity' },
    ],
    payerDenialRates: { umr: 0.28, anthem: 0.25, aetna: 0.22, cigna: 0.26, humana: 0.30, bcbs_generic: 0.18 },
    insiderTips: [
      'When ultrasound is insufficient for diagnosis (obesity, gas, suspected mass), document the specific reason — this defeats step therapy',
      'Emergency CT scans bypass step therapy — document emergency medical decision-making explicitly',
    ],
    regulatoryLeverage: ['PAMA Clinical Decision Support requirements', 'State emergency imaging protection laws'],
    dataSources: [{ source: 'public_cms', label: 'CMS imaging PA data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '96413': {
    cptCode: '96413',
    procedureName: 'Chemotherapy IV Infusion, First Hour',
    category: 'infusion_chemotherapy',
    specialty: 'oncology',
    tier: 1,
    avgBilledAmount: 50000,
    avgAllowedAmount: 32000,
    avgCostToAppeal: 8000,
    avgDaysToResolution: 28,
    nationalDenialRate: 0.18,
    nationalOverturnRate: 0.64,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'Step therapy — preferred/cheaper agent not tried first', percentage: 0.35, appealSuccessRate: 0.60, category: 'step_therapy' },
      { reason: 'Prior authorization expired or not obtained', percentage: 0.30, appealSuccessRate: 0.58, category: 'prior_authorization' },
      { reason: 'Biosimilar requirement — brand-name when biosimilar available', percentage: 0.20, appealSuccessRate: 0.55, category: 'medical_necessity' },
      { reason: 'Site of care steering — payer prefers outpatient over hospital setting', percentage: 0.15, appealSuccessRate: 0.70, category: 'medical_necessity' },
    ],
    payerDenialRates: { umr: 0.20, anthem: 0.18, aetna: 0.16, cigna: 0.19, humana: 0.24, bcbs_generic: 0.14 },
    insiderTips: [
      'Site of care denials have 70% overturn rate — if patient needs hospital-based infusion (monitoring, comorbidities), document why',
      'Step therapy exceptions: document allergies, contraindications, or prior treatment failures explicitly',
      'NCCN guidelines are your best friend — cite the specific guideline version supporting the regimen',
    ],
    regulatoryLeverage: ['NCCN Clinical Practice Guidelines', 'State step therapy exception laws', '21st Century Cures Act §6082'],
    dataSources: [{ source: 'public_cms', label: 'CMS oncology PA data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '96365': {
    cptCode: '96365',
    procedureName: 'Intravenous Infusion, Non-Chemotherapy, Initial Hour',
    category: 'infusion_chemotherapy',
    specialty: 'rheumatology',
    tier: 1,
    avgBilledAmount: 35000,
    avgAllowedAmount: 22000,
    avgCostToAppeal: 5000,
    avgDaysToResolution: 30,
    nationalDenialRate: 0.20,
    nationalOverturnRate: 0.62,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'Biosimilar requirement — payer requires biosimilar when reference biologic prescribed', percentage: 0.40, appealSuccessRate: 0.58, category: 'step_therapy' },
      { reason: 'Site of care steering — payer prefers home infusion or ambulatory center', percentage: 0.30, appealSuccessRate: 0.65, category: 'medical_necessity' },
      { reason: 'Prior auth expired during treatment course', percentage: 0.30, appealSuccessRate: 0.60, category: 'prior_authorization' },
    ],
    payerDenialRates: { umr: 0.23, anthem: 0.21, aetna: 0.18, cigna: 0.22, humana: 0.27, bcbs_generic: 0.16 },
    insiderTips: [
      'Biosimilar switching: if patient is stable on reference biologic, cite FDA guidance that switching is a medical decision',
      'Site of care: document infusion reaction history, monitoring needs, or comorbidities requiring hospital setting',
    ],
    regulatoryLeverage: ['FDA Biosimilar Guidance Documents', 'State biosimilar substitution laws'],
    dataSources: [{ source: 'public_cms', label: 'CMS infusion therapy data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '97110': {
    cptCode: '97110',
    procedureName: 'Therapeutic Exercises',
    category: 'rehab_therapy',
    specialty: 'physical_therapy',
    tier: 1,
    avgBilledAmount: 8500,
    avgAllowedAmount: 5500,
    avgCostToAppeal: 1500,
    avgDaysToResolution: 21,
    nationalDenialRate: 0.22,
    nationalOverturnRate: 0.61,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Medicare Therapy Threshold exceeded ($2,480) without KX modifier', percentage: 0.35, appealSuccessRate: 0.60, category: 'quantity_limit' },
      { reason: 'Functional plateau — payer claims patient not making measurable progress', percentage: 0.30, appealSuccessRate: 0.58, category: 'medical_necessity' },
      { reason: 'Visit limit exceeded per plan benefit design', percentage: 0.20, appealSuccessRate: 0.55, category: 'visit_limit' },
      { reason: 'Bundling with other therapy codes same session', percentage: 0.15, appealSuccessRate: 0.52, category: 'bundling' },
    ],
    payerDenialRates: { umr: 0.25, anthem: 0.23, aetna: 0.20, cigna: 0.24, humana: 0.28, bcbs_generic: 0.17 },
    insiderTips: [
      'KX modifier is required once Medicare therapy threshold is reached — missing this is the #1 preventable denial',
      'Functional plateau: document objective measurements (ROM, strength scores, functional independence measures) showing improvement trend',
      '"Maintenance therapy" is covered by Medicare since Jimmo v. Sebelius (2013) — payers still deny it, but this ruling is your leverage',
    ],
    regulatoryLeverage: ['Jimmo v. Sebelius settlement (2013) — maintenance therapy coverage', 'Medicare KX modifier requirements', '42 CFR §410.60 PT/OT coverage'],
    dataSources: [{ source: 'public_cms', label: 'Medicare therapy threshold data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '45378': {
    cptCode: '45378',
    procedureName: 'Colonoscopy, Diagnostic',
    category: 'diagnostic',
    specialty: 'gastroenterology',
    tier: 1,
    avgBilledAmount: 25000,
    avgAllowedAmount: 15000,
    avgCostToAppeal: 3500,
    avgDaysToResolution: 25,
    nationalDenialRate: 0.19,
    nationalOverturnRate: 0.63,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Screening vs. diagnostic classification error — billed as diagnostic when payer classifies as screening', percentage: 0.45, appealSuccessRate: 0.65, category: 'coverage_exclusion' },
      { reason: 'Frequency limitation — colonoscopy within payer-defined interval of prior study', percentage: 0.30, appealSuccessRate: 0.58, category: 'quantity_limit' },
      { reason: 'Anesthesia bundling — separate anesthesia code denied as included', percentage: 0.25, appealSuccessRate: 0.55, category: 'bundling' },
    ],
    payerDenialRates: { umr: 0.22, anthem: 0.20, aetna: 0.17, cigna: 0.21, humana: 0.25, bcbs_generic: 0.14 },
    insiderTips: [
      'The screening vs. diagnostic distinction is the #1 colonoscopy denial issue. If polyps are found during screening, the procedure converts to diagnostic — payer should cover but often denies',
      'ACA preventive care mandate: screening colonoscopy must be covered at 100% with no cost sharing. If denied, cite ACA §2713',
      'Document the clinical indication clearly: "diagnostic colonoscopy for [symptom/finding]" — not just the CPT code',
    ],
    regulatoryLeverage: ['ACA §2713 preventive care coverage mandate', 'CMS screening colonoscopy NCD 210.3'],
    dataSources: [{ source: 'public_cms', label: 'CMS NCD 210.3 Colonoscopy coverage', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '43239': {
    cptCode: '43239',
    procedureName: 'Upper GI Endoscopy (EGD) with Biopsy',
    category: 'diagnostic',
    specialty: 'gastroenterology',
    tier: 1,
    avgBilledAmount: 22000,
    avgAllowedAmount: 13000,
    avgCostToAppeal: 3000,
    avgDaysToResolution: 23,
    nationalDenialRate: 0.17,
    nationalOverturnRate: 0.64,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Prior authorization not obtained (some payers require for elective EGD)', percentage: 0.40, appealSuccessRate: 0.60, category: 'prior_authorization' },
      { reason: 'Medical necessity — insufficient clinical indication for upper endoscopy', percentage: 0.35, appealSuccessRate: 0.66, category: 'medical_necessity' },
      { reason: 'Frequency limitation — repeat EGD within payer interval', percentage: 0.25, appealSuccessRate: 0.58, category: 'quantity_limit' },
    ],
    payerDenialRates: { umr: 0.20, anthem: 0.18, aetna: 0.15, cigna: 0.19, humana: 0.23, bcbs_generic: 0.13 },
    insiderTips: [
      'Prior auth requirements for EGD vary wildly by payer — verify before scheduling',
      'For Barrett esophagus surveillance: cite ACG guidelines for surveillance intervals to defeat frequency denials',
    ],
    regulatoryLeverage: ['ACG Clinical Guidelines for Barrett Esophagus Surveillance', 'CMS LCD for Upper GI Endoscopy'],
    dataSources: [{ source: 'public_cms', label: 'CMS LCD data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  'E0601': {
    cptCode: 'E0601',
    procedureName: 'CPAP Device (Continuous Positive Airway Pressure)',
    category: 'dme_home_health',
    specialty: 'pulmonology',
    tier: 1,
    avgBilledAmount: 20000,
    avgAllowedAmount: 12000,
    avgCostToAppeal: 2500,
    avgDaysToResolution: 30,
    nationalDenialRate: 0.20,
    nationalOverturnRate: 0.62,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'Face-to-face (F2F) encounter requirement not met within 6-month window', percentage: 0.35, appealSuccessRate: 0.60, category: 'prior_authorization' },
      { reason: 'Sleep study results not meeting AHI threshold (≥5 events/hour)', percentage: 0.30, appealSuccessRate: 0.55, category: 'medical_necessity' },
      { reason: 'Compliance data not submitted (Medicare requires 4hrs/night for 70% of nights)', percentage: 0.20, appealSuccessRate: 0.58, category: 'medical_necessity' },
      { reason: 'Rental vs. purchase dispute', percentage: 0.15, appealSuccessRate: 0.50, category: 'coverage_exclusion' },
    ],
    payerDenialRates: { umr: 0.23, anthem: 0.21, aetna: 0.18, cigna: 0.22, humana: 0.26, bcbs_generic: 0.16 },
    insiderTips: [
      'F2F timing: the qualifying sleep study AND the F2F encounter must both occur within the 6 months before DME order. Miss this window and you restart.',
      'Medicare CPAP compliance: download machine data at 31 and 91 days. If patient is non-compliant at 91 days, Medicare stops paying.',
      'Home sleep testing (HST) results must meet the SAME AHI criteria as lab studies — some payers apply different thresholds improperly',
    ],
    regulatoryLeverage: ['CMS LCD for CPAP (L33718)', 'DME Face-to-Face Requirements (42 CFR §410.38)'],
    dataSources: [{ source: 'public_cms', label: 'CMS LCD L33718 CPAP coverage', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },

  '81479': {
    cptCode: '81479',
    procedureName: 'Unlisted Molecular Pathology Procedure',
    category: 'lab_pathology',
    specialty: 'molecular_diagnostics',
    tier: 1,
    avgBilledAmount: 40000,
    avgAllowedAmount: 15000,
    avgCostToAppeal: 6000,
    avgDaysToResolution: 45,
    nationalDenialRate: 0.32,
    nationalOverturnRate: 0.55,
    priorAuthRequired: true,
    topDenialReasons: [
      { reason: 'LCD/NCD non-compliance — test not covered under local/national coverage determination', percentage: 0.40, appealSuccessRate: 0.52, category: 'coverage_exclusion' },
      { reason: 'Experimental/investigational classification', percentage: 0.30, appealSuccessRate: 0.48, category: 'experimental_investigational' },
      { reason: 'Prior authorization not obtained for genetic testing', percentage: 0.20, appealSuccessRate: 0.58, category: 'prior_authorization' },
      { reason: 'Unlisted code with insufficient documentation of what was performed', percentage: 0.10, appealSuccessRate: 0.45, category: 'medical_necessity' },
    ],
    payerDenialRates: { umr: 0.36, anthem: 0.33, aetna: 0.30, cigna: 0.34, humana: 0.38, bcbs_generic: 0.26 },
    insiderTips: [
      'Highest denial rate of all Tier 1 codes (32%). Unlisted codes are automatic audit triggers.',
      'Always submit with a detailed cover letter explaining: (1) what test was performed, (2) why an existing CPT code is insufficient, (3) clinical utility',
      'For genetic tests: cite NCCN guidelines, ACMG recommendations, or published clinical utility studies',
      'Some payers have specific molecular pathology policies — check before submitting under 81479',
    ],
    regulatoryLeverage: ['CMS MolDX Program LCDs', 'ACMG Clinical Utility Framework', '21st Century Cures Act §4001 (coverage with evidence development)'],
    dataSources: [{ source: 'public_cms', label: 'MolDX LCD coverage data', lastRefreshed: '2024-01-15' }, { source: 'insider_knowledge', label: 'CoverageUnlocked analysis', lastRefreshed: '2026-03-25' }],
  },
};

// ---- QUERY FUNCTIONS ----

export function getDenialPattern(cptCode: string): DenialPattern | null {
  return TIER1_DATABASE[cptCode] || null;
}

export function getDenialPatternWithFallback(cptCode: string): DenialPattern {
  const pattern = TIER1_DATABASE[cptCode];
  if (pattern) return pattern;

  // Generate category-level fallback
  const category = inferCategory(cptCode);
  const avg = CATEGORY_AVERAGES[category] || CATEGORY_AVERAGES.diagnostic;

  return {
    cptCode,
    procedureName: avg.procedureName,
    category,
    specialty: 'general',
    tier: 4, // fallback tier
    nationalDenialRate: avg.denialRate,
    nationalOverturnRate: avg.overturnRate,
    priorAuthRequired: false,
    topDenialReasons: [
      { reason: 'Medical necessity disputed by payer', percentage: 0.40, appealSuccessRate: 0.60 },
      { reason: 'Prior authorization not obtained or expired', percentage: 0.30, appealSuccessRate: 0.55 },
      { reason: 'Frequency or quantity limits exceeded', percentage: 0.30, appealSuccessRate: 0.58 },
    ],
    payerDenialRates: {
      umr: avg.denialRate + 0.02,
      anthem: avg.denialRate,
      aetna: avg.denialRate - 0.02,
      cigna: avg.denialRate + 0.01,
      humana: avg.denialRate + 0.04,
      bcbs_generic: avg.denialRate - 0.04,
    },
    criticalDocumentationGaps: [
      'Clinical indication not clearly documented',
      'Prior authorization status not verified before service',
      'Medical necessity rationale not explicitly stated',
    ],
    insiderTips: [
      'For any denial, request the specific clinical criteria the payer used to deny — they must provide this under law',
      'Always appeal. National average overturn rate is 60%+ across all categories.',
    ],
    regulatoryLeverage: ['State insurance regulations on timely claim processing', 'CMS Medicare coverage guidelines'],
    dataSources: [
      { source: 'category_estimate', label: `Category average: ${category}. Full data for 489 CPT codes at app.coverageunlocked.com`, lastRefreshed: '2026-03-25' },
    ],
  };
}

export function getPayerDenialRate(cptCode: string, payerKey: string): number | null {
  const pattern = getDenialPatternWithFallback(cptCode);
  // Normalize payer key
  const normalized = payerKey.toLowerCase().replace(/[\s-]+/g, '_');
  const payers = pattern.payerDenialRates;

  // Direct match
  if (payers[normalized] !== undefined) return payers[normalized];

  // Fuzzy match
  for (const [key, rate] of Object.entries(payers)) {
    if (normalized.includes(key) || key.includes(normalized)) return rate;
  }

  // Default to national rate
  return pattern.nationalDenialRate;
}

export function calculateWinProbability(cptCode: string, payerKey?: string): number {
  const pattern = getDenialPatternWithFallback(cptCode);

  if (payerKey) {
    const payerRate = getPayerDenialRate(cptCode, payerKey);
    if (payerRate !== null) {
      // Higher payer denial rate slightly reduces overturn probability
      const payerAdjustment = (payerRate - pattern.nationalDenialRate) * 0.1;
      return Math.min(0.95, Math.max(0.30, pattern.nationalOverturnRate - payerAdjustment));
    }
  }

  return pattern.nationalOverturnRate;
}

export function getDatabaseSummary(): { totalTier1: number; totalCptCoverage: string; categories: string[] } {
  return {
    totalTier1: Object.keys(TIER1_DATABASE).length,
    totalCptCoverage: '489 CPT codes with detailed profiles + category-level fallback for any code',
    categories: Object.keys(CATEGORY_AVERAGES),
  };
}
