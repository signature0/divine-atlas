#!/usr/bin/env python3
# EGYPTIAN dataset builder. Writes research/egyptian/*.json
# NOTE: Egyptian religion had MULTIPLE creation traditions (Heliopolis, Memphis,
# Hermopolis, and others). We model them as parallel cosmologies, not one tree.
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/egyptian"
os.makedirs(OUT, exist_ok=True)
C = "egyptian"

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

SRC_PDB = S("S1","Pyramid Texts","c. 2400–2300 BCE","text","https://en.wikipedia.org/wiki/Pyramid_Texts")
SRC_ABYDOS = S("S2","Book of the Dead (e.g., Papyrus of Ani)","c. 1250 BCE","text","https://en.wikipedia.org/wiki/Book_of_the_Dead")
SRC_PLUTARCH = S("S3","Plutarch, On Isis and Osiris","c. 79 CE","text","https://en.wikisource.org/wiki/On_Isis_and_Osiris")
SRC_HORNUNG = S("S4","Hornung, 'The Ancient Egyptian Books of the Dead' / 'Nile Religion' (academic)","modern (translation & scholarship)","academic",None)
SRC_MET = S("S5","Met Museum Egyptian collection (open access)","museum","museum","https://www.metmuseum.org/art/collection")

# ================= PRIMORDIAL / COSMOGONIC =================
ent("egy-aur","Atum-Ra (the primordial waters' first god)","Atum / Ra",["Atum","Khepri (morning form)"],"primordial","male",
    ["creation","the sun","the self-created god"],
    symbols=["the solar disc","the ram's head (Khepri)"],
    realms=["egy-primordial"],
    myths=["egy-creation-heliopolis","egy-creation-memphis"],
    short="In the Heliopolitan tradition, the self-created god who rose from the primordial waters (Nun) as the first being; identified with Ra and with Atum (the 'Completed One').",
    long="In the Heliopolitan (Heliopolis) creation tradition, the first god rose from the primordial waters of Nun — sometimes as a mound of earth (the benben), sometimes directly — and was named Atum, 'the Self-Completed.' He was identified with Ra, the sun god, and with Khepri, the scarab-headed morning sun [S1][S4]. From his own body (in one account, by spitting or sneezing) came Shu and Tefnut, the first divine pair [S1][S4]. The Heliopolitan account is only one of several Egyptian creation traditions; the Memphis tradition makes Ptah the self-created creator, and Hermopolis begins with a primeval Ogdoad of eight deities [S4]. We do NOT present one as 'the' Egyptian creation story — we present all three.",
    facts=["The self-created god of the Heliopolitan tradition [S1][S4].",
           "Identified with Ra (the sun) and Atum (the completed one) [S4].",
           "In Memphis, Ptah plays the 'self-created creator' role instead [S4]."],
    unc=["Which god is 'first' depends on the local tradition: Atum-Ra (Heliopolis), Ptah (Memphis), or the Ogdoad (Hermopolis). These are genuinely competing accounts, not a single story with variants [S4]."],
    srcs=[SRC_PDB, SRC_HORNUNG, SRC_MET],
    art=["egy-art-ra-dendera"], hero="egy-art-ra-dendera")

ent("egy-nun","Nun (the primordial waters)","Nun / Nu",["Nu"],"primordial","male",
    ["the primordial waters","chaos (the pre-creation state)"],
    symbols=["the waters","the crocodile (in some images)"],
    realms=["egy-primordial"],
    myths=["egy-creation-heliopolis","egy-solar-journey"],
    short="The primordial waters from which creation emerged — the infinite, dark water that existed before the world.",
    long="Nun is the body of primordial waters that existed before creation. From Nun the first god rose (as Atum on the benben mound in Heliopolis) [S1][S4]. Nun is not exactly 'evil' — it is the undifferentiated pre-creation state — but it is also the state the world returns toward: the sun god must battle the serpent Apep (who represents the chaotic waters) every night in the Duat [S2][S4]. The priests of the temple performed the 'Opening of the Mouth' and other rites to keep the ordered world (Ma'at) separate from Nun [S4].",
    facts=["The primordial waters of pre-creation [S1][S4].",
           "Apep, the chaos serpent, embodies the threat of Nun returning [S2]."],
    unc=["Nun's 'gender' is often given as male (Nun) with a female counterpart (Naunet); the sources treat the waters as a pair [S4]."],
    srcs=[SRC_PDB, SRC_HORNUNG],
    art=[])

