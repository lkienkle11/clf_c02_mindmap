# AWS CLF-C02 Mindmap Learning App — Thiết kế

Ngày: 2026-11-02. Trạng thái: **bản nháp chờ người dùng duyệt**.
Quy ước: mục nào ghi **(my call)** là do tôi (agent) tự quyết, người dùng chưa xác nhận. Mục ghi **(đã chốt)** là người dùng đã nói rõ.

## 1. Ý định và lý do

Người dùng đã export 672 câu hỏi sang Knowt để làm flashcard, nhưng kiến thức còn "lỡ cỡ": lúc chọn đúng lúc chọn sai, chưa tự tin. Họ muốn học lại AWS từ nhập môn lên nâng cao theo kiểu tư duy mindmap giống roadmap.sh. App đưa ra một lộ trình học có thứ tự, có kiểm tra, có ôn tập, để xây lại kiến thức chắc chắn cho kỳ thi AWS Certified Cloud Practitioner (CLF-C02).

Thành công trông như thế nào: người dùng mở app là biết mình đang ở đâu trên lộ trình, học từng chủ đề theo thứ tự, qua bài thực hành thì mở chủ đề tiếp theo, và kiến thức cũ được nhắc lại đúng lúc trước khi quên.

## 2. Goals, non-goals, anti-goals

**Goals (đã chốt)**
- Lộ trình học theo chương: nhập môn → nâng cao → chủ đề tổng hợp.
- Giao diện cây kiến thức (thân dọc, cành là chủ đề, lá bài học kiểu xương cá) với dòng nước thể hiện tiến trình.
- Mỗi chủ đề có lý thuyết cô đọng, link YouTube tùy chọn, và bài thực hành trắc nghiệm (một đáp án, nhiều đáp án).
- Lưu lịch sử làm bài đầy đủ, thống kê tiến bộ, ôn tập ngắt quãng.
- Chạy trên máy người dùng như app desktop thật, dữ liệu lưu cục bộ.

**Non-goals**
- Không có tài khoản, đăng nhập, đồng bộ đám mây, hay nhiều người dùng.
- Không bản mobile.
- Không chạy kiểm tra Windows/Linux thật (chỉ viết workflow CI), xem mục 9.
- Không chứng minh hay kiểm chứng lại đáp án trong bộ 672 câu (người dùng coi đáp án đó dùng được).

**Anti-goals (làm đúng kỹ thuật nhưng vẫn là thất bại)**
- Một app trông như danh sách bài kiểm tra chứ không phải lộ trình học có thứ tự.
- Làm phiền người dùng bằng nhiều modal hoặc phạt họ khi tự ôn lại.
- Mất bài đang làm dở vì app crash.

## 3. Ràng buộc

- **Đã chốt:** Tauri (không phải webapp localhost), Svelte 5, Tailwind 4, SQLite lưu tiến trình, mọi code nằm trong `easy_mindmap_knowledge/` với cấu trúc thư mục và refactor bài bản.
- **Đã chốt:** i18n tiếng Anh và tiếng Việt cho giao diện. Câu hỏi thực hành **bắt buộc tiếng Anh**.
- **Đã chốt:** build và chạy thật trên macOS; Windows/Linux chỉ có workflow CI.
- **Đã chốt:** câu tự soạn tối thiểu 5, tối đa 10 mỗi chủ đề, có giải thích.
- Công cụ: Rust ≥ 1.90 (máy có 1.99.1 qua rustup), dùng `npm`/`npx tauri`, không dùng `pnpm tauri` (lỗi chặn build scripts).
- Theo CLAUDE.md của repo: commit `type(scope): description` kèm 4 mục Scope / What did / Reviewed / Tested, không có dòng đồng tác giả hay ghi AI.

## 4. Giao diện và hành vi (đã chốt qua mockup)

Mockup lưu ở `.superpowers/brainstorm/` (thư mục bị gitignore): `mindmap-tree`, `leaf-styles`, `trunk-water-progress`, `progress-cases`, `interactive-demo`, `quiz-review-demo`, `review-history-screens`.

