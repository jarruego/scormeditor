/**
 * Genera docs/curso-ciberseguridad/documento-base.md uniendo la portada/índice/criterios
 * con los 6 dossiers de investigación (docs/curso-ciberseguridad/fuentes/), con los
 * encabezados bajados un nivel. Ejecutar: node scripts/curso-ciberseguridad/build-doc-base.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'curso-ciberseguridad')
const files = readdirSync(join(ROOT, 'fuentes')).filter((f) => /^0\d-.*\.md$/.test(f)).sort()

/** Baja un nivel los encabezados (fuera de bloques de código) para anidarlos bajo «Parte N». */
function shift(md) {
  let fence = false
  return md
    .split('\n')
    .map((l) => {
      if (/^```/.test(l)) fence = !fence
      return !fence && /^#{1,5} /.test(l) ? '#' + l : l
    })
    .join('\n')
}

const head = `# Ciberseguridad en centros sociosanitarios — Documento base

> **Programa formativo de ≈ 10 horas, en 6 cursos SCORM interactivos**, para todo el personal de
> residencias y centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración,
> dirección, supervisión, mantenimiento). Pensado para móvil y para personas sin soltura digital.
>
> Este documento reúne **toda la información investigada** (fuentes oficiales, casos, datos, vídeos,
> recursos visuales, escenarios y preguntas) que sirve de base a los 6 paquetes \`.scormproj\`.
> Los paquetes están en \`docs/curso-ciberseguridad/scormproj/\`; los guiones de generación, en
> \`scripts/curso-ciberseguridad/\`.

## Cómo leer este documento

Cada dossier lleva **marcas de verificación** junto a cada dato:

| Marca | Significado |
|---|---|
| \`[L]\`, \`[V]\`, \`[LEÍDO]\` | El dato se leyó directamente en la fuente citada (oficial siempre que se indica). |
| \`[S]\`, \`[SECUNDARIA]\`, \`[SOLO BÚSQUEDA]\`, \`[V-sec]\` | Solo consta en una fuente secundaria o en un resultado de búsqueda: contrastar antes de citarlo como hecho. |
| \`[NC]\`, \`[NO CONFIRMADO]\`, \`[SIN CONFIRMAR]\`, \`[NO VERIFICADO]\` | No se ha podido confirmar. **No se usa en los cursos.** |

Regla del programa: **en los cursos solo entra lo leído en fuente oficial o claramente marcado como
recomendación/buena práctica propuesta.** Los ejemplos de mensajes fraudulentos y los casos de aula
son **ficticios y didácticos** y se presentan como tales.

## Programa

| # | Curso (\`.scormproj\`) | Idea fuerza | Pantallas | Duración estimada* |
|---|---|---|---|---|
| 1 | Fundamentos: por qué importa la ciberseguridad en una residencia (\`cibersegsoc-c1-fundamentos\`) | Cuidas personas y también sus datos; tú eres la defensa | 53 | 1 h 38 |
| 2 | Contraseñas y accesos: las llaves de la residencia (\`cibersegsoc-c2-contrasenas\`) | Frases de paso largas, nada de claves compartidas, verificación en dos pasos | 49 | 1 h 18 |
| 3 | Correo, mensajes y llamadas: no piques el anzuelo (\`cibersegsoc-c3-correo-fraudes\`) | Parar, mirar, preguntar: señales de fraude y qué hacer si ya has picado | 64 | 1 h 42 |
| 4 | Mi puesto, mis dispositivos y mi wifi (\`cibersegsoc-c4-puesto-dispositivos\`) | Puesto limpio, actualizaciones, wifi, móvil, copias y teletrabajo | 58 | 1 h 29 |
| 5 | Datos de las personas residentes: confidencialidad, fotos y brechas (\`cibersegsoc-c5-datos-brechas\`) | Qué se puede decir y a quién; fotos; avisar a tiempo de una brecha | 55 | 1 h 44 |
| 6 | Inteligencia artificial: nuevas amenazas y uso seguro (\`cibersegsoc-c6-ia\`) | Voz y vídeo falsos; verificar por otro canal; qué datos no se dan a una IA | 55 | 1 h 30 |
| | **Total** | | **334** | **≈ 8 h 20** |

*Estimación del editor (chip de duración), con el tiempo de cada interactivo a medida declarado por el
autor en \`est_seconds\` (a ojo, sin medir con alumnos) y el test final contado a 30 s/pregunta. Los
ritmos reales variarán; el programa se ajusta (ampliando o recortando) tras la revisión del cliente.

**Hilo común de los 6 cursos:** *para, mira, pregunta, avisa.* Ante la duda, nadie es sospechoso por
preguntar; lo grave es callar.

## Criterios pedagógicos del diseño

- **Móvil primero**: pantallas cortas (una idea cada una), botones grandes, ilustraciones vectoriales
  (SVG) ligeras, vídeo por YouTube (no se aloja), sin pósteres ni infografías pesadas.
- **Interactividad con sentido**: baraja deslizable «¿fraude o legítimo?», historias con decisiones
  (llamadas, WhatsApp, videollamada), laboratorios y simuladores a medida (HTML+CSS+JS aislados),
  \`hotspots\` sobre escenas de la residencia, ordenar procedimientos, clasificar, emparejar, rosco,
  crucigrama, sopa de letras, tarjetas de repaso y un **compromiso final** por curso.
- **Por puesto**: cada curso incluye escenarios para gerocultor/a, auxiliar y enfermería, administración y
  dirección, supervisión y mantenimiento (los tests «en su puesto» del kit del INCIBE, pero con
  situaciones propias y con explicación de cada respuesta).
- **Evaluación**: actividades puntuables repartidas por el curso + test final de aplicación (10-12
  preguntas, una a una, con explicación); nota mínima 70 %.
- **Tono**: tuteo, lenguaje llano, sin culpabilizar.

## Recursos visuales y de vídeo

- **Ilustraciones**: SVG propios generados por script (\`scripts/curso-ciberseguridad/svgkit.mjs\`), dentro de
  cada \`.scormproj\` en \`assets/img/\`.
- **Kit de concienciación del INCIBE**: solo los PNG pequeños de «Consejos» (se citan como «Kit de
  concienciación de INCIBE»). *Pendiente de confirmar la licencia de reutilización del kit.* Los pósteres
  (hasta 39 MB) y las presentaciones **no** se incorporan: no son aptos para móvil. Algunas carpetas del kit
  están mal etiquetadas (ver cada dossier).
- **Vídeos**: cada dossier lista los vídeos de YouTube **verificados con oEmbed** (existencia e
  incrustabilidad, título y canal). **Su contenido y duración no están verificados**: verlos antes de publicar.
  No hay vídeos oficiales breves para todos los temas (IA, USB, VPN, brechas): donde falta, el curso usa
  piezas visuales propias.

## Verificaciones pendientes antes de publicar

1. Ver los vídeos incrustados y confirmar duración, contenido y subtítulos; ajustar la transcripción de cada pantalla.
2. Confirmar la **licencia de reutilización del kit** del INCIBE.
3. Comprobar el horario y el canal de la línea **017** de INCIBE (el dossier del curso 3 recoge un horario de 2022).
4. Curso 6: leer el texto consolidado del Reglamento (UE) 2024/1689 tras el «Ómnibus» (art. 4, alfabetización en IA) antes de afirmar obligaciones.
5. Curso 5: la aplicabilidad de **NIS2/ENS** y la obligatoriedad de **DPD** a cada centro dependen de su situación; no se afirman. Los contactos internos (responsable, DPD) los define cada centro.
6. Curso 2: el criterio de contraseñas sigue **CCN-CERT BP/35 y NIST 800-63B-4**, más modernos que el kit del INCIBE (que mantiene 8-10 caracteres y cambio trimestral). Si el centro tiene política propia, prevalece.
7. Revisión por el DPD / responsable de seguridad del centro de las «propuestas» (matriz de permisos por puesto, protocolo de 5 pasos, uso de móviles personales).

---
`

let body = ''
for (const f of files) {
  const md = readFileSync(join(ROOT, 'fuentes', f), 'utf8')
  body += `\n\n---\n\n<!-- Fuente: fuentes/${f} -->\n${shift(md).replace(/^## /, '## Parte ')}\n`
}
writeFileSync(join(ROOT, 'documento-base.md'), head + body, 'utf8')
console.log('documento-base.md:', Math.round((head + body).length / 1024), 'KB,', files.length, 'dossiers')
