import React from 'react';
import { useState, Suspense } from 'react'
import Loading from './Loading.jsx';


const Users = React.lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(import('./Users.jsx'));
    }, 2000);
  });
});


function App() {


  const [active, setActive] = useState(false)
  const [count, setCount] = useState(0)

  const styles = {
    main: {
      padding: '20px',
    },
    title: {
      color: '#5C6AC4'
    },
  };

  return (
    <div style={styles.main}>
      <h1 style={styles.title}>Hello, World!</h1>
      <div>
        <button onClick={() => setActive((prev) => !prev)}>
          mostrar os usuarios
        </button>
        <button onClick={() => setCount((prev) => prev + 1)}>
          contagem: {count}
        </button>
      </div>
      {active === true ? (
        <Suspense fallback={<Loading> </Loading>}>
          <Users> </Users>
        </Suspense>)
        : null}

    </div>
  )
}

export default App
