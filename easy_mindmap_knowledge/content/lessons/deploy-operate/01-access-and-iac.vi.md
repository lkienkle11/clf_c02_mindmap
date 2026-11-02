---
id: deploy-operate-access-iac
title: "Các cách làm việc với AWS, và hạ tầng dưới dạng mã"
required: true
---
## Mọi thao tác đều là một lời gọi API

Dù bạn dùng công cụ nào, cuối cùng nó cũng gọi tới **API của AWS**.

| Công cụ | Nó là gì | Phù hợp nhất cho |
| --- | --- | --- |
| AWS Management Console | Giao diện người dùng trên web | Học, khám phá, việc làm một lần, kiểm tra trực quan |
| AWS CLI | Công cụ dòng lệnh thống nhất cho các dịch vụ AWS | Script và các việc quản trị lặp lại nhanh |
| AWS SDK | Thư viện cho các ngôn ngữ như Python, Java, JavaScript, .NET, Go | Gọi AWS từ mã ứng dụng |
| AWS CloudShell | Shell chạy trên trình duyệt, mở từ console | Chạy lệnh CLI mà không cần cài đặt gì |

- **SDK** lo các chi tiết cấp thấp như ký yêu cầu (xác thực), thử lại và xử lý lỗi, để lập trình viên tập trung vào logic ứng dụng.
- **CloudShell** đã được **xác thực sẵn** bằng thông tin đăng nhập bạn dùng để vào console, có sẵn AWS CLI, và không tính thêm phí.

## Việc làm một lần hay quy trình lặp lại

Đề thi yêu cầu bạn phân biệt hai trường hợp này:

- Console là đủ cho việc **làm một lần** hoặc một thử nghiệm đầu tiên.
- Khi cùng một môi trường phải được dựng **đi dựng lại** (test, staging và production, hoặc nhiều Region), bấm tay vừa chậm vừa dễ sai. Hãy dùng **hạ tầng dưới dạng mã (infrastructure as code, IaC)**.

## AWS CloudFormation

**AWS CloudFormation** là dịch vụ IaC của AWS.

- Bạn viết một **template**, là tệp văn bản **JSON hoặc YAML** mô tả các tài nguyên bạn muốn, như một Auto Scaling group, một load balancer và một cơ sở dữ liệu RDS.
- CloudFormation tạo các tài nguyên đó thành một khối gọi là **stack**. Xóa stack thì các tài nguyên của nó cũng bị xóa.
- Trước khi cập nhật stack, một **change set** cho bạn thấy những gì sẽ thay đổi, ví dụ một cơ sở dữ liệu có bị thay thế hay không.
- Nếu tạo stack thất bại, CloudFormation **rollback** và xóa những gì nó đã tạo.
- Template là văn bản: hãy lưu chúng trong hệ thống quản lý phiên bản và **tái sử dụng** để dựng các môi trường giống hệt nhau ở Region hoặc tài khoản khác.
- CloudFormation không tính thêm phí với các loại tài nguyên AWS; bạn trả tiền cho tài nguyên mà nó tạo ra.

## AWS CDK

**AWS Cloud Development Kit (AWS CDK)** cho phép bạn định nghĩa hạ tầng bằng các ngôn ngữ lập trình quen thuộc như TypeScript, Python, Java, C# và Go. Bạn ghép các khối có thể tái sử dụng gọi là **construct**, và CDK triển khai chúng **thông qua CloudFormation**. Hãy chọn CDK khi nhóm thích dùng vòng lặp, hàm và sự hỗ trợ của IDE hơn là tự viết YAML.

## Bẫy thường gặp

- "Môi trường lặp lại được, nhất quán", "template" hoặc "hạ tầng được quản lý phiên bản" chỉ tới **CloudFormation**.
- "Truy cập AWS từ mã ứng dụng" chỉ tới **SDK**; "chạy lệnh CLI từ trình duyệt không cần cài đặt" chỉ tới **CloudShell**.
- CloudFormation **cấp phát** hạ tầng; nó không phải dịch vụ giám sát.

## Ý chính

- Console cho việc trực quan và làm một lần; CLI và SDK cho tự động hóa và mã.
- CloudShell = shell trên trình duyệt, xác thực sẵn, có sẵn CLI.
- IaC giúp môi trường lặp lại được; CloudFormation dùng template JSON hoặc YAML và stack.
- CDK viết hạ tầng bằng ngôn ngữ lập trình và triển khai qua CloudFormation.

## Nguồn

- [What is AWS CloudShell?](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)
- [How CloudFormation works](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-overview.html)
- [What is the AWS CDK?](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
