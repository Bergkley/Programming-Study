import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export default function UserActions() {
  const { updateName } = useContext(UserContext);

  console.log('UserActions renderizou');

  function handleChangeName() {
    updateName('Maria');
  }

  return (
    <div>
      <button onClick={handleChangeName}>Alterar nome</button>
    </div>
  );
}
