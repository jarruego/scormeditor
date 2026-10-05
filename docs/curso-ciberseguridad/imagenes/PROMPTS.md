# Imágenes profesionales del programa — guía y prompts

Sustituyen a las ilustraciones vectoriales de **escenas**. Los esquemas con texto (3-2-1, líneas de
tiempo, mockups de SMS/WhatsApp/correo falso, tablas…) se **quedan en vector**: las IA escriben mal el
texto y esos esquemas necesitan que cada palabra sea exacta.

## Dónde dejar las imágenes

```
E:\WWW\scormeditor\docs\curso-ciberseguridad\imagenes\entrada\
```

- **Nombre del fichero = el código en negrita de cada prompt** (por ejemplo `c1_portada.png`). Con eso las
  coloco yo solo en su pantalla, sin tocar nada a mano.
- Formato **PNG** (o JPG), tal como lo descargues de ChatGPT. Yo las reduzco y optimizo para móvil al integrarlas.
- Esa carpeta no se sube a git (son originales pesados).
- Cuando termines un lote, avísame («lote 2 listo») y las integro, las miro una a una y reajusto las zonas
  pulsables de las escenas con `hotspots`.

## Cómo trabajar (para que todas tengan la misma línea visual)

1. **Un chat nuevo por lote** de 10, y en el primer mensaje: pega el **BLOQUE DE ESTILO** y adjunta las 3
   imágenes de referencia `ref_*` (las creas en el lote 1; a partir del lote 2 simplemente las adjuntas).
2. **Una imagen por mensaje.** Pega el prompt de la imagen tal cual. Si ChatGPT genera varias, elige una.
3. Tamaño: pídele **horizontal 3:2 (1536×1024)** (ya va en el bloque de estilo).
4. **Revisa siempre**: sin texto ni letras en la imagen, sin logotipos, manos con 5 dedos, personajes
   reconocibles (mismas caras y ropa que en `ref_personajes`). Si algo falla, di «repítela corrigiendo X».
5. Si en un lote notas que se desvía del estilo, vuelve a pegar el bloque de estilo y adjunta de nuevo las
   referencias.
6. Cada curso tiene un **color de acento** (va en cada prompt): da identidad a cada curso sin romper la línea
   común.

## BLOQUE DE ESTILO (pegar al inicio de cada chat/lote)

```
STYLE GUIDE — follow it for every image in this chat.
Professional editorial illustration for an e-learning course for staff of care homes (centros
sociosanitarios). Modern semi-flat vector look with subtle soft gradients and gentle soft shadows; clean
smooth shapes with rounded corners; no outlines (or very thin outlines in a darker tone of the same colour);
consistent 2.5D perspective, slightly top-down three-quarter view. Warm, friendly, reassuring mood — never
alarming, dark or dramatic.
PALETTE (limited): deep navy #1B2A41 for dark elements, vivid blue #2F6FED, teal #14A39A, warm amber #F5A623,
coral red #E5484D ONLY for danger/alert details, green #2FB36D for "correct/safe", and soft pastel
backgrounds (sky #E8F0FF, mint #E3F6F3, cream #FFF4DE). Each image also has one ACCENT colour given in the
prompt, used for background shapes and highlights.
COMPOSITION: one clear focal subject, uncluttered, generous empty space, main subject inside the central 80%
(safe margins). Soft pastel gradient background with a few subtle geometric shapes (circles, rounded
blobs). Landscape 3:2 (1536x1024).
PEOPLE: diverse, friendly, simplified faces with minimal features (dot eyes, small smile), rounded proportions,
no uncanny realism. Care staff wear teal-and-white tunics or scrubs. Use ONLY the recurring characters
described below, always looking exactly the same.
STRICT RULES: NO text, NO letters, NO numbers, NO logos, NO brand names, NO watermarks anywhere. Screens, signs,
papers, posters and labels show only abstract lines, bars and shapes (never readable writing). Keep objects
anatomically and physically plausible (5 fingers, correct hands, no melted objects).

RECURRING CHARACTERS
- MARTA: care assistant (gerocultora), about 45, olive skin, dark brown hair in a low bun, teal tunic with
  white trim.
- LUCÍA: nurse, about 30, light skin, auburn ponytail, navy scrubs with teal piping, stethoscope around the neck.
- AHMED: maintenance technician, about 52, brown skin, short grey beard, navy polo shirt and grey work vest with
  a small tool belt.
- ELENA: centre director, about 55, silver short bob haircut, dark navy blazer, thin glasses.
- PABLO: administrative worker, about 35, light-brown skin, short black hair, round glasses, light-blue shirt.
- CARMEN: resident, about 84, soft white wavy hair, mustard cardigan, warm smile.
- GREGORIO: resident, about 86, bald with white moustache, green cardigan, walking cane.
- THE STRANGER: a faceless figure (blank dark-grey oval for a face), dark hooded jacket, coral accent on the
  hood lining; never threatening, slightly cartoonish.
```

