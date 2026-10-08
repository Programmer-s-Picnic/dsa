#!/usr/bin/env python3
"""SEO hygiene for the public DSA learning site.

Goals:
- one canonical URL per page (including / for the home page)
- keep low-value source/demo pages out of Google's index
- generate a curated sitemap from strong learning pages only
- keep AdSense/metadata present on indexable public pages
"""
from pathlib import Path
from datetime import date
import html, re, json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://dsa.learnwithchampak.live"
IMAGE = BASE + "/assets/images/og-aiml-champak-roy-varanasi.png"
SITEMAP = ROOT / "sitemap.xml"
AD_CLIENT = "ca-pub-8321261883090494"
ADS_TAG = ('<script async crossorigin="anonymous" '
           'src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT + '"></script>')

NEVER_INDEX = {
    "404.html", "offline.html", "kbc.html", "header.html", "footer.html",
    "googleb7b1c7873cdfb988.html",
    "python/sorting/bubble-sort/test.html",
    "html/pages/animation/createlemnt.html",
    "html/android/pin/lesson/index.html",
    "html/pages/speaker/lesson/index.html",
}
NOINDEX_PREFIXES = (
    "projects/kbc/milestone-code/",
    "spring/e-commerce/spring-boot-reference/src/",
    "projects/kbc-quiz-project/angular-version/src/",
    "projects/kbc/tracks/angular/final-project/src/",
)

# Strong pages we actively submit to Google. Other public pages can still be
# reached through navigation, but are not forced into the XML sitemap.
SITEMAP_PREFIXES = (
    "aspnet/",
    "python/",
    "java/",
    "javascript/",
    "question-bank/",
    "react/",
    "visualizers/",
    "questions/",
)
SITEMAP_EXACT = {
    "index.html",
    "sitemap.html",
    "sql/index.html",
    "tools/learning-path-finder/index.html",
    "flutter/index.html",
    "flutter/commandline/index.html",
    "flutter/firebase/1/index.html",
    "spring/database/sqlite/index.html",
    "websocket/index.html",
    "websocket/chat/index.html",
    "websocket/chat/lesson/index.html",
    "html/img/index.html",
    "html/tables/index.html",
    "html/timeout-interval/index.html",
    "html/pages/animation/index.html",
    "html/pages/before-upper/index.html",
    "projects/kbc/index.html",
    "projects/kbc/courses/index.html",
    "projects/kbc/final-project/index.html",
    "projects/kbc-quiz-project/js-version/index.html",
    "projects/kbc-quiz-project/react-version/index.html",
    "projects/kbc/tracks/html-js/final-project/index.html",
    "projects/kbc/tracks/react/final-project/index.html",
}

def attr(s):
    return html.escape(s, quote=True)

def canonical_path(p):
    if p == "index.html":
        return ""
    if p.endswith("/index.html"):
        return p[:-10]
    return p

def page_url(p):
    suffix = canonical_path(p)
    return BASE + "/" + suffix

def is_public_path(p):
    if p in NEVER_INDEX:
        return False
    if p.startswith(NOINDEX_PREFIXES):
        return False
    if "/src/app/" in "/" + p:
        return False
    if p.startswith("projects/") and ("/milestone-code/" in p or "/src/" in p):
        return False
    return True

def in_sitemap(p):
    if not is_public_path(p):
        return False
    if p in SITEMAP_EXACT:
        return True
    if p.startswith("projects/kbc/lessons/"):
        return False
    if re.match(r"projects/kbc/tracks/[^/]+/(?:lessons|dashboard)", p):
        return False
    return p.startswith(SITEMAP_PREFIXES)

def meta_present(head, key, typ="name"):
    return bool(re.search(
        r'<meta\b(?=[^>]*\b' + typ + r'\s*=\s*["\']' + re.escape(key) + r'["\'])[^>]*>',
        head, re.I
    ))

def replace_robots(head, directive):
    pattern = re.compile(r'<meta\b(?=[^>]*\bname\s*=\s*["\']robots["\'])[^>]*>', re.I)
    tag = f'<meta name="robots" content="{directive}">'
    if pattern.search(head):
        return pattern.sub(tag, head, count=1)
    return tag + "\n" + head

def update(path):
    p = path.relative_to(ROOT).as_posix()
    if p in {"header.html", "footer.html", "googleb7b1c7873cdfb988.html"}:
        return False

    content = path.read_text(encoding="utf-8")
    open_head = re.search(r'<head(?:\s[^>]*)?>', content, re.I)
    close_head = re.search(r'</head\s*>', content, re.I)
    if not open_head or not close_head:
        return False

    head = content[open_head.end():close_head.start()]
    title_match = re.search(r'<title[^>]*>(.*?)</title>', head, re.I | re.S)
    title = html.unescape(re.sub(r'<[^>]+>', '', title_match.group(1))).strip() if title_match else p.replace("/", " ").replace(".html", "")
    title = re.sub(r'\s+', ' ', title)[:125]

    desc_match = re.search(r'<meta\b(?=[^>]*\bname\s*=\s*["\']description["\'])[^>]*>', head, re.I)
    existing_desc = None
    if desc_match:
        am = re.search(r'\bcontent\s*=\s*(["\'])(.*?)\1', desc_match.group(0), re.I | re.S)
        if am:
            existing_desc = html.unescape(am.group(2))
    desc = existing_desc or (
        "Learn " + title.split("|")[0].strip()[:70] +
        " with Champak Roy at Programmer's Picnic. Practical examples, lessons and programming exercises."
    )
    desc = desc[:160]

    url = page_url(p)
    public = is_public_path(p)
    directive = "index, follow, max-image-preview:large" if public else "noindex, follow"

    head = replace_robots(head, directive)
    tags = []
    for key, val in (
        ("description", desc), ("author", "Champak Roy"),
        ("twitter:card", "summary_large_image"),
        ("twitter:title", title), ("twitter:description", desc), ("twitter:image", IMAGE)
    ):
        if not meta_present(head, key):
            tags.append(f'<meta name="{key}" content="{attr(val)}">')

    for key, val in (
        ("og:type", "article"), ("og:site_name", "Programmer's Picnic"),
        ("og:title", title), ("og:description", desc), ("og:url", url), ("og:image", IMAGE)
    ):
        if not meta_present(head, key, "property"):
            tags.append(f'<meta property="{key}" content="{attr(val)}">')

    canonical = re.search(r'<link\b(?=[^>]*\brel\s*=\s*["\']canonical["\'])[^>]*>', head, re.I)
    canonical_tag = f'<link rel="canonical" href="{attr(url)}">'
    if canonical:
        head = head[:canonical.start()] + canonical_tag + head[canonical.end():]
    else:
        tags.append(canonical_tag)

    ogurl = re.search(r'<meta\b(?=[^>]*\bproperty\s*=\s*["\']og:url["\'])[^>]*>', head, re.I)
    if ogurl:
        replacement = f'<meta property="og:url" content="{attr(url)}">'
        head = head[:ogurl.start()] + replacement + head[ogurl.end():]

    updated = content[:open_head.end()] + "\n" + "\n".join(tags) + ("\n" if tags else "") + head + content[close_head.start():]
    if updated != content:
        path.write_text(updated, encoding="utf-8")
        return True
    return False

def has_noindex(content):
    head = content.split("</head>", 1)[0]
    return bool(re.search(
        r'<meta\b(?=[^>]*name\s*=\s*["\']robots["\'])[^>]*content\s*=\s*["\'][^"\']*noindex',
        head, re.I
    ))

def add_ads(path):
    p = path.relative_to(ROOT).as_posix()
    if not is_public_path(p):
        return False
    s = path.read_text(encoding="utf-8")
    if not re.search(r'<head(?:\s[^>]*)?>', s, re.I) or has_noindex(s):
        return False
    if AD_CLIENT in s:
        return False
    revised = re.sub(
        r'<head(?:\s[^>]*)?>',
        lambda m: m.group(0) + "\n" + ADS_TAG + "\n",
        s, count=1, flags=re.I
    )
    if revised == s:
        return False
    path.write_text(revised, encoding="utf-8")
    return True

def update_sitemap():
    ET.register_namespace("", "http://www.sitemaps.org/schemas/sitemap/0.9")
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    existing = {}
    if SITEMAP.exists():
        doc = ET.parse(SITEMAP)
        for entry in doc.getroot():
            loc = entry.findtext(ns + "loc")
            if loc:
                existing[loc] = entry.findtext(ns + "lastmod") or date.today().isoformat()

    valid = {}
    for file in sorted(ROOT.rglob("*.html")):
        p = file.relative_to(ROOT).as_posix()
        if not in_sitemap(p):
            continue
        content = file.read_text(encoding="utf-8")
        if has_noindex(content):
            continue
        url = page_url(p)
        valid[url] = existing.get(url, date.today().isoformat())

    root = ET.Element(ns + "urlset")
    for url in sorted(valid):
        entry = ET.SubElement(root, ns + "url")
        ET.SubElement(entry, ns + "loc").text = url
        ET.SubElement(entry, ns + "lastmod").text = valid[url]

    result = '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="unicode", xml_declaration=False) + "\n"
    old = SITEMAP.read_text(encoding="utf-8") if SITEMAP.exists() else ""
    if old != result:
        SITEMAP.write_text(result, encoding="utf-8")
    return len(valid)

def update_html_sitemap():
    groups = {}
    for file in sorted(ROOT.rglob("*.html")):
        p = file.relative_to(ROOT).as_posix()
        if p == "sitemap.html" or not in_sitemap(p):
            continue
        content = file.read_text(encoding="utf-8")
        if has_noindex(content):
            continue
        tm = re.search(r'<title[^>]*>(.*?)</title>', content, re.I | re.S)
        title = html.unescape(re.sub(r'<[^>]+>', '', tm.group(1))).strip() if tm else p
        title = re.sub(r'\\s+', ' ', title)
        group = p.split("/", 1)[0] if "/" in p else "Start"
        groups.setdefault(group, []).append((title, "/" + canonical_path(p)))

    preferred = ["Start", "python", "java", "javascript", "aspnet", "sql", "react",
                 "question-bank", "visualizers", "questions", "flutter", "html",
                 "spring", "websocket", "tools", "projects"]
    labels = {
        "Start": "Start Here", "python": "Python", "java": "Java",
        "javascript": "JavaScript", "aspnet": "ASP.NET Core", "sql": "SQL",
        "react": "React", "question-bank": "Question Banks",
        "visualizers": "Visualizers", "questions": "Guided Questions",
        "flutter": "Flutter", "html": "HTML / CSS", "spring": "Spring",
        "websocket": "WebSocket", "tools": "Learning Tools", "projects": "Projects"
    }
    cards = []
    for group in preferred:
        items = groups.get(group, [])
        if not items:
            continue
        links = "\n".join(
            f'<a class="lesson" href="{attr(href)}"><strong>{attr(title)}</strong><span>{attr(href)}</span></a>'
            for title, href in items
        )
        cards.append(f'<section class="card"><h2>{attr(labels.get(group, group.title()))}</h2>{links}</section>')

    page = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Programming Lessons & DSA Learning Map | Learn With Champak</title>
<meta name="description" content="Browse the curated programming, DSA, Python, Java, JavaScript, ASP.NET, SQL and AI/ML learning pages on Programmer's Picnic.">
<meta name="author" content="Champak Roy"><meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{BASE}/sitemap.html"><link rel="icon" href="/assets/icons/icon-192.png">
<meta property="og:type" content="website"><meta property="og:site_name" content="Programmer's Picnic">
<meta property="og:title" content="Programming Lessons & DSA Learning Map">
<meta property="og:description" content="A curated map of useful lessons and learning tools.">
<meta property="og:url" content="{BASE}/sitemap.html"><meta property="og:image" content="{IMAGE}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{IMAGE}">
{ADS_TAG}
<style>
*{{box-sizing:border-box}}body{{margin:0;font:16px/1.6 system-ui,Segoe UI,sans-serif;background:#f4faff;color:#17324b}}
header{{background:linear-gradient(135deg,#dff2ff,#f8fcff);padding:46px 20px;border-bottom:1px solid #c5def2}}
.wrap{{max-width:1100px;margin:auto}}h1{{margin:.2rem 0;color:#103f73;font-size:clamp(2rem,5vw,3.5rem)}}p{{max-width:780px}}
nav{{margin-top:16px}}nav a{{margin-right:16px;color:#075aa9;font-weight:700}}
.grid{{max-width:1100px;margin:28px auto;padding:0 20px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px}}
.card{{background:white;border:1px solid #c9e0f3;border-radius:16px;padding:20px;box-shadow:0 8px 28px #164c7410}}
.card h2{{margin-top:0;color:#11558c}}.lesson{{display:block;padding:11px 0;border-top:1px solid #e4eef7;text-decoration:none;color:#163e64}}
.lesson:first-of-type{{border-top:0}}.lesson strong{{display:block}}.lesson span{{font-size:.78rem;color:#64788d;word-break:break-all}}
footer{{margin-top:30px;background:#123c67;color:white;padding:28px 20px}}footer a{{color:white}}
@media(max-width:720px){{.grid{{grid-template-columns:1fr}}}}
</style></head><body>
<header><div class="wrap"><small>Programmer's Picnic · Learn With Champak</small>
<h1>Programming Learning Map</h1><p>Only the strongest public lessons and learning tools are listed here. Experimental source files, duplicate milestones and framework templates are deliberately excluded from search navigation.</p>
<nav><a href="/">Start with DSA</a><a href="/python/start/">Python</a><a href="/java/">Java</a><a href="/javascript/">JavaScript</a><a href="/aspnet/">ASP.NET Core</a></nav>
</div></header><main class="grid">{''.join(cards)}</main>
<footer><div class="wrap">Developed and maintained by Champak Roy · <a href="/">Programmer's Picnic</a></div></footer>
</body></html>'''
    target = ROOT / "sitemap.html"
    old = target.read_text(encoding="utf-8") if target.exists() else ""
    if old != page:
        target.write_text(page, encoding="utf-8")
        return True
    return False

def main():
    paths = sorted(ROOT.rglob("*.html"))
    modified = [p.relative_to(ROOT).as_posix() for p in paths if update(p)]
    ad_updated = [p.relative_to(ROOT).as_posix() for p in paths if add_ads(p)]
    sitemap_count = update_sitemap()
    html_sitemap_updated = update_html_sitemap()
    report = {
        "site": BASE,
        "scanned": len(paths),
        "modified_count": len(modified),
        "modified": modified,
        "ads_updated": ad_updated,
        "sitemap_count": sitemap_count,
        "strategy": "curated strong pages; source/demo pages noindex; canonical home URL is /",
        "html_sitemap_updated": html_sitemap_updated
    }
    print(
        f"SEO checked {len(paths)} HTML files; metadata updates {len(modified)}, "
        f"ads updates {len(ad_updated)}, sitemap URLs {sitemap_count}"
    )
    (ROOT / "seo-update-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
