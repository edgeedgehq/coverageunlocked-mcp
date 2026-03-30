// ============================================================================
// CoverageUnlocked MCP Server — Payer Behavioral Profiles
// ============================================================================
// Summarized payer intelligence for MCP responses.
// Full behavioral graph with 20+ payers at app.coverageunlocked.com
// ============================================================================

import type { PayerProfile } from '../types.js';

export const PAYER_PROFILES: Record<string, PayerProfile> = {
  unitedhealthcare: {
    id: 'unitedhealthcare',
    name: 'UnitedHealthcare',
    type: 'national',
    overallDenialRate: 0.22,
    overallOverturnRate: 0.54,
    avgAppealTimeline: '30-45 days',
    knownBehaviors: [
      { behavior: 'Aggressive downcoding on E&M using peer comparison algorithms', category: 'downcoding', counterStrategy: 'Document MDM explicitly with 3-of-3 elements. Cite AMA CPT guidelines in appeal.' },
      { behavior: 'UMR subsidiary applies stricter criteria than parent UHC policies', category: 'prior_authorization', counterStrategy: 'Request UHC corporate policy if UMR denies — UMR must comply with parent company coverage determinations.' },
      { behavior: 'Site-of-care steering for infusions — pushing to home/ambulatory settings', category: 'medical_necessity', counterStrategy: 'Document clinical need for hospital setting: infusion reactions, monitoring requirements, comorbidities.' },
    ],
  },

  anthem: {
    id: 'anthem',
    name: 'Anthem / Elevance Health',
    type: 'national',
    overallDenialRate: 0.20,
    overallOverturnRate: 0.56,
    avgAppealTimeline: '30-60 days',
    knownBehaviors: [
      { behavior: 'Carelon/AIM Specialty Health applies strict imaging criteria — often stricter than CMS', category: 'prior_authorization', counterStrategy: 'Request peer-to-peer with AIM reviewer. Cite ACR Appropriateness Criteria as evidence.' },
      { behavior: 'Observation vs. inpatient status disputes on hospital admissions', category: 'medical_necessity', counterStrategy: 'Invoke CMS Two-Midnight Rule (42 CFR §412.3). Document expected length of stay.' },
      { behavior: 'Mental health concurrent review lapses — authorization expires, then denial for lack of auth', category: 'prior_authorization', counterStrategy: 'Track authorization dates proactively. File MHPAEA complaint if MH auth requirements are stricter than medical.' },
    ],
  },

  aetna: {
    id: 'aetna',
    name: 'Aetna (CVS Health)',
    type: 'national',
    overallDenialRate: 0.19,
    overallOverturnRate: 0.58,
    avgAppealTimeline: '30-45 days',
    knownBehaviors: [
      { behavior: 'Clinical Policy Bulletins (CPBs) used as denial basis — often more restrictive than CMS', category: 'medical_necessity', counterStrategy: 'Request the specific CPB version. Challenge deviations from CMS coverage with 42 CFR §422.101.' },
      { behavior: 'Step therapy enforcement on specialty drugs', category: 'step_therapy', counterStrategy: 'Document prior treatment failures or contraindications. Cite state step therapy exception laws.' },
      { behavior: 'Genetic testing denials under experimental/investigational classification', category: 'experimental_investigational', counterStrategy: 'Cite NCCN guidelines and published clinical utility studies. Request external review under state law.' },
    ],
  },

  cigna: {
    id: 'cigna',
    name: 'Cigna Healthcare',
    type: 'national',
    overallDenialRate: 0.21,
    overallOverturnRate: 0.55,
    avgAppealTimeline: '30-45 days',
    knownBehaviors: [
      { behavior: 'EviCore partnership for imaging and cardiology prior auth — algorithmic denials common', category: 'prior_authorization', counterStrategy: 'Learn EviCore-specific criteria for your procedure. Peer-to-peer review requests often result in approval.' },
      { behavior: 'Aggressive bundling of therapy codes — denying 97110+97140 same session', category: 'bundling', counterStrategy: 'Document distinct therapeutic goals for each code. Use modifier -59 for distinct services.' },
      { behavior: 'Post-service claim review with retroactive denials', category: 'medical_necessity', counterStrategy: 'Check state retroactive denial protection laws. Many states limit post-service reviews to 12-18 months.' },
    ],
  },

  humana: {
    id: 'humana',
    name: 'Humana',
    type: 'national',
    overallDenialRate: 0.24,
    overallOverturnRate: 0.52,
    avgAppealTimeline: '35-60 days',
    knownBehaviors: [
      { behavior: 'Highest denial rate among national payers — particularly aggressive on Medicare Advantage', category: 'medical_necessity', counterStrategy: 'MA plans must cover everything Original Medicare covers (42 CFR §422.101). Cite specific NCD/LCD.' },
      { behavior: 'Inpatient admission denials citing Milliman Care Guidelines over CMS criteria', category: 'medical_necessity', counterStrategy: 'Milliman guidelines are not CMS policy. Appeal citing actual CMS coverage criteria and Two-Midnight Rule.' },
      { behavior: 'DME coverage denials with strict F2F documentation requirements', category: 'prior_authorization', counterStrategy: 'Verify F2F timing window. Document all elements in the physician narrative, not just the checkbox form.' },
    ],
  },

  bcbs_generic: {
    id: 'bcbs_generic',
    name: 'Blue Cross Blue Shield (varies by state)',
    type: 'state_blues',
    overallDenialRate: 0.18,
    overallOverturnRate: 0.58,
    avgAppealTimeline: '30-45 days',
    knownBehaviors: [
      { behavior: 'State-specific policies vary dramatically — BCBS-TX differs from BCBS-MA significantly', category: 'prior_authorization', counterStrategy: 'Identify the specific state plan and its clinical review vendor. Do not assume national BCBS policies apply.' },
      { behavior: 'Generally lower denial rates than national payers but longer appeal timelines', category: 'medical_necessity', counterStrategy: 'State insurance department complaints are effective for state Blues plans — they are state-regulated.' },
    ],
  },

  tricare: {
    id: 'tricare',
    name: 'TRICARE (Military)',
    type: 'military',
    overallDenialRate: 0.17,
    overallOverturnRate: 0.60,
    avgAppealTimeline: '30-90 days',
    knownBehaviors: [
      { behavior: 'Referral authorization required for non-emergency specialty care (TRICARE Prime)', category: 'prior_authorization', counterStrategy: 'Ensure referral from PCM before specialty visit. Emergency care is always covered without referral under EMTALA.' },
      { behavior: 'Network restrictions — non-network provider denials', category: 'coverage_exclusion', counterStrategy: 'Document network adequacy issues (wait times, distance). TRICARE must provide network access within standards.' },
      { behavior: 'Coordination of benefits issues with other health insurance (OHI)', category: 'coverage_exclusion', counterStrategy: 'TRICARE is always secondary to OHI. File with primary insurance first, then submit to TRICARE with primary EOB.' },
    ],
  },
};

export function getPayerProfile(payerName: string): PayerProfile | null {
  const normalized = payerName.toLowerCase().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');

  // Direct match
  if (PAYER_PROFILES[normalized]) return PAYER_PROFILES[normalized];

  // Fuzzy match
  for (const [key, profile] of Object.entries(PAYER_PROFILES)) {
    if (normalized.includes(key) || key.includes(normalized) ||
        profile.name.toLowerCase().includes(payerName.toLowerCase()) ||
        payerName.toLowerCase().includes(profile.name.toLowerCase())) {
      return profile;
    }
  }

  // Common aliases
  const aliases: Record<string, string> = {
    uhc: 'unitedhealthcare',
    united: 'unitedhealthcare',
    umr: 'unitedhealthcare',
    elevance: 'anthem',
    bcbs: 'bcbs_generic',
    blue_cross: 'bcbs_generic',
    bluecross: 'bcbs_generic',
    cvs: 'aetna',
    military: 'tricare',
  };

  for (const [alias, key] of Object.entries(aliases)) {
    if (normalized.includes(alias)) return PAYER_PROFILES[key] || null;
  }

  return null;
}
