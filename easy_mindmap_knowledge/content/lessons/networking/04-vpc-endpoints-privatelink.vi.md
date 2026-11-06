---
id: networking-vpc-endpoints-privatelink
title: "VPC endpoint và AWS PrivateLink: truy cập riêng tư không qua internet"
required: true
---
## Vấn đề

Mặc định, instance trong subnet private muốn gọi một dịch vụ AWS như Amazon S3 phải đi qua NAT gateway và internet gateway, tới địa chỉ công khai của dịch vụ. Cách này chạy được nhưng tốn phí NAT và đưa yêu cầu đi trên đường hướng ra internet. **VPC endpoint** cho VPC của bạn một đường riêng tư để tới dịch vụ.

Câu hỏi kiểu "truy cập S3 bucket từ EC2 instance mà không dùng internet" trỏ tới **VPC endpoint**.

## Hai loại endpoint chính

| | Gateway endpoint | Interface endpoint |
| --- | --- | --- |
| Dịch vụ hỗ trợ | Chỉ **Amazon S3** và **Amazon DynamoDB** | Nhiều dịch vụ AWS, dịch vụ của AWS Partner và dịch vụ của chính bạn |
| Cách hoạt động | Bạn thêm route tới endpoint trong route table | AWS tạo một elastic network interface có IP private trong subnet của bạn |
| Chạy trên AWS PrivateLink? | Không | Có |
| Chi phí thêm | Không | Có phí thêm (xem trang giá AWS) |

Hãy nhớ: **gateway endpoint chỉ dành cho S3 và DynamoDB**. Gateway endpoint không cần internet gateway hay NAT device. Nó không mở rộng tới mạng on-premises, VPC peering khác Region hay transit gateway; với S3, các trường hợp đó cần interface endpoint.

## AWS PrivateLink

**AWS PrivateLink** cung cấp kết nối riêng tư giữa các VPC, dịch vụ AWS được hỗ trợ và mạng on-premises, dùng địa chỉ IP private mà không để lưu lượng lộ ra internet công cộng. Lưu lượng giữa endpoint và dịch vụ nằm trong mạng AWS.

PrivateLink có hai phía:

- **Service provider** (bên cung cấp) tạo *endpoint service* (phải đặt load balancer phía trước) và quyết định tài khoản AWS nào được kết nối. Bên cung cấp có thể là AWS, AWS Partner hoặc một tài khoản khác của bạn.
- **Service consumer** (bên dùng) tạo interface endpoint trong VPC của mình. Bên cung cấp có thể chấp nhận hoặc từ chối yêu cầu kết nối.

Nhờ vậy PrivateLink cho phép bạn cung cấp một dịch vụ (ví dụ ứng dụng SaaS hoặc API nội bộ) cho **VPC và tài khoản khác** mà không cần peering mạng và không để dịch vụ lộ ra internet công cộng. Nó cũng giảm chi phí NAT và truyền dữ liệu.

Câu hỏi nói "kết nối riêng tư các dịch vụ AWS được hỗ trợ và VPC, không để lưu lượng ra internet công cộng" trỏ tới **AWS PrivateLink**. Câu hỏi riêng về S3, không nhắc PrivateLink, trỏ tới **VPC endpoint** (loại gateway trong trường hợp cổ điển).

## Endpoint policy

**VPC endpoint policy** là một IAM resource policy gắn vào endpoint. Nó kiểm soát principal nào được dùng endpoint đó để truy cập dịch vụ, ví dụ chỉ một S3 bucket hoặc chỉ một tài khoản. Policy mặc định cho phép mọi thứ đi qua endpoint.

## Trách nhiệm chia sẻ

AWS vận hành hạ tầng endpoint. Bạn quyết định tạo endpoint ở đâu, chỉnh route table, áp endpoint policy và quản lý security group của interface endpoint.

## Bẫy thường gặp

- Gateway endpoint không phải internet gateway hay NAT gateway; đó là một thứ riêng.
- NAT gateway dùng để ra internet; endpoint dùng để tới dịch vụ AWS một cách riêng tư.
- PrivateLink không phải VPC peering: peering nối hai mạng nguyên vẹn, PrivateLink chỉ mở một dịch vụ.

## Ý chính

- VPC endpoint cho VPC truy cập dịch vụ một cách riêng tư; lưu lượng ở trong mạng AWS.
- Gateway endpoint: chỉ S3 và DynamoDB, dựa trên route table, không phí thêm.
- Interface endpoint: chạy trên AWS PrivateLink, có IP private trong subnet, có tính phí.
- PrivateLink còn dùng để chia sẻ một dịch vụ cho VPC và tài khoản khác.
- Endpoint policy giới hạn endpoint được dùng cho việc gì.

## Nguồn

- [AWS PrivateLink concepts](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html)
- [Gateway endpoints for Amazon S3](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html)
- [AWS PrivateLink](https://aws.amazon.com/privatelink/)
