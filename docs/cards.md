---
id: cards
sidebar_label: Cards Concepts 
title: Cards Concepts
---

# Cards Concepts

Cards are their own domain, with lots of edge cases all around and a unique set of terms. 
On this document, we aim to present the most common concepts related to operating cards 
and what to expect of them.

This is not an extensive guide and we encourage you to use this document as a way to start 
your journey. Both VISA and Mastercard have great resources and guides that you can also use. 

## Authorizations 

When a card is used to make a purchase, an authorization request is created, which can be approved or declined. 
The process to authorize transactions takes into consideration a lot of factors, some are: 

- The card balance has enough funds to cover the transaction amount 
- The card is active, with enough spending limits 
- Risk/AML screening 
- Anti-fraud analysis, and so on. 

If the authorization is approved, we deduct the amount from your card wallet and hold it in reserve until 
the authorization is either captured, canceled, or expired without a capture.
In case it's not captured, unused funds will return to your card wallet. 

There are a few other edge cases that you should be ready to handle: 

1. **Partial authorizations**: used to increase the amount authorized.
2. **Incremental authorizations**: hotels can send more authorizations to cover for fees after checking out. 
3. **Partial reversals**: used to reduce the amount authorized. 

Once an authorization is approved, it will be captured and becomes a transaction. 

## Transactions 

An authorization is captured and becomes a transaction usually under 24h. 
But as with everything in the card universe, this has edge cases. 
Car rentals, hotels, and some other businesses (defined by MCC) can capture up to a month 
after the authorization event. 

Again, more edge cases to handle: 

1. **Refunds**: unlike what you'd expect, this is not directly related to an authorization. 
2. **Partial capture**: a capture happens with an amount lower than the authorized amount. 
3. **Over capture**: some MCCs can over capture, meaning they can capture a value higher than the authorized amount. 
4. **Multi capture**: basically multiple partial captures on a single authorization, limited to some MCCs as well. 
5. **Force capture**: sometimes you receive a capture on a rejected authorization (yes, really), for example, some POS terminals on planes are not connected to the internet and when the plane lands it sends the transactions that happened mid-flight. 

These edge cases are limited to some MCCs, but they can be used for fraudulent behaviour. 
That's why we have the dispute process to contest suspicious transactions. 

## Disputes 

Disputes are used to recover funds for captured transactions. Their main use-case is to revert fraudulent transactions 
or problems with the product or service paid for. Fraud and non-fraud disputes have different requirements and rules, 
and undergo through different analysis to reach a conclusion.  

## Card PINs

Visa cards have 2 places to store the PIN - the first place is on the physical card chip, called the **offline PIN**, and the second is the **online PIN** that is stored in the bank's system. While these PINs usually have the same value, there can be cases where they differ, for instance when you change the card PIN.

When paying at a point of sale (in a restaurant or in a shop), only the offline PIN may be verified, while ATMs usually connect to the bank network and check the online PIN. When using the PSE to change the PIN, only the online PIN is changed. At this point, the offline PIN is **not updated** since physical access to the card is needed to change the PIN on the chip. To update the offline PIN, you need to go to an ATM and perform any operation. ATM transactions always go online to the card issuer. This allows the issuer to send an "issuer script" to your card, which updates the offline PIN stored on the chip, synchronizing it with any recent PIN changes made online (with PSE). Without this synchronization, your offline PIN might be outdated and cause issues for transactions that rely on offline verification.

## MCC: Merchant Category Code 

Merchant Category Codes (MCCs) are used to classify businesses based on the types of goods or services they provide. 
These codes are important as they are often used for calculating interchange fees, authorizing payments, and preventing fraud.
Additionally, specific MCCs are required for particular functionalities.

