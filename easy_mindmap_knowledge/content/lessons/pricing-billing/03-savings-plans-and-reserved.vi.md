---
id: pricing-billing-savings-plans-and-reserved
title: "Savings Plans, Reserved Instances và data transfer: chọn mô hình giá"
required: true
---
## Vì sao mô hình giá quan trọng

Các bài trước đã nêu nguyên tắc: cam kết để tiết kiệm, hoặc giữ sự linh hoạt và trả nhiều hơn. Bài này đi sâu vào việc **mỗi mô hình đánh đổi cam kết lấy mức giảm giá như thế nào**, vì đây chính là điều các câu hỏi về giá kiểm tra. Các mức giảm bên dưới là con số "tối đa" (up to) mà AWS công bố so với giá On-Demand; mức giảm thực tế phụ thuộc loại instance, Region, thời hạn và hình thức thanh toán.

## So sánh các mô hình

| Mô hình | Bạn cam kết | Mức giảm | Độ linh hoạt |
| --- | --- | --- | --- |
| **On-Demand** | Không gì cả | Không (mức chuẩn) | Hoàn toàn: bật tắt lúc nào cũng được |
| **Compute Savings Plans** | Một số tiền mỗi giờ, 1 hoặc 3 năm | Tối đa 66% | Mọi họ instance, kích thước, Region, hệ điều hành, tenancy; áp dụng cả cho **AWS Fargate** và **AWS Lambda** |
| **EC2 Instance Savings Plans** | Một số tiền mỗi giờ, 1 hoặc 3 năm, cho một họ instance trong một Region | Tối đa 72% | Mọi kích thước, hệ điều hành, tenancy trong họ và Region đó |
| **Standard Reserved Instances** | Một cấu hình instance cụ thể, 1 hoặc 3 năm | Tối đa 72% | Thấp nhất; có thể bán trên Reserved Instance Marketplace |
| **Convertible Reserved Instances** | Một cấu hình, 1 hoặc 3 năm | Tối đa 66% | Có thể đổi sang Convertible RI khác có giá trị bằng hoặc cao hơn |
| **Spot Instances** | Không gì cả | Tối đa 90% | AWS có thể thu hồi công suất |
| **Dedicated Hosts** | Cả một máy chủ vật lý | Tính theo On-Demand, qua Dedicated Host Reservations, hoặc được Savings Plans bao phủ | Chọn vì giấy phép và tuân thủ, không phải vì giá |

## Savings Plans

**Savings Plan** là cam kết chi một lượng tiền tính toán đều đặn, đo bằng **đô la mỗi giờ**. Phần dùng trong mức cam kết được hưởng giá thấp; phần vượt mức tính theo giá On-Demand. Bạn có thể trả **All Upfront, Partial Upfront hoặc No Upfront**, và plan **không thể hủy** trong suốt thời hạn. Ngoại lệ duy nhất là khi mua nhầm: plan có mức cam kết từ 100 đô la mỗi giờ trở xuống có thể được **trả lại trong vòng 7 ngày kể từ khi mua và trong cùng tháng dương lịch**. Savings Plan không đặt trước công suất và không áp dụng cho mức dùng Spot. AWS còn bán SageMaker AI Savings Plans và gần đây là Database Savings Plans cho một số dịch vụ cơ sở dữ liệu được quản lý; trọng tâm của kỳ thi là plan Compute và EC2 Instance.

## Reserved Instances

**Reserved Instance (RI)** là một khoản giảm giá trên hóa đơn cho cấu hình instance trùng khớp, chứ không phải một instance vật lý. Thời hạn là 1 hoặc 3 năm, và **3 năm tiết kiệm hơn**. Trả trước càng nhiều thì giảm càng sâu: **All Upfront > Partial Upfront > No Upfront**. Với Partial hoặc No Upfront, phần còn lại trả hằng tháng. RI cấp Region áp dụng cho mọi Availability Zone trong Region; RI cấp zone còn đặt trước công suất trong một zone.

