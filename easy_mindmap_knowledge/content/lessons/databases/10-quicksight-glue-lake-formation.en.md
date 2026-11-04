---
id: databases-quicksight-glue-lake-formation
title: "Preparing, governing and visualizing data: AWS Glue, AWS Lake Formation and Amazon QuickSight"
required: false
videoQuery: AWS Glue vs Lake Formation vs QuickSight data lake analytics pipeline explained
---
## Where these services sit

Raw data rarely arrives ready to analyze. A typical analytics pipeline on AWS looks like this:

1. **Store** raw data in **Amazon S3**, often as a **data lake**: one central place for structured and unstructured data.
2. **Prepare and catalog** it with **AWS Glue**.
3. **Secure and govern** it with **AWS Lake Formation**.
4. **Query** it with Amazon Athena, Amazon Redshift or Amazon EMR (previous lesson).
5. **Visualize** the results with **Amazon QuickSight**.

## AWS Glue

**AWS Glue** is a **serverless data integration service**. It discovers, prepares, moves and combines data from many sources for analytics, machine learning and application development, with no infrastructure to manage and pay-as-you-go billing.

- **ETL (extract, transform, load)**: Glue jobs read data, clean and reshape it, and write it to a target such as an S3 data lake. Jobs can run on a schedule, on demand or on an event. **AWS Glue Studio** is the graphical interface for building and monitoring jobs visually.
- **AWS Glue Data Catalog**: a central metadata store that records where data lives and what its tables and columns look like.
- **Crawlers**: scan a data store such as S3, infer the schema and add tables to the Data Catalog automatically.
- **AWS Glue DataBrew** is a related no-code tool for cleaning and normalizing data.

Athena, EMR and Redshift Spectrum can query tables registered in the Data Catalog. Glue transforms data for analytics; it is not the service that migrates a live database (that is AWS DMS).

## AWS Lake Formation

**AWS Lake Formation** helps you build, centrally **govern and secure** a data lake. It manages fine-grained access to data in S3 and to its metadata in the Glue Data Catalog.

- Permissions are granted much like in a relational database (grant and revoke) and can restrict access down to **column, row and cell** level.
- The same rules are enforced across Athena, Amazon QuickSight, Redshift Spectrum, EMR and Glue, so you define them once.
- It can load data from databases such as those running in Amazon RDS, supports cross-account sharing, and records access in AWS CloudTrail logs for auditing.

Lake Formation does not replace S3. S3 holds the data; Lake Formation decides who may see which parts of it.

## Amazon QuickSight

**Amazon QuickSight** is AWS's **business intelligence** service: connect to data sources, build interactive **dashboards** and visualizations, and embed analytics in applications.

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine) is QuickSight's in-memory engine. When you import data into SPICE instead of running a direct query, analysis runs faster and the data can be reused without querying the source again.
- Status note: AWS documentation now describes **Amazon Quick**, an AI-powered service that evolved from QuickSight; **Amazon Quick Sight** continues as a feature inside it, and existing QuickSight APIs and integrations keep working. Exam wording still says **Amazon QuickSight**.
- QuickSight integrates with Athena, so query results become charts easily. It visualizes data; it does not replace the warehouse or the query engine.

## Which service does what?

| Need | Service |
| --- | --- |
| Clean and transform data (ETL), catalog it, crawl S3 for schemas | AWS Glue |
| Centrally control who sees which columns and rows of a data lake | AWS Lake Formation |
| Run SQL on S3 data | Amazon Athena |
| Dashboards and reports for business users | Amazon QuickSight |

## Common traps

- "Build visual dashboards for business users" is **QuickSight**, not Redshift.
- "Serverless ETL" or "discover the schema of data in S3" is **Glue**.
- "Fine-grained permissions on a data lake" is **Lake Formation**, not only IAM.

## Key points

- Glue = serverless ETL, Data Catalog and crawlers.
- Lake Formation = central, fine-grained governance of a data lake (column, row and cell level).
- QuickSight = BI dashboards, with SPICE for fast in-memory analysis; part of Amazon Quick today.
- Together: S3 stores, Glue prepares, Lake Formation secures, Athena or Redshift queries, QuickSight shows.

## Sources

- [What is Amazon Quick?](https://docs.aws.amazon.com/quicksight/latest/user/welcome.html)
- [What is AWS Glue?](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html)
- [What is AWS Lake Formation?](https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html)
