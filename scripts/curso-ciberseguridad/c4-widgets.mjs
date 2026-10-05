/**
 * Interactivos a medida del curso 4 («Mi puesto, mis dispositivos y mi wifi»).
 * Mismo contrato que widgets.mjs: cada función devuelve { html, css, js, state_max }
 * para `ix.html({ ...widget, prompt:'' })`. Corren en el iframe aislado de html_embed
 * (sin red, sin SCORM) y solo hablan con la carcasa por window.MeEmbed.
 *
 *  - bloqueaATiempo : reflejos «¿bloqueo, cierro sesión o lo dejo?» con cronómetro opcional.
 *  - usbSim         : simulador de decisiones «¿qué hago con este USB?» (3 casos).
 *  - radarWifi      : radar de redes wifi; hay que elegir la red adecuada (o ninguna).
 *  - teleCheck      : checklist de teletrabajo con semáforo y consejos.
 */

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#b86e00;--warnbg:#fff4de;--vio:#6a4fd0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.92rem;margin:0 0 12px}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--teal);transition:transform .08s,filter .15s;touch-action:manipulation}
button:active{transform:scale(.97)}
button:focus-visible,input:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
button.ok{background:var(--ok)} button.bad{background:var(--bad)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.col{display:flex;flex-direction:column;gap:8px}
.col>button{text-align:left;font-weight:600}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--blue));transition:width .35s}
.fb{margin-top:12px;border-radius:14px;padding:12px 14px;animation:pop .25s ease-out}
.fb.good{background:var(--okbg);border:1px solid #9fdcbc}.fb.nope{background:var(--badbg);border:1px solid #f1a9ac}.fb.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.fb b.h{display:block;font-size:1.02rem;margin-bottom:4px}
@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.end{text-align:center;padding:18px 8px;border-radius:16px;background:var(--soft);border:1px solid var(--line);animation:pop .3s}
.end .big{font-size:2.2rem}.end h3{margin:.2rem 0}
.sc{display:flex;gap:12px;align-items:center;background:var(--soft);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin:0 0 12px}
.sc .em{font-size:2.2rem;flex:none}.sc .tx{font-weight:600}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px}
`

const SHIM = `var ME=window.MeEmbed||{completed:false,state:null,stateMax:0,complete:function(){},saveState:function(){}};
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function save(o){try{ME.saveState(o)}catch(e){}}
function done(){try{if(!ME.completed)ME.complete()}catch(e){}}`

const j = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

/**
 * Reflejos «Bloquea a tiempo»: situaciones del turno; hay que decidir 🔒 bloquear, 🚪 cerrar sesión
 * o 👀 no hace falta. Cronómetro de `seg` segundos (opcional: casilla «sin cronómetro»; se desactiva
 * solo con prefers-reduced-motion). situaciones: [{e:emoji, t:texto, ok:0|1|2, fb:porque}]
 */
export function bloqueaATiempo({ seg = 9, situaciones, titulo = 'Bloquea a tiempo' }) {
  const acciones = ['🔒 Bloquear la pantalla (Win + L)', '🚪 Cerrar sesión', '👀 Nada: puedo seguir']
  const html = `<div class="wrap">${titulo?`<p class="ttl">${titulo}</p>`:''}<p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><label class="nl"><input type="checkbox" id="nl"> Sin cronómetro (a mi ritmo)</label><div id="st"></div></div>`
  const css = BASE_CSS + `
.nl{display:flex;gap:10px;align-items:center;min-height:44px;font-size:.92rem;color:var(--mut);margin:0 0 6px}
.nl input{width:22px;height:22px;accent-color:var(--teal)}
.tbar{height:10px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.tbar>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--bad),var(--warn),var(--ok));background-size:100% 100%}
.tbar.late>i{background:var(--bad)}`
  const js = `${SHIM}
