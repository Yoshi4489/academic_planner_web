"use client";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {NextIntlClientProvider} from "next-intl";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import {authAction,refreshSession,setAccessToken,setAuthListener} from "@/lib/api-client";
import type {User} from "@/lib/types";

type AuthValue={user:User|null;ready:boolean;login:(email:string,password:string)=>Promise<void>;register:(name:string,email:string,password:string)=>Promise<void>;logout:()=>Promise<void>};
const AuthContext=createContext<AuthValue|null>(null);
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("AuthProvider missing");return value;}

export function Providers({children,locale,messages}:{children:React.ReactNode;locale:string;messages:Record<string,unknown>}){
  const [queryClient]=useState(()=>new QueryClient({defaultOptions:{queries:{staleTime:30_000,retry:1}}}));
  const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false);
  useEffect(()=>{setAuthListener((session)=>{setUser(session?.user??null);setReady(true);if(!session)queryClient.clear();});refreshSession().catch(()=>setReady(true));return()=>setAuthListener(null);},[queryClient]);
  const value=useMemo<AuthValue>(()=>({user,ready,login:async(email,password)=>{const session=await authAction("login",{email,password});setAccessToken(session.access_token);setUser(session.user);},register:async(name,email,password)=>{const session=await authAction("register",{name,email,password});setAccessToken(session.access_token);setUser(session.user);},logout:async()=>{try{await authAction("logout");}finally{setAccessToken(null);setUser(null);queryClient.clear();}}}),[user,ready,queryClient]);
  return <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Bangkok"><QueryClientProvider client={queryClient}><AuthContext.Provider value={value}>{children}</AuthContext.Provider></QueryClientProvider></NextIntlClientProvider>;
}
