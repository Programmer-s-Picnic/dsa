"""Run every CSV processing stage sequentially."""
from pipeline import run_all

if __name__ == "__main__":
    run_all()
    print("Success: output/report.csv")
