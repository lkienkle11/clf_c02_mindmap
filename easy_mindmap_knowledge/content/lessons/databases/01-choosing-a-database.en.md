---
id: databases-choosing
title: "Choosing a database: relational or non-relational, managed or self-managed"
required: true
videoQuery: AWS databases overview relational vs NoSQL managed vs self-managed Cloud Practitioner
---
## Two big families

Most exam questions about databases start with one decision: what shape is the data, and how will it be read?

- **Relational (SQL) databases** store data in **tables with a fixed schema** (rows and columns). Tables are linked by keys, and you can **join** them in complex queries. They support **ACID transactions**, so a group of changes succeeds or fails as one. Good fit: orders, billing, inventory, ERP and CRM systems.
- **Non-relational (NoSQL) databases** are built for a **specific data model**, such as key-value, document, graph or time series. The schema is flexible, and they are designed to scale out to very high request rates. Some, such as DynamoDB, also support ACID transactions, but not joins. Good fit: shopping carts, user sessions, game state, product catalogs, social graphs.

AWS calls this idea **purpose-built databases**: pick the engine whose data model matches the job.

## OLTP and OLAP

- **OLTP** (online transaction processing): many small reads and writes from an application, such as placing an order. Relational and NoSQL operational databases serve OLTP.
- **OLAP** (online analytical processing): large queries over lots of historical data for reports and business intelligence. On AWS this is the job of a **data warehouse**, Amazon Redshift.

## Self-managed on EC2 or a managed service

You can install any database engine yourself on an **EC2 instance**. You get full control, including the operating system, but you also carry the work. AWS recommends a managed service such as **Amazon RDS** as the default for most relational workloads.

| Task | Database on EC2 | Amazon RDS |
| --- | --- | --- |
| Hardware, power, network | AWS | AWS |
| OS install and patching | Customer | AWS |
| Database software install and patching | Customer | AWS |
| Backups and high availability | Customer | AWS |
| Scaling | Customer | AWS |
| Query tuning and schema design | Customer | Customer |

Choose EC2 when you need something a managed service does not offer, such as an unsupported engine or version, or operating system access. Otherwise a managed service removes **undifferentiated heavy lifting**.

## Common traps

- "Needs joins and complex SQL queries across tables" points to a **relational** service (RDS or Aurora).
- "Massive scale with simple key lookups and single-digit millisecond latency" points to **DynamoDB**.
- "Full control of the operating system" or "custom database software" points to **a database on EC2**.
- Even with a managed database, **you** still design the schema, tune queries and control who can access the data.

## Key points

- Relational = tables, fixed schema, joins, transactions. NoSQL = flexible, purpose-built data models, no joins (some, like DynamoDB, still offer transactions).
- OLTP serves applications; OLAP (Redshift) serves analytics.
- Managed services take over OS and database patching, backups, availability and scaling.
- Self-managing on EC2 gives control but keeps all database operations with you.

## Sources

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)
