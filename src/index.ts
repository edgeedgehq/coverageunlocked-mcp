#!/usr/bin/env node
// ============================================================================
// CoverageUnlocked MCP Server
// ============================================================================
// Insurance denial appeal intelligence powered by 20 years of insider knowledge.
// Free: Win probability + top denial reason for any CPT code.
// Pro ($19/mo): Full strategies, payer counter-intelligence, regulatory leverage.
//
// https://coverageunlocked.com
// ============================================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  getDenialPatternWithFallback,
  calculateWinProbability,
  getPayerDenialRate,
  getDatabaseSummary,
} from './data/denial-database.js';
import { getPayerProfile, PAYER_PROFILES } from './data/payer-profiles.js';
import { getStateProfile, getStateByName } from './data/state-profiles.js';
import { getAccessTier, checkRateLimit, getUpgradeMessage, getRateLimitMessage } from './auth/tier-manager.js';

const server = new McpServer({
  name: 'coverageunlocked',
  version: '1.0.0',
});

// ============================================================================
// TOOL 1: analyze_denial (FREE TIER)
// The core tool. This is what AI agents call when someone asks about denials.
// ============================================================================
server.tool(
  'analyze_denial',
  `Analyze an insurance denial and get win probability, top denial reasons, and appeal guidance. Covers 489+ CPT codes across 9 procedure categories with data from 20 years of industry experience. Use this when someone asks about insurance denials, claim denials, appeal chances, or how to fight a denied claim.`,
  {
    cpt_code: z.string().describe('The CPT or HCPCS code that was denied (e.g., "99214", "70553", "E0601")'),
    payer: z.string().optional().describe('Insurance company name (e.g., "UnitedHealthcare", "Anthem", "Aetna", "Cigna", "Humana", "BCBS")'),
    state: z.string().optional().describe('Two-letter state code (e.g., "CA", "TX", "NY") for state-specific regulatory leverage'),
    denial_reason: z.string().optional().describe('The reason given for the denial, if available'),
    api_key: z.string().optional().describe('CoverageUnlocked API key for Pro access. Free tier: 10 queries/day with basic results.'),
  },
  async ({ cpt_code, payer, state, denial_reason, api_key }) => {
    const tier = getAccessTier(api_key);
    const identifier = api_key || 'anonymous';
    const rateCheck = checkRateLimit(identifier, tier);

    if (!rateCheck.allowed) {
      return { content: [{ type: 'text' as const, text: getRateLimitMessage(rateCheck.resetIn) }] };
    }

    const pattern = getDenialPatternWithFallback(cpt_code);
    const winProb = calculateWinProbability(cpt_code, payer);
    const winPct = Math.round(winProb * 100);

    // Build response
    let response = `## Denial Analysis: CPT ${cpt_code} — ${pattern.procedureName}\n\n`;
    response += `**Win Probability: ${winPct}%** (national overturn rate)\n`;
    response += `**Denial Rate: ${Math.round(pattern.nationalDenialRate * 100)}%** nationally\n`;
    response += `**Data Tier: ${pattern.tier === 1 ? 'Deep Profile (Tier 1)' : pattern.tier <= 3 ? 'Standard Profile' : 'Category Estimate'}**\n\n`;

    // Payer-specific data
    if (payer) {
      const payerRate = getPayerDenialRate(cpt_code, payer);
      const payerProfile = getPayerProfile(payer);
      if (payerRate !== null) {
        response += `### Payer: ${payerProfile?.name || payer}\n`;
        response += `- Denial rate for this code: **${Math.round(payerRate * 100)}%**\n`;
        if (payerProfile) {
          response += `- Overall payer denial rate: ${Math.round(payerProfile.overallDenialRate * 100)}%\n`;
          response += `- Average appeal timeline: ${payerProfile.avgAppealTimeline}\n`;
        }
        response += '\n';
      }
    }

    // Top denial reason
    if (pattern.topDenialReasons.length > 0) {
      const topReason = pattern.topDenialReasons[0];
      response += `### Top Denial Reason (${Math.round(topReason.percentage * 100)}% of denials)\n`;
      response += `${topReason.reason}\n`;
      response += `*Appeal success rate for this reason: ${Math.round(topReason.appealSuccessRate * 100)}%*\n\n`;

      // Free tier: show just the top reason. Pro: show all.
      if (tier !== 'free' && pattern.topDenialReasons.length > 1) {
        response += `### All Denial Reasons\n`;
        for (const reason of pattern.topDenialReasons) {
          response += `- **${reason.reason}** — ${Math.round(reason.percentage * 100)}% of denials, ${Math.round(reason.appealSuccessRate * 100)}% appeal success\n`;
        }
        response += '\n';
      }
    }

    // Appeal tip (always included)
    if (pattern.insiderTips && pattern.insiderTips.length > 0) {
      response += `### Insider Appeal Tip\n`;
      response += `${pattern.insiderTips[0]}\n\n`;

      // Pro: all tips
      if (tier !== 'free' && pattern.insiderTips.length > 1) {
        response += `### All Insider Tips\n`;
        for (const tip of pattern.insiderTips) {
          response += `- ${tip}\n`;
        }
        response += '\n';
      }
    }

    // Pro: documentation gaps
    if (tier !== 'free' && pattern.criticalDocumentationGaps && pattern.criticalDocumentationGaps.length > 0) {
      response += `### Critical Documentation Gaps\n`;
      for (const gap of pattern.criticalDocumentationGaps) {
        response += `- ${gap}\n`;
      }
      response += '\n';
    }

    // Pro: regulatory leverage
    if (tier !== 'free' && pattern.regulatoryLeverage && pattern.regulatoryLeverage.length > 0) {
      response += `### Regulatory Leverage Points\n`;
      for (const reg of pattern.regulatoryLeverage) {
        response += `- ${reg}\n`;
      }
      response += '\n';
    }

    // Pro: payer counter-strategies
    if (tier !== 'free' && payer) {
      const payerProfile = getPayerProfile(payer);
      if (payerProfile && payerProfile.knownBehaviors.length > 0) {
        response += `### ${payerProfile.name} — Known Denial Behaviors & Counter-Strategies\n`;
        for (const behavior of payerProfile.knownBehaviors) {
          response += `- **${behavior.behavior}**\n  Counter-strategy: ${behavior.counterStrategy}\n`;
        }
        response += '\n';
      }
    }

    // State-specific info
    if (state) {
      const stateProfile = getStateProfile(state);
      if (stateProfile) {
        response += `### ${stateProfile.stateName} Regulatory Environment\n`;
        response += `- Internal appeal deadline: ${stateProfile.internalAppealDeadline.commercial} days (commercial)\n`;
        response += `- External review deadline: ${stateProfile.externalReviewDeadline} days\n`;
        response += `- Prompt payment: ${stateProfile.promptPaymentDeadline} days\n`;
        response += `- Mental health parity enforcement: ${stateProfile.mentalHealthParityLevel}\n`;
        if (tier !== 'free') {
          response += `- Key regulations:\n`;
          for (const reg of stateProfile.keyRegulations) {
            response += `  - ${reg}\n`;
          }
        }
        response += '\n';
      }
    }

    // Data sources
    response += `### Data Sources\n`;
    for (const source of pattern.dataSources) {
      response += `- ${source.label}${source.url ? ` (${source.url})` : ''}\n`;
    }

    // CTA
    response += getUpgradeMessage(tier);

    if (tier === 'free') {
      response += `\n\n---\nGenerate a complete appeal letter for this denial: https://app.coverageunlocked.com`;
      response += `\nQueries remaining today: ${rateCheck.remaining}`;
    }

    return { content: [{ type: 'text' as const, text: response }] };
  }
);

