---
id: shared-responsibility-acceptable-use-and-pen-testing
title: "Acceptable use, penetration testing and reporting abuse"
required: false
videoQuery: AWS acceptable use policy penetration testing policy without approval DDoS simulation
---
## Rules that come with the responsibility

Being responsible for security **in** the cloud includes following the rules AWS sets for using its services. Three topics matter: the Acceptable Use Policy, the penetration testing policy and abuse reporting.

## AWS Acceptable Use Policy

The **AWS Acceptable Use Policy** forbids using AWS services for, among other things:

- criminal or deceptive schemes;
- infringing the rights of others;
- threatening or encouraging violence or serious harm;
- sexual exploitation or abuse of children;
- compromising the security, integrity or availability of any user, system or network;
- sending unsolicited bulk email (spam).

AWS may investigate suspected violations and remove or disable offending content or resources, and expects you to cooperate in fixing them.

## Penetration testing

You may test the security of **your own** resources. For the services on AWS's permitted list, AWS allows testing **without prior approval** (security testing that includes Command and Control, and simulated events such as DDoS or phishing tests, still need AWS approval or the simulated-events process). The list includes, for example, Amazon EC2, Amazon RDS, Amazon Aurora, Amazon CloudFront, AWS Lambda, AWS Elastic Beanstalk and AWS Fargate. The list changes over time, so check the current page. Some services have extra limits: outbound penetration testing from Amazon API Gateway is prohibited (the AWS page lists API Gateway under both permitted services and prohibited-for-outbound-testing, so check the current page).

Activities AWS lists as **prohibited**:

- Denial of Service (**DoS**) and Distributed DoS (**DDoS**) attacks.
- Simulated DoS or DDoS, except through the DDoS Simulation Testing policy.
- Port flooding, protocol flooding and request flooding (for example login or API floods).
- DNS zone walking, hijacking or pharming through Amazon Route 53.
- S3 bucket takeover and subdomain takeover.

Other simulated events, such as red, blue or purple team exercises, simulated phishing or malware testing, require submitting a **Simulated Events form** through the AWS Support console at least two weeks before the start date. Network stress testing follows its own policy.

If you find a security issue in an AWS service during testing, contact AWS Security (aws-security@amazon.com) immediately. Vulnerabilities caused directly by AWS tools or services must be reported to AWS Security within 24 hours of completing the testing.

### Exam angle

- Customers may pen test permitted services **without prior approval** (Command and Control testing and simulated events are the exceptions).
- Attacks that overload a target (DoS/DDoS) are prohibited, and DDoS simulation needs the proper process.
- Testing is of **your** resources; you may not attack AWS infrastructure or other customers.

## Reporting abuse

If you believe someone is using AWS resources for abuse (spam, malware hosting, attacks), report it through the **AWS abuse reporting process** linked from the policy page. If AWS receives an abuse report about activities related to your security testing, it forwards the report to you and expects approved language describing your use case and a contact.

## Compliance evidence

For AWS audit reports and agreements, use **AWS Artifact**; it is covered in the compliance lesson.

## Key points

- The Acceptable Use Policy forbids illegal, harmful, spam and security-compromising use.
- Permitted services can be pen tested without prior approval; DoS and DDoS are prohibited.
- Simulated events and DDoS simulation follow their own process, with advance notice.
- Report abuse through the AWS abuse process; report vulnerabilities in AWS services to AWS Security.

## Sources

- [Penetration testing](https://aws.amazon.com/security/penetration-testing/)
- [AWS Acceptable Use Policy](https://aws.amazon.com/aup/)
