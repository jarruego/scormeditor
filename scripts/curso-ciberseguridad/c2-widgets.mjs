/**
 * Interactivos a medida del curso 2 («Contraseñas y accesos») para `ix.html(...)`.
 * Cada función devuelve `{ html, css, js, state_max }`. Corren en el iframe aislado de
 * `html_embed` (sin red, sin SCORM): solo hablan con la carcasa por `window.MeEmbed`.
 * Móvil primero: botones >= 44 px, sin hover, sin 100vh. Todo texto entra por textContent.
 * No se importa nada de widgets.mjs salvo `swipeDeck` (se reetiqueta) para no duplicar su motor.
 */
import { swipeDeck } from './widgets.mjs'

const BASE_CSS = `
:root{--ink:#1b2a41;--mut:#5b6b82;--bg:#ffffff;--soft:#f2f6fb;--line:#d9e2ee;--blue:#2f6fed;--teal:#0e8f86;--ok:#1f9d5c;--okbg:#e6f6ee;--bad:#d6393f;--badbg:#fdeaea;--warn:#8a5200;--warnbg:#fff4de;--vio:#5b47c7;--vsoft:#efecfb}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);font-size:16px;line-height:1.45;background:transparent}
.wrap{max-width:640px;margin:0 auto;padding:6px 2px 10px}
.ttl{font-weight:800;font-size:1.05rem;margin:0 0 4px}
.sub{color:var(--mut);font-size:.92rem;margin:0 0 12px}
button{font:inherit;cursor:pointer;border:0;border-radius:12px;min-height:46px;padding:10px 14px;font-weight:700;color:#fff;background:var(--vio);transition:transform .08s,filter .15s}
button:active{transform:scale(.97)}
button:focus-visible,input:focus-visible{outline:3px solid #ffbf47;outline-offset:2px}
button.ghost{background:var(--soft);color:var(--ink);border:1px solid var(--line)}
button.ok{background:var(--ok)} button.bad{background:var(--bad)}
button[disabled]{opacity:.45;cursor:not-allowed}
.row{display:flex;gap:10px;flex-wrap:wrap}.row>button{flex:1 1 140px}
.bar{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:0 0 12px}
.bar>i{display:block;height:100%;width:0;background:linear-gradient(90deg,#8a74f0,var(--vio));transition:width .35s}
.fb{margin-top:12px;border-radius:14px;padding:12px 14px;animation:pop .25s ease-out}
.fb.good{background:var(--okbg);border:1px solid #9fdcbc}.fb.nope{background:var(--badbg);border:1px solid #f1a9ac}.fb.mid{background:var(--warnbg);border:1px solid #f0cf8a}
.fb b.h{display:block;font-size:1.02rem;margin-bottom:4px}
@keyframes pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
.end{text-align:center;padding:18px 8px;border-radius:16px;background:var(--vsoft);border:1px solid #cfc7f3;animation:pop .3s}
.end .big{font-size:2.2rem}.end h3{margin:.2rem 0}
.alert{background:var(--warnbg);border:1px solid #f0cf8a;border-radius:12px;padding:10px 12px;margin:0 0 12px;font-size:.92rem;color:#5a3600}
`

const SHIM = `var ME=window.MeEmbed||{completed:false,state:null,stateMax:0,complete:function(){},saveState:function(){}};
function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function clear(e){while(e.firstChild)e.removeChild(e.firstChild)}
function save(o){try{ME.saveState(o)}catch(e){}}
function done(){try{if(!ME.completed)ME.complete()}catch(e){}}`

const j = (o) => JSON.stringify(o).replace(/</g, '\\u003c')

/**
 * Baraja deslizable con etiquetas propias (reutiliza el motor de `swipeDeck`).
 * Izquierda = `fraude:true`. L: { izq, der, btnIzq, btnDer, tarjeta, fin }
 * cards: [{ canal, de, asunto?, texto, fraude, pistas, porque }]
 */
