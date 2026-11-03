---
id: support-ai-other-getting-help
title: "Tìm trợ giúp và hướng dẫn: Trusted Advisor, re:Post, Professional Services, Partner và Marketplace"
required: true
---
## AWS Trusted Advisor

**AWS Trusted Advisor** kiểm tra tài khoản của bạn và đề xuất cải thiện dựa trên best practice của AWS. Các check chia thành sáu nhóm:

- **Cost optimization (tối ưu chi phí)**: tài nguyên nhàn rỗi hoặc ít dùng.
- **Performance (hiệu năng)**: tốc độ và thông lượng.
- **Security (bảo mật)**: ví dụ MFA cho root user hoặc cổng security group đang mở.
- **Fault tolerance (khả năng chịu lỗi)**: lỗ hổng về khả năng phục hồi, như tài nguyên chỉ nằm trong một Availability Zone.
- **Service limits (giới hạn dịch vụ)**: mức dùng gần chạm **service quota**.
- **Operational excellence (vận hành xuất sắc)**: best practice về vận hành.

Bạn thấy gì tùy vào gói hỗ trợ:

- **Basic Support**: mọi check **service limits** và một vài check **security** và **fault tolerance**, như MFA cho root user và quyền của S3 bucket.
- **Business Support+ trở lên**: **mọi check** và Trusted Advisor API. Enterprise Support thêm **Trusted Advisor Priority**, các đề xuất do nhóm phụ trách tài khoản chọn lọc.

## Những nơi khác để tìm câu trả lời

- **AWS Health Dashboard**: các sự kiện phía AWS và thay đổi theo lịch ảnh hưởng tới tài nguyên của bạn (xem chủ đề triển khai và vận hành). **AWS Health API** cần Business Support+ trở lên.
- **AWS re:Post**: trang hỏi đáp cộng đồng của AWS. Nó cũng chứa **AWS Knowledge Center**, các bài viết chính thức của AWS trả lời những câu hỏi khách hàng hay gặp.
- **Tài liệu, whitepaper, blog và AWS Prescriptive Guidance** trên các trang web của AWS.
- **Nhóm AWS Trust and Safety**: nơi bất kỳ ai cũng có thể báo cáo **lạm dụng (abuse)** xuất phát từ tài nguyên AWS, như spam.

## Những người giúp bạn xây dựng

- **AWS Professional Services**: các chuyên gia của chính AWS làm việc trong dự án của khách hàng, thường cùng với partner. **Solutions architect của AWS** cũng đưa ra hướng dẫn kỹ thuật.
- **AWS Partner Network (APN)**: cộng đồng toàn cầu gồm các công ty xây dựng trên AWS, như **nhà cung cấp phần mềm độc lập (ISV)** và partner **tư vấn hoặc tích hợp hệ thống (system integrator)**. Partner được hưởng đào tạo, chứng chỉ và sự kiện.
- **AWS Marketplace**: danh mục số được chọn lọc để **tìm, mua và triển khai phần mềm, dữ liệu và dịch vụ của bên thứ ba**, như sản phẩm SaaS và AMI, với cách tính giá như theo giờ, theo năm hoặc mang giấy phép riêng (BYOL). Chi phí hiện trên **hóa đơn AWS của bạn**.

## Tài nguyên nào?

| Dấu hiệu trong câu hỏi | Đáp án |
| --- | --- |
| "Kiểm tra tài khoản về chi phí, bảo mật và quota" | AWS Trusted Advisor |
| "Hỏi cộng đồng" hoặc "bài hướng dẫn chính thức" | AWS re:Post, AWS Knowledge Center |
| "Báo cáo một EC2 instance đang gửi spam" | Nhóm AWS Trust and Safety |
| "Thuê một công ty tư vấn có chuyên môn AWS" | AWS Partner Network |
| "Mua một firewall bên thứ ba và trả tiền qua hóa đơn AWS" | AWS Marketplace |

## Bẫy thường gặp

- Trusted Advisor chỉ **đề xuất**; AWS Health Dashboard báo cáo sự kiện.
- Marketplace bán sản phẩm **bên thứ ba**; Professional Services là đội ngũ **của AWS**.

## Ý chính

- Trusted Advisor: sáu nhóm check; Basic thấy service limits cộng một vài check khác.
- re:Post và Knowledge Center trả lời câu hỏi; Trust and Safety xử lý báo cáo lạm dụng.
- Partner và Professional Services giúp bạn xây dựng; Marketplace bán sản phẩm bên thứ ba.

## Nguồn

- [AWS Trusted Advisor](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html)
- [AWS Trusted Advisor check reference](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor-check-reference.html)
- [What is AWS Marketplace?](https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html)
