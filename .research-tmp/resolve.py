#!/usr/bin/env python3
"""Resolve chosen artwork filenames to verified image metadata from collected JSON."""
import json, os

BASE = "/AI/agents/workspaces/divine-atlas/.research-tmp"

def load_all():
    db = {}
    for fn in os.listdir(BASE):
        if not (fn.startswith("commons-") or fn.startswith("met-")): continue
        culture = fn.split("-")[1].rsplit(".",1)[0]
        for r in json.load(open(os.path.join(BASE, fn))):
            if fn.startswith("commons-"):
                key = r.get("file")
                if not key: continue
                db.setdefault(key, {
                    "image_url": r.get("thumb_url") or r.get("orig_url"),
                    "page_url": r.get("page_url"),
                    "license": r.get("license"),
                    "artist": _clean(r.get("artist")),
                    "description": _clean(r.get("description")),
                    "width": r.get("width"), "height": r.get("height"),
                    "origin": "wikimedia-commons",
                })
            else:
                key = "met:%d" % r["objectID"]
                if not db.get(key) or not db[key].get("image_url"):
                    db[key] = {
                        "image_url": r.get("image"),
                        "page_url": r.get("objectURL"),
                        "license": "public domain (Met Open Access)",
                        "artist": r.get("artist") or "Unknown",
                        "description": (r.get("title") or ""),
                        "width": None, "height": None,
                        "origin": "met-museum",
                        "credit": r.get("creditLine"),
                    }
    return db

def _clean(h):
    if not h: return ""
    import re
    h = re.sub(r"<[^>]+>", "", h)
    h = h.replace("&amp;","&").replace("&lt;","<").replace("&gt;",">").replace("&#39;", "'")
    h = re.sub(r"\s+", " ", h).strip()
    return h

if __name__ == "__main__":
    db = load_all()
    print("total resolvable artworks:", len(db))
    # quick check on some chosen ones
    tests = [
        "File:Susanoo-no-Mikoto-slays-Yamata-no-Orochi-in-Izumo-By-Tsukioka-Yoshitoshi.png",
        "File:Amaterasu appearing from the cave..jpg",
        "File:Odin (Manual of Mythology).jpg",
        "File:Thor (Walhall).png",
        "File:Freja (1901) by Anders Zorn.jpg",
        "File:Victor Vasnecov Baba-Yaga.jpg",
        "File:TheKnightAtTheCrossroads.jpg",
        "File:Isis DSCN5917.JPG",
        "File:Kha and Merit before Osiris Book of the Dead of Kha.jpg",
        "File:Book of the Dead of Kha, papyrus - Museo Egizio Turin S 8438 p01.",
        "File:Ishtar Gate in the Pergamon Museum -.jpg",
        "File:Gudea 04.jpg",
        "File:Bronze Zeus or Poseidon NAMA X 15161 Athens Greece.jpg",
        "File:Hermes Praxiteles 1887.jpg",
    ]
    for t in tests:
        m = db.get(t)
        print(("OK  " if m else "MISS"), t[:55], "->", (m or {}).get("image_url","")[:70])
