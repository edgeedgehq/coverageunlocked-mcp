# CoverageUnlocked MCP Server

**Insurance denial appeal intelligence powered by 20 years of insider knowledge.**

Get win probabilities, appeal strategies, payer behavioral intelligence, and regulatory leverage for any CPT code — directly inside your AI assistant.

## What Questions Does This Answer?

- "What are my chances of winning an insurance denial appeal?"
- "How do I appeal a denied claim for [procedure] with [payer]?"
- "What's the denial rate for [CPT code] with [insurance company]?"
- "What should I include in my appeal letter?"
- "What are the appeal deadlines in my state?"

## Coverage

- **489+ CPT codes** across 9 procedure categories (surgical, E&M, imaging, infusion/chemo, rehab, mental health, diagnostic, DME, lab/pathology)
- **7 major payers** with behavioral profiles (UnitedHealthcare, Anthem, Aetna, Cigna, Humana, BCBS, TRICARE)
- **15 state regulatory profiles** with appeal deadlines, prompt payment laws, and parity enforcement
- **Category-level fallback** for any CPT code not in the detailed database

## Tools

| Tool | Tier | What It Does |
|------|------|-------------|
| `analyze_denial` | Free | Win probability + top denial reason + insider tip for any CPT code |
| `check_denial_risk` | Free | Pre-submission risk assessment — check before you submit a claim |
| `get_appeal_strategy` | Pro | Full appeal strategy with all denial reasons, counter-arguments, regulatory citations |
| `get_payer_intelligence` | Pro | Payer behavioral profiles — known tactics and how to counter them |
| `get_regulatory_leverage` | Pro | State-specific appeal deadlines, prompt payment laws, external review options |

## Quick Start

### Install via npx (no setup required)

```bash
npx @coverageunlocked/mcp-server
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "coverageunlocked": {
      "command": "npx",
      "args": ["-y", "@coverageunlocked/mcp-server"]
    }
  }
}
```

### Cursor / Windsurf

Add to your MCP settings:

```json
{
  "coverageunlocked": {
    "command": "npx",
    "args": ["-y", "@coverageunlocked/mcp-server"]
  }
}
```

## Pricing

**Free Tier** — No API key required
- 10 queries per day
- Win probability and top denial reason
- One insider tip per query
- Basic state regulatory deadlines

**Pro ($19/month)** — [Sign up](https://app.coverageunlocked.com/pricing)
- 100 queries per day
- Full appeal strategies with all denial reasons
- Payer behavioral intelligence and counter-strategies
- Complete regulatory leverage with specific citations
- Documentation checklists
- All insider tips from 20 years inside the industry

**Enterprise** — [Contact us](mailto:ned@coverageunlocked.com)
- Unlimited queries
- Batch processing
- Custom payer profiles
- Integration support
- API access to full 489-code database

## Example

Ask your AI assistant:

> "What are the chances of winning an appeal for CPT 90837 (psychotherapy, 60 min) denied by UnitedHealthcare in California?"

The MCP server returns:
- **Win Probability: 66%**
- **Denial Rate: 28%** (highest of all Tier 1 codes — mental health is the most denied category)
- **Top Denial Reason:** Concurrent review lapse (35% of denials, 70% appeal success)
- **Insider Tip:** Visit limit denials have 72% overturn rate because of the Mental Health Parity Act — ALWAYS appeal these
- **CA Regulatory Leverage:** DMHC Independent Medical Review (strongest external review in nation), SB 855 mental health parity

## About CoverageUnlocked

Built by Ned Lutz after 20 years inside the health insurance industry. CoverageUnlocked exists to close the knowledge gap between insurance companies and the people fighting denials.

- **Website:** [coverageunlocked.com](https://coverageunlocked.com)
- **App:** [app.coverageunlocked.com](https://app.coverageunlocked.com)
- **Consulting:** [Book a session](https://coverageunlocked.com/consulting) ($497)
- **Newsletter:** [Denial Dispatch](https://coverageunlocked.beehiiv.com)

## License

MIT
