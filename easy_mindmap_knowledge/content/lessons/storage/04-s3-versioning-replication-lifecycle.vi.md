---
id: storage-s3-versioning-replication-lifecycle
title: "Bảo vệ dữ liệu S3: versioning, replication, lifecycle và Object Lock"
required: true
---
## Bốn công cụ, bốn nhiệm vụ

Amazon S3 có nhiều tính năng để bảo vệ và quản lý đối tượng theo thời gian. Đề thi chọn tính năng có nhiệm vụ khớp với câu mô tả.

| Nhu cầu | Tính năng |
| --- | --- |
| Khôi phục sau khi xóa hoặc ghi đè nhầm | **Versioning** |
| Giữ bản sao ở bucket, Region hoặc tài khoản khác | **Replication** (CRR, SRR) |
| Tự động chuyển hoặc xóa đối tượng khi chúng cũ đi | **Lifecycle rule** |
| Làm đối tượng không thể thay đổi trong một thời gian (WORM) | **Object Lock** |

## Versioning

**S3 Versioning** giữ nhiều phiên bản của một đối tượng trong cùng một bucket.

- Mặc định **tắt** và bật theo từng bucket. Một khi đã bật, chỉ có thể **tạm dừng (suspend)**, không bao giờ quay lại trạng thái không versioning.
- Ghi đè tạo phiên bản mới. Xóa thông thường thêm một **delete marker** thay vì xóa dữ liệu, nên bạn có thể khôi phục phiên bản trước. Xóa một version ID cụ thể thì xóa vĩnh viễn.
- Mỗi phiên bản là một đối tượng đầy đủ và bạn trả giá lưu trữ bình thường cho từng phiên bản.
- **MFA delete** thêm yếu tố thứ hai: chủ bucket phải cung cấp mã MFA để xóa vĩnh viễn một phiên bản hoặc đổi trạng thái versioning. Chỉ chủ bucket (tài khoản root) bật được, và không bật được trên console. Không dùng chung được với cấu hình lifecycle.

## Replication

**S3 Replication** sao chép đối tượng tự động và bất đồng bộ giữa các bucket.

- **Cross-Region Replication (CRR)**: bucket nguồn và đích ở **các Region khác nhau**. Lý do: tuân thủ yêu cầu khoảng cách xa, giảm độ trễ cho người dùng ở nơi khác, và có bản sao gần tài nguyên tính toán ở Region khác.
- **Same-Region Replication (SRR)**: hai bucket ở **cùng một Region**. Lý do: gom log vào một bucket, đồng bộ tài khoản production và test, và quy định chủ quyền dữ liệu.
- Cả hai đều cần **bật versioning ở bucket nguồn và bucket đích**.
- Các bucket có thể thuộc tài khoản AWS khác nhau.
- Replication áp dụng cho đối tượng mới và được cập nhật sau khi bạn thiết lập. Để sao chép đối tượng đã có từ trước, dùng **S3 Batch Replication**.
- **S3 Replication Time Control** bổ sung cam kết mức dịch vụ nhân bản 99,99% đối tượng mới trong vòng 15 phút.

Mẹo thi: "tự động sao chép dữ liệu sang bucket ở Region khác" là CRR; "nhiều bản sao trong cùng Region" là SRR. Bản thân replication không phải là sao lưu chống xóa, nên hãy nghĩ đến versioning nữa.

## Lifecycle rule

**S3 Lifecycle configuration** thực hiện các hành động theo lịch:

- **Transition** đối tượng sang storage class rẻ hơn sau một số ngày (ví dụ Standard sang Standard-IA rồi sang Glacier Flexible Retrieval). Bài storage class nói về chính các class.
- **Expire** (xóa) đối tượng sau thời gian lưu giữ.
- Trong bucket có versioning, bạn còn tác động được lên **phiên bản không còn hiện hành (noncurrent)**, ví dụ cho các phiên bản cũ hết hạn sau 90 ngày để kiểm soát chi phí.

Để biết mình đang lưu những gì, **S3 Inventory** tạo báo cáo theo lịch (hằng ngày hoặc hằng tuần) liệt kê các đối tượng và metadata của chúng, nên bạn không cần gọi các API list.

Nhắc lại: lifecycle rule hợp với mẫu truy cập **đã biết, dự đoán được**. Với mẫu **chưa biết hoặc thay đổi**, **S3 Intelligent-Tiering** tự chuyển đối tượng giữa các tầng cho bạn.

## Object Lock và Glacier Vault Lock

**S3 Object Lock** lưu đối tượng theo mô hình **ghi một lần, đọc nhiều lần (WORM)**, ngăn xóa hoặc ghi đè trong một khoảng thời gian cố định hoặc đến khi được gỡ. Nó chỉ hoạt động trên bucket **đã bật versioning**.

| Khái niệm | Ý nghĩa |
| --- | --- |
| **Retention period** | Phiên bản đối tượng bị khóa đến ngày retain-until |
| **Governance mode** | Hầu hết người dùng không xóa được; người có quyền đặc biệt có thể ghi đè. Hợp để thử nghiệm |
| **Compliance mode** | Không ai xóa hoặc rút ngắn thời gian lưu giữ trong kỳ hạn, **kể cả người dùng root** |
| **Legal hold** | Khóa một phiên bản không có ngày hết hạn đến khi ai đó gỡ hold |

Mẹo thi: "WORM", "lưu giữ theo quy định", "không ai, kể cả root, được xóa" chỉ về Object Lock chế độ compliance.

**Glacier Vault Lock** thuộc dịch vụ Amazon Glacier độc lập dùng vault ban đầu. Một Vault Lock policy có thể áp đặt các kiểm soát như WORM, và một khi đã khóa thì không thể sửa hay xóa. Dịch vụ Glacier độc lập đó không còn nhận khách hàng mới; AWS khuyên dùng các S3 Glacier storage class, nơi Object Lock là kiểm soát tương đương. Đề thi cũ vẫn có thể nhắc Vault Lock.

## Bẫy thường gặp

- Replication cần versioning ở cả hai bucket; Object Lock cũng cần versioning.
- Không thể gỡ versioning một khi đã bật, chỉ tạm dừng.
- Xóa đối tượng trong bucket có versioning không xóa sạch; nó thêm delete marker.
- Compliance mode không thể vượt qua; governance mode thì có thể.

## Ý chính

- Versioning bảo vệ khỏi ghi đè và xóa nhầm; MFA delete thêm yếu tố thứ hai cho việc xóa vĩnh viễn.
- CRR sao chép giữa các Region, SRR trong một Region; cả hai đều cần versioning.
- Lifecycle rule chuyển và xóa đối tượng; Intelligent-Tiering lo mẫu truy cập chưa biết.
- Object Lock cho bảo vệ WORM; compliance mode chặn cả người dùng root.

## Nguồn

- [Retaining multiple versions of objects with S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html)
- [Replicating objects within and across Regions](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
- [Locking objects with Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html)
