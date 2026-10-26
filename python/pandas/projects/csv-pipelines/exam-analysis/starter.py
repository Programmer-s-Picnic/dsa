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
    """TODO: Merge candidate details, standardise choices and prevent double answers."""
    raise NotImplementedError("Try Stage 1, then compare with pipeline.py")

def stage02(df):
    """TODO: Check every question and join subject, correct answer and scoring rules."""
    raise NotImplementedError("Try Stage 2, then compare with pipeline.py")

def stage03(df):
    """TODO: Give +marks for correct answers, −penalty for wrong, and zero for skipped."""
    raise NotImplementedError("Try Stage 3, then compare with pipeline.py")

def stage04(df):
    """TODO: Summarise each candidate's correct, wrong, skipped and awarded marks by subject."""
    raise NotImplementedError("Try Stage 4, then compare with pipeline.py")

def stage05(df):
    """TODO: Combine subject totals to overall score, attempted accuracy and final rank."""
    raise NotImplementedError("Try Stage 5, then compare with pipeline.py")

def stage06(df):
    """TODO: Sort by rank, generate the final candidate report.csv."""
    raise NotImplementedError("Try Stage 6, then compare with pipeline.py")

if __name__ == "__main__":
    first = pd.read_csv(ROOT / "input" / "responses.csv")
    print(first.head())
    print("Implement stage01 through stage06 to produce your own CSV pipeline.")
