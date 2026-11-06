---
id: support-ai-other-sagemaker-kendra-personalize-forecast
title: "SageMaker AI, Personalize, Forecast, Kendra và OpenSearch Service: mô hình, dự đoán và tìm kiếm"
required: true
---
## Vượt ra ngoài các dịch vụ AI gọi một lần

Rekognition, Textract và Comprehend trả lời một loại câu hỏi qua API. Bài này nói về nhóm kế tiếp: một nền tảng cho mô hình **của riêng bạn**, hai dịch vụ dự đoán từ dữ liệu của bạn, và hai cách tìm kiếm. Nhiều dịch vụ trong số này đã thay đổi trạng thái, nên cách ra đề và hiện trạng của AWS đôi khi khác nhau.

## Amazon SageMaker AI: xây dựng, huấn luyện và triển khai mô hình của bạn

**Amazon SageMaker AI** là dịch vụ học máy (ML) được quản lý hoàn toàn. Nhà khoa học dữ liệu và lập trình viên dùng nó để **xây dựng, huấn luyện và triển khai** mô hình ML vào một môi trường được lưu trữ sẵn sàng cho production mà không phải tự vận hành máy chủ. Nó hỗ trợ các thuật toán có sẵn cũng như thuật toán và framework của riêng bạn.

Ngày **3 tháng 12 năm 2024**, Amazon SageMaker được đổi tên thành **Amazon SageMaker AI**. Đồng thời, AWS dùng tên **Amazon SageMaker** cho một nền tảng rộng hơn hợp nhất dữ liệu, phân tích và AI, trong đó có SageMaker AI. Danh sách dịch vụ trong phạm vi CLF-C02 ghi Amazon SageMaker AI, còn các câu hỏi cũ ghi "Amazon SageMaker"; cả hai đều chỉ dịch vụ xây dựng-huấn luyện-triển khai.

## Amazon Personalize: gợi ý cá nhân hóa

**Amazon Personalize** là dịch vụ được quản lý tạo **gợi ý cá nhân hóa** từ dữ liệu của bạn, chủ yếu là bản ghi cách người dùng tương tác với các mục, như lượt nhấp và mua hàng. Kết quả thường gặp là "gợi ý cho bạn", "khách xem mục này cũng xem", phân khúc người dùng cho chiến dịch và kết quả tìm kiếm được xếp hạng lại. Nó hỗ trợ yêu cầu thời gian thực và tác vụ batch, không có phí tối thiểu hay cam kết trả trước. Tình huống thi "gợi ý sản phẩm từ dữ liệu khách hàng" hướng tới dịch vụ này, không phải Comprehend hay Rekognition.

## Amazon Forecast: dự báo chuỗi thời gian (đã đóng với khách hàng mới)

**Amazon Forecast** dự đoán giá trị tương lai, như nhu cầu hoặc tồn kho, từ dữ liệu chuỗi thời gian trong quá khứ. AWS đã đóng nó với **khách hàng mới từ ngày 29 tháng 7 năm 2024**; khách hàng hiện có vẫn dùng được, và AWS khuyên dùng **Amazon SageMaker Canvas** cho dự báo chuỗi thời gian. Các câu hỏi cũ vẫn dùng Forecast làm đáp án "dịch vụ dự báo", thường là phương án sai đặt cạnh đáp án đúng.

## Amazon Kendra: tìm kiếm thông minh (chế độ bảo trì)

**Amazon Kendra** là dịch vụ tìm kiếm thông minh cho nội dung của công ty. Nó kết nối tới nhiều nguồn dữ liệu qua connector, lập chỉ mục nội dung và trả về các đoạn liên quan cho truy vấn ngôn ngữ tự nhiên từ một giao diện tìm kiếm duy nhất. AWS đưa Kendra vào chế độ bảo trì từ **ngày 30 tháng 6 năm 2026**, và nó đã đóng với khách hàng mới từ **ngày 30 tháng 7 năm 2026**; khách hàng hiện có vẫn được hỗ trợ. AWS hướng công việc mới sang **Amazon Bedrock Managed Knowledge Base**. Câu hỏi kiểu thi về "tìm kiếm tài liệu trong S3 bằng một giao diện tìm kiếm thông minh" có đáp án là Kendra, nên hãy chọn nó khi có mặt. Nếu một tình huống hiện tại liệt kê cả Kendra và Bedrock, hãy đọc các từ như "generative" hay "foundation model".

## Amazon OpenSearch Service: tìm kiếm và phân tích log

**Amazon OpenSearch Service** chạy các cụm **OpenSearch** được quản lý (và Elasticsearch đời cũ) cho **tìm kiếm, phân tích log, giám sát ứng dụng thời gian thực và phân tích clickstream**. AWS tạo cụm, thay thế các node hỏng và cho bạn mở rộng chỉ bằng một lệnh API. Bạn trả tiền theo giờ chạy instance và dung lượng lưu trữ gắn kèm. Nó nằm trong danh sách phân tích của CLF-C02. **Amazon CloudSearch**, dịch vụ tìm kiếm cũ hơn, ở chế độ bảo trì từ ngày 25 tháng 7 năm 2024, và AWS khuyên chuyển sang OpenSearch Service.

Kendra nhắm tới tìm kiếm ngôn ngữ tự nhiên trên tài liệu công ty; OpenSearch Service là engine tìm kiếm và phân tích đa dụng, cũng phục vụ log và dashboard.

## Gợi ý về AI tạo sinh

Để tóm tắt, soạn thảo hoặc trò chuyện với một **foundation model** mà không phải huấn luyện gì, hãy dùng **Amazon Bedrock**, đã trình bày trong bài về AI và học máy. Danh sách trong phạm vi ghi **Amazon Q** và SageMaker AI chứ không ghi Bedrock, nhưng các tình huống kiểu thi về foundation model có đáp án là Bedrock.

## Dịch vụ nào?

| Tình huống | Dịch vụ |
| --- | --- |
| Xây dựng, huấn luyện và triển khai mô hình ML tùy chỉnh | Amazon SageMaker AI |
| Gợi ý sản phẩm từ hành vi người dùng | Amazon Personalize |
| Dự báo nhu cầu từ chuỗi thời gian quá khứ | Amazon Forecast (đã đóng với khách mới) hoặc SageMaker Canvas |
| Tìm kiếm tài liệu công ty bằng một giao diện | Amazon Kendra |
| Phân tích log hoặc engine tìm kiếm được quản lý | Amazon OpenSearch Service |
| Tóm tắt văn bản bằng foundation model | Amazon Bedrock |

## Ý chính

- SageMaker AI (trước đây là Amazon SageMaker) xây dựng, huấn luyện và triển khai mô hình của riêng bạn.
- Personalize gợi ý; Forecast dự đoán chuỗi thời gian nhưng đã đóng với khách hàng mới.
- Kendra đã đóng với khách hàng mới từ ngày 30 tháng 7 năm 2026, nhưng câu hỏi thi vẫn chọn nó cho tìm kiếm tài liệu.
- OpenSearch Service lo tìm kiếm và phân tích log.

## Nguồn

- [What is Amazon SageMaker AI?](https://docs.aws.amazon.com/sagemaker/latest/dg/whatis.html)
- [What is Amazon Personalize?](https://docs.aws.amazon.com/personalize/latest/dg/what-is-personalize.html)
- [Amazon Kendra availability change](https://docs.aws.amazon.com/kendra/latest/dg/kendra-availability-change.html)
