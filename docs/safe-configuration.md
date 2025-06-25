---
id: safe-configuration
sidebar_label: Safe Configuration
title: Safe Configuration
---

# Safe Configuration

GnosisPay uses Safe accounts as the foundation for on-chain transactions. This guide outlines the complete process for creating and configuring a Safe account through our API.

## Configuration Process Overview

The Safe configuration consists of 4 main steps:

1. Creating a Safe account (`POST /api/v1/account`)
2. Setting the Safe currency (`POST /api/v1/safe/set-currency`)
3. Getting signature data for modules setup (`GET /api/v1/account/signature-payload`)
4. Deploying Safe modules with the user's signature (`PATCH /api/v1/account/deploy-safe-modules`)

You don't need a KYCd user to deploy a Safe - the Safe can be deployed right after user creation.
Cards will be linked to the Safe during Card Creation.

## Recommended User Flow

The recommended flow for ordering a card is:

1. User signup
2. Create Safe
3. Perform KYC verification
4. Set currency for the Safe
5. Get signature and deploy modules
6. Order card

## Integration Flexibility

You have several options regarding when to create the Safe account. You can:

- Create the Safe immediately after signup (before KYC verification)
- Wait until after KYC verification is complete to create the Safe

Both approaches are valid, and you can choose the sequence that best fits your user flow and application requirements. The only firm requirements are:
- Setting the currency requires a completed KYC verification
- Safe configuration must be complete before ordering a card

Here's an alternative flow example:
1. User signup
2. Perform KYC verification
3. Create Safe
4. Set currency for the Safe
5. Get signature and deploy modules
6. Order card

## 1. Creating a Safe Account

The first step is to create and deploy a Safe account for the user. This can be done immediately after user signup as there are no prerequisites.

```tsx
POST /api/v1/account
{
  "chainId": "100"
}
```

**Response:**
```json
{
  "id": "safe-account-id-123",
  "address": "0x1234567890123456789012345678901234567890",
  "userId": "user123",
  "chainId": "100",
  "salt": "some-salt-value",
  "createdAt": "2024-01-01T00:00:00Z",
  "deployed": true,
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

**Important Notes:**
- This endpoint waits for transaction execution and confirmation on-chain, so it may take up to 10 seconds to complete.
- The `deployed: true` indicates that the Safe account has been successfully deployed.
- The `transactionHash` can be used to track the deployment transaction on-chain.

## 2. Setting the Safe Currency

After deploying the Safe, you need to set the currency for the account. This currency determines which token will be used for transactions.

```tsx
POST /api/v1/safe/set-currency
```

**Response:**
```json
{
  "tokenSymbol": "EURe"
}
```

**Important Notes:**
- This endpoint requires that the user has completed KYC verification successfully.
- The currency is automatically assigned based on the user's country:
  - UK users (GB): GBPe
  - Brazil users (BR): USDCe
  - Users from other countries: EURe (default)

## 3. Getting Signature Data for Modules Setup

Once the Safe is deployed and the currency is set, you need to get the data that will be signed by the user's wallet to set up the Safe modules:

```tsx
GET /api/v1/account/signature-payload
```

**Response:**
```json
{
  "domain": {
    "name": "Safe",
    "version": "1.0.0",
    "chainId": 100,
    "verifyingContract": "0x1234567890123456789012345678901234567890"
  },
  "types": {
    "SafeTransactionType": [
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" },
      { "name": "data", "type": "bytes" },
      { "name": "operation", "type": "uint8" },
      { "name": "safeTxGas", "type": "uint256" },
      { "name": "baseGas", "type": "uint256" },
      { "name": "gasPrice", "type": "uint256" },
      { "name": "gasToken", "type": "address" },
      { "name": "refundReceiver", "type": "address" },
      { "name": "nonce", "type": "uint256" }
    ]
  },
  "message": {
    "to": "0xTargetContractAddress",
    "value": "0",
    "data": "0xEncodedSetupData",
    "operation": 0,
    "safeTxGas": 0,
    "baseGas": 0,
    "gasPrice": 0,
    "gasToken": "0x0000000000000000000000000000000000000000",
    "refundReceiver": "0x0000000000000000000000000000000000000000",
    "nonce": 0
  }
}
```

**Important Notes:**
- This signature setup configures Safe account allowances and delay mechanisms required for secure operation.
- The response contains structured data compatible with the EIP-712 signature standard.

## 4. Signing and Deploying Safe Modules

The final step is to sign the data with the user's wallet and deploy the Safe modules:

### Signing the Data

Use the domain, types, and message from the previous step to generate an EIP-712 signature:

```typescript
// Using ethers.js wallet
const signature = await wallet.signTypedData(
  domain,
  types,
  message
);

// or using viem
const signature = await walletClient.signTypedData({
  domain,
  types,
  message
});
```

### Deploying the Modules

Send the signature to deploy the Safe modules:

```tsx
PATCH /api/v1/account/deploy-safe-modules
{
  "signature": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b"
}
```

**Response:**
```json
{
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  "deployed": true
}
```

**Important Notes:**
- This endpoint waits for the transaction to be confirmed on-chain, so it may take up to 10 seconds to complete.
- The transaction configures the Safe's allowances and delay mechanisms for secure operation.

## Complete Safe Configuration Example

Here's a complete example of the flow:

```typescript
import { signTypedData } from '@wagmi/core'

// Step 1: Create and deploy Safe account
const createSafeResponse = await fetch('/api/v1/account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chainId: '100' }),
});
const safeData = await createSafeResponse.json();
console.log('Safe deployed:', safeData.deployed);

// Step 2: Set Safe currency (requires successful KYC)
const setCurrencyResponse = await fetch('/api/v1/safe/set-currency', {
  method: 'POST',
});
const currencyData = await setCurrencyResponse.json();
console.log('Currency set:', currencyData.tokenSymbol);

// Step 3: Get signature data
const signatureDataResponse = await fetch('/api/v1/account/signature-payload');
const { domain, types, message } = await signatureDataResponse.json();

// Step 4: Sign the data with user's wallet
const signature = await signTypedData({
  domain,
  types,
  message,
});

// Step 5: Deploy Safe modules with signature
const deployModulesResponse = await fetch('/api/v1/account/deploy-safe-modules', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ signature }),
});
const deployResult = await deployModulesResponse.json();
console.log('Modules deployed:', deployResult.deployed);
console.log('Transaction hash:', deployResult.transactionHash);
```

After completing these steps, the Safe account is fully configured and ready to be used for transactions on the Gnosis Chain. 