// ============================================================================
// CoverageUnlocked MCP Server — Tier Access Manager
// ============================================================================
// Manages free vs. pro access. Free tier: 10 queries/day, limited data.
// Pro tier ($19/mo): 100 queries/day, full strategies and insider data.
// ============================================================================

import type { AccessTier } from '../types.js';

interface UsageRecord {
  count: number;
  resetAt: number; // epoch ms
}

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

// In-memory usage tracking (per API key or session)
const usageMap = new Map<string, UsageRecord>();

export function getAccessTier(apiKey?: string): AccessTier {
  if (!apiKey) return 'free';
  // Pro keys start with 'cu_pro_'
  if (apiKey.startsWith('cu_pro_')) return 'pro';
  // Enterprise keys start with 'cu_ent_'
  if (apiKey.startsWith('cu_ent_')) return 'enterprise';
  return 'free';
}

export function checkRateLimit(identifier: string, tier: AccessTier): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const limit = tier === 'free' ? FREE_DAILY_LIMIT : PRO_DAILY_LIMIT;

  let record = usageMap.get(identifier);
  if (!record || now >= record.resetAt) {
    record = { count: 0, resetAt: now + DAY_MS };
    usageMap.set(identifier, record);
  }

  const remaining = Math.max(0, limit - record.count);
  const resetIn = Math.max(0, record.resetAt - now);

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn };
  }

  record.count++;
  return { allowed: true, remaining: remaining - 1, resetIn };
}

export function getUpgradeMessage(tier: AccessTier): string {
  if (tier === 'free') {
    return '\n\n---\nGet full appeal strategies, payer counter-intelligence, regulatory citations, and insider tips with CoverageUnlocked Pro ($19/mo). Sign up: https://app.coverageunlocked.com/pricing\n\nNeed expert help with a complex denial? Book a 1:1 strategy session with a 20-year industry insider: https://coverageunlocked.com/consulting';
  }
  return '';
}

export function getRateLimitMessage(resetIn: number): string {
  const hours = Math.ceil(resetIn / (60 * 60 * 1000));
  return `Rate limit reached. Resets in ~${hours} hour${hours === 1 ? '' : 's'}. Upgrade to Pro for 100 queries/day: https://app.coverageunlocked.com/pricing`;
}
