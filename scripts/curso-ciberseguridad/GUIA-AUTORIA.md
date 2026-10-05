# Guía de autoría — Curso de ciberseguridad sociosanitaria (6 `.scormproj`)

Documento interno para quien escribe un `cN-*.mjs`. Se ejecuta con
`node scripts/curso-ciberseguridad/run.mjs cN-nombre.mjs` y deja `docs/curso-ciberseguridad/scormproj/<id>.scormproj`.
Es una **muestra comercial** de lo que puede hacer SCORMEditor: interactivo, vistoso, ligero y útil.

## Público y tono
- Trabajadores/as de residencias **sin soltura digital**; verán el curso **en el móvil**, a ratos, en turno.
- **Tuteo**, frases cortas, palabras de la calle («pinchar un enlace», «te piden el código»), cero jerga.
  Si aparece un término técnico, se explica en la misma frase. Ejemplos del día a día de una residencia
  (turno de noche, tablet de planta, la llamada de «soporte», la familia que pregunta por WhatsApp…).
- Positivo: el miedo no enseña. «Tú eres la mejor defensa», «ante la duda, para y pregunta».
- Sin culpabilizar: equivocarse es humano; lo grave es no avisar.
- **Rigor**: solo datos, cifras, leyes y enlaces que estén en el dossier de `docs/curso-ciberseguridad/fuentes/`
  marcados como leídos/verificados. **Nada** marcado «NO CONFIRMADO/NO VERIFICADO». Si dudas, no lo pongas.
  No inventes estadísticas. Los ejemplos de mensajes/casos inventados son legítimos si son didácticos y se
  presentan como ejemplo (nunca como hecho real).

## Estructura de cada curso (≈ 1 h 40 min ⇒ 34-42 pantallas + test final de 10-12 preguntas)
- `intro_screens`: 1 portada (`cover`) del curso. Los textos de intro van en la primera pantalla `content`.
- **Un módulo** con título propio (distinto del título del curso) y **5-6 unidades** («Lección N…»).
  `unit_label` «Lección». Cada unidad: portada de lección (`cover`, subtítulo «Lección N»), 5-8 pantallas,
  1 `summary` al final con `summary` de unidad.
- **Lección 1** incluye: objetivos (pantalla `objectives`) y «Elige tu puesto» (tabs con consejos específicos de
  gerocultor/a, auxiliar/enfermería, administración/dirección, supervisión, mantenimiento).
- **Última lección = «Repaso y reto»**: `flashcards` + una lúdica (`word_search` / `crossword` / `az_quiz`; cada curso una
  distinta) + `pledge` (compromiso) + cierre. Después el test final (lo añade el runtime).
- Ritmo: nunca más de 3 pantallas seguidas de solo texto; una interactividad **informativa** (accordion / tabs /
  flip_cards / timeline) cada 3-4 pantallas; un **checkpoint evaluable** (`scored: true`) cada 4-5 pantallas, en
  **pantalla propia**, alternando tipos (decidir/clasificar/ordenar/emparejar/completar mejor que `single_choice`).
- **Mínimo por curso**: 4 `html_embed` (kit `widgets.mjs` + al menos **1 a medida** escrito por ti, con su lógica
  propia: simulador, comparador, juego de reflejos…), 8-14 ilustraciones SVG propias, 2-4 vídeos **verificados**,
  1 `hotspots` sobre una escena SVG (encuentra los fallos), ≥1 `scenario_decision` por rol (en distinto puesto),
  ≥6 checkpoints `scored`, 1 `timeline` o `sort_steps` de procedimiento («qué hago si…»).
- **Una sola interacción por pantalla.** Imagen/vídeo + texto ⇒ **sin** interacción en esa pantalla (la
  interacción va en la siguiente, mismo `title`, con 1-2 frases de intro). Excepción útil: las ilustraciones
  `html_embed` pueden ir solas bajo una frase de contexto.
- **Pantalla = una idea**. Texto visible ≲ 500-600 caracteres por pantalla (móvil). Si hay más, divide o usa un
  desplegable que **contenga** el desarrollo (cuerpos de accordion/tabs claramente más largos que su título).
- `title`: 2-6 palabras, concreto; no repetir el título como primera línea del texto; **nunca** «Checkpoint»/«Actividad».
  Pantallas que continúan una idea comparten `title`.
