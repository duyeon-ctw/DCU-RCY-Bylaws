import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {getDocuments,contentDigest} from '../lib/documents.mjs';
import {retiredSlugs} from '../lib/regulation-format.mjs';
import {site} from '../lib/site.mjs';
const docs=getDocuments();
fs.mkdirSync('out',{recursive:true});
// Remove stale artifacts even when building locally over an older export.
for(const slug of retiredSlugs){for(const target of [path.join('out',slug),path.join('out',slug+'.html'),path.join('out',slug+'.txt'),path.join('out/downloads',slug+'.md')])fs.rmSync(target,{force:true,recursive:true});}
fs.writeFileSync('out/.nojekyll','');
fs.writeFileSync('out/CNAME',new URL(site.url).hostname+'\n');
let commit=process.env.GITHUB_SHA || 'local';
try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const version={framework:'Next.js',release:site.release,sourceCommit:commit,builtAt:new Date().toISOString(),contentHash:contentDigest(docs),documents:docs.map(({slug,hash,effective_date,version})=>({slug,hash,effective_date,version}))};
fs.writeFileSync('out/version.json',JSON.stringify(version,null,2)+'\n');
for(const doc of docs){const dest=path.join('out/downloads',doc.slug+'.md');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(doc.sourcePath,dest);}
for(const doc of docs.filter(doc=>!doc.slug.includes('/'))){const name=doc.slug;fs.writeFileSync(`out/${name}.html`,`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>문서 이동</title><link rel="canonical" href="${site.url}/${name}/"><script>location.replace('./${name}/'+location.search+location.hash)</script></head><body><a href="./${name}/">새 문서 주소로 이동</a></body></html>`);}
console.log(`Export ready: ${docs.length} Markdown documents, commit ${commit}.`);