### 4.1 Cây kiến thức
- Thân dọc, đọc từ trên xuống. Các mốc cấp độ trên thân: Introduction, Core, Advanced, Capstone.
- Mỗi chủ đề là một cành xen kẽ trái và phải. Lá bài học xếp **kiểu xương cá** dọc theo cành, so le trên dưới, từ gần thân ra xa theo thứ tự bài. Nút **Thực hành** nằm ở cuối xương cá.
- Màu: xanh lá = đã qua, xanh dương = chủ đề sẽ học tiếp (đậm hơn khi hover), bạc + ổ khóa = chưa mở. Lá nét đứt ▶ = video tùy chọn.
- Chỉ chủ đề đang học tự mở xương cá. Chủ đề đã xong và chủ đề khóa thu gọn, hiện số bài. Bấm vào chủ đề để mở hoặc thu gọn.
- **Dòng nước tiến trình:** nước chảy từ gốc xuống thân, rẽ vào cành chủ đề đang học và chạy dọc xương cá, dừng ở bài đang học. Hết bài bắt buộc thì nước dừng ở nút Thực hành. Chỉ khi đạt ≥ ngưỡng thì nước chảy về thân và xuống chủ đề kế tiếp.
- Hover chủ đề khóa hiện gợi ý "Cần đạt trên 80% ở <chủ đề trước> để mở".
- Tôn trọng `prefers-reduced-motion`: nước đứng yên, không nhấp nháy.

### 4.2 Bài học
- Bấm một lá mở panel: lý thuyết cô đọng, link YouTube (tùy chọn, không chặn), nút "Đánh dấu hoàn thành".
- Phải đánh dấu hết các bài **bắt buộc** thì nút Thực hành mới mở. Video không bắt buộc.
- Xem lại bài đã đọc bất cứ lúc nào, không ảnh hưởng tiến trình hay điểm.

### 4.3 Thực hành
- Chọn trước khi vào: (a) Cho phép / Không cho phép xem lại kiến thức cũ; (b) Set thời gian (phút + giây) / Không set; (c) nếu có set giờ: khi app gặp sự cố, đồng hồ **đứng yên** hay **tiếp tục chạy** (mặc định: đứng yên).
- Hết giờ thì tự nộp toàn bộ. Không set giờ thì chỉ có nút Submit. Có set giờ vẫn có nút Submit để nộp sớm.
- Chế độ cho phép xem lại: có nút "Xem lại kiến thức" mở lý thuyết ngay trong bài, **đồng hồ vẫn chạy** (đã chốt).
- Chế độ không cho phép: nút bị tắt, không mở được lý thuyết cho tới khi nộp bài.
- Nút "Thoát" trong bài: hộp xác nhận, thoát thì lượt bị bỏ (không lưu điểm, không lưu câu đã chọn). Đây là cách duy nhất để bỏ lượt.
- Tắt app đột ngột / crash: lượt đang làm được giữ. Lần mở sau hiện "Bạn có bài đang làm dở. Tiếp tục không?" Tiếp tục thì khôi phục y nguyên bộ câu, thứ tự câu, thứ tự đáp án và đáp án đã chọn. Chọn bỏ thì bắt đầu lượt mới và bốc lại từ đầu.
- Xáo thứ tự câu hỏi và thứ tự đáp án, **chốt một lần lúc bắt đầu lượt** và lưu cùng lượt. Câu có đáp án phụ thuộc vị trí ("All of the above", "Both A and B", nhắc chữ cái đáp án) giữ nguyên thứ tự đáp án; tự phát hiện khi nhập dữ liệu **(my call)**.
- Chấm: câu một đáp án đúng khi chọn đúng đáp án; câu nhiều đáp án đúng khi chọn đúng toàn bộ tập đáp án, không chấm điểm từng phần **(my call)**.
- Kết quả: hiện đáp án đúng, câu mình chọn và giải thích.

