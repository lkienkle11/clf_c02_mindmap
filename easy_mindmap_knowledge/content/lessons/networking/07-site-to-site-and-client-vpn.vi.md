---
id: networking-site-to-site-and-client-vpn
title: "Các lựa chọn VPN và Direct Connect: Site-to-Site VPN, Client VPN và khi nào chọn cái nào"
required: true
---
## Ba cách để vào AWS

Bài kết nối hybrid đã giới thiệu Site-to-Site VPN và Direct Connect. Bài này thêm **AWS Client VPN** và đặt cả ba cạnh nhau, vì câu hỏi thi mô tả một tình huống rồi hỏi cái nào phù hợp. Mấu chốt là xác định trước ai đang kết nối: cả một **mạng** (văn phòng hoặc data center) hay một **cá nhân**.

## AWS Site-to-Site VPN

**AWS Site-to-Site VPN** (đề thi đôi khi gọi là **AWS VPN**, còn tài liệu cũ gọi là AWS Managed VPN) tạo kết nối IPsec được mã hóa giữa mạng của bạn và VPC.

- Mỗi kết nối VPN có **hai VPN tunnel** có thể dùng đồng thời để đạt tính sẵn sàng cao.
- Phía AWS, nó kết thúc ở **virtual private gateway** (gắn với một VPC) hoặc **transit gateway** (dùng chung cho nhiều VPC). Phía bạn là **customer gateway device**, có thể là thiết bị vật lý hoặc phần mềm.
- Lưu lượng được mã hóa nhưng đi qua **internet công cộng**, nên tốc độ và độ trễ dao động.
- Bạn trả tiền cho mỗi giờ kết nối VPN được cấp phát, cộng phí truyền dữ liệu ra internet.
- VPN là lựa chọn nhanh, chi phí thấp khi cần kết nối an toàn sớm và chấp nhận đường đi qua internet.

## AWS Client VPN

**AWS Client VPN** là dịch vụ **VPN dựa trên client, do AWS quản lý**, dành cho **người dùng từ xa**. Nhân viên cài một client dựa trên OpenVPN trên laptop và kết nối tới Client VPN endpoint, rồi truy cập tài nguyên trong AWS **và** trong mạng on-premises từ bất cứ đâu.

- Dịch vụ do **AWS quản lý**: AWS lo tính sẵn sàng và tự mở rộng theo số người dùng, bạn không phải chạy máy chủ VPN.
- Kết nối dùng TLS. Xác thực có thể dùng Active Directory, đăng nhập liên kết (federated) hoặc chứng chỉ.
- Bạn kiểm soát truy cập bằng authorization rule và security group.
- Bạn trả tiền theo giờ cho mỗi endpoint association và mỗi kết nối, cộng phí truyền dữ liệu.

Hãy nhớ: Client VPN là "con người", Site-to-Site VPN là "địa điểm".

## AWS Direct Connect

**AWS Direct Connect** là **kết nối mạng riêng chuyên dụng** từ địa điểm của bạn tới AWS qua một Direct Connect location, không đi qua các nhà cung cấp dịch vụ internet.

- Cho hiệu năng mạng **ổn định** hơn so với đường truyền qua internet.
- **Không mã hóa mặc định**. Có các cách thêm mã hóa; ví dụ MACsec mã hóa lưu lượng giữa mạng của bạn và điểm kết nối của AWS trên các kết nối chuyên dụng tốc độ cao được hỗ trợ.
- Bạn cần có mặt tại, hoặc làm việc với đối tác tới được, một Direct Connect location, và phải sắp xếp một đường cross-connect vật lý. Thường mất nhiều thời gian bắt đầu hơn VPN.
- Bạn trả tiền theo giờ cổng (port hour) và dữ liệu truyền ra.
- Site-to-Site VPN có thể làm đường dự phòng: nếu bạn cấu hình, lưu lượng tự chuyển sang VPN khi Direct Connect hỏng.

## So sánh

| | Site-to-Site VPN | Client VPN | Direct Connect |
| --- | --- | --- | --- |
| Kết nối | Một mạng tới VPC | Từng người dùng từ xa | Một mạng tới AWS |
| Đường đi | Internet công cộng | Internet công cộng | Đường riêng chuyên dụng |
| Mã hóa mặc định | Có (IPsec) | Có (TLS) | Không |
| Hiệu năng | Thay đổi theo internet | Thay đổi theo internet | Ổn định |
| Triển khai | Nhanh | Nhanh | Chậm hơn, cần kết nối vật lý |
| Từ khóa thường gặp | "Mã hóa qua internet, nhanh" | "Nhân viên từ xa, laptop" | "Chuyên dụng, ổn định, không qua internet" |

## Bẫy thường gặp

- "Chuyên dụng" hoặc "không dùng internet" là Direct Connect; "trong vòng một tuần" và "mã hóa" trỏ tới Site-to-Site VPN.
- Nhân viên làm việc từ nhà là Client VPN, không phải Site-to-Site VPN.
- Direct Connect kèm mã hóa cần thêm một bước; đừng cho rằng nó đã được mã hóa.
- Amazon Connect (tổng đài) và Direct Connect có tên giống nhau nhưng chẳng liên quan.

## Ý chính

- Site-to-Site VPN: IPsec, hai tunnel, đi qua internet, nối mạng với VPC, triển khai nhanh.
- Client VPN: do AWS quản lý, dựa trên OpenVPN, người dùng từ xa tới tài nguyên AWS và on-premises.
- Direct Connect: đường riêng chuyên dụng, hiệu năng ổn định, không mã hóa mặc định.
- Chọn theo việc ai kết nối và bạn cần độ ổn định tới đâu.

## Nguồn

- [What is AWS Site-to-Site VPN?](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html)
- [What is AWS Client VPN?](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/what-is.html)
- [What is AWS Direct Connect?](https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html)
