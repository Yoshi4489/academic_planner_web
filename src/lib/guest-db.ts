import Dexie,{type EntityTable} from "dexie";
import type {AcademicTask,Goal,Meeting,Requirement,Semester,GuestSnapshot} from "./types";

export const guestDb=new Dexie("academic-planner-guest") as Dexie&{semesters:EntityTable<Semester,"id">;goals:EntityTable<Goal,"id">;tasks:EntityTable<AcademicTask,"id">;meetings:EntityTable<Meeting,"id">;requirements:EntityTable<Requirement,"id">};
guestDb.version(1).stores({semesters:"id,[year+term_no]",goals:"id,target_semester_id"});
guestDb.version(2).stores({semesters:"id,[year+term_no]",goals:"id,target_semester_id",tasks:"id,due_at,course_id,is_complete",meetings:"id,weekday,course_id",requirements:"id,sort_order"});
export const guestLimits={semesters:6,goals:12,coursesPerSemester:12,tasks:60,meetings:36,requirements:20};
export async function guestSnapshot():Promise<GuestSnapshot>{return {schema_version:1,semesters:await guestDb.semesters.toArray(),goals:await guestDb.goals.toArray()};}
export async function clearGuest(){await guestDb.transaction("rw",guestDb.semesters,guestDb.goals,guestDb.tasks,guestDb.meetings,guestDb.requirements,async()=>{await Promise.all([guestDb.semesters.clear(),guestDb.goals.clear(),guestDb.tasks.clear(),guestDb.meetings.clear(),guestDb.requirements.clear()]);});}
