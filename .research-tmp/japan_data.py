#!/usr/bin/env python3
# JAPANESE (Shinto) reference dataset builder. Writes research/japanese/*.json + sources.md
import json, os
OUT = "/AI/agents/workspaces/divine-atlas/research/japanese"
os.makedirs(OUT, exist_ok=True)
C = "japanese"

def dump(name, obj):
    p = os.path.join(OUT, name)
    json.dump(obj, open(p, "w"), indent=1, ensure_ascii=False)
    print("wrote", name, ":", len(obj) if isinstance(obj, list) else "obj")

# ---------------- ENTITIES ----------------
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

# --- primordial / first-born ---
ent("jpn-kamimusubi","Takamimusubi","高皇産霊神",["Kamimusubi (high divine origin)"],"deity","unknown",
    ["origin","creation","divinity"],
    short="The first-born deity in the Kojiki, 'the High Deity who gives birth to the origin of things,' invoked at the opening of the creation sequence.",
    long="Takamimusubi (高皇産霊神; also read Kamimusubi, 'the high divine origin') is the first divine being named in the Kojiki's opening passage: 'In the time when the heavenly high plain had just come into being, first of all was born the high divine origin of heavenly things, Kamimusubi' [S1]. He is generally treated as a primordial deity associated with the origin of things rather than a figure with a developed myth of his own. His exact nature—whether a personified principle of origin, a progenitor, or a ritual formula—is debated; the Kojiki's account is terse and heavily ritualized [S1][S2]. He is sometimes paired with two younger brothers (Takamimusubi's 'younger brothers'), but the genealogy of these primordial figures is one of the least stable in the corpus.",
    facts=["Named first in the Kojiki's creation sequence [S1].",
           "Often read as a ritual/theogonic formula rather than a character in a narrative myth [S1]."],
    unc=["His relationship to the later 'primordial' pair (Izanagi/Izanami) and to Amenominakanushi is not clearly stated in the Kojiki; scholars differ on whether he is a separate progenitor or an aspect of the same high-origin principle [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-amenominakanushi","Amenominakanushi","天御中主",["Amanominakanushi","Ame-no-Minakanushi (Nihon Shoki)"],"primordial","unknown",
    ["creation","high heaven"],
    short="The primordial deity of the High Plain of Heaven (Takamagahara), who in the Kojiki 'gave birth to' or commanded the birth of the creator pair Izanagi and Izanami.",
    long="Amenominakanushi ('Lord of the Center of the High Plain of Heaven') is the deity of the heavenly highland in the Kojiki. In the creation passage, after the primordial beings are named, it is the 'high plain of heaven' and its deities that produce the pair who will form the islands: the Kojiki says the kami of the high plain 'gave birth' to Izanagi and Izanami and ordered them to shape and settle the earthly islands [S1]. The Nihon Shoki gives a parallel but differently-worded account, and the precise mechanism (whether 'birth' is literal or a ritual/creative command) is one of the classic ambiguities in Japanese cosmogony [S1][S2]. He functions less as a character and more as the heavenly authority from which the creative pair is sent.",
    facts=["The 'center of the high plain' (Amenominaka) is the axis of the heavenly realm [S1].",
           "The Kojiki frames his act as a command/order to Izanagi and Izanami to shape the islands [S1]."],
    unc=["Whether Amenominakanushi is a distinct progenitor, a title, or a collective of the high-plain kami is debated; the Kojiki and Nihon Shoki word the 'birth/order' of the creator pair differently [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)],
    realms=["jpn-takamagahara"])

# --- creator pair ---
ent("jpn-izananagi","Izanagi","伊邪那岐命",["Izanagi-no-Mikoto","Izanagi"],
    "deity","male",["creation","purification","heaven"],
    symbols=["jeweled spear (Ame-no-nuhokohe)"], sacred_objects=["Ame-no-nuhokohe"],
    partners=["jpn-izananami"], children=["jpn-amaterasu","jpn-tsurugumo","jpn-susanoo","jpn-kagutsuchi","jpn-konohanasakuhana"],
    siblings=[], allies=["jpn-amenominakanushi"], enemies=[],
    realms=["jpn-takamagahara","jpn-yomi"], places=["Onogoro"],
    myths=["jpn-creation-islands","jpn-izananagis-purification"],
    short="Male member of the divine creator pair who, with his sister-wife Izanami, stirred the brine of the sea to form the Japanese islands and gave birth to the high deities.",
    long="Izanagi ('He who Invites') is the male progenitor in the Kojiki's creation. He and Izanami stand on the Floating Bridge of Heaven (Ame-no-ukihashi) and, using the jeweled spear Ame-no-nuhokohe, stir the brine below; the salt that drips forms the first island, Onogoro [S1]. There they wed and, over a series of 'birthings,' produce the great islands of Japan and then the deities (kami) who attend them [S1]. After Izanami's death in giving birth to the fire god, Izanagi follows her to the Land of Yomi, discovers her decayed body, and flees; the ensuing separation of the clean (heavenly) and polluted (underworld) realms, and Izanagi's subsequent purification (misogi), generate many further kami [S1]. He is thus a creator, a threshold-crosser between the living and dead realms, and a figure of ritual purification [S1][S2].",
    facts=["Stirs the sea with the jeweled spear Ame-no-nuhokohe to form the first island, Onogoro [S1].",
           "His purification (misogi) after fleeing Yomi gives birth to a series of deities from his washed body-parts [S1].",
           "The 'floating bridge of heaven' (Ame-no-ukihashi) is the platform from which he and Izanami work [S1]."],
    unc=["The precise order and parentage of the children (which islands and which kami, and in what sequence) differ between the Kojiki and Nihon Shoki [S1][S2].",
         "The details of the Yomi episode (the separation point, the 'Nagarazuyashiki' hedge of hedges, which body-parts birth which kami) vary between the two texts [S1][S2]."],
    art=["jpn-art-izanagi-izanami-nishikawa","jpn-art-izanagi-izanami-kobayashi","jpn-art-izanagi-izanami-shinbutsu"],
    hero="jpn-art-izanagi-izanami-nishikawa",
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S5","Met: The God Izanagi and Goddess Izanami (Nishikawa Sukenobu)","18th c.","manuscript"),
          S("S12","Kobayashi Eitaku: Izanami and Izanagi Creating the Islands","19th c.","manuscript")])

ent("jpn-izananami","Izanami","伊邪那美命",["Izanami-no-Mikoto","Izanami"],
    "deity","female",["creation","death","underworld"],
    partners=["jpn-izananagi"], children=["jpn-amaterasu","jpn-tsurugumo","jpn-susanoo","jpn-kagutsuchi","jpn-konohanasakuhana"],
    realms=["jpn-takamagahara","jpn-yomi"], places=["Onogoro"],
    myths=["jpn-creation-islands","jpn-izananagis-purification"],
    short="Female member of the divine creator pair who, with Izanagi, formed the Japanese islands; after dying in childbirth, became associated with the Land of Yomi (the dead).",
    long="Izanami ('He/She who Invites') is the female progenitor who, together with Izanagi, forms the islands and gives birth to the deities [S1]. In the Kojiki, she dies in giving birth to the fire god Kagutsuchi, her body consumed by the fire of childbirth [S1]. Grief-stricken, Izanagi descends to Yomi to bring her back; finding her decayed and attended by 'the eight devils of rotting,' he flees, and the two are separated at the threshold—the origin of the divide between the clean world of the living and the polluted realm of the dead [S1]. Thereafter Izanami is associated with Yomi and with death, while Izanagi remains with the living and heavenly realms [S1][S2]. She thus spans creation and mortality, a pivotal figure in Japanese eschatology.",
    facts=["Dies in childbirth to the fire god Kagutsuchi [S1].",
           "Her separation from Izanagi at the threshold of Yomi is the mythic origin of death and impurity (kegare) [S1].",
           "Associated with the Land of Yomi, the realm of the dead [S1]."],
    unc=["The Yomi-separation episode and its details (the 'hedge' of hedges, the point of no return, the exact sequence) differ between the Kojiki and Nihon Shoki [S1][S2].",
         "The precise list of kami born in the island-formation sequence is not identical across the two texts [S1][S2]."],
    art=["jpn-art-izanagi-izanami-nishikawa","jpn-art-izanagi-izanami-kobayashi","jpn-art-izanagi-izanami-shinbutsu"],
    hero="jpn-art-izanagi-izanami-kobayashi",
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S5","Met: The God Izanagi and Goddess Izanami (Nishikawa Sukenobu)","18th c.","manuscript"),
          S("S12","Kobayashi Eitaku: Izanami and Izanagi Creating the Islands","19th c.","manuscript")])

