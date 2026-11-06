---
id: networking-vpc-peering-transit-gateway
title: "Kết nối các VPC: VPC peering và AWS Transit Gateway"
required: true
---
## Vì sao cần nối các VPC

Tổ chức lớn chạy nhiều VPC: mỗi nhóm, môi trường hoặc tài khoản một cái. Đôi khi các VPC đó phải nói chuyện riêng tư với nhau. AWS có hai lời giải chính, và câu hỏi thi kiểm tra bạn khi nào chọn cái nào.

## VPC peering

**VPC peering connection** là liên kết một-một giữa hai VPC, cho phép trao đổi lưu lượng bằng địa chỉ IP private như thể cùng một mạng.

- Hai VPC có thể thuộc **tài khoản AWS khác nhau** và **Region khác nhau** (inter-Region peering).
- Hai VPC **không được có CIDR block trùng lặp**.
- Một bên gửi yêu cầu, chủ của VPC kia chấp nhận. Sau đó **mỗi bên thêm một route** tới dải địa chỉ của VPC kia trong route table, và có thể phải cập nhật security group.
- **Không có tính bắc cầu (non-transitive)**. Nếu A peer với B và với C thì B và C vẫn không nói chuyện được qua A; chúng cần peering riêng. Peering cũng không cho VPC này mượn internet gateway, NAT device, VPN hay Direct Connect của VPC kia.
- Nó dùng hạ tầng VPC sẵn có nên không có điểm lỗi đơn lẻ hay nút thắt băng thông. Tạo kết nối không mất phí; truyền dữ liệu qua ranh giới Availability Zone hoặc Region bị tính phí.

Khi có nhiều VPC, kết nối đầy đủ cần một peering cho mỗi cặp, tạo thành "mạng lưới" (mesh) ngày càng khó quản lý.

## AWS Transit Gateway

**AWS Transit Gateway** là một trung tâm trung chuyển mạng nối các VPC và mạng on-premises. Mỗi mạng chỉ kết nối một lần, qua một **attachment**, vào hub thay vì nối với mọi mạng khác. Nó hoạt động như một bộ định tuyến ảo theo Region.

- Attachment gồm VPC, kết nối Site-to-Site VPN, Direct Connect gateway, peering với transit gateway khác và Client VPN endpoint.
- **Route table** của transit gateway quyết định attachment nào tới được attachment nào, nên bạn có thể phân đoạn lưu lượng.
- Các transit gateway ở Region khác nhau nối được bằng **inter-Region peering**.
- Trong cách diễn đạt của đề thi đây là "cloud router", và nó xóa bỏ mesh các peering.
- Tính phí theo từng attachment mỗi giờ cộng lượng dữ liệu được xử lý.

## Peering và Transit Gateway

| Khía cạnh | VPC peering | Transit Gateway |
| --- | --- | --- |
| Mô hình | Một-một | Hub and spoke |
| Định tuyến bắc cầu | Không | Có, qua hub và các route table của nó |
| Kết nối on-premises | Không dùng chung VPN hay Direct Connect | VPN và Direct Connect gắn vào hub |
| Phù hợp nhất | Vài VPC, đơn giản và rẻ | Nhiều VPC, môi trường đang mở rộng |
| Chi phí | Không tính phí giờ cho kết nối | Theo attachment mỗi giờ cộng dữ liệu xử lý |

## Chọn cái nào

- Nối **hai** VPC, hoặc chỉ vài VPC, riêng tư: **VPC peering**.
- Nối **nhiều VPC và mạng on-premises** qua một điểm trung tâm: **Transit Gateway**.
- Mở **một dịch vụ** thay vì nối cả mạng: **AWS PrivateLink** (bài trước).
- Công ty có đường Direct Connect và dự kiến hàng trăm VPC trỏ tới **Transit Gateway**, vì VPN và Direct Connect chỉ cần gắn vào hub một lần.

## Bẫy thường gặp

- Đáp án "chuỗi peering" là sai: peering không bao giờ bắc cầu.
- Dải IP trùng nhau chặn peering, nên hãy lập kế hoạch CIDR từ sớm.
- Transit gateway theo Region; muốn sang Region khác thì dùng peering giữa các transit gateway.

## Ý chính

- VPC peering: một-một, IP private, khác tài khoản và khác Region, không trùng CIDR, không bắc cầu, cần route ở cả hai phía.
- Transit Gateway: hub theo Region cho nhiều VPC và mạng on-premises, thay thế mesh peering.
- Chọn theo quy mô: ít VPC dùng peering; nhiều mạng dùng Transit Gateway.

## Nguồn

- [How VPC peering connections work](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html)
- [What is AWS Transit Gateway?](https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html)
- [What is VPC peering?](https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html)
