import {LeadEntity} from "./LeadEntity";

export class LeadCorrect {

    public get(email:string): LeadEntity {
       let fake = new LeadEntity()
       fake.id = "1"
       fake.name = "John Doe"
       fake.email = "3M4ZC@example.com"
       fake.telephone = "123456789"

       return fake
    }

    public getAll(): LeadEntity[] {
        let fake = new Array<LeadEntity>()
        fake.push(new LeadEntity())
        return fake
    }

    public add(lead: LeadEntity): boolean {
        return true
    }

    public del(email: string): boolean {
        return true
    }
}