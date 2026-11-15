import { useState } from 'react';
import { QR } from './piezas.jsx';
import Pregunta from '../components/Pregunta.jsx';
import { useSala, respuestasDe, abrirPregunta, revelarPregunta } from '../lib/sala.js';
import { LETRAS, puntaje } from '../data/actividades.js';

/* Piezas de diapositiva que cambian cuando el profesor inició sesión y tiene una sala abierta.
   Sin sala (presentación pública #/presentacion) se comportan como antes: QR de práctica libre. */

/** El único QR de la clase: con sala abierta lleva a #/sala con el PIN; sin sala, a la práctica libre. */
export function QRClase({ size = 260, libre = '#/actividades', pie }) {
  const { pin } = useSala();
  if (pin) {
    return (
      <div className="d-act-qr"><QR ruta={`#/sala?pin=${pin}`} size={size} />
        <p className="mono">PIN <b className="pin-g">{pin}</b> · el mismo código toda la clase</p></div>
    );
  }
  return <div className="d-act-qr"><QR ruta={libre} size={size} /><p className="mono">{pie || libre}</p></div>;
}

function Resultados({ q, lista }) {
  if (!lista.length) return <p className="vivo-n">Nadie respondió.</p>;
  if (q.type === 'scale') {
    return (
      <div className="vivo-bars">{q.o.map((o, i) => {
        const v = lista.map((x) => x.r?.[i] || 0).filter(Boolean); const prom = v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
        return <div key={i} className="vb"><span>{o}</span><i style={{ width: `${(prom / 5) * 100}%` }} /><b className="mono">{prom.toFixed(1)}</b></div>;
      })}</div>
    );
  }
  const bien = lista.filter((x) => puntaje(q, x.r) === 100).length;
  return (
    <>
      <p className="vivo-n"><b>{Math.round((100 * bien) / lista.length)} %</b> acertó · {bien} de {lista.length}</p>
      {(q.type === 'quiz' || q.type === 'tf') && (
        <div className="vivo-bars">{q.o.map((o, i) => {
          const n = lista.filter((x) => x.r === i).length;
          return <div key={i} className={`vb ${i === q.a ? 'ok' : ''}`}><span>{LETRAS[i]}</span><i style={{ width: `${(100 * n) / lista.length}%` }} /><b className="mono">{n}</b></div>;
        })}</div>
      )}
    </>
  );
}

/** Panel lateral del profesor en una diapositiva de pregunta. */
function Control({ q }) {
  const { pin, room, players, answers } = useSala();
  const [busy, setBusy] = useState(false);
  const run = (f) => async () => { setBusy(true); try { await f(); } catch (e) { console.error(e); } setBusy(false); };
  const aqui = room?.qid === q.id;
  const abierta = aqui && room.status === 'question';
  const revelada = aqui && room.status === 'reveal';
  const lista = respuestasDe(answers, q.id);
  return (
    <div className="vivo">
      <QR ruta={`#/sala?pin=${pin}`} size={150} />
      <p className="mono vivo-pin">PIN {pin} · {players.length} conectados</p>
      {!aqui && <button className="btn" disabled={busy} onClick={run(() => abrirPregunta(q.id))}>📲 Enviar a los celulares</button>}
      {abierta && (
        <>
          <p className="vivo-n"><b>{lista.length}</b> de {players.length} respondieron</p>
          <div className="vivo-prog"><i style={{ width: `${players.length ? (100 * lista.length) / players.length : 0}%` }} /></div>
          <button className="btn revelar" disabled={busy} onClick={run(() => revelarPregunta(q.id))}>Revelar respuesta</button>
        </>
      )}
      {revelada && (
        <>
          <Resultados q={q} lista={lista} />
          <button className="btn ghost" disabled={busy} onClick={run(() => abrirPregunta(q.id))}>Repetir pregunta</button>
        </>
      )}
    </div>
  );
}

/** Diapositiva de una pregunta: en vivo con sala, o con QR de práctica libre sin ella. */
export function PreguntaSlide({ q, actividad }) {
  const { pin, room } = useSala();
  if (!pin) {
    return (
      <div className="d-pant">
        <Pregunta q={q} modo="pantalla" />
        <QRClase size={200} libre={`#/actividades?a=${actividad}`} pie="¿Aún no entras? Escanea" />
      </div>
    );
  }
  const revelada = room?.qid === q.id && room.status === 'reveal';
  return (
    <div className="d-pant">
      <Pregunta key={`${q.id}-${room?.seq || 0}`} q={q} modo="pantalla" revelar={revelada} />
      <Control q={q} />
    </div>
  );
}
