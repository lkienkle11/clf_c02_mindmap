---
id: iam-security-data-protection
title: "Bảo vệ dữ liệu: mã hóa, AWS KMS, Secrets Manager, ACM và CloudHSM"
required: true
---
## Hai trạng thái của dữ liệu

- **Mã hóa khi lưu trữ (encryption at rest)** bảo vệ dữ liệu đang được lưu: object trong S3, EBS volume, cơ sở dữ liệu RDS, bản sao lưu. Nhiều dịch vụ mã hóa mặc định; ví dụ, Amazon S3 mã hóa mọi object mới tải lên kể từ tháng 1 năm 2023.
- **Mã hóa khi truyền (encryption in transit)** bảo vệ dữ liệu đang đi qua mạng, thường bằng **TLS** (chữ "S" trong HTTPS).

Quyết định mã hóa cái gì và dùng khóa nào là trách nhiệm của khách hàng; AWS cung cấp công cụ.

## AWS Key Management Service (AWS KMS)

**AWS KMS** tạo và kiểm soát các **khóa mã hóa** mà dịch vụ AWS dùng để mã hóa dữ liệu của bạn. Khóa được bảo vệ bởi các mô-đun bảo mật phần cứng (HSM) do AWS vận hành, vật liệu khóa không rời KMS ở dạng chưa mã hóa, và mọi lần dùng khóa trong tài khoản của bạn đều có thể kiểm toán bằng **AWS CloudTrail**.

| Loại khóa | Ai quản lý | Bạn kiểm soát gì |
| --- | --- | --- |
| Customer managed key | Bạn tạo và quản lý | Key policy, xoay vòng, vô hiệu hóa, xóa; phí hằng tháng cộng phí sử dụng |
| AWS managed key | Một dịch vụ AWS tạo nó trong tài khoản của bạn (alias `aws/service`) | Bạn xem được và kiểm toán được việc dùng nó; AWS xoay vòng mỗi năm; không có phí hằng tháng |
| AWS owned key | Thuộc sở hữu của dịch vụ AWS, nằm ngoài tài khoản của bạn | Không gì cả; miễn phí và bạn không nhìn thấy |

Hãy chọn **customer managed key** khi bạn cần kiểm soát: key policy của riêng bạn, lịch xoay vòng của riêng bạn, hoặc khả năng vô hiệu hóa một khóa.

## AWS Secrets Manager

**Secrets Manager** lưu **mật khẩu cơ sở dữ liệu, API key và các bí mật (secret) khác**. Ứng dụng lấy secret lúc chạy thay vì giữ nó trong mã nguồn, và Secrets Manager có thể **tự động xoay vòng secret** theo lịch.

## AWS Certificate Manager (ACM)

**ACM** cấp và quản lý **chứng chỉ SSL/TLS** cho website và ứng dụng của bạn, và cung cấp **gia hạn được quản lý (managed renewal)** cho các chứng chỉ do nó cấp (chứng chỉ nhập từ bên ngoài thì bạn tự gia hạn). Bạn gắn chúng vào các dịch vụ tích hợp như Elastic Load Balancing, Amazon CloudFront và Amazon API Gateway để phục vụ HTTPS.

## AWS CloudHSM

**AWS CloudHSM** cung cấp cho bạn các **mô-đun bảo mật phần cứng chuyên dụng, một khách thuê (single-tenant)** trên AWS Cloud. AWS cấp phát và bảo trì phần cứng, nhưng **chỉ bạn quản lý người dùng và khóa** bên trong HSM; AWS không nhìn thấy chúng. Hãy chọn nó khi có quy định yêu cầu khóa nằm trong HSM do riêng bạn kiểm soát. Nếu bạn chỉ cần khóa mã hóa được quản lý, KMS đơn giản hơn.

## Bẫy thường gặp

- "Lưu và xoay vòng mật khẩu cơ sở dữ liệu" là **Secrets Manager**, không phải KMS.
- "Tạo và kiểm soát khóa mã hóa" là **KMS**; "HSM một khách thuê mà chỉ chúng tôi kiểm soát" là **CloudHSM**.
- "Cấp chứng chỉ TLS cho load balancer" là **ACM**.

## Ý chính

- At rest = dữ liệu đang lưu; in transit = dữ liệu trên mạng (TLS).
- KMS quản lý khóa; customer managed key cho nhiều quyền kiểm soát nhất.
- Secrets Manager lưu và xoay vòng secret; ACM cấp và quản lý chứng chỉ TLS.
- CloudHSM = HSM chuyên dụng mà bạn tự quản lý khóa.

## Nguồn

- [AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html)
- [What is AWS Secrets Manager?](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
- [What is AWS CloudHSM?](https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html)
