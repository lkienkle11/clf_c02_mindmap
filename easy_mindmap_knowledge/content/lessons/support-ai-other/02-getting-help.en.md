---
id: support-ai-other-getting-help
title: "Getting help and guidance: Trusted Advisor, re:Post, Professional Services, Partners and Marketplace"
required: true
videoQuery: AWS Trusted Advisor checks AWS re:Post AWS Partner Network AWS Marketplace explained
---
## AWS Trusted Advisor

**AWS Trusted Advisor** inspects your account and recommends improvements based on AWS best practices. Its checks fall into six categories:

- **Cost optimization**: idle or underused resources.
- **Performance**: speed and throughput.
- **Security**: for example, MFA on the root user or open security group ports.
- **Fault tolerance**: resilience gaps, such as resources in one Availability Zone.
- **Service limits**: usage close to a **service quota**.
- **Operational excellence**: operating best practices.

What you see depends on your plan:

- **Basic Support**: all **service limits** checks and a few **security** and **fault tolerance** checks, such as MFA on the root user and S3 bucket permissions.
- **Business Support+ and higher**: **all checks** and the Trusted Advisor API. Enterprise Support adds **Trusted Advisor Priority**, recommendations curated by your account team.

## Other places to find answers

- **AWS Health Dashboard**: AWS-side events and scheduled changes that affect your resources (see the deploy-operate topic). The **AWS Health API** needs Business Support+ or higher.
- **AWS re:Post**: AWS's community question-and-answer site. It also hosts the **AWS Knowledge Center**, official AWS articles that answer common customer questions.
- **Documentation, whitepapers, blogs and AWS Prescriptive Guidance** on the AWS websites.
- **AWS Trust and Safety team**: where anyone reports **abuse** that comes from AWS resources, such as spam.

## People who help you build

- **AWS Professional Services**: AWS's own experts working on customer projects, often with partners. **AWS solutions architects** also give technical guidance.
- **AWS Partner Network (APN)**: a global community of companies that build on AWS, such as **independent software vendors (ISVs)** and **consulting or system integrator** partners. Partners get training, certification and events.
- **AWS Marketplace**: a curated digital catalog to **find, buy and deploy third-party software, data and services**, such as SaaS products and AMIs, with pricing such as hourly, annual or bring your own license (BYOL). Charges appear on **your AWS bill**.

## Which resource?

| Clue in the question | Answer |
| --- | --- |
| "Check the account for cost, security and quota issues" | AWS Trusted Advisor |
| "Ask the community" or "official how-to article" | AWS re:Post, AWS Knowledge Center |
| "Report that an EC2 instance is sending spam" | AWS Trust and Safety team |
| "Hire a consulting company with AWS expertise" | AWS Partner Network |
| "Buy a third-party firewall and pay on the AWS bill" | AWS Marketplace |

## Common traps

- Trusted Advisor only **recommends**; the AWS Health Dashboard reports events.
- Marketplace sells **third-party** products; Professional Services is **AWS's** own team.

## Key points

- Trusted Advisor: six categories; Basic sees service limits plus a few other checks.
- re:Post and the Knowledge Center answer questions; Trust and Safety handles abuse.
- Partners and Professional Services help you build; Marketplace sells third-party products.

## Sources

- [AWS Trusted Advisor](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html)
- [AWS Trusted Advisor check reference](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html)
- [What is AWS Marketplace?](https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html)
