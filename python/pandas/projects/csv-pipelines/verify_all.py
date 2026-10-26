"""Verify all three multilevel CSV pipelines and their published golden snapshots.

Usage (from repository root):
    python python/pandas/projects/csv-pipelines/verify_all.py
"""
from pathlib import Path
import subprocess
import sys
import pandas as pd

ROOT = Path(__file__).resolve().parent
PROJECTS = ("student-results", "grocery-inventory", "exam-analysis")
OUTPUTS = [f"stage{i:02d}.csv" for i in range(1, 6)] + ["report.csv"]


def check_project(name):
    folder = ROOT / name
    expected = {}
    for filename in OUTPUTS:
        path = folder / "output" / filename
        if not path.exists():
            raise FileNotFoundError(f"Missing sample output: {path}")
        expected[filename] = pd.read_csv(path)

    print(f"\nCHECKING: {name}", flush=True)
    subprocess.run([sys.executable, "run_pipeline.py"], cwd=folder, check=True)
    for filename in OUTPUTS:
        actual = pd.read_csv(folder / "output" / filename)
        pd.testing.assert_frame_equal(
            expected[filename], actual, check_dtype=False,
            check_exact=False, rtol=1e-8, atol=1e-6,
            obj=f"{name}/output/{filename}",
        )
        print(f"  PASS: {filename} ({len(actual)} rows)", flush=True)
    subprocess.run(
        [sys.executable, "-m", "unittest", "discover", "-s", ".",
         "-p", "test_*.py"],
        cwd=folder, check=True,
    )
    print(f"  PASS: tests for {name}", flush=True)


if __name__ == "__main__":
    for project in PROJECTS:
        check_project(project)
    print("\nALL PIPELINES AND GOLDEN CSV SNAPSHOTS VERIFIED")
