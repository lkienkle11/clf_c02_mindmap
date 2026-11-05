---
id: support-ai-other-other-services
title: "Other services on the exam: integration, analytics, end-user computing and business applications"
required: true
videoQuery: AWS SQS vs SNS vs EventBridge Athena Glue Kinesis WorkSpaces Amazon Connect explained
---
## Application integration: decoupling

In a **decoupled** (loosely coupled) design, parts of an application talk through a managed service instead of calling each other directly. If one part slows down or fails, the others keep working, and each part scales on its own.

- **Amazon SQS**: a **message queue**. Producers add messages and consumers **pull** them when ready, so bursts of work wait instead of being lost.
- **Amazon SNS**: **publish/subscribe**. One message to a **topic** is **pushed** to many subscribers, such as email, SMS, Lambda functions or SQS queues.
- **Amazon EventBridge**: an **event bus** that routes events from AWS services, your apps and SaaS partners to targets by **rules** (see deploy-operate).
- **AWS Step Functions**: **orchestrates** steps, such as Lambda functions, into a visual **workflow** with retries and branches.

## Analytics

- **Amazon Athena**: serverless **SQL queries directly on data in Amazon S3**.
- **AWS Glue**: serverless **data integration (ETL)**; its **Data Catalog** stores table definitions that Athena can use.
- **Amazon Kinesis**: collect and process **real-time streaming data**, such as clickstreams. **Amazon Data Firehose**, formerly Kinesis Data Firehose, delivers streams to S3 and other destinations.
- **Amazon EMR**: managed **big data** frameworks such as Apache Spark and Hadoop.
- **Amazon Redshift**: the **data warehouse** (see databases). **Amazon OpenSearch Service**: search and log analytics.
- **Amazon Quick**: dashboards and business intelligence with **Amazon Quick Sight**, which grew out of **Amazon QuickSight**, the name older questions use.

## End-user computing

- **Amazon WorkSpaces**: managed **virtual desktops**.
- **Amazon WorkSpaces Applications**, formerly **Amazon AppStream 2.0** (the exam guide's name): **streams individual desktop applications**, including to a web browser.
- **Amazon WorkSpaces Secure Browser**: secure, browser-based access to internal websites and SaaS apps; closed to new customers since October 29, 2026, existing customers keep using it.

## Business, IoT and frontend services

- **Amazon Connect** (now named Amazon Connect Customer): cloud **contact center**.
- **Amazon SES**: send **marketing, notification and transactional email**.
- **AWS IoT Core**: connect **IoT devices** and route their messages to AWS services.
- **AWS Amplify**: build, deploy and host **web and mobile apps**.

## Exam keyword table

| Keyword | Service |
| --- | --- |
| "Buffer orders so a slow backend never loses one" | Amazon SQS |
| "Fan out one alert to email, SMS and several systems" | Amazon SNS |
| "Coordinate a multi-step process with retries" | AWS Step Functions |
| "Ad hoc SQL on log files in S3" | Amazon Athena |
| "Real-time clickstream ingestion" | Amazon Kinesis |
| "Virtual desktops for remote staff" | Amazon WorkSpaces |
| "Cloud call center" | Amazon Connect |

## Common traps

- SQS consumers **pull**; SNS **pushes**.
- SES sends email; SNS notifies many endpoint types.
- WorkSpaces gives a **whole desktop**; WorkSpaces Applications streams **individual applications**.

## Key points

- Decouple with SQS, SNS, EventBridge and Step Functions.
- Athena queries S3, Glue prepares data, Kinesis streams, EMR runs big data, Quick Sight shows dashboards.
- WorkSpaces = desktops, Connect = contact center, SES = email, IoT Core = devices, Amplify = apps.

## Sources

- [AWS Certified Cloud Practitioner (CLF-C02) exam guide: Domain 3](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02-domain3.html)
- [What is Amazon WorkSpaces Applications?](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
- [What is Amazon Quick?](https://docs.aws.amazon.com/quick/latest/userguide/what-is.html)
