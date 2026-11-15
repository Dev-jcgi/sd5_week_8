import { T, Portada, Arch, Code, Cards, Card, YPixPro, QR } from './piezas.jsx';
import { Receso, Agenda } from './extras.jsx';
import { ACTIVIDAD } from '../data/actividades.js';
import { QRClase, PreguntaSlide } from './vivo.jsx';
import Domino from '../components/Domino.jsx';
import Tormenta from '../components/Tormenta.jsx';
import Enrutamiento from '../components/Enrutamiento.jsx';

/* Presentación de la Semana 8 · DS5 · WebSockets a escala, con PixPro.
   Hilo: la caída de Microsoft 365 (12–13 nov 2026) abre la pregunta "¿cómo se diseña algo que no se derrumbe?",
   y cada tema la contesta para las conexiones WebSocket de PixPro.
   Cada columna (→) es un tema o una actividad; sus diapositivas (↓) profundizan. Sin servidor en vivo. */

const Lista = ({ items, frag }) => <ul className="d-list">{items.map((x, i) => <li key={i} className={frag ? 'fragment' : ''}>{x}</li>)}</ul>;
const Tabla = ({ head, rows, small }) => (
  <table className={`d-tabla ${small ? 'sm' : ''}`}><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table>
);
const Dos = ({ children, r = '1fr 1fr' }) => <div className="d-dos" style={{ gridTemplateColumns: r }}>{children}</div>;
const Analogia = ({ titulo, children }) => <div className="d-analogia"><span className="mono">Analogía</span><h3>{titulo}</h3>{children}</div>;
const Puente = ({ children }) => <p className="d-puente"><span className="mono">Siguiente →</span> {children}</p>;
const Dato = ({ n, t, c }) => <div className="d-dato" style={{ '--c': c }}><b>{n}</b><span>{t}</span></div>;

/** Portada de una actividad: QR a las actividades del celular. */
function Actividad({ id, como }) {
  const a = ACTIVIDAD[id];
  return (
    <div className="d-act" style={{ '--c': a.color }}>
      <p className="d-eti"><span className="pill">ACTIVIDAD {a.n} DE 4</span> {a.momento} · {a.min} min</p>
      <h1>{a.nombre}</h1>
      <Dos r="1.3fr 1fr">
        <div className="d-act-modos">
          <div><span className="mono">Cómo funciona</span><p>Escanea el código (si ya entraste a la clase, no hace falta otra vez). Respondes en tu celular y ves si acertaste y por qué.</p></div>
          <div><span className="mono">En la pantalla</span><p>Proyecto cada pregunta con su tiempo. Cuando acabe, revelo la respuesta y la comentamos.</p></div>
          <div><span className="mono">Qué repasa</span><p>{como}</p></div>
        </div>
        <QRClase size={250} libre={`#/actividades?a=${id}`} pie={`#/actividades · ${a.preguntas.length} preguntas`} />
      </Dos>
    </div>
  );
}
/** Una diapositiva por pregunta, en modo pantalla. */
const preguntas = (id) => ACTIVIDAD[id].preguntas.map((q) => (
  <PreguntaSlide key={q.id} q={q} actividad={id} />
));

