# Question-paper solution files

The question-paper library shows a **Solution** button beside every PDF. Each button opens `/aktu-papers/solution.html?paper=<id>` with the correct year, semester, course code, PDF, solution availability, and related **original theory practice answers**.

No question-by-question solution is currently represented as verified. The practice answers are independent revision material and must not be described as a solution to that specific paper.

## Publish an actual paper solution

1. Obtain and review the original exam PDF for that exact year/session/course code.
2. Transcribe the questions and prepare accurate solutions with step-by-step explanation.
3. Save an answer file, e.g. `solutions/bcs301-2025.json`:

```json
{
  "paperId": "bcs301-2025",
  "reviewStatus": "instructor-reviewed",
  "questions": [
    {
      "questionNumber": "1(a)",
      "question": "Exact question text from the source PDF",
      "marks": 2,
      "answer": "Instructor-verified solution.",
      "explanation": "Optional detailed explanation."
    }
  ]
}
```

4. In `papers.json`, update that matching entry with:

```json
"solution": {
  "status": "partial",
  "file": "solutions/bcs301-2025.json"
}
```

Use `"partial"` for incomplete coverage and `"available"` only when the solution is complete and checked. Keep `"pending"` and `"file": null` otherwise. **Never invent question-paper solutions from general study material.** All solution-file paths must live under `solutions/` and end in `.json`. The client rejects nonlocal or unsafe paths.

To verify, open the correct solution link from `/aktu-papers/` and compare question numbers/text and worked steps with the PDF.

## Data contract

Each item in `papers.json` has a unique, persistent `id` and a `solution` object. The ID must remain stable across updates so shared links do not break. Current entries use `<lowercase-code>-<year>` identifiers.

The solution page works as a static GitHub Pages app and requires no backend. It also includes subject-wise independent practice answer guides when the subject bank exists.