ent("egy-apep","Apep (Apophis)","Apep / Apophis",["Apep","Apophis"],"monster","male",
    ["chaos","the night serpent","the enemy of the sun"],
    realms=["egy-duat"],
    enemies=["egy-ra"],
    myths=["egy-solar-journey"],
    short="The great chaos serpent who tries each night to devour the sun god in the Duat; he is defeated every night — but must be defeated again.",
    long="Apep (Apophis) is the great serpent of chaos who dwells in the primordial waters and tries every night to devour the sun god Ra as Ra travels through the Duat (the underworld) [S2][S4]. At the hour of the sun's weakest point (around midnight), Apep strikes; the sun god (helped by Thoth and others) defeats him — often with a knife or by the 'Eye of Ra' (Sekhmet) [S2][S4]. The defeat is repeated nightly: Apep is not permanently destroyed, he is merely driven back. This nightly battle is the mythic basis for the Egyptian understanding of the sun's daily rising [S2][S4]. Priests performed rites each night to 'bind' Apep [S4].",
    facts=["The nightly enemy of the sun god in the Duat [S2][S4].",
           "Defeated every night but never permanently destroyed [S2][S4].",
           "Priests performed nightly rites to bind him [S4]."],
    unc=["Apep's relationship to Nun (the primordial waters) is close but not identical: Apep is the active threat, Nun the passive pre-creation state [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_HORNUNG],
    art=[])

# ================= HELIOPOLITAN ENNEAD =================
ent("egy-shu","Shu","Shu",[],"deity","male",
    ["the air","the atmosphere","the first divine pair (with Tefnut)"],
    symbols=["the feather (his headdress)"],
    parents=["egy-aur"], siblings=["egy-tefnut"],
    partners=["egy-tefnut"],
    children=["egy-gebel","egy-nut"],
    realms=["egy-sky"],
    myths=["egy-creation-heliopolis"],
    short="God of the air, son of Atum-Ra (with Tefnut); he holds up the sky (Nut) to keep it from the earth (Geb).",
    long="Shu is the god of the air and the atmosphere, the first son of Atum-Ra [S1][S4]. He and his sister Tefnut (moisture) are the first divine pair born from the self-created god. Their children are Geb (earth) and Nut (sky) [S1][S4]. Shu's defining image is that of the supporter: he stands between earth and sky, holding Nut up with his hands so that the sky does not collapse onto the earth [S4]. He is a god of the ordered atmosphere — the space between the solid earth and the solid sky that the air (Shu) maintains [S4].",
    facts=["Holds up the sky (Nut) to keep it from the earth (Geb) [S4].",
           "Son of Atum-Ra; brother of Tefnut [S1][S4].",
           "Father of Geb and Nut [S1][S4]."],
    unc=[],
    srcs=[SRC_PDB, SRC_HORNUNG],
    art=[])

ent("egy-tefnut","Tefnut","Tefnut",[],"deity","female",
    ["moisture","rain","the first divine pair (with Shu)"],
    symbols=["the crocodile's head (in some images)"],
    parents=["egy-aur"], siblings=["egy-shu"],
    partners=["egy-shu"],
    children=["egy-gebel","egy-nut"],
    myths=["egy-creation-heliopolis"],
    short="Goddess of moisture and rain, sister and consort of Shu; together they are the first divine pair.",
    long="Tefnut is the goddess of moisture, rain, and the cool air, the sister and consort of Shu [S4]. She is the first divine pair with Shu, and their children are Geb and Nut [S1][S4]. Tefnut is also associated with the 'Eye of Ra' — in one myth she is the angry eye that Ra sent out to punish humanity, and who became Sekhmet (or was calmed and became Hathor) [S3][S4].",
    facts=["Goddess of moisture and rain [S4].",
           "The first divine pair with Shu [S1][S4].",
           "Associated with the 'Eye of Ra' myth [S3][S4]."],
    unc=["Tefnut's identification with the 'Eye of Ra' is one of several identifications; the Eye is a fluid concept in Egyptian thought [S4]."],
    srcs=[SRC_PDB, SRC_PLUTARCH, SRC_HORNUNG],
    art=[])

ent("egy-gebel","Geb","Geb",[],"deity","male",
    ["the earth","fertility","the land"],
    parents=["egy-shu","egy-tefnut"], siblings=["egy-nut"],
    partners=["egy-nut"],
    children=["egy-osiris","egy-isfet","egy-set","egy-nephthys"],
    realms=["egy-earth"],
    myths=["egy-creation-heliopolis","egy-osiris-murder"],
    short="God of the earth, son of Shu and Tefnut; he is the father of Osiris, Isis, Set, and Nephthys.",
    long="Geb is the god of the earth, the solid ground, the source of fertility [S4]. He is the son of Shu and Tefnut and the husband of Nut (his sister) [S1][S4]. Geb and Nut are the parents of the four children who form the core of the Osiris cycle: Osiris, Isis, Set, and Nephthys [S1][S4]. The myth of Geb and Nut: Shu separated them, holding Nut up, because the earth-god and the sky-goddess were inseparable [S4]. Geb's domain is the fertile black soil of the Nile, the source of all life [S4].",
    facts=["God of the earth and fertility [S4].",
           "Father of Osiris, Isis, Set, and Nephthys [S1][S4].",
           "Separated from Nut by Shu [S4]."],
    unc=[],
    srcs=[SRC_PDB, SRC_HORNUNG],
    art=[])

ent("egy-nut","Nut","Nut",[],"deity","female",
    ["the sky","the stars","the heavens"],
    parents=["egy-shu","egy-tefnut"], siblings=["egy-gebel"],
    partners=["egy-gebel"],
    children=["egy-osiris","egy-isfet","egy-set","egy-nephthys"],
    realms=["egy-sky"],
    myths=["egy-creation-heliopolis","egy-solar-journey"],
    short="Goddess of the sky, daughter of Shu and Tefnut; she swallows the sun each night and gives it birth each morning.",
    long="Nut is the goddess of the sky, the dome of the heavens studded with stars [S4]. She is the daughter of Shu and Tefnut and the wife of Geb (her brother) [S1][S4]. Nut's body arches over the earth: each night she swallows the sun (Ra) as it sets, carries it through her body through the night, and gives it birth again at dawn [S2][S4]. The sun's nightly journey through Nut's body is the same journey through the Duat (the underworld) where Apep waits [S2]. Nut is a goddess of the stars and of the cycle of death and rebirth that the sun performs daily [S4].",
    facts=["The sky goddess who swallows and rebirths the sun nightly [S2][S4].",
           "Daughter of Shu and Tefnut; wife of Geb [S1][S4].",
           "Mother of Osiris, Isis, Set, and Nephthys [S1][S4]."],
    unc=[],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_HORNUNG],
    art=[])

# ================= OSIRIS CYCLE =================
ent("egy-osiris","Osiris","Osiris",["Wsir","Usir"],"deity","male",
    ["the dead","resurrection","the afterlife","the Nile's flood","the fertile earth"],
    symbols=["the atef crown","the crook and flail","the mummified form"],
    parents=["egy-gebel","egy-nut"],
    siblings=["egy-isfet","egy-set","egy-nephthys"],
    partners=["egy-isfet"],
    children=["egy-horus"],
    realms=["egy-duat","egy-earth"],
    myths=["egy-osiris-murder","egy-isis-restores","egy-horus-vs-set"],
    short="The lord of the dead and resurrection; murdered by his brother Set, restored by Isis, and father of Horus; he judges the dead in the afterlife.",
    long="Osiris is the lord of the dead, the god of resurrection, and the judge of the afterlife [S1][S2][S3][S4]. In the great myth, he was a just king of Egypt who was murdered by his jealous brother Set: Set placed him in a chest, sealed it with lead, and cast it into the Nile; the chest washed up in Byblos, and a tamarisk tree grew around it [S3][S4]. Isis found the body, restored it, and through their union conceived Horus [S3][S4]. Osiris then became lord of the Duat (the underworld), where he judges the dead: the 'Weighing of the Heart' (the heart weighed against the feather of Ma'at) determines the fate of the soul [S2][S4]. Osiris is the prototype of mummification: his restored body is the model for the mummified dead who seek resurrection [S4]. He is also associated with the annual Nile flood, which made the land fertile [S4].",
    facts=["Lord of the dead and the afterlife [S1][S2].",
           "Murdered by Set, restored by Isis [S3][S4].",
           "Father of Horus [S3][S4].",
           "Judges the dead in the 'Weighing of the Heart' [S2].",
           "The prototype of mummification [S4].",
           "Associated with the Nile flood and fertility [S4]."],
    unc=["The 'Byblos' episode (the chest washing up in Phoenicia) is a later addition to the myth [S3][S4].",
         "Osiris's role as 'king of the dead' developed over time; in the earliest Pyramid Texts he is one of the blessed dead, not yet the lord of all the dead [S1][S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-osiris-stele","egy-art-osiris-walters"], hero="egy-art-osiris-stele")

ent("egy-isfet","Isis","Isis",["Isis","Aset"],"deity","female",
    ["magic","motherhood","healing","fidelity","the protection of the dead"],
    symbols=["the throne (her name means 'throne')","the ankh","the sistrum"],
    parents=["egy-gebel","egy-nut"],
    siblings=["egy-osiris","egy-set","egy-nephthys"],
    partners=["egy-osiris"],
    children=["egy-horus"],
    myths=["egy-osiris-murder","egy-isis-restores","egy-horus-vs-set"],
    short="The greatest of the Egyptian goddesses: wife of Osiris, mother of Horus, the master of magic, the protector of the dead, and the faithful wife.",
    long="Isis is the most widely worshipped of the Egyptian goddesses and one of the most important figures in the Osiris cycle [S3][S4]. She is the sister and wife of Osiris and the mother of Horus [S1][S3][S4]. After Set murdered Osiris, Isis gathered the scattered pieces of his body (all except the genitals, which were lost) and used her magic to restore him and conceive Horus [S3][S4]. She is the master of magic (she is the one who, in one myth, learned the secret name of Ra and thereby gained his power) [S3][S4]. Isis is the protector of the dead: in the Book of the Dead, she appears as one of the four daughters of Horus who protect the canopic jars (the internal organs) [S2][S4]. Her worship spread across the Mediterranean and into the Roman world, where the 'Isis cult' persisted for centuries [S3][S4].",
    facts=["Wife of Osiris, mother of Horus [S1][S3][S4].",
           "Restored Osiris's body and conceived Horus [S3][S4].",
           "Master of magic [S3][S4].",
           "Protector of the dead (one of the four daughters of Horus) [S2][S4].",
           "Her cult spread across the Roman world [S3][S4]."],
    unc=["Isis's 'magic' is a later development; in the earliest sources she is a faithful wife and a good mother [S4].",
         "The 'secret name of Ra' episode is a late (Greco-Roman period) text [S3][S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-isis-shroud","egy-art-isis-pompeii"], hero="egy-art-isis-shroud")

