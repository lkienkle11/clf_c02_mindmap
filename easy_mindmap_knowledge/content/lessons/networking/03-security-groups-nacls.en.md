---
id: networking-security-groups-nacls
title: "Network security: security groups and network ACLs"
required: true
videoQuery: AWS security groups vs network ACLs stateful stateless explained
---
## Two layers of firewall

Traffic inside a VPC can be filtered at two places:

1. A **network access control list (network ACL)** checks traffic entering and leaving a **subnet**.
2. A **security group** checks traffic entering and leaving a **resource**, such as an EC2 instance.

Security groups alone can protect instances; network ACLs (every subnet has one; the default allows all traffic) add a second layer when you customize their rules (defense in depth).

## Security groups

- Act as a **virtual firewall for an instance** (more exactly, for its network interface).
- Support **allow rules only**; anything not allowed is denied.
- A new security group has **no inbound rules**, so nothing can come in until you add a rule, and one outbound rule that allows all outbound traffic.
- Are **stateful**: if a request is allowed in, the response is allowed out automatically, and the reverse.
- Rules can name another security group as the source, for example "allow database traffic only from the web servers' security group".

## Network ACLs

- Apply to **every resource in the subnets** they are associated with.
- Support **allow and deny** rules, so they can block a specific IP address range.
- Are **stateless**: return traffic must be allowed by its own rule.
- Rules are numbered and evaluated **in order, lowest number first**; the first match wins.
- The VPC's **default** network ACL allows all inbound and outbound traffic.

## Side by side

| Feature | Security group | Network ACL |
| --- | --- | --- |
| Level | Instance (network interface) | Subnet |
| Rules | Allow only | Allow and deny |
| State | Stateful | Stateless |
| Evaluation | All rules together | In number order, first match |

## Seeing the traffic

**VPC Flow Logs** record information about the IP traffic going to and from network interfaces in a VPC. They help you troubleshoot why traffic is blocked and support security monitoring.

## Common traps

- "Block one malicious IP address" needs a **deny** rule, so the answer is a network ACL, not a security group.
- "Stateful" goes with security groups; "stateless" goes with network ACLs.
- Under the shared responsibility model, **configuring** security groups and network ACLs is the customer's job.

## Key points

- Security groups protect instances, allow only, stateful.
- Network ACLs protect subnets, allow and deny, stateless, ordered rules.
- Use both for defense in depth.
- VPC Flow Logs capture information about network traffic.

## Sources

- [Infrastructure security in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html)
- [Security group rules](https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html)
- [Control subnet traffic with network access control lists](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
