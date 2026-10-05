/**
 * Kit de interactivos a medida (HTML+CSS+JS) para `ix.html(...)`: cada función devuelve
 * `{ html, css, js }` listo para pasar a `ix.html({ ...widget, height?, prompt })`.
 *
 * Corren en el iframe aislado de `html_embed` (sin red, sin SCORM): solo hablan con la
 * carcasa por `window.MeEmbed` (complete / saveState, estado ASCII compacto).
 * Diseñados para móvil: botones grandes (≥44 px), sin hover, sin 100vh, texto legible.
 * Todo el texto del autor entra por `textContent` (nunca innerHTML).
 */

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#b86e00;--warnbg:#fff4de;--vio:#6a4fd0}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.92rem;margin:0 0 12px}
.ttl:empty,.sub:empty{display:none}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--blue);transition:transform .08s,filter .15s}
button:active{transform:scale(.97)}
button:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
button.ok{background:var(--ok)} button.bad{background:var(--bad)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--blue));transition:width .35s}
.fb{margin-top:12px;border-radius:14px;padding:12px 14px;animation:pop .25s ease-out}
.fb.good{background:var(--okbg);border:1px solid #9fdcbc}.fb.nope{background:var(--badbg);border:1px solid #f1a9ac}.fb.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.fb b.h{display:block;font-size:1.02rem;margin-bottom:4px}
.fb ul{margin:6px 0 0;padding-left:20px}.fb li{margin:2px 0}
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
 * Baraja deslizable «¿legítimo o fraude?». Desliza a la derecha = legítimo, izquierda = fraude
 * (o toca los botones). cards: [{ canal:'✉️ Correo'|'💬 WhatsApp'|'📱 SMS'|'📞 Llamada', de, asunto?, texto, fraude:bool, pistas:[...], porque }]
 * Estado guardado: {"i":n,"c":n}. Completa al terminar la baraja.
 */
export function swipeDeck({ titulo = '¿Legítimo o fraude?', ayuda = 'Desliza la tarjeta a la derecha si es legítima y a la izquierda si es un fraude. También puedes usar los botones.', cards }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="stage"></div></div>`
  const css = BASE_CSS + `
.stage{position:relative;min-height:240px}
.card{background:var(--bg);border:1px solid var(--line);border-radius:18px;box-shadow:0 6px 18px rgba(27,42,65,.12);padding:14px 16px;touch-action:pan-y;user-select:none;position:relative;transition:transform .2s}
.card .ch{font-size:.8rem;font-weight:800;color:var(--blue);text-transform:uppercase;letter-spacing:.04em}
.card .de{font-weight:800;margin-top:4px;word-break:break-word}.card .as{font-weight:700;margin-top:2px;color:var(--ink)}
.card .tx{margin-top:8px;white-space:pre-wrap;word-break:break-word}
.card .hint{position:absolute;top:10px;right:12px;font-weight:900;padding:2px 10px;border-radius:8px;opacity:0;font-size:.9rem}
.card .hint.l{left:12px;right:auto;color:var(--bad);border:2px solid var(--bad)}.card .hint.r{color:var(--ok);border:2px solid var(--ok)}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px;text-align:right}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, cards })};
var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0,lock=false;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var stage=document.getElementById('stage'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.cards.length)/D.cards.length*100)+'%'}
function show(){clear(stage);bar();lock=false;
 if(i>=D.cards.length){return fin()}
 var c=D.cards[i];stage.appendChild(h('p','cnt','Mensaje '+(i+1)+' de '+D.cards.length));
 var card=h('div','card');card.appendChild(h('div','ch',c.canal));card.appendChild(h('div','de',c.de));
 if(c.asunto)card.appendChild(h('div','as',c.asunto));card.appendChild(h('div','tx',c.texto));
 var hl=h('span','hint l','FRAUDE'),hr=h('span','hint r','LEGÍTIMO');card.appendChild(hl);card.appendChild(hr);stage.appendChild(card);
 var row=h('div','row');row.style.marginTop='12px';
 var b1=h('button','bad','🚩 Es un fraude'),b2=h('button','ok','✅ Es legítimo');row.appendChild(b1);row.appendChild(b2);stage.appendChild(row);
 b1.onclick=function(){answer(true)};b2.onclick=function(){answer(false)};
 var x0=null;
 card.addEventListener('pointerdown',function(e){x0=e.clientX;try{card.setPointerCapture(e.pointerId)}catch(_){}});
 card.addEventListener('pointermove',function(e){if(x0==null)return;var dx=e.clientX-x0;card.style.transform='translateX('+dx+'px) rotate('+dx/25+'deg)';card.style.transition='none';hl.style.opacity=dx<0?Math.min(1,-dx/80):0;hr.style.opacity=dx>0?Math.min(1,dx/80):0});
 function end(e){if(x0==null)return;var dx=e.clientX-x0;x0=null;card.style.transition='transform .2s';if(Math.abs(dx)>90){answer(dx<0)}else{card.style.transform='';hl.style.opacity=0;hr.style.opacity=0}}
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',end);
}
function answer(sayFraud){if(lock)return;lock=true;var c=D.cards[i];var good=(sayFraud===!!c.fraude);if(good)ok++;
 clear(stage);bar();var card=h('div','fb '+(good?'good':'nope'));
 card.appendChild(h('b','h',(good?'✅ ¡Bien visto! ':'❌ Ojo: ')+(c.fraude?'era un FRAUDE.':'era LEGÍTIMO.')));
 card.appendChild(h('div','',c.porque));
 if(c.pistas&&c.pistas.length){var ul=h('ul');c.pistas.forEach(function(p){ul.appendChild(h('li','',p))});card.appendChild(ul)}
 stage.appendChild(card);var n=h('button','','Siguiente ›');n.style.marginTop='12px';n.style.width='100%';
 n.onclick=function(){i++;save({i:i,c:ok});show()};stage.appendChild(n);n.focus({preventScroll:true})}
