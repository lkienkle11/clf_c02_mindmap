---
id: pricing-billing-control-tower-and-ram
title: "AWS Control Tower, AWS RAM và Billing Conductor: quản trị và chia sẻ giữa các tài khoản"
required: true
---
## Từ nhiều tài khoản đến một môi trường được quản trị

Khi công ty chạy nhiều tài khoản, ba nhu cầu xuất hiện: thiết lập chúng một cách nhất quán và an toàn; chia sẻ một số tài nguyên mà không sao chép vào từng tài khoản; và trình bày chi phí cho từng nhóm theo cách khớp với hoạt động kinh doanh. Bài này giới thiệu một dịch vụ cho mỗi nhu cầu.

## AWS Control Tower

**AWS Control Tower** là cách dễ nhất để **thiết lập và quản trị một môi trường AWS nhiều tài khoản an toàn** theo các thực hành tốt nhất. Nó điều phối các dịch vụ khác, gồm **AWS Organizations**, **AWS Service Catalog** và **AWS IAM Identity Center**, để dựng nên một **landing zone**. Nó không tính phí riêng; bạn trả cho các dịch vụ nền mà nó cấu hình, như AWS CloudTrail và AWS Config.

Các thành phần chính:

- **Landing zone**: một môi trường nhiều tài khoản được thiết kế tốt, chứa các OU, tài khoản và người dùng của bạn, xây theo thực hành tốt nhất về bảo mật và tuân thủ.
- **Controls** (trước đây gọi là **guardrails**): các quy tắc viết bằng ngôn ngữ thông thường, quản trị liên tục. Chúng áp dụng cho cả một OU, nên mọi tài khoản trong OU đều được bao phủ. Có ba loại:

| Loại | Công dụng | Được xây bằng |
| --- | --- | --- |
| **Preventive** | Ngăn một hành động xảy ra | Service control policy (và resource control policy) |
| **Detective** | Phát hiện và báo cáo vi phạm | Quy tắc AWS Config |
| **Proactive** | Chặn tài nguyên không tuân thủ trước khi được tạo | AWS CloudFormation hooks |

Controls còn có mức hướng dẫn: **mandatory** (các control nền tảng bảo vệ tài nguyên do Control Tower triển khai; chúng được áp dụng mặc định cho các OU của bạn, dù landing zone phiên bản 4.0 đã ngừng triển khai một số control), **strongly recommended** (rất nên bật) hoặc **elective** (tùy chọn).

- **Account Factory**: một mẫu cấu hình giúp chuẩn hóa việc tạo tài khoản mới với các thiết lập đã được phê duyệt, nhờ đó các nhóm có tài khoản mới nhanh chóng.
- **Dashboard**: một màn hình xem các tài khoản đã cấp, controls đang bật và tài nguyên không tuân thủ.

### Khác gì các dịch vụ trông giống nhau

- **Organizations** cung cấp cấu trúc tài khoản, SCP và consolidated billing. **Control Tower** nằm bên trên và tự động hóa một cách thiết lập được khuyến nghị cùng các controls dựng sẵn. Nếu đề chỉ hỏi về "tạo tài khoản, gom nhóm, áp dụng chính sách" hoặc "hợp nhất hóa đơn" thì đáp án là Organizations.
- **CloudFormation** triển khai tài nguyên từ template; riêng nó không thiết lập một môi trường nhiều tài khoản.
- Cách diễn đạt điển hình trong đề: "thiết lập **môi trường nhiều tài khoản mới** theo thực hành tốt nhất", "landing zone", "guardrails cho nhiều tài khoản". Tất cả đều trỏ về Control Tower.

Management account của tổ chức cố ý được miễn trừ khỏi controls, để nó không bao giờ tự khóa mình.

## AWS Resource Access Manager (AWS RAM)

**AWS RAM** cho phép bạn **chia sẻ tài nguyên AWS mình sở hữu với các tài khoản khác** thay vì tạo bản sao ở mỗi tài khoản. Bạn tạo tài nguyên một lần, đặt nó vào một **resource share**, rồi chỉ định đối tượng nhận: các tài khoản cụ thể, một OU hoặc cả tổ chức (một số loại tài nguyên còn chia sẻ được cho từng IAM role và user).

- Tài nguyên chia sẻ được gồm **VPC subnet**, **Transit Gateway**, **Route 53 Resolver rule** và **License Manager license configuration**. Một mô hình phổ biến là tài khoản mạng trung tâm chia sẻ subnet cho các tài khoản ứng dụng.
- **Chủ sở hữu vẫn giữ quyền sở hữu**. Các tài khoản khác dùng tài nguyên như thể của mình, theo quyền gắn với resource share.
- Lợi ích: ít việc vận hành hơn, chỉ cần quản lý một bộ quyền, và có khả năng quan sát qua Amazon CloudWatch và AWS CloudTrail.
- RAM **không tính thêm phí**. Bạn trả giá bình thường cho các tài nguyên được chia sẻ.
- Bạn tạo resource share trong một Region, và các tài nguyên cấp Region trong đó phải nằm ở đúng Region đó.

Đừng nhầm RAM với IAM Identity Center (dùng để đăng nhập vào các tài khoản) hay với Organizations (gom các tài khoản mà RAM chia sẻ giữa chúng).

## AWS Billing Conductor

**AWS Billing Conductor** phục vụ **showback và chargeback**. Bạn gom tài khoản vào các **billing group** và áp dụng quy tắc giá, biên lợi nhuận và các khoản phí hoặc credit tùy chỉnh để tạo ra phiên bản dữ liệu chi phí thứ hai, gọi là **pro forma**. Dịch vụ này được AWS Channel Partner và các công ty tính phí nội bộ cho từng phòng ban theo mức giá riêng sử dụng.

Nó **không thay đổi hóa đơn thật của AWS** và cũng không phải công cụ tối ưu hóa: nó không đề xuất cách tiết kiệm. Câu hỏi về giảm chi phí EC2 hướng đến Compute Optimizer hoặc Cost Explorer, không phải Billing Conductor.

## Ý chính

- Control Tower: landing zone tự động cho môi trường nhiều tài khoản, với controls (preventive, detective, proactive) và Account Factory; xây trên Organizations, Service Catalog và IAM Identity Center; không tính phí thêm.
- Organizations là nền tảng; Control Tower là lớp được hướng dẫn và quản trị bên trên.
- RAM chia sẻ subnet, Transit Gateway và các tài nguyên tương tự giữa các tài khoản mà không nhân bản, không tính phí thêm.
- Billing Conductor tạo billing group pro forma tùy chỉnh cho chargeback; hóa đơn thật không đổi.

## Nguồn

- [What is AWS Control Tower?](https://docs.aws.amazon.com/controltower/latest/userguide/what-is-control-tower.html)
- [What is AWS Resource Access Manager?](https://docs.aws.amazon.com/ram/latest/userguide/what-is.html)
- [What is AWS Billing Conductor?](https://docs.aws.amazon.com/billingconductor/latest/userguide/what-is-billingconductor.html)
