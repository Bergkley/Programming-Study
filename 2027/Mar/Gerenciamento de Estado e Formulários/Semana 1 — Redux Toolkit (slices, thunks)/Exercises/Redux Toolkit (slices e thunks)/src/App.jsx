import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useDispatch, useSelector,} from 'react-redux'
import {
  increment,
  deleteIncrement,
  incrementAmount,
  resetAllIncrement,
  incrementAfterDelay
} from './features/counter/counterSlice'

function App() {
  const count = useSelector((state) => state.value)
  const dispatch = useDispatch()

  const handleActions = (action, value) => {
    switch (action) {
      case 'increment':
        dispatch(increment())
        break

      case 'incrementAmount':
        dispatch(incrementAmount(value))
        break

      case 'deleteIncrement':
        dispatch(deleteIncrement())
        break

      case 'resetAllIncrement':
        dispatch(resetAllIncrement())
        break
      case 'incrementAfterDelay':
        dispatch(incrementAfterDelay(10))
        break

      default:
        break
    }
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>

        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>

      <div className="card">
        <button onClick={() => handleActions('increment')}>
          +1
        </button>
      </div>

      <div className="card">
        <button onClick={() => handleActions('incrementAfterDelay')}>
          +10 com delay
        </button>
      </div>

      <div className="card">
        <button onClick={() => handleActions('incrementAmount', 5)}>
          +5
        </button>
      </div>

      <div className="card">
        <button onClick={() => handleActions('deleteIncrement')}>
          -1
        </button>
      </div>

      <div className="card">
        <button onClick={() => handleActions('resetAllIncrement')}>
          Resetar
        </button>
      </div>

      <p className="read-the-docs">
        Count: {count}
      </p>
    </>
  )
}

export default App