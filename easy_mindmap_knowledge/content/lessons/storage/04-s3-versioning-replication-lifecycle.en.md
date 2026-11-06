---
id: storage-s3-versioning-replication-lifecycle
title: "S3 data protection: versioning, replication, lifecycle and Object Lock"
required: true
videoQuery: Amazon S3 versioning replication CRR SRR lifecycle Object Lock explained
---
## Four tools, four jobs

Amazon S3 offers several features to protect and manage objects over time. Exam questions pick the one whose job matches the sentence.

| Need | Feature |
| --- | --- |
| Recover from accidental delete or overwrite | **Versioning** |
| Keep copies in another bucket, Region or account | **Replication** (CRR, SRR) |
| Move or delete objects automatically as they age | **Lifecycle rules** |
| Make objects unchangeable for a period (WORM) | **Object Lock** |

## Versioning

**S3 Versioning** keeps multiple versions of an object in the same bucket.

- It is **off by default** and enabled per bucket. Once enabled, it can only be **suspended**, never returned to unversioned.
- Overwriting creates a new version. A normal delete adds a **delete marker** instead of removing data, so you can restore the earlier version. Deleting a specific version ID removes it permanently.
- Each version is a full object, and you pay normal storage prices for every version.
- **MFA delete** adds a second factor: the bucket owner must supply an MFA code to permanently delete a version or change the versioning state. Only the bucket owner (root account) can enable it, and it cannot be turned on in the console. It cannot be used together with lifecycle configurations.

## Replication

**S3 Replication** copies objects automatically and asynchronously between buckets.

- **Cross-Region Replication (CRR)**: source and destination buckets are in **different Regions**. Reasons: compliance that needs distance, lower latency for users elsewhere, and copies close to compute in another Region.
- **Same-Region Replication (SRR)**: both buckets are in the **same Region**. Reasons: aggregating logs into one bucket, syncing production and test accounts, and data sovereignty rules.
- Both need **versioning enabled on the source and destination buckets**.
- Buckets can belong to different AWS accounts.
- Replication applies to new and updated objects after you set it up. To copy objects that already existed, use **S3 Batch Replication**.
- **S3 Replication Time Control** adds a service-level commitment to replicate 99.99% of new objects within 15 minutes.

Exam clue: "copy data to a bucket in another Region automatically" is CRR; "multiple copies in the same Region" is SRR. Replication is not a backup of deletes by itself, so think about versioning too.

## Lifecycle rules

An **S3 Lifecycle configuration** applies actions on a schedule:

- **Transition** objects to a cheaper storage class after a number of days (for example Standard to Standard-IA to Glacier Flexible Retrieval). The storage-classes lesson covers the classes themselves.
- **Expire** (delete) objects after a retention period.
- In a versioned bucket you can also act on **noncurrent versions**, for example expire old versions after 90 days to control cost.

To see what you have stored, **S3 Inventory** produces a scheduled (daily or weekly) report listing your objects and their metadata, so you do not have to call the list APIs.

Reminder: lifecycle rules suit **known, predictable** access patterns. For **unknown or changing** patterns, **S3 Intelligent-Tiering** moves objects between tiers for you automatically.

## Object Lock and Glacier Vault Lock

**S3 Object Lock** stores objects with a **write-once-read-many (WORM)** model, preventing deletion or overwrite for a fixed time or until released. It works only on buckets with **versioning enabled**.

| Concept | Meaning |
| --- | --- |
| **Retention period** | Object version is locked until a retain-until date |
| **Governance mode** | Most users cannot delete; users with a special permission can override. Good for testing |
| **Compliance mode** | No one can delete or shorten retention during the period, **including the root user** |
| **Legal hold** | Locks a version with no expiry until someone removes the hold |

Exam clue: "WORM", "regulatory retention", "no one, even the root user, can delete" points to Object Lock in compliance mode.

**Glacier Vault Lock** belongs to the original standalone Amazon Glacier vault service. A Vault Lock policy can enforce controls such as WORM, and once locked it can no longer be changed or deleted. That standalone Glacier service is no longer accepting new customers; AWS recommends the S3 Glacier storage classes, where Object Lock is the equivalent control. Older exam questions may still mention Vault Lock.

## Common traps

- Replication needs versioning on both buckets; Object Lock needs versioning too.
- Versioning cannot be removed once enabled, only suspended.
- Deleting an object in a versioned bucket does not erase it; it adds a delete marker.
- Compliance mode cannot be bypassed; governance mode can.

## Key points

- Versioning protects against overwrite and delete; MFA delete adds a second factor for permanent deletes.
- CRR copies across Regions, SRR within a Region; both require versioning.
- Lifecycle rules transition and expire objects; Intelligent-Tiering handles unknown patterns.
- Object Lock gives WORM protection; compliance mode blocks even the root user.

## Sources

- [Retaining multiple versions of objects with S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Replicating objects within and across Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
- [Locking objects with Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
