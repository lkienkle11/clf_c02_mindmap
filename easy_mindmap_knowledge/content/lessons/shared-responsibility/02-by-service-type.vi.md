---
id: shared-responsibility-by-service
title: "Ranh giới dịch chuyển ra sao: EC2, RDS, Lambda và S3"
required: true
---
## Quy tắc chung

**AWS quản lý càng nhiều thì bạn càng phải cấu hình ít, nhưng bạn không bao giờ giao lại dữ liệu hay quyền kiểm soát truy cập.** Có ba nhóm:

- **Dịch vụ hạ tầng** như **Amazon EC2** (IaaS): bạn nhận một máy chủ ảo và tự cấu hình gần như mọi thứ phía trên lớp ảo hóa.
- **Dịch vụ được quản lý** như **Amazon RDS**: AWS còn vận hành cả hệ điều hành và phần mềm cơ sở dữ liệu.
- **Dịch vụ trừu tượng hóa (abstracted)** như **AWS Lambda, Amazon S3 và Amazon DynamoDB**: AWS vận hành hạ tầng, hệ điều hành và nền tảng.

## Ai làm gì

| Công việc | Amazon EC2 | Amazon RDS | AWS Lambda / Amazon S3 |
| --- | --- | --- | --- |
| An ninh vật lý, phần cứng, host OS, hypervisor | AWS | AWS | AWS |
| Cài đặt và vá guest OS | Khách hàng | AWS | AWS |
| Vá phần mềm cơ sở dữ liệu hoặc runtime | Khách hàng (nếu tự cài) | AWS, trong maintenance window do khách hàng chọn | AWS (runtime được quản lý của Lambda) |
| Mã ứng dụng và thư viện của nó | Khách hàng | Khách hàng (schema, truy vấn) | Khách hàng (mã function, thư viện phụ thuộc) |
| Quy tắc truy cập mạng | Khách hàng (security group, NACL) | Khách hàng (security group của DB) | Khách hàng (bucket policy, quyền của function) |
| Lựa chọn mã hóa (khóa, tùy chọn bổ sung, mã hóa khi truyền) | Khách hàng | Khách hàng | Khách hàng (S3 và DynamoDB mặc định mã hóa khi lưu trữ) |
| Dữ liệu và quyền IAM | Khách hàng | Khách hàng | Khách hàng |

## Amazon EC2 chi tiết

EC2 gần giống tự chạy máy chủ của mình: bạn vá **hệ điều hành khách (guest OS)**, cập nhật ứng dụng, cấu hình **security group**, quản lý key pair và sao lưu EBS volume. AWS bảo vệ máy chủ vật lý, hypervisor và trung tâm dữ liệu.

## Amazon RDS chi tiết

AWS cài đặt và vá hệ điều hành và database engine, chạy sao lưu tự động và, với Multi-AZ, xử lý failover. **Bạn** chọn **maintenance window** hằng tuần để áp dụng các bản vá bắt buộc, kiểm soát truy cập mạng bằng security group, tạo người dùng cơ sở dữ liệu, quyết định có bật mã hóa khi lưu trữ hay không, và tối ưu truy vấn.

## AWS Lambda và Amazon S3 chi tiết

- **Lambda**: không có máy chủ nào để bạn vá. Với runtime được quản lý, Lambda mặc định tự áp dụng các bản cập nhật bảo mật cho runtime. Bạn sở hữu **mã function**, **các thư viện bạn đóng gói kèm**, **quyền IAM** của function và cấu hình của nó.
- **S3**: AWS vận hành hạ tầng lưu trữ. Bạn quyết định **ai được truy cập** bucket và object (policy, Block Public Access), các tùy chọn mã hóa bổ sung, versioning và lifecycle rule.

## Bẫy thường gặp

- "Ai vá guest OS trên EC2?" **Khách hàng**.
- "Ai vá database engine trên RDS?" **AWS**, trong maintenance window do **khách hàng** chọn.
- "Ai vá hệ điều hành bên dưới Lambda?" **AWS**.
- "Ai cấu hình security group của một RDS instance?" **Khách hàng**, dù RDS là dịch vụ được quản lý.

## Ý chính

- EC2: khách hàng lo guest OS, ứng dụng, quy tắc tường lửa và dữ liệu.
- RDS: AWS vá hệ điều hành và engine; khách hàng chọn maintenance window, kiểm soát truy cập và dữ liệu.
- Lambda và S3: AWS vận hành mọi thứ bên dưới mã và dữ liệu của bạn.
- Dữ liệu, IAM và lựa chọn mã hóa luôn là của khách hàng với mọi dịch vụ.

## Nguồn

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Maintaining a DB instance](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html)
- [Understanding how Lambda manages runtime version updates](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-update.html)
