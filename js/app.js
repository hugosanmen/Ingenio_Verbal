// Ingenio verbal — app principal (router por hash + vistas).
import { NIVELES, COLOCACION, nivelPorId } from './data/niveles.js';
import { store } from './store.js';
import * as ia from './ai.js';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');

// ---------- utilidades ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const texto = (s = '') => esc(s).replace(/\n/g, '<br>');
const ir = (ruta) => { location.hash = ruta; };
const barajar = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function cargando(el, msg = 'El Compa está pensando…') {
  el.innerHTML = `<div class="cargando"><span class="punto"></span><span class="punto"></span><span class="punto"></span> ${esc(msg)}</div>`;
}

function errorIA(el, e) {
  el.innerHTML = `<div class="aviso error">${esc(e instanceof ia.ErrorIA ? e.message : 'Algo salió mal. Intenta de nuevo.')}</div>`;
  if (!(e instanceof ia.ErrorIA)) console.error(e);
}

function encabezado(titulo, nivel, atras = '#/inicio') {
  return `<header class="encabezado">
    <a class="atras" href="${atras}" aria-label="Regresar">←</a>
    <div><h1>${esc(titulo)}</h1>${nivel ? `<p class="sub">${nivel.emoji} Nivel ${nivel.id} · ${esc(nivel.nombre)}</p>` : ''}</div>
  </header>`;
}

function nivelValido(id) {
  const n = nivelPorId(Number(id));
  if (!store.nivelDesbloqueado(n)) { toast('Ese nivel aún está bloqueado'); ir('#/inicio'); return null; }
  return n;
}