## Colores de acento por curso

| Curso | Acento |
|---|---|
| 1 Fundamentos | azul `#2F6FED` |
| 2 Contraseñas | violeta `#7C5CD6` |
| 3 Correo y fraudes | naranja coral `#E8603C` |
| 4 Puesto y dispositivos | turquesa `#14A39A` |
| 5 Datos y brechas | azul marino `#234A8A` con rosa claro `#F4D6D2` |
| 6 Inteligencia artificial | púrpura `#7A3FD1` con cian `#6DC3C0` |

---

# LOTE 1 — referencias de estilo + Curso 1 (10 imágenes)

> Las 3 primeras definen la línea visual. **Guárdalas también en `entrada/`**: las usaré como referencia
> y a partir del lote 2 las adjuntas en cada chat.

**1. `ref_personajes`** — hoja de personajes
```
Create a character line-up sheet: the eight recurring characters (MARTA, LUCÍA, AHMED, ELENA, PABLO, CARMEN,
GREGORIO and THE STRANGER) standing side by side in a neat row, full body, front three-quarter view, friendly
relaxed poses, on a plain very light background (#F5F8FC) with a soft ground shadow under each. Same
scale for staff (residents slightly shorter). Strictly follow the style guide. No text. Accent colour: blue
#2F6FED for a subtle floor band.
```

**2. `ref_centro`** — ambiente del centro
```
Interior of a modern, bright care home (centro sociosanitario): a welcoming hall with a reception /
nurses' station counter, a large window, plants, a corridor with doors on the right, soft warm light. MARTA
stands behind the counter and CARMEN sits in an armchair near the window, both small in the frame. Wide
establishing shot, slightly top-down three-quarter view. No text on signs (abstract shapes only). Accent
colour: blue #2F6FED.
```

**3. `ref_objetos`** — kit de objetos
```
A tidy grid (4 columns x 3 rows) of twelve objects, each centred on a soft pastel circle: tablet, laptop,
smartphone, padlock, shield with a check mark, golden key, USB stick, wifi router, envelope, fishing hook,
document folder with a heart-pulse line, cloud. Same lighting, same soft gradients, same rounded style for all.
No text on any object. Accent colour: teal #14A39A for the circles.
```

**4. `c1_portada`** — portada del curso 1
```
Cover illustration: the exterior of a friendly modern care home (two floors, garden, trees) under a big
translucent teal shield with a padlock that floats protectively above the building. MARTA and AHMED stand on
both sides in the foreground, smiling, looking at the viewer. Calm blue sky gradient with soft clouds,
small floating sparkles. Reassuring and professional. Accent colour: blue #2F6FED.
```

**5. `c1_centro`** — qué cuidas (cuatro tesoros)
```
Isometric cutaway of a care home showing four "treasures" to protect, each in its own area with a soft glow:
(1) a resident's room where CARMEN sits with a caring MARTA (care); (2) a nurses' station with a computer
whose screen shows abstract health-record rows (health data); (3) a small safe with coins (money); (4) a big
heart floating above the building (trust). A faint translucent shield surrounds the whole building.
Clean and readable, no text. Accent colour: blue #2F6FED.
```

