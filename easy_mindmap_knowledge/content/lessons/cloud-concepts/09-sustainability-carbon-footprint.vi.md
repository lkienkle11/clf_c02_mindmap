---
id: cloud-concepts-sustainability-carbon-footprint
title: Tính bền vững và AWS Customer Carbon Footprint Tool
required: false
---
## Trụ cột Sustainability trong thực tế

Trụ cột **Sustainability** nhằm giảm tác động môi trường của workload, chủ yếu bằng cách dùng ít năng lượng và ít tài nguyên hơn cho cùng một kết quả. Các đòn bẩy thực tế:

- **Tối đa hóa mức sử dụng**: hai máy chủ chạy 30% tốn năng lượng hơn một máy chạy 60%, nên hãy right-size và loại bỏ tài nguyên nhàn rỗi.
- **Dùng dịch vụ managed và serverless**: hạ tầng dùng chung do AWS vận hành ở quy mô lớn giúp phần cứng luôn được dùng nhiều. Ví dụ AWS Fargate và AWS Lambda.
- **Tự động co giãn**: Amazon EC2 Auto Scaling điều chỉnh năng lực theo nhu cầu.
- **Tự chuyển dữ liệu ít dùng sang lớp lạnh**: Amazon S3 Lifecycle configuration chuyển dữ liệu hiếm khi truy cập sang lưu trữ lạnh hơn.
- **Áp dụng phần cứng và phần mềm hiệu quả hơn** khi chúng xuất hiện.

## Trách nhiệm chia sẻ về tính bền vững

- **AWS: tính bền vững của đám mây (of the cloud).** Hạ tầng dùng chung hiệu quả, điện và làm mát, quản lý nguồn nước và mua điện tái tạo.
- **Bạn: tính bền vững trong đám mây (in the cloud).** Thiết kế workload dùng tài nguyên hiệu quả, chọn tài nguyên tính toán đúng cỡ và giảm tổng tài nguyên triển khai.

Chuyển workload lên AWS có thể giảm dấu chân môi trường vì AWS vận hành cơ sở hiệu quả với mức sử dụng cao, nhưng hiệu quả của thiết kế của bạn vẫn là trách nhiệm của bạn.

## Vì sao Region và hạ tầng dùng chung quan trọng

Hạ tầng phía sau một Region được nhiều khách hàng dùng chung, giữ mức sử dụng cao và chia sẻ chi phí năng lượng cho điện, làm mát và mạng. Khi độ trễ, chi phí và tuân thủ cho phép, hãy đặt workload ở những Region phù hợp với người dùng thay vì nhân bản ở khắp nơi, và tránh các bản sao nhàn rỗi.

## AWS Customer Carbon Footprint Tool

**AWS Customer Carbon Footprint Tool** cho bạn xem lượng phát thải carbon ước tính từ việc dùng AWS. Hiện nay nó nằm trong AWS Sustainability console, vốn xây dựng trên công cụ trước đó và bổ sung thêm dữ liệu nước và báo cáo. Đề thi vẫn có thể dùng tên cũ "Customer Carbon Footprint Tool". Bạn có thể:

- xem phát thải theo thời gian và chia theo phạm vi (scope), AWS Region và dịch vụ;
- tạo báo cáo hoặc xuất dữ liệu để phân tích hàng loạt;
- xem tổng của cả tổ chức từ management account của AWS Organizations.

Dữ liệu xuất hiện vào tháng sau khi sử dụng, và tài khoản quá mới có thể chưa hiện gì. Hãy nhớ mục đích: nó đo và báo cáo dấu chân của bạn; nó không tự thay đổi kiến trúc giúp bạn.

## Gợi ý khi thi

- "Công cụ nào cho thấy lượng phát thải carbon từ việc dùng AWS?" là AWS Customer Carbon Footprint Tool.
- "Trụ cột nào nói về giảm tác động môi trường?" là Sustainability.
- Trách nhiệm của khách hàng là tính bền vững *trong* đám mây.

## Ý chính

- Trụ cột Sustainability: tối đa hóa mức sử dụng, dùng managed services, giảm tài nguyên nhàn rỗi.
- AWS lo tính bền vững của đám mây; bạn lo tính bền vững trong đám mây.
- Customer Carbon Footprint Tool ước tính phát thải của bạn theo thời gian, Region và dịch vụ.

## Nguồn

- [The shared responsibility model, Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/the-shared-responsibility-model.html)
- [Design principles for sustainability in the cloud](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/design-principles-for-sustainability-in-the-cloud.html)
- [What is AWS Sustainability? (user guide)](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/ccft-overview.html)
