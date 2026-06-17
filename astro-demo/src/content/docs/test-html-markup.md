---
title: Test HTML Markup in Mermaid
description: Testing HTML markup support in Mermaid diagrams (astro-demo)
---

# HTML Markup in Mermaid Diagrams (Astro Demo)

Testing the reported issue #13 where HTML tags are stripped from mermaid diagrams in the pure Astro environment.

## Test Case from Issue #13

The following diagram should show an underlined "Language Binding" text with content on two lines:

```mermaid
graph TD
    A[Application Code] --> B[<u>Language Binding</u> <br/>Java, Node.js, Python, Go, C#, PHP]
    B --> C[Client Core - Rust]
    C --> D[Server]

    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style D fill:#e8f5e8
```

## Additional Test Cases

### Bold and Italic Text

```mermaid
graph LR
    A[<b>Bold Text</b>] --> B[<i>Italic Text</i>]
    B --> C[<b><i>Bold and Italic</i></b>]
```

### Line Breaks and Formatting

```mermaid
graph TD
    A[First Line<br/>Second Line<br/>Third Line]
    B[<b>Title</b><br/><i>Subtitle</i>]
    C[<u>Underlined</u><br/>Normal Text]

    A --> B
    B --> C
```

### Complex HTML Elements

```mermaid
flowchart TD
    A[<strong>Strong Text</strong>]
    B[<em>Emphasized</em>]
    C[<code>Code Block</code>]
    D[<small>Small Text</small>]

    A --> B
    B --> C
    C --> D
```