export function swipeLabeled(opts, L) {
  const w = swipeDeck(opts)
  const rep = (from, to) => {
    if (!w.js.includes(from)) throw new Error('swipeLabeled: no encuentro «' + from + '»')
    w.js = w.js.split(from).join(to)
  }
  rep('era un FRAUDE.', L.resIzq)
  rep('era LEGÍTIMO.', L.resDer)
  rep('🚩 Es un fraude', L.btnIzq)
  rep('✅ Es legítimo', L.btnDer)
  rep("'FRAUDE'", "'" + L.izq.toUpperCase() + "'")
  rep("'LEGÍTIMO'", "'" + L.der.toUpperCase() + "'")
  rep("'Mensaje '", "'" + (L.tarjeta || 'Tarjeta ') + "'")
  rep('Muy buen ojo. Ante la duda, sigue verificando por otro canal.', L.finBien)
  rep('No pasa nada: la duda es tu mejor defensa. Repite la baraja y fíjate en las pistas.', L.finMal)
  w.est_seconds = 200; w.css += '.card .de{font-family:ui-monospace,Consolas,monospace;font-size:1.05rem}.card .as{font-weight:600;color:var(--mut)}'
  return w
}

/**
 * Laboratorio de contraseñas a medida, alineado con CCN-CERT BP/35 y NIST SP 800-63B-4:
 * premia la LONGITUD y las frases de varias palabras, no las reglas de composición.
 * Todo se calcula en el aparato (sin red). Avisa de no escribir la clave real. Completa al
 * lograr «Fuerte». La escala de tiempo es cualitativa y orientativa (no una medición).
 */
