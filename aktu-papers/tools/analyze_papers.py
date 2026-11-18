#!/usr/bin/env python3
"""Audit extracted AKTU question texts and propose repeated-question groups.
Usage: python tools/analyze_papers.py extracted-papers/ > repeat-candidates.json

Input: each *.txt is extracted from an actual university paper and named
CODE_YEAR.txt, e.g. BCS301_2025.txt. Review candidates against original PDFs.
This tool NEVER promotes similarity to a verified repeat automatically.
Standard library only.
"""
import collections
import difflib
import json
import pathlib
import re
import sys

STOP={"the","and","or","of","a","an","to","in","for","with","is","are","what","explain","describe","how","write","discuss","define","differentiate","between","following","briefly","short","note","marks"}
PATTERN=re.compile(r"^\s*(?:Q(?:uestion)?\s*)?(?:[1-9][0-9]?[.)]|\([a-z]\)|[a-z][.)])\s+(.{18,})$",re.I)
def normalize(text):
    return " ".join(x for x in re.findall(r"[a-z0-9]+",text.lower()) if x not in STOP)
def questions(text):
    result=[]
    for line in text.splitlines():
        line=re.sub(r"\s+"," ",line).strip()
        m=PATTERN.match(line)
        if m: result.append(m.group(1))
    return result
def main():
    directory=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else "extracted-papers")
    files=sorted(directory.glob("*.txt"))
    grouped=collections.defaultdict(list)
    for file in files:
        m=re.match(r"([A-Za-z]{2,6}\d{2,4})[_-](20\d\d)",file.stem)
        if not m: continue
        code,year=m.group(1).upper(),int(m.group(2))
        for number,q in enumerate(questions(file.read_text(encoding="utf-8",errors="replace")),1):
            grouped[code].append({"question":q,"normalized":normalize(q),"year":year,"paperFile":file.name,"lineCandidate":number})
    output={"schemaVersion":1,"mode":"review_required","warning":"Heuristic duplicates are candidate groups, NOT verified past-paper repetitions. Verify every question against the original PDFs and note page/question numbers.","subjects":{}}
    for code,items in sorted(grouped.items()):
        clusters=[]
        for item in items:
            matches=[cluster for cluster in clusters if difflib.SequenceMatcher(None,item["normalized"],cluster[0]["normalized"]).ratio()>=0.80]
            if matches:matches[0].append(item)
            else:clusters.append([item])
        candidates=[]
        for cluster in clusters:
            years=sorted(set(i["year"] for i in cluster))
            if len(years)<2:continue
            candidates.append({"sampleQuestion":cluster[0]["question"],"candidateYears":years,"distinctYearCount":len(years),"verification":"pending_manual_pdf_review","occurrences":[{"year":i["year"],"paper":i["paperFile"],"question":i["question"]} for i in cluster]})
        output["subjects"][code]={"papersFound":len({i["paperFile"] for i in items}),"questionCandidates":len(items),"repeatedQuestionCandidates":sorted(candidates,key=lambda x:-x["distinctYearCount"])}
    print(json.dumps(output,indent=2,ensure_ascii=False))
if __name__=="__main__":
    main()
