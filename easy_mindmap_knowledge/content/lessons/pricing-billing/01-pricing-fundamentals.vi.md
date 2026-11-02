---
id: pricing-billing-fundamentals
title: "Giá AWS hoạt động thế nào: trả theo mức dùng, cam kết để tiết kiệm, và truyền dữ liệu"
required: true
---
## Ba nguyên tắc định giá

AWS mô tả cách tính giá bằng vài ý đơn giản:

- **Trả theo mức dùng (pay as you go)**: chỉ trả cho dịch vụ bạn dùng, trong thời gian bạn dùng, không cần hợp đồng dài hạn và không phải mua phần cứng trước. Dừng một tài nguyên thì phí điện toán của nó cũng dừng.
- **Tiết kiệm khi cam kết (save when you commit)**: cam kết một mức sử dụng ổn định trong một hoặc ba năm (Savings Plans, Reserved Instances) và trả mức giá thấp hơn On-Demand.
- **Dùng càng nhiều, trả càng ít (pay less by using more)**: nhiều dịch vụ dùng **giá theo bậc (tiered pricing)**. Ví dụ, lưu trữ Amazon S3 và truyền dữ liệu ra ngoài rẻ hơn trên mỗi GB khi khối lượng hằng tháng của bạn tăng.

## Điều gì tạo nên hóa đơn

Phần lớn chi phí đến từ ba thứ: **điện toán (compute)** (tính theo giây hoặc theo giờ khi đang chạy), **lưu trữ** (thường theo GB mỗi tháng) và **truyền dữ liệu ra ngoài (outbound)**. Với một số dịch vụ, số yêu cầu, lời gọi API và tính năng bổ sung tạo thêm các khoản phí nhỏ hơn.

## Quy tắc truyền dữ liệu

| Chiều truyền | Mức phí thường gặp |
| --- | --- |
| Từ internet vào AWS | Miễn phí |
| Từ AWS ra internet | Tính theo GB, giá mỗi GB rẻ hơn khi khối lượng lớn |
| Giữa các AWS Region | Thường bị tính phí |
| Giữa các dịch vụ trong cùng Region | Thường miễn phí, nhưng hãy kiểm tra từng dịch vụ (ví dụ, lưu lượng qua các Availability Zone có thể bị tính phí) |

Vì vậy, thiết kế giữ dữ liệu và phần điện toán dùng dữ liệu đó trong **cùng một Region** thường rẻ hơn, và một CDN như Amazon CloudFront có thể giảm lượng dữ liệu gửi ra từ origin của bạn.

## Mua điện toán: ôn nhanh

Các lựa chọn mua (On-Demand, Savings Plans, Reserved Instances, Spot và Dedicated Hosts) đã được trình bày trong chủ đề điện toán. Ý cần nhớ về giá ở đây: **bạn càng cam kết nhiều hoặc càng cho AWS nhiều linh hoạt, mức giảm giá càng lớn**. Spot giảm giá sâu nhất để đổi lấy khả năng bị gián đoạn; cam kết 3 năm tiết kiệm hơn cam kết 1 năm.

## Những khoản khác bạn phải trả

- **Các gói AWS Support trả phí** cộng thêm khoản phí riêng ngoài mức dùng dịch vụ; hỗ trợ được trình bày trong chủ đề về hỗ trợ.
- Nhiều dịch vụ quản lý, như IAM, consolidated billing của AWS Organizations và AWS CloudFormation (với tài nguyên AWS), không tính thêm phí; bạn trả tiền cho các tài nguyên mà chúng tạo ra hoặc quản lý.

## Bẫy thường gặp

- "Tải 10 TB dữ liệu lên Amazon S3": phần **truyền vào** miễn phí; phần **lưu trữ** thì không.
- Sao chép dữ liệu sang Region khác sẽ phát sinh phí **truyền dữ liệu giữa các Region**.
- Pay-as-you-go không có nghĩa là "không dùng thì miễn phí" với mọi thứ: dữ liệu đang lưu và tài nguyên đã cấp phát như EBS volume vẫn tiếp tục tốn tiền.

## Ý chính

- Trả theo mức dùng, tiết kiệm khi cam kết, dùng càng nhiều trả càng ít.
- Các nguồn chi phí chính: điện toán, lưu trữ, truyền dữ liệu ra ngoài.
- Dữ liệu vào miễn phí; dữ liệu ra ngoài và giữa các Region bị tính phí.
- Cam kết và sự linh hoạt đổi được mức giảm giá.

## Nguồn

- [AWS Pricing](https://aws.amazon.com/pricing/)
- [COST08-BP02 Select components to optimize data transfer cost](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/cost_data_transfer_optimized_components.html)
- [Amazon EC2 billing and purchasing options](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html)