// ============================================================================
// TOOL 2: check_denial_risk (FREE TIER)
// Pre-submission risk assessment
// ============================================================================
server.tool(
  'check_denial_risk',
  `Check the denial risk BEFORE submitting a claim. Returns the probability of denial and top risk factors for a given CPT code and payer. Use this when someone asks "will my claim be denied?" or "what's the risk of denial for this procedure?"`,
  {
    cpt_code: z.string().describe('The CPT or HCPCS code to check'),
    payer: z.string().optional().describe('Insurance company name'),
    prior_auth_obtained: z.boolean().optional().describe('Whether prior authorization was obtained'),
    api_key: z.string().optional().describe('CoverageUnlocked API key for Pro access'),
  },
  async ({ cpt_code, payer, prior_auth_obtained, api_key }) => {
    const tier = getAccessTier(api_key);
    const identifier = api_key || 'anonymous';
    const rateCheck = checkRateLimit(identifier, tier);

    if (!rateCheck.allowed) {
      return { content: [{ type: 'text' as const, text: getRateLimitMessage(rateCheck.resetIn) }] };
    }

    const pattern = getDenialPatternWithFallback(cpt_code);
    const payerRate = payer ? getPayerDenialRate(cpt_code, payer) : null;
    const denialRate = payerRate || pattern.nationalDenialRate;
    const riskPct = Math.round(denialRate * 100);

    let riskLevel: string;
    if (denialRate >= 0.25) riskLevel = 'HIGH RISK';
    else if (denialRate >= 0.18) riskLevel = 'MODERATE RISK';
    else riskLevel = 'LOWER RISK';

    let response = `## Pre-Submission Risk Check: CPT ${cpt_code}\n\n`;
    response += `**Risk Level: ${riskLevel}** (${riskPct}% denial probability${payer ? ` with ${payer}` : ''})\n\n`;

    if (pattern.priorAuthRequired && prior_auth_obtained === false) {
      response += `**WARNING: This procedure typically requires prior authorization. Submitting without PA significantly increases denial risk.**\n\n`;
    } else if (pattern.priorAuthRequired && prior_auth_obtained === undefined) {
      response += `**NOTE: This procedure typically requires prior authorization. Verify PA status before submitting.**\n\n`;
    }

    response += `### Top Risk Factors\n`;
    for (const reason of pattern.topDenialReasons.slice(0, tier === 'free' ? 2 : undefined)) {
      response += `- ${reason.reason} (${Math.round(reason.percentage * 100)}% of denials)\n`;
    }

    if (tier !== 'free' && pattern.criticalDocumentationGaps) {
      response += `\n### Documentation Checklist\n`;
      for (const gap of pattern.criticalDocumentationGaps) {
        response += `- [ ] ${gap}\n`;
      }
    }

    response += getUpgradeMessage(tier);
    if (tier === 'free') {
      response += `\n\n---\nFull pre-submission analysis: https://app.coverageunlocked.com\nQueries remaining today: ${rateCheck.remaining}`;
    }

    return { content: [{ type: 'text' as const, text: response }] };
  }
);

