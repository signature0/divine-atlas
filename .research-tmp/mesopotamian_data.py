#!/usr/bin/env python3
# MESOPOTAMIAN dataset builder. Writes research/mesopotamian/*.json
# Covers Sumerian, Akkadian, Babylonian, and Assyrian traditions (they are
# layered, not separate: Sumerian first, then Akkadian/Babylonian assimilation).
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/mesopotamian"
os.makedirs(OUT, exist_ok=True)
C = "mesopotamian"

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
        "evidence_status": kw.get("evid", "attested"),
    }
    E.append(e)

def S(ref, name, date, typ, url=None):
    return {"type": typ, "name": name, "date": date, "ref": ref, "url": url}

SRC_ENUMA = S("S1","Enuma Elish (Babylonian Creation Epic)","Old Babylonian version c. 18th c. BCE; standard form c. 1100-1000 BCE","text","https://en.wikipedia.org/wiki/Enuma_Elish")
SRC_GILG = S("S2","Epic of Gilgamesh (Standard Babylonian version)","c. 1200 BCE","text","https://en.wikipedia.org/wiki/Epic_of_Gilgamesh")
SRC_ATRA = S("S3","Atrahasis","Old Babylonian c. 17th c. BCE","text","https://en.wikipedia.org/wiki/Atrahasis")
SRC_INANNA = S("S4","Inanna's Descent to the Underworld","c. 1900-1700 BCE (Sumerian)","text","https://en.wikipedia.org/wiki/Inanna%27s_Descent_to_the_Underworld")
SRC_ETC = S("S5","etcl.mca.edu — Electronic Text Corpus of cuneiform (transliterations + translations)","corpus (Sumerian/Akkadian texts)","corpus","https://etcsl.orinst.ox.ac.uk/")
SRC_MET = S("S6","Met Museum Mesopotamian collection (open access)","museum","museum","https://www.metmuseum.org/art/collection/search/FA2667E5-846E-4D48-9C0D-5B1E3B1A6D8B")

# ================= PRIMORDIAL =================
ent("mes-apas","An (the heavens)","An",["Anu","Anu (Akkadian)","An (Sumerian)"],"deity","male",
    ["the sky","the heavens","the supreme god (Sumerian period)","king of the gods"],
    symbols=["the star (the five-pointed star)","the horned crown (the crown of kingship)","the bull"],
    animals=["the bull"],
    children=["mes-enlil","mes-enki"],
    partners=["mes-antum"],
    realms=["mes-sky"],
    myths=["mes-enuma","mes-creation"],
    evid="attested",
    short="The sky god, the supreme deity of the Sumerian pantheon; 'An' means 'sky/heaven'. In the Akkadian period he is called Anu. Father of Enlil and (in some accounts) Enki.",
    long="'An' (Sumerian; 'Anu' in Akkadian) is the sky god, the supreme deity of the Sumerian pantheon [S5][S6]. 'An' means 'sky' or 'heaven' — the god is the sky itself, the highest of the three cosmic regions (heaven, earth, underworld) [S5]. In the Sumerian period, An was the head of the pantheon; in the Akkadian and Babylonian periods, his supremacy was increasingly ceded to Enlil (and later Marduk) [S1][S6]. An's symbol is the star (the five-pointed star) and his animal is the bull [S5][S6]. An's consort is Antu (Sumerian; 'Anatum' in some accounts) [S5]. An is the father of Enlil (the air/storm god) and, in some accounts, Enki (the freshwater god) [S5]. The 'An' is also a title: the 'An' is the divine, the 'godhead' itself [S5].",
    facts=["The sky god, the supreme deity of the Sumerian pantheon [S5].",
           "'An' means 'sky/heaven' — the god is the sky itself [S5].",
           "His symbol is the star; his animal is the bull [S5][S6].",
           "Father of Enlil (and, in some accounts, Enki) [S5]."],
    unc=["An's supremacy 'declines' over time: Sumerian (supreme) → Akkadian (Enlil rises) → Babylonian (Marduk rises). This is a political/theological development, not a mythic event [S1][S6]."],
    srcs=[SRC_ENUMA, SRC_ETC, SRC_MET],
    art=["mes-art-anu-bull"], hero="mes-art-anu-bull")

ent("mes-ki","Ki (the earth)","Ki",["Ki","Kı"],"primordial","female",
    ["the earth","the ground","the lower world (in some accounts)"],
    partners=["mes-apas"],
    children=["mes-enlil","mes-enki"],
    realms=["mes-earth"],
    evid="attested",
    short="The earth goddess, the consort of An (the sky); the 'mother' of the world. In Sumerian cosmology, An (heaven) and Ki (earth) are the first pair.",
    long="'Ki' is the earth goddess, the consort of An (the sky) [S5]. In Sumerian cosmology, An (heaven) and Ki (earth) are the first pair — the 'parents' of the world [S5]. Ki is the 'mother' of the world, the ground, the earth [S5]. The name 'Ki' is also the root of 'Kish' (a city) and of the 'ki' in 'kigurra' (a ritual object) [S5]. Ki is less well-attested as a deity than An: she is the earth-principle, the 'mother' of the world [S5].",
    facts=["The earth goddess, the consort of An [S5].",
           "The 'mother' of the world in Sumerian cosmology [S5]."],
    unc=["Ki is less well-attested as a distinct deity than An; she is the earth-principle [S5]."],
    srcs=[SRC_ETC],
    art=[])

ent("mes-abzu","Apsu (the primeval freshwater)","Apsu",["Apsu","Abzu","the fresh-water abyss"],"primordial","male",
    ["the primeval freshwater","the deep","the sweet water beneath the earth"],
    enemies=["mes-enki"],
    realms=["mes-underworld"],
    evid="attested",
    short="The primeval freshwater, the 'deep' beneath the earth; in the Atrahasis and Enuma Elish, Apsu is the god of the fresh water who is slain (in Atrahasis) or overthrown (in Enuma Elish).",
    long="'Apsu' (also 'Abzu') is the primeval freshwater, the 'deep' beneath the earth — the sweet water that underlies the world [S3][S5]. In Sumerian cosmology, Apsu (the fresh water) and Tiamat (the salt water) are the two primeval waters [S3][S5]. In the Atrahasis, Apsu (the god of the fresh water) is slain by Enki (and the gods) because his noise (the noise of humanity) disturbs his rest [S3]. In the Enuma Elish, Apsu's role is taken by Apsu (the fresh water) who is slain by Ea (Enki's Akkadian name) [S1]. Apsu is the 'deep', the primeval fresh water, the source of life [S3][S5].",
    facts=["The primeval freshwater, the 'deep' beneath the earth [S3][S5].",
           "Slain in the Atrahasis (by Enki) and the Enuma Elish (by Ea) [S1][S3].",
           "One of the two primeval waters (with Tiamat) [S3][S5]."],
    unc=["Apsu's 'slaying' in the Atrahasis is the creation-of-humanity story: humanity is made from Apsu's flesh/blood to relieve the gods of their labor [S3]."],
    srcs=[SRC_ENUMA, SRC_ATRA, SRC_ETC],
    art=[])

