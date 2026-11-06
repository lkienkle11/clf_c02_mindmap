---
id: compute-elastic-load-balancing
title: Elastic Load Balancing: choosing the right load balancer
required: true
videoQuery: Elastic Load Balancing Application Network Gateway Load Balancer differences explained
---
## What Elastic Load Balancing does

**Elastic Load Balancing (ELB)** spreads incoming traffic across many targets, such as EC2 instances, containers and IP addresses, in one or more Availability Zones. It watches the health of those targets and sends requests **only to healthy ones**, so a failed server is skipped automatically. It also scales its own capacity as traffic changes, and you pay for what you use. A load balancer lives in one **Region** and spans the Availability Zones you enable, which is why it improves availability. The overview lesson in this topic introduces ELB; this lesson goes deeper.

## Building blocks

- **Load balancer**: the single entry point whose DNS name clients use.
- **Listener**: checks for connection requests on a protocol and port, and applies rules.
- **Target group**: the set of registered targets. Health checks are defined per target group.
- **Scheme**: **internet-facing** (public addresses, reachable from the internet) or **internal** (private addresses, reachable only from inside the VPC). A three-tier application often uses both.

## The four types

| Type | Layer and protocols | Choose it when |
| --- | --- | --- |
| **Application Load Balancer (ALB)** | Layer 7: HTTP, HTTPS, gRPC | Web apps, microservices and containers that need smart routing |
| **Network Load Balancer (NLB)** | Layer 4: TCP, UDP, TLS | Extreme performance, very high request rates, static or Elastic IP addresses |
| **Gateway Load Balancer (GWLB)** | Layer 3 gateway plus load balancing, GENEVE | Deploying and scaling virtual appliances |
| **Classic Load Balancer (CLB)** | Layer 4 and 7 | Previous generation; migrate to a current type |

**ALB** reads the request, so it can route by **URL path or host name** and also by headers, query strings or source IP. It can redirect, return a fixed response, offload HTTPS decryption using certificates from AWS Certificate Manager, and work with AWS WAF. It supports Lambda functions as targets. It has no static IP address. **NLB** works on connections, not on request content. Each enabled Availability Zone gets a static IP address, and you can attach one Elastic IP per zone. **GWLB** sits in the traffic path like a transparent gateway and passes packets to security appliances such as firewalls, intrusion detection and prevention systems or deep packet inspection tools, which usually come from third-party vendors.

Quick decision rules for the exam: "route by URL path or host" means ALB. "TCP or UDP, static IP, extreme performance" means NLB. "Third-party firewall appliances" means GWLB. If a question only says "distribute HTTP traffic across instances", ALB is the usual answer.

## Health checks

Each load balancer node sends a periodic request to its targets. A target that fails the configured number of checks in a row is taken out of service, and it returns after enough consecutive successes. For an ALB you set the protocol, port and path (for example `/health`) and the response codes that count as success. If **every** target in a group is unhealthy, the ALB sends traffic to all of them anyway rather than none.

## Cross-zone load balancing

Each enabled zone has load balancer nodes. With **cross-zone load balancing** on, every node distributes traffic across targets in all enabled zones, which evens out uneven target counts. With it off, a node only uses targets in its own zone.

- ALB: always on at the load balancer level.
- NLB and GWLB: off by default; you can enable it.
- CLB: depends on how you created it.

An ALB needs at least two Availability Zones, and every enabled zone should have at least one registered target.

## Working with Auto Scaling

When an Auto Scaling group is attached to a target group, instances it launches are registered automatically and instances it terminates are deregistered. You can also use ELB health results so the group replaces instances the load balancer sees as unhealthy. See the Auto Scaling groups lesson.

## Common exam traps

- ELB **distributes** traffic; it does not add or remove instances. That is Auto Scaling.
- A load balancer is **Regional**. Spreading traffic across Regions needs other services, such as Amazon Route 53 or AWS Global Accelerator.
- NLB is not layer 7, and ALB cannot give you a fixed IP address.
- Classic Load Balancer is the old generation; do not choose it for new designs.

## Key points

- ELB sends requests only to healthy targets and scales itself.
- ALB = HTTP/HTTPS routing; NLB = TCP/UDP speed and static IPs; GWLB = appliances; CLB = legacy.
- Health checks and cross-zone settings decide where traffic goes.
- It balances within a Region; Auto Scaling handles instance count.

## Sources

- [What is Elastic Load Balancing?](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [How Elastic Load Balancing works](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html)
- [Elastic Load Balancing features](https://aws.amazon.com/elasticloadbalancing/features/)
