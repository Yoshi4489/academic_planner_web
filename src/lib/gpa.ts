import type {Course,Semester} from "./types";

export const gradePoints={A:4,B_PLUS:3.5,B:3,C_PLUS:2.5,C:2,D_PLUS:1.5,D:1,F:0} as const;

export function calculateGpa(courses:Course[],includePlanned=false){
  const eligible=courses.filter((course)=>includePlanned||course.type==="ACTUAL");
  const credits=eligible.reduce((sum,course)=>sum+Number(course.credit),0);
  if(!credits)return {gpa:0,credits:0};
  const points=eligible.reduce((sum,course)=>sum+gradePoints[course.grade]*Number(course.credit),0);
  return {gpa:points/credits,credits};
}

export function cumulativeGpa(semesters:Semester[],includePlanned=false){
  return calculateGpa(semesters.flatMap((semester)=>semester.courses??[]),includePlanned);
}