ent("mes-tiamat","Tiamat","Tiamat",["Tiamat","Tiamtu"],"primordial","female",
    ["the primeval saltwater","the salt sea","chaos (the primordial state)"],
    enemies=["mes-marduk"],
    partners=["mes-kingu"],
    realms=["mes-underworld"],
    myths=["mes-enuma"],
    evid="attested",
    short="The primeval saltwater, the 'salt sea', the embodiment of chaos; in the Enuma Elish she is the great adversary of Marduk, whose slain body is used to create the world.",
    long="'Tiamat' is the primeval saltwater, the 'salt sea', the embodiment of the primordial state [S1][S5]. In Sumerian cosmology, Tiamat (the salt water) and Apsu (the fresh water) are the two primeval waters [S3][S5]. In the Enuma Elish, Tiamat is the great adversary of Marduk: she raises an army of monsters (led by Kingu) to fight Marduk, and is slain by Marduk, who splits her body in two to make the sky (the upper half) and the earth (the lower half) [S1]. Tiamat is the embodiment of chaos, the 'salt sea', the primordial state from which the ordered world emerges [S1][S5].",
    facts=["The primeval saltwater, the embodiment of chaos [S1][S5].",
           "The great adversary of Marduk in the Enuma Elish [S1].",
           "Her slain body is split to make the sky and the earth [S1]."],
    unc=["Tiamat's 'chaos' role is a later (Babylonian) interpretation; in earlier (Sumerian) texts she is simply the salt-water principle [S5]."],
    srcs=[SRC_ENUMA, SRC_ETC],
    art=["mes-art-tiamat","mes-art-enuma-tablet"], hero="mes-art-tiamat")

ent("mes-kingu","Kingu","Kingu",["Kingu"],"deity","male",
    ["the 'crown' (his title: he holds the 'Tablet of Destinies')","the general of Tiamat's army"],
    weapons=["the mace (in some accounts)"],
    partners=["mes-tiamat"],
    enemies=["mes-marduk"],
    myths=["mes-enuma"],
    evid="attested",
    short="The general of Tiamat's army in the Enuma Elish; he holds the 'Tablet of Destinies' (the symbol of cosmic authority); he is slain by Marduk.",
    long="Kingu is the general of Tiamat's army in the Enuma Elish [S1]. He holds the 'Tablet of Destinies' (the 'me' of kingship, the symbol of cosmic authority) on Tiamat's behalf [S1]. Marduk slays Kingu and takes the Tablet of Destinies; from Kingu's blood, Marduk creates humanity (in the Enuma Elish) [S1]. Kingu is the 'crown' (his title: he holds the 'Tablet of Destinies') [S1].",
    facts=["The general of Tiamat's army in the Enuma Elish [S1].",
           "Holds the 'Tablet of Destinies' [S1].",
           "Slain by Marduk; his blood is used to create humanity [S1]."],
    unc=[],
    srcs=[SRC_ENUMA],
    art=[])

# ================= SECOND GENERATION (Sumerian) =================
ent("mes-enlil","Enlil","Enlil",["Enlil","Ellil"],"deity","male",
    ["the air","the wind","the storm","king of the gods (Akkadian/Babylonian period)","the 'breath' of the world"],
    symbols=["the horned crown","the aegis (the 'mullu' — a composite creature)","the bull"],
    animals=["the bull","the lion"],
    weapons=["the mace"],
    sacred_objects=["the horned crown (the symbol of kingship)"],
    parents=["mes-apas","mes-ki"],
    siblings=["mes-enki"],
    partners=["mes-ninlil"],
    children=["mes-nanna","mes-ninhursag","mes-nergal"],
    places=["Nippur (his great temple)"],
    realms=["mes-sky","mes-earth"],
    myths=["mes-creation","mes-flood","mes-enlil-erosion"],
    evid="attested",
    short="The 'air/wind/storm' god, the 'breath' of the world; in the Akkadian and Babylonian periods he is the king of the gods. His great temple was at Nippur. He is the 'decider' — he makes the fates (the 'me').",
    long="'Enlil' (Akkadian 'Ellil') is the 'air/wind/storm' god, the 'breath' of the world — his name means 'the breath of Enlil' (the wind that gives life) [S5][S6]. In the Sumerian period, Enlil was one of the great gods; in the Akkadian and Babylonian periods, he became the king of the gods (the 'Anum' — the supreme deity) [S1][S6]. Enlil's great temple was at Nippur (the 'Ekur' — the 'mountain house') [S5][S6]. Enlil is the 'decider': he makes the fates (the 'me' — the divine decrees that order the world) [S5]. Enlil's consort is Ninlil [S5]. Enlil's children include Nanna (the moon god), Ninhursag (the earth-mother, in some accounts), and Nergal (the underworld god, in some accounts) [S5]. Enlil is the god who decrees the flood (in the Atrahasis and the Gilgamesh flood-story) [S2][S3].",
    facts=["The 'air/wind/storm' god, the 'breath' of the world [S5].",
           "King of the gods in the Akkadian/Babylonian period [S1][S6].",
           "His great temple was at Nippur (the 'Ekur') [S5][S6].",
           "The 'decider' — he makes the fates (the 'me') [S5].",
           "Decrees the flood (Atrahasis, Gilgamesh) [S2][S3]."],
    unc=["Enlil's 'supremacy' is period-specific: Sumerian (one of the great gods) → Akkadian/Babylonian (king of the gods) → Late Babylonian (Marduk rises) [S1][S6]."],
    srcs=[SRC_ENUMA, SRC_GILG, SRC_ATRA, SRC_ETC, SRC_MET],
    art=["mes-art-enlil"], hero="mes-art-enlil")

