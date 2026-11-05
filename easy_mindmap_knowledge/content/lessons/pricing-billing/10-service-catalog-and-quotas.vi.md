---
id: pricing-billing-service-catalog-and-quotas
title: "AWS Service Catalog, Service Quotas và License Manager: sản phẩm được duyệt, giới hạn và giấy phép"
required: true
---
## Kiểm soát nhóm được khởi chạy gì, dùng bao nhiêu, theo giấy phép nào

Ba dịch vụ giúp tổ chức giữ quyền kiểm soát khi nhiều nhóm cùng dùng AWS: **Service Catalog** kiểm soát họ được khởi chạy *cái gì*, **Service Quotas** cho biết họ được dùng *bao nhiêu*, và **License Manager** theo dõi họ đang dùng *giấy phép phần mềm* nào.

## AWS Service Catalog

**AWS Service Catalog** cho phép tổ chức tạo và quản lý một **danh mục các dịch vụ CNTT đã được phê duyệt để dùng trên AWS**. Quản trị viên đăng sản phẩm lên; người dùng cuối duyệt danh mục và chỉ khởi chạy những gì họ được phép, chỉ vài cú nhấp chuột, mà không cần quyền rộng trên các dịch vụ bên dưới.

Từ vựng:

- **Product (sản phẩm)**: một dịch vụ CNTT đã được duyệt, thường tạo bằng cách nhập một **template AWS CloudFormation**. Nó có thể là một máy chủ đơn lẻ hoặc cả ứng dụng nhiều tầng. Cấu hình Terraform cũng được hỗ trợ, và một sản phẩm có thể là sản phẩm AWS Marketplace đã đóng gói.
- **Portfolio**: một tập hợp sản phẩm kèm quy tắc về ai được dùng. Bạn tạo portfolio cho từng loại người dùng và cấp quyền truy cập qua IAM.
- **Constraints (ràng buộc)**: giới hạn cách triển khai một sản phẩm. **Launch constraint** chỉ định IAM role dùng để tạo tài nguyên, **template constraint** hạn chế các tham số như loại instance, và **notification constraint** gửi sự kiện stack đến một Amazon SNS topic.
- **Provisioned product**: thứ người dùng nhận được sau khi khởi chạy; nó là một CloudFormation stack.
- **Phiên bản**: cập nhật một sản phẩm một lần và phiên bản mới có sẵn ở mọi portfolio chứa nó.
- **Chia sẻ**: portfolio có thể chia sẻ cho tài khoản khác, kể cả trong cả tổ chức.

Lợi ích: **chuẩn hóa**, **tự phục vụ (self-service)**, **kiểm soát truy cập chi tiết** và **quản trị, tuân thủ** nhất quán. Phí Service Catalog dựa trên số lệnh gọi API vượt mức miễn phí hằng tháng.

### Service Catalog so với các dịch vụ trông giống nhau

| Nhu cầu | Dịch vụ |
| --- | --- |
| Viết template dùng lại được để triển khai tài nguyên | **CloudFormation** |
| Cho người khác chỉ khởi chạy các template **đã duyệt, được quản trị** (tự phục vụ có rào chắn) | **Service Catalog** |
| Tạo, gom và quản trị tài khoản, SCP, một hóa đơn | **Organizations** |
| Thiết lập cả môi trường nhiều tài khoản kèm controls | **Control Tower** (bản thân nó dùng Service Catalog cho Account Factory) |
| Mua phần mềm của bên thứ ba | **AWS Marketplace** |

Cách diễn đạt trong đề như "quản lý các dịch vụ CNTT đã triển khai và quản trị các template IaC", "sản phẩm đã được duyệt", "kiểm soát ai được triển khai" hoặc "đáp ứng yêu cầu tuân thủ" trỏ về Service Catalog. "Tạo template có thể dùng lại để triển khai tài nguyên" thì đơn giản là CloudFormation.

## AWS Service Quotas

Mỗi dịch vụ AWS đều có **quota** (còn gọi là **limit**): số lượng tài nguyên hoặc thao tác tối đa cho một tài khoản hoặc Region, ví dụ số VPC mỗi Region. Mỗi dịch vụ đặt **giá trị mặc định**.

**AWS Service Quotas** là nơi tập trung để:

- **Xem** quota của các dịch vụ AWS, kể cả quota nào **điều chỉnh được**.
- **Yêu cầu tăng** khi giá trị mặc định không đáp ứng nhu cầu. Việc tăng cần thời gian xét duyệt và AWS có thể chấp thuận, từ chối hoặc chấp thuận một phần.
- **Xem mức sử dụng** của một quota và dùng **automatic management** để được thông báo trước khi bạn hết hạn mức.

Lưu ý cho kỳ thi:

- Nhiều quota áp dụng **theo Region và theo tài khoản**; mỗi Region có giá trị riêng. Trải workload ra nhiều tài khoản cũng trải được quota.
- **Quota bảo vệ bạn** khỏi việc cấp phát dư thừa ngoài ý muốn và chi phí tăng vọt, đồng thời bảo vệ chính dịch vụ.
- Lên kế hoạch trước cho quota là một thực hành thiết kế về **độ tin cậy**, đừng để đến khi khởi chạy thất bại mới xử lý.
- **Trusted Advisor** có kiểm tra service limits báo mức dùng gần chạm quota; **Service Quotas** là nơi bạn xem quota và xin tăng.

## AWS License Manager

**AWS License Manager** giúp bạn quản lý giấy phép phần mềm từ các nhà cung cấp như Microsoft, SAP, Oracle và IBM trên nhiều tài khoản, Region và cả tổ chức. Nó hỗ trợ giấy phép tính theo **vCPU, lõi vật lý, socket hoặc số máy**.

- Định nghĩa **quy tắc cấp phép** từ các thỏa thuận của bạn, với **giới hạn cứng hoặc mềm**, để có thể chặn việc khởi chạy vi phạm trước khi nó xảy ra.
- Theo dõi mức dùng trên dashboard và báo cáo để hỗ trợ **kiểm toán của nhà cung cấp** và tránh vượt hạn mức.
- Hỗ trợ **bring your own license (BYOL)**: dùng lại giấy phép sẵn có trên AWS.
- Tích hợp với **Amazon EC2** (gồm Dedicated Hosts và Dedicated Instances), **Amazon RDS** cho Oracle và Db2, **AWS Systems Manager** (cho máy chủ ngoài AWS), **AWS Marketplace**, **AWS Data Exchange** và **AWS Organizations**.
- License Manager **không tính thêm phí**; bạn trả cho các tài nguyên.

Cái bẫy: License Manager *theo dõi và quản trị* giấy phép bạn đã có; nó không phải nơi *mua* phần mềm (đó là AWS Marketplace) và không quản lý khóa mã hóa, secret hay tài khoản.

## Ý chính

- Service Catalog: portfolio các sản phẩm đã duyệt (template CloudFormation), constraint, khởi chạy tự phục vụ; lớp quản trị bên trên CloudFormation.
- Service Quotas: xem quota và xin tăng; quota chủ yếu theo Region và theo tài khoản; Trusted Advisor báo khi gần chạm quota.
- License Manager: theo dõi và giới hạn mức dùng giấy phép (vCPU, lõi, socket, máy), hỗ trợ BYOL, không tính thêm phí.

## Nguồn

- [What is Service Catalog?](https://docs.aws.amazon.com/servicecatalog/latest/adminguide/introduction.html)
- [What is Service Quotas?](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html)
- [What is AWS License Manager?](https://docs.aws.amazon.com/license-manager/latest/userguide/license-manager.html)
