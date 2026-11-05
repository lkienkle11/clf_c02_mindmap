---
id: support-ai-other-rekognition-textract-comprehend
title: "Amazon Rekognition, Textract và Comprehend: hình ảnh, tài liệu và văn bản"
required: true
---
## AI dùng sẵn: không cần chuyên môn ML

Ba dịch vụ này là **dịch vụ AI đã huấn luyện sẵn**. Bạn gọi API, gửi dữ liệu và nhận kết quả; bạn không phải xây dựng hay lưu trữ mô hình. Bạn trả tiền theo lượng dữ liệu phân tích, không có phí tối thiểu hay cam kết trả trước. Kỹ năng mà đề thi kiểm tra là chọn theo **loại dữ liệu đầu vào**: hình ảnh và video, tài liệu quét, hay văn bản thuần.

## Amazon Rekognition: hình ảnh và video

**Amazon Rekognition** đưa thị giác máy tính vào ứng dụng. Nó phân tích hình ảnh và video, chẳng hạn các tệp lưu trong Amazon S3, và có thể:

- phát hiện **đối tượng, cảnh và khái niệm**, giúp tìm kiếm được một thư viện ảnh hoặc video lớn;
- phát hiện **khuôn mặt**, so sánh chúng và tìm khuôn mặt khớp trong bộ sưu tập bạn lưu, hữu ích cho xác minh danh tính và lập danh mục người;
- phát hiện **nội dung không an toàn** như nội dung khiêu dâm hoặc bạo lực (kiểm duyệt nội dung);
- phát hiện **văn bản** xuất hiện trong ảnh, chẳng hạn một tấm biển;
- tạo **custom label** cho những thứ riêng của doanh nghiệp, như logo của bạn.

Tình huống thi nói "nhận diện người trong video", "sắp xếp và tìm kiếm số lượng lớn hình ảnh" hoặc "lọc ảnh không phù hợp" hướng tới Rekognition. AWS đã đưa một vài tính năng của Rekognition, như streaming events và batch image content moderation, vào chế độ bảo trì, và tính năng person pathing đã bị ngừng; bản thân dịch vụ vẫn hoạt động.

## Amazon Textract: tài liệu

**Amazon Textract** đi xa hơn nhận dạng ký tự đơn giản. Nó đọc **văn bản đánh máy và viết tay** từ tài liệu quét và PDF, và hiểu cấu trúc: trích xuất **biểu mẫu (forms)** (tên trường và giá trị) và **bảng (tables)** (hàng và ô). Các thao tác chuyên biệt xử lý **hóa đơn, biên lai** và **giấy tờ tùy thân**, còn tính năng Queries cho phép bạn hỏi một giá trị cụ thể.

Tình huống điển hình: công ty bảo hiểm quét hàng nghìn phiếu yêu cầu bồi thường mỗi ngày và cần mỗi trường cùng từng hàng trong bảng đưa vào cơ sở dữ liệu. Đó là Textract. Kết quả là văn bản và dữ liệu, chưa phải ý nghĩa, nên các nhóm thường chuyển đầu ra của Textract sang Comprehend để phân tích.

## Amazon Comprehend: ý nghĩa của văn bản

**Amazon Comprehend** dùng **xử lý ngôn ngữ tự nhiên (NLP)** trên văn bản bạn đã có. Các phân tích có sẵn gồm:

- **sentiment (cảm xúc)**: tích cực, tiêu cực, trung tính hoặc hỗn hợp;
- **entities (thực thể)**: người, địa điểm và đồ vật được nhắc đến;
- **key phrases (cụm từ khóa)** và **ngôn ngữ chủ đạo** của tài liệu;
- **thông tin nhận dạng cá nhân (PII)** như địa chỉ hoặc số điện thoại.

Với **Comprehend Custom**, bạn huấn luyện **bộ phân loại** riêng để xếp tài liệu vào các danh mục của mình, hoặc bộ nhận dạng cho thuật ngữ riêng, mà không cần viết mã ML. Đó là đáp án khi một thư viện muốn phân loại sách điện tử theo nội dung. Topic modeling, event detection và prompt safety classification đã vào chế độ bảo trì từ ngày 31 tháng 3 năm 2026, nên AWS không còn cung cấp chúng cho khách hàng mới; các phân tích cốt lõi ở trên vẫn còn.

## Dịch vụ nào cho đầu vào nào?

| Đầu vào và mục tiêu | Dịch vụ |
| --- | --- |
| Ảnh hoặc video: đối tượng, khuôn mặt, nội dung không an toàn | Amazon Rekognition |
| Biểu mẫu, hóa đơn hoặc bảng quét: trích xuất trường và hàng | Amazon Textract |
| Văn bản đã có: sentiment, entities, key phrases, PII | Amazon Comprehend |
| Phân loại tài liệu theo nội dung | Amazon Comprehend (custom classification) |
| Bản ghi âm: chuyển thành văn bản | Amazon Transcribe (bài sau) |

## Bẫy khi thi

- Rekognition đọc được chữ trong ảnh, nhưng **Textract** mới là lựa chọn cho tài liệu, biểu mẫu và bảng.
- Textract trích xuất; **Comprehend** diễn giải. Cảm xúc trong đánh giá của khách hàng là Comprehend, dù đánh giá ban đầu đến từ bản quét.
- Bản ghi cuộc gọi cần **Amazon Transcribe** trước; sau đó cảm xúc do Comprehend phân tích.
- Các dịch vụ này đã được huấn luyện sẵn. "Xây dựng và huấn luyện mô hình của riêng tôi" là **Amazon SageMaker AI**.

## Ý chính

- Rekognition: hình ảnh và video. Textract: tài liệu, biểu mẫu và bảng. Comprehend: ý nghĩa của văn bản.
- Chọn dịch vụ theo loại đầu vào.
- Comprehend Custom phân loại tài liệu vào danh mục riêng của bạn.
- Trả tiền theo mức dùng, không trả trước; không cần kỹ năng ML.

## Nguồn

- [What is Amazon Rekognition?](https://docs.aws.amazon.com/rekognition/latest/dg/what-is.html)
- [What is Amazon Textract?](https://docs.aws.amazon.com/textract/latest/dg/what-is.html)
- [What is Amazon Comprehend?](https://docs.aws.amazon.com/comprehend/latest/dg/what-is.html)
