---
id: shared-responsibility-acceptable-use-and-pen-testing
title: "Sử dụng chấp nhận được, kiểm thử xâm nhập và báo cáo lạm dụng"
required: false
---
## Những quy tắc đi kèm trách nhiệm

Chịu trách nhiệm bảo mật **trong** đám mây cũng bao gồm việc tuân thủ các quy tắc AWS đặt ra khi dùng dịch vụ. Có ba chủ đề quan trọng: Acceptable Use Policy, chính sách kiểm thử xâm nhập và báo cáo lạm dụng.

## AWS Acceptable Use Policy

**AWS Acceptable Use Policy** cấm dùng dịch vụ AWS cho các mục đích như:

- kế hoạch tội phạm hoặc lừa đảo;
- xâm phạm quyền của người khác;
- đe dọa hoặc cổ vũ bạo lực, gây hại nghiêm trọng;
- bóc lột hoặc xâm hại tình dục trẻ em;
- làm tổn hại tính bảo mật, toàn vẹn hoặc tính sẵn sàng của bất kỳ người dùng, hệ thống hay mạng nào;
- gửi thư rác hàng loạt không được yêu cầu (spam).

AWS có thể điều tra các vi phạm bị nghi ngờ, gỡ hoặc vô hiệu hóa nội dung hay tài nguyên vi phạm, và mong bạn hợp tác khắc phục.

## Kiểm thử xâm nhập (penetration testing)

Bạn được kiểm thử bảo mật cho tài nguyên **của chính mình**. Với danh sách các dịch vụ được phép, AWS cho phép kiểm thử **không cần phê duyệt trước**. Danh sách gồm ví dụ Amazon EC2, Amazon RDS, Amazon Aurora, Amazon CloudFront, AWS Lambda, AWS Elastic Beanstalk và AWS Fargate. Danh sách thay đổi theo thời gian nên hãy kiểm tra trang hiện hành. Một số dịch vụ có giới hạn bổ sung, chẳng hạn kiểm thử chiều đi ra từ API Gateway.

Các hoạt động AWS liệt kê là **bị cấm**:

- Tấn công từ chối dịch vụ (**DoS**) và DoS phân tán (**DDoS**).
- Mô phỏng DoS hoặc DDoS, trừ khi theo chính sách DDoS Simulation Testing.
- Flood cổng, flood giao thức và flood yêu cầu (ví dụ flood đăng nhập hoặc API).
- DNS zone walking, hijacking hoặc pharming qua Amazon Route 53.
- Chiếm quyền bucket S3 và chiếm quyền subdomain.

Các sự kiện mô phỏng khác, như diễn tập red, blue hay purple team, phishing giả lập hoặc kiểm thử mã độc, cần gửi **biểu mẫu Simulated Events** qua AWS Support console ít nhất hai tuần trước ngày bắt đầu. Kiểm thử tải mạng theo chính sách riêng.

Nếu bạn phát hiện vấn đề bảo mật trong một dịch vụ AWS khi kiểm thử, hãy liên hệ AWS Security (aws-security@amazon.com) ngay.

### Góc nhìn khi thi

- Khách hàng được pen test các dịch vụ được phép **mà không cần phê duyệt trước**.
- Tấn công làm quá tải mục tiêu (DoS/DDoS) bị cấm, và mô phỏng DDoS phải theo đúng quy trình.
- Bạn kiểm thử tài nguyên **của mình**; không được tấn công hạ tầng AWS hay khách hàng khác.

## Báo cáo lạm dụng

Nếu bạn tin ai đó dùng tài nguyên AWS để lạm dụng (spam, lưu trữ mã độc, tấn công), hãy báo cáo qua **quy trình báo cáo lạm dụng của AWS** được liên kết từ trang chính sách. Nếu AWS nhận báo cáo lạm dụng về tài nguyên của bạn, AWS sẽ chuyển cho bạn và mong bạn phản hồi mô tả trường hợp sử dụng cùng đầu mối liên hệ.

## Bằng chứng tuân thủ

Với báo cáo kiểm toán và thỏa thuận của AWS, hãy dùng **AWS Artifact**; nội dung này nằm trong bài về tuân thủ.

## Ý chính

- Acceptable Use Policy cấm việc dùng bất hợp pháp, gây hại, spam và làm tổn hại bảo mật.
- Dịch vụ được phép có thể pen test không cần phê duyệt trước; DoS và DDoS bị cấm.
- Sự kiện mô phỏng và mô phỏng DDoS theo quy trình riêng, có thông báo trước.
- Báo cáo lạm dụng qua quy trình của AWS; báo lỗ hổng trong dịch vụ AWS cho AWS Security.

## Nguồn

- [Penetration testing](https://aws.amazon.com/security/penetration-testing/)
- [AWS Acceptable Use Policy](https://aws.amazon.com/aup/)
