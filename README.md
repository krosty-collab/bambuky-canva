# Bambuky Content Studio

Aplicación web local para generar contenido de Instagram con plantillas visuales de Bambuky.

Archivo principal: `index.html` — abrir en el navegador (doble clic).

Características incluidas:
- Selector de plantilla (v1..v7)
- Editar textos y campos principales
- Subir imagen y ajustar zoom/offset/rotación/overlay/blur
- Preview en canvas 1080x1350
- Exportar Slide (JPG) 1080x1350
- Exportar Carrusel (ZIP) — empaqueta las imágenes en un ZIP sin compresión
- Demo: carrusel "Los primeros días" con 7 slides precargados

Stack: HTML, CSS, JS, Canvas API — sin backend.

Notas y siguientes pasos:
- Las tipografías referenciadas (`Cormorant Garamond`, `DM Sans`) no están embebidas; añadir archivos `.woff` locales y declarar `@font-face` si desea usar exactamente las fuentes.
 - Las tipografías referenciadas (`Cormorant Garamond`, `DM Sans`) deben instalarse localmente para obtener coincidencia exacta en la app.
	 Coloca los archivos de fuentes en `fonts/` con estos nombres (o ajusta las rutas en `css/styles.css`):
	 - `fonts/CormorantGaramond-Regular.woff2` (y/o `CormorantGaramond-Regular.woff`)
	 - `fonts/DMSans-Regular.woff2` (y/o `DMSans-Regular.woff`)
	 La hoja de estilos incluye declaraciones `@font-face` que usan esas rutas.
- El ZIP se genera con método STORE (sin compresión) usando un empaquetador minimal en `js/zip.js`.
- Para añadir nuevas plantillas, editar `js/templates.js` y registrar el nombre en `templateSelect` (automático si se agrega a `TEMPLATES`).
- Mejoras posibles: guardar proyectos en `localStorage`, arrastrar/reordenar slides, exportar PNG, integración con módulo Mila.

## Cómo generar carruseles con Claude

Puedes pedir a Claude (o ChatGPT) que genere un JSON compatible y luego pegarlo en la sección `Importar contenido` de la aplicación. Usa este prompt de ejemplo para obtener un JSON con la estructura esperada:

Ejemplo de prompt para Claude:

Genera un JSON con la siguiente estructura para un carrusel de Instagram. Incluye `projectName`, `slides` (array) con objetos que contengan `template`, `eyebrow`, `title`, `subtitle`, `body`, `cta`, `handle` si aplica; y opcionalmente `caption` y `hashtags`.

Formato de ejemplo que debe devolver (devuélmelo solo como JSON, sin explicaciones):

{
	"projectName": "Los primeros días",
	"slides": [
		{"template":"cover","eyebrow":"Guía","title":"Los primeros días","subtitle":"Qué hacer en la primera semana"},
		{"template":"editorial","title":"Rutina de sueño","body":"Consejos prácticos para dormir mejor"}
	],
	"caption": "Texto largo para el pie de la publicación",
	"hashtags": "#bambuky #maternidad"
}

Pega el JSON resultante en la app y haz clic en `Aplicar contenido` o `Reemplazar todo` según prefieras.

## Flujo recomendado con Claude

La app incluye dos botones de IA asistida (panel **IA asistida (Claude)**) que solo copian prompts al portapapeles; no llaman a ninguna API ni envían datos a internet.

Pasos:

1. **Escribir tema** — escribe el tema (y opcionalmente el objetivo) del carrusel en los campos del panel `IA asistida (Claude)`.
2. **Copiar prompt** — pulsa `Copiar prompt para Claude`. Verás el mensaje "Prompt copiado".
3. **Pegar en Claude** — abre Claude y pega el prompt. Claude responderá únicamente con JSON válido (7 slides, máx. 25 palabras por slide, voz Bambuky, SEO Querétaro, CTA por DM, caption y hashtags).
4. **Copiar JSON** — copia el JSON que devolvió Claude.
5. **Importar JSON en la app** — pégalo en el panel `Importar JSON` y pulsa `Importar y reemplazar slides`.
6. **Subir fotos** — selecciona cada slide y sube su fotografía en el panel `Imagen`.
7. **Exportar carrusel** — pulsa `Exportar Carrusel (ZIP)` (o `Exportar Slide (JPG)` para una sola pieza).

Opcional — **optimizar un JSON existente**: pulsa `Copiar prompt para optimizar JSON` ("Prompt de optimización copiado"), pégalo en Claude seguido de tu JSON actual, y Claude devolverá el mismo JSON con títulos y textos optimizados para lectura móvil, sin cambiar templates ni estructura.
