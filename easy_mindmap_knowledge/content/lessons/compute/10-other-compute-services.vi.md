---
id: compute-other-compute-services
title: "Các dịch vụ compute khác: Lightsail, Batch, App Runner, Cloud Map và OpsWorks"
required: false
---
## Tùy chọn: những dịch vụ bạn vẫn có thể gặp

Bài này là tùy chọn. Nó nói về các dịch vụ nhỏ hơn liên quan đến compute, thường xuất hiện trong các câu hỏi kiểu đề thi và tài liệu AWS. Một số đang thay đổi, nên các ghi chú về tình trạng sẵn có rất quan trọng.

## Amazon Lightsail

**Amazon Lightsail** là cách đơn giản nhất để bắt đầu trên AWS. Nó gói máy chủ riêng ảo (instance), container, cơ sở dữ liệu được quản lý, load balancer, lưu trữ, mạng phân phối nội dung và địa chỉ IP tĩnh trong một **mức giá hằng tháng thấp và dễ đoán**. Bạn có thể khởi chạy sẵn một stack WordPress, LAMP hoặc Nginx chỉ với vài cú nhấp chuột. Hãy chọn nó cho website nhỏ, ứng dụng web đơn giản hoặc dự án học tập. Cần toàn quyền kiểm soát và đủ loại instance type thì dùng Amazon EC2. Một dự án Lightsail vẫn có thể kết nối tới các dịch vụ AWS khác qua VPC peering.

## AWS Batch

**AWS Batch** chạy các công việc xử lý theo lô (batch) ở mọi quy mô. Bạn gửi job và AWS Batch cấp phát compute, như EC2 instance (kể cả Spot) hoặc AWS Fargate, rồi lập lịch các job lên đó. Bạn không phải cài hay quản lý phần mềm batch. Nó hợp với mô phỏng, xử lý dữ liệu và những việc chạy đến khi hoàn thành chứ không phục vụ người dùng. Đừng nhầm với AWS Lambda, vốn dành cho các hàm ngắn chạy theo sự kiện.

## AWS App Runner

**AWS App Runner** triển khai ứng dụng web hoặc API trực tiếp từ mã nguồn hoặc container image. Nó build, chạy, cân bằng tải và mở rộng dịch vụ giúp bạn, không cần thiết kế hạ tầng. Một câu hỏi kiểu đề thi về dịch vụ được quản lý có thể build và triển khai container từ mã nguồn sẽ hướng tới App Runner. Lưu ý rằng AWS đã **đóng App Runner với khách hàng mới**. Theo trang availability change của AWS, khách hàng hiện tại vẫn dùng bình thường, kể cả tạo tài nguyên mới, nhưng không có kế hoạch thêm tính năng mới, và AWS khuyên dùng Amazon ECS Express Mode cho người khác. AWS General Reference [xếp nó vào giai đoạn maintenance](https://docs.aws.amazon.com/general/latest/gr/maintenance_services.html) (công bố ngày 31/3/2026), còn release notes của App Runner nêu ngày 30/4/2026 là mốc ngừng nhận khách hàng mới. Hãy nắm khái niệm để thi, nhưng đừng lập dự án mới trên nó.

## AWS Cloud Map

**AWS Cloud Map** là dịch vụ **service discovery** (đăng ký tài nguyên). Ứng dụng thường cần tìm vị trí hiện tại của những thành phần nó phụ thuộc, như cơ sở dữ liệu hoặc một dịch vụ khác có instance lúc có lúc không. Bạn tạo một **namespace** (nhóm cho một ứng dụng), định nghĩa các **service** trong đó và đăng ký từng tài nguyên thành một service instance. Ứng dụng sau đó tra cứu tài nguyên bằng lệnh gọi API hoặc truy vấn DNS với tên dễ nhớ. Khi bật health check, Cloud Map chỉ trả về **tài nguyên khỏe mạnh**. Giá phụ thuộc vào số tài nguyên đã đăng ký và số lần gọi tra cứu.

## AWS OpsWorks

**AWS OpsWorks** từng cung cấp quản lý cấu hình **Chef và Puppet**, tức mô tả phần mềm và thiết lập mong muốn của máy chủ dưới dạng mã. Nó có ba dạng: OpsWorks Stacks, OpsWorks for Chef Automate và OpsWorks for Puppet Enterprise. AWS liệt kê cả ba là **không còn khả dụng**, với ngày hết hỗ trợ là 1 tháng 5 năm 2024. Tài liệu cũ vẫn nhắc đến OpsWorks, nên hãy nhận ra nó, rồi nghĩ đến các lựa chọn thay thế hiện nay: AWS Systems Manager và AWS CloudFormation cho cấu hình và hạ tầng dưới dạng mã.

## Chỉ dẫn sang các chủ đề khác

- **AWS Elastic Beanstalk** triển khai ứng dụng web mà bạn không phải thiết kế hạ tầng. Nó thuộc chủ đề Triển khai và vận hành.
- **AWS Outposts** đưa hạ tầng AWS về trung tâm dữ liệu của bạn. Nó thuộc chủ đề Hạ tầng toàn cầu.

## So sánh

| Nhu cầu | Dịch vụ |
| --- | --- |
| Máy chủ hoặc website đơn giản với giá cố định hằng tháng | Lightsail |
| Chạy số lượng lớn job batch | AWS Batch |
| Triển khai mã hoặc container mà không cần thiết kế hạ tầng | App Runner (đóng với khách hàng mới) |
| Để các ứng dụng tìm nhau theo tên | Cloud Map |
| Quản lý cấu hình Chef hoặc Puppet | OpsWorks (đã ngừng) |

## Ý chính

- Lightsail đổi sự linh hoạt lấy sự đơn giản và giá dễ đoán.
- AWS Batch chạy job, App Runner phục vụ ứng dụng web, Cloud Map tìm tài nguyên.
- App Runner đã đóng với khách hàng mới và OpsWorks đã ngừng hoạt động.

## Nguồn

- [AWS App Runner availability change](https://docs.aws.amazon.com/apprunner/latest/dg/apprunner-availability-change.html)
- [What is AWS Cloud Map?](https://docs.aws.amazon.com/cloud-map/latest/dg/what-is-cloud-map.html)
- [Services in Full Shutdown (OpsWorks)](https://docs.aws.amazon.com/general/latest/gr/full_shutdown_services.html)
