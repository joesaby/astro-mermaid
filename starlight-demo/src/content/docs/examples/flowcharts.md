---
title: Flowcharts
description: Examples of flowchart diagrams using Mermaid
---

## Basic Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issues]
    E --> A
```

## Flowchart with Subgraphs

```mermaid
graph TB
    subgraph Frontend
        A[React App] --> B[API Client]
        B --> C[State Management]
    end
    
    subgraph Backend
        D[REST API] --> E[Database]
        E --> F[Cache]
    end
    
    subgraph Infrastructure
        G[Load Balancer] --> H[CDN]
        H --> I[Edge Functions]
    end
    
    C --> D
    D --> G
    F --> D
```

<details>
<summary>Decision Tree with ELK layout</summary>


```mermaid
---
config:
  layout: elk
---
graph TB
    subgraph Frontend
        A[React App] --> B[API Client]
        B --> C[State Management]
    end
    
    subgraph Backend
        D[REST API] --> E[Database]
        E --> F[Cache]
    end
    
    subgraph Infrastructure
        G[Load Balancer] --> H[CDN]
        H --> I[Edge Functions]
    end
    
    C --> D
    D --> G
    F --> D
```

</details>

## Decision Tree

```mermaid
graph TD
    A[User visits site] --> B{Authenticated?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login]
    
    D --> E{Valid Credentials?}
    E -->|Yes| F[Set Session]
    E -->|No| G[Show Error]
    
    F --> C
    G --> D
    
    C --> H{Select Action}
    H -->|Profile| I[User Profile]
    H -->|Settings| J[App Settings]
    H -->|Logout| K[End Session]
    
    K --> D
```

<details>
<summary>Decision Tree with ELK layout</summary>

```mermaid
---
config:
  layout: elk
---
graph TD
    A[User visits site] --> B{Authenticated?}
    B -->|Yes| C[Show Dashboard]
    B -->|No| D[Show Login]
    
    D --> E{Valid Credentials?}
    E -->|Yes| F[Set Session]
    E -->|No| G[Show Error]
    
    F --> C
    G --> D
    
    C --> H{Select Action}
    H -->|Profile| I[User Profile]
    H -->|Settings| J[App Settings]
    H -->|Logout| K[End Session]
    
    K --> D
```

</details>

## Horizontal Flow

```mermaid
graph LR
    A[Input] --> B[Process]
    B --> C[Transform]
    C --> D[Validate]
    D --> E{Valid?}
    E -->|Yes| F[Store]
    E -->|No| G[Error]
    G --> A
    F --> H[Output]
```

## Complex Node Shapes

```mermaid
graph TD
    A[Rectangle] --> B(Rounded)
    B --> C{Diamond}
    C -->|Option 1| D((Circle))
    C -->|Option 2| E>Flag]
    D --> F[[Subroutine]]
    E --> G[(Database)]
    F --> H[/Parallelogram/]
    G --> I[\Parallelogram Alt\]
    H --> J[/Trapezoid\]
    I --> K[\Trapezoid Alt/]
```

## Styled Flowchart

```mermaid
graph TD
    A[Start] --> B[Process]
    B --> C{Decision}
    C -->|Yes| D[Success]
    C -->|No| E[Failure]
    
    style A fill:#90EE90,stroke:#228B22,stroke-width:2px
    style D fill:#98FB98,stroke:#228B22,stroke-width:2px
    style E fill:#FFB6C1,stroke:#DC143C,stroke-width:2px
    
    classDef processClass fill:#87CEEB,stroke:#4682B4,stroke-width:2px
    classDef decisionClass fill:#F0E68C,stroke:#DAA520,stroke-width:2px
    
    class B processClass
    class C decisionClass
```

## Interactive Elements

```mermaid
graph TD
    A[Click me!] -->|Action| B[Result]
    B --> C[Another Action]
    
    click A "https://mermaid.js.org" "Visit Mermaid Docs"
    click B callback "JavaScript callback function"
```