---
id: databases-analytics-redshift-emr-athena
title: "Analytics services compared: Amazon Redshift, Amazon EMR and Amazon Athena"
required: true
videoQuery: Amazon Redshift vs Athena vs EMR which analytics service explained
---
## From transactions to analytics

Application databases such as RDS, Aurora and DynamoDB handle **OLTP**: many small reads and writes, like placing an order. **Analytics** (OLAP) asks different questions: totals, trends and comparisons across millions of rows and years of history. Three AWS services come up again and again when the question is "which one analyzes this data?". They overlap in places, so the exam tests what each one is *best* at.

## Amazon Redshift: the data warehouse

**Amazon Redshift** is a fully managed, **petabyte-scale data warehouse**. It is a relational database tuned for analytic queries, reached with **SQL** from BI and reporting tools. It achieves speed by combining **massively parallel processing**, **columnar storage** (data stored by column, so a query reads only the columns it needs) and compression.

- A warehouse brings data together from many sources, such as inventory, finance and sales systems, in a common format and keeps it for a long time.
- It excels at **complex queries that join many large tables**.
- You can run a **provisioned cluster** or **Redshift Serverless**, which provisions and scales capacity automatically and does not charge for compute while idle (managed storage is still billed).
- **Redshift Spectrum** lets Redshift query files in Amazon S3 without loading them into tables.

Redshift is **not** the database behind a live application. It is where you analyze data, not where each customer order is first recorded.

## Amazon EMR: big data frameworks

**Amazon EMR** (previously called Amazon Elastic MapReduce) is a managed platform for running big data frameworks such as **Apache Hadoop** and **Apache Spark**, plus tools such as Hive, Presto and HBase, on clusters of EC2 instances that AWS configures for you. EMR also offers a serverless option.

- Choose EMR when you have **custom code** and extremely large data sets, or need the latest open-source processing frameworks, machine learning, graph analytics or data transformation at scale.
- You control cluster configuration and installed software, and you can resize clusters, mix On-Demand and Spot Instances, and keep data in S3 so the cluster can be shut down when the job finishes.
- Pricing depends on the instance type and number of EC2 instances and the Region.

EMR is the most flexible and the most hands-on of the three.

## Amazon Athena: SQL directly on S3

**Amazon Athena** is a **serverless, interactive query service**. You point it at data in **Amazon S3** (CSV, JSON, or columnar formats such as Parquet and ORC), define a table, and run **standard SQL** with no cluster to create and no data to load. It integrates with the AWS Glue Data Catalog for table definitions.

- Ideal for **ad hoc queries**, such as searching web or application logs stored in S3 to troubleshoot a problem.
- You pay for the amount of data each query **scans**. Compressing data and using columnar formats such as Parquet reduces the scan and therefore the cost.

## Which analytics service?

| Clue in the question | Service |
| --- | --- |
| Data warehouse; combine data from many sources; complex joins over history; BI reports | Amazon Redshift |
| Ad hoc SQL on files in S3; no servers or loading; pay per query | Amazon Athena |
| Hadoop, Spark or other frameworks; custom code on huge data sets; control of the cluster | Amazon EMR |
| Live application database (OLTP) | RDS, Aurora or DynamoDB, not these three |

| | Redshift | Athena | EMR |
| --- | --- | --- | --- |
| Infrastructure | Provisioned cluster or Serverless | Serverless | Cluster you configure (or serverless) |
| Where the data lives | Loaded into the warehouse (plus S3 through Spectrum) | Stays in S3 | S3 or the cluster's own file system |
| You write | SQL | SQL | Code and jobs (Spark, Hadoop and so on) |

The services also work together: Athena can query data that EMR has processed, and Redshift Spectrum can query the same S3 data.

## Common traps

- "Petabyte-scale data warehouse without managing hardware" is **Redshift** (serverless if the wording stresses no infrastructure).
- "Query data in S3 using SQL without loading it" is **Athena**, not Redshift.
- "Run a Spark or Hadoop job" is **EMR**.
- Athena and EMR appear as wrong answers in questions about a managed PostgreSQL OLTP database; they are analytics tools.

## Key points

- Redshift = SQL data warehouse for OLAP over large, consolidated data; columnar and massively parallel.
- Athena = serverless SQL over S3, pay per data scanned.
- EMR = managed Hadoop, Spark and related frameworks for custom big data processing.
- Analytics services analyze data; they do not replace the application's transactional database.

## Sources

- [Amazon Redshift architecture](https://docs.aws.amazon.com/redshift/latest/dg/c_redshift_system_overview.html)
- [When should I use Athena?](https://docs.aws.amazon.com/athena/latest/ug/when-should-i-use-ate.html)
- [What is Amazon EMR?](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html)
