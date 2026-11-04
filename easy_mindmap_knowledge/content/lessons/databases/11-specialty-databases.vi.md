---
id: databases-specialty-databases
title: "Cơ sở dữ liệu chuyên dụng: DocumentDB, Neptune, Timestream và QLDB"
required: false
videoQuery: Amazon DocumentDB Neptune Timestream QLDB purpose-built databases explained
---
## Không có một giải pháp cho mọi nhu cầu

AWS cung cấp các **cơ sở dữ liệu chuyên dụng (purpose-built)**, mỗi loại được thiết kế quanh một mô hình dữ liệu. Các bài trước đã nói về dịch vụ quan hệ (RDS, Aurora), key-value (DynamoDB), in-memory (ElastiCache, MemoryDB) và kho dữ liệu (Redshift). Bài này thêm bốn dịch vụ nữa, và nhắc lại **Amazon Keyspaces** (tương thích Cassandra, wide-column) cùng **AWS DMS** (di chuyển cơ sở dữ liệu) ở bài "specialized and migration" trước đó.

## Amazon DocumentDB (with MongoDB compatibility)

**Amazon DocumentDB** là **cơ sở dữ liệu document** được quản lý hoàn toàn cho dữ liệu dạng JSON. Nó **tương thích MongoDB**, nên ứng dụng tiếp tục dùng cùng driver và công cụ. Đây là một dịch vụ AWS riêng, không phải chính MongoDB.

- Lưu trữ của nó giữ **sáu bản sao dữ liệu trên ba Availability Zone** và tự động lớn lên.
- Một cluster có một instance chính và tối đa **15 replica** dùng chung lưu trữ; failover tự động chuyển sang một replica.
- Sao lưu liên tục cho phép khôi phục về một thời điểm trong tối đa 35 ngày.
- Cách dùng điển hình: quản lý nội dung, danh mục sản phẩm và hồ sơ người dùng, nơi mỗi bản ghi là một document linh hoạt.

## Amazon Neptune

**Amazon Neptune** là **cơ sở dữ liệu đồ thị (graph)** được quản lý hoàn toàn cho **dữ liệu kết nối dày đặc**. Nó lưu hàng tỷ mối quan hệ và truy vấn chúng trong vài mili giây, dùng các ngôn ngữ đồ thị **Gremlin**, **openCypher** và **SPARQL**.

- Cách dùng điển hình: **phát hiện gian lận**, hệ thống gợi ý, knowledge graph và bảo mật mạng.
- Nó cũng có tối đa 15 read replica và sao chép giữa các Availability Zone.
- Từ khóa gợi ý: "mối quan hệ", "kết nối giữa người hoặc tài khoản", "bạn của bạn", "mạng lưới gian lận".

Join quan hệ qua các mối quan hệ sâu thì chậm và phức tạp; cơ sở dữ liệu đồ thị được xây đúng cho loại câu hỏi đó.

## Amazon Timestream

**Amazon Timestream** là **cơ sở dữ liệu chuỗi thời gian (time series)** chuyên dụng cho các điểm dữ liệu được đánh chỉ mục theo thời gian, như số đo cảm biến IoT, metric ứng dụng và dữ liệu đo từ xa công nghiệp.

- Timestream for LiveAnalytics là **serverless**, giữ dữ liệu gần đây trong memory store và dữ liệu cũ hơn trong magnetic store rẻ hơn, và cung cấp SQL với các hàm chuỗi thời gian dựng sẵn.
- Trạng thái: AWS đã **đóng Timestream for LiveAnalytics với khách hàng mới từ 20/06/2025**; workload hiện có không bị ảnh hưởng, và AWS khuyên khách hàng mới cân nhắc **Amazon Timestream for InfluxDB**. Đề thi vẫn chỉ ghi "Amazon Timestream" cho dữ liệu chuỗi thời gian.

## Amazon QLDB (Amazon Quantum Ledger Database)

**Amazon QLDB** là **cơ sở dữ liệu sổ cái (ledger)**: cơ sở dữ liệu serverless, được quản lý hoàn toàn, có **nhật ký giao dịch (journal) bất biến và xác minh được bằng mật mã**, nên bản ghi không thể bị âm thầm sửa hoặc xóa. Nó được thiết kế cho các hệ thống ghi nhận gốc cần một lịch sử đầy đủ, đáng tin cậy về mọi thay đổi.

- Trạng thái: tài liệu AWS nêu rằng khách hàng hiện có chỉ dùng được QLDB [đến khi hết hỗ trợ vào ngày 31/07/2025](https://docs.aws.amazon.com/prescriptive-guidance/latest/modern-data-centric-use-cases/data-preparation-cleaning.html), và AWS đã công bố hướng dẫn di chuyển một ledger QLDB sang **Amazon Aurora PostgreSQL**. Mốc đó đã qua, nên đừng lên kế hoạch thiết kế mới dựa trên QLDB. Câu hỏi thi vẫn có thể mô tả "cơ sở dữ liệu ledger" hoặc "lịch sử bất biến, xác minh được" và mong đợi khái niệm QLDB.

## Cơ sở dữ liệu nào cho workload nào?

| Workload | Dịch vụ |
| --- | --- |
| Dữ liệu quan hệ, join, giao dịch ACID | Amazon RDS hoặc Amazon Aurora |
| Key-value hoặc document ở quy mô lớn, một chữ số mili giây | Amazon DynamoDB |
| Document JSON tương thích MongoDB | Amazon DocumentDB |
| Dữ liệu kết nối dày đặc, mối quan hệ, phát hiện gian lận | Amazon Neptune |
| Chuỗi thời gian: IoT, metric, dữ liệu đo từ xa | Amazon Timestream |
| Ghi nhận bất biến, xác minh được các thay đổi (ledger) | Amazon QLDB (đã hết hỗ trợ; xem trạng thái) |
| Wide-column tương thích Cassandra | Amazon Keyspaces |
| Caching hoặc dữ liệu in-memory bền vững | Amazon ElastiCache, Amazon MemoryDB |
| Phân tích dữ liệu lịch sử lớn | Amazon Redshift |

## Bẫy thường gặp

- Câu hỏi về đồ thị chỉ về Neptune, dù Aurora hay DynamoDB có thể lưu dữ liệu quan hệ theo cách kém tự nhiên hơn.
- "Tương thích MongoDB" là **DocumentDB**; DynamoDB cũng là kho document nhưng không tương thích MongoDB.
- "Chuỗi thời gian" là **Timestream**, không phải Forecast (dịch vụ học máy) hay cơ sở dữ liệu quan hệ.

## Ý chính

- DocumentDB = document tương thích MongoDB; Neptune = đồ thị; Timestream = chuỗi thời gian; QLDB = sổ cái bất biến.
- DocumentDB và Neptune dùng lưu trữ chung giữa các AZ với tối đa 15 replica.
- Timestream for LiveAnalytics đã đóng với khách hàng mới (InfluxDB là lựa chọn thay thế); QLDB hết hỗ trợ vào 31/07/2025.
- Hãy khớp mô hình dữ liệu với dịch vụ; từ khóa trong câu hỏi thường đã nêu tên nó.

## Nguồn

- [What is Amazon DocumentDB (with MongoDB compatibility)?](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html)
- [What is Amazon Neptune?](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html)
- [Amazon Timestream for LiveAnalytics availability change](https://docs.aws.amazon.com/timestream/latest/developerguide/AmazonTimestreamForLiveAnalytics-availability-change.html)
