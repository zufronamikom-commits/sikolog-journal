const $=s=>document.querySelector(s),TODAY=(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date()),KEY='rtj_v3';
const IC={dashboard:'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',analytics:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',journal:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',add:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',strategies:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',notes:'<path d="M5 3h10l4 4v14H5z"/><path d="M9 12h6M9 16h6"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',up:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',account:'<path d="M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V6a2 2 0 0 1 2-2h12"/><circle cx="16.5" cy="13.5" r="1"/>'};
const ic=k=>`<svg class="i" viewBox="0 0 24 24">${IC[k]}</svg>`;
const NAV=[['dashboard','Dashboard'],['account','Account'],['analytics','Analytics'],['journal','Journal'],['add','Add Trade'],['strategies','Strategies'],['notes','Notes'],['calendar','P&L Calendar'],['settings','Settings']];
const CUR={USD:'$',IDR:'Rp',EUR:'€',JPY:'¥',GBP:'£'},NM={XAUUSD:'Gold / US Dollar',EURUSD:'Euro / US Dollar',GBPUSD:'British Pound / US Dollar',NQ:'Nasdaq 100 Futures',ES:'S&P 500 Futures',GC:'Gold Futures'};
const TYPES=['Funded Account','Evaluation','Personal Account','Demo'],MON=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
/* Data awal: kosong. Setiap pengunjung mulai dari halaman baru; data tersimpan di localStorage browser masing-masing. */
const ACC={'My Account':{bal:10000,dd:1000,type:'Personal Account',ddType:'static',target:0,t:[]}};
const nf=()=>({dir:'Buy',sess:'London',emo:'Disciplined',date:TODAY});
const S={page:'dashboard',acc:'My Account',cur:'USD',mode:'basic',tags:[],form:nf(),edit:null,q:'',res:'all',ses:'all',sort:['date',-1],pg:0,sel:TODAY,rng:'all',strat:null,rules:{},zone:'shot',cm:[+TODAY.slice(0,4),+TODAY.slice(5,7)-1],imp:'0,1,2,3',news:{},notes:[],lang:'id',country:'ID',theme:'dark',prof:{name:'',user:''},pf:null,cd:false,cq:''};
/* ---------- bahasa: helper L(indonesia, english) ---------- */
const L=(a,b)=>S.lang=='en'?b:a;
const MONE=['January','February','March','April','May','June','July','August','September','October','November','December'],WDI=['Min','Sen','Sel','Rab','Kam','Jum','Sab','Total'],WDE=['Sun','Mon','Tue','Wed','Thu','Fri','Sat','Total'];
const MN=()=>S.lang=='en'?MONE:MON,WD=()=>S.lang=='en'?WDE:WDI;
/* ---------- persistence ---------- */
function save(){try{localStorage.setItem(KEY,JSON.stringify({ACC,notes:S.notes,news:S.news,rules:S.rules,cur:S.cur,acc:S.acc,pref:{lang:S.lang,country:S.country,theme:S.theme,prof:S.prof}}))}catch(e){toast('Penyimpanan penuh, export data kamu')}}
function load(){try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(!j||!j.ACC||!Object.keys(j.ACC).length)return;Object.keys(ACC).forEach(k=>delete ACC[k]);Object.assign(ACC,j.ACC);S.notes=j.notes||S.notes;S.news=j.news||{};S.rules=j.rules||{};S.cur=j.cur||'USD';const p=j.pref||{};S.lang=p.lang=='en'?'en':'id';S.country=p.country||'ID';S.theme=p.theme=='light'?'light':'dark';S.prof=p.prof||S.prof;S.acc=ACC[j.acc]?j.acc:Object.keys(ACC)[0]}catch(e){}}
addEventListener('beforeunload',save);
const T=()=>ACC[S.acc].t,sum=a=>a.reduce((x,y)=>x+y,0),cls=v=>v>=0?'gn':'rd',esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const fm=v=>(v<0?'-':'+')+CUR[S.cur]+Math.abs(v).toLocaleString('en-US'),fm2=v=>(v<0?'-':'+')+CUR[S.cur]+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),fa=v=>CUR[S.cur]+v.toLocaleString('en-US');
const latest=()=>T().map(x=>x.date).sort().pop()||TODAY,wk=()=>{const l=latest();return sum(T().filter(x=>(new Date(l)-new Date(x.date))/864e5<7).map(x=>x.pnl))},mo=()=>{const l=latest();return sum(T().filter(x=>x.date.slice(0,7)==l.slice(0,7)).map(x=>x.pnl))};
function st(t){const w=t.filter(x=>x.pnl>0),l=t.filter(x=>x.pnl<0),tot=sum(t.map(x=>x.pnl));let eq=ACC[S.acc].bal,pk=eq,dd=0;t.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(x=>{eq+=x.pnl;pk=Math.max(pk,eq);dd=Math.max(dd,pk-eq)});return{tot,wr:t.length?Math.round(w.length/t.length*100):0,n:t.length,w:w.length,l:l.length,bw:Math.max(0,...t.map(x=>x.pnl)),bl:Math.min(0,...t.map(x=>x.pnl)),pf:l.length?(sum(w.map(x=>x.pnl))/Math.abs(sum(l.map(x=>x.pnl)))).toFixed(2):'–',rr:t.length?(sum(t.map(x=>Math.abs(x.rr)))/t.length).toFixed(1):'0',dd,eq:ACC[S.acc].bal+tot,aw:w.length?Math.round(sum(w.map(x=>x.pnl))/w.length):0,al:l.length?Math.round(sum(l.map(x=>x.pnl))/l.length):0}}
const card=(l,v,c='')=>`<div class="card"><div class="lab">${l}</div><div class="big ${c}">${v}</div></div>`;
const empty=m=>`<div class="empty"><div style="font-size:30px">◌</div><p>${m}</p><button class="btn y" onclick="newTrade()">+ Add your first trade</button></div>`;
function by(k,multi){const m={};T().forEach(x=>(multi?x[k]:[x[k]]).forEach(g=>{m[g]=(m[g]||0)+x.pnl}));return Object.entries(m).sort((a,b)=>b[1]-a[1])}
const bars=a=>{const mx=Math.max(1,...a.map(x=>Math.abs(x[1])));return a.map(x=>`<div style="margin:12px 0"><div class="row sp"><span>${x[0]}</span><b class="${cls(x[1])}">${fm(x[1])}</b></div><div class="bar" style="margin-top:6px"><i style="width:${Math.abs(x[1])/mx*100}%;background:var(--${x[1]>=0?'gn':'rd'})"></i></div></div>`).join('')};
let EC;
function curve(){const all=T().slice().sort((a,b)=>a.date.localeCompare(b.date)),last=new Date(all[all.length-1].date),days={week:7,month:30,all:9999}[S.rng],inR=x=>(last-new Date(x.date))/864e5<days,t=all.filter(inR);let e=ACC[S.acc].bal+sum(all.filter(x=>!inR(x)).map(x=>x.pnl));const p=[e];t.forEach(x=>p.push(e+=x.pnl));
const W=800,H=260,mn=Math.min(...p),mx=Math.max(...p),r=(mx-mn)||1,xy=p.map((v,i)=>[44+i/(p.length-1||1)*(W-56),H-24-(v-mn)/r*(H-60)]);EC={t,p,xy,W};const ln=xy.map(a=>a.join(',')).join(' ');
return`<svg viewBox="0 0 ${W} ${H}" id="ec" style="width:100%;height:auto;touch-action:none;cursor:crosshair" onpointermove="ecm(event)" onpointerdown="ecm(event)"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--gn)" stop-opacity=".3"/><stop offset="1" stop-color="var(--gn)" stop-opacity="0"/></linearGradient></defs>${[0,1,2,3].map(i=>`<line x1="44" x2="${W-8}" y1="${36+i*(H-60)/3}" y2="${36+i*(H-60)/3}" stroke="var(--bd)"/>`).join('')}<text x="0" y="40" font-size="11" fill="var(--mu)">${fa(mx)}</text><text x="0" y="${H-20}" font-size="11" fill="var(--mu)">${fa(mn)}</text><polygon points="${xy[0][0]},${H-24} ${ln} ${xy[xy.length-1][0]},${H-24}" fill="url(#gg)"/><polyline points="${ln}" fill="none" stroke="var(--gn)" stroke-width="2.5" stroke-linejoin="round"/><line id="cl" y1="20" y2="${H-24}" stroke="var(--mu)" stroke-dasharray="3 3" opacity="0"/><circle id="cd" r="5.5" fill="var(--gn)" stroke="var(--sf)" stroke-width="2.5" opacity="0"/></svg><div id="tip" class="tip">Arahkan kursor atau sentuh grafik untuk melihat detail harian.</div>`}
function ecm(e){const b=$('#ec').getBoundingClientRect(),x=(e.clientX-b.left)/b.width*EC.W;let i=0,m=1e9;EC.xy.forEach((a,k)=>{const d=Math.abs(a[0]-x);if(d<m){m=d;i=k}});const a=EC.xy[i];$('#cl').setAttribute('x1',a[0]);$('#cl').setAttribute('x2',a[0]);$('#cd').setAttribute('cx',a[0]);$('#cd').setAttribute('cy',a[1]);$('#cl').setAttribute('opacity',1);$('#cd').setAttribute('opacity',1);
if(!i){$('#tip').innerHTML='Starting balance <b>'+fa(EC.p[0])+'</b>';return}const x0=EC.t[i-1],d=T().filter(y=>y.date==x0.date),dp=sum(d.map(y=>y.pnl));$('#tip').innerHTML=`<b>${x0.date}</b> · Daily P&amp;L <b class="${cls(dp)}">${fm(dp)}</b> · ${d.length} trade · Win rate ${Math.round(d.filter(y=>y.pnl>0).length/d.length*100)}% · Equity <b>${fa(EC.p[i])}</b>`}
function groups(){const m={};T().forEach(x=>{const k=x.strat||'Unassigned';(m[k]=m[k]||[]).push(x)});return Object.entries(m).map(([n,a])=>{const cf={};a.forEach(x=>x.conf.forEach(c=>cf[c]=(cf[c]||0)+1));return{n,a,s:st(a),cf:Object.entries(cf).sort((p,q)=>q[1]-p[1]).slice(0,3).map(z=>z[0])}}).sort((p,q)=>q.s.tot-p.s.tot)}
/* ---------- calendar helpers ---------- */
const pad=n=>String(n).padStart(2,'0');
function calNav(n){let[y,m]=S.cm;m+=n;if(m<0){m=11;y--}if(m>11){m=0;y++}S.cm=[y,m];render()}
function newsRows(k){const a=S.news[k]||[];return a.length?a.map((n,i)=>`<div class="nws"><span>${esc(n.time)||'–'}</span><b>${esc(n.cur)}</b><i class="im ${n.imp}"></i><span>${esc(n.ev)}<button class="ib" style="float:right;padding:0 7px" onclick="delNews('${k}',${i})">✕</button></span><small>${L('Aktual','Actual')} ${esc(n.act)||'–'} · ${L('Perkiraan','Forecast')} ${esc(n.fc)||'–'} · ${L('Sebelumnya','Previous')} ${esc(n.pv)||'–'}</small></div>`).join(''):'<p class="sm">Belum ada news di tanggal ini.</p>'}
function addNews(){const g=i=>$('#'+i).value.trim();if(!g('ne'))return toast('Isi nama event');const k=S.sel;(S.news[k]=S.news[k]||[]).push({time:g('nt'),cur:g('nc').toUpperCase(),ev:g('ne'),imp:g('ni'),act:g('na'),fc:g('nf'),pv:g('np')});S.news[k].sort((a,b)=>a.time.localeCompare(b.time));render();toast('News ditambahkan')}
function delNews(k,i){S.news[k].splice(i,1);render()}
/* ---------- drawdown & target engine ---------- */
function ddInfo(){
const A=ACC[S.acc],ty=A.ddType||'static',tg=A.target||0,
t=T().slice().sort((a,b)=>a.date.localeCompare(b.date));
let eq=A.bal,pk=eq;
t.forEach(x=>{eq+=x.pnl;pk=Math.max(pk,eq)});
const floor=ty=='trailing'?Math.min(pk-A.dd,A.bal):A.bal-A.dd,
left=eq-floor,used=Math.max(0,A.dd-left),
pct=A.dd?used/A.dd:0,profit=eq-A.bal,tp=tg?profit/tg:0;
return{A,ty,tg,eq,pk,floor,left,used,pct,profit,tp}}
function alerts(){
const d=ddInfo(),o=[];
if(d.A.dd&&d.pct>0){
if(d.left<=0)o.push(['rd','🚨 '+L('BREACH! Equity menyentuh batas drawdown ('+fa(Math.round(d.floor))+'). Berhenti trading, tarik napas, dan evaluasi dulu sebelum lanjut.','BREACH! Equity hit the drawdown limit ('+fa(Math.round(d.floor))+'). Stop trading, take a breath, and review before continuing.')]);
else if(d.pct>=.8)o.push(['rd','⚠️ '+L('Akun kamu hampir breach! Sisa ruang drawdown hanya '+fa(Math.round(d.left))+' ('+Math.round((1-d.pct)*100)+'%). Turunkan risk per trade, kecilkan lot, dan jangan revenge trading.','Your account is close to breaching! Remaining drawdown room is only '+fa(Math.round(d.left))+' ('+Math.round((1-d.pct)*100)+'%). Lower your risk per trade, reduce lot size, and avoid revenge trading.')]);
else if(d.pct>=.5)o.push(['yl','⚠️ '+L('Drawdown sudah terpakai '+Math.round(d.pct*100)+'%. Mulai kurangi risk dan hanya ambil setup terbaik (A+).','Drawdown is '+Math.round(d.pct*100)+'% used. Start reducing risk and only take your best (A+) setups.')])}
if(d.tg&&d.profit>0){
if(d.tp>=1)o.push(['gn','🏆 '+L('SELAMAT! Target profit tercapai ('+fa(d.tg)+')! Kamu membuktikan konsistensi dan disiplin. Amankan hasilnya, jangan serakah.','CONGRATULATIONS! Profit target reached ('+fa(d.tg)+')! You proved your consistency and discipline. Secure the result, do not get greedy.')]);
else if(d.tp>=.9)o.push(['gn','🔥 '+L('Sedikit lagi! Tinggal '+fa(Math.round(d.tg-d.profit))+' menuju target. Tetap sabar, ikuti rules, jangan overtrade.','Almost there! Only '+fa(Math.round(d.tg-d.profit))+' left to the target. Stay patient, follow your rules, and do not overtrade.')]);
else if(d.tp>=.5)o.push(['gn','💪 '+L('Kamu sudah setengah jalan menuju target ('+Math.round(d.tp*100)+'%). Konsistensi adalah kunci, terus pertahankan!','You are halfway to the target ('+Math.round(d.tp*100)+'%). Consistency is key, keep it up!')])}
return o}
function bn(){return alerts().map(a=>`<div class="alr ${a[0]}">${a[1]}</div>`).join('')}
function riskCards(){
const d=ddInfo(),A=d.A;if(!A.dd&&!A.target)return'';
const dp=Math.min(100,d.pct*100),tpp=Math.max(0,Math.min(100,d.tp*100)),
dc=d.pct>=.8?'var(--rd)':d.pct>=.5?'var(--yl)':'var(--gn)';
return`<div class="grid ge" style="margin-bottom:14px"><div class="card"><div class="row sp"><div class="lab">Drawdown ${d.ty=='trailing'?'Trailing':'Static'}</div><span class="sm">Floor ${fa(Math.round(d.floor))}</span></div><div class="big" style="color:${dc}">${fa(Math.round(d.used))} <span class="sm">/ ${fa(A.dd)}</span></div><div class="bar" style="margin-top:10px"><i style="width:${dp}%;background:${dc}"></i></div><div class="sm" style="margin-top:8px">Sisa ruang: ${fa(Math.max(0,Math.round(d.left)))}</div></div>
<div class="card"><div class="row sp"><div class="lab">Target Profit</div><span class="sm">${d.tg?fa(d.tg):'Belum diatur'}</span></div><div class="big gn">${d.tg?Math.max(0,Math.round(d.tp*100))+'%':'–'} <span class="sm">${d.tg?fm(Math.round(d.profit)):''}</span></div><div class="bar" style="margin-top:10px"><i style="width:${tpp}%;background:var(--gn)"></i></div><div class="sm" style="margin-top:8px">${d.tg?(d.tp>=1?'Target tercapai 🎉':'Sisa: '+fa(Math.max(0,Math.round(d.tg-d.profit)))):'Atur di Settings → Accounts'}</div></div></div>`}
function notify(){const a=alerts();if(a.length)toast(a[0][1].replace(/^\S+\s/,''))}

