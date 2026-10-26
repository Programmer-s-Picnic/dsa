import unittest
import pandas as pd
from pipeline import ROOT, run_all, stage03

class TestGrocery(unittest.TestCase):
    def test_pipeline(self):
        run_all()
        df = pd.read_csv(ROOT / "output" / "report.csv")
        self.assertEqual(len(df), 5)
        self.assertEqual(int(df["UnitsSold"].sum()), 73)
        self.assertEqual(int(df["StockLeft"].sum()), 187)
        self.assertEqual(int(df["Revenue"].sum()), 3050)
        self.assertEqual(int(df["GrossProfit"].sum()), 910)
        self.assertEqual(int(df.loc[df.Name=="Milk", "GrossProfit"].iloc[0]), 260)
        self.assertEqual(int(df.loc[df.Name=="Tomato", "CategoryProfit"].iloc[0]), 450)
    def test_overselling_rejected(self):
        example = pd.DataFrame({"OpeningStock":[1], "UnitsSold":[2], "SellingPrice":[20]})
        with self.assertRaisesRegex(ValueError, "available stock"):
            stage03(example)
if __name__ == "__main__":
    unittest.main()
