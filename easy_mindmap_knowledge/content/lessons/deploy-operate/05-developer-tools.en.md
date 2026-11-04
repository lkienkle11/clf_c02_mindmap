---
id: deploy-operate-developer-tools
title: "The AWS developer toolchain: CodeBuild, CodeDeploy, CodePipeline, CodeArtifact, CodeCommit, CodeStar, Cloud9 and CodeGuru"
required: true
videoQuery: AWS CodePipeline CodeBuild CodeDeploy CodeArtifact CodeCommit toolchain explained for beginners
---
## One pipeline, several services

A release pipeline moves a code change through stages. Each AWS developer tool owns one stage, and **AWS CodePipeline** connects them:

```
Source  ->  Build and test  ->  Deploy
Git repo    CodeBuild           CodeDeploy, Elastic Beanstalk or CloudFormation
            (packages from CodeArtifact)
            all stages ordered and automated by CodePipeline
```

A pipeline is made of **stages**, and each stage contains **actions** of type source, build, test, deploy, approval or invoke. A new commit can start the pipeline, so the release runs without manual steps. Some tools in this lesson have a changed availability status, so read the status column.

| Service | One-line purpose | Exam clue |
| --- | --- | --- |
| **AWS CodePipeline** | Models, visualizes and automates the steps of a release | "Orchestrate the release stages" |
| **AWS CodeBuild** | Fully managed build service: compiles code, runs unit tests, produces deployable artifacts | "Compile and test without managing build servers" |
| **AWS CodeDeploy** | Automates deployments to EC2, on-premises servers, Lambda and Amazon ECS | "Deploy to EC2 and on-premises servers" |
| **AWS CodeArtifact** | Managed artifact repository for software packages | "Store and share npm, Maven or pip packages" |
| **AWS CodeCommit** | Managed private Git repositories | "Host source code in AWS" |
| **AWS CodeStar** | Former unified console for starting a project with its toolchain | "Quickly set up a CI/CD project" (old wording) |
| **AWS Cloud9** | Browser-based IDE | "Write and debug code in a browser" |
| **Amazon CodeGuru** | Code review (Reviewer) and runtime performance profiling (Profiler) | "Find code defects" or "find expensive lines of code" |

## The core three

- **CodeBuild** has no servers for you to provision, patch or scale. It scales on demand and you pay only for the **build minutes** you use.
- **CodeDeploy** deploys application content from S3 or Git repositories. On EC2 and on-premises servers it supports **in-place** and **blue/green** deployments, with an agent on each server. For Lambda and Amazon ECS, traffic shifts as **canary**, **linear** or **all at once**. It can stop and roll back on errors.
- **CodePipeline** does not compile or deploy by itself. It calls CodeBuild, CodeDeploy, Elastic Beanstalk, CloudFormation and other providers, and can include a manual approval action.

## CodeArtifact

**AWS CodeArtifact** stores the packages your builds depend on. It works with package managers such as npm, Maven, Gradle, pip and NuGet. A repository can connect to public registries such as npmjs.com or Maven Central, fetch packages on demand and keep a copy, and you can publish your own private packages for other teams. Authentication uses your AWS credentials, and packages cannot be made public.

## Status of services that changed

AWS has changed the availability of several developer tools. Exam questions may still treat them as normal, so know both the purpose and the status.

- **AWS CodeCommit:** AWS stopped onboarding new customers in 2024. On November 24, 2025 it announced that CodeCommit returned to general availability, with new customer sign-ups open again.
- **AWS CodeStar:** AWS lists CodeStar in the "Services in Full Shutdown" table with an end-of-support date of July 25, 2024. It was the service that created a project with a ready-made repository, build and deploy pipeline. A comparable chain can be built by hand from CodePipeline, CodeBuild and CodeDeploy. A question about "quickly implementing CI/CD" may still key CodeStar, so recognize the name.
- **AWS Cloud9:** AWS lists it as a service in maintenance and no longer available to new customers; existing customers can keep using it. AWS's migration guidance points to the AWS IDE Toolkits or AWS CloudShell.
- **Amazon CodeGuru Reviewer:** the service is in maintenance too. Since November 7, 2025 you cannot create new repository associations, and AWS points to Amazon Q Developer and Amazon Inspector for similar code analysis. **CodeGuru Profiler** collects runtime data from live applications and suggests where to reduce CPU use and cost; it does not appear on the maintenance list.

CodeBuild, CodeDeploy, CodePipeline and CodeArtifact carry no such notice.

## Look-alikes to separate

- **Cloud9 or CloudShell?** CloudShell is the browser shell that is **pre-authenticated** with your console credentials and has the AWS CLI installed. Cloud9 is a full code editor with a terminal.
- **CodeDeploy or Elastic Beanstalk?** CodeDeploy automates deploying a revision to servers you manage. Beanstalk provisions and runs the whole environment.
- **CodeGuru or CodeBuild?** CodeGuru reviews and profiles code; CodeBuild compiles and tests it.
- **CodeGuru or the CDK?** Neither deploys infrastructure: the CDK defines it in code, CodeGuru analyzes code.

## Key points

- CodePipeline orchestrates; CodeBuild builds and tests; CodeDeploy deploys; CodeArtifact stores packages; CodeCommit stores source.
- CodeBuild is fully managed and billed by build minutes.
- CodeCommit is open to new customers again; CodeStar is in full shutdown; Cloud9 and CodeGuru Reviewer are in maintenance.
- CloudShell, not Cloud9, is the pre-authenticated browser shell.

## Sources

- [Services in Maintenance](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html)
- [Services in Full Shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
- [AWS CodeCommit returns to general availability](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability)
