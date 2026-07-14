// Closures

function bank (initValue){ 
    let balance = initValue;

    return {
        deposit(value){
            balance += value;
        },
        withdraw(value){
            if(value <= balance){
                balance -= value;
            } else {
                console.log("Saldo insuficiente!");
            }
        },
        getBalance(valu){
            return `R$ ${balance}`;
        }
    }
}

const bankAccount = bank(100);
bankAccount.deposit(50);
bankAccount.withdraw(20);
console.log(bankAccount.getBalance());