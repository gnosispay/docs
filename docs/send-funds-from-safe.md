---
id: send-funds-from-safe
sidebar_label: Send funds from the Safe
title: Send funds from the Safe
---

# Send funds from the Safe

The withdrawal feature allows partners to withdraw tokens from Gnosis Pay Safe accounts to any external address **on the Gnosis Chain**. 

All transactions are gasless, enabling users to perform these operations completely free of charge.

## Overview

The withdrawal process involves the following steps:

1. **Fetch Transaction Data** - Get the EIP-712 typed data for signing
2. **Sign and Submit** - Sign the transaction and submit the withdrawal
3. **Monitor Execution** - Wait for the delay relay to process the withdrawal

:::important
- Transaction signing wallet must be one of the Gnosis Pay Safe signers
- Withdrawals are processed after a 3-minute delay as transactions are going through the Gnosis Pay delay relay
- Cards are temporarily frozen for 3 minutes during withdrawal processing as a security measure
:::

## Step 1: Fetch Transaction Data for Signing

Get the EIP-712 typed data that needs to be signed by the user's wallet:

**Endpoint:**
```http
GET /api/v1/accounts/withdraw/transaction-data?tokenAddress=${tokenAddress}&to=${toAddress}&amount=${amount}
```

**Parameters:**
- `tokenAddress` (required): The address of the token to withdraw (must be a valid 40-character hex address)
- `to` (required): The destination address to withdraw to (must be a valid 40-character hex address)
- `amount` (required): The amount to withdraw in the token's base units (must be a positive integer string)

**Response:**
```json
{
  "data": {
    "domain": {
      "verifyingContract": "0x12345...",
      "chainId": 100
    },
    "primaryType": "ModuleTx",
    "types": {
      "ModuleTx": [
        {
          "type": "bytes",
          "name": "data"
        },
        {
          "type": "bytes32",
          "name": "salt"
        }
      ]
    },
    "message": {
      "data": "0x123456...00de0b6b3a7640000",
      "salt": "0x1234567890...abcdef"
    }
  }
}
```

The response contains EIP-712 typed data that needs to be signed by the user's wallet.

## Step 2: Sign and Submit Transaction

### 2.1 Sign the Transaction

The typed data from Step 1 must be signed by the user's wallet using the EIP-712 standard.

:::important
The wallet which is used to sign the transaction must be a signer of the Gnosis Pay Safe account.
:::

### 2.2 Submit the Signed Transaction

Once signed, submit the transaction to execute the withdrawal:

**Endpoint:**
```http
POST /api/v1/accounts/withdraw
```

**Request Body:**
```json
{
  "tokenAddress": "0x123456....",
  "to": "0x78910...",
  "amount": "1000000000000000000",
  "signature": "0x1234567890abcdef...",
  "message": {
    "salt": "0x1234567890...abcdef",
    "data": "0x123456...00de0b6b3a7640000"
  }
}
```

**Parameters:**
- `tokenAddress` (required): The address of the token to withdraw
- `to` (required): The destination address to withdraw to
- `amount` (required): The amount to withdraw in the token's base units
- `signature` (required): The EIP-712 signature from Step 2.1
- `message` (required): The message object from the typed data response

**Response:**
```json
{
  "data": {
    "id": "clp3j1f..6ezx2qv",
    "safeAddress": "0x1234567...",
    "transactionData": "{\"to\":\"0x123\",\"value\":\"0\",\"data\":\"0xabcdef\"}",
    "enqueueTaskId": "task_abc123",
    "dispatchTaskId": null,
    "readyAt": null,
    "operationType": "CALL",
    "userId": "user_123",
    "status": "QUEUING",
    "createdAt": "2025-02-07T12:34:56Z"
  }
}
```

## Step 3: Monitor the Execution

The withdrawal is processed through a **delay relay mechanism** that executes after 3 minutes.

You can monitor the transaction status using the [delay-relay monitoring endpoints](/api-reference/retrieve-the-list-of-delayed-transactions-for-the-authenticated-user) or by checking your Safe's transaction history.

## Complete Implementation Example

The following example demonstrates the complete flow:

```typescript
const safeAddress = "0x...";
const safeSignerAddress = "0x...";
const tokenAddress = "0x..."; // Token contract address
const toAddress = "0x..."; // Destination address
const amount = "1000000000000000000"; // Amount in token base units

/**
 * Step 1: Fetch transaction data for signing
 */
const response = await fetch(
  `https://api.gnosispay.com/api/v1/accounts/withdraw/transaction-data?tokenAddress=${tokenAddress}&to=${toAddress}&amount=${amount}`
);
const { data: typedData } = await response.json();

/**
 * Step 2: Sign and submit the transaction
 */
const signature = await walletClient.signTypedData({
  ...typedData,
  domain: {
    ...typedData.domain,
    verifyingContract: typedData.domain.verifyingContract as `0x${string}`,
  },
});

const submitResponse = await fetch("https://api.gnosispay.com/api/v1/accounts/withdraw", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tokenAddress,
    to: toAddress,
    amount,
    signature,
    message: typedData.message,
  }),
});

const { data: transactionResult } = await submitResponse.json();

/**
 * Step 3: Monitor execution (optional)
 */
console.log(`Withdrawal submitted with ID: ${transactionResult.id}`);
console.log(`Status: ${transactionResult.status}`);
console.log("Transaction will be processed after the 3-minute delay period");
```

## Security Considerations

- Make sure the user is aware this transfer is on the Gnosis Chain
- Remember that transactions cannot be reversed once executed
- Cards are temporarily frozen during the withdrawal process as a security measure

## Token Support

This feature supports withdrawing any ERC-20 token that exists in the Safe account. Make sure to:

- Use the correct token contract address
- Specify the amount in the token's base units (considering decimals)
- Ensure sufficient token balance in the Safe account 