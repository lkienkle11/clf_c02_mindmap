# Thiết kế: Capstone (hai bài kiểm tra) và bỏ "Luyện tập" ở Tổng kết

Ngày: 2026-11-18. Trạng thái: bản nháp, chờ người dùng duyệt.
Quy ước: **[Đã chốt]** = người dùng đã nói. **[My call]** = quyết định của agent, cần người dùng xem lại. **[Đã kiểm chứng]** = đối chiếu Exam Guide CLF-C02 chính thức.

## 1. Mục đích

Người học cần một bài tổng duyệt sát đề thi thật CLF-C02 trước khi đi thi. Hiện có một đề 65 câu rút theo tỉ lệ domain, nằm sau nút "Luyện tập" của chủ đề Tổng kết. Thay vào đó, thêm phần **Capstone** gồm hai bài thi riêng, mô phỏng đề thật theo quy chế của AWS. Hai bài giống hệt nhau về cách chạy, chỉ khác tên và ý nghĩa: xong cả hai là đủ. **[Đã chốt]**

## 2. Mục tiêu / không làm / tránh

Mục tiêu:
- Một tầng mới **CAPSTONE** trên lộ trình, nằm sau bài kiểm tra mốc 4 và trước tầng TỔNG KẾT. **[Đã chốt]**
- Hai chủ đề riêng, mỗi chủ đề đúng một bài thi: "Capstone - Bài kiểm tra thứ nhất", "Capstone - Bài kiểm tra thứ hai" (EN: "Capstone - Exam 1", "Capstone - Exam 2"). **[Đã chốt]**
- Bỏ nút "Luyện tập" khỏi chủ đề Tổng kết. **[Đã chốt]**

Không làm:
- Không đổi bài kiểm tra mốc 1 đến 4, không đổi ngưỡng 80% của chủ đề thường và của bài kiểm tra mốc.
- Không viết thêm bài học, không viết thêm câu hỏi.

Tránh (làm xong mà sai):
- Đề không đủ 65 câu hoặc sai tỉ lệ 12/15/17/6; câu không tính điểm lộ ra trong lúc làm bài.
- Có thể làm bài 2 hoặc Tổng kết khi chưa xong bước trước.

## 3. Quy chế bài Capstone **[Đã chốt, Đã kiểm chứng]**

Nguồn: Exam Guide CLF-C02 (AWS), trang chứng chỉ và chính sách "Before Testing" của AWS.

| Mục | Giá trị |
|---|---|
| Số câu | 65 = 50 câu tính điểm + 15 câu không tính điểm |
| Phân bổ 50 câu tính điểm | Khái niệm 24% = 12, Bảo mật 30% = 15, Công nghệ 34% = 17, Thanh toán 12% = 6 |
| 15 câu không tính điểm | Không đánh dấu trong lúc làm bài. **Sau khi nộp, màn xem lại cho biết câu nào không tính điểm.** |
| Ngưỡng đạt | Đúng ít nhất **70% số câu tính điểm** = 35/50. Chỉ tính 50 câu tính điểm. (Đề thật dùng điểm quy đổi 700/1000; ở đây dùng 70% theo chọn của người dùng.) |
| Thời gian | 90 phút; 120 phút khi bật "thêm giờ" (ESL +30). Giữ nguyên `EXAM_MINUTES`, `EXAM_MINUTES_EXTRA`. |
| Câu bỏ trống | Tính là sai, không phạt đoán bừa (giữ cách hiện có). |

Câu hỏi được rút theo thứ tự ưu tiên hiện có (`drawBucket`): chưa gặp, rồi sai nhiều, rồi đã đúng.
15 câu không tính điểm: **[My call]** rút ngẫu nhiên từ phần còn lại của ngân hàng (không trùng 50 câu đã chọn), không cần theo domain. Ngân hàng đủ lớn: Công nghệ 419, Bảo mật 144, Khái niệm 132, Thanh toán 79, cộng 27 câu chưa gán domain.

## 4. Lộ trình và mở khóa **[Đã chốt]**

```
Bài kiểm tra mốc 4
   └─ banner CAPSTONE
        ├─ Capstone - Bài kiểm tra thứ nhất   mở khi đạt mốc 4
        └─ Capstone - Bài kiểm tra thứ hai    mở khi xong bài thứ nhất
   └─ banner TỔNG KẾT
        └─ Tổng kết (các bài học, không còn Luyện tập)   mở khi xong cả hai bài Capstone
```

Một chủ đề Capstone "xong" khi có một lượt thi đã nộp và đạt (70% câu tính điểm). Làm lại được; lượt thi không bị khóa sau khi đạt.

## 5. Các phương án đã xem xét

- **A (đã chọn):** hai chủ đề thật `capstone-exam-1`, `capstone-exam-2` trong tầng mới. Tận dụng dây chuyền mở khóa hiện có (chủ đề chưa xong đầu tiên là "hiện tại", các chủ đề sau bị khóa).
- B: hai nút trên trục như bài kiểm tra mốc. Loại vì trái với yêu cầu "chủ đề riêng".
- C: chủ đề dạng bài thi cấu hình trong `topics.json`. Loại vì tái cấu trúc quá mức cần cho hai bài.

## 6. Thiết kế (theo phương án A)

