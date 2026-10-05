# Esquemas con texto como imagen profesional (22 imágenes, 2 lotes)

Mismo método que `PROMPTS.md`, con una diferencia: **estas imágenes sí llevan texto**, y cada palabra va
**literal entre comillas** en el prompt. Yo reviso cada imagen leyendo el texto una a una; si falla una letra,
una tilde o una cifra, se repite.

## Carpeta y nombres

```
E:\WWW\scormeditor\docs\curso-ciberseguridad\imagenes\entrada\
```

El fichero se llama como el código en negrita (`c1_pilares.png`…). Son los mismos nombres que las imágenes
vectoriales actuales: al dejarlos, las sustituyo solas (igual que en el lote anterior).

## Cómo trabajar

1. Un chat nuevo por lote. Pega primero el **BLOQUE DE ESTILO** de `PROMPTS.md` y adjunta las 3 imágenes
   `ref_*`. Después pega el **BLOQUE DE TEXTO** de abajo (anula la regla «sin texto» solo para este lote).
2. Una imagen por mensaje, con el prompt tal cual.
3. Revisa tú también el texto antes de descargar: **cada tilde, cada cifra, cada «¿»**. Si algo no es literal,
   escribe: *«Hay un error en el texto: debe decir exactamente "…". Repite la imagen idéntica corrigiendo solo eso.»*
4. Si ves que mezcla idiomas, inventa palabras o añade rótulos que no están en el prompt, repite.

## BLOQUE DE TEXTO (pegar después del bloque de estilo, una vez por chat)

```
TEXT RULES FOR THIS BATCH — these override the "NO text" rule of the style guide.
The images in this batch are infographics WITH text. The ONLY text allowed is the exact Spanish text inside
straight quotation marks in each prompt (do not draw the quotation marks themselves unless the prompt writes
them with « »). Copy it character by character: accents (á é í ó ú ñ ü), inverted punctuation (¿ ¡), the euro
sign, digits, dots, colons, "·" separators and capitalisation exactly as written. Do NOT translate, rephrase,
abbreviate, reorder, add or omit any word. No placeholder or lorem-ipsum text, no extra labels, no
watermarks, no logos, no brand names (apps and phones must look generic).
TYPOGRAPHY: a single clean, bold, highly legible geometric sans-serif (like Poppins or Inter) for every text;
dark navy #1B2A41 on light backgrounds, white on dark colour blocks, strong contrast. Minimum text height: 4% of
the image height, because it will be read on a phone: keep layouts airy, short lines, no tiny print.
Layout: landscape 3:2 (1536x1024), same semi-flat, soft-gradient style and palette as the references, big clear
icons, rounded cards.
PROOFREAD: after generating each image, read every word and digit aloud against my prompt; if anything differs
(even one accent), regenerate until it is exact.
```

Acentos por curso: C1 azul `#2F6FED` · C2 violeta `#7C5CD6` · C3 naranja coral `#E8603C` · C4 turquesa `#14A39A` ·
C5 azul marino `#234A8A` con rosa `#F4D6D2` · C6 púrpura `#7A3FD1` con cian `#6DC3C0`.

---

# LOTE 6 (11 imágenes)

