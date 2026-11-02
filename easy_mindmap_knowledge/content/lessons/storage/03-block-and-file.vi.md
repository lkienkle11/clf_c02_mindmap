---
id: storage-block-file
title: "Lưu trữ khối và tệp: Amazon EBS, instance store, Amazon EFS và Amazon FSx"
required: true
---
## Ba kiểu lưu trữ

| Kiểu | Cách dùng | Dịch vụ AWS |
| --- | --- | --- |
| Đối tượng (object) | Đọc ghi nguyên tệp qua API, từ bất cứ đâu | Amazon S3 |
| Khối (block) | Một ổ đĩa gắn vào một máy chủ | Amazon EBS, instance store |
| Tệp (file) | Một thư mục dùng chung mà nhiều máy chủ cùng mount | Amazon EFS, Amazon FSx |

Mẹo thi: "ổ đĩa cho cơ sở dữ liệu trên EC2" là block, "hệ thống tệp dùng chung cho nhiều instance" là file, "lưu bao nhiêu bản sao lưu cũng được" là object.

## Amazon EBS: ổ đĩa mạng cho EC2

Một **Amazon Elastic Block Store (EBS) volume** hoạt động như ổ cứng gắn vào một EC2 instance. Các ý chính:

- Volume và instance phải ở **cùng một Availability Zone**.
- Volume **tồn tại độc lập** với instance, nên dữ liệu vẫn còn sau khi dừng rồi bật lại instance.
- Dữ liệu được nhân bản trên nhiều máy chủ **trong AZ của nó**.
- Các loại volume gồm **SSD** (workload giao dịch như cơ sở dữ liệu) hoặc **HDD** (workload cần thông lượng lớn).

**EBS snapshot** là bản sao lưu tại một thời điểm và **tăng dần (incremental)** của volume: chỉ những khối thay đổi kể từ snapshot gần nhất được lưu. Snapshot được AWS lưu trong Amazon S3 giúp bạn, có thể khôi phục volume ở bất kỳ AZ nào trong Region hoặc sao chép sang Region khác. AWS không tự động sao lưu volume; bạn tự tạo hoặc lên lịch snapshot.

## Instance store: nhanh nhưng tạm thời

**Instance store** là lưu trữ khối trên các ổ đĩa **gắn vật lý vào máy chủ vật lý (host)**. Nó nhanh và đã nằm trong giá instance, nhưng dữ liệu **mất khi instance bị dừng, ngủ đông (hibernate) hoặc bị xóa**. Dùng nó cho cache, bộ đệm và dữ liệu tạm.

## Amazon EFS: hệ thống tệp dùng chung cho Linux

**Amazon Elastic File System (EFS)** là hệ thống tệp serverless, được quản lý hoàn toàn, dùng giao thức **NFS**. Nhiều EC2 instance, container và hàm Lambda có thể mount nó cùng lúc. Nó **tự lớn lên và thu nhỏ** khi tệp được thêm hoặc xóa, và file system loại Regional lưu dữ liệu trên nhiều AZ. EFS không hỗ trợ instance Windows.

## Amazon FSx: hệ thống tệp của bên thứ ba được quản lý

**Amazon FSx** cung cấp các hệ thống tệp được quản lý hoàn toàn, xây dựng trên những công nghệ phổ biến:

- **FSx for Windows File Server**: thư mục chia sẻ Windows gốc qua **SMB**, tích hợp với Microsoft Active Directory.
- **FSx for Lustre**: lưu trữ tệp hiệu năng cao cho HPC và machine learning.
- **FSx for NetApp ONTAP** và **FSx for OpenZFS**: phiên bản được quản lý của các hệ thống tệp đó.

## Bẫy thường gặp

- "Lưu trữ tệp dùng chung cho Linux" là EFS; "thư mục chia sẻ Windows" hoặc "SMB" là FSx for Windows File Server.
- Instance store không phải nơi lưu bền vững cho dữ liệu quan trọng.

## Ý chính

- Object = S3, block = EBS hoặc instance store, file = EFS hoặc FSx.
- EBS tồn tại lâu hơn instance; instance store thì không.
- EBS snapshot là bản sao lưu tăng dần do bạn lên lịch.
- EFS là lưu trữ NFS dùng chung, tự co giãn.

## Nguồn

- [Amazon EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html)
- [Instance store temporary block storage for EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html)
- [What is Amazon Elastic File System?](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
