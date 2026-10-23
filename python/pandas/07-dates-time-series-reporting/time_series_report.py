"""Pandas Level 7 — dates, time series, charts and reporting."""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

HERE = Path(__file__).resolve().parent
SOURCE = HERE / "daily_sales.csv"

df = pd.read_csv(SOURCE, parse_dates=["Date"])
required = {"Date", "City", "Amount"}
missing = required.difference(df.columns)
if missing:
    raise ValueError(f"Missing columns: {sorted(missing)}")

df["Amount"] = pd.to_numeric(df["Amount"], errors="raise")
df = df.sort_values("Date")

daily = df.groupby("Date")["Amount"].sum().to_frame()
daily["MA_3"] = daily["Amount"].rolling(window=3).mean()
daily["Previous"] = daily["Amount"].shift(1)
daily["PctChange"] = daily["Amount"].pct_change() * 100

weekly = daily["Amount"].resample("W").agg(["sum", "mean", "count"])
monthly = daily["Amount"].resample("ME").sum()
city = df.groupby("City")["Amount"].agg(["sum", "mean", "count"]).sort_values("sum", ascending=False)

daily.to_csv(HERE / "daily_report.csv")
weekly.to_csv(HERE / "weekly_report.csv")
monthly.to_csv(HERE / "monthly_report.csv", header=["Amount"])
city.to_csv(HERE / "city_report.csv")

ax = daily[["Amount", "MA_3"]].plot(title="Daily Sales and 3-Day Moving Average")
ax.set_xlabel("Date")
ax.set_ylabel("Amount")
fig = ax.get_figure()
fig.tight_layout()
fig.savefig(HERE / "daily_sales.png", dpi=160)
plt.close(fig)

with open(HERE / "city_report.html", "w", encoding="utf-8") as f:
    f.write("<h1>City Sales Report</h1>")
    f.write(city.to_html(border=0))

print("Daily report:")
print(daily)
print("\nWeekly report:")
print(weekly)
print("\nMonthly report:")
print(monthly)
print("\nCity report:")
print(city)
print("\nReports saved in:", HERE)
