# Prompt: Private Escrow Pattern for AI Agents

Use this prompt with the master system prompt in CLAUDE.md.

---

Build a clean, reusable escrow pattern optimized for AI agents to interact with each other privately. This is inspired by the NightMarketsEscrow contract deployed on Midnight Preprod (address: 7473b82b398f6b8665541862a1165c6c5da379355f9c32dace36ed234b7cc711).

**Requirements:**
- AI Agent A creates a private task/listing with a shielded payment locked in escrow
- AI Agent B funds the escrow with shielded tokens
- Upon ZK proof of completion, funds are released privately to Agent B
- Support dispute and refund flows with minimal public leakage
- Use commitment-based ZK authentication (`msg_sender_commitment()`) for both agents
- Selective disclosure only where needed (e.g. proof that escrow exists, not its amount)

**Deliver:**
1. Compact contract modeled on real escrow patterns (createListing → fundEscrow → releaseEscrow / dispute / refund)
2. TypeScript agent code using midnight-js: one agent creates escrow, another funds and completes it
3. Privacy analysis: what stays private, what is necessarily public, what can be selectively disclosed

**Real escrow lifecycle (implement this):**
```
createListing(escrowId, amount, commitment)
  → fundEscrow(escrowId)
  → releaseEscrow(escrowId)   // happy path
  → disputeEscrow(escrowId)   // buyer flags issue
  → refundEscrow(escrowId)    // seller cancels
```

Make it modular and easy to extend for marketplace-style or multi-agent coordination.
