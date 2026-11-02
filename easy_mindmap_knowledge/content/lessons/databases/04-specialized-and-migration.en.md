---
id: databases-specialized-migration
title: "Data warehouse, purpose-built databases and database migration"
required: true
videoQuery: Amazon Redshift DocumentDB Neptune and AWS Database Migration Service explained
---
## Amazon Redshift: the data warehouse

**Amazon Redshift** is a fully managed, petabyte-scale **data warehouse**. It runs **SQL analytics (OLAP)** over large amounts of data, often loaded from many sources, and works with business intelligence tools. **Redshift Serverless** scales capacity automatically, and you do not pay while it is idle.

Redshift is not a replacement for an application's transactional database. If the question says "analyze years of sales data" or "business reports across many sources", think Redshift. If it says "store each customer order as it happens", think RDS, Aurora or DynamoDB.

## Other purpose-built databases

- **Amazon DocumentDB (with MongoDB compatibility)**: a managed **document** database for JSON-like data. Teams can keep using MongoDB drivers and tools. Typical use: content and product catalogs, user profiles.
- **Amazon Neptune**: a managed **graph** database for highly connected data. It answers questions about relationships, such as "friends of friends" in a social network, fraud rings, recommendations and knowledge graphs.
- **Amazon Timestream**: **time series** data, such as IoT sensor readings and application metrics. Note that Timestream for LiveAnalytics stopped accepting new customers in June 2025; AWS points new users to **Timestream for InfluxDB**.
- **Amazon Keyspaces (for Apache Cassandra)**: a managed **wide-column** database for Cassandra workloads.

## Which database for this scenario?

| Scenario clue | Service |
| --- | --- |
| Relational, joins, familiar engine such as SQL Server or Oracle | Amazon RDS |
| MySQL or PostgreSQL compatible, high availability built into storage | Amazon Aurora |
| Serverless key-value, any scale, single-digit millisecond | Amazon DynamoDB |
| In-memory cache to speed up reads | Amazon ElastiCache |
| Analytics and reporting over large data sets | Amazon Redshift |
| MongoDB compatible JSON documents | Amazon DocumentDB |
| Relationships and connected data | Amazon Neptune |

## Moving databases to AWS

- **AWS Database Migration Service (AWS DMS)** moves data from a source database to a target on AWS. The **source stays fully operational** during the migration, which keeps downtime low. DMS can do a one-time load or **keep replicating ongoing changes** until you switch over. It supports **homogeneous** migrations (Oracle to Oracle) and **heterogeneous** ones (Oracle to Aurora PostgreSQL).
- For heterogeneous migrations, the **schema and code** (tables, views, stored procedures) must be converted first. **DMS Schema Conversion** does this inside DMS, and the downloadable **AWS Schema Conversion Tool (AWS SCT)** does the same on your own computer.

## Common traps

- "Convert the schema from one engine to another" is **SCT or DMS Schema Conversion**; "move the data" is **DMS**.
- "Data warehouse" is always **Redshift**, not RDS.

## Key points

- Redshift = OLAP data warehouse; RDS, Aurora and DynamoDB = OLTP.
- DocumentDB = documents, Neptune = graphs, Timestream = time series, Keyspaces = Cassandra.
- DMS migrates data with minimal downtime; SCT or DMS Schema Conversion converts schemas.

## Sources

- [What is Amazon Redshift?](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)
- [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)
- [What is AWS Database Migration Service?](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
