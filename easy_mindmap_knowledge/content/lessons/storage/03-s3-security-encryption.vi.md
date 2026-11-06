---
id: storage-s3-security-encryption
title: "Bảo mật Amazon S3: kiểm soát truy cập, mã hóa và giám sát"
required: true
---
## Mặc định là riêng tư

Bài cơ bản đã nói bucket mặc định ở chế độ riêng tư. Bài này giải thích **ai có thể được cấp quyền**, dữ liệu được **mã hóa** thế nào, và phần việc của **bạn** so với AWS.

## Kiểm soát truy cập

| Cơ chế | Là gì | Dùng điển hình |
| --- | --- | --- |
| **IAM policy** | Dựa trên danh tính: gắn vào user, group hoặc role | "Role này được đọc bucket này" |
| **Bucket policy** | Dựa trên tài nguyên: gắn vào bucket | Truy cập chéo tài khoản, chỉ cho phép HTTPS, giới hạn theo VPC endpoint |
| **ACL** | Quyền cũ theo bucket hoặc theo đối tượng | Hiếm khi cần |
| **S3 Block Public Access** | Công tắc ở cấp tài khoản hoặc bucket, ghi đè các policy và ACL có thể làm dữ liệu công khai | Lớp an toàn chống vô tình để lộ |

Điều cần nhớ:

- **ACL bị tắt theo mặc định** trên bucket mới (S3 Object Ownership đặt là "bucket owner enforced") và AWS khuyên giữ tắt. Khi đó quyền truy cập được quản lý bằng policy.
- Yêu cầu chỉ được phép khi policy cho phép và không có gì từ chối. Từ chối tường minh luôn thắng.
- Ứng dụng trên EC2 hoặc Lambda nên dùng **IAM role** với thông tin xác thực tạm thời, đừng bao giờ để access key trong mã nguồn.
- Áp dụng **đặc quyền tối thiểu**: chỉ cấp hành động và bucket mà tác vụ cần.
- Để cấp quyền tạm thời cho một đối tượng riêng tư, bạn có thể tạo **pre-signed URL**; bài tùy chọn về website hosting có nói đến.

## Phát hiện việc để lộ: IAM Access Analyzer for S3

**IAM Access Analyzer for S3** cảnh báo khi một bucket được cấu hình cho phép bất kỳ ai trên internet hoặc tài khoản AWS khác truy cập, kể cả tài khoản ngoài tổ chức của bạn. Nó cho biết quyền đến từ ACL, bucket policy hay access point policy. Mẹo thi: "xem những bucket nào đang công khai hoặc chia sẻ" chỉ về đây. Các dịch vụ khác nhìn vào S3: **Amazon Macie** phát hiện dữ liệu nhạy cảm như PII trong bucket, và **Amazon GuardDuty** phát hiện hoạt động đáng ngờ trên dữ liệu S3.

## Mã hóa khi lưu

Từ tháng 1 năm 2023, S3 tự động mã hóa mọi đối tượng mới mà không tốn thêm phí. Các lựa chọn mã hóa phía máy chủ (dịch vụ mã hóa khi ghi):

| Lựa chọn | Ai quản lý khóa | Ghi chú |
| --- | --- | --- |
| **SSE-S3** | Amazon S3 | Mặc định; AES-256 |
| **SSE-KMS** | Khóa **AWS KMS** mà bạn xem, kiểm soát và kiểm toán được qua CloudTrail | Chọn khi cần key policy và nhật ký kiểm toán |
| **DSSE-KMS** | AWS KMS | Hai lớp mã hóa, cho quy định tuân thủ nghiêm ngặt hơn |
| **SSE-C** | Bạn cung cấp khóa trong mỗi yêu cầu | AWS không lưu khóa; S3 nay tắt tính năng này theo mặc định trên bucket mới nên bạn phải chủ động bật |

Với **mã hóa phía máy khách (client-side)**, bạn tự mã hóa dữ liệu trước khi tải lên và tự quản lý khóa cùng quy trình. Mẹo thi nhanh: "AWS lo hết" là SSE-S3, "kiểm soát và kiểm toán khóa trong KMS" là SSE-KMS, "chúng tôi cung cấp khóa" là SSE-C, "mã hóa trước khi tải lên" là client-side.

## Mã hóa khi truyền

Truy cập S3 qua HTTPS (TLS). Để bắt buộc kết nối được mã hóa, bucket policy có thể từ chối các yêu cầu không dùng secure transport (điều kiện `aws:SecureTransport`).

## Trách nhiệm chia sẻ với S3

| AWS chịu trách nhiệm | Bạn chịu trách nhiệm |
| --- | --- |
| Độ bền và tính sẵn sàng của hạ tầng, phần cứng và phần mềm dịch vụ S3 | Ai được truy cập bucket và đối tượng: policy, Block Public Access |
| Mã hóa đối tượng mới theo mặc định | Chọn kiểu mã hóa, quản lý khóa KMS và mọi khóa phía máy khách |
| An ninh vật lý của trung tâm dữ liệu | Versioning, nhân bản, lifecycle và phân loại dữ liệu của bạn |

S3 là dịch vụ được quản lý nên bạn không phải lo hệ điều hành hay vá lỗi. Một bucket công khai do cấu hình sai là trách nhiệm của khách hàng, không phải của AWS.

## Bẫy thường gặp

- Tắt Block Public Access "cho chạy được" sẽ làm lộ dữ liệu. Chỉ tắt cho nội dung thực sự cần công khai.
- SSE-S3 đã bật sẵn theo mặc định; bạn không cần bật.
- Access Analyzer for S3 chỉ báo cáo việc để lộ, không chặn. Block Public Access mới là thứ ngăn chặn.

## Ý chính

- Kiểm soát truy cập bằng IAM policy, bucket policy và Block Public Access; ACL tắt theo mặc định.
- Mọi đối tượng mới được mã hóa khi lưu tự động (SSE-S3); dùng SSE-KMS để kiểm soát và kiểm toán khóa, SSE-C nếu bạn giữ khóa, hoặc mã hóa phía máy khách.
- Dùng HTTPS, và bucket policy để bắt buộc điều đó.
- IAM Access Analyzer for S3 phát hiện truy cập công khai và chéo tài khoản.
- AWS bảo mật dịch vụ; bạn bảo mật quyền truy cập và các lựa chọn về dữ liệu.

## Nguồn

- [Security best practices for Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)
- [Protecting data with server-side encryption](https://docs.aws.amazon.com/AmazonS3/latest/userguide/serv-side-encryption.html)
