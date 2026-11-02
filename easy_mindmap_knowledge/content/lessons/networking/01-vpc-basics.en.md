---
id: networking-vpc-basics
title: "Amazon VPC basics: subnets, route tables and gateways"
required: true
videoQuery: Amazon VPC explained subnets route tables internet gateway NAT gateway
---
## Your own network in the cloud

**Amazon Virtual Private Cloud (Amazon VPC)** lets you launch AWS resources into a **logically isolated virtual network** that you define. It looks much like a network in your own data center: you pick the IP address range, split it into subnets, and decide how traffic flows. A VPC belongs to one Region. Accounts normally come with a **default VPC** in each Region, ready to use, and you can create your own.

## IP ranges and subnets

- You give the VPC an IP address range written in **CIDR notation**, for example 10.0.0.0/16. A smaller number after the slash means a larger range.
- A **subnet** is a smaller range inside the VPC. Each subnet sits **entirely in one Availability Zone** and cannot span zones.
- To survive an AZ failure, place subnets (and the resources in them) in **at least two AZs**.

## Route tables

A **route table** holds routes: each route says "traffic for this destination goes to this target". Every subnet is associated with a route table, either one you choose or the VPC's main route table. Routing is what makes a subnet public or private.

## Gateways to the internet

- **Internet gateway**: attached to a VPC, it lets resources with public IP addresses talk to the internet in both directions.
- **NAT gateway**: lets instances in a **private** subnet start connections **out** to the internet (for example, to download software updates), while the internet **cannot start** connections to them. A public NAT gateway sits in a public subnet and sends traffic out through the internet gateway.

| Subnet type | Route to internet gateway? | Typical resources |
| --- | --- | --- |
| Public subnet | Yes, a direct route | Load balancers, bastion hosts, public NAT gateways |
| Private subnet | No; outbound access through a NAT gateway | Application servers, databases |

A common layout uses a public and a private subnet in each of two AZs: the load balancer sits in the public subnets, and the application servers and databases sit in the private subnets.

## Common traps

- A subnet is public because of its **route** to an internet gateway, not because of its name.
- A NAT gateway is for **outbound** traffic only; it does not let users on the internet reach a private instance.
- An internet gateway is attached to a whole **VPC**, not to a single instance.

## Key points

- A VPC is an isolated virtual network in one Region with an IP range you choose.
- Each subnet lives in one Availability Zone.
- Route tables decide where traffic goes; a route to an internet gateway makes a subnet public.
- NAT gateways give private subnets outbound-only internet access.

## Sources

- [How Amazon VPC works](https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html)
- [Subnets for your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html)
- [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
