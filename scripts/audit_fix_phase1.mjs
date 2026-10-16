// Phase 1 content-audit fixes — deterministic, from docs/audit/PHASE1-FINDINGS.md
// Each fix: find entity by id, apply patch, log. Run: node scripts/audit_fix_phase1.mjs
import { readFileSync, writeFileSync } from 'fs';

const R = (p) => JSON.parse(readFileSync(p, 'utf8'));
const W = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + '\n', 'utf8');
const log = [];

function loadCulture(c) {
  const ents = R(`data/${c}/entities.json`);
  const artsPath = `data/${c}/artifacts.json`;
  let arts = null;
  try { arts = R(artsPath); } catch {}
  return { ents, arts, artsPath };
}
function save(c, { ents, arts, artsPath }) {
  W(`data/${c}/entities.json`, ents);
  if (arts) W(artsPath, arts);
}
function E(ents, id) {
  const e = ents.find((x) => x.id === id);
  if (!e) throw new Error(`missing entity ${id}`);
  return e;
}
function fix(log, id, field, before, after, why) {
  log.push({ id, field, before, after, why });
}
function setF(ents, id, field, value, log, why) {
  const e = E(ents, id);
  const before = e[field];
  e[field] = value;
  fix(log, id, field, before, value, why);
}
function addNote(ents, id, note, log) {
  const e = E(ents, id);
  e.uncertainty_notes = e.uncertainty_notes || [];
  if (!e.uncertainty_notes.includes(note)) {
    e.uncertainty_notes.push(note);
    fix(log, id, 'uncertainty_notes', '(added)', note, 'audit note');
  }
}

// ============ JAPANESE ============
{
  const c = 'japanese'; const d = loadCulture(c); const { ents } = d;
  // F1 Susanoo: parents = Izanagi (+Izanami per Kojiki river-mouth washing is Izanagi-only; both listed as creators of the three noble children together)
  setF(ents, 'jpn-susanoo', 'parents', ['jpn-izananagi', 'jpn-izananami'], log, 'F1: Kojiki — Susanoo born of Izanagi (washing at river mouth) and Izanami; Kushinada-hime was wrongly both parent and child (she is his descendant/bride, Gx. Yamata-no-Orochi episode).');
  setF(ents, 'jpn-susanoo', 'children', [], log, 'F1: Kushinada-hime is Susanoo\'s bride and descendant (after 8 generations, per Kojiki), not his child.');
  // F2 Amaterasu children
  setF(ents, 'jpn-amaterasu', 'children', [], log, 'F2: Toyotama-hime is Amaterasu\'s great-granddaughter (via Ame-no-oshihomimi -> Ninigi), not daughter. Her son Ame-no-oshihomimi is not in the dataset.');
  addNote(ents, 'jpn-amaterasu', 'Audit 2026-10: previously listed Toyotama-hime as her daughter — corrected (she is a great-granddaughter through Ame-no-oshihomimi and Ninigi). Amaterasu\'s divine son Ame-no-oshihomimi is not modeled as a separate entity here.', log);
  // F3 Konohanasakuya-hime parents
  setF(ents, 'jpn-konohanasakuhana', 'parents', ['jpn-okuninushi'], log, 'F3: Kojiki/Nihon Shoki — Konohanasakuya-hime is a daughter of Ōkuninushi (Izumo), given in marriage to Ninigi. She was wrongly listed as Ninigi\'s parent AND child.');
  setF(ents, 'jpn-konohanasakuhana', 'partners', ['jpn-ninigi'], log, 'F3: she is Ninigi\'s wife (both entries now reciprocal).');
  // F4 Toyotama parents
  setF(ents, 'jpn-toyotama', 'parents', [], log, 'F4: Toyotama-hime is the sea god Watatsumi\'s daughter (Watatsumi not in dataset); she was wrongly listed as Amaterasu\'s daughter.');
  addNote(ents, 'jpn-toyotama', 'Audit 2026-10: father is the sea deity Watatsumi (not in this dataset); wife of Ninigi, mother of Ugayafukiaezu and Hoori.', log);
  // F5 Ninigi parents
  setF(ents, 'jpn-ninigi', 'parents', [], log, 'F5: Ninigi is Amaterasu\'s GRANDSON (son of Ame-no-oshihomimi), not son. Parent entity not in dataset.');
  addNote(ents, 'jpn-ninigi', 'Audit 2026-10: Ninigi is the son of Ame-no-oshihomimi and Takahara-bikihime, hence grandson of Amaterasu; sent to earth in the tenson kōrin (descent of the heavenly grandchild).', log);
  // F6 Hoori parents: Ninigi + Toyotama — correct as-is (youngest son of Ninigi and Toyotama/Yohara). Keep.
  // G1 Amaterasu/Tsukuyomi parents
  setF(ents, 'jpn-amaterasu', 'parents', ['jpn-izananagi', 'jpn-izananami'], log, 'G1: Kojiki — sun and moon born from Izanagi\'s purification (washing left/right eye); Izanami co-creator of the three noble children in the same passage.');
  setF(ents, 'jpn-tsurugumo', 'parents', ['jpn-izananagi', 'jpn-izananami'], log, 'G1: Kojiki — Tsukuyomi born of Izanagi (washing right eye).');
  // S2 Orochi gender
  setF(ents, 'jpn-yamata-no-orochi', 'gender', 'unknown', log, 'X2: normalize gender "none" -> "unknown" (schema enum).');
  // S1 Kamimusubi vs Takamimusubi
  const kam = E(ents, 'jpn-kamimusubi');
  if (/Takamimusubi/i.test(kam.name)) {
    setF(ents, 'jpn-kamimusubi', 'name', 'Takamimusubi', log, 'S1: display name kept as Takamimusubi (matches description); id kept for URL stability.');
    addNote(ents, 'jpn-kamimusubi', 'Audit 2026-10: Kojiki names TWO separate primordial deities, Takamimusubi ("high producer") and Kamimusubi ("divine producer"). This entity follows the Takamimusubi tradition (id kept for URL stability). See docs/UNCERTAIN.md.', log);
  }
  save(c, d);
}

