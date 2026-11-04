---
id: storage-s3-website-express-one-zone
title: "Website tĩnh S3, pre-signed URL, Transfer Acceleration và S3 Express One Zone"
required: false
---
## Tùy chọn: bốn tính năng S3 bổ sung

Bài tùy chọn này nói về các tính năng hay xuất hiện trong câu hỏi "tính năng S3 nào".

## Static website hosting

Một bucket có thể phục vụ **website tĩnh**: HTML, CSS, hình ảnh và script phía máy khách, không có mã phía máy chủ. Các điểm chính:

- Nội dung phải **đọc công khai được**, nên bạn phải cho phép truy cập công khai cho bucket đó (Block Public Access sẽ chặn nó).
- Endpoint website của S3 không hỗ trợ HTTPS. Để có HTTPS và mạng phân phối nội dung toàn cầu, đặt **Amazon CloudFront** phía trước, hoặc dùng **AWS Amplify Hosting**, dịch vụ AWS khuyên dùng cho site tĩnh lưu trong S3.
- Mẹo thi: "website tĩnh với chi phí vận hành thấp nhất" chỉ về S3 (không có máy chủ để quản lý).

## Pre-signed URL

**Pre-signed URL** cho ai đó quyền truy cập **có thời hạn** vào một đối tượng riêng tư (để tải xuống, hoặc tải lên) mà không cần mở công khai bucket. URL mang quyền của người dùng AWS đã tạo ra nó và hết hiệu lực khi quá hạn. Dùng để chia sẻ tạm thời một tệp riêng tư.

## S3 Transfer Acceleration

**S3 Transfer Acceleration** tăng tốc truyền dữ liệu đường dài giữa máy khách của bạn và S3 bucket. Dữ liệu vào tại một edge location CloudFront gần nhất rồi đi đến S3 qua đường mạng tối ưu của AWS. Bạn bật nó trên bucket và dùng endpoint accelerate riêng. Mẹo thi: "chuyển tệp nhanh và an toàn qua khoảng cách xa đến một bucket". Nó dựa trên edge location, được nói ở chủ đề global-infrastructure.

## Amazon S3 Express One Zone

**Amazon S3 Express One Zone** là storage class S3 hiệu năng cao cho workload cần truy cập **mili giây một chữ số** ổn định, như huấn luyện machine learning, phân tích và chỉnh sửa media tương tác.

- Dữ liệu nằm trong **một Availability Zone do bạn chọn**, nên đặt được cạnh tài nguyên tính toán. Nó không lưu trên nhiều AZ, vì vậy dùng cho dữ liệu có thể tạo lại hoặc đã có bản ở nơi khác.
- Đối tượng nằm trong loại bucket mới gọi là **directory bucket**.
- Được thiết kế đạt tính sẵn sàng 99,95% trong AZ và chi phí yêu cầu thấp hơn S3 Standard.
- Yêu cầu dùng xác thực theo phiên để giảm độ trễ; ứng dụng và SDK của bạn tự xử lý.
- Mã hóa SSE-S3 tự động; hỗ trợ SSE-KMS.

So sánh với **S3 One Zone-IA**: One Zone-IA dành cho dữ liệu ít truy cập, có thể tạo lại, giá thấp; Express One Zone dành cho dữ liệu "nóng" nhất, nhạy với độ trễ. Mẹo thi: "mili giây một chữ số", "S3 có độ trễ thấp nhất" chỉ về Express One Zone.

## Ý chính

- Static website hosting cần quyền đọc công khai; dùng CloudFront để có HTTPS.
- Pre-signed URL chia sẻ đối tượng riêng tư trong thời gian giới hạn.
- Transfer Acceleration dùng edge location để tăng tốc truyền đường dài.
- S3 Express One Zone: một AZ, directory bucket, S3 độ trễ thấp nhất.

## Nguồn

- [Hosting a static website using Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Sharing objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [High performance workloads: S3 Express One Zone](https://docs.aws.amazon.com/AmazonS3/latest/userguide/directory-bucket-high-performance.html)