### 4.4 Mở khóa và trạng thái
- Chủ đề **hoàn thành** khi có ít nhất một lượt thực hành đã nộp đạt ngưỡng. Ngưỡng: từ 80% trở lên (đã chốt "trên 80%", tôi hiểu là gồm cả đúng 80%: **my call**).
- Chủ đề tiếp theo mở khi chủ đề trước hoàn thành. Chưa đạt thì chủ đề giữ xanh dương và chủ đề sau vẫn khóa.
- **Làm lại chủ đề cũ:** được, từ menu chủ đề (Làm lại bài thực hành / Xem lại bài học / Lịch sử). Làm lại **không** đổi màu xanh lá và không khóa lại chủ đề sau, dù điểm thấp (đã chốt). Điểm thấp chỉ vào lịch sử và huy hiệu "cần ôn".
- Chỉ lượt thực hành mới tính cho hoàn thành. Lượt ôn tập không tính.

### 4.5 Ôn tập ngắt quãng
- **Huy hiệu "cần ôn"** trên chủ đề đã hoàn thành có câu đến hạn ôn (kèm số ngày chưa ôn). Không đổi màu xanh lá (đã chốt).
- **Một modal duy nhất mỗi ngày** khi mở app, nếu có câu đến hạn. Không bao giờ hiện modal thứ hai (đã chốt hướng này). Nội dung: dòng tóm tắt ("N chủ đề · M câu đến hạn"), danh sách chủ đề xếp theo mức quên giảm dần (ô tick, mức 🔴 gấp / 🟡 nên ôn, số ngày chưa ôn, số câu đến hạn), gọn lại khi dài (~5 dòng đầu + "+ K chủ đề khác"), và lựa chọn độ dài: **Đầy đủ** (mặc định, phủ mọi chủ đề), **Nhanh** (~15 câu, chủ đề quên nhiều nhất), **Tùy chọn** (tick chủ đề). Ba nút: Ôn ngay / Để sau / Đừng hỏi hôm nay.
- **Bài ôn tập:** trộn câu từ các chủ đề được chọn, ưu tiên câu từng sai và câu lâu chưa gặp. Mỗi chủ đề được ít nhất 2 câu. Chia thành **lô 15 câu** trong cùng một phiên: xong lô hiện kết quả lô và nút "Ôn tiếp lô sau (còn N câu)" / "Dừng ở đây". Dừng giữa chừng thì câu đã ôn đã được cập nhật lịch, phần còn lại giữ huy hiệu và modal hôm sau tóm tắt lại phần tồn.
- Thiếu câu đến hạn (dưới 8): bổ sung câu chưa đến hạn từ cùng các chủ đề cho đủ tối thiểu 8 câu, hoặc lấy hết nếu chủ đề có ít hơn. Không có câu đến hạn thì không hiện modal.
- Bài ôn tập chỉ gợi nhớ và phủ độ rộng, không phải đo toàn diện một chủ đề. Muốn kiểm tra kỹ thì dùng bài thực hành đầy đủ.
- Các hằng số trên (lô 15, tối thiểu 2 câu/chủ đề, tối thiểu 8 câu) là **my call**.

### 4.6 Lịch sử và thống kê
Màn riêng: biểu đồ điểm theo lượt với đường ngưỡng 80%, bảng các lượt (ngày, điểm, chế độ), chủ đề cần chú ý, câu hay sai nhất. Từng lượt xem lại được từng câu đúng/sai.

## 5. Mô hình dữ liệu (SQLite)

Nguyên tắc: CSDL chỉ lưu những gì người dùng làm. Nội dung học (chủ đề, bài học, câu hỏi) nằm trong file đi kèm app với id cố định. Trạng thái màu của chủ đề, huy hiệu "cần ôn" được **tính ra**, không lưu riêng.

