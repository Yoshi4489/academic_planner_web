"use client";
import {useQueryClient} from "@tanstack/react-query";
import {AlertTriangle,CheckCircle2,CloudDownload,Database,FileJson,LoaderCircle,ShieldCheck,Upload} from "lucide-react";
import {useLocale} from "next-intl";
import {useState} from "react";
import {apiFetch} from "@/lib/api-client";
import {parseTransferSnapshot,transferCounts,type TransferSnapshot} from "@/lib/data-transfer";
import {gradePoints} from "@/lib/gpa";
import {clearGuest,guestDb,guestSnapshot} from "@/lib/guest-db";
import type {Course,Goal,Semester} from "@/lib/types";

type Decision="KEEP_CLOUD"|"REPLACE_CLOUD"|"MERGE_COURSES";
type Preview={merge_token:string;conflicts:Array<{guest_semester_id:string;guest:{term:string;year:number;courses:unknown[]};cloud:{id:string;term:string;year:number}}>;counts:{semesters:number;courses:number;goals:number}};

export function DataView({authenticated,authReady}:{authenticated:boolean;authReady:boolean}){
  const locale=useLocale();const th=locale==="th";const queryClient=useQueryClient();const [snapshot,setSnapshot]=useState<TransferSnapshot|null>(null);const [preview,setPreview]=useState<Preview|null>(null);const [decisions,setDecisions]=useState<Record<string,Decision>>({});const [pending,setPending]=useState(false);const [message,setMessage]=useState("");const [error,setError]=useState("");
  async function exportData(){setPending(true);setError("");try{const value=authenticated?await apiFetch("data/export"):await guestSnapshot();downloadJson(value,`academic-planner-${new Date().toISOString().slice(0,10)}.json`);setMessage(th?"ดาวน์โหลดข้อมูลแล้ว":"Data downloaded");}catch(reason){setError(reason instanceof Error?reason.message:String(reason));}finally{setPending(false);}}
  async function chooseFile(file?:File){if(!file)return;setPending(true);setError("");setMessage("");setPreview(null);try{const parsed=parseTransferSnapshot(JSON.parse(await file.text()));setSnapshot(parsed);if(authenticated){const result=await apiFetch<Preview>("data/guest-import/preview",{method:"POST",body:JSON.stringify(parsed)});setPreview(result);setDecisions(Object.fromEntries(result.conflicts.map((conflict)=>[conflict.guest_semester_id,"KEEP_CLOUD"])));}else setMessage(th?"ไฟล์ผ่านการตรวจสอบ พร้อมนำเข้า":"File validated and ready to import");}catch(reason){setSnapshot(null);setError(reason instanceof Error?reason.message:(th?"ไฟล์ไม่ถูกต้อง":"Invalid file"));}finally{setPending(false);}}
  async function commit(){
    if(!snapshot)return;
    setPending(true);setError("");
    try{
      if(authenticated){
        if(!preview)throw new Error("Preview required");
        const result=await apiFetch<{data?:unknown}>("data/guest-import/commit",{
          method:"POST",
          headers:{"idempotency-key":crypto.randomUUID()},
          body:JSON.stringify({snapshot,merge_token:preview.merge_token,decisions:preview.conflicts.map((conflict)=>({semester_id:conflict.guest_semester_id,action:decisions[conflict.guest_semester_id]??"KEEP_CLOUD"}))}),
        });
        setMessage(`${th?"นำเข้าข้อมูลสำเร็จ":"Import complete"}: ${JSON.stringify(result.data??result)}`);
        await Promise.all([queryClient.invalidateQueries({queryKey:["semesters"]}),queryClient.invalidateQueries({queryKey:["goals"]}),queryClient.invalidateQueries({queryKey:["planner"]})]);
      }else{
        await replaceGuest(snapshot);setMessage(th?"แทนที่ข้อมูลผู้เยี่ยมชมเรียบร้อย":"Guest data replaced");await queryClient.invalidateQueries({queryKey:["guest"]});
      }
      setSnapshot(null);setPreview(null);
    }catch(reason){setError(reason instanceof Error?reason.message:String(reason));}finally{setPending(false);}
  }
  if(!authReady)return <div className="skeleton h-80 rounded-[var(--radius-lg)]"/>;
  const counts=snapshot?transferCounts(snapshot):null;
  return <div className="space-y-6"><header className="card page-header"><div><p className="eyebrow">DATA PORTABILITY</p><h2 className="page-title">{th?"ข้อมูลเป็นของคุณ":"Your data stays yours"}</h2><p className="page-description">{th?"สำรอง ย้าย และรวมข้อมูล Academic Planner ด้วย JSON schema version 1":"Back up, move, and merge Academic Planner data using JSON schema version 1"}</p></div></header>
    {message&&<div role="status" className="notice notice-success"><CheckCircle2 className="shrink-0" size={19}/><span>{message}</span></div>}{error&&<div role="alert" className="notice notice-error"><AlertTriangle className="shrink-0" size={19}/><span>{error}</span></div>}
    <section className="grid gap-5 lg:grid-cols-2"><article className="card p-6"><span className="icon-tile"><CloudDownload size={20}/></span><h3 className="section-heading mt-5">{th?"ดาวน์โหลดข้อมูล":"Download your data"}</h3><p className="mt-2 text-sm text-[var(--muted)]">{authenticated?(th?"รวมเทอม วิชา เป้าหมาย งาน ตารางเรียน และหมวดหลักสูตรจากคลาวด์":"Includes cloud semesters, courses, goals, tasks, schedule, and requirements"):(th?"ส่งออกเทอม วิชา และเป้าหมายที่เก็บบนอุปกรณ์นี้":"Exports semesters, courses, and goals stored on this device")}</p><button className="button-primary mt-6 w-full" disabled={pending} onClick={()=>void exportData()}>{pending?<LoaderCircle className="animate-spin" size={18}/>:<CloudDownload size={18}/>} {th?"ดาวน์โหลด JSON":"Download JSON"}</button></article>
      <article className="card p-6"><span className="icon-tile"><Upload size={20}/></span><h3 className="section-heading mt-5">{th?"อัปโหลดและตรวจสอบ":"Upload & validate"}</h3><p className="mt-2 text-sm text-[var(--muted)]">{th?"ไฟล์จะถูกตรวจ schema และแสดงความขัดแย้งก่อนเปลี่ยนข้อมูล":"The file is validated and conflicts are shown before data changes"}</p><label className={`button-secondary mt-6 w-full cursor-pointer ${pending?"pointer-events-none opacity-50":""}`}><FileJson size={18}/>{th?"เลือกไฟล์ JSON":"Choose JSON file"}<input className="sr-only" type="file" accept="application/json,.json" disabled={pending} onChange={(event)=>void chooseFile(event.target.files?.[0])}/></label></article></section>
    {snapshot&&<section className="card p-6 sm:p-8"><div className="flex flex-col sm:flex-row gap-4 sm:items-start"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dceae5]"><Database/></span><div className="flex-1"><p className="eyebrow">IMPORT PREVIEW</p><h3 className="font-black text-xl mt-1">{th?"ตรวจรายการก่อนนำเข้า":"Review before import"}</h3><div className="grid grid-cols-3 gap-3 mt-5">{[[th?"เทอม":"Semesters",counts?.semesters],[th?"วิชา":"Courses",counts?.courses],[th?"เป้าหมาย":"Goals",counts?.goals]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-[#f2f5ef] p-3 text-center"><strong className="text-xl">{value}</strong><p className="text-xs text-[var(--muted)]">{label}</p></div>)}</div></div></div>
      {preview?.conflicts.length?<div className="mt-7"><h4 className="font-black">{th?"รายการที่ชนกับข้อมูลคลาวด์":"Cloud conflicts"}</h4><div className="mt-3 space-y-3">{preview.conflicts.map((conflict)=><label key={conflict.guest_semester_id} className="block rounded-xl border border-[var(--line)] p-4"><span className="block text-sm font-bold">{conflict.guest.term} {conflict.guest.year} · {conflict.guest.courses.length} {th?"วิชา":"courses"}</span><select className="field mt-3" value={decisions[conflict.guest_semester_id]??"KEEP_CLOUD"} onChange={(event)=>setDecisions((value)=>({...value,[conflict.guest_semester_id]:event.target.value as Decision}))}><option value="KEEP_CLOUD">{th?"เก็บข้อมูลคลาวด์":"Keep cloud"}</option><option value="MERGE_COURSES">{th?"รวมวิชาที่ไม่ซ้ำ":"Merge unique courses"}</option><option value="REPLACE_CLOUD">{th?"แทนที่ข้อมูลคลาวด์":"Replace cloud"}</option></select></label>)}</div></div>:authenticated&&<p className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-900">{th?"ไม่พบเทอมที่ขัดแย้งกัน":"No semester conflicts found"}</p>}
      <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3"><button className="button-secondary" disabled={pending} onClick={()=>{setSnapshot(null);setPreview(null);}}>{th?"ยกเลิก":"Cancel"}</button><button className="button-primary" disabled={pending||authenticated&&!preview} onClick={()=>void commit()}>{pending?<LoaderCircle className="animate-spin" size={18}/>:<ShieldCheck size={18}/>} {authenticated?(th?"ยืนยันการนำเข้า":"Confirm import"):(th?"แทนที่ข้อมูลบนอุปกรณ์":"Replace device data")}</button></div></section>}
    <section className="card p-5 flex gap-4"><ShieldCheck className="shrink-0"/><div><h3 className="font-black">{th?"ความปลอดภัยของข้อมูล":"Data safety"}</h3><p className="text-sm text-[var(--muted)] mt-1">{th?"ไม่มี token หรือรหัสผ่านอยู่ในไฟล์ export และการนำเข้า cloud ใช้ preview token พร้อม idempotency key":"Exports never contain passwords or tokens; cloud imports use a preview token and idempotency key"}</p></div></section>
  </div>;
}

async function replaceGuest(snapshot:TransferSnapshot){await clearGuest();const semesters:Semester[]=snapshot.semesters.map((semester)=>({...semester,gpas:[],courses:semester.courses.map((course)=>({...course,semester_id:semester.id,grade_point:gradePoints[course.grade]})) as Course[]}));const goals:Goal[]=snapshot.goals.map((goal)=>({...goal,id:goal.id??crypto.randomUUID()}));await guestDb.transaction("rw",guestDb.semesters,guestDb.goals,async()=>{await guestDb.semesters.bulkPut(semesters);await guestDb.goals.bulkPut(goals);});}
function downloadJson(value:unknown,filename:string){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:"application/json"}));const anchor=document.createElement("a");anchor.href=url;anchor.download=filename;anchor.click();URL.revokeObjectURL(url);}
