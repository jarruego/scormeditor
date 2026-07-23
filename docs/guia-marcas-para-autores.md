# Cómo pedir una interactividad concreta en tu documento

Cuando escribes el Word/PDF que luego se convierte en curso SCORM, el sistema decide
solo qué partes conviene convertir en acordeones, preguntas, tarjetas, etc. **No hace
falta que marques nada**: si no pones ninguna marca, todo sigue funcionando igual que
hasta ahora.

Pero si ya sabes exactamente qué quieres en un punto concreto — por ejemplo, «estos
tres párrafos que hablan de tipos de extintores, quiero que salgan como un
acordeón» — puedes **pedirlo tú directamente en el propio texto**, con una marca muy
sencilla. El sistema la respeta tal cual.

## La marca básica

Se escribe así, envolviendo el trozo de texto al que se refiere:

```
{{acordeon}}
... aquí el texto que quieres que forme el acordeón ...
{{/acordeon}}
```

- Primero el nombre de lo que quieres, entre `{{` y `}}`.
- Al final, lo mismo pero con una barra: `{{/acordeon}}`.
- Puedes escribirlo en cualquier procesador de texto (Word, Google Docs…) o
  directamente en un PDF si lo editas en texto. No necesita ningún formato especial
  (ni color, ni negrita): son solo caracteres.
- Si te olvidas de cerrar la marca, no pasa nada grave: el sistema hace lo razonable y
  te lo indica en las notas del curso generado para que lo revises.

## Catálogo de marcas disponibles

### Para presentar contenido de forma atractiva (no se puntúan)

| Escribe esto | Para qué sirve | Cuándo usarla |
|---|---|---|
| `{{acordeon}}` | Lista de apartados que se despliegan uno a uno | 5 o más puntos, o textos largos |
| `{{pestañas}}` | Varios bloques cortos en pestañas, uno junto a otro | 2 a 4 bloques cortos y paralelos |
| `{{tarjetas_volteables}}` | Tarjetas que se giran para mostrar el reverso | Parejas concepto↔definición, dato↔ejemplo (máx. 4) |
| `{{linea_tiempo}}` | Cronología con hitos en orden | Evolución histórica, fases de un proceso |
| `{{tarjetas_imagen}}` | Rejilla de tarjetas con imagen y título que abren un texto | Series de elementos con imagen propia (tendrás que añadir las imágenes después en el editor) |

### Para preguntar o poner a prueba (se puntúan)

| Escribe esto | Qué genera |
|---|---|
| `{{opcion_unica}}` | Pregunta de elegir una opción entre varias |
| `{{verdadero_falso}}` | Pregunta de verdadero o falso |
| `{{huecos}}` | Frase con una o varias palabras que hay que rellenar |
| `{{parejas}}` | Emparejar elementos de dos columnas |
| `{{clasificar}}` | Arrastrar elementos a la categoría correcta |
| `{{ordenar}}` | Ordenar los pasos de un proceso |
| `{{decision}}` | Un caso o situación donde el alumno decide qué hacer |
| `{{caso_practico}}` | Un ejercicio práctico con su solución explicada |

### Para reflexionar (abierta, sin nota)

| Escribe esto | Qué genera |
|---|---|
| `{{reflexion}}` | Una pregunta abierta para pensar, sin respuesta única |

### Para cerrar un tema (repaso)

| Escribe esto | Qué genera |
|---|---|
| `{{tarjetas_repaso}}` | Tarjetas de repaso rápido de lo visto |
| `{{sopa_letras}}` | Sopa de letras con los términos clave |
| `{{crucigrama}}` | Crucigrama con los términos clave |
| `{{rosco}}` | Rosco tipo «Pasapalabra», una pregunta por letra |

### Si no tienes claro el tipo exacto

| Escribe esto | Qué hace |
|---|---|
| `{{interactividad}}` | El sistema elige la mejor forma de **presentar** ese contenido |
| `{{evaluacion}}` | El sistema elige el mejor tipo de **pregunta** para ese contenido |
| `{{cierre}}` | El sistema elige la mejor actividad de **repaso final** |

Con estas tres marcas «genéricas» tú decides **dónde** quieres una interactividad, sin
tener que decidir el tipo exacto.

## Lo que NO puedes pedir así

Hay algunos tipos que necesitan que alguien ajuste a mano una imagen o un fragmento de
código (por ejemplo, señalar zonas concretas sobre una foto, o comparar dos imágenes
antes/después). Esos se añaden **después**, ya dentro de SCORMEditor, no desde el
documento. Si los marcas, el sistema lo anotará como pendiente para que se añadan a
mano, pero no los generará automáticamente.

## Trucos opcionales: dar la respuesta ya hecha

Si además de decir el tipo quieres dar tú mismo el contenido exacto de la pregunta (en
vez de que el sistema la redacte a partir del texto), puedes escribirla ya lista:

**Pregunta de una opción, marcando la correcta con un asterisco `*`:**
```
{{opcion_unica}}
¿Qué extintor se usa en un incendio eléctrico?
- Extintor de agua
- *Extintor de CO2
- Manguera de riego
{{/opcion_unica}}
```

**Verdadero/Falso, indicando la respuesta al final:**
```
{{verdadero_falso}}
El extintor de CO2 no deja residuo tras su uso. (V)
{{/verdadero_falso}}
```

**Parejas o clasificación, con una flecha `→`:**
```
{{parejas}}
Extintor de agua → Fuegos de madera y papel
Extintor de CO2 → Fuegos eléctricos
{{/parejas}}
```

**Orden de pasos, escritos ya en el orden correcto:**
```
{{ordenar}}
- Retira el pasador de seguridad
- Apunta a la base del fuego
- Aprieta la palanca
- Muévete en abanico
{{/ordenar}}
```

Si no escribes la pregunta/respuesta de esta forma, no pasa nada: el sistema redacta
la pregunta él solo a partir del texto que hayas marcado, igual que ya hace cuando no
hay ninguna marca.

## Preguntas frecuentes

**¿Tengo que marcar todo el documento?** No. El sistema sigue añadiendo
interactividades por su cuenta donde no hay marca, con el mismo criterio de siempre
(un tema no se queda «pelado» de actividades por poner solo dos o tres marcas).

**¿Puedo poner tantas marcas como quiera?** Sí. Si marcas muchas interactividades, el
sistema las respeta todas, aunque salgan más de las que pondría por su cuenta.

**¿Qué pasa si me equivoco al escribir el nombre de la marca?** El sistema intenta
adivinar a qué tipo te referías; si no lo tiene claro, elige una interactividad
genérica en ese punto y lo deja anotado para que lo revises.
