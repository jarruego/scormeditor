/**
 * Interactivos a medida del curso 5 (datos, redes y brechas). Misma estructura que widgets.mjs:
 * cada función devuelve { html, css, js, state_max } para `ix.html({ ...w, prompt:'' })`.
 * Móvil primero (botones >= 46 px, sin hover), texto del autor siempre por textContent,
 * estado ASCII compacto y llamada a MeEmbed.complete() al terminar.
 */
import { swipeDeck } from './widgets.mjs'

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--navy:#234a8a;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#b86e00;--warnbg:#fff4de;--rose:#F4D6D2}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.92rem;margin:0 0 12px}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--navy);transition:transform .08s,filter .15s}
button:active{transform:scale(.97)}
button:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
button:disabled{opacity:.5;cursor:default}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--navy));transition:width .35s}
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
 * Baraja «¿puedo decirlo / hacerlo o no?»: reutiliza swipeDeck con las etiquetas cambiadas.
 * cards: [{ canal, de, asunto?, texto, fraude:true = NO se puede, pistas:[...], porque }]
 */
export function swipeSiNo({ titulo, ayuda, cards }) {
  const w = swipeDeck({ titulo, ayuda, cards })
  const rep = [
    ["'FRAUDE'", "'NO'"], ["'LEGÍTIMO'", "'SÍ'"],
    ['🚩 Es un fraude', '⛔ No puedo'], ['✅ Es legítimo', '✅ Sí puedo'],
    ["'era un FRAUDE.'", "'NO se debe hacer.'"], ["'era LEGÍTIMO.'", "'SÍ se puede.'"],
    ["'Mensaje '", "'Caso '"],
    ['Muy buen ojo. Ante la duda, sigue verificando por otro canal.', 'Muy bien. Recuerda: ante la duda, pregunta a tu responsable antes de decir, enviar o publicar.'],
    ['No pasa nada: la duda es tu mejor defensa. Repite la baraja y fíjate en las pistas.', 'No pasa nada: lo importante es preguntarte siempre «¿lo necesito para cuidar a esta persona?». Repite la baraja y fíjate en las pistas.'],
    ['✅ ¡Bien visto! ', '✅ ¡Bien decidido! '], ['❌ Ojo: ', '❌ Ojo: '],
  ]
  let js = w.js
  for (const [a, b] of rep) {
    if (!js.includes(a)) throw new Error('swipeSiNo: no encuentro «' + a + '» en swipeDeck (¿cambió widgets.mjs?)')
    js = js.split(a).join(b)
  }
  return { ...w, js }
}

/**
 * «Semáforo del dato»: de una ficha de residente se va viendo dato a dato y se marca QUIÉN puede verlo.
 * datos: [{ t:'Diagnóstico', sub:'p. ej. demencia', ok:[0] (índices de AUD), porque }]
 * Cuantos menos grupos pueden verlo, más rojo el semáforo. Estado {"i":n,"c":n}.
 */
