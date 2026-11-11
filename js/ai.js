// Cliente de IA (Groq) y prompts de "El Compa", el compañero de práctica.
// Por defecto llama al proxy /api/groq (la API key vive en el servidor).
// Si el usuario configuró su propia key, llama directo a Groq desde el navegador.
import { store } from './store.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELO_DIRECTO = 'openai/gpt-oss-120b'; // modelo de producción en Groq (nov 2026)

export class ErrorIA extends Error {}

function systemPrompt(nivel) {
  const blanco = store.get().modoBlanco || !nivel.adulto;
  return `Eres "El Compa", el compañero de práctica de la app "Ingenio verbal", que enseña a entender y crear doble sentido en español de México.
Personalidad: cuate chilango ingenioso, cálido y rápido; hablas informal (tú), con chispa, sin ser grosero. Respuestas breves.

Nivel del usuario: ${nivel.id} – ${nivel.nombre} (${nivel.tema}).
Qué se practica en este nivel: ${nivel.descripcion}
Guía de contenido: ${nivel.guiaIA}

Reglas obligatorias:
- ${blanco
    ? 'MODO BLANCO: nada de contenido sexual ni insinuaciones sexuales. Solo humor blanco y picardía inocente.'
    : 'Contenido para adultos que aceptaron jugar: se permite la insinuación pícara propia del albur, pero NUNCA lenguaje sexual explícito o gráfico; la frase siempre debe poder leerse de forma inocente.'}
- Nunca involucres a menores de edad en ningún doble sentido.
- Nada de humor que denigre por raza, origen, religión, orientación sexual, identidad de género, discapacidad o aspecto físico.
- No uses nombres de personas reales para albures ni burlas.
- Si el usuario pide algo fuera de estas reglas, reconduce con humor a una versión válida.
- Cuando expliques, distingue siempre "lectura literal" y "lectura oculta" y nombra la técnica (polisemia, homofonía, calambur, mexicanismo, albur…).`;
}