const V={
dashboard(){const s=st(T());if(!s.n)return empty('Belum ada trade di akun ini.');const A=ACC[S.acc];
return`<div class="row sp" style="margin-bottom:14px"><div><b style="font-size:16px">${esc(S.acc)}</b> <span class="sm">· ${A.type} · Balance awal ${fa(A.bal)}</span></div></div>${bn()}${riskCards()}<div class="grid g4">${card('Current Equity',fa(s.eq))}${card('Total P&L',fm(s.tot),cls(s.tot))}${card('Weekly P&L',fm(wk()),cls(wk()))}${card('Monthly P&L',fm(mo()),cls(mo()))}${card('Win Rate',s.wr+'%')}${card('Profit Factor',s.pf)}${card('Average RR',s.rr)}<div class="card"><div class="lab">Max Drawdown / Limit</div><div class="big rd">${fa(s.dd)} <span class="sm">/ ${fa(A.dd)}</span></div><div class="bar" style="margin-top:10px"><i style="width:${Math.min(100,A.dd?s.dd/A.dd*100:0)}%;background:var(--rd)"></i></div></div>${card('Total Trades',s.n)}${card('Winning / Losing',s.w+' / '+s.l)}${card('Biggest Win',fm(s.bw),'gn')}${card('Biggest Loss',fm(s.bl),'rd')}</div>
<div class="grid g2" style="margin-top:14px"><div class="card"><div class="row sp"><b>Equity Curve</b><div class="seg">${['week','month','all'].map(r=>`<button class="${S.rng==r?'on':''}" onclick="S.rng='${r}';render()">${r=='all'?'All Time':r=='week'?'Weekly':'Monthly'}</button>`).join('')}</div></div>${curve()}</div>
<div class="card"><b>Trade Terakhir</b>${T().slice(-5).reverse().map(x=>`<div class="row sp" style="padding:11px 0;border-bottom:1px solid var(--bd);cursor:pointer" onclick="detail(${x.id})"><span><b>${x.sym}</b> <span class="sm">${x.date.slice(5)} · ${x.dir}</span></span><b class="${cls(x.pnl)}">${fm(x.pnl)}</b></div>`).join('')}</div></div>`},
analytics(){const s=st(T());if(!s.n)return empty('Analytics muncul setelah ada trade.');const ex=Math.round(s.wr/100*s.aw+(100-s.wr)/100*s.al),sr=by('sess');
return`<div class="grid g4">${card('Win Rate',s.wr+'%','gn')}${card('Loss Rate',(100-s.wr)+'%','rd')}${card('Profit Factor',s.pf)}${card('Expectancy',fm(ex),cls(ex))}${card('Average Win',fm(s.aw),'gn')}${card('Average Loss',fm(s.al),'rd')}${card('Best Session',sr[0][0])}${card('Worst Session',sr[sr.length-1][0])}</div>
<div class="grid ge" style="margin-top:14px"><div class="card"><b>Performance by Session</b>${bars(sr)}</div><div class="card"><b>Performance by Symbol</b>${bars(by('sym'))}</div><div class="card"><b>Performance by Confluence</b>${bars(by('conf',1))}</div><div class="card"><b>Performance by Emotion</b>${bars(by('emo'))}</div></div>`},
journal(){return`<div class="row tb" style="margin-bottom:14px"><input style="flex:1;min-width:150px;max-width:320px" placeholder="Search symbol, strategy…" value="${esc(S.q)}" oninput="S.q=this.value;S.pg=0;$('#jt').innerHTML=jtab()"><div class="seg">${[['all','All'],['w','Profit'],['l','Loss']].map(r=>`<button class="${S.res==r[0]?'on':''}" onclick="S.res='${r[0]}';S.pg=0;render()">${r[1]}</button>`).join('')}</div><select style="width:auto" onchange="S.ses=this.value;S.pg=0;render()">${['all','Asia','London','New York','NY AM','NY PM','No session','Outside Session'].map(o=>`<option ${S.ses==o?'selected':''} value="${o}">${o=='all'?'All sessions':o}</option>`).join('')}</select></div><div class="card sc" style="padding:6px 12px" id="jt">${jtab()}</div>`},
add(){const pro=S.mode=='pro',f=S.form,I=(n,l,p='',m='decimal')=>`<div class="f"><label>${l}</label><input name="${n}" inputmode="${m}" autocomplete="off" placeholder="${p}" value="${esc(f[n])}" oninput="S.form.${n}=this.value"></div>`,C=(n,o)=>`<div class="chips">${o.map(x=>`<button type="button" class="chip ${f[n]==x?'on':''}" onclick="S.form.${n}='${x}';render()">${x}</button>`).join('')}</div>`;
return`<div class="row sp" style="margin-bottom:14px"><div class="seg"><button class="${!pro?'on':''}" onclick="S.mode='basic';render()">Basic Mode</button><button class="${pro?'on':''}" onclick="S.mode='pro';render()">Pro Mode</button></div><span class="sm">${S.edit?'Editing trade #'+S.edit+' · ':''}Akun: ${esc(S.acc)} · Data tetap tersimpan saat pindah mode</span></div>
<div class="card"><div class="grid ge"><div>${I('sym','Trading Pair / Symbol','XAUUSD','text')}<div class="f"><label>Buy / Sell</label>${C('dir',['Buy','Sell'])}</div>${I('date','Date (YYYY-MM-DD)','','text')}${I('entry','Entry Price','0.00')}${I('exit','Exit Price','0.00')}</div><div>${I('pnl','P&L','mis. 1515 atau -200')}${I('rr','Risk Reward (RR)','mis. 2.4')}${I('lot','Lot Size','0.50')}${I('strat','Strategy (otomatis masuk ke menu Strategies)','mis. London Sweep + FVG','text').replace('autocomplete="off"','list="sl" autocomplete="off"')}<datalist id="sl">${groups().map(g=>`<option value="${esc(g.n)}">`).join('')}</datalist></div></div>
<div class="f"><label>Trading Session</label>${C('sess',['Asia','London','New York','Outside Session'])}</div><div class="f"><label>Emotion</label>${C('emo',['Disciplined','Calm','Confident','Greedy','Fearful','Revenge Trading','Gambling','Other'])}</div>
<div class="f"><label>Confluence (ketik lalu Enter)</label><input placeholder="mis. FVG, SMT, Order Block" autocomplete="off" onkeydown="if(event.key=='Enter'){addTag(this.value);this.value=''}"><div class="tags" id="tags"></div><div class="tags">${['FVG','IFVG','SMT','Liquidity Sweep','CISD','Order Block','BOS','CHOCH'].map(x=>`<span class="tag sug" onclick="addTag('${x}')">+ ${x}</span>`).join('')}</div></div>
<div class="f"><label>Screenshot</label></div>
<div class="f"><label>Notes</label><textarea rows="3" oninput="S.form.notes=this.value">${esc(f.notes)}</textarea></div><div class="row"><button class="btn y" onclick="saveTrade()">${S.edit?'Update Trade':'Save Trade'}</button><button class="btn sec" onclick="S.edit=null;S.form=nf();S.tags=[];go('journal')">Cancel</button></div></div>`},
notes(){const n=S.notes.map((x,i)=>({...x,i})).sort((a,b)=>b.pin-a.pin);return`<div class="row tb" style="margin-bottom:14px"><input id="nn" style="flex:1" placeholder="Tulis catatan baru…"><button class="btn" onclick="if($('#nn').value){S.notes.push({t:$('#nn').value,pin:0});render();toast(L('Catatan ditambahkan','Note added'))}">Add Note</button></div><div class="grid">${n.map(x=>`<div class="card note ${x.pin?'pin':''}"><div class="row sp"><span>${x.pin?'📌 ':''}${esc(x.t)}</span><span class="row"><button class="ib" onclick="S.notes[${x.i}].pin^=1;render()">${x.pin?'Unpin':'Pin'}</button><button class="ib" onclick="S.notes.splice(${x.i},1);render()">Delete</button></span></div></div>`).join('')}</div>`},
calendar(){const[Y,M]=S.cm,d={};T().forEach(x=>{(d[x.date]=d[x.date]||[]).push(x)});
const first=new Date(Y,M,1).getDay(),dim=new Date(Y,M+1,0).getDate();let cells='',ws=0,wd=0,wn=1,mt=0,md=0,wins=0,c=0;
const flush=()=>{cells+=`<div class="wk"><span class="lab">${L('Minggu','Week')} ${wn}</span><b class="${wd?cls(ws):''}">${wd?fm(ws):'–'}</b><span class="sm">${wd} ${L('hari','days')}</span></div>`;ws=0;wd=0;wn++;c=0};
for(let i=0;i<first;i++){cells+='<div class="td o"></div>';c++}
for(let i=1;i<=dim;i++){const k=`${Y}-${pad(M+1)}-${pad(i)}`,a=d[k],p=a?sum(a.map(x=>x.pnl)):0,nw=S.news[k]||[];if(a){ws+=p;wd++;mt+=p;md++;if(p>0)wins++}
cells+=`<div class="td ${a?(p>=0?'p':'n'):''} ${k==TODAY?'t':''} ${S.sel==k?'sel':''}" onclick="S.sel='${k}';render()"><span><span class="dn">${i}</span></span>${a?`<div><div class="v ${cls(p)}">${fm(p)}</div><div class="c">${a.length} trade${a.length>1?'s':''}</div></div>`:'<span></span>'}<span class="ni">${nw.slice(0,4).map(n=>`<i class="im ${n.imp}"></i>`).join('')}</span></div>`;c++;if(c==7)flush()}
if(c){while(c<7){cells+='<div class="td o"></div>';c++}flush()}
const k=S.sel,s=d[k]||[],sp=sum(s.map(x=>x.pnl)),imps=[['0,1,2,3','Semua'],['2,3','Medium+High'],['3','High']];
return`<div class="grid g4" style="margin-bottom:14px">${card('Monthly P&L',fm(mt),cls(mt))}${card('Trading Days',md)}${card('Winning Days',wins+' / '+md)}${card('Weekly P&L (terbaru)',fm(wk()),cls(wk()))}</div>
<div class="grid g2"><div class="card"><div class="row sp" style="margin-bottom:12px"><button class="ib" onclick="calNav(-1)">‹</button><b>${MN()[M]} ${Y}</b><span class="row"><button class="ib" onclick="S.cm=[+TODAY.slice(0,4),+TODAY.slice(5,7)-1];S.sel=TODAY;render()">Hari ini</button><button class="ib" onclick="calNav(1)">›</button></span></div><div class="tsc">${WD().map(x=>`<div class="h">${x}</div>`).join('')}${cells}</div></div>
<div class="card"><b>${k}</b>${s.length?`<p>Daily P&amp;L <b class="${cls(sp)}">${fm(sp)}</b> · ${s.length} trade · Win ${s.filter(x=>x.pnl>0).length} / Loss ${s.filter(x=>x.pnl<0).length}</p>${s.map(x=>`<div class="row sp" style="padding:10px 0;border-top:1px solid var(--bd);cursor:pointer" onclick="detail(${x.id})"><span>${x.sym} ${x.dir} <span class="sm">${esc(x.strat)}</span></span><b class="${cls(x.pnl)}">${fm(x.pnl)}</b></div>`).join('')}`:'<p class="sm">Tidak ada trade di tanggal ini.</p>'}
<hr style="border:0;border-top:1px solid var(--bd);margin:16px 0"><b>Economic News</b><div style="margin-top:6px">${newsRows(k)}</div>
<div class="grid ge" style="gap:8px;margin-top:12px"><div class="f" style="margin:0"><input id="nt" placeholder="Jam 19:30"></div><div class="f" style="margin:0"><input id="nc" placeholder="USD"></div></div><div class="f" style="margin:8px 0"><input id="ne" placeholder="Event, mis. Non-Farm Payrolls"></div>
<div class="grid ge" style="gap:8px"><div class="f" style="margin:0"><select id="ni"><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div><div class="f" style="margin:0"><input id="na" placeholder="Actual"></div><div class="f" style="margin:0"><input id="nf" placeholder="Forecast"></div><div class="f" style="margin:0"><input id="np" placeholder="Previous"></div></div>
<div class="row" style="margin-top:10px"><button class="btn y" onclick="addNews()">+ Tambah news</button><button class="btn sec" onclick="$('#impn').click()">Import JSON</button></div></div></div>
<div class="card" style="margin-top:14px"><div class="row sp" style="margin-bottom:12px"><b>Kalender Ekonomi · Myfxbook</b><div class="row"><div class="seg">${imps.map(r=>`<button class="${S.imp==r[0]?'on':''}" onclick="S.imp='${r[0]}';render()">${r[1]}</button>`).join('')}</div><a class="ib" style="text-decoration:none" target="_blank" rel="noopener" href="https://www.myfxbook.com/forex-economic-calendar">Buka Myfxbook ↗</a></div></div><iframe src="https://widget.myfxbook.com/widget/calendar.html?lang=en&impacts=${S.imp}" style="width:100%;height:440px;border:0;border-radius:10px;background:#fff" loading="lazy"></iframe><p class="sm" style="margin:10px 0 0">Widget resmi Myfxbook tampil di sini (butuh internet dan hosting yang mengizinkan iframe). Myfxbook tidak menyediakan API publik, jadi data yang ingin tampil di kalender P&amp;L dicatat lewat form di atas atau Import JSON.</p></div>`},
settings(){if(!S.pf)pfNew();const p=S.pf,lg=[['id','Indonesia','ID'],['en','English','GB']];
return`<div class="grid ge"><div class="card"><b>${L('Profil','Profile')}</b><div class="f" style="margin-top:14px"><label>${L('Nama Lengkap','Full Name')}</label><input value="${esc(p.name)}" placeholder="${L('Nama lengkap','Full name')}" oninput="S.pf.name=this.value;svUpd()"></div><div class="f"><label>Username</label><input value="${esc(p.user)}" placeholder="Username" oninput="S.pf.user=this.value;svUpd()"></div><div class="f"><label>${L('Foto Profil','Profile Picture')}</label><input type="file"></div></div>
<div class="card"><b>${L('Preferensi','Preferences')}</b>
<div class="f" style="margin-top:14px"><label>${L('Mata Uang','Currency')}</label><select onchange="pfSet('cur',this.value)">${Object.keys(CUR).map(c=>`<option ${c==p.cur?'selected':''}>${c}</option>`).join('')}</select></div>
<div class="f"><label>${L('Negara','Country')}</label><div class="cs"><button type="button" class="csb" onclick="cdTog()">${fl(p.country)}<span>${esc(cn(p.country))}</span><i>▾</i></button>${S.cd?`<div class="csl"><input class="csq" placeholder="${L('Cari negara…','Search country…')}" value="${esc(S.cq)}" oninput="S.cq=this.value;cdq()" autocomplete="off"><div id="cdl">${cdList()}</div></div>`:''}</div></div>
<div class="f"><label>${L('Tema','Theme')}</label><div class="seg">${[['light',L('Terang','Light')],['dark',L('Gelap','Dark')]].map(x=>`<button class="${p.theme==x[0]?'on':''}" onclick="pfSet('theme','${x[0]}')">${x[1]}</button>`).join('')}</div></div>
<div class="f"><label>${L('Bahasa','Language')}</label><div class="seg">${lg.map(x=>`<button class="${p.lang==x[0]?'on':''}" onclick="pfSet('lang','${x[0]}')">${fl(x[2])}${x[1]}</button>`).join('')}</div></div>
<div class="f"><label>${L('Zona Waktu / Format Tanggal','Timezone / Date Format')}</label><select><option>Asia/Jakarta (WIB) · DD/MM/YYYY</option></select></div></div>
<div class="card"><b>${L('Akun','Accounts')}</b><p class="sm" style="margin:10px 0 14px">${L('Pengelolaan akun dan tautan broker sekarang ada di menu Account.','Account management and broker linking now live in the Account menu.')}</p><button class="btn sec" onclick="go('account')">${L('Buka menu Account','Open Account menu')}</button></div>
<div class="card"><b>${L('Ekspor / Impor','Export / Import')}</b><div class="row" style="margin:14px 0"><button class="btn sec" onclick="expA(0)">${L('Ekspor Akun','Export Account')}</button><button class="btn sec" onclick="expA(1)">${L('Ekspor Semua','Export All')}</button><button class="btn sec" onclick="$('#imp').click()">${L('Impor JSON','Import JSON')}</button></div><b class="rd">Reset Data</b><p class="sm">${L('Hanya menghapus trade akun','Only deletes trades from account')} ${esc(S.acc)}.</p><button class="btn dg" onclick="resetM()">Reset ${esc(S.acc)}</button></div></div>
<div class="svb" id="sv">${svBar()}</div>`}};

function jtab(){const q=S.q.toLowerCase();let t=T().filter(x=>(x.sym+x.sess+x.dir+(x.strat||'')).toLowerCase().includes(q)&&(S.res=='all'||(S.res=='w')==(x.pnl>0))&&(S.ses=='all'||x.sess==S.ses));const[k,d]=S.sort;t.sort((a,b)=>(a[k]>b[k]?1:-1)*d);const ps=8,n=t.length,pg=Math.min(S.pg,Math.max(0,Math.ceil(n/ps)-1));
const th=(l,k2)=>`<th onclick="S.sort=['${k2}',S.sort[0]=='${k2}'?-S.sort[1]:-1];$('#jt').innerHTML=jtab()">${l}${S.sort[0]==k2?(S.sort[1]>0?' ↑':' ↓'):''}</th>`;
if(!n)return'<div class="empty">Tidak ada trade yang cocok.</div>';
return`<table><thead><tr>${th('Date','date')}${th('Symbol','sym')}<th>Dir</th>${th('P&L','pnl')}${th('RR','rr')}<th>Lot</th><th>Session</th><th>Strategy</th><th>Shot</th><th>Result</th><th>Action</th></tr></thead><tbody>${t.slice(pg*ps,pg*ps+ps).map(x=>`<tr onclick="detail(${x.id})"><td>${x.date}</td><td><b>${x.sym}</b>${x.src=='broker'?' <span class="pill w" style="font-size:10px">Auto</span>':''}</td><td>${x.dir}</td><td class="${cls(x.pnl)}"><b>${fm(x.pnl)}</b></td><td>${x.rr}</td><td>${x.lot}</td><td>${x.sess}</td><td class="sm">${esc(x.strat)}</td><td>${x.shot?`<img src="${x.shot}" style="height:26px;border-radius:5px;display:block" onclick="event.stopPropagation();lbT(${x.id})">`:'–'}</td><td><span class="pill ${x.pnl>0?'w':'l'}">${x.pnl>0?'Win':'Loss'}</span></td><td><button class="ib" onclick="event.stopPropagation();del(${x.id})">Delete</button></td></tr>`).join('')}</tbody></table><div class="row sp" style="padding:12px 4px"><span class="sm">${n} trade · halaman ${pg+1}/${Math.ceil(n/ps)}</span><span class="row"><button class="ib" onclick="S.pg=${Math.max(0,pg-1)};$('#jt').innerHTML=jtab()">‹ Prev</button><button class="ib" onclick="S.pg=${pg+1};$('#jt').innerHTML=jtab()">Next ›</button></span></div>`}
function render(){save();$('#view').innerHTML=V[S.page]();$('#ttl').textContent=NAV.find(n=>n[0]==S.page)[1];$('#nav').innerHTML=NAV.map(n=>`<button class="${n[0]=='add'?'add':n[0]==S.page?'on':''}" onclick="${n[0]=='add'?'newTrade()':`go('${n[0]}')`}">${ic(n[0])}<span class="lb">${n[1]}</span></button>`).join('');if(S.page=='add')drawTags()}
function go(p){if(p=='settings'&&(S.page!='settings'||!S.pf)){pfNew();S.cd=false}S.page=p;if(p!='strategies')S.strat=null;$('#sb').classList.remove('open');render();$('#view').scrollTop=0}
function newTrade(){if(S.page!='add'||S.edit){S.edit=null;S.form=nf();S.tags=[]}go('add')}
function drawTags(){const e=$('#tags');if(e)e.innerHTML=S.tags.map((x,i)=>`<span class="tag">${esc(x)}<b onclick="S.tags.splice(${i},1);drawTags()">✕</b></span>`).join('')}
function addTag(v){v=v.trim();if(v&&!S.tags.includes(v))S.tags.push(v);drawTags()}
document.addEventListener('paste',e=>{if(S.page!='add')return;const it=[...(e.clipboardData?e.clipboardData.items:[])].find(i=>i.type.startsWith('image'));if(it){setShot(S.zone||'shot',it.getAsFile())}});
function del(id){ACC[S.acc].t=T().filter(x=>x.id!=id);closeM();render();toast('Trade dihapus')}
function modal(h,w){$('#mb').className='mb'+(w?' w':'');$('#mb').innerHTML=h;$('#md').classList.add('on')}
function closeM(){$('#md').classList.remove('on')}
$('#md').onclick=e=>{if(e.target.id=='md')closeM()};
function lbT(id){const x=T().find(y=>y.id==id);if(!x||!x.shot)return;modal(`<div class="row sp" style="margin-bottom:12px"><b>${x.sym} · ${x.date}</b><button class="ib" onclick="closeM()">✕</button></div><img src="${x.shot}" style="width:100%;border-radius:10px;display:block"><div class="row sp" style="margin-top:14px"><b class="${cls(x.pnl)}">${fm(x.pnl)}</b><button class="btn sec" onclick="detail(${id})">Open trade</button></div>`,1)}
function detail(id){const x=T().find(y=>y.id==id);modal(`<div class="row sp"><b style="font-size:18px">${x.sym} · ${x.dir}</b><button class="ib" onclick="closeM()">✕</button></div><div class="big ${cls(x.pnl)}">${fm(x.pnl)}</div><div class="grid ge" style="margin:16px 0">${[['Date',x.date],['Strategy',esc(x.strat)],['Entry',x.entry],['Exit',x.exit],['Stop Loss',x.sl],['Take Profit',x.tp],['RR',x.rr],['Lot Size',x.lot],['Session',x.sess],['Emotion',x.emo]].map(a=>`<div><div class="lab">${a[0]}</div>${a[1]}</div>`).join('')}</div><div class="tags" style="margin:0 0 14px">${x.conf.map(c=>`<span class="tag sug">${c}</span>`).join('')}</div>${x.note?`<p class="sm">${esc(x.note)}</p>`:''}${x.shot?`<img src="${x.shot}" style="width:100%;border-radius:10px;cursor:zoom-in;margin-bottom:14px" onclick="lbT(${id})">`:'<div class="card sm" style="text-align:center;margin-bottom:14px">No screenshot</div>'}<div class="row"><button class="btn" onclick="cert(${id})">Print Certificate</button><button class="btn sec" onclick="editTrade(${id})">Edit</button><button class="btn dg" onclick="del(${id})">Delete</button></div>`)}

