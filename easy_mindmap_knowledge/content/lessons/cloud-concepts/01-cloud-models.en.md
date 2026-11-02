---
id: cloud-concepts-models
title: What cloud computing is: deployment and service models
required: true
videoQuery: AWS cloud computing deployment models IaaS PaaS SaaS explained
---
## What cloud computing means

AWS describes cloud computing as getting IT resources (compute, storage, databases and more) **on demand, over the internet, with pay-as-you-go pricing**. Instead of buying and running your own servers, you rent capacity from a provider and give it back when you no longer need it.

Three ideas sit inside that sentence:

- **On demand**: you request resources in minutes, not weeks.
- **Over the internet**: you reach them through a console, a command line or an API.
- **Pay as you go**: you pay for what you use, not for what you might need.

## Deployment models: where the application runs

| Model | Where it runs | Typical reason |
| --- | --- | --- |
| Cloud | Every part of the application runs in the cloud | Build new apps or move fully to the cloud |
| Hybrid | Cloud resources connected to resources that stay outside the cloud (often on premises) | Extend an existing data center, keep some systems local |
| On-premises (private cloud) | Your own data center, often with virtualization tools | Dedicated resources; gives few of the cloud's benefits |

Exam tip: if a scenario says "some workloads must stay in our own data center, the rest can move to AWS", the answer is **hybrid**.

## Service models: how much you manage

The service models differ in who manages what:

- **IaaS (Infrastructure as a Service)**: basic building blocks such as virtual servers, networking and storage. You manage the operating system and everything above it. Most control and flexibility. Example: Amazon EC2.
- **PaaS (Platform as a Service)**: the provider handles hardware, operating systems, capacity planning and patching. You focus on deploying and managing your application. Example: AWS Elastic Beanstalk.
- **SaaS (Software as a Service)**: a finished application run by the provider. You only decide how to use it. Example: web-based email.

A simple way to remember it: moving from IaaS to PaaS to SaaS, **you manage less and the provider manages more**.

## Key points

- Cloud computing = on-demand IT resources over the internet with pay-as-you-go pricing.
- Deployment models: cloud, hybrid, on-premises (private cloud).
- Hybrid connects cloud resources with systems that stay outside the cloud.
- Service models: IaaS (most control), PaaS (focus on your app), SaaS (just use the software).

## Sources

- [What is cloud computing? (AWS)](https://aws.amazon.com/what-is-cloud-computing/)
- [Types of cloud computing (AWS)](https://aws.amazon.com/types-of-cloud-computing/)
- [Deployment models, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html)
