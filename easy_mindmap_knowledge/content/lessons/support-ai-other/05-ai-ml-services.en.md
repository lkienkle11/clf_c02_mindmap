---
id: support-ai-other-ai-ml
title: "AI and machine learning services: SageMaker AI, Bedrock, Amazon Q and the ready-made AI services"
required: true
videoQuery: AWS AI services Rekognition Comprehend Lex Polly Transcribe Translate Textract Bedrock SageMaker explained
---
## Three layers of AWS AI

Sort AI services by how much you build yourself:

- **Build your own models: Amazon SageMaker AI.** A managed ML service to **build, train and deploy** your own ML models without managing servers. It was called Amazon SageMaker until December 2024; **Amazon SageMaker** now names a wider data, analytics and AI platform that includes SageMaker AI.
- **Use foundation models: Amazon Bedrock.** A fully managed service with API access to **foundation models** from many AI companies, for building **generative AI** applications without training a model from scratch. You can customize models, connect them to your documents with **knowledge bases**, and add **Amazon Bedrock Guardrails** to filter harmful content and protect sensitive information.
- **Call a ready-made AI service.** Pre-trained services that solve one task through an API.

## Ready-made AI services

| Scenario | Service |
| --- | --- |
| Find objects, faces or unsafe content in images and video | Amazon Rekognition |
| Find sentiment, key phrases, entities or PII in text | Amazon Comprehend |
| Build a voice or text chatbot | Amazon Lex |
| Turn text into lifelike speech | Amazon Polly |
| Turn speech into text, such as call recordings | Amazon Transcribe |
| Translate text between languages | Amazon Translate |
| Extract text, forms and tables from scanned documents | Amazon Textract |

Memory aid: **Polly** speaks, **Transcribe** listens, **Comprehend** understands text, **Textract** reads documents.

## Amazon Q and status changes

- **Amazon Q** is AWS's family of generative AI assistants. **Amazon Q Developer** answers questions about AWS and your resources and helps write code; its IDE plugins lose support on April 30, 2027, and AWS points to Kiro instead. **Amazon Q Business** is no longer open to new customers; AWS recommends **Amazon Quick**.
- **Amazon Kendra** (intelligent enterprise search) closed to new customers on July 30, 2026; existing customers keep using it, and AWS points new projects to Bedrock knowledge bases. Older questions may still answer "Kendra" for searching company documents.
- A few single features, such as Comprehend topic modeling, closed to new customers; the services in the table remain available.

## Responsibility

The shared responsibility model still applies: AWS protects the infrastructure, and you stay responsible for your data, access settings and legal requirements. Guardrails help you apply your own safety rules.

## Common traps

- "Train a custom model on our data" points to **SageMaker AI**; "generate text with a foundation model" points to **Bedrock**.
- **Transcribe** and **Polly** are opposites; **Textract** extracts text from documents, while **Comprehend** analyzes text you already have.
- **Lex** builds chatbots; it does not translate or speak by itself.

## Key points

- SageMaker AI = your own models; Bedrock = foundation models for generative AI.
- Rekognition images, Comprehend text meaning, Lex chatbots, Polly speech out, Transcribe speech in, Translate languages, Textract documents.
- Q Business and Kendra are closed to new customers.

## Sources

- [What is Amazon SageMaker AI?](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html)
- [What is Amazon Bedrock?](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
- [Amazon Kendra availability change](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html)
