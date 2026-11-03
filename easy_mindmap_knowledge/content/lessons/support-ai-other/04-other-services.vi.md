---
id: support-ai-other-other-services
title: "Các dịch vụ khác trong đề thi: tích hợp, phân tích, điện toán cho người dùng cuối và ứng dụng doanh nghiệp"
required: true
---
## Tích hợp ứng dụng: tách rời (decoupling)

Trong thiết kế **tách rời (decoupled, loosely coupled)**, các phần của ứng dụng giao tiếp qua một dịch vụ được quản lý thay vì gọi trực tiếp nhau. Nếu một phần chậm hoặc lỗi, các phần khác vẫn chạy, và mỗi phần mở rộng độc lập.

- **Amazon SQS**: **hàng đợi thông điệp (message queue)**. Bên gửi thêm thông điệp và bên xử lý **kéo (pull)** chúng về khi sẵn sàng, nên những đợt việc dồn dập được chờ thay vì bị mất.
- **Amazon SNS**: **publish/subscribe**. Một thông điệp gửi tới **topic** được **đẩy (push)** tới nhiều subscriber, như email, SMS, hàm Lambda hoặc hàng đợi SQS.
- **Amazon EventBridge**: một **event bus** định tuyến sự kiện từ dịch vụ AWS, ứng dụng của bạn và partner SaaS tới các đích theo **rule** (xem chủ đề triển khai và vận hành).
- **AWS Step Functions**: **điều phối (orchestrate)** các bước, như hàm Lambda, thành một **workflow** trực quan có thử lại (retry) và rẽ nhánh.

## Phân tích dữ liệu

- **Amazon Athena**: **truy vấn SQL trực tiếp trên dữ liệu trong Amazon S3**, serverless.
- **AWS Glue**: **tích hợp dữ liệu (ETL)** serverless; **Data Catalog** của nó lưu định nghĩa bảng mà Athena có thể dùng.
- **Amazon Kinesis**: thu thập và xử lý **dữ liệu streaming thời gian thực**, như clickstream. **Amazon Data Firehose**, trước đây là Kinesis Data Firehose, đưa luồng dữ liệu tới S3 và các đích khác.
- **Amazon EMR**: các framework **big data** được quản lý như Apache Spark và Hadoop.
- **Amazon Redshift**: **kho dữ liệu (data warehouse)** (xem chủ đề cơ sở dữ liệu). **Amazon OpenSearch Service**: tìm kiếm và phân tích log.
- **Amazon Quick**: dashboard và business intelligence với **Amazon Quick Sight**, phát triển từ **Amazon QuickSight**, tên mà các câu hỏi cũ dùng.

## Điện toán cho người dùng cuối

- **Amazon WorkSpaces**: **máy tính để bàn ảo (virtual desktop)** được quản lý.
- **Amazon WorkSpaces Applications**, trước đây là **Amazon AppStream 2.0** (tên dùng trong exam guide): **stream từng ứng dụng desktop**, kể cả tới trình duyệt web.
- **Amazon WorkSpaces Secure Browser**: truy cập an toàn qua trình duyệt tới website nội bộ và ứng dụng SaaS; ngừng nhận khách hàng mới từ ngày 29 tháng 10 năm 2026, khách hàng hiện có vẫn dùng tiếp.

## Dịch vụ doanh nghiệp, IoT và frontend

- **Amazon Connect**: **trung tâm liên lạc (contact center)** trên đám mây.
- **Amazon SES**: gửi **email marketing, thông báo và giao dịch**.
- **AWS IoT Core**: kết nối **thiết bị IoT** và chuyển thông điệp của chúng tới các dịch vụ AWS.
- **AWS Amplify**: xây dựng, triển khai và host **ứng dụng web và mobile**.

## Bảng từ khóa cho đề thi

| Từ khóa | Dịch vụ |
| --- | --- |
| "Đệm đơn hàng để backend chậm không bao giờ làm mất đơn nào" | Amazon SQS |
| "Gửi một cảnh báo tới email, SMS và nhiều hệ thống" | Amazon SNS |
| "Điều phối một quy trình nhiều bước có thử lại" | AWS Step Functions |
| "Truy vấn SQL tùy ý trên file log trong S3" | Amazon Athena |
| "Thu nhận clickstream thời gian thực" | Amazon Kinesis |
| "Máy tính để bàn ảo cho nhân viên làm việc từ xa" | Amazon WorkSpaces |
| "Tổng đài trên đám mây" | Amazon Connect |

## Bẫy thường gặp

- Bên xử lý SQS **kéo**; SNS **đẩy**.
- SES gửi email; SNS gửi thông báo tới nhiều loại endpoint.
- WorkSpaces cho **cả một desktop**; WorkSpaces Applications stream **từng ứng dụng**.

## Ý chính

- Tách rời bằng SQS, SNS, EventBridge và Step Functions.
- Athena truy vấn S3, Glue chuẩn bị dữ liệu, Kinesis xử lý streaming, EMR chạy big data, Quick Sight hiển thị dashboard.
- WorkSpaces = desktop, Connect = contact center, SES = email, IoT Core = thiết bị, Amplify = ứng dụng.

## Nguồn

- [AWS Certified Cloud Practitioner (CLF-C02) exam guide: Domain 3](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02-domain3.html)
- [What is Amazon WorkSpaces Applications?](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
- [What is Amazon Quick?](https://docs.aws.amazon.com/quick/latest/userguide/what-is.html)
