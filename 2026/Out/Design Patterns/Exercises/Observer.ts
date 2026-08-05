/* ==========================================================
   EXERCÍCIO 01 - OBSERVER 
   ==========================================================

Sistema de Notificações.

Requisitos:

✔ Criar um Subject (Canal de Notícias).

✔ Criar Observers (Inscritos).

Cada inscrito deve receber automaticamente
as novas notícias publicadas.

Objetivos:

✔ Aplicar Observer
✔ Utilizar Interfaces
✔ Permitir adicionar/remover inscritos
✔ Evitar acoplamento entre Subject e Observers

Bônus:

Exiba o nome do inscrito e a notícia recebida.

*/

// Sua solução aqui...

// observer
interface IRegistered {
    update(data: string): void;
}

interface INewsChannel {
    subscribe(observer: IRegistered): void;
    unsubscribe(observer: IRegistered): void;
    notify(notice: string): void;
    setNewNotice(notice: string): void;
}

class NewsChannel implements INewsChannel {
    private observers: IRegistered[] = [];
    private notice = "";

    subscribe(observer: IRegistered): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: IRegistered): void {
        this.observers = this.observers.filter(o => o !== observer);
    }

    notify(notice: string): void {
        this.observers.forEach(observer => observer.update(notice));
    }

    setNewNotice(notice: string): void {
        this.notice = notice;
        this.notify(this.notice);
    }
}

class Registered implements IRegistered {
    constructor(private readonly name: string) {}

    update(data: string): void {
        console.log(`[${this.name}] recebeu a notícia: ${data}`);
    }
}

const newsChannel = new NewsChannel();

const berg = new Registered("Berg");
const joao = new Registered("João");

newsChannel.subscribe(berg);
newsChannel.subscribe(joao);

newsChannel.setNewNotice("Novo jogador contratado pelo Real Madrid!");

newsChannel.unsubscribe(joao);

newsChannel.setNewNotice("Real Madrid venceu por 3x0!");

