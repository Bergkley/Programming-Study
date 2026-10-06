import React, { useState, lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Configuracoes = lazy(() => import('./Configuracoes'));

const ABAS_MAP = {
  Home: () => <div>Você está na aba: Home</div>,
  Dashboard: () => <Dashboard />,
  Configuracoes: () => <Configuracoes />,
};

const styles = {
  main: {
    padding: '20px',
    fontFamily: 'monospace',
  },
  title: {
    color: '#5C6AC4',
    margin: '5px 0',
  },
};


function App() {
  const [aba, setAba] = useState('Home');


  const ComponenteAtivo = ABAS_MAP[aba];


  return (
    <div style={styles.main}>
      <h1 style={styles.title}>{"=".repeat(29)}</h1>
      <h1 style={styles.title}>    React Performance Lab    </h1>
      <h1 style={styles.title}>{"=".repeat(29)}</h1>

      <div>
        {Object.keys(ABAS_MAP).map((aba) => (
          <button key={aba} onClick={() => { setAba(aba) }}> [ {aba === 'Configuracoes' ? 'Configurações' : aba} ]</button>
        ))}
      </div>

      <Suspense fallback={<div>Carregando...</div>}>
        <ComponenteAtivo />
      </Suspense>
    </div>
  )
}

export default App
