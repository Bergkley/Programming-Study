import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export default function UserInfo() {
  const { name, age } = useContext(UserContext);

  console.log('UserInfo renderizou');

  return (
    <div>
      <h2>Informações do usuário</h2>

      <p>Nome: {name}</p>
      <p>Idade: {age}</p>
    </div>
  );
}
