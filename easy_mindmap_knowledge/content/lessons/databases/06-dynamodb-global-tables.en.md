---
id: databases-dynamodb-global-tables
title: "DynamoDB in depth: capacity modes, global tables, DAX, TTL and backups"
required: true
videoQuery: Amazon DynamoDB global tables DAX TTL on-demand vs provisioned explained
---
## Where DynamoDB fits

**Amazon DynamoDB** is a fully managed, **serverless NoSQL** database for **key-value and document** data. Response times are typically **single-digit milliseconds**, at almost any scale. There is no server, operating system or database software for you to patch, and no maintenance window. Data is stored across **three Availability Zones** in a Region.

You model data as **tables** of **items** (similar to rows) that are found by a **primary key** (a partition key, optionally combined with a sort key). Items in one table do not need identical attributes, which is why DynamoDB suits shopping carts, session data, game state, IoT events and any workload with simple, high-volume access by key. It does not support SQL joins, so design the table around the questions your application asks.

## Capacity modes

The **capacity mode** decides how you are billed for reads and writes.

| | On-demand | Provisioned |
| --- | --- | --- |
| You specify | Nothing; no capacity planning | Reads and writes per second you need |
| You pay | Per read and write request | Hourly for the capacity you provisioned, used or not |
| Fits | New, spiky or unpredictable traffic | Steady, predictable traffic where cost predictability matters |

AWS describes on-demand as the default and recommended choice for most workloads, and it scales from small to millions of requests per second. An exam clue such as "traffic is unpredictable and the team does not want to plan capacity" points to **on-demand**. "Steady, forecastable load, cost control" points to **provisioned**.

## Global tables

**DynamoDB global tables** replicate a table automatically across the **AWS Regions you choose**. They are **multi-Region and multi-active**: every replica can serve **both reads and writes**, so users read and write in their nearest Region, and if one Region is interrupted the application can shift traffic to another. You use the normal DynamoDB APIs, so the application needs no special code.

- By default the replicas are **eventually consistent** with each other (multi-Region eventual consistency). A strong-consistency mode also exists; you choose the mode when you create the table and cannot change it later.
- If two Regions update the same item at nearly the same time, **last writer wins**.
- You pay for the capacity you use, with no upfront commitment.

Do not confuse this with **Aurora Global Database**, where one Region accepts writes and the others are read-only.

## DynamoDB Accelerator (DAX)

**DAX** is a fully managed, in-memory cache **built for DynamoDB**. It is API-compatible, so an application needs only minimal changes to use it, and it can cut read times from single-digit milliseconds to **microseconds**. It helps with read-heavy workloads, repeated reads of the same "hot" items, and read-heavy applications that want to avoid buying more read capacity.

DAX is **not** a fit for applications that need **strongly consistent reads**, are **write-intensive**, or do not read the same data repeatedly. For a cache in front of RDS or another database, use **ElastiCache** instead; DAX works only with DynamoDB.

## Time to Live (TTL)

**TTL** lets you give each item an expiry timestamp (a number in Unix epoch seconds, stored in an attribute you choose). DynamoDB deletes expired items automatically, typically within a few days of expiry, and the deletion does **not consume write capacity**. Use it for sessions, temporary tokens, logs and anything that should disappear over time to keep storage cost down.

## Backups and recovery

- **Point-in-time recovery (PITR)** keeps continuous backups with per-second recovery points for up to **35 days**. You restore to a **new table**, which protects against accidental writes or deletes.
- **On-demand backups** are full backups you take when you want, for example before a risky change.

## Shared responsibility

AWS runs the infrastructure, the software and the replication. DynamoDB **encrypts all data at rest** and you can choose the key type (AWS owned key by default, or keys in AWS KMS). You are responsible for **who can access the tables** (IAM permissions), the table design, the capacity mode and enabling features such as PITR.

## Common traps

- "Serverless NoSQL with single-digit millisecond latency at any scale" is **DynamoDB**.
- "Microsecond reads for DynamoDB" is **DAX**; "cache for RDS" is **ElastiCache**.
- "Users in several Regions must write to the same table" is **global tables**.
- "Automatically delete old items" is **TTL**; "recover from an accidental delete" is **PITR**.

## Key points

- DynamoDB is serverless key-value and document storage; on-demand is the default, provisioned suits steady traffic.
- Global tables are multi-Region and multi-active, with reads and writes in every replica.
- DAX is DynamoDB-only caching with microsecond reads; TTL expires items for free; PITR restores to any second in the last 35 days.
- You manage access and design; AWS manages servers, patching and encryption at rest.

## Sources

- [DynamoDB throughput capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html)
- [Global tables: multi-active, multi-Region replication](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html)
- [In-memory acceleration with DynamoDB Accelerator (DAX)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html)
