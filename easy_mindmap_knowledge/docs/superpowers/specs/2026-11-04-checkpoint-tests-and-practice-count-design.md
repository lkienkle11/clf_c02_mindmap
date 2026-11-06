# Chọn số câu luyện tập, bài kiểm tra nhóm, Capstone 65 câu và mở rộng bài học — thiết kế

Ngày: 2026-11-04. Trạng thái: **bản nháp chờ người dùng duyệt**. App: `easy_mindmap_knowledge` (Tauri v2 + Svelte 5 + Tailwind 4 + SQLite, vitest).
Quy ước: **(đã chốt)** = người dùng đã nói rõ. **(my call)** = do tôi (agent) tự quyết, người dùng chưa xác nhận, xem lại khi duyệt.

## 1. Ý định và lý do

Người dùng đang ôn CLF-C02 bằng app này và thấy hai thứ quá ít: (a) mỗi chủ đề chỉ có khoảng 4 bài nội dung và mỗi lượt luyện tập chỉ 10 câu, trong khi kho có 798 câu (668 nhập từ flashcard + 130 tự soạn); (b) chưa có bài kiểm tra mô phỏng đề thi thật có áp lực thời gian. Họ muốn: chọn được số câu luyện tập, một "bài kiểm tra 1 tiết" sau mỗi vài chủ đề giống đề thật, và bài học đủ rộng để phủ các dịch vụ xuất hiện trong câu hỏi.

Thành công trông như thế nào: người học đi hết lộ trình, mỗi nhóm chủ đề kết thúc bằng một bài thi 65 câu có đồng hồ giống thi thật, vượt qua mới mở nhóm kế tiếp; cuối lộ trình là bài thi thử Capstone 65 câu chia theo tỷ lệ domain; không còn câu hỏi nào nói về dịch vụ mà bài học chưa nhắc tới.

## 2. Hiện trạng đã xác minh trong code (nghiệp vụ có sẵn không được làm hỏng)

- Luyện tập theo **chủ đề** (`kind = 'practice'`, `topic_id`). `buildPool` lấy toàn bộ câu của chủ đề; `practiceCount()` cố định 10, Capstone 30 (`features/practice/logic/pick-questions.ts`). Thứ tự câu và đáp án chốt một lần lúc bắt đầu và lưu cùng lượt.
- Màn thiết lập (`PracticeSetup.svelte`): cho/không cho xem lại kiến thức; không đặt giờ hoặc đặt giờ (phút + giây, 0–180 phút); nếu đặt giờ thì kiểu đồng hồ `freeze`/`run` và `onHidden` (`freeze`/`run`). Tùy chọn gần nhất lưu ở settings (`practice_last_options`).
- Đồng hồ (`logic/attempt-clock.ts`, `SessionTimer.svelte`): `run` tính theo `deadlineAt` tuyệt đối; hết giờ tự nộp (`submitReason = 'timeout'`).
- Hoàn thành chủ đề = có ít nhất một lượt practice đã nộp với `passed = true` (≥ 80%); chủ đề kế tiếp mở theo thứ tự `order`; lượt review không tính (`mindmap/logic/topic-status.ts`). Mở khóa luyện tập cần đọc hết bài **bắt buộc** của chủ đề (`practiceUnlocked`).
- Khôi phục lượt dở: `PracticeSession.resume` kiểm tra tính hợp lệ, trong đó `expected = min(practiceCount(topic), pool.length)` và báo `partial attempt` nếu thiếu câu. Số câu cố định này sẽ sai khi số câu thay đổi theo lượt.
- Schema: `attempts.kind` có `CHECK (kind IN ('practice','review'))` trong `0001_init.sql`; migration đã phát hành không được sửa, chỉ thêm `NNNN_*.sql` và đăng ký trong `src-tauri/src/lib.rs`. Hiện có `0001`–`0003`.
- Ôn tập ngắt quãng (`kind = 'review'`, Leitner 1/3/7/14/30/60 ngày, lô 15 câu) và `question_stats` cập nhật khi lượt được nộp.
- Capstone là cổng thứ 13, mở sau chủ đề 12; kho = toàn bộ catalog.