async function llamar(messages, { json = false, temperature = 0.8, max_tokens = 700 } = {}) {
  const s = store.get();
  if (store.iaDisponibles() <= 0) {
    throw new ErrorIA('Ya usaste tus consultas de IA de hoy. Mañana se renuevan (o agrega tu propia API key en Ajustes).');
  }
  if (!navigator.onLine) throw new ErrorIA('Sin conexión: la IA necesita internet. Mientras, practica con el Quiz, que funciona offline.');

  const cuerpo = { messages, temperature, max_tokens, json };
  let res;
  try {
    if (s.apiKeyPropia) {
      const directo = (extra) => fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.apiKeyPropia}` },
        body: JSON.stringify({
          model: MODELO_DIRECTO,
          messages, temperature, max_tokens,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
          ...extra,
        }),
      });
      res = await directo({ reasoning_effort: 'low' });
      if (res.status === 400) res = await directo({});
    } else {
      res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });
    }
  } catch {
    throw new ErrorIA('No pude contactar a la IA. Revisa tu conexión.');
  }
  if (res.status === 429) throw new ErrorIA('La IA está saturada, espera unos segundos e inténtalo de nuevo.');
  if (!res.ok) {
    const det = await res.text().catch(() => '');
    console.error('Error IA', res.status, det);
    throw new ErrorIA(res.status === 401 ? 'API key inválida. Revísala en Ajustes.' : 'La IA no respondió bien. Intenta otra vez.');
  }
  const data = await res.json();
  const texto = data?.choices?.[0]?.message?.content?.trim() || '';
  store.consumirIA();
  if (!json) return texto;
  return parsearJSON(texto);
}

function parsearJSON(texto) {
  try { return JSON.parse(texto); } catch { /* sigue */ }
  const m = texto.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch { /* sigue */ } }
  throw new ErrorIA('La IA respondió en un formato raro. Intenta otra vez.');
}

// ---------- Tareas ----------

/** Genera una frase de doble sentido para que el usuario la descifre. */
export function generarFrase(nivel) {
  return llamar([
    { role: 'system', content: systemPrompt(nivel) },
    { role: 'user', content: `Inventa UNA frase original de doble sentido acorde a mi nivel para que yo la descifre. Varía el tema (comida, oficios, escuela, transporte, fiestas…).
Responde SOLO JSON: {"frase": "...", "pista": "pista corta sin revelar", "literal": "lectura literal", "oculta": "lectura oculta", "tecnica": "nombre de la técnica"}` },
  ], { json: true, temperature: 1 });
}

/** Evalúa la interpretación del usuario. */
export function evaluarInterpretacion(nivel, item, respuesta) {
  return llamar([
    { role: 'system', content: systemPrompt(nivel) },
    { role: 'user', content: `Frase: "${item.frase}"
Lectura literal esperada: ${item.literal}
Lectura oculta esperada: ${item.oculta}
Mi interpretación: "${respuesta}"

Evalúa si capté el doble sentido. Sé justo: acepta interpretaciones equivalentes.
Responde SOLO JSON: {"puntaje": 0-10, "capto": true/false, "retro": "comentario breve en tono de El Compa", "explicacion": "explicación clara de las dos lecturas"}` },
  ], { json: true, temperature: 0.3 });
}

/** Explica cualquier frase que el usuario pegue. */
export function explicarFrase(nivel, frase) {
  return llamar([
    { role: 'system', content: systemPrompt(nivel) },
    { role: 'user', content: `Explícame esta frase: "${frase}"
Formato (texto plano, breve):
Lectura literal: …
Lectura oculta: … (si no tiene doble sentido, dilo honestamente)
Técnica: …
Cómo usarla bien: un consejo corto.` },
  ], { temperature: 0.4 });
}

/** Propone un reto de creación. */
export function generarReto(nivel) {
  return llamar([
    { role: 'system', content: systemPrompt(nivel) },
    { role: 'user', content: `Dame un reto para que YO cree una frase de doble sentido de mi nivel: una palabra o situación de partida y una consigna clara.
Responde SOLO JSON: {"palabra": "...", "consigna": "...", "ejemplo_tecnica": "técnica sugerida"}` },
  ], { json: true, temperature: 1 });
}

/** Califica una frase creada por el usuario. */
export function evaluarCreacion(nivel, reto, frase) {
  return llamar([
    { role: 'system', content: systemPrompt(nivel) },
    { role: 'user', content: `Reto: palabra "${reto.palabra}" – ${reto.consigna}
Mi frase: "${frase}"

Califícala. Criterios: tiene doble sentido real, sutileza (se puede leer inocente), ingenio, apego a mi nivel y a las reglas.
Si rompe las reglas de contenido, puntaje 0 y explica por qué con buena onda.
Responde SOLO JSON: {"puntaje": 0-10, "retro": "comentario breve", "mejora": "versión mejorada de mi frase"}` },
  ], { json: true, temperature: 0.5 });
}

/** Turno de conversación con el compañero (modo duelo / práctica libre). */
export function conversar(nivel, historial) {
  const extra = nivel.id >= 4
    ? 'Estamos en DUELO: lanza frases de doble sentido, responde a las mías regresándola y, si caigo (respondo literal), dímelo con gracia. Al final de cada turno añade en una línea aparte: "🔎 " + explicación muy breve del doble sentido de tu frase.'
    : 'Practica conmigo en conversación: suelta frases con doble sentido de mi nivel, reta mi comprensión y, cuando yo escriba una, dime si funciona. Al final de cada turno añade en una línea aparte: "🔎 " + explicación muy breve del doble sentido que usaste.';
  return llamar([
    { role: 'system', content: systemPrompt(nivel) + '\n\n' + extra },
    ...historial.slice(-12),
  ], { temperature: 0.9, max_tokens: 400 });
}
