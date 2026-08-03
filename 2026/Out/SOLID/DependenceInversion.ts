// Solid - Dependence Inversion Principle (DIP)

// problema inicial

// A classe NotificationService tem uma dependência direta para a classe EmailSender, o que viola o princípio de inversão de dependência.

class EmailSender {
    sendEmail(email: string) {
        console.log(`Sending email to ${email}`);
    }
}

class NotificationService {
    private emailSender: EmailSender = new EmailSender();

    notify(email: string) {
        this.emailSender.sendEmail(email);
    }
}

// solução : Uso de abstrações para desacoplar dependências.

interface IMessageSender {
    sendMessage(message: string): void;
}

class EmailSender2 implements IMessageSender {
    sendMessage(message: string) {
        console.log(`Sending email: ${message}`);
    }
}

class NotificationService2 {
    private messageSender: IMessageSender;

    constructor(messageSender: IMessageSender) {
        this.messageSender = messageSender;
    }

    notify(message: string) {
        this.messageSender.sendMessage(message);} 
    }