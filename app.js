const $=s=>document.querySelector(s),app=$('#app');
const LS=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const rot=(o,a,r)=>{const rest=o.filter((_,k)=>k!==a);rest.splice(r,0,o[a]);return rest};
const bank=Q.map((q,i)=>({id:i+1,subj:q[0],topic:q[1],diff:q[2],q:q[3],o:rot(q[4],q[5],i%4),a:i%4,e:q[6]}));
const subjects=[...new Set(bank.map(q=>q.subj))],topics=[...new Set(bank.map(q=>q.topic))];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// Shuffle answer order while keeping the correct-answer index mapped correctly
const prep=(q,sh)=>{if(!sh)return{...q};const s=shuf(q.o.map((t,i)=>({t,c:i===q.a})));return{...q,o:s.map(x=>x.t),a:s.findIndex(x=>x.c)}};
const def=()=>({known:[],ans:0,ok:0,wrong:[],book:[],tests:[],viewed:[],by:{}});
let st=Object.assign(def(),LS('cpa',{})),S=null,timer=null,card={list:[],i:0,flip:false};
const save=()=>SV('cpa',st),go=h=>V[h](),base=()=>V[document.body.dataset.v]();
const fmt=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
const ni=s=>NOTES.findIndex(n=>n.s===s);
const pct=(a,b)=>b?Math.round(100*a/b):0;
const V={};

function start(mode,pool,mins,sh,name){
  clearInterval(timer);
  S={mode,pool,mins,sh,name,qs:shuf(pool).map(q=>prep(q,sh)),i:0,ans:[],mark:[],t0:Date.now(),end:mins?Date.now()+mins*60000:0,done:0};
  if(mins)timer=setInterval(tick,500);
  go('quiz');
}
function tick(){
  if(!S||S.done||!S.end){clearInterval(timer);return}
  const l=Math.max(0,Math.round((S.end-Date.now())/1000)),t=$('#tm');
  if(t){t.textContent=fmt(l)+(l<=60&&l>0?' – under 1 minute left':'');t.className='tm'+(l<=60?' warn':'')}
  if(l<=0)finish();
}
function finish(){
  if(!S||S.done)return;
  S.done=1;clearInterval(timer);
  const r={by:{},top:{},ok:0,bad:0,skip:0,time:Math.round((Date.now()-S.t0)/1000)};
  const add=(m,k,c)=>{const b=m[k]=m[k]||[0,0];b[1]++;if(c)b[0]++};
  S.qs.forEach((q,i)=>{
    const a=S.ans[i];
    if(a==null){r.skip++;add(r.by,q.subj,0);add(r.top,q.topic,0);return}
    const c=a===q.a;
    add(r.by,q.subj,c);add(r.top,q.topic,c);add(st.by,q.subj,c);
    st.ans++;
    if(c){r.ok++;st.ok++;st.wrong=st.wrong.filter(x=>x!==q.id)}
    else{r.bad++;if(!st.wrong.includes(q.id))st.wrong.push(q.id)}
  });
  r.pct=pct(r.ok,S.qs.length);
  if(S.mode==='mock'){st.tests.push({name:S.name||'Mock test',ok:r.ok,n:S.qs.length,pct:r.pct,date:new Date().toLocaleDateString()});}
  S.r=r;save();go('result');
}

