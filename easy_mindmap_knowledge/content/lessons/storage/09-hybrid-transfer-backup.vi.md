---
id: storage-hybrid-backup
title: "Lưu trữ lai, chuyển dữ liệu và AWS Backup"
required: true
---
## Kết nối hạ tầng tại chỗ với AWS

Các dịch vụ sau kết nối dữ liệu tại chỗ (on-premises) với AWS, chuyển nó lên, hoặc bảo vệ nó.

## AWS Storage Gateway: lưu trữ đám mây lai

**AWS Storage Gateway** kết nối một thiết bị (appliance) trong trung tâm dữ liệu của bạn (thường là một máy ảo) với lưu trữ AWS. Ứng dụng tại chỗ vẫn dùng các giao thức quen thuộc, và bộ nhớ đệm (cache) cục bộ cho phép truy cập dữ liệu gần đây với độ trễ thấp.

- **Amazon S3 File Gateway**: ứng dụng lưu và đọc tệp qua **NFS hoặc SMB**, còn tệp được giữ dưới dạng object trong Amazon S3.
- **Tape Gateway**: thay thư viện băng từ vật lý bằng **băng từ ảo (virtual tape)** được lưu trữ lâu dài trong AWS.
- **Volume Gateway**: volume lưu trữ khối dựa trên đám mây mà máy chủ tại chỗ mount qua iSCSI.

(Amazon FSx File Gateway không còn mở cho khách hàng mới.)

## AWS DataSync: chuyển dữ liệu trực tuyến

**AWS DataSync** là dịch vụ chuyển dữ liệu **trực tuyến (online)**, sao chép tệp hoặc object qua mạng giữa lưu trữ tại chỗ (NFS, SMB, HDFS, object storage), các đám mây khác, và lưu trữ AWS như Amazon S3, Amazon EFS và Amazon FSx. Nó tự động hóa việc chuyển và bổ sung mã hóa cùng kiểm tra tính toàn vẹn. Dùng nó để di chuyển (migration), lưu trữ dữ liệu "lạnh" và sao chép định kỳ.

## AWS Snow Family: chuyển dữ liệu ngoại tuyến và thiết bị biên

**AWS Snow Family** (ví dụ **AWS Snowball Edge**) là bộ thiết bị chắc chắn mà AWS gửi tới bạn. Bạn chép dữ liệu vào tại chỗ rồi gửi thiết bị trả lại, phù hợp với tập dữ liệu rất lớn hoặc nơi có kết nối mạng kém. Lưu ý: [Snowball Edge không còn mở cho khách hàng mới](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html) (từ tháng 11 năm 2025), và AWS đã thông báo ngừng hỗ trợ thiết bị Snowball ở các Region thương mại vào ngày 31 tháng 12 năm 2026. AWS hướng khách hàng mới sang DataSync, AWS Data Transfer Terminal hoặc giải pháp của AWS Partner. Câu hỏi thi có thể vẫn nhắc tới Snowball Edge.

## AWS Backup: một nơi cho chính sách sao lưu

**AWS Backup** là dịch vụ được quản lý hoàn toàn để **tập trung hóa và tự động hóa** việc bảo vệ dữ liệu trên các dịch vụ AWS như Amazon EC2, Amazon EBS, Amazon S3, Amazon EFS, Amazon FSx, Amazon RDS và Amazon DynamoDB, cùng một số workload tại chỗ. Bạn định nghĩa **backup plan** (lịch, thời gian giữ, bản sao sang Region khác) và gán tài nguyên vào đó, ví dụ theo tag.

## Chọn dịch vụ nào?

| Nhu cầu | Dịch vụ |
| --- | --- |
| Ứng dụng tại chỗ cần truy cập dạng tệp tới dữ liệu nằm trong S3 | S3 File Gateway |
| Thay thế thư viện băng từ vật lý | Tape Gateway |
| Di chuyển các thư mục chia sẻ lớn lên AWS qua mạng | AWS DataSync |
| Một chính sách sao lưu cho nhiều dịch vụ AWS | AWS Backup |

## Bẫy thường gặp

- Storage Gateway cho **truy cập lai lâu dài**; DataSync **di chuyển** dữ liệu.

## Ý chính

- Storage Gateway nối ứng dụng tại chỗ với lưu trữ AWS bằng các giao thức chuẩn.
- DataSync là cách trực tuyến để chuyển lượng lớn dữ liệu lên AWS.
- Snowball Edge dùng để chuyển dữ liệu ngoại tuyến; đã đóng với khách hàng mới, ngừng hỗ trợ ngày 31 tháng 12 năm 2026.
- AWS Backup tập trung hóa và tự động hóa việc sao lưu.

## Nguồn

- [What is Amazon S3 File Gateway](https://docs.aws.amazon.com/filegateway/latest/files3/what-is-file-s3.html)
- [What is AWS DataSync?](https://docs.aws.amazon.com/datasync/latest/userguide/what-is-datasync.html)
- [What is AWS Backup?](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