**6. `c1_datos_salud`** — datos de salud
```
A glowing clipboard / health record folder with a heart-pulse line, held safely inside a transparent padlock
bubble in the centre. From the darker edges of the image, a fishing hook on a line and a curious eye try to
reach it, drawn in coral red but stylised and not scary, harmless-looking. Calm, protective atmosphere.
Soft pastel background. Accent colour: blue #2F6FED.
```

**7. `c1_ransomware`** — ransomware
```
A desktop computer on a nurses' station desk whose screen is filled with a coral-red padlock graphic and rows of
file icons each with a small padlock (files locked), no readable text at all. LUCÍA stands next to it with a
worried but calm expression, one hand on her chin; a clipboard on the desk. Soft cool lighting. Reassuring tone,
it looks like a problem that has a solution. Accent colour: blue #2F6FED.
```

**8. `c1_equipo`** — tú eres la defensa
```
MARTA, LUCÍA, AHMED and PABLO standing in a row in the centre hall of the care home, friendly poses, each
with a small translucent teal shield floating above their head, connected by thin glowing lines (a team
network). Warm, proud, collaborative mood. Soft background of the hall. Accent colour: blue #2F6FED.
```

**9. `c1_escena_planta`** — ESCENA CON ZONAS (hotspots): sala de enfermería
```
A nurses' station seen from the front, slightly top-down, with these large, clearly separated objects
(no text anywhere): LEFT THIRD: a tablet on a stand with a small yellow sticky note stuck on its frame, and a
binder on a shelf above it (top-left); CENTRE: a desktop computer with its screen ON and the chair empty
(nobody sitting), a small USB stick lying on the counter below it; RIGHT-CENTRE: a stack of loose papers on the
counter; FAR RIGHT: a smartphone leaning against the wall showing a photo of an elderly woman; BOTTOM-LEFT: a
paper shredder. Keep every object big, well separated and easy to recognise, with free space between them.
Accent colour: blue #2F6FED.
```

**10. `c1_escudo`** — cierre del curso
```
A large teal shield with a white check mark in the centre, celebration confetti, stars and ribbons around, small
floating icons (heart, padlock, key) in gentle orbit. Happy, rewarding mood, soft pastel background.
Accent colour: blue #2F6FED.
```

---

# LOTE 2 — Curso 2 (8) + Curso 3 (2)

**11. `c2_portada`**
```
MARTA smiling, holding up a big ring of keys with a padlock charm and a small shield charm, half-body, in
front of a soft violet gradient background with floating key and padlock shapes. Accent colour: violet
#7C5CD6.
```
**12. `c2_puerta_llave`** — usuario y clave
```
A friendly front door with a blank name plate that shows a simple person avatar silhouette (no text), and a
golden key sticking out of the lock. Next to the door, a floating label in the shape of a small tag: left tag
with the avatar (the username), right tag with the key (the password). Simple, symmetrical, clear. Accent
colour: violet #7C5CD6.
```
**13. `c2_llave_maestra`** — una llave para todo (mal)
```
One golden key hovering in the middle opening three different boxes lined up below it: a box with an
envelope symbol (email), a box with a shopping cart symbol (online shop) and a box with a medical folder
symbol (care software). A soft coral warning glow around the key, conveying "one key opens everything is
risky". Accent colour: violet #7C5CD6.
```
**14. `c2_tablet_planta`** — tablet de planta compartida
```
A wall-mounted tablet at the floor station. Its screen shows three round person avatars in a row (three
different people), each with its own small padlock below it, abstract, no text. MARTA's hand is touching one of
the avatars. Soft background of a care-home corridor. Accent colour: violet #7C5CD6.
```
**15. `c2_sala_enfermeria`** — ESCENA CON ZONAS (hotspots)
```
A nurses' room seen from the front, slightly top-down, large and clearly separated objects, no readable text:
CENTRE: an open laptop on a desk with its screen on (session open, nobody there); a yellow sticky note on the
right edge of the laptop screen; LEFT-BOTTOM: a tablet lying unlocked on a small table showing app icons;
TOP-RIGHT: a poster-style notice on the wall with abstract lines (a shared login notice); RIGHT-BOTTOM: a
smartphone with a padlock icon on its dark locked screen; TOP-LEFT: a round wall clock. Keep each object big
with free space around it. Accent colour: violet #7C5CD6.
```
**16. `c2_dos_pasos`** — segundo cerrojo
```
A laptop (left) with a green check on its screen and a smartphone (right) showing a big confirm button (abstract),
connected by a dotted line with small sparkles. Above them, a sturdy door with TWO locks one under the other,
both closing together. Conveys "two locks". Accent colour: violet #7C5CD6.
```
**17. `c2_gestor`** — caja fuerte de claves
```
A friendly open vault / safe with golden keys and little cards neatly stored inside; a single large master key
hovering above it with a soft glow. Subtle shield behind the safe. Clean and trustworthy. Accent colour: violet
#7C5CD6.
```
**18. `c2_robada`** — clave robada
```
PABLO looking at his smartphone with a worried but resolute face; the phone shows a notification bubble with a
warning triangle (abstract). Around him, three floating icons in a gentle arc: a bell (notify), a key (change
the password), a shield (protect). Soft calm background. Accent colour: violet #7C5CD6.
```
**19. `c3_portada`**
```
Cover: a fishing hook hanging from the top of the image on a thin line, with a white envelope as bait, above calm
blue water with soft ripples; a few friendly fish silhouettes below watching it; a small teal shield bubble
floating next to the hook. Accent colour: coral orange #E8603C.
```
**20. `c3_anzuelo`** — te engañan a ti, no al aparato
```
THE STRANGER (hooded faceless figure) standing outside a closed front door with a speech bubble containing only
three dots; inside, through the glass part of the door, MARTA looks hesitant with the door chain on, hand on her
chin. Warm light inside, cool light outside. Accent colour: coral orange #E8603C.
```

