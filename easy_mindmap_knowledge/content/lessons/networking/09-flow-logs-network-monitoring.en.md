---
id: networking-flow-logs-network-monitoring
title: "Seeing and filtering network traffic: VPC Flow Logs, Traffic Mirroring and AWS Network Firewall"
required: false
videoQuery: VPC Flow Logs and AWS Network Firewall overview for beginners
---
## Optional: monitoring and protecting a VPC

This lesson is optional but covers services that appear as answers or distractors in exam questions.

## VPC Flow Logs

**VPC Flow Logs** capture information about the **IP traffic going to and from network interfaces** in your VPC. You can create a flow log for a whole VPC, a subnet or one network interface.

- Records describe flows (for example addresses, ports, protocol and whether traffic was accepted or rejected), not the content of the packets.
- Logs are published to **Amazon CloudWatch Logs**, **Amazon S3** or **Amazon Data Firehose**.
- Collection happens outside the traffic path, so it does not affect network throughput or latency.
- Typical uses: finding out why traffic is blocked (for example overly restrictive security group rules), watching what reaches an instance, and security investigations.
- Not all traffic is logged; for instance, traffic to the Amazon DNS server, DHCP traffic and instance metadata traffic are excluded.
- Publishing costs money (log ingestion and storage fees).

Exam pointer: "log information about inbound and outbound traffic on network interfaces in a VPC" means **VPC Flow Logs**, not CloudTrail (which records API calls) and not CloudWatch metrics.

## Traffic Mirroring

**Traffic Mirroring** copies network traffic from a network interface to out-of-band security and monitoring appliances for content inspection, threat monitoring and troubleshooting. Flow Logs show metadata about flows; mirroring gives the packets themselves to your tools. For pricing, see the Amazon VPC pricing page. It is rarely the answer, but it appears among the options in some questions.

## AWS Network Firewall

**AWS Network Firewall** is a **managed, stateful network firewall and intrusion detection and prevention service** for your VPC. It filters traffic at the VPC perimeter, including traffic to and from an internet gateway, a NAT gateway, a VPN or Direct Connect.

- It supports stateless and stateful rules, domain-name filtering and deep packet inspection.
- AWS manages and scales the infrastructure; you place firewall endpoints in dedicated subnets and change route tables to send traffic through them.
- It controls layer 3 to 7 traffic for the whole VPC.
- AWS Firewall Manager can manage Network Firewall across accounts.

## Where each control fits

| Control | Protects | Level |
| --- | --- | --- |
| Security group | Resource network interface | Instance, stateful, allow rules |
| Network ACL | Subnet | Subnet, stateless, allow and deny |
| AWS Network Firewall | Traffic at the VPC edge | Managed firewall and IPS for the VPC |
| AWS WAF | Web applications | Web requests, for example blocking SQL injection patterns |
| AWS Shield | Resources under DDoS attack | DDoS protection (Shield Advanced is the paid tier) |

Network Firewall complements these controls rather than replacing them, and it is not meant to stop volumetric DDoS attacks; AWS points to AWS Shield Advanced for that.

## Where CloudWatch and CloudTrail fit

Flow logs can land in CloudWatch Logs, but monitoring dashboards, alarms and API auditing belong to Amazon CloudWatch and AWS CloudTrail, covered in the Deploying and Operating topic.

## Key points

- VPC Flow Logs record IP traffic metadata for network interfaces, to CloudWatch Logs, S3 or Firehose.
- Traffic Mirroring copies actual packets to inspection tools.
- AWS Network Firewall: managed stateful VPC firewall and IPS.
- Security groups and NACLs stay in place; WAF protects web apps; Shield protects against DDoS.

## Sources

- [Logging IP traffic using VPC Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html)
- [What is AWS Network Firewall?](https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html)
- [What is Traffic Mirroring?](https://docs.aws.amazon.com/vpc/latest/mirroring/what-is-traffic-mirroring.html)
