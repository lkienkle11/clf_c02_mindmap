---
id: support-ai-other-amplify-and-device-farm
title: "AWS Amplify, AWS AppSync and AWS Device Farm: build, connect and test web and mobile apps"
required: false
videoQuery: AWS Amplify AppSync Device Farm explained web and mobile app development
---
## Optional: frontend web and mobile services

This lesson is optional. It covers three developer-facing services that help you build, connect and test web and mobile applications. The CLF-C02 in-scope list names only **AWS Amplify** in this category.

## AWS Amplify: build and host full-stack apps

**AWS Amplify** helps frontend web and mobile developers build and host **full-stack** applications. **Amplify Hosting** connects to a Git repository, builds your app on every push, and deploys it to the AWS global content delivery network with continuous deployment. It supports common frameworks, including React, Angular, Vue, Next.js and static site generators, and offers feature-branch environments and pull request previews. **Amplify Gen 2** lets you define the backend, such as data and authentication, in TypeScript code. You pay for what you use.

Clue: "quickly build and deploy a web or mobile app without managing servers".

## AWS AppSync: managed APIs (pointer)

**AWS AppSync** provides secure, serverless **GraphQL and Pub/Sub APIs** so applications can read from one or more data sources through a single endpoint and receive **real-time updates**. The deploy and operate topic teaches it. AWS describes Amplify as a way to build apps that use AppSync and other services. Do not pick AppSync when a question asks for desktop or application streaming; it is an API service.

## AWS Device Farm: test on real devices

**AWS Device Farm** is an app-testing service. You test Android, iOS and web apps on **real, physical phones and tablets** hosted by AWS. There are two ways to use it:

- **Remote access**: interact with a real device in your browser, or run Appium tests from your own computer against it.
- **Automated tests**: upload your app and tests, and run them in parallel on many devices in a managed environment; you receive a report with results, logs and screenshots.

Device Farm is available only in the US West (Oregon) Region. Clue: "test the app on many real phone models" rather than emulators.

## Older name

**AWS Mobile Hub**, an early mobile-backend service, reached end of support in October 2021; Amplify is the modern route.

## Which service?

| Need | Service |
| --- | --- |
| Build and host a full-stack web or mobile app | AWS Amplify |
| GraphQL API with real-time updates | AWS AppSync |
| Test an app on real phones and tablets | AWS Device Farm |
| Stream a desktop application to users | Amazon WorkSpaces Applications |

## Key points

- Amplify builds, deploys and hosts full-stack web and mobile apps.
- AppSync provides managed GraphQL and real-time APIs.
- Device Farm tests apps on real physical devices.

## Sources

- [Welcome to AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [What is AWS AppSync?](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- [What is AWS Device Farm?](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html)
