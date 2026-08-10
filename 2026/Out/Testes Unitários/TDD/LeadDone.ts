import { LeadEntity } from "./LeadEntity";

export class LeadDone {
  private db = new Array<LeadEntity>();

  public get(email: string): LeadEntity {
    let result = new LeadEntity();
    this.db.forEach((lead) => {
      if (lead.email === email) {
        result = lead;
      }
    });
    return result;
  }

  public getAll(): LeadEntity[] {
    return this.db;
  }

  public add(lead: LeadEntity): boolean {
    this.db.push(lead);
    return true;
  }

  public del(email: string): boolean {
    let result = false;
    this.db.forEach((lead, index) => {
      if (lead.email === email) {
        this.db.splice(index, 1);
        result = true;
      }
    });
    return result;
  }
}
