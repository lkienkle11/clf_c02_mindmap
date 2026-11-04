---
id: compute-scaling-load-balancing
title: Amazon EC2 Auto Scaling và Elastic Load Balancing
required: true
---
## Hai dịch vụ đi thành cặp

Một EC2 instance đơn lẻ là một điểm lỗi đơn lẻ và có năng lực cố định. Hai dịch vụ giải quyết điều đó:

- **Amazon EC2 Auto Scaling** giữ cho **số lượng instance phù hợp** luôn chạy.
- **Elastic Load Balancing (ELB)** phân phối lưu lượng đến cho các instance còn khỏe.

Kết hợp lại, chúng mang đến **tính co giãn (elasticity)** (năng lực bám theo nhu cầu) và **tính sẵn sàng cao** (ứng dụng vẫn chạy khi mất một instance hoặc một Availability Zone).

## Amazon EC2 Auto Scaling

Bạn đặt các instance vào một **Auto Scaling group** và đặt ba con số:

- **Minimum (tối thiểu)**: nhóm không bao giờ thu nhỏ dưới mức này.
- **Maximum (tối đa)**: nhóm không bao giờ lớn hơn mức này, giúp giới hạn chi phí.
- **Desired capacity (năng lực mong muốn)**: số instance nên chạy ngay lúc này.

**Scaling policy** thay đổi desired capacity khi tải thay đổi, ví dụ thêm instance khi CPU trung bình cao và bớt đi khi CPU giảm. Auto Scaling cũng chạy **health check** và **thay thế** những instance bị suy giảm hoặc đã bị xóa, nên nhóm tự phục hồi. Khi nhóm trải trên nhiều Availability Zone, Auto Scaling giữ số instance cân bằng giữa các AZ. Bản thân Auto Scaling không tính thêm phí; bạn trả tiền cho instance và các tài nguyên khác mà nó dùng.

## Elastic Load Balancing

Load balancer (bộ cân bằng tải) là một điểm truy cập duy nhất cho client. Nó chuyển mỗi yêu cầu tới một target đã đăng ký, như EC2 instance, container hoặc địa chỉ IP, trong một hoặc nhiều Availability Zone. Nó kiểm tra sức khỏe các target và chỉ gửi lưu lượng **tới target khỏe**. Bản thân load balancer cũng tự co giãn theo lưu lượng đến.

| Loại | Hoạt động ở | Cách dùng điển hình |
| --- | --- | --- |
| Application Load Balancer | Tầng 7: HTTP và HTTPS | Ứng dụng web; định tuyến theo đường dẫn URL hoặc tên host |
| Network Load Balancer | Tầng 4: TCP, UDP, TLS | Hiệu năng rất cao, địa chỉ IP tĩnh |
| Gateway Load Balancer | Tầng 3 (gói IP) | Thiết bị ảo của bên thứ ba như tường lửa |

Classic Load Balancer là loại cũ, thuộc thế hệ trước.

## Chúng phối hợp ra sao

Khi Auto Scaling khởi chạy một instance, nó đăng ký instance đó với load balancer; khi xóa một instance, nó hủy đăng ký. Người dùng vẫn dùng một địa chỉ duy nhất trong khi năng lực phía sau tăng giảm.

## Bẫy thường gặp

- **Co giãn** (thêm hoặc bớt instance) là Auto Scaling; **phân phối lưu lượng** là ELB. Câu hỏi thường đưa ra dịch vụ này khi cần dịch vụ kia.
- Thêm instance trong **cùng** một Availability Zone không bảo vệ được khi chính AZ đó gặp sự cố. Hãy trải nhóm trên nhiều AZ.
- Scale out là thêm instance (theo chiều ngang); scale up là dùng instance lớn hơn (theo chiều dọc).

## Ý chính

- Auto Scaling: minimum, maximum và desired capacity, cộng với khả năng tự phục hồi.
- ELB: một điểm truy cập, có health check, chỉ gửi lưu lượng tới target khỏe.
- Auto Scaling group trải nhiều AZ phía sau một load balancer = thiết kế sẵn sàng cao kinh điển.
- ALB cho định tuyến HTTP, NLB cho hiệu năng TCP/UDP, GWLB cho thiết bị ảo.

## Nguồn

- [What is Amazon EC2 Auto Scaling?](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [What is Elastic Load Balancing?](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [Elastic Load Balancing features](https://aws.amazon.com/elasticloadbalancing/features/)