ent("mes-enki","Enki (Ea)","Enki",["Ea (Akkadian)","Enki (Sumerian)"],"deity","male",
    ["the freshwater","wisdom","magic","the 'me' (the divine decrees)","crafts","the 'apku' (the sage)"],
    symbols=["the fresh water","the 'me' (the divine decrees)","the goat-fish (the 'adapa' fish, in some accounts)"],
    animals=["the goat-fish"],
    sacred_objects=["the 'me' (the divine decrees)"],
    places=["Eridu (his great temple)"],
    enemies=["mes-abzu"],
    allies=["mes-utu"],
    children=["mes-nabu"],
    myths=["mes-enuma","mes-flood","mes-creation"],
    evid="attested",
    short="The freshwater god of wisdom, magic, and the 'me' (the divine decrees); his great temple was at Eridu (the oldest city in Sumerian tradition). In the Atrahasis and the Gilgamesh flood-story, he saves the flood-hero against Enlil's will.",
    long="'Enki' (Sumerian; 'Ea' in Akkadian) is the freshwater god of wisdom, magic, and the 'me' (the divine decrees) [S5][S6]. His great temple was at Eridu (the 'Aabzu' — the 'house of the deep'), the oldest city in Sumerian tradition [S5][S6]. Enki is the god of wisdom, magic, and the 'me' — the divine decrees that order the world [S5]. He is the 'apku' (the sage), the patron of the scribes and the craftsmen [S5]. In the Atrahasis and the Gilgamesh flood-story, Enki (Ea) saves the flood-hero (Atrahasis/Utnapishtim) against Enlil's will, by whispering to the hero to build a boat [S2][S3]. Enki is the father of Nabu (the god of writing) [S5]. Enki's 'slanding' of Apsu (in the Atrahasis) is the creation-of-humanity story [S3].",
    facts=["The freshwater god of wisdom, magic, and the 'me' [S5].",
           "His great temple was at Eridu (the 'Aabzu') [S5][S6].",
           "Saves the flood-hero against Enlil's will (Atrahasis, Gilgamesh) [S2][S3].",
           "The 'apku' (the sage), patron of the scribes [S5]."],
    unc=["Enki's 'wisdom' role is central; his relationship to the 'me' (the divine decrees) is complex: he is both a holder and a distributor of the 'me' [S5]."],
    srcs=[SRC_ENUMA, SRC_GILG, SRC_ATRA, SRC_ETC, SRC_MET],
    art=["mes-art-enki"], hero="mes-art-enki")

ent("mes-ninlil","Ninlil","Ninlil",["Ninlil","Ningal"],"deity","female",
    ["the moon (as consort of Enlil)","the 'light' of Enlil"],
    parents=[],
    partners=["mes-enlil"],
    children=["mes-nanna"],
    evid="attested",
    short="The consort of Enlil; in some accounts she is the moon-goddess (or the 'light' of Enlil). She is the mother of Nanna (the moon god).",
    long="Ninlil is the consort of Enlil [S5]. In some accounts, she is the moon-goddess (or the 'light' of Enlil) [S5]. She is the mother of Nanna (the moon god) [S5]. Ninlil's myth: in one Sumerian text, Enlil seduces Ninlil (while she is in the underworld), and she bears Nanna (the moon) there [S5]. Ninlil is the 'light' of Enlil — the moonlight that follows the storm-god [S5].",
    facts=["The consort of Enlil [S5].",
           "The mother of Nanna (the moon god) [S5].",
           "In one myth, Enlil seduces her in the underworld [S5]."],
    unc=["Ninlil's 'moon' role is debated: in some accounts she is the moon-goddess, in others she is simply Enlil's consort [S5]."],
    srcs=[SRC_ETC],
    art=[])

# ================= THIRD GENERATION =================
ent("mes-nanna","Nanna (Sin)","Nanna",["Sin (Akkadian)","Nanna (Sumerian)"],"deity","male",
    ["the moon","time","the calendar","fate (the moon-god decrees fates)"],
    symbols=["the crescent moon","the disc"],
    parents=["mes-enlil","mes-ninlil"],
    siblings=[],
    partners=["mes-ninagal"],
    children=["mes-utu","mes-inanna"],
    places=["Ur (his great temple)"],
    realms=["mes-sky"],
    evid="attested",
    short="The moon god, the god of time, the calendar, and fate; his great temple was at Ur. In Sumerian tradition he is the son of Enlil; in Akkadian he is called Sin. Father of Utu (Shamash) and Inanna (Ishtar).",
    long="'Nanna' (Sumerian; 'Sin' in Akkadian) is the moon god, the god of time, the calendar, and fate [S5][S6]. His great temple was at Ur (the 'Ehursag') [S5][S6]. In Sumerian tradition, Nanna is the son of Enlil (and Ninlil) [S5]. In Akkadian, he is called Sin [S5]. Nanna is the father of Utu (the sun god, Akkadian 'Shamash') and Inanna (the love/war goddess, Akkadian 'Ishtar') [S5]. The moon-god decrees fates (the 'me') — the moon's phases are the measure of time [S5]. Nanna's 'time' role makes him the god of the calendar and of the measurement of the months [S5].",
    facts=["The moon god, the god of time, the calendar, and fate [S5].",
           "His great temple was at Ur (the 'Ehursag') [S5][S6].",
           "Son of Enlil (and Ninlil) [S5].",
           "Father of Utu (Shamash) and Inanna (Ishtar) [S5]."],
    unc=["Nanna's parentage varies: in some texts he is the son of Enlil, in others he is a 'self-existing' god [S5]."],
    srcs=[SRC_ETC, SRC_MET],
    art=["mes-art-sin"], hero="mes-art-sin")

ent("mes-utu","Utu (Shamash)","Utu",["Shamash (Akkadian)","Utu (Sumerian)"],"deity","male",
    ["the sun","justice","the 'light' that reveals the truth","the 'day'"],
    symbols=["the sun-disc","the 'saw' (the sun's disc as a saw that cuts through the night)"],
    parents=["mes-nanna"],
    siblings=["mes-inanna"],
    realms=["mes-sky","mes-underworld"],
    allies=["mes-enki"],
    evid="attested",
    art=["mes-art-shamash-seal"], hero="mes-art-shamash-seal",
    short="The sun god, the god of justice and the 'light' that reveals the truth; in Akkadian he is called Shamash. The sun-god travels through the underworld by night (the 'journey of the sun through the Duat' equivalent).",
    long="'Utu' (Sumerian; 'Shamash' in Akkadian) is the sun god, the god of justice and the 'light' that reveals the truth [S5][S6]. The sun-god travels across the sky by day and through the underworld by night (the 'journey of the sun') [S5]. Utu is the god of justice: he 'sees' all, and his light reveals the truth [S5]. In the 'Utnapishtim' flood-story and other texts, Utu is a 'judge' who sees the wickedness of humanity [S2]. Utu is the brother of Inanna (Ishtar) [S5]. Utu's 'justice' role makes him the patron of the oaths and the courts [S5].",
    facts=["The sun god, the god of justice [S5].",
           "Travels through the underworld by night (the 'journey of the sun') [S5].",
           "The 'light' that reveals the truth [S5].",
           "The brother of Inanna (Ishtar) [S5]."],
    unc=["Utu's 'justice' role is central; his 'sun-journey' (through the underworld by night) is a distinct mythic cycle [S5]."],
    srcs=[SRC_GILG, SRC_ETC, SRC_MET])

