import React from 'react';

function Users() {
  const users = ['João', 'Maria', 'Carlos', 'Ana'];

  return (
    <div>
      <h2>Usuários</h2>

      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>


  );
}

export default Users;