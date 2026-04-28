# Pattern: Private Credential Verification

How to issue, hold, and prove private credentials using ZK on Midnight.

## Core Contract Pattern

```compact
pragma language_version >= 0.22.0;
import "@midnight-ntwrk/compact-stdlib";

contract PrivateCredentials {
    pub const issuer: Address;

    // Private credential store — only the holder can prove contents
    private credentials: Map<Address, CredentialRecord>;

    struct CredentialRecord {
        credential_type: Bytes,
        score: U32,
        issued_at: U64,
        commitment: Bytes
    }

    pub fn new(issuer_address: Address) {
        issuer = issuer_address;
    }

    // Issuer grants a credential to an agent (private)
    pub circuit fn issue_credential(
        to: Address,
        credential_type: Bytes,
        score: U32,
        commitment: Bytes
    ) -> bool {
        assert(msg_sender_commitment() == commitment, "Not authorized issuer");
        credentials.insert(to, CredentialRecord {
            credential_type,
            score,
            issued_at: 0,   // use block timestamp in real impl
            commitment
        });
        true
    }

    // Agent proves they have a specific credential (ZK — no value revealed)
    pub circuit fn prove_has_credential(
        credential_type: Bytes,
        holder_commitment: Bytes
    ) -> bool {
        let record = credentials.get(msg_sender());
        assert(record.credential_type == credential_type, "Credential not found");
        true
    }

    // Agent proves reputation is above a threshold (ZK — exact score hidden)
    pub circuit fn prove_reputation_above(threshold: U32) -> bool {
        let record = credentials.get(msg_sender());
        assert(record.score >= threshold, "Reputation too low");
        true
    }
}
```

## Best Practices

- Store minimal data privately — only what is needed for proofs
- Use commitments for issuer authentication
- Allow selective disclosure for compliance: reveal `credential_type` but not `score`
- Combine with shielded payments — e.g. access to a paid service requires credential proof

## Privacy Properties

| What | Visible to whom |
|------|----------------|
| Credential type | Provable by holder in ZK, not visible to public |
| Score value | Hidden — only "above threshold" is provable |
| Holder identity | Protected by commitment scheme |
| Issuance history | Private |