## 3. Mục tiêu / không mục tiêu / chống mục tiêu

**Mục tiêu (đã chốt)**
- G1. Luyện tập: người dùng nhập số câu từ **10 đến số câu của chủ đề**.
- G2. **4 bài kiểm tra nhóm** (sau mỗi 3 chủ đề), mô phỏng đề thật, làm một mạch, không xem tài liệu, đạt từ 80%.
- G3. **Capstone** nâng thành đề 65 câu chia theo tỷ lệ domain đề thật.
- G4. Làm lại bài kiểm tra: ưu tiên câu chưa gặp; chỉ khi thiếu mới dùng lại câu từng làm sai (sai nhiều trước).
- G5. Mở rộng bài học, song ngữ EN/VI, phủ mọi dịch vụ có trong câu hỏi (spec này gộp cả phần nội dung).

**Không mục tiêu**
- Không mô phỏng điểm thang 100–1000 của AWS và không có 15 câu không tính điểm ẩn (mọi câu đều tính) — (my call).
- Không viết bài cho các video thuần thao tác console/CLI/SSH (tạo tài khoản, cài CLI trên Windows/Mac/Linux, v.v.); chỉ giữ phần khái niệm.
- Không chuyển dữ liệu tiến trình cũ: người dùng đã reset (file cũ đổi tên `mindmap.db.backup-2026-11-04`), không cần migration xóa hay xử lý "khóa ngược" (đã chốt).
- Không đổi thuật toán ôn tập, nội dung 798 câu hỏi, hay ngôn ngữ câu hỏi (luôn tiếng Anh).

**Chống mục tiêu:** bài kiểm tra có thể bị "qua mặt" (mở tài liệu, tạm dừng đồng hồ); thêm tính năng làm hỏng khôi phục lượt dở hoặc luật mở khóa hiện có; viết bài học sai sự thật AWS.

## 4. Ràng buộc

Giữ nguyên stack và cấu trúc `features/practice`, `features/mindmap`, `persistence`. Không thêm dependency. Svelte 5 runes. Migration chỉ bằng file mới. i18n EN/VI cho mọi nhãn giao diện. Quy tắc commit và quy trình của `CLAUDE.md` repo. Thông số đề thi thật lấy từ tài liệu chính thức AWS (mục 11).

## 5. Luyện tập: chọn số câu (G1)

- `PracticeSetup.svelte`: thêm ô số nguyên + nút chọn nhanh **10, 20, 50, Tất cả** (nút nào lớn hơn pool thì ẩn). Giá trị hợp lệ: `10 ≤ n ≤ pool.length`; ngoài khoảng hoặc không phải số nguyên → lỗi rõ ràng, không bắt đầu được. Mặc định 10; nhớ lựa chọn gần nhất trong settings *(my call)*.
- Mỗi chủ đề (kể cả nhỏ nhất, `global-infrastructure`) có hơn 10 câu nên mức tối thiểu 10 luôn hợp lệ.
- Số câu của lượt được **lưu cùng lượt** để `resume` kiểm tra đúng (thay phép kiểm tra dựa trên `practiceCount`). Cách lưu (cột mới hay suy ra từ `attempt_questions`) để builder quyết, nhưng không được làm hỏng lượt dở cũ.
- Cách rút câu của luyện tập thường giữ nguyên (ngẫu nhiên từ pool). Quy tắc "ưu tiên câu chưa gặp" chỉ áp dụng cho bài kiểm tra.
- Gợi ý thời gian khi người dùng bật đặt giờ: điền sẵn số câu × 90/65 phút, vẫn sửa được *(my call)*.

## 6. Bài kiểm tra nhóm (G2, G4)