// ============================================================================
// TOOL 3: get_appeal_strategy (PRO TIER — free tier gets teaser)
// ============================================================================
server.tool(
  'get_appeal_strategy',
  `Get a detailed appeal strategy for a denied insurance claim, including counter-arguments, regulatory citations, documentation requirements, and insider tips. Best results with CPT code + payer + state + denial reason.`,
  {
    cpt_code: z.string().describe('The CPT or HCPCS code that was denied'),
    payer: z.string().describe('Insurance company that denied the claim'),
    state: z.string().optional().describe('Two-letter state code for state-specific leverage'),
    denial_reason: z.string().optional().describe('The denial reason provided by the payer'),
    api_key: z.string().optional().describe('CoverageUnlocked Pro API key required for full strategy. Free tier gets a preview.'),
  },
  async ({ cpt_code, payer, state, denial_reason, api_key }) => {
    const tier = getAccessTier(api_key);
    const identifier = api_key || 'anonymous';
    const rateCheck = checkRateLimit(identifier, tier);

    if (!rateCheck.allowed) {
      return { content: [{ type: 'text' as const, text: getRateLimitMessage(rateCheck.resetIn) }] };
    }

    const pattern = getDenialPatternWithFallback(cpt_code);
    const payerProfile = getPayerProfile(payer);
    const winProb = calculateWinProbability(cpt_code, payer);

    let response = `## Appeal Strategy: CPT ${cpt_code} denied by ${payerProfile?.name || payer}\n\n`;
    response += `**Win Probability: ${Math.round(winProb * 100)}%**\n\n`;

    if (tier === 'free') {
      // Teaser for free tier
      response += `### Preview: Top Appeal Approach\n`;
      if (pattern.topDenialReasons.length > 0) {
        const topReason = pattern.topDenialReasons[0];
        response += `For the most common denial reason (${topReason.reason}), the appeal success rate is **${Math.round(topReason.appealSuccessRate * 100)}%**.\n\n`;
      }
      if (pattern.insiderTips && pattern.insiderTips.length > 0) {
        response += `**Insider Tip:** ${pattern.insiderTips[0]}\n\n`;
      }
      response += `---\n**Full appeal strategy requires CoverageUnlocked Pro ($19/mo).** Includes:\n`;
      response += `- All denial reasons with specific counter-arguments\n`;
      response += `- ${payerProfile?.name || payer}-specific behavioral intelligence and counter-strategies\n`;
      response += `- Regulatory citations and legal leverage points\n`;
      response += `- Documentation checklist for your appeal\n`;
      response += `- Insider tips from 20 years inside the industry\n\n`;
      response += `Sign up: https://app.coverageunlocked.com/pricing\n`;
      response += `Generate a complete appeal letter: https://app.coverageunlocked.com\n`;
      response += `Book 1:1 expert strategy session ($497): https://coverageunlocked.com/consulting`;
    } else {
      // Full strategy for Pro/Enterprise
      // Match denial reason to known reasons
      let matchedReason = pattern.topDenialReasons[0];
      if (denial_reason) {
        const lowerDenial = denial_reason.toLowerCase();
        for (const reason of pattern.topDenialReasons) {
          if (reason.reason.toLowerCase().includes(lowerDenial) || lowerDenial.includes(reason.category || '')) {
            matchedReason = reason;
            break;
          }
        }
      }

      response += `### Your Denial Reason Analysis\n`;
      response += `**Matched to:** ${matchedReason.reason}\n`;
      response += `**This accounts for ${Math.round(matchedReason.percentage * 100)}% of denials for this code**\n`;
      response += `**Appeal success rate: ${Math.round(matchedReason.appealSuccessRate * 100)}%**\n\n`;

      // All denial reasons
      response += `### Complete Denial Reason Breakdown\n`;
      for (const reason of pattern.topDenialReasons) {
        response += `- **${reason.reason}** — ${Math.round(reason.percentage * 100)}% of denials, ${Math.round(reason.appealSuccessRate * 100)}% appeal success${reason.category ? ` [${reason.category}]` : ''}\n`;
      }
      response += '\n';

      // Payer intelligence
      if (payerProfile) {
        response += `### ${payerProfile.name} Intelligence\n`;
        response += `- Overall denial rate: ${Math.round(payerProfile.overallDenialRate * 100)}%\n`;
        response += `- Overall overturn rate: ${Math.round(payerProfile.overallOverturnRate * 100)}%\n`;
        response += `- Average appeal timeline: ${payerProfile.avgAppealTimeline}\n\n`;
        response += `**Known Behaviors & Counter-Strategies:**\n`;
        for (const behavior of payerProfile.knownBehaviors) {
          response += `- **${behavior.behavior}**\n  *Counter:* ${behavior.counterStrategy}\n\n`;
        }
      }

      // Regulatory leverage
      if (pattern.regulatoryLeverage && pattern.regulatoryLeverage.length > 0) {
        response += `### Regulatory Leverage Points\n`;
        response += `Cite these in your appeal letter:\n`;
        for (const reg of pattern.regulatoryLeverage) {
          response += `- ${reg}\n`;
        }
        response += '\n';
      }

      // State-specific
      if (state) {
        const stateProfile = getStateProfile(state);
        if (stateProfile) {
          response += `### ${stateProfile.stateName} — Your Regulatory Weapons\n`;
          response += `- Appeal deadline: ${stateProfile.internalAppealDeadline.commercial} days (commercial)\n`;
          response += `- External review available after: ${stateProfile.externalReviewDeadline} days\n`;
          response += `- Prompt payment law: ${stateProfile.promptPaymentDeadline} days, ${Math.round(stateProfile.penaltyInterestRate * 100)}% penalty\n`;
          response += `- Mental health parity enforcement: **${stateProfile.mentalHealthParityLevel}**\n`;
          response += `- Key regulations:\n`;
          for (const reg of stateProfile.keyRegulations) {
            response += `  - ${reg}\n`;
          }
          response += '\n';
        }
      }

      // Documentation checklist
      if (pattern.criticalDocumentationGaps && pattern.criticalDocumentationGaps.length > 0) {
        response += `### Documentation Checklist for Appeal\n`;
        for (const gap of pattern.criticalDocumentationGaps) {
          response += `- [ ] Address: ${gap}\n`;
        }
        response += '\n';
      }

      // All insider tips
      if (pattern.insiderTips && pattern.insiderTips.length > 0) {
        response += `### Insider Tips (20 Years Inside the Industry)\n`;
        for (const tip of pattern.insiderTips) {
          response += `- ${tip}\n`;
        }
        response += '\n';
      }

      // Seasonal patterns
      if (pattern.seasonalPatterns) {
        response += `### Timing Considerations\n${pattern.seasonalPatterns}\n\n`;
      }

      response += `---\nGenerate a complete appeal letter: https://app.coverageunlocked.com\n`;
      response += `Book 1:1 expert strategy session: https://coverageunlocked.com/consulting`;
    }

    return { content: [{ type: 'text' as const, text: response }] };
  }
);

