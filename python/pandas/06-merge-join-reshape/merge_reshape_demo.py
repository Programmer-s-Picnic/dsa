"""Pandas Level 6 — merging and reshaping."""
import pandas as pd

students = pd.DataFrame({
    "StudentId": [1, 2, 3, 4],
    "Name": ["Asha", "Ravi", "Meera", "Kabir"],
    "City": ["Varanasi", "Ranchi", "Varanasi", "Patna"],
})
courses = pd.DataFrame({
    "CourseId": ["P", "S", "A"],
    "Course": ["Python", "SQL", "AI-ML"],
})
enrolments = pd.DataFrame({
    "StudentId": [1, 1, 2, 3, 4],
    "CourseId": ["P", "S", "P", "A", "S"],
})
payments = pd.DataFrame({
    "StudentId": [1, 2, 3],
    "Amount": [2500, 1800, 3000],
})

report = (
    enrolments
    .merge(students, on="StudentId", validate="many_to_one")
    .merge(courses, on="CourseId", validate="many_to_one")
    .merge(payments, on="StudentId", how="left", validate="many_to_one", indicator="payment_match")
)

print("Combined report:")
print(report)
print("\nUnmatched payment status:")
print(report["payment_match"].value_counts())

pivot = report.pivot_table(
    index="City",
    columns="Course",
    values="Amount",
    aggfunc="sum",
    fill_value=0,
)
print("\nCity × course payments:")
print(pivot)

long = pivot.reset_index().melt(id_vars="City", var_name="Course", value_name="Amount")
print("\nLong form:")
print(long)
