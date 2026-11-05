---
id: support-ai-other-transcribe-polly-translate-lex
title: "Amazon Transcribe, Polly, Translate và Lex: giọng nói, ngôn ngữ và chatbot"
required: true
---
## Các dịch vụ ngôn ngữ trong một cái nhìn

Bốn dịch vụ AI dùng sẵn xử lý ngôn ngữ của con người. Hãy hình dung một cuộc hội thoại: **Transcribe** lắng nghe, **Translate** chuyển đổi giữa các ngôn ngữ, **Polly** nói, còn **Lex** dẫn dắt cuộc trò chuyện. Giống các dịch vụ huấn luyện sẵn khác, mỗi dịch vụ là một API trả tiền theo mức dùng, không có mô hình nào để bạn xây dựng hay lưu trữ.

## Amazon Transcribe: giọng nói thành văn bản

**Amazon Transcribe** là dịch vụ nhận dạng giọng nói tự động, chuyển **âm thanh thành văn bản**. Bạn có thể phiên âm tệp lưu trong Amazon S3 (**batch**) hoặc âm thanh trực tiếp (**streaming**). Các tùy chọn gồm từ vựng tùy chỉnh, lọc từ nhạy cảm hoặc không phù hợp, xử lý âm thanh nhiều kênh và tách lời của từng người nói. Giá tính theo số giây âm thanh được phiên âm.

Ứng dụng điển hình: ghi chú cuộc họp, phụ đề cho video và bản ghi lời các cuộc gọi của khách hàng. Tình huống có cụm "speech-to-text" hoặc "bản ghi cuộc gọi" hướng tới dịch vụ này.

## Amazon Polly: văn bản thành giọng nói

**Amazon Polly** chuyển **văn bản thành giọng nói tự nhiên** với nhiều ngôn ngữ và giọng đọc. Các loại giọng gồm standard, neural, long-form và generative. Bạn trả tiền theo lượng văn bản được tổng hợp, và có thể lưu đệm rồi phát lại âm thanh mà không tốn thêm phí. Polly phù hợp với ứng dụng hỗ trợ tiếp cận cho người khiếm thị, ứng dụng đọc tin, e-learning và trò chơi.

Polly và Transcribe là hai chiều ngược nhau: đầu vào của Polly là văn bản và đầu ra là âm thanh; Transcribe thì ngược lại.

## Amazon Translate: từ ngôn ngữ này sang ngôn ngữ khác

**Amazon Translate** dịch **văn bản** giữa các ngôn ngữ bằng học máy. Dùng nó cho website đa ngôn ngữ, tin nhắn chat và hỗ trợ, hoặc để xử lý nội dung đến bằng nhiều ngôn ngữ. Nó kết hợp tự nhiên với các dịch vụ khác: Transcribe tạo phụ đề để Translate chuyển ngữ, Polly có thể đọc văn bản đã dịch, và Comprehend có thể phân tích kết quả.

## Amazon Lex: chatbot

**Amazon Lex** xây dựng **giao diện hội thoại** bằng giọng nói và văn bản. AWS nói nó chạy trên cùng công nghệ với **Alexa**. Lex kết hợp nhận dạng giọng nói tự động với hiểu ngôn ngữ tự nhiên: chuyển giọng nói thành văn bản, xác định **ý định (intent)** của người dùng, rồi kích hoạt hành động phù hợp, thường qua AWS Lambda. Bạn tạo bot từ vài câu mẫu, xuất bản lên website, ứng dụng di động hoặc nền tảng nhắn tin, và chỉ trả tiền cho các yêu cầu văn bản hoặc giọng nói mà bot xử lý.

Lex hoạt động trong trung tâm liên lạc. **Amazon Connect**, trung tâm liên lạc đám mây cho thoại và chat, tích hợp với Lex, nên một bot có thể phục vụ người gọi và người chat trong trung tâm liên lạc. AWS đã đổi tên Amazon Connect thành **Amazon Connect Customer**, nhưng đề thi vẫn ghi Amazon Connect. Chọn Connect khi câu hỏi mô tả cả trung tâm liên lạc, và Lex khi câu hỏi cần chatbot.

## Bảng quyết định

| Tình huống | Dịch vụ |
| --- | --- |
| Biến cuộc họp hoặc cuộc gọi đã ghi âm thành văn bản | Amazon Transcribe |
| Đọc to một bài viết bằng giọng tự nhiên | Amazon Polly |
| Hiển thị website bằng ngôn ngữ khác | Amazon Translate |
| Thêm chatbot hội thoại vào website hoặc ứng dụng | Amazon Lex |
| Vận hành tổng đài có agent thoại và chat | Amazon Connect |
| Tìm cảm xúc của khách hàng trong bản ghi lời | Amazon Comprehend |

Một chuỗi phổ biến: bản ghi cuộc gọi, rồi **Transcribe**, rồi **Comprehend** để lấy cảm xúc; vì thế câu hỏi chọn hai đáp án cho quy trình này yêu cầu đúng hai dịch vụ đó.

## Một dịch vụ trông giống nhưng không phải AI

**Amazon Elastic Transcoder** từng chuyển đổi tệp video và âm thanh sang các định dạng dành cho những thiết bị bạn muốn hỗ trợ. Nó xuất hiện trong các câu hỏi cũ, nơi yêu cầu chuyển tệp media cho nhiều loại thiết bị có đáp án là nó. AWS liệt kê nó đã ngừng hoạt động từ ngày 13 tháng 11 năm 2025 và khuyên dùng AWS Elemental MediaConvert. Nó chưa bao giờ xử lý giọng nói, nên đừng nhầm với Transcribe.

## Bẫy khi thi

- **Polly** nói, **Transcribe** nghe. Đừng đổi chỗ chúng.
- **Lex** không tự dịch hay tổng hợp giọng nói; nó điều khiển hội thoại.
- **Translate** xử lý văn bản; phụ đề từ giọng nói cần Transcribe cộng Translate.

## Ý chính

- Transcribe: âm thanh thành văn bản. Polly: văn bản thành âm thanh. Translate: văn bản giữa các ngôn ngữ. Lex: chatbot.
- Lex dùng cùng công nghệ với Alexa và kết nối với Amazon Connect.
- Amazon Connect là trung tâm liên lạc; Connect Customer là tên mới của nó.
- Elastic Transcoder là công cụ chuyển đổi media đã ngừng, không phải dịch vụ AI.

## Nguồn

- [What is Amazon Transcribe?](https://docs.aws.amazon.com/transcribe/latest/dg/what-is.html)
- [What is Amazon Polly?](https://docs.aws.amazon.com/polly/latest/dg/what-is.html)
- [Amazon Lex](https://aws.amazon.com/lex/)
