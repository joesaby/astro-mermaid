---
title: State Diagrams
description: Examples of state diagrams using Mermaid
---

State diagrams show the different states of an object and transitions between them.

## Simple State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Running : start
    Running --> Idle : stop
    Running --> Error : failure
    Error --> Idle : reset
    Idle --> [*] : shutdown
```

## ATM State Machine

```mermaid
stateDiagram-v2
    [*] --> WaitingCard
    WaitingCard --> CardInserted : insert_card
    CardInserted --> WaitingPIN : card_valid
    CardInserted --> WaitingCard : card_invalid
    
    WaitingPIN --> Authenticated : correct_pin
    WaitingPIN --> WaitingCard : wrong_pin_3_times
    WaitingPIN --> WaitingPIN : wrong_pin
    
    Authenticated --> SelectTransaction : authenticated
    SelectTransaction --> Balance : check_balance
    SelectTransaction --> Withdraw : withdraw_money
    SelectTransaction --> Deposit : deposit_money
    
    Balance --> SelectTransaction : continue
    Withdraw --> SelectTransaction : transaction_complete
    Deposit --> SelectTransaction : transaction_complete
    
    SelectTransaction --> EjectCard : finish
    Balance --> EjectCard : finish
    Withdraw --> EjectCard : finish
    Deposit --> EjectCard : finish
    
    EjectCard --> [*] : card_ejected
```

## Player State Machine

```mermaid
stateDiagram-v2
    [*] --> Stopped
    Stopped --> Playing : play
    Playing --> Paused : pause
    Paused --> Playing : resume
    Playing --> Stopped : stop
    Paused --> Stopped : stop
    
    state Playing {
        [*] --> Loading
        Loading --> Buffering : data_needed
        Buffering --> Streaming : buffer_full
        Streaming --> Buffering : buffer_low
        Loading --> Streaming : ready
    }
    
    note right of Playing : Audio/Video playback state
    note left of Stopped : Initial and final state
```

## Order Processing

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted : submit
    Draft --> Cancelled : cancel
    
    Submitted --> UnderReview : review_started
    UnderReview --> Approved : approve
    UnderReview --> Rejected : reject
    UnderReview --> PendingInfo : request_info
    
    PendingInfo --> UnderReview : info_provided
    PendingInfo --> Cancelled : timeout
    
    Approved --> InProgress : start_processing
    InProgress --> Completed : finish
    InProgress --> OnHold : hold
    InProgress --> Failed : error
    
    OnHold --> InProgress : resume
    OnHold --> Cancelled : cancel
    
    Failed --> InProgress : retry
    Failed --> Cancelled : abandon
    
    Rejected --> [*]
    Cancelled --> [*]
    Completed --> [*]
    
    state Approved {
        [*] --> WaitingPayment
        WaitingPayment --> PaymentReceived : payment_confirmed
        PaymentReceived --> [*]
    }
```

## Game Character States

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Walking : move
    Walking --> Running : sprint
    Running --> Walking : release_sprint
    Walking --> Idle : stop
    Running --> Idle : stop
    
    Idle --> Jumping : jump
    Walking --> Jumping : jump
    Running --> Jumping : jump
    Jumping --> Idle : land
    
    Idle --> Attacking : attack
    Walking --> Attacking : attack
    Running --> Attacking : attack
    Attacking --> Idle : attack_complete
    
    state Attacking {
        [*] --> WindUp
        WindUp --> Strike : wind_up_complete
        Strike --> Recovery : strike_complete
        Recovery --> [*] : recovery_complete
    }
    
    Idle --> Dead : health_zero
    Walking --> Dead : health_zero
    Running --> Dead : health_zero
    Jumping --> Dead : health_zero
    Attacking --> Dead : health_zero
    
    Dead --> [*] : respawn
```

<details>
<summary>Game Character States with ELK layout</summary>

```mermaid
---
config:
  layout: elk
---
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Walking : move
    Walking --> Running : sprint
    Running --> Walking : release_sprint
    Walking --> Idle : stop
    Running --> Idle : stop
    
    Idle --> Jumping : jump
    Walking --> Jumping : jump
    Running --> Jumping : jump
    Jumping --> Idle : land
    
    Idle --> Attacking : attack
    Walking --> Attacking : attack
    Running --> Attacking : attack
    Attacking --> Idle : attack_complete
    
    state Attacking {
        [*] --> WindUp
        WindUp --> Strike : wind_up_complete
        Strike --> Recovery : strike_complete
        Recovery --> [*] : recovery_complete
    }
    
    Idle --> Dead : health_zero
    Walking --> Dead : health_zero
    Running --> Dead : health_zero
    Jumping --> Dead : health_zero
    Attacking --> Dead : health_zero
    
    Dead --> [*] : respawn
```

</details>
