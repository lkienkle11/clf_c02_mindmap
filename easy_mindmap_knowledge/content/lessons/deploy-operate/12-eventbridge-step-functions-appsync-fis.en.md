---
id: deploy-operate-eventbridge-step-functions-appsync-fis
title: "Events, workflows and resilience: EventBridge, Step Functions, AppSync and Fault Injection Service"
required: false
videoQuery: Amazon EventBridge vs AWS Step Functions vs AppSync vs Fault Injection Service explained
---
## Where these services fit

The messaging lesson covered queues and topics. This lesson covers four other services you may meet in exam answers: one routes **events**, one runs **workflows**, one serves **APIs for apps**, and one tests **resilience**.

## Amazon EventBridge

**Amazon EventBridge** is a serverless service that connects application components through **events**. It is the evolution of **Amazon CloudWatch Events**: [AWS documentation](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) describes them as the same underlying service and API, with EventBridge adding more features, so older material may still say CloudWatch Events.

- An **event bus** receives events from AWS services, your own applications and SaaS partners. **Rules** match events and send them to **targets**, such as a Lambda function, an SQS queue or an SNS topic.
- **EventBridge Pipes** connect one source to one target, with optional transformation and enrichment.
- **EventBridge Scheduler** runs tasks on a schedule, using cron or rate expressions or a one-time time.

Typical example: when an EC2 instance enters the "stopping" state, an EventBridge rule invokes a Lambda function. That is an **event-driven** reaction. EventBridge is not an audit tool (CloudTrail), a compliance tool (Config) or a metric alarm (CloudWatch). AWS Health events can also be sent to it.

## AWS Step Functions

**AWS Step Functions** lets you build **workflows**, called state machines, from steps called **states**. A task state calls another service, such as a Lambda function. Other states let a workflow choose a path, run steps in parallel, retry or catch errors, and wait for a person or a callback. The console draws the workflow visually, so you can follow each execution.

| Workflow type | Runs for | Execution | Good for |
| --- | --- | --- | --- |
| Standard | Up to one year | Each step exactly once | Long-running, auditable workflows |
| Express | Up to five minutes | At least once if asynchronous, at most once if synchronous | High-rate event processing, such as streaming data and IoT ingestion |

Choose Step Functions to **orchestrate** several services in order, with error handling and branching, instead of chaining them with custom code. Standard workflows are priced by state transitions; Express workflows by number and duration of executions.

## AWS AppSync

**AWS AppSync** is a managed **GraphQL** service for application back ends. Clients ask for the data they need with GraphQL queries. AppSync also offers **real-time** updates: GraphQL **subscriptions** run over WebSockets that AppSync manages, and the newer **AppSync Events** feature provides publish/subscribe channels without a GraphQL schema. Choose AppSync for a mobile or web app that needs a flexible API or live data.

## AWS Fault Injection Service

**AWS Fault Injection Service (AWS FIS)** is a fully managed service for running controlled **fault injection experiments**. Its former name was **AWS Fault Injection Simulator**, so exam wording may use either. An experiment applies actions to target resources, for example disrupting network connectivity, to see whether the application stays healthy.

- It supports **chaos engineering**: you inject a failure on purpose and learn about weaknesses before a real incident.
- **Stop conditions** based on CloudWatch alarms halt the experiment automatically if it causes harm.
- It tests resilience; it does not fix anything or monitor production by itself.

## Which service for which need

| Need | Service |
| --- | --- |
| React to an event from an AWS service or SaaS partner | Amazon EventBridge |
| Run something on a schedule | EventBridge Scheduler |
| Coordinate several steps with branching, retries and waits | AWS Step Functions |
| Hold work for a later consumer | Amazon SQS |
| Notify many subscribers | Amazon SNS |
| Flexible GraphQL API with real-time updates | AWS AppSync |
| Prove that the system survives failures | AWS Fault Injection Service |

## Common traps

- A rule that fires when an instance changes state is **EventBridge**, not SNS or Config.
- Orchestrating a multi-step process is **Step Functions**; EventBridge only routes events.
- AWS FIS and AWS Fault Injection Simulator are the same service under its new and old names.

## Key points

- EventBridge routes events from sources to targets by rules, and schedules tasks; it was CloudWatch Events.
- Step Functions coordinates workflows: Standard (up to one year, exactly once) and Express (up to five minutes, at least once when asynchronous).
- AppSync is managed GraphQL with real-time subscriptions.
- AWS Fault Injection Service runs fault experiments with CloudWatch-alarm stop conditions.

## Sources

- [What is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- [What is Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
- [AWS AppSync](https://aws.amazon.com/appsync/)
