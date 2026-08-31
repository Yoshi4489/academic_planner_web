"use client";

import {createContext,useContext,useEffect,useMemo,useState} from "react";

export type ThemePreference="light"|"dark"|"system";
type ResolvedTheme="light"|"dark";
type ThemeValue={preference:ThemePreference;resolved:ResolvedTheme;setTheme:(theme:ThemePreference)=>void;toggleTheme:()=>void};

const ThemeContext=createContext<ThemeValue|null>(null);

function isThemePreference(value:string|null):value is ThemePreference{return value==="light"||value==="dark"||value==="system";}
export function resolveTheme(preference:ThemePreference,prefersDark:boolean):ResolvedTheme{return preference==="system"?(prefersDark?"dark":"light"):preference;}

export function ThemeProvider({children}:{children:React.ReactNode}){
  const [preference,setPreference]=useState<ThemePreference>("system");
  const [systemDark,setSystemDark]=useState(false);
  const resolved=resolveTheme(preference,systemDark);

  useEffect(()=>{const media=window.matchMedia("(prefers-color-scheme: dark)");queueMicrotask(()=>{const stored=localStorage.getItem("theme");setPreference(isThemePreference(stored)?stored:"system");setSystemDark(media.matches);});const sync=(event:MediaQueryListEvent)=>setSystemDark(event.matches);media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync);},[]);
  useEffect(()=>{document.documentElement.dataset.theme=resolved;document.documentElement.style.colorScheme=resolved;},[resolved]);

  const value=useMemo<ThemeValue>(()=>({preference,resolved,setTheme:(theme)=>{setPreference(theme);if(theme==="system")localStorage.removeItem("theme");else localStorage.setItem("theme",theme);},toggleTheme:()=>{const next=resolved==="dark"?"light":"dark";setPreference(next);localStorage.setItem("theme",next);}}),[preference,resolved]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(){const value=useContext(ThemeContext);if(!value)throw new Error("ThemeProvider missing");return value;}
