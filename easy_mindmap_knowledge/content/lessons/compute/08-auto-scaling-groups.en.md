---
id: compute-auto-scaling-groups
title: Amazon EC2 Auto Scaling groups in depth
required: true
videoQuery: Amazon EC2 Auto Scaling group launch template scaling policies explained
---
## From overview to detail

The overview lesson showed that an Auto Scaling group keeps a minimum, a maximum and a desired number of instances. This lesson explains what the group is made of, how it decides to scale and how it differs from the similarly named **AWS Auto Scaling**.

## Group, launch template and capacity

An **Auto Scaling group** is a collection of EC2 instances managed as one unit. The group needs to know what to launch, and that comes from a **launch template**. The template holds the same choices you would make for a single instance: the AMI ID, instance type, key pair, security groups and other parameters. Launch templates are **versioned**, so you can prepare a new version with a newer AMI and roll it out. Older **launch configurations** still exist, but AWS recommends launch templates, and some features, such as mixing Spot and On-Demand Instances or several instance types, work only with templates.

Three numbers govern size:

- **Minimum**: the group never goes below it.
- **Maximum**: the group never goes above it, which caps your spending.
- **Desired capacity**: what the group is trying to run now. Scaling changes this number, always staying between minimum and maximum.

The group spans the Availability Zones you select and keeps instances spread evenly across them, so losing one zone does not take the application down.

## Scaling methods

| Method | How it works | Typical use |
| --- | --- | --- |
| Maintain a fixed size | No policies; the group keeps the desired number running | Keep exactly N servers alive |
| Manual | You change desired capacity or terminate instances | Quick one-off change |
| **Scheduled** | Capacity changes at set dates and times | Known peaks, such as every weekday morning |
| **Dynamic** | A policy reacts to a CloudWatch metric | Unpredictable demand |
| **Predictive** | Forecasts demand from past load and adds capacity ahead of time | Regular daily or weekly cycles, slow-starting apps |

**Dynamic scaling** is the one most people picture. A common policy type is **target tracking**: you pick a metric and a target, for example average CPU utilization around 50 percent, and the group adds or removes instances to stay near it. **Predictive scaling** analyzes historical load for daily and weekly patterns, then launches capacity before the traffic arrives. It can be combined with dynamic scaling, which handles surprises. **Scale out** means adding instances; **scale in** means removing them.

## Self-healing

The group continually checks instance health. Instances start as healthy, and the group learns of problems from sources such as Amazon EC2 status checks, Elastic Load Balancing and custom checks you define. An unhealthy instance is terminated and replaced using the current launch template, so capacity returns to the desired number. This also covers an instance that was terminated by mistake or interrupted as a Spot Instance. A **health check grace period** gives new instances time to start before the optional checks begin.

This is why Auto Scaling is the answer when a question wants a fleet kept at a fixed size where impaired instances are replaced. A group with minimum, desired and maximum all equal to the same number does exactly that.

## Working with a load balancer

Attach the group to a load balancer target group. New instances register automatically, terminated ones deregister, and ELB health results can drive replacement. The group provides the right number of servers and the load balancer shares the traffic among them. Neither does the other's job.

## Cost angle

There is no extra charge for Amazon EC2 Auto Scaling. You pay for the instances and other resources it launches. Scaling in during quiet periods lowers the bill, the maximum acts as a ceiling, and a group can use a mix of **On-Demand and Spot Instances** to cut cost for fault-tolerant capacity.

## AWS Auto Scaling versus Amazon EC2 Auto Scaling

| | Amazon EC2 Auto Scaling | AWS Auto Scaling |
| --- | --- | --- |
| Scales | EC2 instances in an Auto Scaling group | A set of resources: EC2 and Spot Fleets, Amazon ECS tasks, Amazon DynamoDB tables and indexes, Amazon Aurora replicas |
| Approach | You configure the group and its policies | Scaling plans configure scaling for several resources together |
| Cost | No additional charge | No additional charge |

If a question mentions **only EC2 instances**, think Amazon EC2 Auto Scaling. If it needs scaling across several resource types, think AWS Auto Scaling. AWS now documents moving scaling plans to EC2 Auto Scaling and Application Auto Scaling policies, so treat EC2 Auto Scaling as the main tool.

## Common exam traps

- Auto Scaling does not spread requests; Elastic Load Balancing does.
- Scaling **out** adds instances; scaling **up** makes one bigger.
- A group inside one Availability Zone is not highly available.
- "Maximum" is a cost ceiling, "minimum" is an availability floor.

## Key points

- A group launches instances from a versioned launch template.
- Desired capacity moves between minimum and maximum through manual, scheduled, dynamic or predictive scaling.
- Failed instances are replaced automatically.
- No extra charge for Auto Scaling; AWS Auto Scaling covers several resource types.

## Sources

- [Auto Scaling groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html)
- [Choose your scaling method](https://docs.aws.amazon.com/autoscaling/ec2/userguide/scaling-overview.html)
- [AWS Auto Scaling](https://aws.amazon.com/autoscaling/)
