"""Program 1: read student marks and produce passed.csv + failed.csv.

Rule: a student passes only if EVERY subject mark is >= 40.
Invalid data is rejected rather than being treated as a failure.
"""
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
SUBJECTS = ("Maths", "Science", "English")
COLUMNS = ("StudentID", "Name", "City", *SUBJECTS)


def split_students(source: pd.DataFrame):
    """Return independent passed/failed DataFrames, without mutating source."""
    missing = sorted(set(COLUMNS) - set(source.columns))
    if missing:
        raise ValueError("Missing columns: " + ", ".join(missing))
    df = source.loc[:, list(COLUMNS)].copy()
    for col in ("StudentID", "Name", "City"):
        df[col] = df[col].astype("string").str.strip()
        if df[col].isna().any() or df[col].eq("").any():
            raise ValueError(f"{col} cannot be missing or blank")
    if df["StudentID"].duplicated().any():
        raise ValueError("Duplicate StudentID: review the input file")
    for subject in SUBJECTS:
        df[subject] = pd.to_numeric(df[subject], errors="coerce")
        if df[subject].isna().any():
            raise ValueError(f"{subject} has missing/non-numeric marks")
        if not df[subject].between(0, 100).all():
            raise ValueError(f"{subject} must be between 0 and 100")
        if not df[subject].mod(1).eq(0).all():
            raise ValueError(f"{subject} marks must be whole numbers")
        df[subject] = df[subject].astype(int)

    passed_mask = df[list(SUBJECTS)].ge(40).all(axis=1)
    passed = df.loc[passed_mask].reset_index(drop=True)
    failed = df.loc[~passed_mask].reset_index(drop=True)
    assert len(passed) + len(failed) == len(df)
    return passed, failed


def main(base=None):
    base = Path(base) if base is not None else BASE
    input_file = base / "input" / "student_marks.csv"
    students = pd.read_csv(
        input_file, dtype={"StudentID": "string", "Name": "string", "City": "string"}
    )
    passed, failed = split_students(students)
    output = base / "output"
    output.mkdir(parents=True, exist_ok=True)
    passed.to_csv(output / "passed.csv", index=False)
    failed.to_csv(output / "failed.csv", index=False)
    print(f"Program 1: {len(students)} students → {len(passed)} passed, {len(failed)} failed")
    return passed, failed


if __name__ == "__main__":
    main()
