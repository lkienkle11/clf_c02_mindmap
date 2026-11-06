---
id: pricing-billing-organizations-consolidated-billing
title: "AWS Organizations: nhiều tài khoản, OU, SCP và consolidated billing"
required: true
---
## AWS Organizations làm gì

**AWS Organizations** cho phép bạn quản lý tập trung nhiều tài khoản AWS như một môi trường duy nhất. Bạn có thể **tạo tài khoản**, **gom chúng** vào các organizational unit, **áp dụng chính sách** cho từng nhóm, và **thanh toán tất cả bằng một phương thức thanh toán**. Dịch vụ này không tính thêm phí: bạn chỉ trả cho tài nguyên trong các tài khoản.

Thuật ngữ chính:

- **Organization (tổ chức)**: toàn bộ cấu trúc, với một **root** ở trên cùng.
- **Management account (tài khoản quản lý)**: tài khoản đã tạo ra tổ chức. Nó trả phí cho mọi tài khoản còn lại.
- **Member accounts (tài khoản thành viên)**: tất cả các tài khoản khác trong tổ chức.
- **Organizational unit (OU)**: một nhóm tài khoản, ví dụ Production, Development hoặc mỗi đơn vị kinh doanh một OU. OU có thể lồng nhau.

Dấu hiệu kinh điển trong đề: "một hóa đơn cho nhiều tài khoản" nghĩa là **consolidated billing của Organizations**, không phải Cost Explorer hay Budgets, vốn chỉ phân tích hoặc cảnh báo về chi phí.

## Service control policy (tổng quan)

**Service control policy (SCP)** đặt ra **quyền tối đa** mà IAM user và role trong các tài khoản thành viên có thể có, kể cả root user của tài khoản thành viên. Những điểm cần nhớ:

- SCP **không bao giờ cấp** quyền, chỉ giới hạn. Người dùng vẫn cần IAM policy cho phép hành động đó.
- SCP **không ảnh hưởng đến management account**.
- SCP yêu cầu tổ chức bật **all features**. Tổ chức chỉ dùng bộ tính năng consolidated billing thì không dùng được SCP.

SCP là hàng rào cho việc *được làm gì*; chúng không nói gì về việc *bạn trả bao nhiêu*.

## Consolidated billing

Consolidated billing là nửa thanh toán của Organizations:

- **Một hóa đơn** cho mọi tài khoản, do management account thanh toán. Tài khoản thành viên vẫn xem được mức dùng và khoản phí của riêng mình.
- **Gộp mức dùng để hưởng chiết khấu theo khối lượng**: AWS coi các tài khoản như một khi tính giá theo bậc, ví dụ data transfer out và Amazon S3, nên bạn đạt bậc rẻ hơn sớm hơn, rồi AWS phân bổ phần của mỗi tài khoản.
- **Chia sẻ chiết khấu cam kết**: giảm giá của Reserved Instance và Savings Plans mua ở một tài khoản có thể áp dụng cho mức dùng phù hợp ở tài khoản khác. Management account có thể tắt việc chia sẻ này theo từng tài khoản, và AWS lưu ý rằng làm vậy có thể khiến hóa đơn cao hơn.
- **Free Tier chỉ tính một lần**: với các dịch vụ có free tier, AWS áp dụng nó cho tổng mức dùng của cả tổ chức, không áp dụng riêng cho từng tài khoản, nên mở thêm tài khoản không nhân đôi hạn mức miễn phí.
- **Credit có thể được chia sẻ**: credit khuyến mãi của AWS mặc định được chia sẻ trong tổ chức, và management account có thể tắt tính năng này.
- **Không tính thêm phí.**

Hóa đơn **không** phản chiếu cấu trúc OU. Để xem chi phí theo nhóm hoặc dự án ngay trong hóa đơn, hãy dùng **cost allocation tag** (xem bài về công cụ quản lý chi phí).

## Vì sao dùng nhiều hơn một tài khoản

Tài khoản AWS là ranh giới tự nhiên cho quyền truy cập, bảo mật, chi phí và workload. Các lý do phổ biến để dùng nhiều tài khoản:

- **Tách môi trường**: production, test và development có các biện pháp kiểm soát khác nhau.
- **Giới hạn phạm vi ảnh hưởng**: sai sót hoặc sự cố bị xâm nhập ở một tài khoản vẫn nằm gọn trong tài khoản đó.
- **Bảo vệ dữ liệu nhạy cảm** trong tài khoản riêng chỉ cho ít người truy cập.
- **Báo cáo chi phí và chargeback**: tài khoản là đơn vị mặc định để phân bổ chi phí, nên mỗi phòng ban hoặc workload một tài khoản giúp dễ thấy ai chi bao nhiêu.
- **Phân tán quota**: service quota và giới hạn tốc độ API áp dụng theo từng tài khoản.

Một câu hỏi về việc tính phí ngược (chargeback) cho các phòng ban thường hướng đến **nhiều tài khoản cộng với consolidated billing**.

## Những cái bẫy thường gặp

- **Organizations và IAM Identity Center**: Organizations quản lý tài khoản, chính sách và thanh toán; còn đăng nhập vào nhiều tài khoản bằng một bộ thông tin là IAM Identity Center (chủ đề bảo mật).
- **Organizations và Control Tower**: Organizations cung cấp các khối xây dựng; Control Tower bổ sung một cách thiết lập tự động, có định hướng sẵn (bài tiếp theo).
- **Organizations và CloudFormation**: Organizations gom và quản trị tài khoản; CloudFormation triển khai tài nguyên (StackSets có thể triển khai một template tới nhiều tài khoản).
- Consolidated billing **gộp** mức dùng; nó không làm cho data transfer giữa các tài khoản của bạn trở nên miễn phí.

## Ý chính

- Organizations = tạo, gom và quản trị tài khoản với một bên thanh toán; không tính thêm phí.
- Management account trả tiền; các tài khoản thành viên được tính phí qua nó.
- Consolidated billing cho một hóa đơn, chiết khấu khối lượng gộp và chia sẻ giảm giá Reserved Instance, Savings Plans.
- SCP đặt quyền tối đa cho tài khoản thành viên, không bao giờ cấp quyền, và bỏ qua management account.
- Free Tier áp dụng cho cả tổ chức.

## Nguồn

- [What is AWS Organizations?](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html)
- [Consolidating billing for AWS Organizations](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/consolidated-billing.html)
- [Service control policies (SCPs)](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)
