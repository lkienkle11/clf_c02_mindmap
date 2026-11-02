---
id: compute-ec2-basics
title: Amazon EC2 basics: instances, instance families and AMIs
required: true
videoQuery: Amazon EC2 instance types and AMI explained for beginners
---
## What Amazon EC2 is

**Amazon Elastic Compute Cloud (Amazon EC2)** gives you virtual servers, called **instances**, in the AWS Cloud. You choose how much CPU, memory, storage and network capacity you need, launch the instance in minutes, and stop or terminate it when you are done. This is Infrastructure as a Service (IaaS): AWS runs the hardware, and you manage the operating system and everything you install on it.

## Instance families: pick by workload

Each **instance type** is a fixed mix of CPU, memory, storage and networking. Types are grouped into families by purpose:

| Family | Optimized for | Example workloads |
| --- | --- | --- |
| General purpose | A balance of compute, memory and networking | Web servers, code repositories |
| Compute optimized | High-performance processors | Batch processing, media transcoding, game servers |
| Memory optimized | Large data sets held in memory | In-memory databases, data analytics |
| Storage optimized | Fast access to large data sets on local storage | Large databases, data processing |
| Accelerated computing | Hardware accelerators such as GPUs | Machine learning, graphics processing |

Exam clue: match the **bottleneck** in the scenario to the family. "Graphics" or "GPU" points to accelerated computing; "in-memory" points to memory optimized.

## Amazon Machine Images (AMIs)

An **AMI** is the image used to boot an instance: it holds the operating system and software needed to start it. You must choose an AMI at launch. You can use an AMI from AWS, a public or shared AMI, one bought on AWS Marketplace, or **your own**. Creating your own AMI from a configured instance lets you launch many identical servers quickly. An AMI belongs to one Region, but you can copy it to another Region.

## The instance lifecycle at a glance

- **Running**: the instance is in use and you pay for it while it runs, even when it is idle.
- **Stopped**: the instance is shut down; you do not pay for instance usage, but you still pay for attached Amazon EBS volumes. You can start it again later.
- **Terminated**: the instance is permanently deleted and cannot be started again. By default its root EBS volume is deleted too.

## Common traps

- Stopping an instance does **not** stop EBS storage charges.
- Data on **instance store** volumes is lost when an instance is stopped, hibernated or terminated (more in the Storage topic).
- Under the shared responsibility model, patching the guest operating system on EC2 is the **customer's** job.

## Key points

- EC2 = resizable virtual servers; you control the OS and software.
- Choose the instance family that matches the workload's main need.
- An AMI is the template used to launch instances; you can create your own.
- Running instances are billed; stopped instances are not, but their EBS volumes are.

## Sources

- [Amazon EC2 instance types](https://aws.amazon.com/ec2/instance-types/)
- [Amazon Machine Images in Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [Amazon EC2 instance state changes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
