---
id: deploy-operate-cicd-beanstalk
title: "Phát hành phần mềm: công cụ CI/CD, Elastic Beanstalk và chiến lược triển khai"
required: true
---
## CI/CD trong một đoạn

**Tích hợp liên tục (continuous integration, CI)** nghĩa là mọi thay đổi mã đều được build và kiểm thử tự động. **Phân phối liên tục (continuous delivery, CD)** nghĩa là mọi thay đổi đã qua kiểm thử đều sẵn sàng để phát hành qua một pipeline tự động.

## Các công cụ dành cho lập trình viên của AWS

- **AWS CodeCommit** (mã nguồn): kho Git riêng tư được quản lý.
- **AWS CodeBuild** (build và test): biên dịch mã, chạy kiểm thử và tạo ra artifact sẵn sàng triển khai.
- **AWS CodeDeploy** (triển khai): tự động triển khai tới EC2, máy chủ tại chỗ, Lambda và ECS.
- **AWS CodePipeline** (điều phối): mô hình hóa và tự động hóa toàn bộ luồng phát hành từ mã nguồn tới triển khai.

- **CodeBuild** được quản lý hoàn toàn: không có máy chủ build nào để dựng, vá hay co giãn, và bạn trả tiền theo số phút build đã dùng.
- **CodePipeline** nối các giai đoạn lại: lấy mã từ CodeCommit hoặc một nhà cung cấp Git khác, build bằng CodeBuild, triển khai bằng CodeDeploy, Elastic Beanstalk hoặc CloudFormation.
- **CodeCommit** từng ngừng nhận khách hàng mới vào năm 2024, rồi được mở lại cho mọi khách hàng (general availability) vào tháng 11 năm 2025.

## AWS Elastic Beanstalk

**Elastic Beanstalk** là lựa chọn "chỉ cần tải mã lên". Bạn đưa ứng dụng của mình (Java, .NET, Node.js, PHP, Python, Ruby, Go hoặc Docker), và nó **cấp phát EC2 instance, cân bằng tải, auto scaling và giám sát sức khỏe** cho bạn. Bạn vẫn xem và kiểm soát được các tài nguyên bên dưới. Elastic Beanstalk **không tính thêm phí**; bạn trả tiền cho tài nguyên mà nó tạo ra.

## Chiến lược triển khai

| Chiến lược | Cách hoạt động | Đánh đổi |
| --- | --- | --- |
| All at once (tại chỗ) | Cập nhật mọi máy chủ cùng lúc | Nhanh nhất, nhưng có thể gián đoạn ngắn |
| Rolling | Cập nhật từng đợt máy chủ một | Không gián đoạn hoàn toàn, nhưng giảm năng lực trong lúc cập nhật |
| Blue/green | Chạy phiên bản mới (green) bên cạnh phiên bản cũ (blue), rồi chuyển lưu lượng | Rollback nhanh và an toàn bằng cách chuyển ngược lại; tốn thêm tài nguyên trong một thời gian |
| Canary | Gửi một phần nhỏ lưu lượng tới phiên bản mới trước, rồi mới tới phần còn lại | Sự cố chỉ ảnh hưởng tới ít người dùng |

CodeDeploy hỗ trợ triển khai tại chỗ (rolling) và blue/green; với Lambda và ECS, nó có thể chuyển lưu lượng theo kiểu **canary**, **linear** hoặc **all at once**. Elastic Beanstalk có các chính sách như all at once, rolling, immutable và **traffic splitting** (một cách triển khai canary).

## Bẫy thường gặp

- "Triển khai ứng dụng web mà không phải quản lý hạ tầng, nhưng vẫn truy cập được hạ tầng" chỉ tới **Elastic Beanstalk**.
- "Biên dịch và chạy unit test" là **CodeBuild**; "điều phối các giai đoạn phát hành" là **CodePipeline**; "triển khai tới máy chủ hoặc Lambda" là **CodeDeploy**.
- "Rollback tức thì bằng cách chuyển lưu lượng về chỗ cũ" chỉ tới **blue/green**.

## Ý chính

- CI build và kiểm thử mọi thay đổi; CD giữ cho thay đổi luôn sẵn sàng phát hành.
- CodeCommit (mã nguồn), CodeBuild (build/test), CodeDeploy (triển khai), CodePipeline (điều phối).
- Elastic Beanstalk lo năng lực, cân bằng tải, co giãn và sức khỏe; không tính thêm phí.
- Blue/green, rolling và canary giảm rủi ro phát hành theo những cách khác nhau.

## Nguồn

- [What is AWS CodePipeline?](https://docs.aws.amazon.com/codepipeline/latest/userguide/welcome.html)
- [What is CodeDeploy?](https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html)
- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