/* ===== SERTIFIKAT ===== */
const CMP=v=>{const n=Math.abs(+v||0),f=x=>String(+x.toFixed(2)),s=CUR[S.cur]||'';return s+(n>=1e9?f(n/1e9)+'B':n>=1e6?f(n/1e6)+'M':n>=1e3?f(n/1e3)+'K':f(n))};
function certInfo(id){const x=T().find(y=>y.id==id);if(!x)return null;
const w=x.pnl>=0,rr=Math.abs(+x.rr||0);
return{x,w,buy:x.dir=='Buy',cc:S.country||'ID',
no:'RTC-'+x.date.slice(0,4)+'-'+x.date.slice(5,7)+x.date.slice(8,10)+'-'+String(x.id).padStart(4,'0'),
date:x.date.slice(5,7)+'/'+x.date.slice(8,10)+'/'+x.date.slice(0,4),
user:(S.prof.user||S.prof.name||'USERNAME').toUpperCase(),
sym:x.sym,dir:x.dir.toUpperCase(),lot:(+x.lot||0).toFixed(2),
r:rr?(w?'+':'-')+rr.toFixed(1)+'R':'–',
entry:String(x.entry),exit:String(x.exit),amt:fm2(x.pnl),acc:CMP(ACC[S.acc].bal)}}

/* certPaint(g, d, im): menggambar sertifikat 1254x1254 ke context 2D g.
   d = data dari certInfo, im = {logo, sig, flag} (boleh null) */
function certPaint(g,d,im){
const SZ=1254,FF='Poppins,Inter,system-ui,sans-serif',M='#13F8A1',R='#FF3E4C',GR=d.w?M:R,DC=d.buy?M:R,LT='#E4E7E9',TILE='#060C0C';
const F=(s,w)=>w+' '+s+'px '+FF;
const W=(t,s,w,l)=>{g.font=F(s,w);let a=0;for(const c of t)a+=g.measureText(c).width+l*s;return a-l*s};
const T=(t,x,y,s,w,c,l=0,al='l')=>{const wd=W(t,s,w,l);let X=al=='c'?x-wd/2:al=='r'?x-wd:x;g.font=F(s,w);g.fillStyle=c;g.textAlign='left';g.textBaseline='alphabetic';for(const ch of t){g.fillText(ch,X,y);X+=g.measureText(ch).width+l*s}return wd};
const fit=(t,s,w,l,mx)=>{const a=W(t,s,w,l);return a>mx?Math.max(11,s*mx/a):s};
const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
const rgb=(h,a)=>{const n=parseInt(h.slice(1),16);return'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')'};

/* ---- latar ---- */
g.fillStyle='#030A0A';g.fillRect(0,0,SZ,SZ);
const gl=(x,y,r,a)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,rgb(M,a));q.addColorStop(1,rgb(M,0));g.fillStyle=q;g.fillRect(0,0,SZ,SZ)};
gl(1254,0,560,.09);gl(0,1254,520,.10);gl(0,0,380,.06);gl(1254,980,460,.045);
const ray=(x1,y1,x2,y2,a,w)=>{const q=g.createLinearGradient(x1,y1,x2,y2);q.addColorStop(0,rgb(M,0));q.addColorStop(.35,rgb(M,a));q.addColorStop(.7,rgb(M,a*.6));q.addColorStop(1,rgb(M,0));g.save();g.strokeStyle=q;g.lineWidth=w;g.shadowColor=rgb(M,.55);g.shadowBlur=9;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore()};
ray(205,0,0,198,.75,1.6);ray(1100,0,970,118,.65,1.5);ray(1204,60,1172,92,.5,1.3);
ray(1254,205,1040,440,.5,1.4);ray(1254,832,1090,1012,.55,1.5);ray(66,1046,0,1118,.6,1.5);ray(112,1226,86,1254,.4,1.2);

/* ---- header ---- */
if(im&&im.logo){const L=im.logo,k=175/163,bx=115,by=88,bw=175,bh=118,iw=25.79*12.54*k;g.save();g.beginPath();g.rect(bx,by,bw,bh);g.clip();g.globalCompositeOperation='screen';g.drawImage(L,bx-6.48*12.54*k,by-7.92*12.54*k,iw,(L.naturalHeight||L.height)/(L.naturalWidth||L.width)*iw);g.restore()}
else T('RTJ',115,200,96,700,'#fff',.02);
g.fillStyle='rgba(255,255,255,.28)';g.fillRect(334,92,2,108);
T('ROAD TO JOURNAL',383,139,33,500,'#fff',.396);
T('TRADE  /  DISCIPLINE  /  GROW',383,178.5,20,400,'#C3CBCD',.38);
/* kotak nomor sertifikat */
g.save();g.beginPath();g.moveTo(1300,82);g.arcTo(991,82,907,168,26);g.arcTo(907,168,1300,168,26);g.lineTo(1300,168);g.lineTo(1300,82);g.fillStyle='rgba(2,8,8,.55)';g.fill();
g.beginPath();g.moveTo(1300,82);g.arcTo(991,82,907,168,26);g.arcTo(907,168,1300,168,26);g.lineTo(1300,168);g.strokeStyle=rgb(M,.5);g.lineWidth=1.6;g.shadowColor=rgb(M,.4);g.shadowBlur=7;g.stroke();g.restore();
T('CERTIFICATE NO.',998,117,16.5,400,'#C4CDCF',.197);
T(d.no,997,148,22,400,'#fff',-.015);

/* ---- hasil trade ---- */
g.fillStyle=GR;g.fillRect(107,281,7,26);
T('TRADE RESULT',143,304,27,400,'#A9B3B4',.45);
{const s=fit(d.amt,144,700,-.032,1040);T(d.amt,105,436,s,700,GR,-.032)}
/* pil PROFIT / LOSS */
{const px=108,py=463,pw=290,ph=58;g.save();rr(px,py,pw,ph,ph/2);g.fillStyle=rgb(GR,.05);g.fill();g.shadowColor=rgb(GR,.35);g.shadowBlur=10;g.strokeStyle=rgb(GR,.9);g.lineWidth=3.2;g.stroke();g.restore();
const tw=W(d.w?'PROFIT':'LOSS',30,600,.273),ic=34,gap=24,x0=px+(pw-(ic+gap+tw))/2,cy=py+ph/2;
g.fillStyle=GR;[[0,12],[12,21],[24,30]].forEach(b=>{const h=d.w?b[1]:42-b[1];g.beginPath();g.roundRect?g.roundRect(x0+b[0],cy+15-h,8,h,2):g.rect(x0+b[0],cy+15-h,8,h);g.fill()});
g.strokeStyle=GR;g.lineWidth=3;g.lineCap='round';g.lineJoin='round';g.beginPath();if(d.w){g.moveTo(x0+2,cy-4);g.lineTo(x0+26,cy-16);g.moveTo(x0+17,cy-17);g.lineTo(x0+27,cy-17);g.lineTo(x0+27,cy-8)}else{g.moveTo(x0+2,cy-16);g.lineTo(x0+26,cy-4);g.moveTo(x0+17,cy-3);g.lineTo(x0+27,cy-3);g.lineTo(x0+27,cy-12)}g.stroke();
T(d.w?'PROFIT':'LOSS',x0+ic+gap-2,py+ph/2+11,30,600,GR,.273)}
/* garis pemisah */
{const q=g.createLinearGradient(40,0,1214,0);q.addColorStop(0,rgb(M,0));q.addColorStop(.5,'rgba(190,255,240,.95)');q.addColorStop(1,rgb(M,0));g.save();g.strokeStyle=q;g.lineWidth=1.6;g.shadowColor=rgb(M,.7);g.shadowBlur=8;g.beginPath();g.moveTo(40,548);g.lineTo(1214,548);g.stroke();g.restore()}

/* ---- kotak info ---- */
const COL=[[51,370],[449,356],[833,370]],ROW=[[591,114],[727,116]];
const tile=(c,r)=>{g.save();rr(COL[c][0]+.5,ROW[r][0]+.5,COL[c][1],ROW[r][1],21);g.fillStyle=TILE;g.fill();g.strokeStyle='rgba(78,146,122,'+(r?.5:.4)+')';g.lineWidth=1.3;g.stroke();g.restore()};
for(let r=0;r<2;r++)for(let c=0;c<3;c++)tile(c,r);
const LB=(t,x,y,l)=>T(t,x,y,17,500,'#B6BFC0',l),VL=(t,x,y,c,col,l)=>T(t,x,y,fit(t,44,600,l||0,COL[c][1]-(x-COL[c][0])-26),600,col||'#fff',l||0);
const fillIc=()=>{g.fillStyle=LT;g.strokeStyle=LT;g.lineCap='round';g.lineJoin='round'};
/* 1 instrumen */
LB('INSTRUMENT',195,630,.143);VL(d.sym,195,681,0,'#fff',-.03);
fillIc();[[112,640,14],[126,630,24],[140,617,37]].forEach(b=>{rr(b[0],b[1],11,b[2],2.5);g.fill()});
/* 2 arah */
LB('DIRECTION',598,630,.13);
{g.save();rr(560,643,185,49,24.5);g.strokeStyle=DC;g.lineWidth=3;g.stroke();g.restore();T(d.dir,670,681,35,600,DC,.1,'c');
g.save();g.strokeStyle=DC;g.lineWidth=4.6;g.lineCap='round';g.lineJoin='round';g.beginPath();if(d.buy){g.moveTo(530,636);g.lineTo(546,620);g.moveTo(534,619);g.lineTo(547,619);g.lineTo(547,632)}else{g.moveTo(530,619);g.lineTo(546,635);g.moveTo(547,622);g.lineTo(547,635);g.lineTo(534,635)}g.stroke();g.restore()}
/* 3 lot */
LB('LOT SIZE',986,630,.16);VL(d.lot,987,681,2);
fillIc();{const disc=(x,y,rx)=>{g.fillStyle=LT;g.beginPath();g.ellipse(x,y,rx,6.5,0,0,6.2832);g.fill();g.fillRect(x-rx,y-1,rx*2,9);g.beginPath();g.ellipse(x,y+8,rx,6.5,0,0,Math.PI);g.fill();g.strokeStyle=TILE;g.lineWidth=1.6;g.beginPath();g.ellipse(x,y+1,rx-2,5,0,.15,Math.PI-.15);g.stroke()};disc(904,645,13);disc(904,634,13);disc(904,623,13);disc(924,640,11);disc(924,629,11)}
/* 4 R multiple */
LB('R MULTIPLE',196,769,.194);VL(d.r,196,821,0,d.r=='–'?'#fff':(d.w?'#1BE9A1':R),.05);
fillIc();{g.save();g.translate(108,755);g.beginPath();g.moveTo(10,0);g.lineTo(34,0);g.lineTo(34,13);g.quadraticCurveTo(34,26,22,29);g.quadraticCurveTo(10,26,10,13);g.closePath();g.fill();g.lineWidth=3.6;g.beginPath();g.moveTo(10,5);g.lineTo(3,5);g.quadraticCurveTo(1,5,1.5,9);g.quadraticCurveTo(3,17,11,19);g.moveTo(34,5);g.lineTo(41,5);g.quadraticCurveTo(43,5,42.5,9);g.quadraticCurveTo(41,17,33,19);g.stroke();g.fillRect(19.5,29,5,9);rr(11,38,22,6,2);g.fill();g.restore()}
/* 5 ENTRY / EXIT (pengganti Strategy) */
fillIc();g.lineWidth=4.2;g.beginPath();g.moveTo(514,771);g.lineTo(552,771);g.moveTo(543,762);g.lineTo(553,771);g.lineTo(543,780);g.moveTo(554,791);g.lineTo(516,791);g.moveTo(525,782);g.lineTo(515,791);g.lineTo(525,800);g.stroke();
{const ex=(l,v,y)=>{T(l,598,y,16,500,'#B6BFC0',.16);const s=fit(v,31,600,0,112);T(v,784,y+2,s,600,'#fff',0,'r')};
ex('ENTRY',d.entry,776);g.fillStyle='rgba(255,255,255,.09)';g.fillRect(598,790,186,1);ex('EXIT',d.exit,824)}
/* 6 akun */
LB('ACCOUNT',986,769,.10);VL(d.acc,986,821,2);
fillIc();{g.save();g.translate(892,752);rr(1,8,42,36,6);g.fill();g.lineWidth=4.2;g.beginPath();g.moveTo(14,9);g.lineTo(14,6);g.quadraticCurveTo(14,2.5,17.5,2.5);g.lineTo(26.5,2.5);g.quadraticCurveTo(30,2.5,30,6);g.lineTo(30,9);g.stroke();g.strokeStyle=TILE;g.lineWidth=2;g.beginPath();g.moveTo(2,26);g.lineTo(42,26);g.stroke();g.fillStyle=TILE;g.fillRect(19,23,6,7);g.restore()}

/* ---- penerima ---- */
g.fillStyle='rgba(236,241,241,.85)';g.fillRect(97,913,291,2);g.fillRect(865,913,295,2);
T('PROUDLY PRESENTED TO:',629,918,25,400,'#C3CCCD',.13,'c');
{let s=64;const nw=W(d.user,s,700,.108),tot=nw+34+66;if(tot>760)s=s*760/tot;const w2=W(d.user,s,700,.108),x0=645-(w2+34+66)/2;T(d.user,x0,998,s,700,'#fff',.108);
const fx=x0+w2+34,fy=953;g.save();rr(fx,fy,66,46,4);g.clip();
if(im&&im.flag){const f=im.flag,k=Math.max(66/f.width,46/f.height),fw=f.width*k,fh=f.height*k;g.drawImage(f,fx+33-fw/2,fy+23-fh/2,fw,fh)}else{g.fillStyle='#2a3336';g.fillRect(fx,fy,66,46)}g.restore()}

/* ---- tanda tangan + tanggal ---- */
g.fillStyle='rgba(236,241,241,.85)';g.fillRect(97,1129,291,2);g.fillRect(925,1129,255,2);
if(im&&im.sig){const S2=im.sig;g.save();g.globalCompositeOperation='screen';g.drawImage(S2,S2.width*100/791,S2.height*110/550,S2.width*580/791,S2.height*315/550,150,1042,160,87);g.restore()}
else T('M. Zufron',230,1122,62,400,'#fff',0,'c','Caveat,cursive');
T('CEO - M. ZUFRON',242,1163,20,500,'#B6BFC0',.11,'c');
T(d.date,1054,1113,33,500,'#fff',-.027,'c');
T('DATE',1055,1163,20,500,'#B6BFC0',.09,'c');
}

/* ---- memuat gambar + membuat canvas ---- */
const CI={};
const ldI=(s,cors)=>CI[s]?Promise.resolve(CI[s]):new Promise(ok=>{const i=new Image();if(cors)i.crossOrigin='anonymous';i.onload=()=>ok(CI[s]=i);i.onerror=()=>ok(null);i.src=s});
async function certMake(id,full){
const d=certInfo(id);if(!d)return null;
try{await Promise.all([400,500,600,700].map(w=>document.fonts.load(w+' 20px Poppins')).concat(document.fonts.load('400 40px Caveat')))}catch(e){}
const[logo,sig,flag]=await Promise.all([full?ldI('RTJ.jpeg'):null,full?ldI('tandatangan.png'):null,ldI('https://flagcdn.com/h80/'+d.cc.toLowerCase()+'.png',1)]);
const cv=document.createElement('canvas');cv.width=cv.height=1254;certPaint(cv.getContext('2d'),d,{logo,sig,flag});
return{cv,d}}

