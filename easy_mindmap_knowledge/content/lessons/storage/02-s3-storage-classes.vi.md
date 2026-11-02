---
id: storage-s3-classes
title: Các storage class của S3 và lifecycle policy
required: true
---
## Vì sao có nhiều storage class

Mỗi object trong S3 có một **storage class**. Mọi class đều có độ bền rất cao; chúng khác nhau ở **mức độ bạn dự kiến đọc dữ liệu**, tốc độ cần lấy lại dữ liệu, số Availability Zone giữ dữ liệu, và giá. Quy tắc chung: dữ liệu càng ít được đọc thì lưu càng rẻ, nhưng việc đọc lại tốn tiền hơn hoặc lâu hơn.

## Các class, từ "nóng" đến "lạnh"

| Storage class | Phù hợp nhất cho | Truy cập |
| --- | --- | --- |
| S3 Standard | Dữ liệu truy cập thường xuyên (mặc định) | Mili giây |
| S3 Intelligent-Tiering | Kiểu truy cập chưa biết hoặc hay thay đổi | Mili giây ở tầng truy cập thường xuyên và không thường xuyên |
| S3 Standard-IA | Ít truy cập, nhưng cần lấy nhanh khi được yêu cầu | Mili giây, có phí truy xuất |
| S3 One Zone-IA | Ít truy cập, tạo lại được, lưu trong một AZ | Mili giây, có phí truy xuất |
| S3 Glacier Instant Retrieval | Lưu trữ lâu dài, đọc khoảng mỗi quý một lần | Mili giây |
| S3 Glacier Flexible Retrieval | Lưu trữ lâu dài, đọc khoảng mỗi năm một lần | Vài phút đến vài giờ, sau khi khôi phục (restore) |
| S3 Glacier Deep Archive | Lưu trữ dài hạn, đọc ít hơn mỗi năm một lần | Vài giờ, sau khi khôi phục; chi phí thấp nhất |

Những điểm câu hỏi thi hay dựa vào:

- **Intelligent-Tiering** theo dõi từng object và tự chuyển nó giữa các tầng truy cập, với một khoản phí theo dõi nhỏ và **không có phí truy xuất**. Chọn nó khi chưa biết kiểu truy cập.
- **One Zone-IA** giữ dữ liệu trong **một** Availability Zone duy nhất, nên rẻ hơn nhưng dữ liệu có thể mất nếu AZ đó bị phá hủy. Chỉ dùng cho dữ liệu tạo lại được hoặc bản sao thứ cấp.
- Các class IA và Glacier có **thời gian lưu tối thiểu** (ví dụ 30 ngày với các class IA và 180 ngày với Deep Archive), nên phù hợp với dữ liệu sống lâu.

## Lifecycle policy

**S3 Lifecycle configuration** là tập quy tắc mà S3 tự động áp dụng cho các object:

- **Transition action (hành động chuyển lớp)** chuyển object sang class rẻ hơn sau một khoảng thời gian, ví dụ sang Standard-IA 30 ngày sau khi tạo và sang Glacier Flexible Retrieval sau một năm.
- **Expiration action (hành động hết hạn)** xóa object khi không còn cần, như log chỉ giữ trong một thời hạn tuân thủ cố định.

Lifecycle rule hợp với dữ liệu có kiểu truy cập **đã biết và dễ dự đoán**; Intelligent-Tiering hợp với dữ liệu có kiểu truy cập **chưa biết**.

## Bẫy thường gặp

- "Hiếm khi truy cập nhưng phải có trong vài mili giây" hướng tới Standard-IA hoặc Glacier Instant Retrieval, không phải Flexible Retrieval hay Deep Archive.
- "Lưu trữ lâu dài rẻ nhất, truy xuất trong vài giờ là chấp nhận được" hướng tới Glacier Deep Archive.
- One Zone-IA là lựa chọn sai cho bản sao duy nhất của dữ liệu quan trọng.

## Ý chính

- Chọn class theo tần suất truy cập và tốc độ truy xuất.
- Intelligent-Tiering tự động chuyển tầng khi chưa biết kiểu truy cập.
- Các class Glacier dành cho lưu trữ lâu dài; Deep Archive rẻ nhất và chậm nhất.
- Lifecycle rule chuyển lớp hoặc xóa object theo lịch bạn đặt.

## Nguồn

- [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Managing the lifecycle of objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html)
- [Amazon S3 storage classes](https://aws.amazon.com/s3/storage-classes/)