export function passLab2() {
  const html = `<div class="wrap">
<div class="alert">⚠️ Es un simulador que funciona solo en este aparato y no envía nada. Aun así, <b>no escribas tu contraseña real</b>: usa ejemplos inventados.</div>
<p class="sub" style="margin-bottom:6px">Prueba un ejemplo:</p><div class="row" id="ex" style="margin-bottom:10px"></div>
<label for="pw" class="sub" style="display:block;margin:0">…o escribe una de práctica</label>
<input id="pw" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="p. ej. una frase de varias palabras">
<div class="meter"><i id="mt"></i></div><p id="lv" class="lv">—</p><p id="tm" class="sub"></p>
<ul id="ck" class="ck"></ul><p id="tip" class="tip"></p>
<div class="row"><button id="gen" class="ghost">🎲 Sugerir una frase de 5 palabras</button></div></div>`
  const css = BASE_CSS + `
input{width:100%;font:inherit;font-size:1.1rem;padding:12px;border-radius:12px;border:2px solid var(--line);margin:6px 0 10px;background:#fff;color:var(--ink)}
input:focus{border-color:var(--vio)}
.meter{height:14px;border-radius:99px;background:var(--line);overflow:hidden}.meter>i{display:block;height:100%;width:0;transition:width .3s,background .3s}
.lv{font-weight:800;font-size:1.15rem;margin:.5rem 0 0}
.ck{list-style:none;padding:0;margin:8px 0 10px}.ck li{padding:4px 0}.ck li.y::before{content:'✅ '}.ck li.n::before{content:'⬜ '}
.tip{background:var(--vsoft);border:1px solid #cfc7f3;border-radius:12px;padding:10px 12px;margin:0 0 12px;min-height:44px}
#ex button{background:var(--soft);color:var(--ink);border:1px solid var(--line);font-family:ui-monospace,Consolas,monospace;font-size:.92rem;word-break:break-all;flex:1 1 100%;text-align:left}`
  const js = String.raw`${SHIM}
var WORDS=['caracol','ventana','naranja','bufanda','cometa','tortuga','montaña','violeta','guitarra','sombrero','mariposa','estrella','cuaderno','paraguas','campana','girasol','bicicleta','castillo','manzana','tormenta','zapato','jardín','cascada','farolillo','turrón','balcón','almohada','pelota','río','nube','cerezo','tambor','lámpara','molino','barquito','trenecito'];
var EX=['Maria1234','M4dr1d!25','MiPrimerTurnoFue7EnInvierno!','luna cafe tren botas'];
var COMUNES=['password','contrasena','qwerty','admin','abc123','letmein','iloveyou','teamo','residencia','geriatrico','centro','enfermeria','gerocultor','cuidados','bienvenido','secreto','clave','usuario','welcome'];
var NOMBRES=['maria','jose','antonio','carmen','juan','manuel','pedro','luis','pilar','laura','david','javier','lucia','isabel','dolores','francisco','miguel','paco','ana'];
var RX=/[A-ZÁÉÍÓÚÑÜ]?[a-záéíóúñü]+|[A-ZÁÉÍÓÚÑÜ]+|[0-9]+|[^\sA-Za-z0-9áéíóúñüÁÉÍÓÚÑÜ_-]/g;
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
function ev(p){var n=p.length,low=norm(p),t=p.match(RX)||[],w=0,bits=0;
 t.forEach(function(x){if(/^[0-9]+$/.test(x)){bits+=/^(19|20)[0-9][0-9]$/.test(x)?6:Math.min(x.length,6)*3.3}else if(/^[A-Za-zÁÉÍÓÚÑÜáéíóúñü]+$/.test(x)){if(x.length>=3){w++;bits+=12}else bits+=5}else bits+=4});
 var common=COMUNES.some(function(c){return low.indexOf(c)>-1});
 var name=NOMBRES.some(function(c){return low.indexOf(c)>-1});
 var seq=/(0123|1234|2345|3456|4567|5678|6789|abcd|qwer|asdf|zxcv)/.test(low)||/(.)\1{2,}/.test(p);
 var year=/(19|20)[0-9][0-9]/.test(p);
 var leet=/[a-z][4301@$5][a-z]/i.test(p);
 if(common)bits-=14;if(name)bits-=12;if(seq)bits-=12;
 if(leet)bits=Math.min(bits,34);
 if(w<=1&&n<=14)bits=Math.min(bits,30);
 if(n<8)bits=Math.min(bits,22);
 bits=Math.max(0,Math.min(bits,n*4.5));
 var lvl=(bits<30||n<10)?0:(bits<40||n<15)?1:(n>=20&&bits>=58&&w>=3)?3:2;
 return{n:n,w:w,bits:bits,common:common,name:name,seq:seq,year:year,leet:leet,lvl:lvl}}
function when(b){return b<22?'segundos':b<34?'minutos u horas':b<44?'días o semanas':b<54?'meses o años':'muchísimo tiempo (años y siglos)'}
var pw=document.getElementById('pw'),mt=document.getElementById('mt'),lv=document.getElementById('lv'),tm=document.getElementById('tm'),ck=document.getElementById('ck'),tip=document.getElementById('tip');
var NAMES=['Muy débil','Débil','Aceptable (ya cumple el mínimo)','Fuerte (nivel recomendado)'],COLS=['#b3262d','#9a5a00','#2f6f4f','#157347'];
function paint(){var p=pw.value;
 if(!p){mt.style.width='0';lv.textContent='—';lv.style.color='';tm.textContent='';clear(ck);tip.textContent='Escribe algo o pulsa un ejemplo. Fíjate en cómo pesa la longitud.';return}
 var e=ev(p);mt.style.width=Math.max(8,Math.round((e.lvl+1)*25))+'%';mt.style.background=COLS[e.lvl];lv.textContent=NAMES[e.lvl];lv.style.color=COLS[e.lvl];
 tm.textContent='Tiempo que tardaría un programa en adivinarla (escala orientativa de este simulador, no una medición real): '+when(e.bits)+'.';
 clear(ck);[[e.n>=15,'15 caracteres o más (mejor 20 o más): '+e.n+' ahora'],[e.w>=3,'Varias palabras seguidas (frase de paso)'],[!e.common&&!e.name,'Sin nombres, sin «centro», sin palabras típicas'],[!e.seq&&!e.year,'Sin secuencias (1234, qwer), repeticiones ni años'],[!e.leet,'Sin cambios previsibles de letras (a por 4, e por 3, o por 0)']].forEach(function(r){ck.appendChild(h('li',r[0]?'y':'n',r[1]))});
 var t;if(e.n<15)t='Alárgala: añade palabras enteras. Un símbolo suelto ayuda poco; diez letras más ayudan muchísimo.';
 else if(e.common||e.name)t='Lleva algo adivinable (un nombre, el centro, una palabra típica). Cámbialo por palabras que nadie asocie contigo.';
 else if(e.leet)t='Cambiar a por 4 o e por 3 es un truco que los atacantes ya conocen. Mejor más palabras que más trucos.';
 else if(e.seq||e.year)t='Quita secuencias y años: son lo primero que prueba un programa.';
 else if(e.lvl<3)t='Casi: pasa de 20 caracteres con varias palabras que no se relacionen entre sí.';
 else t='Así sí: larga, con varias palabras y sin datos tuyos. Para tu clave real, inventa otra distinta y no la escribas en webs «medidoras».';
 tip.textContent=t;
 if(e.lvl===3)done()}
EX.forEach(function(x){var b=h('button','ghost',x);b.onclick=function(){pw.value=x;paint()};document.getElementById('ex').appendChild(b)});
pw.addEventListener('input',paint);
document.getElementById('gen').onclick=function(){var a=[];while(a.length<5){var w=WORDS[Math.floor(Math.random()*WORDS.length)];if(a.indexOf(w)<0)a.push(w)}pw.value=a.join(' ');paint()};
paint();`
  return { html, css, js, state_max: 0, est_seconds: 150 }
}