| Bảng | Cột chính |
|---|---|
| `lesson_progress` | `lesson_id` (PK), `read_at` |
| `attempts` | `id`, `kind` (`practice`/`review`), `topic_id` (rỗng với ôn tập nhiều chủ đề), `status` (`in_progress`/`submitted`), `started_at`, `submitted_at`, `submit_reason` (`manual`/`timeout`), `review_allowed`, `time_limit_ms` (rỗng nếu không đặt giờ), `clock_mode` (`freeze`/`run`), `remaining_ms`, `deadline_at`, `heartbeat_at`, `score_pct`, `passed` |
| `attempt_questions` | `attempt_id`, `position`, `question_id`, `option_order` (JSON), `selected` (JSON), `is_correct` |
| `question_stats` | `question_id` (PK), `topic_id` (chủ đề gốc của câu; câu Capstone vẫn mang chủ đề gốc của nó), `box`, `due_at`, `times_seen`, `times_correct`, `last_seen_at`, `last_correct` |
| `settings` | `key`, `value` (ngôn ngữ, lựa chọn gần nhất ở màn trước khi làm bài, `review_prompt_dismissed_date`) |

Ghi chú:
- Lượt bị bỏ (nút Thoát) bị xóa khỏi CSDL. Lượt `in_progress` do crash được giữ.
- Đồng hồ `freeze`: ghi `remaining_ms` định kỳ (khoảng 5 giây, `heartbeat_at`); sai lệch khi crash tối đa vài giây. Đồng hồ `run`: dựa vào `deadline_at` theo giờ thật; mở lại sau hạn thì tự nộp với những câu đã làm.
- `question_stats` chỉ cập nhật khi lượt được nộp. Lịch ôn: dạng Leitner đơn giản với các khoảng 1, 3, 7, 14, 30, 60 ngày; đúng thì lên một hộp, sai thì về hộp đầu, đến hạn sau 1 ngày **(my call, thay được bằng FSRS về sau, đặt sau một giao diện)**.
- Migration viết bằng Rust (`add_migrations`), chạy khi `Database.load()` hoặc `plugins.sql.preload`. File DB nằm trong thư mục `AppConfig` của Tauri.

### 5.1 Quy tắc bổ sung (builder check, đều là my call)
- **Nguồn câu cho ôn tập:** chỉ các câu đã xuất hiện trong lượt đã nộp và thuộc chủ đề **đã hoàn thành**. Mỗi câu có đúng một chủ đề gốc (`topic_id`) nên huy hiệu "cần ôn", hạn mức 2 câu mỗi chủ đề và danh sách trong modal đều tính theo chủ đề gốc, kể cả câu được hỏi trong Capstone. Câu Capstone không gán được chủ đề gốc (card không phân loại được) thì thuộc nhóm "Tổng hợp" và không tạo huy hiệu riêng.
- **Modal ôn tập:** hiện **tối đa một lần mỗi ngày lịch**, lưu ngày hiện gần nhất (`review_prompt_last_shown_date`). Cả ba nút đều không cho nó hiện lại trong ngày. "Để sau" để lại nút "Ôn tập (N)" cố định trên màn chính; "Đừng hỏi hôm nay" ẩn luôn nút đó trong ngày. Nút "Ôn tập" luôn có ở màn chính để bấm lúc nào cũng được.
- **Capstone** là cổng thứ 13: mở sau khi chủ đề 12 hoàn thành. Kho câu nhỏ hơn số câu cần (10 hoặc 30) thì lấy hết các câu có. Câu nhập và câu tự soạn được trộn khi bốc.
- **"Xong trên macOS"** nghĩa là chạy được bằng `tauri dev` và build ra file `.app` không ký, không notarize. Thư mục `easy_mindmap_knowledge/` hiện chưa có code nào.

## 6. Nội dung

**Phạm vi bàn giao (đã chốt):** đủ nội dung cho **cả 13 chủ đề**: bài học song ngữ, câu tự soạn có giải thích, và toàn bộ 672 card được gán chủ đề. Thứ tự thực hiện (my call): dựng app hoàn chỉnh cùng 2 chủ đề đầu để người dùng dùng thử sớm, rồi viết nội dung các chủ đề còn lại theo từng đợt. Bài học và câu tự soạn viết từ exam guide và tài liệu AWS chính thức, ghi nguồn; người dùng đọc thử bản tiếng Việt và duyệt mẫu việc gán chủ đề, không phải cổng chặn.

