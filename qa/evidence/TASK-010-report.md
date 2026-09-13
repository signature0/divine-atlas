# TASK-010 — QA Route Sweep Report
Date: 2026-09-13 18:45 · Target: http://localhost:3002 (systemd divine-atlas, prod build)

## Totals
- Routes swept: **554**
- HTTP 200: **339**
- Console errors: **207** routes
- Page errors: **0** routes
- Failed requests (4xx/5xx local): **207** routes

## Negative checks (expect 404)
- `/deity/nope-123` → **404** ✓
- `/myths/nope-123` → **404** ✓
- `/artifacts/nope-123` → **404** ✓
- `/culture/nope` → **500** ✗

## Mobile (390px) overflow check
- `/` scroll=643 client=390 overflow=✗ YES errors=0
- `/culture/japanese` scroll=643 client=390 overflow=✗ YES errors=0
- `/myths/gre-creation` scroll=643 client=390 overflow=✗ YES errors=0

## Baselines captured
- home @390: 200 → qa/baseline/home_390.png (63 KB)
- culture-greek @390: 200 → qa/baseline/culture-greek_390.png (65 KB)
- zeus @390: 200 → qa/baseline/zeus_390.png (112 KB)
- myth-creation @390: 200 → qa/baseline/myth-creation_390.png (80 KB)
- graph @390: 200 → qa/baseline/graph_390.png (53 KB)
- artifacts @390: 200 → qa/baseline/artifacts_390.png (54 KB)
- compare @390: 200 → qa/baseline/compare_390.png (45 KB)
- about @390: 200 → qa/baseline/about_390.png (66 KB)
- home @768: 200 → qa/baseline/home_768.png (119 KB)
- culture-greek @768: ERR → undefined (TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3002/culture/greek", wa)
- zeus @768: 200 → qa/baseline/zeus_768.png (271 KB)
- myth-creation @768: 200 → qa/baseline/myth-creation_768.png (110 KB)
- graph @768: 200 → qa/baseline/graph_768.png (177 KB)
- artifacts @768: 200 → qa/baseline/artifacts_768.png (233 KB)
- compare @768: 200 → qa/baseline/compare_768.png (57 KB)
- about @768: 200 → qa/baseline/about_768.png (134 KB)
- home @1440: 200 → qa/baseline/home_1440.png (126 KB)
- culture-greek @1440: 200 → qa/baseline/culture-greek_1440.png (98 KB)
- zeus @1440: 200 → qa/baseline/zeus_1440.png (206 KB)
- myth-creation @1440: 200 → qa/baseline/myth-creation_1440.png (122 KB)
- graph @1440: 200 → qa/baseline/graph_1440.png (263 KB)
- artifacts @1440: 200 → qa/baseline/artifacts_1440.png (213 KB)
- compare @1440: 200 → qa/baseline/compare_1440.png (59 KB)
- about @1440: 200 → qa/baseline/about_1440.png (112 KB)
- home @1920: 200 → qa/baseline/home_1920.png (161 KB)
- culture-greek @1920: 200 → qa/baseline/culture-greek_1920.png (112 KB)
- zeus @1920: 200 → qa/baseline/zeus_1920.png (264 KB)
- myth-creation @1920: 200 → qa/baseline/myth-creation_1920.png (143 KB)
- graph @1920: 200 → qa/baseline/graph_1920.png (283 KB)
- artifacts @1920: 200 → qa/baseline/artifacts_1920.png (602 KB)
- compare @1920: 200 → qa/baseline/compare_1920.png (77 KB)
- about @1920: 200 → qa/baseline/about_1920.png (147 KB)

## Failing routes (all details)
### /deity/jpn-sarutahiko → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /myths/jpn-amaterasu-cave → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/gre-chaos → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/gre-poseidon → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/gre-echidna → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/gre-telemachus → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/nor-muspel → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /deity/slv-dazhbog → NAV-ERR TimeoutError: page.goto: Timeout 30000ms exceeded.
Call log:
  - navigating to "
### /domain/high%20heaven → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/high%20heaven
### /domain/imperial%20ancestry → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/imperial%20ancestry
### /domain/the%20hero-slayer%20of%20monsters → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20hero-slayer%20of%20monsters
### /domain/heavenly%20descent → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/heavenly%20descent
### /domain/the%20country → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20country
### /domain/the%20middle%20land → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20middle%20land
### /domain/the%20lure%20of%20the%20sun → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20lure%20of%20the%20sun
### /domain/the%20contest-sword → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20contest-sword
### /domain/the%20rescued%20bride → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20rescued%20bride
### /domain/Izumo → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/Izumo
### /domain/the%20devoured%20daughters → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20devoured%20daughters
### /domain/the%20imperial%20line → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20imperial%20line
### /domain/the%20void → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20void
### /domain/time%20(later%20association) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/time%20(later%20association)
### /domain/the%20earth → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20earth
### /domain/fidelity%20(as%20patron) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/fidelity%20(as%20patron)
### /domain/the%20dead → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20dead
### /domain/wealth%20(underground) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/wealth%20(underground)
### /domain/the%20underworld → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20underworld
### /domain/the%20sea → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sea
### /domain/war%20(strategy) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/war%20(strategy)
### /domain/sun%20(later) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/sun%20(later)
### /domain/the%20hunt → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20hunt
### /domain/wild%20animals → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/wild%20animals
### /domain/the%20moon%20(later) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20moon%20(later)
### /domain/war%20(violence%2C%20bloodshed) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/war%20(violence%2C%20bloodshed)
### /domain/the%20boundary → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20boundary
### /domain/guiding%20the%20dead → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/guiding%20the%20dead
### /domain/the%20vine → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20vine
### /domain/the%20forge → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20forge
### /domain/the%20grain → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20grain
### /domain/the%20seasons → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20seasons
### /domain/the%20home → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20home
### /domain/motherhood%20(as%20mother%20of%20Apollo%2FArtemis) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/motherhood%20(as%20mother%20of%20Apollo%2FArtemis)
### /domain/the%20slaying%20of%20Medusa → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20slaying%20of%20Medusa
### /domain/the%20Gorgon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20Gorgon
### /domain/the%20petrifying%20gaze → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20petrifying%20gaze
### /domain/the%20great%20monster → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20great%20monster
### /domain/the%20guardian%20of%20the%20underworld → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20guardian%20of%20the%20underworld
### /domain/the%20twelve%20labors → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20twelve%20labors
### /domain/the%20journey%20home → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20journey%20home
### /domain/the%20nymph → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20nymph
### /domain/mother%20of%20Hermes → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/mother%20of%20Hermes
### /domain/the%20sky%20(bore) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky%20(bore)
### /domain/the%20mortal%20mother%20of%20Perseus → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mortal%20mother%20of%20Perseus
### /domain/the%20mortal%20mother%20of%20Dionysus → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mortal%20mother%20of%20Dionysus
### /domain/desire%20(primordial) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/desire%20(primordial)
### /domain/the%20rescued%20princess → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20rescued%20princess
### /domain/the%20monster-mother → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20monster-mother
### /domain/the%20great%20world-river → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20great%20world-river
### /domain/the%20sea%20(primordial) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sea%20(primordial)
### /domain/the%20primordial%20sea → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primordial%20sea
### /domain/the%20mother%20of%20rivers → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mother%20of%20rivers
### /domain/the%20mortal%20mother%20of%20Heracles → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mortal%20mother%20of%20Heracles
### /domain/the%20faithful%20wife%20of%20Odysseus → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20faithful%20wife%20of%20Odysseus
### /domain/the%20son%20of%20Odysseus → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20son%20of%20Odysseus
### /domain/the%20cup-bearer%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20cup-bearer%20of%20the%20gods
### /domain/the%20primordial%20gap → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primordial%20gap
### /domain/the%20primordial%20giant → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primordial%20giant
### /domain/the%20primordial%20cow → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primordial%20cow
### /domain/the%20first%20god → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20first%20god
### /domain/the%20ancestor%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20ancestor%20of%20the%20gods
### /domain/the%20giantess%20mother%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giantess%20mother%20of%20the%20gods
### /domain/the%20runes → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20runes
### /domain/one%20of%20the%20three%20brothers%20who%20made%20the%20world → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/one%20of%20the%20three%20brothers%20who%20made%20the%20world
### /domain/the%20protection%20of%20humans → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protection%20of%20humans
### /domain/the%20sky%20(as%20a%20personification) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky%20(as%20a%20personification)
### /domain/the%20sun%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sun%20(in%20some%20accounts)
### /domain/the%20blind%20brother%20of%20Baldr → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20blind%20brother%20of%20Baldr
### /domain/fire%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/fire%20(in%20some%20accounts)
### /domain/the%20sky%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky%20(in%20some%20accounts)
### /domain/sei%C3%B0r%20(magic) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/sei%C3%B0r%20(magic)
### /domain/calm%20winds → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/calm%20winds
### /domain/the%20watchman → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20watchman
### /domain/the%20light → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20light
### /domain/the%20dawn → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20dawn
### /domain/the%20avenger → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20avenger
### /domain/the%20avenger%20of%20Baldr → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20avenger%20of%20Baldr
### /domain/the%20great%20wolf → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20great%20wolf
### /domain/the%20world-serpent → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20world-serpent
### /domain/the%20eight-legged%20horse%20of%20Odin → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20eight-legged%20horse%20of%20Odin
### /domain/the%20giantess%20mother%20of%20the%20monsters → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giantess%20mother%20of%20the%20monsters
### /domain/the%20wife%20of%20Thor → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20wife%20of%20Thor
### /domain/the%20archer → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20archer
### /domain/the%20winter → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20winter
### /domain/the%20wife%20of%20Baldr → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20wife%20of%20Baldr
### /domain/the%20giantess%20mother%20of%20Thor's%20sons → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giantess%20mother%20of%20Thor's%20sons
### /domain/the%20giantess%20beloved%20of%20Freyr → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giantess%20beloved%20of%20Freyr
### /domain/the%20huntress → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20huntress
### /domain/the%20mountains → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mountains
### /domain/the%20fire-giant → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20fire-giant
### /domain/the%20end%20of%20the%20world → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20end%20of%20the%20world
### /domain/the%20giant%20of%20the%20iron%20head → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giant%20of%20the%20iron%20head
### /domain/the%20giantess%20who%20bore%20Sleipnir%20(in%20one%20account) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giantess%20who%20bore%20Sleipnir%20(in%20one%20account)
### /domain/the%20sun → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sun
### /domain/the%20self-created%20god → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20self-created%20god
### /domain/the%20primordial%20waters → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primordial%20waters
### /domain/chaos%20(the%20pre-creation%20state) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/chaos%20(the%20pre-creation%20state)
### /domain/the%20night%20serpent → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20night%20serpent
### /domain/the%20enemy%20of%20the%20sun → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20enemy%20of%20the%20sun
### /domain/the%20air → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20air
### /domain/the%20atmosphere → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20atmosphere
### /domain/the%20first%20divine%20pair%20(with%20Tefnut) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20first%20divine%20pair%20(with%20Tefnut)
### /domain/the%20first%20divine%20pair%20(with%20Shu) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20first%20divine%20pair%20(with%20Shu)
### /domain/the%20land → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20land
### /domain/the%20sky → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky
### /domain/the%20stars → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20stars
### /domain/the%20heavens → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20heavens
### /domain/the%20afterlife → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20afterlife
### /domain/the%20Nile's%20flood → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20Nile's%20flood
### /domain/the%20fertile%20earth → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20fertile%20earth
### /domain/the%20protection%20of%20the%20dead → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protection%20of%20the%20dead
### /domain/the%20sun%20(as%20Horakhty) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sun%20(as%20Horakhty)
### /domain/the%20falcon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20falcon
### /domain/the%20protector%20of%20the%20pharaoh → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protector%20of%20the%20pharaoh
### /domain/the%20desert → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20desert
### /domain/the%20foreigner → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20foreigner
### /domain/the%20protection%20of%20the%20mummy → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protection%20of%20the%20mummy
### /domain/the%20threshold%20(her%20name%20means%20'lady%20of%20the%20house) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20threshold%20(her%20name%20means%20'lady%20of%20the%20house)
### /domain/the%20king%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20king%20of%20the%20gods
### /domain/the%20hidden%20one → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20hidden%20one
### /domain/creation%20(in%20later%20periods) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/creation%20(in%20later%20periods)
### /domain/the%20craftsman-god → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20craftsman-god
### /domain/the%20patron%20of%20Memphis → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20patron%20of%20Memphis
### /domain/the%20sculptor%20of%20the%20world → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sculptor%20of%20the%20world
### /domain/the%20moon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20moon
### /domain/the%20judge%20of%20the%20dead → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20judge%20of%20the%20dead
### /domain/the%20sky%20(as%20the%20cow) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky%20(as%20the%20cow)
### /domain/the%20protection%20of%20women → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protection%20of%20women
### /domain/the%20gentle%20moon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20gentle%20moon
### /domain/the%20destruction → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20destruction
### /domain/the%20raging%20eye%20of%20Ra → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20raging%20eye%20of%20Ra
### /domain/the%20mummification → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20mummification
### /domain/the%20threshold%20of%20the%20tomb → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20threshold%20of%20the%20tomb
### /domain/the%20protection%20of%20the%20grave → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20protection%20of%20the%20grave
### /domain/the%20primeval%20waters%20(Hermopolitan%20account) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primeval%20waters%20(Hermopolitan%20account)
### /domain/primordial%20infinity%20(Hermopolitan%20account) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/primordial%20infinity%20(Hermopolitan%20account)
### /domain/primordial%20mystery%20(Hermopolitan%20account) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/primordial%20mystery%20(Hermopolitan%20account)
### /domain/primordial%20duration%20(Hermopolitan%20account) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/primordial%20duration%20(Hermopolitan%20account)
### /domain/the%20elder%20sky-falcon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20elder%20sky-falcon
### /domain/the%20highest%20heaven → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20highest%20heaven
### /domain/the%20supreme%20god%20(in%20folk%20belief) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20supreme%20god%20(in%20folk%20belief)
### /domain/thunder%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/thunder%20(in%20some%20accounts)
### /domain/the%20oak → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20oak
### /domain/fire%20(the%20sacred%20flame) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/fire%20(the%20sacred%20flame)
### /domain/the%20snake%20(the%20serpent) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20snake%20(the%20serpent)
### /domain/the%20realm%20of%20the%20dead%20(Nav) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20realm%20of%20the%20dead%20(Nav)
### /domain/the%20sky%20(as%20father) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sky%20(as%20father)
### /domain/the%20daylight → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20daylight
### /domain/the%20giver%20of%20light%20(his%20name%20means%20'day-god'%20or%20'light-god') → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20giver%20of%20light%20(his%20name%20means%20'day-god'%20or%20'ligh
### /domain/the%20sun%20(a%20solar%20god) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sun%20(a%20solar%20god)
### /domain/the%20wind → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20wind
### /domain/the%20breath%20of%20the%20sky → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20breath%20of%20the%20sky
### /domain/the%20fate%20(the%20spinning%20of%20destiny) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20fate%20(the%20spinning%20of%20destiny)
### /domain/women's%20work → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/women's%20work
### /domain/the%20household → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20household
### /domain/the%20'Lada'%20(the%20beloved) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'Lada'%20(the%20beloved)
### /domain/the%20cold → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20cold
### /domain/the%20'drowning%20of%20Marzanna'%20(the%20winter-ritual) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'drowning%20of%20Marzanna'%20(the%20winter-ritual)
### /domain/the%20'Kupala'%20night%20(the%20midsummer%20solstice) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'Kupala'%20night%20(the%20midsummer%20solstice)
### /domain/the%20morning%20star%20(Venus) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20morning%20star%20(Venus)
### /domain/the%20threshold%20(the%20'gate'%20of%20the%20sky) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20threshold%20(the%20'gate'%20of%20the%20sky)
### /domain/the%20realm%20of%20the%20dead%20(Nav%2FCherd) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20realm%20of%20the%20dead%20(Nav%2FCherd)
### /domain/the%20'devil'%20(a%20Christianization%20of%20the%20underworld-god) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'devil'%20(a%20Christianization%20of%20the%20underworld-god)
### /domain/the%20supreme%20god%20(Sumerian%20period) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20supreme%20god%20(Sumerian%20period)
### /domain/king%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/king%20of%20the%20gods
### /domain/the%20ground → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20ground
### /domain/the%20lower%20world%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20lower%20world%20(in%20some%20accounts)
### /domain/the%20primeval%20freshwater → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primeval%20freshwater
### /domain/the%20deep → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20deep
### /domain/the%20sweet%20water%20beneath%20the%20earth → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20sweet%20water%20beneath%20the%20earth
### /domain/the%20primeval%20saltwater → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20primeval%20saltwater
### /domain/the%20salt%20sea → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20salt%20sea
### /domain/chaos%20(the%20primordial%20state) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/chaos%20(the%20primordial%20state)
### /domain/the%20'crown'%20(his%20title%3A%20he%20holds%20the%20'Tablet%20of%20Destinies') → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'crown'%20(his%20title%3A%20he%20holds%20the%20'Tablet%20of%20Des
### /domain/the%20general%20of%20Tiamat's%20army → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20general%20of%20Tiamat's%20army
### /domain/the%20storm → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20storm
### /domain/king%20of%20the%20gods%20(Akkadian%2FBabylonian%20period) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/king%20of%20the%20gods%20(Akkadian%2FBabylonian%20period)
### /domain/the%20'breath'%20of%20the%20world → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'breath'%20of%20the%20world
### /domain/the%20freshwater → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20freshwater
### /domain/the%20'me'%20(the%20divine%20decrees) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'me'%20(the%20divine%20decrees)
### /domain/the%20'apku'%20(the%20sage) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'apku'%20(the%20sage)
### /domain/the%20moon%20(as%20consort%20of%20Enlil) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20moon%20(as%20consort%20of%20Enlil)
### /domain/the%20'light'%20of%20Enlil → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'light'%20of%20Enlil
### /domain/the%20calendar → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20calendar
### /domain/fate%20(the%20moon-god%20decrees%20fates) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/fate%20(the%20moon-god%20decrees%20fates)
### /domain/the%20'light'%20that%20reveals%20the%20truth → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'light'%20that%20reveals%20the%20truth
### /domain/the%20'day' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'day'
### /domain/the%20'queen%20of%20heaven' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'queen%20of%20heaven'
### /domain/the%20morning%2Fevening%20star%20(Venus) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20morning%2Fevening%20star%20(Venus)
### /domain/the%20queen%20of%20the%20dead → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20queen%20of%20the%20dead
### /domain/the%20'dark' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'dark'
### /domain/the%20plague → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20plague
### /domain/the%20'lord%20of%20the%20netherworld' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'lord%20of%20the%20netherworld'
### /domain/war%20(in%20some%20accounts) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/war%20(in%20some%20accounts)
### /domain/the%20'storm'%20(in%20the%20Babylonian%20period) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'storm'%20(in%20the%20Babylonian%20period)
### /domain/king%20of%20the%20gods%20(Babylonian%20period) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/king%20of%20the%20gods%20(Babylonian%20period)
### /domain/the%20'flood'%20(in%20the%20Enuma%20Elish) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'flood'%20(in%20the%20Enuma%20Elish)
### /domain/the%20'consort%20of%20An' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'consort%20of%20An'
### /domain/the%20'sky'%20(as%20consort) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'sky'%20(as%20consort)
### /domain/the%20'mother'%20of%20the%20gods → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'mother'%20of%20the%20gods
### /domain/the%20'mistress%20of%20the%20mountains' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'mistress%20of%20the%20mountains'
### /domain/the%20underworld%20(as%20Ereshkigal's%20consort) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20underworld%20(as%20Ereshkigal's%20consort)
### /domain/the%20moon%20(as%20consort%20of%20Nanna) → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20moon%20(as%20consort%20of%20Nanna)
### /domain/the%20'light'%20of%20the%20moon → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'light'%20of%20the%20moon
### /domain/the%20'sage' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'sage'
### /domain/the%20'scribes' → 404
  - console: Failed to load resource: the server responded with a status of 404 (Not Found)
  - req: HTTP 404 http://localhost:3002/domain/the%20'scribes'

## Verdict: **FAIL**
---
## CORRECTION & FINAL VERDICT (orchestrator, post-sweep analysis)

The raw "215 bad" conflated a harness artifact with real bugs. Corrected breakdown:

| Category | Count | Verdict |
|---|---|---|
| Multi-word /domain/* 404s (space/paren/aprophe in param) | **206** | **REAL BUG - BUG-001 (critical)**. Files exist in build; prod static serving can't map encoded URL to literal-space filename. Homepage links to >=3 of them. |
| Non-domain 404s | 0 | all deity/myth/artifact routes clean |
| Console errors on the 404 routes | 207 | consequence of the 404s (browser logs failed resource), not separate |
| NAV-ERR timeouts (8) | 8 | **partly harness artifact**: networkidle never idles on lazy remote images. Retest (load+settle): 7/8 render fine in 8-19s (slow, BUG-004); only /deity/gre-chaos exceeded 45s. |
| /culture/nope -> 500 (expected 404) | 1 | **REAL BUG - BUG-003 (minor)**. generateMetadata crashes before notFound(). |
| Mobile 390px overflow | all pages | **REAL BUG - BUG-002 (major)**. .topnav .links (549px, no wrap) inflates layout viewport to 643px -> horizontal scroll site-wide on phones. |
| Negative 404 checks (deity/myth/artifact) | 3/3 | PASS |
| Visual baselines | 32 shots | captured in qa/baseline/ |

**Overall: FAIL - release (Gate 6) blocked by BUG-001 (critical) + BUG-002 (major).**
BUG-003 / BUG-004 are non-blocking (minor). All four filed as issues with repro + proposed fix.

> Evidence caveat: an earlier "dev mode 200" data point was INVALID (port 3010 was a
> Docker container running an unrelated SPA catch-all; the next dev launch had hit
> EADDRINUSE). Struck in TASK-010-domain-analysis.md. The prod 404-vs-200 split above
> is the only valid evidence and is internally consistent.
