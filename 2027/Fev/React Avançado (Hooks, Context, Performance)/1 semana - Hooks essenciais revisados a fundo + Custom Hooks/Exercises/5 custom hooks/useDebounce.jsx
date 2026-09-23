
const useDebounce = (search, time) => {
  const [value, setValue] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      return setValue(search);
    }, time);

    return () => clearTimeout(timer);
  }, [search, time]);


  return value
}