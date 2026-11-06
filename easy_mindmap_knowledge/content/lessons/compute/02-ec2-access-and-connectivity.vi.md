---
id: compute-ec2-access-and-connectivity
title: Kết nối vào EC2: key pair, Instance Connect và Session Manager
required: true
---
## Vì sao truy cập là chủ đề thi

EC2 instance là máy chủ của bạn, nên bạn quyết định **ai được đăng nhập và đăng nhập bằng cách nào**. AWS có nhiều cách vào máy. Chúng khác nhau ở chỗ phải mở cổng mạng nào, dùng thông tin xác thực nào và ghi lại được bao nhiêu. Đề thi yêu cầu bạn chọn cách phù hợp với một yêu cầu về bảo mật hoặc sự tiện lợi.

## Key pair và SSH

**Key pair** gồm một khóa công khai (public key) và một khóa riêng (private key). Khi instance Linux khởi động lần đầu, EC2 đặt public key lên máy, còn bạn giữ private key. Ai có private key thì đăng nhập được, và AWS không giữ bản sao, nên mất khóa là không lấy lại được. Quản trị viên Linux kết nối bằng ứng dụng **SSH** cùng private key. Với Windows, private key dùng để giải mã mật khẩu Administrator do hệ thống tạo, rồi bạn kết nối bằng ứng dụng RDP.

Cách truyền thống này cần một **quy tắc inbound** cho phép địa chỉ của bạn đến được instance, thường là SSH cổng 22 cho Linux và RDP cổng 3389 cho Windows. Để cổng SSH hoặc RDP mở sẵn làm tăng rủi ro bị truy cập trái phép, vì vậy mới có các lựa chọn thay thế bên dưới.

## Security group: cánh cổng đầu tiên

**Security group** là tường lửa ảo bao quanh instance. Bạn thêm các quy tắc cho phép lưu lượng vào hoặc ra. Nó có tính **stateful**: lưu lượng phản hồi cho yêu cầu đã được phép sẽ đi qua mà không cần thêm quy tắc. Bạn có thể gắn nhiều group cho một instance, sửa quy tắc bất cứ lúc nào và không mất phí. Mở SSH hoặc RDP trong security group là việc của bạn, không phải của AWS.

## So sánh các cách kết nối

| Cách | OS của instance | Phải mở cổng inbound? | Thông tin xác thực | Ghi chú |
| --- | --- | --- | --- | --- |
| Ứng dụng SSH | Linux | Có | Key pair | Truyền thống, bạn tự quản lý khóa |
| Ứng dụng RDP | Windows | Có | Key pair giải mã mật khẩu | Truyền thống cho Windows |
| **EC2 Instance Connect** | Linux | Có | Quyền IAM | Không cần phát key pair |
| **Session Manager** | Linux, Windows, macOS | **Không** | Quyền IAM | Có log, không cần bastion host |

**EC2 Instance Connect** để chính sách IAM quyết định ai được kết nối. Khi bạn kết nối, một public key dùng một lần được đẩy lên instance và chỉ có hiệu lực 60 giây, nên bạn không cần key pair dùng lâu dài. Kết nối vẫn đi tới instance qua cổng mạng thông thường. **EC2 Instance Connect Endpoint** bổ sung đường vào cho instance chỉ có địa chỉ IP riêng, không cần bastion host và không cần internet gateway.

**AWS Systems Manager Session Manager** cho bạn một shell trên trình duyệt hoặc CLI mà **không phải mở cổng inbound nào**, không cần khóa SSH và không cần bastion host (máy trung chuyển). IAM kiểm soát quyền truy cập, và hoạt động của phiên có thể được ghi vào AWS CloudTrail, Amazon S3 hoặc Amazon CloudWatch Logs. Nó cần SSM Agent trên instance (chỉ cài sẵn trên một số AMI) và một IAM role cho instance. Session Manager còn kết nối được tới instance không có địa chỉ IP công khai.

**AWS CloudShell** thì khác: đó là shell trên trình duyệt, đã xác thực sẵn bằng phiên đăng nhập console, dùng để chạy lệnh AWS CLI. Dịch vụ này không tính thêm phí. Đây là nơi bạn chạy lệnh gọi AWS, không phải cách đăng nhập vào một máy chủ.

## Instance role thay cho thông tin xác thực nhúng sẵn

Ứng dụng chạy trên instance thường phải gọi AWS, ví dụ đọc một bucket Amazon S3. **Đừng** lưu access key trên instance. Hãy tạo một **IAM role**, gắn vào instance thông qua **instance profile** (vật chứa trao role cho instance) và để ứng dụng tự lấy **thông tin xác thực tạm thời**. Bạn không phải phân phối hay cập nhật khóa, và khi đổi role thì thay đổi áp dụng cho mọi instance dùng role đó. Mỗi instance giữ một role tại một thời điểm.

## User data: tự cấu hình khi khởi chạy

**User data** là đoạn script hoặc văn bản cloud-init bạn cung cấp lúc khởi chạy. Mặc định nó chạy một lần, ở lần khởi động đầu tiên, dưới quyền root. Dùng nó để cài phần mềm, cập nhật hoặc bật dịch vụ để mỗi instance mới tự cấu hình. Giới hạn là 16 KB. Nếu script gọi API của AWS, hãy khởi chạy instance cùng một instance profile. User data thuộc về instance, nên **không** được lưu vào AMI tạo từ instance đó.

## Trách nhiệm chung

AWS bảo vệ phần cứng, hypervisor và cơ sở vật chất. Bạn chọn quy tắc security group, bảo vệ private key, vá hệ điều hành khách và quyết định danh tính IAM nào được kết nối.

## Bẫy thường gặp khi thi

- "Không mở cổng inbound" hoặc "không cần bastion host" hướng tới **Session Manager**.
- "Không phải quản lý khóa SSH" và "IAM kiểm soát truy cập" khớp với Instance Connect hoặc Session Manager. Chỉ Session Manager không cần mở cổng.
- Private key bị mất không thể tải lại từ AWS.
- Nhúng access key vào instance là sai: hãy dùng instance role.

## Ý chính

- Key pair cùng SSH hoặc RDP là cách truyền thống và cần mở cổng.
- Instance Connect đẩy khóa 60 giây bằng quyền IAM; Session Manager không cần mở cổng và có log.
- Cấp cho ứng dụng một instance role, đừng lưu access key.
- User data chạy ở lần khởi động đầu; bạn lo việc vá OS và quy tắc tường lửa.

## Nguồn

- [Connect to your EC2 instance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect.html)
- [AWS Systems Manager Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [IAM roles for Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
