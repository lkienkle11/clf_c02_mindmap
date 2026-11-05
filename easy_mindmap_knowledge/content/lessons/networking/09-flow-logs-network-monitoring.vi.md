---
id: networking-flow-logs-network-monitoring
title: "Quan sát và lọc lưu lượng mạng: VPC Flow Logs, Traffic Mirroring và AWS Network Firewall"
required: false
---
## Tùy chọn: giám sát và bảo vệ VPC

Bài này không bắt buộc nhưng nói về các dịch vụ hay xuất hiện làm đáp án hoặc đáp án gây nhiễu trong câu hỏi thi.

## VPC Flow Logs

**VPC Flow Logs** ghi lại thông tin về **lưu lượng IP đi tới và đi ra từ các network interface** trong VPC. Bạn có thể tạo flow log cho cả VPC, một subnet hoặc một network interface.

- Bản ghi mô tả các luồng (ví dụ địa chỉ, cổng, giao thức và lưu lượng được chấp nhận hay bị từ chối), không phải nội dung của gói tin.
- Log được đẩy tới **Amazon CloudWatch Logs**, **Amazon S3** hoặc **Amazon Data Firehose**.
- Việc thu thập diễn ra ngoài đường đi của lưu lượng nên không ảnh hưởng thông lượng hay độ trễ mạng.
- Công dụng điển hình: tìm hiểu vì sao lưu lượng bị chặn (ví dụ rule security group quá chặt), theo dõi cái gì đang tới instance và điều tra bảo mật.
- Không phải mọi lưu lượng đều được ghi; ví dụ lưu lượng tới máy chủ DNS của Amazon, DHCP và metadata của instance bị loại trừ.
- Việc đẩy log có tốn phí (thu nhận và lưu trữ log).

Gợi ý khi thi: "ghi thông tin về lưu lượng vào và ra trên network interface trong VPC" là **VPC Flow Logs**, không phải CloudTrail (ghi lại các lệnh gọi API) và không phải metric của CloudWatch.

## Traffic Mirroring

**Traffic Mirroring** sao chép lưu lượng mạng từ một network interface tới các thiết bị bảo mật và giám sát nằm ngoài luồng chính để kiểm tra nội dung, theo dõi mối đe dọa và xử lý sự cố. Flow Logs cho metadata về luồng; mirroring đưa chính các gói tin cho công cụ của bạn. Về giá, xem trang giá của Amazon VPC. Hiếm khi là đáp án đúng, nhưng có xuất hiện trong lựa chọn của một số câu hỏi.

## AWS Network Firewall

**AWS Network Firewall** là **dịch vụ tường lửa mạng có trạng thái, được quản lý, kèm phát hiện và ngăn chặn xâm nhập** cho VPC của bạn. Nó lọc lưu lượng ở ranh giới VPC, gồm lưu lượng từ và tới internet gateway, NAT gateway, VPN hoặc Direct Connect.

- Hỗ trợ rule stateless và stateful, lọc theo tên miền và kiểm tra gói tin sâu.
- AWS quản lý và mở rộng hạ tầng; bạn đặt firewall endpoint trong các subnet riêng và sửa route table để đưa lưu lượng qua chúng.
- Nó kiểm soát lưu lượng từ tầng 3 đến tầng 7 cho cả VPC.
- AWS Firewall Manager có thể quản lý Network Firewall trên nhiều tài khoản.

## Mỗi lớp kiểm soát nằm ở đâu

| Lớp kiểm soát | Bảo vệ | Mức |
| --- | --- | --- |
| Security group | Network interface của tài nguyên | Instance, stateful, chỉ rule cho phép |
| Network ACL | Subnet | Subnet, stateless, cho phép và từ chối |
| AWS Network Firewall | Lưu lượng ở rìa VPC | Tường lửa và IPS được quản lý cho VPC |
| AWS WAF | Ứng dụng web | Yêu cầu web, ví dụ chặn mẫu SQL injection |
| AWS Shield | Tài nguyên bị tấn công DDoS | Chống DDoS (Shield Advanced là bậc trả phí) |

Network Firewall bổ sung cho các lớp này chứ không thay thế chúng, và nó không nhằm chặn tấn công DDoS dạng khối lượng lớn; AWS chỉ tới AWS Shield Advanced cho việc đó.

## CloudWatch và CloudTrail nằm ở đâu

Flow log có thể đổ vào CloudWatch Logs, nhưng bảng điều khiển giám sát, cảnh báo và kiểm toán API thuộc về Amazon CloudWatch và AWS CloudTrail, được nói trong chủ đề Triển khai và vận hành.

## Ý chính

- VPC Flow Logs ghi metadata lưu lượng IP của network interface, tới CloudWatch Logs, S3 hoặc Firehose.
- Traffic Mirroring sao chép chính các gói tin tới công cụ kiểm tra.
- AWS Network Firewall: tường lửa VPC có trạng thái, được quản lý, kèm IPS.
- Security group và NACL vẫn giữ nguyên; WAF bảo vệ ứng dụng web; Shield chống DDoS.

## Nguồn

- [Logging IP traffic using VPC Flow Logs](https://docs.aws.amazon.com/vpc/latest/userguide/flow-logs.html)
- [What is AWS Network Firewall?](https://docs.aws.amazon.com/network-firewall/latest/developerguide/what-is-aws-network-firewall.html)
- [What is Traffic Mirroring?](https://docs.aws.amazon.com/vpc/latest/mirroring/what-is-traffic-mirroring.html)
