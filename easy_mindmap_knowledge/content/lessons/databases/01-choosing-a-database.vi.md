---
id: databases-choosing
title: "Chọn cơ sở dữ liệu: quan hệ hay phi quan hệ, được quản lý hay tự quản lý"
required: true
---
## Hai họ lớn

Phần lớn câu hỏi thi về cơ sở dữ liệu bắt đầu từ một quyết định: dữ liệu có hình dạng gì, và sẽ được đọc ra sao?

- **Cơ sở dữ liệu quan hệ (SQL)** lưu dữ liệu trong **các bảng có schema cố định** (hàng và cột). Các bảng liên kết với nhau bằng khóa, và bạn có thể **join** chúng trong các truy vấn phức tạp. Chúng hỗ trợ **giao dịch ACID**, nên một nhóm thay đổi hoặc cùng thành công, hoặc cùng thất bại. Phù hợp với: đơn hàng, thanh toán, tồn kho, hệ thống ERP và CRM.
- **Cơ sở dữ liệu phi quan hệ (NoSQL)** được xây cho **một mô hình dữ liệu cụ thể**, như key-value, document, graph hoặc time series. Schema linh hoạt, và chúng được thiết kế để mở rộng theo chiều ngang tới lượng yêu cầu rất lớn. Một số, như DynamoDB, cũng hỗ trợ giao dịch ACID, nhưng không hỗ trợ join. Phù hợp với: giỏ hàng, phiên người dùng, trạng thái game, danh mục sản phẩm, mạng quan hệ xã hội.

AWS gọi ý tưởng này là **cơ sở dữ liệu chuyên dụng (purpose-built databases)**: chọn engine có mô hình dữ liệu khớp với công việc.

## OLTP và OLAP

- **OLTP** (xử lý giao dịch trực tuyến): nhiều thao tác đọc và ghi nhỏ từ ứng dụng, như đặt một đơn hàng. Các cơ sở dữ liệu vận hành, quan hệ lẫn NoSQL, phục vụ OLTP.
- **OLAP** (xử lý phân tích trực tuyến): các truy vấn lớn trên nhiều dữ liệu lịch sử để làm báo cáo và phân tích kinh doanh (BI). Trên AWS, đây là việc của **kho dữ liệu (data warehouse)** Amazon Redshift.

## Tự quản lý trên EC2 hay dùng dịch vụ được quản lý

Bạn có thể tự cài bất kỳ database engine nào lên một **EC2 instance**. Bạn có toàn quyền kiểm soát, kể cả hệ điều hành, nhưng cũng phải gánh toàn bộ công việc. AWS khuyên dùng dịch vụ được quản lý như **Amazon RDS** làm lựa chọn mặc định cho hầu hết workload quan hệ.

| Công việc | Cơ sở dữ liệu trên EC2 | Amazon RDS |
| --- | --- | --- |
| Phần cứng, điện, mạng | AWS | AWS |
| Cài đặt và vá hệ điều hành | Khách hàng | AWS |
| Cài đặt và vá phần mềm cơ sở dữ liệu | Khách hàng | AWS |
| Sao lưu và tính sẵn sàng cao | Khách hàng | AWS |
| Co giãn | Khách hàng | AWS |
| Tối ưu truy vấn và thiết kế schema | Khách hàng | Khách hàng |

Hãy chọn EC2 khi bạn cần thứ mà dịch vụ được quản lý không cung cấp, như một engine hoặc phiên bản không được hỗ trợ, hoặc quyền truy cập hệ điều hành. Ngược lại, dịch vụ được quản lý gỡ bỏ cho bạn **những việc nặng nhọc không tạo khác biệt (undifferentiated heavy lifting)**.

## Bẫy thường gặp

- "Cần join và truy vấn SQL phức tạp giữa nhiều bảng" chỉ tới dịch vụ **quan hệ** (RDS hoặc Aurora).
- "Quy mô cực lớn với tra cứu theo khóa đơn giản và độ trễ mili giây một chữ số" chỉ tới **DynamoDB**.
- "Toàn quyền với hệ điều hành" hoặc "phần mềm cơ sở dữ liệu tùy biến" chỉ tới **cơ sở dữ liệu trên EC2**.
- Ngay cả với cơ sở dữ liệu được quản lý, **bạn** vẫn thiết kế schema, tối ưu truy vấn và kiểm soát ai được truy cập dữ liệu.

## Ý chính

- Quan hệ = bảng, schema cố định, join, giao dịch. NoSQL = linh hoạt, mô hình dữ liệu chuyên dụng, không có join (một số, như DynamoDB, vẫn có giao dịch).
- OLTP phục vụ ứng dụng; OLAP (Redshift) phục vụ phân tích.
- Dịch vụ được quản lý đảm nhận vá hệ điều hành và cơ sở dữ liệu, sao lưu, tính sẵn sàng và co giãn.
- Tự quản lý trên EC2 cho bạn quyền kiểm soát nhưng mọi việc vận hành cơ sở dữ liệu vẫn là của bạn.

## Nguồn

- [What is Amazon RDS?](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html)
- [Choosing an AWS database service](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)
