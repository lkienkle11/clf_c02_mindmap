---
id: deploy-operate-systems-manager
title: "AWS Systems Manager in depth: managed nodes, tools and when to choose it"
required: true
videoQuery: AWS Systems Manager Session Manager Patch Manager Run Command Parameter Store Automation explained
---
## What Systems Manager is

**AWS Systems Manager** is a set of tools to view, manage and operate **nodes** at scale: Amazon EC2 instances, on-premises servers and virtual machines, and machines in other clouds. The previous lesson in this series gave an overview; this one sorts the tools by the job they do. The service was formerly named Amazon EC2 Systems Manager and Simple Systems Manager, which is why "SSM" still appears in agent, API and parameter names.

## Managed nodes and the SSM Agent

A machine becomes a **managed node** when the **SSM Agent** is installed on it and the agent can reach the Systems Manager service. For machines that are not EC2 instances, you create a **hybrid activation**; its activation code and ID act like an access ID and secret key, so on-premises servers and other-cloud machines can register as managed nodes. Once nodes are managed, you can patch them, run commands and open sessions without logging in to each one. If a node does not report as managed, Systems Manager offers a diagnosis runbook that checks causes such as networking problems.

## The tools by job

| Job | Tool | What it does |
| --- | --- | --- |
| Connect | **Session Manager** | Browser or CLI shell to a node with no inbound ports, bastion hosts or SSH keys; sessions are auditable |
| Run | **Run Command** | Run a script or command on dozens or hundreds of nodes on demand |
| Patch | **Patch Manager** | Scans for missing patches and installs them using patch baselines, individually or in groups chosen by tags |
| Automate | **Automation** | Runs runbooks for tasks such as building AMIs, applying updates or resetting credentials |
| Keep consistent | **State Manager** | Keeps nodes in a defined state, for example software installed at startup |
| Schedule | **Maintenance Windows** | Recurring windows for administrative tasks, such as scheduled patching, so work does not disrupt operations |
| Inventory | **Inventory** | Collects metadata about applications, files and patches from managed nodes |
| Configuration data | **Parameter Store** | Stores configuration values and secrets for applications to read at run time |

### Documents and access control

**SSM documents**, written in JSON or YAML, define the actions Systems Manager performs. Command documents are used by Run Command and State Manager; runbooks are used by Automation. Session Manager access is controlled with **IAM policies**, so you decide who may open sessions, and session logs can be sent to S3 or CloudWatch Logs.

### Patch Manager and shared responsibility

For EC2, patching the guest operating system and applications is the **customer's** responsibility. Patch Manager makes it practical: a patch baseline can auto-approve patches a few days after release and list approved and rejected patches, and a maintenance window can schedule the installs. Patch reports can be delivered to S3.

### Parameter Store

**Parameter Store** holds values such as AMI IDs, endpoint URLs and license keys. Types are String, StringList and **SecureString**, which is encrypted with **AWS KMS**. The **standard** tier has no additional charge; the **advanced** tier allows more and larger parameters and costs extra. Parameter Store keeps versions of each value and works with IAM and CloudFormation.

When the requirement is a central place for configuration data and passwords at the lowest cost, Parameter Store is the answer. When the requirement adds **automatic rotation** of credentials, or cross-account access with fine-grained audit logging, AWS recommends **AWS Secrets Manager** (covered in the IAM and security topic).

## Related services that are not Systems Manager

- **AWS Resource Explorer** is a separate search service. It finds your resources by name, tag or ID using an internet-search-like experience, and since October 6, 2025 it is on by default in an account. Basic search has no additional charge, and cross-Region search needs an aggregator Region. Choose it to find resources; it does not deploy or govern anything.
- **AWS Service Catalog** governs approved templates for others to launch (pricing and billing topic). **AWS AppConfig** is part of Systems Manager and deploys application configuration and feature flags with validation and rollback.
- **AWS CloudFormation** provisions infrastructure; Systems Manager operates what runs on it.

## Status changes

Systems Manager itself is active. AWS lists three of its tools as **in maintenance**: **Change Manager** and **Incident Manager**, which stopped accepting new customers on November 7, 2025, and **Application Manager**. Existing customers keep using them. They are not part of the core exam picture.

## When to choose Systems Manager

| Scenario | Choice |
| --- | --- |
| Reach private instances without opening port 22, bastions or distributing SSH keys | Session Manager |
| Apply security patches to hundreds of instances | Patch Manager |
| Run one script on a whole fleet right now | Run Command |
| Keep a fleet in a defined configuration over time | State Manager |
| Store configuration values centrally | Parameter Store |
| Create an AMI or reset passwords with a repeatable workflow | Automation |
| Provision the servers themselves from a template | CloudFormation, not Systems Manager |

## Key points

- Nodes become managed through the SSM Agent; hybrid activations bring in on-premises and other-cloud machines.
- Session Manager, Run Command, Patch Manager, Automation, State Manager, Inventory and Parameter Store each have one job.
- Parameter Store standard tier is free; use Secrets Manager when rotation is required.
- Resource Explorer searches resources and is not part of Systems Manager.

## Sources

- [What is AWS Systems Manager?](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [Using AWS Systems Manager tools](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-tools.html)
- [What is AWS Resource Explorer?](https://docs.aws.amazon.com/resource-explorer/latest/userguide/welcome.html)
