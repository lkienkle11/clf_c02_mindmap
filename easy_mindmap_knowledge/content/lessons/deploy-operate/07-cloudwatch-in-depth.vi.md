---
id: deploy-operate-cloudwatch-in-depth
title: "Amazon CloudWatch chuyên sâu: metric, alarm, log, dashboard và agent"
required: true
videoQuery: Amazon CloudWatch metrics alarms logs dashboards CloudWatch agent explained for beginners
---
## CloudWatch dùng để làm gì

**Amazon CloudWatch** giám sát **hiệu năng và sức khỏe** của tài nguyên và ứng dụng AWS gần như theo thời gian thực. Nó thu thập dữ liệu giám sát, hiển thị và có thể hành động dựa trên dữ liệu đó. Nó trả lời câu hỏi "hệ thống đang chạy thế nào ngay lúc này?". Bài giám sát đã so sánh nó với CloudTrail và Config; bài này nhìn vào bên trong CloudWatch.

## Metric

**Metric** là một tập điểm dữ liệu theo thứ tự thời gian, ví dụ mức dùng CPU của một EC2 instance. Metric nằm trong một **namespace** (Amazon EC2 dùng `AWS/EC2`) và được mô tả bằng các **dimension**, cặp tên/giá trị như ID của instance.

- Nhiều dịch vụ AWS gửi metric miễn phí, ví dụ EC2, EBS và RDS.
- Metric chỉ tồn tại trong Region nơi chúng được tạo và được giữ tối đa **15 tháng**; dữ liệu cũ dần được gộp thành chu kỳ thô hơn.
- Dịch vụ AWS gửi ở **độ phân giải chuẩn** (mỗi phút một điểm; giám sát cơ bản của EC2 là ngoại lệ, xem bên dưới). **Custom metric** của bạn có thể có độ phân giải cao, xuống tới một giây.

### Giám sát mặc định và giám sát chi tiết cho EC2

| | Basic (mặc định) | Detailed |
| --- | --- | --- |
| Chu kỳ metric của EC2 | 5 phút một lần | 1 phút một lần |
| Chi phí | Không tính phí | Có tính phí |

Chọn detailed monitoring khi cần phản ứng nhanh hơn, ví dụ alarm để co giãn cụm máy chủ kịp lúc.

## Alarm

**Alarm** theo dõi một metric so với ngưỡng trong một số chu kỳ và có ba trạng thái: **OK**, **ALARM** và **INSUFFICIENT_DATA** (chưa đủ dữ liệu, ví dụ vì tài nguyên không hoạt động). Khi trạng thái đổi, alarm có thể:

- gửi thông báo tới một topic **Amazon SNS**;
- chạy một **hành động EC2**, như stop hoặc reboot instance;
- kích hoạt một hành động **EC2 Auto Scaling**, như thêm instance;
- tạo một OpsItem hoặc incident của Systems Manager.

**Composite alarm** gộp nhiều alarm khác thành một quy tắc để giảm nhiễu. Bản thân alarm không tự co giãn gì cả: khi đề hỏi thứ gì kích hoạt hành động Auto Scaling dựa trên mức dùng CPU, đáp án là **CloudWatch alarm**. SNS chỉ chuyển thông báo, nó không theo dõi metric.

## Log

**CloudWatch Logs** thu thập, lưu trữ và tìm kiếm tệp log từ các dịch vụ AWS và ứng dụng của bạn.

- **Log event** là một bản ghi. **Log stream** là chuỗi event từ cùng một nguồn, như một máy chủ. **Log group** chứa các stream dùng chung cài đặt về retention, giám sát và quyền truy cập.
- Mặc định, dữ liệu log được giữ **vô thời hạn**. Bạn đặt **thời gian lưu giữ (retention)** cho từng log group, và event hết hạn sẽ tự động bị xóa.
- **Metric filter** biến các log event khớp điều kiện thành điểm dữ liệu metric, rồi bạn đặt alarm trên đó.
- **Logs Insights** là công cụ truy vấn tương tác trên dữ liệu log. Truy vấn của nó được tính phí theo lượng dữ liệu log phải quét.

## Dashboard

**Dashboard** là một khung nhìn tùy chỉnh gom metric và alarm vào một chỗ. Nó có thể hiển thị tài nguyên từ nhiều Region, và với cross-account observability còn gộp được nhiều tài khoản. Các nhóm dùng dashboard làm khung nhìn chung khi xử lý sự cố vận hành.

## CloudWatch agent và custom metric

EC2 gửi các metric cấp instance như CPU, disk I/O và mạng. Nó **không** báo cáo **mức dùng bộ nhớ hay dung lượng đĩa đã dùng**, vì những thứ đó nằm bên trong hệ điều hành. **CloudWatch agent** cài trên máy chủ sẽ thu thập các metric cấp hệ thống đó, cùng tệp log, từ EC2 instance và **máy chủ tại chỗ**. Nó cũng nhận được custom metric của ứng dụng (StatsD, collectd). Metric do agent gửi được tính phí như **custom metric** và mặc định nằm trong namespace `CWAgent`. Agent có thể được cài đặt và cấu hình bằng Systems Manager.

## EventBridge và những gì CloudWatch không làm

**Amazon EventBridge** (trước đây là Amazon CloudWatch Events) định tuyến event tới các target như hàm Lambda; bài tùy chọn về nhắn tin và workflow sẽ nói kỹ hơn. Quy tắc phản ứng khi một EC2 instance chuyển sang trạng thái "stopping" là việc của EventBridge, không phải của alarm.

CloudWatch **không** phải dịch vụ kiểm toán:

| Câu hỏi | Không phải CloudWatch, hãy dùng |
| --- | --- |
| IAM user nào đã gọi API, vào lúc nào? | AWS CloudTrail |
| Tài nguyên này có tuân thủ không, và tháng trước nó được cấu hình ra sao? | AWS Config |
| Microservice nào làm chậm các request của tôi? | AWS X-Ray |
| Bản thân AWS có đang gặp sự cố không? | AWS Health Dashboard |

## Giá trong một đoạn

Nhiều metric dịch vụ miễn phí theo mặc định. Bạn trả tiền cho detailed monitoring, custom metric (kể cả metric do agent gửi), alarm độ phân giải cao và truy vấn Logs Insights, vốn tính theo lượng dữ liệu log đã quét. Dữ liệu log lưu lại cũng tốn tiền, nên đặt thời gian retention giúp hạn chế chi phí lưu trữ.

## Ý chính

- Metric là các điểm dữ liệu hiệu năng; alarm có trạng thái OK, ALARM, INSUFFICIENT_DATA và có thể thông báo, tác động EC2 hoặc kích hoạt Auto Scaling.
- Log được tổ chức thành event, stream và group; retention đặt theo group và mặc định là vô hạn.
- Giám sát EC2 cơ bản là 5 phút, chi tiết là 1 phút; metric bộ nhớ và dung lượng đĩa cần CloudWatch agent.
- CloudWatch không ghi lại ai đã gọi API; đó là việc của CloudTrail.

## Nguồn

- [Metrics concepts](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)
- [Using Amazon CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html)
- [Collect metrics, logs, and traces using the CloudWatch agent](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Install-CloudWatch-Agent.html)
