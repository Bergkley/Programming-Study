const useLocalStorage = (key, initializedValue) => {
  const [value, setValue] = useState(() => {
    const valueSaved = localStorage.getItem(key)

    if (valueSaved) {
      return JSON.parse(valueSaved)
    }

    return initializedValue
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  function cleanLocalStorage() {
    localStorage.removeItem(key)
    setValue(initializedValue)
  }

  return [value, setValue, cleanLocalStorage]
}
