---
id: pricing-billing-free-tier
title: "AWS Free Tier: gói tài khoản miễn phí và trả phí, credit và các ưu đãi"
required: true
---
## Free Tier đã thay đổi vào năm 2025

AWS đã thay đổi Free Tier cho **các tài khoản tạo từ ngày 15 tháng 7 năm 2025 trở đi**. Các khóa học cũ chỉ mô tả mô hình "miễn phí 12 tháng" trước đây.

## Mô hình hiện tại: credit và hai gói tài khoản

Khi đăng ký, khách hàng mới chọn một **gói tài khoản (account plan)** và nhận **AWS Free Tier credit** để trả cho mức sử dụng đủ điều kiện. Họ có thể nhận thêm credit bằng cách hoàn thành các hoạt động.

- **Gói tài khoản miễn phí (Free account plan)**: để thử nghiệm và xây dựng bản thử nghiệm khái niệm (proof of concept) **không tốn phí**. Gói kéo dài tối đa **sáu tháng hoặc đến khi dùng hết credit**, tùy điều kiện nào đến trước. Một số dịch vụ có thể nhanh chóng tiêu hết credit không có trong gói này. Bạn **không bị tính phí** trừ khi nâng cấp lên gói trả phí. Khi gói miễn phí kết thúc, AWS tạm ngừng tài khoản và giữ dữ liệu trong một thời gian giới hạn; bạn nâng cấp để tiếp tục dùng.
- **Gói tài khoản trả phí (Paid account plan)**: cho công việc production với **quyền dùng mọi dịch vụ**. Credit vẫn được trừ trước; sau đó, mức sử dụng được tính theo giá **pay-as-you-go** tiêu chuẩn.

## Các loại ưu đãi

- **Always Free (luôn miễn phí)**: hạn mức hằng tháng lâu dài cho một số dịch vụ (hơn 30 dịch vụ), có ở cả hai gói. Phần dùng vượt hạn mức được trả bằng credit, hoặc bị tính phí ở gói trả phí.
- **Dùng thử ngắn hạn (short-term trials)**: dùng thử miễn phí một số dịch vụ, bắt đầu khi bạn kích hoạt dịch vụ đó. Chúng áp dụng cho tài khoản gói trả phí.
- **Miễn phí 12 tháng** (mô hình cũ): các tài khoản tạo **trước ngày 15 tháng 7 năm 2025** dùng cấu trúc cũ gồm ưu đãi Always Free, dùng thử ngắn hạn và ưu đãi miễn phí trong **12 tháng sau khi đăng ký**. Các khoảng 12 tháng đó nay đã kết thúc, nhưng câu hỏi thi soạn từ trước vẫn có thể nhắc tới chúng.

AWS thay đổi hạn mức miễn phí và giá trị credit theo thời gian, nên hãy xem trang Free Tier thay vì học thuộc các con số.

## Tránh hóa đơn bất ngờ

- **Console Billing and Cost Management** hiển thị **mức dùng Free Tier** hiện tại và dự báo, và AWS có thể gửi cảnh báo khi bạn gần chạm hạn mức.
- Tạo một cost budget trong **AWS Budgets** có cảnh báo qua email ngay khi mở tài khoản.
- Hạn mức miễn phí có **giới hạn hằng tháng**; tài nguyên không dùng mà vẫn để chạy vẫn có thể tốn tiền ở gói trả phí.

## Bẫy thường gặp

- Free Tier không phải là "mọi thứ miễn phí trong một năm": credit và gói miễn phí dành cho khách hàng **mới**, và mọi ưu đãi đều có giới hạn.
- Ở **gói miễn phí** bạn không bị tính phí, nhưng tài khoản ngừng hoạt động khi hết hạn trừ khi bạn nâng cấp.
- Ưu đãi Always Free không hết hạn, nhưng có giới hạn hằng tháng.

## Ý chính

- Từ ngày 15/7/2025: credit cùng với gói miễn phí (tối đa sáu tháng) hoặc gói trả phí.
- Loại ưu đãi: Always Free và dùng thử ngắn hạn; ưu đãi 12 tháng thuộc mô hình cũ.
- Theo dõi mức dùng Free Tier trong console Billing và đặt cảnh báo ngân sách.

## Nguồn

- [Explore AWS services with AWS Free Tier](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html)
- [Track your Free Tier usage for Amazon EC2 (before and after July 15, 2025)](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html)
- [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/)