function fin(){var t=D.cards.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t*0.8?'🏅':ok>=t*0.5?'👍':'📚'));
 e.appendChild(h('h3','','Has acertado '+ok+' de '+t));
 e.appendChild(h('p','',ok>=t*0.8?'Muy buen ojo. Ante la duda, sigue verificando por otro canal.':'No pasa nada: la duda es tu mejor defensa. Repite la baraja y fíjate en las pistas.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);stage.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/**
 * Historia con decisiones (chat o llamada). nodos:
 * { id: { msgs:[['them'|'me'|'sys', texto]...], choices:[{t, next, q:'good'|'bad'|'mid', fb}], fin?:{tipo:'good'|'bad'|'mid', titulo, texto} } }
 * contacto: {nombre, emoji, sub}. estilo: 'chat' | 'llamada'. Estado: {"p":[indices elegidos]}.
 */
export function chatStory({ titulo, contacto, estilo = 'chat', inicio = 'n1', nodos }) {
  const html = `<div class="wrap"><div class="phone"><div class="top"><span class="av" id="av"></span><div><b id="nm"></b><small id="sb"></small></div></div><div class="msgs" id="m" aria-live="polite"></div><div class="opts" id="o"></div></div></div>`
  const css = BASE_CSS + `
.phone{border:1px solid var(--line);border-radius:20px;overflow:hidden;background:#e9eef6;box-shadow:0 6px 18px rgba(27,42,65,.12)}
.top{display:flex;gap:10px;align-items:center;padding:10px 14px;background:var(--ink);color:#fff}
.top .av{font-size:1.5rem;background:#ffffff22;border-radius:50%;width:40px;height:40px;display:grid;place-items:center}
.top small{display:block;opacity:.75;font-size:.78rem}
.msgs{padding:12px;display:flex;flex-direction:column;gap:8px;min-height:140px}
.b{max-width:86%;padding:9px 12px;border-radius:14px;animation:pop .25s;white-space:pre-wrap;word-break:break-word}
.b.them{align-self:flex-start;background:#fff;border-top-left-radius:4px}
.b.me{align-self:flex-end;background:#d4ecff;border-top-right-radius:4px}
.b.sys{align-self:center;background:transparent;color:var(--mut);font-size:.85rem;text-align:center;font-style:italic}
.b.fbk{align-self:center;max-width:94%;font-size:.88rem;border-radius:12px}
.b.fbk.good{background:var(--okbg);border:1px solid #9fdcbc}.b.fbk.bad{background:var(--badbg);border:1px solid #f1a9ac}.b.fbk.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.opts{display:flex;flex-direction:column;gap:8px;padding:10px 12px 14px;background:#fff;border-top:1px solid var(--line)}
.opts button{background:var(--soft);color:var(--ink);border:1px solid var(--line);text-align:left;font-weight:600}
.opts .hint{font-size:.8rem;color:var(--mut);margin:0}
.calling .top{background:#14304f}.calling .msgs{background:#101c2e}.calling .b.them{background:#223a5a;color:#fff}.calling .b.me{background:#2f6fed;color:#fff}.calling .b.sys{color:#9fb3cf}`
  const js = `${SHIM}
var D=${j({ titulo, contacto, estilo, inicio, nodos })};
var M=document.getElementById('m'),O=document.getElementById('o'),path=[];
document.getElementById('av').textContent=D.contacto.emoji||'👤';document.getElementById('nm').textContent=D.contacto.nombre;document.getElementById('sb').textContent=D.contacto.sub||'';
if(D.estilo==='llamada')document.querySelector('.phone').classList.add('calling');
function say(w,t,c){var b=h('div','b '+(c||w),t);M.appendChild(b);return b}
function node(id,instant){var n=D.nodos[id];clear(O);
 n.msgs.forEach(function(m){say(m[0],m[1])});
 if(n.fin){var t=n.fin.tipo;var f=h('div','end');f.style.margin='4px 10px 12px';f.appendChild(h('div','big',t==='good'?'🏅':t==='bad'?'💥':'🧭'));f.appendChild(h('h3','',n.fin.titulo));f.appendChild(h('p','',n.fin.texto));
  var r=h('button','ghost','↺ Probar otra decisión');r.onclick=function(){path=[];save({p:[]});clear(M);node(D.inicio)};f.appendChild(r);O.appendChild(f);done();return}
 O.appendChild(h('p','hint','Elige qué haces:'));
 n.choices.forEach(function(c,k){var b=h('button','',c.t);b.onclick=function(){pick(id,k)};O.appendChild(b)})}
function pick(id,k){var c=D.nodos[id].choices[k];path.push(k);save({p:path});clear(O);say('me',c.t);
 if(c.fb)say('fbk',(c.q==='good'?'✅ ':c.q==='bad'?'⚠️ ':'💡 ')+c.fb,'fbk '+(c.q||'mid'));
 node(c.next)}
function replay(){var id=D.inicio;for(var s=0;s<path.length;s++){var n=D.nodos[id];n.msgs.forEach(function(m){say(m[0],m[1])});var c=n.choices[path[s]];say('me',c.t);if(c.fb)say('fbk',(c.q==='good'?'✅ ':c.q==='bad'?'⚠️ ':'💡 ')+c.fb,'fbk '+(c.q||'mid'));id=c.next}node(id)}
if(ME.state&&ME.state.p&&ME.state.p.length){path=ME.state.p.slice();replay()}else node(D.inicio);`
  return { html, css, js, state_max: 40 }
}

/**
 * Laboratorio de contraseñas: mide una contraseña de PRÁCTICA (aviso de no usar la real),
 * explica por qué y genera frases de paso con palabras corrientes. Completa al lograr «fuerte».
 */
export function passwordLab({ palabras } = {}) {
  const words = palabras || ['caracol', 'ventana', 'naranja', 'bufanda', 'cometa', 'tortuga', 'montaña', 'violeta', 'guitarra', 'sombrero', 'mariposa', 'estrella', 'cuaderno', 'paraguas', 'campana', 'girasol', 'bicicleta', 'castillo', 'manzana', 'tormenta', 'zapato', 'jardín', 'cascada', 'farolillo', 'turrón', 'balcón', 'almohada', 'pelota', 'río', 'nube']
  const html = `<div class="wrap"><p class="ttl">Laboratorio de contraseñas</p><p class="sub">⚠️ Es un simulador: <b>no escribas aquí tus contraseñas reales</b>. Prueba con ejemplos inventados.</p><label for="pw" class="sub" style="margin:0">Escribe una contraseña de práctica</label><input id="pw" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="p. ej. maria1985"><div class="meter"><i id="mt"></i></div><p id="lv" class="lv">—</p><p id="tm" class="sub"></p><ul id="ck" class="ck"></ul><div class="row"><button id="gen">🎲 Sugerir una frase de paso</button></div><p id="gp" class="gp"></p></div>`
  const css = BASE_CSS + `
input{width:100%;font:inherit;font-size:1.1rem;padding:12px;border-radius:12px;border:2px solid var(--line);margin:6px 0 10px;background:#fff;color:var(--ink)}
input:focus{outline:3px solid #ffbf47;border-color:var(--blue)}
.meter{height:12px;border-radius:99px;background:var(--line);overflow:hidden}.meter>i{display:block;height:100%;width:0;transition:width .3s,background .3s}
.lv{font-weight:800;font-size:1.1rem;margin:.4rem 0 0}
.ck{list-style:none;padding:0;margin:8px 0 12px}.ck li{padding:4px 0}.ck li.y::before{content:'✅ '}.ck li.n::before{content:'⬜ '}
.gp{font-weight:800;font-size:1.15rem;text-align:center;background:var(--soft);border:1px dashed var(--blue);border-radius:12px;padding:12px;margin:10px 0 0;min-height:48px;word-break:break-word}`
  const js = `${SHIM}
var W=${j(words)};var COMUNES=['123456','password','contraseña','qwerty','abc123','111111','iloveyou','admin','letmein','welcome','12345678','123456789','000000','residencia','centro','1234','0000'];
var pw=document.getElementById('pw'),mt=document.getElementById('mt'),lv=document.getElementById('lv'),tm=document.getElementById('tm'),ck=document.getElementById('ck');
function ev(p){var n=p.length,pool=0;if(/[a-z]/.test(p))pool+=26;if(/[A-ZÁÉÍÓÚÑ]/.test(p))pool+=26;if(/[0-9]/.test(p))pool+=10;if(/[^A-Za-z0-9]/.test(p))pool+=32;
 var low=p.toLowerCase();var common=COMUNES.some(function(c){return low.indexOf(c)>-1});
 var seq=/(012|123|234|345|456|567|678|789|abc|bcd|cde|qwe|asd)/i.test(p)||/(.)\\1{2,}/.test(p);
 var year=/(19|20)\\d\\d/.test(p);var onlyLettersNum=/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+[0-9]{1,4}$/.test(p);
 var bits=n*Math.log(Math.max(pool,2))/Math.LN2;if(common)bits=Math.min(bits,18);if(seq)bits-=10;if(year)bits-=8;if(onlyLettersNum)bits-=8;if(n<8)bits=Math.min(bits,30);
 var spaced=/[ -]/.test(p)&&n>=16;if(spaced&&!common)bits=Math.max(bits,60);
 return{bits:Math.max(bits,0),n:n,pool:pool,common:common,seq:seq,year:year,spaced:spaced}}
function human(b){var s=Math.pow(2,b)/2/1e10;if(s<1)return'menos de un segundo';if(s<60)return Math.round(s)+' segundos';if(s<3600)return Math.round(s/60)+' minutos';if(s<86400)return Math.round(s/3600)+' horas';if(s<31536000)return Math.round(s/86400)+' días';var y=s/31536000;if(y<1000)return Math.round(y)+' años';if(y<1e6)return'miles de años';return'millones de años'}
function paint(){var p=pw.value;if(!p){mt.style.width='0';lv.textContent='—';tm.textContent='';ck.innerHTML='';return}
 var e=ev(p);var lvl=e.bits<40?0:e.bits<60?1:e.bits<80?2:3;var names=['Muy débil','Mejorable','Buena','Fuerte'],cols=['#d6393f','#e08a00','#2f9e6b','#1f9d5c'];
 mt.style.width=Math.max(8,Math.min(100,e.bits/90*100))+'%';mt.style.background=cols[lvl];lv.textContent=names[lvl];lv.style.color=cols[lvl];
 tm.textContent='Un programa que pruebe 10.000 millones de combinaciones por segundo tardaría, orientativamente: '+human(e.bits)+'.';
 clear(ck);[[e.n>=12,'12 caracteres o más (mejor 16)'],[!e.common,'No es una contraseña típica ni lleva palabras como «password» o «centro»'],[!e.seq,'Sin secuencias (123, abc, qwe) ni repeticiones (aaa)'],[!e.year,'Sin años o fechas (nacimiento, jubilación…)'],[e.spaced||(e.pool>=62&&e.n>=12),'Mezcla variada o, mejor, varias palabras sueltas (frase de paso)']].forEach(function(r){ck.appendChild(h('li',r[0]?'y':'n',r[1]))});
 if(lvl===3)done()}
pw.addEventListener('input',paint);
document.getElementById('gen').onclick=function(){var a=[];for(var k=0;k<4;k++){a.push(W[Math.floor(Math.random()*W.length)])}var f=a.join('-');document.getElementById('gp').textContent=f;pw.value=f;paint()};`
  return { html, css, js, state_max: 0 }
}

/**
 * Inspector de enlaces: cada enlace se parte en trozos; el alumno toca el trozo que decide el destino
 * (el dominio) y después dice si es fiable. urls: [{ partes:['https://','www.','banco-seguro','.com','/login'], dominio:2 (índice del trozo-dominio), fiable:bool, porque }]
 * Pista general: el dominio real es lo que va justo antes de la primera «/» (y su terminación).
 */
export function urlLab({ titulo = 'Inspector de enlaces', ayuda = 'Toca el trozo del enlace que decide a qué web vas de verdad. Después indica si te fías.', urls }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.url{display:flex;flex-wrap:wrap;gap:4px;background:#101c2e;border-radius:14px;padding:14px 12px;margin:6px 0 12px;font-family:ui-monospace,Consolas,monospace;font-size:1.02rem;word-break:break-all}
.url button{min-height:40px;padding:6px 8px;background:#223a5a;color:#e8f0ff;border-radius:8px;font-family:inherit;font-weight:600}
.url button.sel{background:var(--blue)}.url button.right{background:var(--ok)}.url button.wrong{background:var(--bad)}
.q{font-weight:700;margin:6px 0}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, urls })};var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var S=document.getElementById('s'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.urls.length)/D.urls.length*100)+'%'}
function show(){clear(S);bar();if(i>=D.urls.length)return fin();var u=D.urls[i],picked=-1,verdict=null;
 S.appendChild(h('p','sub','Enlace '+(i+1)+' de '+D.urls.length));
 var box=h('div','url');var bts=[];u.partes.forEach(function(p,k){var b=h('button','',p);b.onclick=function(){if(verdict!==null)return;picked=k;bts.forEach(function(x){x.classList.remove('sel')});b.classList.add('sel')};bts.push(b);box.appendChild(b)});S.appendChild(box);
 S.appendChild(h('p','q','1) Toca el trozo que decide el destino. 2) ¿Te fías?'));
 var row=h('div','row');var b1=h('button','ok','✅ Me fío'),b2=h('button','bad','🚩 No me fío');row.appendChild(b1);row.appendChild(b2);S.appendChild(row);
 function judge(fia){if(verdict!==null)return;if(picked<0){var w=h('p','sub','Primero toca el trozo del enlace que crees que decide el destino.');S.appendChild(w);setTimeout(function(){if(w.parentNode)w.parentNode.removeChild(w)},2200);return}
  verdict=fia;var good=(fia===u.fiable)&&(picked===u.dominio);if(good)ok++;
  bts.forEach(function(b,k){if(k===u.dominio)b.classList.add('right');else if(k===picked)b.classList.add('wrong')});
  var f=h('div','fb '+(good?'good':'nope'));f.appendChild(h('b','h',good?'✅ Correcto':(fia===u.fiable?'🟡 Acertaste el veredicto, pero el trozo clave era el marcado en verde':'❌ Esta vez no')));f.appendChild(h('div','',u.porque));S.appendChild(f);
  var n=h('button','','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){i++;save({i:i,c:ok});show()};S.appendChild(n);row.style.display='none'}
 b1.onclick=function(){judge(true)};b2.onclick=function(){judge(false)}}
function fin(){var e=h('div','end');e.appendChild(h('div','big',ok>=D.urls.length*0.8?'🔎':'📚'));e.appendChild(h('h3','','Has acertado '+ok+' de '+D.urls.length));e.appendChild(h('p','','Recuerda: lo que importa es el dominio, lo que va justo antes de la primera barra «/». Todo lo que se añada delante o detrás puede ser un disfraz.'));var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/**
 * Compromiso personal: el alumno marca los hábitos que se compromete a aplicar y obtiene su «carné».
 * items: [texto...]; minimo: cuántos hay que marcar para completar. Estado: máscara numérica.
 */
export function pledge({ titulo = 'Mi compromiso', intro = 'Marca lo que te comprometes a hacer a partir de hoy.', items, minimo, final = '¡Compromiso firmado! Gracias por cuidar también de los datos de las personas que cuidas.' }) {
  const min = minimo ?? Math.ceil(items.length * 0.6)
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="l"></div><div id="f"></div></div>`
  const css = BASE_CSS + `
label.it{display:flex;gap:12px;align-items:flex-start;padding:12px;border:1px solid var(--line);border-radius:14px;margin:8px 0;background:#fff;cursor:pointer;min-height:48px}
label.it input{width:24px;height:24px;margin-top:2px;accent-color:var(--teal);flex:none}
label.it.on{background:var(--okbg);border-color:#9fdcbc}
.seal{margin-top:12px;text-align:center;padding:16px;border-radius:16px;background:linear-gradient(135deg,#e6f6ee,#e8f0ff);border:2px solid var(--teal);animation:pop .3s}.seal .big{font-size:2.4rem}`
  const js = `${SHIM}
var D=${j({ titulo, intro, items, min, final })};var mask=(ME.state&&ME.state.m)|0;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.intro+' (Mínimo '+D.min+')';
var L=document.getElementById('l'),F=document.getElementById('f'),pb=document.getElementById('pb');
function count(){var c=0;for(var k=0;k<D.items.length;k++)if(mask&(1<<k))c++;return c}
function paint(){var c=count();pb.style.width=Math.round(c/D.items.length*100)+'%';clear(F);if(c>=D.min){var s=h('div','seal');s.appendChild(h('div','big','🛡️'));s.appendChild(h('b','',D.final));F.appendChild(s);done()}}
D.items.forEach(function(t,k){var lb=h('label','it'+((mask&(1<<k))?' on':''));var cb=document.createElement('input');cb.type='checkbox';cb.checked=!!(mask&(1<<k));cb.onchange=function(){if(cb.checked)mask|=(1<<k);else mask&=~(1<<k);lb.classList.toggle('on',cb.checked);save({m:mask});paint()};lb.appendChild(cb);lb.appendChild(h('span','',t));L.appendChild(lb)});
paint();`
  return { html, css, js, state_max: 20 }
}
