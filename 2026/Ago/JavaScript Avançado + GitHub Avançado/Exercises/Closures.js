/*
==========================================
EXERCÍCIOS DE CLOSURES (JavaScript)
Faça todos neste mesmo arquivo.
Não olhe as respostas na internet antes de tentar. 😄
==========================================
*/

/*
=================================================
EXERCÍCIO 1 - Contador
=================================================

Crie uma função chamada criarContador().

Ela deve retornar outra função.

Cada vez que a função retornada for chamada,
o contador aumenta em 1.

Exemplo esperado:

const contador = criarContador();

contador(); // 1
contador(); // 2
contador(); // 3
*/





// ===============================================

function criarContador() {
    let contador = 0
    return function() {
        contador++
        console.log('contador', contador)
    }

}

const contador = criarContador();

contador()
contador()
contador()



/*
=================================================
EXERCÍCIO 2 - Soma Acumulada
=================================================

Crie uma função criarSomador().

Ela retorna uma função que recebe um número.

Cada número recebido deve ser somado ao total.

Exemplo:

const soma = criarSomador();

soma(10); // 10
soma(5);  // 15
soma(20); // 35
*/





// ===============================================


function criarSomador() {
    let total = 0;

    return function (valor) {
        total += valor;
        return total;
    };
}

const soma = criarSomador();


/*
=================================================
EXERCÍCIO 3 - Nome Privado
=================================================

Crie uma função criarPessoa(nome).

Ela deve retornar um objeto com:

- getNome()
- setNome(novoNome)

O nome NÃO pode ficar acessível diretamente.

Exemplo:

const pessoa = criarPessoa("João");

pessoa.getNome(); // João

pessoa.setNome("Maria");

pessoa.getNome(); // Maria

pessoa.nome // undefined
*/





// ===============================================

function createPeople(name) {
    let newName = name
   return {
    getName() {
        return newName
    },
    setName(name){
        newName = name
    }
   }
}

const pessoa = createPeople("João");

pessoa.getName(); 
console.log('nome inicial', pessoa.getName())

pessoa.setName("Maria");

pessoa.getName(); 
console.log('nome final', pessoa.getName())
console.log('pessoa.nome',pessoa.nome)



/*
=================================================
EXERCÍCIO 4 - Multiplicador
=================================================

Crie uma função multiplicador(numero).

Ela retorna outra função.

Essa nova função recebe um valor e retorna
valor * numero.

Exemplo:

const dobro = multiplicador(2);

dobro(5); // 10

const triplo = multiplicador(3);

triplo(10); // 30
*/




// ===============================================

function Multiplier(num) {
    let result = 0
    return function (value) {
        return result += num * value 
    }
  
}

const double = Multiplier(2);
console.log('double', double(5))

const triple = Multiplier(3);
console.log('triple', triple(10))



/*
=================================================
EXERCÍCIO 5 - Limite de Chamadas
=================================================

Crie uma função limitarChamadas(fn, limite).

A função retornada só pode executar fn
até atingir o limite.

Depois disso, ela retorna:

"Limite atingido"

Exemplo:

const ola = limitarChamadas(() => "Olá!", 2);

ola(); // Olá!
ola(); // Olá!
ola(); // Limite atingido
ola(); // Limite atingido
*/




// ===============================================

function limitCalls(fn, limit) {
    let count = 0
    return function () {
        if (count < limit) {
            count++
            return fn()
        } else {
            return 'Limit Reached'
        }

    }
}

const hello = limitCalls(() => "hello!", 2);

console.log('chamada 1', hello())
console.log('chamada 2', hello())
console.log('chamada 3', hello())
console.log('chamada 4', hello())


/*
=================================================
EXERCÍCIO 6 - Histórico
=================================================

Crie uma função criarHistorico().

Ela retorna um objeto com:

adicionar(valor)

listar()

Os valores adicionados ficam privados.

Exemplo:

const h = criarHistorico();

h.adicionar("A");
h.adicionar("B");

h.listar();

["A", "B"]
*/




// ===============================================


function createHistory() {
    let result = []
    return {
        add(value) {
            return result.push(value)
        },
        list() {
            return result
        },
    }
}

const h = createHistory();

