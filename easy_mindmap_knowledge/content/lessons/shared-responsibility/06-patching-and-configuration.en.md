---
id: shared-responsibility-patching-and-configuration
title: "Patching, configuration and awareness: applying the shared controls"
required: true
videoQuery: AWS shared controls patch management configuration management awareness and training examples
---
## From definitions to daily work

The earlier lesson defined the three control types. This one uses them on real tasks. AWS describes the three types like this:

- **Inherited controls**: controls a customer fully inherits from AWS. Example: **physical and environmental** controls.
- **Shared controls**: AWS provides the requirements for the infrastructure, and the customer implements its own controls within its use of AWS services. Examples: **patch management**, **configuration management**, **awareness and training**.
- **Customer-specific controls**: solely the customer's responsibility, based on the applications deployed. Example: **service and communications protection or zone security**.

The word "shared" is the exam hook: the same control exists on both sides, applied to different layers.

## Patch management in practice

| Layer | Who patches |
| --- | --- |
| AWS infrastructure: hosts, hypervisor, network devices | AWS patches and fixes flaws |
| Guest OS of an EC2 instance | Customer |
| Applications and libraries you install | Customer |
| OS and engine of an RDS database | AWS, in a maintenance window you choose (a mandatory update can still be applied after its apply date) |
| Runtime of a Lambda function with a managed runtime | AWS publishes the patches and applies them automatically in the default Auto mode; Function update and Manual modes need customer action |
| Your function code and packaged libraries | Customer |

So "patch management" is shared, but no single patch is shared. For any given patch, ask which layer it belongs to. Customers may automate their part, for example with AWS Systems Manager Patch Manager, but automation does not transfer ownership.

## Configuration management in practice

- **AWS** maintains the configuration of its infrastructure devices.
- **The customer** configures its own guest operating systems, databases and applications: hardening the OS, setting database parameters, choosing application settings, setting security group rules.

Remember a trap from the question style: "Maintain the configuration of infrastructure devices" is an AWS task, while "maintain the configuration of guest operating systems and applications" is the customer's. Same control name, different layers.

## Awareness and training

AWS trains AWS employees. The customer trains its own employees, for example on phishing, handling data and using the tools correctly. Even a perfectly configured account can be undone by one careless administrator, and no AWS service substitutes for training your people.

## Account-level security stays with you

Some tasks belong to the customer regardless of the control type:

- Protect the **root user** with a strong password and **MFA**, and avoid everyday use.
- Give people **IAM users or roles** with least privilege instead of sharing credentials.
- Protect and rotate **access keys**.
- Classify data and decide who can access it.
- Choose encryption options for your data.

AWS offers the tools; using them is the customer's job. The IAM and Security topic covers them.

## Customer-specific controls

These depend on your application, so AWS cannot supply them. Zone security is the AWS example: you decide how data is routed or divided between security environments. For example, you might put databases in private subnets and web servers in public ones; this is only an illustration of a customer-specific control, not something AWS provides.

## Evidence and compliance

An auditor wants proof for all three control types. For inherited controls and for AWS's part of shared controls, you can use AWS reports and agreements in **AWS Artifact**. For your own part you must show your own evidence. The compliance lesson explains Artifact and compliance programs.

## Key points

- Shared controls: patch management, configuration management, awareness and training.
- AWS handles the infrastructure layer; the customer handles guest OS, databases, applications and its own staff.
- Physical and environmental controls are inherited; zone security is customer-specific.
- Root user protection, MFA, IAM permissions and access keys are always the customer's.
- Use AWS Artifact for AWS's side of the evidence; provide your own for the rest.

## Sources

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [What is AWS Artifact?](https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html)
