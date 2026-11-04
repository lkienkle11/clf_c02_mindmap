---
id: deploy-operate-elastic-beanstalk-and-deployments
title: "Elastic Beanstalk và các chiến lược triển khai chuyên sâu"
required: true
videoQuery: AWS Elastic Beanstalk deployment policies all at once rolling immutable blue green canary explained
---
## Elastic Beanstalk quản lý những gì

**AWS Elastic Beanstalk** cho phép bạn triển khai ứng dụng web mà không phải tự dựng hạ tầng. Bạn tạo một application, tải **source bundle** lên, và Beanstalk khởi chạy một **environment**: nó cấp phát các Amazon EC2 instance (hoặc Amazon EKS ở chế độ Cluster mới hơn), cấu hình cân bằng tải, thiết lập giám sát sức khỏe và co giãn environment lên xuống.

- **Nền tảng được hỗ trợ:** Go, Java, .NET, Node.js, PHP, Python và Ruby, cùng container **Docker** khi bạn tự chọn ngôn ngữ và thư viện. Docker chỉ là một lựa chọn, không phải lựa chọn duy nhất.
- **Giá:** **không tính phí thêm** cho Beanstalk. Bạn chỉ trả cho các tài nguyên bên dưới mà nó tạo ra.
- **Kiểm soát:** tài nguyên nằm trong tài khoản của bạn và bạn vẫn xem, điều chỉnh được chúng.

### Ai quản lý phần nào

| Lớp | Do ai quản lý |
| --- | --- |
| Cấp phát năng lực, cân bằng tải, co giãn và thiết lập giám sát sức khỏe | Elastic Beanstalk |
| Mã ứng dụng và cấu hình của nó | Bạn |
| Bảo mật của các dịch vụ nền tảng bên dưới | AWS (bảo mật "của" đám mây) |

Mô hình trách nhiệm chia sẻ vẫn áp dụng. Beanstalk bớt đi công việc thiết lập, nhưng mã ứng dụng, dữ liệu và việc kiểm soát truy cập vẫn là việc của bạn.

## Beanstalk so với các lựa chọn lân cận

| Lựa chọn | Phù hợp nhất | Ai làm nhiều việc hơn |
| --- | --- | --- |
| Elastic Beanstalk | Chạy nhanh một ứng dụng web bằng ngôn ngữ được hỗ trợ, ít cần kiến thức hạ tầng | AWS lo phần thiết lập; bạn giữ quyền kiểm soát |
| CloudFormation hoặc CDK | Mô tả và lặp lại bất kỳ hạ tầng nào từ template hoặc mã | Bạn định nghĩa từng tài nguyên |
| Amazon EC2 trực tiếp | Toàn quyền kiểm soát máy chủ | Bạn tự dựng, co giãn và vá |
| Container và serverless | ECS, EKS, Fargate và Lambda, nằm trong chủ đề điện toán | Tùy dịch vụ |

Cách diễn đạt trong đề như "triển khai nhanh **mà không cấp phát** hạ tầng", "ít kiến thức về AWS", hay "ứng dụng Java không chạy trong container, cần tự cấp năng lực, cân bằng tải, co giãn và giám sát sức khỏe" đều mô tả **Elastic Beanstalk**. Nếu đề nói "template" hoặc "môi trường lặp lại được" thì đó là CloudFormation.

## Các chiến lược triển khai

Chiến lược triển khai là cách phiên bản mới thay thế phiên bản cũ. Bài về phát hành phần mềm đã giới thiệu bốn chiến lược; bảng dưới đây bổ sung tên gọi trong Beanstalk và CodeDeploy.

