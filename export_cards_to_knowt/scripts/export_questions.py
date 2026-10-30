#!/usr/bin/env python3
"""Extract questions from the CLF-C02 PDF dumps into a Knowt import file.

Format: term (question + all options) --- definition (correct answer(s)),
cards separated by ===.  Requires `pdftotext` (poppler).
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
OUT = ROOT / "export_cards_to_knowt" / "results" / "questions.txt"

MARK = "✅"
HEADER = re.compile(r"^\s*Question\s+(\d+)\s*$")
OPTION = re.compile(r"^\s*([A-F])\.\s+(.*)$")


PAGE = re.compile(r"<page .*?</page>", re.S)
LINE = re.compile(r'<line xMin="[\d.]+" yMin="([\d.]+)" xMax="[\d.]+" yMax="([\d.]+)">(.*?)</line>', re.S)
WORD = re.compile(r"<word [^>]*>(.*?)</word>", re.S)
# The check-mark glyph's box is ~39pt tall and its centre sits ~5pt above the
# centre of the text line it trails.
MARK_DY = 5.0


def pdf_text(pdf):
    """Return the PDF text with each correct-answer mark glued to its option line.

    pdftotext's plain layout often moves the mark onto a separate line (or the
    wrong one), so we place it by its y coordinate instead.
    """
    html = subprocess.run(
        ["pdftotext", "-bbox-layout", str(pdf), "-"],
        check=True, capture_output=True, text=True,
    ).stdout
    out = []
    for page in PAGE.findall(html):
        lines, marks = [], []
        for y0, y1, body in LINE.findall(page):
            mid = (float(y0) + float(y1)) / 2
            words = [w for w in WORD.findall(body)]
            if MARK in words:
                marks.append(mid + MARK_DY)
            text = " ".join(w for w in words if w != MARK).strip()
            if text:
                lines.append([mid, text, False])
        options = [l for l in lines if OPTION.match(l[1])]
        for m in marks:
            if options:
                min(options, key=lambda l: abs(l[0] - m))[2] = True
        for mid, text, correct in sorted(lines, key=lambda l: l[0]):
            out.append(text + (f"  {MARK}" if correct else ""))
    return "\n".join(out)


def parse(text):
    """Yield (number, question_lines, options) where options = [(letter, text, correct)]."""
    blocks, cur = [], None
    for line in text.splitlines():
        m = HEADER.match(line)
        if m:
            cur = {"num": int(m.group(1)), "lines": []}
            blocks.append(cur)
        elif cur is not None:
            cur["lines"].append(line)

    for b in blocks:
        question, options = [], []
        for line in b["lines"]:
            if not line.strip():
                continue
            if line.strip().startswith("Lưu ý"):  # editor's note in the source, not part of the question
                break
            correct = MARK in line
            line = line.replace(MARK, "").replace("❌", "").replace("\u200b", "").rstrip()
            m = OPTION.match(line)
            if m:
                options.append([m.group(1), m.group(2).strip(), correct])
            elif options:  # wrapped continuation of the last option
                options[-1][1] += " " + line.strip()
            else:
                question.append(line.strip())
        yield b["num"], " ".join(question), options


def main():
    pdfs = sorted(DOCS.glob("*PART-*.pdf"), key=lambda p: int(re.search(r"PART-(\d+)", p.name).group(1)))
    cards, warnings = [], []
    for pdf in pdfs:
        for num, q, opts in parse(pdf_text(pdf)):
            tag = f"{pdf.name} Q{num}"
            if len(opts) < 2:
                warnings.append(f"{tag}: only {len(opts)} options")
            correct = [f"{l}. {t.strip()}" for l, t, c in opts if c]
            if not correct:
                warnings.append(f"{tag}: no correct answer marked")
                correct = ["(No correct answer marked in the source document)"]
            term = "\n".join([q] + [f"{l}. {t.strip()}" for l, t, _ in opts])
            cards.append(f"{term}\n---\n" + "\n".join(correct))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("\n===\n".join(cards) + "\n", encoding="utf-8")
    print(f"Wrote {len(cards)} cards to {OUT}")
    for w in warnings:
        print("WARNING:", w, file=sys.stderr)


if __name__ == "__main__":
    main()
