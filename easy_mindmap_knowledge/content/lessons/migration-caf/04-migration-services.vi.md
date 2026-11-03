---
id: migration-caf-services
title: "Chuyển workload: AWS Transform MGN, các dịch vụ truyền dữ liệu và đánh giá Well-Architected"
required: true
---
## Rehost máy chủ: AWS Transform MGN

**AWS Transform MGN**, trước đây có tên **AWS Application Migration Service** (MGN), là dịch vụ chính của AWS cho các đợt di chuyển **rehost (lift-and-shift)**. Câu hỏi thi có thể dùng một trong hai tên.

- Nó di chuyển **máy chủ vật lý, máy ảo và máy chủ trên đám mây khác** chạy Windows hoặc Linux lên AWS.
- Nó **sao chép liên tục ở mức block (continuous block-level replication)** từng máy chủ nguồn vào AWS trong khi máy nguồn vẫn phục vụ người dùng.
- Bạn **khởi chạy instance thử nghiệm (test instance)** để kiểm tra bản sao, rồi thực hiện **chuyển đổi chính thức (cutover)** với **thời gian gián đoạn tối thiểu**, thường chỉ vài phút.
- Có thể nhóm máy chủ thành ứng dụng và thành **đợt (wave)** để di chuyển nhiều máy cùng lúc.
- Sau khi chuyển, bạn có thể replatform hoặc refactor trên AWS, nên rehost là bước đầu nhanh trên con đường hiện đại hóa.

## Di chuyển cơ sở dữ liệu và dữ liệu (ôn lại)

- **AWS Database Migration Service (AWS DMS)** di chuyển cơ sở dữ liệu với thời gian gián đoạn tối thiểu, còn **DMS Schema Conversion** hoặc **AWS Schema Conversion Tool (AWS SCT)** chuyển đổi schema cho các đợt di chuyển không đồng nhất (xem chủ đề cơ sở dữ liệu).
- **AWS DataSync** sao chép các tập dữ liệu tệp và object lớn **qua mạng (online)** vào Amazon S3, Amazon EFS hoặc Amazon FSx (xem chủ đề lưu trữ).
- **AWS Transfer Family** cung cấp cho đối tác và khách hàng một endpoint **SFTP, FTPS, FTP hoặc AS2** được quản lý hoàn toàn, lưu tệp vào Amazon S3 hoặc Amazon EFS, nhờ đó quy trình truyền tệp hiện có được chuyển sang mà không phải đổi phần mềm phía client.
- **AWS Snowball Edge** (truyền dữ liệu ngoại tuyến bằng thiết bị gửi qua đường vận chuyển) đã đóng với khách hàng mới; xem chủ đề lưu trữ để biết tình trạng của nó.

## Sau khi chuyển: đánh giá Well-Architected

**AWS Well-Architected Framework** (chủ đề khái niệm điện toán đám mây) đưa ra sáu trụ cột để đánh giá một workload: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization và Sustainability. **AWS Well-Architected Tool** trong console cho phép một nhóm trả lời các câu hỏi của framework cho một workload, xem **vấn đề rủi ro cao (high-risk issue)**, nhận **kế hoạch cải thiện**, và lưu **mốc (milestone)** để theo dõi tiến bộ theo thời gian. Đây là bước kiểm tra tốt ngay sau một đợt di chuyển.

## Dịch vụ nào phù hợp?

| Nhu cầu | Dịch vụ |
| --- | --- |
| Lift and shift hàng trăm máy chủ với vài phút gián đoạn | AWS Transform MGN (Application Migration Service) |
| Chuyển một cơ sở dữ liệu Oracle sang Amazon Aurora | AWS DMS kèm chuyển đổi schema |
| Sao chép các thư mục chia sẻ tệp lên Amazon S3 qua mạng | AWS DataSync |
| Đối tác vẫn tải tệp lên bằng SFTP, nhưng vào S3 | AWS Transfer Family |
| Đánh giá một workload đã di chuyển theo best practice | AWS Well-Architected Tool |

## Bẫy thường gặp

- MGN chuyển **cả máy chủ**; DMS chuyển **cơ sở dữ liệu**; DataSync chuyển **tệp và object**.
- MGN giữ máy nguồn chạy trong lúc sao chép; gián đoạn chỉ xảy ra lúc cutover.
- Well-Architected Tool đánh giá kiến trúc; nó không di chuyển thứ gì cả.

## Ý chính

- AWS Transform MGN (trước đây là Application Migration Service) = rehost máy chủ bằng sao chép liên tục.
- DMS cho cơ sở dữ liệu, DataSync cho tệp, Transfer Family cho SFTP và các giao thức tương tự.
- Đánh giá workload đã di chuyển bằng Well-Architected Tool.

## Nguồn

- [What is AWS Transform MGN?](https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html)
- [What is AWS Transfer Family?](https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html)
- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
