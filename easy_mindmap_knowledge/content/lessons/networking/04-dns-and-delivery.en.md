---
id: networking-dns-delivery
title: "DNS and delivery: Amazon Route 53, CloudFront, Global Accelerator and API Gateway"
required: true
videoQuery: Amazon Route 53 routing policies explained
---
## Amazon Route 53: DNS on AWS

**Amazon Route 53** is a highly available, scalable **Domain Name System (DNS)** service. DNS turns a name such as example.com into the IP address a computer connects to. Route 53 has three main jobs, which you can use together or separately:

1. **Domain registration**: buy and manage domain names.
2. **DNS routing**: answer DNS queries and send users to your resources, such as a load balancer, a CloudFront distribution or an S3 website.
3. **Health checks**: test whether resources are reachable and route traffic away from unhealthy ones.

## Routing policies

Each DNS record uses a **routing policy** that decides how Route 53 answers. The main ones:

| Policy | Use it to |
| --- | --- |
| Simple | Send traffic to a single resource |
| Weighted | Split traffic by percentages, for example 90/10 for testing a new version |
| Latency | Send users to the Region that gives them the lowest latency |
| Failover | Active-passive: use a backup when health checks show the primary is down |
| Geolocation | Route by where users are located, for example by country |
| Geoproximity | Route by the location of resources and users, and shift traffic between them |
| Multivalue answer | Return several healthy records chosen at random |

Exam clue: "users in each country must see content in their language" points to **geolocation**; "best performance for users worldwide" points to **latency**; "disaster recovery to a standby site" points to **failover**.

## CloudFront and Global Accelerator (recap)

The Global Infrastructure topic introduced both. In short, **Amazon CloudFront** is a CDN that **caches** content at edge locations, and **AWS Global Accelerator** gives **static IP addresses** and sends TCP or UDP traffic over the AWS global network to healthy endpoints. Route 53 often points a domain name at a CloudFront distribution.

## Front doors for applications

- **Elastic Load Balancing** (covered in the Compute topic) spreads traffic across healthy targets in multiple Availability Zones.
- **Amazon API Gateway** lets you create, publish, monitor and secure **REST, HTTP and WebSocket APIs** at any scale. It is the "front door" to backends such as AWS Lambda or EC2, and handles traffic management, authorization and monitoring. API Gateway with Lambda is a common serverless pattern.

## Common traps

- Route 53 resolves names and routes **DNS queries**; it does not cache content (CloudFront does).
- Latency routing is about the best **Region** for a user; geolocation is about the user's **location** regardless of speed.
- API Gateway manages APIs; it is not a load balancer for EC2 fleets.

## Key points

- Route 53 = domain registration, DNS routing and health checks.
- Pick the routing policy from the scenario: weighted, latency, failover, geolocation.
- CloudFront caches; Global Accelerator optimizes the network path.
- API Gateway is the managed front door for APIs.

## Sources

- [What is Amazon Route 53?](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)
- [Choosing a routing policy](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