h.add("A");
h.add("B");

console.log('listar', h.list())


/*
=================================================
EXERCÍCIO 7 - Banco Simples
=================================================

Crie uma função criarConta(saldoInicial).

Ela retorna um objeto com:

depositar(valor)

sacar(valor)

saldo()

Regras:

- Não pode sacar mais do que possui.
- O saldo deve ficar privado.

Exemplo:

const conta = criarConta(100);

conta.depositar(50);

conta.saldo(); //150

conta.sacar(80);

conta.saldo(); //70
*/




// ===============================================

function createAccount(balanceInit) {
    let balance = balanceInit
   return {
    deposit(value){
        balance += value
    },
    withdraw(value){
        if(value > balance){
            return 'insufficient funds'
        } else {
            balance -= value
        }
    },
    balance(){
       return console.log('balance', balance) 
    }
   }
}

const account = createAccount(100)

account.deposit(50)

account.balance()

account.withdraw(80)

account.balance()




/*
=================================================
EXERCÍCIO 8 - Cache
=================================================

Crie uma função cache(fn).

Quando a função receber um argumento
já utilizado anteriormente, ela deve
retornar o valor armazenado em cache,
sem executar fn novamente.

Exemplo:

const quadrado = cache(n => {
    console.log("Calculando...");
    return n*n;
});

quadrado(5);

Calculando...
25

quadrado(5);

25

(não deve imprimir "Calculando...")
*/




// ===============================================

function cache(fn) {
    let memory = {}

    return function (value) {
        if (value in memory) {
            return memory[value] 
        }
        const result = fn(value)
        memory[value] = result
        return result

    }

}

const quadrado = cache(n => {
    console.log("Calculando...");
    return n * n;
});

console.log('primeiro', quadrado(5))
console.log('segundo', quadrado(5))


/*
=================================================
EXERCÍCIO 9 - Gerador de IDs
=================================================

Crie uma função criarGeradorID().

Ela gera IDs sequenciais.

Exemplo:

const id = criarGeradorID();

id(); //1
id(); //2
id(); //3
*/




// ===============================================


function createGeneratorID(){
    let result = 0;

    return function (){
       return console.log('result',  ++result)
    }
}

const id = createGeneratorID();
id(); 
id(); 
id(); 

/*
=================================================
EXERCÍCIO 10 - Cronômetro
=================================================

Crie uma função cronometro().

Ela retorna um objeto com:

iniciar()

parar()

tempo()

Cada chamada de iniciar()
incrementa o tempo em 1.

Exemplo:

const c = cronometro();

c.iniciar();

c.iniciar();

c.tempo(); //2

c.parar();

c.tempo(); //0
*/




// ===============================================

function stopwatch() {
    let Time= 0
    return {
        init() {
            Time +=1
        },
        stop() {
            Time = 0
        },
        time() {
            return console.log('tempo:', Time)
        }

    }
}

const c = stopwatch();

c.init();

c.init();

c.time(); 

c.stop();

c.time(); 






/*
=================================================
EXERCÍCIO 11 - Login
=================================================

Crie uma função criarLogin(usuario, senha).

Ela retorna uma função.

Essa função recebe usuário e senha.

Retorna true se estiver correto,
false caso contrário.

Os dados ficam privados.
*/




// ===============================================

function createLogin(usr, password) {
    return function(usrLogin, passwordLogin) {
        return usrLogin === usr && passwordLogin === password;
    };
}

const login = createLogin("admin", "1234");

console.log(login("admin", "1234")); 
console.log(login("admin", "1111"));
console.log(login("joao", "1234"));  


/*
=================================================
EXERCÍCIO 12 - Contador Reverso
=================================================

Crie uma função contadorReverso(inicio).

Cada chamada diminui 1.

Exemplo:

const c = contadorReverso(5);

c(); //5
c(); //4
c(); //3
*/




// ===============================================

function ReverseCounter(init) {
    return function() {
        return console.log('result:', init-- )
    };
}

const c = ReverseCounter(5);

c(); 
c(); 
c(); 


