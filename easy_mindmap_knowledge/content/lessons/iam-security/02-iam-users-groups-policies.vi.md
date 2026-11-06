---
id: iam-security-iam-users-groups-policies
title: "IAM chi tiết: user, group và policy"
required: true
---
## IAM là dịch vụ toàn cầu

**AWS Identity and Access Management (IAM)** là dịch vụ **toàn cầu (global)**. User, group, role và policy không gắn với một Region nào, nên cùng một danh tính dùng được ở bất cứ nơi nào bạn chạy tài nguyên. IAM không tính thêm phí. Ai chịu trách nhiệm gì trong IAM được trình bày ở chủ đề mô hình trách nhiệm chia sẻ.

## User và group: những điều cần nhớ

- **IAM user** được tạo cho một người hoặc một ứng dụng và có thông tin đăng nhập dài hạn: mật khẩu console, access key, hoặc cả hai. User mới chưa có quyền nào cho đến khi bạn cấp.
- **IAM user group** chỉ chứa user, không chứa group khác, và một user có thể thuộc nhiều group. Không có group nào mặc định chứa tất cả mọi người; bạn tự tạo và thêm user vào.
- Quyền gắn vào group và các thành viên được thừa hưởng. Khi ai đó đổi vị trí công việc, bạn đổi nhóm của họ thay vì sửa từng quyền.
- Group không phải là danh tính để đăng nhập, nên không thể làm principal trong một policy.

AWS khuyên con người nên dùng liên kết danh tính (federation) và thông tin đăng nhập tạm thời, còn IAM user chỉ nên dành cho những trường hợp federation không đáp ứng được. Tuy nhiên, các câu hỏi thi về việc tạo thông tin đăng nhập cho từng cá nhân, hoặc gom user để dùng chung quyền, vẫn trỏ tới IAM user và IAM group. Role sẽ nằm ở bài sau.

## Các loại policy bạn có thể gặp

| Loại policy | Gắn vào | Tác dụng |
| --- | --- | --- |
| Identity-based | User, group hoặc role | Cấp quyền cho danh tính đó |
| Resource-based | Một tài nguyên, như S3 bucket policy hoặc trust policy của role | Cấp quyền cho principal được nêu tên, trong cùng hoặc khác tài khoản |
| Permissions boundary | Một user hoặc role | Đặt mức tối đa mà identity-based policy có thể cấp; tự nó không cấp quyền |
| Service control policy (SCP) | Root, OU hoặc tài khoản trong AWS Organizations | Đặt quyền tối đa cho IAM user và role ở các tài khoản thành viên; không cấp quyền |

Boundary và SCP là "lan can bảo vệ": chúng giới hạn những gì các policy khác được phép cho. Câu hỏi về "giới hạn những gì các tài khoản trong tổ chức có thể làm" trỏ tới SCP.

## Managed hay inline

| Loại | Ai viết | Tái sử dụng |
| --- | --- | --- |
| AWS managed policy | AWS; bạn không sửa được và AWS có thể cập nhật | Gắn cho nhiều danh tính |
| Customer managed policy | Bạn; sửa bất cứ lúc nào | Gắn cho nhiều danh tính |
| Inline policy | Bạn; nhúng vào một danh tính | Quan hệ một-một, bị xóa cùng danh tính |

Nếu một policy có thể áp dụng cho nhiều danh tính, nên dùng managed policy thay vì inline. Khi AWS managed policy không cấp đủ những gì người dùng cần, hãy **tạo customer managed (custom) policy**; sao chép một AWS managed policy là điểm khởi đầu tốt. Có các policy theo chức năng công việc như **PowerUserAccess**, và AWS khuyên chỉ dùng **AdministratorAccess** cho quản trị viên tài khoản.

## Đọc một policy

Một tài liệu policy có **Version** và một hoặc nhiều **Statement**. Mỗi statement có **Effect** (`Allow` hoặc `Deny`), **Action** và **Resource**, có thể thêm **Condition**. Resource-based policy còn nêu **Principal**; trong identity-based policy, principal được hiểu ngầm.

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::example-bucket/*"
  }]
}
```

Policy này chỉ cho phép đọc object trong một bucket, không gì khác.

## Một yêu cầu được quyết định thế nào

1. Mọi thứ **bị từ chối theo mặc định**.
2. Một **allow tường minh** trong policy áp dụng sẽ cho phép yêu cầu.
3. Một **deny tường minh** trong bất kỳ policy áp dụng nào sẽ thắng mọi allow, dù policy nào được viết trước.

Khi principal và tài nguyên ở **hai tài khoản khác nhau**, cả hai phía đều phải cho phép: resource-based policy nêu principal, và một identity-based policy cũng phải cấp quyền. Trong cùng một tài khoản, resource-based policy nêu tên principal là đủ.

## Đặc quyền tối thiểu

Chỉ cấp những gì một tác vụ cần. AWS gợi ý bắt đầu với AWS managed policy rồi chuyển sang customer managed policy hẹp hơn, dùng thông tin truy cập gần nhất và IAM Access Analyzer để xem cái gì thực sự được dùng (xem bài về root user và access key). Chia sẻ thông tin đăng nhập root, thêm mọi developer vào group quản trị, hay cấp quyền rộng "cho ai cũng làm được việc" đều là đáp án sai.

## Bẫy thường gặp

- "Tổ chức user để cấp quyền theo nhóm" là IAM user group, không phải security group (tường lửa mạng).
- Inline policy không được ưu tiên hơn customer managed policy.
- IAM luôn miễn phí; phát hiện mối đe dọa và tường lửa web là các dịch vụ khác.

## Ý chính

- IAM là dịch vụ toàn cầu và miễn phí; user có thông tin đăng nhập dài hạn, group dùng chung quyền.
- Identity-based policy gắn vào danh tính; resource-based policy gắn vào tài nguyên và nêu principal.
- Ưu tiên managed policy; viết customer managed policy khi AWS managed policy không phù hợp.
- Mặc định từ chối; deny tường minh luôn thắng; áp dụng đặc quyền tối thiểu.

## Nguồn

- [Policies and permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [Managed policies and inline policies](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html)
- [Global services (AWS Fault Isolation Boundaries)](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html)
