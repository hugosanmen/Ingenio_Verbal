// Ingenio verbal — app principal (router por hash + vistas).
import { NIVELES, COLOCACION, nivelPorId } from './data/niveles.js';
import { store } from './store.js';
import * as ia from './ai.js';
import { DONACIONES } from './config.js';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');

// ---------- utilidades ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Markdown mínimo y seguro: **negritas**, *itálicas*, listas "- " y saltos de línea.
function texto(s = '') {
  const enLinea = (l) => l
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*(\S(?:.*?\S)?)\*(?=[\s.,;:!?)]|$)/g, '$1<em>$2</em>');
  const salida = [];
  let lista = [];
  const cerrar = () => { if (lista.length) { salida.push(`<ul>${lista.join('')}</ul>`); lista = []; } };
  for (const linea of esc(s).split('\n')) {
    const m = linea.match(/^\s*(?:[-•]|\d+[.)])\s+(.*)$/);
    if (m) { lista.push(`<li>${enLinea(m[1])}</li>`); continue; }
    cerrar();
    if (linea.trim()) salida.push(`<p>${enLinea(linea)}</p>`);
  }
  cerrar();
  return salida.join('');
}
const ir = (ruta) => { location.hash = ruta; };
const barajar = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function cargando(el, msg = 'El Compa está pensando…', enHoja = false) {
  el.innerHTML = `<div class="cargando ${enHoja ? 'en-hoja' : ''}" role="status"><span class="punto"></span><span class="punto"></span><span class="punto"></span> ${esc(msg)}</div>`;
}

function errorIA(el, e) {
  el.innerHTML = `<div class="aviso error">${esc(e instanceof ia.ErrorIA ? e.message : 'Algo salió mal. Intenta de nuevo.')}</div>`;
  if (!(e instanceof ia.ErrorIA)) console.error(e);
}

function encabezado(titulo, nivel, atras = '#/inicio') {
  return `<header class="encabezado">
    <a class="atras" href="${atras}" aria-label="Regresar">←</a>
    <div><h1>${esc(titulo)}</h1>${nivel ? `<p>Nivel ${nivel.id}: ${esc(nivel.carta)}</p>` : ''}</div>
  </header>`;
}

function nivelValido(id) {
  const n = nivelPorId(Number(id));
  if (!store.nivelDesbloqueado(n)) { toast('Ese nivel aún está bloqueado'); ir('#/inicio'); return null; }
  return n;
}

// ---------- vistas ----------
let yaRepartio = false; // la animación de reparto de cartas solo ocurre una vez por sesión

const resultado = (el, html) => { el.innerHTML = html; el.setAttribute('aria-live', 'polite'); };

