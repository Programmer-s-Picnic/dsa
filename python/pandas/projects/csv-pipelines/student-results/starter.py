"""Student starter exercise: add the processing for this six-stage pipeline.

Use pipeline.py as the answer key AFTER you have tried your own stages.
Run the complete solution with python run_pipeline.py.
"""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent

# Instructions:
# 1. Read the source CSV with pd.read_csv.
# 2. Complete each stage independently.
# 3. Save its DataFrame with df.to_csv("output/stageNN.csv", index=False).
# 4. The next stage must read the preceding stageNN.csv.
# 5. Do not delete or overwrite the supplied input CSV files.

def stage01(df):
    """TODO: Clean names and check student IDs; output a trusted registration table."""
    raise NotImplementedError("Try Stage 1, then compare with pipeline.py")

def stage02(df):
    """TODO: Merge marks from marks.csv, match IDs and verify marks lie between 0 and 100."""
    raise NotImplementedError("Try Stage 2, then compare with pipeline.py")

def stage03(df):
    """TODO: Compute totals and percentages; treat missing subject marks as incomplete."""
    raise NotImplementedError("Try Stage 3, then compare with pipeline.py")

def stage04(df):
    """TODO: Apply an explicit grading scale, then rank recorded totals."""
    raise NotImplementedError("Try Stage 4, then compare with pipeline.py")

def stage05(df):
    """TODO: Add city averages and within-city ranks without losing student records."""
    raise NotImplementedError("Try Stage 5, then compare with pipeline.py")

def stage06(df):
    """TODO: Sort by total marks and export a consolidated report.csv."""
    raise NotImplementedError("Try Stage 6, then compare with pipeline.py")

if __name__ == "__main__":
    first = pd.read_csv(ROOT / "input" / "students.csv")
    print(first.head())
    print("Implement stage01 through stage06 to produce your own CSV pipeline.")
