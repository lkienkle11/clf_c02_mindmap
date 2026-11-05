---
id: global-infrastructure-global-vs-regional-services
title: Dịch vụ phạm vi toàn cầu, theo Region và theo Availability Zone
required: true
videoQuery: AWS global vs regional vs availability zone services explained
---
## Vì sao phạm vi quan trọng

Mỗi tài nguyên AWS có một **phạm vi (scope)**: toàn tài khoản (global), một Region, hoặc một Availability Zone. Đề thi dùng phạm vi để kiểm tra bạn có hiểu điều gì xảy ra khi có sự cố, phải tạo tài nguyên ở đâu, và cần làm gì để ứng dụng sẵn sàng cao.

Quy tắc dễ nhớ: phạm vi càng nhỏ thì bạn càng phải tự lên kế hoạch. Tài nguyên theo Availability Zone sẽ mất cùng zone đó trừ khi bạn dựng một bản sao ở nơi khác.

## Ba phạm vi

| Phạm vi | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| Global | Không gắn với một Region; bạn quản lý mà không cần chọn Region | **AWS Identity and Access Management (IAM)**, **Amazon Route 53**, **Amazon CloudFront**, **AWS WAF** cho CloudFront, **AWS Global Accelerator** |
| Theo Region | Bạn chọn một Region; tài nguyên thường được trải trên các zone của Region đó (các lớp S3 One Zone cố ý chỉ dùng một zone) | **Amazon VPC**, **Amazon S3** (dữ liệu của bucket), Elastic Load Balancing, Amazon DynamoDB, AWS Lambda |
| Theo Availability Zone | Tài nguyên nằm trong một zone | Instance **Amazon EC2**, volume **Amazon EBS**, **subnet**, database instance đơn AZ |

Một vài chi tiết hay gây nhầm:

- User, role và policy của **IAM** dùng được ở mọi Region của tài khoản, nên bạn không tạo user riêng cho từng Region. (Bên trong, AWS đặt control plane ở một nơi, nhưng bạn coi IAM là global.)
- **Route 53** là dịch vụ DNS toàn cầu; hosted zone không đặt trong một Region.
- Distribution của **CloudFront** là global và phục vụ nội dung từ các edge location. **AWS WAF** có thể bảo vệ distribution CloudFront (phía global, ở edge) và cả tài nguyên theo Region như Application Load Balancer hay API Gateway REST API, vì vậy hãy xem câu hỏi bảo vệ tài nguyên nào.
- Tên bucket **Amazon S3** phải duy nhất trên toàn AWS, nhưng bucket và đối tượng được lưu ở đúng một Region bạn chọn. "Tên duy nhất toàn cầu" không có nghĩa là "dữ liệu lưu khắp thế giới".
- **VPC** thuộc về một Region và trải trên mọi Availability Zone của Region đó, còn mỗi **subnet** phải nằm trong đúng một Availability Zone. Vì thế sẵn sàng cao nghĩa là tạo subnet ở nhiều zone.
- **Volume EBS** chỉ gắn được vào instance EC2 trong cùng Availability Zone. Để chuyển dữ liệu sang zone khác, hãy tạo snapshot rồi khôi phục từ đó.

## Chúng xuất hiện trong đề thế nào

1. **Sẵn sàng cao**: "Ứng dụng chạy trong một Availability Zone. Làm sao để nó vẫn hoạt động nếu zone đó hỏng?" Đáp án là chạy EC2 ở nhiều zone sau một bộ cân bằng tải, vì instance thuộc phạm vi zone.
2. **Khôi phục thảm họa**: tài nguyên theo Region không tự có ở Region khác, nên DR cần một bản sao ở đó.
3. **Thiết lập tài khoản**: "Dịch vụ nào không yêu cầu chọn Region?" Hãy nghĩ tới IAM, Route 53, CloudFront.
4. **Nhầm lẫn trên console**: nếu tài nguyên "biến mất", nguyên nhân thường là console đang hiển thị Region khác. Ngược lại, user IAM thì thấy ở mọi nơi.

## Những cái bẫy thường gặp

- Đừng cho rằng S3 là global chỉ vì tên bucket duy nhất toàn cầu; nó là dịch vụ theo Region.
- Đừng cho rằng dịch vụ theo Region được bảo vệ khi cả Region sự cố; "theo Region" nghĩa là trải trên các zone, không phải trên các Region.
- Dịch vụ dùng edge location (CloudFront, Route 53) là global, nhưng edge location không phải Availability Zone.
- Một số tính năng chỉ có ở vài Region, nên hãy xem Regional Services List khi đề nhắc tới tính sẵn có.

## Ý chính

- Ba phạm vi: global, theo Region, theo Availability Zone.
- IAM, Route 53, CloudFront và Global Accelerator là global; VPC và S3 theo Region; EC2, EBS và subnet theo zone.
- Theo Region nghĩa là multi-AZ trong một Region, không phải multi-Region.
- Thiết kế sẵn sàng cao bằng nhiều zone, thiết kế khả năng phục hồi bằng nhiều Region.

## Nguồn

- [Global services, AWS Fault Isolation Boundaries](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html)
- [What is Amazon VPC?](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)
- [What is AWS WAF? (protected resource types)](https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html)