# --- high deities (born of the creator pair) ---
ent("jpn-amaterasu","Amaterasu","天照大御神",["Amaterasu-ōmikami","Amaterasu-ōmikami","the Sun Goddess"],
    "deity","female",["sun","heaven","imperial ancestry","wheat","prosperity"],
    symbols=["sun","mirror (Yata no Kagami)","magatama jewel"],
    sacred_objects=["Yata no Kagami","Yasakani no Magatama"],
    partners=[], children=["jpn-toyotama"],
    siblings=["jpn-tsurugumo","jpn-susanoo"],
    allies=["jpn-ameno-uzume","jpn-takemikazuchi","jpn-kotohikone"],
    enemies=["jpn-susanoo"],
    realms=["jpn-takamagahara"], places=["Ise","Takamagahara"],
    myths=["jpn-creation-islands","jpn-amaterasu-cave","jpn-ninigi-descent"],
    short="The Sun Goddess and supreme deity of the Shinto high pantheon; ancestress of the Japanese imperial line and the central figure of the Heavenly Rock-Cave myth.",
    long="Amaterasu-ōmikami ('Great Divine Illuminator of Heaven') is the sun goddess and, in later Shinto, the highest deity of the pantheon and the mythic ancestress of the imperial house [S1]. In the Kojiki she is born from Izanagi's left hand (with the jewel) during the birth-sequence after the islands are formed, and she is sent to rule over the High Plain of Heaven [S1]. Her brother Susanoo's violent misconduct leads to his banishment from heaven; when he departs, Amaterasu, in grief and fear, withdraws into the Heavenly Rock-Cave (Ame-no-Ohafutsu), plunging the world into darkness. The other kami, led by the dancing goddess Ame-no-Uzume, lure her back out, restoring light [S1]. From her line descends the heavenly prince Ninigi and, ultimately, the Japanese emperors [S1][S2]. She is the patron of the Ise Grand Shrine and the symbolic center of state Shinto; the mirror Yata no Kagami, one of the three Imperial Regalia, is her emblem [S1].",
    facts=["Born from Izanagi's left hand in the Kojiki's birth sequence [S1].",
           "Her withdrawal into the Rock-Cave is the mythic explanation of the need to 'lure the sun back'—the origin of the cave-dance (kagura) [S1].",
           "The mirror Yata no Kagami is her sacred emblem and one of the three Imperial Regalia [S1].",
           "Ancestress of the imperial line through her grandson Ninigi [S1][S2]."],
    unc=["The cave myth's details (which kami take which roles, the naming of the cave, the precise role of Takemikazuchi) differ between the Kojiki and Nihon Shoki [S1][S2].",
         "Her status as the single 'supreme' deity is a later (medieval-modern) development; the Kojiki presents her as one of the high deities sent to rule a portion of the realms [S1][S2]."],
    art=["jpn-art-amaterasu-cave-met","jpn-art-amaterasu-cave-kunisada","jpn-art-amaterasu-yoshitoshi","jpn-art-amaterasu-shinbutsu","jpn-art-amaterasu-hoen"],
    hero="jpn-art-amaterasu-cave-met",
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S4","Met: Luring the Sun Goddess Amaterasu Out of a Cave (Kōno Bairei)","late 19th c.","manuscript"),
          S("S14","Shinbutsu-gazurra: Amaterasu (Kanda Genbun, 1720)","1720","manuscript"),
          S("S15","Utagawa Kunisada: Amaterasu cave","1856","print"),
          S("S9","Tsukioka Yoshitoshi: Amaterasu appearing from the cave","19th c.","print")])

ent("jpn-tsurugumo","Tsukuyomi","月読命",["Tsukuyomi-no-Mikoto","Tsukuyomi"],
    "deity","male",["moon","night"],
    siblings=["jpn-amaterasu","jpn-susanoo"],
    realms=["jpn-takamagahara"], places=["Takamagahara"],
    myths=["jpn-creation-islands"],
    short="The Moon God, born of the creator pair; in the Kojiki he is estranged from Amaterasu after desecrating the weaving hall, marking the separation of sun and moon.",
    long="Tsukuyomi-no-Mikoto ('He who Illuminates the Night') is the moon god, born in the Kojiki's sequence (from Izanagi's right hand) alongside his siblings Amaterasu and Susanoo [S1]. In the Kojiki, he visits the Palace of the Weaving of Garments (where the goddess Ukehimuka weaves) and kills her there; because the act pollutes the sacred weaving place, Amaterasu is disgusted and declares that she and Tsukuyomi shall no longer share the same palace—the mythic basis for the separate courses of sun and moon [S1]. He is thus a figure of the night and of the separation of the solar and lunar realms. His role is relatively minor in the corpus; he has little developed mythology beyond this estrangement [S1][S2].",
    facts=["The Kojiki's account of his killing Ukehimuka in the weaving hall is the mythic reason sun and moon are 'estranged' [S1].",
           "He has comparatively little developed mythology beyond this single episode [S1]."],
    unc=["The exact circumstances of the Ukehimuka episode and its wording differ between the Kojiki and Nihon Shoki [S1][S2].",
         "Some scholars note that the 'separation of sun and moon' is a cosmogonic motif rather than a developed narrative about Tsukuyomi personally [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-susanoo","Susanoo","須佐之男命",["Susanoo-no-Mikoto","Suso-no-o","the Storm God"],
    "deity","male",["storm","sea","war","the hero-slayer of monsters"],
    symbols=["storm","sea","sword (Kusanagi, from the serpent's tail)"],
    weapons=["Kusanagi (Ame-murakumo-no-tsurugi)"],
    sacred_objects=["Kusanagi"],
    siblings=["jpn-amaterasu","jpn-tsurugumo"],
    partners=["jpn-kushiinadahime"],
    children=["jpn-kushiinadahime"],
    enemies=["jpn-amaterasu","jpn-yamata-no-orochi","jpn-okuninushi"],
    allies=["jpn-takemikazuchi"],
    realms=["jpn-takamagahara","jpn-ashihara"], places=["Izumo","Takehaya"],
    myths=["jpn-creation-islands","jpn-susanoo-orochi","jpn-kuniyurinshi"],
    short="The storm and sea god, younger brother of Amaterasu; famed for slaying the eight-headed serpent Yamata-no-Orochi and for his role in the subjugation of the island (Kuniyurinshi).",
    long="Susanoo-no-Mikoto ('Fierce Male of the Waves') is the storm/sea god, the last and most violent of the three high deities born of the creator pair [S1]. In the Kojiki his disruptive misconduct (desecrating the heavenly rice fields and weaving hall) leads to his banishment from Takamagahara to the earthly realm [S1]. On his way down to Izumo he meets the weeping parents of a family whose daughters are being devoured by the eight-headed, eight-tailed serpent Yamata-no-Orochi; Susanoo slays the beast, and in its tail finds the sword Kusanagi (Ame-murakumo-no-tsurugi) [S1]. He rescues and marries the last daughter, Kushinada-hime [S1]. Later he takes part in the subjugation of the island deity Ōkuninushi (the Kuniyurinshi), working with the thunder god Takemikazuchi [S1]. He is thus a liminal, violent, and heroic figure—storm, sea, and monster-slayer—whose transgressions and triumphs both define him [S1][S2].",
    facts=["Slays the eight-headed serpent Yamata-no-Orochi and finds the sword Kusanagi in its tail [S1].",
           "Banished from Takamagahara for desecrating the heavenly fields and weaving hall [S1].",
           "Co-acts with Takemikazuchi in the subjugation of Ōkuninushi (Kuniyurinshi) [S1]."],
    unc=["The ordering of his exploits (Orochi-slaying vs. the Kuniyurinshi) and some details differ between the Kojiki and Nihon Shoki [S1][S2].",
         "The identity and exact role of the 'sword' he obtains and carries (Kusanagi) is treated differently in the two texts [S1][S2]."],
    art=["jpn-art-susanoo-orochi-yoshitoshi","jpn-art-susanoo-kuniyoshi","jpn-art-susanoo-chikanobu"],
    hero="jpn-art-susanoo-orochi-yoshitoshi",
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S10","Tsukioka Yoshitoshi: Susanoo slays Yamata-no-Orochi in Izumo","19th c.","print"),
          S("S9","Utagawa Kuniyoshi: Dragon Susanoo no mikoto and the water dragon","19th c.","print"),
          S("S11","Toyohara Chikanobu: Susanoo rescues Kushinada Hime","1886","print")])

