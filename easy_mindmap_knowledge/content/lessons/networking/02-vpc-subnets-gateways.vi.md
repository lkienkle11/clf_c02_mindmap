---
id: networking-vpc-subnets-gateways
title: "VPC chuyên sâu: địa chỉ IP, NAT, egress-only và default VPC"
required: true
---
## Vì sao cần đi sâu hơn

Bài VPC đầu tiên cho bạn bức tranh chung: VPC, subnet, route table, internet gateway và NAT gateway. Bài này bổ sung các chi tiết mà câu hỏi thi hay dựa vào: địa chỉ IP hoạt động ra sao và gateway nào xử lý loại lưu lượng nào.

## Phạm vi: tài nguyên nào nằm ở đâu

| Tài nguyên | Phạm vi |
| --- | --- |
| VPC | Một Region |
| Subnet | Một Availability Zone |
| Internet gateway | Gắn vào một VPC |
| NAT gateway (loại chuẩn, "theo zone") | Một Availability Zone |

**Default VPC** có sẵn trong mỗi Region của một tài khoản thông thường. Nó có một default subnet ở mỗi Availability Zone, một internet gateway đã gắn và một route đưa lưu lượng hướng ra internet tới gateway đó, nên instance khởi chạy ở đây ra internet được ngay. VPC do bạn tự tạo (nondefault VPC) không có những thứ này trừ khi bạn tự dựng.

## Địa chỉ IP

- Mỗi VPC có một **CIDR block** IPv4 từ **/16** (65.536 địa chỉ) đến **/28** (16 địa chỉ). AWS khuyến nghị dùng dải private theo RFC 1918, ví dụ 10.0.0.0/16. Bạn có thể thêm CIDR block phụ sau này, nhưng không đổi kích thước block hiện có.
- **Private IPv4** chỉ truy cập được bên trong mạng. Mỗi instance nhận một địa chỉ từ dải của subnet.
- **Public IPv4** lấy từ kho địa chỉ của Amazon và không gắn với tài khoản của bạn; AWS có thể thu hồi, nên đây không phải địa chỉ cố định.
- **Elastic IP** là địa chỉ public IPv4 tĩnh thuộc tài khoản của bạn. Bạn có thể chuyển nó sang instance khác để che lỗi của instance cũ. AWS tính phí mọi địa chỉ public IPv4, kể cả Elastic IP.
- Địa chỉ **IPv6** là duy nhất toàn cầu nên mặc định là public. Việc truy cập được kiểm soát bằng routing, security group và network ACL.

Muốn ra internet, instance cần public IPv4 (hoặc địa chỉ IPv6) và route tới internet gateway. Chỉ có public IP mà thiếu route thì chưa đủ.

## Subnet public, private và các loại khác

Subnet là **public** khi route table có route tới internet gateway, và **private** khi không có. Tài liệu còn nêu hai loại nữa: subnet **VPN-only** có route tới Site-to-Site VPN qua virtual private gateway, và subnet **isolated** không có route nào ra ngoài VPC. AWS khuyến nghị dùng subnet private để bảo vệ tài nguyên.

## NAT gateway và NAT instance

**NAT gateway** cho tài nguyên trong subnet private chủ động tạo kết nối đi ra, đồng thời chặn kết nối đi vào không được yêu cầu.

- NAT gateway **public** (mặc định): tạo trong **subnet public** và gắn một Elastic IP; lưu lượng đi ra qua internet gateway.
- NAT gateway **private**: dùng để tới VPC khác hoặc mạng on-premises, không có Elastic IP.
- Do **AWS quản lý**: sẵn sàng cao trong zone của nó, mở rộng tới 100 Gbps, không cần vá lỗi. Bạn trả tiền theo giờ của gateway và theo GB xử lý.
- NAT gateway chuẩn nằm trong **một AZ**. Nếu zone đó hỏng, tài nguyên ở zone khác dùng chung nó mất internet, nên hãy tạo mỗi AZ một cái và định tuyến mỗi AZ về gateway cùng zone. AWS cũng có **NAT gateway theo Region** mới, tự trải rộng nhiều AZ; khái niệm thi vẫn là gateway theo từng AZ.
- Không gắn được security group vào NAT gateway.

**NAT instance** là một EC2 instance bạn tự cấu hình để làm NAT. Bạn phải tự vá lỗi, chọn kích cỡ và viết script chuyển đổi dự phòng. AWS khuyến nghị dùng NAT gateway vì sẵn sàng và băng thông tốt hơn, ít công quản trị hơn.

## Egress-only internet gateway

Địa chỉ IPv6 là public, nên instance IPv6 có thể bị internet truy cập vào. **Egress-only internet gateway** chỉ cho phép lưu lượng **IPv6 đi ra**, tương tự vai trò của NAT gateway với IPv4. Nó chỉ dành cho IPv6, có trạng thái (stateful) và không tính phí riêng.

## Chọn cái nào?

| Nhu cầu | Dùng |
| --- | --- |
| Truy cập internet hai chiều cho instance public | Internet gateway |
| Instance IPv4 private tải bản cập nhật, không nhận kết nối vào | NAT gateway |
| Chỉ đi ra internet qua IPv6 | Egress-only internet gateway |
| Địa chỉ public cố định, chuyển được giữa các instance | Elastic IP |

## Ý chính

- VPC = Region; subnet = một AZ.
- Subnet public nghĩa là có route tới internet gateway.
- NAT gateway: được quản lý, nằm trong subnet public, chỉ đi ra, mỗi AZ một cái để chịu lỗi; nên chọn nó thay NAT instance.
- Egress-only internet gateway = chỉ đi ra cho IPv6.
- Elastic IP = public IPv4 tĩnh thuộc tài khoản của bạn.

## Nguồn

- [IP addressing for your VPCs and subnets](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-ip-addressing.html)
- [Compare NAT gateways and NAT instances](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html)
- [Egress-only internet gateway](https://docs.aws.amazon.com/vpc/latest/userguide/egress-only-internet-gateway.html)
