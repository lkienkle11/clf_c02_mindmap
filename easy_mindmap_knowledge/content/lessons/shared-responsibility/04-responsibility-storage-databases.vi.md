---
id: shared-responsibility-responsibility-storage-databases
title: "Lưu trữ, cơ sở dữ liệu và serverless: ranh giới dịch chuyển thế nào"
required: true
---
## Thang trượt: càng được quản lý, AWS càng gánh nhiều

Hãy hình dung một thanh trượt. Ở một đầu, bạn tự chạy máy chủ và sở hữu gần như mọi thứ phía trên hypervisor. Ở đầu kia, bạn chỉ gọi một dịch vụ và AWS vận hành mọi thứ bên dưới code và dữ liệu của bạn. Thanh trượt chỉ dịch chuyển các lớp **vận hành**. **Dữ liệu**, **quyết định truy cập** và **lựa chọn mã hóa** của bạn luôn thuộc về bạn, ở mọi vị trí.

## Amazon S3

**Amazon S3** là dịch vụ trừu tượng hóa. AWS vận hành hạ tầng lưu trữ cùng các máy chủ phía sau, và chịu trách nhiệm giữ hạ tầng đó an toàn và bền vững. Tài liệu S3 liệt kê phần của khách hàng:

- Quản lý dữ liệu, gồm quyền sở hữu object và mã hóa.
- **Phân loại** tài sản dữ liệu.
- Quản lý truy cập bằng IAM role, bucket policy và các cài đặt khác.
- Bật các biện pháp phát hiện như AWS CloudTrail hoặc Amazon GuardDuty.

Bẫy thi: bucket bị công khai là lỗi cấu hình của khách hàng, không phải lỗi của AWS.

## Amazon EBS và snapshot

Volume **Amazon EBS** là ổ đĩa khối của các instance EC2. AWS sở hữu phần cứng lưu trữ và cơ sở vật chất. Vì volume gắn vào instance của bạn nên nội dung trên đó là của bạn: hệ thống tệp, dữ liệu, quyết định mã hóa volume, quy trình sao lưu và việc ai được dùng hoặc chia sẻ snapshot. Dù AWS vận hành phần cứng lưu trữ, nội dung trên ổ đĩa luôn là trách nhiệm của bạn.

## Amazon RDS

**Amazon RDS** là dịch vụ cơ sở dữ liệu được quản lý.

| Công việc | Ai chịu trách nhiệm |
| --- | --- |
| Phần cứng, cơ sở vật chất, host và cài đặt phần mềm cơ sở dữ liệu | AWS |
| Vá hệ điều hành và database engine | AWS (bạn chọn maintenance window) |
| Cơ chế sao lưu và failover | AWS cung cấp; bạn chọn dùng và cấu hình |
| User và quyền trong cơ sở dữ liệu | Khách hàng |
| Truy cập mạng (VPC và security group) | Khách hàng |
| Tham số, schema và truy vấn | Khách hàng |
| Lựa chọn mã hóa (khi lưu trữ, khi truyền) | Khách hàng |
| Bảo mật ở mức ứng dụng | Khách hàng |

Tài liệu RDS lưu ý rằng bạn chỉ cấu hình bảo mật cho các trường hợp sử dụng của mình, không phải cho các tiến trình do RDS quản lý như tạo bản sao lưu hay sao chép sang read replica. Tài liệu cũng liệt kê những kiểm soát bạn sở hữu: chạy trong VPC, IAM policy để quản lý tài nguyên RDS, security group để quyết định ai được kết nối, kết nối SSL/TLS, mã hóa instance và snapshot khi lưu trữ, và kiểm soát đăng nhập ở mức engine.

## Amazon DynamoDB

**Amazon DynamoDB** được trừu tượng hóa giống S3. Không có máy chủ, hệ điều hành hay phần mềm cơ sở dữ liệu nào để bạn vá. Bạn quyết định ai được đọc và ghi bảng (IAM policy), mức độ nhạy cảm của dữ liệu, cùng các lựa chọn mã hóa và sao lưu. Như với mọi dịch vụ, phần của bạn "được xác định bởi dịch vụ AWS bạn dùng", theo cách nói của tài liệu AWS.

## Lambda và serverless

Với runtime được quản lý của **AWS Lambda**, AWS cung cấp máy chủ, hệ điều hành và cập nhật runtime. Bạn sở hữu code của function, các thư viện đóng gói kèm và quyền IAM của function. Serverless không có nghĩa là "hết việc bảo mật"; nó chỉ có nghĩa công việc dịch lên tầng code và quyền.

## Container trên AWS Fargate

**AWS Fargate** chạy container mà bạn không phải quản lý máy chủ. Tài liệu AWS nêu rằng với Fargate bạn không phải bảo mật hạ tầng tính toán, và Fargate tự cấp phát và vá hạ tầng đó. Bạn vẫn chịu trách nhiệm về:

- Cấu hình mạng (VPC, network ACL, security group, route table).
- Mã hóa lưu trữ.
- **Container image** của bạn.
- Quyền IAM thông qua task role.

Nếu bạn chạy container trên các instance EC2, bạn còn phải bảo trì các instance đó, gồm AMI, việc vá và hardening, cùng ECS agent.

## Tóm tắt thanh trượt

| Dịch vụ | Công sức của khách hàng trên nền tảng | Khách hàng vẫn sở hữu |
| --- | --- | --- |
| EC2 | Cao: guest OS, bản vá, phần mềm | Dữ liệu, truy cập, lựa chọn mã hóa |
| RDS | Trung bình: cài đặt, user, mạng | Dữ liệu, truy cập, lựa chọn mã hóa |
| Fargate | Thấp hơn: image, task role, mạng | Dữ liệu, truy cập, lựa chọn mã hóa |
| Lambda, S3, DynamoDB | Thấp nhất: code và quyền, hoặc chính sách truy cập | Dữ liệu, truy cập, lựa chọn mã hóa |

## Ý chính

- Càng được quản lý, AWS càng gánh nhiều, nhưng không bao giờ gánh dữ liệu, kiểm soát truy cập hay quyết định mã hóa của bạn.
- S3: AWS vận hành hạ tầng; bạn kiểm soát truy cập, phân loại và mã hóa.
- RDS: AWS vá OS và engine; bạn lo user, quy tắc mạng và cài đặt.
- Fargate: AWS vá lớp tính toán; bạn sở hữu image, task role và mạng.
- Lambda: bạn sở hữu code, thư viện và quyền của function.

## Nguồn

- [Security in Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security.html)
- [Security in Amazon RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [Shared responsibility model for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/security-shared-model.html)