/* ---- tampilan sertifikat (sama persis dengan PNG) ---- */
async function cert(id){
toast('Menyiapkan sertifikat…');
const r=await certMake(id,1);if(!r)return;
modal(`<div id="cvh"></div><div class="row" style="margin-top:14px"><button class="btn" onclick="dlCert(${id})">Download PNG</button><button class="btn sec" onclick="window.print()">Print</button><button class="btn sec" onclick="closeM()">Close</button></div>`,1);
r.cv.className='cwc';$('#cvh').appendChild(r.cv)}

async function dlCert(id){
toast('Menyiapkan sertifikat…');
let r=await certMake(id,1);if(!r)return;
const out=c=>new Promise((ok,er)=>{try{c.toBlob(b=>b?ok(b):er(new Error('blob')),'image/png')}catch(e){er(e)}});
let blob,noLogo=false;
try{blob=await out(r.cv)}catch(e){noLogo=true;r=await certMake(id,0);try{blob=await out(r.cv)}catch(e2){return toast('Gagal membuat gambar sertifikat')}}
const u=URL.createObjectURL(blob),el=document.createElement('a');el.href=u;el.download='RTJ-certificate-'+r.d.sym+'-'+r.d.x.date+'.png';document.body.appendChild(el);el.click();el.remove();setTimeout(()=>URL.revokeObjectURL(u),2e3);
toast(noLogo?'Sertifikat diunduh (tanpa logo: buka lewat hosting/server agar logo ikut)':'Sertifikat diunduh')}

function resetM(){modal(`<b style="font-size:17px">Reset data ${esc(S.acc)}?</b><p class="sm">Hanya trade akun ini yang dihapus. Akun lain aman.</p><div class="row"><button class="btn dg" onclick="ACC[S.acc].t=[];closeM();render();toast('Data akun direset')">Ya, reset</button><button class="btn sec" onclick="closeM()">Batal</button></div>`)}
function accSel(){$('#accSel').innerHTML=Object.keys(ACC).map(a=>`<option value="${esc(a)}" ${a==S.acc?'selected':''}>${esc(a)}</option>`).join('')}
function accM(n){const a=n?ACC[n]:{bal:10000,dd:1000,type:'Personal Account',ddType:'static',target:0},dt=a.ddType||'static';modal(`<div class="row sp" style="margin-bottom:14px"><b style="font-size:17px">${n?'Edit':'Tambah'} Akun</b><button class="ib" onclick="closeM()">✕</button></div><div class="f"><label>Nama Akun</label><input id="an" value="${esc(n||'')}" placeholder="mis. Apex 50K"></div><div class="grid ge"><div class="f"><label>Balance Awal</label><input id="ab" inputmode="decimal" value="${a.bal}"></div><div class="f"><label>Max Drawdown (limit)</label><input id="ad" inputmode="decimal" value="${a.dd}"></div></div><div class="grid ge"><div class="f"><label>Tipe Drawdown</label><select id="adt"><option value="static" ${dt=='static'?'selected':''}>Static (tetap dari balance awal)</option><option value="trailing" ${dt=='trailing'?'selected':''}>Trailing (ikut equity tertinggi)</option></select></div><div class="f"><label>Target Profit</label><input id="atg" inputmode="decimal" value="${a.target||0}" placeholder="0 = tanpa target"></div></div><div class="f"><label>Tipe Akun</label><select id="at">${TYPES.map(t=>`<option ${t==a.type?'selected':''}>${t}</option>`).join('')}</select></div><div class="row"><button class="btn y" data-o="${esc(n||'')}" onclick="saveAcc(this.dataset.o)">Simpan</button>${n?`<button class="btn dg" data-o="${esc(n)}" onclick="delAcc(this.dataset.o)">Hapus Akun</button>`:''}<button class="btn sec" onclick="closeM()">Batal</button></div>`)}
function saveAcc(o){const nm=$('#an').value.trim(),b=parseFloat($('#ab').value),dd=parseFloat($('#ad').value),ty=$('#at').value,ddt=$('#adt').value,tg=parseFloat($('#atg').value)||0;if(!nm)return toast('Nama akun wajib diisi');if(isNaN(b)||b<0||isNaN(dd)||dd<0||tg<0)return toast('Balance, drawdown, dan target harus angka');if(nm!=o&&ACC[nm])return toast('Nama akun sudah dipakai');
if(o){const a=ACC[o];a.bal=b;a.dd=dd;a.type=ty;a.ddType=ddt;a.target=tg;if(nm!=o){const n2={};Object.keys(ACC).forEach(k=>n2[k==o?nm:k]=ACC[k]);Object.keys(ACC).forEach(k=>delete ACC[k]);Object.assign(ACC,n2);if(S.acc==o)S.acc=nm}}else{ACC[nm]={bal:b,dd,type:ty,ddType:ddt,target:tg,t:[]};S.acc=nm}
closeM();accSel();render();toast('Akun disimpan');setTimeout(notify,2400)}
function delAcc(n){if(Object.keys(ACC).length<2)return toast('Minimal harus ada 1 akun');if(!confirm(L('Hapus akun "'+n+'" beserta semua trade-nya?','Delete account "'+n+'" and all its trades?')))return;delete ACC[n];if(S.acc==n)S.acc=Object.keys(ACC)[0];S.strat=null;S.pg=0;closeM();accSel();render();toast('Akun dihapus')}
function dl(name,o){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1e3)}
function expA(all){dl(all?'rtj-all.json':'rtj-'+S.acc.replace(/\W+/g,'_')+'.json',all?{acc:ACC,notes:S.notes,news:S.news,rules:S.rules}:{name:S.acc,data:ACC[S.acc]});toast('File diexport')}
function rd(f,cb){if(!f)return;const r=new FileReader();r.onload=()=>{try{cb(JSON.parse(r.result))}catch(e){toast('File JSON tidak valid')}};r.readAsText(f)}
$('#imp').onchange=e=>{rd(e.target.files[0],j=>{if(j.acc){Object.assign(ACC,j.acc);if(j.notes)S.notes=j.notes;if(j.news)Object.assign(S.news,j.news);if(j.rules)Object.assign(S.rules,j.rules)}else if(j.name&&j.data)ACC[j.name]=j.data;else return toast('Format tidak dikenali');accSel();render();toast('Import berhasil')});e.target.value=''};
$('#impn').onchange=e=>{rd(e.target.files[0],j=>{if(!Array.isArray(j))return toast('Format: array [{date,time,cur,event,impact,actual,forecast,previous}]');j.forEach(n=>{if(!n.date||!(n.event||n.ev))return;(S.news[n.date]=S.news[n.date]||[]).push({time:n.time||'',cur:n.cur||n.currency||'',ev:n.event||n.ev,imp:['High','Medium','Low'].includes(n.impact)?n.impact:'Low',act:n.actual||'',fc:n.forecast||'',pv:n.previous||''})});render();toast('News diimport')});e.target.value=''};
function toast(m,k){const box=$('#ts'),e=document.createElement('div'),sp=document.createElement('span'),bad=k=='err'||/^(Isi |Gagal|Nama akun|Balance|File |Format|Minimal|Gambar|Penyimpanan)/.test(m);e.className='tt'+(bad?' er':'');sp.textContent=m;e.appendChild(sp);box.appendChild(e);while(box.children.length>3)box.firstChild.remove();requestAnimationFrame(()=>e.classList.add('on'));setTimeout(()=>{e.classList.remove('on');setTimeout(()=>e.remove(),260)},m.length>80?4500:2200)}
function theme(m){document.documentElement.dataset.theme=m;S.theme=m;if(S.pf)S.pf.theme=m;save()}
$('#th').onclick=()=>{theme(document.documentElement.dataset.theme=='dark'?'light':'dark');if(S.page=='settings')render()};
$('#col').onclick=()=>$('#sb').classList.toggle('mini');
$('#menu').onclick=()=>$('#sb').classList.toggle('open');
$('#accSel').onchange=e=>{S.acc=e.target.value;S.sel=TODAY;S.strat=null;S.pg=0;render();toast('Akun: '+S.acc)};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

const CC='AD AE AF AG AI AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FR GA GB GD GE GH GM GN GQ GR GT GW GY HK HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KI KM KN KP KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MM MN MO MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NR NZ OM PA PE PG PH PK PL PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VN VU WS YE ZA ZM ZW'.split(' ');
const DN={},cn=c=>{try{return(DN[S.lang]=DN[S.lang]||new Intl.DisplayNames([S.lang],{type:'region'})).of(c)||c}catch(e){return c}};
const fl=c=>`<img class="fl" src="https://flagcdn.com/h20/${c.toLowerCase()}.png" srcset="https://flagcdn.com/h40/${c.toLowerCase()}.png 2x" alt="${c}" loading="lazy" onerror="this.style.display='none'">`;
function pfNew(){S.pf={cur:S.cur,theme:S.theme,lang:S.lang,country:S.country,name:S.prof.name||'',user:S.prof.user||''}}
function pfSet(k,v){S.pf[k]=v;if(k=='country')S.cd=false;render()}
function pfDirty(){const p=S.pf;return p.cur!=S.cur||p.theme!=S.theme||p.lang!=S.lang||p.country!=S.country||p.name!=(S.prof.name||'')||p.user!=(S.prof.user||'')}
function svBar(){const d=pfDirty();return`<span class="sm">${d?L('● Ada perubahan yang belum disimpan','● You have unsaved changes'):L('✓ Semua perubahan tersimpan','✓ All changes saved')}</span><span class="row"><button class="btn sec" ${d?'':'disabled'} onclick="pfNew();S.cd=false;render()">${L('Batalkan','Discard')}</button><button class="btn y" onclick="savePrefs()">${L('Simpan Pengaturan','Save Settings')}</button></span>`}
function svUpd(){const b=$('#sv');if(b)b.innerHTML=svBar()}
function savePrefs(){const p=S.pf,lc=p.lang!=S.lang;S.cur=p.cur;S.country=p.country;S.prof={name:p.name.trim(),user:p.user.trim()};theme(p.theme);S.lang=p.lang;if(lc)setLang(S.lang);S.cd=false;pfNew();render();toast(L('Pengaturan disimpan','Settings saved'))}
function cdTog(){S.cd=!S.cd;S.cq='';render();if(S.cd){const q=$('.csq');q&&q.focus()}}
function cdList(){const q=S.cq.trim().toLowerCase(),a=CC.map(c=>[c,cn(c)]).filter(x=>!q||x[1].toLowerCase().includes(q)||x[0].toLowerCase()==q).sort((x,y)=>x[1].localeCompare(y[1],S.lang));return a.length?a.map(x=>`<button type="button" class="cso ${x[0]==S.pf.country?'on':''}" onclick="pfSet('country','${x[0]}')">${fl(x[0])}<span>${esc(x[1])}</span></button>`).join(''):`<div class="sm" style="padding:8px">${L('Negara tidak ditemukan','No country found')}</div>`}
function cdq(){const l=$('#cdl');if(l)l.innerHTML=cdList()}
document.addEventListener('click',e=>{if(S.cd&&!e.target.closest('.cs')){S.cd=false;if(S.page=='settings')render()}});
const EXD=[
['Analytics','Analitik',0],['Journal','Jurnal',0],['Add Trade','Tambah Trade',0],['Strategies','Strategi',0],['Notes','Catatan',0],['P&L Calendar','Kalender P&L',0],['Settings','Pengaturan',0],
['Account','Akun',0],['Accounts','Akun',0],['Collapse','Ciutkan',0],['+ Add Trade','+ Tambah Trade',0],['Toggle theme','Ganti tema',0],['Hari ini',0,'Today'],
['Belum ada trade di akun ini.',0,'No trades in this account yet.'],['Analytics muncul setelah ada trade.',0,'Analytics will appear once you add trades.'],['Strategi muncul otomatis dari data Journal.',0,'Strategies appear automatically from your Journal data.'],['+ Add your first trade','+ Tambah trade pertamamu',0],['Tidak ada trade yang cocok.',0,'No matching trades.'],
['Current Equity','Equity Saat Ini',0],['Weekly P&L','P&L Mingguan',0],['Monthly P&L','P&L Bulanan',0],['Average RR','Rata-rata RR',0],['Total Trades','Total Trade',0],['Winning / Losing','Menang / Kalah',0],['Biggest Win','Profit Terbesar',0],['Biggest Loss','Loss Terbesar',0],['Equity Curve','Kurva Equity',0],['Weekly','Mingguan',0],['Monthly','Bulanan',0],['All Time','Sepanjang Waktu',0],['Trade Terakhir',0,'Recent Trades'],
['Arahkan kursor atau sentuh grafik untuk melihat detail harian.',0,'Hover or touch the chart to see daily details.'],
['Average Win','Rata-rata Win',0],['Average Loss','Rata-rata Loss',0],['Best Session','Sesi Terbaik',0],['Worst Session','Sesi Terburuk',0],['Performance by Session','Performa per Sesi',0],['Performance by Symbol','Performa per Simbol',0],['Performance by Confluence','Performa per Konfluensi',0],['Performance by Emotion','Performa per Emosi',0],
['Outside Session','Di Luar Sesi',0],['Disciplined','Disiplin',0],['Calm','Tenang',0],['Confident','Percaya Diri',0],['Greedy','Serakah',0],['Fearful','Takut',0],['Gambling','Berjudi',0],['Other','Lainnya',0],
['Search symbol, strategy…','Cari simbol, strategi…',0],['All','Semua',0],['All sessions','Semua sesi',0],['Date','Tanggal',0],['Symbol','Simbol',0],['Dir','Arah',0],['Session','Sesi',0],['Strategy','Strategi',0],['Shot','Gambar',0],['Result','Hasil',0],['Action','Aksi',0],['Delete','Hapus',0],['‹ Prev','‹ Sebelumnya',0],['Next ›','Selanjutnya ›',0],
['Basic Mode','Mode Dasar',0],['Pro Mode','Mode Pro',0],['Trading Pair / Symbol','Pair Trading / Simbol',0],['Date (YYYY-MM-DD)','Tanggal (YYYY-MM-DD)',0],['Entry Price','Harga Entry',0],['Exit Price','Harga Exit',0],['Lot Size','Ukuran Lot',0],
['Strategy (otomatis masuk ke menu Strategies)','Strategi (otomatis masuk ke menu Strategi)','Strategy (automatically added to the Strategies menu)'],
['Trading Session','Sesi Trading',0],['Emotion','Emosi',0],['Confluence (ketik lalu Enter)','Konfluensi (ketik lalu Enter)','Confluence (type, then press Enter)'],['Remove','Hapus',0],
['Save Trade','Simpan Trade',0],['Update Trade','Perbarui Trade',0],['Cancel','Batal',0],
['mis. 1515 atau -200',0,'e.g. 1515 or -200'],['mis. 2.4',0,'e.g. 2.4'],['mis. London Sweep + FVG',0,'e.g. London Sweep + FVG'],['mis. FVG, SMT, Order Block',0,'e.g. FVG, SMT, Order Block'],
['← Semua strategi',0,'← All strategies'],['Trades','Trade',0],['Net P&L','P&L Bersih',0],['Avg RR','Rata-rata RR',0],['No screenshot','Tanpa screenshot',0],
['Tulis catatan baru…',0,'Write a new note…'],['Add Note','Tambah Catatan',0],['Pin','Sematkan',0],['Unpin','Lepas',0],
['Trading Days','Hari Trading',0],['Winning Days','Hari Profit',0],['Weekly P&L (terbaru)','P&L Mingguan (terbaru)','Weekly P&L (latest)'],['Tidak ada trade di tanggal ini.',0,'No trades on this date.'],['Economic News','Berita Ekonomi',0],['Belum ada news di tanggal ini.',0,'No news on this date yet.'],['Jam 19:30',0,'Time 19:30'],['Event, mis. Non-Farm Payrolls',0,'Event, e.g. Non-Farm Payrolls'],['Actual','Aktual',0],['Forecast','Perkiraan',0],['Previous','Sebelumnya',0],['+ Tambah news',0,'+ Add news'],['Import JSON','Impor JSON',0],['Kalender Ekonomi · Myfxbook',0,'Economic Calendar · Myfxbook'],['Buka Myfxbook ↗',0,'Open Myfxbook ↗'],['Semua',0,'All'],['Medium+High','Sedang+Tinggi',0],['High','Tinggi',0],['Medium','Sedang',0],['Low','Rendah',0],
['Print Certificate','Cetak Sertifikat',0],['Open trade','Buka trade',0],['Download PNG','Unduh PNG',0],['Print','Cetak',0],['Close','Tutup',0],
['Edit Akun',0,'Edit Account'],['Tambah Akun',0,'Add Account'],['Nama Akun',0,'Account Name'],['Balance Awal',0,'Starting Balance'],['Tipe Drawdown',0,'Drawdown Type'],['Static (tetap dari balance awal)',0,'Static (fixed from starting balance)'],['Trailing (ikut equity tertinggi)',0,'Trailing (follows highest equity)'],['Tipe Akun',0,'Account Type'],['Simpan',0,'Save'],['Hapus Akun',0,'Delete Account'],['mis. Apex 50K',0,'e.g. Apex 50K'],['0 = tanpa target',0,'0 = no target'],
['Hanya trade akun ini yang dihapus. Akun lain aman.',0,"Only this account's trades are deleted. Other accounts are safe."],['Ya, reset',0,'Yes, reset'],['Batal',0,'Cancel'],
['Penyimpanan penuh, export data kamu',0,'Storage full, export your data'],['File harus berupa gambar',0,'File must be an image'],['Gambar tidak bisa dibaca',0,'Image could not be read'],['Isi nama event',0,'Enter an event name'],['News ditambahkan',0,'News added'],['Isi Symbol dulu',0,'Enter a symbol first'],['Trade dihapus',0,'Trade deleted'],['Menyiapkan sertifikat…',0,'Preparing certificate…'],['Gagal membuat gambar sertifikat',0,'Failed to create certificate image'],['Sertifikat diunduh (tanpa logo: buka lewat hosting/server agar logo ikut)',0,'Certificate downloaded (no logo: open via hosting/server to include the logo)'],['Sertifikat diunduh',0,'Certificate downloaded'],['Data akun direset',0,'Account data reset'],['Nama akun wajib diisi',0,'Account name is required'],['Balance, drawdown, dan target harus angka',0,'Balance, drawdown, and target must be numbers'],['Nama akun sudah dipakai',0,'Account name already in use'],['Akun disimpan',0,'Account saved'],['Minimal harus ada 1 akun',0,'At least 1 account is required'],['Akun dihapus',0,'Account deleted'],['File diexport',0,'File exported'],['File JSON tidak valid',0,'Invalid JSON file'],['Format tidak dikenali',0,'Unrecognized format'],['Import berhasil',0,'Import successful'],['News diimport',0,'News imported']
];
const SBD=[
['Balance awal',0,'Starting balance'],['Starting balance','Saldo awal',0],['Daily P&L','P&L Harian',0],['Sisa ruang:',0,'Remaining room:'],['Sisa:',0,'Remaining:'],['Belum diatur',0,'Not set'],['Target tercapai',0,'Target reached'],['Atur di Settings → Accounts','Atur di Pengaturan → Akun','Set in Settings → Accounts'],
['halaman',0,'page'],['Editing trade #','Mengedit trade #',0],['Akun:',0,'Account:'],['Data tetap tersimpan saat pindah mode',0,'Data is kept when switching modes'],
['Widget resmi Myfxbook tampil di sini (butuh internet dan hosting yang mengizinkan iframe).',0,'The official Myfxbook widget is shown here (requires internet and a host that allows iframes).'],
['Myfxbook tidak menyediakan API publik, jadi data yang ingin tampil di kalender P&L dicatat lewat form di atas atau Import JSON.',0,'Myfxbook has no public API, so data you want on the P&L calendar is entered through the form above or via JSON import.']
].sort((a,b)=>b[0].length-a[0].length);
const TRX=new Map(EXD.map(r=>[r[0],r])),ORG=new WeakMap(),SKIP='.cw,script,style';
function cv(s){const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s),b=m[2];if(!b)return s;const k=S.lang=='en'?1:0,pk=r=>r[k+1]===0?r[0]:r[k+1];let r=TRX.get(b),x='';
if(!r){const q=/^(.+?)(\s[↑↓])$/.exec(b);if(q&&TRX.has(q[1])){r=TRX.get(q[1]);x=q[2]}}
if(r)return m[1]+pk(r)+x+m[3];let o=b;for(const r2 of SBD)if(o.includes(r2[0]))o=o.split(r2[0]).join(pk(r2));return m[1]+o+m[3]}
function tn(n){const p=n.parentElement;if(!p||p.closest(SKIP+',textarea'))return;if(!ORG.has(n))ORG.set(n,n.nodeValue);const o=cv(ORG.get(n));if(o!==n.nodeValue)n.nodeValue=o}
function ta(el){['placeholder','title'].forEach(a=>{if(el.hasAttribute&&el.hasAttribute(a)){if(!el._o)el._o={};if(!(a in el._o))el._o[a]=el.getAttribute(a);const o=cv(el._o[a]);if(o!==el.getAttribute(a))el.setAttribute(a,o)}})}
function walk(n){if(n.nodeType==3)return tn(n);if(n.nodeType!=1)return;if(n.closest&&n.closest(SKIP))return;ta(n);const w=document.createTreeWalker(n,5);let c;while(c=w.nextNode())c.nodeType==3?tn(c):ta(c)}
function setLang(l){S.lang=l;document.documentElement.lang=l;walk(document.body)}
function i18nStart(){document.documentElement.lang=S.lang;new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(walk))).observe(document.body,{childList:true,subtree:true});walk(document.body)}
load();theme(S.theme);i18nStart();accSel();render();


