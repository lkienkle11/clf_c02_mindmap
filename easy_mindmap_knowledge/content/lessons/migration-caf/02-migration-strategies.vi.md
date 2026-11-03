---
id: migration-caf-strategies
title: "7 R: chọn chiến lược di chuyển cho từng ứng dụng"
required: true
---
## Một danh mục, nhiều chiến lược

Một công ty hiếm khi chuyển mọi ứng dụng theo cùng một cách. Khi lập kế hoạch, mỗi ứng dụng được gán một trong bảy **chiến lược di chuyển (migration strategy)**, gọi là **7 R**.

## Bảy chiến lược

- **Retire (loại bỏ)**: tắt hoặc lưu trữ ứng dụng vì nó không còn giá trị kinh doanh. Ví dụ: một công cụ báo cáo không ai mở trong nhiều tháng.
- **Retain (giữ lại)**: tạm giữ ứng dụng ở chỗ cũ, có thể di chuyển sau. Lý do có thể là quy định về nơi lưu trữ dữ liệu, phần cứng vừa được nâng cấp, các phụ thuộc phải chuyển trước, hoặc phần cứng không có tương đương trên đám mây.
- **Rehost ("lift and shift")**: chuyển ứng dụng lên AWS **mà không thay đổi nó**, ví dụ từ một máy chủ tại chỗ sang một Amazon EC2 instance. Cách này nhanh và cho phép hiện đại hóa sau, khi đã ở trên đám mây.
- **Relocate (chuyển vị trí)**: chuyển nhiều máy chủ cùng lúc từ một nền tảng tại chỗ sang **phiên bản đám mây của chính nền tảng đó**, không phải mua phần cứng hay viết lại ứng dụng. Ví dụ: chuyển các workload chạy trên VMware sang một môi trường VMware chạy trên AWS. Chiến lược này cũng bao gồm việc chuyển tài nguyên sang VPC, Region hoặc tài khoản khác.
- **Repurchase ("drop and shop")**: thay ứng dụng bằng một sản phẩm khác, thường là **phần mềm dưới dạng dịch vụ (SaaS)**. Ví dụ: thay CRM tự vận hành bằng một CRM dạng SaaS.
- **Replatform ("lift, tinker and shift" hay "lift and reshape")**: chuyển ứng dụng và thực hiện **một số tối ưu** mà không đổi kiến trúc cốt lõi. Ví dụ: chuyển một cơ sở dữ liệu SQL Server tự quản lý sang **Amazon RDS for SQL Server**.
- **Refactor hoặc re-architect (tái cấu trúc)**: thiết kế lại ứng dụng với **tính năng cloud-native**, như microservice, container hoặc serverless, để có sự linh hoạt, hiệu năng và khả năng mở rộng. Đây là chiến lược phức tạp và tốn kém nhất.

## Bảng từ khóa cho đề thi

| Từ khóa trong tình huống | Chiến lược |
| --- | --- |
| Ngừng sử dụng, không còn cần | Retire |
| Chưa sẵn sàng, tạm thời phải ở lại tại chỗ | Retain |
| Chuyển nguyên trạng, nhanh nhất, không sửa mã | Rehost |
| Cùng nền tảng hypervisor chuyển sang phiên bản đám mây của nó | Relocate |
| Chuyển sang một sản phẩm SaaS | Repurchase |
| Chuyển sang dịch vụ được quản lý với ít thay đổi | Replatform |
| Xây lại thành microservice hoặc serverless | Refactor |

## Bẫy thường gặp

- Rehost và replatform đều chuyển ứng dụng. Nếu tình huống có thêm **dịch vụ được quản lý** hoặc một tối ưu nhỏ, đó là **replatform**.
- Repurchase nghĩa là **mua một sản phẩm khác**; chuyển bản cài có giấy phép của bạn sang EC2 là rehost.
- Với các đợt di chuyển lớn, AWS khuyên rehost, relocate hoặc replatform trước rồi hiện đại hóa sau, vì refactor ngay trong lúc di chuyển rất khó quản lý ở quy mô lớn.

## Ý chính

- 7 R: Retire, Retain, Rehost, Relocate, Repurchase, Replatform, Refactor.
- Rehost = lift and shift; Replatform = lift and reshape; Repurchase = drop and shop.
- Refactor mang lại nhiều lợi ích đám mây nhất nhưng tốn công sức nhất.

## Nguồn

- [About the migration strategies, AWS Prescriptive Guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html)
