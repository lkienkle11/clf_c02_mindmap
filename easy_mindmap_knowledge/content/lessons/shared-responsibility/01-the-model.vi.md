---
id: shared-responsibility-model
title: "Mô hình trách nhiệm chia sẻ của AWS: bảo mật của đám mây và trong đám mây"
required: true
---
## Một câu cần nhớ

AWS mô tả bảo mật và tuân thủ là **trách nhiệm chia sẻ (shared responsibility)**: **AWS chịu trách nhiệm bảo mật *của* đám mây (security of the cloud), còn khách hàng chịu trách nhiệm bảo mật *trong* đám mây (security in the cloud).** Phần lớn câu hỏi thi kiểm tra xem ranh giới đó nằm ở đâu.

## AWS: bảo mật của đám mây

AWS bảo vệ **hạ tầng chạy mọi dịch vụ AWS**:

- **An ninh vật lý** của trung tâm dữ liệu: kiểm soát lối vào có bảo vệ, chỉ nhân viên được phê duyệt mới vào được, điện, làm mát và phòng cháy.
- **Phần cứng**: máy chủ, thiết bị lưu trữ và thiết bị mạng, kể cả việc hủy an toàn các phương tiện lưu trữ từng chứa dữ liệu khách hàng.
- **Hạ tầng toàn cầu**: Region, Availability Zone và edge location.
- **Phần mềm bên dưới workload của bạn**: **hệ điều hành của máy chủ vật lý (host OS)** và **lớp ảo hóa** (hypervisor).
- Với dịch vụ được quản lý, AWS còn vận hành các lớp mà họ quản lý giúp bạn, như hệ điều hành bên dưới Amazon RDS hoặc nền tảng bên dưới AWS Lambda.

Khách hàng không nhìn thấy cũng không chạm được vào các lớp này, nên khách hàng không thể chịu trách nhiệm cho chúng.

## Khách hàng: bảo mật trong đám mây

Khách hàng chịu trách nhiệm về **những gì họ đưa lên đám mây và cách họ cấu hình nó**. Khối lượng công việc này phụ thuộc vào dịch vụ họ chọn (bài tiếp theo). Các việc thường gặp của khách hàng:

- **Dữ liệu khách hàng**: lưu gì, lưu ở đâu, và được phân loại thế nào.
- **Quản lý danh tính và quyền truy cập**: người dùng, role, quyền, mật khẩu, MFA và access key.
- **Hệ điều hành khách (guest OS) và ứng dụng** trên các dịch vụ như EC2: cập nhật, bản vá bảo mật, phần mềm đã cài.
- **Cấu hình mạng và tường lửa**: security group, network ACL, định tuyến.
- **Lựa chọn mã hóa**: dùng khóa nào, các tùy chọn mã hóa bổ sung, và mã hóa khi truyền (in transit) (một số dịch vụ, như S3 và DynamoDB, mặc định mã hóa dữ liệu khi lưu trữ).

## Những trách nhiệm không bao giờ chuyển sang AWS

Dù dùng dịch vụ nào, những việc sau vẫn thuộc về khách hàng:

- **Dữ liệu** của bạn và việc **phân loại** nó.
- **Ai được truy cập** tài nguyên và dữ liệu của bạn (IAM).
- **Thông tin đăng nhập tài khoản** của bạn, như mật khẩu root user và access key.
- **Lựa chọn và cấu hình** các tính năng bảo mật, như tùy chọn mã hóa và quy tắc tường lửa.

AWS cung cấp công cụ, như IAM, AWS KMS và AWS Shield, nhưng **dùng chúng đúng cách là việc của bạn**. Các dịch vụ đó được trình bày trong chủ đề tiếp theo.

## Bẫy thường gặp

- "An ninh vật lý của trung tâm dữ liệu" hoặc "bảo trì phần cứng" luôn là **AWS**.
- "Cấu hình security group" hoặc "quản lý IAM user" luôn là **khách hàng**.
- Chữ "of" (của) chỉ tới AWS; chữ "in" (trong) chỉ tới khách hàng.
- Dịch vụ được quản lý **không** khiến AWS phải chịu trách nhiệm về dữ liệu của bạn hay về việc ai được truy cập nó.

## Ý chính

- AWS: bảo mật **của** đám mây (cơ sở vật chất, phần cứng, mạng, host OS, ảo hóa).
- Khách hàng: bảo mật **trong** đám mây (dữ liệu, IAM, guest OS và ứng dụng, quy tắc mạng, lựa chọn mã hóa).
- Phần việc của khách hàng tăng theo mức kiểm soát họ có.
- Dữ liệu, quyền truy cập và thông tin đăng nhập luôn là trách nhiệm của khách hàng.

## Nguồn

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Security in Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
