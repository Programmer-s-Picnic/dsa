"""Regression tests for Pandas Level 3 cleaning. Run: python -m unittest discover -s python/pandas/03-clean-dataframes -p 'test_*.py'"""

import unittest

import pandas as pd

from student_cleaning import clean_students, make_messy_students


class StudentCleaningTests(unittest.TestCase):
    def test_source_is_preserved_and_audit_matches(self):
        original = make_messy_students()
        snapshot = original.copy(deep=True)
        clean, audit = clean_students(original)
        self.assertTrue(original.equals(snapshot))
        self.assertEqual(audit["input_rows"], 8)
        self.assertEqual(audit["exact_duplicate_rows_removed"], 1)
        self.assertEqual(audit["marks_outside_0_100"], 2)
        self.assertEqual(audit["unparseable_marks"], 1)
        self.assertEqual(audit["rows_without_name_removed"], 1)
        self.assertEqual(audit["output_rows"], 6)
        self.assertEqual(audit["unresolved_marks"], 3)
        self.assertEqual(audit["attendance_filled_with_median"], 1)
        self.assertEqual(audit["cities_marked_unknown"], 1)
        self.assertEqual(set(clean["City"]), {"Varanasi", "Ranchi", "Patna", "Unknown"})
        self.assertEqual(float(clean.loc[clean["Name"] == "Nina", "Attendance"].iloc[0]), 80.0)

    def test_clean_rows_satisfy_rules(self):
        clean, _ = clean_students(make_messy_students())
        self.assertTrue(clean["StudentID"].is_unique)
        self.assertTrue(clean["Name"].notna().all())
        self.assertTrue(clean["Marks"].dropna().between(0, 100).all())
        self.assertEqual(int(clean["MarksMissing"].sum()), 3)
        self.assertNotIn(106, clean["StudentID"].tolist())

    def test_conflicting_ids_require_manual_review(self):
        raw = make_messy_students()
        new_row = pd.DataFrame([{
            "StudentID": 101, "Name": "Asha", "City": "Delhi",
            "Marks": "80", "Attendance": 95,
        }])
        raw = pd.concat([raw, new_row], ignore_index=True)
        with self.assertRaisesRegex(AssertionError, "conflicting StudentID"):
            clean_students(raw)

    def test_blank_city_is_missing(self):
        raw = make_messy_students()
        raw.loc[raw["StudentID"] == 102, "City"] = "   "
        clean, audit = clean_students(raw)
        self.assertEqual(clean.loc[clean["StudentID"] == 102, "City"].iloc[0], "Unknown")
        self.assertEqual(audit["cities_marked_unknown"], 2)


if __name__ == "__main__":
    unittest.main()
