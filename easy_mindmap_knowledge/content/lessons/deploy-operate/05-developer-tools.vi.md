---
id: deploy-operate-developer-tools
title: "Bộ công cụ lập trình viên của AWS: CodeBuild, CodeDeploy, CodePipeline, CodeArtifact, CodeCommit, CodeStar, Cloud9 và CodeGuru"
required: true
videoQuery: AWS CodePipeline CodeBuild CodeDeploy CodeArtifact CodeCommit toolchain explained for beginners
---
## Một pipeline, nhiều dịch vụ

Pipeline phát hành đưa một thay đổi mã qua nhiều giai đoạn. Mỗi công cụ lập trình viên của AWS phụ trách một giai đoạn, và **AWS CodePipeline** nối chúng lại:

```
Source  ->  Build và test  ->  Deploy
Git repo    CodeBuild           CodeDeploy, Elastic Beanstalk hoặc CloudFormation
            (gói từ CodeArtifact)
            mọi giai đoạn được CodePipeline sắp thứ tự và tự động hóa
```

Một pipeline gồm các **stage**, mỗi stage chứa các **action** thuộc loại source, build, test, deploy, approval hoặc invoke. Một commit mới có thể kích hoạt pipeline, nên việc phát hành chạy mà không cần thao tác thủ công. Một số công cụ trong bài này đã đổi trạng thái khả dụng, hãy đọc kỹ phần trạng thái.

| Dịch vụ | Mục đích một dòng | Gợi ý trong đề thi |
| --- | --- | --- |
| **AWS CodePipeline** | Mô hình hóa, trực quan hóa và tự động hóa các bước phát hành | "Điều phối các giai đoạn phát hành" |
| **AWS CodeBuild** | Dịch vụ build được quản lý hoàn toàn: biên dịch mã, chạy unit test, tạo artifact sẵn sàng triển khai | "Biên dịch và kiểm thử mà không quản lý máy chủ build" |
| **AWS CodeDeploy** | Tự động hóa triển khai tới EC2, máy chủ tại chỗ, Lambda và Amazon ECS | "Triển khai tới EC2 và máy chủ tại chỗ" |
| **AWS CodeArtifact** | Kho artifact được quản lý cho các gói phần mềm | "Lưu và chia sẻ gói npm, Maven hoặc pip" |
| **AWS CodeCommit** | Kho Git riêng tư được quản lý | "Lưu mã nguồn trên AWS" |
| **AWS CodeStar** | Giao diện hợp nhất trước đây để khởi tạo dự án cùng toolchain | "Nhanh chóng dựng dự án CI/CD" (cách diễn đạt cũ) |
| **AWS Cloud9** | IDE chạy trên trình duyệt | "Viết và gỡ lỗi mã ngay trong trình duyệt" |
| **Amazon CodeGuru** | Review mã (Reviewer) và phân tích hiệu năng lúc chạy (Profiler) | "Tìm lỗi trong mã" hoặc "tìm những dòng mã tốn kém" |

## Bộ ba cốt lõi

- **CodeBuild** không có máy chủ nào để bạn cấp phát, vá hay co giãn. Nó tự co giãn theo nhu cầu và bạn chỉ trả tiền theo **số phút build** đã dùng.
- **CodeDeploy** triển khai nội dung ứng dụng lấy từ S3 hoặc kho Git. Với EC2 và máy chủ tại chỗ, nó hỗ trợ triển khai **in-place** và **blue/green**, có agent chạy trên từng máy chủ. Với Lambda và Amazon ECS, lưu lượng được chuyển theo kiểu **canary**, **linear** hoặc **all at once**. Nó có thể dừng và rollback khi gặp lỗi.
- **CodePipeline** tự nó không biên dịch hay triển khai. Nó gọi CodeBuild, CodeDeploy, Elastic Beanstalk, CloudFormation và các nhà cung cấp khác, và có thể chèn một action phê duyệt thủ công.

## CodeArtifact

