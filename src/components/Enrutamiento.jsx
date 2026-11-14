import { useEffect, useState } from 'react';

/* Simulador "¿Cómo llega el mensaje al otro servidor?".
   Con varios servidores WebSocket, cada usuario está conectado a UNO. Si el evento entra por S1
   pero el destinatario está en S3, alguien tiene que llevarlo. Cinco formas, animadas.
   Simulación en el navegador. */

const N = {
  lb: { x: 500, y: 40, t: 'Balanceador', s: 'reparte conexiones' },
  s1: { x: 200, y: 175, t: 'Servidor WS 1', s: 'Ana · Beto' },
  s2: { x: 500, y: 175, t: 'Servidor WS 2', s: 'Caro' },
  s3: { x: 800, y: 175, t: 'Servidor WS 3', s: 'Dani' },
  ana: { x: 120, y: 330, t: 'Ana', s: 'envía', p: true },
  beto: { x: 280, y: 330, t: 'Beto', s: '', p: true },
  caro: { x: 500, y: 330, t: 'Caro', s: '', p: true },
  dani: { x: 800, y: 330, t: 'Dani', s: 'destinatario', p: true },
  bus: { x: 500, y: 440, t: 'Redis pub/sub', s: 'canal chat.dani' },
  reg: { x: 500, y: 440, t: 'Registro', s: 'Dani → Servidor 3' },
  log: { x: 500, y: 440, t: 'Kafka (log)', s: 'partición por usuario' },
};

const MODOS = [
  { id: 'nada', nombre: 'Sin coordinación', extra: null, pasos: [['ana', 's1', 'mensaje para Dani'], ['s1', 's1', '¿Dani? no está aquí ✗']],
    texto: 'S1 solo conoce sus propias conexiones. Dani está conectado a S3: el mensaje se pierde.', ok: false, internos: 0 },
  { id: 'sticky', nombre: 'Sticky sessions', extra: null, pasos: [['ana', 's1', 'siempre a S1 (sticky)'], ['s1', 's1', '¿Dani? sigue sin estar ✗']],
    texto: 'Sticky solo asegura que Ana vuelva a S1. No mueve a Dani: el mensaje se sigue perdiendo. Sticky ≠ enrutamiento.', ok: false, internos: 0 },
  { id: 'pubsub', nombre: 'Redis pub/sub', extra: 'bus', pasos: [['ana', 's1', 'mensaje'], ['s1', 'bus', 'PUBLISH chat.dani'], ['bus', 's1', ''], ['bus', 's2', ''], ['bus', 's3', ''], ['s3', 'dani', 'entrega ✓']],
    texto: 'S1 publica en Redis y Redis lo reparte a TODOS los servidores suscritos; solo S3 tiene a Dani y lo entrega. Simple, pero cada mensaje llega a todos (fan-out) y si Dani está desconectado, se pierde.', ok: true, internos: 4 },
  { id: 'registro', nombre: 'Registro de conexiones', extra: 'reg', pasos: [['ana', 's1', 'mensaje'], ['s1', 'reg', '¿dónde está Dani?'], ['reg', 's1', 'en S3'], ['s1', 's3', 'llamada directa'], ['s3', 'dani', 'entrega ✓']],
    texto: 'Un registro guarda «usuario → servidor». S1 pregunta y envía directo a S3. Menos tráfico, pero hay que mantener el registro al día cuando alguien se conecta o se cae.', ok: true, internos: 3 },
  { id: 'kafka', nombre: 'Log (Kafka)', extra: 'log', pasos: [['ana', 's1', 'mensaje'], ['s1', 'log', 'append (offset 42)'], ['log', 's3', 'S3 lee la partición'], ['s3', 'dani', 'entrega ✓']],
    texto: 'S1 escribe el mensaje en un log ordenado y durable. S3 lo lee desde su posición (offset). Si Dani estaba desconectado, al volver se le reenvía desde su último offset: nada se pierde.', ok: true, internos: 2 },
];

