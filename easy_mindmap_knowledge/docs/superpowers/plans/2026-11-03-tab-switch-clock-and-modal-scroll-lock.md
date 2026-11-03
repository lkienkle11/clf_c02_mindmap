# Tab-switch clock option + modal scroll lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user choose, before a timed practice, whether the clock freezes or keeps running while the page is hidden (tab switch / minimize), and stop the page behind an open modal from scrolling.

**Architecture:** A pure function in `attempt-clock.ts` adjusts `ClockState` by the hidden duration according to a new `ClockState.onHidden` policy. `SessionTimer` measures hidden duration via `visibilitychange` and hands it to `PracticeSession.settleHidden`. The policy travels through `PracticeOptions` → `startClock` → `attempts.clock_on_hidden` (migration 0003). Scroll lock is a ref-counted helper `ui/scroll-lock.ts` called from `Modal.svelte`.

**Tech Stack:** Svelte 5 (runes), TypeScript, Tailwind, vitest + testing-library, Tauri 2 with `@tauri-apps/plugin-sql` (SQLite).

**Spec:** `docs/superpowers/specs/2026-11-03-tab-switch-clock-and-modal-scroll-lock-design.md`

## Global Constraints

- Option values: `onHidden: 'freeze' | 'run'`; default `'freeze'`.
- The option only shows when `timeMode === 'set'`, same as the existing clock fieldset.
- Do not change the meaning of `clockMode` (`freeze` | `run`); do not read `Date.now` inside the session (use `services.now()`).
- `onHidden` applies only to live hidden gaps inside a running session; the resume path gets no `onHidden` logic.
- The "hidden since" mark is not persisted.
- In `clockMode=freeze`, only the hidden portion follows `onHidden`; the non-hidden remainder of a tick keeps the 3 s cap (`FREEZE_MAX_TICK_MS`).
- While hidden, `onHidden` wins over `clockMode` (also covers machine sleep).
- Never edit a shipped migration: add `0003_*.sql` and register it in `src-tauri/src/lib.rs`.
- Scroll lock: no change to `Modal`'s props; nested modals stay locked until the last one closes.
- Commit messages: Conventional Commits `type(scope): description`, body with the four sections **Scope / What did / Reviewed / Tested**, no AI attribution or co-author trailer (project CLAUDE.md).
- i18n: every new key in both `src/i18n/vi.json` and `src/i18n/en.json`.

## Review Focus

1. Untimed attempt (`limitMs === null`) is hidden then shown → `settleHidden` is a no-op, nothing throws. (Task 5)
2. Hidden for longer than the remaining time with `onHidden='run'` → exactly one `submit('timeout')` on return. (Task 5)
3. Two modals open, one closes → page stays locked; both closed → inline `overflow`/`padding-right` restored to the values they had before (including pre-existing ones). (Task 2)
4. Stored `practice_last_options` JSON from before this change (no `onHidden`) → loads with `onHidden: 'freeze'` and keeps `allowReview`, `limitMs`, `clockMode`. (Task 3)
5. `hidden` event twice in a row without `visible`, or a negative hidden duration from a backwards machine clock → not double counted, clamped to 0. (Tasks 4, 6)

## File Structure

| File | Responsibility |
|---|---|
| `src/ui/scroll-lock.ts` (new) + `scroll-lock.test.ts` | ref-counted `lockScroll()` on `document.documentElement` |
| `src/ui/Modal.svelte` (modify) | call `lockScroll()` while open; `overscroll-behavior: contain` on content |
| `src/persistence/records.ts` (modify) | `ClockState.onHidden` |
| `src-tauri/migrations/0003_attempt_clock_on_hidden.sql` (new), `src-tauri/src/lib.rs` (modify) | new column + registration |
| `src/persistence/repositories/attempts.ts` (modify) | read/write `clock_on_hidden` |
| `src/features/practice/options.ts` (modify) | `PracticeOptions.onHidden`, tolerant parse |
| `src/features/practice/logic/attempt-clock.ts` (modify) | `startClock(..., onHidden)`, `settleHidden` |
| `src/features/practice/session.svelte.ts` (modify) | `settleHidden(hiddenMs)` |
| `src/features/practice/ui/SessionTimer.svelte` (modify) | visibility tracking, skip ticks while hidden |
| `src/features/practice/ui/PracticeSetup.svelte`, `src/i18n/{vi,en}.json` (modify) | the new fieldset |

---

### Task 1: Gate — does `visibilitychange` fire in the Tauri webview?

**Files:** none (manual check, nothing committed).

**Interfaces:** Produces: a yes/no that gates Tasks 4-6.

