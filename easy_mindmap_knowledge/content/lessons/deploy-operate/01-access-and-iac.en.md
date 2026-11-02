---
id: deploy-operate-access-iac
title: "Ways to work with AWS, and infrastructure as code"
required: true
videoQuery: AWS Management Console CLI SDK CloudShell and CloudFormation infrastructure as code explained
---
## Every action is an API call

Whatever tool you use, it ends up calling the **AWS APIs**.

| Tool | What it is | Best for |
| --- | --- | --- |
| AWS Management Console | Web-based user interface | Learning, exploring, one-time tasks, visual checks |
| AWS CLI | Unified command line tool for AWS services | Scripts and quick repeatable admin tasks |
| AWS SDKs | Libraries for languages such as Python, Java, JavaScript, .NET, Go | Calling AWS from application code |
| AWS CloudShell | Browser-based shell opened from the console | Running CLI commands without installing anything |

- **SDKs** handle low-level details such as signing requests (authentication), retries and error handling, so developers focus on application logic.
- **CloudShell** is **pre-authenticated** with the credentials you used to sign in to the console, has the AWS CLI already installed, and has no additional charge.

## One-time operations or repeatable processes

The exam asks you to tell these apart:

- The console is fine for a **one-time** task or a first experiment.
- When the same environment must be built **again and again** (test, staging and production, or several Regions), clicking is slow and error-prone. Use **infrastructure as code (IaC)**.

## AWS CloudFormation

**AWS CloudFormation** is the AWS service for IaC.

- You write a **template**, a **JSON or YAML** text file that describes the resources you want, such as an Auto Scaling group, a load balancer and an RDS database.
- CloudFormation creates those resources as one unit called a **stack**. Deleting the stack deletes its resources.
- Before you update a stack, a **change set** shows what will change, for example whether a database would be replaced.
- If stack creation fails, CloudFormation **rolls back** and removes what it created.
- Templates are text: keep them in version control and **reuse** them to build identical environments in other Regions or accounts.
- There is no additional charge for CloudFormation with AWS resource types; you pay for the resources it creates.

## AWS CDK

The **AWS Cloud Development Kit (AWS CDK)** lets you define infrastructure in familiar programming languages such as TypeScript, Python, Java, C# and Go. You compose reusable building blocks called **constructs**, and the CDK deploys them **through CloudFormation**. Choose CDK when a team prefers loops, functions and IDE support over writing YAML by hand.

## Common traps

- "Repeatable, consistent environments", "templates" or "version-controlled infrastructure" point to **CloudFormation**.
- "Access AWS from application code" points to the **SDKs**; "run CLI commands from the browser with no setup" points to **CloudShell**.
- CloudFormation **provisions** infrastructure; it is not a monitoring service.

## Key points

- Console for visual and one-time work; CLI and SDKs for automation and code.
- CloudShell = browser shell, pre-authenticated, CLI preinstalled.
- IaC makes environments repeatable; CloudFormation uses JSON or YAML templates and stacks.
- CDK writes infrastructure in programming languages and deploys through CloudFormation.

## Sources

- [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)
- [How CloudFormation works](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-overview.html)
- [What is the AWS CDK?](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
