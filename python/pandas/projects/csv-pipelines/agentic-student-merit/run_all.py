"""The coordinator: runs four independent CSV-processing programs.

Program 1 produces BOTH passed.csv and failed.csv.
Program 2 consumes passed.csv, then Program 3 consumes meritlist.csv.
Program 4 consumes failed.csv independently of Programs 2 and 3.
"""
from pathlib import Path
import pandas as pd

from program1_split import main as split
from program2_merit import main as merit
from program3_top_ten import main as top_ten
from program4_subject_failures import main as failures

BASE = Path(__file__).resolve().parent


def main(base=None):
    base = Path(base) if base is not None else BASE
    print("START: Student marks CSV processing workflow")
    passed, failed = split(base)
    merit_list = merit(base)
    top = top_ten(base)
    subject_reports = failures(base)

    student_count = len(pd.read_csv(base / "input" / "student_marks.csv"))
    if student_count != len(passed) + len(failed):
        raise RuntimeError("Some students disappeared during the split")
    if len(merit_list) != len(passed):
        raise RuntimeError("Merit list does not contain every passed student")
    if len(top) != min(10, len(merit_list)):
        raise RuntimeError("Top ten count is incorrect")

    all_failed = set(failed["StudentID"].astype(str))
    union_subjects = set()
    for report in subject_reports.values():
        union_subjects.update(report["StudentID"].astype(str))
    if union_subjects != all_failed:
        raise RuntimeError("Some failed students are missing from subject reports")

    print("\nCOMPLETE: all outputs verified")
    print("Notice: students failing multiple subjects appear in multiple subject files.")
    return {"passed": passed, "failed": failed, "merit": merit_list,
            "top_ten": top, "subjects": subject_reports}


if __name__ == "__main__":
    main()
