#!/usr/bin/env python3
# GREEK dataset builder. Writes research/greek/*.json
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/greek"
os.makedirs(OUT, exist_ok=True)
C = "greek"

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

# Shared source set
SRC_THEOGONY = S("S1","Hesiod, Theogony","c. 700 BCE","text","https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0020")
SRC_ILIAD = S("S2","Homer, Iliad","c. 750 BCE","text","https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0130")
SRC_ODYSSEY = S("S3","Homer, Odyssey","c. 725 BCE","text","https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0133")
SRC_HYMN = S("S4","Homeric Hymns","c. 700–300 BCE","text",None)
SRC_APPOLLOD = S("S5","Pseudo-Apollodorus, Library (Bibliotheca)","c. 1st–2nd c. CE (transmits earlier)","text",None)
SRC_PAUS = S("S6","Pausanias, Description of Greece","c. 150–180 CE","text",None)

# ---- Primordial ----
ent("gre-chaos","Chaos","Χάος",["Chaos"],"primordial","unknown",
    ["origin","the void"],
    short="The first 'gap' or 'yawn' of existence in Hesiod's Theogony — the void from which all else, including Night and Eros, first emerged.",
    long="In Hesiod's Theogony, the very first thing is Chaos — a yawning gap, not a god in the anthropomorphic sense but the primordial void from which the earliest beings spring [S1]. From Chaos come Gaia (Earth), Tartarus (the deep abyss), Eros (attraction/love), and Nyx (Night) [S1]. Chaos is best understood as a cosmogonic principle — the empty space that makes differentiation possible — rather than a character. Later Orphic tradition recasts the origin differently (a cosmic egg, Phanes), a genuine variant we present alongside the Hesiodic account [S1][S5].",
    facts=["In Hesiod, Chaos is not 'evil' — the word's later connotation is a modern development [S1].",
           "Orphic cosmogony replaces Chaos-at-first with a golden cosmic egg and the god Phanes [S5]."],
    unc=["The precise 'nature' of Chaos (void vs. a personified entity) is interpretive; Hesiod only says it came first [S1]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD],
    art=[])

ent("gre-gaia","Gaia","Γαῖα",["Earth","Ge"],"deity","female",
    ["earth","fertility","creation"],
    symbols=["corn","the land itself"], animals=["serpents (guardians)"],
    children=["gre-ouranos","gre-oceanus","gre-tethys"],
    parents=[],
    realms=["gre-earth"],
    myths=["gre-creation"],
    short="Earth herself — the first solid being in Hesiod, mother of the Titans and mother of nearly every primordial lineage.",
    long="Gaia (Earth) is, in Hesiod's Theogony, the second named being after Chaos: from Chaos came Gaia, the broad breast that is the foundation of all [S1]. She is a mother to an extraordinary degree — she gives birth to Uranus (Sky), to the sea (Pontus), and to the mountains, and she is the mother of the Titans (with Uranus) [S1]. In myth she is also the avenger: she impregnates herself and bears the giant Typhon (or, in the Theogony, the monstrous Typhaon) in revenge for Uranus's mutilation by Cronus, and it is her counsel that sets Cronus against Uranus [S1][S5]. Cultically Gaia/Ge was venerated as the earth-mother at many sites; 'Gaia' is often the generic 'earth' while 'Ge' the deity [S6].",
    facts=["Mother of the Titans (with Uranus) and of many other primordial lines [S1].",
           "In the Theogony, Gaia engineers the overthrow of Uranus by Cronus [S1]."],
    unc=["The 'Typhon born of Gaia alone' passage (Theogony 810–820) is widely regarded as a later interpolation; we flag it [S1]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-ouranos","Uranus","Οὐρανός",["Ouranos","Sky"],"primordial","male",
    ["sky","heaven"],
    parents=["gre-gaia"], children=["gre-cronus","gre-rhea","gre-oceanus","gre-tethys"],
    siblings=[], partners=["gre-gaia"],
    realms=["gre-sky"],
    myths=["gre-creation","gre-overthrow-of-ouranos"],
    short="Sky, the first 'god' and husband of Gaia; father of the Titans. He was overthrown and castrated by his son Cronus.",
    long="Ouranos (Uranus) is Sky in Hesiod: he loved Gaia and covered her entirely, and their union produced the twelve Titans, the Cyclopes, and the three Hecatoncheires (Hundred-Hands) [S1]. Fearing his monstrous children, Ouranos imprisoned them in Tartarus, and Gaia, grieving and plotting, forged a flint sickle and set her son Cronus to castrate and overthrow him [S1]. Dismembered, his severed parts fell to earth and gave rise to further beings (the Erinyes from his blood, Aphrodite from his severed member, in one account) [S1]. He then retreated to the heavens, and Cronus took his place as the supreme ruler [S1][S5].",
    facts=["His castration is the origin-story of both the Erinyes (Furies) and, in the Theogony, Aphrodite [S1].",
           "The 'Hundred-Handed' brothers (Cottus, Briareus, Gyges) later help Zeus defeat the Titans [S1]."],
    unc=["Aphrodite's birth from Ouranos's severed member (Theogony) vs. her birth from Zeus & Dione (Iliad) — a genuine variant, both stored [S1][S2]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_APPOLLOD],
    art=[])

# ---- Titans ----
ent("gre-cronus","Cronus","Κρόνος",["Cronos"],"deity","male",
    ["time (later association)","kingship","harvest"],
    weapons=["sickle (sickle of Gaia)"],
    parents=["gre-gaia","gre-ouranos"], siblings=["gre-rhea","gre-oceanus","gre-tethys"],
    partners=["gre-rhea"],
    children=["gre-zeus","gre-hera","gre-hades","gre-hestia","gre-demeter","gre-poseidon"],
    enemies=["gre-ouranos","gre-zeus"],
    realms=["gre-tartarus"],
    myths=["gre-overthrow-of-ouranos","gre-titanomachy"],
    short="Titan king who overthrew his father Ouranos and, in turn, was overthrown by his son Zeus.",
    long="Cronus is the youngest and last of the Titans, and the one Gaia chose to overthrow Ouranos with the flint sickle [S1]. He castrated his father and, with Rhea, reigned over the next age of the world [S1]. Warned by a prophecy (delivered by his parents) that he too would be overthrown by a child, Cronus swallowed each of his newborn children — Hestia, Demeter, Hera, Hades, and Poseidon — as they were born [S1][S5]. Rhea hid the infant Zeus in a Cretan cave, and Zeus, grown, forced Cronus to disgorge his siblings, then led them (with the help of the Cyclopes and Hecatoncheires) to war against the Titans: the Titanomachy [S1]. Defeated, Cronus and the other Titans were cast into Tartarus, with the Hecatoncheires set as guards [S1].",
    facts=["'Cronus = time' is a later (Hellenistic/Roman) etymological gloss, not what the Greek myths themselves assert [S1][S5].",
           "Zeus made him regurgitate his swallowed siblings [S1]."],
    unc=["The 'Cronus = Chronos (time)' identification is a secondary interpretive layer; we keep it as interpretation, not primary myth [S1][S5]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD],
    art=[])

ent("gre-rhea","Rhea","Ῥέα",[],"deity","female",
    ["motherhood","the earth"],
    parents=["gre-gaia","gre-ouranos"], siblings=["gre-cronus"],
    partners=["gre-cronus"],
    children=["gre-zeus","gre-hera","gre-hades","gre-hestia","gre-demeter","gre-poseidon"],
    myths=["gre-titanomachy"],
    short="Titaness, wife of Cronus, mother of the first Olympians; she hid Zeus from her husband.",
    long="Rhea is a Titaness, daughter of Gaia and Ouranos, and the wife of her brother Cronus [S1]. Mother of the first generation of Olympians, she was the one who saved Zeus: when Cronus was devouring their children, Rhea hid the newborn Zeus in a cave on Crete, and gave Cronus a stone wrapped in swaddling-clothes to swallow in his place [S1][S5]. This act preserved the line that would overthrow Cronus in the Titanomachy [S1].",
    facts=["She gave Cronus a wrapped stone in place of the infant Zeus [S1][S5].",
           "The Cretan cave where Zeus hid is one of the sacred sites Pausanias describes [S6]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD, SRC_PAUS],
    art=[])

# ---- Olympians ----
ent("gre-zeus","Zeus","Ζεύς",["Jupiter (Roman)"],"deity","male",
    ["sky","thunder","kingship","law","order","rain","oaths"],
    symbols=["eagle","oak","lightning bolt","throne","scepter"],
    animals=["eagle","bull"], weapons=["thunderbolt"],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-hera","gre-hades","gre-poseidon","gre-demeter","gre-hestia"],
    partners=["gre-hera"],
    children=["gre-athena","gre-apollo","gre-artemis","gre-ares","gre-aphrodite","gre-hermes","gre-dionysus","gre-perseus"],
    enemies=["gre-cronus","gre-titans","gre-typhon"],
    realms=["gre-olympus"],
    myths=["gre-creation","gre-titanomachy","gre-zeus-eye","gre-persephone"],
    short="King of the gods, ruler of Olympus, lord of sky, thunder, and kingly order — father of many gods and heroes.",
    long="Zeus is the supreme god of the classical Greek pantheon, king of Olympus and lord of the sky, thunder, weather, and the moral and political order [S1][S2][S3]. Son of the Titans Cronus and Rhea, he survived his father's attempt to devour him, grew up hidden in Crete, and led the overthrow of the Titans in the Titanomachy, for which he was awarded the sky and the thunderbolt (won from the Cyclopes, who forged it) [S1]. The cosmos was divided by lot: Zeus took the sky, Poseidon the sea, Hades the underworld [S1]. Zeus is the patron of hospitality (xenia), oaths, and kingship, and enforces cosmic order; his many offspring include Athena, Apollo, Artemis, Ares, Hermes, Dionysus, and the hero Perseus, among others [S2][S4][S5]. Cultically he was worshipped at Dodona, Olympia, and countless other sites; Zeus was 'the one who gives the season' and the upholder of the world's balance [S6].",
    facts=["His thunderbolt was forged for him by the Cyclopes [S1].",
           "Zeus is the god of xenia (hospitality) — a guest under his protection is sacred [S2][S3].",
           "Dodona (in Epirus) was his oldest oracle, predating Delphi [S6]."],
    unc=["Zeus's parentage is stable across sources (Cronus & Rhea); his 'many children' reflect both myth and the practice of local cults claiming him as patron [S1][S6]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_ODYSSEY, SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-zeus-stat","gre-art-zeus-bust","gre-art-zeus-sarapis"], hero="gre-art-zeus-stat")

ent("gre-hera","Hera","Ἥρα",["Juno (Roman)"],"deity","female",
    ["marriage","women","kingship","fidelity (as patron)"],
    symbols=["peacock","crown","scepter","lily"],
    animals=["peacock","cow","sparrow"],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-zeus","gre-hades","gre-poseidon","gre-demeter","gre-hestia"],
    partners=["gre-zeus"],
    children=["gre-ares","gre-hebe","gre-ileitithyia"],
    realms=["gre-olympus"],
    myths=["gre-persephone"],
    short="Queen of the gods, wife of Zeus, goddess of marriage and the protection of women and kings.",
    long="Hera is the queen of Olympus and Zeus's wife (and, in Hesiod, his sister) [S1]. Goddess of marriage, the family, and the protection of women, she is also the protector of kings and their authority — her wrath, famously, falls on those who dishonor the institution of marriage [S2][S3]. In the Iliad her long resentment of Zeus's many affairs drives much of the plot, and she takes the side of the Greeks [S2]. Her sacred animals include the peacock and the cow (Io, a maiden she transformed into a heifer, is her most famous victim-turned-cow) [S2][S5]. Hera was worshipped at Argos, Samos, and elsewhere; the Heraion at Samos was one of the great sanctuaries [S6].",
    facts=["Io, the mistress of Zeus, was turned into a heifer by jealous Hera — a foundational myth of her cult [S2][S5].",
           "The peacock feathers on her throne are said to be the eyes of the hundred-eyed Argus [S5]."],
    unc=["Hera's 'jealousy' is a literary characterization prominent in Homer; cult practice emphasized her as a benevolent marriage-goddess [S2][S6]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-hades","Hades","ᾍδης",["Pluto (Roman)"],"deity","male",
    ["the dead","wealth (underground)","the underworld"],
    symbols=["bident","key","cornucopia","helmet of invisibility (Kerberos-guard)"],
    animals=["dog (Cerberus)","serpent"],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-zeus","gre-hera","gre-poseidon","gre-demeter","gre-hestia"],
    partners=["gre-persephone"],
    children=[],
    realms=["gre-underworld"],
    myths=["gre-persephone","gre-orpheus-eurydice"],
    short="God and ruler of the underworld, lord of the dead and of the wealth of the earth; he seized Persephone to be his queen.",
    long="Hades (the Roman Pluto) is the god and king of the underworld, the realm of the dead [S2][S3]. One of the first-born sons of Cronus and Rhea, he was swallowed at birth and later disgorged by Zeus [S1]. When the world was divided, Hades received the third of it: the underworld [S1]. His most defining act is the seizure of Persephone (daughter of Demeter) to be his queen, which set in motion the myth of the seasons [S4][S5]. Though often conflated with his realm, Hades is a distinct deity: a stern, just, and not especially evil ruler of the dead, who rarely leaves his domain [S2][S3][S5]. The name 'Hades' came to mean the place itself (the underworld) as well as its god — a shift the sources make clear [S2].",
    facts=["The 'Hades' as a place vs. Hades the god are distinct — a common modern confusion [S2].",
           "He rarely leaves the underworld; when he does, it is for Persephone [S4][S5].",
           "The Cornucopia (horn of plenty) is a symbol of his wealth of the earth [S5]."],
    unc=["Hades is not 'the god of evil' — that is a later conflation with the Christian Satan; in Greek myth he is a stern but just ruler of the dead [S2][S3][S5]."],
    srcs=[SRC_ILIAD, SRC_ODYSSEY, SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-hades-persephone-relief"], hero="gre-art-hades-persephone-relief")

ent("gre-poseidon","Poseidon","Ποσειδών",["Neptune (Roman)"],"deity","male",
    ["the sea","earthquakes","horses","storms"],
    symbols=["trident","horse","bull","waves"],
    animals=["horse","bull","dolphin"], weapons=["trident"],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-zeus","gre-hera","gre-hades","gre-demeter","gre-hestia"],
    partners=[],
    children=[],
    enemies=["gre-zeus","gre-athena"],
    realms=["gre-sea"],
    myths=["gre-creation","gre-athena-athens","gre-odysseus-kyklops"],
    short="God of the sea, earthquakes, and horses; brother and rival of Zeus, and rival of Athena for Athens.",
    long="Poseidon (Neptune) is the god of the sea, of earthquakes (he was 'the Earth-shaker'), and of horses — the animals he is said to have created [S1][S2]. Brother of Zeus and Hades, he received the sea when the world was divided [S1]. His rivalry with Zeus for supremacy runs through much of the Iliad, where he is a major (though restrained) actor [S2]. He contested Athena for the patronage of the city that bears his rival's name: he struck the rock and sent forth a salt spring (or, in some accounts, a horse); Athena gave the olive tree, and the city chose her [S5][S6]. He is a father of many — to gods, heroes (e.g. the hero Theseus's divine father is Poseidon in one tradition), and sea-creatures; his most famous confrontation with a mortal is his blinding of Odysseus's son Telegonos and his anger at the blinding of his son the Cyclops Polyphemus by Odysseus [S3].",
    facts=["He is 'Earth-shaker' (ennosigen) — god of earthquakes as well as the sea [S1][S2].",
           "He is credited with creating the horse [S5].",
           "Rival of Athena for Athens — he gave the sea/spring, she gave the olive [S5][S6]."],
    unc=["Poseidon's 'rivalry' with Zeus is literary (Iliad); in cult he was a benevolent local patron at many coastal sites [S2][S6]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_ODYSSEY, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-poseidon-stat","gre-art-poseidon-stat2","gre-art-panathenaic-leagros"], hero="gre-art-poseidon-stat")

ent("gre-athena","Athena","Ἀθηνᾶ",["Minerva (Roman)"],"deity","female",
    ["wisdom","war (strategy)","craft","city","reason"],
    symbols=["owl","olive","Aegis","spear","shield"],
    animals=["owl","snake","goat (Amalthea)"],
    weapons=["spear","Aegis","shield (Aegis)"],
    parents=["gre-zeus"],
    siblings=[], partners=[],
    children=[],
    enemies=["gre-poseidon"],
    realms=["gre-olympus"],
    places=["Athens"],
    myths=["gre-athena-birth","gre-athena-athens","gre-pandora","gre-odysseus-kyklops"],
    short="Goddess of wisdom, strategic war, and craft; born fully-formed from Zeus's head; patron of Athens.",
    long="Athena is the goddess of wisdom, strategic warfare, and craft (crafts of the city, weaving, and the arts) [S1][S2][S4]. She is born in a remarkable and unique way: from the head of Zeus, fully grown and armored, after Zeus swallowed her mother Metis (the goddess of cunning) when pregnant, on the advice that their child would surpass him [S1][S4][S5]. (In the Theogony her mother is Metis; the Iliad names her mother as Metis too, though a variant gives Dione — a minor discrepancy we note.) [S1][S2] She is the patron deity of Athens (the Parthenon was her temple), and her rivalry with Poseidon over the city's patronage is one of the founding myths of Athens — she gave the olive tree and won [S5][S6]. She is the protector of heroes (Odysseus, Perseus, Theseus, Odysseus's son Telemachus), and she is associated with reason, law, and the city-state (polis) [S2][S3][S6].",
    facts=["Born fully armed from Zeus's head [S1][S4].",
           "Patron of Athens — the Parthenon was her temple [S6].",
           "Gave the olive tree, winning Athens over Poseidon [S5][S6].",
           "Protector of heroes: Odysseus, Perseus, Theseus [S2][S3][S5]."],
    unc=["Her mother is Metis in the Theogony and Iliad (a variant gives Dione in the Iliad) — stored as a minor variant [S1][S2]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-athena-stat","gre-art-athena-cameo","gre-art-athena-lekythos","gre-art-panathenaic-kleophrades"], hero="gre-art-athena-stat")

ent("gre-apollo","Apollo","Ἀπόλλων",["Appolō"],"deity","male",
    ["sun (later)","music","poetry","prophecy","medicine","archery"],
    symbols=["lyre","bow","laurel","sun (later association)"],
    animals=["swan","raven","cicada","python"],
    weapons=["bow and arrow"],
    parents=["gre-zeus","gre-let-o"],
    siblings=["gre-artemis"],
    partners=[],
    children=["gre-asclepius"],
    realms=["gre-olympus"],
    places=["Delphi","Pythia"],
    myths=["gre-python-slaying","gre-cassandra","gre-narcissus"],
    short="God of the sun (in later association), music, poetry, prophecy, medicine, and archery; twin of Artemis.",
    long="Apollo is a god of many domains, and his identity shifted across the Greek world: earliest a god associated with light, youth, and the archery, he came to be strongly identified with the sun (a Hellenistic development — the 'sun-god' Apollo is later than the archer Apollo) [S4][S5]. He is the god of music (lyre), poetry (the Muse-calling), prophecy (his oracle at Delphi, the Pythia), medicine (his son Asclepius), and archery [S4][S5][S6]. He is the twin brother of Artemis, and both are children of Zeus and Leto (Latona) [S4]. As a child he slew the Python that guarded the Delphic oracle, founding his sanctuary there [S4][S5]. He is also a god of plague (he sent the arrow-plague on the Greeks in the Iliad's opening) and of its healing — a duality the sources preserve [S2][S4].",
    facts=["Twin of Artemis, both children of Zeus and Leto [S4].",
           "Slew the Python at Delphi, founding his oracle there [S4][S5].",
           "The 'sun-god' Apollo is a later (Hellenistic) identification; the earliest Apollo is an archer [S4][S5].",
           "God of both plague and healing (sent the Iliad's plague; his son Asclepius heals) [S2][S4]."],
    unc=["Apollo's 'sun' association is later than his archer identity — we present both and date the shift [S4][S5]."],
    srcs=[SRC_HYMN, SRC_ILIAD, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-artemis","Artemis","Ἄρτεμις",["Diana (Roman)"],"deity","female",
    ["the hunt","wild animals","the moon (later)","virginity","birth"],
    symbols=["bow","crescent moon (later)","deer"],
    animals=["deer","bears","dogs"],
    weapons=["bow and arrow"],
    parents=["gre-zeus","gre-let-o"],
    siblings=["gre-apollo"],
    partners=[],
    realms=["gre-olympus"],
    places=["Ephesus","Brauron"],
    myths=["gre-actaeon","gre-orion","gre-arachne"],
    short="Goddess of the hunt, wild animals, and (in later association) the moon; twin of Apollo; protector of young women.",
    long="Artemis (Diana) is the goddess of the hunt, wild animals, and the wilderness, and the protector of young girls and of childbirth (she is a midwife-goddess in some cults) [S4][S5][S6]. Twin of Apollo, daughter of Zeus and Leto, she asked Zeus for eternal virginity and for the gifts of the hunt [S4][S5]. In later (Hellenistic/Roman) association she was linked to the moon (a development parallel to Apollo's link to the sun) [S4][S5]. She is a powerful, sometimes vengeful goddess: Actaeon was turned into a stag and torn by his own hounds for seeing her bathing; Orion was punished for his arrogance; Arachne was transformed for her hubristic weaving [S4][S5]. Her great sanctuary was at Ephesus (the Temple of Artemis, one of the Seven Wonders) and at Brauron in Attica [S6].",
    facts=["Twin of Apollo, daughter of Zeus and Leto [S4].",
           "Asked Zeus for eternal virginity and the gift of the hunt [S4][S5].",
           "Temple at Ephesus was one of the Seven Wonders of the Ancient World [S6].",
           "The 'moon' association is later (Hellenistic/Roman), parallel to Apollo's sun [S4][S5]."],
    unc=["Artemis's 'moon' link is a later development; the earliest Artemis is a huntress of the wilderness [S4][S5]."],
    srcs=[SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-ares","Ares","Ἄρης",["Mars (Roman)"],"deity","male",
    ["war (violence, bloodshed)"],
    symbols=["sword","helmet","boar"],
    animals=["boar","vulture","dog"],
    weapons=["sword","spear"],
    parents=["gre-zeus","gre-hera"],
    siblings=["gre-hebe","gre-ileitithyia"],
    partners=["gre-aphrodite"],
    children=[],
    enemies=["gre-athena"],
    realms=["gre-olympus"],
    myths=["gre-ares-aphrodite-caught"],
    short="God of the violent, bloodier aspect of war; son of Zeus and Hera; lover of Aphrodite.",
    long="Ares (Mars) is the god of war — specifically its violent, brutal, blood-soaked aspect, as opposed to Athena's strategic, disciplined side of war [S2][S4]. Son of Zeus and Hera, he is one of the few Olympians born of a union that required no pregnancy in the usual sense (Hera 'conceived' him, in one account, without a consort) [S4][S5]. He is a major character in the Iliad, where he is a fierce combatant but is also treated with a mix of awe and disdain — the Greeks call him 'the hound of war' [S2]. His most famous myth is his affair with Aphrodite, caught in the act by her husband Hephaestus and displayed before the assembled gods in shame [S2][S5].",
    facts=["God of war's violent side, contrasted with Athena's strategic side [S2][S4].",
           "Caught in an affair with Aphrodite by Hephaestus — a famous shame-myth [S2][S5]."],
    unc=["Ares's 'born without a consort' account is one variant; the standard is Zeus & Hera [S4][S5]."],
    srcs=[SRC_ILIAD, SRC_HYMN, SRC_APPOLLOD],
    art=[])

ent("gre-aphrodite","Aphrodite","Ἀφροδίτη",["Venus (Roman)"],"deity","female",
    ["love","beauty","desire","fertility","sex"],
    symbols=["dove","mirror","myrtle","cypress"],
    animals=["dove","swan","sparrow","cat (later)"],
    parents=["gre-ouranos"],  # primary: born of Ouranos
    siblings=[],
    partners=["gre-ares","gre-hephaestus"],
    children=["gre-eros","gre-phobos","gre-deimos"],
    realms=["gre-olympus"],
    myths=["gre-aphrodite-birth","gre-aphrodite-adonis","gre-ares-caught"],
    short="Goddess of love, beauty, and desire; born (in the Theogony) from the sea-foam around a severed divine member.",
    long="Aphrodite (Venus) is the goddess of love, beauty, desire, and sexual love [S1][S4][S5]. Her birth is one of the great variants in Greek myth: in Hesiod's Theogony she is born from the sea-foam that gathered around the severed member of Ouranos (cast into the sea by Cronus), rising fully formed at Cythera [S1]; in the Iliad she is the daughter of Zeus and Dione [S2]. Both accounts are preserved and the difference is genuine [S1][S2]. She is married to Hephaestus (the smith-god) but famously lovers with Ares; her children include Eros (Love) and, with Ares, Phobos (Fear) and Deimos (Dread) [S4][S5]. The Homeric Hymn to Aphrodite opens with her power over gods and mortals alike [S4].",
    facts=["Two birth-accounts: sea-foam from Ouranos (Theogony) vs. daughter of Zeus & Dione (Iliad) — a genuine variant [S1][S2].",
           "Married to Hephaestus, lovers with Ares [S4][S5].",
           "Mother of Eros (Love) [S4][S5]."],
    unc=["The two birth-accounts are incompatible and both are canonical; we present them side by side, not as one [S1][S2]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_HYMN, SRC_APPOLLOD],
    art=["gre-art-aphrodite-eros","gre-art-aphrodite-stat","gre-art-aphrodite-medici"], hero="gre-art-aphrodite-eros")

ent("gre-hermes","Hermes","Ἑρμῆς",["Mercury (Roman)"],"deity","male",
    ["messengers","travelers","thieves","commerce","cattle","the boundary","guiding the dead"],
    symbols=["caduceus (winged staff)","winged sandals","helmet","messenger wings"],
    animals=["tortoise","rooster","goat (Amalthea)"],
    parents=["gre-zeus","gre-maia"],
    siblings=[], partners=[],
    children=["gre-faunus"],
    realms=["gre-olympus","gre-underworld"],
    myths=["gre-hermes-cattle-theft","gre-hermes-psychopomp"],
    short="Messenger of the gods, god of travelers, commerce, and thieves; guide of souls to the underworld (psychopomp).",
    long="Hermes (Mercury) is the messenger of the gods and the god of a remarkably wide range of activities: travelers, commerce, cattle, thievery (he is the divine patron of cunning and the 'trickster'), and the boundary (he is Hermes 'the guide' at crossroads) [S1][S2][S4][S5]. Son of Zeus and the nymph Maia, he is a child-prodigy: on the day of his birth he stole Apollo's cattle and invented the lyre from a tortoise shell, then traded it to Apollo [S4][S5]. His most solemn role is as psychopomp — the guide who leads the souls of the dead to the underworld (he escorts Persephone, he guides Odysseus's crew's dead, etc.) [S3][S4]. He is the patron of thieves, merchants, and travelers, and his wand (the caduceus, winged and entwined by two serpents) is his signature [S4][S5].",
    facts=["Stole Apollo's cattle the day he was born and invented the lyre [S4][S5].",
           "Psychopomp — guide of the dead to the underworld [S3][S4].",
           "The caduceus (winged staff) is his signature [S4][S5].",
           "Patron of thieves, merchants, and travelers [S4][S5]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_ODYSSEY, SRC_HYMN, SRC_APPOLLOD],
    art=["gre-art-hermes-stat","gre-art-hermes-propylaios","gre-art-hermes-polykleitos"], hero="gre-art-hermes-stat")

ent("gre-dionysus","Dionysus","Διόνυσος",["Bacchus (Roman)"],"deity","male",
    ["wine","ecstasy","theater","fertility","the vine","transformation"],
    symbols=["vine","grape","ivy","thyrsus (staff)"],
    animals=["panther","snake","bull"],
    parents=["gre-zeus","gre-semele"],
    siblings=[], partners=["gre-ariadne"],
    children=["gre-hepaestus","gre-faunus"],
    realms=["gre-olympus"],
    myths=["gre-dionysus-birth","gre-dionysus-indo-europeans"],
    short="God of wine, ecstasy, theater, and fertility; the only Olympian born of a mortal mother (Semele).",
    long="Dionysus (Bacchus) is the god of wine, vine, ecstasy, theater, and fertility — a liminal, dual-natured god whose festivals (the Dionysia) were central to Athenian civic and religious life [S4][S5][S6]. He is the only Olympian born of a mortal mother: his mother Semele, a mortal princess, was persuaded by Hera to demand proof of Zeus's divinity (a bolt of lightning), and was destroyed by it; Zeus saved the unborn child by sewing him into his thigh until he was ready to be born [S5]. (This is the standard account; a variant gives a double birth.) [S5] He is the patron of the theater — the great tragedy and comedy festivals at Athens were in his honor [S6]. He is a god of transformation and ecstasy, and his followers (the Maenads) are in a state of divine frenzy [S5][S6].",
    facts=["Only Olympian born of a mortal mother (Semele) [S5].",
           "Patron of the theater — the Athenian Dionysia celebrated him [S6].",
           "God of wine, ecstasy, and transformation [S4][S5]."],
    unc=["A 'double birth' (Semele then Zeus's thigh) is one account; we note the variant [S5]."],
    srcs=[SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-hephaestus","Hephaestus","Ἡφαῖστος",["Vulcan (Roman)"],"deity","male",
    ["fire","the forge","craft","volcanoes","smithing"],
    symbols=["hammer","tongs","anvil"],
    animals=["goat"],
    parents=["gre-hera"],
    siblings=[], partners=["gre-aphrodite"],
    children=["gre-ares","gre-faunus"],
    enemies=["gre-zeus"],
    realms=["gre-underground-forge"],
    myths=["gre-hephaestus-zeus-throne","gre-hephaestus-aphrodite-net"],
    short="God of fire and the forge, the divine smith who made the gods' weapons; married to Aphrodite.",
    long="Hephaestus (Vulcan) is the god of fire, the forge, and craft — the divine blacksmith who made the gods' finest weapons and treasures, including Zeus's thunderbolt and his own net that caught Ares and Aphrodite [S1][S2][S4][S5]. His parentage is a genuine variant: in the Iliad he is the son of Hera alone (Hera, spurned by Zeus, produced him without a consort, in a fit of spite); in the Theogony he is the son of Zeus and Hera [S1][S2]. He is lame (in one account he was thrown from Olympus by Zeus and crippled in the fall) and dwells in an underground forge, often associated with volcanoes [S2][S4][S5]. Despite his ugliness and lameness, he is the only god who can match Zeus in craft, and he is married to the beautiful Aphrodite (a union that is itself a source of myth, given her affair with Ares) [S2][S4][S5].",
    facts=["Made Zeus's thunderbolt and the net that caught Ares & Aphrodite [S1][S2][S4][S5].",
           "Two parentage accounts: Hera alone (Iliad) vs. Zeus & Hera (Theogony) — a genuine variant [S1][S2].",
           "Lame; dwells in an underground forge, linked to volcanoes [S2][S4][S5]."],
    unc=["His parentage (Hera alone vs. Zeus & Hera) is a real variant between the Iliad and Theogony; we store both [S1][S2]."],
    srcs=[SRC_THEOGONY, SRC_ILIAD, SRC_HYMN, SRC_APPOLLOD],
    art=[])

ent("gre-demeter","Demeter","Δημήτηρ",["Ceres (Roman)"],"deity","female",
    ["harvest","the grain","fertility","the seasons"],
    symbols=["wheat","sheaf","torch","pig"],
    animals=["pig","serpent"],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-zeus","gre-hera","gre-hades","gre-poseidon","gre-hestia"],
    partners=[],
    children=["gre-persephone"],
    realms=["gre-olympus"],
    places=["Eleusis"],
    myths=["gre-persephone","gre-eleusinian-mysteries"],
    short="Goddess of the harvest and the grain; mother of Persephone; her grief at Persephone's abduction set the seasons in motion.",
    long="Demeter (Ceres) is the goddess of the harvest, the grain, and the fertility of the earth [S1][S4][S5]. One of the first-born children of Cronus and Rhea (swallowed and later disgorged by Zeus), she is the mother of Persephone [S4][S5]. Her defining myth is the abduction of Persephone by Hades: in her grief, Demeter withdrew the fertility of the earth, and the world went cold and barren until a compromise was reached — Persephone would spend part of the year with her mother (spring/summer) and part in the underworld (autumn/winter), giving rise to the cycle of the seasons [S4][S5]. Her great sanctuary was at Eleusis, where the Eleusinian Mysteries (a secret initiation cult) were held in her and Persephone's honor [S6].",
    facts=["Her grief at Persephone's abduction is the origin of the seasons [S4][S5].",
           "The Eleusinian Mysteries at Eleusis were her great cult [S6].",
           "Mother of Persephone [S4][S5]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-eleusinian-relief"], hero="gre-art-eleusinian-relief")

ent("gre-persephone","Persephone","Περσεφόνη",["Proserpina (Roman)"],"deity","female",
    ["the underworld","spring","vegetation","the dead"],
    symbols=["pomegranate","torch","lily"],
    animals=["lily","bee"],
    parents=["gre-demeter"],
    siblings=[], partners=["gre-hades"],
    children=[],
    realms=["gre-underworld"],
    myths=["gre-persephone"],
    short="Queen of the underworld, wife of Hades, daughter of Demeter; her annual return to earth gives spring.",
    long="Persephone (Proserpina) is the daughter of Demeter and Zeus, and the queen of the underworld as wife of Hades [S4][S5]. Her story is the founding myth of the seasons: Hades abducts her (in some accounts she is plucking flowers in a meadow) to be his queen; Demeter's grief withholds the earth's fertility; a compromise is reached whereby Persephone spends part of the year (the warmer months) on earth with her mother and part (the colder months) in the underworld with Hades [S4][S5]. The detail that made the arrangement binding: while in the underworld she ate six pomegranate seeds, and so was bound to return to the dead for a portion of each year [S4][S5]. She is both a spring/vegetation goddess and the queen of the dead — a dual role the sources preserve without resolving the tension [S4][S6].",
    facts=["Ate six pomegranate seeds in the underworld, binding her to return each year [S4][S5].",
           "Her annual return to earth is the mythic origin of spring [S4][S5].",
           "Queen of the underworld as Hades's wife [S4][S5]."],
    unc=["The 'six pomegranate seeds' detail is from the Orphic Hymns and later tradition, not the Homeric Hymn to Demeter (which gives the season-compromise without the seeds) — we note the layering [S4][S5]."],
    srcs=[SRC_HYMN, SRC_APPOLLOD, SRC_PAUS],
    art=["gre-art-hades-persephone-relief"], hero="gre-art-hades-persephone-relief")

ent("gre-hestia","Hestia","Ἑστία",[],"deity","female",
    ["hearth","the home","domesticity","sacrifice"],
    symbols=["hearth-fire","brazier"],
    animals=[],
    parents=["gre-cronus","gre-rhea"],
    siblings=["gre-zeus","gre-hera","gre-hades","gre-poseidon","gre-demeter"],
    partners=[],
    children=[],
    realms=["gre-olympus"],
    myths=[],
    short="Goddess of the hearth and the home, the eldest of the Olympians; she renounced a seat on Olympus to let Zeus divide the world.",
    long="Hestia is the goddess of the hearth, the home, and the domestic flame — the eldest of the first-born children of Cronus and Rhea [S1][S5]. She is a serene, non-combative deity, and in one famous account she renounced her place among the twelve Olympians, yielding her seat so that the world could be divided (or so that Dionysus could take it) [S5]. Her cult was the first sacrifice offered at the opening of any public gathering, and the hearth (hearth-fire) was the center of the Greek home and the city [S6]. She is a figure of domestic stability and continuity rather than dramatic myth.",
    facts=["Eldest of the first-born Olympians [S1].",
           "Renounced her Olympian seat (in one account) to make room for Dionysus [S5].",
           "The hearth-fire was the center of home and city; her sacrifice opened public gatherings [S6]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD, SRC_PAUS],
    art=[])

# ---- Leto & other ----
ent("gre-let-o","Leto","Λητώ",["Latona (Roman)"],"deity","female",
    ["motherhood (as mother of Apollo/Artemis)"],
    symbols=[],
    animals=["swan"],
    parents=[],
    siblings=[], partners=["gre-zeus"],
    children=["gre-apollo","gre-artemis"],
    myths=[],
    short="Titaness, mother of Apollo and Artemis by Zeus.",
    long="Leto (Latona) is a Titaness, daughter of Coeus and Phoebe, and the mother of Apollo and Artemis by Zeus [S1][S4]. She is a relatively minor figure in the myths but central as the mother of the twin gods. Her pregnancy was pursued by Hera's jealousy (she was barred from giving birth on the dry land of the earth, and gave birth on the floating island of Delos) [S4][S5].",
    facts=["Mother of Apollo and Artemis [S4].",
           "Barred from giving birth on earth by Hera; gave birth on Delos [S4][S5]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_HYMN, SRC_APPOLLOD],
    art=[])

ent("gre-metis","Metis","Μῆτις",[],"deity","female",
    ["counsel","cunning","wisdom"],
    symbols=[],
    animals=[],
    parents=[],
    siblings=[], partners=["gre-zeus"],
    children=["gre-athena"],
    myths=["gre-athena-birth"],
    short="Titaness of counsel and cunning; mother of Athena; swallowed by Zeus, from whose head Athena was born.",
    long="Metis is a Titaness, the personification of counsel and cunning, and the first wife of Zeus [S1][S4][S5]. A prophecy said that their child would overthrow Zeus as he had overthrown Cronus, so Zeus swallowed Metis while she was pregnant with Athena; Athena was then born fully formed from Zeus's head [S1][S4][S5]. Metis is thus the mother of Athena and a symbol of the cunning wisdom that Zeus embodies.",
    facts=["Mother of Athena [S1][S4].",
           "Swallowed by Zeus to avert the prophecy that their child would overthrow him [S1][S4][S5]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_HYMN, SRC_APPOLLOD],
    art=[])

# ---- Heroes & monsters ----
ent("gre-perseus","Perseus","Περσεύς",[],"hero","male",
    ["heroism","the slaying of Medusa"],
    symbols=["sickle","winged sandals","mirror-shield"],
    animals=["horse (Pegasus)"],
    weapons=["sickle (harpe)"],
    parents=["gre-zeus","gre-danae"],
    siblings=[], partners=["gre-andromeda"],
    children=[],
    enemies=["gre-medusa"],
    realms=["gre-earth"],
    myths=["gre-perseus-medusa","gre-andromeda"],
    short="Hero who slew the Gorgon Medusa and rescued Andromeda; aided by Athena, Hermes, and the gift of winged sandals.",
    long="Perseus is the hero who slew the Gorgon Medusa and rescued the maiden Andromeda from the sea-monster Cetus [S4][S5]. Son of Zeus and the Danaid Danaë, he was sent to fetch Medusa's head by the tyrant Polydectes; aided by Athena (who gave him a mirror-shield), Hermes (who gave him winged sandals and a sickle), and the Naiads, he beheaded Medusa — and from her blood sprang the winged horse Pegasus [S5]. He then rescued Andromeda, who was being offered to Cetus, and took her as his wife [S5]. Perseus is one of the canonical Greek heroes, and his story is a model of the divinely-aided hero.",
    facts=["Slew Medusa and rescued Andromeda [S5].",
           "Pegasus (the winged horse) sprang from Medusa's blood [S5].",
           "Aided by Athena (mirror-shield) and Hermes (winged sandals, sickle) [S5]."],
    unc=[],
    srcs=[SRC_HYMN, SRC_APPOLLOD],
    art=["gre-art-perseus-mirror"], hero="gre-art-perseus-mirror")

ent("gre-medusa","Medusa","Μέδουσα",[],"monster","female",
    ["the Gorgon","the petrifying gaze"],
    symbols=["snakes for hair"],
    animals=["snakes (for hair)"],
    parents=["gre-echidna"],
    siblings=[],
    partners=[],
    children=[],
    enemies=["gre-perseus"],
    myths=["gre-perseus-medusa"],
    short="The Gorgon with snakes for hair whose gaze turned viewers to stone; slain by Perseus.",
    long="Medusa is one of the three Gorgon sisters (with Stheno and Euryale), and the only one who was mortal; her hair was living snakes and her gaze turned any who met it to stone [S4][S5]. In the standard account (Ovid, building on earlier tradition) she was a beautiful maiden transformed into a monster (in Ovid, for her hubris and for an offense against Athena), and she was slain by Perseus, who used Athena's mirror-shield to avoid meeting her gaze [S5]. (In Hesiod's earlier Theogony the Gorgons are monstrous from the start, daughters of the sea-gods Phorcys and Ceto — the 'beautiful maiden' version is later, from Ovid.) [S1][S5] From her severed neck sprang the winged horse Pegasus and the giant Chrysaor [S1][S5].",
    facts=["Her gaze turned viewers to stone [S4][S5].",
           "Sln by Perseus using Athena's mirror-shield [S5].",
           "Pegasus and Chrysaor sprang from her blood [S1][S5].",
           "The 'beautiful maiden' version is later (Ovid); Hesiod's Gorgons are monstrous from birth [S1][S5]."],
    unc=["The 'transformed from a beautiful maiden' account is Ovid's (Roman, later); the earlier Greek account (Hesiod) has her as a monstrous Gorgon from birth. Both stored [S1][S5]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD],
    art=["gre-art-gorgon-olpe"], hero="gre-art-gorgon-olpe")

ent("gre-typhon","Typhon","Τυφώνας",["Typhoeus"],"monster","male",
    ["the great monster","chaos"],
    symbols=[],
    animals=["hundred heads (in some accounts)"],
    parents=["gre-gaia"],
    siblings=[], partners=["gre-echidna"],
    children=["gre-cerberus","gre-echidna-children"],
    enemies=["gre-zeus"],
    myths=["gre-typhon-zeus"],
    short="The greatest of the monsters, born of Gaia to avenge the Titans; he was the only being to seriously wound Zeus before being overthrown.",
    long="Typhon (Typhoeus) is the greatest and most terrifying of the Greek monsters, a hundred-headed (in some accounts) offspring of Gaia, born (in the Theogony, in a passage widely judged to be a later interpolation) to avenge the defeat of the Titans [S1]. He warred against the gods and was the only creature to seriously wound Zeus (who was cut and whose sinews were cut, causing him to fall) before Zeus recovered, regained his thunderbolt, and buried Typhon under Mount Etna — whose fires are explained as Typhon's breathing [S1][S5]. He is the father (with the monster Echidna) of many of the great monsters of Greek myth, including Cerberus, the Hydra, and the Chimera [S1][S5].",
    facts=["The only creature to seriously wound Zeus [S1].",
           "Buried under Mount Etna; its fires are his breathing [S1][S5].",
           "Father (with Echidna) of Cerberus, the Hydra, the Chimera, and others [S1][S5]."],
    unc=["The Typhon passage in the Theogony (lines 810–835) is widely regarded as a later interpolation, not Hesiod's own — we flag it [S1]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD],
    art=[])

ent("gre-cerberus","Cerberus","Κέρβερος",[],"monster","male",
    ["the guardian of the underworld"],
    symbols=["three heads","serpent tail"],
    animals=["(is) a dog"],
    parents=["gre-typhon","gre-echidna"],
    siblings=["gre-hydra","gre-chimera"],
    partners=[],
    children=[],
    enemies=["gre-heracles"],
    realms=["gre-underworld"],
    myths=["gre-heracles-cerberus"],
    short="The three-headed hound that guards the gates of the underworld, preventing the dead from leaving.",
    long="Cerberus is the three-headed hound that guards the gates of the underworld, preventing the dead from leaving and the living from entering unbidden [S1][S3][S5]. Son of the monsters Typhon and Echidna (and sibling to the Hydra and the Chimera), he is one of the great 'impossible' creatures of Greek myth [S1][S5]. His capture is the final (twelfth) labor of Heracles, who wrestled him down and brought him to the surface without killing him [S5].",
    facts=["Three-headed; guards the gates of the underworld [S3][S5].",
           "Captured by Heracles as his final labor [S5].",
           "Son of Typhon and Echidna [S1]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_ODYSSEY, SRC_APPOLLOD],
    art=[])

# ---- Heroes ----
ent("gre-heracles","Heracles","Ἡράκλεια",["Hercules (Roman)"],"hero","male",
    ["strength","heroism","the twelve labors"],
    symbols=["club","Nemean lion skin","bow"],
    animals=["Nemean lion"],
    weapons=["club","bow"],
    parents=["gre-zeus","gre-alcmena"],
    siblings=[], partners=[],
    children=[],
    enemies=["gre-hera"],
    myths=["gre-heracles-labors","gre-heracles-cerberus"],
    short="The greatest of the Greek heroes, son of Zeus; he performed the twelve labors and was raised to Olympus.",
    long="Heracles (Hercules) is the greatest of the Greek heroes, the son of Zeus and the mortal Alcmena [S2][S5]. Driven to madness by Hera (who resented Zeus's affair with Alcmena) he killed his own children, and was later set to perform the twelve labors by King Eurystheus as penance — including capturing Cerberus, slaying the Nemean lion, and capturing the Cretan bull [S5]. After his death (he was burned on a pyre, set up by his wife or by fate), he was raised to Olympus and married the goddess Hebe [S5]. He is the model of the strength-hero, and his cult was widespread; he was a patron of athletes and of the city of Thebes (his birthplace) [S6].",
    facts=["Son of Zeus and the mortal Alcmena [S2][S5].",
           "Performed the twelve labors for Eurystheus [S5].",
           "Captured Cerberus as his final labor [S5].",
           "Raised to Olympus after his death; married Hebe [S5]."],
    unc=[],
    srcs=[SRC_ILIAD, SRC_APPOLLOD, SRC_PAUS],
    art=[])

ent("gre-odysseus","Odysseus","Ὀδυσσεύς",["Ulysses (Latin)"],"hero","male",
    ["cunning","the journey home","wit"],
    symbols=["bow","the Ithacan home"],
    animals=[],
    weapons=["bow"],
    parents=[],
    siblings=[], partners=["gre-penelope"],
    children=["gre-telemachus"],
    enemies=[],
    places=["Ithaca"],
    myths=["gre-odysseus-kyklops","gre-odysseus-trojan"],
    short="The cunning king of Ithaca, hero of the Odyssey; his ten-year journey home from Troy is a foundational epic.",
    long="Odysseus (Ulysses) is the king of Ithaca and the hero of Homer's Odyssey — the epic of his ten-year journey home from the Trojan War [S3]. A man of extraordinary cunning (his name is associated with 'metis,' cunning intelligence), he devised the Wooden Horse that won the Trojans the war [S2][S3], and he overcame a succession of monsters and gods on his way home: the Cyclops Polyphemus (whom he blinded and outwitted, calling himself 'Nobody'), the witch Circe, the Sirens, Scylla and Charybdis, and the cattle of the sun [S3]. His defining qualities are wit, endurance, and the desire to return home (nostos) to his wife Penelope and son Telemachus [S3].",
    facts=["Devised the Wooden Horse that ended the Trojan War [S2][S3].",
           "Blinded and outwitted the Cyclops Polyphemus (calling himself 'Nobody') [S3].",
           "His ten-year journey home is the subject of the Odyssey [S3].",
           "King of Ithaca; husband of Penelope, father of Telemachus [S3]."],
    unc=[],
    srcs=[SRC_ILIAD, SRC_ODYSSEY],
    art=[])

# ---- Maia (Hermes's mother) ----
ent("gre-maia","Maia","Μαῖα",[],"deity","female",
    ["the nymph","mother of Hermes"],
    symbols=[],
    animals=[],
    parents=["gre-atlas"],
    siblings=[], partners=["gre-zeus"],
    children=["gre-hermes"],
    myths=[],
    short="Nymph, daughter of the Titan Atlas, and mother of Hermes by Zeus.",
    long="Maia is a nymph, one of the Pleiades (daughters of the Titan Atlas and the oceanid Pleione), and the mother of Hermes by Zeus [S1][S4][S5]. She is a minor figure, known chiefly as Hermes's mother; the Homeric Hymn to Hermes opens with her nursing the infant god in a cave [S4].",
    facts=["Mother of Hermes by Zeus [S4].",
           "One of the Pleiades, daughter of Atlas [S1][S4]."],
    unc=[],
    srcs=[SRC_THEOGONY, SRC_HYMN, SRC_APPOLLOD],
    art=[])

# ---- Atlas (Titan, father of the Pleiades) ----
ent("gre-atlas","Atlas","Ἄτλας",[],"deity","male",
    ["the sky (bore)"],
    symbols=[],
    animals=[],
    parents=[],
    siblings=[], partners=["gre-pleione"],
    children=["gre-maia","gre-pleiades"],
    myths=["gre-atlas-sky"],
    short="Titan condemned to hold up the sky (or the heavens) for eternity; father of the Pleiades.",
    long="Atlas is a Titan, son of Iapetus, who was punished by Zeus after the Titanomachy for siding with the Titans; he was condemned to hold up the sky (or the heavens) on his shoulders for eternity [S1][S5]. He is the father (with the oceanid Pleione) of the Pleiades, a group of sisters who were turned into stars [S1][S5]. He is also the father of the Hesperides and, in some accounts, of the Gorgons' mother Ceto. The 'holding up the sky' image is a later (post-Homeric) development; the earliest Atlas is a great Titan of strength [S5].",
    facts=["Condemned to hold up the sky after the Titanomachy [S1][S5].",
           "Father of the Pleiades (with Pleione) [S1][S5].",
           "The 'holding up the sky' image is later than the earliest accounts [S5]."],
    unc=["The 'holding up the sky' punishment is a later development; we date it [S5]."],
    srcs=[SRC_THEOGONY, SRC_APPOLLOD],
    art=[])

# ---- Danae (Perseus's mother) ----
ent("gre-danae","Danae","Δανάη",[],"mortal","female",
    ["the mortal mother of Perseus"],
    symbols=[],
    animals=[],
    parents=["gre-akeus"],
    siblings=[], partners=["gre-zeus"],
    children=["gre-perseus"],
    myths=["gre-perseus-medusa"],
    short="Mortal princess, daughter of King Acrisius of Argos; mother of Perseus by Zeus.",
    long="Danaë is a mortal princess, daughter of King Acrisius of Argos. When an oracle warned Acrisius that he would be overthrown by his grandson, he imprisoned Danaë in a bronze tower to prevent her from bearing a child. Zeus came to her (in the form of a shower of gold) and she bore Perseus [S5]. Acrisius later cast mother and son out in a chest, but they were saved; Perseus went on to become the hero who slew Medusa [S5].",
    facts=["Imprisoned by her father Acrisius to prevent the oracle's fulfillment [S5].",
           "Mother of Perseus by Zeus (who came to her as a shower of gold) [S5]."],
    unc=[],
    srcs=[SRC_APPOLLOD],
    art=[])

# ---- Semele (Dionysus's mother) ----
ent("gre-semele","Semele","Σεμέλη",[],"mortal","female",
    ["the mortal mother of Dionysus"],
    symbols=[],
    animals=[],
    parents=[],
    siblings=[], partners=["gre-zeus"],
    children=["gre-dionysus"],
    myths=["gre-dionysus-birth"],
    short="Mortal princess, mother of Dionysus by Zeus; destroyed by a bolt of lightning, from whose womb Zeus saved the unborn god.",
    long="Semele is a mortal princess (daughter of Cadmus of Thebes) who became the mistress of Zeus and bore him Dionysus. Hera, jealous, persuaded Semele to demand that Zeus prove his divinity by appearing to her in his full glory (a bolt of lightning); the mortal mother was destroyed by the lightning, but Zeus saved the unborn child by sewing it into his thigh until it was ready to be born [S5]. Semele's story is the origin of Dionysus's 'double birth' (first of Semele, then of Zeus).",
    facts=["Mortal mother of Dionysus by Zeus [S5].",
           "Destroyed by a bolt of lightning; Zeus saved the unborn Dionysus in his thigh [S5]."],
    unc=[],
    srcs=[SRC_APPOLLOD],
    art=[])


# ---- Minor-but-referenced figures (lightweight) ----
ent("gre-eros","Eros","Ἔρως",["Cupid (Roman)"],"deity","male",
    ["love","desire (primordial)"],
    parents=["gre-aphrodite"], siblings=[], partners=[],
    short="God of love and desire; in the Theogony a primordial force, in later myth the son of Aphrodite.",
    long="Eros (Cupid) is the god of love and desire. In Hesiod's Theogony he is a primordial being, born directly from Chaos — an impersonal force of attraction [S1]; in later myth he is the son of Aphrodite (and in some accounts of Ares), the winged child who drives gods and mortals to love [S4][S5]. The two conceptions coexist: the cosmic force and the charming child-god.",
    facts=["Primordial in the Theogony (born of Chaos); son of Aphrodite in later myth [S1][S5]."],
    unc=["Two conceptions (primordial force vs. Aphrodite's son) coexist across sources [S1][S4][S5]."],
    srcs=[SRC_THEOGONY, SRC_HYMN, SRC_APPOLLOD], art=[])

ent("gre-andromeda","Andromeda","Ἀνδρομέδα",[],"mortal","female",
    ["the rescued princess"],
    parents=[], siblings=[], partners=["gre-perseus"],
    short="Princess of Aethiopia, offered to the sea-monster Cetus and rescued by Perseus, who married her.",
    long="Andromeda is a princess of Aethiopia whose mother Cassiopeia (a queen) boasted that Andromeda was more beautiful than the Nereids; Poseidon sent the monster Cetus to ravage the coast, and Andromeda was chained to a rock as a sacrifice. Perseus, passing by, slew Cetus with the head of Medusa and rescued her, and she became his wife [S5].",
    facts=["Rescued from the sea-monster Cetus by Perseus [S5]."],
    unc=[], srcs=[SRC_APPOLLOD], art=[])

ent("gre-echidna","Echidna","Ἔχιδνα",[],"monster","female",
    ["the monster-mother"],
    parents=[], siblings=[], partners=["gre-typhon"],
    children=["gre-cerberus","gre-hydra","gre-chimera"],
    short="Half-woman, half-serpent monster who, with Typhon, mothered many of the great monsters of Greek myth.",
    long="Echidna is a half-woman, half-serpent creature who dwelt in a cave and, in partnership with the monster Typhon, mothered many of the great monsters of Greek myth, including Cerberus, the Lernaean Hydra, the Chimera, the Sphinx, and Orthrus [S1][S5]. She is the 'mother of monsters,' a source of the chthonic terror that the heroes of Greek myth must overcome.",
    facts=["Mother (with Typhon) of Cerberus, the Hydra, the Chimera, the Sphinx, and more [S1][S5]."],
    unc=[], srcs=[SRC_THEOGONY, SRC_APPOLLOD], art=[])

ent("gre-oceanus","Oceanus","Ὠκεανός",[],"deity","male",
    ["the great world-river","the sea (primordial)"],
    parents=["gre-gaia","gre-ouranos"], siblings=["gre-tethys","gre-cronus","gre-rhea"],
    partners=["gre-tethys"],
    short="Primordial Titan, personification of the great river that (in Greek thought) encircled the inhabited world.",
    long="Oceanus is the primordial Titan who personifies the great ocean-river that, in Greek cosmography, encircled the inhabited world (the oikoumene) [S1]. He is the eldest of the Titans and the consort of Tethys; together they are the parents of the rivers, the oceanids, and the winds [S1]. He is a vast, serene figure, more a cosmic boundary than an active god, but his role as the boundary of the world is cosmographically important.",
    facts=["The world-encircling river in Greek cosmography [S1].",
           "Consort of Tethys; parent of rivers and oceanids [S1]."],
    unc=[], srcs=[SRC_THEOGONY, SRC_APPOLLOD], art=[])

ent("gre-tethys","Tethys","Τηθυς",[],"deity","female",
    ["the primordial sea","the mother of rivers"],
    parents=["gre-gaia","gre-ouranos"], siblings=["gre-oceanus"],
    partners=["gre-oceanus"],
    short="Primordial Titaness, consort of Oceanus and mother of the rivers and oceanids.",
    long="Tethys is a primordial Titaness, daughter of Gaia and Ouranos, and the consort of her brother Oceanus [S1]. Together they are the parents of the rivers, the oceanids (sea-nymphs), and the winds [S1]. She is a vast, maternal figure associated with the productive waters of the world.",
    facts=["Consort of Oceanus; mother of rivers and oceanids [S1]."],
    unc=[], srcs=[SRC_THEOGONY, SRC_APPOLLOD], art=[])

ent("gre-alcmena","Alcmena","Ἀλκμήνη",[],"mortal","female",
    ["the mortal mother of Heracles"],
    parents=[], siblings=[], partners=["gre-zeus"],
    children=["gre-heracles"],
    short="Mortal woman, wife of Amphitryon and mother of Heracles by Zeus.",
    long="Alcmena is a mortal woman, the wife of Amphitryon, king of Thebes. Zeus took her in the form of Amphitryon and fathered Heracles [S2][S5]. (The 'Amphitryon' story — Zeus impersonating the husband — is a later elaboration; the core fact is that Heracles's divine father is Zeus and his mortal mother is Alcmena.) [S5]",
    facts=["Mother of Heracles by Zeus [S2][S5]."],
    unc=[], srcs=[SRC_ILIAD, SRC_APPOLLOD], art=[])

ent("gre-penelope","Penelope","Πηνελόπεια",[],"mortal","female",
    ["the faithful wife of Odysseus"],
    parents=[], siblings=[], partners=["gre-odysseus"],
    children=["gre-telemachus"],
    short="Queen of Ithaca, faithful wife of Odysseus; she warded off the suitors for twenty years while her husband was away.",
    long="Penelope is the wife of Odysseus and queen of Ithaca. During her husband's long absence (first the ten years of the Trojan War, then the ten years of his wanderings), she was besieged by suitors who pressed her to remarry. She delayed them with the ruse of weaving a shroud by day and unwinding it by night, remaining faithful to Odysseus until his return [S3].",
    facts=["Feigned to weave a shroud for Laertes, unwinding it each night to delay the suitors [S3]."],
    unc=[], srcs=[SRC_ODYSSEY], art=[])

ent("gre-telemachus","Telemachus","Τηλεμαχός",[],"mortal","male",
    ["the son of Odysseus"],
    parents=["gre-odysseus","gre-penelope"], siblings=[],
    short="Son of Odysseus and Penelope; the Odyssey begins with his quest to find his father.",
    long="Telemachus is the son of Odysseus and Penelope. The Odyssey opens with him, now a young man, being urged by Athena (in disguise) to take charge and to seek news of his missing father. His journey (the 'telemachy') to Pylos and Sparta to find out what happened to Odysseus frames the epic's opening books [S3].",
    facts=["The Odyssey opens with his quest for his father (the 'telemachy') [S3].",
           "Aided by Athena (in disguise) [S3]."],
    unc=[], srcs=[SRC_ODYSSEY], art=[])

ent("gre-hebe","Hebe","Ἥβη",[],"deity","female",
    ["youth","the cup-bearer of the gods"],
    parents=["gre-zeus","gre-hera"], siblings=[],
    partners=["gre-heracles"],
    short="Goddess of youth, cup-bearer of the gods; she married Heracles after his deification.",
    long="Hebe is the goddess of youth and the cup-bearer of the gods at Olympus. She is the daughter of Zeus and Hera [S5]. After Heracles was raised to Olympus following his death, he married Hebe [S5].",
    facts=["Cup-bearer of the gods [S5].",
           "Married Heracles after his deification [S5]."],
    unc=[], srcs=[SRC_APPOLLOD], art=[])

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="attested",srcs=["S1"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# Primordial
rel("gre-chaos","gre-gaia","CREATED","Chaos gives rise to Gaia (Earth).","attested",["S1"])
rel("gre-chaos","gre-ouranos","CREATED","Chaos gives rise to Ouranos (Sky) — actually Ouranos is Gaia's child; Chaos begets the first beings including Gaia.","variant",["S1"],"Hesiod: Chaos → Gaia, Tartarus, Eros, Nyx. Ouranos is then born of Gaia. We model Chaos→Gaia as the primary creative act.")
rel("gre-gaia","gre-ouranos","PARENT_OF","Gaia is the parent of Ouranos (Sky).","attested",["S1"])
rel("gre-gaia","gre-cronus","PARENT_OF","Gaia (with Ouranos) is a parent of the Titans, including Cronus.","attested",["S1"])
rel("gre-ouranos","gre-cronus","PARENT_OF","Ouranos (with Gaia) is a parent of the Titans.","attested",["S1"])
rel("gre-gaia","gre-ouranos","PARTNER_OF","Gaia and Ouranos are the primordial couple.","attested",["S1"])
# Cronus overthrows Ouranos
rel("gre-cronus","gre-ouranos","FOUGHT","Cronus overthrew and castrated his father Ouranos.","attested",["S1"],
    "With Gaia's flint sickle; the origin of the Erinyes and (in the Theogony) Aphrodite.")
rel("gre-gaia","gre-cronus","ALLY_OF","Gaia armed Cronus with the sickle to overthrow Ouranos.","attested",["S1"])
# Cronus & Rhea
rel("gre-cronus","gre-rhea","PARTNER_OF","Cronus and Rhea are the Titan couple.","attested",["S1"])
rel("gre-cronus","gre-zeus","PARENT_OF","Cronus is a parent of Zeus (and the other first-born Olympians).","attested",["S1"])
rel("gre-rhea","gre-zeus","PARENT_OF","Rhea is a parent of Zeus.","attested",["S1"])
rel("gre-cronus","gre-zeus","ENEMY_OF","Cronus swallowed his children, including Zeus, to avoid the prophecy.","attested",["S1","S5"])
rel("gre-zeus","gre-cronus","KILLED","Zeus overthrew Cronus in the Titanomachy (not literally killed, but defeated and cast down).","attested",["S1"],
    "Zeus forced Cronus to disgorge his siblings, then led the war against the Titans; Cronus was cast into Tartarus.")
rel("gre-zeus","gre-cronus","FOUGHT","The Titanomachy: Zeus vs. Cronus and the Titans.","attested",["S1"])
# Zeus siblings
for a,b in [("gre-zeus","gre-hera"),("gre-zeus","gre-hades"),("gre-zeus","gre-poseidon"),
            ("gre-zeus","gre-demeter"),("gre-zeus","gre-hestia"),
            ("gre-hera","gre-hades"),("gre-hera","gre-poseidon"),("gre-hera","gre-demeter"),
            ("gre-hades","gre-poseidon"),("gre-hades","gre-demeter"),("gre-poseidon","gre-demeter")]:
    rel(a,b,"SIBLING_OF","First-born children of Cronus and Rhea.","attested",["S1"])
# Zeus marriages & children
rel("gre-zeus","gre-hera","PARTNER_OF","Zeus and Hera are the king and queen of the gods.","attested",["S1"])
rel("gre-zeus","gre-athena","PARENT_OF","Zeus is the parent of Athena (born from his head).","attested",["S1","S4"])
rel("gre-zeus","gre-apollo","PARENT_OF","Zeus (with Leto) is the parent of Apollo.","attested",["S4"])
rel("gre-zeus","gre-artemis","PARENT_OF","Zeus (with Leto) is the parent of Artemis.","attested",["S4"])
rel("gre-zeus","gre-ares","PARENT_OF","Zeus (with Hera) is the parent of Ares.","attested",["S4","S5"])
rel("gre-zeus","gre-hermes","PARENT_OF","Zeus (with Maia) is the parent of Hermes.","attested",["S4","S5"])
rel("gre-zeus","gre-dionysus","PARENT_OF","Zeus (with Semele) is the parent of Dionysus.","attested",["S5"])
rel("gre-zeus","gre-perseus","PARENT_OF","Zeus (with Danaë) is the parent of the hero Perseus.","attested",["S5"])
rel("gre-let-o","gre-apollo","PARENT_OF","Leto is a parent of Apollo.","attested",["S4"])
rel("gre-let-o","gre-artemis","PARENT_OF","Leto is a parent of Artemis.","attested",["S4"])
rel("gre-apollo","gre-artemis","SIBLING_OF","Apollo and Artemis are twins.","attested",["S4"])
# Metis
rel("gre-zeus","gre-metis","PARTNER_OF","Zeus's first wife was Metis, the Titaness of counsel.","attested",["S1","S4"])
rel("gre-metis","gre-athena","PARENT_OF","Metis is the mother of Athena (Zeus swallowed her pregnant).","attested",["S1","S4"])
# Hades & Persephone
rel("gre-hades","gre-persephone","PARTNER_OF","Hades took Persephone as his queen.","attested",["S4","S5"])
rel("gre-demeter","gre-persephone","PARENT_OF","Demeter is the parent of Persephone.","attested",["S4","S5"])
rel("gre-hades","gre-demeter","ENEMY_OF","Hades's abduction of Persephone caused Demeter's wrath (the seasons).","attested",["S4","S5"],
    "Not a battle but a mythic estrangement that explains the seasons.")
# Athena & Poseidon rivalry
rel("gre-athena","gre-poseidon","ENEMY_OF","Athena and Poseidon rivaled for the patronage of Athens.","attested",["S5","S6"],
    "A civic contest, not a battle: she gave the olive, he the sea/spring; the city chose Athena.")
# Aphrodite
rel("gre-ouranos","gre-aphrodite","CREATED","In the Theogony, Aphrodite is born from the sea-foam around Ouranos's severed member.","variant",["S1","S2"],
    "Theogony: born of Ouranos's severed member (sea-foam). Iliad: daughter of Zeus & Dione. Both stored.")
rel("gre-aphrodite","gre-ares","PARTNER_OF","Aphrodite's lover was Ares.","attested",["S2","S5"])
rel("gre-aphrodite","gre-hephaestus","PARTNER_OF","Aphrodite was married to Hephaestus.","attested",["S2","S4","S5"])
rel("gre-aphrodite","gre-eros","PARENT_OF","Aphrodite is the mother of Eros (Love).","attested",["S4","S5"])
rel("gre-ares","gre-aphrodite","PARTNER_OF","Ares and Aphrodite were lovers.","attested",["S2","S5"])
# Hephaestus
rel("gre-hera","gre-hephaestus","PARENT_OF","In the Iliad, Hephaestus is the son of Hera alone.","variant",["S1","S2"],
    "Iliad: Hera alone. Theogony: Zeus & Hera. Both stored.")
rel("gre-hephaestus","gre-aphrodite","PARTNER_OF","Hephaestus was married to Aphrodite.","attested",["S2","S4","S5"])
rel("gre-hephaestus","gre-zeus","FOUGHT","Hephaestus made a golden throne that trapped Zeus (in one account).","attested",["S2","S5"],
    "A trick, not a war: the throne that held Zeus until the gods freed him.")
# Hermes
rel("gre-zeus","gre-hermes","PARENT_OF","Zeus (with Maia) is the parent of Hermes.","attested",["S4","S5"])
rel("gre-maia","gre-hermes","PARENT_OF","Maia is the mother of Hermes.","attested",["S4","S5"])
rel("gre-atlas","gre-maia","PARENT_OF","Atlas is the parent of Maia.","attested",["S1","S4"])
rel("gre-hermes","gre-apollo","ALLY_OF","Hermes traded the lyre to Apollo after stealing his cattle (they became friends).","attested",["S4","S5"],
    "The theft-and-trade story; a founding myth of their relationship.")
# Dionysus
rel("gre-zeus","gre-dionysus","PARENT_OF","Zeus (with Semele) is the parent of Dionysus.","attested",["S5"])
rel("gre-semele","gre-dionysus","PARENT_OF","Semele is the (mortal) mother of Dionysus.","attested",["S5"])
# Perseus
rel("gre-zeus","gre-perseus","PARENT_OF","Zeus (with Danaë) is the parent of Perseus.","attested",["S5"])
rel("gre-danae","gre-perseus","PARENT_OF","Danaë is the (mortal) mother of Perseus.","attested",["S5"])
rel("gre-perseus","gre-medusa","KILLED","Perseus beheaded Medusa.","attested",["S5"])
rel("gre-perseus","gre-andromeda","PARTNER_OF","Perseus rescued and married Andromeda.","attested",["S5"])
# Monsters
rel("gre-gaia","gre-typhon","CREATED","Gaia bore Typhon (in the Theogony's interpolated passage).","attested",["S1"],
    "The Typhon passage is a later interpolation; we flag it.")
rel("gre-typhon","gre-zeus","FOUGHT","Typhon warred against the gods and wounded Zeus.","attested",["S1"])
rel("gre-zeus","gre-typhon","KILLED","Zeus overthrew and buried Typhon under Etna.","attested",["S1"])
rel("gre-typhon","gre-cerberus","PARENT_OF","Typhon (with Echidna) is the parent of Cerberus.","attested",["S1"])
rel("gre-heracles","gre-cerberus","KILLED","Heracles captured Cerberus (his final labor).","attested",["S5"],
    "Captured, not killed — the point of the labor was to bring him up and back.")
rel("gre-heracles","gre-typhon","ALLY_OF","Heracles (in some accounts) helped bind Typhon.","uncertain",["S5"],
    "Some accounts credit Heracles with helping Zeus against Typhon; not all sources agree.")
rel("gre-heracles","gre-zeus","PARENT_OF","Zeus is the parent of Heracles (with Alcmena).","attested",["S2","S5"])
rel("gre-heracles","gre-hera","ENEMY_OF","Hera's enmity drove Heracles to madness and set his labors.","attested",["S5"],
    "Hera resented Zeus's affair with Alcmena and persecuted Heracles throughout.")

rel("gre-aphrodite","gre-eros","PARENT_OF","In later myth, Aphrodite is the mother of Eros.","attested",["S4","S5"])
rel("gre-perseus","gre-andromeda","PARTNER_OF","Perseus rescued and married Andromeda.","attested",["S5"])
rel("gre-echidna","gre-cerberus","PARENT_OF","Echidna (with Typhon) is the parent of Cerberus.","attested",["S1"])
rel("gre-typhon","gre-echidna","PARTNER_OF","Typhon and Echidna are the monster-couple that parent the great monsters.","attested",["S1"])
rel("gre-oceanus","gre-tethys","PARTNER_OF","Oceanus and Tethys are the primordial sea-couple.","attested",["S1"])
rel("gre-zeus","gre-heracles","PARENT_OF","Zeus is the parent of Heracles (with Alcmena).","attested",["S2","S5"])
rel("gre-alcmena","gre-heracles","PARENT_OF","Alcmena is the (mortal) mother of Heracles.","attested",["S2","S5"])
rel("gre-odysseus","gre-telemachus","PARENT_OF","Odysseus is the parent of Telemachus.","attested",["S3"])
rel("gre-penelope","gre-telemachus","PARENT_OF","Penelope is the (mortal) mother of Telemachus.","attested",["S3"])
rel("gre-odysseus","gre-penelope","PARTNER_OF","Odysseus and Penelope are married.","attested",["S3"])
rel("gre-hera","gre-hebe","PARENT_OF","Hera (with Zeus) is the parent of Hebe.","attested",["S5"])
rel("gre-heracles","gre-hebe","PARTNER_OF","Heracles married Hebe after his deification.","attested",["S5"])
dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, chapters, variants=None, unc=None):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs,
         "variants": variants or [], "uncertainty_notes": unc or "",
         "chapters": chapters}
    M.append(m)

myth("gre-creation","The Hesiodic Creation (Cosmogony)",
    "In the Theogony, the first thing is Chaos, from which come Gaia (Earth), Tartarus, Eros, and Nyx. Gaia bears Ouranos (Sky), and the union of Gaia and Ouranos produces the Titans, the Cyclopes, and the Hecatoncheires [S1].",
    ["gre-chaos","gre-gaia","gre-ouranos"], ["S1"],
    [{"heading":"Chaos First","body":"The first thing was Chaos, the yawning gap [S1]."},
     {"heading":"Gaia and the First Beings","body":"From Chaos came Gaia, Tartarus, Eros, and Nyx [S1]."},
     {"heading":"Ouranos and the Titans","body":"Gaia bore Ouranos; their union produced the Titans, Cyclopes, and Hecatoncheires [S1]."}],
    variants=[{"name":"Hesiodic","description":"Chaos → Gaia/Ouranos → Titans (Theogony)."},
              {"name":"Orphic","description":"A cosmic egg and the god Phanes; a different, later cosmogony [S5]."}],
    unc="The Orphic cosmogony (egg, Phanes) is a genuine alternative to the Hesiodic account; both are preserved [S1][S5].")

myth("gre-overthrow-of-ouranos","The Overthrow of Ouranos",
    "Ouranos imprisoned his children in Tartarus. Gaia, grieving, forged a flint sickle and set Cronus to castrate and overthrow him; the Erinyes and (in the Theogony) Aphrodite arose from his severed parts [S1].",
    ["gre-ouranos","gre-gaia","gre-cronus"], ["S1"],
    [{"heading":"The Imprisonment","body":"Ouranos cast his children into Tartarus [S1]."},
     {"heading":"The Sickle","body":"Gaia forged a sickle and set Cronus against him [S1]."},
     {"heading":"The Fall","body":"Cronus castrated Ouranos, who retreated to the heavens [S1]."}],
    unc="The origin of Aphrodite from Ouranos's severed member (Theogony) vs. her birth from Zeus & Dione (Iliad) is a genuine variant [S1][S2].")

myth("gre-titanomachy","The Titanomachy (War of the Titans)",
    "Zeus, grown, forced Cronus to disgorge his siblings, freed the Cyclopes and Hecatoncheires, and led them to war against the Titans. After a great battle, the Titans were defeated and cast into Tartarus [S1].",
    ["gre-zeus","gre-cronus","gre-rhea","gre-gaia","gre-ouranos"], ["S1"],
    [{"heading":"The Stone for Zeus","body":"Rhea gave Cronus a wrapped stone in place of the infant Zeus [S1][S5]."},
     {"heading":"The Disgorging","body":"Zeus forced Cronus to vomit up his swallowed siblings [S1]."},
     {"heading":"The War","body":"With the Cyclopes and Hecatoncheires, Zeus defeated the Titans [S1]."},
     {"heading":"The Division","body":"Zeus took the sky, Poseidon the sea, Hades the underworld [S1]."}],
    unc="")

myth("gre-athena-birth","The Birth of Athena",
    "Zeus swallowed Metis, pregnant with their child, to avert the prophecy that the child would overthrow him. Athena was born fully formed and armored from Zeus's head [S1][S4][S5].",
    ["gre-zeus","gre-metis","gre-athena"], ["S1","S4","S5"],
    [{"heading":"The Prophecy","body":"A child of Metis would overthrow Zeus [S1][S5]."},
     {"heading":"The Swallowing","body":"Zeus swallowed Metis while pregnant [S1]."},
     {"heading":"The Birth","body":"Athena sprang from Zeus's head, fully armed [S4][S5]."}],
    unc="Her mother is Metis in the Theogony and Iliad (a variant gives Dione) [S1][S2].")

myth("gre-athena-athens","Athena and Poseidon for Athens",
    "Athena and Poseidon each offered a gift to the city: she the olive tree, he the sea (or a horse). The city chose Athena's gift, and she became its patron [S5][S6].",
    ["gre-athena","gre-poseidon"], ["S5","S6"],
    [{"heading":"The Contest","body":"Both gods offered a gift to the new city [S5]."},
     {"heading":"The Gifts","body":"Athena gave the olive; Poseidon the sea/spring [S5][S6]."},
     {"heading":"The Choice","body":"The city chose Athena, who became its patron [S6]."}],
    unc="A civic aition (origin story), not a battle; the 'gifts' differ slightly across sources [S5][S6].")

myth("gre-aphrodite-birth","The Birth of Aphrodite (Two Accounts)",
    "In the Theogony, Aphrodite is born from the sea-foam around Ouranos's severed member at Cythera. In the Iliad, she is the daughter of Zeus and Dione. Both accounts are canonical and incompatible [S1][S2].",
    ["gre-aphrodite","gre-ouranos","gre-zeus"], ["S1","S2"],
    [{"heading":"Theogony Version","body":"Sea-foam from Ouranos's severed member [S1]."},
     {"heading":"Iliad Version","body":"Daughter of Zeus and Dione [S2]."}],
    variants=[{"name":"Theogony (sea-foam)","description":"Born of Ouranos's severed member [S1]."},
              {"name":"Iliad (Zeus & Dione)","description":"Daughter of Zeus and Dione [S2]."}],
    unc="These are genuinely incompatible accounts; we present both, not a merge [S1][S2].")

myth("gre-persephone","The Abduction of Persephone and the Seasons",
    "Hades abducted Persephone to be his queen. Demeter's grief withheld the earth's fertility until a compromise: Persephone spends part of the year on earth (spring/summer) and part in the underworld (autumn/winter), because she ate pomegranate seeds below [S4][S5].",
    ["gre-hades","gre-persephone","gre-demeter"], ["S4","S5"],
    [{"heading":"The Abduction","body":"Hades took Persephone from a meadow [S4][S5]."},
     {"heading":"The Grief","body":"Demeter's sorrow made the earth barren [S4][S5]."},
     {"heading":"The Compromise","body":"Persephone divides the year between earth and underworld [S4][S5]."},
     {"heading":"The Pomegranate","body":"Six pomegranate seeds bound her to return (later/Orphic detail) [S4][S5]."}],
    unc="The pomegranate-seed detail is from later/Orphic tradition, not the Homeric Hymn to Demeter [S4][S5].")

myth("gre-perseus-medusa","Perseus and Medusa",
    "Sent to fetch Medusa's head, Perseus was aided by Athena (mirror-shield) and Hermes (winged sandals, sickle); he beheaded the Gorgon, and Pegasus and Chrysaor sprang from her blood [S1][S5].",
    ["gre-perseus","gre-medusa","gre-athena","gre-hermes"], ["S1","S5"],
    [{"heading":"The Quest","body":"Polydectes sent Perseus for Medusa's head [S5]."},
     {"heading":"The Gifts","body":"Athena's shield, Hermes's sandals and sickle [S5]."},
     {"heading":"The Slaying","body":"Perseus beheaded Medusa via the mirror [S5]."},
     {"heading":"Pegasus","body":"Pegasus and Chrysaor sprang from her blood [S1][S5]."}],
    unc="The 'beautiful maiden' Medusa is Ovid's later version; Hesiod's Gorgons are monstrous from birth [S1][S5].")

myth("gre-typhon-zeus","Typhon and Zeus",
    "Typhon, the greatest monster, warred against the gods and wounded Zeus, who was cut and fell. Zeus recovered, regained his thunderbolt, and buried Typhon under Mount Etna [S1][S5].",
    ["gre-typhon","gre-zeus","gre-gaia"], ["S1","S5"],
    [{"heading":"The Monster","body":"Typhon, hundred-headed, born of Gaia [S1]."},
     {"heading":"The Wounding","body":"Typhon cut Zeus and made him fall [S1]."},
     {"heading":"The Burial","body":"Zeus buried Typhon under Etna; its fires are his breath [S1][S5]."}],
    unc="The Typhon passage in the Theogony is a later interpolation [S1].")

myth("gre-heracles-labors","The Twelve Labors of Heracles",
    "Driven to madness by Hera, Heracles killed his children and was set to perform the twelve labors for Eurystheus as penance — including the Nemean lion, the Lernaean Hydra, and the capture of Cerberus. After his death he was raised to Olympus [S5].",
    ["gre-heracles","gre-hera","gre-cerberus"], ["S5"],
    [{"heading":"The Madness","body":"Hera drove Heracles to kill his children [S5]."},
     {"heading":"The Labors","body":"Twelve tasks for Eurystheus [S5]."},
     {"heading":"Cerberus","body":"The final labor: capture Cerberus [S5]."},
     {"heading":"Olympus","body":"After his death he was raised to Olympus [S5]."}],
    unc="")

myth("gre-odysseus-kyklops","Odysseus and the Cyclops",
    "On his way home from Troy, Odysseus was trapped by the Cyclops Polyphemus, whom he blinded and escaped by calling himself 'Nobody' (Outis), so the other Cyclopes did not come when they heard 'Nobody is doing this' [S3].",
    ["gre-odysseus","gre-poseidon"], ["S3"],
    [{"heading":"The Cave","body":"Odysseus's men were trapped by Polyphemus [S3]."},
     {"heading":"The Blinding","body":"Odysseus blinded the Cyclops with a stake [S3]."},
     {"heading":"'Nobody'","body":"He called himself Outis (Nobody) to outwit the others [S3]."},
     {"heading":"The Wrath","body":"Poseidon (Polyphemus's father) cursed Odysseus's journey home [S3]."}],
    unc="")

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
 "realms": [
  {"id":"gre-olympus","name":"Mount Olympus","native_name":"Ὄλυμπος",
   "description":"The highest peak, home of the twelve Olympian gods and the seat of divine kingship [S1][S2].",
   "entities":["gre-zeus","gre-hera","gre-athena","gre-apollo","gre-artemis","gre-ares","gre-aphrodite","gre-hermes","gre-dionysus","gre-hephaestus","gre-demeter","gre-hestia"],
   "layout":{"x":0.5,"y":0.12,"r":0.14}},
  {"id":"gre-sky","name":"The Sky (Ouranos)","native_name":"Οὐρανός",
   "description":"The vault of the sky, the domain of Ouranos and the element ruled by Zeus [S1].",
   "entities":["gre-ouranos","gre-zeus"],"layout":{"x":0.5,"y":0.0,"r":0.08}},
  {"id":"gre-earth","name":"The Earth (Gaia)","native_name":"Γαῖα",
   "description":"The inhabited world, the domain of Gaia and the realm of mortals and heroes [S1].",
   "entities":["gre-gaia","gre-perseus","gre-odysseus","gre-heracles"],"layout":{"x":0.5,"y":0.5,"r":0.16}},
  {"id":"gre-sea","name":"The Sea (Poseidon)","native_name":"Πόντος",
   "description":"The great sea, ruled by Poseidon; the realm of sea-gods and monsters [S1].",
   "entities":["gre-poseidon"],"layout":{"x":0.82,"y":0.5,"r":0.1}},
  {"id":"gre-underworld","name":"The Underworld (Hades)","native_name":"ᾍδης",
   "description":"The realm of the dead, ruled by Hades and Persephone; its rivers (Styx, Acheron) and guardians (Cerberus) [S3][S5].",
   "entities":["gre-hades","gre-persephone","gre-cerberus"],"layout":{"x":0.5,"y":0.88,"r":0.14}},
  {"id":"gre-tartarus","name":"Tartarus","native_name":"Τάρταρος",
   "description":"The abyss beneath the underworld, the prison of the defeated Titans and the place of the deepest punishment [S1].",
   "entities":["gre-cronus"],"layout":{"x":0.5,"y":1.0,"r":0.07}},
 ],
 "structure_notes": "A vertical cosmology: Sky/Olympus above, the Earth and Sea in the middle, the Underworld and the abyssal Tartarus below. The Olympians rule from Olympus; the dead are ruled from the Underworld; the defeated Titans are imprisoned in Tartarus [S1][S2][S3]."
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
T = [
 {"id":"gre-t1","period":"Mycenaean","date_range":"c. 1600–1100 BCE","description":"Palace culture; earliest evidence of some deities (Linear B tablets name a 'Po-ti-ni-a,' possibly Athena or a mother-goddess, and a 'Di-wi-je-u,' possibly Zeus).","confidence":"attested (archaeological)"},
 {"id":"gre-t2","period":"Hesiod & Homer","date_range":"c. 750–700 BCE","description":"The Iliad, Odyssey, and the Theogony are composed (orated/written). The Olympian pantheon takes its classical literary shape.","confidence":"attested (text)"},
 {"id":"gre-t3","period":"Archaic","date_range":"c. 700–480 BCE","description":"Great sanctuaries flourish: Olympia, Delphi, Dodona. Vase painting depicts the myths. The Homeric Hymns are composed.","confidence":"attested"},
 {"id":"gre-t4","period":"Classical","date_range":"c. 480–323 BCE","description":"The classical pantheon is fixed; the Parthenon is built for Athena (447–432 BCE). Tragedy and comedy flourish at the Dionysia.","confidence":"attested"},
 {"id":"gre-t5","period":"Hellenistic","date_range":"c. 323–31 BCE","description":"Apollo becomes strongly identified with the sun; mystery cults and syncretism (e.g. Sarapis) spread. Later myths (e.g. Ovid's) are composed.","confidence":"attested"},
 {"id":"gre-t6","period":"Roman & Later","date_range":"c. 31 BCE – 400 CE","description":"Greek gods are equated with Roman ones (Zeus=Jupiter, etc.). Pausanias writes his survey of Greek sanctuaries (c. 150–180 CE).","confidence":"attested"},
]
dump("timeline.json", T)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"id":"gre-u1","question":"Aphrodite's parentage","versions":{"S1 (Theogony)":"Born from sea-foam around Ouranos's severed member","S2 (Iliad)":"Daughter of Zeus and Dione"},"how_we_present_it":"Two birth-accounts side by side; neither is declared 'the' truth."},
 {"id":"gre-u2","question":"Hephaestus's parentage","versions":{"S2 (Iliad)":"Son of Hera alone","S1 (Theogony)":"Son of Zeus and Hera"},"how_we_present_it":"Both stored; the Iliad's 'Hera alone' is the more distinctive account."},
 {"id":"gre-u3","question":"The Olympian 'family' as a system","versions":{"Literary (Hesiod/Homer)":"A tidy pantheon of twelve","Cult (local)":"Deities had local identities that predate and differ from the classical syncretic pantheon"},"how_we_present_it":"We note where a deity's 'family position' is a literary synthesis vs. a local cult reality."},
 {"id":"gre-u4","question":"Orphic vs. Hesiodic cosmogony","versions":{"Hesiodic":"Chaos → Gaia/Ouranos → Titans","Orphic":"A cosmic egg and the god Phanes"},"how_we_present_it":"Both cosmogonies presented as variants, not merged."},
 {"id":"gre-u5","question":"The Typhon passage","versions":{"Traditional reading":"Part of Hesiod's Theogony","Scholarly view":"A later interpolation (lines 810–835)"},"how_we_present_it":"We flag the passage as likely interpolated, per the scholarly consensus."},
 {"id":"gre-u6","question":"Medusa's origin","versions":{"Hesiodic":"Monstrous Gorgon from birth (daughter of Phorcys & Ceto)","Ovid (later)":"A beautiful maiden transformed (for hubris / an offense against Athena)"},"how_we_present_it":"Both versions stored; the 'maiden' version is dated as later (Roman)."},
]
dump("uncertainties.json", U)

print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
