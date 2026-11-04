---
id: deploy-operate-monitoring
title: "Monitoring and auditing: CloudWatch, CloudTrail, Config, EventBridge and X-Ray"
required: true
videoQuery: CloudWatch vs CloudTrail vs AWS Config difference explained Cloud Practitioner
---
## Three services, three questions

This is a top exam distinction. Ask which question the scenario needs answered.

| Service | Question it answers | Example |
| --- | --- | --- |
| Amazon CloudWatch | How is it **performing** right now? | CPU of an EC2 instance is above 80% |
| AWS CloudTrail | **Who did what**, when, from where (API activity)? | Who deleted this S3 bucket yesterday? |
| AWS Config | How was this resource **configured**, how has that changed, and is it **compliant**? | Which security groups allowed SSH from anywhere last month? |

## Amazon CloudWatch

- **Metrics**: many AWS services send metrics to CloudWatch automatically, and you can publish your own custom metrics.
- **Alarms** watch a metric against a threshold. When the alarm changes state it can send a notification through **Amazon SNS**, run an **EC2 action** (such as stop or reboot) or an **EC2 Auto Scaling** action.
- **CloudWatch Logs** collects and stores log files from AWS services and your applications so you can search and analyze them.
- **Dashboards** show metrics and alarms in one view.

## AWS CloudTrail

CloudTrail records **actions taken by a user, role or AWS service as events**, whether they came from the console, the CLI, the SDKs or the APIs. **Event history** shows the last 90 days of management events in a Region at no charge. For longer retention, create a **trail** that delivers events to an S3 bucket. Use CloudTrail for **auditing, security investigations and governance**.

## AWS Config

Config keeps a **detailed record of resource configurations** and how they change over time, including relationships between resources. **Config rules** evaluate those settings and flag **noncompliant** resources, for example an unencrypted EBS volume. It helps with compliance audits and troubleshooting.

## Amazon EventBridge

**EventBridge** is a serverless event router. Rules match events (from AWS services, your own applications or SaaS partners) and send them to targets such as Lambda functions. **EventBridge Scheduler** runs tasks on a schedule. Example: when an EC2 instance changes state, run a Lambda function.

## AWS X-Ray

**X-Ray** collects data about the **requests** your application serves and draws a **trace map** of the calls between services, so you can find bottlenecks and errors in distributed and microservice applications. The X-Ray SDKs have been in maintenance mode since February 2026, and AWS recommends OpenTelemetry to send traces to X-Ray.

## Common traps

- "Who made this change?" is **CloudTrail**, not CloudWatch.
- "Alert when CPU is high" is a **CloudWatch alarm**.
- "Is the resource configured according to our rules, and what did it look like before?" is **AWS Config**.
- "Find which microservice slows down requests" is **X-Ray**.

## Key points

- CloudWatch = performance metrics, alarms, logs.
- CloudTrail = API activity and audit trail of who did what.
- Config = configuration history and compliance rules.
- EventBridge routes events; X-Ray traces requests.

## Sources

- [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [What is AWS CloudTrail?](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
- [What is AWS Config?](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
