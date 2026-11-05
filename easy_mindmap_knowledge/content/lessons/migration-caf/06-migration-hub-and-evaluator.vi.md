---
id: migration-caf-migration-hub-and-evaluator
title: "Migration Hub và Migration Evaluator: theo dõi và business case"
required: true
---
## Hai câu hỏi khác nhau

Một cuộc di chuyển lớn đặt ra hai câu hỏi lập kế hoạch. "Có đáng làm không, và tốn bao nhiêu?" được trả lời bằng **business case**. "Chúng ta đang đến đâu rồi?" được trả lời bằng chế độ xem **theo dõi**. **AWS Migration Evaluator** lo câu đầu; **AWS Migration Hub** lo câu sau.

## AWS Migration Evaluator

**Migration Evaluator** (trước đây là **TSO Logic**) giúp bạn xây dựng business case dựa trên dữ liệu cho việc chuyển lên AWS. Đây là dịch vụ **miễn phí (complimentary)**: yêu cầu đánh giá hoặc business case và dùng collector không mất phí, dù sau này bạn vẫn trả tiền cho tài nguyên AWS.

Quy trình:

1. **Thu thập kiểm kê và mức sử dụng.** Cài **agentless collector** miễn phí (một máy ảo trong mạng của bạn, thu thập dữ liệu bằng giao thức chuẩn, không cần cài agent lên máy chủ), hoặc tải lên dữ liệu xuất từ công cụ khác.
2. **Quick Insights** cho cái nhìn sớm về chi phí dự kiến của Amazon EC2, Amazon EBS và giấy phép.
3. Báo cáo **business case** so sánh chi phí on-premises hiện tại với nhiều phương án AWS, ví dụ instance được chọn đúng cỡ và các mô hình giá khác nhau. Nó có thể cho thấy việc tái sử dụng giấy phép phần mềm hiện có làm thay đổi chi phí thế nào.

Nó khớp với các câu hỏi như "đường cơ sở về những gì công ty đang chạy on-premises và chi phí dự kiến trên AWS", hoặc "công cụ miễn phí tạo business case dựa trên dữ liệu".

Đừng nhầm với các công cụ chi phí khác. **AWS Pricing Calculator** ước tính workload mới mà bạn tự mô tả; **AWS Cost Explorer** và **AWS Budgets** phân tích hoặc theo dõi chi phí và mức sử dụng đã có trên AWS (Budgets theo ngưỡng bạn đặt); **Migration Evaluator** bắt đầu từ những gì đang chạy on-premises.

## AWS Migration Hub

**Migration Hub** là nơi duy nhất để xem các máy chủ đã khám phá, nhóm chúng thành ứng dụng và **theo dõi trạng thái từng cuộc di chuyển ứng dụng**, bất kể công cụ nào thực hiện việc chuyển. Nó nhận trạng thái từ **AWS Application Migration Service** và **AWS Database Migration Service**, đồng thời hiển thị dữ liệu khám phá từ Application Discovery Service. Dữ liệu theo dõi được lưu ở **home Region** bạn chọn, còn tài nguyên được di chuyển có thể nằm ở bất kỳ Region nào được hỗ trợ.

Migration Hub còn có các năng lực liên quan:

- **Strategy Recommendations**: gợi ý hướng di chuyển và hiện đại hóa cho ứng dụng.
- **Refactor Spaces**: điểm khởi đầu để refactor dần sang microservices.
- **Orchestrator**: các template quy trình dựng sẵn để tự động hóa và theo dõi việc di chuyển máy chủ và ứng dụng doanh nghiệp.

**Trạng thái:** AWS Migration Hub, gồm cả các năng lực trên, đã đóng với khách hàng mới từ ngày 7/11/2025. Khách hàng hiện tại vẫn dùng tiếp cho các dự án đang chạy, và AWS chỉ sang **AWS Transform** cho các năng lực tương tự. Các câu thi viết trước đó vẫn xem Migration Hub là đáp án cho "một nơi duy nhất để theo dõi tiến độ di chuyển".

Migration Hub không tự chuyển máy chủ. Nó theo dõi, nhóm và báo cáo.

## Đặt các dịch vụ lên dòng thời gian di chuyển

| Giai đoạn | Hoạt động điển hình | Dịch vụ gặp trong chủ đề này |
| --- | --- | --- |
| Assess | Đánh giá mức sẵn sàng, business case đầu tiên | CAF, Migration Evaluator |
| Mobilize | Khám phá chi tiết, landing zone, chọn chiến lược cho từng ứng dụng | Application Discovery Service, Migration Hub |
| Migrate and modernize | Chuyển máy chủ và dữ liệu theo đợt, rồi cải tiến | Application Migration Service, DMS, DataSync |

Khôi phục thảm họa (Elastic Disaster Recovery) là nhu cầu riêng, liên tục, không phải một giai đoạn. Xem bài trước về các giai đoạn để biết mô tả đầy đủ về assess, mobilize, và migrate and modernize. CAF đưa ra góc nhìn toàn tổ chức với sáu perspective, còn các dịch vụ này là công cụ cho chính công việc di chuyển.

## Chọn nhanh

| Nhu cầu | Dịch vụ |
| --- | --- |
| Business case và TCO từ mức sử dụng on-premises | Migration Evaluator |
| Kiểm kê máy chủ và quan hệ phụ thuộc | Application Discovery Service |
| Một bảng theo dõi tiến độ di chuyển qua nhiều công cụ | Migration Hub |
| Sao chép máy chủ | Application Migration Service |
| Đánh giá mức sẵn sàng và khoảng trống năng lực của tổ chức | AWS CAF |

## Bẫy thường gặp

- Câu hỏi về **đánh giá mức sẵn sàng** chỉ về **AWS CAF**, không phải Migration Hub.
- **Theo dõi** là Migration Hub; **khám phá** là Application Discovery Service; **sao chép** là Application Migration Service.
- Migration Evaluator nói về tiền và định cỡ, không phải việc chuyển workload.

## Ý chính

- Migration Evaluator (trước là TSO Logic) = business case dựa trên dữ liệu, miễn phí, dùng agentless collector.
- Migration Hub = theo dõi trạng thái khám phá và di chuyển ở một nơi, có home Region.
- Migration Hub và các năng lực liên quan đã đóng với khách hàng mới từ 7/11/2025; AWS Transform là lựa chọn được gợi ý.

## Nguồn

- [What is AWS Migration Hub?](https://docs.aws.amazon.com/migrationhub/latest/ug/whatishub.html)
- [Introducing Migration Evaluator, AWS announcement](https://aws.amazon.com/about-aws/whats-new/2020/07/introducing-migration-evaluator-fast-track-business-case-aws)
- [AWS Migration Evaluator FAQ, Quick Insights and agentless collector](https://aws.amazon.com/migration-evaluator/faqs/)
