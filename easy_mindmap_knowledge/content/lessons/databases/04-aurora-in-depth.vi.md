---
id: databases-aurora-in-depth
title: "Amazon Aurora chuyên sâu: lưu trữ dùng chung, replica, Serverless, Global Database và Aurora so với RDS"
required: true
videoQuery: Amazon Aurora architecture Serverless Global Database vs RDS explained
---
## Điều làm Aurora khác biệt

**Amazon Aurora** là cơ sở dữ liệu quan hệ được quản lý hoàn toàn do AWS xây dựng, cung cấp qua console và API của Amazon RDS. Nó có phiên bản **tương thích MySQL** và **tương thích PostgreSQL**, nên mã nguồn, driver và công cụ hiện có hoạt động với rất ít hoặc không cần thay đổi. AWS định vị Aurora là độ tin cậy ở cấp thương mại với chi phí hiệu quả như cơ sở dữ liệu mã nguồn mở.

Ý tưởng cốt lõi là Aurora **tách tính toán khỏi lưu trữ**.

- **Tính toán**: một **DB cluster** có một instance **writer** và tối đa **15 Aurora Replica** (reader).
- **Lưu trữ**: một **cluster volume** dùng chung trên ổ SSD. Nó giữ **sáu bản sao dữ liệu trên ba Availability Zone**, kể cả khi cluster chỉ có một instance.

Vì mọi instance cùng gắn vào một volume, thêm replica không phải sao chép dữ liệu, và replica có thể thay thế nhanh khi writer gặp sự cố. Aurora tự động failover, và bạn có thể đặt mức ưu tiên failover cho từng replica. Dung lượng lưu trữ **tự động tăng** khi dữ liệu tăng, và bạn chỉ trả tiền cho phần thực sự dùng.

## Endpoint và sao lưu

- **Cluster endpoint** luôn trỏ tới writer; **reader endpoint** phân bổ các kết nối đọc tới các replica.
- Sao lưu **liên tục và tăng dần**, lưu trong Amazon S3, với thời gian lưu giữ từ 1 đến 35 ngày. Chúng không ảnh hưởng hiệu năng, và bạn không thể tắt chúng. **Snapshot** do bạn tự tạo không hết hạn.
- **Cloning** tạo một cluster mới, ban đầu dùng gần như không thêm dung lượng vì dữ liệu chỉ được sao chép khi có thay đổi.

## Aurora Serverless

Năng lực của Aurora **serverless** tự điều chỉnh theo tải. Bạn đặt mức tối thiểu và tối đa theo **Aurora capacity unit (ACU)**; một ACU xấp xỉ 2 GiB bộ nhớ cùng CPU và mạng tương ứng. Aurora co giãn theo bước nhỏ tới 0,5 ACU mà không ngắt kết nối của client, và chi phí tính theo năng lực đã dùng, đo từng giây. Ở các phiên bản engine gần đây, mức tối thiểu có thể là 0: cơ sở dữ liệu nhàn rỗi sẽ tạm dừng và phí tính toán ngừng tính (dung lượng lưu trữ vẫn bị tính phí).

Hãy chọn nó cho workload **biến động hoặc khó đoán**, ứng dụng mới chưa biết quy mô, và cơ sở dữ liệu phát triển/kiểm thử. Workload ổn định, dự đoán được phù hợp với cluster **provisioned**. Đề thi có thể ghi "Aurora Serverless". Tài liệu AWS hiện gọi tính năng hiện tại đơn giản là Aurora serverless, còn kiến trúc Serverless v1 cũ đã bị deprecated.

## Aurora Global Database

Một **Aurora global database** trải trên nhiều Region: một **Region chính** nhận mọi thao tác ghi, và tối đa **10 Region phụ chỉ đọc** nhận dữ liệu qua lớp lưu trữ, với độ trễ sao chép thường dưới một giây. Dùng nó cho:

