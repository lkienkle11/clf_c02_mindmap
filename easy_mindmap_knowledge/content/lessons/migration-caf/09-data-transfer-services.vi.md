---
id: migration-caf-data-transfer-services
title: "Chuyển dữ liệu và database: DataSync, DMS và chuyển đổi schema"
required: false
---
## Máy chủ, tệp và database là các việc khác nhau

Application Migration Service sao chép cả máy chủ. Tệp và database có công cụ riêng, và câu thi kiểm tra xem bạn có chọn đúng không.

## AWS DataSync

**AWS DataSync** chuyển **dữ liệu dạng tệp hoặc đối tượng** qua mạng, nhanh và an toàn, giữa các hệ thống lưu trữ và dịch vụ lưu trữ của AWS.

- Nguồn gồm **NFS**, **SMB**, Hadoop (HDFS) và lưu trữ đối tượng on-premises, cùng lưu trữ ở một số đám mây khác.
- Đích gồm **Amazon S3**, **Amazon EFS** và một số hệ thống tệp **Amazon FSx**. Nó cũng sao chép được giữa các dịch vụ lưu trữ AWS.
- Với nguồn on-premises, bạn triển khai **agent** DataSync; dữ liệu được mã hóa và kiểm tra bằng **xác thực toàn vẹn dữ liệu (data integrity validation)**, nên đến nơi nguyên vẹn.
- Dùng cho di chuyển một lần hàng triệu tệp, sao chép định kỳ và lưu trữ dữ liệu lạnh.
- Giá: tính theo gigabyte dữ liệu được sao chép, cộng phí thông thường cho phần lưu trữ bạn dùng.

**Lựa chọn ngoại tuyến:** khi mạng quá chậm hoặc không có, các thiết bị vật lý của họ AWS Snow được gửi đến tận nơi để chuyển dữ liệu offline. Snowball Edge không còn dành cho khách hàng mới, và AWS hướng khách hàng mới đến DataSync hoặc AWS Data Transfer Terminal; các trang của AWS nêu ngày hết hỗ trợ khác nhau, nên hãy xem bài Snow Family trong chủ đề lưu trữ.

## AWS Database Migration Service (AWS DMS)

**AWS DMS** chuyển **database và các kho dữ liệu khác** lên AWS với thời gian gián đoạn tối thiểu. Database nguồn vẫn hoạt động trong lúc di chuyển, và DMS có thể tiếp tục sao chép các thay đổi cho đến khi bạn chuyển hẳn.

- Di chuyển **đồng nhất (homogeneous)**: cùng engine hai phía, ví dụ MySQL sang Amazon RDS for MySQL.
- Di chuyển **không đồng nhất (heterogeneous)**: khác engine, ví dụ Oracle sang Amazon Aurora PostgreSQL, hoặc nguồn NoSQL sang Amazon DynamoDB.
- Bên dưới, đó là một máy chủ sao chép trên AWS chạy các tác vụ; bạn trả tiền theo mức dùng.

## Chuyển đổi schema

Các engine khác nhau dùng kiểu dữ liệu, mã và cấu trúc bảng khác nhau. **DMS Schema Conversion** tự động đánh giá và chuyển đổi schema cùng các đối tượng mã. Bạn cũng có thể dùng **AWS Schema Conversion Tool (AWS SCT)** tải về. Cách kết hợp thường dùng là **SCT (hoặc DMS Schema Conversion) cho schema, rồi DMS cho dữ liệu**. Di chuyển cùng engine thì không cần chuyển đổi schema.

## Dịch vụ nào chuyển cái gì

| Bạn chuyển gì | Dịch vụ |
| --- | --- |
| Cả máy chủ vật lý hoặc ảo | AWS Application Migration Service |
| Chia sẻ tệp và đối tượng qua mạng | AWS DataSync |
| Dữ liệu giữa các dịch vụ lưu trữ AWS | AWS DataSync |
| Database sang engine được quản lý | AWS DMS |
| Database thương mại sang engine mã nguồn mở | DMS cộng SCT hoặc DMS Schema Conversion |
| Đối tác tải tệp lên S3 bằng SFTP | AWS Transfer Family (xem bài các dịch vụ di chuyển) |
| Hàng petabyte với mạng yếu | AWS Data Transfer Terminal (họ Snow đã đóng với khách hàng mới; xem chủ đề lưu trữ) |

## Bẫy thường gặp

- Đừng dùng DMS cho tệp thường hay DataSync cho database.
- Di chuyển không đồng nhất cần chuyển đổi schema trước; di chuyển đồng nhất thường thì không.

## Ý chính

- DataSync = chuyển tệp và đối tượng online, có mã hóa và kiểm tra toàn vẹn.
- DMS = di chuyển database với gián đoạn tối thiểu và sao chép liên tục.
- SCT hoặc DMS Schema Conversion xử lý schema cho các cuộc chuyển không đồng nhất.

## Nguồn

- [What is AWS DataSync?](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [What is AWS Database Migration Service?](https://docs.aws.amazon.com/dms/latest/userguide/Welcome.html)
- [AWS DataSync pricing](https://aws.amazon.com/datasync/pricing/)
