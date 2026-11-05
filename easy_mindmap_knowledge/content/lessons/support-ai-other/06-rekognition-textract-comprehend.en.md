---
id: support-ai-other-rekognition-textract-comprehend
title: "Amazon Rekognition, Textract and Comprehend: images, documents and text"
required: true
videoQuery: Amazon Rekognition vs Textract vs Comprehend explained AWS AI services
---
## Ready-made AI: no ML expertise needed

These three are **pre-trained AI services**. You call an API, send data, and receive results; you do not build or host a model. You pay for what you analyze, with no minimum fee or upfront commitment. The skill the exam tests is choosing by the **type of input**: pictures and video, scanned documents, or plain text.

## Amazon Rekognition: images and video

**Amazon Rekognition** adds computer vision to an application. It analyzes images and videos, for example files stored in Amazon S3, and can:

- detect **objects, scenes and concepts**, which makes a large photo or video library searchable;
- detect **faces**, compare them, and search for a match in a collection of faces you store, useful for identity verification and for cataloging people;
- detect **unsafe content** such as explicit or violent material (content moderation);
- detect **text** that appears in a picture, such as a sign;
- build **custom labels** for items specific to your business, such as your logo.

An exam scenario that says "identify people in video", "organize and search large numbers of images" or "filter inappropriate pictures" points to Rekognition. AWS has moved a few Rekognition features, such as streaming events and batch image content moderation, into maintenance, and Rekognition person pathing was shut down; the service itself remains available.

## Amazon Textract: documents

**Amazon Textract** goes beyond simple character recognition. It reads **typed and handwritten text** from scanned documents and PDFs, and it understands structure: it extracts **forms** (field names and their values) and **tables** (rows and cells). Specialized operations handle **invoices and receipts** and **ID documents**, and a Queries feature lets you ask for a specific value.

Typical scenario: an insurer scans thousands of claim forms a day and needs each field and table row in a database. That is Textract. The result is text and data, not meaning, so teams often send Textract output to Comprehend for analysis.

## Amazon Comprehend: text meaning

**Amazon Comprehend** uses **natural language processing (NLP)** on text you already have. Its built-in insights include:

- **sentiment**: positive, negative, neutral or mixed;
- **entities**: people, places and items mentioned;
- **key phrases** and the document's **dominant language**;
- **personally identifiable information (PII)** such as addresses or phone numbers.

With **Comprehend Custom** you train your own **classifier** to sort documents into your categories, or a recognizer for your own terms, without writing ML code. That is the answer when a library wants to classify e-books by content. Topic modeling, event detection and prompt safety classification entered maintenance on March 31, 2026, so AWS no longer offers them to new customers; the core insights above remain.

## Which service for which input?

| Input and goal | Service |
| --- | --- |
| Photo or video: objects, faces, unsafe content | Amazon Rekognition |
| Scanned form, invoice or table: extract fields and rows | Amazon Textract |
| Text you already have: sentiment, entities, key phrases, PII | Amazon Comprehend |
| Classify documents by their content | Amazon Comprehend (custom classification) |
| Audio recording: turn into text | Amazon Transcribe (next lesson) |

## Exam traps

- Rekognition can read text in a photo, but **Textract** is the choice for documents, forms and tables.
- Textract extracts; **Comprehend** interprets. Customer-review sentiment is Comprehend, even if the reviews first came from scans.
- A call recording needs **Amazon Transcribe** first; sentiment then comes from Comprehend.
- These services are pre-trained. "Build and train my own model" is **Amazon SageMaker AI**.

## Key points

- Rekognition: images and video. Textract: documents, forms and tables. Comprehend: meaning of text.
- Pick the service by the input type.
- Comprehend Custom classifies documents into your own categories.
- Pay-per-use pricing with no upfront cost; no ML skills required.

## Sources

- [What is Amazon Rekognition?](https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html)
- [What is Amazon Textract?](https://docs.aws.amazon.com/textract/latest/dg/what-is.html)
- [What is Amazon Comprehend?](https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html)
