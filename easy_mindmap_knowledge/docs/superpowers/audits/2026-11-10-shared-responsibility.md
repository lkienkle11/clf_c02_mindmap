# Audit report: shared-responsibility

Date: 2026-11-11. Status: **decisions D1 to D3 taken by the user on 2026-11-11 and applied** (section 6). E2 to E5 and L1 to L8 are in `content/` (English and Vietnamese); E1 is applied with one change: the letter reference "(B)" was removed, because the content rules forbid option letters in learner-facing text.
Spec: `docs/superpowers/specs/2026-11-10-question-bank-and-lesson-quality-audit-design.md`. Source of truth: current official AWS documentation (pages opened on 2026-11-11, listed per finding).

## 1. Result at a glance

| Area | Checked | Result |
|---|---|---|
| Questions and answers | 29 (19 imported + 10 authored) | **No answer needs to change.** Both checkers verified all 29 keys; the orchestrator re-read the official pages for 14 of them (section 2). One question is ambiguous (D1). |
| Explanations and option notes | 29 | **5 need a wording fix** (E1 to E5), none changes an answer. |
| English lessons | 9 lessons, about 5,000 words | **8 wording fixes** (L1 to L8); 2 reported findings rejected (R1, R2). |
| Vietnamese lessons | 9 lessons, about 6,800 words | Numbers, structure (bullets, table rows, headings, links) and product names are identical to the English lessons in all 9. No worker reported a different fact. Each English fix below is to be mirrored in Vietnamese. |
| Import problems | the deck | None for this topic. (Three deck cards are missing from the whole bank because their answer key is wrong in the deck; none belongs to this topic. See the ledger.) |

How it was checked: Codex `gpt-6.1-sol` (high) and Haiku 5.5 (XHigh) each audited every question and every lesson with web access; Agy `gemini-3.8-flash-high` was run on the questions in the pilot only (no web access). The orchestrator re-read the official page for every disputed finding and for 14 of the 29 answers (column "Orchestrator checked"); the other 15 answers were verified by both checkers and are not independently re-read by the orchestrator.

## 2. The 29 answers