/* ===== addon.js (dimuat SETELAH kode di atas) ===== */
(()=>{
const CK=KEY+'_cust',
D={ex:['Target hit','Stop loss','Break even','Time stop','Manual exit'],pb:['Reversal','Continuation','Retracement','Manipulation'],lq:['Liquidity sweep','Equal highs','Equal lows','Session liquidity','Major high','Major low'],cf:['FVG','Order block','Breaker','Equilibrium','Imbalance','Liquidity sweep'],cm:['iFVG','Market structure shift','Retest','Rejection'],bn:['SMT','CISD','Displacement'],ps:['Patient','Disciplined','Focused','Calm','Confident','Rule-Following','Selective','Prepared'],ng:['Fomo','Revenge','Overconfident','Impatient','Fearful','Greedy','Distracted','Frustrated','Anxious']};
let C={};try{C=JSON.parse(localStorage.getItem(CK)||'{}')}catch(e){}
const cu=k=>C[k]||(C[k]=[]),opts=k=>D[k].concat(cu(k)),svC=()=>{try{localStorage.setItem(CK,JSON.stringify(C))}catch(e){}},
A=k=>S.form[k]||(S.form[k]=[]),IM=x=>x.imgs&&x.imgs.length?x.imgs:(x.shot?[x.shot]:[]);

/* ---------- gambar (banyak) ---------- */
const cmp=(f,cb)=>{if(!f||!f.type.startsWith('image/'))return toast('File harus berupa gambar');const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,1100/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.75))};im.onerror=()=>toast('Gambar tidak bisa dibaca');im.src=r.result};r.readAsDataURL(f)};
window.setShot=(k,f)=>cmp(f,u=>{A('imgs').push(u);render()});
window.addImgs=fl=>[...fl].forEach(f=>setShot(0,f));
window.addLink=()=>{const v=$('#lk').value.trim();if(!/^https?:\/\//.test(v))return toast('Isi link gambar yang valid (https://…)');A('imgs').push(v);S.pt='up';render()};
window.rmImg=i=>{A('imgs').splice(i,1);render()};
window.lbI=src=>modal(`<div class="row sp" style="margin-bottom:12px"><span></span><button class="ib" onclick="closeM()">✕</button></div><img src="${esc(src)}" style="width:100%;border-radius:10px;display:block">`,1);
const pics=()=>{const a=A('imgs'),lk=S.pt=='link';return`<div class="f"><label>Pictures</label><div class="seg" style="margin-bottom:10px"><button type="button" class="${lk?'':'on'}" onclick="S.pt='up';render()">Upload</button><button type="button" class="${lk?'on':''}" onclick="S.pt='link';render()">Paste a link</button></div>${lk?`<div class="row"><input id="lk" placeholder="https://…" style="flex:1;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:11px 12px;outline:0"><button type="button" class="btn" onclick="addLink()">Add</button></div>`:`<div class="drop" ondragover="event.preventDefault();this.classList.add('ov')" ondragleave="this.classList.remove('ov')" ondrop="event.preventDefault();addImgs(event.dataTransfer.files)" onclick="this.querySelector('input').click()">${ic('up')}<div>Drop screenshots, or <b>choose files</b> · Ctrl/Cmd+V</div><input type="file" accept="image/*" multiple hidden onchange="addImgs(this.files);this.value=''"></div>`}${a.length?`<div class="thm">${a.map((s,i)=>`<div><img src="${esc(s)}"><button type="button" class="ib" onclick="rmImg(${i})">✕</button></div>`).join('')}</div>`:''}</div>`};

/* ---------- komponen form ---------- */
window.pick=(k,v,m)=>{if(m){const a=A(k),i=a.indexOf(v);i<0?a.push(v):a.splice(i,1)}else S.form[k]=S.form[k]==v?'':v;render()};
window.addC=(k,ck,m)=>{const v=$('#ad_'+k).value.trim();if(!v)return;if(!opts(ck).includes(v)){cu(ck).push(v);svC()}if(m){if(!A(k).includes(v))A(k).push(v)}else S.form[k]=v;render()};
const cp=(k,v,on,m)=>`<button type="button" class="chip ${on?'on':''}" data-v="${esc(v)}" onclick="pick('${k}',this.dataset.v,${m})">${esc(v)}</button>`,
chs=(k,ck,m)=>`<div class="chips">${opts(ck).map(v=>cp(k,v,m?A(k).includes(v):S.form[k]==v,m)).join('')}</div>`,
addr=(k,ck,m,ph)=>`<div class="adr"><input id="ad_${k}" placeholder="${ph}" autocomplete="off" onkeydown="if(event.key=='Enter')addC('${k}','${ck}',${m})"><button type="button" class="ib" onclick="addC('${k}','${ck}',${m})">Add</button></div>`,
I=(n,l,p,m='decimal',t='')=>`<div class="f"><label>${l}</label><input ${t} inputmode="${m}" autocomplete="off" placeholder="${p}" value="${esc(S.form[n])}" oninput="S.form.${n}=this.value"></div>`,
sl=(k,o,l)=>`<div class="f"><label>${l}</label><select onchange="S.form.${k}=this.value">${o.map(v=>`<option ${(S.form[k]||o[0])==v?'selected':''}>${v}</option>`).join('')}</select></div>`,
lst=(k,l)=>`${A(k).map((v,i)=>`<div class="adr"><input value="${esc(v)}" placeholder="price / size" oninput="S.form.${k}[${i}]=this.value"><button type="button" class="ib" onclick="S.form.${k}.splice(${i},1);render()">✕</button></div>`).join('')}<button type="button" class="chip add" style="margin-top:8px" onclick="S.form.${k}.push('');render()">+ ${l}</button>`,
sec=(t,b,adv)=>`<div class="card" style="margin-top:14px"><div class="sct">${t}${adv?'<span class="adv">ADVANCED</span>':''}</div>${b}</div>`,
tog=()=>`<div class="row sp" style="margin-bottom:14px"><div class="seg"><button class="${S.mode!='pro'?'on':''}" onclick="S.mode='basic';render()">Basic Mode</button><button class="${S.mode=='pro'?'on':''}" onclick="S.mode='pro';render()">Pro Mode</button></div><span class="sm">${S.edit?'Editing trade #'+S.edit:''}</span></div>`;

const pro=()=>{const f=S.form;return tog()+
sec('Trade Info',`${I('sym','Symbol','MNQ, SPY…','text')}${I('strat','Strategy (otomatis masuk ke menu Strategies)','mis. London Sweep + FVG','text','list="sl"')}<datalist id="sl">${groups().map(g=>`<option value="${esc(g.n)}">`).join('')}</datalist>${I('date','Date (YYYY-MM-DD)','','text')}<div class="grid ge">${sl('ac',['Futures','Forex','Indices','Stocks','Crypto','Commodities'],'Asset Class')}${sl('tt',['Scalp','Day Trade','Swing'],'Trade Type')}</div><div class="f"><label>Direction</label><div class="seg" style="display:flex">${[['Buy','↑ Long'],['Sell','↓ Short']].map(r=>`<button type="button" style="flex:1;justify-content:center" class="${f.dir==r[0]?'on':''}" onclick="S.form.dir='${r[0]}';render()">${r[1]}</button>`).join('')}</div></div><div class="f"><label>Session</label><div class="chips">${['Asia','London','NY AM','NY PM','No session'].map(v=>cp('sess',v,f.sess==v,0)).join('')}</div></div><div class="f"><label>Followed my plan</label><div class="chips">${['Yes','No'].map(v=>cp('plan',v,f.plan==v,0)).join('')}</div></div><div class="sm">Account: <b>${esc(S.acc)}</b> · <a href="#" onclick="accM(S.acc);return false">Manage</a></div>`)+
sec('Execution',`<div class="grid ge">${I('entry','Entry Price','0.00')}${I('exit','Exit Price','0.00')}${I('pnl','P&L','+500 or -200')}${I('lot','Size / Qty','1')}${I('prr','Planned R:R','e.g. 2.0')}${I('rr','Realized R:R','e.g. 2.5')}${I('et','Entry Time','HH:MM:SS','text')}${I('xt','Exit / Close Time','HH:MM:SS','text')}${I('sl','Stop Loss','0.00')}${I('tp','Target','0.00')}</div><div class="grid ge"><div class="f"><label>Partials</label>${lst('par','Add partial')}</div><div class="f"><label>Add-ons</label>${lst('add','Add add-on')}</div></div><div class="grid ge">${I('mae','MAE (max adverse, optional)','Against you, in $')}${I('mfe','MFE (max favorable, optional)','In your favour, in $')}</div><div class="f"><label>Exit Reason</label>${chs('xr','ex',0)}${addr('xr','ex',0,'Add your own exit reason…')}</div>`)+
sec('Playbook',chs('pb','pb',0)+addr('pb','pb',0,'Add your own playbook…'),1)+
sec('Liquidity Target',`<p class="sm" style="margin:0 0 10px">What were you targeting? The magnet this trade was built to reach.</p>${chs('lq','lq',1)}${addr('lq','lq',1,'Add a target…')}`,1)+
sec('Breakdown',[['Confluences','cf','#a855f7'],['Confirmations','cm','#3b82f6'],['Bonus','bn','#f59e0b']].map(r=>`<div class="bh" style="color:${r[2]}">${r[0].toUpperCase()}</div>${chs(r[1],r[1],1)}${addr(r[1],r[1],1,'+ Add')}`).join(''),1)+
sec('Post-loss Entry',sl('pl',['No revenge trade','Revenge trade','Re-entry (planned)'],'Post-loss entry (revenge trade?)'),1)+
sec('Emotions & Psychology',`<div class="bh">POSITIVE, WHAT KEPT YOU DISCIPLINED?</div>${chs('ps','ps',1)}${addr('ps','ps',1,'Add your own…')}<div class="bh" style="margin-top:18px">NEGATIVE, WHAT HURT THIS TRADE?</div>${chs('ng','ng',1)}${addr('ng','ng',1,'Add your own…')}`,1)+
sec('Performance',`<div class="bh" style="margin-top:0">TRADE GRADE</div><div class="chips">${['A+','A','B','C','F'].map(v=>cp('gr',v,f.gr==v,0)).join('')}</div>`)+
sec('Pictures',pics())+
sec('Notes',`<textarea rows="5" style="width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:11px;outline:0" placeholder="Explain your trade, entry, and insights. What happened? What did you do well? What would you do differently?" oninput="S.form.notes=this.value">${esc(f.notes)}</textarea>`)+
`<div class="row" style="margin-top:14px"><button class="btn y" style="flex:1" onclick="saveTrade()">${S.edit?'Update Trade':'Save Trade'}</button>${S.edit?'<button class="btn dg" onclick="del(S.edit);S.edit=null;S.form=nf();go(\'journal\')">Delete</button>':''}<button class="btn sec" onclick="S.edit=null;S.form=nf();S.tags=[];go('journal')">Cancel</button></div>`};

const _add=V.add;
V.add=()=>{if(S.mode=='pro')return pro();const h=_add(),i=h.indexOf('<div class="f"><label>Screenshot</label>'),j=h.indexOf('<div class="f"><label>Notes</label>');return i>0&&j>i?h.slice(0,i)+pics()+h.slice(j):h};

/* ---------- simpan / edit ---------- */
window.saveTrade=()=>{const f=S.form;if(!f.sym)return toast('Isi Symbol dulu');
const n=v=>{const x=parseFloat(String(v||'').replace(',','.'));return isNaN(x)?0:x},t=T(),p=S.mode=='pro',im=A('imgs').slice(),cf=p?[...A('cf'),...A('cm'),...A('bn')]:[],
o={sym:f.sym.toUpperCase(),dir:f.dir,date:f.date||TODAY,entry:f.entry||'–',exit:f.exit||'–',sl:f.sl||'–',tp:f.tp||'–',pnl:n(f.pnl),rr:n(f.rr),lot:n(f.lot),sess:f.sess,emo:p?(A('ng')[0]||A('ps')[0]||'Disciplined'):f.emo,conf:cf.length?cf:S.tags.slice(),strat:f.strat||'Unassigned',note:f.notes||'',imgs:im,shot:im[0]||null,f:{...f,imgs:undefined}};
if(S.edit)Object.assign(t.find(x=>x.id==S.edit),o);else t.push({id:Math.max(0,...t.map(x=>x.id))+1,...o});
S.cm=[+o.date.slice(0,4)||+TODAY.slice(0,4),(+o.date.slice(5,7)||+TODAY.slice(5,7))-1];S.sel=o.date;const was=S.edit;S.edit=null;S.form=nf();S.tags=[];toast(was?L('Trade diperbarui','Trade updated'):L('Trade ditambahkan','Trade added'));go('journal');setTimeout(notify,2400)};
window.editTrade=id=>{const x=T().find(y=>y.id==id);S.form={sym:x.sym,dir:x.dir,date:x.date,entry:x.entry,exit:x.exit,sl:x.sl,tp:x.tp,pnl:String(x.pnl),rr:String(x.rr),lot:String(x.lot),sess:x.sess,emo:x.emo,strat:x.strat,notes:x.note,...(x.f||{}),imgs:IM(x).slice()};S.tags=x.conf.slice();S.edit=id;closeM();go('add')};
const _d=window.detail;
window.detail=id=>{_d(id);const x=T().find(y=>y.id==id),a=IM(x),f=x.f||{},mb=$('#mb'),tg=[f.pb,...(f.lq||[]),f.gr&&'Grade '+f.gr,f.plan&&'Plan: '+f.plan,f.tt,f.ac].filter(Boolean);
if(!tg.length&&a.length<2)return;[...mb.children].pop().insertAdjacentHTML('beforebegin',`<div class="tags" style="margin:0 0 14px">${tg.map(c=>`<span class="tag sug">${esc(c)}</span>`).join('')}</div>${a.length>1?`<div class="thm" style="margin:0 0 14px">${a.slice(1).map(s=>`<img src="${esc(s)}" onclick="lbI(this.src)">`).join('')}</div>`:''}`)};

/* ---------- halaman Strategies ---------- */
const all=s=>s.a.flatMap(x=>IM(x).map(src=>({src,x}))),
top=(a,k)=>{const m={};a.forEach(x=>m[x[k]]=(m[x[k]]||0)+1);return Object.entries(m).sort((p,q)=>q[1]-p[1])[0][0]},
dS=s=>{const im=all(s),i=Math.min(S.si||0,Math.max(0,im.length-1)),c=im[i];
return`<button class="ib" onclick="S.strat=null;render()" style="margin-bottom:14px">← Semua strategi</button><div class="eb">STRATEGY</div><h2 class="hx" style="font-size:clamp(28px,4vw,40px)">${esc(s.n)}</h2><div class="row" style="margin-bottom:14px">${s.cf.map(c=>`<span class="tag sug">${esc(c)}</span>`).join('')}</div>
<div class="grid g4">${card('Trades',s.s.n)}${card('Win Rate',s.s.wr+'%')}${card('Net P&L',fm(s.s.tot),cls(s.s.tot))}${card('Avg RR',s.s.rr)}</div>
<div class="grid g2" style="margin-top:14px"><div class="card">${c?`<img src="${esc(c.src)}" class="hero" onclick="lbI(this.src)"><div class="row sp"><span class="sm">${esc(c.x.sym)} · ${c.x.date}</span><b class="${cls(c.x.pnl)}">${fm(c.x.pnl)}</b></div><div class="thm">${im.map((m,k)=>`<img class="${k==i?'on':''}" src="${esc(m.src)}" onclick="S.si=${k};render()">`).join('')}</div>`:'<div class="empty">No screenshot</div>'}</div>
<div class="card"><div class="lab" style="margin-bottom:8px">${L('Penjelasan / Rules strategi','Explanation / Strategy rules')}</div><textarea style="width:100%;background:var(--sf2);border:1px solid var(--bd);border-radius:10px;padding:11px;outline:0" rows="6" placeholder="Tulis aturan entry, risk, dan konfirmasi…" oninput="S.rules[S.strat]=this.value;save()">${esc(S.rules[s.n])}</textarea><div class="lab" style="margin:18px 0 6px">Trades</div>${s.a.slice().reverse().map(x=>`<div class="row sp" style="padding:9px 0;border-top:1px solid var(--bd);cursor:pointer" onclick="detail(${x.id})"><span>${esc(x.sym)} <span class="sm">${x.date.slice(5)} · ${x.dir}</span></span><b class="${cls(x.pnl)}">${fm(x.pnl)}</b></div>`).join('')}</div></div>`};
V.strategies=()=>{const g=groups();if(!g.length)return empty('Strategi muncul otomatis dari data Journal.');
if(S.strat){const s=g.find(x=>x.n==S.strat);if(s)return dS(s);S.strat=null}
return`<div class="eb">STRATEGIES</div><h2 class="hx">${L('Setup favoritku.','My favorite setups.')}</h2><p class="sub">${L('Setup trading yang sering saya pakai. Klik kartu untuk melihat chart dan penjelasannya.','Trading setups I use often. Click a card to see the chart and its explanation.')}</p><div class="sg">${g.map((s,i)=>{const im=all(s),cv=im.length?im[im.length-1].src:'',d=top(s.a,'dir');
return`<div class="sc2" onclick="S.strat=groups()[${i}].n;S.si=0;render()"><div class="simg">${cv?`<img src="${esc(cv)}" loading="lazy">`:'<div class="no">No screenshot</div>'}</div><div class="sbd"><h3>${esc(s.n)} · ${esc(top(s.a,'sym'))}</h3><div class="stgs"><span class="stg ${d=='Buy'?'buy':'sell'}">${d.toUpperCase()}</span><span class="stg">${esc(top(s.a,'sess'))}</span>${+s.s.rr?`<span class="stg">+${s.s.rr}R</span>`:''}</div><div class="sm" style="margin-top:12px">${s.s.n} trade · WR ${s.s.wr}% · <b class="${cls(s.s.tot)}">${fm(s.s.tot)}</b></div></div></div>`}).join('')}</div>`};
render();
})();

