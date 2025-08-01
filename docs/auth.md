---
id: auth
sidebar_label: Authentication Flow
title: Authentication Flow
---

# Authentication Flow

## Overview

Our authentication system uses Sign-In with Ethereum (SIWE) to generate a `jwt` to interact with our API.
This means you don’t need to handle the storage of a powerful API key or spend hours configuring granular permissions.

Our API accepts signatures from Externally Owned Accounts (EOAs) and Smart Accounts (EIP-1271).

:::caution
The signer must be an owner of a Gnosis Pay account. 
Non-registered users will receive `401 Unauthorized` on most authenticated routes
:::

## Token Details

A `jwt` is generated upon successful Sign-In with Ethereum (SIWE) verification and remains **valid for 1 hour**.
To enhance security and prevent replay attacks, each authentication attempt requires a new and unique nonce.

Always ensure that the `jwt` is valid before making API requests.
If an API request returns a 401 Unauthorized response due to an expired token,
your application must restart the authentication process, which requires user interaction.
This means the application must request a new nonce, prompt the user to sign the message,
and then submit the signature for verification to generate a fresh `jwt`.

## Authentication Process

### 1. Nonce Generation

Before initiating authentication, the application must request a nonce.
Your application then presents this nonce to the user for signing as part of the SIWE flow.

```jsx
GET /api/v1/auth/nonce
```

### 2. Signature Verification

```jsx
POST /api/v1/auth/challenge
Content-Type: application/json

{
    "message": "string",  // SIWE message containing the nonce
    "signature": "string" // User's signature of the message (EOA) or Smart Contract verification (EIP-1271)
}
```

:::caution
The SIWE message contains a `domain` and a `uri` field. You should ensure their values are **not** `127.0.0.1` or `localhost`, even when working locally. Override these fields (e.g., with `domain: "somedomain.com", uri: "https://www.somedomain.com"`) to prevent firewall blocks and "WAFForbidden" errors.
:::

Upon successful verification, a `jwt` is generated.
This `jwt` must be included in the Authorization header of all subsequent HTTP requests to authenticate with the Gnosis Pay API: 

   ```jsx
   Authorization: Bearer {jwt}
   ```

