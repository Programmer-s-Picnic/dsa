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

# Canonical XML sitemap generation, preserving editorial exclusions and lastmod dates.
from datetime import date
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
SITEMAP = ROOT / "sitemap.xml"
AD_CLIENT = "ca-pub-8321261883090494"
ADS_TAG = ('<script async crossorigin="anonymous" '
           'src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT + '"></script>')
NEVER_INDEX = ("404.html", "offline.html", "kbc.html", "header.html", "footer.html",
               "googleb7b1c7873cdfb988.html", "python/sorting/bubble-sort/test.html",
               "html/pages/animation/createlemnt.html")
INDEX_EXCLUDE_PREFIX = ("projects/kbc/milestone-code/", "spring/e-commerce/spring-boot-reference/src/",
                        "projects/kbc-quiz-project/angular-version/src/",
                        "projects/kbc/tracks/angular/final-project/src/")
INDEX_EXCLUDE_PARTIAL = ("/src/app/",)
REDIRECT_ALIASES = ("html/android/pin/lesson/index.html", "html/pages/speaker/lesson/index.html")
def is_public_path(p):
    if p in NEVER_INDEX or p in REDIRECT_ALIASES: return False
    if p.startswith(INDEX_EXCLUDE_PREFIX) or any(part in "/"+p for part in INDEX_EXCLUDE_PARTIAL): return False
    if p.startswith("projects/") and ("/milestone-code/" in p or "/src/" in p): return False
    return True
def has_noindex(content):
    head = content.split("</head>", 1)[0]
    return bool(re.search(r'<meta\b(?=[^>]*name\s*=\s*["\']robots["\'])[^>]*content\s*=\s*["\'][^"\']*noindex', head, re.I))
def add_ads(path):
    p = path.relative_to(ROOT).as_posix()
    if not is_public_path(p): return False
    s = path.read_text(encoding="utf-8")
    if not re.search(r'<head(?:\s[^>]*)?>', s, re.I) or has_noindex(s): return False
    if AD_CLIENT in s: return False
    # Load official AdSense script once. Ad placement itself is managed by AdSense Auto ads.
    revised = re.sub(r'<head(?:\s[^>]*)?>', lambda m: m.group(0)+"\n"+ADS_TAG+"\n", s, count=1, flags=re.I)
    if revised == s: return False
    path.write_text(revised, encoding="utf-8")
    return True
def canonical_path(p):
    return p[:-10] if p.endswith("/index.html") else p
def update_sitemap():
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    existing = {}
    if SITEMAP.exists():
        doc = ET.parse(SITEMAP)
        for entry in doc.getroot():
            loc = entry.findtext(ns+"loc")
            if loc:
                existing[loc] = entry.findtext(ns+"lastmod") or "2026-10-08"
    # Preserve sitemap's curated lessons and add only new top-level lesson/course pages.
    valid = {}
    files = sorted(ROOT.rglob("*.html"))
    for file in files:
        p = file.relative_to(ROOT).as_posix()
        if not is_public_path(p): continue
        content = file.read_text(encoding="utf-8")
        if has_noindex(content): continue
        url = BASE+"/"+canonical_path(p)
        # Keep prior listed pages; automatically add new lessons and main course pages.
        eligible_new = p == "index.html" or p.startswith("aspnet/") or "/lessons/" in p or p in ("sitemap.html",)
        if url not in existing and not eligible_new: continue
        valid[url] = existing.get(url, date.today().isoformat())
    root = ET.Element(ns+"urlset")
    for url in sorted(valid):
        entry = ET.SubElement(root, ns+"url")
        ET.SubElement(entry, ns+"loc").text = url
        ET.SubElement(entry, ns+"lastmod").text = valid[url]
    new = ET.tostring(root, encoding="unicode", xml_declaration=False)
    result = '<?xml version="1.0" encoding="UTF-8"?>\n'+new+'\n'
    old = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""
    if old != result: SITEMAP.write_text(result, encoding="utf-8")
    return len(valid)

def main():
    paths = sorted(ROOT.rglob("*.html"))
    modified = [p.relative_to(ROOT).as_posix() for p in paths if update(p)]
    ad_updated = [p.relative_to(ROOT).as_posix() for p in paths if add_ads(p)]
    sitemap_count = update_sitemap()
    print(f"SEO checked {len(paths)} HTML files; metadata updates {len(modified)}, ads updates {len(ad_updated)}, sitemap URLs {sitemap_count}")
    (ROOT / "seo-update-report.json").write_text(json.dumps({"site":BASE,"scanned":len(paths),"modified_count":len(modified),"modified":modified,"ads_updated":ad_updated,"sitemap_count":sitemap_count},indent=2)+"\n",encoding="utf-8")
if __name__ == "__main__": main()
