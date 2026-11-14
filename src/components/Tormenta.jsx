import { useEffect, useRef, useState } from 'react';

/* Simulador "Tormenta de reconexión" (thundering herd).
   El servidor de notificaciones de PixPro se reinicia y 1 000 navegadores pierden la conexión a la vez.
   ¿Cómo vuelven a conectarse? Tres estrategias, lado a lado.
   Cada tick = 100 ms. El servidor acepta hasta 60 handshakes por tick, pero rechazar también cuesta
   (TLS, leer la petición): cada intento rechazado le quita 0.08 de capacidad. Números ilustrativos. */

const CLIENTES = 1000, CAP = 60, TICKS = 90, MAX_ESPERA = 32;

const ESTRATEGIAS = [
  { id: 'inmediato', nombre: 'Reintento inmediato', sub: 'vuelve a intentar a los 100 ms', color: '#FF6B8B' },
  { id: 'backoff', nombre: 'Backoff exponencial', sub: 'espera 1, 2, 4, 8… ticks (todos igual)', color: '#FFD166' },
  { id: 'jitter', nombre: 'Backoff + jitter', sub: 'espera al azar entre 0 y 1, 2, 4, 8…', color: '#C6F33A' },
];

function espera(estrategia, intento, rnd) {
  if (estrategia === 'inmediato') return 1;
  const tope = Math.min(MAX_ESPERA, 2 ** intento);
  return estrategia === 'backoff' ? tope : 1 + Math.floor(rnd() * tope);
}

/** Simula una estrategia completa con una semilla fija (siempre da el mismo resultado). */
function simular(estrategia) {
  let semilla = 7;
  const rnd = () => { semilla = (semilla * 16807) % 2147483647; return semilla / 2147483647; };
  // Cada cliente: { proximo: tick del siguiente intento, intento: n }
  const cli = Array.from({ length: CLIENTES }, () => ({ proximo: estrategia === 'jitter' ? Math.floor(rnd() * 10) : 0, intento: 0, ok: false }));
  const intentos = [], aceptados = [], conectados = [];
  let total = 0, rechazos = 0, todosEn = null;
  for (let t = 0; t < TICKS; t++) {
    const ahora = cli.filter((c) => !c.ok && c.proximo === t);
    const n = ahora.length;
    // Rechazar también gasta CPU: con muchos intentos a la vez, el servidor acepta menos.
    const cupo = n <= CAP ? n : Math.max(3, Math.floor((CAP - 0.08 * n) / 0.92));
    // El servidor acepta en orden de llegada (al azar).
    ahora.sort(() => rnd() - 0.5);
    ahora.forEach((c, i) => {
      if (i < cupo) c.ok = true;
      else { c.intento++; c.proximo = t + espera(estrategia, c.intento, rnd); rechazos++; }
    });
    total += n;
    const ac = Math.min(n, cupo);
    intentos.push(n); aceptados.push(ac);
    const con = cli.filter((c) => c.ok).length;
    conectados.push(con);
    if (con === CLIENTES && todosEn == null) todosEn = t + 1;
  }
  return { intentos, aceptados, conectados, total, rechazos, todosEn };
}

export default function Tormenta() {
  const [t, setT] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const res = useRef(Object.fromEntries(ESTRATEGIAS.map((e) => [e.id, simular(e.id)])));
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setT((x) => { if (x >= TICKS) { setCorriendo(false); return x; } return x + 1; }), 70);
    return () => clearInterval(id);
  }, [corriendo]);

  const W = 900, H = 120, bw = W / TICKS;
  const maxY = CAP * 6;
  return (
    <div className="sim tormenta">
      <div className="sim-ctrl">
        <button className="btn" onClick={() => { if (t >= TICKS) setT(0); setCorriendo(!corriendo); }}>{corriendo ? 'Pausa' : t === 0 ? '▶ Reiniciar el servidor' : t >= TICKS ? '↺ Repetir' : '▶ Seguir'}</button>
        <span className="mono sim-t">t = {(t / 10).toFixed(1)} s · 1 000 navegadores · el servidor acepta {CAP} handshakes cada 100 ms</span>
      </div>
      {ESTRATEGIAS.map((e) => {
        const r = res.current[e.id];
        const con = t ? r.conectados[t - 1] : 0;
        return (
          <div key={e.id} className="torm-carril" style={{ '--c': e.color }}>
            <div className="comp-nom"><b>{e.nombre}</b><span>{e.sub}</span></div>
            <svg viewBox={`0 0 ${W} ${H}`} className="torm-svg" role="img" aria-label={`Intentos por tick con ${e.nombre}`}>
              <line x1="0" x2={W} y1={H - (CAP / maxY) * H} y2={H - (CAP / maxY) * H} className="cap" />
              <text x={W - 4} y={H - (CAP / maxY) * H - 4} className="cap-t">capacidad</text>
              {r.intentos.slice(0, t).map((n, i) => {
                const h = Math.min(H, (n / maxY) * H), ha = (r.aceptados[i] / maxY) * H;
                return <g key={i}><rect x={i * bw} y={H - h} width={bw - 1} height={h} className="rech" /><rect x={i * bw} y={H - ha} width={bw - 1} height={ha} fill={e.color} /></g>;
              })}
            </svg>
            <div className="comp-num mono">
              <span><b>{con}</b>/1000 conectados</span>
              <span><b>{t ? r.intentos.slice(0, t).reduce((a, b) => a + b, 0) : 0}</b> intentos</span>
              <span>todos en <b>{r.todosEn && t >= r.todosEn ? `${(r.todosEn / 10).toFixed(1)} s` : '—'}</b></span>
            </div>
          </div>
        );
      })}
      <p className="sim-msg">Barras de color = handshakes aceptados; gris = rechazados (más carga sin avanzar). La línea es la capacidad del servidor.</p>
    </div>
  );
}
