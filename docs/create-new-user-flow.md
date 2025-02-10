---
id: create-new-user-flow
sidebar_label: Create New User Flow
title: Create New User Flow
---

# Create New User Flow 

## 1. Create a User on our API 

If you have a `referralCouponCode` you can send it on this step.

```jsx
POST /api/v1/auth/signup
{
  "authEmail": "string",
  "referralCouponCode": "string" (optional)
}
```
:::info
By calling this endpoint passing a `jwt`` from a signed message you are automatically
assigning that address as the initial associated wallet (EOA) of this user.
::: 

## 2. Get the KYC URL from Gnosis Pay API

Gnosis Pay uses Sumsub as the KYC provider. 
The flow today requires you to integrate with Sumsub's WebView. 
Use this API endpoint to get the correct URL for the User: 
```jsx
GET /api/v1/kyc/integration
```

## 3. Redirect the user to the KYC URL 

The integrator needs to redirect users to the KYC URL acquired in the previous step.
Users will conduct and complete the KYC process directly on Sumsub's platform. 

## 4. Answer the Source of Funds questionnaire 

Get the list of questions on this endpoint: 

```jsx
GET /api/v1/source-of-funds
```
And then you need to display these questions to the User and get their answers. 

You can ask one question at a time or all the questions at once. 
You have complete control over how your users are going to answer you. 
But for this flow to work, you need to send all the answers on the same request to the following endpoint: 

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

Also note that you need to send the question title along with the answer. 

:::info 
We are introducing an `id` to the question soon. 
Instead of sending us the question title on the `POST`, you will need to send us the `id`.
If you are integrating before the `id` is here, please check if the `id` is present to avoid any disruptions.
::: 

## 5. Validate the phone number

Validate the phone number by first requesting an OTP: 

```jsx
POST /api/v1/verification
{
  phoneNumber: "string"
}
```
This will send a code to the User's phone number, which in turn needs to be passed on to the check endpoint: 

```jsx
POST /api/v1/verification/check
{
  code: "string"
}
```

## 6. Monitor the KYC result

KYC is an asynchronous process by nature. 
We recommend you check the User's profile regularly for changes in the KYC status to act accordingly. 

```jsx
GET /api/v1/user
```

| **KYC Status**                | **Description**                                                                                                          | **Action required from user**                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Not started                   | No KYC process has started                                                                                               | Initiate KYC flow                                       |
| Started (Documents requested) | Applicant is created and must upload documents according to verification steps. When done, this status moves to Pending. | Provide requested documents                             |
| Pending                       | Applicant has provided the necessary data and is awaiting verification processing                                        | None (wait for verification)                            |
| Processing                    | Applicant profile is being processed                                                                                     | None (system is checking documents)                     |
| Approved                      | Applicant has successfully passed all verification checks                                                                | None (KYC complete)                                     |
| Resubmission requested        | Applicant failed some checks and was temporarily rejected. They can re-submit the failed verification steps              | Re-submit required documents                            |
| Rejected                      | Applicant failed some checks and received a final rejection label. They cannot try again                                 | None (final rejection)                                  |
| Requires action               | May occur if the applicant is assigned to a manual check by our team.                                                    | Wait for a manual check or contact support if requested |
