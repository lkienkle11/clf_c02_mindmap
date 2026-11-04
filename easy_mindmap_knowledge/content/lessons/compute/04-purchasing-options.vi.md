---
id: compute-purchasing-options
title: Các cách mua EC2: On-Demand, Savings Plans, Reserved, Spot và Dedicated
required: true
---
## Cùng một máy chủ, nhiều cách mua

Cùng một EC2 instance có thể được mua theo nhiều cách. Hãy hỏi: Workload chạy **bao lâu**? Nó **có chịu được gián đoạn** không? Có quy định nào về **giấy phép hoặc tuân thủ** không?

## Các lựa chọn

- **On-Demand Instances**: trả tiền cho năng lực tính toán trong lúc instance chạy, không cam kết. Phù hợp nhất với workload ngắn hạn, tăng vọt thất thường hoặc khó dự đoán.
- **Savings Plans**: cam kết một mức chi tiêu tính toán ổn định (tính bằng đô la mỗi giờ) trong **1 hoặc 3 năm** để được giá thấp hơn. **Compute Savings Plans** linh hoạt nhất: áp dụng cho mọi họ instance, kích cỡ và Region, và cả AWS Fargate lẫn AWS Lambda. **EC2 Instance Savings Plans** giảm giá sâu hơn, đổi lại bạn cam kết với một họ instance trong một Region.
- **Reserved Instances (RI)**: cam kết với một cấu hình instance cụ thể, như instance type và Region, trong **1 hoặc 3 năm**. Trả trước càng nhiều (All Upfront, rồi Partial Upfront, rồi No Upfront) thường càng tiết kiệm. RI **Standard** giảm giá nhiều nhất; RI **Convertible** giảm ít hơn nhưng có thể đổi sang cấu hình khác.
- **Spot Instances**: dùng năng lực EC2 còn dư với mức giảm giá rất sâu. AWS có thể **thu hồi** instance khi cần lại năng lực đó, kèm **cảnh báo trước hai phút**. Chỉ dành cho workload linh hoạt và chịu được gián đoạn, như công việc xử lý theo lô và phân tích dữ liệu.
- **Dedicated Hosts**: nguyên một máy chủ vật lý dành riêng cho bạn, thấy được số socket và core của nó. Dùng để **mang giấy phép phần mềm sẵn có** tính theo socket, theo core hoặc theo VM, hoặc để đáp ứng yêu cầu tuân thủ.
- **Dedicated Instances**: instance chạy trên phần cứng dành riêng cho tài khoản của bạn, nhưng không có khả năng quan sát và kiểm soát ở cấp máy chủ như Dedicated Hosts.
- **On-Demand Capacity Reservations**: giữ trước năng lực trong một Availability Zone cụ thể trong khoảng thời gian bất kỳ. Chúng bảo đảm năng lực nhưng tự bản thân không mang lại giảm giá.

## Bảng chọn nhanh

| Dấu hiệu trong tình huống | Lựa chọn phù hợp nhất |
| --- | --- |
| Mức dùng chưa rõ hoặc ngắn hạn, không được gián đoạn | On-Demand |
| Dùng ổn định từ một năm trở lên, linh hoạt giữa các dịch vụ | Compute Savings Plans |
| Dùng ổn định một instance type cố định trong một Region | Reserved Instances hoặc EC2 Instance Savings Plans |
| Công việc chịu lỗi, có thể dừng rồi chạy lại | Spot |
| Giấy phép gắn với máy chủ (theo socket hoặc core) | Dedicated Hosts |

## Bẫy thường gặp

- Chỉ "chi phí thấp nhất" thì chưa đủ để chọn Spot: nếu công việc **không được gián đoạn**, Spot là sai.
- Một công việc 24 giờ chạy mỗi năm một lần không có mẫu dùng dài hạn, nên cam kết 1 năm là lãng phí; On-Demand phù hợp.
- **Socket, core hoặc giấy phép** hướng tới Dedicated Hosts, không phải Dedicated Instances.

## Ý chính

- On-Demand: linh hoạt, không cam kết.
- Savings Plans và Reserved Instances: cam kết 1 hoặc 3 năm để được giá thấp hơn.
- Spot: giảm giá nhiều nhất, nhưng có thể bị gián đoạn với cảnh báo trước hai phút.
- Dedicated Hosts: máy chủ vật lý riêng cho nhu cầu giấy phép và tuân thủ.

## Nguồn

- [Amazon EC2 billing and purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
- [Savings Plans types](https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html)
- [Spot Instance interruption notices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html)
