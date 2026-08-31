"use client";
import Link from "next/link";
import {useQuery} from "@tanstack/react-query";
import {useLocale,useTranslations} from "next-intl";
import {ArrowUpRight,BookOpen,CalendarCheck2,Clock3,GraduationCap,Target} from "lucide-react";
import {Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {apiFetch} from "@/lib/api-client";
import {cumulativeGpa} from "@/lib/gpa";
import {guestDb} from "@/lib/guest-db";
import {listFrom,type AcademicTask,type Semester} from "@/lib/types";
import type {Section} from "./app-shell";
import {AcademicsView} from "./academics-view";
import {GoalsView} from "./goals-view";
import {PlannerView} from "./planner-view";
import {DataView} from "./data-view";
import {AccountView} from "./account-view";

export function FeatureView({section,authenticated,authReady}:{section:Section;authenticated:boolean;authReady:boolean}){
  if(section==="dashboard")return <Dashboard authenticated={authenticated} authReady={authReady}/>;
  if(section==="academics")return <AcademicsView authenticated={authenticated} authReady={authReady}/>;
  if(section==="goals")return <GoalsView authenticated={authenticated} authReady={authReady}/>;
  if(section==="planner")return <PlannerView authenticated={authenticated} authReady={authReady}/>;
  if(section==="data")return <DataView authenticated={authenticated} authReady={authReady}/>;
  if(section==="account")return <AccountView authenticated={authenticated}/>;
  return null;
}

function Dashboard({authenticated,authReady}:{authenticated:boolean;authReady:boolean}){
  const t=useTranslations("Dashboard");const locale=useLocale();
  const terms=useQuery({queryKey:["semesters"],enabled:authReady&&authenticated,queryFn:()=>apiFetch("semesters/getSemesters").then((data)=>listFrom<Semester>(data,"semesters"))});
  const tasks=useQuery({queryKey:["planner","tasks"],enabled:authReady&&authenticated,queryFn:()=>apiFetch("planner/tasks").then((data)=>listFrom<AcademicTask>(data,"tasks"))});
  const guestTerms=useQuery({queryKey:["guest","semesters"],enabled:authReady&&!authenticated,queryFn:()=>guestDb.semesters.toArray()});
  const all=authenticated?(terms.data??[]):(guestTerms.data??[]);const latest=[...all].sort((a,b)=>b.year-a.year||b.term_no-a.term_no)[0];const latestGpa=latest?.gpas?.[0];
  const guestActual=cumulativeGpa(all);const guestProjected=cumulativeGpa(all,true);
  const actual=authenticated?(latestGpa?.cum_gpa??latestGpa?.gpa??0):guestActual.gpa;const projected=authenticated?(latestGpa?.projected_gpa??actual):guestProjected.gpa;const credits=all.flatMap((term)=>term.courses??[]).filter((course)=>course.type==="ACTUAL").reduce((sum,course)=>sum+Number(course.credit),0);
  const chart=[...all].sort((a,b)=>a.year-b.year||a.term_no-b.term_no).map((term)=>({name:`${term.year}/${term.term_no}`,actual:term.gpas?.[0]?.gpa??cumulativeGpa([{...term,courses:term.courses.filter((course)=>course.type==="ACTUAL")}]).gpa,projected:term.gpas?.[0]?.projected_gpa??cumulativeGpa([term],true).gpa}));
  if(!authReady||(!authenticated&&guestTerms.isLoading))return <div className="space-y-5"><div className="skeleton h-32 rounded-lg"/><div className="grid-auto"><div className="skeleton h-24 rounded-md"/><div className="skeleton h-24 rounded-md"/><div className="skeleton h-24 rounded-md"/></div></div>;
  return <div className="space-y-6">
    <section className="card page-header"><div className="flex-1"><p className="eyebrow">ACADEMIC COMMAND CENTER</p><h2 className="page-title">{t("hello")}</h2><p className="page-description">{t("subtitle")}</p></div>{!authenticated&&<Link href={`/${locale}/login`} className="button-primary shrink-0">{locale==="th"?"เชื่อมบัญชีของฉัน":"Connect my account"}<ArrowUpRight size={16}/></Link>}</section>
    <section className="grid-auto" aria-label={locale==="th"?"สรุปผลการเรียน":"Academic summary"}><Stat icon={GraduationCap} label={t("actualGpa")} value={actual.toFixed(2)} tone="success"/><Stat icon={Target} label={t("projectedGpa")} value={projected.toFixed(2)} tone="info"/><Stat icon={BookOpen} label={t("credits")} value={String(credits)} tone="neutral"/></section>
    <section className="grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="card p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">GPA TRAJECTORY</p><h3 className="section-heading mt-1">{locale==="th"?"แนวโน้มผลการเรียน":"Academic trajectory"}</h3></div><div className="flex gap-4 text-xs text-[var(--muted)]"><span className="flex items-center gap-2"><i className="h-2 w-4 bg-[var(--primary)]"/>{locale==="th"?"ผลจริง":"Actual"}</span><span className="flex items-center gap-2"><i className="h-0 w-4 border-t-2 border-dashed border-[var(--tertiary)]"/>{locale==="th"?"คาดการณ์":"Projected"}</span></div></div><div className="mt-5 h-72">{chart.length?<ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="actual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={.22}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="var(--border)"/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis domain={[0,4]} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"4px"}}/><Area type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={2} fill="url(#actual)"/><Area type="monotone" dataKey="projected" stroke="var(--tertiary)" strokeWidth={2} strokeDasharray="4 4" fill="transparent"/></AreaChart></ResponsiveContainer>:<Empty text={locale==="th"?"เพิ่มเทอมและรายวิชาเพื่อดูกราฟ":"Add a semester and courses to see your graph"}/>}</div></div><div className="card p-5 sm:p-6"><p className="eyebrow">NEXT UP</p><h3 className="section-heading mt-1">{t("deadlines")}</h3><div className="mt-4 divide-y divide-[var(--border)]">{(tasks.data??[]).filter((task)=>!task.is_complete).slice(0,4).map((task)=><div key={task.id} className="flex gap-3 py-3 first:pt-0"><span className="icon-tile !h-8 !w-8"><Clock3 size={15}/></span><div className="min-w-0"><b className="block truncate text-sm">{task.title}</b><p className="mt-0.5 text-xs text-[var(--muted)]">{new Intl.DateTimeFormat(locale,{dateStyle:"medium",timeStyle:"short"}).format(new Date(task.due_at))}</p></div></div>)}{!(tasks.data??[]).filter((task)=>!task.is_complete).length&&<Empty text={locale==="th"?"ยังไม่มีงานที่ใกล้ถึงกำหนด":"No upcoming deadlines"}/>}</div><Link href={`/${locale}/planner`} className="button-secondary mt-5 w-full"><CalendarCheck2 size={16}/>{locale==="th"?"เปิดแพลนเนอร์":"Open planner"}</Link></div></section>
  </div>;
}

function Stat({icon:Icon,label,value,tone}:{icon:typeof GraduationCap;label:string;value:string;tone:"success"|"info"|"neutral"}){const color={success:"status-success",info:"status-info",neutral:"bg-[var(--surface-subtle)] text-[var(--primary)]"}[tone];return <article className="card metric-card"><span className={`icon-tile ${color}`}><Icon size={19}/></span><div><p className="text-sm text-[var(--muted)]">{label}</p><strong className="font-mono text-2xl font-bold tabular-nums">{value}</strong></div></article>}
function Empty({text}:{text:string}){return <div className="grid h-full min-h-28 place-items-center border border-dashed border-[var(--border-strong)] bg-[var(--background)] p-5 text-center text-sm text-[var(--muted)]">{text}</div>}
