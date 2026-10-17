#!/usr/bin/env python3
"""Phase 6: generate data/art-prompts.json — one image-gen prompt per entity+artifact.

Deterministic template composition from the audited data (gender explicit,
legend-based attributes: weapons, sacred objects, symbols, animals, realms),
plus a per-religion art-style tag. No invented mythology: every attribute in a
prompt comes from the entity/artifact record itself.
"""
import json, os, re, sys

BASE = "/AI/agents/workspaces/divine-atlas/data"
CULTURES = ["greek", "norse", "egyptian", "slavic", "mesopotamian", "japanese"]

STYLES = {
    "greek": "Greek black-figure and red-figure vase-painting fused with heroic Renaissance oil painting: marble-white flesh, draped chiton himation cloth, terracotta and marigold ochre palette, Meandros and laurel border motifs, idealized heroic anatomy, flat decorative background with a single column or tree",
    "norse": "Cold rugged Norse painterly style: birch-wood and wet-slate palette, aurora-green and ice-blue light, carved Urnes-style ribbon beasts, fur, wool and riveted iron, mist over fjord and ash tree, dramatic low northern sun",
    "egyptian": "Ancient Egyptian temple-relief fused with gold-leaf painterly style: profile-composite canon, lapis lazuli and gold palette, linen shendyt, broad collars, hieroglyph column background, torch-lit sandstone, strict registers",
    "slavic": "Eastern-Slavic folk-icon meets forest-realism painterly style: deep forest green, ember red and birch white, embroidered vyshyvanka linen, oak and birch forest, onion-domed horizon, warm candlelight on gilded halo",
    "mesopotamian": "Ancient Mesopotamian cylinder-seal and palace-relief fused with oil painting: baked-clay ochre and lapis palette, horned divine crown, cuneiform-stamped background, winged-bull and palm motifs, Tigris reed light, layered ziggurat horizon",
    "japanese": "Japanese ukiyo-e and Yamato-e painterly style: washi paper texture, vermilion and indigo with gold-leaf clouds, flowing silk kariginen and junihitoe layers, pine, crane and sakura motifs, flat mist bands (suyari-gasumi), crisp ink outlines",
}

NEG = ("photograph, photorealistic, 3d render, anime, cartoon, modern clothing, modern objects, "
       "text, watermark, logo, signature, deformed hands, extra fingers, mutated anatomy, blurry, "
       "lowres, disrespectful or mocking depiction of the subject, contemporary political symbols")

def _article(noun: str) -> str:
    """'a'/'an' by first sound-ish letter (deterministic, good enough for prompts)."""
    return "an" if noun[:1].lower() in "aeiou" else "a"


GENDER_WORD = {"male": "male", "female": "female", "other": "dual-gendered (depicted with both masculine and feminine features)",
               "unknown": "enigmatic, beyond-human gender (do not emphasize gender)", "pair": "a divine pair shown together"}

def clip(s, n):
    s = re.sub(r"\s+", " ", s or "").strip()
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "…"

def pose_for(domains, gender=None):
    d = " ".join(domains).lower()
    if any(k in d for k in ("war", "storm", "thunder", "battle", "hunt")):
        return "dynamic contrapposto stance, striding forward, weapon raised mid-swing, cloth whipping in the wind"
    if any(k in d for k in ("underworld", "death", "afterlife", "grave", "fate")):
        return "seated upright on a low dark throne, hands resting on knees or a staff, solemn and patient"
    if any(k in d for k in ("sea", "water", "river", "ocean", "rain", "flood")):
        return "standing knee-deep in stylized waves, one arm extended over the water"
    if any(k in d for k in ("sky", "heaven", "sun", "celestial", "star")):
        return "standing tall, arms slightly raised, head tilted up toward the heavens"
    if any(k in d for k in ("wisdom", "knowledge", "craft", "magic", "scribe", "writing", "healing", "medicine")):
        return "seated at a low table, leaning forward attentively over the attribute of their art"
    if any(k in d for k in ("love", "beauty", "fertility", "harvest", "agriculture", "mother", "birth", "life")):
        return "standing in a fertile grove or ripening field, arms open in welcome or cradling the harvest"
    if any(k in d for k in ("trickery", "cunning", "mischief", "thief")):
        return "half-turned over one shoulder with a knowing glance, weight on one foot, ready to slip away"
    if any(k in d for k in ("creation", "primordial", "chaos", "void", "time")):
        return "emerging from swirling primeval mist, body partly dissolving into the elements"
    return "dignified frontal stance, chin level, hands visible holding their attribute"

def subject_phrase(e):
    g = GENDER_WORD.get(e.get("gender", "unknown"), "divine")
    cls = e.get("classification", "deity").replace("_", " ")
    names = e["name"] + (f" ({e['native_name']})" if e.get("native_name") else "")
    dom = clip(", ".join((e.get("domains") or [])[:4]), 90)
    return (f"{names}, the {cls} of {dom} in {e['culture'].title()} mythology, "
            f"{_article(g)} {g} figure drawn from the original legends (not modern pop-culture)")

