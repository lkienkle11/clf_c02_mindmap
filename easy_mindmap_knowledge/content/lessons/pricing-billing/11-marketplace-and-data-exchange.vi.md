---
id: pricing-billing-marketplace-and-data-exchange
title: "AWS Marketplace, AWS Data Exchange và credit: sản phẩm bên thứ ba trên hóa đơn AWS"
required: false
---
## AWS Marketplace

**AWS Marketplace** là một danh mục số được tuyển chọn, nơi bạn tìm, mua, triển khai và quản lý **phần mềm, dữ liệu và dịch vụ của bên thứ ba**. Nó liệt kê hàng nghìn sản phẩm thuộc các nhóm như bảo mật, mạng, lưu trữ, học máy và cơ sở dữ liệu. Bất kỳ ai có tài khoản AWS đều có thể là **người mua**, còn nhà cung cấp phần mềm độc lập (ISV), đại lý hoặc cá nhân có thể đăng ký làm **người bán**.

- Sản phẩm có nhiều dạng: **Amazon Machine Image (AMI)** bạn khởi chạy trong tài khoản, gói đăng ký **phần mềm dạng dịch vụ (SaaS)**, stack giao qua CloudFormation, hoặc bộ quy tắc cho AWS WAF.
- Tùy chọn giá gồm dùng thử miễn phí, theo giờ, theo tháng, theo năm, nhiều năm và **bring your own license (BYOL)**. Người bán đặt giá và điều khoản; bạn cũng có thể chấp nhận một **private offer** với giá tùy chỉnh.
- **Việc tính phí nằm trong hóa đơn AWS của bạn.** AWS xử lý thanh toán, khoản phí hiện trên hóa đơn, rồi AWS trả tiền cho người bán. AWS Budgets có thể theo dõi phí Marketplace bằng bộ lọc billing entity.
- Mọi sản phẩm phần mềm đều qua quy trình tuyển chọn.

Dấu hiệu trong đề: "mua một sản phẩm của bên thứ ba", "tường lửa bên thứ ba cài sẵn trên EC2", "một ISV muốn chia sẻ AMI tùy chỉnh cho khách hàng" đều trỏ về **AWS Marketplace**. Nó không phải **License Manager** (theo dõi giấy phép bạn đang có) hay **Resource Access Manager** (chia sẻ tài nguyên của chính bạn giữa các tài khoản của bạn).

## AWS Data Exchange

**AWS Data Exchange** giúp khách hàng AWS tìm, đăng ký và dùng **dữ liệu của bên thứ ba** ở quy mô lớn. Là người đăng ký, bạn quản lý mọi gói đăng ký và data grant ở một nơi, rồi dùng dữ liệu với các dịch vụ phân tích và học máy. Nhà cung cấp có thể xuất bản dữ liệu mà không phải tự xây hạ tầng phân phối.

- Data set có thể được giao dưới dạng **tệp, API, data share của Amazon Redshift, truy cập dữ liệu Amazon S3** và các loại tương tự.
- Sản phẩm dữ liệu được liệt kê trong AWS Marketplace, nên phí đăng ký cũng hiện trên hóa đơn AWS của bạn.
- Các data set công khai từ chương trình **Open Data on AWS** dùng được dù có hay không có tài khoản AWS.

Đừng nhầm với các dịch vụ **di chuyển hoặc biến đổi dữ liệu của chính bạn**, như AWS Glue (tích hợp dữ liệu), AWS DMS (di chuyển cơ sở dữ liệu) hay họ Snow (chuyển vật lý). Data Exchange là để **lấy dữ liệu của tổ chức khác**.

## Credit của AWS

Ngoài Free Tier, AWS có thể tặng **credit khuyến mãi**.

- Credit được áp dụng **tự động** vào hóa đơn cho **các dịch vụ đủ điều kiện** cho đến khi dùng hết hoặc hết hạn. Mỗi credit ghi rõ dịch vụ áp dụng và ngày hết hạn, xem được ở trang **Credits** của console Billing.
- Nếu có nhiều credit, credit sắp hết hạn sớm nhất được dùng trước.
- Trong một tổ chức, credit **mặc định được chia sẻ giữa các tài khoản**; management account có thể tắt việc chia sẻ.

## Ý chính

- AWS Marketplace: danh mục phần mềm bên thứ ba được tuyển chọn (AMI, SaaS và hơn nữa), tính phí trên hóa đơn AWS; có người mua và người bán.
- AWS Data Exchange: đăng ký data set của bên thứ ba, giao qua AWS và được liệt kê trong Marketplace.
- Credit tự động áp dụng cho các khoản phí đủ điều kiện cho đến khi hết hoặc hết hạn.

## Nguồn

- [What is AWS Marketplace?](https://docs.aws.amazon.com/marketplace/latest/buyerguide/what-is-marketplace.html)
- [What is AWS Data Exchange?](https://docs.aws.amazon.com/data-exchange/latest/userguide/what-is.html)
- [Applying AWS credits](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/useconsolidatedbilling-credits.html)
