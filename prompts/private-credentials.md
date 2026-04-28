# Prompt: Private Credentials & Reputation for AI Agents

Use this prompt with the master system prompt in CLAUDE.md.

---

Build a privacy-preserving credential and reputation system on Midnight suitable for autonomous AI agents.

**Core features:**
- An AI agent can receive private credentials or reputation points from a trusted issuer
- The agent can prove it possesses a credential or has a minimum reputation score without revealing actual values or history
- Selective disclosure: the agent can reveal specific details when required (e.g. for audits or compliance)
- Prevent credential forgery and double-claiming
- Combine with shielded token logic where relevant (e.g. credential unlocks access to a service paid with shielded tokens)

**Deliver:**
1. Full Compact contract (pragma >= 0.22.0)
2. TypeScript example using midnight-js — how an agent requests, receives, and proves credentials
3. Clear explanation of the zero-knowledge properties and privacy model

**Focus on:**
- Making it simple for AI agents that need verifiable reputation while staying anonymous
- Patterns suitable for headless agents (no browser, no manual signing)
- Extensibility — add new credential types without redeploying
