
> divine-atlas@0.1.0 build
> next build

   ▲ Next.js 15.5.25

   Creating an optimized production build ...
 ✓ Compiled successfully in 4.7s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/557) ...
   Generating static pages (139/557) 
   Generating static pages (278/557) 
   Generating static pages (417/557) 
 ✓ Generating static pages (557/557)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                  Size  First Load JS
┌ ○ /                                       164 B         106 kB
├ ○ /_not-found                             123 B         103 kB
├ ○ /about                                  164 B         106 kB
├ ○ /artifacts                            2.19 kB         108 kB
├ ● /artifacts/[slug]                       951 B         107 kB
├   ├ /artifacts/kusanagi-no-tsurugi
├   ├ /artifacts/yata-no-kagami
├   ├ /artifacts/yasakani-no-magatama
├   └ [+16 more paths]
├ ○ /compare                              2.58 kB         109 kB
├ ● /culture/[culture]                    2.54 kB         136 kB
├   ├ /culture/japanese
├   ├ /culture/greek
├   ├ /culture/norse
├   └ [+3 more paths]
├ ● /deity/[id]                           1.51 kB         135 kB
├   ├ /deity/jpn-kamimusubi
├   ├ /deity/jpn-amenominakanushi
├   ├ /deity/jpn-izananagi
├   └ [+156 more paths]
├ ● /domain/[domain]                        161 B         106 kB
├   ├ /domain/izumo
├   ├ /domain/agriculture
├   ├ /domain/alliance
├   └ [+317 more paths]
├ ƒ /graph                                1.58 kB         135 kB
├ ○ /icon.svg                                 0 B            0 B
└ ● /myths/[id]                             951 B         107 kB
    ├ /myths/jpn-creation-primordial
    ├ /myths/jpn-creation-islands
    ├ /myths/jpn-izananagis-purification
    └ [+41 more paths]
+ First Load JS shared by all              103 kB
  ├ chunks/255-37e0f0325134c4d7.js        46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js   54.2 kB
  └ other shared chunks (total)           1.95 kB


○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand

