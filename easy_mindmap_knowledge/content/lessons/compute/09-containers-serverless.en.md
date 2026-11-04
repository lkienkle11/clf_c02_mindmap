---
id: compute-containers-serverless
title: Containers, serverless and other compute choices
required: true
videoQuery: AWS Lambda vs ECS vs EKS vs Fargate when to use which
---
## Beyond virtual servers

EC2 gives the most control, and the most to manage. Other compute options ask you to manage less.

## Containers

A **container** packages an application with everything it needs to run, so it behaves the same everywhere.

- **Amazon Elastic Container Service (Amazon ECS)**: AWS's fully managed container orchestration service. It runs and scales your containers.
- **Amazon Elastic Kubernetes Service (Amazon EKS)**: managed **Kubernetes**. AWS runs the Kubernetes control plane. Choose it when a team already uses Kubernetes.
- **AWS Fargate**: a **serverless compute engine for containers**, used with ECS or EKS. You give each task or pod its CPU and memory; you do not choose, patch or scale EC2 instances.
- **Amazon Elastic Container Registry (Amazon ECR)**: a managed registry to store, manage and share container images.

ECS and EKS answer "**who orchestrates** the containers?". Fargate or EC2 answers "**where do they run**?". With EC2 you keep control of the servers; with Fargate AWS manages them.

## Serverless functions: AWS Lambda

**AWS Lambda** runs your code without servers to provision or manage. It is **event-driven**: a function runs when something happens, such as a file uploaded to Amazon S3, a message in a queue or an HTTP request through Amazon API Gateway. Lambda scales automatically, and you pay for requests and the compute time used, with **no charge when no code runs**. A standard function invocation is limited to 15 minutes, so long-running jobs usually belong elsewhere.

## Other compute services in one line each

- **AWS Elastic Beanstalk**: upload your web application code; Beanstalk provisions the instances, load balancing, scaling and health monitoring. There is no extra charge for Beanstalk itself.
- **Amazon Lightsail**: the simplest way to start, with virtual private servers, databases and more for a **low, predictable monthly price**.
- **AWS Batch**: a fully managed service that plans, schedules and runs batch computing jobs at any scale on EC2 (including Spot) or Fargate.

## Choosing

| Requirement | Good fit |
| --- | --- |
| Full control of the operating system | Amazon EC2 |
| Run containers without managing servers | AWS Fargate with ECS or EKS |
| Kubernetes on AWS | Amazon EKS |
| Short code triggered by events, pay only when it runs | AWS Lambda |
| Deploy a web app without designing the infrastructure | AWS Elastic Beanstalk |
| Simple website at a fixed monthly price | Amazon Lightsail |

## Common traps

- Fargate is **not** an orchestrator; it runs containers for ECS or EKS.
- ECR **stores** images; it does not run them.
- "Serverless" means you do not manage servers, not that none exist.

## Key points

- ECS and EKS orchestrate containers; Fargate removes the servers underneath.
- Lambda is event-driven and billed only when code runs.
- Beanstalk, Lightsail and Batch hide infrastructure for common use cases.

## Sources

- [What is Amazon Elastic Container Service?](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
