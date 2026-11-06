---
id: cloud-concepts-right-sizing-and-elasticity
title: Right-sizing, tính co giãn và scaling
required: true
---
## Vì sao cần phân biệt các thuật ngữ này

Nhiều câu hỏi dùng những từ gần nghĩa: scalability, elasticity, agility, high availability. Hiểu chính xác từng từ, và cách gọi tên các hướng scaling, giúp bạn ăn điểm dễ.

## Scalability và elasticity

- **Scalability (khả năng mở rộng)**: hệ thống xử lý được tải tăng (hoặc giảm) bằng cách thêm hoặc bớt tài nguyên.
- **Elasticity (tính co giãn)**: lấy tài nguyên **khi cần và trả lại khi không cần**, thường là tự động, để năng lực bám sát nhu cầu. Elasticity đi theo cả hai chiều, và chính nó giúp tiết kiệm tiền sau giờ cao điểm.

Một hệ thống có thể mở rộng được mà không co giãn (bạn thêm máy chủ bằng tay và không bao giờ bớt đi). Trong đề thi, "lấy tài nguyên khi cần và giải phóng khi không cần nữa" là **elasticity**.

## Các hướng scaling

| Thuật ngữ | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| Scale out (ngang) | Thêm tài nguyên cùng kích cỡ | Từ 4 lên 8 EC2 instance |
| Scale in (ngang) | Bớt tài nguyên | Từ 8 về lại 4 instance |
| Scale up (dọc) | Chuyển sang tài nguyên lớn hơn | Đổi sang loại instance to hơn |
| Scale down (dọc) | Chuyển sang tài nguyên nhỏ hơn | Đổi sang loại instance nhỏ hơn |

Scaling ngang được ưu tiên vì khả năng chịu lỗi: nhiều tài nguyên nhỏ trải trên các Availability Zone nên một sự cố ít ảnh hưởng hơn. Scaling dọc thường cần khởi động lại và chạm trần ở kích cỡ lớn nhất.

## AWS tạo ra tính co giãn thế nào

**Amazon EC2 Auto Scaling** giữ đúng số lượng EC2 instance đang chạy. Bạn tạo Auto Scaling group với kích thước tối thiểu, mong muốn và tối đa; các scaling policy thêm hoặc bớt instance khi nhu cầu đổi, và instance lỗi được thay thế. Dịch vụ này không tính phí riêng: bạn chỉ trả cho tài nguyên nó khởi chạy. Các dịch vụ serverless và được quản lý như **AWS Lambda** và **Amazon DynamoDB** tự co giãn giúp bạn. Elastic Load Balancer chia đều lưu lượng cho các instance trong group.

## Right-sizing

**Right-sizing** là chọn loại, kích cỡ và số lượng tài nguyên đáp ứng nhu cầu kỹ thuật với chi phí thấp nhất. Bạn xem workload thực sự dùng bao nhiêu CPU, bộ nhớ, lưu trữ và mạng, rồi chuyển sang tài nguyên nhỏ hơn hoặc khác loại nếu cái hiện tại phần lớn nhàn rỗi.

- Đây là việc **lặp lại**: mô hình sử dụng thay đổi, AWS ra loại tài nguyên mới và giảm giá.
- Có thể chỉ làm một lần nếu công sức tốn hơn khoản tiết kiệm.
- Dùng số liệu đo được (như metric của Amazon CloudWatch), không đoán. **AWS Compute Optimizer** đưa ra đề xuất right-sizing; dịch vụ này được nói ở chủ đề giá cả và thanh toán.

## Góc nhìn chi phí và bền vững

Elasticity và right-sizing là cách thực hiện cụ thể của trụ cột **Cost Optimization** ("chỉ trả cho phần đã dùng, dừng tài nguyên nhàn rỗi") và cả trụ cột Sustainability ("tối đa hóa mức sử dụng"). Một môi trường phát triển được tắt ngoài giờ làm việc chỉ bị tính khoảng 40 trong 168 giờ mỗi tuần, tiết kiệm khoảng 75%.

## Ý chính

- Elasticity = lấy khi cần, trả khi không cần; scalability = khả năng xử lý thêm tải.
- Scale out/in = ngang; scale up/down = dọc.
- Amazon EC2 Auto Scaling tự thêm và bớt instance, không tính phí riêng.
- Right-sizing khớp kích cỡ tài nguyên với mức dùng thực và được lặp lại theo thời gian.
- Tài nguyên nhàn rỗi, quá cỡ là phát hiện điển hình của tối ưu chi phí.

## Nguồn

- [What is Amazon EC2 Auto Scaling?](https://docs.aws.amazon.com/autoscaling/ec2/userguide/what-is-amazon-ec2-auto-scaling.html)
- [Select the correct resource type, size, and number, Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/select-the-correct-resource-type-size-and-number.html)
- [Cost optimization design principles](https://docs.aws.amazon.com/wellarchitected/latest/framework/cost-dp.html)
