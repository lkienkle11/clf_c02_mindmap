---
id: networking-vpc-endpoints-privatelink
title: "VPC endpoints and AWS PrivateLink: private access without the internet"
required: true
videoQuery: VPC endpoints gateway vs interface endpoint AWS PrivateLink explained
---
## The problem

By default, an instance in a private subnet reaches an AWS service such as Amazon S3 through a NAT gateway and the internet gateway, over public service addresses. That works, but it adds a NAT cost and sends the request along an internet-facing path. **VPC endpoints** give your VPC a private way to reach a service instead.

An exam question such as "access an S3 bucket from an EC2 instance without using the internet" points to a **VPC endpoint**.

## Two main kinds of endpoint

| | Gateway endpoint | Interface endpoint |
| --- | --- | --- |
| Supported services | **Amazon S3** and **Amazon DynamoDB** only | Many AWS services, AWS Partner services and your own services |
| How it works | You add a route to the endpoint in the route table | AWS creates an elastic network interface with a private IP address in your subnet |
| Powered by AWS PrivateLink? | No | Yes |
| Extra cost | None | Additional cost (see AWS pricing) |

Remember: **gateway endpoints are only for S3 and DynamoDB**. A gateway endpoint needs no internet gateway or NAT device. It does not extend to on-premises networks, peered VPCs in other Regions, or a transit gateway; for S3 those cases need an interface endpoint.

## AWS PrivateLink

**AWS PrivateLink** provides private connectivity between VPCs, supported AWS services and your on-premises networks, using private IP addresses and without exposing traffic to the public internet. Traffic between the endpoint and the service stays within the AWS network.

It has two sides:

- A **service provider** creates an *endpoint service* (it must put a load balancer in front) and decides which AWS accounts may connect. Providers can be AWS, AWS Partners, or another account of yours.
- A **service consumer** creates an interface endpoint in its own VPC. The provider can accept or reject the connection request.

So PrivateLink lets you offer a service (for example a SaaS application or an internal API) to **other VPCs and accounts** without peering the networks and without exposing it to the public internet. It also reduces NAT and data-transfer costs.

An exam question that says "connect supported AWS services and VPCs privately, without exposing traffic to the public internet" points to **AWS PrivateLink**. A question about S3 specifically, with no mention of PrivateLink, points to a **VPC endpoint** (gateway type in the classic case).

## Endpoint policies

A **VPC endpoint policy** is an IAM resource policy attached to the endpoint. It controls which principals can use that endpoint to reach the service, for example only one S3 bucket or only one account. The default policy allows everything through the endpoint.

## Shared responsibility

AWS runs the endpoint infrastructure. You decide where to create endpoints, edit route tables, apply endpoint policies, and manage the security groups on interface endpoints.

## Common traps

- Gateway endpoint does not mean internet gateway or NAT gateway; it is a separate thing.
- NAT gateway is for reaching the internet; an endpoint is for reaching AWS services privately.
- PrivateLink is not VPC peering: peering joins two whole networks, PrivateLink exposes one service.

## Key points

- VPC endpoints let a VPC reach services privately; traffic stays on the AWS network.
- Gateway endpoint: S3 and DynamoDB only, route-table based, no extra cost.
- Interface endpoint: powered by AWS PrivateLink, private IP in your subnet, billed.
- PrivateLink also shares a service with other VPCs and accounts.
- Endpoint policies restrict what the endpoint can be used for.

## Sources

- [AWS PrivateLink concepts](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html)
- [Gateway endpoints for Amazon S3](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)
- [AWS PrivateLink](https://aws.amazon.com/privatelink/)