**1. `c1_pilares`**
```
Infographic. Title at the top centre: "Los tres pilares de la información". Below, three equal rounded cards in a
row, each with a big friendly icon on top, a bold heading and one short line:
Card 1 (teal): icon of a clock with a check mark; heading "Disponibilidad"; line "Que esté cuando hace falta".
Card 2 (blue): icon of a document with a pencil and a small shield; heading "Integridad"; line "Que nadie la altere".
Card 3 (navy): icon of a padlock with an eye; heading "Confidencialidad"; line "Que solo la vea quien debe".
No other text. Accent colour: blue #2F6FED.
```
**2. `c1_niveles`**
```
Infographic. Title at the top: "De más a menos protegida". Four wide rounded horizontal bars stacked like a
staircase from top to bottom, each with a padlock icon on the left (a closed heavy lock on the first one,
becoming lighter and finally an open lock on the last), a bold heading and a line of examples:
Bar 1 (coral red): heading "Restringida"; line "Historia clínica, medicación, fotos de heridas".
Bar 2 (amber): heading "Confidencial"; line "Nóminas, contratos, cuentas del centro".
Bar 3 (blue): heading "Uso interno"; line "Cuadrantes y protocolos internos".
Bar 4 (green): heading "Pública"; line "Menú semanal, web del centro".
No other text. Accent colour: blue #2F6FED.
```
**3. `c1_alerta`**
```
Infographic. Top banner with an alert triangle icon and the text "Algo no cuadra". Left: a smartphone showing a
big phone-call icon, the text "Línea de Ayuda", the big number "017" and under it "gratuita y confidencial".
Right: three stacked rounded step cards with big numbers: "1 · Para" (hand stop icon), "2 · Anota" (notepad icon),
"3 · Avisa" (bell icon). Bottom strip: "Detecta, para, avisa". No other text. Accent colour: blue #2F6FED.
```
**4. `c2_longitud`**
```
Infographic with two horizontal bars. Title at the top: "Más larga = muchísimo más trabajo para adivinarla".
Bar 1, short, in amber: label above it "M4dr1d!25 · 9 caracteres con símbolos"; at the end of the bar the text
"unas horas". Bar 2, very long, in green, spanning the full width: label above it "EnunlugardelaMancha!25 · 22
caracteres, casi todo letras"; at the end "siglos y siglos". Big bottom line: "La longitud pesa más que los
símbolos." No other text and no small print. Accent colour: violet #7C5CD6.
```
**5. `c2_drive`**
```
Infographic: two big rounded cards side by side. LEFT (green tint): heading "Restringido"; subheading "Solo las
personas que tú añades"; below, two person rows with small avatars and role chips: "Gestoría" with chip "Lector",
"Supervisora" with chip "Comentador". RIGHT (coral tint): heading "Cualquiera con el enlace"; subheading "Quien
tenga el enlace entra," and next line "aunque no tenga cuenta"; below, a crowd of six anonymous grey avatars with
question marks "?" on them. Bottom banner across both cards: "Con datos de residentes: siempre «Restringido»".
No other text. Accent colour: violet #7C5CD6.
```
**6. `c3_remitente`**
```
Infographic. LEFT: a generic smartphone showing an email inbox: top bar "Bandeja de entrada"; one highlighted
message row with a round avatar "E", the sender name "Directora Elena Ruiz", the subject "(sin asunto)" and the
preview "Marta, estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia…". RIGHT: two callout
cards. Top callout (blue): "Lo que ves: el NOMBRE" and under it "Lo escribe quien envía. Cualquiera puede poner
«Directora»." Bottom callout (coral red, highlighted): "Lo que cuenta: la DIRECCIÓN", then in a monospace pill
"direccion.centro@gmail.com", then "Una cuenta personal, no la del centro. Aquí está el engaño." A small hand-tap
icon near the name with the bottom caption "Toca el nombre y mira la dirección real". No other text.
Accent colour: orange coral #E8603C.
```
**7. `c3_candado`**
```
Infographic: two browser address bars stacked, each with a padlock icon at the left. Top bar (green): the text
"https://tu-banco.es" with a green tag "Web real". Bottom bar (coral red): "https://tu-banco.acceso-seguro.top"
with a coral tag "Falsa". Between them a banner: "Las dos tienen candado". Under the bars: "El candado no garantiza que
la web sea la verdadera". Bottom line in bold: "Mira siempre el dominio, no solo el candado". No other text.
Accent colour: orange coral #E8603C.
```
**8. `c3_sms`**
```
Infographic. LEFT: a generic smartphone showing a text-message screen: contact name "Correos"; a grey message
bubble with the text "Correos: Su paquete #ES48392 no pudo entregarse. Confirme la dirección y pague 1,29 € de tasa
en:" and below it a link line "https://correos-envios.info/pago". Four small red numbered circles (1, 2, 3, 4) pinned on
the bubble. RIGHT: four stacked cards with the same numbers: "1 No esperabas ningún paquete", "2 Te piden «confirmar»
tus datos", "3 Pagar una cantidad pequeña", "4 Dominio ajeno: «.info»". Bottom title: "SMS de «paquetería»: cuatro
señales". No other text. Accent colour: orange coral #E8603C.
```
**9. `c3_whatsapp`**
```
Infographic. LEFT: a generic smartphone showing a messaging chat (green-and-white bubbles, NO real app logo):
header with an unknown-person avatar, the name "Número nuevo" and "+34 6xx xxx xxx"; a grey bubble "Hola Marta, soy
Elena, he cambiado de móvil." and another bubble "Envíame el código de 6 cifras que te llegue por SMS. ¡Rápido,
porfa, que llego tarde!" with four small red numbered circles pinned on them. RIGHT: four stacked cards: "1 Número
que no tienes guardado", "2 «He cambiado de móvil»", "3 Pide el código del SMS", "4 Prisa: «rápido, porfa»".
Bottom title: "El código de WhatsApp no se da a nadie". No other text. Accent colour: orange coral #E8603C.
```
**10. `c3_ceo`**
```
Infographic: a flat email window on the left two-thirds with three header lines "De: Directora Elena Ruiz
<direccion.centro@gmail.com>" and "Asunto: (sin asunto)" and the body "Marta, estoy en una reunión y no puedo
hablar. Necesito que hagas una transferencia de 4.800 € ahora mismo. Es confidencial: no lo comentes. Te paso el
IBAN por aquí." On the right third, four small red tag callouts pointing to the email: "Cuenta personal (gmail)",
"«No puedo hablar»", "Urgencia: «ahora mismo»", "Secreto: «no lo comentes»". Bottom banner: "Fraude del jefe: prisa +
secreto + canal raro". No other text. Accent colour: orange coral #E8603C.
```
**11. `c3_iban`**
```
Infographic: a 2x2 grid of step cards joined by arrows, each with an icon and a number. Card 1 (icon: a factory
truck for the real supplier, caption above "Proveedor real"): "1 Se hacen pasar por tu proveedor." Card 2 (icon: a
hooked envelope, caption "Correo falso"): "2 Piden cambiar el IBAN por correo." Card 3 (icon: an office worker
at a computer, caption "Administración"): "3 Lo cambian y pagan la factura." Card 4 (icon: a bank card with a
coral warning, caption "Cuenta ajena"): "4 El proveedor real nunca cobra." Bottom banner: "Cambio de IBAN por correo: se
verifica llamando". No other text. Accent colour: orange coral #E8603C.
```

