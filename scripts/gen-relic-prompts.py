#!/usr/bin/env python3
"""Divine Atlas v3 RELIC art prompts — PO brief 2026-10-21.

One prompt per relic (26), same recipe as the god-card v3 prompts:
per-culture art-style theme (verbatim family from prompts-v2 deity prompts)
+ per-relic detail: object, material & colors, mythic origin, condition,
lighting, background. Legendary cinematic look, relic centered, no text.
Output: data/prompts-v2/relics.json (repo contract) and the node2 batch
manifest shape [{file, prompt, seed}] (file = public/cards/<culture>/<culture>-<id>.png).
"""
import json, os

D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Culture themes — same opening formula as the deity v3 prompts so relic art
# lands in the identical style family.
THEME = {
    "greek": "A legendary artifact portrait in a painterly classical style: luminous Aegean daylight, warm marble whites, deep olive and terracotta earth, bronze and gold accents, subtle black-figure pottery motifs woven into the framing, chiaroscuro spotlight on the artifact, rich atmospheric depth.",
    "norse": "A legendary artifact portrait in a dark Nordic painterly style: cold silver-blue light, frost and sea spray, carved wood, iron and fur textures, Norse interlace knotwork woven into the framing, aurora ribbons faint in the sky, ember and mead-gold highlights against deep pine and slate tones, grim heroic mood.",
    "egyptian": "A legendary artifact portrait fusing ancient Egyptian profile-view composite art with lush painterly depth: gold leaf and electrum, lapis lazuli blue, turquoise, carnelian red, registers of hieroglyphs framing the scene, lotus and papyrus motifs, torchlit sandstone, eternal stillness with one radiant divine focal point.",
    "slavic": "A legendary artifact portrait in a richly textured Slavic folk-painting style: earthy greens, birch-white, ember red and amber, linen and wood-grain textures, embroidered folk ornament patterns woven into the borders, misty birch forest and twilight meadow, glow of hearth fire, pagan wilderness mood with a touch of the uncanny.",
    "japanese": "A legendary artifact portrait in refined ukiyo-e woodblock style fused with painterly depth: flowing ink-wind and water lines, washi paper texture, indigo, vermilion and gold-leaf accents, stylized cloud and mist bands, drifting cherry or maple leaves, elegant restrained composition with generous negative space.",
    "mesopotamian": "A legendary artifact portrait in the style of ancient Mesopotamian stone relief carving brought to painterly life: carved limestone and lapis lazuli inlay, hammered gold, cuneiform band borders, ziggurat silhouettes, Tigris river light, date palms and desert dusk sky, solemn ritual grandeur.",
}

TAIL = (" Card-safe composition: single centered relic, floating or resting on a carved stone plinth, "
        "waist-frame framing with the object filling roughly 60 percent of the canvas height, eye-level camera, "
        "safe margins at least 8 percent top and bottom, object never touches frame edges, "
        "cinematic rim lighting and a dark vignette, no text, no watermark, no hands, no people, no frame border inscriptions.")

