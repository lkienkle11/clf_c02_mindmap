---
id: deploy-operate-operations
title: "Operating at scale: AWS Systems Manager and AWS Health Dashboard"
required: true
videoQuery: AWS Systems Manager Session Manager Patch Manager and AWS Health Dashboard explained
---
## AWS Systems Manager

**AWS Systems Manager** helps you view and operate your **nodes** (EC2 instances, on-premises servers and virtual machines) at scale, from one place. It works for **hybrid** environments too. A node becomes a **managed node** when the **SSM Agent** is installed on it and can reach the Systems Manager service.

Its main tools:

| Tool | What it does |
| --- | --- |
| Session Manager | Opens a secure shell session to a node from the console or CLI, with no open inbound ports, no bastion hosts and no SSH keys |
| Patch Manager | Scans nodes for missing patches and installs operating system and application updates on a schedule |
| Run Command | Runs a command or script on many nodes at once without logging in to each one |
| Automation | Runs predefined or custom runbooks for maintenance, deployment and remediation tasks |
| Parameter Store | Stores configuration data, such as AMI IDs and endpoint URLs, that applications read at run time |

With **Session Manager**, access is controlled with **IAM policies**, and session activity can be logged to Amazon S3 or CloudWatch Logs.

Under the shared responsibility model, patching the guest operating system on EC2 is the **customer's** job; **Patch Manager** helps you do it **at scale**.

## AWS Health Dashboard

AWS Health tells you about **events that affect AWS services and your resources**.

- The public **service health** view shows the status of AWS services in every Region, without signing in.
- When you sign in, **your account health** shows events that affect **your** account and resources, such as an issue that affects your EC2 instances or an upcoming **scheduled change**, like an instance retirement or a database engine reaching end of support.
- The dashboard is available to all customers at no extra cost, and AWS Health events can be sent to **Amazon EventBridge** to trigger automation.

## Where this fits with other tools

- **CloudWatch** watches your own metrics; **AWS Health** reports AWS-side events that may affect you.
- **AWS Trusted Advisor** checks your account for cost, security, performance and fault tolerance improvements; it is covered in the support topic.

## Common traps

- "Connect to private EC2 instances without opening port 22 or managing SSH keys" points to **Session Manager**.
- "Apply security patches to hundreds of instances" points to **Patch Manager**.
- "Is the AWS outage affecting my resources?" or "upcoming maintenance on my instances" points to the **AWS Health Dashboard**.
- Systems Manager manages what runs **inside** the instances; CloudFormation provisions the resources themselves.

## Key points

- Systems Manager operates EC2 and on-premises nodes at scale through the SSM Agent.
- Session Manager = secure access without SSH keys or open ports; Patch Manager = patching at scale.
- AWS Health Dashboard = AWS service events and account-specific events, including scheduled changes.

## Sources

- [What is AWS Systems Manager?](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [What is AWS Health?](https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html)
