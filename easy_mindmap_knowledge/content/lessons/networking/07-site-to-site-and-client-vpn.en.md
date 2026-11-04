---
id: networking-site-to-site-and-client-vpn
title: "AWS VPN options and Direct Connect: Site-to-Site VPN, Client VPN and when to choose each"
required: true
videoQuery: AWS Site-to-Site VPN vs Client VPN vs Direct Connect explained
---
## Three ways in

The hybrid lesson introduced Site-to-Site VPN and Direct Connect. This lesson adds **AWS Client VPN** and sets all three side by side, because exam questions describe a situation and ask which one fits. The key is to decide first who is connecting: a whole **network** (an office or data center) or an individual **person**.

## AWS Site-to-Site VPN

**AWS Site-to-Site VPN** (called **AWS VPN** in some exam wording, and AWS Managed VPN in older material) creates an encrypted IPsec connection between your network and your VPC.

- Each VPN connection has **two VPN tunnels** that you can use at the same time for high availability.
- On the AWS side it ends at a **virtual private gateway** (attached to a single VPC) or at a **transit gateway** (shared by many VPCs). On your side it ends at a **customer gateway device**, which can be a physical appliance or software.
- Traffic is encrypted, but it travels over the **public internet**, so speed and latency vary.
- You pay for each connection-hour the VPN is provisioned, plus data transfer out to the internet.
- A VPN is a fast, low-cost choice when you need secure connectivity soon and the internet path is acceptable.

## AWS Client VPN

**AWS Client VPN** is a **managed, client-based VPN service** for **remote users**. An employee installs an OpenVPN-based client on a laptop and connects to a Client VPN endpoint, then reaches resources in AWS **and** in your on-premises network from any location.

- It is **managed**: AWS handles availability and scales with the number of users, so you do not run VPN servers.
- Connections use TLS. Authentication can use Active Directory, federated sign-in or certificates.
- You control access with authorization rules and security groups.
- You pay for each endpoint association and each active connection per hour, plus data transfer.

Think "people" for Client VPN and "sites" for Site-to-Site VPN.

## AWS Direct Connect

**AWS Direct Connect** is a **dedicated private network connection** from your location to AWS through a Direct Connect location. It bypasses internet service providers in the path.

- It gives more **consistent network performance** than internet-based links.
- It is **not encrypted by default**. Options exist to add encryption; for example MACsec encrypts traffic between your network and the AWS connection point on supported high-speed dedicated connections.
- You need to be in, or work with a partner who reaches, a Direct Connect location, and a physical cross-connect has to be arranged. It usually takes longer to get started than a VPN.
- You pay for port hours and outbound data transfer.
- A Site-to-Site VPN can serve as a backup: if you configure one, traffic fails over to the VPN when Direct Connect is down.

## Comparison

| | Site-to-Site VPN | Client VPN | Direct Connect |
| --- | --- | --- | --- |
| Connects | A network to a VPC | Individual remote users | A network to AWS |
| Path | Public internet | Public internet | Private dedicated link |
| Encrypted by default | Yes (IPsec) | Yes (TLS) | No |
| Performance | Varies with the internet | Varies with the internet | Consistent |
| Setup | Fast | Fast | Slower, physical connection |
| Typical trigger words | "Encrypted over the internet, quickly" | "Remote employees, laptops" | "Dedicated, consistent, not over the internet" |

## Common traps

- "Dedicated" or "does not use the internet" is Direct Connect; "within a week" and "encrypted" points to Site-to-Site VPN.
- Remote workers connecting from home are Client VPN, not Site-to-Site VPN.
- Direct Connect plus encryption needs an extra step; do not assume it is encrypted.
- Amazon Connect (a contact center) and Direct Connect have similar names and nothing else in common.

## Key points

- Site-to-Site VPN: IPsec, two tunnels, internet path, network to VPC, fast to set up.
- Client VPN: managed, OpenVPN-based, remote users to AWS and on-premises resources.
- Direct Connect: dedicated private link, consistent performance, not encrypted by default.
- Pick by who connects and how much consistency you need.

## Sources

- [What is AWS Site-to-Site VPN?](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [What is AWS Client VPN?](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html)
- [What is AWS Direct Connect?](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html)
