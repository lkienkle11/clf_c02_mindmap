---
id: global-infrastructure-availability-zones
title: Availability Zone và tính sẵn sàng cao
required: true
---
## Availability Zone là gì

**Availability Zone (AZ)** là **một hoặc nhiều trung tâm dữ liệu riêng biệt** bên trong một Region, mỗi nơi có nguồn điện, mạng và kết nối dự phòng. Hãy hình dung Region như một vùng đô thị, còn các AZ là những tòa nhà riêng nằm rải rác trong vùng đó.

Cách AWS giữ cho các AZ độc lập:

- **Cách xa nhau về mặt vật lý**: các AZ trong một Region cách nhau một khoảng đáng kể (nhiều kilômét) nhưng vẫn trong phạm vi khoảng 100 km (60 dặm), để tránh cùng chịu một thảm họa như cháy, lũ hay sự cố lưới điện.
- **Không chung điểm lỗi đơn lẻ**: máy phát điện và thiết bị làm mát không dùng chung giữa các AZ, và các AZ được thiết kế để nhận điện từ những trạm biến áp khác nhau.
- **Đủ gần để phối hợp**: các AZ được nối với nhau bằng cáp quang riêng có dự phòng, băng thông cao và độ trễ thấp, đủ nhanh để nhân bản đồng bộ (synchronous replication) giữa chúng.

## Vì sao cần nhiều AZ

Nếu ứng dụng chỉ chạy trong một trung tâm dữ liệu, một lần mất điện cũng có thể làm nó ngừng hoạt động. Khi chạy trên **hai AZ trở lên**, sự cố ở một AZ vẫn để các bản sao ở những AZ khác tiếp tục chạy.

| Thiết kế | Điều gì xảy ra khi một AZ gặp sự cố |
| --- | --- |
| Một AZ | Ứng dụng có thể ngừng hoạt động |
| Nhiều AZ (cùng Region) | Lưu lượng tiếp tục chạy ở các AZ còn khỏe |
| Nhiều Region | Chịu được cả sự cố trên toàn Region, nhưng tốn kém và phức tạp hơn |

## Các thuật ngữ đề thi hay dùng

- **High availability (tính sẵn sàng cao)**: hệ thống hầu như lúc nào cũng hoạt động và dùng được, thường nhờ chạy nhiều bản sao trên nhiều AZ phía sau một bộ cân bằng tải.
- **Fault tolerance (khả năng chịu lỗi)**: hệ thống vẫn hoạt động **ngay cả khi** một thành phần đang hỏng, người dùng không thấy gián đoạn đáng kể.
- **Disaster recovery (khôi phục thảm họa)**: đưa workload hoạt động trở lại sau một sự kiện lớn, thường bằng cách dùng một Region khác.

Một tình huống phổ biến: "Công ty muốn ứng dụng vẫn sẵn sàng nếu một trung tâm dữ liệu gặp sự cố. Công ty nên làm gì?" Đáp án: **triển khai trên nhiều Availability Zone**. Chạy thêm instance trong cùng một AZ không bảo vệ được khi chính AZ đó gặp sự cố.

## Các mối quan hệ cần nhớ

- Một Region chứa nhiều AZ; một AZ chứa một hoặc nhiều trung tâm dữ liệu.
- Mỗi AZ chỉ thuộc về đúng một Region.
- Edge location tách biệt với AZ và nằm gần người dùng cuối hơn (bài tiếp theo).

## Ý chính

- AZ = một hoặc nhiều trung tâm dữ liệu riêng biệt có nguồn điện, mạng và kết nối dự phòng.
- Các AZ trong một Region tách biệt về vật lý nhưng được nối với nhau bằng đường truyền độ trễ thấp.
- Triển khai nhiều AZ là cách tiêu chuẩn để đạt tính sẵn sàng cao trên AWS.
- Các AZ không dùng chung điểm lỗi đơn lẻ.

## Nguồn

- [Availability Zones, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/availability-zones.html)
- [Global infrastructure, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/global-infrastructure.html)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
