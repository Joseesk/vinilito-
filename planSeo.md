# Plan SEO — Viniliando con joseesk

> **Estado:** borrador · 2026-10-15
> Primero se responden las preguntas de la §3. Con esas respuestas se cierra el plan de la §4 y se ejecuta por fases.

---

## 1. Objetivo

Auditar y mejorar cómo encuentran el portafolio:

- **los buscadores** (Google, Bing): qué indexan y para qué búsquedas aparece;
- **las redes y chats** (LinkedIn, WhatsApp, X, Slack): la vista previa al compartir el link;
- **las personas** que llegan: que entiendan en segundos quién eres y qué haces.

Todo sin perder la experiencia del estudio 3D.

---

## 2. Diagnóstico inicial (revisión del código)

| Área                      | Estado actual                                                                                                                                                                           | Impacto  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **HTML inicial**          | `index.html` trae solo `<div id="app">`. Todo el contenido lo crea JavaScript. Google ejecuta JS (con retraso); la mayoría de los otros buscadores y las vistas previas de redes **no** | 🔴 Alto  |
| **Proyectos indexables**  | Los títulos están en los botones de la repisa, pero la **descripción y el enlace** de cada proyecto solo existen en la ficha, que se crea **al hacer click**. Un buscador no los ve     | 🔴 Alto  |
| **Meta description**      | No existe                                                                                                                                                                               | 🔴 Alto  |
| **Open Graph / Twitter**  | No existen: al compartir el link no hay imagen ni descripción                                                                                                                           | 🔴 Alto  |
| **`<title>`**             | "Viniliando con joseesk": tiene marca, pero no dice qué haces (rol, especialidad)                                                                                                       | 🟠 Medio |
| **Contenido placeholder** | `h1` = "Nombre Apellido", email `hola@example.com`, enlaces `example.com`, proyectos de ejemplo                                                                                         | 🔴 Alto  |
| **Datos estructurados**   | No hay JSON-LD (`Person`, `WebSite`, `CreativeWork`)                                                                                                                                    | 🟠 Medio |
| **`robots.txt`**          | No existe                                                                                                                                                                               | 🟡 Bajo  |
| **`sitemap.xml`**         | No existe (con una sola página aporta poco; más si hay una página por proyecto)                                                                                                         | 🟡 Bajo  |
| **URL canónica**          | No hay `<link rel="canonical">`: depende del dominio final                                                                                                                              | 🟠 Medio |
| **Semántica**             | ✅ Un solo `h1`, `<main>`, `<nav>`, `<header>`, `<address>`, `<aside>`; `lang="es"`                                                                                                     | ✅       |
| **Accesibilidad**         | ✅ Botones reales, `aria-label`, foco gestionado, `alt` en las capturas                                                                                                                 | ✅       |
| **Rendimiento**           | ✅ Bundle inicial ≈ 34 kB gzip; Three.js (≈ 144 kB) en diferido. ⚠️ El CSS de Google Fonts bloquea el render                                                                            | 🟡 Bajo  |
| **Enlaces externos**      | ✅ `rel="noopener noreferrer"`                                                                                                                                                          | ✅       |
| **Imágenes**              | Portadas y capturas externas (Unsplash) de ejemplo; sin imagen para compartir en redes (`og:image`)                                                                                     | 🟠 Medio |

---

## 3. Preguntas para la auditoría

> Responder debajo de cada pregunta (reemplazar _pendiente_).

### 3.1 Objetivo y público

1. **¿Para qué quieres que te encuentren?** (conseguir empleo, clientes freelance, marca personal, comunidad)
   - Respuesta: **Clientes freelance** (público: negocios y emprendedores).
2. **¿Quién va a buscarte?** (reclutadores, empresas, agencias, otros devs) ¿En qué país o ciudad?
   - Respuesta: _pendiente_
3. **¿En qué idioma?** ¿Solo español o también inglés?
   - Respuesta: _pendiente_

### 3.2 Identidad y marca

4. **¿Con qué nombre quieres aparecer?** Nombre real, alias "joseesk" o ambos (afecta `h1`, `<title>` y JSON-LD).
   - Respuesta: **Solo nombre real** (el alias "joseesk" queda como marca visual, no en buscadores). Falta: el nombre exacto.
5. **¿Cuál es tu rol en una línea?** (ej.: "Desarrollador frontend especializado en experiencias 3D")
   - Respuesta: _pendiente_
