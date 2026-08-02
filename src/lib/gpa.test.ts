import {describe,expect,it} from "vitest";
import {calculateGpa,cumulativeGpa} from "./gpa";
import type {Course,Semester} from "./types";

function course(id:string,grade:Course["grade"],credit:number,type:Course["type"]):Course{return {id,name:id,category:"MAJOR_REQUIRED",grade,grade_point:0,credit,type,semester_id:"semester"};}

describe("GPA calculations",()=>{
  it("excludes planned grades from actual GPA",()=>{
    const courses=[course("actual","A",3,"ACTUAL"),course("plan","F",3,"PLAN")];
    expect(calculateGpa(courses)).toEqual({gpa:4,credits:3});
    expect(calculateGpa(courses,true)).toEqual({gpa:2,credits:6});
  });

  it("weights cumulative GPA by credits across semesters",()=>{
    const semesters=[
      {id:"one",year:2026,term:"1",term_no:1,is_complete:true,courses:[course("a","A",3,"ACTUAL")],gpas:[]},
      {id:"two",year:2026,term:"2",term_no:2,is_complete:false,courses:[course("b","B",1,"ACTUAL")],gpas:[]},
    ] satisfies Semester[];
    expect(cumulativeGpa(semesters)).toEqual({gpa:3.75,credits:4});
  });

  it("returns zero without eligible credits",()=>{
    expect(calculateGpa([])).toEqual({gpa:0,credits:0});
  });
});
