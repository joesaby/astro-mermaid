---
title: User Journey Diagrams
description: Examples of user journey diagrams using Mermaid
---

User journey diagrams map out the steps a user takes to complete a task or achieve a goal.

## E-commerce Purchase Journey

```mermaid
journey
    title Online Shopping Journey
    section Discovery
      Browse products     : 5: Customer
      Search for item     : 4: Customer
      Read reviews        : 3: Customer
      Compare prices      : 4: Customer
    section Selection
      Add to cart         : 5: Customer
      View cart           : 4: Customer
      Apply coupon        : 3: Customer
      Update quantity     : 4: Customer
    section Checkout
      Enter shipping info : 3: Customer
      Select payment      : 4: Customer
      Review order        : 5: Customer
      Place order         : 5: Customer
    section Fulfillment
      Order confirmation  : 5: Customer, System
      Package preparation : 3: Warehouse
      Shipping            : 4: Logistics
      Delivery            : 5: Customer
```

## Customer Support Journey

```mermaid
journey
    title Customer Support Experience
    section Problem Discovery
      Encounter issue     : 1: Customer
      Check FAQ          : 2: Customer
      Search help docs   : 3: Customer
    section Contact Support
      Find contact info  : 4: Customer
      Choose channel     : 4: Customer
      Initiate contact   : 3: Customer
      Wait in queue      : 2: Customer
    section Resolution
      Explain problem    : 3: Customer, Agent
      Troubleshoot       : 4: Agent
      Test solution      : 4: Customer, Agent
      Confirm resolution : 5: Customer, Agent
    section Follow-up
      Receive survey     : 4: Customer
      Provide feedback   : 4: Customer
      Close ticket       : 5: Agent
```

## Mobile App Onboarding

```mermaid
journey
    title Mobile App Onboarding
    section Download
      Discover app        : 4: User
      Read description    : 3: User
      Check reviews       : 4: User
      Download app        : 5: User
    section First Launch
      Open app           : 5: User
      Grant permissions  : 3: User
      View welcome       : 4: User
      Skip tutorial      : 2: User
    section Account Setup
      Create account     : 3: User
      Verify email       : 4: User
      Setup profile      : 4: User
      Import contacts    : 3: User
    section First Use
      Explore features   : 5: User
      Complete first task: 5: User
      Invite friends     : 4: User
      Rate app          : 4: User
```

## Restaurant Dining Experience

```mermaid
journey
    title Restaurant Dining Experience
    section Arrival
      Make reservation   : 4: Customer
      Arrive at restaurant: 5: Customer
      Check in           : 4: Customer, Host
      Wait for table     : 3: Customer
    section Seating
      Get seated         : 5: Customer, Host
      Receive menu       : 4: Customer, Server
      Order drinks       : 4: Customer, Server
      Review menu        : 4: Customer
    section Ordering
      Ask questions      : 4: Customer, Server
      Place order        : 5: Customer, Server
      Receive drinks     : 5: Customer, Server
      Wait for food      : 3: Customer
    section Dining
      Receive food       : 5: Customer, Server
      Enjoy meal         : 5: Customer
      Request check      : 4: Customer, Server
      Pay bill           : 4: Customer, Server
    section Departure
      Leave restaurant   : 5: Customer
      Provide feedback   : 4: Customer
```

## Job Application Process

```mermaid
journey
    title Job Application Process
    section Job Search
      Browse job boards   : 4: Applicant
      Find relevant jobs  : 5: Applicant
      Research company    : 4: Applicant
      Read job description: 5: Applicant
    section Application
      Prepare resume      : 3: Applicant
      Write cover letter  : 3: Applicant
      Submit application  : 4: Applicant
      Wait for response   : 2: Applicant
    section Interview Process
      Schedule interview  : 4: Applicant, HR
      Prepare for interview: 3: Applicant
      Attend interview    : 4: Applicant, Interviewer
      Follow up          : 4: Applicant
    section Decision
      Receive feedback    : 3: Applicant, HR
      Negotiate offer     : 5: Applicant, HR
      Accept position     : 5: Applicant, HR
      Start onboarding    : 5: Applicant, HR
```

## Banking Digital Experience

```mermaid
journey
    title Digital Banking Journey
    section Account Access
      Open banking app    : 5: Customer
      Enter credentials   : 4: Customer
      Complete 2FA        : 3: Customer
      View dashboard      : 5: Customer
    section Transaction
      Check balance       : 5: Customer
      Review transactions : 4: Customer
      Initiate transfer   : 4: Customer
      Confirm transfer    : 5: Customer, System
    section Support
      Find help section   : 3: Customer
      Use chat bot        : 4: Customer, Bot
      Escalate to agent   : 3: Customer, Agent
      Resolve issue       : 5: Customer, Agent
    section Security
      Update password     : 3: Customer
      Review security     : 4: Customer
      Set up alerts       : 4: Customer
      Log out securely    : 5: Customer
```