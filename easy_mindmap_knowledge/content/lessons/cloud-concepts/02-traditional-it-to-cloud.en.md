---
id: cloud-concepts-traditional-it-to-cloud
title: From traditional IT to the AWS Cloud
required: true
videoQuery: traditional on-premises IT vs AWS cloud computing benefits
---
## How traditional IT works

In a traditional, on-premises model a company buys, installs and runs its own hardware in a data center. Each new project follows the same slow path:

1. Estimate how much capacity the application will need, often years ahead.
2. Order servers, storage and network gear, and wait for delivery.
3. Rack, cable, power and configure everything, then install software.
4. Pay for the equipment up front, whether or not it is fully used.

This model has three well-known problems. **Procurement takes weeks or months**, so ideas wait. **Capacity is a guess**: buy too little and the application fails at peak; buy too much and expensive hardware sits idle. And the money is **capital expenditure (CapEx)**, spent before you know whether the project will succeed.

## What the cloud changes

**Cloud computing** is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing. The **AWS Cloud** offers a broad set of services, from compute, storage and databases to analytics and machine learning, that you reach through the AWS Management Console, the command line (AWS CLI) or APIs.

Characteristics commonly used to describe cloud computing (a general industry description, not an AWS list; AWS's own lists, such as the six advantages below, differ):

- **On-demand self-service**: you provision resources yourself, in minutes, without filing a ticket with a hardware vendor.
- **Broad network access**: resources are available over the internet from many kinds of devices.
- **Resource pooling and scale**: AWS shares a very large pool of infrastructure among many customers.
- **Rapid elasticity**: capacity grows and shrinks with demand.
- **Measured service**: usage is metered, so you pay only for what you consume.

## Traditional IT versus the cloud

| Topic | Traditional on-premises | AWS Cloud |
| --- | --- | --- |
| Spending type | CapEx: buy hardware first | OpEx: pay as you use |
| Time to get resources | Weeks or months | Minutes |
| Capacity planning | Guess the peak in advance | Scale to actual demand |
| Idle resources | Still paid for | Stop or release them |
| Data center work | You rack, power and cool | AWS does it |
| Reaching new countries | Build or rent a facility | Deploy in another Region |

## Exam depth: the benefits in one view

Questions about "benefits of moving to AWS" map to the six advantages. A quick translation:

- Lower upfront cost and pay-as-you-go: **trade fixed expense for variable expense**.
- Lower unit prices: **economies of scale**.
- No sizing guesses: **stop guessing capacity**.
- New environment in minutes: **speed and agility**.
- No data center chores: **stop spending money on running data centers**.
- Users worldwide: **go global in minutes**.

Not every statement about the cloud is a benefit. "Fixed upfront cost" and "AWS manages your guest operating system" are wrong answers: you still manage your own data, access and (on EC2) the operating system.

## Key points

- Traditional IT needs upfront CapEx, long procurement and guessed capacity.
- Cloud computing means on-demand resources over the internet with pay-as-you-go pricing.
- On-demand self-service lets you get resources in minutes without buying hardware.
- Each cloud benefit maps to one of the six advantages; learn the clue words.
- The cloud shifts spending from CapEx to OpEx but does not remove your responsibility for your own data and configuration.

## Sources

- [What is cloud computing? (AWS)](https://aws.amazon.com/what-is-cloud-computing/)
- [Six advantages of cloud computing, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html)
