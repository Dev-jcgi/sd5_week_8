// Temas de la Semana 8 (DS5): WebSockets a escala, a partir de la caída de Microsoft 365 (12–13 nov 2026).
export const TEMAS = [
  { id: 't1', n: 1, titulo: 'Caso real: la caída de Microsoft 365', corto: 'Caso Microsoft', color: '#FF6B8B', min: 15 },
  { id: 't2', n: 2, titulo: 'La vida de una conexión WebSocket', corto: 'Vida de una conexión', color: '#C6F33A', min: 15 },
  { id: 't3', n: 3, titulo: 'La API del navegador y las librerías', corto: 'API y librerías', color: '#6EA8FF', min: 10 },
  { id: 't4', n: 4, titulo: 'Escalar WebSockets: de 1 a muchos servidores', corto: 'Escalar', color: '#FF8A3D', min: 25 },
  { id: 't5', n: 5, titulo: 'Documentar con AsyncAPI', corto: 'AsyncAPI', color: '#B78CFF', min: 7 },
  { id: 't6', n: 6, titulo: 'Monitorear conexiones en producción', corto: 'Monitoreo', color: '#FFD166', min: 6 },
  { id: 't7', n: 7, titulo: 'Seguridad según OWASP', corto: 'Seguridad', color: '#5CE1E6', min: 5 },
];
export const TEMA = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
