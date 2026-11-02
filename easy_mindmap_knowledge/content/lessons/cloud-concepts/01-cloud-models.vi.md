---
id: cloud-concepts-models
title: Điện toán đám mây là gì: mô hình triển khai và mô hình dịch vụ
required: true
---
## Điện toán đám mây nghĩa là gì

AWS mô tả điện toán đám mây là việc dùng tài nguyên CNTT (máy chủ, lưu trữ, cơ sở dữ liệu và nhiều thứ khác) **theo nhu cầu, qua internet, với giá trả theo mức dùng (pay-as-you-go)**. Thay vì tự mua và vận hành máy chủ, bạn thuê năng lực từ nhà cung cấp và trả lại khi không cần nữa.

Câu định nghĩa trên gồm ba ý:

- **Theo nhu cầu (on demand)**: bạn yêu cầu tài nguyên trong vài phút, không phải vài tuần.
- **Qua internet**: bạn dùng tài nguyên qua console, dòng lệnh hoặc API.
- **Trả theo mức dùng**: bạn trả cho phần đã dùng, không trả cho phần "có thể sẽ cần".

## Mô hình triển khai: ứng dụng chạy ở đâu

| Mô hình | Chạy ở đâu | Lý do thường gặp |
| --- | --- | --- |
| Cloud | Mọi phần của ứng dụng chạy trên đám mây | Xây ứng dụng mới hoặc chuyển hẳn lên đám mây |
| Hybrid (lai) | Tài nguyên đám mây kết nối với tài nguyên nằm ngoài đám mây (thường là tại chỗ) | Mở rộng trung tâm dữ liệu hiện có, giữ lại một số hệ thống tại chỗ |
| On-premises (private cloud) | Trung tâm dữ liệu của chính bạn, thường dùng công cụ ảo hóa | Có tài nguyên riêng; nhận được ít lợi ích của đám mây |

Mẹo thi: nếu tình huống nói "một số workload phải ở lại trung tâm dữ liệu của chúng tôi, phần còn lại có thể chuyển lên AWS", đáp án là **hybrid**.

## Mô hình dịch vụ: bạn phải tự quản lý bao nhiêu

Các mô hình dịch vụ khác nhau ở chỗ ai quản lý phần nào:

- **IaaS (Infrastructure as a Service)**: các khối hạ tầng cơ bản như máy chủ ảo, mạng và lưu trữ. Bạn quản lý hệ điều hành và mọi thứ phía trên. Kiểm soát và linh hoạt nhiều nhất. Ví dụ: Amazon EC2.
- **PaaS (Platform as a Service)**: nhà cung cấp lo phần cứng, hệ điều hành, hoạch định năng lực và vá lỗi. Bạn tập trung triển khai và quản lý ứng dụng. Ví dụ: AWS Elastic Beanstalk.
- **SaaS (Software as a Service)**: phần mềm hoàn chỉnh do nhà cung cấp vận hành. Bạn chỉ quyết định cách sử dụng. Ví dụ: email trên web.

Cách nhớ đơn giản: đi từ IaaS sang PaaS rồi SaaS, **bạn quản lý ít dần, nhà cung cấp quản lý nhiều dần**.

## Ý chính

- Điện toán đám mây = tài nguyên CNTT theo nhu cầu, qua internet, trả theo mức dùng.
- Mô hình triển khai: cloud, hybrid, on-premises (private cloud).
- Hybrid kết nối tài nguyên đám mây với các hệ thống nằm ngoài đám mây.
- Mô hình dịch vụ: IaaS (kiểm soát nhiều nhất), PaaS (tập trung vào ứng dụng), SaaS (chỉ việc dùng phần mềm).

## Nguồn

- [What is cloud computing? (AWS)](https://aws.amazon.com/what-is-cloud-computing/)
- [Types of cloud computing (AWS)](https://aws.amazon.com/types-of-cloud-computing/)
- [Deployment models, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/types-of-cloud-computing.html)
