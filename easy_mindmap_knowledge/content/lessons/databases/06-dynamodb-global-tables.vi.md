---
id: databases-dynamodb-global-tables
title: "DynamoDB chuyên sâu: chế độ dung lượng, global table, DAX, TTL và sao lưu"
required: true
videoQuery: Amazon DynamoDB global tables DAX TTL on-demand vs provisioned explained
---
## DynamoDB nằm ở đâu

**Amazon DynamoDB** là cơ sở dữ liệu **NoSQL serverless**, được quản lý hoàn toàn, cho dữ liệu **key-value và document**. Thời gian phản hồi thường ở mức **một chữ số mili giây**, ở hầu như mọi quy mô. Bạn không có máy chủ, hệ điều hành hay phần mềm cơ sở dữ liệu nào để vá, và cũng không có maintenance window. Dữ liệu được lưu trên **ba Availability Zone** trong một Region.

Bạn mô hình hóa dữ liệu thành các **table** gồm các **item** (tương tự hàng) và tìm item bằng **primary key** (partition key, có thể kèm sort key). Các item trong cùng một table không cần có các thuộc tính giống hệt nhau, nên DynamoDB hợp với giỏ hàng, dữ liệu phiên, trạng thái trò chơi, sự kiện IoT và mọi workload truy cập đơn giản theo khóa với khối lượng lớn. Nó không hỗ trợ SQL join, vì vậy hãy thiết kế table xoay quanh những câu hỏi mà ứng dụng sẽ đặt ra.

## Chế độ dung lượng

**Chế độ dung lượng (capacity mode)** quyết định cách bạn bị tính tiền cho thao tác đọc và ghi.

| | On-demand | Provisioned |
| --- | --- | --- |
| Bạn khai báo | Không gì cả; không cần lập kế hoạch dung lượng | Số lần đọc và ghi mỗi giây bạn cần |
| Bạn trả | Theo từng yêu cầu đọc và ghi | Theo giờ cho dung lượng đã cấp phát, dùng hay không |
| Phù hợp | Lưu lượng mới, đột biến hoặc khó đoán | Lưu lượng ổn định, dự đoán được và cần chi phí dễ dự báo |

AWS mô tả on-demand là lựa chọn mặc định và được khuyến nghị cho hầu hết workload, và nó co giãn từ nhỏ đến hàng triệu yêu cầu mỗi giây. Manh mối trong đề như "lưu lượng khó đoán và nhóm không muốn lập kế hoạch dung lượng" chỉ về **on-demand**. "Tải ổn định, dự báo được, kiểm soát chi phí" chỉ về **provisioned**.

## Global table

**DynamoDB global table** tự động sao chép một table sang **các AWS Region bạn chọn**. Chúng là **đa Region và multi-active**: mọi replica đều phục vụ được **cả đọc lẫn ghi**, nên người dùng đọc và ghi ở Region gần nhất, và khi một Region gặp gián đoạn, ứng dụng có thể chuyển lưu lượng sang Region khác. Bạn dùng các API DynamoDB thông thường, nên ứng dụng không cần mã đặc biệt.

- Mặc định các replica **nhất quán cuối cùng (eventually consistent)** với nhau (multi-Region eventual consistency). Cũng có chế độ nhất quán mạnh; bạn chọn chế độ khi tạo table và không đổi được sau đó.
- Nếu hai Region cập nhật cùng một item gần như đồng thời, **bản ghi sau cùng thắng (last writer wins)**.
- Bạn trả tiền theo dung lượng đã dùng, không cam kết trả trước.

Đừng nhầm với **Aurora Global Database**, nơi chỉ một Region nhận thao tác ghi còn các Region khác chỉ đọc.

## DynamoDB Accelerator (DAX)

**DAX** là bộ nhớ đệm trong bộ nhớ (in-memory), được quản lý hoàn toàn và **xây dựng riêng cho DynamoDB**. Nó tương thích API, nên ứng dụng chỉ cần thay đổi tối thiểu để dùng, và có thể giảm thời gian đọc từ vài mili giây xuống **micro giây**. Nó giúp ích cho workload nặng về đọc, việc đọc lặp lại cùng các item "nóng", và các ứng dụng muốn tránh mua thêm dung lượng đọc.

DAX **không** phù hợp với ứng dụng cần **đọc nhất quán mạnh (strongly consistent)**, **nặng về ghi**, hoặc không đọc lại cùng dữ liệu nhiều lần. Để làm bộ nhớ đệm phía trước RDS hoặc cơ sở dữ liệu khác, hãy dùng **ElastiCache**; DAX chỉ làm việc với DynamoDB.

## Time to Live (TTL)

**TTL** cho phép bạn gán cho mỗi item một mốc hết hạn (một số theo Unix epoch tính bằng giây, lưu trong thuộc tính bạn chọn). DynamoDB tự động xóa các item đã hết hạn, thường trong vài ngày sau khi hết hạn, và việc xóa **không tiêu tốn dung lượng ghi**. Dùng nó cho phiên, token tạm, log và mọi thứ nên tự biến mất theo thời gian để giảm chi phí lưu trữ.

## Sao lưu và khôi phục

- **Point-in-time recovery (PITR)** giữ các bản sao lưu liên tục với điểm khôi phục chính xác từng giây trong tối đa **35 ngày**. Bạn khôi phục vào một **table mới**, giúp bảo vệ trước việc ghi hoặc xóa nhầm.
- **On-demand backup** là bản sao lưu đầy đủ bạn tạo khi muốn, ví dụ trước một thay đổi rủi ro.

## Trách nhiệm chia sẻ

AWS vận hành hạ tầng, phần mềm và việc sao chép. DynamoDB **mã hóa mọi dữ liệu khi lưu trữ** và bạn có thể chọn loại khóa (mặc định là khóa do AWS sở hữu, hoặc khóa trong AWS KMS). Bạn chịu trách nhiệm về **ai được truy cập các table** (quyền IAM), thiết kế table, chế độ dung lượng và việc bật các tính năng như PITR.

## Bẫy thường gặp

- "NoSQL serverless với độ trễ một chữ số mili giây ở mọi quy mô" là **DynamoDB**.
- "Đọc micro giây cho DynamoDB" là **DAX**; "bộ nhớ đệm cho RDS" là **ElastiCache**.
- "Người dùng ở nhiều Region phải ghi vào cùng một table" là **global table**.
- "Tự động xóa các item cũ" là **TTL**; "khôi phục sau khi xóa nhầm" là **PITR**.

## Ý chính

- DynamoDB là lưu trữ key-value và document serverless; on-demand là mặc định, provisioned hợp với lưu lượng ổn định.
- Global table là đa Region và multi-active, mỗi replica đều đọc và ghi được.
- DAX là bộ nhớ đệm chỉ dành cho DynamoDB với thời gian đọc micro giây; TTL xóa item hết hạn miễn phí; PITR khôi phục tới bất kỳ giây nào trong 35 ngày gần nhất.
- Bạn quản lý quyền truy cập và thiết kế; AWS quản lý máy chủ, vá lỗi và mã hóa khi lưu trữ.

## Nguồn

- [DynamoDB throughput capacity](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/capacity-mode.html)
- [Global tables: multi-active, multi-Region replication](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html)
- [In-memory acceleration with DynamoDB Accelerator (DAX)](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html)
