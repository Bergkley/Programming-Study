const useToggle = (initializedValue) => {
  const [value, setValue] = useState(initializedValue ?? false)

  function toggle() {
    setValue(prev => !prev)
  }

  function setTrue() {
    setValue(prev => true)
  }

  function setFalse() {
    setValue(prev => false)
  }

  return {
    value,
    toggle,
    setTrue,
    setFalse
  }
}