V.home=()=>{
  app.innerHTML=`<section class=hero><div><p class=badge>Independent study aid</p><h1>Prepare with confidence for your clinical psychology exams.</h1><p>Reading notes, MCQ practice with explanations, timed mock exams, flashcards and a glossary in one place. No account needed.</p><div class=row style="justify-content:flex-start"><a class=btn href="practice.html">Practise MCQs</a><a class=btn href="mock.html">Take a mock exam</a><a class=btn href="study.html">Read the notes</a></div></div><svg viewBox="0 0 240 200" role="img" aria-label="Illustration of a brain outline above an open book"><rect x="20" y="140" width="200" height="34" rx="8" fill="currentColor" opacity=".18"/><path d="M40 62c0-20 20-30 40-24 8-12 32-12 40 0 20-6 40 4 40 24 0 12-8 20-14 24 4 14-10 30-30 26-10 10-26 10-36 0-20 4-34-12-30-26-6-4-10-12-10-24z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"/><path d="M120 44v88" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></section>
  <p class=notice><b>For educational use only.</b> This independent study aid is not professional training, supervision, diagnosis or treatment, and practice scores do not measure clinical competence.</p>
  <div class=stats><div class=stat><b>${bank.length}</b>MCQs with explanations</div><div class=stat><b>${MOCKS.length}</b>Timed mock exams</div><div class=stat><b>${NOTES.length}</b>Reading notes</div><div class=stat><b>${GLOSS.length}</b>Flashcards and glossary terms</div></div>
  <h2>Three modules, one place</h2><div class=modules><a class="card mod" href="study.html"><h3>Reading notes</h3><p>Overview, key concepts, an exam summary and a common misconception for every subject. Print or download them.</p><span>Start reading</span></a><a class="card mod" href="practice.html"><h3>MCQ practice</h3><p>Filter by subject, topic and difficulty. Practice, exam, timed and weak-areas modes with an explanation for every answer.</p><span>Practise MCQs</span></a><a class="card mod" href="mock.html"><h3>Mock exams</h3><p>Timed tests with a question navigator, review marks, automatic submission and results by subject and topic.</p><span>Take a mock exam</span></a></div>
  <p class=meta>No account required. Works on mobile and desktop. Explanations included with every answer.</p>`;
};

V.notes=p=>{
  app.innerHTML=`<h1>Study notes</h1><p class=row><span>Use Print notes, then choose “Save as PDF” in your browser.</span><button data-dl>Download all notes (.txt)</button></p>`+NOTES.map((n,i)=>`<details class=note ${p!==''&&+p===i?'open':''}><summary data-view=${i}>${n.t}</summary><h3>Overview</h3><p>${n.o}</p><h3>Key concepts</h3><ul>${n.k.map(x=>`<li>${x}</li>`).join('')}</ul>${n.a?'<h3>Clinical applications</h3><p>'+n.a+'</p>':''}<h3>Exam summary</h3><p>${n.x}</p><h3>Common misconception</h3><p>${n.m}</p><p class=row><button data-print=${i}>Print notes</button><button data-prac="${n.s}">Practise ${n.s} MCQs</button></p></details>`).join('');
  if(p!=='')markViewed(+p);
};
function markViewed(i){if(i<0||i>=NOTES.length)return;st.viewed=st.viewed.filter(x=>x!==i);st.viewed.push(i);save()}

V.practice=()=>{
  const opt=(a,all)=>`<option value="">${all}</option>`+a.map(x=>`<option>${x}</option>`).join('');
  app.innerHTML=`<h1>MCQ practice</h1><section class=card><div class=form><label>Subject<select id=fs>${opt(subjects,'All subjects')}</select></label><label>Topic<select id=ft>${opt(topics,'Any topic')}</select></label><label>Difficulty<select id=fd>${opt(['Easy','Medium','Hard'],'Any difficulty')}</select></label><label>Questions<select id=fc><option value=5>5</option><option value=10>10</option><option value=0>All matching</option></select></label><label>Mode<select id=fm><option value=practice>Practice (instant feedback)</option><option value=exam>Exam (answers at the end)</option><option value=timed>Timed (1 minute per question)</option><option value=weak>Weak areas (previously missed)</option></select></label></div><label><input type=checkbox id=fa checked> Shuffle answer order</label><p id=msg role=status class=meta></p><button class=pri data-start>Start quiz</button></section>`;
};

const MOCKS=[{name:'Comprehensive Clinical Psychology',subs:null,n:20,mins:20},{name:'Psychopathology and Anxiety',subs:['Psychopathology','Anxiety & OCD'],n:12,mins:12},{name:'Assessment and Psychotherapy',subs:['Assessment','Psychotherapy'],n:12,mins:12},{name:'Research Methods and Ethics',subs:['Research & Statistics','Ethics'],n:10,mins:10},{name:'Foundations, Health and Development',subs:['Clinical Foundations','Health Psychology','Neuropsychology & Development'],n:12,mins:12}];
V.mock=()=>{
  app.innerHTML=`<h1>Mock exams</h1><p>Timed tests drawn at random from the question bank. Answers and explanations appear after you submit, and the test submits itself at 0:00.</p>${S&&!S.done&&S.mode==='mock'?'<p class=notice>A test is in progress. <button class=pri data-resume>Resume test</button></p>':''}<p><label><input type=checkbox id=fa checked> Shuffle answer order</label></p><div class=modules>${MOCKS.map((m,i)=>{const n=Math.min(m.n,bank.filter(q=>!m.subs||m.subs.includes(q.subj)).length);return `<article class=card><h2>${m.name}</h2><p>${n} questions, ${n===m.n?m.mins:n} minutes</p><button class=pri data-mock=${i}>Start exam</button></article>`}).join('')}</div><p class=meta>Scores are educational practice results only.</p>`;
};