### 6.1 Nhóm
4 nhóm theo thứ tự `order` trong `topics.json`: {1–3}, {4–6}, {7–9}, {10–12}. Kích thước nhóm là hằng số cấu hình = 3 (đã chốt N cố định; giá trị 3 là my call). Capstone không thuộc nhóm nào.

### 6.2 Đề
- 65 câu rút từ pool = các chủ đề trong nhóm (nhập + tự soạn). Số câu mỗi chủ đề tỷ lệ theo kích thước pool của chủ đề (làm tròn phần dư lớn nhất, mỗi chủ đề ít nhất 1) — (my call).
- Có cả câu một đáp án và nhiều đáp án (`multi`), chấm như hiện tại (đúng khi chọn đúng toàn bộ tập đáp án). Câu `orderDependent` giữ thứ tự đáp án.
- Pool nhóm không đủ 65 câu → lấy hết số câu có; từ 10 câu trở xuống không cho thi. Hiện cả 4 nhóm có hơn 150 câu nên nhánh này chỉ là dự phòng.

### 6.3 Thời gian (đã chốt)
- Không thêm giờ: **90 phút** cho 65 câu; có thêm giờ (ESL): **120 phút**. Thiếu câu: `ceil(số_câu × 90/65 × 60)` giây, hoặc `× 120/65` khi bật thêm giờ.
- Người dùng chọn "thêm 30 phút" cho từng lượt (nhớ lựa chọn gần nhất). Không cho nhập giờ tự do.

### 6.4 Chế độ thi (đã chốt: làm liền một mạch, không xem tài liệu)
- Không có nút "Xem lại kiến thức"; đáp án và giải thích chỉ hiện sau khi nộp.
- Đồng hồ `run` theo `deadlineAt`, `onHidden = run` (đổi tab/thu nhỏ cửa sổ vẫn bị tính) — (my call). Hết giờ tự nộp; có nút nộp sớm. Câu bỏ trống tính sai.
- Nút Thoát (có xác nhận) **bỏ lượt**: xóa lượt, không lưu điểm (như nút Thoát hiện có). App crash/tắt đột ngột: lượt được giữ, đồng hồ vẫn chạy theo mốc kết thúc, mở lại thì hỏi "tiếp tục" hoặc tự nộp nếu đã hết giờ (tái dùng luồng khôi phục hiện có) — (my call).
- Kết quả hiện phần trăm đúng, đạt/không đạt (80%), điểm theo domain/chủ đề, và xem lại từng câu như `PracticeResult` hiện có.

### 6.5 Làm lại (G4, đã chốt)
Mỗi lượt là một lượt riêng trong lịch sử, không giới hạn số lần. Rút câu theo thứ tự ưu tiên:
1. Câu **chưa từng xuất hiện** trong bất kỳ lượt đã nộp nào (practice, review hoặc checkpoint) — (my call: tính mọi loại lượt).
2. Nếu vẫn thiếu: câu từng làm **sai**, sắp theo số lần sai giảm dần.
3. Nếu vẫn thiếu: câu từng làm đúng, ngẫu nhiên — (my call, người dùng chưa nói trường hợp này).
Trong cùng ưu tiên, giữ tỷ lệ chủ đề của 6.2 khi có thể.

### 6.6 Mở khóa (đã chốt: cổng riêng)
Nhóm kế tiếp (chủ đề đầu của nó) chỉ mở khi **cả 3 chủ đề của nhóm trước đã hoàn thành theo luật luyện tập hiện có (≥ 80%) và có ít nhất một bài kiểm tra nhóm đã nộp đạt ≥ 80%**. Luật mở khóa trong nội bộ nhóm (chủ đề sau mở khi chủ đề trước hoàn thành) giữ nguyên. Bài kiểm tra nhóm chỉ làm được khi cả 3 chủ đề của nhóm đã hoàn thành. Làm lại bài kiểm tra không khóa lại gì. Trạng thái "đã qua cổng" được **tính ra** từ lịch sử, không lưu riêng, như các trạng thái màu khác.

