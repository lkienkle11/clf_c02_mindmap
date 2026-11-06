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
| **AWS Snowball Edge Storage Optimized** | Dung lượng cục bộ lớn để chuyển và lưu dữ liệu | Không còn mở cho khách hàng mới |
| **AWS Snowball Edge Compute Optimized** | Sức mạnh tính toán cho workload biên, như chạy instance tương thích EC2 ngay trên thiết bị | Không còn mở cho khách hàng mới |
| **AWS Snowmobile** | Container do xe đầu kéo chở, cho các đợt chuyển dữ liệu lớn nhất | Đã ngừng hoàn toàn (hết hỗ trợ 14/3/2024) |

Tình trạng quan trọng khi dùng thực tế, nhưng đề thi vẫn mô tả các dịch vụ này nên bạn cần biết từng loại dùng để làm gì:

- **Snowcone**: nhỏ, bền chắc, di động; dùng ở biên khi ít không gian.
- **Snowball Edge**: "con ngựa thồ". **Storage Optimized** để chuyển từ terabyte đến vài petabyte, **Compute Optimized** để xử lý dữ liệu ở biên trước khi gửi lên AWS.
- **Snowmobile**: cho từ hàng chục petabyte đến exabyte. Mẹo thi: "hàng chục petabyte trở lên", "exabyte", "di chuyển trung tâm dữ liệu", "xe tải".

**Tình trạng hiện tại.** Snowcone đã ngừng cung cấp từ 12/11/2024 ([AWS Storage Blog](https://aws.amazon.com/blogs/storage/aws-snow-device-updates/)). Trang availability change nêu Snowball Edge không còn dành cho khách hàng mới và AWS không còn cung cấp thiết bị Snow Family nào cho khách hàng mới; khách hàng hiện tại không bị ảnh hưởng. Trang sản phẩm Snowball nêu hỗ trợ thiết bị Snowball tại các Region thương mại của AWS kết thúc ngày 31/12/2026 (khách hàng GovCloud và ADC Region có job đang hoạt động không bị ảnh hưởng), trong khi danh sách dịch vụ ngừng hoàn toàn của AWS General Reference ghi Snowball Edge với ngày 12/11/2025. Các trang của AWS nêu ngày khác nhau; hãy kiểm tra trang availability change.

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
| Bộ dữ liệu rất lớn, chuyển một lần, mạng chậm hoặc không có | Thiết bị Snow: Snowball Edge đến vài PB, Snowmobile cho hàng chục PB trở lên |
| Địa điểm xa không có kết nối, cần xử lý cục bộ | Snowball Edge Compute Optimized |

Mẹo thi: "kết nối internet hạn chế" hoặc "không muốn dùng internet" nghĩa là thiết bị Snow. Kích thước quyết định thiết bị: đến vài PB hoặc cần xử lý tại địa điểm xa là Snowball Edge; hàng chục PB trở lên (ví dụ 50 PB hay 75 PB) là Snowmobile. Hiện nay AWS hướng khách hàng mới đến **DataSync** cho truyền trực tuyến, **AWS Data Transfer Terminal** cho truyền vật lý an toàn (bạn mang thiết bị lưu trữ của mình đến một địa điểm của AWS), giải pháp của AWS Partner, và **AWS Outposts** cho điện toán biên.

Dù tình trạng hiện tại ra sao, câu hỏi thi về chuyển dữ liệu lớn offline mong đợi một thiết bị Snow. Snowball Edge là đáp án tiêu chuẩn, trừ khi khối lượng dữ liệu lớn hơn nhiều, khi đó là Snowmobile.

## Bẫy thường gặp

- Thiết bị Snow **chuyển hoặc xử lý** dữ liệu theo kiểu vật lý; Storage Gateway cho truy cập hybrid liên tục, còn DataSync truyền trực tuyến.
- Snowmobile cho hàng chục petabyte đến exabyte; Snowball Edge cho terabyte đến vài petabyte.
- Compute Optimized là để xử lý ở biên, không phải thêm dung lượng.

## Ý chính

- Snow Family = thiết bị vật lý cho truyền offline và điện toán biên: Snowcone, Snowball Edge (Storage và Compute Optimized), Snowmobile.
- Dùng Snow khi mạng quá chậm, đắt hoặc không có; dùng DataSync hoặc Direct Connect khi kết nối tốt.
- Snowcone và Snowmobile đã ngừng; Snowball Edge đóng với khách hàng mới, và các trang của AWS nêu ngày hết hỗ trợ khác nhau.
- Lựa chọn thay thế: DataSync, Data Transfer Terminal, giải pháp Partner, Outposts.

## Nguồn

- [AWS Snowball Edge availability change](https://docs.aws.amazon.com/snowball/latest/developer-guide/snowball-edge-availability-change.html)
- [AWS Snowball (product page, end-of-support notice)](https://aws.amazon.com/snowball/)
- [Services in Full Shutdown (AWS General Reference)](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
