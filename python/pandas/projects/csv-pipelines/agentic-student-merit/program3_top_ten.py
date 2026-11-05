"""Program 3: read meritlist.csv and produce exactly ten rows at most.

If the 10th position is tied, we keep exactly 10 records and break
ties alphabetically by Name then StudentID (not all tied candidates).
"""
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent


def choose_top_ten(source: pd.DataFrame) -> pd.DataFrame:
    required = {"StudentID", "Name", "Total", "Rank"}
    if missing := sorted(required - set(source.columns)):
        raise ValueError("meritlist.csv is missing: " + ", ".join(missing))
    df = source.copy()
    if df["StudentID"].isna().any() or df["StudentID"].duplicated().any():
        raise ValueError("Invalid meritlist StudentID")
    df["Total"] = pd.to_numeric(df["Total"], errors="coerce")
    df["Rank"] = pd.to_numeric(df["Rank"], errors="coerce")
    if df["Total"].isna().any() or df["Rank"].isna().any():
        raise ValueError("Merit rank or total is missing or invalid")
    expected_ranks = df["Total"].rank(ascending=False, method="min")
    if not df["Rank"].eq(expected_ranks).all():
        raise ValueError("Merit ranks are inconsistent with total marks")
    return df.sort_values(
        ["Total", "Name", "StudentID"], ascending=[False, True, True],
        kind="mergesort"
    ).head(10).reset_index(drop=True)


def main(base=None):
    base = Path(base) if base is not None else BASE
    merit = pd.read_csv(
        base / "output" / "meritlist.csv", dtype={"StudentID": "string"}
    )
    top = choose_top_ten(merit)
    top.to_csv(base / "output" / "top_ten.csv", index=False)
    print(f"Program 3: top {len(top)} students → top_ten.csv")
    return top


if __name__ == "__main__":
    main()
