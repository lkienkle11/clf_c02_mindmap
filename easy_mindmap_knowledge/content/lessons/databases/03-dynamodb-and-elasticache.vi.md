---
id: databases-dynamodb-elasticache
title: "NoSQL và in-memory: Amazon DynamoDB và Amazon ElastiCache"
required: true
---
## Amazon DynamoDB

**Amazon DynamoDB** là một **cơ sở dữ liệu NoSQL serverless, được quản lý hoàn toàn**. Nó hỗ trợ dữ liệu **key-value và document** và cho hiệu năng **mili giây một chữ số** ở mọi quy mô.

- **Serverless**: không có máy chủ nào để cấp phát, vá hay quản lý, và không có maintenance window.
- Bạn tạo các **bảng (table)**; mỗi item được tìm theo **khóa chính (primary key)**. DynamoDB không có join kiểu SQL, nên bạn thiết kế dữ liệu theo cách ứng dụng đọc nó.
- Dữ liệu mặc định được **sao chép trên ba Availability Zone** trong một Region, và mặc định được **mã hóa khi lưu trữ (at rest)**.
- **Point-in-time recovery** và **sao lưu theo yêu cầu (on-demand backup)** bảo vệ trước các lỗi như vô tình xóa dữ liệu.

## Chế độ năng lực (capacity mode)

| Chế độ | Cách trả tiền | Phù hợp nhất với |
| --- | --- | --- |
| On-demand (mặc định) | Theo từng yêu cầu đọc và ghi | Lưu lượng mới, đột biến hoặc khó đoán; không cần lập kế hoạch năng lực |
| Provisioned | Theo số lần đọc và ghi mỗi giây bạn đặt, dù dùng hay không | Lưu lượng ổn định, dự đoán được |

AWS khuyên dùng **on-demand** cho hầu hết workload. Chế độ provisioned có thể kết hợp với auto scaling.

## DAX và global tables

- **DynamoDB Accelerator (DAX)** là **bộ nhớ đệm (cache) in-memory được quản lý hoàn toàn, xây riêng cho DynamoDB**. Nó giảm thời gian phản hồi khi đọc từ mili giây xuống **micro giây** mà bạn không phải tự quản lý logic cache.
- **Global tables** sao chép một bảng sang các Region bạn chọn. Mọi bản sao đều nhận **cả đọc và ghi** (multi-active), mang lại hiệu năng tại chỗ cho người dùng khắp thế giới và khả năng chịu lỗi cấp Region.

## Amazon ElastiCache

**Amazon ElastiCache** là một **kho dữ liệu in-memory và bộ nhớ đệm** được quản lý. Nó hỗ trợ các engine **Valkey, Redis OSS và Memcached**. Cách dùng thường gặp:

- **Cache** kết quả các truy vấn cơ sở dữ liệu hay dùng để giảm tải cho cơ sở dữ liệu và tăng tốc đọc.
- Lưu **phiên người dùng (session)**, bảng xếp hạng và các dữ liệu khác cần truy cập rất nhanh.

Bạn có thể chạy nó ở dạng **serverless** (ElastiCache tự co giãn năng lực) hoặc **cluster dựa trên node**, nơi bạn chọn loại và số lượng node. AWS lo việc cấp phát phần cứng, giám sát, thay node và vá phần mềm.

Cache nằm **bên cạnh** cơ sở dữ liệu; thường nó không phải là nơi lưu bản gốc của dữ liệu. Nếu cần một cơ sở dữ liệu chính in-memory có độ bền, AWS có **Amazon MemoryDB**.

## Bẫy thường gặp

- "NoSQL serverless, mili giây một chữ số, mọi quy mô" là **DynamoDB**.
- "Đọc ở mức micro giây cho một bảng DynamoDB" là **DAX**; "cache cho một cơ sở dữ liệu RDS" là **ElastiCache**.
- "Người dùng ở nhiều Region phải ghi vào cùng một bảng" là **DynamoDB global tables**.
- "Lưu lượng khó đoán, không lập kế hoạch năng lực" là chế độ **on-demand**.

## Ý chính

- DynamoDB: cơ sở dữ liệu key-value và document serverless với hiệu năng nhanh, ổn định.
- On-demand là mặc định và hợp với lưu lượng chưa rõ; provisioned hợp với lưu lượng ổn định.
- DAX làm cache cho DynamoDB; global tables sao chép qua nhiều Region.
- ElastiCache (Valkey, Redis OSS, Memcached) cache dữ liệu trong bộ nhớ để giảm tải cho cơ sở dữ liệu.

## Nguồn

- [What is Amazon DynamoDB?](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
- [DynamoDB throughput capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html)
- [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
