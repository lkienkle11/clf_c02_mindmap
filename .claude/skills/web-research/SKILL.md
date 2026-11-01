---
name: web-research
description: Research a question across several independent, reliable web sources and return a sourced answer with confidence notes. Use when the user asks to look into a topic, verify a claim, compare viewpoints, or needs citations - not for a single quick fact (use web-search for that).
license: MIT
metadata:
  title: Web Research
  version: "1.0.0"
  author: Velonx
  category: research
  tags: [research, web, search, citations]
  platforms: [generic, claude, openai, gemini, cursor]
  requirements: [web-access]
  icon: search
  featured: true
---

# Web Research

## Overview

A repeatable procedure for answering open questions from the web: plan the searches, read primary sources, cross-check claims, and report what is known, what is disputed and where each fact came from.

## When to Use

- "Research…", "look into…", "what's the current state of…", "is it true that…"
- The answer needs more than one source, or the user will act on it.
- The user asks for citations, a comparison of viewpoints, or a recent development.

Do **not** use for a single lookup ("what year was X founded") — that is `web-search`.

## Usage

1. **Restate the question** in one sentence and list 2–4 sub-questions it depends on.
2. **Plan searches.** For each sub-question write 1–2 queries. Vary wording; include one query aimed at a primary source (official site, paper, dataset, filing, standard).
3. **Collect sources.** Aim for at least 3 independent sources for any key claim. Prefer, in order:
   primary sources → reputable institutions and journals → established news outlets → everything else.
   Note the publication date of each; flag anything older than the question needs.
4. **Read, don't skim snippets.** Open the page. Quote only short passages; paraphrase the rest.
5. **Cross-check.** For each key claim record: sources that agree, sources that disagree, and why they might differ (date, method, incentive).
6. **Write the answer** in this shape:
   - **Answer** — 2–4 sentences, direct.
   - **Key findings** — bullets, each ending with a citation like `[2]`.
   - **Disagreements / uncertainty** — what is contested and why.
   - **Sources** — numbered list: title, publisher, date, URL.
7. **State confidence** (high / medium / low) and what would change it.

## Examples

**Prompt:** "Is intermittent fasting better than calorie restriction for weight loss?"

The agent splits it into: effect size in RCTs, adherence, populations studied. It searches for meta-analyses first, then individual trials, then public-health guidance, and reports that most trials find similar weight loss when calories are matched — with the disagreement being about adherence.

A full sample answer is in [examples/sample-answer.md](examples/sample-answer.md).

## Requirements

- Web search and the ability to open pages.

## Limitations

- Cannot read paywalled content; says so rather than guessing what it contains.
- Search results skew toward English and recent content.
- The agent can still misread a source — citations let the user check.

## Changelog

- **1.0.0** — Initial release.