/* ===== ACCOUNT PAGE + TAUTKAN BROKER ===== */
/* Isi dengan URL backend kamu. Kosong = mode demo (data contoh). */
const BROKER_API='';
const BKS=[['MT5','M5','#2f6fbf','mt','API'],['MT4','M4','#2f6fbf','mt','API'],['cTrader','cT','#c9302c','mt','API'],['TradingView','TV','#2b2b33','csv','CSV'],['MatchTrader','MT','#0e8a8a','mt','API'],['TradeLocker','TL','#2b2b33','mt','API'],['Binance','Bn','#b8901a','api','API'],['Bybit','By','#444','api','API'],['Coinbase','Cb','#1652f0','api','API'],['Kraken','Kr','#5741d9','api','API'],['Interactive Brokers','IB','#b31b1b','api','API'],['Bitunix','Bx','#5a9a1a','api','API']];
const ATABS=[['all','Semua akun'],['broker','Tautkan broker'],['manual','Akun manual'],['log','Log sinkronisasi']];
S.at='broker';
const BM={p:0,s:null};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const bacc=()=>Object.keys(ACC).filter(k=>ACC[k].br),macc=()=>Object.keys(ACC).filter(k=>!ACC[k].br);
const agoT=t=>{if(!t)return '–';const m=Math.round((Date.now()-t)/6e4);return m<1?'Baru saja':m<60?m+' menit lalu':m<1440?Math.round(m/60)+' jam lalu':Math.round(m/1440)+' hari lalu'};
function blog(n,m){const b=ACC[n].br;b.log=b.log||[];b.log.unshift({t:Date.now(),m});b.log.length=Math.min(b.log.length,30)}
function atab(t){S.at=t;render()}

const accRow=a=>{const x=ACC[a],b=x.br;return`<div class="row sp" style="padding:11px 0;border-bottom:1px solid var(--bd)"><span>${esc(a)} ${b?`<span class="pill w">${esc(b.name)}${b.demo?' · Demo':''}</span>`:''} <span class="sm">${fa(x.bal)} · ${x.type} · DD ${fa(x.dd)} ${x.ddType=='trailing'?'Trailing':'Static'}${x.target?' · Target '+fa(x.target):''} · ${x.t.length} trade</span></span><button class="ib" data-a="${esc(a)}" onclick="accM(this.dataset.a)">Edit</button></div>`};

const brCard=n=>{const a=ACC[n],b=a.br,k=esc(n);return`<div class="card" style="margin-bottom:12px"><div class="row sp"><div class="row"><span class="bi" style="background:${b.c}">${b.ab}</span><div><b>${k}</b> ${b.demo?'<span class="pill l">Demo</span>':''}<div class="sm">${esc(b.name)} · ${b.login?'Login '+esc(b.login)+' · ':''}${fa(a.bal)}</div></div></div><span class="sm ${b.err?'rd':'gn'}">● ${b.err?'Gagal sinkron':'Tersinkron'}</span></div>
<div class="row sp" style="margin:14px 0;padding-top:12px;border-top:1px solid var(--bd)"><span class="sm">Sinkron terakhir: ${agoT(b.last)} · ${a.t.length} trade</span><span class="row sm">Sinkron otomatis <button class="tgl ${b.auto?'on':''}" data-a="${k}" onclick="bAuto(this.dataset.a)"></button></span></div>
<div class="row"><button class="btn sec" data-a="${k}" onclick="bSync(this.dataset.a).then(()=>toast('Sinkronisasi selesai'))">Sync sekarang</button><button class="btn sec" data-a="${k}" onclick="bCsv(this.dataset.a)">Impor CSV</button><button class="btn sec" data-a="${k}" onclick="S.acc=this.dataset.a;accSel();go('journal')">Lihat di Journal</button><button class="btn dg" data-a="${k}" onclick="bUnlink(this.dataset.a)">Putuskan</button></div></div>`};

V.account=()=>{
const tabs=`<div class="seg" style="margin-bottom:16px;flex-wrap:wrap">${ATABS.map(t=>`<button class="${S.at==t[0]?'on':''}" onclick="atab('${t[0]}')">${t[1]}</button>`).join('')}</div>`;
const B=bacc(),M=macc();let h='';
if(S.at=='all')h=`<div class="grid g3" style="margin-bottom:14px">${card('Total akun',Object.keys(ACC).length)}${card('Terhubung broker',B.length)}${card('Manual',M.length)}</div><div class="card">${Object.keys(ACC).map(accRow).join('')}<div class="row" style="margin-top:14px"><button class="btn y" onclick="brOpen()">Tautkan broker</button><button class="btn sec" onclick="accM()">+ Akun manual</button></div></div>`;
if(S.at=='broker')h=`<div class="row sp" style="margin-bottom:14px"><div><b>Akun terhubung broker</b><div class="sm">Trade dari broker masuk otomatis ke Journal.</div></div><button class="btn y" onclick="brOpen()">+ Tautkan broker</button></div>${BROKER_API?'':'<div class="card sm" style="margin-bottom:12px">Mode demo: backend belum diatur (<b>BROKER_API</b> kosong), jadi trade yang masuk hanya data contoh. Untuk data asli, pakai tombol Impor CSV di kartu akun.</div>'}${B.length?B.map(brCard).join(''):`<div class="card empty"><div style="font-size:30px">◌</div><p>Belum ada broker terhubung.</p><button class="btn y" onclick="brOpen()">Tautkan broker</button></div>`}`;
if(S.at=='manual')h=`<div class="card"><b>Akun</b>${M.length?M.map(accRow).join(''):'<p class="sm">Belum ada akun manual.</p>'}<button class="btn sec" style="margin-top:14px" onclick="accM()">+ Tambah Akun</button></div>`;
if(S.at=='log'){const lg=B.flatMap(n=>(ACC[n].br.log||[]).map(l=>({...l,n}))).sort((a,b)=>b.t-a.t);h=`<div class="card"><b>Riwayat sinkronisasi</b>${lg.length?lg.map(l=>`<div class="row sp" style="padding:9px 0;border-bottom:1px solid var(--bd)"><span><span class="gn">●</span> ${esc(l.n)} · ${esc(l.m)}</span><span class="sm">${new Date(l.t).toLocaleString('id-ID')}</span></div>`).join(''):'<p class="sm">Belum ada aktivitas. Tautkan broker untuk memulai.</p>'}</div>`}
return tabs+h};

/* ---------- modal: pilih platform ---------- */
function brOpen(){BM.p=0;BM.s=null;brPick()}
function brPick(){const s=BM.p*8,l=BKS.slice(s,s+8);
modal(`<div class="row sp" style="margin-bottom:14px"><b style="font-size:18px">Pilih platform trading</b><button class="ib" onclick="closeM()">✕</button></div>
<div class="grid ge" style="gap:8px">${l.map((b,i)=>`<button class="bk" onclick="brForm(${s+i})"><span class="bi" style="background:${b[2]}">${b[1]}</span><span style="flex:1"><b>${b[0]}</b><br><span class="bd2">${b[4]}</span></span>›</button>`).join('')}</div>
<button class="bk" style="width:100%;margin-top:8px" onclick="closeM();S.at='manual';go('account');accM()"><span class="bi" style="background:var(--sf)">＋</span><span style="flex:1"><b>Tambah akun manual</b><br><span class="sm">Catat trade tanpa menautkan broker</span></span>›</button>
<div class="row sp" style="margin-top:12px"><span class="sm">Halaman ${BM.p+1} dari 2</span><span class="row"><button class="ib" onclick="BM.p=0;brPick()">‹</button><button class="ib" onclick="BM.p=1;brPick()">›</button></span></div>`)}

/* ---------- modal: form per tipe platform ---------- */
function brForm(i){const b=BKS[i],t=b[3];BM.s=b;
modal(`<div class="row sp" style="margin-bottom:14px"><span class="row"><button class="ib" onclick="brPick()">‹</button><span class="bi" style="background:${b[2]}">${b[1]}</span><b style="font-size:17px">Tautkan ${b[0]}</b></span><button class="ib" onclick="closeM()">✕</button></div>
${t=='mt'?`<div class="grid ge"><div class="f"><label>Server broker</label><input id="bsv" placeholder="Exness-MT5Real"></div><div class="f"><label>Nomor login</label><input id="blg" inputmode="numeric" placeholder="12345678"></div></div><div class="f"><label>Password investor (read-only)</label><input id="bpw" type="password" autocomplete="off"></div>`:''}
${t=='api'?`<div class="f"><label>API key (read-only)</label><input id="bk" autocomplete="off"></div><div class="f"><label>API secret</label><input id="bsc" type="password" autocomplete="off"></div>`:''}
${t=='csv'?`<p class="sm">Akun dibuat dulu, lalu impor file CSV lewat tombol Impor CSV di kartu akun.</p>`:''}
<div class="grid ge"><div class="f"><label>Nama akun di jurnal</label><input id="bnm" placeholder="${b[0]} Live"></div><div class="f"><label>Tipe akun</label><select id="bty">${TYPES.map(x=>`<option>${x}</option>`).join('')}</select></div></div>
<div class="grid ge"><div class="f"><label>Balance awal</label><input id="bbal" inputmode="decimal" placeholder="10000"></div><div class="f"><label>Impor riwayat</label><select id="bimp"><option value="30">30 hari terakhir</option><option value="90">90 hari terakhir</option><option value="0">Semua riwayat</option></select></div></div>
<div class="f"><label>Sinkron otomatis</label><select id="bau"><option value="1">Aktif</option><option value="0">Nonaktif</option></select></div>
<p class="sm">Hanya akses baca. Password dan secret dikirim sekali ke server saat koneksi dan tidak disimpan di browser.</p>
<button class="btn y" style="width:100%" onclick="brConn()">Hubungkan akun</button>`)}

function brProg(s,err){const st=['Menghubungkan ke '+BM.s[0],'Memverifikasi akses baca','Mengimpor riwayat trade','Menyelaraskan dengan Journal'];
modal(`<b style="font-size:17px">Menautkan akun</b><div style="margin:14px 0">${st.map((x,i)=>`<div class="bst ${s>i?'ok':''}">${s>i?'✓':s==i&&!err?'…':'○'} ${x}</div>`).join('')}</div>${err?`<p class="rd sm">${esc(err)}</p><button class="btn sec" onclick="brForm(${BKS.indexOf(BM.s)})">Kembali</button>`:''}`)}

async function brConn(){
const b=BM.s,v=id=>($('#'+id)||{}).value||'',nm=v('bnm').trim()||b[0]+' Live';
if(b[3]=='mt'&&!v('blg').trim())return toast('Isi nomor login dulu');
if(b[3]=='api'&&!v('bk').trim())return toast('Isi API key dulu');
if(ACC[nm])return toast('Nama akun sudah dipakai');
const bal=parseFloat(v('bbal'))||10000,days=+v('bimp'),ty=v('bty');
const cfg={name:b[0],ab:b[1],c:b[2],type:b[3],login:v('blg').trim(),server:v('bsv').trim(),auto:v('bau')=='1',demo:!BROKER_API,last:0,log:[]};
const pw=v('bpw'),key=v('bk'),sec=v('bsc');
try{
brProg(0);
if(BROKER_API){const r=await fetch(BROKER_API+'/connect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:b[0],server:cfg.server,login:cfg.login,password:pw,apiKey:key,apiSecret:sec})});if(!r.ok)throw Error('Server menolak koneksi ('+r.status+')');cfg.rid=(await r.json()).id}else await sleep(700);
brProg(1);await sleep(600);
brProg(2);const raw=b[3]=='csv'?[]:await brFetch(cfg,days);
brProg(3);await sleep(500);
ACC[nm]={bal,dd:Math.round(bal*.1),type:ty,ddType:'static',target:0,t:[],br:cfg};
const n=brAdd(nm,raw);cfg.last=Date.now();blog(nm,'Tersambung, '+n+' trade diimpor');
S.acc=nm;S.at='broker';accSel();render();brDone(nm,n);
}catch(e){brProg(2,e.message||'Gagal terhubung')}}

function brDone(nm,n){modal(`<div style="text-align:center;padding:8px 0"><div style="font-size:34px" class="gn">✓</div><b style="font-size:17px">Broker berhasil tertaut</b><p class="sm" style="margin:6px 0 16px">${n} trade masuk ke Journal akun ${esc(nm)}. Trade baru akan masuk lewat sinkronisasi.</p><div class="row" style="justify-content:center"><button class="btn y" onclick="closeM();go('journal')">Lihat di Journal</button><button class="btn sec" onclick="closeM()">Selesai</button></div></div>`)}

/* ---------- data trade ---------- */
const demoT=()=>[['XAUUSD','buy',.2,212.5,4],['GBPJPY','sell',.3,96.8,3],['EURUSD','buy',.5,-48,2],['NAS100','buy',1,164.3,1],['USDJPY','sell',.4,-72.1,0]].map((x,i)=>({ticket:'D'+Date.now()+i,symbol:x[0],type:x[1],volume:x[2],profit:x[3],time:new Date(Date.now()-x[4]*864e5).toISOString().slice(0,10)+'T09:30'}));
async function brFetch(cfg,days){
if(BROKER_API){const r=await fetch(`${BROKER_API}/trades?id=${encodeURIComponent(cfg.rid)}&since=${days?new Date(Date.now()-days*864e5).toISOString():''}`);if(!r.ok)throw Error('Gagal mengambil trade ('+r.status+')');return await r.json()}
await sleep(900);return demoT()}
function mapT(r){const buy=/buy|long/i.test(r.type),e=+r.entry||0,x=+r.exit||0,sl=+r.sl||0,tp=+r.tp||0,risk=Math.abs(e-sl),rr=risk&&tp?+(Math.abs(tp-e)/risk).toFixed(1):0,t=String(r.time||''),d=t.slice(0,10),h=+t.slice(11,13)||12;
return{id:Date.now()+Math.floor(Math.random()*1e6),bid:String(r.ticket),src:'broker',sym:String(r.symbol||'').toUpperCase(),dir:buy?'Buy':'Sell',date:/^\d{4}-\d\d-\d\d$/.test(d)?d:TODAY,entry:e||'–',exit:x||'–',sl:sl||'–',tp:tp||'–',pnl:+r.profit||0,rr,lot:+r.volume||0,sess:h<7?'Asia':h<12?'London':'New York',emo:'Disciplined',conf:[],strat:'Unassigned',note:'',imgs:[],shot:null,f:{}}}
function brAdd(nm,raw){const a=ACC[nm],have=new Set(a.t.map(x=>x.bid).filter(Boolean));let n=0;raw.forEach(r=>{const id=String(r.ticket);if(have.has(id))return;have.add(id);a.t.push(mapT(r));n++});return n}

/* ---------- sync, toggle, putuskan ---------- */
async function bSync(nm){const a=ACC[nm];if(!a||!a.br)return;const b=a.br;
try{const raw=BROKER_API?await brFetch(b,b.last?Math.ceil((Date.now()-b.last)/864e5)+1:30):demoT().slice(0,1);const n=brAdd(nm,raw);b.last=Date.now();b.err=0;blog(nm,n?n+' trade baru masuk ke Journal':'Tidak ada trade baru')}
catch(e){b.err=1;blog(nm,'Gagal sinkron: '+e.message)}
if(S.page=='account')render();else save()}
function bAuto(nm){const b=ACC[nm].br;b.auto=!b.auto;render();toast('Sinkron otomatis '+(b.auto?'aktif':'nonaktif'))}
function bUnlink(nm){if(!confirm('Putuskan broker dari "'+nm+'"? Trade lama tetap tersimpan di Journal.'))return;const b=ACC[nm].br;if(BROKER_API&&b.rid)fetch(BROKER_API+'/connect/'+b.rid,{method:'DELETE'}).catch(()=>{});delete ACC[nm].br;render();toast('Broker diputus')}
setInterval(()=>{if(BROKER_API)bacc().forEach(n=>ACC[n].br.auto&&bSync(n))},60000);

/* ---------- impor CSV (jalur data asli tanpa backend) ---------- */
function parseCsv(t){
const rows=t.replace(/\r/g,'').split('\n').filter(x=>x.trim()).map(l=>l.split(/[;,\t]/).map(c=>c.replace(/^"|"$/g,'').trim()));
if(rows.length<2)return[];const h=rows[0].map(x=>x.toLowerCase()),ix=re=>h.findIndex(x=>re.test(x)),n=x=>parseFloat(String(x).replace(/\s/g,''))||0;
const ct=ix(/close.*time|time.*close/),c={ticket:ix(/ticket|position|deal|order/),time:ct>=0?ct:ix(/time|date/),sym:ix(/symbol|pair|instrument/),type:ix(/type|side|direction/),vol:ix(/volume|lot|size|qty/),pr:ix(/^profit|pnl|p&l|realized/),en:ix(/open.*price|entry/),ex:ix(/close.*price|exit/),sl:ix(/^s\/l|stop/),tp:ix(/^t\/p|take/)};
if(c.sym<0||c.pr<0||c.type<0)return[];
return rows.slice(1).map((r,i)=>{const g=k=>c[k]>=0?(r[c[k]]||''):'',tm=g('time').replace(/\./g,'-').replace(' ','T');return{ticket:g('ticket')||tm+g('sym')+g('pr')+i,time:tm,symbol:g('sym'),type:g('type'),volume:n(g('vol')),profit:n(g('pr')),entry:n(g('en')),exit:n(g('ex')),sl:n(g('sl')),tp:n(g('tp'))}}).filter(x=>/buy|sell|long|short/i.test(x.type))}
function bCsv(nm){const i=document.createElement('input');i.type='file';i.accept='.csv,text/csv';
i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const raw=parseCsv(r.result);if(!raw.length)return toast('Format CSV tidak dikenali');const n=brAdd(nm,raw);if(ACC[nm].br){ACC[nm].br.last=Date.now();blog(nm,'Impor CSV: '+n+' trade')}render();toast(n+' trade diimpor')}catch(e){toast('Gagal membaca CSV')}};r.readAsText(f)};i.click()}

