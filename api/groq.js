// Proxy serverless (Vercel Edge) hacia Groq.
// La API key NUNCA va en el frontend: se configura en Vercel como GROQ_API_KEY.
// Variables de entorno:
//   GROQ_API_KEY    (obligatoria)
//   GROQ_MODEL      (opcional, por defecto openai/gpt-oss-120b)
//   ALLOWED_ORIGIN  (opcional, ej. https://ingenio-verbal.vercel.app)

export const config = { runtime: 'edge' };

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_MENSAJES = 20;
const MAX_CARACTERES = 12000;

function respuesta(status, obj, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export default async function handler(req) {
  const permitido = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get('origin') || '';
  if (req.method === 'OPTIONS') return respuesta(204, {}, permitido);
  if (req.method !== 'POST') return respuesta(405, { error: 'Método no permitido' }, permitido);
  if (permitido && origin && origin !== permitido) return respuesta(403, { error: 'Origen no permitido' }, permitido);
  if (!process.env.GROQ_API_KEY) return respuesta(500, { error: 'Falta GROQ_API_KEY en el servidor' }, permitido);

  let body;
  try { body = await req.json(); } catch { return respuesta(400, { error: 'JSON inválido' }, permitido); }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MENSAJES) : null;
  if (!messages || !messages.length) return respuesta(400, { error: 'Faltan mensajes' }, permitido);
  const limpios = messages
    .filter((m) => ['system', 'user', 'assistant'].includes(m.role) && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));
  if (JSON.stringify(limpios).length > MAX_CARACTERES) return respuesta(413, { error: 'Mensaje demasiado largo' }, permitido);

  const base = {
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    messages: limpios,
    temperature: Math.min(Math.max(Number(body.temperature) || 0.8, 0), 1.2),
    max_tokens: Math.min(Number(body.max_tokens) || 700, 1000),
    ...(body.json ? { response_format: { type: 'json_object' } } : {}),
  };

  const llamar = (extra) => fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ ...base, ...extra }),
  });

  // Ajustes de razonamiento según la familia del modelo; si el modelo no los soporta, reintenta sin ellos.
  // - gpt-oss: reasoning_effort "low" (más rápido).
  // - qwen: oculta el razonamiento para que no llegue <think>…</think> al texto.
  const esQwen = base.model.startsWith('qwen/');
  let r = await llamar(esQwen ? { reasoning_format: 'hidden' } : { reasoning_effort: 'low' });
  if (r.status === 400) r = await llamar({});

  const texto = await r.text();
  return new Response(texto, {
    status: r.status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': permitido || '*' },
  });
}
