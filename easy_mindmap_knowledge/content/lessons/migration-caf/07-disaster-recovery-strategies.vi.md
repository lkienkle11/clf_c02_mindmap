---
id: migration-caf-disaster-recovery-strategies
title: "Chiến lược khôi phục thảm họa: RTO, RPO và bốn hướng tiếp cận trên AWS"
required: true
---
## Vì sao cần kế hoạch khôi phục thảm họa

**Thảm họa** là mọi sự kiện khiến workload không hoạt động được: trung tâm dữ liệu hỏng, sự cố cả Region, lần triển khai lỗi hoặc dữ liệu bị xóa. **Khôi phục thảm họa (disaster recovery, DR)** là kế hoạch và công nghệ đưa workload hoạt động trở lại. AWS khuyên kế hoạch DR nên nằm trong kế hoạch duy trì hoạt động kinh doanh (business continuity plan), và mức đầu tư phải tương xứng với tác động kinh doanh. Hệ thống thanh toán quan trọng cần được bảo vệ nhiều hơn một wiki nội bộ; với một số hệ thống rủi ro thấp, không có DR cũng có thể là quyết định hợp lý.

## Hai con số quyết định mọi thứ

- **Recovery Time Objective (RTO)**: khoảng chờ tối đa chấp nhận được từ lúc dịch vụ gián đoạn đến lúc dịch vụ được khôi phục. Trả lời câu hỏi "chúng ta được phép ngừng hoạt động bao lâu?"
- **Recovery Point Objective (RPO)**: khoảng thời gian tối đa chấp nhận được kể từ điểm khôi phục gần nhất. Trả lời câu hỏi "chúng ta được phép mất bao nhiêu dữ liệu gần đây?"

Hãy nhớ: RTO là **thời gian** để chạy lại, RPO là **thời điểm** của dữ liệu lấy lại được. RTO chặt cần tài nguyên sẵn sàng chạy; RPO chặt cần sao chép dữ liệu thường xuyên hoặc liên tục. Doanh nghiệp đặt ra hai con số này, và phương án khôi phục không nên tốn kém hơn sự cố mà nó bảo vệ, trừ khi có yêu cầu thứ cấp như quy định pháp lý.

## Multi-AZ trước, multi-Region khi cần

Workload sẵn sàng cao trải trên nhiều **Availability Zone** trong một Region đã chịu được việc mất một trung tâm dữ liệu, vì mỗi zone được cô lập khỏi lỗi của các zone khác. Để yên tâm hơn, hãy sao chép dữ liệu và cấu hình sang **Region khác**; khi đó kế hoạch DR chỉ còn là sao lưu và khôi phục. Cách này đã bảo vệ được trước việc mất cả Region, nên bảo vệ liên Region không chỉ có ở các chiến lược sau. Hãy chuyển sang các chiến lược nhanh hơn bên dưới khi thảm họa cần chịu được là mất cả một Region, hoặc khi quy định pháp lý yêu cầu. Các chiến lược này cũng có thể xây bằng Availability Zone khi một quốc gia chỉ có một Region.

## Bốn chiến lược

Whitepaper về DR của AWS mô tả bốn hướng, xếp từ chi phí và độ phức tạp thấp nhất đến cao nhất.

| Chiến lược | Chạy gì ở site khôi phục | Thời gian khôi phục | Chi phí và độ phức tạp |
| --- | --- | --- | --- |
| **Backup and restore** | Chỉ có bản sao lưu dữ liệu, cấu hình, template; mọi thứ được dựng lại sau thảm họa | Dài nhất | Thấp nhất |
| **Pilot light** | Dữ liệu được sao chép, tài nguyên lõi như database luôn bật; máy chủ ứng dụng tắt | Ngắn hơn | Thấp đến vừa |
| **Warm standby** | Bản sao thu nhỏ nhưng hoạt động đầy đủ, phục vụ được lưu lượng ở công suất giảm | Ngắn hơn nữa | Vừa đến cao |
| **Multi-site active/active** | Bản đầy đủ phục vụ người dùng đồng thời ở nhiều Region | Gần bằng không với hầu hết thảm họa | Cao nhất |

Chỉ có thứ tự là lấy từ whitepaper. Thời gian khôi phục thực tế phụ thuộc vào tự động hóa, dung lượng dữ liệu và việc kiểm thử, nên đừng học thuộc con số giờ hay phút.

## Phân biệt hai chiến lược ở giữa

Cả pilot light và warm standby đều giữ một bản workload ở Region khôi phục. **Pilot light chưa xử lý được yêu cầu cho đến khi bạn bật máy chủ và mở rộng**, còn **warm standby xử lý được lưu lượng ngay** ở công suất giảm và chỉ cần mở rộng thêm. Mẹo nhớ: pilot light là ngọn lửa mồi nhỏ có thể châm cả lò; warm standby thì đã "ấm" sẵn.

## Chọn chiến lược

| Tình huống | Lựa chọn thường gặp |
| --- | --- |
| Công cụ nội bộ, chấp nhận ngừng vài giờ và mất một ít dữ liệu | Backup and restore |
| Dữ liệu lõi phải mới, nhưng chấp nhận khởi động thủ công trong thời gian ngắn | Pilot light |
| Hệ thống hướng khách hàng cần khôi phục trong vài phút | Warm standby |
| Hệ thống sống còn, không chịu được gián đoạn nhìn thấy được | Multi-site active/active |

## Các ý hỗ trợ

- **Bản sao lưu** từ các dịch vụ như **AWS Backup** có thể được sao chép sang Region hoặc tài khoản khác (xem chủ đề lưu trữ). Sao lưu bảo vệ trước dữ liệu hỏng hoặc bị xóa; sao chép liên tục một mình có thể sao chép luôn cả lỗi.
- **Hạ tầng dưới dạng mã (infrastructure as code)**, ví dụ **AWS CloudFormation**, giúp dựng lại môi trường nhanh và giống hệt.
- **Amazon Route 53** và **AWS Global Accelerator** có thể chuyển người dùng sang Region khỏe mạnh.
- Kế hoạch DR chưa từng được kiểm thử thì không đáng tin; hãy diễn tập định kỳ.

## Bẫy thường gặp

- RTO nói về **thời gian khôi phục dịch vụ**; RPO nói về **dữ liệu bị mất**. Đừng nhầm hai khái niệm.
- Multi-AZ cho tính sẵn sàng cao trong một Region; nó không bảo vệ trước thảm họa cả Region.
- Chi phí cao hơn không có nghĩa là "tốt hơn" cho mọi workload. Chiến lược đúng là chiến lược rẻ nhất mà vẫn đạt RTO và RPO.

## Ý chính

- RTO = được ngừng bao lâu; RPO = được mất bao nhiêu dữ liệu.
- Bốn chiến lược từ rẻ và chậm nhất đến đắt và nhanh nhất: backup and restore, pilot light, warm standby, multi-site active/active.
- Pilot light cần bật máy chủ; warm standby đã phục vụ lưu lượng ở quy mô nhỏ.
- Chọn chiến lược rẻ nhất vẫn đáp ứng mục tiêu.

## Nguồn

- [Disaster recovery options in the cloud, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html)
- [Business continuity plan and recovery objectives, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/business-continuity-plan-bcp.html)
- [Disaster recovery is different in the cloud, AWS whitepaper](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-is-different-in-the-cloud.html)
