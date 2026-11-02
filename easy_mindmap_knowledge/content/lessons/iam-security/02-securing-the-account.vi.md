---
id: iam-security-account-protection
title: "Bảo vệ tài khoản: root user, MFA, thông tin đăng nhập và các dịch vụ danh tính"
required: true
---
## Root user

Khi tạo một tài khoản AWS, bạn có **root user**: địa chỉ email và mật khẩu dùng để đăng ký. Root user có **toàn quyền với mọi thứ** trong tài khoản, và bạn không thể gắn IAM policy vào nó để giới hạn những gì nó làm được.

- **Không dùng nó cho công việc hằng ngày.** Hãy dùng một danh tính quản trị thay thế (AWS khuyên dùng IAM Identity Center).
- **Bật MFA** cho root user và **không tạo access key** cho nó.
- Chỉ đăng nhập bằng root **cho những tác vụ bắt buộc phải dùng root**, ví dụ: đổi email hoặc mật khẩu root của một tài khoản độc lập, đóng tài khoản, khôi phục quyền khi quản trị viên IAM duy nhất tự khóa mình, hoặc sửa một S3 bucket policy đang từ chối tất cả mọi người.

## Xác thực đa yếu tố (MFA)

MFA yêu cầu thêm một yếu tố thứ hai sau mật khẩu, như mã từ ứng dụng xác thực, passkey hoặc khóa bảo mật phần cứng. AWS khuyên dùng passkey và khóa bảo mật chống lừa đảo (phishing-resistant) khi có thể.

## Thông tin đăng nhập dài hạn và tạm thời

- **Access key** là thông tin đăng nhập **dài hạn** cho CLI, SDK và API. Một key bị lộ vẫn dùng được cho đến khi có người vô hiệu hóa nó.
- **Thông tin đăng nhập tạm thời** có được khi **assume một IAM role** và tự hết hạn. AWS khuyên dùng chúng cho con người (qua liên kết danh tính, federation) và cho workload: EC2 instance và Lambda function tự động nhận thông tin đăng nhập của role.
- Không bao giờ đặt access key trong mã nguồn. Nếu một công cụ thật sự cần, hãy xoay vòng (rotate) chúng và xóa các key không dùng.

**Password policy** đặt quy tắc cho mật khẩu của IAM user, như độ dài tối thiểu, loại ký tự, thời hạn và cấm dùng lại. Nó không áp dụng cho root user.

## Các dịch vụ danh tính cần nhận ra

- **AWS IAM Identity Center** (trước đây là AWS Single Sign-On) là cách được khuyên dùng để cho **nhân viên (workforce)** đăng nhập một lần (single sign-on) vào **nhiều tài khoản AWS** và ứng dụng. Bạn tạo user ngay trong nó hoặc kết nối nhà cung cấp danh tính sẵn có, như Microsoft Active Directory hoặc Okta.
- **Service control policy (SCP) của AWS Organizations** đặt **quyền tối đa** cho các tài khoản trong một tổ chức; bản thân chúng không cấp quyền nào.
- **Amazon Cognito** thêm chức năng đăng ký và đăng nhập cho **ứng dụng web và di động của chính bạn**, dành cho **khách hàng** của bạn. User pool là thư mục người dùng và hỗ trợ đăng nhập bằng mạng xã hội như Google hoặc Apple; identity pool đổi một lần đăng nhập lấy thông tin đăng nhập AWS tạm thời.

## Bẫy thường gặp

- "Nhân viên cần một lần đăng nhập cho nhiều tài khoản AWS" là **IAM Identity Center**; "người dùng ứng dụng đăng nhập bằng Google" là **Cognito**.
- SCP có thể chặn một hành động trong tài khoản thành viên dù IAM policy cho phép.

## Ý chính

- Chỉ dùng root user cho các tác vụ bắt buộc phải dùng root, và luôn có MFA.
- Ưu tiên role và thông tin đăng nhập tạm thời thay cho access key.
- Identity Center cho nhân viên; Cognito cho người dùng ứng dụng.
- SCP giới hạn tài khoản; chúng không bao giờ cấp quyền.

## Nguồn

- [AWS account root user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html)
- [What is IAM Identity Center?](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
