---
id: deploy-operate-elastic-beanstalk-and-deployments
title: "Elastic Beanstalk and deployment strategies in depth"
required: true
videoQuery: AWS Elastic Beanstalk deployment policies all at once rolling immutable blue green canary explained
---
## What Elastic Beanstalk manages

**AWS Elastic Beanstalk** lets you deploy a web application without building the infrastructure by hand. You create an application, upload your **source bundle**, and Beanstalk launches an **environment**: it provisions the Amazon EC2 instances (or, in its newer Cluster mode, Amazon EKS), configures load balancing, sets up health monitoring and scales the environment up and down.

- **Supported platforms:** Go, Java, .NET, Node.js, PHP, Python and Ruby, plus **Docker** containers where you pick your own language and dependencies. Docker is one option, not the only one.
- **Price:** there is **no additional charge** for Beanstalk. You pay only for the underlying resources it creates.
- **Control:** the resources live in your account and you can still see and adjust them.

### Who manages what

| Layer | Managed by |
| --- | --- |
| Capacity provisioning, load balancing, scaling and health monitoring setup | Elastic Beanstalk |
| Your application code and its configuration | You |
| Security of the underlying services | AWS (the cloud) |

The shared responsibility model still applies. Beanstalk removes the setup work, but the application code, data and access to it remain your job.

## Beanstalk compared with its neighbors

| Option | Best fit | Who does more work |
| --- | --- | --- |
| Elastic Beanstalk | Quickly run a web application in a supported language, with minimal infrastructure knowledge | AWS handles the setup; you keep control |
| CloudFormation or CDK | Describe and repeat any infrastructure from a template or code | You define every resource |
| Amazon EC2 directly | Full manual control of servers | You build, scale and patch |
| Containers and serverless | ECS, EKS, Fargate and Lambda, covered in the compute topic | Depends on the service |

Exam wording such as "deploy quickly **without provisioning** the infrastructure yourself", "limited AWS knowledge", or "a non-containerized Java application with automatic capacity, load balancing, scaling and health monitoring" all describe **Elastic Beanstalk**. If the question says "templates" or "repeatable environments", it describes CloudFormation instead.

## Deployment strategies

A deployment strategy is the way a new version replaces the old one. The first lesson on releasing software introduced four; this table adds what Beanstalk and CodeDeploy call them.

| Strategy | How it works | Downtime and risk | Rollback |
| --- | --- | --- | --- |
| All at once | New version goes to every instance together | Fastest; short outage possible | Redeploy the old version |
| Rolling | One batch of instances at a time | No full outage; capacity dips during the update | Redeploy the old version |
| Rolling with additional batch | Launches an extra batch first, then rolls | Capacity stays full; slower | Redeploy the old version |
| Immutable | Launches new instances in a second Auto Scaling group; old ones are removed after health checks pass | Safe; slower; extra instances for a while | Terminate the new instances |
| Traffic splitting (canary) | Sends a share of traffic to the new version first | Only a small share of users is exposed | Reroute traffic and terminate the new instances |
| Blue/green | Deploys to a separate environment, then swaps | Minimal impact | Swap the URLs back |

### Beanstalk specifics

- **All at once** is the fastest policy and suits cases where a short loss of service is acceptable. **Rolling** avoids downtime. **Rolling with an additional batch** keeps full bandwidth. **Immutable** works in load-balanced and single-instance environments; **traffic splitting** needs an Application Load Balancer.
- **Blue/green** in Beanstalk means launching a second environment with the new version, testing it, and then using **Swap environment URLs**, which swaps the CNAME records of the two environments. It is the way to avoid the short unavailability of in-place updates, and it is required for an incompatible platform update. Keep the database outside the environment, otherwise the swap does not carry it over.
- **CodeDeploy** also supports in-place and blue/green deployments for EC2 (on-premises servers: in-place only), and canary, linear and all-at-once traffic shifting for Lambda and Amazon ECS.

### When to choose each

| Scenario | Strategy |
| --- | --- |
| A short loss of service is acceptable and speed matters | All at once |
| Production without a full outage, accepting reduced capacity | Rolling |
| Production that must keep full capacity | Rolling with additional batch or immutable |
| New version must be proven on a small share of users first | Canary or traffic splitting |
| Instant, safe return to the old version while it keeps running | Blue/green |

## Common traps

- "Return to the previous version within seconds, old environment still running" is **blue/green**, not rolling or all at once.
- Beanstalk adds **no hourly fee**; and it is not limited to Docker.
- Beanstalk provisions and runs the application; **CodePipeline** orchestrates the release stages and **CodeDeploy** automates deployments (next lesson).

## Key points

- Beanstalk handles capacity, load balancing, scaling and health monitoring for uploaded code, at no extra charge.
- You keep ownership of the code, the data and control of the resources.
- All at once is fastest, rolling avoids downtime, immutable and traffic splitting reduce risk, blue/green gives the quickest rollback.
- Pick Beanstalk for "deploy without provisioning", CloudFormation for "repeatable from a template".

## Sources

- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [Deploying applications to Elastic Beanstalk environments](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html)
- [Blue/Green deployments with Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.CNAMESwap.html)
