---
id: cloud-concepts-economics
title: Cloud economics: CapEx, OpEx, TCO and right-sizing
required: true
videoQuery: AWS cloud economics CapEx vs OpEx total cost of ownership
---
## Two ways to pay for IT

- **Capital expenditure (CapEx)**: money spent up front on physical assets such as servers, storage arrays and data center space. You pay before you know how much you will use, and the asset loses value over time.
- **Operating expenditure (OpEx)**: ongoing costs for services you consume, paid as you go.

Moving to the cloud shifts much of IT spending **from CapEx to OpEx**. This is the same idea as the advantage "trade fixed expense for variable expense".

| | On-premises | AWS Cloud |
| --- | --- | --- |
| Main cost type | CapEx (buy hardware first) | OpEx (pay for usage) |
| Capacity | Sized for the expected peak | Scaled to actual demand |
| Idle capacity | You still pay for it | Stop or release it |

## Pay-as-you-go

With pay-as-you-go pricing you pay for compute, storage and other resources only while you use them, with no long-term contract required. You do not have to over-provision up front to survive a future peak.

## Total cost of ownership (TCO)

TCO compares the **full** cost of running a workload, not just the server price. For an on-premises data center this includes hardware, software licenses, power, cooling, floor space, network, maintenance and the staff who run it all. A fair cloud comparison weighs all of these against the AWS bill. Questions about "lower TCO" usually point to fewer hardware purchases, no data center to maintain, and less staff time spent on infrastructure.

## Right-sizing and the consumption model

- **Right-sizing** means choosing resource types and sizes that meet your performance and capacity needs at the lowest cost, and shrinking or removing resources that are larger than needed. It is an ongoing task because needs change.
- **Consumption model**: pay only for what you need and turn things off when they are idle. For example, development and test environments used only during working hours can be stopped at night and on weekends, so you pay for roughly 40 of the 168 hours in a week.
- AWS Compute Optimizer analyzes how resources are used and gives right-sizing recommendations.

## Key points

- Cloud moves spending from CapEx (up front, fixed) to OpEx (variable, pay as you go).
- TCO includes hidden on-premises costs: power, cooling, space, maintenance and staff.
- Right-sizing matches resource size to real need, and it is never "done once".
- Stopping idle resources is one of the simplest ways to save money.

## Sources

- [Cost optimization design principles, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html)
- [Right Sizing: Provisioning Instances to Match Workloads](https://docs.aws.amazon.com/whitepapers/latest/cost-optimization-right-sizing/cost-optimization-right-sizing.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
