---
id: compute-auto-scaling-groups
title: Amazon EC2 Auto Scaling group chi tiết
required: true
---
## Từ tổng quan đến chi tiết

Bài tổng quan đã cho thấy một Auto Scaling group giữ số instance tối thiểu, tối đa và mong muốn. Bài này giải thích group gồm những gì, nó quyết định mở rộng ra sao và khác thế nào với dịch vụ có tên gần giống là **AWS Auto Scaling**.

## Group, launch template và dung lượng

**Auto Scaling group** là tập các EC2 instance được quản lý như một khối. Group cần biết phải khởi chạy cái gì, và thông tin đó nằm trong **launch template**. Template chứa những lựa chọn bạn vẫn đưa ra cho một instance đơn lẻ: AMI ID, instance type, key pair, security group và các tham số khác. Launch template có **phiên bản**, nên bạn có thể chuẩn bị phiên bản mới với AMI mới hơn rồi triển khai. **Launch configuration** kiểu cũ vẫn tồn tại, nhưng AWS khuyên dùng launch template, và một số tính năng, như trộn Spot và On-Demand Instance hoặc dùng nhiều instance type, chỉ chạy với template.

Ba con số điều khiển quy mô:

- **Minimum**: group không bao giờ xuống dưới mức này.
- **Maximum**: group không bao giờ vượt mức này, giúp chặn trần chi phí.
- **Desired capacity**: số instance group đang cố duy trì. Việc mở rộng thay đổi con số này, luôn nằm giữa minimum và maximum.

Group trải trên các Availability Zone bạn chọn và giữ instance phân bố đều giữa chúng, nên mất một zone không làm ứng dụng sập.

## Các cách mở rộng

| Cách | Hoạt động | Dùng khi |
| --- | --- | --- |
| Giữ kích thước cố định | Không có policy; group giữ đủ số lượng mong muốn | Giữ đúng N máy chủ luôn chạy |
| Thủ công | Bạn đổi desired capacity hoặc xóa instance | Thay đổi nhanh một lần |
| **Theo lịch (Scheduled)** | Dung lượng đổi vào ngày giờ định sẵn | Giờ cao điểm đã biết, như mỗi sáng ngày làm việc |
| **Động (Dynamic)** | Policy phản ứng theo một metric CloudWatch | Nhu cầu khó đoán |
| **Dự đoán (Predictive)** | Dự báo nhu cầu từ tải trong quá khứ và thêm dung lượng trước | Chu kỳ ngày hoặc tuần đều đặn, ứng dụng khởi động chậm |

**Dynamic scaling** là hình ảnh quen thuộc nhất. Một loại policy phổ biến là **target tracking**: bạn chọn một metric và mục tiêu, ví dụ mức dùng CPU trung bình khoảng 50 phần trăm, và group thêm hoặc bớt instance để bám sát mục tiêu. **Predictive scaling** phân tích tải lịch sử để tìm mẫu theo ngày và tuần, rồi khởi chạy dung lượng trước khi lưu lượng đến. Có thể kết hợp với dynamic scaling để xử lý những bất ngờ. **Scale out** là thêm instance; **scale in** là bớt instance.

## Tự phục hồi

Group liên tục kiểm tra sức khỏe instance. Instance mới được coi là khỏe, và group biết sự cố từ các nguồn như kiểm tra trạng thái của Amazon EC2, Elastic Load Balancing và các custom check bạn định nghĩa. Instance không khỏe bị xóa và thay thế bằng launch template hiện tại, nên dung lượng trở lại đúng con số mong muốn. Điều này cũng bao gồm instance lỡ bị xóa hoặc bị Spot ngắt. **Health check grace period** cho instance mới có thời gian khởi động trước khi các kiểm tra tùy chọn bắt đầu.

Đó là lý do Auto Scaling là đáp án khi câu hỏi muốn giữ một đội máy ở kích thước cố định và thay thế các instance bị lỗi. Group có minimum, desired và maximum bằng nhau làm đúng việc đó.

## Phối hợp với load balancer

Gắn group vào target group của load balancer. Instance mới tự đăng ký, instance bị xóa tự hủy đăng ký, và kết quả health check của ELB có thể kích hoạt việc thay thế. Group lo đúng số lượng máy chủ, còn load balancer chia lưu lượng giữa chúng. Cái này không làm việc của cái kia.

## Góc nhìn chi phí

Amazon EC2 Auto Scaling không tính thêm phí. Bạn trả cho instance và các tài nguyên khác mà nó khởi chạy. Thu nhỏ vào giờ vắng làm giảm hóa đơn, maximum đóng vai trò trần, và một group có thể trộn **On-Demand và Spot Instance** để giảm chi phí cho phần dung lượng chịu lỗi được.

## AWS Auto Scaling so với Amazon EC2 Auto Scaling

| | Amazon EC2 Auto Scaling | AWS Auto Scaling |
| --- | --- | --- |
| Mở rộng | EC2 instance trong một Auto Scaling group | Một tập tài nguyên: EC2 và Spot Fleet, tác vụ Amazon ECS, bảng và index Amazon DynamoDB, replica Amazon Aurora |
| Cách làm | Bạn cấu hình group và policy | Scaling plan cấu hình việc mở rộng cho nhiều tài nguyên cùng lúc |
| Chi phí | Không tính thêm | Không tính thêm |

Nếu câu hỏi chỉ nhắc **EC2 instance**, hãy nghĩ đến Amazon EC2 Auto Scaling. Nếu cần mở rộng nhiều loại tài nguyên, hãy nghĩ đến AWS Auto Scaling. AWS hiện có tài liệu hướng dẫn chuyển scaling plan sang policy của EC2 Auto Scaling và Application Auto Scaling, nên hãy coi EC2 Auto Scaling là công cụ chính.

## Bẫy thường gặp khi thi

- Auto Scaling không chia yêu cầu; Elastic Load Balancing làm việc đó.
- Scale **out** là thêm instance; scale **up** là làm một instance lớn hơn.
- Một group nằm trong một Availability Zone thì chưa sẵn sàng cao.
- "Maximum" là trần chi phí, "minimum" là sàn về tính sẵn sàng.

## Ý chính

- Group khởi chạy instance từ launch template có phiên bản.
- Desired capacity di chuyển giữa minimum và maximum nhờ mở rộng thủ công, theo lịch, động hoặc dự đoán.
- Instance lỗi được thay thế tự động.
- Auto Scaling không tính thêm phí; AWS Auto Scaling bao phủ nhiều loại tài nguyên.

## Nguồn

- [Auto Scaling groups](https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html)
- [Choose your scaling method](https://docs.aws.amazon.com/autoscaling/ec2/userguide/scaling-overview.html)
- [AWS Auto Scaling](https://aws.amazon.com/autoscaling/)