/*
=================================================
EXERCÍCIO 13 - Fábrica de Mensagens
=================================================

Crie uma função criarMensagem(texto).

Ela retorna uma função que recebe um nome.

Exemplo:

const ola = criarMensagem("Olá");

ola("Lucas");

Resultado:

"Olá Lucas"
*/




// ===============================================

function createMessage(text) {
    return function(name) {
        return console.log(`${text} ${name}`)
    };
}

const hello = createMessage("Hello");

hello("Lucas");


/*
=================================================
EXERCÍCIO 14 - Cofre
=================================================

Crie uma função criarCofre(senha).

Ela retorna um objeto com:

abrir(senha)

guardar(valor)

ver()

Só é possível guardar ou ver os valores
após abrir corretamente.

Os valores ficam privados.
*/




// ===============================================

function createSafe(password) {
    let savePassowrd= password
    let balance = 0
    return {
        open(ConfirmPassword) {
            if (ConfirmPassword === savePassowrd) return true
            return false
        },
        save(value) {
            if(this.open(savePassowrd)){
                balance += value
            } else {
                return 'Acess Negado'
            }
        },
        see() {
           if(this.open(savePassowrd)){
                return console.log(balance)
            } 
        },
    }
}


const safeBerg = createSafe('123456')

safeBerg.save(10)
safeBerg.see()


/*
=================================================
EXERCÍCIO 15 - Desafio Final
=================================================

Crie uma função criarLoja().

Ela deve possuir dados privados.

Retorne um objeto com:

adicionarProduto(nome, preco)

listarProdutos()

valorTotal()

removerProduto(nome)

Todos os produtos devem ficar privados.

Exemplo:

const loja = criarLoja();

loja.adicionarProduto("Mouse", 100);

loja.adicionarProduto("Teclado", 200);

loja.valorTotal();

300
*/




// ===============================================


function createStore() {
    let products = []
    return {
        addProducts(name, price) {
            products.push({ name, price });

        },
        listProducts() {
            return products
        },
        totalValue() {
            return products.reduce((total, produto) => {
                return total + produto.price
            }, 0)
        },
        removeProduct(name) {
            products = products.filter((product) => {
                return product.name !== name;
            });

        },


    }
}

const store = createStore();

store.addProducts("Mouse", 100);
store.addProducts("Teclado", 200);

console.log(store.listProducts());
console.log(store.totalValue());

store.removeProduct("Mouse");


console.log(store.totalValue());

/*
=================================================
DESAFIO EXTRA 1
=================================================

Implemente once(fn).

A função retornada só executa fn
uma única vez.

Depois retorna sempre o mesmo resultado.

Exemplo:

const soma = once(() => Math.random());

soma(); //0.123

soma(); //0.123

soma(); //0.123
*/




// ===============================================




/*
=================================================
DESAFIO EXTRA 2
=================================================

Implemente memoize(fn).

Ela funciona como cache,
mas aceita vários argumentos.

Exemplo:

const soma = memoize((a,b)=>a+b);

soma(1,2);

(calcula)

soma(1,2);

(cache)

soma(3,4);

(calcula)
*/




// ===============================================




/*
=================================================
DESAFIO EXTRA 3 (NÍVEL DIFÍCIL)
=================================================

Implemente um EventEmitter usando closures.

Métodos:

on(evento, callback)

emit(evento, dados)

off(evento, callback)

Tudo deve ficar privado.

Exemplo:

const eventos = criarEventEmitter();

eventos.on("login", usuario => {
    console.log(usuario);
});

eventos.emit("login", "Lucas");
*/




// ===============================================




/*
=================================================
DESAFIO EXTRA 4 (NÍVEL MUITO DIFÍCIL)
=================================================

Implemente um sistema de carrinho usando apenas
closures.

Métodos:

adicionar(nome, preco)

remover(nome)

listar()

total()

limpar()

Nenhuma variável do carrinho pode ficar acessível
fora da função.
*/




// ===============================================




/*
=================================================
BÔNUS
=================================================

Explique com suas palavras:

1. O que é uma closure?

2. Por que closures conseguem "lembrar"
   de variáveis mesmo após a função terminar?

3. Quais as vantagens de usar closures?

4. Cite 3 exemplos reais onde closures são usadas.

5. Qual a diferença entre variável global,
   local e privada usando closure?
=================================================
*/