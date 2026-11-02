---
id: global-infrastructure-edge
title: Edge location, Amazon CloudFront và AWS Global Accelerator
required: true
---
## Edge location là gì

**Edge location** (còn gọi là point of presence, điểm hiện diện) là một địa điểm trong mạng AWS được đặt **gần người dùng cuối**, ở nhiều địa điểm trải khắp thế giới. Edge location **không phải** là Availability Zone. Chúng phục vụ nội dung và tiếp nhận lưu lượng gần người dùng, rồi chuyển lưu lượng đi trên mạng toàn cầu của AWS.

Ý tưởng đằng sau: khoảng cách giữa người dùng và máy chủ AWS đầu tiên họ chạm tới càng ngắn thì **độ trễ (latency)** càng thấp.

## Amazon CloudFront: mạng phân phối nội dung

**Amazon CloudFront** là mạng phân phối nội dung (CDN) của AWS. Nó tăng tốc việc phân phối nội dung web như HTML, hình ảnh, video và phản hồi API.

Cách hoạt động, từng bước:

1. Bạn giữ tệp gốc ở một **origin**, ví dụ một bucket Amazon S3 hoặc một máy chủ web.
2. Người dùng yêu cầu một tệp; CloudFront chuyển yêu cầu tới edge location có **độ trễ thấp nhất** với người dùng đó.
3. Nếu tệp đã được **lưu đệm (cache)** ở đó, nó được trả về ngay. Nếu chưa, CloudFront lấy tệp từ origin, trả về cho người dùng và giữ một bản cho người dùng tiếp theo.

Lợi ích: người dùng ở xa origin tải nhanh hơn, origin chịu ít tải hơn, và tính sẵn sàng tốt hơn vì bản sao được lưu đệm ở nhiều nơi.

## AWS Global Accelerator: đường mạng nhanh hơn

**AWS Global Accelerator** cấp cho ứng dụng của bạn các **địa chỉ IP tĩnh** được quảng bá từ các edge location của AWS. Lưu lượng của người dùng đi vào mạng toàn cầu của AWS tại edge gần nhất và đi trên mạng đó tới endpoint khỏe mạnh phù hợp nhất, như bộ cân bằng tải hoặc instance EC2, ở một hoặc nhiều Region. Nó phản ứng nhanh khi một endpoint không còn khỏe.

## Chọn dịch vụ nào?

| Nhu cầu | Lựa chọn phù hợp hơn |
| --- | --- |
| Lưu đệm hình ảnh, video hoặc trang web gần người dùng | Amazon CloudFront |
| Tăng tốc lưu lượng TCP hoặc UDP, như trò chơi hay VoIP | AWS Global Accelerator |
| Địa chỉ IP tĩnh cố định cho một ứng dụng toàn cầu | AWS Global Accelerator |
| Chuyển đổi dự phòng nhanh giữa các Region cho ứng dụng không cache được | AWS Global Accelerator |

Cả hai dịch vụ đều dùng mạng edge của AWS; điểm khác biệt chính là **CloudFront lưu đệm nội dung**, còn Global Accelerator **cải thiện đường mạng** tới ứng dụng của bạn.

## Ý chính

- Edge location nằm gần người dùng và tách biệt với Region và AZ.
- CloudFront là CDN, lưu đệm nội dung tại các edge location để giảm độ trễ.
- Global Accelerator cung cấp địa chỉ IP tĩnh và định tuyến lưu lượng qua mạng toàn cầu của AWS tới các endpoint khỏe mạnh.
- Câu hỏi có chữ "cache" thường chỉ tới CloudFront; "static IP" hoặc "TCP/UDP" chỉ tới Global Accelerator.

## Nguồn

- [What is Amazon CloudFront?](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- [What is AWS Global Accelerator?](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- [AWS Global Accelerator FAQs](https://aws.amazon.com/global-accelerator/faqs/)