ent("jpn-kagutsuchi","Kagutsuchi","迦具土神",["Kagutsuchi-no-Kami","Hinode-no-Kami","the Fire God"],
    "deity","male",["fire","mountain"],
    siblings=["jpn-amaterasu","jpn-tsurugumo","jpn-susanoo","jpn-konohanasakuhana"],
    realms=["jpn-yomi"], places=[],
    myths=["jpn-creation-islands","jpn-izananagis-purification"],
    short="The Fire God, whose birth in the flames of childbirth kills his mother Izanami, driving the Kojiki's Yomi-separation episode.",
    long="Kagutsuchi (also Hinode-no-Kami, 'Fire God') is the deity of fire, born in the Kojiki's sequence as the child whose birth kills his mother: Izanami, giving birth to him, is burned by the fire of childbirth and dies [S1]. His birth is the catalytic event of the myth: it sends Izanagi down to Yomi and produces the separation of the living and dead realms [S1]. He is associated with fire, heat, and (in some accounts) volcanic/mountain activity. He has little independent mythology beyond this pivotal, tragic birth [S1][S2].",
    facts=["His birth in fire kills Izanami, triggering the Yomi episode [S1].",
           "Associated with fire and volcanic/mountain activity [S1]."],
    unc=["The precise sequence of the birth sequence (which child, in what order) differs between the Kojiki and Nihon Shoki [S1][S2].",
         "Some accounts give him a further role in conflict with Izanagi; these are less well-attested [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-konohanasakuhana","Konohanasakuya-hime","木花咲耶姫",["Konohanasakuya-hime","Konohanasakuya-hime"],
    "deity","female",["flowers","blossom","earth","beauty"],
    siblings=["jpn-okuninushi"],
    partners=["jpn-ninigi"], children=["jpn-hooroni"],
    realms=["jpn-ashihara"], places=["Hyuga","Takachiho"],
    myths=["jpn-ninigi-descent"],
    short="The 'Flower-Blossom' goddess of the earthly realm, daughter of Ōkuninushi, who marries the descending heavenly prince Ninigi and bears the imperial ancestor Hooroni.",
    long="Konohanasakuya-hime ('Blossoming of the Wood-Flower') is the goddess of flowers and the earthly realm, a daughter of the island god Ōkuninushi [S1]. When the heavenly prince Ninigi descends to the middle land (Ashihara-no-Nakatsukuni), she is the first earthly bride he takes; from their union is born (in the genealogy) the line that leads to the imperial ancestor Hooroni [S1]. She embodies the fertile, blossoming earth that the heavenly line is sent to rule. Her name is a poetic compound evoking the flowering of a tree (wood + flower + blossom). [S1][S2]",
    facts=["Daughter of the island god Ōkuninushi [S1].",
           "First earthly bride of the descending prince Ninigi [S1].",
           "Her name poetically fuses 'wood,' 'flower,' and 'blossom' [S1]."],
    unc=["Her exact parentage (daughter of Ōkuninushi vs. a local mountain deity) and the precise genealogy to Hooroni vary between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-ninigi","Ninigi","迩邇岐命",["Ninigi-no-Mikoto","the Heavenly Prince"],
    "deity","male",["heavenly descent","rule","imperial ancestry"],
    parents=["jpn-amaterasu"], partners=["jpn-konohanasakuhana","jpn-toyotama"],
    children=["jpn-hooroni"],
    allies=["jpn-sarutahiko"], enemies=["jpn-okuninushi"],
    realms=["jpn-takamagahara","jpn-ashihara"], places=["Hyuga","Takachiho","Izumo"],
    myths=["jpn-ninigi-descent","jpn-kuniyurinshi"],
    short="The 'Heavenly Prince' (grandson of Amaterasu) sent down to rule the middle land; central to the Tenson Kōryō (descent of the heavenly deity) and the founding of the imperial line.",
    long="Ninigi-no-Mikoto is the heavenly prince, grandson of Amaterasu, sent down from Takamagahara to take rule of the middle land (Ashihara-no-Nakatsukuni) [S1]. His descent (Tenson Kōryō) alights at Takachiho in Hyuga (Kyūshū) [S1]. On the way, guided by the crossroads god Sarutahiko, he is confronted by the island god Ōkuninushi and his retinue, who resist the heavenly takeover; after the contest (the throwing of the sword) and the subjugation (Kuniyurinshi), Ōkuninushi hands over the land and the sacred regalia [S1]. Ninigi takes the earthly bride Konohanasakuya-hime and later the heavenly bride Toyotama-hime (Amaterasu's daughter); their son Hooroni (Ōyahata) is the ancestor of the emperors [S1][S2]. He is thus the hinge figure between the heavenly and earthly realms and the founding link in the imperial genealogy.",
    facts=["Grandson of Amaterasu; sent down to rule the middle land [S1].",
           "His descent alights at Takachiho in Hyūga (Kyūshū) [S1].",
           "Ancestor (through Hooroni) of the Japanese emperors [S1][S2]."],
    unc=["The exact mechanism of the descent and the sequence of the Ōkuninushi contest differ between the Kojiki and Nihon Shoki [S1][S2].",
         "His parentage (grandson of Amaterasu) and the precise link to Hooroni are stated differently in the two texts [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-toyotama","Toyotama-hime","豊玉姫",["Toyotama-hime","Hohodemi","Watatsumi (as sea goddess)"],
    "deity","female",["sea","heaven","imperial ancestry"],
    parents=["jpn-amaterasu"], partners=["jpn-ninigi"], children=["jpn-hooroni"],
    realms=["jpn-takamagahara","jpn-ashihara"], places=["sea"],
    myths=["jpn-ninigi-descent"],
    short="Daughter of Amaterasu and the 'heavenly bride' of Ninigi; when she gives birth to Hooroni at sea, she becomes the sea goddess (Watatsumi), the mythic origin of the sea.",
    long="Toyotama-hime ('Abundant Jewel Princess'), also called Hohodemi, is a daughter of Amaterasu sent down as the 'heavenly bride' of the descending prince Ninigi [S1]. In the Kojiki she gives birth to their son Hooroni (Ōyahata) in a small hut (hori-hutsu) at sea; when Ninigi, impatient, opens the hut, smoke and blood issue and the sea is born—thereafter Toyotama-hime is identified with the sea as the goddess Watatsumi [S1]. She thus embodies the heavenly line's union with the earthly/sea realm and the mythic origin of the sea. The genealogy from her to the emperors (through Hooroni) is a key part of the imperial founding myth [S1][S2].",
    facts=["Daughter of Amaterasu, sent as Ninigi's heavenly bride [S1].",
           "Her giving birth to Hooroni at sea is the mythic origin of the sea [S1].",
           "Later identified with the sea goddess Watatsumi [S1]."],
    unc=["The 'birth at sea' episode and its wording (the opening of the hori-hutsu, the origin of the sea) differ between the Kojiki and Nihon Shoki [S1][S2].",
         "Her exact position in the imperial genealogy (vs. Konohanasakuya-hime) is stated differently in the two texts [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-hooroni","Hooroni (Ōyahata)","火遠理命",["Ōyahata-no-Mikoto","Hooroninini"],
    "deity","male",["imperial ancestry"],
    parents=["jpn-ninigi","jpn-toyotama"],
    realms=["jpn-ashihara"], places=[],
    myths=["jpn-ninigi-descent"],
    short="Son of Ninigi and Toyotama-hime, born at sea; the direct ancestor in the mythic line leading to the Japanese emperors.",
    long="Hooroni (Ōyahata-no-Mikoto) is the son of the heavenly prince Ninigi and his heavenly bride Toyotama-hime, born in the 'birth at sea' episode [S1]. He is the link in the mythic genealogy from the heavenly line to the historical (semi-legendary) emperors; the line proceeds Hooroni → Hibi → … → Emperor Jimmu (the first historical-legendary emperor) [S1][S2]. He is a genealogical figure rather than a character with developed mythology.",
    facts=["Born at sea to Ninigi and Toyotama-hime [S1].",
           "Ancestor in the line to Emperor Jimmu (first legendary emperor) [S1][S2]."],
    unc=["The exact length and names of the generational chain from Hooroni to Jimmu are given in the Nihon Shoki's imperial genealogy; the Kojiki is terser [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

# --- earthly realm gods ---
ent("jpn-okuninushi","Ōkuninushi","大国主神",["Ōkuninushi-no-Kami","the Great Lord of the Country"],
    "deity","male",["earth","the country","healing","agriculture"],
    children=["jpn-konohanasakuhana"],
    partners=[], enemies=["jpn-susanoo","jpn-ninigi","jpn-takemikazuchi"],
    allies=["jpn-kotohikone","jpn-sarutahiko"],
    realms=["jpn-ashihara"], places=["Izumo"],
    myths=["jpn-kuniyurinshi","jpn-ninigi-descent"],
    short="The 'Great Lord of the Country,' the powerful indigenous deity of the middle land who resists, then yields, the heavenly takeover (the Kuniyurinshi).",
    long="Ōkuninushi-no-Kami ('Great Lord of the Country') is the powerful indigenous deity of the earthly realm (Ashihara-no-Nakatsukuni), especially associated with Izumo [S1]. In the Kojiki's Kuniyurinshi ('pacification/subjugation of the country') episode, when the heavenly prince Ninigi is sent down to rule, Ōkuninushi and his retinue (led by the crossroads god Sarutahiko) resist the heavenly takeover [S1]. After a contest—centered on the throwing of the sword and the subduing of Sarutahiko—Ōkuninushi is defeated and yields the land, handing over the three sacred regalia (mirror, jewel, sword) as pledge [S1]. Thereafter he is a deity of the earth, healing, and agriculture (especially in Izumo), but no longer the sovereign of the whole land. He is a complex figure: the displaced indigenous power who becomes a local, beneficent deity [S1][S2].",
    facts=["The 'Great Lord of the Country,' the indigenous sovereign of the middle land [S1].",
           "Defeated in the Kuniyurinshi contest and yields the land to the heavenly line [S1].",
           "Thereafter a deity of the earth, healing, and agriculture, especially in Izumo [S1]."],
    unc=["The exact sequence of the contest (the sword-throw, the subduing of Sarutahiko, which regalia are handed over) differs between the Kojiki and Nihon Shoki [S1][S2].",
         "Whether he 'yields' the land or is 'subjugated,' and the role of Kotohikone in the marriage/alliance, are treated differently in the two texts [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-kotohikone","Kotohikone","国常立尊",["Kotohikone-no-Mikoto","Kotowakahikone"],
    "deity","male",["marriage","alliance","the middle land"],
    allies=["jpn-okuninushi","jpn-amaterasu"],
    realms=["jpn-ashihara"], places=["Izumo"],
    myths=["jpn-kuniyurinshi","jpn-ninigi-descent"],
    short="The 'Ever-Standing in the Country' deity, a mediator/alliance figure in the Kuniyurinshi who brokers the marriage tying the heavenly and earthly lines.",
    long="Kotohikone-no-Mikoto ('Ever-Standing in the Country') is a deity of the earthly realm who, in the Kuniyurinshi episode, serves as a mediator and alliance figure [S1]. He is associated with the marriage/alliance that ties the heavenly line (Ninigi) to the earthly line, and with the yielding of the land by Ōkuninushi [S1]. His exact role—whether a separate deity, a title, or an aspect—varies; in some accounts he is the one who brokers the union and the handover of the regalia [S1][S2]. He is a minor but structurally important figure in the founding myth.",
    facts=["A mediator/alliance figure in the Kuniyurinshi [S1].",
           "Associated with the marriage tying the heavenly and earthly lines [S1]."],
    unc=["His identity (separate deity vs. title vs. aspect of another) and his precise role in the handover differ between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-sarutahiko","Sarutahiko","猿田彦命",["Sarutahiko-no-Ōkami","the Monkey-Field God"],
    "deity","male",["crossroads","guidance","the middle land"],
    allies=["jpn-okuninushi","jpn-ninigi"],
    realms=["jpn-ashihara"], places=["Izumo"],
    myths=["jpn-kuniyurinshi","jpn-ninigi-descent"],
    short="The 'Monkey-Field' crossroads god who guides the descending prince Ninigi through the earthly realm, and is subdued in the Kuniyurinshi contest.",
    long="Sarutahiko-no-Ōkami ('Monkey-Field God') is a deity of crossroads and guidance, especially in Izumo [S1]. In the Kuniyurinshi he is the lead of Ōkuninushi's retinue who resists the heavenly prince Ninigi; he is the one who, carrying the sword, is subdued in the contest, clearing the way for the heavenly takeover [S1]. He is also the guide who leads Ninigi through the earthly realm on his descent [S1]. He is a liminal figure of the crossroads and the threshold between the heavenly and earthly realms [S1][S2].",
    facts=["A deity of crossroads and guidance [S1].",
           "Leads Ōkuninushi's retinue and is subdued in the Kuniyurinshi contest [S1].",
           "Guides the descending prince Ninigi [S1]."],
    unc=["The exact sequence of his subduing (the sword, the 'heavenly gods are strong' line) and his role as guide differ between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

# --- supporting kami ---
ent("jpn-ameno-uzume","Ame-no-Uzume","天鈿女命",["Ame-no-Uzume-no-Mikoto","the Heavenly Dancing Goddess"],
    "deity","female",["dance","joy","the lure of the sun"],
    allies=["jpn-amaterasu"],
    realms=["jpn-takamagahara"], places=["Takamagahara"],
    myths=["jpn-amaterasu-cave"],
    short="The 'Heavenly Dancing Goddess' whose dance, in the Rock-Cave myth, lures Amaterasu back out and restores the light.",
    long="Ame-no-Uzume-no-Mikoto ('Heavenly Uzume') is the dancing goddess who, in the Heavenly Rock-Cave myth, performs the central act of restoration [S1]. When Amaterasu withdraws into the cave and the world is dark, the other kami devise a plan; Ame-no-Uzume dances (a ritual kagura) on an upturned tub, and her dance, with the assembled kami's clamor, provokes Amaterasu's curiosity and joy, drawing her to the cave mouth so that she is lured back into the light [S1]. She is the embodiment of the dance that 'lures the sun back,' and the kagura (Shinto ritual dance) is ritually linked to her act [S1][S2].",
    facts=["Her dance in the Rock-Cave myth restores the light [S1].",
           "The kagura (Shinto ritual dance) is ritually linked to her act [S1]."],
    unc=["The precise role of each deity in the cave myth (and the naming of the cave and the 'deities of the cave') differs between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S16","Elstner Hilton: Kagura-Dance-Shinto-1914","1914","manuscript")])

ent("jpn-takemikazuchi","Takemikazuchi","武甕槌命",["Takemikazuchi-no-Mikoto","the Thunder/War God"],
    "deity","male",["thunder","war","the contest-sword"],
    weapons=["sword (Kusanagi)"],
    allies=["jpn-amaterasu","jpn-susanoo","jpn-okuninushi"],
    enemies=["jpn-okuninushi"],
    realms=["jpn-takamagahara","jpn-ashihara"], places=["Izumo"],
    myths=["jpn-amaterasu-cave","jpn-kuniyurinshi"],
    short="The thunder/war god who throws the sword in the Kuniyurinshi contest and plays a role in luring Amaterasu from the cave.",
    long="Takemikazuchi-no-Mikoto ('Sword Thunder God') is a deity of thunder and war [S1]. In the Kuniyurinshi episode he is the one who throws the sword (Kusanagi) from the high land to the middle land, hitting the target and demonstrating the heavenly gods' strength in the contest with Ōkuninushi's side [S1]. He also plays a role in the Rock-Cave myth, where the assembled deities (including him) make the clamor that draws Amaterasu out [S1]. He is a martial, thunder-associated figure in the high and earthly realms [S1][S2].",
    facts=["Throws the sword (Kusanagi) in the Kuniyurinshi contest [S1].",
           "Plays a role in the clamor that lures Amaterasu from the cave [S1]."],
    unc=["The exact sequence of his acts (which myth, in what order) differs between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

ent("jpn-kushiinadahime","Kushinada-hime","櫛名田比卖",["Kushiinadahime","Kushinada-hime"],
    "deity","female",["the rescued bride","Izumo"],
    partners=["jpn-susanoo"],
    realms=["jpn-ashihara"], places=["Izumo"],
    myths=["jpn-susanoo-orochi"],
    short="The last daughter of the family whose daughters were devoured by Yamata-no-Orochi; rescued and married by Susanoo after he slays the serpent.",
    long="Kushinada-hime ('Comb-Field Princess') is the last of the eight daughters of the family in Izumo whose older sisters had been devoured by the eight-headed serpent Yamata-no-Orochi [S1]. Susanoo, on his way down to the earthly realm, learns of her impending fate, turns himself into a hair-comb, and has her wear it; when the serpent comes for her, he slays it and rescues her, and they marry [S1]. She is thus the 'rescued bride' of the Orochi myth, a figure of deliverance from the monster [S1][S2].",
    facts=["Last of the eight daughters threatened by Yamata-no-Orochi [S1].",
           "Rescued and married by Susanoo after he slays the serpent [S1]."],
    unc=["The family's identity (the 'parents' and their lineage) and some details of the rescue differ between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None),
          S("S11","Toyohara Chikanobu: Susanoo rescues Kushinada Hime","1886","print")])

# --- monster ---
ent("jpn-yamata-no-orochi","Yamata-no-Orochi","八岐大蛇",["Yamata no Orochi","the Eight-Headed Serpent"],
    "monster","none",["serpent","monster","the devoured daughters"],
    enemies=["jpn-susanoo"],
    realms=["jpn-ashihara"], places=["Izumo"],
    myths=["jpn-susanoo-orochi"],
    short="The eight-headed, eight-tailed serpent that devours the daughters of the Izumo family and is slain by Susanoo, whose tail yields the sword Kusanagi.",
    long="Yamata-no-Orochi ('Eight-Branched Great Serpent') is the great serpent monster of the Izumo region, with eight heads and eight tails [S1]. It devours the daughters of a local family one by one (seven of the eight), and the last, Kushinada-hime, is next [S1]. Susanoo slays the beast—traditionally by luring it with sweetened sake in eight vats and cutting it down—and in its tail he finds the sword Kusanagi (Ame-murakumo-no-tsurugi) [S1]. It is the archetypal Japanese serpent monster, a force of destructive chaos overcome by the hero-god [S1][S2].",
    facts=["Eight heads and eight tails [S1].",
           "Deviours seven of the eight daughters of the Izumo family [S1].",
           "Its tail yields the sword Kusanagi to Susanoo [S1]."],
    unc=["The method of the slaying (the eight vats of sake, the cutting) and some details differ between the Kojiki and Nihon Shoki [S1][S2]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S2","Nihon Shoki","720 CE","text",None)])

# --- later / non-Kojiki deities (showing the tradition's depth) ---
ent("jpn-inari","Inari","稲荷",["Inari Ōkami","the Fox deity"],
    "deity","unknown",["rice","prosperity","foxes","commerce"],
    animals=["fox (kitsune)"],
    realms=["jpn-ashihara"], places=["Fushimi Inari","Kyoto"],
    myths=[],
    short="The 'Rice' deity (Inari Ōkami) of rice, prosperity, and foxes, with the great Fushimi Inari shrine; a later (Heian-onward) development, not a Kojiki figure.",
    long="Inari Ōkami is the deity of rice, prosperity, and the fox (kitsune), centered on the great Fushimi Inari Taisha in Kyōto [S1]. Unlike the high deities of the Kojiki, Inari is a later (Heian-period and later) development of Shinto, illustrating that the Japanese tradition continued to grow long after the 8th-century mythographic compilations [S1][S21]. The deity is often represented as a female figure and is attended by foxes, which serve as messengers. Inari's rise reflects the agricultural and mercantile concerns of later Japanese religion, and it shows that 'Japanese mythology' is not a closed 8th-century corpus but a living, accreting tradition [S1][S21].",
    facts=["Deity of rice, prosperity, and the fox [S1].",
           "Centered on Fushimi Inari Taisha in Kyōto [S1].",
           "A later (Heian-onward) development, not a Kojiki figure [S21]."],
    unc=["Inari's gender (often female, sometimes paired male-female, sometimes genderless) is not fixed and varies by shrine and period [S1][S21].",
         "The deity's precise nature and the identity of the 'foxes' as messengers vs. embodiments are debated [S1][S21]."],
    srcs=[S("S1","Kojiki (Chamberlain tr.)","712 CE","text","https://sacred-texts.com/shi/kojiki.htm"),
          S("S21","Shinto: A Very Short Introduction (Sue Keown)","2010","scholarly",None)])

# --- hero ---
ent("jpn-yamato-takeru","Yamato Takeru","日本武尊",["Yamato Takeru-no-Mikoto","the Brave Hero of Yamato"],
    "hero","male",["hero","war","the imperial line"],
    parents=[],
    realms=["jpn-ashihara"], places=["Ise"],
    myths=[],
    short="A semi-legendary imperial prince-hero of the 7th-century tradition, famed for his campaigns; a literary/legendary hero rather than a Kojiki deity.",
    long="Yamato Takeru-no-Mikoto ('Brave Hero of Yamato') is a semi-legendary prince-hero of the Japanese imperial line, a central figure of later (7th-century and later) legend and the 'heroic' stratum of Japanese narrative [S2]. He is famed for his campaigns (the eastern and southern subjugations) and his death by a trick (the 'arrow that sings'). He belongs to the heroic/legendary layer rather than the primordial Kojiki theogony, and he illustrates the range of the Japanese tradition from cosmic theogony to imperial hero-legend [S1][S2][S21].",
    facts=["A semi-legendary imperial prince-hero [S2].",
           "Famed for his campaigns and his death by a trick (the 'arrow that sings') [S2].",
           "Belongs to the heroic/legendary layer, not the primordial theogony [S21]."],
    unc=["His historicity is uncertain; he is a legend/semi-legendary figure, and the details of his exploits are literary [S2][S21]."],
    srcs=[S("S2","Nihon Shoki","720 CE","text",None),
          S("S21","Shinto: A Very Short Introduction (Sue Keown)","2010","scholarly",None)])

dump("entities.json", E)

# ---------------- RELATIONSHIPS ----------------
R = []
def rel(f,t,typ,note,conf="attested",srcs=["S1"],explanation=None):
    r = {"source": f, "target": t, "type": typ, "note": note, "confidence": conf, "sources": srcs}
    if explanation: r["explanation"] = explanation
    R.append(r)

# primordial -> creator pair
rel("jpn-amenominakanushi","jpn-izananagi","CREATED","The high-plain deity 'gives birth to' / commands the birth of Izanagi.","attested",["S1","S2"],
    "The Kojiki words this as the kami of the high plain 'giving birth to' the pair and ordering them to shape the islands; the Nihon Shoki phrases it as a command. Whether 'birth' is literal or a ritual/creative order is debated.")
rel("jpn-amenominakanushi","jpn-izananami","CREATED","The high-plain deity 'gives birth to' / commands the birth of Izanami.","attested",["S1","S2"],
    "As with Izanagi: the Kojiki's 'birth' of the creator pair from the high plain vs. the Nihon Shoki's 'command.'")
rel("jpn-izananagi","jpn-izananami","PARTNER_OF","Izanagi and Izanami are the wed creator pair.","attested",["S1","S2"])
# creator pair -> high deities
for kid in ["jpn-amaterasu","jpn-tsurugumo","jpn-susanoo","jpn-kagutsuchi","jpn-konohanasakuhana"]:
    rel("jpn-izananagi",kid,"PARENT_OF","Izanagi is a parent of the high deity born in the creation sequence.","attested",["S1","S2"],
        "The exact birth sequence (which child, from which hand) differs between the Kojiki and Nihon Shoki.")
    rel("jpn-izananami",kid,"PARENT_OF","Izanami is a parent of the high deity born in the creation sequence.","attested",["S1","S2"],
        "As above; the parentage is shared by the creator pair, but the precise sequence varies across the two texts.")
# siblings among the high deities
for a,b in [("jpn-amaterasu","jpn-tsurugumo"),("jpn-amaterasu","jpn-susanoo"),("jpn-tsurugumo","jpn-susanoo"),
            ("jpn-amaterasu","jpn-kagutsuchi"),("jpn-amaterasu","jpn-konohanasakuhana"),
            ("jpn-tsurugumo","jpn-kagutsuchi"),("jpn-susanoo","jpn-kagutsuchi"),("jpn-susanoo","jpn-konohanasakuhana")]:
    rel(a,b,"SIBLING_OF","Siblings among the high deities born of the creator pair.","attested",["S1","S2"])
# estrangement
rel("jpn-amaterasu","jpn-tsurugumo","ENEMY_OF","Amaterasu is estranged from Tsukuyomi after he desecrates the weaving hall (the mythic separation of sun and moon).","attested",["S1","S2"],
    "This is a mythic 'estrangement' (the separate courses of sun and moon), not a battle. The Kojiki's Ukehimuka episode is the stated cause; wording differs in the Nihon Shoki.")
rel("jpn-amaterasu","jpn-susanoo","ENEMY_OF","Amaterasu and Susanoo are estranged after his violent misconduct; he is banished from heaven.","attested",["S1","S2"],
    "A mythic estrangement/banishment rather than a battle. The list of his 'transgressions' (fields, weaving hall) differs slightly between the texts.")
# Susanoo's exploits
rel("jpn-susanoo","jpn-yamata-no-orochi","KILLED","Susanoo slays the eight-headed serpent Yamata-no-Orochi.","attested",["S1","S2"])
rel("jpn-susanoo","jpn-kushiinadahime","PARTNER_OF","Susanoo marries the rescued Kushinada-hime.","attested",["S1","S2"])
rel("jpn-kushiinadahime","jpn-susanoo","PARTNER_OF","Kushinada-hime marries Susanoo (symmetric).","attested",["S1","S2"])
# Kagutsuchi's birth kills Izanami
rel("jpn-kagutsuchi","jpn-izananami","KILLED","The fire of Kagutsuchi's birth burns and kills his mother Izanami.","attested",["S1","S2"],
    "The Kojiki states that in giving birth to the fire god, Izanami 'was burned and died.' The 'killing' is the fire of childbirth, not a deliberate act.")
# Amaterasu's line
rel("jpn-amaterasu","jpn-toyotama","PARENT_OF","Amaterasu is the parent of the heavenly bride Toyotama-hime.","attested",["S1","S2"])
rel("jpn-amaterasu","jpn-ninigi","ASSOCIATED_WITH","Ninigi is Amaterasu's grandson, the sent-down heavenly prince.","attested",["S1","S2"],
    "The Kojiki makes Ninigi the grandson of Amaterasu (through the line); the precise generational link (Toyotama-hime as the intermediate) is stated in the descent episode.")
rel("jpn-amaterasu","jpn-toyotama","PARTNER_OF","","attested",["S1"]) if False else None
rel("jpn-ninigi","jpn-konohanasakuhana","PARTNER_OF","Ninigi marries the earthly bride Konohanasakuya-hime.","attested",["S1","S2"])
rel("jpn-ninigi","jpn-toyotama","PARTNER_OF","Ninigi marries the heavenly bride Toyotama-hime.","attested",["S1","S2"])
rel("jpn-ninigi","jpn-hooroni","PARENT_OF","Ninigi (with Toyotama-hime) is the parent of Hooroni, the imperial ancestor.","attested",["S1","S2"])
rel("jpn-toyotama","jpn-hooroni","PARENT_OF","Toyotama-hime (with Ninigi) is the parent of Hooroni.","attested",["S1","S2"])
rel("jpn-okuninushi","jpn-konohanasakuhana","PARENT_OF","Ōkuninushi is the parent of the flower goddess Konohanasakuya-hime.","attested",["S1","S2"],
    "Some accounts make her a daughter of Ōkuninushi; others a local mountain deity. The Kojiki/Nihon Shoki differ on the exact parentage.")
# Kuniyurinshi
rel("jpn-takemikazuchi","jpn-okuninushi","FOUGHT","Takemikazuchi throws the sword in the contest against Ōkuninushi's side.","attested",["S1","S2"],
    "The 'contest' (the sword-throw) is the Kuniyurinshi; the sequence of acts differs between the Kojiki and Nihon Shoki.")
rel("jpn-susanoo","jpn-okuninushi","FOUGHT","Susanoo takes part in the subjugation of Ōkuninushi (Kuniyurinshi).","attested",["S1","S2"])
rel("jpn-ninigi","jpn-okuninushi","FOUGHT","Ninigi's heavenly side confronts Ōkuninushi in the Kuniyurinshi.","attested",["S1","S2"])
rel("jpn-ninigi","jpn-sarutahiko","ASSOCIATED_WITH","Sarutahiko guides Ninigi and is subdued in the contest.","attested",["S1","S2"])
rel("jpn-okuninushi","jpn-sarutahiko","ALLY_OF","Sarutahiko leads Ōkuninushi's retinue.","attested",["S1","S2"])
rel("jpn-okuninushi","jpn-kotohikone","ALLY_OF","Kotohikone brokers the alliance/marriage in the handover.","attested",["S1","S2"])
rel("jpn-okuninushi","jpn-ninigi","SUCCESSOR_OF","","attested",["S1"]) if False else None
rel("jpn-ninigi","jpn-okuninushi","SUCCESSOR_OF","The heavenly line (Ninigi) succeeds to rule the land that Ōkuninushi held.","attested",["S1","S2"],
    "The 'succession' is the transfer of sovereignty in the Kuniyurinshi; Ōkuninushi becomes a local deity thereafter.")
rel("jpn-okuninushi","jpn-ninigi","RULES","Ōkuninushi rules the middle land (until the Kuniyurinshi).","attested",["S1","S2"])
rel("jpn-ninigi","jpn-ashihara","RULES","","attested",["S1"]) if False else None
# cave myth
rel("jpn-ameno-uzume","jpn-amaterasu","ALLY_OF","Ame-no-Uzume's dance lures Amaterasu out of the cave.","attested",["S1","S2"])
rel("jpn-takemikazuchi","jpn-amaterasu","ALLY_OF","Takemikazuchi's clamor helps draw Amaterasu out.","attested",["S1","S2"])
# Inari (later) — associated, not genealogical
rel("jpn-inari","jpn-ashihara","RULES","","attested",["S21"]) if False else None

dump("relationships.json", R)

# ---------------- MYTHS ----------------
M = []
def myth(id, title, summary, participants, srcs, variants=None, unc=None, chapters=None, art=None):
    m = {"id": id, "culture": C, "title": title, "summary": summary,
         "participants": participants, "primary_sources": srcs}
    if variants: m["variants"] = variants
    if unc: m["uncertainty_notes"] = unc
    if chapters: m["chapters"] = chapters
    if art: m["art"] = art
    M.append(m)

myth("jpn-creation-primordial","The Primordial Beginning and the High Plain of Heaven",
    "In the Kojiki's opening, when 'the heavenly high plain had just come into being,' the first-born deity Takamimusubi ('the high divine origin of heavenly things') is named, and the deities of the High Plain of Heaven (Amenominakanushi) 'give birth to' or command the birth of the creator pair Izanagi and Izanami, ordering them to shape and settle the earthly islands [S1]. This establishes the vertical cosmology: a high heavenly realm above, an earthly realm below, with the creative pair sent from above to order the world below [S1][S2].",
    ["jpn-kamimusubi","jpn-amenominakanushi","jpn-izananagi","jpn-izananami"],
    ["S1","S2"],
    variants=[{"name":"Kojiki version","description":"Names the first-born Kamimusubi and the high-plain deities, then the 'birth' of the creator pair and the command to shape the islands."},
              {"name":"Nihon Shoki version","description":"A parallel account that phrases the 'birth' of the creator pair as a command/order from the heavenly realm, with different wording and emphasis."}],
    unc="The precise relationship among Takamimusubi/Kamimusubi/Aminakanushi and the 'birth' of the creator pair is not clearly stated; the Kojiki and Nihon Shoki word the mechanism ('birth' vs. 'command') differently [S1][S2].",
    chapters=[
        {"heading":"The High Plain of Heaven","body":"The Kojiki opens in the time when the heavenly high plain (Takamagahara) had just come into being [S1]."},
        {"heading":"The First-Born","body":"First of all was born the high divine origin of heavenly things, Takamimusubi; his younger brothers Kamimusubi and Aminakanushi follow [S1]."},
        {"heading":"The Creator Pair","body":"The kami of the high plain 'give birth to' Izanagi and Izanami and order them to shape and settle the earthly islands [S1]."}],
    art=[])

myth("jpn-creation-islands","Izanagi and Izanami Form the Islands",
    "The creator pair Izanagi and Izanami stand on the Floating Bridge of Heaven (Ame-no-ukihashi) and, with the jeweled spear Ame-no-nuhokohe, stir the brine of the deep sea; the salt that drips from the spear forms the first island, Onogoro [S1]. There they wed and, in a series of 'birthings,' produce the great islands of Japan (naming them as they are formed) and then the deities (kami) who attend them [S1]. The sequence of islands and the sequence of kami are given in the text, though the two lists differ between the Kojiki and Nihon Shoki [S1][S2].",
    ["jpn-izananagi","jpn-izananami"],
    ["S1","S2"],
    variants=[{"name":"Kojiki island list","description":"The Kojiki names the islands in a specific order as they are 'born.'"},
              {"name":"Nihon Shoki island list","description":"The Nihon Shoki gives a related but not identical list and order of the islands."}],
    unc="The exact list and order of the islands, and which kami are born in which 'birthing,' differ between the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Floating Bridge","body":"Izanagi and Izanami stand on the Floating Bridge of Heaven (Ame-no-ukihashi) over the brine of the sea [S1]."},
        {"heading":"The First Island","body":"With the jeweled spear Ame-no-nuhokohe they stir the brine; the dripping salt forms Onogoro, the first island [S1]."},
        {"heading":"The Islands and the Kami","body":"Over a series of birthings they form the great islands of Japan and give birth to the deities [S1]."}],
    art=["jpn-art-izanagi-izanami-nishikawa","jpn-art-izanagi-izanami-kobayashi","jpn-art-izanagi-izanami-shinbutsu"])

myth("jpn-izananagis-purification","Izanami's Death and the Separation of the World (Izanagi's Purification)",
    "In giving birth to the fire god Kagutsuchi, Izanami is burned and dies [S1]. Izanagi descends to the Land of Yomi to bring her back; finding her decayed and attended by the 'devils of rotting,' he flees, and the two are separated at the threshold—the mythic origin of the divide between the clean world of the living and the polluted realm of the dead [S1]. Fleeing to the world of the living, Izanagi performs a ritual purification (misogi), washing his body; from his washed body-parts a series of kami are born, and the separation is made permanent [S1]. This is the foundational myth of death, impurity (kegare), and purification in Japanese religion [S1][S2].",
    ["jpn-izananagi","jpn-izananami","jpn-kagutsuchi"],
    ["S1","S2"],
    variants=[{"name":"Kojiki Yomi episode","description":"The full descent, the discovery of decay, the flight, the threshold-separation, and the purification with the birth of kami from the washed body-parts."},
              {"name":"Nihon Shoki Yomi episode","description":"A related account with different wording of the descent, the separation point, and the subsequent purification."}],
    unc="The details of the Yomi episode—the 'hedge' of hedges, the exact point of no return, which body-parts birth which kami, and the sequence—differ between the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Fire Birth","body":"Izanami, giving birth to the fire god Kagutsuchi, is burned and dies [S1]."},
        {"heading":"The Descent to Yomi","body":"Izanagi descends to the Land of Yomi to bring her back; he finds her decayed and attended by the 'devils of rotting' [S1]."},
        {"heading":"The Separation","body":"Izanagi flees; at the threshold the two are separated—the origin of the divide between living and dead [S1]."},
        {"heading":"The Purification","body":"Izanagi washes himself (misogi); from his washed body-parts a series of kami are born [S1]."}],
    art=[])

myth("jpn-amaterasu-cave","The Heavenly Rock-Cave (Amaterasu and the Dark World)",
    "After his brother Susanoo is banished from the High Plain of Heaven for his violent misconduct, Amaterasu, in grief and fear, withdraws into the Heavenly Rock-Cave (Ame-no-Ohafutsu), and the world is plunged into darkness [S1]. The assembled kami devise a plan to lure her out: the goddess Ame-no-Uzume performs a dance (on an upturned tub), and with the clamor of the assembled deities (including the thunder god Takemikazuchi) and a held-out mirror, they provoke Amaterasu's curiosity and joy [S1]. She peers out to see what the commotion is, sees her own radiance in the mirror, and is drawn back into the light, restoring the world [S1]. This is the mythic origin of the kagura (ritual dance) and of the 'luring back of the sun' [S1][S2].",
    ["jpn-amaterasu","jpn-susanoo","jpn-ameno-uzume","jpn-takemikazuchi"],
    ["S1","S2"],
    variants=[{"name":"Kojiki cave myth","description":"The full account: Susanoo's banishment, Amaterasu's withdrawal, Ame-no-Uzume's dance, the mirror, and the restoration of light."},
              {"name":"Nihon Shoki cave myth","description":"A related account with different wording of the roles of the deities, the naming of the cave, and the precise sequence."}],
    unc="The precise roles of each deity in the cave myth, the naming of the cave, and the role of Takemikazuchi differ between the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Banishment","body":"Susanoo's violent misconduct leads to his banishment from Takamagahara; Amaterasu is grieved and afraid [S1]."},
        {"heading":"The Withdrawal","body":"Amaterasu withdraws into the Heavenly Rock-Cave, and the world is dark [S1]."},
        {"heading":"The Dance","body":"Ame-no-Uzume dances on an upturned tub; the assembled deities make a clamor; a mirror is held out [S1]."},
        {"heading":"The Return of Light","body":"Amaterasu peers out, sees her radiance in the mirror, and is drawn back into the light [S1]."}],
    art=["jpn-art-amaterasu-cave-met","jpn-art-amaterasu-cave-kunisada","jpn-art-amaterasu-yoshitoshi"])

myth("jpn-susanoo-orochi","Susanoo Slayes Yamata-no-Orochi",
    "On his way down from the banished heaven to the earthly realm (Izumo), Susanoo meets the weeping parents of a family whose daughters are being devoured by the eight-headed, eight-tailed serpent Yamata-no-Orochi; seven of the eight daughters have already been eaten, and the last, Kushinada-hime, is next [S1]. Susanoo asks for her hand, turns himself into a hair-comb, and has her wear it in her hair [S1]. He prepares eight vats of sweetened sake and sets out eight cutting-stations; when the serpent drinks and comes to drink, Susanoo slays it, and in its tail he finds the sword Kusanagi (Ame-murakumo-no-tsurugi) [S1]. He rescues Kushinada-hime and marries her [S1]. This is the archetypal Japanese monster-slaying myth and the origin of the sacred sword Kusanagi [S1][S2].",
    ["jpn-susanoo","jpn-yamata-no-orochi","jpn-kushiinadahime"],
    ["S1","S2"],
    variants=[{"name":"Kojiki Orochi myth","description":"The full account: the weeping parents, the comb, the eight vats of sake, the slaying, and the sword in the tail."},
              {"name":"Nihon Shoki Orochi myth","description":"A related account with different wording of the method (the sake, the cutting) and some details."}],
    unc="The method of the slaying (the eight vats of sake, the cutting-stations) and some details differ between the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Weeping Parents","body":"Susanoo meets the weeping parents whose daughters are being devoured by the serpent [S1]."},
        {"heading":"The Comb","body":"He asks for the last daughter, turns himself into a hair-comb, and has her wear it [S1]."},
        {"heading":"The Slaying","body":"With eight vats of sweetened sake and cutting-stations, he slays the serpent [S1]."},
        {"heading":"The Sword and the Bride","body":"In the serpent's tail he finds the sword Kusanagi; he rescues and marries Kushinada-hime [S1]."}],
    art=["jpn-art-susanoo-orochi-yoshitoshi","jpn-art-susanoo-kuniyoshi","jpn-art-susanoo-chikanobu"])

myth("jpn-kuniyurinshi","The Subjugation of the Country (Kuniyurinshi)",
    "When the heavenly prince Ninigi is sent down to rule the middle land, the indigenous island god Ōkuninushi and his retinue (led by the crossroads god Sarutahiko) resist the heavenly takeover [S1]. A contest ensues, centered on the throwing of the sword: the thunder god Takemikazuchi throws the sword (Kusanagi) from the high land to the middle land, hitting the target and demonstrating the heavenly gods' strength [S1]. Sarutahiko, carrying the sword, is subdued, and Ōkuninushi is defeated; he yields the land and hands over the three sacred regalia (mirror, jewel, sword) as pledge [S1]. Thereafter Ōkuninushi becomes a local deity of the earth, healing, and agriculture (especially in Izumo), while the heavenly line takes sovereignty [S1][S2]. This is the mythic foundation of the transfer of rule from the indigenous to the heavenly/imperial line.",
    ["jpn-ninigi","jpn-okuninushi","jpn-sarutahiko","jpn-takemikazuchi","jpn-kotohikone","jpn-susanoo"],
    ["S1","S2"],
    variants=[{"name":"Kojiki Kuniyurinshi","description":"The full contest: the sword-throw, the subduing of Sarutahiko, the yielding of the land, and the handover of the regalia."},
              {"name":"Nihon Shoki Kuniyurinshi","description":"A related account with different wording of the sequence, the role of Kotohikone, and which regalia are handed over."}],
    unc="The exact sequence of the contest (the sword-throw, the subduing of Sarutahiko, which regalia are handed over, and the role of Kotohikone) differs between the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Resistance","body":"Ōkuninushi and his retinue (led by Sarutahiko) resist the descending heavenly prince [S1]."},
        {"heading":"The Sword-Throw","body":"Takemikazuchi throws the sword (Kusanagi) from the high land to the middle land, hitting the target [S1]."},
        {"heading":"The Subduing","body":"Sarutahiko, carrying the sword, is subdued; Ōkuninushi is defeated [S1]."},
        {"heading":"The Handover","body":"Ōkuninushi yields the land and hands over the three sacred regalia; he becomes a local deity [S1]."}],
    art=[])

