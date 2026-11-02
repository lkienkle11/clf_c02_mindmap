---
id: networking-vpc-basics
title: "Amazon VPC cơ bản: subnet, route table và gateway"
required: true
---
## Mạng riêng của bạn trên đám mây

**Amazon Virtual Private Cloud (Amazon VPC)** cho phép bạn khởi chạy tài nguyên AWS trong một **mạng ảo được cô lập về mặt logic** do bạn định nghĩa. Nó trông khá giống mạng trong trung tâm dữ liệu của bạn: bạn chọn dải địa chỉ IP, chia thành các subnet và quyết định lưu lượng đi như thế nào. Một VPC thuộc về một Region. Tài khoản thường có sẵn một **default VPC** ở mỗi Region, dùng được ngay, và bạn có thể tự tạo VPC riêng.

## Dải IP và subnet

- Bạn cấp cho VPC một dải địa chỉ IP viết theo **ký pháp CIDR**, ví dụ 10.0.0.0/16. Số sau dấu gạch chéo càng nhỏ thì dải càng lớn.
- **Subnet** là một dải nhỏ hơn bên trong VPC. Mỗi subnet nằm **trọn trong một Availability Zone** và không thể trải qua nhiều zone.
- Để chịu được sự cố của một AZ, hãy đặt subnet (và tài nguyên trong đó) ở **ít nhất hai AZ**.

## Route table

**Route table (bảng định tuyến)** chứa các route: mỗi route nói rằng "lưu lượng tới đích này thì đi tới target này". Mọi subnet đều gắn với một route table, hoặc bảng do bạn chọn hoặc main route table của VPC. Chính định tuyến làm cho một subnet trở thành public hay private.

## Gateway ra internet

- **Internet gateway**: gắn vào một VPC, cho phép tài nguyên có địa chỉ IP công khai giao tiếp với internet theo cả hai chiều.
- **NAT gateway**: cho phép instance trong subnet **private** chủ động kết nối **ra** internet (ví dụ để tải bản cập nhật phần mềm), trong khi internet **không thể chủ động** kết nối vào các instance đó. Một public NAT gateway nằm trong public subnet và gửi lưu lượng ra ngoài qua internet gateway.

| Loại subnet | Có route tới internet gateway? | Tài nguyên điển hình |
| --- | --- | --- |
| Public subnet | Có, một route trực tiếp | Load balancer, bastion host, public NAT gateway |
| Private subnet | Không; ra internet qua NAT gateway | Máy chủ ứng dụng, cơ sở dữ liệu |

Một bố cục phổ biến dùng một public subnet và một private subnet ở mỗi AZ trong hai AZ: load balancer nằm ở các public subnet, còn máy chủ ứng dụng và cơ sở dữ liệu nằm ở các private subnet.

## Bẫy thường gặp

- Một subnet là public vì nó có **route** tới internet gateway, không phải vì cái tên của nó.
- NAT gateway chỉ dành cho lưu lượng **đi ra**; nó không cho người dùng trên internet truy cập vào instance private.
- Internet gateway được gắn vào cả một **VPC**, không gắn vào từng instance.

## Ý chính

- VPC là mạng ảo cô lập trong một Region với dải IP do bạn chọn.
- Mỗi subnet nằm trong một Availability Zone.
- Route table quyết định lưu lượng đi đâu; route tới internet gateway làm subnet thành public.
- NAT gateway cho subnet private quyền truy cập internet chỉ theo chiều đi ra.

## Nguồn

- [How Amazon VPC works](https://docs.aws.amazon.com/vpc/latest/userguide/how-it-works.html)
- [Subnets for your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html)
- [NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html)
