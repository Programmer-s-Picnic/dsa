"""Sequential CSV pipeline. Each stage reads its predecessor's CSV and writes the next."""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"


def require(frame, names):
    missing = sorted(set(names).difference(frame.columns))
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))

def stage01(df):
    require(df, ["StudentID", "Name", "Class", "City"])
    if df["StudentID"].isna().any() or df["StudentID"].duplicated().any():
        raise ValueError("StudentID must be present and unique")
    for col in ["Name", "City"]:
        df[col] = df[col].astype("string").str.strip()
        if df[col].isna().any() or df[col].eq("").any():
            raise ValueError(f"{col} is required")
    return df


def stage02(df):
    marks = pd.read_csv(ROOT / "input" / "marks.csv")
    require(marks, ["StudentID", "Maths", "Science", "English"])
    if marks["StudentID"].isna().any() or marks["StudentID"].duplicated().any():
        raise ValueError("Marks must have unique StudentIDs")
    if set(marks["StudentID"]) != set(df["StudentID"]):
        raise ValueError("Student and marks IDs must match exactly")
    out = df.merge(marks, on="StudentID", how="left", validate="one_to_one")
    for col in ["Maths", "Science", "English"]:
        out[col] = pd.to_numeric(out[col], errors="coerce")
        if not out[col].dropna().between(0, 100).all():
            raise ValueError(f"Invalid {col} marks")
    return out


def stage03(df):
    cols = ["Maths", "Science", "English"]
    df["Total"] = df[cols].sum(axis=1, min_count=3)
    df["Percentage"] = (df["Total"] / 3).round(2)
    df["Result"] = "PASS"
    df.loc[df[cols].lt(40).any(axis=1), "Result"] = "FAIL"
    df.loc[df[cols].isna().any(axis=1), "Result"] = "INCOMPLETE"
    return df


def stage04(df):
    p = df["Percentage"]
    df["Grade"] = "F"
    df.loc[p.ge(40), "Grade"] = "C"
    df.loc[p.ge(60), "Grade"] = "B"
    df.loc[p.ge(75), "Grade"] = "A"
    df.loc[p.ge(90), "Grade"] = "A+"
    df.loc[p.isna(), "Grade"] = "INC"
    df["Rank"] = df["Total"].rank(method="min", ascending=False)
    return df


def stage05(df):
    df["CityAverage"] = df.groupby("City")["Percentage"].transform("mean").round(2)
    df["CityRank"] = df.groupby("City")["Total"].rank(method="min", ascending=False)
    return df


def stage06(df):
    df = df.sort_values(["Total", "Name"], ascending=[False, True],
                        na_position="last").reset_index(drop=True)
    return df[["StudentID","Name","Class","City","Maths","Science","English","Total","Percentage","Result","Grade","Rank","CityAverage","CityRank"]]


STAGES = [stage01, stage02, stage03, stage04, stage05, stage06]


def run_stage(number):
    if not isinstance(number, int) or number not in range(1, 7):
        raise ValueError("Stage number must be 1 to 6")
    source = ROOT / ("input/students.csv" if number == 1 else f"output/stage{number - 1:02d}.csv")
    if not source.exists():
        raise FileNotFoundError(f"Missing {source}. Run the previous stage first.")
    df = pd.read_csv(source)
    result = STAGES[number - 1](df.copy())
    if not isinstance(result, pd.DataFrame):
        raise TypeError(f"Stage {number} did not return a DataFrame")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / ("report.csv" if number == 6 else f"stage{number:02d}.csv")
    result.to_csv(destination, index=False, encoding="utf-8")
    print(f"Stage {number}: {source.name} ({len(df)} rows) -> {destination.name} ({len(result)} rows)")
    return result


def run_all():
    return [run_stage(i) for i in range(1, 7)]