var D=${j({ seg, acciones, situaciones })};
var i=0,ok=0,tm=null,nolimit=false;
try{if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){nolimit=true;document.getElementById('nl').checked=true}}catch(e){}
document.getElementById('a').textContent='Situaciones de un turno. Para cada una, elige el gesto correcto antes de que se acabe el tiempo.';
var st=document.getElementById('st'),pb=document.getElementById('pb');
document.getElementById('nl').onchange=function(){nolimit=this.checked;if(i<D.situaciones.length&&!st.querySelector('.fb'))show()};
function stop(){if(tm){clearTimeout(tm);tm=null}}
function show(){stop();clear(st);pb.style.width=Math.round(i/D.situaciones.length*100)+'%';if(i>=D.situaciones.length)return fin();
 var s=D.situaciones[i];st.appendChild(h('p','cnt','Situación '+(i+1)+' de '+D.situaciones.length));
 var sc=h('div','sc');sc.appendChild(h('div','em',s.e));sc.appendChild(h('div','tx',s.t));st.appendChild(sc);
 var tb=h('div','tbar');var ti=document.createElement('i');tb.appendChild(ti);tb.setAttribute('aria-hidden','true');st.appendChild(tb);
 if(nolimit)tb.style.display='none';
 var col=h('div','col');D.acciones.forEach(function(t,k){var b=h('button',k===2?'ghost':'',t);b.onclick=function(){pick(k)};col.appendChild(b)});st.appendChild(col);
 if(!nolimit){ti.style.transition='none';ti.style.width='100%';void ti.offsetWidth;ti.style.transition='width '+D.seg+'s linear';ti.style.width='0';tm=setTimeout(function(){tb.classList.add('late');pick(-1)},D.seg*1000)}}
