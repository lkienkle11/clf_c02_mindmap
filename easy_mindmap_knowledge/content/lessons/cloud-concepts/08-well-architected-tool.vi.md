---
id: cloud-concepts-well-architected-tool
title: AWS Well-Architected Tool
required: false
---
## Công cụ này làm gì

**AWS Well-Architected Tool** là dịch vụ trong AWS Management Console giúp bạn đánh giá workload theo các thực hành tốt nhất của Well-Architected. Bạn trả lời các câu hỏi về workload, và công cụ chỉ ra chỗ nào lệch khỏi thực hành tốt nhất cùng việc nên làm tiếp. Đừng nhầm với Framework: Framework là hướng dẫn, còn tool là dịch vụ áp dụng hướng dẫn đó.

## Khái niệm chính

- **Workload**: tập hợp tài nguyên và mã nguồn tạo ra giá trị kinh doanh, ví dụ một ứng dụng hướng đến khách hàng. Nó có thể trải trên nhiều tài khoản.
- **Lens**: một bộ câu hỏi và thực hành tốt nhất. Mặc định là lens Well-Architected Framework (sáu trụ cột). Các lens khác, ví dụ cho workload serverless hoặc SaaS, và lens tùy chỉnh do bạn viết, tập trung vào từng lĩnh vực cụ thể.
- **Review**: trả lời các câu hỏi của lens cho workload của bạn.
- **Rủi ro**: các khoảng trống được báo là **high risk issues (HRI)** hoặc **medium risk issues (MRI)**, giúp bạn xếp thứ tự ưu tiên.
- **Improvement plan (kế hoạch cải tiến)**: hướng dẫn kèm liên kết tài liệu cho từng vấn đề tìm thấy.
- **Milestone**: ảnh chụp trạng thái review tại một thời điểm, để so sánh tiến độ theo thời gian.
- **Chia sẻ**: workload có thể chia sẻ cho tài khoản khác hoặc cả tổ chức để các nhóm cùng review.

## Whitepaper nằm ở đâu

AWS xuất bản Framework và hướng dẫn riêng cho từng trụ cột, cùng các tài liệu lens, dưới dạng whitepaper và tài liệu. Tool đưa các câu hỏi vào một quy trình trên console; tài liệu cung cấp chi tiết.

## Giá

Công cụ không tính thêm phí. Bạn chỉ trả cho các tài nguyên AWS mà workload sử dụng.

## Gợi ý khi thi

- "Đánh giá workload theo thực hành tốt nhất và nhận kế hoạch cải tiến" là Well-Architected Tool.
- Theo dõi tiến độ theo thời gian là milestone.
- Nó đánh giá thực hành kiến trúc; không quét tài nguyên tìm lỗ hổng (đó là Amazon Inspector) và không tư vấn chi phí từ dữ liệu sử dụng (đó là AWS Trusted Advisor).

## Ý chính

- Tool đánh giá workload theo Framework và các lens.
- Kết quả: rủi ro cao và trung bình cùng kế hoạch cải tiến; milestone ghi lại tiến độ.
- Miễn phí; bạn chỉ trả cho tài nguyên đã dùng.

## Nguồn

- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [Workloads, AWS Well-Architected Tool User Guide](https://docs.aws.amazon.com/wellarchitected/latest/userguide/workloads.html)
- [AWS Well-Architected Tool pricing](https://aws.amazon.com/well-architected-tool/pricing/)
