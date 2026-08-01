import Dexie,{type EntityTable} from "dexie";
import type {Goal,Semester,GuestSnapshot} from "./types";

export const guestDb=new Dexie("academic-planner-guest") as Dexie&{semesters:EntityTable<Semester,"id">;goals:EntityTable<Goal,"id">};
guestDb.version(1).stores({semesters:"id,[year+term_no]",goals:"id,target_semester_id"});
export const guestLimits={semesters:6,goals:12,coursesPerSemester:12};
export async function guestSnapshot():Promise<GuestSnapshot>{return {schema_version:1,semesters:await guestDb.semesters.toArray(),goals:await guestDb.goals.toArray()};}
export async function clearGuest(){await guestDb.transaction("rw",guestDb.semesters,guestDb.goals,async()=>{await guestDb.semesters.clear();await guestDb.goals.clear();});}
