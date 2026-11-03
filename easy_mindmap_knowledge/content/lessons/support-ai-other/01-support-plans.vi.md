---
id: support-ai-other-support-plans
title: "Các gói AWS Support: Basic, Business Support+, Enterprise Support và Unified Operations"
required: true
---
## Bốn gói hiện nay

AWS hiện liệt kê bốn gói AWS Support. Mọi tài khoản đều có **Basic Support**; ba gói còn lại là gói trả phí, tính tiền theo tháng, không cần hợp đồng dài hạn.

- **Basic Support** (có sẵn, không tốn thêm phí): dịch vụ khách hàng 24/7 cho **câu hỏi về tài khoản và thanh toán** và **yêu cầu tăng service quota**, tài liệu, whitepaper và AWS re:Post, AWS Health Dashboard, và các check **cốt lõi (core)** của AWS Trusted Advisor. Basic **không** có case hỗ trợ kỹ thuật với kỹ sư.
- **AWS Business Support+**: AWS gọi đây là gói tối thiểu được khuyên dùng cho **workload production**. Gói này thêm **truy cập 24/7 qua điện thoại, web và chat tới Cloud Support Engineer**, trợ giúp bằng AI hiểu ngữ cảnh, **toàn bộ** check của Trusted Advisor, **AWS Support API** và AWS Health API, hỗ trợ các phần mềm bên thứ ba phổ biến trên EC2, và số case không giới hạn do bất kỳ người dùng nào có quyền mở.
- **AWS Enterprise Support**: mọi thứ của Business Support+, cộng thêm một **Technical Account Manager (TAM) được chỉ định riêng**, phản hồi nhanh hơn cho case ảnh hưởng nghiêm trọng tới production, buổi đánh giá chiến lược kinh doanh, quyền dùng AWS Security Incident Response, Trusted Advisor Priority và hỗ trợ AWS Countdown cho các sự kiện quan trọng như ra mắt sản phẩm.
- **AWS Unified Operations**: mức cao nhất, có TAM được chỉ định và **Domain Specialist Engineer**, hướng dẫn kiến trúc ứng dụng, quản lý sự kiện hạ tầng và đánh giá workload quan trọng.

## So sánh các gói

| Nhu cầu | Gói thấp nhất đáp ứng được |
| --- | --- |
| Hỗ trợ tài khoản và thanh toán, tài liệu, check cốt lõi | Basic |
| Truy cập kỹ sư 24/7, toàn bộ check Trusted Advisor, Support API | Business Support+ |
| TAM được chỉ định riêng và đánh giá chiến lược | Enterprise Support |
| Chuyên gia theo lĩnh vực cho ứng dụng trọng yếu | Unified Operations |

Mục tiêu thời gian phản hồi phụ thuộc vào **mức độ nghiêm trọng (severity)** bạn chọn khi mở case, từ hướng dẫn chung đến hệ thống kinh doanh trọng yếu bị ngừng. AWS ghi rằng Business Support+ phản hồi dưới 30 phút cho case trọng yếu với kinh doanh, và Enterprise Support phản hồi trong tối đa 15 phút cho case nghiêm trọng với production.

## Tên gói cũ

Nhiều câu hỏi luyện tập dùng các gói trước đây: **Developer**, **Business**, **Enterprise On-Ramp** và **Enterprise**. AWS ngừng Developer, Business và Enterprise On-Ramp vào **ngày 1 tháng 1 năm 2027** (chúng vẫn có ở AWS GovCloud (US)). Khách hàng Developer và Business có thể chuyển sang Business Support+, còn khách hàng Enterprise On-Ramp đang được chuyển sang Enterprise Support trong năm 2026. Khi một câu hỏi cũ hỏi "gói rẻ nhất có toàn bộ check Trusted Advisor", đáp án khi đó là Business; ngày nay gói tương ứng là Business Support+.

## Bẫy thường gặp

- Basic không có case kỹ thuật với kỹ sư; chỉ có yêu cầu về tài khoản, thanh toán và quota.
- **TAM được chỉ định riêng** nghĩa là Enterprise Support trở lên, không bao giờ là Business Support+.
- **Toàn bộ** check Trusted Advisor và Support API bắt đầu từ Business Support+.

## Ý chính

- Basic miễn phí cho mọi người; Business Support+ là điểm khởi đầu được khuyên dùng cho production.
- Enterprise Support thêm TAM được chỉ định; Unified Operations thêm chuyên gia theo lĩnh vực.
- Developer, Business và Enterprise On-Ramp kết thúc vào ngày 1 tháng 1 năm 2027.

## Nguồn

- [AWS Support plans](https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html)
- [Developer, Business, and Enterprise On-Ramp end of support](https://docs.aws.amazon.com/awssupport/latest/user/support-plans-eos.html)
- [Compare AWS Support plans](https://aws.amazon.com/premiumsupport/plans/)
