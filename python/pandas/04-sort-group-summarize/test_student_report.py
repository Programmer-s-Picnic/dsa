"""Regression checks for Pandas Level 4. Run:
python -m unittest discover -s python/pandas/04-sort-group-summarize -p 'test_*.py'
"""

import unittest
import pandas as pd
from student_report import make_report, make_students


class LevelFourReportTests(unittest.TestCase):
    def setUp(self):
        self.source = make_students()
        self.original = self.source.copy(deep=True)
        self.report = make_report(self.source)

    def test_preserves_original_input_and_missing_mark(self):
        self.assertTrue(self.source.equals(self.original))
        self.assertEqual(self.report["overview"]["total_students"], 12)
        self.assertEqual(self.report["overview"]["marks_recorded"], 11)
        self.assertEqual(self.report["overview"]["marks_missing"], 1)
        self.assertEqual(self.report["overview"]["total_study_hours"], 68.0)
        self.assertAlmostEqual(self.report["overview"]["overall_average"], 75.82)

    def test_city_grouping_and_count_vs_size(self):
        rows = self.report["city_report"].set_index("City")
        self.assertEqual(int(rows.loc["Patna", "Students"]), 3)
        self.assertEqual(int(rows.loc["Patna", "ValidMarks"]), 2)
        self.assertAlmostEqual(float(rows.loc["Patna", "AverageMarks"]), 90.50)
        self.assertEqual(int(rows.loc["Varanasi", "Students"]), 5)
        self.assertAlmostEqual(float(rows.loc["Varanasi", "AverageMarks"]), 80.40)

    def test_course_aggregation(self):
        courses = self.report["course_report"].set_index("Course")
        self.assertEqual(int(courses.loc["Python", "Students"]), 4)
        self.assertEqual(int(courses.loc["Python", "ValidMarks"]), 3)
        self.assertAlmostEqual(float(courses.loc["Python", "AverageMarks"]), 71.33)
        self.assertEqual(int(courses.loc["SQL", "TotalHours"]), 26)

    def test_ranking_and_grouped_top_students(self):
        self.assertEqual(self.report["leaderboard"].iloc[0]["Name"], "Pooja")
        self.assertEqual(len(self.report["top_two_per_city"]), 6)
        patna = self.report["top_two_per_city"].query("City == 'Patna'")
        self.assertEqual(patna["Name"].tolist(), ["Kabir", "Tara"])

    def test_transform_handles_missing_marks(self):
        comparison = self.report["compared"].set_index("Name")
        self.assertAlmostEqual(float(comparison.loc["Asha", "CityAverage"]), 80.4)
        self.assertTrue(bool(comparison.loc["Asha", "AboveCityAverage"]))
        self.assertTrue(pd.isna(comparison.loc["Arjun", "AboveCityAverage"]))

    def test_invalid_input_is_rejected(self):
        bad = self.source.copy()
        bad.loc[0, "Marks"] = 150
        with self.assertRaisesRegex(ValueError, "between 0 and 100"):
            make_report(bad)

        repeated = pd.concat([self.source, self.source.iloc[[0]]], ignore_index=True)
        with self.assertRaisesRegex(ValueError, "StudentID must be unique"):
            make_report(repeated)


if __name__ == "__main__":
    unittest.main()
