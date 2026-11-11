---
id: deploy-operate-cicd-beanstalk
title: "Releasing software: CI/CD tools, Elastic Beanstalk and deployment strategies"
required: true
videoQuery: AWS CodePipeline CodeBuild CodeDeploy Elastic Beanstalk blue green deployment explained
---
## CI/CD in one paragraph

**Continuous integration (CI)** means every code change is built and tested automatically. **Continuous delivery (CD)** means every change that passes is ready to release through an automated pipeline.

## The AWS developer tools

- **AWS CodeCommit** (source): managed private Git repositories.
- **AWS CodeBuild** (build and test): compiles code, runs tests and produces deployable artifacts.
- **AWS CodeDeploy** (deploy): automates deployments to EC2, on-premises servers, Lambda and ECS.
- **AWS CodePipeline** (orchestration): models and automates the whole release flow from source to deploy.

- **CodeBuild** is fully managed: no build servers to manage, and you pay for the build minutes you use.
- **CodePipeline** connects the stages: source from CodeCommit or another Git provider, build with CodeBuild, deploy with CodeDeploy, Elastic Beanstalk or CloudFormation.
- **CodeCommit**: AWS announced in July 2024 that it was de-emphasizing it, then returned it to general availability on 24 November 2025, with new-customer sign-ups open again.

## AWS Elastic Beanstalk

**Elastic Beanstalk** is the "just upload your code" option. You give it your application (Java, .NET, Node.js, PHP, Python, Ruby, Go or Docker), and it **provisions EC2 instances, load balancing, auto scaling and health monitoring** for you. You can still see and control the underlying resources. There is **no additional charge** for Elastic Beanstalk; you pay for the resources it creates.

## Deployment strategies

| Strategy | How it works | Trade-off |
| --- | --- | --- |
| All at once (in place) | Update every server at the same time | Fastest, but a short outage is possible |
| Rolling | Update one batch of servers at a time | No full outage, but reduced capacity during the update |
| Blue/green | Run the new version (green) next to the old one (blue), then switch traffic | Fast, safe rollback by switching back; costs extra resources for a while |
| Canary | Send a small share of traffic to the new version first, then the rest | Problems affect only a few users |

CodeDeploy supports in-place deployments (one batch at a time or all at once, depending on the deployment configuration) on EC2 and on-premises servers, and blue/green deployments on EC2, Lambda and ECS; for Lambda and ECS it shifts traffic as **canary**, **linear** or **all at once**. Elastic Beanstalk offers policies such as all at once, rolling, immutable and **traffic splitting** (a canary method).

## Common traps

- "Deploy a web app without managing the infrastructure, but keep access to it" points to **Elastic Beanstalk**.
- "Compile and run unit tests" is **CodeBuild**; "orchestrate the release stages" is **CodePipeline**; "roll out to servers or Lambda" is **CodeDeploy**.
- "Instant rollback by switching traffic back" points to **blue/green**.

## Key points

- CI builds and tests every change; CD keeps changes ready to release.
- CodeCommit (source), CodeBuild (build/test), CodeDeploy (deploy), CodePipeline (orchestrates).
- Elastic Beanstalk handles capacity, load balancing, scaling and health; no extra charge.
- Blue/green, rolling and canary reduce release risk in different ways.

## Sources

- [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [What is CodeDeploy?](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)
- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