myth("jpn-ninigi-descent","The Descent of Ninigi (Tenson Kōryō)",
    "The heavenly prince Ninigi, grandson of Amaterasu, is sent down from Takamagahara to take rule of the middle land (Ashihara-no-Nakatsukuni) [S1]. His descent (Tenson Kōryō) alights at Takachiho in Hyūga (Kyūshū) [S1]. Guided by the crossroads god Sarutahiko, he is confronted by Ōkuninushi's side (the Kuniyurinshi), after which the land is yielded [S1]. Ninigi takes the earthly bride Konohanasakuya-hime and later the heavenly bride Toyotama-hime (Amaterasu's daughter); their son Hooroni (Ōyahata) is the ancestor of the emperors [S1][S2]. The 'birth at sea' of Hooroni (Toyotama-hime giving birth in a hut at sea, whence the sea is born) is part of this descent narrative [S1].",
    ["jpn-ninigi","jpn-amaterasu","jpn-konohanasakuhana","jpn-toyotama","jpn-hooroni","jpn-sarutahiko","jpn-okuninushi"],
    ["S1","S2"],
    variants=[{"name":"Kojiki descent","description":"The descent to Takachiho, the Kuniyurinshi, the two brides, and the birth of Hooroni at sea."},
              {"name":"Nihon Shoki descent","description":"A related account with the imperial genealogy from Hooroni to Emperor Jimmu, and different wording of the descent."}],
    unc="The exact mechanism of the descent, the sequence of the Ōkuninushi contest, and the genealogy to the emperors (Hooroni → Jimmu) are stated differently in the Kojiki and Nihon Shoki [S1][S2].",
    chapters=[
        {"heading":"The Descent","body":"Ninigi, grandson of Amaterasu, is sent down to rule the middle land; he alights at Takachiho in Hyūga [S1]."},
        {"heading":"The Confrontation","body":"Guided by Sarutahiko, he is confronted by Ōkuninushi's side (the Kuniyurinshi); the land is yielded [S1]."},
        {"heading":"The Brides","body":"Ninigi takes the earthly bride Konohanasakuya-hime and the heavenly bride Toyotama-hime [S1]."},
        {"heading":"The Birth at Sea","body":"Toyotama-hime gives birth to Hooroni at sea; the sea is born, and the imperial line begins [S1]."}],
    art=[])