/* ===== premium.js — dimuat SETELAH script.js =====
   Isi: tab Premium + Riwayat transaksi di menu Account, checkout bermerek ROAD TO JOURNAL,
   logo + efek blink untuk daftar broker, dan terjemahan Indonesia/Inggris untuk semuanya.
   Bahasa mengikuti pengaturan di Settings (S.lang); helper L(indonesia, english). */
(()=>{
/* Isi dengan URL backend payment gateway kamu. Kosong = mode demo.
   POST {PAY_API}/checkout -> {"url":"halaman-bayar-gateway"}
   GET  {PAY_API}/transactions -> daftar transaksi (lihat bagian riwayat) */
const PAY_API='';

/* ---------- data paket (harga IDR) ---------- */
const PLANS=[
{id:'basic',n:'BASIC',m:39000,y:390000,f:[['Dashboard dan Journal','Dashboard and Journal'],['Tambah Trade','Add Trade'],['Kalender P&L','P&L Calendar']]},
{id:'pro',n:'PRO',m:89000,y:890000,f:[['Semua fitur BASIC','All BASIC features'],['Analytics lanjutan','Advanced analytics'],['Multi-account','Multi-account'],['Upload screenshot','Screenshot upload']]},
{id:'ultra',n:'ULTRA',m:139000,y:1390000,best:1,f:[['Semua fitur PRO','All PRO features'],['Koneksi broker CFD','CFD broker connection'],['Sertifikat PNG','PNG certificate'],['Prioritas fitur baru','Priority for new features']]}];
const PMS=[['qris','QRIS','QRIS','Semua e-wallet dan m-banking','All e-wallets and mobile banking'],['va','Virtual Account','Virtual Account','BCA, BNI, BRI, Mandiri','BCA, BNI, BRI, Mandiri'],['ew','E-wallet','E-wallet','GoPay, OVO, DANA, ShopeePay','GoPay, OVO, DANA, ShopeePay'],['card','Kartu kredit / debit','Credit / debit card','Visa, Mastercard','Visa, Mastercard']];
const SUBK=KEY+'_sub';
let SUB=null;try{SUB=JSON.parse(localStorage.getItem(SUBK)||'null')}catch(e){}
const saveSub=()=>{try{localStorage.setItem(SUBK,JSON.stringify(SUB))}catch(e){}};
const loc=()=>S.lang=='en'?'en-US':'id-ID';
const idr=n=>'Rp'+n.toLocaleString(loc());
const plan=id=>PLANS.find(p=>p.id==id)||PLANS[2];
const price=(p,y)=>y?p.y:p.m;
const left=s=>Math.max(0,30-Math.floor((Date.now()-s.start)/864e5));
const per=y=>y?L('Tahunan','Yearly'):L('Bulanan','Monthly');
const mname=m=>m=='qris'?'QRIS':m=='va'?'Virtual Account':m=='ew'?'E-wallet':m=='card'?L('Kartu kredit / debit','Credit / debit card'):m;
const err=m=>toast(m,'err');

ATABS.push(['premium','Premium']);
ATABS.push(['riwayat','Riwayat transaksi']);
S.bill='m';S.plan='ultra';S.pm='qris';S.pay={email:'',name:''};

/* ---------- halaman pilih paket ---------- */
const banner=()=>{if(!SUB)return'';const p=plan(SUB.plan);return`<div class="alr gn">● ${L('Paket aktif','Active plan')}: <b>${p.n}</b> (${per(SUB.bill=='y')}) · ${L('masa coba sisa '+left(SUB)+' hari','trial: '+left(SUB)+' days left')}${SUB.demo?' · <span class="sm">'+L('mode demo','demo mode')+'</span>':''}</div>`};
const pcard=p=>{const y=S.bill=='y',on=SUB&&SUB.plan==p.id;
return`<div class="pc${p.best?' best':''}">${p.best?'<span class="pbd">BEST VALUE</span>':''}<h3>${p.n}</h3><div class="pp"><b>${idr(price(p,y))}</b><span>/ ${y?L('tahun','year'):L('bulan','month')}</span></div><div class="ps">${y?L('2 BULAN GRATIS · hemat ','2 MONTHS FREE · save ')+idr(p.m*12-p.y):''}</div><ul>${p.f.map(x=>`<li>${L(x[0],x[1])}</li>`).join('')}</ul><button class="btn ${p.best?'y':'sec'}" onclick="payOpen('${p.id}')">${on?L('Paket aktif','Active plan'):L('Coba gratis 30 hari','Try free for 30 days')}</button></div>`};
const pricing=()=>{const y=S.bill=='y';
return`<div class="eb">ROAD TO JOURNAL PREMIUM</div><h2 class="hx">${L('Pilih paket yang pas.','Pick the right plan.')}</h2>${banner()}
<div class="pbill"><button class="${y?'':'on'}" onclick="S.bill='m';render()">${L('Bulanan','Monthly')}</button><button class="${y?'on':''}" onclick="S.bill='y';render()">${L('Tahunan','Yearly')} <small>${L('2 BULAN GRATIS','2 MONTHS FREE')}</small></button></div>
<div class="pgrid">${PLANS.map(pcard).join('')}</div>
<p class="sm" style="margin-top:16px">${L('Semua paket bisa dicoba gratis 30 hari dengan akses penuh.','Every plan can be tried free for 30 days with full access.')}${y?' '+L('Pembayaran tahunan dilakukan sekali untuk akses 12 bulan (bayar 10 bulan).','Yearly billing is paid once for 12 months of access (you pay for 10 months).'):''}</p>`};

/* ---------- riwayat transaksi ----------
   Mode demo: transaksi disimpan di browser. Mode asli (PAY_API terisi): data dari GET {PAY_API}/transactions,
   array berisi {id, created_at, plan:'basic|pro|ultra', billing:'m|y', method, amount, status, info?, pay_url?, invoice_url?, gateway_id?}.
   Status gateway dinormalisasi ke: paid, pending, failed, expired, refunded. */
const TXK=KEY+'_tx';
let TX=[],TXL=0;
if(!PAY_API){try{TX=JSON.parse(localStorage.getItem(TXK)||'[]')}catch(e){TX=[]}}
const saveTx=()=>{if(!PAY_API)try{localStorage.setItem(TXK,JSON.stringify(TX))}catch(e){}};
S.txF='all';S.txSel='';
const ST={paid:['Berhasil','Paid','Paid'],pending:['Menunggu','Pending','Pending'],failed:['Gagal','Failed','Failed'],expired:['Kedaluwarsa','Expired','Expired'],refunded:['Dikembalikan','Refunded','Refunded']};
const slabel=s=>L(ST[s][0],ST[s][1]);
const normSt=s=>{s=String(s||'').toLowerCase();
if(/unpaid|waiting|pending/.test(s))return'pending';
if(/refund|chargeback/.test(s))return'refunded';
if(/expire/.test(s))return'expired';
if(/deny|fail|cancel|reject|invalid|error/.test(s))return'failed';
if(/settle|capture|success|paid|complete/.test(s))return'paid';
return'pending'};
const mapTx=r=>({id:String(r.id||r.invoice||''),ts:+new Date(r.created_at||r.createdAt||Date.now()),plan:String(r.plan||'').toLowerCase(),bill:/^y/i.test(String(r.billing||r.period||'m'))?'y':'m',method:r.method||'–',amt:+r.amount||0,status:normSt(r.status),info:r.info||'',payUrl:r.pay_url||'',invUrl:r.invoice_url||'',gw:r.gateway_id||r.gatewayId||''});
const txs=()=>{if(!PAY_API)TX.forEach(t=>{if(t.status=='pending'&&Date.now()>t.ts+864e5){t.status='expired';t.info=''}});return TX.slice().sort((a,b)=>b.ts-a.ts)};
const fdate=ts=>new Date(ts).toLocaleString(loc(),{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
const pname=id=>{const p=PLANS.find(x=>x.id==id);return p?p.n:String(id||'–').toUpperCase()};
const mkId=(ts,k)=>{const d=new Date(ts),p=n=>String(n).padStart(2,'0');return'RTJ-INV-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+String(k).padStart(4,'0')};
const stInfo=t=>t.info||({pending:L('Bayar sebelum ','Pay before ')+fdate(t.ts+864e5),paid:L('Pembayaran diterima','Payment received'),failed:L('Pembayaran ditolak atau tidak valid','Payment declined or invalid'),expired:L('Tidak dibayar sampai batas waktu','Not paid before the deadline'),refunded:L('Dana dikembalikan','Funds refunded')})[t.status];
const STEPS={pending:[['Invoice dibuat','Invoice created','done'],['Menunggu pembayaran','Awaiting payment','now'],['Paket aktif','Plan active','wait']],paid:[['Invoice dibuat','Invoice created','done'],['Pembayaran diterima','Payment received','done'],['Paket aktif','Plan active','done']],failed:[['Invoice dibuat','Invoice created','done'],['Pembayaran ditolak','Payment declined','bad']],expired:[['Invoice dibuat','Invoice created','done'],['Batas waktu habis','Deadline passed','bad']],refunded:[['Invoice dibuat','Invoice created','done'],['Pembayaran diterima','Payment received','done'],['Dana dikembalikan','Funds refunded','done']]};
const sbadge=(s,l)=>`<span class="stb ${s}"><i></i>${slabel(s)}${l&&S.lang!='en'?' · '+ST[s][2]:''}</span>`;
const CTA={pending:['Bayar sekarang','Pay now','y'],paid:['Unduh invoice (PDF)','Download invoice (PDF)','sec'],failed:['Coba bayar lagi','Try paying again','y'],expired:['Buat invoice baru','Create new invoice','y'],refunded:['Unduh bukti refund','Download refund receipt','sec']};

async function txLoad(){try{const r=await fetch(PAY_API+'/transactions',{credentials:'include'});if(!r.ok)throw Error(r.status);const j=await r.json();TX=(Array.isArray(j)?j:j.data||[]).map(mapTx);if(S.page=='account'&&S.at=='riwayat')render()}catch(e){TXL=0;if(S.page=='account'&&S.at=='riwayat')err(L('Gagal memuat transaksi dari server','Failed to load transactions from the server'))}}

function history(){
if(PAY_API&&!TXL){TXL=1;txLoad()}
const all=txs(),f=S.txF,list=all.filter(t=>f=='all'||t.status==f),cur=list.find(t=>t.id==S.txSel)||list[0]||null,cnt=k=>all.filter(t=>t.status==k).length;
const chips=[['all',L('Semua','All'),all.length]].concat(Object.keys(ST).map(k=>[k,slabel(k),cnt(k)]));
let h=`<div class="eb">ROAD TO JOURNAL PREMIUM</div><h2 class="hx" style="font-size:clamp(28px,4vw,38px)">${L('Riwayat transaksi','Transaction history')}</h2>${PAY_API?'':'<div class="alr yl">'+L('Mode demo: transaksi disimpan di browser ini. Status asli datang dari payment gateway setelah <b>PAY_API</b> diisi.','Demo mode: transactions are stored in this browser. Real statuses come from the payment gateway once <b>PAY_API</b> is set.')+'</div>'}<div class="grid g4" style="margin:14px 0">${card(L('Total dibayar','Total paid'),idr(sum(all.filter(t=>t.status=='paid').map(t=>t.amt))),'gn')}${card(L('Transaksi berhasil','Successful transactions'),cnt('paid'))}${card(L('Menunggu pembayaran','Awaiting payment'),cnt('pending'))}${card(L('Gagal / kedaluwarsa','Failed / expired'),cnt('failed')+cnt('expired'),'rd')}</div>`;
if(!all.length)return h+`<div class="card empty"><div style="font-size:30px">◌</div><p>${L('Belum ada transaksi. Transaksi muncul setelah kamu memulai langganan Premium.','No transactions yet. They appear after you start a Premium subscription.')}</p><div class="row" style="justify-content:center"><button class="btn y" onclick="atab('premium')">${L('Lihat paket Premium','View Premium plans')}</button>${PAY_API?'':'<button class="btn sec" onclick="txSeed()">'+L('Isi contoh data','Load sample data')+'</button>'}</div></div>`;
h+=`<div class="chips" style="margin-bottom:14px">${chips.map(c=>`<button class="chip ${f==c[0]?'on':''}" onclick="S.txF='${c[0]}';render()">${c[1]} · ${c[2]}</button>`).join('')}</div>`;
const rows=list.map(t=>`<button class="txr${cur&&cur.id==t.id?' on':''}" data-id="${esc(t.id)}" onclick="txPick(this.dataset.id)"><span class="tc"><b>${esc(t.id)}</b><small>${fdate(t.ts)}</small></span><span class="tc"><b>${esc(pname(t.plan))}</b><small>${per(t.bill=='y')}</small></span><b>${idr(t.amt)}</b><span>${sbadge(t.status)}</span><span class="chv">›</span></button>`).join('')||'<div class="empty">'+L('Belum ada transaksi dengan status ini.','No transactions with this status yet.')+'</div>';
const dtl=cur?(()=>{const t=cur,c=CTA[t.status],ms=t.ts+864e5-Date.now(),id=esc(t.id);
return`<div class="card txd"><div class="lab">${L('Detail transaksi','Transaction details')}</div><b class="txid">${id}</b><div style="margin:10px 0 14px">${sbadge(t.status,1)}</div><div class="txam">${idr(t.amt)}</div><div class="sm" style="margin-bottom:14px">${esc(pname(t.plan))} · ${per(t.bill=='y')}</div>
<div class="txf"><div><span>${L('Metode','Method')}</span><b>${esc(mname(t.method))}</b></div><div><span>${L('Dibuat','Created')}</span><b>${fdate(t.ts)}</b></div><div><span>${L('Keterangan','Notes')}</span><b>${esc(stInfo(t))}</b></div><div><span>${L('ID gateway','Gateway ID')}</span><b>${esc(t.gw||'–')}</b></div></div>
${t.status=='pending'&&ms>0?`<div class="alr yl" style="display:flex;gap:10px;align-items:center"><span class="lvd"></span><span>${L('Sisa waktu pembayaran <b>'+Math.floor(ms/36e5)+' jam '+Math.floor(ms%36e5/6e4)+' menit</b>','Time left to pay <b>'+Math.floor(ms/36e5)+'h '+Math.floor(ms%36e5/6e4)+'m</b>')}</span></div>`:''}
<div class="lab" style="margin:16px 0 4px">${L('Alur status','Status flow')}</div><div class="tl">${STEPS[t.status].map(s=>`<div class="${s[2]}">${L(s[0],s[1])}</div>`).join('')}</div>
<div class="txb"><button class="btn ${c[2]}" data-id="${id}" onclick="txAct(this.dataset.id)">${L(c[0],c[1])}</button>${t.status=='pending'?`<button class="btn sec" data-id="${id}" onclick="txCancel(this.dataset.id)">${L('Batalkan invoice','Cancel invoice')}</button>`:''}</div>
${!PAY_API&&t.status=='pending'?`<div class="gwn" style="margin:12px 0 0">${L('Simulasi (mode demo)','Simulation (demo mode)')}<span class="row" style="margin-top:8px">${['paid','failed','expired'].map(s=>`<button class="ib" data-id="${id}" onclick="txSim(this.dataset.id,'${s}')">${slabel(s)}</button>`).join('')}</span></div>`:''}
<p class="sm" style="font-size:12px;margin:12px 0 0">${L('Status diperbarui otomatis dari payment gateway.','Status updates automatically from the payment gateway.')}</p></div>`})():'';
return h+`<div class="txw"><div class="card txt"><div class="txh"><span>Invoice</span><span>${L('Paket','Plan')}</span><span>${L('Jumlah','Amount')}</span><span>Status</span><span></span></div>${rows}</div>${dtl}</div>`}

window.txPick=id=>{S.txSel=id;render()};
window.txAct=id=>{const t=TX.find(x=>x.id==id);if(!t)return;
if(t.status=='paid'||t.status=='refunded')return txInvoice(id,t.status=='refunded');
if(t.status=='pending'&&t.payUrl)return window.open(t.payUrl,'_blank','noopener');
S.plan=PLANS.some(p=>p.id==t.plan)?t.plan:S.plan;S.bill=t.bill;payOpen()};
window.txCancel=async id=>{const t=TX.find(x=>x.id==id);if(!t||!confirm(L('Batalkan invoice '+id+'?','Cancel invoice '+id+'?')))return;
if(!PAY_API){t.status='failed';t.info='';saveTx();render();return toast(L('Invoice dibatalkan','Invoice canceled'))}
try{const r=await fetch(PAY_API+'/transactions/'+encodeURIComponent(id)+'/cancel',{method:'POST',credentials:'include'});if(!r.ok)throw Error(r.status);await txLoad();toast(L('Invoice dibatalkan','Invoice canceled'))}catch(e){err(L('Gagal membatalkan invoice','Failed to cancel the invoice'))}};
window.txSim=(id,s)=>{const t=TX.find(x=>x.id==id);if(!t)return;t.status=s;t.info='';
if(s=='paid'){SUB={plan:t.plan,bill:t.bill,start:Date.now(),demo:1};saveSub()}saveTx();render()};
window.txSeed=()=>{const n=Date.now(),d=864e5,mk=(ago,k,plan,bill,method,amt,status)=>({id:mkId(n-ago,k),ts:n-ago,plan,bill,method,amt,status,info:'',demo:1});
TX=[mk(2*36e5,5,'ultra','y','qris',1390000,'pending'),mk(6*d,4,'pro','m','Virtual Account BCA',89000,'paid'),mk(13*d,3,'pro','m','E-wallet GoPay',89000,'failed'),mk(20*d,2,'basic','m','Virtual Account BNI',39000,'expired'),mk(28*d,1,'ultra','m','card',139000,'refunded')];
S.txSel=TX[0].id;saveTx();render()};
window.txInvoice=(id,rf)=>{const t=TX.find(x=>x.id==id);if(!t)return;if(t.invUrl)return window.open(t.invUrl,'_blank','noopener');
modal(`<div class="row sp" style="margin-bottom:14px"><b style="font-size:17px">${rf?L('Bukti refund','Refund receipt'):'Invoice'}</b><button class="ib" onclick="closeM()">✕</button></div>
<div class="inv"><div class="row" style="flex-wrap:nowrap;margin-bottom:14px"><div class="logo"><img src="RTJ.jpeg" alt="RTJ"></div><b style="font-size:17px;flex:1">ROAD TO JOURNAL</b>${sbadge(t.status,1)}</div>
<div class="ir"><span>${L('No. invoice','Invoice no.')}</span><b>${esc(t.id)}</b></div><div class="ir"><span>${L('Tanggal','Date')}</span><b>${fdate(t.ts)}</b></div><div class="ir"><span>${L('Paket','Plan')}</span><b>${esc(pname(t.plan))} · ${per(t.bill=='y')}</b></div><div class="ir"><span>${L('Metode','Method')}</span><b>${esc(mname(t.method))}</b></div><div class="ir"><span>Total</span><b>${idr(t.amt)}</b></div></div>
<div class="row" style="margin-top:14px"><button class="btn" onclick="window.print()">${L('Cetak / simpan PDF','Print / save PDF')}</button><button class="btn sec" onclick="closeM()">${L('Tutup','Close')}</button></div>`)};
setInterval(()=>{if(PAY_API&&S.page=='account'&&S.at=='riwayat')txLoad()},30000);

const _acc=V.account;
V.account=()=>S.at=='premium'?_acc()+pricing():S.at=='riwayat'?_acc()+history():_acc();

/* ---------- checkout ---------- */
const feats=id=>{const i=PLANS.findIndex(p=>p.id==id);return PLANS.slice(0,i+1).flatMap((q,k)=>k?q.f.slice(1):q.f).map(x=>L(x[0],x[1]))};
function payRender(){const p=plan(S.plan),y=S.bill=='y',pr=price(p,y),pp=y?L('tahun','year'):L('bulan','month');
modal(`<div class="ck2"><div class="ckl">
<div class="lab">ROAD TO JOURNAL CHECKOUT</div>
<div class="row" style="margin:14px 0 16px;flex-wrap:nowrap"><div class="logo"><img src="RTJ.jpeg" alt="RTJ"></div><b class="ckn">ROAD TO JOURNAL</b><span class="pbd2">${p.n}</span></div>
<ul class="ckf">${feats(p.id).map(x=>`<li>${x}</li>`).join('')}</ul>
<div class="chips" style="margin:14px 0">${PLANS.map(q=>`<button type="button" class="chip ${q.id==p.id?'on':''}" onclick="S.plan='${q.id}';payRender()">${q.n}</button>`).join('')}</div>
<div class="seg" style="margin-bottom:16px"><button class="${y?'':'on'}" onclick="S.bill='m';payRender()">${L('Bulanan','Monthly')}</button><button class="${y?'on':''}" onclick="S.bill='y';payRender()">${L('Tahunan','Yearly')}</button></div>
<div class="row sp" style="margin-bottom:14px"><span class="sm">${p.n} · ${per(y)}</span><b>${idr(pr)}</b></div>
<div class="row sp" style="margin-bottom:6px"><b style="font-size:13px">${L('Punya kode?','Have a code?')}</b><span class="sm" style="font-size:12px">${L('Diskon, promo, atau voucher','Discount, promo, or voucher')}</span></div>
<div class="pcode"><input id="pcode" placeholder="${L('Masukkan kode','Enter code')}" autocomplete="off"><button class="ib" onclick="toast('${L('Kode divalidasi oleh server saat pembayaran aktif','Codes are validated by the server once payments are live')}')">${L('Terapkan','Apply')}</button></div>
<div class="ckd"><div class="row sp" style="align-items:flex-end"><b>${L('Bayar hari ini','Due today')}</b><span class="ckt">Rp0</span></div><div class="sm" style="text-align:right">${L('Coba gratis 30 hari, lalu '+idr(pr)+' per '+pp,'Free for 30 days, then '+idr(pr)+' per '+pp)}</div></div>
<div class="sm" style="font-size:12px;margin-top:14px">${L('Batalkan kapan saja di Pengaturan.','Cancel anytime in Settings.')}</div></div>
<div class="ckr"><button class="ib ckx" onclick="closeM()" aria-label="${L('Tutup','Close')}">✕</button>
<b>${L('Metode pembayaran','Payment method')}</b>
<div class="pms">${PMS.map(m=>`<button type="button" class="pm ${S.pm==m[0]?'on':''}" onclick="S.pm='${m[0]}';payRender()"><span><b>${L(m[1],m[2])}</b><small>${L(m[3],m[4])}</small></span><i></i></button>`).join('')}</div>
<div class="f"><label>Email</label><input type="email" value="${esc(S.pay.email)}" placeholder="email@kamu.com" autocomplete="email" oninput="S.pay.email=this.value"></div>
<div class="f"><label>${L('Nama lengkap','Full name')}</label><input value="${esc(S.pay.name)}" placeholder="${L('Nama depan dan belakang','First and last name')}" autocomplete="name" oninput="S.pay.name=this.value"></div>
${PAY_API?'':'<div class="gwn">'+L('<b>Mode demo.</b> Payment gateway belum diatur (PAY_API di script.js kosong). Tombol di bawah hanya mengaktifkan masa coba di browser ini.','<b>Demo mode.</b> The payment gateway is not set up yet (PAY_API in script.js is empty). The button below only activates the trial in this browser.')+'</div>'}
<button class="btn y pay" onclick="payGo()">${L('Mulai coba gratis 30 hari','Start 30-day free trial')}</button>
<div class="sm" style="font-size:12px;text-align:center;margin-top:12px">${L('Pembayaran diproses lewat payment gateway. ROAD TO JOURNAL tidak menyimpan data kartu kamu.','Payments are processed through a payment gateway. ROAD TO JOURNAL does not store your card details.')}</div></div></div>`,1);
$('#mb').classList.add('xl')}
window.payRender=payRender;
window.payOpen=id=>{if(id)S.plan=id;if(!S.pay.name)S.pay.name=(S.prof&&S.prof.name)||'';payRender()};
window.payGo=async()=>{const p=plan(S.plan),e=(S.pay.email||'').trim(),n=(S.pay.name||'').trim();
if(!/^\S+@\S+\.\S+$/.test(e))return err(L('Isi email yang valid','Enter a valid email'));
if(!n)return err(L('Isi nama lengkap','Enter your full name'));
if(!PAY_API){const now=Date.now();SUB={plan:p.id,bill:S.bill,start:now,demo:1};saveSub();
TX.push({id:mkId(now,TX.length+1),ts:now,plan:p.id,bill:S.bill,method:S.pm,amt:price(p,S.bill=='y'),status:'pending',info:'',demo:1});saveTx();
closeM();render();return toast(L('Mode demo: masa coba 30 hari aktif dan invoice contoh masuk ke Riwayat transaksi.','Demo mode: the 30-day trial is active and a sample invoice was added to Transaction history.'))}
const btn=$('.pay');if(btn)btn.disabled=true;
try{const r=await fetch(PAY_API+'/checkout',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:p.id,billing:S.bill,method:S.pm,email:e,name:n,code:($('#pcode')||{}).value||''})});
if(!r.ok)throw Error(L('Server menolak (','Server rejected (')+r.status+')');const j=await r.json();if(!j.url)throw Error(L('Respon server tidak valid','Invalid server response'));location.href=j.url}
catch(x){if(btn)btn.disabled=false;err(L('Gagal memulai pembayaran: ','Failed to start payment: ')+x.message)}};

/* ---------- picker broker: badge + LIVE berkedip ---------- */
window.brPick=function(){const PER=12,pg=Math.max(1,Math.ceil(BKS.length/PER));BM.p=Math.min(BM.p||0,pg-1);const s=BM.p*PER,l=BKS.slice(s,s+PER);
modal(`<div class="row sp" style="margin-bottom:14px"><b style="font-size:18px">${L('Pilih platform trading','Choose trading platform')}</b><button class="ib" onclick="closeM()">✕</button></div>
<div class="bpg">${l.map((b,i)=>`<button class="bk bk2" onclick="brForm(${s+i})"><span class="bi big" style="background:${b[2]}">${b[1]}</span><span class="bkt"><b class="bkn">${b[0]}</b><span class="bkm"><span class="bd2">${b[4]}</span><span class="live"><i></i>LIVE</span></span></span><span class="bkc">›</span></button>`).join('')}</div>
<button class="bk" style="width:100%;margin-top:10px" onclick="closeM();S.at='manual';go('account');accM()"><span class="bi big" style="background:var(--sf)">＋</span><span style="flex:1"><b>${L('Tambah akun manual','Add account manually')}</b><br><span class="sm">${L('Catat trade tanpa menautkan broker','Track trades without connecting a broker')}</span></span>›</button>
${pg>1?`<div class="row sp" style="margin-top:12px"><span class="sm">${L('Halaman '+(BM.p+1)+' dari '+pg,'Page '+(BM.p+1)+' of '+pg)}</span><span class="row"><button class="ib" onclick="BM.p=Math.max(0,BM.p-1);brPick()">‹</button><button class="ib" onclick="BM.p=Math.min(${pg-1},BM.p+1);brPick()">›</button></span></div>`:''}`);$('#mb').classList.add('bw')};

/* ---------- logo broker: taruh file di folder logos/ (nama = huruf kecil tanpa spasi, mis. logos/mt5.png) ---------- */
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]/g,'');
/* Urutan sumber logo: (1) file milikmu di logos/<nama>.png, (2) ikon resmi situs broker lewat layanan favicon, (3) badge berinisial */
const DOM={mt5:'metatrader5.com',mt4:'metatrader4.com',ctrader:'ctrader.com',tradingview:'tradingview.com',matchtrader:'match-trader.com',tradelocker:'tradelocker.com',binance:'binance.com',bybit:'bybit.com',coinbase:'coinbase.com',kraken:'kraken.com',interactivebrokers:'interactivebrokers.com',bitunix:'bitunix.com'};
const srcs=b=>{const d=DOM[slug(b[0])];return['logos/'+slug(b[0])+'.png'].concat(d?['https://www.google.com/s2/favicons?domain='+d+'&sz=128']:[])};
function deco(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll('.bi:not([data-l])').forEach(el=>{el.dataset.l=1;const b=BKS.find(x=>x[1]==el.textContent.trim());if(!b)return;
const list=srcs(b);let k=0;const im=new Image();im.alt=b[0];im.className='bli';im.onload=()=>el.classList.add('hasl');im.onerror=()=>{k++;if(k<list.length)im.src=list[k];else im.remove()};im.src=list[0];el.appendChild(im)})}
new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType!=1)return;deco(n.matches&&n.matches('.bi')?n.parentNode:n)}))).observe(document.body,{childList:true,subtree:true});
deco(document.body);

