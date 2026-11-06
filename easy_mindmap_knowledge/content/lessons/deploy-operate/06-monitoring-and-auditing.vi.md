---
id: deploy-operate-monitoring
title: "Giám sát và kiểm toán: CloudWatch, CloudTrail, Config, EventBridge và X-Ray"
required: true
---
## Ba dịch vụ, ba câu hỏi

Đây là một phân biệt được hỏi rất nhiều trong đề thi. Hãy hỏi xem tình huống cần trả lời câu hỏi nào.

| Dịch vụ | Câu hỏi nó trả lời | Ví dụ |
| --- | --- | --- |
| Amazon CloudWatch | Nó đang **hoạt động** thế nào ngay lúc này? | CPU của một EC2 instance trên 80% |
| AWS CloudTrail | **Ai đã làm gì**, khi nào, từ đâu (hoạt động API)? | Ai đã xóa S3 bucket này hôm qua? |
| AWS Config | Tài nguyên này đã được **cấu hình** thế nào, thay đổi ra sao, và có **tuân thủ** quy tắc không? | Security group nào đã cho phép SSH từ mọi nơi vào tháng trước? |

## Amazon CloudWatch

- **Metric**: nhiều dịch vụ AWS tự động gửi metric tới CloudWatch, và bạn có thể đẩy metric tùy chỉnh của riêng mình.
- **Alarm** theo dõi một metric so với một ngưỡng. Khi alarm đổi trạng thái, nó có thể gửi thông báo qua **Amazon SNS**, chạy một **hành động EC2** (như dừng hoặc khởi động lại) hoặc một hành động **EC2 Auto Scaling**.
- **CloudWatch Logs** thu thập và lưu các tệp log từ dịch vụ AWS và ứng dụng của bạn để bạn tìm kiếm và phân tích.
- **Dashboard** hiển thị metric và alarm trong một màn hình.

## AWS CloudTrail

CloudTrail ghi lại **các hành động của người dùng, role hoặc dịch vụ AWS dưới dạng sự kiện (event)**, dù chúng đến từ console, CLI, SDK hay API. **Event history** hiển thị các management event trong 90 ngày gần nhất ở một Region, miễn phí. Để lưu lâu hơn, hãy tạo một **trail** gửi sự kiện tới một S3 bucket. Dùng CloudTrail cho **kiểm toán, điều tra bảo mật và quản trị (governance)**.

## AWS Config

Config lưu **bản ghi chi tiết về cấu hình tài nguyên** và cách chúng thay đổi theo thời gian, kể cả quan hệ giữa các tài nguyên. **Config rule** đánh giá các thiết lập đó và đánh dấu tài nguyên **không tuân thủ (noncompliant)**, ví dụ một EBS volume không được mã hóa. Nó hỗ trợ kiểm toán tuân thủ và xử lý sự cố.

## Amazon EventBridge

**EventBridge** là bộ định tuyến sự kiện serverless. Các rule khớp sự kiện (từ dịch vụ AWS, ứng dụng của bạn hoặc đối tác SaaS) và gửi chúng tới các đích như Lambda function. **EventBridge Scheduler** chạy tác vụ theo lịch. Ví dụ: khi một EC2 instance đổi trạng thái, chạy một Lambda function.

## AWS X-Ray

**X-Ray** thu thập dữ liệu về các **yêu cầu (request)** mà ứng dụng của bạn phục vụ và vẽ một **trace map** các lời gọi giữa các dịch vụ, để bạn tìm điểm nghẽn và lỗi trong ứng dụng phân tán và microservice. Các SDK của X-Ray đã chuyển sang chế độ bảo trì (maintenance mode) từ tháng 2 năm 2026, và AWS khuyên dùng OpenTelemetry để gửi trace tới X-Ray.

## Bẫy thường gặp

- "Ai đã thực hiện thay đổi này?" là **CloudTrail**, không phải CloudWatch.
- "Cảnh báo khi CPU cao" là một **CloudWatch alarm**.
- "Tài nguyên có được cấu hình theo quy tắc của chúng tôi không, và trước đây nó trông thế nào?" là **AWS Config**.
- "Tìm microservice nào làm chậm yêu cầu" là **X-Ray**.

## Ý chính

- CloudWatch = metric hiệu năng, alarm, log.
- CloudTrail = hoạt động API và dấu vết kiểm toán ai đã làm gì.
- Config = lịch sử cấu hình và quy tắc tuân thủ.
- EventBridge định tuyến sự kiện; X-Ray truy vết yêu cầu.

## Nguồn

- [What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html)
- [What is AWS CloudTrail?](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html)
- [What is AWS Config?](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