**AWS CodeArtifact** lưu các gói mà quá trình build phụ thuộc vào. Nó làm việc với các trình quản lý gói như npm, Maven, Gradle, pip và NuGet. Một repository có thể kết nối tới các registry công khai như npmjs.com hoặc Maven Central, lấy gói theo yêu cầu và giữ lại bản sao, và bạn có thể xuất bản gói riêng tư cho các nhóm khác. Xác thực dùng thông tin đăng nhập AWS của bạn, và các gói không thể được công khai.

## Trạng thái của các dịch vụ đã thay đổi

AWS đã thay đổi tình trạng khả dụng của một vài công cụ lập trình viên. Đề thi có thể vẫn coi chúng như bình thường, nên hãy biết cả mục đích lẫn trạng thái.

- **AWS CodeCommit:** AWS đã ngừng nhận khách hàng mới vào năm 2024. Ngày 24/11/2025, AWS thông báo CodeCommit trở lại trạng thái general availability, việc đăng ký của khách hàng mới được mở lại.
- **AWS CodeStar:** AWS liệt kê CodeStar trong bảng "Services in Full Shutdown" với ngày kết thúc hỗ trợ là 25/7/2024. Đây là dịch vụ tạo ra một dự án có sẵn kho mã, build và pipeline triển khai. Có thể tự dựng một chuỗi tương đương từ CodePipeline, CodeBuild và CodeDeploy. Câu hỏi về "triển khai nhanh CI/CD" vẫn có thể lấy CodeStar làm đáp án, nên hãy nhận ra cái tên này.
- **AWS Cloud9:** AWS xếp nó vào nhóm dịch vụ ở chế độ maintenance và không còn mở cho khách hàng mới; khách hàng hiện tại vẫn dùng tiếp được. Hướng dẫn di chuyển của AWS trỏ tới AWS IDE Toolkits hoặc AWS CloudShell.
- **Amazon CodeGuru Reviewer:** dịch vụ này cũng ở chế độ maintenance. Từ 7/11/2025 bạn không thể tạo thêm repository association mới, và AWS gợi ý Amazon Q Developer cùng Amazon Inspector cho việc phân tích mã tương tự. **CodeGuru Profiler** thu thập dữ liệu lúc chạy từ ứng dụng đang hoạt động và gợi ý nơi giảm mức dùng CPU và chi phí; nó không nằm trong danh sách maintenance.

CodeBuild, CodeDeploy, CodePipeline và CodeArtifact không có thông báo nào như vậy.

## Các dịch vụ dễ nhầm

- **Cloud9 hay CloudShell?** CloudShell là shell trên trình duyệt đã được **xác thực sẵn** bằng thông tin đăng nhập console của bạn và đã cài AWS CLI. Cloud9 là trình soạn mã đầy đủ kèm terminal.
- **CodeDeploy hay Elastic Beanstalk?** CodeDeploy tự động hóa việc triển khai một bản revision tới các máy chủ do bạn quản lý. Beanstalk cấp phát và vận hành cả environment.
- **CodeGuru hay CodeBuild?** CodeGuru review và phân tích mã; CodeBuild biên dịch và kiểm thử mã.
- **CodeGuru hay CDK?** Không cái nào triển khai hạ tầng: CDK định nghĩa hạ tầng bằng mã, CodeGuru phân tích mã.

## Ý chính

- CodePipeline điều phối; CodeBuild build và test; CodeDeploy triển khai; CodeArtifact lưu gói; CodeCommit lưu mã nguồn.
- CodeBuild được quản lý hoàn toàn và tính tiền theo phút build.
- CodeCommit đã mở lại cho khách hàng mới; CodeStar đã ngừng hẳn; Cloud9 và CodeGuru Reviewer ở chế độ maintenance.
- CloudShell, không phải Cloud9, là shell trên trình duyệt được xác thực sẵn.

## Nguồn

- [Services in Maintenance](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html)
- [Services in Full Shutdown](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
- [AWS CodeCommit returns to general availability](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability)
