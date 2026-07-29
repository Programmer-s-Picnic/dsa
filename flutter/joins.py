
import pandas as pd

dfcricketers = pd.DataFrame(
    {
        "runs": [1, 2]
    },
    index=["A", "C"]
)

dfcricketers.index.name = "name"

print(dfcricketers)


dffootballers = pd.DataFrame(
    {
        "goals": [2, 3]
    },
    index=["B", "C"]
)


dfinner = dfcricketers.join(
    dffootballers,
    how="inner"
)

print("Inner\n", dfinner)


dfleft = dfcricketers.join(
    dffootballers,
    how="left"
)

print("Left\n", dfleft)

dfright = dfcricketers.join(
    dffootballers,
    how="right"
)

print("Right\n", dfright)


dfouter = dfcricketers.join(
    dffootballers,
    how="outer"
)

print("Outer\n", dfouter)
