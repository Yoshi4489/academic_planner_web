"use client";
import Link from "next/link";
import {useLocale,useTranslations} from "next-intl";
import {usePathname,useRouter} from "next/navigation";
import {BookOpen,CalendarDays,ChevronRight,Database,Goal,Languages,LayoutDashboard,LogIn,Menu,Moon,Settings,Sun,X} from "lucide-react";
import {useState} from "react";
import {useAuth} from "./providers";
import {useTheme} from "./theme-provider";
import {FeatureView} from "./feature-view";

export type Section="dashboard"|"academics"|"goals"|"planner"|"data"|"account";
const icons={dashboard:LayoutDashboard,academics:BookOpen,goals:Goal,planner:CalendarDays,data:Database,account:Settings};

export function AppShell({section}:{section:Section}){
  const locale=useLocale();const t=useTranslations("Nav");const common=useTranslations("Common");const pathname=usePathname();const router=useRouter();const {user,ready,logout}=useAuth();const {resolved,toggleTheme}=useTheme();const [open,setOpen]=useState(false);
  const nav=(Object.keys(icons) as Section[]).map((key)=>({key,label:t(key),icon:icons[key],href:key==="dashboard"?`/${locale}`:`/${locale}/${key}`}));
  return <div className="app-frame lg:grid lg:grid-cols-[15rem_1fr]">
    {open&&<button aria-label={locale==="th"?"ปิดเมนู":"Close menu"} className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden" onClick={()=>setOpen(false)}/>}<aside className={`app-sidebar fixed left-0 top-0 z-40 flex h-screen w-[15rem] flex-col transition-transform duration-150 lg:sticky ${open?"translate-x-0":"-translate-x-full lg:translate-x-0"}`}><div className="flex h-16 items-center justify-between border-b border-white/10 px-4"><Link href={`/${locale}`} className="flex items-center gap-3 font-bold leading-tight"><span className="brand-mark"><BookOpen size={19}/></span><span>Academic Planner</span></Link><button className="button-ghost !min-h-9 !p-2 !text-white lg:hidden" onClick={()=>setOpen(false)} aria-label={locale==="th"?"ปิดเมนู":"Close menu"}><X size={19}/></button></div><nav aria-label={locale==="th"?"เมนูหลัก":"Main navigation"} className="mt-4 space-y-1 px-3">{nav.map(({key,label,icon:Icon,href})=><Link key={key} onClick={()=>setOpen(false)} href={href} aria-current={section===key?"page":undefined} data-active={section===key} className="nav-link"><Icon size={18}/><span>{label}</span>{section===key&&<ChevronRight size={15} className="ml-auto"/>}</Link>)}</nav><div className="mt-auto border-t border-white/10 p-4"><p className="truncate text-xs text-white/55">{user?.email??common("guest")}</p>{user?<button className="mt-2 text-sm font-semibold text-white hover:underline" onClick={async()=>{await logout();router.push(`/${locale}`);}}>{common("signOut")}</button>:<Link href={`/${locale}/login`} className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"><LogIn size={16}/>{common("signIn")}</Link>}</div></aside>
    <main className="min-w-0"><header className="app-topbar sticky top-0 z-20 flex h-16 items-center gap-3 px-4 sm:px-6"><button className="button-secondary !min-h-9 !p-2 lg:hidden" onClick={()=>setOpen(true)} aria-label={locale==="th"?"เปิดเมนู":"Open menu"} aria-expanded={open}><Menu size={19}/></button><div className="min-w-0"><div className="breadcrumb"><span>Academic Planner</span><ChevronRight size={12}/><span aria-current="page">{t(section)}</span></div><h1 className="truncate text-lg font-bold leading-6">{t(section)}</h1></div><div className="ml-auto flex gap-2"><button className="button-secondary !min-h-9 !p-2" onClick={toggleTheme} aria-label={locale==="th"?"สลับธีม":"Toggle theme"}>{resolved==="dark"?<Sun size={17}/>:<Moon size={17}/>}</button><button className="button-secondary !min-h-9" onClick={()=>router.push(pathname.replace(`/${locale}`,`/${locale==="th"?"en":"th"}`)||`/${locale==="th"?"en":"th"}`)}><Languages size={16}/><span className="hidden sm:inline">{locale==="th"?"EN":"ไทย"}</span></button></div></header><div className="page-body"><FeatureView section={section} authenticated={!!user} authReady={ready}/></div>
    </main>
  </div>;
}