- **Đọc tại chỗ** cho người dùng khắp thế giới.
- **Khôi phục thảm họa**: nếu Region chính gặp sự cố, bạn có thể nhanh chóng failover sang một Region phụ.

Điều này khác với **cross-Region read replica** của RDS, vốn là các DB instance riêng được cập nhật bằng sao chép bất đồng bộ ở cấp engine.

## Aurora hay RDS?

| | Amazon RDS | Amazon Aurora |
| --- | --- | --- |
| Engine | Db2, MariaDB, SQL Server, MySQL, Oracle, PostgreSQL | Tương thích MySQL, tương thích PostgreSQL |
| Lưu trữ | Volume cho instance của bạn; bạn chọn loại và dung lượng | Cluster volume dùng chung trên 3 AZ, tự tăng |
| Mở rộng đọc | Read replica, mỗi cái có lưu trữ riêng | Tối đa 15 Aurora Replica trên volume dùng chung |
| Sẵn sàng | Standby Multi-AZ | Failover sang một Aurora Replica |
| Sao lưu | 0 đến 35 ngày; có thể tắt | Liên tục, 1 đến 35 ngày; không thể tắt |
| Nhiều Region | Cross-Region read replica | Aurora Global Database |
| Tùy chọn serverless | Không | Có |

Quy tắc đơn giản cho cách diễn đạt trong đề: câu hỏi nêu tên **Oracle, SQL Server, Db2 hoặc MariaDB**, hoặc chỉ cần một cơ sở dữ liệu quan hệ được quản lý thông thường, thì chỉ về **RDS**. Câu hỏi mô tả một dịch vụ **tương thích MySQL và PostgreSQL**, có lưu trữ trên ba AZ, tối đa 15 replica, tùy chọn serverless hoặc phạm vi toàn cầu, thì chỉ về **Aurora**. Khi câu hỏi chỉ cần một cơ sở dữ liệu MySQL hoặc PostgreSQL được quản lý, cả RDS và Aurora đều đáp ứng, và câu hỏi chọn hai đáp án có thể liệt kê cả hai.

## Giá trong tóm tắt

Aurora tính tiền theo mức dùng: dùng instance (hoặc ACU) cộng dung lượng lưu trữ bạn dùng, cộng dung lượng sao lưu. Nó có hai cấu hình lưu trữ. **Aurora Standard** còn tính phí theo mỗi triệu yêu cầu I/O và hợp với I/O vừa phải. **Aurora I/O-Optimized** không tính phí theo I/O và AWS khuyên dùng khi I/O chiếm khoảng 25% trở lên chi phí Aurora của bạn.

## Bẫy thường gặp

- "Lưu trữ sao chép trên ba AZ, tương thích MySQL hoặc PostgreSQL" là **Aurora**, không phải DynamoDB hay Redshift.
- "Workload khó đoán, không muốn lập kế hoạch dung lượng, quan hệ" là **Aurora serverless**; "key-value khó đoán" là DynamoDB on-demand.
- Aurora Replica cải thiện việc đọc và tính sẵn sàng; muốn có bản sao ở Region khác cần **Global Database**.

## Ý chính

- Aurora = engine tương thích MySQL/PostgreSQL với cluster volume dùng chung (sáu bản sao, ba AZ) tự lớn lên.
- Một writer cộng tối đa 15 Aurora Replica; tự động failover sang replica.
- Serverless co giãn ACU cho workload biến động; Global Database thêm các Region phụ chỉ đọc và khôi phục nhanh theo Region.
- Chọn RDS cho engine khác hoặc nhu cầu đơn giản, Aurora cho tính sẵn sàng và quy mô cao với MySQL hoặc PostgreSQL.

## Nguồn

- [Amazon Aurora storage](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.StorageReliability.html)
- [How Aurora serverless works](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.how-it-works.html)
- [Using Amazon Aurora Global Database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html)
