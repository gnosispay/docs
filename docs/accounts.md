---
id: accounts
sidebar_label: Accounts on Gnosis Pay
title: Accounts on Gnosis Pay
---

# Accounts on Gnosis Pay

When you sign up for Gnosis Pay, a new Gnosis Pay Safe—a smart contract wallet—is created for you. 
This Safe is exclusively controlled by you through your Externally Owned Account (EOA) Wallet. 
Consequently, the funds in your Gnosis Pay Safe are not held by any third party; **you have sole ownership and control over them**.

[Watch an explainer video here.](https://youtu.be/_-FoBiwBJTA) 

## Externally Owned Account Wallet 

Your EOA Wallet is your personal wallet, granting you full control over your funds, ensuring they are never managed by a third party. 
The EOA has sole authority over your assets.

We support EVM compatible EOA wallets at the moment. 
You can transfer funds from any token on any EVM chain using your EOA Wallet.

## Safe Smart Account: your Smart Contract wallet

When you open your Account with Gnosis Pay, we create a **Safe Smart Account** for you, 
which functions as a "savings" account on Gnosis Chain L1. 

Currently, we deploy a new Safe for you. We have plans on supporting existing 
Safe multisig wallet as the Gnosis Pay Safe.

 
### What is a smart contract wallet? 

A smart contract wallet utilizes smart contracts on a blockchain to manage and automate transactions, 
offering enhanced security and functionality beyond simple fund storage and transfer. 
These wallets are typically owned by an EOA Wallet.

[Safe](https://safe.global/) is the pioneer of smart contract wallets custodying over $70+ billion in assets.

### Understanding the Safe setup 

To explore the Safe setup further, you can access the Zodiac application in the Safe Webapp for your specific Safe by following these steps:

1. Go to Gnosis Pay Dashboard
2. Click on "View all transactions here" and this will take you to the Safe webapp
3. Click on applications in the sidebar
4. Search for 'Zodiac' application

The Roles Module and Delay Module are open-source smart contracts governed by the LGPL 3.0 license.

## What are modules? 

Modules are small pieces of logic that help ensure the product functions securely. 
Controlled by the user, these modules allow Gnosis Pay to operate as configured by you, 
ensuring self-custody of your funds in your preferred manner.

These modules are open source software developed as part of the zodiac standard of DAO tooling built by [Gnosis Guild](https://www.gnosisguild.org/).
Without this configuration, we would be unable to serve you.
 
## Roles Module

The roles module has 4 configurations: 

1. **Token Used** - Specifies which token Gnosis Pay can spend. 
2. **Daily Limit** - Defines the daily limit of funds that Gnosis Pay can spend on your behalf.
3. **Recipient address** - Indicates where the funds can be transferred. In our case, it’s another Safe owned by the card issuer, used to settle funds owed to merchants through Visa. 
4. **Role delegated to whom** - Specifies to whom this role is delegated—in this case, Gnosis Pay. 

It’s important to note that this module is owned and modifiable only by you. You have complete control to change the daily spending limit in a permissionless way whenever you desire. This setup allows Gnosis Pay to process transactions on your behalf.

## Delay Module

The Delay Module ensures that all non-card transactions (e.g., sending funds to another address, adding funds) undergo a 3-minute delay. 
This delay prevents double-spending conditions and ensures the availability of funds authorized and spent by the card.

:::caution
The card will be paused during the 3-minute delay if there are any non-card transactions in the delay queue.
:::

The Delay Module also ensures that you have sole control over the Safe itself. 
During the activation process, your EOA Wallet is made an indirect owner of the Safe by placing the Delay Module between the Safe and the EOA.

We advise against changing the configuration of the Safe to ensure that Gnosis Pay can continue to serve you effectively.

## What happens if I lose access to my EOA Wallet?

If you’ve forgotten the password to your EOA Wallet, you can regain access using its seed phrase.

:::caution
However, if you’ve lost access to the seed phrase and cannot regain access to the EOA, you will also lose access to the Safe if it’s the only owner.
:::

**To mitigate this risk, consider adding multiple owners to your [Safe](https://safe.global/).**

