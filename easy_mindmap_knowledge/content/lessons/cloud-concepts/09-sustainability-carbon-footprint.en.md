---
id: cloud-concepts-sustainability-carbon-footprint
title: Sustainability and the AWS Customer Carbon Footprint Tool
required: false
videoQuery: AWS sustainability pillar customer carbon footprint tool
---
## The pillar in practice

The **Sustainability** pillar is about reducing the environmental impact of your workloads, mainly by using less energy and fewer resources for the same output. The practical levers are:

- **Maximize utilization**: two servers at 30 percent use more energy than one at 60 percent, so right-size and remove idle resources.
- **Use managed and serverless services**: shared infrastructure run by AWS at scale keeps hardware busy. Examples are AWS Fargate and AWS Lambda.
- **Scale automatically**: Amazon EC2 Auto Scaling adjusts capacity to demand.
- **Move cold data automatically**: Amazon S3 Lifecycle configurations shift infrequently used data to colder storage.
- **Adopt newer, more efficient hardware and software** as they appear.

## Shared responsibility for sustainability

- **AWS: sustainability of the cloud.** Efficient shared infrastructure, power and cooling, water stewardship and sourcing renewable power.
- **You: sustainability in the cloud.** Designing workloads to use resources efficiently, choosing right-sized compute, and minimizing the total resources deployed.

Moving a workload to AWS can reduce its footprint because AWS runs efficient facilities at high utilization, but the efficiency of your own design remains yours.

## Why Regions and shared infrastructure matter

The infrastructure behind a Region is shared by many customers, which keeps utilization high and spreads the energy cost of power, cooling and networking. Where latency, cost and compliance allow it, keep workloads in the Regions that already fit your users rather than duplicating them everywhere, and avoid idle copies.

## AWS Customer Carbon Footprint Tool

The **AWS Customer Carbon Footprint Tool** lets you see estimated carbon emissions from your AWS usage. Today it lives in the AWS Sustainability console, which builds on the earlier tool and also adds water data and reporting. You can:

- view emissions over time and break them down by scope, AWS Region and service;
- create reports or exports to analyze the data in bulk;
- see an organization-wide total from the management account of AWS Organizations.

Data appears the month after usage, and a very new account may show nothing yet. Remember the purpose: it measures and reports your footprint; it does not change your architecture for you.

## Exam hints

- "Which tool shows the carbon emissions of my AWS usage?" means AWS Customer Carbon Footprint Tool.
- "Which pillar covers reducing environmental impact?" means Sustainability.
- Customer responsibility is sustainability *in* the cloud.

## Key points

- Sustainability pillar: maximize utilization, use managed services, reduce idle resources.
- AWS handles sustainability of the cloud; you handle sustainability in the cloud.
- The Customer Carbon Footprint Tool estimates your emissions by time, Region and service.

## Sources

- [The shared responsibility model, Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/the-shared-responsibility-model.html)
- [Design principles for sustainability in the cloud](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/design-principles-for-sustainability-in-the-cloud.html)
- [What is AWS Sustainability? (user guide)](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ccft-overview.html)