// ============ GREEK ============
{
  const c = 'greek'; const d = loadCulture(c); const { ents } = d;
  // F7 Hephaestus children
  setF(ents, 'gre-hephaestus', 'children', [], log, 'F7: Ares is Hephaestus\'s BROTHER (son of Zeus+Hera), not his child. Hephaestus\'s only near-attested offspring are fragmentary/minor (e.g. the Kadmeiloi, Erichthonios as foster-son).');
  // F9 Eros
  addNote(ents, 'gre-eros', 'Audit 2026-10: parentage depends on the source — Hesiod\'s Theogony makes Eros a primordial being (before Aphrodite); the Hellenistic tradition (e.g. Apollonius of Rhodes, Aristophanes) makes him the son of Aphrodite (and Ares). We keep the Aphrodite-filiation as the later mainstream and flag the Hesiodic variant.', log);
  // G2 Gaia children (dataset members only)
  setF(ents, 'gre-gaia', 'children', ['gre-ouranos', 'gre-oceanus', 'gre-tethys', 'gre-cronus', 'gre-rhea', 'gre-typhon'], log, 'G2: Hesiod Theogony — Gaia bore Ouranos, the Titans (incl. Kronos, Rhea), the Oceanids/Tethys, Pontus, and (with Tartarus) Typhon. Only dataset members listed.');
  addNote(ents, 'gre-gaia', 'Audit 2026-10: children list includes only entities present in this dataset; the full Hesiodic list (Cyclopes, Hecatoncheires, Pontus, Nereus, etc.) is in the description.', log);
  // G3 Persephone parents
  setF(ents, 'gre-persephone', 'parents', ['gre-zeus', 'gre-demeter'], log, 'G3: Hesiod Theogony 912-914 — Persephone is daughter of Zeus and Demeter (Zeus was missing).');
  // G4/G5 notes
  addNote(ents, 'gre-poseidon', 'Audit 2026-10: attested offspring (Triton by Amphitrite; Pegasus and Chrysaor by Medusa; Theseus in the golden-bull tradition; the Rhodian Telchines, etc.) are not modeled as entities in this dataset.', log);
  addNote(ents, 'gre-ares', 'Audit 2026-10: attested children (Harmonia with Aphrodite; the Amazon Penthesilea/hippolyte lineage; Deimos/Phobos in later tradition) are not modeled as entities here.', log);
  // S4 Aphrodite variant
  addNote(ents, 'gre-aphrodite', 'Audit 2026-10: two parentage traditions — Hesiod (born of Ouranos\'s sea-foam, hence parents = Ouranos) and Homer Il. 5 (daughter of Zeus and Dione). We keep the Hesiodic as primary; the Homeric variant is preserved here.', log);
  // X1 broken myth refs — strip dangling ids
  const mythIds = new Set(R('data/greek/myths.json').map((m) => m.id));
  let stripped = 0;
  for (const e of ents) {
    if (Array.isArray(e.major_myths)) {
      const keep = e.major_myths.filter((m) => mythIds.has(m));
      if (keep.length !== e.major_myths.length) {
        const removed = e.major_myths.filter((m) => !mythIds.has(m));
        fix(log, e.id, 'major_myths', e.major_myths, keep, `X1: stripped dangling myth refs (${removed.join(', ')}) — those myths are not authored in myths.json`);
        e.major_myths = keep; stripped++;
      }
    }
  }
  console.log(`greek: stripped dangling myth refs on ${stripped} entities`);
  save(c, d);
}

