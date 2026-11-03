---
id: capstone-answering
title: "Reading and answering questions: keywords, elimination and revision"
required: true
videoQuery: AWS Cloud Practitioner exam tips keywords elimination strategy
---
## Read the last line first

Most questions are a short story and one ask, such as "Which AWS service will meet these requirements?". Read the ask first, then scan the story for **requirement words**. Words in capitals, such as **MOST**, **LEAST** or **NOT**, change the answer.

## Keywords and what they point to

| Wording | What it usually rewards |
| --- | --- |
| "MOST cost-effective", "LOWEST cost" | The cheapest option that still meets every requirement |
| "LEAST operational overhead" | Managed or serverless services, such as Lambda or RDS, over self-managed EC2 |
| "Highly available" | Resources across **multiple Availability Zones**, often behind a load balancer |
| "Fault tolerant" | The workload **keeps running** when a component fails, with redundancy built in |
| "Disaster recovery", "data sovereignty" | Choosing **Regions** deliberately |
| "Loosely coupled", "decouple" | Amazon SQS, SNS or EventBridge between components |
| "Customer's responsibility" | Data, IAM, guest OS patching, configuration |

## Eliminate, then choose

1. Cross out options that do a **different job**.
2. Cross out options that **break a constraint** (an upfront commitment when the workload lasts two weeks).
3. Compare what is left against the **exact wording**. When two options both work, pick the one that matches "most", "least" or "lowest".

Beware of options that are true but do not answer the question.

## Multiple response questions

- Count the answers you need and choose exactly that number.
- Judge each option **on its own**: is it true, and does it meet the requirement?
- Options often come in look-alike pairs (Polly and Transcribe); knowing the difference matters.

## Common wording traps

- A service that **recommends** (Trusted Advisor) versus one that **enforces** (an SCP or IAM policy).
- **Audit who did what** (CloudTrail) versus **watch metrics** (CloudWatch).
- Old and new names: AWS Transform MGN was Application Migration Service; Business Support+ replaces Business Support.

## Revising with this app

- **History**: scores per attempt against the 80% line, topics needing attention and most-missed questions. Open any attempt to see its questions again.
- **Needs review badge**: a completed topic gets a "Needs review" badge when some of its questions are due. Questions you miss come back the next day; ones you keep answering correctly come back after longer gaps.
- **Daily review prompt**: at most once a day, when questions are due, the app offers a review. Choose **Full** (all due topics), **Quick** (about 15 questions from the topics you forgot most) or **Custom** (topics you tick). Reviews run in **batches of 15** and put questions you missed first.
- The **Review** button on the main screen offers the same choice whenever questions are due.

## Key points

- Find the ask and the capitalized requirement words before reading the options.
- Eliminate wrong jobs and broken constraints, then match the exact wording.
- Use History, the review prompt and Capstone practice to revise weak areas.

## Sources

- [AWS Certified Cloud Practitioner (CLF-C02) exam guide](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html)
- [AWS Certification exam prep](https://aws.amazon.com/certification/certification-prep/)
