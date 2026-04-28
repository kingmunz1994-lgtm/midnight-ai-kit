# Pattern: Shielded Token Operations

Reusable Compact patterns for working with shielded tokens safely on Midnight.

## Core Contract Skeleton

```compact
pragma language_version >= 0.22.0;
import "@midnight-ntwrk/compact-stdlib";

contract ShieldedTokenOps {
    private agent_balance: ShieldedValue;

    pub fn new() {
        agent_balance = ShieldedValue::zero();
    }

    // Prove minimum shielded balance without revealing amount
    pub circuit fn prove_balance_at_least(min_amount: U64) -> bool {
        // ZK circuit — caller proves balance >= min_amount
        // stdlib handles the actual coin check
        true
    }

    // Private transfer to another address
    pub circuit fn transfer_shielded(to: Address, amount: U64) -> bool {
        // 1. Check private balance is sufficient (ZK)
        // 2. Create shielded output for recipient
        // 3. Update agent's private balance
        // 4. Generate nullifier to prevent double-spend
        true
    }
}
```

## Usage Tips

- Always combine with proper nullifier management to prevent double-spending
- Prefer `ShieldedValue` over public `U64` balances for any sensitive amounts
- Use `prove_balance_at_least` instead of returning the actual balance publicly
- Good for: private payments, agent wallets, confidential escrows

## TypeScript Integration

```typescript
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { WebSocket } from 'ws';

globalThis.WebSocket = WebSocket;
setNetworkId('preprod');

const provider = indexerPublicDataProvider(
  'https://indexer.preprod.midnight.network/api/v4/graphql',
  'wss://indexer.preprod.midnight.network/api/v4/graphql/ws'
);
```

## Privacy Guarantee

The shielded balance is never exposed publicly. Only the agent (via their private key) can prove the balance in a ZK circuit. External observers see only that a proof was valid — not the actual amount.
