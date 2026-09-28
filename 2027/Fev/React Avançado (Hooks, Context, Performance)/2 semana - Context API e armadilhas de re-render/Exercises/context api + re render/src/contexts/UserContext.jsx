import { createContext, useState, useMemo, useCallback } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [name, setName] = useState('João');
  const [age, setAge] = useState(25);

  const updateName = useCallback(newName => {
    setName(newName);
  }, []);

  const value = useMemo(() => {
    return {
      name,
      age,
      updateName,
    };
  }, [name, age, updateName]);

  console.log('UserProvider renderizou');

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