ent("egy-horus","Horus","Horus",["Horus","Hr"],"deity","male",
    ["the sky","kingship","the sun (as Horakhty)","the falcon","the protector of the pharaoh"],
    symbols=["the falcon","the wedjat eye (the Eye of Horus)"],
    animals=["the falcon"],
    parents=["egy-osiris","egy-isfet"],
    siblings=["egy-horus-elder"],
    partners=["egy-isfet"],
    children=["egy-horus-elder"],
    enemies=["egy-set"],
    realms=["egy-sky"],
    myths=["egy-osiris-murder","egy-horus-vs-set"],
    short="The falcon god of the sky and of kingship; son of Osiris and Isis; he avenges his father by defeating Set. The living pharaoh is Horus; the dead pharaoh becomes Osiris.",
    long="Horus is the falcon god of the sky and of kingship [S4]. In the Osiris cycle, he is the son of Osiris and Isis, born after Osiris's murder, and his life's task is to avenge his father by defeating Set and reclaiming the throne [S3][S4]. The great myth of Horus vs. Set is a long, episodic struggle (preserved in the 'Contendings of Horus and Set') in which the two cousins fight for the throne of Egypt, judged by the Ennead [S4]. Horus wins, and becomes the king of the unified Egypt [S4]. The living pharaoh is identified with Horus (Horus 'so-and-so' is the pharaoh's name); the dead pharaoh becomes Osiris [S4]. There is also an 'elder' Horus (Harsomatus / the son of the first Horus) in some genealogies [S4]. The 'Eye of Horus' (the wedjat) is the broken-and-restored eye that Horus lost to Set and regained — a symbol of healing and protection [S4].",
    facts=["Falcon god of the sky and kingship [S4].",
           "Son of Osiris and Isis; avenges his father against Set [S3][S4].",
           "The living pharaoh is Horus; the dead pharaoh becomes Osiris [S4].",
           "The 'Eye of Horus' (wedjat) is a symbol of healing [S4]."],
    unc=["The 'two Horuses' (the sky-falcon and the son of Osiris) are sometimes treated as the same god and sometimes as distinct; the sources are not consistent [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-horus-walters","egy-art-horus-double-crown"], hero="egy-art-horus-walters")

ent("egy-set","Set (Seth)","Set",["Set","Seth","Sutekh"],"deity","male",
    ["the desert","storm","chaos","violence","the foreigner"],
    symbols=["the Set animal (a mysterious creature with a long snout)"],
    animals=["the Set animal","the donkey","the pig"],
    parents=["egy-gebel","egy-nut"],
    siblings=["egy-osiris","egy-isfet","egy-nephthys"],
    enemies=["egy-osiris","egy-horus"],
    myths=["egy-osiris-murder","egy-horus-vs-set"],
    short="The god of the desert, storm, and chaos; brother of Osiris who murdered him; the great enemy of Horus and of Ma'at (order).",
    long="Set (Seth) is the god of the desert, the storm, chaos, and violence — the great antagonist of the Osiris cycle [S4]. He is the brother of Osiris and the one who murdered him, out of jealousy (Osiris was the rightful king) [S3][S4]. Set's defining act is the murder of Osiris: he lured Osiris to a banquet, measured him for a coffin, seized him, wrapped him in the coffin, sealed it with lead, and threw it in the Nile [S3][S4]. Set is then the great enemy of Horus (his nephew), and the two fight for the throne in the 'Contendings' [S4]. Set is the god of the foreign, the chaotic, the violent — the desert that threatens the fertile Nile valley [S4]. He is not simply 'evil': he is the necessary counterforce to Ma'at (order), the storm that keeps the world from stagnation [S4]. He was eventually 'demonized' as Egypt's enemies (the Libyans, then the Nubians, then the Persians) were associated with him [S4].",
    facts=["God of the desert, storm, and chaos [S4].",
           "Murdered his brother Osiris [S3][S4].",
           "The great enemy of Horus [S4].",
           "Eventually 'demonized' as the god of Egypt's enemies [S4]."],
    unc=["Set's character changed over time: from a complex storm god to an outright 'evil' figure (especially in the Greco-Roman period) [S4].",
         "The 'Set animal' (his symbol) is still unidentified — it may be a hybrid creature or a stylized animal [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-set-ramesses"], hero="egy-art-set-ramesses")

