---
id: databases-specialized-migration
title: "Kho dữ liệu, cơ sở dữ liệu chuyên dụng và di chuyển cơ sở dữ liệu"
required: true
---
## Amazon Redshift: kho dữ liệu

**Amazon Redshift** là một **kho dữ liệu (data warehouse)** được quản lý hoàn toàn, quy mô petabyte. Nó chạy **phân tích bằng SQL (OLAP)** trên lượng dữ liệu lớn, thường được nạp từ nhiều nguồn, và làm việc với các công cụ phân tích kinh doanh (BI). **Redshift Serverless** tự co giãn năng lực, và bạn không trả tiền cho phần tính toán khi không có truy vấn nào chạy (phần lưu trữ được quản lý vẫn bị tính phí).

Redshift không thay thế cơ sở dữ liệu giao dịch của ứng dụng. Nếu câu hỏi nói "phân tích dữ liệu bán hàng nhiều năm" hoặc "báo cáo kinh doanh từ nhiều nguồn", hãy nghĩ tới Redshift. Nếu nói "lưu từng đơn hàng của khách ngay khi phát sinh", hãy nghĩ tới RDS, Aurora hoặc DynamoDB.

## Các cơ sở dữ liệu chuyên dụng khác

- **Amazon DocumentDB (with MongoDB compatibility)**: cơ sở dữ liệu **document** được quản lý cho dữ liệu dạng JSON. Các nhóm có thể tiếp tục dùng driver và công cụ của MongoDB. Cách dùng điển hình: danh mục nội dung và sản phẩm, hồ sơ người dùng.
- **Amazon Neptune**: cơ sở dữ liệu **graph** được quản lý cho dữ liệu liên kết chặt chẽ. Nó trả lời các câu hỏi về mối quan hệ, như "bạn của bạn" trong mạng xã hội, đường dây gian lận, gợi ý sản phẩm và knowledge graph.
- **Amazon Timestream**: dữ liệu **chuỗi thời gian (time series)**, như số đo cảm biến IoT và chỉ số ứng dụng. Lưu ý rằng Timestream for LiveAnalytics đã ngừng nhận khách hàng mới từ tháng 6 năm 2025; AWS hướng người dùng mới tới **Timestream for InfluxDB**.
- **Amazon Keyspaces (for Apache Cassandra)**: cơ sở dữ liệu **wide-column** được quản lý cho các workload Cassandra.

## Tình huống này dùng cơ sở dữ liệu nào?

| Dấu hiệu trong tình huống | Dịch vụ |
| --- | --- |
| Quan hệ, join, engine quen thuộc như SQL Server hoặc Oracle | Amazon RDS |
| Tương thích MySQL hoặc PostgreSQL, tính sẵn sàng cao có sẵn trong lớp lưu trữ | Amazon Aurora |
| Key-value serverless, mọi quy mô, mili giây một chữ số | Amazon DynamoDB |
| Cache in-memory để tăng tốc đọc | Amazon ElastiCache |
| Phân tích và báo cáo trên tập dữ liệu lớn | Amazon Redshift |
| Document JSON tương thích MongoDB | Amazon DocumentDB |
| Mối quan hệ giữa các đối tượng, dữ liệu liên kết chặt chẽ (graph) | Amazon Neptune |

## Chuyển cơ sở dữ liệu lên AWS

- **AWS Database Migration Service (AWS DMS)** chuyển dữ liệu từ một cơ sở dữ liệu nguồn tới một đích trên AWS. **Nguồn vẫn hoạt động đầy đủ** trong lúc di chuyển, nhờ đó thời gian gián đoạn thấp. DMS có thể nạp một lần hoặc **tiếp tục sao chép các thay đổi đang diễn ra** cho tới khi bạn chuyển hẳn sang đích. Nó hỗ trợ di chuyển **đồng nhất (homogeneous)** (Oracle sang Oracle) và **không đồng nhất (heterogeneous)** (Oracle sang Aurora PostgreSQL).
- Với di chuyển không đồng nhất, **schema và code** (bảng, view, stored procedure) phải được chuyển đổi trước. **DMS Schema Conversion** làm việc này ngay trong DMS, còn **AWS Schema Conversion Tool (AWS SCT)** tải về làm điều tương tự trên máy tính của bạn.

## Bẫy thường gặp

- "Chuyển đổi schema từ engine này sang engine khác" là **SCT hoặc DMS Schema Conversion**; "chuyển dữ liệu" là **DMS**.
- "Kho dữ liệu (data warehouse)" luôn là **Redshift**, không phải RDS.

## Ý chính

- Redshift = kho dữ liệu OLAP; RDS, Aurora và DynamoDB = OLTP.
- DocumentDB = document, Neptune = graph, Timestream = chuỗi thời gian, Keyspaces = Cassandra.
- DMS di chuyển dữ liệu với gián đoạn tối thiểu; SCT hoặc DMS Schema Conversion chuyển đổi schema.

## Nguồn

- [What is Amazon Redshift?](https://docs.aws.amazon.com/redshift/latest/mgmt/welcome.html)
- [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)
- [What is AWS Database Migration Service?](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