V.quiz=()=>{
  if(!S||S.done)return base();
  const q=S.qs[S.i],a=S.ans[S.i],n=S.qs.length,show=S.mode==='practice'&&a!=null;
  app.innerHTML=`<section class=card><div class=row><h2>Question ${S.i+1} of ${n}</h2>${S.end?'<span id=tm class=tm role=timer></span>':''}</div><progress value=${S.i+1} max=${n} aria-label="Progress"></progress><p class=meta>${q.subj}, ${q.topic}, ${q.diff}</p><p class=q>${q.q}</p><div>${q.o.map((t,k)=>`<button class="opt ${show?(k===q.a?'ok':k===a?'bad':''):(k===a?'sel':'')}" data-k=${k} ${show?'disabled':''}>${'ABCD'[k]}. ${t}</button>`).join('')}</div>${show?`<p class=ex><b>${a===q.a?'Correct!':'Incorrect.'}</b> Explanation: ${q.e}</p>`:''}<div class=row><button data-nav=-1>Previous</button><button data-mark>${S.mark[S.i]?'Remove review mark':'Mark for review'}</button><button data-bm>${st.book.includes(q.id)?'★ Bookmarked':'☆ Bookmark'}</button><button data-nav=1>Next</button><button class=pri data-submit>Submit</button></div>${S.mode==='mock'?`<h3>Question navigator</h3><div class=navg>${S.qs.map((_,k)=>`<button data-go=${k} class="${S.mark[k]?'fl':S.ans[k]!=null?'an':'un'}${k===S.i?' cur':''}" aria-label="Question ${k+1}, ${S.mark[k]?'marked for review':S.ans[k]!=null?'answered':'unanswered'}">${k+1}</button>`).join('')}</div><p class=meta>Blue = answered. Grey = unanswered. Amber = marked for review.</p>`:''}</section>`;
  tick();
};

V.result=()=>{
  if(!S||!S.done)return base();
  const r=S.r,n=S.qs.length;
  const rows=m=>Object.entries(m).map(([k,v])=>`<li>${k}: ${pct(v[0],v[1])}% (${v[0]}/${v[1]})</li>`).join('');
  const rev=Object.entries(r.by).filter(([k,v])=>pct(v[0],v[1])<70).map(([k])=>`<a href="study.html?n=${ni(k)}">${k}</a>`).join(', ');
  app.innerHTML=`<section class=card><h1>${S.mode==='mock'?'Test complete':'Quiz complete'}</h1><p class=big>Score: ${r.ok} / ${n} — ${r.pct}%</p><p>Correct: ${r.ok}. Incorrect: ${r.bad}. Unanswered: ${r.skip}. Time used: ${fmt(r.time)}.</p><h2>Performance by subject</h2><ul>${rows(r.by)}</ul><h2>Performance by topic</h2><ul>${rows(r.top)}</ul><h2>Recommended revision</h2><p>${rev||'Every subject is at 70% or above. Keep practising.'}</p><div class=row><button class=pri data-retake>Retake</button><a class=btn href="dashboard.html">Back to dashboard</a></div><p class=meta>These are educational practice scores only. They do not indicate professional competence or clinical qualification.</p></section><h2>Review answers</h2>`+S.qs.map((q,i)=>{const a=S.ans[i];return `<article class=card><p><b>${i+1}. ${q.q}</b></p><p>Your answer: ${a==null?'Not answered':q.o[a]} ${a==null?'':a===q.a?'(correct)':'(incorrect)'}</p><p>Correct answer: ${q.o[q.a]}</p><p class=ex>${q.e}</p></article>`}).join('');
};

