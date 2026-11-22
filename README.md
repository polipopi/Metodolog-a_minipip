# Mini-IPIP ESPOL

Página web para un proyecto académico sobre habilidades expositivas y rasgos de personalidad. Incluye datos del participante, estado de ánimo previo al cuestionario, 20 ítems Mini-IPIP y resultados de cinco dimensiones.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: diseño adaptable a celular y computadora.
- `script.js`: preguntas, validación y cálculo de puntuaciones.
- `backend/Code.gs`: servicio opcional para registrar respuestas en Google Sheets.

## Publicar en GitHub Pages
1. En el repositorio entra a **Settings → Pages**.
2. En **Build and deployment**, selecciona **Deploy from a branch**.
3. Elige la rama `main` y la carpeta `/ (root)`, luego guarda.
4. Espera a que GitHub Pages publique el sitio.

## Conectar Google Sheets
1. Crea una hoja de cálculo de Google para almacenar las respuestas.
2. Entra a [Google Apps Script](https://script.google.com/) y crea un proyecto.
3. Copia el contenido de `backend/Code.gs` en el editor.
4. En **Configuración del proyecto → Propiedades del script**, agrega `SPREADSHEET_ID` con el ID de tu hoja de cálculo.
5. Selecciona **Implementar → Nueva implementación → Aplicación web**. Ejecutar como tu cuenta y configura el acceso de acuerdo con la aprobación de tu institución y el protocolo de investigación.
6. Copia la URL de la aplicación web y pégala en la constante `GOOGLE_SCRIPT_URL` al inicio de `script.js`.
7. Vuelve a subir el cambio a GitHub.

La página estática usa una solicitud `no-cors`; por eso no puede leer la respuesta del servidor. Después de una prueba, verifica manualmente que se haya agregado una fila a la hoja.

## Puntuación
Los ítems inversos se transforman con `6 - respuesta`. Cada dimensión se calcula con el promedio de sus cuatro ítems y se convierte a una escala de 0 a 100 mediante `(promedio - 1) / 4 × 100`.

- Extraversión: 1, 6 (inverso), 11, 16 (inverso).
- Amabilidad: 2, 7 (inverso), 12, 17 (inverso).
- Responsabilidad: 3, 8 (inverso), 13, 18 (inverso).
- Neuroticismo: 4, 9 (inverso), 14, 19 (inverso).
- Intelecto / Imaginación: 5, 10 (inverso), 15 (inverso), 20 (inverso).

**Importante:** verifica la clave de corrección y la versión de traducción con el instrumento y el tutor antes de usarlo para recoger datos. Las puntuaciones son orientativas, no diagnósticas. La hoja contiene datos personales; limita su acceso al equipo autorizado y sigue el consentimiento y las normas de protección de datos de ESPOL. No guardes credenciales en este repositorio.
