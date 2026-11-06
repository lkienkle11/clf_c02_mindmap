---
id: cloud-concepts-economics
title: Kinh tế học đám mây: CapEx, OpEx, TCO và right-sizing
required: true
---
## Hai cách chi tiền cho CNTT

- **Chi phí vốn (CapEx)**: tiền bỏ ra trước để mua tài sản vật lý như máy chủ, thiết bị lưu trữ và không gian trung tâm dữ liệu. Bạn trả tiền trước khi biết mình sẽ dùng bao nhiêu, và tài sản mất giá dần theo thời gian.
- **Chi phí vận hành (OpEx)**: chi phí định kỳ cho các dịch vụ bạn sử dụng, trả theo mức dùng.

Chuyển lên đám mây dịch phần lớn chi tiêu CNTT **từ CapEx sang OpEx**. Đây chính là ý của lợi thế "trade fixed expense for variable expense".

| | Tại chỗ (on-premises) | AWS Cloud |
| --- | --- | --- |
| Loại chi phí chính | CapEx (mua phần cứng trước) | OpEx (trả theo mức dùng) |
| Năng lực | Tính theo đỉnh tải dự kiến | Co giãn theo nhu cầu thực tế |
| Năng lực nhàn rỗi | Vẫn phải trả tiền | Tắt hoặc trả lại |

## Pay-as-you-go

Với giá pay-as-you-go, bạn chỉ trả tiền cho máy chủ, lưu trữ và các tài nguyên khác trong thời gian sử dụng, không bắt buộc hợp đồng dài hạn. Bạn không phải cấp dư tài nguyên từ trước chỉ để chịu được một đỉnh tải trong tương lai.

## Tổng chi phí sở hữu (TCO)

TCO so sánh **toàn bộ** chi phí vận hành một workload, không chỉ giá máy chủ. Với trung tâm dữ liệu tại chỗ, chi phí gồm phần cứng, giấy phép phần mềm, điện, làm mát, mặt bằng, mạng, bảo trì và nhân sự vận hành. Một phép so sánh công bằng phải đặt tất cả các khoản này cạnh hóa đơn AWS. Câu hỏi về "TCO thấp hơn" thường hướng tới việc mua ít phần cứng hơn, không phải bảo trì trung tâm dữ liệu và nhân sự tốn ít thời gian cho hạ tầng hơn.

## Right-sizing và mô hình tiêu dùng

- **Right-sizing (chọn đúng kích cỡ)** là chọn loại và kích cỡ tài nguyên đáp ứng nhu cầu hiệu năng và năng lực với chi phí thấp nhất, đồng thời thu nhỏ hoặc gỡ bỏ những tài nguyên lớn hơn mức cần. Đây là việc làm liên tục vì nhu cầu luôn thay đổi.
- **Mô hình tiêu dùng (consumption model)**: chỉ trả cho phần cần dùng và tắt tài nguyên khi nhàn rỗi. Ví dụ, môi trường phát triển và kiểm thử chỉ dùng trong giờ làm việc có thể tắt vào ban đêm và cuối tuần, nên bạn chỉ trả khoảng 40 trong 168 giờ mỗi tuần.
- AWS Compute Optimizer phân tích cách tài nguyên được sử dụng và đưa ra khuyến nghị right-sizing.

## Ý chính

- Đám mây chuyển chi tiêu từ CapEx (trả trước, cố định) sang OpEx (biến đổi, trả theo mức dùng).
- TCO bao gồm các chi phí ẩn của hạ tầng tại chỗ: điện, làm mát, mặt bằng, bảo trì và nhân sự.
- Right-sizing làm kích cỡ tài nguyên khớp với nhu cầu thực, và không bao giờ "làm một lần là xong".
- Tắt tài nguyên nhàn rỗi là một trong những cách tiết kiệm đơn giản nhất.

## Nguồn

- [Cost optimization design principles, AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html)
- [Right Sizing: Provisioning Instances to Match Workloads](https://docs.aws.amazon.com/whitepapers/latest/cost-optimization-right-sizing/cost-optimization-right-sizing.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