dump("myths.json", M)

# ---------------- COSMOLOGY ----------------
cosmo = {
  "realms": [
    {"id":"jpn-takamagahara","name":"Takamagahara","native_name":"高天原",
     "description":"The High Plain of Heaven, the upper realm where the high deities (Amaterasu, Tsukuyomi) dwell and from which the creative pair and the descending prince are sent [S1]. It is the heavenly axis and the origin of the imperial line [S1].",
     "entities":["jpn-kamimusubi","jpn-amenominakanushi","jpn-amaterasu","jpn-tsurugumo","jpn-susanoo","jpn-ameno-uzume","jpn-takemikazuchi","jpn-toyotama","jpn-ninigi","jpn-izananagi","jpn-izananami"],
     "layout":{"x":25,"y":6,"w":50,"h":22}},
    {"id":"jpn-ashihara","name":"Ashihara-no-Nakatsukuni","native_name":"宇迦之御魂/現世",
     "description":"The 'Middle Land of the High Plains'—the earthly realm, the world of the living and of the indigenous deities (Ōkuninushi, Inari), where the islands are and where the heavenly prince is sent to rule [S1].",
     "entities":["jpn-okuninushi","jpn-kotohikone","jpn-sarutahiko","jpn-konohanasakuhana","jpn-kushiinadahime","jpn-yamata-no-orochi","jpn-ninigi","jpn-hooroni","jpn-inari","jpn-yamato-takeru","jpn-susanoo"],
     "layout":{"x":20,"y":36,"w":60,"h":26}},
    {"id":"jpn-yomi","name":"Yomi","native_name":"黄泉",
     "description":"The Land of Yomi, the realm of the dead and of decay (the 'devils of rotting'), separated from the clean world of the living by the threshold at which Izanagi and Izanami part [S1]. It is the polluted underworld [S1].",
     "entities":["jpn-izananami","jpn-kagutsuchi"],
     "layout":{"x":25,"y":70,"w":50,"h":22}},
  ],
  "structure_notes": "A vertical three-tier cosmology: Takamagahara (high heaven) above, Ashihara-no-Nakatsukuni (the earthly middle land) in the middle, and Yomi (the land of the dead) below. The 'floating bridge of heaven' (Ame-no-ukihashi) and the 'heavenly pillar' (Amanohabaki) are the axis connecting the upper and middle realms. This is the Kojiki/Nihon Shoki model; it is a mythographic (8th-century) rendering of an older cosmology, and the precise spatial relationships are not fully specified in the texts [S1][S2].",
}
dump("cosmology.json", cosmo)

