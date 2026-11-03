# Thiết kế: option "Khi đổi tab" cho đồng hồ + khóa scroll nền khi mở modal

Ngày: 2026-11-03 · Trạng thái: chờ người dùng duyệt

## 1. Mục đích

1. Người dùng muốn tự chọn, trước khi làm bài, đồng hồ cư xử thế nào khi họ đổi tab hoặc minimize cửa sổ:
   - **Đóng băng thời gian**: thời gian vắng mặt không bị tính.
   - **Thời gian tiếp tục trôi**: thời gian vắng mặt vẫn bị tính như bình thường.
2. Sửa lỗi: khi modal đang mở, trang phía sau vẫn cuộn được (thấy rõ ở modal chi tiết lần làm bài trong lịch sử).

## 2. Hiện trạng (đã đọc code)

- `SessionTimer.svelte` chạy một `setInterval` 1 giây, mỗi tick gửi `elapsed` thật cho `PracticeSession.tick`. Không có `visibilitychange`.
- Chế độ `clockMode` hiện có (`freeze`/`run`, nhãn "Khi ứng dụng gặp sự cố"):
  - `freeze`: mỗi tick bị chặn tối đa `FREEZE_MAX_TICK_MS` (3 giây). Đổi tab lâu thì gần như không bị trừ, nhưng đó là hệ quả ngẫu nhiên của việc timer nền bị throttle, không phải hành vi có chủ đích.
  - `run`: tính theo `deadlineAt` tuyệt đối, luôn trôi.
- `PracticeOptions` lưu ở settings (`practice_last_options`). `ClockState` lưu theo cột trong bảng attempts (`clock_mode`, `remaining_ms`, ...), migration `0001_init.sql`.
- `ui/Modal.svelte` là modal dùng chung (Escape, Tab-trap, focus restore, `openStack`) nhưng không khóa scroll của trang. Backdrop chỉ là `fixed inset-0`, nên wheel/touch trên backdrop vẫn cuộn `body`.

## 3. Mục tiêu / không mục tiêu

Mục tiêu
- Option mới "Khi đổi tab" trong màn setup, chỉ hiện khi bài có giới hạn thời gian (giống nhóm "Khi ứng dụng gặp sự cố").
- Hành vi đúng và xác định, độc lập với may rủi của throttle timer nền.
- Lựa chọn được nhớ cho lần sau và được lưu cùng lần làm bài, để resume sau khi đóng app vẫn theo đúng lựa chọn.
- Mọi modal dùng `Modal.svelte` đều khóa scroll nền, không giật layout, và mở nhiều modal chồng nhau vẫn đúng.

Không mục tiêu
- Không đổi nghĩa của `clockMode` (sự cố app / ngủ máy).
- Không thêm cảnh báo "bạn đã rời tab" hay thống kê số lần đổi tab.
- Không chặn người dùng đổi tab.

Chống mục tiêu: lựa chọn "đóng băng" không được tạo ra cách để kéo dài thời gian bằng cách khác (xem 4.3).

## 4. Thiết kế

### 4.1 Dữ liệu
- `PracticeOptions.onHidden: 'freeze' | 'run'` (đặt tên giá trị của tôi). Mặc định `'freeze'` (**quyết định của tôi**: giữ gần nhất với hành vi hiện tại của mặc định; người dùng có thể đổi).
- `parse()` trong `options.ts`: dữ liệu cũ thiếu trường → dùng mặc định, không coi cả object là hỏng.
- `ClockState.onHidden` cùng kiểu; migration `0002` thêm cột `clock_on_hidden TEXT NOT NULL DEFAULT 'freeze' CHECK (...)`. Lần làm bài cũ nhận mặc định.

### 4.2 Hành vi
Theo dõi `document.visibilityState` (sự kiện `visibilitychange`) trong `SessionTimer`. Khi trang chuyển hidden → ghi mốc; khi quay lại → tính `hiddenMs`.

| clockMode | Khi đổi tab = freeze | Khi đổi tab = continue |
|---|---|---|
| `run` | dời `deadlineAt` thêm `hiddenMs` | không làm gì (deadline tuyệt đối) |
| `freeze` | không trừ `hiddenMs` (bỏ phần tick dài) | trừ đủ `hiddenMs`, không bị cap 3 giây |

