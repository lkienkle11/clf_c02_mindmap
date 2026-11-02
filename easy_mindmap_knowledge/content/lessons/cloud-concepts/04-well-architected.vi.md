---
id: cloud-concepts-well-architected
title: AWS Well-Architected Framework và các nguyên tắc thiết kế trên đám mây
required: true
---
## Framework này là gì

**AWS Well-Architected Framework** là tập hợp các thực hành tốt và câu hỏi giúp bạn rà soát một workload để tìm chỗ cần cải thiện. Nó được tổ chức thành **sáu trụ cột (pillar)**. Nếu bỏ qua bất kỳ trụ cột nào, hệ thống có thể không đáp ứng được kỳ vọng.

## Sáu trụ cột

| Trụ cột | Trọng tâm | Từ khóa thường gặp trong câu hỏi |
| --- | --- | --- |
| Operational Excellence | Vận hành, giám sát hệ thống và liên tục cải tiến quy trình | Tự động hóa vận hành, thay đổi nhỏ và có thể hoàn tác, học từ sự cố |
| Security | Bảo vệ thông tin và hệ thống | Đặc quyền tối thiểu, truy vết, mã hóa |
| Reliability | Thực hiện đúng chức năng và phục hồi nhanh sau sự cố | Tự động phục hồi, kiểm thử phục hồi, nhiều AZ |
| Performance Efficiency | Dùng tài nguyên CNTT và điện toán hiệu quả khi nhu cầu thay đổi | Chọn đúng loại tài nguyên, vươn ra toàn cầu, serverless |
| Cost Optimization | Tránh chi phí không cần thiết | Chỉ trả cho phần dùng, tắt tài nguyên nhàn rỗi |
| Sustainability | Giảm tác động môi trường của workload trên đám mây | Tăng mức sử dụng, ít tài nguyên hơn cho cùng kết quả |

Mẹo nhớ: Sustainability là trụ cột **mới nhất**; đề thi có thể chỉ liệt kê năm trụ cột và hỏi trụ cột nào bị thiếu.

## Các nguyên tắc thiết kế cần biết

Framework và các trụ cột có chung một số ý tưởng thiết kế trên đám mây, xuất hiện thường xuyên trong đề thi:

- **Stop guessing capacity (thôi đoán năng lực)**: theo dõi nhu cầu và tự động thêm hoặc bớt tài nguyên.
- **Scalability và elasticity**: *scalability* (khả năng mở rộng) là khả năng lớn lên để chịu tải nhiều hơn; *elasticity* (tính co giãn) là thêm tài nguyên khi nhu cầu tăng và **trả lại** khi nhu cầu giảm, để không phải trả tiền cho năng lực nhàn rỗi.
- **Scale horizontally (mở rộng theo chiều ngang)**: thay một tài nguyên lớn bằng nhiều tài nguyên nhỏ để một sự cố đơn lẻ ít ảnh hưởng hơn.
- **Loose coupling (liên kết lỏng)**: nối các thành phần qua hàng đợi, luồng dữ liệu, quy trình (workflow) hoặc bộ cân bằng tải để thay đổi hay sự cố ở một thành phần không làm hỏng các thành phần khác. Amazon SQS là ví dụ kinh điển.
- **High availability và design for failure (thiết kế cho sự cố)**: giả định rằng thành phần nào cũng có thể hỏng. Chạy nhiều bản sao trên nhiều Availability Zone và tự động phục hồi.
- **Kiểm thử quy trình phục hồi** và **tự động hóa thay đổi**, để sự cố được tập dượt trước và thay đổi có thể lặp lại.

## Ý chính

- Sáu trụ cột: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability.
- Reliability = phục hồi sau sự cố; Performance Efficiency = dùng tài nguyên hiệu quả.
- Elasticity là co giãn cả lên **lẫn xuống** theo nhu cầu.
- Loose coupling giới hạn phạm vi lan rộng của một sự cố.
- Design for failure: không có điểm lỗi đơn lẻ; dùng nhiều AZ.

## Nguồn

- [The pillars of the framework, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html)
- [Reliability pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/design-principles.html)
- [REL04-BP02 Implement loosely coupled dependencies](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_loosely_coupled_system.html)
