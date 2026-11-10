---
id: shared-responsibility-controls
title: "Kiểm soát kế thừa, kiểm soát chia sẻ và kiểm soát riêng của khách hàng"
required: true
---
## Vì sao kiểm soát quan trọng

Kiểm toán viên kiểm tra các **kiểm soát (control)**: những biện pháp bảo vệ hệ thống và dữ liệu. Khi một công ty chạy trên AWS, có kiểm soát đến hoàn toàn từ AWS, có kiểm soát được chia sẻ giữa hai bên, và có kiểm soát chỉ thuộc về công ty. Mô hình trách nhiệm chia sẻ gọi tên ba loại.

## Kiểm soát kế thừa (inherited controls)

**Kiểm soát kế thừa** là những kiểm soát khách hàng **kế thừa hoàn toàn từ AWS**. Khách hàng không phải làm gì để thực hiện chúng và có thể đưa cho kiểm toán viên bằng chứng của AWS (xem bài về tuân thủ).

- Ví dụ: **kiểm soát vật lý và môi trường** của trung tâm dữ liệu, như kiểm soát ra vào tòa nhà, điện và phòng cháy.

## Kiểm soát chia sẻ (shared controls)

**Kiểm soát chia sẻ** áp dụng cho cả lớp hạ tầng lẫn các lớp của khách hàng, nhưng **mỗi bên thực hiện phần của mình trong bối cảnh của mình**. AWS đưa ra yêu cầu cho hạ tầng; khách hàng tự thực hiện phần kiểm soát cho cách họ dùng dịch vụ. Mô hình đưa ra ba ví dụ:

| Kiểm soát chia sẻ | Phần của AWS | Phần của khách hàng |
| --- | --- | --- |
| Quản lý bản vá (patch management) | Vá và sửa lỗi trong hạ tầng | Vá guest OS và ứng dụng của mình |
| Quản lý cấu hình (configuration management) | Duy trì cấu hình các thiết bị hạ tầng của AWS | Cấu hình guest OS, cơ sở dữ liệu và ứng dụng của mình |
| Nhận thức và đào tạo (awareness and training) | Đào tạo nhân viên AWS | Đào tạo nhân viên của mình |

"Chia sẻ" **không** có nghĩa là AWS làm một nửa việc vá cho bạn. Nó có nghĩa là cùng một loại kiểm soát tồn tại ở cả hai bên ranh giới, và mỗi bên lo lớp của mình.

## Kiểm soát riêng của khách hàng (customer-specific controls)

**Kiểm soát riêng của khách hàng** là **trách nhiệm duy nhất của khách hàng**, dựa trên ứng dụng họ triển khai trên AWS.

- Ví dụ trong mô hình: **bảo vệ dịch vụ và truyền thông hoặc bảo mật theo vùng (Service and Communications Protection or Zone Security)**, như định tuyến hoặc phân vùng dữ liệu bên trong những môi trường bảo mật cụ thể.

## Bẫy thường gặp

- "Đâu là kiểm soát **chia sẻ**?" Hãy tìm **quản lý bản vá**, **quản lý cấu hình** hoặc **nhận thức và đào tạo**.
- "Khách hàng **kế thừa** kiểm soát nào?" Hãy tìm kiểm soát **vật lý và môi trường**.
- Đào tạo nhân viên của bạn không bao giờ là việc của AWS; AWS chỉ đào tạo nhân viên AWS.
- Kiểm soát vật lý không bao giờ là kiểm soát chia sẻ: chỉ những người mà AWS đã phê duyệt mới vào được trung tâm dữ liệu của AWS (nhân viên được phê duyệt; bên thứ ba chỉ khi có nhân viên AWS đã được phê duyệt yêu cầu, và khách ghé thăm được xác minh danh tính và có người đi kèm).

## Ý chính

- Kế thừa: AWS cung cấp hoàn toàn (vật lý và môi trường).
- Chia sẻ: cùng một kiểm soát ở cả hai bên, mỗi bên lo lớp của mình (vá, cấu hình, đào tạo).
- Riêng của khách hàng: chỉ khách hàng (zone security và các kiểm soát khác ở cấp ứng dụng).
- Kiểm toán viên có thể dựa vào bằng chứng của AWS cho kiểm soát kế thừa; với phần còn lại, khách hàng phải tự chứng minh phần của mình.

## Nguồn

- [Shared responsibility model](https://aws.amazon.com/compliance/shared-responsibility-model/)
- [Data center controls](https://aws.amazon.com/compliance/data-center/controls/)
