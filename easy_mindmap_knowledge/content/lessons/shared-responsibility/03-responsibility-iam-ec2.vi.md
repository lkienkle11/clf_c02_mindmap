---
id: shared-responsibility-responsibility-iam-ec2
title: "Từng lớp một: ai bảo mật IAM và Amazon EC2"
required: true
---
## Vì sao nên đi qua từng lớp

"Bảo mật **của** đám mây" thuộc về AWS còn "bảo mật **trong** đám mây" thuộc về khách hàng. Câu hỏi thi hiếm khi hỏi lại câu đó. Chúng nêu một công việc cụ thể rồi hỏi ai phụ trách. Cách nhanh nhất là hình dung chồng các lớp từ tòa nhà lên đến dữ liệu của bạn và xem công việc đó nằm ở lớp nào. Bài này làm điều đó với hai dịch vụ xuất hiện rất thường xuyên: **AWS Identity and Access Management (IAM)** và **Amazon EC2**.

## IAM: AWS vận hành dịch vụ, bạn quản lý danh tính

**IAM** là dịch vụ kiểm soát ai được đăng nhập và được làm gì. AWS vận hành chính dịch vụ này: máy chủ, phần mềm và việc sao chép dữ liệu giúp IAM luôn sẵn sàng. Mọi thứ bạn đưa vào IAM đều là việc của bạn:

| Hạng mục IAM | Ai chịu trách nhiệm |
| --- | --- |
| Tính sẵn sàng và hạ tầng của dịch vụ IAM | AWS |
| Tạo user, group và role | Khách hàng |
| Viết policy và cấp quyền tối thiểu (least privilege) | Khách hàng |
| Bật **xác thực đa yếu tố (MFA)** | Khách hàng |
| Xoay vòng và bảo vệ **access key** | Khách hàng |
| Bảo vệ **root user** của tài khoản | Khách hàng |
| Thu hồi quyền khi nhân sự rời đi | Khách hàng |

Bẫy thường gặp là nghĩ rằng AWS sẽ tự xoay vòng key hoặc siết quyền thay bạn. AWS cung cấp công cụ, nhưng không quyết định ai trong công ty bạn được làm gì. Chính sách mật khẩu cũng vậy: AWS có sẵn tùy chọn, bạn là người đặt chính sách.

Root user cần được nhắc riêng. Đây là danh tính đầu tiên của tài khoản AWS và có toàn quyền. AWS khuyến nghị không dùng nó cho công việc hằng ngày, nên việc bảo vệ nó (mật khẩu mạnh, MFA, không dùng access key cho việc thường ngày) hoàn toàn là việc của khách hàng. Chủ đề IAM và bảo mật tiếp theo sẽ đi sâu vào các công cụ này.

## Amazon EC2: bạn sở hữu phần máy chủ phía trên hypervisor

**Amazon EC2** cho bạn một máy chủ ảo, nên ranh giới nằm gần đỉnh của chồng các lớp.

| Lớp | Ai chịu trách nhiệm |
| --- | --- |
| Tòa nhà data center, điện, làm mát, kiểm soát ra vào vật lý | AWS |
| Máy chủ, lưu trữ và thiết bị mạng | AWS |
| Region, Availability Zone và mạng toàn cầu | AWS |
| Hệ điều hành host và **hypervisor** | AWS |
| **Hệ điều hành guest**, gồm cập nhật và bản vá bảo mật | Khách hàng |
| Phần mềm và ứng dụng cài trên instance | Khách hàng |
| **Security group** (tường lửa của instance) và truy cập mạng | Khách hàng |
| Thông tin xác thực dùng để kết nối (ví dụ key pair) | Khách hàng |
| **IAM role** gắn vào instance và quyền của chúng | Khách hàng |
| Dữ liệu trên instance và các lựa chọn mã hóa | Khách hàng |

Trang shared responsibility của AWS liệt kê các việc chính của khách hàng với EC2: quản lý hệ điều hành guest gồm cập nhật và bản vá bảo mật, phần mềm bạn cài, firewall security group trên từng instance, và quyền IAM.

## Đọc bảng này khi làm bài thi

- "Thay ổ đĩa hỏng trong tủ rack" là **AWS**. Khách hàng không bao giờ thấy phần cứng.
- "Cài bản cập nhật bảo mật mới nhất cho instance Linux" là **khách hàng**. Công cụ như AWS Systems Manager Patch Manager có thể tự động hóa, nhưng trách nhiệm vẫn thuộc về bạn.
- "Chỉ mở cổng 443 cho load balancer" là **khách hàng**, thông qua security group.
- "Ngăn khách hàng khác đọc bộ nhớ instance của bạn" thuộc **lớp ảo hóa**, tức AWS.
- Nếu câu hỏi nói "host operating system" hoặc "hypervisor", hãy nghĩ đến AWS. Nếu nói "guest operating system", hãy nghĩ đến khách hàng.

## Bẫy: câu hỏi về VPC và mạng

Khách hàng **cấu hình** VPC của mình: dải địa chỉ, subnet, route table, security group và network ACL. AWS bảo vệ hạ tầng chạy dịch vụ VPC và mạng bên dưới. Vì vậy "bảo trì hoặc vận hành hạ tầng mạng hay dịch vụ bên dưới" là **AWS**, còn "cấu hình những gì bạn xây trên đó" là **khách hàng**. Khi danh sách đáp án có *dữ liệu của bạn*, bảo vệ và phân loại dữ liệu là đáp án khách hàng an toàn nhất. Và nếu câu hỏi hỏi khách hàng **luôn luôn** chịu trách nhiệm về gì, hãy chọn **dữ liệu** của khách hàng; mạng và khóa mã hóa là đáp án gây nhiễu, dù các lựa chọn mã hóa là quyết định của khách hàng.

## Ý chính

- IAM: AWS vận hành dịch vụ; khách hàng quản lý user, policy, MFA, access key và root user.
- EC2: AWS bảo mật phần cứng, cơ sở vật chất, hypervisor và hạ tầng toàn cầu.
- EC2: khách hàng quản lý guest OS và bản vá, ứng dụng, security group, IAM role của instance và dữ liệu.
- Host OS là AWS; guest OS là khách hàng.

## Nguồn

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Managing security responsibilities for Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/security.html)
- [What is IAM?](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)
