/**
 * Interactivos a medida del curso 1 (html_embed). Misma convención que widgets.mjs:
 * cada función devuelve { html, css, js, state_max } para `ix.html({ ...w, prompt:'' })`.
 * Móvil primero (botones >= 44 px, sin hover), texto del autor por textContent,
 * estado ASCII compacto, MeEmbed.complete() al terminar.
 */

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#b86e00;--warnbg:#fff4de;--vio:#6a4fd0}
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
button.cut{background:var(--bad)}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.fb{margin-top:12px;border-radius:14px;padding:12px 14px;animation:pop .25s ease-out}
.fb.good{background:var(--okbg);border:1px solid #9fdcbc}.fb.nope{background:var(--badbg);border:1px solid #f1a9ac}.fb.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.fb b.h{display:block;font-size:1.02rem;margin-bottom:4px}
@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.end{text-align:center;padding:16px 8px;border-radius:16px;background:var(--soft);border:1px solid var(--line);animation:pop .3s;margin-top:12px}
.end .big{font-size:2.2rem}.end h3{margin:.2rem 0}
`

const SHIM = `var ME=window.MeEmbed||{completed:false,state:null,stateMax:0,complete:function(){},saveState:function(){}};
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function save(o){try{ME.saveState(o)}catch(e){}}
function done(){try{if(!ME.completed)ME.complete()}catch(e){}}`

const j = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

/**
 * «Mapa del centro»: plano con 5 zonas tocables. Cada zona muestra su riesgo típico y 2 hábitos
 * que se pueden «aplicar»; un medidor de riesgo global baja con cada hábito (nunca llega a 0).
 * Completa al explorar las 5 zonas y dejar el riesgo en 44 % o menos. Estado: {"e":mascara5,"a":mascara10}.
 * zonas: [{ n:'Recepción', l:'Recepción' (con \n para 2 líneas), e:'🛎️', riesgos:[..], habitos:[h1,h2] }]
 */
export function mapaResidencia({ titulo = 'Mapa del centro', ayuda = 'Toca cada zona para descubrir su riesgo típico y aplica los hábitos que lo reducen. Mira cómo baja el medidor.', zonas }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><svg id="map" viewBox="0 0 600 336" role="group" aria-label="Plano del centro con cinco zonas y el medidor de riesgo"></svg><div id="panel" aria-live="polite"></div><div id="fin"></div></div>`
  const css = BASE_CSS + `
#map{width:100%;height:auto;display:block;margin:2px 0 8px;touch-action:manipulation}
#map .cell{cursor:pointer}
#map .cell rect.bx{transition:fill .25s,stroke .25s}
.panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:12px 14px;animation:pop .25s}
.panel h3{margin:0 0 6px;font-size:1.05rem}
.panel p.k{margin:8px 0 4px;font-weight:800;font-size:.9rem;color:var(--mut);text-transform:uppercase;letter-spacing:.03em}
.panel ul{margin:0 0 6px;padding-left:20px}.panel li{margin:3px 0}
.hab{display:block;width:100%;text-align:left;margin:8px 0 0;background:var(--soft);color:var(--ink);border:2px solid var(--line);font-weight:600}
.hab[aria-pressed=true]{background:var(--okbg);border-color:var(--ok)}
.rn{font-size:.85rem;color:var(--mut);margin:8px 0 0}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, zonas })};
var st=ME.state||{};var ex=st.e|0,ap=st.a|0,sel=-1;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var NS='http://www.w3.org/2000/svg',map=document.getElementById('map'),panel=document.getElementById('panel'),fin=document.getElementById('fin');
function sv(t,a,x){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;return e}
var XS=[8,206,404],YS=[8,172],CW=188,CH=156;
var pos=[[0,0],[1,0],[2,0],[0,1],[1,1]];
function pc(n){var c=0;for(var k=0;k<20;k++)if(n&(1<<k))c++;return c}
function risk(){return 100-8*pc(ap)}
function zoneHabs(i){return (ap>>(i*2))&3}
var cells=[];
function lines(g,x,y,str,size,w,fill){var ls=str.split('\\n');ls.forEach(function(l,k){g.appendChild(sv('text',{x:x,y:y+k*(size+2),'font-size':size,'font-weight':w,fill:fill,'text-anchor':'middle'},l))})}
D.zonas.forEach(function(z,i){var x=XS[pos[i][0]],y=YS[pos[i][1]];
 var g=sv('g',{'class':'cell',role:'button',tabindex:'0','aria-label':z.n});
 var r=sv('rect',{'class':'bx',x:x,y:y,width:CW,height:CH,rx:18,fill:'#fff4de',stroke:'#e0b45a','stroke-width':3});g.appendChild(r);
 g.appendChild(sv('text',{x:x+CW/2,y:y+56,'font-size':40,'text-anchor':'middle'},z.e));
 lines(g,x+CW/2,y+92,z.l,22,800,'#1b2a41');
 var b=sv('text',{x:x+CW-14,y:y+34,'font-size':26,'text-anchor':'end'},'');g.appendChild(b);
 var s=sv('text',{x:x+CW/2,y:y+CH-10,'font-size':16,'font-weight':700,'text-anchor':'middle',fill:'#5b6b82'},'');g.appendChild(s);
 map.appendChild(g);cells.push({g:g,r:r,b:b,s:s});
 function go(){sel=i;ex|=(1<<i);paint();persist()}
 g.addEventListener('click',go);g.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
});
var dial=sv('g',{});var dx=XS[2],dy=YS[1];
dial.appendChild(sv('rect',{x:dx,y:dy,width:CW,height:CH,rx:18,fill:'#fff',stroke:'#d9e2ee','stroke-width':3}));
dial.appendChild(sv('text',{x:dx+CW/2,y:dy+34,'font-size':20,'font-weight':800,'text-anchor':'middle',fill:'#5b6b82'},'RIESGO GLOBAL'));
var dn=sv('text',{x:dx+CW/2,y:dy+92,'font-size':58,'font-weight':800,'text-anchor':'middle',fill:'#d6393f'},'100%');dial.appendChild(dn);
dial.appendChild(sv('rect',{x:dx+20,y:dy+108,width:CW-40,height:12,rx:6,fill:'#d9e2ee'}));
var db=sv('rect',{x:dx+20,y:dy+108,width:CW-40,height:12,rx:6,fill:'#d6393f'});dial.appendChild(db);
var dl=sv('text',{x:dx+CW/2,y:dy+143,'font-size':19,'font-weight':800,'text-anchor':'middle',fill:'#1b2a41'},'ALTO');dial.appendChild(dl);
map.appendChild(dial);
function persist(){save({e:ex,a:ap})}
function paint(){
 cells.forEach(function(c,i){var hb=zoneHabs(i),seen=!!(ex&(1<<i));var full=(hb===3);
  c.r.setAttribute('fill',full?'#e6f6ee':seen?'#fff':'#fff4de');c.r.setAttribute('stroke',full?'#1f9d5c':(sel===i?'#2f6fed':seen?'#9fb3cf':'#e0b45a'));c.r.setAttribute('stroke-width',sel===i?5:3);
  c.b.textContent=full?'✅':seen?'👀':'⚠️';c.s.textContent=full?'Protegida':seen?(hb?'Mejorando':'Sin proteger'):'Toca aquí';c.g.setAttribute('aria-label',D.zonas[i].n+': '+c.s.textContent)});
 var rk=risk();dn.textContent=rk+'%';var col=rk>66?'#d6393f':rk>44?'#b86e00':'#1f9d5c';dn.setAttribute('fill',col);db.setAttribute('fill',col);db.setAttribute('width',Math.max(6,(CW-40)*rk/100));dl.textContent=rk>66?'ALTO':rk>44?'MEDIO':'CONTROLADO';
 clear(panel);
 if(sel>=0){var z=D.zonas[sel];var p=h('div','panel');p.appendChild(h('h3','',z.e+' '+z.n.replace('\\n',' ')));p.appendChild(h('p','k','Riesgos típicos'));var ul=h('ul');z.riesgos.forEach(function(r){ul.appendChild(h('li','',r))});p.appendChild(ul);p.appendChild(h('p','k','Aplica un hábito'));
  z.habitos.forEach(function(t,k){var bit=1<<(sel*2+k);var on=!!(ap&bit);var b=h('button','hab',(on?'✅ ':'⬜ ')+t);b.setAttribute('aria-pressed',on?'true':'false');b.onclick=function(){ap^=bit;persist();paint()};p.appendChild(b)});
  panel.appendChild(p)}
 else panel.appendChild(h('p','sub','Toca una zona del plano para empezar.'));
 clear(fin);
 var all=(ex===31);
 if(all&&rk<=44){var e=h('div','end');e.appendChild(h('div','big','🛡️'));e.appendChild(h('h3','','Riesgo controlado: '+rk+'%'));e.appendChild(h('p','','Fíjate: el riesgo no llega a cero. Por eso, además de los hábitos, siempre hay que avisar cuando algo no cuadra.'));fin.appendChild(e);done()}
 else if(all){fin.appendChild(h('p','rn','Has visto las 5 zonas. Aplica más hábitos hasta bajar el riesgo del 44 % (ahora '+rk+'%).'))}
 else{fin.appendChild(h('p','rn','Zonas exploradas: '+pc(ex)+' de 5.'))}
}
paint();`
  return { html, css, js, state_max: 30 }
}

