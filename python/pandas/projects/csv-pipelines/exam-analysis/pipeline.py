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
    require(df, ["CandidateID", "QuestionID", "Answer"])
    people = pd.read_csv(ROOT / "input" / "candidates.csv", dtype={"CandidateID":"string"})
    require(people, ["CandidateID", "Name", "City"])
    if people["CandidateID"].isna().any() or people["CandidateID"].duplicated().any():
        raise ValueError("CandidateID must be unique")
    if df[["CandidateID", "QuestionID"]].isna().any().any():
        raise ValueError("CandidateID and QuestionID are mandatory")
    if df.duplicated(["CandidateID", "QuestionID"]).any():
        raise ValueError("Candidate answered the same question twice")
    if not set(df["CandidateID"]).issubset(set(people["CandidateID"])):
        raise ValueError("Unknown candidate")
    df["Answer"] = df["Answer"].fillna("").astype(str).str.strip().str.upper()
    if not df["Answer"].isin(["", "A", "B", "C", "D"]).all():
        raise ValueError("Answers must be A, B, C, D or blank")
    return df.merge(people, on="CandidateID", validate="many_to_one", how="left")


def stage02(df):
    key = pd.read_csv(ROOT / "input" / "answer_key.csv")
    require(key, ["QuestionID", "Subject", "CorrectAnswer", "Marks", "Penalty"])
    if key["QuestionID"].duplicated().any() or key["QuestionID"].isna().any():
        raise ValueError("QuestionID must be unique in answer key")
    if not set(df["QuestionID"]).issubset(set(key["QuestionID"])):
        raise ValueError("Unknown question in responses")
    if not key["CorrectAnswer"].isin(["A", "B", "C", "D"]).all():
        raise ValueError("Invalid correct answers")
    for col in ["Marks", "Penalty"]:
        key[col] = pd.to_numeric(key[col], errors="raise")
        if key[col].isna().any() or key[col].lt(0).any():
            raise ValueError("Marks and penalty must not be negative")
    return df.merge(key, on="QuestionID", how="left", validate="many_to_one")


def stage03(df):
    df["Status"] = "Wrong"
    df.loc[df["Answer"].fillna("").eq(""), "Status"] = "Unattempted"
    df.loc[df["Answer"].eq(df["CorrectAnswer"]), "Status"] = "Correct"
    df["Awarded"] = 0.0
    df.loc[df["Status"].eq("Correct"), "Awarded"] = df["Marks"]
    df.loc[df["Status"].eq("Wrong"), "Awarded"] = -df["Penalty"]
    return df


def stage04(df):
    for status in ["Correct", "Wrong", "Unattempted"]:
        df[status] = df["Status"].eq(status).astype(int)
    return df.groupby(["CandidateID", "Name", "City", "Subject"], as_index=False).agg(
        Questions=("QuestionID", "size"),
        Correct=("Correct", "sum"),
        Wrong=("Wrong", "sum"),
        Unattempted=("Unattempted", "sum"),
        Score=("Awarded", "sum"))


def stage05(df):
    result = df.groupby(["CandidateID", "Name", "City"], as_index=False).agg(
        Questions=("Questions", "sum"),
        Correct=("Correct", "sum"),
        Wrong=("Wrong", "sum"),
        Unattempted=("Unattempted", "sum"),
        Score=("Score", "sum"))
    attempt = result["Correct"] + result["Wrong"]
    result["AccuracyPct"] = (100 * result["Correct"] / attempt.replace(0, float("nan"))).fillna(0).round(2)
    result["Rank"] = result["Score"].rank(method="min", ascending=False).astype(int)
    return result


def stage06(df):
    return df.sort_values(["Rank", "CandidateID"]).reset_index(drop=True)


STAGES = [stage01, stage02, stage03, stage04, stage05, stage06]


def run_stage(number):
    if not isinstance(number, int) or number not in range(1, 7):
        raise ValueError("Stage number must be 1 to 6")
    source = ROOT / ("input/responses.csv" if number == 1 else f"output/stage{number - 1:02d}.csv")
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
