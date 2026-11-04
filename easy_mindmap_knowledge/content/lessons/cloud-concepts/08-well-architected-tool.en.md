---
id: cloud-concepts-well-architected-tool
title: The AWS Well-Architected Tool
required: false
videoQuery: AWS Well-Architected Tool workload review milestones improvement plan
---
## What the tool does

The **AWS Well-Architected Tool** is a service in the AWS Management Console that helps you review your workloads against Well-Architected best practices. You answer questions about a workload, and the tool shows where it differs from best practice and what to do next. Do not confuse it with the Framework itself: the Framework is guidance, the tool is the service that applies it.

## Key concepts

- **Workload**: a collection of resources and code that delivers business value, such as a customer-facing application. It can span several accounts.
- **Lens**: a set of questions and best practices. The default is the Well-Architected Framework lens (six pillars). Other lenses, for example for serverless or SaaS workloads, and custom lenses you write, focus on specific domains.
- **Review**: answering the lens questions for your workload.
- **Risks**: gaps are reported as **high risk issues (HRIs)** or **medium risk issues (MRIs)**, which help you prioritize.
- **Improvement plan**: guidance with links to resources for each issue found.
- **Milestone**: a saved point-in-time snapshot of the review, so you can compare progress over time.
- **Sharing**: workloads can be shared with other accounts or an organization so teams review together.

## Where whitepapers fit

AWS publishes the Framework and a separate guide for each pillar, plus lens documents, as whitepapers and documentation. The tool puts the questions in a console workflow; the documents give the detail.

## Pricing

There is no additional charge for the tool. You pay only for the underlying AWS resources your workloads use.

## Exam hints

- "Review workloads against best practices and get an improvement plan" means the Well-Architected Tool.
- Tracking progress over time means milestones.
- It reviews architecture practices; it does not scan your resources for vulnerabilities (that is Amazon Inspector) or give cost advice from usage data (that is AWS Trusted Advisor).

## Key points

- The tool reviews workloads against the Framework and lenses.
- Output: high and medium risks plus an improvement plan; milestones record progress.
- It is free; you pay only for resources you use.

## Sources

- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [Workloads, AWS Well-Architected Tool User Guide](https://docs.aws.amazon.com/wellarchitected/latest/userguide/workloads.html)
- [AWS Well-Architected Tool pricing](https://aws.amazon.com/well-architected-tool/pricing/)