const DUR = 900;

export default function Enrutamiento() {
  const [modo, setModo] = useState('nada');
  const [paso, setPaso] = useState(-1);
  const [t, setT] = useState(0);
  const m = MODOS.find((x) => x.id === modo);
  useEffect(() => { setPaso(-1); }, [modo]);
  useEffect(() => {
    if (paso < 0 || paso >= m.pasos.length) return;
    const ini = performance.now();
    let id;
    const f = (now) => { const k = Math.min(1, (now - ini) / DUR); setT(k); if (k < 1) id = requestAnimationFrame(f); else setTimeout(() => setPaso((p) => p + 1), 250); };
    id = requestAnimationFrame(f);
    return () => cancelAnimationFrame(id);
  }, [paso, modo]);

  const visibles = ['lb', 's1', 's2', 's3', 'ana', 'beto', 'caro', 'dani', ...(m.extra ? [m.extra] : [])];
  const fin = paso >= m.pasos.length;
  const activo = paso >= 0 && !fin ? m.pasos[paso] : null;
  // Para pub/sub, los tres envíos del bus van en paralelo visualmente: agrupar pasos 2-4.
  return (
    <div className="sim ruta">
      <div className="sim-ctrl">
        {MODOS.map((x) => <button key={x.id} className={`cbtn ${modo === x.id ? 'on' : ''}`} onClick={() => setModo(x.id)}>{x.nombre}</button>)}
        <button className="btn" onClick={() => setPaso(0)}>▶ Ana le escribe a Dani</button>
      </div>
      <svg viewBox="0 0 1000 500" className="ruta-svg" role="img" aria-label={`Enrutamiento con ${m.nombre}`}>
        {['s1', 's2', 's3'].map((s) => <line key={s} x1={N.lb.x} y1={N.lb.y + 22} x2={N[s].x} y2={N[s].y - 28} className="ruta-l" />)}
        {[['ana', 's1'], ['beto', 's1'], ['caro', 's2'], ['dani', 's3']].map(([u, s]) => <line key={u} x1={N[u].x} y1={N[u].y - 20} x2={N[s].x} y2={N[s].y + 28} className="ruta-ws" />)}
        {m.extra && ['s1', 's2', 's3'].map((s) => <line key={s} x1={N[s].x} y1={N[s].y + 28} x2={N[m.extra].x} y2={N[m.extra].y - 24} className="ruta-l dash" />)}
        {visibles.map((k) => {
          const n = N[k];
          const w = n.p ? 110 : 200, h = n.p ? 40 : 56;
          const cls = n.p ? 'per' : k === m.extra ? 'ext' : k === 'lb' ? 'lb' : 'srv';
          const brillo = (activo && (activo[1] === k)) || (fin && m.ok && k === 'dani') ? 'on' : '';
          return (
            <g key={k} transform={`translate(${n.x - w / 2},${n.y - h / 2})`} className={`ruta-n ${cls} ${brillo}`}>
              <rect width={w} height={h} rx={n.p ? 20 : 12} />
              <text x={w / 2} y={n.s ? h / 2 - 3 : h / 2 + 6} className="t">{n.t}</text>
              {n.s && <text x={w / 2} y={h / 2 + 15} className="s">{n.s}</text>}
            </g>
          );
        })}
        {activo && (() => {
          const [a, b, lbl] = activo;
          const A = N[a], B = N[b];
          const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
          return <g><circle cx={x} cy={y} r="11" className={a === b ? 'pk fail' : 'pk'} />{lbl && <text x={x + 16} y={y - 12} className="pk-t">{lbl}</text>}</g>;
        })()}
      </svg>
      <div className="ruta-pie">
        <p className={`sim-msg ${fin ? (m.ok ? 'ok' : 'bad') : ''}`}>{fin ? (m.ok ? '✓ ' : '✗ ') : ''}{m.texto}</p>
        <span className="mono">mensajes entre servidores: <b>{m.internos}</b></span>
      </div>
    </div>
  );
}
