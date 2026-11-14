import { useEffect, useState } from 'react';

/** Receso con cuenta regresiva de 10 minutos (empieza al tocar el botón). */
export function Receso() {
  const [fin, setFin] = useState(null);
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => { if (!fin) return; const id = setInterval(() => setAhora(Date.now()), 500); return () => clearInterval(id); }, [fin]);
  const resta = fin ? Math.max(0, fin - ahora) : 10 * 60 * 1000;
  const mm = String(Math.floor(resta / 60000)).padStart(2, '0'), ss = String(Math.floor((resta % 60000) / 1000)).padStart(2, '0');
  return (
    <div className="d-break">
      <p className="d-eti">Minuto 57 · receso</p>
      <h1>Pausa de 10 minutos</h1>
      <p className="d-reloj mono" aria-live="polite">{mm}:{ss}</p>
      {!fin ? <button className="btn" onClick={() => setFin(Date.now() + 10 * 60 * 1000)}>Iniciar cuenta regresiva</button>
        : resta === 0 ? <p className="d-preg">¡Volvemos! Ahora sí: ¿qué pasa cuando un servidor ya no alcanza?</p>
        : <p className="d-sub">Al volver: escalar WebSockets a muchos servidores, el eje de hoy.</p>}
      <div className="d-break-tip">
        <span className="mono">Mientras tanto</span>
        <p>Abran #/simuladores en el celular y prueben la tormenta de reconexión con y sin jitter.</p>
      </div>
    </div>
  );
}

/** Línea de tiempo de la sesión de 120 minutos. */
export const AGENDA = [
  [0, 5, 'Inicio', '#3A4152', 'c'], [5, 20, 'Tema 1 · Caso Microsoft 365', '#FF6B8B', 't'], [20, 27, 'Actividad 1', '#FFD166', 'a'],
  [27, 42, 'Tema 2 · Vida de una conexión', '#C6F33A', 't'], [42, 52, 'Tema 3 · API y librerías', '#6EA8FF', 't'], [52, 57, 'Actividad 2', '#FFD166', 'a'],
  [57, 67, 'Receso', '#3A4152', 'b'], [67, 92, 'Tema 4 · Escalar (el eje)', '#FF8A3D', 't'], [92, 97, 'Actividad 3', '#FFD166', 'a'],
  [97, 104, 'Tema 5 · AsyncAPI', '#B78CFF', 't'], [104, 110, 'Tema 6 · Monitoreo', '#FFD166', 't'], [110, 115, 'Tema 7 · Seguridad', '#5CE1E6', 't'],
  [115, 120, 'Actividad 4 + cierre', '#FFD166', 'a'],
];
export function Agenda() {
  return (
    <div className="d-agenda">
      <div className="bar">
        {AGENDA.map(([a, b, t, c]) => <div key={a} style={{ flex: b - a, background: c }} title={`${a}–${b} min · ${t}`} />)}
      </div>
      <div className="rows">
        {AGENDA.map(([a, b, t, c, k]) => (
          <div key={a} className={`row ${k}`}><span className="mono">{String(a).padStart(3, '0')}–{String(b).padStart(3, '0')}</span><i style={{ background: c }} /><b>{t}</b></div>
        ))}
      </div>
    </div>
  );
}
