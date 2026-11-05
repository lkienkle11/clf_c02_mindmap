---
id: support-ai-other-sagemaker-kendra-personalize-forecast
title: "SageMaker AI, Personalize, Forecast, Kendra and OpenSearch Service: models, predictions and search"
required: true
videoQuery: Amazon SageMaker AI Personalize Forecast Kendra OpenSearch Service explained
---
## Beyond the one-call AI services

Rekognition, Textract and Comprehend answer one kind of question through an API. This lesson covers the next group: a platform for **your own** models, two services that predict from your data, and two ways to search. Several of them have changed status, so exam wording and AWS's current position sometimes differ.

## Amazon SageMaker AI: build, train and deploy your models

**Amazon SageMaker AI** is a fully managed machine learning service. Data scientists and developers use it to **build, train and deploy** ML models into a hosted, production-ready environment without running their own servers. It supports built-in algorithms as well as your own algorithms and frameworks.

On **December 3, 2024**, Amazon SageMaker was renamed **Amazon SageMaker AI**. At the same time, AWS gave the name **Amazon SageMaker** to a broader platform that unifies data, analytics and AI, and that includes SageMaker AI. The CLF-C02 in-scope list names Amazon SageMaker AI, while older questions say "Amazon SageMaker"; both point to the build-train-deploy service.

## Amazon Personalize: recommendations

**Amazon Personalize** is a managed service that produces **personalized recommendations** from your data, mainly records of how users interact with items, such as clicks and purchases. Typical results are "recommended for you", "customers who viewed this also viewed", user segments for campaigns and re-ranked search results. It supports real-time requests and batch jobs, and it has no minimum fee or upfront commitment. An exam scenario with "product recommendations from customer data" points here, not to Comprehend or Rekognition.

## Amazon Forecast: time-series forecasting (closed to new customers)

**Amazon Forecast** predicted future values, such as demand or inventory, from historical time-series data. AWS closed it to **new customers on July 29, 2024**; existing customers can keep using it, and AWS recommends **Amazon SageMaker Canvas** for time-series forecasting. Older questions still use Forecast as the "forecasting service" answer, usually as a wrong option next to the correct one.

## Amazon Kendra: intelligent search (maintenance mode)

**Amazon Kendra** is an intelligent search service for company content. It connects to many data sources through connectors, indexes the content, and returns relevant passages for natural-language queries from one search interface. AWS put Kendra into maintenance on **June 30, 2026**, and it has been closed to new customers since **July 30, 2026**; existing customers are still supported. AWS points new work to **Amazon Bedrock Managed Knowledge Base**. Exam-style questions about "search documents in S3 with one intelligent search interface" are keyed to Kendra, so choose it when it is offered. If a current scenario lists Kendra and Bedrock, read for words such as "generative" or "foundation model".

## Amazon OpenSearch Service: search and log analytics

**Amazon OpenSearch Service** runs managed **OpenSearch** clusters (and legacy Elasticsearch) for **search, log analytics, real-time application monitoring and clickstream analysis**. AWS creates the cluster, replaces failed nodes and lets you scale with an API call. You pay for instance hours and attached storage. It is on the CLF-C02 analytics list. **Amazon CloudSearch**, an older search service, has been in maintenance since July 25, 2024, and AWS recommends moving to OpenSearch Service.

Kendra targets natural-language search over company documents; OpenSearch Service is a general-purpose search and analytics engine that also serves logs and dashboards.

## Generative AI pointer

For summarizing, drafting or chatting with a **foundation model** without training anything, use **Amazon Bedrock**, covered in the AI and machine learning lesson. The in-scope list names **Amazon Q** and SageMaker AI rather than Bedrock, but exam-style scenarios about foundation models are keyed to Bedrock.

## Which service?

| Scenario | Service |
| --- | --- |
| Build, train and deploy a custom ML model | Amazon SageMaker AI |
| Recommend products from user behavior | Amazon Personalize |
| Forecast demand from historical time series | Amazon Forecast (closed to new customers) or SageMaker Canvas |
| Search company documents with one interface | Amazon Kendra |
| Log analytics or a managed search engine | Amazon OpenSearch Service |
| Summarize text with a foundation model | Amazon Bedrock |

## Key points

- SageMaker AI (formerly Amazon SageMaker) builds, trains and deploys your own models.
- Personalize recommends; Forecast predicts time series but is closed to new customers.
- Kendra is closed to new customers since July 30, 2026, yet exam questions still key it for document search.
- OpenSearch Service handles search and log analytics.

## Sources

- [What is Amazon SageMaker AI?](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html)
- [What is Amazon Personalize?](https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html)
- [Amazon Kendra availability change](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html)
