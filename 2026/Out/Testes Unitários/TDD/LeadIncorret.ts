import {LeadEntity} from "./LeadEntity";

export class LeadIncorret {
    public get(email:string): LeadEntity {
        throw new Error("Method not implemented.");
    }

    public getAll(): LeadEntity[] {
        throw new Error("Method not implemented.");
    }

    public add(lead: LeadEntity): LeadEntity {
        throw new Error("Method not implemented.");
    }

    public del(email: string): LeadEntity {
        throw new Error("Method not implemented.");
    }
}