- [ ] **Step 1:** Run `npm run tauri dev`, open the webview devtools console, run `document.addEventListener('visibilitychange', () => console.log(document.visibilityState, performance.now()))`.
- [ ] **Step 2:** Minimize the window, restore it; then switch to another macOS app so the window is fully covered; then (if the app exposes tabs/browser mode) switch tabs in `npm run dev` in a real browser.
- [ ] **Step 3:** Expected: `hidden` logged on minimize and `visible` on restore. Report each scenario's result to the user.
- [ ] **Step 4:** If minimize does NOT log `hidden`, STOP and ask the user (spec §6): a replacement signal is needed. Tasks 2, 3 and 7's UI-less parts may continue; Tasks 4-6 wait.

---

### Task 2: Modal scroll lock

**Files:**
- Create: `src/ui/scroll-lock.ts`, `src/ui/scroll-lock.test.ts`
- Modify: `src/ui/Modal.svelte`, `src/ui/Modal.test.ts`

**Interfaces:** Produces: `export function lockScroll(): () => void` — returns an idempotent unlock function.

- [ ] **Step 1: Write failing tests** in `scroll-lock.test.ts`:
  - `locks and restores`: after `const un = lockScroll()`, `document.documentElement.style.overflow === 'hidden'`; after `un()`, it equals the value before.
  - `restores pre-existing inline values`: set `style.overflow='scroll'` and `style.paddingRight='3px'` first; both are back after unlock.
  - `nested locks`: `a = lockScroll(); b = lockScroll(); a()` → still `'hidden'`; `b()` → restored.
  - `unlock is idempotent`: calling the same unlock twice does not unlock an outer lock.
  - `compensates scrollbar`: with `window.innerWidth = 1015` stubbed and `documentElement.clientWidth = 1000` stubbed, `paddingRight === '15px'` while locked.
