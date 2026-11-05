---
id: support-ai-other-support-plans
title: "Các gói AWS Support: Basic, Business Support+, Enterprise Support và Unified Operations"
required: true
---
## Bốn gói hiện nay

AWS hiện liệt kê bốn gói AWS Support. Mọi tài khoản đều có **AWS Basic Support**; ba gói còn lại là gói trả phí, tính tiền theo tháng. Business Support+ và Enterprise Support cam kết tối thiểu 30 ngày, còn Unified Operations tối thiểu 90 ngày.

- **Basic Support** (có sẵn, không tốn thêm phí): dịch vụ khách hàng 24/7 cho **câu hỏi về tài khoản và thanh toán** và **yêu cầu tăng service quota**, tài liệu, whitepaper và AWS re:Post, AWS Health Dashboard, và các check **cốt lõi (core)** của AWS Trusted Advisor. Basic **không** có case hỗ trợ kỹ thuật với kỹ sư.
- **AWS Business Support+**: AWS gọi đây là gói tối thiểu được khuyên dùng cho **workload production**. Gói này thêm **truy cập 24/7 qua điện thoại, web và chat tới Cloud Support Engineer**, trợ giúp bằng AI hiểu ngữ cảnh, **toàn bộ** check của Trusted Advisor, **AWS Support API** và AWS Health API, hỗ trợ các phần mềm bên thứ ba phổ biến trên EC2, và số case không giới hạn do bất kỳ người dùng nào có quyền mở. Giá bắt đầu từ **29 USD mỗi tháng** cho mỗi tài khoản.
- **AWS Enterprise Support**: mọi thứ của Business Support+, cộng thêm một **Technical Account Manager (TAM) được chỉ định riêng**, phản hồi nhanh hơn cho case nghiêm trọng với production, buổi đánh giá chiến lược kinh doanh, quyền dùng AWS Security Incident Response, Trusted Advisor Priority và hỗ trợ AWS Countdown cho các sự kiện quan trọng như ra mắt sản phẩm. Mức tối thiểu là **5.000 USD mỗi tháng**.
- **AWS Unified Operations**: mức cao nhất, có TAM được chỉ định và **Domain Specialist Engineer**, hướng dẫn kiến trúc ứng dụng, quản lý sự kiện hạ tầng và đánh giá workload quan trọng. Mức tối thiểu là 50.000 USD mỗi tháng.

## So sánh các gói

| Nhu cầu | Gói thấp nhất đáp ứng được |
| --- | --- |
| Hỗ trợ tài khoản và thanh toán, tài liệu, check cốt lõi | Basic |
| Truy cập kỹ sư 24/7, toàn bộ check Trusted Advisor, Support API | Business Support+ |
| TAM được chỉ định riêng và đánh giá chiến lược | Enterprise Support |
| Chuyên gia theo lĩnh vực cho ứng dụng trọng yếu | Unified Operations |

### Hướng dẫn kiến trúc theo gói

| Gói | Cách AWS ghi trong bảng so sánh gói |
| --- | --- |
| Business Support+ | Hướng dẫn theo ngữ cảnh các trường hợp sử dụng của bạn |
| Enterprise Support | Đánh giá và hướng dẫn tư vấn dựa trên ứng dụng của bạn, kèm Well-Architected Review do TAM dẫn dắt |
| Unified Operations | Đánh giá kiến trúc liên tục với chuyên gia lĩnh vực được chỉ định, cùng Critical Workload Review |

## Mục tiêu thời gian phản hồi

Bạn chọn **mức độ nghiêm trọng (severity)** khi mở case trong **AWS Support Center**. AWS mô tả thời gian phản hồi đầu tiên là mục tiêu mà họ nỗ lực hợp lý để đạt được.

| Severity | Phản hồi đầu tiên |
| --- | --- |
| General guidance (hướng dẫn chung) | 24 giờ |
| System impaired | 12 giờ |
| Production system impaired | 4 giờ |
| Production system down | 1 giờ |
| Business-critical system down | Business Support+ dưới 30 phút; Enterprise Support dưới 15 phút; Unified Operations 5 phút từ một Incident Management Engineer |

