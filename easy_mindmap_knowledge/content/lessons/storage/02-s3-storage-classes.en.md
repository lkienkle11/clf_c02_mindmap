---
id: storage-s3-classes
title: S3 storage classes and lifecycle policies
required: true
videoQuery: Amazon S3 storage classes Glacier Intelligent-Tiering lifecycle explained
---
## Why there are several classes

Every object in S3 has a **storage class**. All classes are highly durable; they differ in **how often you expect to read the data**, how fast you need it back, how many Availability Zones hold it, and price. The rule of thumb: the less often you read data, the cheaper it is to store, but reading it costs more or takes longer.

## The classes, from hot to cold

| Storage class | Best for | Access |
| --- | --- | --- |
| S3 Standard | Frequently accessed data (the default) | Milliseconds |
| S3 Intelligent-Tiering | Unknown or changing access patterns | Milliseconds for the frequent and infrequent tiers |
| S3 Standard-IA | Infrequent access, but needed fast when asked | Milliseconds, with a retrieval fee |
| S3 One Zone-IA | Infrequent, re-creatable data, stored in one AZ | Milliseconds, with a retrieval fee |
| S3 Glacier Instant Retrieval | Archives read about once a quarter | Milliseconds |
| S3 Glacier Flexible Retrieval | Archives read about once a year | Minutes to hours, after a restore |
| S3 Glacier Deep Archive | Long-term archives read less than once a year | Hours, after a restore; lowest cost |

Notes that exam questions rely on:

- **Intelligent-Tiering** monitors each object and moves it between access tiers for you, for a small monitoring fee and **no retrieval fees**. Pick it when the access pattern is unknown.
- **One Zone-IA** keeps data in a **single** Availability Zone, so it is cheaper but the data can be lost if that AZ is destroyed. Use it only for data you can re-create or for secondary copies.
- The IA and Glacier classes have **minimum storage durations** (for example 30 days for the IA classes and 180 days for Deep Archive), so they suit long-lived data.

## Lifecycle policies

An **S3 Lifecycle configuration** is a set of rules that S3 applies to objects automatically:

- **Transition actions** move objects to a cheaper class after a set time, for example to Standard-IA 30 days after creation and to Glacier Flexible Retrieval after a year.
- **Expiration actions** delete objects when they are no longer needed, such as logs kept for a fixed compliance period.

Lifecycle rules fit data whose access pattern is **known and predictable**; Intelligent-Tiering fits data whose pattern is **unknown**.

## Common traps

- "Rarely accessed but must be available in milliseconds" points to Standard-IA or Glacier Instant Retrieval, not Flexible Retrieval or Deep Archive.
- "Lowest cost archive, retrieval within hours is fine" points to Glacier Deep Archive.
- One Zone-IA is wrong for the only copy of important data.

## Key points

- Choose the class by access frequency and retrieval speed.
- Intelligent-Tiering automates tiering for unknown patterns.
- Glacier classes are for archives; Deep Archive is the cheapest and slowest.
- Lifecycle rules transition or expire objects on a schedule you define.

## Sources

- [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Managing the lifecycle of objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [Amazon S3 storage classes](https://aws.amazon.com/s3/storage-classes/)