# ---------------- TIMELINE ----------------
TL = [
 {"year_label":"ca. 300–550 CE","sort_year":300,"kind":"archaeological","label":"Kofun period (burial mounds)","description":"The Yayoi-Kofun transition; large burial mounds (kofun), haniwa (clay figurines), and bronze mirrors are the archaeological context for the later mythographic tradition [S17]."},
 {"year_label":"ca. 400–600 CE","sort_year":450,"kind":"archaeological","label":"Yayoi-Kofun material culture","description":"Iron tools, rice agriculture, and the emerging Yamato polity; the social world in which the kami-cults later codified in the Kojiki took shape [S17][S21]."},
 {"year_label":"712 CE","sort_year":712,"kind":"text","label":"Kojiki compiled","description":"'Records of Ancient Matters,' the earliest Japanese mythographic text, compiled under imperial order [S1]."},
 {"year_label":"720 CE","sort_year":720,"kind":"text","label":"Nihon Shoki compiled","description":"'Chronicles of Japan,' the second major mythographic/annalistic text [S2]."},
 {"year_label":"927 CE","sort_year":927,"kind":"text","label":"Engishiki (ritual code)","description":"A Heian-era ritual and administrative code that records shrine rites and the institutional Shinto [S19]."},
 {"year_label":"11th–13th c.","sort_year":1150,"kind":"manuscript","label":"Kitano Tenjin illustrated legends","description":"Medieval illustrated (emakimono) accounts of deities and heroes, e.g. the Tenjin (Michizane) legends [S7]."},
 {"year_label":"1600s–1868","sort_year":1750,"kind":"manuscript","label":"Shinbutsu-gazurra and Edo-period deity imagery","description":"Printed deity-compendium (shinbutsu-gazurra, e.g. Kanda Genbun's 1720 work) standardizing visual images of the kami [S13][S14]."},
 {"year_label":"1868","sort_year":1868,"kind":"modern_recording","label":"Meiji Restoration; state Shinto","description":"The Meiji state separates Shinto from Buddhism and constructs a state Shinto with the imperial line at its center, institutionalizing the Kojiki genealogy [S21]."},
 {"year_label":"1906–1940","sort_year":1920,"kind":"modern_recording","label":"Shrine ordinances (jinja rei)","description":"State ordinances codifying shrine ranks and rites, further institutionalizing the mythographic tradition [S21]."},
 {"year_label":"1946","sort_year":1946,"kind":"modern_recording","label":"Renunciation of divinity (humanity declaration)","description":"The postwar declaration that the emperor and people are not of a divine origin, marking the end of the official divine-status framing [S21]."},
]
dump("timeline.json", TL)

