# AWS CLF-C02 Mindmap

An offline desktop app for studying the **AWS Certified Cloud Practitioner (CLF-C02)** exam. Topics are laid out as a mindmap tree. Each topic has short lessons, practice tests, spaced review and a history of your attempts. The app is bilingual (English / Vietnamese) and keeps all progress on your machine in SQLite.

Built with Tauri v2, Svelte 5, Tailwind 4 and SQLite. The app lives in [`easy_mindmap_knowledge/`](easy_mindmap_knowledge/).

## Features

- **Mindmap tree** of 13 topics. A topic turns green once you pass a practice attempt with at least 80%.
- **Lessons** per topic (EN + VI), with optional deep-dive lessons and video / docs links.
- **Practice** with timed or untimed sessions, "Choose two" questions, per-question explanations and a read-only knowledge review while you answer.
- **Spaced review** using a Leitner schedule (1 / 3 / 7 / 14 / 30 / 60 days), in batches of 15 questions.
- **History and stats**: score chart and a list of past attempts.
- **Question bank**: 668 questions imported from a card deck, plus 130 hand-authored questions with explanations (including a Capstone set that spans all topics).

## Quick start

Requirements: Node.js 22+, Rust 1.90+ via [rustup](https://rustup.rs), and the Xcode command line tools (macOS 13+).

```sh
cd easy_mindmap_knowledge
npm install
npx tauri dev          # run the app with hot reload
npm test               # run the test suite
npx tauri build --bundles app   # unsigned macOS .app
```

If Rust is installed through Homebrew, prefix commands with `PATH=/opt/homebrew/opt/rustup/bin:$PATH`. See [`easy_mindmap_knowledge/README.md`](easy_mindmap_knowledge/README.md) for all commands, how the content is organised and how to add lessons or questions.

## Repository layout

| Path | Contents |
| --- | --- |
| `easy_mindmap_knowledge/` | The Tauri + Svelte app, content (`content/`) and tests |
| `export_cards_to_knowt/` | Tooling and results used to extract the source question cards |
| `docs/` | Local reference material (PDFs are git-ignored) |
| `.github/workflows/` | CI workflow that builds Windows and Linux bundles |

## Platform support

Only macOS has been built and run. The Windows and Linux builds are defined in CI but have never been run, so they are **not verified**.

## Your data

Progress is stored in `mindmap.db` under the app config directory. On macOS: `~/Library/Application Support/app.awsclf.mindmap/`. Delete that folder (with the app closed) to reset everything.

## Disclaimer

This is an independent study tool. It is not affiliated with or endorsed by Amazon Web Services. AWS and related names are trademarks of Amazon.com, Inc.
