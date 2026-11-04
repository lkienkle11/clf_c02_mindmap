---
id: deploy-operate-cloudformation-and-cdk
title: "CloudFormation và CDK chuyên sâu: template, stack, change set và drift"
required: true
videoQuery: AWS CloudFormation vs CDK infrastructure as code stacks change sets drift detection explained
---
## Vì sao cần hạ tầng dưới dạng mã

Bấm chuột trong console chỉ dựng được một môi trường, một lần. Khi nhóm cần các môi trường test, staging và production giống hệt nhau, hoặc cùng một kiến trúc ở nhiều Region, thì một bản mô tả hạ tầng bằng văn bản sẽ nhanh hơn, lặp lại được và dễ review. Đó là **hạ tầng dưới dạng mã (infrastructure as code, IaC)**. Phần cơ bản nằm ở bài đầu của chủ đề này; bài này đi sâu vào cách **AWS CloudFormation** và **AWS CDK** hoạt động.

## CloudFormation hoạt động thế nào

1. Bạn viết một **template**, tệp văn bản YAML hoặc JSON mô tả các tài nguyên và thuộc tính của chúng. Chỉ phần **Resources** là bắt buộc.
2. Bạn lưu nó trên máy hoặc trong Amazon S3 rồi tạo một **stack** từ đó. CloudFormation gọi API của các dịch vụ thay bạn, tự xác định phụ thuộc và dựng song song những tài nguyên độc lập.
3. Bạn dùng stack như một đơn vị duy nhất. Cập nhật hoặc xóa stack sẽ cập nhật hoặc xóa toàn bộ tài nguyên của nó cùng lúc.

Template có thể nhận **parameter**, tức giá trị đầu vào chọn khi tạo stack, ví dụ loại instance. Nhờ vậy một template phục vụ được cả stack test nhỏ lẫn stack production lớn.

## Cập nhật an toàn: change set, rollback và drift

| Tính năng | Làm gì | Gợi ý trong đề thi |
| --- | --- | --- |
| Change set | Xem trước bản cập nhật sẽ thêm, sửa, thay thế hay xóa gì; không đổi gì cho đến khi bạn thực thi | "Xem tác động trước khi cập nhật stack" |
| Rollback | Nếu tạo stack thất bại, CloudFormation xóa các tài nguyên đã tạo; cập nhật thất bại thì quay về trạng thái chạy tốt gần nhất | "Tạo stack hỏng giữa chừng" |
| Drift detection | So sánh cấu hình thực tế với template và báo các tài nguyên bị đổi ngoài CloudFormation | "Có người sửa tay một tài nguyên" |

Có hai chi tiết dễ bỏ sót. Change set **không** đảm bảo bản cập nhật sẽ thành công, ví dụ lỗi lúc chạy vẫn có thể xảy ra. Còn drift detection chỉ **báo cáo** sự khác biệt, không tự sửa; bạn phải tự khắc phục, chẳng hạn cập nhật tài nguyên cho khớp với template.

## Stack trên nhiều Region và nhiều tài khoản

**CloudFormation StackSets** triển khai một template thành các stack trên nhiều tài khoản AWS và nhiều Region chỉ bằng một thao tác. Tài khoản quản trị tạo StackSet, còn các tài khoản đích nhận stack. Đây là đáp án khi đề hỏi cách triển khai cùng một hạ tầng cho nhiều Region hoặc tài khoản. Nó không thay thế **AWS Control Tower**, dịch vụ thiết lập và quản trị cả môi trường nhiều tài khoản.

## Chi phí và trách nhiệm

CloudFormation không tính phí thêm khi dùng với các loại tài nguyên AWS. Bạn trả tiền cho tài nguyên mà stack tạo ra, như EC2 instance hay load balancer. Chỉ các thao tác handler của extension bên thứ ba mới bị tính phí. CloudFormation cần quyền IAM để tạo từng tài nguyên, nên nó chỉ dựng được những gì người hoặc role chạy nó được phép dựng.

## AWS CDK

**AWS Cloud Development Kit (AWS CDK)** là framework mã nguồn mở để định nghĩa hạ tầng bằng ngôn ngữ lập trình đa dụng. Nó hỗ trợ **TypeScript, JavaScript, Python, Java, C#/.NET và Go**. Bạn viết các khối dựng sẵn gọi là **construct**, gom thành stack, và CDK triển khai chúng **thông qua CloudFormation**. Các construct mức cao đã có sẵn giá trị mặc định hợp lý, nên vài dòng mã có thể mô tả nhiều tài nguyên. Vòng lặp, điều kiện và unit test cũng dùng được cho hạ tầng.

Vì kết quả là một stack CloudFormation, bạn vẫn có change set, rollback và drift detection.

## Chọn đúng công cụ

| Nhu cầu | Chọn |
| --- | --- |
| Khám phá một lần, kiểm tra trực quan | Management Console |
| Môi trường lặp lại được từ template JSON hoặc YAML | CloudFormation |
| Định nghĩa cùng hạ tầng bằng TypeScript, Python, Java, .NET hoặc Go | AWS CDK |
| Cùng một stack ở nhiều Region hoặc tài khoản | CloudFormation StackSets |
| Danh mục template đã duyệt để người khác tự khởi chạy, có quản trị | AWS Service Catalog (chủ đề giá và thanh toán) |
| Tải mã ứng dụng lên và để AWS chạy | AWS Elastic Beanstalk (các bài sau) |

Hãy nhớ phân vai. CloudFormation và CDK **cấp phát** hạ tầng. Chúng không giám sát (đó là CloudWatch), không ghi lại lệnh gọi API (CloudTrail) và không vá hệ điều hành guest (Systems Manager). Khi đề nói lập trình viên muốn triển khai ứng dụng **mà không tự cấp phát hạ tầng**, đáp án là Beanstalk, không phải template.

## Bẫy thường gặp

- "Template", "stack", "lặp lại được", "nhiều Region" chỉ tới **CloudFormation**.
- Câu hỏi nêu tên ngôn ngữ lập trình để định nghĩa hạ tầng chỉ tới **CDK**, không phải AWS CLI hay SDK.
- Rollback khi tạo stack lỗi là hành vi **mặc định**; nó không để lại môi trường dựng dở được đánh dấu hoàn tất.
- Quản trị và chia sẻ các template đã duyệt là **Service Catalog**, không chỉ riêng CloudFormation.

## Ý chính

- Template mô tả tài nguyên; stack là đơn vị được triển khai, được tạo, cập nhật và xóa cùng nhau.
- Change set xem trước cập nhật, rollback dọn dẹp lần tạo lỗi, drift detection phát hiện thay đổi thủ công.
- StackSets triển khai một template tới nhiều tài khoản và Region.
- CDK biến mã trong các ngôn ngữ được hỗ trợ thành CloudFormation; bản thân CloudFormation không tính phí thêm cho tài nguyên AWS.

## Nguồn

- [How CloudFormation works](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-overview.html)
- [Detect unmanaged configuration changes with drift detection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html)
- [What is the AWS CDK?](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
