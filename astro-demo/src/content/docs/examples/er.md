---
title: Entity Relationship Diagrams
description: Examples of ER diagrams using Mermaid
---

Entity Relationship diagrams show the relationships between entities in a database.

## Simple E-Commerce Database

```mermaid
erDiagram
    CUSTOMER {
        int customer_id PK
        string name
        string email
        string phone
        date created_at
    }
    
    ORDER {
        int order_id PK
        int customer_id FK
        decimal total_amount
        string status
        date order_date
    }
    
    PRODUCT {
        int product_id PK
        string name
        string description
        decimal price
        int stock_quantity
    }
    
    ORDER_ITEM {
        int order_item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    
    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--o{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included in"
```

## Library Management System

```mermaid
erDiagram
    MEMBER {
        int member_id PK
        string first_name
        string last_name
        string email
        string phone
        date membership_date
        string membership_type
    }
    
    BOOK {
        int book_id PK
        string isbn
        string title
        string author
        string publisher
        int publication_year
        string genre
        int total_copies
        int available_copies
    }
    
    LOAN {
        int loan_id PK
        int member_id FK
        int book_id FK
        date loan_date
        date due_date
        date return_date
        decimal fine_amount
        string status
    }
    
    AUTHOR {
        int author_id PK
        string first_name
        string last_name
        string nationality
        date birth_date
    }
    
    CATEGORY {
        int category_id PK
        string name
        string description
    }
    
    MEMBER ||--o{ LOAN : "borrows"
    BOOK ||--o{ LOAN : "loaned as"
    AUTHOR ||--o{ BOOK : "writes"
    CATEGORY ||--o{ BOOK : "categorizes"
```

## Hospital Management System

```mermaid
erDiagram
    PATIENT {
        int patient_id PK
        string first_name
        string last_name
        date date_of_birth
        string gender
        string address
        string phone
        string email
        string emergency_contact
    }
    
    DOCTOR {
        int doctor_id PK
        string first_name
        string last_name
        string specialization
        string license_number
        string phone
        string email
    }
    
    APPOINTMENT {
        int appointment_id PK
        int patient_id FK
        int doctor_id FK
        datetime appointment_date
        string status
        string notes
        decimal fee
    }
    
    PRESCRIPTION {
        int prescription_id PK
        int appointment_id FK
        string medication_name
        string dosage
        string frequency
        int duration_days
        string instructions
    }
    
    DEPARTMENT {
        int department_id PK
        string name
        string location
        string phone
    }
    
    ROOM {
        int room_id PK
        int department_id FK
        string room_number
        string room_type
        int capacity
        string status
    }
    
    PATIENT ||--o{ APPOINTMENT : "schedules"
    DOCTOR ||--o{ APPOINTMENT : "attends"
    APPOINTMENT ||--o{ PRESCRIPTION : "results in"
    DEPARTMENT ||--o{ DOCTOR : "employs"
    DEPARTMENT ||--o{ ROOM : "contains"
```

## University Database

```mermaid
erDiagram
    STUDENT {
        int student_id PK
        string first_name
        string last_name
        string email
        date enrollment_date
        string major
        decimal gpa
        string status
    }
    
    COURSE {
        int course_id PK
        string course_code
        string title
        int credits
        string description
        int max_enrollment
    }
    
    INSTRUCTOR {
        int instructor_id PK
        string first_name
        string last_name
        string email
        string department
        string title
        date hire_date
    }
    
    ENROLLMENT {
        int enrollment_id PK
        int student_id FK
        int course_id FK
        string semester
        int year
        string grade
        date enrollment_date
    }
    
    ASSIGNMENT {
        int assignment_id PK
        int course_id FK
        string title
        string description
        date due_date
        int max_points
    }
    
    SUBMISSION {
        int submission_id PK
        int assignment_id FK
        int student_id FK
        datetime submitted_at
        string file_path
        int points_earned
        string feedback
    }
    
    STUDENT ||--o{ ENROLLMENT : "enrolls in"
    COURSE ||--o{ ENROLLMENT : "has enrollment"
    INSTRUCTOR ||--o{ COURSE : "teaches"
    COURSE ||--o{ ASSIGNMENT : "has"
    ASSIGNMENT ||--o{ SUBMISSION : "receives"
    STUDENT ||--o{ SUBMISSION : "submits"
```