# ---------------- UNCERTAINTIES ----------------
U = [
 {"topic":"Amaterasu's supremacy","description":"Whether Amaterasu is the single 'supreme' deity or one of several high deities.",
  "positions":[{"name":"Later/medieval view","description":"Amaterasu as the highest deity and ancestress of the emperors (the basis of state Shinto).","support":"Later Shinto and Meiji-era framing [S1][S21]"},
              {"name":"Kojiki text","description":"The Kojiki presents her as one of the high deities sent to rule a portion of the realms, not explicitly 'above' all others.","support":"Kojiki text [S1]"}],
  "sources":["S1","S2","S21"]},
 {"topic":"The Rock-Cave myth details","description":"The precise roles of the deities, the naming of the cave, and the role of Takemikazuchi in luring Amaterasu out.",
  "positions":[{"name":"Kojiki version","description":"Ame-no-Uzume's dance, the mirror, and the assembled deities' clamor; specific naming of the cave and deities.","support":"Kojiki [S1]"},
              {"name":"Nihon Shoki version","description":"A related account with different wording and emphasis on the roles.","support":"Nihon Shoki [S2]"}],
  "sources":["S1","S2"]},
 {"topic":"Ōkuninushi's handover","description":"Whether Ōkuninushi 'yields' the land or is 'subjugated,' and the exact sequence of the Kuniyurinshi contest and the handover of the regalia.",
  "positions":[{"name":"Kojiki version","description":"The sword-throw contest, the subduing of Sarutahiko, and the handover of the three regalia.","support":"Kojiki [S1]"},
              {"name":"Nihon Shoki version","description":"A related account with different wording of the sequence and the role of Kotohikone.","support":"Nihon Shoki [S2]"}],
  "sources":["S1","S2"]},
 {"topic":"The Yomi-separation details","description":"The details of Izanagi's descent to Yomi, the separation point, and the purification (misogi) with the birth of kami from the washed body-parts.",
  "positions":[{"name":"Kojiki version","description":"The descent, the discovery of decay, the flight, the threshold-separation, and the purification with the birth of kami.","support":"Kojiki [S1]"},
              {"name":"Nihon Shoki version","description":"A related account with different wording of the descent and the purification.","support":"Nihon Shoki [S2]"}],
  "sources":["S1","S2"]},
 {"topic":"Inari's nature","description":"Inari Ōkami's gender and the identity of the 'foxes' (messengers vs. embodiments), and the deity's precise nature.",
  "positions":[{"name":"Female-deity view","description":"Inari as a female deity of rice and prosperity attended by fox messengers.","support":"Common shrine practice [S21]"},
              {"name":"Paired/genderless view","description":"Inari as a paired (male-female) or genderless deity; the foxes as embodiments rather than messengers.","support":"Scholarly/variant shrine practice [S21]"}],
  "sources":["S1","S21"]},
]
dump("uncertainties.json", U)

