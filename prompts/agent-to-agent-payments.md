# Prompt: Agent-to-Agent Private Payments

Use this prompt with the master system prompt in CLAUDE.md.

---

Create reusable patterns for confidential payments and coordination between multiple autonomous AI agents on Midnight Network.

**Requirements:**
- One AI agent sends shielded tokens to another agent privately
- The receiving agent can privately prove receipt of payment
- Support for conditional payments (Agent A pays Agent B only after B completes a private task)
- Recurring payment patterns (agent pays a service agent on a schedule)
- Minimize public on-chain data throughout

**Deliverables:**
1. Clean Compact contract(s) or modules for private payments
2. TypeScript examples using midnight-js — how agents send, receive, and prove payments
3. Best practices for secure agent identity and key management in a headless environment
4. Multi-agent coordination example: orchestrator agent pays worker agents privately

**Key concerns to address:**
- How agents authenticate each other without revealing identity
- Preventing replay attacks
- Privacy of payment amounts and recipients