// ============ NORSE ============
{
  const c = 'norse'; const d = loadCulture(c); const { ents } = d;
  // F10/F11 Ymir
  setF(ents, 'nor-ymir', 'parents', [], log, 'F10: Gylfaginning — Ymir was "sjálfborn" (self-born), formed where venom-drops from Niflheim met the sparks of Muspel in the Ginnungagap void. Ginnungagap is a void, not a parent.');
  setF(ents, 'nor-ymir', 'children', [], log, 'F11: Búri is NOT Ymir\'s son — Auðumbla licked him out of the salt-rime blocks over three days (Gylfaginning IV). Ymir\'s own offspring: the six-headed giant and (from under his arm) a man and woman.');
  setF(ents, 'nor-burir', 'parents', [], log, 'F11: Búri\'s "origin" is being licked out of rime by Auðumbla (Gylfaginning IV) — not parentage. Note added.');
  addNote(ents, 'nor-burir', 'Audit 2026-10: Búri emerged from the salt-rime blocks (hrímkalpar) that the cow Auðumbla licked bare over three days (Gylfaginning IV); he has no parents in the sources.', log);
  // F12 Ullr
  setF(ents, 'nor-uthra', 'parents', ['nor-sif'], log, 'F12: Ullr is the son of Sif (Gylag. 31 "Ullar ok svá kalla en þat er sonarsonar..."/stepson tradition) and an unnamed father; Thor is his STEPFATHER, not parent. Þrúðgelmir (giant, grandfather) appears in a late þulur gloss.');
  addNote(ents, 'nor-uthra', 'Audit 2026-10: Ullr is Sif\'s son by an unnamed father (Gylfaginning 31 calls him Thor\'s "son" in the step- sense; Snorri\'s skaldic usage). Thor is stepfather only.', log);
  // F13 Síd -> Svaðilfari
  const sid = E(ents, 'nor-sid');
  const before13 = { name: sid.name, gender: sid.gender, domains: sid.domains };
  sid.name = 'Svaðilfari'; sid.native_name = 'Svaðilfari';
  sid.gender = 'male'; sid.classification = 'giant';
  sid.domains = ['the stallion of the frost-giant\'s builder'];
  sid.description_short = 'The stallion of the unnamed hrímþurs who built the wall of Ásgarðr. Loki, transformed into a mare, lured Svaðilfari away from his work so the builder failed his deadline — and Loki bore Sleipnir as a mare.';
  sid.description_long = 'Gylfaginning IV–XIII: after the gods hired a giant builder to wall Ásgarðr, his horse Svaðilfari hauled stone at twice the speed of the gods\' own carts, and the winter deadline loomed. The gods blamed Loki, who transformed himself into a mare; Svaðilfari ran after her, the builder lost the wager and was killed by Thor — and in that shape Loki bore the eight-legged foal Sleipnir ("in one account" the sources are explicit: Loki is Sleipnir\'s mother).';
  sid.partners = []; sid.children = ['nor-sleipnir']; sid.parents = [];
  sid.alternative_names = [];
  fix(log, 'nor-sid', 'entity', before13, 'converted to Svaðilfari (male stallion)', 'F13: "Síd" is unattested; the entity described (mother of Sleipnir with Loki) misstates Gylfaginning XIII — Sleipnir\'s other parent is the stallion Svaðilfari, and Loki bore Sleipnir himself AS a mare. Converted to Svaðilfari, id kept for URL stability.');
  addNote(ents, 'nor-sid', 'Audit 2026-10: this entity was previously "Síd, a giantess who bore Sleipnir" — unattested and wrong. It is now Svaðilfari, the builder\'s stallion (Gylfaginning XIII); Sleipnir\'s parents are Loki (as a mare) and Svaðilfari.', log);
  setF(ents, 'nor-sleipnir', 'parents', ['nor-loomi', 'nor-sid'], log, 'F13: Sleipnir\'s parents = Loki (as a mare) + Svaðilfari (Gylfaginning XIII).');
  addNote(ents, 'nor-sleipnir', 'Audit 2026-10: Sleipnir was borne by Loki in mare-shape, sired by the stallion Svaðilfari (Gylfaginning XIII) — Loki is his mother.', log);
  // F14 Heimdall
  setF(ents, 'nor-odin', 'children', ['nor-baldr', 'nor-vidar', 'nor-vali', 'nor-thor', 'nor-hodr'], log, 'F14: Heimdall removed from Odin\'s children — Gylfaginning says he is born of nine mothers; Odin-filiation is uncertain (see UNCERTAIN.md). Höðr added (son of Odin+Frigg, Gylfaginning 22-33).');
  setF(ents, 'nor-heimdall', 'parents', [], log, 'F14: Gylfaginning 27 — Heimdall is "the white god... born of nine mothers, nine sisters"; no parentage fixed. Old Norse sources also call him son of Odin in a skaldic hint (see note).');
  addNote(ents, 'nor-heimdall', 'Audit 2026-10: parentage uncertain — Gylfaginning: born of nine mothers (nine waves / nine sisters); a skaldic kenning and Annalaí fragment hint at Odin as father. Previously listed as Odin\'s son; moved to UNCERTAIN.md.', log);
  // F15/F16 Frigg children
  setF(ents, 'nor-frigg', 'children', ['nor-baldr', 'nor-hodr'], log, 'F15/F16: Frigg\'s attested sons are Baldr and Höðr (Gylfaginning 33, 49). Víðarr\'s mother is the giantess Gríðr (Gylfaginning 31); Váli (son of Odin and Rindr) is not Frigg\'s (Gylfaginning 33).');
  setF(ents, 'nor-hodr', 'parents', ['nor-odin', 'nor-frigg'], log, 'F16: Höðr is son of Odin and Frigg (Gylfaginning 33 "son of Odin... Frigg bore Höðr"); was missing both parents.');
  setF(ents, 'nor-odin', 'children', ['nor-baldr', 'nor-vidar', 'nor-vali', 'nor-thor', 'nor-hodr'], log, 'F16: Höðr added to Odin\'s children (Gylfaginning 33).');
  addNote(ents, 'nor-odin', 'Audit 2026-10: children shown are the dataset members attested for Odin (Baldr and Höðr with Frigg; Thor with Jörð; Víðarr with the giantess Gríðr; Váli with Rindr; Heimdall uncertain — see his entry). Mothers Gríðr, Rindr and Jörð are not modeled as entities.', log);
  // F17 Njord note
  addNote(ents, 'nor-nyrd', 'Audit 2026-10: Freyr and Freyja\'s mother is Njörðr\'s sister (a nameless giantess; the incestuous union is noted in Ynglinga saga 4 and Loki\'s flyting in Lokasenna). Skaði is his later wife (divorced in the same saga).', log);
  // F19 Loki parents note
  addNote(ents, 'nor-loomi', 'Audit 2026-10: Loki is "son of Fárbauti" in the kenning tradition (Umbli\'s son, Laufjar/Laufey\'s son — Gylfaginning prologue); his mother Laufey/Nál and father Fárbauti are not modeled as entities. His wife is Sigyn (not in dataset); Angrboða is a consort.', log);
  // F20/F21/F22 display names
  setF(ents, 'nor-forseti', 'name', 'Forseti', log, 'F20: normalized display name (Fosite is the Frisian place-name form; Forseti is the normalized Old Norse).');
  setF(ents, 'nor-jarnsaxa', 'name', 'Járnsaxa', log, 'F21: removed duplicated gloss "Járnsaxa (Járnsaxa)".');
  setF(ents, 'nor-anguela', 'name', 'Angrboða', log, 'F22: normalized to Old Norse Angrboða ("Angerboa" was an Anglicization); kept in alternative_names.');
  E(ents, 'nor-anguela').alternative_names = ['Angerboda', 'Angrboða'];
  // F23 Loki partners
  setF(ents, 'nor-loomi', 'partners', ['nor-anguela'], log, 'F23: Sigyn (attested wife) is not in the dataset; Síd entry converted to Svaðilfari (a mate, not a partner). Angrboða kept as consort.');
  // X1 broken myth refs
  const mythIds = new Set(R('data/norse/myths.json').map((m) => m.id));
  for (const e of ents) {
    if (Array.isArray(e.major_myths)) {
      const keep = e.major_myths.filter((m) => mythIds.has(m));
      if (keep.length !== e.major_myths.length) {
        const removed = e.major_myths.filter((m) => !mythIds.has(m));
        fix(log, e.id, 'major_myths', e.major_myths, keep, `X1: stripped dangling myth refs (${removed.join(', ')})`);
        e.major_myths = keep;
      }
    }
  }
  save(c, d);
}

