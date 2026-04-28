# Prompt: Shielded Agent Wallet

Use this prompt with the master system prompt in CLAUDE.md.

---

Build a shielded wallet system so an autonomous AI agent can hold, receive, and send tokens privately on Midnight Network.

**Requirements:**
- Compact contract that gives an AI agent a private (shielded) balance of NIGHT or a custom token
- The agent can: receive shielded tokens, send shielded tokens to another address, prove it has a minimum balance via ZK circuit without revealing the exact amount
- Privacy by default — minimize public state
- Include nullifier handling to prevent double-spending
- Provide:
  - Complete Compact contract (pragma >= 0.22.0)
  - TypeScript code using `@midnight-ntwrk/midnight-js` to interact from a Node.js agent

**Explain clearly:**
- What is private vs public in this design
- How the agent uses this wallet headlessly (no browser, no user interaction)
- Security and privacy guarantees

Make the code production-ready, well commented, and easy for an AI developer to understand and extend.