ent("mes-inanna","Inanna (Ishtar)","Inanna",["Ishtar (Akkadian)","Inanna (Sumerian)"],"deity","female",
    ["love","sexuality","war","fertility","the 'queen of heaven'","the morning/evening star (Venus)"],
    symbols=["the eight-pointed star (Venus)","the lion","the date-palm"],
    animals=["the lion","the date-palm"],
    parents=["mes-nanna"],
    siblings=["mes-utu"],
    places=["Uruk (her great temple)"],
    realms=["mes-sky","mes-underworld"],
    enemies=["mes-erishkigal"],
    myths=["mes-inanna-descent","mes-inanna-erishkigal"],
    evid="attested",
    short="The great goddess of love, sexuality, war, and fertility; 'queen of heaven'; the morning/evening star (Venus); her great temple was at Uruk. In Akkadian she is Ishtar. She descends to the underworld and is restored (the 'Inanna's Descent' myth).",
    long="'Inanna' (Sumerian; 'Ishtar' in Akkadian) is the great goddess of love, sexuality, war, and fertility [S4][S5][S6]. She is the 'queen of heaven', the morning/evening star (Venus) [S5]. Her great temple was at Uruk (the 'Eanna') [S5][S6]. Inanna is the most complex of the Mesopotamian deities: she is both the goddess of love and the goddess of war, both the life-giver and the death-bringer [S4][S5]. The great myth of 'Inanna's Descent to the Underworld': Inanna descends to the underworld to attend the funeral of her sister Ereshkigal (the underworld-goddess), is stripped of her powers at the seven gates, is killed, and is restored by Enki (who sends a being to bring her back) [S4][S5]. The 'Descent' is a myth of death and resurrection, and is one of the oldest attested 'descent-and-return' myths [S4][S5]. Inanna's 'Venus' role (the morning/evening star) makes her the goddess of the 'star' (the eight-pointed star is her symbol) [S5].",
    facts=["The great goddess of love, sexuality, war, and fertility [S4][S5].",
           "The 'queen of heaven', the morning/evening star (Venus) [S5].",
           "Her great temple was at Uruk (the 'Eanna') [S5][S6].",
           "The 'Inanna's Descent' myth (death and resurrection) [S4][S5].",
           "The eight-pointed star is her symbol [S5]."],
    unc=["Inanna's 'love' and 'war' roles are not separate: she is a single, complex goddess who embodies both [S4][S5].",
         "The 'Descent' myth has multiple versions (Sumerian c. 1900-1700 BCE; later Akkadian versions); the details vary [S4]."],
    srcs=[SRC_INANNA, SRC_GILG, SRC_ETC, SRC_MET],
    art=["mes-art-inanna-star","mes-art-ishtar-gate","mes-art-ishtar-hymn"], hero="mes-art-inanna-star")

# ================= UNDERWORLD =================
ent("mes-erishkigal","Ereshkigal","Ereshkigal",["Nergal's consort (in some accounts)"],"deity","female",
    ["the underworld","the queen of the dead","the 'dark'"],
    partners=["mes-erishkigal-consort"],
    enemies=["mes-inanna"],
    realms=["mes-underworld"],
    myths=["mes-inanna-descent"],
    evid="attested",
    short="The queen of the underworld, the 'dark' goddess of the dead; Inanna's sister (in some accounts) or adversary. In the 'Descent' myth, Inanna attends her funeral (or is her guest) and is killed there.",
    long="'Ereshkigal' is the queen of the underworld, the 'dark' goddess of the dead [S4][S5]. She is the lord of the 'irigal' (the underworld) [S5]. In the 'Inanna's Descent' myth, Inanna descends to the underworld to attend Ereshkigal's funeral (or is her guest), and is killed there [S4][S5]. Ereshkigal is Inanna's sister (in some accounts) or her adversary [S4][S5]. Ereshkigal's consort is Nergal (the underworld-god, in some accounts) [S5]. Ereshkigal is the 'dark' counterpart of Inanna (the 'light' goddess) [S4][S5].",
    facts=["The queen of the underworld, the 'dark' goddess of the dead [S4][S5].",
           "Inanna's sister (in some accounts) or adversary [S4][S5].",
           "The 'Descent' myth: Inanna is killed at her funeral [S4][S5]."],
    unc=["Ereshkigal's relationship to Inanna (sister vs. adversary) varies by version [S4][S5]."],
    srcs=[SRC_INANNA, SRC_ETC],
    art=["mes-art-ereshkigal-burney"], hero="mes-art-ereshkigal-burney")

ent("mes-nergal","Nergal","Nergal",["Nergal"],"deity","male",
    ["the underworld","the plague","the 'lord of the netherworld'","war (in some accounts)"],
    symbols=["the 'lion' (in some accounts)","the 'snake'"],
    animals=["the lion","the snake"],
    partners=["mes-erishkigal"],
    realms=["mes-underworld"],
    evid="attested",
    short="The underworld god, the 'lord of the netherworld', the god of the plague; in some accounts he is Ereshkigal's consort. In the 'Nergal and Ereshkigal' myth, he 'rapes' (or marries) Ereshkigal and becomes her consort.",
    long="'Nergal' is the underworld god, the 'lord of the netherworld', the god of the plague [S5]. In some accounts, he is Ereshkigal's consort [S5]. The 'Nergal and Ereshkigal' myth: Nergal 'rapes' (or marries) Ereshkigal, and becomes her consort and the lord of the underworld [S5]. Nergal is the god of the plague and the 'dark' power of the underworld [S5]. He is also a war-god (in some accounts) [S5]. Nergal's 'plague' role makes him a feared deity — his 'dark' power is the power of death and disease [S5].",
    facts=["The underworld god, the 'lord of the netherworld' [S5].",
           "The god of the plague [S5].",
           "Ereshkigal's consort (in the 'Nergal and Ereshkigal' myth) [S5]."],
    unc=["Nergal's 'raping' of Ereshkigal is a 'marriage' myth: the underworld-god and the underworld-goddess become a pair [S5]."],
    srcs=[SRC_ETC],
    art=[])