export function semaforoDato({ datos, titulo = 'Semáforo del dato', ayuda = 'Toca los grupos que SÍ necesitan ver este dato para su trabajo. Si ninguno lo necesita, no marques nada.' }) {
  const AUD = ['🩺 Equipo asistencial', '🧾 Administración', '👪 Familia autorizada']
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.ficha{background:#fff;border:2px solid var(--navy);border-radius:16px;overflow:hidden;box-shadow:0 6px 18px rgba(27,42,65,.12)}
.ficha .hd{background:var(--navy);color:#fff;padding:8px 14px;font-size:.82rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;display:flex;justify-content:space-between}
.ficha .bd{padding:12px 14px}.ficha .dt{font-weight:800;font-size:1.1rem}.ficha .ds{color:var(--mut);font-size:.9rem;margin-top:2px}
.aud{display:flex;flex-direction:column;gap:8px;margin:12px 0}
.aud button{background:#fff;color:var(--ink);border:2px solid var(--line);text-align:left;display:flex;gap:10px;align-items:center;font-weight:700}
.aud button .bx{width:24px;height:24px;border-radius:7px;border:2px solid var(--mut);flex:none;display:grid;place-items:center;font-size:.95rem;line-height:1}
.aud button[aria-pressed=true]{border-color:var(--navy);background:#e8eefb}
.aud button[aria-pressed=true] .bx{background:var(--navy);border-color:var(--navy);color:#fff}
.aud button.right{border-color:var(--ok);background:var(--okbg)}.aud button.wrong{border-color:var(--bad);background:var(--badbg)}.aud button.miss{border-style:dashed;border-color:var(--ok)}
.luz{display:flex;gap:10px;align-items:center;margin-top:10px;font-weight:800}
.luz i{width:26px;height:26px;border-radius:50%;display:inline-block;border:2px solid #0003}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px;text-align:right}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, datos, AUD })};var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var S=document.getElementById('s'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.datos.length)/D.datos.length*100)+'%'}
function show(){clear(S);bar();if(i>=D.datos.length)return fin();var d=D.datos[i];
 S.appendChild(h('p','cnt','Dato '+(i+1)+' de '+D.datos.length));
 var f=h('div','ficha'),hd=h('div','hd');hd.appendChild(h('span','','Ficha de residente'));hd.appendChild(h('span','','Dato '+(i+1)));f.appendChild(hd);
 var bd=h('div','bd');bd.appendChild(h('div','dt',d.t));if(d.sub)bd.appendChild(h('div','ds',d.sub));f.appendChild(bd);S.appendChild(f);
 var box=h('div','aud'),sel=[],bts=[],locked=false;
 D.AUD.forEach(function(n,k){var b=h('button');b.setAttribute('aria-pressed','false');b.appendChild(h('span','bx',''));b.appendChild(h('span','',n));
  b.onclick=function(){if(locked)return;var p=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',p?'false':'true');b.firstChild.textContent=p?'':'✓'};bts.push(b);box.appendChild(b)});
 S.appendChild(box);var go=h('button','','Comprobar');go.style.width='100%';S.appendChild(go);
 go.onclick=function(){locked=true;go.style.display='none';var good=true;
  bts.forEach(function(b,k){var on=b.getAttribute('aria-pressed')==='true',should=d.ok.indexOf(k)>-1;
   if(on&&should)b.classList.add('right');else if(on&&!should){b.classList.add('wrong');good=false}else if(!on&&should){b.classList.add('miss');good=false}});
  if(good)ok++;var n=d.ok.length;
  var fb=h('div','fb '+(good?'good':'nope'));fb.appendChild(h('b','h',good?'✅ ¡Exacto!':'❌ Casi: mira los grupos marcados'));fb.appendChild(h('div','',d.porque));
  var lz=h('div','luz');var dot=h('i');dot.style.background=n===0?'#6b7a90':n===1?'#d6393f':n===2?'#f0a020':'#1f9d5c';lz.appendChild(dot);
  lz.appendChild(h('span','',n===0?'Gris: no lo necesita nadie fuera de su uso asistencial':n===1?'Rojo: muy restringido (solo 1 grupo)':n===2?'Ámbar: restringido (2 grupos)':'Verde: lo ven varios grupos'));fb.appendChild(lz);S.appendChild(fb);
  var nx=h('button','','Siguiente ›');nx.style.cssText='margin-top:12px;width:100%';nx.onclick=function(){i++;save({i:i,c:ok});show()};S.appendChild(nx);nx.focus({preventScroll:true})}}
function fin(){var t=D.datos.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t*0.8?'🚦':'📚'));e.appendChild(h('h3','','Has acertado '+ok+' de '+t));
 e.appendChild(h('p','','Regla de oro: cada dato solo lo ve quien lo necesita para su trabajo con esa persona. Que el sistema te deje abrirlo no significa que debas.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/**
 * «Reloj de las 72 horas»: simula una brecha con 3 decisiones; cada elección gasta horas del plazo del centro.
 * etapas: [{ titulo, texto, opciones:[{ t, h (horas perdidas), q:'good'|'mid'|'bad', fb }] }]
 * inicio: { dia: 0..6 (0 = lunes), hora: 18.67 } etiqueta de partida. Estado {"p":[k,k,k]}.
 */
export function relojBrecha({ titulo = 'El reloj de las 72 horas', ayuda, inicio, etapas, final }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="clock" aria-live="polite"><div class="ring" id="rg"><div class="in"><b id="rh">72</b><small>horas</small></div></div><div class="inf"><div class="when" id="wh"></div><div class="rest" id="rs"></div></div></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.clock{display:flex;gap:14px;align-items:center;background:#101c2e;color:#fff;border-radius:18px;padding:12px 14px;margin:6px 0 12px}
.ring{width:92px;height:92px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(#2fb36d 100%,#33435a 0)}
.ring .in{width:68px;height:68px;border-radius:50%;background:#101c2e;display:grid;place-items:center;text-align:center;line-height:1}
.ring b{font-size:1.5rem}.ring small{font-size:.7rem;opacity:.8;display:block}
.inf{min-width:0}.when{font-weight:800;font-size:1.02rem}.rest{font-size:.88rem;opacity:.85;margin-top:2px}
.sit{background:#fff;border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:10px}
.sit b{display:block;margin-bottom:4px}
.opt{display:block;width:100%;text-align:left;background:var(--soft);color:var(--ink);border:1px solid var(--line);margin:8px 0;font-weight:600}
.cost{display:inline-block;margin-top:4px;font-size:.85rem;font-weight:800}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, inicio, etapas, final })};var DIAS=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
var path=(ME.state&&ME.state.p)?ME.state.p.slice():[];
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var S=document.getElementById('s');
function lost(n){var t=0;for(var k=0;k<n;k++){t+=D.etapas[k].opciones[path[k]].h}return t}
function stamp(hs){var m=Math.round((D.inicio.dia*24+D.inicio.hora+hs)*60);var d=Math.floor(m/1440)%7;var r=m%1440;var hh=Math.floor(r/60),mm=r%60;return DIAS[d].charAt(0).toUpperCase()+DIAS[d].slice(1)+' '+(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm}
function gauge(n){var l=lost(n),rest=Math.max(0,72-l);var pct=Math.round(rest/72*100);var col=rest>=48?'#2fb36d':rest>=24?'#f0a020':'#e5484d';
 document.getElementById('rg').style.background='conic-gradient('+col+' '+pct+'%,#33435a 0)';document.getElementById('rh').textContent=Math.round(rest);
 document.getElementById('wh').textContent=stamp(l);document.getElementById('rs').textContent=n===0?'Ahora mismo: '+D.inicio.etiqueta:'El centro aún dispone de unas '+Math.round(rest)+' h (los fines de semana cuentan)'}
function show(){var n=path.length;clear(S);gauge(n);
 if(n>=D.etapas.length)return fin();var e=D.etapas[n];
 var s=h('div','sit');s.appendChild(h('b','',e.titulo));s.appendChild(h('div','',e.texto));S.appendChild(s);
 e.opciones.forEach(function(o,k){var b=h('button','opt',o.t);b.onclick=function(){pick(n,k)};S.appendChild(b)})}
function pick(n,k){path.push(k);save({p:path});var o=D.etapas[n].opciones[k];clear(S);gauge(n+1);
 var f=h('div','fb '+(o.q==='good'?'good':o.q==='bad'?'nope':'mid'));f.appendChild(h('b','h',(o.q==='good'?'✅ ':o.q==='bad'?'⚠️ ':'💡 ')+o.t));f.appendChild(h('div','',o.fb));
 f.appendChild(h('span','cost',o.h<1?'Coste: '+Math.round(o.h*60)+' min del plazo':'Coste: '+Math.round(o.h)+' h del plazo'));S.appendChild(f);
 var nx=h('button','',n+1>=D.etapas.length?'Ver el resultado ›':'Seguir ›');nx.style.cssText='margin-top:12px;width:100%';nx.onclick=show;S.appendChild(nx);nx.focus({preventScroll:true})}
function fin(){var rest=Math.max(0,72-lost(path.length));var t=rest>=66?'good':rest>=36?'mid':'bad';
 var e=h('div','end');e.appendChild(h('div','big',t==='good'?'🏅':t==='mid'?'🧭':'⏳'));
 e.appendChild(h('h3','',t==='good'?D.final.good[0]:t==='mid'?D.final.mid[0]:D.final.bad[0]));
 e.appendChild(h('p','','Al centro le quedan unas '+Math.round(rest)+' h de las 72. '+(t==='good'?D.final.good[1]:t==='mid'?D.final.mid[1]:D.final.bad[1])));
 e.appendChild(h('p','sub',D.final.nota));
 var r=h('button','ghost','↺ Probar otras decisiones');r.onclick=function(){path=[];save({p:[]});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 20 }
}

/**
 * «Detective de perfiles»: perfil de red social ficticio; se tocan las publicaciones que ayudarían a un estafador.
 * lineas: [{ k:'bio'|'post'|'foto', t, pista:bool, porque }]
 */
export function detectivePerfil({ nombre, usuario, avatar = '👩', lineas, titulo = 'Detective de perfiles', ayuda = 'Perfil inventado. Toca las publicaciones que ayudarían a un estafador a preparar una llamada creíble. Luego pulsa Comprobar.' }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="prof"><div class="ph"><span class="av" id="av"></span><div><b id="nm"></b><small id="us"></small></div></div><div id="ls"></div></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.prof{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:#fff;box-shadow:0 6px 18px rgba(27,42,65,.12)}
.ph{display:flex;gap:10px;align-items:center;padding:12px 14px;background:linear-gradient(135deg,#e8eefb,#F4D6D2)}
.ph .av{font-size:1.8rem;width:48px;height:48px;border-radius:50%;background:#fff;display:grid;place-items:center}.ph small{display:block;color:var(--mut)}
.ln{display:block;width:100%;text-align:left;background:#fff;color:var(--ink);border:0;border-top:1px solid var(--line);border-radius:0;font-weight:500;padding:12px 14px;min-height:52px;position:relative;padding-right:44px}
.ln .tg{font-size:.72rem;font-weight:800;color:var(--navy);text-transform:uppercase;letter-spacing:.04em;display:block}
.ln .mk{position:absolute;right:12px;top:50%;margin-top:-13px;width:26px;height:26px;border-radius:50%;border:2px solid var(--mut);display:grid;place-items:center;font-size:.9rem}
.ln[aria-pressed=true]{background:#fff4de}.ln[aria-pressed=true] .mk{background:#f0a020;border-color:#f0a020;color:#fff}
.ln.right{background:var(--okbg)}.ln.right .mk{background:var(--ok);border-color:var(--ok);color:#fff}
.ln.wrong{background:var(--badbg)}.ln.wrong .mk{background:var(--bad);border-color:var(--bad);color:#fff}
.ln.miss{background:#fff;outline:3px dashed var(--ok);outline-offset:-3px}
.ln .why{display:block;margin-top:6px;font-size:.88rem;color:var(--ink);font-weight:600}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, nombre, usuario, avatar, lineas })};
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;document.getElementById('av').textContent=D.avatar;document.getElementById('nm').textContent=D.nombre;document.getElementById('us').textContent=D.usuario;
var L=document.getElementById('ls'),S=document.getElementById('s'),bts=[],locked=false;
var NAMES={bio:'Biografía',post:'Publicación',foto:'Foto'};
D.lineas.forEach(function(l,k){var b=h('button','ln');b.setAttribute('aria-pressed','false');b.appendChild(h('span','tg',NAMES[l.k]||'Publicación'));b.appendChild(h('span','',l.t));b.appendChild(h('span','mk',''));
 b.onclick=function(){if(locked)return;var p=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',p?'false':'true');b.lastChild.textContent=p?'':'🔍'};bts.push(b);L.appendChild(b)});
var go=h('button','','Comprobar');go.style.cssText='margin-top:12px;width:100%';S.appendChild(go);
go.onclick=function(){locked=true;go.style.display='none';var hit=0,tot=0,bad=0;
 D.lineas.forEach(function(l,k){var b=bts[k],on=b.getAttribute('aria-pressed')==='true';if(l.pista)tot++;
  var cls=null,mark='';if(on&&l.pista){hit++;cls='right';mark='✓'}else if(on&&!l.pista){bad++;cls='wrong';mark='✗'}else if(!on&&l.pista){cls='miss';mark='!'}
  if(cls){b.classList.add(cls);b.lastChild.textContent=mark}
  if(cls==='right'||cls==='miss'||cls==='wrong'){b.insertBefore(h('span','why',l.porque),b.lastChild)}});
 var good=(hit===tot&&bad===0);var f=h('div','fb '+(good?'good':'mid'));f.appendChild(h('b','h',good?'🕵️ ¡Ojo de detective!':'Has encontrado '+hit+' de '+tot+' pistas'+(bad?' y has marcado '+bad+' que no lo eran':'')));
 f.appendChild(h('div','','Cada dato suelto parece inofensivo, pero juntos permiten una llamada muy creíble: «soy del servicio técnico y tu supervisora me ha dicho…». Revisa quién ve tu perfil y no publiques nada del trabajo.'));S.appendChild(f);
 var r=h('button','ghost','↺ Repetir');r.style.cssText='margin-top:12px;width:100%';r.onclick=function(){locked=false;bts.forEach(function(b){b.className='ln';b.setAttribute('aria-pressed','false');var w=b.querySelector('.why');if(w)b.removeChild(w);b.lastChild.textContent=''});clear(S);S.appendChild(go);go.style.display=''};S.appendChild(r);done()};`
  return { html, css, js, state_max: 0 }
}
