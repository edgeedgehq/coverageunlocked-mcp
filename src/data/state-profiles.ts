// ============================================================================
// CoverageUnlocked MCP Server — State Regulatory Profiles
// ============================================================================
// Key regulatory data for 15 states affecting denial appeals.
// Full profiles with enforcement gaps + legislative tracker at app.coverageunlocked.com
// ============================================================================

import type { StateProfile } from '../types.js';

export const STATE_PROFILES: Record<string, StateProfile> = {
  TX: {
    stateCode: 'TX', stateName: 'Texas',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.18,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['TX Insurance Code Ch. 1305 — PPO network adequacy', 'TX Insurance Code §843.348 — HMO appeal rights', 'TDI external review process — independent review organization (IRO)'],
  },
  FL: {
    stateCode: 'FL', stateName: 'Florida',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.02,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['FL Statute §627.6131 — 30-day prompt payment (fastest in nation)', 'FL Statute §641.511 — HMO grievance procedures', 'AHCA external review for Medicaid managed care'],
  },
  CA: {
    stateCode: 'CA', stateName: 'California',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.15,
    mentalHealthParityLevel: 'strong',
    keyRegulations: ['CA Health & Safety Code §1368 — extensive appeal rights', 'DMHC Independent Medical Review (IMR) — strongest external review in nation', 'SB 855 — California mental health parity (strongest state law)', 'CA Prompt Payment: 45 days clean claim, 15% penalty interest'],
  },
  NY: {
    stateCode: 'NY', stateName: 'New York',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.12,
    mentalHealthParityLevel: 'strong',
    keyRegulations: ['NY Insurance Law §4904 — external appeal rights', 'Timothy\'s Law — comprehensive MH parity', 'NY Prompt Pay Act — 45 days with penalty interest', 'DFS external review process'],
  },
  PA: {
    stateCode: 'PA', stateName: 'Pennsylvania',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 60,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.10,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['Act 68 — managed care consumer protection', 'PA Insurance Dept external review process', '45-day prompt payment with interest penalties'],
  },
  IL: {
    stateCode: 'IL', stateName: 'Illinois',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.02,
    mentalHealthParityLevel: 'strong',
    keyRegulations: ['215 ILCS 134 — External Review Act', '215 ILCS 5/356z.8 — step therapy restrictions', 'IL mental health parity enforcement via DOI'],
  },
  OH: {
    stateCode: 'OH', stateName: 'Ohio',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 60,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.01,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['ORC §3922 — external review rights', 'ORC §3901.38 — prompt payment requirements', 'ODI complaint process for denied claims'],
  },
  NC: {
    stateCode: 'NC', stateName: 'North Carolina',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.015,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['NCGS §58-50-61 — external review', 'NCGS §58-3-225 — prompt payment', 'NCDOI grievance process'],
  },
  WA: {
    stateCode: 'WA', stateName: 'Washington',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.02,
    mentalHealthParityLevel: 'strong',
    keyRegulations: ['RCW 48.43.535 — external review rights', 'WA Parity Implementation Act (2021)', 'OIC complaint process — proactive enforcement'],
  },
  MA: {
    stateCode: 'MA', stateName: 'Massachusetts',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 120 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.015,
    mentalHealthParityLevel: 'strong',
    keyRegulations: ['Ch. 176O — strongest mental health parity law in nation', 'EOHHS external review for MassHealth', 'DOI complaint-driven enforcement', 'MA Health Connector appeal rights'],
  },
  GA: {
    stateCode: 'GA', stateName: 'Georgia',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.02,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['GA Code §33-20A-31 — external review', 'Prompt Pay Act — 30 days, 2% interest', 'OCI complaint process'],
  },
  AZ: {
    stateCode: 'AZ', stateName: 'Arizona',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.01,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['ARS §20-2533 — external review process', 'ADOI complaint resolution', 'AHCCCS appeal rights for Medicaid'],
  },
  MI: {
    stateCode: 'MI', stateName: 'Michigan',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 60,
    promptPaymentDeadline: 45,
    penaltyInterestRate: 0.12,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['MCL §550.1401 — external review', 'DIFS complaint process', 'Michigan prompt payment with interest penalties'],
  },
  VA: {
    stateCode: 'VA', stateName: 'Virginia',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 40,
    penaltyInterestRate: 0.01,
    mentalHealthParityLevel: 'moderate',
    keyRegulations: ['VA Code §38.2-3560 — external review', 'SCC Bureau of Insurance complaint process', 'Virginia prompt payment statute'],
  },
  NE: {
    stateCode: 'NE', stateName: 'Nebraska',
    internalAppealDeadline: { commercial: 180, medicareAdvantage: 60, medicaid: 90 },
    externalReviewDeadline: 45,
    promptPaymentDeadline: 30,
    penaltyInterestRate: 0.01,
    mentalHealthParityLevel: 'weak',
    keyRegulations: ['NE Rev. Stat. §44-7311 — external review', 'NDOI complaint process', 'Nebraska prompt payment requirements'],
  },
};

export function getStateProfile(stateCode: string): StateProfile | null {
  const normalized = stateCode.toUpperCase().trim();
  return STATE_PROFILES[normalized] || null;
}

export function getStateByName(stateName: string): StateProfile | null {
  const normalized = stateName.toLowerCase().trim();
  for (const profile of Object.values(STATE_PROFILES)) {
    if (profile.stateName.toLowerCase() === normalized) return profile;
  }
  return null;
}