---

# LOTE 3 — Curso 3 (2) + Curso 4 (8)

**21. `c3_qr`** — quishing
```
A wall poster (abstract shapes, no text) with a black-and-white QR code; a second slightly misaligned QR sticker
stuck over it, subtly different. AHMED holds a smartphone in front of it about to scan, a magnifying glass icon
floating near the sticker. Accent colour: coral orange #E8603C.
```
**22. `c3_llamada`** — vishing
```
PABLO at a reception desk holding a phone to his ear, listening. A split speech bubble beside him shows THE
STRANGER (faceless, wearing a headset) with a friendly wave, and an abstract remote-control app icon (a screen
with a cursor). Warm office, reassuring tone. Accent colour: coral orange #E8603C.
```
**23. `c4_portada`**
```
Cover: MARTA smiling, holding a tablet, surrounded by floating symbols: a shield, a padlock, the wifi symbol and
a USB stick with a crossed-out red circle. Soft teal gradient background. Accent colour: teal #14A39A.
```
**24. `c4_puesto`** — tu puesto cuenta
```
Isometric workstation of a care-home front desk: computer, tablet, smartphone, a few papers, and above it a wifi
symbol. Six small coloured dots (no numbers) mark each item like annotation points. Clean, tidy, bright. Accent
colour: teal #14A39A.
```
**25. `c4_tablet`** — tablet compartida
```
A wall tablet at the nursing station with a user session open (a profile avatar, abstract lines, no text); a second
person (LUCÍA) is walking up to use it while a soft coral highlight outlines the avatar to show "someone else's
session". Corridor background. Accent colour: teal #14A39A.
```
**26. `c4_enfermeria`** — ESCENA CON ZONAS (hotspots)
```
A nurses' office seen from the front, slightly top-down, objects large and well separated, no readable text:
LEFT: a computer on a desk with a medication list on its screen (abstract rows) and a small yellow sticky note
next to it; a closed locked cabinet on the top-left wall; CENTRE: a tablet on a stand showing an open user
session, a sheet of paper (a posture-changes schedule, abstract lines) on the wall above; CENTRE-RIGHT: a USB
stick on the counter, a paper shredder below-right; RIGHT: a half-open door to a communications room with a key
left in the lock; BOTTOM-RIGHT: a bin overflowing with printed sheets; a second computer with a locked screen
(padlock icon) near the centre. Free space around each object. Accent colour: teal #14A39A.
```
**27. `c4_guardianes`** — los tres guardianes
```
Three friendly guardian characters standing in a row, simple rounded robot-like mascots, each holding a different
emblem: the first a circular-arrows "update" badge, the second a shield with a check mark (antivirus), the third a
brick wall (firewall). Heroic but cute poses, soft background. Accent colour: teal #14A39A.
```
**28. `c4_usb`** — un USB que aparece
```
A lone USB stick lying on a corridor floor under a soft spotlight; LUCÍA stops next to it with her hand raised in a
"stop" gesture instead of picking it up; a small coral stop-hand icon floats above the USB. Calm, clear.
Accent colour: teal #14A39A.
```
**29. `c4_router`** — tres tipos de wifi
```
A wifi router on a shelf in the middle radiating three arcs in different colours: blue to a staff office with a
computer, amber to a guest lounge with a visitor on a phone, and a grey-pink arc to a café table outside with a
person on a smartphone (public wifi). Three clearly separated zones. Accent colour: teal #14A39A.
```
**30. `c4_movil`** — un móvil, dos vidas
```
A large smartphone in the centre with a padlock on its screen. Left half of the background (warm): personal life
icons (family photo frame, heart); right half (cool): work icons (envelope, clipboard). A subtle line separates
the two worlds. Accent colour: teal #14A39A.
```

