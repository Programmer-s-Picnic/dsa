import unittest
import pandas as pd
from pipeline import ROOT, run_all, stage01

class TestExam(unittest.TestCase):
    def test_scores_and_rank(self):
        run_all()
        df = pd.read_csv(ROOT / "output" / "report.csv")
        self.assertEqual(df["CandidateID"].tolist(), ["C01", "C04", "C02", "C03"])
        self.assertEqual(df["Score"].astype(int).tolist(), [24, 19, 10, 5])
        self.assertEqual(df["Rank"].astype(int).tolist(), [1, 2, 3, 4])
        ravi = df.loc[df.CandidateID=="C02"].iloc[0]
        self.assertEqual(int(ravi["Unattempted"]), 1)
        self.assertEqual(float(ravi["AccuracyPct"]), 60.0)
        sub = pd.read_csv(ROOT / "output" / "stage04.csv")
        self.assertEqual(len(sub), 12)
    def test_duplicate_question_rejected(self):
        df = pd.DataFrame({"CandidateID":["C01","C01"],"QuestionID":["Q1","Q1"],"Answer":["A","B"]})
        with self.assertRaisesRegex(ValueError, "same question twice"):
            stage01(df)
if __name__ == "__main__":
    unittest.main()