### 6.7 Ảnh hưởng ôn tập và lịch sử
Lượt kiểm tra đã nộp cập nhật `question_stats` như lượt luyện tập (câu đúng/sai có tác dụng lên lịch Leitner) — (my call). Lịch sử và thống kê hiện thêm loại "Kiểm tra nhóm" (nhãn, bộ lọc), câu sai của bài kiểm tra có mặt trong "câu hay sai nhất".

## 7. Capstone 65 câu (G3, đã chốt nâng cấp)

- Vẫn là cổng thứ 13, mở sau khi chủ đề 12 **và** bài kiểm tra nhóm 4 đã đạt (cùng luật 6.6). Hoàn thành = lượt Capstone đã nộp đạt ≥ 80% (luật hiện có).
- Cùng chế độ thi, thời gian và luật làm lại như mục 6 (90/120 phút).
- Đề chia theo domain đề thật trên 65 câu (phần dư lớn nhất): Cloud Concepts 16, Security 19, Technology 22, Billing 8 — tính từ 24/30/34/12%.
- Gán chủ đề vào domain *(my call, builder rà lại)*: D1 = cloud-concepts, migration-caf; D2 = shared-responsibility, iam-security; D3 = global-infrastructure, compute, storage, networking, databases, deploy-operate, support-ai-other; D4 = pricing-billing. Câu `unassigned` (17 câu) chỉ dùng để bù khi một domain thiếu câu. Việc gán là xấp xỉ vì exam guide chia theo task statement, không theo chủ đề của app.

## 8. Bài học (G5)

- **Quy mô (đã chốt):** khoảng 8–14 bài mỗi chủ đề (tổng khoảng 130–150, thay cho 65 hiện nay), mỗi bài khoảng 600–900 từ, đủ EN và VI, bám khung khóa video "Ultimate AWS Certified Cloud Practitioner CLF-C02 2026" (277 bài; danh sách tên nằm trong tài liệu tham khảo của người dùng).
- **Phủ dịch vụ:** mọi dịch vụ/khái niệm AWS xuất hiện trong 668 câu hỏi phải được dạy trong ít nhất một bài. Khoảng trống đã đo: Service Catalog, PrivateLink, VPC Endpoint, Cloud9, Personalize, License Manager, CodeGuru, Control Tower, STS, Snowmobile, Resource Access Manager, Directory Service, Image Builder, Transfer Acceleration, Network Firewall, Service Quotas, AppSync, Ground Station, OpsWorks, Elastic Transcoder, Express One Zone, Amazon MQ, Elastic Disaster Recovery, Pinpoint, Carbon Footprint, IQ, Placement Group; nhắc quá ít: QuickSight, Detective, Certificate Manager, Support Plans, IAM Access Analyzer, Firewall Manager, EMR, Savings Plans, Snow Family, Cost Anomaly Detection. (Phép đo từ khóa có nhiễu; builder phải đo lại trước khi viết.)
- **Có gác kiểm tra tự động** (kiểu `bundled-content.test.ts`): danh sách dịch vụ được duyệt trước, mỗi dịch vụ phải xuất hiện trong ít nhất một bài của chủ đề được chỉ định.
- **Bắt buộc:** chỉ bài nền tảng đặt `required: true` để việc đọc bài không chặn luyện tập quá lâu (đã chốt hướng; danh sách cụ thể là my call). Cuối mỗi chủ đề vẫn có bài `further-learning`.
- **Gợi ý ánh xạ cụm video → chủ đề** *(my call, builder hoàn thiện)*: cloud-concepts (cloud computing, Well-Architected 6 trụ cột, carbon footprint, right sizing); global-infrastructure (Region/AZ/edge, Route 53, CloudFront, Global Accelerator, Outposts, Wavelength, Local Zones); compute (EC2, AMI, ELB/ASG, container, serverless, Lightsail, Batch); storage (EBS, EFS, FSx, S3 và storage class, Snow, Storage Gateway, Backup, DataSync); networking (VPC, subnet, NAT, NACL, endpoint, PrivateLink, VPN, Direct Connect, Transit Gateway); databases (RDS, Aurora, DynamoDB, ElastiCache, Redshift, DocumentDB, Neptune, analytics); deploy-operate (CloudFormation, CDK, Beanstalk, CodeX, Systems Manager, CloudWatch, CloudTrail, EventBridge, SQS/SNS/Kinesis, Step Functions); shared-responsibility (mô hình và các biến thể theo dịch vụ); iam-security (IAM, STS, Cognito, Identity Center, KMS, WAF/Shield, GuardDuty, Inspector, Macie, Config, Security Hub); pricing-billing (Organizations, Control Tower, mô hình giá, Savings Plans, công cụ billing, Trusted Advisor, Support Plans); migration-caf (7Rs, CAF, DR, DMS, Migration Hub/Evaluator); support-ai-other (ML services, WorkSpaces, AppStream, IoT, Amplify, AppSync và dịch vụ khác).
- **Capstone lessons:** bài "exam format" phải khớp thông số thật (65 câu, 90 phút, thêm 30 phút cho người không phải bản ngữ tiếng Anh, đạt 700/1000, 4 domain) và nói rõ app dùng ngưỡng 80% riêng.
- **Quy trình nội dung:** viết theo đợt từng chủ đề, có nguồn tài liệu AWS chính thức và bước kiểm chứng sự thật như các đợt nội dung trước. Id bài học ổn định; `topics.json.lessonIds` phải khớp file (app từ chối khởi động nếu lệch).

