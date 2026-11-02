---
id: global-infrastructure-extending-aws
title: Local Zones, Wavelength, Outposts and data sovereignty
required: true
videoQuery: AWS Local Zones vs Wavelength vs Outposts
---
## Extending AWS beyond the Region

Regions cover most needs, but some workloads need AWS even **closer** to users or devices, or must stay **inside a specific site**. Three options extend AWS infrastructure outward. Each one is connected to a **parent Region**, and you manage it with the same AWS tools and APIs.

## AWS Local Zones

Local Zones place compute, storage, database and other selected services **close to large population and industry centers**. They help applications that need very low latency (single-digit milliseconds) for nearby users, such as real-time gaming, live streaming, AR/VR and media production. They can also help meet local data residency rules.

## AWS Wavelength

Wavelength places AWS compute and storage **at the edge of telecommunications providers' networks**, inside the providers' data centers. Running the application that close to the mobile network gives very low latency to mobile users and connected devices. A Wavelength Zone is a logical extension of its parent Region.

## AWS Outposts

Outposts is a **fully managed** service that brings AWS infrastructure, services, APIs and tools to **your own data center or a colocation site**. AWS delivers, installs (for racks), monitors and maintains the hardware; it operates as part of an AWS Region. Typical reasons: low-latency access to on-premises systems, local data processing, and data residency. It is a classic example of a **hybrid** deployment.

## Quick comparison

| Option | Where it runs | Best clue in a question |
| --- | --- | --- |
| Local Zones | AWS infrastructure near large cities | "Users in a specific metro area need single-digit ms latency" |
| Wavelength | Inside a telecom provider's network | "Mobile or 5G devices need ultra-low latency" |
| Outposts | Your own data center | "Must stay on premises but use the same AWS APIs" |

## Data sovereignty implications

- **You choose the Region**, and content stays there unless you move or replicate it. This is the main tool for meeting data residency laws.
- When no Region exists in the required country or site, **Local Zones** or **Outposts** can keep data and processing local.
- Using **multiple Regions** lets a company keep each country's data in that country while serving users worldwide.

## Key points

- Local Zones: AWS close to large cities, for low-latency local users.
- Wavelength: AWS inside telecom networks, for mobile and 5G edge use cases.
- Outposts: AWS-managed hardware on your premises, for hybrid, low latency and residency needs.
- Region choice is the first answer to data sovereignty questions.

## Sources

- [What is AWS Local Zones?](https://docs.aws.amazon.com/local-zones/latest/ug/what-is-aws-local-zones.html)
- [What is AWS Wavelength?](https://docs.aws.amazon.com/wavelength/latest/developerguide/what-is-wavelength.html)
- [What is AWS Outposts?](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html)
