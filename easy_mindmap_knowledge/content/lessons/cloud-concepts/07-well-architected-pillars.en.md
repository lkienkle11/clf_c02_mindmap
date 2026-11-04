---
id: cloud-concepts-well-architected-pillars
title: The six Well-Architected pillars in depth
required: true
videoQuery: AWS Well-Architected pillars design principles explained
---
## How to use this lesson

The previous lesson listed the pillars. Here each pillar gets a short definition, its main design principles and the keywords that point to it in a question.

## Operational Excellence

Running and monitoring workloads to deliver business value, and continually improving processes. Principles include organizing teams around business outcomes, implementing observability, **safely automating where possible**, making **frequent, small, reversible changes**, refining procedures, anticipating failure, learning from events and using managed services. Keywords: *automate, runbooks, small changes, learn from failure*.

## Security

Protecting data, systems and assets. Principles: **implement a strong identity foundation** (least privilege), **maintain traceability**, **apply security at all layers**, automate security best practices, **protect data in transit and at rest**, **keep people away from data** and prepare for security events. Keywords: *least privilege, encryption, audit, defense in depth*.

## Reliability

A workload performs its intended function correctly and consistently, and recovers from failure. Five principles: **automatically recover from failure**, **test recovery procedures**, **scale horizontally** to increase availability, **stop guessing capacity**, and **manage change through automation**. Keywords: *recover, fault tolerance, multiple AZs, backups*.

## Performance Efficiency

Using computing resources efficiently to meet requirements and keeping that efficiency as demand and technology change. Five principles: **democratize advanced technologies** (consume them as a service), **go global in minutes**, **use serverless architectures**, **experiment more often**, and **consider mechanical sympathy** (pick the technology that fits how the workload is used). Keywords: *right resource type, serverless, Regions close to users*.

## Cost Optimization

Delivering business value at the lowest price point. Principles: **implement Cloud Financial Management**, **adopt a consumption model**, **measure overall efficiency**, **stop spending money on undifferentiated heavy lifting**, and **analyze and attribute expenditure**. Keywords: *pay only for what you use, tagging for cost allocation, stop idle resources*.

## Sustainability

Minimizing the environmental impact of running cloud workloads. Principles: understand your impact, establish sustainability goals, **maximize utilization**, adopt more efficient hardware and software, **use managed services**, and reduce the downstream impact of your workloads. Keywords: *energy efficiency, higher utilization, fewer resources*.

## Overlaps and traps

| Idea | Looks like it belongs to | Belongs to |
| --- | --- | --- |
| Stop guessing capacity | Cost Optimization | Reliability (also a cloud advantage) |
| Go global in minutes | Reliability | Performance Efficiency |
| Use managed services | Only Operational Excellence | Also Sustainability |
| Traceability | Operational Excellence | Security |
| Stop spending on undifferentiated heavy lifting | Operational Excellence | Cost Optimization |

When a question asks which pillar a practice supports, find the **goal**: stay up (Reliability), spend less (Cost), use less energy (Sustainability), run faster or fit better (Performance), protect (Security), operate and improve (Operational Excellence).

## Key points

- Know each pillar's one-line definition and two or three principles.
- Reliability: recover automatically, test recovery, scale horizontally.
- Security: least privilege, traceability, protect data at rest and in transit.
- Performance Efficiency: serverless, go global, experiment.
- Cost Optimization: consumption model, attribute spending; Sustainability: maximize utilization.

## Sources

- [The pillars of the framework, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html)
- [Reliability pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html)
- [Security pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-design.html)
