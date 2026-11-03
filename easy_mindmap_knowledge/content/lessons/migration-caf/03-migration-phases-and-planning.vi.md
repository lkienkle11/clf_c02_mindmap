---
id: migration-caf-phases
title: "Các giai đoạn di chuyển và công cụ lập kế hoạch: assess, mobilize, migrate"
required: true
---
## Ba giai đoạn

Hướng dẫn của AWS chia một đợt di chuyển lớn thành ba giai đoạn lặp lại. Giai đoạn cuối thường được gọi là **migrate and modernize (di chuyển và hiện đại hóa)**.

1. **Assess (đánh giá)**: hiểu hiện trạng và xây dựng lập luận. Một **Migration Readiness Assessment** dùng sáu góc nhìn của CAF để chỉ ra điểm mạnh, khoảng trống và kế hoạch hành động, còn một lần khảo sát đầu tiên cho ra **tổng chi phí sở hữu (TCO)** ở mức tổng quan và **business case**.
2. **Mobilize (huy động)**: xây nền móng. Các nhóm khảo sát chi tiết danh mục ứng dụng, chọn chiến lược (một trong 7 R) cho từng ứng dụng, dựng một **landing zone** an toàn và có thể mở rộng (môi trường AWS nhiều tài khoản làm nền tảng), xác định cách làm về bảo mật và vận hành, đào tạo con người, và di chuyển **một nhóm nhỏ ứng dụng đầu tiên** để lấy kinh nghiệm.
3. **Migrate and modernize**: dùng các mẫu và công cụ đã được kiểm chứng ở giai đoạn mobilize để chuyển ứng dụng **ở quy mô lớn**, thường theo từng đợt (wave), rồi tối ưu hoặc hiện đại hóa chúng khi đã chạy trên AWS.

## Công cụ cho giai đoạn assess và mobilize

- **Migration Evaluator**: dịch vụ miễn phí giúp xây dựng **business case** dựa trên dữ liệu bằng cách thu thập inventory và mức sử dụng tại chỗ rồi dự phóng chi phí trên AWS (xem chủ đề giá).
- **AWS Transform**: dịch vụ AI dạng agent (agentic AI) của AWS cho di chuyển và hiện đại hóa. Với di chuyển, nó bao gồm **khảo sát và đánh giá**, lập bản đồ phụ thuộc giữa các ứng dụng và **lập kế hoạch theo đợt (wave planning)**, và là dịch vụ AWS hiện khuyên dùng cho các dự án khảo sát mới.
- **AWS Application Discovery Service**: thu thập dữ liệu cấu hình, mức sử dụng và phụ thuộc mạng của máy chủ tại chỗ, bằng bộ thu thập không cần agent hoặc bằng agent. Dịch vụ này **đóng với khách hàng mới từ ngày 7 tháng 11 năm 2025**; khách hàng hiện có vẫn dùng tiếp được, và AWS hướng khách hàng mới sang AWS Transform.
- **AWS Migration Hub**: một nơi để khảo sát máy chủ, nhóm chúng thành ứng dụng và **theo dõi trạng thái di chuyển** qua nhiều công cụ. Dịch vụ này cũng **không còn mở cho khách hàng mới từ ngày 7 tháng 11 năm 2025**, và AWS gợi ý dùng AWS Transform thay thế.

Câu hỏi thi soạn trước cuối năm 2025 có thể vẫn lấy Application Discovery Service hoặc Migration Hub làm đáp án. Hãy nhận ra chức năng của chúng: **khảo sát** máy chủ (Discovery Service) và **theo dõi** quá trình di chuyển (Migration Hub).

## Bẫy thường gặp

- "Xây dựng business case / TCO cho việc di chuyển" chỉ tới **Migration Evaluator**.
- "Tìm các máy chủ tại chỗ và các phụ thuộc của chúng" là **khảo sát** (Application Discovery Service trong câu hỏi cũ, AWS Transform ngày nay).
- "Một bảng điều khiển để theo dõi tiến độ di chuyển" là **Migration Hub** trong câu hỏi cũ.
- Migration Readiness Assessment được xây dựng dựa trên các góc nhìn của **CAF**.

## Ý chính

- Các giai đoạn: assess, mobilize, migrate and modernize.
- Mobilize dựng landing zone và di chuyển một nhóm nhỏ ứng dụng đầu tiên.
- Migration Evaluator = business case; AWS Transform = khảo sát, lập kế hoạch và hiện đại hóa.
- Application Discovery Service và Migration Hub đã đóng với khách hàng mới.

## Nguồn

- [Overview, AWS Prescriptive Guidance strategy for migration](https://docs.aws.amazon.com/prescriptive-guidance/latest/strategy-migration/overview.html)
- [AWS Application Discovery Service availability change](https://docs.aws.amazon.com/application-discovery/latest/userguide/application-discovery-service-availability-change.html)
- [What is AWS Migration Hub?](https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html)