// ---------- vistas ----------
const vistas = {
  bienvenida() {
    $app.innerHTML = `
      <section class="hero">
        <div class="logo">IV</div>
        <h1>Ingenio verbal</h1>
        <p class="lema">Entiende el doble sentido. Practícalo. Gánale al Compa.</p>
      </section>
      <section class="tarjeta">
        <h2>Antes de empezar</h2>
        <p>Los niveles 4 y 5 enseñan el albur mexicano, que usa insinuación para adultos. ¿Tienes 18 años o más?</p>
        <div class="fila">
          <button class="btn" data-edad="si">Sí, soy mayor de 18</button>
          <button class="btn sec" data-edad="no">No / prefiero modo blanco</button>
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
        $app.innerHTML = `${encabezado('¡Listo!')}
          <section class="tarjeta centro">
            <div class="grande">${nivelPorId(nivel).emoji}</div>
            <h2>Empiezas en el nivel ${nivel}: ${esc(nivelPorId(nivel).nombre)}</h2>
            <p>Sube de nivel ganando XP en los quizzes y con las actividades del Compa.</p>
            <button class="btn" id="vamos">¡Vamos!</button>
          </section>`;
        document.getElementById('vamos').onclick = () => ir('#/inicio');
        return;
      }
      const p = preguntas[i];
      $app.innerHTML = `${encabezado('Examen de colocación', null, '#/bienvenida')}
        <p class="progreso-txt">Pregunta ${i + 1} de ${preguntas.length}</p>
        ${tarjetaPregunta(p)}
        <button class="btn link" id="saltar">Saltar y empezar desde el nivel 1</button>`;
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
    $app.innerHTML = `
      <section class="hero chico">
        <h1>Ingenio verbal</h1>
        <div class="stats">
          <span>⭐ ${s.xp} XP</span><span>🔥 ${s.racha} día${s.racha === 1 ? '' : 's'}</span><span>🤖 ${store.iaDisponibles() === Infinity ? '∞' : store.iaDisponibles()} IA hoy</span>
        </div>
        ${siguiente ? `<div class="barra"><div style="width:${Math.min(100, (s.xp / siguiente.xpMin) * 100)}%"></div></div><p class="sub">${siguiente.xpMin - s.xp} XP para desbloquear ${siguiente.emoji} ${esc(siguiente.nombre)}</p>` : ''}
      </section>
      <section class="niveles">
        ${NIVELES.map((n) => {
          const abierto = store.nivelDesbloqueado(n);
          const bloqueoAdulto = n.adulto && s.modoBlanco;
          return `<a class="nivel ${abierto ? '' : 'bloqueado'} ${n.id === max ? 'actual' : ''}" ${abierto ? `href="#/nivel/${n.id}"` : ''}>
            <span class="emoji">${abierto ? n.emoji : '🔒'}</span>
            <div><h3>Nivel ${n.id} · ${esc(n.nombre)}${n.adulto ? ' <small class="pill">+18</small>' : ''}</h3>
            <p>${esc(n.tema)}</p>
            ${!abierto ? `<p class="sub">${bloqueoAdulto ? 'Desactivado en modo blanco' : `Se desbloquea con ${n.xpMin} XP`}</p>` : ''}</div>
          </a>`;
        }).join('')}
      </section>`;
  },

  nivel(id) {
    const n = nivelValido(id); if (!n) return;
    const modos = [
      ['lecciones', '📖', 'Aprende', 'Teoría y ejemplos del nivel'],
      ['quiz', '✅', 'Quiz', 'Practica sin internet · +10 XP por acierto'],
      ['descifra', '🔍', 'Descifra', 'El Compa te lanza una frase, tú explicas el doble sentido'],
      ['crea', '✍️', 'Crea', 'Escribe tu propia frase y recibe calificación'],
      ['explica', '🧠', 'Explícame', 'Pega una frase y entiende sus dos lecturas'],
      ['compa', n.id >= 4 ? '⚔️' : '💬', n.id >= 4 ? 'Duelo' : 'Platica con el Compa', n.id >= 4 ? 'Duelo de albures contra la IA' : 'Práctica libre en conversación'],
    ];
    $app.innerHTML = `${encabezado(n.tema, n)}
      <p class="desc">${esc(n.descripcion)}</p>
      <section class="modos">
        ${modos.map(([r, e, t, d]) => `<a class="modo" href="#/${r}/${n.id}"><span class="emoji">${e}</span><div><h3>${t}</h3><p>${d}</p></div></a>`).join('')}
      </section>`;
  },

  lecciones(id) {
    const n = nivelValido(id); if (!n) return;
    $app.innerHTML = `${encabezado('Aprende', n, `#/nivel/${n.id}`)}
      ${n.lecciones.map((l) => `<article class="tarjeta">
        <h2>${esc(l.titulo)}</h2><p>${esc(l.texto)}</p>
        <ul>${l.ejemplos.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      </article>`).join('')}
      <a class="btn" href="#/quiz/${n.id}">Ir al quiz</a>`;
  },

  quiz(id) {
    const n = nivelValido(id); if (!n) return;
    const preguntas = barajar(n.quiz);
    let i = 0, aciertos = 0;
    const pintar = () => {
      if (i >= preguntas.length) {
        const xp = aciertos * 10;
        store.sumarXP(xp, `Quiz nivel ${n.id}`);
        $app.innerHTML = `${encabezado('Resultado', n, `#/nivel/${n.id}`)}
          <section class="tarjeta centro"><div class="grande">${aciertos === preguntas.length ? '🏆' : aciertos >= preguntas.length / 2 ? '👏' : '💪'}</div>
          <h2>${aciertos} de ${preguntas.length}</h2><p>+${xp} XP</p>
          <div class="fila"><button class="btn" id="otra">Otra ronda</button><a class="btn sec" href="#/descifra/${n.id}">Reto con IA</a></div></section>`;
        document.getElementById('otra').onclick = () => vistas.quiz(id);
        return;
      }
      const p = preguntas[i];
      $app.innerHTML = `${encabezado('Quiz', n, `#/nivel/${n.id}`)}
        <p class="progreso-txt">${i + 1} / ${preguntas.length}</p>
        ${tarjetaPregunta(p)}<div id="fb"></div>`;
      $app.querySelectorAll('.opcion').forEach((b) => b.onclick = () => {
        const ok = Number(b.dataset.i) === p.correcta;
        if (ok) aciertos++;
        $app.querySelectorAll('.opcion').forEach((o) => {
          o.disabled = true;
          if (Number(o.dataset.i) === p.correcta) o.classList.add('ok');
        });
        if (!ok) b.classList.add('mal');
        document.getElementById('fb').innerHTML = `<div class="aviso ${ok ? 'exito' : ''}"><strong>${ok ? '¡Bien!' : 'Casi.'}</strong> ${esc(p.explica)}</div>
          <button class="btn" id="sig">Siguiente</button>`;
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
        zona.innerHTML = `<section class="tarjeta">
            <p class="frase">“${esc(item.frase)}”</p>
            <details><summary>Ver pista</summary><p>${esc(item.pista)}</p></details>
            <label for="resp">¿Cuáles son las dos lecturas?</label>
            <textarea id="resp" rows="3" placeholder="Literal: … / Oculta: …"></textarea>
            <button class="btn" id="enviar">Revisar</button>
          </section><div id="fb"></div>`;
        document.getElementById('enviar').onclick = async () => {
          const r = document.getElementById('resp').value.trim();
          if (!r) return toast('Escribe tu interpretación');
          const fb = document.getElementById('fb');
          cargando(fb, 'Calificando…');
          try {
            const ev = await ia.evaluarInterpretacion(n, item, r);
            const pts = Math.max(0, Math.min(10, Number(ev.puntaje) || 0));
            store.sumarXP(pts * 2, `Descifra nivel ${n.id}`);
            fb.innerHTML = `<section class="tarjeta"><h2>${pts}/10 ${ev.capto ? '🎯' : '🤔'}</h2>
              <p>${texto(ev.retro)}</p><p class="sub">${texto(ev.explicacion)}</p><p class="sub">Técnica: ${esc(item.tecnica || '')} · +${pts * 2} XP</p>
              <button class="btn" id="otra">Otra frase</button></section>`;
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
      cargando(zona, 'Preparando tu reto…');
      try {
        const reto = await ia.generarReto(n);
        zona.innerHTML = `<section class="tarjeta">
            <p class="sub">Palabra de partida</p><p class="frase">${esc(reto.palabra)}</p>
            <p>${esc(reto.consigna)}</p><p class="sub">Técnica sugerida: ${esc(reto.ejemplo_tecnica || '')}</p>
            <textarea id="frase" rows="3" placeholder="Escribe tu frase de doble sentido"></textarea>
            <button class="btn" id="enviar">Calificar</button>
          </section><div id="fb"></div>`;
        document.getElementById('enviar').onclick = async () => {
          const f = document.getElementById('frase').value.trim();
          if (!f) return toast('Escribe tu frase');
          const fb = document.getElementById('fb');
          cargando(fb, 'El Compa está juzgando tu ingenio…');
          try {
            const ev = await ia.evaluarCreacion(n, reto, f);
            const pts = Math.max(0, Math.min(10, Number(ev.puntaje) || 0));
            store.sumarXP(pts * 3, `Crea nivel ${n.id}`);
            fb.innerHTML = `<section class="tarjeta"><h2>${pts}/10 ${pts >= 8 ? '🔥' : pts >= 5 ? '👍' : '🛠️'}</h2>
              <p>${texto(ev.retro)}</p><p class="sub">Versión mejorada:</p><p class="frase chica">${esc(ev.mejora)}</p>
              <p class="sub">+${pts * 3} XP</p><button class="btn" id="otro">Otro reto</button></section>`;
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
      <section class="tarjeta">
        <label for="frase">Pega o escribe una frase, chiste o albur que no entiendas</label>
        <textarea id="frase" rows="3" maxlength="400"></textarea>
        <button class="btn" id="enviar">Explicar</button>
      </section><div id="fb"></div>`;
    document.getElementById('enviar').onclick = async () => {
      const f = document.getElementById('frase').value.trim();
      if (!f) return toast('Escribe una frase');
      const fb = document.getElementById('fb');
      cargando(fb);
      try {
        const r = await ia.explicarFrase(n, f);
        store.sumarXP(2, `Explícame nivel ${n.id}`);
        fb.innerHTML = `<section class="tarjeta"><p>${texto(r)}</p></section>`;
      } catch (e) { errorIA(fb, e); }
    };
  },

  compa(id) {
    const n = nivelValido(id); if (!n) return;
    const historial = [];
    $app.innerHTML = `${encabezado(n.id >= 4 ? 'Duelo' : 'Platica con el Compa', n, `#/nivel/${n.id}`)}
      <section class="chat" id="chat"></section>
      <form class="entrada" id="form">
        <input id="msg" autocomplete="off" maxlength="300" placeholder="${n.id >= 4 ? 'Regrésala…' : 'Escribe aquí…'}">
        <button class="btn" type="submit">➤</button>
      </form>`;
    const chat = document.getElementById('chat');
    const burbuja = (rol, t) => {
      const d = document.createElement('div');
      d.className = `burbuja ${rol}`;
      d.innerHTML = texto(t).replace(/(🔎[^<]*)/g, '<span class="lupa">$1</span>');
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
      <section class="tarjeta"><div class="stats"><span>⭐ ${s.xp} XP</span><span>🔥 Racha: ${s.racha}</span><span>🏅 Nivel máx: ${store.nivelMaximo()}</span></div></section>
      <section class="tarjeta"><h2>Actividad reciente</h2>
        ${s.historial.length ? `<ul class="lista">${s.historial.map((h) => `<li><span>${esc(h.actividad)}</span><span>+${h.puntos} XP · ${esc(h.fecha)}</span></li>`).join('')}</ul>` : '<p>Aún no hay actividad. ¡Empieza con un quiz!</p>'}
      </section>`;
  },

  ajustes() {
    const s = store.get();
    $app.innerHTML = `${encabezado('Ajustes')}
      <section class="tarjeta">
        <label class="switch"><input type="checkbox" id="blanco" ${s.modoBlanco ? 'checked' : ''} ${s.mayorDeEdad ? '' : 'disabled'}> Modo blanco (sin contenido para adultos)</label>
        ${s.mayorDeEdad ? '' : '<p class="sub">Indicaste ser menor de 18 o preferir modo blanco, así que los niveles 4 y 5 quedan desactivados.</p>'}
      </section>
      <section class="tarjeta">
        <h2>API key propia de Groq (opcional)</h2>
        <p class="sub">Si la agregas, la app usa tu cuenta de Groq directo y sin límite diario. Se guarda solo en este dispositivo.</p>
        <input id="key" type="password" placeholder="gsk_..." value="${esc(s.apiKeyPropia)}">
        <button class="btn" id="guardar">Guardar</button>
      </section>
      <section class="tarjeta">
        <h2>Reiniciar</h2><p class="sub">Borra tu progreso y vuelve a la bienvenida.</p>
        <button class="btn peligro" id="reset">Reiniciar progreso</button>
      </section>
      <p class="sub centro">Ingenio verbal v0.1 · IA por Groq</p>`;
    document.getElementById('blanco').onchange = (e) => { store.set({ modoBlanco: e.target.checked }); toast('Guardado'); };
    document.getElementById('guardar').onclick = () => { store.set({ apiKeyPropia: document.getElementById('key').value.trim() }); toast('API key guardada'); };
    document.getElementById('reset').onclick = () => {
      if (document.getElementById('reset').dataset.confirm) { store.reiniciar(); ir('#/bienvenida'); return; }
      document.getElementById('reset').dataset.confirm = '1';
      document.getElementById('reset').textContent = 'Toca otra vez para confirmar';
    };
  },
};

function tarjetaPregunta(p) {
  return `<section class="tarjeta">
    <p class="frase">“${esc(p.frase)}”</p>
    <p><strong>${esc(p.pregunta)}</strong></p>
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
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