## Tên gói cũ

Nhiều câu hỏi thi dùng các gói trước đây: **Developer**, **Business**, **Enterprise On-Ramp** và **Enterprise**. AWS ngừng Developer, Business và Enterprise On-Ramp vào **ngày 1 tháng 1 năm 2027** (chúng vẫn có ở AWS GovCloud (US)). Khách hàng Developer và Business có thể chuyển sang Business Support+, còn khách hàng Enterprise On-Ramp đang được chuyển sang Enterprise Support trong năm 2026.

| Gói cũ | AWS ghi gì | Ngày nay |
| --- | --- | --- |
| AWS Developer Support | Truy cập qua email trong giờ làm việc tới Cloud Support engineer; bảy check cốt lõi của Trusted Advisor | Business Support+ |
| Business | Truy cập 24/7 qua điện thoại, chat và web tới Cloud Support Engineer; phản hồi trong 1 giờ cho production system down; toàn bộ check Trusted Advisor | Business Support+ |
| AWS Enterprise On-Ramp Support | Có TAM, phản hồi dưới 30 phút cho case trọng yếu, Well-Architected review với số lượng giới hạn, một lần AWS Countdown mỗi năm | Enterprise Support |
| Enterprise | TAM được chỉ định riêng, phản hồi dưới 15 phút, Well-Architected Review do TAM dẫn dắt | Enterprise Support |

Khi một câu hỏi cũ hỏi "gói rẻ nhất có toàn bộ check Trusted Advisor", đáp án khi đó là Business; ngày nay gói tương ứng là Business Support+. Câu hỏi "những gói nào có **TAM**" mong đợi Enterprise On-Ramp và Enterprise. Developer và Business đã đóng đăng ký mới từ ngày 2 tháng 12 năm 2025. AWS nói khách hàng Developer không chọn chuyển sang Business Support+ trước ngày 1 tháng 1 năm 2027 sẽ bị hạ về Basic.

## Khi cách ra đề và tài liệu AWS khác nhau

- Một số câu hỏi hỏi gói nào cho phép gọi API tới AWS Support với chi phí thấp nhất và chọn **Developer**. Nếu một câu hỏi đưa Developer làm gói rẻ nhất có quản lý case bằng chương trình, Developer là đáp án của đề. Tài liệu AWS hiện nay nói Support API cần Business Support+, Enterprise Support hoặc Unified Operations, nên đừng dựa vào đáp án Developer trong dự án thực tế.
- "Developer Forums luôn miễn phí với mọi gói" nói về các diễn đàn cộng đồng mà **AWS re:Post** đã thay thế.

## Bẫy thường gặp

- Basic không có case kỹ thuật với kỹ sư; chỉ có yêu cầu về tài khoản, thanh toán và quota.
- **TAM được chỉ định riêng** nghĩa là Enterprise Support trở lên, không bao giờ là Business Support+.
- **Toàn bộ** check Trusted Advisor và Support API bắt đầu từ Business Support+.
- Khi câu hỏi hỏi Enterprise có thêm gì so với Business, điểm khác biệt theo đáp án là **Technical Account Manager**. Đánh giá kiến trúc tư vấn cũng là tính năng của Enterprise, nhưng không phải đáp án cho "lợi ích bổ sung là gì".

## Ý chính

- Basic miễn phí cho mọi người; Business Support+ là điểm khởi đầu được khuyên dùng cho production.
- Enterprise Support thêm TAM được chỉ định; Unified Operations thêm chuyên gia theo lĩnh vực.
- Developer, Business và Enterprise On-Ramp kết thúc vào ngày 1 tháng 1 năm 2027; đề thi vẫn có thể dùng các tên này.

## Nguồn

- [AWS Support plans](https://docs.aws.amazon.com/awssupport/latest/user/aws-support-plans.html)
- [Developer, Business, and Enterprise On-Ramp end of support](https://docs.aws.amazon.com/awssupport/latest/user/support-plans-eos.html)
- [Compare AWS Support plans](https://aws.amazon.com/premiumsupport/plans/)
