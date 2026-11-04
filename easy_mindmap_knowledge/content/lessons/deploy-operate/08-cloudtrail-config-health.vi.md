---
id: deploy-operate-cloudtrail-config-health
title: "Ai làm, cái gì đã đổi, vì sao chậm: CloudTrail, Config, X-Ray và Health Dashboard"
required: true
videoQuery: CloudTrail vs AWS Config vs X-Ray vs AWS Health Dashboard which service answers which question
---
## AWS CloudTrail: ai đã làm gì

**AWS CloudTrail** ghi lại hoạt động trong tài khoản của bạn dưới dạng **event**: các lệnh gọi API và thao tác thực hiện qua console, CLI, SDK và các dịch vụ AWS khác, gồm ai gọi, từ đâu và khi nào. Nó là nhật ký kiểm toán.

- **Event history** luôn bật và xem miễn phí. Nó hiển thị **90 ngày** gần nhất của **management event** (các thao tác mặt phẳng điều khiển như tạo, sửa hoặc xóa tài nguyên) trong một Region. Nó không thể bị sửa đổi và tìm kiếm được.
- **Trail** chuyển event vào một **bucket Amazon S3** để lưu lâu hơn và phân tích. Trail ghi management event theo mặc định.
- **Data event** ghi các thao tác trên dữ liệu bên trong tài nguyên, ví dụ đọc object trong bucket S3. Chúng **tắt theo mặc định**, bạn chọn tài nguyên cần ghi, và bị tính phí.
- Gửi một bản sao management event vào S3 qua trail là miễn phí; bạn trả tiền cho lưu trữ S3 và cho data event.
- **CloudTrail Lake**, kho được quản lý hỗ trợ truy vấn SQL, đã đóng cho khách hàng mới từ ngày 31/5/2026. Khách hàng hiện tại vẫn dùng được, còn trail và event history không bị ảnh hưởng.

Câu hỏi điển hình: "User nào đã xóa instance hôm thứ Ba tuần trước?" hoặc "IAM user nào đã đổi quy tắc security group?" Đáp án là CloudTrail. CloudWatch không biết ai đã làm.

## AWS Config: cái gì đã đổi và có tuân thủ không

**AWS Config** giữ danh mục tài nguyên và ghi lại từng tài nguyên được **cấu hình thế nào theo thời gian**, kể cả quan hệ giữa các tài nguyên. Nó hiển thị dòng thời gian các cấu hình trước đây và gửi thông báo khi có thay đổi.

- **Config rule** đánh giá cấu hình đã ghi so với thiết lập mong muốn, dùng **managed rule** của AWS hoặc rule do bạn viết, rồi đánh dấu tài nguyên là **compliant** hoặc **noncompliant**. Ví dụ: kiểm tra mọi EBS volume đều được mã hóa.
- Kết quả noncompliant có thể kích hoạt một **remediation action**, mà AWS Config chạy qua một runbook của Systems Manager Automation.
- Vì lưu lịch sử và trạng thái tuân thủ, Config tạo ra bằng chứng cho **kiểm toán viên** và các đợt rà soát tuân thủ, đồng thời giúp xử lý sự cố bằng cách xem tài nguyên trước đó trông thế nào.

CloudTrail và Config bổ trợ nhau: Config cho thấy thay đổi cấu hình, còn CloudTrail cho thấy lệnh gọi API gây ra thay đổi đó.

## AWS X-Ray: vì sao chậm

**AWS X-Ray** thu thập dữ liệu về các **request** mà ứng dụng của bạn phục vụ và về các lệnh gọi tới dịch vụ AWS, cơ sở dữ liệu và web API phía sau. **Trace map** của nó hiển thị client, dịch vụ front-end và các dịch vụ backend, giúp bạn phát hiện điểm nghẽn, đỉnh độ trễ và lỗi trong ứng dụng microservice. AWS Lambda và AWS Elastic Beanstalk nằm trong số các dịch vụ tích hợp với nó.

Ghi chú trạng thái: bản thân X-Ray vẫn hoạt động, nhưng các SDK và daemon của nó đã vào chế độ maintenance từ 25/2/2026, nên AWS chỉ phát hành bản vá bảo mật cho chúng. AWS khuyên dùng OpenTelemetry để instrument, và CloudWatch agent có thể gửi trace tới X-Ray.

## AWS Health Dashboard: AWS có đang gặp sự cố không

**AWS Health** báo cáo các event có thể ảnh hưởng tới dịch vụ và tài nguyên AWS của bạn. **AWS Health Dashboard** đã hợp nhất **Service Health Dashboard** và **Personal Health Dashboard** trước đây, nên cách diễn đạt cũ trong đề thi vẫn có thể dùng các tên đó.

| Chế độ xem | Ai xem được | Hiển thị gì |
| --- | --- | --- |
| Service health | Bất kỳ ai, không cần đăng nhập hay tài khoản | Các event công khai của dịch vụ AWS ở mọi Region, kèm lịch sử dịch vụ 12 tháng gần nhất |
| Your account health | Người đã đăng nhập | Các event riêng của tài khoản và tài nguyên của bạn, gồm thay đổi đã lên lịch như ngừng hoạt động instance |

Dashboard miễn phí cho mọi khách hàng. Event của Health cũng có thể chuyển sang **Amazon EventBridge** mà không tốn thêm phí, đó là cách bạn tự động hóa phản ứng. Service health còn có RSS feed, dù AWS khuyên dùng EventBridge cho việc xử lý bằng chương trình. AWS Health API cần gói Support cấp Business hoặc Enterprise.

## Dịch vụ nào trả lời câu hỏi nào

| Câu hỏi | Dịch vụ |
| --- | --- |
| Ai đã gọi API này, vào lúc nào? | CloudTrail |
| Tháng trước tài nguyên này trông thế nào, và cái gì đã đổi? | AWS Config |
| Tài nguyên này có tuân thủ quy tắc của chúng ta không? | AWS Config |
| CPU hiện tại bao nhiêu, và cảnh báo cho tôi | CloudWatch |
| Phần nào của ứng dụng đang chậm hoặc lỗi? | X-Ray |
| Sự cố AWS có ảnh hưởng tài nguyên của tôi không, hoặc sắp có bảo trì? | AWS Health Dashboard |
| Tự động phản ứng khi có việc xảy ra | Amazon EventBridge |

## Bẫy thường gặp

- "Kiểm toán hoạt động API" hoặc "xác định người dùng" là CloudTrail, không bao giờ là Config hay Inspector.
- "Đánh giá tuân thủ cấu hình theo thời gian" là Config, không phải CloudTrail.
- "Tình trạng sẵn sàng và vận hành của dịch vụ" hoặc "bảo trì sắp tới cho tài khoản của tôi" là Health Dashboard, không phải Trusted Advisor hay EventBridge.

## Ý chính

- CloudTrail: event history giữ 90 ngày management event, trail ghi vào S3 để lưu lâu hơn; data event tắt theo mặc định.
- Config: lịch sử cấu hình và rule tuân thủ, có thể kèm remediation.
- X-Ray: truy vết request và trace map; Health Dashboard: tình trạng dịch vụ công khai cùng tình trạng riêng của tài khoản.
- CloudTrail Lake đã đóng cho khách hàng mới.

## Nguồn

- [Working with CloudTrail event history](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html)
- [What is AWS Config?](https://docs.aws.amazon.com/config/latest/developerguide/WhatIsConfig.html)
- [AWS Health Dashboard, service health](https://docs.aws.amazon.com/health/latest/ug/aws-health-dashboard-status.html)
