"""Pandas 0 to Infinity — Level 4: sorting and summarising DataFrames.

Run directly: python python/pandas/04-sort-group-summarize/student_report.py
No CSV, Excel or database file is required.
"""

import pandas as pd


def make_students():
    """Create clean, validated sample data with one legitimately missing mark."""
    return pd.DataFrame([
        (101, "Asha", "Varanasi", "Python", 88, 6),
        (102, "Ravi", "Ranchi", "Python", 42, 4),
        (103, "Meera", "Varanasi", "Pandas", 76, 8),
        (104, "Kabir", "Patna", "Pandas", 91, 7),
        (105, "Nina", "Ranchi", "Python", 84, 5),
        (106, "Ishan", "Varanasi", "SQL", 67, 3),
        (107, "Tara", "Patna", "SQL", 90, 9),
        (108, "Rahul", "Varanasi", "Pandas", 76, 6),
        (109, "Sita", "Ranchi", "Pandas", 55, 4),
        (110, "Arjun", "Patna", "Python", None, 2),
        (111, "Pooja", "Varanasi", "SQL", 95, 8),
        (112, "Dev", "Ranchi", "SQL", 70, 6),
    ], columns=["StudentID", "Name", "City", "Course", "Marks", "Hours"])


def make_report(source):
    """Return independently useful report tables without changing input data."""
    df = source.copy(deep=True)
    required = {"StudentID", "Name", "City", "Course", "Marks", "Hours"}
    if not required.issubset(df.columns):
        raise ValueError("Missing required report columns")
    if df["StudentID"].duplicated().any():
        raise ValueError("StudentID must be unique; review duplicate records")
    if not pd.api.types.is_numeric_dtype(df["Marks"]):
        raise TypeError("Marks must be numeric; clean input before grouping")
    if not pd.api.types.is_numeric_dtype(df["Hours"]):
        raise TypeError("Hours must be numeric; clean input before grouping")
    if not df["Marks"].dropna().between(0, 100).all():
        raise ValueError("Marks must be between 0 and 100")
    if not df["Hours"].dropna().ge(0).all():
        raise ValueError("Hours cannot be negative")

    leaderboard = (
        df.sort_values(
            ["Marks", "Name"], ascending=[False, True], na_position="last"
        )[["Name", "City", "Course", "Marks"]]
        .head(5)
        .reset_index(drop=True)
    )

    city_report = (
        df.groupby("City", as_index=False)
        .agg(
            Students=("StudentID", "size"),
            ValidMarks=("Marks", "count"),
            AverageMarks=("Marks", "mean"),
            HighestMarks=("Marks", "max"),
            TotalHours=("Hours", "sum"),
        )
        .round({"AverageMarks": 2})
        .sort_values(["AverageMarks", "City"], ascending=[False, True])
        .reset_index(drop=True)
    )

    course_report = (
        df.groupby("Course", as_index=False)
        .agg(
            Students=("StudentID", "size"),
            ValidMarks=("Marks", "count"),
            AverageMarks=("Marks", "mean"),
            TotalHours=("Hours", "sum"),
        )
        .round({"AverageMarks": 2})
        .sort_values(["AverageMarks", "Course"], ascending=[False, True])
        .reset_index(drop=True)
    )

    city_course = (
        df.groupby(["City", "Course"], as_index=False)
        .agg(Students=("StudentID", "size"), AverageMarks=("Marks", "mean"))
        .round({"AverageMarks": 2})
        .sort_values(["City", "Course"])
        .reset_index(drop=True)
    )

    top_two_per_city = (
        df.sort_values(
            ["City", "Marks", "Name"],
            ascending=[True, False, True],
            na_position="last",
        )
        .groupby("City", sort=False)
        .head(2)[["City", "Name", "Marks"]]
        .reset_index(drop=True)
    )

    compared = df.copy()
    compared["CityAverage"] = (
        compared.groupby("City")["Marks"].transform("mean").round(2)
    )
    compared["AboveCityAverage"] = (
        compared["Marks"].gt(compared["CityAverage"])
        .where(compared["Marks"].notna(), pd.NA)
    )

    overview = {
        "total_students": int(len(df)),
        "marks_recorded": int(df["Marks"].count()),
        "marks_missing": int(df["Marks"].isna().sum()),
        "overall_average": float(round(df["Marks"].mean(), 2)),
        "total_study_hours": float(df["Hours"].sum()),
    }

    return {
        "overview": overview,
        "leaderboard": leaderboard,
        "city_report": city_report,
        "course_report": course_report,
        "city_course": city_course,
        "top_two_per_city": top_two_per_city,
        "compared": compared,
    }


if __name__ == "__main__":
    students = make_students()
    report = make_report(students)
    print("OVERVIEW")
    for label, value in report["overview"].items():
        print(f"{label}: {value}")
    for title in (
        "leaderboard", "city_report", "course_report",
        "city_course", "top_two_per_city",
    ):
        print("\n" + title.upper())
        print(report[title].to_string(index=False))
    print("\nCITY AVERAGE COMPARISON")
    print(report["compared"][["Name", "City", "Marks", "CityAverage", "AboveCityAverage"]].to_string(index=False))