export const COLS = [
  /* ───────────── INICIO ───────────── */
  { id: 'inicio', titulo: 'Inicio', slides: [
    <div className="d-hero" key="p">
      <p className="d-eti">Desarrollo de Software 5 · Semana 8</p>
      <h1>WebSockets <em>a escala</em></h1>
      <p className="d-preg">El 12 de noviembre Outlook y Teams fallaron casi 24 horas <b>sin que subiera el tráfico</b>. Hoy entendemos por qué y diseñamos PixPro para que no le pase.</p>
      <div className="d-hero-tags mono"><span>Caso Microsoft</span><span>Conexión</span><span>API</span><span>Escalar</span><span>AsyncAPI</span><span>Monitoreo</span><span>Seguridad</span></div>
      <p className="d-nav mono">→ avanzar · ↓ profundizar · ESC vista general</p>
    </div>,
    <>
      <T eti="Agenda">Un caso real, y después el viaje de una conexión hasta producción</T>
      <Agenda />
    </>,
    <>
      <T eti="De dónde venimos">La semana 7 tenía un solo servidor</T>
      <Dos r="1.15fr 1fr">
        <Lista items={[
          <>Hicimos un servidor WebSocket en <b>Java</b>, en Render, y cada celular abrió <b>una</b> conexión que duró toda la clase.</>,
          <>Funcionó con 30 celulares. Pero PixPro quiere miles de fotógrafos viendo su lote avanzar.</>,
          <>Un servidor tiene límite. Y si es el único, cuando se cae, se cae todo.</>,
          <>Escaneen el código <b>una sola vez</b>: con él responden las 4 actividades de hoy desde su celular.</>,
        ]} />
        <QRClase size={280} pie="#/actividades · déjenla abierta" />
      </Dos>
      <Puente>Para ver qué pasa cuando muchos servidores fallan juntos, empecemos por un caso de esta semana.</Puente>
    </>,
  ] },

  /* ───────────── TEMA 1 · CASO MICROSOFT ───────────── */
  { id: 't1', tema: 't1', slides: [
    <Portada key="p" tema="t1" pregunta="¿Cómo se cae un servicio que usan 430 millones de personas… si el tráfico no subió?" />,
    <>
      <T tema="t1" eti="Los hechos">12 y 13 de noviembre de 2026: Exchange Online se tambalea</T>
      <div className="d-datos">
        <Dato n="18:26 UTC" t="12 nov · empieza en Exchange Online, región Américas (incidente MO1550821)" c="#FF6B8B" />
        <Dato n="≈ 24 h" t="hasta que el servicio se estabiliza" c="#FF8A3D" />
        <Dato n="74+" t="países con reportes" c="#FFD166" />
        <Dato n="≈ 131 mil" t="reportes de Outlook en Downdetector en el pico" c="#C6F33A" />
      </div>
      <Cards cols={3}>
        <Card t="Qué falló" c="#FF6B8B">Correo de Outlook primero; luego Teams, Copilot, SharePoint, Intune y Defender.</Card>
        <Card t="A quién afectó" c="#FF8A3D">Escuelas, el NHS y la policía en Reino Unido (BBC). Hasta inicios de sesión de Xbox.</Card>
        <Card t="Qué NO fue" c="#6EA8FF">Microsoft lo descartó: no fue un ataque ni un problema de IA o de agentes.</Card>
      </Cards>
    </>,
    <>
      <T tema="t1" eti="La explicación de Microsoft" sub="Resumida en sus avisos de estado durante el incidente">Un dominó que nadie empujó desde afuera</T>
      <ol className="d-pasos">
        <li><b>Un cambio de red reciente</b> despertó un problema que venía de una actualización de capacidad anterior.</li>
        <li className="fragment"><b>Varios servidores de Exchange fallaron el health check</b> automático y salieron de servicio.</li>
        <li className="fragment"><b>Los que quedaban se saturaron</b>, aunque el tráfico era el de siempre.</li>
        <li className="fragment"><b>Los servidores que volvían se volvían a saturar</b> al recibir todo de golpe.</li>
        <li className="fragment"><b>Mitigación:</b> pausar despliegues, redistribuir tráfico, reiniciar, otro método de health check y extender a 48 h la espera del correo.</li>
      </ol>
    </>,
    <>
      <T tema="t1" eti="Explicador (Archify)">Del cambio de red a la cascada</T>
      <Arch src="caida-microsoft" h={640} nota="Pasos, línea de tiempo en UTC y lecciones" />
    </>,
    <>
      <T tema="t1" eti="Simulador · efecto dominó" sub="8 servidores, 640 peticiones/s constantes, cada uno aguanta 100. Toca «Fallan 2 servidores» y después prueba las tres defensas.">Repite la caída en tu navegador</T>
      <Domino />
    </>,
    <>
      <T tema="t1" eti="Para entenderlo">Las cajas del supermercado</T>
      <Dos r="1.1fr 1fr">
        <Analogia titulo="8 cajas abiertas, filas normales">
          <p>Cierran 2 cajas. Sus clientes se forman en las otras 6, que se llenan. El gerente ve una caja con fila larga, piensa <b>“esta caja no funciona”</b> y también la cierra.</p>
          <p>Ahora hay 5 cajas para todos. Cada vez que abre una, <b>toda la fila</b> se le viene encima.</p>
        </Analogia>
        <Lista frag items={[
          <><b>Caja lenta ≠ caja rota.</b> Ese es el health check que hay que arreglar.</>,
          <><b>Cajas de reserva:</b> capacidad para perder 2 sin saturar.</>,
          <><b>“Esta fila está llena, vaya a otra tienda”:</b> rechazar rápido el exceso (load shedding).</>,
          <><b>Abrir cajas solo cuando hay suficientes</b> para la fila completa.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t1" eti="No es la primera vez">Noviembre de 2024: la avalancha de reintentos</T>
      <Dos r="1fr 1fr">
        <div className="d-def">
          <p>En el incidente <b>MO941162</b> Microsoft explicó que un cambio provocó una <b>avalancha de solicitudes de reintento</b>.</p>
          <p>Cuando algo falla, <b>todos los clientes reintentan a la vez</b>. Esa ola de reintentos es tráfico extra justo cuando el servicio está más débil.</p>
        </div>
        <Card t="Se llama retry storm (o thundering herd)" c="#FF8A3D">
          <p>Con WebSockets es todavía peor: si se reinicia un servidor con 50 000 conexiones, son <b>50 000 navegadores reconectándose en el mismo segundo</b>.</p>
          <p className="fragment">Lo vamos a simular en el tema 2.</p>
        </Card>
      </Dos>
    </>,
    <>
      <T tema="t1" eti="Lecciones de arquitectura">Seis decisiones que frenan una cascada</T>
      <Tabla small head={['Principio', 'Qué falló en el caso', 'Cómo se diseña']} rows={[
        ['Health check honesto', 'Saturado se confundió con caído', 'Separar “vivo” (liveness) de “listo para más” (readiness)'],
        ['Capacidad de reserva', 'Al perder unos, no alcanzó', 'N+2: poder perder dos servidores sin saturar'],
        ['Rechazar rápido', 'Todos intentaban atender todo', 'Load shedding: responder “ocupado” en vez de colgarse'],
        ['Reingreso coordinado', 'Cada servidor que volvía se caía', 'Volver gradualmente y con poco tráfico al inicio'],
        ['Cambios reversibles', 'Un cambio de red lo detonó', 'Despliegue por partes (canary) y poder pausar'],
        ['Clientes educados', '2024: avalancha de reintentos', 'Backoff + jitter, y respetar “no reintentes”'],
      ]} />
    </>,
    <>
      <T tema="t1" eti="Discusión · 3 min en parejas">¿Qué harían ustedes?</T>
      <Cards cols={3}>
        <Card t="1 · El health check" c="#FF6B8B">Un servidor tarda 3 s en contestar. ¿Lo sacarían de servicio? ¿Qué preguntarían antes?</Card>
        <Card t="2 · El costo" c="#FFD166">Tener 2 servidores de reserva cuesta dinero todos los días. ¿Cuándo vale la pena?</Card>
        <Card t="3 · El usuario" c="#6EA8FF">Si el servicio va a fallar, ¿qué es mejor: un error rápido y claro, o una página que carga para siempre?</Card>
      </Cards>
      <p className="d-capstone fragment"><b>No hay una sola respuesta correcta.</b> Arquitectura es decidir qué falla, cómo falla y qué ve el usuario cuando falla.</p>
    </>,
    <YPixPro key="y" tema="t1" items={[
      ['…el servidor de notificaciones de PixPro (el WebSocket) se reinicia con 5 000 fotógrafos conectados?', 'Los 5 000 se reconectan a la vez. Sin cuidado, es la misma avalancha de 2024. Lo vemos en el tema 2.'],
      ['…ese servidor es el único?', 'Mientras reinicia, nadie ve su lote avanzar. Necesitamos varios servidores: tema 4.'],
      ['…un servidor está lento porque tiene muchas conexiones?', 'Que su health check diga “ocupado” y no “roto”, y que el balanceador le mande menos conexiones nuevas.'],
    ]} cierre="la caída de Microsoft no fue de WebSockets, pero las conexiones largas sufren exactamente los mismos dominós." />,
  ] },

  { id: 'a1', titulo: 'Actividad 1', kind: 'act', slides: [
    <Actividad key="a" id="a1" como="El efecto dominó, qué medidas ayudan y qué es una tormenta de reintentos." />,
    ...preguntas('a1'),
  ] },

  /* ───────────── TEMA 2 · VIDA DE UNA CONEXIÓN ───────────── */
  { id: 't2', tema: 't2', slides: [
    <Portada key="p" tema="t2" pregunta="Una conexión WebSocket vive horas. ¿Cómo sabe el navegador que sigue viva, y qué hace cuando se corta?" />,
    <>
      <T tema="t2" eti="Repaso rápido">Cuatro formas de “tiempo real”</T>
      <Tabla small head={['Técnica', 'Cómo funciona', 'Quién habla', 'Cuándo usarla']} rows={[
        ['Polling', 'Pregunto cada N segundos', 'Solo el cliente pregunta', 'Datos que cambian poco'],
        ['Long polling', 'Pregunto y el servidor responde cuando hay algo', 'Cliente pregunta, servidor espera', 'Fallback cuando no hay WebSocket'],
        ['SSE', 'Una respuesta HTTP que nunca termina', 'Solo el servidor envía', 'Avisos, avance de un lote'],
        ['WebSocket', 'Un canal abierto en los dos sentidos', 'Los dos, cuando quieran', 'Chat, juegos, colaboración'],
      ]} />
      <p className="d-capstone"><b>Conexión larga = estado.</b> Eso que en REST no existía (cada petición es independiente) ahora hay que cuidarlo durante horas.</p>
    </>,
    <>
      <T tema="t2" eti="Explicador (Archify)">Conectar, mantener viva, cortarse y volver</T>
      <Arch src="vida-conexion" h={640} nota="Las cuatro fases de una conexión real" />
    </>,
    <>
      <T tema="t2" eti="readyState">Los 4 estados, y el quinto que agrega un buen cliente</T>
      <Arch src="estados-websocket" h={600} nota="Diagrama de ciclo de vida" />
    </>,
    <>
      <T tema="t2" eti="Heartbeats y timeouts">El silencio mata conexiones</T>
      <Dos r="1fr 1fr">
        <div className="d-def">
          <p>Entre el navegador y tu servidor hay <b>proxies y balanceadores</b>. Si una conexión pasa mucho tiempo sin datos, la cierran para ahorrar recursos.</p>
          <p>También existen las <b>conexiones zombi</b>: el celular se fue a un túnel, pero el servidor cree que sigue ahí.</p>
          <p className="fragment">Solución: un <b>latido</b> (ping/pong). Si no llega el pong a tiempo, se cierra y se reconecta.</p>
        </div>
        <div className="d-datos col">
          <Dato n="60 s" t="timeout de inactividad por defecto del balanceador de AWS (ALB)" c="#FF8A3D" />
          <Dato n="≈ 100 s" t="Cloudflare cierra una conexión sin tráfico" c="#FFD166" />
          <Dato n="30–50 s" t="un ping, siempre antes que el timeout más corto" c="#C6F33A" />
          <Dato n="≈ 10 s" t="esperar el pong antes de darla por muerta" c="#6EA8FF" />
        </div>
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Códigos de cierre">Cada código dice si conviene volver a intentar</T>
      <Tabla head={['Código', 'Significa', '¿Reconectar?']} rows={[
        ['1000', 'Cierre normal (por ejemplo, “Clase terminada”)', 'No, si fue a propósito'],
        ['1001', 'El otro lado se va: pestaña cerrada o servidor reiniciando', 'Sí, con backoff + jitter'],
        ['1006', 'Se cortó sin despedirse: red caída, proxy, servidor muerto', 'Sí, con backoff + jitter'],
        ['1008', 'Violación de política: token inválido, demasiados mensajes', 'No: insistir no lo arregla'],
        ['1009', 'Mensaje demasiado grande', 'No, hasta corregir el mensaje'],
        ['1011', 'Error interno del servidor', 'Sí, con más espera'],
      ]} />
    </>,
    <>
      <T tema="t2" eti="El código">Backoff exponencial + jitter, en 6 líneas</T>
      <Dos r="1.5fr 1fr">
        <Code lang="javascript" titulo="cliente.js">{`
let intento = 0;
function reconectar() {
  const tope = Math.min(30000, 1000 * 2 ** intento); // 1, 2, 4… 30 s
  const espera = Math.random() * tope;             // jitter
  intento++;
  setTimeout(abrir, espera);
}
socket.onopen = () => { intento = 0; };
socket.onclose = (e) => {
  if (e.code === 1008 || e.code === 1000) return; // no insistas
  reconectar();
};`}</Code>
        <Lista items={[
          <><b>Exponencial:</b> cada fallo espera el doble, para no golpear a un servidor débil.</>,
          <><b>Tope:</b> nunca más de 30 s, para que el usuario no espere eternamente.</>,
          <><b>Jitter:</b> cada navegador espera un tiempo distinto. Sin esto, todos vuelven juntos.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t2" eti="Simulador · tormenta de reconexión" sub="Se reinicia el servidor y 1 000 navegadores se desconectan. ¿Cuál estrategia los regresa más rápido?">Tres estrategias, el mismo servidor</T>
      <Tormenta />
    </>,
    <YPixPro key="y" tema="t2" items={[
      ['…revisamos el cliente de la semana 7?', 'Esperaba 1, 2, 4, 8 y 10 s: backoff, pero sin jitter. Con miles de fotógrafos, volverían en oleadas. Basta con multiplicar por Math.random().'],
      ['…el fotógrafo deja la pestaña abierta toda la noche?', 'Un ping cada 30 s mantiene viva la conexión en el balanceador y detecta zombis.'],
      ['…el servidor rechaza un token vencido (1008)?', 'El cliente no reintenta solo: pide al usuario iniciar sesión otra vez.'],
    ]} cierre="la reconexión es parte del diseño, no un detalle del cliente." />,
    <Puente key="pu">Ya sabemos cómo vive una conexión. Ahora: ¿qué herramientas tenemos para programarla?</Puente>,
  ] },

  /* ───────────── TEMA 3 · API Y LIBRERÍAS ───────────── */
  { id: 't3', tema: 't3', slides: [
    <Portada key="p" tema="t3" pregunta="El navegador ya trae WebSocket. ¿Para qué existen tantas librerías?" />,
    <>
      <T tema="t3" eti="MDN · API WebSocket">Todo lo que trae el navegador, sin instalar nada</T>
      <Dos r="1.3fr 1fr">
        <Code lang="javascript" titulo="La API completa en una pantalla">{`
const socket = new WebSocket('wss://pixpro.app/ws');   // CONNECTING (0)

socket.onopen = () => socket.send(JSON.stringify({ tipo: 'hola' }));
socket.onmessage = (e) => mostrar(JSON.parse(e.data)); // MessageEvent
socket.onerror = () => console.warn('algo falló');
socket.onclose = (e) => console.log(e.code, e.reason); // CloseEvent

socket.readyState;     // 0, 1, 2 o 3
socket.bufferedAmount; // bytes que aún no salen
socket.close(1000, 'adiós');`}</Code>
        <Lista items={[
          <><b>4 eventos:</b> open, message, error, close.</>,
          <><b>2 métodos:</b> send() y close().</>,
          <>No trae <b>reconexión</b>, <b>salas</b>, <b>confirmación de entrega</b> ni <b>latidos</b> desde JavaScript.</>,
          <>Eso es lo que agregan las librerías… o lo que programas tú.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Backpressure">Cuando envías más rápido de lo que la red puede sacar</T>
      <Dos r="1fr 1fr">
        <div className="d-def">
          <p><b>Backpressure</b> es que el que recibe pueda decir “más despacio”.</p>
          <p>La API WebSocket <b>no la tiene</b>: send() nunca te frena. Los datos se acumulan en <b>bufferedAmount</b> y la memoria crece.</p>
          <p className="fragment">MDN propone <b>WebSocketStream</b> (con promesas y streams, aún no estándar) y <b>WebTransport</b> para casos exigentes.</p>
        </div>
        <Code lang="javascript" titulo="Frenar a mano">{`
const LIMITE = 1_000_000; // 1 MB pendiente

function enviarSiSePuede(datos) {
  if (socket.bufferedAmount > LIMITE) {
    // La red no da abasto: esperar o descartar
    return false;
  }
  socket.send(datos);
  return true;
}`}</Code>
      </Dos>
    </>,
    <>
      <T tema="t3" eti="Librerías (lista de MDN)">Del lado del servidor, una por cada ecosistema</T>
      <Tabla small head={['Ecosistema', 'Librería', 'Qué agrega']} rows={[
        ['Node.js', 'ws · µWebSockets', 'ws: simple y estándar. µWebSockets: muchísimas conexiones por servidor'],
        ['Node.js (y cliente)', 'Socket.IO', 'Reconexión, salas, confirmaciones y fallback a long polling. Usa su propio protocolo'],
        ['.NET', 'SignalR', 'Hubs, grupos y escala con Redis o Azure SignalR'],
        ['Go', 'Gorilla WebSocket', 'Base de proyectos como ws-hub'],
        ['Python', 'Django Channels · Flask-SocketIO', 'WebSocket dentro del framework que ya usas'],
        ['Elixir', 'Phoenix Channels', 'Canales y presencia incluidos'],
        ['Java (PixPro)', 'API del JDK / Jakarta WebSocket / Spring', 'La semana 7 lo hicimos a mano para entender el protocolo'],
      ]} />
    </>,
    <>
      <T tema="t3" eti="Cómo elegir">Cuatro preguntas antes de instalar algo</T>
      <Cards cols={2}>
        <Card t="¿El cliente lo controlas tú?" c="#6EA8FF">Socket.IO exige su cliente. Si otros se conectan con WebSocket “puro”, usa una librería estándar.</Card>
        <Card t="¿Necesitas salas y reconexión ya hechas?" c="#C6F33A">Socket.IO, SignalR o Phoenix te ahorran semanas. Pagas con menos control.</Card>
        <Card t="¿Cuántas conexiones por servidor?" c="#FF8A3D">Para cientos de miles, µWebSockets o Go. Para unos miles, cualquiera sirve.</Card>
        <Card t="¿Cómo vas a escalar?" c="#B78CFF">La librería no resuelve sola qué pasa con varios servidores. Eso es arquitectura: tema 4.</Card>
      </Cards>
    </>,
    <Puente key="pu">Con la API y una librería tenemos un servidor. Después del receso: ¿qué pasa cuando uno ya no alcanza?</Puente>,
  ] },

  { id: 'a2', titulo: 'Actividad 2', kind: 'act', slides: [
    <Actividad key="a" id="a2" como="readyState, códigos de cierre, jitter y bufferedAmount." />,
    ...preguntas('a2'),
  ] },

  { id: 'receso', titulo: 'Receso', kind: 'act', slides: [<Receso key="r" />] },

  /* ───────────── TEMA 4 · ESCALAR ───────────── */
  { id: 't4', tema: 't4', slides: [
    <Portada key="p" tema="t4" pregunta="Un servidor aguanta miles de conexiones. Cuando ya no alcanza, ¿basta con poner otro?" />,
    <>
      <T tema="t4" eti="Dos caminos">Crecer hacia arriba o hacia los lados</T>
      <Dos r="1fr 1fr">
        <Card t="Vertical: un servidor más grande" c="#FFD166">
          <p>Más CPU y memoria. Ably reporta un nodo con <b>240 000 conexiones</b> a menos de 50 ms.</p>
          <p>Pero tiene techo (memoria por conexión, descriptores de archivo) y sigue siendo <b>un solo punto de falla</b>.</p>
        </Card>
        <Card t="Horizontal: más servidores" c="#C6F33A">
          <p>Crece sin techo práctico y si uno se cae, los demás siguen.</p>
          <p className="fragment">Pero aparece un problema nuevo: <b>cada conexión vive en un solo servidor</b>. ¿Cómo le llega un mensaje a alguien conectado a otro?</p>
        </Card>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="El problema central">HTTP no tiene memoria. WebSocket sí.</T>
      <Dos r="1fr 1fr">
        <Analogia titulo="Una oficina con 3 recepcionistas">
          <p>En REST, cualquier recepcionista puede atenderte: traes tu papeleo en cada visita.</p>
          <p>En WebSocket, cada recepcionista tiene <b>su propia línea telefónica</b> con ciertos clientes. Si el recado es para Dani y Dani habla con la recepcionista 3, la 1 no puede dárselo directamente.</p>
        </Analogia>
        <Lista frag items={[
          <>Servidor <b>sin estado</b>: cualquiera atiende cualquier petición.</>,
          <>Servidor <b>con estado</b>: la conexión abierta está en la memoria de <b>uno</b>.</>,
          <>Escalar WebSockets es, sobre todo, resolver <b>cómo viaja un mensaje entre servidores</b>.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Simulador · enrutamiento" sub="Ana está en el servidor 1 y le escribe a Dani, que está en el servidor 3. Prueba las cinco opciones.">¿Cómo llega el mensaje al otro servidor?</T>
      <Enrutamiento />
    </>,
    <>
      <T tema="t4" eti="Sticky sessions">Útiles, pero no son la solución</T>
      <Dos r="1fr 1fr">
        <Card t="Lo que sí hacen" c="#C6F33A">
          <p>El balanceador manda a cada usuario <b>siempre al mismo servidor</b> (por cookie o por IP).</p>
          <p>Sirve si el servidor guarda algo en memoria, o si la librería usa long polling como respaldo (Socket.IO lo necesita).</p>
        </Card>
        <Card t="Lo que no hacen" c="#FF6B8B">
          <p>No mueven mensajes entre servidores: Ana y Dani siguen separados.</p>
          <p>Desbalancean: un servidor puede acabar con muchos más usuarios que otro.</p>
          <p className="fragment"><b>Sticky ≠ enrutamiento.</b></p>
        </Card>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Explicador (Archify)">Las tres formas de enrutar, comparadas</T>
      <Arch src="escalar-websockets" h={640} nota="Arquitectura tipo ws-hub, tabla de diseños y checklist" />
    </>,
    <>
      <T tema="t4" eti="Balanceo">Repartir conexiones no es lo mismo que repartir peticiones</T>
      <Tabla small head={['Algoritmo', 'Cómo decide', 'Con WebSocket']} rows={[
        ['Round-robin', 'Uno y uno, en turno', 'Mal: ignora que las conexiones duran horas'],
        ['Menos conexiones', 'Al que tenga menos abiertas', 'Bien: la opción por defecto razonable'],
        ['Menos carga', 'Al que use menos CPU o memoria', 'Bien, si cada conexión pesa distinto'],
        ['Hash (IP, usuario)', 'Siempre al mismo según una llave', 'Da “stickiness”, pero se desbalancea'],
        ['Dos al azar, el menor', 'Elige 2 al azar y toma el menos cargado', 'Muy bien con muchos balanceadores'],
      ]} />
      <p className="d-capstone"><b>Ojo:</b> un servidor nuevo empieza vacío. Con round-robin se queda casi vacío por horas, porque las conexiones viejas no se mueven.</p>
    </>,
    <>
      <T tema="t4" eti="Caso de código abierto · ws-hub">Separar “mantener conexiones” de “la lógica”</T>
      <Dos r="1fr 1fr">
        <Lista items={[
          <><b>Poolers WebSocket</b> en Go: solo mantienen conexiones y entregan mensajes. No saben de negocio.</>,
          <><b>Servicios de negocio</b>: deciden qué enviar y a quién, y lo publican en Redis.</>,
          <><b>Redis pub/sub</b> lleva el mensaje a todos los poolers; <b>Redis Sets</b> guardan quién está en línea.</>,
          <><b>Traefik</b> balancea, <b>Docker Swarm</b> despliega réplicas y <b>JWT</b> autentica.</>,
        ]} />
        <Card t="¿Por qué así?" c="#FF8A3D">
          <p>Puedes reiniciar o agregar poolers sin tocar la lógica, y desplegar la lógica sin cortar conexiones.</p>
          <p className="fragment">Es la misma idea de la semana 7 (un <b>servicio de notificaciones</b> aparte), llevada a varias réplicas.</p>
        </Card>
      </Dos>
    </>,
    <>
      <T tema="t4" eti="Que no se pierda nada">Cuando el usuario se desconecta a medio camino</T>
      <Cards cols={2}>
        <Card t="Al menos una vez + id" c="#C6F33A">Cada mensaje lleva un id. Si llega dos veces, el cliente ignora el repetido (deduplicar).</Card>
        <Card t="Orden con número de secuencia" c="#6EA8FF">“Imagen 41, 42, 43…”: si llega la 44 antes que la 43, el cliente espera o la pide.</Card>
        <Card t="Cursor de reanudación" c="#FFD166">Al reconectar: “ya tengo hasta la 42, mándame desde ahí”. Funciona con un log (Kafka) o guardando los últimos mensajes.</Card>
        <Card t="Outbox" c="#B78CFF">Guardar el evento en la base de datos en la misma transacción, y publicarlo después. Así no se pierde si se cae el servicio.</Card>
      </Cards>
    </>,
    <>
      <T tema="t4" eti="Bajo presión">Qué hacer cuando la carga se pasa del límite</T>
      <Cards cols={3}>
        <Card t="Backpressure" c="#6EA8FF">Si un cliente lento no lee, no acumular sin límite: descartar lo viejo (por ejemplo, solo el último avance del lote).</Card>
        <Card t="Load shedding" c="#FF6B8B">Rechazar conexiones nuevas con un error claro antes de que el servidor se ahogue. Lo que faltó en Microsoft.</Card>
        <Card t="Fallback" c="#FFD166">Si una red corporativa bloquea WebSocket, caer a SSE o long polling en vez de no funcionar.</Card>
      </Cards>
    </>,
    <>
      <T tema="t4" eti="Desplegar sin tormenta">Actualizar el servidor sin desconectar a todos a la vez</T>
      <ol className="d-pasos">
        <li><b>Drenar:</b> el servidor viejo deja de recibir conexiones nuevas (readiness = no).</li>
        <li className="fragment"><b>Cerrar por partes</b> con 1001, unos cuantos cada segundo, no todos juntos.</li>
        <li className="fragment"><b>El cliente reconecta con jitter</b> y el balanceador lo manda a un servidor nuevo.</li>
        <li className="fragment"><b>Reanudar desde el cursor</b>: el fotógrafo no pierde ningún avance.</li>
        <li className="fragment"><b>Poder pausar</b> el despliegue si algo va mal, como hizo Microsoft.</li>
      </ol>
    </>,
    <>
      <T tema="t4" eti="PixPro, rediseñado (Archify)">El servicio de notificaciones, listo para escalar</T>
      <Arch src="pixpro-escala" h={640} nota="Balanceador → 3 poolers → Redis ← notificaciones ← broker; Prometheus y sonda sintética" />
    </>,
    <YPixPro key="y" tema="t4" items={[
      ['…el broker avisa que se procesó la imagen 43 de un lote, pero el fotógrafo está en el pooler 2?', 'Notificaciones publica en Redis el canal lote/{id}; el pooler 2 lo tiene suscrito y se lo entrega.'],
      ['…el fotógrafo pierde la señal 20 s?', 'Al volver dice “tengo hasta la 42” y recibe desde la 43: no se pierde el avance.'],
      ['…llega un pico de 10 000 fotógrafos?', 'Agregamos poolers; el balanceador (menos conexiones) los llena. Si aún no alcanza, rechazo rápido y claro.'],
    ]} cierre="escalar WebSockets = poolers sin lógica + un canal entre servidores + clientes que saben volver." />,
  ] },

  { id: 'a3', titulo: 'Actividad 3', kind: 'act', slides: [
    <Actividad key="a" id="a3" como="Sticky sessions, los tres diseños de enrutamiento, balanceo y ws-hub." />,
    ...preguntas('a3'),
  ] },

  /* ───────────── TEMA 5 · ASYNCAPI ───────────── */
  { id: 't5', tema: 't5', slides: [
    <Portada key="p" tema="t5" pregunta="Con REST tenemos Swagger/OpenAPI. ¿Cómo se documenta un canal donde los mensajes van y vienen?" />,
    <>
      <T tema="t5" eti="AsyncAPI">El “OpenAPI” de los eventos</T>
      <Tabla head={['', 'OpenAPI (REST)', 'AsyncAPI (eventos)']} rows={[
        ['Describe', 'Rutas y métodos HTTP', 'Canales y mensajes'],
        ['Unidad', 'Petición → respuesta', 'Operación send o receive'],
        ['Protocolos', 'HTTP', 'WebSocket, Kafka, MQTT, AMQP…'],
        ['Para qué', 'Contrato, documentación, generar código', 'Lo mismo, para tiempo real'],
      ]} />
      <p className="d-capstone"><b>send</b> y <b>receive</b> se escriben desde el punto de vista de la aplicación que documentas: aquí, el navegador de PixPro.</p>
    </>,
    <>
      <T tema="t5" eti="AsyncAPI 3.0 · PixPro">El contrato del canal de un lote</T>
      <Dos r="1.7fr 1fr">
        <Code lang="yaml" titulo="pixpro-tiempo-real.yaml">{`
asyncapi: 3.0.0
info: { title: PixPro tiempo real, version: 1.0.0 }
servers:
  prod: { host: pixpro.app, protocol: wss }
channels:
  lote:
    address: lote/{loteId}
    messages:
      imagenProcesada: { $ref: '#/components/messages/ImagenProcesada' }
      cancelarLote: { $ref: '#/components/messages/CancelarLote' }
operations:
  recibirAvance: { action: receive, channel: { $ref: '#/channels/lote' } }
  cancelarLote: { action: send, channel: { $ref: '#/channels/lote' } }
components:
  messages:
    ImagenProcesada: { payload: { type: object } } # hechas, total
    CancelarLote: { payload: { type: object } }    # loteId`}</Code>
        <Arch src="asyncapi-pixpro" h={600} nota="Las partes del documento" />
      </Dos>
    </>,
    <>
      <T tema="t5" eti="Herramientas">Del YAML a algo útil</T>
      <Cards cols={3}>
        <Card t="Documentación" c="#B78CFF">AsyncAPI Studio o SwaggerHub generan una página navegable con canales y ejemplos.</Card>
        <Card t="Validación" c="#6EA8FF">Reglas de Spectral revisan el YAML en el pipeline: nombres, ejemplos, versiones.</Card>
        <Card t="Contrato entre equipos" c="#C6F33A">El frontend y el servicio de notificaciones acuerdan los mensajes antes de programar.</Card>
      </Cards>
      <Puente>Ya está documentado. Ahora, una vez en producción, ¿cómo sabemos que funciona?</Puente>
    </>,
  ] },

  /* ───────────── TEMA 6 · MONITOREO ───────────── */
  { id: 't6', tema: 't6', slides: [
    <Portada key="p" tema="t6" pregunta="Una conexión abierta no aparece en los logs de peticiones. ¿Cómo te enteras de que algo va mal… antes que tus usuarios?" />,
    <>
      <T tema="t6" eti="Qué medir">Siete números de un servicio WebSocket</T>
      <div className="d-ocho">
        {[['Conexiones activas', 'por servidor, en tiempo real', '#C6F33A'], ['Latencia del handshake', 'cuánto tarda en abrir', '#6EA8FF'], ['Latencia de ida y vuelta', 'ping → pong', '#5CE1E6'], ['Mensajes por segundo', 'entrada y salida', '#FFD166'],
          ['Reconexiones por minuto', 'la alarma de tormentas', '#FF6B8B'], ['Errores y timeouts', 'handshakes fallidos, 1006', '#FF8A3D'], ['Buffers pendientes', 'clientes lentos (backpressure)', '#B78CFF'], ['Sonda sintética', '¿un cliente real puede conectarse?', '#ECEEF4']].map(([t, s, c]) => (
          <div key={t} style={{ borderTopColor: c }}><span>{t}</span><p>{s}</p></div>
        ))}
      </div>
    </>,
    <>
      <T tema="t6" eti="El flujo (Archify)">De las métricas a la alerta</T>
      <Dos r="1.4fr 1fr">
        <Arch src="monitoreo" h={560} nota="Prometheus, Grafana, alertas y sonda sintética" />
        <Lista items={[
          <><b>Monitoreo sintético:</b> un robot abre un WebSocket real cada minuto, manda un ping y mide.</>,
          <><b>Prometheus + Grafana</b> para las métricas; <b>k6</b> o <b>Artillery</b> para pruebas de carga.</>,
          <><b>Wireshark</b> o DevTools para ver los frames cuando hay que depurar.</>,
        ]} />
      </Dos>
    </>,
    <>
      <T tema="t6" eti="Volvamos a Microsoft">El health check también es monitoreo</T>
      <Dos r="1fr 1fr">
        <Card t="Liveness: ¿estás vivo?" c="#C6F33A"><p>Si no responde, reiniciar. Debe ser simple y rápido.</p><p>No debe fallar solo porque el servidor está ocupado.</p></Card>
        <Card t="Readiness: ¿puedes con más?" c="#FFD166"><p>Si está saturado, dejar de mandarle conexiones <b>nuevas</b>, sin cortar las que tiene.</p><p className="fragment">Confundir estas dos fue el primer dominó del 12 de noviembre.</p></Card>
      </Dos>
    </>,
  ] },

  /* ───────────── TEMA 7 · SEGURIDAD ───────────── */
  { id: 't7', tema: 't7', slides: [
    <Portada key="p" tema="t7" pregunta="Una conexión abierta por horas es una puerta abierta por horas. ¿Qué revisa OWASP?" />,
    <>
      <T tema="t7" eti="Explicador (Archify)">Token en el primer mensaje y autorización en cada mensaje</T>
      <Arch src="seguridad-websockets" h={600} nota="Capas de protección y checklist de pruebas (OWASP)" />
    </>,
    <>
      <T tema="t7" eti="OWASP · en el servidor">Las reglas, en código</T>
      <Dos r="1.3fr 1fr">
        <Code titulo="Servidor Java (idea)">{`
// 1. Solo orígenes conocidos (lista exacta, nada de "contiene")
if (!ORIGENES.contains(origin)) cerrar(1008, "origen");

// 2. El token llega en el primer mensaje, no en la URL
Usuario u = validarToken(primerMensaje.token);
if (u == null) cerrar(1008, "token");

// 3. En cada mensaje: tamaño, ritmo y permiso
if (texto.length() > 64 * 1024) cerrar(1009, "grande");
if (!limitador.permite(u)) cerrar(1008, "demasiados");
if (!u.puedeVer(msg.loteId())) responder("prohibido");`}</Code>
        <Lista items={[
          <>Siempre <b>wss://</b> (TLS).</>,
          <><b>Revalidar</b> la sesión cada ~30 min y cerrar todo al cerrar sesión.</>,
          <>Validar cada mensaje con un <b>esquema</b>; nunca eval.</>,
          <>Logs con eventos, <b>sin</b> tokens ni datos personales.</>,
        ]} />
      </Dos>
    </>,
  ] },

  /* ───────────── ACTIVIDAD 4 + CIERRE ───────────── */
  { id: 'a4', titulo: 'Actividad 4', kind: 'act', slides: [
    <Actividad key="a" id="a4" como="AsyncAPI, monitoreo y seguridad, y el termómetro final." />,
    ...preguntas('a4'),
  ] },

  { id: 'cierre', titulo: 'Cierre', slides: [
    <>
      <T eti="Cierre">Cinco ideas para llevarse</T>
      <div className="d-ocho cinco">
        {[['Las cascadas no necesitan más tráfico', 'Basta con perder capacidad y no saber recuperarla.', '#FF6B8B'],
          ['Ocupado ≠ roto', 'Health checks honestos y rechazo rápido del exceso.', '#FFD166'],
          ['Volver con jitter', 'Reconectar al azar y respetar “no insistas”.', '#C6F33A'],
          ['Escalar = enrutar', 'Poolers sin lógica + Redis o un log entre servidores.', '#FF8A3D'],
          ['Contrato, métricas y OWASP', 'AsyncAPI, reconexiones por minuto y token fuera de la URL.', '#5CE1E6']].map(([t, s, c]) => (
          <div key={t} style={{ borderTopColor: c }}><span>{t}</span><p>{s}</p></div>
        ))}
      </div>
      <p className="d-capstone"><b>Para pensar:</b> ¿qué parte de su proyecto se caería primero si mañana tuviera 100 veces más usuarios?</p>
    </>,
    <>
      <T eti="Referencias">Para seguir aprendiendo</T>
      <ul className="d-refs">
        <li>BBC Newsround (13 nov 2026): caída de Microsoft 365 en escuelas, NHS y policía.</li>
        <li>Microsoft 365 Status: incidente MO1550821 (12–13 nov 2026) y MO941162 (nov 2024).</li>
        <li>System Design Lab: “How WebSockets Work: Build Real-Time Apps Like a Senior Engineer” (YouTube).</li>
        <li>Ably: “The challenge of scaling WebSockets”.</li>
        <li>wailbentafat/ws-hub (GitHub): poolers WebSocket en Go con Redis y Traefik.</li>
        <li>MDN Web Docs: WebSockets API, WebSocketStream y lista de librerías.</li>
        <li>Swagger blog y especificación AsyncAPI 3.0.0.</li>
        <li>Dotcom-Monitor: monitoreo de WebSockets.</li>
        <li>OWASP: WebSocket Security Cheat Sheet.</li>
      </ul>
      <p className="d-sub">Repaso: actividades en #/actividades y simuladores en #/simuladores.</p>
    </>,
  ] },
];

export const TEMA_COL = Object.fromEntries(COLS.map((c, i) => [c.tema || c.id, i]));