function pick(k){stop();var s=D.situaciones[i];var good=(k===s.ok);if(good)ok++;clear(st);
 var f=h('div','fb '+(good?'good':'nope'));
 f.appendChild(h('b','h',k===-1?'⏰ Se acabó el tiempo: la pantalla se quedó a la vista.':good?'✅ Gesto correcto: '+D.acciones[s.ok]:'❌ Mejor: '+D.acciones[s.ok]));
 f.appendChild(h('div','',s.fb));st.appendChild(f);
 var n=h('button','','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){i++;show()};st.appendChild(n);n.focus({preventScroll:true})}
function fin(){var t=D.situaciones.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t-1?'🔒':ok>=t*0.6?'👍':'📚'));
 e.appendChild(h('h3','','Has protegido bien '+ok+' de '+t+' situaciones'));
 e.appendChild(h('p','',ok>=t-1?'Ya lo llevas en las manos: bloquear tarda un segundo.':'Repite sin prisa: lo importante es que bloquear se vuelva un gesto automático.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;show()};e.appendChild(r);st.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 0 }
}

/**
 * Simulador de decisiones «¿Qué hago con este USB?». casos: [{ e, lugar, t, pasos:[{ q, op:[{t, v:'good'|'mid'|'bad', fb}] }] }]
 * Hay que llegar a la opción buena de cada paso (si fallas, lo vuelves a intentar). Estado: {"c":caso,"s":paso}.
 */
export function usbSim({ casos, regla, titulo = '¿Qué hago con este USB?' }) {
  const html = `<div class="wrap">${titulo?`<p class="ttl">${titulo}</p>`:''}<p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="st"></div></div>`
  const css = BASE_CSS + `
.usb{display:inline-block;animation:bob 2.2s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-4px) rotate(-4deg)}}
.rule{margin-top:10px;font-size:.92rem;text-align:left;background:#fff;border:1px dashed var(--teal);border-radius:12px;padding:10px 12px}`
  const js = `${SHIM}
var D=${j({ casos, regla })};
var s0=ME.state||{c:0,s:0};var c=s0.c|0,p=s0.s|0,first=0,tries=0,total=0;D.casos.forEach(function(k){total+=k.pasos.length});
var st=document.getElementById('st'),pb=document.getElementById('pb');
document.getElementById('a').textContent='Tres situaciones reales de un centro sociosanitario. Elige qué haces; si no es lo mejor, verás qué pasaría y podrás probar otra opción.';
function bar(){var d=0;for(var k=0;k<c&&k<D.casos.length;k++)d+=D.casos[k].pasos.length;d+=p;pb.style.width=Math.round(d/total*100)+'%'}
function show(){clear(st);bar();if(c>=D.casos.length)return fin();var cs=D.casos[c],pa=cs.pasos[p];
 st.appendChild(h('p','cnt','Caso '+(c+1)+' de '+D.casos.length+' · '+cs.lugar+(cs.pasos.length>1?' · paso '+(p+1)+' de '+cs.pasos.length:'')));
 var sc=h('div','sc');var em=h('div','em',cs.e);if(p===0)em.className='em usb';sc.appendChild(em);sc.appendChild(h('div','tx',p===0?cs.t:pa.ctx||cs.t));st.appendChild(sc);
 st.appendChild(h('p','ttl',pa.q));var col=h('div','col');tries=0;
 pa.op.forEach(function(o){var b=h('button','ghost',o.t);b.onclick=function(){pick(o,b,col)};col.appendChild(b)});st.appendChild(col)}
function pick(o,b,col){var pa=D.casos[c].pasos[p];tries++;
 var old=st.querySelector('.fb');if(old)old.parentNode.removeChild(old);var oldn=st.querySelector('.nx');if(oldn)oldn.parentNode.removeChild(oldn);
 var f=h('div','fb '+o.v);f.setAttribute('role','status');f.appendChild(h('b','h',o.v==='good'?'✅ Eso es':o.v==='mid'?'🟡 Mejorable':'❌ Mala idea'));f.appendChild(h('div','',o.fb));st.appendChild(f);
 if(o.v==='good'){if(tries===1)first++;[].forEach.call(col.children,function(x){x.disabled=true});b.className='ok';var n=h('button','nx','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){p++;if(p>=D.casos[c].pasos.length){c++;p=0}save({c:c,s:p});show()};st.appendChild(n);n.focus({preventScroll:true})}
 else{b.classList.add('wrongpick');b.disabled=true;b.style.opacity='.55'}}
function fin(){var e=h('div','end');e.appendChild(h('div','big',first>=total-1?'🛡️':first>=total*0.6?'👍':'📚'));
 e.appendChild(h('h3','','Has acertado '+first+' de '+total+' a la primera'));e.appendChild(h('p','','Con un USB desconocido, la respuesta es siempre la misma: no se conecta y se entrega.'));
 e.appendChild(h('div','rule',D.regla));var r=h('button','ghost','↺ Repetir');r.style.marginTop='10px';r.onclick=function(){c=0;p=0;first=0;save({c:0,s:0});show()};e.appendChild(r);st.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 20 }
}

/**
 * Radar de wifi. rondas: [{ e, lugar, quien, redes:[{n, lock:bool, sig:1-4, ok:bool, fb}], ninguna:{ok:bool, fb}, porque }]
 * El alumno elige una red de la lista o «ninguna: uso datos móviles». Estado: {"r":ronda}.
 */
export function radarWifi({ rondas, titulo = 'Radar de wifi' }) {
  const html = `<div class="wrap">${titulo?`<p class="ttl">${titulo}</p>`:''}<p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="st"></div></div>`
  const css = BASE_CSS + `
.rad{display:block;margin:0 auto 10px;width:min(240px,70vw);height:auto}
.sweep{transform-origin:100px 100px;animation:spin 3.2s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.blip{animation:ping 1.8s ease-out infinite}
@keyframes ping{0%{opacity:1}100%{opacity:.35}}
.net{display:flex;align-items:center;gap:10px;width:100%;background:#fff;color:var(--ink);border:2px solid var(--line);text-align:left;min-height:56px}
.net .nm{flex:1;font-weight:800;overflow-wrap:anywhere}.net .meta{font-size:.78rem;color:var(--mut);font-weight:600;display:block}
.net .num{flex:none;width:28px;height:28px;border-radius:50%;background:var(--teal);color:#fff;display:grid;place-items:center;font-weight:800;font-size:.9rem}
.net .ic{flex:none;font-size:1.2rem}
.net.sel-ok{border-color:var(--ok);background:var(--okbg)}.net.sel-bad{border-color:var(--bad);background:var(--badbg)}
.none{margin-top:4px}`
  const js = `${SHIM}
var D=${j({ rondas })};var r=(ME.state&&ME.state.r)|0,ok=0,locked=false;
var st=document.getElementById('st'),pb=document.getElementById('pb');
document.getElementById('a').textContent='Tu móvil o tablet detecta varias redes. Elige a cuál te conectarías en cada situación.';
function bars(n){var s='';for(var k=1;k<=4;k++)s+=(k<=n?'▂▄▆█'.charAt(k-1):'·');return s}
function radar(rd){var NS='http://www.w3.org/2000/svg';var s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','0 0 200 200');s.setAttribute('class','rad');s.setAttribute('aria-hidden','true');
 function el(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
 s.appendChild(el('circle',{cx:100,cy:100,r:96,fill:'#0f2b3a'}));[30,60,90].forEach(function(q){s.appendChild(el('circle',{cx:100,cy:100,r:q,fill:'none',stroke:'#2a6f7a','stroke-width':1.5}))});
 s.appendChild(el('line',{x1:100,y1:4,x2:100,y2:196,stroke:'#2a6f7a','stroke-width':1}));s.appendChild(el('line',{x1:4,y1:100,x2:196,y2:100,stroke:'#2a6f7a','stroke-width':1}));
 var sw=el('g',{class:'sweep'});sw.appendChild(el('path',{d:'M100 100 L100 6 A94 94 0 0 1 160 28 Z',fill:'#3ee0c8',opacity:'.28'}));sw.appendChild(el('line',{x1:100,y1:100,x2:100,y2:6,stroke:'#3ee0c8','stroke-width':2}));s.appendChild(sw);
 s.appendChild(el('circle',{cx:100,cy:100,r:5,fill:'#fff'}));
 rd.redes.forEach(function(n,k){var ang=(k*95+40)*Math.PI/180,dist=24+(4-n.sig)*20+k*4;var x=100+Math.sin(ang)*dist,y=100-Math.cos(ang)*dist;
  s.appendChild(el('circle',{cx:x,cy:y,r:11,fill:n.lock?'#3ee0c8':'#ffb84d',class:'blip'}));var t=el('text',{x:x,y:y+5,'text-anchor':'middle','font-size':14,'font-weight':800,fill:'#0f2b3a'});t.textContent=String(k+1);s.appendChild(t)});
 return s}
function show(){clear(st);locked=false;pb.style.width=Math.round(r/D.rondas.length*100)+'%';if(r>=D.rondas.length)return fin();
 var rd=D.rondas[r];st.appendChild(h('p','cnt','Situación '+(r+1)+' de '+D.rondas.length));
 var sc=h('div','sc');sc.appendChild(h('div','em',rd.e));var tx=h('div','tx');tx.appendChild(h('b','',rd.lugar));tx.appendChild(h('div','',rd.quien));sc.appendChild(tx);st.appendChild(sc);
 st.appendChild(radar(rd));var col=h('div','col');
 rd.redes.forEach(function(n,k){var b=h('button','net');b.appendChild(h('span','num',String(k+1)));var nm=h('span','nm');nm.appendChild(document.createTextNode(n.n));nm.appendChild(h('span','meta',(n.lock?'🔒 Con contraseña':'🔓 Abierta (sin contraseña)')+' · señal '+bars(n.sig)));b.appendChild(nm);b.onclick=function(){pick(k,b)};col.appendChild(b)});
 var nb=h('button','net none');nb.appendChild(h('span','ic','📶'));var nn=h('span','nm','Ninguna: uso los datos móviles del teléfono');nb.appendChild(nn);nb.onclick=function(){pick(-1,nb)};col.appendChild(nb);st.appendChild(col)}
function pick(k,b){if(locked)return;locked=true;var rd=D.rondas[r];var o=k<0?rd.ninguna:rd.redes[k];var good=!!o.ok;if(good)ok++;
 [].forEach.call(st.querySelectorAll('.net'),function(x){x.disabled=true});b.classList.add(good?'sel-ok':'sel-bad');
 var f=h('div','fb '+(good?'good':'nope'));f.setAttribute('role','status');f.appendChild(h('b','h',good?'✅ Buena elección':'❌ Ojo con esa'));f.appendChild(h('div','',o.fb));
 if(rd.porque){var p=h('div','',rd.porque);p.style.marginTop='6px';f.appendChild(p)}st.appendChild(f);
 var n=h('button','','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){r++;save({r:r});show()};st.appendChild(n);n.focus({preventScroll:true})}
function fin(){var t=D.rondas.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t?'📡':'📚'));e.appendChild(h('h3','','Has elegido bien '+ok+' de '+t+' veces'));
 e.appendChild(h('p','','Un candado no lo es todo: importa quién ofrece la red y para qué es. Si dudas, datos móviles.'));
 var b=h('button','ghost','↺ Repetir');b.onclick=function(){r=0;ok=0;save({r:0});show()};e.appendChild(b);st.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 20 }
}

/**
 * Checklist de teletrabajo con semáforo. items: [{ t, tip }]. Estado: máscara numérica {"m":n}.
 * Completa al pulsar «Ver mi semáforo».
 */
export function teleCheck({ items, titulo = 'Mi semáforo de teletrabajo' }) {
  const html = `<div class="wrap">${titulo?`<p class="ttl">${titulo}</p>`:''}<p class="sub">Marca lo que ya cumples en casa. Es solo para ti: nadie ve tus respuestas.</p><div id="l"></div><button id="go" style="width:100%;margin-top:6px">🚦 Ver mi semáforo</button><div id="r"></div></div>`
  const css = BASE_CSS + `
label.it{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid var(--line);border-radius:14px;margin:7px 0;background:#fff;cursor:pointer;min-height:48px}
label.it input{width:24px;height:24px;margin-top:1px;accent-color:var(--teal);flex:none}
label.it.on{background:var(--okbg);border-color:#9fdcbc}
.lights{display:flex;gap:10px;justify-content:center;margin:6px 0 10px}
.lights i{width:34px;height:34px;border-radius:50%;background:#cfd8e3;display:block;border:3px solid #fff;box-shadow:0 0 0 2px #cfd8e3}
.lights i.r.on{background:var(--bad);box-shadow:0 0 14px var(--bad)}.lights i.a.on{background:#f5a623;box-shadow:0 0 14px #f5a623}.lights i.g.on{background:var(--ok);box-shadow:0 0 14px var(--ok)}
.res ul{margin:6px 0 0;padding-left:20px}.res li{margin:4px 0}
#r .res{margin-top:12px;border-radius:16px;background:var(--soft);border:1px solid var(--line);padding:14px;animation:pop .3s}`
  const js = `${SHIM}
var D=${j({ items })};var mask=(ME.state&&ME.state.m)|0;
var L=document.getElementById('l'),R=document.getElementById('r');
D.items.forEach(function(it,k){var lb=h('label','it'+((mask&(1<<k))?' on':''));var cb=document.createElement('input');cb.type='checkbox';cb.checked=!!(mask&(1<<k));
 cb.onchange=function(){if(cb.checked)mask|=(1<<k);else mask&=~(1<<k);lb.classList.toggle('on',cb.checked);save({m:mask})};lb.appendChild(cb);lb.appendChild(h('span','',it.t));L.appendChild(lb)});
function verdict(){clear(R);var n=0,miss=[];D.items.forEach(function(it,k){if(mask&(1<<k))n++;else miss.push(it)});var t=D.items.length;
 var lvl=n>=t-1?'g':n>=t*0.6?'a':'r';var box=h('div','res');box.setAttribute('role','status');var lt=h('div','lights');['r','a','g'].forEach(function(c){var i=h('i',c+(c===lvl?' on':''));lt.appendChild(i)});box.appendChild(lt);
 box.appendChild(h('b','h',lvl==='g'?'🟢 Casa blindada: cumples '+n+' de '+t:lvl==='a'?'🟠 Vas bien, con cosas por mejorar: '+n+' de '+t:'🔴 Hay que reforzar la casa: '+n+' de '+t));
 if(miss.length){box.appendChild(h('div','','Para mejorar:'));var ul=h('ul');miss.forEach(function(m){ul.appendChild(h('li','',m.tip))});box.appendChild(ul)}else box.appendChild(h('div','','No te falta nada. Repasa de vez en cuando que sigue siendo así.'));
 R.appendChild(box);done()}
document.getElementById('go').onclick=verdict;`
  return { html, css, js, state_max: 20 }
}
