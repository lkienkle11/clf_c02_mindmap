---
id: databases-dynamodb-elasticache
title: "NoSQL and in-memory: Amazon DynamoDB and Amazon ElastiCache"
required: true
videoQuery: Amazon DynamoDB on-demand vs provisioned DAX global tables and ElastiCache explained
---
## Amazon DynamoDB

**Amazon DynamoDB** is a **serverless, fully managed NoSQL database**. It supports **key-value and document** data and delivers **single-digit millisecond** performance at any scale.

- **Serverless**: there are no servers to provision, patch or manage, and no maintenance windows.
- You create **tables**; each item is found by its **primary key**. DynamoDB has no SQL joins, so you design the data around how the application reads it.
- Data is **replicated across three Availability Zones** in a Region by default, and it is **encrypted at rest** by default.
- **Point-in-time recovery** and **on-demand backups** protect against mistakes such as accidental deletes.

## Capacity modes

| Mode | How you pay | Best for |
| --- | --- | --- |
| On-demand (default) | Per read and write request | New, spiky or unpredictable traffic; no capacity planning |
| Provisioned | For the reads and writes per second you set, used or not | Steady, predictable traffic where you can forecast capacity |

AWS recommends **on-demand** for most workloads. Provisioned mode can be combined with auto scaling.

## DAX and global tables

- **DynamoDB Accelerator (DAX)** is a fully managed **in-memory cache built for DynamoDB**. It cuts read response times from milliseconds to **microseconds** without you managing cache logic.
- **Global tables** replicate a table across the Regions you choose. Every replica accepts **reads and writes** (multi-active), which gives local performance for users worldwide and Regional resilience.

## Amazon ElastiCache

**Amazon ElastiCache** is a managed **in-memory data store and cache**. It works with the **Valkey, Redis OSS and Memcached** engines. Common uses:

- **Caching** frequent database query results to reduce load on the database and speed up reads.
- Storing **user sessions**, leaderboards and other data that needs very fast access.

You can run it **serverless** (ElastiCache scales capacity for you) or as **node-based clusters** where you pick node types and counts. AWS handles hardware provisioning, monitoring, node replacement and software patching.

A cache sits **next to** a database; it is not usually the system of record. For a durable in-memory primary database, AWS offers **Amazon MemoryDB**.

## Common traps

- "Serverless NoSQL, single-digit millisecond, any scale" means **DynamoDB**.
- "Microsecond reads for a DynamoDB table" means **DAX**; "cache for an RDS database" means **ElastiCache**.
- "Users in several Regions must write to the same table" means **DynamoDB global tables**.
- "Unpredictable traffic, no capacity planning" means **on-demand** capacity.

## Key points

- DynamoDB: serverless key-value and document database with consistent fast performance.
- On-demand is the default and fits unknown traffic; provisioned fits steady traffic.
- DAX caches DynamoDB; global tables replicate across Regions.
- ElastiCache (Valkey, Redis OSS, Memcached) caches data in memory to offload databases.

## Sources

- [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [DynamoDB throughput capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html)
- [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
