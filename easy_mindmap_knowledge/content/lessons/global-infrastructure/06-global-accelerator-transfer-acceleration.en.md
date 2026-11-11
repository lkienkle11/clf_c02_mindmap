---
id: global-infrastructure-global-accelerator-transfer-acceleration
title: AWS Global Accelerator and Amazon S3 Transfer Acceleration
required: true
videoQuery: AWS Global Accelerator vs CloudFront vs S3 Transfer Acceleration
---
## Two services, one idea

Internet traffic crosses many networks and each hop adds delay and risk. Both services in this lesson shorten that journey by letting users enter the **AWS global network** at a nearby edge location and travel on it for the rest of the way. They solve different problems, which is exactly what the exam tests.

## AWS Global Accelerator

**AWS Global Accelerator** improves the availability and performance of internet applications used by a global audience. You create an **accelerator**, and AWS gives it **two static IPv4 addresses** (four addresses with dual-stack: two IPv4 and two IPv6). These addresses are **anycast** addresses announced from the AWS edge network, so a user is routed to a nearby edge location, then carried over the AWS network to your application. Global Accelerator is itself a global service.

What to remember:

- **Endpoints**: Network Load Balancers, Application Load Balancers, EC2 instances or Elastic IP addresses, in one Region or several.
- **Health checks and failover**: it monitors endpoints and sends traffic only to healthy ones, shifting away from an unhealthy endpoint in under a minute according to AWS. Because it uses fixed IP addresses, clients do not depend on DNS caching to learn about a change.
- **Protocols**: it works with TCP and UDP, so it suits gaming, VoIP and other non-HTTP traffic as well as HTTP applications that need static IPs.
- **Custom routing accelerators** are a variant that map specific users to a specific destination, for example a particular game session.
- **Pricing**: pay as you go with no long-term commitment.

Static IPs are useful when customers must add your addresses to a firewall allow list, or when you want to move the back end between Regions without changing the addresses.

## Amazon S3 Transfer Acceleration

**Amazon S3 Transfer Acceleration** is a feature of an Amazon S3 bucket that speeds up transfers of files over long distances between a client and the bucket. When it is enabled, data goes to the nearest **edge location** (it uses the CloudFront edge network) and is then sent to S3 over an optimized network path.

Key facts:

- It is a **bucket-level setting** that you turn on; the bucket owner enables it.
- You then use a special endpoint of the form `bucket-name.s3-accelerate.amazonaws.com`. The bucket name must be DNS-compliant and cannot contain periods.
- It helps most when users upload from far away to one central bucket, when you move gigabytes to terabytes across continents, or when you cannot use your available bandwidth over the internet. Distance and object size matter, and a speed comparison tool lets you check the benefit first.
- Extra data transfer charges can apply. For each transfer S3 checks whether acceleration is likely to be faster, and AWS says it does not charge for acceleration on a transfer where it is not.

It is not a caching service and it does not change where your data is stored: the data still ends up in the bucket's Region.

## Which service for which question?

| Need | Choose |
| --- | --- |
| Cache web content (images, video, pages) near users | **Amazon CloudFront** |
| Static IP addresses and fast failover for TCP or UDP applications | **AWS Global Accelerator** |
| Route users by DNS name, health or latency to endpoints | **Amazon Route 53** |
| Faster uploads from distant users to an S3 bucket | **Amazon S3 Transfer Acceleration** |
| Move very large data sets physically | AWS Snow Family (see the storage and migration lessons) |

## Common traps

- "Caching" of web content points to CloudFront; Global Accelerator does not cache content, it improves the network path to your application.
- Route 53 answers a DNS question with an address; Global Accelerator gives you addresses that never change and then carries the traffic on the AWS network.
- Transfer Acceleration is for S3 uploads and downloads. It does not speed up EC2 or database traffic.
- None of these services replaces choosing a good Region.

## Key points

- Global Accelerator: static anycast IPs, AWS global network, health-based routing, TCP/UDP, global service.
- CloudFront caches; Global Accelerator accelerates the network path; Route 53 is DNS.
- S3 Transfer Acceleration speeds long-distance transfers to and from an S3 bucket through edge locations, via a special endpoint.
- Both use edge locations and the AWS backbone.

## Sources

- [What is AWS Global Accelerator?](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- [AWS Global Accelerator FAQs](https://aws.amazon.com/global-accelerator/faqs/)
- [Amazon S3 Transfer Acceleration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html)
