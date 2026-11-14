import { TEMAS } from '../data/temas.js';

const BASE = import.meta.env.BASE_URL;
const DIAGRAMAS = [
  ['caida-microsoft', 'La caída de Microsoft 365'], ['vida-conexion', 'Vida de una conexión'], ['estados-websocket', 'Estados de un WebSocket'],
  ['escalar-websockets', 'Escalar WebSockets'], ['pixpro-escala', 'PixPro listo para escalar'], ['asyncapi-pixpro', 'AsyncAPI de PixPro'],
  ['monitoreo', 'Monitoreo'], ['seguridad-websockets', 'Seguridad (OWASP)'],
];

export default function Landing() {
  return (
    <div className="page landing7">
      <section className="hero7">
        <p className="eyebrow">Desarrollo de Software 5 · Semana 8 · PixPro</p>
        <h1 className="h-xl">WebSockets <em>a escala</em></h1>
        <p className="exp">El 12 de noviembre Microsoft 365 falló casi un día entero sin que subiera el tráfico. Partimos de ese caso para diseñar un PixPro en tiempo real que aguante miles de conexiones.</p>
        <div className="row-btns">
          <a className="btn" href="#/actividades">Actividades</a>
          <a className="btn ghost" href="#/presentacion">Ver la presentación</a>
          <a className="btn ghost" href="#/simuladores">Simuladores</a>
        </div>
      </section>
      <section>
        <p className="eyebrow">Temas</p>
        <div className="temas7">{TEMAS.map((t) => <a key={t.id} href={`#/presentacion?t=${t.id}`} style={{ '--c': t.color }}><span className="mono">{t.n}</span>{t.titulo}</a>)}</div>
      </section>
      <section>
        <p className="eyebrow">Diagramas (Archify)</p>
        <div className="diags7">{DIAGRAMAS.map(([id, t]) => <a key={id} href={`${BASE}diagramas/${id}.html`} target="_blank" rel="noreferrer">{t} ↗</a>)}</div>
      </section>
    </div>
  );
}
