---
id: global-infrastructure-region-selection-and-residency
title: Chọn Region, lưu trú dữ liệu và Region opt-in
required: true
videoQuery: how to choose an AWS Region data residency compliance latency
---
## Các Region là những nơi tách biệt

Mỗi **AWS Region** là một vị trí địa lý riêng, có các Availability Zone riêng, bản sao riêng của các dịch vụ theo Region và tài nguyên riêng. Khi bạn tạo một tài nguyên như instance Amazon EC2 hay bucket Amazon S3, bạn chọn Region chứa nó, và tài nguyên đó không xuất hiện ở bất kỳ Region nào khác.

Hai ý rút ra từ đây thường xuất hiện trong đề thi:

- **Tính cô lập**: các Region được thiết kế độc lập, nên sự cố ở một Region không nên lan sang Region khác.
- **Dữ liệu ở nguyên nơi bạn đặt**: với dịch vụ theo Region, nội dung được lưu trong Region bạn chọn. Dữ liệu chỉ rời đi khi chính bạn quyết định sao chép, nhân bản hoặc di chuyển (ví dụ bằng cross-Region replication). AWS không tự chuyển dữ liệu của bạn giữa các Region.

Số lượng Region và Availability Zone hiện tại được AWS công bố trên trang Global Infrastructure và luôn tăng, vì vậy đừng học thuộc con số. Hãy nhớ cấu trúc: một Region gồm nhiều Availability Zone cô lập (ít nhất ba trong các Region công khai).

## Bốn yếu tố khi chọn Region

Khi đề hỏi "công ty nên dùng Region nào?", hãy xét theo thứ tự sau.

| Thứ tự | Yếu tố | Cần kiểm tra | Dấu hiệu trong đề |
| --- | --- | --- | --- |
| 1 | Tuân thủ và lưu trú dữ liệu | Luật, cơ quan quản lý hay hợp đồng có yêu cầu nơi lưu dữ liệu không? | "phải giữ dữ liệu trong nước", "quy định" |
| 2 | Độ trễ | Region gần phần lớn người dùng hoặc hệ thống gọi tới nó đến đâu? | "người dùng ở châu Á", "độ trễ thấp" |
| 3 | Dịch vụ sẵn có | Region có đủ dịch vụ và tính năng workload cần không? | "dịch vụ mới", "tính năng chưa có" |
| 4 | Chi phí | Cùng một tài nguyên có thể có giá khác nhau giữa các Region | "giảm chi phí" |

Tuân thủ là giới hạn cứng, các yếu tố còn lại là sự đánh đổi. Nếu quy định bắt dữ liệu ở lại Liên minh châu Âu thì một Region rẻ hơn ở châu lục khác đơn giản là không được chọn. Sau khi luật loại bớt, bạn còn một danh sách ngắn: chọn Region gần người dùng nhất, kiểm tra dịch vụ có đủ không, rồi mới so sánh giá.

## Lưu trú dữ liệu và chủ quyền dữ liệu

**Lưu trú dữ liệu (data residency)** nghĩa là giữ dữ liệu trong một quốc gia hoặc khu vực cụ thể. Công cụ chính là chọn một Region nằm trong khu vực đó. Vì dữ liệu không rời Region nếu bạn không di chuyển nó, bạn kiểm soát được nơi dữ liệu được lưu. Nhớ góc nhìn trách nhiệm chia sẻ: AWS cung cấp Region và sự cô lập, còn bạn chịu trách nhiệm chọn đúng Region và không sao chép dữ liệu tới nơi vi phạm quy định. Nếu workload bắt buộc chạy ngay trong tòa nhà của bạn thì đáp án không phải là Region mà là một dịch vụ mở rộng như AWS Outposts (xem bài về Local Zones, Wavelength và Outposts).

## Region opt-in

Không phải Region nào cũng mở sẵn cho mọi tài khoản. Các Region ra mắt trước ngày 20/03/2019 được bật tự động. Các Region mới hơn gọi là **Region opt-in** và bị tắt cho tới khi bạn bật trong tài khoản (tự bật, hoặc quản trị viên organization bật cho tài khoản thành viên). Bật hay tắt một Region không mất phí; bạn chỉ trả tiền cho tài nguyên tạo ở đó. Region opt-in chưa bật sẽ không hiện trong console. Tắt một Region không xóa tài nguyên bên trong, và chúng vẫn tiếp tục tính phí.

Doanh nghiệp cũng có thể dùng quyền IAM để kiểm soát ai được dùng Region nào, đây là thực hành quản trị phổ biến.

## Những cái bẫy thường gặp

- "Độ trễ thấp nhất" không thắng "dữ liệu phải ở trong nước".
- Một dịch vụ có ở Region này chưa chắc đã có ở Region khác; hãy xem Regional Services List.
- Tạo tài nguyên ở một Region không tự sao chép nó sang Region thứ hai.
- Region không phải edge location, và Availability Zone nằm trong Region chứ không ngược lại.

## Ý chính

- Các Region được cô lập; dữ liệu của dịch vụ theo Region ở lại Region bạn chọn trừ khi bạn di chuyển nó.
- Chọn theo thứ tự: tuân thủ, độ trễ, dịch vụ sẵn có, chi phí.
- Region opt-in (ra mắt sau 20/03/2019) phải được bật trong tài khoản trước khi dùng, không mất phí bật.
- Đừng học thuộc số lượng Region vì nó thay đổi.

## Nguồn

- [Enable or disable AWS Regions in your account](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-regions.html)
- [AWS Global Infrastructure: Regions and Availability Zones](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
- [AWS Regional Services List](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/)