/* ---------- terjemahan halaman Account & tautan broker (kode lama berbahasa Indonesia) ----------
   Memakai penerjemah bawaan (TRX = teks utuh, SBD = potongan teks). Entri [indonesia, inggris]. */
const EXA=[
['Semua akun','All accounts'],['Tautkan broker','Link broker'],['Akun manual','Manual accounts'],['Log sinkronisasi','Sync log'],['Riwayat transaksi','Transaction history'],
['Total akun','Total accounts'],['Terhubung broker','Broker-linked'],['+ Akun manual','+ Manual account'],
['Akun terhubung broker','Broker-linked accounts'],['Trade dari broker masuk otomatis ke Journal.','Trades from your broker flow into the Journal automatically.'],['+ Tautkan broker','+ Link broker'],
['Belum ada broker terhubung.','No broker linked yet.'],['Akun','Accounts'],['Belum ada akun manual.','No manual accounts yet.'],['+ Tambah Akun','+ Add Account'],
['Riwayat sinkronisasi','Sync history'],['Belum ada aktivitas. Tautkan broker untuk memulai.','No activity yet. Link a broker to get started.'],
['● Gagal sinkron','● Sync failed'],['● Tersinkron','● Synced'],['Sinkron otomatis','Auto sync'],['Sync sekarang','Sync now'],['Impor CSV','Import CSV'],['Lihat di Journal','View in Journal'],['Putuskan','Disconnect'],
['Sinkronisasi selesai','Sync complete'],['Sinkron otomatis aktif','Auto sync on'],['Sinkron otomatis nonaktif','Auto sync off'],['Broker diputus','Broker disconnected'],
['Isi nomor login dulu','Enter the login number first'],['Isi API key dulu','Enter the API key first'],['Format CSV tidak dikenali','CSV format not recognized'],['Gagal membaca CSV','Failed to read CSV'],
['Server broker','Broker server'],['Nomor login','Login number'],['Password investor (read-only)','Investor password (read-only)'],
['Akun dibuat dulu, lalu impor file CSV lewat tombol Impor CSV di kartu akun.','The account is created first, then import the CSV file with the Import CSV button on the account card.'],
['Nama akun di jurnal','Account name in journal'],['Tipe akun','Account type'],['Impor riwayat','Import history'],['30 hari terakhir','Last 30 days'],['90 hari terakhir','Last 90 days'],['Semua riwayat','All history'],['Aktif','On'],['Nonaktif','Off'],
['Hanya akses baca. Password dan secret dikirim sekali ke server saat koneksi dan tidak disimpan di browser.','Read-only access. Password and secret are sent once to the server when connecting and are not stored in the browser.'],
['Hubungkan akun','Connect account'],['Menautkan akun','Linking account'],['Memverifikasi akses baca','Verifying read access'],['Mengimpor riwayat trade','Importing trade history'],['Menyelaraskan dengan Journal','Syncing with the Journal'],['Kembali','Back'],['Gagal terhubung','Failed to connect'],['Broker berhasil tertaut','Broker linked successfully'],['Selesai','Done']
];
const SBA=[
['Mode demo: backend belum diatur (','Demo mode: backend not configured ('],
['kosong), jadi trade yang masuk hanya data contoh. Untuk data asli, pakai tombol Impor CSV di kartu akun.','is empty), so incoming trades are sample data only. For real data, use the Import CSV button on the account card.'],
['Sinkron terakhir: ','Last sync: '],['Baru saja','Just now'],[' menit lalu',' min ago'],[' jam lalu',' h ago'],[' hari lalu',' days ago'],
['Tersambung, ','Connected, '],[' trade diimpor',' trades imported'],[' trade baru masuk ke Journal',' new trades added to the Journal'],['Tidak ada trade baru','No new trades'],['Gagal sinkron: ','Sync failed: '],['Impor CSV: ','CSV import: '],
['Menghubungkan ke ','Connecting to '],['Server menolak koneksi (','Server rejected the connection ('],['Gagal mengambil trade (','Failed to fetch trades ('],
[' trade masuk ke Journal akun ',' trades added to the Journal for account '],['. Trade baru akan masuk lewat sinkronisasi.','. New trades will arrive via sync.'],
['Tautkan ','Link '],['Putuskan broker dari ','Disconnect broker from '],['? Trade lama tetap tersimpan di Journal.','? Existing trades stay in the Journal.']
];
EXA.forEach(r=>{if(!TRX.has(r[0]))TRX.set(r[0],[r[0],0,r[1]])});
SBA.forEach(r=>SBD.push([r[0],0,r[1]]));SBD.sort((a,b)=>b[0].length-a[0].length);
/* pesan confirm() bawaan browser ikut diterjemahkan */
const _cf=window.confirm;window.confirm=m=>_cf.call(window,S.lang=='en'?cv(String(m)):m);
if(S.lang=='en')walk(document.body);
})();