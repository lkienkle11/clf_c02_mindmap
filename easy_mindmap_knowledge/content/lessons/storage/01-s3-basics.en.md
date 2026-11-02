---
id: storage-s3-basics
title: Amazon S3 basics: buckets, objects, durability and security
required: true
videoQuery: Amazon S3 basics buckets objects versioning explained
---
## Object storage in one paragraph

**Amazon Simple Storage Service (Amazon S3)** is **object storage**. You create a **bucket** in a Region you choose, then upload **objects** into it. An object is a file plus **metadata** that describes it, and each object is found by its **key** (its name inside the bucket). You do not attach S3 to a server like a disk; applications read and write objects over HTTPS through the S3 API. You pay only for what you store and use, with no capacity to plan up front. Typical uses: backups, data lakes, media files, logs and website assets.

## Durability versus availability

These two words are easy to mix up:

- **Durability**: how unlikely it is that your data is **lost**. S3 storage classes are designed for 99.999999999% (eleven 9s) durability.
- **Availability**: how often you can **reach** the data when you ask for it. It differs by storage class; S3 Standard is designed for 99.99%.

| Term | Question it answers | S3 Standard design |
| --- | --- | --- |
| Durability | Will my data still exist? | 99.999999999% |
| Availability | Can I read it right now? | 99.99% |

Data stored in a Region stays in that Region unless you copy or replicate it elsewhere.

## Versioning

**S3 Versioning** keeps every version of an object in the bucket. Overwriting an object creates a new version, and deleting it adds a **delete marker** instead of removing the data, so you can restore earlier versions. This protects against accidental deletion or overwrite. Versioning is off by default; once enabled it can only be **suspended**, not removed, and every stored version is billed.

## Static website hosting

A bucket can host a **static website** (HTML, CSS, images and client-side scripts, with no server-side code). The content must be publicly readable. S3 website endpoints do not support HTTPS, so for HTTPS you put Amazon CloudFront in front of the bucket.

## Security basics

- Buckets and objects are **private by default**; access is granted through IAM policies and bucket policies.
- **S3 Block Public Access** settings at the account or bucket level override policies that would make data public. Keep them on unless you truly need public access.
- **Encryption at rest**: since January 2023, S3 automatically encrypts every new object with server-side encryption using S3 managed keys (SSE-S3), at no extra cost. You can choose AWS KMS keys instead.

## Common traps

- "Eleven 9s" describes **durability**, not availability.
- S3 is not block storage; you cannot install an operating system on it.

## Key points

- S3 stores objects (data plus metadata) in buckets; each object has a key.
- Durability = data is not lost; availability = data can be reached.
- Versioning protects against accidental deletes and overwrites.
- Private by default, Block Public Access, and default SSE-S3 encryption.

## Sources

- [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)
