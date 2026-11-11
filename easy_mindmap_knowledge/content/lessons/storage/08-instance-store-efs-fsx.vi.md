---
id: storage-instance-store-efs-fsx
title: "Instance store, Amazon EFS và Amazon FSx: chọn block, file hay object"
required: true
---
## Vượt ra ngoài phần tổng quan

Bài tổng quan đã nêu tên các dịch vụ này. Ở đây bạn học cách **chọn** giữa chúng, đúng thứ mà đề thi hỏi: "dịch vụ lưu trữ nào phù hợp với yêu cầu này?"

## EC2 instance store

**Instance store** là lưu trữ khối trên các ổ đĩa gắn vật lý vào máy chủ đang chạy instance của bạn. Nó nằm trong giá instance và có thể rất nhanh, nhưng mang tính **tạm thời (ephemeral)**:

- Dữ liệu mất khi instance bị **dừng, ngủ đông hoặc xóa**, hoặc khi ổ đĩa bên dưới hỏng.
- Không phải loại instance nào cũng có instance store, và dung lượng phụ thuộc loại instance.
- Nó không thể tháo ra rồi gắn sang instance khác như EBS volume.

Dùng cho cache, bộ đệm, dữ liệu tạm, hoặc dữ liệu bạn đã nhân bản trên cả đội máy. Đừng bao giờ coi nó là bản duy nhất của dữ liệu cần giữ. Mẹo thi: "ephemeral" hoặc "bị xóa khi instance dừng hay bị xóa" nghĩa là instance store.

## Amazon EFS

**Amazon Elastic File System (Amazon EFS)** là hệ thống tệp được quản lý, co giãn, dành cho workload **Linux**, truy cập qua giao thức **Network File System (NFS)**.

- Nhiều máy khách dùng chung được: EC2 instance, container (Amazon ECS, Amazon EKS, AWS Fargate) và hàm AWS Lambda. Máy chủ tại chỗ có thể truy cập qua AWS Direct Connect hoặc VPN.
- File system loại **Regional** lưu dữ liệu trên nhiều Availability Zone; loại **One Zone** giữ trong một AZ để rẻ hơn.
- Dung lượng **co giãn**: bạn không cấp phát trước kích thước và chỉ trả cho phần đã lưu.
- **Storage class** ở mức tổng quan: Standard cho tệp truy cập thường xuyên, Infrequent Access (IA) và Archive cho tệp nguội hơn với giá lưu trữ thấp hơn. Lifecycle management có thể tự chuyển tệp giữa các class theo mức truy cập.
- Dữ liệu có thể được mã hóa khi lưu bằng AWS KMS (bật khi tạo file system; console bật sẵn theo mặc định) và khi truyền bằng TLS (tùy chọn, bật bằng mount option).

Mẹo thi: "hệ thống tệp dùng chung cho nhiều instance Linux", "NFS", "được quản lý, tự lớn lên" chỉ về EFS.

## Amazon FSx

**Amazon FSx** là họ các hệ thống tệp được quản lý hoàn toàn, mỗi loại xây trên một công nghệ quen thuộc. Bạn chọn loại khớp với phần mềm hoặc giao thức đang dùng.

| Loại FSx | Xây trên | Chọn khi |
| --- | --- | --- |
| **FSx for Windows File Server** | Windows Server | Cần thư mục chia sẻ Windows gốc qua **SMB**, tích hợp Microsoft Active Directory |
| **FSx for Lustre** | Lustre | Cần lưu trữ cực nhanh cho tính toán hiệu năng cao, machine learning hoặc xử lý video, truy cập Linux (POSIX), có thể liên kết với S3 |
| **FSx for NetApp ONTAP** | NetApp ONTAP | Đã dùng NetApp, hoặc cần truy cập đa giao thức (NFS, SMB, iSCSI) từ Linux, Windows và macOS |
| **FSx for OpenZFS** | OpenZFS | Chuyển máy chủ tệp Linux hoặc ZFS lên AWS và truy cập qua NFS |

FSx loại bỏ công việc cấp phát máy chủ, vá lỗi, sao lưu và thay phần cứng hỏng. Dữ liệu được mã hóa khi lưu bằng khóa KMS.

## Block, file và object

| | Block | File | Object |
| --- | --- | --- | --- |
| Dịch vụ AWS | EBS, instance store | EFS, FSx | S3 |
| Cách truy cập | Gắn như một ổ đĩa vào một instance (EBS Multi-Attach là trường hợp đặc biệt) | Nhiều máy khách mount qua giao thức mạng | Gọi API HTTPS trên nguyên đối tượng |
| Phạm vi | Một AZ | Regional (EFS Regional, FSx Multi-AZ) hoặc một AZ | Regional, gần như không giới hạn |
| Hợp với | Hệ điều hành, cơ sở dữ liệu | Tệp dùng chung, thư mục home, ứng dụng Windows, HPC | Sao lưu, media, data lake, nội dung tĩnh |
| Tính bền vững | EBS bền; instance store thì không | Bền | Bền |

Cách đọc đề:

1. Cần ổ đĩa hệ điều hành hoặc volume cơ sở dữ liệu trên một máy chủ? Block (EBS).
2. Là thư mục dùng chung cho nhiều máy chủ? File (EFS cho Linux, FSx for Windows File Server cho SMB).
3. Là "lưu bao nhiêu dữ liệu cũng được, chi phí thấp nhất, truy cập bằng URL hoặc API"? Object (S3).
4. Là vùng tạm cực nhanh? Instance store.

## Trách nhiệm chia sẻ

AWS quản lý phần cứng, phần mềm hệ thống tệp và (với FSx và EFS) việc vá lỗi, nhân bản. Bạn quản lý ai được truy cập dữ liệu: security group, IAM và quyền Active Directory, lựa chọn mã hóa và sao lưu những gì quan trọng với bạn.

## Bẫy thường gặp

- EFS dành cho Linux; không phải đáp án cho thư mục chia sẻ Windows.
- "Windows file server" hoặc "SMB" là FSx for Windows File Server, không phải EFS.
- Instance store nhanh nhưng không bền.
- FSx là một họ dịch vụ, nên từ khóa trong đề (Windows, Lustre, NetApp, ZFS) cho bạn biết thành viên nào.

## Ý chính

- Instance store: tạm thời, gắn vào host, mất khi dừng hoặc xóa instance.
- EFS: NFS được quản lý cho Linux, multi-AZ, co giãn, nhiều máy khách dùng chung.
- FSx: Windows File Server (SMB), Lustre (HPC), NetApp ONTAP, OpenZFS.
- Khớp kiểu truy cập: block cho một ổ đĩa, file cho thư mục dùng chung, object cho truy cập API với lượng dữ liệu bất kỳ.

## Nguồn

- [Instance store temporary block storage for EC2 instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html)
- [What is Amazon Elastic File System?](https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html)
- [Amazon FSx](https://aws.amazon.com/fsx/)
