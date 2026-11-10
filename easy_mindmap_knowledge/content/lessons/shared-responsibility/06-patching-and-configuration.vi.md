---
id: shared-responsibility-patching-and-configuration
title: "Vá lỗi, cấu hình và đào tạo: áp dụng các kiểm soát chia sẻ"
required: true
---
## Từ định nghĩa đến công việc hằng ngày

Bài trước đã định nghĩa ba loại kiểm soát. Bài này áp dụng chúng vào các công việc thực tế. AWS mô tả ba loại như sau:

- **Inherited controls (kiểm soát kế thừa)**: kiểm soát mà khách hàng hoàn toàn thừa hưởng từ AWS. Ví dụ: kiểm soát **vật lý và môi trường**.
- **Shared controls (kiểm soát chia sẻ)**: AWS cung cấp các yêu cầu cho hạ tầng, còn khách hàng triển khai kiểm soát của riêng mình trong phạm vi sử dụng dịch vụ AWS. Ví dụ: **quản lý bản vá**, **quản lý cấu hình**, **nâng cao nhận thức và đào tạo**.
- **Customer-specific controls (kiểm soát riêng của khách hàng)**: hoàn toàn thuộc trách nhiệm khách hàng, tùy theo ứng dụng triển khai. Ví dụ: **bảo vệ dịch vụ và truyền thông hoặc bảo mật theo vùng (zone security)**.

Từ "shared" là mấu chốt khi thi: cùng một kiểm soát tồn tại ở cả hai phía, áp dụng cho các lớp khác nhau.

## Quản lý bản vá trong thực tế

| Lớp | Ai vá |
| --- | --- |
| Hạ tầng AWS: host, hypervisor, thiết bị mạng | AWS vá và sửa lỗi |
| Guest OS của instance EC2 | Khách hàng |
| Ứng dụng và thư viện bạn cài | Khách hàng |
| OS và engine của cơ sở dữ liệu RDS | AWS, trong maintenance window do bạn chọn (bản cập nhật bắt buộc vẫn có thể được áp dụng sau ngày áp dụng của nó) |
| Runtime của hàm Lambda dùng managed runtime | AWS phát hành các bản vá và tự động áp dụng chúng ở chế độ Auto mặc định; chế độ Function update và Manual cần khách hàng tự thực hiện |
| Code hàm và thư viện đóng gói kèm | Khách hàng |

Vậy "quản lý bản vá" là kiểm soát chia sẻ, nhưng không có bản vá cụ thể nào là chia sẻ. Với mỗi bản vá, hãy hỏi nó thuộc lớp nào. Khách hàng có thể tự động hóa phần của mình, ví dụ bằng AWS Systems Manager Patch Manager, nhưng tự động hóa không chuyển quyền sở hữu.

## Quản lý cấu hình trong thực tế

- **AWS** duy trì cấu hình của các thiết bị hạ tầng của mình.
- **Khách hàng** cấu hình hệ điều hành guest, cơ sở dữ liệu và ứng dụng của mình: hardening OS, đặt tham số cơ sở dữ liệu, chọn cài đặt ứng dụng, thiết lập quy tắc security group.

Hãy nhớ bẫy trong cách ra đề: "Duy trì cấu hình của thiết bị hạ tầng" là việc của AWS, còn "duy trì cấu hình của hệ điều hành guest và ứng dụng" là việc của khách hàng. Cùng tên kiểm soát nhưng khác lớp.

## Nâng cao nhận thức và đào tạo

AWS đào tạo nhân viên AWS. Khách hàng đào tạo nhân viên của mình, ví dụ về lừa đảo phishing, xử lý dữ liệu và dùng công cụ đúng cách. Một tài khoản cấu hình hoàn hảo vẫn có thể bị phá bởi một quản trị viên bất cẩn, và không dịch vụ AWS nào thay thế được việc đào tạo con người của bạn.

## Bảo mật tài khoản luôn thuộc về bạn

Một số việc thuộc khách hàng bất kể loại kiểm soát:

- Bảo vệ **root user** bằng mật khẩu mạnh và **MFA**, và tránh dùng hằng ngày.
- Cấp cho mọi người **IAM user hoặc role** với quyền tối thiểu thay vì dùng chung thông tin đăng nhập.
- Bảo vệ và xoay vòng **access key**.
- Phân loại dữ liệu và quyết định ai được truy cập.
- Chọn tùy chọn mã hóa cho dữ liệu của bạn.

AWS cung cấp công cụ; dùng chúng là việc của khách hàng. Chủ đề IAM và bảo mật sẽ nói kỹ hơn.

## Kiểm soát riêng của khách hàng

Chúng phụ thuộc vào ứng dụng của bạn nên AWS không thể cung cấp. Zone security là ví dụ của AWS: bạn quyết định dữ liệu được định tuyến hay phân chia giữa các môi trường bảo mật ra sao. Ví dụ, bạn có thể đặt cơ sở dữ liệu trong private subnet và máy chủ web trong public subnet; đây chỉ là minh họa cho một kiểm soát riêng của khách hàng, không phải thứ AWS cung cấp.

## Bằng chứng và tuân thủ

Kiểm toán viên cần bằng chứng cho cả ba loại kiểm soát. Với kiểm soát kế thừa và phần của AWS trong kiểm soát chia sẻ, bạn có thể dùng báo cáo và thỏa thuận trong **AWS Artifact**. Với phần của mình, bạn phải tự đưa ra bằng chứng. Bài về tuân thủ giải thích Artifact và các chương trình tuân thủ.

## Ý chính

- Kiểm soát chia sẻ: quản lý bản vá, quản lý cấu hình, nâng cao nhận thức và đào tạo.
- AWS lo lớp hạ tầng; khách hàng lo guest OS, cơ sở dữ liệu, ứng dụng và nhân viên của mình.
- Kiểm soát vật lý và môi trường là kế thừa; zone security là riêng của khách hàng.
- Bảo vệ root user, MFA, quyền IAM và access key luôn là việc của khách hàng.
- Dùng AWS Artifact cho bằng chứng phía AWS; tự cung cấp bằng chứng cho phần còn lại.

## Nguồn

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [What is AWS Artifact?](https://docs.aws.amazon.com/artifact/latest/ug/what-is-aws-artifact.html)
