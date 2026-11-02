---
id: networking-security-groups-nacls
title: "Bảo mật mạng: security group và network ACL"
required: true
---
## Hai lớp tường lửa

Lưu lượng bên trong một VPC có thể được lọc ở hai nơi:

1. **Network access control list (network ACL)** kiểm tra lưu lượng vào và ra một **subnet**.
2. **Security group** kiểm tra lưu lượng vào và ra một **tài nguyên**, như một EC2 instance.

Bạn có thể bảo vệ instance chỉ bằng security group; network ACL bổ sung một lớp thứ hai tùy chọn (phòng thủ nhiều lớp, defense in depth).

## Security group

- Hoạt động như **tường lửa ảo cho một instance** (chính xác hơn là cho network interface của nó).
- Chỉ hỗ trợ **quy tắc cho phép (allow)**; mọi thứ không được cho phép đều bị từ chối.
- Một security group mới **không có quy tắc inbound** nào, nên không gì vào được cho tới khi bạn thêm quy tắc, và có một quy tắc outbound cho phép mọi lưu lượng đi ra.
- Có **trạng thái (stateful)**: nếu một yêu cầu được phép đi vào thì phản hồi tự động được phép đi ra, và ngược lại.
- Quy tắc có thể lấy một security group khác làm nguồn, ví dụ "chỉ cho phép lưu lượng cơ sở dữ liệu từ security group của các web server".

## Network ACL

- Áp dụng cho **mọi tài nguyên trong các subnet** được gắn với nó.
- Hỗ trợ cả quy tắc **allow và deny**, nên có thể chặn một dải địa chỉ IP cụ thể.
- **Không trạng thái (stateless)**: lưu lượng phản hồi phải được cho phép bằng quy tắc riêng.
- Các quy tắc được đánh số và đánh giá **theo thứ tự, số nhỏ nhất trước**; quy tắc khớp đầu tiên được áp dụng.
- Network ACL **mặc định** của VPC cho phép mọi lưu lượng vào và ra.

## So sánh

| Đặc điểm | Security group | Network ACL |
| --- | --- | --- |
| Cấp độ | Instance (network interface) | Subnet |
| Quy tắc | Chỉ allow | Allow và deny |
| Trạng thái | Stateful | Stateless |
| Cách đánh giá | Xét tất cả quy tắc cùng lúc | Theo thứ tự số, khớp đầu tiên |

## Quan sát lưu lượng

**VPC Flow Logs** ghi lại thông tin về lưu lượng IP đi tới và đi từ các network interface trong VPC. Chúng giúp bạn tìm nguyên nhân lưu lượng bị chặn và hỗ trợ giám sát bảo mật.

## Bẫy thường gặp

- "Chặn một địa chỉ IP độc hại" cần quy tắc **deny**, nên đáp án là network ACL, không phải security group.
- "Stateful" đi với security group; "stateless" đi với network ACL.
- Theo mô hình trách nhiệm chia sẻ, **cấu hình** security group và network ACL là việc của khách hàng.

## Ý chính

- Security group bảo vệ instance, chỉ allow, stateful.
- Network ACL bảo vệ subnet, có allow và deny, stateless, quy tắc có thứ tự.
- Dùng cả hai để phòng thủ nhiều lớp.
- VPC Flow Logs ghi lại thông tin về lưu lượng mạng.

## Nguồn

- [Infrastructure security in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/infrastructure-security.html)
- [Security group rules](https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html)
- [Control subnet traffic with network access control lists](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html)
