---
title: Git Graphs
description: Examples of Git graphs using Mermaid
---

Git graphs visualize the branching and merging in a Git repository.

## Basic Git Flow

```mermaid
gitgraph
    commit id: "Initial commit"
    commit id: "Add README"
    branch develop
    checkout develop
    commit id: "Setup project structure"
    commit id: "Add core features"
    checkout main
    merge develop
    commit id: "Release v1.0"
```

## Feature Branch Workflow

```mermaid
gitgraph
    commit id: "Initial setup"
    commit id: "Basic structure"
    
    branch feature/auth
    checkout feature/auth
    commit id: "Add login form"
    commit id: "Implement auth logic"
    commit id: "Add tests"
    
    checkout main
    commit id: "Fix typo in README"
    
    merge feature/auth
    commit id: "Merge auth feature"
    
    branch feature/dashboard
    checkout feature/dashboard
    commit id: "Create dashboard layout"
    commit id: "Add charts"
    
    checkout main
    commit id: "Update dependencies"
    
    checkout feature/dashboard
    merge main
    commit id: "Resolve conflicts"
    commit id: "Finish dashboard"
    
    checkout main
    merge feature/dashboard
    commit id: "Release v1.1"
```

## Gitflow Workflow

```mermaid
gitgraph
    commit id: "Initial commit"
    
    branch develop
    checkout develop
    commit id: "Setup dev environment"
    
    branch feature/user-mgmt
    checkout feature/user-mgmt
    commit id: "User model"
    commit id: "User controller"
    commit id: "User tests"
    
    checkout develop
    merge feature/user-mgmt
    commit id: "Integrate user management"
    
    branch release/v1.0
    checkout release/v1.0
    commit id: "Bump version to 1.0"
    commit id: "Update changelog"
    
    checkout main
    merge release/v1.0
    commit id: "Release 1.0"
    
    checkout develop
    merge release/v1.0
    
    branch hotfix/critical-bug
    checkout hotfix/critical-bug
    commit id: "Fix critical security issue"
    
    checkout main
    merge hotfix/critical-bug
    commit id: "Hotfix 1.0.1"
    
    checkout develop
    merge hotfix/critical-bug
```

## Collaborative Development

```mermaid
gitgraph
    commit id: "Project start"
    commit id: "Setup CI/CD"
    
    branch alice/feature-a
    checkout alice/feature-a
    commit id: "Alice: Start feature A"
    commit id: "Alice: Implement core logic"
    
    checkout main
    branch bob/feature-b
    checkout bob/feature-b
    commit id: "Bob: Start feature B"
    commit id: "Bob: Add UI components"
    
    checkout alice/feature-a
    commit id: "Alice: Add tests"
    commit id: "Alice: Code review fixes"
    
    checkout main
    merge alice/feature-a
    commit id: "Merge feature A"
    
    checkout bob/feature-b
    merge main
    commit id: "Bob: Sync with main"
    commit id: "Bob: Finish feature B"
    
    checkout main
    merge bob/feature-b
    commit id: "Merge feature B"
    
    commit id: "Release v2.0"
```

## Release and Hotfix Flow

```mermaid
gitgraph
    commit id: "v1.0 Release"
    commit id: "Post-release cleanup"
    
    branch develop
    checkout develop
    commit id: "Start v1.1 development"
    
    branch feature/analytics
    checkout feature/analytics
    commit id: "Analytics setup"
    commit id: "Event tracking"
    
    checkout develop
    branch feature/notifications
    checkout feature/notifications
    commit id: "Notification system"
    
    checkout main
    branch hotfix/v1.0.1
    checkout hotfix/v1.0.1
    commit id: "Fix login bug"
    
    checkout main
    merge hotfix/v1.0.1
    commit id: "v1.0.1 Hotfix"
    
    checkout develop
    merge hotfix/v1.0.1
    
    checkout feature/analytics
    merge develop
    commit id: "Sync analytics branch"
    commit id: "Complete analytics"
    
    checkout develop
    merge feature/analytics
    
    checkout feature/notifications
    commit id: "Complete notifications"
    
    checkout develop
    merge feature/notifications
    commit id: "Prepare v1.1"
    
    checkout main
    merge develop
    commit id: "v1.1 Release"
```

## Cherry-pick Example

```mermaid
gitgraph
    commit id: "Base commit"
    
    branch experimental
    checkout experimental
    commit id: "Experiment 1"
    commit id: "Experiment 2"
    commit id: "Bug fix" type: HIGHLIGHT
    commit id: "Experiment 3"
    
    checkout main
    commit id: "Regular development"
    cherry-pick id: "Bug fix"
    commit id: "Continue main development"
    
    checkout experimental
    commit id: "More experiments"
```