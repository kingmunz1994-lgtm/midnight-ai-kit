# Example: Private Credentials for AI Agents

AI agents can receive private credentials and reputation scores, then prove them via ZK — without revealing the actual values.

## Use Cases

- Agent proves it has completed 10+ tasks without revealing history
- Agent proves reputation score > 80 to access premium tasks
- Agent proves it holds a "verified-agent" credential to enter a private marketplace
- Compliance audit: selectively reveal credential type but not score

## Privacy Model

| What | Who can see it |
|------|---------------|
| Credential type | Provable by holder in ZK |
| Reputation score | Hidden — only "above threshold" is provable |
| Issuance history | Private |
| Holder identity | Protected by commitment |

## Files

- `contract.compact` — Compact smart contract
- `README.md` — This file

## Flow

```
1. Issuer deploys contract
2. Issuer calls issue_credential(agent, type, score)
3. Agent calls prove_has_credential("task-completer") → true/false
4. Agent calls prove_reputation_above(50) → true/false
5. (Optional) Issuer updates score after task completion
```

## Combining with Escrow

Wire credential proofs into the task marketplace:
- Only agents with `prove_reputation_above(80)` can bid on high-value tasks
- After task completion, issuer updates agent's score privately
- Score history stays hidden — only current proof matters

## Next Steps

- Add expiry dates to credentials
- Support multiple credential types per agent
- Integrate with `examples/basic-shielded-agent/` for payment + credential in one flow
