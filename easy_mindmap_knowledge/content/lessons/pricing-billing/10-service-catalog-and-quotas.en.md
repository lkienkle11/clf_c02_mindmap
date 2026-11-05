---
id: pricing-billing-service-catalog-and-quotas
title: "AWS Service Catalog, Service Quotas and License Manager: approved products, limits and licenses"
required: true
videoQuery: AWS Service Catalog portfolios products vs CloudFormation, Service Quotas, License Manager explained
---
## Governing what teams can launch, how much, and under which license

Three services help an organization stay in control as many teams use AWS: **Service Catalog** controls *what* they may launch, **Service Quotas** shows *how much* they may use, and **License Manager** tracks *which software licenses* they consume.

## AWS Service Catalog

**AWS Service Catalog** lets an organization create and manage a **catalog of IT services that are approved for use on AWS**. Administrators publish them; end users browse the catalog and launch only what they are allowed to, in a few clicks, without needing broad permissions on the underlying services.

Vocabulary:

- **Product**: an approved IT service, usually built by importing an **AWS CloudFormation template**. It can be a single server or a full multi-tier application. Terraform configurations are also supported, and a product can be a packaged AWS Marketplace product.
- **Portfolio**: a collection of products plus the rules for who may use them. You create portfolios for different kinds of users and grant access through IAM.
- **Constraints**: limits on how a product can be deployed. **Launch constraints** name the IAM role used to provision resources, **template constraints** restrict parameters such as instance type, and **notification constraints** send stack events to an Amazon SNS topic.
- **Provisioned product**: what a user gets after launching; it is a CloudFormation stack.
- **Versions**: update a product once and the new version is available in every portfolio that includes it.
- **Sharing**: portfolios can be shared with other accounts, including across an organization.

Benefits: **standardization**, **self-service**, **fine-grained access control** and consistent **governance and compliance**. Service Catalog charges are based on API calls above a monthly free allowance.

### Service Catalog vs lookalikes

| Need | Service |
| --- | --- |
| Write reusable templates that deploy resources | **CloudFormation** |
| Let others launch only **approved, governed** templates (self-service with guardrails) | **Service Catalog** |
| Create, group and govern accounts, SCPs, one bill | **Organizations** |
| Set up a whole multi-account environment with controls | **Control Tower** (which itself uses Service Catalog for Account Factory) |
| Buy third-party software | **AWS Marketplace** |

Exam wording such as "manage deployed IT services and govern IaC templates", "approved products", "control who can deploy" or "meet compliance requirements" points to Service Catalog. "Create templates that can be reused to deploy resources" is plain CloudFormation.

## AWS Service Quotas

Every AWS service has **quotas** (also called **limits**): the maximum number of resources or operations for an account or Region, such as the number of VPCs per Region. Each service sets **default values**.

**AWS Service Quotas** is the central place to:

- **View** the quotas of AWS services, including which ones are **adjustable**.
- **Request an increase** when the default does not meet your needs. Increases take time to review and AWS may approve, deny or partly approve.
- **See utilization** of a quota and use **automatic management** to be notified before you run out.

Notes for the exam:

- Many quotas are **per Region and per account**; each Region has its own values. Spreading workloads over several accounts spreads quotas too.
- **Quotas protect you** from accidental over-provisioning and runaway cost, as well as protecting the service.
- Planning ahead for quotas is a **reliability** design practice, not something to leave until a launch fails.
- **Trusted Advisor** has a service limits check that reports usage near a quota; **Service Quotas** is where you view quotas and ask for increases.

## AWS License Manager

**AWS License Manager** helps you manage software licenses from vendors such as Microsoft, SAP, Oracle and IBM across accounts, Regions and an organization. It supports licenses counted by **vCPUs, physical cores, sockets or number of machines**.

- Define **licensing rules** from your agreements, with **hard or soft limits**, so non-compliant launches can be stopped before they happen.
- Track usage on dashboards and in reports to help with **vendor audits** and avoid overages.
- It supports **bring your own license (BYOL)**: reuse existing licenses on AWS.
- It integrates with **Amazon EC2** (including Dedicated Hosts and Dedicated Instances), **Amazon RDS** for Oracle and Db2, **AWS Systems Manager** (for servers outside AWS), **AWS Marketplace**, **AWS Data Exchange** and **AWS Organizations**.
- There is **no additional charge** for License Manager; you pay for the resources.

Traps: License Manager *tracks and governs* licenses you already have; it is not where you *buy* software (AWS Marketplace) and it does not manage encryption keys, secrets or accounts.

## Key points

- Service Catalog: portfolios of approved products (CloudFormation templates), constraints, self-service launch; governance on top of CloudFormation.
- Service Quotas: view quotas and request increases; quotas are mostly per Region and per account; Trusted Advisor reports quota proximity.
- License Manager: tracks and limits license consumption (vCPU, core, socket, machine), supports BYOL, no extra charge.

## Sources

- [What is Service Catalog?](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html)
- [What is Service Quotas?](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html)
- [What is AWS License Manager?](https://docs.aws.amazon.com/license-manager/latest/userguide/license-manager.html)
