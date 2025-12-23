# Imágenes de Proyectos

Esta carpeta contiene las imágenes de portada para los proyectos del showcase.

## Cómo agregar imágenes

1. **Obtén las imágenes de portada de Farcaster:**
   - Visita la página de cada miniapp en Farcaster
   - Descarga la imagen de portada/hero que aparece
   - O toma un screenshot de la miniapp

2. **Nombra los archivos según el slug del proyecto:**
   - `premios-xyz.jpg` (o .png)
   - `onchain-crossword.jpg` (o .png)
   - `chanchis.jpg` (o .png)

3. **Recomendaciones:**
   - Formato: JPG o PNG
   - Tamaño recomendado: 1200x630px (ratio 16:9)
   - Tamaño de archivo: intenta mantenerlo bajo 500KB para mejor rendimiento

4. **Coloca los archivos en esta carpeta** (`public/projects/`)

5. **Las rutas ya están configuradas en `projects.json`** como:
   - `/projects/premios-xyz.jpg`
   - `/projects/onchain-crossword.jpg`
   - `/projects/chanchis.jpg`

## Nota

Si prefieres usar URLs externas (por ejemplo, desde el manifiesto de Farcaster), puedes cambiar el campo `"image"` en `projects.json` a una URL completa en lugar de una ruta local.

