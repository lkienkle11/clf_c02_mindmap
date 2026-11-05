---
id: iam-security-ddos-waf-shield-firewall-manager
title: "Blocking attacks: AWS Shield, AWS WAF and AWS Firewall Manager"
required: true
videoQuery: AWS Shield Standard vs Advanced vs AWS WAF vs Firewall Manager explained
---
## Three tools, three jobs

| Tool | Job |
| --- | --- |
| **AWS Shield** | Defends against DDoS attacks |
| **AWS WAF** | Filters web requests with rules you define |
| **AWS Firewall Manager** | Applies those protections centrally across accounts |

A DDoS attack tries to flood a target so legitimate users cannot reach it. These services act on traffic; **Amazon GuardDuty** only detects and reports (next lessons).

## AWS Shield

**Shield Standard** is automatic and costs nothing extra for every AWS customer. It defends against the most common, frequent **network and transport layer** DDoS attacks. The benefit is greatest for Amazon Route 53 hosted zones, Amazon CloudFront distributions and AWS Global Accelerator standard accelerators.

**Shield Advanced** is a paid subscription (a monthly fee and a one-year commitment) for **resources you explicitly protect**:

- Amazon CloudFront distributions, Route 53 hosted zones, Global Accelerator standard accelerators, EC2 Elastic IP addresses, and Application and Classic Load Balancers.
- Expanded protection against network, transport and **application layer** attacks, with automatic application layer mitigation that uses AWS WAF.
- **Real-time metrics and reports** on attacks, through the console, API and CloudWatch.
- The **Shield Response Team (SRT)**, available at any time during an attack, if you also have a Business or Enterprise Support plan. Exam wording may call it the "DDoS response team" or "DRT".
- **Cost protection** against bill spikes from an attack, as Shield Advanced service credits.
- Standard AWS WAF charges are covered for the resources it protects, and Firewall Manager Shield Advanced policies come at no extra charge.

Choose Standard for "automatic protection at no cost". Choose Advanced for "response experts", "visibility into attacks" or "cost protection".

## AWS WAF

**AWS WAF** is a web application firewall that inspects **HTTP(S) requests** sent to a protected resource. You attach a **web ACL** (called a *protection pack* in the newer console) containing rules to:

- Amazon CloudFront distributions, Application Load Balancers, Amazon API Gateway REST APIs,
- AWS AppSync GraphQL APIs, Amazon Cognito user pools, AWS App Runner services and a few more.

An EC2 web server is protected by putting an Application Load Balancer in front of it, and attaching the web ACL there.

Rules can match **SQL injection** and **cross-site scripting**, IP addresses, **countries**, strings in headers or the query string, and request size. **Rate-based rules** limit floods from one source, and AND, OR and NOT combine statements. Actions are **allow**, **block** (HTTP 403 by default), **count**, and CAPTCHA or Challenge. You can send WAF logs to a destination you choose. AWS also offers managed rule groups so you need not write every rule.

Typical questions: "block SQL injection or cross-site scripting", "block users in certain countries", "custom conditions on inbound web traffic" and "detailed logging of access to ecommerce applications" all mean WAF. WAF does not stop a volumetric network-layer flood; that is Shield.

## AWS Firewall Manager

**AWS Firewall Manager** sets up protections once and applies them across **accounts and resources** in AWS Organizations, including new ones. It needs AWS Organizations, a Firewall Manager administrator account and AWS Config enabled. Policy types include:

- AWS WAF rules and Shield Advanced protection,
- Amazon VPC **security groups** and network ACLs,
- AWS Network Firewall (covered in the networking topic) and Route 53 Resolver DNS Firewall.

You pay for the underlying services, such as AWS WAF and AWS Config. A requirement such as "centrally configure security groups across the organization's accounts" means Firewall Manager, not WAF (which filters web requests in one place) or GuardDuty.

## Which layer?

| Need | Answer |
| --- | --- |
| Automatic DDoS protection for everyone | Shield Standard |
| DDoS experts, attack metrics, cost protection | Shield Advanced |
| Block web exploits, countries, bad IPs | AWS WAF |
| Manage WAF, Shield, security groups across accounts | Firewall Manager |
| Filter by port and IP at the instance or subnet (they cannot spot SQL injection) | Security groups and network ACLs |
| Inspect traffic for the whole VPC | AWS Network Firewall |

## Key points

- Shield Standard is automatic and free; Advanced is paid and adds the SRT, visibility and cost protection.
- WAF filters web requests with rules on a web ACL attached to CloudFront, ALB, API Gateway and others.
- Firewall Manager centralizes WAF, Shield Advanced, security group and Network Firewall policies across an organization.

## Sources

- [How AWS Shield and Shield Advanced work](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-overview.html)
- [AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html)
- [AWS Firewall Manager](https://docs.aws.amazon.com/waf/latest/developerguide/fms-chapter.html)