- [ ] **Step 2:** Run `npx vitest run src/ui/scroll-lock.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement `lockScroll` in `src/ui/scroll-lock.ts`:** module-level counter and saved `{overflow, paddingRight}`; first lock saves, sets `overflow='hidden'` and `paddingRight = (innerWidth - clientWidth)px` (only when > 0, else leave unchanged); last unlock restores.
- [ ] **Step 4:** Run the same command → PASS.
- [ ] **Step 5: Add failing Modal tests** in `Modal.test.ts`: `locks page scroll while open and restores on close` (rerender `open` true→false, assert `documentElement.style.overflow`); `two open modals keep the lock until both close`.
- [ ] **Step 6:** Run `npx vitest run src/ui/Modal.test.ts` → the new tests FAIL.
- [ ] **Step 7: Modify `Modal.svelte`:** inside the existing `$effect` (when `open`), call `const unlock = lockScroll()` and call it in the cleanup. Add class `overscroll-contain` to the `min-h-0 flex-1 overflow-auto` div.
- [ ] **Step 8:** Run `npx vitest run src/ui` → PASS.
- [ ] **Step 9: Manual check:** `npm run dev`, open History → an attempt detail modal; wheel/trackpad over the dimmed backdrop and over the modal; the page behind must not move and must not shift sideways on open.
- [ ] **Step 10: Commit** `fix(ui): lock page scroll while a modal is open`.

---

### Task 3: Data model — `onHidden` through options, clock state, migration, repository

**Files:**
- Create: `src-tauri/migrations/0003_attempt_clock_on_hidden.sql`
- Modify: `src-tauri/src/lib.rs`, `src/persistence/records.ts`, `src/persistence/repositories/attempts.ts`, `src/features/practice/options.ts`, `src/features/practice/logic/attempt-clock.ts` (`startClock` only), `src/features/practice/session.svelte.ts` (two `startClock` call sites), and every test fixture that builds a `ClockState` literal.
- Test: `src/features/practice/options.test.ts` (create if absent), `src/persistence/repositories/repositories.test.ts`, `src/features/practice/logic/attempt-clock.test.ts`

**Interfaces:**
- Produces: `type HiddenPolicy = 'freeze' | 'run'`; `ClockState.onHidden: HiddenPolicy`; `PracticeOptions.onHidden: HiddenPolicy`; `startClock(limitMs: number | null, mode: 'freeze' | 'run', now: number, onHidden: HiddenPolicy): ClockState`. `DEFAULT_PRACTICE_OPTIONS.onHidden === 'freeze'`.

- [ ] **Step 1: Write failing tests:**
  - `options.test.ts`: `legacy stored options without onHidden load with default 'freeze' and keep other fields` (stored `{allowReview:true,limitMs:60000,clockMode:'run'}` → `{..., onHidden:'freeze'}`); `invalid onHidden value falls back to the default options`; `round trip keeps onHidden 'run'`.
  - `attempt-clock.test.ts`: `startClock carries onHidden` for both modes.
  - `repositories.test.ts`: attempt created with `clock.onHidden='run'` is read back with `'run'`; `saveClock` persists a changed `onHidden`; an attempt row inserted by raw SQL without the column reads back `'freeze'` (default).
- [ ] **Step 2:** Run `npx vitest run src/features/practice/options.test.ts src/persistence src/features/practice/logic/attempt-clock.test.ts` → FAIL.
- [ ] **Step 3:** Create the migration: `ALTER TABLE attempts ADD COLUMN clock_on_hidden TEXT NOT NULL DEFAULT 'freeze' CHECK (clock_on_hidden IN ('freeze', 'run'));`. Register it as version 3 in `lib.rs` next to the existing two (copy the shape of the 0002 entry). Check how `repositories.test.ts` loads migrations so the new file is applied there too.
- [ ] **Step 4:** Implement: add `onHidden` to `ClockState`; `attempts.ts` reads/writes `clock_on_hidden` in `toAttempt`, `create` and `saveClock`; `options.ts` parse treats a missing `onHidden` as the default but rejects any other non-valid value; `startClock` takes the 4th parameter (`'freeze'` for the review attempt call site, `options.onHidden` for practice); thread `onHidden` into the `startClock` call in `PracticeSession.start`.
- [ ] **Step 5:** Run `npm run check` and fix every fixture/literal it flags by adding `onHidden: 'freeze'`.
- [ ] **Step 6:** Run `npx vitest run` → PASS (whole suite).
- [ ] **Step 7: Commit** `feat(practice): persist the tab-switch clock policy`.

---

### Task 4: Pure clock adjustment `settleHidden`

**Files:**
- Modify: `src/features/practice/logic/attempt-clock.ts`, `attempt-clock.test.ts`

**Interfaces:**
- Consumes: `ClockState` from Task 3.
- Produces: `export function settleHidden(state: ClockState, hiddenMs: number): ClockState`.

- [ ] **Step 1: Write failing tests** (limit 600000):
  - `run + freeze: deadlineAt moves later by hiddenMs` (deadline 1_000_000, hidden 5000 → 1_005_000).
  - `run + run: unchanged`.
  - `freeze + run: remainingMs drops by hiddenMs with no 3s cap` (100000, 40000 → 60000).
  - `freeze + run clamps at 0` (hidden 200000 → 0).
  - `freeze + freeze: unchanged`.
  - `negative hiddenMs is treated as 0`.
  - `untimed (limitMs null) is returned as is`.
- [ ] **Step 2:** Run `npx vitest run src/features/practice/logic/attempt-clock.test.ts` → FAIL.
- [ ] **Step 3:** Implement per the table in spec §4.2; clamp `hiddenMs` with `Math.max(0, …)`.
- [ ] **Step 4:** Run the same command → PASS.
- [ ] **Step 5: Commit** `feat(practice): add clock adjustment for hidden time`.

---

### Task 5: `PracticeSession.settleHidden`

**Files:**
- Modify: `src/features/practice/session.svelte.ts`, `src/features/practice/session.test.ts`

**Interfaces:**
- Consumes: `settleHidden` (Task 4), existing `submit('timeout')`, `flushClock`.
- Produces: `async settleHidden(hiddenMs: number): Promise<void>` on `PracticeSession`.

- [ ] **Step 1: Write failing tests** (reuse the file's existing helpers for fixed `services.now()`):
  - `run + freeze: remaining unchanged after settleHidden(5000) while the deadline moved` (assert `s.remainingMs` equals the pre-hide value at the later `now`).
  - `freeze + run: remainingMs drops by hiddenMs`.
  - `freeze + freeze: remainingMs unchanged`.
  - `hidden longer than remaining with onHidden 'run' => exactly one timeout submit`, and a second `settleHidden` after it does nothing.
  - `untimed session: settleHidden is a no-op and does not throw`.
  - `closed/exited session: no-op`.
  - `settleHidden saves the clock` (spy on `saveClock` as the neighbouring tick tests do).
- [ ] **Step 2:** Run `npx vitest run src/features/practice/session.test.ts` → FAIL.
- [ ] **Step 3:** Implement: guard like `tick` (`#closed || #exited || limitMs === null` → return); `this.#clock = settleHidden(this.#clock, hiddenMs)`; refresh `#remainingMs` via `remainingAt`; if `isExpired` → `await this.submit('timeout')` and return; otherwise `await this.flushClock()`.
- [ ] **Step 4:** Run the same command → PASS; then `npx vitest run` → PASS.
- [ ] **Step 5: Commit** `feat(practice): settle hidden time in the session`.

---

### Task 6: `SessionTimer` visibility tracking

**Files:**
- Modify: `src/features/practice/ui/SessionTimer.svelte`
- Test: `src/features/practice/ui/SessionTimer.test.ts` (create; model it on the timer cases in `PracticeSessionView.test.ts`)

