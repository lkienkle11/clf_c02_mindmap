---
id: support-ai-other-iot-core-and-ground-station
title: "AWS IoT Core, AWS Ground Station và Amazon Pinpoint: thiết bị, vệ tinh và nhắn tin cho khách hàng"
required: false
---
## Tùy chọn: các dịch vụ chuyên biệt

Bài này không bắt buộc. Mỗi dịch vụ ở đây đều dễ nhận ra chỉ từ một gợi ý. Hướng dẫn kỳ thi CLF-C02 liệt kê AWS IoT Core là trong phạm vi, nhưng danh sách ngoài phạm vi có AWS Ground Station, Amazon Personalize, AWS Device Farm, AWS IQ và AWS Managed Services. Hãy ưu tiên các dịch vụ trong phạm vi, và vẫn nên biết rằng câu hỏi kiểu thi có thể nhắc đến một số dịch vụ còn lại.

## AWS IoT Core: kết nối thiết bị

**AWS IoT Core** kết nối **thiết bị IoT** như cảm biến trong nhà máy với các dịch vụ AWS và với nhau. Thiết bị trao đổi với một **message broker** được quản lý qua các giao thức như **MQTT**, MQTT qua WebSockets và HTTPS, còn AWS IoT Core for **LoRaWAN** hỗ trợ thiết bị mạng diện rộng công suất thấp. Các rule có thể chuyển tin nhắn của thiết bị tới dịch vụ AWS khác để xử lý, còn chứng chỉ và chính sách quy định thiết bị nào được làm gì. Gợi ý: "hàng nghìn cảm biến cần kết nối an toàn và gửi số đo để các dịch vụ AWS khác xử lý".

## AWS Ground Station: dữ liệu vệ tinh

**AWS Ground Station** là dịch vụ được quản lý hoàn toàn để điều khiển liên lạc vệ tinh, **nhận dữ liệu vệ tinh (downlink)** và xử lý nó. Bạn không phải tự xây hay bảo trì ăng-ten, và trả tiền theo phút sử dụng. Gợi ý: "liên lạc với vệ tinh" hoặc "nhận dữ liệu quan sát Trái Đất".

## Amazon Pinpoint: tương tác với khách hàng (đã hết hỗ trợ)

**Amazon Pinpoint** từng là dịch vụ tương tác với khách hàng, gồm phân khúc, chiến dịch và journey trên nhiều kênh. AWS ngừng nhận khách hàng mới từ **ngày 20 tháng 5 năm 2025**, và **các tính năng engagement đã kết thúc vào ngày 30 tháng 10 năm 2026**: console cùng endpoint, segment, campaign, journey và analytics không còn. Push notification, mật khẩu một lần và xác thực số điện thoại vẫn tiếp tục. Các kênh nhắn tin được đổi tên thành **AWS End User Messaging** cho SMS và thoại, còn **Amazon SES** lo email. AWS khuyên dùng chiến dịch outbound và Customer Profiles của **Amazon Connect Customer** cho việc tương tác. Hãy coi Pinpoint là đã ngừng khi gặp nó trong tình huống hiện tại.

## Các dịch vụ chuyên biệt khác

| Gợi ý | Dịch vụ |
| --- | --- |
| Cảm biến, MQTT, tin nhắn thiết bị | AWS IoT Core |
| Liên lạc vệ tinh, dữ liệu downlink | AWS Ground Station |
| Email tiếp thị hoặc email giao dịch | Amazon SES |
| Trung tâm liên lạc đám mây có chiến dịch outbound | Amazon Connect (Connect Customer) |
| Tin nhắn tới nhiều người đăng ký | Amazon SNS |

## Ý chính

- IoT Core kết nối thiết bị với AWS qua message broker được quản lý.
- Ground Station điều khiển liên lạc vệ tinh và nhận dữ liệu, tính tiền theo phút.
- Tính năng engagement của Pinpoint đã kết thúc ngày 30 tháng 10 năm 2026; dùng SES, End User Messaging hoặc Connect Customer.

## Nguồn

- [What is AWS IoT?](https://docs.aws.amazon.com/iot/latest/developerguide/what-is-aws-iot.html)
- [What is AWS Ground Station?](https://docs.aws.amazon.com/ground-station/latest/ug/what-is-aws-ground-station.html)
- [Amazon Pinpoint end of support](https://docs.aws.amazon.com/pinpoint/latest/userguide/migrate.html)
