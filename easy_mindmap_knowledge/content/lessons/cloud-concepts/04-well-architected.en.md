---
id: cloud-concepts-well-architected
title: The AWS Well-Architected Framework and cloud design principles
required: true
videoQuery: AWS Well-Architected Framework six pillars explained
---
## What the framework is

The **AWS Well-Architected Framework** is a set of best practices and questions that help you review a workload and find where it can improve. It is organized into **six pillars**. If you ignore any one of them, the system may fail to meet expectations.

## The six pillars

| Pillar | Focus | Typical keyword in a question |
| --- | --- | --- |
| Operational Excellence | Running and monitoring systems, continually improving processes | Automate operations, small reversible changes, learn from failures |
| Security | Protecting information and systems | Least privilege, traceability, encryption |
| Reliability | Performing the intended function and recovering quickly from failure | Recover automatically, test recovery, multiple AZs |
| Performance Efficiency | Using IT and computing resources efficiently as demand changes | Choose the right resource type, go global, serverless |
| Cost Optimization | Avoiding unnecessary costs | Pay only for what you use, stop idle resources |
| Sustainability | Minimizing the environmental impact of cloud workloads | Higher utilization, fewer resources for the same output |

Memory hook: Sustainability is the **newest** pillar; the exam may list only five and ask which one is missing.

## Design principles to know

The framework and its pillars share several cloud design ideas that appear often on the exam:

- **Stop guessing capacity**: monitor demand and add or remove resources automatically.
- **Scalability and elasticity**: *scalability* is the ability to grow to handle more load; *elasticity* is adding resources when demand rises and **releasing them** when it falls, so you do not pay for idle capacity.
- **Scale horizontally**: replace one large resource with several smaller ones so a single failure has less impact.
- **Loose coupling**: connect components through queues, streams, workflows or load balancers so a change or failure in one component does not break the others. Amazon SQS is a classic example.
- **High availability and design for failure**: assume components will fail. Run copies across multiple Availability Zones and recover automatically.
- **Test recovery procedures** and **automate changes**, so failures are practiced and changes are repeatable.

## Key points

- Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.
- Reliability = recover from failure; Performance Efficiency = use resources efficiently.
- Elasticity means scaling both out **and in** with demand.
- Loose coupling limits how far one failure spreads.
- Design for failure: no single point of failure; use multiple AZs.

## Sources

- [The pillars of the framework, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html)
- [Reliability pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html)
- [REL04-BP02 Implement loosely coupled dependencies](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html)
