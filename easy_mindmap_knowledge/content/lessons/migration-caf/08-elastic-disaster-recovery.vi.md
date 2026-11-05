---
id: migration-caf-elastic-disaster-recovery
title: "AWS Elastic Disaster Recovery: DR chi phí thấp cho máy chủ"
required: true
---
## Đó là gì

**AWS Elastic Disaster Recovery** (AWS DRS) bảo vệ các ứng dụng chạy trên máy chủ bằng cách sao chép liên tục chúng vào AWS, để bạn có thể khởi chạy chúng trên AWS trong vài phút nếu site gốc gặp sự cố. Nguồn có thể là máy chủ vật lý, máy ảo VMware vSphere hoặc Microsoft Hyper-V, máy chủ ở đám mây khác, hoặc instance Amazon EC2 ở Availability Zone hay Region khác.

Đây là cách hiện thực hóa ý tưởng **pilot light** ở bài trước: dữ liệu luôn được sao chép, còn các máy chủ khôi phục kích thước đầy đủ chưa chạy cho đến khi bạn cần.

## Cách hoạt động

1. **Cài AWS Replication Agent** trên từng máy chủ nguồn.
2. Agent thực hiện **sao chép liên tục ở mức block** các ổ đĩa của máy chủ vào một **subnet vùng đệm (staging area)** trong tài khoản AWS của bạn, ở Region bạn chọn.
3. Vùng đệm dùng **lưu trữ giá rẻ và rất ít tài nguyên tính toán** (các máy chủ sao chép nhỏ) để duy trì quá trình sao chép. Nhờ vậy chi phí chờ luôn thấp.
4. Trong hoạt động bình thường, bạn có thể chạy **diễn tập (drill)** để khởi chạy instance khôi phục mà không ảnh hưởng máy nguồn hay làm dừng sao chép.
5. Khi sự cố thật xảy ra, bạn **khởi chạy instance khôi phục**. DRS tự động chuyển đổi máy chủ để chúng khởi động và chạy native trên AWS, dùng trạng thái mới nhất hoặc một **thời điểm (point in time)** trước đó.
6. Khi site gốc được sửa xong, bạn bắt đầu sao chép ngược và **failback**, hoặc cứ tiếp tục chạy trên AWS.

AWS mô tả **RTO** thông thường tính bằng phút (phụ thuộc thời gian khởi động hệ điều hành) và **RPO** thông thường ở mức dưới một giây.

## Giá và trách nhiệm

Giá theo mô hình trả theo mức dùng: bạn trả cho các máy chủ được sao chép và tài nguyên vùng đệm, còn tài nguyên tính toán đầy đủ để khôi phục chỉ tính phí khi bạn chạy drill hoặc khôi phục thật. Nhờ đó không phải trả tiền cho một trung tâm dữ liệu thứ hai ngồi không. Bạn vẫn chịu trách nhiệm chọn Region đích, diễn tập đều đặn, và bảo mật các tài khoản cùng mạng liên quan.

## Trạng thái và tên cũ

AWS Elastic Disaster Recovery là dịch vụ hiện hành của AWS. **CloudEndure Disaster Recovery** là sản phẩm tiền nhiệm; AWS gọi Elastic Disaster Recovery là thế hệ kế tiếp, và CloudEndure Disaster Recovery đã ngừng hoạt động ngày 29/9/2025 (trừ các Region Trung Quốc). FAQ hiện tại của dịch vụ cho biết không có đường nâng cấp, nên việc bảo vệ mới bắt đầu trực tiếp bằng AWS DRS. Nếu tài liệu cũ nhắc CloudEndure, hãy hiểu đó là tiền thân.

## So với các dịch vụ dễ nhầm

| Nhu cầu | Phù hợp nhất |
| --- | --- |
| Khôi phục tệp, volume hoặc database về phiên bản cũ; giữ lịch sử | **AWS Backup** hoặc snapshot (chủ đề lưu trữ) |
| Đưa cả ứng dụng chạy trên máy chủ lên AWS nhanh sau sự cố | **AWS Elastic Disaster Recovery** |
| Chuyển vĩnh viễn máy chủ lên AWS | **AWS Application Migration Service** (bài trước) |
| Giữ bản thu nhỏ của mọi thứ đang chạy ở Region khác | Warm standby tự xây bằng các dịch vụ khác |

Sao lưu và DR bổ trợ cho nhau. Sao lưu giữ các bản lịch sử để lấy lại dữ liệu bị mất hoặc hỏng; DR khôi phục khả năng truy cập ứng dụng sau sự cố.

## DRS và Application Migration Service

Hai dịch vụ dùng chung công nghệ sao chép ở mức block và đều có vùng đệm. Khác biệt chính:

- Migration Service khởi chạy instance **test và cutover** để chuyển hẳn máy chủ; DRS khởi chạy instance **drill và recovery** để bảo vệ máy chủ vẫn ở nguyên chỗ cũ.
- DRS có thể **failback** về môi trường nguồn; Migration Service thì không.
- Một máy chủ không thể chạy đồng thời cả hai agent.

Cách đặt câu hỏi thi rất quan trọng. Câu hỏi hỏi cách chuyển máy chủ hoặc di chuyển EC2 instance giữa các Region có đáp án là **AWS Application Migration Service**, dù AWS lưu ý DRS về mặt kỹ thuật vẫn có thể dùng để migrate khi nó có tính năng mà dịch vụ migration không có. Câu hỏi về khôi phục thảm họa cho máy chủ on-premises thì chỉ về DRS.

## Bẫy thường gặp

- DRS không phải công cụ sao lưu và không thay thế AWS Backup.
- Sao chép chạy liên tục, nhưng bạn chỉ trả tiền cho máy chủ khôi phục lớn khi khởi chạy chúng.
- Dữ liệu được sao chép nằm trong tài khoản AWS của chính bạn.

## Ý chính

- Elastic Disaster Recovery = sao chép block liên tục vào vùng đệm giá rẻ, có drill, recovery và failback.
- Theo AWS, RTO thông thường là vài phút và RPO dưới một giây.
- Nó theo mô hình pilot light; sao lưu dành cho lịch sử, DR dành cho khôi phục dịch vụ nhanh.
- Nó kế nhiệm CloudEndure Disaster Recovery, vốn đã ngừng hoạt động.

## Nguồn

- [What is AWS Elastic Disaster Recovery?](https://docs.aws.amazon.com/drs/latest/userguide/what-is-drs.html)
- [Elastic Disaster Recovery FAQ](https://docs.aws.amazon.com/drs/latest/userguide/FAQ.html)
- [AWS Elastic Disaster Recovery product page](https://aws.amazon.com/disaster-recovery/faqs/)
