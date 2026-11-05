---
id: iam-security-iam-roles-and-sts
title: "IAM role, instance profile và AWS STS"
required: true
---
## Role là gì

**IAM role** là một danh tính có quyền nhưng **không có mật khẩu và không có access key dài hạn**. Role được thiết kế để bất kỳ ai cần đều có thể assume, và phiên làm việc (session) phát sinh sẽ nhận **thông tin đăng nhập tạm thời (temporary security credentials)**. Người dùng khi assume một role sẽ tạm thời bỏ quyền của chính mình và làm việc với quyền của role.

Mỗi role có hai loại policy:

- **Trust policy** (một resource-based policy) cho biết **ai được assume** role.
- **Permissions policy** cho biết **role được làm gì**.

## Ai có thể assume một role

| Ai | Ví dụ điển hình |
| --- | --- |
| Một dịch vụ AWS (service principal) | EC2 hoặc Lambda chạy mã gọi tới các dịch vụ khác |
| IAM user hoặc role trong cùng tài khoản | Quản trị viên chuyển sang một role có quyền cao hơn |
| IAM user hoặc role ở tài khoản khác | Truy cập chéo tài khoản (cross-account) |
| Người dùng bên ngoài từ nhà cung cấp danh tính SAML 2.0 hoặc OpenID Connect | Nhân viên đăng nhập qua thư mục của công ty |

AWS cũng dùng **service role** (role mà một dịch vụ assume thay bạn) và **service-linked role** (do dịch vụ định nghĩa sẵn, bạn xem được nhưng không sửa được).

## Role cho EC2 và instance profile

Ứng dụng trên EC2 không dùng trực tiếp role được vì hệ điều hành bị tách khỏi AWS bởi lớp ảo hóa. **Instance profile** là vật chứa đưa một role tới instance. Trong console, instance profile được tạo giúp bạn; với CLI hoặc API, bạn tạo nó ở một bước riêng. Ứng dụng đọc thông tin đăng nhập của role từ instance metadata, và chúng tự làm mới trước khi hết hạn. Một instance chỉ có một role tại một thời điểm.

Vì vậy "cho ứng dụng trên EC2 truy cập S3" hoặc "để EC2 gọi Amazon SNS" chỉ có một đáp án: **IAM role**. Để access key trên instance, hay dùng key của root user, đều sai.

## AWS Security Token Service (AWS STS)

**AWS STS** là dịch vụ cấp thông tin đăng nhập tạm thời. Chúng gồm access key ID, secret access key và **session token**. Chúng hết hạn, không được lưu cùng user, và không dùng lại được sau khi hết hạn, nên không cần xoay vòng hay thu hồi.

- STS mặc định có một endpoint toàn cầu, và bạn có thể chọn endpoint theo Region. Thông tin đăng nhập dùng được ở mọi Region.
- STS được cung cấp không tính thêm phí.
- Tên chính thức là *Security* Token Service, dù một số câu hỏi viết "Simple Token Service".

| Thao tác STS | Ai gọi | Dùng để |
| --- | --- | --- |
| `AssumeRole` | IAM user hoặc role | Đảm nhận một role, kể cả ở tài khoản khác |
| `AssumeRoleWithSAML` | Người dùng đã xác thực qua nhà cung cấp SAML 2.0 | Liên kết danh tính doanh nghiệp |
| `AssumeRoleWithWebIdentity` | Người dùng đã xác thực qua nhà cung cấp OIDC | Đăng nhập mạng xã hội hoặc ứng dụng |
| `GetSessionToken` | IAM user hoặc root user | Thông tin đăng nhập tạm thời, kèm MFA nếu yêu cầu |

Với `AssumeRole`, một session kéo dài tối thiểu 15 phút, mặc định 1 giờ, tối đa theo giới hạn của role.

STS là đáp án cho "dịch vụ nào cấp thông tin đăng nhập tạm thời, quyền hạn chế" và cho truy cập liên kết (federated). Nếu câu hỏi là "quản lý tập trung quyền truy cập của nhân viên vào nhiều tài khoản", đáp án là IAM Identity Center, dịch vụ này dùng các thông tin đăng nhập ấy ở bên dưới.

## Truy cập chéo tài khoản

Để user ở tài khoản A truy cập tài nguyên ở tài khoản B:

1. Ở tài khoản B (tài khoản tin cậy, trusting account), tạo một role có **trust policy** nêu tài khoản A và permissions policy cho phép các hành động cần thiết.
2. Ở tài khoản A, cấp cho user quyền gọi `sts:AssumeRole` trên role đó.
3. User assume role, trong console hoặc qua STS, và nhận thông tin đăng nhập tạm thời cho tài khoản B.

Không cần tạo IAM user nào ở tài khoản B. Câu hỏi kiểu "cấp cho user ở một tài khoản quyền truy cập tài nguyên ở tài khoản khác" trỏ tới **IAM role**.

## Vì sao role tốt hơn key dài hạn

- Không có gì dài hạn được lưu trong mã, trên instance hay trong ứng dụng di động, nên ít thứ để lộ.
- Thông tin đăng nhập tự hết hạn, và trên EC2 chúng tự làm mới.
- Một thay đổi ở role áp dụng cho mọi instance đang dùng nó.

Hãy tạo IAM user khi cần thông tin đăng nhập cho từng cá nhân, hoặc để xếp user vào group. Ứng dụng trên EC2, ứng dụng di động (qua Amazon Cognito) và nhân viên vốn đã đăng nhập trong mạng công ty thì dùng role hoặc federation.

## Ý chính

- Role có thông tin đăng nhập tạm thời, một trust policy và một permissions policy.
- Instance profile đưa role tới EC2; STS cấp thông tin đăng nhập tạm thời.
- Truy cập chéo tài khoản: một role ở tài khoản sở hữu tài nguyên, cộng quyền `sts:AssumeRole` ở tài khoản kia.
- Ưu tiên role hơn access key cho mọi workload.

## Nguồn

- [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- [Temporary security credentials in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html)
- [Use an IAM role to grant permissions to applications on Amazon EC2 instances](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2.html)
