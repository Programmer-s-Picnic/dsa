#!/usr/bin/env python3
"""Non-destructive SEO audit and metadata updater for published HTML pages."""
from pathlib import Path
import html, re, json
ROOT = Path(__file__).resolve().parents[1]
BASE = "https://dsa.learnwithchampak.live"
IMAGE = BASE + "/assets/images/og-aiml-champak-roy-varanasi.png"
EXCLUDE = ("spring/e-commerce/spring-boot-reference/src/", "projects/kbc-quiz-project/angular-version/src/", "projects/kbc/tracks/angular/final-project/src/")
def meta_present(head, key, typ="name"):
    return bool(re.search(r'<meta\b(?=[^>]*\b'+typ+r'\s*=\s*["\']'+re.escape(key)+r'["\'])[^>]*>', head, re.I))
def attr(s):
    return html.escape(s, quote=True)
def update(path):
    p = path.relative_to(ROOT).as_posix()
    if p in ("header.html", "footer.html", "googleb7b1c7873cdfb988.html") or p.startswith(EXCLUDE):
        return False
    content = path.read_text(encoding="utf-8")
    m = re.search(r'<head(?:\s[^>]*)?>', content, re.I)
    close = re.search(r'</head\s*>', content, re.I)
    if not m or not close: return False
    head = content[m.end():close.start()]
    title_match = re.search(r'<title[^>]*>(.*?)</title>', head, re.I | re.S)
    title = html.unescape(re.sub(r'<[^>]+>', '', title_match.group(1))).strip() if title_match else p.replace("/", " ").replace(".html", "")
    title = re.sub(r'\s+', ' ', title)[:125]
    desc_match = re.search(r'<meta\b(?=[^>]*\bname\s*=\s*["\']description["\'])[^>]*>', head, re.I)
    existing_desc = None
    if desc_match:
        attrmatch = re.search(r'\bcontent\s*=\s*(["\'])(.*?)\1', desc_match.group(0), re.I | re.S)
        if attrmatch: existing_desc = html.unescape(attrmatch.group(2))
    desc = existing_desc or ("Learn " + title.split("|")[0].strip()[:70] + " with Champak Roy at Programmer's Picnic. Explore practical examples, lessons and programming exercises.")
    desc = desc[:160]
    url = BASE + "/" + (p[:-10] if p.endswith("/index.html") else p)
    tags = []
    for key, val in (("description", desc), ("author", "Champak Roy"), ("robots", "index, follow, max-image-preview:large"), ("twitter:card", "summary_large_image"), ("twitter:title", title), ("twitter:description", desc), ("twitter:image", IMAGE)):
        if not meta_present(head, key): tags.append(f'<meta name="{key}" content="{attr(val)}">')
    for key,val in (("og:type", "article"), ("og:site_name", "Programmer\'s Picnic"), ("og:title", title), ("og:description", desc), ("og:url", url), ("og:image", IMAGE)):
        if not meta_present(head, key, "property"): tags.append(f'<meta property="{key}" content="{attr(val)}">')
    canonical = re.search(r'<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>', head, re.I)
    if canonical:
        if not p.startswith("projects/"): head = head.replace(canonical.group(0), f'<link rel="canonical" href="{attr(url)}">')
    else: tags.append(f'<link rel="canonical" href="{attr(url)}">')
    ogurl = re.search(r'<meta\b(?=[^>]*\bproperty\s*=\s*["\']og:url["\'])[^>]*>', head, re.I)
    if ogurl and not p.startswith("projects/"): head = head.replace(ogurl.group(0), f'<meta property="og:url" content="{attr(url)}">')
    updated = content[:m.end()] + "\n" + "\n".join(tags) + ("\n" if tags else "") + head + content[close.start():]
    if updated != content:
        path.write_text(updated, encoding="utf-8")
        return True
    return False
def main():
    paths = sorted(ROOT.rglob("*.html"))
    modified = [p.relative_to(ROOT).as_posix() for p in paths if update(p)]
    print(f"SEO scanned {len(paths)} HTML files, updated {len(modified)}")
    (ROOT / "seo-update-report.json").write_text(json.dumps({"site":BASE,"scanned":len(paths),"modified_count":len(modified),"modified":modified},indent=2)+"\n",encoding="utf-8")
if __name__ == "__main__": main()
