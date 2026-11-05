---
id: migration-caf-discovery-and-migration-service
title: "Khám phá và rehost: Application Discovery Service và Application Migration Service"
required: true
---
## Từ việc biết mình có gì đến việc chuyển nó đi

Di chuyển máy chủ gồm hai việc. Trước hết phải biết hiện có gì, nó bận đến đâu và cái nào nói chuyện với cái nào. Sau đó mới sao chép máy chủ lên AWS. Hai dịch vụ ứng với hai việc đó: **AWS Application Discovery Service** và **AWS Application Migration Service**.

## AWS Application Discovery Service

Application Discovery Service thu thập dữ liệu cấu hình, mức sử dụng và hành vi của máy chủ và database on-premises để lập kế hoạch di chuyển. Đây là công cụ **khám phá (discovery)**: nó chỉ đọc thông tin, **không sao chép hay di chuyển** gì cả. Đó là cụm từ then chốt trong các câu thi kiểu "thu thập thông tin nhưng chưa sao chép workload".

Có ba cách thu thập dữ liệu:

| Phương pháp | Cách hoạt động | Thấy được gì |
| --- | --- | --- |
| **Agentless Collector** | Thiết bị ảo triển khai trong VMware vCenter | Hostname, địa chỉ IP và MAC, dung lượng đĩa, CPU, RAM, disk I/O trung bình và đỉnh; thông tin engine database |
| **Discovery Agent** | Cài trên từng máy chủ Windows hoặc Linux, ảo hay vật lý | Như trên cộng hiệu năng chi tiết theo thời gian, tiến trình đang chạy và kết nối mạng |
| **File-based import** | Tải lên tệp kiểm kê | Những gì có trong tệp |

Đây là sự đánh đổi giữa độ rộng và độ sâu. Collector bao quát nhiều VM mà không cần đụng vào từng máy, nhưng không nhìn được bên trong VM để biết tiến trình đang chạy. Agent cho thấy tiến trình và quan hệ phụ thuộc, giúp bạn quyết định máy chủ nào phải chuyển cùng nhau. Dữ liệu khám phá được lưu ở **home Region của Migration Hub** và có thể xuất ra để ước tính chi phí AWS.

**Trạng thái:** AWS đã đóng Application Discovery Service với khách hàng mới từ ngày 7/11/2025. Khách hàng hiện tại vẫn dùng tiếp được, và AWS khuyên dùng **AWS Transform** cho các dự án khám phá mới. Câu hỏi thi vẫn có thể xem nó là đáp án cho kiểm kê và khám phá phụ thuộc.

## AWS Application Migration Service (AWS Transform MGN)

**AWS Application Migration Service** là dịch vụ chính của AWS cho di chuyển **rehost (lift-and-shift)**. Nó đã được đổi tên thành **AWS Transform MGN**, và cả hai tên đều xuất hiện trong tài liệu thi.

Một cuộc di chuyển diễn ra như sau:

1. Cài **AWS Replication Agent** trên từng máy chủ nguồn (vật lý, ảo hoặc ở đám mây khác, Windows hoặc Linux). Với môi trường VMware có thêm tùy chọn không cần agent.
2. Dịch vụ **sao chép liên tục ở mức block** vào một **vùng đệm (staging area)** chi phí thấp trong tài khoản của bạn, trong khi máy nguồn vẫn phục vụ người dùng.
3. Ba template (replication, launch, post-launch) điều khiển cách máy chủ được sao chép, khởi chạy và cấu hình. Máy chủ được nhóm thành ứng dụng và **đợt (wave)**.
4. Bạn khởi chạy **instance thử nghiệm** bao nhiêu lần tùy ý để kiểm tra bản sao mà không ảnh hưởng production.
5. Ở bước **cutover**, bạn khởi chạy các instance chính thức. Thời gian gián đoạn thường chỉ vài phút.
6. Sau đó bạn có thể replatform hoặc refactor, nên rehost là bước đầu nhanh.

Giá: mỗi máy chủ nguồn được miễn phí sao chép 90 ngày (2.160 giờ) kể từ khi cài agent; sau đó tính phí theo giờ sao chép. Bạn luôn trả phí cho tài nguyên AWS bên dưới, như lưu trữ vùng đệm và tài nguyên EC2, EBS của các instance test và cutover.

## Các tên cũ cần nhận ra

- **CloudEndure Migration** và **AWS Server Migration Service (AWS SMS)** là các công cụ trước đây cho cùng mục đích. AWS SMS đã ngừng hoạt động ngày 31/3/2022, và AWS khuyên dùng Application Migration Service làm dịch vụ lift-and-shift chính.
- Trong một số đề thi, dịch vụ còn được gọi bằng tên viết tắt **MGN**.

## Dịch vụ nào cho câu hỏi nào

| Cách hỏi | Đáp án |
| --- | --- |
| Hostname, IP, MAC của máy chủ on-premises | Application Discovery Service |
| Thu thập dữ liệu sử dụng và cấu hình mà chưa sao chép | Application Discovery Service |
| Lift and shift máy chủ vật lý hoặc ảo với vài phút gián đoạn | Application Migration Service |
| Tự động chuyển VM để chạy native trên EC2 | Application Migration Service |
| Di chuyển EC2 instance từ Region này sang Region khác | Application Migration Service |
| Chuyển engine database | AWS DMS (bài truyền dữ liệu) |

## Bẫy thường gặp

- Discovery cho biết cần chuyển gì; nó không chuyển.
- Application Migration Service chuyển **cả máy chủ**; không dành cho riêng tệp hay đổi engine database.
- Migration Service không phải dịch vụ khôi phục thảm họa; hãy dùng Elastic Disaster Recovery cho việc đó.

## Ý chính

- Application Discovery Service = kiểm kê, mức sử dụng và phụ thuộc qua Agentless Collector hoặc Discovery Agent; đóng với khách hàng mới từ 7/11/2025.
- Application Migration Service (nay là AWS Transform MGN) = sao chép liên tục, khởi chạy thử, cutover ngắn.
- 90 ngày sao chép đầu tiên của mỗi máy chủ là miễn phí.
- Tiền thân: CloudEndure Migration và AWS SMS (ngừng ngày 31/3/2022).

## Nguồn

- [What is AWS Application Discovery Service?](https://docs.aws.amazon.com/application-discovery/latest/userguide/what-is-appdiscovery.html)
- [What is AWS Transform MGN?](https://docs.aws.amazon.com/mgn/latest/ug/what-is-application-migration-service.html)
- [AWS Transform MGN FAQ](https://aws.amazon.com/application-migration-service/faqs/)
