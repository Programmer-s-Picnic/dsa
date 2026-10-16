"""Pandas 0 to Infinity — Level 5: CSV input and output.

Run:
    python csv_io_demo.py
"""

from pathlib import Path
import pandas as pd

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "students.csv"
OUTPUT = HERE / "students_clean.csv"

REQUIRED = {"Name", "City", "Marks", "Course", "Joined"}

df = pd.read_csv(
    SOURCE,
    dtype={"Name": "string", "City": "string", "Course": "string"},
    parse_dates=["Joined"],
)

missing_columns = REQUIRED.difference(df.columns)
if missing_columns:
    raise ValueError(f"Missing required columns: {sorted(missing_columns)}")

print("First rows:")
print(df.head())
print("\nData types:")
print(df.dtypes)
print("\nMissing values:")
print(df.isna().sum())

df["Name"] = df["Name"].str.strip()
df["City"] = df["City"].str.strip()
df["Course"] = df["Course"].str.strip()
df["Marks"] = pd.to_numeric(df["Marks"], errors="coerce")

valid_marks = df["Marks"].between(0, 100) | df["Marks"].isna()
if not valid_marks.all():
    bad = df.loc[~valid_marks, ["Name", "Marks"]]
    raise ValueError(f"Marks outside 0..100:\n{bad}")

print("\nAverage marks by city:")
print(df.groupby("City", dropna=False)["Marks"].mean().round(2))

df.to_csv(
    OUTPUT,
    index=False,
    na_rep="",
    date_format="%Y-%m-%d",
    encoding="utf-8",
)

check = pd.read_csv(OUTPUT, parse_dates=["Joined"])
assert check.shape == df.shape
assert check.columns.tolist() == df.columns.tolist()

print(f"\nSaved and verified: {OUTPUT}")
