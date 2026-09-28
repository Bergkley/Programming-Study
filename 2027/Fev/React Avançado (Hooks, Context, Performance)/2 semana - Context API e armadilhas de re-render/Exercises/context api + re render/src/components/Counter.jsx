import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  console.log('Counter renderizou');

  return (
    <div>
      <h2>Contador</h2>

      <p>Contador: {count}</p>

      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
