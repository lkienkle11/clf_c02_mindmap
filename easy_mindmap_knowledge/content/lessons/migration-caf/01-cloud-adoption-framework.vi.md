---
id: migration-caf-framework
title: "Vì sao di chuyển lên đám mây, và AWS Cloud Adoption Framework (AWS CAF)"
required: true
---
## Vì sao các tổ chức chuyển lên AWS

Chuyển workload từ trung tâm dữ liệu lên AWS là một quyết định kinh doanh, không chỉ là chuyện kỹ thuật. AWS Cloud Adoption Framework nêu bốn **kết quả kinh doanh (business outcome)** mà chuyển đổi lên đám mây có thể mang lại:

- **Giảm rủi ro kinh doanh**, ví dụ nhờ độ tin cậy, tính liên tục của hoạt động kinh doanh và bảo mật tốt hơn.
- **Cải thiện hiệu quả về môi trường, xã hội và quản trị (ESG)**.
- **Tăng doanh thu**, nhờ sản phẩm mới và phát hành nhanh hơn.
- **Tăng hiệu quả vận hành**, bằng cách tự động hóa và tối ưu cách làm việc.

Các kết quả này đặt trên nền những lợi thế của đám mây đã học ở chủ đề đầu tiên, như đổi chi phí trả trước lấy chi phí biến đổi và vươn ra toàn cầu trong vài phút.

## AWS CAF là gì

**AWS CAF** là bộ hướng dẫn của AWS, đúc kết từ kinh nghiệm với nhiều khách hàng, giúp một tổ chức lập kế hoạch và thực hiện việc chuyển lên đám mây. Nó gom các **năng lực (capability)** mà tổ chức cần thành **sáu góc nhìn (perspective)**. Mỗi góc nhìn thuộc về một nhóm các bên liên quan (stakeholder).

| Góc nhìn | Trọng tâm | Các bên liên quan thường gặp |
| --- | --- | --- |
| Business (Kinh doanh) | Khoản đầu tư vào đám mây giúp đẩy nhanh chuyển đổi số và kết quả kinh doanh | CEO, CFO, COO, CIO, CTO |
| People (Con người) | Văn hóa, cơ cấu tổ chức, năng lực lãnh đạo và kỹ năng của đội ngũ | CIO, COO, CTO, giám đốc đám mây, lãnh đạo liên phòng ban |
| Governance (Quản trị) | Điều phối các sáng kiến đám mây, tối đa hóa lợi ích và giảm thiểu rủi ro | Giám đốc chuyển đổi, CIO, CTO, CFO, giám đốc dữ liệu, giám đốc rủi ro |
| Platform (Nền tảng) | Nền tảng đám mây lai có khả năng mở rộng, hiện đại hóa workload, giải pháp cloud-native | CTO, lãnh đạo công nghệ, kiến trúc sư, kỹ sư |
| Security (Bảo mật) | Tính bảo mật, toàn vẹn và sẵn sàng của dữ liệu và workload | CISO, giám đốc tuân thủ, kiểm toán nội bộ, kiến trúc sư bảo mật |
| Operations (Vận hành) | Cung cấp dịch vụ đám mây ở mức mà doanh nghiệp cần | Lãnh đạo hạ tầng và vận hành, kỹ sư SRE, quản lý dịch vụ CNTT |

Mẹo nhớ: **Business, People, Governance** là các góc nhìn hướng về kinh doanh; **Platform, Security, Operations** là các góc nhìn kỹ thuật.

## Hành trình chuyển đổi

CAF mô tả bốn giai đoạn lặp lại: **Envision** (hình dung đám mây sẽ đẩy nhanh kết quả kinh doanh ra sao), **Align** (tìm khoảng trống năng lực trên sáu góc nhìn), **Launch** (triển khai các dự án thí điểm trong production) và **Scale** (mở rộng các dự án thí điểm và duy trì lợi ích). CAF cũng nêu bốn **lĩnh vực chuyển đổi (transformation domain)**: công nghệ, quy trình, tổ chức và sản phẩm.

## Bẫy thường gặp

- "Đào tạo nhân viên, xây dựng kỹ năng đám mây và thay đổi văn hóa" là góc nhìn **People**, không phải Business.
- "Quản lý chương trình, quản lý rủi ro và quản lý tài chính đám mây" là **Governance**.
- "Thiết kế kiến trúc và một môi trường nhiều tài khoản tuân thủ quy định" là **Platform**; "giữ cho dịch vụ chạy ổn định và được giám sát" là **Operations**.

## Ý chính

- Bốn kết quả: giảm rủi ro, ESG tốt hơn, tăng doanh thu, tăng hiệu quả.
- Sáu góc nhìn: Business, People, Governance, Platform, Security, Operations.
- Các giai đoạn: Envision, Align, Launch, Scale.

## Nguồn

- [Foundational capabilities, An Overview of the AWS CAF](https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/foundational-capabilities.html)
- [Your cloud transformation journey, An Overview of the AWS CAF](https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/your-cloud-transformation-journey.html)
- [Accelerating business outcomes, An Overview of the AWS CAF](https://docs.aws.amazon.com/whitepapers/latest/overview-aws-cloud-adoption-framework/accelerating-business-outcomes.html)