- Objetivos: **4-6 por curso**, texto idéntico en `objective` de las pantallas y en `learning_objective` del test
  (`c.objectives = [...]`; en pantallas `obj: n`). Cada objetivo con ≥1 interacción `scored` o pregunta del test.
- `summary`/`cover`: `obj` opcional. Resto de pantallas siempre `obj`.
- Test final: 10-12 preguntas **de aplicación** (situaciones del puesto), 3-4 opciones plausibles, explicación útil;
  cubre todos los objetivos. `one_question_per_screen` ya va activo.
- Glosario 10-15 términos; bibliografía 6-10 referencias oficiales **realmente consultadas** (formato
  `Entidad (año). Título. Fuente.` + url).

## Formato del texto (`text` = `student_text`, markdown ligero, NUNCA HTML)
- `**negrita**`, `*cursiva*`, `[texto](https://…)`, listas con `- ` (un ítem por línea, sin líneas en blanco entre
  ítems), `## ` / `### ` solo con el título en su línea.
- Callouts (máx. 1-2 por pantalla, **no repetir tipo** en la misma): `::: tip` `::: warn` `::: important` `::: fact`
  `::: reflect` `::: case` `::: info` + cuerpo + `:::`. Nunca vacíos. Personalizado: `::: custom | #color | 🔒 | Título`.
- Campos cortos de interacción (`prompt`, `instructions`, opciones, feedback, `front`/`back`, `title`/`label`): **solo**
  negrita, cursiva y enlaces. Nada de listas ni `##` ahí (salen literales). Los `body` de accordion/tabs/timeline
  sí admiten markdown de bloque.
- Sin rótulos del tipo «Idea clave:». Sin «…» de truncado. Sin notas internas en el texto del alumno.
- Emojis: con mesura (1 por título o callout como mucho) y nunca como única señal.

## API (ver `lib.mjs`, `widgets.mjs`, `svgkit.mjs`)
```js
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'          // swipeDeck, chatStory, passwordLab, urlLab, pledge
import { svg, bg, person, phone, laptop, tablet, icon, bubble, pill, mailMock, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const c = new CourseBuilder({ id:'cibersegsoc-c1-fundamentos', identifier:'CIBERSEG_C1', title:'…', subtitle:'…',
  description:'…', hours:1.7, primary:'#1d5fd1', accent:'#6DC3C0', moduleTitle:'…', objectives:['Reconocer…','Aplicar…'] })
c.asset('assets/img/c1_portada.svg', svg(640,360, bg(640,360)+ … , 'alt-ish title'))   // SVG como string
c.intro({ type:'cover', title:'…', text:'', img:{ src:'assets/img/c1_portada.svg', alt:'…', full:true } })
const l1 = c.unit('Lección 1. …', 'Resumen de la lección.')
l1.add({ type:'cover', title:'…', text:'' })
 .add({ title:'…', obj:0, text:'…', img:{ src:'assets/img/…svg', alt:'…', layout:'top' } })     // texto + imagen (sin interacción)
 .add({ title:'…', obj:0, text:'Intro breve.', ix: ix.accordion([[titulo, cuerpoLargo], …]) })
 .add({ title:'…', obj:0, text:'', video:{ id:'ID11CARACTERES', caption:'…', transcript:'Resumen fiel del vídeo…' } })
 .add({ title:'…', obj:1, text:'Intro.', ix: ix.html({ ...W.swipeDeck({ cards:[…] }), prompt:'' }) })
 .add({ title:'…', obj:1, ix: ix.scenario('Situación…', '¿Qué haces?', [['Opción', true, 'por qué'], …], fbk('Bien','Revisa','Explicación')) })
c.glossary('Phishing','…').bib('INCIBE (2025). Título. INCIBE.', 'https://…')
c.finalTest('Test final', [[ '¿Pregunta?', [['Correcta', true], ['Falsa 1', false], ['Falsa 2', false]], 'Explicación', 0 ], …])
await c.build()   // valida (Zod + validateCourse), imprime avisos y escribe el .scormproj
```
- Interacciones: `ix.single/tf/scenario/classify/match/sort/fill` (evaluables; `fbk(acierto, error, explicación)`),
  `ix.accordion/tabs/flip/flash/timeline` (informativas), `ix.wordsearch/crossword/az`, `ix.casep`, `ix.imageCards`,
  `ix.hotspots(image, alt, spots[{x,y,w,h,label,correct,feedback}] en %, prompt, fbk)`, `ix.beforeAfter`, `ix.puzzle`,
  `ix.hidden`, `ix.html({html,css,js,height?,require_completion?,state_max?})`.