6. **¿Qué perfiles públicos tienes?** (GitHub, LinkedIn, Behance, X…). Van en el cartel y en `sameAs` del JSON-LD.
   - Respuesta: _pendiente_

### 3.3 Búsquedas objetivo (palabras clave)

7. **¿Con qué búsquedas te gustaría aparecer?** (ej.: "desarrollador web Three.js", "portafolio frontend <ciudad>", tu nombre)
   - Respuesta: _pendiente_
8. **¿Hay portafolios o profesionales que tomes de referencia o que compitan por esas búsquedas?**
   - Respuesta: _pendiente_

### 3.4 Dominio y despliegue

9. **¿Ya tienes dominio?** ¿Cuál? (se necesita para canonical, Open Graph y sitemap)
   - Respuesta: **Dominio propio.** Falta: cuál.
10. **¿Dónde vas a publicar?** (Netlify, Vercel, GitHub Pages, otro). Define si se puede prerenderizar y cómo se sirven `robots.txt` y las redirecciones.
    - Respuesta: _pendiente_

### 3.5 Contenido

11. **¿Cuántos proyectos reales vas a mostrar y tienes para cada uno:** descripción de 2–3 líneas, tecnologías usadas, tu rol, enlace en vivo y repositorio?
    - Respuesta: _pendiente_
12. **¿Aceptas que los proyectos existan también como contenido HTML** (invisible o discreto, sin romper el 3D) para que los buscadores los lean sin hacer click?
    - Respuesta: **Sí: lista HTML discreta** en la página, sin tocar el 3D.
13. **¿Quieres una página propia por proyecto** (`/proyectos/mapa-sonoro`) o todo en una sola página?
    - Respuesta: **No por ahora:** todo en una sola página (se deduce de la respuesta 12).
14. **¿Quieres una sección "sobre mí"** con texto (experiencia, servicios)? Hoy solo hay nombre y rol.
    - Respuesta: _pendiente_

### 3.6 Imagen al compartir

15. **¿Qué imagen debería verse al compartir el link?** (captura del estudio 3D, tu foto, un diseño propio de 1200 × 630)
    - Respuesta: _pendiente_

### 3.7 Medición

16. **¿Tienes o quieres Google Search Console?** (indexación, búsquedas reales, errores)
    - Respuesta: _pendiente_
17. **¿Quieres analítica de visitas?** ¿Cuál? (Google Analytics, Plausible, Umami, ninguna). Algunas requieren aviso de cookies.
    - Respuesta: _pendiente_

---

## 4. Plan de auditoría (borrador, se ajusta con las respuestas)

### Fase 1: Base técnica (no depende del contenido)

- [ ] `<meta name="description">`
- [ ] `<title>` con nombre + rol
- [ ] Open Graph + Twitter Card (`og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`)
- [ ] `<link rel="canonical">`
- [ ] `robots.txt` y `sitemap.xml` en `public/`
- [ ] JSON-LD `Person` + `WebSite`
- [ ] Revisar la carga de Google Fonts (render bloqueante)

### Fase 2: Contenido indexable

- [ ] Contenido real en `data/` (perfil y proyectos)
- [ ] Proyectos legibles sin JavaScript ni clicks (según la respuesta 12/13)
- [ ] JSON-LD por proyecto (`CreativeWork`)
- [ ] Texto "sobre mí" (según la respuesta 14)

### Fase 3: Medición y verificación

- [ ] Search Console: verificar dominio, enviar sitemap
- [ ] Lighthouse (SEO, rendimiento, accesibilidad) en escritorio y móvil
- [ ] Validar vistas previas (LinkedIn Post Inspector, validador de Open Graph)
- [ ] Prueba de resultados enriquecidos de Google (JSON-LD)

---

## 5. Decisiones

| #   | Decisión                                                              | Por qué                                                                                            |
| --- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Optimizar para **clientes freelance**                                 | Las búsquedas objetivo serán de servicio + lugar, no solo de nombre                                |
| 2   | `h1`, `<title>` y JSON-LD `Person` con el **nombre real**             | Es el nombre con el que buscarán y recomendarán a un freelance                                     |
| 3   | **Dominio propio** para canonical, `og:url`, sitemap y Search Console | URL estable que no depende del hosting                                                             |
| 4   | Proyectos como **lista HTML discreta** en una sola página             | Los buscadores leen descripciones y enlaces sin JavaScript ni clicks; costo bajo y el 3D no cambia |