**Cấu trúc 13 chủ đề / 4 cấp (my call, chưa được người dùng xác nhận):**
- Introduction: 1 Cloud concepts · 2 Global infrastructure
- Core: 3 Compute · 4 Storage · 5 Networking · 6 Databases · 7 Deploy & operate
- Advanced: 8 Shared responsibility & security · 9 IAM & security services · 10 Pricing & billing · 11 Migration & CAF · 12 Support, AI/ML & other services
- Capstone: 13 Tổng hợp (lượt dài hơn, 30 câu, my call)

Bám exam guide CLF-C02 v1.0: 4 domain (Cloud Concepts 24%, Security & Compliance 30%, Cloud Technology & Services 34%, Billing/Pricing/Support 12%), 19 task statements. Số bài mỗi chủ đề lấy theo task statement liên quan (khoảng 3 đến 6 bài).

**Bài thực hành:** mỗi lượt 10 câu bốc ngẫu nhiên từ kho câu của chủ đề (my call). Capstone 30 câu từ mọi chủ đề.

**Kho câu hỏi:** `export_cards_to_knowt/results/questions.txt` có 672 card ngăn bằng `===`; mỗi card gồm câu hỏi, option `A.` đến `F.`, dòng `---`, rồi các dòng đáp án đúng. 81 card là "Choose two". **Card không có nhãn chủ đề**, nên cần bước gán chủ đề (xem mục 10). Mỗi câu có id ổn định sinh từ nội dung. Bổ sung câu tự soạn (5 đến 10 mỗi chủ đề, có giải thích).

**Bài học:** tự soạn bằng cả tiếng Anh và tiếng Việt (my call; người dùng đọc lại bản tiếng Việt). Link video dùng link tìm kiếm YouTube, không nhúng video cụ thể **(my call)**.

**Định dạng file nội dung (my call):** topics + lessons (Markdown, mỗi ngôn ngữ một file) + questions (JSON) nằm cạnh app và được build cùng app.

## 7. Công nghệ và kiến trúc mức cao (my call, trừ phần đã chốt)

- Tauri v2 + Svelte 5 + Tailwind 4 + SQLite qua plugin SQL chính thức (đã chốt).
- Frontend: **Vite + Svelte 5 SPA, không dùng SvelteKit** (ít màn hình, không cần router phức tạp). Hướng dẫn Tauri chính thức cho SvelteKit nhắm Svelte 4 và hơi cũ.
- Cây kiến thức: **tự vẽ bằng SVG** như mockup, bố cục cố định. Không dùng Svelte Flow vì nó là bộ dựng node/edge kéo thả, thừa với bố cục cố định này. Kéo/thu phóng và bản đồ nhỏ là tùy chọn, làm sau.
- Logic nghiệp vụ (luật mở khóa, chọn câu, xáo, chấm, lịch ôn, chọn lô ôn tập) viết thành module TypeScript thuần, không phụ thuộc Tauri, để kiểm thử bằng test đơn vị.
- Truy cập CSDL qua lớp repository mỏng. Lịch ôn đặt sau một giao diện để đổi thuật toán không đụng nơi khác.
- Cây thư mục và danh sách module đầy đủ nằm trong **plan** (Bước 2), không nằm trong spec này.
- Kiểm thử: test đơn vị cho logic thuần; test migration; chạy app thật trên macOS để kiểm tra giao diện. Tôi chưa chọn công cụ test e2e cho Tauri.

## 8. i18n và khả năng truy cập

- Giao diện tiếng Anh và tiếng Việt, đổi trong cài đặt. Câu hỏi luôn tiếng Anh.
- Điều khiển bàn phím, nhãn cho trình đọc màn hình, không dùng màu làm tín hiệu duy nhất (kèm biểu tượng ✓ ▶ 🔒), tôn trọng giảm chuyển động.

## 9. Đa nền tảng

Build và chạy thật trên macOS. Viết workflow CI cho Windows và Linux nhưng **không chạy** trong phạm vi này; nói rõ chưa được kiểm chứng.

