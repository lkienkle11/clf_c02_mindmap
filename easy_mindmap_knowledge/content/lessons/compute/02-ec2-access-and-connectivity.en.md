---
id: compute-ec2-access-and-connectivity
title: Connecting to EC2: key pairs, Instance Connect and Session Manager
required: true
videoQuery: how to connect to an EC2 instance SSH EC2 Instance Connect Session Manager
---
## Why access is an exam topic

An EC2 instance is a server you own, so you decide **who can log in and how**. AWS offers several ways in. They differ in what must be open on the network, which credentials are used and how much is recorded. The exam asks you to pick the option that fits a security or convenience requirement.

## Key pairs and SSH

A **key pair** is a public key and a private key. EC2 places the public key on a Linux instance when it first boots, and you keep the private key. Whoever holds the private key can log in, and AWS keeps no copy, so a lost key cannot be recovered. A Linux administrator connects with an **SSH** client and the private key. For Windows, the private key decrypts the generated Administrator password, and you then connect with an RDP client.

This classic method needs an **inbound rule** that lets your address reach the instance, normally SSH on port 22 for Linux and RDP on port 3389 for Windows. Leaving inbound SSH or RDP ports open raises the risk of unauthorized access, which is why the alternatives below exist.

## Security groups: the front door

A **security group** is a virtual firewall around your instances. You add rules that allow traffic in or out. It is **stateful**: replies to allowed traffic flow back without a separate rule. You can attach several groups to one instance, change rules at any time, and pay nothing for them. Opening SSH or RDP in a security group is your job, not AWS's.

## Connection options compared

| Method | Instance OS | Inbound port open? | Credential | Notes |
| --- | --- | --- | --- | --- |
| SSH client | Linux | Yes | Key pair | Classic, you manage keys |
| RDP client | Windows | Yes | Key pair decrypts password | Classic for Windows |
| **EC2 Instance Connect** | Linux | Yes | IAM permission | No key pair to distribute |
| **Session Manager** | Linux, Windows, macOS | **No** | IAM permission | Logged, no bastion host |

**EC2 Instance Connect** lets IAM policies decide who may connect. When you connect, a one-time public key is pushed to the instance and stays valid for only 60 seconds, so you need no long-lived key pair. The connection still reaches the instance through its normal network port. An **EC2 Instance Connect Endpoint** adds a way in for instances that have only private IP addresses, with no bastion host and no internet gateway needed.

**AWS Systems Manager Session Manager** gives a browser-based or CLI shell with **no inbound ports open**, no SSH keys and no bastion (jump) host. Access is controlled by IAM, and session activity can be logged to AWS CloudTrail, Amazon S3 or Amazon CloudWatch Logs. It needs the SSM Agent on the instance, which is pre-installed only on certain AMIs, and an IAM role for the instance. It also reaches instances that have no public IP address.

**AWS CloudShell** is a different thing: a browser-based shell, pre-authenticated with your console sign-in, for running AWS CLI commands. It costs nothing extra. It is where you run commands against AWS, not how you log in to a server.

## Instance roles, not embedded credentials

Applications on an instance often call AWS, for example to read an Amazon S3 bucket. Do **not** store access keys on the instance. Create an **IAM role**, attach it through an **instance profile** (the container that hands the role to the instance) and let the application obtain **temporary credentials** automatically. You never distribute or update keys, and a role change reaches every instance that uses it. An instance can hold one role at a time.

## User data: bootstrap at launch

**User data** is a script or cloud-init text you supply at launch. By default it runs once, on the first boot, as root. Use it to install software, apply updates or start a service so each new instance configures itself. It is limited to 16 KB. If the script calls AWS APIs, launch the instance with an instance profile. User data belongs to the instance, so it is **not** saved inside an AMI created from it.

## Shared responsibility

AWS secures the hardware, the hypervisor and the facilities. You choose the security group rules, protect the private key, patch the guest operating system and decide which IAM identities may connect.

## Common exam traps

- "No open inbound ports" or "no bastion host" points to **Session Manager**.
- "Without managing SSH keys" and "IAM controls access" fits Instance Connect or Session Manager. Only Session Manager needs no open port.
- A lost private key cannot be re-downloaded from AWS.
- Embedded access keys are wrong: use an instance role.

## Key points

- Key pair plus SSH or RDP is classic and needs an open port.
- Instance Connect uses a 60-second key pushed with IAM permission; Session Manager needs no open port and is logged.
- Give applications an instance role, not stored access keys.
- User data runs at first boot; you own OS patching and firewall rules.

## Sources

- [Connect to your EC2 instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect.html)
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [IAM roles for Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
