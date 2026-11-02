---
id: networking-hybrid-connectivity
title: "Kết nối các mạng: Site-to-Site VPN, Direct Connect, VPC peering và Transit Gateway"
required: true
---
## Vấn đề cần giải quyết

Công ty hiếm khi chỉ có một mạng. Họ cần nối **trung tâm dữ liệu** của mình với AWS, và nối các **VPC** với nhau. AWS có nhiều cách, và câu hỏi thi yêu cầu bạn chọn đúng cách.

## Từ tại chỗ (on-premises) tới AWS

**AWS Site-to-Site VPN**

- Kết nối **IPsec được mã hóa** giữa mạng của bạn và VPC, đi **qua internet**.
- Mỗi kết nối có **hai tunnel** để đảm bảo tính sẵn sàng cao. Phía AWS kết thúc ở virtual private gateway hoặc transit gateway; phía bạn kết thúc ở một customer gateway device.
- Thiết lập nhanh và chi phí thấp, nhưng hiệu năng phụ thuộc vào internet.

**AWS Direct Connect**

- Một **kết nối mạng riêng, chuyên dụng** từ trung tâm dữ liệu, văn phòng hoặc điểm colocation của bạn tới AWS thông qua một Direct Connect location. Lưu lượng **không** đi qua internet công cộng.
- Cho **hiệu năng ổn định** hơn và băng thông cao hơn so với kết nối internet, và có thể giảm chi phí mạng khi truyền lượng dữ liệu lớn.
- Việc thiết lập cần một kết nối vật lý tại một Direct Connect location, thường được sắp xếp qua đối tác.
- Nó **không được mã hóa theo mặc định**; bạn có thể thêm mã hóa, ví dụ chạy một VPN trên nó.

## Từ VPC tới VPC

**VPC peering** nối **hai** VPC để chúng giao tiếp bằng địa chỉ IP private, kể cả khác tài khoản và khác Region. Dải IP của chúng không được chồng lấn. Peering **không có tính bắc cầu (non-transitive)**: nếu A peer với B và B peer với C, A vẫn không thể tới C thông qua B.

**AWS Transit Gateway** là một **hub trung tâm** (bộ định tuyến ảo cấp Region) nối nhiều VPC và mạng tại chỗ. Thay vì một mạng lưới chằng chịt các kết nối peering, mỗi mạng chỉ cần gắn một lần vào hub.

## Cách chọn

| Nhu cầu | Lựa chọn |
| --- | --- |
| Kết nối được mã hóa tới AWS thật nhanh, qua internet | Site-to-Site VPN |
| Đường truyền riêng, ổn định, băng thông cao, tránh internet | Direct Connect |
| Nối hai VPC một cách riêng tư | VPC peering |
| Nối nhiều VPC và mạng tại chỗ qua một hub | Transit Gateway |

Một mô hình phổ biến dùng **cả hai**: Direct Connect làm đường chính và một Site-to-Site VPN làm đường dự phòng với băng thông thấp hơn.

## Bẫy thường gặp

- "Chuyên dụng" hoặc "không dùng internet công cộng" nghĩa là Direct Connect; "mã hóa qua internet" nghĩa là Site-to-Site VPN.
- Bản thân Direct Connect không được mã hóa.
- VPC peering không nối tiếp được; với thiết kế hub-and-spoke, hãy dùng Transit Gateway.

## Ý chính

- Site-to-Site VPN: IPsec qua internet, thiết lập nhanh.
- Direct Connect: kết nối riêng chuyên dụng, hiệu năng ổn định.
- VPC peering: một-một, không bắc cầu.
- Transit Gateway: một hub cho nhiều mạng.

## Nguồn

- [What is AWS Site-to-Site VPN?](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [AWS Direct Connect, Amazon VPC connectivity options](https://docs.aws.amazon.com/whitepapers/latest/aws-vpc-connectivity-options/aws-direct-connect.html)
- [How VPC peering connections work](https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html)
