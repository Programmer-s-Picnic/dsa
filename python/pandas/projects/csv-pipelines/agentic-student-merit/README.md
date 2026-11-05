# Agentic Programming with Pandas: Four Agents, Seven CSV Outputs

This is a teaching example of an **agent-like coordinated workflow**, not an autonomous AI agent.
The four programs are deterministic; the coordinator knows when to call them and
which input/output files connect them.

## The problem

From a marks CSV, produce:
1. `passed.csv` and `failed.csv`: PASS means **all** three subjects >= 40.
2. `meritlist.csv` from `passed.csv`: total, percentage and competition ranks.
3. `top_ten.csv` from `meritlist.csv`: exactly 10 rows if there are at least 10 passes.
4. `failed-inmaths.csv`, `failed-inscience.csv`, `failed-inenglish.csv` from
   `failed.csv`: a student may appear in multiple files.

Diagram:

```text
input/student_marks.csv
          |
  [Program 1: split]
      /        \
passed.csv   failed.csv
    |             |
[Program 2]    [Program 4]
    |             |-- failed-inmaths.csv
meritlist.csv    |-- failed-inscience.csv
    |             `-- failed-inenglish.csv
[Program 3]
    |
top_ten.csv
```

## Run

```bash
python -m pip install pandas
cd python/pandas/projects/csv-pipelines/agentic-student-merit
python program1_split.py
python program2_merit.py
python program3_top_ten.py
python program4_subject_failures.py
```

Or coordinate every program automatically:

```bash
python run_all.py
python -m unittest discover -s . -p 'test_*.py'
```

The scripts use paths relative to the project directory so you can launch them
from any working directory; do not move an individual script without its folder.

## Explicit contracts

- Program 1 input: `input/student_marks.csv`; outputs:
  `output/passed.csv`, `output/failed.csv`.
- Program 2 input: `output/passed.csv`; output: `output/meritlist.csv`.
- Program 3 input: `output/meritlist.csv`; output: `output/top_ten.csv`.
- Program 4 input: `output/failed.csv`; outputs:
  `output/failed-inmaths.csv`, `output/failed-inscience.csv`,
  `output/failed-inenglish.csv`.

Marks must be numeric whole numbers from 0 to 100; missing or invalid marks
raise ValueError. That is a data-quality error, not an exam failure.

A merit rank uses the **standard competition ranking** convention (e.g.
1,2,2,4). If a tie crosses the top-ten cutoff, select exactly ten
students, ordering ties by Name then StudentID. This avoids an ambiguous "top ten".

Each failed-subject file includes the original mark and a `Shortfall` column
(`40 - mark`). Subject-wise counts may sum to more than total failed students,
because students can fail multiple subjects.

## Working with real data

The dataset is fictional. Keep real school records private; CSVs are unencrypted.
Run `run_all.py` after editing inputs so every dependent output is rebuilt.
The four-program pipeline itself is not autonomous artificial intelligence.
To create a truly AI-agentic system, one would need an AI-powered decision-maker
with tools, explicit goals and guarded authority; such AI is neither needed
nor recommended for applying fixed pass/fail rules.

## Extension ideas

- Make pass marks configurable per subject.
- Produce a separate `invalid-records.csv` and a validation report.
- Generate individualized remedial plans for students failing subjects.
- Visualize pass rates and subject-wise difficulties.
- Add a manifest with hashes and timestamps to catch stale input/output files.

Part of Pandas 0 to Infinity · Programmer's Picnic · Developed by Champak Roy.