/**
 * Constructor de frase de paso con ayuda mnemotécnica: eliges 3 «ladrillos» (uno por hueco; en
 * cada hueco hay una opción trampa con datos personales), intercalas un número y un símbolo,
 * y ves la longitud y la escena para recordarla. Completa al «saberla». Estado: {a,b,c,n,s,d}.
 */
export function phraseBuilder() {
  const slots = [
    { t: '1. ¿Cuándo?', o: [['MiPrimerTurno', 'mi primer turno'], ['UnLunesDeLluvia', 'un lunes de lluvia'], ['LaNocheDeSanJuan', 'la noche de San Juan'], ['ElCumpleDeMiHijo', 'el cumpleaños de tu hijo', 1]] },
    { t: '2. ¿Qué pasó?', o: [['SeRompioElParaguas', 'se rompió el paraguas'], ['CantamosEnElPatio', 'cantamos en el patio'], ['HuboUnaTormentaDeVerano', 'hubo una tormenta de verano'], ['ElNombreDeMiPerro', 'el nombre de tu perro', 1]] },
    { t: '3. ¿Dónde?', o: [['EnLaCocinaGrande', 'en la cocina grande'], ['BajoElOlivoViejo', 'bajo el olivo viejo'], ['EnElTrenLento', 'en el tren lento'], ['EnCasaDeMiMadre', 'en casa de tu madre', 1]] },
  ]
  const html = `<div class="wrap"><p class="sub">Elige un ladrillo en cada hueco, intercala un número y un símbolo, y fíjate en cómo crece. <b>Es solo práctica:</b> la frase de este ejemplo ya es pública; para la tuya, inventa otra con tus propios recuerdos.</p><div id="sl"></div>
<div class="tg row"><button id="bn" class="ghost" aria-pressed="false">＋ Intercalar un número</button><button id="bs" class="ghost" aria-pressed="false">＋ Intercalar un símbolo</button></div>
<div class="prev" id="pv" aria-live="polite"></div><div class="bar" style="margin-top:8px"><i id="pb"></i></div><p class="sub" id="ct"></p><p class="tip" id="mn"></p><div id="msg"></div><button id="go" disabled style="width:100%">Me la sé: la repito 3 veces en voz alta</button><div id="fin"></div></div>`
  const css = BASE_CSS + `
.grp{margin:0 0 12px}.grp b{display:block;margin:0 0 6px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chips button{background:var(--soft);color:var(--ink);border:2px solid var(--line);font-weight:600;flex:1 1 150px;text-align:left}
.chips button.on{background:var(--vsoft);border-color:var(--vio)}
.chips button.trap{border-color:#e08f93}
.tg{margin:4px 0 12px}.tg button.on{background:var(--vio);color:#fff}
.prev{font-family:ui-monospace,Consolas,monospace;font-size:1.1rem;font-weight:700;background:#101c2e;color:#fff;border-radius:14px;padding:14px;word-break:break-all;min-height:56px}
.prev .a{color:#ffd166}.prev .b{color:#7ee0d4}.prev .c{color:#ffadc9}.prev .n{color:#b7a8ff}.prev .s{color:#ff9b9b}
.tip{background:var(--vsoft);border:1px solid #cfc7f3;border-radius:12px;padding:10px 12px;margin:0 0 12px}
.seal{margin-top:12px;text-align:center;padding:16px;border-radius:16px;background:var(--okbg);border:2px solid var(--ok);animation:pop .3s}.seal .big{font-size:2.2rem}`
  const js = String.raw`${SHIM}
var S=${j(slots)};var st=ME.state||{};var pick=[st.a,st.b,st.c].map(function(v){return(typeof v==='number')?v:-1});var useN=!!st.n,useS=!!st.s,fin=!!st.d||ME.completed;
var SL=document.getElementById('sl'),PV=document.getElementById('pv'),PB=document.getElementById('pb'),CT=document.getElementById('ct'),MN=document.getElementById('mn'),MSG=document.getElementById('msg'),GO=document.getElementById('go'),FIN=document.getElementById('fin'),BN=document.getElementById('bn'),BS=document.getElementById('bs');
var chipEls=[];
S.forEach(function(sl,gi){var g=h('div','grp');g.appendChild(h('b','',sl.t));var c=h('div','chips');chipEls[gi]=[];
 sl.o.forEach(function(o,oi){var b=h('button','',o[1].charAt(0).toUpperCase()+o[1].slice(1));b.onclick=function(){pick[gi]=oi;paint(true)};c.appendChild(b);chipEls[gi].push(b)});
 g.appendChild(c);SL.appendChild(g)});
BN.onclick=function(){useN=!useN;paint(true)};BS.onclick=function(){useS=!useS;paint(true)};
function parts(){var p=[];var o0=pick[0]>=0?S[0].o[pick[0]]:null,o1=pick[1]>=0?S[1].o[pick[1]]:null,o2=pick[2]>=0?S[2].o[pick[2]]:null;
 if(o0)p.push(['a',o0[0]]);if(useN)p.push(['n','7']);if(o1)p.push(['b',o1[0]]);if(useS)p.push(['s','!']);if(o2)p.push(['c',o2[0]]);return p}
function paint(user){
 chipEls.forEach(function(r,gi){r.forEach(function(b,oi){var on=pick[gi]===oi;b.classList.toggle('on',on);b.classList.toggle('trap',on&&!!S[gi].o[oi][2]);b.setAttribute('aria-pressed',on?'true':'false')})});
 BN.classList.toggle('on',useN);BN.setAttribute('aria-pressed',useN?'true':'false');BS.classList.toggle('on',useS);BS.setAttribute('aria-pressed',useS?'true':'false');
 clear(PV);var p=parts(),len=0;if(!p.length)PV.textContent='Tu frase aparecerá aquí';p.forEach(function(x){PV.appendChild(h('span',x[0],x[1]));len+=x[1].length});
 PB.style.width=Math.min(100,Math.round(len/20*100))+'%';
 CT.textContent=len+' caracteres. Objetivo: 20 o más (el CCN-CERT recomienda frases de al menos 20).';
 var traps=[0,1,2].filter(function(g){return pick[g]>=0&&S[g].o[pick[g]][2]});
 clear(MSG);if(traps.length){var f=h('div','fb nope');f.appendChild(h('b','h','⚠️ Ese ladrillo es un dato personal'));f.appendChild(h('div','','Familiares, mascotas y fechas de tu vida son lo primero que prueba quien quiere entrar, y a veces se encuentran en redes. Cámbialo por un recuerdo que nadie sepa.'));MSG.appendChild(f)}
 var all=pick[0]>=0&&pick[1]>=0&&pick[2]>=0;
 if(all&&!traps.length){MN.textContent='Truco para recordarla: cierra los ojos e imagina la escena: '+S[0].o[pick[0]][1]+', '+S[1].o[pick[1]][1]+', '+S[2].o[pick[2]][1]+'. Una imagen se recuerda mejor que letras sueltas. El 7 y el «!» van en medio, como parte de la historia.'}
 else MN.textContent='Elige un ladrillo en cada hueco para ver tu truco de memoria.';
 var ok=all&&!traps.length&&useN&&useS&&len>=20;GO.disabled=!ok;
 if(user)save({a:pick[0]<0?9:pick[0],b:pick[1]<0?9:pick[1],c:pick[2]<0?9:pick[2],n:useN?1:0,s:useS?1:0,d:fin?1:0});
 clear(FIN);if(fin&&ok){var s=h('div','seal');s.appendChild(h('div','big','🧠'));s.appendChild(h('b','','Frase construida. Tu clave real: invéntala igual de larga, con tus propios recuerdos, y no la compartas con nadie.'));FIN.appendChild(s);GO.style.display='none'}}
for(var q=0;q<3;q++)if(pick[q]>8)pick[q]=-1;
GO.onclick=function(){fin=true;save({a:pick[0],b:pick[1],c:pick[2],n:1,s:1,d:1});paint(false);done()};
paint(false);`
  return { html, css, js, state_max: 40, est_seconds: 180 }
}

