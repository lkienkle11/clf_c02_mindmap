---
id: iam-security-mfa-access-keys-root-user
title: "MFA, access key, root user và các công cụ rà soát quyền truy cập"
required: true
---
## Các loại MFA

**Xác thực đa yếu tố (MFA)** bổ sung một thứ bạn có bên cạnh thứ bạn biết. Root user và từng IAM user có thể đăng ký tối đa tám thiết bị MFA, và chỉ cần một thiết bị là đăng nhập được.

| Loại MFA | Ghi chú |
| --- | --- |
| Passkey và khóa bảo mật (security key) | Theo chuẩn FIDO; chống lừa đảo (phishing); AWS khuyên dùng đầu tiên |
| Ứng dụng xác thực ảo (virtual authenticator) | Mã TOTP trên điện thoại; lựa chọn tạm thời tốt |
| Token TOTP phần cứng | Thiết bị hiển thị mã sáu chữ số |

AWS đã ngừng hỗ trợ MFA bằng tin nhắn SMS cho IAM.

## Access key, CLI và SDK

**Access key** gồm một access key ID và một secret access key. Hai thứ này cùng ký các yêu cầu lập trình từ **AWS Command Line Interface (AWS CLI)**, SDK và API. Chúng không dùng để đăng nhập console. Vì vậy khi câu hỏi nói developer cần CLI hoặc "truy cập lập trình (programmatic access)", đáp án là access key; user chỉ cần console thì dùng mật khẩu.

- Secret chỉ hiển thị một lần, lúc tạo. Mỗi user có tối đa hai key.
- Không bao giờ đặt key trong mã nguồn hoặc trong các tệp chia sẻ cho người khác.
- **Xoay vòng (rotate)**: tạo key thứ hai, chuyển ứng dụng sang key đó, rồi vô hiệu hóa và xóa key cũ.
- Xóa hoặc vô hiệu hóa những key mà thông tin "lần dùng gần nhất" cho thấy không ai cần.
- Ưu tiên role, để không tồn tại key dài hạn nào.

## Password policy

**Password policy** của tài khoản áp dụng cho mật khẩu của IAM user. Bạn có thể yêu cầu độ dài tối thiểu, loại ký tự, thời hạn hết hạn (từ 1 đến 1.095 ngày), cấm dùng lại mật khẩu gần đây, và cho phép user tự đổi mật khẩu. Nếu bạn không đặt gì, một policy mặc định sẽ áp dụng. Policy này **không áp dụng cho root user hay access key**, và IAM không có thiết lập khóa tài khoản (lockout), vì vậy hãy kết hợp với MFA. User có quyền có thể tự đổi mật khẩu trong console hoặc bằng AWS CLI. Yêu cầu như "độ dài mật khẩu tối thiểu" là một thiết lập của policy; "mật khẩu không bao giờ đổi được" không phải thực hành tốt.

## Root user

Root user có toàn quyền với tài khoản, và bạn không thể giới hạn nó bằng IAM policy (SCP có thể giới hạn các tài khoản thành viên). Thực hành tốt:

- Bật MFA, **không tạo access key**, và không chia sẻ nó.
- Mỗi tài khoản chỉ có một root user. Hãy tạo quản trị viên IAM Identity Center hoặc IAM cho công việc hằng ngày.
- Với tài khoản độc lập, chỉ chủ tài khoản quản lý access key của root user (AWS Organizations có thể xóa tập trung thông tin xác thực root của tài khoản thành viên).
- Trong AWS Organizations, bạn có thể gỡ thông tin đăng nhập root khỏi các tài khoản thành viên một cách tập trung.

Những tác vụ cần thông tin đăng nhập root gồm:

| Cần root | Không cần root |
| --- | --- |
| Đóng một tài khoản độc lập | Tạo IAM user và group |
| Đổi email hoặc mật khẩu root của tài khoản độc lập | Chạy một EC2 instance ở bất kỳ Region nào |
| Khôi phục quyền IAM khi quản trị viên duy nhất tự khóa mình | Xóa IAM user |
| Sửa hoặc xóa bucket policy đang từ chối mọi principal | Tạo một tổ chức AWS Organizations |
| Bật quyền truy cập IAM vào console Billing; đăng ký làm người bán trên Reserved Instance Marketplace | Xem hóa đơn, sau khi đã bật quyền truy cập IAM vào Billing |

## Công cụ rà soát quyền truy cập

| Công cụ | Cho bạn biết điều gì |
| --- | --- |
| **IAM credential report** | Tệp CSV liệt kê mọi user cùng trạng thái mật khẩu, access key (lần xoay vòng và lần dùng gần nhất) và thiết bị MFA; dùng cho kiểm toán và tuân thủ; tạo tối đa bốn giờ một lần |
| **IAM Access Advisor** (thông tin truy cập gần nhất) | Với một user, group, role hoặc policy: dịch vụ (và một số hành động) nào được dùng lần cuối, để bạn gỡ quyền không dùng |
| **IAM Access Analyzer** | Phát hiện (finding) về tài nguyên được chia sẻ cho thực thể bên ngoài hoặc công khai, như S3 bucket, IAM role và KMS key; còn có phân tích quyền không dùng, kiểm tra policy và tạo policy |

Đề thi viết nhiều kiểu: "AWS IAM Access Analyzer" và "AWS Identity and Access Management Access Analyzer" là cùng một tính năng. Phân tích truy cập bên ngoài của nó miễn phí, nhưng phân tích quyền không dùng và kiểm tra policy tùy chỉnh thì tính phí. Phân tích truy cập bên ngoài hoạt động theo từng Region, nên hãy bật analyzer đó ở mỗi Region bạn dùng.

**AWS Trusted Advisor** cũng có các kiểm tra bảo mật, ví dụ IAM access key chưa xoay vòng trong 90 ngày, MFA cho root user, IAM password policy và access key bị lộ.

Chọn theo câu hỏi:

- "MFA đã bật cho mọi user chưa", "liệt kê user cùng trạng thái mật khẩu và key" hoặc "báo cáo chi tiết xoay vòng cho kiểm toán viên" là **credential report**.
- "Kiểm tra các access key lâu chưa xoay vòng", khi Trusted Advisor nằm trong các lựa chọn, là **Trusted Advisor**.
- "S3 bucket hay role nào đang được chia sẻ với tài khoản khác" là **Access Analyzer**.
- "Quyền nào không được dùng" là **Access Advisor**.

## Ý chính

- MFA: ưu tiên passkey và khóa bảo mật; tối đa tám thiết bị.
- Access key dùng cho CLI, SDK và API; hãy xoay vòng, không nhúng vào mã, ưu tiên role.
- Password policy áp dụng cho mật khẩu IAM user, không áp dụng cho root user.
- Root: bật MFA, không tạo access key, chỉ dùng cho tác vụ chỉ root làm được.
- Credential report = trạng thái thông tin đăng nhập; Access Advisor = lần dùng gần nhất; Access Analyzer = truy cập bên ngoài.

## Nguồn

- [AWS account root user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html)
- [Multi-factor authentication in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa.html)
- [What is IAM Access Analyzer?](https://docs.aws.amazon.com/IAM/latest/UserGuide/what-is-access-analyzer.html)
