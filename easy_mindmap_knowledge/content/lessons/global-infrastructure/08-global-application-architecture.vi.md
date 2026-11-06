---
id: global-infrastructure-global-application-architecture
title: Kết hợp tất cả cho một ứng dụng toàn cầu
required: false
videoQuery: AWS multi-AZ vs multi-Region architecture global application Route 53 CloudFront
---
## Hai mục tiêu khác nhau

Các câu hỏi về ứng dụng toàn cầu trộn hai mục tiêu cần công cụ khác nhau.

- **Sẵn sàng cao** (chịu được việc mất một trung tâm dữ liệu): dùng **nhiều Availability Zone trong một Region**. Đặt instance EC2 trong các subnet ở nhiều zone sau một bộ cân bằng tải. Các tùy chọn Multi-AZ được quản lý cho cơ sở dữ liệu cũng theo ý tưởng này.
- **Khôi phục thảm họa và phủ sóng toàn cầu** (chịu được việc mất cả Region, hoặc phục vụ người dùng ở xa): dùng **nhiều Region**. Giữ một bản của ứng dụng và dữ liệu ở Region thứ hai.

Một Availability Zone đơn lẻ là điểm lỗi duy nhất. Một Region duy nhất là điểm khởi đầu tốt cho hầu hết workload, nhưng không phải đáp án khi đề nói "toàn bộ một Region ngừng hoạt động".

## Vai trò của các dịch vụ edge

| Dịch vụ | Vai trò trong thiết kế toàn cầu |
| --- | --- |
| **Amazon Route 53** | DNS: đưa người dùng tới endpoint phù hợp, ví dụ theo độ trễ hoặc sức khỏe |
| **Amazon CloudFront** | Lưu đệm nội dung gần người dùng và giảm tải cho origin |
| **AWS Global Accelerator** | IP tĩnh và đường mạng AWS cho TCP/UDP hoặc nhu cầu IP cố định |
| **Elastic Load Balancing** | Chia lưu lượng cho các instance ở nhiều zone trong một Region |

Chúng thường được kết hợp: CloudFront cho nội dung tĩnh và lưu đệm được, một bộ cân bằng tải ở mỗi Region cho ứng dụng, và Route 53 hoặc Global Accelerator để dẫn người dùng tới một Region khỏe.

## Dữ liệu giữa các Region

Sao chép phần tính toán thì dễ, dữ liệu mới là phần khó. Ở độ sâu của kỳ thi này, hãy nhớ rằng các dịch vụ có cách sao chép dữ liệu sang Region khác, như nhân bản Amazon S3 hoặc các tùy chọn cơ sở dữ liệu toàn cầu. Bạn quyết định việc đó có được phép theo quy định lưu trú dữ liệu hay không, vì dữ liệu không tự rời Region. Chi tiết nằm ở các chủ đề lưu trữ và cơ sở dữ liệu.

## Cách nghĩ khi làm đề

1. Yêu cầu nói về một zone hỏng, một Region hỏng, hay người dùng ở xa? Điều đó quyết định multi-AZ hay multi-Region.
2. Có giới hạn pháp lý về nơi lưu dữ liệu không? Nó giới hạn các Region được dùng.
3. Đó là nội dung lưu đệm được (CloudFront) hay nhu cầu không phải HTTP hoặc IP cố định (Global Accelerator)?

## Ý chính

- Multi-AZ cho sẵn sàng cao; multi-Region cho khôi phục thảm họa và độ trễ thấp hơn với người dùng ở xa.
- Route 53, CloudFront và Global Accelerator có vai trò khác nhau; hãy kết hợp thay vì chọn một.
- Sao chép dữ liệu sang Region khác là quyết định của bạn và phải tôn trọng quy định lưu trú dữ liệu.

## Nguồn

- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [Regions, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/regions.html)