**Interfaces:** Consumes: `session.settleHidden(hiddenMs)` (Task 5).

- [ ] **Step 1: Write failing tests** using fake timers and a helper that sets `document.visibilityState` via `Object.defineProperty` then dispatches `visibilitychange`:
  - `ticks are skipped while hidden` (`session.tick` not called during 10 s hidden).
  - `on visible, settleHidden is called once with the hidden duration` (hidden at t, visible at t+30000 → `30000`).
  - `after returning, the next tick elapsed excludes the hidden time` (≈1000, not 31000).
  - `a second hidden event without visible does not restart the hidden mark`.
  - `a backwards clock gives hiddenMs 0`.
  - `untimed session: no listeners effect, no calls`.
- [ ] **Step 2:** Run `npx vitest run src/features/practice/ui/SessionTimer.test.ts` → FAIL.
- [ ] **Step 3:** Implement with `<svelte:document onvisibilitychange={…}>` (not `onMount`/`$effect`): keep a non-reactive `hiddenAt: number | null`; on hidden set it only if null; on visible compute `max(0, services.now() - hiddenAt)`, clear it, call `session.settleHidden(hiddenMs)` with the same `.catch(onerror…)` pattern as the tick, and reset the interval's `last` to `services.now()`. The interval callback returns early when `document.visibilityState === 'hidden'`. Lift `last` out of the effect closure so the handler can reset it.
- [ ] **Step 4:** Run the same command, then `npx vitest run` → PASS.
- [ ] **Step 5: Manual check** (needs Task 1 passed): `npm run tauri dev`, start a timed practice for each of the four combinations (`clockMode` × `onHidden`), minimize for ~30 s, restore, and compare the timer with the table in spec §4.2.
- [ ] **Step 6: Commit** `feat(practice): honour the tab-switch policy in the timer`.

---

### Task 7: Setup UI and i18n

**Files:**
- Modify: `src/features/practice/ui/PracticeSetup.svelte`, `PracticeSetup.test.ts`, `src/i18n/vi.json`, `src/i18n/en.json`

**Interfaces:** Consumes: `PracticeOptions.onHidden` (Task 3).

- [ ] **Step 1: Write failing tests** in `PracticeSetup.test.ts`:
  - `hidden-policy fieldset appears only when a time limit is set`.
  - `defaults to "freeze"` (radio `Đóng băng thời gian` checked).
  - `choosing "keeps running" starts the session with onHidden 'run'` (assert the options passed to `PracticeSession.start` / the persisted attempt clock).
  - `restores the previously saved onHidden`.
- [ ] **Step 2:** Run `npx vitest run src/features/practice/ui/PracticeSetup.test.ts` → FAIL.
- [ ] **Step 3:** Implement: `let onHidden = $state<'freeze' | 'run'>('freeze')`; set it from `loadLastOptions` result; pass `onHidden` in the options object on start; add the third `<fieldset>` inside the existing `{#if timeMode === 'set'}` block with the same `radio` styling. Add keys `practice.setup.hiddenLegend` ("Khi đổi tab hoặc thu nhỏ cửa sổ" / "When you switch tabs or minimize"), `practice.setup.hiddenFreeze` ("Đóng băng thời gian" / "Freeze the time"), `practice.setup.hiddenRun` ("Thời gian tiếp tục trôi" / "Let the time keep running"), plus `practice.setup.hiddenHint` ("Chỉ tính khi cửa sổ bị ẩn; nếu chỉ bị che hoặc mất focus thì đồng hồ vẫn chạy." / "Only applies while the window is hidden; if it is merely covered or unfocused the clock keeps running.") rendered under the legend (spec §4.3).
- [ ] **Step 4:** Run `npx vitest run` and `npm run check` → PASS, no new warnings.
- [ ] **Step 5: Commit** `feat(practice): add the tab-switch clock option to setup`.

---

### Task 8: Final verification

- [ ] **Step 1:** Run `npx vitest run` and `npm run check`; record the pass counts.
- [ ] **Step 2:** Run `npm run build`; expect success.
- [ ] **Step 3:** Manual pass in the real app: the scroll lock on at least `AttemptDetail` and `DailyReviewModal`; the four clock combinations; resume an attempt started before the migration (its `onHidden` must read `freeze`).
- [ ] **Step 4:** Report results as they are, with any failure output.

## Self-review notes

- Spec coverage: §4.1 → Task 3; §4.2 → Tasks 4-6; §4.3 hint text → Task 7; §4.4 → Task 7; §4.5 → Task 2; §6 gate → Task 1; §6c/6d decisions are in Global Constraints.
- Type names used consistently: `HiddenPolicy`, `onHidden`, `settleHidden` (pure function and session method share a name on purpose; the session method calls the pure one under an import alias if the compiler complains), `lockScroll`.
