# Student Examination Results — Multilevel Pandas CSV Project

This project is entirely local and uses synthetic teaching data.

## Quick start

```bash
python -m pip install pandas
cd python/pandas/projects/csv-pipelines/student-results
python run_pipeline.py
python -m unittest discover -s . -p 'test_*.py'
```

## Stage-by-stage mode

Run `python stage01.py`, then `python stage02.py`, and continue through `python stage06.py`. Every script reads the CSV produced by the previous stage. Running a later stage first raises a clear file-not-found error. `run_pipeline.py` executes all six in order.

## Data flow

1. `stage01.py` — Validate student registry. Reads `input/students.csv`, writes `output/stage01.csv`. Clean names and cities, check that student IDs are unique.
2. `stage02.py` — Merge marks. Reads `output/stage01.csv`, writes `output/stage02.csv`. Join marks by StudentID and verify every student and marks row matches.
3. `stage03.py` — Calculate results. Reads `output/stage02.csv`, writes `output/stage03.csv`. Compute total, percentage and pass/fail without inventing missing scores.
4. `stage04.py` — Grade and rank. Reads `output/stage03.csv`, writes `output/stage04.csv`. Assign grades, and rank complete results only.
5. `stage05.py` — Compare within cities. Reads `output/stage04.csv`, writes `output/stage05.csv`. Compute city mean and city rank without losing student rows.
6. `stage06.py` — Export final report. Reads `output/stage05.csv`, writes `output/report.csv`. Sort and select the final result register.

Additional input files: `input/marks.csv` (joined at the stage indicated in the lesson).

The committed `output/` files are **sample output snapshots**, not a substitute for executing the scripts yourself. You can compare your generated output with them and inspect every stage on the website.

## Extension challenge

Detect unknown student IDs, duplicate student IDs and impossible marks. Create a copy of an input CSV and introduce one of those errors. Make the pipeline reject the invalid file without silently corrupting later stages.

## Notes

- Each stage uses `pandas.read_csv`, then transforms a DataFrame, then calls `to_csv(index=False)`.
- Never edit intermediate output files manually when testing; modify the input copy or the stage code and rerun from the beginning.
- Pipeline CSVs are plain-text data, not an encrypted storage system. Do not upload real personal, school, or financial records.
- Developed and maintained by Champak Roy · Programmer's Picnic.
