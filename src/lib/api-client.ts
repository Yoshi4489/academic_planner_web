import type {User} from "./types";

let accessToken:string|null=null;
let refreshInFlight:Promise<{access_token:string;user:User}>|null=null;
let authListener:((session:{access_token:string;user:User}|null)=>void)|null=null;

export function setAuthListener(listener:typeof authListener){authListener=listener;}
export function setAccessToken(token:string|null){accessToken=token;}

async function parse(response:Response){
  const payload=await response.json().catch(()=>({message:"Invalid server response"}));
  if(!response.ok)throw new Error(payload?.message??"Request failed");
  return payload;
}

export function authAction(action:string,body:unknown={}){
  return fetch(`/api/bff/auth/${action}`,{method:"POST",headers:{"content-type":"application/json",...(accessToken?{authorization:`Bearer ${accessToken}`}:{})},body:JSON.stringify(body)}).then(parse);
}

export async function accountAction<T=unknown>(action:string,method:"GET"|"PATCH"|"POST"|"DELETE"="GET",body?:unknown):Promise<T>{
  const send=()=>fetch(`/api/bff/auth/${action}`,{method,headers:{...(body!==undefined?{"content-type":"application/json"}:{}),...(accessToken?{authorization:`Bearer ${accessToken}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
  let response=await send();if(response.status===401){await refreshSession();response=await send();}return parse(response) as Promise<T>;
}

export function refreshSession(){
  if(refreshInFlight)return refreshInFlight;
  refreshInFlight=authAction("session").then((session)=>{setAccessToken(session.access_token);authListener?.(session);return session;}).catch((error)=>{setAccessToken(null);authListener?.(null);throw error;}).finally(()=>{refreshInFlight=null;});
  return refreshInFlight;
}

export async function apiFetch<T=unknown>(path:string,init:RequestInit={}):Promise<T>{
  const send=()=>fetch(`/api/bff/${path.replace(/^\//,"")}`,{...init,headers:{"content-type":"application/json",...init.headers,...(accessToken?{authorization:`Bearer ${accessToken}`}:{})}});
  let response=await send();
  if(response.status===401){await refreshSession();response=await send();}
  return parse(response) as Promise<T>;
}
