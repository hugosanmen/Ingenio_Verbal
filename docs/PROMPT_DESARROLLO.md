# Prompt de desarrollo — Ingenio verbal

Pega este prompt en Cursor (o cualquier asistente de código) con el repo abierto para continuar el desarrollo.

---

Actúa como desarrollador senior de PWAs. Trabajas sobre **Ingenio verbal**, una PWA ya funcional (HTML + JS con módulos ES + CSS, sin build) que enseña a entender y crear doble sentido en español de México, con un compañero de práctica con IA llamado **El Compa** (Groq, modelo `openai/gpt-oss-120b` vía el proxy `api/groq.js` en Vercel Edge).

## Contexto actual (no lo rompas)
- 5 niveles en `js/data/niveles.js`: 1 Aprendiz (polisemia/homófonos), 2 Ingenioso (colmos, calambures), 3 Pícaro (mexicanismos, refranes), 4 Alburero (+18), 5 Maestro (+18, duelos).
- Desbloqueo por XP (0/100/250/450/700) + examen de colocación (niveles 1–3).
- Modos por nivel: Aprende y Quiz (offline), Descifra, Crea, Explícame y Platica/Duelo (IA).
- Estado en `localStorage` (`js/store.js`): XP, racha, cuota diaria de IA (30), modo blanco, API key propia opcional.
- Reglas de contenido en el system prompt de `js/ai.js`: modo blanco, nunca explícito, nunca menores, nada discriminatorio, sin personas reales. **Cualquier función nueva de IA debe reutilizar `systemPrompt(nivel)`.**

## Siguientes tareas (en este orden)
1. **Más contenido local**: amplía cada nivel a 20 preguntas de quiz y 5 lecciones, manteniendo el formato `{frase, pregunta, opciones, correcta, explica}`. Agrega una prueba (`node --test`) que valide que `correcta` existe en `opciones` y que los niveles 1–3 no tienen contenido para adultos.
2. **Repaso espaciado**: guarda las preguntas falladas y vuelve a mostrarlas (1, 3 y 7 días) en un modo "Repaso".
3. **Cuentas y nube**: login por correo con Supabase; sincroniza progreso; la cuota de IA se cuenta en el servidor (no en el navegador) para que no se pueda saltar.
4. **Monetización** (igual que ElaMath): Gratis (quiz ilimitado + 30 consultas IA/día), Pro con IA ilimitada y duelos con marcador; activación manual y códigos de promoción.
5. **Moderación**: antes de mostrar texto generado por la IA en niveles 1–3, pásalo por un filtro (lista de palabras + segunda llamada de verificación barata con `openai/gpt-oss-20b`) y descártalo si incumple el modo blanco.
6. **Ranking semanal** y "Frase del día" compartible como imagen.
7. **Accesibilidad**: navegación con teclado, `aria-live` en resultados de la IA y contraste AA.

## Criterios de calidad
- Sigue funcionando offline lo que no es IA. Actualiza `VERSION` y `SHELL` en `sw.js` cuando agregues archivos.
- La API key nunca va en el frontend (salvo la opcional del usuario en Ajustes).
- Todo texto de la IA se escapa antes de insertarlo en el DOM (usa `esc()` / `texto()`).
- Interfaz y mensajes en español de México, tono cercano.
