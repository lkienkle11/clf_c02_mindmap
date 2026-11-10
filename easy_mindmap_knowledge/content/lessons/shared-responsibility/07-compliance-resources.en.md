---
id: shared-responsibility-compliance
title: "Compliance on AWS: AWS Artifact, compliance programs and data residency"
required: true
videoQuery: AWS Artifact compliance reports agreements and AWS compliance programs explained
---
## Compliance is shared too

AWS has its infrastructure audited against many standards. That helps, but it does **not** make your workload compliant on its own. AWS states that **customers remain responsible for complying with the laws and regulations that apply to them**. AWS proves the security **of** the cloud; you must show how you secure what you run **in** it.

## AWS compliance programs

AWS groups its programs into three kinds:

| Kind | What it means | Examples |
| --- | --- | --- |
| Certifications and attestations | Independent third-party auditors assess AWS | SOC 1, SOC 2, SOC 3, ISO 27001, PCI DSS, FedRAMP |
| Laws, regulations and privacy | AWS supports customers who must meet these rules | HIPAA, GDPR |
| Alignments and frameworks | Published requirements for an industry or function | NIST frameworks |

Not every service is in scope for every program. The **AWS Services in Scope by Compliance Program** page lists which services are covered, so check it before you choose a service for a regulated workload.

## AWS Artifact

**AWS Artifact** is the place in the AWS Management Console to get compliance information **on demand and at no cost**:

- **Reports**: download AWS security and compliance documents, such as **SOC reports**, **PCI** attestations and **ISO** certifications. You can give them to your auditors or regulators as evidence, or use them to evaluate your own controls.
- **Agreements**: review, accept and track agreements with AWS for one account or a whole organization. Example: a company subject to **HIPAA** accepts a **Business Associate Addendum (BAA)** before it processes protected health information.

## Data residency and sovereignty

Some laws require data to stay in a particular country or region. On AWS:

- **You choose the AWS Region** where your content is stored.
- AWS states that it **will not move or replicate your content outside the Regions you choose** except where needed to provide a service you started or to comply with the law or a binding government order.
- **You own your content** and control who can access it.

So "data must remain in Germany" points to choosing a Region in that country.

## Common traps

- "Download a SOC 2 report" or "find the PCI attestation for AWS" means **AWS Artifact**.
- "Accept a BAA for HIPAA" also means **AWS Artifact** (agreements).
- "AWS is PCI DSS compliant, so our application is automatically compliant" is **false**.
- Data residency is met by **choosing Regions**; AWS does not move or replicate content outside them, except as needed to provide services you started or to comply with the law or a binding government order.

## Key points

- AWS compliance covers the infrastructure; customers stay responsible for their own compliance.
- Artifact = free, self-service access to AWS compliance reports and agreements.
- Check which services are in scope for a program before using them for regulated data.
- Customers choose Regions, own their content and control access to it.

## Sources

- [What is AWS Artifact?](https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html)
- [AWS compliance programs](https://aws.amazon.com/compliance/programs/)
- [Data privacy FAQ](https://aws.amazon.com/compliance/data-privacy-faq/)
