---
id: iam-security-ddos-waf-shield-firewall-manager
title: "Chặn tấn công: AWS Shield, AWS WAF và AWS Firewall Manager"
required: true
---
## Ba công cụ, ba nhiệm vụ

| Công cụ | Nhiệm vụ |
| --- | --- |
| **AWS Shield** | Phòng thủ trước tấn công DDoS |
| **AWS WAF** | Lọc các yêu cầu web theo rule do bạn định nghĩa |
| **AWS Firewall Manager** | Áp dụng các biện pháp bảo vệ đó một cách tập trung trên nhiều tài khoản |

Tấn công DDoS cố làm ngập một mục tiêu để người dùng hợp lệ không truy cập được. Các dịch vụ này tác động lên lưu lượng; còn **Amazon GuardDuty** chỉ phát hiện và báo cáo (ở các bài sau).

## AWS Shield

**Shield Standard** tự động và không tính thêm phí cho mọi khách hàng AWS. Nó phòng thủ trước các cuộc tấn công DDoS phổ biến, thường gặp nhất ở **tầng mạng và tầng giao vận**. Lợi ích lớn nhất dành cho Amazon Route 53 hosted zone, Amazon CloudFront distribution và AWS Global Accelerator standard accelerator.

**Shield Advanced** là gói đăng ký trả phí (phí hằng tháng và cam kết một năm) cho **các tài nguyên bạn chủ động chọn bảo vệ**:

- Amazon CloudFront distribution, Route 53 hosted zone, Global Accelerator standard accelerator, Elastic IP address của EC2, cùng Application Load Balancer và Classic Load Balancer.
- Bảo vệ mở rộng trước tấn công ở tầng mạng, tầng giao vận và **tầng ứng dụng**, kèm giảm thiểu tự động ở tầng ứng dụng có dùng AWS WAF.
- **Số liệu và báo cáo thời gian thực** về các cuộc tấn công, qua console, API và CloudWatch.
- **Shield Response Team (SRT)**, liên hệ được bất cứ lúc nào khi đang bị tấn công, nếu bạn còn có gói hỗ trợ Business hoặc Enterprise (tên các gói đang thay đổi; xem bài về các gói hỗ trợ). Đề thi có thể gọi là "DDoS response team" hoặc "DRT".
- **Bảo vệ chi phí (cost protection)** trước khoản hóa đơn tăng vọt do tấn công, dưới dạng tín dụng dịch vụ Shield Advanced.
- Phí AWS WAF tiêu chuẩn được chi trả cho các tài nguyên nó bảo vệ, và policy Shield Advanced của Firewall Manager không tính thêm phí.

Chọn Standard cho "bảo vệ tự động không tốn phí". Chọn Advanced cho "chuyên gia hỗ trợ khi bị tấn công", "khả năng quan sát các cuộc tấn công" hoặc "bảo vệ chi phí".

## AWS WAF

**AWS WAF** là tường lửa ứng dụng web kiểm tra các **yêu cầu HTTP(S)** gửi tới một tài nguyên được bảo vệ. Bạn gắn một **web ACL** (gọi là *protection pack* trong console mới) chứa các rule vào:

- Amazon CloudFront distribution, Application Load Balancer, Amazon API Gateway REST API,
- AWS AppSync GraphQL API, Amazon Cognito user pool, AWS App Runner service và một vài loại khác.

Một web server EC2 được bảo vệ bằng cách đặt Application Load Balancer phía trước và gắn web ACL ở đó.

Rule có thể khớp với **SQL injection** và **cross-site scripting**, địa chỉ IP, **quốc gia**, chuỗi trong header hoặc query string, và kích thước yêu cầu. **Rate-based rule** giới hạn lượng yêu cầu dồn dập từ một nguồn, còn AND, OR và NOT kết hợp các điều kiện. Hành động gồm **allow**, **block** (mặc định trả HTTP 403), **count**, và CAPTCHA hoặc Challenge. Bạn có thể gửi log của WAF tới nơi bạn chọn. AWS cũng cung cấp các managed rule group để bạn không phải tự viết mọi rule.

Câu hỏi điển hình: "chặn SQL injection hoặc cross-site scripting", "chặn người dùng ở một số quốc gia", "điều kiện tùy chỉnh cho lưu lượng web đi vào" và "ghi log chi tiết việc truy cập các ứng dụng thương mại điện tử" đều là WAF. WAF không chặn được một đợt tấn công ngập lưu lượng ở tầng mạng; đó là việc của Shield.

## AWS Firewall Manager

**AWS Firewall Manager** thiết lập các biện pháp bảo vệ một lần rồi áp dụng chúng cho **các tài khoản và tài nguyên** trong AWS Organizations, kể cả tài nguyên mới. Nó cần AWS Organizations, một tài khoản quản trị Firewall Manager và AWS Config được bật. Các loại policy gồm:

- Rule AWS WAF và bảo vệ Shield Advanced,
- **Security group** và network ACL của Amazon VPC,
- AWS Network Firewall (nằm trong chủ đề mạng) và Route 53 Resolver DNS Firewall.

Bạn trả phí cho các dịch vụ bên dưới, như AWS WAF và AWS Config. Yêu cầu như "cấu hình tập trung security group cho các tài khoản của tổ chức" là Firewall Manager, không phải WAF (lọc yêu cầu web ở một nơi) hay GuardDuty.

## Chọn theo tầng nào?

| Nhu cầu | Đáp án |
| --- | --- |
| Bảo vệ DDoS tự động cho mọi người | Shield Standard |
| Chuyên gia DDoS, số liệu tấn công, bảo vệ chi phí | Shield Advanced |
| Chặn khai thác web, quốc gia, IP xấu | AWS WAF |
| Quản lý WAF, Shield, security group trên nhiều tài khoản | Firewall Manager |
| Lọc theo cổng và IP ở mức instance hoặc subnet (chúng không nhận ra SQL injection) | Security group và network ACL |
| Kiểm tra lưu lượng cho toàn VPC | AWS Network Firewall |

## Ý chính

- Shield Standard tự động và miễn phí; Advanced trả phí và bổ sung SRT, khả năng quan sát và bảo vệ chi phí.
- WAF lọc yêu cầu web bằng rule trên web ACL gắn vào CloudFront, ALB, API Gateway và các tài nguyên khác.
- Firewall Manager tập trung hóa policy WAF, Shield Advanced, security group và Network Firewall trên cả tổ chức.

## Nguồn

- [How AWS Shield and Shield Advanced work](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-overview.html)
- [AWS WAF](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html)
- [AWS Firewall Manager](https://docs.aws.amazon.com/waf/latest/developerguide/fms-chapter.html)
