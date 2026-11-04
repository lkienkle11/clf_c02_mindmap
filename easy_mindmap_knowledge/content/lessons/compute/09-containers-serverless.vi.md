---
id: compute-containers-serverless
title: Container, serverless và các lựa chọn điện toán khác
required: true
---
## Không chỉ có máy chủ ảo

EC2 cho bạn nhiều quyền kiểm soát nhất, và cũng nhiều việc phải quản lý nhất. Các lựa chọn điện toán khác giảm bớt phần việc bạn phải quản lý.

## Container

**Container** đóng gói ứng dụng cùng mọi thứ nó cần để chạy, nên ứng dụng hoạt động giống nhau ở mọi nơi.

- **Amazon Elastic Container Service (Amazon ECS)**: dịch vụ điều phối container (container orchestration) được AWS quản lý hoàn toàn. Nó chạy và co giãn các container của bạn.
- **Amazon Elastic Kubernetes Service (Amazon EKS)**: **Kubernetes** được quản lý. AWS vận hành control plane của Kubernetes. Chọn EKS khi đội ngũ đã dùng Kubernetes.
- **AWS Fargate**: **công cụ tính toán serverless cho container**, dùng cùng ECS hoặc EKS. Bạn khai báo CPU và bộ nhớ cho mỗi task hoặc pod; bạn không phải chọn, vá lỗi hay co giãn EC2 instance.
- **Amazon Elastic Container Registry (Amazon ECR)**: kho lưu trữ được quản lý để lưu, quản lý và chia sẻ container image.

ECS và EKS trả lời câu hỏi "**ai điều phối** các container?". Fargate hoặc EC2 trả lời câu hỏi "**chúng chạy ở đâu**?". Với EC2 bạn giữ quyền kiểm soát máy chủ; với Fargate AWS quản lý chúng.

## Hàm serverless: AWS Lambda

**AWS Lambda** chạy mã của bạn mà không cần cấp phát hay quản lý máy chủ. Lambda **hướng sự kiện (event-driven)**: một hàm chạy khi có sự việc xảy ra, như một tệp được tải lên Amazon S3, một thông điệp vào hàng đợi hoặc một yêu cầu HTTP qua Amazon API Gateway. Lambda tự động co giãn, và bạn trả tiền theo số yêu cầu và thời gian tính toán đã dùng, **không mất phí khi không có mã nào chạy**. Một lần gọi hàm thông thường bị giới hạn 15 phút, nên các công việc chạy dài thường thuộc về nơi khác.

## Các dịch vụ điện toán khác, mỗi dịch vụ một dòng

- **AWS Elastic Beanstalk**: tải mã ứng dụng web lên; Beanstalk cấp phát instance, cân bằng tải, co giãn và giám sát sức khỏe. Bản thân Beanstalk không tính thêm phí.
- **Amazon Lightsail**: cách đơn giản nhất để bắt đầu, có máy chủ riêng ảo (virtual private server), cơ sở dữ liệu và nhiều thứ khác với **giá hằng tháng thấp và dễ dự đoán**.
- **AWS Batch**: dịch vụ được quản lý hoàn toàn để lập kế hoạch, lên lịch và chạy các công việc xử lý theo lô ở mọi quy mô trên EC2 (kể cả Spot) hoặc Fargate.

## Cách chọn

| Yêu cầu | Lựa chọn phù hợp |
| --- | --- |
| Toàn quyền kiểm soát hệ điều hành | Amazon EC2 |
| Chạy container mà không quản lý máy chủ | AWS Fargate cùng ECS hoặc EKS |
| Kubernetes trên AWS | Amazon EKS |
| Đoạn mã ngắn kích hoạt bởi sự kiện, chỉ trả tiền khi chạy | AWS Lambda |
| Triển khai ứng dụng web mà không phải thiết kế hạ tầng | AWS Elastic Beanstalk |
| Website đơn giản với giá cố định hằng tháng | Amazon Lightsail |

## Bẫy thường gặp

- Fargate **không phải** là công cụ điều phối; nó chạy container cho ECS hoặc EKS.
- ECR **lưu trữ** image; nó không chạy image.
- "Serverless" nghĩa là bạn không phải quản lý máy chủ, không phải là không có máy chủ nào.

## Ý chính

- ECS và EKS điều phối container; Fargate loại bỏ phần máy chủ bên dưới.
- Lambda hướng sự kiện và chỉ tính phí khi mã chạy.
- Beanstalk, Lightsail và Batch che bớt hạ tầng cho các trường hợp sử dụng phổ biến.

## Nguồn

- [What is Amazon Elastic Container Service?](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html)
- [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
