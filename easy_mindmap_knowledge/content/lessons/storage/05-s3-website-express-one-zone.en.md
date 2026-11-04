---
id: storage-s3-website-express-one-zone
title: "S3 static websites, pre-signed URLs, Transfer Acceleration and S3 Express One Zone"
required: false
videoQuery: Amazon S3 static website hosting presigned URL Transfer Acceleration Express One Zone
---
## Optional: four S3 extras

This optional lesson covers features that appear in "which S3 feature" questions.

## Static website hosting

A bucket can serve a **static website**: HTML, CSS, images and client-side scripts, with no server-side code. Key points:

- The content must be **publicly readable**, so you must allow public access for that bucket (Block Public Access would block it).
- The S3 website endpoint does not offer HTTPS. For HTTPS and a global content delivery network, put **Amazon CloudFront** in front, or use **AWS Amplify Hosting**, which AWS recommends for static sites stored in S3.
- Exam clue: "static website with the least operational overhead" points to S3 (no servers to manage).

## Pre-signed URLs

A **pre-signed URL** gives someone **time-limited** access to a private object (to download it, or to upload) without making the bucket public. The URL carries the permissions of the AWS user who created it, and it stops working at expiry. Use it to share one private file temporarily.

## S3 Transfer Acceleration

**S3 Transfer Acceleration** speeds up transfers over long distances between your client and an S3 bucket. Data enters at a nearby CloudFront edge location and travels to S3 over AWS's optimized network path. You enable it on the bucket and use a special accelerate endpoint. Exam clue: "quickly and securely move files over long distances to a bucket". It builds on edge locations, covered in the global-infrastructure topic.

## Amazon S3 Express One Zone

**Amazon S3 Express One Zone** is a high-performance S3 storage class for workloads that need consistent **single-digit millisecond** access, such as machine learning training, analytics, and interactive media editing.

- Data is stored in **one Availability Zone that you choose**, so you can place it next to your compute. It is not stored across multiple AZs, so use it for data you can recreate or have elsewhere.
- Objects live in a new bucket type called a **directory bucket**.
- It is designed for 99.95% availability within the AZ and is billed with lower request costs than S3 Standard.
- Requests use session-based authentication for low latency; your applications and SDKs handle it.
- Encryption with SSE-S3 is automatic; SSE-KMS is supported.

Compare it with **S3 One Zone-IA**: One Zone-IA is for infrequently accessed, re-creatable data at a low price; Express One Zone is for the hottest, latency-sensitive data. Exam clue: "single-digit millisecond", "lowest latency S3" points to Express One Zone.

## Key points

- Static website hosting needs public read access; use CloudFront for HTTPS.
- Pre-signed URLs share private objects for a limited time.
- Transfer Acceleration uses edge locations to speed long-distance transfers.
- S3 Express One Zone: single AZ, directory buckets, lowest-latency S3.

## Sources

- [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Sharing objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [High performance workloads: S3 Express One Zone](https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-bucket-high-performance.html)
