/*
==========================================
EXERCÍCIOS DE HOOKS - REACT
Hooks Essenciais + Custom Hooks

Faça todos neste mesmo arquivo.

Não olhe as respostas antes de tentar. 😄

Hooks que serão praticados:

- useState
- useEffect
- useRef
- useMemo
- Custom Hooks

==========================================
*/


/*
=================================================
EXERCÍCIO 1 - Contador com useState
=================================================

Crie um componente chamado Counter.

Ele deve possuir um contador começando em 0.

Crie os seguintes botões:

+1
-1
Reset

Exemplo esperado:

Contador: 0

[ -1 ] [ +1 ] [ Reset ]

Ao clicar em +1:

Contador: 1

Ao clicar novamente:

Contador: 2

Ao clicar em -1:

Contador: 1

Ao clicar em Reset:

Contador: 0


REGRAS:

- Utilize useState.
- Não utilize variável global para armazenar o contador.
*/




/*


// ===============================================



import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  function validateNumber(value) {
    if (value > 0) {
      return `O valor ${value} é positivo`;
    } else if (value < 0) {
      return `O valor ${value} é negativo`;
    } else {
      return 'O valor é zero';
    }
  }

  return (
    <div>
      <h1>Contador</h1>

      <h2>{count}</h2>

      <button onClick={() => setCount(count + 1)}>
        +1
      </button>

      <button onClick={() => setCount(count - 1)}>
        -1
      </button>

      <button onClick={() => setCount(0)}>
        Reset
      </button>

      <h3>{validateNumber(count)}</h3>
    </div>
  );
}

export default App;




/*
=================================================
EXERCÍCIO 2 - Relógio com useEffect
=================================================

Crie um componente chamado Relogio.

Ele deve mostrar o horário atual.

Exemplo:

Horário atual:

18:30:45

O horário deve atualizar automaticamente
a cada 1 segundo.

REGRAS:

- Utilize useState.
- Utilize useEffect.
- Utilize setInterval.
- O intervalo deve ser limpo quando
  o componente for desmontado.

DICA:

Você provavelmente precisará utilizar:

setInterval()

e:

clearInterval()

O useEffect deve possuir uma função
de cleanup.

Exemplo conceitual:

useEffect(() => {

    // criar intervalo


    return () => {

        // limpar intervalo

    };

}, []);

*/


// ===============================================




/*
import React, { useState, useEffect } from 'react';

function App() {
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const idDoIntervalo = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);

    return () => {
      clearInterval(idDoIntervalo);
    };
  }, []);

  return (
    <div>
      <h1>Horário atual: {time}</h1>
    </div>
  );
}

export default App;

*/


// ===============================================







/*
=================================================
EXERCÍCIO 3 - Input com useRef
=================================================

Crie um componente chamado InputFocus.

Ele deve possuir:

- Um input para digitar o nome.
- Botão "Focar".
- Botão "Limpar".

Exemplo:

Nome:

[_____________________]

[ Focar ] [ Limpar ]


COMPORTAMENTO:

Ao clicar em "Focar":

O input deve receber foco.

Ao clicar em "Limpar":

O conteúdo do input deve ser apagado.

Depois de limpar, o input também deve
continuar com foco.


REGRAS:

- Utilize useRef.
- Não utilize document.querySelector().
- Não utilize getElementById().

DICA:

Você provavelmente precisará:

const inputRef = useRef(null);

Depois:

inputRef.current.focus();

E:

inputRef.current.value = "";

*/


// ===============================================



/*


import React, { useState, useEffect, useRef } from 'react';

function App() {
  const nameInputRef = useRef(null)

  function focus(action) {
  if (action === 'focus') {
    nameInputRef.current.focus();
    return;
  }

  if (action === 'clean') {
    nameInputRef.current.value = '';
    nameInputRef.current.focus();
    return;
  }
}


  return (
    <div>
      <input id="nameField"
        ref={nameInputRef}
        type="text"
        placeholder="Ex: João Silva"
        style={{ padding: '8px', marginRight: '10px', width: '200px' }}
      ></input>
      <button onClick={() => focus('focus')}>Focar</button>
      <button onClick={() => focus('clean')}>Limpar</button>
    </div>
  );
}

export default App;



// ===============================================







/*
=================================================
EXERCÍCIO 4 - Lista de Produtos com useMemo
=================================================

Crie uma lista de produtos:

const produtos = [
    {
        id: 1,
        nome: "Notebook",
        preco: 4000
    },
    {
        id: 2,
        nome: "Mouse",
        preco: 100
    },
    {
        id: 3,
        nome: "Teclado",
        preco: 200
    },
    {
        id: 4,
        nome: "Monitor",
        preco: 1200
    }
];


Crie um campo de pesquisa:

Pesquisar:

[_____________________]


Quando o usuário digitar:

mouse

Deve aparecer:

Mouse - R$ 100


Quando digitar:

te

Deve aparecer:

Teclado - R$ 200


REGRAS:

- Utilize useState para controlar a pesquisa.
- Utilize useMemo para memorizar a lista filtrada.
- Utilize map() para mostrar os produtos.


DICA:

A lógica será parecida com:

const produtosFiltrados = useMemo(() => {

    return produtos.filter(...);

}, [pesquisa]);


*/


// ===============================================


/*


import React, { useMemo, useState } from 'react';

const produtos = [
  { id: 1, nome: "Notebook", preco: 4000 },
  { id: 2, nome: "Mouse", preco: 100 },
  { id: 3, nome: "Teclado", preco: 200 },
  { id: 4, nome: "Monitor", preco: 1200 },
];

function App() {
  const [search, setSearch] = useState('');
  const [count, setCount] = useState(0);

  const productFiltered = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div>
      <h1>Produtos</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar..."
      />

      <ul>
        {productFiltered.map((produto) => (
          <li key={produto.id}>
            {produto.nome} - R$ {produto.preco}
          </li>
        ))}
      </ul>

      <h2>Contador: {count}</h2>

      <button onClick={() => setCount(count + 1)}>
        +
      </button>
    </div>
  );
}

export default App;



*/


// ===============================================