// ============ EGYPTIAN ============
{
  const c = 'egyptian'; const d = loadCulture(c); const { ents } = d;
  // F24 Horus consort
  setF(ents, 'egy-horus', 'partners', ['egy-hathor'], log, 'F24: Horus\'s canonical consort is Hathor (divine couple throughout the temple cult; e.g. Dendera/Edfu). Isis-as-consort is rare magical-text usage. Isis remains his MOTHER.');
  // F25 Horus the Elder inversion
  setF(ents, 'egy-horus', 'children', [], log, 'F25: Harsomtus ("Horus the Elder"/Horus-Unite-the-Two-Lands at Edfu) is a FORM/offspring of Horus, not his father. Inverted relation removed.');
  setF(ents, 'egy-horus-elder', 'parents', ['egy-horus'], log, 'F25: Harsomtus is a form/offspring of Horus (Edfu cosmogony: born in the nest of the sun-bark); previously he was listed as Horus\'s father.');
  addNote(ents, 'egy-horus-elder', 'Audit 2026-10: "Horus the Elder" (Harsomtus) is a late Edfu form/offspring of Horus, not a separate father-god. Relation was inverted; corrected.', log);
  // F26 Set consort
  setF(ents, 'egy-set', 'partners', ['egy-nephthys'], log, 'F26: Nephthys is Set\'s consort throughout the sources (Pyramid Texts; Plutarch De Iside; the divine court of the Contendings). She already listed Set — now reciprocal.');
  // F27 Nephthys note
  addNote(ents, 'egy-nephthys', 'Audit 2026-10: mother of Anubis — by Set in some traditions, by Osiris in the Plutarchan "false-Osiris" episode (Nephthys deceived Osiris thinking him Set). Both traditions preserved; Anubis\'s parentage flagged in UNCERTAIN.md.', log);
  // G6 Anubis parents
  setF(ents, 'egy-anubis', 'parents', ['egy-set', 'egy-nephthys'], log, 'G6: Anubis\'s parents vary by source: Set+Nephthys (late temple tradition) or Osiris+Nephthys (Plutarch De Iside 12-14). Set chosen as primary (matches the dataset\'s Set-Nephthys marriage); variant noted.');
  addNote(ents, 'egy-anubis', 'Audit 2026-10: parentage disputed — Set and Nephthys (late tradition) vs Osiris and Nephthys (Plutarch); earlier still Anubis is a son of Ra or of Hesat. See UNCERTAIN.md.', log);
  // F28/F29 Ogdoad names
  setF(ents, 'egy-ogdoad-khnum', 'name', 'Kek & Kauket (primordial darkness)', log, 'F28: the Hermopolitan Ogdoad\'s darkness pair is KEK (male frog) & KAUKET (female snake) — "Khenunu & Khenunit" is not attested. id kept for URL stability.');
  E(ents, 'egy-ogdoad-khnum').native_name = 'Kek & Kauket';
  E(ents, 'egy-ogdoad-khnum').alternative_names = ['Kuk & Kauket'];
  E(ents, 'egy-ogdoad-khnum').domains = ['primordial darkness'];
  setF(ents, 'egy-ogdoad-sat', 'name', 'Amun & Amaunet (primordial hiddenness)', log, 'F29: the Ogdoad\'s fourth pair is AMUN & AMAUNET ("hiddenness") — "Sat & Satet" is wrong (Satet is the Elephantine goddess). id kept for URL stability.');
  E(ents, 'egy-ogdoad-sat').native_name = 'Jmn & Jmn.t';
  E(ents, 'egy-ogdoad-sat').alternative_names = ['Amun & Amaunet'];
  E(ents, 'egy-ogdoad-sat').domains = ['primordial hiddenness / air'];
  addNote(ents, 'egy-ogdoad-sat', 'Audit 2026-10: the Ogdoad\'s Amun ("the Hidden One") is the Hermopolitan principle of hiddenness/air, distinct from the Theban king-god Amun (see egy-amun). Previously mislabeled "Sat & Satet".', log);
  // S7 Ogdoad gender
  for (const id of ['egy-ogdoad-nun', 'egy-ogdoad-heh', 'egy-ogdoad-khnum', 'egy-ogdoad-sat']) {
    setF(ents, id, 'gender', 'other', log, 'S7: Ogdoad entries are male+female PAIRS (frog/snake); "unknown" -> "other" (dual pair) for schema clarity.');
    addNote(ents, id, 'Audit 2026-10: this entry is a male+female pair (hermopolitan Ogdoad); gender field = "other" (dual).', log);
  }
  // S8 Atum-Ra display name
  setF(ents, 'egy-aur', 'name', 'Atum-Ra', log, 'S8: cleaned display name (gloss "the primordial waters\' first god" moved to description).');
  // S10 Nun duplicate note
  addNote(ents, 'egy-nun', 'Audit 2026-10: near-duplicate of egy-ogdoad-nun (Nun & Naunet pair). Kept separate: solo Nun is the personified primeval waters of Heliopolitan/temple theology; the pair entry documents the Ogdoad.', log);
  addNote(ents, 'egy-ogdoad-nun', 'Audit 2026-10: see also solo Nun (egy-nun). Pair entry documents the Ogdoad member.', log);
  // U2/U3 notes
  addNote(ents, 'egy-thoth', 'Audit 2026-10: parentage varies — self-created on the primeval mound (Hermopolitan), "tongue of Ra" (creator\'s scribe), or born of Set\'s semen (Herodotus II.4 / Neferhotep tradition). Left unset deliberately; see UNCERTAIN.md.', log);
  addNote(ents, 'egy-hathor', 'Audit 2026-10: "daughter of Ra" is common (Dendera theology) but Hathor\'s roles (eye of Ra, celestial cow, lady of the sycamore) precede and exceed that filiation; kept as domain, not asserted as fixed parentage.', log);
  save(c, d);
}

