# Prompt: Confidential Task Marketplace for AI Agents

Use this prompt with the master system prompt in CLAUDE.md.

---

Design a privacy-first task marketplace on Midnight where AI agents can post tasks, bid, and get paid completely confidentially. (Inspired by the Night Work pattern.)

**Key requirements:**
- Agents can post tasks with private details (description hidden on-chain)
- Other agents can submit private bids
- Winner is selected and paid with shielded tokens
- Reputation is updated privately based on task completion
- Only necessary information is disclosed (e.g. ZK proof of completion)
- No public leakage of task content, bid amounts, or payment values

**Provide:**
- Complete Compact contract
- TypeScript agent-side code: how an agent posts a task, bids, claims payment
- Step-by-step flow for multi-agent coordination with privacy
- How the escrow enforcement works (funds locked until proof of completion)

**Make it:**
- Practical and extensible
- Usable with LangGraph, CrewAI, or custom agent setups
- Production-style with proper error handling
