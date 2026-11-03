---
id: support-ai-other-ai-ml
title: "Dịch vụ AI và học máy: SageMaker AI, Bedrock, Amazon Q và các dịch vụ AI dùng sẵn"
required: true
---
## Ba tầng AI của AWS

Hãy xếp các dịch vụ AI theo mức bạn phải tự xây dựng:

- **Tự xây mô hình: Amazon SageMaker AI.** Dịch vụ học máy (ML) được quản lý để **xây dựng, huấn luyện và triển khai** mô hình ML của riêng bạn mà không phải quản lý máy chủ. Dịch vụ này tên là Amazon SageMaker cho đến tháng 12 năm 2024; tên **Amazon SageMaker** nay chỉ một nền tảng rộng hơn cho dữ liệu, phân tích và AI, bao gồm cả SageMaker AI.
- **Dùng foundation model: Amazon Bedrock.** Dịch vụ được quản lý hoàn toàn, cho truy cập qua API tới các **foundation model (mô hình nền tảng)** của nhiều công ty AI, để xây ứng dụng **AI tạo sinh (generative AI)** mà không phải huấn luyện mô hình từ đầu. Bạn có thể tùy chỉnh mô hình, kết nối chúng với tài liệu của mình qua **knowledge base**, và thêm **Amazon Bedrock Guardrails** để lọc nội dung có hại và bảo vệ thông tin nhạy cảm.
- **Gọi một dịch vụ AI dùng sẵn.** Các dịch vụ đã được huấn luyện sẵn, giải quyết một việc qua API.

## Các dịch vụ AI dùng sẵn

| Tình huống | Dịch vụ |
| --- | --- |
| Tìm vật thể, khuôn mặt hoặc nội dung không an toàn trong ảnh và video | Amazon Rekognition |
| Tìm cảm xúc (sentiment), cụm từ khóa, thực thể hoặc PII trong văn bản | Amazon Comprehend |
| Xây chatbot bằng giọng nói hoặc văn bản | Amazon Lex |
| Chuyển văn bản thành giọng nói tự nhiên | Amazon Polly |
| Chuyển giọng nói thành văn bản, như bản ghi cuộc gọi | Amazon Transcribe |
| Dịch văn bản giữa các ngôn ngữ | Amazon Translate |
| Trích xuất chữ, biểu mẫu và bảng từ tài liệu scan | Amazon Textract |

Mẹo nhớ: **Polly** nói, **Transcribe** nghe, **Comprehend** hiểu văn bản, **Textract** đọc tài liệu.

## Amazon Q và các thay đổi trạng thái

- **Amazon Q** là họ trợ lý AI tạo sinh của AWS. **Amazon Q Developer** trả lời câu hỏi về AWS và tài nguyên của bạn, và giúp viết code; các plugin IDE của nó ngừng được hỗ trợ từ ngày 30 tháng 4 năm 2027, và AWS giới thiệu Kiro để thay thế. **Amazon Q Business** không còn nhận khách hàng mới; AWS khuyên dùng **Amazon Quick**.
- **Amazon Kendra** (tìm kiếm thông minh cho doanh nghiệp) ngừng nhận khách hàng mới từ ngày 30 tháng 7 năm 2026; khách hàng hiện có vẫn dùng tiếp, và AWS hướng các dự án mới sang knowledge base của Bedrock. Câu hỏi cũ có thể vẫn lấy "Kendra" làm đáp án cho việc tìm kiếm tài liệu công ty.
- Một vài tính năng riêng lẻ, như topic modeling của Comprehend, đã ngừng nhận khách hàng mới; các dịch vụ trong bảng vẫn hoạt động.

## Trách nhiệm

Mô hình trách nhiệm chia sẻ vẫn áp dụng: AWS bảo vệ hạ tầng, còn bạn vẫn chịu trách nhiệm về dữ liệu, cấu hình quyền truy cập và các yêu cầu pháp lý. Guardrails giúp bạn áp dụng quy tắc an toàn của riêng mình.

## Bẫy thường gặp

- "Huấn luyện mô hình tùy chỉnh trên dữ liệu của chúng tôi" là **SageMaker AI**; "tạo văn bản bằng foundation model" là **Bedrock**.
- **Transcribe** và **Polly** ngược nhau; **Textract** trích xuất chữ từ tài liệu, còn **Comprehend** phân tích văn bản bạn đã có.
- **Lex** xây chatbot; tự nó không dịch hay đọc thành tiếng.

## Ý chính

- SageMaker AI = mô hình của riêng bạn; Bedrock = foundation model cho AI tạo sinh.
- Rekognition cho ảnh, Comprehend cho ý nghĩa văn bản, Lex cho chatbot, Polly cho giọng nói ra, Transcribe cho giọng nói vào, Translate cho ngôn ngữ, Textract cho tài liệu.
- Q Business và Kendra không còn nhận khách hàng mới.

## Nguồn

- [What is Amazon SageMaker AI?](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html)
- [What is Amazon Bedrock?](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)
- [Amazon Kendra availability change](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html)