def attrs(e, art=None):
    parts = []
    if art is None:
        for key, label in (("weapons", "wielding"), ("sacred_objects", "with"), ("symbols", "beside them float symbols of")):
            v = [x for x in (e.get(key) or []) if len(x) < 60][:3]
            if v:
                parts.append(f"{label} {', '.join(v)}")
        an = (e.get("animals") or [])[:2]
        if an:
            parts.append(f"accompanied by {', '.join(an)}")
    realm = clip(", ".join((e.get("associated_realms") or e.get("associated_places") or [])[:2]), 80) if art is None else ""
    return parts, realm

def realm_names(e, c):
    try:
        cos = json.load(open(f"{BASE}/{c}/cosmology.json"))
        rmap = {r["id"]: r["name"] for r in cos.get("realms", [])}
    except Exception:
        rmap = {}
    ids = (e.get("associated_realms") or []) + (e.get("associated_places") or [])
    return [rmap.get(i, i.replace(c + "-", "").replace("-", " ").title()) for i in ids[:2]]

def entity_prompt(e):
    parts, _ = attrs(e)
    realm = ", ".join(realm_names(e, e["culture"]))
    style = STYLES[e["culture"]]
    setting = realm or "their mythic realm"
    mood = "solemn and awe-inspiring" if "death" not in " ".join(e.get("domains", [])).lower() else "hushed, reverent, solemn"
    pose = pose_for(e.get("domains") or [], e.get("gender"))
    desc = clip(e.get("description_short", ""), 220)
    body = f"{subject_phrase(e)}: {desc.rstrip('.')}."
    body += f" {pose.capitalize()}."
    if parts:
        body += " " + "; ".join(x.strip('. ') for x in parts) + "."
    body += f" Setting: {setting}, atmospheric depth. Mood: {mood}."
    body += f" Composition: single centered figure, waist-up to full-body, eye-level camera, generous headroom, card-safe margins (no limbs at frame edge); full figure or head-and-shoulders with relic, safe margins ≥8% top/bottom, subject never touches the frame edges. Art style: {style}. Aspect ratio 5:7 portrait (1024x1440)."
    return body

def artifact_prompt(a, owner_name):
    style = STYLES[a["culture"]]
    name = a["name"] + (f" ({a['native_name']})" if a.get("native_name") else "")
    cat = a.get("category", "relic").replace("_", " ")
    app = clip(a.get("appearance", ""), 200)
    creator = a.get("creator_name") or (a.get("creator") and "divine craft") or None
    made = f" wrought by {a['creator_name']}" if a.get("creator_name") else ""
    own = f" held or displayed by {owner_name}" if owner_name else " displayed on a carved stone plinth"
    origin = clip(a.get("origin_story") or a.get("creation_story") or "", 180)
    p = (f"{name}, the {cat} of {a['culture'].title()} myth{made}: {app.rstrip('.')} "
         f"{own.strip()}. Origin: {origin.rstrip('.')} "
         f"Composition: the relic as hero object, three-quarter view, dramatic single-source light, faint aura of its element, card-safe margins; safe margins ≥8% top/bottom, subject never touches the frame edges. "
         f"Art style: {style}. Aspect ratio 5:7 portrait (1024x1440).")
    return p

def main():
    out = {"_meta": {
        "generated": "2026-10-17",
        "purpose": "Image-generation prompts for every deity and relic card. Slot: public/cards/<culture>/<culture>-<id>.png (1024x1440, 5:7).",
        "rule": "Attributes come only from the audited data files; style tags per docs/ART_STYLES.md. Keep depictions mythological and respectful.",
        "negative_prompt_default": NEG,
    }, "items": []}
    for c in CULTURES:
        ents = json.load(open(f"{BASE}/{c}/entities.json"))
        arts = json.load(open(f"{BASE}/{c}/artifacts.json")) if os.path.exists(f"{BASE}/{c}/artifacts.json") else []
        by_id = {e["id"]: e for e in ents}
        for e in ents:
            out["items"].append({
                "id": e["id"], "kind": "deity", "culture": c, "name": e["name"],
                "gender": e.get("gender", "unknown"),
                "slot": f"public/cards/{c}/{c}-{e['id']}.png",
                "prompt": entity_prompt(e), "negative_prompt": NEG,
            })
        for a in arts:
            owner = by_id.get(a.get("owner") or "")
            out["items"].append({
                "id": a["id"], "kind": "relic", "culture": c, "name": a["name"],
                "slot": f"public/cards/{c}/{c}-{a['id']}.png",
                "prompt": artifact_prompt(a, owner["name"] if owner else a.get("owner_name")),
                "negative_prompt": NEG,
            })
    print("items:", len(out["items"]))
    return out

if __name__ == "__main__":
    data = main()
    dest = sys.argv[1] if len(sys.argv) > 1 else "/home/mazen/.hermes/cache/scratch/art-prompts.json"
    json.dump(data, open(dest, "w"), indent=1, ensure_ascii=False)
    print("wrote", dest)
