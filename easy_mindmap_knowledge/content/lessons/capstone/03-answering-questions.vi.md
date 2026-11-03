---
id: capstone-answering
title: "Đọc và trả lời câu hỏi: từ khóa, loại trừ và ôn tập"
required: true
---
## Đọc dòng cuối trước

Phần lớn câu hỏi gồm một tình huống ngắn và một yêu cầu, như "Which AWS service will meet these requirements?". Hãy đọc yêu cầu trước, rồi đọc lướt tình huống để tìm **từ chỉ yêu cầu**. Những từ viết hoa như **MOST**, **LEAST** hoặc **NOT** làm thay đổi đáp án.

## Từ khóa và ý nghĩa

| Cách diễn đạt | Thường hướng tới |
| --- | --- |
| "MOST cost-effective", "LOWEST cost" | Phương án rẻ nhất mà vẫn đáp ứng mọi yêu cầu |
| "LEAST operational overhead" | Dịch vụ được quản lý hoặc serverless, như Lambda hay RDS, thay vì tự quản lý EC2 |
| "Highly available" | Tài nguyên trải trên **nhiều Availability Zone**, thường phía sau load balancer |
| "Fault tolerant" | Workload **vẫn chạy** khi một thành phần hỏng, nhờ có dự phòng sẵn |
| "Disaster recovery", "data sovereignty" | Chọn **Region** có chủ đích |
| "Loosely coupled", "decouple" | Amazon SQS, SNS hoặc EventBridge giữa các thành phần |
| "Customer's responsibility" | Dữ liệu, IAM, vá guest OS, cấu hình |

## Loại trừ rồi mới chọn

1. Gạch các phương án làm **một việc khác**.
2. Gạch các phương án **vi phạm một ràng buộc** (cam kết trả trước khi workload chỉ chạy hai tuần).
3. So các phương án còn lại với **đúng câu chữ** của đề. Khi hai phương án đều dùng được, chọn cái khớp với "most", "least" hoặc "lowest".

Cẩn thận với phương án đúng về mặt nội dung nhưng không trả lời câu hỏi.

## Câu hỏi multiple response

- Đếm số đáp án cần chọn và chọn đúng số đó.
- Xét **từng phương án riêng**: nó có đúng không, và có đáp ứng yêu cầu không?
- Phương án thường đi theo cặp dễ nhầm (Polly và Transcribe); phân biệt được chúng là điều quan trọng.

## Bẫy câu chữ thường gặp

- Dịch vụ **đề xuất** (Trusted Advisor) so với cơ chế **bắt buộc** (SCP hoặc IAM policy).
- **Kiểm toán ai đã làm gì** (CloudTrail) so với **theo dõi số đo** (CloudWatch).
- Tên cũ và mới: AWS Transform MGN trước đây là Application Migration Service; Business Support+ thay cho Business Support.

## Ôn tập với app này

- **Lịch sử**: điểm từng lượt so với vạch 80%, chủ đề cần chú ý và các câu hay sai nhất. Mở một lượt bất kỳ để xem lại các câu của nó.
- **Huy hiệu "Cần ôn"**: một chủ đề đã hoàn thành có huy hiệu "Cần ôn" khi có câu đến hạn ôn. Câu bạn trả lời sai sẽ quay lại vào ngày hôm sau; câu bạn liên tục trả lời đúng sẽ quay lại sau những khoảng dài hơn.
- **Lời nhắc ôn tập hằng ngày**: tối đa một lần mỗi ngày, khi có câu đến hạn, app đề nghị ôn tập. Chọn **Đầy đủ** (mọi chủ đề đến hạn), **Nhanh** (khoảng 15 câu từ các chủ đề bạn quên nhiều nhất) hoặc **Tùy chọn** (các chủ đề bạn đánh dấu). Bài ôn chia thành **lô 15 câu** và ưu tiên các câu bạn từng sai.
- Nút **Ôn tập** trên màn hình chính đưa ra cùng lựa chọn đó bất cứ khi nào có câu đến hạn.

## Ý chính

- Tìm yêu cầu và các từ viết hoa trước khi đọc phương án.
- Loại phương án làm việc khác và phương án vi phạm ràng buộc, rồi đối chiếu đúng câu chữ.
- Dùng Lịch sử, lời nhắc ôn tập và bài thực hành Capstone để ôn phần còn yếu.

## Nguồn

- [AWS Certified Cloud Practitioner (CLF-C02) exam guide](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html)
- [AWS Certification exam prep](https://aws.amazon.com/certification/certification-prep/)
