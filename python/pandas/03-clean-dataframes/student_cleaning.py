"""Pandas 0 to Infinity, Level 3: DataFrame cleaning without external files."""

import pandas as pd


def make_messy_students():
    """Create an intentionally messy but entirely in-memory class register."""
    return pd.DataFrame([
        {"StudentID": 101, "Name": " Asha ", "City": " Varanasi ", "Marks": "88", "Attendance": 92},
        {"StudentID": 102, "Name": "Ravi", "City": "ranchi", "Marks": "42", "Attendance": 75},
        {"StudentID": 103, "Name": "Meera", "City": "VARANASI", "Marks": None, "Attendance": 80},
        {"StudentID": 103, "Name": "Meera", "City": "VARANASI", "Marks": None, "Attendance": 80},
        {"StudentID": 104, "Name": " Kabir", "City": "Patna", "Marks": "108", "Attendance": 50},
        {"StudentID": 105, "Name": "Nina", "City": None, "Marks": "-4", "Attendance": None},
        {"StudentID": 106, "Name": None, "City": "Ranchi", "Marks": "absent", "Attendance": 65},
        {"StudentID": 107, "Name": "Rahul", "City": "varanasi", "Marks": "91", "Attendance": 95},
    ])


def clean_students(raw):
    """Return a new cleaned table and an explicit audit; leave raw untouched."""
    df = raw.copy(deep=True)
    audit = {"input_rows": len(df), "missing_before": df.isna().sum().to_dict()}

    for column in ("Name", "City"):
        df[column] = df[column].astype("string").str.strip().replace("", pd.NA).str.title()

    audit["exact_duplicate_rows_removed"] = int(df.duplicated().sum())
    df = df.drop_duplicates().copy()

    supplied_marks = df["Marks"].notna()
    df["Marks"] = pd.to_numeric(df["Marks"], errors="coerce")
    audit["unparseable_marks"] = int((supplied_marks & df["Marks"].isna()).sum())

    bad_marks = df["Marks"].notna() & ~df["Marks"].between(0, 100)
    audit["marks_outside_0_100"] = int(bad_marks.sum())
    df.loc[bad_marks, "Marks"] = float("nan")

    df["Attendance"] = pd.to_numeric(df["Attendance"], errors="coerce")
    bad_attendance = df["Attendance"].notna() & ~df["Attendance"].between(0, 100)
    audit["invalid_attendance"] = int(bad_attendance.sum())
    df.loc[bad_attendance, "Attendance"] = float("nan")

    audit["rows_without_name_removed"] = int(df["Name"].isna().sum())
    df = df.dropna(subset=["Name"]).copy()
    audit["cities_marked_unknown"] = int(df["City"].isna().sum())
    df["City"] = df["City"].fillna("Unknown")

    attendance_median = df["Attendance"].median()
    audit["attendance_filled_with_median"] = (
        int(df["Attendance"].isna().sum()) if pd.notna(attendance_median) else 0
    )
    if pd.notna(attendance_median):
        df["Attendance"] = df["Attendance"].fillna(attendance_median)
    df["MarksMissing"] = df["Marks"].isna()
    df = df.reset_index(drop=True)

    assert df["StudentID"].is_unique, "Review conflicting StudentID records manually"
    assert df["Name"].notna().all(), "Name is required"
    assert df["Marks"].dropna().between(0, 100).all(), "Invalid marks remain"
    assert df["Attendance"].dropna().between(0, 100).all(), "Invalid attendance remains"

    audit["output_rows"] = len(df)
    audit["unresolved_marks"] = int(df["MarksMissing"].sum())
    return df, audit


if __name__ == "__main__":
    original = make_messy_students()
    cleaned, report = clean_students(original)
    print("Original records:\n", original.to_string(index=False))
    print("\nCleaned records:\n", cleaned.to_string(index=False))
    print("\nCleaning audit:")
    for key, value in report.items():
        print(f"- {key}: {value}")
