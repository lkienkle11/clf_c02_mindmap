---
id: pricing-billing-marketplace-and-data-exchange
title: "AWS Marketplace, AWS Data Exchange and credits: third-party products on your AWS bill"
required: false
videoQuery: AWS Marketplace explained buy software AMI SaaS and AWS Data Exchange data subscriptions
---
## AWS Marketplace

**AWS Marketplace** is a curated digital catalog where you can find, buy, deploy and manage **third-party software, data and services**. It lists thousands of products in categories such as security, networking, storage, machine learning and databases. Anyone with an AWS account can be a **buyer**, and an independent software vendor (ISV), reseller or individual can register as a **seller**.

- Products come in many forms: an **Amazon Machine Image (AMI)** you launch in your account, a **software as a service (SaaS)** subscription, a CloudFormation-delivered stack, or rules for AWS WAF.
- Pricing options include a free trial, hourly, monthly, annual, multi-year and **bring your own license (BYOL)**. Sellers set the price and terms; you can also accept a **private offer** with custom pricing.
- **Billing is part of your AWS bill.** AWS handles billing and payment, the charge appears on your invoice, and AWS then pays the seller. AWS Budgets can track Marketplace charges with a billing entity filter.
- Every software product goes through a curation process.

Exam clues: "purchase a third-party product", "a pre-installed third-party firewall on EC2", "an ISV wants to share custom AMIs with customers" all point to **AWS Marketplace**. It is not **License Manager** (tracks licenses you hold) or **Resource Access Manager** (shares your own resources between your accounts).

## AWS Data Exchange

**AWS Data Exchange** helps AWS customers find, subscribe to and use **third-party data** at scale. As a subscriber you manage all your data subscriptions and grants in one place, then use the data with analytics and machine learning services. Providers can publish data without building their own delivery infrastructure.

- Data sets can be delivered as **files, APIs, Amazon Redshift data shares, Amazon S3 data access** and similar types.
- Data products are listed in AWS Marketplace, so subscription fees also appear on your AWS bill.
- Publicly available data sets from the **Open Data on AWS** program can be used with or without an AWS account.

Do not confuse it with services that **move or transform your own data**, such as AWS Glue (data integration), AWS DMS (database migration) or the Snow family (physical transfer). Data Exchange is about **acquiring other organizations' data**.

## AWS credits

Besides the Free Tier, AWS may give **promotional credits**.

- Credits are applied **automatically** to the bill for **eligible services** until they are used up or expire. Each credit lists the services it applies to and its expiration date, visible on the **Credits** page of the Billing console.
- If you have several credits, the one that expires soonest is applied first.
- In an organization, credits are **shared across accounts by default**; the management account can turn sharing off.

## Key points

- AWS Marketplace: curated catalog of third-party software (AMI, SaaS and more), billed on your AWS bill; buyers and sellers.
- AWS Data Exchange: subscribe to third-party data sets, delivered through AWS and listed in Marketplace.
- Credits apply automatically to eligible charges until exhausted or expired.

## Sources

- [What is AWS Marketplace?](https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html)
- [What is AWS Data Exchange?](https://docs.aws.amazon.com/data-exchange/latest/userguide/what-is.html)
- [Applying AWS credits](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/useconsolidatedbilling-credits.html)
