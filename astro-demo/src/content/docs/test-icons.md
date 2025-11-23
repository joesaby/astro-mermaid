---
title: Test Icon Packs
description: Testing the new iconPacks feature
---

# Icon Pack Test

This page tests the new iconPacks feature.

## Architecture Diagram with Icons

```mermaid
architecture-beta
  group api(logos:aws-lambda)[API]

  service db(logos:postgresql)[Database] in api
  service disk1(logos:aws-s3)[Storage] in api
  service disk2(logos:cloudflare)[CDN] in api
  service server(logos:docker)[Server] in api

  db:L -- R:server
  disk1:T -- B:server
  disk2:T -- B:db
```

## Architecture with Iconoir Icons

```mermaid
architecture-beta
  group host(iconoir:laptop)[Host]

  service client1(iconoir:app-window)[Client] in host
  service server1(iconoir:server)[Server]
  service tool1(iconoir:tools)[Tool]
  client1:B -- T:server1
  server1:B -- T:tool1
  
  service client2(iconoir:app-window)[Client] in host
  service server2(iconoir:server)[Server]
  service tool2(iconoir:tools)[Tool]
  service db2(iconoir:database)[RAG]
  client2:B -- T:server2
  server2:B -- T:tool2
  server2:R -- L:db2
```

## Custom Icon Test (Direct Data)

```mermaid
mindmap
  root((Icon Test))
    Custom Icon
      ::icon(test:circle)
```