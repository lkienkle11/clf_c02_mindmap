---
id: global-infrastructure-global-accelerator-transfer-acceleration
title: AWS Global Accelerator và Amazon S3 Transfer Acceleration
required: true
videoQuery: AWS Global Accelerator vs CloudFront vs S3 Transfer Acceleration
---
## Hai dịch vụ, một ý tưởng

Lưu lượng internet đi qua nhiều mạng, và mỗi chặng thêm độ trễ và rủi ro. Cả hai dịch vụ trong bài này rút ngắn hành trình đó bằng cách cho người dùng vào **mạng toàn cầu của AWS** tại một edge location gần họ, rồi đi trên mạng đó phần đường còn lại. Chúng giải quyết các vấn đề khác nhau, và đó chính là điều đề thi kiểm tra.

## AWS Global Accelerator

**AWS Global Accelerator** cải thiện tính sẵn sàng và hiệu năng của ứng dụng internet có người dùng toàn cầu. Bạn tạo một **accelerator**, và AWS cấp cho nó **hai địa chỉ IPv4 tĩnh** (bốn địa chỉ với dual-stack: hai IPv4 và hai IPv6). Các địa chỉ này là địa chỉ **anycast** được quảng bá từ mạng edge của AWS, nên người dùng được dẫn tới edge location gần mình, rồi đi trên mạng AWS tới ứng dụng của bạn. Bản thân Global Accelerator là dịch vụ global.

Cần nhớ:

- **Endpoint**: Network Load Balancer, Application Load Balancer, instance EC2 hoặc Elastic IP, ở một hay nhiều Region.
- **Kiểm tra sức khỏe và chuyển đổi dự phòng**: nó theo dõi endpoint và chỉ gửi lưu lượng tới endpoint khỏe, chuyển khỏi endpoint lỗi trong chưa đầy một phút theo AWS. Vì dùng IP cố định, máy khách không phụ thuộc vào bộ nhớ đệm DNS để biết thay đổi.
- **Giao thức**: hỗ trợ TCP và UDP, nên hợp với game, VoIP và lưu lượng không phải HTTP, cũng như ứng dụng HTTP cần IP tĩnh.
- **Custom routing accelerator** là biến thể ánh xạ từng người dùng tới một đích cụ thể, ví dụ một phiên game nhất định.
- **Giá**: trả theo mức dùng, không cam kết dài hạn.

IP tĩnh hữu ích khi khách hàng phải thêm địa chỉ của bạn vào danh sách cho phép của tường lửa, hoặc khi bạn muốn đổi phần back end giữa các Region mà không đổi địa chỉ.

## Amazon S3 Transfer Acceleration

**Amazon S3 Transfer Acceleration** là tính năng của bucket Amazon S3, giúp tăng tốc việc truyền tệp đường dài giữa máy khách và bucket. Khi bật, dữ liệu đi tới **edge location** gần nhất (dùng mạng edge của CloudFront) rồi được gửi vào S3 qua một đường mạng được tối ưu.

Các điểm chính:

- Đây là **thiết lập ở mức bucket**; chủ sở hữu bucket bật nó.
- Sau đó bạn dùng endpoint đặc biệt dạng `bucket-name.s3-accelerate.amazonaws.com`. Tên bucket phải tuân thủ DNS và không chứa dấu chấm.
- Nó hữu ích nhất khi người dùng ở xa tải lên một bucket trung tâm, khi bạn chuyển hàng GB đến TB giữa các châu lục, hoặc khi không tận dụng hết băng thông internet. Khoảng cách và kích thước đối tượng ảnh hưởng, và có công cụ so sánh tốc độ để bạn kiểm tra trước.
- Có thể phát sinh phí truyền dữ liệu thêm. Với mỗi lần truyền, S3 kiểm tra xem tăng tốc có khả năng nhanh hơn không, và AWS cho biết không tính phí tăng tốc cho lần truyền mà nó không nhanh hơn.

Nó không phải dịch vụ lưu đệm và không đổi nơi lưu dữ liệu: dữ liệu vẫn nằm trong Region của bucket.

## Dịch vụ nào cho câu hỏi nào?

| Nhu cầu | Chọn |
| --- | --- |
| Lưu đệm nội dung web (hình, video, trang) gần người dùng | **Amazon CloudFront** |
| IP tĩnh và chuyển đổi dự phòng nhanh cho ứng dụng TCP hoặc UDP | **AWS Global Accelerator** |
| Điều hướng người dùng theo tên DNS, sức khỏe hoặc độ trễ | **Amazon Route 53** |
| Tải lên S3 nhanh hơn từ người dùng ở xa | **Amazon S3 Transfer Acceleration** |
| Chuyển vật lý bộ dữ liệu rất lớn | AWS Snow Family (xem các bài về lưu trữ và di chuyển) |

## Những cái bẫy thường gặp

- "Lưu đệm (caching)" nội dung web chỉ tới CloudFront; Global Accelerator không lưu đệm nội dung, nó cải thiện đường mạng tới ứng dụng của bạn.
- Route 53 trả lời câu hỏi DNS bằng một địa chỉ; Global Accelerator cho bạn các địa chỉ không đổi rồi chở lưu lượng trên mạng AWS.
- Transfer Acceleration dành cho tải lên và tải xuống S3. Nó không tăng tốc lưu lượng EC2 hay cơ sở dữ liệu.
- Không dịch vụ nào thay thế việc chọn một Region phù hợp.

## Ý chính

- Global Accelerator: IP anycast tĩnh, mạng toàn cầu AWS, định tuyến theo sức khỏe, TCP/UDP, dịch vụ global.
- CloudFront lưu đệm; Global Accelerator tăng tốc đường mạng; Route 53 là DNS.
- S3 Transfer Acceleration tăng tốc truyền đường dài tới và từ bucket S3 qua edge location, dùng endpoint đặc biệt.
- Cả hai dùng edge location và đường trục của AWS.

## Nguồn

- [What is AWS Global Accelerator?](https://docs.aws.amazon.com/global-accelerator/latest/dg/what-is-global-accelerator.html)
- [AWS Global Accelerator FAQs](https://aws.amazon.com/global-accelerator/faqs/)
- [Amazon S3 Transfer Acceleration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/transfer-acceleration.html)
