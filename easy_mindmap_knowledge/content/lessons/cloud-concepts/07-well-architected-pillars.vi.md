---
id: cloud-concepts-well-architected-pillars
title: Sáu trụ cột Well-Architected chi tiết
required: true
---
## Cách dùng bài này

Bài trước đã liệt kê các trụ cột. Ở đây mỗi trụ cột có định nghĩa ngắn, các nguyên tắc thiết kế chính và từ khóa giúp nhận ra nó trong câu hỏi.

## Operational Excellence

Vận hành và giám sát workload để tạo giá trị kinh doanh, đồng thời liên tục cải tiến quy trình. Các nguyên tắc gồm: tổ chức đội nhóm quanh kết quả kinh doanh, xây dựng khả năng quan sát (observability), **tự động hóa an toàn khi có thể**, **thay đổi nhỏ, thường xuyên, dễ hoàn tác**, cải tiến quy trình vận hành, lường trước sự cố, học từ các sự kiện và dùng managed services. Từ khóa: *tự động hóa, runbook, thay đổi nhỏ, học từ lỗi*.

## Security

Bảo vệ dữ liệu, hệ thống và tài sản. Nguyên tắc: **nền tảng danh tính vững chắc** (đặc quyền tối thiểu), **truy vết được hành động**, **bảo mật ở mọi lớp**, tự động hóa thực hành bảo mật tốt nhất, **bảo vệ dữ liệu khi truyền và khi lưu trữ**, **giữ con người tránh xa dữ liệu** và chuẩn bị cho sự cố bảo mật. Từ khóa: *least privilege, mã hóa, kiểm toán, defense in depth*.

## Reliability

Workload thực hiện đúng chức năng một cách nhất quán và phục hồi được sau sự cố. Năm nguyên tắc: **tự động phục hồi khi lỗi**, **kiểm thử quy trình phục hồi**, **scale ngang** để tăng tính sẵn sàng, **ngừng đoán dung lượng** và **quản lý thay đổi bằng tự động hóa**. Từ khóa: *phục hồi, chịu lỗi, nhiều AZ, sao lưu*.

## Performance Efficiency

Dùng tài nguyên điện toán hiệu quả để đáp ứng yêu cầu và giữ hiệu quả đó khi nhu cầu và công nghệ thay đổi. Năm nguyên tắc: **phổ cập công nghệ tiên tiến** (dùng như một dịch vụ), **go global in minutes**, **dùng kiến trúc serverless**, **thử nghiệm thường xuyên** và **mechanical sympathy** (chọn công nghệ phù hợp cách workload được dùng). Từ khóa: *đúng loại tài nguyên, serverless, Region gần người dùng*.

## Cost Optimization

Mang lại giá trị kinh doanh với mức giá thấp nhất. Nguyên tắc: **triển khai Cloud Financial Management**, **áp dụng mô hình tiêu dùng**, **đo hiệu quả tổng thể**, **ngừng tốn tiền cho undifferentiated heavy lifting** và **phân tích, quy chi phí cho đúng chủ**. Từ khóa: *chỉ trả cho phần đã dùng, gắn tag để phân bổ chi phí, dừng tài nguyên nhàn rỗi*.

## Sustainability

Giảm thiểu tác động môi trường khi chạy workload trên đám mây. Nguyên tắc: hiểu tác động của mình, đặt mục tiêu bền vững, **tối đa hóa mức sử dụng**, dùng phần cứng và phần mềm hiệu quả hơn, **dùng managed services** và giảm tác động ở phía hạ nguồn. Từ khóa: *tiết kiệm năng lượng, tăng mức sử dụng, ít tài nguyên hơn*.

## Dễ nhầm lẫn

| Ý tưởng | Trông như thuộc | Thực ra thuộc |
| --- | --- | --- |
| Stop guessing capacity | Cost Optimization | Reliability (đồng thời là lợi thế của đám mây) |
| Go global in minutes | Reliability | Performance Efficiency |
| Dùng managed services | Chỉ Operational Excellence | Còn có cả Sustainability |
| Traceability | Operational Excellence | Security |
| Ngừng tốn tiền cho undifferentiated heavy lifting | Operational Excellence | Cost Optimization |

Khi câu hỏi hỏi một thực hành hỗ trợ trụ cột nào, hãy tìm **mục tiêu**: luôn hoạt động (Reliability), chi ít hơn (Cost), dùng ít năng lượng hơn (Sustainability), chạy nhanh hoặc vừa vặn hơn (Performance), bảo vệ (Security), vận hành và cải tiến (Operational Excellence).

## Ý chính

- Nhớ định nghĩa một dòng của mỗi trụ cột cùng hai ba nguyên tắc.
- Reliability: tự phục hồi, kiểm thử phục hồi, scale ngang.
- Security: đặc quyền tối thiểu, truy vết, bảo vệ dữ liệu khi lưu trữ và truyền.
- Performance Efficiency: serverless, go global, thử nghiệm.
- Cost Optimization: mô hình tiêu dùng, quy chi phí; Sustainability: tối đa hóa mức sử dụng.

## Nguồn

- [The pillars of the framework, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html)
- [Reliability pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel-dp.html)
- [Security pillar design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/sec-design.html)
