"""Sequential CSV pipeline. Each stage reads its predecessor's CSV and writes the next."""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "output"


def require(frame, names):
    missing = sorted(set(names).difference(frame.columns))
    if missing:
        raise ValueError("Missing required columns: " + ", ".join(missing))

def stage01(df):
    require(df, ["ProductID", "Name", "Category", "CostPrice", "SellingPrice", "OpeningStock"])
    if df["ProductID"].isna().any() or df["ProductID"].duplicated().any():
        raise ValueError("ProductID must be unique")
    for col in ["Name", "Category"]:
        df[col] = df[col].astype("string").str.strip()
        if df[col].isna().any() or df[col].eq("").any():
            raise ValueError(f"{col} is required")
    for col in ["CostPrice", "SellingPrice", "OpeningStock"]:
        df[col] = pd.to_numeric(df[col], errors="raise")
        if df[col].isna().any() or df[col].lt(0).any():
            raise ValueError(f"{col} cannot be missing or negative")
    if not df["OpeningStock"].mod(1).eq(0).all():
        raise ValueError("OpeningStock must be whole units")
    return df


def stage02(df):
    sales = pd.read_csv(ROOT / "input" / "sales.csv")
    require(sales, ["SaleID", "ProductID", "Quantity"])
    if sales["SaleID"].duplicated().any() or sales["SaleID"].isna().any():
        raise ValueError("SaleID must be unique")
    if not set(sales["ProductID"]).issubset(set(df["ProductID"])):
        raise ValueError("Unknown ProductID in sales")
    sales["Quantity"] = pd.to_numeric(sales["Quantity"], errors="raise")
    if sales["Quantity"].isna().any() or not sales["Quantity"].gt(0).all() or not sales["Quantity"].mod(1).eq(0).all():
        raise ValueError("Sales quantities must be positive whole numbers")
    units = sales.groupby("ProductID", as_index=False)["Quantity"].sum().rename(columns={"Quantity":"UnitsSold"})
    df = df.merge(units, on="ProductID", how="left", validate="one_to_one")
    df["UnitsSold"] = df["UnitsSold"].fillna(0).astype(int)
    return df


def stage03(df):
    df["StockLeft"] = df["OpeningStock"] - df["UnitsSold"]
    if df["StockLeft"].lt(0).any():
        raise ValueError("Cannot sell more than available stock")
    df["Revenue"] = df["UnitsSold"] * df["SellingPrice"]
    return df


def stage04(df):
    df["CostOfGoods"] = df["UnitsSold"] * df["CostPrice"]
    df["GrossProfit"] = df["Revenue"] - df["CostOfGoods"]
    df["ProfitMarginPct"] = (100 * df["GrossProfit"] / df["Revenue"].replace(0, float("nan"))).fillna(0).round(2)
    df["RemainingStockCost"] = df["StockLeft"] * df["CostPrice"]
    return df


def stage05(df):
    df["CategoryRevenue"] = df.groupby("Category")["Revenue"].transform("sum")
    df["CategoryProfit"] = df.groupby("Category")["GrossProfit"].transform("sum")
    df["CategoryProfitRank"] = df.groupby("Category")["GrossProfit"].rank(
        method="min", ascending=False).astype(int)
    return df


def stage06(df):
    return df.sort_values(["GrossProfit", "Name"], ascending=[False, True]).reset_index(drop=True)


STAGES = [stage01, stage02, stage03, stage04, stage05, stage06]


def run_stage(number):
    if not isinstance(number, int) or number not in range(1, 7):
        raise ValueError("Stage number must be 1 to 6")
    source = ROOT / ("input/products.csv" if number == 1 else f"output/stage{number - 1:02d}.csv")
    if not source.exists():
        raise FileNotFoundError(f"Missing {source}. Run the previous stage first.")
    df = pd.read_csv(source)
    result = STAGES[number - 1](df.copy())
    if not isinstance(result, pd.DataFrame):
        raise TypeError(f"Stage {number} did not return a DataFrame")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    destination = OUTPUT / ("report.csv" if number == 6 else f"stage{number:02d}.csv")
    result.to_csv(destination, index=False, encoding="utf-8")
    print(f"Stage {number}: {source.name} ({len(df)} rows) -> {destination.name} ({len(result)} rows)")
    return result


def run_all():
    return [run_stage(i) for i in range(1, 7)]
