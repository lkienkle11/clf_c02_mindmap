---
id: databases-elasticache-in-depth
title: "Amazon ElastiCache in depth: engines, caching patterns, session stores and MemoryDB"
required: true
videoQuery: Amazon ElastiCache Valkey Redis OSS vs Memcached caching strategies and MemoryDB explained
---
## Why add a cache

Databases read from disk-based storage, and the same popular data is often requested again and again. **Amazon ElastiCache** is a managed **in-memory data store and cache**. Keeping hot data in memory answers repeat requests faster and takes load off the database behind it.

ElastiCache works with three open-source engines: **Valkey**, **Redis OSS** and **Memcached**. Older material and exam wording often say "ElastiCache for Redis"; the current documentation names the engines Redis OSS and Valkey.

## Serverless or node-based

| | ElastiCache Serverless | Node-based cluster |
| --- | --- | --- |
| Setup | Name the cache; no instances or nodes to plan | You choose node type, number of nodes and AZ placement |
| Capacity | ElastiCache watches memory, compute and network use and scales for you | You size it correctly and resize when needs change |
| Engines | Valkey, Memcached, Redis OSS | Valkey, Memcached, Redis OSS |
| Fits | Quick start, changing demand | Fine-grained control, for example when to apply patches |

In both cases AWS handles hardware provisioning, monitoring, replacing failed nodes and software patching. You choose the engine, the sizing (for node-based clusters), network access and the application logic that uses the cache.

## Choosing an engine

| | Memcached | Valkey or Redis OSS |
| --- | --- | --- |
| Data types | Simple (strings, objects) | Rich: strings, lists, sets, sorted sets, hashes and more |
| Replication and failover | No | Yes (automatic failover optional or required, depending on mode) |
| Backup and restore (node-based) | No | Yes |
| Multi-threaded | Yes | No |
| Pub/Sub, sorted sets | No | Yes |
| Typical choice | Simplest possible object cache that scales by adding nodes | Caches that need replicas, backups, leaderboards or messaging |

A simple rule: if the question stresses the **simplest** cache or multi-core nodes, think Memcached. If it needs **replicas, backups or richer data structures**, think Valkey or Redis OSS.

## Caching patterns

- **Lazy loading**: the application asks the cache first. On a **cache hit** it gets the data fast. On a **cache miss** it reads the database, then writes the result to the cache. Only requested data is cached, but data can become stale and the first request is slower.
- **Write-through**: every database write also updates the cache, so cached data stays current, but you cache data that may never be read.
- **TTL (time to live)**: give each cached key an expiry so stale or unused data ages out. Combining lazy loading or write-through with a TTL is common.

## Typical uses

- **Database offloading**: cache the results of frequent or expensive queries for RDS, Aurora or other databases.
- **Session store**: keep user sessions in a shared cache so any web server behind a load balancer can serve any user. A TTL ends idle sessions.
- **Leaderboards, counters and real-time data** that need very fast reads and writes.

## ElastiCache, DAX and the database itself

| Need | Choose |
| --- | --- |
| Cache in front of RDS, Aurora or any database | ElastiCache |
| Microsecond reads specifically for DynamoDB, with minimal code change | DynamoDB Accelerator (DAX) |
| Durable primary database with in-memory speed | Amazon MemoryDB |
| System of record that scales to very high request rates | DynamoDB or a relational database |

A cache usually sits **next to** a database. If a question asks for the *data store* that must scale to millions of requests per second, the better answer is DynamoDB, not a cache.

## Amazon MemoryDB

**Amazon MemoryDB** is a durable, in-memory database compatible with Valkey and Redis OSS. It stores all data in memory for microsecond reads and single-digit millisecond writes, and it keeps data durably across several AZs with a Multi-AZ transactional log. That durability is why it can be a **primary database** with no separate cache and database to manage. If the question says "durable" and "primary", it is MemoryDB; if it says "cache", it is ElastiCache. (Node-based ElastiCache for Valkey 9.0 and later can optionally enable [durability](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Durability.Options.html) with a Multi-AZ transactional log, but the exam rule stays the same.)

## Common traps

- "Reduce load on an RDS database by caching frequent reads" is **ElastiCache**.
- A cache holds a copy: expect it to be refreshed or expire, and the database remains the source of truth.
- ElastiCache needs **application changes** (the app must check the cache); DAX needs only minimal ones but works only for DynamoDB.

## Key points

- ElastiCache is a managed in-memory cache with Valkey, Redis OSS and Memcached, in serverless or node-based form.
- Memcached is simple and multi-threaded; Valkey and Redis OSS add replicas, backups and rich data types.
- Lazy loading, write-through and TTL are the core caching patterns; session stores and query offloading are classic uses.
- MemoryDB is the durable in-memory primary database; DAX is the DynamoDB-only cache.

## Sources

- [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
- [Comparing node-based Valkey, Memcached, and Redis OSS clusters](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html)
- [What is Amazon MemoryDB?](https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html)
