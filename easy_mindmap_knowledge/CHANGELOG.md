# Changelog

## 0.3.0

### English
- Practice: a new option "Cho phép hiển thị đáp án" adds a "Hiển thị đáp án" button while you answer. It shows the correct answers in green, your wrong pick in red, the note of each option and the explanation, and you can still change your answer afterwards.
- Checkpoint exams: a new option "Sử dụng quyền trợ giúp" gives you two helps, 3 uses each per attempt: show the correct answer, and remove 2 wrong answers. The remaining uses are shown, and closing the app and resuming does not give them back. Capstone exams stay as strict as the real exam, with no help.
- Answering a question no longer changes the size of its number in the question grid, so nothing jumps around while you take an exam.
- The "Bắt đầu" button is now pinned to the bottom of the practice and exam setup screens, so you no longer scroll down to start.

### Tiếng Việt
- Luyện tập: tùy chọn mới "Cho phép hiển thị đáp án" thêm nút "Hiển thị đáp án" trong lúc làm bài. Nút hiện đáp án đúng màu xanh, đáp án bạn chọn sai màu đỏ, ghi chú của từng đáp án và phần giải thích; bạn vẫn đổi được đáp án sau đó.
- Bài kiểm tra mốc (checkpoint): tùy chọn mới "Sử dụng quyền trợ giúp" cho bạn hai quyền trợ giúp, mỗi quyền 3 lần cho cả bài: hiện đáp án đúng, và loại 2 đáp án sai. Số lượt còn lại được hiển thị; đóng app rồi làm tiếp không được hoàn lại lượt. Bài Capstone vẫn nghiêm ngặt như thi thật, không có trợ giúp.
- Trả lời một câu không còn làm đổi kích thước ô số câu trong lưới câu hỏi, nên giao diện không bị xô lệch khi làm bài.
- Nút "Bắt đầu" giờ được ghim ở đáy các màn hình thiết lập luyện tập và thi, bạn không cần kéo xuống để bắt đầu.

## 0.2.3

### English
- The update window now appears only when you open the app. If a new version comes out while the app is already open, you see a dot on Settings and the update in Settings; the window shows the next time you open the app. "Để sau" still waits for the next version.
- While the app stays open it checks for updates quietly every 6 hours, so the dot appears on its own without visiting Settings.
- Long release notes scroll inside their own area, and the title and the buttons of the update window always stay in view.
- Release builds are faster and stop on their own if a step hangs.

### Tiếng Việt
- Cửa sổ cập nhật giờ chỉ hiện khi bạn mở app. Nếu có phiên bản mới ra khi app đang mở, bạn thấy chấm báo ở Cài đặt và bản cập nhật trong Cài đặt; cửa sổ sẽ hiện ở lần mở app kế tiếp. "Để sau" vẫn đợi đến phiên bản mới tiếp theo.
- Khi app đang mở, app tự kiểm tra cập nhật âm thầm mỗi 6 tiếng, nên chấm báo tự xuất hiện mà không cần vào Cài đặt.
- Ghi chú phát hành dài cuộn trong khung riêng, tiêu đề và các nút của cửa sổ cập nhật luôn nằm trong tầm nhìn.
- Bản phát hành được dựng nhanh hơn và tự dừng nếu một bước bị treo.

## 0.2.2

### English
- Faster releases: the macOS, Windows and Linux builds now run at the same time, so a new version is ready in about half the time.
- No change to the app itself.

### Tiếng Việt
- Phát hành nhanh hơn: bản macOS, Windows và Linux giờ được dựng cùng lúc, nên phiên bản mới sẵn sàng trong khoảng một nửa thời gian.
- Không có thay đổi nào trong chính app.

## 0.2.1

### English
- Fixed: downloading an update could fail ("Tải không thành công") once GitHub's limit for anonymous requests was used up; updates now download from the public release address.
- A small release to try the update notice, the dot on Settings and the release notes shown in the update window.

### Tiếng Việt
- Sửa lỗi: tải bản cập nhật có thể báo "Tải không thành công" khi GitHub hết hạn mức cho yêu cầu ẩn danh; giờ bản cập nhật được tải từ địa chỉ công khai của bản phát hành.
- Bản phát hành nhỏ để thử thông báo cập nhật, chấm báo ở Cài đặt và ghi chú hiện trong cửa sổ cập nhật.

## 0.2.0

### English
- See a startup notice when a new version is available, with release notes in your chosen language.
- Keep track of a pending update with a dot on Settings, even after choosing to update later.
- Read release notes in English and Vietnamese, including the version history in Settings.

### Tiếng Việt
- Nhận thông báo khi khởi động nếu có phiên bản mới, kèm ghi chú phát hành theo ngôn ngữ bạn chọn.
- Theo dõi bản cập nhật đang chờ bằng dấu chấm trên Cài đặt, kể cả sau khi chọn cập nhật sau.
- Đọc ghi chú phát hành bằng tiếng Anh và tiếng Việt, bao gồm lịch sử phiên bản trong Cài đặt.

## 0.1.1

### English
- Bumped the version to test updating from the first release through the in-app update flow.

### Tiếng Việt
- Tăng số phiên bản để kiểm thử việc cập nhật từ bản phát hành đầu tiên qua chức năng cập nhật trong ứng dụng.

## 0.1.0

### English
- First release of AWS CLF-C02 Mindmap, with installers for macOS, Windows, and Linux generated when a release tag is pushed.
- Added in-app updates so users can download and install new versions from the app.
- Separated development and production builds so development work stays independent of the released app.

### Tiếng Việt
- Phát hành AWS CLF-C02 Mindmap lần đầu, với bộ cài cho macOS, Windows và Linux được tạo khi đẩy thẻ phát hành.
- Thêm chức năng cập nhật trong ứng dụng để người dùng tải và cài đặt phiên bản mới ngay từ ứng dụng.
- Tách biệt bản phát triển và bản chính thức để quá trình phát triển độc lập với ứng dụng đã phát hành.
