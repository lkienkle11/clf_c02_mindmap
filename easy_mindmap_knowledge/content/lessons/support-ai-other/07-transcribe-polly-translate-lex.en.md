---
id: support-ai-other-transcribe-polly-translate-lex
title: "Amazon Transcribe, Polly, Translate and Lex: speech, language and chatbots"
required: true
videoQuery: Amazon Transcribe Polly Translate Lex explained speech to text text to speech chatbot AWS
---
## Language services in one view

Four ready-made AI services handle human language. Think of a conversation: **Transcribe** listens, **Translate** converts between languages, **Polly** speaks, and **Lex** holds the conversation. Like the other pre-trained services, each is a pay-as-you-go API with no model to build or host.

## Amazon Transcribe: speech to text

**Amazon Transcribe** is an automatic speech recognition service that converts **audio to text**. You can transcribe files stored in Amazon S3 (**batch**) or live audio (**streaming**). Options include custom vocabulary, filtering sensitive or unwanted words, handling multi-channel audio and separating the speech of different speakers. Pricing is based on seconds of audio transcribed.

Typical uses: meeting notes, subtitles for videos, and transcripts of customer calls. A scenario with the words "speech-to-text" or "call recordings" points here.

## Amazon Polly: text to speech

**Amazon Polly** converts **text into lifelike speech** in many languages and voices. Its voice types include standard, neural, long-form and generative. You pay for the amount of text you synthesize, and you can cache and replay the audio at no extra charge. It suits accessibility apps for visually impaired users, newsreaders, e-learning and games.

Polly and Transcribe are opposites: Polly's input is text and its output is audio; Transcribe is the reverse.

## Amazon Translate: language to language

**Amazon Translate** translates **text** between languages using machine learning. Use it for multilingual websites, chat and support messages, or for processing content that arrives in many languages. It combines naturally with the others: Transcribe makes subtitles that Translate converts, Polly can speak the translated text, and Comprehend can analyze the result.

## Amazon Lex: chatbots

**Amazon Lex** builds **conversational interfaces** for voice and text. AWS says it is powered by the same technology as **Alexa**. Lex combines automatic speech recognition with natural language understanding: it converts speech to text, works out the user's **intent**, and then triggers the right action, often through AWS Lambda. You create a bot from a few example phrases, publish it to a website, mobile app or messaging platform, and pay only for the text or speech requests it handles.

Lex works inside a contact center. **Amazon Connect**, a cloud contact center for voice and chat, integrates with Lex, so a bot can serve callers and chat users in a contact center. AWS has renamed Amazon Connect to **Amazon Connect Customer**, but exam wording still says Amazon Connect. Choose Connect when the question describes the whole contact center, and Lex when it asks for the chatbot.

## Decision table

| Scenario | Service |
| --- | --- |
| Turn recorded meetings or calls into text | Amazon Transcribe |
| Read an article aloud in a natural voice | Amazon Polly |
| Show a website in another language | Amazon Translate |
| Add a conversational chatbot to a site or app | Amazon Lex |
| Run a call center with voice and chat agents | Amazon Connect |
| Find customer sentiment in the transcripts | Amazon Comprehend |

A common chain is: call recording, then **Transcribe**, then **Comprehend** for sentiment, which is why a two-answer question about this pipeline asks for those two services.

## One look-alike that is not AI

**Amazon Elastic Transcoder** converted video and audio files to formats that play on phones. It appears in older questions, where a request to convert media files so they play on smartphones is keyed to it. AWS lists it as shut down on November 13, 2025 and recommends AWS Elemental MediaConvert. It never did speech work, so do not confuse it with Transcribe.

## Exam traps

- **Polly** speaks, **Transcribe** listens. Do not swap them.
- **Lex** does not translate or synthesize voices by itself; it holds the dialog.
- **Translate** handles text; spoken subtitles need Transcribe plus Translate.

## Key points

- Transcribe: audio to text. Polly: text to audio. Translate: text between languages. Lex: chatbots.
- Lex uses the same technology as Alexa and plugs into Amazon Connect.
- Amazon Connect is the contact center; Connect Customer is its new name.
- Elastic Transcoder is a retired media converter, not an AI service.

## Sources

- [What is Amazon Transcribe?](https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html)
- [What is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)
- [Amazon Lex](https://aws.amazon.com/lex/)
