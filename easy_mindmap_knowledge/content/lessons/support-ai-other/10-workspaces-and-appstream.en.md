---
id: support-ai-other-workspaces-and-appstream
title: "Amazon WorkSpaces and WorkSpaces Applications (AppStream 2.0): desktops versus applications"
required: true
videoQuery: Amazon WorkSpaces vs AppStream 2.0 WorkSpaces Applications explained end user computing
---
## End-user computing in one idea

Both services keep the work on AWS and show only a picture of it on the user's device, so staff can work from low-cost laptops, tablets or personal devices. The exam asks whether the user needs a **whole desktop** or just **one or two applications**.

## Amazon WorkSpaces: managed virtual desktops

**Amazon WorkSpaces** gives each user a cloud-based **virtual desktop**, often called desktop as a service (DaaS). The desktops can run Windows, Ubuntu Linux, Rocky Linux or Red Hat Enterprise Linux. AWS removes the need to buy and deploy hardware or install complex software, and you add or remove users as needs change. Users connect from several kinds of device or from a web browser.

There are two modes:

- **WorkSpaces Personal**: a **persistent** desktop assigned to one user, like a physical desktop computer.
- **WorkSpaces Pools**: **non-persistent** desktops on ephemeral infrastructure, suited to curated desktop environments.

You choose monthly or hourly billing, can bring your own Windows licenses, can connect to an on-premises Active Directory, and can add multi-factor authentication. Typical exam wording: "remote employees need a managed workstation in the cloud from any device", "provide desktop environments for several employees", or "Windows or Linux desktops, anywhere, at any time".

## Amazon WorkSpaces Applications (formerly AppStream 2.0)

**Amazon WorkSpaces Applications** streams **individual desktop applications**. AWS renamed the service that older material and the exam guide call **Amazon AppStream 2.0**, so both names appear. You install your applications once, AWS runs them on managed compute, and users open them instantly in an HTML5-capable web browser or the client. The application and its data do not sit on the user's device, you maintain a single version of each app, and you pay as you go with no upfront investment.

Choose it when the application needs **heavy hardware** but users have **lightweight laptops**, or when contractors need one specific application and not a full desktop. Fleet choices include Always-On, On-Demand and Elastic, which trade startup time against cost.

## Retired or closing services you may still see

- **Amazon WorkSpaces Secure Browser** gives secure, browser-based access to internal websites. It closed to new customers on **October 29, 2026**; existing customers keep using it, and AWS suggests WorkSpaces Applications with a Chrome image as an alternative. It is on the CLF-C02 in-scope list.
- **Amazon WorkDocs** (document storage and collaboration) reached end of support on **April 25, 2025**.
- **Amazon WorkLink** (mobile access to internal websites) reached end of support in **November 2021**. Older questions use it as a wrong option next to AppStream 2.0.

## Decision table

| Need | Service |
| --- | --- |
| A full Windows or Linux desktop for each remote employee | Amazon WorkSpaces |
| A persistent personal desktop | WorkSpaces Personal |
| A non-persistent, curated desktop | WorkSpaces Pools |
| One demanding application streamed to a browser | WorkSpaces Applications (AppStream 2.0) |
| Both desktops and applications | WorkSpaces and WorkSpaces Applications together |
| Safe browser-only access to internal sites | WorkSpaces Secure Browser (closed to new customers) |

## Shared responsibility

AWS is responsible for the security **of** the cloud, such as the physical and environmental safety of the facilities that host WorkSpaces. You configure access: multi-factor authentication for users, directory and permission settings, and logging with services such as AWS CloudTrail.

## Exam traps

- "Desktop" means WorkSpaces; "application" means AppStream 2.0 or WorkSpaces Applications.
- Lightweight laptops running a hardware-hungry application is the classic AppStream 2.0 clue.
- AWS Cloud9 and Amazon Lightsail are not desktop services.

## Key points

- WorkSpaces = managed virtual desktops (Personal is persistent, Pools are not).
- WorkSpaces Applications = formerly AppStream 2.0, application streaming.
- WorkSpaces Secure Browser is closed to new customers; WorkDocs and WorkLink have ended.
- You manage user access and MFA; AWS secures the infrastructure.

## Sources

- [What is Amazon WorkSpaces?](https://docs.aws.amazon.com/workspaces/latest/adminguide/amazon-workspaces.html)
- [What Is Amazon WorkSpaces Applications?](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
- [Services in Full Shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