## 9. Kiểm thử và xác minh

TDD cho logic thuần: công thức thời gian, phân bổ câu theo chủ đề/domain, rút đề làm lại 3 mức ưu tiên, luật cổng nhóm, validate số câu, khôi phục lượt dở với số câu khác 10. Test migration (áp mọi file theo thứ tự). Test component cho màn thiết lập, bài kiểm tra, kết quả, lịch sử. `npm test` và `npm run check` xanh; chạy app thật trên macOS để xem luồng thật (đặc biệt đồng hồ, thoát giữa chừng, crash/resume). Windows/Linux vẫn chưa kiểm chứng.

## 10. Rủi ro và điểm chưa chốt

1. **Loại lượt mới trong DB.** `CHECK (kind IN ('practice','review'))` không sửa được tại chỗ; thêm loại mới cần migration dựng lại bảng, hoặc thêm cột phân biệt mà vẫn giữ `kind = 'practice'`. Hiện code coi `practice` không có `topic_id` là lượt hỏng. Cách làm: builder quyết, ràng buộc là không sửa migration đã phát hành và không làm hỏng ghi/đọc lượt hiện có.
2. **Gán chủ đề → domain** cho Capstone là xấp xỉ (mục 7).
3. **Pool hẹp:** nhóm 1 có 153 câu; sau vài lần làm lại, bước 2 và 3 của 6.5 sẽ được dùng nhiều. Chấp nhận.
4. **Khối lượng bài học** rất lớn (khoảng 260–300 file song ngữ); rủi ro sai sự thật AWS là chính, giảm bằng kiểm chứng theo đợt.
5. `visibilitychange` trong WKWebView chưa được xác minh trong spec trước; spec này không phụ thuộc vì bài kiểm tra dùng `run` + `onHidden = run`.

## 11. Nghiên cứu (đã tra nguồn, 2026-11-04)

