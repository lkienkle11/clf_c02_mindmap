---
id: deploy-operate-systems-manager
title: "AWS Systems Manager chuyên sâu: managed node, các công cụ và khi nào nên chọn"
required: true
videoQuery: AWS Systems Manager Session Manager Patch Manager Run Command Parameter Store Automation explained
---
## Systems Manager là gì

**AWS Systems Manager** là bộ công cụ để xem, quản lý và vận hành các **node** ở quy mô lớn: Amazon EC2 instance, máy chủ tại chỗ, máy ảo, và máy ở các đám mây khác. Bài trước trong chuỗi này đã giới thiệu tổng quan; bài này phân loại các công cụ theo việc chúng làm. Dịch vụ từng có tên Amazon EC2 Systems Manager và Simple Systems Manager, vì vậy "SSM" vẫn xuất hiện trong tên agent, API và parameter.

## Managed node và SSM Agent

Một máy trở thành **managed node** khi **SSM Agent** được cài trên đó và agent kết nối được tới dịch vụ Systems Manager. Với máy không phải EC2 instance, bạn tạo một **hybrid activation**; mã kích hoạt và ID của nó hoạt động giống access ID và secret key, nhờ đó máy chủ tại chỗ và máy ở đám mây khác có thể đăng ký làm managed node. Khi node đã được quản lý, bạn có thể vá, chạy lệnh và mở phiên mà không cần đăng nhập vào từng máy. Nếu một node không báo cáo là managed, Systems Manager có runbook chẩn đoán kiểm tra các nguyên nhân như sự cố mạng.

## Các công cụ theo từng công việc

| Công việc | Công cụ | Làm gì |
| --- | --- | --- |
| Kết nối | **Session Manager** | Shell qua trình duyệt hoặc CLI tới node, không cần mở cổng inbound, bastion host hay SSH key; phiên có thể kiểm toán |
| Chạy | **Run Command** | Chạy script hoặc lệnh trên hàng chục hay hàng trăm node theo yêu cầu |
| Vá | **Patch Manager** | Quét các bản vá còn thiếu và cài chúng theo patch baseline, từng node hoặc theo nhóm chọn bằng tag |
| Tự động hóa | **Automation** | Chạy runbook cho các việc như tạo AMI, áp dụng bản cập nhật hay đặt lại thông tin đăng nhập |
| Giữ nhất quán | **State Manager** | Giữ node ở trạng thái xác định, ví dụ phần mềm được cài khi khởi động |
| Lên lịch | **Maintenance Windows** | Khung thời gian định kỳ cho các việc quản trị, như vá theo lịch, để công việc không làm gián đoạn vận hành |
| Kiểm kê | **Inventory** | Thu thập metadata về ứng dụng, tệp và bản vá từ các managed node |
| Dữ liệu cấu hình | **Parameter Store** | Lưu giá trị cấu hình và bí mật để ứng dụng đọc lúc chạy |

### Document và kiểm soát truy cập

**SSM document**, viết bằng JSON hoặc YAML, định nghĩa các hành động mà Systems Manager thực hiện. Command document được Run Command và State Manager dùng; runbook được Automation dùng. Quyền truy cập Session Manager được kiểm soát bằng **chính sách IAM**, nên bạn quyết định ai được mở phiên, và log phiên có thể gửi tới S3 hoặc CloudWatch Logs.

### Patch Manager và trách nhiệm chia sẻ

Với EC2, việc vá hệ điều hành guest và ứng dụng là trách nhiệm của **khách hàng**. Patch Manager giúp việc đó khả thi: patch baseline có thể tự duyệt bản vá vài ngày sau khi phát hành và liệt kê bản vá được duyệt hoặc bị từ chối, còn maintenance window có thể lên lịch cài đặt. Báo cáo vá có thể gửi tới S3.

### Parameter Store

**Parameter Store** lưu các giá trị như AMI ID, URL endpoint và license key. Các kiểu là String, StringList và **SecureString**, được mã hóa bằng **AWS KMS**. Tier **standard** không tính phí thêm; tier **advanced** cho phép nhiều và lớn hơn nhưng tốn thêm tiền. Parameter Store giữ các phiên bản của từng giá trị và hoạt động cùng IAM và CloudFormation.

Khi yêu cầu là có một nơi tập trung cho dữ liệu cấu hình và mật khẩu với chi phí thấp nhất, Parameter Store là đáp án. Khi yêu cầu có thêm **tự động xoay vòng** thông tin đăng nhập, hoặc truy cập giữa các tài khoản với nhật ký kiểm toán chi tiết, AWS khuyên dùng **AWS Secrets Manager** (nằm trong chủ đề IAM và bảo mật).

## Các dịch vụ liên quan nhưng không phải Systems Manager

- **AWS Resource Explorer** là dịch vụ tìm kiếm riêng. Nó tìm tài nguyên theo tên, tag hoặc ID với trải nghiệm giống công cụ tìm kiếm trên internet, và từ 6/10/2025 nó được bật sẵn trong tài khoản. Tìm kiếm cơ bản không tính phí thêm, còn tìm xuyên Region cần một Region tổng hợp (aggregator). Chọn nó để tìm tài nguyên; nó không triển khai hay quản trị gì cả.
- **AWS Service Catalog** quản trị các template đã duyệt để người khác khởi chạy (chủ đề giá và thanh toán). **AWS AppConfig** là một phần của Systems Manager và triển khai cấu hình ứng dụng cùng feature flag, có kiểm tra hợp lệ và rollback.
- **AWS CloudFormation** cấp phát hạ tầng; Systems Manager vận hành những gì chạy trên đó.

## Thay đổi trạng thái

Bản thân Systems Manager vẫn hoạt động. AWS liệt kê ba công cụ của nó ở chế độ **maintenance**: **Change Manager** và **Incident Manager**, đã ngừng nhận khách hàng mới từ 7/11/2025, và **Application Manager**. Khách hàng hiện tại vẫn dùng tiếp. Chúng không thuộc bức tranh cốt lõi của đề thi.

## Khi nào chọn Systems Manager

| Tình huống | Lựa chọn |
| --- | --- |
| Vào các instance riêng tư mà không mở cổng 22, không bastion, không phát SSH key | Session Manager |
| Áp dụng bản vá bảo mật cho hàng trăm instance | Patch Manager |
| Chạy một script trên cả cụm máy chủ ngay bây giờ | Run Command |
| Giữ cụm máy chủ ở cấu hình xác định theo thời gian | State Manager |
| Lưu giá trị cấu hình tập trung | Parameter Store |
| Tạo AMI hoặc đặt lại mật khẩu bằng quy trình lặp lại được | Automation |
| Cấp phát chính các máy chủ từ template | CloudFormation, không phải Systems Manager |

## Ý chính

- Node trở thành managed qua SSM Agent; hybrid activation đưa máy chủ tại chỗ và máy ở đám mây khác vào.
- Session Manager, Run Command, Patch Manager, Automation, State Manager, Inventory và Parameter Store mỗi công cụ một việc.
- Parameter Store tier standard miễn phí; dùng Secrets Manager khi cần xoay vòng.
- Resource Explorer tìm kiếm tài nguyên và không thuộc Systems Manager.

## Nguồn

- [What is AWS Systems Manager?](https://docs.aws.amazon.com/systems-manager/latest/userguide/what-is-systems-manager.html)
- [Using AWS Systems Manager tools](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-tools.html)
- [What is AWS Resource Explorer?](https://docs.aws.amazon.com/resource-explorer/latest/userguide/welcome.html)
