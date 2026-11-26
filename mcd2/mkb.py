import json, sys
sys.path.insert(0,'/home/claude/atlas-render/mcd2')
import videos_b as VB
B=json.load(open('batches.json')); NARR='w495jEjc73YEWOkc3VLu'; talk={}
for f in [VB.nav,VB.rbx,VB.sbx,VB.tbl]:
    S=f(); k=S['key']; json.dump(S,open(f'{k}_script.json','w'),ensure_ascii=False,indent=0)
    out=[dict(id=f'{k}_intro',voice=NARR,ids=[f'I{i}' for i in range(len(S['intro']))]+['O0'],text=' [pause] '.join(S['intro']+S['outro']))]
    cur=[];n=0;j=0
    for c in S['C']:
        cur.append(('N_'+c['c'],c['say'])); n+=len(c['say'])+1
        if n>950: out.append(dict(id=f'{k}_n{j}',voice=NARR,ids=[a for a,_ in cur],text=' [pause] '.join(b for _,b in cur))); j+=1; cur=[]; n=0
    if cur: out.append(dict(id=f'{k}_n{j}',voice=NARR,ids=[a for a,_ in cur],text=' [pause] '.join(b for _,b in cur)))
    B[k]=out
    for cc,(v,t) in S['T'].items(): talk.setdefault(v,[]).append((k,'S_'+cc,t))
B['talk']=[dict(id=f'tk{i}',voice=v,ids=[f'{k}:{s}' for k,s,_ in L],text=' [pause] '.join(t for _,_,t in L)) for i,(v,L) in enumerate(talk.items())]
json.dump(B,open('batches.json','w'),ensure_ascii=False,indent=0)
