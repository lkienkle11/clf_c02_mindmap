---
id: storage-snow-family
title: "AWS Snow Family: offline data transfer and edge computing"
required: true
videoQuery: AWS Snow Family Snowball Edge Snowcone Snowmobile explained
---
## What the Snow Family is

The **AWS Snow Family** is a group of physical devices that AWS ships to you. You load data onto them (or run computing on them), ship them back, and AWS imports the data into Amazon S3. They solve two problems: moving very large datasets when the network is too slow or expensive, and storing or processing data at remote sites with poor or no connectivity.

## The devices

| Device | What it is | Status |
| --- | --- | --- |
| **AWS Snowcone** | The smallest, portable edge device for small datasets and edge computing | Discontinued on November 12, 2024 |
| **AWS Snowball Edge Storage Optimized** | Large local storage for data transfer and local storage | No longer available to new customers |
| **AWS Snowball Edge Compute Optimized** | Compute power for edge workloads, such as running EC2-compatible instances on the device | No longer available to new customers |
| **AWS Snowmobile** | A shipping container pulled by a truck, for the largest moves | In full shutdown (end of support March 14, 2024) |

Status matters for real use, but the exam questions still describe these services, so know what each one was for:

- **Snowcone**: small, rugged and portable; edge use with limited space.
- **Snowball Edge**: the workhorse. **Storage Optimized** for moving terabytes up to a few petabytes, **Compute Optimized** for processing data at the edge before it is sent to AWS.
- **Snowmobile**: for tens of petabytes up to exabytes. Exam clue: "tens of petabytes or more", "exabytes", "data center migration", "truck".

**Current status.** Snowcone was discontinued on November 12, 2024 ([AWS Storage Blog](https://aws.amazon.com/blogs/storage/aws-snow-device-updates/)). The availability-change page says Snowball Edge is no longer available to new customers and AWS no longer offers any Snow Family device to new customers; existing customers are not affected. The Snowball product page says support for Snowball devices in AWS commercial Regions ends on December 31, 2026 (GovCloud and ADC Region customers with active jobs are not affected), while the AWS General Reference full-shutdown list shows Snowball Edge with November 12, 2025. AWS pages give different dates; check the availability-change page.

## How a Snow job works

1. In the AWS console you create a **job** and pick the device and the destination S3 bucket.
2. AWS ships the device to you.
3. You connect it to your network and copy data onto it with the Snowball client or AWS OpsHub.
4. You ship it back (the shipping label is shown on the device's E Ink display).
5. AWS copies the data into your S3 bucket, verifies it and securely erases the device.

For **export**, the flow is reversed: AWS loads data from S3 onto the device and ships it to you.

## Snow versus network transfer

| Situation | Better choice |
| --- | --- |
| Good bandwidth, ongoing or recurring copies | **AWS DataSync** over the network |
| A permanent, high-throughput private link | **AWS Direct Connect** |
| Very large one-time dataset, slow or no network | Snow device: Snowball Edge up to a few PB, Snowmobile for tens of PB and above |
| Remote site with no connectivity, needs local processing | Snowball Edge Compute Optimized |

Exam clue: "limited internet connectivity" or "does not want to use the internet" means a Snow device. Size picks the device: up to a few PB or remote-site processing means Snowball Edge; tens of PB and above (for example 50 PB or 75 PB) means Snowmobile. Today AWS directs new customers to **DataSync** for online transfers, **AWS Data Transfer Terminal** for secure physical transfers (you bring your own storage device to an AWS location), AWS Partner solutions, and **AWS Outposts** for edge computing.

Whatever the current status, an exam question about moving large data offline expects a Snow device. Snowball Edge is the standard answer unless the data volume is far larger, in which case it is Snowmobile.

## Common traps

- Snow devices **move or process** data physically; Storage Gateway gives ongoing hybrid access, and DataSync transfers online.
- Snowmobile is for tens of petabytes up to exabytes; Snowball Edge is for terabytes up to a few petabytes.
- Compute Optimized is about processing at the edge, not extra capacity.

## Key points

- Snow Family = physical devices for offline transfer and edge compute: Snowcone, Snowball Edge (Storage and Compute Optimized), Snowmobile.
- Use Snow when the network is too slow, expensive or absent; use DataSync or Direct Connect when connectivity is good.
- Snowcone and Snowmobile are retired; Snowball Edge is closed to new customers, and AWS pages give different end-of-support dates.
- Alternatives: DataSync, Data Transfer Terminal, Partner solutions, Outposts.

## Sources

- [AWS Snowball Edge availability change](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html)
- [AWS Snowball (product page, end-of-support notice)](https://aws.amazon.com/snowball/)
- [Services in Full Shutdown (AWS General Reference)](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
