---
id: databases-rds-aurora
title: "Cơ sở dữ liệu quan hệ: Amazon RDS và Amazon Aurora"
required: true
---
## Amazon RDS

**Amazon Relational Database Service (RDS)** chạy một cơ sở dữ liệu quan hệ cho bạn. Bạn chọn một engine quen thuộc: **MySQL, PostgreSQL, MariaDB, Oracle, Microsoft SQL Server hoặc IBM Db2**. Bạn chọn instance class cho năng lực tính toán và bộ nhớ, và dung lượng lưu trữ cho dữ liệu.

RDS đảm nhận các việc thường ngày: cấp phát, vá hệ điều hành và cơ sở dữ liệu, sao lưu, phát hiện sự cố và khôi phục. Bạn vẫn sở hữu schema, việc tối ưu truy vấn, người dùng cơ sở dữ liệu và quyền truy cập mạng (ví dụ **security group** của DB instance).

## Sao lưu

- **Sao lưu tự động (automated backups)**: RDS sao lưu toàn bộ DB instance trong **backup window** của nó và giữ bản sao lưu trong **thời gian lưu giữ (retention period)** bạn đặt (tối đa 35 ngày). Bạn có thể khôi phục về **bất kỳ thời điểm nào** trong khoảng đó.
- **Snapshot thủ công**: bạn tự tạo khi muốn, và chúng tồn tại cho tới khi bạn xóa, kể cả sau khi DB instance đã bị xóa.

## Multi-AZ hay read replica

Cặp này là một bẫy thi kinh điển.

| Đặc điểm | Multi-AZ DB instance | Read replica |
| --- | --- | --- |
| Mục tiêu chính | Sẵn sàng cao và chuyển đổi dự phòng (failover) | Mở rộng khả năng đọc |
| Bản sao là | Standby ở một AZ khác | Bản sao chỉ đọc (cùng hoặc khác Region) |
| Sao chép | Đồng bộ | Bất đồng bộ |
| Phục vụ đọc? | Không, standby chỉ chờ | Có |
| Khi có sự cố | Tự động failover sang standby | Bạn có thể nâng nó thành DB độc lập |

Multi-AZ cũng giảm tác động của việc bảo trì hệ điều hành: RDS vá standby trước, rồi mới failover. RDS còn có Multi-AZ **DB cluster** với các reader instance phục vụ được việc đọc, nhưng ý thi kinh điển là: **sẵn sàng = Multi-AZ, hiệu năng đọc = read replica**.

## Maintenance window

Mỗi DB instance có một **maintenance window** (khung giờ bảo trì) hằng tuần mà **bạn** có thể chọn. AWS áp dụng các bản vá bắt buộc trong khung giờ đó, nên hãy chọn lúc ít truy cập.

## Amazon Aurora

**Amazon Aurora** là một engine quan hệ do AWS xây dựng và được quản lý qua RDS. Nó **tương thích với MySQL và PostgreSQL**, nên các công cụ hiện có vẫn dùng được.

- Lưu trữ của nó là một **cluster volume** dùng chung, có các bản sao dữ liệu trên **ba Availability Zone**, và **tự động lớn lên** khi dữ liệu tăng.
- **Aurora Replica** đọc từ cùng lớp lưu trữ dùng chung và có thể thay thế khi writer gặp sự cố.
- **Aurora Serverless** tự động điều chỉnh năng lực cơ sở dữ liệu cho workload biến động hoặc khó đoán.
- **Aurora Global Database** trải trên nhiều Region: một Region chính để ghi và các Region phụ chỉ đọc để đọc nhanh tại chỗ và khôi phục sau thảm họa.

## Bẫy thường gặp

- "Chịu được sự cố một AZ với failover tự động" là **Multi-AZ**, không phải read replica.
- "Truy vấn báo cáo làm chậm cơ sở dữ liệu production" là **read replica**.
- "Tương thích MySQL hoặc PostgreSQL với lưu trữ sao chép trên ba AZ" là **Aurora**.

## Ý chính

- RDS = cơ sở dữ liệu quan hệ được quản lý với sáu lựa chọn engine.
- Sao lưu tự động cho phép khôi phục về một thời điểm bất kỳ trong thời gian lưu giữ.
- Multi-AZ cho tính sẵn sàng; read replica cho việc đọc.
- Aurora: tương thích MySQL/PostgreSQL, lưu trữ trên ba AZ, có lựa chọn Serverless và Global.

## Nguồn

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Working with DB instance read replicas](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html)
- [What is Amazon Aurora?](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/CHAP_AuroraOverview.html)
