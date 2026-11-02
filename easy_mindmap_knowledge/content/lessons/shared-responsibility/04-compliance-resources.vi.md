---
id: shared-responsibility-compliance
title: "Tuân thủ trên AWS: AWS Artifact, các chương trình tuân thủ và lưu trú dữ liệu"
required: true
---
## Tuân thủ cũng là trách nhiệm chia sẻ

AWS cho kiểm toán hạ tầng của mình theo nhiều tiêu chuẩn. Điều đó giúp ích, nhưng **không** tự động làm cho workload của bạn tuân thủ. AWS nêu rõ rằng **khách hàng vẫn chịu trách nhiệm tuân thủ các luật và quy định áp dụng cho họ**. AWS chứng minh bảo mật **của** đám mây; bạn phải chứng minh cách bạn bảo vệ những gì bạn chạy **trong** đó.

## Các chương trình tuân thủ của AWS

AWS chia các chương trình thành ba loại:

| Loại | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| Chứng nhận và chứng thực (certifications and attestations) | Kiểm toán viên bên thứ ba độc lập đánh giá AWS | SOC 1, SOC 2, SOC 3, ISO 27001, PCI DSS, FedRAMP |
| Luật, quy định và quyền riêng tư | AWS hỗ trợ khách hàng phải đáp ứng các quy định này | HIPAA, GDPR |
| Sự phù hợp và khung chuẩn (alignments and frameworks) | Yêu cầu được công bố cho một ngành hoặc một chức năng | Các khung chuẩn NIST |

Không phải dịch vụ nào cũng nằm trong phạm vi của mọi chương trình. Trang **AWS Services in Scope by Compliance Program** liệt kê các dịch vụ được bao phủ, nên hãy kiểm tra trang này trước khi chọn dịch vụ cho một workload có yêu cầu pháp lý.

## AWS Artifact

**AWS Artifact** là nơi trong AWS Management Console để lấy thông tin tuân thủ **theo yêu cầu và miễn phí**:

- **Báo cáo (reports)**: tải các tài liệu bảo mật và tuân thủ của AWS, như **báo cáo SOC**, chứng thực **PCI** và chứng nhận **ISO**. Bạn có thể đưa chúng cho kiểm toán viên hoặc cơ quan quản lý làm bằng chứng, hoặc dùng để đánh giá các kiểm soát của chính mình.
- **Thỏa thuận (agreements)**: xem, chấp nhận và theo dõi các thỏa thuận với AWS cho một tài khoản hoặc cả một tổ chức. Ví dụ: một công ty chịu sự điều chỉnh của **HIPAA** chấp nhận **Business Associate Addendum (BAA)** trước khi xử lý thông tin sức khỏe được bảo vệ.

## Lưu trú dữ liệu và chủ quyền dữ liệu

Một số luật yêu cầu dữ liệu phải ở lại trong một quốc gia hoặc khu vực nhất định. Trên AWS:

- **Bạn chọn AWS Region** nơi lưu nội dung của mình.
- AWS cam kết **không di chuyển hay sao chép nội dung của bạn ra ngoài các Region bạn chọn** nếu không có sự đồng ý của bạn, trừ khi cần để cung cấp dịch vụ mà bạn đã khởi chạy hoặc để tuân thủ pháp luật.
- **Bạn sở hữu nội dung của mình** và kiểm soát ai được truy cập nó.

Vì vậy "dữ liệu phải ở lại nước Đức" chỉ tới việc chọn một Region tại quốc gia đó.

## Bẫy thường gặp

- "Tải báo cáo SOC 2" hoặc "tìm chứng thực PCI của AWS" là **AWS Artifact**.
- "Chấp nhận BAA cho HIPAA" cũng là **AWS Artifact** (phần thỏa thuận).
- "AWS tuân thủ PCI DSS, nên ứng dụng của chúng tôi tự động tuân thủ" là **sai**.
- Yêu cầu lưu trú dữ liệu được đáp ứng bằng cách **chọn Region**; AWS không chuyển nội dung ra khỏi đó nếu không có sự đồng ý của bạn.

## Ý chính

- Tuân thủ của AWS bao phủ hạ tầng; khách hàng vẫn chịu trách nhiệm về sự tuân thủ của chính mình.
- Artifact = truy cập tự phục vụ, miễn phí tới các báo cáo tuân thủ và thỏa thuận của AWS.
- Kiểm tra dịch vụ nào nằm trong phạm vi một chương trình trước khi dùng chúng cho dữ liệu có yêu cầu pháp lý.
- Khách hàng chọn Region, sở hữu nội dung và kiểm soát quyền truy cập.

## Nguồn

- [What is AWS Artifact?](https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html)
- [AWS compliance programs](https://aws.amazon.com/compliance/programs/)
- [Data privacy FAQ](https://aws.amazon.com/compliance/data-privacy-faq/)
