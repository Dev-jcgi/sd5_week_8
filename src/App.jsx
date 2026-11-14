import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Viewer from './components/Viewer.jsx';
import Practica from './components/Practica.jsx';
import Simuladores from './components/Simuladores.jsx';

const route = () => (location.hash.split('?')[0] || '#/').replace(/^#/, '') || '/';
const NAV = [['/', 'Inicio'], ['/presentacion', 'Presentación'], ['/actividades', 'Actividades'], ['/simuladores', 'Simuladores']];

export default function App() {
  const [r, setR] = useState(route());
  useEffect(() => {
    const on = () => setR(route());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const Page = { '/presentacion': Viewer, '/actividades': Practica, '/simuladores': Simuladores }[r] || Landing;
  return (
    <>
      <header className="topbar">
        <a className="logo" href="#/"><i aria-hidden="true" />DS5 · Semana 8</a>
        <nav>{NAV.map(([h, t]) => <a key={h} href={`#${h}`} aria-current={r === h ? 'page' : undefined}>{t}</a>)}</nav>
      </header>
      <Page key={r} />
    </>
  );
}