/**
 * «¿Cuánto tardarían en adivinarla?»: duelos de contraseñas (toca la que tarda MÁS en adivinarse).
 * Escala cualitativa y fuentes citadas (CCN-CERT BP/35). Estado: {i,c}.
 */
export function crackDuel() {
  const duels = [
    { a: '123456', b: 'M4dr1d!25', win: 1, ta: 'al instante: está en todas las listas', tb: 'unas horas, según la tabla del CCN-CERT', why: 'Es corta y con «trucos» (a por 4, i por 1). Aun así aguanta más que 123456, que cae al instante.' },
    { a: 'M4dr1d!25', b: 'EnunlugardelaMancha!25', win: 1, ta: 'unas horas (CCN-CERT)', tb: 'siglos y siglos (CCN-CERT)', why: 'Misma idea, pero 22 caracteres en lugar de 9. El CCN-CERT lo explica con esta pareja de ejemplos: la longitud multiplica el trabajo.' },
    { a: 'Xq7#mP2$', b: 'mi cafe de las seis y media', win: 1, ta: 'minutos u horas (8 caracteres, aunque sean raros)', tb: 'muchísimo más: es larga y tiene sentido para ti', why: 'Ocho caracteres mezclados caen en minutos u horas (CCN-CERT). Una frase larga, aunque solo tenga letras, aguanta mucho más y además se recuerda.' },
    { a: 'Centro2026!', b: 'elperrodemivecinaladratarde', win: 1, ta: 'muy poco: nombre del centro + año + símbolo', tb: 'mucho más: 27 caracteres sin datos obvios', why: 'El nombre del centro y el año son lo primero que se prueba. Aunque lleve mayúscula y signo, es previsible.' },
    { a: 'Tr0ub4dor&3', b: 'cuadernoazulmontañanube', win: 1, ta: 'poco: una palabra con cambios típicos', tb: 'mucho más: cuatro palabras sin relación', why: 'Cambiar letras por números es una fórmula muy conocida. Cuatro palabras sin relación son más largas y difíciles de adivinar.' },
  ]
  const html = `<div class="wrap"><p class="sub">Un programa prueba contraseñas sin parar. En cada duelo, toca la que <b>tardaría más</b> en adivinar.</p><div class="bar"><i id="pb"></i></div><div id="s"></div></div>`
  const css = BASE_CSS + `
.duel{display:grid;gap:10px;margin:8px 0}
.duel button{background:#101c2e;color:#fff;font-family:ui-monospace,Consolas,monospace;font-size:1.05rem;word-break:break-all;text-align:left;min-height:62px;border:3px solid transparent}
.duel button.right{border-color:#2fb36d}.duel button.wrong{border-color:#ff7b81}
.duel small{display:block;font-family:system-ui,sans-serif;font-weight:600;font-size:.82rem;color:#cdd8ea;margin-top:4px}
.cnt{font-size:.85rem;color:var(--mut);margin:0 0 2px;text-align:right}
.vs{text-align:center;font-weight:800;color:var(--mut);margin:-2px 0}`
  const js = String.raw`${SHIM}
var D=${j(duels)};var st=ME.state||{i:0,c:0};var i=st.i|0,ok=st.c|0;
var S=document.getElementById('s'),pb=document.getElementById('pb');
function bar(){pb.style.width=Math.round(Math.min(i,D.length)/D.length*100)+'%'}
function show(){clear(S);bar();if(i>=D.length)return fin();var d=D[i],locked=false;
 S.appendChild(h('p','cnt','Duelo '+(i+1)+' de '+D.length));
 var box=h('div','duel');var bs=[];
 [d.a,d.b].forEach(function(t,k){var b=h('button','',t);b.setAttribute('aria-label','Contraseña '+(k+1)+': '+t);b.onclick=function(){if(locked)return;locked=true;var good=(k===d.win);if(good)ok++;
  bs.forEach(function(x,m){x.classList.add(m===d.win?'right':'wrong');var sm=h('small','',(m===d.win?'✅ Aguanta más: ':'⏱️ Cae antes: ')+(m===0?d.ta:d.tb));x.appendChild(sm)});
  var f=h('div','fb '+(good?'good':'nope'));f.appendChild(h('b','h',good?'✅ ¡Bien visto!':'❌ Esta vez no'));f.appendChild(h('div','',d.why));S.appendChild(f);
  var n=h('button','','Siguiente ›');n.style.cssText='margin-top:12px;width:100%';n.onclick=function(){i++;save({i:i,c:ok});show()};S.appendChild(n);n.focus({preventScroll:true})};
  bs.push(b);box.appendChild(b);if(k===0)box.appendChild(h('div','vs','contra'))});
 S.appendChild(box)}
function fin(){var e=h('div','end');e.appendChild(h('div','big',ok>=D.length*0.8?'🏅':'📚'));e.appendChild(h('h3','','Has acertado '+ok+' de '+D.length));
 e.appendChild(h('p','','La lección: la longitud manda. Una frase larga y con sentido para ti gana a una clave corta con símbolos. Los tiempos son orientativos y proceden de la tabla que cita el CCN-CERT (BP/35).'));
 var r=h('button','ghost','↺ Repetir');r.onclick=function(){i=0;ok=0;save({i:0,c:0});show()};e.appendChild(r);S.appendChild(e);done()}
show();`
  return { html, css, js, state_max: 30, est_seconds: 200 }
}

