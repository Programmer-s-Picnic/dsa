# AKTU subject question banks and practice tests

Start: https://dsa.learnwithchampak.live/aktu-papers/practice.html

- `subjects/index.json`: manifest for subject-wise question banks.
- `subjects/<code>.json`: one subject's topics, theory practice, model-answer points, MCQs and explanations.
- `practice.html`: client-side quiz engine with instant MCQ scoring, theory answer reveal, per-subject search and filters.
- `tools/analyze_papers.py`: optional local heuristic comparison of extracted text from actual exam papers.

## Evidence rules (important)
Questions now included are **original syllabus-based practice questions**, not transcribed or verified AKTU previous-year questions. Each has `origin: "original_practice"`. Topic importance has `basis: "syllabus coverage / editorial judgment"`; `verifiedPastPaperOccurrences: null` deliberately means **not measured**, NOT zero.

To make statistical repeated-topic rankings, collect multiple real papers for each subject, record their source PDFs, extract question text, review topic tags, and count **distinct examinations**, not duplicate mirrored downloads. Use the optional Python analyzer to propose duplicate question groups, then review every candidate against the actual PDF and record page/question evidence. Do not turn fuzzy matches into verified counts without review.

## Extend
Add subject JSON with `code, subject, semester, topics[]`, one or more `theory[]` and `mcq[]` entries. Update `subjects/index.json` to expose the new subject. Avoid inventing subject codes or frequency figures; AKTU changes course codes between regulation versions.

## Automated analysis
1. Extract text from legitimate PDF files into `extracted-papers/BCS301_2025.txt` etc. (source PDFs should be kept outside this small source repo unless distribution rights allow hosting).
2. Run `python tools/analyze_papers.py extracted-papers/ > repeat-candidates.json`.
3. Manually review candidate matches against PDF originals, attach exact examination, year, question number/page and a source URL.
4. Only then publish confirmed counts or assign high-frequency topic rankings.

No third-party PDF contents are redistributed by this feature.
