---
id: iam-security-threat-protection
title: "Bảo vệ trước mối đe dọa: Shield, WAF, GuardDuty, Inspector, Macie và Security Hub"
required: true
---
## Bảo vệ cửa trước

- **AWS Shield Standard** tự động bảo vệ **mọi khách hàng AWS, không tính thêm phí**, trước các cuộc tấn công **DDoS** phổ biến nhất ở tầng mạng và tầng giao vận.
- **AWS Shield Advanced** là **gói đăng ký trả phí**, bảo vệ DDoS mở rộng cho các tài nguyên bạn chọn, như Elastic IP address của EC2, load balancer, CloudFront, Global Accelerator và Route 53. Nó bổ sung quyền liên hệ 24/7 với **Shield Response Team** (khi có gói hỗ trợ Business hoặc Enterprise; tên các gói đang thay đổi, xem bài về các gói hỗ trợ) và **bảo vệ chi phí (cost protection)** cho các khoản phí mở rộng quy mô do tấn công gây ra.
- **AWS WAF** là **tường lửa ứng dụng web** cho các yêu cầu HTTP(S). Bạn gắn một **web ACL** gồm các rule vào CloudFront, Application Load Balancer, API Gateway và các tài nguyên được hỗ trợ khác. Rule có thể chặn **SQL injection**, **cross-site scripting**, các địa chỉ IP hoặc quốc gia cụ thể, và lượng yêu cầu dồn dập từ một nguồn.

## Tìm vấn đề bên trong tài khoản

- **Amazon GuardDuty** là dịch vụ **phát hiện mối đe dọa**. Sau khi bật, nó phân tích **management event của CloudTrail, VPC flow log và DNS log** mà bạn không phải tự thiết lập các log đó, và dùng nguồn tình báo mối đe dọa (threat intelligence) cùng học máy để phát hiện thông tin đăng nhập bị lộ, đào tiền mã hóa trái phép hoặc liên lạc với địa chỉ IP độc hại.
- **Amazon Inspector** là dịch vụ **quản lý lỗ hổng**. Nó tự động phát hiện và liên tục quét **EC2 instance, container image trong Amazon ECR và Lambda function** để tìm lỗ hổng phần mềm (CVE) và việc bị phơi ra mạng ngoài ý muốn.
- **Amazon Macie** dùng học máy và so khớp mẫu để **phát hiện dữ liệu nhạy cảm**, như thông tin cá nhân hoặc tài chính, **trong Amazon S3**, và đánh dấu các bucket công khai hoặc được chia sẻ.
- **AWS Security Hub** gom các tín hiệu này lại và sắp xếp mức ưu tiên. Dịch vụ ban đầu, nay có tên **AWS Security Hub CSPM**, chạy kiểm tra tự động theo các tiêu chuẩn như AWS Foundational Security Best Practices và CIS; Security Hub kết hợp kết quả của nó với finding từ GuardDuty, Inspector và Macie.
- **Amazon Detective** giúp bạn **điều tra nguyên nhân gốc** của một finding bằng các đồ thị dựng từ dữ liệu log.
- **AWS Firewall Manager** áp dụng rule WAF, bảo vệ Shield Advanced và rule security group **một cách tập trung cho mọi tài khoản** trong AWS Organizations.

Kiểm toán ai đã thực hiện một lời gọi API là **AWS CloudTrail** (xem chủ đề triển khai và vận hành).

## Bảng từ khóa cho đề thi

| Từ khóa trong tình huống | Dịch vụ |
| --- | --- |
| Tấn công DDoS | AWS Shield |
| SQL injection, cross-site scripting, web ACL | AWS WAF |
| Phát hiện mối đe dọa từ log, DNS và hoạt động mạng | Amazon GuardDuty |
| Quét lỗ hổng cho EC2, container hoặc Lambda | Amazon Inspector |
| Dữ liệu nhạy cảm (PII) trong S3 | Amazon Macie |
| Một bảng điều khiển cho finding và kiểm tra best practice | AWS Security Hub |

## Bẫy thường gặp

- GuardDuty **phát hiện** mối đe dọa; nó không chặn lưu lượng. WAF và Shield **chặn hoặc hấp thụ** tấn công.
- Inspector tìm **lỗ hổng phần mềm**; Macie xem xét **nội dung dữ liệu**.
- "Đội phản ứng DDoS và bảo vệ chi phí" là Shield Advanced.

## Ý chính

- Shield = DDoS; WAF = rule web ở tầng 7.
- GuardDuty = phát hiện mối đe dọa; Inspector = lỗ hổng; Macie = dữ liệu nhạy cảm trong S3.
- Security Hub = tập trung finding và kiểm tra tình trạng bảo mật (security posture); Detective = điều tra.

## Nguồn

- [AWS Shield Standard overview](https://docs.aws.amazon.com/waf/latest/developerguide/ddos-standard-summary.html)
- [What is Amazon GuardDuty?](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html)
- [What is Amazon Inspector?](https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html)
