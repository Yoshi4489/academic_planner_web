import {z} from "zod";
import {courseCategories,grades} from "./types";

const transferCourse=z.object({id:z.string().min(1).max(100),name:z.string().trim().min(1).max(200),grade:z.enum(grades),credit:z.number().int().min(1).max(30),type:z.enum(["ACTUAL","PLAN"]),category:z.enum(courseCategories),course_code:z.string().trim().max(30).nullable().optional(),instructor:z.string().trim().max(100).nullable().optional(),notes:z.string().trim().max(2000).nullable().optional()});
const transferSemester=z.object({id:z.string().min(1).max(100),year:z.number().int().min(1900).max(2200),term:z.string().trim().min(1).max(100),term_no:z.number().int().min(1).max(10),is_complete:z.boolean(),courses:z.array(transferCourse).max(100)});
const transferGoal=z.object({id:z.string().min(1).max(100).optional(),name:z.string().trim().min(1).max(200),target_gpa:z.number().min(0).max(4),is_achieved:z.boolean(),target_semester_id:z.string().min(1).max(100)});
export const guestTransferSchema=z.object({schema_version:z.literal(1),semesters:z.array(transferSemester).max(50),goals:z.array(transferGoal).max(100).default([])});
export type TransferSnapshot=z.infer<typeof guestTransferSchema>;

export function parseTransferSnapshot(value:unknown){return guestTransferSchema.parse(value);}
export function transferCounts(snapshot:TransferSnapshot){return {semesters:snapshot.semesters.length,courses:snapshot.semesters.reduce((sum,semester)=>sum+semester.courses.length,0),goals:snapshot.goals.length};}
