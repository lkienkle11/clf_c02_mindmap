---
id: compute-ec2-placement-and-hosts
title: Placement group, Dedicated Host và capacity reservation
required: true
---
## Instance chạy ở đâu

Thông thường EC2 tự quyết định phần cứng vật lý nào chứa instance của bạn. Đôi khi workload cần được quyền can thiệp: độ trễ thấp giữa các máy chủ, chống lỗi của một phần cứng đơn lẻ, một máy chủ vật lý để đáp ứng giấy phép phần mềm, hoặc dung lượng được đảm bảo. Bài này nói về những công cụ kiểm soát đó và khác gì với các lựa chọn mua đã học.

## Placement group

**Placement group** ảnh hưởng đến cách một nhóm instance được đặt trên phần cứng bên dưới. Placement group là tùy chọn, tạo ra không mất phí, một instance chỉ ở trong một group tại một thời điểm và các group không thể gộp lại.

| Chiến lược | Làm gì | Phù hợp nhất cho |
| --- | --- | --- |
| **Cluster** | Xếp các instance sát nhau trong **một Availability Zone** | Workload gắn kết chặt cần độ trễ thấp và thông lượng cao, như điện toán hiệu năng cao |
| **Spread** | Đặt mỗi instance trên phần cứng riêng biệt | Một **số ít** instance quan trọng không được hỏng cùng lúc |
| **Partition** | Chia instance thành các partition không dùng chung rack | Hệ thống phân tán, nhân bản lớn như Hadoop, Cassandra và Kafka |

Các giới hạn đáng nhớ:

- Cluster group không trải được nhiều Availability Zone. Instance trong đó dùng được đến 10 Gbps cho một luồng mạng, so với 5 Gbps khi ở ngoài, nếu bật enhanced networking.
- Spread group mức rack hỗ trợ tối đa **bảy instance đang chạy mỗi Availability Zone**, nhưng có thể trải nhiều zone.
- Partition group hỗ trợ tối đa **bảy partition mỗi Availability Zone**, và các partition có thể trải nhiều zone. Bạn xem được instance nào nằm trong partition nào.

Việc chọn chủ yếu là khớp từ khóa. "Độ trễ mạng thấp nhất giữa các node" là cluster. "Giảm lỗi liên đới cho vài instance quan trọng" là spread. "Kho dữ liệu phân tán lớn, cô lập lỗi phần cứng theo nhóm" là partition. Cluster đánh đổi khả năng chịu lỗi lấy tốc độ, vì mọi thứ nằm chung một zone.

## Dedicated Host, Dedicated Instance và Capacity Reservation

Ba thứ này dễ nhầm. Hãy khớp theo **nhu cầu**.

| Lựa chọn | Bạn nhận được | Chọn cho |
| --- | --- | --- |
| **Dedicated Host** | Nguyên một máy chủ vật lý cho riêng bạn, thấy được socket và core, kiểm soát được vị trí đặt | Mang theo giấy phép **tính theo socket, core hoặc VM**; yêu cầu tuân thủ; muốn giữ cùng một host theo thời gian |
| **Dedicated Instances** | Instance chạy trên phần cứng dành riêng cho tài khoản bạn, không thấy cấp host | Cô lập khỏi khách hàng khác mà không phải quản lý host |
| **On-Demand Capacity Reservation** | Dung lượng đặt trước cho một instance type trong một Availability Zone | Bảo đảm có dung lượng khi bạn cần |

Dedicated Host tính tiền theo host; Dedicated Instances tính theo instance. Dedicated Host Reservation có thể giảm giá host so với giá host On-Demand. Capacity Reservation dùng ngay (immediate-use) tạo và hủy được bất cứ lúc nào, không có kỳ hạn một hay ba năm (loại đặt trước cho ngày tương lai thì có thời hạn cam kết), nhưng bản thân nó **không giảm giá** và bạn bị tính phí khi nó còn hiệu lực. Muốn tiết kiệm thêm, hãy kết hợp với Savings Plan hoặc Regional Reserved Instance. Riêng Regional Reserved Instance không đặt trước dung lượng. Dedicated Host không đặt được vào placement group.

## Spot Instance: bị ngắt nghĩa là gì

Spot Instance chạy trên dung lượng dư với mức giảm giá sâu, và bài về các lựa chọn mua đã giải thích khi nào nên chọn. Ở đây là chuyện xảy ra khi EC2 lấy lại dung lượng. Các lý do gồm EC2 cần lại dung lượng, giá vượt mức tối đa nếu bạn có đặt, hoặc một ràng buộc trong yêu cầu của bạn. EC2 gửi thông báo ngắt **hai phút** trước khi dừng hoặc xóa instance, qua Amazon EventBridge và instance metadata. Yêu cầu cũng có thể đặt là **hibernate**, khi đó thông báo đến mà không có hai phút báo trước.

Hành vi mặc định khi bị ngắt là **terminate**. Bạn có thể yêu cầu **stop** hoặc **hibernate** thay thế; muốn stop thì yêu cầu Spot phải là persistent. Hãy thiết kế workload Spot chịu lỗi được, lưu tiến độ ở ngoài instance. Auto Scaling khởi chạy instance thay thế khi một Spot Instance trong group bị ngắt.

## Instance store và EBS

**Instance store** là lưu trữ khối tạm thời trên ổ đĩa gắn vật lý vào máy chủ. Nó không tốn thêm phí và hợp với cache, bộ đệm và dữ liệu nháp, nhưng dữ liệu mất khi instance stop, hibernate hoặc terminate, hoặc khi ổ đĩa bên dưới hỏng. Không phải instance type nào cũng có. Volume **Amazon EBS** gắn qua mạng và tồn tại độc lập với instance. Chủ đề Storage đi sâu về EBS.

## Bẫy thường gặp khi thi

- "Giấy phép theo socket hoặc core" là Dedicated Host, không phải Dedicated Instances.
- Capacity Reservation bảo đảm dung lượng, không bảo đảm giá.
- Spot không dành cho công việc không được phép bị ngắt.
- Cluster placement tăng hiệu năng, không tăng tính sẵn sàng.

## Ý chính

- Cluster để nhanh, spread cho vài instance quan trọng, partition cho hệ thống phân tán lớn.
- Dedicated Host cho thấy socket và core để đáp ứng giấy phép; Dedicated Instances thì không.
- Capacity Reservation giữ dung lượng trong một zone và không giảm giá.
- Spot báo trước hai phút; dữ liệu instance store không sống sót qua lần stop.

## Nguồn

- [Placement groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/placement-groups.html)
- [Amazon EC2 Dedicated Hosts](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/dedicated-hosts-overview.html)
- [On-Demand Capacity Reservations](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-capacity-reservations.html)
