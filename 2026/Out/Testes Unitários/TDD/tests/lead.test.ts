import { LeadEntity } from "../LeadEntity";
import { LeadDone } from "../LeadDone";
import { LeadIncorret } from './../LeadIncorret';
import { LeadCorrect } from './../LeadCorrect';

describe("Lead", () => {
    //   let tested: LeadIncorret;
    //   let tested: LeadCorrect;
      let tested: LeadDone;

  beforeEach(() => {
    // tested = new LeadIncorret();
    // tested = new LeadCorrect();
    tested = new LeadDone();
  });

  function createLead(): LeadEntity {
    const lead = new LeadEntity();
    lead.id = "1";
    lead.name = "John Doe";
    lead.email = "3M4ZC@example.com";
    lead.telephone = "123456789";
    return lead;
  }

  it("Add one lead", () => {
    const result = tested.add(createLead());
    expect(result).toBeTruthy();
  });

  it("Get one lead", () => {
    tested.add(createLead());

    const result = tested.get("3M4ZC@example.com");

    expect(result).toBeInstanceOf(LeadEntity);
    expect(result.name).toEqual("John Doe");
    expect(result.email).toEqual("3M4ZC@example.com");
    expect(result.telephone).toEqual("123456789");
  });

  it("Get all leads", () => {
    tested.add(createLead());

    const result = tested.getAll();

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it("Delete one lead", () => {
    tested.add(createLead());

    const result = tested.del("3M4ZC@example.com");

    expect(result).toBeTruthy();
  });
});
