#!/usr/bin/env python3
"""One-time, fail-closed migration of the existing Jekyll documents to Markdown.
Existing Markdown is NEVER overwritten. No external Python packages are needed.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re
import unicodedata

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / 'content'
DATE = '2026-09-01'
OLD_DATE = '이 회칙은 총회에서 제정 의결된 날부터 시행한다. (제정: 2026. 9. ○.)'
NEW_DATE = '이 회칙은 2026년 9월 1일부터 시행한다.'
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
@dataclass
class Element:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)
class Tree(HTMLParser):
    def __init__(self, source: str):
        super().__init__(convert_charrefs=True)
        self.root=Element('root'); self.stack=[self.root]; self.feed(source); self.close()
    def handle_starttag(self, tag, attrs):
        node=Element(tag,dict(attrs)); self.stack[-1].children.append(node)
        if tag not in VOID: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Element(tag,dict(attrs)))
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                del self.stack[i:]; return
    def handle_data(self, data): self.stack[-1].children.append(data)
def text(node):
    if isinstance(node,str): return node
    return ''.join(text(child) for child in node.children)
def escaped(value): return re.sub(r'([\\`*_{}\[\]<>])',r'\\\1',value)
def children(node): return ''.join(render(child) for child in node.children)
def descendants(node, tag):
    if isinstance(node,str): return []
    return ([node] if node.tag==tag else []) + [item for child in node.children for item in descendants(child,tag)]
def render(node):
    if isinstance(node,str): return escaped(node)
    tag=node.tag; css=node.attrs.get('class','').split()
    if tag in {'script','style','noscript'}: return ''
    if tag=='br': return '  \n'
    if tag=='hr': return '\n\n---\n\n'
    if 'art-h' in css:
        number=''; title=''
        for child in node.children:
            if not isinstance(child,str) and 'art-n' in child.attrs.get('class','').split(): number=text(child).strip()
            elif not isinstance(child,str) and child.tag=='b': title=text(child).strip()
        return f'\n\n### {escaped(number)}({escaped(title)})\n\n'
    if tag in {'ol','ul'}:
        output=[]
        for index,item in enumerate(child for child in node.children if isinstance(child,Element) and child.tag=='li'):
            marker=None; parts=[]
            for child in item.children:
                if isinstance(child,Element) and 'cn' in child.attrs.get('class','').split() and marker is None: marker=text(child).strip()
                else: parts.append(render(child))
            body=''.join(parts).strip()
            prefix=(marker+' ') if marker and re.fullmatch(r'\d+\.',marker) else ('- '+marker+' ' if marker else (f'{index+int(node.attrs.get("start",1))}. ' if tag=='ol' else '- '))
            lines=body.splitlines()
            output.append(prefix + (lines[0] if lines else '') + ''.join('\n    '+line if line else '\n' for line in lines[1:]))
        return '\n\n'+'\n'.join(output)+'\n\n'
    if tag=='table':
        rows=[]
        for tr in descendants(node,'tr'):
            cells=[cell for cell in tr.children if isinstance(cell,Element) and cell.tag in {'td','th'}]
            if cells: rows.append([re.sub(r'\s*\n\s*','<br>',children(cell).strip()).replace('|','\\|') for cell in cells])
        if not rows: return ''
        width=max(map(len,rows)); rows=[row+['']*(width-len(row)) for row in rows]
        lines=['| '+' | '.join(row)+' |' for row in rows]
        lines.insert(1,'| '+' | '.join(['---']*width)+' |')
        return '\n\n'+'\n'.join(lines)+'\n\n'
    body=children(node)
    if tag in {'strong','b'}: return '**'+body.strip()+'**' if body.strip() else ''
    if tag in {'em','i'}: return '*'+body.strip()+'*' if body.strip() else ''
    if tag=='code': return '`'+text(node).replace('`','\\`')+'`'
    if tag=='a':
        anchor='<a id="'+node.attrs['id']+'"></a>\n' if node.attrs.get('id') else ''
        return anchor+('['+body+']('+node.attrs['href']+')' if node.attrs.get('href') else body)
    if re.fullmatch(r'h[1-6]',tag):
        anchor='<a id="'+node.attrs['id']+'"></a>\n\n' if node.attrs.get('id') else ''
        return '\n\n'+anchor+'#'*int(tag[1])+' '+body.strip()+'\n\n'
    if tag=='blockquote': return '\n\n'+'\n'.join('> '+line for line in body.strip().splitlines())+'\n\n'
    if tag in {'p','div','section'}: return '\n\n'+body.strip()+'\n\n' if body.strip() else ''
    return body

def canon(value):
    return ''.join(char for char in unicodedata.normalize('NFC',value) if unicodedata.category(char)[0] in {'L','N'})
def md_visible(markdown):
    value=re.sub(r'<a\s+id="[^"]*"\s*></a>','',markdown)
    value=re.sub(r'<br\s*/?>',' ',value)
    value=re.sub(r'\[([^\]]*)\]\([^)]*\)',r'\1',value)
    return value

def html_to_md(source):
    tree=Tree(source)
    output=re.sub(r'\n[ \t]+\n','\n\n',render(tree.root))
    output=re.sub(r'\n{3,}','\n\n',output).strip()+'\n'
    original=canon(text(tree.root)); converted=canon(md_visible(output))
    if original!=converted:
        # Generic lists have implicit browser markers not present in the HTML text.
        no_generated_numbers=re.sub(r'(?m)^\s*\d+\.\s+', '', md_visible(output))
        if original!=canon(no_generated_numbers):
            first=next((i for i,(a,b) in enumerate(zip(original,converted)) if a!=b),min(len(original),len(converted)))
            raise ValueError(f'Visible text mismatch at {first}: {original[first:first+70]} != {converted[first:first+70]}')
    return output

def front(source):
    match=re.match(r'^---\r?\n([\s\S]*?)\r?\n---\s*\n([\s\S]*)$',source)
    if not match: return '',source
    return match[1],match[2]
def links(body):
    return re.sub(r'\{\{\s*[\'\"]([^\'\"]+)[\'\"]\s*\|\s*(?:relative_url|absolute_url)\s*\}\}',r'\1',body)
def metadata(old, extra):
    lines=old.splitlines()
    for key,value in extra.items():
        lines=[line for line in lines if not line.startswith(key+':')]
        lines.append(key+': '+json.dumps(value,ensure_ascii=False))
    return '\n'.join(lines)

PAGES=[
 ('bylaws','회칙','규정','source'),('finance','재무 규정','규정','source'),
 ('audit','재무 감사 시행세칙','규정','source'),('recruitment','임원 선발 규정','규정','source'),
 ('clubroom','동아리방 이용 규정','규정','source'),('privacy','개인정보 처리방침','정책','source'),
 ('terms','서비스 이용약관','정책','supplement'),('consent','개인정보 동의서','서식','supplement'),
 ('media','촬영·초상 이용 동의','서식','supplement'),('cctv','CCTV 운영·관리 방침','정책','supplement'),
 ('regulations','규정집 안내','관리','review'),('publication','시행일·원문 반영 기록','관리','review'),
 ('reviews','검토 사항·개정 이력','관리','review'),('references','원문·법령 출처','관리','review'),
 ('privacy/source','개인정보 처리방침 · 첨부 원문','보관','archive'),
 ('privacy/proposal','개인정보 처리방침 · 이전 보완 제안','보관','archive'),
]
def migrate():
    marker=TARGET/'.migration.json'
    if marker.exists():
        print('Markdown migration already completed; existing content is unchanged.'); return
    outputs={}; report=[]
    for order,(slug,title,group,kind) in enumerate(PAGES,1):
        destination=TARGET/(slug+'.md')
        if destination.exists(): raise RuntimeError(f'Refusing to overwrite existing Markdown: {destination}')
        source_path=next((ROOT/slug/('index'+ext) for ext in ['.md','.html'] if (ROOT/slug/('index'+ext)).exists()),None)
        if source_path is None: raise FileNotFoundError(f'Missing legacy document {slug}; migration aborted without writes.')
        raw=source_path.read_text(encoding='utf-8'); fm,body=front(raw); body=links(body)
        if slug=='bylaws':
            intro=body.split('{% capture')[0]
            original=(ROOT/'_includes/bylaws.html').read_text(encoding='utf-8')
            if original.count(OLD_DATE)!=1: raise ValueError('Expected exactly one original effective-date clause.')
            body=intro+original.replace(OLD_DATE,NEW_DATE)
        elif slug in {'finance','audit','recruitment'}:
            body=re.sub(r'\{%\s*include\s+([\w.-]+)\s*%\}',lambda match:(ROOT/'_includes'/match[1]).read_text(encoding='utf-8'),body)
        elif slug=='privacy/source':
            body=(ROOT/'_includes/privacy-original.md').read_text(encoding='utf-8')
        if slug=='clubroom':
            body=body.replace('학교 규정과 동아리 회칙을 우선하며, 회칙에 따른 의결 후 공지한 날부터 시행한다.','학교 규정과 동아리 회칙을 우선하며, 2026년 9월 1일부터 시행한다.')
        if source_path.suffix=='.html' and slug!='privacy/source': body=html_to_md(body)
        if '{%' in body or '{{' in body: raise ValueError(f'Unresolved template expression in {slug}')
        extra={'title':title,'order':order,'group':group,'source_type':kind,'source_path':str(source_path.relative_to(ROOT))}
        # Preserve document version/status, including supplements and unfilled contact fields.
        if not re.search(r'^description:',fm,re.M): extra['description']=title+' 문서.'
        if not re.search(r'^status:',fm,re.M): extra['status']='첨부 원문 기반' if kind=='source' else '보관·참조 문서'
        if not re.search(r'^version:',fm,re.M): extra['version']='2026.09 · 원문 반영본'
        if kind in {'source','supplement'}: extra['effective_date']=DATE
        if slug.startswith('privacy/'):
            extra['hidden']=True; extra['effective_date']=None
        new='---\n'+metadata(fm,extra)+'\n---\n\n'+body.strip()+'\n'
        outputs[destination]=new
        report.append({'slug':slug,'source':str(source_path.relative_to(ROOT)),'source_sha256':hashlib.sha256(raw.encode()).hexdigest(),'markdown_sha256':hashlib.sha256(new.encode()).hexdigest(),'html_conversion_text_check':source_path.suffix=='.html' and slug!='privacy/source'})
    # Validate everything before writing any file.
    for filename,value in outputs.items():
        filename.parent.mkdir(parents=True,exist_ok=True); filename.write_text(value,encoding='utf-8')
    marker.write_text(json.dumps({'version':1,'source_commit':'7e61749e5c7091234ac1060376ea60645f3d0a18','effective_date':DATE,'documents':report},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Migrated {len(outputs)} documents into content/. No existing Markdown was overwritten.')
if __name__=='__main__': migrate()
