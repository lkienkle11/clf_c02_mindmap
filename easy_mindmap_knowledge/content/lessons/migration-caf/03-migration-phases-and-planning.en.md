---
id: migration-caf-phases
title: "Migration phases and planning tools: assess, mobilize, migrate"
required: true
videoQuery: AWS migration phases assess mobilize migrate explained
---
## Three phases

AWS guidance splits a large migration into three iterative phases. The last one is often called **migrate and modernize**.

1. **Assess**: understand the current state and build the case. A **Migration Readiness Assessment** uses the six CAF perspectives to show strengths, gaps and an action plan, and a first discovery gives a high-level **total cost of ownership (TCO)** and **business case**.
2. **Mobilize**: build the foundation. Teams run detailed portfolio discovery, choose a strategy (one of the 7 Rs) for each application, set up a secure, scalable **landing zone** (the foundational multi-account AWS environment), define security and operations practices, train people, and migrate a **small first set of applications** to gain experience.
3. **Migrate and modernize**: use the patterns and tools proven in mobilize to move applications **at scale**, often in waves, and then optimize or modernize them once they run on AWS.

## Tools for the assess and mobilize work

- **Migration Evaluator**: a complimentary service that builds a data-driven **business case** by collecting your on-premises inventory and utilization and projecting AWS costs (see the pricing topic).
- **AWS Transform**: AWS's agentic AI service for migration and modernization. For migrations it covers **discovery and assessment**, application dependency mapping and **wave planning**, and it is the service AWS now recommends for new discovery projects.
- **AWS Application Discovery Service**: collects configuration, utilization and network dependency data about on-premises servers, with an agentless collector or an agent. It has been **closed to new customers since November 7, 2025**; existing customers can keep using it, and AWS points new customers to AWS Transform.
- **AWS Migration Hub**: one place to discover servers, group them into applications and **track migration status** across tools. It is also **no longer open to new customers since November 7, 2025**, with AWS Transform suggested instead.

Exam questions written before late 2025 may still give Application Discovery Service or Migration Hub as answers. Recognize what they do: **discover** servers (Discovery Service) and **track** migrations (Migration Hub).

## Common traps

- "Build a business case / TCO for migrating" points to **Migration Evaluator**.
- "Find on-premises servers and their dependencies" is **discovery** (Application Discovery Service in older questions, AWS Transform today).
- "One dashboard to track the progress of migrations" is **Migration Hub** in older questions.
- The Migration Readiness Assessment is built on the **CAF** perspectives.

## Key points

- Phases: assess, mobilize, migrate and modernize.
- Mobilize builds the landing zone and migrates a first small set of applications.
- Migration Evaluator = business case; AWS Transform = discovery, planning and modernization.
- Application Discovery Service and Migration Hub are closed to new customers.

## Sources

- [Overview, AWS Prescriptive Guidance strategy for migration](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-migration/overview.html)
- [AWS Application Discovery Service availability change](https://docs.aws.amazon.com/application-discovery/latest/userguide/application-discovery-service-availability-change.html)
- [What is AWS Migration Hub?](https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html)
