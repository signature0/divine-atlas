#!/usr/bin/env python3
# SLAVIC dataset builder. Writes research/slavic/*.json
# CRITICAL: Slavic pre-Christian religion is LATE-ATTESTED and largely RECONSTRUCTED.
# The oldest literary attestation of the pantheon is the Primary Chronicle (c. 1113 CE,
# describing events of the 10th c.). Most "knowledge" comes from:
#   (a) the 980 CE "destruction of the idols" at Kiev (chronicle + later retellings),
#   (b) 16th-18th c. chronicles and "Tales of the Destruction of Idols",
#   (c) 19th-20th c. ethnographic collection of folk survivals,
#   (d) comparative reconstruction.
# We mark confidence accordingly: attested / attested(folk) / reconstructed / variant / modern.
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/slavic"
os.makedirs(OUT, exist_ok=True)
C = "slavic"

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
        "evidence_status": kw.get("evid", "reconstructed"),
    }
    E.append(e)

def S(ref, name, date, typ, url=None):
    return {"type": typ, "name": name, "date": date, "ref": ref, "url": url}

# ---- SOURCES ----
SRC_LAT = S("S1","Primary Chronicle (Povest' vremennykh let / Latopis povest' vremen'nykh let)","c. 1113 CE (describes 10th c.)","text","https://en.wikipedia.org/wiki/Tale_of_Bygone_Years")
SRC_HLET = S("S2","Hypatian / Hletovskaya Chronicle (Kiev idol list)","14th-15th c. (later copy)","text",None)
SRC_TALE = S("S3","'Tale of the Destruction of the Idols' (Skazanie o razrushenii idolov)","16th-18th c.","text","https://en.wikisource.org/wiki/")
SRC_MILLER = S("S4","Vsevolod Miller, 'Slavic God-Concepts' (Slavjanskije bozhestvennye predstavl'enija)","1860 (19th c. ethnographic)","academic",None)
SRC_ETHNO = S("S5","19th-20th c. Slavic ethnographic collections (Volkov, Ivanov, etc.)","19th-20th c.","academic",None)
SRC_RECON = S("S6","Modern comparative reconstruction (e.g., Ivanov & Toporov, 'Theses on Slavic Mythology')","1970s-2000s","academic",None)

