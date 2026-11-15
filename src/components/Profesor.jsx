import { useEffect, useState } from 'react';
import { api, MODE } from '../lib/backend.js';
import { conectarSala, useSala, volverASlides, finalizarSala } from '../lib/sala.js';
import { store, newPin, celebrate } from '../lib/fx.js';
import { COLS } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';
import { QR } from '../deck/piezas.jsx';
import Deck from '../deck/Deck.jsx';

/* Modo profesor (#/profesor): iniciar sesión → abrir la sala → presentar.
   Usa el mismo Firebase de las semanas 4–6 (Auth del profesor + Firestore).
   Los estudiantes escanean UN solo QR (#/sala?pin=…) y las preguntas les llegan solas. */
const PIN_KEY = 'sd5w8-host-pin';

function Login({ onOk }) {
  const [pwd, setPwd] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const entrar = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try { await api.hostSignIn(pwd); onOk(); }
    catch (err) { console.error(err); setBusy(false); setMsg('Contraseña incorrecta (o falta la cuenta del profesor en Firebase).'); }
  };
  return (
    <form className="panel narrow" onSubmit={entrar}>
      <p className="eyebrow">Acceso del profesor</p>
      <h1 className="h-lg">Iniciar la clase</h1>
      <p className="exp">Con tu sesión se abre una sala: los estudiantes escanean un solo QR y tú envías cada pregunta a sus celulares desde la presentación.</p>
      <div className="field"><label htmlFor="pwd">Contraseña</label><input id="pwd" type="password" autoComplete="current-password" value={pwd} onChange={(e) => setPwd(e.target.value)} /></div>
      <button className="btn" disabled={busy || !pwd}>{busy ? 'Verificando…' : 'Entrar'}</button>
      {msg && <p className="note bad" role="alert">{msg}</p>}
      {MODE === 'local' && <p className="note">Modo demo local (sin Firebase configurado): cualquier contraseña entra y la sala solo funciona entre pestañas de este navegador.</p>}
    </form>
  );
}

function Lobby({ onSala }) {
  const ultimo = store.get(PIN_KEY);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const crear = async () => {
    setBusy(true);
    try {
      let pin = newPin();
      while (await api.getRoom(pin)) pin = newPin();
      await api.createRoom(pin, { pin, status: 'slide', qid: null, seq: 0, scored: [], closed: false, week: 8 });
      store.set(PIN_KEY, pin);
      onSala(pin);
    } catch (e) { console.error(e); setBusy(false); setMsg('No se pudo crear la sala. Revisa la conexión y las reglas de Firestore.'); }
  };
  const retomar = async () => {
    setBusy(true);
    const r = await api.getRoom(ultimo).catch(() => null);
    if (r && !r.closed) onSala(ultimo); else { store.set(PIN_KEY, null); setBusy(false); setMsg('Esa sala ya se cerró. Crea una nueva.'); }
  };
  return (
    <div className="panel narrow">
      <p className="eyebrow">Sala de la clase</p>
      <h1 className="h-lg">Abrir la sala</h1>
      <p className="exp">Se genera un PIN de 6 dígitos y un QR. Es el mismo para las 4 actividades.</p>
      <button className="btn" onClick={crear} disabled={busy}>Crear sala y empezar</button>
      {ultimo && <button className="btn ghost" onClick={retomar} disabled={busy}>Retomar sala {ultimo}</button>}
      {msg && <p className="note bad">{msg}</p>}
    </div>
  );
}

function Ranking({ players, onClose }) {
  const top = [...players].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10);
  return (
    <div className="overlay" role="dialog" aria-label="Ranking" onClick={onClose}>
      <div className="ov-card" onClick={(e) => e.stopPropagation()}>
        <p className="eyebrow">Ranking · {players.length} en la clase</p>
        <ol className="rank8">{top.map((p, i) => <li key={p.id}><span className="mono">{i + 1}</span><b>{p.nick}</b><span className="mono">{p.score || 0} pts</span></li>)}</ol>
        {!top.length && <p className="exp">Todavía no entra nadie.</p>}
        <button className="btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

function Presentador({ pin, onSalir }) {
  const { room, players } = useSala();
  const [pos, setPos] = useState({ h: 0, v: 0 });
  const [verQR, setVerQR] = useState(true);
  const [rank, setRank] = useState(false);
  const [fin, setFin] = useState(0); // 0 nada · 1 confirmar · 2 cerrada
  useEffect(() => { conectarSala(pin); return () => conectarSala(null); }, [pin]);
  const col = COLS[pos.h];
  const terminar = async () => {
    if (fin === 0) { setFin(1); setTimeout(() => setFin((x) => (x === 1 ? 0 : x)), 4000); return; }
    await finalizarSala(); store.set(PIN_KEY, null); setFin(2); setRank(true); celebrate(true);
  };
  const enPregunta = room?.status === 'question' || room?.status === 'reveal';
  return (
    <div className="viewer">
      <div className="viewer-stage"><Deck onChange={setPos} active={!verQR && !rank} /></div>
      <nav className="ctrl">
        <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].titulo}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}</span>
        <span className="grow" />
        <button className="cbtn" onClick={() => setVerQR(true)}>QR · PIN {pin}</button>
        <span className="chip mono">{players.length} conectados</span>
        {enPregunta && <button className="cbtn" onClick={() => volverASlides()} title="Los celulares vuelven a «Mira la pantalla»">Quitar pregunta</button>}
        <button className="cbtn" onClick={() => setRank(true)}>Ranking</button>
        {fin < 2 && <button className={`cbtn ${fin ? 'danger' : ''}`} onClick={terminar}>{fin ? '¿Seguro? Toca otra vez' : 'Finalizar sesión'}</button>}
        {fin === 2 && <button className="cbtn" onClick={onSalir}>Salir</button>}
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>
      {verQR && (
        <div className="overlay" role="dialog" aria-label="Código para entrar" onClick={() => setVerQR(false)}>
          <div className="ov-card qr-grande" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">Escaneen una sola vez</p>
            <QR ruta={`#/sala?pin=${pin}`} size={380} />
            <p className="pin-xl mono">{pin}</p>
            <p className="exp">o entren a <b>{location.host}{location.pathname}#/sala</b> con este PIN · {players.length} conectados</p>
            <button className="btn" onClick={() => setVerQR(false)}>Empezar la presentación</button>
          </div>
        </div>
      )}
      {rank && <Ranking players={players} onClose={() => setRank(false)} />}
    </div>
  );
}

export default function Profesor() {
  const [fase, setFase] = useState('cargando');
  const [pin, setPin] = useState(null);
  useEffect(() => { api.hostSession().then((ok) => setFase(ok ? 'lobby' : 'login')).catch(() => setFase('login')); }, []);
  if (fase === 'cargando') return <div className="page"><p className="exp center-t">Cargando…</p></div>;
  if (fase === 'login') return <div className="page"><Login onOk={() => setFase('lobby')} /></div>;
  if (fase === 'lobby') return <div className="page"><Lobby onSala={(p) => { setPin(p); setFase('sala'); }} /></div>;
  return <Presentador pin={pin} onSalir={() => { setPin(null); setFase('lobby'); }} />;
}
