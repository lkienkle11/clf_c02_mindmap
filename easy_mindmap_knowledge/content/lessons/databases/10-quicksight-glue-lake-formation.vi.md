---
id: databases-quicksight-glue-lake-formation
title: "Chuẩn bị, quản trị và trực quan hóa dữ liệu: AWS Glue, AWS Lake Formation và Amazon QuickSight"
required: false
videoQuery: AWS Glue vs Lake Formation vs QuickSight data lake analytics pipeline explained
---
## Các dịch vụ này nằm ở đâu

Dữ liệu thô hiếm khi sẵn sàng để phân tích ngay. Một pipeline phân tích điển hình trên AWS trông như sau:

1. **Lưu** dữ liệu thô trong **Amazon S3**, thường dưới dạng **data lake**: một nơi tập trung cho dữ liệu có cấu trúc và không có cấu trúc.
2. **Chuẩn bị và lập danh mục** bằng **AWS Glue**.
3. **Bảo mật và quản trị** bằng **AWS Lake Formation**.
4. **Truy vấn** bằng Amazon Athena, Amazon Redshift hoặc Amazon EMR (bài trước).
5. **Trực quan hóa** kết quả bằng **Amazon QuickSight**.

## AWS Glue

**AWS Glue** là **dịch vụ tích hợp dữ liệu serverless**. Nó khám phá, chuẩn bị, di chuyển và kết hợp dữ liệu từ nhiều nguồn cho phân tích, học máy và phát triển ứng dụng, không có hạ tầng để quản lý và tính tiền theo mức dùng.

- **ETL (extract, transform, load)**: các job Glue đọc dữ liệu, làm sạch và định hình lại, rồi ghi vào đích như data lake trên S3. Job có thể chạy theo lịch, theo yêu cầu hoặc theo sự kiện. **AWS Glue Studio** là giao diện đồ họa để xây dựng và theo dõi job một cách trực quan.
- **AWS Glue Data Catalog**: kho metadata trung tâm ghi lại dữ liệu nằm ở đâu và các bảng, cột của nó trông như thế nào.
- **Crawler**: quét một kho dữ liệu như S3, suy ra schema và tự động thêm bảng vào Data Catalog.
- **AWS Glue DataBrew** là công cụ không cần viết mã liên quan, dùng để làm sạch và chuẩn hóa dữ liệu.

Athena, EMR và Redshift Spectrum có thể truy vấn các bảng đã đăng ký trong Data Catalog. Glue biến đổi dữ liệu để phân tích; nó không phải dịch vụ di chuyển một cơ sở dữ liệu đang chạy (đó là AWS DMS).

## AWS Lake Formation

**AWS Lake Formation** giúp bạn xây dựng và **quản trị, bảo mật** tập trung một data lake. Nó quản lý quyền truy cập chi tiết vào dữ liệu trong S3 và metadata của nó trong Glue Data Catalog.

- Quyền được cấp giống như trong cơ sở dữ liệu quan hệ (grant và revoke) và có thể giới hạn tới mức **cột, dòng và ô (cell)**.
- Cùng một bộ quy tắc được áp dụng xuyên suốt Athena, Amazon QuickSight, Redshift Spectrum, EMR và Glue, nên bạn chỉ cần định nghĩa một lần.
- Nó có thể nạp dữ liệu từ các cơ sở dữ liệu như loại chạy trên Amazon RDS, hỗ trợ chia sẻ giữa các tài khoản, và ghi lại truy cập trong log AWS CloudTrail để kiểm toán.

Lake Formation không thay thế S3. S3 chứa dữ liệu; Lake Formation quyết định ai được xem phần nào của nó.

## Amazon QuickSight

**Amazon QuickSight** là dịch vụ **business intelligence** của AWS: kết nối nguồn dữ liệu, xây dựng **dashboard** và biểu đồ tương tác, và nhúng phân tích vào ứng dụng.

- **SPICE** (Super-fast, Parallel, In-memory Calculation Engine) là engine in-memory của QuickSight. Khi bạn nhập dữ liệu vào SPICE thay vì chạy truy vấn trực tiếp, việc phân tích chạy nhanh hơn và dữ liệu có thể được dùng lại mà không phải truy vấn lại nguồn.
- Ghi chú về trạng thái: tài liệu AWS hiện mô tả **Amazon Quick**, một dịch vụ dựa trên AI phát triển từ QuickSight; **Amazon Quick Sight** tiếp tục là một tính năng bên trong nó, và các API, tích hợp QuickSight hiện có vẫn hoạt động. Đề thi vẫn dùng tên **Amazon QuickSight**.
- QuickSight tích hợp với Athena, nên kết quả truy vấn dễ dàng trở thành biểu đồ. Nó trực quan hóa dữ liệu; không thay thế kho dữ liệu hay engine truy vấn.

## Dịch vụ nào làm gì?

| Nhu cầu | Dịch vụ |
| --- | --- |
| Làm sạch và biến đổi dữ liệu (ETL), lập danh mục, crawl S3 để tìm schema | AWS Glue |
| Kiểm soát tập trung ai được xem cột và dòng nào của data lake | AWS Lake Formation |
| Chạy SQL trên dữ liệu S3 | Amazon Athena |
| Dashboard và báo cáo cho người dùng nghiệp vụ | Amazon QuickSight |

## Bẫy thường gặp

- "Xây dashboard trực quan cho người dùng nghiệp vụ" là **QuickSight**, không phải Redshift.
- "ETL serverless" hoặc "khám phá schema của dữ liệu trong S3" là **Glue**.
- "Quyền chi tiết trên data lake" là **Lake Formation**, không chỉ IAM.

## Ý chính

- Glue = ETL serverless, Data Catalog và crawler.
- Lake Formation = quản trị tập trung, chi tiết cho data lake (mức cột, dòng và ô).
- QuickSight = dashboard BI, với SPICE để phân tích in-memory nhanh; hiện là một phần của Amazon Quick.
- Phối hợp: S3 lưu, Glue chuẩn bị, Lake Formation bảo mật, Athena hoặc Redshift truy vấn, QuickSight hiển thị.

## Nguồn

- [What is Amazon Quick?](https://docs.aws.amazon.com/quicksight/latest/user/welcome.html)
- [What is AWS Glue?](https://docs.aws.amazon.com/glue/latest/dg/what-is-glue.html)
- [What is AWS Lake Formation?](https://docs.aws.amazon.com/lake-formation/latest/dg/what-is-lake-formation.html)
