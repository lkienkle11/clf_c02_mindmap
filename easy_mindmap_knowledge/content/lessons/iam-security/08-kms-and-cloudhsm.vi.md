---
id: iam-security-kms-and-cloudhsm
title: "Khóa mã hóa: các loại khóa của AWS KMS và AWS CloudHSM"
required: true
---
## Vì sao khóa quan trọng

**Mã hóa khi lưu trữ (encryption at rest)** bảo vệ dữ liệu trong kho lưu trữ, còn **mã hóa khi truyền (encryption in transit)** bảo vệ dữ liệu trên đường truyền mạng. Cả hai chỉ mạnh bằng mức bảo vệ dành cho **khóa** của chúng. Quyết định mã hóa gì và ai được dùng khóa là việc của khách hàng; AWS cung cấp các dịch vụ giữ khóa an toàn.

## AWS Key Management Service (AWS KMS)

**AWS KMS** là dịch vụ được quản lý để tạo và kiểm soát các khóa dùng mã hóa và ký dữ liệu của bạn.

- KMS key được bảo vệ bằng các module bảo mật phần cứng (HSM) được xác nhận ở **FIPS 140-3 Security Level 3**, và chúng không bao giờ rời KMS ở dạng chưa mã hóa.
- Nhiều dịch vụ dùng KMS để mã hóa dữ liệu khi lưu trữ, gồm **Amazon S3, Amazon EBS và Amazon RDS**. "Dịch vụ nào tích hợp với các dịch vụ khác để mã hóa dữ liệu khi lưu trữ" hoặc "mã hóa cho một EBS volume" là KMS.
- Quyền truy cập được kiểm soát bằng **key policy**, cùng với IAM policy và grant. Policy của customer managed key chỉ do bạn kiểm soát.
- Mỗi lần dùng khóa đều có thể được ghi vào **AWS CloudTrail**, nên bạn kiểm toán được ai đã dùng nó.

## Các loại khóa

| | Customer managed key | AWS managed key | AWS owned key |
| --- | --- | --- | --- |
| Ai tạo | Bạn | Một dịch vụ AWS, trong tài khoản của bạn (alias `aws/service`) | Một dịch vụ AWS, trong tài khoản của chính dịch vụ |
| Bạn xem được | Có | Có | Không |
| Bạn quản lý được (policy, tắt, xóa) | Có | Không | Không |
| Xoay vòng | Tự động xoay vòng tùy chọn | Tự động, mỗi năm | Do dịch vụ xử lý |
| Chi phí | Phí hằng tháng cộng phí sử dụng | Không có phí hằng tháng; việc sử dụng có thể bị tính phí | Không |

Chọn **customer managed key** khi cần kiểm soát: key policy riêng, xoay vòng riêng, tắt hoặc xóa khóa. Chỉ customer managed key mới có thể **lên lịch xóa (schedule deletion)**. Dùng **AWS managed key** khi bạn muốn dịch vụ mã hóa hộ mà không phải quản lý khóa, và **AWS owned key** cho mã hóa mặc định mà bạn không cần nhìn thấy.

Những phát biểu kiểu đề thi là đúng: customer managed key cho phép bạn tự định nghĩa key policy; AWS managed key xoay vòng mỗi năm; customer managed key có phí hằng tháng; bạn không thấy AWS owned key trong tài khoản của mình.

## AWS CloudHSM

**Module bảo mật phần cứng (HSM)** là thiết bị thực hiện các phép toán mật mã và lưu khóa an toàn. **AWS CloudHSM** cung cấp cho bạn các **HSM chuyên dụng, một người thuê (single-tenant)** trên AWS Cloud.

- AWS cấp phát phần cứng và lo việc sao lưu, cấu hình và bảo trì.
- **Bạn** tạo người dùng và quản lý khóa; dữ liệu và khóa của bạn được mã hóa đầu cuối và AWS không nhìn thấy. Việc quản lý người dùng tách biệt khỏi IAM role.
- Các cluster ở chế độ FIPS dùng HSM được xác nhận ở **FIPS 140-2 hoặc FIPS 140-3 Level 3**; cũng có chế độ không FIPS.
- Bạn chịu nhiều trách nhiệm hơn so với dịch vụ được quản lý hoàn toàn. Ứng dụng kết nối qua các giao diện chuẩn như PKCS#11, Java Cryptographic Extension (JCE) và Microsoft CNG, giúp việc di chuyển một workload mật mã hiện có dễ hơn.

## KMS hay CloudHSM?

| Câu hỏi | AWS KMS | AWS CloudHSM |
| --- | --- | --- |
| Là gì? | Dịch vụ khóa được quản lý | HSM chuyên dụng do bạn vận hành |
| Ai quản lý khóa và người dùng? | Bạn đặt policy trong KMS và IAM; AWS vận hành dịch vụ | Bạn, bên trong HSM của riêng bạn |
| Ứng dụng dùng nó thế nào? | Tích hợp sẵn trong nhiều dịch vụ AWS, như S3, EBS và RDS | Ứng dụng của bạn kết nối qua PKCS#11, JCE hoặc CNG |
| Chọn khi | Bạn muốn quản lý khóa đơn giản, tích hợp sẵn | Một quy định hoặc ứng dụng đòi hỏi HSM chỉ bạn kiểm soát, hoặc thuật toán và chuẩn cụ thể |

Chính AWS khuyên dùng KMS nếu bạn muốn khóa được quản lý mà không cần tự vận hành HSM.

Hai lưu ý khi thi. Thứ nhất, khi câu hỏi hỏi dịch vụ nào có thể "quản lý khóa mã hóa trên đám mây" và có CloudHSM nhưng không có KMS, thì CloudHSM là đáp án quản lý khóa. Thứ hai, khi có cả hai, "HSM chuyên dụng, một người thuê, do khách hàng kiểm soát" là CloudHSM còn "tạo và kiểm soát các khóa mà dịch vụ AWS dùng" là KMS.

## Các dịch vụ liên quan

Hướng dẫn của chính AWS đưa mật khẩu và API key về **AWS Secrets Manager**, chứng chỉ TLS về **AWS Certificate Manager** (bài sau), và khóa mã hóa về KMS.

## Ý chính

- KMS tạo và kiểm soát khóa; tích hợp với S3, EBS và RDS; việc dùng khóa được ghi trong CloudTrail.
- Customer managed key: bạn kiểm soát policy, xoay vòng, xóa, có phí hằng tháng. AWS managed key: không phí hằng tháng, xoay vòng mỗi năm. AWS owned key: vô hình, miễn phí.
- CloudHSM: HSM chuyên dụng một người thuê, nơi chỉ mình bạn quản lý khóa.

## Nguồn

- [AWS KMS keys](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html)
- [What is AWS Key Management Service?](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [What is AWS CloudHSM?](https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html)
