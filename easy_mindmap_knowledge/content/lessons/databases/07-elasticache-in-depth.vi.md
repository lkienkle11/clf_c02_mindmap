---
id: databases-elasticache-in-depth
title: "Amazon ElastiCache chuyên sâu: engine, mẫu caching, lưu phiên và MemoryDB"
required: true
videoQuery: Amazon ElastiCache Valkey Redis OSS vs Memcached caching strategies and MemoryDB explained
---
## Vì sao thêm bộ nhớ đệm

Cơ sở dữ liệu đọc từ lưu trữ trên đĩa, mà những dữ liệu phổ biến thường bị yêu cầu lặp đi lặp lại. **Amazon ElastiCache** là kho dữ liệu và bộ nhớ đệm **trong bộ nhớ (in-memory)** được quản lý. Giữ dữ liệu "nóng" trong bộ nhớ giúp trả lời các yêu cầu lặp lại nhanh hơn và giảm tải cho cơ sở dữ liệu phía sau.

ElastiCache làm việc với ba engine mã nguồn mở: **Valkey**, **Redis OSS** và **Memcached**. Tài liệu cũ và đề thi thường ghi "ElastiCache for Redis"; tài liệu hiện tại gọi các engine này là Redis OSS và Valkey.

## Serverless hay node-based

| | ElastiCache Serverless | Node-based cluster |
| --- | --- | --- |
| Thiết lập | Chỉ cần đặt tên cache; không phải lập kế hoạch instance hay node | Bạn chọn loại node, số node và vị trí đặt theo AZ |
| Dung lượng | ElastiCache theo dõi mức dùng bộ nhớ, tính toán và mạng rồi tự co giãn | Bạn tự tính kích thước cho đúng và đổi khi nhu cầu thay đổi |
| Engine | Valkey, Memcached, Redis OSS | Valkey, Memcached, Redis OSS |
| Phù hợp | Bắt đầu nhanh, nhu cầu thay đổi | Cần kiểm soát chi tiết, ví dụ khi nào áp dụng bản vá |

Trong cả hai trường hợp, AWS lo việc cấp phát phần cứng, giám sát, thay node hỏng và vá phần mềm. Bạn chọn engine, kích thước (với node-based cluster), quyền truy cập mạng và logic ứng dụng sử dụng cache.

## Chọn engine

| | Memcached | Valkey hoặc Redis OSS |
| --- | --- | --- |
| Kiểu dữ liệu | Đơn giản (chuỗi, object) | Phong phú: chuỗi, list, set, sorted set, hash và hơn nữa |
| Sao chép và failover | Không | Có (tự động failover là tùy chọn hoặc bắt buộc, tùy chế độ) |
| Sao lưu và khôi phục (node-based) | Không | Có |
| Đa luồng | Có | Không |
| Pub/Sub, sorted set | Không | Có |
| Lựa chọn điển hình | Object cache đơn giản nhất, mở rộng bằng cách thêm node | Cache cần replica, sao lưu, bảng xếp hạng hoặc nhắn tin |

Quy tắc đơn giản: nếu câu hỏi nhấn mạnh cache **đơn giản nhất** hoặc node nhiều lõi, nghĩ tới Memcached. Nếu cần **replica, sao lưu hoặc cấu trúc dữ liệu phong phú**, nghĩ tới Valkey hoặc Redis OSS.

## Các mẫu caching

- **Lazy loading**: ứng dụng hỏi cache trước. Khi **cache hit**, nó nhận dữ liệu nhanh. Khi **cache miss**, nó đọc cơ sở dữ liệu rồi ghi kết quả vào cache. Chỉ dữ liệu được yêu cầu mới vào cache, nhưng dữ liệu có thể cũ và yêu cầu đầu tiên chậm hơn.
- **Write-through**: mỗi lần ghi vào cơ sở dữ liệu cũng cập nhật cache, nên dữ liệu trong cache luôn mới, nhưng bạn có thể cache cả dữ liệu không bao giờ được đọc.
- **TTL (time to live)**: gán cho mỗi key trong cache một thời hạn để dữ liệu cũ hoặc không dùng tự hết hạn. Kết hợp lazy loading hoặc write-through với TTL là phổ biến.

