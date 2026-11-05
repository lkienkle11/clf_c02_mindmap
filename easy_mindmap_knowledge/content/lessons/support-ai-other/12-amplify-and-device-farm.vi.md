---
id: support-ai-other-amplify-and-device-farm
title: "AWS Amplify, AWS AppSync và AWS Device Farm: xây dựng, kết nối và kiểm thử ứng dụng web và di động"
required: false
---
## Tùy chọn: dịch vụ frontend web và di động

Bài này không bắt buộc. Nó nói về ba dịch vụ dành cho lập trình viên giúp xây dựng, kết nối và kiểm thử ứng dụng web và di động. Danh sách trong phạm vi CLF-C02 chỉ ghi **AWS Amplify** trong nhóm này.

## AWS Amplify: xây dựng và lưu trữ ứng dụng full-stack

**AWS Amplify** giúp lập trình viên frontend web và di động xây dựng và lưu trữ ứng dụng **full-stack**. **Amplify Hosting** kết nối với một Git repository, build ứng dụng mỗi lần bạn push, và triển khai lên mạng phân phối nội dung toàn cầu của AWS với continuous deployment. Nó hỗ trợ các framework phổ biến, gồm React, Angular, Vue, Next.js và các trình tạo trang tĩnh, đồng thời có môi trường theo nhánh tính năng và bản xem trước pull request. **Amplify Gen 2** cho phép bạn định nghĩa backend, như dữ liệu và xác thực, bằng mã TypeScript. Bạn trả tiền theo mức dùng.

Gợi ý: "xây dựng và triển khai nhanh một ứng dụng web hoặc di động mà không phải quản lý máy chủ".

## AWS AppSync: API được quản lý (gợi ý nhanh)

**AWS AppSync** cung cấp các API **GraphQL và Pub/Sub** an toàn, serverless để ứng dụng đọc từ một hay nhiều nguồn dữ liệu qua một endpoint duy nhất và nhận **cập nhật thời gian thực**. Chủ đề triển khai và vận hành dạy chi tiết dịch vụ này. AWS mô tả Amplify là cách xây dựng ứng dụng dùng AppSync và các dịch vụ khác. Đừng chọn AppSync khi câu hỏi cần truyền phát desktop hay ứng dụng; nó là dịch vụ API.

## AWS Device Farm: kiểm thử trên thiết bị thật

**AWS Device Farm** là dịch vụ kiểm thử ứng dụng. Bạn kiểm thử ứng dụng Android, iOS và web trên **điện thoại và máy tính bảng vật lý thật** do AWS lưu trữ. Có hai cách dùng:

- **Remote access**: tương tác với thiết bị thật ngay trong trình duyệt, hoặc chạy bài kiểm thử Appium từ máy của bạn nhắm vào thiết bị đó.
- **Kiểm thử tự động**: tải lên ứng dụng và bài kiểm thử, rồi chạy song song trên nhiều thiết bị trong môi trường được quản lý; bạn nhận báo cáo gồm kết quả, log và ảnh chụp màn hình.

Device Farm chỉ có ở Region US West (Oregon). Gợi ý: "kiểm thử ứng dụng trên nhiều mẫu điện thoại thật" thay vì trình giả lập.

## Tên cũ

**AWS Mobile Hub**, dịch vụ backend di động thời kỳ đầu, đã hết hỗ trợ vào tháng 10 năm 2021; Amplify là hướng đi hiện đại.

## Dịch vụ nào?

| Nhu cầu | Dịch vụ |
| --- | --- |
| Xây dựng và lưu trữ ứng dụng web hoặc di động full-stack | AWS Amplify |
| API GraphQL có cập nhật thời gian thực | AWS AppSync |
| Kiểm thử ứng dụng trên điện thoại và máy tính bảng thật | AWS Device Farm |
| Truyền phát một ứng dụng desktop cho người dùng | Amazon WorkSpaces Applications |

## Ý chính

- Amplify xây dựng, triển khai và lưu trữ ứng dụng web và di động full-stack.
- AppSync cung cấp API GraphQL và thời gian thực được quản lý.
- Device Farm kiểm thử ứng dụng trên thiết bị vật lý thật.

## Nguồn

- [Welcome to AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [What is AWS AppSync?](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html)
- [What is AWS Device Farm?](https://docs.aws.amazon.com/devicefarm/latest/developerguide/welcome.html)
