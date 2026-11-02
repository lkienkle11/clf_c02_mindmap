---
id: global-infrastructure-edge
title: Edge locations, Amazon CloudFront and AWS Global Accelerator
required: true
videoQuery: AWS edge locations CloudFront vs Global Accelerator
---
## What an edge location is

An **edge location** (also called a point of presence) is a site in the AWS network placed **close to end users**, in many locations spread around the world. Edge locations are **not** Availability Zones. They serve content and accept user traffic near the user, then carry it over the AWS global network.

The idea behind them: the shorter the distance between a user and the first AWS server they reach, the lower the **latency** (delay).

## Amazon CloudFront: content delivery network

**Amazon CloudFront** is AWS's content delivery network (CDN). It speeds up delivery of web content such as HTML, images, video and API responses.

How it works, step by step:

1. You keep the original files in an **origin**, for example an Amazon S3 bucket or a web server.
2. A user requests a file; CloudFront routes the request to the edge location with the **lowest latency** for that user.
3. If the file is already **cached** there, it is returned immediately. If not, CloudFront fetches it from the origin, returns it and keeps a copy for the next user.

Benefits: faster loading for users far from the origin, less load on the origin, and better availability because copies are cached in many places.

## AWS Global Accelerator: a faster network path

**AWS Global Accelerator** gives your application **static IP addresses** that are announced from AWS edge locations. User traffic enters the AWS global network at the nearest edge and travels on that network to the best healthy endpoint, such as a load balancer or EC2 instance, in one or more Regions. It reacts quickly when an endpoint becomes unhealthy.

## Which one fits?

| Need | Better choice |
| --- | --- |
| Cache images, videos or web pages near users | Amazon CloudFront |
| Speed up TCP or UDP traffic, such as gaming or VoIP | AWS Global Accelerator |
| Fixed static IP addresses for a global application | AWS Global Accelerator |
| Fast failover between Regions for a non-cacheable app | AWS Global Accelerator |

Both services use the AWS edge network; the key difference is that **CloudFront caches content**, while Global Accelerator **improves the network path** to your application.

## Key points

- Edge locations sit close to users and are separate from Regions and AZs.
- CloudFront is a CDN that caches content at edge locations to reduce latency.
- Global Accelerator provides static IP addresses and routes traffic over the AWS global network to healthy endpoints.
- "Cache" in a question points to CloudFront; "static IP" or "TCP/UDP" points to Global Accelerator.

## Sources

- [What is Amazon CloudFront?](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [What is AWS Global Accelerator?](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- [AWS Global Accelerator FAQs](https://aws.amazon.com/global-accelerator/faqs/)
