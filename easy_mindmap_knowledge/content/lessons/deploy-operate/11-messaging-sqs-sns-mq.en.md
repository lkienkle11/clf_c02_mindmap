---
id: deploy-operate-messaging-sqs-sns-mq
title: "Decoupling with messages: Amazon SQS, Amazon SNS, Amazon MQ and Amazon Kinesis"
required: false
videoQuery: Amazon SQS vs SNS vs Amazon MQ vs Kinesis difference explained decoupling fan-out
---
## Why messaging services exist

When one part of an application calls another directly, a failure or traffic spike in one part hurts the other. Putting a managed message service in between makes the parts **loosely coupled**: each part can fail, scale and be updated on its own. "Loosely couple components" is a core AWS design principle, and the services in this lesson are how you apply it.

## Amazon Simple Queue Service (Amazon SQS)

**Amazon Simple Queue Service (Amazon SQS)** is a hosted **message queue** that lets you integrate and decouple distributed software components. Producers send messages to a queue and consumers fetch them when they are ready.

- Messages are stored on multiple servers. The queue scales to any load without provisioning.
- While a consumer processes a message, it stays in the queue but is hidden from other consumers for the **visibility timeout**. The consumer **deletes** the message when done; otherwise it can be received again.
- The default retention is **4 days**, adjustable up to 14 days. **Dead-letter queues** collect messages that keep failing.

| Queue type | Delivery | Ordering | Use when |
| --- | --- | --- | --- |
| **Standard** | At least once, so duplicates are possible | Best effort, not guaranteed | Highest throughput, and consumers can tolerate duplicates |
| **FIFO** | Exactly-once processing | Strict order within a message group | Order matters, such as processing commands in sequence |

## Amazon Simple Notification Service (Amazon SNS)

**Amazon Simple Notification Service (Amazon SNS)** is **publish/subscribe** messaging. A publisher sends a message to a **topic**, and SNS delivers a copy to every subscriber. Subscriber endpoints include Amazon SQS queues, Lambda functions, HTTP(S) endpoints, email, mobile push and SMS text messages. SNS supports application-to-application and application-to-person messages.

The **fanout** pattern combines the two: a message published to one SNS topic is copied into several SQS queues, and each queue is processed by a different consumer, such as order fulfillment and analytics, in parallel. Queues also protect against a subscriber being offline, because messages wait. SNS has no upfront cost; you pay for messages published and notifications delivered.

## SQS or SNS?

| | SQS | SNS |
| --- | --- | --- |
| Model | Queue; usually one consumer processes each message | Topic; every subscriber gets a copy |
| Delivery | Consumers pull | SNS pushes to subscribers |
| Typical use | Buffer work, decouple, smooth spikes | Notify many parties, alerts, fanout |

Also recall that a **CloudWatch alarm** can notify through an SNS topic, and that SNS only delivers the notification; the alarm does the watching.

## Amazon MQ

**Amazon MQ** is a managed **message broker** service for **Apache ActiveMQ** and **RabbitMQ**. It exists mainly for **migration**: an application that already talks to a broker through standard APIs and protocols such as JMS, AMQP, MQTT, OpenWire or STOMP can move to Amazon MQ without rewriting its messaging code. AWS recommends SQS and SNS for new applications and Amazon MQ for such migrations.

## Amazon Kinesis at overview level

**Amazon Kinesis** is the family for **streaming data**: continuous data from many sources, such as clickstreams, logs or IoT devices, processed in near real time.

- **Amazon Kinesis Data Streams** captures and stores streaming data for custom applications that process it.
- **Amazon Data Firehose** (formerly Kinesis Data Firehose) delivers streams to destinations such as Amazon S3, Amazon Redshift and Amazon OpenSearch Service.
- **Amazon Managed Service for Apache Flink** (formerly Kinesis Data Analytics for Apache Flink) analyzes streams. The separate Kinesis Data Analytics for SQL is [in full shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html).

Kinesis is covered here only at overview level. Remember that a stream is for a continuous flow of records, while a queue hands out discrete tasks.

## Which service for which need

| Need | Service |
| --- | --- |
| Hold work items so a slower component can process them later | Amazon SQS |
| Strict ordering of messages | Amazon SQS FIFO |
| Send one message to many subscribers or users (email, SMS, queues) | Amazon SNS |
| Migrate an existing ActiveMQ or RabbitMQ application | Amazon MQ |
| Ingest a continuous high-volume stream of records | Amazon Kinesis |
| React to AWS service events and route to targets | Amazon EventBridge (next lesson) |

## Key points

- Queues and topics make components loosely coupled.
- SQS: pull-based queue with a visibility timeout; standard is at-least-once and best-effort order, FIFO is strictly ordered within a message group.
- SNS: topics with push delivery to many endpoints; SNS plus SQS gives fanout.
- Amazon MQ is for migrating broker-based applications; Kinesis is for streams.

## Sources

- [What is Amazon SQS?](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
- [What is Amazon SNS?](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
- [What is Amazon MQ?](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html)
