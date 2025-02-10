---
id: card-order-flow
sidebar_label: Cards Order Flow 
title: Cards Order Flow
---

# Cards Orders Flow 

Our card order flow supports both free and paid cards. 
You can provide a `couponCode` if you have one, that will affect the card's price. 


## Create a new Card 

### 1. Create a Card Order

```jsx
POST /api/v1/order/create
```

This endpoint creates a new `CardOrder` with the status of `PENDINGTRANSACTION` .

The Card Order is created with the following data:

- Address data is taken from the `User` and cannot be modified.
- The total amount to be paid is set in EURe. The amount is 30.23.
- The `couponCode` applied is taken from the `User.referalCouponCode` . 

### 2. (Optional) Attach a Coupon

```jsx
POST /api/v1/order/{orderId}/attach-coupon
```

This endpoint attaches a coupon to the `CardOrder` with `orderId`.
The coupon needs to be valid else an error is thrown.

We recommend you send the couponCode on the order creation and avoid this step. 

### 3. (Optional) Attach an on-chain transaction

```jsx
PUT /api/v1/order/{orderId}/attach-transaction
```

For the card order, a payment must be performed. This endpoint allows setting a transaction hash to the specified `orderId`.

The transaction can only be used once across all card orders.

:::info 
Calling this endpoint is optional because the card can be free.
::: 


### 4. Confirm the payment performed

```jsx
PUT /api/v1/order/{orderId}/confirm-payment
```

In order to call this endpoint, the `CardOrder.status` needs to be `PENDINGTRANSACTION` .

This endpoint validates if the card order is free. If `CardOrder.totalAmountEUR` is the same as the `CardOrder.totalDiscountEUR` then the card is considered free. 

#### Successful Payment Conditions

If the card is not free, we check if a payment was done. The conditions for the payment are:

- Token used for payment needs to be EURe `0xcB444e90D8198415266c6a2724b7900fb12FC56E`.
- Payment was done to `0x3D4FD6a1A7a1382ae1d62C3DD7247254a0236847`.
- The respective EURe amount was paid in that transaction hash (partial transfers are not supported).

If the conditions above are met, the `CardOrder.status` is to `READY` .

:::caution 
Even if the card is free, this endpoint needs to be called to move the card order to a `READY` status.
::: 

### 5. Create a Card

```jsx
POST /api/v1/order/:orderId/card
```

In order to create a `Card` out of a `CardOrder` the following conditions needs to be met:

- No cards were created out of this `orderId`.
- The risk score needs to be Green or Orange.
- User needs to have a verified phone number.
- User needs to have a name set.
- User needs to be from a supported country.
- User address needs to be set.
- User needs to have an approved KYC.
- User needs to have the shipping details for the order set.
    - The shipping details are the same as the User’s address.
- The embossed name for the card needs to be set.

:::caution
In order to create a card, an encrypted key generated on the client side must be provided. 
This key should be encrypted with Paymentology’s public key.
We do not have a reference implementation for this yet, but it can be provided.
::: 

