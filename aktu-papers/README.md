# AKTU B.Tech question-paper library

Published at https://dsa.learnwithchampak.live/aktu-papers/

This independent index helps students find previous-year AKTU examination PDFs. It is **not** an official AKTU or Ashoka Institute site.

## Features
- Fast case-insensitive metadata search: subject name, course code, exam year, semester
- Filters: semester and year; sortable results
- External PDF links, source pages and curated alternative archives
- Accessible responsive UI; no dependencies or backend; works with GitHub Pages
- JSON catalog editable in `papers.json`

## Adding papers
Add a record under `papers` in `papers.json` with: `semester` (1–8), `subject`, `code`, `year`, `branch`, `type`, `url`, `source`, `status`. Use confirmed PDF addresses only. Archives may be recorded under `archives`. The page immediately indexes new records.

The full text inside linked PDFs is **not** indexed: that requires a separate extraction/indexing pipeline. Links can break when third-party hosts move or remove files.
