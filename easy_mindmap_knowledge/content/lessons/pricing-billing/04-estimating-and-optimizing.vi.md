---
id: pricing-billing-estimating
title: "Ước tính và tối ưu chi phí: Pricing Calculator, Migration Evaluator và Compute Optimizer"
required: true
---
## Trước khi xây dựng: AWS Pricing Calculator

**AWS Pricing Calculator** là một **công cụ web miễn phí** để ước tính chi phí của một workload AWS bạn đang lên kế hoạch. Bạn thêm dịch vụ, mô tả cách bạn sẽ dùng chúng (loại instance, số giờ, lưu trữ, số yêu cầu, truyền dữ liệu) và chọn phương thức thanh toán, rồi công cụ hiển thị ước tính **trả trước, hằng tháng và hằng năm** kèm cách tính đằng sau mỗi con số.

- Bạn không cần kinh nghiệm AWS để dùng trang web công khai.
- Nhóm các dịch vụ theo kiến trúc của bạn, lưu một đường link để chia sẻ, hoặc xuất ra CSV hay PDF.
- Bản ước tính không gồm thuế, và hóa đơn thật phụ thuộc vào mức dùng thực tế.
- Một phiên bản **trong console** còn có thể áp dụng mức giảm giá và các cam kết bạn đang có.

Dấu hiệu trong đề thi: "ước tính chi phí hằng tháng của một ứng dụng mới trước khi triển khai" là **Pricing Calculator**.

## Xây dựng business case: Migration Evaluator

Tổng chi phí sở hữu (TCO), đã học ở chủ đề khái niệm điện toán đám mây, so sánh **toàn bộ** chi phí chạy workload tại chỗ với chạy trên AWS. **Migration Evaluator** (trước đây là TSO Logic) là một dịch vụ AWS **miễn phí (complimentary)** giúp xây dựng **business case cho việc di chuyển** dựa trên dữ liệu:

- Nó phát hiện các máy chủ hiện có bằng một **bộ thu thập không cần agent (agentless collector)**, hoặc bạn tải lên các bản xuất inventory từ công cụ sẵn có.
- Nó phân tích cấu hình máy chủ, mức sử dụng, chi phí vận hành và các lựa chọn giấy phép, rồi ghép workload với các lựa chọn EC2 có kích cỡ phù hợp.
- Nó tạo ra một business case so sánh chi phí hiện tại với nhiều kịch bản AWS dự kiến.

Tài liệu ôn thi cũ có thể nhắc tới một "AWS TCO Calculator" riêng; với việc đánh giá TCO ngày nay, hướng dẫn của AWS nêu tên Migration Evaluator.

## Sau khi xây dựng: right-sizing với AWS Compute Optimizer

**AWS Compute Optimizer** phân tích cấu hình và **metric mức sử dụng trong CloudWatch** của các tài nguyên như EC2 instance, Auto Scaling group, EBS volume, Lambda function và một số cơ sở dữ liệu. Nó cho biết mỗi tài nguyên đang **thừa cấu hình (over-provisioned), thiếu cấu hình (under-provisioned) hay tối ưu (optimized)**, đánh dấu tài nguyên nhàn rỗi và đề xuất kích cỡ tốt hơn. Bạn phải opt in trước, và nó cần một khoảng lịch sử metric mới đề xuất được.

## Chọn đúng công cụ

- Ước tính một workload **tương lai**: Pricing Calculator.
- Chứng minh lợi ích **di chuyển** bằng so sánh tại chỗ và AWS: Migration Evaluator.
- Thu nhỏ tài nguyên **đang chạy** quá lớn: Compute Optimizer.
- Xem chi tiêu **đã qua** và xu hướng: Cost Explorer (bài trước).

## Bẫy thường gặp

- Pricing Calculator **ước tính**; nó không theo dõi số tiền bạn đã thực sự chi.
- Compute Optimizer đề xuất kích cỡ; nó không tự mua Savings Plans hay tự đổi instance cho bạn.
- Migration Evaluator là về **business case**; việc chuyển máy chủ dùng các dịch vụ di chuyển (chủ đề tiếp theo).

## Ý chính

- Pricing Calculator: ước tính miễn phí chi phí AWS dự kiến.
- Migration Evaluator: business case TCO miễn phí cho việc di chuyển lên AWS.
- Compute Optimizer: đề xuất right-sizing từ metric mức sử dụng.
- Chọn công cụ theo thời điểm: lên kế hoạch xây dựng, lên kế hoạch di chuyển, hay đang vận hành workload.

## Nguồn

- [What is AWS Pricing Calculator?](https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html)
- [Migration Evaluator, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/migration-tools/business-case-migration-evaluator.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