# ================= MARDUK / BABYLON =================
ent("mes-marduk","Marduk","Marduk",["Marduk"],"deity","male",
    ["the 'storm' (in the Babylonian period)","king of the gods (Babylonian period)","creation","the 'flood' (in the Enuma Elish)"],
    symbols=["the 'mullu' (a composite creature: the bull-lion-eagle-snake)","the 'Tablet of Destinies'","the bow"],
    animals=["the 'mullu' (the composite creature)"],
    weapons=["the bow","the mace","the net","the 'wind' (the 'rakasu' winds)"],
    sacred_objects=["the 'Tablet of Destinies'"],
    parents=["mes-enki"],
    children=[],
    enemies=["mes-tiamat","mes-kingu"],
    places=["Babylon (his great temple: the Esagila)"],
    realms=["mes-sky"],
    myths=["mes-enuma"],
    evid="attested",
    short="The Babylonian supreme god, the 'storm' god, the king of the gods in the Babylonian period; in the Enuma Elish he slays Tiamat and creates the world from her body. His great temple was at Babylon (the Esagila).",
    long="'Marduk' is the Babylonian supreme god, the 'storm' god, the king of the gods in the Babylonian period [S1][S6]. In the Enuma Elish, Marduk is chosen by the gods to fight Tiamat; he slays her with his bow, net, and 'rakasu' winds, and splits her body in two to make the sky (the upper half) and the earth (the lower half) [S1]. From Kingu's blood (Tiamat's general), Marduk creates humanity [S1]. Marduk takes the 'Tablet of Destinies' (the symbol of cosmic authority) from Kingu [S1]. Marduk's great temple was at Babylon (the Esagila) [S6]. Marduk's 'supremacy' is a political/theological development: as Babylon rose to power (Old Babylonian period, c. 2000-1600 BCE), Marduk rose to be the king of the gods [S1][S6]. The Enuma Elish (the 'New Year' festival text) is the great myth of Marduk's supremacy [S1].",
    facts=["The Babylonian supreme god, the 'storm' god [S1][S6].",
           "In the Enuma Elish, he slays Tiamat and creates the world [S1].",
           "Takes the 'Tablet of Destinies' from Kingu [S1].",
           "His great temple was at Babylon (the Esagila) [S6].",
           "His 'supremacy' is a political/theological development (Babylonian rise) [S1][S6]."],
    unc=["Marduk's 'supremacy' is period-specific: Old Babylonian (rises) → Neo-Babylonian (supreme) → Achaemenid/Persian (declines) [S1][S6]."],
    srcs=[SRC_ENUMA, SRC_MET],
    art=["mes-art-marduk"], hero="mes-art-marduk")

# ---- Referenced figures (lightweight) ----
ent("mes-antum","Antu (Anatum)","Antu",["Anatum","Antu"],"deity","female",
    ["the 'consort of An'","the 'sky' (as consort)"],
    partners=["mes-apas"],
    evid="attested",
    short="The consort of An (the sky god); the 'sky' as a female principle (in some accounts).",
    long="'Antu' (also 'Anatum') is the consort of An (the sky god) [S5]. She is the 'sky' as a female principle (in some accounts) [S5]. Antu is less well-attested as a distinct deity than An; she is the 'consort of the sky' [S5].",
    facts=["The consort of An (the sky god) [S5]."],
    unc=["Antu is less well-attested as a distinct deity than An [S5]."],
    srcs=[SRC_ETC],
    art=[])

ent("mes-ninhursag","Ninhursag","Ninhursag",["Ninhursag","Nin-hursag"],"deity","female",
    ["the earth","the 'mother' of the gods","the 'mistress of the mountains'"],
    evid="attested",
    short="The 'earth-mother', the 'mistress of the mountains'; in some accounts a consort of Enlil or a mother-figure. Her name means 'Lady of the Mountain'.",
    long="'Ninhursag' (also 'Nin-hursag') is the 'earth-mother', the 'mistress of the mountains' — her name means 'Lady of the Mountain' [S5]. She is a mother-figure in the Sumerian pantheon, the 'mother' of the gods (in some accounts) [S5]. Ninhursag is the 'earth' as a female principle [S5]. She is less well-attested as a distinct deity than the great gods; she is the 'earth-mother' principle [S5].",
    facts=["The 'earth-mother', the 'mistress of the mountains' [S5].",
           "A mother-figure in the Sumerian pantheon [S5]."],
    unc=["Ninhursag is less well-attested as a distinct deity than the great gods [S5]."],
    srcs=[SRC_ETC],
    art=[])

ent("mes-erishkigal-consort","Nergal (Ereshkigal's consort)","Nergal",[],"deity","male",
    ["the underworld (as Ereshkigal's consort)"],
    partners=["mes-erishkigal"],
    evid="attested",
    short="Nergal as Ereshkigal's consort (the 'Nergal and Ereshkigal' marriage myth).",
    long="Nergal as Ereshkigal's consort: in the 'Nergal and Ereshkigal' myth, Nergal 'rapes' (or marries) Ereshkigal and becomes her consort and the lord of the underworld [S5]. This is a 'marriage' myth: the underworld-god and the underworld-goddess become a pair [S5].",
    facts=["Nergal as Ereshkigal's consort [S5]."],
    unc=[],
    srcs=[SRC_ETC],
    art=[])

ent("mes-ninagal","Ningal","Ningal",["Ningal"],"deity","female",
    ["the moon (as consort of Nanna)","the 'light' of the moon"],
    partners=["mes-nanna"],
    evid="attested",
    short="The consort of Nanna (the moon god); the 'light' of the moon.",
    long="'Ningal' is the consort of Nanna (the moon god) [S5]. She is the 'light' of the moon [S5]. Ningal is less well-attested as a distinct deity than Nanna; she is the 'consort of the moon' [S5].",
    facts=["The consort of Nanna (the moon god) [S5]."],
    unc=["Ningal is less well-attested as a distinct deity than Nanna [S5]."],
    srcs=[SRC_ETC],
    art=[])