---

# LOTE 7 (11 imágenes)

**12. `c3_correo_falso`** — ESCENA CON ZONAS (hotspots): correo falso
```
A flat, full-screen email window that fills the whole image (no phone, no desk). Rows from top to bottom, each on
its own row spanning the width with generous vertical spacing, in this exact order:
row 1 header: "Bandeja de entrada" with an envelope icon;
row 2: "De: Mutua Salud Laboral <avisos@mutua-saludlaboral-gestion.com>";
row 3 (bold): "URGENTE: Su baja será anulada en 24 h";
row 4: "Estimado trabajador:";
row 5: "Hemos detectado un error en los datos de su parte de baja.";
row 6: "Si no lo corrige en 24 horas su prestación quedará suspendida.";
row 7: a big blue button "Actualizar datos y DNI" with under it the small link text "mutua-saludlaboral-gestion.com/verifica";
row 8: an attachment chip with a paperclip icon "Formulario_baja.zip";
row 9: "Atentamente, Departamento de Prestaciones".
No other text. Accent colour: orange coral #E8603C.
```
**13. `c3_pasos`**
```
Infographic: title at the top "Ante la duda: Para · Mira · Verifica · Avisa". A 2x2 grid of big cards, each with an icon:
"PARA" (red stop-hand icon) with the tag "STOP" and the line "No pulses ni respondas";
"MIRA" (magnifying glass) with "Remitente, prisa, enlace, adjunto y qué te piden";
"VERIFICA" (phone with a check) with "Por otro canal: llama al número de siempre";
"AVISA" (bell and shield) with "A tu responsable y, si hace falta, al 017".
No other text. Accent colour: orange coral #E8603C.
```
**14. `c4_copias`**
```
Infographic: title "Regla 3-2-1" at the top. Three big cards in a row, each with a giant number, an icon, a heading and a
line: "3" (three stacked documents) "copias" "la original + 2 más"; "2" (a hard disk and a cloud) "tipos de soporte"
"p. ej. disco y nube"; "1" (a building with an arrow going away) "copia fuera" "lejos del centro". Bottom banner: "Tú
guardas donde indica el centro; informática hace las copias". No other text. Accent colour: teal #14A39A.
```
**15. `c5_ficha`**
```
Infographic. LEFT: a resident's file card. Header "FICHA DE RESIDENTE"; a round avatar of an elderly woman, with "Pilar
R. Hab. 14" next to it; five rows: "Foto y nombre" and "Teléfono de su hija" with BLUE chips on the left; "Medicación",
"Diagnóstico" and "Caídas este mes" with RED chips on the left. RIGHT: two legend cards: blue "Dato personal" with "Dice
quién es la persona: nombre, foto, voz, teléfono."; red "Dato de salud" with "Cuenta algo de su salud: diagnóstico,
pastillas, caídas." Bottom badge with a padlock: "Categoría especial: protección reforzada". No other text. Accent
colour: navy #234A8A with light rose #F4D6D2.
```
**16. `c5_cco`**
```
Infographic: two email-composer cards side by side. LEFT card (coral tint, with a warning icon): heading "Todos en
«Para»"; a field "Para: ana.gomez@correo.es, luis.perez@correo.es, m.garcia@correo.es, …"; under it, a diagram of
many people all connected to each other, caption "Cada familia ve los nombres y correos de todas las demás". RIGHT card
(green tint, with a check icon): heading "Todos en «CCO»"; fields "Para: centro@centrosolmar.es" and "CCO: (oculto)"; under it a
diagram of people each connected only to the sender, caption "Cada familia solo ve su propio mensaje". Bottom banner:
"Varias familias en un correo: siempre en CCO (copia oculta)". No other text. Accent colour: navy #234A8A with light
rose #F4D6D2.
```
**17. `c5_brecha`**
```
Infographic. Top banner: "BRECHA: a los datos les pasa algo que no debía". Three equal cards with big icons:
(1) a lost tablet with a question mark: "Se pierden o se destruyen" and "Una tablet perdida";
(2) a document with a wrong pencil edit: "Se cambian sin querer" and "Una ficha mal editada";
(3) an envelope reaching the wrong person: "Los ve quien no debe" and "Un correo a la persona equivocada".
Bottom line: "Por accidente o a propósito · También si lo hace alguien de dentro". No other text. Accent colour: navy
#234A8A with light rose #F4D6D2.
```
**18. `c5_72h`**
```
Infographic: a horizontal timeline with four ticks labelled "0 h", "24 h", "48 h", "72 h". At the left start, a flag
"El centro «tiene constancia»"; at the right end, a red flag "Límite para avisar a la AEPD (si hay riesgo)". Under the
timeline, two horizontal bars: a short GREEN bar at the start with the text "Tú avisas en minutos: el centro conserva
casi todo el plazo", and a long RED bar nearly filling the timeline with "Avisas al tercer día: el plazo casi se
agota". Small clock and calendar icons; a note line "Sábados, domingos y festivos también cuentan". No other text.
Accent colour: navy #234A8A with light rose #F4D6D2.
```
**19. `c5_pasos`**
```
Infographic: five horizontal step rows stacked vertically, each with a big numbered circle, an icon, a bold heading and
a short line (one line each):
"1 Detecta y para" — "¡Alto! No sigas «arreglándolo»";
"2 No borres nada" — "Ni correo, ni mensaje, ni archivo";
"3 Avisa YA" — "Por teléfono si es urgente";
"4 Contén el daño" — "Solo lo que te indiquen";
"5 Documenta qué pasó" — "Hora, qué datos y a cuántas personas".
Bottom line: "Ante un incidente: para, no borres, avisa". Keep the type large: it is fine to use less decoration to fit.
No other text. Accent colour: navy #234A8A with light rose #F4D6D2.
```
**20. `c6_predictivo`**
```
Infographic. LEFT: a generic smartphone: header "Mensaje nuevo", the typed word "Buenos" and above the keyboard a
suggestions bar with three words "días" "tardes" "noches". RIGHT: three horizontal bars of decreasing length
labelled "días" (longest), "tardes", "noches" (shortest), with the caption "Elige la palabra más probable" above and
"No comprueba si es verdad" below. Bottom banner: "Un predictivo gigante: por eso a veces se inventa cosas". A small
friendly robot icon. No other text. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```
**21. `c6_correo_perfecto`** — ESCENA CON ZONAS (hotspots)
```
A flat, full-screen email window that fills the whole image. Rows from top to bottom in this exact order:
row 1: "De: Gerencia" and next to it "<gerencia@centro-vlda.es>";
row 2 (bold, with a red flag): "URGENTE y confidencial: cambio de cuenta";
row 3: "Hola, Marta: te escribo por el albarán de la lavandería de la planta 2.";
row 4: "Hemos cambiado de banco. Paga ya a:";
row 5 (in a highlighted box): "ES00 0000 0000 0000 0000 0000";
row 6: "Hazlo hoy y no se lo cuentes a nadie hasta que cerremos el trato.";
row 7: a blue button "Ver factura adjunta";
row 8: a round avatar "RV" next to "Gerencia · Centro Vida" and "Tel. 900 000 000".
No other text, and the email must look perfectly written. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```
**22. `c6_l6_marco`**
```
Infographic: a circle of twelve small stars (a generic European-style circle) with the letters "IA" in the centre,
above three nested layers like steps going from big to near: layer 1 "Europa" with the line "Reglamento de IA, por fases";
layer 2 "España" with "AEPD e INCIBE te orientan"; layer 3 "Tu centro" with "Normas internas de uso". Bottom banner:
"Reglas para usar la IA con garantías". No other text. Accent colour: purple #7A3FD1 with cyan #6DC3C0.
```

---

## Cuando termines

Avísame («lote 6 listo» / «lote 7 listo»): leo cada imagen, te digo qué texto falla (si lo hay), las integro y
reajusto las zonas pulsables de `c3_correo_falso` y `c6_correo_perfecto`. Los 3 carteles del INCIBE del kit se
quedan como están.