let fl={cat:'',stat:'',rev:false,list:null,i:0,flip:false};
const CARDS=()=>GLOSS.map((g,i)=>({id:'g'+i,cat:'Glossary terms',f:g[0],b:g[1],t:1})).concat(bank.map(q=>({id:'q'+q.id,cat:q.subj,f:q.q,b:q.o[q.a]+'. '+q.e})));
const deck=()=>CARDS().filter(c=>(!fl.cat||c.cat===fl.cat)&&(!fl.stat||(fl.stat==='known')===st.known.includes(c.id)));
V.cards=()=>{
  if(!fl.list)fl.list=deck();
  const L=fl.list,n=L.length,c=L[fl.i],sw=c&&c.t&&fl.rev,front=c?(sw?c.b:c.f):'',back=c?(sw?c.f:c.b):'';
  const sel=(v,x)=>v===x?' selected':'';
  app.innerHTML=`<h1>Flashcards</h1><p>${st.known.length} of ${CARDS().length} cards marked as known.</p><div class=form><label>Deck<select id=cc><option value="">All cards</option>${['Glossary terms',...subjects].map(x=>`<option${sel(fl.cat,x)}>${x}</option>`).join('')}</select></label><label>Show<select id=cs><option value="">All cards</option><option value=learn${sel(fl.stat,'learn')}>Still learning</option><option value=known${sel(fl.stat,'known')}>Known</option></select></label></div><p><label><input type=checkbox id=cr${fl.rev?' checked':''}> Show the definition first (glossary cards)</label></p>`+(n?`<p>Card ${fl.i+1} of ${n}: ${c.cat}</p><progress value=${fl.i+1} max=${n}></progress><button class=fc data-c=flip aria-live=polite>${fl.flip?back:'<b>'+front+'</b>'}</button><p class=meta>Press the card or the space bar to flip. Use the left and right arrow keys to move.</p><div class=row><button data-c=prev>Previous</button><button data-c=next>Next</button><button data-c=shuf>Shuffle</button></div><div class=row><button data-c=learn>Still learning</button><button class=pri data-c=know>I know this</button></div>`:'<p class=notice>No cards match this filter. Change the deck or the filter above.</p>');
};
app.addEventListener('change',e=>{if(['cc','cs','cr'].includes(e.target.id)){fl.cat=$('#cc').value;fl.stat=$('#cs').value;fl.rev=$('#cr').checked;fl.list=deck();fl.i=0;fl.flip=false;V.cards()}});
document.addEventListener('keydown',e=>{if(document.body.dataset.v!=='cards'||/INPUT|SELECT/.test(e.target.tagName)||!fl.list||!fl.list.length)return;const k=e.key;if(k==='ArrowRight'||k==='ArrowLeft'){e.preventDefault();fl.flip=false;fl.i=(fl.i+(k==='ArrowRight'?1:-1)+fl.list.length)%fl.list.length;V.cards()}else if(k===' '&&!e.target.closest('button')){e.preventDefault();fl.flip=!fl.flip;V.cards()}});

V.gloss=()=>{
  app.innerHTML=`<h1>Glossary</h1><label>Search terms <input id=gq type=search></label><p id=gc class=meta></p><dl id=gl></dl>`;
  const f=()=>{const q=$('#gq').value.toLowerCase(),l=GLOSS.slice().sort((a,b)=>a[0].localeCompare(b[0])).filter(g=>(g[0]+g[1]).toLowerCase().includes(q));$('#gc').textContent=l.length+' of '+GLOSS.length+' terms';$('#gl').innerHTML=l.map(g=>`<dt><b>${g[0]}</b></dt><dd>${g[1]}</dd>`).join('')||'<p>No matching terms. Try a shorter search.</p>'};
  $('#gq').oninput=f;f();
};

V.search=q=>{
  const t=q.toLowerCase(),h=x=>x.toLowerCase().includes(t);
  const n=NOTES.map((x,i)=>[x,i]).filter(([x])=>h(x.t+x.o+x.k.join(' '))),g=GLOSS.filter(x=>h(x[0]+x[1])),m=bank.filter(x=>h(x.q+x.topic+x.subj));
  app.innerHTML=`<h1>Results for “${esc(q)}”</h1><h2>Notes (${n.length})</h2>${n.map(([x,i])=>`<p><a href="study.html?n=${i}">${x.t}</a></p>`).join('')}<h2>Glossary (${g.length})</h2>${g.map(x=>`<p><b>${x[0]}</b>: ${x[1]}</p>`).join('')}<h2>MCQs (${m.length})</h2>${m.map(x=>`<p>${x.q} <em>(${x.topic})</em></p>`).join('')}`;
};

