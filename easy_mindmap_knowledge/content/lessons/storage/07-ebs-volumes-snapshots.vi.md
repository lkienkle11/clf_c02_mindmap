---
id: storage-ebs-volumes-snapshots
title: "Amazon EBS chuyên sâu: loại volume, snapshot và mã hóa"
required: true
---
## EBS nằm ở đâu trong bức tranh

**Amazon Elastic Block Store (Amazon EBS)** cung cấp các volume lưu trữ khối cho EC2 instance. Bài tổng quan đã nói phần cơ bản; bài này đi vào những chi tiết mà đề thi dùng để phân biệt đáp án: chọn loại volume nào, snapshot thực chất là gì và mã hóa hoạt động ra sao.

## Hai nhóm: SSD và HDD

Các loại volume EBS chia thành hai nhóm theo mục tiêu tối ưu.

| Nhóm | Loại volume | Tối ưu cho | Dùng điển hình |
| --- | --- | --- | --- |
| SSD, General Purpose | **gp3** (và gp2 cũ hơn) | Cân bằng giá và hiệu năng, IOPS | Boot volume, cơ sở dữ liệu nhỏ và vừa, dev/test, máy ảo desktop |
| SSD, Provisioned IOPS | **io2** (Block Express) và io1 | IOPS cao nhất, độ trễ thấp nhất | Cơ sở dữ liệu nặng I/O cần IOPS ổn định |
| HDD, Throughput Optimized | **st1** | Thông lượng cho đọc ghi tuần tự lớn | Big data, data warehouse, xử lý log |
| HDD, Cold | **sc1** | Chi phí thấp nhất cho dữ liệu ít truy cập | Dữ liệu thiên về thông lượng, ưu tiên rẻ |

Quy tắc nhanh khi thi:

- Volume **SSD** hợp với workload giao dịch có nhiều thao tác đọc ghi nhỏ, nơi IOPS quan trọng nhất.
- Volume **HDD** hợp với workload streaming lớn, nơi thông lượng quan trọng nhất. HDD **không thể làm boot volume**.
- **Provisioned IOPS SSD** là đáp án khi đề nhấn mạnh IOPS rất cao hoặc được đảm bảo cho cơ sở dữ liệu quan trọng. **io2 Block Express** được thiết kế đạt độ bền 99,999%, cao hơn mức 99,8% đến 99,9% của các loại khác.
- **Multi-Attach**, cho phép gắn một volume vào nhiều instance, chỉ hỗ trợ trên volume Provisioned IOPS SSD.
- **General Purpose SSD** (gp3) là lựa chọn hợp lý mặc định khi đề không nêu yêu cầu cực đoan.

Bạn không cần nhớ các con số IOPS tối đa; biết nhóm nào hợp workload nào là đủ.

## Volume nằm trong một Availability Zone

Một EBS volume được tạo trong một Availability Zone duy nhất và chỉ gắn được vào instance ở **cùng AZ** đó. Dữ liệu được nhân bản trong AZ, không phải giữa các AZ. Volume độc lập với instance: bạn có thể tháo nó ra và gắn vào instance khác trong cùng AZ, dữ liệu vẫn còn. Bạn trả tiền cho volume đã cấp phát khi nó còn tồn tại, kể cả khi đã tháo.

Muốn chuyển dữ liệu sang AZ hoặc Region khác, bạn dùng snapshot.

## Snapshot: bản sao lưu của bạn

**EBS snapshot** là bản sao lưu tại một thời điểm của volume.

- **Tăng dần (incremental)**: snapshot đầu tiên sao chép dữ liệu đã ghi; các snapshot sau chỉ lưu những khối thay đổi kể từ snapshot trước. Mỗi snapshot vẫn chứa đủ thông tin để khôi phục volume.
- **Lưu trong Amazon S3**, trong các bucket do AWS quản lý giúp bạn. Bạn không thấy chúng trong console S3; bạn quản lý qua EC2.
- **Được nhân bản trên các Availability Zone của Region**, nên bạn có thể tạo volume mới từ snapshot ở **bất kỳ AZ** nào của Region đó.
- **Có thể sao chép sang Region khác**, phục vụ khôi phục thảm họa hoặc khởi chạy tài nguyên ở đó.
- **Không tự động**: AWS không sao lưu volume của bạn. Bạn tự tạo snapshot hoặc tự động hóa bằng **Amazon Data Lifecycle Manager** hay **AWS Backup**.
- **Tính phí theo dữ liệu được lưu.** Vì tăng dần, xóa một snapshot có thể giải phóng rất ít dung lượng nếu snapshot sau vẫn tham chiếu các khối của nó.

**Recycle Bin** có thể giữ lại snapshot (cùng volume và AMI dựa trên EBS) bị xóa nhầm trong một thời gian do bạn đặt, để bạn khôi phục.

## Mã hóa

Mã hóa EBS dùng khóa **AWS KMS**. Khi volume được mã hóa, dữ liệu lưu trữ, dữ liệu di chuyển giữa instance và volume, các snapshot tạo từ nó và mọi volume tạo từ các snapshot đó đều được mã hóa. Bạn không phải tự quản lý hạ tầng khóa. Các điểm thực tế:

- Bạn có thể bật **mã hóa theo mặc định** cho một tài khoản trong một Region.
- Bạn không thể mã hóa trực tiếp một volume chưa mã hóa đang có. Hãy tạo snapshot rồi tạo volume mã hóa mới từ nó (hoặc tạo bản sao mã hóa của snapshot).
- Snapshot của volume đã mã hóa luôn được mã hóa.

## Lưu trữ dựa trên EBS so với instance store

EBS tồn tại độc lập với instance. **Instance store** là tạm thời và gắn với máy chủ vật lý; bài kế tiếp so sánh chúng. Nếu đề nói dữ liệu phải sống sót sau khi instance bị xóa, hãy nghĩ đến EBS (hoặc S3, EFS), không phải instance store.

## Trách nhiệm chia sẻ

AWS vận hành hạ tầng EBS và nhân bản dữ liệu volume trong AZ. Bạn chọn loại volume, tạo snapshot, quyết định mã hóa và dọn dẹp volume, snapshot không dùng nữa vì chúng vẫn tốn tiền.

## Bẫy thường gặp

- Không thể gắn volume qua AZ khác; dùng snapshot để chuyển.
- Volume HDD không thể làm boot volume.
- Snapshot không tự động và không hiện trong bucket S3 của bạn.

## Ý chính

- SSD (gp3, io2) cho IOPS và giao dịch; HDD (st1, sc1) cho thông lượng và dữ liệu lạnh.
- Volume gắn với một AZ; snapshot tăng dần, nằm trong S3, khôi phục vào bất kỳ AZ nào hoặc sao chép sang Region khác.
- Bạn phải lên lịch snapshot, ví dụ bằng Data Lifecycle Manager hoặc AWS Backup.
- Mã hóa dùng KMS; muốn mã hóa volume đang có thì đi qua bản sao snapshot.

## Nguồn

- [Amazon EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html)
- [Amazon EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html)
- [Amazon EBS encryption](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-encryption.html)
