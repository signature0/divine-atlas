#!/usr/bin/env python3
# NORSE dataset builder. Writes research/norse/*.json
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/norse"
os.makedirs(OUT, exist_ok=True)
C = "norse"

def dump(name, obj):
    p = os.path.join(OUT, name)
    json.dump(obj, open(p, "w"), indent=1, ensure_ascii=False)
    print("wrote", name, ":", len(obj) if isinstance(obj, list) else "obj")

E = []
def ent(id, name, native, alt, cls, gender, domains, **kw):
    e = {
        "id": id, "culture": C, "name": name, "native_name": native,
        "alternative_names": alt, "classification": cls, "gender": gender,
        "domains": domains,
        "symbols": kw.get("symbols", []), "animals": kw.get("animals", []),
        "weapons": kw.get("weapons", []), "sacred_objects": kw.get("sacred_objects", []),
        "parents": kw.get("parents", []), "siblings": kw.get("siblings", []),
        "partners": kw.get("partners", []), "children": kw.get("children", []),
        "allies": kw.get("allies", []), "enemies": kw.get("enemies", []),
        "associated_realms": kw.get("realms", []), "associated_places": kw.get("places", []),
        "major_myths": kw.get("myths", []), "primary_sources": kw.get("srcs", []),
        "artworks": kw.get("art", []), "description_short": kw["short"],
        "description_long": kw["long"], "interesting_facts": kw.get("facts", []),
        "uncertainty_notes": kw.get("unc", []), "hero_artwork": kw.get("hero"),
    }
    E.append(e)

def S(ref, name, date, typ, url=None):
    return {"type": typ, "name": name, "date": date, "ref": ref, "url": url}

SRC_POETIC = S("S1","Poetic Edda (Codex Regius)","c. 1270 (preserves earlier oral poetry)","text","https://www.sacred-texts.com/neu/poe/index.htm")
SRC_PROSE = S("S2","Snorri Sturluson, Prose Edda","c. 1220–1235","text","https://www.sacred-texts.com/neu/pse/index.htm")
SRC_SKALD = S("S3","Skaldic poetry (various)","9th–13th c. CE","text",None)
SRC_GOSFORTH = S("S4","Gosforth Cross (carving)","c. 950–1000 CE","archaeological",None)
SRC_OSEBERG = S("S5","Oseberg ship burial (excavated)","c. 834 CE","archaeological",None)

