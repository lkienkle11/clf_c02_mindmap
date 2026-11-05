---
id: migration-caf-discovery-and-migration-service
title: "Discovery and rehosting: Application Discovery Service and Application Migration Service"
required: true
videoQuery: AWS Application Discovery Service agentless collector and Application Migration Service MGN explained
---
## From knowing what you have to moving it

A server migration has two jobs. First you must know what exists, how busy it is and what talks to what. Then you copy the servers to AWS. Two services map to those jobs: **AWS Application Discovery Service** and **AWS Application Migration Service**.

## AWS Application Discovery Service

Application Discovery Service collects configuration, usage and behavior data about on-premises servers and databases to help plan a migration. It is a **discovery** tool: it reads information but does **not replicate or move** anything. That is the key phrase in exam questions such as "gather information, but do not replicate workloads yet".

It offers three ways to collect data:

| Method | How it works | What it sees |
| --- | --- | --- |
| **Agentless Collector** | A virtual appliance deployed in VMware vCenter | Hostnames, IP and MAC addresses, disk allocation, average and peak CPU, RAM and disk I/O; database engine details; limited network data (TCP connections) |
| **Discovery Agent** | Installed on each Windows or Linux server, virtual or physical | The above plus detailed performance over time, running processes and fuller network connection data |
| **File-based import** | Upload an inventory file | Whatever the file contains |

The trade-off is breadth against depth. The collector covers many VMs without touching each one, but it cannot look inside a VM for running processes and gives only limited network data. The agent shows processes and dependencies, which helps you decide which servers must move together. Discovered data is stored in the **Migration Hub home Region**, and can be exported to estimate AWS costs.

**Status:** AWS closed Application Discovery Service to new customers on November 7, 2025. Existing customers can keep using it, and AWS recommends **AWS Transform** for new discovery projects. Exam questions may still list it as the answer for inventory and dependency discovery.

## AWS Application Migration Service (AWS Transform MGN)

**AWS Application Migration Service** is AWS's primary service for **rehost (lift-and-shift)** migrations. It was renamed **AWS Transform MGN**, and both names appear in exam material.

How a migration runs:

1. Install the **AWS Replication Agent** on each source server (physical, virtual or in another cloud, Windows or Linux). An agentless option exists for VMware environments.
2. The service performs **continuous block-level replication** into a low-cost **staging area** in your account while the source keeps serving users.
3. Three templates (replication, launch and post-launch) control how servers are copied, launched and configured. Servers are grouped into applications and **waves**.
4. You launch **test instances** as often as you like to check the copy without affecting production.
5. At the **cutover**, you launch the final instances. Downtime is typically minutes.
6. Afterwards you can replatform or refactor, so a rehost is a fast first step.

Pricing: each source server has a free replication period of 90 days (2,160 hours) from agent installation; after that, you pay per hour of replication. You always pay for the underlying AWS resources, such as staging storage and the EC2 and EBS resources used by test and cutover instances.

## Older names to recognize

- **CloudEndure Migration** and **AWS Server Migration Service (AWS SMS)** were earlier tools for the same job. AWS lists AWS SMS among services in full shutdown, with end of support on April 1, 2023, and AWS recommends Application Migration Service as the primary lift-and-shift service.
- In some exam stems the service is also called by its abbreviation **MGN**.

## Which service for which question

| Question wording | Answer |
| --- | --- |
| Hostname, IP address, MAC address of on-premises servers | Application Discovery Service |
| Gather usage and configuration data without replicating | Application Discovery Service |
| Lift and shift physical or virtual servers with minutes of downtime | Application Migration Service |
| Convert a VM to run natively on EC2 automatically | Application Migration Service |
| Migrate EC2 instances from one Region to another | Application Migration Service |
| Move a database engine | AWS DMS (data-transfer lesson) |

## Common traps

- Discovery tells you what to move; it does not move it.
- Application Migration Service moves **whole servers**; it is not for files only or database engine changes.
- Migration Service is not a disaster recovery service; use Elastic Disaster Recovery for that.

## Key points

- Application Discovery Service = inventory, utilization and dependency data via Agentless Collector or Discovery Agent; closed to new customers since November 7, 2025.
- Application Migration Service (now AWS Transform MGN) = continuous replication, test launches, short cutover.
- First 90 days of replication per server are free.
- Predecessors: CloudEndure Migration and AWS SMS (retired; end of support April 1, 2023).

## Sources

- [What is AWS Application Discovery Service?](https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html)
- [What is AWS Transform MGN?](https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html)
- [AWS Transform MGN FAQ](https://aws.amazon.com/application-migration-service/faqs/)
