---
id: compute-ec2-placement-and-hosts
title: Placement groups, Dedicated Hosts and capacity reservations
required: true
videoQuery: EC2 placement groups cluster spread partition Dedicated Hosts vs Dedicated Instances
---
## Where instances run

EC2 normally decides which physical hardware hosts your instance. Sometimes the workload needs a say: low latency between servers, protection from a single hardware failure, a physical server for licensing, or guaranteed capacity. This lesson covers those controls and how they differ from the purchasing options already covered.

## Placement groups

A **placement group** influences how a set of instances is placed on the underlying hardware. Placement groups are optional, there is no charge for creating one, an instance can be in only one group at a time and groups cannot be merged.

| Strategy | What it does | Best for |
| --- | --- | --- |
| **Cluster** | Packs instances close together inside **one Availability Zone** | Tightly coupled workloads needing low latency and high throughput, such as high-performance computing |
| **Spread** | Puts each instance on distinct hardware | A **small** number of critical instances that must not fail together |
| **Partition** | Divides instances into partitions that do not share racks | Large distributed, replicated systems such as Hadoop, Cassandra and Kafka |

Limits worth remembering:

- A cluster group cannot span Availability Zones. Instances in it can use up to 10 Gbps for a single network flow, against 5 Gbps outside one, when enhanced networking is enabled.
- A rack-level spread group supports at most **seven running instances per Availability Zone**, but may span zones.
- A partition group supports at most **seven partitions per Availability Zone**, and partitions can span zones. You can see which instance sits in which partition.

Choosing is mostly keyword matching. "Lowest network latency between nodes" means cluster. "Reduce correlated failures for a few critical instances" means spread. "Large distributed data store, hardware-failure isolation by group" means partition. Cluster trades resilience for speed, since everything shares one zone.

## Dedicated Hosts, Dedicated Instances and Capacity Reservations

These three are easy to confuse. Match the **need**.

| Option | You get | Choose it for |
| --- | --- | --- |
| **Dedicated Host** | A whole physical server for you, with visibility of sockets and cores and control over placement | Bring your own **per-socket, per-core or per-VM licenses**; compliance rules; same host over time |
| **Dedicated Instances** | Instances on hardware dedicated to your account, with no host-level visibility | Isolation from other customers without managing a host |
| **On-Demand Capacity Reservation** | Reserved capacity for a specific instance type in one Availability Zone | Making sure capacity exists when you need it |

A Dedicated Host is billed per host; Dedicated Instances are billed per instance. Dedicated Host Reservations can lower the host price compared with On-Demand host pricing. A Capacity Reservation can be created and cancelled at any time, with no one- or three-year term, but it gives **no discount** on its own and you are charged while it is active. To save money as well, combine it with a Savings Plan or Regional Reserved Instance. A Regional Reserved Instance alone reserves no capacity. Dedicated Hosts cannot be placed in placement groups.

## Spot Instances: what interruption means

Spot Instances run on spare capacity at a steep discount, and the purchasing lesson explains when to choose them. Here is what happens when EC2 takes the capacity back. Reasons include EC2 needing the capacity, a price above your maximum if you set one, or a constraint in your request. EC2 sends an interruption notice **two minutes** before it stops or terminates the instance, through Amazon EventBridge and instance metadata. A request may also be set to **hibernate**, and then the notice comes without a two-minute head start.

The default behavior on interruption is **terminate**. You can ask for **stop** or **hibernate** instead; stopping requires a persistent Spot request. Design Spot workloads to be fault tolerant, with progress saved outside the instance. Auto Scaling launches a replacement when a Spot Instance in a group is interrupted.

## Instance store versus EBS

An **instance store** is temporary block storage on disks physically attached to the host. It costs nothing extra and suits caches, buffers and scratch data, but its data is lost if the instance stops, hibernates or terminates, or if the underlying drive fails. Not every instance type has one. **Amazon EBS** volumes are network-attached and persist independently of the instance. The Storage topic covers EBS in depth.

## Common exam traps

- "Per-socket or per-core licenses" means Dedicated Hosts, not Dedicated Instances.
- A Capacity Reservation guarantees capacity, not price.
- Spot is not for work that cannot be interrupted.
- Cluster placement boosts performance, not availability.

## Key points

- Cluster for speed, spread for a few critical instances, partition for large distributed systems.
- Dedicated Hosts expose sockets and cores for licensing; Dedicated Instances do not.
- Capacity Reservations secure capacity in one zone with no discount.
- Spot gives two minutes' warning; instance store data does not survive a stop.

## Sources

- [Placement groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html)
- [Amazon EC2 Dedicated Hosts](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html)
- [On-Demand Capacity Reservations](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html)