const vistas = {
  bienvenida() {
    $app.innerHTML = `
      <section class="portada">
        <h1>Ingenio verbal</h1>
        <p class="lema">Aprende a escuchar las dos lecturas de una frase, practícalo por niveles y gánale al Compa.</p>
      </section>
      <section class="hoja">
        <h2>Antes de empezar</h2>
        <p>Los niveles 4 y 5 enseñan el albur mexicano, que juega con insinuaciones para adultos. ¿Tienes 18 años o más?</p>
        <div class="fila">
          <button class="btn" data-edad="si">Sí, tengo 18 o más</button>
          <button class="btn sec" data-edad="no">No, o prefiero el modo blanco</button>
        </div>
      </section>`;
    $app.querySelectorAll('[data-edad]').forEach((b) => b.onclick = () => {
      const mayor = b.dataset.edad === 'si';
      store.set({ mayorDeEdad: mayor, modoBlanco: !mayor });
      ir('#/colocacion');
    });
  },

  colocacion() {
    const preguntas = COLOCACION;
    let i = 0;
    const aciertos = { 1: 0, 2: 0, 3: 0 };
    const pintar = () => {
      if (i >= preguntas.length) {
        let nivel = 1;
        if (aciertos[1] === 2) nivel = 2;
        if (aciertos[1] === 2 && aciertos[2] === 2) nivel = 3;
        store.set({ onboarding: true, nivelInicial: nivel });
        const n = nivelPorId(nivel);
        $app.innerHTML = `${encabezado('Tu primera carta', null, '#/bienvenida')}
          <section class="hoja centro">
            <div class="grande" aria-hidden="true">${n.emoji}</div>
            <h2>Empiezas como ${esc(n.carta)}</h2>
            <p>Nivel ${n.id}: ${esc(n.tema)}. Destapa las siguientes cartas ganando XP en los quizzes y con el Compa.</p>
            <button class="btn" id="vamos">Ver mis cartas</button>
          </section>`;
        document.getElementById('vamos').onclick = () => ir('#/inicio');
        return;
      }
      const p = preguntas[i];
      $app.innerHTML = `${encabezado('Examen de colocación', null, '#/bienvenida')}
        <p class="contador">Pregunta ${i + 1} de ${preguntas.length}</p>
        ${tarjetaPregunta(p)}
        <button class="btn texto" id="saltar">Saltar y empezar en el nivel 1</button>`;
      $app.querySelectorAll('.opcion').forEach((b) => b.onclick = () => {
        if (Number(b.dataset.i) === p.correcta) aciertos[p.nivel]++;
        i++; pintar();
      });
      document.getElementById('saltar').onclick = () => { store.set({ onboarding: true, nivelInicial: 1 }); ir('#/inicio'); };
    };
    pintar();
  },

  inicio() {
    const s = store.get();
    const max = store.nivelMaximo();
    const siguiente = NIVELES.find((n) => n.xpMin > s.xp && !(n.adulto && s.modoBlanco));
    const ia = store.iaDisponibles();
    $app.innerHTML = `
      <section class="portada">
        <h1>Ingenio verbal</h1>
        <div class="marcador">
          <span><b>${s.xp}</b>XP</span>
          <span><b>${s.racha}</b>${s.racha === 1 ? 'día seguido' : 'días seguidos'}</span>
          <span><b>${ia === Infinity ? '∞' : ia}</b>consultas al Compa hoy</span>
        </div>
        ${siguiente ? `<div class="avance"><div class="barra"><div style="width:${Math.min(100, (s.xp / siguiente.xpMin) * 100)}%"></div></div>
          Te faltan ${siguiente.xpMin - s.xp} XP para destapar a ${esc(siguiente.carta)}</div>` : ''}
      </section>
      <section class="baraja ${yaRepartio ? '' : 'reparte'}" aria-label="Niveles">
        ${NIVELES.map((n) => {
          if (!store.nivelDesbloqueado(n)) {
            const razon = n.adulto && s.modoBlanco ? 'Desactivada en modo blanco' : `Se destapa con ${n.xpMin} XP`;
            return `<div class="carta volteada" aria-label="Nivel ${n.id} bloqueado. ${razon}">
              <div class="reverso"><b>${n.id}</b><span>${razon}</span></div></div>`;
          }
          return `<a class="carta ${n.id === max ? 'actual' : ''}" href="#/nivel/${n.id}" style="--fondo-carta:${n.fondo}">
            ${n.adulto ? '<span class="adulto">+18</span>' : ''}
            <span class="num">${n.id}</span>
            <span class="dibujo" aria-hidden="true">${n.emoji}</span>
            <span class="nombre">${esc(n.carta)}</span>
            <span class="tema">${esc(n.tema)}</span>
          </a>`;
        }).join('')}
      </section>
      ${DONACIONES.url ? `<a class="apoyo" href="#/apoyar">
        <span class="icono" aria-hidden="true">☕</span>
        <span><strong>Ingenio verbal es gratis.</strong> Si te sirve, ayúdanos a pagar la IA y a mejorar la app.</span>
      </a>` : ''}`;
    yaRepartio = true;
  },

  nivel(id) {
    const n = nivelValido(id); if (!n) return;
    const modos = [
      ['lecciones', '📖', 'Aprende', 'Teoría corta con ejemplos', false],
      ['quiz', '✅', 'Quiz', 'Opción múltiple, funciona sin internet', false],
      ['descifra', '🔍', 'Descifra', 'El Compa te lanza una frase y tú explicas sus dos lecturas', true],
      ['crea', '✍️', 'Crea', 'Escribe tu propia frase y recibe calificación', true],
      ['explica', '🧠', 'Explícame', 'Pega una frase que no entiendas', true],
      ['compa', n.id >= 4 ? '⚔️' : '💬', n.id >= 4 ? 'Duelo' : 'Platica con el Compa', n.id >= 4 ? 'Albures contra la IA, a ver quién cae' : 'Práctica libre en conversación', true],
    ];
    $app.innerHTML = `${encabezado(n.carta, null)}
      <section class="hoja">
        <h2>${esc(n.tema)}</h2>
        <p>${esc(n.descripcion)}</p>
      </section>
      <nav class="hoja modos" style="padding:0" aria-label="Modos de práctica">
        ${modos.map(([r, e, t, d, conIA]) => `<a class="modo" href="#/${r}/${n.id}">
          <span class="icono" aria-hidden="true">${e}</span>
          <div><h3>${t}${conIA ? '<span class="ia" title="Usa inteligencia artificial">IA</span>' : ''}</h3><p>${d}</p></div>
        </a>`).join('')}
      </nav>`;
  },

  lecciones(id) {
    const n = nivelValido(id); if (!n) return;
    $app.innerHTML = `${encabezado('Aprende', n, `#/nivel/${n.id}`)}
      <section class="hoja">
        ${n.lecciones.map((l) => `<article class="leccion">
          <h2>${esc(l.titulo)}</h2><p>${esc(l.texto)}</p>
          <ul>${l.ejemplos.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
        </article>`).join('')}
      </section>
      <a class="btn ancho" href="#/quiz/${n.id}">Practicar con el quiz</a>`;
  },

  quiz(id) {
    const n = nivelValido(id); if (!n) return;
    const preguntas = barajar(n.quiz);
    let i = 0, aciertos = 0;
    const pintar = () => {
      if (i >= preguntas.length) {
        const xp = aciertos * 10;
        store.sumarXP(xp, `Quiz nivel ${n.id}`);
        const perfecto = aciertos === preguntas.length;
        $app.innerHTML = `${encabezado('Resultado', n, `#/nivel/${n.id}`)}
          <section class="hoja centro">
            <div class="grande" aria-hidden="true">${perfecto ? '🏆' : aciertos >= preguntas.length / 2 ? '👏' : '💪'}</div>
            <h2>${aciertos} de ${preguntas.length} correctas</h2>
            <p>Ganaste ${xp} XP.${perfecto ? ' ¡Lotería!' : ''}</p>
            <div class="fila"><button class="btn" id="otra">Jugar otra ronda</button><a class="btn sec" href="#/descifra/${n.id}">Descifrar con el Compa</a></div>
          </section>`;
        document.getElementById('otra').onclick = () => vistas.quiz(id);
        return;
      }
      const p = preguntas[i];
      $app.innerHTML = `${encabezado('Quiz', n, `#/nivel/${n.id}`)}
        <p class="contador">Pregunta ${i + 1} de ${preguntas.length}</p>
        ${tarjetaPregunta(p)}<div id="fb" aria-live="polite"></div>`;
      $app.querySelectorAll('.opcion').forEach((b) => b.onclick = () => {
        const ok = Number(b.dataset.i) === p.correcta;
        if (ok) aciertos++;
        $app.querySelectorAll('.opcion').forEach((o) => {
          o.disabled = true;
          if (Number(o.dataset.i) === p.correcta) o.classList.add('ok');
        });
        if (!ok) b.classList.add('mal');
        document.getElementById('fb').innerHTML = `<div class="aviso ${ok ? 'exito' : 'error'}"><strong>${ok ? 'Correcto.' : 'No era esa.'}</strong> ${esc(p.explica)}</div>
          <button class="btn ancho" id="sig">${i + 1 < preguntas.length ? 'Siguiente pregunta' : 'Ver resultado'}</button>`;
        document.getElementById('sig').focus();
        document.getElementById('sig').onclick = () => { i++; pintar(); };
      });
    };
    pintar();
  },

  descifra(id) {
    const n = nivelValido(id); if (!n) return;
    $app.innerHTML = `${encabezado('Descifra', n, `#/nivel/${n.id}`)}<div id="zona"></div>`;
    const zona = document.getElementById('zona');
    const nueva = async () => {
      cargando(zona, 'El Compa está armando una frase…');
      try {
        const item = await ia.generarFrase(n);
        zona.innerHTML = `<section class="hoja">
            <p class="frase">“${esc(item.frase)}”</p>
            <details><summary>Ver pista</summary><p>${esc(item.pista)}</p></details>
            <label for="resp">¿Cuáles son las dos lecturas?</label>
            <textarea id="resp" rows="3" placeholder="Lo que dice literal… y lo que insinúa…"></textarea>
            <button class="btn" id="enviar">Revisar mi respuesta</button>
          </section><div id="fb"></div>`;
        document.getElementById('enviar').onclick = async () => {
          const r = document.getElementById('resp').value.trim();
          if (!r) return toast('Escribe tu interpretación primero');
          const fb = document.getElementById('fb');
          cargando(fb, 'El Compa está revisando…');
          try {
            const ev = await ia.evaluarInterpretacion(n, item, r);
            const pts = Math.max(0, Math.min(10, Number(ev.puntaje) || 0));
            store.sumarXP(pts * 2, `Descifra nivel ${n.id}`);
            resultado(fb, `<section class="hoja">
              <div class="veredicto ${pts >= 7 ? 'alto' : pts <= 4 ? 'bajo' : ''}"><span class="puntos">${pts}/10</span><span>${ev.capto ? 'Lo captaste' : 'Se te fue'}</span></div>
              ${texto(ev.retro)}${texto(ev.explicacion)}
              <p class="nota">${item.tecnica ? `Técnica: ${esc(item.tecnica)}. ` : ''}Ganaste ${pts * 2} XP.</p>
              <button class="btn" id="otra">Otra frase</button></section>`);
            document.getElementById('otra').onclick = nueva;
          } catch (e) { errorIA(fb, e); }
        };
      } catch (e) { errorIA(zona, e); }
    };
    nueva();
  },

  crea(id) {
    const n = nivelValido(id); if (!n) return;
    $app.innerHTML = `${encabezado('Crea', n, `#/nivel/${n.id}`)}<div id="zona"></div>`;
    const zona = document.getElementById('zona');
    const nuevo = async () => {
      cargando(zona, 'El Compa está preparando tu reto…');
      try {
        const reto = await ia.generarReto(n);
        zona.innerHTML = `<section class="hoja">
            <p class="nota">Tu palabra de partida</p>
            <p class="frase">${esc(reto.palabra)}</p>
            <p>${esc(reto.consigna)}</p>
            ${reto.ejemplo_tecnica ? `<p class="nota">Técnica sugerida: ${esc(reto.ejemplo_tecnica)}</p>` : ''}
            <label for="frase">Tu frase</label>
            <textarea id="frase" rows="3"></textarea>
            <button class="btn" id="enviar">Calificar mi frase</button>
          </section><div id="fb"></div>`;
        document.getElementById('enviar').onclick = async () => {
          const f = document.getElementById('frase').value.trim();
          if (!f) return toast('Escribe tu frase primero');
          const fb = document.getElementById('fb');
          cargando(fb, 'El Compa está calificando tu ingenio…');
          try {
            const ev = await ia.evaluarCreacion(n, reto, f);
            const pts = Math.max(0, Math.min(10, Number(ev.puntaje) || 0));
            store.sumarXP(pts * 3, `Crea nivel ${n.id}`);
            resultado(fb, `<section class="hoja">
              <div class="veredicto ${pts >= 7 ? 'alto' : pts <= 4 ? 'bajo' : ''}"><span class="puntos">${pts}/10</span></div>
              ${texto(ev.retro)}
              <p class="nota">Así podría quedar mejor:</p><p class="frase chica">${esc(ev.mejora)}</p>
              <p class="nota">Ganaste ${pts * 3} XP.</p>
              <button class="btn" id="otro">Otro reto</button></section>`);
            document.getElementById('otro').onclick = nuevo;
          } catch (e) { errorIA(fb, e); }
        };
      } catch (e) { errorIA(zona, e); }
    };
    nuevo();
  },

  explica(id) {
    const n = nivelValido(id); if (!n) return;
    $app.innerHTML = `${encabezado('Explícame', n, `#/nivel/${n.id}`)}
      <section class="hoja">
        <label for="frase">Pega o escribe una frase, chiste o albur que no entiendas</label>
        <textarea id="frase" rows="3" maxlength="400"></textarea>
        <button class="btn" id="enviar">Explicar la frase</button>
      </section><div id="fb"></div>`;
    document.getElementById('enviar').onclick = async () => {
      const f = document.getElementById('frase').value.trim();
      if (!f) return toast('Escribe una frase primero');
      const fb = document.getElementById('fb');
      cargando(fb);
      try {
        const r = await ia.explicarFrase(n, f);
        store.sumarXP(2, `Explícame nivel ${n.id}`);
        resultado(fb, `<section class="hoja">${texto(r)}</section>`);
      } catch (e) { errorIA(fb, e); }
    };
  },

  compa(id) {
    const n = nivelValido(id); if (!n) return;
    const historial = [];
    $app.innerHTML = `${encabezado(n.id >= 4 ? 'Duelo' : 'Platica con el Compa', n, `#/nivel/${n.id}`)}
      <section class="chat" id="chat" aria-live="polite"></section>
      <form class="entrada" id="form">
        <label for="msg" class="sr">Tu mensaje</label>
        <input id="msg" autocomplete="off" maxlength="300" placeholder="${n.id >= 4 ? 'Regrésala…' : 'Escribe tu respuesta…'}">
        <button class="btn" type="submit" aria-label="Enviar">Enviar</button>
      </form>`;
    const chat = document.getElementById('chat');
    const burbuja = (rol, t) => {
      const d = document.createElement('div');
      d.className = `burbuja ${rol}`;
      const [cuerpo, ...lupa] = t.split('🔎');
      d.innerHTML = texto(cuerpo) + (lupa.length ? `<span class="lupa">🔎 ${esc(lupa.join(' ').trim())}</span>` : '');
      chat.appendChild(d);
      chat.scrollTop = chat.scrollHeight;
      return d;
    };
    const turno = async () => {
      const espera = burbuja('assistant', '…');
      try {
        const r = await ia.conversar(n, historial);
        historial.push({ role: 'assistant', content: r });
        espera.remove(); burbuja('assistant', r);
        if (historial.filter((m) => m.role === 'user').length > 1) store.sumarXP(3, `${n.id >= 4 ? 'Duelo' : 'Plática'} nivel ${n.id}`);
      } catch (e) {
        espera.remove();
        const d = document.createElement('div'); errorIA(d, e); chat.appendChild(d);
      }
    };
    document.getElementById('form').onsubmit = (ev) => {
      ev.preventDefault();
      const inp = document.getElementById('msg');
      const t = inp.value.trim(); if (!t) return;
      inp.value = '';
      historial.push({ role: 'user', content: t });
      burbuja('user', t);
      turno();
    };
    historial.push({ role: 'user', content: n.id >= 4 ? '¡Órale, empieza tú el duelo!' : '¡Quiubo! Empieza tú con una frase de mi nivel.' });
    turno();
  },

  progreso() {
    const s = store.get();
    $app.innerHTML = `${encabezado('Tu progreso')}
      <section class="hoja">
        <div class="marcador" style="color:var(--tinta);margin:0">
          <span><b>${s.xp}</b>XP</span><span><b>${s.racha}</b>${s.racha === 1 ? 'día seguido' : 'días seguidos'}</span><span><b>${store.nivelMaximo()}</b>de 5 cartas destapadas</span>
        </div>
      </section>
      <section class="hoja"><h2>Actividad reciente</h2>
        ${s.historial.length
          ? `<ul class="lista">${s.historial.map((h) => `<li><span>${esc(h.actividad)}<br><span class="nota">${esc(h.fecha)}</span></span><span class="pts">+${h.puntos} XP</span></li>`).join('')}</ul>`
          : '<p>Todavía no hay actividad. Empieza con el quiz de tu primera carta.</p><a class="btn" href="#/inicio">Ir a mis cartas</a>'}
      </section>`;
  },

  ajustes() {
    const s = store.get();
    $app.innerHTML = `${encabezado('Ajustes')}
      <section class="hoja">
        <h2>Contenido</h2>
        <label class="interruptor"><input type="checkbox" id="blanco" ${s.modoBlanco ? 'checked' : ''} ${s.mayorDeEdad ? '' : 'disabled'}> Modo blanco, sin contenido para adultos</label>
        ${s.mayorDeEdad ? '' : '<p class="nota">Como indicaste ser menor de 18 o preferir el modo blanco, los niveles 4 y 5 quedan desactivados.</p>'}
      </section>
      <section class="hoja">
        <h2>Tu propia API key de Groq</h2>
        <p class="nota">Opcional. Con ella el Compa usa tu cuenta de Groq y no tiene límite diario. Se guarda solo en este dispositivo.</p>
        <label for="key">API key</label>
        <input id="key" type="password" placeholder="gsk_…" value="${esc(s.apiKeyPropia)}">
        <button class="btn" id="guardar">Guardar API key</button>
      </section>
      ${DONACIONES.url ? `<section class="hoja">
        <h2>Apoya el proyecto</h2>
        <p class="nota">Tu donación paga la IA del Compa y nuevas mejoras.</p>
        <a class="btn" href="#/apoyar">Ver cómo apoyar</a>
      </section>` : ''}
      <section class="hoja">
        <h2>Empezar de cero</h2>
        <p class="nota">Borra tu XP, racha e historial y regresa a la bienvenida.</p>
        <button class="btn peligro" id="reset">Borrar mi progreso</button>
      </section>
      <p class="centro" style="color:#FFE3F1">Ingenio verbal v0.2, con IA de Groq</p>`;
    document.getElementById('blanco').onchange = (e) => { store.set({ modoBlanco: e.target.checked }); toast(e.target.checked ? 'Modo blanco activado' : 'Modo blanco desactivado'); };
    document.getElementById('guardar').onclick = () => { store.set({ apiKeyPropia: document.getElementById('key').value.trim() }); toast('API key guardada'); };
    const reset = document.getElementById('reset');
    reset.onclick = () => {
      if (reset.dataset.confirm) { store.reiniciar(); yaRepartio = false; ir('#/bienvenida'); return; }
      reset.dataset.confirm = '1';
      reset.textContent = 'Toca otra vez para borrar';
    };
  },
  apoyar() {
    const d = DONACIONES;
    $app.innerHTML = `${encabezado('Apoya Ingenio verbal')}
      <section class="hoja">
        <h2>Por qué pedimos apoyo</h2>
        <p>Cada vez que platicas con el Compa, descifras o creas una frase, la app consulta un modelo de IA que cuesta dinero. Las donaciones mantienen la app gratis para todos y la hacen mejor.</p>
      </section>
      <section class="hoja">
        <h2>En qué se usa tu donación</h2>
        <ul class="destinos">${d.destino.map(([e, t, x]) => `<li><span class="icono" aria-hidden="true">${e}</span><div><strong>${esc(t)}</strong><p>${esc(x)}</p></div></li>`).join('')}</ul>
      </section>
      <section class="hoja centro">
        ${d.url
          ? `<p>Cualquier cantidad ayuda. No necesitas cuenta en Ingenio verbal.</p>
             <a class="btn ancho" href="${esc(d.url)}" target="_blank" rel="noopener noreferrer">Donar${d.plataforma ? ` con ${esc(d.plataforma)}` : ''}</a>
             <p class="nota" style="margin-top:12px">El pago se hace en ${d.plataforma ? esc(d.plataforma) : 'la página de la plataforma'}; Ingenio verbal no ve ni guarda tus datos de pago.</p>`
          : '<p>Las donaciones estarán disponibles muy pronto.</p>'}
      </section>`;
  },
};

function tarjetaPregunta(p) {
  return `<section class="hoja">
    <p class="frase">“${esc(p.frase)}”</p>
    <p class="pregunta">${esc(p.pregunta)}</p>
    <div class="opciones">${p.opciones.map((o, i) => `<button class="opcion" data-i="${i}">${esc(o)}</button>`).join('')}</div>
  </section>`;
}

// ---------- router ----------
function router() {
  const [, ruta = 'inicio', param] = location.hash.split('/');
  const s = store.get();
  if (!s.onboarding && !['bienvenida', 'colocacion'].includes(ruta)) return ir('#/bienvenida');
  const vista = vistas[ruta] || vistas.inicio;
  window.scrollTo(0, 0);
  vista(param);
  $nav.querySelectorAll('a').forEach((a) => a.classList.toggle('activo', a.getAttribute('href') === `#/${ruta}`));
  $nav.hidden = !s.onboarding && ['bienvenida', 'colocacion'].includes(ruta);
}

window.addEventListener('hashchange', router);
router();

if ('serviceWorker' in navigator) {
  // Si ya había una versión instalada y llega una nueva, recarga una vez para usarla.
  const habiaVersion = !!navigator.serviceWorker.controller;
  let recargado = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (habiaVersion && !recargado) { recargado = true; location.reload(); }
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
