---
id: support-ai-other-workspaces-and-appstream
title: "Amazon WorkSpaces và WorkSpaces Applications (AppStream 2.0): máy tính để bàn so với ứng dụng"
required: true
---
## Điện toán người dùng cuối trong một ý

Cả hai dịch vụ giữ phần công việc trên AWS và chỉ hiển thị hình ảnh của nó trên thiết bị người dùng, nên nhân viên có thể làm việc từ laptop giá rẻ, máy tính bảng hoặc thiết bị cá nhân. Đề thi hỏi người dùng cần **cả máy tính để bàn** hay chỉ **một hai ứng dụng**.

## Amazon WorkSpaces: máy tính để bàn ảo được quản lý

**Amazon WorkSpaces** cấp cho mỗi người dùng một **máy tính để bàn ảo** trên đám mây, thường gọi là desktop as a service (DaaS). Các máy có thể chạy Windows, Ubuntu Linux, Rocky Linux hoặc Red Hat Enterprise Linux. AWS loại bỏ việc mua và triển khai phần cứng hay cài phần mềm phức tạp, và bạn thêm hoặc bớt người dùng khi nhu cầu thay đổi. Người dùng kết nối từ nhiều loại thiết bị hoặc từ trình duyệt web.

Có hai chế độ:

- **WorkSpaces Personal**: máy tính để bàn **bền vững (persistent)** gán cho một người dùng, giống một máy tính để bàn vật lý.
- **WorkSpaces Pools**: máy tính để bàn **không bền vững (non-persistent)** trên hạ tầng tạm thời, phù hợp cho môi trường được chuẩn bị sẵn.

Bạn chọn thanh toán theo tháng hoặc theo giờ, có thể mang license Windows của riêng mình, kết nối với Active Directory tại chỗ và thêm xác thực đa yếu tố. Cách ra đề điển hình: "nhân viên làm việc từ xa cần một máy trạm được quản lý trên đám mây từ mọi thiết bị", "cung cấp môi trường desktop cho nhiều nhân viên", hoặc "desktop Windows hoặc Linux, mọi nơi, mọi lúc".

## Amazon WorkSpaces Applications (trước đây là AppStream 2.0)

**Amazon WorkSpaces Applications** truyền phát **từng ứng dụng desktop**. AWS đã đổi tên dịch vụ mà tài liệu cũ và hướng dẫn kỳ thi gọi là **Amazon AppStream 2.0**, nên cả hai tên đều xuất hiện. Bạn cài ứng dụng một lần, AWS chạy chúng trên hạ tầng tính toán được quản lý, và người dùng mở chúng ngay trong trình duyệt hỗ trợ HTML5 hoặc ứng dụng client. Ứng dụng và dữ liệu không nằm trên thiết bị người dùng, bạn chỉ duy trì một phiên bản của mỗi ứng dụng, và trả tiền theo mức dùng mà không cần đầu tư trước.

Chọn nó khi ứng dụng cần **phần cứng mạnh** nhưng người dùng chỉ có **laptop cấu hình thấp**, hoặc khi nhà thầu cần đúng một ứng dụng chứ không cần cả desktop. Các loại fleet gồm Always-On, On-Demand và Elastic, đánh đổi giữa thời gian khởi động và chi phí.

## Các dịch vụ đã ngừng hoặc sắp đóng mà bạn vẫn có thể gặp

- **Amazon WorkSpaces Secure Browser** cho phép truy cập an toàn qua trình duyệt tới các website nội bộ. Nó đã đóng với khách hàng mới từ **ngày 29 tháng 10 năm 2026**; khách hàng hiện có vẫn dùng tiếp, và AWS gợi ý WorkSpaces Applications với image Chrome làm phương án thay thế. Nó nằm trong danh sách trong phạm vi CLF-C02.
- **Amazon WorkDocs** (lưu trữ và cộng tác tài liệu) đã hết hỗ trợ vào **ngày 25 tháng 4 năm 2025**.
- **Amazon WorkLink** (truy cập di động tới website nội bộ) đã hết hỗ trợ vào **tháng 11 năm 2021**. Các câu hỏi cũ dùng nó làm phương án sai bên cạnh AppStream 2.0.

## Bảng quyết định

| Nhu cầu | Dịch vụ |
| --- | --- |
| Desktop Windows hoặc Linux đầy đủ cho mỗi nhân viên từ xa | Amazon WorkSpaces |
| Desktop cá nhân bền vững | WorkSpaces Personal |
| Desktop không bền vững, được chuẩn bị sẵn | WorkSpaces Pools |
| Một ứng dụng đòi hỏi cao được truyền tới trình duyệt | WorkSpaces Applications (AppStream 2.0) |
| Cả desktop lẫn ứng dụng | WorkSpaces cùng WorkSpaces Applications |
| Truy cập an toàn chỉ bằng trình duyệt tới trang nội bộ | WorkSpaces Secure Browser (đã đóng với khách mới) |

## Trách nhiệm chung

AWS chịu trách nhiệm bảo mật **của** đám mây, như an toàn vật lý và môi trường của các cơ sở lưu trữ WorkSpaces. Bạn cấu hình quyền truy cập: xác thực đa yếu tố cho người dùng, cài đặt thư mục và quyền, và ghi log bằng các dịch vụ như AWS CloudTrail.

## Bẫy khi thi

- "Desktop" nghĩa là WorkSpaces; "ứng dụng" nghĩa là AppStream 2.0 hoặc WorkSpaces Applications.
- Laptop cấu hình thấp chạy ứng dụng ngốn phần cứng là dấu hiệu kinh điển của AppStream 2.0.
- AWS Cloud9 và Amazon Lightsail không phải dịch vụ desktop.

## Ý chính

- WorkSpaces = máy tính để bàn ảo được quản lý (Personal bền vững, Pools không bền vững).
- WorkSpaces Applications = tên mới của AppStream 2.0, truyền phát ứng dụng.
- WorkSpaces Secure Browser đã đóng với khách mới; WorkDocs và WorkLink đã kết thúc.
- Bạn quản lý quyền truy cập và MFA; AWS bảo mật hạ tầng.

## Nguồn

- [What is Amazon WorkSpaces?](https://docs.aws.amazon.com/workspaces/latest/adminguide/amazon-workspaces.html)
- [What Is Amazon WorkSpaces Applications?](https://docs.aws.amazon.com/appstream2/latest/developerguide/what-is-appstream.html)
- [Services in Full Shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