/**
 * Simulador paso a paso: activar la verificación en dos pasos en un móvil dibujado, elegir
 * método, guardar los códigos de respaldo y rechazar dos engaños (aviso que no has pedido y
 * llamada que pide el código). Orientativo: los menús reales de Google cambian. Estado: {s}.
 */
export function twoStepSim() {
  const steps = [
    { hdr: 'Cuenta del centro', ins: 'Paso 1 de 8. Estás en tu cuenta del centro. Toca «Seguridad».', body: '', it: [['👤 Información personal', 0, 'Ahí están tu nombre y tu foto. Lo que buscamos está en otro sitio.'], ['🔒 Seguridad', 1, 'Eso es: aquí se gestiona cómo entras en tu cuenta.'], ['🗂️ Datos y privacidad', 0, 'Es de privacidad. Busca el apartado de entrar con seguridad.']] },
    { hdr: 'Seguridad', ins: 'Paso 2 de 8. Busca el segundo cerrojo: «Verificación en dos pasos».', body: '', it: [['🔑 Contraseña', 0, 'La contraseña es el primer cerrojo y ya la tienes. Falta el segundo.'], ['🛡️ Verificación en dos pasos · desactivada', 1, 'Aquí es. Ahora está desactivada: cualquiera con tu clave podría entrar.'], ['💻 Tus dispositivos', 0, 'Sirve para cerrar sesiones (lo verás en la lección 5). Ahora, el segundo cerrojo.']] },
    { hdr: 'Verificación en dos pasos', ins: 'Paso 3 de 8. Léelo y actívala.', body: 'Aunque alguien consiga tu contraseña, no podrá entrar sin tu móvil.', it: [['Ahora no', 0, 'Sin segundo cerrojo, una clave robada basta para entrar. Pulsa «Activar».'], ['Activar', 1, 'Hecho. Ahora toca elegir cuál será tu segundo paso.']] },
    { hdr: 'Elige tu segundo paso', ins: 'Paso 4 de 8. Elige el método que prefieras (todos valen, unos más que otros).', body: '', it: [['📲 Aviso en el móvil', 1, 'Buena elección: basta tocar «Sí, soy yo» y no hay ningún código que dar por error.'], ['🔢 App autenticadora', 1, 'Muy buena: da un código de 6 cifras que cambia cada 30 segundos. Nunca se lo des a nadie.'], ['💬 Mensaje SMS', 1, 'Vale, y es mejor que nada, pero es la opción menos recomendable (el CCN-CERT avisa del «SIM swapping»).'], ['🔑 Llave de seguridad', 1, 'La más resistente al phishing. Hay que tener la llave a mano y cuidarla.']] },
    { hdr: 'Códigos de respaldo', ins: 'Paso 5 de 8. Son códigos de un solo uso por si pierdes el móvil. ¿Dónde los guardas?', body: 'Ejemplo: 4821 0937 · 7710 3358 · …', it: [['📸 En una captura de pantalla', 0, 'Las capturas se sincronizan y las ve quien tenga acceso. El CCN-CERT dice que no se guarden en capturas ni en el correo.'], ['✉️ Me los envío por correo', 0, 'El correo es justo lo que estamos protegiendo. No.'], ['🗝️ En un lugar seguro (el gestor de contraseñas o un papel bajo llave en casa)', 1, 'Correcto: fuera del móvil, fuera del correo y lejos de miradas ajenas.']] },
    { hdr: 'Verificación activada', ins: 'Paso 6 de 8. ¡Activada! Ahora, dos pruebas de engaño.', body: '✅ Desde ahora, entrar desde un aparato nuevo pide el segundo paso.', it: [['Continuar a las pruebas', 1, 'Vamos con la primera.']] },
    { hdr: 'Aviso de seguridad', ins: 'Paso 7 de 8. Estás tomando un café y NO has iniciado sesión. Te llega esto.', body: '🔔 «¿Eres tú intentando iniciar sesión?»', cls: 'notif', it: [['Sí, soy yo', 0, 'Si lo apruebas sin haber entrado tú, dejas pasar a otra persona. Cuando no eres tú, se dice «No».'], ['No, no soy yo', 1, 'Perfecto. Además, avisa a tu responsable y cambia tu contraseña: alguien la conoce.']] },
    { hdr: 'Llamada entrante', ins: 'Paso 8 de 8. Suena el teléfono.', body: '📞 «Soy de informática. Le ha llegado un código al móvil, ¿me lo dice para verificarle?»', cls: 'call', it: [['Se lo digo, parece amable', 0, 'Nunca. Ningún servicio legítimo pide ese código por teléfono, correo o SMS (CCN-CERT).'], ['Cuelgo y aviso a mi responsable', 1, 'Eso es: el código es tuyo y de nadie más.']] },
  ]
  const html = `<div class="wrap"><p class="sub">Simulación orientativa: en tu móvil real los menús pueden llamarse o colocarse de otro modo.</p><div class="bar"><i id="pb"></i></div><p class="ins" id="ins"></p><div class="ph"><div class="hd" id="hd"></div><div class="bd" id="bd"></div><div class="its" id="its"></div></div><div id="fb"></div></div>`
  const css = BASE_CSS + `
.ins{font-weight:700;margin:0 0 10px;min-height:44px}
.ph{width:100%;max-width:320px;margin:0 auto;border:9px solid #1b2a41;border-radius:30px;background:#fff;overflow:hidden;box-shadow:0 8px 20px rgba(27,42,65,.18)}
.hd{background:var(--vio);color:#fff;font-weight:800;padding:12px 14px}
.bd{padding:12px 14px 4px;font-size:.98rem}
.bd:empty{display:none}
.its{padding:8px 10px 14px;display:grid;gap:8px}
.its button{background:var(--soft);color:var(--ink);border:1px solid var(--line);text-align:left;font-weight:600;min-height:50px}
.ph.notif .hd{background:#8a5200}.ph.call .hd{background:#0e6e66}
.ph.notif .bd,.ph.call .bd{font-weight:700;font-size:1.05rem}
.nx{margin-top:12px;width:100%}`
  const js = String.raw`${SHIM}
var D=${j(steps)};var st=ME.state||{};var s=Math.min(st.s|0,D.length);
var pb=document.getElementById('pb'),ins=document.getElementById('ins'),hd=document.getElementById('hd'),bd=document.getElementById('bd'),its=document.getElementById('its'),fb=document.getElementById('fb'),ph=document.querySelector('.ph');
function show(){clear(fb);clear(its);pb.style.width=Math.round(s/D.length*100)+'%';
 if(s>=D.length){ph.style.display='none';ins.textContent='';var e=h('div','end');e.appendChild(h('div','big','🔐'));e.appendChild(h('h3','','¡Segundo cerrojo puesto!'));e.appendChild(h('p','','Recuerda: el aviso que no has pedido se rechaza, y el código no se lo das a nadie. Si tu centro gestiona las cuentas, la activación puede hacerla el administrador: pregunta a tu responsable.'));var r=h('button','ghost','↺ Repetir');r.onclick=function(){s=0;save({s:0});ph.style.display='';show()};e.appendChild(r);fb.appendChild(e);done();return}
 var d=D[s];ph.className='ph '+(d.cls||'');ins.textContent=d.ins;hd.textContent=d.hdr;bd.textContent=d.body||'';
 d.it.forEach(function(o){var b=h('button','',o[0]);b.onclick=function(){clear(fb);
  if(o[1]){var f=h('div','fb good');f.appendChild(h('b','h','✅ '+o[2]));fb.appendChild(f);var n=h('button','ok nx','Continuar ›');n.onclick=function(){s++;save({s:s});show()};fb.appendChild(n);n.focus({preventScroll:true});Array.prototype.forEach.call(its.children,function(x){x.disabled=true})}
  else{var g=h('div','fb nope');g.appendChild(h('b','h','⚠️ '+o[2]));fb.appendChild(g)}};its.appendChild(b)})}
show();`
  return { html, css, js, state_max: 10, est_seconds: 300 }
}
