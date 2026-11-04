---
id: storage-snow-family
title: "AWS Snow Family: chuyển dữ liệu offline và điện toán biên"
required: true
---
## Snow Family là gì

**AWS Snow Family** là nhóm thiết bị vật lý do AWS gửi đến bạn. Bạn nạp dữ liệu vào (hoặc chạy tính toán trên đó), gửi trả lại, và AWS nhập dữ liệu vào Amazon S3. Chúng giải quyết hai vấn đề: chuyển bộ dữ liệu rất lớn khi mạng quá chậm hoặc quá đắt, và lưu trữ hay xử lý dữ liệu tại các địa điểm xa có kết nối kém hoặc không có.

## Các thiết bị

| Thiết bị | Là gì | Tình trạng |
| --- | --- | --- |
| **AWS Snowcone** | Thiết bị biên nhỏ nhất, di động, cho bộ dữ liệu nhỏ và điện toán biên | Ngừng cung cấp từ 12/11/2024 |
| **AWS Snowball Edge Storage Optimized** | Dung lượng cục bộ lớn (mẫu hiện tại là 210 TB) để chuyển và lưu dữ liệu | Không còn mở cho khách hàng mới |
| **AWS Snowball Edge Compute Optimized** | Sức mạnh tính toán cho workload biên, như chạy instance tương thích EC2 ngay trên thiết bị | Không còn mở cho khách hàng mới |
| **AWS Snowmobile** | Container vận chuyển do xe đầu kéo chở, cho dữ liệu cỡ exabyte | Đã ngừng hoàn toàn từ 14/3/2024 |

Tình trạng quan trọng khi dùng thực tế, nhưng đề thi vẫn mô tả các dịch vụ này nên bạn cần biết từng loại dùng để làm gì:

- **Snowcone**: nhỏ, bền chắc, di động; dùng ở biên khi ít không gian.
- **Snowball Edge**: "con ngựa thồ". **Storage Optimized** để chuyển từ terabyte đến petabyte, **Compute Optimized** để xử lý dữ liệu ở biên trước khi gửi lên AWS.
- **Snowmobile**: cho cỡ exabyte. Mẹo thi: "exabyte", "di chuyển trung tâm dữ liệu", "xe tải".

Thiết bị Snowball Edge mã hóa dữ liệu khi lưu và khi vận chuyển, có thể gom cụm (3 đến 16 thiết bị) để lưu trữ cục bộ, và chạy được instance tương thích EC2 cùng hàm AWS Lambda ngay trên thiết bị. AWS đã công bố chấm dứt hỗ trợ thiết bị Snowball tại các Region thương mại vào ngày 31/12/2026.

## Một job Snow hoạt động thế nào

1. Trong console AWS, bạn tạo một **job** và chọn thiết bị cùng S3 bucket đích.
2. AWS gửi thiết bị đến bạn.
3. Bạn nối nó vào mạng và sao chép dữ liệu bằng Snowball client hoặc AWS OpsHub.
4. Bạn gửi trả lại (nhãn vận chuyển hiển thị trên màn hình E Ink của thiết bị).
5. AWS sao chép dữ liệu vào S3 bucket của bạn, kiểm tra và xóa sạch thiết bị một cách an toàn.

Với **export**, quy trình ngược lại: AWS nạp dữ liệu từ S3 vào thiết bị rồi gửi cho bạn.

## Snow so với truyền qua mạng

| Tình huống | Lựa chọn tốt hơn |
| --- | --- |
| Băng thông tốt, sao chép liên tục hoặc định kỳ | **AWS DataSync** qua mạng |
| Đường truyền riêng thường trực, thông lượng cao | **AWS Direct Connect** |
| Bộ dữ liệu rất lớn, chuyển một lần, mạng chậm hoặc không có | Thiết bị Snow (trước đây) |
| Địa điểm xa không có kết nối, cần xử lý cục bộ | Snowball Edge Compute Optimized (trước đây) |

Mẹo thi: "petabyte", "kết nối internet hạn chế", "không muốn dùng internet" trước đây chỉ về Snowball Edge. Hiện AWS hướng khách hàng mới đến **DataSync** cho truyền trực tuyến, **AWS Data Transfer Terminal** cho truyền vật lý an toàn (bạn mang thiết bị lưu trữ của mình đến một địa điểm của AWS), giải pháp của AWS Partner, và **AWS Outposts** cho điện toán biên.

Nếu danh sách đáp án có Snowball Edge cho việc chuyển lớn offline mà không có gì mới hơn, hãy chọn nó; đề thi được viết khi các thiết bị này còn cung cấp.

## Bẫy thường gặp

- Thiết bị Snow **chuyển hoặc xử lý** dữ liệu theo kiểu vật lý; Storage Gateway cho truy cập hybrid liên tục, còn DataSync truyền trực tuyến.
- Snowmobile cho cỡ exabyte, Snowball Edge cho terabyte đến petabyte.
- Compute Optimized là để xử lý ở biên, không phải thêm dung lượng.

## Ý chính

- Snow Family = thiết bị vật lý cho truyền offline và điện toán biên: Snowcone, Snowball Edge (Storage và Compute Optimized), Snowmobile.
- Dùng Snow khi mạng quá chậm, đắt hoặc không có; dùng DataSync hoặc Direct Connect khi kết nối tốt.
- Snowcone và Snowmobile đã ngừng; Snowball Edge đóng với khách hàng mới và hết hỗ trợ ngày 31/12/2026.
- Lựa chọn thay thế: DataSync, Data Transfer Terminal, giải pháp Partner, Outposts.

## Nguồn

- [AWS Snowball Edge availability change](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html)
- [What is Snowball Edge?](https://docs.aws.amazon.com/snowball/latest/developer-guide/whatisedge.html)
- [AWS Snow device updates](https://aws.amazon.com/blogs/storage/aws-snow-device-updates/)
