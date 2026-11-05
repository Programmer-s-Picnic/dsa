"""Tests for the four-program marks pipeline.

Run: python -m unittest discover -s . -p 'test_*.py'
"""
from pathlib import Path
import tempfile
import unittest
import pandas as pd

from program1_split import split_students
from program2_merit import build_meritlist
from program3_top_ten import choose_top_ten
from program4_subject_failures import failures_by_subject
from run_all import main as run_pipeline

BASE = Path(__file__).resolve().parent


class TestStudentAgenticWorkflow(unittest.TestCase):
    def setUp(self):
        self.raw = pd.read_csv(
            BASE / "input" / "student_marks.csv",
            dtype={"StudentID": "string"},
        )
        self.passed, self.failed = split_students(self.raw)
        self.merit = build_meritlist(self.passed)
        self.top = choose_top_ten(self.merit)
        self.by_subject = failures_by_subject(self.failed)

    def test_split_all_students_and_keep_source_unchanged(self):
        original = self.raw.copy(deep=True)
        split_students(self.raw)
        pd.testing.assert_frame_equal(original, self.raw)
        self.assertEqual(len(self.raw), 31)
        self.assertEqual(len(self.passed), 21)
        self.assertEqual(len(self.failed), 10)
        self.assertFalse(set(self.passed["StudentID"]) & set(self.failed["StudentID"]))

    def test_every_subject_must_reach_40(self):
        self.assertTrue(self.passed[["Maths", "Science", "English"]].ge(40).all().all())
        self.assertTrue(self.failed[["Maths", "Science", "English"]].lt(40).any(axis=1).all())
        self.assertIn("S006", self.passed["StudentID"].tolist())
        self.assertIn("S024", self.passed["StudentID"].tolist())

    def test_competition_ranks_and_ties(self):
        self.assertEqual(self.merit.iloc[0]["Name"], "Kabir")
        tied = self.merit[self.merit["Total"].eq(262)]
        self.assertEqual(tied["Name"].tolist(), ["Lata", "Meera"])
        self.assertEqual(tied["Rank"].tolist(), [6, 6])
        self.assertEqual(float(self.merit.iloc[0]["Percentage"]), 97.67)

    def test_strict_top_ten_tie_break(self):
        self.assertEqual(len(self.top), 10)
        self.assertEqual(self.top.iloc[9]["Name"], "Sahil")
        self.assertNotIn("Uma", self.top["Name"].tolist())
        self.assertEqual(int(self.merit.loc[self.merit["Name"].eq("Uma"), "Rank"].iloc[0]), 10)

    def test_subject_reports_overlap_and_shortfall(self):
        sizes = {name: len(frame) for name, frame in self.by_subject.items()}
        self.assertEqual(sizes, {"Maths": 5, "Science": 5, "English": 7})
        for subject, rows in self.by_subject.items():
            self.assertTrue(rows[subject].lt(40).all())
            self.assertTrue((rows["Shortfall"] == 40 - rows[subject]).all())
        self.assertTrue(all("S019" in frame["StudentID"].tolist() for frame in self.by_subject.values()))
        union = set().union(*(set(v["StudentID"]) for v in self.by_subject.values()))
        self.assertEqual(union, set(self.failed["StudentID"]))

    def test_reject_invalid_marks(self):
        invalid = self.raw.copy()
        invalid.loc[0, "Maths"] = 150
        with self.assertRaisesRegex(ValueError, "between 0 and 100"):
            split_students(invalid)
        invalid2 = self.raw.copy()
        invalid2.loc[0, "Maths"] = "absent"
        with self.assertRaisesRegex(ValueError, "missing/non-numeric"):
            split_students(invalid2)

    def test_reject_duplicate_ids_and_blank_names(self):
        repeated = pd.concat([self.raw, self.raw.iloc[[0]]], ignore_index=True)
        with self.assertRaisesRegex(ValueError, "Duplicate StudentID"):
            split_students(repeated)
        missing_name = self.raw.copy()
        missing_name.loc[0, "Name"] = "   "
        with self.assertRaisesRegex(ValueError, "Name cannot"):
            split_students(missing_name)

    def test_empty_subject_output_has_header(self):
        all_pass = self.raw.loc[self.raw["StudentID"].eq("S006")].copy()
        passed, failed = split_students(all_pass)
        self.assertEqual(len(failed), 0)
        self.assertEqual(len(choose_top_ten(build_meritlist(passed))), 1)
        reports = failures_by_subject(failed)
        self.assertEqual([len(x) for x in reports.values()], [0, 0, 0])
        self.assertIn("Shortfall", reports["Maths"].columns)

    def test_individual_files_and_orchestrator(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / "input").mkdir()
            self.raw.to_csv(root / "input" / "student_marks.csv", index=False)
            result = run_pipeline(root)
            self.assertEqual(len(result["top_ten"]), 10)
            for name in ("passed.csv", "failed.csv", "meritlist.csv",
                         "top_ten.csv", "failed-inmaths.csv",
                         "failed-inscience.csv", "failed-inenglish.csv"):
                expected = pd.read_csv(BASE / "output" / name, dtype={"StudentID": "string"})
                actual = pd.read_csv(root / "output" / name, dtype={"StudentID": "string"})
                pd.testing.assert_frame_equal(expected, actual, check_dtype=False)


if __name__ == "__main__":
    unittest.main()
