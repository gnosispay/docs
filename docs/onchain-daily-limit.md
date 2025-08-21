---
id: onchain-daily-limit
sidebar_label: Onchain Daily Limit
title: Onchain Daily Limit
---

# Onchain Daily Limit

The onchain daily limit feature allows partners to manage daily spending limits for Gnosis Pay Safe accounts.

All transactions are gasless, enabling users to perform these operations completely free of charge.

## Overview

The onchain daily limit update process involves the following steps:

1. **Fetch Transaction Data** - Get the transaction data for signing
2. **Sign and Submit** - Sign the transaction and submit the update
3. **Monitor Update** - Wait for the delay relay to process the change and check the new limit

:::important
- Transaction signing wallet must be one of the Gnosis Pay Safe signers
- Updates are processed after a 3-minute delay as transactions are going through the Gnosis Pay delay relay
:::

## Step 1: Fetch Transaction Data for Signing

Get the transaction data that needs to be signed by the user's wallet:

**Endpoint:**
```http
GET /api/v1/accounts/onchain-daily-limit/transaction-data?onchainDailyLimit=${newLimit}
```

**Parameters:**
- `onchainDailyLimit` (required): The new daily limit value you want to set

**Response:**
```json
{
  "data": {
    "transaction": {
      "to": "0x...",
      "value": 0,
      "data": "0x..."
    }
  }
}
```

The `transaction` object contains the data that needs to be signed by the user's wallet.

## Step 2: Sign and Submit Transaction

:::warning
**Safe Activation Required**: This step only works when the Gnosis Pay Safe account has been fully activated and its modules are deployed. If you receive an error during submission, ensure that the Safe account activation process has been completed first.

For more information about Safe account setup and module deployment, see the [Safe Management API documentation](https://docs.gnosispay.com/api-reference/deploy-safe-modules-with-a-user-signature).
:::

### 2.1 Sign the Transaction

The transaction data from Step 1 must be signed by the user's wallet.

:::important
The wallet which is used to sign the transaction must be a signer of the Gnosis Pay Safe account.
:::

### 2.2 Submit the Signed Transaction

Once signed, submit the transaction to update the daily limit:

**Endpoint:**
```http
PUT /api/v1/accounts/onchain-daily-limit
```

**Request Body:**
```json
{
  "onchainDailyLimit": 1500,
  "signature": "0x..."
}
```

**Parameters:**
- `onchainDailyLimit` (required): The new daily limit value
- `signature` (required): The signed transaction data from Step 2.1

**Response:**
```json
{
  "data": {
    "requestedOnchainDailyLimit": 1500
  }
}
```

## Step 3: Monitor the transaction execution
The withdrawal is processed through a delay relay mechanism that executes after 3 minutes.

You can monitor the transaction status using the [delay-relay monitoring endpoint](https://docs.gnosispay.com/api-reference/retrieve-the-list-of-delayed-transactions-for-the-authenticated-user) or by checking your Safe's transaction history.
Additionally, you can also poll the following endpoint to check when the new limit becomes active:

**Endpoint:**
```http
GET /api/v1/accounts/onchain-daily-limit
```

**Response:**
```json
{
  "data": {
    "onchainDailyLimit": 1500
  }
}
```

## Complete Implementation Example

The following example demonstrates the complete flow using the [Gnosis Pay Account Kit library](https://github.com/gnosispay/account-kit), which provides helper methods to simplify the transaction signing process:

```typescript
import { populateExecuteEnqueue } from "@gnosispay/account-kit";

const safeAddress = "0x...";
const safeSignerAddress = "0x...";
const newOnchainDailyLimit = 1337;

/**
 * Step 1: Fetch transaction data for signing
 */
const response = await fetch(
  `https://api.gnosispay.com/api/v1/accounts/onchain-daily-limit/transaction-data?onchainDailyLimit=${newOnchainDailyLimit}`
);
const {
  data: { transaction: transactionData },
} = await response.json();

/**
 * Step 2: Sign and submit the transaction
 */
const { data: signature } = await populateExecuteEnqueue(
  { account: safeAddress, chainId: 100 },
  transactionData,
  (params) => {
    return walletClient.signTypedData({
      account: safeSignerAddress,
      ...params,
    });
  }
);

await fetch("https://api.gnosispay.com/api/v1/accounts/onchain-daily-limit", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    onchainDailyLimit: newOnchainDailyLimit,
    signature,
  }),
});

/**
 * Step 3: Monitor for the updated limit
 */
const pollForUpdate = async () => {
  const checkResponse = await fetch(
    "https://api.gnosispay.com/api/v1/accounts/onchain-daily-limit"
  );
  const { data: { onchainDailyLimit: updatedLimit } } = await checkResponse.json();

  if (updatedLimit === newOnchainDailyLimit) {
    console.log(`Limit successfully updated to: ${updatedLimit}`);
    return true;
  }

  console.log(`Waiting for update... Current: ${updatedLimit}, Target: ${newOnchainDailyLimit}`);
  return false;
};

/**
 * Poll every 30 seconds until the update is complete
 */
const interval = setInterval(async () => {
  if (await pollForUpdate()) {
    clearInterval(interval);
  }
}, 30000);
```