# Ingenio verbal

PWA para aprender a **entender y crear doble sentido** en español de México, por niveles, con **El Compa**: un compañero de práctica con IA (Groq).

## Niveles

| Nivel | Nombre | Qué se practica | Público |
|---|---|---|---|
| 1 | 🌱 Aprendiz | Polisemia, homónimos y homófonos | Todos |
| 2 | 💡 Ingenioso | Colmos, "¿qué le dijo…?", calambures | Todos |
| 3 | 😏 Pícaro | Mexicanismos, refranes, picardía ligera | Todos |
| 4 | 🌶️ Alburero | Reglas del albur: caer, regresarla, calambur con nombres | +18 |
| 5 | 🎩 Maestro | Duelos: encadenar y cerrar | +18 |

Se entra con un **examen de colocación** (niveles 1–3) y se sube ganando XP (100 / 250 / 450 / 700). Los niveles 4 y 5 requieren declarar mayoría de edad y desactivar el **modo blanco**.

## Modos por nivel

- **Aprende**: teoría y ejemplos (offline)
- **Quiz**: opción múltiple con contenido local (offline), +10 XP por acierto
- **Descifra** (IA): el Compa genera una frase y califica tu interpretación
- **Crea** (IA): reto con palabra de partida; califica tu frase y propone una versión mejorada
- **Explícame** (IA): pega cualquier frase y te da lectura literal, oculta y técnica
- **Platica / Duelo** (IA): conversación libre; en niveles 4–5 es duelo de albures

## Estructura

```
index.html            app shell
css/styles.css        estilos
js/app.js             router por hash + vistas
js/ai.js              prompts de El Compa + cliente Groq
js/store.js           progreso, XP, racha y cuota de IA (localStorage)
js/data/niveles.js    contenido de los 5 niveles (lecciones + quiz)
api/groq.js           proxy serverless (Vercel Edge) que guarda la API key
sw.js                 service worker (offline-first del shell)
manifest.webmanifest  manifiesto PWA
docs/PROMPT_DESARROLLO.md  prompt para seguir desarrollando con Cursor
```

Sin build: HTML + JS (módulos ES) + CSS.

## Desplegar en Vercel

1. Importa el repo `hugosanmen/Ingenio_Verbal` en Vercel (framework: **Other**, sin build command).
2. En *Settings → Environment Variables* agrega:
   - `GROQ_API_KEY` = tu key de https://console.groq.com
   - `GROQ_MODEL` (opcional) = `openai/gpt-oss-120b` (por defecto), `openai/gpt-oss-20b` (más barato) o `qwen/qwen3.8-27b` (preview; el proxy oculta su razonamiento)
   - `ALLOWED_ORIGIN` (opcional) = `https://tu-dominio.vercel.app`
3. Deploy.

## Probar en local

```bash
npx vercel dev          # sirve la app y /api/groq con tus variables de entorno
# o, sin proxy:
npx serve .             # y en Ajustes pega tu propia API key de Groq
```

## Reglas de contenido de la IA

El system prompt (`js/ai.js`) obliga al Compa a: respetar el modo blanco, nunca ser explícito ni gráfico, nunca involucrar a menores, no hacer humor discriminatorio y no usar nombres de personas reales.