| # | Question id | Source | Current key | Codex | Haiku | Agy | Orchestrator checked | Question |
|---|---|---|---|---|---|---|---|---|
| 1 | `q_81ec921ce159` | imported | C | verified | verified | verified | yes | Which option is a shared responsibility between AWS and its custome... |
| 2 | `q_341570b0e614` | imported | B | ambiguous | verified | verified | yes | Which option is a customer responsibility under the AWS shared resp... |
| 3 | `q_b927dfd0a6af` | imported | A | verified | verified | verified | yes | Which task is a customer’s responsibility, according to the AWS sha... |
| 4 | `q_0bd876fc648f` | imported | C | verified | verified | verified | no | What is the customer ALWAYS responsible for managing, according to ... |
| 5 | `q_4b4b61775da2` | imported | D | verified | verified | verified | no | Which task is a responsibility of AWS, according to the AWS shared ... |
| 6 | `q_da1bb57090df` | imported | A | verified | verified | verified | yes | Which option is a shared control between AWS and the customer, acco... |
| 7 | `q_587ebd261839` | imported | C,D | verified | verified | verified | yes | Which of the following is the customer's responsibility under the A... |
| 8 | `q_d185d25f405f` | imported | B | verified | verified | verified | yes | Who is responsible for managing IAM user access and secret keys acc... |
| 9 | `q_d3b78e770134` | imported | D | verified | verified | verified | yes | Which of the following is entirely the responsibility of AWS, accor... |
| 10 | `q_7dbf3cfd3482` | imported | C | verified | verified | verified | no | Which task is a responsibility of AWS, according to the AWS shared ... |
| 11 | `q_4c55323b4835` | imported | C | verified | verified | verified | yes | Which option is a responsibility of AWS under the AWS shared respon... |
| 12 | `q_144b9ff336bb` | imported | B | verified | verified | verified | no | What does "security of the cloud” refer to in the AWS shared respon... |
| 13 | `q_3a768276cf29` | imported | D | verified | verified | verified | no | Which option is AWS responsible for under the AWS shared responsibi... |
| 14 | `q_ad57a1b70c1a` | imported | B,C | verified | verified | verified | no | A company is learning about its responsibilities that are related t... |
| 15 | `q_867955ccd39e` | imported | A,D | verified | verified | verified | no | According to the AWS shared responsibility model, which of the foll... |
| 16 | `q_a227eb0c738c` | imported | C,E | verified | verified | verified | no | Which tasks are the responsibility of AWS according to the AWS shar... |
| 17 | `q_27c19e01e8a3` | imported | B,D | verified | verified | verified | no | Which tasks are responsibilities of the customer, according to the ... |
| 18 | `q_8ed2db8565d8` | imported | C | verified | verified | verified | no | Under the AWS shared responsibility model, which of the following i... |
| 19 | `q_7ac2e54391af` | imported | B | verified | verified | verified | no | Which task is the customer’s responsibility, according to the AWS s... |
| 20 | `auth-shared-responsibility-01` | authored | B | verified | verified | verified | yes | A company runs its web application on Amazon EC2 instances. A criti... |
| 21 | `auth-shared-responsibility-02` | authored | D | ambiguous | verified | verified | yes | A company uses Amazon RDS for PostgreSQL. It wants required databas... |
| 22 | `auth-shared-responsibility-03` | authored | B,D | verified | verified | verified | yes | A company builds an application with AWS Lambda functions that use ... |
| 23 | `auth-shared-responsibility-04` | authored | C | verified | verified | verified | no | A healthcare start-up must accept a Business Associate Addendum (BA... |
| 24 | `auth-shared-responsibility-05` | authored | A | verified | verified | verified | yes | A company runs workloads on Amazon EC2. Its auditor asks which cont... |
| 25 | `auth-shared-responsibility-06` | authored | B | verified | verified | verified | yes | A European company must keep its customer data stored within the Eu... |
| 26 | `auth-shared-responsibility-07` | authored | A,D | verified | verified | verified | no | Which tasks are the responsibility of AWS when a company stores dat... |
| 27 | `auth-shared-responsibility-08` | authored | C | verified | verified | verified | no | A team argues that its payment application is automatically complia... |
| 28 | `auth-shared-responsibility-09` | authored | D | verified | verified | verified | yes | Patch management is a shared control in the AWS shared responsibili... |
| 29 | `auth-shared-responsibility-10` | authored | C,E | verified | verified | verified | no | Which responsibilities remain with the customer no matter which AWS... |

Only two cells differ between the checkers: `q_341570b0e614` (Codex: ambiguous) and `auth-shared-responsibility-02` (Codex: ambiguous). The orchestrator's verdict: the first is a fair finding (D1); for the second the answer D is right and only its explanation needs more precision (E4).

## 3. Explanation and option-note fixes (no answer changes)

**E1. `q_341570b0e614`, option note D** (decision D1).
- Now: "The exam expects this to be AWS's side: AWS maintains the network infrastructure underneath the VPC, while the customer only configures its own VPC settings (subnets, route tables, security groups)."
- Problem: the AWS shared responsibility page does not mention Amazon VPC at all, so "the exam expects" has no support; and customers do create and configure their own VPC components, so option D is not a clear-cut AWS task. Found by Codex and noted by Haiku.
- Proposed: "AWS maintains the network infrastructure underneath Amazon VPC, but the customer creates and configures its own VPC components (subnets, route tables, security groups), so this option is not a clear-cut AWS task. Application data security (B) is the unambiguous customer responsibility."

**E2. `q_587ebd261839`, option note D.**
- Now: "Customers choose whether and how to encrypt their data, so encryption decisions are theirs."
- Problem: Amazon S3 now encrypts every new object with SSE-S3 by default and this cannot be switched off, so "whether" is not always the customer's choice. Source: https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html and https://aws.amazon.com/compliance/shared-responsibility-model/ ("customers are responsible for managing their data (including encryption options)"). Found by Codex.
- Proposed: "Customers decide which encryption options to use and how their keys are managed, so encryption decisions are theirs (some services, such as Amazon S3, already encrypt new data by default)."

**E3. `q_d185d25f405f`, explanation.**
- Now: "IAM access keys and secret keys are credentials the customer controls, so the customer must manage and rotate them. AWS does not rotate customer IAM user keys automatically."
- Problem: the IAM best practices page says to update long-term access keys when needed and to prefer temporary credentials; it does not say "must rotate". Source: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html. Found by Codex and Haiku.
- Proposed: "IAM access keys and secret keys are long-term credentials that the customer controls, so the customer manages them and updates them when needed (for example when an employee leaves); AWS recommends temporary credentials wherever possible. AWS does not rotate customer IAM user keys automatically."

**E4. `auth-shared-responsibility-02`, explanation and option note D.**
- Now (explanation): "AWS patches the operating system and engine of RDS instances, and the customer controls the timing by choosing the weekly maintenance window. Customers do not install patches on the RDS host themselves." Now (note D): "The preferred maintenance window defines when AWS applies required patches, so work happens in the company's quiet hours."
- Problem: the RDS page says the window is "an opportunity to control when modifications and software patching occur", but also that a mandatory upgrade can still be applied outside the window after its apply date. Source: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html. Found by Codex and Haiku. The answer D stays correct.
- Proposed (explanation): "AWS patches the operating system and engine of RDS instances, and the customer influences the timing by choosing the weekly maintenance window or by applying an available update at a chosen time; a mandatory update can still be applied outside the window once its apply date has passed. Customers do not install patches on the RDS host themselves."
- Proposed (note D): "The preferred maintenance window is when RDS starts scheduled maintenance, so routine patching can be kept to the company's quiet hours (a mandatory update can still be applied after its apply date)."

**E5. `auth-shared-responsibility-03`, explanation.**
- Now (part): "AWS operates and patches the servers, operating system, runtime and virtualization layer, and secures the data centers."
- Problem: Lambda applies runtime patches automatically only in the default Auto mode; in Function update or Manual mode the customer must update functions to get them. Source: https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html. Found by Codex and Haiku. The answer B, D stays correct.
- Proposed (part): "AWS operates and patches the servers, operating system and virtualization layer, and publishes runtime updates, which Lambda applies automatically in its default Auto mode (in Function update or Manual mode the customer must update functions to pick them up); AWS also secures the data centers."

## 4. English lesson fixes (to be mirrored in the Vietnamese lessons)

| id | Lesson | Now (quote) | Proposed | Evidence | Found by |
|---|---|---|---|---|---|
| L1 | 02-by-service-type, table row "Database or runtime software patching" | "AWS (Lambda managed runtimes)" | "AWS (Lambda managed runtimes; applied automatically in the default Auto mode)" | https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html | Codex |
| L2 | 02-by-service-type, RDS question and table cell; 06-patching-and-configuration, RDS row | "AWS, during the maintenance window the customer chooses" and "AWS, in a maintenance window you choose" | add "(a mandatory update can still be applied after its apply date; optional OS updates are applied only when you choose)" | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html | Codex, Haiku |
| L3 | 06-patching-and-configuration, Lambda row | "Runtime of a Lambda function with a managed runtime \| AWS" | "AWS publishes the patches and applies them automatically in Auto mode; Function update and Manual modes need customer action" | https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html | Codex |
| L4 | 03-responsibility-iam-ec2, root user | "no access keys for daily work" | "no access keys for the root user at all (AWS strongly recommends not creating them)" | https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html | Haiku |
| L5 | 03-responsibility-iam-ec2, exam tip | "data protection and classification is the safest customer answer" | "data protection and classification is usually the safest customer answer, but check every option against the task and the service" | exam-technique advice, not an AWS fact (the CLF-C02 exam guide allows several correct responses) | Codex |
| L6 | 05-control-types, physical controls | "only approved AWS staff can enter AWS data centers" | "only people AWS has approved can enter AWS data centers (approved employees; third parties only when an approved AWS employee requests it, and visitors are identified and escorted)" | https://aws.amazon.com/trust-center/data-center/our-controls/ | Codex |
| L7 | 07-compliance-resources, data residency | "AWS does not move content out of them without your agreement" | "AWS does not move or replicate your content outside your chosen Regions, except as needed to provide services you started or to comply with the law or a binding government order" | https://aws.amazon.com/compliance/data-privacy-faq/ | Codex |
| L8 | 08-acceptable-use-and-pen-testing: (a) "without prior approval"; (b) "extra limits, such as outbound testing from API Gateway"; (c) abuse report | (a) add "(security testing that includes Command and Control, and simulated events such as DDoS or phishing tests, still need AWS approval or the simulated-events process)"; (b) "outbound penetration testing from Amazon API Gateway is prohibited" (the AWS page lists API Gateway under both permitted services and prohibited-for-outbound-testing; keep the prohibition); (c) limit the abuse-report sentence to reports about your security testing | https://aws.amazon.com/security/penetration-testing/ | Codex, Haiku |

Rejected findings (no change proposed):
- **R1** (Codex): "Training your own staff is never AWS's job; AWS trains only AWS employees" (05-control-types). The AWS shared responsibility page says "AWS trains AWS employees, but a customer must train their own employees", so the lesson matches AWS. AWS also offers a free Cybersecurity Awareness Training to outside organisations (https://aws.amazon.com/security/amazon-security-initiatives/), which is a courtesy, not a shared responsibility. Optional: add one sentence about it.
- **R2** (Haiku): "the security group firewall on each instance, and IAM permissions" is "inaccurate" (03-responsibility-iam-ec2). The IAM user guide says responsibility in the cloud depends on the service and covers IAM configuration (https://docs.aws.amazon.com/IAM/latest/UserGuide/security.html); IAM permissions are a customer task. False positive.

## 5. What was not changed

All 29 answer keys, all question texts and options, and all other lesson sentences stay as they are.

## 6. Decisions (taken by the user on 2026-11-11)

- **D1 (decided: keep key B and use the reworded note E1).** `q_341570b0e614` ("Which option is a customer responsibility...", key B). Option D, "Maintenance of VPC components", is arguably also a customer task. Choose: (a) keep key B and use the reworded note E1 (recommended: no data change), or (b) leave the question as it is and only drop the "the exam expects" claim from the note.
- **D2 (decided: approve all as one batch).** Wording fixes E2 to E5 and L1 to L8: approve all as one batch, or tell me which to drop. English first, the Vietnamese lesson text mirrored in the same task, and the user reads the Vietnamese wording.
- **D3 (decided: leave the lesson unchanged).** R1: add the optional one-sentence note about the free awareness training, or leave the lesson unchanged (recommended).
