---
id: databases-specialty-databases
title: "Purpose-built databases: DocumentDB, Neptune, Timestream and QLDB"
required: false
videoQuery: Amazon DocumentDB Neptune Timestream QLDB purpose-built databases explained
---
## One size does not fit all

AWS offers **purpose-built databases**, each designed around one data model. Earlier lessons covered relational (RDS, Aurora), key-value (DynamoDB), in-memory (ElastiCache, MemoryDB) and warehouse (Redshift) services. This lesson adds four more, and points back to **Amazon Keyspaces** (Cassandra-compatible, wide-column) and **AWS DMS** (database migration) in the earlier "specialized and migration" lesson.

## Amazon DocumentDB (with MongoDB compatibility)

**Amazon DocumentDB** is a fully managed **document database** for JSON-like data. It is **compatible with MongoDB**, so applications keep using the same drivers and tools. It is a separate AWS service, not MongoDB itself.

- Its storage keeps **six copies of the data across three Availability Zones** and grows automatically.
- A cluster has a primary instance and up to **15 replicas** that share the storage; automatic failover goes to a replica.
- Continuous backups allow point-in-time restore for up to 35 days.
- Typical uses: content management, catalogs and user profiles where each record is a flexible document.

## Amazon Neptune

**Amazon Neptune** is a fully managed **graph database** for **highly connected data**. It stores billions of relationships and queries them in milliseconds, using the graph languages **Gremlin**, **openCypher** and **SPARQL**.

- Typical uses: **fraud detection**, recommendation engines, knowledge graphs and network security.
- It also has up to 15 read replicas and replication across Availability Zones.
- Clue words: "relationships", "connections between people or accounts", "friends of friends", "fraud rings".

Relational joins over deep relationships get slow and complicated; a graph database is built for exactly that question.

## Amazon Timestream

**Amazon Timestream** is a purpose-built **time series database** for data points indexed by time, such as IoT sensor readings, application metrics and industrial telemetry.

- Timestream for LiveAnalytics is **serverless**, keeps recent data in a memory store and older data in a cheaper magnetic store, and offers SQL with built-in time series functions.
- Status: AWS **closed Timestream for LiveAnalytics to new customers on June 20, 2025**; existing workloads are not affected, and AWS recommends that new customers evaluate **Amazon Timestream for InfluxDB**. Exam wording still says simply "Amazon Timestream" for time series data.

## Amazon QLDB (Amazon Quantum Ledger Database)

**Amazon QLDB** is a **ledger database**: a fully managed, serverless database whose **transaction log (journal) is immutable and cryptographically verifiable**, so records cannot be silently changed or deleted. It was designed for systems of record that need a complete, trustworthy history of every change.

- Status: The AWS General Reference lists QLDB in [Services in Full Shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html) with end of support on July 31, 2025, and AWS published guidance for migrating a QLDB ledger to **Amazon Aurora PostgreSQL**. That date has passed, so do not plan new designs around QLDB. Exam questions may still describe a "ledger database" or "immutable, verifiable history" and expect QLDB as the concept.

## Which database for which workload?

| Workload | Service |
| --- | --- |
| Relational data, joins, ACID transactions | Amazon RDS or Amazon Aurora |
| Key-value or document at massive scale, single-digit millisecond | Amazon DynamoDB |
| MongoDB-compatible JSON documents | Amazon DocumentDB |
| Highly connected data, relationships, fraud detection | Amazon Neptune |
| Time series: IoT, metrics, telemetry | Amazon Timestream |
| Immutable, verifiable record of changes (ledger) | Amazon QLDB (end of support passed; see status) |
| Cassandra-compatible wide-column | Amazon Keyspaces |
| Caching or durable in-memory data | Amazon ElastiCache, Amazon MemoryDB |
| Analytics over large historical data | Amazon Redshift |

## Common traps

- Graph questions point to Neptune, even though Aurora or DynamoDB could store relationship data less naturally.
- "MongoDB-compatible" is **DocumentDB**; DynamoDB is also a document store but is not MongoDB-compatible.
- "Time series" is **Timestream**, not Forecast (a machine learning service) or a relational database.

## Key points

- DocumentDB = MongoDB-compatible documents; Neptune = graph; Timestream = time series; QLDB = immutable ledger.
- DocumentDB and Neptune use shared storage across AZs with up to 15 replicas.
- Timestream for LiveAnalytics is closed to new customers (InfluxDB is the alternative); QLDB reached end of support on July 31, 2025.
- Match the data model to the service; clue words in the question usually name it.

## Sources

- [What is Amazon DocumentDB (with MongoDB compatibility)?](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html)
- [What is Amazon Neptune?](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html)
- [Amazon Timestream for LiveAnalytics availability change](https://docs.aws.amazon.com/timestream/latest/developerguide/AmazonTimestreamForLiveAnalytics-availability-change.html)
