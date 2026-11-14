# ¿Por qué escalar WebSockets es más difícil que escalar REST? {#escalar-websockets}

Porque cada conexión **vive en un servidor concreto**: con varios servidores, un evento que entra por uno debe **llegar al servidor donde está conectado el destinatario**.

- Una conexión WebSocket guarda estado en memoria de un servidor: no se puede mandar «a cualquiera» como una petición REST.[](source:ably)
- Las sticky sessions mantienen a un cliente en el mismo servidor, pero no le avisan a otro servidor que llegó un mensaje para él.[](source:video)
- Hace falta una capa que enrute entre servidores: pub/sub, un registro de conexiones o un log.[](source:video)
- ws-hub separa los «poolers» que guardan conexiones de los servicios con la lógica y los une con Redis.[](source:wshub)

@answer scope="Escalar horizontalmente un servicio de notificaciones WebSocket"
@meta locale=es
@source ably title="Ably: The challenge of scaling WebSockets" url=https://ably.com/topic/the-challenge-of-scaling-websockets
@source video title="System Design Lab: How WebSockets Work: Build Real-Time Apps Like a Senior Engineer" url=https://www.youtube.com/watch?v=Ee2OPfmcWBQ
@source wshub title="ws-hub: Scalable, vendor-neutral WebSocket pooler (Go)" url=https://github.com/wailbentafat/ws-hub

## ¿Cómo se ve una arquitectura que escala? {#arquitectura}

@architecture id=wshub-arq title="Arquitectura tipo ws-hub"
| clientes | Navegadores | frontend |
| traefik | Traefik (balanceador) | security |
| pool1 | Pooler WS 1 | backend |
| pool2 | Pooler WS 2 | backend |
| redis | Redis pub/sub + presencia | messagebus |
| logica | Servicios de negocio | backend |
| clientes > traefik | wss:// | emphasis |
| traefik > pool1 | |
| traefik > pool2 | |
| pool1 > redis | publica | dashed |
| pool2 > redis | se suscribe | dashed |
| logica > redis | eventos | |

@steps id=arq-pasos
| p1 | Traefik (balanceador) | Reparte las conexiones nuevas entre los poolers. | wshub-arq | traefik |
| p2 | Pooler WS 1 | Solo guarda conexiones, autentica con JWT y reenvía mensajes; no tiene lógica de negocio. | wshub-arq | pool1 |
| p3 | Redis pub/sub + presencia | Lleva cada mensaje al pooler donde está el destinatario y guarda quién está conectado. | wshub-arq | redis |
| p4 | Servicios de negocio | Deciden qué mandar y a quién; nunca hablan directo con los clientes. | wshub-arq | logica |

## ¿Qué diseño de enrutamiento elijo? {#disenos}

| Diseño | Cómo llega el mensaje | Ventaja | Costo |
| --- | --- | --- | --- |
| Redis pub/sub | Se publica y todos los servidores suscritos lo reciben | Simple de montar {good:Rápido de hacer} | Si nadie escucha, el mensaje se pierde {bad:Sin durabilidad} |
| Registro de conexiones | Se pregunta dónde está el usuario y se llama a ese servidor | Menos tráfico entre servidores | Mantener el registro al día |
| Log (Kafka) | Se escribe en un log ordenado y cada servidor lee su parte | Orden y reenvío desde un offset {good:Nada se pierde} | Más infraestructura {caution:Complejo} |

## ¿Qué balanceo uso? {#balanceo}

| Algoritmo | Cuándo |
| --- | --- |
| Round-robin | Conexiones parecidas entre sí |
| Menos conexiones | Conexiones que duran mucho (lo normal en WebSockets) {good:Recomendado} |
| Menos carga (CPU, memoria) | Clientes con tráfico muy distinto |
| Hash del cliente | Cuando conviene que vuelva al mismo servidor |

## ¿Qué reviso antes de escalar? {#checklist-escala}

- [ ] El balanceador deja pasar el `Upgrade` y su timeout de inactividad es mayor que mi heartbeat.
- [ ] El estado de la conexión (usuario, salas) está fuera del servidor o se puede reconstruir.
- [ ] Hay una capa de enrutamiento entre servidores.
- [ ] Los clientes reconectan con backoff y jitter.
- [ ] Al desplegar, los servidores se vacían poco a poco para evitar una tormenta de reconexión.
