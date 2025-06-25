---
id: iban-integration
sidebar_label: IBAN Integration
title: IBAN Integration
---

# IBAN Integration

For users in Europe (EU) and Switzerland, we offer IBAN cash-in to the GnosisPay Account via Monerium.

## 1. Check Availability 

First you need to check if the user is available to activate their IBAN:

```tsx
GET /api/v1/ibans/available
{
  "data": {
    "available": true
  }
}
```

If you receive a `"available": false`, the flow ends here.

Requirements the User must have:

- An active EURe Safe Account 
- KYC verified and approved 
- Residency in a supported country 
- Nationality from a supported country ([see allowed and restricted nationalities](https://help.gnosispay.com/en/articles/9795352-nationalities-allowed-and-restricted-for-the-iban-feature))

## 2. Enabling the IBAN Integration

## Signing the Monerium message  

Monerium requires a specific message to be signed by the User's wallet.
To get the exact message that needs to be signed:

```tsx
GET /api/v1/ibans/signing-message
{
  "data": {
    "message": "I hereby declare that I am the address owner."
  }
}
```

Once signed, the signed message will be sent to the activation endpoint.  

:::important
We cannot request new IBANs nor transfer existing IBANs until the message signature is completed. This signature is a mandatory requirement from Monerium to verify ownership of the address.
:::

## Possible outcomes for the IBAN integration activation
 
One thing to note is that the request starts the same: 

```tsx
POST /api/v1/ibans/monerium-profile
{
  "signature": "... signed message as a string ...",
  "callbackUrl": "https://your-app.com/iban-callback"
}
```

### 1. The user is not registered with Monerium, so we create a new monerium profile for them 

If this is the case, you will receive this answer from the API:

```tsx
Response:
{
  "data": {
    "success": true
  }
}
```
The activation process is asynchronous, so this will be done on the background and may take some time to show up on the API. The process typically takes at least 3 minutes to complete due to the delay module that verifies the signature and ownership of the address. 

### 2. The user already has a Monerium profile, so we need to request access to it via an oAuth flow

When your User already have a Monerium account, we need to redirect the user to a URL so they can allow GnosisPay to interact with 
their existing account. So the `POST` will return a `422` error with the following body: 

```tsx
Response:
{
  errors: {
    externalApiCallStatusCode: 304,
    message: "User needs to be redirect to Monerium oAuth flow",
    redirectUrl: "... url ...",
  },
}
```

You need to redirect your users when `externalApiCallStatusCode == 304`. 
After the User approves our access to their existing account, the background job will pick up from there and user will be redirected to the provided callback URL.

Another way to get the redirect URL if user has Monerium profile already is to use the `/api/v1/ibans/oauth/redirect_url` endpoint.
For this request, callbackUrl should be sent as query parameter.


## 3. Get the IBAN number, BIC, Status and Connected Blockchain Address where funds are sent

You should monitor this endpoint until you see a status of `ASSIGNED`
Use this data to cash-in to your GnosisPay Account:
```tsx
GET /api/v1/ibans/details
{
  "data": {
    "iban": "DE44500105175407324931",
    "bic": "GENODEM1GLS",
    "ibanStatus": "PENDING",
    "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
  }
}
```

| IBAN Status | Description | Action |
| ------------- | -------------- | -------------- |
| NOTSTARTED | Initial state when the user hasn't started the IBAN creation process yet | User needs to initiate the IBAN creation process |
| PENDING | IBAN creation has been initiated and is being processed by Monerium | Wait for the process to complete, periodically check the status |
| PENDING_OAUTH | User has an existing Monerium profile and needs to authorize GnosisPay via OAuth | Redirect the user to the OAuth URL provided in the response |
| ASSIGNED | IBAN has been successfully created and assigned to the user | IBAN is ready to use for cash-in transactions |


## 4. IBAN Statement (Orders list)

To get a complete statement for the orders processed through IBAN: 

```tsx
GET /api/v1/ibans/orders
{
  "data": [
    {
      "id": "string",
      "kind": "redeem",
      "currency": "eur",
      "amount": "string",
      "address": "string",
      "counterpart": {
        "details": {
          "name": "string"
        },
        "identifier": {
          "standard": "iban",
          "iban": "string"
        }
      },
      "memo": "string",
      "state": "placed",
      "meta": {
        "placedAt": "2025-02-13T11:49:17.011Z"
      }
    }, 
    ... 
  ]
}
```

**Note:** This endpoint returns only incoming orders (deposits) to the user's IBAN.

## Message Signing Example with GnosisPay Account Kit

You can use the GnosisPay Account Kit as example to generate a signature for endpoint.
You can find the Account Kit code in our [GitHub repository](https://github.com/gnosispay/account-kit/).

### Example Usage

```typescript
import { Wallet } from 'ethers';
import { 
  populateExecuteEnqueue, 
  predictAccountAddress,
  createInnerSignMessageTransaction 
} from '@gnosispay/account-kit';

// Initialize your wallet
const wallet = new Wallet(privateKey, provider);

// Predict the account address
const owner = wallet.address;
const safeAddress = predictAccountAddress({ owner });

// Create a transaction to sign a message
const transaction = createInnerSignMessageTransaction(
  "I hereby declare that I am the address owner."
);

// Generate the execute transaction with signature
const enqueueTx = await populateExecuteEnqueue(
  { account: safeAddress, chainId: 100 },
  transaction,
  ({ domain, types, message }) => wallet._signTypedData(domain, types, message)
);

// The transaction data contains the signature
console.log(enqueueTx.data, '-> signature');
```

### Note
- The message can be fetched from the API using `GET /api/v1/ibans/signing-message`
- The generated transaction can be submitted to prove ownership
- Make sure to use the correct chainId (100 for Gnosis Chain) 