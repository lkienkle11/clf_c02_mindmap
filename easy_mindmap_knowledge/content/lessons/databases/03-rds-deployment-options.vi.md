---
id: databases-rds-deployment-options
title: "Vận hành Amazon RDS: Multi-AZ, read replica, sao lưu, lưu trữ và ai quản lý gì"
required: true
videoQuery: Amazon RDS Multi-AZ vs read replicas backups and storage autoscaling explained
---
## Bạn chọn gì khi tạo một DB instance

Bài trước đã giới thiệu **Amazon RDS**. Bài này đi vào các quyết định đằng sau một **DB instance** đang chạy, vì câu hỏi thi thường mô tả một triệu chứng rồi hỏi tính năng RDS nào giải quyết nó.

- **Engine**: IBM Db2, MariaDB, Microsoft SQL Server, MySQL, Oracle Database hoặc PostgreSQL.
- **Instance class**: năng lực tính toán và bộ nhớ (general purpose, memory optimized, compute optimized hoặc burstable). Bạn có thể đổi sau này khi nhu cầu thay đổi.
- **Lưu trữ**: **General Purpose SSD** cho hầu hết workload, hoặc **Provisioned IOPS** cho cơ sở dữ liệu production nặng về I/O. Lưu trữ Magnetic đã bị deprecated.
- **Mạng**: DB instance chạy trong **VPC** của bạn, và security group quyết định ai được kết nối tới nó.

## Ai quản lý gì

RDS là dịch vụ được quản lý, nhưng mô hình trách nhiệm chia sẻ vẫn áp dụng.

| Công việc | Tự chạy trên EC2 | Amazon RDS |
| --- | --- | --- |
| Phần cứng, điện, làm mát | AWS | AWS |
| Cài đặt và vá hệ điều hành | Bạn | AWS |
| Cài đặt và vá phần mềm cơ sở dữ liệu | Bạn | AWS |
| Cơ chế sao lưu và sẵn sàng cao | Bạn | AWS |
| Tối ưu truy vấn và thiết kế schema | Bạn | Bạn |
| Ai được kết nối, và có mã hóa hay không | Bạn | Bạn |

"AWS cung cấp cơ chế" không có nghĩa là nó tự bật sẵn. **Bạn** chọn Multi-AZ, thời gian lưu giữ bản sao lưu và có mã hóa instance hay không. Mã hóa khi lưu trữ (encryption at rest) được đặt lúc tạo instance, dùng một khóa AWS KMS.

## Multi-AZ hay read replica

| | Multi-AZ DB instance | Multi-AZ DB cluster | Read replica |
| --- | --- | --- | --- |
| Mục tiêu | Sẵn sàng cao | Sẵn sàng cao cộng thêm năng lực đọc | Mở rộng khả năng đọc |
| Bản sao | Một standby ở AZ khác | Hai standby đọc được ở các AZ khác | DB instance chỉ đọc riêng |
| Sao chép | Đồng bộ | Bán đồng bộ | Bất đồng bộ |
| Phục vụ đọc | Không | Có | Có |
| Ở đâu | Cùng Region | Cùng Region | Cùng hoặc khác Region |
| Khi có sự cố | Tự động failover | Tự động failover sang một reader | Bạn nâng nó thành instance độc lập |

Sao chép đồng bộ có thể làm độ trễ ghi tăng nhẹ; đó là cái giá để không mất dữ liệu khi một AZ gặp sự cố. Read replica có thể chậm hơn bản chính, nên báo cáo chạy trên đó có thể thấy dữ liệu hơi cũ. Hai tính năng cũng kết hợp được: một bản chính Multi-AZ vẫn có thể có read replica. RDS không tự thêm hay bớt read replica.

## Sao lưu và snapshot

- **Sao lưu tự động** chạy trong backup window và cho phép khôi phục về bất kỳ thời điểm nào trong **thời gian lưu giữ**, đặt được từ 0 (tắt) đến 35 ngày. Instance tạo từ console mặc định là 7 ngày. Xóa instance cũng xóa các bản sao lưu tự động của nó, trừ khi bạn chọn giữ lại.
- **Snapshot thủ công** do bạn tạo khi muốn, tồn tại cho tới khi bạn xóa và vẫn còn sau khi instance bị xóa.
- Bản sao lưu được lưu trong Amazon S3, và RDS tính kèm dung lượng sao lưu bằng dung lượng cơ sở dữ liệu đã cấp phát ở mỗi Region.
- Khôi phục luôn tạo ra một DB instance **mới**, không ghi đè lên instance cũ.

## Storage autoscaling

Nếu bật **storage autoscaling** và đặt ngưỡng lưu trữ tối đa, RDS sẽ tăng dung lượng khi sắp hết chỗ trống, không có downtime. Nó chỉ tăng: dung lượng đã cấp phát không thể giảm lại. Nó không đổi instance class và không thêm read replica.

## Các tính năng liên quan

- **Amazon RDS Proxy** gom và chia sẻ kết nối cơ sở dữ liệu, để cơ sở dữ liệu không bị quá tải khi kết nối tăng đột biến. Nó cũng giữ các kết nối của ứng dụng trong lúc RDS failover sang standby.
- **Amazon RDS Custom** (chỉ Oracle và SQL Server) dành cho ứng dụng cũ hoặc đóng gói sẵn cần truy cập vào máy chủ cơ sở dữ liệu và hệ điều hành; bạn phải gánh thêm phần quản lý.

## Giá trong một đoạn

Bạn trả tiền theo giờ DB instance (on-demand hoặc reserved), dung lượng lưu trữ đã cấp phát, dung lượng sao lưu vượt phần miễn phí và chi phí truyền dữ liệu. Read replica được tính như mọi DB instance khác.

## Bẫy thường gặp

- "Chịu được sự cố một AZ với downtime tối thiểu" là **Multi-AZ**. "Giảm tải truy vấn báo cáo" là **read replica**.
- Standby của Multi-AZ DB **instance** không phục vụ được đọc; read replica không phải đích failover tự động.
- "Vá hệ điều hành của một RDS instance" là AWS; "vá hệ điều hành của cơ sở dữ liệu trên EC2" là bạn.
- Yêu cầu khôi phục trong vài phút chỉ về Multi-AZ, không phải snapshot hay mẫu CloudFormation.

## Ý chính

- Bạn chọn engine, instance class và lưu trữ; RDS lo vá hệ điều hành và cơ sở dữ liệu, sao lưu và phục hồi sau sự cố.
- Multi-AZ = sẵn sàng (standby đồng bộ, tự động failover); read replica = mở rộng đọc (bất đồng bộ, có thể khác Region).
- Sao lưu tự động cho phép khôi phục về một thời điểm trong tối đa 35 ngày; snapshot thủ công tồn tại tới khi bị xóa.
- Storage autoscaling chỉ tăng dung lượng; bạn vẫn sở hữu schema, việc tối ưu, kiểm soát truy cập và quyết định mã hóa.

## Nguồn

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Working with DB instance read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
- [Introduction to backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.html)
