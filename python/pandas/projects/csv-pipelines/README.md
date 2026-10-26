# Pandas Multilevel CSV Projects

Three hands-on six-stage pipelines for Programmer's Picnic's Pandas 0 to Infinity course.

## Projects

1. [Student results](student-results/) — registration → marks → totals → grades → city summaries → report.
2. [Grocery inventory](grocery-inventory/) — products → sales → stock → profit → category summaries → report.
3. [Competitive exam analysis](exam-analysis/) — candidate responses → answer key → scoring → subject summary → ranking → report.

## Run

```bash
python -m pip install pandas
cd student-results
python run_pipeline.py
python -m unittest discover -s . -p 'test_*.py'
```

Every project has six executable stage scripts, `run_pipeline.py`, a processing library `pipeline.py`, synthetic `input/*.csv`, sample intermediate `output/*.csv`, an incomplete `starter.py`, automated tests, and detailed project notes.

The CSV inspector on the [course site](https://dsa.learnwithchampak.live/python/pandas/projects/csv-pipelines/) displays committed CSV files side-by-side. Static HTML cannot execute Python, so run the real pipeline in Python locally.

All project data is synthetic. Developed and maintained by Champak Roy.
