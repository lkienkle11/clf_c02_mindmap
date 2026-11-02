---
id: global-infrastructure-regions
title: AWS Region và cách chọn Region
required: true
---
## Region là gì

**AWS Region** là một khu vực địa lý trên thế giới nơi AWS đặt tập trung các trung tâm dữ liệu của mình. AWS vận hành hàng chục Region trên nhiều châu lục và liên tục mở thêm Region mới (xem trang AWS Global Infrastructure để biết danh sách hiện tại).

Những điều làm Region quan trọng trong đề thi:

- Mỗi Region gồm **nhiều Availability Zone tách biệt, độc lập về mặt vật lý**. AWS xây các Region công khai với **ít nhất ba** Availability Zone.
- Các Region **được thiết kế để cô lập** với nhau, nên sự cố thường chỉ giới hạn trong một Region.
- **Với các dịch vụ theo Region, dữ liệu của bạn ở lại trong Region bạn chọn.** Tài nguyên tạo ở một Region không xuất hiện ở Region khác, trừ khi bạn chủ động sao chép hoặc nhân bản (replicate) chúng. Các dịch vụ toàn cầu như IAM và CloudFront không gắn với một Region duy nhất.
- Phần lớn dịch vụ là **dịch vụ theo Region** (bạn chọn Region khi tạo tài nguyên). Một số ít dịch vụ như AWS Identity and Access Management (IAM), Amazon Route 53 và Amazon CloudFront là **dịch vụ toàn cầu**.

## Cách chọn Region

AWS gợi ý bốn yếu tố. Một thứ tự suy nghĩ dễ nhớ: quy định trước, rồi người dùng, rồi chi phí và tính năng.

| Yếu tố | Câu hỏi cần đặt ra | Ví dụ |
| --- | --- | --- |
| Tuân thủ và lưu trú dữ liệu | Có luật hay hợp đồng nào yêu cầu dữ liệu ở lại trong một quốc gia không? | Một ngân hàng phải giữ dữ liệu khách hàng trong nước |
| Độ trễ (khoảng cách) | Phần lớn người dùng ở đâu? | Trò chơi cho người chơi ở Nhật Bản chạy ở một Region châu Á - Thái Bình Dương gần họ |
| Chi phí | Cùng dịch vụ đó có rẻ hơn ở Region khác không? | Giá của cùng một tài nguyên khác nhau giữa các Region |
| Dịch vụ và tính năng sẵn có | Region có đủ mọi dịch vụ mà workload cần không? | Một dịch vụ mới có thể chỉ ra mắt trước ở một số Region |

Tuân thủ thường được ưu tiên: nếu luật yêu cầu "giữ dữ liệu trong nước này", bạn không thể chọn một Region rẻ hơn ở nước ngoài.

## Vì sao dùng nhiều Region

- **Khôi phục thảm họa và duy trì hoạt động kinh doanh**: giữ một bản workload ở Region khác phòng khi cả một Region gặp sự cố.
- **Giảm độ trễ cho người dùng** ở nhiều nơi trên thế giới.
- **Chủ quyền dữ liệu**: chạy các bản riêng ở từng quốc gia có quy định yêu cầu lưu trữ trong nước.

## Ý chính

- Region = một khu vực địa lý có nhiều Availability Zone tách biệt (ít nhất ba ở các Region công khai).
- Các Region được thiết kế để cô lập; dữ liệu trong các dịch vụ theo Region không rời Region trừ khi bạn di chuyển nó.
- Chọn Region theo tuân thủ, độ trễ, chi phí và mức sẵn có của dịch vụ.
- Dùng nhiều Region giúp khôi phục thảm họa, giảm độ trễ toàn cầu và đáp ứng chủ quyền dữ liệu.

## Nguồn

- [Regions, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/regions.html)
- [What to consider when selecting a Region for your workloads (AWS Architecture Blog)](https://aws.amazon.com/blogs/architecture/what-to-consider-when-selecting-a-region-for-your-workloads/)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
