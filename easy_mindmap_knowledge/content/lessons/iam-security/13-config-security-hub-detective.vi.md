---
id: iam-security-config-security-hub-detective
title: "Nhìn toàn cảnh: AWS Config, AWS Security Hub, Amazon Detective và AWS Artifact"
required: true
---
## Từ từng phát hiện riêng lẻ đến bức tranh bảo mật

GuardDuty, Inspector và Macie mỗi dịch vụ báo cáo một loại phát hiện (finding). Các dịch vụ trong bài này thu thập, điều tra hoặc ghi lại xung quanh chúng.

## AWS Config

**AWS Config** ghi lại cấu hình tài nguyên của bạn và cách nó thay đổi theo thời gian, rồi đánh giá bằng các **Config rule** để đánh dấu tài nguyên là tuân thủ hoặc không tuân thủ. Chủ đề triển khai và vận hành đã trình bày kỹ về nó. Về bảo mật, nó quan trọng ở ba điểm:

- Nó trả lời "security group hay IAM policy này tháng trước trông thế nào?" và "mọi volume đã được mã hóa chưa?".
- Security Hub CSPM cần AWS Config được bật để tạo ra phần lớn các phát hiện kiểm soát (control finding), và Firewall Manager cũng cần.
- Nó không cho biết **ai** đã thực hiện thay đổi; đó là việc của AWS CloudTrail.

## AWS Security Hub

**AWS Security Hub** là giải pháp bảo mật đám mây hợp nhất, ưu tiên hóa những vấn đề bảo mật quan trọng nhất của bạn. Nó đối chiếu và làm giàu tín hiệu từ quản lý tư thế bảo mật (posture), quản lý lỗ hổng (**Amazon Inspector**), dữ liệu nhạy cảm (**Amazon Macie**) và phát hiện mối đe dọa (**Amazon GuardDuty**), đồng thời nhận phát hiện từ **IAM Access Analyzer**. Các exposure finding và đồ thị đường tấn công (attack path) cho thấy các vấn đề kết hợp thành rủi ro ra sao, kèm quy trình phản ứng tự động và tích hợp hệ thống phiếu (ticketing).

**Security Hub CSPM** là tên của AWS Security Hub bản trước đó: một dịch vụ quản lý tư thế bảo mật đám mây (cloud security posture management). Nó:

- chạy liên tục các kiểm tra ở cấp tài khoản theo các chuẩn như AWS Foundational Security Best Practices, CIS, PCI DSS và NIST, và tính điểm bảo mật;
- hợp nhất phát hiện từ các dịch vụ AWS và sản phẩm đối tác theo một định dạng chuẩn (ASFF) trên một dashboard duy nhất;
- cho phép tự động hóa phản ứng qua automation rule và Amazon EventBridge.

Các câu hỏi cũ chỉ viết "AWS Security Hub" cho cả hai. "Tổng hợp cảnh báo và phát hiện từ nhiều dịch vụ trên một dashboard" và "dịch vụ quản lý tư thế bảo mật đám mây tổng hợp cảnh báo" đều là Security Hub. Các phát hiện về mối đe dọa, lỗ hổng và dữ liệu nhạy cảm của nó đến từ GuardDuty, Inspector và Macie, nên nó không thay thế các dịch vụ đó.

## Amazon Detective

**Amazon Detective** giúp bạn **phân tích, điều tra và xác định nguyên nhân gốc** của các phát hiện bảo mật hoặc hoạt động đáng ngờ. Nó tự động thu thập dữ liệu log từ tài nguyên AWS của bạn và dùng machine learning, phân tích thống kê và lý thuyết đồ thị để dựng các trực quan hóa. Cuộc điều tra thường bắt đầu từ một phát hiện của GuardDuty hoặc Security Hub CSPM, hay từ một thực thể như địa chỉ IP hoặc user, và đi qua các bước phân loại (triage), xác định phạm vi (cái gì bị ảnh hưởng, bắt đầu từ đâu) và phản ứng.

Detective không phát hiện mối đe dọa; nó giải thích chúng. "Dùng machine learning để phân tích dữ liệu log và tiến hành điều tra bảo mật" là Detective.

## AWS Artifact

**AWS Artifact** là nguồn tự phục vụ cho các báo cáo tuân thủ của chính AWS (SOC, PCI) và các thỏa thuận. Nó cho bạn biết về các biện pháp kiểm soát của AWS, không phải mức bảo mật của tài nguyên bạn. Xem bài về tuân thủ trong chủ đề mô hình trách nhiệm chia sẻ.

## Chọn trong cả nhóm dịch vụ

| Câu hỏi | Dịch vụ |
| --- | --- |
| Có gì độc hại đang xảy ra trong tài khoản của tôi không? | GuardDuty |
| Workload EC2, ECR hay Lambda của tôi có lỗ hổng không? | Inspector |
| Dữ liệu nhạy cảm nằm ở đâu trong S3? | Macie |
| Bức tranh tổng thể thế nào và nên sửa gì trước? | Security Hub |
| Chuyện xảy ra thế nào, và còn gì khác bị đụng tới? | Detective |
| Tài nguyên trước đây trông thế nào, và nó có tuân theo rule của tôi không? | AWS Config |
| Ai đã thực hiện lệnh gọi API này? | CloudTrail |
| Tài nguyên nào được chia sẻ ra ngoài tài khoản của tôi? | IAM Access Analyzer |
| Báo cáo SOC hay PCI của AWS ở đâu? | AWS Artifact |

## Bẫy thường gặp

- Một dashboard duy nhất cho cảnh báo từ nhiều dịch vụ là Security Hub, không phải GuardDuty, Inspector hay Macie.
- Config theo dõi cấu hình; CloudTrail theo dõi lệnh gọi API.
- Detective điều tra sau khi đã có phát hiện; GuardDuty tạo ra phát hiện.

## Ý chính

- Config: lịch sử cấu hình tài nguyên và rule tuân thủ.
- Security Hub: tổng hợp và ưu tiên hóa phát hiện; Security Hub CSPM chạy các kiểm tra theo chuẩn.
- Detective: điều tra nguyên nhân gốc bằng phân tích đồ thị trên dữ liệu log.
- Artifact: báo cáo tuân thủ của AWS; CloudTrail: ai đã làm gì.

## Nguồn

- [Introduction to AWS Security Hub](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub-v2.html)
- [Introduction to AWS Security Hub CSPM](https://docs.aws.amazon.com/securityhub/latest/userguide/what-is-securityhub.html)
- [How Detective is used for investigation](https://docs.aws.amazon.com/detective/latest/userguide/detective-investigation-about.html)