/**
 * «La cadena de un ataque»: un ataque de ransomware avanza eslabón a eslabón; en cada uno el alumno puede
 * «cortar» la cadena y ve qué hábito la habría frenado ahí. Completa al probar 3 desenlaces distintos.
 * eslabones: [{ t, d, corte:'texto de lo que lo frena' }] (el último es la consecuencia, sin corte).
 * Estado: {"s":mascara de desenlaces vistos}.
 */
export function cadenaAtaque({ titulo = 'La cadena de un ataque', ayuda = 'Un ataque avanza paso a paso. Pulsa «Avanzar» y corta la cadena donde creas. Prueba en eslabones distintos.', eslabones, cierre }) {
  const html = `<div class="wrap"><p class="ttl" id="t"></p><p class="sub" id="a"></p><div id="chain"></div><div class="row" id="ctl"></div><div id="msg" aria-live="polite"></div><p class="sub" id="prog"></p></div>`
  const css = BASE_CSS + `
.lk{position:relative;display:flex;gap:12px;align-items:flex-start;border:2px solid var(--line);border-radius:16px;padding:10px 12px;background:#fff;margin:0 0 18px;transition:opacity .3s,border-color .3s,background .3s}
.lk:not(:last-child)::after{content:'▼';position:absolute;left:22px;bottom:-19px;font-size:.8rem;color:var(--mut)}
.lk .n{flex:none;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-weight:800;background:var(--soft);border:2px solid var(--line)}
.lk .tt{font-weight:800}.lk .dd{color:var(--ink);margin-top:2px}
.lk.off{opacity:.45}.lk.off .dd{display:none}
.lk.on{border-color:var(--bad);background:var(--badbg);animation:pop .3s}.lk.on .n{background:var(--bad);color:#fff;border-color:var(--bad)}
.lk.past{border-color:#e7b3b5}.lk.past .n{background:#f1a9ac;border-color:#f1a9ac}
.lk.cutd{border-color:var(--ok);background:var(--okbg)}.lk.cutd .n{background:var(--ok);color:#fff;border-color:var(--ok)}
.lk .cutb{margin-top:8px;min-height:44px;width:100%}
.pg{display:flex;gap:6px;flex-wrap:wrap}.pg span{border:1px solid var(--line);border-radius:99px;padding:2px 10px;font-size:.85rem;background:#fff}.pg span.y{background:var(--okbg);border-color:#9fdcbc;font-weight:700}`
  const js = `${SHIM}
var D=${j({ titulo, ayuda, eslabones, cierre })};
var seen=(ME.state&&ME.state.s)|0,pos=0,over=false;
document.getElementById('t').textContent=D.titulo;document.getElementById('a').textContent=D.ayuda;
var chain=document.getElementById('chain'),ctl=document.getElementById('ctl'),msg=document.getElementById('msg'),prog=document.getElementById('prog');
var N=D.eslabones.length,cutAt=-1;
function pc(n){var c=0;for(var k=0;k<12;k++)if(n&(1<<k))c++;return c}
function paint(){clear(chain);clear(ctl);
 D.eslabones.forEach(function(e,i){var k=i+1;var cls='lk '+(cutAt===i?'cutd':k<pos?'past':k===pos?'on':'off');
  if(cutAt>=0&&i>cutAt)cls='lk off';
  var c=h('div',cls);c.appendChild(h('div','n',cutAt===i?'✂':String(k)));var b=h('div','');b.appendChild(h('div','tt',e.t));b.appendChild(h('div','dd',e.d));
  if(!over&&k===pos&&e.corte){var cb=h('button','cut cutb','✂️ Cortar la cadena aquí');cb.onclick=function(){doCut(i)};b.appendChild(cb)}
  c.appendChild(b);chain.appendChild(c)});
 if(!over){var a=h('button','',pos===0?'▶ Empezar el ataque':'⏭ Dejar que avance');a.onclick=advance;ctl.appendChild(a)}
 else{var r=h('button','ghost','↺ Probar otro eslabón');r.onclick=function(){pos=0;over=false;cutAt=-1;clear(msg);paint()};ctl.appendChild(r)}
 clear(prog);var pg=h('div','pg');prog.appendChild(h('div','','Desenlaces vistos: '+pc(seen)+' de '+N+' (con 3 completas la actividad)'));
 for(var q=0;q<N;q++){var s=h('span',(seen&(1<<q))?'y':'',(seen&(1<<q))?(q<N-1?'✂'+(q+1)+' ✓':'💥 ✓'):(q<N-1?'✂'+(q+1):'💥'));pg.appendChild(s)}prog.appendChild(pg);
}
function mark(q){seen|=(1<<q);save({s:seen});if(pc(seen)>=3)done()}
function doCut(i){cutAt=i;over=true;mark(i);clear(msg);var f=h('div','fb good');f.appendChild(h('b','h','✅ Cadena cortada en el paso '+(i+1)));f.appendChild(h('div','',D.eslabones[i].corte));msg.appendChild(f);paint()}
function advance(){pos++;if(pos>=N){over=true;pos=N;mark(N-1);clear(msg);var f=h('div','fb nope');f.appendChild(h('b','h','💥 El ataque llegó hasta el final'));f.appendChild(h('div','',D.cierre));msg.appendChild(f)}paint()}
paint();`
  return { html, css, js, state_max: 20 }
}