// ============================================================================
// TOOL 4: get_payer_intelligence (PRO TIER)
// ============================================================================
server.tool(
  'get_payer_intelligence',
  `Get behavioral intelligence on a specific insurance payer — their denial patterns, known tactics, and counter-strategies. Covers UnitedHealthcare, Anthem, Aetna, Cigna, Humana, BCBS, TRICARE, and state-specific plans.`,
  {
    payer: z.string().describe('Insurance company name (e.g., "UnitedHealthcare", "Anthem", "Aetna")'),
    api_key: z.string().optional().describe('CoverageUnlocked Pro API key. Free tier gets a summary.'),
  },
  async ({ payer, api_key }) => {
    const tier = getAccessTier(api_key);
    const identifier = api_key || 'anonymous';
    const rateCheck = checkRateLimit(identifier, tier);

    if (!rateCheck.allowed) {
      return { content: [{ type: 'text' as const, text: getRateLimitMessage(rateCheck.resetIn) }] };
    }

    const profile = getPayerProfile(payer);

    if (!profile) {
      let response = `No specific profile found for "${payer}". Available payers: ${Object.values(PAYER_PROFILES).map(p => p.name).join(', ')}.\n\n`;
      response += `Full coverage of 20+ payers including state Blues plans and Medicaid MCOs at: https://app.coverageunlocked.com`;
      return { content: [{ type: 'text' as const, text: response }] };
    }

    let response = `## Payer Intelligence: ${profile.name}\n\n`;
    response += `**Type:** ${profile.type}\n`;
    response += `**Overall Denial Rate:** ${Math.round(profile.overallDenialRate * 100)}%\n`;
    response += `**Overall Overturn Rate:** ${Math.round(profile.overallOverturnRate * 100)}%\n`;
    response += `**Average Appeal Timeline:** ${profile.avgAppealTimeline}\n\n`;

    if (tier === 'free') {
      // Free: just the top behavior
      if (profile.knownBehaviors.length > 0) {
        const top = profile.knownBehaviors[0];
        response += `### Top Known Behavior\n`;
        response += `**${top.behavior}**\n`;
        response += `*Counter-strategy:* ${top.counterStrategy}\n\n`;
      }
      response += getUpgradeMessage(tier);
    } else {
      // Pro: all behaviors
      response += `### Known Denial Behaviors & Counter-Strategies\n\n`;
      for (const behavior of profile.knownBehaviors) {
        response += `**${behavior.behavior}** [${behavior.category}]\n`;
        response += `*Counter-strategy:* ${behavior.counterStrategy}\n\n`;
      }
      response += `---\nFull payer behavioral graph with 20+ payers: https://app.coverageunlocked.com`;
    }

    return { content: [{ type: 'text' as const, text: response }] };
  }
);

