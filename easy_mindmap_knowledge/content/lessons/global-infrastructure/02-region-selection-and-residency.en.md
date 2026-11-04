---
id: global-infrastructure-region-selection-and-residency
title: Choosing a Region, data residency and opt-in Regions
required: true
videoQuery: how to choose an AWS Region data residency compliance latency
---
## Regions are separate places

Every **AWS Region** is a separate geographic location with its own set of Availability Zones, its own copy of regional services and its own resources. When you create a resource such as an Amazon EC2 instance or an Amazon S3 bucket, you pick the Region it lives in, and that resource does not show up in any other Region.

Two ideas follow from this and appear often in the exam:

- **Isolation**: Regions are designed to be independent, so a problem in one Region should not spread to another.
- **Data stays where you put it**: for Regional services, your content is stored in the Region you chose. It leaves only when you decide to copy, replicate or move it (for example with cross-Region replication, or by sending users a download). AWS does not move your data between Regions on its own.

AWS publishes the current number of Regions and Availability Zones on its Global Infrastructure page, and the number grows, so do not memorize a count for the exam. Remember the structure instead: a Region contains several isolated Availability Zones (at least three in the public Regions).

## The four selection factors

When a question asks "which Region should the company use?", work through the factors in this order.

| Order | Factor | What to check | Typical exam clue |
| --- | --- | --- | --- |
| 1 | Compliance and data residency | Do laws, regulators or contracts say where data must be stored? | "must keep data in the country", "regulation" |
| 2 | Latency | How close is the Region to most users or to the systems that call it? | "users in Asia", "low latency" |
| 3 | Service availability | Does the Region offer every service and feature the workload needs? | "new service", "feature not available" |
| 4 | Cost | The same resource can cost a different amount in different Regions | "reduce cost" |

Compliance is a hard limit, the others are trade-offs. If a rule says data must stay in the European Union, a cheaper Region in another continent is simply not an option. Once the legal limits leave you a shortlist, pick the one closest to your users, then check that it supports your services, then compare prices.

## Data residency and sovereignty

**Data residency** means keeping data in a specific country or area. Choosing a Region inside that area is the main tool. Because data does not leave the Region unless you move it, you stay in control of where it is stored. Remember the shared-responsibility angle: AWS provides the Regions and the isolation, but you are responsible for choosing the Region and for not copying data somewhere that breaks your rules. If a workload must run in your own building, the answer is not a Region but an extension such as AWS Outposts (see the lesson on Local Zones, Wavelength and Outposts).

## Opt-in Regions

Not every Region is open to every account by default. Regions launched before 20 March 2019 are enabled automatically. Newer ones are called **opt-in Regions** and are disabled until you enable them in your account (an account can do this itself, or an organization administrator can do it for member accounts). Enabling or disabling a Region costs nothing; you pay only for the resources you create there. Opt-in Regions are not shown in the console until enabled. Disabling a Region does not delete the resources in it, and they keep costing money.

Companies can also use IAM permissions to control who may use which Regions, which is a common governance practice.

## Common traps

- "Lowest latency" does not beat "data must stay in a country".
- A service that is available in one Region may not yet be available in another; check the Regional Services List.
- Creating a resource in a Region does not copy it to a second Region for you.
- Regions are not edge locations, and Availability Zones are inside Regions, not the other way around.

## Key points

- Regions are isolated; data in Regional services stays in the Region you pick unless you move it.
- Choose by compliance first, then latency, service availability and cost.
- Opt-in Regions (launched after 20 March 2019) must be enabled in your account before use, at no charge.
- Do not memorize Region counts; they change.

## Sources

- [Enable or disable AWS Regions in your account](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-regions.html)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [AWS Regional Services List](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)
