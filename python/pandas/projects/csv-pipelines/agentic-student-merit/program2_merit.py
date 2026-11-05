"""Program 2: read passed.csv, calculate scores and publish meritlist.csv.

Tied totals receive the same competition rank (1, 2, 2, 4).
Names and student IDs resolve display order within a tied rank.
"""
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
SUBJECTS = ("Maths", "Science", "English")


def build_meritlist(source: pd.DataFrame) -> pd.DataFrame:
    required = {"StudentID", "Name", *SUBJECTS}
    if missing := sorted(required - set(source.columns)):
        raise ValueError("passed.csv is missing: " + ", ".join(missing))
    df = source.copy()
    if df["StudentID"].isna().any() or df["StudentID"].duplicated().any():
        raise ValueError("passed.csv has invalid StudentID values")
    for subject in SUBJECTS:
        df[subject] = pd.to_numeric(df[subject], errors="coerce")
        if df[subject].isna().any() or not df[subject].between(40, 100).all():
            raise ValueError("passed.csv contains incomplete or failing marks")
    df["Total"] = df[list(SUBJECTS)].sum(axis=1)
    df["Percentage"] = (df["Total"] / len(SUBJECTS)).round(2)
    df["Rank"] = df["Total"].rank(ascending=False, method="min").astype(int)
    return df.sort_values(
        ["Total", "Name", "StudentID"],
        ascending=[False, True, True], kind="mergesort",
    ).reset_index(drop=True)


def main(base=None):
    base = Path(base) if base is not None else BASE
    passed = pd.read_csv(
        base / "output" / "passed.csv",
        dtype={"StudentID": "string"},
    )
    merit = build_meritlist(passed)
    merit.to_csv(base / "output" / "meritlist.csv", index=False)
    print(f"Program 2: {len(merit)} passed students → meritlist.csv")
    return merit


if __name__ == "__main__":
    main()
