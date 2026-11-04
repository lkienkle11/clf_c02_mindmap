---
id: networking-vpc-subnets-gateways
title: "VPC addressing and gateways in depth: IPs, NAT, egress-only and the default VPC"
required: true
videoQuery: AWS VPC CIDR public private subnet NAT gateway egress-only internet gateway explained
---
## Why go deeper

The first VPC lesson gave you the picture: a VPC, subnets, route tables, an internet gateway and a NAT gateway. This lesson fills in the details that exam questions rely on: how addresses work and which gateway handles which kind of traffic.

## Scope: what lives where

| Resource | Scope |
| --- | --- |
| VPC | One Region |
| Subnet | One Availability Zone |
| Internet gateway | Attached to one VPC |
| NAT gateway (standard, "zonal") | One Availability Zone |

A **default VPC** exists in each Region of a normal account. It comes with a default subnet in every Availability Zone, an attached internet gateway, and a route that sends internet-bound traffic to that gateway, so instances launched there can reach the internet at once. A VPC you create yourself (a nondefault VPC) has none of this unless you build it.

## IP addressing

- Every VPC has an IPv4 **CIDR block** between **/16** (65,536 addresses) and **/28** (16 addresses). AWS recommends private ranges from RFC 1918, such as 10.0.0.0/16. You can add secondary CIDR blocks later, but you cannot resize an existing block.
- A **private IPv4 address** is reachable only inside the network. Each instance gets one from its subnet's range.
- A **public IPv4 address** is taken from Amazon's pool and is not tied to your account; AWS may release it, so it is not a permanent address.
- An **Elastic IP address** is a static public IPv4 address that belongs to your account. You can remap it to another instance to hide a failure. AWS charges for all public IPv4 addresses, including Elastic IPs.
- **IPv6** addresses are globally unique and therefore public by default. Access is controlled by routing, security groups and network ACLs.

An instance needs a public IPv4 address (or an IPv6 address) and a route to the internet gateway to talk to the internet. A public IP alone, without that route, is not enough.

## Public, private and other subnets

A subnet is **public** when its route table has a route to an internet gateway, and **private** when it does not. Two more types appear in the documentation: a **VPN-only** subnet routes to a Site-to-Site VPN through a virtual private gateway, and an **isolated** subnet has no route to anything outside the VPC. AWS recommends private subnets to protect resources.

## NAT gateway and NAT instance

A **NAT gateway** lets resources in a private subnet start outbound connections while blocking unsolicited inbound ones.

- **Public** NAT gateway (the default): created in a **public subnet** and given an Elastic IP address; traffic leaves through the internet gateway.
- **Private** NAT gateway: for reaching other VPCs or on-premises networks, with no Elastic IP.
- It is **managed by AWS**: highly available inside its zone, scaling up to 100 Gbps, nothing to patch. You pay per gateway-hour and per GB processed.
- A standard NAT gateway lives in **one AZ**. If that zone fails, resources in other zones routed to it lose internet access, so create one per AZ and route each AZ to its own. AWS also offers a newer **regional** NAT gateway that spreads across AZs automatically; the exam concept is still the per-AZ gateway.
- You cannot attach a security group to a NAT gateway.

A **NAT instance** is an EC2 instance you configure to do NAT. You patch it, choose its size, and script failover. AWS recommends NAT gateways because they offer better availability and bandwidth and need less administration.

## Egress-only internet gateway

IPv6 addresses are public, so IPv6 instances would be reachable from the internet. An **egress-only internet gateway** allows **outbound-only IPv6** traffic, much like a NAT gateway does for IPv4. It is for IPv6 only, is stateful, and has no charge of its own.

## Which one?

| Need | Use |
| --- | --- |
| Two-way internet access for public instances | Internet gateway |
| Private IPv4 instances fetch updates, no inbound | NAT gateway |
| Outbound-only internet access over IPv6 | Egress-only internet gateway |
| Fixed public address you can move between instances | Elastic IP address |

## Key points

- VPC = Region; subnet = one AZ.
- Public subnet means a route to an internet gateway.
- NAT gateway: managed, sits in a public subnet, outbound only, one per AZ for resilience; prefer it to a NAT instance.
- Egress-only internet gateway = outbound-only IPv6.
- Elastic IP = static public IPv4 owned by your account.

## Sources

- [IP addressing for your VPCs and subnets](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html)
- [Compare NAT gateways and NAT instances](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html)
- [Egress-only internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/egress-only-internet-gateway.html)
