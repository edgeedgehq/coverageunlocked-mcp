// ============================================================================
// CoverageUnlocked MCP Server — Core Types
// ============================================================================

export interface DenialReason {
  reason: string;
  percentage: number; // 0-1
  appealSuccessRate: number; // 0-1
  category?: string;
}

export interface DataSourceTag {
  source: string;
  label: string;
  url?: string;
  lastRefreshed: string;
}

export interface DenialPattern {
  cptCode: string;
  procedureName: string;
  category: string;
  specialty: string;
  tier: number;
  avgBilledAmount?: number;
  avgAllowedAmount?: number;
  avgCostToAppeal?: number;
  avgDaysToResolution?: number;
  nationalDenialRate: number;
  nationalOverturnRate: number;
  priorAuthRequired: boolean;
  topDenialReasons: DenialReason[];
  payerDenialRates: Record<string, number>;
  criticalDocumentationGaps?: string[];
  insiderTips?: string[];
  seasonalPatterns?: string;
  regulatoryLeverage?: string[];
  dataSources: DataSourceTag[];
}

export interface PayerProfile {
  id: string;
  name: string;
  type: string;
  overallDenialRate: number;
  overallOverturnRate: number;
  avgAppealTimeline: string;
  knownBehaviors: Array<{
    behavior: string;
    category: string;
    counterStrategy: string;
  }>;
}

export interface StateProfile {
  stateCode: string;
  stateName: string;
  internalAppealDeadline: { commercial: number; medicareAdvantage: number; medicaid: number };
  externalReviewDeadline: number;
  promptPaymentDeadline: number;
  penaltyInterestRate: number;
  mentalHealthParityLevel: 'strong' | 'moderate' | 'weak';
  keyRegulations: string[];
}

export type AccessTier = 'free' | 'pro' | 'enterprise';

export interface AnalysisResult {
  cptCode: string;
  procedureName: string;
  winProbability: number;
  denialRate: number;
  topDenialReason: string;
  appealTip: string;
  tier: AccessTier;
  payerSpecific?: {
    payerName: string;
    payerDenialRate: number;
    counterStrategy?: string;
  };
  stateSpecific?: {
    state: string;
    appealDeadline: number;
    keyRegulation: string;
  };
  dataSources: DataSourceTag[];
  cta: string;
}
