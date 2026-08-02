export type User={id:string;name:string;email:string};
export const grades=["A","B_PLUS","B","C_PLUS","C","D_PLUS","D","F"] as const;
export const courseCategories=["GEN_ED","MAJOR_REQUIRED","MAJOR_ELECTIVE","MINOR","FREE_ELECTIVE"] as const;
export type Grade=(typeof grades)[number];
export type CourseCategory=(typeof courseCategories)[number];
export type Course={id:string;name:string;category:CourseCategory;grade:Grade;grade_point:number;credit:number;type:"ACTUAL"|"PLAN";semester_id:string;course_code?:string|null;instructor?:string|null;notes?:string|null;requirement_id?:string|null};
export type Gpa={gpa:number;cum_gpa:number;total_credits:number;projected_gpa:number;projected_total_credits:number};
export type Semester={id:string;year:number;term:string;term_no:number;is_complete:boolean;courses:Course[];gpas:Gpa[]};
export type Goal={id:string;name:string;target_gpa:number;is_achieved:boolean;target_semester_id:string};
export type AcademicTask={id:string;title:string;type:string;due_at:string;is_complete:boolean;reminder_offset_minutes:number|null;course_id:string;course?:{id:string;name:string;course_code?:string|null}};
export type Meeting={id:string;weekday:number;start_minute:number;end_minute:number;location?:string|null;course:{id:string;name:string}};
export type Requirement={id:string;name:string;required_credits:number;actual_credits:number;projected_credits:number;color?:string|null};
export type PlannerBundle={tasks:AcademicTask[];meetings:Meeting[];requirements:Requirement[]};
export type GuestSnapshot={schema_version:1;semesters:Semester[];goals:Goal[]};

export function listFrom<T>(payload:unknown,...keys:string[]):T[]{
  let value:unknown=payload;
  if(value&&typeof value==="object"&&"data" in value)value=(value as {data:unknown}).data;
  for(const key of keys){if(value&&typeof value==="object"&&key in value)value=(value as Record<string,unknown>)[key];}
  return Array.isArray(value)?value as T[]:[];
}
