---
id: storage-s3-basics
title: Amazon S3 cơ bản: bucket, object, độ bền và bảo mật
required: true
---
## Lưu trữ đối tượng trong một đoạn

**Amazon Simple Storage Service (Amazon S3)** là dịch vụ **lưu trữ đối tượng (object storage)**. Bạn tạo một **bucket** trong Region bạn chọn, rồi tải các **object** lên đó. Một object là một tệp cùng **siêu dữ liệu (metadata)** mô tả tệp đó, và mỗi object được tìm thấy bằng **key** của nó (tên của object trong bucket). Bạn không gắn S3 vào máy chủ như một ổ đĩa; ứng dụng đọc và ghi object qua HTTPS bằng S3 API. Bạn chỉ trả tiền cho phần đã lưu trữ và sử dụng, không cần lập kế hoạch dung lượng trước. Các cách dùng điển hình: sao lưu, data lake, tệp media, log và tài nguyên cho website.

## Độ bền và tính sẵn sàng

Hai từ này rất dễ nhầm:

- **Độ bền (durability)**: khả năng dữ liệu của bạn **bị mất** thấp đến mức nào. Các storage class của S3 được thiết kế cho độ bền 99,999999999% (mười một số 9).
- **Tính sẵn sàng (availability)**: bạn **truy cập được** dữ liệu thường xuyên đến mức nào khi cần. Con số này khác nhau giữa các storage class; S3 Standard được thiết kế cho 99,99%.

| Thuật ngữ | Câu hỏi nó trả lời | Thiết kế của S3 Standard |
| --- | --- | --- |
| Độ bền | Dữ liệu của tôi còn tồn tại không? | 99,999999999% |
| Tính sẵn sàng | Tôi có đọc được nó ngay bây giờ không? | 99,99% |

Dữ liệu lưu trong một Region sẽ ở lại Region đó trừ khi bạn sao chép hoặc nhân bản (replicate) nó sang nơi khác.

## Versioning

**S3 Versioning** giữ lại mọi phiên bản của một object trong bucket. Ghi đè một object sẽ tạo phiên bản mới, còn xóa object thì thêm một **delete marker** thay vì xóa dữ liệu, nên bạn có thể khôi phục các phiên bản trước. Tính năng này bảo vệ khỏi việc xóa hoặc ghi đè do nhầm lẫn. Versioning tắt theo mặc định; khi đã bật thì chỉ có thể **tạm ngưng (suspend)**, không gỡ bỏ được, và mọi phiên bản được lưu đều bị tính phí.

## Lưu trữ website tĩnh

Một bucket có thể lưu trữ **website tĩnh** (HTML, CSS, hình ảnh và script chạy phía trình duyệt, không có mã chạy phía máy chủ). Nội dung phải cho phép đọc công khai. Website endpoint của S3 không hỗ trợ HTTPS, nên muốn dùng HTTPS bạn đặt Amazon CloudFront phía trước bucket.

## Bảo mật cơ bản

- Bucket và object **mặc định là riêng tư**; quyền truy cập được cấp qua IAM policy và bucket policy.
- Các thiết lập **S3 Block Public Access** ở cấp tài khoản hoặc cấp bucket sẽ ghi đè các policy có thể làm dữ liệu bị công khai. Hãy giữ chúng bật trừ khi bạn thật sự cần truy cập công khai.
- **Mã hóa khi lưu trữ (encryption at rest)**: từ tháng 1 năm 2023, S3 tự động mã hóa mọi object mới bằng mã hóa phía máy chủ với khóa do S3 quản lý (SSE-S3), không tốn thêm phí. Bạn có thể chọn dùng khóa AWS KMS thay thế.

## Bẫy thường gặp

- "Mười một số 9" mô tả **độ bền**, không phải tính sẵn sàng.
- S3 không phải lưu trữ dạng khối (block storage); bạn không thể cài hệ điều hành lên đó.

## Ý chính

- S3 lưu object (dữ liệu cộng metadata) trong bucket; mỗi object có một key.
- Độ bền = dữ liệu không bị mất; tính sẵn sàng = dữ liệu truy cập được.
- Versioning bảo vệ khỏi việc xóa và ghi đè do nhầm lẫn.
- Riêng tư theo mặc định, có Block Public Access và mã hóa SSE-S3 mặc định.

## Nguồn

- [What is Amazon S3?](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)
- [Understanding and managing Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html)
- [Default encryption FAQ](https://docs.aws.amazon.com/AmazonS3/latest/userguide/default-encryption-faq.html)
