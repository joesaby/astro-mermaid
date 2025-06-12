---
title: Git Graphs
description: Examples of Git graphs using Mermaid
---

Git graphs visualize the branching and merging in a Git repository.

## Basic Git Flow

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
```

## Feature Branch Workflow

```mermaid
gitGraph
    commit
    commit
    branch feature-auth
    checkout feature-auth
    commit
    commit
    commit
    checkout main
    commit
    merge feature-auth
    commit
    branch feature-dashboard
    checkout feature-dashboard
    commit
    commit
    checkout main
    commit
    checkout feature-dashboard
    merge main
    commit
    commit
    checkout main
    merge feature-dashboard
    commit
```

## Gitflow Workflow

```mermaid
gitGraph
    commit
    branch develop
    checkout develop
    commit
    branch feature-user
    checkout feature-user
    commit
    commit
    commit
    checkout develop
    merge feature-user
    commit
    branch release-v1
    checkout release-v1
    commit
    commit
    checkout main
    merge release-v1
    commit tag: "v1.0"
    checkout develop
    merge release-v1
    branch hotfix
    checkout hotfix
    commit
    checkout main
    merge hotfix
    commit tag: "v1.0.1"
    checkout develop
    merge hotfix
```

## Collaborative Development

```mermaid
gitGraph
    commit
    commit
    branch alice-feature
    checkout alice-feature
    commit
    commit
    checkout main
    branch bob-feature
    checkout bob-feature
    commit
    commit
    checkout alice-feature
    commit
    commit
    checkout main
    merge alice-feature
    commit
    checkout bob-feature
    merge main
    commit
    commit
    checkout main
    merge bob-feature
    commit tag: "v2.0"
```

## Release and Hotfix Flow

```mermaid
gitGraph
    commit tag: "v1.0"
    commit
    branch develop
    checkout develop
    commit
    branch feature-analytics
    checkout feature-analytics
    commit
    commit
    checkout develop
    branch feature-notifications
    checkout feature-notifications
    commit
    checkout main
    branch hotfix-v1-0-1
    checkout hotfix-v1-0-1
    commit
    checkout main
    merge hotfix-v1-0-1
    commit tag: "v1.0.1"
    checkout develop
    merge hotfix-v1-0-1
    checkout feature-analytics
    merge develop
    commit
    commit
    checkout develop
    merge feature-analytics
    checkout feature-notifications
    commit
    checkout develop
    merge feature-notifications
    commit
    checkout main
    merge develop
    commit tag: "v1.1"
```

## Simple Example with Title

```mermaid
---
title: Example Git diagram
---
gitGraph
   commit
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop
   commit
   commit
```