"use client";
import {Bell,BellOff,LoaderCircle} from "lucide-react";
import {useLocale} from "next-intl";
import {useState} from "react";
import {disablePushSubscription,syncPushSubscription,webPushSupported} from "@/lib/web-push";

export function PushSettings(){
  const locale=useLocale();const th=locale==="th";const [status,setStatus]=useState<"idle"|"enabled"|"disabled"|"unsupported"|"error">("idle");const [pending,setPending]=useState(false);const [message,setMessage]=useState("");
  async function enable(){if(!webPushSupported()){setStatus("unsupported");setMessage(th?"browser นี้ไม่รองรับ Web Push":"This browser does not support Web Push");return;}setPending(true);try{await syncPushSubscription(true);setStatus("enabled");setMessage(th?"เปิดการแจ้งเตือนแล้ว แม้ปิดหน้าเว็บ":"Notifications enabled, even when the site is closed");}catch(reason){setStatus("error");setMessage(reason instanceof Error?reason.message:String(reason));}finally{setPending(false);}}
  async function disable(){setPending(true);try{await disablePushSubscription();setStatus("disabled");setMessage(th?"ปิดการแจ้งเตือนแล้ว":"Notifications disabled");}catch(reason){setStatus("error");setMessage(reason instanceof Error?reason.message:String(reason));}finally{setPending(false);}}
  return <article className="card p-6"><div className="flex items-center gap-3"><span className="icon-tile"><Bell size={20}/></span><div><p className="eyebrow">WEB PUSH</p><h3 className="section-heading">{th?"แจ้งเตือนกำหนดส่ง":"Deadline notifications"}</h3></div></div><p className="mt-4 text-sm text-[var(--muted)]">{th?"รับการแจ้งเตือนงานและการสอบตามเวลาที่ตั้งไว้ แม้ปิดเว็บ Academic Planner":"Receive task and exam reminders at your chosen time, even when Academic Planner is closed"}</p>{message&&<p role={status==="error"?"alert":"status"} className={`notice mt-4 ${status==="error"||status==="unsupported"?"notice-error":"notice-success"}`}>{message}</p>}<div className="mt-5 flex flex-col gap-3 sm:flex-row"><button className="button-primary flex-1" disabled={pending} onClick={()=>void enable()}>{pending?<LoaderCircle className="animate-spin" size={17}/>:<Bell size={17}/>} {th?"เปิด/ซิงก์การแจ้งเตือน":"Enable / sync notifications"}</button><button className="button-secondary" disabled={pending} onClick={()=>void disable()}><BellOff size={17}/>{th?"ปิด":"Disable"}</button></div></article>;
}
