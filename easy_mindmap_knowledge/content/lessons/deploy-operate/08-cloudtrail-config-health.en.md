---
id: deploy-operate-cloudtrail-config-health
title: "Who did it, what changed, why is it slow: CloudTrail, Config, X-Ray and the Health Dashboard"
required: true
videoQuery: CloudTrail vs AWS Config vs X-Ray vs AWS Health Dashboard which service answers which question
---
## AWS CloudTrail: who did what

**AWS CloudTrail** records activity in your account as **events**: API calls and actions made through the console, CLI, SDKs and other AWS services, including who made the call, from where and when. It is the audit trail.

- **Event history** is always on and free to view. It shows the past **90 days** of **management events** (control-plane operations such as creating, changing or deleting a resource) in a Region. It is immutable and searchable.
- A **trail** delivers events to an **Amazon S3 bucket** for longer retention and analysis. A trail logs management events by default.
- **Data events** record operations on the data inside a resource, for example reading objects in an S3 bucket. They are **off by default**, you choose which resources to cover, and they are charged.
- Delivering one copy of management events to S3 through a trail is free; you pay for S3 storage and for data events.
- **CloudTrail Lake**, a managed store with SQL queries, has been closed to new customers since May 31, 2026. Existing customers can continue, and trails and event history are not affected.

A typical question: "Which user deleted the instance last Tuesday?" or "Which IAM user changed the security group rule?" The answer is CloudTrail. CloudWatch does not know who did it.

## AWS Config: what changed and is it compliant

**AWS Config** keeps an inventory of your resources and records how each one was **configured over time**, including relationships between resources. It shows a timeline of past configurations and sends change notifications.

- **Config rules** evaluate recorded configurations against desired settings, either AWS **managed rules** or your own, and mark resources **compliant** or **noncompliant**. An example is checking that every EBS volume is encrypted.
- A noncompliant result can start a **remediation action**, which AWS Config runs through a Systems Manager Automation runbook.
- Because it keeps history and compliance state, Config produces evidence for **auditors** and compliance reviews, and helps you troubleshoot by looking at what a resource looked like before.

CloudTrail and Config work together: Config shows the configuration change, and CloudTrail shows the API call that caused it.

## AWS X-Ray: why is it slow

**AWS X-Ray** collects data about the **requests** your application serves and about its calls to downstream AWS services, databases and web APIs. Its **trace map** shows the client, the front-end service and the backend services, so you can spot bottlenecks, latency spikes and errors in a microservice application. AWS Lambda and AWS Elastic Beanstalk are among the services that integrate with it.

Status note: X-Ray itself continues, but its SDKs and daemon entered maintenance mode on February 25, 2026, so AWS limits their releases to security fixes. AWS recommends OpenTelemetry for instrumentation, and the CloudWatch agent can send traces to X-Ray.

## AWS Health Dashboard: is AWS having an issue

**AWS Health** reports on events that may affect your AWS services and resources. The **AWS Health Dashboard** merged the older **Service Health Dashboard** and **Personal Health Dashboard**, and old exam wording may still use those names.

| View | Who sees it | Shows |
| --- | --- | --- |
| Service health | Anyone, no sign-in or account needed | Public events for AWS services across Regions, with a service history for the last 12 months |
| Your account health | Signed-in users | Events specific to your account and resources, including scheduled changes such as an instance retirement |

The dashboard is free for all customers. Health events can also flow to **Amazon EventBridge** at no extra cost, which is how you automate reactions. Service health also offers an RSS feed, though AWS advises EventBridge for programmatic use. The AWS Health API needs a Business or Enterprise level Support plan.

## Which service answers which question

| Question | Service |
| --- | --- |
| Who made this API call, and when? | CloudTrail |
| What did this resource look like last month, and what changed? | AWS Config |
| Is this resource compliant with our rules? | AWS Config |
| What is the CPU utilization right now, and alert me | CloudWatch |
| Which part of my application is slow or failing? | X-Ray |
| Is an AWS outage affecting my resources, or is maintenance planned? | AWS Health Dashboard |
| React automatically when something happens | Amazon EventBridge |

## Common traps

- "Audit API activity" or "identify the user" is CloudTrail, never Config or Inspector.
- "Evaluate configuration compliance over time" is Config, not CloudTrail.
- "Service availability and operations" or "upcoming scheduled maintenance for my account" is the Health Dashboard, not Trusted Advisor or EventBridge.

## Key points

- CloudTrail: 90 days of management events in event history, trails to S3 for more; data events are off by default.
- Config: configuration history and compliance rules, with optional remediation.
- X-Ray: request tracing and trace map; Health Dashboard: public service health plus your account health.
- CloudTrail Lake is closed to new customers.

## Sources

- [Working with CloudTrail event history](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html)
- [What is AWS Config?](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
- [AWS Health Dashboard, service health](https://docs.aws.amazon.com/health/latest/ug/aws-health-dashboard-status.html)
