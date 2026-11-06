---
id: pricing-billing-cost-management-tools
title: "Công cụ quản lý chi phí chi tiết: công cụ nào trả lời câu hỏi nào"
required: true
---
## Một console, nhiều công cụ

Console **AWS Billing and Cost Management** là nơi chứa hóa đơn, thanh toán, credit và mức dùng Free Tier của bạn, đồng thời là cửa vào các công cụ chi phí bên dưới. Bài về theo dõi chi phí trước đó đã giới thiệu chúng; bài này bổ sung mỗi công cụ thật sự làm được gì, để bạn ghép đúng câu hỏi với đúng công cụ.

## AWS Cost Explorer

**AWS Cost Explorer** là công cụ trực quan để phân tích bạn đã chi những gì. Các điểm chính:

- Hiển thị tối đa **13 tháng** gần nhất về chi phí và mức dùng, nhóm hoặc lọc theo dịch vụ, tài khoản, Region, tag và nhiều tiêu chí khác, cùng **dự báo** chi tiêu tương lai.
- Có sẵn các chế độ xem dựng sẵn và báo cáo tùy chỉnh; dùng trên console là **miễn phí**, còn các yêu cầu API lập trình bị tính phí theo từng yêu cầu.
- Đưa ra **gợi ý**: đề xuất mua **Savings Plans** và Reserved Instances, và **gợi ý rightsizing cho EC2** chỉ ra các instance nhàn rỗi hoặc dùng ít để thu nhỏ hoặc chấm dứt. Vì vậy câu hỏi "công cụ nào xác định cơ hội rightsizing cho EC2" có thể gồm cả Cost Explorer lẫn Compute Optimizer.
- AWS còn có **Cost Optimization Hub**, gom các gợi ý về một nơi và được khuyến nghị làm nơi tìm cơ hội tiết kiệm.

Cost Explorer **nhìn vào lịch sử và xu hướng**; nó không gửi cảnh báo theo ngưỡng.

## AWS Budgets

**AWS Budgets** cho phép bạn lập kế hoạch chi tiêu và **cảnh báo** khi vượt ngưỡng. Các loại budget là **cost**, **usage**, **mức sử dụng và mức bao phủ của Reserved Instance**, và **mức sử dụng và mức bao phủ của Savings Plans**. Bạn có thể cảnh báo theo số **thực tế** hoặc **dự báo**, thông báo qua email hoặc Amazon SNS topic, và tùy chọn gắn một **budget action**, chẳng hạn áp dụng một IAM policy hạn chế. **Budget reports** gửi email cho bạn bản tóm tắt định kỳ về tình hình so với các budget.

Dữ liệu Budgets làm mới tối đa ba lần mỗi ngày, nên có thể có độ trễ giữa khoản chi và cảnh báo.

## Cost allocation tag và cost category

Tag là nhãn khóa-giá trị gắn trên tài nguyên. Với báo cáo chi phí, có hai loại:

- **Tag do AWS tạo** (tiền tố `aws:`, ví dụ người tạo tài nguyên), do AWS định nghĩa và áp dụng.
- **Tag do người dùng định nghĩa** (tiền tố `user:`), do bạn tạo.

Cả hai đều phải được **kích hoạt thành cost allocation tag** trong console Billing thì mới xuất hiện trong Cost Explorer và báo cáo chi phí. Tag có thể mất tới 24 giờ để hiện ra, và trong một tổ chức thì management account quản lý chúng. **Cost category** đi xa hơn một bước bằng cách ánh xạ chi phí vào các nhóm, ứng dụng hoặc môi trường.

## Cost and Usage Report và Data Exports

**AWS Cost and Usage Report (CUR)** chứa dữ liệu chi phí và mức dùng **đầy đủ nhất**, với các dòng chi tiết theo giờ, ngày hoặc tháng, được chuyển vào một **Amazon S3 bucket** và làm mới ít nhất mỗi ngày. Bạn truy vấn bằng **Amazon Athena**, nạp vào **Amazon Redshift**, hoặc trực quan hóa trong Amazon QuickSight (AWS hiện giới thiệu QuickSight như một phần của Amazon Quick). Bạn tạo nó trong **AWS Data Exports**, nơi cung cấp CUR 2.0 và export CUR kiểu cũ (legacy) cùng các bảng khác. Hãy chọn CUR khi gợi ý là "dữ liệu thô, chi tiết trong S3 để chúng tôi tự phân tích hoặc làm dashboard".

## AWS Cost Anomaly Detection

**Cost Anomaly Detection** dùng **học máy** để học mẫu chi tiêu bình thường của bạn, kể cả tính mùa vụ, và cảnh báo qua email hoặc Amazon SNS khi chi tiêu có dấu hiệu bất thường. Nó chỉ ra **nguyên nhân gốc** theo dịch vụ, tài khoản, Region và loại sử dụng. Khác với budget, bạn không phải đặt hay duy trì ngưỡng. Nó theo dõi chi tiêu AWS nhưng không theo dõi hầu hết sản phẩm bên thứ ba trên AWS Marketplace.

## Billing alarm trong Amazon CloudWatch

Bạn cũng có thể tạo **CloudWatch alarm trên metric EstimatedCharges**. Trước tiên phải bật **Receive CloudWatch Billing Alerts** trong billing preferences, và metric thanh toán nằm ở **US East (N. Virginia)**. Billing alarm phản ứng với khoản phí **đã vượt** ngưỡng; nó không dùng dự báo. Vì vậy một câu "thông báo cho tôi khi chi phí chạm ngưỡng" có thể chấp nhận **AWS Budgets** hoặc **Amazon CloudWatch**.

## Công cụ nào trả lời câu hỏi nào?

| Câu hỏi | Công cụ |
| --- | --- |
| Quý trước ta chi bao nhiêu, vào những gì? | Cost Explorer |
| Cảnh báo khi chi tiêu hoặc mức dùng chạm (hoặc được dự báo sẽ chạm) giới hạn | AWS Budgets |
| Gửi email báo cáo tình hình budget theo lịch | AWS Budgets reports |
| Cho tôi mọi dòng chi tiết trong S3 để dùng Athena hoặc dashboard | Cost and Usage Report (Data Exports) |
| Báo khi chi tiêu bất thường, không cần ngưỡng | Cost Anomaly Detection |
| Chia chi phí theo dự án hoặc phòng ban | Cost allocation tag |
| Báo động trên phí ước tính bằng metric | CloudWatch billing alarm |

## Ý chính

- Cost Explorer phân tích lịch sử, dự báo và đưa gợi ý mua cùng rightsizing; Budgets cảnh báo và báo cáo; CUR cho dữ liệu sâu nhất trong S3.
- Cost Anomaly Detection không cần ngưỡng; billing alarm và Budgets thì cần.
- Tag phải được kích hoạt thành cost allocation tag; cả tag do AWS tạo lẫn do người dùng định nghĩa đều tính.

## Nguồn

- [Analyzing your costs and usage with AWS Cost Explorer](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html)
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [What are AWS Cost and Usage Reports?](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html)
