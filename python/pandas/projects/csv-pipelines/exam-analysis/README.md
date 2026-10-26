# Competitive Exam Analysis — Multilevel Pandas CSV Project

This project is entirely local and uses synthetic teaching data.

## Quick start

```bash
python -m pip install pandas
cd python/pandas/projects/csv-pipelines/exam-analysis
python run_pipeline.py
python -m unittest discover -s . -p 'test_*.py'
```

## Stage-by-stage mode

Run `python stage01.py`, then `python stage02.py`, and continue through `python stage06.py`. Every script reads the CSV produced by the previous stage. Running a later stage first raises a clear file-not-found error. `run_pipeline.py` executes all six in order.

## Data flow

1. `stage01.py` — Validate answer sheets. Reads `input/responses.csv`, writes `output/stage01.csv`. Match candidate IDs, standardise options and reject duplicate answers.
2. `stage02.py` — Join answer key. Reads `output/stage01.csv`, writes `output/stage02.csv`. Match every question to its subject, answer and mark policy.
3. `stage03.py` — Apply negative marking. Reads `output/stage02.csv`, writes `output/stage03.csv`. Award positive marks, subtract penalties and handle skipped questions.
4. `stage04.py` — Subject-wise summary. Reads `output/stage03.csv`, writes `output/stage04.csv`. Create one row per candidate and subject with performance counts.
5. `stage05.py` — Aggregate candidate scores. Reads `output/stage04.csv`, writes `output/stage05.csv`. Compute total score, accuracy and ranks from subject results.
6. `stage06.py` — Export rank list. Reads `output/stage05.csv`, writes `output/report.csv`. Sort final candidates and export the report.

Additional input files: `input/candidates.csv`, `input/answer_key.csv` (joined at the stage indicated in the lesson).

The committed `output/` files are **sample output snapshots**, not a substitute for executing the scripts yourself. You can compare your generated output with them and inspect every stage on the website.

## Extension challenge

Reject duplicate candidate answers, unknown questions and invalid multiple-choice options. Create a copy of an input CSV and introduce one of those errors. Make the pipeline reject the invalid file without silently corrupting later stages.

## Notes

- Each stage uses `pandas.read_csv`, then transforms a DataFrame, then calls `to_csv(index=False)`.
- Never edit intermediate output files manually when testing; modify the input copy or the stage code and rerun from the beginning.
- Pipeline CSVs are plain-text data, not an encrypted storage system. Do not upload real personal, school, or financial records.
- Developed and maintained by Champak Roy · Programmer's Picnic.
