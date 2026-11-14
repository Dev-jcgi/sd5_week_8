# ¿Por qué Microsoft 365 estuvo caído casi 24 horas? {#caida-microsoft}

No fue un ataque ni más tráfico: unos servidores **fallaron su health check** y salieron de servicio, y los demás recibieron su carga hasta caer también. Fue un **efecto dominó**.

- Servidores de Exchange Online fallaron los health checks automáticos y quedaron fuera de servicio.[](source:controlplane)
- Los servidores restantes absorbieron esa carga hasta saturarse, aunque el tráfico total no subió.[](source:techradar)
- Algunos servidores volvían, recibían tráfico y dejaban de responder otra vez.[](source:controlplane)
- Microsoft lo atribuye a una mejora de capacidad de red que falló tras un cambio reciente.[](source:windowscentral)

@answer scope="Caída de Microsoft 365 · 12 y 13 de noviembre de 2026 · informe preliminar"
@meta locale=es
@source bbc title="BBC Newsround: Schools and Xbox gamers affected by Microsoft outage" url=https://www.bbc.co.uk/newsround/articles/cqjd75rmv9zeo
@source controlplane title="Control Plane: What caused the Microsoft 365 outage of November 12, 2026" url=https://controlplane.com/blog/post/microsoft-365-outage-november-2026-cause
@source techradar title="TechRadar: Microsoft outage live" url=https://www.techradar.com/news/live/outlook-outage-nov-2026
@source windowscentral title="Windows Central: Microsoft apologizes for major outage" url=https://www.windowscentral.com/microsoft/we-are-deeply-sorry-microsoft-apologizes-for-major-outage-that-knocked-outlook-teams-and-microsoft-365-offline-for-24-hours-insists-it-wasnt-ai-that-caused-it

## ¿Cómo pasó de unos servidores a todo el servicio? {#cascada}

@workflow id=cascada-flujo title="Efecto dominó por health checks"
| falla | Servidores fallan health check | external |
| fuera | Salen de servicio | backend |
| reparte | Su carga va a los demás | backend |
| satura | Los demás se saturan | backend |
| lentos | Responden lento | backend |
| falla > fuera | |
| fuera > reparte | |
| reparte > satura | |
| satura > lentos | |
| lentos > fuera | fallan también | emphasis |

@steps id=cascada-pasos
| s1 | Servidores fallan health check | Un componente que revisa la salud de los servidores los marca como enfermos. | cascada-flujo | falla |
| s2 | Salen de servicio | El balanceador deja de mandarles tráfico. | cascada-flujo | fuera |
| s3 | Su carga va a los demás | El mismo tráfico se reparte entre menos servidores. | cascada-flujo | reparte |
| s4 | Los demás se saturan | Cada uno recibe más de lo que aguanta. | cascada-flujo | satura |
| s5 | Responden lento | Un servidor saturado tarda en contestar y el health check lo confunde con uno roto. | cascada-flujo | lentos |

## ¿Cuándo pasó cada cosa? {#cronologia}

@timeline id=cronologia-caida title="Cronología (UTC)"
| lane ms | Microsoft |
| inicio | 2026-11-12T18:26:00+00:00 | Empieza el incidente en Exchange Online (Américas) | ms | alert |
| expande | 2026-11-12T21:00:00+00:00 | Se extiende a Teams, Copilot, SharePoint y otras regiones | ms | alert |
| acciones | 2026-11-13T02:00:00+00:00 | Pausan despliegues, reinician servidores, cambian el health check | ms | action |
| mejora | 2026-11-13T13:00:00+00:00 | Mejora en Norteamérica y Europa | ms | recovery |
| colas | 2026-11-13T17:06:00+00:00 | Colas de correo muy reducidas | ms | recovery |

Las horas de expansión y de las acciones son aproximadas: Microsoft no las publicó.

## ¿Qué lo habría contenido? {#lecciones}

| Práctica | Qué evita |
| --- | --- |
| Capacidad de reserva en cada zona | Que perder 2 servidores sature al resto {good:Margen} |
| Health check que distinga «ocupado» de «roto» | Sacar servidores que solo estaban lentos {good:Clave} |
| Límite de cuánta capacidad puede quitar el health check a la vez | La cascada completa |
| Rechazar el exceso rápido (load shedding) | Que un servidor saturado deje de responder |
| Reingreso gradual con capacidad suficiente | Que un servidor que vuelve reciba todo y caiga otra vez |
| Celdas independientes | Que la falla de una celda tumbe Teams, Copilot y SharePoint |

## ¿Qué revisamos en nuestro diseño? {#checklist}

- [ ] ¿Cuántos servidores podemos perder sin saturar al resto?
- [ ] ¿Nuestro health check confunde «lento» con «muerto»?
- [ ] ¿Los clientes reconectan con backoff y jitter, o todos a la vez?
- [ ] ¿Un servidor que vuelve recibe tráfico de golpe o poco a poco?