---

# LOTE 4 — Curso 4 (3) + Curso 5 (5) + Curso 6 (2)

**31. `c4_movil_perdido`**
```
A smartphone lying on a city bench; above it a location map pin with expanding radar rings (the phone being
located). Four small step dots (no numbers) in a vertical line at the right. Soft evening light, calm.
Accent colour: teal #14A39A.
```
**32. `c4_teletrabajo`**
```
PABLO working from a cosy home office: laptop on the desk with a padlock icon on screen, a wifi router on a shelf
with a small shield icon, papers locked in a drawer with a key, a plant. Warm, safe feeling. Accent colour:
teal #14A39A.
```
**33. `c4_visita`** — quién entra al centro
```
At the care-home entrance, a technician (a faceless stranger with a cap and a hi-vis vest, holding a clipboard)
asks to come in; MARTA at the reception checks a blank visitors logbook with one hand while holding a phone to
confirm with the other. Cautious but friendly. Accent colour: teal #14A39A.
```
**34. `c5_portada`**
```
A resident's file folder with a padlock, held gently between two hands: MARTA's hand (olive skin, teal sleeve)
and CARMEN's hand (older, mustard cardigan sleeve), with a small heart above. Soft navy-to-rose gradient
background. Accent colour: navy #234A8A with light rose #F4D6D2.
```
**35. `c5_candado`** — protección reforzada
```
A large padlock in the centre. On the left, in a warm green glow: MARTA helping CARMEN with her cardigan
(allowed: caring). On the right, behind a transparent barrier with a coral tint: a curious eye, speech bubbles
with dots (gossip) and a smartphone camera (not allowed). Balanced, easy to read. Accent colour: navy #234A8A
with light rose #F4D6D2.
```
**36. `c5_llamada`** — ¿cómo está mi madre?
```
MARTA at the reception desk listening on the phone. A split bubble shows a worried daughter (adult woman, brown
hair) on her phone. In the background LUCÍA walks towards the station. Calm, professional atmosphere.
Accent colour: navy #234A8A with light rose #F4D6D2.
```
**37. `c5_foto_movil`** — una foto es un dato
```
A smartphone showing a cheerful group photo of cartoon seniors and staff (faces simplified). Four small floating
check icons around it: a face icon, a blank name tag, a background icon, and a hand-with-check icon
(permission). No text. Accent colour: navy #234A8A with light rose #F4D6D2.
```
**38. `c5_sala`** — ESCENA CON ZONAS (hotspots): planta con datos expuestos
```
A ward nurses' station seen from the front, slightly top-down, objects large and separated, no readable text:
TOP-LEFT: a closed cabinet with a key; LEFT-MIDDLE: a computer monitor facing the corridor showing a patient
record (abstract rows); TOP-CENTRE: a big whiteboard with scribbled abstract lines (names and diagnoses
suggested, unreadable); CENTRE-BOTTOM: an open document folder on the counter; CENTRE-RIGHT: a tablet showing a
group-chat window with a photo thumbnail; TOP-RIGHT: a notice board with a visiting-hours sheet (abstract
lines). Free space around each object. Accent colour: navy #234A8A with light rose #F4D6D2.
```
**39. `c6_portada`**
```
Cover: a friendly translucent-glass robot head with subtle circuit lines, a soft human-like face, holding a
theatre mask in one hand and a small microphone in the other (it imitates faces and voices). Purple-cyan
gradient background with floating sound waves. Mysterious but gentle. Accent colour: purple #7A3FD1 with cyan
#6DC3C0.
```
**40. `c6_l1_ia`** — la IA, sin misterios
```
A friendly rounded robot sitting at a desk, with floating icons around it showing what it does: a speech bubble
(talks), a pencil (writes), a paint palette (draws), a globe (translates), a microphone (imitates voices) and a
small "oops" question-mark bubble (sometimes invents things). Playful, educational. Accent colour: purple
#7A3FD1 with cyan #6DC3C0.
```