| Chiến lược | Cách hoạt động | Gián đoạn và rủi ro | Rollback |
| --- | --- | --- | --- |
| All at once | Phiên bản mới đưa lên mọi instance cùng lúc | Nhanh nhất; có thể ngưng dịch vụ ngắn | Triển khai lại bản cũ |
| Rolling | Từng đợt instance một | Không ngưng toàn bộ; năng lực giảm trong lúc cập nhật | Triển khai lại bản cũ |
| Rolling with additional batch | Khởi chạy thêm một đợt trước, rồi cuốn chiếu | Giữ đủ năng lực; chậm hơn | Triển khai lại bản cũ |
| Immutable | Khởi chạy instance mới trong một Auto Scaling group thứ hai; instance cũ bị gỡ sau khi qua kiểm tra sức khỏe | An toàn; chậm hơn; tạm thời dùng thêm instance | Hủy các instance mới |
| Traffic splitting (canary) | Gửi một phần lưu lượng tới phiên bản mới trước | Chỉ một phần nhỏ người dùng bị ảnh hưởng | Định tuyến lại lưu lượng và hủy instance mới |
| Blue/green | Triển khai sang một environment riêng rồi hoán đổi | Tác động tối thiểu | Hoán đổi URL ngược lại |

### Chi tiết riêng của Beanstalk

- **All at once** là chính sách nhanh nhất, hợp khi chấp nhận được việc mất dịch vụ ngắn. **Rolling** tránh ngưng dịch vụ. **Rolling with an additional batch** giữ nguyên băng thông. **Immutable** dùng được cho environment có load balancer lẫn một instance; **traffic splitting** cần Application Load Balancer.
- **Blue/green** trong Beanstalk nghĩa là khởi chạy environment thứ hai với phiên bản mới, kiểm thử, rồi dùng **Swap environment URLs** để hoán đổi bản ghi CNAME của hai environment. Đây là cách tránh việc ứng dụng bị gián đoạn ngắn như khi cập nhật tại chỗ, và là bắt buộc khi nâng cấp lên platform version không tương thích. Hãy để cơ sở dữ liệu nằm ngoài environment, nếu không phép hoán đổi sẽ không mang nó theo.
- **CodeDeploy** cũng hỗ trợ triển khai tại chỗ và blue/green cho EC2 và máy chủ tại chỗ, còn với Lambda và Amazon ECS thì chuyển lưu lượng theo canary, linear và all-at-once.

### Khi nào chọn cái nào

| Tình huống | Chiến lược |
| --- | --- |
| Chấp nhận mất dịch vụ ngắn và cần nhanh | All at once |
| Production không muốn ngưng toàn bộ, chấp nhận giảm năng lực | Rolling |
| Production phải giữ đủ năng lực | Rolling with additional batch hoặc immutable |
| Phải chứng minh phiên bản mới trên một phần nhỏ người dùng trước | Canary hoặc traffic splitting |
| Quay về bản cũ ngay lập tức, an toàn, khi bản cũ vẫn đang chạy | Blue/green |

## Bẫy thường gặp

- "Quay về phiên bản trước trong vài giây, environment cũ vẫn chạy" là **blue/green**, không phải rolling hay all at once.
- Beanstalk **không có phí theo giờ**; và nó không bị giới hạn ở Docker.
- Beanstalk cấp phát và chạy ứng dụng; **CodePipeline** điều phối các giai đoạn phát hành còn **CodeDeploy** tự động hóa việc triển khai (bài tiếp theo).

## Ý chính

- Beanstalk lo năng lực, cân bằng tải, co giãn và giám sát sức khỏe cho mã bạn tải lên, không tính phí thêm.
- Bạn vẫn sở hữu mã, dữ liệu và quyền kiểm soát tài nguyên.
- All at once nhanh nhất, rolling tránh ngưng dịch vụ, immutable và traffic splitting giảm rủi ro, blue/green rollback nhanh nhất.
- Chọn Beanstalk cho "triển khai mà không cấp phát", CloudFormation cho "lặp lại được từ template".

## Nguồn

- [What is AWS Elastic Beanstalk?](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [Deploying applications to Elastic Beanstalk environments](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.deploy-existing-version.html)
- [Blue/Green deployments with Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.CNAMESwap.html)
