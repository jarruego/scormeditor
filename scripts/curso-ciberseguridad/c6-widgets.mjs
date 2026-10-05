/**
 * Interactivos a medida del curso 6 (IA): detector de deepfake, semáforo de datos y anonimizador.
 * Mismo contrato que widgets.mjs: devuelven { html, css, js, state_max } para `ix.html(...)`.
 * Corren en el iframe aislado (sin red, sin SCORM); solo hablan por window.MeEmbed.
 * Texto del autor por textContent; el SVG del detector es una constante propia (innerHTML seguro).
 * NOTA: el código JS va dentro de template literals: sin backticks, sin «${» y sin barras invertidas.
 */

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#b86e00;--warnbg:#fff4de;--vio:#7a3fd1}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.92rem;margin:0 0 12px}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--blue);transition:transform .08s,filter .15s}
button:active{transform:scale(.97)}
button:focus-visible,[role=button]:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--teal),var(--vio));transition:width .35s}
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

/* ------------------------------------------------------------------ */
/* 1. Detector de deepfake                                              */
/* ------------------------------------------------------------------ */
const FACE_SVG = `<svg id="sc" viewBox="0 0 320 330" role="group" aria-label="Escena de videollamada con la cara de un supuesto director" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="bl"><feGaussianBlur stdDeviation="3"/></filter><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9d6ea"/><stop offset="1" stop-color="#e4ebf6"/></linearGradient></defs>
<rect width="320" height="330" rx="14" fill="url(#wall)"/>
<rect x="238" y="18" width="70" height="108" rx="6" fill="#fff6c9" stroke="#fff" stroke-width="5"/>
<path d="M238 40 L206 90 L206 120 L238 100 Z" fill="#fff6c9" opacity=".5"/>
<rect x="16" y="40" width="72" height="56" rx="4" fill="#fff" stroke="#8b7355" stroke-width="5"/>
<path d="M22 84 L40 62 L54 76 L66 58 L82 84 Z" fill="#7fb77e"/>
<path d="M22 64 L52 64 L50 70 L84 70" fill="none" stroke="#e5484d" stroke-width="2.5" opacity=".7"/>
<rect x="30" y="52" width="26" height="6" fill="#c9d6ea"/><rect x="62" y="70" width="22" height="6" fill="#c9d6ea"/>
<path d="M60 330 Q60 250 160 250 Q260 250 260 330 Z" fill="#1b2a41"/>
<path d="M140 252 L160 300 L180 252 Z" fill="#fff"/><path d="M155 262 L165 262 L170 322 L160 330 L150 322 Z" fill="#7a3fd1"/>
<rect x="144" y="212" width="32" height="44" rx="12" fill="#e0b48f"/>
<ellipse cx="160" cy="150" rx="58" ry="70" fill="#f2c9a5"/>
<path d="M100 140 Q96 76 160 78 Q224 76 220 140 Q206 108 160 108 Q114 108 100 140 Z" fill="#3b2a20"/>
<path d="M98 128 Q92 168 110 196" fill="none" stroke="#3b2a20" stroke-width="7" opacity=".55" filter="url(#bl)"/>
<path d="M99 150 Q96 176 112 200" fill="none" stroke="#f2c9a5" stroke-width="4" stroke-dasharray="3 5" opacity=".9"/>
<ellipse cx="196" cy="162" rx="22" ry="50" fill="#1b2a41" opacity=".2"/>
<ellipse cx="138" cy="142" rx="13" ry="9" fill="#fff"/><circle cx="138" cy="142" r="5" fill="#1b2a41"/>
<ellipse cx="182" cy="142" rx="13" ry="9" fill="#fff"/><circle cx="182" cy="142" r="5" fill="#1b2a41"/>
<path d="M168 142 Q182 128 196 142 L196 134 Q182 124 168 134 Z" fill="#e0b48f"/>
<path d="M124 124 q14 -8 28 0 M168 124 q14 -8 28 0" fill="none" stroke="#3b2a20" stroke-width="4" stroke-linecap="round"/>
<path d="M160 148 q-5 22 3 26" fill="none" stroke="#c68a5e" stroke-width="3" stroke-linecap="round"/>
<g class="mouth"><path d="M138 200 Q160 218 182 200 Q160 206 138 200 Z" fill="#a23b3b"/><path d="M142 201 Q160 208 178 201" stroke="#fff" stroke-width="3" fill="none"/></g>
<g class="bars" fill="#2f6fed"><rect x="112" y="294" width="8" height="16" rx="4"/><rect x="126" y="288" width="8" height="28" rx="4"/><rect x="140" y="292" width="8" height="20" rx="4"/><rect x="154" y="284" width="8" height="36" rx="4"/><rect x="168" y="290" width="8" height="24" rx="4"/><rect x="182" y="286" width="8" height="32" rx="4"/><rect x="196" y="294" width="8" height="16" rx="4"/></g>
<g id="zones"></g></svg>`

