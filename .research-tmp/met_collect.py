#!/usr/bin/env python3
"""Collect candidate artworks from Met Open Access API (verified, licensed, stable image URLs)."""
import json, urllib.request, time, sys

BASE = "https://collectionapi.metmuseum.org/public/collection/v1"

def search(q, n=200):
    url = f"{BASE}/search?q={urllib.parse.quote(q)}"
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.load(r).get("objectIDs", [])
    except Exception as e:
        print(f"  search error for {q!r}: {e}", file=sys.stderr)
        return []

def fetch(oid):
    try:
        with urllib.request.urlopen(f"{BASE}/objects/{oid}", timeout=30) as r:
            return json.load(r)
    except Exception as e:
        return None

def collect(queries):
    seen, out = set(), []
    for q in queries:
        ids = search(q)
        for oid in ids[:12]:
            if oid in seen: continue
            seen.add(oid)
            o = fetch(oid)
            if not isinstance(o, dict): continue
            if not o.get("isPublicDomain"): continue
            if not o.get("primaryImage"): continue
            try:
                out.append({
                "objectID": oid,
                "title": o.get("objectName") or o.get("title"),
                "artist": o.get("artistDisplayName") or o.get("artistDisplayDate") or "Unknown",
                "artist_role": o.get("artistRole"),
                "date": o.get("objectDate"),
                "period": o.get("objectDate") and o.get("objectBeginDate"),
                "culture": o.get("culture"),
                "medium": o.get("medium"),
                "department": o.get("department"),
                "creditLine": o.get("creditLine"),
                "objectURL": o.get("objectURL"),
                "image": o.get("primaryImage"),
                "imageSmall": o.get("primaryImageSmall"),
                "tags": [t.get("term") for t in (o.get("tags") or [])],
                "dimensions": o.get("dimensions"),
            })
            except Exception:
                continue
        time.sleep(0.3)
    return out

if __name__ == "__main__":
    import urllib.parse
    culture = sys.argv[1]
    queries = json.loads(sys.argv[2])
    results = collect(queries)
    # dedupe by title+artist
    dedup, seen2 = [], set()
    for r in results:
        k = (str(r.get("title")), str(r.get("artist")))
        if k in seen2: continue
        seen2.add(k)
        dedup.append(r)
    path = f"/AI/agents/workspaces/divine-atlas/.research-tmp/met-{culture}.json"
    with open(path, "w") as f:
        json.dump(dedup, f, indent=1, ensure_ascii=False)
    print(f"{culture}: {len(dedup)} public-domain candidates -> {path}")
