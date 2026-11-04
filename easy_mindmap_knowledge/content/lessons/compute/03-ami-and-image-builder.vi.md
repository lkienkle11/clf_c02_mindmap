---
id: compute-ami-and-image-builder
title: AMI và EC2 Image Builder
required: true
---
## AMI là gì

**Amazon Machine Image (AMI)** là mẫu mà EC2 dùng để khởi động một instance. Nó cung cấp phần mềm cần để máy chủ chạy, thường là hệ điều hành cùng những gì bạn cài thêm, và một **block device mapping** cho biết cần gắn những volume nào. Mỗi lần khởi chạy instance bạn đều phải chọn một AMI, và một AMI có thể tạo ra nhiều instance giống hệt nhau.

Phần cơ bản về AMI nằm trong bài EC2 cơ bản. Bài này đi sâu hơn.

## AMI gắn với những gì

AMI gắn với một **Region**, một hệ điều hành, một kiến trúc bộ xử lý, một loại root volume và một kiểu ảo hóa. Yếu tố Region quan trọng nhất: instance chỉ khởi chạy được từ AMI nằm trong cùng Region.

Đa số AMI là loại **EBS-backed**: root volume được tạo từ một **Amazon EBS snapshot**, tức bản sao lưu tăng dần (incremental) tại một thời điểm của volume, do AWS lưu trữ. Vì vậy tạo AMI từ một instance đang chạy sẽ sinh ra snapshot, và bạn trả phí lưu trữ cho các snapshot nằm sau AMI của mình.

## AMI đến từ đâu

| Nguồn | Mô tả |
| --- | --- |
| Do AWS cung cấp | Image được duy trì sẵn như Amazon Linux và Windows Server |
| Public / cộng đồng | Người khác chia sẻ; hãy kiểm tra ai là người phát hành trước khi tin dùng |
| **AWS Marketplace** | Image từ nhà cung cấp, một số có phí phần mềm riêng |
| Của bạn | Tạo từ một instance bạn đã cấu hình |
| Được chia sẻ cho bạn | Tài khoản khác cấp quyền khởi chạy cho bạn |

**Launch permission** quyết định ai được dùng AMI: **public** (mọi tài khoản), **explicit** (các tài khoản, tổ chức hoặc OU được nêu tên) hoặc **implicit** (chủ sở hữu). Chỉ chủ sở hữu mới đổi được chúng.

## Sao chép và chia sẻ AMI

Để dùng một AMI ở Region khác, hãy **copy** nó sang đó. Bản sao là một AMI riêng trong Region đích và dựa trên các snapshot mới. Launch permission và quyền bucket **không** được sao chép, và chỉ các tag do người dùng tự đặt của bạn được chép theo. Bản thân việc copy miễn phí, nhưng bạn trả phí lưu trữ chuẩn cho các snapshot phát sinh thêm. Bạn cũng có thể chia sẻ AMI cho tài khoản AWS khác mà không cần copy.

AMI và snapshot còn hỗ trợ **khôi phục sau thảm họa** cho EC2. AMI dựng lại được cả một máy chủ cùng cấu hình, còn EBS snapshot chứa mọi thứ cần để khôi phục dữ liệu của volume. Vì AMI có thể copy sang Region thứ hai, bạn có thể khởi chạy lại máy chủ ở đó nếu Region đầu gặp sự cố. Một câu hỏi trong ngân hàng của ứng dụng này chấp nhận AMI và EBS snapshot là hai công cụ khôi phục cho EC2. AWS không tự động sao lưu EBS volume của bạn; tạo snapshot là trách nhiệm của bạn.

Một điểm tinh tế: **user data là thiết lập của instance, không nằm trong AMI**. Instance mới tạo từ AMI của bạn không thừa hưởng user data của instance cũ.

## Golden image và EC2 Image Builder

**Golden AMI** là image bạn đã vá, gia cố và kiểm thử, rồi dùng làm điểm khởi đầu chuẩn cho mọi máy chủ. Tự tay làm thì chậm và dễ sai. **EC2 Image Builder** là dịch vụ AWS được quản lý hoàn toàn để tự động hóa việc này.

Một **image pipeline** gồm:

- **Recipe**: một image gốc cộng các **component** áp lên nó, chẳng hạn cài phần mềm hoặc áp dụng thiết lập bảo mật.
- Các giai đoạn **build** và **test**: Image Builder khởi chạy một instance tạm, áp các build component, rồi kiểm thử kết quả. Nó chỉ phân phối image khi các bài kiểm thử đều đạt.
- **Phân phối**: AMI hoàn chỉnh (hoặc container image) được gửi tới các Region bạn chọn và có thể chia sẻ cho tài khoản khác hoặc một AWS Organization.
- **Lịch chạy**, để image mới tự xuất hiện, chẳng hạn mỗi khi đến kỳ vá lỗi.

Bản thân Image Builder không tính phí. Bạn trả cho các tài nguyên nó dùng, như instance build và snapshot lưu image.

## AMI hay Image Builder?

| Câu hỏi | Đáp án |
| --- | --- |
| Mẫu nào khởi động một instance? | AMI |
| Dịch vụ nào tự động tạo, kiểm thử và phân phối image? | EC2 Image Builder |
| Cái gì lưu bản sao lưu của EBS volume? | EBS snapshot |
| Cần AMI ở Region khác | Copy AMI |

## Bẫy thường gặp khi thi

- Image Builder **tạo** image; AMI chính là image. Câu hỏi về "tạo, kiểm thử và quản lý image tùy chỉnh" hướng tới Image Builder, không phải AWS Elastic Beanstalk.
- AMI không tự sang Region khác. Hãy copy nó.
- Xóa một snapshot chưa chắc chấm dứt mọi chi phí nếu các snapshot khác còn dùng chung dữ liệu đó.

## Ý chính

- AMI khởi động instance và mang tính Regional; copy nó để dùng ở nơi khác.
- AMI loại EBS-backed dựa trên EBS snapshot, và bạn trả phí lưu trữ.
- AMI trên Marketplace có thể kèm phí phần mềm; hãy kiểm tra bên phát hành AMI public.
- EC2 Image Builder tự động hóa build, test và phân phối AMI qua pipeline.

## Nguồn

- [Amazon Machine Images in Amazon EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIs.html)
- [Copy an Amazon EC2 AMI](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/CopyingAMIs.html)
- [What is EC2 Image Builder?](https://docs.aws.amazon.com/imagebuilder/latest/userguide/what-is-image-builder.html)
