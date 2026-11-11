// Estado local del usuario (localStorage). Sin backend por ahora.
import { NIVELES } from './data/niveles.js';

const KEY = 'iv_estado_v1';
const CUOTA_IA_DIARIA = 30; // consultas a la IA por día en el plan gratuito

const inicial = () => ({
  onboarding: false,
  mayorDeEdad: false,
  modoBlanco: true,
  nivelInicial: 1,
  xp: 0,
  racha: 0,
  ultimoDia: null,
  iaHoy: { fecha: null, usadas: 0 },
  apiKeyPropia: '',
  historial: [], // últimas actividades
});

let estado = cargar();

function cargar() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...inicial(), ...JSON.parse(raw) } : inicial();
  } catch {
    return inicial();
  }
}

function guardar() {
  try { localStorage.setItem(KEY, JSON.stringify(estado)); } catch { /* sin almacenamiento */ }
}

const hoy = () => new Date().toISOString().slice(0, 10);

export const store = {
  get: () => estado,
  set(parcial) { estado = { ...estado, ...parcial }; guardar(); },
  reiniciar() { estado = inicial(); guardar(); },

  // Niveles disponibles según XP, colocación y edad.
  nivelMaximo() {
    let max = estado.nivelInicial;
    for (const n of NIVELES) if (estado.xp >= n.xpMin) max = Math.max(max, n.id);
    if (!estado.mayorDeEdad || estado.modoBlanco) max = Math.min(max, 3);
    return max;
  },
  nivelDesbloqueado(n) {
    if (n.adulto && (!estado.mayorDeEdad || estado.modoBlanco)) return false;
    return n.id <= this.nivelMaximo();
  },

  sumarXP(puntos, actividad) {
    const d = hoy();
    let racha = estado.racha;
    if (estado.ultimoDia !== d) {
      const ayer = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      racha = estado.ultimoDia === ayer ? racha + 1 : 1;
    }
    const historial = [{ fecha: d, actividad, puntos }, ...estado.historial].slice(0, 30);
    this.set({ xp: estado.xp + puntos, racha, ultimoDia: d, historial });
  },

  // Cuota diaria de IA (se omite si el usuario usa su propia API key).
  iaDisponibles() {
    if (estado.apiKeyPropia) return Infinity;
    const usadas = estado.iaHoy.fecha === hoy() ? estado.iaHoy.usadas : 0;
    return Math.max(0, CUOTA_IA_DIARIA - usadas);
  },
  consumirIA() {
    if (estado.apiKeyPropia) return;
    const d = hoy();
    const usadas = estado.iaHoy.fecha === d ? estado.iaHoy.usadas + 1 : 1;
    this.set({ iaHoy: { fecha: d, usadas } });
  },
};