ent("mes-nabu","Nabu","Nabu",["Nabu"],"deity","male",
    ["writing","wisdom","the 'sage'","the 'scribes'"],
    parents=["mes-enki"],
    evid="attested",
    short="The god of writing and wisdom, the patron of the scribes; son of Enki (Ea).",
    long="'Nabu' is the god of writing and wisdom, the patron of the scribes [S5]. He is the son of Enki (Ea) [S5]. Nabu is the 'sage' (the 'apku') and the patron of the scribal arts [S5]. His great temple was at Nippur (the 'Ezida') [S5].",
    facts=["The god of writing and wisdom [S5].",
           "Son of Enki (Ea) [S5].",
           "The patron of the scribes [S5]."],
    unc=[],
    srcs=[SRC_ETC],
    art=[])

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="attested",srcs=["S5"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# Primordial
rel("mes-apas","mes-ki","PARTNER_OF","An (the sky) and Ki (the earth) are the first pair (the 'parents' of the world).","attested",["S5"],
    "An and Ki are the 'parents' of the world in Sumerian cosmology [S5].")
rel("mes-apas","mes-enlil","PARENT_OF","An (with Ki) is the parent of Enlil.","attested",["S5"])
rel("mes-apas","mes-enki","PARENT_OF","An (with Ki) is the parent of Enki (in some accounts).","attested",["S5"])
rel("mes-ki","mes-enlil","PARENT_OF","Ki (with An) is the parent of Enlil.","attested",["S5"])
rel("mes-abzu","mes-tiamat","PARTNER_OF","Apsu (the fresh water) and Tiamat (the salt water) are the two primeval waters (a 'pair').","attested",["S3","S5"],
    "Apsu and Tiamat are the two primeval waters in Sumerian cosmology [S3][S5].")
rel("mes-enki","mes-abzu","KILLED","Enki slays Apsu (in the Atrahasis) — the creation-of-humanity story.","attested",["S3"],
    "Enki slays Apsu because his noise disturbs his rest; humanity is made from Apsu's flesh [S3].")
rel("mes-enki","mes-enlil","ALLY_OF","Enki allies with the gods against Apsu (in the Atrahasis).","attested",["S3"])
rel("mes-enki","mes-marduk","PARENT_OF","Enki (Ea) is the father of Marduk (in the Enuma Elish).","attested",["S1"])
rel("mes-tiamat","mes-kingu","PARTNER_OF","Tiamat and Kingu are a 'pair' (Kingu is her general and consort).","attested",["S1"])
rel("mes-marduk","mes-tiamat","KILLED","Marduk slays Tiamat (in the Enuma Elish).","attested",["S1"],
    "Marduk slays Tiamat with his bow, net, and 'rakasu' winds [S1].")
rel("mes-marduk","mes-tiamat","CREATED","Marduk splits Tiamat's body in two to make the sky (upper half) and the earth (lower half).","attested",["S1"])
rel("mes-marduk","mes-kingu","KILLED","Marduk slays Kingu (in the Enuma Elish).","attested",["S1"])
rel("mes-marduk","mes-kingu","SUCCESSOR_OF","Marduk takes the 'Tablet of Destinies' from Kingu (the symbol of cosmic authority).","attested",["S1"])
# Second generation
rel("mes-enlil","mes-enki","SIBLING_OF","Enlil and Enki are siblings (both sons of An and Ki, in some accounts).","attested",["S5"])
rel("mes-enlil","mes-ninlil","PARTNER_OF","Enlil and Ninlil are a 'pair'.","attested",["S5"])
rel("mes-enlil","mes-nanna","PARENT_OF","Enlil (with Ninlil) is the parent of Nanna (the moon god).","attested",["S5"])
rel("mes-ninlil","mes-nanna","PARENT_OF","Ninlil (with Enlil) is the parent of Nanna.","attested",["S5"])
rel("mes-enlil","mes-ninlil","CREATED","(Mythic) In one text, Enlil seduces Ninlil (in the underworld) and she bears Nanna there.","attested",["S5"])
# Third generation
rel("mes-nanna","mes-utu","PARENT_OF","Nanna (with Ningal) is the parent of Utu (the sun god).","attested",["S5"])
rel("mes-nanna","mes-inanna","PARENT_OF","Nanna (with Ningal) is the parent of Inanna (the love/war goddess).","attested",["S5"])
rel("mes-ninagal","mes-utu","PARENT_OF","Ningal (with Nanna) is the parent of Utu.","attested",["S5"])
rel("mes-ninagal","mes-inanna","PARENT_OF","Ningal (with Nanna) is the parent of Inanna.","attested",["S5"])
rel("mes-utu","mes-inanna","SIBLING_OF","Utu and Inanna are siblings (both children of Nanna).","attested",["S5"])
rel("mes-nanna","mes-ninagal","PARTNER_OF","Nanna and Ningal are a 'pair'.","attested",["S5"])
rel("mes-enki","mes-nabu","PARENT_OF","Enki is the father of Nabu (the god of writing).","attested",["S5"])
# Underworld
rel("mes-inanna","mes-erishkigal","SIBLING_OF","Inanna and Ereshkigal are sisters (in some accounts).","attested",["S4","S5"],
    "In some accounts they are sisters; in others they are adversaries [S4][S5].")
rel("mes-inanna","mes-erishkigal","FOUGHT","Inanna descends to the underworld (to Ereshkigal's funeral) and is killed there.","attested",["S4"])
rel("mes-erishkigal","mes-nergal","PARTNER_OF","Ereshkigal and Nergal are a 'pair' (the 'Nergal and Ereshkigal' marriage myth).","attested",["S5"])
rel("mes-nergal","mes-erishkigal","KILLED","(Mythic) In the 'Nergal and Ereshkigal' myth, Nergal 'rapes' (or marries) Ereshkigal.","attested",["S5"])
rel("mes-erishkigal-consort","mes-erishkigal","PARTNER_OF","Nergal (as Ereshkigal's consort) is her 'pair'.","attested",["S5"])
rel("mes-apas","mes-antum","PARTNER_OF","An and Antu (Anatum) are a 'pair'.","attested",["S5"])

dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, chapters, variants=None, unc=None, evid="attested"):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs,
         "variants": variants or [], "uncertainty_notes": unc or "",
         "evidence_status": evid, "chapters": chapters}
    M.append(m)

