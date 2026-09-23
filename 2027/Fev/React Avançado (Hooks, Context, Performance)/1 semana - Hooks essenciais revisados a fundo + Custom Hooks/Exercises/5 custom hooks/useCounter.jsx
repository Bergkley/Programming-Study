const useCounter = (initialValue) => {
  const [count, setCount] = useState(initialValue ?? 0)

  function increment() {
    return setCount(prev => prev + 1)
  }

  function decrement() {
    return setCount(prev => prev - 1)

  }

  function reset() {
    return setCount(0)
  }

  return {
    count,
    increment,
    decrement,
    reset
  }

}