# ---- Primordial ----
ent("nor-ginnungagap","Ginnungagap","Ginnungagap",[],"realm","unknown",
    ["the void","the primordial gap"],
    short="The yawning void between fire and ice — the primordial space from which the first beings emerged.",
    long="Ginnungagap is the 'yawning gap' at the center of Norse creation: Niflheim (ice) lay to the north, Muspelheim (fire) to the south, and between them the void where rime and frost formed [S2]. From this gap, the first living being — the ice-giant Ymir — and the cow Auðhumbla emerged [S1][S2]. Ginnungagap is not a 'place' so much as the primordial condition of the world before it had shape [S2].",
    facts=["Between Niflheim (ice) and Muspelheim (fire) [S2].",
           "The rime that dripped from it became Ymir [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE],
    art=[])

ent("nor-muspel","Muspel (fire)","Múspell",[],"realm","unknown",
    ["fire","heat"],
    short="The realm of fire to the south, whose heat began the creation of the world.",
    long="Muspelheim is the realm of fire, to the south of Ginnungagap. Its sparks and heat dripped onto the rime of Niflheim, melting it and beginning the creation of the world [S2]. At Ragnarök, Muspel's fire (led by Surt) destroys the world [S1][S2].",
    facts=["Its heat began creation [S2].",
           "Surt, its fire-giant, burns the world at Ragnarök [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE],
    art=[])

ent("nor-niflheim","Niflheim (ice)","Niflheimr",[],"realm","unknown",
    ["ice","cold"],
    short="The realm of ice and mist to the north, source of the rime that became Ymir.",
    long="Niflheim is the realm of ice and mist, to the north of Ginnungagap. Its rivers (the Élivágar) flowed with rime, and where the rime met the heat of Muspelheim, Ymir and Auðhumbla formed [S2].",
    facts=["Source of the primordial rime [S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE],
    art=[])

ent("nor-ymir","Ymir","Ymir",["Aurgelmir"],"giant","male",
    ["the primordial giant"],
    parents=["nor-ginnungagap"],
    children=["nor-burir","nor-berkuthroth","nor-thrudgelmir"],
    short="The first being, an ice-giant formed from the rime of Ginnungagap; his body became the world.",
    long="Ymir is the first living being, a giant of rime and frost who formed in Ginnungagap and was nourished by the milk of the cow Auðhumbla, who licked him free of the ice [S2]. From his sweating armpits came two more giants (a male and a female), and from his foot a six-headed son [S2]. When the gods Odin, Vili, and Vé killed Ymir, his body became the world: his blood the seas, his flesh the earth, his bones the mountains, his skull the sky, and his brains the clouds [S2]. Ymir's descendants, the frost-giants (jötnar), are the gods' chief enemies [S1][S2].",
    facts=["The first being; formed from rime and frost [S2].",
           "Nourished by the cow Auðhumbla, who licked him free of ice [S2].",
           "His body became the world when the gods killed him [S2].",
           "His descendants (frost-giants) are the gods' chief enemies [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE],
    art=[])

ent("nor-aurdhumbla","Auðhumbla","Auðhumbla",[],"creature","female",
    ["the primordial cow"],
    short="The primordial cow who licked Ymir free of the ice and whose milk nourished him.",
    long="Auðhumbla is the first cow, formed from the rime of Ginnungagap. She licked the ice free of Ymir's form and nourished him with her milk; from the salt she licked from the ice came the first god, Búri [S2]. Auðhumbla is a creature of the primordial world, not a god.",
    facts=["Licked Ymir free of the ice [S2].",
           "Búri (the first god) was formed from the salt she licked from the ice [S2]."],
    unc=[],
    srcs=[SRC_PROSE],
    art=[])

# ---- First gods ----
ent("nor-burir","Búri","Búrir",[],"deity","male",
    ["the first god"],
    children=["nor-borr"],
    short="The first god, formed from the salt the primordial cow licked from the ice; father of Borr.",
    long="Búri is the first of the gods, formed from the salt that the cow Auðhumbla licked from the ice [S2]. He is the father of Borr, who married the giantess Bestla, and their sons are the three gods Odin, Vili, and Vé [S2]. Búri is a remote ancestor, barely developed in the sources — he is the link between the primordial world and the divine line.",
    facts=["Formed from salt licked from the ice [S2].",
           "Father of Borr, grandfather of Odin [S2]."],
    unc=["Búri's role is minimal in the sources; he is a genealogical link [S2]."],
    srcs=[SRC_PROSE],
    art=[])

ent("nor-borr","Borr","Borr",[],"deity","male",
    ["the ancestor of the gods"],
    parents=["nor-burir"], partners=["nor-bestla"],
    children=["nor-odin","nor-vili","nor-ve"],
    short="Son of Búri and husband of the giantess Bestla; father of Odin, Vili, and Vé.",
    long="Borr is the son of Búri and the husband of the giantess Bestla. Their sons are the three brothers Odin, Vili, and Vé, who created the world from the body of Ymir [S2]. Borr is another remote ancestor, named chiefly to complete the genealogy of the gods.",
    facts=["Father of Odin, Vili, and Vé [S2]."],
    unc=[],
    srcs=[SRC_PROSE],
    art=[])

ent("nor-bestla","Bestla","Bestla",[],"giant","female",
    ["the giantess mother of the gods"],
    partners=["nor-borr"],
    children=["nor-odin","nor-vili","nor-ve"],
    short="The giantess who married Borr and bore the three gods Odin, Vili, and Vé.",
    long="Bestla is a giantess (jötun) who married the god Borr and bore the three brothers Odin, Vili, and Vé [S2]. Her giant lineage is significant: it reminds that the gods and the giants share a common ancestry, and that the gods' enemies are also, in a sense, their kin [S2].",
    facts=["Mother of Odin, Vili, and Vé [S2].",
           "Her giant lineage links the gods to the giants [S2]."],
    unc=[],
    srcs=[SRC_PROSE],
    art=[])

# ---- The three brothers ----
ent("nor-odin","Odin","Óðinn",["Woden (Old English)","Odin"],"deity","male",
    ["wisdom","war","death","magic","poetry","rulership","the runes"],
    symbols=["two ravens (Huginn & Muninn)","two wolves (Geri & Freki)","one eye","the Gungnir spear","the world-tree Yggdrasil","the gallows"],
    animals=["ravens","wolves","horses (Sleipnir)"],
    weapons=["Gungnir (spear)"],
    sacred_objects=["the gallows","the runes","the mead of poetry"],
    parents=["nor-borr","nor-bestla"],
    siblings=["nor-vili","nor-ve"],
    partners=["nor-frigg"],
    children=["nor-baldr","nor-vidar","nor-vali","nor-thor","nor-heimdall","nor-brage"],
    enemies=["nor-loomi","nor-fenrir"],
    realms=["nor-asgard"],
    myths=["nor-creation","nor-runes","nor-baldr-death","nor-ragnarok"],
    short="The Allfather, chief of the Æsir: god of wisdom, war, death, magic, and poetry. He sacrificed an eye for wisdom and hung on Yggdrasil to win the runes.",
    long="Odin is the Allfather, chief of the Æsir and the most complex of the Norse gods [S1][S2][S3]. He is the god of wisdom, war, death, magic (seiðr), poetry, and the runes, and the ruler of the hall Valhalla, where he receives the slain warriors (the Einherjar) in preparation for Ragnarök [S2]. To gain wisdom, he sacrificed one of his eyes to the well-being Mímir [S2]; to win the runes, he hung himself on the world-tree Yggdrasil for nine nights, pierced by his own spear [S1]. His two ravens, Huginn (Thought) and Muninn (Memory), fly over the world each day and report to him; his two wolves, Geri and Freki, and his eight-legged horse Sleipnir are his companions [S2]. Odin is a figure of profound duality: the wise king and the wandering magician, the god of life and the god of death, the allfather and the one who will die to Fenrir at Ragnarök [S1][S2]. He is the patron of the skalds and of the poetic art, and his name is associated with the 'Odinic' trance (the 'Riding Out,' or hamingja) [S3].",
    facts=["Sacrificed an eye for wisdom at Mímir's well [S2].",
           "Hung on Yggdrasil for nine nights to win the runes [S1].",
           "Ruler of Valhalla, receiving the slain for Ragnarök [S2].",
           "Two ravens (Huginn, Muninn), two wolves (Geri, Freki), eight-legged horse Sleipnir [S2].",
           "Dies to the wolf Fenrir at Ragnarök [S1][S2]."],
    unc=["Odin's 'war' aspect and his 'death' aspect are both genuine; the sources present him as both the god who wins battles and the god of the slain [S1][S2][S3].",
         "Some scholars see Odin as a 'culture-hero' who brought the runes and poetry; this is interpretation, not a source claim [S3]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD, SRC_GOSFORTH],
    art=["nor-art-odin-doepler","nor-art-odin-sleipnir-ms","nor-art-oseberg-ship"], hero="nor-art-odin-doepler")

ent("nor-vili","Vili","Vili",[],"deity","male",
    ["one of the three brothers who made the world"],
    parents=["nor-borr","nor-bestla"],
    siblings=["nor-odin","nor-ve"],
    short="One of the three brothers (with Odin and Vé) who created the world from Ymir's body. Barely developed in the sources.",
    long="Vili is one of the three brothers — Odin, Vili, and Vé — sons of Borr and Bestla, who together created the world from the body of the giant Ymir [S2]. After the creation, Vili (and Vé) largely disappear from the myths; Odin becomes the chief god, and the 'three brothers' are mostly a memory of the creation act [S2]. Vili is one of the 'thin' figures of Norse myth — named, but not developed.",
    facts=["Co-creator of the world with Odin and Vé [S2].",
           "Largely disappears from the myths after the creation [S2]."],
    unc=["Vili is a 'thin' figure; the sources give him almost no independent myth [S2]."],
    srcs=[SRC_PROSE],
    art=[])

ent("nor-ve","Vé","Vé",[],"deity","male",
    ["one of the three brothers who made the world"],
    parents=["nor-borr","nor-bestla"],
    siblings=["nor-odin","nor-vili"],
    short="One of the three brothers (with Odin and Vili) who created the world. Barely developed in the sources.",
    long="Vé is the third of the three brothers — Odin, Vili, and Vé — who created the world from Ymir's body [S2]. Like Vili, he is named in the creation but then largely absent from the myths [S2].",
    facts=["Co-creator of the world [S2].",
           "Largely absent after the creation [S2]."],
    unc=["Vé is a 'thin' figure [S2]."],
    srcs=[SRC_PROSE],
    art=[])

# ---- Æsir (major) ----
ent("nor-thor","Thor","Þórr",["Donar (Old English)"],"deity","male",
    ["thunder","storms","strength","the protection of humans"],
    symbols=["Mjölnir (hammer)","the world-encircling belt","iron gloves"],
    animals=["the bull (of Geirðröðr)"],
    weapons=["Mjölnir (hammer)"],
    sacred_objects=["Mjölnir","the belt of strength (Megingjörð)"],
    parents=["nor-odin"],
    siblings=[],
    partners=["nor-sif","nor-geirdrud","nor-jarnsaxa"],
    children=["nor-magni","nor-modi","nor-uthra"],
    enemies=["nor-loomi","nor-jormungandr","nor-hrungnir"],
    realms=["nor-asgard"],
    myths=["nor-thor-geirdrud","nor-thor-hrungnir","nor-ragnarok","nor-jormungandr"],
    short="God of thunder and storms, wielder of the hammer Mjölnir, and the mightiest protector of the gods and of humans.",
    long="Thor is the god of thunder and the mightiest of the Æsir, the protector of the gods and of humanity [S1][S2][S3]. His weapon is the hammer Mjölnir, which never misses and which he uses against the giants and the monsters that threaten the world [S2]. He is the son of Odin and of a giantess (Járnsaxa in one account, the earth in another) [S2]. Thor is a god of the common people — his hammer was a symbol of protection worn by ordinary people, and his name is the source of 'Thursday' (Thor's day) [S3][S4]. His enemies are the giants (jötnar) and the great monsters: the world-serpent Jörmungandr, whom he will slay (and be slain by) at Ragnarök, and the giant Hrungnir, whom he fells with Mjölnir [S1][S2]. He is a figure of raw, protective strength — not the subtle wisdom of Odin, but the brute force that keeps the world safe [S2][S3].",
    facts=["Wields the hammer Mjölnir, which never misses [S2].",
           "Protector of the gods and of humans; a god of the common people [S3].",
           "His name gives 'Thursday' (Thor's day) [S3].",
           "Slays and is slain by the world-serpent Jörmungandr at Ragnarök [S1][S2]."],
    unc=["Thor's mother is given as a giantess (Járnsaxa) in some accounts and as the earth (Jörd) in others — a genuine variant [S2].",
         "Thor is the 'common people's' god, more associated with protection than with the courtly Æsir [S3]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD, SRC_GOSFORTH],
    art=["nor-art-thor-winge","nor-art-thor-hrungnir","nor-art-thor-geherts"], hero="nor-art-thor-winge")

ent("nor-frigg","Frigg","Frigg",[],"deity","female",
    ["marriage","motherhood","the sky (as a personification)"],
    symbols=["the veil","the brooch (Brísingamen, in some accounts)"],
    parents=[],
    siblings=[],
    partners=["nor-odin"],
    children=["nor-baldr","nor-vidar","nor-vali"],
    realms=["nor-asgard"],
    myths=["nor-baldr-death"],
    short="Queen of the Æsir, wife of Odin, mother of Baldr; a goddess of marriage and the home.",
    long="Frigg is the queen of the Æsir, the wife of Odin, and the mother of Baldr [S2]. She is a goddess of marriage, the home, and (in some accounts) the sky. Her most defining myth is the death of Baldr: when she learned that her son was fated to die, she extracted oaths from all things not to harm him — except the mistletoe, which she overlooked (or refused to bind); Loki then exploited this to kill Baldr [S2]. Frigg is a figure of maternal grief and of the limits of divine power — she cannot save her son [S2].",
    facts=["Wife of Odin, mother of Baldr [S2].",
           "Extracted oaths from all things to protect Baldr — but missed the mistletoe [S2].",
           "Her grief at Baldr's death is a central myth [S2]."],
    unc=["The 'mistletoe' detail and Frigg's role vary across sources; the core is Baldr's death by Loki's hand [S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-oseberg-ship"])

ent("nor-baldr","Baldr","Baldr",[],"deity","male",
    ["light","the sun (in some accounts)","beauty","purity"],
    symbols=["the mistletoe (his death)"],
    parents=["nor-odin","nor-frigg"],
    siblings=["nor-hodr"],
    partners=["nor-nanna"],
    children=["nor-forseti"],
    enemies=["nor-loomi","nor-hodr"],
    realms=["nor-asgard"],
    myths=["nor-baldr-death"],
    short="The brightest and most beloved of the gods, associated with light and purity; his murder by Loki (via the mistletoe) is the great tragedy of Norse myth.",
    long="Baldr is the brightest, fairest, and most beloved of the gods, associated with light and (in some accounts) with the sun [S1][S2]. He and his wife Nanna live in the hall of Breidablik [S2]. His death is the great tragedy of Norse myth: his mother Frigg, warned of his fate, extracted oaths from all things not to harm him — except the mistletoe, which she overlooked; Loki, disguised as an old woman, learned of this and guided Baldr's blind brother Höðr to throw a mistletoe dart at him, killing him [S2]. Baldr's death is the beginning of the end: it is the act that sets the chain of events leading to Ragnarök in motion [S1][S2]. His son is Fosite (Forsétir), god of peace and reconciliation [S2].",
    facts=["The brightest and most beloved of the gods [S2].",
           "Killed by a mistletoe dart, thrown by his blind brother Höðr at Loki's instigation [S2].",
           "His death begins the chain of events leading to Ragnarök [S1][S2].",
           "Husband of Nanna; father of Fosite [S2]."],
    unc=["Baldr's association with the sun is later and interpretive; the earliest Baldr is a god of light and beauty, not strictly the sun [S1][S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-baldr-cramer"])

ent("nor-hodr","Höðr","Höðr",[],"deity","male",
    ["the blind brother of Baldr"],
    parents=["nor-odin","nor-frigg"],
    siblings=["nor-baldr"],
    short="The blind brother of Baldr, who unknowingly threw the mistletoe dart that killed his brother, at Loki's instigation.",
    long="Höðr is the blind brother of Baldr. At Loki's instigation (disguised as an old woman), Höðr was led to throw a mistletoe dart at Baldr, killing him [S2]. Höðr is a figure of tragic innocence — he did not know what he was doing, and he is the unwitting instrument of the great tragedy [S2].",
    facts=["Blind brother of Baldr [S2].",
           "Unwittingly killed Baldr at Loki's instigation [S2]."],
    unc=[],
    srcs=[SRC_PROSE],
    art=[])

ent("nor-loomi","Loki","Loki",[],"trickster","male",
    ["cunning","trickery","fire (in some accounts)"],
    symbols=["the mistletoe (his weapon)"],
    parents=[],
    siblings=[],
    partners=["nor-anguela","nor-sid"],
    children=["nor-fenrir","nor-jormungandr","nor-hel","nor-sleipnir"],
    enemies=["nor-odin","nor-thor"],
    realms=["nor-asgard"],
    myths=["nor-loki-children","nor-baldr-death","nor-ragnarok"],
    short="The trickster god — part of the Æsir but not a true god — who engineered Baldr's death and will fight the gods at Ragnarök.",
    long="Loki is the trickster of Norse myth — a figure of cunning, transformation, and disruption. He is 'blood-related' to the gods (son of the giant Fárbauti in one account) but is not a true Æsir; he is a complex, ambiguous figure who helps the gods (he wins Sif's hair, the ship Skidblaðnir, and Thor's hammer, all through trickery) and who also destroys them (he engineers Baldr's death and will lead the enemies at Ragnarök) [S1][S2]. His children are among the greatest threats to the world: the wolf Fenrir (who will kill Odin), the world-serpent Jörmungandr (who will kill Thor), and Hel (who rules the realm of the dead) [S2]. At Ragnarök, Loki fights against the gods and is ultimately caught by the river-vine and slain by the serpent's poison [S1][S2]. Loki is the great ambivalent figure: helper and destroyer, the one who holds the fate of the world in his cunning [S1][S2].",
    facts=["A trickster, 'blood-related' to the gods but not a true Æsir [S2].",
           "Engineered Baldr's death via the mistletoe [S2].",
           "Father of Fenrir, Jörmungandr, Hel, and Sleipnir [S2].",
           "Fights the gods at Ragnarök and is slain [S1][S2]."],
    unc=["Loki's status (god vs. giant vs. trickster) is ambiguous in the sources; he is not a 'true' Æsir but is bound up with them [S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD, SRC_GOSFORTH],
    art=["nor-art-loki-frolich"])

ent("nor-tyr","Týr","Týr",["Tiw (Old English)"],"deity","male",
    ["war","justice","law","the sky (in some accounts)"],
    symbols=["the one hand (sacrificed to Fenrir)"],
    parents=[],
    siblings=[],
    short="God of war, justice, and law; he sacrificed his hand to bind the wolf Fenrir.",
    long="Týr is the god of war, justice, and law, and (in some accounts) of the sky. His defining act is the binding of the wolf Fenrir: the gods tricked Fenrir into letting them bind him, but only Týr was brave enough to place his hand in the wolf's mouth as a pledge of good faith; when the binding held, Fenrir bit off his hand [S2]. Týr is thus the god of the sacrifice of justice — he gave his hand to keep a promise, and he is the patron of oaths and of the law [S2]. His name gives 'Tuesday' (Tiw's day) [S3].",
    facts=["Sacrificed his hand to bind the wolf Fenrir [S2].",
           "God of war, justice, and law [S2].",
           "His name gives 'Tuesday' [S3]."],
    unc=["Týr's 'sky' association is later; the earliest Týr is a god of war and law [S2][S3]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-tyr-binding"])

ent("nor-freyr","Freyr","Freyr",[],"deity","male",
    ["fertility","the sun (in some accounts)","peace","the sea"],
    symbols=["the ship Skíðblaðnir","the boar Gullinbursti","the sword that fights itself"],
    parents=["nor-nyrd"],
    siblings=["nor-freyja"],
    partners=["nor-gerd"],
    children=["nor-byr"],
    enemies=["nor-surt"],
    realms=["nor-vanaheim"],
    myths=["nor-ragnarok"],
    short="God of fertility, peace, and the sea, of the Vanir; he gives his sword to a dwarf and is slain by Surt at Ragnarök.",
    long="Freyr is a god of the Vanir (a second divine tribe), associated with fertility, peace, the sun (in some accounts), and the sea [S2]. He owns the ship Skíðblaðnir (which folds up to fit in a pocket) and the boar Gullinbursti, and he is the one who gives a sword that fights by itself to a dwarf [S2]. His tragedy: to win the giantess Gerðr, he gives away his magic sword — and at Ragnarök, he is forced to fight Surt the fire-giant without it, and is slain [S1][S2]. Freyr is a god of peace and plenty, whose loss of his weapon is the price of his love [S2].",
    facts=["Of the Vanir; god of fertility, peace, the sea [S2].",
           "Gave his sword to a dwarf to win Gerðr, and is slain unarmed by Surt at Ragnarök [S1][S2].",
           "Owns the ship Skíðblaðnir and the boar Gullinbursti [S2]."],
    unc=["Freyr's 'sun' association is later; the earliest Freyr is a fertility god of the Vanir [S2][S3]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-gokstad-ship"])

ent("nor-freyja","Freyja","Freyja",[],"deity","female",
    ["love","beauty","fertility","war","seiðr (magic)","the dead"],
    symbols=["the cat","the bridle (of the sky)"],
    animals=["cats"],
    parents=["nor-nyrd"],
    siblings=["nor-freyr"],
    children=[],
    realms=["nor-vanaheim","nor-folkvangr"],
    myths=[],
    short="Goddess of love, beauty, fertility, war, and magic (seiðr), of the Vanir; she receives half of the slain in her hall Fólkvangr.",
    long="Freyja is a goddess of the Vanir, associated with love, beauty, fertility, war, and the magic of seiðr [S2]. She is the sister of Freyr and the owner of the necklace Brísingamen [S2]. She is a war-goddess: she chooses half of the slain for her hall Fólkvangr (the other half going to Odin's Valhalla) [S2]. She is also a goddess of seiðr (a form of Norse magic), which was associated with both power and taboo [S2]. Freyrja is a complex, powerful female deity who straddles the domains of love and war [S2].",
    facts=["Of the Vanir; sister of Freyr [S2].",
           "Receives half of the slain in her hall Fólkvangr [S2].",
           "Goddess of love, beauty, war, and seiðr (magic) [S2].",
           "Owner of the necklace Brísingamen [S2]."],
    unc=["Freyja's seiðr (magic) was associated with taboo and with a 'unmanly' practice (argi) in some male sources; the sources are ambiguous about her own role [S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-freyja-penrose"])

ent("nor-nyrd","Njord","Njordr",[],"deity","male",
    ["the sea","calm winds","wealth","sailing"],
    symbols=["the ship"],
    parents=[],
    siblings=[],
    partners=["nor-ska"],
    children=["nor-freyr","nor-freyja"],
    realms=["nor-vanaheim"],
    myths=[],
    short="God of the sea, calm winds, and wealth, of the Vanir; father of Freyr and Freyja.",
    long="Njord is a god of the Vanir, associated with the sea, calm winds, wealth, and sailing [S2]. He is the father of Freyr and Freyja [S2]. His home is Nóatún (the boat-stall), by the sea [S2]. Njord is a god of the practical, maritime aspects of life — the calm sea, the good wind, the wealth that comes from the sea [S2].",
    facts=["Of the Vanir; god of the sea, calm winds, wealth [S2].",
           "Father of Freyr and Freyja [S2].",
           "Home is Nóatún, by the sea [S2]."],
    unc=[],
    srcs=[SRC_PROSE, SRC_SKALD],
    art=[])

ent("nor-heimdall","Heimdall","Heimdallr",[],"deity","male",
    ["the watchman","the light","the dawn"],
    symbols=["the horn Gjallarhorn"],
    parents=["nor-odin"],
    siblings=[],
    enemies=["nor-loomi"],
    realms=["nor-asgard"],
    myths=["nor-ragnarok"],
    short="The watchman of the gods, who guards the Bifrost and will sound the horn Gjallarhorn at Ragnarök; he and Loki will kill each other.",
    long="Heimdall is the watchman of the gods, the one who guards the Bifrost (the rainbow bridge to Asgard) and who can see and hear across the whole world [S2]. He is the god of the light and the dawn, and he will sound the horn Gjallarhorn to wake the gods at Ragnarök [S1][S2]. At the final battle, Heimdall and Loki will fight and kill each other [S1][S2]. His parentage is a genuine variant: in one account he is the son of Odin and of a giantess named Angrboða (which is odd, because Angrboða is elsewhere Loki's wife); in another he has nine mothers [S2].",
    facts=["Watchman of the gods; guards the Bifrost [S2].",
           "Will sound the horn Gjallarhorn at Ragnarök [S1][S2].",
           "Will kill and be killed by Loki at Ragnarök [S1][S2]."],
    unc=["Heimdall's parentage is a genuine variant: son of Odin & Angrboða (odd, since she is elsewhere Loki's wife) vs. nine mothers [S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=[])

ent("nor-vidar","Víðarr","Vidar",[],"deity","male",
    ["silence","strength","the avenger"],
    parents=["nor-odin"],
    siblings=[],
    enemies=["nor-fenrir"],
    realms=["nor-asgard"],
    myths=["nor-ragnarok"],
    short="The silent son of Odin, who will avenge his father by slaying the wolf Fenrir at Ragnarök.",
    long="Víðarr is the son of Odin and (in one account) of the giantess Gríðr; he is a god of silence and of strength. At Ragnarök, he will avenge his father by slaying the wolf Fenrir, who has killed Odin, by kicking the wolf's lower jaw up and driving his sword through its head [S1][S2]. Víðarr is the 'silent' god — he speaks little, and his vengeance is the only one that succeeds at Ragnarök [S2].",
    facts=["The silent son of Odin [S2].",
           "Will avenge Odin by slaying Fenrir at Ragnarök [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=[])

ent("nor-vali","Váli","Vali",[],"deity","male",
    ["the avenger of Baldr"],
    parents=["nor-odin"],
    siblings=[],
    enemies=["nor-hodr"],
    realms=["nor-asgard"],
    myths=["nor-baldr-death"],
    short="The son of Odin, who will avenge his brother Baldr by slaying Höðr.",
    long="Váli is the son of Odin, born (in one account) from the body of Baldr after his death, to avenge him. At the funeral of Baldr, Váli will slay Höðr, the blind brother who killed Baldr [S2]. Váli is a figure of swift, one-act vengeance — he exists to kill Höðr and then disappears from the myths [S2].",
    facts=["Son of Odin, born to avenge Baldr [S2].",
           "Will slay Höðr, Baldr's killer [S2]."],
    unc=["Váli's birth 'from Baldr's body' is a strange and unexplained detail in the sources [S2]."],
    srcs=[SRC_PROSE, SRC_SKALD],
    art=[])

# ---- Monsters & creatures ----
ent("nor-fenrir","Fenrir","Fenrirr",[],"monster","male",
    ["the great wolf"],
    parents=["nor-loomi","nor-anguela"],
    siblings=["nor-jormungandr","nor-hel","nor-sleipnir"],
    enemies=["nor-tyr","nor-odin"],
    realms=["nor-midgard"],
    myths=["nor-fenrir-binding","nor-ragnarok"],
    short="The great wolf, son of Loki, whom the gods bound with the magic ribbon Gleipnir; he will kill Odin at Ragnarök.",
    long="Fenrir is the great wolf, son of Loki and the giantess Angerboa (Angrboða) [S2]. As a pup he was raised in Asgard, but the gods grew afraid of his strength and tried to bind him. The first two bindings (Leadbond and Dromi) he broke, but the third — a magic ribbon made of six impossible things (Gleipnir) — held, because only Týr placed his hand in the wolf's mouth as a pledge; when the binding held, Fenrir bit off his hand [S2]. Fenrir will break free at Ragnarök and grow so large that his jaw touches the earth and his mouth the sky; he will swallow the sun and kill Odin, who will be avenged by his son Víðarr [S1][S2].",
    facts=["Son of Loki and the giantess Angerboa [S2].",
           "Bound with the magic ribbon Gleipnir; bit off Týr's hand [S2].",
           "Will kill Odin at Ragnarök [S1][S2].",
           "Will be avenged by Odin's son Víðarr [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD, SRC_GOSFORTH],
    art=["nor-art-fenrir-hardy"])

ent("nor-jormungandr","Jörmungandr","Jörmungandr",["the Midgard Serpent"],"monster","male",
    ["the world-serpent"],
    parents=["nor-loomi","nor-anguela"],
    siblings=["nor-fenrir","nor-hel","nor-sleipnir"],
    enemies=["nor-thor"],
    realms=["nor-sea"],
    myths=["nor-ragnarok"],
    short="The world-serpent, son of Loki, whom the gods cast into the sea; he encircles the world and will kill Thor at Ragnarök.",
    long="Jörmungandr (the Midgard Serpent) is the world-serpent, son of Loki and Angerboa [S2]. The gods, fearing him, cast him into the sea around Midgard, where he grew so large that he encircles the whole world and bites his own tail [S2]. Thor famously fishes him up in one episode (the great catch), but lets him go when he realizes the serpent's size [S2]. At Ragnarök, Jörmungandr rises from the sea, and Thor slays him — but walks nine steps and dies of the serpent's venom [S1][S2].",
    facts=["The world-serpent; encircles Midgard and bites his own tail [S2].",
           "Son of Loki and Angerboa [S2].",
           "Thor slays him at Ragnarök but dies of his venom [S1][S2]."],
    unc=[],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=[])

ent("nor-hel","Hel","Hel",[],"deity","female",
    ["the dead","the underworld"],
    symbols=["half-living, half-dead (half her body is corpse-like)"],
    parents=["nor-loomi","nor-anguela"],
    siblings=["nor-fenrir","nor-jormungandr","nor-sleipnir"],
    realms=["nor-helheim"],
    myths=[],
    short="The ruler of the realm of the dead (Hel), daughter of Loki; she is half-living, half-dead.",
    long="Hel is the daughter of Loki and Angerboa, and the ruler of the realm of the dead (also called Hel) [S2]. She is a strange being: half of her body is living and the other half is corpse-like (the color of a dead fish) [S2]. The gods, wishing to get rid of her, cast her into the north with a hall of the dead, where she rules over those who die of sickness or old age (as opposed to those who die in battle, who go to Valhalla) [S2]. Hel is not 'evil' in the Christian sense; she is the ruler of the dead, a necessary part of the cosmic order [S2].",
    facts=["Ruler of the realm of the dead (Hel) [S2].",
           "Daughter of Loki and Angerboa [S2].",
           "Half-living, half-dead [S2].",
           "Rules over those who die of sickness or old age (not battle) [S2]."],
    unc=["Hel's realm is distinct from Valhalla; the two 'afterlives' are different destinations [S2]."],
    srcs=[SRC_POETIC, SRC_PROSE, SRC_SKALD],
    art=["nor-art-hel-zarubina"])

ent("nor-sleipnir","Sleipnir","Sleipnir",[],"creature","male",
    ["the eight-legged horse of Odin"],
    parents=["nor-loomi"],
    siblings=["nor-fenrir","nor-jormungandr","nor-hel"],
    short="The eight-legged horse of Odin, born of Loki (in the form of a mare).",
    long="Sleipnir is the eight-legged horse of Odin, the only steed that can ride between the worlds [S2]. In the myth of his birth, Loki, in the form of a mare, mated with the stallion Svaðilfari (a giant's horse) and bore Sleipnir [S2]. Sleipnir is grey, eight-legged, and the fastest of horses; he carries Odin between the worlds [S2].",
    facts=["The eight-legged horse of Odin [S2].",
           "Born of Loki (in the form of a mare) and the stallion Svaðilfari [S2].",
           "The only steed that can ride between the worlds [S2]."],
    unc=[],
    srcs=[SRC_PROSE, SRC_SKALD],
    art=["nor-art-odin-sleipnir-ms"])

ent("nor-anguela","Angerboa","Angrboða",[],"giant","female",
    ["the giantess mother of the monsters"],
    partners=["nor-loomi"],
    children=["nor-fenrir","nor-jormungandr","nor-hel","nor-sleipnir"],
    short="The giantess who, with Loki, mothered the great monsters: Fenrir, Jörmungandr, and Hel.",
    long="Angerboa (Angrboða) is a giantess who, in partnership with Loki, mothered the great monsters of the end of the world: the wolf Fenrir, the world-serpent Jörmungandr, and Hel, the ruler of the dead [S2]. She is the 'mother of monsters,' the source of the threats that will destroy the world at Ragnarök [S2].",
    facts=["Mother (with Loki) of Fenrir, Jörmungandr, and Hel [S2]."],
    unc=["Note: some sources confuse Angerboa with Heimdall's mother; the sources are not consistent [S2]."],
    srcs=[SRC_PROSE],
    art=[])

# ---- Heroes / figures ----
ent("nor-sif","Sif","Sif",[],"deity","female",
    ["the wife of Thor","beauty"],
    symbols=["golden hair (regrown by dwarves)"],
    partners=["nor-thor"],
    children=["nor-uthra"],
    short="The wife of Thor, whose golden hair was cut off by Loki and regrown by dwarves as real gold.",
    long="Sif is the wife of Thor and the mother of Ullr (in some accounts). Her defining myth: Loki, in a fit of mischief, cut off her beautiful golden hair; Thor threatened to kill him, so Loki went to the dwarves and had them make new hair for her — real gold, which grew like real hair [S2]. Sif is a figure of beauty and of the domestic side of the Æsir [S2].",
    facts=["Wife of Thor [S2].",
           "Her golden hair was cut by Loki and regrown by dwarves as real gold [S2]."],
    unc=[],
    srcs=[SRC_PROSE, SRC_SKALD],
    art=[])

ent("nor-uthra","Ullr","Ullr",[],"deity","male",
    ["the archer","the winter","skiing"],
    symbols=["the bow"],
    parents=["nor-thor","nor-sif"],
    siblings=[],
    short="The archer-god, associated with winter, skiing, and archery; son of Thor.",
    long="Ullr is a god of the Æsir, associated with archery, skiing, and the winter [S2]. He is the son of Thor and Sif (in some accounts) [S2]. Ullr is a relatively minor figure, but he is the patron of archery and of the winter sports [S2].",
    facts=["God of archery, skiing, and the winter [S2].",
           "Son of Thor (and Sif, in some accounts) [S2]."],
    unc=["Ullr's parentage (son of Thor vs. son of the giant Trúðr) is a genuine variant [S2]."],
    srcs=[SRC_PROSE, SRC_SKALD],
    art=[])


# ---- Referenced figures (lightweight) ----
ent("nor-nanna","Nanna","Nanna",[],"deity","female",
    ["the wife of Baldr"],
    partners=["nor-baldr"], children=["nor-forseti"],
    realms=["nor-asgard"],
    short="The wife of Baldr; when Baldr died, Nanna followed him into grief (in some accounts she dies of sorrow).",
    long="Nanna is the wife of Baldr. When Baldr died, Nanna was consumed by grief — in the Prose Edda she sets herself on Baldr's funeral pyre (in other accounts she dies of sorrow) [S2]. She is the mother of Fosite [S2].",
    facts=["Wife of Baldr [S2].",
           "Followed Baldr in death (burned on his pyre, in one account) [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-forseti","Fosite (Forsétir)","Fórsétir",[],"deity","male",
    ["peace","reconciliation","justice"],
    parents=["nor-baldr","nor-nanna"],
    realms=["nor-asgard"],
    short="The son of Baldr, god of peace and reconciliation, who sits in the hall of Glitnir to settle disputes.",
    long="Fosite (Forsétir) is the son of Baldr and Nanna, and a god of peace, reconciliation, and justice. He sits in the hall of Glitnir, where he settles all disputes, and his judgments are accepted by all [S2].",
    facts=["Sits in the hall of Glitnir to settle disputes [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-magni","Magni","Magni",[],"deity","male",
    ["strength"],
    parents=["nor-thor","nor-jarnsaxa"], siblings=["nor-modi"],
    short="The son of Thor (and the giantess Járnsaxa), a god of great strength.",
    long="Magni is the son of Thor and the giantess Járnsaxa, a god of great strength. He and his brother Móði are the next generation of divine strength, destined to carry on after their father's death at Ragnarök [S2].",
    facts=["Son of Thor and the giantess Járnsaxa [S2].",
           "Destined to carry on after Ragnarök [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-modi","Móði","Móði",[],"deity","male",
    ["strength"],
    parents=["nor-thor","nor-jarnsaxa"], siblings=["nor-magni"],
    short="The son of Thor (and the giantess Járnsaxa), a god of great strength; brother of Magni.",
    long="Móði is the son of Thor and the giantess Járnsaxa, brother of Magni. The two are the next generation of divine strength [S2].",
    facts=["Son of Thor and the giantess Járnsaxa [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-jarnsaxa","Járnsaxa (Járnsaxa)","Járnsaxa",[],"giant","female",
    ["the giantess mother of Thor's sons"],
    partners=["nor-thor"], children=["nor-magni","nor-modi"],
    short="The giantess who, with Thor, mothered Magni and Móði.",
    long="Járnsaxa is a giantess who, in one account, is the mother of Thor's sons Magni and Móði [S2]. (Thor's mother is a separate, also-uncertain figure; Járnsaxa is the mother of his children with him, not his own mother.) [S2]",
    facts=["Mother of Magni and Móði [S2]."],
    unc=["Járnsaxa is sometimes confused in retellings with Thor's own mother; the sources treat her as the mother of Thor's sons [S2]."],
    srcs=[SRC_PROSE], art=[])

ent("nor-gerd","Gerðr","Gerðr",[],"giant","female",
    ["the giantess beloved of Freyr"],
    partners=["nor-freyr"],
    short="The giantess whom Freyr loved and for whom he gave away his magic sword.",
    long="Gerðr is a giantess whom Freyr saw and fell in love with. To win her, Freyr gave his magic sword (the one that fights by itself) to a dwarf as a gift, and as a result he is unarmed when Surt attacks at Ragnarök, and is slain [S2]. Gerðr is the cause of Freyr's fatal loss [S2].",
    facts=["Beloved of Freyr [S2].",
           "Freyr gave his sword away to win her, and is slain unarmed at Ragnarök [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-ska","Skaði","Skaði",[],"deity","female",
    ["the huntress","the mountains","skiing"],
    partners=["nor-nyrd"],
    short="The huntress-goddess, associated with the mountains and skiing; she married Njord but the marriage failed.",
    long="Skaði is a goddess of the hunt, the mountains, and skiing. She married Njord (the sea-god), but the marriage failed — she could not bear the sea, and he could not bear the mountains — and they separated [S2]. She is associated with winter and the mountains [S2].",
    facts=["Goddess of the hunt, mountains, skiing [S2].",
           "Married Njord, but the marriage failed (sea vs. mountains) [S2]."],
    unc=[], srcs=[SRC_PROSE, SRC_SKALD], art=[])

ent("nor-surt","Surt","Surt",[],"giant","male",
    ["the fire-giant","the end of the world"],
    weapons=["the great flame-sword"],
    enemies=["nor-freyr"],
    realms=["nor-muspel"],
    myths=["nor-ragnarok"],
    short="The fire-giant of Muspelheim, who wields the great flame-sword and will destroy the world at Ragnarök.",
    long="Surt is the fire-giant of Muspelheim, who wields a sword whose flame shines brighter than the sun [S1][S2]. At Ragnarök he marches against the gods, and he slays Freyr (who is unarmed, having given away his sword) [S1][S2]. Finally Surt hurls his flame over the whole world, destroying it [S1][S2].",
    facts=["The fire-giant of Muspelheim [S2].",
           "His flame-sword shines brighter than the sun [S2].",
           "Slays Freyr at Ragnarök, then burns the world [S1][S2]."],
    unc=[], srcs=[SRC_POETIC, SRC_PROSE], art=[])

ent("nor-hrungnir","Hrungnir","Hrungnir",[],"giant","male",
    ["the giant of the iron head"],
    enemies=["nor-thor"],
    short="The giant with the iron head and the iron belly, whom Thor slew with Mjölnir.",
    long="Hrungnir is a giant whose head is of iron and whose belly is of iron, with razor-blades inside; he boasted that he would drain the mead-hall of the gods and kill them. Thor (disguised as a servant) accepted the challenge, and they drank; then Thor, revealed, struck Hrungnir with Mjölnir and killed him, and with a second blow crushed his iron head [S2].",
    facts=["Giant of the iron head and iron belly [S2].",
           "Slew by Thor with Mjölnir [S2]."],
    unc=[], srcs=[SRC_PROSE], art=[])

ent("nor-sid","Síd","Síd",[],"giant","female",
    ["the giantess who bore Sleipnir (in one account)"],
    partners=["nor-loomi"],
    short="A giantess who, in one account, is the mother of Sleipnir with Loki.",
    long="Síd is a giantess who, in one account, is the mother of the eight-legged horse Sleipnir with Loki (in the more common account, Loki himself, in the form of a mare, is Sleipnir's mother) [S2]. This is one of the genuine variants in the parentage of Sleipnir [S2].",
    facts=["Mother of Sleipnir (in one account) [S2]."],
    unc=["Sleipnir's parentage is a variant: Loki-as-mare vs. Loki + Síd [S2]."],
    srcs=[SRC_PROSE], art=[])

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="attested",srcs=["S2"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# Creation chain
rel("nor-ginnungagap","nor-ymir","CREATED","Ginnungagap's rime and frost formed Ymir.","attested",["S2"])
rel("nor-ginnungagap","nor-aurdhumbla","CREATED","Ginnungagap's rime formed the cow Auðhumbla.","attested",["S2"])
rel("nor-aurdhumbla","nor-burir","CREATED","Búri was formed from the salt Auðhumbla licked from the ice.","attested",["S2"])
rel("nor-ymir","nor-burir","CREATED","(Alternative reading) some accounts link Ymir's sweat to the first beings; we keep the salt/Auðhumbla account as primary.","uncertain",["S2"],
    "The primary account is that Búri came from the salt Auðhumbla licked. We note the Ymir-sweat variant.")
rel("nor-burir","nor-borr","PARENT_OF","Búri is the parent of Borr.","attested",["S2"])
rel("nor-borr","nor-odin","PARENT_OF","Borr (with Bestla) is the parent of Odin.","attested",["S2"])
rel("nor-borr","nor-vili","PARENT_OF","Borr is the parent of Vili.","attested",["S2"])
rel("nor-borr","nor-ve","PARENT_OF","Borr is the parent of Vé.","attested",["S2"])
rel("nor-bestla","nor-odin","PARENT_OF","Bestla (with Borr) is the parent of Odin.","attested",["S2"])
rel("nor-bestla","nor-vili","PARENT_OF","Bestla is the parent of Vili.","attested",["S2"])
rel("nor-bestla","nor-ve","PARENT_OF","Bestla is the parent of Vé.","attested",["S2"])
rel("nor-odin","nor-vili","SIBLING_OF","Odin, Vili, and Vé are brothers.","attested",["S2"])
rel("nor-odin","nor-ve","SIBLING_OF","Odin and Vé are brothers.","attested",["S2"])
rel("nor-vili","nor-ve","SIBLING_OF","Vili and Vé are brothers.","attested",["S2"])
# The three brothers create the world
rel("nor-odin","nor-ymir","KILLED","Odin, Vili, and Vé killed Ymir and made the world from his body.","attested",["S2"],
    "The body of Ymir became the world: blood the seas, flesh the earth, bones the mountains, skull the sky.")
rel("nor-vili","nor-ymir","KILLED","Vili (with Odin and Vé) killed Ymir.","attested",["S2"])
rel("nor-ve","nor-ymir","KILLED","Vé (with Odin and Vili) killed Ymir.","attested",["S2"])
# Odin family
rel("nor-odin","nor-frigg","PARTNER_OF","Odin and Frigg are the king and queen of the Æsir.","attested",["S2"])
rel("nor-odin","nor-baldr","PARENT_OF","Odin (with Frigg) is the parent of Baldr.","attested",["S2"])
rel("nor-frigg","nor-baldr","PARENT_OF","Frigg is the parent of Baldr.","attested",["S2"])
rel("nor-odin","nor-thor","PARENT_OF","Odin is the parent of Thor.","attested",["S2"])
rel("nor-odin","nor-heimdall","PARENT_OF","Odin is (in one account) the parent of Heimdall.","variant",["S2"],
    "Heimdall's parentage is a variant: Odin & Angrboða vs. nine mothers.")
rel("nor-odin","nor-vidar","PARENT_OF","Odin is the parent of Víðarr.","attested",["S2"])
rel("nor-odin","nor-vali","PARENT_OF","Odin is the parent of Váli.","attested",["S2"])
rel("nor-baldr","nor-hodr","SIBLING_OF","Baldr and Höðr are brothers.","attested",["S2"])
rel("nor-baldr","nor-nanna","PARTNER_OF","Baldr and Nanna are married.","attested",["S2"])
rel("nor-baldr","nor-forseti","PARENT_OF","Baldr (with Nanna) is the parent of Fosite.","attested",["S2"])
# Thor family
rel("nor-thor","nor-sif","PARTNER_OF","Thor and Sif are married.","attested",["S2"])
rel("nor-thor","nor-uthra","PARENT_OF","Thor (with Sif) is (in some accounts) the parent of Ullr.","variant",["S2"])
rel("nor-thor","nor-modi","PARENT_OF","Thor is the parent of Móði.","attested",["S2"])
# Vanir
rel("nor-nyrd","nor-freyr","PARENT_OF","Njord (with Skaði) is the parent of Freyr.","attested",["S2"])
rel("nor-nyrd","nor-freyja","PARENT_OF","Njord is the parent of Freyja.","attested",["S2"])
rel("nor-freyr","nor-freyja","SIBLING_OF","Freyr and Freyja are siblings.","attested",["S2"])
rel("nor-freyr","nor-gerd","PARTNER_OF","Freyr loves the giantess Gerðr (and gives his sword to win her).","attested",["S2"])
# Loki family
rel("nor-loomi","nor-anguela","PARTNER_OF","Loki and Angerboa are the monster-couple.","attested",["S2"])
rel("nor-loomi","nor-fenrir","PARENT_OF","Loki (with Angerboa) is the parent of Fenrir.","attested",["S2"])
rel("nor-loomi","nor-jormungandr","PARENT_OF","Loki is the parent of Jörmungandr.","attested",["S2"])
rel("nor-loomi","nor-hel","PARENT_OF","Loki is the parent of Hel.","attested",["S2"])
rel("nor-loomi","nor-sleipnir","PARENT_OF","Loki (in the form of a mare) is the parent of Sleipnir.","attested",["S2"])
rel("nor-anguela","nor-fenrir","PARENT_OF","Angerboa (with Loki) is the parent of Fenrir.","attested",["S2"])
rel("nor-anguela","nor-jormungandr","PARENT_OF","Angerboa is the parent of Jörmungandr.","attested",["S2"])
rel("nor-anguela","nor-hel","PARENT_OF","Angerboa is the parent of Hel.","attested",["S2"])
rel("nor-fenrir","nor-jormungandr","SIBLING_OF","Fenrir, Jörmungandr, and Hel are siblings.","attested",["S2"])
rel("nor-fenrir","nor-hel","SIBLING_OF","Fenrir and Hel are siblings.","attested",["S2"])
# Loki's deeds
rel("nor-loomi","nor-baldr","KILLED","Loki engineered Baldr's death (via the mistletoe and Höðr).","attested",["S2"],
    "Loki, disguised as an old woman, led Höðr to throw the mistletoe at Baldr.")
rel("nor-loomi","nor-hodr","ALLY_OF","Loki instigated Höðr to throw the mistletoe at Baldr.","attested",["S2"])
rel("nor-hodr","nor-baldr","KILLED","Höðr (at Loki's instigation) threw the mistletoe that killed Baldr.","attested",["S2"])
rel("nor-loomi","nor-sif","FOUGHT","Loki cut off Sif's golden hair (an act of mischief against Thor's wife).","attested",["S2"])
rel("nor-loomi","nor-thor","ENEMY_OF","Loki is ultimately an enemy of the gods, including Thor.","attested",["S2"])
# Tyr & Fenrir
rel("nor-tyr","nor-fenrir","FOUGHT","Týr placed his hand in Fenrir's mouth to bind him; the wolf bit off his hand.","attested",["S2"])
# Ragnarök
rel("nor-fenrir","nor-odin","KILLED","Fenrir will kill Odin at Ragnarök.","attested",["S1","S2"])
rel("nor-vidar","nor-fenrir","KILLED","Víðarr will avenge Odin by slaying Fenrir.","attested",["S1","S2"])
rel("nor-jormungandr","nor-thor","KILLED","Jörmungandr and Thor will kill each other at Ragnarök.","attested",["S1","S2"])
rel("nor-heimdall","nor-loomi","KILLED","Heimdall and Loki will kill each other at Ragnarök.","attested",["S1","S2"])
rel("nor-freyr","nor-surt","KILLED","Freyr will be slain by Surt at Ragnarök (having given away his sword).","attested",["S1","S2"])
rel("nor-vali","nor-hodr","KILLED","Váli will slay Höðr, the killer of Baldr.","attested",["S2"])
rel("nor-baldr","nor-nanna","PARTNER_OF","Baldr and Nanna are married.","attested",["S2"])
rel("nor-baldr","nor-forseti","PARENT_OF","Baldr (with Nanna) is the parent of Fosite.","attested",["S2"])
rel("nor-nanna","nor-forseti","PARENT_OF","Nanna is the parent of Fosite.","attested",["S2"])
rel("nor-thor","nor-magni","PARENT_OF","Thor (with Járnsaxa) is the parent of Magni.","attested",["S2"])
rel("nor-thor","nor-modi","PARENT_OF","Thor is the parent of Móði.","attested",["S2"])
rel("nor-jarnsaxa","nor-magni","PARENT_OF","Járnsaxa (with Thor) is the parent of Magni.","attested",["S2"])
rel("nor-jarnsaxa","nor-modi","PARENT_OF","Járnsaxa is the parent of Móði.","attested",["S2"])
rel("nor-magni","nor-modi","SIBLING_OF","Magni and Móði are brothers.","attested",["S2"])
rel("nor-freyr","nor-gerd","PARTNER_OF","Freyr loved Gerðr and gave his sword away to win her.","attested",["S2"])
rel("nor-freyr","nor-surt","KILLED","Freyr will be slain by Surt at Ragnarök.","attested",["S1","S2"])
rel("nor-surt","nor-freyr","KILLED","Surt will slay Freyr at Ragnarök.","attested",["S1","S2"])
rel("nor-nyrd","nor-ska","PARTNER_OF","Njord and Skaði were married (the marriage failed).","attested",["S2"])
rel("nor-thor","nor-hrungnir","KILLED","Thor slew the giant Hrungnir with Mjölnir.","attested",["S2"])
rel("nor-loomi","nor-sid","PARTNER_OF","Loki and Síd are (in one account) the parents of Sleipnir.","variant",["S2"])
rel("nor-sid","nor-sleipnir","PARENT_OF","Síd (with Loki) is (in one account) the parent of Sleipnir.","variant",["S2"])

dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, chapters, variants=None, unc=None):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs,
         "variants": variants or [], "uncertainty_notes": unc or "",
         "chapters": chapters}
    M.append(m)

myth("nor-creation","The Creation of the World from Ymir",
    "Between the ice of Niflheim and the fire of Muspelheim, in the void of Ginnungagap, the rime formed the giant Ymir and the cow Auðhumbla. From the salt Auðhumbla licked came the first god, Búri. His descendants — Odin, Vili, and Vé — killed Ymir and made the world from his body: his blood the seas, his flesh the earth, his bones the mountains, his skull the sky [S2].",
    ["nor-ymir","nor-aurdhumbla","nor-burir","nor-odin","nor-vili","nor-ve"], ["S1","S2"],
    [{"heading":"The Primordial Void","body":"Niflheim (ice), Muspelheim (fire), and the gap between [S2]."},
     {"heading":"Ymir and Auðhumbla","body":"The rime formed Ymir; the cow licked him free [S2]."},
     {"heading":"Búri","body":"The first god, from the salt [S2]."},
     {"heading":"The Three Brothers","body":"Odin, Vili, and Vé, sons of Borr and Bestla [S2]."},
     {"heading":"The World from Ymir","body":"The body of Ymir became the world [S2]."}],
    unc="")

myth("nor-runes","Odin and the Runes",
    "To win the runes, Odin hung himself on the world-tree Yggdrasil for nine nights, pierced by his own spear, until the runes revealed themselves to him [S1]. The runes are the source of wisdom and of the poetic art, and Odin is their patron [S1][S3].",
    ["nor-odin"], ["S1","S3"],
    [{"heading":"The Self-Sacrifice","body":"Odin hung on Yggdrasil for nine nights [S1]."},
     {"heading":"The Reveal","body":"The runes revealed themselves to him [S1]."}],
    unc="The 'nine nights' and the details of the self-sacrifice are from the Hávamál (Poetic Edda); the act is a symbolic, not a literal, one [S1].")

myth("nor-baldr-death","The Death of Baldr",
    "Baldr, the brightest of the gods, had dreams of his death. His mother Frigg extracted oaths from all things not to harm him — except the mistletoe. Loki, disguised as an old woman, learned of this and guided Baldr's blind brother Höðr to throw a mistletoe dart at Baldr, killing him [S2]. Baldr's death is the beginning of the end, setting the chain of events that leads to Ragnarök [S1][S2].",
    ["nor-baldr","nor-frigg","nor-loomi","nor-hodr"], ["S2"],
    [{"heading":"The Dreams","body":"Baldr dreamed of his death [S2]."},
     {"heading":"The Oaths","body":"Frigg bound all things — except the mistletoe [S2]."},
     {"heading":"Loki's Trick","body":"Loki, as an old woman, led Höðr to throw the mistletoe [S2]."},
     {"heading":"The Death","body":"Baldr was killed; his funeral was a great event [S2]."}],
    unc="The 'mistletoe' detail and the full sequence are from the Prose Edda; the Poetic Edda has fragments but not the full story [S1][S2].")

myth("nor-fenrir-binding","The Binding of Fenrir",
    "The gods, fearing the growing wolf Fenrir, tried to bind him. The first two bindings he broke, but the third — a magic ribbon made of six impossible things (Gleipnir) — held. Only Týr placed his hand in the wolf's mouth as a pledge; when the binding held, Fenrir bit off his hand [S2].",
    ["nor-fenrir","nor-tyr","nor-loomi"], ["S2"],
    [{"heading":"The Fear","body":"The gods feared Fenrir's strength [S2]."},
     {"heading":"The First Two Bonds","body":"Leadbond and Dromi — Fenrir broke both [S2]."},
     {"heading":"Gleipnir","body":"A ribbon of six impossible things [S2]."},
     {"heading":"Týr's Hand","body":"Only Týr placed his hand in the wolf's mouth; it was bitten off [S2]."}],
    unc="")

myth("nor-loki-children","Loki's Children",
    "Loki, in the form of a mare, mated with the stallion Svaðilfari and bore Sleipnir, the eight-legged horse of Odin. With the giantess Angerboa, Loki fathered the great monsters: the wolf Fenrir, the world-serpent Jörmungandr, and Hel, the ruler of the dead [S2].",
    ["nor-loomi","nor-anguela","nor-fenrir","nor-jormungandr","nor-hel","nor-sleipnir"], ["S2"],
    [{"heading":"Sleipnir","body":"Loki as a mare; the eight-legged horse [S2]."},
     {"heading":"The Monsters","body":"Fenrir, Jörmungandr, and Hel, with Angerboa [S2]."}],
    unc="")

myth("nor-ragnarok","Ragnarök (The Fate of the Gods)",
    "At the end of the world, a great winter (the Fimbulwinter) precedes Ragnarök. The bonds break: Fenrir breaks free, Jörmungandr rises from the sea, and the ship Naglfar (built from the nails of the dead) sails with the hosts of the dead. Heimdall sounds the horn Gjallarhorn; the gods ride to the field of Vígríðr. In the great battle, Odin is swallowed by Fenrir (avenged by Víðarr), Thor slays Jörmungandr but dies of his venom, Freyr is slain by Surt (having given away his sword), and Heimdall and Loki kill each other. Surt's fire destroys the world; from the ashes, a new world rises [S1][S2].",
    ["nor-odin","nor-thor","nor-freyr","nor-heimdall","nor-loomi","nor-fenrir","nor-jormungandr","nor-vidar"], ["S1","S2"],
    [{"heading":"The Fimbulwinter","body":"Three winters without a summer [S1][S2]."},
     {"heading":"The Breaking of Bonds","body":"Fenrir, Jörmungandr, and the dead are released [S1][S2]."},
     {"heading":"The Horn","body":"Heimdall sounds Gjallarhorn [S1][S2]."},
     {"heading":"The Battle","body":"The gods ride to Vígríðr; the great killing [S1][S2]."},
     {"heading":"The Fire","body":"Surt's fire destroys the world [S1][S2]."},
     {"heading":"The New World","body":"From the ashes, a new world rises [S1][S2]."}],
    unc="The details of Ragnarök are drawn mainly from the Völuspá (Poetic Edda) and the Gylfaginning (Prose Edda); the two sources agree on the broad outline but differ on some details [S1][S2].")

myth("nor-thor-geirdrud","Thor and the Giantess (Geirðröðr)",
    "Thor, disguised as a servant, went to the home of the giantess Geirðröðr to win her as a wife. He lifted the cat (which was actually the world-serpent Jörmungandr in disguise) and drank from a horn that was bottomless (the ocean). He was matched by the giant Utgarda-Pöki, who turned out to be the giant who had been deceiving him with illusions [S2].",
    ["nor-thor","nor-jormungandr"], ["S2"],
    [{"heading":"The Disguise","body":"Thor as a servant [S2]."},
     {"heading":"The Cat","body":"Lifting the cat (Jörmungandr in disguise) [S2]."},
     {"heading":"The Horn","body":"Drinking from the bottomless horn (the ocean) [S2]."},
     {"heading":"The Reveal","body":"Utgarda-Pöki's illusions revealed [S2]."}],
    unc="The 'cat is Jörmungandr' detail is one interpretation; the sources are not entirely explicit [S2].")

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
 "realms": [
  {"id":"nor-asgard","name":"Asgard","native_name":"Ásgarðr",
   "description":"The realm of the Æsir, home of the gods, with the hall of Odin (Valhalla) and the bridge Bifrost [S2].",
   "entities":["nor-odin","nor-frigg","nor-baldr","nor-hodr","nor-thor","nor-tyr","nor-heimdall","nor-vidar","nor-vali","nor-sif","nor-uthra"],
   "layout":{"x":0.5,"y":0.08,"r":0.13}},
  {"id":"nor-midgard","name":"Midgard","native_name":"Miðgarðr",
   "description":"The world of humans, encircled by the sea and the world-serpent Jörmungandr [S2].",
   "entities":["nor-jormungandr","nor-fenrir"],
   "layout":{"x":0.5,"y":0.5,"r":0.16}},
  {"id":"nor-vanaheim","name":"Vanaheim","native_name":"Vanaheimr",
   "description":"The realm of the Vanir (Njord, Freyr, Freyja), the second divine tribe [S2].",
   "entities":["nor-nyrd","nor-freyr","nor-freyja"],
   "layout":{"x":0.82,"y":0.28,"r":0.1}},
  {"id":"nor-jotunheim","name":"Jötunheim","native_name":"Jötunheimr",
   "description":"The realm of the frost-giants (jötnar), the enemies of the gods [S2].",
   "entities":["nor-bestla","nor-anguela"],
   "layout":{"x":0.18,"y":0.28,"r":0.1}},
  {"id":"nor-niflheim","name":"Niflheim","native_name":"Niflheimr",
   "description":"The realm of ice and mist, to the north; source of the primordial rime [S2].",
   "entities":["nor-niflheim"],
   "layout":{"x":0.5,"y":0.85,"r":0.08}},
  {"id":"nor-muspel","name":"Muspelheim","native_name":"Múspellsheimr",
   "description":"The realm of fire, to the south; its heat began the creation [S2].",
   "entities":["nor-muspel"],
   "layout":{"x":0.85,"y":0.85,"r":0.08}},
  {"id":"nor-helheim","name":"Hel (the realm of the dead)","native_name":"Hel",
   "description":"The realm of the dead, ruled by Hel; those who die of sickness or old age go here [S2].",
   "entities":["nor-hel"],
   "layout":{"x":0.15,"y":0.85,"r":0.08}},
  {"id":"nor-sea","name":"The Sea (around Midgard)","native_name":"",
   "description":"The sea that encircles Midgard, where Jörmungandr lies [S2].",
   "entities":["nor-jormungandr"],
   "layout":{"x":0.5,"y":0.68,"r":0.08}},
 ],
 "structure_notes": "The Nine Worlds are arranged around the world-tree Yggdrasil, which connects them. Asgard is at the top (the realm of the gods), Midgard (the human world) in the middle, and the realms of ice, fire, and the dead at the bottom and sides. The world-serpent Jörmungandr encircles Midgard in the sea [S2]. Yggdrasil is the axis that holds all the worlds together."
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
T = [
 {"id":"nor-t1","period":"Proto-Norse","date_range":"c. 500–800 CE","description":"The Norse gods are worshipped in Scandinavia; the earliest evidence is archaeological (runestones, offerings, place-names). The gods Odin, Thor, and others are named.","confidence":"attested (archaeological)"},
 {"id":"nor-t2","period":"Viking Age","date_range":"c. 793–1066 CE","description":"The Viking Age. Skaldic poetry names the gods. The great ship burials (Oseberg, c. 834; Gokstad) and the Gosforth Cross (c. 950–1000) show the gods in art.","confidence":"attested"},
 {"id":"nor-t3","period":"Conversion","date_range":"c. 1000–1100 CE","description":"Scandinavia converts to Christianity; the old gods are suppressed but survive in poetry and place-names.","confidence":"attested"},
 {"id":"nor-t4","period":"Snorri Sturluson","date_range":"c. 1220–1235 CE","description":"Snorri Sturluson writes the Prose Edda, preserving the myths in a Christian context. This is the main source for most Norse myth.","confidence":"attested (text)"},
 {"id":"nor-t5","period":"Poetic Edda","date_range":"c. 1270 CE (preserves 9th–11th c. poetry)","description":"The Poetic Edda (Codex Regius) is copied, preserving older oral poetry (the Hávamál, the Völuspá, and others).","confidence":"attested (text)"},
]
dump("timeline.json", T)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"id":"nor-u1","question":"Thor's parentage","versions":{"S2 (Prose Edda)":"Son of Odin and the giantess Járnsaxa (or the earth Jörd)","Other":"Some accounts give different mothers"},"how_we_present_it":"We note the variant; the core is that Thor is the son of Odin."},
 {"id":"nor-u2","question":"Heimdall's parentage","versions":{"S2":"Son of Odin and Angrboða (odd, since she is elsewhere Loki's wife)","Other":"Nine mothers"},"how_we_present_it":"Both variants stored; the sources are not consistent."},
 {"id":"nor-u3","question":"Ullr's parentage","versions":{"S2":"Son of Thor and Sif","Other":"Son of the giant Trúðr"},"how_we_present_it":"Both variants stored."},
 {"id":"nor-u4","question":"The Æsir vs. the Vanir","versions":{"S2":"Two separate divine tribes who later merge","Interpretive":"Some scholars see the 'two tribes' as a later literary construction"},"how_we_present_it":"We present the 'two tribes' as the sources present it, and note the scholarly interpretation separately."},
 {"id":"nor-u5","question":"The dating of the myths","versions":{"Archaeological":"The gods are worshipped from at least the 5th–8th c. CE (place-names, runestones)","Literary":"The main sources (Eddas) are 13th c. CE"},"how_we_present_it":"We make clear that the 13th-c. texts preserve older oral traditions; the worship is much older than the texts."},
 {"id":"nor-u6","question":"Loki's status","versions":{"S2":"'Blood-related' to the gods but not a true Æsir; a giant/trickster","Interpretive":"Some scholars see Loki as a 'chthonic' or 'liminal' figure"},"how_we_present_it":"We present Loki as the sources do (not a true Æsir) and note the interpretation."},
]
dump("uncertainties.json", U)

print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
