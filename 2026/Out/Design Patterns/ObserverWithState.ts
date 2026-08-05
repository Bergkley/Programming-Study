// Design Pattern: Observer + State em TypeScript

interface IObserver2 {
    update(data: string): void;
}

interface ISubject2 {
    subscribe(observer: IObserver2): void;
    unsubscribe(observer: IObserver2): void;
    notify(msg: string): void;
    setState(state: string): void;
}

class Subject2 implements ISubject2 {
    private observers: IObserver2[] = [];
    private state: string;

    constructor(private name: string) {
        this.state = "out of stock";
    }

    subscribe(observer: IObserver2): void {
        this.observers.push(observer);
    }

    unsubscribe(observer: IObserver2): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(msg: string): void {
        this.observers.forEach(observer => observer.update(msg));
    }

    setState(state: string): void {
        this.state = state;
        this.notify(`${this.name} state changed to: ${this.state}`);
    }
}

class Observer2 implements IObserver2 {
    constructor(private id: string) {}

    update(data: string): void {
        console.log(`[${this.id}] ${data}`);
    }
}


const subject2 = new Subject2("Product 1");

const observer3 = new Observer2("Observer 1");
const observer4 = new Observer2("Observer 2");

subject2.subscribe(observer3);
subject2.subscribe(observer4);

subject2.setState("In Stock");
subject2.setState("Sold Out");

subject2.unsubscribe(observer3);

subject2.setState("Available");