V.dash=()=>{
  const best=st.tests.length?Math.max(...st.tests.map(t=>t.pct)):null;
  const weak=Object.entries(st.by).map(([k,v])=>[k,pct(v[0],v[1]),v[1]]).filter(x=>x[1]<70).sort((a,b)=>a[1]-b[1]);
  app.innerHTML=`<h1>Your progress</h1><div class=stats>${[['Questions answered',st.ans],['Correct',st.ok],['Accuracy',st.ans?pct(st.ok,st.ans)+'%':'–'],['Mock tests completed',st.tests.length],['Best mock score',best==null?'–':best+'%'],['Notes viewed',st.viewed.length],['Bookmarked questions',st.book.length],['Flashcards known',st.known.length]].map(([a,b])=>`<div class=stat><b>${b}</b>${a}</div>`).join('')}</div>
  <h2>Weak areas</h2>${weak.length?`<ul>${weak.map(w=>`<li>${w[0]}: ${w[1]}% over ${w[2]} answers. <a href="study.html?n=${ni(w[0])}">Revise notes</a></li>`).join('')}</ul>`:'<p>No weak areas yet. Answer questions to see where to focus.</p>'}<p>Missed questions saved: ${st.wrong.length}. Use “Weak areas” mode in <a href="practice.html">MCQ practice</a>.</p>
  <h2>Recent tests</h2>${st.tests.length?`<ul>${st.tests.slice(-5).reverse().map(t=>`<li>${t.date}: ${t.ok}/${t.n} (${t.pct}%)</li>`).join('')}</ul>`:'<p>No mock tests yet. <a href="mock.html">Take a mock test</a>.</p>'}
  <h2>Continue studying</h2>${st.viewed.length?`<ul>${st.viewed.slice(-3).reverse().map(i=>`<li><a href="study.html?n=${i}">${NOTES[i].t}</a></li>`).join('')}</ul>`:'<p>Open a note and it will appear here.</p>'}
  <p><button data-reset>Reset my progress</button></p>`;
};

V.about=()=>{
  app.innerHTML=`<h1>About</h1><p>Clinical Psychology Academy is a free, static study site: notes, MCQs, timed mock tests, flashcards and a glossary. Progress is stored only in your browser.</p>
  <h2 id=disclaimer>Disclaimer</h2><p>This is an educational resource. It is not a substitute for professional training, supervision, diagnosis or treatment. Practice scores do not measure professional competence. If you or someone else is in crisis, contact local emergency services or a crisis line.</p>
  <h2>Copyright</h2><p>The notes, questions, explanations and glossary are original writing for this site. No textbook or commercial question bank has been copied.</p>
  <h2>Privacy</h2><p>The site has no accounts, analytics or server. Your scores, bookmarks and theme are saved with localStorage on your own device. Clearing your browser data removes them.</p>
  <h2>Terms</h2><p>Use the material for personal study. It is provided as is, without warranty. Always confirm clinical facts against current professional guidelines.</p>
  <h2>Further reading</h2><ul><li><a href="https://www.apa.org" rel="noopener">American Psychological Association</a></li><li><a href="https://www.bps.org.uk" rel="noopener">British Psychological Society</a></li><li><a href="https://www.nimh.nih.gov" rel="noopener">National Institute of Mental Health</a></li><li><a href="https://www.who.int" rel="noopener">World Health Organization</a></li></ul>`;
};

function route(){
  const v=document.body.dataset.v,p=new URLSearchParams(location.search);
  document.querySelectorAll('nav a').forEach(x=>x.dataset.v===v?x.setAttribute('aria-current','page'):x.removeAttribute('aria-current'));
  (V[v]||V.home)(v==='notes'?(p.get('n')||''):v==='search'?(p.get('q')||''):'');
}