## 10. Rủi ro và điểm chưa chốt (cần người dùng hoặc builder quyết)

1. **Gán chủ đề cho 672 card.** Đề xuất: lọc theo từ khóa dịch vụ AWS ở lượt đầu, rồi rà theo lô, người dùng duyệt mẫu. Card không gán được thì vào kho Capstone. Chưa chốt cách rà soát.
2. **Số bài và nội dung chi tiết mỗi chủ đề** chưa viết; đây là khối lượng lớn (13 chủ đề × 2 ngôn ngữ).
3. **13 chủ đề, 10 câu mỗi lượt, 30 câu Capstone, ngưỡng gồm đúng 80%, các hằng số ôn tập** là my call, cần người dùng xem lại khi duyệt.
4. **Thuật toán lịch ôn:** dùng Leitner đơn giản ở bản đầu. FSRS là lựa chọn tốt hơn theo benchmark nhưng xem mục 11.

## 11. Nghiên cứu (đã tra nguồn)

| Nội dung | Kết quả | Độ tin cậy |
|---|---|---|
| Tauri SQL plugin v2 + SQLite | Cần Rust ≥ 1.90; cài bằng `cargo add tauri-plugin-sql --features sqlite` và gói `@tauri-apps/plugin-sql`; migration viết bằng Rust (`add_migrations`), chạy khi `load()` hoặc qua `plugins.sql.preload`; cần quyền `sql:default` và `sql:allow-execute` trong capabilities; file DB nằm dưới thư mục AppConfig. [Tauri SQL plugin](https://v2.tauri.app/plugin/sql/) | Cao (tài liệu chính thức) |
| Tauri + SvelteKit | Tauri không hỗ trợ SSR; dùng SPA hoặc SSG. Hướng dẫn chính thức pinned Svelte 4. [Tauri SvelteKit guide](https://tauri.app/start/frontend/sveltekit) | Trung bình (cũ so với Svelte 5) |
| FSRS vs SM-2 | FSRS mô hình hóa ba biến (độ khó, độ ổn định, khả năng nhớ) và thắng SM-2 trong benchmark công khai của open-spaced-repetition (hơn 99% bộ thẻ Anki theo một nguồn); số liệu "giảm khoảng 25% lượt ôn" đến từ các trang thương mại, cần dè dặt. [Anki FAQ](https://docs.ankiweb.net/faqs/what-spaced-repetition-algorithm.md) | Trung bình |
| ts-fsrs | MIT; v6 với mô hình mặc định FSRS-7; API `DefaultScheduler`/`newCard`/`preview`/`review`. Không xác nhận được việc chạy trong webview và định dạng serialize thẻ từ trang tôi đọc. [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | Trung bình-thấp; cần kiểm tra thêm trước khi dùng |
| Svelte Flow | v1.x viết lại cho Svelte 5, MIT. Chưa xác nhận hỗ trợ nút cố định và điều khiển viewport. [Svelte Flow](https://svelteflow.dev/learn) | Trung bình |
| Exam guide CLF-C02 v1.0 | 4 domain, 19 task statements, 50 câu tính điểm + 15 không tính, đạt 700/1000 (đã đọc ở phiên trước). | Cao |
| Ngưỡng 80% | Ngưỡng mastery learning thông dụng, bằng chứng yếu: là lựa chọn thiết kế. | Thấp |

Lý do chọn Leitner ở bản đầu: FSRS là thư viện đang thay đổi nhanh (v6, mô hình FSRS-7) và dữ liệu của tôi là câu trắc nghiệm, khác với thẻ ghi nhớ trong benchmark. Leitner dễ kiểm thử và dễ thay thế vì nằm sau giao diện.

## 12. Để builder tự quyết

Tên module, cấu trúc thư mục chi tiết, thư viện kiểm thử, cách dựng pan/zoom nếu làm, định dạng id câu hỏi, chi tiết hình ảnh còn lại (spacing, typography, token theo `design-system`), thứ tự tiến hành các task.