## Cách dùng điển hình

- **Giảm tải cơ sở dữ liệu**: cache kết quả các truy vấn thường xuyên hoặc tốn kém của RDS, Aurora hay cơ sở dữ liệu khác.
- **Lưu phiên (session store)**: giữ phiên người dùng trong một cache dùng chung để bất kỳ máy chủ web nào sau load balancer cũng phục vụ được bất kỳ người dùng nào. TTL kết thúc các phiên nhàn rỗi.
- **Bảng xếp hạng, bộ đếm và dữ liệu thời gian thực** cần đọc và ghi rất nhanh.

## ElastiCache, DAX và chính cơ sở dữ liệu

| Nhu cầu | Chọn |
| --- | --- |
| Cache phía trước RDS, Aurora hoặc cơ sở dữ liệu bất kỳ | ElastiCache |
| Đọc micro giây riêng cho DynamoDB, ít sửa mã | DynamoDB Accelerator (DAX) |
| Cơ sở dữ liệu chính bền vững với tốc độ in-memory | Amazon MemoryDB |
| Nơi lưu dữ liệu gốc, mở rộng tới tốc độ yêu cầu rất cao | DynamoDB hoặc cơ sở dữ liệu quan hệ |

Cache thường nằm **cạnh** một cơ sở dữ liệu. Nếu câu hỏi cần *kho dữ liệu* mở rộng tới hàng triệu yêu cầu mỗi giây, đáp án đúng hơn là DynamoDB, không phải một cache.

## Amazon MemoryDB

**Amazon MemoryDB** là cơ sở dữ liệu in-memory bền vững, tương thích Valkey và Redis OSS. Nó lưu toàn bộ dữ liệu trong bộ nhớ để đọc ở mức micro giây và ghi ở mức một chữ số mili giây, đồng thời lưu dữ liệu bền vững trên nhiều AZ bằng transactional log Multi-AZ. Chính độ bền này khiến nó có thể là **cơ sở dữ liệu chính** mà không cần quản lý riêng một cache và một cơ sở dữ liệu. Nếu câu hỏi nói "bền vững" và "chính", đó là MemoryDB; nếu nói "cache", đó là ElastiCache. (ElastiCache for Valkey 9.0 trở lên dạng node-based có thể tùy chọn bật [durability](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Durability.Options.html) với transactional log Multi-AZ, nhưng quy tắc khi thi vẫn không đổi.)

## Bẫy thường gặp

- "Giảm tải cho cơ sở dữ liệu RDS bằng cách cache các lần đọc thường xuyên" là **ElastiCache**.
- Cache chỉ giữ một bản sao: hãy mong đợi nó được làm mới hoặc hết hạn, còn cơ sở dữ liệu vẫn là nguồn sự thật.
- ElastiCache cần **thay đổi ứng dụng** (ứng dụng phải kiểm tra cache); DAX chỉ cần thay đổi tối thiểu nhưng chỉ dùng được cho DynamoDB.

## Ý chính

- ElastiCache là bộ nhớ đệm in-memory được quản lý với Valkey, Redis OSS và Memcached, dạng serverless hoặc node-based.
- Memcached đơn giản và đa luồng; Valkey và Redis OSS thêm replica, sao lưu và kiểu dữ liệu phong phú.
- Lazy loading, write-through và TTL là các mẫu caching cốt lõi; lưu phiên và giảm tải truy vấn là cách dùng kinh điển.
- MemoryDB là cơ sở dữ liệu chính in-memory bền vững; DAX là cache chỉ dành cho DynamoDB.

## Nguồn

- [What is Amazon ElastiCache?](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html)
- [Comparing node-based Valkey, Memcached, and Redis OSS clusters](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/SelectEngine.html)
- [What is Amazon MemoryDB?](https://docs.aws.amazon.com/memorydb/latest/devguide/what-is-memorydb.html)
