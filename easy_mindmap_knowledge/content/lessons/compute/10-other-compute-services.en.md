---
id: compute-other-compute-services
title: "Other compute services: Lightsail, Batch, App Runner, Cloud Map and OpsWorks"
required: false
videoQuery: Amazon Lightsail AWS Batch AWS App Runner AWS Cloud Map overview for beginners
---
## Optional: services you may still meet

This lesson is optional. It covers smaller compute-related services that show up in practice questions and AWS documentation. Some are changing, so the notes on availability matter.

## Amazon Lightsail

**Amazon Lightsail** is the simplest way to start on AWS. It bundles virtual private servers (instances), containers, managed databases, load balancers, storage, a content delivery network and static IP addresses for a **low, predictable monthly price**. You can launch a ready-made WordPress, LAMP or Nginx stack with a few clicks. Choose it for a small website, a simple web app or a learning project. For full control and the whole range of instance types, use Amazon EC2. A Lightsail project can still connect to other AWS services through VPC peering.

## AWS Batch

**AWS Batch** runs batch computing jobs at any scale. You submit jobs and AWS Batch provisions the compute, such as EC2 instances (including Spot) or AWS Fargate, then schedules the jobs on it. You do not install or manage batch software. It fits simulations, data processing and other work that runs to completion rather than serving users. Do not confuse it with AWS Lambda, which is for short event-driven functions.

## AWS App Runner

**AWS App Runner** deploys a web application or API straight from source code or a container image. It builds, runs, load balances and scales the service for you, with no infrastructure to design. The practice question bank asks which service builds a container from source and deploys it, and this is the match. Be aware that AWS has **closed App Runner to new customers**. Existing customers can continue to use it, and AWS recommends Amazon ECS Express Mode as the path for others. Learn the concept for the exam, but do not plan new projects on it.

## AWS Cloud Map

**AWS Cloud Map** is a **service discovery** (resource registry) service. Applications often need to find the current location of the pieces they depend on, such as a database or another service whose instances come and go. You create a **namespace** (a group for an application), define **services** inside it and register each resource as a service instance. Applications then look up resources with an API call or a DNS query using friendly names. With health checking on, Cloud Map returns **only healthy resources**. Pricing depends on registered resources and discovery calls.

## AWS OpsWorks

**AWS OpsWorks** offered managed **Chef and Puppet** configuration management, which means describing a server's desired software and settings as code. It came in three forms: OpsWorks Stacks, OpsWorks for Chef Automate and OpsWorks for Puppet Enterprise. AWS lists all of them as **no longer available**, with end of support on May 1, 2024. Older material still mentions OpsWorks, so recognize it, then think of today's equivalents: AWS Systems Manager and AWS CloudFormation for configuration and infrastructure as code.

## Pointers to other topics

- **AWS Elastic Beanstalk** deploys web applications without you designing the infrastructure. It belongs to the Deployment and operations topic.
- **AWS Outposts** brings AWS infrastructure to your own data center. It belongs to the Global infrastructure topic.

## Comparison

| Need | Service |
| --- | --- |
| Simple server or website at a fixed monthly price | Lightsail |
| Run large numbers of batch jobs | AWS Batch |
| Deploy code or a container with no infrastructure design | App Runner (closed to new customers) |
| Let applications find each other by name | Cloud Map |
| Chef or Puppet configuration management | OpsWorks (retired) |

## Key points

- Lightsail trades flexibility for simplicity and a predictable price.
- AWS Batch runs jobs, App Runner serves web apps, Cloud Map finds resources.
- App Runner is closed to new customers and OpsWorks is retired.

## Sources

- [AWS App Runner availability change](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html)
- [What is AWS Cloud Map?](https://docs.aws.amazon.com/cloud-map/latest/dg/what-is-cloud-map.html)
- [Services in Full Shutdown (OpsWorks)](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
