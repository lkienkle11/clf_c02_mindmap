---
id: networking-vpc-peering-transit-gateway
title: "Connecting VPCs: VPC peering vs AWS Transit Gateway"
required: true
videoQuery: VPC peering vs AWS Transit Gateway hub and spoke explained
---
## Why connect VPCs

Large organizations run many VPCs: one per team, environment or account. Sometimes those VPCs must talk to each other privately. AWS offers two main answers, and exam questions test when to pick each.

## VPC peering

A **VPC peering connection** is a one-to-one networking link between two VPCs that lets them exchange traffic using private IP addresses, as if they were on the same network.

- The VPCs can belong to **different AWS accounts** and to **different Regions** (inter-Region peering).
- The VPCs must **not have overlapping CIDR blocks**.
- One VPC sends a request and the owner of the other accepts it. Then **each side adds a route** to the other VPC's range in its route table, and security groups may need updating.
- It is **not transitive**. If A is peered with B and with C, B and C still cannot talk through A; they need their own peering connection. Peering also does not let one VPC borrow another's internet gateway, NAT device, VPN or Direct Connect connection.
- It uses the existing VPC infrastructure, so there is no single point of failure or bandwidth bottleneck. There is no charge to create it; data transfer that crosses Availability Zones or Regions is charged.

With many VPCs, full connectivity needs a peering connection for every pair, a growing "mesh" that is hard to manage.

## AWS Transit Gateway

**AWS Transit Gateway** is a network transit hub that interconnects VPCs and on-premises networks. Each network connects once, through an **attachment**, to the hub instead of to every other network. It acts as a Regional virtual router.

- Attachments include VPCs, Site-to-Site VPN connections, Direct Connect gateways, peering connections with other transit gateways, and Client VPN endpoints.
- Transit gateway **route tables** decide which attachments can reach which others, so you can segment traffic.
- Transit gateways in different Regions can be linked with **inter-Region peering**.
- It is the "cloud router" in exam wording, and it removes the mesh of peering connections.
- Billing is per attachment per hour plus the amount of data processed.

## Peering vs Transit Gateway

| Aspect | VPC peering | Transit Gateway |
| --- | --- | --- |
| Topology | One-to-one | Hub and spoke |
| Transitive routing | No | Yes, through the hub and its route tables |
| On-premises connection | Cannot share a VPN or Direct Connect link | VPN and Direct Connect attach to the hub |
| Best for | A few VPCs, simple and cheap | Many VPCs, growing environments |
| Cost | No hourly fee for the connection | Per attachment per hour plus data processed |

## Choosing

- Connect **two** VPCs, or just a few, privately: **VPC peering**.
- Connect **many VPCs and on-premises networks** through one central point: **Transit Gateway**.
- Expose **one service** rather than join networks: **AWS PrivateLink** (previous lesson).
- A company with a Direct Connect link that expects hundreds of VPCs points to **Transit Gateway**, because VPN and Direct Connect connections attach to the hub once.

## Common traps

- "Peering chain" answers are wrong: peering is never transitive.
- Overlapping IP ranges block peering, so plan CIDR blocks early.
- A transit gateway is Regional; reaching other Regions uses peering between transit gateways.

## Key points

- VPC peering: one-to-one, private IPs, cross-account and cross-Region, no overlapping CIDRs, non-transitive, routes needed on both sides.
- Transit Gateway: Regional hub for many VPCs and on-premises networks, replaces a peering mesh.
- Choose by scale: few VPCs, peering; many networks, Transit Gateway.

## Sources

- [How VPC peering connections work](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html)
- [What is AWS Transit Gateway?](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)
- [What is VPC peering?](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html)