# ---------------- SOURCES.md ----------------
src_md = """# JAPANESE (Shinto) — Sources

> **Framing.** Shinto is a **living religious tradition**, not a closed historical mythology. The two 8th-century mythographic texts (Kojiki, Nihon Shoki) are the anchor for the 'high pantheon,' but the tradition continued to accrete (later deities like Inari, state Shinto, postwar re-framing). This dataset treats it as a living religion: the Kojiki/Nihon Shoki theogony is presented as the *mythographic core*, and later developments are explicitly marked as such. Do **not** present Shinto as 'fictional mythology.'

## Primary texts
- **[S1]** *Kojiki* ('Records of Ancient Matters', 712 CE), trans. Basil Hall Chamberlain (1882/1933) — PRIMARY TRANSLATION — https://sacred-texts.com/shi/kojiki.htm (also: https://www.davisdelectus.com/uploads/8/3/2/2/83221806/13.5_the_japanese_kojiki.pdf)
- **[S2]** *Nihon Shoki* ('Chronicles of Japan', 720 CE) — PRIMARY TEXT (annalistic + mythographic) — (translation: G. Cameron, 1968; see Internet Archive)
- **[S19]** *Engishiki* (ritual/administrative code, 927 CE) — PRIMARY TEXT (institutional Shinto rites)

## Museum collections (artwork, public-domain / open access)
- **[S4]** Met Museum: *Luring the Sun Goddess Amaterasu Out of a Cave* (Kōno Bairei, late 19th c.) — PUBLIC DOMAIN (Met Open Access) — object 670889
- **[S5]** Met Museum: *The God Izanagi and Goddess Izanami* (Nishikawa Sukenobu, 18th c.) — PUBLIC DOMAIN (Met Open Access) — object 671008
- **[S6]** Met Museum: *Yorimasa Killing Nue* (Katsushika Hokusai, 18th–19th c.) — PUBLIC DOMAIN (Met Open Access) — object 57253
- **[S7]** Met Museum: *Illustrated Legends of the Kitano Tenjin Shrine* (late 13th c.) — PUBLIC DOMAIN (Met Open Access) — object 45428
- **[S8]** Met Museum: *Story of Michizane Sugawara, known as Tenjin* (Reizen Saburo Tametaka, 19th c.) — PUBLIC DOMAIN (Met Open Access) — object 57674
- **[S17]** Tokyo National Museum — MUSEUM (Kofun-period haniwa, bronze mirrors, ritual objects; the archaeological context for the mythographic tradition) — https://www.tnm.jp

## Ukiyo-e / Edo-period prints (public domain; artists pre-1900)
- **[S9]** Tsukioka Yoshitoshi: *Amaterasu appearing from the cave* — PUBLIC DOMAIN (Wikimedia Commons; artist d. 1892)
- **[S10]** Tsukioka Yoshitoshi: *Susanoo-no-Mikoto slays Yamata-no-Orochi in Izumo* — PUBLIC DOMAIN (Wikimedia Commons)
- **[S11]** Toyohara Chikanobu: *Susanoo rescues Kushinada Hime* (1886) — PUBLIC DOMAIN (Wikimedia Commons)
- **[S12]** Kobayashi Eitaku: *Izanami and Izanagi Creating the Japanese Islands* — PUBLIC DOMAIN (Wikimedia Commons; MFA Boston)
- **[S13]** Kanda Genbun: *Shinbutsu-gazurra* (1720) — Izanagi/Izanami plate — PUBLIC DOMAIN (Wikimedia Commons)
- **[S14]** Kanda Genbun: *Shinbutsu-gazurra* (1720) — Amaterasu plate — PUBLIC DOMAIN (Wikimedia Commons)
- **[S15]** Utagawa Kunisada: *Amaterasu cave* (1856) — PUBLIC DOMAIN (Wikimedia Commons)
- **[S16]** Elstner Hilton: *Kagura-Dance-Shinto-1914* — PUBLIC DOMAIN (Wikimedia Commons; photograph)

## Scholarly
- **[S21]** *Shinto: A Very Short Introduction* — Sue Keown (Oxford UP, 2010) — SCHOLARLY OVERVIEW (for the living-tradition framing and later developments like Inari)

## Discovery pointers (NOT sole authority)
- **[S20]** Wikipedia (Japanese mythology / Shinto articles) — DISCOVERY POINTER ONLY. Used to find museum/primary sources above; never the sole support for any claim.

---
*Note on variants: the Kojiki and Nihon Shoki disagree on many details (island list, birth sequence, Yomi episode, Kuniyurinshi sequence, cave-myth roles). This dataset records BOTH where they differ (see uncertainties.json and the per-entity uncertainty_notes) rather than silently choosing one.*
"""
open(os.path.join(OUT,"sources.md"),"w").write(src_md)
print("wrote sources.md")
print("TOTAL entities:", len(E), "relationships:", len(R), "myths:", len(M))
