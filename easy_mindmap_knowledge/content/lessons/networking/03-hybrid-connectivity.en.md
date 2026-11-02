---
id: networking-hybrid-connectivity
title: "Connecting networks: Site-to-Site VPN, Direct Connect, VPC peering and Transit Gateway"
required: true
videoQuery: AWS Site-to-Site VPN vs Direct Connect vs VPC peering vs Transit Gateway
---
## The problem

Companies rarely have just one network. They need to link their **data center** to AWS, and link **VPCs** to each other. AWS offers several ways, and exam questions ask you to pick the right one.

## On-premises to AWS

**AWS Site-to-Site VPN**

- An **encrypted IPsec** connection between your network and your VPC that travels **over the internet**.
- Each connection has **two tunnels** for high availability. On the AWS side it ends at a virtual private gateway or a transit gateway; on your side, at a customer gateway device.
- Quick to set up and low cost, but performance depends on the internet.

**AWS Direct Connect**

- A **dedicated, private network connection** from your data center, office or colocation site to AWS through a Direct Connect location. Traffic does **not** cross the public internet.
- Gives more **consistent performance** and higher bandwidth than internet connections, and can reduce network costs for large data volumes.
- Setup needs a physical connection at a Direct Connect location, often arranged through a partner.
- It is **not encrypted by default**; you can add encryption, for example by running a VPN over it.

## VPC to VPC

**VPC peering** connects **two** VPCs so they can talk using private IP addresses, even across accounts and Regions. Their IP ranges must not overlap. Peering is **not transitive**: if A peers with B and B peers with C, A still cannot reach C through B.

**AWS Transit Gateway** is a **central hub** (a Regional virtual router) that connects many VPCs and on-premises networks. Instead of a mesh of peering connections, each network attaches once to the hub.

## Choosing

| Need | Choose |
| --- | --- |
| Encrypted connection to AWS quickly, over the internet | Site-to-Site VPN |
| Private, consistent, high-bandwidth link that avoids the internet | Direct Connect |
| Connect two VPCs privately | VPC peering |
| Connect many VPCs and on-premises networks through one hub | Transit Gateway |

A common pattern uses **both**: Direct Connect as the main link and a Site-to-Site VPN as a lower-bandwidth backup.

## Common traps

- "Dedicated" or "does not use the public internet" means Direct Connect; "encrypted over the internet" means Site-to-Site VPN.
- Direct Connect alone is not encrypted.
- VPC peering does not chain; for hub-and-spoke designs, use Transit Gateway.

## Key points

- Site-to-Site VPN: IPsec over the internet, fast to set up.
- Direct Connect: dedicated private connection, consistent performance.
- VPC peering: one-to-one, non-transitive.
- Transit Gateway: one hub for many networks.

## Sources

- [What is AWS Site-to-Site VPN?](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [AWS Direct Connect, Amazon VPC connectivity options](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect.html)
- [How VPC peering connections work](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html)