// ============ SLAVIC ============
{
  const c = 'slavic'; const d = loadCulture(c); const { ents } = d;
  // F31/F32 Svarog-Dazhbog
  setF(ents, 'slv-svarog', 'children', ['slv-dazhbog'], log, 'F31: the Primary Chronicle (Ipatian, Laurentian; under 980) glosses Dazhbog as "son of Svarog" — Veles is NOT Svarog\'s son. One gloss only; see UNCERTAIN.md.');
  setF(ents, 'slv-dazhbog', 'parents', ['slv-svarog'], log, 'F32: "Dazhbog, son of Svarog" — the chronicle gloss under Vladimir\'s pantheon (PVL, 1113/980 entry). Single-source; flagged.');
  addNote(ents, 'slv-svarog', 'Audit 2026-10: the Svarog→Dazhbog father-son relation rests on ONE chronicle gloss (PVL ad 980: "Dazhbog... Svarozhich"); whether Svarog is a sky-god, a smith-god (Hephaestus identification), or a euhemerized king is debated. See UNCERTAIN.md.', log);
  // U5-U8 flags
  addNote(ents, 'slv-lada', 'Audit 2026-10: Lada\'s existence as a Slavic DEITY is disputed — the main evidence is 16th–18th c. sources (Maciej of Miechów, Bielski, Gloger) possibly derived from misread Greek "charis/Aglaia" liturgical exclamations, plus the contested "Slovic word" for harmony. Folk "Lado!" exclamations are not proof of cult. See UNCERTAIN.md.', log);
  addNote(ents, 'slv-cherd', 'Audit 2026-10: "Chert" (devil) is attested only in late sources (Bielski 1564, via the "black god" of the PVL) and is likely a Christian-era concept projected backwards. See UNCERTAIN.md.', log);
  addNote(ents, 'slv-zorya', 'Audit 2026-10: the Zorya(s) — dawn star(s), often two or three sisters guarding the cosmic hound — are ethnographic/folkloric (19th c. records); their pre-Christian status is reconstruction. See UNCERTAIN.md.', log);
  addNote(ents, 'slv-jarilo', 'Audit 2026-10: Jarilo (Jarovit) is attested in 12th c. Elbe-Slavic records (Havelberg/Rethra idols); the equation with the Kupala festival figure is 19th–20th c. ethnographic reconstruction (Ivanov–Toporov). Kupala itself is tied to St. John\'s Eve. See UNCERTAIN.md.', log);
  save(c, d);
}

