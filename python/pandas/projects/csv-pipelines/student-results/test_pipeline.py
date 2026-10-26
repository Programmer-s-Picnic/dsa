import unittest
import pandas as pd
from pipeline import ROOT, run_all, run_stage

class TestResults(unittest.TestCase):
    def test_pipeline(self):
        stages = run_all()
        self.assertEqual(len(stages), 6)
        df = pd.read_csv(ROOT / "output" / "report.csv")
        self.assertEqual(len(df), 6)
        self.assertEqual(df.iloc[0]["Name"], "Kabir")
        self.assertEqual(df.iloc[0]["Total"], 280)
        self.assertEqual(df.iloc[1]["Name"], "Asha")
        self.assertEqual(df["Result"].value_counts().to_dict(), {"PASS": 5, "INCOMPLETE": 1})
        self.assertEqual(df.loc[df.Name=="Dev", "Grade"].iloc[0], "INC")
        self.assertTrue(pd.isna(df.loc[df.Name=="Dev","Total"].iloc[0]))
    def test_missing_predecessor_is_caught(self):
        with self.assertRaises(ValueError):
            run_stage(0)
if __name__ == "__main__":
    unittest.main()
