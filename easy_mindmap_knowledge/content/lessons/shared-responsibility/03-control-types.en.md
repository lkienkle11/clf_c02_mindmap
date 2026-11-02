---
id: shared-responsibility-controls
title: "Inherited, shared and customer-specific controls"
required: true
videoQuery: AWS shared responsibility inherited controls shared controls customer specific controls
---
## Why controls matter

Auditors check **controls**: the safeguards that protect systems and data. When a company runs on AWS, some controls come entirely from AWS, some are split, and some belong only to the company. The shared responsibility model names three kinds.

## Inherited controls

**Inherited controls** are controls a customer **fully inherits from AWS**. The customer does nothing to implement them and can point auditors to AWS's evidence (see the compliance lesson).

- Example: **physical and environmental controls** of the data centers, such as building access, power and fire protection.

## Shared controls

**Shared controls** apply to both the infrastructure layer and the customer layers, but **each side implements its own part in its own context**. AWS provides the requirements for the infrastructure; the customer provides its own implementation for its use of the services. The model gives three examples:

| Shared control | AWS's part | Customer's part |
| --- | --- | --- |
| Patch management | Patch and fix flaws in the infrastructure | Patch their guest operating systems and applications |
| Configuration management | Maintain the configuration of AWS infrastructure devices | Configure their own guest operating systems, databases and applications |
| Awareness and training | Train AWS employees | Train their own employees |

"Shared" does **not** mean that AWS does half of your patching. It means the same kind of control exists on both sides of the line, and each side covers its own layer.

## Customer-specific controls

**Customer-specific controls** are **solely the customer's responsibility**, based on the application they deploy on AWS.

- Example from the model: **zone security**, such as routing or zoning data inside specific security environments.

## Common traps

- "Which is a **shared** control?" Look for **patch management**, **configuration management** or **awareness and training**.
- "Which control does the customer **inherit**?" Look for **physical and environmental** controls.
- Training your own staff is never AWS's job; AWS trains only AWS employees.
- Physical controls are never shared: only approved AWS staff can enter AWS data centers.

## Key points

- Inherited: fully provided by AWS (physical and environmental).
- Shared: same control on both sides, each covering its own layer (patching, configuration, training).
- Customer-specific: only the customer (zone security and other application-level controls).
- Auditors can rely on AWS evidence for inherited controls; the customer must show its own part for the rest.

## Sources

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Data center controls](https://aws.amazon.com/compliance/data-center/controls/)
