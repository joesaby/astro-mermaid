---
title: Class Diagrams
description: Examples of class diagrams using Mermaid
---

Class diagrams show the structure of a system by displaying classes, attributes, methods, and relationships.

## Basic Class Diagram

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +void eat()
        +void sleep()
    }
    
    class Dog {
        +String breed
        +void bark()
    }
    
    class Cat {
        +String furColor
        +void meow()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat
```

## Detailed Class Diagram

```mermaid
classDiagram
    class Vehicle {
        <<abstract>>
        +String licensePlate
        +int year
        +String manufacturer
        +void start()
        +void stop()
        +void getInfo()
    }
    
    class Car {
        +int numberOfDoors
        +String fuelType
        +void honkHorn()
    }
    
    class Motorcycle {
        +String engineType
        +boolean hasSidecar
        +void wheelie()
    }
    
    class Engine {
        +int horsepower
        +String type
        +void start()
        +void stop()
    }
    
    Vehicle <|-- Car
    Vehicle <|-- Motorcycle
    Vehicle *-- Engine : contains
    
    class Driver {
        +String name
        +String licenseNumber
        +void drive(Vehicle v)
    }
    
    Driver --> Vehicle : drives
```

## Interface and Implementation

```mermaid
classDiagram
    class IFlyable {
        <<interface>>
        +void fly()
        +void land()
    }
    
    class Bird {
        +String species
        +int wingspan
        +void eat()
    }
    
    class Airplane {
        +String model
        +int passengers
        +void takeOff()
    }
    
    IFlyable <|.. Bird : implements
    IFlyable <|.. Airplane : implements
    
    class Pilot {
        +String name
        +String certification
        +void navigate()
    }
    
    Pilot --> Airplane : operates
```

## Multiplicity and Relationships

```mermaid
classDiagram
    class University {
        +String name
        +String location
        +List~Department~ departments
    }
    
    class Department {
        +String name
        +String head
        +List~Course~ courses
    }
    
    class Course {
        +String code
        +String title
        +int credits
    }
    
    class Student {
        +String studentId
        +String name
        +List~Course~ enrolledCourses
    }
    
    class Professor {
        +String employeeId
        +String name
        +String specialization
    }
    
    University ||--o{ Department : "1 to many"
    Department ||--o{ Course : "1 to many"
    Professor ||--o{ Course : "teaches"
    Student }o--o{ Course : "enrolls in"
    
    note for University "Main campus location"
    note for Student "Undergraduate and Graduate students"
```