- `img:{src,alt,caption,layout:'top'|'bottom'|'left'|'right',width:33|50|66,full,align}`. SVG 16:9 apaisado ⇒
  `layout:'top', full:true`. Todas con `alt` descriptivo. Rutas `assets/img/cN_*.svg` (minúsculas, sin acentos).
- `video:{id,caption,ratio,transcript}`: ID de 11 caracteres **verificado** en el dossier. La `transcript` es obligatoria:
  redacta un resumen fiel de lo que **sabes** que cuenta el vídeo (según el dossier) y añade en `notes:` «Verificar la
  transcripción viendo el vídeo». Nunca inventes qué dice un vídeo que no has podido comprobar: si el dossier
  dice «contenido no verificado», **no lo uses** como pieza central (como enlace de ampliación en un callout, sí).
- Imágenes del kit INCIBE (`C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\...\Consejos\*.png`): solo las
  **< 250 KB** y que aporten; `c.assetFile('assets/img/cN_kit_xx.png', ruta)` y cítalas como «Kit de concienciación
  de INCIBE» en `caption`. Los PNG de `Posters/` pesan decenas de MB: **no** usar.
- Peso objetivo del `.scormproj`: **< 1,5 MB** (todo SVG/código; vídeo por YouTube).

## Interactivos a medida (`html_embed`)
Corren en un iframe **sin red, sin SCORM, sin acceso a la página** (`window.MeEmbed` es el único canal:
`complete()`, `saveState(obj)`, `state`, `completed`). Reglas:
- **Móvil primero**: sin hover; botones ≥ 44 px; sin `100vh`; ancho fluido (≤ 640 px); texto ≥ 16 px;
  `touch-action` correcto; respeta `prefers-reduced-motion`.
- Texto del autor con `textContent`; sin librerías externas ni `fetch`; sin imágenes remotas (SVG inline o `data:`).
- Estado guardado **ASCII compacto** (índices/booleanos): `{"i":2,"c":1}`; `state_max` suficiente (20-60).
  Si no guardas nada, `state_max: 0` y no llames a `saveState`.
- Llama a `MeEmbed.complete()` al terminar la actividad (consulta `MeEmbed.completed` al arrancar).
- Colores con contraste AA; no transmitir solo con color. Usa la hoja base de `widgets.mjs` como referencia visual
  (variables `--ink --blue --teal --ok --bad`…) para que todo el programa tenga el mismo lenguaje.
- **Pruébalo en un Chrome real**: copia `_test-widgets.mjs` (shim de `MeEmbed` + Playwright a 390 px), comprueba
  que completa, que no hay errores de consola y mira la captura. Ideas a medida: simulador de bandeja de entrada,
  inspector de enlaces, «cuánto tardaría en descubrirse tu contraseña», detector de deepfake con pistas ocultas,
  radar de wifi (elige la red segura), semáforo de datos con arrastrar, «turno de noche» con relojes y decisiones,
  panel de control con indicadores que se ponen en rojo/verde, mini-juego de reflejos «¡cierra la sesión!»…

## Checklist antes de dar el curso por terminado
1. `run.mjs` termina con `✓` y **0 errores**; revisa y corrige los avisos del validador (salvo justificados).
2. Duración estimada ≈ 1 h 30 – 1 h 50 (el script la imprime, ya sumando el test).
3. Todos los objetivos evaluados; ninguna pantalla > ~600 caracteres sin interacción informativa; tipos de
   interacción **variados** (no repetir el mismo dos veces seguidas).
4. Cada `html_embed` probado en Chrome (completa, sin errores). Capturas de 3-4 ilustraciones SVG revisadas
   (texto dentro del recuadro, sin solapes).
5. Nada «NO CONFIRMADO». URLs de bibliografía y de vídeo **tal como figuran verificadas** en el dossier.
6. No hagas `git commit` ni toques archivos ajenos a tu curso (`cN-*.mjs`, y tus ficheros auxiliares
   `cN-*.mjs`/`assets` generados). No edites `lib.mjs`/`widgets.mjs`/`svgkit.mjs`: si necesitas algo, créalo en
   tu propio fichero (`cN-widgets.mjs`) o pídelo en tu informe.