app.addEventListener('click',e=>{
  const sm=e.target.closest('summary');
  if(sm&&sm.dataset.view!=null)markViewed(+sm.dataset.view);
  const b=e.target.closest('button');if(!b)return;
  const d=b.dataset,g=id=>$('#'+id).value;
  if(d.k!=null&&S){S.ans[S.i]=+d.k;V.quiz()}
  else if(d.nav!=null){S.i=Math.min(S.qs.length-1,Math.max(0,S.i+ +d.nav));V.quiz()}
  else if(d.go!=null){S.i=+d.go;V.quiz()}
  else if(d.mark!=null){S.mark[S.i]=!S.mark[S.i];V.quiz()}
  else if(d.bm!=null){const id=S.qs[S.i].id,i=st.book.indexOf(id);i<0?st.book.push(id):st.book.splice(i,1);save();V.quiz()}
  else if(d.submit!=null){const u=S.qs.length-S.ans.filter(x=>x!=null).length;if(!u||confirm(u+' unanswered. Submit anyway?'))finish()}
  else if(d.retake!=null)start(S.mode,S.pool,S.mins,S.sh,S.name);
  else if(d.resume!=null)V.quiz();
  else if(d.mock!=null){const m=MOCKS[+d.mock],pl=bank.filter(q=>!m.subs||m.subs.includes(q.subj)),n=Math.min(m.n,pl.length);start('mock',shuf(pl).slice(0,n),n===m.n?m.mins:n,$('#fa').checked,m.name)}
  else if(d.start!=null){
    let l=bank.filter(q=>(!g('fs')||q.subj===g('fs'))&&(!g('ft')||q.topic===g('ft'))&&(!g('fd')||q.diff===g('fd')));
    const m=g('fm');if(m==='weak')l=l.filter(q=>st.wrong.includes(q.id));
    if(!l.length){$('#msg').textContent=m==='weak'?'No missed questions yet. Answer some questions first.':'No questions match these filters. Try a broader selection.';return}
    l=shuf(l).slice(0,+g('fc')||l.length);
    start(m==='exam'||m==='timed'?'exam':'practice',l,m==='timed'?l.length:0,$('#fa').checked);
  }
  else if(d.prac!=null)start('practice',bank.filter(q=>q.subj===d.prac),0,true);
  else if(d.print!=null){const el=b.closest('details');el.open=true;el.classList.add('pr');window.print();el.classList.remove('pr')}
  else if(d.dl!=null){
    const t=NOTES.map(n=>n.t+'\n\nOverview: '+n.o+'\n\nKey concepts:\n- '+n.k.join('\n- ')+(n.a?'\n\nClinical applications: '+n.a:'')+'\n\nExam summary: '+n.x+'\nCommon misconception: '+n.m).join('\n\n----------\n\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/plain'}));a.download='clinical-psychology-notes.txt';a.click();
  }
  else if(d.c!=null){
    const n=fl.list.length;
    if(d.c==='flip')fl.flip=!fl.flip;
    else if(d.c==='shuf'){fl.list=shuf(fl.list);fl.i=0;fl.flip=false}
    else{
      if(d.c==='know'||d.c==='learn'){const id=fl.list[fl.i].id,k=st.known.indexOf(id);if(d.c==='know'&&k<0)st.known.push(id);if(d.c==='learn'&&k>=0)st.known.splice(k,1);save()}
      fl.flip=false;fl.i=(fl.i+(d.c==='prev'?-1:1)+n)%n;
    }
    V.cards();
  }
  else if(d.reset!=null&&confirm('Delete all saved progress on this device?')){st=def();save();V.dash()}
});

$('#sf')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#sq').value.trim();if(q)location.href='search.html?q='+encodeURIComponent(q)});
if($('#mt'))$('#mt').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#mt').setAttribute('aria-expanded',o)};
document.documentElement.dataset.theme=LS('theme',matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
if($('#tt'))$('#tt').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;SV('theme',t)};
if($('#lo'))$('#lo').onclick=()=>{try{localStorage.removeItem('cpa_auth')}catch(e){}location.href='login.html'};
try{route()}catch(e){app.innerHTML='<p class=notice>This page failed to load ('+esc(e.message)+'). Refresh with Ctrl+Shift+R. If it still fails, re-upload every file.</p>'}
