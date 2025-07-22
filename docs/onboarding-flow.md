---
id: onboarding-flow
sidebar_label: Onboarding Flow
title: Onboarding Flow
---

# Onboarding Flow

Welcome! This guide will walk you through the journey to implement the complete onboarding of a user, from the first time they connect their wallet, to the point where they can order a card (physical or virtual) and start using it.

If you want to see how it all comes together, check out our open-source [Gnosis Pay UI](https://github.com/gnosispay/ui) for a reference implementation.

Let's jump right in!

## 1. Authentication

First things first: your users need to authenticate with our API. This is covered in detail in the [Authentication Flow](/auth) section. Once they're authenticated, you'll get a `jwt`, you'll need it for all the next steps.

---

## 2. User Registration

Now that you've got your `jwt` token, it's time to register your user in the Gnosis Pay system. 

:::info
There are 2 ways to know whether they are already registered or not:

- **Check the JWT:** If the decoded JWT has a `userId`, your user is already registered.
- **Or, call the user endpoint:** Try [`GET /api/v1/user`](/api-reference/get-the-user-profile). If you get a `401 Unauthorized Error`, the user isn't registered yet.
:::
### 2.1 Get a One-Time Password (OTP) for Email

To register, we'll need to send your user a one-time password (OTP) to verify their email.  

Here's the endpoint [(spec)](/api-reference/request-otp-for-email-verification):

```jsx
POST /api/v1/auth/signup/otp
{
  "email": "string"
}
```

The OTP will arrive in their inbox from `team@gnosispay.com` and is valid for 5 minutes.

### 2.2 Verify the OTP

Once your user gets the code, you can finish signing them up.  

You will need to pass the `partnerId`, which is a unique identifier for your app that has been communicated to you. This is the only place where you need to include it in the request.  

If you have a `referralCouponCode`, you can include it here too.

Here's the endpoint [(spec)](/api-reference/create-a-new-user):
```jsx
POST /api/v1/auth/signup
{
  "authEmail": "string",
  "otp": "string", // The 6-digit code from their email
  "partnerId": "string",
  "referralCouponCode": "string" (optional)
}
```

### 2.3 Accept Terms of Service (ToS)

At this point, the user is registered in the Gnosis Pay system and has an associated user id.
Users need to accept our terms of service and those from our partners. To streamline the process, you can do this step together with the previous one.

We recommend having a mapping in your app, between the ToS id and a title, so you can display the title and link out for users to read the full text. Make sure they check a box to accept before moving on!

Get the terms for the user [(spec)](/api-reference/get-terms-and-conditions-status):
```jsx
GET /api/v1/user/terms
```
***Response***
```json
[
    {
        "type": "general-tos",
        "currentVersion": "TOS_GENERAL_VERSION_1",
        "accepted": false,
        "acceptedVersion": null,
        "acceptedAt": null,
        "url": "https://legal.gnosispay.com/en/articles/8911632-gnosis-pay-terms-of-service"
    },
    {
        "type": "card-monavate-tos",
        "currentVersion": "TOS_CARD_VERSION_1",
        "accepted": true,
        "acceptedVersion": "TOS_CARD_VERSION_1",
        "acceptedAt": "2025-05-07T15:46:25.706Z",
        "url": "https://legal.gnosispay.com/en/articles/8911633-monavate-cardholder-terms-eea"
    },
    {
        "type": "cashback-tos",
        "currentVersion": "TOS_CASHBACK_2024-08-01",
        "accepted": false,
        "acceptedVersion": null,
        "acceptedAt": null,
        "url": "https://forum.gnosis.io/t/gip-110-should-the-gnosis-dao-create-and-fund-a-gnosis-pay-rewards-program-with-10k-gno/8837"
    }
]
```

Suggestion to link each id with a title in your app:

```jsx
const tosToTitle = {
  "general-tos": "Gnosis Pay Terms of Service",
  "card-monavate-tos": "Cardholder Terms of Service",
  "cashback-tos": "Cashback Terms of Service",
}
```

Once the OTP verification is successful (previous step), and the user has reviewed and accepted the ToS, you can call the endpoint to accept each ToS that the user hadn't accepted yet [(spec)](/api-reference/get-terms-and-conditions-status):

```jsx
POST /api/v1/user/terms
{
  "terms": "string", // e.g. "general-tos"
  "version": "string" // e.g. "TOS_GENERAL_VERSION_1"
}
```

---
## 3. KYC Process

To order a card, your users will need to go through a KYC process with our partner Sumsub. The whole KYC flow happens in a Sumsub iframe, and in the background, the Gnosis Pay API keeps you updated on your user's `kycStatus` (check it with [`GET /api/v1/user`](/api-reference/get-the-user-profile)).

Here are the different KYC statuses you might see, and what they mean for your user:

| **KYC Status**                | **Description**                                                                                                          | **What your user should do**              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `notStarted`                  | No KYC process started                                                                                                   | Start KYC                                 |
| `documentsRequested`          | Applicant must upload documents. Status moves to `pending` when done.                                                    | Upload documents                          |
| `pending`                     | Awaiting verification processing                                                                                         | Nothing—just wait!                        |
| `processing`                  | Profile is being processed                                                                                               | Nothing—system is checking                |
| `approved`                    | All verification checks passed                                                                                           | Nothing—KYC is complete                   |
| `resubmissionRequested`       | Some checks failed; user can re-submit required steps                                                                    | Re-submit documents                       |
| `rejected`                    | Final rejection; user cannot try again                                                                                   | Nothing (final rejection)                 |
| `requiresAction`              | Manual check required by our team                                                                                        | Wait or contact support                   |

:::info
You should start the KYC process if your user is registered and their `kycStatus` is `notStarted` or `documentsRequested`.
:::
### 3.1 Get the Sumsub iframe URL

Each user gets a unique URL for their KYC process. Get it with [(spec)](/api-reference/retrieves-kyc-integration-specification):

```jsx
GET /api/v1/kyc/integration
```

### 3.2 Monitor KYC Status
While the whole KYC flow happens in an iframe, it is advised to constantly monitor the `kycStatus` from the user endpoint, and act if users are in certain states.

Provide a way to contact your support if the `kycStatus` is:
- `requiresAction`
- `rejected`

If the status is one of the following, there's nothing to do on your side:
  - `pending`
  - `processing`
  - `resubmissionRequested`

Finally, if the status is `approved`, you can move on to the next step.

### 3.3 Source of funds questionnaire

For regulatory reasons, users need to answer a couple of questions regarding the source of funds for their card.

:::info
Users should be ready for this step if:
- they are registered (a `userId` is present in the JWT)
- their `kycStatus` is `approved`
- the field `isSourceOfFundsAnswered` on the user endpoint response is `false`
:::

You can get the list of questions and possible answers at this endpoint [(spec)](/api-reference/retrieve-the-source-of-funds-questions): 

```jsx
GET /api/v1/source-of-funds
```

Show these questions to your user and collect their answers. You'll need to send all the answers together in one go [(spec)](/api-reference/submit-answers-to-the-source-of-funds-questionnaire):

```jsx
POST /api/v1/source-of-funds
[
  {
    question: "string",
    answer: "string"
  },
  ...
]
```

Don't forget to include the question title with each answer. If you want to see how this looks in practice, check out [Gnosis Pay UI](https://github.com/gnosispay/ui).

### 3.4 Phone Verification with OTP

Last but not least, your users need to verify their mobile phone. Just like with email, they'll enter their phone number, get a one-time password (OTP), and we'll verify it.

:::info
This step is needed if:
- The user is registered (`userId` in JWT)
- `kycStatus` is `approved`
- `isPhoneValidated` is `false` in the user endpoint response
:::

Validate the phone number by first requesting an OTP [(spec)](/api-reference/request-an-otp-to-verify-a-phone-number): 

```jsx
POST /api/v1/verification
{
  phoneNumber: "string"
}
```

This will send a code to the user's phone number, which in turn needs to be passed on to the check endpoint [(spec)](/api-reference/validates-an-otp-code-to-verify-a-phone-number): 

```jsx
POST /api/v1/verification/check
{
  code: "string"
}
```

Once that's done, `isPhoneValidated` will be `true`.

---

## 4. Safe Account Configuration

Gnosis Pay uses Safe accounts for on-chain transactions. Once your user has completed the previous steps, you're ready to help them set up their Safe account. Here's the flow:

1. Creating a Safe account [(`POST /api/v1/account`)](/api-reference/create-or-deploy-a-safe-account-for-the-authenticated-user)
2. Setting the Safe currency [(`POST /api/v1/safe/set-currency`)](/api-reference/set-the-currency-for-a-users-safe-account-based-on-their-country)
3. Getting signature data for modules setup [(`GET /api/v1/account/signature-payload`)](/api-reference/get-signature-data-for-account-setup)
4. Deploying Safe modules with the user's signature [(`PATCH /api/v1/account/deploy-safe-modules`)](/api-reference/deploy-safe-modules-with-a-user-signature)

:::info
Your user is ready for Safe configuration if:
- They are registered (`userId` in JWT)
- `kycStatus` is `approved`
- `isSourceOfFundsAnswered` is `true`
- `isPhoneValidated` is `true`
- `safeWallet` is an empty array in the user endpoint response
:::
### 4.1 Create a Safe Account

The first step is to create and deploy a Safe account for the user. [(spec)](/api-reference/create-or-deploy-a-safe-account-for-the-authenticated-user)
```tsx
POST /api/v1/account
{
  "chainId": "100" // Gnosis Chain ID
}
```

Heads up: this endpoint waits for on-chain confirmation (it can take up to 10 seconds). The response will include `deployed: true` if it worked, and a `transactionHash` you can use to track it.

:::info
After this, `safeWallet` from the user response from  [`GET /api/v1/user` endpoint](/api-reference/get-the-user-profile) won't be empty anymore.
:::
### 4.2 Set the Safe Currency

After deploying the Safe, we will need to have the currency set for the account. This currency determines which token will be used for transactions.

:::info
Before doing this, note that the fields `tokenSymbol` and `fiatSymbol` are `null` in the response from [`GET /api/v1/safe-config`](/api-reference/retrieve-the-safe-configuration-for-the-authenticated-user).
:::

Use the following endpoint to set the currency [(spec)](/api-reference/set-the-currency-for-a-users-safe-account-based-on-their-country):

```tsx
POST /api/v1/safe/set-currency
```

:::warning
- The currency is automatically assigned based on the user's country:
  - UK users (GB): GBPe
  - Brazil users (BR): USDCe
  - Users from other countries: EURe (default)
:::

### 4.3 Getting Signature Data for Modules Setup

Once the Safe is deployed and the currency is set, you need to get the data that will be signed by the user's wallet to set up the Safe modules.
:::info
Before this, note that the field `accountStatus` is `null` in the response from [`GET /api/v1/safe-config`](/api-reference/retrieve-the-safe-configuration-for-the-authenticated-user).
:::

You can get the data to be signed with the following endpoint  [(spec)](/api-reference/get-signature-data-for-account-setup).
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

:::warning
- This signature setup configures Safe account allowances and delay mechanisms required for secure operation.
- The response contains structured data compatible with the EIP-712 signature standard.
:::

### 4.4. Signing and Deploying Safe Modules

The final step is to sign the data with the user's wallet and deploy the Safe modules.

:::info
Before this, note that the field `accountStatus` is a number that is not `0` in the response from [`GET /api/v1/safe-config`](/api-reference/retrieve-the-safe-configuration-for-the-authenticated-user). `accountStatus: 0` would mean that the Safe modules are already deployed.
:::

Tip: Use the library [`@gnosispay/account-kit`](https://github.com/gnosispay/account-kit) to have a handy `AccountIntegrityStatus` enum. `AccountIntegrityStatus.Ok`, which is `0`, means that the Safe modules are already deployed. Another status `AccountIntegrityStatus.DelayQueueNotEmpty`, which is `7`, means the module is deployed correctly, but the Safe has a pending transaction, which could happen later on. If your interface is verifying the Safe modules deployment, both these statuses should be considered as valid.

#### Signing the Data

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

#### Deploying the Modules

Send the signature to deploy the Safe modules [(spec)](/api-reference/deploy-safe-modules-with-a-user-signature):

```tsx
PATCH /api/v1/account/deploy-safe-modules
{
  "signature": "0x1234567890abc...bcdef1b"
}
```

**Response:**
```json
{
  "transactionHash": "0xabcdef...34567890",
  "deployed": true
}
```

:::warning
- This endpoint waits for the transaction to be confirmed on-chain, so it may take up to 10 seconds to complete.
- The transaction configures the Safe's allowances and delay mechanisms for secure operation.
:::

#### Complete Safe Configuration Example

Here's how the whole Safe setup might look in code:

```typescript
import { signTypedData } from '@wagmi/core'

// 1. Create and deploy Safe account
const createSafeResponse = await fetch('/api/v1/account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chainId: '100' }),
});
const safeData = await createSafeResponse.json();
console.log('Safe deployed:', safeData.deployed);

// 2. Set Safe currency
const setCurrencyResponse = await fetch('/api/v1/safe/set-currency', {
  method: 'POST',
});
const currencyData = await setCurrencyResponse.json();
console.log('Currency set:', currencyData.tokenSymbol);

// 3. Get signature data
const signatureDataResponse = await fetch('/api/v1/account/signature-payload');
const { domain, types, message } = await signatureDataResponse.json();

// 4. Sign the data
const signature = await signTypedData({ domain, types, message });

// 5. Deploy Safe modules
const deployModulesResponse = await fetch('/api/v1/account/deploy-safe-modules', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ signature }),
});
const deployResult = await deployModulesResponse.json();
console.log('Modules deployed:', deployResult.deployed);
console.log('Transaction hash:', deployResult.transactionHash);
```

After these steps, your user's Safe account is fully configured. The `accountStatus` field will be `0` in the safe config response.