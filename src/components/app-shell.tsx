"use client";
import Link from "next/link";
import {useLocale,useTranslations} from "next-intl";
import {usePathname,useRouter} from "next/navigation";
import {BookOpen,CalendarDays,ChevronRight,Database,Goal,Languages,LayoutDashboard,LogIn,Menu,Settings,SunMoon,X} from "lucide-react";
import {useEffect,useState} from "react";
import {useAuth} from "./providers";
import {FeatureView} from "./feature-view";

export type Section="dashboard"|"academics"|"goals"|"planner"|"data"|"account";
const icons={dashboard:LayoutDashboard,academics:BookOpen,goals:Goal,planner:CalendarDays,data:Database,account:Settings};

export function AppShell({section}:{section:Section}){
  const locale=useLocale();const t=useTranslations("Nav");const common=useTranslations("Common");const pathname=usePathname();const router=useRouter();const {user,ready,logout}=useAuth();const [open,setOpen]=useState(false);const [dark,setDark]=useState(()=>typeof window!=="undefined"&&localStorage.getItem("theme")==="dark");
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";},[dark]);
  const nav=(Object.keys(icons) as Section[]).map((key)=>({key,label:t(key),icon:icons[key],href:key==="dashboard"?`/${locale}`:`/${locale}/${key}`}));
  function toggleTheme(){const value=!dark;setDark(value);localStorage.setItem("theme",value?"dark":"light");document.documentElement.dataset.theme=value?"dark":"light";}
  return <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
    {open&&<button aria-label="Close menu" className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={()=>setOpen(false)}/>}<aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[17rem] bg-[var(--forest)] text-white p-5 flex flex-col transition-transform ${open?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}><div className="flex items-center justify-between"><Link href={`/${locale}`} className="flex items-center gap-3 font-black"><span className="w-10 h-10 rounded-2xl bg-[var(--lime)] text-[var(--forest)] grid place-items-center"><BookOpen size={21}/></span><span>Academic<br/>Planner</span></Link><button className="lg:hidden" onClick={()=>setOpen(false)}><X/></button></div><nav aria-label="Main navigation" className="mt-12 space-y-1">{nav.map(({key,label,icon:Icon,href})=><Link key={key} onClick={()=>setOpen(false)} href={href} aria-current={section===key?"page":undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${section===key?"bg-white text-[var(--forest)]":"text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon size={19}/>{label}{section===key&&<ChevronRight size={16} className="ml-auto"/>}</Link>)}</nav><div className="mt-auto rounded-2xl bg-white/8 p-4"><p className="text-xs text-white/45">{user?.email??common("guest")}</p>{user?<button className="mt-2 text-sm font-bold" onClick={async()=>{await logout();router.push(`/${locale}`);}}>{common("signOut")}</button>:<Link href={`/${locale}/login`} className="mt-2 inline-flex gap-2 text-sm font-bold"><LogIn size={17}/>{common("signIn")}</Link>}</div></aside>
    <main className="min-w-0"><header className="h-20 px-5 sm:px-8 flex items-center gap-3 border-b border-black/5 bg-[var(--paper)]/80 backdrop-blur sticky top-0 z-20"><button className="button-secondary !p-2.5 lg:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></button><div><p className="eyebrow">{user?user.name:common("guest")}</p><h1 className="font-black text-lg">{t(section)}</h1></div><div className="ml-auto flex gap-2"><button className="button-secondary !p-2.5" onClick={toggleTheme} aria-label="Toggle theme"><SunMoon size={18}/></button><button className="button-secondary" onClick={()=>router.push(pathname.replace(`/${locale}`,`/${locale==="th"?"en":"th"}`)||`/${locale==="th"?"en":"th"}`)}><Languages size={17}/><span className="hidden sm:inline">{locale==="th"?"EN":"ไทย"}</span></button></div></header><div className="p-5 sm:p-8 max-w-[92rem] mx-auto"><FeatureView section={section} authenticated={!!user} authReady={ready}/></div>
    </main>
  </div>;
}
