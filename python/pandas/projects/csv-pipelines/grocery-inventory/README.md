# Grocery Inventory & Sales — Multilevel Pandas CSV Project

This project is entirely local and uses synthetic teaching data.

## Quick start

```bash
python -m pip install pandas
cd python/pandas/projects/csv-pipelines/grocery-inventory
python run_pipeline.py
python -m unittest discover -s . -p 'test_*.py'
```

## Stage-by-stage mode

Run `python stage01.py`, then `python stage02.py`, and continue through `python stage06.py`. Every script reads the CSV produced by the previous stage. Running a later stage first raises a clear file-not-found error. `run_pipeline.py` executes all six in order.

## Data flow

1. `stage01.py` — Validate product master. Reads `input/products.csv`, writes `output/stage01.csv`. Validate IDs, category, cost, selling price and opening stock.
2. `stage02.py` — Aggregate sales. Reads `output/stage01.csv`, writes `output/stage02.csv`. Check transactions and merge total units sold into the product table.
3. `stage03.py` — Calculate stock and revenue. Reads `output/stage02.csv`, writes `output/stage03.csv`. Subtract units sold and compute revenue, refusing oversold stock.
4. `stage04.py` — Calculate gross profit. Reads `output/stage03.csv`, writes `output/stage04.csv`. Compute cost of goods sold, gross profit and profit margin.
5. `stage05.py` — Category analysis. Reads `output/stage04.csv`, writes `output/stage05.csv`. Add category totals and rank profitable products.
6. `stage06.py` — Export financial report. Reads `output/stage05.csv`, writes `output/report.csv`. Produce the final stock and gross-profit report.

Additional input files: `input/sales.csv` (joined at the stage indicated in the lesson).

The committed `output/` files are **sample output snapshots**, not a substitute for executing the scripts yourself. You can compare your generated output with them and inspect every stage on the website.

## Extension challenge

Reject unknown products, duplicate transactions, negative quantities and overselling. Create a copy of an input CSV and introduce one of those errors. Make the pipeline reject the invalid file without silently corrupting later stages.

## Notes

- Each stage uses `pandas.read_csv`, then transforms a DataFrame, then calls `to_csv(index=False)`.
- Never edit intermediate output files manually when testing; modify the input copy or the stage code and rerun from the beginning.
- Pipeline CSVs are plain-text data, not an encrypted storage system. Do not upload real personal, school, or financial records.
- Developed and maintained by Champak Roy · Programmer's Picnic.
