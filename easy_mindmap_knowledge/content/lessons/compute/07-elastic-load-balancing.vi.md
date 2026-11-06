---
id: compute-elastic-load-balancing
title: Elastic Load Balancing: chọn đúng loại load balancer
required: true
---
## Elastic Load Balancing làm gì

**Elastic Load Balancing (ELB)** phân phối lưu lượng đến cho nhiều target, như EC2 instance, container và địa chỉ IP, trong một hoặc nhiều Availability Zone. Nó theo dõi tình trạng của các target và chỉ gửi yêu cầu cho target **khỏe mạnh**, nên máy chủ bị lỗi sẽ tự động bị bỏ qua. Nó cũng tự mở rộng dung lượng khi lưu lượng đổi và bạn chỉ trả cho phần đã dùng. Một load balancer nằm trong một **Region** và trải trên các Availability Zone bạn bật, đó là lý do nó tăng tính sẵn sàng. Bài tổng quan trong chủ đề này đã giới thiệu ELB; bài này đi sâu hơn.

## Các thành phần

- **Load balancer**: điểm vào duy nhất, với tên DNS mà client dùng.
- **Listener**: kiểm tra yêu cầu kết nối trên một giao thức và cổng, rồi áp dụng các quy tắc.
- **Target group**: tập các target đã đăng ký. Health check được định nghĩa theo từng target group.
- **Scheme**: **internet-facing** (địa chỉ công khai, truy cập được từ internet) hoặc **internal** (địa chỉ riêng, chỉ truy cập được từ bên trong VPC). Ứng dụng ba tầng thường dùng cả hai.

## Bốn loại

| Loại | Tầng và giao thức | Chọn khi |
| --- | --- | --- |
| **Application Load Balancer (ALB)** | Tầng 7: HTTP, HTTPS, gRPC | Ứng dụng web, microservice và container cần định tuyến thông minh |
| **Network Load Balancer (NLB)** | Tầng 4: TCP, UDP, TLS | Hiệu năng cực cao, tốc độ yêu cầu rất lớn, IP tĩnh hoặc Elastic IP |
| **Gateway Load Balancer (GWLB)** | Cổng tầng 3 cộng cân bằng tải, GENEVE | Triển khai và mở rộng các virtual appliance |
| **Classic Load Balancer (CLB)** | Tầng 4 và 7 | Thế hệ cũ; nên chuyển sang loại hiện hành |

**ALB** đọc nội dung yêu cầu nên có thể định tuyến theo **đường dẫn URL hoặc tên host**, cũng như theo header, query string hoặc IP nguồn. Nó có thể chuyển hướng, trả về phản hồi cố định, giải mã HTTPS thay cho target bằng chứng chỉ từ AWS Certificate Manager, và phối hợp với AWS WAF. Nó hỗ trợ hàm Lambda làm target. ALB không có địa chỉ IP tĩnh. **NLB** làm việc ở mức kết nối, không xét nội dung yêu cầu. Mỗi Availability Zone được bật có một IP tĩnh, và bạn có thể gắn một Elastic IP cho mỗi zone. **GWLB** nằm trên đường đi của lưu lượng như một cổng trong suốt và chuyển gói tin cho các appliance bảo mật như tường lửa, hệ thống phát hiện và ngăn chặn xâm nhập hoặc công cụ kiểm tra gói tin sâu, thường đến từ các nhà cung cấp bên thứ ba.

Quy tắc chọn nhanh khi thi: "định tuyến theo đường dẫn URL hoặc host" là ALB. "TCP hoặc UDP, IP tĩnh, hiệu năng cực cao" là NLB. "Appliance tường lửa của bên thứ ba" là GWLB. Nếu câu hỏi chỉ nói "phân phối lưu lượng HTTP cho các instance" thì đáp án thường là ALB.

## Health check

Mỗi node của load balancer gửi yêu cầu định kỳ tới các target. Target không đạt số lần kiểm tra liên tiếp đã cấu hình sẽ bị đưa ra khỏi dịch vụ, và quay lại sau đủ số lần thành công liên tiếp. Với ALB, bạn đặt giao thức, cổng, đường dẫn (ví dụ `/health`) và các mã phản hồi được tính là thành công. Nếu **tất cả** target trong một group đều không khỏe, ALB vẫn gửi lưu lượng tới toàn bộ chúng thay vì không gửi gì.

## Cross-zone load balancing

Mỗi zone được bật có các node của load balancer. Khi bật **cross-zone load balancing**, mỗi node phân phối lưu lượng cho target ở mọi zone được bật, giúp cân bằng khi số target mỗi zone không đều. Khi tắt, node chỉ dùng target trong zone của chính nó.

- ALB: luôn bật ở cấp load balancer.
- NLB và GWLB: mặc định tắt; bạn có thể bật.
- CLB: tùy cách bạn tạo.

ALB cần ít nhất hai Availability Zone, và mỗi zone được bật nên có ít nhất một target đã đăng ký.

## Phối hợp với Auto Scaling

Khi một Auto Scaling group được gắn vào target group, instance nó khởi chạy sẽ được đăng ký tự động và instance nó xóa sẽ bị hủy đăng ký. Bạn cũng có thể dùng kết quả health check của ELB để group thay thế những instance mà load balancer thấy không khỏe. Xem bài về Auto Scaling group.

## Bẫy thường gặp khi thi

- ELB **phân phối** lưu lượng; nó không thêm hay bớt instance. Việc đó là của Auto Scaling.
- Load balancer mang tính **Regional**. Phân phối lưu lượng giữa các Region cần dịch vụ khác, như Amazon Route 53 hoặc AWS Global Accelerator.
- NLB không phải tầng 7, và ALB không cấp được IP cố định.
- Classic Load Balancer là thế hệ cũ; đừng chọn cho thiết kế mới.

## Ý chính

- ELB chỉ gửi yêu cầu cho target khỏe mạnh và tự mở rộng.
- ALB = định tuyến HTTP/HTTPS; NLB = tốc độ TCP/UDP và IP tĩnh; GWLB = appliance; CLB = cũ.
- Health check và thiết lập cross-zone quyết định lưu lượng đi đâu.
- Nó cân bằng trong một Region; số lượng instance do Auto Scaling lo.

## Nguồn

- [What is Elastic Load Balancing?](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html)
- [How Elastic Load Balancing works](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html)
- [Elastic Load Balancing features](https://aws.amazon.com/elasticloadbalancing/features/)
