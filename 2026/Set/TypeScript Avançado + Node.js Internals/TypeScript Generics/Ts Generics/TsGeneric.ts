// T = type
// E = element
// K = key
// V = value
// S = state

function usestate<T extends string | number = string>() {
    let state:T

   function get() {
    return console.log(state)
   }

   function setValue(newValue:T) {
    state = newValue
   }

   return {get,setValue}
}

let newState = usestate<number>()
newState.setValue(10)
newState.get()


// generic em interface

interface ApiResponse<T> {
  sucesso: boolean;
  dados: T;
}

interface Usuario {
  id: number;
  nome: string;
}

const resposta: ApiResponse<Usuario> = {
  sucesso: true,
  dados: {
    id: 1,
    nome: "João",
  },
};