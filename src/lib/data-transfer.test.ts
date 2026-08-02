import {describe,expect,it} from "vitest";
import {parseTransferSnapshot,transferCounts} from "./data-transfer";

const valid={schema_version:1 as const,semesters:[{id:"term-1",year:2026,term:"1",term_no:1,is_complete:false,courses:[{id:"course-1",name:"Calculus",grade:"A" as const,credit:3,type:"ACTUAL" as const,category:"MAJOR_REQUIRED" as const}]}],goals:[{name:"Dean list",target_gpa:3.5,is_achieved:false,target_semester_id:"term-1"}]};

describe("guest transfer schema",()=>{
  it("accepts schema version 1 and counts records",()=>{const snapshot=parseTransferSnapshot(valid);expect(transferCounts(snapshot)).toEqual({semesters:1,courses:1,goals:1});});
  it("rejects unsupported schema versions",()=>{expect(()=>parseTransferSnapshot({...valid,schema_version:2})).toThrow();});
  it("rejects invalid GPA values",()=>{expect(()=>parseTransferSnapshot({...valid,goals:[{...valid.goals[0],target_gpa:4.1}]})).toThrow();});
});
