// Actividades de la Semana 8 (DS5). Sin servidor: cada estudiante responde en su celular y ve al momento si acertó.
// En la pantalla del salón el profesor proyecta la misma pregunta, da el tiempo y revela la respuesta.
// Tipos: quiz · tf · classify (tarjetas a categorías) · order (ordenar) · scale (termómetro, sin respuesta correcta).
// En "order", "o" ya viene desordenado y "a" es el orden correcto (índices de "o").

const TERMO = ['Por qué se cayó Microsoft 365', 'Reconexión con backoff y jitter', 'Escalar WebSockets a varios servidores', 'AsyncAPI, monitoreo y seguridad'];

export const ACTIVIDADES = [
  { id: 'a1', n: 1, nombre: 'Detectives de la caída', momento: 'después del caso Microsoft', min: 7, color: '#FF6B8B', preguntas: [
    { id: 'a1q0', type: 'scale', t: 30, q: 'Termómetro: ¿qué tan seguro te sientes con cada tema de hoy?', o: TERMO, lo: 'nada', hi: 'podría explicarlo' },
    { id: 'a1q1', type: 'tf', t: 15, q: 'Microsoft 365 se cayó porque de repente llegó muchísimo más tráfico que de costumbre.', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. Microsoft dijo que los servidores restantes se saturaron "sin aumento de tráfico". El tráfico era el de siempre; lo que bajó fue la capacidad, porque los servidores iban saliendo de servicio uno tras otro.' },
    { id: 'a1q2', type: 'order', t: 45, q: 'Ordena el efecto dominó tal como ocurrió',
      o: ['Los servidores que quedan reciben su carga y se saturan', 'Un cambio de red reciente despierta un problema de una actualización anterior', 'Al volver, cada servidor recibe todo el tráfico y se cae otra vez', 'Varios servidores fallan el health check y salen de servicio'],
      a: [1, 3, 0, 2], e: 'Cambio de red → fallan health checks → los demás cargan con todo y se saturan → los que vuelven se vuelven a caer. Por eso duró casi 24 horas: el sistema no lograba estabilizarse solo.' },
    { id: 'a1q3', type: 'classify', t: 60, q: '¿Cada medida ayuda a cortar la cascada o la empeora?', bins: ['Ayuda', 'Empeora'],
      o: ['Pausar los despliegues mientras dura el problema', 'Sacar de servicio a todo servidor que responda lento', 'Redistribuir el tráfico entre más servidores', 'Que todos los clientes reintenten al mismo tiempo', 'Un health check que distinga "ocupado" de "roto"', 'Regresar todos los servidores a la vez, sin capacidad suficiente'],
      a: [0, 1, 0, 1, 0, 1], e: 'Microsoft pausó despliegues, redistribuyó tráfico y cambió el método de health check. Sacar servidores lentos, reintentar todos a la vez y regresar sin capacidad son justo lo que alimenta la cascada.' },
    { id: 'a1q4', type: 'quiz', t: 25, q: 'En la caída de noviembre de 2024 Microsoft habló de "una avalancha de reintentos". ¿Cómo se llama ese patrón?',
      o: ['Tormenta de reintentos (retry storm)', 'Sticky session', 'Load shedding', 'Backpressure'],
      a: 0, e: 'Retry storm o thundering herd: miles de clientes reintentan a la vez y la carga extra impide que el servicio se recupere. Lo vamos a simular en el tema 2.' },
  ] },
  { id: 'a2', n: 2, nombre: 'Conexión bajo control', momento: 'antes del receso', min: 5, color: '#C6F33A', preguntas: [
    { id: 'a2q1', type: 'order', t: 30, q: 'Ordena los estados de readyState de un WebSocket', o: ['CLOSING', 'OPEN', 'CLOSED', 'CONNECTING'],
      a: [3, 1, 0, 2], e: 'CONNECTING (0) → OPEN (1) → CLOSING (2) → CLOSED (3). Si la red se corta, pasa de OPEN directo a CLOSED con código 1006.' },
    { id: 'a2q2', type: 'classify', t: 50, q: 'Al cerrarse la conexión, ¿el cliente debe reconectar solo?', bins: ['Reconectar', 'No reconectar'],
      o: ['1006: se cortó sin despedirse', '1008: violación de política (token inválido)', '1001: el servidor se está reiniciando', '1000 con "Clase terminada"', '1011: error interno del servidor'],
      a: [0, 1, 0, 1, 0], e: '1006, 1001 y 1011 son problemas pasajeros: se reintenta con backoff + jitter. 1008 y un 1000 intencional significan "no insistas": reintentar solo genera carga inútil.' },
    { id: 'a2q3', type: 'quiz', t: 25, q: 'Se reinicia el servidor y 1 000 navegadores se desconectan. ¿Qué estrategia los reconecta sin tumbarlo otra vez?',
      o: ['Reintentar cada 100 ms', 'Backoff exponencial igual para todos', 'Backoff exponencial con jitter (espera al azar)', 'No reconectar nunca'],
      a: 2, e: 'El jitter reparte los intentos en el tiempo. Con backoff sin jitter, todos esperan lo mismo y vuelven a llegar juntos, como una ola.' },
    { id: 'a2q4', type: 'quiz', t: 25, q: 'socket.bufferedAmount crece sin parar. ¿Qué significa?',
      o: ['El servidor envía demasiado rápido', 'Estás llamando send() más rápido de lo que la red puede sacar los datos', 'La conexión está cerrada', 'El navegador comprime los mensajes'],
      a: 1, e: 'bufferedAmount son los bytes que esperan para salir. La API WebSocket no tiene backpressure: si sigues enviando, la memoria crece. WebSocketStream y WebTransport sí la manejan.' },
  ] },
  { id: 'a3', n: 3, nombre: 'Arquitecto de escala', momento: 'después de escalar', min: 5, color: '#FF8A3D', preguntas: [
    { id: 'a3q1', type: 'tf', t: 15, q: 'Si activo sticky sessions en el balanceador, un mensaje de Ana (servidor 1) ya puede llegar a Dani (servidor 3).', o: ['Verdadero', 'Falso'],
      a: 1, e: 'Falso. Sticky solo hace que cada usuario vuelva a su mismo servidor. No mueve mensajes entre servidores: para eso hace falta pub/sub, un registro de conexiones o un log como Kafka.' },
    { id: 'a3q2', type: 'classify', t: 60, q: '¿Qué diseño de enrutamiento describe cada frase?', bins: ['Redis pub/sub', 'Registro', 'Log (Kafka)'],
      o: ['Cada mensaje llega a todos los servidores suscritos', 'Guarda "usuario → servidor" y se llama directo', 'Si Dani estaba desconectado, al volver se le reenvía desde su offset', 'El más sencillo de montar: un PUBLISH y listo', 'Hay que actualizarlo cada vez que alguien se conecta o se cae', 'Ordenado y durable: no se pierde nada'],
      a: [0, 1, 2, 0, 1, 2], e: 'Pub/sub: simple, pero reparte a todos y no guarda. Registro: menos tráfico, pero hay que mantenerlo al día. Log: durable y ordenado, a cambio de más infraestructura.' },
    { id: 'a3q3', type: 'quiz', t: 25, q: 'Las conexiones WebSocket duran horas. ¿Qué algoritmo de balanceo reparte mejor las nuevas?',
      o: ['Round-robin', 'Menos conexiones (least connections)', 'Aleatorio puro', 'Siempre al primer servidor'],
      a: 1, e: 'Round-robin cuenta peticiones, no conexiones vivas: un servidor recién agregado quedaría casi vacío. "Menos conexiones" manda cada conexión nueva al que tiene menos.' },
    { id: 'a3q4', type: 'quiz', t: 25, q: 'En el diseño de ws-hub, ¿qué hacen los poolers WebSocket?',
      o: ['Toda la lógica de negocio', 'Solo mantienen conexiones y entregan mensajes; la lógica vive en otros servicios', 'Guardan la base de datos', 'Balancean la carga entre ellos'],
      a: 1, e: 'Poolers "tontos" y sin estado de negocio: se pueden agregar o reiniciar sin tocar la lógica. Los servicios publican en Redis y el pooler correcto entrega.' },
  ] },
  { id: 'a4', n: 4, nombre: 'Listo para producción', momento: 'antes de terminar', min: 5, color: '#5CE1E6', preguntas: [
    { id: 'a4q1', type: 'quiz', t: 25, q: 'En el AsyncAPI de PixPro, el navegador recibe el avance del lote. ¿Qué "action" lleva esa operación?',
      o: ['send', 'receive', 'publish', 'get'],
      a: 1, e: 'En AsyncAPI 3.0 la acción se describe desde el punto de vista de la aplicación documentada: el navegador recibe ImagenProcesada (receive) y envía CancelarLote (send).' },
    { id: 'a4q2', type: 'classify', t: 60, q: '¿Práctica segura o insegura según OWASP?', bins: ['Segura', 'Insegura'],
      o: ['Usar wss:// en producción', 'Mandar el token en la URL: ?token=abc', 'Revisar el Origin contra una lista exacta', 'Autorizar solo al conectar y nunca más', 'Limitar a 100 mensajes por minuto por usuario', 'Guardar en el log el contenido completo de los mensajes'],
      a: [0, 1, 0, 1, 0, 1], e: 'La URL queda en logs y en el historial; el token va en el primer mensaje. La autorización se revisa en cada mensaje. Los logs registran eventos, no contenido ni datos personales.' },
    { id: 'a4q3', type: 'quiz', t: 25, q: '¿Qué métrica te habría avisado primero de una tormenta de reconexión?',
      o: ['Uso de disco', 'Frecuencia de reconexiones por minuto', 'Número de commits', 'Tamaño del bundle de JavaScript'],
      a: 1, e: 'Un pico de reconexiones (junto con más handshakes fallidos) es la señal típica. Por eso se grafica y se le pone alerta.' },
    { id: 'a4q4', type: 'scale', t: 30, q: 'Termómetro final: ¿y ahora qué tan seguro te sientes?', o: TERMO, lo: 'nada', hi: 'podría explicarlo', compare: 'a1q0' },
  ] },
];
export const ACTIVIDAD = Object.fromEntries(ACTIVIDADES.map((a) => [a.id, a]));
export const LETRAS = ['A', 'B', 'C', 'D', 'E'];
export const TIPO = { quiz: 'Quiz', tf: 'Verdadero o falso', classify: 'Clasifica', order: 'Ordena', scale: 'Termómetro' };

/** Puntaje 0..100 de una respuesta (null en el termómetro). */
export function puntaje(q, r) {
  if (q.type === 'scale') return null;
  if (r == null) return 0;
  if (q.type === 'classify') return Math.round((100 * q.a.reduce((s, b, i) => s + (r[i] === b ? 1 : 0), 0)) / q.a.length);
  if (q.type === 'order') return Array.isArray(r) && r.every((v, i) => v === q.a[i]) ? 100 : 0;
  return r === q.a ? 100 : 0;
}