export function detectorDeepfake() {
  const zones = [
    { id: 0, clue: true, x: 72, y: 124, w: 60, h: 80, label: 'Contorno de la cara y el pelo', t: 'Contornos borrosos', d: 'Alrededor del pelo y la mandíbula la imagen «tiembla» o se emborrona al moverse. Es el sitio donde la IA más se equivoca.' },
    { id: 1, clue: true, x: 196, y: 112, w: 54, h: 100, label: 'Sombra de la cara', t: 'Sombras que no cuadran', d: 'La luz entra por la ventana de la derecha, pero la sombra cae también a la derecha. En una persona real, la sombra iría al lado contrario.' },
    { id: 2, clue: true, x: 114, y: 122, w: 82, h: 40, label: 'Ojos', t: 'Parpadeo raro', d: 'Un ojo medio cerrado y el otro abierto, o parpadear muy poco o a destiempo. Una persona real parpadea con naturalidad y a la vez con los dos ojos.' },
    { id: 3, clue: true, x: 120, y: 184, w: 80, h: 44, label: 'Boca', t: 'Labios que no siguen la voz', d: 'Las barras de sonido suben y bajan a un ritmo y la boca se mueve a otro. Si los labios no van con la voz, desconfía.' },
    { id: 4, clue: true, x: 8, y: 34, w: 86, h: 70, label: 'Fondo de la sala', t: 'Fondo con fallos', d: 'El cuadro de la pared tiene líneas partidas y trozos desplazados. Los objetos del fondo que se deforman delatan una imagen fabricada.' },
    { id: 5, clue: false, x: 124, y: 258, w: 72, h: 66, label: 'Traje y corbata', t: 'El traje no dice nada', d: 'La ropa puede ser perfecta en un vídeo falso. Fíjate en la cara y en el fondo, no en lo bien vestido que va.' },
    { id: 6, clue: false, x: 232, y: 14, w: 80, h: 116, label: 'Ventana', t: 'La ventana: una pista de luz', d: 'De aquí viene la luz de la sala. Úsala para comprobar hacia dónde debería caer la sombra de la cara.' },
  ]
  const html = `<div class="wrap"><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><p class="cnt" id="cn" aria-live="polite"></p><div class="scene">${FACE_SVG}</div><div id="fb"></div><div id="end"></div></div>`
  const css = BASE_CSS + `
.scene{max-width:380px;margin:0 auto;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:#fff;box-shadow:0 6px 18px rgba(27,42,65,.12)}
.scene svg{display:block;width:100%;height:auto;touch-action:manipulation}
.cnt{margin:0 0 8px;font-weight:800;text-align:center}
.z{fill:rgba(255,255,255,.01);stroke:#fff;stroke-width:2.5;stroke-dasharray:6 5;cursor:pointer}
.z:hover{fill:rgba(255,255,255,.2)}
.z.found{stroke:#1f9d5c;stroke-dasharray:none;stroke-width:3.5;fill:rgba(31,157,92,.14)}
.z.seen{stroke:#b86e00;stroke-dasharray:none;fill:rgba(184,110,0,.12)}
.zb{pointer-events:none}
.mouth{transform-origin:160px 204px;animation:talk .5s ease-in-out infinite alternate}
.bars rect{transform-box:fill-box;transform-origin:center;animation:bar 1.1s ease-in-out infinite alternate}
.bars rect:nth-child(2n){animation-duration:.8s}.bars rect:nth-child(3n){animation-duration:1.4s}
@keyframes talk{from{transform:scaleY(.35)}to{transform:scaleY(1.2)}}
@keyframes bar{from{transform:scaleY(.4)}to{transform:scaleY(1.3)}}`
  const js = `${SHIM}
var Z=${j(zones)};var mask=(ME.state&&ME.state.f)|0;var seen=0;
var sc=document.getElementById('zones'),NS='http://www.w3.org/2000/svg';
document.getElementById('a').textContent='Toca las zonas de la imagen donde creas que hay un fallo de la IA. Hay cinco pistas escondidas: el contorno, la luz, los ojos, la boca y el fondo.';
var pb=document.getElementById('pb'),cn=document.getElementById('cn'),fb=document.getElementById('fb'),endEl=document.getElementById('end');
function el(n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);return e}
var rects=[],marks=[];
function count(){var c=0;for(var k=0;k<5;k++)if(mask&(1<<k))c++;return c}
function paint(){var c=count();pb.style.width=Math.round(c/5*100)+'%';cn.textContent='Pistas encontradas: '+c+' de 5';
 Z.forEach(function(z,i){var r=rects[i];r.setAttribute('class','z'+(z.clue&&(mask&(1<<z.id))?' found':(!z.clue&&(seen&(1<<z.id))?' seen':'')));
  var m=marks[i];if(m)m.setAttribute('visibility',z.clue&&(mask&(1<<z.id))?'visible':'hidden')});
 if(c>=4)finish()}
function finish(){clear(endEl);var e=h('div','end');e.appendChild(h('div','big','🕵️'));e.appendChild(h('h3','','Buen ojo: has encontrado '+count()+' pistas'));
 e.appendChild(h('p','','Pero atención: cada mes las falsificaciones salen mejor y estas pistas fallan más. Lo que de verdad te protege no es fijarte en la cara, sino el procedimiento: cortar y verificar por otro canal antes de hacer nada.'));
 var r=h('button','ghost','↺ Empezar de nuevo');r.onclick=function(){mask=0;seen=0;save({f:0});clear(fb);clear(endEl);paint()};e.appendChild(r);endEl.appendChild(e);done()}
Z.forEach(function(z,i){var r=el('rect',{x:z.x,y:z.y,width:z.w,height:z.h,rx:10,'class':'z',tabindex:0,role:'button','aria-label':z.label});
 r.addEventListener('click',function(){tap(z)});r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();tap(z)}});
 sc.appendChild(r);rects.push(r);
 if(z.clue){var g=el('g',{'class':'zb',visibility:'hidden'});g.appendChild(el('circle',{cx:z.x+z.w-6,cy:z.y+8,r:11,fill:'#1f9d5c'}));var p=el('path',{d:'M'+(z.x+z.w-11)+' '+(z.y+8)+' l4 5 l8 -10',fill:'none',stroke:'#fff','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'});g.appendChild(p);sc.appendChild(g);marks.push(g)}else marks.push(null)});
function tap(z){if(z.clue)mask|=(1<<z.id);else seen|=(1<<z.id);save({f:mask});clear(fb);
 var f=h('div','fb '+(z.clue?'good':'mid'));f.appendChild(h('b','h',(z.clue?'✅ Pista: ':'💡 ')+z.t));f.appendChild(h('div','',z.d));fb.appendChild(f);paint()}
paint();`
  return { html, css, js, state_max: 20 }
}

