---
id: iam-security-acm-and-secrets-manager
title: "Chứng chỉ và bí mật: AWS Certificate Manager và AWS Secrets Manager"
required: true
---
## Hai loại "bí mật" khác nhau

**Chứng chỉ TLS** chứng minh danh tính của một website và cho phép dùng HTTPS (mã hóa khi truyền). **Secret (bí mật)** là thông tin xác thực mà ứng dụng của bạn dùng, như mật khẩu cơ sở dữ liệu, API key hoặc OAuth token. Hai việc khác nhau, hai dịch vụ khác nhau.

## AWS Certificate Manager (ACM)

**AWS Certificate Manager (ACM)** tạo, lưu trữ và gia hạn các **chứng chỉ SSL/TLS X.509 công khai (public) và riêng tư (private)** bảo vệ website và ứng dụng của bạn. Tài liệu cũ có thể gọi nó là "AWS ACM" hoặc chỉ "Certificate Manager".

- Bạn có thể để ACM **cấp (issue)** một chứng chỉ, hoặc **nhập (import)** chứng chỉ từ bên thứ ba. Chứng chỉ công khai được xác thực bằng cách chứng minh bạn kiểm soát tên miền, ví dụ qua một bản ghi DNS.
- Chứng chỉ từ ACM triển khai thẳng tới các **dịch vụ tích hợp**: **Elastic Load Balancing**, **Amazon CloudFront**, **Amazon API Gateway**, AWS Elastic Beanstalk và nhiều dịch vụ khác. Đó là đáp án cho "cấp chứng chỉ cho load balancer".
- **Việc gia hạn được quản lý** với chứng chỉ công khai do ACM cấp và xác thực bằng DNS, nên website không ngừng hoạt động vì chứng chỉ hết hạn. Chứng chỉ nhập vào và chứng chỉ cấp qua API IssueCertificate của AWS Private CA thì ACM không gia hạn.
- **Giá:** chứng chỉ công khai dùng với các dịch vụ tích hợp không tính phí chứng chỉ; bạn chỉ trả cho các tài nguyên chạy ứng dụng. Chứng chỉ riêng tư đến từ **AWS Private CA**, có bảng giá riêng.
- Chứng chỉ ACM mang tính **theo Region**: chứng chỉ cho load balancer ở một Region không tồn tại ở Region khác, và chứng chỉ cho CloudFront phải được yêu cầu ở US East (N. Virginia).

ACM cung cấp chứng chỉ, không phải bảo vệ kiểu tường lửa. Nó không chặn SQL injection hay tấn công DDoS.

## AWS Secrets Manager

**AWS Secrets Manager** giúp bạn quản lý, truy xuất và **xoay vòng (rotate)** thông tin xác thực cơ sở dữ liệu, thông tin xác thực ứng dụng, OAuth token, API key và các bí mật khác trong suốt vòng đời.

- Thay vì ghi cứng mật khẩu trong mã nguồn, ứng dụng **gọi Secrets Manager lúc chạy** để lấy nó.
- Bạn có thể đặt **lịch xoay vòng tự động**, thay bí mật dài hạn bằng bí mật ngắn hạn. Ứng dụng không cần triển khai lại khi bí mật thay đổi.
- Secret được mã hóa bằng **AWS KMS**; AWS managed key `aws/secretsmanager` không tốn thêm phí, còn KMS key riêng của bạn tính theo giá KMS.
- Quyền truy cập được kiểm soát bằng IAM, và việc sử dụng được ghi vào AWS CloudTrail.
- Nó không miễn phí. Bạn trả theo mỗi secret được lưu và mỗi lệnh gọi API.

"Lưu và tự động xoay vòng thông tin xác thực cơ sở dữ liệu" là kịch bản điển hình của Secrets Manager.

## Mỗi loại thông tin xác thực nên để ở đâu

AWS đưa ra hướng dẫn này cho các loại bí mật khác:

| Thứ bạn giữ | Nơi phù hợp nhất |
| --- | --- |
| Mật khẩu cơ sở dữ liệu, API key, OAuth token | AWS Secrets Manager |
| Thông tin xác thực AWS | AWS IAM (role và thông tin đăng nhập tạm thời) |
| Khóa mã hóa | AWS KMS |
| Khóa riêng tư và chứng chỉ | AWS Certificate Manager |
| Khóa SSH | Amazon EC2 Instance Connect |

## Secrets Manager hay Parameter Store?

**AWS Systems Manager Parameter Store** cũng lưu các giá trị cấu hình và giá trị `SecureString` đã mã hóa (xem chủ đề triển khai và vận hành).

| Nhu cầu | Chọn |
| --- | --- |
| Lưu dữ liệu cấu hình và mật khẩu với chi phí thấp, bậc standard không tính thêm phí | Parameter Store |
| Tự động xoay vòng thông tin xác thực với ít công sức vận hành nhất | Secrets Manager |
| Lưu và truy xuất an toàn thông tin xác thực cơ sở dữ liệu kèm lịch xoay vòng | Secrets Manager |

Nếu câu hỏi nhắc tới xoay vòng, hãy chọn Secrets Manager. Nếu chỉ nói "lưu cấu hình", Parameter Store là lựa chọn rẻ hơn.

## Bẫy thường gặp

- "Cấp một chứng chỉ TLS" là ACM, không bao giờ là KMS hay Secrets Manager.
- "Xoay vòng mật khẩu cơ sở dữ liệu mỗi 30 ngày" là Secrets Manager, không phải KMS (KMS quản lý khóa) hay CloudHSM.
- Mật khẩu để trong Amazon S3, tham số CloudFormation hoặc Storage Gateway không phải lựa chọn an toàn nhất.

## Ý chính

- ACM cấp, nhập và gia hạn chứng chỉ TLS và triển khai chúng tới ELB, CloudFront và API Gateway.
- Secrets Manager lưu bí mật và có thể tự động xoay vòng; ứng dụng lấy chúng lúc chạy.
- Parameter Store là nơi chi phí thấp hơn cho cấu hình; thêm Secrets Manager khi cần xoay vòng.

## Nguồn

- [What is AWS Certificate Manager?](https://docs.aws.amazon.com/acm/latest/userguide/acm-overview.html)
- [Managed automation with integrated services (ACM)](https://docs.aws.amazon.com/acm/latest/userguide/acm-services.html)
- [What is AWS Secrets Manager?](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)
