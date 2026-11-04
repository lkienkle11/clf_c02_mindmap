---
id: shared-responsibility-responsibility-iam-ec2
title: "Layer by layer: who secures IAM and Amazon EC2"
required: true
videoQuery: AWS shared responsibility model IAM and EC2 customer vs AWS responsibilities
---
## Why walk through layers

"Security **of** the cloud" is AWS and "security **in** the cloud" is the customer. Exam questions rarely ask for that sentence. They name one task and ask who does it. The fastest method is to picture the stack from the building up to your data and ask at which layer the task sits. This lesson does it for two services that appear again and again: **AWS Identity and Access Management (IAM)** and **Amazon EC2**.

## IAM: AWS runs the service, you run the identities

**IAM** is the service that controls who can sign in and what they may do. AWS operates the service itself: the servers, the software and the replication that keep IAM available. Everything you put into it is yours:

| IAM item | Who is responsible |
| --- | --- |
| Availability and infrastructure of the IAM service | AWS |
| Creating users, groups and roles | Customer |
| Writing policies and granting least privilege | Customer |
| Turning on **multi-factor authentication (MFA)** | Customer |
| Rotating and protecting **access keys** | Customer |
| Protecting the **root user** of the account | Customer |
| Removing access when people leave | Customer |

A common exam trap is to assume AWS rotates keys or tightens permissions for you. AWS provides the tools, but it does not decide who in your company may do what. The same holds for password policies: AWS offers the setting, you define the policy.

The root user deserves special mention. It is the first identity of an AWS account and has complete access. AWS recommends not using it for everyday tasks, so securing it (strong password, MFA, no access keys for daily work) is squarely a customer task. The next topic, IAM and Security, covers these tools in detail.

## Amazon EC2: you own the server above the hypervisor

**Amazon EC2** gives you a virtual server, so the line sits close to the top of the stack.

| Layer | Who is responsible |
| --- | --- |
| Data center buildings, power, cooling, physical access | AWS |
| Servers, storage and network hardware | AWS |
| Regions, Availability Zones and the global network | AWS |
| Host operating system and **hypervisor** | AWS |
| **Guest operating system**, including updates and security patches | Customer |
| Software and applications installed on the instance | Customer |
| **Security groups** (the firewall of the instance) and network access | Customer |
| Credentials used to connect (for example key pairs) | Customer |
| **IAM roles** attached to the instance and their permissions | Customer |
| Your data on the instance and its encryption choices | Customer |

The AWS documentation for EC2 lists these customer tasks directly: controlling network access with VPC and security groups, managing the connection credentials, managing the guest operating system and its software including patches, and configuring the IAM roles attached to the instance.

## Reading the table in an exam

- "Replace a failed disk in the server rack" is **AWS**. The customer never sees the hardware.
- "Install the latest security update on the Linux instance" is the **customer**. Tools such as AWS Systems Manager Patch Manager can automate it, but the responsibility stays with you.
- "Open port 443 only to the load balancer" is the **customer**, through a security group.
- "Prevent other customers from reading the memory of your instance" is part of the **virtualization layer**, which is AWS.
- If the question says "host operating system" or "hypervisor", think AWS. If it says "guest operating system", think customer.

## Trap: VPC and network questions

The customer **configures** its VPC: address ranges, subnets, route tables, security groups and network ACLs. AWS protects the infrastructure that runs the VPC service and the network underneath it. So "maintain or operate the underlying network infrastructure or service" is **AWS**, while "configure what you build with it" is the **customer**. When a question lists *your data* among the answers, data protection and classification is the safest customer answer. And if it asks what the customer is **always** responsible for, choose the customer's **data**; networking and encryption keys are distractors, even though encryption choices are the customer's decision.

## Key points

- IAM: AWS operates the service; the customer manages users, policies, MFA, access keys and the root user.
- EC2: AWS secures hardware, facilities, hypervisor and the global infrastructure.
- EC2: the customer manages the guest OS and patches, applications, security groups, instance IAM roles and data.
- Host OS means AWS; guest OS means customer.

## Sources

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Managing security responsibilities for Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/security.html)
- [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
