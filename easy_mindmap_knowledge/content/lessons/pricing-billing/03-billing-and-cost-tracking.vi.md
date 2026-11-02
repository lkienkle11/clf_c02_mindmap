---
id: pricing-billing-cost-tracking
title: "Consolidated billing và theo dõi chi phí: Budgets, Cost Explorer, CUR và tag"
required: true
---
## Consolidated billing với AWS Organizations

Khi bạn gom các tài khoản vào **AWS Organizations**, **tài khoản quản lý (management account)** trả phí cho mọi **tài khoản thành viên (member account)**. Consolidated billing (thanh toán hợp nhất) mang lại:

- **Một hóa đơn** cho nhiều tài khoản, vẫn xem được chi phí của từng tài khoản.
- **Gộp mức sử dụng**: mức dùng của mọi tài khoản được cộng lại, nên tổ chức đạt **các bậc giá theo khối lượng** sớm hơn.
- **Chia sẻ giảm giá**: mức giảm giá của **Reserved Instance** và **Savings Plans** mua ở một tài khoản có thể áp dụng cho mức dùng phù hợp ở tài khoản khác. Tài khoản quản lý có thể tắt việc chia sẻ này.
- **Không tính thêm phí** cho consolidated billing.

## Console Billing and Cost Management

Đây là nơi bạn xem **hóa đơn**, thanh toán, credit và mức dùng Free Tier, và là nơi mở các công cụ chi phí bên dưới. Mặc định, IAM user và role không mở được các trang thanh toán cho đến khi quyền truy cập IAM vào thanh toán được kích hoạt.

## Công cụ theo dõi và kiểm soát chi phí

| Công cụ | Dùng để | Dấu hiệu trong đề thi |
| --- | --- | --- |
| AWS Budgets | Đặt budget theo chi phí, mức dùng, RI hoặc Savings Plans và **cảnh báo** (email hoặc Amazon SNS) theo số thực tế hoặc **dự báo** | "Báo cho tôi trước khi chúng tôi chi vượt" |
| AWS Cost Explorer | **Trực quan hóa và phân tích** chi phí và mức dùng theo thời gian, lọc và nhóm theo dịch vụ, tài khoản hoặc tag, và **dự báo** chi tiêu | "Dịch vụ nào làm chi phí quý trước tăng?" |
| AWS Cost and Usage Report (CUR) | Xuất dữ liệu chi phí và mức dùng **chi tiết nhất**, theo từng dòng, vào một **S3 bucket** để phân tích bằng các công cụ như Amazon Athena | "Dữ liệu thanh toán theo giờ, theo từng dòng cho hệ thống phân tích của chúng tôi" |
| AWS Cost Anomaly Detection | Dùng **học máy** để phát hiện **chi tiêu bất thường** và cảnh báo bạn, kèm nguyên nhân có thể | "Chi tiêu tăng vọt bất ngờ" |

CUR hiện được tạo qua **AWS Data Exports**, trong đó **CUR 2.0** là định dạng được khuyên dùng.

## Cost allocation tag

**Tag** là một cặp khóa và giá trị gắn trên tài nguyên, như `Project=web` hoặc `CostCenter=123`. Để xem chi phí theo tag, bạn phải **kích hoạt (activate)** tag đó thành **cost allocation tag** trong console Billing; khi đó Cost Explorer và các báo cáo chi phí có thể nhóm chi tiêu theo dự án, nhóm hoặc môi trường. Cả tag **do người dùng định nghĩa** lẫn tag **do AWS tạo** đều phải được kích hoạt.

## Bẫy thường gặp

- Budgets **cảnh báo** về chi tiêu hiện tại hoặc tương lai; Cost Explorer **phân tích** chi tiêu đã qua. Budget không dừng tài nguyên trừ khi bạn cấu hình budget action.
- Tag đã gắn nhưng **chưa kích hoạt** sẽ không xuất hiện trong báo cáo chi phí.
- Consolidated billing **gộp mức sử dụng**, nên một tổ chức có thể trả ít hơn so với khi các tài khoản đó được tính tiền riêng.

## Ý chính

- Consolidated billing của Organizations: một hóa đơn, gộp giảm giá theo khối lượng, chia sẻ RI và Savings Plans, không tốn thêm phí.
- Budgets = cảnh báo; Cost Explorer = phân tích trực quan và dự báo; CUR = dữ liệu chi tiết nhất trong S3.
- Cost Anomaly Detection phát hiện chi tiêu bất thường bằng học máy.
- Kích hoạt cost allocation tag để theo dõi chi phí theo dự án hoặc nhóm.

## Nguồn

- [Consolidating billing for AWS Organizations](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html)
- [Managing your costs with AWS Budgets](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html)
- [Organizing and tracking costs using AWS cost allocation tags](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html)
