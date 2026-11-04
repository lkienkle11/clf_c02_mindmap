---
id: deploy-operate-cloudformation-and-cdk
title: "CloudFormation and the CDK in depth: templates, stacks, change sets and drift"
required: true
videoQuery: AWS CloudFormation vs CDK infrastructure as code stacks change sets drift detection explained
---
## Why infrastructure as code

Clicking through the console builds one environment once. When a team needs identical test, staging and production environments, or the same design in several Regions, a written description of the infrastructure is faster, repeatable and easy to review. This is **infrastructure as code (IaC)**. The basics are in the first lesson of this topic; here we go deeper into how **AWS CloudFormation** and the **AWS CDK** work.

## How CloudFormation works

1. You write a **template**, a YAML or JSON text file that describes resources and their properties. Only the **Resources** section is required.
2. You save it locally or in Amazon S3 and create a **stack** from it. CloudFormation calls the service APIs for you, works out dependencies, and builds independent resources in parallel.
3. You use the stack as one unit. Updating or deleting the stack updates or deletes all its resources together.

Templates can take **parameters**, input values chosen when the stack is created, such as an instance type. One template can then serve a small test stack and a large production stack.

## Safe updates: change sets, rollback and drift

| Feature | What it does | Typical exam clue |
| --- | --- | --- |
| Change set | Previews what an update would add, modify, replace or delete, and changes nothing until you execute it | "See the impact before updating the stack" |
| Rollback | If stack creation fails, CloudFormation deletes the resources it created; a failed update returns to the last known working state | "Stack creation fails halfway" |
| Drift detection | Compares the actual configuration with the template and reports resources changed outside CloudFormation | "Someone edited a resource by hand" |

Two details are easy to miss. A change set does **not** guarantee that the update will succeed. For example, a runtime failure can still occur. And drift detection **reports** differences; it does not repair them. You fix drift yourself, for example by updating the resource to match the template.

## Stacks across Regions and accounts

**CloudFormation StackSets** deploy one template as stacks into several AWS accounts and Regions with a single operation. An administrator account creates the StackSet and the target accounts receive the stacks. This is the answer when a question asks to roll out the same infrastructure to multiple Regions or accounts. It does not replace **AWS Control Tower**, which sets up and governs a whole multi-account environment.

## Cost and responsibility

There is no additional charge for using CloudFormation with AWS resource types. You pay for the resources the stack creates, such as EC2 instances or load balancers. Charges apply only to handler operations of third-party extensions. CloudFormation needs IAM permission to create each resource, so it can only build what the person or role running it is allowed to build.

## AWS CDK

The **AWS Cloud Development Kit (AWS CDK)** is an open-source framework for defining infrastructure in a general-purpose programming language. It supports **TypeScript, JavaScript, Python, Java, C#/.NET and Go**. You write reusable building blocks called **constructs**, group them into stacks, and the CDK deploys them **through CloudFormation**. High-level constructs come with sensible defaults, so a few lines of code can describe many resources. Loops, conditions and unit tests become available for infrastructure.

Because the result is a CloudFormation stack, you still get change sets, rollback and drift detection.

## Choosing the right tool

| Need | Choose |
| --- | --- |
| One-time exploration, visual check | Management Console |
| Repeatable environments from a JSON or YAML template | CloudFormation |
| Define the same infrastructure in TypeScript, Python, Java, .NET or Go | AWS CDK |
| Same stack in many Regions or accounts | CloudFormation StackSets |
| Governed catalog of approved templates for others to launch | AWS Service Catalog (pricing and billing topic) |
| Upload application code and let AWS run it | AWS Elastic Beanstalk (next lessons) |

Remember the split of roles. CloudFormation and the CDK **provision** infrastructure. They do not monitor it (that is CloudWatch), record API calls (CloudTrail) or patch the guest operating system (Systems Manager). When a question says developers want to deploy an application **without provisioning infrastructure themselves**, the answer is Beanstalk, not a template.

## Common traps

- "Templates", "stack", "repeatable", "multiple Regions" point to **CloudFormation**.
- A question that names programming languages for infrastructure points to the **CDK**, not to the AWS CLI or SDKs.
- Rollback on a failed stack creation is the **default** behavior; it does not leave a half-built environment marked complete.
- Governing and sharing approved templates is **Service Catalog**, not CloudFormation alone.

## Key points

- A template describes resources; a stack is the deployed unit that is created, updated and deleted together.
- Change sets preview updates, rollback cleans up failed creations, drift detection finds manual changes.
- StackSets deploy one template to many accounts and Regions.
- The CDK turns code in supported languages into CloudFormation; CloudFormation itself has no extra charge for AWS resources.

## Sources

- [How CloudFormation works](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-overview.html)
- [Detect unmanaged configuration changes with drift detection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html)
- [What is the AWS CDK?](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
