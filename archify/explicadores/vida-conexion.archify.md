# ¿Por qué se cae una conexión WebSocket que «no hace nada»? {#vida-conexion}

Porque los **proxys y balanceadores cierran las conexiones inactivas**: un heartbeat (ping/pong) más frecuente que su timeout la mantiene viva, y si aun así se cae, el cliente **reconecta con backoff y jitter**.

- Un balanceador de AWS cierra una conexión sin tráfico a los 60 segundos por defecto.[](source:ably)
- Un ping cada 30 a 60 segundos, con un pong esperado en unos 10 segundos, detecta conexiones muertas.[](source:dotcom)
- Si la conexión se cae, reintentar con espera creciente y al azar evita una tormenta de reconexión.[](source:ably)

@answer scope="Conexión WebSocket detrás de un balanceador o CDN"
@meta locale=es
@source ably title="Ably: The challenge of scaling WebSockets" url=https://ably.com/topic/the-challenge-of-scaling-websockets
@source dotcom title="Dotcom-Monitor: WebSocket monitoring" url=https://www.dotcom-monitor.com/blog/websocket-monitoring/
@source rfc6455 title="RFC 6455: The WebSocket Protocol" url=https://datatracker.ietf.org/doc/html/rfc6455

## ¿Qué pasa en la vida de una conexión? {#ciclo}

@sequence id=ciclo-conexion title="Vida de una conexión con heartbeat y reconexión"
| actor nav | Navegador | frontend |
| actor lb | Balanceador | security |
| actor ws | Servidor WS | backend |
| phase | Conectar |
| nav | ws | GET + Upgrade: websocket |
| ws | nav | 101 Switching Protocols | return |
| phase | Mantener viva |
| ws | nav | ping (cada 30 s) |
| nav | ws | pong | return |
| phase | Se corta |
| lb | nav | cierra por inactividad (1006) | emphasis |
| phase | Volver |
| nav | ws | reintenta tras backoff + jitter |
| ws | nav | 101 + estado actual | return |

@steps id=ciclo-pasos
| c1 | Navegador | Abre la conexión con un GET especial y recibe 101. | ciclo-conexion | nav |
| c2 | Servidor WS | Manda un ping periódico; si no recibe pong a tiempo, cierra la conexión. | ciclo-conexion | ws |
| c3 | Balanceador | Si no ve tráfico durante su timeout, corta la conexión sin despedirse: el navegador ve 1006. | ciclo-conexion | lb |

## ¿Qué números importan? {#numeros}

@facts
| Timeout de inactividad de AWS ALB | 60 s por defecto, configurable hasta 4 000 s |
| Timeout de Cloudflare (medido por terceros) | Unos 100 s |
| Heartbeat recomendado | Ping cada 30 a 60 s |
| Espera del pong | Unos 10 s |

## ¿Cómo reconecta un buen cliente? {#reconexion}

```javascript title="Backoff exponencial con jitter (full jitter)"
let intento = 0;
function reconectar() {
  const tope = Math.min(30000, 1000 * 2 ** intento); // 1 s, 2 s, 4 s… máximo 30 s
  const espera = Math.random() * tope;               // jitter: al azar entre 0 y el tope
  intento++;
  setTimeout(conectar, espera);
}
```

| Estrategia | Resultado con 1 000 clientes |
| --- | --- |
| Reintento inmediato | Todos golpean a la vez y el servidor nunca se recupera {bad:Tormenta} |
| Backoff sin jitter | Los reintentos llegan en olas sincronizadas {caution:Olas} |
| Backoff con jitter | Los reintentos se reparten en el tiempo {good:Recomendado} |