# id, culture, name, prompt body (object / material+colors / origin / condition / lighting / background)
RELICS = [
    ("gre-zeus-thunderbolt", "greek", "Thunderbolt of Zeus",
     "The Thunderbolt of Zeus, forged by the Cyclopes: a jagged forked bolt of living lightning solidified into burnished electrum and white-hot bronze, its edges crackling with pale blue-white arcs. Primeval and terrible, freshly hurled and caught mid-flight. Blinding white-gold glow spilling from its core, deep storm-cloud background lit from within by distant lightning, a single eagle silhouette far below."),
    ("gre-aegis", "greek", "Aegis of Athena",
     "The Aegis of Athena: a great ceremonial shield-breastplate of polished bronze with an ox-hide draped across it, the Gorgoneion medusa-head at its boss carved in pale stone and snaky gold, bordered by running cloud patterns. Battle-honed yet divine, faint dents catching the light. Warm Aegean daylight raking across the relief, background of a marble temple colonnade in soft dusk shadow."),
    ("gre-hades-kunee", "greek", "Helmet of Hades",
     "The Helm of Darkness, Hades' cap of invisibility forged by the Cyclopes: a dark bronze war-helmet with a winged crest of blackened silver, its surface drinking the light, faint smoke curling off the rim. Ancient, ominous, half-vanishing into shadow. Single low ember-red light from below, background of the misty grey-green underworld river Styx with distant pale shades dissolving into fog."),
    ("gre-poseidon-trident", "greek", "Trident of Poseidon",
     "The Trident of Poseidon, shaped by the Telchines: a towering three-pronged spear of sea-dark bronze and orichalcum, barnacles and emerald kelp clinging to the shaft, seawater streaming from the barbs. Salt-scoured, mighty, still humming with the sea's rage. Cold aquamarine light filtering down through deep water, background of a submerged palace wall with shoal fish scattering past."),
    ("gre-hermes-kad", "greek", "Caduceus of Hermes",
     "The Caduceus of Hermes, the herald's wand of peace: a traveler's staff of polished olive wood crowned with golden wings, two serpents of silver and gold coiled symmetrically around it, tiny winged sandals tied at the base. Radiant, swift, immaculate. Warm golden-hour light with soft motion-blur streaks like a god passing at speed, background of a dawn crossroads under a wide peach-colored sky with high clouds."),
    ("nor-mjolnir", "norse", "Mjölnir",
     "Mjölnir, Thor's hammer, dwarf-forged by the sons of Ivaldi: a squat blocky war-hammer of storm-grey iron and steel with a comically short handle of wrapped ash wood, runes glowing molten orange along the head's edges. Scarred from giants' skulls, faint electric arcs crawling across the metal. Blue-white lightning flash lighting from behind, background of a black thunderhead sky over snow-dark fjords."),
    ("nor-gungnir", "norse", "Gungnir",
     "Gungnir, Odin's unerring spear, dwarf-forged: a long slender spear of golden shaft and silvery head, seidr runes etched along the blade shimmering with cold blue light. Perfect, patient, inevitable — it never misses. Pale aurora light sweeping along the shaft, background of a star-churned night sky above the world-tree's highest boughs, two ravens wheeling far off."),
    ("nor-draupnir", "norse", "Draupnir",
     "Draupnir, Odin's self-multiplying gold ring: a heavy arm-ring of pure rippling gold, its surface alive with eight ghost-trails of new rings dripping away from it in mid-air. Luminous, precious, quietly uncanny. Warm firelight and a deep black background of a funeral pyre's ember glow, ash flakes drifting like gold dust."),
    ("nor-brisingamen", "norse", "Brísingamen",
     "Brísingamen, the necklace of Freyja, crafted by four dwarf smiths: a magnificent collar of interlocking gold links set with rows of amber, garnet and fire-opal that glow like banked hearth-coals. Impossibly beautiful, warm to the eye. Candle-warm light kindling every gem from within, background of dark velvet night with a faint birch-bark texture and drifting sparks."),
    ("nor-gjallarhorn", "norse", "Gjallarhorn",
     "Gjallarhorn, Heimdallr's resounding horn: an enormous curved drinking-and-blowing horn of dark bronze and aged gold, its bell rim engraved with interlaced beasts and runes, faint golden sound-waves rippling the mist around it. Ancient, vast, waiting for Ragnarök. Cold moonlight from the Bifröst above, background of the rainbow bridge's edge and Asgard's distant golden ramparts at night."),
    ("nor-skidbladnir", "norse", "Skíðblaðnir",
     "Skíðblaðnir, Freyr's foldable ship, built by the dwarves: a perfect longship of pale planed ash with gilded dragon prow, its sail half-furled, impossibly tiny — shown resting on an open palm-sized stretch of cloth yet with a full mast and thirty shields along the gunwale. Exquisite, miraculous, jewel-like. Bright silver-blue daylight with sharp reflections, background of a calm mirror-black fjord under high northern light."),
    ("egy-peschent", "egyptian", "Pschent, the Double Crown",
     "The Pschent, crown of the Double Land: the tall white conical crown of Upper Egypt nested inside the red flat-topped crown of Lower Egypt, rendered in white faience and red carnelian inlay with a rearing uraeus cobra of lapis and gold at the brow. Regal, eternal, sun-warmed. Blazing midday gold light with crisp shadow, background of a Theban hypostyle hall of sandstone columns in receding dusk."),
    ("egy-ankh", "egyptian", "The Ankh",
     "The Ankh, the key of life: a monumental looped cross of polished electrum and gold with a lapis-studded band, its loop glowing with the warm amber light of the living breath. Timeless, serene, faintly humming. Torchlight flicker against deep shadow, background of a painted tomb wall with offering-bearers in faded ochre registers, dust motes suspended in the light."),
    ("egy-heka", "egyptian", "The Crook and Flail",
     "The Crook and Flail of kingship, held by Osiris and every pharaoh: a shepherd's crook of banded gold and blue glass and a flail of three golden ribbons on a gold staff, laid crossed in ceremony. Sacred, orderly, funerary-bright. Cool moonlight mixed with warm torch glow, background of a star-painted coffin-lid ceiling of deep lapis with golden vultures and constellations."),
    ("jpn-kusanagi", "japanese", "Kusanagi-no-Tsurugi",
     "Kusanagi-no-Tsurugi, the grass-cutting sword of the imperial regalia: a straight single-edged blade of mirror-bright tamahagane steel lying on dark silk, its tachi mountings lacquered black with gold cloud motifs, faint mist curling along the edge. Divine, restrained, unsheathed for one breath only. Soft moonlight through shoji paper, background of deep indigo night with a single pine branch and drifting mist bands."),
    ("jpn-yata", "japanese", "Yata no Kagami",
     "Yata no Kagami, the eight-folded mirror of truth: a round polished bronze mirror with a scalloped lotus rim and three sacred jewels at its stand, its face reflecting not the viewer but a blinding sunrise with crows. Sacred, luminous, quietly impossible. Dawn light rising from within the mirror itself, background of a Shinto shrine inner sanctum of vermilion wood and white paper shide in morning haze."),
    ("jpn-yasakani", "japanese", "Yasakani no Magatama",
     "Yasakani no Magatama, the curved jewel of sovereign power: a grand necklace of comma-shaped magatama beads in layered bands of carnelian, turquoise, amber and jade, strung on silk cord of five colors, glowing softly from within. Ceremonial, ancient, warm as stored sunlight. Gentle lantern light, background of a dark lacquered tray on tatami with a single shaft of dawn light across woven straw."),
    ("jpn-nuboko", "japanese", "Ame-no-Nuboko",
     "Ame-no-Nuboko, the heavenly jeweled lance: a long lacquered spear-shaft of black urushi with gold maki-e clouds, its iron tip dripping drops of the sea that become islands below. Celestial, decisive, still wet with the primal ocean. High celestial light from above, background of the floating golden bridge of heaven (Ama-no-Hashidate) over a churning primordial sea beneath drifting cloud seas."),
    ("mes-tablets", "mesopotamian", "Tablets of Destiny",
     "The Tablets of Destiny held by Enlil and carried by Ninurta: a pair of fired-clay tablets covered in dense cuneiform decrees, sealed in a band of hammered gold, their wedges glowing faintly like embers as each fate is written and rewritten. Ancient, binding, terrifying in their quiet. Deep lamplight in a ziggurat archive vault, background of a lapis night sky through a high window with the fates mapped as stars."),
    ("slv-perun-axe", "slavic", "Perun's Thunderbolt Axe",
     "Perun's thunderbolt axe, hurled at Veles the shapeshifter: a stone-flint axe head of storm-grey flint veined with electric white, bound to an oak haft with copper wire, oak leaves and sparks of fire clinging to the edge. Weathered, charged, humming with storm wrath. Red-white lightning light from above, background of a black birch forest in a downpour with one struck tree splitting in the distance."),
    ("slv-perun-belt", "slavic", "Perun's Rain-Belt",
     "Perun's rain-belt, the girdle that binds the rains: a wide warrior's leather belt of oxblood hide with bronze thunder-ornament plaques and a great amber buckle, tiny droplets of water sealed inside the leather weave, mist rising off it. Old, heavy, potent with held weather. Storm-lit silver light with warm hearth glow from one side, background of a twilight meadow under a low rain-heavy cloud bank over stooks of rye."),
    ("slv-veles-horns", "slavic", "Veles' Shapeshift Horns",
     "Veles' horn of the underworld herd: a great aurochs drinking-horn of dark polished horn banded in tarnished silver, overflowing with golden coins, grain ears and a curl of milk-foam, small serpent carvings coiling around its rim. Abundant, chthonic, faintly sinister. Green-gold light from below like swamp fire, background of the dark root-caverns beneath the world-tree with distant cattle-shapes in the mist."),
    ("slv-mokosh-spindle", "slavic", "Mokosh's Spindle",
     "Mokosh's spindle, distaff and whorl, spinner of the fate of women and the earth: a carved birch-wood distaff wound with raw flax, a clay whorl painted with red solar embroidery signs, a half-formed thread glowing faintly like a lifeline. Humble, sacred, worn smooth by generations. Warm hearth-fire light in deep evening shadow, background of a wooden izba interior with embroidered rushnyky towels and a spinning wheel in soft focus."),
    ("slv-morana-effigy", "slavic", "Morana's Straw Effigy",
     "Morana's straw effigy, winter-death drowned each spring: a tall straw figure with a pale painted linen face, dressed in a faded bridal headdress and grey rags, river-water dripping from its hem, wildflowers already sprouting from its straw hair. Eerie, sorrowful, quietly hopeful. Cold early-spring dawn light over water, background of a wide grey river at ice-break with birch banks and a distant willow in mist."),
    ("slv-jarilo-green-oak", "slavic", "Jarilo's Green Oak Branch",
     "Jarilo's green oak branch, the spring-gift that brings life back to the living earth: a thick severed oak branch in full impossible leaf and blossom even at dead winter, sap glowing amber-gold at the cut end, tiny white flowers opening as you watch. Living, young, miraculous. First-green dawn light with mist, background of a snow-melting birch clearing with one patch of green spreading outward from the branch."),
    ("slv-svarog-tongs", "slavic", "Svarog's Smith Tongs",
     "Svarog's forge tongs, the smith-god's tool that forged the first marriage: massive black iron tongs with a hammer-face grip, their tips still holding a sliver of white-hot metal, sparks frozen mid-fall, the grips bound in scarred leather. Titanic, hot, sacred to the forge. Blinding forge-orange light from below, background of a night sky above a ritual bonfire ring with faint dancing-couple silhouettes far off."),
]