myth("mes-enuma","The Enuma Elish (the Babylonian Creation Epic)",
    "The Enuma Elish is the great Babylonian creation epic, the 'New Year' (Akitu) festival text. In it, the gods (the 'Apsu' and the 'Tiamat' generations) are in conflict; the young gods (led by Marduk) are chosen to fight Tiamat. Marduk slays Tiamat with his bow, net, and 'rakasu' winds, splits her body in two to make the sky (upper half) and the earth (lower half), and from Kingu's blood (Tiamat's general) creates humanity. Marduk takes the 'Tablet of Destinies' and becomes the king of the gods [S1].",
    ["mes-marduk","mes-tiamat","mes-kingu","mes-enki"], ["S1"],
    [{"heading":"The Primeval Waters","body":"Apsu (the fresh water) and Tiamat (the salt water) are the two primeval waters [S1]."},
     {"heading":"The Conflict","body":"The young gods (led by Marduk) are in conflict with Tiamat's army [S1]."},
     {"heading":"Marduk's Challenge","body":"Marduk is chosen to fight Tiamat [S1]."},
     {"heading":"The Slaying of Tiamat","body":"Marduk slays Tiamat with his bow, net, and 'rakasu' winds [S1]."},
     {"heading":"The Creation of the World","body":"Marduk splits Tiamat's body in two to make the sky and the earth [S1]."},
     {"heading":"The Creation of Humanity","body":"From Kingu's blood, Marduk creates humanity [S1]."},
     {"heading":"The Tablet of Destinies","body":"Marduk takes the 'Tablet of Destinies' and becomes king of the gods [S1]."}],
    variants=[
      {"label":"Atrahasis (Old Babylonian)","text":"In the Atrahasis, the creation of humanity is from Apsu's flesh (not Kingu's blood); the flood-hero is Atrahasis [S3]."}],
    unc="The Enuma Elish has multiple versions (Old Babylonian c. 18th c. BCE; standard form c. 1100-1000 BCE); the details vary [S1].",)

myth("mes-creation","The Sumerian Creation (An and Ki)",
    "In Sumerian cosmology, An (the sky) and Ki (the earth) are the first pair — the 'parents' of the world. From their union (or from the separation of heaven and earth), the gods and the world emerge [S5]. The 'Apsu' (the fresh water) and the 'Tiamat' (the salt water) are the two primeval waters [S5].",
    ["mes-apas","mes-ki","mes-abzu","mes-tiamat"], ["S5"],
    [{"heading":"An and Ki","body":"An (the sky) and Ki (the earth) are the first pair [S5]."},
     {"heading":"The Primeval Waters","body":"The 'Apsu' (fresh water) and the 'Tiamat' (salt water) are the two primeval waters [S5]."},
     {"heading":"The Emergence of the Gods","body":"From the separation of heaven and earth, the gods emerge [S5]."}],
    unc="The Sumerian creation is less well-attested than the Babylonian (Enuma Elish); it is reconstructed from Sumerian texts [S5].")

myth("mes-flood","The Flood (Atrahasis / Gilgamesh)",
    "In the Atrahasis and the Gilgamesh flood-story, the gods (led by Enlil) decide to destroy humanity with a flood (because humanity's noise/disturbance is too great). Enki (Ea) saves the flood-hero (Atrahasis in the Atrahasis; Utnapishtim in the Gilgamesh) by whispering to him to build a boat. The flood destroys all life, but the flood-hero (and his family) survive. The flood-hero is later made immortal (in the Gilgamesh) [S2][S3].",
    ["mes-enlil","mes-enki","mes-utu"], ["S2","S3"],
    [{"heading":"The Decision","body":"The gods (led by Enlil) decide to destroy humanity with a flood [S2][S3]."},
     {"heading":"Enki's Warning","body":"Enki (Ea) whispers to the flood-hero to build a boat [S2][S3]."},
     {"heading":"The Flood","body":"The flood destroys all life [S2][S3]."},
     {"heading":"The Survival","body":"The flood-hero (and his family) survive [S2][S3]."},
     {"heading":"The Immortality","body":"The flood-hero is made immortal (in the Gilgamesh) [S2]."}],
    variants=[
      {"label":"Gilgamesh (Standard Babylonian)","text":"In the Gilgamesh, the flood-hero is Utnapishtim (the 'faraway' one); the flood is part of Gilgamesh's quest for immortality [S2]."},
      {"label":"Atrahasis (Old Babylonian)","text":"In the Atrahasis, the flood-hero is Atrahasis; the flood is part of the creation-of-humanity story [S3]."}],
    unc="The flood-story has multiple versions (Atrahasis, Gilgamesh, and others); the details vary [S2][S3].")

myth("mes-inanna-descent","Inanna's Descent to the Underworld",
    "The great Sumerian myth of 'Inanna's Descent to the Underworld': Inanna descends to the underworld to attend the funeral of her sister Ereshkigal (the underworld-goddess). At the seven gates of the underworld, Inanna is stripped of her powers (her crown, her weapons, her jewelry) one by one. At the bottom, Ereshkigal kills Inanna (she is hung on a peg as a corpse). Enki (the wisdom god) is moved to pity and sends a being (the 'galatur' or the 'keshig') to bring Inanna back. Inanna is restored, but must send a 'stand-in' (her consort Dumuzi) to the underworld in her place [S4][S5].",
    ["mes-inanna","mes-erishkigal","mes-enki","mes-nanna"], ["S4","S5"],
    [{"heading":"The Descent","body":"Inanna descends to the underworld to attend Ereshkigal's funeral [S4]."},
     {"heading":"The Seven Gates","body":"At the seven gates, Inanna is stripped of her powers one by one [S4]."},
     {"heading":"The Killing","body":"At the bottom, Ereshkigal kills Inanna (she is hung on a peg) [S4]."},
     {"heading":"The Restoration","body":"Enki sends a being to bring Inanna back [S4]."},
     {"heading":"The Stand-in","body":"Inanna must send a 'stand-in' (Dumuzi) to the underworld in her place [S4]."}],
    variants=[
      {"label":"Akkadian (Ishtar) version","text":"In the Akkadian (Ishtar) version, the details vary (the 'stand-in' is sometimes not Dumuzi) [S4]."}],
    unc="The 'Descent' myth has multiple versions (Sumerian c. 1900-1700 BCE; later Akkadian versions); the details vary [S4].")

myth("mes-inanna-erishkigal","Inanna and Ereshkigal (the 'sisters' of the underworld)",
    "Inanna (the 'light' goddess) and Ereshkigal (the 'dark' goddess of the underworld) are 'sisters' (in some accounts) or adversaries. The 'Descent' myth is the great conflict between the two: Inanna descends to the underworld and is killed by Ereshkigal [S4][S5]. The 'sisters' relationship is a 'light/dark' duality: Inanna is the 'light' (the morning star, the life-giver), Ereshkigal is the 'dark' (the underworld, the death-bringer) [S4][S5].",
    ["mes-inanna","mes-erishkigal"], ["S4","S5"],
    [{"heading":"The 'Sisters'","body":"Inanna and Ereshkigal are 'sisters' (in some accounts) [S4][S5]."},
     {"heading":"The Light/Dark Duality","body":"Inanna is the 'light'; Ereshkigal is the 'dark' [S4][S5]."},
     {"heading":"The 'Descent'","body":"Inanna descends to the underworld and is killed by Ereshkigal [S4]."}],
    unc="The 'sisters' relationship varies by version [S4][S5].")

