---
id: networking-dns-delivery
title: "DNS và phân phối: Amazon Route 53, CloudFront, Global Accelerator và API Gateway"
required: true
---
## Amazon Route 53: DNS trên AWS

**Amazon Route 53** là dịch vụ **Domain Name System (DNS)** có tính sẵn sàng cao và khả năng mở rộng. DNS chuyển một cái tên như example.com thành địa chỉ IP mà máy tính kết nối tới. Route 53 có ba việc chính, bạn có thể dùng chung hoặc riêng lẻ:

1. **Đăng ký tên miền (domain registration)**: mua và quản lý tên miền.
2. **Định tuyến DNS (DNS routing)**: trả lời truy vấn DNS và đưa người dùng tới tài nguyên của bạn, như một load balancer, một CloudFront distribution hoặc một S3 website.
3. **Kiểm tra sức khỏe (health check)**: kiểm tra tài nguyên có truy cập được không và chuyển lưu lượng tránh xa tài nguyên không khỏe.

## Routing policy

Mỗi bản ghi DNS dùng một **routing policy** quyết định cách Route 53 trả lời. Các policy chính:

| Policy | Dùng để |
| --- | --- |
| Simple | Gửi lưu lượng tới một tài nguyên duy nhất |
| Weighted | Chia lưu lượng theo tỷ lệ, ví dụ 90/10 để thử một phiên bản mới |
| Latency | Đưa người dùng tới Region có độ trễ thấp nhất với họ |
| Failover | Chủ động - dự phòng: dùng bản dự phòng khi health check cho thấy bản chính bị hỏng |
| Geolocation | Định tuyến theo vị trí của người dùng, ví dụ theo quốc gia |
| Geoproximity | Định tuyến theo vị trí của tài nguyên và người dùng, và dịch chuyển lưu lượng giữa chúng |
| Multivalue answer | Trả về nhiều bản ghi khỏe được chọn ngẫu nhiên |

Mẹo thi: "người dùng ở mỗi quốc gia phải thấy nội dung bằng ngôn ngữ của họ" hướng tới **geolocation**; "hiệu năng tốt nhất cho người dùng khắp thế giới" hướng tới **latency**; "khôi phục thảm họa sang một site dự phòng" hướng tới **failover**.

## CloudFront và Global Accelerator (ôn lại)

Chủ đề Hạ tầng toàn cầu đã giới thiệu cả hai. Tóm tắt: **Amazon CloudFront** là CDN **lưu đệm (cache)** nội dung tại các edge location, còn **AWS Global Accelerator** cung cấp **địa chỉ IP tĩnh** và đưa lưu lượng TCP hoặc UDP qua mạng toàn cầu của AWS tới các endpoint khỏe. Route 53 thường trỏ một tên miền tới một CloudFront distribution.

## Cửa trước cho ứng dụng

- **Elastic Load Balancing** (đã học ở chủ đề Điện toán) phân phối lưu lượng tới các target khỏe trên nhiều Availability Zone.
- **Amazon API Gateway** cho phép bạn tạo, phát hành, giám sát và bảo mật **API kiểu REST, HTTP và WebSocket** ở mọi quy mô. Nó là "cửa trước" dẫn tới các backend như AWS Lambda hoặc EC2, và xử lý quản lý lưu lượng, phân quyền và giám sát. API Gateway kết hợp với Lambda là một mô hình serverless phổ biến.

## Bẫy thường gặp

- Route 53 phân giải tên và định tuyến **truy vấn DNS**; nó không lưu đệm nội dung (CloudFront mới làm việc đó).
- Latency routing nói về **Region** tốt nhất cho người dùng; geolocation nói về **vị trí** của người dùng, bất kể tốc độ.
- API Gateway quản lý API; nó không phải load balancer cho một đội EC2.

## Ý chính

- Route 53 = đăng ký tên miền, định tuyến DNS và health check.
- Chọn routing policy theo tình huống: weighted, latency, failover, geolocation.
- CloudFront lưu đệm; Global Accelerator tối ưu đường đi mạng.
- API Gateway là cửa trước được quản lý cho các API.

## Nguồn

- [What is Amazon Route 53?](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)
- [Choosing a routing policy](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html)
- [What is Amazon API Gateway?](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)
