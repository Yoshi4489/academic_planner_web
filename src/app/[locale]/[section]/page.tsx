import {notFound} from "next/navigation";
import {AppShell,type Section} from "@/components/app-shell";
const sections=new Set<Section>(["academics","goals","planner","data","account"]);
export default async function SectionPage({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.has(section as Section))notFound();return <AppShell section={section as Section}/>;}
