---
id: global-infrastructure-extending-aws
title: Local Zones, Wavelength, Outposts và chủ quyền dữ liệu
required: true
---
## Mở rộng AWS ra ngoài Region

Region đáp ứng phần lớn nhu cầu, nhưng một số workload cần AWS ở **gần hơn nữa** với người dùng hoặc thiết bị, hoặc phải **ở lại trong một địa điểm cụ thể**. Có ba lựa chọn mở rộng hạ tầng AWS ra bên ngoài. Mỗi lựa chọn đều gắn với một **Region mẹ (parent Region)**, và bạn quản lý chúng bằng cùng các công cụ và API của AWS.

## AWS Local Zones

Local Zones đưa máy chủ, lưu trữ, cơ sở dữ liệu và một số dịch vụ chọn lọc khác tới **gần các trung tâm dân cư và công nghiệp lớn**. Chúng giúp những ứng dụng cần độ trễ rất thấp (chỉ vài mili giây) cho người dùng ở gần, như trò chơi thời gian thực, phát trực tiếp, AR/VR và sản xuất nội dung đa phương tiện. Chúng cũng có thể giúp đáp ứng quy định lưu trú dữ liệu tại địa phương.

## AWS Wavelength

Wavelength đặt máy chủ và lưu trữ của AWS **tại rìa mạng của các nhà cung cấp viễn thông**, bên trong trung tâm dữ liệu của các nhà mạng. Chạy ứng dụng gần mạng di động như vậy giúp người dùng di động và thiết bị kết nối có độ trễ rất thấp. Một Wavelength Zone là phần mở rộng logic của Region mẹ.

## AWS Outposts

Outposts là dịch vụ **được quản lý hoàn toàn (fully managed)**, đưa hạ tầng, dịch vụ, API và công cụ của AWS tới **trung tâm dữ liệu của chính bạn hoặc một địa điểm thuê chỗ đặt máy (colocation)**. AWS giao hàng, lắp đặt (với dạng rack), giám sát và bảo trì phần cứng; nó vận hành như một phần của một AWS Region. Lý do thường gặp: truy cập độ trễ thấp tới hệ thống tại chỗ, xử lý dữ liệu tại chỗ và lưu trú dữ liệu. Đây là ví dụ kinh điển của mô hình triển khai **hybrid**.

## So sánh nhanh

| Lựa chọn | Chạy ở đâu | Gợi ý rõ nhất trong câu hỏi |
| --- | --- | --- |
| Local Zones | Hạ tầng AWS gần các thành phố lớn | "Người dùng ở một khu đô thị cụ thể cần độ trễ vài mili giây" |
| Wavelength | Bên trong mạng của nhà cung cấp viễn thông | "Thiết bị di động hoặc 5G cần độ trễ cực thấp" |
| Outposts | Trung tâm dữ liệu của chính bạn | "Phải ở lại tại chỗ nhưng vẫn dùng cùng các API của AWS" |

## Hệ quả đối với chủ quyền dữ liệu

- **Bạn chọn Region**, và nội dung ở lại đó trừ khi bạn di chuyển hoặc nhân bản nó. Đây là công cụ chính để đáp ứng luật về lưu trú dữ liệu.
- Khi quốc gia hoặc địa điểm bắt buộc không có Region, **Local Zones** hoặc **Outposts** có thể giữ dữ liệu và việc xử lý ở tại chỗ.
- Dùng **nhiều Region** cho phép công ty giữ dữ liệu của mỗi quốc gia ở chính quốc gia đó trong khi vẫn phục vụ người dùng toàn cầu.

## Ý chính

- Local Zones: AWS ở gần các thành phố lớn, cho người dùng địa phương cần độ trễ thấp.
- Wavelength: AWS bên trong mạng viễn thông, cho các trường hợp edge của thiết bị di động và 5G.
- Outposts: phần cứng do AWS quản lý đặt tại cơ sở của bạn, cho nhu cầu hybrid, độ trễ thấp và lưu trú dữ liệu.
- Chọn Region là câu trả lời đầu tiên cho các câu hỏi về chủ quyền dữ liệu.

## Nguồn

- [What is AWS Local Zones?](https://docs.aws.amazon.com/local-zones/latest/ug/what-is-aws-local-zones.html)
- [What is AWS Wavelength?](https://docs.aws.amazon.com/wavelength/latest/developerguide/what-is-wavelength.html)
- [What is AWS Outposts?](https://docs.aws.amazon.com/outposts/latest/userguide/what-is-outposts.html)
