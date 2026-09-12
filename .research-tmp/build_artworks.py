#!/usr/bin/env python3
"""Build a culture's artworks.json with verified, embedded image URLs from collected data."""
import json, os, sys

BASE = "/AI/agents/workspaces/divine-atlas/.research-tmp"
OUT = "/AI/agents/workspaces/divine-atlas/research"

def _clean(h):
    if not h: return ""
    import re
    h = re.sub(r"<[^>]+>", "", str(h))
    for a,b in [("&#39;","'"),("&quot;",'"'),("&amp;","&"),("&lt;","<"),("&gt;",">")]:
        h = h.replace(a,b)
    return re.sub(r"\s+"," ",h).strip()

def load_db(culture):
    db = {}
    for fn in os.listdir(BASE):
        if not (fn.startswith("commons-") or fn.startswith("met-")): continue
        c = fn.split("-")[1].rsplit(".",1)[0]
        try:
            data = json.load(open(os.path.join(BASE, fn)))
        except Exception:
            continue
        if not isinstance(data, list): continue
        for r in data:
            if not isinstance(r, dict): continue
            if fn.startswith("commons-"):
                k = r.get("file")
                if not k: continue
                db[("commons",k)] = {
                    "image_url": r.get("thumb_url") or r.get("orig_url"),
                    "source_url": r.get("page_url"),
                    "license": r.get("license") or "open license",
                    "artist": _clean(r.get("artist")),
                    "w": r.get("width"), "h": r.get("height"),
                }
            else:
                db[("met", r["objectID"])] = {
                    "image_url": r.get("image"),
                    "source_url": r.get("objectURL"),
                    "license": "Public domain (Met Open Access)",
                    "artist": r.get("artist") or "Unknown",
                    "w": None, "h": None,
                    "credit": r.get("creditLine"),
                }
    return db

def build(culture, picks):
    db = load_db(culture)
    out = []
    for p in picks:
        src, key = p["src"], p["key"]
        m = db.get((src, key))
        if not m:
            print("MISS:", key); continue
        out.append({
            "id": p["id"], "culture": culture,
            "title": p["title"], "artist": p.get("artist") or m["artist"] or "Unknown",
            "date": p.get("date",""), "museum": p.get("museum",""),
            "medium": p.get("medium",""),
            "license": m["license"],
            "source_url": m["source_url"],
            "image_url": m["image_url"],
            "subject": p.get("subject",""),
            "description": p.get("description",""),
            "copyright_notes": p.get("copyright_notes", m["license"]),
            "attribution": p.get("attribution",""),
        })
    path = os.path.join(OUT, culture, "artworks.json")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(out, open(path,"w"), indent=1, ensure_ascii=False)
    print(f"{culture}: wrote {len(out)} artworks -> {path}")
    return out

if __name__ == "__main__":
    culture = sys.argv[1]
    picks = json.load(open(sys.argv[2]))
    build(culture, picks)
