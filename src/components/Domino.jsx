import { useEffect, useRef, useState } from 'react';

/* Simulador "Efecto dominó": por qué se cayó Microsoft 365 (12–13 nov 2026).
   Unos servidores fallan el health check y salen; su carga se reparte entre los demás;
   si la parte de cada uno pasa su capacidad, también fallan el health check... y caen todos.
   Simulación en el navegador (no usa la red). Los números son ilustrativos. */

const CAP = 100;          // peticiones por segundo que aguanta cada servidor
const TRAFICO = 640;      // tráfico constante: el de Microsoft NO subió
const TICK_MS = 650;
const REINICIO = 5;       // ticks que tarda un servidor caído en volver
const HIST = 46;

function inicial(n) {
  return Array.from({ length: n }, (_, i) => ({ id: i, estado: 'ok', vuelveEn: 0 }));
}

export default function Domino({ compacto = false }) {
  const [reserva, setReserva] = useState(false);       // 10 servidores en vez de 8
  const [smart, setSmart] = useState(false);           // health check distingue "ocupado" de "roto" + load shedding
  const [gradual, setGradual] = useState(false);       // reingreso solo cuando hay capacidad suficiente
  const [servs, setServs] = useState(() => inicial(8));
  const [tick, setTick] = useState(0);
  const [hist, setHist] = useState([]);
  const [corriendo, setCorriendo] = useState(false);
  const ref = useRef({ servs, tick });
  ref.current = { servs, tick };

  const reiniciar = (r = reserva) => { setServs(inicial(r ? 10 : 8)); setTick(0); setHist([]); setCorriendo(true); };

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      const { servs: s0, tick: t0 } = ref.current;
      const t = t0 + 1;
      let s = s0.map((x) => ({ ...x }));
      // 1. Los que terminaron de reiniciar quieren volver.
      const listos = s.filter((x) => x.estado !== 'ok' && t >= x.vuelveEn);
      const activos0 = s.filter((x) => x.estado === 'ok').length;
      if (!gradual || (activos0 + listos.length) * CAP >= TRAFICO) listos.forEach((x) => { x.estado = 'ok'; });
      else listos.forEach((x) => { x.estado = 'esperando'; });
      // 2. Repartir el tráfico entre los activos.
      let activos = s.filter((x) => x.estado === 'ok');
      const carga = activos.length ? TRAFICO / activos.length : 0;
      let atendidas;
      if (!smart) {
        // Health check ingenuo: si un servidor está saturado responde lento → "no responde" → lo sacan.
        if (carga > CAP) activos.forEach((x, i) => { x.estado = 'caido'; x.vuelveEn = t + REINICIO + (i % 4); });
        activos = s.filter((x) => x.estado === 'ok');
        atendidas = activos.length ? Math.min(TRAFICO, activos.length * CAP) : 0;
      } else {
        // Health check inteligente: "ocupado" no es "roto". Se queda y rechaza rápido el exceso (load shedding).
        atendidas = Math.min(TRAFICO, activos.length * CAP);
      }
      setServs(s);
      setTick(t);
      setHist((h) => [...h.slice(-(HIST - 1)), Math.round((100 * atendidas) / TRAFICO)]);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [corriendo, smart, gradual]);

  const romper = () => {
    if (!corriendo) setCorriendo(true);
    setServs((s) => {
      const n = s.map((x) => ({ ...x }));
      n.filter((x) => x.estado === 'ok').slice(0, 2).forEach((x) => { x.estado = 'caido'; x.vuelveEn = tick + 8; });
      return n;
    });
  };

  const activos = servs.filter((x) => x.estado === 'ok').length;
  const carga = activos ? TRAFICO / activos : 0;
  const ultimo = hist.length ? hist[hist.length - 1] : 100;
  const W = 600, H = 120;
  const puntos = hist.map((v, i) => `${(i / (HIST - 1)) * W},${H - (v / 100) * H}`).join(' ');

  let mensaje = 'Todo normal: cada servidor usa el ' + Math.round((carga / CAP) * 100) + ' % de su capacidad. Toca «Fallan 2 servidores».';
  if (activos === 0) mensaje = 'Caída total: todos los servidores fallaron el health check. Cuando uno vuelve, recibe TODO el tráfico y se cae otra vez.';
  else if (carga > CAP && smart) mensaje = `Saturados (${Math.round(carga)}/${CAP}), pero siguen en servicio: rechazan rápido el exceso y atienden el ${ultimo} %.`;
  else if (activos < servs.length && carga <= CAP) mensaje = `${servs.length - activos} fuera de servicio; los demás aguantan (${Math.round(carga)}/${CAP} cada uno).`;

  return (
    <div className={`sim domino ${compacto ? 'compacto' : ''}`}>
      <div className="sim-ctrl">
        <button className="btn" onClick={() => reiniciar()}>{corriendo ? '↺ Reiniciar' : '▶ Iniciar'}</button>
        <button className="btn danger" onClick={romper} disabled={!corriendo || activos === 0}>Fallan 2 servidores</button>
        <label className="sim-tog"><input type="checkbox" checked={reserva} onChange={(e) => { setReserva(e.target.checked); reiniciar(e.target.checked); }} /> Capacidad de reserva (10 servidores)</label>
        <label className="sim-tog"><input type="checkbox" checked={smart} onChange={(e) => setSmart(e.target.checked)} /> Health check: «ocupado» ≠ «roto» + rechazo del exceso</label>
        <label className="sim-tog"><input type="checkbox" checked={gradual} onChange={(e) => setGradual(e.target.checked)} /> Reingreso coordinado</label>
      </div>
      <div className="dom-grid" style={{ gridTemplateColumns: `repeat(${servs.length}, minmax(0, 1fr))` }}>
        {servs.map((x) => {
          const ok = x.estado === 'ok';
          const pct = ok ? Math.min(160, (carga / CAP) * 100) : 0;
          const cls = !ok ? x.estado : pct > 100 ? 'saturado' : pct > 85 ? 'alto' : 'ok';
          return (
            <div key={x.id} className={`dom-srv ${cls}`}>
              <span className="mono">EXO-{x.id + 1}</span>
              <div className="dom-bar"><i style={{ height: `${Math.min(100, pct)}%` }} /></div>
              <b className="mono">{ok ? `${Math.round(carga)}/${CAP}` : x.estado === 'esperando' ? 'listo' : 'caído'}</b>
            </div>
          );
        })}
      </div>
      <div className="dom-pie">
        <svg viewBox={`0 0 ${W} ${H}`} className="dom-chart" role="img" aria-label="Porcentaje de peticiones atendidas en el tiempo">
          <line x1="0" y1="0" x2={W} y2="0" className="ref" />
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} className="ref" />
          {hist.length > 1 && <polyline points={puntos} className="serie" />}
        </svg>
        <div className="dom-num">
          <span className="mono">peticiones atendidas</span>
          <b className={ultimo < 50 ? 'bad' : ultimo < 100 ? 'meh' : 'ok'}>{ultimo} %</b>
          <span className="mono">tráfico constante: {TRAFICO}/s · capacidad: {servs.length}×{CAP}</span>
        </div>
      </div>
      <p className="sim-msg">{mensaje}</p>
    </div>
  );
}
