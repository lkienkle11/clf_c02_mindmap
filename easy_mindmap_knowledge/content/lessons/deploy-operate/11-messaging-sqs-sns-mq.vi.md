---
id: deploy-operate-messaging-sqs-sns-mq
title: "Tách rời bằng thông điệp: Amazon SQS, Amazon SNS, Amazon MQ và Amazon Kinesis"
required: false
videoQuery: Amazon SQS vs SNS vs Amazon MQ vs Kinesis difference explained decoupling fan-out
---
## Vì sao cần dịch vụ nhắn tin

Khi một phần của ứng dụng gọi trực tiếp phần khác, sự cố hoặc đợt tăng tải ở bên này sẽ làm hại bên kia. Đặt một dịch vụ nhắn tin được quản lý vào giữa giúp các phần **liên kết lỏng (loosely coupled)**: mỗi phần có thể lỗi, co giãn và được cập nhật độc lập. "Liên kết lỏng các thành phần" là một nguyên tắc thiết kế cốt lõi của AWS, và các dịch vụ trong bài này là cách áp dụng nó.

## Amazon Simple Queue Service (Amazon SQS)

**Amazon Simple Queue Service (Amazon SQS)** là **hàng đợi thông điệp** được lưu trữ sẵn, giúp tích hợp và tách rời các thành phần của hệ thống phân tán. Producer gửi thông điệp vào hàng đợi và consumer lấy ra khi sẵn sàng.

- Thông điệp được lưu trên nhiều máy chủ. Hàng đợi co giãn theo mọi mức tải mà không cần cấp phát trước.
- Trong khi một consumer đang xử lý thông điệp, nó vẫn nằm trong hàng đợi nhưng bị ẩn với các consumer khác trong khoảng **visibility timeout**. Consumer **xóa** thông điệp khi xong; nếu không, thông điệp có thể được nhận lại.
- Thời gian giữ mặc định là **4 ngày**, chỉnh được tới 14 ngày. **Dead-letter queue** gom các thông điệp cứ xử lý lỗi mãi.

| Loại hàng đợi | Chuyển giao | Thứ tự | Dùng khi |
| --- | --- | --- | --- |
| **Standard** | Ít nhất một lần, nên có thể trùng lặp | Cố gắng tối đa, không đảm bảo | Cần thông lượng cao nhất, và consumer chịu được trùng lặp |
| **FIFO** | Xử lý đúng một lần (exactly-once) | Đúng thứ tự trong cùng một message group | Thứ tự quan trọng, ví dụ xử lý lệnh theo trình tự |

## Amazon Simple Notification Service (Amazon SNS)

**Amazon Simple Notification Service (Amazon SNS)** là nhắn tin **publish/subscribe**. Publisher gửi thông điệp tới một **topic**, và SNS chuyển một bản sao tới mọi subscriber. Endpoint của subscriber gồm hàng đợi Amazon SQS, hàm Lambda, endpoint HTTP(S), email, mobile push và tin nhắn SMS. SNS hỗ trợ cả thông điệp giữa ứng dụng với ứng dụng lẫn từ ứng dụng tới người dùng.

Mẫu **fanout** kết hợp cả hai: một thông điệp phát hành lên một topic SNS được sao vào nhiều hàng đợi SQS, và mỗi hàng đợi được một consumer khác nhau xử lý song song, như xử lý đơn hàng và phân tích. Hàng đợi cũng bảo vệ khi một subscriber đang offline, vì thông điệp vẫn chờ. SNS không có chi phí trả trước; bạn trả theo số thông điệp phát hành và số thông báo được chuyển.

## SQS hay SNS?

| | SQS | SNS |
| --- | --- | --- |
| Mô hình | Hàng đợi; thường một consumer xử lý mỗi thông điệp | Topic; mọi subscriber đều nhận một bản sao |
| Chuyển giao | Consumer kéo (pull) | SNS đẩy (push) tới subscriber |
| Dùng điển hình | Đệm công việc, tách rời, làm mượt đỉnh tải | Thông báo cho nhiều bên, cảnh báo, fanout |

Cũng nhớ rằng **CloudWatch alarm** có thể thông báo qua một topic SNS, và SNS chỉ chuyển thông báo; chính alarm mới là bên theo dõi.

## Amazon MQ

**Amazon MQ** là dịch vụ **message broker** được quản lý cho **Apache ActiveMQ** và **RabbitMQ**. Nó chủ yếu phục vụ **di chuyển**: ứng dụng đã nói chuyện với broker qua các API và giao thức chuẩn như JMS, AMQP, MQTT, OpenWire hay STOMP có thể chuyển sang Amazon MQ mà không phải viết lại mã nhắn tin. AWS khuyên dùng SQS và SNS cho ứng dụng mới, còn Amazon MQ cho các trường hợp di chuyển như vậy.

## Amazon Kinesis ở mức tổng quan

**Amazon Kinesis** là họ dịch vụ cho **dữ liệu streaming**: dữ liệu liên tục từ nhiều nguồn, như clickstream, log hoặc thiết bị IoT, được xử lý gần thời gian thực.

- **Amazon Kinesis Data Streams** thu nhận và lưu dữ liệu streaming cho các ứng dụng tùy biến xử lý nó.
- **Amazon Data Firehose** (trước đây là Kinesis Data Firehose) chuyển stream tới các đích như Amazon S3, Amazon Redshift và Amazon OpenSearch Service.
- **Amazon Managed Service for Apache Flink** (trước đây là Kinesis Data Analytics) phân tích stream.

Ở đây Kinesis chỉ được nói ở mức tổng quan. Hãy nhớ rằng stream dành cho dòng bản ghi liên tục, còn hàng đợi trao từng tác vụ rời rạc.

## Dịch vụ nào cho nhu cầu nào

| Nhu cầu | Dịch vụ |
| --- | --- |
| Giữ các mục công việc để thành phần chậm hơn xử lý sau | Amazon SQS |
| Thông điệp phải đúng thứ tự nghiêm ngặt | Amazon SQS FIFO |
| Gửi một thông điệp tới nhiều subscriber hoặc người dùng (email, SMS, hàng đợi) | Amazon SNS |
| Di chuyển ứng dụng ActiveMQ hoặc RabbitMQ hiện có | Amazon MQ |
| Thu nhận dòng bản ghi liên tục, khối lượng lớn | Amazon Kinesis |
| Phản ứng với event của dịch vụ AWS và định tuyến tới target | Amazon EventBridge (bài tiếp theo) |

## Ý chính

- Hàng đợi và topic giúp các thành phần liên kết lỏng.
- SQS: hàng đợi kiểu pull có visibility timeout; standard là ít nhất một lần và thứ tự cố gắng tối đa, FIFO đúng thứ tự trong từng message group.
- SNS: topic với push tới nhiều endpoint; SNS cộng SQS cho ra fanout.
- Amazon MQ dùng để di chuyển ứng dụng dựa trên broker; Kinesis dùng cho stream.

## Nguồn

- [What is Amazon SQS?](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
- [What is Amazon SNS?](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)
- [What is Amazon MQ?](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/welcome.html)
