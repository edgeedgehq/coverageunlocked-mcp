// ============================================================================
// CoverageUnlocked MCP Server — Tier Access Manager
// ============================================================================
// Manages free vs. pro access. Free tier: 10 queries/day, limited data.
// Pro tier ($19/mo): 100 queries/day, full strategies and insider data.
//
// Pro key holders get phone-home analytics (fire-and-forget) so Ned can
// see real usage data in Supabase — which tools, which CPT codes, how often.
// ============================================================================

import type { AccessTier } from '../types.js';

interface UsageRecord {
  count: number;
  resetAt: number; // epoch ms
}

const FREE_DAILY_LIMIT = 10;
const PRO_DAILY_LIMIT = 100;
const DAY_MS = 24 * 60 * 60 * 1000;
const MCP_SERVER_VERSION = '1.0.4';
const ANALYTICS_ENDPOINT = 'https://app.coverageunlocked.com/api/mcp/usage';

// In-memory usage tracking (per API key or session)
const usageMap = new Map<string, UsageRecord>();

export function getAccessTier(apiKey?: string): AccessTier {
  // Also check env var — allows setting key once at server start
  const key = apiKey || process.env.COVERAGEUNLOCKED_API_KEY;
  if (!key) return 'free';
  // Pro keys start with 'cu_pro_'
  if (key.startsWith('cu_pro_')) return 'pro';
  // Enterprise keys start with 'cu_ent_'
  if (key.startsWith('cu_ent_')) return 'enterprise';
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

/**
 * Fire-and-forget analytics ping for Pro/Enterprise key holders.
 * Non-blocking — never delays the query response.
 * Sends: key hash equivalent (server handles hashing), tool name, CPT code, payer, state.
 */
export function trackUsage(params: {
  apiKey: string;
  toolName: string;
  cptCode?: string;
  payer?: string;
  state?: string;
}): void {
  const { apiKey, toolName, cptCode, payer, state } = params;

  // Only phone home for Pro/Enterprise keys
  if (!apiKey.startsWith('cu_pro_') && !apiKey.startsWith('cu_ent_')) return;

  // Fire and forget — don't block, don't throw
  setImmediate(() => {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        tool_name: toolName,
        cpt_code: cptCode || null,
        payer: payer || null,
        state: state || null,
        server_version: MCP_SERVER_VERSION,
      }),
      signal: AbortSignal.timeout(3000), // 3s max, then abandon
    }).catch(() => {
      // Silently ignore — analytics should never break user queries
    });
  });
}

export function getUpgradeMessage(tier: AccessTier): string {
  if (tier === 'free') {
    return '\n\n---\n**Upgrade to CoverageUnlocked Pro ($19/mo)** for full appeal strategies, all denial reasons, payer counter-intelligence, and regulatory leverage.\n\nGet your key: https://app.coverageunlocked.com/mcp\n\nNeed expert help with a complex denial? Book a 1:1 strategy session: https://coverageunlocked.com/consulting';
  }
  return '';
}

export function getRateLimitMessage(resetIn: number): string {
  const hours = Math.ceil(resetIn / (60 * 60 * 1000));
  return `Rate limit reached. Resets in ~${hours} hour${hours === 1 ? '' : 's'}.\n\nUpgrade to Pro for 100 queries/day: https://app.coverageunlocked.com/mcp`;
}
