## CHOOSEN SKILLS FOR THIS TASK
- superpowers:using-superpowers --- Step 0, kiểm tra và gọi skill trước mọi hành động
- superpowers:brainstorming --- Step 1, tìm ra yêu cầu thật của app mindmap học AWS CLF-C02, viết spec
- web-research --- research tài liệu chính thức (Tauri, Svelte 5, Tailwind 4, SQLite) và prior art (roadmap.sh) theo CLAUDE.md
- business-analyst --- làm rõ yêu cầu, goals/non-goals, luồng mở khóa chủ đề và tiêu chí đạt 80%
- superpowers:writing-plans --- Step 2, viết plan triển khai sau khi spec được duyệt
- superpowers:using-git-worktrees --- Step 3, workspace cô lập (xử lý nhánh feat/aws-mindmap-learning, cần được phép)
- superpowers:executing-plans --- Step 4, thực thi plan theo cách Native nếu người dùng chọn
- superpowers:subagent-driven-development --- Step 4, thực thi bằng subagent nếu người dùng chọn
- superpowers:test-driven-development --- Step 4/5, test fail trước cho mọi đoạn code
- svelte-core-bestpractices --- viết Svelte 5 đúng chuẩn khi sang giai đoạn code
- svelte-code-writer --- tra tài liệu và phân tích component Svelte khi code
- tailwind-guidelines --- styling Tailwind 4 cho mindmap và các trạng thái xanh lá/xanh dương/bạc
- frontend-ui-engineering --- UI mindmap, quiz, accessibility, responsive
- ui-ux-pro-max --- thiết kế giao diện kiểu roadmap.sh
- structure-codebase --- thiết kế cây thư mục và module hoàn chỉnh theo feature/boundary, tránh dồn phẳng vào thư mục gốc
- refactoring --- refactor bài bản có baseline test xanh trong giai đoạn thực thi (commit cần người dùng duyệt)
- design-system --- token (màu xanh lá/xanh dương/bạc, hover), spacing, typography và spec component cho mindmap, quiz
- ui-styling --- (thêm theo yêu cầu người dùng ở Step 4) styling Tailwind, theme, dark mode, thành phần có thể truy cập cho giao diện
- superpowers:verification-before-completion --- Step 5, chạy lệnh kiểm chứng trước khi báo xong
- superpowers:requesting-code-review --- Step 6, review cả nhánh bằng reviewer độc lập
- superpowers:receiving-code-review --- xử lý góp ý review có kiểm chứng kỹ thuật
- superpowers:systematic-debugging --- khi gặp lỗi trong lúc thực thi
- superpowers:finishing-a-development-branch --- Step 7, quyết định cách tích hợp nhánh

## STEP 1:
- superpowers:brainstorming
- web-research
- business-analyst
- design-system
- structure-codebase

## GHI CHÚ YÊU CẦU CỦA NGƯỜI DÙNG CHO STEP 2
- Plan phải trình bày cấu trúc folder và module hoàn chỉnh (cây thư mục đầy đủ, vai trò từng module) để người dùng xem và duyệt trước khi chốt plan.

## STEP 2:
- superpowers:writing-plans
- structure-codebase
- design-system
- superpowers:test-driven-development
- svelte-core-bestpractices
- tailwind-guidelines

## STEP 3:
- superpowers:using-git-worktrees --- BỎ QUA theo quyết định của người dùng: làm trực tiếp trên checkout gốc, nhánh feat/aws-mindmap-learning (không phải main). Skill không được load.

## STEP 4:
- superpowers:subagent-driven-development
- superpowers:test-driven-development
- svelte-core-bestpractices
- svelte-code-writer
- tailwind-guidelines
- frontend-ui-engineering
- ui-ux-pro-max
- ui-styling
- structure-codebase
- design-system
- refactoring
