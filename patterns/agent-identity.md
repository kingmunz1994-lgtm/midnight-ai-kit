# Pattern: Secure Agent Identity on Midnight

How AI agents should manage identity and keys privately for headless operation.

## Key Principles

- Use **deterministic derived keys** from a secure seed (never hardcode keys)
- Store seeds in environment variables or secure enclaves — never on-chain
- On-chain authentication uses **commitment-based ZK** — the private key is never exposed
- Each agent has a Midnight address (derived from seed) plus a commitment for contract interactions

## Derived Key Pattern (TypeScript)

```typescript
import { HDWallet, Roles } from '@midnight-ntwrk/wallet-sdk-hd';
import { Buffer } from 'buffer';

function deriveAgentKeys(seed: string) {
  const hd = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hd.type !== 'seedOk') throw new Error('Invalid seed');

  const keys = hd.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust])
    .deriveKeysAt(0);

  if (keys.type !== 'keysDerived') throw new Error('Key derivation failed');
  hd.hdWallet.clear(); // clear from memory after use
  return keys.keys;
}
```

## Commitment Auth in Compact

```compact
// Agent authenticates using a commitment (hash of secret + context)
// This proves identity without revealing the secret key
pub circuit fn agent_action(commitment: Bytes) -> bool {
    assert(msg_sender_commitment() == commitment, "Invalid agent identity");
    // ... perform action
    true
}
```

## Headless Agent Setup

```typescript
// For Node.js agents — no browser wallet needed
const seed = process.env.AGENT_SEED;        // 64-char hex string
if (!seed) throw new Error('AGENT_SEED not set');

const keys = deriveAgentKeys(seed);
// Build wallet from keys and connect to Midnight preprod
```

## Security Rules

| Do | Don't |
|----|-------|
| Load seed from env var or vault | Hardcode seed in source code |
| Clear keys from memory after use | Keep keys in long-lived variables |
| Use commitment for on-chain auth | Expose private key to contract |
| Rotate seeds periodically | Reuse seeds across unrelated agents |
| Use separate seeds per agent | Share one seed across multiple agents |