Nội dung và dữ liệu:
- `content/topics.json`: thêm hai chủ đề `capstone-exam-1` (order 13) và `capstone-exam-2` (order 14), tầng `exam` mới, không có `lessonIds`. Chủ đề `capstone` (Tổng kết) đổi `order` thành 15, giữ nguyên id để không mất lịch sử.
- `src/content/types.ts`: thêm `'exam'` vào `Tier`.
- Banner tầng: chuỗi tên tầng CAPSTONE trong `src/i18n/en.json` và `vi.json`.

Logic:
- `exam/logic/groups.ts`: `checkpointGroups` loại cả tầng `exam` (cùng `capstone`). `gateBefore`: chủ đề `capstone-exam-1` bị chặn bởi nhóm mốc cuối; `capstone-exam-2` do dây chuyền chủ đề; `capstone` do dây chuyền chủ đề.
- `exam/logic/draw-exam.ts`: `drawCapstone` trả về 50 câu có điểm (12/15/17/6) cộng 15 câu không điểm, kèm cờ cho từng câu. Dùng lại `allocate` với `DOMAIN_WEIGHTS` trên 50 thay vì 65.
- `practice/logic/grading.ts`: thêm ngưỡng 70% cho lượt thi Capstone, chỉ tính câu có điểm. Ngưỡng 80% cho phần còn lại giữ nguyên.
- `mindmap/logic/topic-status.ts`: chủ đề `capstone` (Tổng kết) không còn bài luyện tập, nên "xong" khi đã đọc hết bài học bắt buộc. **[My call]**
- Lộ trình (`tree-layout.ts`, `TopicBranch.svelte`, `TreeCanvas.svelte`): chủ đề tầng `exam` không có lá bài học; nút của chủ đề mở thẳng màn thi. Chủ đề `capstone` bỏ lá "Luyện tập".

Lưu trữ:
- Bảng câu hỏi của lượt thi thêm cột `unscored` (mặc định `false`) bằng một migration SQLite mới; kiểm tra trong `persistence/migrations.test.ts`.
- `scorePct` và `passed` của lượt thi Capstone tính trên câu có điểm; `plannedCount` vẫn là 65.

Giao diện thi (`exam/ui/ExamSetup.svelte`, `ExamScreen.svelte`, `practice/ui/PracticeResult.svelte`, màn xem lại):
- `ExamScreen`/`ExamSetup` chọn theo `topicId` Capstone (hiện chỉ có nhánh `capstone`); tiêu đề hiện "Capstone - Bài kiểm tra thứ nhất/thứ hai".
- Kết quả hiện điểm trên 50 câu có điểm, ngưỡng 70%; màn xem lại gắn nhãn "Không tính điểm" cho 15 câu.
- Chuỗi khóa: bài 2 báo cần xong bài 1; Tổng kết báo cần xong cả hai bài Capstone.

## 7. Dữ liệu cũ **[My call]**

- Các lượt thi 65 câu cũ (topicId `capstone`) giữ nguyên trong lịch sử, không xóa, không chuyển sang hai chủ đề mới.
- Người dùng đã đạt bài cũ vẫn phải làm hai bài Capstone mới để mở Tổng kết (đề mới có quy chế khác).

## 7b. Các điểm làm rõ sau bước kiểm tra người xây **[My call]**

1. **Tổng kết "xong"**: chỉ khi cổng đã mở (cả hai bài Capstone xong) **và** đã đọc hết bài học bắt buộc. Chủ đề khóa không mở được bài học, nên không thể "xong" trước khi mở khóa.
2. **Nhận diện lượt thi cũ và mới**: lượt mới lưu `topicId` là `capstone-exam-1` hoặc `capstone-exam-2`; ngưỡng 70% được áp dụng lúc nộp bài theo `topicId` này và ghi vào `passed`, nên lượt cũ (`topicId: 'capstone'`, 80%) không bị chấm lại. `completedTopicIds` bỏ qua lượt `practice` có `topicId: 'capstone'`, để lượt cũ không làm Tổng kết "xong" và không mở khóa hai bài mới.
3. **Nút chủ đề tầng `exam` và làm lại**: nút mở thẳng màn thi (`ExamSetup`); "làm lại" cũng mở màn này và rút lại đề 50 + 15 theo cùng quy tắc. Chủ đề tầng `exam` coi như có câu hỏi (`hasQuestions` = true).
4. **Lịch sử rút câu**: 15 câu không tính điểm vẫn được tính là "đã gặp" để lần sau xoay vòng câu khác; chúng không cập nhật thống kê ôn tập (`QuestionStat`) vì không tính điểm.
5. **Câu chưa gán domain** (27 câu): chỉ dùng cho 50 câu có điểm khi một domain thiếu câu, như `drawCapstone` hiện tại; 15 câu không điểm có thể lấy từ đây.

## 8. Kiểm thử

- Đơn vị: đề 65 câu đúng 12/15/17/6 + 15; ngưỡng 70% trên 50 câu có điểm (34/50 trượt, 35/50 đạt); câu không điểm không ảnh hưởng điểm.
- Mở khóa: bài 1 khóa tới khi đạt mốc 4; bài 2 khóa tới khi đạt bài 1; Tổng kết khóa tới khi xong cả hai.
- Lộ trình: có banner CAPSTONE, hai nhánh chủ đề, Tổng kết không còn "Luyện tập".
- Migration: dữ liệu cũ vẫn đọc được, cột mới mặc định `false`.
- Toàn bộ bộ test hiện có vẫn xanh.

## 9. Việc để người xây quyết định

Tên khóa i18n, đặt tên file test, cách hiển thị nhãn "Không tính điểm" trong màn xem lại.
