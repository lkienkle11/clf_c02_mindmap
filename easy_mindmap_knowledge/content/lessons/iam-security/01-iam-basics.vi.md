---
id: iam-security-iam-basics
title: "AWS IAM: user, group, role và policy"
required: true
---
## IAM làm gì

**AWS Identity and Access Management (IAM)** kiểm soát **ai** được đăng nhập vào tài khoản AWS của bạn (xác thực, authentication) và họ được **làm gì** (phân quyền, authorization). IAM là dịch vụ toàn cầu, không tính thêm phí, và dùng nó đúng cách luôn là việc của khách hàng.

## Các thành phần cơ bản

- **IAM user**: một danh tính cho một người hoặc một ứng dụng, có **thông tin đăng nhập dài hạn (long-term credentials)**: mật khẩu console và/hoặc access key.
- **IAM user group**: một tập hợp user. Quyền gắn vào group áp dụng cho mọi thành viên. Group **chỉ chứa user** (không lồng group vào group), và một user có thể thuộc nhiều group.
- **IAM role**: một danh tính có quyền nhưng **không có mật khẩu hay access key dài hạn**. Một user, một ứng dụng hoặc một dịch vụ AWS **đảm nhận (assume)** role và nhận **thông tin đăng nhập tạm thời (temporary credentials)**. Ví dụ: một EC2 instance dùng role để đọc dữ liệu từ một S3 bucket.
- **Policy**: một tài liệu JSON liệt kê các quyền. Với danh tính IAM, không có gì được phép cho đến khi một policy cho phép.

## Đọc một policy

Một policy gồm một hoặc nhiều câu lệnh (statement). Ba phần cần nhận ra:

- **Effect**: `Allow` (cho phép) hoặc `Deny` (từ chối).
- **Action**: những thao tác API nào, ví dụ `s3:GetObject`.
- **Resource**: những tài nguyên nào, xác định bằng ARN, ví dụ một S3 bucket.

Một statement cũng có thể có **Condition** (điều kiện), như "chỉ khi yêu cầu dùng TLS".

## Policy dựa trên danh tính và policy dựa trên tài nguyên

**Identity-based policy** được gắn vào user, group hoặc role và cho biết danh tính đó được làm gì. **Resource-based policy** được gắn vào một tài nguyên, như **S3 bucket policy** hoặc key policy của KMS, và chỉ ra **ai** (principal) được dùng tài nguyên đó. Đây là cách phổ biến để cấp quyền cho một tài khoản AWS khác.

## AWS quyết định thế nào

| Tình huống | Kết quả |
| --- | --- |
| Không policy nào cho phép yêu cầu | Bị từ chối (implicit deny, mặc định) |
| Có policy cho phép và không có gì từ chối | Được phép |
| Bất kỳ policy liên quan nào từ chối tường minh | Bị từ chối, dù policy khác cho phép |

**Explicit deny (từ chối tường minh) luôn thắng.**

## Đặc quyền tối thiểu

Chỉ cấp **những quyền cần cho công việc** (least privilege), và gỡ những gì không còn dùng. AWS gợi ý bắt đầu với **AWS managed policy** cho các vai trò công việc phổ biến, rồi chuyển sang **customer managed policy** chặt hơn. **IAM Access Analyzer** có thể tạo một policy từ hoạt động mà role thực sự đã dùng.

## Bẫy thường gặp

- "Cho ứng dụng trên EC2 truy cập S3" chỉ tới **IAM role**, không phải access key lưu trên instance.
- "Nhiều developer cần cùng một bộ quyền" chỉ tới **IAM group**.
- Group không thể là principal trong bucket policy; hãy ghi user, role, tài khoản hoặc dịch vụ.

## Ý chính

- User có thông tin đăng nhập dài hạn, group dùng chung quyền, role cấp thông tin đăng nhập tạm thời.
- Policy là JSON với Effect, Action và Resource.
- Mặc định là từ chối; explicit deny thắng mọi allow.
- Áp dụng đặc quyền tối thiểu và rà soát các quyền không dùng.

## Nguồn

- [Identity-based policies and resource-based policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html)
- [Policy evaluation logic: deny and allow](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html)
- [Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