# id fixes: keep ids exactly as in data/*/artifacts.json
ID_FIX = {"gre-hades-kunee": "gre-hades-helmet", "gre-hermes-kad": "gre-hermes-caduceus",
          "jpn-kusanagi": "jpn-kusanagi", "jpn-yata": "jpn-yata-kagami",
          "jpn-yasakani": "jpn-yasakani", "jpn-nuboko": "jpn-amenonuboko",
          "mes-tablets": "mes-tablets-of-fate", "slv-perun-horns": "slv-veles-shapeshift",
          "slv-veles-horns": "slv-veles-shapeshift", "slv-mokosh-spin": "slv-mokosh-spindle",
          "slv-jarilo-branch": "slv-jarilo-green-oak", "slv-svarog-tongs": "slv-svarog-forge-tongs"}

def main():
    items, manifest = [], []
    for rid, culture, name, body in RELICS:
        rid = ID_FIX.get(rid, rid)
        prompt = THEME[culture] + " " + body + TAIL
        slot = f"public/cards/{culture}/{culture}-{rid}.png"
        items.append({"id": rid, "kind": "relic", "culture": culture, "name": name,
                      "slot": slot, "prompt": prompt})
        manifest.append({"file": f"{culture}/{culture}-{rid}.png", "prompt": prompt, "seed": 20261021})
    out = os.path.join(D, "data", "prompts-v2", "relics.json")
    json.dump({"items": items}, open(out, "w"), indent=1, ensure_ascii=False)
    mout = os.path.join(D, "scripts", "relics-node2-manifest.json")
    json.dump(manifest, open(mout, "w"), indent=1, ensure_ascii=False)
    print(f"wrote {len(items)} relic prompts -> {out}")
    print(f"wrote node2 manifest ({len(manifest)} items) -> {mout}")

if __name__ == "__main__":
    main()
