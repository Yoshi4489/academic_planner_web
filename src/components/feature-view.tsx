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

export function FeatureView({section,authenticated,authReady}:{section:Section;authenticated:boolean;authReady:boolean}){
  if(section==="dashboard")return <Dashboard authenticated={authenticated} authReady={authReady}/>;
  if(section==="academics")return <AcademicsView authenticated={authenticated} authReady={authReady}/>;
  if(section==="goals")return <GoalsView authenticated={authenticated} authReady={authReady}/>;
  if(section==="planner")return <PlannerView authenticated={authenticated} authReady={authReady}/>;
  return <section className="card min-h-[34rem] p-8 sm:p-12 flex items-center"><div className="max-w-xl"><p className="eyebrow">{section.toUpperCase()}</p><h2 className="text-4xl sm:text-5xl font-black mt-4">{section[0].toUpperCase()+section.slice(1)}</h2><p className="mt-4 text-[var(--muted)] text-lg">This workspace section is being connected to your academic data.</p></div></section>;
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
  if(!authReady||(!authenticated&&guestTerms.isLoading))return <div className="space-y-5"><div className="skeleton h-40 rounded-[2rem]"/><div className="grid-auto"><div className="skeleton h-36 rounded-3xl"/><div className="skeleton h-36 rounded-3xl"/><div className="skeleton h-36 rounded-3xl"/></div></div>;
  return <div className="space-y-6">
    <section className="card bg-[var(--forest)] !text-white p-7 sm:p-10 relative overflow-hidden"><div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-[var(--lime)]/20"/><p className="eyebrow !text-[#c7f36b]">ACADEMIC COMMAND CENTER</p><div className="relative mt-4 grid lg:grid-cols-[1fr_auto] gap-8 items-end"><div><h2 className="text-4xl sm:text-6xl max-w-3xl font-black leading-[1.1]">{t("hello")}</h2><p className="mt-4 text-white/65 text-lg">{t("subtitle")}</p></div>{!authenticated&&<Link href={`/${locale}/login`} className="button-primary !bg-[var(--lime)] !text-[var(--forest)]">{locale==="th"?"เชื่อมบัญชีของฉัน":"Connect my account"}<ArrowUpRight size={18}/></Link>}</div></section>
    <section className="grid-auto"><Stat icon={GraduationCap} label={t("actualGpa")} value={actual.toFixed(2)} tone="lime"/><Stat icon={Target} label={t("projectedGpa")} value={projected.toFixed(2)} tone="coral"/><Stat icon={BookOpen} label={t("credits")} value={String(credits)} tone="forest"/></section>
    <section className="grid lg:grid-cols-[1.35fr_.65fr] gap-6"><div className="card p-6"><div><p className="eyebrow">GPA TRAJECTORY</p><h3 className="font-black text-xl mt-1">{locale==="th"?"แนวโน้มผลการเรียน":"Academic trajectory"}</h3></div><div className="h-72 mt-5">{chart.length?<ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="actual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#123c34" stopOpacity={.32}/><stop offset="95%" stopColor="#123c34" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#d9ded7"/><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis domain={[0,4]} axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="actual" stroke="#123c34" strokeWidth={3} fill="url(#actual)"/><Area type="monotone" dataKey="projected" stroke="#ff8268" strokeDasharray="5 5" fill="transparent"/></AreaChart></ResponsiveContainer>:<Empty text={locale==="th"?"เพิ่มเทอมและรายวิชาเพื่อดูกราฟ":"Add a semester and courses to see your graph"}/>}</div></div><div className="card p-6"><p className="eyebrow">NEXT UP</p><h3 className="font-black text-xl mt-1">{t("deadlines")}</h3><div className="mt-5 space-y-3">{(tasks.data??[]).filter((task)=>!task.is_complete).slice(0,4).map((task)=><div key={task.id} className="rounded-2xl bg-[#f2f5ef] p-4 flex gap-3"><Clock3 size={18}/><div><b className="text-sm">{task.title}</b><p className="text-xs text-[var(--muted)] mt-1">{new Intl.DateTimeFormat(locale,{dateStyle:"medium",timeStyle:"short"}).format(new Date(task.due_at))}</p></div></div>)}{!(tasks.data??[]).length&&<Empty text={locale==="th"?"ยังไม่มีงานที่ใกล้ถึงกำหนด":"No upcoming deadlines"}/>}</div><Link href={`/${locale}/planner`} className="button-secondary w-full mt-5"><CalendarCheck2 size={17}/>{locale==="th"?"เปิดแพลนเนอร์":"Open planner"}</Link></div></section>
  </div>;
}

function Stat({icon:Icon,label,value,tone}:{icon:typeof GraduationCap;label:string;value:string;tone:"lime"|"coral"|"forest"}){const color={lime:"bg-[#eaf8c8]",coral:"bg-[#ffebe6]",forest:"bg-[#dceae5]"}[tone];return <article className="card p-6 flex items-center gap-4"><span className={`w-12 h-12 rounded-2xl grid place-items-center ${color}`}><Icon size={22}/></span><div><p className="text-sm text-[var(--muted)]">{label}</p><strong className="text-3xl font-black">{value}</strong></div></article>}
function Empty({text}:{text:string}){return <div className="h-full min-h-32 grid place-items-center text-center text-sm text-[var(--muted)] border border-dashed border-[var(--line)] rounded-2xl p-5">{text}</div>}
