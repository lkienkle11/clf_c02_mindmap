---
id: compute-scaling-load-balancing
title: Amazon EC2 Auto Scaling and Elastic Load Balancing
required: true
videoQuery: EC2 Auto Scaling and Elastic Load Balancing explained high availability
---
## Two services that work as a pair

A single EC2 instance is a single point of failure and has a fixed capacity. Two services fix that:

- **Amazon EC2 Auto Scaling** keeps the **right number** of instances running.
- **Elastic Load Balancing (ELB)** spreads incoming traffic across the healthy instances.

Together they deliver **elasticity** (capacity follows demand) and **high availability** (the application survives the loss of an instance or an Availability Zone).

## Amazon EC2 Auto Scaling

You place instances in an **Auto Scaling group** and set three numbers:

- **Minimum**: the group never shrinks below this.
- **Maximum**: the group never grows above this, which caps cost.
- **Desired capacity**: how many instances should run right now.

**Scaling policies** change the desired capacity as load changes, for example adding instances when average CPU is high and removing them when it falls. Auto Scaling also runs **health checks** and **replaces** instances that are impaired or terminated, so the group heals itself. When the group spans several Availability Zones, Auto Scaling keeps instances balanced across them. There is no extra charge for Auto Scaling itself; you pay for the instances and other resources it uses.

## Elastic Load Balancing

A load balancer is one entry point for clients. It routes each request to a registered target, such as an EC2 instance, container or IP address, in one or more Availability Zones. It checks the health of the targets and sends traffic **only to healthy ones**. The load balancer itself scales with incoming traffic.

| Type | Works at | Typical use |
| --- | --- | --- |
| Application Load Balancer | Layer 7: HTTP and HTTPS | Web apps; routing by URL path or host name |
| Network Load Balancer | Layer 4: TCP, UDP, TLS | Very high performance, static IP addresses |
| Gateway Load Balancer | Layer 3 (IP packets) | Third-party virtual appliances such as firewalls |

The older Classic Load Balancer is a previous generation.

## How they fit together

When Auto Scaling launches an instance, it registers it with the load balancer; when it terminates one, it deregisters it. Users keep one address while capacity grows and shrinks behind it.

## Common traps

- **Scaling** (more or fewer instances) is Auto Scaling; **distributing traffic** is ELB. Questions often offer one when the other is needed.
- Adding instances in the **same** Availability Zone does not protect against that zone failing. Spread the group across several AZs.
- Scaling out means adding instances (horizontal); scaling up means a bigger instance (vertical).

## Key points

- Auto Scaling: minimum, maximum and desired capacity, plus self-healing.
- ELB: one entry point, health checks, traffic only to healthy targets.
- Multi-AZ Auto Scaling group behind a load balancer = classic highly available design.
- ALB for HTTP routing, NLB for TCP/UDP performance, GWLB for appliances.

## Sources

- [What is Amazon EC2 Auto Scaling?](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [What is Elastic Load Balancing?](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [Elastic Load Balancing features](https://aws.amazon.com/elasticloadbalancing/features/)