// ============ MESOPOTAMIAN ============
{
  const c = 'mesopotamian'; const d = loadCulture(c); const { ents } = d;
  // F33 Tiamat/Kingu inversion
  setF(ents, 'mes-tiamat', 'parents', [], log, 'F33: Enuma Elish I — Tiamat is PRIMEVAL (salt water), "first of them, their mother-goddess"; Kingu is her son and army-commander. Inverted parentage removed.');
  setF(ents, 'mes-tiamat', 'children', ['mes-kingu'], log, 'F33: Kingu (Qingu) is Tiamat\'s son, exalted to "carry the tablets, decree destinies" (Enuma Elish I 27-29), later executed to create humankind (VI 33-38).');
  setF(ents, 'mes-kingu', 'parents', ['mes-tiamat'], log, 'F33: Kingu is son of Tiamat (Enuma Elish I).');
  setF(ents, 'mes-kingu', 'partners', [], log, 'F33: Tiamat "exalted" Kingu to husband-position (gave him the tablet of destinies) — a promotion, not a marriage; reciprocal partner link removed, note kept.');
  addNote(ents, 'mes-kingu', 'Audit 2026-10: Enuma Elish I 27-29 — Tiamat "exalted" Kingu among the gods, "placed the tablet of destinies on his lap"; the "made him husband" language is about his exaltation as army commander. Executed with Qingu-name preserved in humankind (VI 33-38).', log);
  // F34 Ereshkigal parents
  setF(ents, 'mes-erishkigal', 'parents', ['mes-apas'], log, 'F34: Ereshkigal is a daughter of An in the Sumerian tradition (e.g. Enlil and Ninlil: "seed of An... Ereshkigal"); variant: daughter of An + Nammu/Antu (Nammu not in dataset).');
  // F35 merge duplicate Nergal
  const dupeId = 'mes-erishkigal-consort';
  const before35 = ents.find((e) => e.id === dupeId);
  const idx = ents.findIndex((e) => e.id === dupeId);
  if (idx >= 0) ents.splice(idx, 1);
  let repointed = 0;
  for (const e of ents) {
    for (const f of ['parents', 'siblings', 'partners', 'children', 'allies', 'enemies']) {
      if (Array.isArray(e[f]) && e[f].includes(dupeId)) {
        e[f] = e[f].map((x) => (x === dupeId ? 'mes-nergal' : x)).filter((x, i, a) => a.indexOf(x) === i);
        repointed++;
      }
    }
  }
  fix(log, dupeId, 'entity', before35 ? before35.name : dupeId, 'MERGED into mes-nergal', 'F35: duplicate of Nergal (same god: consort of Ereshkigal in "Nergal and Ereshkigal"). Deletion allowed for duplicates; references repointed to mes-nergal.');
  console.log(`mesopotamian: merged duplicate, repointed refs on ${repointed} entities`);
  // F36 Enki parents
  setF(ents, 'mes-enki', 'parents', ['mes-apas'], log, 'F36: Enki is a son of An in the Sumerian tradition (Enki and the World Order; An\'s "counselor"); his mother is Nammu (the primeval sea) in the Enki-birth tradition — Nammu not in dataset.');
  addNote(ents, 'mes-enki', 'Audit 2026-10: mother is Nammu (primeval sea) in Sumerian tradition (Enki\'s birth cycle); Nammu is not modeled as an entity. Father An per the standard genealogy.', log);
  // F37 Marduk note
  addNote(ents, 'mes-marduk', 'Audit 2026-10: Enuma Elish I 36-39 — Marduk is son of Ea (Enki) and Damkina, grandson of An and Tiamat (the "Tiamat" here is Ea\'s salt-water grandmother layer); Damkina not modeled as an entity.', log);
  // F38 Nabu parents
  setF(ents, 'mes-nabu', 'parents', ['mes-marduk'], log, 'F38: Nabu is the son of MARDUK (and Nisaba/Tashmetu as mother/consort in different lists) — god of writing, Marduk\'s vizier. Was wrongly listed as Enki\'s son.');
  addNote(ents, 'mes-nabu', 'Audit 2026-10: mother given as Nisaba (or Tasmetu as consort) in different lists; neither modeled. Father: Marduk (standard first-millennium genealogy).', log);
  // F39 Nergal note
  addNote(ents, 'mes-nergal', 'Audit 2026-10: Erra/Nergal is "seed of Enlil, offspring of Ninlil" (Erra Epic I); as Ereshkigal\'s consort he is the "Nergal and Ereshkigal" myth. A duplicate entity for him was merged into this one (audit F35).', log);
  // F40 Ki/Enki variant
  addNote(ents, 'mes-ki', 'Audit 2026-10: An+Ki are parents of Enlil in the Sumerian tradition; for Enki the mother is more often Nammu. Ki\'s motherhood of Enki kept only where the dataset already asserted it — see Enki entry.', log);
  // S10 id note
  addNote(ents, 'mes-apas', 'Audit 2026-10: entity id "mes-apas" is a legacy label (the god is An/Anu); id kept for URL stability.', log);
  save(c, d);
}

// ============ write log ============
writeFileSync('/tmp/phase1-fixlog.json', JSON.stringify(log, null, 2));
console.log(`TOTAL FIXES: ${log.length}`);
for (const l of log) console.log(`- [${l.id}] ${l.field}: ${JSON.stringify(l.after).slice(0, 90)}  // ${l.why.slice(0, 70)}`);