Hết giờ trong lúc đang ẩn (chế độ continue) → khi quay lại tick đầu tiên tự nộp bài (đường `submit('timeout')` sẵn có).
Logic thuần (tính hiệu chỉnh theo `hiddenMs`) nằm trong `logic/attempt-clock.ts`, test độc lập; `SessionTimer` chỉ nối sự kiện DOM vào đó. Session vẫn không đọc `Date.now`, dùng `services.now()`.

### 4.3 Giới hạn của "đóng băng"
Chỉ phần thời gian trang ở trạng thái hidden được miễn. Nếu cửa sổ vẫn visible (chỉ mất focus, bị che bởi cửa sổ khác) thì đồng hồ vẫn chạy: không có cách đáng tin để phân biệt, và đó là hành vi mong đợi của "đổi tab". Giới hạn này cần ghi rõ trong nhãn/mô tả của option.

### 4.4 UI
Thêm fieldset thứ ba trong `PracticeSetup.svelte` (chỉ khi `timeMode === 'set'`), cùng kiểu radio, hai lựa chọn "Đóng băng thời gian" / "Thời gian tiếp tục trôi". Thêm khóa i18n vi/en (`practice.setup.hiddenLegend`, `...hiddenFreeze`, `...hiddenRun`). Legend dự kiến: "Khi đổi tab hoặc thu nhỏ cửa sổ".

### 4.5 Khóa scroll modal
Trong `Modal.svelte`, bộ đếm modal đang mở ở mức module: modal đầu tiên mở → đặt `overflow: hidden` lên `document.documentElement`/`body` và bù độ rộng scrollbar bằng `padding-right` (tránh nền giật ngang); modal cuối cùng đóng → khôi phục đúng giá trị cũ. Thêm `overscroll-behavior: contain` cho vùng cuộn bên trong modal để cuộn hết nội dung không "xuyên" ra nền. Không đổi API của `Modal`.

## 5. Ràng buộc
Svelte 5 (runes), Tailwind, vitest + testing-library hiện có, Tauri (webview). Cấu trúc thư mục theo `features/practice` hiện tại; không thêm dependency.

## 6. Chưa kiểm chứng (giả định)
`visibilitychange` có bắn trên webview Tauri khi minimize cửa sổ trên macOS (WKWebView) hay không **chưa được xác minh**. Plan phải có bước kiểm tra thủ công trong app thật; nếu không bắn, cần thêm tín hiệu thay thế (ví dụ focus/blur của window hoặc API cửa sổ của Tauri) và quay lại hỏi người dùng.

## 6b. Phạm vi khóa scroll (đã xác minh trong code)
Modal "chi tiết lần làm bài" trong ảnh lỗi là `features/history/ui/AttemptDetail.svelte`, dùng `ui/Modal.svelte`. Các nơi dùng `Modal`: `ReviewPrompts`, `ReviewButton`, `DailyReviewModal`, `AttemptDetail`, `ResumePrompt`, `KnowledgeOverlay`, `PracticeSessionView`. Sửa ở `Modal.svelte` phủ tất cả.

## 6c. Các quyết định tôi tự đặt (đánh dấu "quyết định của tôi")
- `onHidden` chỉ áp dụng cho khoảng ẩn trực tiếp trong một phiên đang chạy. Thời gian app bị đóng giữa chừng vẫn do `clockMode` xử lý như hiện nay; đường resume không thêm logic `onHidden`.
- Mốc "bắt đầu ẩn" **không** lưu xuống DB. Nếu app chết khi đang ẩn, lời hứa "đóng băng" không còn cho khoảng đó.
- Với `clockMode=freeze`: chỉ phần `hiddenMs` được xử lý theo `onHidden` (freeze → bỏ, continue → trừ đủ, không cap); phần còn lại của tick vẫn bị cap 3 giây như cũ.
- Bước đầu tiên trong plan là kiểm tra thủ công `visibilitychange` trong app Tauri trên macOS, làm cổng trước các việc khác; nếu không bắn thì dừng và hỏi lại.

## 6d. Quyết định của người dùng
Máy ngủ làm trang bị ẩn, nên trong lúc trang đang ẩn thì option "Khi đổi tab" thắng chế độ "Khi ứng dụng gặp sự cố": "Đóng băng" cũng bỏ qua thời gian máy ngủ, "Tiếp tục trôi" tính cả thời gian máy ngủ, kể cả khi chế độ sự cố là đồng hồ đứng yên. (Người dùng xác nhận 2026-11-03.)

## 7. Để builder quyết
Tên file/hàm cụ thể, cách đặt tên cột, chi tiết test, thứ tự commit.
