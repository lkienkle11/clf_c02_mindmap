---
id: compute-ec2-basics
title: Amazon EC2 cơ bản: instance, họ instance và AMI
required: true
---
## Amazon EC2 là gì

**Amazon Elastic Compute Cloud (Amazon EC2)** cung cấp máy chủ ảo, gọi là **instance**, trên AWS Cloud. Bạn chọn lượng CPU, bộ nhớ, lưu trữ và băng thông mạng cần dùng, khởi chạy instance trong vài phút, rồi dừng (stop) hoặc xóa hẳn (terminate) khi không cần nữa. Đây là Infrastructure as a Service (IaaS): AWS vận hành phần cứng, còn bạn quản lý hệ điều hành và mọi thứ cài trên đó.

## Họ instance: chọn theo workload

Mỗi **instance type** là một tổ hợp cố định gồm CPU, bộ nhớ, lưu trữ và mạng. Các type được xếp thành họ (family) theo mục đích:

| Họ | Tối ưu cho | Workload ví dụ |
| --- | --- | --- |
| General purpose | Cân bằng giữa tính toán, bộ nhớ và mạng | Web server, kho mã nguồn |
| Compute optimized | Bộ xử lý hiệu năng cao | Xử lý theo lô, chuyển mã media, máy chủ game |
| Memory optimized | Tập dữ liệu lớn nằm trong bộ nhớ | Cơ sở dữ liệu in-memory, phân tích dữ liệu |
| Storage optimized | Truy cập nhanh tập dữ liệu lớn trên ổ cục bộ | Cơ sở dữ liệu lớn, xử lý dữ liệu |
| Accelerated computing | Bộ tăng tốc phần cứng như GPU | Machine learning, xử lý đồ họa |

Mẹo thi: khớp **điểm nghẽn** trong tình huống với họ instance. "Đồ họa" hoặc "GPU" hướng tới accelerated computing; "in-memory" hướng tới memory optimized.

## Amazon Machine Image (AMI)

**AMI** là image dùng để khởi động một instance: nó chứa hệ điều hành và phần mềm cần thiết để chạy. Bạn bắt buộc chọn một AMI khi khởi chạy. Bạn có thể dùng AMI do AWS cung cấp, AMI công khai hoặc được chia sẻ, AMI mua trên AWS Marketplace, hoặc **AMI của chính bạn**. Tạo AMI riêng từ một instance đã cấu hình giúp bạn khởi chạy nhanh nhiều máy chủ giống hệt nhau. Mỗi AMI thuộc về một Region, nhưng bạn có thể sao chép nó sang Region khác.

## Vòng đời instance trong nháy mắt

- **Running**: instance đang được dùng và bạn trả tiền trong suốt thời gian nó chạy, kể cả khi nó nhàn rỗi.
- **Stopped**: instance đã tắt; bạn không trả phí sử dụng instance, nhưng vẫn trả tiền cho các ổ Amazon EBS gắn kèm. Bạn có thể bật lại sau.
- **Terminated**: instance bị xóa vĩnh viễn và không thể bật lại. Theo mặc định, ổ EBS gốc (root volume) của nó cũng bị xóa.

## Bẫy thường gặp

- Dừng instance **không** làm dừng phí lưu trữ EBS.
- Dữ liệu trên ổ **instance store** bị mất khi instance bị dừng, ngủ đông (hibernate) hoặc bị xóa (xem thêm ở chủ đề Lưu trữ).
- Theo mô hình trách nhiệm chia sẻ, vá hệ điều hành khách (guest OS) trên EC2 là việc của **khách hàng**.

## Ý chính

- EC2 = máy chủ ảo thay đổi được kích cỡ; bạn kiểm soát hệ điều hành và phần mềm.
- Chọn họ instance khớp với nhu cầu chính của workload.
- AMI là khuôn mẫu để khởi chạy instance; bạn có thể tự tạo AMI.
- Instance đang chạy bị tính phí; instance đã dừng thì không, nhưng ổ EBS của nó vẫn bị tính phí.

## Nguồn

- [Amazon EC2 instance types](https://aws.amazon.com/ec2/instance-types/)
- [Amazon Machine Images in Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [Amazon EC2 instance state changes](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html)