---

# LOTE 5 — Curso 6 (8)

**41. `c6_l2_estafas`**
```
Three large rounded cards in a row: an envelope, a microphone and a video camera, each with a subtle AI sparkle
badge in the corner (the three ways to be fooled with AI). Clean and symmetrical. Accent colour: purple #7A3FD1
with cyan #6DC3C0.
```
**42. `c6_voz_clonada`**
```
Left: a young man speaking, a sound wave leaves him. In the middle: an AI chip that copies the wave into a second
purple wave. Right: an older woman on her phone, worried, receiving the copied wave as a call. Left-to-right
storytelling with a soft arrow flow. No text. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```
**43. `c6_l3_deepfake`**
```
A friendly human face split vertically: the left half natural and warm, the right half dissolving into a
wireframe mesh with glitchy pixel shards in purple and cyan (the AI-generated half). Centred, symmetrical,
not creepy. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```
**44. `c6_videollamada_falsa`**
```
A laptop screen showing a 2x2 video-call grid of four people. Three of the four tiles have subtle glitch/mesh
edges in purple (generated), one is clean (real). In front of the laptop, PABLO watches with an uneasy
expression. No text. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```
**45. `c6_l4_defensas`**
```
MARTA hanging up a first phone with a decisive gesture and, with her other hand, dialling a second phone to call
back; between them a translucent teal shield. Calm confident tone. Accent colour: purple #7A3FD1 with cyan
#6DC3C0.
```
**46. `c6_parar_pensar_verificar`**
```
Three large circles in a row joined by soft arrows: a coral hand in a "stop" gesture; a thought bubble with a
question mark; a smartphone with a phone-call icon. Clean and iconic, equal sizes. Accent colour: purple
#7A3FD1 with cyan #6DC3C0.
```
**47. `c6_semaforo_datos`**
```
A tall traffic light in the centre with the red lamp, amber lamp and green lamp all softly lit. Next to the red
lamp a medical-record folder with a padlock; next to the amber lamp a document with a question mark; next to the
green lamp a general public information sheet with a check. No text. Accent colour: purple #7A3FD1 with cyan
#6DC3C0.
```
**48. `c6_nube_datos`**
```
A smartphone in the foreground sending a paper document upward as it flies into a big friendly cloud above a
small care-home building; a magnifying glass peeks at the cloud (data leaving the building and possibly being
stored). Calm, informative, not scary. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```

---

## Qué se queda en vector (no hace falta generarlo)

`c1_pilares`, `c1_niveles`, `c1_alerta`, `c2_longitud`, `c2_drive`, `c3_remitente`, `c3_candado`, `c3_correo_falso`,
`c3_sms`, `c3_whatsapp`, `c3_ceo`, `c3_iban`, `c3_pasos`, `c4_copias`, `c5_ficha`, `c5_72h`, `c5_cco`, `c5_pasos`,
`c6_correo_perfecto`, `c6_predictivo`, `c6_l6_marco` y los 3 carteles del kit del INCIBE: son esquemas con texto
o maquetas de mensajes que deben leerse exactos. Si algún día los quieres también como imagen, lo hablamos.
