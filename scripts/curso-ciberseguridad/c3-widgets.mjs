/**
 * Interactivos a medida del curso 3 («Correo, mensajes y llamadas: no piques el anzuelo»).
 * Misma convención que widgets.mjs: cada función devuelve { html, css, js, state_max }.
 *   - inboxSim:      bandeja de móvil; se tocan las líneas sospechosas de cada correo.
 *   - senderCompare: remitente que figura en tu agenda vs. remitente recibido (diferencias resaltadas).
 *   - triage:        «He picado»: elige qué ha pasado y obtén la lista de pasos.
 * Todo el texto del autor entra por textContent. Estado ASCII compacto.
 */

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#c9302c;--badbg:#fdeaea;--warn:#8a5300;--warnbg:#fff4de;--vio:#6a4fd0;--pri:#d9482b}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.95rem;margin:0 0 12px}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--blue);transition:transform .08s,filter .15s}
button:active{transform:scale(.97)}
button:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
button.ok{background:var(--ok)} button.bad{background:var(--bad)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#f4c910,var(--pri));transition:width .35s}
.fb{margin-top:12px;border-radius:14px;padding:12px 14px;animation:pop .25s ease-out}
.fb.good{background:var(--okbg);border:1px solid #9fdcbc}.fb.nope{background:var(--badbg);border:1px solid #f1a9ac}.fb.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.fb b.h{display:block;font-size:1.02rem;margin-bottom:4px}
@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.end{text-align:center;padding:18px 8px;border-radius:16px;background:var(--soft);border:1px solid var(--line);animation:pop .3s}
.end .big{font-size:2.2rem}.end h3{margin:.2rem 0}
`

const SHIM = `var ME=window.MeEmbed||{completed:false,state:null,stateMax:0,complete:function(){},saveState:function(){}};
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function save(o){try{ME.saveState(o)}catch(e){}}
function done(){try{if(!ME.completed)ME.complete()}catch(e){}}`

const j = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

/**
 * Simulador de bandeja de entrada en el móvil.
 * emails: [{ canal?, partes:[{ l:'De:', t:'texto', s:bool (es señal), why:'por qué' }], cierre:'texto final tras comprobar', legit?:bool }]
 * Estado: {"i":n}. Completa al terminar el último correo.
 */
export function inboxSim({ titulo = 'Marca las señales de alarma', ayuda = 'Toca cada línea que te parezca sospechosa (se marca con 🚩). Cuando acabes, pulsa «Comprobar». Ojo: alguno puede ser legítimo.', emails }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.mail{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 6px 18px rgba(27,42,65,.12);padding:8px 10px 10px}
.mail .top{display:flex;align-items:center;gap:8px;font-size:.8rem;color:var(--mut);font-weight:800;text-transform:uppercase;letter-spacing:.04em;padding:2px 4px 4px}
.ln{display:block;width:100%;text-align:left;background:#fff;color:var(--ink);border:2px solid var(--line);border-radius:10px;margin:6px 0;min-height:46px;font-weight:500;padding:8px 10px;word-break:break-word}
.ln .lb{display:block;font-size:.76rem;font-weight:800;color:var(--mut);text-transform:uppercase}
.ln.on{border-color:var(--bad);background:var(--badbg)}
.ln.on::after{content:'🚩 marcada';display:block;font-size:.8rem;font-weight:800;color:var(--bad)}
.ln.hit{border-color:var(--ok);background:var(--okbg)}.ln.hit::after{content:'✅ Señal bien vista';display:block;font-size:.8rem;font-weight:800;color:var(--ok)}
.ln.miss{border-color:var(--warn);background:var(--warnbg);border-style:dashed}.ln.miss::after{content:'👀 Señal que se te escapó';display:block;font-size:.8rem;font-weight:800;color:var(--warn)}
.ln.fp{border-color:#8895a8;background:var(--soft)}.ln.fp::after{content:'ℹ️ Esta línea es normal';display:block;font-size:.8rem;font-weight:800;color:var(--mut)}
.why{font-size:.9rem;margin:-2px 4px 6px 10px;color:var(--ink)}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px;text-align:right}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, emails })};
var st=ME.state||{i:0};var i=st.i|0;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var S=document.getElementById('s'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.emails.length)/D.emails.length*100)+'%'}
function show(){clear(S);bar();if(i>=D.emails.length)return fin();
 var e=D.emails[i],marks=[],checked=false;
 S.appendChild(h('p','cnt','Correo '+(i+1)+' de '+D.emails.length));
 var m=h('div','mail');m.appendChild(h('div','top',e.canal||'✉️ Bandeja de entrada'));
 var rows=[];
 e.partes.forEach(function(p,k){marks.push(false);var b=h('button','ln');b.setAttribute('aria-pressed','false');
  if(p.l)b.appendChild(h('span','lb',p.l));b.appendChild(document.createTextNode(p.t));
  b.onclick=function(){if(checked)return;marks[k]=!marks[k];b.classList.toggle('on',marks[k]);b.setAttribute('aria-pressed',marks[k]?'true':'false')};
  rows.push(b);m.appendChild(b)});
 S.appendChild(m);
 var go=h('button','','Comprobar');go.style.cssText='margin-top:12px;width:100%';S.appendChild(go);
 go.onclick=function(){if(checked)return;checked=true;var hit=0,miss=0,fp=0,tot=0;
  e.partes.forEach(function(p,k){var b=rows[k];b.classList.remove('on');
   if(p.s){tot++;if(marks[k]){hit++;b.classList.add('hit')}else{miss++;b.classList.add('miss')}
    if(p.why){var w=h('div','why',p.why);b.parentNode.insertBefore(w,b.nextSibling)}}
   else if(marks[k]){fp++;b.classList.add('fp');if(p.why){var w2=h('div','why',p.why);b.parentNode.insertBefore(w2,b.nextSibling)}}});
  var good=(miss===0&&fp===0);var f=h('div','fb '+(good?'good':(hit>0?'mid':'nope')));
  var head=tot===0?(fp===0?'✅ Muy bien: este correo es legítimo y no has marcado nada.':'⚠️ Este correo era legítimo: no tenía señales de alarma.'):(good?'✅ Perfecto: todas las señales y ninguna de más.':'Has encontrado '+hit+' de '+tot+' señales'+(fp?' y has marcado '+fp+' línea(s) normal(es).':'.'));
  f.appendChild(h('b','h',head));f.appendChild(h('div','',e.cierre||''));S.appendChild(f);
  go.style.display='none';var n=h('button','',i+1>=D.emails.length?'Terminar':'Siguiente correo ›');n.style.cssText='margin-top:12px;width:100%';
  n.onclick=function(){i++;save({i:i});show()};S.appendChild(n);n.focus({preventScroll:true})}}
function fin(){var e=h('div','end');e.appendChild(h('div','big','🔎'));e.appendChild(h('h3','','Ya sabes mirar un correo'));
 e.appendChild(h('p','','Una señal es sospecha; dos, no lo toques. Y si el correo es de verdad, no pasa nada por comprobarlo igual llamando tú al número de siempre.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;save({i:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/**
 * Comparador de remitentes. casos: [{ nombre, conocida (dirección que tienes en tu agenda o que sabes), recibida, impostor:bool, porque }]
 * Estado {"i":n,"c":n}. Completa al terminar.
 */
export function senderCompare({ titulo = '¿Es quien dice ser?', ayuda = 'Arriba ves el nombre que muestra el móvil. Toca el nombre para ver la dirección real y compárala con la que tienes guardada. Después decide.', casos }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.inb{border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 6px 18px rgba(27,42,65,.12);overflow:hidden}
.who{display:flex;gap:12px;align-items:center;width:100%;text-align:left;background:#fff;color:var(--ink);border:0;border-radius:0;padding:12px;min-height:64px;font-weight:700}
.who .av{width:44px;height:44px;border-radius:50%;background:var(--pri);color:#fff;display:grid;place-items:center;font-size:1.2rem;flex:none}
.who small{display:block;font-weight:500;color:var(--mut)}
.addr{font-family:ui-monospace,Consolas,monospace;word-break:break-all;padding:10px 12px;border-top:1px dashed var(--line);background:var(--soft)}
.addr .lb{display:block;font-family:system-ui,sans-serif;font-size:.76rem;font-weight:800;color:var(--mut);text-transform:uppercase;margin-bottom:2px}
.addr.rec{background:#fff}
.dx{background:#ffe08a;color:#1b2a41;border-radius:4px;padding:0 2px;font-weight:800;text-decoration:underline wavy #c9302c}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px;text-align:right}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, casos })};
var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var S=document.getElementById('s'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.casos.length)/D.casos.length*100)+'%'}
function diff(a,b){var p=0;while(p<a.length&&p<b.length&&a.charAt(p)===b.charAt(p))p++;var s=0;while(s<a.length-p&&s<b.length-p&&a.charAt(a.length-1-s)===b.charAt(b.length-1-s))s++;return{p:p,s:s}}
function paint(el,txt,d){clear(el);var pre=txt.slice(0,d.p),mid=txt.slice(d.p,txt.length-d.s),suf=txt.slice(txt.length-d.s);
 if(pre)el.appendChild(document.createTextNode(pre));if(mid){var m=h('span','dx',mid);el.appendChild(m)}if(suf)el.appendChild(document.createTextNode(suf))}
function show(){clear(S);bar();if(i>=D.casos.length)return fin();var c=D.casos[i],revealed=false,answered=false;
 S.appendChild(h('p','cnt','Mensaje '+(i+1)+' de '+D.casos.length));
 var box=h('div','inb');var who=h('button','who');var av=h('span','av',c.nombre.charAt(0));who.appendChild(av);var tx=h('span','');tx.appendChild(document.createTextNode(c.nombre));tx.appendChild(h('small','','👆 Toca para ver la dirección real'));who.appendChild(tx);box.appendChild(who);
 var k=h('div','addr');k.appendChild(h('span','lb','La que tienes guardada'));var kv=h('span','',c.conocida);k.appendChild(kv);box.appendChild(k);
 var r=h('div','addr rec');r.style.display='none';r.appendChild(h('span','lb','La que ha escrito este mensaje'));var rv=h('span','',c.recibida);r.appendChild(rv);box.appendChild(r);
 S.appendChild(box);
 var row=h('div','row');row.style.marginTop='12px';var b1=h('button','ok','✅ Es la misma persona'),b2=h('button','bad','🚩 Es un impostor');row.appendChild(b1);row.appendChild(b2);S.appendChild(row);
 function reveal(){if(revealed)return;revealed=true;r.style.display='block';tx.lastChild.textContent='Dirección real mostrada abajo'}
 who.onclick=reveal;
 function judge(imp){if(answered)return;if(!revealed){reveal();var w=h('p','sub','Primero mira la dirección real (la acabamos de mostrar). Ahora sí: decide.');w.style.marginTop='8px';S.appendChild(w);setTimeout(function(){if(w.parentNode)w.parentNode.removeChild(w)},2600);return}
  answered=true;var good=(imp===!!c.impostor);if(good)ok++;var d=diff(c.conocida,c.recibida);
  if(c.conocida!==c.recibida){paint(kv,c.conocida,d);paint(rv,c.recibida,d)}
  row.style.display='none';var f=h('div','fb '+(good?'good':'nope'));
  f.appendChild(h('b','h',(good?'✅ ¡Bien visto! ':'❌ Ojo: ')+(c.impostor?'era un impostor.':'era la persona real.')));f.appendChild(h('div','',c.porque));S.appendChild(f);
  var n=h('button','','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){i++;save({i:i,c:ok});show()};S.appendChild(n);n.focus({preventScroll:true})}
 b1.onclick=function(){judge(false)};b2.onclick=function(){judge(true)}}
function fin(){var t=D.casos.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t*0.8?'🕵️':'📚'));e.appendChild(h('h3','','Has acertado '+ok+' de '+t));
 e.appendChild(h('p','','El nombre lo puede escribir cualquiera; la dirección es lo que cuenta, y a veces difiere solo en una letra. Si algo no cuadra, verifica por otro canal.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/**
 * «He picado»: situaciones → pasos. situaciones: [{ t:'Qué ha pasado', icon:'🔗', pasos:['...'], nota:'...' }]
 * Estado {"v":máscara de vistas}. Completa al ver todas.
 */
export function triage({ titulo = '¿Qué ha pasado?', ayuda = 'Elige tu situación y verás qué hacer, paso a paso. Mira las seis: así sabrás actuar en cualquier caso.', situaciones, siempre }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div class="grid" id="g"></div><div id="p"></div></div>`
  const css = BASE_CSS + `
.grid{display:grid;grid-template-columns:1fr;gap:8px}
.sit{display:flex;gap:10px;align-items:center;text-align:left;background:#fff;color:var(--ink);border:2px solid var(--line);font-weight:700;border-radius:12px;min-height:50px}
.sit .ic{font-size:1.4rem;flex:none}
.sit.sel{border-color:var(--pri);background:#fff3ee}
.sit.seen::after{content:'✓';margin-left:auto;color:var(--ok);font-weight:900}
.panel{margin-top:12px;border:2px solid var(--pri);border-radius:16px;background:#fff;padding:12px 14px;animation:pop .25s}
.panel h4{margin:0 0 8px;font-size:1.05rem}
.step{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:var(--soft);color:var(--ink);border:1px solid var(--line);font-weight:500;margin:6px 0;border-radius:10px;min-height:46px}
.step .n{flex:none;width:28px;height:28px;border-radius:50%;background:var(--pri);color:#fff;display:grid;place-items:center;font-weight:800}
.step.done .n{background:var(--ok)}.step.done{background:var(--okbg);border-color:#9fdcbc}
.nota{margin-top:8px;font-size:.92rem;color:var(--mut)}
.always{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--warnbg);border:1px solid #f0cf8a;font-weight:600}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, situaciones, siempre })};
var mask=(ME.state&&ME.state.v)|0;var N=D.situaciones.length;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var G=document.getElementById('g'),P=document.getElementById('p'),pb=document.getElementById('pb'),btns=[];
function cnt(){var c=0;for(var k=0;k<N;k++)if(mask&(1<<k))c++;return c}
function bar(){pb.style.width=Math.round(cnt()/N*100)+'%'}
D.situaciones.forEach(function(s,k){var b=h('button','sit'+((mask&(1<<k))?' seen':''));b.appendChild(h('span','ic',s.icon||'•'));b.appendChild(h('span','',s.t));b.setAttribute('aria-expanded','false');
 b.onclick=function(){btns.forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-expanded','false')});b.classList.add('sel');b.setAttribute('aria-expanded','true');mask|=(1<<k);b.classList.add('seen');save({v:mask});bar();
  clear(P);var pn=h('div','panel');pn.appendChild(h('h4','',s.t));
  s.pasos.forEach(function(p,q){var st=h('button','step');st.appendChild(h('span','n',String(q+1)));st.appendChild(h('span','',p));st.setAttribute('aria-pressed','false');st.onclick=function(){var on=st.classList.toggle('done');st.setAttribute('aria-pressed',on?'true':'false')};pn.appendChild(st)});
  if(s.nota)pn.appendChild(h('p','nota',s.nota));if(D.siempre)pn.appendChild(h('div','always',D.siempre));P.appendChild(pn);
  if(cnt()>=N){done();var e=h('div','end');e.style.marginTop='12px';e.appendChild(h('div','big','🛡️'));e.appendChild(h('b','','Ya conoces los seis casos. Lo más valioso siempre es lo mismo: avisar pronto.'));P.appendChild(e)}};
 btns.push(b);G.appendChild(b)});
bar();`
  return { html, css, js, state_max: 20 }
}
