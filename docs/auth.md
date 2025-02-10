---
id: auth
sidebar_label: Authentication Flow
title: Authentication Flow
---

# Authentication Flow

## Overview

Our authentication system uses Sign-In with Ethereum (SIWE) to generate JWT tokens for user authentication.
Both EOA and Smart Contract signatures (via EIP-1271) are supported.

## Requirements

- Signer must be an owner of a Gnosis Pay account

:::caution
Non-registered users will receive `401 Unauthorized` on most authenticated routes
:::

## Token Details

- JWT tokens are generated upon successful SIWE verification
- Token validity: 1 hour
- Token is set as an HTTP-only cookie named `jwt`
- Every authentication attempt requires a new nonce

## Authentication Process

### 1. Nonce Generation

```jsx
GET /api/v1/auth/nonce
```

The application must request a nonce before initiating user authentication. 
This nonce is presented to the user for signing as a part of the SIWE flow.

### 2. Signature Verification

```jsx
POST /api/v1/auth/verify
Content-Type: application/json

{
    "message": "string",  // SIWE message containing the nonce
    "signature": "string" // User's signature of the message (EOA) or Smart Contract verification (EIP-1271)
}
```

Upon successful verification:

- A JWT token is generated
- The token is set as an HTTP-only cookie named `jwt`
- This cookie will be automatically included in subsequent API requests

### Authentication Methods

The API supports two methods for providing authentication:

1. HTTP-only Cookie:
    - Automatically included in requests after successful authentication
    - Cookie name: `jwt`

2. Authorization Header passing the `jwt` received on the `/api/v1/auth/verify` endpoint:

   ```jsx
   Authorization: Bearer <JWT>
   ```

## Considerations

- Only Gnosis Pay account owners can authenticate successfully
- Always verify JWT token expiration.
  - When a token expires (401 response), integrations should request a new nonce and repeat the authentication process to obtain a fresh JWT token
