---
id: compute-ami-and-image-builder
title: AMIs and EC2 Image Builder
required: true
videoQuery: Amazon Machine Image AMI copy across Regions EC2 Image Builder pipeline explained
---
## What an AMI is

An **Amazon Machine Image (AMI)** is the template EC2 uses to boot an instance. It supplies the software needed to start the server, usually an operating system plus anything you added, and a **block device mapping** that says which volumes to attach. You must pick an AMI every time you launch an instance, and one AMI can start any number of identical instances.

The basic lesson on AMIs sits in the EC2 basics lesson. Here is the deeper picture.

## What an AMI is tied to

An AMI is specific to a **Region**, an operating system, a processor architecture, a root volume type and a virtualization type. The Region part matters most: an instance can only launch from an AMI that lives in its own Region.

Most AMIs are **EBS-backed**: the root volume comes from an **Amazon EBS snapshot**, a point-in-time, incremental backup of a volume stored by AWS. That is why creating an AMI from a running instance produces snapshots, and why you pay for the snapshot storage that backs your AMIs.

## Where AMIs come from

| Source | What it is |
| --- | --- |
| AWS-provided | Maintained images such as Amazon Linux and Windows Server |
| Public / community | Shared by others; check who published it before trusting it |
| **AWS Marketplace** | Images from vendors, some with an extra software charge |
| Your own | Created from an instance you configured |
| Shared with you | Another account granted you launch permission |

**Launch permissions** decide who may use an AMI: **public** (all accounts), **explicit** (named accounts, organizations or organizational units) or **implicit** (the owner). Only the owner can change them.

## Copying and sharing AMIs

To use an AMI in another Region, **copy** it there. The copy becomes a separate AMI in the destination Region and is backed by new snapshots. Launch permissions and bucket permissions are **not** copied, and only your own user-defined tags are. Copying itself is free, but you pay standard storage for the extra snapshots. You can also share an AMI with other AWS accounts without copying it.

AMIs and snapshots also support **disaster recovery** for EC2. An AMI can recreate a whole server, including its configuration, and an EBS snapshot holds everything needed to restore a volume's data. Because an AMI can be copied to a second Region, you can launch the same server there if the first Region has trouble. In its backup and restore approach, AWS's disaster recovery guidance lists EBS snapshots as point-in-time backups of volume data and says you can back up EC2 instances as AMIs, which are built from snapshots of the instance's volumes and can be copied within or across Regions and used to launch a restored version of the server. AWS does not back up your EBS volumes automatically; taking snapshots is your responsibility.

A subtle point: **user data is an instance setting, not part of the AMI**. A new instance from your AMI does not inherit the old instance's user data.

## Golden images and EC2 Image Builder

A **golden AMI** is an image you have patched, hardened and tested, then use as the standard starting point for all servers. Building one by hand is slow and error-prone. **EC2 Image Builder** is the fully managed AWS service that automates it.

An **image pipeline** ties together:

- A **recipe**: a base image plus the **components** applied to it, such as installing software or applying security settings.
- **Build** and **test** stages: Image Builder launches a temporary instance, applies the build components, then tests the result. It distributes the image only if the tests pass.
- **Distribution**: the finished AMI (or a container image) is sent to the Regions you choose and can be shared with other accounts or an AWS Organization.
- A **schedule**, so new images appear automatically, for example whenever patches are due.

There is no charge for Image Builder itself. You pay for the resources it uses, such as the build instances and the snapshots that store the images.

## AMI or Image Builder?

| Question | Answer |
| --- | --- |
| What is the template that boots an instance? | An AMI |
| Which service automates creating, testing and distributing images? | EC2 Image Builder |
| What stores an EBS volume's backup? | An EBS snapshot |
| An AMI is needed in another Region | Copy the AMI |

## Common exam traps

- Image Builder **builds** images; an AMI is the image. A question about "creating, testing and managing custom images" points to Image Builder, not AWS Elastic Beanstalk.
- An AMI never crosses Regions by itself. Copy it.
- Deleting a snapshot is not enough to stop all charges if other snapshots still use the same data.

## Key points

- An AMI boots instances and is Regional; copy it to use it elsewhere.
- EBS-backed AMIs rest on EBS snapshots, which you pay to store.
- Marketplace AMIs may carry software fees; check publishers of public AMIs.
- EC2 Image Builder automates build, test and distribution of AMIs through pipelines.

## Sources

- [Amazon Machine Images in Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [Disaster Recovery of Workloads on AWS](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- [What is EC2 Image Builder?](https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html)