# ================= COSMOGONIC / SUPREME =================
ent("slv-nebo","Nebo (the Sky-Father)","Nebo",["Nebo","Nebe"],"deity","male",
    ["the sky","the highest heaven","the supreme god (in folk belief)","thunder (in some accounts)"],
    symbols=["the sky","the sun","the clouds"],
    realms=["slv-sky"],
    evid="reconstructed",
    myths=["slv-cosmology"],
    short="In folk (and partly reconstructed) belief, 'the sky' personified as the supreme heavenly father — the highest deity, above the named gods. Whether Nebo was a formal pre-Christian god or a folk Christianization is debated.",
    long="'Nebo' (the sky) was personified in Slavic folk belief as the supreme heavenly father — the 'sky-father' above all the named gods [S4][S5][S6]. In the folk (post-Christian) world, Nebo is the highest, a kind of supreme creator who sends the rain and the thunder [S5]. Scholars differ on whether Nebo was a formal pre-Christian deity or a folk concept that absorbed the role of the supreme sky-god (Perun) after Christianization [S6]. The name 'Nebo' itself is common across Slavic languages [S4]. We treat Nebo as the reconstructed supreme sky-father, noting that its pre-Christian status is debated [S6].",
    facts=["The 'sky-father', the supreme deity in folk belief [S4][S5].",
           "Whether a formal pre-Christian god or a folk Christianization is debated [S6]."],
    unc=["Nebo's pre-Christian status is genuinely debated: some see it as the supreme pre-Christian god, others as a folk layer that absorbed Perun's role [S6].",
         "Do not confuse 'Nebo' (the sky-father) with 'Nebe' (a common Slavic word for 'sky/heaven' used in Christian contexts)."],
    srcs=[SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=["slv-art-seven-gods"], hero="slv-art-seven-gods")

# ================= PERUN =================
ent("slv-perun","Perun","Perun",["Perun","Gromovnik","Perun the Thunderer"],"deity","male",
    ["thunder","the sky","war","lightning","the oak","fire (the sacred flame)"],
    symbols=["the hammer","the oak tree","the lightning","the fire (the sacred flame)"],
    animals=["the wolf","the horse"],
    weapons=["the hammer"],
    sacred_objects=["the sacred oak","the sacred flame"],
    places=["Kiev (the idol on the dnieper)","the sacred groves (gais)"],
    realms=["slv-sky","slv-earth"],
    enemies=["slv-veles","slv-morana"],
    myths=["slv-perun-veles","slv-idol-destruction"],
    evid="attested",
    short="The supreme thunder-god of the pre-Christian Slavs, the sky-father, god of thunder, lightning, war, and the sacred oak. His great idol stood on a hill in Kiev, destroyed in 980 CE.",
    long="Perun is the supreme thunder-god of the pre-Christian Slavs — the sky-father, the god of thunder, lightning, war, and the sacred oak [S1][S2][S4][S5]. He was the head of the Kiev pantheon: in the Primary Chronicle, the pagan ruler Vladimir of Kiev (980 CE) erected a great wooden idol of Perun on a hill (the 'Khorivets' hill) by the Dnieper, with a golden head and beard, and a row of other gods below [S1][S3]. The 'Tale of the Destruction of the Idols' (a later retelling) describes the idol being dragged into the river and destroyed in 980 [S3]. Perun's attributes: the hammer (the weapon that hurls thunder/lightning), the sacred oak (his tree), the sacred fire (he was 'the fire-god' in some accounts — the sacred flame that was not extinguished) [S4][S5][S6]. Perun is the great antagonist of Veles (the underworld god) in the reconstructed 'Perun-Veles' conflict [S6]. Perun's role is comparable to the Indo-European sky-father (Zeus, Thor, Dyaus Pitar) [S6].",
    facts=["The supreme thunder-god, head of the Kiev pantheon [S1][S4].",
           "His great idol stood on a hill in Kiev, destroyed in 980 CE [S1][S3].",
           "Attributes: the hammer, the sacred oak, the sacred fire [S4][S5].",
           "Comparable to the Indo-European sky-father (Zeus, Thor, Dyaus Pitar) [S6].",
           "The great antagonist of Veles in the reconstructed conflict [S6]."],
    unc=["Perun's 'sacred fire' role is debated: some sources say Perun was associated with the sacred flame, others attribute fire to Svarog [S4][S6].",
         "The 'hammer' as Perun's weapon is a later (folk) association; the 980 idol is described as wooden, not with a hammer [S3]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_TALE, SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=["slv-art-perun-oak","slv-art-idol-kyiv"], hero="slv-art-perun-oak")

# ================= VELES =================
ent("slv-veles","Veles","Veles",["Veles","Volos","Velas"],"deity","male",
    ["the underworld","cattle","magic","the snake (the serpent)","wealth","the realm of the dead (Nav)"],
    symbols=["the snake (the serpent)","the horn (the ram's horn)","the cattle"],
    animals=["the snake","the cattle","the horse"],
    enemies=["slv-perun"],
    realms=["slv-underworld","slv-earth"],
    myths=["slv-perun-veles"],
    evid="attested",
    short="The god of the underworld, cattle, magic, and the serpent; son of Svarog; the great antagonist of Perun. His domain is the realm of the dead (Nav/Cherd).",
    long="Veles (Volos, Velas) is the god of the underworld, cattle, magic, and the serpent [S1][S2][S4][S5]. He is the son of Svarog (the sky-father/craftsman god) [S6]. Veles's domain is the realm of the dead (Nav/Cherd) — the underworld — and the earth [S6]. He is the god of cattle (the 'cattle-god'), of wealth, of magic, and of the serpent (his animal) [S4][S5][S6]. The snake is a sacred symbol of Veles: the 'Veles-day' (May 22, later the feast of St. Nicholas) was associated with the awakening of the snakes (the 'Veles' snakes') and was a day of special taboos [S5]. Veles is the great antagonist of Perun in the reconstructed 'Perun-Veles' conflict: the sky-thunder-god vs. the underworld-serpent-god [S6]. This is a genuine reconstructed duality, not a single attested myth — we present it as a scholarly reconstruction [S6].",
    facts=["God of the underworld, cattle, magic, and the serpent [S4][S5][S6].",
           "Son of Svarog [S6].",
           "The 'Veles-day' (May 22) was associated with the awakening of the snakes [S5].",
           "The great antagonist of Perun (reconstructed duality) [S6]."],
    unc=["The 'Perun-Veles' conflict is a scholarly reconstruction (Ivanov & Toporov), not a single attested myth [S6].",
         "Veles's 'underworld' role is reconstructed from folk belief and comparative evidence; the earliest sources do not describe his realm in detail [S6]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=["slv-art-seven-gods","slv-art-triglav-scheme"], hero="slv-art-seven-gods")

# ================= SVAROG =================
ent("slv-svarog","Svarog (Svarozhich)","Svarog",["Svarozhich","Svarozh"],"deity","male",
    ["fire","smithing","crafts","the sky (as father)","the sun (in some accounts)"],
    symbols=["the anvil","the hammer","the fire (the forge)"],
    parents=[],
    children=["slv-veles"],
    realms=["slv-sky"],
    evid="attested",
    short="The god of fire, smithing, and crafts; father of Veles; in some accounts a sky/sun god. His name is the root of 'Svarozhich' (the 'Svarog-son').",
    long="Svarog (Svarozhich) is the god of fire, smithing, and crafts [S1][S2][S4][S5]. He is the father of Veles [S6]. In some accounts, Svarog is a sky/sun god (the 'heavenly' father), while in others he is the 'earthly' craftsman-god who works in the forge [S4][S6]. His name is the root of 'Svarozhich' ('the Svarog-son') — a name applied to the smith, the craftsman, and (in one folk account) to the ruler himself (the 'Svarozhich' as a royal title) [S5]. Svarog's fire is the forge-fire: the sacred, creative fire that shapes metal [S4][S5]. He is a patron of the smiths and the craftsmen [S5]. The relationship between Svarog and Perun's 'sacred fire' is debated: some attribute the sacred fire to Svarog, others to Perun [S4][S6].",
    facts=["God of fire, smithing, and crafts [S4][S5].",
           "Father of Veles [S6].",
           "The root of the name 'Svarozhich' [S5].",
           "The sacred forge-fire [S4][S5]."],
    art=["slv-art-triglav-scheme"], hero="slv-art-triglav-scheme",
    unc=["Svarog's 'sky/sun' role vs. his 'craftsman' role are not clearly distinguished in the sources; both are attested [S4][S6].",
         "The 'Svarozhich' as a royal title is a folk/late development [S5]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_ETHNO, SRC_RECON])

# ================= SUN / WIND GODS =================
ent("slv-dazhbog","Dazhbog","Dazhbog",["Dazhbog","Dazh'bozh"],"deity","male",
    ["the sun","the daylight","the giver of light (his name means 'day-god' or 'light-god')"],
    symbols=["the sun","the light","the rooster (in some folk accounts)"],
    animals=["the rooster"],
    realms=["slv-sky"],
    evid="attested",
    short="The 'day-god' or 'light-god' (his name means 'giving day' or 'giving light'); a sun god, in the Kiev pantheon.",
    long="Dazhbog (Dazh'bozh) is the 'day-god' or 'light-god' — his name is generally interpreted as 'giving day' or 'giving light' (from 'dazh' = day, 'bog' = god) [S1][S2][S4][S5]. He is a sun/light god in the Kiev pantheon [S1][S2]. His exact role is less well-attested than Perun or Veles: the sources name him but give little detail [S4]. He is sometimes identified with the sun, sometimes with the daylight in general [S4][S6]. A solar cult (the 'Dazhbog' sun-worship) is attested in folk survivals [S5].",
    facts=["The 'day-god' or 'light-god' (name = 'giving day/light') [S1][S4].",
           "A sun/light god in the Kiev pantheon [S1][S2].",
           "Less well-attested than Perun or Veles [S4]."],
    unc=["Dazhbog's exact role is poorly attested: the sources name him but give little detail [S4].",
         "Whether 'Dazhbog' is a sun-god or a 'daylight' god is debated [S4][S6]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_ETHNO],
    art=[])

ent("slv-khors","Khors","Khors",["Khors","Kors"],"deity","male",
    ["the sun (a solar god)"],
    symbols=["the sun","the chariot (the sun's chariot, in some accounts)"],
    realms=["slv-sky"],
    evid="attested",
    short="A solar god (a 'sun' deity) in the Kiev pantheon; less well-attested than Dazhbog.",
    long="Khors (Kors) is a solar god in the Kiev pantheon [S1][S2]. His exact relationship to Dazhbog (the 'day-god') is unclear: the two are both solar/light deities, and their distinction is not well-defined in the sources [S4]. Khors is named in the idol list but given little detail [S4]. Some scholars see Khors as a 'solar' god and Dazhbog as a 'daylight' god; others see them as overlapping [S6].",
    facts=["A solar god in the Kiev pantheon [S1][S2].",
           "Less well-attested than Dazhbog [S4]."],
    unc=["The distinction between Khors and Dazhbog is not clear in the sources [S4][S6]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_RECON],
    art=[])

ent("slv-stribog","Stribog","Stribog",["Stribog","Stribog"],"deity","male",
    ["the wind","the air","the breath of the sky"],
    symbols=["the wind","the air"],
    realms=["slv-sky"],
    evid="attested",
    short="The god of the wind, the air, the breath of the sky; in the Kiev pantheon. The 'Stribog' is the wind itself in folk belief.",
    long="Stribog is the god of the wind, the air, the breath of the sky [S1][S2][S4][S5]. In the Primary Chronicle, Stribog is named as the 'father of the winds' (he 'sends the winds') [S1]. In folk belief, the 'Stribog' is the wind itself, and the wind is sometimes personified as a deity [S5]. Stribog's role is clear (the wind-god) but his mythic biography is not attested [S4].",
    facts=["God of the wind, the air [S1][S2][S4].",
           "'The father of the winds' in the Primary Chronicle [S1].",
           "The wind itself, personified, in folk belief [S5]."],
    unc=["Stribog's mythic biography is not attested; the sources name him as the wind-god but give no stories [S4]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_ETHNO],
    art=[])

# ================= FERTILITY / EARTH / FEMALE =================
ent("slv-mokosh","Mokosh","Mokosh",["Mokosh","Mocoš"],"deity","female",
    ["fertility","the earth","weaving","the fate (the spinning of destiny)","women's work"],
    symbols=["the spindle","the loom","the earth"],
    realms=["slv-earth"],
    evid="attested",
    short="The goddess of fertility, the earth, weaving, and the fate (the spinning of destiny); in the Kiev pantheon. Her name is the root of the common Slavic word for 'moisture/wetness'.",
    long="Mokosh (Mocoš) is the goddess of fertility, the earth, weaving, and the fate (the spinning of destiny) [S1][S2][S4][S5]. Her name is generally interpreted as related to the common Slavic word for 'moisture/wetness' (the life-giving wetness of the earth) [S4]. Mokosh is the patroness of women's work (weaving, spinning) and of the fate — the 'spinning of destiny' (the threads of life) [S5]. In folk belief, the 'Mokosh' is associated with the earth-mother, the fertility of the land, and the fate of the household [S5]. She is named in the Kiev idol list [S1][S2]. Her relationship to the 'fate-spinning' (the Moirai/Norns equivalent) is a reconstructed parallel [S6].",
    facts=["Goddess of fertility, the earth, weaving, and the fate [S4][S5].",
           "Name related to the Slavic word for 'moisture/wetness' [S4].",
           "The 'spinning of destiny' (the fate) [S5][S6]."],
    unc=["Mokosh's 'fate-spinning' role is a reconstructed parallel to the Moirai/Norns, not a single attested myth [S6]."],
    srcs=[SRC_LAT, SRC_HLET, SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=[])

ent("slv-lada","Lada","Lada",["Lada","Lada","Lada the Beautiful"],"deity","female",
    ["spring","fertility","beauty","the household","the 'Lada' (the beloved)"],
    symbols=["the spring","the blossoms","the beauty"],
    realms=["slv-earth"],
    evid="attested (folk)",
    short="The goddess of spring, fertility, beauty, and the household; in folk belief the 'Lada' is the beloved, the beautiful one. Her status as a formal pre-Christian goddess is debated.",
    long="Lada is the goddess of spring, fertility, beauty, and the household [S4][S5]. In folk belief, the 'Lada' is the beloved, the beautiful one (the word 'lada' means 'beautiful, lovely, harmonious') [S5]. Lada is associated with the spring, the blossoming, the fertility of the land, and the harmony of the household [S4][S5]. Her status as a formal pre-Christian goddess (vs. a folk concept) is debated: the 'Lada' is more clearly a folk deity than a member of the formal Kiev pantheon [S6]. She is a 'spring/fertility' goddess, comparable to the Indo-European spring-maidens [S6].",
    facts=["Goddess of spring, fertility, beauty, and the household [S4][S5].",
           "The 'Lada' = the beloved, the beautiful one [S5].",
           "More clearly a folk deity than a formal pantheon member [S6]."],
    unc=["Lada's status as a formal pre-Christian goddess is debated; she is more clearly a folk concept [S6]."],
    srcs=[SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=[])

# ================= DEATH / WINTER =================
ent("slv-morana","Morana (Marena)","Morana",["Marena","Morena","Marzanna","Zimna Matushka (the Winter Mother)"],"deity","female",
    ["death","winter","the cold","the 'drowning of Marzanna' (the winter-ritual)"],
    symbols=["the ice","the winter","the effigy (the Marzanna doll)"],
    realms=["slv-underworld","slv-earth"],
    enemies=["slv-jarilo"],
    myths=["slv-seasonal"],
    evid="attested (folk)",
    short="The goddess of death and winter; in folk tradition the 'drowning of Marzanna' (an effigy of the winter-goddess) is a spring-ritual that 'kills' winter and 'calls' spring. Her pre-Christian status is debated.",
    long="Morana (Marena, Morena) is the goddess of death and winter [S4][S5]. In folk tradition, the 'drowning of Marzanna' (the 'Marzanna'/'Morana' doll) is a spring-ritual: an effigy of the winter-goddess is made, carried around, and drowned in a river to 'kill' winter and 'call' spring [S5]. This is a well-attested folk ritual (the 'proshchanie s zimoi' = 'farewell to winter') [S5]. Morana's status as a formal pre-Christian goddess is debated: the 'Marzanna'/'Morana' is more clearly a folk death/winter figure than a member of the formal Kiev pantheon [S6]. She is the great antagonist of Jarilo (the spring/youth god) in the reconstructed seasonal cycle [S6].",
    facts=["Goddess of death and winter [S4][S5].",
           "The 'drowning of Marzanna' is a well-attested folk spring-ritual [S5].",
           "The great antagonist of Jarilo (reconstructed seasonal cycle) [S6]."],
    unc=["Morana's status as a formal pre-Christian goddess is debated; she is more clearly a folk death/winter figure [S6].",
         "The 'Marzanna'/'Morana'/'Marena' are regional variants of the same winter/death figure [S5]."],
    srcs=[SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=[])

# ================= SPRING / YOUTH =================
ent("slv-jarilo","Jarilo (Kupala)","Jarilo",["Jarilo","Kupala","Yarilo"],"deity","male",
    ["spring","youth","the sun (in some accounts)","fertility","the 'Kupala' night (the midsummer solstice)"],
    symbols=["the sun","the fire (the Kupala fire)","the water (the Kupala river)"],
    enemies=["slv-morana"],
    myths=["slv-seasonal","slv-kupala"],
    evid="attested (folk)",
    short="The god of spring, youth, and the sun; in folk tradition the 'Kupala' night (the midsummer solstice) is a fire-and-water festival. His relationship to the 'Kupala' ritual is well-attested in folk tradition.",
    long="Jarilo (Yarilo) is the god of spring, youth, and the sun [S4][S5]. In folk tradition, the 'Kupala' night (the midsummer solstice, around June 23/24) is a fire-and-water festival: bonfires are lit, people leap over the fire, and the 'Kupala' flower (the fern-flower) is sought [S5]. The 'Kupala' ritual is well-attested in folk tradition across Slavic lands [S5]. Jarilo's relationship to the 'Kupala' festival is debated: some see Jarilo as the 'Kupala' god (the spring/youth/sun god), others see the 'Kupala' as a separate (possibly older) water/sun ritual [S6]. Jarilo is the great antagonist of Morana (the winter/death goddess) in the reconstructed seasonal cycle [S6].",
    facts=["God of spring, youth, and the sun [S4][S5].",
           "The 'Kupala' night (midsummer) is a well-attested folk fire-and-water festival [S5].",
           "The great antagonist of Morana (reconstructed seasonal cycle) [S6]."],
    unc=["The relationship between Jarilo and the 'Kupala' festival is debated: is Jarilo the 'Kupala' god, or is the 'Kupala' a separate older ritual? [S6].",
         "Jarilo's 'sun' role is debated; in some accounts he is the 'spring' god, in others the 'sun' god [S4][S6]."],
    srcs=[SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=[])

# ================= ZORYA (MORNING STARS) =================
ent("slv-zorya","Zorya (the Morning Stars)","Zorya",["Zorya","Zarja","Zorya Voshodnyaya (the Rising Star)","Zorya Zakatnaya (the Setting Star)"],"deity","female",
    ["the dawn","the morning star (Venus)","the threshold (the 'gate' of the sky)"],
    symbols=["the morning star (Venus)","the dawn","the threshold"],
    realms=["slv-sky"],
    evid="attested (folk)",
    short="The goddess (or pair of goddesses) of the dawn and the morning star (Venus); the 'Zorya' is the 'gate' of the sky, the threshold between the human world and the divine. In folk belief the 'Zorya' is the 'guardian of the threshold'.",
    long="Zorya (Zarja) is the goddess (or pair of goddesses) of the dawn and the morning star (Venus) [S4][S5]. The 'Zorya' is the 'gate' of the sky, the threshold between the human world and the divine [S5]. In folk belief, the 'Zorya' is the 'guardian of the threshold' — she opens and closes the 'gate of the sky' (the dawn) [S5]. There are two 'Zorya': the 'Zorya Voshodnyaya' (the Rising Star, the dawn) and the 'Zorya Zakatnaya' (the Setting Star, the dusk) [S5]. The 'Zorya' is a well-attested folk figure (the dawn, the morning star), though her status as a formal pre-Christian goddess is debated [S6].",
    facts=["Goddess of the dawn and the morning star (Venus) [S4][S5].",
           "The 'gate' of the sky, the threshold [S5].",
           "The 'guardian of the threshold' in folk belief [S5]."],
    unc=["Zorya's status as a formal pre-Christian goddess is debated; she is more clearly a folk dawn/star figure [S6].",
         "The 'two Zorya' (rising and setting) are a folk elaboration [S5]."],
    srcs=[SRC_MILLER, SRC_ETHNO, SRC_RECON],
    art=[])

# ================= CHERD / UNDERWORLD =================
ent("slv-cherd","Cherd (Chert)","Cherd",["Chert","Chert the Underworld","Cherd"],"deity","male",
    ["the underworld","the realm of the dead (Nav/Cherd)","the 'devil' (a Christianization of the underworld-god)"],
    symbols=["the underworld","the realm of the dead"],
    realms=["slv-underworld"],
    evid="reconstructed",
    short="The god of the underworld, the realm of the dead (Nav/Cherd); in folk (post-Christian) belief the 'Chert' (the devil) is a Christianization of the underworld-god. His pre-Christian status is debated.",
    long="'Cherd' (Chert) is the reconstructed god of the underworld, the realm of the dead (Nav/Cherd) [S6]. In folk (post-Christian) belief, the 'Chert' (the devil) is often seen as a Christianization of the pre-Christian underworld-god [S6]. The 'Cherd'/'Chert' is the lord of the underworld, the realm of the dead [S6]. His pre-Christian status is debated: the 'Chert' is more clearly a folk/Christian figure than a formal pre-Christian deity [S6]. We present Cherd as the reconstructed underworld-god, noting that his pre-Christian identity is uncertain [S6].",
    facts=["The reconstructed god of the underworld, the realm of the dead [S6].",
           "The 'Chert' (the devil) is a Christianization of the underworld-god [S6]."],
    unc=["Cherd's pre-Christian status is debated; the 'Chert' is more clearly a folk/Christian figure [S6].",
         "Do not confuse the pre-Christian underworld-god with the Christian 'devil' — they are distinct, though the folk tradition merged them [S6]."],
    srcs=[SRC_RECON, SRC_ETHNO],
    art=[])

# ---- Referenced figures (lightweight) ----
# (none needed for this dataset — all referenced figures are defined)

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="reconstructed",srcs=["S6"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# Father-son
rel("slv-svarog","slv-veles","PARENT_OF","Svarog is the father of Veles (reconstructed genealogy).","reconstructed",["S6"],
    "This father-son relationship is a scholarly reconstruction (Ivanov & Toporov), not a single attested myth [S6].")
# The Perun-Veles conflict (reconstructed)
rel("slv-perun","slv-veles","ENEMY_OF","Perun and Veles are the great antagonists (the sky-thunder-god vs. the underworld-serpent-god).","reconstructed",["S6"],
    "The 'Perun-Veles' conflict is a scholarly reconstruction (Ivanov & Toporov), not a single attested myth [S6].")
rel("slv-perun","slv-veles","FOUGHT","Perun and Veles are in conflict (the sky-thunder vs. the underworld-serpent).","reconstructed",["S6"])
# Seasonal (reconstructed)
rel("slv-jarilo","slv-morana","ENEMY_OF","Jarilo (spring/youth) and Morana (winter/death) are the great antagonists of the seasonal cycle.","reconstructed",["S6"],
    "The seasonal Jarilo-Morana opposition is a scholarly reconstruction from folk ritual [S6].")
rel("slv-jarilo","slv-morana","FOUGHT","Jarilo and Morana are in opposition (the spring vs. the winter).","reconstructed",["S6"])
# Sky-father hierarchy (reconstructed)
rel("slv-nebo","slv-perun","ASSOCIATED_WITH","Nebo (the sky-father) and Perun (the thunder-god) are both 'sky' deities; their relationship is debated.","reconstructed",["S6"],
    "Whether Nebo is the supreme god above Perun, or a folk Christianization that absorbed Perun's role, is debated [S6].")
rel("slv-perun","slv-dazhbog","SIBLING_OF","Perun and Dazhbog are both members of the Kiev pantheon (the 'sky/sun' group).","attested",["S1","S2"],
    "Both are named in the Kiev idol list; their exact relationship is not specified [S1][S2].")
rel("slv-perun","slv-khors","SIBLING_OF","Perun and Khors are both members of the Kiev pantheon.","attested",["S1","S2"])
rel("slv-perun","slv-stribog","SIBLING_OF","Perun and Stribog are both members of the Kiev pantheon.","attested",["S1","S2"])
rel("slv-perun","slv-veles","SIBLING_OF","(Variant) In some reconstructions Perun and Veles are siblings; in others Veles is Svarog's son.","variant",["S6"],
    "The relationship between Perun and Veles is not consistent: some see them as siblings, others as Veles being Svarog's son [S6].")
rel("slv-mokosh","slv-perun","PARTNER_OF","(Reconstructed) Mokosh is sometimes seen as Perun's consort (the earth-mother to the sky-father).","reconstructed",["S6"],
    "The Perun-Mokosh pairing is a reconstructed parallel to the Indo-European sky-father/earth-mother, not a single attested myth [S6].")
# Domain associations
rel("slv-svarog","slv-perun","ALLY_OF","Svarog (the forge-fire) and Perun (the sacred fire) are both 'fire' deities; their relationship is debated.","reconstructed",["S4","S6"],
    "The 'sacred fire' is attributed to both Svarog and Perun in different sources; the relationship is debated [S4][S6].")
rel("slv-dazhbog","slv-khors","ASSOCIATED_WITH","Dazhbog and Khors are both solar/light deities; their distinction is not clear.","attested",["S4"],
    "Both are named in the Kiev idol list as solar/light deities; their distinction is not well-defined [S4].")
rel("slv-zorya","slv-nebo","ASSOCIATED_WITH","The Zorya (the dawn) is associated with Nebo (the sky) — the 'gate' of the sky.","attested (folk)",["S5"])
rel("slv-veles","slv-cherd","ASSOCIATED_WITH","Veles (the underworld-god) is associated with Cherd (the lord of the underworld).","reconstructed",["S6"],
    "Both are 'underworld' deities; their exact relationship is not attested [S6].")
rel("slv-morana","slv-cherd","ALLY_OF","(Reconstructed) Morana (death) is associated with Cherd (the underworld).","reconstructed",["S6"])

dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, chapters, variants=None, unc=None, evid="reconstructed"):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs,
         "variants": variants or [], "uncertainty_notes": unc or "",
         "evidence_status": evid, "chapters": chapters}
    M.append(m)

myth("slv-cosmology","The Slavic Cosmology (the three-layered world)",
    "The Slavic cosmos is three-layered: the Sky (Nebo) above, the Earth (Zemlya) in the middle, and the Underworld (Nav/Cherd) below. A world-axis (the world-tree, the 'axis mundi') connects the three layers. The Sky is the realm of Nebo and Perun; the Earth is the realm of the human world and the earth-gods; the Underworld is the realm of the dead (Nav/Cherd) and Veles [S4][S5][S6].",
    ["slv-nebo","slv-perun","slv-veles","slv-cherd"], ["S4","S5","S6"],
    [{"heading":"The Sky (Nebo)","body":"The highest heaven, the realm of Nebo and Perun [S4][S5]."},
     {"heading":"The Earth (Zemlya)","body":"The human world, the realm of the earth-gods [S4][S5]."},
     {"heading":"The Underworld (Nav/Cherd)","body":"The realm of the dead, the domain of Veles and Cherd [S4][S5][S6]."},
     {"heading":"The World-Axis","body":"The world-tree (the 'axis mundi') connects the three layers [S5][S6]."}],
    evid="reconstructed",
    unc="The three-layered cosmology is a scholarly reconstruction from folk belief and comparative evidence; it is not described in a single pre-Christian source [S6].")

myth("slv-perun-veles","The Perun-Veles Conflict (reconstructed)",
    "In the reconstructed 'Perun-Veles' conflict, the sky-thunder-god Perun and the underworld-serpent-god Veles are in opposition. This is a scholarly reconstruction (Ivanov & Toporov) of an Indo-European 'sky-father vs. underworld-serpent' duality, not a single attested Slavic myth [S6]. The 'conflict' is expressed in folk belief as the opposition of the thunder (Perun) and the serpent (Veles) [S5][S6].",
    ["slv-perun","slv-veles"], ["S5","S6"],
    [{"heading":"The Sky-Thunder (Perun)","body":"Perun, the thunder-god, the sky-father [S5][S6]."},
     {"heading":"The Underworld-Serpent (Veles)","body":"Veles, the serpent-god, the underworld-god [S5][S6]."},
     {"heading":"The Opposition","body":"The thunder (Perun) vs. the serpent (Veles) — the reconstructed duality [S5][S6]."}],
    evid="reconstructed",
    unc="This is a scholarly reconstruction (Ivanov & Toporov), NOT a single attested Slavic myth. We present it explicitly as a reconstruction [S6].")

myth("slv-seasonal","The Seasonal Cycle (Jarilo vs. Morana, reconstructed)",
    "In the reconstructed seasonal cycle, Jarilo (spring/youth) and Morana (winter/death) are in opposition. The cycle is expressed in folk ritual: the 'drowning of Marzanna' (the winter-goddess) in spring, and the 'Kupala' night (the midsummer fire-and-water festival) in the height of summer [S5][S6]. The 'spring kills winter, summer peaks, winter returns' is the reconstructed annual cycle [S5][S6].",
    ["slv-jarilo","slv-morana"], ["S5","S6"],
    [{"heading":"Winter (Morana)","body":"Morana, the winter/death goddess, rules the cold season [S5]."},
     {"heading":"The Drowning of Marzanna","body":"In spring, an effigy of the winter-goddess is drowned to 'kill' winter [S5]."},
     {"heading":"The Kupala Night","body":"At midsummer, the 'Kupala' fire-and-water festival (Jarilo's peak) [S5]."},
     {"heading":"The Return of Winter","body":"Morana returns; the cycle repeats [S5][S6]."}],
    evid="attested (folk)",
    unc="The seasonal cycle is reconstructed from well-attested folk rituals (the 'drowning of Marzanna', the 'Kupala' night); the 'myth' itself is a scholarly interpretation of these rituals [S6].")

myth("slv-kupala","The Kupala Night (the midsummer fire-and-water festival)",
    "The 'Kupala' night (the midsummer solstice, around June 23/24) is a well-attested folk fire-and-water festival across Slavic lands: bonfires are lit, people leap over the fire, the 'Kupala' flower (the fern-flower) is sought, and the water is blessed [S5]. The 'Kupala' is associated with Jarilo (the spring/youth/sun god), though the relationship is debated [S5][S6].",
    ["slv-jarilo"], ["S5"],
    [{"heading":"The Bonfires","body":"Great bonfires are lit on the Kupala night [S5]."},
     {"heading":"Leaping the Fire","body":"People leap over the fire (a rite of purification) [S5]."},
     {"heading":"The Fern-Flower","body":"The 'Kupala' flower (the fern-flower) is sought (a rare, magical bloom) [S5]."},
     {"heading":"The Water","body":"The water is blessed; the 'Kupala' water is collected [S5]."}],
    evid="attested (folk)",
    unc="The 'Kupala' is a well-attested folk festival; its relationship to Jarilo (the sun/spring god) is debated [S5][S6].")

myth("slv-idol-destruction","The Destruction of the Idols at Kiev (980 CE)",
    "In 980 CE, the pagan ruler Vladimir of Kiev (later baptized as Vladimir) ordered the destruction of the pagan idols. The great wooden idol of Perun (with a golden head and beard) was dragged from its hill by the Dnieper, beaten, and thrown into the river [S1][S3]. This is the oldest attested event in the Slavic pantheon's history — the moment of the Christianization of Kiev [S1][S3]. The 'Tale of the Destruction of the Idols' (a later retelling) describes the event in detail [S3].",
    ["slv-perun"], ["S1","S3"],
    [{"heading":"The Pagan Kiev","body":"The pagan idols stand on the hill by the Dnieper; Perun is the head [S1]."},
     {"heading":"Vladimir's Decision","body":"Vladimir (influenced by the 'ambassador' episode) chooses Christianity [S1]."},
     {"heading":"The Destruction","body":"The idols are dragged into the river; Perun is beaten and drowned [S1][S3]."},
     {"heading":"The Christianization","body":"Kiev is baptized; the pagan pantheon is destroyed [S1]."}],
    evid="attested",
    unc="The Primary Chronicle (c. 1113 CE) is the oldest source but is a later literary retelling of 10th c. events; the 'Tale of the Destruction of the Idols' (16th-18th c.) is a much later retelling [S1][S3].")

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
 "realms": [
  {"id":"slv-sky","name":"The Sky (Nebo)","native_name":"Nebo",
   "description":"The highest heaven, the realm of Nebo (the sky-father) and Perun (the thunder-god) [S4][S5].",
   "entities":["slv-nebo","slv-perun","slv-dazhbog","slv-khors","slv-stribog","slv-zorya"],
   "layout":{"x":0.5,"y":0.18,"r":0.15}},
  {"id":"slv-earth","name":"The Earth (Zemlya)","native_name":"Zemlya",
   "description":"The human world, the realm of the earth-gods and the fertility deities [S4][S5].",
   "entities":["slv-mokosh","slv-lada","slv-jarilo"],
   "layout":{"x":0.5,"y":0.52,"r":0.15}},
  {"id":"slv-underworld","name":"The Underworld (Nav / Cherd)","native_name":"Nav / Cherd",
   "description":"The realm of the dead, the domain of Veles and Cherd [S4][S5][S6].",
   "entities":["slv-veles","slv-cherd","slv-morana"],
   "layout":{"x":0.5,"y":0.85,"r":0.13}},
 ],
 "structure_notes": "The Slavic cosmos is three-layered: the Sky (Nebo) above, the Earth (Zemlya) in the middle, and the Underworld (Nav/Cherd) below. A world-axis (the world-tree, the 'axis mundi') connects the three layers [S5][S6]. This is a scholarly reconstruction from folk belief and comparative evidence [S6]."
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
T = [
 {"id":"slv-t1","period":"Pre-Christian Slavic religion","date_range":"c. 6th-10th century CE (reconstructed)","description":"The pre-Christian Slavic religion. The gods Perun, Veles, Svarog, Dazhbog, Khors, Stribog, and Mokosh are worshipped. The evidence is archaeological and reconstructed (no contemporary literary sources).","confidence":"reconstructed"},
 {"id":"slv-t2","period":"The 980 CE 'destruction of the idols'","date_range":"980 CE","description":"The pagan ruler Vladimir of Kiev orders the destruction of the pagan idols, including the great wooden idol of Perun. This is the oldest attested event in the Slavic pantheon's history.","confidence":"attested (chronicle)"},
 {"id":"slv-t3","period":"The Primary Chronicle","date_range":"c. 1113 CE (describes 10th c.)","description":"The Primary Chronicle (Latopis povest' vremen'nykh let) is composed. It names the Kiev pantheon (Perun, Khors, Dazhbog, Stribog, Veles, Mokosh) and describes the 980 'destruction of the idols'.","confidence":"attested (text, later literary)"},
 {"id":"slv-t4","period":"The 'Tales of the Destruction of the Idols'","date_range":"16th-18th century CE","description":"The 'Tale of the Destruction of the Idols' (Skazanie o razrushenii idolov) and other later chronicles retell the 980 event and the pagan pantheon in detail.","confidence":"attested (text, much later retelling)"},
 {"id":"slv-t5","period":"Ethnographic collection","date_range":"19th-20th century CE","description":"19th-20th c. ethnographers (Vsevolod Miller, Vasily Ivanov, etc.) collect folk survivals of the pre-Christian religion: the 'drowning of Marzanna', the 'Kupala' night, the 'Veles-day', the folk gods (Lada, Morana, Zorya).","confidence":"attested (folk, ethnographic)"},
]
dump("timeline.json", T)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"id":"slv-u1","question":"The overall status of Slavic mythology","versions":{"attested":"The 980 'destruction of the idols' and the Kiev idol list (Perun, Khors, Dazhbog, Stribog, Veles, Mokosh) are attested in the Primary Chronicle","reconstructed":"The genealogies (Svarog-Veles, Nebo-Perun), the 'Perun-Veles' conflict, the seasonal cycle, and the cosmology are scholarly reconstructions"},"how_we_present_it":"We mark every claim with its evidence_status (attested / attested(folk) / reconstructed / variant / modern). We do NOT present reconstructions as if they were attested myths."},
 {"id":"slv-u2","question":"The 'Perun-Veles' conflict","versions":{"S6":"A scholarly reconstruction (Ivanov & Toporov) of an Indo-European 'sky-father vs. underworld-serpent' duality, not a single attested Slavic myth"},"how_we_present_it":"We present it explicitly as a reconstruction, not as an attested myth."},
 {"id":"slv-u3","question":"Nebo's status","versions":{"reconstructed":"The 'sky-father', the supreme deity in folk belief","debated":"Whether a formal pre-Christian god or a folk Christianization that absorbed Perun's role"},"how_we_present_it":"We present Nebo as the reconstructed supreme sky-father, noting the debate."},
 {"id":"slv-u4","question":"The 'Kupala' and Jarilo","versions":{"folk":"The 'Kupala' night is a well-attested folk fire-and-water festival","debated":"Whether Jarilo is the 'Kupala' god or the 'Kupala' is a separate older ritual"},"how_we_present_it":"We present the 'Kupala' as well-attested folk ritual; the Jarilo connection as debated."},
 {"id":"slv-u5","question":"Morana / Marzanna","versions":{"folk":"The 'drowning of Marzanna' is a well-attested folk spring-ritual","debated":"Whether Morana was a formal pre-Christian goddess or a folk death/winter figure"},"how_we_present_it":"We present the ritual as well-attested; the goddess's pre-Christian status as debated."},
 {"id":"slv-u6","question":"The dating of the myths","versions":{"attested":"The 980 'destruction of the idols' is the oldest attested event","reconstructed":"The pre-Christian religion is c. 6th-10th c. (reconstructed); the surviving texts are c. 1113 CE and later"},"how_we_present_it":"We make clear that the religion is much older than the surviving texts."},
]
dump("uncertainties.json", U)

print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
