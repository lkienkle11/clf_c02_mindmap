---
id: deploy-operate-cloudwatch-in-depth
title: "Amazon CloudWatch in depth: metrics, alarms, logs, dashboards and the agent"
required: true
videoQuery: Amazon CloudWatch metrics alarms logs dashboards CloudWatch agent explained for beginners
---
## What CloudWatch is for

**Amazon CloudWatch** monitors the **performance and health** of your AWS resources and applications in near real time. It collects telemetry, shows it, and can act on it. It answers "how is it running right now?" The monitoring lesson contrasted it with CloudTrail and Config; this lesson looks inside CloudWatch.

## Metrics

A **metric** is a time-ordered set of data points, such as the CPU utilization of one EC2 instance. Metrics live in a **namespace** (Amazon EC2 uses `AWS/EC2`) and are described by **dimensions**, name/value pairs such as an instance ID.

- Many AWS services publish metrics at no charge, for example EC2, EBS and RDS.
- Metrics exist only in the Region where they are created and are kept for up to **15 months**; older data points are aggregated to coarser periods over time.
- AWS services publish at **standard resolution** (one-minute granularity; EC2 basic monitoring is the exception, see below). Your own **custom metrics** can be high resolution, down to one second.

### Default versus detailed monitoring for EC2

| | Basic (default) | Detailed |
| --- | --- | --- |
| EC2 metric interval | Every 5 minutes | Every 1 minute |
| Cost | No charge | For a charge |

Choose detailed monitoring when you need faster reaction, for example alarms that scale a fleet in time.

## Alarms

An **alarm** watches one metric against a threshold over a number of periods and has three states: **OK**, **ALARM** and **INSUFFICIENT_DATA** (not enough data yet, for example because the resource is inactive). When the state changes, the alarm can:

- send a notification to an **Amazon SNS** topic;
- run an **Amazon EC2 action**, such as stop or reboot an instance;
- start an **EC2 Auto Scaling** action, such as adding instances;
- create a Systems Manager OpsItem or incident.

A **composite alarm** combines other alarms into one rule to reduce noise. The alarm itself does not scale anything: when a question asks what initiates an Auto Scaling action based on CPU utilization, the answer is the **CloudWatch alarm**. SNS delivers the notification, but it does not watch the metric.

## Logs

**CloudWatch Logs** collects, stores and searches log files from AWS services and your applications.

- A **log event** is one record. A **log stream** is a sequence of events from one source, such as one server. A **log group** holds streams that share the same retention, monitoring and access settings.
- By default, log data is kept **indefinitely**. You set a **retention period** per log group, and expired events are deleted automatically.
- **Metric filters** turn matching log events into metric data points, which you can alarm on.
- **Logs Insights** is an interactive query tool for log data. Its queries are charged by the amount of log data scanned.

## Dashboards

A **dashboard** is a customizable single view of metrics and alarms. It can show resources from several Regions, and with cross-account observability it can combine several accounts. Teams use dashboards as a shared view during operational events.

## The CloudWatch agent and custom metrics

EC2 publishes instance-level metrics such as CPU, disk I/O and network. It does **not** report **memory use or disk-space use**, because those exist inside the operating system. The **CloudWatch agent** installed on a server collects such system-level metrics, plus log files, from EC2 instances and **on-premises servers**. It can also receive custom application metrics (StatsD, collectd). Metrics the agent publishes are billed as **custom metrics** and appear in the `CWAgent` namespace by default. The agent can be installed and configured with Systems Manager.

## EventBridge and what CloudWatch does not do

**Amazon EventBridge** (formerly Amazon CloudWatch Events) routes events to targets such as a Lambda function; the optional lesson on messaging and workflows covers it. A rule that reacts to an EC2 instance entering the "stopping" state is an EventBridge job, not an alarm.

CloudWatch is **not** an audit service:

| Question | Not CloudWatch, use |
| --- | --- |
| Which IAM user called an API, and when? | AWS CloudTrail |
| Is this resource compliant, and how was it configured last month? | AWS Config |
| Which microservice slows my requests? | AWS X-Ray |
| Is AWS itself having an issue? | AWS Health Dashboard |

## Pricing in one paragraph

Many service metrics are free by default. You pay for detailed monitoring, custom metrics (including those published by the agent), high-resolution alarms, and Logs Insights queries, which are charged by the amount of log data scanned. Log data you keep also costs money, so setting a retention period limits storage cost.

## Key points

- Metrics are performance data points; alarms have OK, ALARM and INSUFFICIENT_DATA states and can notify, act on EC2 or trigger Auto Scaling.
- Logs are organized as events, streams and groups; retention is set per group and is infinite by default.
- Basic EC2 monitoring is 5 minutes, detailed is 1 minute; memory and disk-space metrics need the CloudWatch agent.
- CloudWatch does not record who made API calls; that is CloudTrail.

## Sources

- [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)
- [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html)
- [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)
