---
id: deploy-operate-operations
title: "Vận hành ở quy mô lớn: AWS Systems Manager và AWS Health Dashboard"
required: true
---
## AWS Systems Manager

**AWS Systems Manager** giúp bạn xem và vận hành các **node** (EC2 instance, máy chủ tại chỗ và máy ảo) ở quy mô lớn, từ một nơi. Nó cũng dùng được cho môi trường **hybrid**. Một node trở thành **managed node** khi **SSM Agent** được cài trên nó và kết nối được tới dịch vụ Systems Manager.

Các công cụ chính của nó:

| Công cụ | Chức năng |
| --- | --- |
| Session Manager | Mở phiên shell an toàn tới một node từ console hoặc CLI, không cần mở cổng inbound, không cần bastion host và không cần SSH key |
| Patch Manager | Quét các node để tìm bản vá còn thiếu và cài cập nhật hệ điều hành và ứng dụng theo lịch |
| Run Command | Chạy một lệnh hoặc script trên nhiều node cùng lúc mà không phải đăng nhập vào từng node |
| Automation | Chạy các runbook có sẵn hoặc tự viết cho việc bảo trì, triển khai và khắc phục |
| Parameter Store | Lưu dữ liệu cấu hình, như AMI ID và URL endpoint, để ứng dụng đọc khi chạy |

Với **Session Manager**, quyền truy cập được kiểm soát bằng **IAM policy**, và hoạt động trong phiên có thể được ghi log vào Amazon S3 hoặc CloudWatch Logs.

Theo mô hình trách nhiệm chia sẻ, vá hệ điều hành khách (guest OS) trên EC2 là việc của **khách hàng**; **Patch Manager** giúp bạn làm việc đó **ở quy mô lớn**.

## AWS Health Dashboard

AWS Health cho bạn biết về **các sự kiện ảnh hưởng tới dịch vụ AWS và tài nguyên của bạn**.

- Trang **service health** công khai hiển thị trạng thái các dịch vụ AWS ở mọi Region, không cần đăng nhập.
- Khi đăng nhập, phần **sức khỏe tài khoản của bạn (your account health)** hiển thị các sự kiện ảnh hưởng tới **tài khoản và tài nguyên của bạn**, như một sự cố ảnh hưởng tới EC2 instance của bạn hoặc một **thay đổi đã lên lịch (scheduled change)** sắp tới, như việc cho nghỉ hưu một instance hoặc một database engine hết hạn hỗ trợ.
- Dashboard này có cho mọi khách hàng mà không tính thêm phí, và các sự kiện AWS Health có thể được gửi tới **Amazon EventBridge** để kích hoạt tự động hóa.

## Vị trí so với các công cụ khác

- **CloudWatch** theo dõi metric của chính bạn; **AWS Health** báo các sự kiện phía AWS có thể ảnh hưởng tới bạn.
- **AWS Trusted Advisor** kiểm tra tài khoản của bạn để gợi ý cải thiện về chi phí, bảo mật, hiệu năng và khả năng chịu lỗi; nó được trình bày trong chủ đề về hỗ trợ.

## Bẫy thường gặp

- "Kết nối tới EC2 instance private mà không mở cổng 22 hay quản lý SSH key" chỉ tới **Session Manager**.
- "Cài bản vá bảo mật cho hàng trăm instance" chỉ tới **Patch Manager**.
- "Sự cố của AWS có ảnh hưởng tới tài nguyên của tôi không?" hoặc "bảo trì sắp tới trên instance của tôi" chỉ tới **AWS Health Dashboard**.
- Systems Manager quản lý những gì chạy **bên trong** instance; CloudFormation cấp phát chính các tài nguyên.

## Ý chính

- Systems Manager vận hành EC2 và node tại chỗ ở quy mô lớn thông qua SSM Agent.
- Session Manager = truy cập an toàn không cần SSH key hay mở cổng; Patch Manager = vá ở quy mô lớn.
- AWS Health Dashboard = sự kiện dịch vụ AWS và sự kiện riêng của tài khoản, kể cả thay đổi đã lên lịch.

## Nguồn

- [What is AWS Systems Manager?](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [What is AWS Health?](https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html)
