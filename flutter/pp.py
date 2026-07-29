import pandas as pd
import matplotlib.pyplot as plt
trainnumbers = [100, 101, 102, 103]
dftrains = pd.DataFrame({"trainno": trainnumbers, "trainname": ["TOne", "TOne", "TTwo", "TTwo"], "src": [
                        "vns", "ndls", "ndls", "vns"], "dest": ["ndls", "vns", "vns", "ndls"]}, index=trainnumbers)


dfstops = pd.DataFrame(
    {
        "station": [
            "vns", "pryj", "cnb", "ndls",
            "ndls", "cnb", "pryj", "vns",
            "ndls", "agra", "pryj", "vns",
            "vns", "pryj", "agra", "ndls"
        ],
        "distance": [
            0, 120, 320, 760,
            0, 440, 640, 760,
            0, 230, 640, 760,
            0, 120, 530, 760
        ]
    },
    index=pd.MultiIndex.from_tuples(
        [
            (100, 1), (100, 2), (100, 3), (100, 4),
            (101, 1), (101, 2), (101, 3), (101, 4),
            (102, 1), (102, 2), (102, 3), (102, 4),
            (103, 1), (103, 2), (103, 3), (103, 4)
        ],
        names=["trainno", "stopno"]
    )
)

print(dfstops)


print(dftrains)
print(dfstops)

dftrainsandstops = pd.merge(dftrains, dfstops, on="trainno")
print(dftrainsandstops)
dftrainsfromagra = dftrainsandstops[dftrainsandstops["station"] == "agra"]
print(dftrainsfromagra)
dftrainsfromvns = dftrainsandstops[dftrainsandstops["station"] == "vns"]
print(dftrainsfromvns)