Nếu một RI **Standard** không còn phù hợp (ví dụ bạn chuyển sang họ instance khác), bạn có thể đăng bán trên **Amazon EC2 Reserved Instance Marketplace**, một tính năng của EC2, không phải danh mục phần mềm AWS Marketplace. Chỉ RI Standard mới bán được ở đó; RI Convertible thì không.

## Chọn mô hình: dấu hiệu trong đề

- Ngắn hạn, khó đoán, theo mùa (vài tháng mỗi năm) hoặc "vài giờ mỗi tuần", và không được gián đoạn: **On-Demand**.
- Ổn định 1 đến 3 năm, không được gián đoạn, cấu hình đã biết: **Reserved Instances hoặc Savings Plans**; RI Standard hoặc EC2 Instance Savings Plans cho mức giảm sâu nhất, và **All Upfront** cho mức tiết kiệm lớn nhất.
- Cam kết **đô la mỗi giờ**, hoặc mức dùng trải trên EC2, Fargate và Lambda: **Compute Savings Plans**. Tài liệu AWS mô tả đây là lựa chọn linh hoạt hơn, vì chúng tự động áp dụng mà không cần đổi (exchange). Cái bẫy trong đề: khi câu hỏi nói về việc **đặt trước (reserve)** instance, **trả trước** và có thể **đổi** về sau, đồng thời liệt kê cả Convertible RI lẫn Compute Savings Plans, thì đáp án mong đợi từ trước đến nay là **Convertible Reserved Instances**. Hãy chọn Compute Savings Plans khi gợi ý là cam kết chi tiêu theo giờ hoặc mức dùng Lambda/Fargate mà không có từ ngữ về đặt trước.
- Công việc batch chịu lỗi, có thể bị ngắt: **Spot**. Phần mềm có giấy phép gắn với máy chủ: **Dedicated Hosts**.
- Nhiều tài khoản: mức giảm được chia sẻ trong toàn tổ chức (các bài sau).

## Quy tắc data transfer

Data transfer là một chủ đề giá riêng:

- **Vào AWS từ internet: miễn phí**, với mọi dịch vụ ở mọi Region.
- **Ra internet: tính phí** theo GB, có một mức miễn phí nhỏ mỗi tháng và bậc giá rẻ hơn khi khối lượng lớn.
- **Giữa các Region: tính phí.**
- **Giữa các Availability Zone trong một Region: tính phí.** Trong **cùng** một Availability Zone thì miễn phí.
- Dữ liệu từ S3 bucket sang các dịch vụ AWS khác trong **cùng Region**, và từ S3 sang CloudFront, là miễn phí.
- Lưu lượng đi qua **NAT gateway** bị tính thêm phí xử lý theo GB; VPC gateway endpoint cho S3 và DynamoDB không tính phí data transfer trong cùng Region.

Vì vậy nếu đề hỏi kiểu chuyển 2 TB dữ liệu nào không tốn phí, đáp án là **chiều vào từ internet**; chiều ra, giữa các Region và giữa các AZ đều tốn tiền.

## Ý chính

- Cam kết nhiều hơn hoặc ít linh hoạt hơn thì giảm giá sâu hơn: On-Demand < Compute Savings Plans < EC2 Instance Savings Plans và RI Standard; Spot rẻ nhất nhưng có thể bị ngắt.
- Savings Plans cam kết đô la mỗi giờ; Reserved Instances cam kết một cấu hình.
- 3 năm hơn 1 năm; All Upfront hơn Partial hơn No Upfront.
- RI Standard bán được trên Reserved Instance Marketplace; RI Convertible đổi được.
- Dữ liệu vào miễn phí; dữ liệu ra, giữa các Region và giữa các AZ bị tính phí.

## Nguồn

- [Compute Savings Plans and Reserved Instances](https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-ris.html)
- [Amazon EC2 Reserved Instances pricing](https://aws.amazon.com/ec2/pricing/reserved-instances/)
- [Overview of data transfer costs for common architectures](https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/)
