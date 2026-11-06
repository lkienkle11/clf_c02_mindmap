---
id: iam-security-identity-center-cognito-directory
title: "Ai đăng nhập: IAM Identity Center, Amazon Cognito, Directory Service và liên kết danh tính"
required: true
---
## Hai loại người dùng, hai dịch vụ

| Người dùng | Ví dụ | Dịch vụ |
| --- | --- | --- |
| Nhân viên (workforce: nhân viên và đối tác của bạn) | Nhân viên mở AWS Management Console hoặc các ứng dụng nghiệp vụ | **AWS IAM Identity Center** |
| Khách hàng của ứng dụng bạn xây | Người mua đăng ký tài khoản trong ứng dụng di động | **Amazon Cognito** |

## AWS IAM Identity Center

**IAM Identity Center** kết nối nhân viên của bạn với các tài khoản và ứng dụng AWS bằng **đăng nhập một lần (single sign-on)**. Người dùng đăng nhập một lần qua **AWS access portal** rồi chọn tài khoản, role hoặc ứng dụng được giao.

- **Trạng thái và tên cũ:** AWS Single Sign-On đã được đổi tên thành AWS IAM Identity Center vào ngày 26/7/2022. Nhiều câu hỏi thi vẫn viết "AWS Single Sign-On" hoặc "AWS SSO"; đó vẫn là cùng một dịch vụ.
- **Nguồn danh tính (identity source):** tạo user và group ngay trong Identity Center, hoặc kết nối một nguồn có sẵn như Microsoft Active Directory (qua AWS Managed Microsoft AD hoặc AD Connector) hay một nhà cung cấp danh tính SAML 2.0 bên ngoài như Okta. Nhân viên khi đó dùng thông tin đăng nhập công ty sẵn có thay vì một bộ mới.
- **Nhiều tài khoản:** nó hoạt động với AWS Organizations (organization instance được khuyên dùng chạy ở management account). **Permission set** định nghĩa quyền theo chức năng công việc một lần, và Identity Center cấp phát chúng tới các tài khoản.
- **Ứng dụng:** nó cũng cấp quyền truy cập các ứng dụng do AWS quản lý (AWS managed applications) và các ứng dụng nghiệp vụ SAML 2.0 như Salesforce, Box hay Microsoft 365, mà bạn gán cho user và group.
- Đây là cách được khuyên dùng để cấp quyền quản trị cho con người thay vì dùng root user.
- Không tính thêm phí.

## Amazon Cognito

**Amazon Cognito** là nền tảng danh tính cho ứng dụng web và di động của bạn. Nó có hai phần, dùng riêng hoặc kết hợp:

| Phần | Trả lời câu hỏi | Làm gì |
| --- | --- | --- |
| **User pool** | Người này là ai? | Thư mục người dùng có đăng ký và đăng nhập; phát hành JSON web token; hỗ trợ nhà cung cấp mạng xã hội (Google, Apple, Facebook, Amazon) và nhà cung cấp SAML hoặc OIDC; hỗ trợ MFA bằng TOTP hoặc SMS |
| **Identity pool** | Người này được truy cập tài nguyên AWS nào? | Đổi một token đáng tin lấy thông tin đăng nhập AWS tạm thời, quyền hạn chế, qua AWS STS; cũng có thể cho phép truy cập dạng khách (guest) |

Luồng điển hình: người dùng đăng nhập vào user pool, ứng dụng đổi token lấy thông tin đăng nhập ở identity pool, rồi gọi thẳng Amazon S3 hoặc DynamoDB bằng thông tin đăng nhập tạm thời. Cognito phù hợp với "người tiêu dùng đăng ký và đăng nhập bằng Google", "đăng nhập cho ứng dụng di động" và "MFA cho người dùng ứng dụng".

## AWS Directory Service

**AWS Directory Service** cung cấp Microsoft Active Directory (AD) trên đám mây, cho các ứng dụng cần AD hoặc LDAP. Các lựa chọn:

| Lựa chọn | Là gì | Chọn khi |
| --- | --- | --- |
| **AWS Managed Microsoft AD** | Một Windows Server AD thật do AWS vận hành, có phiên bản Standard và Enterprise | Bạn cần tính năng AD thật, workload Windows, Amazon RDS for SQL Server, hoặc quan hệ tin cậy (trust) với AD tại chỗ; phiên bản Hybrid kết nối một AD tự quản lý |
| **AD Connector** | Một proxy chuyển tiếp yêu cầu đăng nhập tới AD tại chỗ hiện có của bạn | Bạn chỉ muốn người dùng tại chỗ dùng ứng dụng AWS bằng thông tin AD của họ |
| **Simple AD** | Thư mục nhỏ hơn dựa trên Samba 4 với các tính năng AD cơ bản | Bạn muốn một thư mục quy mô nhỏ, chi phí thấp với tính năng AD cơ bản (xem trạng thái bên dưới) |

Trạng thái: Simple AD không còn mở cho khách hàng mới kể từ ngày 30/7/2026, và khách hàng hiện có vẫn giữ đầy đủ chức năng; AWS hướng người dùng mới tới AWS Managed Microsoft AD hoặc AD Connector.

Directory Service không phải đáp án cho "đăng nhập của người tiêu dùng" (Cognito) hay "một cổng cho nhiều tài khoản AWS" (IAM Identity Center), dù Identity Center có thể dùng một AD làm nguồn.

## Liên kết danh tính trong một phút

**Liên kết danh tính (identity federation)** tin cậy một nhà cung cấp danh tính (IdP) bên ngoài. Người dùng xác thực ở đó, rồi nhận thông tin đăng nhập tạm thời cho một IAM role. Có hai chuẩn quan trọng:

- **SAML 2.0** cho thư mục doanh nghiệp và ứng dụng nghiệp vụ.
- **OpenID Connect (OIDC)** cho đăng nhập web và mạng xã hội.

## Chọn nhanh

- "Đăng nhập một lần bằng thông tin công ty vào nhiều tài khoản AWS", "cổng cho ứng dụng SaaS và AWS" hoặc "IdP bên thứ ba cho nhân viên": **IAM Identity Center**.
- "Đăng ký và đăng nhập cho ứng dụng người tiêu dùng, kèm Google": **Amazon Cognito**.
- "Active Directory trên AWS" hoặc "Microsoft AD được quản lý": **AWS Directory Service**.
- "API thông tin đăng nhập tạm thời": **AWS STS** (bài trước).

## Ý chính

- SSO cho nhân viên là IAM Identity Center (trước đây là AWS SSO); đăng nhập của khách hàng là Cognito.
- Cognito user pool xác thực; identity pool cấp thông tin đăng nhập AWS tạm thời.
- Directory Service gồm Managed Microsoft AD, AD Connector và Simple AD (đã đóng cho khách hàng mới).
- Federation dùng SAML 2.0 hoặc OIDC và kết thúc bằng một role.

## Nguồn

- [What is IAM Identity Center?](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html)
- [What is Amazon Cognito?](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
- [What is AWS Directory Service?](https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html)
