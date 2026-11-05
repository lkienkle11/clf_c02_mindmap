---
id: deploy-operate-eventbridge-step-functions-appsync-fis
title: "Sự kiện, workflow và khả năng chịu lỗi: EventBridge, Step Functions, AppSync và Fault Injection Service"
required: false
videoQuery: Amazon EventBridge vs AWS Step Functions vs AppSync vs Fault Injection Service explained
---
## Các dịch vụ này nằm ở đâu

Bài về nhắn tin đã nói về hàng đợi và topic. Bài này nói về bốn dịch vụ khác mà bạn có thể gặp trong đáp án đề thi: một dịch vụ định tuyến **event**, một dịch vụ chạy **workflow**, một dịch vụ cung cấp **API cho ứng dụng**, và một dịch vụ kiểm thử **khả năng chịu lỗi**.

## Amazon EventBridge

**Amazon EventBridge** là dịch vụ serverless kết nối các thành phần ứng dụng thông qua **event**. Nó là bước phát triển tiếp theo của **Amazon CloudWatch Events**: [tài liệu AWS](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-cwe-now-eb.html) mô tả hai tên này là cùng một dịch vụ và cùng một API bên dưới, EventBridge chỉ thêm nhiều tính năng hơn, nên tài liệu cũ có thể vẫn ghi CloudWatch Events.

- Một **event bus** nhận event từ dịch vụ AWS, ứng dụng của bạn và đối tác SaaS. **Rule** so khớp event và gửi tới các **target**, như hàm Lambda, hàng đợi SQS hay topic SNS.
- **EventBridge Pipes** nối một nguồn với một đích, kèm tùy chọn biến đổi và làm giàu dữ liệu.
- **EventBridge Scheduler** chạy tác vụ theo lịch, dùng biểu thức cron hoặc rate, hoặc một thời điểm duy nhất.

Ví dụ điển hình: khi một EC2 instance chuyển sang trạng thái "stopping", một rule EventBridge gọi hàm Lambda. Đó là phản ứng **hướng sự kiện**. EventBridge không phải công cụ kiểm toán (CloudTrail), không phải công cụ tuân thủ (Config) và không phải alarm cho metric (CloudWatch). Event của AWS Health cũng có thể được gửi tới nó.

## AWS Step Functions

**AWS Step Functions** cho phép bạn xây **workflow**, gọi là state machine, từ các bước gọi là **state**. Một task state gọi dịch vụ khác, như hàm Lambda. Các state khác cho phép workflow chọn nhánh, chạy bước song song, thử lại hoặc bắt lỗi, và chờ một người hoặc một callback. Console vẽ workflow trực quan, nên bạn theo dõi được từng lần thực thi.

| Loại workflow | Chạy tối đa | Thực thi | Phù hợp với |
| --- | --- | --- | --- |
| Standard | Tới một năm | Mỗi bước đúng một lần | Workflow chạy lâu, cần kiểm toán |
| Express | Tới năm phút | Ít nhất một lần nếu bất đồng bộ, tối đa một lần nếu đồng bộ | Xử lý event tốc độ cao, như dữ liệu streaming và thu nhận IoT |

Chọn Step Functions để **điều phối** nhiều dịch vụ theo thứ tự, có xử lý lỗi và rẽ nhánh, thay vì nối chúng bằng mã tự viết. Workflow Standard tính tiền theo số lần chuyển state; Express tính theo số lần và thời lượng thực thi.

## AWS AppSync

**AWS AppSync** là dịch vụ **GraphQL** được quản lý cho phần backend của ứng dụng. Client hỏi dữ liệu mình cần bằng truy vấn GraphQL. AppSync còn có cập nhật **thời gian thực**: **subscription** GraphQL chạy trên WebSocket do AppSync quản lý, và tính năng **AppSync Events** mới hơn cung cấp kênh publish/subscribe mà không cần schema GraphQL. Chọn AppSync cho ứng dụng di động hoặc web cần API linh hoạt hoặc dữ liệu trực tiếp.

## AWS Fault Injection Service

**AWS Fault Injection Service (AWS FIS)** là dịch vụ được quản lý hoàn toàn để chạy các **thí nghiệm chèn lỗi** có kiểm soát. Tên cũ của nó là **AWS Fault Injection Simulator**, nên đề thi có thể dùng một trong hai tên. Một thí nghiệm áp dụng các hành động lên tài nguyên đích, ví dụ làm gián đoạn kết nối mạng, để xem ứng dụng có còn khỏe không.

- Nó hỗ trợ **chaos engineering**: bạn cố ý gây lỗi và tìm ra điểm yếu trước khi sự cố thật xảy ra.
- **Stop condition** dựa trên CloudWatch alarm sẽ tự dừng thí nghiệm nếu nó gây hại.
- Nó kiểm thử khả năng chịu lỗi; bản thân nó không sửa gì và không giám sát production.

## Dịch vụ nào cho nhu cầu nào

| Nhu cầu | Dịch vụ |
| --- | --- |
| Phản ứng với event từ dịch vụ AWS hoặc đối tác SaaS | Amazon EventBridge |
| Chạy một việc theo lịch | EventBridge Scheduler |
| Phối hợp nhiều bước với rẽ nhánh, thử lại và chờ | AWS Step Functions |
| Giữ công việc cho consumer xử lý sau | Amazon SQS |
| Thông báo cho nhiều subscriber | Amazon SNS |
| API GraphQL linh hoạt với cập nhật thời gian thực | AWS AppSync |
| Chứng minh hệ thống sống sót khi có lỗi | AWS Fault Injection Service |

## Bẫy thường gặp

- Rule kích hoạt khi instance đổi trạng thái là **EventBridge**, không phải SNS hay Config.
- Điều phối quy trình nhiều bước là **Step Functions**; EventBridge chỉ định tuyến event.
- AWS FIS và AWS Fault Injection Simulator là cùng một dịch vụ với tên mới và tên cũ.

## Ý chính

- EventBridge định tuyến event từ nguồn tới target bằng rule và lên lịch tác vụ; trước đây nó là CloudWatch Events.
- Step Functions phối hợp workflow: Standard (tới một năm, đúng một lần) và Express (tới năm phút, ít nhất một lần khi bất đồng bộ).
- AppSync là GraphQL được quản lý với subscription thời gian thực.
- AWS Fault Injection Service chạy thí nghiệm chèn lỗi với stop condition là CloudWatch alarm.

## Nguồn

- [What is Amazon EventBridge?](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-what-is.html)
- [What is Step Functions?](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html)
- [AWS AppSync](https://aws.amazon.com/appsync/)
