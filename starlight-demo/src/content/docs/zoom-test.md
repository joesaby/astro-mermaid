---
title: Zoom Test
description: Testing mermaid diagrams with zoom functionality
---

# Testing Mermaid Zoom

This page tests the zoom functionality with mermaid diagrams.

## Simple Flowchart

Click on the diagram below to zoom in:

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix issues]
    E --> B
```

## Regular Image (for comparison)

Here's a regular image to compare zoom behavior:

![Astro Logo](https://docs.astro.build/assets/full-logo-light.png)

## Complex Diagram

A more complex diagram to test zoom on larger content:

```mermaid
graph TB
    subgraph "Frontend"
        A[React App] --> B[API Gateway]
        C[Mobile App] --> B
    end
    
    subgraph "Backend Services"
        B --> D[Auth Service]
        B --> E[User Service]
        B --> F[Product Service]
        B --> G[Order Service]
    end
    
    subgraph "Data Layer"
        D --> H[(User DB)]
        E --> H
        F --> I[(Product DB)]
        G --> J[(Order DB)]
    end
    
    subgraph "External Services"
        G --> K[Payment Gateway]
        G --> L[Shipping Service]
        F --> M[Inventory System]
    end
```

## Notes

- If zoom is working, clicking on any mermaid diagram should open it in a zoom view
- The zoom functionality should work the same as regular images
- You should see a zoom icon when hovering over the diagrams