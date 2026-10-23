import { useState } from 'react';

import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import { useUsersData } from './hooks/useUsersData';
import { useUsersMutation } from './hooks/useUsersMutation';

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { data: users = [], isLoading, error } = useUsersData();

  const {
    mutate,
    isPending: isCreating,
    isSuccess,
    error: createError,
  } = useUsersMutation();

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = Math.random();

    mutate(
      { name, email, id },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
        },
      }
    );
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>

        <div>
          <h1>Desafio React</h1>
          <p>Gerenciamento de usuários</p>
        </div>

        <button
          type="button"
          className="counter"
          onClick={() => setCount((current) => current + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Cadastrar usuário</h2>
          <p>Preencha os dados abaixo para adicionar um usuário.</p>

          <form onSubmit={handleCreateUser}>
            <div>
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite o nome"
                required
              />
            </div>

            <div>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Digite o e-mail"
                required
              />
            </div>

            <button type="submit" disabled={isCreating}>
              {isCreating ? 'Cadastrando...' : 'Cadastrar usuário'}
            </button>
          </form>

          {createError && <p role="alert">{createError.message}</p>}
          {isSuccess && <p role="status">{'Usuario Criado com sucesso'}</p>}
        </div>

        <div id="social">
          <h2>Usuários cadastrados</h2>
          <p>Lista de usuários carregados da API.</p>

          {isLoading && <p>Carregando usuários...</p>}

          {!isLoading && !error && users.length === 0 && (
            <p>Nenhum usuário encontrado.</p>
          )}

          {!isLoading && users.length > 0 && (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
