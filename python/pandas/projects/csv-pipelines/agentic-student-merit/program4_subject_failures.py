"""Program 4: read failed.csv and create one CSV per failed subject.

A student failing two or three subjects intentionally appears in two
or three subject CSVs. Each CSV includes shortfall = 40 - subject mark.
"""
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
SUBJECTS = ("Maths", "Science", "English")


def failures_by_subject(source: pd.DataFrame):
    missing = sorted(set(SUBJECTS) - set(source.columns))
    if missing:
        raise ValueError("failed.csv is missing: " + ", ".join(missing))
    df = source.copy()
    for subject in SUBJECTS:
        df[subject] = pd.to_numeric(df[subject], errors="coerce")
        if df[subject].isna().any() or not df[subject].between(0, 100).all():
            raise ValueError("failed.csv contains invalid marks")
    if not df[list(SUBJECTS)].lt(40).any(axis=1).all():
        raise ValueError("failed.csv contains a student who passed all subjects")
    result = {}
    for subject in SUBJECTS:
        part = df.loc[df[subject].lt(40)].copy()
        part["Shortfall"] = 40 - part[subject]
        part = part.sort_values(
            ["Shortfall", "Name", "StudentID"],
            ascending=[False, True, True], kind="mergesort",
        ).reset_index(drop=True)
        result[subject] = part
    return result


def main(base=None):
    base = Path(base) if base is not None else BASE
    failed = pd.read_csv(
        base / "output" / "failed.csv", dtype={"StudentID": "string"}
    )
    reports = failures_by_subject(failed)
    for subject, report in reports.items():
        name = f"failed-in{subject.lower()}.csv"
        report.to_csv(base / "output" / name, index=False)
        print(f"Program 4: {subject} → {name} ({len(report)} students)")
    return reports


if __name__ == "__main__":
    main()
