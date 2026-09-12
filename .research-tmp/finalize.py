#!/usr/bin/env python3
"""Shared finalize pass: validate a culture dataset, prune dangling array IDs, report.
Usage: python3 finalize.py <culture>
- Checks relationships source/target reference existing entities.
- Checks myths participants reference existing entities.
- Prunes entity-array fields (parents/siblings/partners/children/allies/enemies)
  of IDs that have no entity (unmodeled references become plain text via 'mentions'
  is overkill; we simply drop dangling IDs from linkable arrays).
- Writes a <culture>_report.txt.
"""
import json, os, sys, collections

ROOT = "/AI/agents/workspaces/divine-atlas/research"
ARR_FIELDS = ["parents","siblings","partners","children","allies","enemies"]

def main():
    c = sys.argv[1]
    base = os.path.join(ROOT, c)
    E = json.load(open(os.path.join(base,"entities.json")))
    R = json.load(open(os.path.join(base,"relationships.json")))
    M = json.load(open(os.path.join(base,"myths.json")))
    ids = {e["id"] for e in E}
    problems = []

    # 1. relationships must reference existing entities
    bad_rel = [r for r in R if r["source"] not in ids or r["target"] not in ids]
    for r in bad_rel:
        problems.append(f"REL dangling: {r['source']} -> {r['target']} ({r['type']})")

    # 2. myths participants
    for m in M:
        for p in m["participants"]:
            if p not in ids:
                problems.append(f"MYTH {m['id']} participant dangling: {p}")

    # 3. prune dangling array IDs
    pruned = collections.Counter()
    for e in E:
        for f in ARR_FIELDS:
            keep = []
            for ref in e.get(f, []):
                if ref in ids: keep.append(ref)
                else: pruned[ref] += 1
            e[f] = keep
    # dedupe within arrays, preserve order
    for e in E:
        for f in ARR_FIELDS:
            seen=set(); out=[]
            for x in e[f]:
                if x not in seen: out.append(x); seen.add(x)
            e[f]=out

    # 4. check duplicate entity ids
    dupes = [k for k,v in collections.Counter(e['id'] for e in E).items() if v>1]
    if dupes: problems.append(f"DUPLICATE entity ids: {dupes}")

    # 5. required fields present
    req = ["id","name","native_name","classification","domains","description_short","description_long"]
    for e in E:
        for f in req:
            if f not in e or e[f] in (None,"",[]):
                if f not in ("native_name",):  # native_name may be "" for unknown
                    problems.append(f"ENTITY {e.get('id')} missing/empty {f}")

    report = f"=== {c.upper()} dataset report ===\nentities: {len(E)}  relationships: {len(R)}  myths: {len(M)}\n"
    if pruned:
        report += "\nPruned dangling array refs (no entity modeled):\n"
        for k,v in pruned.most_common():
            report += f"  {k} x{v}\n"
    if problems:
        report += "\nPROBLEMS:\n" + "\n".join("  "+p for p in problems) + "\n"
    else:
        report += "\nAll references valid.\n"
    print(report)
    open(os.path.join(base, "_finalize_report.txt"),"w").write(report)
    json.dump(E, open(os.path.join(base,"entities.json"),"w"), indent=1, ensure_ascii=False)

if __name__ == "__main__":
    main()
