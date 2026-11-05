---
id: pricing-billing-pricing-calculator-trusted-advisor
title: "Pricing Calculator, Trusted Advisor và Compute Optimizer: ước tính, kiểm tra và right-size"
required: true
---
## Ba công cụ, ba thời điểm

Bài về ước tính chi phí đặt **AWS Pricing Calculator** trước khi xây dựng và **AWS Compute Optimizer** sau khi xây dựng. Bài này bổ sung các chi tiết quyết định những câu hỏi sát nhau trong đề, và giới thiệu **AWS Trusted Advisor**, công cụ kiểm tra sức khỏe toàn tài khoản.

## AWS Pricing Calculator

**AWS Pricing Calculator** là công cụ lập kế hoạch miễn phí trên web. Nó chỉ ước tính; không bao giờ báo cáo số tiền bạn thực sự đã chi.

- Nó trả lời "cái này sẽ tốn bao nhiêu?" cho một thiết kế bạn chưa xây, hoặc cho một thay đổi như thêm instance. Nó hiển thị số liệu trả trước, theo tháng và theo năm.
- Giá lấy từ AWS Price List. Ước tính chưa gồm thuế, và nếu trang tiếp thị và calculator có khác nhau thì AWS dùng giá ở trang tiếp thị.
- Điểm tương phản trong đề: nó có thể **dự phóng chi phí hằng tháng trong tương lai**. Nó không thể hiển thị chi phí **lịch sử** hay **hóa đơn hằng tháng** của bạn; đó là việc của Cost Explorer và trang Bills.
- Console Billing and Cost Management cũng có một calculator ngay trong console, có thể phản ánh mức giảm giá và cam kết mua của riêng bạn. Với TCO khi di chuyển, AWS kết hợp nó với Migration Evaluator (bài trước).

## AWS Trusted Advisor

**AWS Trusted Advisor** kiểm tra môi trường AWS của bạn và đề xuất hành động theo các thực hành tốt nhất của AWS. Các kiểm tra chia thành sáu nhóm:

| Nhóm | Ví dụ điều nó tìm |
| --- | --- |
| **Cost optimization** | Tài nguyên nhàn rỗi hoặc dùng ít, tài nguyên không dùng có thể gỡ bỏ |
| **Performance** | Thiết lập có thể cải thiện tốc độ và độ phản hồi |
| **Security** | Thiết lập rủi ro, như quyền truy cập mở quá rộng |
| **Fault tolerance** | Khoảng trống về dự phòng và tài nguyên bị quá tải |
| **Service limits** (quota) | Mức dùng đang tiến gần hoặc vượt quota |
| **Operational excellence** | Hỗ trợ vận hành môi trường hiệu quả và ở quy mô lớn |

Tài liệu cũ liệt kê **năm** nhóm (cost optimization, performance, security, fault tolerance, service limits); operational excellence là nhóm thứ sáu mới hơn. Cả hai cách nói đều mô tả cùng một dịch vụ.

Cách đọc kết quả: mỗi kiểm tra hiển thị **action recommended** (đỏ), **investigation recommended** (vàng) hoặc **no problems detected** (xanh). Nếu dùng AWS Organizations, **organizational view** báo cáo trên các tài khoản thành viên.

Những kiểm tra bạn thấy phụ thuộc vào gói AWS Support của bạn (xem chủ đề hỗ trợ).

Trusted Advisor đưa ra **lời khuyên rộng trên toàn tài khoản**, không phân tích sâu một loại tài nguyên. Đừng nhầm với:

- **AWS Well-Architected Tool**: bạn trả lời câu hỏi về một workload theo các trụ cột; Trusted Advisor kiểm tra tài khoản đang chạy.
- **Amazon Inspector** hoặc **Security Hub**: các dịch vụ bảo mật chuyên dụng; nhóm security của Trusted Advisor chỉ kiểm tra nhẹ các thiết lập phổ biến.
- **Cost Explorer**: cho thấy lịch sử chi tiêu; Trusted Advisor chỉ ra sự lãng phí.

Cách diễn đạt điển hình trong đề: "khuyến nghị theo các nhóm như cost, performance, service limits, fault tolerance và security" nghĩa là Trusted Advisor.

## AWS Compute Optimizer

**AWS Compute Optimizer** phân tích cấu hình và **chỉ số sử dụng của Amazon CloudWatch** của tài nguyên bằng học máy, để đưa ra **khuyến nghị rightsizing** và xác định **tài nguyên nhàn rỗi**. Nó báo tài nguyên có tối ưu hay không, và hiển thị biểu đồ sử dụng cùng mức sử dụng dự kiến cho từng phương án để bạn cân nhắc giá so với hiệu năng.

- **Tài nguyên được hỗ trợ** gồm Amazon **EC2 instance**, **EC2 Auto Scaling group**, **EBS volume**, **AWS Lambda function** và **Amazon ECS service trên AWS Fargate**, cùng nhiều loại cơ sở dữ liệu và tài nguyên khác.
- Bạn phải **opt in** trước. Mặc định nó xem **14 ngày** chỉ số gần nhất; một tính năng trả phí tùy chọn, enhanced infrastructure metrics, kéo dài thời gian xem lên 93 ngày.
- Bản thân Compute Optimizer **không tính thêm phí**.
- Khi management account opt in, bạn thấy khuyến nghị trên cả tổ chức.
- Nó chỉ khuyến nghị; bạn quyết định và hành động. Nó không mua plan hay đổi kích thước tài nguyên thay bạn.

Right-sizing như một ý tưởng thiết kế, tức là khớp tài nguyên với nhu cầu thực, được giải thích trong bài right-sizing của chủ đề khái niệm đám mây. Compute Optimizer là công cụ AWS cung cấp bằng chứng cho việc đó.

### Compute Optimizer, Cost Explorer hay Trusted Advisor?

Cả ba đều có thể chỉ ra sự lãng phí, nên hãy đọc kỹ gợi ý:

| Gợi ý | Công cụ |
| --- | --- |
| Ước tính một workload dự định | Pricing Calculator |
| Right-size EC2, Auto Scaling, EBS hoặc Lambda dựa trên chỉ số sử dụng | Compute Optimizer |
| Khuyến nghị rightsizing ngay trong console chi phí, hoặc lịch sử chi tiêu | Cost Explorer |
| Kiểm tra thực hành tốt nhất về cost, security, fault tolerance, performance và giới hạn | Trusted Advisor |

Nếu cả Compute Optimizer và Cost Explorer đều xuất hiện trong đáp án cho "xác định cơ hội rightsizing cho EC2", thì cả hai đều hợp lệ.

## Ý chính

- Pricing Calculator: ước tính hướng về tương lai, miễn phí; không có lịch sử hay hóa đơn.
- Trusted Advisor: kiểm tra thực hành tốt nhất trong sáu nhóm; các kiểm tra bạn thấy phụ thuộc vào gói AWS Support.
- Compute Optimizer: cần opt in, không tính thêm phí, rightsizing dựa trên chỉ số sử dụng cho EC2, Auto Scaling, EBS, Lambda và nhiều hơn.
- Cost Explorer cũng đưa ra khuyến nghị rightsizing cho EC2.

## Nguồn

- [What is AWS Pricing Calculator?](https://docs.aws.amazon.com/pricing-calculator/latest/userguide/what-is-pricing-calculator.html)
- [AWS Trusted Advisor](https://docs.aws.amazon.com/awssupport/latest/user/trusted-advisor.html)
- [What is AWS Compute Optimizer?](https://docs.aws.amazon.com/compute-optimizer/latest/ug/what-is-compute-optimizer.html)
