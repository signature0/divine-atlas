#!/usr/bin/env node
// Integrate Phase-1 research/ -> data/ (canonical app input).
// - normalizes relationship keys (source/target -> from/to)
// - ensures artworks carry `alt` (fallback: subject/title)
// - generates data/<culture>/sources.md from distinct SourceRef objects
// Never deletes research/ — it is the audit trail.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const CULTURES = ['japanese','greek','norse','egyptian','slavic','mesopotamian'];
const FILES = ['entities','relationships','myths','cosmology','artworks','timeline','uncertainties'];

function jload(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function jdump(p,o){ fs.writeFileSync(p, JSON.stringify(o,null,2)+'\n'); }

// collect distinct SourceRef objects across all entity primary_sources
function collectSources(culture){
  const ents = jload(path.join(ROOT,'research',culture,'entities.json'));
  const map = new Map();
  for(const e of ents){
    for(const s of (e.primary_sources||[])){
      if(s && s.ref) map.set(s.ref, s);
    }
  }
  return [...map.values()].sort((a,b)=>{
    const na=+a.ref.slice(1)||999, nb=+b.ref.slice(1)||999; return na-nb;
  });
}

// Bibliography strategy:
// - If research/<culture>/sources.md exists (hand-written, e.g. japanese), it is
//   AUTHORITATIVE: parse its `**[S#]**` entries into a `sources` array and copy
//   the file verbatim to data/.
// - Otherwise, synthesize sources.md + sources.json from the SourceRef objects
//   in entities' primary_sources (these are the audit trail for those cultures).
// Both formats use `**[S#]**` lines so validate.mjs treats them identically.
function parseResearchSourcesMd(md){
  const map = new Map();
  for(const line of md.split('\n')){
    const m = line.match(/^\s*-\s*\*\*\[(S\d+)\]\*\*\s*(.*)$/);
    if(!m) continue;
    const body = m[2].replace(/\s+/g,' ').trim();
    const url = (body.match(/https?:\/\/\S+/)||[])[0] || '';
    map.set(m[1], { ref: m[1], name: body.replace(/\s*—\s*$/,'').slice(0,140), url });
  }
  return map;
}

function synthSourcesMd(culture, sources){
  const lines = [`# ${culture} — Source bibliography (synthesized from entity primary_sources)`, ''];
  for(const s of sources){
    lines.push(`- **[${s.ref}]** ${s.name||s.ref}` + (s.date?` (${s.date})`:'') + ` — ${ (s.type||'source').toUpperCase() }` + (s.url?` — ${s.url}`:''));
  }
  lines.push('');
  lines.push('_Provenance: see `research/<culture>/` (the inspection trail) and `research/MYTHOLOGY-MODEL.md`.');
  lines.push('');
  return lines.join('\n');
}

let total=0;
for(const culture of CULTURES){
  const srcDir = path.join(ROOT,'research',culture);
  const dstDir = path.join(ROOT,'data',culture);
  fs.mkdirSync(dstDir,{recursive:true});
  for(const f of FILES){
    const p = path.join(srcDir, f+'.json');
    if(!fs.existsSync(p)) continue;
    let obj = jload(p);
    if(f==='relationships'){
      obj = obj.map(r=>({ from:r.source, to:r.target, type:r.type, note:r.note||'', confidence:r.confidence||'attested', sources:r.sources||[], ...(r.explanation?{explanation:r.explanation}:{}) }));
    }
    if(f==='artworks'){
      obj = obj.map(a=>{
        const o={...a};
        if(!o.alt) o.alt = a.subject ? `${a.subject} — ${a.title}` : a.title;
        return o;
      });
    }
    if(f==='uncertainties'){
      // Two shapes in the research data:
      //   A: {topic, description, positions:[{name,description,support?}], sources?}
      //   B: {id, question, versions:{name: description}, how_we_present_it}
      // Normalize to: {id?, topic, description?, positions:[{name,description,support?}], how_we_present_it?, sources?}
      obj = obj.map(u=>{
        if(u.positions && Array.isArray(u.positions)){
          return { id: u.id, topic: u.topic, description: u.description,
            positions: u.positions.map(p=>({ name: p.name, description: p.description, support: p.support })),
            how_we_present_it: u.how_we_present_it, sources: u.sources };
        }
        return { id: u.id, topic: u.question,
          positions: Object.entries(u.versions||{}).map(([name,desc])=>({ name, description: desc })),
          how_we_present_it: u.how_we_present_it };
      }).filter(u=>u.topic);
    }
    if(f==='timeline'){
      // Two shapes:
      //   A (japanese): {id, label, year_label, sort_year, kind, description}
      //   B (others):   {id, period, date_range, description, confidence}
      // Normalize to: {id, label, year_label, sort_year, kind?, description, confidence?}
      obj = obj.map((t,i)=>{
        if(t.year_label){
          return { id: t.id, label: t.label, year_label: t.year_label, sort_year: t.sort_year,
            kind: t.kind, description: t.description, confidence: t.confidence };
        }
        const conf = (t.confidence||'').toLowerCase();
        const c = conf.startsWith('attested') ? 'attested'
          : conf.startsWith('reconstruct') ? 'reconstructed'
          : conf.startsWith('modern') ? 'modern' : 'uncertain';
        return { id: t.id, label: t.period, year_label: t.date_range, sort_year: i,
          kind: 'period', description: t.description, confidence: c };
      });
    }
    jdump(path.join(dstDir,f+'.json'), obj);
  }
  // culture-specific meta.json
  const meta = { culture, layers_note: '' };
  jdump(path.join(dstDir,'meta.json'), meta);
  // sources.md + sources.json
  const researchMdPath = path.join(srcDir,'sources.md');
  let sources;
  if(fs.existsSync(researchMdPath)){
    const researchMd = fs.readFileSync(researchMdPath,'utf8');
    fs.writeFileSync(path.join(dstDir,'sources.md'), researchMd);
    const refMap = parseResearchSourcesMd(researchMd);
    for(const s of collectSources(culture)){
      if(!refMap.has(s.ref)) refMap.set(s.ref, s); // safety net only
    }
    sources = [...refMap.values()].sort((a,b)=>{
      const na=+a.ref.slice(1)||999, nb=+b.ref.slice(1)||999; return na-nb;
    });
  } else {
    sources = collectSources(culture);
    fs.writeFileSync(path.join(dstDir,'sources.md'), synthSourcesMd(culture, sources));
  }
  jdump(path.join(dstDir,'sources.json'), sources);
  const ecount = jload(path.join(dstDir,'entities.json')).length;
  const rcount = jload(path.join(dstDir,'relationships.json')).length;
  total += ecount;
  console.log(`${culture}: ${ecount}e / ${rcount}r / ${sources.length} sources`);
}
console.log(`\nIntegrated ${CULTURES.length} cultures -> data/ (total entities: ${total})`);
