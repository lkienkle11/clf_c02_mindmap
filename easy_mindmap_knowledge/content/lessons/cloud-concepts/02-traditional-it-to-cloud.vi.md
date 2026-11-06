---
id: cloud-concepts-traditional-it-to-cloud
title: Từ CNTT truyền thống đến AWS Cloud
required: true
---
## CNTT truyền thống vận hành thế nào

Với mô hình truyền thống (on-premises), công ty tự mua, lắp đặt và vận hành phần cứng trong trung tâm dữ liệu của mình. Mỗi dự án mới thường đi theo cùng một con đường chậm chạp:

1. Ước tính năng lực cần có của ứng dụng, thường là trước nhiều năm.
2. Đặt mua máy chủ, lưu trữ, thiết bị mạng và chờ giao hàng.
3. Lắp tủ rack, đấu dây, cấp điện, cấu hình rồi cài phần mềm.
4. Trả tiền thiết bị ngay từ đầu, dù sau đó có dùng hết hay không.

Mô hình này có ba vấn đề quen thuộc. **Mua sắm mất vài tuần đến vài tháng**, nên ý tưởng phải chờ. **Năng lực chỉ là phỏng đoán**: mua thiếu thì ứng dụng sập lúc cao điểm, mua thừa thì phần cứng đắt tiền nằm không. Và khoản tiền là **chi phí vốn (CapEx)**, bỏ ra trước khi biết dự án có thành công hay không.

## Đám mây thay đổi điều gì

**Điện toán đám mây** là việc cung cấp tài nguyên CNTT theo nhu cầu qua internet, với giá trả theo mức dùng. **AWS Cloud** có một bộ dịch vụ rất rộng, từ điện toán, lưu trữ, cơ sở dữ liệu đến phân tích và học máy, truy cập qua AWS Management Console, dòng lệnh (AWS CLI) hoặc API.

Các đặc điểm thường dùng để mô tả điện toán đám mây (mô tả chung của ngành, không phải danh sách của AWS; các danh sách riêng của AWS, như sáu lợi thế bên dưới, khác với nó):

- **Tự phục vụ theo nhu cầu (on-demand self-service)**: bạn tự tạo tài nguyên trong vài phút, không cần gửi yêu cầu cho nhà cung cấp phần cứng.
- **Truy cập qua mạng rộng rãi**: tài nguyên dùng được qua internet từ nhiều loại thiết bị.
- **Gộp chung tài nguyên và quy mô**: AWS chia sẻ một kho hạ tầng rất lớn cho nhiều khách hàng.
- **Co giãn nhanh**: năng lực tăng giảm theo nhu cầu.
- **Dịch vụ được đo lường**: mức dùng được tính đếm, nên bạn chỉ trả cho phần đã dùng.

## CNTT truyền thống so với đám mây

| Chủ đề | On-premises truyền thống | AWS Cloud |
| --- | --- | --- |
| Loại chi phí | CapEx: mua phần cứng trước | OpEx: dùng bao nhiêu trả bấy nhiêu |
| Thời gian có tài nguyên | Vài tuần đến vài tháng | Vài phút |
| Lập kế hoạch năng lực | Đoán trước mức cao điểm | Co giãn theo nhu cầu thực tế |
| Tài nguyên nhàn rỗi | Vẫn phải trả tiền | Dừng hoặc giải phóng |
| Việc ở trung tâm dữ liệu | Bạn tự lắp, cấp điện, làm mát | AWS lo |
| Tiếp cận quốc gia mới | Xây hoặc thuê cơ sở | Triển khai ở Region khác |

## Mức độ thi: các lợi ích trong một bảng

Câu hỏi về "lợi ích khi chuyển lên AWS" đều quy về sáu lợi thế. Quy đổi nhanh:

- Chi phí ban đầu thấp, trả theo mức dùng: **trade fixed expense for variable expense**.
- Giá đơn vị thấp hơn: **economies of scale**.
- Không phải đoán dung lượng: **stop guessing capacity**.
- Có môi trường mới trong vài phút: **speed and agility**.
- Không phải lo việc trung tâm dữ liệu: **stop spending money on running data centers**.
- Người dùng khắp thế giới: **go global in minutes**.

Không phải câu nào về đám mây cũng là lợi ích. "Chi phí cố định ban đầu" hay "AWS quản lý hệ điều hành khách của bạn" là đáp án sai: bạn vẫn quản lý dữ liệu, quyền truy cập và (với EC2) cả hệ điều hành.

## Ý chính

- CNTT truyền thống cần CapEx ban đầu, mua sắm lâu và năng lực phải đoán.
- Điện toán đám mây là tài nguyên theo nhu cầu qua internet, trả theo mức dùng.
- Tự phục vụ theo nhu cầu cho phép có tài nguyên trong vài phút mà không phải mua phần cứng.
- Mỗi lợi ích của đám mây ứng với một trong sáu lợi thế; hãy học các từ khóa nhận biết.
- Đám mây chuyển chi tiêu từ CapEx sang OpEx nhưng không xóa trách nhiệm của bạn với dữ liệu và cấu hình của mình.

## Nguồn

- [What is cloud computing? (AWS)](https://aws.amazon.com/what-is-cloud-computing/)
- [Six advantages of cloud computing, Overview of Amazon Web Services](https://docs.aws.amazon.com/whitepapers/latest/aws-overview/six-advantages-of-cloud-computing.html)