| Nội dung | Kết quả | Độ tin cậy |
| --- | --- | --- |
| Số câu, loại câu, điểm | 65 câu: 50 tính điểm + 15 không tính (không đánh dấu); một đáp án (1 đúng + 3 nhiễu) hoặc nhiều đáp án (≥ 2 đúng trong ≥ 5 lựa chọn); bỏ trống tính sai, không trừ điểm khi đoán; đạt 700/1000, chấm bù trừ giữa các domain. [AWS exam guide CLF-C02](https://docs.aws.amazon.com/aws-certification/latest/cloud-practitioner-02/cloud-practitioner-02.html) | Cao |
| Thời gian | 90 phút. [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/) (một nguồn bên thứ ba ghi 130 phút, sai) | Cao |
| Tỷ lệ domain | Cloud Concepts 24%, Security & Compliance 30%, Cloud Technology & Services 34%, Billing/Pricing/Support 12% (tính trên phần tính điểm). Exam guide ở trên | Cao |
| Thêm 30 phút | Có cho người không phải bản ngữ tiếng Anh khi thi tiếng Anh; xin một lần, trước khi đăng ký thi, mục "ESL +30 MINUTES". [AWS exam policies](https://aws.amazon.com/certification/policies/before-testing) → 120 phút | Cao |

## 11b. Quyết định sau builder check (đều là my call, đổi nếu bạn không đồng ý)

- **Hết giờ khi app đóng.** Mở lại sau hạn thì tự nộp với những câu đã làm; câu chưa trả lời tính sai; kết quả tính vào điểm đạt/cổng như một lượt nộp bình thường (theo spec gốc 2026-11-02, mục 5). Không tự nộp ngay lúc khởi động trước khi giao diện sẵn sàng; hiện kết quả như lượt `timeout`.
- **Biểu diễn trong DB.** Bài kiểm tra nhóm và Capstone cho phép `topic_id` rỗng khi là bài nhiều chủ đề; mỗi bài kiểm tra nhóm lưu **chỉ số nhóm**, Capstone lưu `topic_id = 'capstone'`. Ràng buộc bắt buộc: điểm đạt của bài kiểm tra nhóm **không bao giờ** được `completedTopicIds` tính là hoàn thành một chủ đề; mọi truy vấn hiện có theo `kind = 'practice'` phải được rà để không tính nhầm. Chọn giữa loại `kind` mới (dựng lại bảng bằng migration `0004`) và thêm cột vẫn giữ `kind = 'practice'` là việc của builder, miễn thỏa các ràng buộc này.
- **Đạt/không đạt.** Chỉ dựa trên điểm **tổng ≥ 80%**, không có mức tối thiểu theo domain (giống chấm bù trừ của đề thật). Điểm theo chủ đề/domain chỉ để hiển thị. Câu `unassigned` tính vào điểm tổng, không hiện trong điểm theo domain.
- **Phân kỳ nội dung và code.** Cùng một spec và cùng một nhánh, nhưng plan làm **code trước** (số câu, bài kiểm tra, Capstone, cổng) rồi viết bài học **theo từng đợt chủ đề**, như các đợt nội dung trước. Có thể giao hàng khi nội dung còn dở: cổng nhóm chỉ phụ thuộc vào luyện tập ≥ 80% và bài kiểm tra, còn `practiceUnlocked` chỉ phụ thuộc vào bài bắt buộc của chính chủ đề; `topics.json.lessonIds` luôn phải khớp file.
- **Nút chọn nhanh.** Hiện 10 luôn có; hiện 20 và 50 chỉ khi nhỏ hơn số câu của pool; hiện "Tất cả" khi pool lớn hơn 10.
- **Lượt bị bỏ không "đốt" câu chưa gặp.** Lượt thoát giữa chừng bị xóa nên các câu của nó vẫn tính là chưa gặp.
- **Capstone thiếu câu.** Pool nhỏ hơn 65 thì lấy hết, tính giờ theo tỷ lệ như 6.3; từ 10 câu trở xuống không cho thi. Thực tế pool Capstone là cả catalog nên nhánh này chỉ dự phòng.

## 12. Để builder tự quyết

Cách lưu số câu của lượt và loại lượt mới (mục 10.1); đặt tên cột/hằng số; vị trí và giao diện nút "Kiểm tra nhóm" trên cây tri thức (cần mockup trong plan); cách chia ô nhập số câu và nút chọn nhanh; danh sách dịch vụ cần phủ và bài nào bắt buộc; số bài chính xác từng chủ đề; thứ tự đợt viết nội dung; chi tiết test và thứ tự commit.