myth("mes-enlil-erosion","Enlil and the 'Erosion' of the World (the flood-decree)",
    "In the Atrahasis and the Gilgamesh flood-story, Enlil (the king of the gods) decrees the flood because humanity's noise/disturbance is too great. The 'erosion' of the world (the flood) is Enlil's decree to destroy humanity [S2][S3]. Enki (Ea) saves the flood-hero against Enlil's will [S2][S3].",
    ["mes-enlil","mes-enki"], ["S2","S3"],
    [{"heading":"The Noise","body":"Humanity's noise/disturbance is too great [S2][S3]."},
     {"heading":"The Decree","body":"Enlil decrees the flood [S2][S3]."},
     {"heading":"Enki's Intervention","body":"Enki (Ea) saves the flood-hero against Enlil's will [S2][S3]."}],
    unc="The 'erosion' (the flood) is a 'destruction' myth: the world is 'eroded' by the flood [S2][S3].")

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
 "realms": [
  {"id":"mes-sky","name":"The Heavens (An)","native_name":"An",
   "description":"The sky/heaven, the realm of An (the sky god), Enlil (the storm/air god), Marduk (the Babylonian supreme god), Nanna (the moon), and Utu (the sun) [S1][S5].",
   "entities":["mes-apas","mes-enlil","mes-marduk","mes-nanna","mes-utu"],
   "layout":{"x":0.5,"y":0.15,"r":0.15}},
  {"id":"mes-earth","name":"The Earth (Ki)","native_name":"Ki",
   "description":"The earth, the realm of the human world and the earth-gods (Ninhursag, the 'earth-mother') [S5].",
   "entities":["mes-ki","mes-ninhursag"],
   "layout":{"x":0.5,"y":0.5,"r":0.14}},
  {"id":"mes-underworld","name":"The Underworld (Irkallu / Kur)","native_name":"Irkallu / Kur",
   "description":"The underworld, the realm of the dead, the domain of Ereshkigal (the queen of the underworld) and Nergal (the underworld-god) [S4][S5].",
   "entities":["mes-erishkigal","mes-nergal","mes-erishkigal-consort","mes-abzu","mes-tiamat"],
   "layout":{"x":0.5,"y":0.85,"r":0.13}},
 ],
 "structure_notes": "The Mesopotamian cosmos is three-layered: the Heavens (An) above, the Earth (Ki) in the middle, and the Underworld (Irkallu/Kur) below. The 'Apsu' (the fresh water) and the 'Tiamat' (the salt water) are the two primeval waters that underlie the world [S1][S5]. This is a scholarly reconstruction from Sumerian and Babylonian texts [S5]."
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
T = [
 {"id":"mes-t1","period":"Sumerian period","date_range":"c. 3500-2000 BCE","description":"The Sumerian period. The gods An, Enlil, Enki, Nanna, Utu, and Inanna are worshipped. The great temples at Nippur (Enlil), Eridu (Enki), Ur (Nanna), and Uruk (Inanna) are built. The evidence is archaeological and cuneiform (Sumerian texts).","confidence":"attested (archaeological & cuneiform)"},
 {"id":"mes-t2","period":"Akkadian period","date_range":"c. 2334-2154 BCE","description":"The Akkadian period. The Sumerian gods are assimilated into the Akkadian pantheon (An becomes Anu, Enki becomes Ea, Nanna becomes Sin, Utu becomes Shamash, Inanna becomes Ishtar). Enlil becomes the king of the gods.","confidence":"attested (cuneiform)"},
 {"id":"mes-t3","period":"Old Babylonian period","date_range":"c. 2000-1600 BCE","description":"The Old Babylonian period. Marduk rises to be the king of the gods (as Babylon rises to power). The Atrahasis and the early flood-stories are composed.","confidence":"attested (cuneiform)"},
 {"id":"mes-t4","period":"Standard Babylonian period","date_range":"c. 1200-1000 BCE","description":"The Standard Babylonian period. The Enuma Elish (in its standard form) and the Epic of Gilgamesh (in its Standard Babylonian version) are composed. Marduk is the supreme god.","confidence":"attested (cuneiform)"},
 {"id":"mes-t5","period":"Neo-Babylonian / Achaemenid period","date_range":"c. 626-330 BCE","description":"The Neo-Babylonian and Achaemenid (Persian) period. Marduk is the supreme god (Neo-Babylonian); under the Persians, his supremacy declines. The great temple at Babylon (the Esagila) is still a center of worship.","confidence":"attested (cuneiform & archaeology)"},
]
dump("timeline.json", T)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"id":"mes-u1","question":"The 'supremacy' of the gods over time","versions":{"Sumerian":"An is the supreme god","Akkadian/Babylonian":"Enlil is the king of the gods","Babylonian (later)":"Marduk is the king of the gods"},"how_we_present_it":"We present the 'supremacy' as a political/theological development over time, not as a mythic event. We do NOT flatten the pantheon into one 'supreme god'."},
 {"id":"mes-u2","question":"Inanna and Ereshkigal","versions":{"S4":"In some accounts they are 'sisters'; in others they are adversaries"},"how_we_present_it":"We store both versions and note the variation."},
 {"id":"mes-u3","question":"The flood-story","versions":{"Atrahasis":"The flood-hero is Atrahasis; the flood is part of the creation-of-humanity story","Gilgamesh":"The flood-hero is Utnapishtim; the flood is part of Gilgamesh's quest for immortality"},"how_we_present_it":"We present both versions (Atrahasis and Gilgamesh) and note the differences."},
 {"id":"mes-u4","question":"The 'Descent' myth","versions":{"Sumerian (c. 1900-1700 BCE)":"The 'Descent' in its Sumerian form","Akkadian (Ishtar) version":"The details vary (the 'stand-in' is sometimes not Dumuzi)"},"how_we_present_it":"We present the Sumerian version as the primary and note the Akkadian variant."},
 {"id":"mes-u5","question":"The dating of the myths","versions":{"Sumerian":"The Sumerian texts are c. 3500-2000 BCE","Babylonian":"The Babylonian texts (Enuma Elish, Gilgamesh) are c. 1800-1000 BCE"},"how_we_present_it":"We make clear that the Sumerian religion is much older than the Babylonian texts that preserve it."},
 {"id":"mes-u6","question":"The 'creation' of humanity","versions":{"Enuma Elish":"From Kingu's blood (Tiamat's general)","Atrahasis":"From Apsu's flesh (the primeval fresh water)"},"how_we_present_it":"We present both versions and note that they are distinct creation-accounts."},
]
dump("uncertainties.json", U)

print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
