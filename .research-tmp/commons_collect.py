#!/usr/bin/env python3
"""Collect candidate artworks from Wikimedia Commons (license-verified via API)."""
import json, urllib.request, urllib.parse, time, sys

API = "https://commons.wikimedia.org/w/api.php"

def api(params):
    p = dict(params)
    p.update({
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": p.pop("gsrsearch"), "gsrnamespace": "6",
        "prop": "imageinfo", "iiprop": "url|extmetadata|size",
        "iiurlwidth": "1200", "gsrlimit": p.pop("gsrlimit", 12),
    })
    url = API + "?" + urllib.parse.urlencode(p)
    req = urllib.request.Request(url, headers={"User-Agent": "DivineAtlas-research/1.0 (contact: mazen)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def collect(queries):
    seen, out = set(), []
    for q in queries:
        data = None
        for attempt in range(4):
            try:
                data = api({"gsrsearch": q, "gsrlimit": 12})
                break
            except Exception as e:
                print(f"  error {q!r} (attempt {attempt+1}): {e}", file=sys.stderr)
                time.sleep(5 * (attempt + 1))
        if data is None:
            continue
        pages = data.get("query", {}).get("pages", {})
        for pid, pg in pages.items():
            title = pg.get("title", "")
            if title in seen: continue
            seen.add(title)
            ii = (pg.get("imageinfo") or [{}])[0]
            meta = ii.get("extmetadata", {})
            lic = meta.get("LicenseShortName", {}).get("value", "")
            art = meta.get("Artist", {}).get("value", "")
            desc = meta.get("ImageDescription", {}).get("value", "")
            # keep only clearly open licenses
            if not any(t in lic.lower() for t in ["public domain", "pd-", "cc0", "by-sa", "by-"]):
                continue
            out.append({
                "file": title,
                "license": lic,
                "artist": art,
                "description": desc[:400],
                "page_url": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_")),
                "thumb_url": ii.get("thumburl"),
                "orig_url": ii.get("url"),
                "width": ii.get("width"), "height": ii.get("height"),
            })
        time.sleep(2.5)
    return out

if __name__ == "__main__":
    culture = sys.argv[1]
    queries = json.loads(sys.argv[2])
    res = collect(queries)
    suffix = sys.argv[3] if len(sys.argv) > 3 else ""
    path = f"/AI/agents/workspaces/divine-atlas/.research-tmp/commons-{culture}{suffix}.json"
    with open(path, "w") as f:
        json.dump(res, f, indent=1, ensure_ascii=False)
    print(f"{culture}: {len(res)} open-license candidates -> {path}")
