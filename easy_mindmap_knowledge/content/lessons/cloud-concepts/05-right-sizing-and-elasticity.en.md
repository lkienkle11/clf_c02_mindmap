---
id: cloud-concepts-right-sizing-and-elasticity
title: Right-sizing, elasticity and scaling
required: true
videoQuery: AWS elasticity vs scalability scale out scale in right-sizing
---
## Why these terms matter

Several exam questions use close cousins: scalability, elasticity, agility, high availability. Knowing exactly what each word means, and how scaling directions are named, wins easy points.

## Scalability versus elasticity

- **Scalability**: the ability of a system to handle a growing (or shrinking) workload by adding or removing resources.
- **Elasticity**: acquiring resources **when you need them and releasing them when you do not**, usually automatically, so capacity follows demand closely. Elasticity is about matching in both directions, and it is what saves money after a peak.

A system can be scalable without being elastic (you can add servers, but only by hand and you never remove them). On the exam, "acquire resources as needed and release them when no longer needed" means **elasticity**.

## Scaling directions

| Term | Meaning | Example |
| --- | --- | --- |
| Scale out (horizontal) | Add more resources of the same size | Go from 4 to 8 EC2 instances |
| Scale in (horizontal) | Remove resources | Go from 8 back to 4 instances |
| Scale up (vertical) | Move to a larger resource | Change an instance to a bigger instance type |
| Scale down (vertical) | Move to a smaller resource | Change to a smaller instance type |

Horizontal scaling is preferred for resilience: many small resources spread across Availability Zones mean one failure has less impact. Vertical scaling usually needs a restart and hits a ceiling at the largest size.

## How AWS provides elasticity

**Amazon EC2 Auto Scaling** keeps the right number of EC2 instances running. You define an Auto Scaling group with a minimum, desired and maximum size; scaling policies add or remove instances as demand changes, and unhealthy instances are replaced. It adds no charge of its own: you pay for the resources it launches. Serverless and managed services such as **AWS Lambda** and **Amazon DynamoDB** scale for you. An Elastic Load Balancer spreads traffic over the instances in the group.

## Right-sizing

**Right-sizing** means choosing the resource type, size and number that meet your technical needs at the lowest cost. It looks at how much CPU, memory, storage and network a workload really uses, and moves to a smaller or different resource if the current one is mostly idle.

- It is **iterative**: usage patterns change, and AWS adds new resource types and lowers prices.
- It can be one-off if the effort costs more than the saving.
- Use measured data (such as Amazon CloudWatch metrics), not guesses. **AWS Compute Optimizer** produces right-sizing recommendations; it is covered in the pricing and billing topic.

## The cost and sustainability angle

Elasticity and right-sizing are the practical form of the **Cost Optimization** pillar ("pay only for what you use, stop idle resources") and also of the Sustainability pillar ("maximize utilization"). A development environment stopped outside working hours is billed for roughly 40 of 168 hours a week, a saving of about 75 percent.

## Key points

- Elasticity = acquire when needed, release when not; scalability = ability to handle more load.
- Scale out/in = horizontal; scale up/down = vertical.
- Amazon EC2 Auto Scaling adds and removes instances for you and has no extra charge.
- Right-sizing matches resource size to real usage and is repeated over time.
- Idle, oversized resources are the typical cost-optimization finding.

## Sources

- [What is Amazon EC2 Auto Scaling?](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [Select the correct resource type, size, and number, Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/select-the-correct-resource-type-size-and-number.html)
- [Cost optimization design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html)