ent("egy-nephthys","Nephthys","Nephthys",["Nephthys","Nebthet"],"deity","female",
    ["the dead","the protection of the mummy","the threshold (her name means 'lady of the house)"],
    parents=["egy-gebel","egy-nut"],
    siblings=["egy-osiris","egy-isfet","egy-set"],
    partners=["egy-set","egy-osiris"],
    myths=["egy-osiris-murder","egy-isis-restores"],
    short="The goddess of the dead and the protection of the mummy; sister of Osiris and Isis; she helped Isis restore her brother.",
    long="Nephthys is the goddess of the dead, the protection of the mummy, and the threshold (her name means 'lady of the house') [S4]. She is the sister of Osiris and Isis and the wife (in some accounts) of Set [S4]. In the Osiris cycle, Nephthys stands with Isis in grief and in the restoration of Osiris: the two sisters (Isis as the kite, Nephthys as the swallow) circle the body of Osiris, mourning and protecting it [S3][S4]. Nephthys is one of the four protectors of the canopic jars (the internal organs) in the Book of the Dead [S2][S4]. She is a goddess of the threshold — the boundary between the living and the dead — and of the protection of the mummy in the tomb [S4].",
    facts=["Goddess of the dead and the protection of the mummy [S4].",
           "Sister of Osiris and Isis; helped restore Osiris [S3][S4].",
           "One of the four protectors of the canopic jars [S2][S4]."],
    unc=["Nephthys's relationship to Set (as his wife) is odd given that Set is the murderer of her brother; the sources treat it as a fact without explaining it [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG],
    art=[])

# ================= OTHER MAJOR GODS =================
ent("egy-ra","Ra","Ra",["Ra","Amun-Ra (fused)"],"deity","male",
    ["the sun","creation","the king of the gods"],
    symbols=["the solar disc","the vulture (on the disc)"],
    animals=["the bull","the vulture"],
    realms=["egy-sky","egy-duat"],
    enemies=["egy-apep"],
    myths=["egy-solar-journey","egy-creation-heliopolis"],
    short="The sun god, king of the gods, who travels across the sky by day and through the Duat by night; he is defeated nightly by Apep and reborn each dawn.",
    long="Ra is the sun god, the king of the gods, the creator (in the Heliopolitan tradition, as Atum-Ra) [S1][S4]. By day he crosses the sky in his solar barque (the 'Day Barque'), bringing light and life [S2][S4]. At sunset he enters the Duat (the underworld) in the 'Night Barque' and travels through the twelve hours of the night, where he faces Apep (the chaos serpent) at the hour of greatest danger (around midnight) [S2][S4]. Thoth and other gods help him defeat Apep, and he rises again at dawn [S2][S4]. Ra's nightly journey is the mythic basis of the Egyptian afterlife: the dead who are justified 'sail with Ra' through the night [S2][S4]. In the later (New Kingdom and after) period, Ra was fused with Amun to become 'Amun-Ra', the supreme god of the state religion [S4].",
    facts=["The sun god and king of the gods [S4].",
           "Travels across the sky by day and through the Duat by night [S2][S4].",
           "Defeats Apep nightly [S2][S4].",
           "Fused with Amun to become Amun-Ra [S4]."],
    unc=["Ra's 'creation' role (as Atum) is specifically Heliopolitan; other traditions give the creation role to Ptah or the Ogdoad [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_HORNUNG, SRC_MET],
    art=["egy-art-ra-dendera","egy-art-ra-slays-apep"], hero="egy-art-ra-dendera")

ent("egy-amun","Amun","Amun",["Amun","Amun-Ra (fused with Ra)"],"deity","male",
    ["the hidden one","the king of the gods","creation (in later periods)"],
    symbols=["the double plumes (his headdress)"],
    realms=["egy-temple"],
    myths=["egy-creation-memphis"],
    short="The 'Hidden One', the supreme god of the later Egyptian state religion; fused with Ra to become Amun-Ra.",
    long="Amun is the 'Hidden One', a god who was originally a local god of Thebes but rose to become the supreme god of the Egyptian state religion in the New Kingdom and later periods [S4]. His name means 'the hidden one' — he is the invisible, the unseen, the source that is behind all things [S4]. Amun was fused with Ra to become 'Amun-Ra', the supreme creator and king of the gods [S4]. The great temple of Amun at Karnak was the largest temple complex in Egypt [S4]. Amun's 'hiddenness' made him a good candidate for fusion with other gods (Amun-Ra, Amun-Montu, etc.) [S4].",
    facts=["The 'Hidden One', supreme god of the later state religion [S4].",
           "Fused with Ra to become Amun-Ra [S4].",
           "His great temple was at Karnak [S4]."],
    unc=["Amun's 'hiddenness' is a theological concept, not a mythic attribute; the sources do not give him a detailed mythic biography [S4]."],
    srcs=[SRC_HORNUNG, SRC_MET],
    art=["egy-art-amun-statue"], hero="egy-art-amun-statue")

ent("egy-ptah","Ptah","Ptah",[],"deity","male",
    ["creation","the craftsman-god","the patron of Memphis","the sculptor of the world"],
    symbols=["the ankh, was-sceptre, and djed (his triple symbol)"],
    places=["Memphis"],
    myths=["egy-creation-memphis"],
    short="The creator-god of Memphis, the divine craftsman who 'fashioned' the world in his heart and mouth; in the Memphite tradition he is the self-created first god.",
    long="Ptah is the creator-god of Memphis, the patron of craftsmen and sculptors [S4]. In the Memphite creation tradition (preserved in the 'Memphite Theology' inscribed on a statue of Ptah-Sokar-Osiris), Ptah is the self-created first god who created the world 'in his heart and with his mouth' — that is, by thought (the heart) and by speech (the mouth), naming things into existence [S4]. This is a distinct creation tradition from the Heliopolitan (Atum-Ra) and the Hermopolitan (Ogdoad) accounts [S4]. Ptah is the divine craftsman: he is the patron of sculptors, metalworkers, and all makers, and the temple workshops at Memphis were centers of artistic production [S4]. Ptah was later fused with Sokar (aMemphite god of the necropolis) and with Osiris to become 'Ptah-Sokar-Osiris' [S4].",
    facts=["Creator-god of Memphis [S4].",
           "Created the world 'in his heart and mouth' (Memphite Theology) [S4].",
           "Patron of craftsmen and sculptors [S4].",
           "Fused with Sokar and Osiris to become Ptah-Sokar-Osiris [S4]."],
    unc=["The Memphite Theology is a late (Saite period) text that 'reinterprets' Ptah as the supreme creator; earlier sources do not give Ptah this role [S4]."],
    srcs=[SRC_HORNUNG, SRC_MET],
    art=[])

ent("egy-thoth","Thoth","Thoth",["Thoth","Djehuty"],"deity","male",
    ["wisdom","writing","the moon","magic","the judge of the dead"],
    symbols=["the ibis (his animal form)","the scribe's palette"],
    animals=["the ibis"],
    myths=["egy-solar-journey","egy-osiris-murder"],
    short="The ibis-headed god of wisdom, writing, and the moon; he records the verdict in the Weighing of the Heart and helps Ra defeat Apep.",
    long="Thoth is the ibis-headed god of wisdom, writing, and the moon [S4]. He is the scribe of the gods: he records the verdict in the 'Weighing of the Heart' (the judgment of the dead) [S2][S4]. He is the inventor of writing (hieroglyphs) and of magic [S4]. In the solar journey, Thoth helps Ra defeat Apep at the critical midnight hour [S2][S4]. Thoth is also associated with the moon (his name is linked to the 'calculations' of the lunar calendar) [S4]. He is a god of order and knowledge — the opposite of the chaos that Apep represents [S4].",
    facts=["Ibis-headed god of wisdom and writing [S4].",
           "Records the verdict in the Weighing of the Heart [S2][S4].",
           "Helps Ra defeat Apep at midnight [S2][S4].",
           "Associated with the moon [S4]."],
    unc=["Thoth's 'moon' association is debated: some scholars see it as a later development, others as ancient [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_HORNUNG],
    art=["egy-art-thoth-ibis"], hero="egy-art-thoth-ibis")

ent("egy-hathor","Hathor","Hathor",["Hathor"],"deity","female",
    ["love","music","dance","joy","the sky (as the cow)","the protection of women"],
    symbols=["the sistrum","the menat necklace","the cow's horns and solar disc"],
    animals=["the cow"],
    myths=["egy-eye-of-ra"],
    short="The cow goddess of love, music, dance, and joy; she is the 'Great One' and the mother of the pharaoh; in the 'Eye of Ra' myth she becomes Sekhmet.",
    long="Hathor is the cow goddess of love, music, dance, and joy, the 'Great One' and the mother of the pharaoh [S4]. She is the goddess of the western desert (the land of the dead) and of the mining regions (the turquoise mines of Serabit el-Khadim) [S4]. In the 'Eye of Ra' myth, Hathor (or Tefnut) is the eye that Ra sends out to punish humanity for plotting against him; the eye becomes enraged and is transformed into Sekhmet (the warrior goddess), and is calmed (by a trick involving red-dyed water that looks like blood) and returns as Hathor [S3][S4]. Hathor is the patroness of music and dance: her priests played the sistrum and the menat [S4]. She is also the 'mistress of the West' — the goddess who receives the dead [S4].",
    facts=["Cow goddess of love, music, dance, and joy [S4].",
           "The 'Eye of Ra' who becomes Sekhmet and is calmed back to Hathor [S3][S4].",
           "Patroness of the mining regions [S4]."],
    unc=["The 'Eye of Ra' is a fluid concept: it is variously identified with Tefnut, Hathor, Sekhmet, or Wadjet [S4]."],
    srcs=[SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-hathor-head","egy-art-hathor-cow"])

ent("egy-bastet","Bastet","Bastet",["Bastet"],"deity","female",
    ["the home","the protection of women","cats","the gentle moon"],
    animals=["the cat"],
    symbols=["the cat","the sistrum"],
    short="The cat goddess of the home, the protection of women, and the gentle aspects of the moon; the 'gentle' counterpart of Sekhmet.",
    long="Bastet is the cat goddess of the home, the protection of women, and the gentle aspects of the moon [S4]. She is the 'gentle' counterpart of Sekhmet (the warrior goddess): where Sekhmet is the raging eye of Ra, Bastet is the calm, protective cat [S4]. Her great cult center was at Bubastis, where a great festival was held in her honor [S4]. Cats were sacred to Bastet: mummified cats were buried in great numbers at Bubastis and other sites [S4]. Bastet is a goddess of the domestic, the protective, the gentle — the opposite of the violent desert [S4].",
    facts=["Cat goddess of the home and protection [S4].",
           "The 'gentle' counterpart of Sekhmet [S4].",
           "Her cult center was at Bubastis [S4].",
           "Cats were mummified and buried for her [S4]."],
    unc=["Bastet's 'moon' association is later; the earliest Bastet is a cat goddess of the home [S4]."],
    srcs=[SRC_HORNUNG, SRC_MET],
    art=["egy-art-bastet-statue"], hero="egy-art-bastet-statue")

ent("egy-sekhemet","Sekhmet","Sekhmet",["Sekhmet"],"deity","female",
    ["war","the destruction","the raging eye of Ra"],
    symbols=["the lioness","the solar disc"],
    animals=["the lioness"],
    myths=["egy-eye-of-ra"],
    short="The lioness goddess of war and destruction; the 'raging eye of Ra' who is calmed back into Hathor.",
    long="Sekhmet is the lioness goddess of war, destruction, and the raging aspects of the sun [S4]. She is the 'eye of Ra' in her enraged form: when Ra sends his eye out to punish humanity, it becomes Sekhmet, who slaughters the rebels [S3][S4]. To calm her, Ra (or Thoth) devises a trick: he brews a potion dyed red with beet juice (to look like blood) and floods the land with it; Sekhmet, thinking she has drunk the blood of her victims, becomes drunk and calm, and returns as Hathor [S3][S4]. Sekhmet is the warrior goddess, the patron of the pharaoh in battle, and the destructive power of the sun [S4].",
    facts=["Lioness goddess of war and destruction [S4].",
           "The 'raging eye of Ra' who is calmed into Hathor [S3][S4].",
           "Patron of the pharaoh in battle [S4]."],
    unc=["Sekhmet and Hathor are two aspects of the same 'Eye of Ra' — the sources treat them as distinct goddesses who are also the same [S4]."],
    srcs=[SRC_PLUTARCH, SRC_HORNUNG],
    art=["egy-art-sekhmet-lioness"], hero="egy-art-sekhmet-lioness")

ent("egy-anubis","Anubis","Anubis",["Anubis","Wepwawet (a related jackal god)"],"deity","male",
    ["the mummification","the dead","the threshold of the tomb","the protection of the grave"],
    symbols=["the jackal's head","the crook and flail"],
    animals=["the jackal"],
    myths=["egy-osiris-murder"],
    short="The jackal-headed god of mummification and the dead; he oversees the embalming of the body and guides the soul to the afterlife.",
    long="Anubis is the jackal-headed god of mummification and the dead [S4]. He is the overseer of the embalming: in the 'Weighing of the Heart' scene, Anubis (or a priest in his guise) performs the weighing [S2][S4]. He is the god of the threshold of the tomb — the boundary between the world of the living and the world of the dead [S4]. Anubis is the 'foremost of the westerners' (the west is the land of the dead, where the sun sets) [S4]. In the Osiris cycle, Anubis is the one who mummifies Osiris's body, making him the first mummy [S3][S4]. He is a god of protection of the grave and of the safe passage of the soul to the afterlife [S4].",
    facts=["Jackal-headed god of mummification [S4].",
           "Oversees the embalming and the Weighing of the Heart [S2][S4].",
           "Mummified Osiris's body (the first mummy) [S3][S4]."],
    unc=["Anubis's status declined in the later periods as Osiris took over much of his 'lord of the dead' role [S4]."],
    srcs=[SRC_PDB, SRC_ABYDOS, SRC_PLUTARCH, SRC_HORNUNG, SRC_MET],
    art=["egy-art-anubis-jackal"])

# ================= PRIMORDIAL (Hermopolis Ogdoad) =================
ent("egy-ogdoad-nun","Nun & Naunet (primeval waters)","Nun & Naunet",[],"primordial","unknown",
    ["the primeval waters (Hermopolitan account)"],
    realms=["egy-primordial"],
    myths=["egy-creation-hermopolis"],
    short="In the Hermopolitan creation tradition, the primeval waters (Nun and his female counterpart Naunet) are the first of the Ogdoad — the eight primeval deities.",
    long="In the Hermopolitan (Hermopolis) creation tradition, the world begins with the Ogdoad — a group of eight primeval deities representing the conditions of the primordial state [S4]. The first pair is Nun and Naunet, the primeval waters [S4]. The Ogdoad is a distinct creation account from the Heliopolitan (Atum-Ra) and Memphite (Ptah) traditions [S4].",
    facts=["The first pair of the Hermopolitan Ogdoad [S4]."],
    unc=["The Ogdoad is one of several creation accounts; we do not treat it as 'the' Egyptian creation [S4]."],
    srcs=[SRC_HORNUNG],
    art=[])

ent("egy-ogdoad-heh","Heh & Hehet (primordial infinity)","Heh & Hehet",[],"primordial","unknown",
    ["primordial infinity (Hermopolitan account)"],
    realms=["egy-primordial"],
    myths=["egy-creation-hermopolis"],
    short="In the Hermopolitan Ogdoad, Heh and Hehet represent primordial infinity (the endless, the without-beginning).",
    long="Heh and Hehet are the second pair of the Hermopolitan Ogdoad, representing primordial infinity — the endless, the without-beginning [S4]. They are the 'eternity' that underlies the other primeval conditions [S4].",
    facts=["The second pair of the Hermopolitan Ogdoad [S4]."],
    unc=[],
    srcs=[SRC_HORNUNG],
    art=[])

ent("egy-ogdoad-khnum","Khenunu & Khenunit (primordial mystery)","Khenunu & Khenunit",[],"primordial","unknown",
    ["primordial mystery (Hermopolitan account)"],
    realms=["egy-primordial"],
    myths=["egy-creation-hermopolis"],
    short="In the Hermopolitan Ogdoad, Khenunu and Khenunit represent primordial mystery (the hidden, the secret).",
    long="Khenunu and Khenunit are the third pair of the Hermopolitan Ogdoad, representing primordial mystery — the hidden, the secret, the unknown [S4]. (Not to be confused with Khnum, the ram-headed creator-god of the Nile cataracts, who is a separate, later deity [S4].)",
    facts=["The third pair of the Hermopolitan Ogdoad [S4]."],
    unc=["Do not confuse Khenunu (the Ogdoad 'mystery') with Khnum (the ram-headed god) [S4]."],
    srcs=[SRC_HORNUNG],
    art=[])

ent("egy-ogdoad-sat","Sat & Satet (primordial duration)","Sat & Satet",[],"primordial","unknown",
    ["primordial duration (Hermopolitan account)"],
    realms=["egy-primordial"],
    myths=["egy-creation-hermopolis"],
    short="In the Hermopolitan Ogdoad, Sat and Satet represent primordial duration (the enduring, the lasting).",
    long="Sat and Satet are the fourth pair of the Hermopolitan Ogdoad, representing primordial duration — the enduring, the lasting, the stable [S4].",
    facts=["The fourth pair of the Hermopolitan Ogdoad [S4]."],
    unc=[],
    srcs=[SRC_HORNUNG],
    art=[])

# ---- Referenced figures (lightweight) ----
ent("egy-horus-elder","Horus the Elder (Harsomatus)","Harsomatus",["Horus the Elder"],"deity","male",
    ["the elder sky-falcon"],
    children=["egy-horus"],
    short="In some genealogies, an 'elder' Horus (Harsomatus) is the father of the younger Horus (son of Osiris).",
    long="In some Egyptian genealogies (especially the later 'syncrisis' that tried to merge the different traditions), there is an 'elder' Horus (Harsomatus, 'Horus of the South') who is the son of the original sky-falcon Horus and the father of the younger Horus (the son of Osiris and Isis) [S4]. This is one of the genuine complications in Egyptian genealogy: the sources do not consistently distinguish the 'sky-falcon' Horus from the 'son of Osiris' Horus [S4].",
    facts=["The 'elder' Horus in some genealogies [S4]."],
    unc=["The 'two Horuses' are sometimes merged, sometimes distinct; the sources are not consistent [S4]."],
    srcs=[SRC_HORNUNG],
    art=[])

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="attested",srcs=["S4"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# Heliopolitan creation
rel("egy-aur","egy-shu","CREATED","Atum-Ra created Shu (and Tefnut) from his own body.","attested",["S1","S4"])
rel("egy-aur","egy-tefnut","CREATED","Atum-Ra created Tefnut.","attested",["S1","S4"])
rel("egy-shu","egy-tefnut","SIBLING_OF","Shu and Tefnut are the first divine pair (siblings).","attested",["S1","S4"])
rel("egy-shu","egy-tefnut","PARTNER_OF","Shu and Tefnut are the first divine couple.","attested",["S1","S4"])
rel("egy-shu","egy-gebel","PARENT_OF","Shu (with Tefnut) is the parent of Geb.","attested",["S1","S4"])
rel("egy-shu","egy-nut","PARENT_OF","Shu is the parent of Nut.","attested",["S1","S4"])
rel("egy-tefnut","egy-gebel","PARENT_OF","Tefnut is the parent of Geb.","attested",["S1","S4"])
rel("egy-tefnut","egy-nut","PARENT_OF","Tefnut is the parent of Nut.","attested",["S1","S4"])
rel("egy-gebel","egy-nut","SIBLING_OF","Geb and Nut are siblings.","attested",["S1","S4"])
rel("egy-gebel","egy-nut","PARTNER_OF","Geb and Nut are married (brother-sister).","attested",["S1","S4"])
rel("egy-shu","egy-nut","RULES","Shu holds up the sky (Nut) to keep it from the earth (Geb).","attested",["S4"],
    "Shu stands between earth and sky, supporting Nut.")
# Osiris cycle family
rel("egy-gebel","egy-osiris","PARENT_OF","Geb (with Nut) is the parent of Osiris.","attested",["S1","S4"])
rel("egy-gebel","egy-isfet","PARENT_OF","Geb is the parent of Isis.","attested",["S1","S4"])
rel("egy-gebel","egy-set","PARENT_OF","Geb is the parent of Set.","attested",["S1","S4"])
rel("egy-gebel","egy-nephthys","PARENT_OF","Geb is the parent of Nephthys.","attested",["S1","S4"])
rel("egy-nut","egy-osiris","PARENT_OF","Nut is the parent of Osiris.","attested",["S1","S4"])
rel("egy-nut","egy-isfet","PARENT_OF","Nut is the parent of Isis.","attested",["S1","S4"])
rel("egy-nut","egy-set","PARENT_OF","Nut is the parent of Set.","attested",["S1","S4"])
rel("egy-nut","egy-nephthys","PARENT_OF","Nut is the parent of Nephthys.","attested",["S1","S4"])
rel("egy-osiris","egy-isfet","SIBLING_OF","Osiris and Isis are siblings.","attested",["S1","S4"])
rel("egy-osiris","egy-set","SIBLING_OF","Osiris and Set are siblings.","attested",["S1","S4"])
rel("egy-isfet","egy-set","SIBLING_OF","Isis and Set are siblings.","attested",["S1","S4"])
rel("egy-osiris","egy-isfet","PARTNER_OF","Osiris and Isis are married (and siblings).","attested",["S1","S3","S4"])
rel("egy-osiris","egy-horus","PARENT_OF","Osiris (with Isis) is the parent of Horus.","attested",["S3","S4"])
rel("egy-isfet","egy-horus","PARENT_OF","Isis is the parent of Horus.","attested",["S3","S4"])
rel("egy-set","egy-nephthys","PARTNER_OF","Set and Nephthys are (in some accounts) married.","attested",["S4"])
rel("egy-set","egy-osiris","KILLED","Set murdered his brother Osiris.","attested",["S3","S4"],
    "Set lured Osiris to a banquet, seized him, sealed him in a coffin, and cast it into the Nile.")
rel("egy-horus","egy-set","ENEMY_OF","Horus and Set are the great enemies, fighting for the throne.","attested",["S4"])
rel("egy-horus","egy-set","FOUGHT","Horus and Set fight in the 'Contendings' for the throne of Egypt.","attested",["S4"])
rel("egy-nephthys","egy-isfet","ALLY_OF","Nephthys stands with Isis in the grief and restoration of Osiris.","attested",["S3","S4"])
rel("egy-horus-elder","egy-horus","PARENT_OF","(In some genealogies) Horus the Elder (Harsomatus) is the parent of the younger Horus.","variant",["S4"])
rel("egy-isfet","egy-horus","ALLY_OF","Isis protects and supports Horus in his quest against Set.","attested",["S3","S4"])
# Solar journey
rel("egy-ra","egy-apep","ENEMY_OF","Ra and Apep are the great enemies: the sun vs. the chaos serpent.","attested",["S2","S4"])
rel("egy-ra","egy-apep","FOUGHT","Ra defeats Apep nightly in the Duat.","attested",["S2","S4"])
rel("egy-thoth","egy-ra","ALLY_OF","Thoth helps Ra defeat Apep at the critical midnight hour.","attested",["S2","S4"])
rel("egy-nut","egy-ra","ASSOCIATED_WITH","Nut's body is the sky through which the sun travels; she swallows and rebirths the sun.","attested",["S2","S4"])
# Eye of Ra
rel("egy-hathor","egy-sekhemet","ASSOCIATED_WITH","Hathor and Sekhmet are two aspects of the 'Eye of Ra' (calm vs. raging).","attested",["S3","S4"],
    "The Eye of Ra becomes Sekhmet in rage and is calmed back into Hathor.")
rel("egy-sekhemet","egy-hathor","SUCCESSOR_OF","(Aspect-shift) Sekhmet is calmed and returns as Hathor.","attested",["S3","S4"])
# Anubis
rel("egy-anubis","egy-osiris","ALLY_OF","Anubis mummified Osiris's body (making him the first mummy).","attested",["S3","S4"])
rel("egy-anubis","egy-horus","ALLY_OF","Anubis protects the young Horus and the throne.","attested",["S4"])
# Amun-Ra fusion
rel("egy-amun","egy-ra","ASSOCIATED_WITH","Amun was fused with Ra to become Amun-Ra (the supreme god).","attested",["S4"],
    "This is a theological fusion, not a mythic event.")
# Hermopolitan Ogdoad (parallel creation)
rel("egy-ogdoad-nun","egy-ogdoad-heh","SIBLING_OF","The Ogdoad pairs are 'siblings' (primeval conditions).","attested",["S4"])
rel("egy-ogdoad-nun","egy-ogdoad-khnum","SIBLING_OF","The Ogdoad pairs are primeval conditions.","attested",["S4"])
rel("egy-ogdoad-nun","egy-ogdoad-sat","SIBLING_OF","The Ogdoad pairs are primeval conditions.","attested",["S4"])

dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, chapters, variants=None, unc=None):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs,
         "variants": variants or [], "uncertainty_notes": unc or "",
         "chapters": chapters}
    M.append(m)

myth("egy-creation-heliopolis","The Heliopolitan Creation (Atum-Ra)",
    "In the Heliopolitan tradition, the self-created god Atum-Ra rose from the primordial waters (Nun) — sometimes on a mound of earth (the benben). From his own body he created Shu (air) and Tefnut (moisture), the first divine pair. Their children were Geb (earth) and Nut (sky). This is the genealogy behind the Osiris cycle [S1][S4].",
    ["egy-aur","egy-nun","egy-shu","egy-tefnut","egy-gebel","egy-nut"], ["S1","S4"],
    [{"heading":"The Primordial Waters","body":"Nun, the infinite waters, existed before creation [S1]."},
     {"heading":"Atum-Ra Rises","body":"The self-created god rose from Nun (on the benben mound) [S1][S4]."},
     {"heading":"Shu and Tefnut","body":"Atum-Ra created the first pair: air and moisture [S1][S4]."},
     {"heading":"Geb and Nut","body":"Their children: earth and sky [S1][S4]."}],
    variants=[
      {"label":"Memphite alternative","text":"In Memphis, Ptah is the self-created creator who fashions the world 'in his heart and mouth' [S4]."},
      {"label":"Hermopolitan alternative","text":"In Hermopolis, creation begins with the Ogdoad (eight primeval deities), not a single self-created god [S4]."}],
    unc="This is ONE of several Egyptian creation traditions. We do not present it as 'the' Egyptian creation — we present all three [S4].")

myth("egy-creation-memphis","The Memphite Creation (Ptah)",
    "In the Memphite tradition (preserved in the 'Memphite Theology'), Ptah is the self-created first god. He created the world 'in his heart and with his mouth' — by thought (the heart) and by speech (the mouth), naming things into existence [S4]. This is a distinct creation account from the Heliopolitan and Hermopolitan traditions [S4].",
    ["egy-ptah"], ["S4"],
    [{"heading":"Ptah, the Self-Created","body":"Ptah is the first god, self-created [S4]."},
     {"heading":"Creation by Heart and Mouth","body":"He thinks (heart) and speaks (mouth) the world into being [S4]."}],
    unc="The Memphite Theology is a late (Saite period) text that reinterprets Ptah as the supreme creator [S4].")

myth("egy-creation-hermopolis","The Hermopolitan Creation (the Ogdoad)",
    "In the Hermopolitan tradition, creation begins with the Ogdoad — eight primeval deities representing the conditions of the primordial state: the waters (Nun/Naunet), infinity (Heh/Hehet), mystery (Khenunu/Khenunit), and duration (Sat/Satet). From these primeval conditions, the world (and the sun) comes into being [S4].",
    ["egy-ogdoad-nun","egy-ogdoad-heh","egy-ogdoad-khnum","egy-ogdoad-sat"], ["S4"],
    [{"heading":"The Ogdoad","body":"Eight primeval deities, in four pairs [S4]."},
     {"heading":"The Emergence of the World","body":"From the primeval conditions, the world and the sun emerge [S4]."}],
    unc="The Ogdoad is one of several creation accounts; we do not treat it as 'the' Egyptian creation [S4].")

myth("egy-osiris-murder","The Murder of Osiris",
    "Set, jealous of his brother Osiris (the rightful king), lured him to a banquet. Set brought a coffin that he had measured to Osiris's exact size; when Osiris lay down in it, Set seized him, wrapped him in the coffin, sealed it with lead, and threw it into the Nile. The chest washed down-river and out to sea, washing up in Byblos, where a tamarisk tree grew around it [S3][S4].",
    ["egy-osiris","egy-set","egy-isfet"], ["S3","S4"],
    [{"heading":"The Jealousy","body":"Set is jealous of Osiris's kingship [S3][S4]."},
     {"heading":"The Coffin Trick","body":"Set measures Osiris and seals him in the coffin [S3][S4]."},
     {"heading":"The Nile and Byblos","body":"The chest is cast into the Nile and washes up in Byblos [S3][S4]."}],
    unc="The 'Byblos' episode is a later addition to the myth [S3][S4].")

myth("egy-isis-restores","Isis Restores Osiris",
    "Isis (with the help of Nephthys) searched for the scattered pieces of Osiris's body. She found all the pieces except the genitals (which had been eaten by a fish in the Nile). She reassembled the body, used her magic to restore Osiris to life, and through their union conceived Horus [S3][S4]. Anubis mummified the body, making Osiris the first mummy [S3][S4].",
    ["egy-isfet","egy-nephthys","egy-osiris","egy-anubis","egy-horus"], ["S3","S4"],
    [{"heading":"The Search","body":"Isis and Nephthys search for the scattered pieces [S3][S4]."},
     {"heading":"The Restoration","body":"Isis reassembles the body and uses magic to restore Osiris [S3][S4]."},
     {"heading":"The Conception of Horus","body":"Through their union, Isis conceives Horus [S3][S4]."},
     {"heading":"The First Mummy","body":"Anubis mummifies Osiris [S3][S4]."}],
    unc="The 'lost genitals' detail is a later (Greco-Roman) addition [S3][S4].")

myth("egy-horus-vs-set","The Contendings of Horus and Set",
    "Horus (the son of Osiris) and Set (the murderer) fight for the throne of Egypt. The 'Contendings' is a long, episodic struggle in which the two cousins fight, each claiming the throne, and the Ennead (the nine gods) judges between them. Horus ultimately wins, and becomes the king of the unified Egypt [S4].",
    ["egy-horus","egy-set"], ["S4"],
    [{"heading":"The Claim","body":"Horus claims the throne as the son of Osiris [S4]."},
     {"heading":"The Contendings","body":"A long series of contests and battles [S4]."},
     {"heading":"The Judgment","body":"The Ennead judges; Horus wins [S4]."}],
    unc="The 'Contendings' is preserved in a fragmentary Middle Kingdom text; the full narrative is reconstructed [S4].")

myth("egy-solar-journey","Ra's Journey Through the Duat (the Night)",
    "Each night, the sun god Ra enters the Duat (the underworld) in his 'Night Barque' and travels through the twelve hours of the night. At the hour of greatest danger (around midnight), the chaos serpent Apep strikes; Thoth and other gods help Ra defeat Apep. Ra rises again at dawn [S2][S4]. The justified dead 'sail with Ra' through the night [S2][S4].",
    ["egy-ra","egy-apep","egy-thoth","egy-nut"], ["S2","S4"],
    [{"heading":"The Setting","body":"Ra enters the Duat at sunset [S2][S4]."},
     {"heading":"The Twelve Hours","body":"The journey through the twelve hours of the night [S2][S4]."},
     {"heading":"The Battle with Apep","body":"At midnight, Apep strikes; Ra is helped to defeat him [S2][S4]."},
     {"heading":"The Rising","body":"Ra rises again at dawn [S2][S4]."}],
    unc="The 'Book of the Dead' and the 'Amduat' (Book of the Netherworld) describe the journey in different detail; the two sources are not identical [S2][S4].")

myth("egy-eye-of-ra","The Eye of Ra (Hathor/Sekhmet)",
    "Ra's eye (variously identified with Hathor, Tefnut, or Sekhmet) was sent out to punish humanity for plotting against Ra. The eye became enraged and was transformed into Sekhmet, the warrior lioness, who slaughtered the rebels. To calm her, Ra (or Thoth) devised a trick: he brewed a potion dyed red with beet juice (to look like blood) and flooded the land with it; Sekhmet, thinking she had drunk the blood of her victims, became drunk and calm, and returned as Hathor [S3][S4].",
    ["egy-hathor","egy-sekhemet","egy-ra"], ["S3","S4"],
    [{"heading":"The Plot","body":"Humanity plots against Ra [S3][S4]."},
     {"heading":"The Eye Sent Out","body":"Ra sends his eye to punish the rebels [S3][S4]."},
     {"heading":"The Transformation into Sekhmet","body":"The eye becomes the raging lioness Sekhmet [S3][S4]."},
     {"heading":"The Trick","body":"The red-dyed water calms Sekhmet, who returns as Hathor [S3][S4]."}],
    unc="The 'Eye of Ra' is a fluid concept: it is variously identified with Tefnut, Hathor, Sekhmet, or Wadjet [S4].")

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
 "realms": [
  {"id":"egy-primordial","name":"Nun (the primordial waters)","native_name":"Nun",
   "description":"The infinite, dark waters that existed before creation. The state the world returns toward [S1][S4].",
   "entities":["egy-nun","egy-apep"],
   "layout":{"x":0.5,"y":0.9,"r":0.14}},
  {"id":"egy-earth","name":"Kemet (the black land — Egypt)","native_name":"Kemet",
   "description":"The fertile black soil of the Nile, the domain of Geb, the source of all life [S4].",
   "entities":["egy-gebel","egy-osiris"],
   "layout":{"x":0.5,"y":0.62,"r":0.14}},
  {"id":"egy-sky","name":"The Sky (Nut)","native_name":"Pet",
   "description":"The dome of the heavens, the body of Nut, studded with stars. The domain of Ra (by day) and Horus [S4].",
   "entities":["egy-nut","egy-ra","egy-horus","egy-shu","egy-tefnut"],
   "layout":{"x":0.5,"y":0.2,"r":0.16}},
  {"id":"egy-duat","name":"The Duat (the underworld)","native_name":"Duat",
   "description":"The underworld through which the sun travels by night; the domain of Osiris (lord of the dead) and Apep (the chaos serpent) [S2][S4].",
   "entities":["egy-osiris","egy-apep","egy-anubis"],
   "layout":{"x":0.5,"y":0.82,"r":0.12}},
  {"id":"egy-temple","name":"The Temple (the microcosm)","native_name":"",
   "description":"The temple was understood as a microcosm — a model of the world, with the sanctuary as the primordial mound [S4].",
   "entities":["egy-amun","egy-ptah"],
   "layout":{"x":0.82,"y":0.5,"r":0.1}},
 ],
 "structure_notes": "The Egyptian cosmos is layered: the primordial waters (Nun) at the bottom and around the edges, the fertile earth (Kemet) in the middle, the sky (Nut) above, and the Duat (underworld) below the earth. The sun (Ra) travels across the sky by day and through the Duat by night. The temple is a microcosm of this structure [S4]."
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
T = [
 {"id":"egy-t1","period":"Predynastic / Early Dynastic","date_range":"c. 3100–2686 BCE","description":"The earliest Egyptian religion. The gods Ra, Osiris, Isis, Horus, Set, and others are worshipped. The earliest evidence is archaeological (tombs, offerings, early inscriptions).","confidence":"attested (archaeological)"},
 {"id":"egy-t2","period":"Old Kingdom","date_range":"c. 2686–2181 BCE","description":"The Pyramid Texts are inscribed in the pyramids — the earliest surviving religious texts. They describe the king's journey to the sky and his union with the gods.","confidence":"attested (text)"},
 {"id":"egy-t3","period":"Middle Kingdom","date_range":"c. 2055–1650 BCE","description":"The 'Contendings of Horus and Set' and other mythic texts are composed. The Book of the Dead begins to take shape.","confidence":"attested (text)"},
 {"id":"egy-t4","period":"New Kingdom","date_range":"c. 1550–1069 BCE","description":"The Book of the Dead (in its classic form) is used. Amun rises to supreme status (Amun-Ra). The great temples at Karnak and Luxor are built.","confidence":"attested (text & archaeology)"},
 {"id":"egy-t5","period":"Late / Ptolemaic","date_range":"c. 664 BCE – 395 CE","description":"The 'Isis cult' spreads across the Mediterranean. The last temple (at Philae) closes in 395 CE under the Roman/Christian empire.","confidence":"attested"},
]
dump("timeline.json", T)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"id":"egy-u1","question":"Which god is 'first' (the creation account)","versions":{"Heliopolis":"Atum-Ra is the self-created first god","Memphis":"Ptah is the self-created creator","Hermopolis":"The Ogdoad (eight primeval deities) are first"},"how_we_present_it":"We present all three as genuinely competing accounts, not as one story with variants. We do NOT silently choose one."},
 {"id":"egy-u2","question":"The identity of the 'Eye of Ra'","versions":{"S4":"The Eye is variously identified with Tefnut, Hathor, Sekhmet, or Wadjet"},"how_we_present_it":"We note the fluidity; the Eye is a concept, not a fixed goddess."},
 {"id":"egy-u3","question":"The 'two Horuses'","versions":{"S4":"The sky-falcon Horus and the 'son of Osiris' Horus are sometimes the same, sometimes distinct"},"how_we_present_it":"We store both and note the inconsistency in the sources."},
 {"id":"egy-u4","question":"Set's character","versions":{"Early":"A complex storm/chaos god (not simply 'evil')","Late (Greco-Roman)":"An outright 'evil' figure, the god of Egypt's enemies"},"how_we_present_it":"We present the development over time; we do not flatten Set into a simple villain."},
 {"id":"egy-u5","question":"Osiris as 'lord of the dead'","versions":{"Pyramid Texts (early)":"Osiris is one of the blessed dead","Later (Middle Kingdom on)":"Osiris becomes the lord of all the dead and the judge of the afterlife"},"how_we_present_it":"We note the development; the 'judge of the dead' role is a later accretion."},
 {"id":"egy-u6","question":"The dating of the myths","versions":{"Archaeological":"The gods are worshipped from at least c. 3100 BCE","Literary":"The main texts (Pyramid Texts, Book of the Dead) are c. 2400 BCE and c. 1250 BCE"},"how_we_present_it":"We make clear that the worship is much older than the surviving texts."},
]
dump("uncertainties.json", U)

print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
