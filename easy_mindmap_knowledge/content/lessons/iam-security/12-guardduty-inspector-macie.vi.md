---
id: iam-security-guardduty-inspector-macie
title: "Tìm ra vấn đề: Amazon GuardDuty, Amazon Inspector và Amazon Macie"
required: true
---
## Phát hiện, quét, khám phá

Ba dịch vụ này **tìm ra** vấn đề và báo cáo dưới dạng **finding (phát hiện)**. Không dịch vụ nào chặn lưu lượng; việc chặn thuộc về WAF, Shield và các biện pháp kiểm soát mạng. Cả ba đều có thể được quản lý cho nhiều tài khoản qua AWS Organizations, và gửi finding tới Amazon EventBridge và AWS Security Hub.

## Amazon GuardDuty: mối đe dọa

**Amazon GuardDuty** là dịch vụ phát hiện mối đe dọa, liên tục theo dõi và phân tích các nguồn dữ liệu và log, dùng các nguồn tình báo mối đe dọa (như danh sách địa chỉ IP và tên miền độc hại) cùng machine learning.

- **Nguồn dữ liệu nền tảng (foundational)**: các sự kiện quản lý của AWS CloudTrail, VPC Flow Logs và log DNS. Khi bạn bật GuardDuty, nó tự bắt đầu thu nhận chúng; bạn không phải bật các log đó hay cài đặt gì cho phần phát hiện cốt lõi này.
- **Protection plan** là các phần bổ sung tùy chọn cho thêm nguồn dữ liệu, như **S3 Protection**, log kiểm toán EKS, hoạt động đăng nhập RDS, hoạt động mạng của Lambda, quét mã độc cho EBS volume và tệp tải lên S3, cùng Runtime Monitoring. Runtime Monitoring dùng một agent bảo mật của GuardDuty; các phát hiện cốt lõi khác thì không.
- Finding điển hình: thông tin xác thực bị xâm phạm hoặc bị đánh cắp, đào tiền mã hóa trái phép, giao tiếp với địa chỉ IP độc hại, mã độc.
- Lần đầu bật, bạn có 30 ngày dùng thử miễn phí.

Câu hỏi nói "liên tục giám sát tài khoản, workload và S3 bucket để tìm hoạt động độc hại" hoặc "chủ động phát hiện một instance hay tài khoản bị xâm phạm" là GuardDuty. Nó phát hiện; nó không ngăn chặn tấn công.

## Amazon Inspector: lỗ hổng

**Amazon Inspector** là dịch vụ quản lý lỗ hổng. Nó tự động khám phá và liên tục quét **Amazon EC2 instance, container image trong Amazon ECR và AWS Lambda function** để tìm **lỗ hổng phần mềm (CVE)** và **phơi bày mạng ngoài ý muốn (unintended network exposure)**.

- Bạn không phải lên lịch quét: Inspector quét lại khi có thay đổi, như cài gói mới, bản vá hoặc một CVE mới.
- Mỗi finding có **Inspector risk score** được điều chỉnh theo môi trường của bạn, kèm hướng dẫn khắc phục; finding đã được sửa sẽ tự đóng.
- Việc quét EC2 dùng AWS Systems Manager Agent hoặc phương pháp không cần agent; cũng có quét kho mã nguồn.

**Trạng thái và cách gọi cũ:** **Amazon Inspector Classic** ban đầu, vốn chạy các **assessment template** dựa trên agent, đã hết hỗ trợ vào ngày 20/5/2026. Dịch vụ hiện nay đơn giản gọi là Amazon Inspector. Các câu hỏi thi về "assessment template" hay "đánh giá EC2 về lỗ hổng" vẫn có đáp án là Inspector. Khi một kịch bản yêu cầu đánh giá lỗ hổng cho EC2 và Inspector nằm trong các lựa chọn, đó nhiều khả năng là đáp án; Trusted Advisor hoặc AWS Config phù hợp với việc kiểm tra thực hành tốt nhất hay cấu hình thuần túy.

## Amazon Macie: dữ liệu nhạy cảm trong S3

**Amazon Macie** khám phá dữ liệu nhạy cảm bằng **machine learning và so khớp mẫu (pattern matching)**.

- **Managed data identifier** phát hiện nhiều loại thông tin định danh cá nhân (PII), dữ liệu tài chính và thông tin xác thực. **Custom data identifier** (biểu thức chính quy do bạn định nghĩa) có thể tìm các mẫu độc quyền hoặc sở hữu trí tuệ của riêng bạn.
- Macie giữ một **bản kiểm kê các S3 general purpose bucket** của bạn và đánh giá bảo mật cùng kiểm soát truy cập của chúng, tạo **policy finding** cho các vấn đề như bucket truy cập công khai. Object chứa dữ liệu nhạy cảm tạo ra **sensitive data finding**.
- Nó chạy khám phá tự động, hoặc các job khám phá do bạn định nghĩa; 30 ngày đầu là dùng thử miễn phí.

"Khám phá và bảo vệ dữ liệu nhạy cảm trong S3", "tìm PII" và "phân loại dữ liệu nhạy cảm hoặc sở hữu trí tuệ" là Macie. Macie nhìn **thứ nằm trong** dữ liệu; Inspector nhìn **phần mềm**; GuardDuty theo dõi **hành vi**.

## Cái gì tìm ra cái gì

| Câu hỏi | Dịch vụ | Xem xét gì |
| --- | --- | --- |
| Có hoạt động độc hại hay thông tin xác thực bị xâm phạm trong tài khoản của tôi không? | GuardDuty | Sự kiện CloudTrail, VPC Flow Logs, log DNS, cùng các nguồn tùy chọn |
| EC2 instance, container image hoặc Lambda function của tôi có lỗ hổng đã biết không? | Inspector | Gói phần mềm và mức phơi bày mạng |
| Dữ liệu nhạy cảm lưu ở đâu trong S3, và bucket có công khai hay được chia sẻ không? | Macie | Object S3 và thiết lập bucket |
| Tài nguyên nào của tôi được chia sẻ cho tài khoản bên ngoài? | IAM Access Analyzer | Resource policy |

Muốn "một nơi xem tất cả các cảnh báo này", xem bài tiếp theo.

## Ý chính

- GuardDuty: phát hiện mối đe dọa từ log; không cần agent cho các tính năng cốt lõi; chỉ phát hiện.
- Inspector: quét lỗ hổng và mức phơi bày của EC2, ECR image và Lambda; Classic đã kết thúc ngày 20/5/2026.
- Macie: dùng machine learning để khám phá dữ liệu nhạy cảm trong S3 và cảnh báo bucket bị phơi bày.

## Nguồn

- [What is Amazon GuardDuty?](https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html)
- [What is Amazon Inspector?](https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html)
- [What is Amazon Macie?](https://docs.aws.amazon.com/macie/latest/user/what-is-macie.html)
