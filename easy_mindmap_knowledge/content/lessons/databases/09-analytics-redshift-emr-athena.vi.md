---
id: databases-analytics-redshift-emr-athena
title: "So sánh các dịch vụ phân tích: Amazon Redshift, Amazon EMR và Amazon Athena"
required: true
videoQuery: Amazon Redshift vs Athena vs EMR which analytics service explained
---
## Từ giao dịch đến phân tích

Các cơ sở dữ liệu ứng dụng như RDS, Aurora và DynamoDB xử lý **OLTP**: rất nhiều thao tác đọc và ghi nhỏ, như đặt một đơn hàng. **Phân tích** (OLAP) đặt ra những câu hỏi khác: tổng hợp, xu hướng và so sánh trên hàng triệu dòng và nhiều năm lịch sử. Ba dịch vụ AWS thường xuyên xuất hiện khi câu hỏi là "dịch vụ nào phân tích dữ liệu này?". Chúng có phần chồng lấn, nên đề thi kiểm tra xem mỗi dịch vụ **giỏi nhất** ở việc gì.

## Amazon Redshift: kho dữ liệu (data warehouse)

**Amazon Redshift** là **kho dữ liệu quy mô petabyte** được quản lý hoàn toàn. Đó là một cơ sở dữ liệu quan hệ được tinh chỉnh cho truy vấn phân tích, dùng **SQL** từ các công cụ BI và báo cáo. Nó đạt tốc độ nhờ kết hợp **xử lý song song quy mô lớn (massively parallel processing)**, **lưu trữ dạng cột (columnar storage)** (dữ liệu lưu theo cột, nên truy vấn chỉ đọc các cột cần thiết) và nén dữ liệu.

- Kho dữ liệu gom dữ liệu từ nhiều nguồn, như hệ thống kho hàng, tài chính và bán hàng, về một định dạng chung và giữ lâu dài.
- Nó rất mạnh với **truy vấn phức tạp join nhiều bảng lớn**.
- Bạn có thể chạy **cluster provisioned** hoặc **Redshift Serverless**, tự cấp phát và co giãn năng lực, không tính phí phần tính toán khi nhàn rỗi (phần lưu trữ được quản lý vẫn bị tính phí).
- **Redshift Spectrum** cho phép Redshift truy vấn các tệp trong Amazon S3 mà không cần nạp vào bảng.

Redshift **không phải** cơ sở dữ liệu phía sau một ứng dụng đang chạy. Đây là nơi bạn phân tích dữ liệu, không phải nơi từng đơn hàng của khách được ghi lại lần đầu.

## Amazon EMR: các framework dữ liệu lớn

**Amazon EMR** (trước đây gọi là Amazon Elastic MapReduce) là nền tảng được quản lý để chạy các framework dữ liệu lớn như **Apache Hadoop** và **Apache Spark**, cùng các công cụ như Hive, Presto và HBase, trên các cluster EC2 mà AWS cấu hình giúp bạn. EMR cũng có tùy chọn serverless.

- Chọn EMR khi bạn có **mã tùy biến** và tập dữ liệu cực lớn, hoặc cần các framework xử lý mã nguồn mở mới nhất, học máy, phân tích đồ thị hay biến đổi dữ liệu ở quy mô lớn.
- Bạn kiểm soát cấu hình cluster và phần mềm cài đặt, có thể đổi kích thước cluster, kết hợp On-Demand và Spot Instance, và giữ dữ liệu trong S3 để tắt cluster khi công việc xong.
- Giá phụ thuộc loại và số lượng EC2 instance cùng Region.

EMR linh hoạt nhất và cũng "thủ công" nhất trong ba dịch vụ.

## Amazon Athena: SQL trực tiếp trên S3

**Amazon Athena** là **dịch vụ truy vấn tương tác serverless**. Bạn trỏ nó tới dữ liệu trong **Amazon S3** (CSV, JSON, hoặc định dạng cột như Parquet và ORC), định nghĩa một bảng rồi chạy **SQL chuẩn** mà không cần tạo cluster hay nạp dữ liệu. Nó tích hợp với AWS Glue Data Catalog để lưu định nghĩa bảng.

- Lý tưởng cho **truy vấn ad hoc**, ví dụ tìm trong log web hoặc log ứng dụng lưu ở S3 để khắc phục sự cố.
- Bạn trả tiền theo lượng dữ liệu mỗi truy vấn **quét**. Nén dữ liệu và dùng định dạng cột như Parquet giúp giảm lượng quét và do đó giảm chi phí.

## Dịch vụ phân tích nào?

| Manh mối trong câu hỏi | Dịch vụ |
| --- | --- |
| Data warehouse; gom dữ liệu nhiều nguồn; join phức tạp trên lịch sử; báo cáo BI | Amazon Redshift |
| SQL ad hoc trên tệp trong S3; không cần máy chủ hay nạp dữ liệu; trả tiền theo truy vấn | Amazon Athena |
| Hadoop, Spark hoặc framework khác; mã tùy biến trên dữ liệu khổng lồ; kiểm soát cluster | Amazon EMR |
| Cơ sở dữ liệu ứng dụng đang chạy (OLTP) | RDS, Aurora hoặc DynamoDB, không phải ba dịch vụ này |

| | Redshift | Athena | EMR |
| --- | --- | --- | --- |
| Hạ tầng | Cluster provisioned hoặc Serverless | Serverless | Cluster bạn cấu hình (hoặc serverless) |
| Dữ liệu nằm ở đâu | Nạp vào kho (cộng S3 qua Spectrum) | Vẫn ở S3 | S3 hoặc hệ thống tệp riêng của cluster |
| Bạn viết | SQL | SQL | Mã và job (Spark, Hadoop...) |

Các dịch vụ cũng phối hợp được với nhau: Athena truy vấn được dữ liệu mà EMR đã xử lý, và Redshift Spectrum truy vấn được cùng dữ liệu S3 đó.

## Bẫy thường gặp

- "Data warehouse quy mô petabyte, không phải quản lý phần cứng" là **Redshift** (serverless nếu đề nhấn mạnh không có hạ tầng).
- "Truy vấn dữ liệu trong S3 bằng SQL mà không nạp vào" là **Athena**, không phải Redshift.
- "Chạy một job Spark hoặc Hadoop" là **EMR**.
- Athena và EMR xuất hiện như đáp án sai trong các câu hỏi về cơ sở dữ liệu PostgreSQL OLTP được quản lý; chúng là công cụ phân tích.

## Ý chính

- Redshift = data warehouse SQL cho OLAP trên dữ liệu lớn đã tổng hợp; dạng cột và xử lý song song quy mô lớn.
- Athena = SQL serverless trên S3, trả tiền theo dữ liệu quét.
- EMR = Hadoop, Spark và các framework liên quan được quản lý cho xử lý dữ liệu lớn tùy biến.
- Dịch vụ phân tích để phân tích dữ liệu; chúng không thay thế cơ sở dữ liệu giao dịch của ứng dụng.

## Nguồn

- [Amazon Redshift architecture](https://docs.aws.amazon.com/redshift/latest/dg/c_redshift_system_overview.html)
- [When should I use Athena?](https://docs.aws.amazon.com/athena/latest/ug/when-should-i-use-ate.html)
- [What is Amazon EMR?](https://docs.aws.amazon.com/emr/latest/ManagementGuide/emr-what-is-emr.html)