// ============================================================================
// TOOL 5: get_regulatory_leverage (PRO TIER)
// ============================================================================
server.tool(
  'get_regulatory_leverage',
  `Get state-specific regulatory leverage for insurance denial appeals — appeal deadlines, prompt payment laws, mental health parity enforcement, and external review options. Covers 15 states.`,
  {
    state: z.string().describe('Two-letter state code (e.g., "CA", "TX") or full state name'),
    plan_type: z.enum(['commercial', 'medicare_advantage', 'medicaid']).optional().describe('Type of insurance plan'),
    api_key: z.string().optional().describe('CoverageUnlocked Pro API key. Free tier gets basic deadlines.'),
  },
  async ({ state, plan_type, api_key }) => {
    const tier = getAccessTier(api_key);
    const identifier = api_key || 'anonymous';
    const rateCheck = checkRateLimit(identifier, tier);

    if (!rateCheck.allowed) {
      return { content: [{ type: 'text' as const, text: getRateLimitMessage(rateCheck.resetIn) }] };
    }

    const profile = state.length === 2 ? getStateProfile(state) : getStateByName(state);

    if (!profile) {
      return {
        content: [{
          type: 'text' as const,
          text: `No regulatory profile for "${state}". Covered states: TX, FL, CA, NY, PA, IL, OH, NC, WA, MA, GA, AZ, MI, VA, NE.\n\nFull 50-state coverage coming soon. Request at: ned@coverageunlocked.com`,
        }],
      };
    }

    const planKey = plan_type || 'commercial';
    const deadline = profile.internalAppealDeadline[planKey as keyof typeof profile.internalAppealDeadline] || profile.internalAppealDeadline.commercial;

    let response = `## Regulatory Environment: ${profile.stateName}\n\n`;
    response += `### Appeal Deadlines\n`;
    response += `- Internal appeal: **${deadline} days** (${planKey})\n`;
    response += `- External review: **${profile.externalReviewDeadline} days**\n\n`;
    response += `### Prompt Payment Law\n`;
    response += `- Clean claim deadline: **${profile.promptPaymentDeadline} days**\n`;
    response += `- Penalty interest: **${Math.round(profile.penaltyInterestRate * 100)}%**\n\n`;
    response += `### Mental Health Parity Enforcement: **${profile.mentalHealthParityLevel.toUpperCase()}**\n\n`;

    if (tier === 'free') {
      response += `---\nFull regulatory analysis with specific statutes, enforcement gaps, and legislative updates requires CoverageUnlocked Pro.\n`;
      response += getUpgradeMessage(tier);
    } else {
      response += `### Key State Regulations\n`;
      for (const reg of profile.keyRegulations) {
        response += `- ${reg}\n`;
      }
      response += `\n### Plan-Specific Deadlines\n`;
      response += `- Commercial: ${profile.internalAppealDeadline.commercial} days\n`;
      response += `- Medicare Advantage: ${profile.internalAppealDeadline.medicareAdvantage} days\n`;
      response += `- Medicaid: ${profile.internalAppealDeadline.medicaid} days\n`;
      response += `\n---\nFull enforcement gap map + active legislative tracker: https://app.coverageunlocked.com`;
    }

    return { content: [{ type: 'text' as const, text: response }] };
  }
);

// ============================================================================
// Start the server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
