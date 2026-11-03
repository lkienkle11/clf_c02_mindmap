## CHOOSEN SKILLS FOR THIS TASK
- superpowers:brainstorming --- làm rõ yêu cầu option "khi đổi tab" (đóng băng / tiếp tục trôi) và hành vi khóa scroll nền của modal
- superpowers:writing-plans --- lập plan triển khai theo yêu cầu "lập plan"
- superpowers:test-driven-development --- test trước cho logic đồng hồ và scroll-lock
- superpowers:systematic-debugging --- tìm nguyên nhân gốc việc nền vẫn cuộn được khi modal mở
- superpowers:verification-before-completion --- chạy kiểm chứng trước khi báo hoàn thành
- superpowers:requesting-code-review --- review cả nhánh sau khi làm xong
- superpowers:finishing-a-development-branch --- quyết định cách tích hợp nhánh
- svelte-core-bestpractices --- viết/sửa component Svelte 5 (PracticeSetup, SessionTimer, modal)
- svelte-code-writer --- bắt buộc khi sửa .svelte / .svelte.ts
- tailwind-guidelines --- style cho option mới và modal
- frontend-ui-engineering --- UI option, a11y của modal (focus, scroll lock)
- ui-ux-pro-max --- kiểm tra UX của nhóm lựa chọn mới trong màn setup
- structure-codebase --- đặt file/module đúng chỗ (hook scroll-lock dùng chung)
- refactoring --- gom logic khóa scroll trùng lặp giữa các modal nếu có
- web-research --- kiểm tra hành vi timer nền/visibilitychange trên webview Tauri và kỹ thuật scroll lock

## STEP 1:
- superpowers:brainstorming
- web-research

## STEP 2:
- superpowers:writing-plans
- structure-codebase
- svelte-core-bestpractices
- superpowers:test-driven-development

## STEP 3:
- superpowers:using-git-worktrees --- BỎ QUA theo quyết định của người dùng: tạo nhánh mới feat/tab-switch-clock-and-modal-scroll-lock, không tạo worktree. Skill không được load.

## STEP 4:
- superpowers:subagent-driven-development (hoặc superpowers:executing-plans, tùy cách thực thi người dùng chọn)
- superpowers:test-driven-development
- svelte-core-bestpractices
- svelte-code-writer
- tailwind-guidelines
- frontend-ui-engineering
- structure-codebase

## STEP 5 (đã chạy trước khi ghi, theo luồng subagent-driven; bổ sung ghi nhận):
- superpowers:verification-before-completion (kết quả: vitest 819 pass, svelte-check 0 lỗi, build OK)

## STEP 6 (đã chạy; bổ sung ghi nhận):
- superpowers:requesting-code-review (reviewer toàn nhánh: không có Critical/Important)

## STEP 7:
- superpowers:finishing-a-development-branch