/* ------------------------------------------------------------------ */
/* 2. Semáforo de datos                                                 */
/* ------------------------------------------------------------------ */
export function semaforoDatos({ items }) {
  const html = `<div class="wrap"><p class="sub" id="a"></p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 6px;text-align:right}
.card{background:#fff;border:2px solid var(--line);border-radius:18px;box-shadow:0 6px 18px rgba(27,42,65,.12);padding:16px;font-weight:700;font-size:1.05rem;touch-action:none;user-select:none;cursor:grab;position:relative;z-index:2;text-align:center;min-height:84px;display:flex;align-items:center;justify-content:center}
.card.drag{cursor:grabbing;box-shadow:0 14px 28px rgba(27,42,65,.25);transition:none}
.tip{font-size:.8rem;color:var(--mut);text-align:center;margin:6px 0 8px}
.z{display:flex;align-items:center;gap:12px;width:100%;text-align:left;margin:8px 0;min-height:60px;padding:10px 14px;border-radius:14px;border:2px solid transparent;color:var(--ink);font-weight:700}
.z .ic{font-size:1.5rem;flex:none}
.z small{display:block;font-weight:500;color:#33445c;font-size:.82rem}
.z.r{background:#fdeaea;border-color:#e5484d}.z.a{background:#fff4de;border-color:#e08a00}.z.v{background:#e6f6ee;border-color:#2fb36d}
.z.over{transform:scale(1.03);filter:brightness(.96);box-shadow:0 0 0 3px #7a3fd1}
.z[disabled]{opacity:.55;cursor:default}`
  const js = `${SHIM}
var D=${j(items)};var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0,lock=false;
document.getElementById('a').textContent='Arrastra cada dato hasta su luz del semáforo (o toca la luz que elijas): ¿se puede pegar en una IA pública?';
var S=document.getElementById('s'),pb=document.getElementById('pb');
var Z=[{k:'r',ic:'⛔',t:'ROJO · Nunca',s:'Datos de personas, salud, claves, documentos internos'},{k:'a',ic:'⚠️',t:'ÁMBAR · Con cuidado',s:'Solo sin datos, con permiso del centro y revisando'},{k:'v',ic:'✅',t:'VERDE · Sí',s:'Dudas e ideas generales, revisando el resultado'}];
var NAMES={r:'rojo',a:'ámbar',v:'verde'};
function bar(){pb.style.width=Math.round(Math.min(i,D.length)/D.length*100)+'%'}
function show(){clear(S);bar();lock=false;if(i>=D.length)return fin();var it=D[i];
 S.appendChild(h('p','cnt','Dato '+(i+1)+' de '+D.length));
 var card=h('div','card',it.t);card.setAttribute('aria-label','Dato: '+it.t);S.appendChild(card);S.appendChild(h('p','tip','Arrastra la tarjeta o toca una luz'));
 var btns=[];Z.forEach(function(z){var b=h('button','z '+z.k);b.setAttribute('data-z',z.k);b.appendChild(h('span','ic',z.ic));var d=h('span');d.appendChild(h('span','',z.t));d.appendChild(h('small','',z.s));b.appendChild(d);b.onclick=function(){answer(z.k)};S.appendChild(b);btns.push(b)});
 var x0=null,y0=null;
 card.addEventListener('pointerdown',function(e){if(lock)return;x0=e.clientX;y0=e.clientY;card.classList.add('drag');try{card.setPointerCapture(e.pointerId)}catch(_){}});
 card.addEventListener('pointermove',function(e){if(x0==null)return;card.style.transform='translate('+(e.clientX-x0)+'px,'+(e.clientY-y0)+'px)';
  var t=document.elementFromPoint(e.clientX,e.clientY);var zb=t&&t.closest?t.closest('[data-z]'):null;btns.forEach(function(b){b.classList.toggle('over',b===zb)})});
 function end(e){if(x0==null)return;x0=null;card.classList.remove('drag');card.style.transform='';
  var t=document.elementFromPoint(e.clientX,e.clientY);var zb=t&&t.closest?t.closest('[data-z]'):null;btns.forEach(function(b){b.classList.remove('over')});if(zb)answer(zb.getAttribute('data-z'))}
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',function(){x0=null;card.classList.remove('drag');card.style.transform=''});
}
function answer(k){if(lock)return;lock=true;var it=D[i];var good=(k===it.c);if(good)ok++;
 var btns=S.querySelectorAll('button.z');for(var q=0;q<btns.length;q++){btns[q].disabled=true;btns[q].classList.remove('over')}
 var f=h('div','fb '+(good?'good':'nope'));f.appendChild(h('b','h',good?'✅ ¡Bien! Es '+NAMES[it.c]+'.':'❌ Ojo: este dato es '+NAMES[it.c]+'.'));f.appendChild(h('div','',it.p));S.appendChild(f);
 var n=h('button','',i+1>=D.length?'Ver resultado ›':'Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){i++;save({i:i,c:ok});show()};S.appendChild(n);n.focus({preventScroll:true})}
function fin(){var t=D.length;var e=h('div','end');e.appendChild(h('div','big',ok>=t*0.8?'🚦':'📚'));e.appendChild(h('h3','','Has acertado '+ok+' de '+t));
 e.appendChild(h('p','','Truco rápido: ¿puede identificar a una persona real o al centro? ¿lo dejarías en el tablón de la calle? Si no, no lo pegues.'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30 }
}

/* ------------------------------------------------------------------ */
/* 3. Anonimizador: tacha lo que identifica                             */
/* ------------------------------------------------------------------ */
export function anonimizador({ partes, limpio }) {
  const html = `<div class="wrap"><p class="sub" id="a"></p><div class="msg" id="m"></div><div class="row" style="margin-top:12px"><button id="ck">Comprobar</button><button id="rs" class="ghost">↺ Empezar de nuevo</button></div><div id="fb"></div></div>`
  const css = BASE_CSS + `
.msg{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;line-height:2.2;font-size:1.02rem}
.chip{display:inline-block;font:inherit;font-weight:700;min-height:44px;padding:4px 10px;margin:2px 1px;border-radius:10px;background:#eaf0fb;color:var(--ink);border:2px dashed #8aa3d6;vertical-align:middle;cursor:pointer}
.chip.red{background:var(--ink);color:#fff;border-style:solid;border-color:var(--ink);letter-spacing:.06em}
.chip.miss{border-color:#e08a00;background:#fff4de}
.chip.over{border-color:#d6393f;background:#fdeaea;color:var(--ink)}
.clean{margin-top:10px;background:var(--okbg);border:1px solid #9fdcbc;border-radius:12px;padding:10px 12px;font-weight:700}`
  const js = `${SHIM}
var P=${j(partes)};var CLEAN=${j(limpio)};var mask=(ME.state&&ME.state.m)|0;var checked=false;
document.getElementById('a').textContent='Esta frase quiere enviarse a una IA pública. Toca lo que identifica a alguien para taparlo y deja lo que la IA necesita para ayudarte.';
var M=document.getElementById('m'),fb=document.getElementById('fb'),chips=[];
function mark(c){return '█'.repeat(Math.max(3,Math.min(9,c.length)))}
P.forEach(function(p,k){if(p.txt!=null){M.appendChild(document.createTextNode(p.txt));return}
 var b=h('button','chip',p.t);b.type='button';b.setAttribute('aria-pressed','false');b.setAttribute('data-k',k);b.onclick=function(){mask^=(1<<k);checked=false;save({m:mask});clear(fb);paint()};M.appendChild(b);chips[k]=b});
function paint(){P.forEach(function(p,k){var b=chips[k];if(!b)return;var on=!!(mask&(1<<k));b.className='chip'+(on?' red':'');b.textContent=on?mark(p.t):p.t;b.setAttribute('aria-pressed',on?'true':'false');b.setAttribute('aria-label',on?'Tapado: '+p.t:p.t)})}
function check(){var miss=[],over=[];P.forEach(function(p,k){if(p.txt!=null)return;var on=!!(mask&(1<<k));if(p.id&&!on)miss.push(k);if(!p.id&&on)over.push(k)});
 paint();miss.forEach(function(k){chips[k].classList.add('miss')});over.forEach(function(k){chips[k].classList.add('over')});clear(fb);
 var cls=miss.length?'nope':over.length?'mid':'good';var f=h('div','fb '+cls);
 if(!miss.length&&!over.length){f.appendChild(h('b','h','✅ Perfecto: ya no hay nada que identifique a nadie'));f.appendChild(h('div','','Y la IA conserva lo que necesita para ayudarte con tu pregunta.'))}
 else if(!miss.length){f.appendChild(h('b','h','🟡 Bien, pero has tapado de más'));var u=h('ul');over.forEach(function(k){u.appendChild(h('li','',P[k].t+': '+P[k].why))});f.appendChild(u)}
 else{f.appendChild(h('b','h','❌ Aún se puede reconocer a la persona'));var u2=h('ul');miss.forEach(function(k){u2.appendChild(h('li','',P[k].t+': '+P[k].why))});f.appendChild(u2);
  if(over.length){var u3=h('ul');over.forEach(function(k){u3.appendChild(h('li','','Esto sí se puede dejar: '+P[k].t+' ('+P[k].why+')'))});f.appendChild(u3)}}
 fb.appendChild(f);
 if(!miss.length){var cl=h('div','clean','Versión segura: '+CLEAN);fb.appendChild(cl);done()}}
document.getElementById('ck').onclick=check;
document.getElementById('rs').onclick=function(){mask=0;save({m:0});clear(fb);paint()};
paint();`
  return { html, css, js, state_max: 20 }
}
