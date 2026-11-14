# ¿Qué le falta a un servidor WebSocket para ser seguro en producción? {#seguridad-websockets}

Además de `wss://` y el `Origin`, hay que autenticar con el primer mensaje, **autorizar cada mensaje**, poner límites y registrar sin guardar secretos.

- WebSocket no trae autenticación propia: el servidor debe verificar quién es el cliente.[](source:owasp)
- Revisar permisos al conectar no basta: cada acción se autoriza en cada mensaje.[](source:owasp)
- Cada mensaje es un dato no confiable: se valida con un esquema y un tamaño máximo.[](source:owasp)

@answer scope="Recomendaciones de la OWASP WebSocket Security Cheat Sheet"
@meta locale=es
@source owasp title="OWASP WebSocket Security Cheat Sheet" url=https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html

## ¿Cómo se autentica sin poner el token en la URL? {#auth}

@sequence id=auth-flujo title="Autenticación con el primer mensaje"
| actor nav | Navegador | frontend |
| actor ws | Servidor WS | backend |
| nav | ws | GET + Upgrade (Origin revisado) |
| ws | nav | 101 Switching Protocols | return |
| nav | ws | {"tipo":"auth","token":"…"} | security |
| ws | nav | auth ok · o cierre 1008 | return |
| nav | ws | {"tipo":"seguir","lote":"L-1042"} |
| ws | nav | ¿es su lote? sí → eventos | return |

@steps id=auth-pasos
| a1 | Navegador | Abre la conexión; el servidor revisa el Origin contra una lista exacta. | auth-flujo | nav |
| a2 | Servidor WS | Solo acepta el mensaje de autenticación; si no llega a tiempo o es inválido, cierra. | auth-flujo | ws |

## ¿Qué cubre cada capa? {#capas}

| Capa | Recomendación |
| --- | --- |
| Transporte | Solo `wss://`; desactivar compresión (`permessage-deflate`) si no hace falta |
| Origin | Lista exacta, sin comodines ni coincidencias parciales |
| Autenticación | Token en el primer mensaje, no en la URL; nunca en los logs |
| Autorización | Revisar permisos en cada mensaje, no solo al conectar {good:Clave} |
| Sesión | Revalidar cada ~30 min; al cerrar sesión, cerrar todas sus conexiones |
| Entrada | Esquema y lista de permitidos; tamaño ≤ 64 KB; nunca `eval()` |
| Límites | Mensajes por minuto, conexiones por usuario o IP, timeouts de inactividad |
| Registros | Conexión, cierre, fallos de auth y límites; sin contenido, tokens ni datos personales |

## ¿Qué pruebo? {#pruebas-seguridad}

- [ ] Conectar desde un Origin no permitido.
- [ ] Conectar y enviar mensajes sin token válido.
- [ ] Pedir el lote de otra agencia.
- [ ] Mandar mensajes gigantes y ráfagas.
- [ ] Cerrar sesión y comprobar que se cierran las conexiones.
