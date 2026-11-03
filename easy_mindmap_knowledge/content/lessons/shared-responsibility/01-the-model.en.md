---
id: shared-responsibility-model
title: "The AWS shared responsibility model: security of the cloud and in the cloud"
required: true
videoQuery: AWS shared responsibility model explained security of the cloud vs in the cloud
---
## One sentence to remember

AWS describes security and compliance as a **shared responsibility**: **AWS is responsible for security *of* the cloud, and the customer is responsible for security *in* the cloud.** Most exam questions test where that line falls.

## AWS: security of the cloud

AWS protects the **infrastructure that runs all AWS services**:

- **Physical security** of data centers: guarded entry, access for approved staff only, power, cooling and fire protection.
- **Hardware**: servers, storage devices and networking equipment, including securely decommissioning storage media that held customer data.
- **The global infrastructure**: Regions, Availability Zones and edge locations.
- **Software below your workloads**: the **host operating system** and the **virtualization layer** (hypervisor).
- For managed services, AWS also runs the layers it manages for you, such as the operating system under Amazon RDS or the platform under AWS Lambda.

The customer cannot see or touch these layers, so the customer cannot be responsible for them.

## Customer: security in the cloud

The customer is responsible for **what they put in the cloud and how they configure it**. How much work that is depends on the services they choose (next lesson). Typical customer tasks:

- **Customer data**: what is stored, where, and how it is classified.
- **Identity and access management**: users, roles, permissions, passwords, MFA and access keys.
- **Guest operating system and applications** on services like EC2: updates, security patches, installed software.
- **Network and firewall configuration**: security groups, network ACLs, routing.
- **Encryption choices**: which keys to use, extra encryption options, and encryption in transit (some services, such as S3 and DynamoDB, encrypt data at rest by default).

## Responsibilities that never move to AWS

Whatever service you use, these stay with the customer:

- Your **data** and its **classification**.
- **Who can access** your resources and data (IAM).
- **Your account credentials**, such as the root user password and access keys.
- **Choosing and configuring** security features, such as encryption options and firewall rules.

AWS gives you the tools, such as IAM, AWS KMS and AWS Shield, but **using them correctly is your job**. Those services are covered in the next topic.

## Common traps

- "Physical security of data centers" or "hardware maintenance" is always **AWS**.
- "Configure security groups" or "manage IAM users" is always the **customer**.
- The word "of" points to AWS; the word "in" points to the customer.
- A managed service does **not** make AWS responsible for your data or for who can access it.

## Key points

- AWS: security **of** the cloud (facilities, hardware, network, host OS, virtualization).
- Customer: security **in** the cloud (data, IAM, guest OS and apps, network rules, encryption choices).
- The customer's share grows with the control they have.
- Data, access and credentials always remain the customer's responsibility.

## Sources

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Security in Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
