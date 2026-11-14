import { useState } from 'react';
import Domino from './Domino.jsx';
import Tormenta from './Tormenta.jsx';
import Enrutamiento from './Enrutamiento.jsx';

/* Los tres simuladores de la semana, para repasar en el celular o la computadora. */
const SIMS = [
  { id: 'domino', n: 'Efecto dominó', d: 'Por qué se cayó Microsoft 365 aunque el tráfico no subió, y tres defensas.', C: Domino },
  { id: 'tormenta', n: 'Tormenta de reconexión', d: '1 000 navegadores vuelven a la vez: reintento inmediato, backoff y backoff + jitter.', C: Tormenta },
  { id: 'ruta', n: 'Enrutamiento entre servidores', d: 'Ana (servidor 1) le escribe a Dani (servidor 3): sticky, Redis, registro o Kafka.', C: Enrutamiento },
];

export default function Simuladores() {
  const [s, setS] = useState(() => SIMS.find((x) => x.id === new URLSearchParams(location.hash.split('?')[1] || '').get('s'))?.id || 'domino');
  const sim = SIMS.find((x) => x.id === s);
  return (
    <div className="page sims8">
      <div className="sims8-tabs">{SIMS.map((x) => <button key={x.id} className={`cbtn ${s === x.id ? 'on' : ''}`} onClick={() => setS(x.id)}>{x.n}</button>)}</div>
      <h1 className="h-lg">{sim.n}</h1>
      <p className="exp">{sim.d} Es una simulación en tu navegador con números ilustrativos.</p>
      <sim.C key={s} />
    </div>
  );
}
